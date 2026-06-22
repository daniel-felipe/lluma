# Implementation Plan: F1 · Barber Onboarding & Profile

**Branch**: `001-barber-onboarding-profile` | **Date**: 2026-04-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-barber-onboarding-profile/spec.md`

## Summary

A barber registers via phone number + SMS verification, creates their professional profile
(name, business name, address, photos, unique public URL slug), and receives a persistent
authenticated session. The profile starts as `draft` and is auto-published when services
(F2) and availability (F3) are also configured. The implementation extends the existing
Laravel Fortify + Inertia/React starter kit with a custom multi-step registration flow,
phone-primary auth, and an onboarding progress middleware.

## Technical Context

**Language/Version**: PHP 8.5 / TypeScript 5  
**Primary Dependencies**: Laravel 13, Inertia.js v3, React, Fortify v1, Pest v5, Tailwind v4, shadcn/ui (New York style)  
**Storage**: SQLite (dev/test), MySQL/PostgreSQL (production) — via Laravel migrations  
**Testing**: Pest v5 with 100% code coverage + PHPStan level max  
**Target Platform**: Mobile-first web app (360 px baseline), responsive up to desktop  
**Project Type**: Multi-step onboarding SPA (Inertia)  
**Performance Goals**: Slug suggestion ≤1 s; session restore ≤2 s; SMS delivery ≤30 s  
**Constraints**: No hardcoded URLs (Wayfinder); TailwindCSS only; no new runtime PHP packages; `progress` shadcn component added (Radix ecosystem)  
**Scale/Scope**: Single-barbershop-per-account; Brazilian phone numbers only

## Constitution Check

*GATE: Must pass before implementation begins. Re-checked after each phase.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clean Code & Actions Architecture | ✅ PASS | All business logic in dedicated Actions (`CreateBarber`, `GenerateBarberSlug`, `SendSmsVerificationCode`, `UpdateBarberProfile`, `VerifySmsCode`). Controllers are thin. |
| II. Mobile-First & Responsive Design | ✅ PASS | All 3 new Inertia pages built from 320 px upward. Onboarding step indicator uses `progress` shadcn component. |
| III. Design System Compliance | ✅ PASS | All UI uses `design/design-system.html` tokens via Tailwind CSS variables. Only shadcn components used. |
| IV. Quality Gates | ✅ PASS | Feature tests + unit tests for every new file. PHPStan typed throughout. Pint enforced. 100% coverage required. |
| V. Inertia-First Frontend | ✅ PASS | All server→client data via Inertia props. Wayfinder for all route references. Inertia v3 flash props for publication banner. |
| VI. Minimal Dependencies | ✅ PASS | Zero new runtime PHP packages. One shadcn UI component added (`progress`, Radix-based). |

**No violations — proceed.**

## Project Structure

### Documentation (this feature)

```text
specs/001-barber-onboarding-profile/
├── plan.md              ← this file
├── research.md          ← Phase 0 decisions
├── data-model.md        ← schema, entities, enums
├── quickstart.md        ← dev guide
├── contracts/
│   └── routes.md        ← HTTP route contracts
├── checklists/
│   └── requirements.md  ← spec quality checklist
└── tasks.md             ← Phase 2 output (task breakdown)
```

### Source Code Layout

```text
app/
├── Actions/
│   ├── CreateBarber.php
│   ├── GenerateBarberSlug.php
│   ├── SendSmsVerificationCode.php
│   ├── UpdateBarberProfile.php
│   └── VerifySmsCode.php
├── Contracts/
│   └── SmsGateway.php
├── Enums/
│   ├── BarberOnboardingStep.php
│   ├── BarberProfileStatus.php
│   └── SmsVerificationPurpose.php
├── Http/
│   ├── Controllers/
│   │   ├── BarberRegistrationController.php
│   │   ├── BarberSmsVerificationController.php
│   │   ├── BarberProfileController.php
│   │   └── SlugAvailabilityController.php
│   ├── Middleware/
│   │   └── EnsureBarberOnboarding.php
│   └── Requests/
│       ├── RegisterBarberPhoneRequest.php
│       ├── VerifySmsCodeRequest.php
│       └── UpdateBarberProfileRequest.php
├── Models/
│   ├── BarberProfile.php          ← new
│   ├── SmsVerification.php        ← new
│   └── User.php                   ← extended
└── Services/
    └── NullSmsGateway.php

config/
└── fortify.php                    ← updated: username=phone, disable Registration

database/
├── migrations/
│   ├── …_add_phone_to_users_table.php
│   ├── …_create_barber_profiles_table.php
│   └── …_create_sms_verifications_table.php
└── factories/
    ├── BarberProfileFactory.php
    └── SmsVerificationFactory.php

resources/js/
├── pages/
│   ├── onboarding/
│   │   ├── phone.tsx
│   │   ├── verify.tsx
│   │   └── profile.tsx
│   └── session/
│       └── create.tsx             ← updated: identifier field
└── components/ui/
    └── progress.tsx               ← new via shadcn

routes/
└── web.php                        ← updated: new routes added

tests/
├── Feature/Controllers/
│   ├── BarberRegistrationControllerTest.php
│   ├── BarberSmsVerificationControllerTest.php
│   ├── BarberProfileControllerTest.php
│   └── SlugAvailabilityControllerTest.php
└── Unit/Actions/
    ├── GenerateBarberSlugTest.php
    └── VerifySmsCodeTest.php
```

**Structure Decision**: Laravel monolith (Option 1 variant). Backend in `app/`, frontend
pages in `resources/js/pages/`. Follows existing project conventions throughout.

---

## Phase 0: Research (Complete)

All decisions documented in [`research.md`](research.md). Key decisions:

1. **Phone auth**: Extend `SessionController` to accept `identifier` (phone or email);
   configure Fortify `username = phone`; disable Fortify Registration feature.
2. **SMS abstraction**: `App\Contracts\SmsGateway` interface; `NullSmsGateway` for
   tests/dev; real provider bound in `AppServiceProvider` via env.
3. **Onboarding step**: Enum stored in `barber_profiles.onboarding_step`; enforced by
   `EnsureBarberOnboarding` middleware.
4. **Slug generation**: `Str::slug()` + uniqueness loop; real-time check via
   `GET /slug/available` (JSON, debounced).
5. **Progressive throttling**: `RateLimiter` with composite key, progressive delay cache
   keys (1 min → 5 min → 15 min).
6. **Photos**: `Storage::fake('public')` in tests; `storePublicly()` in production.
7. **Session lifetime**: `SESSION_LIFETIME=43200` (30 days sliding).
8. **Shadcn component**: `progress` added for step indicator.
9. **Auto-publication**: `PublishBarberProfile` action created here; called from F2/F3.
10. **Fortify registration disabled**: Custom multi-step flow replaces it entirely.

---

## Phase 1: Design & Implementation Notes

### Actions

#### `CreateBarber` (new)

```
Purpose: Create a User with phone as primary identifier.
Input:   string $phone, string $name, SensitiveParameter string $password
Output:  User
Pattern: DB::transaction — create User (phone_verified_at = now())
         fire Registered event
```

#### `SendSmsVerificationCode` (new)

```
Purpose: Generate and store a 6-digit SMS code; dispatch it via SmsGateway.
Input:   string $phone, SmsVerificationPurpose $purpose
Output:  SmsVerification
Pattern: Invalidate previous active codes for phone+purpose (soft: leave them, they expire)
         Generate 6-digit code, hash it, store SmsVerification (expires 10 min)
         Inject SmsGateway via constructor, call send()
```

#### `VerifySmsCode` (new)

```
Purpose: Verify a submitted code against the latest active SmsVerification.
Input:   string $phone, string $code, SmsVerificationPurpose $purpose
Output:  SmsVerification (throws VerificationException on failure)
Exceptions:
  - CodeExpiredException (expires_at < now)
  - CodeExhaustedException (attempt_count >= 5)
  - CodeInvalidException (wrong code — increments attempt_count)
  - NoActiveCodeException (no record found)
```

#### `GenerateBarberSlug` (new)

```
Purpose: Derive a unique URL slug from a business name.
Input:   string $businessName, string|null $currentSlug = null
Output:  string (unique slug)
Pattern: Str::slug($businessName) → check DB → append -N suffix if taken
         Skip current barber's own slug when checking uniqueness
```

#### `UpdateBarberProfile` (new)

```
Purpose: Create or update BarberProfile; advance onboarding step to 'services'.
Input:   User $user, array $profileData, UploadedFile|null $profilePhoto,
         UploadedFile|null $coverPhoto
Output:  BarberProfile
Pattern: DB::transaction
         Store photos if provided (Storage::putPublicly)
         Upsert BarberProfile (updateOrCreate on user_id)
         Set onboarding_step = services (ready for F2)
```

### Controllers

All controllers are `final readonly` with dependency injection via constructor.

#### `BarberRegistrationController`

```
GET  /register  → create(): Inertia 'onboarding/phone'
POST /register  → store(RegisterBarberPhoneRequest):
  - Validate phone (FR-001)
  - Check not already registered
  - Call SendSmsVerificationCode
  - Store phone in session('registration_phone')
  - Redirect to route('register.verify')
```

#### `BarberSmsVerificationController`

```
GET  /register/verify  → create(): Inertia 'onboarding/verify'
                          Read session('registration_phone'), pass masked phone
POST /register/verify  → store(VerifySmsCodeRequest):
  - Call VerifySmsCode
  - Call CreateBarber (name from session or placeholder, updated in profile step)
  - Auth::login($user)
  - Create BarberProfile stub (status=draft, onboarding_step=profile)
  - Clear session('registration_phone')
  - Redirect to route('onboarding.profile.edit')
POST /register/resend  → resend():
  - Check 60s cooldown (last SmsVerification created_at)
  - Call SendSmsVerificationCode
  - Redirect back with status flash
```

#### `BarberProfileController`

```
GET  /onboarding/profile → edit(): Inertia 'onboarding/profile'
                            Props: barber, profile (current values), steps
POST /onboarding/profile → update(UpdateBarberProfileRequest):
  - Call UpdateBarberProfile action
  - Redirect to route('onboarding.services.edit') [F2 placeholder → dashboard for now]
```

#### `SlugAvailabilityController`

```
GET /slug/available → show(): JSON { available: bool, suggestion: string }
  Rate-limited: 30/minute per user
```

### Middleware: `EnsureBarberOnboarding`

Attached to `auth` routes (except `/onboarding/*`, `/logout`, `/settings/*`). Reads
`auth()->user()->barberProfile?->onboarding_step` and redirects to incomplete step.

### Fortify Configuration Changes

```php
// config/fortify.php
'username' => 'phone',

// Features: remove Features::registration()
// Keep: emailVerification (optional), passwords, updateProfileInformation,
//        updatePasswords, twoFactorAuthentication
```

### Session Controller Update

`SessionController@store` updated to:
1. Accept `identifier` field (replaces `email`)
2. Smart lookup: try `User::where('phone', normalizePhone($identifier))` first,
   then `User::where('email', $identifier)`
3. Progressive throttling: check cache key `login_locked_until:{identifier}`
   before authentication attempt

### Login Page Update (`session/create.tsx`)

- Change field `email` → `identifier` (type="text", autocomplete="tel")
- Placeholder: "Telefone ou e-mail"
- No other structural changes to the page

### Frontend Pages

#### `onboarding/phone.tsx`

- `AuthLayout` with title "Criar conta" / description "Digite seu celular"
- Single `Input` (type=tel) for phone
- "Continuar" `Button` (primary)
- Link to login page
- Onboarding step indicator (step 1/3 — not shown on this page, shown after verification)

#### `onboarding/verify.tsx`

- `AuthLayout` with title "Verificar celular"
- Masked phone display
- `InputOtp` (6 slots, existing component) for code entry
- "Verificar" `Button`
- "Reenviar código" link (disabled during cooldown, shows countdown)
- Skeleton while resend cooldown is active

#### `onboarding/profile.tsx`

- `AuthLayout` → full-width layout for multi-field form
- `Progress` component: step 1/3 (profile) at top
- Fields: name, business_name, address_street, address_number, address_neighborhood,
  address_city, address_state (Select), address_cep (optional)
- Slug field: auto-populates from business_name (debounced), shows availability badge
  (available ✓ / unavailable ✗ with suggestion)
- Photo upload for profile_photo and cover_photo
- All fields use shadcn `Input`, `Label`, `Select` components
- "Salvar e continuar" `Button` with `Spinner` while processing

### Route Registration

```php
// routes/web.php — new routes

// Guest-only registration flow
Route::middleware('guest')->group(function () {
    Route::get('register', [BarberRegistrationController::class, 'create'])
        ->name('register');
    Route::post('register', [BarberRegistrationController::class, 'store'])
        ->name('register.store');
    Route::get('register/verify', [BarberSmsVerificationController::class, 'create'])
        ->name('register.verify');
    Route::post('register/verify', [BarberSmsVerificationController::class, 'store'])
        ->name('register.verify.store');
    Route::post('register/resend', [BarberSmsVerificationController::class, 'resend'])
        ->name('register.resend');
});

// Authenticated onboarding
Route::middleware(['auth', EnsureBarberOnboarding::class])->group(function () {
    Route::get('onboarding/profile', [BarberProfileController::class, 'edit'])
        ->withoutMiddleware(EnsureBarberOnboarding::class) // exempt itself
        ->name('onboarding.profile.edit');
    Route::post('onboarding/profile', [BarberProfileController::class, 'update'])
        ->name('onboarding.profile.update');
});

// Slug availability (auth, rate-limited)
Route::middleware('auth')
    ->get('slug/available', [SlugAvailabilityController::class, 'show'])
    ->middleware('throttle:30,1')
    ->name('slug.available');
```

### Test Strategy

Every new PHP file has a corresponding test file. Pattern follows existing project tests.

**Feature tests** (`tests/Feature/Controllers/`):
- Test HTTP behaviour: status codes, redirects, Inertia page/props, DB state after request
- Use `Storage::fake('public')` for photo tests
- Bind `NullSmsGateway` in test setUp
- Use model factories for pre-conditions

**Unit tests** (`tests/Unit/Actions/`):
- Test action logic in isolation
- `GenerateBarberSlugTest`: collision handling, accent stripping, max suffix
- `VerifySmsCodeTest`: expired, exhausted, wrong code, correct code paths

**Coverage gate**: `composer test:unit` must report 100%.

---

## Complexity Tracking

No constitution violations — table not applicable.
