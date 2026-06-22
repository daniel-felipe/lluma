<?php

declare(strict_types = 1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class GetAvailableSlotsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'service_id' => ['required', 'uuid'],
            'date'       => ['required', 'date_format:Y-m-d', 'after_or_equal:today', 'before_or_equal:' . now()->addDays(14)->format('Y-m-d')],
        ];
    }
}
