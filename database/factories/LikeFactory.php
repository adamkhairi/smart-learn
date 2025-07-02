<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\Like;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Like>
 */
class LikeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'likeable_id' => Article::factory(),
            'likeable_type' => Article::class,
        ];
    }

    /**
     * Indicate that the like is for a specific likeable model.
     */
    public function forLikeable($likeable): static
    {
        return $this->state(fn (array $attributes) => [
            'likeable_id' => $likeable->id,
            'likeable_type' => get_class($likeable),
        ]);
    }

    /**
     * Indicate that the like is for a specific article.
     */
    public function forArticle(Article $article): static
    {
        return $this->forLikeable($article);
    }

    /**
     * Indicate that the like is by a specific user.
     */
    public function byUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }
}
