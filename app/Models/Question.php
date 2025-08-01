<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Question extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'type',
        'question_number',
        'points',
        'question_text',
        'auto_graded',
        'assessment_id',
        'assignment_id',
        'choices',
        'answer',

        'text_match',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'points' => 'integer',
            'question_number' => 'integer',
            'auto_graded' => 'boolean',
            'text_match' => 'boolean',
            'choices' => 'array',

        ];
    }

    /**
     * Get the assessment this question belongs to.
     */
    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    /**
     * Get the assignment this question belongs to.
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    /**
     * Check if question is MCQ type.
     */
    public function isMCQ(): bool
    {
        return $this->type === 'MCQ';
    }



    /**
     * Check if question is auto-graded.
     */
    public function isAutoGraded(): bool
    {
        return $this->auto_graded === true;
    }

    /**
     * Check if question uses text matching.
     */
    public function usesTextMatch(): bool
    {
        return $this->text_match === true;
    }

    /**
     * Get the correct answer for MCQ questions.
     */
    public function getCorrectAnswer(): ?string
    {
        if ($this->isMCQ()) {
            return $this->answer;
        }
        return null;
    }



    /**
     * Get choices for MCQ questions.
     */
    public function getChoices(): array
    {
        if ($this->isMCQ() && $this->choices) {
            return $this->choices;
        }
        return [];
    }

    /**
     * Scope to get MCQ questions.
     */
    public function scopeMCQ($query)
    {
        return $query->where('type', 'MCQ');
    }



    /**
     * Scope to get auto-graded questions.
     */
    public function scopeAutoGraded($query)
    {
        return $query->where('auto_graded', true);
    }

    /**
     * Scope to get questions for a specific assessment.
     */
    public function scopeForAssessment($query, int $assessmentId)
    {
        return $query->where('assessment_id', $assessmentId);
    }

    /**
     * Scope to get questions for a specific assignment.
     */
    public function scopeForAssignment($query, int $assignmentId)
    {
        return $query->where('assignment_id', $assignmentId);
    }

    /**
     * Scope to order by question number.
     */
    public function scopeOrderByNumber($query)
    {
        return $query->orderBy('question_number');
    }
}
