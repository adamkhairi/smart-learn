<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Assessment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'type',
        'title',
        'max_score',
        'weight',
        'questions_type',
        'submission_type',
        'visibility',
        'course_id',
        'created_by',
        'files',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'files' => 'array',
            'max_score' => 'integer',
            'weight' => 'integer',
        ];
    }

    /**
     * Get the user who created this assessment.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the course this assessment belongs to.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the questions for this assessment.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    /**
     * Get the submissions for this assessment.
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    /**
     * Check if assessment is published.
     */
    public function isPublished(): bool
    {
        return $this->visibility === 'published';
    }

    /**
     * Check if assessment is unpublished.
     */
    public function isUnpublished(): bool
    {
        return $this->visibility === 'unpublished';
    }

    /**
     * Scope to get published assessments.
     */
    public function scopePublished($query)
    {
        return $query->where('visibility', 'published');
    }

    /**
     * Scope to get unpublished assessments.
     */
    public function scopeUnpublished($query)
    {
        return $query->where('visibility', 'unpublished');
    }

    /**
     * Scope to get assessments by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get assessments for a specific course.
     */
    public function scopeForCourse($query, int $courseId)
    {
        return $query->where('course_id', $courseId);
    }
}
