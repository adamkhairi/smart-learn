<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'content',
        'user_id',
        'commentable_id',
        'commentable_type',
        'parent_id',
    ];

    /**
     * Get the user who posted the comment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent comment (if this is a reply).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    /**
     * Get the replies to this comment.
     */
    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }

    /**
     * Get the commentable model (Article, Lecture, etc.).
     */
    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get likes for this comment.
     */
    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    /**
     * Scope to get top-level comments (no parent).
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope to get comments for a specific commentable model.
     */
    public function scopeForCommentable($query, string $type, int $id)
    {
        return $query->where('commentable_type', $type)
                    ->where('commentable_id', $id);
    }

    /**
     * Scope to get comments for articles.
     */
    public function scopeForArticles($query)
    {
        return $query->where('commentable_type', Article::class);
    }

    /**
     * Scope to get comments for lectures.
     */
    public function scopeForLectures($query)
    {
        return $query->where('commentable_type', Lecture::class);
    }
}
