// main.js — runs after DOM + Leaflet are loaded
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCountdown();
  initMap();
  initTyping();
  initRSVP();
  initGuestbook();
  initRingEasterEgg();
  initMusic();
});

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

function initScrollReveal() {
  // Index direct children for CSS stagger (--i)
  document.querySelectorAll('.reveal').forEach((section) => {
    Array.from(section.children).forEach((child, i) => {
      child.style.setProperty('--i', i);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);

        if (entry.target.classList.contains('message') &&
            typeof entry.target._runTyping === 'function') {
          entry.target._runTyping();
        }
      });
    },
    {
      threshold: 0.25,
      rootMargin: '0px 0px -15% 0px', // fire only when section is meaningfully in view
    }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  initParallax();

  // Scroll progress bar (rAF-throttled)
  const bar = document.getElementById('scrollBar');
  if (bar) {
    let ticking = false;
    function updateBar() {
      const h = document.documentElement;
      const scrolled = h.scrollTop || document.body.scrollTop;
      const max = (h.scrollHeight - h.clientHeight) || 1;
      const pct = Math.min(100, Math.max(0, (scrolled / max) * 100));
      bar.style.width = pct + '%';
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateBar);
        ticking = true;
      }
    }, { passive: true });
    updateBar();
  }
}

/* ──────────────────────────────────────────────
   PARALLAX ENGINE
   Add data-parallax="0.3" to any element. The
   number is the depth factor — positive moves
   slower than scroll (deeper), negative moves
   opposite (foreground). Add data-parallax-fade
   to also fade out as it scrolls past viewport.
   ────────────────────────────────────────────── */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = Array.from(document.querySelectorAll('[data-parallax]'))
    .map(el => ({
      el,
      speed: parseFloat(el.dataset.parallax) || 0,
      fade:  el.hasAttribute('data-parallax-fade'),
    }));
  if (!items.length) return;

  const vh = () => window.innerHeight || document.documentElement.clientHeight;
  let ticking = false;

  function update() {
    const viewH = vh();
    items.forEach(({ el, speed, fade }) => {
      // Don't fight the reveal animation — wait until parent section has revealed
      const section = el.closest('.reveal');
      if (section && !section.classList.contains('in')) return;
      const rect = el.getBoundingClientRect();
      // Distance of element center from viewport center
      const center = rect.top + rect.height / 2;
      const offset = center - viewH / 2;
      // Only update when reasonably near the viewport (perf)
      if (rect.bottom < -200 || rect.top > viewH + 200) return;

      const ty = -offset * speed;
      let opacity = 1;
      if (fade) {
        // Fade out as element leaves the top of the viewport
        const past = Math.max(0, -rect.top);
        opacity = Math.max(0, 1 - past / (rect.height * 0.85));
      }
      el.style.transform = `translate3d(0, ${ty.toFixed(2)}px, 0)`;
      if (fade) el.style.opacity = opacity.toFixed(3);
    });
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll',  onScroll, { passive: true });
  window.addEventListener('resize',  onScroll, { passive: true });
  update();
}

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

  // TFTF → funny cartoon car (inline SVG)
  const tftfEl = document.createElement('div');
  tftfEl.className = 'avatar tftf car';
  tftfEl.innerHTML = `
    <svg class="car-svg" viewBox="-4 -8 80 52" width="80" height="52" xmlns="http://www.w3.org/2000/svg">
      <!-- antenna with heart -->
      <line x1="22" y1="6" x2="18" y2="-4" stroke="#2D2D2D" stroke-width="1" stroke-linecap="round"/>
      <text x="18" y="-3" text-anchor="middle" font-size="6">❤️</text>

      <!-- car body lower -->
      <rect x="3" y="16" width="58" height="14" rx="5" fill="#E94F4F" stroke="#2D2D2D" stroke-width="1.5"/>
      <!-- roof (rounded cabin) -->
      <path d="M14 17 Q18 4 32 4 Q46 4 50 17 Z" fill="#E94F4F" stroke="#2D2D2D" stroke-width="1.5"/>

      <!-- windshield -->
      <path d="M18 16 Q22 8 30 8 L30 16 Z" fill="#BEE3F8" stroke="#2D2D2D" stroke-width="1"/>
      <!-- rear window -->
      <path d="M34 8 Q42 8 46 16 L34 16 Z" fill="#BEE3F8" stroke="#2D2D2D" stroke-width="1"/>

      <!-- driver: head + body, holding bouquet -->
      <g class="car-driver">
        <!-- head -->
        <circle cx="26" cy="11" r="3.2" fill="#F4C9A0" stroke="#2D2D2D" stroke-width="0.8"/>
        <!-- hair -->
        <path d="M23 9 Q26 6 29 9" stroke="#3B2A1A" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <!-- smile -->
        <path d="M24.8 11.6 Q26 12.6 27.2 11.6" stroke="#2D2D2D" stroke-width="0.6" fill="none" stroke-linecap="round"/>
        <!-- eyes -->
        <circle cx="25" cy="10.6" r="0.4" fill="#2D2D2D"/>
        <circle cx="27" cy="10.6" r="0.4" fill="#2D2D2D"/>
        <!-- arm to bouquet -->
        <line x1="28" y1="13" x2="34" y2="10" stroke="#2D2D2D" stroke-width="1.2" stroke-linecap="round"/>

        <!-- realistic rose bouquet (bigger) -->
        <g class="car-bouquet">
          <!-- stems -->
          <g stroke="#3A5A28" stroke-width="0.7" stroke-linecap="round" fill="none">
            <line x1="36" y1="8" x2="38" y2="14"/>
            <line x1="38" y1="6" x2="39" y2="14"/>
            <line x1="40" y1="7" x2="40" y2="14"/>
            <line x1="42" y1="8" x2="41" y2="14"/>
          </g>
          <!-- leaves layer (behind roses) -->
          <ellipse cx="33" cy="9"  rx="2.2" ry="1" fill="#4F7A3A" stroke="#2D4A1D" stroke-width="0.4" transform="rotate(-35 33 9)"/>
          <ellipse cx="44" cy="9"  rx="2.2" ry="1" fill="#5C8C44" stroke="#2D4A1D" stroke-width="0.4" transform="rotate(30 44 9)"/>
          <ellipse cx="34" cy="12" rx="2"   ry="0.9" fill="#4F7A3A" stroke="#2D4A1D" stroke-width="0.4" transform="rotate(-15 34 12)"/>
          <ellipse cx="43" cy="12" rx="2"   ry="0.9" fill="#5C8C44" stroke="#2D4A1D" stroke-width="0.4" transform="rotate(15 43 12)"/>
          <!-- baby's breath dots -->
          <g fill="#FFFFFF" stroke="#D8D8D8" stroke-width="0.2">
            <circle cx="32" cy="7" r="0.5"/>
            <circle cx="45" cy="8" r="0.5"/>
            <circle cx="34" cy="5" r="0.4"/>
            <circle cx="43" cy="5" r="0.4"/>
            <circle cx="39" cy="4" r="0.5"/>
          </g>

          <!-- roses (with petal layers for realism) -->
          <!-- rose 1 (top-left) -->
          <g transform="translate(35 7)">
            <circle r="2.6" fill="#8B0000" stroke="#3A0008" stroke-width="0.4"/>
            <path d="M-2 0 Q0 -2 2 0 Q0 2 -2 0 Z" fill="#C81D25"/>
            <path d="M-1.2 -0.6 Q0 -1.4 1.2 -0.6 Q0 0.8 -1.2 -0.6 Z" fill="#E63946"/>
            <circle r="0.7" fill="#5A0008"/>
          </g>
          <!-- rose 2 (top-right) -->
          <g transform="translate(41 7)">
            <circle r="2.6" fill="#9D0208" stroke="#3A0008" stroke-width="0.4"/>
            <path d="M-2 0 Q0 -2 2 0 Q0 2 -2 0 Z" fill="#D00000"/>
            <path d="M-1.2 -0.6 Q0 -1.4 1.2 -0.6 Q0 0.8 -1.2 -0.6 Z" fill="#EF233C"/>
            <circle r="0.7" fill="#5A0008"/>
          </g>
          <!-- rose 3 (center, biggest, front) -->
          <g transform="translate(38 9.5)">
            <circle r="3" fill="#8B0000" stroke="#3A0008" stroke-width="0.4"/>
            <path d="M-2.4 0 Q0 -2.4 2.4 0 Q0 2.4 -2.4 0 Z" fill="#C81D25"/>
            <path d="M-1.5 -0.7 Q0 -1.7 1.5 -0.7 Q0 1 -1.5 -0.7 Z" fill="#E63946"/>
            <path d="M-0.8 -0.4 Q0 -0.9 0.8 -0.4 Q0 0.5 -0.8 -0.4 Z" fill="#FF6B7A"/>
            <circle r="0.8" fill="#5A0008"/>
          </g>
          <!-- rose 4 (bottom-left small) -->
          <g transform="translate(34.5 11)">
            <circle r="2.2" fill="#9D0208" stroke="#3A0008" stroke-width="0.4"/>
            <path d="M-1.6 0 Q0 -1.6 1.6 0 Q0 1.6 -1.6 0 Z" fill="#D00000"/>
            <circle r="0.6" fill="#5A0008"/>
          </g>
          <!-- rose 5 (bottom-right small) -->
          <g transform="translate(41.5 11)">
            <circle r="2.2" fill="#8B0000" stroke="#3A0008" stroke-width="0.4"/>
            <path d="M-1.6 0 Q0 -1.6 1.6 0 Q0 1.6 -1.6 0 Z" fill="#C81D25"/>
            <circle r="0.6" fill="#5A0008"/>
          </g>

          <!-- wrap (paper cone) -->
          <path d="M33 13 L43 13 L41 17 L35 17 Z" fill="#F4E4D4" stroke="#8B5A3C" stroke-width="0.6"/>
          <path d="M33 13 L43 13 L42 14 L34 14 Z" fill="#E8D4BF"/>
          <!-- ribbon -->
          <path d="M34 15 Q38 16.5 42 15 L42 16 Q38 17.2 34 16 Z" fill="#FF1744" stroke="#8B0000" stroke-width="0.3"/>
          <path d="M37.5 16 L36 18 L37 18 L38 16.5 Z" fill="#FF1744" stroke="#8B0000" stroke-width="0.3"/>
          <path d="M38.5 16 L40 18 L39 18 L38 16.5 Z" fill="#FF1744" stroke="#8B0000" stroke-width="0.3"/>
        </g>
      </g>

      <!-- big headlight -->
      <circle cx="58" cy="20" r="2.6" fill="#FFE680" stroke="#2D2D2D" stroke-width="0.8"/>
      <!-- cheeky front bumper smile -->
      <path d="M48 27 Q54 30 60 27" stroke="#2D2D2D" stroke-width="1" fill="none" stroke-linecap="round"/>
      <!-- door line -->
      <line x1="32" y1="17" x2="32" y2="28" stroke="#2D2D2D" stroke-width="0.8"/>
      <!-- side stripe -->
      <rect x="6" y="22" width="52" height="1.5" fill="#FFFFFF" opacity="0.6"/>

      <!-- wheels with cartoon shine -->
      <g transform="translate(15 30)">
        <circle r="6.5" fill="#1A1A1A" stroke="#2D2D2D" stroke-width="1"/>
        <g class="car-spokes">
          <rect x="-5.5" y="-0.8" width="11" height="1.6" fill="#BBB"/>
          <rect x="-0.8" y="-5.5" width="1.6" height="11" fill="#BBB"/>
        </g>
        <circle cx="-2" cy="-2" r="1" fill="#FFFFFF" opacity="0.4"/>
      </g>
      <g transform="translate(49 30)">
        <circle r="6.5" fill="#1A1A1A" stroke="#2D2D2D" stroke-width="1"/>
        <g class="car-spokes">
          <rect x="-5.5" y="-0.8" width="11" height="1.6" fill="#BBB"/>
          <rect x="-0.8" y="-5.5" width="1.6" height="11" fill="#BBB"/>
        </g>
        <circle cx="-2" cy="-2" r="1" fill="#FFFFFF" opacity="0.4"/>
      </g>
    </svg>
    <div class="avatar-name">TFTF</div>`;
  wrap.appendChild(tftfEl);

  // TFTF — modern groom character (steps out of car at Luxor)
  const tftfDancer = document.createElement('div');
  tftfDancer.className = 'avatar tftf-char';
  tftfDancer.innerHTML = `
    <svg class="char-svg groom-svg" viewBox="0 0 44 60" width="36" height="50" xmlns="http://www.w3.org/2000/svg">
      <!-- ground shadow -->
      <ellipse cx="22" cy="57" rx="7" ry="1.2" fill="#000" opacity="0.18"/>
      <g stroke="#1F1A14" stroke-width="2" stroke-linecap="round" fill="none">
        <!-- legs -->
        <line x1="22" y1="38" x2="17" y2="55"/>
        <line x1="22" y1="38" x2="27" y2="55"/>
        <!-- body -->
        <line x1="22" y1="20" x2="22" y2="38"/>
        <!-- arms — right arm raised holding bouquet -->
        <line x1="22" y1="24" x2="13" y2="32"/>
        <line class="groom-arm-r" x1="22" y1="24" x2="33" y2="18"/>
      </g>
      <!-- head -->
      <circle cx="22" cy="13" r="6" fill="none" stroke="#1F1A14" stroke-width="2"/>
      <!-- bowtie (groom marker) -->
      <g>
        <path d="M19 21 L22 22.5 L19 24 Z" fill="#C81D25" stroke="#5A0008" stroke-width="0.4"/>
        <path d="M25 21 L22 22.5 L25 24 Z" fill="#C81D25" stroke="#5A0008" stroke-width="0.4"/>
        <rect x="21.4" y="22" width="1.2" height="1" fill="#8B0010"/>
      </g>
      <!-- simple face -->
      <circle cx="20" cy="12" r="0.7" fill="#1F1A14"/>
      <circle cx="24" cy="12" r="0.7" fill="#1F1A14"/>
      <path d="M20 15 Q22 16.2 24 15" stroke="#1F1A14" stroke-width="0.8" fill="none" stroke-linecap="round"/>
      <!-- bouquet in raised right hand -->
      <g class="char-bouquet" transform="translate(33 18)">
        <circle cx="-1.5" cy="0" r="1.6" fill="#C81D25" stroke="#5A0008" stroke-width="0.4"/>
        <circle cx="1.5"  cy="0" r="1.6" fill="#E63946" stroke="#5A0008" stroke-width="0.4"/>
        <circle cx="0"    cy="-1.5" r="1.8" fill="#9D0208" stroke="#5A0008" stroke-width="0.4"/>
        <ellipse cx="-2" cy="1" rx="1.4" ry="0.5" fill="#4D8033" transform="rotate(-25 -2 1)"/>
        <ellipse cx="2"  cy="1" rx="1.4" ry="0.5" fill="#3F6B2B" transform="rotate(25 2 1)"/>
        <path d="M-1.5 2 L1.5 2 L1 3.5 L-1 3.5 Z" fill="#F8EFE0" stroke="#A07A55" stroke-width="0.3"/>
      </g>
    </svg>
    <div class="avatar-name">TFTF</div>`;
  wrap.appendChild(tftfDancer);

  // RORO — bride character (replaces the photo avatar when groom arrives)
  const roroBride = document.createElement('div');
  roroBride.className = 'avatar roro-bride';
  roroBride.innerHTML = `
    <svg class="char-svg bride-svg" viewBox="0 0 44 60" width="36" height="50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="veilGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.05"/>
        </linearGradient>
      </defs>
      <!-- ground shadow -->
      <ellipse cx="22" cy="57" rx="10" ry="1.4" fill="#000" opacity="0.18"/>
      <!-- VEIL behind everything -->
      <path d="M14 10 Q22 4 30 10 L33 38 Q22 36 11 38 Z" fill="url(#veilGrad)" stroke="#FFFFFF" stroke-width="0.3" opacity="0.85"/>
      <!-- A-line dress -->
      <path d="M19 28 L13 56 L31 56 L25 28 Z" fill="#FFFFFF" stroke="#1F1A14" stroke-width="1.6"/>
      <!-- waist sash -->
      <line x1="19" y1="28" x2="25" y2="28" stroke="#D4AF37" stroke-width="0.6"/>
      <!-- stick body lines -->
      <g stroke="#1F1A14" stroke-width="2" stroke-linecap="round" fill="none">
        <!-- body (torso line just under head) -->
        <line x1="22" y1="20" x2="22" y2="28"/>
        <!-- arms -->
        <line x1="22" y1="23" x2="13" y2="30"/>
        <line x1="22" y1="23" x2="31" y2="30"/>
      </g>
      <!-- head -->
      <circle cx="22" cy="13" r="6" fill="none" stroke="#1F1A14" stroke-width="2"/>
      <!-- tiara on top of head -->
      <path d="M17 8 L19 6 L22 8 L25 6 L27 8" stroke="#D4AF37" stroke-width="0.8" fill="none" stroke-linecap="round"/>
      <circle cx="22" cy="7.2" r="0.6" fill="#FFFFFF" stroke="#D4AF37" stroke-width="0.4"/>
      <!-- simple face -->
      <circle cx="20" cy="12" r="0.7" fill="#1F1A14"/>
      <circle cx="24" cy="12" r="0.7" fill="#1F1A14"/>
      <!-- bride red lips -->
      <path d="M20.5 15 Q22 16 23.5 15" stroke="#C44569" stroke-width="1" fill="none" stroke-linecap="round"/>
      <!-- floating heart -->
      <text class="bride-heart" x="35" y="14" font-size="6" fill="#C44569">❤</text>
    </svg>
    <div class="avatar-name">RORO</div>`;
  wrap.appendChild(roroBride);

  /* removed legacy dancer SVG: `
  /* removed legacy dancer SVG: `
    <svg class="dancer-svg" viewBox="0 0 44 60" width="40" height="56" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="suitGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#2A3340"/>
          <stop offset="100%" stop-color="#1A222C"/>
        </linearGradient>
        <linearGradient id="pantsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#222932"/>
          <stop offset="100%" stop-color="#11161D"/>
        </linearGradient>
      </defs>

      <!-- ground shadow -->
      <ellipse cx="22" cy="57" rx="11" ry="1.6" fill="#000" opacity="0.18"/>

      <!-- floating WOOHOO speech bubble -->
      <g class="dancer-woo">
        <ellipse cx="36" cy="3" rx="7" ry="3" fill="#FFFFFF" stroke="#2D4A2B" stroke-width="0.6"/>
        <path d="M31 5 L29 7 L31.5 5.4 Z" fill="#FFFFFF" stroke="#2D4A2B" stroke-width="0.6"/>
        <text x="36" y="4.4" text-anchor="middle" font-size="3" font-weight="700" fill="#2D4A2B" font-family="Arial">WOOHOO!</text>
      </g>

      <!-- LEGS (tailored slim trousers, filled silhouette) -->
      <g class="dancer-legs">
        <path d="M16 38 L15 56 L19 56 L20.5 38 Z" fill="url(#pantsGrad)"/>
        <path d="M23.5 38 L25 56 L29 56 L28 38 Z" fill="url(#pantsGrad)"/>
        <!-- shoes -->
        <path d="M14 56 Q14 58 17 58 L20 58 L19.5 56 L15 56 Z" fill="#0E1218"/>
        <path d="M25 56 Q25 58 28 58 L31 58 L29.5 56 L25 56 Z" fill="#0E1218"/>
        <!-- shoe shine -->
        <ellipse cx="17" cy="57" rx="1.5" ry="0.4" fill="#FFFFFF" opacity="0.22"/>
        <ellipse cx="28" cy="57" rx="1.5" ry="0.4" fill="#FFFFFF" opacity="0.22"/>
      </g>

      <!-- TORSO: tailored suit jacket silhouette -->
      <path d="M13 22 Q22 19 31 22 L33 40 L11 40 Z" fill="url(#suitGrad)"/>
      <!-- shoulders contour highlight -->
      <path d="M13 22 Q22 20 31 22 Q22 21 13 22 Z" fill="#FFFFFF" opacity="0.06"/>

      <!-- white shirt V -->
      <path d="M19 22 L22 30 L25 22 Z" fill="#F5F5F0"/>
      <!-- goofy oversized BOWTIE -->
      <g class="dancer-bowtie">
        <path d="M18.5 22 L22 24 L18.5 26 Z" fill="#C81D25" stroke="#5A0008" stroke-width="0.4"/>
        <path d="M25.5 22 L22 24 L25.5 26 Z" fill="#C81D25" stroke="#5A0008" stroke-width="0.4"/>
        <rect x="21.2" y="23.2" width="1.6" height="1.6" rx="0.3" fill="#8B0010" stroke="#5A0008" stroke-width="0.3"/>
        <circle cx="22" cy="24" r="0.4" fill="#FFD700"/>
      </g>
      <!-- lapel flower (boutonnière) -->
      <g transform="translate(15 26)">
        <circle r="1.2" fill="#E63946" stroke="#5A0008" stroke-width="0.3"/>
        <circle r="0.5" fill="#FFD700"/>
        <ellipse cx="-1.2" cy="0.8" rx="0.7" ry="0.3" fill="#4D8033" transform="rotate(-30 -1.2 0.8)"/>
      </g>

      <!-- lapel lines -->
      <path d="M19 22 L17 35" stroke="#0D131A" stroke-width="0.6" fill="none"/>
      <path d="M25 22 L27 35" stroke="#0D131A" stroke-width="0.6" fill="none"/>

      <!-- pocket square -->
      <rect x="26.5" y="27" width="2.2" height="1.6" fill="#C81D25"/>

      <!-- ARMS — left arm down at side, right arm extended holding bouquet -->
      <g class="dancer-arms">
        <!-- left arm -->
        <path d="M13 23 L10 36 L11.5 36.6 L14.5 24 Z" fill="url(#suitGrad)"/>
        <!-- left hand -->
        <circle cx="11" cy="37" r="1.6" fill="#E5B98A" stroke="#A77E54" stroke-width="0.3"/>
        <!-- shirt cuff -->
        <rect x="9.4" y="34.5" width="3" height="0.8" fill="#F5F5F0"/>

        <!-- right arm — raised slightly outward holding bouquet -->
        <path d="M31 23 L37 27 L36 28.5 L29.5 24.5 Z" fill="url(#suitGrad)"/>
        <!-- right hand -->
        <circle cx="38" cy="28" r="1.6" fill="#E5B98A" stroke="#A77E54" stroke-width="0.3"/>
        <rect x="35.4" y="25.6" width="3" height="0.8" fill="#F5F5F0" transform="rotate(28 36.9 26)"/>
      </g>

      <!-- NECK -->
      <rect x="20" y="18" width="4" height="3" fill="#E5B98A"/>

      <!-- HEAD — clean oval, modern proportions -->
      <ellipse cx="22" cy="13" rx="5.4" ry="6.2" fill="#EBC198" stroke="#A77E54" stroke-width="0.4"/>

      <!-- jawline shadow -->
      <path d="M17 14 Q22 19 27 14" stroke="#A77E54" stroke-width="0.3" fill="none" opacity="0.5"/>

      <!-- HAIR — modern fade/quiff -->
      <path d="M16.5 9 Q18 5 22 5 Q26 5 27.5 9 Q28 11 27 11.5 Q26 9 22 8.5 Q18 9 17 11.5 Q16 11 16.5 9 Z" fill="#1F1A14"/>
      <!-- hair highlight -->
      <path d="M19 7.5 Q22 6 25 7.5" stroke="#3B2E1F" stroke-width="0.5" fill="none" stroke-linecap="round"/>

      <!-- BEARD — neat short stubble -->
      <path d="M18 14.5 Q22 17 26 14.5 Q25 16.8 22 17.4 Q19 16.8 18 14.5 Z" fill="#1F1A14" opacity="0.85"/>

      <!-- eyebrows — raised excitedly, asymmetric for character -->
      <path d="M18.2 10.6 Q19.8 9.6 21.2 10.4" stroke="#1F1A14" stroke-width="0.9" fill="none" stroke-linecap="round"/>
      <path d="M22.8 10.2 Q24.4 9.2 25.8 10.4" stroke="#1F1A14" stroke-width="0.9" fill="none" stroke-linecap="round"/>

      <!-- cool sunglasses (aviators!) -->
      <g class="dancer-shades">
        <rect x="17.6" y="11.6" width="3.6" height="2.4" rx="1.2" fill="#0A0A0A" stroke="#2D2D2D" stroke-width="0.4"/>
        <rect x="22.8" y="11.6" width="3.6" height="2.4" rx="1.2" fill="#0A0A0A" stroke="#2D2D2D" stroke-width="0.4"/>
        <line x1="21.2" y1="12.4" x2="22.8" y2="12.4" stroke="#2D2D2D" stroke-width="0.5"/>
        <!-- lens shine -->
        <path d="M18.2 12 L20 13.6" stroke="#FFFFFF" stroke-width="0.4" opacity="0.7"/>
        <path d="M23.4 12 L25.2 13.6" stroke="#FFFFFF" stroke-width="0.4" opacity="0.7"/>
      </g>

      <!-- BIG TOOTHY GRIN — open mouth, teeth showing -->
      <path d="M19.5 14.8 Q22 17.8 24.5 14.8 Q22 16 19.5 14.8 Z" fill="#3A1410" stroke="#1F1A14" stroke-width="0.4"/>
      <!-- teeth -->
      <rect x="20" y="14.9" width="4" height="0.9" fill="#FFFFFF"/>
      <!-- tongue -->
      <path d="M20.5 15.8 Q22 16.8 23.5 15.8 Q22 16.4 20.5 15.8 Z" fill="#E95F73"/>

      <!-- cheek blush — flushed with joy -->
      <ellipse cx="17.4" cy="14.6" rx="1.2" ry="0.7" fill="#E89B8B" opacity="0.55"/>
      <ellipse cx="26.6" cy="14.6" rx="1.2" ry="0.7" fill="#E89B8B" opacity="0.55"/>

      <!-- BOUQUET — held in right hand (anchored at hand position) -->
      <g class="dancer-bouquet" transform="translate(38 26)">
        <!-- stem bundle behind -->
        <g stroke="#3A5A28" stroke-width="0.6" stroke-linecap="round" fill="none">
          <line x1="-1" y1="2" x2="-2" y2="6"/>
          <line x1="0"  y1="2" x2="0"  y2="6"/>
          <line x1="1"  y1="2" x2="2"  y2="6"/>
        </g>
        <!-- leaves -->
        <ellipse cx="-4" cy="-1" rx="2.6" ry="1.1" fill="#3F6B2B" stroke="#23401A" stroke-width="0.3" transform="rotate(-30 -4 -1)"/>
        <ellipse cx="4"  cy="-1" rx="2.6" ry="1.1" fill="#4D8033" stroke="#23401A" stroke-width="0.3" transform="rotate(30 4 -1)"/>
        <ellipse cx="-3" cy="2"  rx="2.2" ry="0.9" fill="#3F6B2B" stroke="#23401A" stroke-width="0.3" transform="rotate(-10 -3 2)"/>
        <ellipse cx="3"  cy="2"  rx="2.2" ry="0.9" fill="#4D8033" stroke="#23401A" stroke-width="0.3" transform="rotate(10 3 2)"/>

        <!-- baby's breath -->
        <g fill="#FFFFFF" opacity="0.95">
          <circle cx="-3" cy="-3" r="0.5"/>
          <circle cx="3"  cy="-3" r="0.5"/>
          <circle cx="0"  cy="-4" r="0.5"/>
        </g>

        <!-- ROSES — layered for depth -->
        <g transform="translate(-2.5 -1)">
          <circle r="2.4" fill="#7A0A1A" stroke="#3A0008" stroke-width="0.4"/>
          <path d="M-1.6 0 Q0 -1.8 1.6 0 Q0 1.6 -1.6 0 Z" fill="#B71C2B"/>
          <path d="M-1 -0.3 Q0 -1.1 1 -0.3 Q0 0.8 -1 -0.3 Z" fill="#E63946"/>
          <circle r="0.5" fill="#3A0008"/>
        </g>
        <g transform="translate(2.5 -1)">
          <circle r="2.4" fill="#8B0010" stroke="#3A0008" stroke-width="0.4"/>
          <path d="M-1.6 0 Q0 -1.8 1.6 0 Q0 1.6 -1.6 0 Z" fill="#C81D25"/>
          <path d="M-1 -0.3 Q0 -1.1 1 -0.3 Q0 0.8 -1 -0.3 Z" fill="#EF3A4C"/>
          <circle r="0.5" fill="#3A0008"/>
        </g>
        <g transform="translate(0 1.5)">
          <circle r="2.8" fill="#7A0A1A" stroke="#3A0008" stroke-width="0.4"/>
          <path d="M-2 0 Q0 -2.2 2 0 Q0 2 -2 0 Z" fill="#B71C2B"/>
          <path d="M-1.3 -0.4 Q0 -1.4 1.3 -0.4 Q0 1 -1.3 -0.4 Z" fill="#E63946"/>
          <path d="M-0.7 -0.3 Q0 -0.8 0.7 -0.3 Q0 0.4 -0.7 -0.3 Z" fill="#FF6477"/>
          <circle r="0.6" fill="#3A0008"/>
        </g>

        <!-- elegant wrap -->
        <path d="M-3 4 L3 4 L2 7 L-2 7 Z" fill="#F8EFE0" stroke="#A07A55" stroke-width="0.4"/>
        <path d="M-3 4 L3 4 L2.5 4.6 L-2.5 4.6 Z" fill="#E2D2BB"/>
        <!-- ribbon -->
        <path d="M-2.5 5.6 Q0 6.4 2.5 5.6 L2.5 6.4 Q0 7.2 -2.5 6.4 Z" fill="#9D1B2C" stroke="#5A0008" stroke-width="0.3"/>
        <path d="M-0.5 6.5 L-1.4 8 L-0.5 8 L0 6.8 Z" fill="#9D1B2C" stroke="#5A0008" stroke-width="0.3"/>
        <path d="M0.5 6.5 L1.4 8 L0.5 8 L0 6.8 Z" fill="#9D1B2C" stroke="#5A0008" stroke-width="0.3"/>
      </g>
    </svg>
    <div class="avatar-name">TFTF</div>` */

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
    const icons = ['🎆', '🎇', '✨', '💥', '🌟', '⭐', '💫', '🎉'];
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

  let sequenceRunning = false;
  function runSequence() {
    if (sequenceRunning) return;
    sequenceRunning = true;
    const [luxorX, luxorY] = latLngToXY(LUXOR);
    const [cairoX, cairoY] = latLngToXY(CAIRO);

    // Reset state for re-runs (when scrolled into view again)
    routeLine.setLatLngs([]);
    [tftfEl, roroBride].forEach(el => {
      el.classList.remove('visible','waiting','travelling','celebrating');
    });
    wrap.querySelectorAll('.celeb-bubble,.heart-pop').forEach(el => el.remove());

    // 1 — RORO appears in Luxor, waiting
    moveEl(roroBride, luxorX, luxorY - 4);
    roroBride.classList.add('visible', 'waiting');

    // 2 — TFTF appears in Cairo after 1s
    setTimeout(() => {
      moveEl(tftfEl, cairoX, cairoY - 4);
      tftfEl.classList.add('visible');

      // 3 — TFTF travels south after 0.7s — smooth rAF-driven 60fps
      setTimeout(() => {
        tftfEl.classList.add('travelling');
        const DURATION = 4200;
        const startTime = performance.now();

        function frame(now) {
          const t = Math.min(1, (now - startTime) / DURATION);
          const lat = lerp(CAIRO[0], LUXOR[0], t);
          const lng = lerp(CAIRO[1], LUXOR[1], t);
          const [px, py] = latLngToXY([lat, lng]);
          moveEl(tftfEl, px, py - 4);

          // Trail polyline exactly to car position
          const pts = routePts.slice(0, Math.floor(t * STEPS) + 1);
          pts.push([lat, lng]);
          routeLine.setLatLngs(pts);
          routeLine.setStyle({ dashOffset: String(-t * STEPS * 1.5) });

          if (t < 1) requestAnimationFrame(frame);
          else arrive();
        }
        requestAnimationFrame(frame);
      }, 700);
    }, 1000);
  }

  function arrive() {
    tftfEl.classList.remove('travelling');
    roroBride.classList.remove('waiting');

    const [lx, ly] = latLngToXY(LUXOR);

    // Park the car off to the left
    moveEl(tftfEl, lx - 50, ly - 4);
    tftfEl.classList.add('parked');

    // RORO transitions from waiting to dancing in place
    roroBride.classList.remove('waiting');
    moveEl(roroBride, lx + 26, ly - 4);

    // TFTF steps out, both dance together
    setTimeout(() => {
      moveEl(tftfDancer, lx - 26, ly - 4);
      tftfDancer.classList.add('visible', 'dancing');
      roroBride.classList.add('dancing');
    }, 450);

    // Fireworks burst — varied positions and icons
    const burst = setInterval(() => {
      spawnHeart(lx + (Math.random() * 80 - 40), ly - (Math.random() * 40 + 10));
      spawnHeart(lx + (Math.random() * 80 - 40), ly - (Math.random() * 40 + 10));
    }, 180);
    setTimeout(() => {
      clearInterval(burst);
      tftfEl.classList.remove('celebrating', 'parked');
      roroBride.classList.remove('visible', 'dancing');
      tftfDancer.classList.remove('visible', 'dancing');
      sequenceRunning = false;
    }, 4000);
  }

  // Attach sequence to section element so IntersectionObserver can trigger it
  const mapSection = document.querySelector('.map-section');
  if (mapSection) mapSection._runMapSequence = runSequence;

  // Dedicated observer: only run the car sequence when the map is truly visible
  if (mapSection) {
    const mapObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          map.whenReady(() => runSequence());
        }
      });
    }, { threshold: [0.55] });
    mapObserver.observe(mapSection);
  }
}

function initTyping() {
  const msgEl = document.querySelector('.msg-text');
  if (!msgEl) return;

  const lines = [
    'Every path somehow led to this moment.',
    'Come celebrate with us as we begin our forever.',
  ];

  // Replace content with empty spans we'll fill character by character
  msgEl.innerHTML = lines.map((_, i) =>
    `<span class="type-line" id="type-line-${i}"></span>`
  ).join('<br>');

  const CHAR_DELAY = 45;
  const LINE_PAUSE = 500;

  function typeLine(lineIndex, done) {
    const el = document.getElementById(`type-line-${lineIndex}`);
    const text = lines[lineIndex];
    let i = 0;
    el.innerHTML = '<span class="type-cursor">|</span>';

    const iv = setInterval(() => {
      el.innerHTML = text.slice(0, i) + '<span class="type-cursor">|</span>';
      i++;
      if (i > text.length) {
        clearInterval(iv);
        el.innerHTML = text;
        done();
      }
    }, CHAR_DELAY);
  }

  function runTyping() {
    typeLine(0, () => {
      setTimeout(() => {
        typeLine(1, () => {});
      }, LINE_PAUSE);
    });
  }

  const section = document.querySelector('.message');
  if (section) section._runTyping = runTyping;
}

function initRSVP() {
  const yesBtn   = document.getElementById('rsvpYes');
  const noBtn    = document.getElementById('rsvpNo');
  const arena    = document.getElementById('rsvpArena');
  const q        = document.getElementById('rsvpQ');
  const yesState = document.getElementById('rsvpYesState');
  const noState  = document.getElementById('rsvpNoState');
  if (!yesBtn || !noBtn) return;

  const taunt  = document.getElementById('rsvpTaunt');
  let dodges = 0;
  const MAX_DODGES = 4;

  const taunts = [
    'nice try 😏',
    'not fast enough 😄',
    'you sure about that? 👀',
    'last chance... 🥺',
  ];

  // 4 corners of the arena — guarantees big jumps on any screen size
  function cornerPos(index) {
    const aw = arena.offsetWidth;
    const ah = arena.offsetHeight;
    const bw = noBtn.offsetWidth  || 140;
    const bh = noBtn.offsetHeight || 48;
    const pad = 10;
    const corners = [
      { x: pad,          y: pad },
      { x: aw - bw - pad, y: pad },
      { x: pad,          y: ah - bh - pad },
      { x: aw - bw - pad, y: ah - bh - pad },
    ];
    return corners[index % corners.length];
  }

  noBtn.addEventListener('click', () => {
    if (dodges >= MAX_DODGES) return;
    dodges++;

    if (dodges >= MAX_DODGES) {
      q.style.display = 'none';
      noState.style.display = 'block';
      const cryIcons = ['😭','💔'];
      spawnEmojiBurst(cryIcons, 40);
      const keepCry = setInterval(() => spawnEmojiBurst(cryIcons, 15), 350);
      setTimeout(() => clearInterval(keepCry), 2500);
      return;
    }

    // Jump to the next corner
    const { x, y } = cornerPos(dodges);
    noBtn.style.transform = 'none';
    noBtn.style.left = x + 'px';
    noBtn.style.top  = y + 'px';

    // Show taunt
    taunt.textContent = taunts[dodges - 1];
    taunt.classList.add('show');
    setTimeout(() => taunt.classList.remove('show'), 1200);

    // YES button grows with each dodge
    yesBtn.style.transform = `translateX(-50%) scale(${1 + dodges * 0.07})`;
  });

  function spawnEmojiBurst(icons, count) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const h = document.createElement('div');
        h.textContent = icons[Math.floor(Math.random() * icons.length)];
        const lx = Math.random() * 100;
        const ly = Math.random() * 100;
        const tx = (Math.random() * 100 - 50) + 'px';
        const ty = (-(Math.random() * 120 + 40)) + 'px';
        h.style.cssText = `
          position:fixed;
          left:${lx}%;top:${ly}%;
          --tx:${tx};--ty:${ty};
          font-size:${22 + Math.random() * 20}px;
          pointer-events:none;
          z-index:9999;
          opacity:0;
          animation:heartBurst 1.8s ease-out forwards;
        `;
        document.body.appendChild(h);
        setTimeout(() => h.remove(), 1900);
      }, i * 50);
    }
  }

  yesBtn.addEventListener('click', () => {
    q.style.display = 'none';
    yesState.style.display = 'block';
    const happyIcons = ['🎉','💚','🌿','✨','🎊','💫','🥳','💃','🎆','⭐','🌟','💛'];
    spawnEmojiBurst(happyIcons, 40);
    const keepBurst = setInterval(() => spawnEmojiBurst(happyIcons, 15), 350);
    setTimeout(() => clearInterval(keepBurst), 2500);
  });

}

function initMusic() {
  const btn   = document.getElementById('musicBtn');
  const audio = document.getElementById('bgMusic');
  if (!btn || !audio) return;

  const START_SEC = 98; // 1:38

  function setPlaying() {
    btn.classList.add('playing');
    btn.classList.remove('paused');
    btn.setAttribute('aria-label', 'Pause music');
  }
  function setPaused() {
    btn.classList.remove('playing');
    btn.classList.add('paused');
    btn.setAttribute('aria-label', 'Play music');
  }

  // Try autoplay immediately
  audio.currentTime = START_SEC;
  audio.play().then(setPlaying).catch(() => {
    // Browser blocked autoplay — play on first touch anywhere
    const unlock = () => {
      audio.currentTime = START_SEC;
      audio.play().then(setPlaying).catch(() => {});
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('click', unlock);
    };
    document.addEventListener('touchstart', unlock, { once: true });
    document.addEventListener('click',      unlock, { once: true });
  });

  // Toggle on button press
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audio.paused) {
      audio.play().then(setPlaying).catch(() => {});
    } else {
      audio.pause();
      setPaused();
    }
  });
}

function initRingEasterEgg() {
  const btn = document.getElementById('ringBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const colors = ['#FFD700','#FFC107','#FFEB3B','#FF8F00','#FFF176','#FFD54F','#FFCA28','#ffffff','#fffde7'];
    const count  = 200;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el       = document.createElement('div');
        const size     = 5 + Math.random() * 9;
        const isCircle = Math.random() > 0.45;
        const duration = 2.4 + Math.random() * 2;
        const color    = colors[Math.floor(Math.random() * colors.length)];
        const drift    = (Math.random() - 0.5) * 220;
        const rot      = Math.random() * 720 - 360;

        el.style.cssText = `
          position:fixed;
          left:${Math.random() * 100}%;
          top:-16px;
          width:${size}px;
          height:${isCircle ? size : size * 0.45}px;
          background:${color};
          border-radius:${isCircle ? '50%' : '2px'};
          z-index:9999;
          pointer-events:none;
          --drift:${drift}px;
          --rot:${rot}deg;
          animation:confettiFall ${duration}s ease-in forwards;
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), duration * 1000 + 100);
      }, i * 12);
    }
  });
}

function initGuestbook() {
  const nameEl   = document.getElementById('gbName');
  const msgEl    = document.getElementById('gbMsg');
  const sendBtn  = document.getElementById('gbSend');
  const statusEl = document.getElementById('gbStatus');
  if (!sendBtn) return;

  const BOT_TOKEN = '8539391714:AAG49bGlVG0j2RhW1-B1C1xWP6L1DaeHqmo';
  const CHAT_ID   = '-5246813287';

  sendBtn.addEventListener('click', async () => {
    const name = nameEl.value.trim();
    const msg  = msgEl.value.trim();
    if (!name) { statusEl.textContent = 'Please enter your name 🌿'; return; }
    if (!msg)  { statusEl.textContent = 'Please write a message 💌'; return; }

    sendBtn.disabled = true;
    statusEl.textContent = 'Sending...';

    const text = `💌 New wish from *${name}*:\n\n${msg}`;

    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' }),
      });
      const data = await res.json();
      if (data.ok) {
        nameEl.value = '';
        msgEl.value  = '';
        statusEl.textContent = 'Your wish has been sent 💚 Thank you!';
        sendBtn.disabled = false;
      } else {
        throw new Error(data.description);
      }
    } catch (e) {
      statusEl.textContent = 'Something went wrong, please try again.';
      sendBtn.disabled = false;
    }
  });
}
