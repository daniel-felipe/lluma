# Tasks: Working Hours & Availability Configuration

**Input**: Design documents from `/specs/003-working-hours-config/`
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/schedule-api.md ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths included in every task description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migrations and model scaffolding that all user stories depend on.

- [ ] T001 Create migration `create_barber_schedules_table` in `database/migrations/` with uuid PK, barber_profile_id FK (unique, cascade), buffer_minutes unsignedTinyInteger default 0, timestamps
- [ ] T002 Create migration `create_barber_schedule_days_table` in `database/migrations/` with uuid PK, barber_schedule_id FK (cascade), day_of_week unsignedTinyInteger, is_open boolean default false, opens_at/closes_at/break_starts_at/break_ends_at time nullable, timestamps; unique index on (barber_schedule_id, day_of_week)
- [ ] T003 Create migration `drop_availability_slots_table` in `database/migrations/` to drop the stub table
- [ ] T004 Run `php artisan migrate` to apply all three migrations
- [ ] T005 [P] Create `BarberSchedule` model via `php artisan make:model BarberSchedule --factory --no-interaction`; add HasUuids, belongsTo(BarberProfile), hasMany(BarberScheduleDay), cast buffer_minutes to integer in `app/Models/BarberSchedule.php`
- [ ] T006 [P] Create `BarberScheduleDay` model via `php artisan make:model BarberScheduleDay --factory --no-interaction`; add HasUuids, belongsTo(BarberSchedule), cast is_open to boolean and time fields to string in `app/Models/BarberScheduleDay.php`
- [ ] T007 Convert `app/Models/AvailabilitySlot.php` to `app/ValueObjects/AvailabilitySlot.php` as a `final readonly class` with `DateTimeImmutable $startsAt` and `DateTimeImmutable $endsAt` constructor properties; delete the old Eloquent model file
- [ ] T008 Update `app/Models/BarberProfile.php`: remove `availabilitySlots(): HasMany` relationship, add `schedule(): HasOne` relationship returning `HasOne<BarberSchedule>`
- [ ] T009 Update `app/Actions/PublishBarberProfile.php`: replace `$profile->availabilitySlots()->count() === 0` check with `$profile->schedule === null`
- [ ] T010 [P] Update `database/factories/BarberScheduleFactory.php` with realistic default states (buffer_minutes 0)
- [ ] T011 [P] Update `database/factories/BarberScheduleDayFactory.php` with realistic day states (open/closed, times)

**Checkpoint**: Migrations run, models exist, AvailabilitySlot is a value object — foundation ready for all user stories.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Controller, FormRequest, routes, and Wayfinder must exist before any frontend work can begin.

- [ ] T012 Create `UpdateBarberScheduleRequest` via `php artisan make:request UpdateBarberScheduleRequest --no-interaction` in `app/Http/Requests/`; implement all validation rules: buffer_minutes in:0,5,10,15,30; days array size:7; per-day rules for opens_at/closes_at/break_starts_at/break_ends_at including date_format:H:i and custom 15-minute increment rule
- [ ] T013 Create `BarberScheduleController` via `php artisan make:controller BarberScheduleController --no-interaction` in `app/Http/Controllers/`; implement `show()` returning Inertia render with schedule props (defaults for new barbers: Mon–Fri 09:00–19:00 open, Sat 08:00–17:00 open, Sun closed, buffer_minutes=0) and `update()` stub delegating to SaveBarberSchedule action
- [ ] T014 Add two routes to `routes/web.php` inside the `auth` middleware group: `Route::get('onboarding/availability', [BarberScheduleController::class, 'show'])->name('onboarding.availability.show')` and `Route::put('onboarding/availability', [BarberScheduleController::class, 'update'])->name('onboarding.availability.update')`
- [ ] T015 Run `php artisan wayfinder:generate` to generate `resources/js/actions/BarberScheduleController.ts` with typed `show()` and `update()` functions

**Checkpoint**: Routes registered, controller exists, Wayfinder types generated — frontend can now reference backend endpoints.

---

## Phase 3: User Story 1 — Initial Weekly Schedule Setup (Priority: P1) 🎯 MVP

**Goal**: A new barber opens the schedule screen, sees pre-filled defaults, adjusts if needed, saves, and booking slots are subsequently generated from the stored schedule.

**Independent Test**: Open `/onboarding/availability` as a barber with no schedule. Confirm Mon–Fri 09:00–19:00 open, Sat 08:00–17:00 open, Sun closed. Save without changes. Verify `barber_schedules` row created and `barber_schedule_days` has 7 rows. Verify `GetAvailableSlots` returns slots for Monday and no slots for Sunday.

### Implementation for User Story 1

- [ ] T016 Create action via `php artisan make:action "SaveBarberSchedule" --no-interaction` in `app/Actions/SaveBarberSchedule.php`; implement `run(BarberProfile $profile, array $data): BarberSchedule` using `DB::transaction()` to upsert `barber_schedules` and all 7 `barber_schedule_days` records; advance `onboarding_step` to `Complete` on first save
- [ ] T017 Create action via `php artisan make:action "GetAvailableSlots" --no-interaction` in `app/Actions/GetAvailableSlots.php`; implement `run(BarberSchedule $schedule, int $serviceDurationMinutes, \DateTimeImmutable $date): array` returning `AvailabilitySlot[]`; pure in-memory loop: skip if day is closed, step from opens_at to closes_at by (serviceDurationMinutes + buffer_minutes), exclude slots overlapping the break block
- [ ] T018 Complete `BarberScheduleController@update()` in `app/Http/Controllers/BarberScheduleController.php` to inject `UpdateBarberScheduleRequest` and call `SaveBarberSchedule::run()`; redirect to `onboarding.availability.show` on success
- [ ] T019 Create `resources/js/pages/onboarding/availability.tsx`; render 7-day grid with open/closed toggle per row, opens_at/closes_at select inputs (15-min increments, 24h), global buffer radio/select (0/5/10/15/30 min); use `useForm` with PUT to `BarberScheduleController.update()` from Wayfinder; display Inertia validation errors inline; mobile-first layout at 320px minimum using design system tokens only
- [ ] T020 Write feature test `tests/Feature/BarberScheduleControllerTest.php` covering: GET returns default schedule for new barber, GET returns saved schedule for returning barber, PUT with valid payload upserts schedule and redirects, PUT with end time before start time returns validation error, PUT with non-15-minute increment returns validation error
- [ ] T021 Write feature test `tests/Feature/SaveBarberScheduleTest.php` covering: first save creates schedule + 7 days + advances onboarding_step to Complete, subsequent save updates existing rows without duplicating, transaction rollback on partial failure

**Checkpoint**: User Story 1 fully functional — barber can set and save a weekly schedule; slot generation works for open days.

---

## Phase 4: User Story 2 — Configure Buffer Time Between Clients (Priority: P2)

**Goal**: Barber selects buffer minutes; slot generation spaces appointments accordingly across all days.

**Independent Test**: Save schedule with 15-min buffer. Call `GetAvailableSlots` with a 30-min service. Verify consecutive slot start times are 45 minutes apart. Set buffer to 0 and verify slots are exactly 30 minutes apart.

### Implementation for User Story 2

- [ ] T022 [P] [US2] Verify `GetAvailableSlots` in `app/Actions/GetAvailableSlots.php` correctly applies `buffer_minutes` from `BarberSchedule`; if not already handled in T017 implementation, update the slot-step calculation to `serviceDurationMinutes + schedule->buffer_minutes`
- [ ] T023 [US2] Write unit test `tests/Unit/GetAvailableSlotsTest.php` covering: buffer=0 produces back-to-back slots, buffer=15 with 30-min service produces 45-min spacing, buffer=30 with 60-min service produces 90-min spacing, first slot of day has no buffer offset (starts exactly at opens_at)

**Checkpoint**: Buffer time correctly spaces slots; unit tests prove all buffer values produce correct intervals.

---

## Phase 5: User Story 3 — Add a Lunch or Break Block (Priority: P3)

**Goal**: Barber defines an optional break block per day; no slots are generated during that window.

**Independent Test**: Set Tuesday with opens_at=09:00, closes_at=19:00, break_starts_at=12:00, break_ends_at=13:00. Call `GetAvailableSlots` for Tuesday. Verify no slot starts between 12:00 and 13:00 and slots exist before 12:00 and from 13:00 onward.

### Implementation for User Story 3

- [ ] T024 [P] [US3] Add break block inputs to `resources/js/pages/onboarding/availability.tsx`: collapsible per-day section with break_starts_at/break_ends_at selects (15-min increments); only visible when day is open; show/hide toggle; bind to `useForm` data
- [ ] T025 [US3] Extend `tests/Unit/GetAvailableSlotsTest.php` with break block scenarios: slot exactly at break_starts_at is excluded, slot ending exactly at break_ends_at is included (starts after break), break spanning full working day yields zero slots, no break block yields full day coverage
- [ ] T026 [US3] Extend `tests/Feature/BarberScheduleControllerTest.php` with break block validation: break_ends_at before break_starts_at is rejected, break outside working hours is rejected, break block stored null for closed days and restored when day re-opened

**Checkpoint**: Break block UI, storage, and slot exclusion all verified — no slots generated during break windows.

---

## Phase 6: User Story 4 — Update Existing Schedule Without Breaking Bookings (Priority: P2)

**Goal**: Barber updates their schedule; existing confirmed bookings are unaffected; new slot generation uses updated schedule.

**Independent Test**: Create a confirmed booking on Friday 10:00. Change Friday closes_at to 09:30. Verify booking record unchanged. Call `GetAvailableSlots` for Friday — verify no slots after 09:30.

**Note**: FR-014 (conflict warning before save) is deferred to F5 per plan.md research decision 4. This story covers the non-destructive update guarantee only.

### Implementation for User Story 4

- [ ] T027 [P] [US4] Verify `SaveBarberSchedule` in `app/Actions/SaveBarberSchedule.php` uses upsert (not delete + insert) so existing schedule ID and FK references are preserved; confirm no cascade-delete on schedule update reaches booking records
- [ ] T028 [US4] Extend `tests/Feature/SaveBarberScheduleTest.php` with update scenarios: saving updated times does not alter confirmed booking records, closing a day does not cancel existing bookings on that day, slot generation after update reflects new hours only

**Checkpoint**: Schedule updates are non-destructive — confirmed bookings survive all schedule changes.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, formatting, and final validation across all stories.

- [ ] T029 Run `vendor/bin/pint --dirty --format agent` and fix any style violations across all modified PHP files
- [ ] T030 Run `php artisan test --compact` and ensure all Pest tests pass with 100% coverage
- [ ] T031 Run `composer test:types` (PHPStan/Larastan) and resolve any type errors in `app/Actions/`, `app/Models/`, `app/Http/`, `app/ValueObjects/`
- [ ] T032 Run `composer test:type-coverage` and ensure 100% type coverage
- [ ] T033 Run `php artisan wayfinder:generate` to confirm Wayfinder output is up-to-date after all controller changes
- [ ] T034 Manually verify schedule form renders correctly at 320px viewport
- [ ] T035 Verify all UI colors and spacing in `resources/js/pages/onboarding/availability.tsx` use design system tokens from `design/design-system.html` only — no hardcoded values

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — BLOCKS frontend work
- **Phase 3 (US1 — P1)**: Depends on Phase 1 + Phase 2 — 🎯 MVP target
- **Phase 4 (US2 — P2)**: Depends on Phase 3 (GetAvailableSlots action must exist)
- **Phase 5 (US3 — P3)**: Depends on Phase 3 (break fields already in schema from Phase 1)
- **Phase 6 (US4 — P2)**: Depends on Phase 3 (SaveBarberSchedule action must exist)
- **Phase 7 (Polish)**: Depends on all desired stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no story dependencies
- **US2 (P2)**: Depends on US1 (GetAvailableSlots action); can run alongside US3/US4
- **US3 (P3)**: Depends on US1 (frontend + schema exist); can run alongside US2/US4
- **US4 (P2)**: Depends on US1 (SaveBarberSchedule action); can run alongside US2/US3

### Within Each Phase

- Migration tasks (T001–T003) must complete before T004 (`migrate`)
- T004 must complete before T005–T011 (models depend on tables existing)
- T005–T011 can run in parallel after T004
- Phase 2 tasks T012–T013 can run in parallel; T014 depends on T013; T015 depends on T014
- In Phase 3: T016–T017 (actions) before T018 (controller wires them); T019 (frontend) can start after T015

### Parallel Opportunities

- T005, T006, T007, T008, T009, T010, T011 — all Phase 1 model/factory tasks
- T012 (FormRequest) and T013 (Controller) in Phase 2
- T019 (frontend) and T016–T018 (backend actions + controller) can proceed in parallel once Phase 2 is done
- T022 (verify buffer) and T024 (break UI) can proceed in parallel once Phase 3 is complete
- T027 (verify upsert) can proceed in parallel with T022 and T024

---

## Parallel Example: Phase 3 (User Story 1)

```bash
# Backend actions — launch together:
Task: "Create SaveBarberSchedule action in app/Actions/SaveBarberSchedule.php"   # T016
Task: "Create GetAvailableSlots action in app/Actions/GetAvailableSlots.php"      # T017

# After actions exist, wire controller (T018), then simultaneously:
Task: "Build availability.tsx frontend page"                                       # T019
Task: "Write BarberScheduleControllerTest.php"                                     # T020
Task: "Write SaveBarberScheduleTest.php"                                           # T021
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (migrations, models, value object)
2. Complete Phase 2: Foundational (FormRequest, controller, routes, Wayfinder)
3. Complete Phase 3: User Story 1 (actions + frontend + tests)
4. **STOP and VALIDATE**: Run tests, open schedule screen, save defaults, verify slots
5. Demo / merge as MVP

### Incremental Delivery

1. Setup + Foundational → skeleton ready
2. User Story 1 → barber can configure and save a schedule (MVP)
3. User Story 2 → buffer time affects slot spacing
4. User Story 3 → break blocks exclude lunch hours from slots
5. User Story 4 → confirmed bookings survive schedule updates
6. Polish → quality gates all green

### Deferred (Out of Scope for F3)

- **FR-014 conflict warning** (US4 scenario 4 & 5): deferred to F5 per research.md Decision 4
- Per-date overrides and seasonal schedules: out of scope per spec.md assumptions

---

## Notes

- All time values stored as `'HH:MM:SS'` in DB; serialized as `'HH:MM'` to frontend
- ISO 8601 day encoding: 1=Mon … 7=Sun (Carbon `isoWeekday()`)
- No new runtime npm or Composer packages — use existing Laravel validation
- `[P]` tasks operate on different files and have no shared dependencies
- `[Story]` label maps each task to the user story for traceability
- Commit after each checkpoint to keep the branch bisectable
