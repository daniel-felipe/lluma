<?php

declare(strict_types = 1);

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateBarberProfileRequest extends FormRequest
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
        /** @var User $user */
        $user            = $this->user();
        $barberProfileId = $user->barberProfile?->id;

        return [
            'name'          => ['required', 'string', 'max:255'],
            'business_name' => ['required', 'string', 'max:100'],
            'slug'          => [
                'required',
                'regex:/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/',
                Rule::unique('barber_profiles', 'slug')->ignore($barberProfileId),
            ],
            'address_street'       => ['required', 'string'],
            'address_number'       => ['required', 'string'],
            'address_neighborhood' => ['required', 'string'],
            'address_city'         => ['required', 'string'],
            'address_state'        => ['required', 'string', 'size:2', 'alpha'],
            'address_cep'          => ['nullable', 'string', 'regex:/^\d{5}-\d{3}$/'],
            'phone'                => ['nullable', 'string', 'regex:/^\+55\d{10,11}$/'],
            'profile_photo'        => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
            'cover_photo'          => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
        ];
    }
}
