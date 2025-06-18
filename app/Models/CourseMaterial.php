<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseMaterial extends Model
{
    /** @use HasFactory<\Database\Factories\CourseMaterialFactory> */
    use HasFactory;

    const TYPE_VIDEO = 'video';
    const TYPE_PDF = 'pdf';
    const TYPE_LINK = 'link';
    const TYPE_TEXT = 'text';
    const TYPE_AUDIO = 'audio';
    const TYPE_IMAGE = 'image';

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'type',
        'file_path',
        'file_url',
        'content',
        'duration_minutes',
        'order_index',
        'is_published',
        'is_downloadable',
        'file_size',
        'mime_type',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'is_downloadable' => 'boolean',
        'duration_minutes' => 'integer',
        'order_index' => 'integer',
        'file_size' => 'integer',
    ];

    // Relationships
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    // Helper methods
    public function isVideo(): bool
    {
        return $this->type === self::TYPE_VIDEO;
    }

    public function isPdf(): bool
    {
        return $this->type === self::TYPE_PDF;
    }

    public function isLink(): bool
    {
        return $this->type === self::TYPE_LINK;
    }

    public function isText(): bool
    {
        return $this->type === self::TYPE_TEXT;
    }

    public function getFormattedFileSize(): string
    {
        if (!$this->file_size) {
            return 'Unknown';
        }

        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }
}
