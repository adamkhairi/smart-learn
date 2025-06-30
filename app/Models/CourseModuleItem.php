<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'type',
        'url',
        'content',
        'course_module_id',
        'order',
        'duration',
        'is_required',
        'file_name',
        'file_type',
        'file_size',
        'metadata',
        'status',
        'is_processed',
        'view_count',
        'last_viewed_at',
        'allow_download',
        'track_completion',
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
            'file_size' => 'integer',
            'metadata' => 'array',
            'is_processed' => 'boolean',
            'view_count' => 'integer',
            'last_viewed_at' => 'datetime',
            'allow_download' => 'boolean',
            'track_completion' => 'boolean',
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
     * Check if item is being processed.
     */
    public function isProcessing(): bool
    {
        return $this->status === 'processing';
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
     * Check if item is a quiz.
     */
    public function isQuiz(): bool
    {
        return $this->type === 'quiz';
    }

    /**
     * Check if item is an assignment.
     */
    public function isAssignment(): bool
    {
        return $this->type === 'assignment';
    }

    // === URL AND CONTENT PROCESSING ===

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
        if ($this->isDocument() && $this->url) {
            return Storage::disk('public')->url($this->url);
        }
        return null;
    }

    /**
     * Get file size in human readable format.
     */
    public function getFormattedFileSize(): ?string
    {
        if (!$this->file_size) return null;

        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = $this->file_size;

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Get formatted duration.
     */
    public function getFormattedDuration(): ?string
    {
        if (!$this->duration) return null;

        $hours = floor($this->duration / 3600);
        $minutes = floor(($this->duration % 3600) / 60);
        $seconds = $this->duration % 60;

        if ($hours > 0) {
            return sprintf('%d:%02d:%02d', $hours, $minutes, $seconds);
        }

        return sprintf('%d:%02d', $minutes, $seconds);
    }

    /**
     * Get content preview (truncated).
     */
    public function getContentPreview(int $length = 150): ?string
    {
        if (!$this->content) return null;

        return Str::limit(strip_tags($this->content), $length);
    }

    // === METADATA HELPERS ===

    /**
     * Get metadata value by key.
     */
    public function getMetadata(string $key, $default = null)
    {
        return data_get($this->metadata, $key, $default);
    }

    /**
     * Set metadata value.
     */
    public function setMetadata(string $key, $value): void
    {
        $metadata = $this->metadata ?? [];
        data_set($metadata, $key, $value);
        $this->metadata = $metadata;
    }

    /**
     * Add to metadata array.
     */
    public function addMetadata(array $data): void
    {
        $this->metadata = array_merge($this->metadata ?? [], $data);
    }

    // === ANALYTICS ===

    /**
     * Increment view count.
     */
    public function incrementViews(): void
    {
        $this->increment('view_count');
        $this->update(['last_viewed_at' => now()]);
    }

    /**
     * Get engagement score based on views and duration.
     */
    public function getEngagementScore(): float
    {
        if (!$this->duration || $this->view_count === 0) return 0;

        // Simple engagement calculation: views per minute of content
        return round($this->view_count / ($this->duration / 60), 2);
    }

    // === FILE MANAGEMENT ===

    /**
     * Delete associated files when model is deleted.
     */
    protected static function booted(): void
    {
        static::deleting(function (CourseModuleItem $item) {
            if ($item->isDocument() && $item->url) {
                Storage::disk('public')->delete($item->url);
            }
        });
    }

    /**
     * Check if file exists.
     */
    public function fileExists(): bool
    {
        if (!$this->isDocument() || !$this->url) return false;

        return Storage::disk('public')->exists($this->url);
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
     * Scope to get published items.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope to get processed items.
     */
    public function scopeProcessed($query)
    {
        return $query->where('is_processed', true);
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
        return $query->orderByDesc('view_count')->limit($limit);
    }

    /**
     * Scope to search items by title and description.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
    }
}
