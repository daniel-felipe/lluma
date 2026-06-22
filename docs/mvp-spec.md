# BarberPro — MVP Feature Plan

## Implementation Order & Dependencies

```
F1 → F2 → F3 → F4 → F5 → F6 → F7 → F8 → F9 → F10
│         │              │         │
└ Core ───┘   ┌──────────┘         └── Growth
              │
         Scheduling
```

---

## F1 · Barber Onboarding & Profile

**What it does:**
A barber signs up with phone number, creates their profile (name, address, photo), and gets a personalized public page URL (barberpro.app/lucas-barber).

**Scope:**
- Registration via phone + SMS verification code
- Profile creation: name, business name, address, profile photo, cover photo
- Auto-generated public URL slug (editable)
- Login / logout / session persistence

**Key rules:**
- Onboarding must be completable in under 3 minutes
- Phone number is the primary identifier (no email required)
- Slug must be unique, auto-suggested from business name
- Profile is incomplete (and unpublished) until F2 and F3 are also done

**Success criteria:**
- Barber goes from zero to published profile in under 5 minutes (including F2 + F3)
- 90%+ onboarding completion rate (no drop-off between steps)

---

## F2 · Service Catalog Management

**What it does:**
The barber registers the services they offer, each with a name, price, and duration. Services can be toggled on/off without deleting.

**Scope:**
- CRUD for services (create, read, update, delete)
- Each service has: name, price (BRL), duration (minutes), active/inactive toggle
- Default templates offered on first setup ("Corte", "Barba", "Combo") — barber can accept or customize
- Reorder services (display order on client-facing page)

**Key rules:**
- At least 1 active service required to publish the profile
- Duration drives slot calculation in F4
- Price is displayed to the client — must always be up to date
- Deleting a service with future appointments triggers a warning

**Success criteria:**
- Average barber sets up 3 services in under 2 minutes
- Service changes reflect immediately on the public booking page

---

## F3 · Working Hours & Availability Configuration

**What it does:**
The barber defines their weekly schedule: which days they work, start/end times, and buffer between appointments.

**Scope:**
- 7-day weekly schedule with toggle per day (open/closed)
- Start time and end time per active day
- Buffer time between clients (0, 5, 10, 15, 30 min)
- Lunch/break block: a blocked time range per day (optional)

**Key rules:**
- Schedule is the source of truth for available slots — combined with service duration (F2) to generate bookable time slots
- Changes to schedule only affect future slots (existing bookings are preserved)
- Default suggestion: Mon–Fri 09–19h, Sat 08–17h, Sun closed
- Minimum granularity: 15-minute increments

**Success criteria:**
- Schedule setup takes under 1 minute
- Generated slots correctly account for service duration + buffer + breaks

---

## F4 · Booking Slot Engine

**What it does:**
The core scheduling engine. Combines working hours (F3) + service durations (F2) + existing bookings to calculate and expose available time slots in real time.

**Scope:**
- Slot generation algorithm: given a date, service, and barber → return available start times
- Conflict detection: no double bookings, respects buffer time
- Slot locking: when a client starts the booking flow, the slot is temporarily held (5-min TTL) to prevent races
- Rolling availability window: clients can book up to 14 days ahead

**Key rules:**
- Slots are calculated dynamically, not stored as fixed records
- A slot is "available" only if: the barber is working that day, the time fits within working hours, no existing booking overlaps (including buffer), and no manual block exists
- If barber changes schedule or adds a manual block, affected future slots disappear instantly
- Temporary hold expires if client doesn't confirm within 5 minutes

**Success criteria:**
- Slot calculation responds in under 200ms
- Zero double-bookings in production
- Concurrent booking attempts for the same slot are handled gracefully (one wins, one gets "slot taken" message)

---

## F5 · Client Booking Flow

**What it does:**
The client-facing booking experience. A client opens the barber's public page, picks a service, selects a date and time, provides their name/phone, and confirms.

**Scope:**
- Public barber page (accessible via URL, no login required to browse)
- Service selection screen
- Date picker (horizontal scroll, next 14 days)
- Time slot grid (powered by F4)
- Booking confirmation: client provides name + phone number
- Confirmation screen with full summary
- Booking saved to database, barber notified

**Key rules:**
- No app download required — works as a mobile web page
- Client does NOT need an account to book (name + phone is enough for MVP)
- The entire flow must be completable in 3 taps + typing name/phone
- After confirmation, client sees: service, barber, date, time, address, price
- Duplicate booking prevention: same phone can't book overlapping times at the same barber

**Success criteria:**
- Median time from opening the page to confirmed booking: under 45 seconds
- Booking conversion rate (page visit → confirmed booking): 25%+
- Works flawlessly on mobile Chrome and Safari

---

## F6 · Barber Daily Agenda View

**What it does:**
The barber's main screen after login. Shows today's schedule as a timeline: who's coming, when, what service, and status of each appointment.

**Scope:**
- "Today" view: chronological list of all bookings for the current day
- Each booking card shows: time, client name, service, price, status
- Booking statuses: upcoming, in progress (current), completed, no-show, cancelled
- Status actions: swipe or tap to mark as completed / no-show
- Empty slot indicator ("vago") with quick "add walk-in" action
- Daily summary metrics at top: total booked, completed, revenue so far

**Key rules:**
- This is the default screen after login — must load instantly
- "In progress" is auto-determined by current time vs. booking time
- Marking a booking as "completed" or "no-show" is irreversible (to keep data clean)
- Walk-in adds a booking retroactively (for revenue tracking)

**Success criteria:**
- Barber checks this screen 5+ times per day (it's their control center)
- All status changes reflect in under 1 second
- Daily revenue calculation is accurate to the cent

---

## F7 · Weekly Agenda View

**What it does:**
A bird's-eye view of the barber's week. Shows a grid of days × time slots with bookings represented as colored blocks.

**Scope:**
- Grid layout: 7 columns (days) × time rows (based on working hours)
- Each booking appears as a block with client name
- Navigate between weeks (previous / next)
- Today's column highlighted
- Tap on a booking block → view details
- Tap on an empty cell → quick manual booking

**Key rules:**
- Horizontally scrollable on mobile (6–7 columns don't fit in 360px)
- Visual density: compact enough to show the full picture, readable enough to identify clients
- Color coding by status: confirmed, completed, cancelled
- Week starts on Monday (Brazilian standard)

**Success criteria:**
- Barber can assess their week's load in a single glance
- Manual bookings (phone/walk-in) can be added in under 15 seconds

---

## F8 · WhatsApp Notifications

**What it does:**
Automated messages sent to the client via WhatsApp at key moments in the booking lifecycle.

**Scope:**
- Booking confirmation message (sent immediately after booking)
- Reminder message (sent 1 hour before the appointment)
- Cancellation confirmation (if client or barber cancels)
- Message content is pre-defined templates with dynamic variables (client name, service, date, time, barber name, address)

**Key rules:**
- Use WhatsApp Business API (or a provider like Evolution API, Z-API, or Twilio)
- Messages must feel personal, not robotic — written in casual Brazilian Portuguese
- Client can reply to the reminder to cancel (parse "cancelar" as intent)
- If WhatsApp delivery fails, fall back to SMS
- Barber can preview and customize message templates from their dashboard

**Message templates:**

Confirmation:
> Oi {client_name}! Seu horário tá confirmado ✅
> 📅 {date} às {time}
> ✂️ {service} com {barber_name}
> 📍 {address}
> Até lá!

Reminder (1h before):
> Lembrete: seu horário é daqui a 1 hora!
> ✂️ {service} às {time} com {barber_name}
> Precisando reagendar? Responda aqui.

**Success criteria:**
- 95%+ message delivery rate
- No-show rate drops by 30%+ after enabling reminders
- Messages sent within 10 seconds of trigger event

---

## F9 · Shareable Booking Link & QR Code

**What it does:**
The barber's primary distribution tool. A shareable link and QR code that sends clients directly to their public booking page.

**Scope:**
- Personalized URL displayed prominently in the dashboard
- One-tap copy to clipboard
- Pre-built sharing: WhatsApp (sends a ready-made message with the link), Instagram (copies link for bio), Facebook (share post), generic copy
- QR Code auto-generated from the URL
- QR Code downloadable as PNG (print-ready, high resolution)
- Basic link analytics: total visits, bookings via link, conversion rate

**Key rules:**
- The link IS the product's distribution channel — it must be frictionless to share
- WhatsApp share sends a pre-written message: "Agenda seu horário comigo aqui: {link} ✂️"
- QR Code must be large enough to scan when printed on a small poster
- Analytics are simple counters — no complex tracking (MVP)

**Success criteria:**
- 80%+ of barbers share their link within the first week
- QR Code scans account for 10%+ of bookings (printed in the barbershop)
- Link loads in under 2 seconds on 4G

---

## F10 · Cancellation & Rescheduling

**What it does:**
Allows clients to cancel or reschedule their booking, and barbers to cancel from their side. Freed slots become immediately available.

**Scope:**
- Client cancellation: via confirmation screen or WhatsApp reply ("cancelar")
- Client rescheduling: cancel + rebook in a single flow (pre-selects same service)
- Barber cancellation: from the daily/weekly agenda, with reason (optional)
- Cancellation policy: free cancellation up to 2 hours before appointment
- When a booking is cancelled, the slot is instantly released back to the pool
- Both parties receive a WhatsApp notification on cancellation

**Key rules:**
- Cancellation within the policy window: free, no friction
- Late cancellation (under 2 hours): allowed but flagged — barber sees it in client history (useful for identifying unreliable clients later)
- Barber-initiated cancellation always sends a client notification with apology
- Rescheduling preserves the client's info — they only need to pick a new time
- Cancelled bookings are soft-deleted (kept for analytics, not shown in active views)

**Success criteria:**
- Rescheduling takes under 20 seconds
- Freed slots appear as available within 5 seconds
- No orphaned bookings (every cancellation properly releases the slot)

---

## Implementation Summary

| #  | Feature                        | Depends on | Estimated effort |
|----|--------------------------------|------------|-----------------|
| F1 | Barber Onboarding & Profile    | —          | Small           |
| F2 | Service Catalog                | F1         | Small           |
| F3 | Working Hours Config           | F1         | Small           |
| F4 | Booking Slot Engine            | F2, F3     | Medium          |
| F5 | Client Booking Flow            | F4         | Medium          |
| F6 | Barber Daily Agenda            | F5         | Medium          |
| F7 | Weekly Agenda View             | F6         | Small           |
| F8 | WhatsApp Notifications         | F5         | Medium          |
| F9 | Shareable Link & QR Code       | F1, F5     | Small           |
| F10| Cancellation & Rescheduling    | F5, F8     | Medium          |

**Critical path:** F1 → F2 + F3 → F4 → F5 → F6
**After F5 is live, the product is usable.** F6–F10 improve the experience but the core value (client books, barber sees it) is delivered by F5.