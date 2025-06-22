<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraphs(3, true),
            'created_by' => User::factory(),
            'image' => $this->faker->imageUrl(640, 480, 'education'),
            'background_color' => $this->faker->hexColor(),
            'status' => $this->faker->randomElement(['published', 'archived']),
            'files' => $this->faker->optional()->randomElements([
                [
                    'name' => 'syllabus.pdf',
                    'url' => $this->faker->url(),
                ],
                [
                    'name' => 'course_materials.zip',
                    'url' => $this->faker->url(),
                ],
            ]),
        ];
    }

    /**
     * Indicate that the course is published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
        ]);
    }

    /**
     * Indicate that the course is archived.
     */
    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'archived',
        ]);
    }

    /**
     * Indicate that the course is created by a specific user.
     */
    public function createdBy(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'created_by' => $user->id,
        ]);
    }
}
