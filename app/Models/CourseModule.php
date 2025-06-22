<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CourseModule extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'course_id',
        'order',
        'is_published',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    /**
     * Get the course this module belongs to.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the module items for this module.
     */
    public function moduleItems(): HasMany
    {
        return $this->hasMany(CourseModuleItem::class);
    }

    /**
     * Check if module is published.
     */
    public function isPublished(): bool
    {
        return $this->is_published === true;
    }

    /**
     * Get the count of module items.
     */
    public function itemsCount(): int
    {
        return $this->moduleItems()->count();
    }

    /**
     * Scope to get published modules.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope to get modules for a specific course.
     */
    public function scopeForCourse($query, int $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    /**
     * Scope to order by module order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}
