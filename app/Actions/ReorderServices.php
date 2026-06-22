<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Exceptions\ServiceException;
use App\Models\BarberProfile;
use App\Models\Service;
use Illuminate\Support\Facades\DB;

final readonly class ReorderServices
{
    /**
     * @param  array<int, string>  $orderedIds
     */
    public function run(BarberProfile $profile, array $orderedIds): void
    {
        $profileServiceIds = $profile->services()->pluck('id')->all();

        foreach ($orderedIds as $id) {
            throw_unless(in_array($id, $profileServiceIds, strict: true), ServiceException::class, 'Um ou mais serviços não pertencem a este barbeiro.');
        }

        DB::transaction(function () use ($orderedIds): void {
            foreach ($orderedIds as $index => $id) {
                Service::query()
                    ->where('id', $id)
                    ->update(['sort_order' => $index + 1]);
            }
        });
    }
}
