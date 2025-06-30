<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Course extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'created_by',
        'image',
        'background_color',
        'status',
        'files',
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
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($course) {
            if (empty($course->background_color)) {
                $course->background_color = '#' . str_pad(dechex(mt_rand(0, 0xFFFFFF)), 6, '0', STR_PAD_LEFT);
            }
        });
    }

    /**
     * Get the user who created this course.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the users enrolled in this course.
     */
    public function enrolledUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_user_enrollments')
                    ->withPivot('enrolled_as', 'created_at')
                    ->withTimestamps();
    }

    /**
     * Get the course modules.
     */
    public function modules(): HasMany
    {
        return $this->hasMany(CourseModule::class);
    }

    /**
     * Get the assessments for this course.
     */
    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }

    /**
     * Get the assignments for this course.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    /**
     * Get the exams for this course.
     */
    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class);
    }

    /**
     * Get the announcements for this course.
     */
    public function announcements(): HasMany
    {
        return $this->hasMany(Announcement::class);
    }

    /**
     * Get the discussions for this course.
     */
    public function discussions(): HasMany
    {
        return $this->hasMany(Discussion::class);
    }

    /**
     * Get the grades summary for this course.
     */
    public function gradesSummaries(): HasMany
    {
        return $this->hasMany(GradesSummary::class);
    }

    /**
     * Enroll a user in this course.
     */
    public function enroll(int $userId, string $role = 'student'): void
    {
        if ($this->enrolledUsers()->where('user_id', $userId)->exists()) {
            throw new \Exception('User is already enrolled in this course');
        }

        $privilege = 'student';

        if ($role === 'admin') {
            $privilege = 'admin';
        }

        if ($this->created_by === $userId) {
            $privilege = 'instructor';
        }

        $this->enrolledUsers()->attach($userId, ['enrolled_as' => $privilege]);
    }

    /**
     * Unenroll a user from this course.
     */
    public function unenroll(int $userId): void
    {
        if (!$this->enrolledUsers()->where('user_id', $userId)->exists()) {
            throw new \Exception('User is not enrolled in this course');
        }

        $this->enrolledUsers()->detach($userId);
    }

    /**
     * Get instructors for this course.
     */
    public function getInstructors()
    {
        return $this->enrolledUsers()
                    ->wherePivot('enrolled_as', 'instructor')
                    ->get();
    }

    /**
     * Get students for this course.
     */
    public function getStudents()
    {
        return $this->enrolledUsers()
                    ->wherePivot('enrolled_as', 'student')
                    ->get();
    }

    /**
     * Check if course is published.
     */
    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    /**
     * Check if course is archived.
     */
    public function isArchived(): bool
    {
        return $this->status === 'archived';
    }

    /**
     * Scope to get published courses.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope to get archived courses.
     */
    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    /**
     * Scope to get courses for a specific user with their privilege.
     */
    public function scopeWithUserPrivilege($query, int $userId)
    {
        return $query->with(['enrolledUsers' => function ($q) use ($userId) {
            $q->where('user_id', $userId);
        }]);
    }

    /**
     * Get course statistics.
     */
    public function getStats(): array
    {
        return [
            'total_students' => $this->getStudents()->count(),
            'total_instructors' => $this->getInstructors()->count(),
            'total_modules' => $this->modules()->count(),
            'total_published_modules' => $this->modules()->where('is_published', true)->count(),
            'total_assignments' => $this->assignments()->count(),
            'total_assessments' => $this->assessments()->count(),
            'total_exams' => $this->exams()->count(),
            'total_announcements' => $this->announcements()->count(),
            'total_discussions' => $this->discussions()->count(),
            'enrollment_rate' => $this->calculateEnrollmentRate(),
            'completion_rate' => $this->calculateCompletionRate(),
        ];
    }

    /**
     * Calculate enrollment rate (students enrolled vs total capacity).
     */
    public function calculateEnrollmentRate(): float
    {
        $studentCount = $this->getStudents()->count();
        // Assuming a default capacity of 50 students if not specified
        $capacity = 50;
        return $capacity > 0 ? round(($studentCount / $capacity) * 100, 2) : 0;
    }

    /**
     * Calculate completion rate based on module progress.
     */
    public function calculateCompletionRate(): float
    {
        $totalModules = $this->modules()->where('is_published', true)->count();
        if ($totalModules === 0) {
            return 0;
        }

        $students = $this->getStudents();
        if ($students->count() === 0) {
            return 0;
        }

        $totalProgress = 0;
        foreach ($students as $student) {
            $completedModules = $this->modules()
                ->where('is_published', true)
                ->whereHas('moduleItems', function ($query) use ($student) {
                    $query->whereHas('views', function ($q) use ($student) {
                        $q->where('user_id', $student->id);
                    });
                })
                ->count();
            $totalProgress += $completedModules;
        }

        return round(($totalProgress / ($totalModules * $students->count())) * 100, 2);
    }

    /**
     * Get recent activity for this course.
     */
    public function getRecentActivity(int $limit = 10): array
    {
        $activities = [];

        // Recent announcements
        $announcements = $this->announcements()
            ->latest()
            ->limit($limit)
            ->get();
        foreach ($announcements as $announcement) {
            $activities[] = [
                'type' => 'announcement',
                'title' => $announcement->title,
                'created_at' => $announcement->created_at,
                'user' => $announcement->creator,
            ];
        }

        // Recent discussions
        $discussions = $this->discussions()
            ->latest()
            ->limit($limit)
            ->get();
        foreach ($discussions as $discussion) {
            $activities[] = [
                'type' => 'discussion',
                'title' => $discussion->title,
                'created_at' => $discussion->created_at,
                'user' => $discussion->creator,
            ];
        }

        // Recent submissions
        $submissions = $this->assessments()
            ->with(['submissions' => function ($query) {
                $query->latest()->limit($limit);
            }])
            ->get()
            ->pluck('submissions')
            ->flatten();
        foreach ($submissions as $submission) {
            $activities[] = [
                'type' => 'submission',
                'title' => "Submission for {$submission->assessment->title}",
                'created_at' => $submission->submitted_at,
                'user' => $submission->user,
            ];
        }

        // Sort by created_at and return limited results
        usort($activities, function ($a, $b) {
            return $b['created_at']->compare($a['created_at']);
        });

        return array_slice($activities, 0, $limit);
    }

    /**
     * Check if user is instructor for this course.
     */
    public function isInstructor(int $userId): bool
    {
        return $this->created_by === $userId ||
               $this->enrolledUsers()
                   ->where('user_id', $userId)
                   ->wherePivot('enrolled_as', 'instructor')
                   ->exists();
    }

    /**
     * Check if user is student in this course.
     */
    public function isStudent(int $userId): bool
    {
        return $this->enrolledUsers()
            ->where('user_id', $userId)
            ->wherePivot('enrolled_as', 'student')
            ->exists();
    }

    /**
     * Get user's role in this course.
     */
    public function getUserRole(int $userId): ?string
    {
        if ($this->created_by === $userId) {
            return 'creator';
        }

        $enrollment = $this->enrolledUsers()
            ->where('user_id', $userId)
            ->first();

        return $enrollment ? $enrollment->pivot->enrolled_as : null;
    }

    /**
     * Publish the course.
     */
    public function publish(): void
    {
        $this->update(['status' => 'published']);
    }

    /**
     * Archive the course.
     */
    public function archive(): void
    {
        $this->update(['status' => 'archived']);
    }

    /**
     * Draft the course.
     */
    public function draft(): void
    {
        $this->update(['status' => 'draft']);
    }

    /**
     * Get course progress for a specific user.
     */
    public function getUserProgress(int $userId): array
    {
        $totalModules = $this->modules()->where('is_published', true)->count();
        $completedModules = 0;
        $totalItems = 0;
        $completedItems = 0;

        foreach ($this->modules()->where('is_published', true)->get() as $module) {
            $moduleItems = $module->moduleItems;
            $totalItems += $moduleItems->count();

            $moduleCompleted = true;
            foreach ($moduleItems as $item) {
                if (!$item->views()->where('user_id', $userId)->exists()) {
                    $moduleCompleted = false;
                } else {
                    $completedItems++;
                }
            }

            if ($moduleCompleted) {
                $completedModules++;
            }
        }

        return [
            'total_modules' => $totalModules,
            'completed_modules' => $completedModules,
            'total_items' => $totalItems,
            'completed_items' => $completedItems,
            'module_progress' => $totalModules > 0 ? round(($completedModules / $totalModules) * 100, 2) : 0,
            'item_progress' => $totalItems > 0 ? round(($completedItems / $totalItems) * 100, 2) : 0,
        ];
    }
}
