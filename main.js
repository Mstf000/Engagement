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
