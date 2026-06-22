---

description: "Tasks for F1 · Barber Onboarding & Profile"
---

# Tasks: F1 · Barber Onboarding & Profile

**Input**: Design documents from `/specs/001-barber-onboarding-profile/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/routes.md ✅

**Tests**: Included — 100% coverage required by constitution (user also requested tests explicitly).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths required in all descriptions
- Run `vendor/bin/pint --dirty` after every PHP file created/modified
- Run `php artisan wayfinder:generate` after any controller or route change

---

## Phase 1: Setup (Shared Config & Tooling)

**Purpose**: One-time configuration changes and component additions required before any
user story work can begin.

- [ ] T001 Add shadcn `progress` component via `npx shadcn@latest add progress` — output: `resources/js/components/ui/progress.tsx`
- [ ] T002 Update `config/fortify.php`: set `'username' => 'identifier'` (NOT 'phone' — our custom SessionController uses an 'identifier' field that resolves phone or email; Fortify's rate limiting and 2FA lookup use this key); remove `Features::registration()` from the features array
- [ ] T003 _(superseded by T009a — no action required here; T009a handles NullSmsGateway binding after T009 completes)_
- [ ] T004 Update `config/session.php`: set `'expire_on_close' => false` and `'lifetime' => env('SESSION_LIFETIME', 43200)` directly in the config file; update `.env.example` to add `SESSION_LIFETIME=43200`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Enums, interfaces, models, migrations, and factories that ALL user stories depend on. No US work can begin until this phase is complete.

**⚠️ CRITICAL**: Complete this phase fully before starting Phase 3.

### Enums & Contracts

- [ ] T005 [P] Create `app/Enums/BarberOnboardingStep.php` — cases: `Profile`, `Services`, `Availability`, `Complete`
- [ ] T006 [P] Create `app/Enums/BarberProfileStatus.php` — cases: `Draft`, `Published`
- [ ] T007 [P] Create `app/Enums/SmsVerificationPurpose.php` — cases: `Registration`, `OtpLogin`, `PasswordReset`
- [ ] T008 [P] Create `app/Contracts/SmsGateway.php` — interface with `send(string $phone, string $message): void`
- [ ] T009 [P] Create `app/Services/NullSmsGateway.php` — implements `SmsGateway`; stores sent messages in a static array property for test assertions
- [ ] T009a Bind `SmsGateway` interface to `NullSmsGateway` in `app/Providers/AppServiceProvider.php` — binding MUST be conditional: `if (app()->environment('testing', 'local')) { $this->app->bind(SmsGateway::class, NullSmsGateway::class); }` — real production gateway is bound via a separate env-driven provider or this else-branch; ⚠️ **depends on T008 + T009**

### Migrations

- [ ] T010 Create migration `add_phone_to_users_table` via `php artisan make:migration add_phone_to_users_table --no-interaction` — add nullable unique `phone` string and nullable `phone_verified_at` timestamp to `users`; make `email` nullable; **also make `name` nullable** (`$table->string('name')->nullable()->change()`) — name is collected and populated in US2 (profile step), not during phone registration
- [ ] T011 Create migration `create_sms_verifications_table` via `php artisan make:migration create_sms_verifications_table --no-interaction` — uuid PK, `phone` (string, indexed), `code` (string, hashed), `purpose` (string), `expires_at` (timestamp), `verified_at` (nullable timestamp), `attempt_count` (unsignedSmallInteger, default 0), timestamps; add composite index on `[phone, purpose, verified_at, expires_at]`
- [ ] T012 Create migration `create_barber_profiles_table` via `php artisan make:migration create_barber_profiles_table --no-interaction` — uuid PK, `user_id` (uuid FK → users.id cascade delete, unique), `business_name` (string), `slug` (string, unique), `address_street`, `address_number`, `address_neighborhood`, `address_city`, `address_state` (char 2), `address_cep` (nullable string 9), `profile_photo_url` (nullable string), `cover_photo_url` (nullable string), `status` (string, default `draft`), `onboarding_step` (string, default `profile`), timestamps
- [ ] T013 Run `php artisan migrate` to apply the three new migrations

### Models

- [ ] T014 Extend `app/Models/User.php` — add PHPDoc `@property-read string|null $phone`, `@property-read CarbonInterface|null $phone_verified_at`; add casts for `phone_verified_at`; add `barberProfile(): HasOne` relationship to `BarberProfile`
- [ ] T015 Create `app/Models/SmsVerification.php` via `php artisan make:model SmsVerification --no-interaction` — fill: `HasUuids` trait, PHPDoc for all properties, casts (`purpose → SmsVerificationPurpose`, `expires_at → datetime`, `verified_at → datetime`, `attempt_count → integer`), scopes: `scopeActive()`, `scopeForPhone(string $phone)`, `scopeForPurpose(SmsVerificationPurpose $purpose)`
- [ ] T016 Create `app/Models/BarberProfile.php` via `php artisan make:model BarberProfile --no-interaction` — fill: `HasUuids`, `HasFactory`, PHPDoc for all properties, casts (`status → BarberProfileStatus`, `onboarding_step → BarberOnboardingStep`), `user(): BelongsTo` relationship, scope `scopePublished()`; **also add stub relationships for F2/F3**: `services(): HasMany` (→ `App\Models\Service::class`, defined now so `PublishBarberProfile` can call `->services()->count()` even before F2 adds the table) and `availabilitySlots(): HasMany` (→ `App\Models\AvailabilitySlot::class`, same reason for F3) — both return empty results until F2/F3 create the referenced tables; add a `// F2` and `// F3` comment on each stub

### Factories

- [ ] T017 [P] Create `database/factories/SmsVerificationFactory.php` via `php artisan make:factory SmsVerificationFactory --no-interaction` — fill: default state (registration purpose, code hashed from `123456`, expires 10 min from now); states: `expired()`, `verified()`, `exhausted()` (attempt_count=5), `forRegistration()`, `forPasswordReset()`
- [ ] T018 [P] Create `database/factories/BarberProfileFactory.php` via `php artisan make:factory BarberProfileFactory --no-interaction` — fill: realistic fake data (business_name, slug derived from name, full address); states: `published()` (status=Published, onboarding_step=Complete), `draft()` (default), `withPhotos()`
- [ ] T019 Update `database/factories/UserFactory.php` — add `phone` field (formatted as `+55` + 11-digit number) and `phone_verified_at` (nullable, null by default); add state `phoneVerified()` that sets `phone_verified_at = now()`

**Checkpoint**: Run `vendor/bin/pint --dirty` and `php artisan test:types` — both MUST pass before Phase 3 begins.

---

## Phase 3: User Story 1 — Phone Registration & SMS Verification (Priority: P1) 🎯 MVP

**Goal**: A new barber registers with their phone, receives and enters an SMS code, and
gains an authenticated account — all within the registration sub-flow.

**Independent Test**: Register with a phone number → assert `sms_verifications` record
created → submit correct code → assert `users` record with `phone_verified_at` set →
assert authenticated session and redirect to profile step.

### Tests for User Story 1 ⚠️ Write FIRST — ensure they FAIL before implementing

- [ ] T020 [P] [US1] Create `tests/Feature/Controllers/BarberRegistrationControllerTest.php` via `php artisan make:test --pest BarberRegistrationControllerTest --no-interaction` — cover: GET /register renders `onboarding/phone` page; POST /register with valid phone creates SmsVerification and redirects; POST /register with already-registered phone returns error; POST /register with invalid phone format returns validation error; rate-limit (429) after 5 attempts/minute
- [ ] T021 [P] [US1] Create `tests/Feature/Controllers/BarberSmsVerificationControllerTest.php` via `php artisan make:test --pest BarberSmsVerificationControllerTest --no-interaction` — cover: GET /register/verify renders `onboarding/verify` with masked phone; POST /register/verify with correct code creates User, creates BarberProfile (draft, onboarding_step=profile), logs in, redirects to `onboarding.profile.edit`; POST with wrong code increments attempt_count and returns error; POST with expired code returns error; POST with exhausted record returns error; POST /register/resend within cooldown returns 429; POST /register/resend after cooldown creates new SmsVerification
- [ ] T022 [P] [US1] Create `tests/Unit/Actions/VerifySmsCodeTest.php` via `php artisan make:test --pest --unit VerifySmsCodeTest --no-interaction` — cover: correct code marks verified_at; wrong code increments attempt_count and throws CodeInvalidException; expired code throws CodeExpiredException; exhausted code throws CodeExhaustedException; no active code throws NoActiveCodeException
- [ ] T023 [P] [US1] Create `tests/Unit/Actions/SendSmsVerificationCodeTest.php` via `php artisan make:test --pest --unit SendSmsVerificationCodeTest --no-interaction` — cover: creates SmsVerification with hashed code expiring in 10 min; calls SmsGateway::send() with correct phone and message containing the 6-digit code; returns SmsVerification model

### Implementation for User Story 1

- [ ] T024 [P] [US1] Create `app/Actions/SendSmsVerificationCode.php` via `php artisan make:action "SendSmsVerificationCode" --no-interaction` — constructor injects `SmsGateway`; `run(string $phone, SmsVerificationPurpose $purpose): SmsVerification` — generates random 6-digit code, hashes it, creates `SmsVerification`, calls `$this->smsGateway->send()`
- [ ] T025 [P] [US1] Create `app/Actions/VerifySmsCode.php` via `php artisan make:action "VerifySmsCode" --no-interaction` — `run(string $phone, string $code, SmsVerificationPurpose $purpose): SmsVerification` — finds latest active record, checks attempt_count, checks expiry, verifies hashed code with `Hash::check()`, increments attempt_count on failure, sets `verified_at` on success; throws typed exceptions: `CodeExpiredException`, `CodeExhaustedException`, `CodeInvalidException`, `NoActiveCodeException` (create these in `app/Exceptions/Sms/`)
- [ ] T071 [P] [US1] Create `app/Actions/InitializeBarberProfile.php` via `php artisan make:action "InitializeBarberProfile" --no-interaction` — `run(User $user): BarberProfile` — creates `BarberProfile` stub for the user (`status=Draft`, `onboarding_step=Profile`, `slug=(string) $user->id` — use the user's UUID as a guaranteed-unique placeholder; ⚠️ do NOT use `''` empty string — the `slug` column has a UNIQUE constraint and concurrent registrations would collide) using `firstOrCreate(['user_id' => $user->id], [...])` to be idempotent (safe to call multiple times); enforces 1:1 relationship; the real slug is set during US2 (T042); ⚠️ this action replaces direct BarberProfile creation in the controller (constitution fix for C3)
- [ ] T072 [P] [US1] Create `tests/Unit/Actions/InitializeBarberProfileTest.php` via `php artisan make:test --pest --unit InitializeBarberProfileTest --no-interaction` — cover: creates BarberProfile with correct default values (status=Draft, onboarding_step=Profile); slug placeholder equals user UUID (not empty string); idempotent — calling twice for same user does not create duplicate row; returns existing BarberProfile if already initialized; enforces 1:1 (second user gets own BarberProfile); no UNIQUE constraint collision when two users initialize concurrently (each gets their own UUID as slug)
- [ ] T026 [US1] Create `app/Actions/CreateBarber.php` via `php artisan make:action "CreateBarber" --no-interaction` — `run(string $phone, #[SensitiveParameter] string $password): User` — `DB::transaction`: creates User (`phone`, `phone_verified_at=now()`, `name=null` (populated in US2 profile step), `password`), fires `Registered` event, returns User; ⚠️ `name` must be nullable in `users` table (see T010)
- [ ] T027 [US1] Create `app/Http/Requests/RegisterBarberPhoneRequest.php` via `php artisan make:request RegisterBarberPhoneRequest --no-interaction` — validates `phone` required, matches Brazilian format regex, normalises to E.164 before storing in session
- [ ] T028 [US1] Create `app/Http/Requests/VerifySmsCodeRequest.php` via `php artisan make:request VerifySmsCodeRequest --no-interaction` — validates: `code` required, numeric, exactly 6 digits; `password` required, string, min:8, confirmed (must match `password_confirmation`); ⚠️ password collection is part of the verification step (FR-005)
- [ ] T029 [US1] Create `app/Http/Controllers/BarberRegistrationController.php` via `php artisan make:controller BarberRegistrationController --no-interaction` — `final readonly`; constructor injects `SendSmsVerificationCode`; `create(Request): Response` returns Inertia `onboarding/phone`; `store(RegisterBarberPhoneRequest): RedirectResponse` calls action, stores phone in session, redirects to `register.verify`; rate-limit: `throttle:5,1` on store
- [ ] T030 [US1] Create `app/Http/Controllers/BarberSmsVerificationController.php` via `php artisan make:controller BarberSmsVerificationController --no-interaction` — `final readonly`; constructor injects `VerifySmsCode`, `CreateBarber`, `SendSmsVerificationCode`, `InitializeBarberProfile`; `create(Request): Response` returns Inertia `onboarding/verify` with masked phone from session; `store(VerifySmsCodeRequest): RedirectResponse` — calls `VerifySmsCode`, calls `CreateBarber($phone, $request->password)`, calls `Auth::login($user)`, calls `InitializeBarberProfile($user)` (action creates the BarberProfile stub — ⚠️ must NOT create BarberProfile directly in this controller per Actions Architecture), clears session, redirects to `onboarding.profile.edit`; `resend(Request): RedirectResponse` enforces 60 s cooldown, calls `SendSmsVerificationCode`
- [ ] T031 [US1] Register guest routes in `routes/web.php`: `GET /register → BarberRegistrationController@create (name: register)`, `POST /register → @store (name: register.store, throttle:5,1)`, `GET /register/verify → BarberSmsVerificationController@create (name: register.verify)`, `POST /register/verify → @store (name: register.verify.store)`, `POST /register/resend → @resend (name: register.resend, throttle:1,1)`; all wrapped in `Route::middleware('guest')`
- [ ] T032 [US1] Create `resources/js/pages/onboarding/phone.tsx` — mobile-first (360 px base); `AuthLayout` with "Criar conta" title; phone `Input` (type=tel) for `phone` field; "Continuar" `Button` with `Spinner`; "Já tem conta?" `TextLink` to login; use `store` Wayfinder import from `@/routes/register`; `Form` from `@inertiajs/react` (Inertia v3); `InputError` for phone validation error; follow `design/design-system.html` tokens
- [ ] T033 [US1] Create `resources/js/pages/onboarding/verify.tsx` — `AuthLayout` with "Verificar celular" title; masked phone display; `InputOtp` (6 slots, `@/components/ui/input-otp`) for the `code` field; `PasswordInput` (`@/components/password-input`) for `password` field (label "Criar senha"); `Input` (type=password) for `password_confirmation` (label "Confirmar senha"); "Verificar e entrar" `Button` with `Spinner`; "Reenviar código" link (disabled with countdown when `resendAvailableAt` prop set); Wayfinder imports from `@/routes/register`; `InputError` for code and password errors; `Skeleton` for loading state; mobile-first; ⚠️ password + confirmation are required here (FR-005)
- [ ] T034 [US1] Run `php artisan wayfinder:generate` to generate typed route functions for new routes
- [ ] T035 [US1] Run `vendor/bin/pint --dirty` on all new/modified PHP files
- [ ] T036 [US1] Run US1 tests: `php artisan test --compact --filter="BarberRegistrationController|BarberSmsVerification|VerifySmsCode|SendSmsVerificationCode|InitializeBarberProfile"` — all MUST pass

**Checkpoint**: At this point, a barber can register via phone, receive (logged) SMS, verify code, and gain an authenticated session. US1 is independently functional.

---

## Phase 4: User Story 2 — Profile Creation & Public URL (Priority: P2)

**Goal**: The verified barber fills in their professional profile (name, business name,
address, photos, slug) and it is saved as `draft`. The slug is auto-suggested from the
business name and validated for uniqueness in real time.

**Independent Test**: Authenticate as a verified barber with BarberProfile in `profile`
step → POST `/onboarding/profile` with valid data → assert `barber_profiles` row updated
with correct fields and `onboarding_step = services` → assert redirect to next step.

### Tests for User Story 2 ⚠️ Write FIRST — ensure they FAIL before implementing

- [ ] T037 [P] [US2] Create `tests/Feature/Controllers/BarberProfileControllerTest.php` via `php artisan make:test --pest BarberProfileControllerTest --no-interaction` — cover: GET /onboarding/profile renders `onboarding/profile` with correct props; POST /onboarding/profile with valid data updates BarberProfile, advances onboarding_step to services, redirects; POST with missing required fields returns validation errors; POST with duplicate slug returns slug error; POST with photo > 5MB returns photo error; POST with invalid photo MIME type returns error; unauthenticated request redirects to login; EnsureBarberOnboarding middleware redirects barbers at wrong step
- [ ] T038 [P] [US2] Create `tests/Feature/Controllers/SlugAvailabilityControllerTest.php` via `php artisan make:test --pest SlugAvailabilityControllerTest --no-interaction` — cover: GET /slug/available?slug=free-slug returns `{available:true, suggestion:'free-slug'}`; GET with taken slug returns `{available:false, suggestion:'taken-slug-2'}`; GET with barber's own slug (except param) returns available; unauthenticated returns 401; rate-limit (429) after 30 requests/minute
- [ ] T039 [P] [US2] Create `tests/Unit/Actions/GenerateBarberSlugTest.php` via `php artisan make:test --pest --unit GenerateBarberSlugTest --no-interaction` — cover: "Barbearia do Lucas" → `barbearia-do-lucas`; accent stripping ("João" → `joao`); collision appends `-2`, `-3`; skips own slug when except provided; max 50 chars; all-hyphen edge case
- [ ] T040 [P] [US2] Create `tests/Unit/Actions/UpdateBarberProfileTest.php` via `php artisan make:test --pest --unit UpdateBarberProfileTest --no-interaction` — cover: creates BarberProfile on first call; updates on second call (upsert); stores profile photo path; stores cover photo path; sets onboarding_step to services; uses DB::transaction (rolls back on exception)

### Implementation for User Story 2

- [ ] T041 [P] [US2] Create `app/Actions/GenerateBarberSlug.php` via `php artisan make:action "GenerateBarberSlug" --no-interaction` — `run(string $businessName, ?string $exceptSlug = null): string` — `Str::slug($businessName)`, trim to 47 chars, check `barber_profiles` uniqueness, append `-N` suffix until unique; skip `$exceptSlug` when checking
- [ ] T042 [P] [US2] Create `app/Actions/UpdateBarberProfile.php` via `php artisan make:action "UpdateBarberProfile" --no-interaction` — constructor injects `GenerateBarberSlug`; `run(User $user, array $data, ?UploadedFile $profilePhoto, ?UploadedFile $coverPhoto): BarberProfile` — `DB::transaction`: store photos with `$profilePhoto->storePublicly('barbers/photos', 'public')` (UploadedFile method, NOT `Storage::putPublicly`); `updateOrCreate(['user_id' => $user->id], [...])` including `users.name` update; set `onboarding_step = BarberOnboardingStep::Services`
- [ ] T043 [US2] Create `app/Http/Requests/UpdateBarberProfileRequest.php` via `php artisan make:request UpdateBarberProfileRequest --no-interaction` — validates: `name` required string; `business_name` required string max:100; `slug` required regex:`/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/` unique:`barber_profiles,slug,{barber_profile_id}`; `address_street/number/neighborhood/city` required strings; `address_state` required size:2 alpha; `address_cep` nullable regex for CEP; `profile_photo` nullable image mimes:jpeg,png,webp max:5120; `cover_photo` nullable image mimes:jpeg,png,webp max:5120
- [ ] T044 [US2] Create `app/Http/Middleware/EnsureBarberOnboarding.php` via `php artisan make:middleware EnsureBarberOnboarding --no-interaction` — reads `auth()->user()->barberProfile?->onboarding_step`; if null → redirect to `onboarding.profile.edit`; maps step to route; skips if route is an onboarding route, logout, or settings
- [ ] T045 [US2] Create `app/Http/Controllers/BarberProfileController.php` via `php artisan make:controller BarberProfileController --no-interaction` — `final readonly`; constructor injects `UpdateBarberProfile`; `edit(Request): Response` returns Inertia `onboarding/profile` with props (barber, profile, steps array); `update(UpdateBarberProfileRequest): RedirectResponse` calls action, redirects to next onboarding route (dashboard as placeholder for now)
- [ ] T046 [US2] Create `app/Http/Controllers/SlugAvailabilityController.php` via `php artisan make:controller SlugAvailabilityController --no-interaction` — `final readonly`; constructor injects `GenerateBarberSlug`; `show(Request): JsonResponse` — validates `slug` query param, checks uniqueness, returns `{available, suggestion}` JSON
- [ ] T047 [US2] Register `EnsureBarberOnboarding` middleware alias in `bootstrap/app.php` (Laravel 13 — no `Kernel.php`): `->withMiddleware(fn (Middleware $m) => $m->alias(['onboarding' => EnsureBarberOnboarding::class]))`
- [ ] T048 [US2] Add onboarding and slug routes to `routes/web.php`: `GET /onboarding/profile → BarberProfileController@edit (name: onboarding.profile.edit, middleware: auth)`, `POST /onboarding/profile → @update (name: onboarding.profile.update, middleware: auth)`, `GET /slug/available → SlugAvailabilityController@show (name: slug.available, middleware: auth, throttle:30,1)`
- [ ] T049 [US2] Create `resources/js/pages/onboarding/profile.tsx` — mobile-first (360 px base); `AuthLayout` or onboarding-specific layout; `Progress` component (step 1 of 3, value=33); fields: name, business_name, slug (with availability indicator — async fetch to `slug.available` with 400 ms debounce), address_street, address_number, address_neighborhood, address_city, address_state (`Select`), address_cep; photo upload areas for profile_photo and cover_photo (accept image/*, max 5MB client-side hint); shadcn `Input`, `Label`, `Select`, `Button`, `Spinner`, `InputError`; Wayfinder imports from `@/routes/onboarding`; follow `design/design-system.html` tokens; multipart form
- [ ] T050 [US2] Run `php artisan wayfinder:generate` to update typed route functions
- [ ] T051 [US2] Run `vendor/bin/pint --dirty` on all new/modified PHP files
- [ ] T052 [US2] Run US2 tests: `php artisan test --compact --filter="BarberProfileController|SlugAvailability|GenerateBarberSlug|UpdateBarberProfile|PublishBarberProfile"` — all MUST pass

### Auto-Publication Action (F1 Deliverable for F2/F3 Callers)

- [ ] T073 [P] [US2] Create `app/Actions/PublishBarberProfile.php` via `php artisan make:action "PublishBarberProfile" --no-interaction` — `run(User $user): BarberProfile` — checks: (1) `barberProfile` exists and status is `Draft`; (2) barber has ≥1 active service (F2 dependency — check `services()->count() > 0`); (3) barber has ≥1 availability slot (F3 dependency — check `availabilitySlots()->count() > 0`); if all pass → `DB::transaction`: set `status = Published`, `onboarding_step = Complete`; returns updated `BarberProfile`; returns unchanged profile if conditions not yet met (non-throwing — callers check return status); ⚠️ this action is called by F2 and F3 controllers, not here — created in F1 so F2/F3 can depend on it
- [ ] T074 [P] [US2] Create `tests/Unit/Actions/PublishBarberProfileTest.php` via `php artisan make:test --pest --unit PublishBarberProfileTest --no-interaction` — cover: returns Draft profile unchanged when services count = 0; returns Draft profile unchanged when availability count = 0; publishes profile (status=Published, onboarding_step=Complete) when both conditions met; idempotent — calling on already-Published profile returns it unchanged; wrapped in DB::transaction (rollback tested)

**Checkpoint**: At this point, barber can create their profile, slug is auto-suggested and validated, photos upload correctly, and onboarding_step advances to services. `PublishBarberProfile` action is ready for F2/F3 to consume. US2 is independently functional.

---

## Phase 5: User Story 3 — Login & Session Persistence (Priority: P3)

> **Scope note — FR-011 OTP Login**: FR-011 requires both phone+password login AND phone+SMS OTP login as alternatives. **OTP login is explicitly deferred to a post-F1 sprint** — the infrastructure (SendSmsVerificationCode, VerifySmsCode, SmsVerificationPurpose::OtpLogin enum) is already built in F1. F1 delivers only phone+password login. A future sprint will add `GET /login/otp`, `POST /login/otp`, and `resources/js/pages/session/otp.tsx` reusing the existing actions.

**Goal**: Returning barbers log in with phone or email identifier plus password. Progressive
throttling after 10 failures. Sessions persist 30 days (sliding). SMS-based password
recovery flow.

**Independent Test**: Create verified barber → close session → reopen app → assert no
login prompt (session persists) OR → log in with `identifier` = phone → assert
authenticated. Test progressive throttling: 10 failures → assert 429 with delay info.

### Tests for User Story 3 ⚠️ Write FIRST — ensure they FAIL before implementing

- [ ] T053 [P] [US3] Update `tests/Feature/Controllers/SessionControllerTest.php` — add/update tests: login with phone `identifier` (authenticated successfully); login with email `identifier` (authenticated successfully); login with unknown identifier (generic error, no info leak about whether phone/email exists); login with wrong password (generic error); progressive throttling — 10 wrong attempts → response includes `throttledUntil` prop with delay timestamp; logout destroys session and redirects to login; barber with active session accessing `/login` is redirected to dashboard (session persists); **⚠️ add FR-016 resume scenario**: barber who completed phone verification but never saved profile logs in → assert redirect to `onboarding.profile.edit` (EnsureBarberOnboarding middleware fires)
- [ ] T054 [P] [US3] **Update existing** `tests/Feature/Controllers/UserPasswordControllerTest.php` (do NOT use `make:test` — file already exists) — add SMS recovery test scenarios alongside existing email tests: POST `/forgot-password` with registered phone number sends `SmsVerification` (purpose=PasswordReset); POST `/forgot-password` with unregistered phone returns same generic success response (no information leak); POST `/reset-password` with correct SMS code + new password updates password and invalidates the code; POST `/reset-password` with expired SMS code returns validation error; POST `/reset-password` with exhausted SMS code returns validation error

### Implementation for User Story 3

- [ ] T055 [US3] Update `app/Http/Requests/CreateSessionRequest.php` — change `email` validation to `identifier` (required string); add `findUser()` method: normalize as phone first (try `User::where('phone', normalizePhone($identifier))`), then as email (`User::where('email', $identifier)`); update `validateCredentials()` to use `findUser()`
- [ ] T056 [US3] Update `app/Http/Controllers/SessionController.php` `store()` method — check progressive throttle cache key `login_locked_until:{identifier}` before auth; after 10 cumulative failures store cache key with progressive durations (60 s → 300 s → 900 s); reset counter on successful login; on throttle hit return Inertia back with `throttledUntil` prop; wire `identifier` field through the Fortify login flow
- [ ] T057 [US3] Update `resources/js/pages/session/create.tsx` — rename `email` field to `identifier`; update type, label ("Telefone ou e-mail"), `autoComplete="tel"`, placeholder "(31) 99999-0000 ou email"; show inline message with countdown when `throttledUntil` prop is present; import Wayfinder routes from `@/routes/login`
- [ ] T058 [US3] Create `app/Http/Controllers/BarberPasswordResetController.php` via `php artisan make:controller BarberPasswordResetController --no-interaction` — separate from the existing email-based `UserPasswordController` (Fortify-managed, do NOT modify); `final readonly`; constructor injects `SendSmsVerificationCode`, `VerifySmsCode`, `UpdateUserPassword`; methods: `create(Request): Response` → Inertia `user-password/forgot-phone`; `store(Request): RedirectResponse` — validates `identifier` (phone or email), finds user, sends SmsVerification (purpose=PasswordReset), redirects to verify step; `edit(Request): Response` → Inertia `user-password/reset-phone`; `update(Request): RedirectResponse` — validates `phone`, `code`, `password`, `password_confirmation`, calls `VerifySmsCode` then `UpdateUserPassword`; register these routes in `routes/web.php` with `guest` middleware
- [ ] T059 [US3] Update password recovery Inertia pages (`resources/js/pages/user-password/`) to accept phone input alongside email for the forgot-password form; show appropriate instructions
- [ ] T060 [US3] Run `vendor/bin/pint --dirty` on all modified PHP files
- [ ] T061 [US3] Run `php artisan wayfinder:generate`
- [ ] T062 [US3] Run US3 tests: `php artisan test --compact --filter="SessionController|UserPasswordController|BarberPasswordReset"` — all MUST pass

**Checkpoint**: Returning barbers authenticate via phone or email. Sessions last 30 days. Progressive throttling protects against brute force. Password recovery works via SMS. US3 is independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, coverage enforcement, type checking, and design review.

- [ ] T063 Run full test suite with 100% coverage gate: `composer test:unit` — MUST report 100% code coverage; fix any coverage gap before proceeding to T064 (sequential: failures require code fixes)
- [ ] T064 [P] Run PHPStan at max level: `composer test:types` — MUST pass with zero errors; fix all type issues (can run in parallel with T065)
- [ ] T065 [P] Run Pint on all project PHP files: `vendor/bin/pint --dirty` — MUST report zero violations (can run in parallel with T064)
- [ ] T066 Run type coverage check: `composer test:type-coverage` — MUST pass at 100%; run after T063 passes (sequential: depends on same codebase correctness)
- [ ] T067 Run final Wayfinder generation: `php artisan wayfinder:generate` — verify all new route functions are generated and TypeScript compiles
- [ ] T068 Verify mobile viewport (320 px) on all 3 new Inertia pages (`onboarding/phone`, `onboarding/verify`, `onboarding/profile`) — check no horizontal overflow, touch targets ≥44px, readable typography
- [ ] T069 Cross-check all new UI components against `design/design-system.html` — verify colours, typography, spacing, and button styles match design tokens
- [ ] T070 Run `npm run build` to verify frontend compiles without errors and no missing Vite manifest entries

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational complete
- **US2 (Phase 4)**: Depends on Foundational complete; US2 can start in parallel with US1 after Phase 2 (models/factories shared)
- **US3 (Phase 5)**: Depends on Foundational complete; can start after Phase 2 in parallel
- **Polish (Phase 6)**: Depends on all US phases complete

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational — no dependency on US2 or US3
- **US2 (P2)**: Independent after Foundational — uses same User/BarberProfile models
- **US3 (P3)**: Independent after Foundational — adapts existing SessionController

### Within Each User Story

- Tests MUST be written and confirmed FAILING before implementation starts
- Actions before Controllers (controllers depend on actions)
- Form Requests before Controllers (controllers depend on requests)
- Models/Migrations before all (foundational phase handles this)
- Pint + wayfinder:generate after each implementation batch
- Story tests pass before moving to next story

### Parallel Opportunities

- T005–T009 (enums, contracts, services) — all in parallel; T009a depends on T008+T009
- T017–T018 (factories) — in parallel with each other
- T020–T023, T071–T072 (US1 tests) — all in parallel
- T024–T025, T071 (US1 actions) — T024 and T025 and T071 in parallel with each other
- T037–T040, T073–T074 (US2 tests + PublishBarberProfile) — all in parallel
- T041–T042, T073 (US2 actions) — T041, T042, T073 in parallel with each other
- T053–T054 (US3 tests) — in parallel with each other
- T063 → T064+T065 in parallel → T066 (sequential coverage gates; T064/T065 parallel with each other)

---

## Parallel Example: User Story 1

```bash
# Launch all US1 tests simultaneously (write first, all should FAIL):
Task: T020 — BarberRegistrationControllerTest.php
Task: T021 — BarberSmsVerificationControllerTest.php
Task: T022 — VerifySmsCodeTest.php (unit)
Task: T023 — SendSmsVerificationCodeTest.php (unit)
Task: T072 — InitializeBarberProfileTest.php (unit)

# Then launch actions in parallel (implement until tests pass):
Task: T024 — SendSmsVerificationCode action
Task: T025 — VerifySmsCode action
Task: T071 — InitializeBarberProfile action
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T019) — CRITICAL blocker
3. Complete Phase 3: US1 (T020–T036)
4. **STOP and VALIDATE**: A barber can register via phone, verify SMS code, and get an authenticated session → test independently
5. Demo / hand off for F2 integration if needed

### Incremental Delivery

1. Setup + Foundational → shared infrastructure ready
2. US1 → barbers can register and verify → independently testable ✅
3. US2 → barbers can create profiles with slugs → independently testable ✅
4. US3 → returning barbers log in; sessions persist → independently testable ✅
5. Polish → all quality gates pass → ready for F2 hand-off

### Parallel Team Strategy

With two developers:
- Dev A: US1 (T020–T036) — registration + SMS flow
- Dev B: US2 (T037–T052) — profile + slug (both unblock after Phase 2)
- US3 (T053–T062) sequentially or as third track after US1 complete (shares SessionController)

---

## Notes

- `[P]` tasks use different files with no cross-task dependencies — safe to run concurrently
- All `php artisan make:*` commands scaffold the file; implementation content is filled in immediately after
- `vendor/bin/pint --dirty` must be run after EVERY PHP file creation or modification
- `php artisan wayfinder:generate` must run after EVERY route or controller change
- `composer test:unit` must report 100% coverage before any PR is opened
- Never hardcode route URLs in TypeScript — import from `@/routes/*` (Wayfinder)
- All shadcn components installed via `npx shadcn@latest add <component>` — do not hand-write Radix wrappers
- Verify tests FAIL before implementing — Red → Green → Refactor
