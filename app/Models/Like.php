<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Like extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'likeable_id',
        'likeable_type',
    ];

    /**
     * Get the user who made this like.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the likeable model (Article, DiscussionComment, etc.).
     */
    public function likeable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope to get likes for a specific likeable model.
     */
    public function scopeForLikeable($query, string $type, int $id)
    {
        return $query->where('likeable_type', $type)
                    ->where('likeable_id', $id);
    }

    /**
     * Scope to get likes by a specific user.
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get likes for articles.
     */
    public function scopeForArticles($query)
    {
        return $query->where('likeable_type', Article::class);
    }

    /**
     * Scope to get likes for discussion comments.
     */
    public function scopeForDiscussionComments($query)
    {
        return $query->where('likeable_type', DiscussionComment::class);
    }
}
