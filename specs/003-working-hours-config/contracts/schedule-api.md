# API Contracts: Working Hours & Availability Configuration

**Branch**: `003-working-hours-config` | **Date**: 2026-04-08  
**Transport**: Inertia.js v3 (server-side rendering + XHR); no REST/JSON page endpoints.

---

## Routes

| Method | URI | Controller | Route Name |
|--------|-----|-----------|------------|
| GET | `onboarding/availability` | `BarberScheduleController@show` | `onboarding.availability.show` |
| PUT | `onboarding/availability` | `BarberScheduleController@update` | `onboarding.availability.update` |

Both routes require `auth` middleware. No additional middleware.

---

## GET `onboarding/availability`

### Inertia Props (server → client)

```typescript
type SchedulePageProps = {
  schedule: {
    buffer_minutes: 0 | 5 | 10 | 15 | 30;
    days: {
      day_of_week: 1 | 2 | 3 | 4 | 5 | 6 | 7;  // 1=Mon … 7=Sun
      is_open: boolean;
      opens_at: string | null;      // 'HH:MM' (24h), null when closed
      closes_at: string | null;     // 'HH:MM' (24h), null when closed
      break_starts_at: string | null;
      break_ends_at: string | null;
    }[];
  };
  is_onboarding: boolean;
  onboarding_step: 'availability';
  steps: ['profile', 'services', 'availability'];
};
```

**Note**: When no schedule exists yet, the controller returns default values (Mon–Fri 09:00–19:00, Sat 08:00–17:00, Sun closed, buffer_minutes = 0). Times are serialized as `'HH:MM'` (display format) for the frontend; stored as `'HH:MM:SS'` internally.

---

## PUT `onboarding/availability`

### Request Body (client → server via Inertia `useForm`)

```typescript
type UpdateSchedulePayload = {
  buffer_minutes: 0 | 5 | 10 | 15 | 30;
  days: {
    day_of_week: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    is_open: boolean;
    opens_at: string | null;       // 'HH:MM', required when is_open=true
    closes_at: string | null;      // 'HH:MM', required when is_open=true
    break_starts_at: string | null;
    break_ends_at: string | null;
  }[];  // must include all 7 days
};
```

### Server Validation (`UpdateBarberScheduleRequest`)

| Field | Rule |
|-------|------|
| `buffer_minutes` | required, integer, in:0,5,10,15,30 |
| `days` | required, array, size:7 |
| `days.*.day_of_week` | required, integer, between:1,7 |
| `days.*.is_open` | required, boolean |
| `days.*.opens_at` | required_if:is_open,true \| nullable \| date_format:H:i \| 15-minute increment |
| `days.*.closes_at` | required_if:is_open,true \| nullable \| date_format:H:i \| after:opens_at \| 15-minute increment |
| `days.*.break_starts_at` | nullable \| date_format:H:i \| after_or_equal:opens_at \| before:closes_at \| 15-minute increment |
| `days.*.break_ends_at` | required_with:break_starts_at \| nullable \| date_format:H:i \| after:break_starts_at \| before_or_equal:closes_at \| 15-minute increment |

### Responses

| Outcome | Inertia Response |
|---------|-----------------|
| Valid save (first time) | Redirect to `onboarding.availability.show` (onboarding_step → Complete) |
| Valid save (update) | Redirect to `onboarding.availability.show` |
| Validation error | Back with Inertia validation errors on field paths |

**FR-014 note**: Conflict detection with confirmed bookings is deferred to F5. In F3, all saves proceed without a conflict warning.

---

## Wayfinder Usage

After adding the controller, run:
```bash
php artisan wayfinder:generate
```
Frontend imports:
```typescript
import { BarberScheduleController } from '@/actions/BarberScheduleController';
// BarberScheduleController.show()  → GET onboarding/availability
// BarberScheduleController.update() → PUT onboarding/availability
```
