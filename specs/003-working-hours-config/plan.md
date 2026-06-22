# Implementation Plan: Working Hours & Availability Configuration

**Branch**: `003-working-hours-config` | **Date**: 2026-04-08 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/003-working-hours-config/spec.md`

## Summary

Implement F3: a weekly schedule configuration screen where the barber defines their working hours (per day of week), buffer time between appointments, and an optional daily break block. Slots are computed on-demand (not pre-stored). The feature completes the barber onboarding flow by advancing `onboarding_step` to `Complete` and enabling `PublishBarberProfile`.

Technical approach: two new normalized tables (`barber_schedules`, `barber_schedule_days`), drop the `availability_slots` stub, a `AvailabilitySlot` value object for on-demand slot computation, and a single page at `onboarding/availability` built with Inertia + React.

## Technical Context

**Language/Version**: PHP 8.5  
**Primary Dependencies**: Laravel 13, Inertia.js v3, React 19, Tailwind v4, Wayfinder v0, Pest v5  
**Storage**: SQLite (dev/test), MySQL/PostgreSQL (production) — via Laravel migrations  
**Testing**: Pest v5, PHPStan/Larastan v3, Pint v1  
**Target Platform**: Web application (mobile-first, 320px minimum)  
**Project Type**: SPA via Inertia (web-service)  
**Performance Goals**: On-demand slot generation is a pure in-memory computation — no performance target beyond standard HTTP response time  
**Constraints**: No new runtime dependencies; 100% Pest coverage; PHPStan max; Pint zero violations; Wayfinder for all route references  
**Scale/Scope**: One schedule per barber profile; 7 days; low volume (single-user barber context)

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clean Code & Actions | ✅ Pass | All logic in `SaveBarberSchedule` and `GetAvailableSlots` Actions; controller is thin |
| II. Mobile-First UI | ✅ Pass | Schedule form must render correctly at 320px; day-toggle grid is mobile-first |
| III. Design System | ✅ Pass | All UI tokens from `design/design-system.html`; no custom colors or spacing |
| IV. Quality Gates | ✅ Pass | 100% Pest coverage, PHPStan max, 100% type coverage, Pint required before merge |
| V. Inertia-First | ✅ Pass | Single Inertia page at `onboarding/availability`; Wayfinder for all route refs; no REST/JSON page endpoints |
| VI. Minimal Dependencies | ✅ Pass | No new runtime packages; existing Laravel time validation handles all time rules |
| VII. Monetary Values | ✅ N/A | No monetary data in this feature |

**Constitution Check Result**: GATE PASSED — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/003-working-hours-config/
├── plan.md              ← this file
├── research.md          ← Phase 0 output (7 decisions resolved)
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── schedule-api.md  ← Phase 1 output
└── tasks.md             ← Phase 2 output (task breakdown)
```

### Source Code

```text
# Backend (Laravel)
app/
├── Actions/
│   ├── SaveBarberSchedule.php          ← NEW: upserts schedule + 7 days
│   └── GetAvailableSlots.php           ← NEW: on-demand slot computation
├── Http/
│   ├── Controllers/
│   │   └── BarberScheduleController.php ← NEW: GET show, PUT update
│   └── Requests/
│       └── UpdateBarberScheduleRequest.php ← NEW
├── Models/
│   ├── BarberSchedule.php              ← NEW: HasUuids, HasFactory
│   ├── BarberScheduleDay.php           ← NEW: HasUuids, HasFactory
│   └── BarberProfile.php               ← MODIFIED: drop availabilitySlots(), add schedule()
├── ValueObjects/
│   └── AvailabilitySlot.php            ← NEW: readonly value object (replaces Eloquent stub)
└── Actions/
    └── PublishBarberProfile.php        ← MODIFIED: check schedule instead of availabilitySlots

# Removed
app/Models/AvailabilitySlot.php         ← REMOVED: converted to ValueObject above

database/migrations/
├── XXXX_create_barber_schedules_table.php       ← NEW
├── XXXX_create_barber_schedule_days_table.php   ← NEW
└── XXXX_drop_availability_slots_table.php       ← NEW

routes/web.php                          ← MODIFIED: +2 onboarding/availability routes

# Frontend
resources/js/pages/onboarding/
└── availability.tsx                    ← NEW: schedule configuration page

# Tests
tests/Feature/
├── BarberScheduleControllerTest.php    ← NEW
└── SaveBarberScheduleTest.php          ← NEW
tests/Unit/
└── GetAvailableSlotsTest.php           ← NEW (pure function, unit test)
```

**Structure Decision**: Follows the existing single-project structure. Backend in `app/`, frontend in `resources/js/pages/onboarding/`. New `app/ValueObjects/` directory for the `AvailabilitySlot` value object (consistent with YAGNI — no full repository layer added).

## Complexity Tracking

No constitution violations — this section is not required.

## Key Design Decisions (from research.md)

1. **Time storage**: `$table->time()` — MySQL TIME / SQLite text, stored as `'HH:MM:SS'`
2. **Day encoding**: ISO 8601 (1=Mon … 7=Sun), using Carbon's `isoWeekday()`
3. **Slot generation**: Pure in-memory function in `GetAvailableSlots` Action — no persistence
4. **FR-014 (conflict warning)**: Deferred to F5 (Appointment model is a F5 stub)
5. **`availability_slots` table**: Dropped — stub was anticipating pre-computed storage
6. **Defaults**: Applied in controller when no schedule exists (not in Action or DB)
7. **Onboarding advancement**: `onboarding_step` advances to `Complete` on first schedule save

## Post-Design Constitution Re-Check

Re-evaluated after data-model.md and contracts were defined:

- The `BarberScheduleDay` table uses `time` columns (not decimal/float) — no Principle VII concern.
- No new npm or Composer runtime packages introduced.
- `AvailabilitySlot` as a value object is simpler than an Eloquent model — satisfies YAGNI.
- All routes follow existing naming convention (`onboarding.*`).

**Post-Design Result**: GATE PASSED — design is consistent with constitution.

## Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Research | `specs/003-working-hours-config/research.md` | ✅ Complete |
| Data Model | `specs/003-working-hours-config/data-model.md` | ✅ Complete |
| API Contract | `specs/003-working-hours-config/contracts/schedule-api.md` | ✅ Complete |
| Quickstart | `specs/003-working-hours-config/quickstart.md` | ✅ Complete |
| Task Breakdown | `specs/003-working-hours-config/tasks.md` | ⏳ Pending (task breakdown) |
