<?php

namespace Database\Factories;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Assessment>
 */
class AssessmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => $this->faker->randomElement(['Exam', 'Assignment']),
            'title' => $this->faker->words(4, true),
            'max_score' => $this->faker->numberBetween(50, 100),
            'weight' => $this->faker->numberBetween(1, 5),
            'questions_type' => $this->faker->randomElement(['online', 'file']),
            'submission_type' => $this->faker->randomElement(['online', 'written']),
            'visibility' => $this->faker->randomElement(['published', 'unpublished']),
            'course_id' => Course::factory(),
            'created_by' => User::factory(),
            'files' => $this->faker->optional()->randomElements([
                [
                    'name' => 'assessment_instructions.pdf',
                    'url' => $this->faker->url(),
                ],
                [
                    'name' => 'reference_materials.zip',
                    'url' => $this->faker->url(),
                ],
            ]),
        ];
    }

    /**
     * Indicate that the assessment is an exam.
     */
    public function exam(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'Exam',
        ]);
    }

    /**
     * Indicate that the assessment is an assignment.
     */
    public function assignment(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'Assignment',
        ]);
    }

    /**
     * Indicate that the assessment is published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'visibility' => 'published',
        ]);
    }

    /**
     * Indicate that the assessment is online.
     */
    public function online(): static
    {
        return $this->state(fn (array $attributes) => [
            'questions_type' => 'online',
            'submission_type' => 'online',
        ]);
    }

    /**
     * Indicate that the assessment belongs to a specific course.
     */
    public function forCourse(Course $course): static
    {
        return $this->state(fn (array $attributes) => [
            'course_id' => $course->id,
        ]);
    }
}
