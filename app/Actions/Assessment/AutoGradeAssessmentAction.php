<?php

namespace App\Actions\Assessment;

use App\Models\Assessment;
use App\Models\Submission;
use App\Models\Question;
use App\Actions\Notification\CreateNotificationAction;
use Illuminate\Support\Facades\Log;

class AutoGradeAssessmentAction
{
    public function __construct(
        private CreateNotificationAction $createNotificationAction
    ) {}

    public function execute(Submission $submission): array
    {
        $assessment = $submission->assessment;
        $answers = $submission->answers ?? [];
        $totalScore = 0;
        $maxScore = 0;
        $gradingDetails = [];

        foreach ($assessment->questions as $question) {
            $questionScore = $this->gradeQuestion($question, $answers[$question->id] ?? null);
            $totalScore += $questionScore['score'];
            $maxScore += $question->points;

            // For MCQ questions, ensure correct_answer is stored as choice key for consistency
            $correctAnswer = $question->answer;
            if ($question->type === 'MCQ' && $question->choices && is_array($question->choices)) {
                // If answer is stored as choice text, convert to choice key
                if (!is_numeric($correctAnswer)) {
                    $choiceKey = array_search($correctAnswer, $question->choices);
                    if ($choiceKey !== false) {
                        $correctAnswer = (string) $choiceKey;
                    }
                }
            }

            $gradingDetails[$question->id] = [
                'question_id' => $question->id,
                'question_text' => $question->question_text,
                'user_answer' => $answers[$question->id] ?? null,
                'correct_answer' => $correctAnswer,
                'score' => $questionScore['score'],
                'max_score' => $question->points,
                'feedback' => $questionScore['feedback'],
                'is_correct' => $questionScore['is_correct'],
            ];
        }

        $percentage = $maxScore > 0 ? round(($totalScore / $maxScore) * 100, 2) : 0;

        // Update submission with grading results
        $submission->update([
            'score' => $totalScore,
            'max_score' => $maxScore,
            'percentage' => $percentage,
            'grading_details' => $gradingDetails,
            'graded_at' => now(),
        ]);

        // Send notification to student about the assessment grade
        if ($submission->user) {
            $moduleItem = \App\Models\CourseModuleItem::where('itemable_type', 'App\\Models\\Assessment')
                ->where('itemable_id', $assessment->id)
                ->first();
            
            $actionUrl = null;
            if ($moduleItem) {
                $actionUrl = "/courses/{$assessment->course_id}/modules/{$moduleItem->course_module_id}/items/{$moduleItem->id}";
            }

            // Send real-time notification for assessment auto-grading
            $percentage = $maxScore > 0 ? round(($totalScore / $maxScore) * 100, 1) : 0;
            $this->createNotificationAction->executeWithBroadcast(
                user: $submission->user,
                title: 'Assessment Graded',
                message: "Your assessment \"{$assessment->title}\" has been automatically graded. Score: {$totalScore}/{$maxScore} ({$percentage}%)",
                type: 'success',
                data: [
                    'item_title' => $assessment->title,
                    'item_type' => 'assessment',
                    'score' => (float) $totalScore,
                    'max_score' => (float) $maxScore,
                    'percentage' => $percentage,
                ],
                actionUrl: $actionUrl
            );
        }

        return [
            'total_score' => $totalScore,
            'max_score' => $maxScore,
            'percentage' => $percentage,
            'grading_details' => $gradingDetails,
        ];
    }

    private function gradeQuestion(Question $question, $userAnswer): array
    {
        $score = 0;
        $feedback = '';
        $isCorrect = false;

        switch ($question->type) {
            case 'MCQ':
                $isCorrect = $this->gradeMCQ($question, $userAnswer);
                $score = $isCorrect ? $question->points : 0;
                $feedback = $isCorrect ? 'Correct answer!' : 'Incorrect answer.';
                break;

            case 'TrueFalse':
                $isCorrect = $this->gradeTrueFalse($question, $userAnswer);
                $score = $isCorrect ? $question->points : 0;
                $feedback = $isCorrect ? 'Correct answer!' : 'Incorrect answer.';
                break;



            case 'ShortAnswer':
                $grading = $this->gradeShortAnswer($question, $userAnswer);
                $score = $grading['score'];
                $feedback = $grading['feedback'];
                $isCorrect = $score >= ($question->points * 0.8); // 80% threshold
                break;

            default:
                $feedback = 'Question type not supported for auto-grading.';
                break;
        }

        return [
            'score' => $score,
            'feedback' => $feedback,
            'is_correct' => $isCorrect,
        ];
    }

    private function gradeMCQ(Question $question, $userAnswer): bool
    {
        // Handle case where user didn't answer
        if ($userAnswer === null || $userAnswer === '') {
            return false;
        }

        $correctAnswer = $question->answer ?? '';
        
        // Convert correct answer to choice key if it's stored as choice text
        if ($question->choices && is_array($question->choices) && !is_numeric($correctAnswer)) {
            $choiceKey = array_search($correctAnswer, $question->choices);
            if ($choiceKey !== false) {
                $correctAnswer = (string) $choiceKey;
            }
        }
        
        // Direct comparison of choice keys (both user answer and correct answer are now choice keys)
        return trim($userAnswer) === trim($correctAnswer);
    }

    private function gradeTrueFalse(Question $question, $userAnswer): bool
    {
        $correctAnswer = strtolower(trim($question->answer ?? ''));
        $userAnswerNormalized = strtolower(trim($userAnswer ?? ''));

        // Handle various true/false formats
        $trueValues = ['true', 't', '1', 'yes', 'y'];
        $falseValues = ['false', 'f', '0', 'no', 'n'];

        $correctIsTrueValue = in_array($correctAnswer, $trueValues);
        $userIsTrueValue = in_array($userAnswerNormalized, $trueValues);

        return $correctIsTrueValue === $userIsTrueValue;
    }



    private function gradeShortAnswer(Question $question, $userAnswer): array
    {
        if (empty($userAnswer)) {
            return ['score' => 0, 'feedback' => 'No answer provided.'];
        }

        $correctAnswer = $question->answer ?? '';
        $userAnswerNormalized = strtolower(trim($userAnswer));
        $correctAnswerNormalized = strtolower(trim($correctAnswer));

        // Exact match
        if ($userAnswerNormalized === $correctAnswerNormalized) {
            return [
                'score' => $question->points,
                'feedback' => 'Correct answer!',
            ];
        }

        // Partial credit for similar answers
        $similarity = similar_text($userAnswerNormalized, $correctAnswerNormalized, $similarityPercentage);
        // similar_text() already calculates percentage as third parameter
        $similarityPercentage = $similarityPercentage / 100; // Convert to decimal

        if ($similarityPercentage >= 0.8) {
            $score = $question->points * 0.8;
            return [
                'score' => round($score, 2),
                'feedback' => 'Very close to the correct answer.',
            ];
        } elseif ($similarityPercentage >= 0.6) {
            $score = $question->points * 0.5;
            return [
                'score' => round($score, 2),
                'feedback' => 'Partially correct answer.',
            ];
        }

        return [
            'score' => 0,
            'feedback' => 'Incorrect answer.',
        ];
    }
}
