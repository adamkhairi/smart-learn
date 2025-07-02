<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Bookmark>
 */
class BookmarkFactory extends Factory
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
            'bookmarkable_id' => Article::factory(),
            'bookmarkable_type' => Article::class,
        ];
    }

    /**
     * Indicate that the bookmark is for a specific bookmarkable model.
     */
    public function forBookmarkable($bookmarkable): static
    {
        return $this->state(fn (array $attributes) => [
            'bookmarkable_id' => $bookmarkable->id,
            'bookmarkable_type' => get_class($bookmarkable),
        ]);
    }

    /**
     * Indicate that the bookmark is for a specific article.
     */
    public function forArticle(Article $article): static
    {
        return $this->forBookmarkable($article);
    }

    /**
     * Indicate that the bookmark is by a specific user.
     */
    public function byUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }
}
