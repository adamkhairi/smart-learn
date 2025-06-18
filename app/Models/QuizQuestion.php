<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizQuestion extends Model
{
    /** @use HasFactory<\Database\Factories\QuizQuestionFactory> */
    use HasFactory;

    const TYPE_MULTIPLE_CHOICE = 'multiple_choice';
    const TYPE_TRUE_FALSE = 'true_false';
    const TYPE_SHORT_ANSWER = 'short_answer';
    const TYPE_ESSAY = 'essay';
    const TYPE_FILL_BLANK = 'fill_blank';

    protected $fillable = [
        'quiz_id',
        'question_text',
        'question_type',
        'options',
        'correct_answer',
        'explanation',
        'points',
        'order_index',
        'is_required',
    ];

    protected $casts = [
        'options' => 'array',
        'correct_answer' => 'array',
        'points' => 'integer',
        'order_index' => 'integer',
        'is_required' => 'boolean',
    ];

    // Relationships
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    // Helper methods
    public function isMultipleChoice(): bool
    {
        return $this->question_type === self::TYPE_MULTIPLE_CHOICE;
    }

    public function isTrueFalse(): bool
    {
        return $this->question_type === self::TYPE_TRUE_FALSE;
    }

    public function isShortAnswer(): bool
    {
        return $this->question_type === self::TYPE_SHORT_ANSWER;
    }

    public function isEssay(): bool
    {
        return $this->question_type === self::TYPE_ESSAY;
    }

    public function checkAnswer($userAnswer): bool
    {
        if ($this->isMultipleChoice() || $this->isTrueFalse()) {
            return in_array($userAnswer, $this->correct_answer ?? []);
        }

        if ($this->isShortAnswer()) {
            return strtolower(trim($userAnswer)) === strtolower(trim($this->correct_answer[0] ?? ''));
        }

        // Essay questions need manual grading
        return false;
    }
}
