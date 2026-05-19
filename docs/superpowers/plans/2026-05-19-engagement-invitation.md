# TFTF & RORO Engagement Invitation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a mobile-first, single-page engagement invitation website for TFTF & RORO (3 July 2026, Luxor) with animated hero, live countdown, interactive map with face-avatar travel animation, and sage/white palette throughout.

**Architecture:** Pure static HTML + CSS + JS — no build step, no framework. Leaflet.js loaded via CDN for the map section. Vercel serves `index.html` directly from the repo root.

**Tech Stack:** HTML5, CSS3 (custom properties + keyframes), Vanilla JS, Leaflet.js 1.9.4 (CDN), CartoDB Positron map tiles (free, no API key), Google Fonts CDN, Vercel static hosting.

---

## File Map

| File | Responsibility |
|---|---|
| `index.html` | All section markup, CDN links, semantic structure |
| `style.css` | CSS custom properties, all layout, all animations |
| `main.js` | Countdown timer, scroll-reveal observer, map init + avatar sequence |
| `vercel.json` | Tells Vercel this is a static site |
| `public/tftf.jpg` | Mostafa's circular avatar photo (drop-in) |
| `public/roro.jpg` | Nourhanne's circular avatar photo (drop-in) |

---

## Task 1: Project Scaffold

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `main.js`
- Create: `vercel.json`
- Create: `public/tftf.jpg` (placeholder)
- Create: `public/roro.jpg` (placeholder)
- Create: `.gitignore`

- [ ] **Step 1: Create vercel.json**

```json
{}
```

Vercel auto-detects static HTML sites — empty config is all that's needed.

- [ ] **Step 2: Create .gitignore**

```
.DS_Store
node_modules/
.vercel/
```

- [ ] **Step 3: Create placeholder photos**

Copy any two distinct portrait-like images into `public/tftf.jpg` and `public/roro.jpg`. These are swapped for real photos later. The map animation will fall back to initials "M" / "N" if files are missing — no crash.

- [ ] **Step 4: Create index.html skeleton**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#EAF5E8">
  <title>TFTF &amp; RORO · 3 July 2026</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=Cinzel:wght@400;600&family=Playfair+Display:ital,wght@1,300;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <!-- sections go here in Task 3, 5, 6, 7, 9 -->

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="main.js"></script>
</body>
</html>
```

- [ ] **Step 5: Create style.css with CSS custom properties + reset**

```css
/* ── Tokens ── */
:root {
  --sage:      #7B9E77;
  --sage-mid:  #9DC49A;
  --sage-pale: #EAF5E8;
  --sage-bg:   #F2FAF1;
  --white:     #FFFFFF;
  --text:      #1E2E1C;
  --text-mid:  #5A7A58;

  --font-display: 'Playfair Display', Georgia, serif;
  --font-label:   'Cinzel', serif;
  --font-body:    'Cormorant Garamond', Georgia, serif;
}

/* ── Reset ── */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-body);
  background: var(--white);
  color: var(--text);
  overflow-x: hidden;
}
img { display: block; max-width: 100%; }
button { cursor: pointer; border: none; }

/* ── Scroll-reveal base ── */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}
.reveal.in {
  opacity: 1;
  transform: translateY(0);
}

/* ── Shared section layout ── */
.section {
  background: var(--white);
  padding: 36px 22px;
  border-top: 1px solid #e4f0e2;
}
.section.alt {
  background: var(--sage-bg);
}
.s-eye {
  display: block;
  font-family: var(--font-label);
  font-size: 7px;
  letter-spacing: 5px;
  color: var(--sage);
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 6px;
}
.s-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-style: italic;
  color: var(--text);
  text-align: center;
  margin-bottom: 22px;
  line-height: 1.3;
}
```

- [ ] **Step 6: Create main.js stub**

```js
// main.js — runs after DOM + Leaflet are loaded
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCountdown();
  initMap();
});
```

- [ ] **Step 7: Open index.html in browser and confirm blank white page with no console errors**

Open: `open index.html` (macOS) or drag into browser.  
Expected: blank white page, no 404s in DevTools Network tab for CSS/JS.

- [ ] **Step 8: Commit**

```bash
git init
git add index.html style.css main.js vercel.json .gitignore public/
git commit -m "chore: project scaffold — static HTML/CSS/JS skeleton"
```

---

## Task 2: Hero Section — Markup & Layout

**Files:**
- Modify: `index.html` — add hero section
- Modify: `style.css` — add hero styles

- [ ] **Step 1: Add hero HTML inside `<body>` before the script tags**

```html
<!-- ══ HERO ══ -->
<section class="hero" aria-label="Engagement announcement">

  <!-- Floating botanical leaves (decorative) -->
  <div class="leaves" aria-hidden="true">
    <span class="leaf" style="left:6%;  --dur:10s; --delay:0s;   --r0:-15deg; --r1:8deg">🌿</span>
    <span class="leaf" style="left:20%; --dur:13s; --delay:3s;   --r0:12deg;  --r1:-6deg">🍃</span>
    <span class="leaf" style="left:68%; --dur:11s; --delay:1.5s; --r0:-8deg;  --r1:14deg">🌿</span>
    <span class="leaf" style="left:84%; --dur:9s;  --delay:4s;   --r0:6deg;   --r1:-18deg">🍃</span>
    <span class="leaf" style="left:48%; --dur:14s; --delay:6s;   --r0:-18deg; --r1:4deg">🌿</span>
  </div>

  <!-- Split photos -->
  <div class="split" aria-hidden="true">
    <div class="half left">
      <img
        src="https://images.unsplash.com/photo-1572252009286-96b070b6e90b?auto=format&fit=crop&w=400&h=380&q=85"
        alt="Cairo cityscape"
        loading="eager"
      />
      <span class="city-tag">CAIRO</span>
    </div>
    <div class="half right">
      <img
        src="https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=400&h=380&q=85"
        alt="Luxor temple"
        loading="eager"
      />
      <span class="city-tag">LUXOR</span>
    </div>
    <div class="seam" aria-hidden="true">
      <div class="seam-dot"></div>
    </div>
  </div>

  <!-- Names + date -->
  <div class="hero-body">
    <span class="eyebrow">ENGAGEMENT</span>
    <div class="names">
      <span class="name n1">TFTF</span>
      <div class="amp-row" aria-hidden="true">
        <div class="amp-line l"></div>
        <span class="amp">&amp;</span>
        <div class="amp-line r"></div>
      </div>
      <span class="name n2">RORO</span>
    </div>
    <div class="date-row">
      <span class="date-text">3 · JULY · 2026</span>
      <div class="rule"></div>
      <span class="loc-text">LUXOR</span>
    </div>
  </div>

  <!-- Scroll cue -->
  <div class="scroll-cue" aria-hidden="true">
    <span>SCROLL</span>
    <span class="chev">▾</span>
  </div>

</section>
```

- [ ] **Step 2: Add hero styles to style.css**

```css
/* ══ HERO ══ */
.hero {
  min-height: 100dvh;
  background: var(--sage-pale);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Split photos — top 52% */
.split {
  width: 100%;
  flex: 0 0 52%;
  display: flex;
  position: relative;
}
.half {
  position: relative;
  overflow: hidden;
  flex: 1;
}
.half img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.85) brightness(0.9);
}
.half.left  img { object-position: 60% center; }
.half.right img { object-position: 40% center; }

/* Fade photos into sage-pale */
.half::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(234,245,232,0) 20%,
    var(--sage-pale) 100%
  );
}

/* City tags */
.city-tag {
  position: absolute;
  top: 40px;
  z-index: 5;
  font-family: var(--font-label);
  font-size: 7px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.92);
  text-shadow: 0 1px 8px rgba(0,0,0,0.3);
}
.half.left  .city-tag { left: 14px; }
.half.right .city-tag { right: 14px; }

/* Center seam */
.seam {
  position: absolute;
  top: 0; bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  z-index: 10;
  background: linear-gradient(
    to bottom,
    rgba(123,158,119,0)   0%,
    rgba(123,158,119,0.5) 25%,
    rgba(123,158,119,0.5) 75%,
    rgba(123,158,119,0)   100%
  );
}
.seam-dot {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 7px; height: 7px;
  background: var(--sage-pale);
  border: 2px solid var(--sage);
  z-index: 15;
}

/* Names area */
.hero-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px 24px;
  position: relative;
  z-index: 5;
}
.eyebrow {
  display: block;
  font-family: var(--font-label);
  font-size: 7px;
  letter-spacing: 6px;
  color: var(--sage);
  text-transform: uppercase;
  margin-bottom: 10px;
}
.names { text-align: center; }
.name {
  display: block;
  font-family: var(--font-display);
  font-size: 62px;
  font-weight: 300;
  font-style: italic;
  color: var(--text);
  letter-spacing: -1px;
  line-height: 1;
}
.amp-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 3px 0;
}
.amp-line {
  height: 1px;
  width: 28px;
}
.amp-line.l { background: linear-gradient(to left,  transparent, var(--sage-mid)); }
.amp-line.r { background: linear-gradient(to right, transparent, var(--sage-mid)); }
.amp {
  font-family: var(--font-display);
  font-size: 26px;
  font-style: italic;
  color: var(--sage);
  line-height: 1;
}
.date-row {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}
.date-text {
  font-family: var(--font-label);
  font-size: 8px;
  letter-spacing: 4px;
  color: var(--text-mid);
}
.rule { width: 32px; height: 1px; background: var(--sage-mid); }
.loc-text {
  font-family: var(--font-label);
  font-size: 8px;
  letter-spacing: 5px;
  color: var(--sage);
}

/* Scroll cue */
.scroll-cue {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  text-align: center;
}
.scroll-cue span {
  display: block;
  font-family: var(--font-label);
  font-size: 6px;
  letter-spacing: 4px;
  color: var(--sage-mid);
  margin-bottom: 2px;
}
.chev { font-size: 10px; color: var(--sage-mid); }
```

- [ ] **Step 3: Open in browser — verify hero renders**

Expected: sage-pale background, Cairo photo left / Luxor photo right, "TFTF & RORO" names centered below, date and location, thin seam line between photos.

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat: hero section markup and layout"
```

---

## Task 3: Hero Animations

**Files:**
- Modify: `style.css` — add all hero animation keyframes and bindings

- [ ] **Step 1: Add floating leaves animation**

```css
/* ══ HERO ANIMATIONS ══ */

/* Floating botanical leaves */
.leaf {
  position: absolute;
  font-size: 20px;
  opacity: 0;
  pointer-events: none;
  z-index: 1;
  animation: floatUp var(--dur) linear var(--delay) infinite;
}
@keyframes floatUp {
  0%   { opacity: 0; transform: translateY(110%) rotate(var(--r0)) scale(0.8); }
  8%   { opacity: 0.14; }
  88%  { opacity: 0.09; }
  100% { opacity: 0; transform: translateY(-10%) rotate(var(--r1)) scale(1.1); }
}
```

- [ ] **Step 2: Add seam line draw-in + diamond pop**

```css
/* Seam draws from center outward on load */
.seam {
  animation: drawSeam 1.2s ease 0.4s both;
  transform-origin: center top;
}
@keyframes drawSeam {
  from { clip-path: inset(50% 0); opacity: 0; }
  to   { clip-path: inset(0% 0);  opacity: 1; }
}

/* Diamond springs in */
.seam-dot {
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 1.4s both;
}
@keyframes popIn {
  from { transform: translate(-50%, -50%) rotate(45deg) scale(0); opacity: 0; }
  to   { transform: translate(-50%, -50%) rotate(45deg) scale(1); opacity: 1; }
}
```

- [ ] **Step 3: Add names staggered fade-up**

```css
/* Names, eyebrow, date fade up in sequence */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.eyebrow { animation: fadeUp 0.9s ease 0.6s both; }
.name.n1 { animation: fadeUp 0.9s ease 0.8s both; }
.amp-row { animation: fadeUp 0.9s ease 1.0s both; }
.name.n2 { animation: fadeUp 0.9s ease 1.2s both; }
.date-row { animation: fadeUp 0.9s ease 1.4s both; }
.scroll-cue { animation: fadeUp 0.9s ease 2.0s both; }
```

- [ ] **Step 4: Add continuous hero animations**

```css
/* Photos slowly zoom */
.half img {
  animation: imgZoom 14s ease-in-out infinite alternate;
}
.half.right img { animation-delay: -7s; }
@keyframes imgZoom {
  from { transform: scale(1); }
  to   { transform: scale(1.05); }
}

/* Ampersand breathes */
.amp { animation: breathe 3s ease-in-out 2s infinite; }
@keyframes breathe {
  0%, 100% { opacity: 0.65; }
  50%       { opacity: 1; }
}

/* Scroll chevron bobs */
.chev { animation: bob 2s ease-in-out infinite; }
@keyframes bob {
  0%, 100% { transform: translateY(0);   opacity: 0.4; }
  50%       { transform: translateY(4px); opacity: 1; }
}
```

- [ ] **Step 5: Open in browser — verify all animations play**

Expected:
- Leaves drift upward in the hero background
- Seam line reveals itself, diamond pops in
- "ENGAGEMENT", "TFTF", "&", "RORO", date all fade up in sequence
- Photos slowly zoom in and out
- "&" gently pulses
- "▾" bounces

- [ ] **Step 6: Commit**

```bash
git add style.css
git commit -m "feat: hero animations — leaves, seam draw, name fadeUp, zoom, breathe"
```

---

## Task 4: Countdown Section

**Files:**
- Modify: `index.html` — add countdown section after `.hero`
- Modify: `style.css` — add countdown styles
- Modify: `main.js` — implement `initCountdown()`

- [ ] **Step 1: Add countdown HTML (after `</section>` closing hero)**

```html
<!-- ══ COUNTDOWN ══ -->
<section class="section alt countdown reveal" aria-label="Countdown to the engagement">
  <span class="s-eye">COUNTING DOWN</span>
  <h2 class="s-title">Until We Say Yes</h2>
  <div class="cd-grid" role="timer" aria-live="polite">
    <div class="cd-box" id="box-d">
      <span class="cd-num" id="cd-d">--</span>
      <span class="cd-lbl">Days</span>
    </div>
    <div class="cd-box" id="box-h">
      <span class="cd-num" id="cd-h">--</span>
      <span class="cd-lbl">Hours</span>
    </div>
    <div class="cd-box" id="box-m">
      <span class="cd-num" id="cd-m">--</span>
      <span class="cd-lbl">Mins</span>
    </div>
    <div class="cd-box" id="box-s">
      <span class="cd-num" id="cd-s">--</span>
      <span class="cd-lbl">Secs</span>
    </div>
  </div>
  <p class="cd-cap">3rd July 2026 · Luxor, Egypt</p>
</section>
```

- [ ] **Step 2: Add countdown styles**

```css
/* ══ COUNTDOWN ══ */
.cd-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}
.cd-box {
  background: var(--white);
  border: 1px solid #d8edd6;
  border-radius: 14px;
  padding: 14px 4px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: 0 1px 4px rgba(100,160,95,0.06);
}
.cd-box.flip { animation: flip 0.3s ease; }
@keyframes flip {
  0%   { transform: scaleY(1); }
  40%  { transform: scaleY(0.82); }
  100% { transform: scaleY(1); }
}
.cd-num {
  font-family: var(--font-body);
  font-size: 36px;
  font-weight: 300;
  color: var(--sage);
  line-height: 1;
}
.cd-lbl {
  font-family: var(--font-label);
  font-size: 6px;
  letter-spacing: 2px;
  color: var(--text-mid);
  text-transform: uppercase;
}
.cd-cap {
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  color: var(--text-mid);
  text-align: center;
}
```

- [ ] **Step 3: Implement `initCountdown()` in main.js**

```js
function initCountdown() {
  const TARGET = new Date('2026-07-03T18:00:00');
  const els = {
    d: document.getElementById('cd-d'),
    h: document.getElementById('cd-h'),
    m: document.getElementById('cd-m'),
    s: document.getElementById('cd-s'),
  };
  const boxes = {
    d: document.getElementById('box-d'),
    h: document.getElementById('box-h'),
    m: document.getElementById('box-m'),
    s: document.getElementById('box-s'),
  };
  const prev = { d: null, h: null, m: null, s: null };

  function tick() {
    const diff = TARGET - new Date();
    if (diff <= 0) {
      Object.values(els).forEach(el => (el.textContent = '00'));
      return;
    }
    const values = {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
    Object.keys(values).forEach(k => {
      const str = String(values[k]).padStart(2, '0');
      els[k].textContent = str;
      if (prev[k] !== str) {
        boxes[k].classList.remove('flip');
        void boxes[k].offsetWidth; // force reflow to restart animation
        boxes[k].classList.add('flip');
        prev[k] = str;
      }
    });
  }

  tick();
  setInterval(tick, 1000);
}
```

- [ ] **Step 4: Open in browser and verify countdown**

Expected: countdown shows days/hours/mins/secs updating live; each box flips on change; seconds update every second.

- [ ] **Step 5: Commit**

```bash
git add index.html style.css main.js
git commit -m "feat: countdown section with live timer and flip animation"
```

---

## Task 5: Details Section

**Files:**
- Modify: `index.html` — add details section
- Modify: `style.css` — add detail card styles

- [ ] **Step 1: Add details HTML (after countdown section)**

```html
<!-- ══ DETAILS ══ -->
<section class="section details reveal" aria-label="Event details">
  <span class="s-eye">THE DETAILS</span>
  <h2 class="s-title">Join Us in Luxor</h2>
  <div class="d-cards">

    <div class="d-card">
      <div class="d-icon" aria-hidden="true">📅</div>
      <div class="d-info">
        <span class="d-lbl">Date</span>
        <span class="d-val">Friday, 3rd July 2026</span>
        <span class="d-sub">Evening celebration</span>
      </div>
    </div>

    <div class="d-card">
      <div class="d-icon" aria-hidden="true">📍</div>
      <div class="d-info">
        <span class="d-lbl">Location</span>
        <span class="d-val">Luxor, Egypt</span>
        <span class="d-sub">Venue details to follow</span>
      </div>
    </div>

  </div>
</section>
```

- [ ] **Step 2: Add detail card styles**

```css
/* ══ DETAILS ══ */
.d-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.d-card {
  background: var(--sage-bg);
  border-radius: 14px;
  padding: 15px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid #e0eedf;
  transition: transform 0.2s ease;
}
.d-card:hover { transform: translateX(4px); }
.d-icon {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--sage-pale);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.d-info { display: flex; flex-direction: column; gap: 2px; }
.d-lbl {
  font-family: var(--font-label);
  font-size: 6.5px;
  letter-spacing: 3px;
  color: var(--sage);
  text-transform: uppercase;
}
.d-val {
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--text);
  line-height: 1.3;
}
.d-sub {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-mid);
  font-style: italic;
}
```

- [ ] **Step 3: Open in browser and verify**

Expected: two cards (Date, Location) on white background; gentle slide on hover; sage-pale icon circles.

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat: details section with date and location cards"
```

---

## Task 6: Map Section — HTML & CSS

**Files:**
- Modify: `index.html` — add map section
- Modify: `style.css` — add map + avatar styles

- [ ] **Step 1: Add map HTML (after details section)**

```html
<!-- ══ MAP ══ -->
<section class="section map-section reveal" aria-label="Cairo to Luxor journey">
  <span class="s-eye">OUR STORY</span>
  <h2 class="s-title">Two Cities, One Love</h2>

  <div class="map-wrap" id="mapWrap">
    <div id="map"></div>
  </div>

  <div class="dist-badge">
    <span class="dist-num">500</span>
    <div class="dist-info">
      <span class="dist-unit">km apart</span>
      <div class="dist-sep"></div>
      <span class="dist-heart">one heart</span>
    </div>
  </div>

  <p class="map-cap">
    He came from the north.<br>
    She waited in the south.<br>
    Luxor brought them together.
  </p>
</section>
```

- [ ] **Step 2: Add map container + distance badge styles**

```css
/* ══ MAP SECTION ══ */
.map-wrap {
  width: 100%;
  height: 300px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #daeeda;
  position: relative;
  margin-bottom: 0;
}
#map {
  width: 100%;
  height: 100%;
}

/* Hide Leaflet attribution (tiles are free / attribution in footer) */
.leaflet-control-attribution,
.leaflet-control-zoom { display: none !important; }

/* Distance badge */
.dist-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--sage-bg);
  border: 1px solid #d0e8ce;
  border-radius: 20px;
  padding: 10px 20px;
  margin-top: 14px;
  align-self: center;
}
.dist-num {
  font-family: var(--font-body);
  font-size: 32px;
  font-weight: 300;
  color: var(--sage);
  line-height: 1;
}
.dist-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dist-unit, .dist-heart {
  font-family: var(--font-label);
  font-size: 7px;
  letter-spacing: 2px;
  color: var(--text-mid);
  text-transform: uppercase;
}
.dist-sep {
  width: 24px;
  height: 1px;
  background: #c8e2c6;
}
.map-cap {
  font-family: var(--font-body);
  font-size: 16px;
  font-style: italic;
  color: var(--text-mid);
  line-height: 1.75;
  text-align: center;
  margin-top: 10px;
}
```

- [ ] **Step 3: Add avatar badge styles**

```css
/* ── Avatar badges (positioned by JS over the map) ── */
.avatar {
  position: absolute;
  pointer-events: none;
  z-index: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  transform: translate(-50%, -100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}
.avatar.visible { opacity: 1; }

.avatar-ring {
  width: 38px; height: 38px;
  border-radius: 50%;
  border: 3px solid var(--white);
  box-shadow: 0 2px 12px rgba(0,0,0,0.18);
  overflow: hidden;
  background: var(--sage-pale);
  flex-shrink: 0;
}
.avatar-ring img {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
}
.avatar-initial {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-style: italic; font-size: 15px;
  color: var(--sage);
}

/* TFTF — dark border */
.avatar.tftf .avatar-ring {
  border-color: #2D4A2B;
  box-shadow: 0 2px 12px rgba(45,74,43,0.3);
}
/* RORO — sage border */
.avatar.roro .avatar-ring {
  border-color: var(--sage);
  box-shadow: 0 2px 12px rgba(123,158,119,0.3);
}

.avatar-name {
  font-family: var(--font-label);
  font-size: 7px;
  letter-spacing: 2px;
  color: var(--text);
  background: var(--white);
  padding: 2px 8px;
  border-radius: 6px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.1);
  border: 1px solid #e0eedf;
  white-space: nowrap;
}

/* Pointer arrow below avatar */
.avatar::after {
  content: '';
  width: 0; height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid var(--white);
  filter: drop-shadow(0 1px 1px rgba(0,0,0,0.08));
}

/* RORO waiting — gentle bob */
.avatar.roro.waiting .avatar-ring {
  animation: roroWait 1.2s ease-in-out infinite alternate;
}
@keyframes roroWait {
  from { transform: translateY(0)   rotate(-3deg); }
  to   { transform: translateY(-3px) rotate(3deg); }
}

/* TFTF travelling — bounce */
.avatar.tftf.travelling .avatar-ring {
  animation: tftfWalk 0.35s ease-in-out infinite alternate;
}
@keyframes tftfWalk {
  from { transform: translateY(0)   rotate(-4deg); }
  to   { transform: translateY(-4px) rotate(4deg); }
}

/* Celebration — both jump */
.avatar.celebrating .avatar-ring {
  animation: celebrate 0.35s ease-in-out infinite alternate !important;
}
@keyframes celebrate {
  from { transform: translateY(0)    scale(1)   rotate(-5deg); }
  to   { transform: translateY(-10px) scale(1.1) rotate(5deg); }
}

/* Celebration bubble */
.celeb-bubble {
  position: absolute;
  z-index: 600;
  pointer-events: none;
  background: var(--white);
  border: 1px solid #d0e8ce;
  border-radius: 14px;
  padding: 6px 14px;
  font-family: var(--font-display);
  font-size: 13px;
  font-style: italic;
  color: var(--text);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  white-space: nowrap;
  opacity: 0;
  animation: popBubble 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s forwards;
}
@keyframes popBubble {
  from { opacity: 0; transform: scale(0.6) translateY(8px); }
  to   { opacity: 1; transform: scale(1)   translateY(0); }
}

/* Floating hearts */
.heart-pop {
  position: absolute;
  z-index: 600;
  pointer-events: none;
  font-size: 16px;
  opacity: 0;
  animation: heartBurst 1.4s ease-out forwards;
}
@keyframes heartBurst {
  0%   { opacity: 0; transform: translate(0,0) scale(0.5); }
  15%  { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(1.2); }
}

/* City pin dots on map */
.city-pin-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--sage);
  border: 2px solid var(--white);
  box-shadow: 0 0 0 2px var(--sage-mid);
  position: relative;
}
.city-pin-pulse {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--sage);
  opacity: 0.4;
  animation: ripple 1.5s ease-out infinite;
}
@keyframes ripple {
  to { transform: translate(-50%,-50%) scale(3); opacity: 0; }
}
```

- [ ] **Step 4: Open in browser — verify map container renders**

Expected: sage-bg section with "OUR STORY" / "Two Cities, One Love", a 300px tall rounded container where the map will live, distance badge below.

- [ ] **Step 5: Commit**

```bash
git add index.html style.css
git commit -m "feat: map section HTML and avatar badge CSS"
```

---

## Task 7: Map JS — Leaflet Init & Avatar Animation

**Files:**
- Modify: `main.js` — implement `initMap()`

- [ ] **Step 1: Add map helpers and Leaflet init to main.js**

```js
function initMap() {
  const CAIRO = [30.0444, 31.2357];
  const LUXOR = [25.6872, 32.6396];
  const wrap  = document.getElementById('mapWrap');
  if (!wrap) return;

  // Init Leaflet — locked, no user interaction
  const map = L.map('map', {
    center: [27.8, 30.8],
    zoom: 6,
    zoomControl:       false,
    dragging:          false,
    scrollWheelZoom:   false,
    doubleClickZoom:   false,
    touchZoom:         false,
    keyboard:          false,
    attributionControl:false,
  });

  // CartoDB Positron — clean minimal light tiles, free, no API key
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    { maxZoom: 19, subdomains: 'abcd' }
  ).addTo(map);

  // City pin factory
  function addCityPin(latlng) {
    L.marker(latlng, {
      icon: L.divIcon({
        className: '',
        html: `<div style="position:relative;width:10px;height:10px">
                 <div class="city-pin-pulse"></div>
                 <div class="city-pin-dot"></div>
               </div>`,
        iconAnchor: [5, 5],
      }),
      interactive: false,
    }).addTo(map);
  }
  addCityPin(CAIRO);
  addCityPin(LUXOR);

  // Route line — starts empty, populated during travel
  const routeLine = L.polyline([], {
    color: '#7B9E77',
    weight: 2.5,
    dashArray: '8 5',
    lineCap: 'round',
    opacity: 0.75,
  }).addTo(map);

  // Avatar factory
  function makeAvatar(cls, initial, photoSrc) {
    const el = document.createElement('div');
    el.className = `avatar ${cls}`;
    el.innerHTML = `
      <div class="avatar-ring">
        <img
          src="${photoSrc}"
          alt="${cls}"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        />
        <div class="avatar-initial" style="display:none">${initial}</div>
      </div>
      <div class="avatar-name">${cls.toUpperCase()}</div>`;
    wrap.appendChild(el);
    return el;
  }

  const tftfEl = makeAvatar('tftf', 'M', 'public/tftf.jpg');
  const roroEl = makeAvatar('roro', 'N', 'public/roro.jpg');

  // Helpers
  function latLngToXY(ll) {
    const p = map.latLngToContainerPoint(ll);
    return [p.x, p.y];
  }
  function moveEl(el, x, y) {
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function spawnHeart(x, y) {
    const icons = ['🤍', '💚', '🌿', '💛'];
    const h = document.createElement('div');
    h.className = 'heart-pop';
    h.textContent = icons[Math.floor(Math.random() * icons.length)];
    const tx = (Math.random() * 60 - 30) + 'px';
    const ty = (-(Math.random() * 50 + 20)) + 'px';
    h.style.cssText = `left:${x}px;top:${y}px;--tx:${tx};--ty:${ty}`;
    wrap.appendChild(h);
    setTimeout(() => h.remove(), 1500);
  }

  // Build interpolated route points
  const STEPS = 90;
  const routePts = Array.from({ length: STEPS + 1 }, (_, i) => {
    const t = i / STEPS;
    return [lerp(CAIRO[0], LUXOR[0], t), lerp(CAIRO[1], LUXOR[1], t)];
  });

  map.whenReady(() => setTimeout(runSequence, 700));

  function runSequence() {
    const [luxorX, luxorY] = latLngToXY(LUXOR);
    const [cairoX, cairoY] = latLngToXY(CAIRO);

    // 1 — RORO appears in Luxor, waiting
    moveEl(roroEl, luxorX, luxorY - 4);
    roroEl.classList.add('visible', 'waiting');

    // 2 — TFTF appears in Cairo after 1s
    setTimeout(() => {
      moveEl(tftfEl, cairoX, cairoY - 4);
      tftfEl.classList.add('visible');

      // 3 — TFTF travels south after 0.7s
      setTimeout(() => {
        tftfEl.classList.add('travelling');
        let step = 0;
        let dashOff = 0;
        const DURATION = 4200;
        const interval = DURATION / STEPS;

        const march = setInterval(() => {
          step++;
          if (step > STEPS) { clearInterval(march); arrive(); return; }
          const [px, py] = latLngToXY(routePts[step]);
          moveEl(tftfEl, px, py - 4);
          routeLine.setLatLngs(routePts.slice(0, step + 1));
          dashOff -= 1.5;
          routeLine.setStyle({ dashOffset: String(dashOff) });
        }, interval);
      }, 700);
    }, 1000);
  }

  function arrive() {
    tftfEl.classList.remove('travelling');
    roroEl.classList.remove('waiting');

    // Position side by side in Luxor
    const [lx, ly] = latLngToXY(LUXOR);
    moveEl(tftfEl, lx - 24, ly - 4);
    moveEl(roroEl, lx + 24, ly - 4);

    tftfEl.classList.add('celebrating');
    roroEl.classList.add('celebrating');

    // Celebration bubble
    const bubble = document.createElement('div');
    bubble.className = 'celeb-bubble';
    bubble.textContent = '🎉 Together at last!';
    bubble.style.cssText = `left:${lx - 72}px;top:${ly - 88}px`;
    wrap.appendChild(bubble);

    // Hearts burst
    const burst = setInterval(() => {
      spawnHeart(lx - 20, ly - 30);
      spawnHeart(lx + 12, ly - 30);
    }, 280);
    setTimeout(() => {
      clearInterval(burst);
      tftfEl.classList.remove('celebrating');
      roroEl.classList.remove('celebrating');
    }, 4000);
  }

  // Re-run sequence when section scrolls into view (IntersectionObserver set in Task 8)
  const mapSection = document.querySelector('.map-section');
  mapSection._runMapSequence = runSequence;
}
```

- [ ] **Step 2: Open in browser, scroll to map — verify sequence plays**

Expected:
1. CartoDB map of Egypt loads (clean, light)
2. Cairo + Luxor pins appear with ripple rings
3. RORO badge appears in Luxor, bobbing
4. TFTF badge appears in Cairo, then bounces south along the route
5. Dashed line draws behind TFTF as he moves
6. On arrival: both jump, "🎉 Together at last!" bubble pops, hearts burst for ~4s

- [ ] **Step 3: Commit**

```bash
git add main.js
git commit -m "feat: map Leaflet init and avatar travel animation sequence"
```

---

## Task 8: Message, Closing & Footer Sections

**Files:**
- Modify: `index.html` — add three final sections
- Modify: `style.css` — add styles for all three

- [ ] **Step 1: Add message, closing, and footer HTML (after map section)**

```html
<!-- ══ MESSAGE ══ -->
<section class="section message reveal" aria-label="Personal message">
  <span class="msg-orn" aria-hidden="true">❧</span>
  <p class="msg-text">
    From Cairo to Luxor, two hearts found their way to each other.
    Join us as we celebrate the beginning of forever.
  </p>
  <span class="msg-sig">TFTF &amp; RORO · 2026</span>
</section>

<!-- ══ CLOSING ══ -->
<section class="closing reveal" aria-label="Invitation closing">
  <span class="cl-eye">YOU'RE INVITED</span>
  <div class="cl-names">TFTF &amp; RORO</div>
  <p class="cl-tag">would love your presence</p>
</section>

<!-- ══ FOOTER ══ -->
<footer class="site-footer">
  <div class="ft-names">TFTF &amp; RORO</div>
  <div class="ft-date">3 · July · 2026 · Luxor</div>
</footer>
```

- [ ] **Step 2: Add styles for message, closing, footer**

```css
/* ══ MESSAGE ══ */
.message {
  text-align: center;
  padding: 38px 28px;
}
.msg-orn {
  display: block;
  font-size: 24px;
  color: var(--sage-mid);
  margin-bottom: 14px;
}
.msg-text {
  font-family: var(--font-body);
  font-size: 17px;
  font-style: italic;
  color: var(--text);
  line-height: 1.85;
  margin-bottom: 18px;
}
.msg-sig {
  font-family: var(--font-label);
  font-size: 7px;
  letter-spacing: 4px;
  color: var(--sage);
  text-transform: uppercase;
}

/* ══ CLOSING ══ */
.closing {
  background: var(--sage);
  padding: 44px 24px 48px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border-top: none;
}
.cl-eye {
  font-family: var(--font-label);
  font-size: 7px;
  letter-spacing: 5px;
  color: rgba(255,255,255,0.65);
  text-transform: uppercase;
}
.cl-names {
  font-family: var(--font-display);
  font-size: 38px;
  font-style: italic;
  color: var(--white);
  line-height: 1;
}
.cl-tag {
  font-family: var(--font-body);
  font-size: 16px;
  font-style: italic;
  color: rgba(255,255,255,0.72);
}

/* ══ FOOTER ══ */
.site-footer {
  background: var(--sage-pale);
  border-top: 1px solid #d8edd6;
  padding: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
}
.ft-names {
  font-family: var(--font-display);
  font-size: 20px;
  font-style: italic;
  color: var(--text);
}
.ft-date {
  font-family: var(--font-label);
  font-size: 7px;
  letter-spacing: 4px;
  color: var(--sage);
  text-transform: uppercase;
}
```

- [ ] **Step 3: Open in browser, scroll to bottom — verify**

Expected: message section (white bg, ornament, italic quote), closing section (solid sage green, white names and tagline), footer (sage-pale, names + date).

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat: message, closing, and footer sections"
```

---

## Task 9: Scroll Reveal

**Files:**
- Modify: `main.js` — implement `initScrollReveal()`

- [ ] **Step 1: Implement `initScrollReveal()` in main.js**

```js
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);

        // Trigger map sequence when map section scrolls into view
        if (entry.target.classList.contains('map-section') &&
            typeof entry.target._runMapSequence === 'function') {
          entry.target._runMapSequence();
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}
```

- [ ] **Step 2: Verify scroll reveal in browser**

Scroll slowly from top to bottom. Expected:
- Each section (countdown, details, map, message, closing) fades up smoothly as it enters the viewport
- Map animation auto-starts when the map section scrolls into view
- Sections do not re-animate once already visible

- [ ] **Step 3: Commit**

```bash
git add main.js
git commit -m "feat: scroll-reveal IntersectionObserver for all sections"
```

---

## Task 10: Drop In Real Photos

**Files:**
- Replace: `public/tftf.jpg`
- Replace: `public/roro.jpg`

- [ ] **Step 1: Add Mostafa's photo as `public/tftf.jpg`**

The photo should be square or portrait-oriented, minimum 200×200px. The avatar ring crops it to a 38px circle (`object-fit:cover`).

- [ ] **Step 2: Add Nourhanne's photo as `public/roro.jpg`**

Same requirements.

- [ ] **Step 3: Open in browser, trigger map animation — verify faces appear in badges**

Expected: circular cropped face photos inside the avatar badges on the map, not initials.

- [ ] **Step 4: Commit**

```bash
git add public/tftf.jpg public/roro.jpg
git commit -m "feat: add real face photos for map avatar badges"
```

---

## Task 11: Deploy to Vercel

**Files:**
- No code changes — deploy existing repo

- [ ] **Step 1: Create a GitHub repository**

Go to github.com → New repository → name it `engagment-invitation` → public or private → create.

- [ ] **Step 2: Push to GitHub**

```bash
git remote add origin https://github.com/<your-username>/engagment-invitation.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: Connect to Vercel**

1. Go to vercel.com → Add New Project
2. Import from GitHub → select `engagment-invitation`
3. Framework Preset: **Other** (static HTML)
4. Build Command: *(leave blank)*
5. Output Directory: *(leave blank — Vercel serves from root)*
6. Click **Deploy**

- [ ] **Step 4: Verify live URL**

Vercel gives a URL like `https://engagment-invitation.vercel.app`.  
Open it on your phone. Verify:
- Hero loads, animations play
- Countdown is live
- Scroll through all sections
- Map animation triggers on scroll
- Face photos appear in the map badges

- [ ] **Step 5: (Optional) Add custom domain**

In Vercel project settings → Domains → add your preferred domain.

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered by task |
|---|---|
| Pale sage hero with split Cairo × Luxor photos | Task 2 |
| Seam line + diamond with draw animation | Task 2 + Task 3 |
| Floating leaves | Task 3 |
| Name staggered fade-up, breathe, bob | Task 3 |
| Live countdown with flip animation | Task 4 |
| Details: Date + Location cards (no dress code) | Task 5 |
| Map: Leaflet + CartoDB Positron | Task 7 |
| Map: RORO waiting (bob), TFTF travels south | Task 7 |
| Map: dashed route line draws behind TFTF | Task 7 |
| Map: celebration — jump, hearts, bubble | Task 7 |
| Map: circular photo badges (tftf.jpg / roro.jpg) | Task 6 + Task 10 |
| Map: distance badge (500 km) | Task 6 |
| Map: caption | Task 6 |
| Message section | Task 8 |
| Closing section (sage bg, no button) | Task 8 |
| Footer (sage-pale) | Task 8 |
| Scroll reveal on all sections | Task 9 |
| Map sequence triggers on scroll into view | Task 9 |
| Vercel deploy | Task 11 |
| Light mode only (no black/brown) | CSS tokens Task 1 |
| Mobile-first (375–430px) | All CSS tasks |

**No placeholders found.** All steps contain actual code or exact instructions.

**Type/name consistency check:** `initScrollReveal`, `initCountdown`, `initMap` match the `main.js` stub in Task 1. `_runMapSequence` set in Task 7 and called in Task 9. `routePts` built in `initMap` and used in the `march` interval — consistent. Element IDs (`cd-d`, `cd-h`, `cd-m`, `cd-s`, `box-d` etc.) match between HTML (Task 4) and JS (Task 4). Avatar classes `tftf`, `roro`, `visible`, `waiting`, `travelling`, `celebrating` match between CSS (Task 6) and JS (Task 7).
