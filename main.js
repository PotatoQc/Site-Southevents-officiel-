// ─── CURSOR ───────────────────────────────────
const cursor = document.getElementById('cursor')
const cursorRing = document.getElementById('cursorRing')
let mx = 0, my = 0, rx = 0, ry = 0

const isTouchDevice = () => window.matchMedia('(hover: none)').matches
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!cursor || !cursorRing) {
  // Page sans curseur custom.
} else if (isTouchDevice() || prefersReducedMotion()) {
  cursor.style.display = 'none'
  cursorRing.style.display = 'none'
} else {
  document.addEventListener('mousemove', e => {
    mx = e.clientX
    my = e.clientY
    cursor.style.transform = `translate(${mx - 4}px, ${my - 4}px)`
  })
  function animateRing() {
    rx += (mx - rx) * 0.1
    ry += (my - ry) * 0.1
    cursorRing.style.transform = `translate(${rx - 16}px, ${ry - 16}px)`
    requestAnimationFrame(animateRing)
  }
  animateRing()
}

// ─── PARTICLES ────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particles')
  if (!canvas || prefersReducedMotion()) return
  const ctx = canvas.getContext('2d')
  function resize() {
    const hero = canvas.parentElement
    canvas.width = hero.offsetWidth || window.innerWidth
    canvas.height = hero.offsetHeight || window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)
  const COUNT = 55
  const particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -(Math.random() * 0.4 + 0.1),
    op: Math.random() * 0.5 + 0.1,
    dop: (Math.random() - 0.5) * 0.005,
  }))
  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.op += p.dop
      if (p.op < 0.05) { p.op = 0.05; p.dop *= -1 }
      if (p.op > 0.65) { p.op = 0.65; p.dop *= -1 }
      if (p.y < -5) p.y = canvas.height + 5
      if (p.x < -5) p.x = canvas.width + 5
      if (p.x > canvas.width + 5) p.x = -5
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(245,242,236,${p.op})`
      ctx.fill()
    })
    requestAnimationFrame(drawParticles)
  }
  drawParticles()
}
initParticles()

// ─── STAT COUNTERS ────────────────────────────
function initStats() {
  const statEls = document.querySelectorAll('.stat-num[data-target]')
  if (!statEls.length) return
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      const el = entry.target
      const target = parseInt(el.dataset.target, 10)
      const dur = 1800
      const start = performance.now()
      function tick(now) {
        const elapsed = now - start
        const prog = Math.min(elapsed / dur, 1)
        const ease = 1 - Math.pow(1 - prog, 3)
        el.textContent = Math.floor(ease * target)
        if (prog < 1) requestAnimationFrame(tick)
        else el.textContent = target
      }
      requestAnimationFrame(tick)
      observer.unobserve(el)
    })
  }, { threshold: 0.5 })
  statEls.forEach(el => observer.observe(el))
}
initStats()

// ─── COUNTDOWN ────────────────────────────────
const targetDate = new Date('2026-06-19T22:00:00-04:00')

const eventDateDisplay = document.getElementById('eventDateDisplay')
const countdownStatus = document.getElementById('countdownStatus')
const countdownSection = document.getElementById('countdown')
if (eventDateDisplay && targetDate) {
  eventDateDisplay.textContent = targetDate.toLocaleDateString('fr-CA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Toronto'
  })
}

function pad(n) { return String(n).padStart(2, '0') }
function updateCountdown() {
  const ids = ['days', 'hours', 'minutes', 'seconds']
  const countdownEls = ids.map(id => document.getElementById(id))
  if (!countdownEls.every(Boolean)) return
  if (!targetDate) { countdownEls.forEach(el => el.textContent = '--'); return }
  const diff = targetDate - Date.now()
  if (diff < 0) {
    countdownEls.forEach(el => el.textContent = '00')
    countdownSection?.classList.add('countdown-expired')
    if (countdownStatus) countdownStatus.textContent = 'Cet événement est terminé. La prochaine date sera annoncée bientôt.'
    return
  }
  countdownSection?.classList.remove('countdown-expired')
  if (countdownStatus) countdownStatus.textContent = 'Le prochain événement approche.'
  countdownEls[0].textContent = pad(Math.floor(diff / 86400000))
  countdownEls[1].textContent = pad(Math.floor(diff % 86400000 / 3600000))
  countdownEls[2].textContent = pad(Math.floor(diff % 3600000 / 60000))
  countdownEls[3].textContent = pad(Math.floor(diff % 60000 / 1000))
}
if (countdownSection) {
  setInterval(updateCountdown, 1000)
  updateCountdown()
}

// ─── VIDEO GALLERY ────────────────────────────
let videos = [
  { title: 'ThrowBack 2010', date: '3 Avril 2026', igUrl: 'https://www.instagram.com/reel/DW4Ij6kDSlS/', preview: 'tb2010.mp4' },
  { title: 'ThrowBack 2016', date: '6 Mars 2026', igUrl: 'https://www.instagram.com/reel/DVq2r23jUnn/', preview: 'tb2016.mp4' },
]

function renderVideos() {
  const grid = document.getElementById('videoGrid')
  if (!grid) return
  const touch = isTouchDevice()

  grid.innerHTML = videos.map(v => {
    const isVideo = v.preview && /\.(mp4|webm)$/i.test(v.preview)
    const media = v.preview
      ? isVideo
        ? `<video class="card-preview-video" src="${v.preview}" muted loop playsinline preload="metadata"
             style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;"></video>`
        : `<img src="${v.preview}" alt="${v.title}"
             style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;" />`
      : `<div class="video-placeholder"><div class="video-placeholder-lines"></div>
           <div class="play-btn"><svg width="16" height="16" viewBox="0 0 24 24">
           <polygon points="5,3 19,12 5,21"/></svg></div></div>`

    return `
      <div class="video-card fade-up">
        <a href="${v.igUrl}" target="_blank" rel="noopener" aria-label="Voir ${v.title} sur Instagram">
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

  grid.querySelectorAll('.video-card').forEach(card => {
    const vid = card.querySelector('.card-preview-video')
    if (!vid) return
    if (touch) {
      vid.play()
    } else {
      card.addEventListener('mouseenter', () => vid.play())
      card.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime = 0 })
    }
  })

  requestAnimationFrame(() => {
    grid.querySelectorAll('.fade-up').forEach((el, i) =>
      setTimeout(() => el.classList.add('visible'), i * 120))
  })
}
renderVideos()

// ─── TICKET WIDGET FALLBACK ───────────────────
function initTicketWidgetFallback() {
  const widget = document.querySelector('.hievents-widget')
  const fallback = document.getElementById('ticketWidgetFallback')
  if (!widget || !fallback) return

  setTimeout(() => {
    const iframe = widget.querySelector('iframe')
    if (!iframe) {
      fallback.classList.add('show')
    }
  }, 8000)
}
initTicketWidgetFallback()

// ─── SCROLL REVEAL ────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible')
  })
}, { threshold: 0.12 })
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el))
