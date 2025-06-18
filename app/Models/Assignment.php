<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assignment extends Model
{
    /** @use HasFactory<\Database\Factories\AssignmentFactory> */
    use HasFactory;

    const TYPE_ESSAY = 'essay';
    const TYPE_FILE_UPLOAD = 'file_upload';
    const TYPE_TEXT = 'text';
    const TYPE_URL = 'url';

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'instructions',
        'type',
        'max_points',
        'due_date',
        'available_from',
        'available_until',
        'is_published',
        'allow_late_submission',
        'late_penalty_percentage',
        'max_file_size_mb',
        'allowed_file_types',
        'max_attempts',
        'show_grades_immediately',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'available_from' => 'datetime',
        'available_until' => 'datetime',
        'is_published' => 'boolean',
        'allow_late_submission' => 'boolean',
        'late_penalty_percentage' => 'decimal:2',
        'max_file_size_mb' => 'integer',
        'allowed_file_types' => 'array',
        'max_attempts' => 'integer',
        'show_grades_immediately' => 'boolean',
    ];

    // Relationships
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(AssignmentSubmission::class);
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

    public function isOverdue(): bool
    {
        return $this->due_date && now() > $this->due_date;
    }

    public function getDaysUntilDue(): int
    {
        if (!$this->due_date) {
            return 0;
        }
        return now()->diffInDays($this->due_date, false);
    }

    public function getSubmissionFor(User $user): ?AssignmentSubmission
    {
        return $this->submissions()->where('user_id', $user->id)->latest()->first();
    }
}
