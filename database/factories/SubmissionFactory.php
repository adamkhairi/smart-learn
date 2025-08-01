<?php

namespace Database\Factories;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Submission>
 */
class SubmissionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'assessment_id' => Assessment::factory(),
            'user_id' => User::factory(),
            'files' => $this->faker->optional()->randomElements([
                [
                    'name' => 'submission.pdf',
                    'url' => $this->faker->url(),
                ],
                [
                    'name' => 'assignment.docx',
                    'url' => $this->faker->url(),
                ],
            ]),
            'plagiarism_status' => $this->faker->randomElement(['processing', 'unCalculated', 'none', 'med', 'high', 'veryHigh']),
            'auto_grading_status' => $this->faker->randomElement(['processing', 'unGraded', 'Graded']),
            'finished' => $this->faker->boolean(80),
            'score' => $this->faker->optional()->randomFloat(2, 0, 100),
            'graded_at' => $this->faker->optional()->dateTimeBetween('-1 month', 'now'),
            'graded_by' => $this->faker->optional()->numberBetween(1, 10),
            'submitted_at' => $this->faker->optional()->dateTimeBetween('-2 months', 'now'),
            'number_of_exam_joins' => $this->faker->numberBetween(0, 3),
            'answers' => $this->faker->optional()->randomElements([
                '1' => 'Sample answer for question 1',
                '2' => 'A',
            ]),
        ];
    }

    /**
     * Indicate that the submission is graded.
     */
    public function graded(): static
    {
        return $this->state(fn (array $attributes) => [
            'auto_grading_status' => 'Graded',
            'score' => $this->faker->randomFloat(2, 50, 100),
            'graded_at' => now(),
            'graded_by' => User::factory(),
        ]);
    }

    /**
     * Indicate that the submission is finished.
     */
    public function finished(): static
    {
        return $this->state(fn (array $attributes) => [
            'finished' => true,
            'submitted_at' => now(),
        ]);
    }

    /**
     * Indicate that the submission is for a specific course and assessment.
     */
    public function forCourseAndAssessment(Course $course, Assessment $assessment): static
    {
        return $this->state(fn (array $attributes) => [
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
        ]);
    }
}
