<?php

declare(strict_types = 1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateBarberScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @param  string|int|null  $key
     * @param  mixed  $default
     * @return array{buffer_minutes: int, days: array<int, array{day_of_week: int, is_open: bool, opens_at: string|null, closes_at: string|null, break_starts_at: string|null, break_ends_at: string|null}>}
     */
    public function validated($key = null, $default = null): array
    {
        /** @var array{buffer_minutes: int, days: array<int, array{day_of_week: int, is_open: bool, opens_at: string|null, closes_at: string|null, break_starts_at: string|null, break_ends_at: string|null}>} */
        return parent::validated($key, $default);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'buffer_minutes'     => ['required', 'integer', Rule::in([0, 5, 10, 15, 30])],
            'days'               => ['required', 'array', 'size:7'],
            'days.*.day_of_week' => ['required', 'integer', 'between:1,7'],
            'days.*.is_open'     => ['required', 'boolean'],
            'days.*.opens_at'    => [
                'required_if:days.*.is_open,true',
                'nullable',
                'date_format:H:i',
                function (string $attribute, mixed $value, callable $fail): void {
                    if ($value !== null && ! $this->isFifteenMinuteIncrement($value)) {
                        $fail('The ' . $attribute . ' must be a 15-minute increment (e.g. 09:00, 09:15, 09:30, 09:45).');
                    }
                },
            ],
            'days.*.closes_at' => [
                'required_if:days.*.is_open,true',
                'nullable',
                'date_format:H:i',
                'after:days.*.opens_at',
                function (string $attribute, mixed $value, callable $fail): void {
                    if ($value !== null && ! $this->isFifteenMinuteIncrement($value)) {
                        $fail('The ' . $attribute . ' must be a 15-minute increment (e.g. 09:00, 09:15, 09:30, 09:45).');
                    }
                },
            ],
            'days.*.break_starts_at' => [
                'nullable',
                'date_format:H:i',
                'after_or_equal:days.*.opens_at',
                'before:days.*.closes_at',
                function (string $attribute, mixed $value, callable $fail): void {
                    if ($value !== null && ! $this->isFifteenMinuteIncrement($value)) {
                        $fail('The ' . $attribute . ' must be a 15-minute increment (e.g. 09:00, 09:15, 09:30, 09:45).');
                    }
                },
            ],
            'days.*.break_ends_at' => [
                'required_with:days.*.break_starts_at',
                'nullable',
                'date_format:H:i',
                'after:days.*.break_starts_at',
                'before_or_equal:days.*.closes_at',
                function (string $attribute, mixed $value, callable $fail): void {
                    if ($value !== null && ! $this->isFifteenMinuteIncrement($value)) {
                        $fail('The ' . $attribute . ' must be a 15-minute increment (e.g. 09:00, 09:15, 09:30, 09:45).');
                    }
                },
            ],
        ];
    }

    private function isFifteenMinuteIncrement(string $time): bool
    {
        [, $minutesPart] = explode(':', $time);

        return ((int) $minutesPart) % 15 === 0;
    }
}
