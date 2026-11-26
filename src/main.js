import '@fontsource-variable/bodoni-moda/opsz.css';
import '@fontsource-variable/bodoni-moda/opsz-italic.css';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
import './styles.css';

import { applyLang, detectLang, lang } from './i18n.js';
import { renderAll, bindCalendar, bindGallery, bindDocs, bindDialogs } from './render.js';
import { initMotion, initReveals, killReveals, wrapHeroLines, curtainSwap, refresh, debug } from './motion.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// al recargar se empieza arriba, donde está la intro (salvo que se entre con un ancla)
if (!location.hash) { history.scrollRestoration = 'manual'; window.scrollTo(0, 0); }

// 1 · idioma y contenido
applyLang(detectLang(), { silent: true });
renderAll();
bindCalendar(() => { initReveals(); refresh(); });
bindGallery();
bindDocs();
bindDialogs();

// 2 · escenario 3D (se carga aparte para no frenar el primer pintado) y 3 · movimiento
(async () => {
  let stage = null;
  try {
    const { createScene } = await import('./scene.js');
    stage = createScene(document.querySelector('#stage'), { reduced });
  } catch (err) {
    console.warn('Escena 3D no disponible:', err);
    document.querySelector('#stage').style.display = 'none';
  }
  window.__adupa = { stage, ...debug }; // gancho de depuración
  initMotion(stage);
})();

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

// 5 · fin de carga: reactiva las transiciones CSS
window.addEventListener('load', () => setTimeout(() => document.documentElement.classList.remove('is-loading'), 80));
