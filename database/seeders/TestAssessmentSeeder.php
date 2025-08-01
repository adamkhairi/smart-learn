<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\CourseModuleItem;
use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestAssessmentSeeder extends Seeder
{
    public function run(): void
    {
        // Get or create a test course
        $course = Course::firstOrCreate([
            'name' => 'Test Course for Assessment',
        ], [
            'description' => 'A test course for assessment functionality',
            'created_by' => User::where('role', 'instructor')->first()->id ?? 1,
            'status' => 'published',
        ]);

        // Get or create a test module
        $module = CourseModule::firstOrCreate([
            'course_id' => $course->id,
            'title' => 'Test Module',
        ], [
            'description' => 'A test module for assessment',
            'order' => 1,
            'is_published' => true,
        ]);

        // Create a test assessment
        $assessment = Assessment::create([
            'course_id' => $course->id,
            'title' => 'Sample Assessment',
            'type' => 'Quiz',
            'max_score' => 100,
            'weight' => 20,
            'questions_type' => 'online',
            'submission_type' => 'online',
            'visibility' => 'published',
            'time_limit' => 30, // 30 minutes
            'randomize_questions' => false,
            'show_results' => true,
            'available_from' => now(),
            'available_until' => now()->addDays(30),
            'created_by' => User::where('role', 'instructor')->first()->id ?? 1,
        ]);

        // Create questions
        $questions = [
            [
                'question_number' => 1,
                'type' => 'MCQ',
                'question_text' => 'What is the capital of France?',
                'points' => 25,
                'choices' => ['A' => 'London', 'B' => 'Paris', 'C' => 'Berlin', 'D' => 'Madrid'],
                'answer' => 'B',
                'auto_graded' => true,
            ],
            [
                'question_number' => 2,
                'type' => 'TrueFalse',
                'question_text' => 'The Earth is round.',
                'points' => 25,
                'answer' => 'true',
                'auto_graded' => true,
            ],

        ];

        foreach ($questions as $questionData) {
            Question::create([
                'assessment_id' => $assessment->id,
                'question_number' => $questionData['question_number'],
                'type' => $questionData['type'],
                'question_text' => $questionData['question_text'],
                'points' => $questionData['points'],
                'choices' => $questionData['choices'] ?? null,
                'answer' => $questionData['answer'] ?? null,
                'keywords' => $questionData['keywords'] ?? null,
                'auto_graded' => $questionData['auto_graded'],
            ]);
        }

        // Create module item for the assessment
        CourseModuleItem::create([
            'course_module_id' => $module->id,
            'title' => 'Sample Assessment',
            'description' => 'A test assessment with multiple question types',
            'itemable_id' => $assessment->id,
            'itemable_type' => Assessment::class,
            'order' => 1,
            'is_required' => true,
            'status' => 'published',
        ]);

        $this->command->info('Test assessment created successfully!');
        $this->command->info("Course ID: {$course->id}");
        $this->command->info("Assessment ID: {$assessment->id}");
    }
}
