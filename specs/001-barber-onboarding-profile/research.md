# Research: F1 · Barber Onboarding & Profile

**Branch**: `001-barber-onboarding-profile`
**Date**: 2026-04-06

---

## Decision 1: Phone Authentication Strategy with Fortify

**Decision**: Extend Fortify's session controller with a smart `identifier` field that
accepts both phone number and email, with phone as the primary lookup key.

**Rationale**: The spec requires phone as primary identifier but email as a login fallback
(wireframe: "Telefone ou e-mail" label). Fortify's username mechanism is configurable.
Setting `'username' => 'phone'` and extending `CreateSessionRequest` with a custom `findUser()`
that checks phone first, then email, gives us the exact UX required with minimal Fortify
wrestling. Fortify's registration feature is disabled; our custom multi-step controller
handles registration entirely.

**Alternatives considered**:
- Full Sanctum replacement: Too much from-scratch work; Fortify's session management is
  already wired and tested in the project.
- Two separate fields (phone AND email) in login form: Adds friction; single `identifier`
  field is cleaner and matches the wireframe annotation.

---

## Decision 2: SMS Abstraction Layer

**Decision**: Create `App\Contracts\SmsGateway` interface with a `send(string $phone, string $message): void` method. Bind `NullSmsGateway` (logs to array) in tests via `AppServiceProvider`; real gateway implementation is wired via env-driven provider binding.

**Rationale**: The spec states the SMS gateway is provisioned at the infrastructure level.
The interface + null-object pattern keeps the feature fully testable without any real SMS
provider dependency. In production, binding is swapped to the actual provider (e.g., Twilio,
AWS SNS, Vonage) without changing application code.

**Alternatives considered**:
- Laravel Notifications with a custom channel: Also valid, but the interface approach is
  more explicit and easier to mock in unit tests without notification faking.
- Using a specific SMS package: Violates the "minimal dependencies" principle. Provider
  binding keeps the door open for any gateway.

---

## Decision 3: Onboarding Step Tracking

**Decision**: Store `onboarding_step` as an enum in `barber_profiles` with values:
`profile` → `services` → `availability` → `complete`. The `EnsureBarberOnboarding`
middleware reads this value and redirects authenticated users to the correct incomplete step
on every protected route access.

**Rationale**: Server-side step tracking is reliable across devices and sessions. Enum
enforces valid states. Middleware enforcement means the barber can never access the
dashboard until onboarding is done, which guarantees the 90%+ completion rate target.

**Alternatives considered**:
- Storing step in session: Lost on session expiry; server-side DB is the source of truth.
- Counting completed related records (e.g., `services()->count() > 0`): More correct
  semantically but requires cross-model queries on every request; enum is one indexed read.

---

## Decision 4: Slug Generation & Uniqueness

**Decision**: `GenerateBarberSlug` action uses `Str::slug()` (handles Portuguese accents,
spaces) then queries `barber_profiles` for uniqueness. If taken, appends `-2`, `-3`, etc.
using a single query with LIKE pattern. Real-time validation via a dedicated
`GET /slug/available` route returns JSON (used by the frontend form with debounce).

**Rationale**: `Str::slug()` correctly converts "Barbearia do Lucas" → `barbearia-do-lucas`.
The suffix-appending loop is O(1) in the common case (no conflict) and bounded by the count
of identical business names, which is negligible at this scale.

**Alternatives considered**:
- Adding a random suffix (e.g., UUID fragment): Less user-friendly; barbers want a clean
  slug they can share.
- Unique DB index + catch exception: Catches race conditions but gives poor UX; proactive
  check + server-side final validation is the better pattern.

---

## Decision 5: Login Rate Limiting (Progressive Throttling)

**Decision**: Use Laravel's `RateLimiter` facade with a custom `login` key scoped to
`{identifier}|{ip}`. After 10 failures, store a `login_locked_until` cache key with
progressive durations: 1st lock = 60 s, 2nd = 300 s, 3rd+ = 900 s. The login controller
checks this key before processing, returning a 429-equivalent Inertia error with a
countdown value.

**Rationale**: No permanent lockout (per spec FR-015). Progressive delays penalise
brute-force while allowing legitimate barbers to always recover. The `{identifier}|{ip}`
composite key prevents both distributed attacks (same IP, different identifiers) and
credential stuffing (same identifier, different IPs) simultaneously.

**Alternatives considered**:
- Pure Fortify rate limiting (`throttle:6,1`): Already in place but covers only 6 attempts/
  minute, not progressive delays. We extend on top of it.
- Account lockout + SMS unlock: Permanent lockout creates account hijack via DoS risk.

---

## Decision 6: Photo Upload

**Decision**: Use `$request->file()->storePublicly('barbers/photos', 'public')` to store
photos on the `public` disk (local for dev, S3-compatible in production via env). Return
the stored path and expose via `Storage::url()`. In tests: `Storage::fake('public')`.

**Rationale**: Consistent with Laravel conventions. `Storage::fake()` makes photo upload
tests deterministic and fast. Production can swap the disk driver without code changes.

**Alternatives considered**:
- Base64 inline storage in DB: Bad for performance and backup.
- Presigned URL upload direct to S3: Over-engineered for the current scope; can be added
  in a future iteration.

---

## Decision 7: Session Lifetime (30 Days)

**Decision**: Set `SESSION_LIFETIME=43200` (minutes) in `.env` and ensure
`session.expire_on_close = false` in `config/session.php`. Sessions are renewed on each
access via Laravel's built-in sliding expiry behaviour.

**Rationale**: 30 days matches the clarified spec requirement. Laravel sessions slide
automatically when `lifetime` is set and `expire_on_close` is false. No custom code needed.

**Alternatives considered**:
- Custom session driver: Unnecessary; native Laravel sessions already support sliding expiry.

---

## Decision 8: Shadcn Component Additions

**Decision**: Add `progress` component via `npx shadcn@latest add progress` for the
onboarding step indicator. All other needed UI primitives (Input, Label, Button, InputOtp,
Skeleton) already exist in `resources/js/components/ui/`.

**Rationale**: The onboarding flow requires a clear visual progress bar (2-step or 3-step
indicator matching the wireframe's PASSO N DE N pattern). The `progress` shadcn component
integrates seamlessly with the existing Radix UI + Tailwind setup.

---

## Decision 9: Auto-Publication Trigger

**Decision**: `PublishBarberProfile` action is called at the end of F2 (services save)
and F3 (availability save). It checks: `barber has ≥ 1 service` AND `barber has ≥ 1
availability slot` AND `barber profile is complete`. If all pass, sets `status = published`
and `onboarding_step = complete`. The Inertia page response after publication includes a
`justPublished: true` flash prop that triggers the celebration banner/CTA in the frontend.

**Rationale**: Centralising the publication check in a single action (called from F2 and F3
controllers) keeps the logic DRY and testable. The flash prop pattern is the idiomatic
Inertia way to pass one-time events from server to client.

**Note**: `PublishBarberProfile` implementation details (calling it from F2/F3) are outside
this feature's scope. The action is created and tested here; the callers are F2 and F3.

---

## Decision 10: Fortify Registration Feature

**Decision**: Disable Fortify's built-in `Registration` feature in `config/fortify.php`
(`Features::registration()` removed). Our custom `BarberRegistrationController` (phone →
SMS → profile) replaces it entirely.

**Rationale**: Fortify's registration expects email + password in one step. Our spec requires
a 3-step phone-first flow that cannot be adapted to Fortify's registration contract without
more complexity than building it fresh. Disabling the feature removes the `/register` Fortify
route; our controller registers it explicitly.
