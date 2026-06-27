# Plan: Email + Google Registration

**Branch**: `004-email-google-registration` | **Date**: 2026-06-27

## Context

Current `/register` renders `onboarding/phone.tsx` — phone number → SMS verification → user created.
Login accepts `identifier` (phone or email). Password reset has a parallel phone-based SMS flow.

**Target state:**
- `/register` → email + password form + Google OAuth button
- Login → email-only (drop phone lookup)
- Phone → optional contact field collected in profile onboarding step
- Remove all SMS-gated auth paths (registration, login, password reset)

## What Already Exists (no work needed)

| File | Status |
|------|--------|
| `resources/js/pages/user/create.tsx` | Complete — email + password + Google form |
| `app/Http/Controllers/UserController::create/store` | Complete — renders `user/create`, creates user via `CreateUser` |
| `app/Actions/CreateUser` | Complete — name + email + password, fires `Registered` event |
| `app/Http/Requests/CreateUserRequest` | Complete — validates name, email, password |
| `app/Models/User` | Implements `MustVerifyEmail` — email verification works out of the box |
| `app/Actions/FindOrCreateGoogleUserAction` | Complete — find-or-create by google_id / email |
| `GoogleRedirectController` + `GoogleCallbackController` | Complete — OAuth redirect + callback |
| `EnsureBarberOnboarding` middleware | Redirects authenticated users to `onboarding.profile.edit` if no barber profile |
| `BarberOnboardingStep` enum | Already `Profile → Services → Availability → Complete` (no phone/verify steps) |

## Registration Flow After This Change

```
Email path:
  POST /register → UserController::store → creates user → login → redirect dashboard
  → 'verified' middleware → /email/verify page
  → user clicks link → email verified → redirect dashboard
  → EnsureBarberOnboarding → onboarding.profile.edit

Google path:
  GET /auth/google → Socialite redirect → callback → FindOrCreateGoogleUser
  → login (google_id users get email_verified_at set) → redirect dashboard
  → EnsureBarberOnboarding → onboarding.profile.edit (if new user)
  → OR: straight to dashboard (if existing user with complete profile)
```

## Phase 1 — Wire Registration Routes

**File: `routes/web.php`**

In the guest middleware group, replace:
```php
Route::get('register', [BarberRegistrationController::class, 'create'])->name('register');
Route::post('register', [BarberRegistrationController::class, 'store'])->name('register.store');
Route::get('register/verify', [BarberSmsVerificationController::class, 'create'])->name('register.verify');
Route::post('register/verify', [BarberSmsVerificationController::class, 'store'])->name('register.verify.store');
Route::post('register/resend', BarberSmsResendController::class)->name('register.resend');
```

With:
```php
Route::get('register', [UserController::class, 'create'])->name('register');
Route::post('register', [UserController::class, 'store'])->name('register.store');
```

Also remove phone-based password reset routes:
```php
// Remove these:
Route::get('forgot-password/phone', [BarberPasswordResetController::class, 'create'])->name('password.forgot-phone');
Route::post('forgot-password/phone', [BarberPasswordResetController::class, 'store'])->name('password.forgot-phone.store');
Route::get('reset-password/phone', [BarberPasswordResetController::class, 'edit'])->name('password.reset-phone');
Route::post('reset-password/phone', [BarberPasswordResetController::class, 'update'])->name('password.reset-phone.store');
```

**File: `app/Http/Controllers/UserController.php`**

Remove `// @codeCoverageIgnore` markers from `create()` and `store()`. After user creation and login, `redirect()->intended(route('dashboard'))` is fine — `EnsureBarberOnboarding` handles the onboarding redirect.

## Phase 2 — Email-Only Login

**File: `app/Http/Requests/CreateSessionRequest.php`**

- Rename `identifier` field to `email`
- Remove `normalizePhone()` method
- Simplify `findUser()` to email-only lookup:

```php
public function findUser(): ?User
{
    return User::query()->where('email', $this->string('email')->toString())->first();
}
```

Update `rules()`:
```php
'email' => ['required', 'string', 'email'],
'password' => ['required', 'string'],
```

**File: `resources/js/pages/session/create.tsx`**

- Change `name="identifier"` → `name="email"`
- Change `type="text"` → `type="email"`
- Change `autoComplete="tel"` → `autoComplete="email"`
- Change label: `"Telefone ou e-mail"` → `"E-mail"`
- Change placeholder: `"(31) 99999-0000 ou email@exemplo.com"` → `"email@exemplo.com"`
- Update `AuthLayout` description accordingly

**File: `resources/js/pages/session/create.tsx` (Props)**

Remove `throttledUntil` countdown if it relied on phone identifier (check — actually the throttle is keyed by identifier/IP, so renaming to email just means throttle key changes; keep throttle logic as-is).

**File: `app/Http/Controllers/SessionController.php`**

The `SessionController` reads `identifier` from the request. After renaming the field in `CreateSessionRequest`, the controller doesn't change — it delegates to `$request->validateCredentials()` which uses the renamed field internally.

## Phase 3 — Phone → Profile Onboarding Step

Phone becomes an optional contact field collected during barber profile onboarding (no SMS verification).

**File: `app/Http/Requests/UpdateBarberProfileRequest.php`**

Add optional phone rule:
```php
'phone' => ['nullable', 'string', 'regex:/^\+55\d{10,11}$/'],
```

**File: `app/Http/Controllers/BarberProfileController.php`**

In `update()`, after calling `UpdateBarberProfile`, also save phone to `User`:
```php
if ($request->has('phone')) {
    $user->update(['phone' => $request->string('phone')->value() ?: null]);
}
```

**File: `resources/js/pages/onboarding/profile.tsx`**

Add optional phone `<Input>` below the name field. Use `tel` type, Brazilian mask hint `(31) 99999-0000`, not `required`. Pre-populate from `barber.phone` prop (already passed by controller).

## Phase 4 — Delete Dead Code

**PHP controllers (delete entire files):**
- `app/Http/Controllers/BarberRegistrationController.php`
- `app/Http/Controllers/BarberSmsVerificationController.php`
- `app/Http/Controllers/BarberSmsResendController.php`
- `app/Http/Controllers/BarberPasswordResetController.php`

**PHP requests (delete entire files):**
- `app/Http/Requests/RegisterBarberPhoneRequest.php`

**Frontend pages (delete entire files):**
- `resources/js/pages/onboarding/phone.tsx`
- `resources/js/pages/onboarding/verify.tsx` (if it exists)
- `resources/js/pages/user-password/forgot-phone.tsx`
- `resources/js/pages/user-password/reset-phone.tsx`

**SMS infrastructure (delete if no other callers remain after above removals):**
- `app/Actions/SendSmsVerificationCode.php`
- `app/Actions/VerifySmsCode.php`
- `app/Enums/SmsVerificationPurpose.php`
- `app/Models/SmsVerification.php`
- Any `SmsGateway` contract + implementations
- Verify with `grep -rn "SendSmsVerificationCode\|VerifySmsCode\|SmsVerification\|SmsVerificationPurpose" app/`

> Note: The `sms_verifications` DB table and its migration stay — no need to drop the table.
> The phone/phone_verified_at columns on `users` table stay (used for optional contact field).

**Route imports in `web.php`** — remove unused `use` statements for deleted controllers.

## Phase 5 — Regenerate Wayfinder + Lint

```bash
php artisan wayfinder:generate
vendor/bin/pint --dirty --format agent
vendor/bin/phpstan
```

`@/routes/register` Wayfinder types will update to match new `UserController` routes. `user/create.tsx` already imports `store` from `@/routes/register` — it will work correctly after regeneration.

## Phase 6 — Tests

**Remove / update:**
- Phone registration tests (`BarberRegistrationController`, `BarberSmsVerificationController` tests)
- Phone password reset tests (`BarberPasswordResetController` tests)
- Login tests that test phone-identifier lookup

**Add:**
- `POST /register` with name + email + password → user created, logged in, email verification sent
- `POST /register` with duplicate email → validation error
- `POST /register` with invalid password → validation error
- `POST /login` with email + password → success
- `POST /login` with phone-format string → fails (no longer resolves to user)
- Google callback with new user → user created, redirected to dashboard (then onboarding)
- Google callback with existing email → links google_id, logs in

## Files Changed Summary

| Action | File |
|--------|------|
| Modify | `routes/web.php` |
| Modify | `app/Http/Controllers/UserController.php` |
| Modify | `app/Http/Requests/CreateSessionRequest.php` |
| Modify | `resources/js/pages/session/create.tsx` |
| Modify | `app/Http/Requests/UpdateBarberProfileRequest.php` |
| Modify | `app/Http/Controllers/BarberProfileController.php` |
| Modify | `resources/js/pages/onboarding/profile.tsx` |
| Delete | `app/Http/Controllers/BarberRegistrationController.php` |
| Delete | `app/Http/Controllers/BarberSmsVerificationController.php` |
| Delete | `app/Http/Controllers/BarberSmsResendController.php` |
| Delete | `app/Http/Controllers/BarberPasswordResetController.php` |
| Delete | `app/Http/Requests/RegisterBarberPhoneRequest.php` |
| Delete | `resources/js/pages/onboarding/phone.tsx` |
| Delete | `resources/js/pages/onboarding/verify.tsx` (if exists) |
| Delete | `resources/js/pages/user-password/forgot-phone.tsx` |
| Delete | `resources/js/pages/user-password/reset-phone.tsx` |
| Delete (if unused) | `app/Actions/SendSmsVerificationCode.php` |
| Delete (if unused) | `app/Actions/VerifySmsCode.php` |
| Delete (if unused) | `app/Enums/SmsVerificationPurpose.php` |
| Delete (if unused) | `app/Models/SmsVerification.php` |
| Delete (if unused) | `app/Contracts/SmsGateway.php` + implementations |
