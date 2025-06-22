<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Exam extends Assessment
{
    use HasFactory;

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
        'open_at',
        'close_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            ...parent::casts(),
            'open_at' => 'datetime',
            'close_at' => 'datetime',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($exam) {
            $exam->type = 'Exam';
        });
    }

    /**
     * Get the time limit in seconds.
     */
    public function getTimeLimitAttribute(): int
    {
        if (!$this->open_at || !$this->close_at) {
            return 0;
        }

        return $this->close_at->diffInSeconds($this->open_at);
    }

    /**
     * Get the remaining time in seconds.
     */
    public function getRemainingTimeAttribute(): int
    {
        if (!$this->close_at) {
            return 0;
        }

        $now = Carbon::now();
        if ($now->gt($this->close_at)) {
            return 0;
        }

        return $now->diffInSeconds($this->close_at);
    }

    /**
     * Get the exam status.
     */
    public function getStatusAttribute(): array
    {
        $now = Carbon::now();

        if ($this->open_at && $now->lt($this->open_at)) {
            return [
                'code' => 'willOpen',
                'message' => 'Exam will open at ' . $this->open_at->format('F j, Y, g:i a')
            ];
        } elseif ($this->close_at && $this->close_at->lt($now)) {
            return [
                'code' => 'closed',
                'message' => 'Exam closed at ' . $this->close_at->format('F j, Y, g:i a')
            ];
        } elseif ($this->close_at && $now->lt($this->close_at)) {
            return [
                'code' => 'open',
                'message' => 'Exam will close at ' . $this->close_at->format('F j, Y, g:i a')
            ];
        }

        return [
            'code' => 'open',
            'message' => 'Exam is open'
        ];
    }

    /**
     * Check if exam is open.
     */
    public function isOpen(): bool
    {
        $now = Carbon::now();

        $afterOpenTime = !$this->open_at || $now->gte($this->open_at);
        $beforeCloseTime = !$this->close_at || $now->lt($this->close_at);

        return $afterOpenTime && $beforeCloseTime;
    }

    /**
     * Check if exam will open.
     */
    public function willOpen(): bool
    {
        return $this->open_at && Carbon::now()->lt($this->open_at);
    }

    /**
     * Check if exam is closed.
     */
    public function isClosed(): bool
    {
        return $this->close_at && Carbon::now()->gte($this->close_at);
    }

    /**
     * Scope to get open exams.
     */
    public function scopeOpen($query)
    {
        $now = Carbon::now();
        return $query->where(function ($q) use ($now) {
            $q->where('open_at', '<=', $now)
              ->orWhereNull('open_at');
        })->where(function ($q) use ($now) {
            $q->where('close_at', '>', $now)
              ->orWhereNull('close_at');
        });
    }

    /**
     * Scope to get closed exams.
     */
    public function scopeClosed($query)
    {
        return $query->where('close_at', '<', Carbon::now());
    }

    /**
     * Scope to get upcoming exams.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('open_at', '>', Carbon::now());
    }
}
