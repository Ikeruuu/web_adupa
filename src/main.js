import '@fontsource-variable/bodoni-moda/opsz.css';
import '@fontsource-variable/bodoni-moda/opsz-italic.css';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
import './styles.css';

import { applyLang, detectLang, lang } from './i18n.js';
import { renderAll, bindCalendar, bindGallery, bindDocs, bindDialogs } from './render.js';
import { createScene } from './scene.js';
import { initMotion, initReveals, killReveals, wrapHeroLines, curtainSwap, refresh, debug } from './motion.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1 · idioma y contenido
applyLang(detectLang(), { silent: true });
renderAll();
bindCalendar(() => { initReveals(); refresh(); });
bindGallery();
bindDocs();
bindDialogs();

// 2 · escenario 3D
const stage = createScene(document.querySelector('#stage'), { reduced });

// 3 · movimiento
initMotion(stage);

// 4 · botón ES / EN
document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const next = lang() === 'es' ? 'en' : 'es';
    curtainSwap(() => {
      killReveals();
      applyLang(next);
      renderAll();
      wrapHeroLines();
      initReveals();
    });
  });
});

// 5 · fin de carga (reactiva las transiciones CSS) y gancho de depuración
window.addEventListener('load', () => setTimeout(() => document.documentElement.classList.remove('is-loading'), 80));
window.__adupa = { stage, ...debug };
