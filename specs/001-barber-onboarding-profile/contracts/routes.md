# HTTP Route Contracts: F1 · Barber Onboarding & Profile

**Branch**: `001-barber-onboarding-profile`
**Date**: 2026-04-06

All routes return Inertia responses unless noted. `[auth]` = requires authenticated session.
`[guest]` = only accessible when unauthenticated.

---

## Registration Flow (multi-step, guest only)

### `GET /register` `[guest]`

**Controller**: `BarberRegistrationController@create`
**Inertia page**: `onboarding/phone`
**Props**:
```ts
{ status?: string }
```
**Behaviour**: Shows phone entry form. Redirects authenticated users to `/dashboard`.

---

### `POST /register` `[guest]`

**Controller**: `BarberRegistrationController@store`
**Request fields**:
```ts
{ phone: string }   // e.g. "(31) 99999-0000" or "+5531999990000"
```
**Validation**:
- `phone` required, valid Brazilian format, not already registered
- Rate-limited: 5 attempts / minute per IP

**Success**: Creates `SmsVerification` record, sends SMS, stores phone in session,
redirects to `GET /register/verify`.
**Errors** (Inertia shared errors):
- `phone` → "Número já cadastrado. Faça login."
- `phone` → "Formato inválido."
- 429 → "Muitas tentativas. Tente novamente em {N}s."

---

### `GET /register/verify` `[guest]`

**Controller**: `BarberSmsVerificationController@create`
**Inertia page**: `onboarding/verify`
**Props**:
```ts
{
  phone: string,       // masked: "(31) 9****-0000"
  resendAvailableAt?: string  // ISO timestamp when resend cooldown ends
}
```
**Behaviour**: Shows 6-digit OTP form. Requires `session('registration_phone')` to exist;
redirects to `/register` if not.

---

### `POST /register/verify` `[guest]`

**Controller**: `BarberSmsVerificationController@store`
**Request fields**:
```ts
{ code: string }   // 6-digit numeric
```
**Validation**: Code present, numeric, 6 chars.

**Success**: Verifies code, creates `User` (phone verified), sets password from session
(if collected in previous step), logs barber in, creates `BarberProfile` (status=draft,
onboarding_step=profile), redirects to `GET /onboarding/profile`.
**Errors**:
- `code` → "Código incorreto. X tentativas restantes."
- `code` → "Código expirado. Solicite um novo."
- `code` → "Muitas tentativas incorretas. Solicite um novo código."

---

### `POST /register/resend` `[guest]`

**Controller**: `BarberSmsVerificationController@resend`
**Request fields**: none (phone read from session)
**Rate-limited**: 1 resend per 60 s per phone.
**Success**: Creates new `SmsVerification` record, sends SMS, returns redirect back
with flash `status = "Código reenviado."`.
**Error**: 429 if within cooldown — returns Inertia back with `resendAvailableAt`.

---

## Onboarding Profile Step

### `GET /onboarding/profile` `[auth]` `[onboarding:profile]`

**Controller**: `BarberProfileController@edit`
**Middleware**: `EnsureBarberOnboarding` (redirects to correct step if not at `profile`)
**Inertia page**: `onboarding/profile`
**Props**:
```ts
{
  barber: {
    name: string,
    phone: string,
  },
  profile: {
    business_name: string | null,
    slug: string | null,
    address_street: string | null,
    address_number: string | null,
    address_neighborhood: string | null,
    address_city: string | null,
    address_state: string | null,
    address_cep: string | null,
    profile_photo_url: string | null,
    cover_photo_url: string | null,
  },
  onboarding_step: 'profile',    // current step
  steps: ['profile', 'services', 'availability'],
}
```

---

### `POST /onboarding/profile` `[auth]` `[onboarding:profile]`

**Controller**: `BarberProfileController@update`
**Request fields** (multipart/form-data):
```ts
{
  name: string,             // barber full name (updates users.name)
  business_name: string,
  slug: string,
  address_street: string,
  address_number: string,
  address_neighborhood: string,
  address_city: string,
  address_state: string,    // 2 chars
  address_cep?: string,     // optional, 9 chars with hyphen
  profile_photo?: File,     // JPEG/PNG/WebP ≤5MB
  cover_photo?: File,       // JPEG/PNG/WebP ≤5MB
}
```
**Success**: Updates `users.name`, upserts `BarberProfile`, sets
`onboarding_step = services`, redirects to F2 route (`/onboarding/services` — out of
scope here, redirects to `/dashboard` as placeholder).
**Errors**: Standard Inertia validation error bag on all fields.

---

## Slug Availability Check

### `GET /slug/available` `[auth]`

**Controller**: `SlugAvailabilityController@show`
**Query params**:
```ts
{ slug: string, except?: string }   // except = current barber's own slug
```
**Response** (JSON, not Inertia):
```ts
{
  available: boolean,
  suggestion: string   // unique slug if not available, same as input if available
}
```
**Rate-limited**: 30 requests / minute per user.

---

## Session (Login / Logout) — Adapted Fortify

### `GET /login` `[guest]`

**Controller**: `SessionController@create` (existing, updated props)
**Inertia page**: `session/create` (updated — phone field instead of email)
**Props**: `{ canResetPassword: boolean, status?: string }`

---

### `POST /login` `[guest]`

**Controller**: `SessionController@store` (existing, updated to accept `identifier`)
**Request fields**:
```ts
{
  identifier: string,  // phone number or email
  password: string,
  remember?: boolean,
}
```
**Behaviour**: Finds user by phone first; if not found, by email. Applies progressive
throttling after 10 failures. On success → `/dashboard`. On 2FA enabled → two-factor
challenge page.

---

### `POST /logout` `[auth]`

**Controller**: `SessionController@destroy` (existing, unchanged)

---

## Password Recovery (SMS-based)

### `GET /forgot-password` `[guest]`

**Inertia page**: `user-password/forgot` (existing page — update to accept phone)

### `POST /forgot-password` `[guest]`

Sends SMS code to registered phone. Stores purpose=`password_reset` SmsVerification.

### `GET /reset-password/{token}` → replaced by SMS OTP flow

**POST /reset-password**: accepts `{ phone, code, password, password_confirmation }`.
Verifies SMS code then calls `UpdateUserPassword` action.

---

## Middleware: `EnsureBarberOnboarding`

Applied to all authenticated barber routes. Reads `auth()->user()->barberProfile->onboarding_step`
and redirects:

| Step | Redirect target |
|------|----------------|
| `profile` | `GET /onboarding/profile` |
| `services` | `GET /onboarding/services` (F2) |
| `availability` | `GET /onboarding/availability` (F3) |
| `complete` | _(no redirect, proceed normally)_ |

Routes exempt from middleware: `/onboarding/*`, `/logout`, `/settings/*`.
