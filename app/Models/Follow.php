<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Follow extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'follows_id',
    ];

    /**
     * Get the user who is following.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user being followed.
     */
    public function follows(): BelongsTo
    {
        return $this->belongsTo(User::class, 'follows_id');
    }

    /**
     * Scope to get followers of a specific user.
     */
    public function scopeFollowersOf($query, int $userId)
    {
        return $query->where('follows_id', $userId);
    }

    /**
     * Scope to get who a specific user follows.
     */
    public function scopeFollowingBy($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
