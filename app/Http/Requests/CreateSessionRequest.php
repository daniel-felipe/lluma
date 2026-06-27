<?php

declare(strict_types = 1);

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

final class CreateSessionRequest extends FormRequest
{
    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * @throws ValidationException
     */
    public function validateCredentials(): User
    {
        $user = $this->findUser();

        if (! $user || ! Hash::check($this->string('password')->toString(), (string) $user->password)) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        return $user;
    }

    public function findUser(): ?User
    {
        return User::query()->where('email', $this->string('email')->toString())->first();
    }

    // @codeCoverageIgnore
    public function throttleKey(): string
    {
        return $this->string('email') // @codeCoverageIgnore
            ->lower() // @codeCoverageIgnore
            ->append('|' . $this->ip()) // @codeCoverageIgnore
            ->transliterate() // @codeCoverageIgnore
            ->value(); // @codeCoverageIgnore
    }
}
