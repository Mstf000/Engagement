# TFTF & RORO — Engagement Invitation Website Design Spec

**Date:** 2026-05-19  
**Engagement date:** 3 July 2026  
**Location:** Luxor, Egypt  
**Couple:** Mostafa (TFTF) from Cairo × Nourhanne (RORO) from Luxor

---

## 1. Overview

A mobile-first, single-page engagement invitation website. Visitors receive a link and experience a scrollable invitation — no login, no RSVP form, purely presentational. Deployed to Vercel as a static site.

---

## 2. Color Palette

| Token         | Hex       | Usage                                      |
|---------------|-----------|--------------------------------------------|
| `sage`        | `#7B9E77` | Accents, borders, RSVP hero background     |
| `sage-mid`    | `#9DC49A` | Seam line, amp lines, subtle borders        |
| `sage-pale`   | `#EAF5E8` | Hero background, footer background         |
| `sage-bg`     | `#F2FAF1` | Countdown section background               |
| `white`       | `#FFFFFF` | All content section backgrounds            |
| `text`        | `#1E2E1C` | Primary text (headings, names)             |
| `text-mid`    | `#5A7A58` | Secondary text, captions, labels           |

**Rules:**
- No black backgrounds
- No brown or dark backgrounds
- Light mode only throughout

---

## 3. Typography

| Role            | Font                  | Style           | Size (mobile) |
|-----------------|-----------------------|-----------------|---------------|
| Display names   | Playfair Display      | Italic 300      | 62px          |
| Section titles  | Playfair Display      | Italic 400      | 22px          |
| Labels / eyebrows | Cinzel              | Regular 400     | 7–8px + tracking |
| Body / captions | Cormorant Garamond    | Regular / Italic | 14–17px       |
| Countdown numbers | Cormorant Garamond  | Light 300       | 36px          |

---

## 4. Sections (top to bottom)

### 4.1 Hero
- **Background:** `sage-pale` (#EAF5E8)
- **Layout:** Full viewport height (100dvh)
- **Top 52%:** Cairo × Luxor split photos
  - Left half: Cairo cityscape photo (Unsplash)
  - Right half: Luxor temple photo (Unsplash)
  - Photos fade into `sage-pale` at the bottom via gradient overlay
  - City tags ("CAIRO", "LUXOR") in white text at top corners
  - Vertical gold-sage seam line with diamond dot at center
- **Bottom 48%:** Centered text on sage-pale
  - Eyebrow: "ENGAGEMENT" (Cinzel, tracked)
  - Names: TFTF / & / RORO (Playfair Display italic, large)
  - Date: `3 · JULY · 2026`
  - Horizontal rule
  - Location: `LUXOR`
  - Scroll cue ("SCROLL ▾") at bottom

### 4.2 Countdown
- **Background:** `sage-bg` (#F2FAF1)
- **Title:** "Until We Say Yes"
- **Grid:** 4 boxes (Days / Hours / Mins / Secs)
  - White box, sage border, sage number, sage-mid label
  - Live JavaScript countdown to `2026-07-03T18:00:00`
  - Box flips with CSS animation on each second change

### 4.3 Details
- **Background:** `white`
- **2 cards** with sage-pale icon circles and sage left-accent
  1. Date — Friday, 3rd July 2026 / Evening celebration
  2. Location — Luxor, Egypt / Venue details to follow

### 4.4 Map — Two Cities, One Love
- **Background:** `white`
- **Title:** "Two Cities, One Love"
- **Eyebrow:** "OUR STORY"
- Real interactive map using **Leaflet.js + CartoDB Positron** tiles (clean, light, paper-like style)
- Map locked (no pan/zoom) — purely decorative, centered on Egypt at zoom 6
- **Cairo** pin in the north (TFTF's city) with pulsing ripple ring
- **Luxor** pin in the south (RORO's city) with pulsing ripple ring
- **Animated dashed route line** drawing from Cairo → Luxor with marching-ants dash offset

**Avatar animation sequence (auto-plays on scroll into view):**
1. RORO's circular photo badge appears in Luxor — gently bobs side to side (waiting)
2. TFTF's circular photo badge appears in Cairo — bounces as he travels
3. TFTF's badge travels south along the route, dashed line draws behind him
4. On arrival: both badges jump, "🎉 Together at last!" bubble pops, hearts/leaves burst
5. Avatars settle in Luxor together

**Avatar badges:**
- 38px circular photo frames, `object-fit:cover`
- TFTF: dark sage border (`#2D4A2B`) — photo placeholder is initial "M"
- RORO: sage border (`#7B9E77`) — photo placeholder is initial "N"
- Real photo URLs dropped in at build time via `src` attribute
- `onerror` fallback shows initial if photo fails to load

**Below map:**
- Distance badge: `500 km apart · one heart`
- Caption: *"He came from the north. She waited in the south. Luxor brought them together."*

### 4.6 Message
- **Background:** `white`
- Ornamental leaf glyph (❧) in sage-mid
- Italic quote: *"From Cairo to Luxor, two hearts found their way to each other. Join us as we celebrate the beginning of forever."*
- Signature: `TFTF & RORO · 2026`

### 4.7 Closing
- **Background:** `sage` (#7B9E77)
- White names in large Playfair italic
- Tagline: *"would love your presence"*
- No button / no form — decorative closing section only

### 4.8 Footer
- **Background:** `sage-pale`
- Names in Playfair italic
- Date + location in Cinzel tracked

---

## 5. Animations

| Element            | Animation                                    | Trigger        |
|--------------------|----------------------------------------------|----------------|
| Floating leaves 🌿       | `floatUp` — drift from bottom to top, fade              | Continuous loop         |
| Hero seam line           | `drawLine` — clip-path reveal top→bottom                | On load                 |
| Seam diamond             | `popIn` — scale from 0 with spring                      | On load ~1.4s           |
| Names + eyebrow          | `fadeUp` — staggered translateY + opacity               | On load                 |
| `&` ampersand            | `breathe` — opacity pulse                               | Continuous loop         |
| Scroll cue               | `bob` — translateY bounce                               | Continuous loop         |
| Each section             | `reveal` — fadeUp via IntersectionObserver              | On scroll into view     |
| Countdown boxes          | `flip` — scaleY dip on value change                     | Each second             |
| Photos                   | `imgZoom` — subtle scale 1→1.05 alternate               | Continuous loop         |
| Map: RORO badge          | `roroWait` — gentle bob + rotate                        | On map scroll into view |
| Map: TFTF badge          | `tftfWalk` — bounce + rotate while travelling           | After RORO appears      |
| Map: route line          | progressive `setLatLngs` + marching dash offset         | During travel           |
| Map: arrival celebration | both badges jump, heart burst, bubble pop               | On route completion     |

---

## 6. Tech Stack

| Layer     | Choice        | Reason                                              |
|-----------|---------------|-----------------------------------------------------|
| Framework | **Vite + Vanilla HTML/CSS/JS** | Zero overhead, perfect for a static invite site |
| Hosting   | **Vercel**    | Free, instant deploy from git                       |
| Fonts     | Google Fonts CDN | Cormorant Garamond, Cinzel, Playfair Display    |
| Map       | **Leaflet.js** + CartoDB Positron tiles | Free, no API key, clean minimal style |
| Images    | Unsplash CDN  | Cairo + Luxor photos with `onerror` fallbacks       |
| No backend | —            | No RSVP form, no database needed                    |

---

## 7. Content

- **Names displayed:** TFTF & RORO (not full names)
- **Language:** English only
- **No couple photos**
- **No RSVP / no confirmation flow**
- Venue name TBD — placeholder "Venue details to follow"

---

## 8. Responsive / Mobile

- Designed and built mobile-first (375–430px width)
- All font sizes, spacing, and touch targets sized for mobile
- No desktop breakpoints required (invitation link shared via phone)

---

## 9. File Structure

```
engagment-invitation/
├── index.html
├── style.css
├── main.js            (countdown + scroll-reveal + map animation)
├── vercel.json        (static config)
└── public/
    ├── favicon.ico
    ├── tftf.jpg       (Mostafa's photo — circular avatar)
    └── roro.jpg       (Nourhanne's photo — circular avatar)
```
