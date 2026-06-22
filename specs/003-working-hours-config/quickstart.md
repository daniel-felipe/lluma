# Quickstart: Working Hours & Availability Configuration

**Branch**: `003-working-hours-config` | **Date**: 2026-04-08

---

## Prerequisites

- Feature F2 (Service Catalog) merged and migrations run.
- Running `php artisan migrate` after F2 brought `services` table live.

---

## Implementation Order

Follow this sequence to minimize rework and keep tests green at each step.

### Step 1 — Migrations

```bash
# Create schedule tables
php artisan make:migration create_barber_schedules_table --no-interaction
php artisan make:migration create_barber_schedule_days_table --no-interaction
php artisan make:migration drop_availability_slots_table --no-interaction

php artisan migrate
```

### Step 2 — Models & Value Object

```bash
php artisan make:model BarberSchedule --no-interaction
php artisan make:model BarberScheduleDay --no-interaction
# (manually convert AvailabilitySlot from Eloquent model to readonly value object)
```

Update `BarberProfile`:
- Remove `availabilitySlots(): HasMany` → add `schedule(): HasOne<BarberSchedule>`

### Step 3 — Update `PublishBarberProfile`

Change availability check:
```php
// Before (F3 stub):
if ($profile->availabilitySlots()->count() === 0) { return $profile; }

// After:
if ($profile->schedule === null) { return $profile; }
```

### Step 4 — Actions

```bash
php artisan make:action "SaveBarberSchedule" --no-interaction
php artisan make:action "GetAvailableSlots" --no-interaction
```

- `SaveBarberSchedule::run(BarberProfile, array $data): BarberSchedule` — upserts schedule + 7 days; advances onboarding step.
- `GetAvailableSlots::run(BarberSchedule, int $serviceDurationMinutes, \DateTimeImmutable $date): array<AvailabilitySlot>` — pure on-demand computation.

### Step 5 — FormRequest & Controller

```bash
php artisan make:request UpdateBarberScheduleRequest --no-interaction
php artisan make:controller BarberScheduleController --no-interaction
```

### Step 6 — Routes

Add to `routes/web.php` inside the `auth` middleware group (alongside existing onboarding routes):
```php
Route::get('onboarding/availability', [BarberScheduleController::class, 'show'])
    ->name('onboarding.availability.show');
Route::put('onboarding/availability', [BarberScheduleController::class, 'update'])
    ->name('onboarding.availability.update');
```

### Step 7 — Wayfinder

```bash
php artisan wayfinder:generate
```

### Step 8 — Frontend

Create `resources/js/pages/onboarding/availability.tsx`.

Key UI elements:
- 7-day grid with toggle (open/closed) per row
- Time pickers for opens_at/closes_at (15-minute increments, 24h format)
- Optional break block per day (collapsible, same time picker pattern)
- Global buffer selector: radio/select with options 0/5/10/15/30 min
- Save button → Inertia `useForm` PUT to `BarberScheduleController.update()`

---

## Quality Gates Checklist

Run before opening a PR:

```bash
php artisan test --compact                  # all Pest tests pass, 100% coverage
composer test:types                         # PHPStan/Larastan, zero errors
composer test:type-coverage                 # 100% type coverage
vendor/bin/pint --dirty                     # zero style violations
php artisan wayfinder:generate              # Wayfinder up-to-date
```

Also verify manually:
- [ ] Schedule form works at 320px viewport
- [ ] All colors/spacing from `design/design-system.html` tokens
- [ ] No hardcoded URLs in frontend (Wayfinder only)
