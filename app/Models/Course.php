<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'created_by',
        'image',
        'background_color',
        'status'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Status constants
    const STATUS_PUBLISHED = 'published';
    const STATUS_ARCHIVED = 'archived';

    // Relationships
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function enrollments()
    {
        return $this->belongsToMany(User::class, 'course_enrollments')
                    ->withPivot('enrolled_as')
                    ->withTimestamps();
    }

    public function modules()
    {
        return $this->hasMany(CourseModule::class);
    }

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class);
    }

    // Helper methods
    public function enroll(User $user, string $role = 'student'): void
    {
        if ($this->enrollments()->where('user_id', $user->id)->exists()) {
            throw new \Exception('User already enrolled');
        }

        $privilege = 'student';

        if ($user->role === 'admin') {
            $privilege = 'admin';
        } elseif ($this->created_by === $user->id) {
            $privilege = 'instructor';
        }

        $this->enrollments()->attach($user->id, ['enrolled_as' => $privilege]);
    }

    public function unenroll(User $user): void
    {
        if (!$this->enrollments()->where('user_id', $user->id)->exists()) {
            throw new \Exception('User not enrolled');
        }

        $this->enrollments()->detach($user->id);
    }

    public function getInstructors()
    {
        return $this->enrollments()
                    ->wherePivot('enrolled_as', 'instructor')
                    ->get();
    }

    // Scope for user privileges
    public function scopeWithUserPrivilege($query, $userId)
    {
        return $query->with(['enrollments' => function($q) use ($userId) {
            $q->where('user_id', $userId);
        }]);
    }
}
