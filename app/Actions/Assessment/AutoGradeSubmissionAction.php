<?php

namespace App\Actions\Assessment;

use App\Models\Assessment;
use App\Models\Submission;
use Illuminate\Support\Facades\Log;

class AutoGradeSubmissionAction
{
    public function execute(Submission $submission): void
    {
        $assessment = $submission->assessment;
        $answers = $submission->answers ?? [];
        $totalScore = 0;
        $maxScore = 0;

        foreach ($assessment->questions as $question) {
            $maxScore += $question->points;

            if ($question->auto_graded && isset($answers[$question->id])) {
                $userAnswer = $answers[$question->id];

                switch ($question->type) {
                    case 'MCQ':
                    case 'TrueFalse':
                        $userSelectedAnswerText = $question->choices[$userAnswer] ?? null;
                        $correctAnswerText = $question->answer;

                        $normalizedUserAnswerText = preg_replace('/[^a-z0-9\s]/i', '', strtolower(trim($userSelectedAnswerText)));
                        $normalizedCorrectAnswerText = preg_replace('/[^a-z0-9\s]/i', '', strtolower(trim($correctAnswerText)));

                        Log::debug('Grading MCQ/TrueFalse question - Detailed', [
                            'question_id' => $question->id,
                            'submitted_key_or_index' => $userAnswer,
                            'user_selected_text' => $userSelectedAnswerText,
                            'correct_answer_from_db' => $correctAnswerText,
                            'normalized_user_text' => $normalizedUserAnswerText,
                            'normalized_correct_text' => $normalizedCorrectAnswerText,
                            'match' => ($normalizedUserAnswerText === $normalizedCorrectAnswerText),
                            'question_points' => $question->points,
                        ]);

                        if ($normalizedUserAnswerText === $normalizedCorrectAnswerText) {
                            $totalScore += $question->points;
                        }
                        break;

                    case 'Essay':
                        if ($question->usesTextMatch() && $question->keywords) {
                            $keywords = $question->keywords;
                            $answerText = strtolower($userAnswer);
                            $matchedKeywords = 0;

                            foreach ($keywords as $keyword) {
                                if (str_contains($answerText, strtolower($keyword))) {
                                    $matchedKeywords++;
                                }
                            }

                            $matchPercentage = count($keywords) > 0 ? $matchedKeywords / count($keywords) : 0;
                            $pointsAwarded = $question->points * $matchPercentage;
                            $totalScore += $pointsAwarded;

                            Log::debug('Grading Essay question - Detailed', [
                                'question_id' => $question->id,
                                'user_answer' => $userAnswer,
                                'defined_keywords' => $keywords,
                                'matched_keywords_count' => $matchedKeywords,
                                'total_keywords_count' => count($keywords),
                                'match_percentage' => $matchPercentage,
                                'points_for_question' => $question->points,
                                'points_awarded' => $pointsAwarded,
                            ]);
                        }
                        break;
                }
            }
        }

        Log::debug('Final auto-grade score before update', [
            'submission_id' => $submission->id,
            'calculated_score' => $totalScore,
            'max_score' => $maxScore,
        ]);

        $submission->update([
            'score' => $totalScore,
            'auto_grading_status' => 'Graded',
            'graded_at' => now(),
        ]);
    }
} 