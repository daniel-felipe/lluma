**BarberPro — MVP Context Summary**

**Product**
A SaaS platform for barbershops in a mid-sized Brazilian city (~90k inhabitants). Two surfaces: a mobile web dashboard for barbers and a mobile web booking app for clients. No native app required — everything runs in the browser via link.

**Validated Assumption**
Demand has been confirmed locally. The product moves directly into build mode.

---

**Core Problem Being Solved**

Barbers today manage everything through WhatsApp — chaotic, unscalable, and invisible to clients outside business hours. The product replaces that with an automated scheduling system that works while the barber sleeps.

- For the barber: fill the agenda automatically, reduce no-shows, know daily revenue
- For the client: book in 3 taps without waiting for a WhatsApp reply

---

**Two Personas**

Barber (Lucas, 28): Works in a small barbershop, 15–20 clients/day, uses Instagram to attract and WhatsApp to schedule. Needs simplicity — won't tolerate complex systems. Manages everything from his phone between cuts.

Client (Rafael, 24): Books every 2–3 weeks, always at the same place. Frustrated by waiting for WhatsApp replies and arriving to a queue. Wants speed: see available times, pick one, confirm, done.

---

**The 10 MVP Features (in implementation order)**

F1 — Barber Onboarding & Profile: Phone-based signup, profile creation (name, address, photo), personalized public URL (barberpro.app/lucas-barber). Completable in under 3 minutes.

F2 — Service Catalog: CRUD for services with name, price (BRL), duration (minutes), and active/inactive toggle. Default templates offered. At least 1 active service required to publish.

F3 — Working Hours Configuration: Weekly schedule per day (open/closed, start/end time), buffer between clients (0–30 min), optional lunch block. Drives slot generation.

F4 — Booking Slot Engine: Core algorithm that combines working hours + service duration + existing bookings to return available slots in real time. Includes conflict detection, 5-minute slot locking to prevent race conditions, and a 14-day rolling availability window.

F5 — Client Booking Flow: The public-facing page. Client picks service → date → time → enters name and phone → confirms. No account required. Entire flow under 45 seconds. This is the critical milestone — after F5, the product is usable end-to-end.

F6 — Barber Daily Agenda: Default screen after login. Chronological timeline of today's bookings with statuses (upcoming, in progress, completed, no-show). Daily metrics at the top (booked, completed, revenue). Walk-in support.

F7 — Weekly Agenda View: Grid view of the full week. Horizontally scrollable on mobile. Tap a block to view details, tap an empty cell to add a manual booking.

F8 — WhatsApp Notifications: Automated messages at key moments — booking confirmation (immediate), reminder (1 hour before), cancellation notice. Uses WhatsApp Business API. Target: 30%+ reduction in no-shows.

F9 — Shareable Link & QR Code: Barber's primary distribution tool. One-tap copy, pre-built sharing for WhatsApp and Instagram, downloadable high-res QR Code for printing, basic conversion analytics (visits → bookings).

F10 — Cancellation & Rescheduling: Client can cancel via the confirmation page or by replying to the WhatsApp reminder. Rescheduling is a single flow (cancel + rebook, same service, new time). Slots released immediately. Free cancellation up to 2 hours before.

---

**Critical Path**
F1 → F2 + F3 → F4 → F5 → F6. Features F7–F10 can be built in parallel after F5 ships.

---

**Screens Designed (wireframes exist for all 10)**

Dashboard (6 screens): Login, Setup Services, Setup Hours, Daily Agenda, Weekly Agenda, Shareable Link.

Client App (4 screens): Home / Search, Barbershop Profile, Time Slot Selection, Booking Confirmation.

All wireframes are annotated with component specs and behavioral rules.

---

**Design System**
A full design system prompt has been prepared for Claude Design. Key decisions: warm amber/gold brand accent, dark theme for the barber dashboard, light theme for the client app, DM Sans or Plus Jakarta Sans typography, 4px base spacing unit, mobile-first (360–390px viewport).

---

**Business Model (for context)**
Freemium + flat monthly subscription. Free tier: 1 professional, up to 30 bookings/month. Pro plan (R$49,90/month): unlimited bookings, reminders, reports, custom link. Barbershop plan (R$89,90/month): multiple professionals, commission tracking, loyalty program.