<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Submission extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'course_id',
        'assessment_id',
        'assignment_id',
        'user_id',
        'files',
        'plagiarism_status',
        'auto_grading_status',
        'finished',
        'score',
        'graded_at',
        'graded_by',
        'submitted_at',
        'number_of_exam_joins',
        'answers',
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
            'answers' => 'array',
            'finished' => 'boolean',
            'score' => 'float',
            'graded_at' => 'datetime',
            'submitted_at' => 'datetime',
            'number_of_exam_joins' => 'integer',
        ];
    }

    /**
     * Get the course this submission belongs to.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the assessment this submission belongs to.
     */
    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    /**
     * Get the assignment this submission belongs to.
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    /**
     * Get the user who made this submission.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who graded this submission.
     */
    public function grader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    /**
     * Check if submission is finished.
     */
    public function isFinished(): bool
    {
        return $this->finished === true;
    }

    /**
     * Check if submission is graded.
     */
    public function isGraded(): bool
    {
        return $this->auto_grading_status === 'Graded';
    }

    /**
     * Check if submission is processing.
     */
    public function isProcessing(): bool
    {
        return $this->auto_grading_status === 'processing';
    }

    /**
     * Check if submission is ungraded.
     */
    public function isUngraded(): bool
    {
        return $this->auto_grading_status === 'unGraded';
    }

    /**
     * Get plagiarism status color class.
     */
    public function getPlagiarismStatusClass(): string
    {
        return match($this->plagiarism_status) {
            'none' => 'success',
            'med' => 'warning',
            'high', 'veryHigh' => 'danger',
            default => 'secondary'
        };
    }

    /**
     * Check if submission was on time.
     */
    public function isOnTime(): bool
    {
        if (!$this->submitted_at || !$this->assignment) {
            return true;
        }

        return $this->submitted_at <= $this->assignment->expired_at;
    }

    /**
     * Check if submission was late.
     */
    public function isLate(): bool
    {
        return !$this->isOnTime();
    }

    /**
     * Get the late duration in minutes.
     */
    public function getLateDurationMinutes(): int
    {
        if (!$this->isLate()) {
            return 0;
        }

        return $this->submitted_at->diffInMinutes($this->assignment->expired_at);
    }

    /**
     * Scope to get submissions for a specific course.
     */
    public function scopeForCourse($query, int $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    /**
     * Scope to get submissions for a specific assessment.
     */
    public function scopeForAssessment($query, int $assessmentId)
    {
        return $query->where('assessment_id', $assessmentId);
    }

    /**
     * Scope to get submissions for a specific assignment.
     */
    public function scopeForAssignment($query, int $assignmentId)
    {
        return $query->where('assignment_id', $assignmentId);
    }

    /**
     * Scope to get submissions by a specific user.
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get graded submissions.
     */
    public function scopeGraded($query)
    {
        return $query->where('auto_grading_status', 'Graded');
    }

    /**
     * Scope to get ungraded submissions.
     */
    public function scopeUngraded($query)
    {
        return $query->where('auto_grading_status', 'unGraded');
    }

    /**
     * Scope to get finished submissions.
     */
    public function scopeFinished($query)
    {
        return $query->where('finished', true);
    }
}
