<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Assignment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'assignment_type',
        'title',
        'description',
        'content_json',
        'content_html',
        'instructions',
        'rubric',
        'total_points',
        'status',
        'visibility',
        'started_at',
        'expired_at',
        'course_id',
        'created_by',
        'questions',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'expired_at' => 'datetime',
            'total_points' => 'integer',
            'visibility' => 'boolean',
            'questions' => 'array',
            'content_json' => 'json',
            'instructions' => 'json',
            'rubric' => 'json',
        ];
    }

    /**
     * Add appends for React component compatibility.
     */
    protected $appends = ['points', 'due_date'];

    /**
     * Get points (alias for total_points).
     */
    public function getPointsAttribute(): int
    {
        return $this->total_points;
    }

    /**
     * Get due_date (alias for expired_at).
     */
    public function getDueDateAttribute()
    {
        return $this->expired_at;
    }

    /**
     * Get the user who created this assignment.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the course this assignment belongs to.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the submissions for this assignment.
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    /**
     * Get the questions for this assignment.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    /**
     * Get likes for this assignment.
     */
    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    /**
     * Get bookmarks for this assignment.
     */
    public function bookmarks()
    {
        return $this->morphMany(Bookmark::class, 'bookmarkable');
    }

    /**
     * Get comments for this assignment.
     */
    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    /**
     * Get the course module item this assignment belongs to.
     */
    public function moduleItem()
    {
        return $this->morphOne(CourseModuleItem::class, 'itemable');
    }

    /**
     * Get the assignment status based on current time.
     */
    public function getStatusAttribute(): string
    {
        $now = Carbon::now();

        if ($now->lt($this->started_at)) {
            return 'coming-soon';
        } elseif ($now->gt($this->expired_at)) {
            return 'ended';
        } else {
            return 'open';
        }
    }

    /**
     * Check if assignment is open for submissions.
     */
    public function isOpen(): bool
    {
        return $this->getStatusAttribute() === 'open';
    }

    /**
     * Check if assignment is ended.
     */
    public function isEnded(): bool
    {
        return $this->getStatusAttribute() === 'ended';
    }

    /**
     * Check if assignment is coming soon.
     */
    public function isComingSoon(): bool
    {
        return $this->getStatusAttribute() === 'coming-soon';
    }

    /**
     * Check if assignment is visible.
     */
    public function isVisible(): bool
    {
        return $this->visibility === true;
    }

    /**
     * Scope to get open assignments.
     */
    public function scopeOpen($query)
    {
        $now = Carbon::now();
        return $query->where('started_at', '<=', $now)
                    ->where('expired_at', '>', $now);
    }

    /**
     * Scope to get ended assignments.
     */
    public function scopeEnded($query)
    {
        return $query->where('expired_at', '<', Carbon::now());
    }

    /**
     * Scope to get coming soon assignments.
     */
    public function scopeComingSoon($query)
    {
        return $query->where('started_at', '>', Carbon::now());
    }

    /**
     * Scope to get visible assignments.
     */
    public function scopeVisible($query)
    {
        return $query->where('visibility', true);
    }

    /**
     * Scope to get assignments for a specific course.
     */
    public function scopeForCourse($query, int $courseId)
    {
        return $query->where('course_id', $courseId);
    }
}
