<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Article>
 */
class ArticleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(),
            'text' => $this->faker->paragraphs(5, true),
            'lang' => $this->faker->randomElement(['en', 'fr', 'sp', 'ar']),
            'content_type' => $this->faker->randomElement(['html', 'markdown', 'text']),
            'url' => $this->faker->optional()->url(),
            'content_id' => $this->faker->numberBetween(1000, 9999),
            'created_by' => User::factory(),
        ];
    }

    /**
     * Indicate that the article is in English.
     */
    public function english(): static
    {
        return $this->state(fn (array $attributes) => [
            'lang' => 'en',
        ]);
    }

    /**
     * Indicate that the article is in HTML format.
     */
    public function html(): static
    {
        return $this->state(fn (array $attributes) => [
            'content_type' => 'html',
        ]);
    }

    /**
     * Indicate that the article is created by a specific user.
     */
    public function createdBy(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'created_by' => $user->id,
        ]);
    }

    /**
     * Indicate that the article has a specific content ID.
     */
    public function withContentId(int $contentId): static
    {
        return $this->state(fn (array $attributes) => [
            'content_id' => $contentId,
        ]);
    }
}
