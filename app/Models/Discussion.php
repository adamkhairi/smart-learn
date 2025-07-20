<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Discussion extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'content',
        'course_id',
        'created_by',
        'is_pinned',
        'is_locked',
        'views_count',
    ];

    protected function casts(): array
    {
        return [
            'is_pinned' => 'boolean',
            'is_locked' => 'boolean',
            'views_count' => 'integer',
        ];
    }

    /**
     * Get the course that owns the discussion.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    /**
     * Get the user who created the discussion.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the comments for the discussion.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'commentable_id')
                    ->where('commentable_type', self::class);
    }

    /**
     * Check if discussion is pinned.
     */
    public function isPinned(): bool
    {
        return $this->is_pinned === true;
    }

    /**
     * Check if discussion is locked.
     */
    public function isLocked(): bool
    {
        return $this->is_locked === true;
    }

    /**
     * Get the count of comments for this discussion.
     */
    public function commentsCount(): int
    {
        return $this->comments()->count();
    }

    /**
     * Get the latest comment for this discussion.
     */
    public function latestComment()
    {
        return $this->comments()->latest()->first();
    }

    /**
     * Scope to get pinned discussions.
     */
    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    /**
     * Scope to get locked discussions.
     */
    public function scopeLocked($query)
    {
        return $query->where('is_locked', true);
    }

    /**
     * Scope to get unlocked discussions.
     */
    public function scopeUnlocked($query)
    {
        return $query->where('is_locked', false);
    }

    /**
     * Scope to get discussions for a specific discussionable model.
     */
    public function scopeForDiscussionable($query, string $type, int $id)
    {
        return $query->where('discussionable_type', $type)
                     ->where('discussionable_id', $id);
    }

    /**
     * Scope to get discussions created by a specific user.
     */
    public function scopeByCreator($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
