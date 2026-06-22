<?php

declare(strict_types = 1);

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

final class RegisterBarberPhoneRequest extends FormRequest
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
            'phone' => ['required', 'string', 'regex:/^\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}$/'],
        ];
    }

    /**
     * Normalize phone to E.164 format after validation passes.
     */
    public function normalizedPhone(): string
    {
        $phone  = $this->string('phone')->toString();
        $digits = preg_replace('/\D/', '', $phone);

        return '+55' . $digits;
    }
}
