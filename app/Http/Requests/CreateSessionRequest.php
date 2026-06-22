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
            'identifier' => ['required', 'string'],
            'password'   => ['required', 'string'],
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
                'identifier' => __('auth.failed'),
            ]);
        }

        return $user;
    }

    public function findUser(): ?User
    {
        $identifier = $this->string('identifier')->toString();

        $normalized = $this->normalizePhone($identifier);

        if ($normalized !== null) {
            $user = User::query()->where('phone', $normalized)->first();

            if ($user) {
                return $user;
            }
        }

        return User::query()->where('email', $identifier)->first();
    }

    // @codeCoverageIgnore
    public function throttleKey(): string
    {
        return $this->string('identifier') // @codeCoverageIgnore
            ->lower() // @codeCoverageIgnore
            ->append('|' . $this->ip()) // @codeCoverageIgnore
            ->transliterate() // @codeCoverageIgnore
            ->value(); // @codeCoverageIgnore
    }

    private function normalizePhone(string $identifier): ?string
    {
        $digits = (string) preg_replace('/\D/', '', $identifier);

        if ($digits === '') {
            return null;
        }

        if (mb_strlen($digits) === 11) {
            return '+55' . $digits;
        }

        if (mb_strlen($digits) === 13 && str_starts_with($digits, '55')) {
            return '+' . $digits;
        }

        return null;
    }
}
