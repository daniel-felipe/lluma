<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Actions\GenerateBarberSlug;
use App\Models\BarberProfile;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SlugAvailabilityController
{
    public function show(Request $request): JsonResponse
    {
        $request->validate(['slug' => ['required', 'string']]);

        $slug   = (string) $request->query('slug');
        $except = (string) ($request->query('except') ?? '');

        $available = ! BarberProfile::query()
            ->where('slug', $slug)
            ->when($except !== '', fn (Builder $query) => $query->where('slug', '!=', $except))
            ->exists();

        $suggestion = $available ? $slug : resolve(GenerateBarberSlug::class)->run($slug, $except ?: null);

        return response()->json(['available' => $available, 'suggestion' => $suggestion]);
    }
}
