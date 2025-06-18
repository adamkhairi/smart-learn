<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    /** @use HasFactory<\Database\Factories\QuizFactory> */
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'instructions',
        'time_limit_minutes',
        'max_attempts',
        'available_from',
        'available_until',
        'is_published',
        'shuffle_questions',
        'show_results_immediately',
        'allow_review',
        'passing_score',
        'max_points',
    ];

    protected $casts = [
        'available_from' => 'datetime',
        'available_until' => 'datetime',
        'is_published' => 'boolean',
        'shuffle_questions' => 'boolean',
        'show_results_immediately' => 'boolean',
        'allow_review' => 'boolean',
        'time_limit_minutes' => 'integer',
        'max_attempts' => 'integer',
        'passing_score' => 'decimal:2',
        'max_points' => 'integer',
    ];

    // Relationships
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    // Helper methods
    public function isAvailable(): bool
    {
        $now = now();
        return $this->is_published &&
               (!$this->available_from || $now >= $this->available_from) &&
               (!$this->available_until || $now <= $this->available_until);
    }

    public function getAttemptFor(User $user): ?QuizAttempt
    {
        return $this->attempts()->where('user_id', $user->id)->latest()->first();
    }

    public function getTotalQuestions(): int
    {
        return $this->questions()->count();
    }

    public function calculateMaxPoints(): int
    {
        return $this->questions()->sum('points');
    }
}
