<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'name',
        'email',
        'password',
        'photo',
        'mobile',
        'role',
        'is_active',
        'is_email_registered',
        'code',
        'last_seen_at',
        'bio',
        'location',
        'website',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_seen_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the user's enrollments.
     */
    public function enrollments(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_user_enrollments')
                    ->withPivot('enrolled_as', 'created_at')
                    ->withTimestamps();
    }

    /**
     * Get assignments owned by this user.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'owner_id');
    }

    /**
     * Get articles created by this user.
     */
    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'created_by');
    }

    /**
     * Get users that this user follows.
     */
    public function follows(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'user_id', 'follows_id')
                    ->withTimestamps();
    }

    /**
     * Get users that follow this user.
     */
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'follows_id', 'user_id')
                    ->withTimestamps();
    }

    /**
     * Get likes by this user.
     */
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }



    /**
     * Get bookmarks by this user.
     */
    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    /**
     * Get comments by this user.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get courses created by this user.
     */
    public function createdCourses(): HasMany
    {
        return $this->hasMany(Course::class, 'created_by');
    }

    /**
     * Get lectures created by this user.
     */
    public function lectures(): HasMany
    {
        return $this->hasMany(Lecture::class, 'created_by');
    }

    /**
     * Get notifications for this user.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Get submissions by this user.
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    /**
     * Get achievements by this user.
     */
    public function achievements(): HasMany
    {
        return $this->hasMany(Achievement::class);
    }

    /**
     * Get progress records for this user.
     */
    public function progress(): HasMany
    {
        return $this->hasMany(UserProgress::class);
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Check if user is an instructor.
     */
    public function isInstructor(): bool
    {
        return $this->hasRole('instructor');
    }

    /**
     * Check if user is a student.
     */
    public function isStudent(): bool
    {
        return $this->hasRole('student');
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    /**
     * Check if user can manage courses.
     */
    public function canManageCourses(): bool
    {
        return $this->hasAnyRole(['admin', 'instructor']);
    }

    /**
     * Check if user can manage users.
     */
    public function canManageUsers(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Get courses where user is instructor.
     */
    public function instructorCourses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_user_enrollments')
                    ->wherePivot('enrolled_as', 'instructor')
                    ->withTimestamps();
    }

    /**
     * Get courses where user is admin.
     */
    public function adminCourses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_user_enrollments')
                    ->wherePivot('enrolled_as', 'admin')
                    ->withTimestamps();
    }

    /**
     * Get all courses user can manage (as instructor or admin).
     */
    public function manageableCourses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_user_enrollments')
                    ->whereIn('enrolled_as', ['instructor', 'admin'])
                    ->withTimestamps();
    }

    /**
     * Check if user is enrolled in a specific course.
     */
    public function isEnrolled(Course $course): bool
    {
        return $this->enrollments()->where('course_id', $course->id)->exists();
    }

    /**
     * Assign user to a course with specific role.
     */
    public function assignToCourse(Course $course, string $role = 'student'): void
    {
        $enrolledAs = $role === 'admin' ? 'admin' : ($role === 'instructor' ? 'instructor' : 'student');

        $this->enrollments()->syncWithoutDetaching([
            $course->id => ['enrolled_as' => $enrolledAs]
        ]);
    }

    /**
     * Remove user from a course.
     */
    public function removeFromCourse(Course $course): void
    {
        $this->enrollments()->detach($course->id);
    }

    /**
     * Update user role.
     */
    public function updateRole(string $newRole): void
    {
        if (!in_array($newRole, ['admin', 'instructor', 'student'])) {
            throw new \InvalidArgumentException('Invalid role specified');
        }

        $this->update(['role' => $newRole]);
    }

    /**
     * Toggle user active status.
     */
    public function toggleActive(): void
    {
        $this->update(['is_active' => !$this->is_active]);
    }

    /**
     * Get user statistics.
     */
    public function getStats(): array
    {
        return [
            'courses_created' => $this->createdCourses()->count(),
            'courses_enrolled' => $this->enrollments()->count(),
            'courses_teaching' => $this->instructorCourses()->count(),
            'assignments_submitted' => $this->submissions()->count(),
            'articles_published' => $this->articles()->count(),
            'followers_count' => $this->followers()->count(),
            'following_count' => $this->follows()->count(),
        ];
    }

    /**
     * Scope to get users by search term.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('username', 'like', "%{$search}%");
        });
    }

    /**
     * Scope to get users with course assignments.
     */
    public function scopeWithCourseAssignments($query)
    {
        return $query->with(['enrollments', 'createdCourses']);
    }

    /**
     * Get the default photo URL.
     */
    public function getPhotoUrlAttribute(): string
    {
        return $this->photo ?: 'https://www.w3schools.com/howto/img_avatar.png';
    }

    /**
     * Verify password.
     */
    public function verifyPassword(string $password): bool
    {
        return Hash::check($password, $this->password);
    }

    /**
     * Scope to get active users.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get users by role.
     */
    public function scopeRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Generate username from name if not provided.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (empty($user->username)) {
                $user->username = self::generateUsername($user->name);
            }
        });
    }

    /**
     * Generate a unique username from the given name.
     */
    private static function generateUsername(string $name): string
    {
        $baseUsername = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name));
        $username = $baseUsername;
        $counter = 1;

        while (static::where('username', $username)->exists()) {
            $username = $baseUsername . $counter;
            $counter++;
        }

        return $username;
    }
}
