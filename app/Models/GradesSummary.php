<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GradesSummary extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'course_id',
        'student_grades',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'student_grades' => 'array',
        ];
    }

    /**
     * Get the course this grades summary belongs to.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get individual grade records.
     */
    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    /**
     * Update or create grade for a student.
     */
    public static function updateOrCreateGrade(
        int $courseId,
        int $studentId,
        int $assessmentId,
        Assessment $assessment,
        float $score
    ): self {
        $gradesSummary = self::firstOrCreate(['course_id' => $courseId]);

        Grade::updateOrCreate(
            [
                'grades_summary_id' => $gradesSummary->id,
                'student_id' => $studentId,
                'assessment_id' => $assessmentId,
            ],
            [
                'score' => $score,
                'max_score' => $assessment->max_score,
                'weight' => $assessment->weight,
                'type' => $assessment->type,
                'title' => $assessment->title,
                'graded_at' => now(),
            ]
        );

        return $gradesSummary;
    }

    /**
     * Get grades by user for this course.
     */
    public function getGradesByUser(): array
    {
        return $this->grades()
                   ->with(['student', 'assessment'])
                   ->get()
                   ->groupBy('student_id')
                   ->map(function ($studentGrades) {
                       $student = $studentGrades->first()->student;
                       $grades = $studentGrades->toArray();

                       return [
                           'student' => $student,
                           'grades' => $grades,
                           'total_score' => $this->calculateTotalScore($grades),
                           'exams_score' => $this->calculateExamsScore($grades),
                           'assignments_score' => $this->calculateAssignmentsScore($grades),
                           'grade_letter' => $this->calculateGradeLetter($grades),
                       ];
                   })
                   ->values()
                   ->toArray();
    }

    /**
     * Calculate total score percentage.
     */
    private function calculateTotalScore(array $grades): string
    {
        $sum = 0;
        foreach ($grades as $grade) {
            if ($grade['score'] && $grade['max_score']) {
                $sum += ($grade['score'] / $grade['max_score']) * $grade['weight'];
            }
        }
        return round($sum * 100) . '%';
    }

    /**
     * Calculate exams score percentage.
     */
    private function calculateExamsScore(array $grades): string
    {
        $sum = 0;
        foreach ($grades as $grade) {
            if ($grade['type'] === 'Exam') {
                $sum += ($grade['score'] / $grade['max_score']) * $grade['weight'];
            }
        }
        return round($sum * 100) . '%';
    }

    /**
     * Calculate assignments score percentage.
     */
    private function calculateAssignmentsScore(array $grades): string
    {
        $sum = 0;
        foreach ($grades as $grade) {
            if ($grade['type'] === 'Assignment') {
                $sum += ($grade['score'] / $grade['max_score']) * $grade['weight'];
            }
        }
        return round($sum * 100) . '%';
    }

    /**
     * Calculate grade letter.
     */
    private function calculateGradeLetter(array $grades): string
    {
        $totalScore = (float) str_replace('%', '', $this->calculateTotalScore($grades));

        if ($totalScore < 60) return 'F';
        if ($totalScore < 67) return 'D';
        if ($totalScore < 76) return 'C';
        if ($totalScore < 89) return 'B';
        return 'A';
    }

    /**
     * Scope to get grades summary for a specific course.
     */
    public function scopeForCourse($query, int $courseId)
    {
        return $query->where('course_id', $courseId);
    }
}
