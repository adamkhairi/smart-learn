<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CourseModuleItem extends Model
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
        'type',
        'url',
        'content',
        'course_module_id',
        'order',
        'duration',
        'is_required',
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
            'duration' => 'integer',
            'is_required' => 'boolean',
        ];
    }

    /**
     * Get the course module this item belongs to.
     */
    public function courseModule(): BelongsTo
    {
        return $this->belongsTo(CourseModule::class);
    }

    /**
     * Check if item is required.
     */
    public function isRequired(): bool
    {
        return $this->is_required === true;
    }

    /**
     * Check if item is a video.
     */
    public function isVideo(): bool
    {
        return $this->type === 'video';
    }

    /**
     * Check if item is a document.
     */
    public function isDocument(): bool
    {
        return $this->type === 'document';
    }

    /**
     * Check if item is a link.
     */
    public function isLink(): bool
    {
        return $this->type === 'link';
    }

    /**
     * Get YouTube video ID if it's a YouTube video.
     */
    public function getYouTubeVideoId(): ?string
    {
        if ($this->isVideo() && str_contains($this->url, 'youtu')) {
            preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/', $this->url, $matches);
            return $matches[1] ?? null;
        }

        return null;
    }

    /**
     * Scope to get items for a specific module.
     */
    public function scopeForModule($query, int $moduleId)
    {
        return $query->where('course_module_id', $moduleId);
    }

    /**
     * Scope to get items by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get required items.
     */
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    /**
     * Scope to order by item order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}
