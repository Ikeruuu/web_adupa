/* Textos fijos de la interfaz en español e inglés.
   En el HTML: data-i18n="clave" (contenido) · data-i18n-attr="atributo:clave". */

export const dict = {
  es: {
    'meta.title': 'ADUPA — Asociación de Debate Universitario del Principado de Asturias',
    'meta.desc': 'ADUPA es la asociación de debate universitario de Asturias. Talleres, entrenamientos y torneos para aprender a argumentar, escuchar y hablar en público.',

    'intro.line': 'Tiene la palabra',

    'nav.about': 'Quiénes somos',
    'nav.calendar': 'Calendario',
    'nav.gallery': 'Galería',
    'nav.posts': 'Publicaciones',
    'nav.docs': 'Documentos',
    'nav.collab': 'Colaboradores',
    'nav.join': 'Únete',
    'nav.menu': 'Menú',
    'nav.close': 'Cerrar',
    'nav.lang': 'Cambiar idioma',

    'hud.label': 'Turno',

    'hero.kicker': 'Asociación de Debate Universitario<br>del Principado de Asturias',
    'hero.title': '<span class="line">Pedimos</span><span class="line"><em>la palabra.</em></span>',
    'hero.lead': 'En ADUPA entrenamos lo que no viene en ningún temario: pensar rápido, hablar claro y escuchar a quien opina justo lo contrario.',
    'hero.cta1': 'Únete al grupo',
    'hero.cta2': 'Ver calendario',
    'hero.season': 'Curso 2026 — 27',
    'hero.scroll': 'Desliza',
    'hero.tag': 'Tiene la palabra',

    'about.kicker': 'Quiénes somos',
    'about.statement': 'Somos estudiantes de toda Asturias que nos juntamos cada semana para <em>discutir en serio</em>: con una moción, un cronómetro y alguien enfrente que piensa lo contrario.',
    'about.aside': 'ADUPA —Asociación de Debate Universitario del Principado de Asturias— nace para que cualquier estudiante, de cualquier grado, tenga un sitio donde aprender a debatir y desde el que representar a Asturias en los torneos universitarios.',
    'about.p1.t': 'Formación',
    'about.p1.d': 'Talleres de argumentación, refutación y oratoria. Empiezas de cero y acabas hablando delante de una sala sin que te tiemble el folio.',
    'about.p2.t': 'Competición',
    'about.p2.d': 'Formamos equipos para ligas y torneos universitarios, en formato académico y en British Parliamentary.',
    'about.p3.t': 'Comunidad',
    'about.p3.d': 'Debates abiertos, encuentros con otras asociaciones y una sobremesa que casi siempre se alarga más que el debate.',
    'about.facts': 'Un debate BP, en cuatro cifras',
    'about.f1': 'minutos por discurso',
    'about.f2': 'equipos en cada sala',
    'about.f3': 'minutos para preparar la moción',
    'about.f4': 'experiencia previa necesaria',

    'act1.kicker': 'A favor / En contra',
    'act1.title': 'Dos posturas, <em>una moción.</em>',
    'act1.text': 'A veces te tocará defender justo lo que no piensas. Ahí es donde se aprende.',
    'act2.kicker': 'El cronómetro',
    'act2.title': 'Siete <em>minutos.</em>',
    'act2.text': 'Un discurso, un reloj y la sala entera escuchando. El primer minuto y el último están protegidos: nadie puede interrumpirte.',
    'act3.kicker': 'La sala',
    'act3.title': 'Y una sala que <em>escucha.</em>',
    'act3.text': 'Jueces que te explican por qué ganaste o perdiste, rivales que te hacen mejor y gente que te espera a la salida.',
    'act.for': 'A favor',
    'act.against': 'En contra',

    'cal.kicker': 'Calendario',
    'cal.title': 'Lo que <em>viene.</em>',
    'cal.sub': 'Entrenamientos, talleres, torneos y asambleas. Todo abierto a quien quiera pasarse.',
    'cal.all': 'Todo',
    'cal.empty': 'Nada programado este mes. Todavía.',
    'cal.next': 'Próxima',
    'cal.add': 'Añadir a mi calendario',
    'cal.prev': 'Mes anterior',
    'cal.fwd': 'Mes siguiente',
    'cal.sample': 'Agenda de ejemplo: las fechas definitivas se anunciarán pronto.',

    'gal.kicker': 'Galería',
    'gal.title': 'Pruebas <em>gráficas.</em>',
    'gal.sub': 'Torneos, entrenamientos y alguna foto que quizá no debería estar aquí.',
    'gal.pending': 'Foto pendiente',
    'gal.drag': 'Sigue bajando',
    'gal.open': 'Ampliar',
    'gal.end.t': 'Y las que <em>faltan.</em>',
    'gal.end.d': 'Esta pared se llena después de cada torneo.',

    'posts.kicker': 'Publicaciones',
    'posts.title': 'Fuera de <em>la sala.</em>',
    'posts.sub': 'Lo último que hemos contado en redes.',
    'posts.view': 'Ver publicación',
    'posts.follow': 'Síguenos',

    'join.kicker': 'Únete',
    'join.title': 'Tu <em>turno.</em>',
    'join.text': 'El atril está libre. Entra al grupo de WhatsApp para enterarte de cada sesión, o rellena el formulario y te escribimos nosotros.',
    'join.wa': 'Entrar al grupo de WhatsApp',
    'join.form': 'Rellenar el formulario',
    'join.note': 'Sin experiencia previa. Ven a probar una sesión.',
    'join.tag': 'Atril libre',

    'docs.kicker': 'Documentos',
    'docs.title': 'Las reglas <em>del juego.</em>',
    'docs.sub': 'Transparencia por defecto: aquí están los estatutos y el reglamento de la asociación.',
    'docs.view': 'Ver',
    'docs.download': 'Descargar',
    'docs.stamp': 'Vigente',
    'docs.close': 'Cerrar documento',

    'collab.kicker': 'Colaboradores',
    'collab.title': 'Nos <em>respaldan.</em>',
    'collab.sub': 'Entidades y empresas que hacen posible que haya debate universitario en Asturias.',
    'collab.slot': 'Logo pendiente',
    'collab.cta.t': '¿Tu entidad quiere apoyar el debate universitario?',
    'collab.cta.d': 'Buscamos espacios, formación y apoyo para viajar a torneos. Hablamos.',
    'collab.cta.b': 'Escríbenos',

    'partners.label': 'Instituciones y redes',

    'foot.tag': 'Asociación de Debate Universitario<br>del Principado de Asturias',
    'foot.nav': 'Navegar',
    'foot.social': 'Redes',
    'foot.contact': 'Contacto',
    'foot.legal': 'Aviso legal',
    'foot.privacy': 'Privacidad',
    'foot.top': 'Volver arriba',
    'foot.made': 'Hecho en Asturias',
  },

  en: {
    'meta.title': 'ADUPA — University Debating Association of the Principality of Asturias',
    'meta.desc': 'ADUPA is the university debating association of Asturias, Spain. Workshops, training sessions and tournaments to learn how to argue, listen and speak in public.',

    'intro.line': 'You have the floor',

    'nav.about': 'About',
    'nav.calendar': 'Calendar',
    'nav.gallery': 'Gallery',
    'nav.posts': 'Posts',
    'nav.docs': 'Documents',
    'nav.collab': 'Supporters',
    'nav.join': 'Join',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'nav.lang': 'Change language',

    'hud.label': 'Speech',

    'hero.kicker': 'University Debating Association<br>of the Principality of Asturias',
    'hero.title': '<span class="line">We take</span><span class="line"><em>the floor.</em></span>',
    'hero.lead': 'At ADUPA we train what no syllabus covers: thinking fast, speaking clearly and listening to whoever thinks the exact opposite.',
    'hero.cta1': 'Join the group',
    'hero.cta2': 'See the calendar',
    'hero.season': '2026 — 27 season',
    'hero.scroll': 'Scroll',
    'hero.tag': 'Has the floor',

    'about.kicker': 'About us',
    'about.statement': 'We are students from all over Asturias who meet every week to <em>argue properly</em>: with a motion, a stopwatch and someone across the room who thinks otherwise.',
    'about.aside': 'ADUPA — the University Debating Association of the Principality of Asturias — exists so that any student, from any degree, has a place to learn to debate and to represent Asturias at university tournaments.',
    'about.p1.t': 'Training',
    'about.p1.d': 'Workshops on argumentation, rebuttal and public speaking. You start from scratch and end up addressing a room without your notes shaking.',
    'about.p2.t': 'Competition',
    'about.p2.d': 'We put together teams for university leagues and tournaments, in both Spanish academic format and British Parliamentary.',
    'about.p3.t': 'Community',
    'about.p3.d': 'Open debates, meet-ups with other societies and after-debate drinks that nearly always outlast the debate.',
    'about.facts': 'A BP debate, in four numbers',
    'about.f1': 'minutes per speech',
    'about.f2': 'teams in every room',
    'about.f3': 'minutes to prepare the motion',
    'about.f4': 'previous experience required',

    'act1.kicker': 'For / Against',
    'act1.title': 'Two sides, <em>one motion.</em>',
    'act1.text': 'Sometimes you will have to defend exactly what you don’t believe. That is where you learn.',
    'act2.kicker': 'The stopwatch',
    'act2.title': 'Seven <em>minutes.</em>',
    'act2.text': 'One speech, one clock and the whole room listening. The first and last minutes are protected: nobody may interrupt you.',
    'act3.kicker': 'The room',
    'act3.title': 'And a room that <em>listens.</em>',
    'act3.text': 'Judges who explain why you won or lost, opponents who make you better and people waiting for you at the door.',
    'act.for': 'For',
    'act.against': 'Against',

    'cal.kicker': 'Calendar',
    'cal.title': 'What’s <em>next.</em>',
    'cal.sub': 'Training sessions, workshops, tournaments and assemblies. All open to anyone who wants to drop by.',
    'cal.all': 'All',
    'cal.empty': 'Nothing scheduled this month. Yet.',
    'cal.next': 'Up next',
    'cal.add': 'Add to my calendar',
    'cal.prev': 'Previous month',
    'cal.fwd': 'Next month',
    'cal.sample': 'Sample schedule: final dates will be announced soon.',

    'gal.kicker': 'Gallery',
    'gal.title': 'Exhibit <em>A.</em>',
    'gal.sub': 'Tournaments, training sessions and the odd photo that probably shouldn’t be here.',
    'gal.pending': 'Photo pending',
    'gal.drag': 'Keep scrolling',
    'gal.open': 'Enlarge',
    'gal.end.t': 'And those <em>to come.</em>',
    'gal.end.d': 'This wall fills up after every tournament.',

    'posts.kicker': 'Posts',
    'posts.title': 'Outside <em>the room.</em>',
    'posts.sub': 'The latest from our social channels.',
    'posts.view': 'View post',
    'posts.follow': 'Follow us',

    'join.kicker': 'Join',
    'join.title': 'Your <em>turn.</em>',
    'join.text': 'The lectern is free. Join the WhatsApp group to hear about every session, or fill in the form and we will write to you.',
    'join.wa': 'Join the WhatsApp group',
    'join.form': 'Fill in the form',
    'join.note': 'No experience needed. Come and try a session.',
    'join.tag': 'Lectern free',

    'docs.kicker': 'Documents',
    'docs.title': 'The rules <em>of the game.</em>',
    'docs.sub': 'Transparent by default: here are the association’s statutes and internal regulations.',
    'docs.view': 'View',
    'docs.download': 'Download',
    'docs.stamp': 'In force',
    'docs.close': 'Close document',

    'collab.kicker': 'Supporters',
    'collab.title': 'Backed <em>by.</em>',
    'collab.sub': 'The organisations and companies that make university debating in Asturias possible.',
    'collab.slot': 'Logo pending',
    'collab.cta.t': 'Would your organisation like to support university debating?',
    'collab.cta.d': 'We are looking for venues, training and help travelling to tournaments. Let’s talk.',
    'collab.cta.b': 'Write to us',

    'partners.label': 'Institutions & networks',

    'foot.tag': 'University Debating Association<br>of the Principality of Asturias',
    'foot.nav': 'Navigate',
    'foot.social': 'Social',
    'foot.contact': 'Contact',
    'foot.legal': 'Legal notice',
    'foot.privacy': 'Privacy',
    'foot.top': 'Back to top',
    'foot.made': 'Made in Asturias',
  },
};

const KEY = 'adupa-lang';
let current = 'es';
const listeners = new Set();

export function detectLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'es' || q === 'en') return q;
  try {
    const s = localStorage.getItem(KEY);
    if (s === 'es' || s === 'en') return s;
  } catch { /* almacenamiento bloqueado */ }
  return (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
}

export const lang = () => current;
export const t = (key) => dict[current][key] ?? dict.es[key] ?? key;
export const pick = (obj) => (obj && typeof obj === 'object' ? obj[current] ?? obj.es ?? '' : obj ?? '');
export const onLang = (fn) => listeners.add(fn);

export function applyLang(next, { silent = false } = {}) {
  current = next === 'en' ? 'en' : 'es';
  try { localStorage.setItem(KEY, current); } catch { /* sin persistencia */ }
  const root = document.documentElement;
  root.lang = current;
  document.title = t('meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.desc'));

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':');
      if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
    });
  });
  document.querySelectorAll('[data-lang-opt]').forEach((el) => {
    el.classList.toggle('is-on', el.dataset.langOpt === current);
  });
  if (!silent) listeners.forEach((fn) => fn(current));
}
