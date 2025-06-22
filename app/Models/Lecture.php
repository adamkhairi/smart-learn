<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lecture extends Model
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
        'video_url',
        'duration',
        'course_id',
        'course_module_id',
        'order',
        'is_published',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duration' => 'integer',
            'order' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    /**
     * Get the course this lecture belongs to.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the course module this lecture belongs to.
     */
    public function courseModule(): BelongsTo
    {
        return $this->belongsTo(CourseModule::class);
    }

    /**
     * Get the comments for this lecture.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(LectureComment::class);
    }

    /**
     * Check if lecture is published.
     */
    public function isPublished(): bool
    {
        return $this->is_published === true;
    }

    /**
     * Get YouTube video ID if it's a YouTube video.
     */
    public function getYouTubeVideoId(): ?string
    {
        if (str_contains($this->video_url, 'youtu')) {
            preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/', $this->video_url, $matches);
            return $matches[1] ?? null;
        }

        return null;
    }

    /**
     * Get formatted duration.
     */
    public function getFormattedDurationAttribute(): string
    {
        if (!$this->duration) {
            return '0:00';
        }

        $minutes = floor($this->duration / 60);
        $seconds = $this->duration % 60;

        return sprintf('%d:%02d', $minutes, $seconds);
    }

    /**
     * Scope to get published lectures.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope to get lectures for a specific course.
     */
    public function scopeForCourse($query, int $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    /**
     * Scope to get lectures for a specific module.
     */
    public function scopeForModule($query, int $moduleId)
    {
        return $query->where('course_module_id', $moduleId);
    }

    /**
     * Scope to order by lecture order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}
