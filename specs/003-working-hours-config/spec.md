# Feature Specification: Working Hours & Availability Configuration

**Feature Branch**: `003-working-hours-config`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "F3 · Working Hours & Availability Configuration — 7-day weekly schedule with toggle per day, start/end times, buffer between clients, optional lunch/break block per day."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initial Weekly Schedule Setup (Priority: P1)

A new barber accesses the schedule configuration screen for the first time. The system pre-fills a suggested schedule (Mon–Fri 09h–19h open, Sat 08h–17h open, Sun closed). The barber reviews the defaults, adjusts any days or times as needed, selects a buffer time between clients, and saves the schedule. From that point on, booking slots are generated based on the defined schedule.

**Why this priority**: Without a saved schedule, no booking slots can be generated. This is the minimum viable path for the barber to accept their first appointments.

**Independent Test**: Can be fully tested by opening schedule setup, accepting defaults (or making adjustments), saving, and verifying that booking slots appear for active days within the configured hours.

**Acceptance Scenarios**:

1. **Given** a barber has not yet configured a schedule, **When** they open the schedule screen, **Then** the system displays Mon–Fri 09h–19h open, Sat 08h–17h open, and Sun closed as pre-filled defaults.
2. **Given** the pre-filled schedule is displayed, **When** the barber saves without changes, **Then** the schedule is persisted and booking slots are generated for Mon–Sat within the default hours.
3. **Given** the barber sets Mon and Wed as closed, **When** the schedule is saved, **Then** no booking slots are generated for those days.
4. **Given** the barber sets end time earlier than start time for any day, **When** they attempt to save, **Then** the system prevents saving and shows a validation message.

---

### User Story 2 - Configure Buffer Time Between Clients (Priority: P2)

The barber selects how many minutes of buffer they want between consecutive appointments. This setting applies uniformly to all days and all services.

**Why this priority**: Buffer time directly affects the density and availability of booking slots. Without it, back-to-back bookings would leave no transition time, impacting service quality.

**Independent Test**: Can be tested by setting buffer to 15 minutes, using a service of 30 minutes duration, and verifying that slot intervals are spaced 45 minutes apart on booking.

**Acceptance Scenarios**:

1. **Given** the schedule screen, **When** the barber selects a buffer of 15 minutes, **Then** the system ensures at least 15 minutes of gap between the end of one appointment and the start of the next.
2. **Given** a buffer of 0 minutes is selected, **When** slots are generated, **Then** consecutive appointments may start immediately after one ends (no gap).
3. **Given** the barber changes the buffer from 10 to 30 minutes, **When** the change is saved, **Then** only future slots are recalculated; existing confirmed bookings remain unaffected.

---

### User Story 3 - Add a Lunch or Break Block (Priority: P3)

The barber optionally defines a blocked time range within a working day (e.g., 12h–13h for lunch). During this window, no booking slots are offered to clients.

**Why this priority**: Many barbers take a regular break. Without this feature they would need to manually block each lunch slot or risk double-booking during their break.

**Independent Test**: Can be tested by adding a 12h–13h break on Tuesday and verifying that no booking slots appear in that window for that day, while slots before and after the break remain available.

**Acceptance Scenarios**:

1. **Given** a working day with start 09h and end 19h, **When** the barber adds a break block from 12h to 13h, **Then** slots in that range are removed from the available booking windows.
2. **Given** the barber adds a break block with end time before start time, **When** they try to save, **Then** the system prevents saving and shows a validation message.
3. **Given** a break block is defined on a day later toggled to closed, **When** the day is saved as closed, **Then** the break block is stored but inactive; if the day is re-opened, the break block reappears.
4. **Given** no break block is set, **When** slots are generated, **Then** the full working hours range is available for booking.

---

### User Story 4 - Update Existing Schedule Without Breaking Bookings (Priority: P2)

A barber who already has confirmed appointments changes their working hours or closes a day. The system must ensure existing confirmed appointments are unaffected while new slots reflect the updated schedule.

**Why this priority**: Barbers' schedules change over time. The system must allow updates without disrupting clients who already booked.

**Independent Test**: Can be tested by booking a slot, then changing the schedule to close that day, and verifying the existing booking still appears while new slot generation no longer offers times on that day.

**Acceptance Scenarios**:

1. **Given** a confirmed booking exists on Friday at 10h, **When** the barber changes Friday's end time to 09h30, **Then** the existing booking at 10h is preserved and no new slots are offered after 09h30 on Fridays.
2. **Given** a confirmed booking exists on Saturday, **When** the barber toggles Saturday to closed, **Then** the existing booking remains intact and no new Saturday slots are generated.
3. **Given** the barber saves an updated schedule, **When** a client views available slots, **Then** only slots compliant with the new schedule are shown for future dates.
4. **Given** the barber submits a schedule change that conflicts with at least one confirmed booking, **When** they attempt to save, **Then** the system displays a warning listing the affected bookings and asks for confirmation before proceeding.
5. **Given** the conflict warning is shown, **When** the barber cancels the action, **Then** the schedule remains unchanged and no bookings are affected.

---

### Edge Cases

- What happens when start time equals end time for a working day? System must treat the configuration as invalid and show a validation error.
- What happens when the break block overlaps with the start or end of the working day? System must reject the configuration.
- What happens when a service duration is longer than the remaining time between the break block and end of day? No slot is generated for that window.
- How does the system handle 15-minute granularity enforcement? All time inputs must snap to or accept only 15-minute increments (00, 15, 30, 45).
- What if the barber sets a break block that exactly spans the full working day? System must treat it as a validation error (no available time remains).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a 7-day weekly schedule view with an open/closed toggle per day.
- **FR-002**: For each active (open) day, system MUST allow the barber to set a start time and an end time.
- **FR-003**: All time values MUST be restricted to 15-minute increments (00, 15, 30, 45 minutes past the hour).
- **FR-004**: System MUST offer buffer time options between appointments: 0, 5, 10, 15, and 30 minutes.
- **FR-005**: The selected buffer time MUST apply uniformly across all working days and all service types. Buffer applies only between consecutive appointments — the first slot of the day starts exactly at the configured working hours start time, with no buffer offset.
- **FR-006**: System MUST allow the barber to optionally define one break block (start time + end time) per working day.
- **FR-007**: Break blocks MUST prevent any booking slots from being generated during that time window.
- **FR-008**: System MUST pre-fill a default schedule for new barbers: Mon–Fri 09h–19h open, Sat 08h–17h open, Sunday closed.
- **FR-009**: System MUST validate that end time is strictly after start time for both working hours and break blocks.
- **FR-010**: System MUST validate that break block start and end times fall strictly within the day's working hours.
- **FR-011**: Schedule MUST serve as the source of truth for generating available booking slots on-demand — slots are calculated in real-time when a client opens the booking screen, using the current schedule + service duration (from F2) + buffer time. No slots are pre-computed or stored separately.
- **FR-012**: Changes to the schedule MUST only affect future slot generation; existing confirmed bookings MUST remain unchanged.
- **FR-014**: Before saving a schedule change that conflicts with one or more confirmed bookings, the system MUST display a warning listing the affected bookings and require explicit barber confirmation to proceed.
- **FR-013**: The schedule configuration MUST be persistently saved per barber profile.

### Key Entities

- **WeeklySchedule**: The barber's recurring 7-day availability configuration. Belongs to one barber; contains one DaySchedule per day of the week.
- **DaySchedule**: Configuration for a single day of the week. Attributes: day of week, open/closed status, start time, end time, optional break block.
- **BreakBlock**: A blocked time window within a working day. Attributes: break start time, break end time. At most one per DaySchedule.
- **BufferTime**: A barber-level setting representing the minimum gap (in minutes) enforced between consecutive appointments. Shared across all days and services.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A barber can complete their full weekly schedule configuration (all 7 days, buffer, and at least one break block) in under 1 minute from first opening the screen.
- **SC-002**: Generated booking slots correctly reflect the combination of service duration, buffer time, and break blocks — verified by scenario tests covering all constraint combinations.
- **SC-003**: Existing confirmed bookings are never cancelled or modified as a result of a schedule update — zero unintended booking disruptions.
- **SC-004**: At least 90% of barbers complete schedule setup on their first attempt without encountering a blocking validation error caused by interface confusion.
- **SC-005**: All time inputs enforce 15-minute granularity; no time values outside the allowed increments can be saved.

## Clarifications

### Session 2026-04-08

- Q: Quando um cliente abre a tela de agendamento, os horários disponíveis são determinados de que forma? → A: On-demand — horários calculados em tempo real ao cliente abrir a tela; nenhum slot é pré-computado ou armazenado separadamente.
- Q: Quando uma mudança de agenda entra em conflito com reservas já confirmadas, o sistema deve fazer o quê? → A: Alertar antes de salvar — exibir a lista de reservas afetadas e solicitar confirmação do barbeiro antes de prosseguir.
- Q: O buffer time aplica-se antes do primeiro atendimento do dia, ou apenas entre atendimentos consecutivos? → A: Apenas entre atendimentos — o primeiro slot do dia começa exatamente no horário de abertura; o buffer não adiciona gap antes do primeiro slot.

## Assumptions

- Each barber has exactly one weekly schedule that repeats every week; per-date overrides and seasonal schedules are out of scope for this feature.
- Buffer time is a single global value per barber — not configurable per service or per day.
- Only one break block per day is supported; multiple break windows per day are out of scope for this feature.
- Time zone resolution is handled by the system using the barber's profile/location setting and is not part of this feature's configuration.
- The schedule configuration is accessible only by the authenticated barber who owns it; admin overrides are out of scope.
- "Future slots" means any slot starting after the moment the schedule change is saved — there is no buffered grace period.
- Slot generation (combining schedule + service duration + buffer) is an internal system concern; barbers configure only the inputs.
- A 5-minute buffer option is valid alongside the 15-minute granularity rule: it applies between appointments, not as a slot increment.
