# Research: Working Hours & Availability Configuration

**Branch**: `003-working-hours-config` | **Date**: 2026-04-08

---

## Decision 1: Time storage format

**Decision**: Use Laravel's `$table->time('column')` migration helper. Stores as `TIME` in MySQL and as `TEXT ('HH:MM:SS')` in SQLite.

**Rationale**: Native time type keeps validation at the DB layer, sorts correctly, and is readable. Carbon parses via `Carbon::createFromFormat('H:i:s', $value)`. All time values will be stored as `'HH:MM:SS'` strings and cast via Eloquent.

**Alternatives considered**:
- `unsignedSmallInteger` (minutes since midnight): computationally convenient but sacrifices readability in raw SQL and in factories.
- `string` with 'HH:MM' format: loses DB-level type guarantees.

---

## Decision 2: Day-of-week encoding

**Decision**: Store `day_of_week` as `unsignedTinyInteger` using **ISO 8601** (1 = Monday … 7 = Sunday).

**Rationale**: ISO 8601 is the universal standard and maps directly to Carbon's `isoWeekday()` method. Frontend will receive integer 1–7 and display locale-aware labels. Avoids PHP's `date('w')` Sunday=0 ambiguity.

**Alternatives considered**:
- PHP/JS Sunday=0 convention: causes cognitive mismatch when comparing with ISO dates via Carbon.
- Enum string (e.g., `'monday'`): more readable but wastes storage and complicates sorting.

---

## Decision 3: On-demand slot generation algorithm

**Decision**: Slot generation is a pure function computed when a client requests available times. No slots are persisted.

**Algorithm**:
```
function generateSlots(day, date, serviceDuration, bufferMinutes):
  if day.is_open == false → return []

  cursor = date + day.opens_at
  endOfDay = date + day.closes_at
  breakStart = day.break_starts_at ? date + day.break_starts_at : null
  breakEnd   = day.break_ends_at   ? date + day.break_ends_at   : null

  slots = []
  while cursor + serviceDuration <= endOfDay:
    slotEnd = cursor + serviceDuration
    
    if breakStart && cursor < breakEnd && slotEnd > breakStart:
      cursor = breakEnd  # jump past the break
      continue
    
    slots.append(AvailabilitySlot(starts_at: cursor, ends_at: slotEnd))
    cursor = slotEnd + bufferMinutes

  return slots
```

**Rationale**: Stateless, no stale data risk, trivial to implement as a single Action. Works for a single barber (low volume). Break overlap is detected by checking if `[cursor, slotEnd]` intersects `[breakStart, breakEnd]`.

**Alternatives considered**:
- Pre-compute and store 30 days of slots: adds complexity, race conditions on schedule updates, and doesn't scale with many services. Not justified for barbershop scale.

---

## Decision 4: FR-014 (conflict warning) scope in F3

**Decision**: FR-014 is **deferred to F5** (Appointments feature). The `SaveBarberSchedule` action in F3 will include a `conflictingBookingsCount` return value, always returning `0` since `Appointment` is a F5 stub.

**Rationale**: The `Appointment` model is explicitly marked `// F5 — stub model`. Querying a non-existent table in F3 would create a false dependency. The architecture is designed so F5 can fill in the real query without changing the action's public interface.

**How F5 extends this**: `SaveBarberSchedule` will expose a method `getConflictingBookingsCount(BarberProfile, array $newSchedule): int` that F5 replaces with a real query against `appointments`.

---

## Decision 5: Fate of `availability_slots` stub

**Decision**: **Drop the `availability_slots` table** via a new migration. Replace the `AvailabilitySlot` Eloquent model with a **readonly value object** (plain PHP class, not a Model).

**Rationale**: The stub was created anticipating pre-computed slots. With on-demand generation (Clarification Q1), no slot persistence is needed. Keeping an empty table with a misleading Eloquent model would violate YAGNI and confuse future developers.

**Impact on existing code**:
- `BarberProfile::availabilitySlots()` HasMany relationship → replaced by `BarberProfile::schedule()` BelongsTo relationship.
- `PublishBarberProfile` action checks `$profile->availabilitySlots()->count() === 0` → updated to `$profile->schedule === null`.
- `AvailabilitySlot` class kept but converted to `final readonly class AvailabilitySlot` (value object in `App\ValueObjects\`).

---

## Decision 6: Default schedule seeding

**Decision**: Defaults (Mon–Fri 09h–19h, Sat 08h–17h, Sun closed) are applied in the **controller** when no schedule exists yet, not hardcoded in the Action or DB. The `BarberScheduleController::show()` will pass default data to the frontend if no `BarberSchedule` record exists.

**Rationale**: Keeps the Action pure (operates on what it receives). Defaults are a UI concern (pre-filling the form), not a business rule enforced at persistence time.

---

## Decision 7: Onboarding step advancement

**Decision**: When the barber saves a schedule for the first time while `onboarding_step === Availability`, the system advances `onboarding_step` to `Complete` (consistent with how `ServiceController` advances from `Services` → `Availability`).

**Rationale**: The onboarding flow ends at Availability (F3). Setting `Complete` allows `PublishBarberProfile` to proceed.
