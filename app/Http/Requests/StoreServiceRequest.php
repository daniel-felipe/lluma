<?php

declare(strict_types = 1);

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

final class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'             => ['required', 'string', 'max:255'],
            'price_cents'      => ['required', 'integer', 'min:1', 'max:9999999'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:480'],
        ];
    }
}
