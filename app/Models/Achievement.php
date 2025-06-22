<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Achievement extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'badge_icon',
        'points',
        'user_id',
        'course_id',
        'earned_at',
        'type',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'points' => 'integer',
            'earned_at' => 'datetime',
        ];
    }

    /**
     * Get the user who earned this achievement.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the course this achievement is related to.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Check if achievement is earned.
     */
    public function isEarned(): bool
    {
        return !is_null($this->earned_at);
    }

    /**
     * Scope to get earned achievements.
     */
    public function scopeEarned($query)
    {
        return $query->whereNotNull('earned_at');
    }

    /**
     * Scope to get achievements for a specific user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get achievements for a specific course.
     */
    public function scopeForCourse($query, int $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    /**
     * Scope to get achievements by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get recent achievements.
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('earned_at', '>=', now()->subDays($days));
    }
}
