/* ------------------------------------------------------------------
   CONTENIDO EDITABLE DE LA WEB
   ------------------------------------------------------------------
   Todo lo que cambia con frecuencia vive aquí: enlaces, actividades,
   fotos, publicaciones, documentos, colaboradores y logos.
   Cada texto tiene versión { es, en }.

   ⚠ Los datos marcados como EJEMPLO son de relleno: sustitúyelos
   por los reales antes de publicar.
------------------------------------------------------------------- */

export const links = {
  // EJEMPLO — pega aquí los enlaces reales
  whatsapp: 'https://chat.whatsapp.com/XXXXXXXXXXXXXXX',
  form: 'https://forms.gle/XXXXXXXXXXXX',
  email: 'hola@adupa.es',
  instagram: 'https://www.instagram.com/',
  linkedin: 'https://www.linkedin.com/',
  tiktok: 'https://www.tiktok.com/',
  x: 'https://x.com/',
  youtube: 'https://www.youtube.com/',
};

export const socials = [
  { id: 'instagram', label: 'Instagram', handle: '@adupa', url: links.instagram },
  { id: 'linkedin', label: 'LinkedIn', handle: 'ADUPA', url: links.linkedin },
  { id: 'tiktok', label: 'TikTok', handle: '@adupa', url: links.tiktok },
  { id: 'x', label: 'X', handle: '@adupa', url: links.x },
  { id: 'youtube', label: 'YouTube', handle: 'ADUPA', url: links.youtube },
];

/* ---------- Calendario (EJEMPLO) ----------
   type: 'formacion' | 'competicion' | 'social' | 'institucional'
   date: 'AAAA-MM-DD' · time: 'HH:MM' · end (opcional): 'HH:MM'
   dateEnd (opcional) para actividades de varios días               */
export const eventTypes = {
  formacion: { es: 'Formación', en: 'Training' },
  competicion: { es: 'Competición', en: 'Competition' },
  social: { es: 'Abierto', en: 'Open' },
  institucional: { es: 'Institucional', en: 'Institutional' },
};

export const events = [
  {
    date: '2026-12-01', time: '18:30', end: '20:00', type: 'formacion',
    title: { es: 'Taller de iniciación al debate', en: 'Intro to debating workshop' },
    place: { es: 'Aula por confirmar · Campus de El Cristo', en: 'Room TBC · El Cristo Campus' },
    note: { es: 'Sin experiencia previa. Trae solo ganas de discutir.', en: 'No experience needed. Just bring an opinion.' },
  },
  {
    date: '2026-12-03', time: '18:30', end: '20:30', type: 'formacion',
    title: { es: 'Entrenamiento semanal · formato BP', en: 'Weekly training · BP format' },
    place: { es: 'Aula por confirmar', en: 'Room TBC' },
    note: { es: 'Moción sorpresa, 15 minutos de preparación.', en: 'Surprise motion, 15 minutes of prep.' },
  },
  {
    date: '2026-12-10', time: '19:00', end: '21:00', type: 'social',
    title: { es: 'Debate abierto: el público decide', en: 'Open debate: the audience decides' },
    place: { es: 'Lugar por confirmar · Oviedo', en: 'Venue TBC · Oviedo' },
    note: { es: 'Abierto a toda la comunidad universitaria.', en: 'Open to the whole university community.' },
  },
  {
    date: '2026-12-17', time: '18:00', end: '19:30', type: 'institucional',
    title: { es: 'Asamblea general ordinaria', en: 'Annual general assembly' },
    place: { es: 'Aula por confirmar', en: 'Room TBC' },
    note: { es: 'Después, cena de Navidad de la asociación.', en: 'Followed by the association’s Christmas dinner.' },
  },
  {
    date: '2027-01-14', time: '18:30', end: '20:00', type: 'formacion',
    title: { es: 'Taller de refutación', en: 'Rebuttal workshop' },
    place: { es: 'Aula por confirmar', en: 'Room TBC' },
    note: { es: 'Cómo desmontar un argumento sin perder las formas.', en: 'How to take an argument apart — politely.' },
  },
  {
    date: '2027-01-21', time: '18:30', end: '20:30', type: 'formacion',
    title: { es: 'Entrenamiento semanal · formato académico', en: 'Weekly training · academic format' },
    place: { es: 'Aula por confirmar', en: 'Room TBC' },
    note: { es: '', en: '' },
  },
  {
    date: '2027-01-30', time: '10:00', end: '19:00', type: 'competicion',
    title: { es: 'Torneo interno de invierno', en: 'Winter internal tournament' },
    place: { es: 'Sede por confirmar', en: 'Venue TBC' },
    note: { es: 'Cuatro rondas y final. Inscripción por equipos.', en: 'Four rounds and a final. Team registration.' },
  },
  {
    date: '2027-02-11', time: '18:30', end: '20:00', type: 'formacion',
    title: { es: 'Oratoria: voz, pausa y cuerpo', en: 'Public speaking: voice, pause and body' },
    place: { es: 'Aula por confirmar', en: 'Room TBC' },
    note: { es: '', en: '' },
  },
  {
    date: '2027-02-20', dateEnd: '2027-02-21', time: '09:30', end: '20:00', type: 'competicion',
    title: { es: 'Open de Asturias (ejemplo)', en: 'Asturias Open (sample)' },
    place: { es: 'Sede por confirmar · Oviedo', en: 'Venue TBC · Oviedo' },
    note: { es: 'Equipos de toda España. Se buscan jueces y voluntarios.', en: 'Teams from all over Spain. Judges and volunteers wanted.' },
  },
];

/* ---------- Galería ----------
   Añade las fotos en /public/galeria y pon su ruta en `src`
   (p. ej. 'galeria/torneo-01.jpg'). Sin `src` se pinta un marco provisional.
   ratio: 'v' vertical 3:4 · 'h' horizontal 4:3 · 'q' cuadrada           */
export const gallery = [
  { src: '', ratio: 'v', caption: { es: 'Ronda final', en: 'Final round' }, meta: { es: 'Torneo interno', en: 'Internal tournament' } },
  { src: '', ratio: 'h', caption: { es: 'Preparando la moción', en: 'Prepping the motion' }, meta: { es: 'Entrenamiento', en: 'Training' } },
  { src: '', ratio: 'q', caption: { es: 'Deliberación del jurado', en: 'The judges deliberate' }, meta: { es: 'Competición', en: 'Competition' } },
  { src: '', ratio: 'v', caption: { es: 'Primer discurso', en: 'First speech' }, meta: { es: 'Taller de iniciación', en: 'Intro workshop' } },
  { src: '', ratio: 'h', caption: { es: 'Debate abierto', en: 'Open debate' }, meta: { es: 'Comunidad', en: 'Community' } },
  { src: '', ratio: 'q', caption: { es: 'Foto de familia', en: 'Family photo' }, meta: { es: 'Asamblea', en: 'Assembly' } },
  { src: '', ratio: 'h', caption: { es: 'Viaje a torneo', en: 'Tournament trip' }, meta: { es: 'Competición', en: 'Competition' } },
];

/* ---------- Publicaciones (EJEMPLO) ----------
   Copia aquí el texto y el enlace de cada publicación real.           */
export const posts = [
  {
    network: 'instagram', date: '2026-11-25', url: links.instagram,
    text: {
      es: 'Ya somos oficiales. Nace ADUPA, la casa del debate universitario en Asturias. Primer taller: 1 de diciembre.',
      en: 'It’s official. ADUPA is born — the home of university debating in Asturias. First workshop: December 1st.',
    },
  },
  {
    network: 'linkedin', date: '2026-11-24', url: links.linkedin,
    text: {
      es: 'Argumentar, escuchar y hablar en público son competencias que no caben en un examen. Por eso abrimos una asociación para entrenarlas.',
      en: 'Arguing, listening and public speaking don’t fit in an exam. So we started an association to train them.',
    },
  },
  {
    network: 'tiktok', date: '2026-11-22', url: links.tiktok,
    text: {
      es: '«Esta casa prohibiría los exámenes finales». 7 minutos. ¿A favor o en contra?',
      en: '“This house would ban final exams.” 7 minutes. For or against?',
    },
  },
  {
    network: 'x', date: '2026-11-20', url: links.x,
    text: {
      es: 'Moción de la semana: ¿debería ser obligatorio debatir en la universidad? Os leemos.',
      en: 'Motion of the week: should debating be compulsory at university? We’re reading.',
    },
  },
];

/* ---------- Documentos ----------
   Sustituye los PDF de /public/docs por los definitivos (mismo nombre). */
export const documents = [
  {
    file: 'docs/estatutos-adupa.pdf',
    title: { es: 'Estatutos', en: 'Statutes' },
    desc: {
      es: 'La norma fundamental de la asociación: fines, órganos de gobierno, derechos y deberes de las personas socias.',
      en: 'The association’s founding rules: aims, governing bodies, and members’ rights and duties.',
    },
    meta: { es: 'PDF · versión provisional', en: 'PDF · draft version' },
  },
  {
    file: 'docs/reglamento-adupa.pdf',
    title: { es: 'Reglamento de régimen interno', en: 'Internal regulations' },
    desc: {
      es: 'Cómo funcionamos en el día a día: actividades, selección de equipos para torneos, cuotas y convivencia.',
      en: 'How we work day to day: activities, tournament team selection, fees and conduct.',
    },
    meta: { es: 'PDF · versión provisional', en: 'PDF · draft version' },
  },
];

/* ---------- Colaboradores (EJEMPLO) ----------
   logo: ruta en /public/logos (svg o png). Sin logo se muestra el nombre. */
export const collaborators = [
  { name: 'Colaborador 01', logo: '', url: '', kind: { es: 'Patrocinio', en: 'Sponsor' } },
  { name: 'Colaborador 02', logo: '', url: '', kind: { es: 'Espacios', en: 'Venues' } },
  { name: 'Colaborador 03', logo: '', url: '', kind: { es: 'Formación', en: 'Training' } },
  { name: 'Colaborador 04', logo: '', url: '', kind: { es: 'Difusión', en: 'Media' } },
  { name: 'Colaborador 05', logo: '', url: '', kind: { es: 'Patrocinio', en: 'Sponsor' } },
  { name: 'Colaborador 06', logo: '', url: '', kind: { es: 'Institucional', en: 'Institutional' } },
];

/* ---------- Franja de logos del final del inicio ----------
   Instituciones y redes con las que se relaciona la asociación.
   ⚠ Usa cada logo solo con permiso de su titular.                     */
export const partners = [
  { name: 'Universidad de Oviedo', logo: '', url: 'https://www.uniovi.es' },
  { name: 'Grupo 9 de Universidades', logo: '', url: 'https://www.uni-g9.net' },
  { name: 'Asociación de debate · 01', logo: '', url: '' },
  { name: 'Asociación de debate · 02', logo: '', url: '' },
  { name: 'Liga de debate · 01', logo: '', url: '' },
  { name: 'Principado de Asturias', logo: '', url: '' },
];
