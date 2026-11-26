/* Scroll suave, entradas de texto, galería horizontal, cursor y demás movimiento */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = (n) => String(n).padStart(2, '0');

let lenis = null;
let revealCtx = null;
let reduced = false;

/* ---------- scroll ---------- */
function initScroll() {
  if (reduced) return;
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.2 });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function scrollToTarget(target) {
  if (lenis) lenis.scrollTo(target, { duration: 1.7, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else (typeof target === 'number' ? window.scrollTo(0, target) : target.scrollIntoView());
}

function initAnchors() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href');
    e.preventDefault();
    if (id.length < 2) return;
    const target = $(id); if (!target) return;
    setMenu(false);
    scrollToTarget(id === '#inicio' ? 0 : target);
  });
}

/* ---------- desplegables: menú y «Únete» ---------- */
const root = document.documentElement;
function setMenu(open) {
  if (root.classList.contains('menu-open') === open) return;
  if (open) setJoin(false);
  root.classList.toggle('menu-open', open);
  $('.burger').setAttribute('aria-expanded', String(open));
  $('#menu').setAttribute('aria-hidden', String(!open));
}
function setJoin(open) {
  if (root.classList.contains('join-open') === open) return;
  if (open) setMenu(false);
  root.classList.toggle('join-open', open);
  $('[data-join-toggle]').setAttribute('aria-expanded', String(open));
  $('#joinpop').setAttribute('aria-hidden', String(!open));
}
function initMenu() {
  $('.burger').addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  $('[data-join-toggle]').addEventListener('click', () => setJoin(!root.classList.contains('join-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setMenu(false); setJoin(false); } });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu, .burger')) setMenu(false);
    if (!e.target.closest('[data-join-toggle]')) setJoin(false);
  });
  matchMedia('(min-width: 1101px)').addEventListener('change', () => setMenu(false));
}

/* ---------- barra superior, cronómetro y tono ---------- */
function initChrome() {
  const nav = $('.nav'); const hud = $('.hud');
  const time = $('#hud-time'); const bar = $('#hud-bar');
  let last = -1;

  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate(self) {
      const y = self.scroll();
      nav.classList.toggle('is-hidden', self.direction === 1 && y > 400);
      if (self.direction === 1 && Math.abs(self.getVelocity()) > 600) { setMenu(false); setJoin(false); }
      const secs = Math.round(self.progress * 420);
      if (secs !== last) { last = secs; time.textContent = `${pad(Math.floor(secs / 60))}:${pad(secs % 60)}`; }
      bar.style.transform = `scaleX(${self.progress.toFixed(4)})`;
    },
  });

  $$('main [data-tone], footer[data-tone]').forEach((sec) => {
    const tone = sec.dataset.tone;
    ScrollTrigger.create({
      trigger: sec, start: 'top 38px', end: 'bottom 38px',
      onToggle: (self) => { if (self.isActive) nav.dataset.tone = tone; },
    });
    ScrollTrigger.create({
      trigger: sec, start: 'top bottom-=28', end: 'bottom bottom-=28',
      onToggle: (self) => { if (self.isActive) hud.dataset.tone = tone; },
    });
  });

  $$('.nav__links a').forEach((a) => {
    const sec = $(a.getAttribute('href')); if (!sec) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top 50%', end: 'bottom 50%',
      onToggle: (self) => a.classList.toggle('is-active', self.isActive),
    });
  });
}

/* ---------- entradas ligadas al scroll (se rehacen al cambiar de idioma) ---------- */
export function wrapHeroLines() {
  $$('.hero__title .line').forEach((l) => {
    if (!l.querySelector('.line__in')) l.innerHTML = `<span class="line__in">${l.innerHTML}</span>`;
  });
}

/** Deshace los textos troceados ANTES de cambiar el contenido (si no, restauraría el idioma anterior). */
export function killReveals() { revealCtx?.revert(); revealCtx = null; }

export function initReveals() {
  killReveals();
  revealCtx = gsap.context(() => {
    if (reduced) return;

    $$('[data-reveal="lines"]').forEach((el) => {
      if (el.closest('.hero')) return; // el inicio se anima con la intro
      SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'sl',
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 112, duration: 1.15, ease: 'expo.out', stagger: 0.085,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        }),
      });
    });

    $$('[data-reveal="chars"]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines,chars', mask: 'lines', autoSplit: true,
        onSplit: (self) => gsap.from(self.chars, {
          yPercent: 118, rotation: 7, duration: 1.25, ease: 'expo.out', stagger: 0.03,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
      });
      if (!el.closest('.gallery')) {
        gsap.fromTo(el, { xPercent: 7 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 15%', scrub: 0.5 } });
      }
    });

    // redes: cada fila entra desde un lado, ligada al scroll
    $$('.socials li').forEach((li, i) => {
      gsap.fromTo(li, { xPercent: i % 2 ? 14 : -14, autoAlpha: 0 }, {
        xPercent: 0, autoAlpha: 1, ease: 'power2.out',
        scrollTrigger: { trigger: li, start: 'top 98%', end: 'top 68%', scrub: 0.5 },
      });
    });

    $$('[data-reveal="words"]').forEach((el) => {
      SplitText.create(el, {
        type: 'words', autoSplit: true,
        onSplit: (self) => gsap.fromTo(self.words, { opacity: 0.13 }, {
          opacity: 1, ease: 'none', stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 55%', scrub: 0.4 },
        }),
      });
    });

    gsap.set('[data-reveal="up"]', { y: 56, autoAlpha: 0 });
    ScrollTrigger.batch('[data-reveal="up"]', {
      start: 'top 92%', once: true,
      onEnter: (batch) => gsap.to(batch, { y: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out', stagger: 0.09, overwrite: true }),
    });

    $$('.ev').forEach((el, i) => {
      gsap.from(el, { y: 34, autoAlpha: 0, duration: 0.9, ease: 'expo.out', delay: (i % 4) * 0.05, scrollTrigger: { trigger: el, start: 'top 94%', once: true } });
    });

    $$('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count); const o = { v: end === 0 ? 9 : 0 };
      gsap.to(o, {
        v: end, duration: 1.6, ease: 'power3.out',
        onUpdate: () => { el.textContent = Math.round(o.v); },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });

    $$('.kicker').forEach((el) => {
      if (el.closest('.hero')) return;
      gsap.from(el, { autoAlpha: 0, x: -18, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });

    gsap.from('.foot__word span', {
      yPercent: 105, duration: 1.3, ease: 'expo.out', stagger: 0.07,
      scrollTrigger: { trigger: '.foot__word', start: 'top 96%', once: true },
    });
  });
}

/* ---------- efectos que no dependen del texto ---------- */
function initScrub() {
  if (reduced) return;

  // el inicio se aparta mientras sube la primera hoja
  gsap.to('.hero__title', { yPercent: -22, ease: 'none', scrollTrigger: { trigger: '#quienes', start: 'top bottom', end: 'top top', scrub: true } });
  gsap.to('.hero__side, .hero__top', { y: -70, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: '#quienes', start: 'top bottom', end: 'top 45%', scrub: true } });

  // gira solo el anillo con la leyenda; el búho se queda quieto
  $$('[data-spin]').forEach((el) => {
    gsap.to($('.seal__ring', el) || el, { rotation: 300, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
  });

  gsap.to('.join__title', { xPercent: 4, ease: 'none', scrollTrigger: { trigger: '#unete', start: 'top bottom', end: 'bottom top', scrub: true } });
}

/* ---------- galería ---------- */
function initGallery() {
  const track = $('#gallery-track'); const viewport = $('.gallery__viewport');
  const bar = $('#gallery-bar'); const count = $('#gallery-count');
  const total = () => $$('.shot[data-index]', track).length;
  const paint = (p) => {
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
    const n = total();
    count.textContent = `${pad(Math.min(n, Math.round(p * (n - 1)) + 1))} / ${pad(n)}`;
  };

  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    if (reduced) return undefined;
    const dist = () => {
      const padX = parseFloat(getComputedStyle(viewport).paddingLeft) || 0;
      return Math.max(0, track.scrollWidth - viewport.clientWidth + padX * 2);
    };
    const skew = gsap.quickTo(track, 'skewX', { duration: 0.6, ease: 'power3' });
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.gallery', pin: true, start: 'top top', end: () => `+=${dist()}`,
        scrub: 0.7, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (self) => { paint(self.progress); skew(gsap.utils.clamp(-7, 7, self.getVelocity() / -320)); },
        onLeave: () => skew(0), onLeaveBack: () => skew(0),
      },
    });
    return undefined;
  });

  viewport.addEventListener('scroll', () => {
    const max = viewport.scrollWidth - viewport.clientWidth;
    if (max > 0) paint(viewport.scrollLeft / max);
  }, { passive: true });
}

/* ---------- cursor y botones magnéticos ---------- */
function initPointer() {
  if (reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const cursor = $('.cursor'); const label = $('span', cursor);
  const x = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3' });
  const y = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3' });
  window.addEventListener('pointermove', (e) => { x(e.clientX); y(e.clientY); }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest?.('[data-cursor]');
    if (t) label.textContent = t.dataset.cursor;
    cursor.classList.toggle('is-on', Boolean(t));
  });

  document.addEventListener('pointermove', (e) => {
    const b = e.target.closest?.('[data-magnetic]');
    $$('[data-magnetic].is-mag').forEach((el) => {
      if (el !== b) { el.classList.remove('is-mag'); gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' }); }
    });
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.classList.add('is-mag');
    gsap.to(b, { x: (e.clientX - (r.left + r.width / 2)) * 0.22, y: (e.clientY - (r.top + r.height / 2)) * 0.3, duration: 0.5, ease: 'power3.out' });
  }, { passive: true });
}

/* ---------- intro ---------- */
function playIntro(stage) {
  const intro = $('.intro');
  const boot = { v: 0 };
  const startStage = () => gsap.to(boot, { v: 1, duration: 3.2, ease: 'power2.out', onUpdate: () => stage?.setBoot(boot.v) });

  if (reduced) { intro.remove(); stage?.setBoot(1); return; }

  const kicker = SplitText.create('.hero__kicker', { type: 'lines', mask: 'lines' });
  const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
  gsap.set('.hero__title .line__in', { yPercent: 108 });
  gsap.set(kicker.lines, { yPercent: 110 });
  gsap.set(lead.lines, { yPercent: 110 });
  gsap.set('.hero__cta > *, .hero__season, .hero__scroll', { autoAlpha: 0, y: 18 });
  gsap.set('.nav', { yPercent: -120 });
  gsap.set('.hud', { autoAlpha: 0 });

  const count = $('.intro__count'); const c = { v: 0 };
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.intro__seal', { scale: 0.7, autoAlpha: 0, duration: 1.3 })
    .from('.intro__seal .seal__ring', { rotation: -150, duration: 1.7 }, 0)
    .from('.intro__line > *', { autoAlpha: 0, y: 12, stagger: 0.09, duration: 0.8 }, 0.25)
    .from('.intro__line i', { scaleX: 0, duration: 0.9 }, 0.35)
    .to(c, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: () => { count.textContent = pad(Math.round(c.v)); } }, 0)
    .to('.intro__inner', { autoAlpha: 0, y: -30, duration: 0.6, ease: 'power3.in' }, 1.55)
    .to('.intro__count', { autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 1.6)
    .to(intro, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.15, ease: 'expo.inOut' }, 1.85)
    .add(startStage, 2.0)
    .to('.hero__title .line__in', { yPercent: 0, duration: 1.5, stagger: 0.13 }, 2.35)
    .to(kicker.lines, { yPercent: 0, duration: 1.1, stagger: 0.08 }, 2.55)
    .to(lead.lines, { yPercent: 0, duration: 1.1, stagger: 0.06 }, 2.7)
    .to('.hero__cta > *, .hero__season, .hero__scroll', { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 2.95)
    .to('.nav', { yPercent: 0, duration: 1.2, clearProps: 'transform' }, 2.6)
    .to('.hud', { autoAlpha: 1, duration: 1 }, 3.1)
    .add(() => { intro.remove(); kicker.revert(); lead.revert(); }, 4.4);
}

/* ---------- cambio de idioma con telón ---------- */
export function curtainSwap(swap) {
  if (reduced) { swap(); ScrollTrigger.refresh(); return; }
  const el = $('.curtain span');
  gsap.timeline()
    .set(el, { transformOrigin: 'bottom' })
    .to(el, { scaleY: 1, duration: 0.55, ease: 'expo.inOut' })
    .add(() => { swap(); ScrollTrigger.refresh(); })
    .set(el, { transformOrigin: 'top' })
    .to(el, { scaleY: 0, duration: 0.7, ease: 'expo.inOut' }, '+=0.08');
}

export const refresh = () => ScrollTrigger.refresh();
export const debug = { gsap, ScrollTrigger };

export async function initMotion(stage) {
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]); } catch { /* seguimos */ }

  // cada bloque por separado: si uno falla, el resto (y sobre todo la intro) sigue adelante
  const safe = (fn, ...args) => { try { fn(...args); } catch (err) { console.error(`[adupa] ${fn.name}`, err); } };
  [initScroll, initAnchors, initMenu, wrapHeroLines, initChrome, initScrub, initGallery, initReveals, initPointer].forEach((fn) => safe(fn));
  try { playIntro(stage); } catch (err) {
    console.error('[adupa] intro', err);
    $('.intro')?.remove(); stage?.setBoot(1);
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
}
