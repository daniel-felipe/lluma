# Quickstart: F1 · Barber Onboarding & Profile

**Branch**: `001-barber-onboarding-profile`
**Date**: 2026-04-06

---

## Prerequisites

- PHP 8.5+ with Xdebug (for coverage)
- Composer dependencies installed: `composer install`
- Node dependencies installed: `npm install`
- Database migrated and seeded: `php artisan migrate`
- Shadcn `progress` component added: `npx shadcn@latest add progress`

---

## Running the Feature Tests

```bash
# Run only this feature's tests
php artisan test --compact --filter=BarberRegistration
php artisan test --compact --filter=BarberSmsVerification
php artisan test --compact --filter=BarberProfile
php artisan test --compact --filter=SlugAvailability

# Run all tests with coverage (must always be 100%)
composer test:unit

# Run static analysis (must pass)
composer test:types

# Run code style check and fix
vendor/bin/pint --dirty
```

---

## Manual Registration Flow (dev)

1. Start the dev server: `composer dev`
2. Open `http://localhost` — you see the welcome page
3. Click "Criar agora" or navigate to `/register`
4. Enter a Brazilian phone number (e.g., `(31) 99999-0000`)
5. In tests/dev, the SMS code is logged to `storage/logs/laravel.log` (NullSmsGateway)
   - Search for: `[SMS to +5531999990000]`
6. Enter the 6-digit code on the verification screen
7. Set your password
8. Fill in the profile form — notice the real-time slug suggestion
9. Save → redirected to services step (F2 placeholder)

---

## Seeding a Verified Barber (for F2/F3 development)

```bash
php artisan tinker --execute '
$user = \App\Models\User::factory()->create([
    "phone" => "+5531999990000",
    "phone_verified_at" => now(),
]);
\App\Models\BarberProfile::factory()
    ->for($user)
    ->draft()
    ->create(["onboarding_step" => \App\Enums\BarberOnboardingStep::Services]);
echo "User ID: " . $user->id . "\n";
'
```

---

## Key Files Added / Changed in This Feature

### New files

| File | Purpose |
|------|---------|
| `app/Actions/CreateBarber.php` | Creates User with phone identifier |
| `app/Actions/GenerateBarberSlug.php` | Generates unique URL slug |
| `app/Actions/SendSmsVerificationCode.php` | Creates SmsVerification, dispatches SMS |
| `app/Actions/UpdateBarberProfile.php` | Upserts BarberProfile record |
| `app/Actions/VerifySmsCode.php` | Verifies 6-digit code, marks verified |
| `app/Contracts/SmsGateway.php` | SMS gateway interface |
| `app/Enums/BarberOnboardingStep.php` | Onboarding step enum |
| `app/Enums/BarberProfileStatus.php` | Draft / published enum |
| `app/Enums/SmsVerificationPurpose.php` | SMS purpose enum |
| `app/Http/Controllers/BarberRegistrationController.php` | Phone entry (GET/POST /register) |
| `app/Http/Controllers/BarberSmsVerificationController.php` | Code verify + resend |
| `app/Http/Controllers/BarberProfileController.php` | Profile create/update |
| `app/Http/Controllers/SlugAvailabilityController.php` | JSON slug check |
| `app/Http/Middleware/EnsureBarberOnboarding.php` | Step enforcement |
| `app/Http/Requests/RegisterBarberPhoneRequest.php` | Phone validation |
| `app/Http/Requests/VerifySmsCodeRequest.php` | Code validation |
| `app/Http/Requests/UpdateBarberProfileRequest.php` | Profile form validation |
| `app/Models/BarberProfile.php` | BarberProfile Eloquent model |
| `app/Models/SmsVerification.php` | SmsVerification Eloquent model |
| `app/Services/NullSmsGateway.php` | Test/dev SMS stub (logs to array) |
| `database/migrations/…_add_phone_to_users_table.php` | Extends users table |
| `database/migrations/…_create_barber_profiles_table.php` | BarberProfile table |
| `database/migrations/…_create_sms_verifications_table.php` | SmsVerification table |
| `database/factories/BarberProfileFactory.php` | Factory with states |
| `database/factories/SmsVerificationFactory.php` | Factory with states |
| `resources/js/pages/onboarding/phone.tsx` | Step 1: phone entry |
| `resources/js/pages/onboarding/verify.tsx` | Step 2: SMS code entry |
| `resources/js/pages/onboarding/profile.tsx` | Step 3: profile creation |
| `resources/js/components/ui/progress.tsx` | Shadcn progress bar |
| `tests/Feature/Controllers/BarberRegistrationControllerTest.php` | |
| `tests/Feature/Controllers/BarberSmsVerificationControllerTest.php` | |
| `tests/Feature/Controllers/BarberProfileControllerTest.php` | |
| `tests/Feature/Controllers/SlugAvailabilityControllerTest.php` | |
| `tests/Unit/Actions/GenerateBarberSlugTest.php` | |
| `tests/Unit/Actions/VerifySmsCodeTest.php` | |

### Modified files

| File | Change |
|------|--------|
| `config/fortify.php` | `username → phone`; disable Registration feature |
| `app/Models/User.php` | Add phone, phone_verified_at; barberProfile() relationship |
| `app/Http/Controllers/SessionController.php` | Accept `identifier` field (phone or email) |
| `resources/js/pages/session/create.tsx` | Phone/email `identifier` field |
| `routes/web.php` | Register new routes |

---

## Constitution Check (quick reference)

- [x] Mobile-first UI: Onboarding pages start at 320 px
- [x] Design system: All components follow `design/design-system.html`
- [x] TailwindCSS only: No inline styles
- [x] Inertia props for all server→client data
- [x] Wayfinder: All route calls via `@/routes/*`
- [x] Actions pattern: Each business operation in a dedicated action
- [x] 100% test coverage: All new code covered
- [x] PHPStan: All new code fully typed
- [x] Pint: Code style enforced on every PHP file
- [x] Minimal deps: Only `progress` shadcn component added (Radix-based, already in ecosystem)
