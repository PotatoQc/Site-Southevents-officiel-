/* ═══════════════════════════════════════════════
   SOUTHEVENTS — main.js
   ═══════════════════════════════════════════════ */

// ─── CURSOR ───────────────────────────────────
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
});

(function animateRing() {
  rx += (mx - rx) * 0.1;
  ry += (my - ry) * 0.1;
  cursorRing.style.transform = `translate(${rx - 16}px, ${ry - 16}px)`;
  requestAnimationFrame(animateRing);
})();


// ─── PARTICLES ────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = 55;
  const particles = Array.from({ length: COUNT }, () => ({
    x:   Math.random() * canvas.width,
    y:   Math.random() * canvas.height,
    r:   Math.random() * 1.5 + 0.3,
    vx:  (Math.random() - 0.5) * 0.3,
    vy:  -(Math.random() * 0.4 + 0.1),
    op:  Math.random() * 0.5 + 0.1,
    dop: (Math.random() - 0.5) * 0.005,
  }));

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.op += p.dop;
      if (p.op <= 0.05 || p.op >= 0.65) p.dop *= -1;
      if (p.y < -5)  p.y = canvas.height + 5;
      if (p.x < -5)  p.x = canvas.width  + 5;
      if (p.x > canvas.width  + 5) p.x = -5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,242,236,${p.op})`;
      ctx.fill();
    });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
})();


// ─── STAT COUNTERS ────────────────────────────
(function initStats() {
  const statEls = document.querySelectorAll('.stat-num[data-target]');
  if (!statEls.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const dur    = 1800;
      const start  = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const prog    = Math.min(elapsed / dur, 1);
        const ease    = 1 - Math.pow(1 - prog, 3);
        el.textContent = Math.floor(ease * target)
        if (prog < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  statEls.forEach(el => observer.observe(el));
})();


// ─── COUNTDOWN ────────────────────────────────
let targetDate = new Date('2026-04-03T21:00:00');

const eventDateDisplay = document.getElementById('eventDateDisplay')
if (eventDateDisplay && targetDate) {
  eventDateDisplay.textContent = targetDate.toLocaleDateString('fr-CA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function pad(n) { return String(n).padStart(2, '0'); }

function updateCountdown() {
  const ids = ['days', 'hours', 'minutes', 'seconds'];
  if (!targetDate) { ids.forEach(id => { document.getElementById(id).textContent = '--'; }); return; }
  const diff = targetDate - Date.now();
  if (diff <= 0) { ids.forEach(id => { document.getElementById(id).textContent = '00'; }); return; }

  document.getElementById('days').textContent    = pad(Math.floor(diff / 86400000));
  document.getElementById('hours').textContent   = pad(Math.floor((diff % 86400000) / 3600000));
  document.getElementById('minutes').textContent = pad(Math.floor((diff % 3600000)  / 60000));
  document.getElementById('seconds').textContent = pad(Math.floor((diff % 60000)    / 1000));
}

setInterval(updateCountdown, 1000);
updateCountdown();


// ─── VIDEO GALLERY ────────────────────────────
let videos = [
  { title: 'ThrowBack 2016',  date: '6 Mars 2026',  igUrl: 'https://www.instagram.com/reel/DVq2r23jUnn/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==', preview: 'tb2016.mp4' },
  // { title: 'NIGHT FEVER',  date: 'Novembre 2023', igUrl: 'https://www.instagram.com/p/TON_POST_ID/', preview: 'preview2.jpg' },
  // { title: 'BLOCK PARTY',  date: 'Août 2023',      igUrl: 'https://www.instagram.com/p/TON_POST_ID/', preview: 'preview3.jpg' },
]


function renderVideos() {
  const grid = document.getElementById('videoGrid')
  grid.innerHTML = videos.map(v => {
    const isVideo = v.preview && /\.(mp4|webm)$/i.test(v.preview)
    const media = v.preview
      ? isVideo
        ? `<video class="card-preview-video" src="${v.preview}" muted loop playsinline
             style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;">
           </video>`
        : `<img src="${v.preview}" alt="${v.title}"
             style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;" />`
      : `<div class="video-placeholder">
           <div class="video-placeholder-lines"></div>
           <div class="play-btn">
             <svg width="16" height="16" viewBox="0 0 24 24">
               <polygon points="5,3 19,12 5,21"/>
             </svg>
           </div>
         </div>`

    return `
      <div class="video-card fade-up">
        <a href="${v.igUrl}" target="_blank" rel="noopener">
          <div class="video-wrapper">
            ${media}
            <div class="ig-overlay">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="5"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
              </svg>
              <span>Voir sur Instagram</span>
            </div>
          </div>
        </a>
        <div class="video-info">
          <h3>${v.title}</h3>
          <p>${v.date}</p>
          <span class="video-tag">Aftermovie</span>
        </div>
      </div>`
  }).join('')

  // Gestion hover sur les vidéos
  grid.querySelectorAll('.video-card').forEach(card => {
    const vid = card.querySelector('.card-preview-video')
    if (!vid) return
    card.addEventListener('mouseenter', () => vid.play())
    card.addEventListener('mouseleave', () => {
      vid.pause()
      vid.currentTime = 0
    })
  })

  requestAnimationFrame(() => {
    grid.querySelectorAll('.fade-up').forEach((el, i) =>
      setTimeout(() => el.classList.add('visible'), i * 120))
  })
}



renderVideos();


// ─── SCROLL REVEAL ────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

