# Feature Specification: F1 · Barber Onboarding & Profile

**Feature Branch**: `001-barber-onboarding-profile`
**Created**: 2026-04-06
**Status**: Draft
**Input**: User description — F1 · Barber Onboarding & Profile

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Phone Registration & SMS Verification (Priority: P1)

A barber who has never used the platform opens the app, enters their phone number, receives
an SMS verification code, and completes identity verification to gain access to the
onboarding flow.

**Why this priority**: This is the entry gate to the entire product. Without successful
registration and verification, no other feature is accessible. It must be frictionless and
reliable.

**Independent Test**: Can be tested by submitting a phone number, receiving the code, and
confirming the account is created and verified — with no other setup required.

**Acceptance Scenarios**:

1. **Given** a barber has never used the app, **When** they enter a valid Brazilian phone
   number and tap "Continuar", **Then** an SMS with a 6-digit code is sent to that number
   within 30 seconds.
2. **Given** an SMS code was sent, **When** the barber enters the correct code within its
   validity window, **Then** their account is created and they are redirected to the profile
   creation step.
3. **Given** an SMS code was sent, **When** the barber enters an incorrect code, **Then** a
   clear error message is shown and they may retry (up to 5 attempts before lock-out).
4. **Given** a phone number already registered, **When** a new barber attempts to register
   with that number, **Then** the system informs them the number is taken and offers to log
   in instead.
5. **Given** a code has expired (after 10 minutes), **When** the barber enters it, **Then**
   the system prompts them to request a new code.

---

### User Story 2 — Profile Creation & Public URL (Priority: P2)

After verification, the barber fills in their professional profile: name, business name,
address, profile photo, cover photo, and a personalized public URL slug. The profile is
saved in draft state until services (F2) and availability (F3) are also configured.

**Why this priority**: The profile is the barbershop's public face. It must be created
before F2 and F3 become meaningful, and before the barber can share their booking page.

**Independent Test**: Can be tested by creating a verified account, completing the profile
form, and confirming the data persists, the slug is unique, and the profile status is
"draft".

**Acceptance Scenarios**:

1. **Given** a verified barber starts profile creation, **When** they type their business
   name, **Then** the system immediately suggests a URL slug derived from the business name
   (e.g., "Barbearia do Lucas" → `lucas-barber`), shown in real time.
2. **Given** a suggested slug is already taken, **When** it is generated, **Then** the
   system appends a numeric suffix to make it unique (e.g., `lucas-barber-2`).
3. **Given** a barber edits the slug manually, **When** they type characters, **Then** the
   system validates it is URL-safe (lowercase letters, numbers, hyphens only), unique, and
   at least 3 characters; invalid slugs are rejected with a clear inline message.
4. **Given** all required fields are filled (name, business name, address, slug), **When**
   the barber taps "Salvar", **Then** the profile is saved as "draft/unpublished" and they
   see a success confirmation.
5. **Given** a barber uploads a profile or cover photo, **When** the file exceeds 5 MB or
   is not an image (JPEG/PNG/WebP), **Then** the upload is rejected with a clear error
   message and the previous photo (if any) is preserved.
6. **Given** a barber taps "Salvar" without filling required fields (name, business name,
   address), **Then** the missing fields are highlighted and the form is not submitted.

---

### User Story 3 — Login & Session Persistence (Priority: P3)

A returning barber opens the app and is either already logged in (session active) or can
log in using their phone number or the password they set during onboarding.

**Why this priority**: Session persistence and login are essential for returning users but
depend on registration (US1) being complete first.

**Independent Test**: Can be tested by creating an account, closing and reopening the app,
and confirming the session is active; or by logging out and back in via the login form.

**Acceptance Scenarios**:

1. **Given** a barber has an active session, **When** they open the app, **Then** they are
   taken directly to the dashboard without being prompted to log in.
2. **Given** a barber is on the login screen, **When** they enter their phone (or
   optionally, email) and correct password, **Then** they are authenticated and redirected
   to the dashboard.
3. **Given** a barber enters an incorrect password, **When** they submit the login form,
   **Then** a generic error ("Telefone ou senha incorretos") is shown; no information leaks
   about whether the phone exists.
4. **Given** a barber taps "Esqueci minha senha", **When** they complete the recovery flow,
   **Then** they receive an SMS code allowing them to set a new password.
5. **Given** an authenticated barber taps "Sair", **When** the action is confirmed, **Then**
   the session is destroyed and they are redirected to the login screen.

---

### Edge Cases

- What happens when the barber's phone has no SMS signal during verification? (Retry and
  resend must be available with a 60-second cooldown; the system must not block permanently.)
- How does the system handle a slug that becomes invalid after submission (concurrent
  conflict)? (Server-side uniqueness check on save; user sees an inline conflict message and
  a suggested alternative.)
- What if a photo upload fails mid-way due to network loss? (Upload is atomic; partial
  uploads are discarded and the previous state is preserved.)
- What if two registrations with the same phone happen concurrently? (Only the first
  verified session succeeds; the second receives "number already registered".)
- What if a barber makes 10+ consecutive wrong password attempts? (Progressive throttling
  is applied — 1 min, 5 min, 15 min wait periods — and the barber is informed of the delay
  with a visible countdown; they can bypass via the SMS password reset flow at any time.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept a Brazilian phone number (with DDD) as the primary
  identifier for barber accounts — no email address is required to register.
- **FR-002**: System MUST send a 6-digit SMS verification code to the provided phone number
  within 30 seconds of a registration or resend request.
- **FR-003**: System MUST invalidate SMS codes after 10 minutes and enforce a 60-second
  cooldown between resend requests.
- **FR-004**: System MUST lock the SMS verification flow after 5 consecutive incorrect
  attempts and require the barber to request a new code before retrying.
- **FR-005**: System MUST allow barbers to set a password during or immediately after phone
  verification, enabling future logins without SMS.
- **FR-006**: System MUST collect the following profile fields upon onboarding:
  full name (required), business/barbershop name (required), address — street, number,
  neighborhood, city, state (required), profile photo (optional, JPEG/PNG/WebP ≤ 5 MB),
  and cover photo (optional, JPEG/PNG/WebP ≤ 5 MB).
- **FR-007**: System MUST auto-generate a unique URL slug from the business name when the
  field is first populated, applying slug normalization (lowercase, accent-stripped,
  hyphens instead of spaces).
- **FR-008**: System MUST allow barbers to manually edit their slug and MUST validate
  uniqueness in real time (debounced) and on form submission.
- **FR-009**: System MUST mark the barber profile as "unpublished" and not visible to
  clients until services (F2) and availability hours (F3) are also configured. Once all
  three steps are complete, the system MUST publish the profile automatically and display a
  prominent confirmation banner/CTA (e.g., "Seu perfil está no ar! Ver minha página")
  so the barber is aware of and can celebrate the publication.
- **FR-010**: System MUST persist the authenticated session so returning barbers are not
  required to log in on every visit. Sessions expire after 30 days of inactivity and MUST
  be renewed automatically on each access within that window.
- **FR-011**: System MUST support login via phone + password and, as an alternative, via
  phone + SMS code (OTP login).
- **FR-012**: System MUST allow barbers to log out, permanently destroying the active
  session.
- **FR-015**: System MUST apply progressive throttling to failed password login attempts:
  after 10 consecutive failures, enforce increasing wait periods (1 min → 5 min → 15 min)
  before the next attempt is accepted. No permanent account lockout; barbers can always
  recover via the SMS password reset flow.
- **FR-013**: System MUST support a password recovery flow initiated by SMS code sent to
  the registered phone.
- **FR-014**: System MUST display a step-by-step onboarding progress indicator
  (profile → services → availability) so barbers know how close they are to publishing.
- **FR-017**: Each barber account MUST correspond to exactly one barbershop profile and
  one public URL slug. Multiple barbershops require separate accounts with separate phone
  numbers. This constraint MUST be enforced at the data layer.
- **FR-016**: System MUST persist partial onboarding progress server-side. If a barber
  completes US1 (phone verification) but abandons before finishing the profile, their
  verified account and any partially saved fields MUST be preserved. On next login, they
  MUST be redirected automatically to the first incomplete onboarding step.

### Key Entities

- **Barber**: Primary professional account. Key attributes: full name, business name,
  phone (primary identifier, unique), email (optional, for login convenience), password
  (hashed), profile photo URL, cover photo URL, address (structured), slug (unique,
  URL-safe), status (`draft` | `published`), onboarding_step (tracks last completed step
  for resume capability), phone_verified_at, created_at.
- **SmsVerification**: Tracks pending SMS code attempts. Key attributes: phone number,
  hashed code, purpose (`registration` | `otp_login` | `password_reset`), expires_at,
  verified_at, attempt_count.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A barber with no prior account completes phone registration, SMS verification,
  and full profile creation in under 3 minutes (measured from first screen interaction to
  successful profile save).
- **SC-002**: At least 90% of barbers who begin registration successfully complete SMS
  verification without abandoning (measured as verified accounts / started registrations).
- **SC-003**: The public URL slug suggestion appears within 1 second of the barber pausing
  typing in the business name field.
- **SC-004**: SMS verification codes are delivered within 30 seconds for 95% of requests
  under normal network conditions.
- **SC-005**: Returning barbers with an active session reach the dashboard in under 2
  seconds of opening the app — no login prompt displayed.
- **SC-006**: The full barber journey — registration through published profile (including F2
  and F3 completion) — is achievable in under 5 minutes.

## Clarifications

### Session 2026-04-06

- Q: How does the transition from `draft` to `published` occur? → A: Automatic publication when F1 + F2 + F3 are complete, with a confirmation banner/CTA displayed to the barber.
- Q: How long does an authenticated session remain active without activity? → A: 30 days of inactivity; session is renewed automatically on each access.
- Q: How many failed password login attempts are allowed before a restriction is applied? → A: 10 attempts, then progressive throttling (increasing delays: 1 min → 5 min → 15 min); no permanent lockout.
- Q: What happens to onboarding progress if a barber abandons mid-flow and returns later? → A: Partial progress is preserved; barber resumes from the most recent incomplete step.
- Q: Can one barber account manage multiple barbershop profiles/slugs? → A: No — one account = one barbershop (1:1). Multiple barbershops require separate accounts.

## Assumptions

- Brazilian phone numbers (format: DDD + number, e.g., (31) 99999-0000) are the sole
  registration channel; international phone numbers are out of scope.
- An SMS gateway is available and integrated at the infrastructure level; this spec does
  not prescribe the provider.
- Email is an optional secondary identifier used only for login convenience; it is not
  required and not verified within this feature.
- Address input is a structured text form with optional CEP (postal code) lookup to
  auto-fill city/state; map-based address selection is out of scope.
- Photo storage (object storage / CDN) is already provisioned at the infrastructure level;
  this feature consumes the upload endpoint.
- The wireframe `wireframes/01-dash-login.jsx` confirms the login UI: phone or email field
  + password field, with a "Criar agora" link to the registration flow.
- Onboarding steps are sequential and enforced: profile (F1) → services (F2) →
  availability (F3); barbers cannot skip steps to publish their page.
- Public profile URL format is `barberpro.app/{slug}`; slug rules: lowercase alphanumeric
  and hyphens only, minimum 3 characters, maximum 50 characters.
- The relationship between barber account and barbershop is strictly 1:1. Multi-location
  or multi-profile support is explicitly out of scope for this and future features in this
  version.
