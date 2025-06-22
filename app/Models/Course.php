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
        return $this->belongsToMany(User::class, 'enrollments')
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
}
