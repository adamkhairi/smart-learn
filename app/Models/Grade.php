<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Grade extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'grades_summary_id',
        'student_id',
        'assessment_id',
        'score',
        'max_score',
        'weight',
        'type',
        'title',
        'graded_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'score' => 'float',
            'max_score' => 'float',
            'weight' => 'float',
            'graded_at' => 'datetime',
        ];
    }

    /**
     * Get the grades summary this grade belongs to.
     */
    public function gradesSummary(): BelongsTo
    {
        return $this->belongsTo(GradesSummary::class);
    }

    /**
     * Get the student this grade belongs to.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the assessment this grade is for.
     */
    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    /**
     * Calculate the percentage score.
     */
    public function getPercentageAttribute(): float
    {
        if ($this->max_score == 0) {
            return 0;
        }

        return ($this->score / $this->max_score) * 100;
    }

    /**
     * Calculate the weighted score.
     */
    public function getWeightedScoreAttribute(): float
    {
        return ($this->score / $this->max_score) * $this->weight;
    }

    /**
     * Get the letter grade.
     */
    public function getLetterGradeAttribute(): string
    {
        $percentage = $this->percentage;

        if ($percentage < 60) return 'F';
        if ($percentage < 67) return 'D';
        if ($percentage < 76) return 'C';
        if ($percentage < 89) return 'B';
        return 'A';
    }

    /**
     * Check if grade is passing.
     */
    public function isPassing(): bool
    {
        return $this->percentage >= 60;
    }

    /**
     * Scope to get grades for a specific student.
     */
    public function scopeForStudent($query, int $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope to get grades for a specific assessment.
     */
    public function scopeForAssessment($query, int $assessmentId)
    {
        return $query->where('assessment_id', $assessmentId);
    }

    /**
     * Scope to get grades by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get passing grades.
     */
    public function scopePassing($query)
    {
        return $query->whereRaw('(score / max_score) * 100 >= 60');
    }

    /**
     * Scope to get failing grades.
     */
    public function scopeFailing($query)
    {
        return $query->whereRaw('(score / max_score) * 100 < 60');
    }
}
