<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    /** @use HasFactory<\Database\Factories\GradeFactory> */
    use HasFactory;

    const TYPE_ASSIGNMENT = 'assignment';
    const TYPE_QUIZ = 'quiz';
    const TYPE_PARTICIPATION = 'participation';
    const TYPE_FINAL = 'final';

    protected $fillable = [
        'user_id',
        'course_id',
        'assignment_id',
        'quiz_id',
        'gradeable_type',
        'gradeable_id',
        'points_earned',
        'max_points',
        'percentage',
        'letter_grade',
        'feedback',
        'graded_by',
        'graded_at',
        'is_published',
        'late_penalty_applied',
        'bonus_points',
    ];

    protected $casts = [
        'points_earned' => 'decimal:2',
        'max_points' => 'decimal:2',
        'percentage' => 'decimal:2',
        'graded_at' => 'datetime',
        'is_published' => 'boolean',
        'late_penalty_applied' => 'decimal:2',
        'bonus_points' => 'decimal:2',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function gradedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    public function gradeable()
    {
        return $this->morphTo();
    }

    // Helper methods
    public function calculatePercentage(): float
    {
        if ($this->max_points <= 0) {
            return 0;
        }
        return ($this->points_earned / $this->max_points) * 100;
    }

    public function calculateLetterGrade(): string
    {
        $percentage = $this->percentage ?? $this->calculatePercentage();

        if ($percentage >= 97) return 'A+';
        if ($percentage >= 93) return 'A';
        if ($percentage >= 90) return 'A-';
        if ($percentage >= 87) return 'B+';
        if ($percentage >= 83) return 'B';
        if ($percentage >= 80) return 'B-';
        if ($percentage >= 77) return 'C+';
        if ($percentage >= 73) return 'C';
        if ($percentage >= 70) return 'C-';
        if ($percentage >= 67) return 'D+';
        if ($percentage >= 63) return 'D';
        if ($percentage >= 60) return 'D-';
        return 'F';
    }

    public function isPassing(): bool
    {
        return $this->percentage >= 60;
    }
}
