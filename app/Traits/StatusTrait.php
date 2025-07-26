<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait StatusTrait
{
    public function isOpen(): bool
    {
        return $this->getStatusAttribute() === 'open';
    }

    public function isEnded(): bool
    {
        return $this->getStatusAttribute() === 'ended';
    }

    public function isComingSoon(): bool
    {
        return $this->getStatusAttribute() === 'coming-soon';
    }

    public function scopeOpen(Builder $query)
    {
        return $query->where('started_at', '<=', now()->utc())
                    ->where('expired_at', '>', now()->utc())
                    ->where('visibility', true);
    }

    public function scopeEnded(Builder $query)
    {
        return $query->where('expired_at', '<', now()->utc());
    }

    public function scopeComingSoon(Builder $query)
    {
        return $query->where('started_at', '>', now()->utc());
    }
}
