<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use App\Enums\CourseLevel;

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
        'is_private',
        'files',
        'category_id',
        'level',
        'duration',
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
            'level' => CourseLevel::class,
        ];
    }

    /**
     * The relationships that should always be loaded.
     *
     * @var array
     */
    protected $with = [
        'category',
    ];

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
     * Get the category that owns the course.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
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
    public function enroll(int $userId, string $role = 'student', ?User $authorizedBy = null): void
    {
        // Check if user is already enrolled
        if ($this->enrolledUsers()->where('user_id', $userId)->exists()) {
            throw new \Exception('User is already enrolled in this course');
        }

        // Validate role parameter
        if (!in_array($role, ['student', 'instructor', 'admin'])) {
            throw new \InvalidArgumentException('Invalid role specified');
        }

        // Authorization logic
        if ($authorizedBy) {
            // Check if the authorizing user has permission to enroll others
            if (!$authorizedBy->isAdmin() && $this->created_by !== $authorizedBy->id) {
                throw new \Exception('You do not have permission to enroll users in this course');
            }

            // Only admins can assign admin role, only course creators/admins can assign instructor role
            if ($role === 'admin' && !$authorizedBy->isAdmin()) {
                throw new \Exception('Only administrators can assign admin role');
            }

            if ($role === 'instructor' && !$authorizedBy->isAdmin() && $this->created_by !== $authorizedBy->id) {
                throw new \Exception('Only course creators and administrators can assign instructor role');
            }
        }

        // Determine final privilege
        $privilege = $role;

        // Course creator should always be instructor (unless being made admin)
        if ($this->created_by === $userId && $role !== 'admin') {
            $privilege = 'instructor';
        }

        // Prevent self-enrollment as instructor/admin without authorization
        if (($role === 'instructor' || $role === 'admin') && !$authorizedBy) {
            throw new \Exception('Instructor and admin roles require authorization');
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
     * Get IDs of completed module items for a user in this course.
     */
    public function getCompletedModuleItemIds(int $userId): array
    {
        return UserProgress::where('user_id', $userId)
            ->where('course_id', $this->id)
            ->where('status', 'completed')
            ->pluck('course_module_item_id')
            ->toArray();
    }

    /**
     * Check if course is published.
     */
    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    /**
     * Check if course is draft.
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
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
     * Note: This is a simplified implementation that calculates overall engagement
     * rather than per-user completion since we don't currently track user-specific views.
     */
    public function calculateCompletionRate(): float
    {
        $totalItems = $this->modules()
            ->where('is_published', true)
            ->withCount('moduleItems')
            ->get()
            ->sum('module_items_count');

        if ($totalItems === 0) {
            return 0;
        }

        $viewedItems = $this->modules()
            ->where('is_published', true)
            ->withCount(['moduleItems' => function ($query) {
                $query->where('view_count', '>', 0);
            }])
            ->get()
            ->sum('module_items_count');

        return round(($viewedItems / $totalItems) * 100, 2);
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
            ->with(['submissions' => function ($query) use ($limit) {
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
            return $b['created_at'] <=> $a['created_at'];
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
        return UserProgress::getCourseProgressSummary($userId, $this->id);
    }

    /**
     * Get user progress for a specific module item.
     */
    public function getUserProgressForItem(int $userId, int $itemId): ?UserProgress
    {
        return UserProgress::where('user_id', $userId)
            ->where('course_id', $this->id)
            ->where('course_module_item_id', $itemId)
            ->first();
    }

    /**
     * Mark item as started for a user.
     */
    public function markItemAsStarted(int $userId, int $itemId): void
    {
        $progress = UserProgress::getOrCreate($userId, $this->id, null, $itemId);
        $progress->markAsStarted();
    }

    /**
     * Mark item as completed for a user.
     */
    public function markItemAsCompleted(int $userId, int $itemId): void
    {
        $progress = UserProgress::getOrCreate($userId, $this->id, null, $itemId);
        $progress->markAsCompleted();
    }

    /**
     * Update user's time spent on an item.
     */
    public function updateUserTimeSpent(int $userId, int $itemId, int $seconds): void
    {
        $progress = UserProgress::getOrCreate($userId, $this->id, null, $itemId);
        $progress->addTimeSpent($seconds);
    }

    /**
     * Get all progress records for a user in this course.
     */
    public function getUserProgressRecords(int $userId)
    {
        return UserProgress::where('user_id', $userId)
            ->where('course_id', $this->id)
            ->with(['courseModule', 'courseModuleItem'])
            ->get();
    }
}
