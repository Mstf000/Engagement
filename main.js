// main.js — runs after DOM + Leaflet are loaded
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCountdown();
  initMap();
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

  function runSequence() {
    const [luxorX, luxorY] = latLngToXY(LUXOR);
    const [cairoX, cairoY] = latLngToXY(CAIRO);

    // Reset state for re-runs (when scrolled into view again)
    routeLine.setLatLngs([]);
    [tftfEl, roroEl].forEach(el => {
      el.classList.remove('visible','waiting','travelling','celebrating');
    });
    wrap.querySelectorAll('.celeb-bubble,.heart-pop').forEach(el => el.remove());

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

  // Attach sequence to section element so IntersectionObserver (Task 9) can trigger it
  const mapSection = document.querySelector('.map-section');
  if (mapSection) mapSection._runMapSequence = runSequence;

  // Also auto-run once map tiles are ready (fallback for when already in view)
  map.whenReady(() => setTimeout(runSequence, 700));
}
