<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
        'content_json',
        'content_html',
        'course_module_id',
        'itemable_id',
        'itemable_type',
        'order',
        'is_required',
        'status',
        'view_count',
        'last_viewed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'content_json' => 'json',
            'order' => 'integer',
            'is_required' => 'boolean',
            'view_count' => 'integer',
            'last_viewed_at' => 'datetime',
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
     * Get the course through the module relationship.
     */
    public function course()
    {
        return $this->hasOneThrough(Course::class, CourseModule::class, 'id', 'id', 'course_module_id', 'course_id');
    }

    /**
     * Get the itemable model (Lecture, Assessment, Assignment).
     */
    public function itemable(): MorphTo
    {
        return $this->morphTo();
    }

    // === STATUS METHODS ===

    /**
     * Check if item is published.
     */
    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    /**
     * Check if item is draft.
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Check if item is required.
     */
    public function isRequired(): bool
    {
        return $this->is_required === true;
    }

    // === TYPE CHECKING METHODS ===

    /**
     * Check if item is a lecture.
     */
    public function isLecture(): bool
    {
        return $this->itemable_type === Lecture::class;
    }

    /**
     * Check if item is an assessment.
     */
    public function isAssessment(): bool
    {
        return $this->itemable_type === Assessment::class;
    }

    /**
     * Check if item is an assignment.
     */
    public function isAssignment(): bool
    {
        return $this->itemable_type === Assignment::class;
    }

    // === CONVENIENCE METHODS ===

    /**
     * Get the item type name.
     */
    public function getItemTypeName(): string
    {
        return match($this->itemable_type) {
            Lecture::class => 'lecture',
            Assessment::class => 'assessment',
            Assignment::class => 'assignment',
            default => 'unknown'
        };
    }

    /**
     * Get the item's duration if applicable.
     */
    public function getDuration(): ?int
    {
        if ($this->isLecture() && $this->itemable) {
            return $this->itemable->duration;
        }

        return null;
    }

    /**
     * Get formatted duration.
     */
    public function getFormattedDuration(): ?string
    {
        $duration = $this->getDuration();

        if (!$duration) {
            return null;
        }

        $minutes = floor($duration / 60);
        $seconds = $duration % 60;

        return sprintf('%d:%02d', $minutes, $seconds);
    }

    /**
     * Increment view count for this item.
     */
    public function incrementViews(): void
    {
        $this->increment('view_count');
        $this->update(['last_viewed_at' => now()]);
    }

    // === SCOPES ===

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
        return $query->where('itemable_type', $type);
    }

    /**
     * Scope to get lectures.
     */
    public function scopeLectures($query)
    {
        return $query->where('itemable_type', Lecture::class);
    }

    /**
     * Scope to get assessments.
     */
    public function scopeAssessments($query)
    {
        return $query->where('itemable_type', Assessment::class);
    }

    /**
     * Scope to get assignments.
     */
    public function scopeAssignments($query)
    {
        return $query->where('itemable_type', Assignment::class);
    }

    /**
     * Scope to get required items.
     */
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    /**
     * Scope to get published items.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope to order by item order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    /**
     * Scope to get most viewed items.
     */
    public function scopeMostViewed($query, int $limit = 10)
    {
        return $query->orderBy('view_count', 'desc')->limit($limit);
    }

    /**
     * Scope to search items.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    // === URL AND CONTENT PROCESSING ===

    /**
     * Get YouTube video ID if it's a YouTube video.
     */
    public function getYouTubeVideoId(): ?string
    {
        if ($this->isLecture() && $this->itemable && str_contains($this->itemable->url, 'youtu')) {
            preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/', $this->itemable->url, $matches);
            return $matches[1] ?? null;
        }

        return null;
    }

    /**
     * Get YouTube embed URL.
     */
    public function getYouTubeEmbedUrl(): ?string
    {
        $videoId = $this->getYouTubeVideoId();
        return $videoId ? "https://www.youtube.com/embed/{$videoId}" : null;
    }

    /**
     * Get YouTube thumbnail URL.
     */
    public function getYouTubeThumbnail(): ?string
    {
        $videoId = $this->getYouTubeVideoId();
        return $videoId ? "https://img.youtube.com/vi/{$videoId}/maxresdefault.jpg" : null;
    }

    /**
     * Get file download URL for documents.
     */
    public function getDownloadUrl(): ?string
    {
        if ($this->isLecture() && $this->itemable && $this->itemable->url) {
            return Storage::disk('public')->url($this->itemable->url);
        }
        return null;
    }

    /**
     * Get file size in human readable format.
     */
    public function getFormattedFileSize(): ?string
    {
        if (!$this->itemable || !$this->itemable->file_size) return null;

        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = $this->itemable->file_size;

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Get content preview (truncated).
     */
    public function getContentPreview(int $length = 150): ?string
    {
        if (!$this->itemable || !$this->itemable->content) return null;

        return Str::limit(strip_tags($this->itemable->content), $length);
    }

    // === METADATA HELPERS ===

    /**
     * Get metadata value by key.
     */
    public function getMetadata(string $key, $default = null)
    {
        return data_get($this->itemable->metadata, $key, $default);
    }

    /**
     * Set metadata value.
     */
    public function setMetadata(string $key, $value): void
    {
        $metadata = $this->itemable->metadata ?? [];
        data_set($metadata, $key, $value);
        $this->itemable->metadata = $metadata;
    }

    /**
     * Add to metadata array.
     */
    public function addMetadata(array $data): void
    {
        $this->itemable->metadata = array_merge($this->itemable->metadata ?? [], $data);
    }

    // === ANALYTICS ===

    /**
     * Get engagement score based on views and duration.
     */
    public function getEngagementScore(): float
    {
        if (!$this->itemable || !$this->itemable->duration || $this->view_count === 0) return 0;

        // Simple engagement calculation: views per minute of content
        return round($this->view_count / ($this->itemable->duration / 60), 2);
    }

    // === FILE MANAGEMENT ===

    /**
     * Delete associated files when model is deleted.
     */
    protected static function booted(): void
    {
        static::deleting(function (CourseModuleItem $item) {
            if ($item->isLecture() && $item->itemable && $item->itemable->url) {
                Storage::disk('public')->delete($item->itemable->url);
            }
        });
    }

    /**
     * Check if file exists.
     */
    public function fileExists(): bool
    {
        if (!$this->isLecture() || !$this->itemable || !$this->itemable->url) return false;

        return Storage::disk('public')->exists($this->itemable->url);
    }
}
