/* Pinta las secciones que salen de src/content.js */
import {
  links, socials, events, eventTypes, gallery, posts, documents, collaborators, partners,
} from './content.js';
import { lang, t, pick } from './i18n.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
const locale = () => (lang() === 'en' ? 'en-GB' : 'es-ES');
const parseDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const pad = (n) => String(n).padStart(2, '0');

/* ---------------- Enlaces globales ---------------- */
export function renderLinks() {
  document.querySelectorAll('[data-link]').forEach((a) => {
    const k = a.dataset.link;
    a.href = k === 'mailto' ? `mailto:${links.email}` : links[k] || '#';
  });
  document.querySelectorAll('[data-mail]').forEach((el) => { el.textContent = links.email; });
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
}

/* ---------------- Calendario ---------------- */
const cal = { view: null, filter: 'all', next: null };

function initCalState() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  cal.next = sorted.find((e) => parseDate(e.dateEnd || e.date) >= today) || null;
  const ref = cal.next ? parseDate(cal.next.date) : sorted.length ? parseDate(sorted[sorted.length - 1].date) : today;
  cal.view = new Date(ref.getFullYear(), ref.getMonth(), 1);
}

function icsHref(ev) {
  const stamp = (iso, time) => `${iso.replaceAll('-', '')}T${(time || '00:00').replace(':', '')}00`;
  const body = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ADUPA//adupa.es//ES', 'BEGIN:VEVENT',
    `UID:${ev.date}-${ev.time}@adupa.es`,
    `DTSTART;TZID=Europe/Madrid:${stamp(ev.date, ev.time)}`,
    `DTEND;TZID=Europe/Madrid:${stamp(ev.dateEnd || ev.date, ev.end || ev.time)}`,
    `SUMMARY:ADUPA · ${pick(ev.title)}`,
    `LOCATION:${pick(ev.place)}`,
    `DESCRIPTION:${pick(ev.note)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
}

export function renderCalendar() {
  if (!cal.view) initCalState();
  const loc = locale();
  const y = cal.view.getFullYear();
  const m = cal.view.getMonth();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const label = new Intl.DateTimeFormat(loc, { month: 'long' }).format(cal.view);
  $('#cal-label').innerHTML = `<em>${esc(label)}</em> <span>${y}</span>`;

  // filtros
  const filters = [['all', t('cal.all')], ...Object.entries(eventTypes).map(([k, v]) => [k, pick(v)])];
  $('#cal-filters').innerHTML = filters.map(([k, name]) =>
    `<button type="button" class="chip${cal.filter === k ? ' is-on' : ''}" data-filter="${k}"><i class="dot dot--${k}"></i>${esc(name)}</button>`).join('');

  const inMonth = events
    .filter((e) => { const d = parseDate(e.date); return d.getFullYear() === y && d.getMonth() === m; })
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const shown = inMonth.filter((e) => cal.filter === 'all' || e.type === cal.filter);

  // rejilla del mes (lunes primero)
  const wd = new Intl.DateTimeFormat(loc, { weekday: 'narrow' });
  const heads = Array.from({ length: 7 }, (_, i) => `<span class="cal__wd">${wd.format(new Date(2024, 0, 1 + i))}</span>`).join('');
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  let cells = '<span class="cal__day is-void"></span>'.repeat(offset);
  for (let d = 1; d <= days; d++) {
    const iso = `${y}-${pad(m + 1)}-${pad(d)}`;
    const evs = shown.filter((e) => iso >= e.date && iso <= (e.dateEnd || e.date));
    const isToday = new Date(y, m, d).getTime() === today.getTime();
    cells += evs.length
      ? `<button type="button" class="cal__day has-ev${isToday ? ' is-today' : ''}" data-day="${evs[0].date}"><b>${d}</b><i class="dot dot--${evs[0].type}"></i></button>`
      : `<span class="cal__day${isToday ? ' is-today' : ''}"><b>${d}</b></span>`;
  }
  $('#cal-grid').innerHTML = heads + cells;

  // lista
  const fmtWd = new Intl.DateTimeFormat(loc, { weekday: 'short' });
  const fmtMo = new Intl.DateTimeFormat(loc, { month: 'short' });
  $('#cal-list').innerHTML = shown.length
    ? shown.map((e) => {
      const d = parseDate(e.date);
      const past = parseDate(e.dateEnd || e.date) < today;
      const isNext = cal.next === e;
      const dayNum = e.dateEnd ? `${d.getDate()}–${parseDate(e.dateEnd).getDate()}` : pad(d.getDate());
      const note = pick(e.note);
      return `<li class="ev${past ? ' is-past' : ''}${isNext ? ' is-next' : ''}" data-date="${e.date}">
        <div class="ev__date"><b>${dayNum}</b><span>${esc(fmtWd.format(d).replace('.', ''))} · ${esc(fmtMo.format(d).replace('.', ''))}</span></div>
        <div class="ev__main">
          <p class="ev__meta mono"><i class="dot dot--${e.type}"></i>${esc(pick(eventTypes[e.type]))}<span>${e.time}${e.end ? '–' + e.end : ''}</span>${isNext ? `<em>${esc(t('cal.next'))}</em>` : ''}</p>
          <h3>${esc(pick(e.title))}</h3>
          <p class="ev__place">${esc(pick(e.place))}${note ? ` <span>— ${esc(note)}</span>` : ''}</p>
        </div>
        <a class="ev__add" href="${icsHref(e)}" download="adupa-${e.date}.ics" aria-label="${esc(t('cal.add'))}" title="${esc(t('cal.add'))}">${icon('cal')}</a>
      </li>`;
    }).join('')
    : `<li class="ev ev--empty"><p>${esc(t('cal.empty'))}</p></li>`;
}

export function bindCalendar(onChange) {
  const shift = (n) => { cal.view = new Date(cal.view.getFullYear(), cal.view.getMonth() + n, 1); renderCalendar(); onChange?.(); };
  $('#cal-prev').addEventListener('click', () => shift(-1));
  $('#cal-next').addEventListener('click', () => shift(1));
  $('#cal-filters').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]'); if (!b) return;
    cal.filter = b.dataset.filter; renderCalendar(); onChange?.();
  });
  $('#cal-grid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-day]'); if (!b) return;
    const li = $(`#cal-list [data-date="${b.dataset.day}"]`); if (!li) return;
    li.classList.remove('is-flash'); void li.offsetWidth; li.classList.add('is-flash');
    li.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
}

/* ---------------- Galería ---------------- */
function placeholderArt(i) {
  // Marco provisional: retícula de visor de cámara, distinta en cada hueco.
  const seed = (i + 1) * 37;
  const cx = 30 + (seed % 40); const cy = 35 + ((seed * 3) % 30);
  const r = 16 + (seed % 14);
  const lines = Array.from({ length: 9 }, (_, k) => {
    const yy = 8 + k * 11 + ((seed + k * 5) % 5);
    return `<path d="M-5 ${yy} Q ${cx} ${yy + ((k % 2) ? 9 : -9)} 105 ${yy + ((seed + k) % 7) - 3}" />`;
  }).join('');
  return `<svg class="ph" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width=".35" opacity=".5">${lines}</g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width=".5"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.42}" fill="currentColor" opacity=".16"/>
    <path d="M${cx - r - 6} ${cy}h${2 * r + 12}M${cx} ${cy - r - 6}v${2 * r + 12}" stroke="currentColor" stroke-width=".3" opacity=".7"/>
  </svg>`;
}

export function renderGallery() {
  const total = gallery.length;
  const items = gallery.map((g, i) => {
    const media = g.src
      ? `<img src="${esc(g.src)}" alt="${esc(pick(g.caption))}" loading="lazy" decoding="async">`
      : `${placeholderArt(i)}<span class="shot__pending mono">${esc(t('gal.pending'))}</span>`;
    return `<figure class="shot shot--${g.ratio}" data-index="${i}">
      <button type="button" class="shot__frame" data-cursor="${esc(t('gal.open'))}" aria-label="${esc(t('gal.open'))}: ${esc(pick(g.caption))}">
        <span class="shot__media">${media}</span>
        <i class="shot__corner"></i><i class="shot__corner"></i><i class="shot__corner"></i><i class="shot__corner"></i>
      </button>
      <figcaption><b class="mono">${pad(i + 1)}</b><span>${esc(pick(g.caption))}</span><em class="mono">${esc(pick(g.meta))}</em></figcaption>
    </figure>`;
  }).join('');
  const end = `<div class="shot shot--end"><h3>${t('gal.end.t')}</h3><p>${esc(t('gal.end.d'))}</p></div>`;
  $('#gallery-track').innerHTML = items + end;
  $('#gallery-count').textContent = `01 / ${pad(total)}`;
}

export function bindGallery() {
  const box = $('#lightbox');
  const open = (i) => {
    const g = gallery[i]; if (!g) return;
    $('#lightbox-media').innerHTML = g.src
      ? `<img src="${esc(g.src)}" alt="${esc(pick(g.caption))}">`
      : `<div class="lightbox__ph">${placeholderArt(i)}<span class="mono">${esc(t('gal.pending'))}</span></div>`;
    $('#lightbox-cap').innerHTML = `<b class="mono">${pad(i + 1)} / ${pad(gallery.length)}</b><span>${esc(pick(g.caption))}</span><em class="mono">${esc(pick(g.meta))}</em>`;
    openDialog(box);
  };
  $('#gallery-track').addEventListener('click', (e) => {
    const f = e.target.closest('.shot[data-index]'); if (f) open(Number(f.dataset.index));
  });
}

/* ---------------- Publicaciones y redes ---------------- */
export function renderPosts() {
  const fmt = new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short', year: 'numeric' });
  $('#posts-board').innerHTML = posts.map((p, i) => {
    const s = socials.find((x) => x.id === p.network);
    return `<a class="post post--${i % 4}" href="${esc(p.url || '#')}" target="_blank" rel="noopener" data-reveal="up">
      <span class="post__pin"></span>
      <header class="mono">${icon(p.network)}<span>${esc(s?.label || p.network)}</span><time datetime="${p.date}">${esc(fmt.format(parseDate(p.date)))}</time></header>
      <p>${esc(pick(p.text))}</p>
      <footer class="mono"><span>${esc(t('posts.view'))}</span>${icon('arrow')}</footer>
    </a>`;
  }).join('');

  const li = (s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${icon(s.id)}<span>${esc(s.label)}</span><em class="mono">${esc(s.handle)}</em></a></li>`;
  $('#socials-list').innerHTML = socials.map(li).join('');
  $('#foot-socials').innerHTML = socials.slice(0, 4).map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('');
}

/* ---------------- Documentos ---------------- */
export function renderDocs() {
  $('#docs-grid').innerHTML = documents.map((d, i) => `
    <article class="doc" data-reveal="up" data-tilt>
      <div class="doc__paper" aria-hidden="true">
        <span class="seal doc__seal" aria-hidden="true"><i class="seal__ring"></i><i class="seal__owl"></i></span>
        <span class="doc__lines"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
        <span class="doc__stamp mono">${esc(t('docs.stamp'))}</span>
      </div>
      <div class="doc__body">
        <p class="mono doc__n">${pad(i + 1)} — ${esc(pick(d.meta))}</p>
        <h3>${esc(pick(d.title))}</h3>
        <p>${esc(pick(d.desc))}</p>
        <div class="doc__actions">
          <a class="btn btn--dark" href="${esc(d.file)}" target="_blank" rel="noopener" data-pdf="${esc(d.file)}" data-title="${esc(pick(d.title))}">${icon('eye')}<span>${esc(t('docs.view'))}</span></a>
          <a class="btn btn--line" href="${esc(d.file)}" download>${icon('down')}<span>${esc(t('docs.download'))}</span></a>
        </div>
      </div>
    </article>`).join('');
}

export function bindDocs() {
  const view = $('#pdfview');
  $('#docs-grid').addEventListener('click', (e) => {
    const a = e.target.closest('[data-pdf]'); if (!a) return;
    // En pantallas pequeñas el PDF se abre en una pestaña: los visores embebidos fallan en móvil.
    if (!matchMedia('(min-width: 900px) and (pointer: fine)').matches) return;
    e.preventDefault();
    $('#pdfview-title').textContent = a.dataset.title;
    $('#pdfview-frame').src = a.dataset.pdf;
    $('#pdfview-dl').href = a.dataset.pdf;
    openDialog(view, () => { $('#pdfview-frame').src = 'about:blank'; });
  });
}

/* ---------------- Colaboradores y logos ---------------- */
export function renderCollab() {
  $('#collab-grid').innerHTML = collaborators.map((c, i) => {
    const inner = c.logo
      ? `<img src="${esc(c.logo)}" alt="${esc(c.name)}" loading="lazy">`
      : `<span class="slot__name">${esc(c.name)}</span><span class="slot__hint mono">${esc(t('collab.slot'))}</span>`;
    const tag = c.url ? 'a' : 'div';
    const attrs = c.url ? ` href="${esc(c.url)}" target="_blank" rel="noopener"` : '';
    return `<li data-reveal="up"><${tag} class="slot${c.logo ? ' has-logo' : ''}"${attrs}>
      <span class="slot__n mono">${pad(i + 1)}</span>${inner}<span class="slot__kind mono">${esc(pick(c.kind))}</span>
    </${tag}></li>`;
  }).join('');
}

export function renderPartners() {
  const item = (p) => {
    const inner = p.logo ? `<img src="${esc(p.logo)}" alt="${esc(p.name)}" loading="lazy">` : `<span>${esc(p.name)}</span>`;
    return p.url
      ? `<a class="partner" href="${esc(p.url)}" target="_blank" rel="noopener">${inner}</a>`
      : `<span class="partner">${inner}</span>`;
  };
  const row = partners.map((p) => `${item(p)}<span class="seal partner__sep" aria-hidden="true"><i class="seal__ring"></i><i class="seal__owl"></i></span>`).join('');
  $('#partners-marquee').innerHTML = `<div class="marquee__row">${row}</div><div class="marquee__row" aria-hidden="true">${row}</div>`;
}

/* ---------------- Diálogos ---------------- */
let closeCurrent = null;
function openDialog(el, onClose) {
  closeCurrent?.();
  const prev = document.activeElement;
  el.setAttribute('aria-hidden', 'false');
  el.classList.add('is-open');
  document.documentElement.classList.add('is-locked');
  window.__lenis?.stop();
  el.querySelector('[data-close]')?.focus({ preventScroll: true });
  closeCurrent = () => {
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('is-locked');
    window.__lenis?.start();
    onClose?.();
    prev?.focus?.({ preventScroll: true });
    closeCurrent = null;
  };
}

export function bindDialogs() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) { closeCurrent?.(); return; }
    if (e.target.classList?.contains('lightbox') || e.target.classList?.contains('lightbox__fig')) closeCurrent?.();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCurrent?.(); });
}

export function renderAll() {
  renderLinks(); renderCalendar(); renderGallery(); renderPosts(); renderDocs(); renderCollab(); renderPartners();
}
