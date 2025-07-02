<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Bookmark extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'bookmarkable_id',
        'bookmarkable_type',
    ];

    /**
     * Get the user who made this bookmark.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the bookmarkable model (Article, Lecture, etc.).
     */
    public function bookmarkable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope to get bookmarks for a specific bookmarkable model.
     */
    public function scopeForBookmarkable($query, string $type, int $id)
    {
        return $query->where('bookmarkable_type', $type)
                    ->where('bookmarkable_id', $id);
    }

    /**
     * Scope to get bookmarks by a specific user.
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get bookmarks for articles.
     */
    public function scopeForArticles($query)
    {
        return $query->where('bookmarkable_type', Article::class);
    }

    /**
     * Scope to get bookmarks for lectures.
     */
    public function scopeForLectures($query)
    {
        return $query->where('bookmarkable_type', Lecture::class);
    }
}
