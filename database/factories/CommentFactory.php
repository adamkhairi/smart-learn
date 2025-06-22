<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Comment>
 */
class CommentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content' => $this->faker->paragraphs(2, true),
            'user_id' => User::factory(),
            'article_id' => Article::factory(),
            'parent_id' => null,
        ];
    }

    /**
     * Indicate that the comment is for a specific article.
     */
    public function forArticle(Article $article): static
    {
        return $this->state(fn (array $attributes) => [
            'article_id' => $article->id,
        ]);
    }

    /**
     * Indicate that the comment is by a specific user.
     */
    public function byUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Indicate that the comment is a reply to another comment.
     */
    public function replyTo(Comment $comment): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => $comment->id,
            'article_id' => $comment->article_id,
        ]);
    }
}
