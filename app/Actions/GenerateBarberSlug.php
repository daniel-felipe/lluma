<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Models\BarberProfile;
use Illuminate\Support\Str;

final readonly class GenerateBarberSlug
{
    public function run(string $businessName, ?string $exceptSlug = null): string
    {
        $base    = mb_substr(Str::slug($businessName), 0, 47);
        $slug    = $base;
        $counter = 2;

        while ($this->slugExists($slug, $exceptSlug)) {
            $slug = $base . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    private function slugExists(string $slug, ?string $exceptSlug): bool
    {
        if ($slug === $exceptSlug) {
            return false;
        }

        return BarberProfile::query()->where('slug', $slug)->exists();
    }
}
