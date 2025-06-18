<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAttempt extends Model
{
    /** @use HasFactory<\Database\Factories\QuizAttemptFactory> */
    use HasFactory;

    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_TIMED_OUT = 'timed_out';
    const STATUS_SUBMITTED = 'submitted';

    protected $fillable = [
        'quiz_id',
        'user_id',
        'attempt_number',
        'answers',
        'score',
        'max_score',
        'percentage',
        'status',
        'started_at',
        'completed_at',
        'time_taken_minutes',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'answers' => 'array',
        'score' => 'decimal:2',
        'max_score' => 'decimal:2',
        'percentage' => 'decimal:2',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'attempt_number' => 'integer',
        'time_taken_minutes' => 'integer',
    ];

    // Relationships
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Helper methods
    public function isInProgress(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isTimedOut(): bool
    {
        return $this->status === self::STATUS_TIMED_OUT;
    }

    public function isPassed(): bool
    {
        if (!$this->quiz->passing_score) {
            return true;
        }
        return $this->percentage >= $this->quiz->passing_score;
    }

    public function complete(): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'completed_at' => now(),
            'time_taken_minutes' => $this->started_at->diffInMinutes(now()),
        ]);
    }

    public function calculateScore(): void
    {
        $totalScore = 0;
        $maxScore = 0;

        foreach ($this->quiz->questions as $question) {
            $maxScore += $question->points;
            $userAnswer = $this->answers[$question->id] ?? null;

            if ($question->checkAnswer($userAnswer)) {
                $totalScore += $question->points;
            }
        }

        $percentage = $maxScore > 0 ? ($totalScore / $maxScore) * 100 : 0;

        $this->update([
            'score' => $totalScore,
            'max_score' => $maxScore,
            'percentage' => $percentage,
        ]);
    }
}
