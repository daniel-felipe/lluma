# GoBarber Design System

A complete visual + interaction system for **GoBarber**, a SaaS product for independent barbers and small shops. Two surfaces:

- **Barber Dashboard** (`ui_kits/barber/`) — mobile web. The barber's daily tool: today's chair, upcoming bookings, clients, earnings.
- **Client Booking** (`ui_kits/client/`) — mobile web. The customer's booking flow: pick a barber, pick a service, pick a time, pay.

Both surfaces share the same tokens, type, and components.

## Brand in one line
> Premium streetwear meets clean SaaS — the warmth of a neighborhood shop with the precision of a software tool a young, skilled barber would actually pay for.

## Sources
This system was built **without an attached codebase, Figma, or screenshots** — the brand was defined here. If a real codebase or Figma exists, drop it in and we'll reconcile. Substitutions are flagged below.

---

## Index — files in this project

| Path | What's in it |
|---|---|
| `README.md` | This file. Brand, content, visual, iconography. |
| `SKILL.md` | Skill manifest for invocation. |
| `colors_and_type.css` | All design tokens — colors, type, spacing, radii, shadows, motion. |
| `assets/` | Logos (mark + wordmark, dark + light), brand SVGs. |
| `preview/` | Cards rendered in the Design System tab. |
| `ui_kits/barber/` | Barber Dashboard kit — `index.html` + JSX components. |
| `ui_kits/client/` | Client Booking kit — `index.html` + JSX components. |
| `ui_kits/shared/` | Reusable JSX components used by both kits. |

---

## Content fundamentals

**Voice.** Plain-spoken, confident, dry. The barber on the chair next to you who has done this for ten years and doesn't oversell it. Never hypes. Never apologizes either. Cuts the fat.

**Person.** Talk to the user as **you**. Use **we** sparingly — only when GoBarber is actively doing something on the user's behalf ("We'll text Marcus when you're 5 min out"). Never the royal we.

**Casing.** Sentence case for almost everything — buttons, headings, nav. UPPERCASE eyebrows are the only place we go all-caps, and only in tracking-wide labels (`TODAY`, `BOOKED`, `EARNINGS`). Never SHOUTING in body copy.

**Numbers.** Tabular nums for money, time, counts. Currency leads with symbol, no decimals when whole (`$45`, not `$45.00`). 12-hour time with lowercase am/pm (`2:30pm`).

**Punctuation.** No exclamation marks. Em dashes are fine — used like this. Oxford commas. End buttons and short labels with no period; end full sentences with one.

**Emoji.** No. Not in product UI, not in copy, not in marketing. We use icons.

**Examples — good ✓**
- Button: `Book a chair`
- Empty state: `No bookings today. Slow days happen — go pull espresso.`
- Confirmation: `You're booked with Marcus for 2:30pm Saturday.`
- Push: `Marcus is wrapping up. You're next.`
- Error: `That time just got taken. Try 3:15pm instead.`

**Examples — bad ✗**
- ~~`Book your chair now! 💈`~~ — emoji + exclamation + redundant "your"
- ~~`We're so excited to confirm your booking!!`~~ — hype
- ~~`Oops! Something went wrong.`~~ — apology + vague
- ~~`BOOK NOW`~~ — ALL CAPS button copy

**Vocabulary.**
- "Chair" not "appointment slot"
- "Walk-in" not "ad-hoc booking"
- "Regular" not "loyal customer"
- "On the books" not "scheduled"
- Money is "earnings" or "take" — not "revenue", not "income"

---

## Visual foundations

### Color
- **Ink** (off-black, `#15130F` family) is the dominant inverse surface — splash screens, hero panels, the barber dashboard's morning view. Warm-tinted, never pure black.
- **Bone** (cream, `#FAF7F2` family) is the dominant light surface. Warmer than off-white. Reads as paper, a fresh towel, marble.
- **Amber** (`#B86F1F`) is the **only** accent. Used on primary CTAs, the active state of nav, the confirmed-booking dot. Don't add a second accent — restraint is the point.
- **Semantics**: muted earthy green (confirmed, available), terra-red (cancelled, error), slate blue (info, used rarely). All desaturated to live next to amber without clashing.

### Type
- **Display:** Cabinet Grotesk (substituted with Space Grotesk via Google Fonts — see substitutions). Tight, confident, slightly squared. Used for headings and big numbers.
- **Body:** Inter Tight. Workhorse. 14–16px on mobile.
- **Mono:** JetBrains Mono. Used for booking IDs, receipt numbers, time slots. Sparingly.
- **Tracking:** display always tight (`-0.02em`). Eyebrow caps wide (`+0.08em`). Body neutral.

### Spacing
4-point base. Mobile screens hold ~16px outer padding, 12px inner gaps in cards. Generous vertical rhythm — never crammed.

### Backgrounds
- Default: solid `bone-50` for client app, solid `ink-900` for the dashboard's hero strip; otherwise solid `bone-50`.
- **No** glassmorphism, **no** rainbow gradients, **no** stock photos.
- Subtle **warm grain** is acceptable as a 3–5% noise overlay on the dark hero panel only — gives the off-black some life. Never on light surfaces.
- Full-bleed barber portraits are used on the booking detail screen (warm, slightly desaturated, soft natural light — never blown-out, never moody-blue).

### Animation
- Default easing: `cubic-bezier(0.22, 1, 0.36, 1)` (--ease-out). Things settle, they don't bounce.
- Tap feedback: 120ms scale 0.97 + slight inner shadow. Press, not bounce.
- Sheet enter: 320ms slide-up + fade. Sheet exit: 200ms.
- No spinners under 1s — show the actual data path or a skeleton. If you must spin, use a single thin amber arc.
- No parallax, no float-on-scroll, no marquee.

### States
- **Hover** (web only — most users are touch): bg darkens 4–6% on light surfaces; lightens 6% on dark.
- **Press:** scale `0.97`, inner shadow `--shadow-inset-press`. 120ms.
- **Focus:** 2px amber ring, 2px offset. Always visible, never `outline: none`.
- **Disabled:** 40% opacity, no pointer events. Don't grey-out by changing color — just dim.

### Borders
1px hairlines in `--bone-200` on light, `--ink-700` on dark. Cards use a hairline + soft shadow, never one or the other alone (hairline keeps the edge crisp on retina).

### Shadows
Two-layer, warm-tinted (alpha on `#15130F`, not `#000`). Four elevations:
1. `--shadow-1` — resting card
2. `--shadow-2` — raised card / dropdown
3. `--shadow-3` — sheet, modal
4. `--shadow-4` — splash overlay
Inner shadows on pressed buttons and sunken inputs.

### Capsules vs protection gradients
Buttons and chips are **capsule** (`--radius-pill`) **or** rectangle with `--radius-sm` — pick one per surface and stick. Avatars circular. Time-slot chips rectangular sm. Status pills capsule.

### Layout rules
- Mobile fixed elements: top nav (56px), bottom tab bar (72px incl. safe area), or a single sticky bottom CTA (88px incl. safe area). Never both a tab bar AND a bottom CTA.
- Content padding: 16px horizontal on mobile.
- Sections stack with 32px gap.

### Transparency & blur
Used sparingly. Only on the modal scrim (`rgba(14, 13, 11, 0.6)` + 8px backdrop blur) and the dark hero strip's bottom protection gradient. Not on cards, not on nav.

### Imagery vibe
Warm. Natural light. Slight grain on photography. **No** bluish-cool tones, **no** heavy filters, **no** stock-photo-of-a-team. Real barber portraits or product shots (clippers, capes) — always with bone or warm-wood backgrounds.

### Corner radii
- Inputs/buttons: 8px
- Cards: 12px
- Sheets/modals: 16px (top corners only on bottom sheets)
- Hero blocks: 24px
- Avatars + status dots: 999px (circle)

### Card anatomy
Resting card = `bg-surface` (`#FFFFFF`) + 1px hairline + `--shadow-1` + 12px radius + 16px inner padding. On dark surfaces, drop the shadow and use `bg-raised` (`--ink-800`) + `--ink-700` hairline instead.

---

## Iconography

- **Library:** [Lucide](https://lucide.dev), 1.75px stroke, 20×20 default size. Loaded from CDN (`unpkg.com/lucide-static`). No emoji.
- **Why Lucide:** clean, neutral, well-supported, free. Fits the "modern SaaS" half of the brand. We never mix icon families.
- **Sizing:** 16px (in dense rows), 20px (default, in nav and buttons), 24px (in headers), 32px (empty states).
- **Color:** icons inherit `currentColor`. Active = `--accent`. Default = `--fg-2`. Muted = `--fg-4`.
- **Custom icons:** the **mark** in `assets/logo-mark.svg` is the only branded mark. Don't redraw it — copy the SVG.
- **Unicode chars:** allowed for `•` separators, `→` directional indicators, `×` close (use a real X icon when possible). No other unicode glyphs.

If a custom icon is needed, draw it at 24px on a 24px grid, 1.75px stroke, rounded caps, rounded joins, no fills — match Lucide.

---

## Substitutions to flag

> **Action: replace these when you have the real assets.**

| Token | Substituted with | Original (intended) |
|---|---|---|
| `--font-display` | Space Grotesk (Google) | Cabinet Grotesk (commercial) |
| Logo | Custom SVG (drawn here) | Final brand mark from designer |
| Photography | Placeholder blocks | Real barber portraits |

