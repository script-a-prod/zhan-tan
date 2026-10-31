// Site interactions: header, mobile nav, reveal, counters, methods tabs, video modals, parallax.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Header state
const header = $('.site-header');
const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// Mobile nav
const burger = $('.burger'), mnav = $('#mobile-nav');
if (burger && mnav) {
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    mnav.hidden = open;
  });
  mnav.addEventListener('click', (e) => { if (e.target.tagName === 'A') { burger.setAttribute('aria-expanded', 'false'); mnav.hidden = true; } });
}

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
$$('.reveal').forEach((el) => io.observe(el));

// Counters
const fmt = (n, d) => d ? n.toFixed(d) : Math.round(n).toLocaleString('ru-RU');
const cio = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    cio.unobserve(e.target);
    const el = e.target, target = parseFloat(el.dataset.count), d = +el.dataset.decimals || 0, suf = el.dataset.suffix || '';
    if (reduced) { el.textContent = fmt(target, d) + suf; continue; }
    const t0 = performance.now(), dur = 1400;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * ease, d) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}, { threshold: 0.6 });
$$('.count').forEach((el) => cio.observe(el));

// Methods tabs
const tabs = $$('.method-tab'), details = $$('.method-detail');
let hoverTimer;
function selectMethod(i) {
  tabs.forEach((t, k) => { t.classList.toggle('is-active', k === i); t.setAttribute('aria-selected', String(k === i)); });
  details.forEach((d, k) => { d.hidden = k !== i; d.classList.toggle('is-active', k === i); });
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => { selectMethod(i); if (innerWidth < 900) $('#mpanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
  t.addEventListener('mouseenter', () => { if (innerWidth >= 900) { clearTimeout(hoverTimer); hoverTimer = setTimeout(() => selectMethod(i), 120); } });
  t.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); tabs[(i + 1) % tabs.length].focus(); selectMethod((i + 1) % tabs.length); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); tabs[(i - 1 + tabs.length) % tabs.length].focus(); selectMethod((i - 1 + tabs.length) % tabs.length); }
  });
});
$('.methods-list')?.addEventListener('mouseleave', () => clearTimeout(hoverTimer));

// Hero video autoplay when visible (muted)
$$('video[data-autoplay]').forEach((v) => {
  const vio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { v.play().catch(() => {}); } else v.pause(); }), { threshold: 0.3 });
  vio.observe(v);
});

// Video modal (local mp4 & YouTube)
function openModal(node) {
  const m = document.createElement('div');
  m.className = 'vmodal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
  const close = document.createElement('button');
  close.className = 'vmodal-close'; close.setAttribute('aria-label', 'Close');
  close.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/></svg>';
  m.append(node, close);
  document.body.append(m);
  document.body.style.overflow = 'hidden';
  const kill = () => { m.remove(); document.body.style.overflow = ''; removeEventListener('keydown', esc); };
  const esc = (e) => { if (e.key === 'Escape') kill(); };
  close.addEventListener('click', kill);
  m.addEventListener('click', (e) => { if (e.target === m) kill(); });
  addEventListener('keydown', esc);
}
$$('[data-video]').forEach((btn) => btn.addEventListener('click', () => {
  const src = $('source', btn).src, poster = $('video', btn).poster;
  const v = document.createElement('video');
  v.src = src; v.poster = poster; v.controls = true; v.autoplay = true; v.playsInline = true;
  openModal(v);
}));
$$('[data-yt]').forEach((btn) => btn.addEventListener('click', () => {
  const f = document.createElement('iframe');
  f.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.yt}?autoplay=1&rel=0`;
  f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'; f.allowFullscreen = true;
  f.title = btn.getAttribute('aria-label') || 'YouTube';
  openModal(f);
}));

// Light parallax for hero photo
const px = $('[data-parallax]');
if (px && !reduced && innerWidth > 900) {
  const k = parseFloat(px.dataset.parallax) || .08;
  addEventListener('scroll', () => { px.style.transform = `translateY(${scrollY * k}px)`; }, { passive: true });
}

// Day track: drag to scroll
const track = $('.day-track');
if (track) {
  let down = false, sx = 0, sl = 0;
  track.addEventListener('pointerdown', (e) => { down = true; sx = e.clientX; sl = track.scrollLeft; track.setPointerCapture(e.pointerId); });
  track.addEventListener('pointermove', (e) => { if (down) track.scrollLeft = sl - (e.clientX - sx); });
  ['pointerup', 'pointercancel'].forEach((ev) => track.addEventListener(ev, () => { down = false; }));
}

// Smooth anchor from other pages: nothing needed (hash in href). Close details groups? no.
