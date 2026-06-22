# Data Model: F1 · Barber Onboarding & Profile

**Branch**: `001-barber-onboarding-profile`
**Date**: 2026-04-06

---

## Enums

### `App\Enums\BarberOnboardingStep`

| Value | Meaning |
|-------|---------|
| `Profile` | Barber completed phone registration; profile form not yet saved |
| `Services` | Profile saved; services (F2) not yet configured |
| `Availability` | Services done; availability (F3) not yet configured |
| `Complete` | All steps done; profile is published |

### `App\Enums\BarberProfileStatus`

| Value | Meaning |
|-------|---------|
| `Draft` | Not yet visible to clients |
| `Published` | Visible to clients; all onboarding steps complete |

### `App\Enums\SmsVerificationPurpose`

| Value | Meaning |
|-------|---------|
| `Registration` | New barber phone verification |
| `OtpLogin` | Passwordless login via SMS |
| `PasswordReset` | Password recovery flow |

---

## Database Migrations

### 1. `add_phone_to_users_table`

Extends the existing `users` table.

| Column | Type | Constraints |
|--------|------|-------------|
| `phone` | `string` | unique, nullable (nullable to not break existing users during migration; enforced via validation for new registrations) |
| `phone_verified_at` | `timestamp` | nullable |

Email changes:
- `email` column: change to `nullable()` (existing barbers will have phone primary)
- `password_reset_tokens` table: add `phone` column as alternative primary (or create separate SMS-based reset flow — see FR-013)

### 2. `create_barber_profiles_table`

One row per barber (1:1 with `users`).

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | primary |
| `user_id` | `uuid` | FK → `users.id`, `onDelete('cascade')`, unique |
| `business_name` | `string` | not null |
| `slug` | `string` | unique, not null |
| `address_street` | `string` | not null |
| `address_number` | `string` | not null |
| `address_neighborhood` | `string` | not null |
| `address_city` | `string` | not null |
| `address_state` | `char(2)` | not null (e.g., `MG`, `SP`) |
| `address_cep` | `string(9)` | nullable (e.g., `30130-010`) |
| `profile_photo_url` | `string` | nullable |
| `cover_photo_url` | `string` | nullable |
| `status` | `string` (enum cast) | default `draft` |
| `onboarding_step` | `string` (enum cast) | default `profile` |
| `created_at` | `timestamp` | — |
| `updated_at` | `timestamp` | — |

**Indexes**: `slug` (unique), `user_id` (unique), `status` (regular, for future queries).

### 3. `create_sms_verifications_table`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | primary |
| `phone` | `string` | indexed |
| `code` | `string` | hashed (bcrypt) |
| `purpose` | `string` (enum cast) | not null |
| `expires_at` | `timestamp` | not null |
| `verified_at` | `timestamp` | nullable |
| `attempt_count` | `unsignedSmallInteger` | default `0` |
| `created_at` | `timestamp` | — |
| `updated_at` | `timestamp` | — |

**Indexes**: `[phone, purpose, verified_at, expires_at]` composite (to find the latest
unverified code for a phone+purpose efficiently).

---

## Eloquent Models

### `App\Models\User` (extended)

Add to existing model:

```php
// New properties (PHPDoc)
// @property-read string|null $phone
// @property-read CarbonInterface|null $phone_verified_at

// New relationship
public function barberProfile(): HasOne  // → BarberProfile
```

Casts additions: `'phone_verified_at' => 'datetime'`

### `App\Models\BarberProfile` (new)

```
Properties: id, user_id, business_name, slug, address_street, address_number,
            address_neighborhood, address_city, address_state, address_cep,
            profile_photo_url, cover_photo_url, status, onboarding_step,
            created_at, updated_at

Casts: status → BarberProfileStatus, onboarding_step → BarberOnboardingStep

Relationships:
  - user(): BelongsTo → User

Scopes:
  - scopePublished(): where status = published
```

### `App\Models\SmsVerification` (new)

```
Properties: id, phone, code, purpose, expires_at, verified_at, attempt_count,
            created_at, updated_at

Casts: purpose → SmsVerificationPurpose, expires_at → datetime, verified_at → datetime

Scopes:
  - scopeActive(): where verified_at is null AND expires_at > now()
  - scopeForPhone(string $phone): where phone = $phone
  - scopeForPurpose(SmsVerificationPurpose $purpose)
```

---

## State Transitions

### BarberProfile.status

```
[not created] → draft (on: user phone verified + redirect to profile step)
draft → published (on: PublishBarberProfile action — all 3 steps complete)
published → draft (reserved for future: account suspension — out of scope)
```

### BarberProfile.onboarding_step

```
profile     → services    (on: barber saves profile successfully — end of F1)
services    → availability (on: barber saves ≥1 service — end of F2)
availability → complete   (on: barber saves ≥1 availability slot — end of F3)
```

### SmsVerification lifecycle

```
[created] verified_at=null, attempt_count=0
  → [expired] expires_at < now()           — on: 10 min elapsed without verification
  → [invalid] attempt_count = 5             — on: 5 wrong attempts
  → [verified] verified_at set             — on: correct code entered in time
```

---

## Validation Rules

### Phone number

- Brazilian format: matches `/^\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}$/`
- Stored in E.164 format internally: `+55DDXXXXXXXX` (normalised on input)
- Display format: `(DD) XXXXX-XXXX`

### Slug

- Regex: `/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/` (starts/ends alphanumeric, 3-50 chars)
- No consecutive hyphens
- Unique in `barber_profiles.slug`

### Photos

- Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`
- Max size: 5 MB (5120 KB)
- Stored at: `barbers/{user_id}/photos/{uuid}.{ext}` on `public` disk

### SMS Code

- 6 digits, numeric only
- Valid for 10 minutes from creation
- Max 5 attempts before the record is exhausted
- Cooldown between resend requests: 60 seconds (checked via `created_at` of latest record)

---

## Factories

### `BarberProfileFactory`

States:
- `published()` — sets status=published, onboarding_step=complete
- `draft()` — default, status=draft, onboarding_step=profile
- `withPhotos()` — sets placeholder photo URLs

### `SmsVerificationFactory`

States:
- `expired()` — sets expires_at to past
- `verified()` — sets verified_at to now
- `exhausted()` — sets attempt_count=5
- `forRegistration()` — purpose=registration (default)
