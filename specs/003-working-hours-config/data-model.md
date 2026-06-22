# Data Model: Working Hours & Availability Configuration

**Branch**: `003-working-hours-config` | **Date**: 2026-04-08

---

## New Tables

### `barber_schedules`

One record per `BarberProfile`. Holds the barber-level buffer setting.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK | HasUuids |
| `barber_profile_id` | uuid | FK → barber_profiles, unique, cascade delete | One schedule per barber |
| `buffer_minutes` | unsignedTinyInteger | NOT NULL, default 0 | Allowed values: 0, 5, 10, 15, 30 |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

**Indexes**: unique on `barber_profile_id`.

---

### `barber_schedule_days`

Seven records per `BarberSchedule` (one per ISO day of week).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK | HasUuids |
| `barber_schedule_id` | uuid | FK → barber_schedules, cascade delete | |
| `day_of_week` | unsignedTinyInteger | NOT NULL | 1 = Mon … 7 = Sun (ISO 8601) |
| `is_open` | boolean | NOT NULL, default false | Toggle |
| `opens_at` | time | nullable | Required when `is_open = true` |
| `closes_at` | time | nullable | Required when `is_open = true`; must be > `opens_at` |
| `break_starts_at` | time | nullable | Optional; must be >= `opens_at` when set |
| `break_ends_at` | time | nullable | Optional; must be <= `closes_at` and > `break_starts_at` |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

**Indexes**: unique on `(barber_schedule_id, day_of_week)`.

**Validation rules** (enforced at application layer):
- `closes_at` > `opens_at` (when day is open)
- `break_starts_at` >= `opens_at` and `break_ends_at` <= `closes_at` (when break is set)
- `break_ends_at` > `break_starts_at` (when break is set)
- All time values must align to 15-minute increments (validated in FormRequest)

---

## Dropped Table

### `availability_slots` (removed)

This stub table (created by F3 scaffolding) is dropped by migration. On-demand slot generation does not require persistence (see `research.md` Decision 5).

**Migration**: `XXXX_drop_availability_slots_table.php`

---

## Eloquent Models

### `BarberSchedule`

```
App\Models\BarberSchedule
- belongsTo(BarberProfile)
- hasMany(BarberScheduleDay)
- Casts: buffer_minutes → integer
```

### `BarberScheduleDay`

```
App\Models\BarberScheduleDay
- belongsTo(BarberSchedule)
- Casts: is_open → boolean, opens_at/closes_at/break_starts_at/break_ends_at → string ('HH:MM:SS')
```

### `BarberProfile` (updated)

- Remove: `availabilitySlots(): HasMany` relationship
- Add: `schedule(): HasOne<BarberSchedule>` relationship

---

## Value Object

### `App\ValueObjects\AvailabilitySlot`

Replaces the former `App\Models\AvailabilitySlot` Eloquent stub. Pure computed value, never persisted.

```
final readonly class AvailabilitySlot
{
    public function __construct(
        public \DateTimeImmutable $startsAt,
        public \DateTimeImmutable $endsAt,
    ) {}
}
```

---

## Modified Actions

### `PublishBarberProfile` (updated)

Change the check from:
```php
if ($profile->availabilitySlots()->count() === 0) { return $profile; }
```
To:
```php
if ($profile->schedule === null) { return $profile; }
```

---

## Relationship Map

```
User
 └─ BarberProfile (1:1)
     ├─ Service[] (1:N)                        — F2
     └─ BarberSchedule (1:1)                   — F3 (this feature)
         └─ BarberScheduleDay[] (1:7)
```

---

## No Monetary Values

This feature contains no monetary data — Principle VII does not apply.
