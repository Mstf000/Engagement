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

        // Trigger typing effect when message section scrolls into view
        if (entry.target.classList.contains('message') &&
            typeof entry.target._runTyping === 'function') {
          entry.target._runTyping();
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

    // Fireworks burst — varied positions and icons
    const burst = setInterval(() => {
      spawnHeart(lx + (Math.random() * 80 - 40), ly - (Math.random() * 40 + 10));
      spawnHeart(lx + (Math.random() * 80 - 40), ly - (Math.random() * 40 + 10));
    }, 180);
    setTimeout(() => {
      clearInterval(burst);
      tftfEl.classList.remove('celebrating');
      roroEl.classList.remove('celebrating');
    }, 4000);
  }

  // Attach sequence to section element so IntersectionObserver can trigger it
  const mapSection = document.querySelector('.map-section');
  if (mapSection) mapSection._runMapSequence = runSequence;

  // Also auto-run once map tiles are ready (fallback for when already in view)
  map.whenReady(() => setTimeout(runSequence, 700));
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
