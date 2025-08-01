<?php

namespace Database\Factories;

use App\Models\Assessment;
use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Question>
 */
class QuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => 'MCQ',
            'question_number' => $this->faker->numberBetween(1, 20),
            'points' => $this->faker->numberBetween(5, 20),
            'question_text' => $this->faker->sentence() . '?',
            'auto_graded' => false,
            'assessment_id' => Assessment::factory(),
            'choices' => null,
            'answer' => null,

            'text_match' => false,
        ];
    }

    /**
     * Indicate that the question is MCQ type.
     */
    public function mcq(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'MCQ',
            'auto_graded' => true,
            'choices' => [
                'A' => 'Option A',
                'B' => 'Option B',
                'C' => 'Option C',
                'D' => 'Option D',
            ],
            'answer' => 'A',
        ]);
    }



    /**
     * Indicate that the question belongs to a specific assessment.
     */
    public function forAssessment(Assessment $assessment): static
    {
        return $this->state(fn (array $attributes) => [
            'assessment_id' => $assessment->id,
        ]);
    }
}
