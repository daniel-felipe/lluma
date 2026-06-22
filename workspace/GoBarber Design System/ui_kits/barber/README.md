# Barber Dashboard

Mobile web app for the barber. Daily tool — what's the chair look like, who's coming, what's the take.

## Screens
- **Today** (`HeroToday`, `BookingRow`) — morning hero + list of bookings with quick status.
- **Clients** — searchable regulars list.
- **Earnings** — week chart + recent payouts.
- **Booking detail** (sheet) — tap a booking to see notes, message the client, reschedule.

## Components
- `HeroToday` — dark hero strip, greeting + two stat tiles
- `BookingRow` — time, avatar, name, service, status pill (active state lifts with amber wash)
- `TabBar` — bottom 4-item nav, amber on active
- `BookingDetailSheet` — modal bottom sheet with scrim + blur

## Verified flow
1. Lands on Today.
2. Tap any booking row → bottom sheet animates up.
3. Tap × or scrim → sheet dismisses.
4. Switch tabs → Clients, Earnings.
