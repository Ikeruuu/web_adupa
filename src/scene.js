/* ==========================================================================
   Escenario 3D — «el debate se construye»
   Líneas + colores planos (sin texturas). Todo es geometría generada aquí:
   un orador en su atril, su rival, la esfera-cronómetro del suelo y la sala.
   El scroll mueve la cámara entre planos y va «dibujando» cada pieza.
   ========================================================================== */
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

const C = {
  cream: 0xe9ecdc, pale: 0xcfd8c4, sage: 0xa3b596, sageHi: 0xb7c5aa,
  g400: 0x6c8a78, g500: 0x4a6858, brand: 0x344e41, brandHi: 0x3f5d4d,
  g700: 0x263b30, g750: 0x2e4638, g800: 0x1c2c24, floor: 0x19281f,
  gold: 0xc9a559, line: 0xe6e9d9, lineDim: 0x8ba392, tick: 0x587464,
};

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeIO = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- materiales ---------- */
const lineMats = [];
function lineMat(color, width = 1.35, extra = {}) {
  const m = new LineMaterial({ color, linewidth: width, ...extra });
  lineMats.push(m);
  return m;
}

function fillMat(color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: 1 },
      uLight: { value: new THREE.Vector3(0.35, 0.85, -0.55).normalize() },
    },
    vertexShader: /* glsl */`
      varying vec3 vW;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uOpacity; uniform vec3 uLight;
      varying vec3 vW;
      void main() {
        // normal de cara (sin suavizar) -> tres tonos planos, estilo papel plegado
        vec3 n = normalize(cross(dFdx(vW), dFdy(vW)));
        float l = dot(n, uLight);
        float band = l > 0.42 ? 1.0 : (l > -0.12 ? 0.8 : 0.6);
        gl_FragColor = vec4(uColor * band, uOpacity);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    side: THREE.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: 1.5, polygonOffsetUnits: 1.5,
  });
}

/* ---------- piezas ---------- */
function segmentsFrom(positions, mat, sortByY = true) {
  const segs = [];
  for (let i = 0; i < positions.length; i += 6) segs.push(Array.prototype.slice.call(positions, i, i + 6));
  if (sortByY) segs.sort((a, b) => Math.min(a[1], a[4]) - Math.min(b[1], b[4]));
  const lg = new LineSegmentsGeometry().setPositions(segs.flat());
  const line = new LineSegments2(lg, mat);
  line.frustumCulled = false;
  line.userData.count = segs.length;
  return line;
}

/** Pieza = relleno plano + aristas. Guarda lo necesario para «dibujarse». */
function part(geo, color, mat, threshold = 18) {
  const g = new THREE.Group();
  const fm = fillMat(color);
  const mesh = new THREE.Mesh(geo, fm);
  const line = segmentsFrom(new THREE.EdgesGeometry(geo, threshold).attributes.position.array, mat);
  g.add(mesh, line);
  g.userData = { mat: fm, lg: line.geometry, count: line.userData.count };
  return g;
}

/** Pieza solo de línea (sin relleno) compatible con Build. */
function linePart(line) {
  const g = new THREE.Group(); g.add(line);
  g.userData = { mat: { uniforms: { uOpacity: { value: 1 } } }, lg: line.geometry, count: line.userData.count };
  return g;
}

function polyline(points, mat, closed = false) {
  const pos = [];
  const n = points.length;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const a = points[i]; const b = points[(i + 1) % n];
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }
  return segmentsFrom(pos, mat, false);
}

class Build {
  constructor(parts) { this.parts = parts; this.p = -1; }
  set(p) {
    if (Math.abs(p - this.p) < 0.0005) return;
    this.p = p;
    const n = this.parts.length;
    for (let i = 0; i < n; i++) {
      const prt = this.parts[i];
      const start = n > 1 ? (i / (n - 1)) * 0.55 : 0;
      const local = clamp01((p - start) / 0.45);
      const u = prt.userData;
      prt.visible = local > 0.002;
      u.lg.instanceCount = Math.ceil(clamp01(local / 0.72) * u.count);
      u.mat.uniforms.uOpacity.value = smooth(0.35, 1, local);
    }
  }
}

/* ---------- orador ---------- */
function makeSpeaker(M, tones) {
  const root = new THREE.Group();
  const parts = [];
  const add = (p, parent = root) => { parent.add(p); parts.push(p); return p; };

  const gown = new THREE.CylinderGeometry(0.19, 0.35, 0.95, 7); gown.scale(1, 1, 0.8); gown.translate(0, 0.475, 0);
  add(part(gown, tones.gown, M.line));
  const torso = new THREE.CylinderGeometry(0.255, 0.19, 0.48, 7); torso.scale(1, 1, 0.62); torso.translate(0, 1.19, 0);
  add(part(torso, tones.torso, M.line));
  const neck = new THREE.CylinderGeometry(0.058, 0.07, 0.1, 6); neck.translate(0, 1.475, 0);
  add(part(neck, tones.skin, M.line));
  // beca: la banda en V de los actos académicos
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  add(linePart(polyline([V(-0.175, 1.425, 0.122), V(0, 1.1, 0.146), V(0.175, 1.425, 0.122)], M.goldBold)));

  const head = new THREE.Group(); head.position.set(0, 1.68, 0.01); root.add(head);
  const hg = new THREE.DodecahedronGeometry(0.158); hg.scale(0.92, 1.08, 0.96);
  add(part(hg, tones.skin, M.line), head);

  const arm = (side) => {
    const shoulder = new THREE.Group(); shoulder.position.set(0.275 * side, 1.385, 0); root.add(shoulder);
    const ug = new THREE.CylinderGeometry(0.056, 0.048, 0.36, 5); ug.translate(0, -0.18, 0);
    add(part(ug, tones.torso, M.line), shoulder);
    const elbow = new THREE.Group(); elbow.position.set(0, -0.36, 0); shoulder.add(elbow);
    const fg = new THREE.CylinderGeometry(0.046, 0.04, 0.32, 5); fg.translate(0, -0.16, 0);
    add(part(fg, tones.torso, M.line), elbow);
    const hand = new THREE.OctahedronGeometry(0.06); hand.scale(0.8, 1.15, 0.6); hand.translate(0, -0.37, 0);
    add(part(hand, tones.skin, M.line), elbow);
    return { shoulder, elbow };
  };
  const armA = arm(1); const armB = arm(-1);
  // pose de reposo: una mano en el atril
  armB.shoulder.rotation.set(-0.62, 0, -0.08); armB.elbow.rotation.set(-0.78, 0, 0);
  armA.shoulder.rotation.set(-0.9, 0, 0.3); armA.elbow.rotation.set(-0.9, 0, 0);

  return { root, build: new Build(parts), head, armA, armB };
}

function makeLectern(M) {
  const root = new THREE.Group();
  const parts = [];
  const add = (p, parent = root) => { parent.add(p); parts.push(p); return p; };

  const base = new THREE.BoxGeometry(0.58, 0.05, 0.46); base.translate(0, 0.025, 0);
  add(part(base, C.g800, M.line));
  const col = new THREE.CylinderGeometry(0.2, 0.265, 0.98, 4); col.rotateY(Math.PI / 4); col.translate(0, 0.54, 0);
  add(part(col, C.g700, M.line));
  const emblem = new THREE.CircleGeometry(0.085, 20); emblem.translate(0, 0.74, 0.172);
  add(part(emblem, C.gold, M.gold));

  const desk = new THREE.Group(); desk.position.set(0, 1.09, 0); desk.rotation.x = -0.3; root.add(desk);
  add(part(new THREE.BoxGeometry(0.68, 0.045, 0.48), C.g750, M.line), desk);
  const sheet = new THREE.BoxGeometry(0.21, 0.006, 0.29); sheet.rotateY(0.14); sheet.translate(-0.12, 0.028, -0.02);
  add(part(sheet, C.cream, M.line), desk);

  const mic = new THREE.CylinderGeometry(0.008, 0.008, 0.34, 4); mic.translate(0, 0.17, 0); mic.rotateX(-0.55); mic.translate(0.2, 1.1, 0.1);
  add(part(mic, C.pale, M.line));
  const micHead = new THREE.OctahedronGeometry(0.032); micHead.translate(0.2, 1.1 + Math.cos(0.55) * 0.35, 0.1 - Math.sin(0.55) * 0.35);
  add(part(micHead, C.gold, M.gold));

  return { root, build: new Build(parts) };
}

function makeSeat(M, gownColor, headColor, mat) {
  const root = new THREE.Group();
  const gown = new THREE.CylinderGeometry(0.1, 0.27, 0.86, 6); gown.translate(0, 0.43, 0);
  const head = new THREE.DodecahedronGeometry(0.13); head.translate(0, 1.04, 0);
  const a = part(gown, gownColor, mat); const b = part(head, headColor, mat);
  root.add(a, b);
  return { root, build: new Build([a, b]) };
}

/* ==========================================================================
   Planos de cámara. Cada plano tiene variante horizontal (l) y vertical (p).
   cam / tgt: posición y punto de mira · ox, oy: desplazamiento en pantalla
   ========================================================================== */
const BASE = { a: 1, la: 1, b: 0, lb: 0, arcs: 0, waves: 0, room: 0, time: 0, hand: 0, free: 0, tagA: 0 };
const SHOTS = [
  { // 0 · inicio: primer orador
    l: { cam: [1.6, 1.58, -5.15], tgt: [-1.25, 0.96, 0], ox: 0.23, oy: 0.02 },
    p: { cam: [2.5, 1.9, -6.9], tgt: [-1.2, 0.95, 0], ox: 0.06, oy: 0.22 },
    s: { waves: 1, tagA: 1 },
  },
  { // inicio → sale
    el: '#quienes', from: 1, to: 0,
    l: { cam: [2.9, 2.05, -4.7], tgt: [-1.2, 1.0, 0], ox: 0.23, oy: 0.0 },
    p: { cam: [3.4, 2.4, -6.6], tgt: [-1.2, 1.0, 0], ox: 0.06, oy: 0.18 },
    s: { waves: 0.4, tagA: 0 },
  },
  { // acto I · dos posturas
    el: '#act-1', from: 1.05, to: 0,
    l: { cam: [0.6, 1.75, -9.6], tgt: [0, 1.12, 0], ox: 0.2, oy: 0.02 },
    p: { cam: [10.3, 2.9, -7.9], tgt: [0, 1.0, 0], ox: 0, oy: 0.2 },
    s: { b: 1, lb: 1, arcs: 0.5 },
  },
  {
    el: '#act-1', from: 0, to: -0.9,
    l: { cam: [-1.6, 2.3, -9.3], tgt: [0, 1.1, 0], ox: 0.2, oy: 0.02 },
    p: { cam: [9.2, 3.6, -9.2], tgt: [0, 1.0, 0], ox: 0, oy: 0.2 },
    s: { b: 1, lb: 1, arcs: 1 },
  },
  { // acto II · siete minutos (vista cenital, el suelo es un cronómetro)
    el: '#act-2', from: 1, to: 0,
    l: { cam: [0, 14.2, -5.4], tgt: [0, 0, 0], ox: 0.21, oy: 0 },
    p: { cam: [0, 29, -1.4], tgt: [0, 0, 0], ox: 0, oy: 0.14 },
    s: { b: 1, lb: 1, arcs: 0.25, hand: 1, time: 0.12 },
  },
  {
    el: '#act-2', from: 0, to: -0.9,
    l: { cam: [1.6, 13.4, -6.6], tgt: [0, 0, 0], ox: 0.21, oy: 0 },
    p: { cam: [0, 28, -3], tgt: [0, 0, 0], ox: 0, oy: 0.14 },
    s: { b: 1, lb: 1, arcs: 0.25, hand: 1, time: 1 },
  },
  { // acto III · la sala
    el: '#act-3', from: 1, to: 0,
    l: { cam: [7.2, 6.4, -9.2], tgt: [0, 0.5, 0.7], ox: 0.17, oy: -0.02 },
    p: { cam: [13.6, 12, -16], tgt: [0, 0.4, 0.8], ox: 0, oy: 0.16 },
    s: { b: 1, lb: 1, arcs: 1, hand: 1, time: 1, room: 0.55 },
  },
  {
    el: '#act-3', from: 0, to: -1.1,
    l: { cam: [10.2, 5.2, -6.2], tgt: [0, 0.6, 0.7], ox: 0.17, oy: -0.02 },
    p: { cam: [17.5, 10.5, -12], tgt: [0, 0.4, 0.8], ox: 0, oy: 0.16 },
    s: { b: 1, lb: 1, arcs: 1, hand: 1, time: 1, room: 1 },
  },
  { // únete · el atril libre
    el: '#unete', from: 1.9, to: 0.8,
    l: { cam: [4.5, 2.15, -2.9], tgt: [0.75, 1.02, 0.25], ox: 0.2, oy: 0.02 },
    p: { cam: [6.4, 2.7, -4.3], tgt: [0.85, 0.95, 0.25], ox: 0, oy: 0.2 },
    s: { b: 0, lb: 1, arcs: 0, hand: 0, time: 1, room: 1, free: 1 },
  },
  {
    el: '#unete', from: 0.8, to: -0.4,
    l: { cam: [3.6, 1.85, -2.2], tgt: [0.8, 1.05, 0.25], ox: 0.2, oy: 0.02 },
    p: { cam: [5.5, 2.4, -3.6], tgt: [0.85, 0.95, 0.25], ox: 0, oy: 0.2 },
    s: { b: 0, lb: 1, arcs: 0, hand: 0, time: 1, room: 1, free: 1 },
  },
];

const NUM = ['ox', 'oy', 'a', 'la', 'b', 'lb', 'arcs', 'waves', 'room', 'time', 'hand', 'free', 'tagA'];

export function createScene(canvas, { reduced = false } = {}) {
  const coarse = matchMedia('(max-width: 899px), (pointer: coarse)').matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    canvas.style.display = 'none';
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 120);

  const M = {
    line: lineMat(C.line, coarse ? 1.15 : 1.35),
    dim: lineMat(C.lineDim, 1.0),
    tick: lineMat(C.tick, 1.0),
    gold: lineMat(C.gold, coarse ? 1.3 : 1.6),
    goldBold: lineMat(C.gold, 3),
  };

  /* ---- suelo: esfera de cronómetro ---- */
  const R = 3.0;
  const disc = new THREE.CircleGeometry(R, 72); disc.rotateX(-Math.PI / 2);
  const floor = part(disc, C.floor, M.dim);
  floor.children[0].visible = false; // solo el contorno: el relleno taparía el titular
  scene.add(floor);
  const ring = (r, mat, y = 0.004, n = 96) => polyline(Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2; return new THREE.Vector3(Math.sin(t) * r, y, Math.cos(t) * r);
  }), mat, true);
  const ringIn = ring(2.2, M.tick); const ringCore = ring(0.42, M.dim);
  const tickPos = [];
  for (let i = 0; i < 60; i++) {
    const t = (i / 60) * Math.PI * 2; const r0 = i % 5 === 0 ? R - 0.34 : R - 0.16;
    tickPos.push(Math.sin(t) * r0, 0.004, Math.cos(t) * r0, Math.sin(t) * (R - 0.05), 0.004, Math.cos(t) * (R - 0.05));
  }
  const ticks = segmentsFrom(tickPos, M.tick, false);
  scene.add(ringIn, ringCore, ticks);
  const floorLines = [ringIn, ringCore, ticks];

  // aguja + arco de tiempo transcurrido (se llena con el scroll del acto II)
  const hand = new THREE.Group(); scene.add(hand);
  const needle = polyline([new THREE.Vector3(0, 0.012, -0.3), new THREE.Vector3(0, 0.012, R - 0.42)], M.goldBold);
  hand.add(needle);
  const ARC_N = 240;
  const timeArc = polyline(Array.from({ length: ARC_N + 1 }, (_, i) => {
    const t = (i / ARC_N) * Math.PI * 2; return new THREE.Vector3(Math.sin(t) * (R + 0.14), 0.012, Math.cos(t) * (R + 0.14));
  }), M.goldBold);
  scene.add(timeArc);

  /* ---- los dos turnos ---- */
  const X = 1.45;
  const stationA = new THREE.Group(); stationA.position.set(-X, 0, 0); stationA.rotation.y = Math.PI / 2; scene.add(stationA);
  const stationB = new THREE.Group(); stationB.position.set(X, 0, 0); stationB.rotation.y = -Math.PI / 2; scene.add(stationB);

  const spA = makeSpeaker(M, { gown: C.brand, torso: C.brandHi, skin: C.pale });
  const spB = makeSpeaker(M, { gown: C.sage, torso: C.sageHi, skin: C.cream });
  const lecA = makeLectern(M); lecA.root.position.z = 0.52;
  const lecB = makeLectern(M); lecB.root.position.z = 0.52;
  stationA.add(spA.root, lecA.root); stationB.add(spB.root, lecB.root);

  /* ---- la voz: ondas del primer orador ---- */
  const waves = [];
  for (let i = 0; i < 3; i++) {
    const m = lineMat(C.gold, 1.5, { transparent: true, opacity: 0, depthWrite: false });
    const pts = Array.from({ length: 21 }, (_, k) => { const t = lerp(-0.62, 0.62, k / 20); return new THREE.Vector3(0, Math.sin(t), Math.cos(t)); });
    const w = polyline(pts, m); w.position.set(0, 1.63, 0.2); stationA.add(w); waves.push({ w, m });
  }

  /* ---- los argumentos: arcos que cruzan de un lado a otro ---- */
  const arcs = [];
  [[3.05, -0.55, 1], [3.7, 0.0, -1], [2.55, 0.6, 1]].forEach(([h, z, dir], i) => {
    const m = lineMat(i === 1 ? C.gold : C.line, 1.4, { dashed: true, dashSize: 0.13, gapSize: 0.11, dashScale: 1 });
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-X + 0.1, 1.9, 0), new THREE.Vector3(0, h, z), new THREE.Vector3(X - 0.1, 1.9, 0));
    const pts = curve.getPoints(56); if (dir < 0) pts.reverse();
    const l = polyline(pts, m); l.computeLineDistances(); scene.add(l);
    arcs.push({ l, m, dir, n: 56 });
  });

  /* ---- la sala: público en hemiciclo y mesa del jurado ---- */
  const seats = [];
  const room = new THREE.Group(); scene.add(room);
  const rows = coarse ? [[4.5, 5, 0]] : [[4.5, 6, 0], [5.5, 7, 0.36]];
  rows.forEach(([r, n, y], ri) => {
    const a0 = THREE.MathUtils.degToRad(28); const a1 = THREE.MathUtils.degToRad(152);
    const wall = new THREE.CylinderGeometry(r - 0.5, r - 0.5, 0.74, 28, 1, true, Math.PI / 2 - a1 - 0.06, a1 - a0 + 0.12);
    wall.translate(0, 0.37 + y, 0);
    const desk = part(wall, C.g800, M.dim); room.add(desk);
    seats.push({ build: new Build([desk]), order: ri * 0.3 });
    for (let i = 0; i < n; i++) {
      const a = lerp(a0, a1, n > 1 ? i / (n - 1) : 0.5);
      const s = makeSeat(M, (i + ri) % 3 === 0 ? C.g500 : C.g700, C.g400, M.dim);
      s.root.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      s.root.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a));
      room.add(s.root);
      seats.push({ build: s.build, order: 0.12 + ri * 0.25 + (i / n) * 0.5 });
    }
  });
  const tableG = new THREE.BoxGeometry(2.3, 0.74, 0.5); tableG.translate(0, 0.37, -3.75);
  const table = part(tableG, C.g700, M.line); room.add(table);
  seats.push({ build: new Build([table]), order: 0.05 });
  [-0.72, 0, 0.72].forEach((x, i) => {
    const s = makeSeat(M, C.brand, C.pale, M.line);
    s.root.position.set(x, 0, -4.2); room.add(s.root);
    seats.push({ build: s.build, order: 0.2 + i * 0.1 });
  });

  /* ---- estado ---- */
  const mk = () => ({ cam: [0, 0, 0], tgt: [0, 0, 0], ...Object.fromEntries(NUM.map((k) => [k, 0])) });
  const goal = mk(); const cur = mk(); const tmp = mk();
  let first = true; let boot = reduced ? 1 : 0; let W = 1; let H = 1; let portrait = 0;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const els = SHOTS.map((s) => (s.el ? document.querySelector(s.el) : null));

  function shotState(shot, out) {
    const l = shot.l; const p = shot.p; const f = portrait;
    for (let i = 0; i < 3; i++) { out.cam[i] = lerp(l.cam[i], p.cam[i], f); out.tgt[i] = lerp(l.tgt[i], p.tgt[i], f); }
    const s = { ...BASE, ...shot.s };
    for (const k of NUM) out[k] = s[k] ?? 0;
    out.ox = lerp(l.ox, p.ox, f); out.oy = lerp(l.oy, p.oy, f);
    return out;
  }
  function mix(a, b, t) {
    for (let i = 0; i < 3; i++) { a.cam[i] = lerp(a.cam[i], b.cam[i], t); a.tgt[i] = lerp(a.tgt[i], b.tgt[i], t); }
    for (const k of NUM) a[k] = lerp(a[k], b[k], t);
  }
  function computeGoal() {
    shotState(SHOTS[0], goal);
    for (let i = 1; i < SHOTS.length; i++) {
      const el = els[i]; if (!el) continue;
      const top = el.getBoundingClientRect().top / H;
      const s = SHOTS[i];
      const t = clamp01((s.from - top) / (s.from - s.to));
      if (t <= 0) continue;
      mix(goal, shotState(s, tmp), easeIO(t));
    }
  }

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.75 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    portrait = clamp01((1.3 - camera.aspect) / 0.7);
    lineMats.forEach((m) => m.resolution.set(W, H));
    first = true;
  }

  /* ---- etiquetas HTML ancladas a puntos 3D ---- */
  const tags = [
    { el: document.querySelector('#tag-a'), pos: new THREE.Vector3(-X - 0.02, 1.9, 0), key: 'tagA', dx: 6, dy: -4 },
    { el: document.querySelector('#tag-for'), pos: new THREE.Vector3(-X, 2.12, 0), key: 'sides', center: true },
    { el: document.querySelector('#tag-against'), pos: new THREE.Vector3(X, 2.12, 0), key: 'sides', center: true },
    { el: document.querySelector('#tag-free'), pos: new THREE.Vector3(X - 0.5, 1.5, 0), key: 'free', dx: 6, dy: -4 },
  ];
  const v = new THREE.Vector3();
  function placeTags(alphaOf) {
    for (const tg of tags) {
      if (!tg.el) continue;
      const a = alphaOf(tg.key);
      if (a < 0.01) { if (tg.on) { tg.el.style.opacity = 0; tg.on = false; } continue; }
      v.copy(tg.pos).project(camera);
      const x = (v.x * 0.5 + 0.5) * W; const y = (-v.y * 0.5 + 0.5) * H;
      tg.el.style.transform = tg.center
        ? `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`
        : `translate(${(x + (tg.dx || 0)).toFixed(1)}px, ${(y + (tg.dy || 0)).toFixed(1)}px)`;
      tg.el.style.opacity = a.toFixed(3);
      tg.on = true;
    }
  }

  /* ---- bucle ---- */
  const clock = new THREE.Clock();
  let active = true; let raf = 0; let time = 0;
  const up = new THREE.Vector3(0, 1, 0); const right = new THREE.Vector3(); const camPos = new THREE.Vector3(); const tgt = new THREE.Vector3();

  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!active || document.hidden) return;
    tick(dt);
  }

  function tick(dt) {
    if (!reduced) time += dt;

    computeGoal();
    const k = first || reduced ? 1 : 1 - Math.exp(-dt * 5.5);
    mix(cur, goal, k); first = false;

    pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt * 3));
    pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt * 3));

    // cámara
    camPos.set(cur.cam[0], cur.cam[1], cur.cam[2]); tgt.set(cur.tgt[0], cur.tgt[1], cur.tgt[2]);
    const dist = camPos.distanceTo(tgt);
    right.subVectors(tgt, camPos).cross(up).normalize();
    camPos.addScaledVector(right, pointer.sx * dist * 0.035);
    camPos.y += pointer.sy * dist * 0.02;
    camera.position.copy(camPos); camera.lookAt(tgt);
    camera.setViewOffset(W, H, -cur.ox * W, -cur.oy * H, W, H);

    // construcción de piezas
    const b0 = easeIO(clamp01(boot));
    floor.userData.lg.instanceCount = Math.ceil(clamp01(boot * 1.6) * floor.userData.count);
    floorLines.forEach((l) => { l.geometry.instanceCount = Math.ceil(clamp01(boot * 1.3) * l.userData.count); });
    lecA.build.set(cur.la * clamp01(boot * 1.25));
    spA.build.set(cur.a * clamp01(boot * 1.25 - 0.25));
    lecB.build.set(cur.lb); spB.build.set(cur.b);

    for (const s of seats) s.build.set(clamp01((cur.room * 1.75 - s.order) / 0.75));
    room.visible = cur.room > 0.002;

    // voz
    waves.forEach(({ w, m }, i) => {
      const ph = (time * 0.42 + i / 3) % 1;
      const sc = 0.22 + ph * 0.78; w.scale.set(sc, sc, sc);
      m.opacity = Math.sin(ph * Math.PI) * 0.9 * cur.waves * b0 * cur.a;
      w.visible = m.opacity > 0.01;
    });

    // argumentos
    arcs.forEach(({ l, m, dir, n }, i) => {
      const p = clamp01(cur.arcs * 1.5 - i * 0.22);
      l.visible = p > 0.002;
      l.geometry.instanceCount = Math.ceil(easeIO(p) * n);
      m.dashOffset = -time * 0.5 * (1 + i * 0.2);
    });

    // cronómetro
    hand.visible = needle.visible = cur.hand > 0.02;
    needle.geometry.instanceCount = cur.hand > 0.02 ? 1 : 0;
    hand.rotation.y = -cur.time * Math.PI * 2;
    hand.scale.setScalar(Math.max(0.001, easeIO(cur.hand)));
    timeArc.visible = cur.hand > 0.02 && cur.time > 0.002;
    timeArc.geometry.instanceCount = Math.ceil(clamp01(cur.time) * ARC_N);
    timeArc.scale.x = -1; // sentido horario visto desde arriba

    // gesto
    if (!reduced) {
      const t = time;
      spA.armA.shoulder.rotation.set(-0.95 + Math.sin(t * 1.25) * 0.28, 0, 0.32 + Math.sin(t * 0.8 + 1) * 0.14);
      spA.armA.elbow.rotation.x = -0.95 + Math.sin(t * 1.7 + 0.6) * 0.38;
      spA.head.rotation.set(Math.sin(t * 0.9) * 0.05, Math.sin(t * 0.55) * 0.3, 0);
      spA.root.rotation.y = Math.sin(t * 0.5) * 0.06;
      spB.armA.shoulder.rotation.set(-0.7 + Math.sin(t * 1.05 + 2) * 0.22, 0, 0.25 + Math.sin(t * 0.7) * 0.1);
      spB.armA.elbow.rotation.x = -1.1 + Math.sin(t * 1.5 + 2.4) * 0.3;
      spB.head.rotation.set(Math.sin(t * 0.8 + 1) * 0.05, Math.sin(t * 0.45 + 2) * 0.22, 0);
    }

    renderer.render(scene, camera);

    placeTags((key) => {
      if (key === 'sides') return smooth(0.3, 0.9, cur.b) * (1 - smooth(0.02, 0.2, cur.hand));
      if (key === 'tagA') return cur.tagA * smooth(0.85, 1, boot);
      return smooth(0.6, 1, cur[key]);
    });
  }

  resize();
  window.addEventListener('resize', resize);
  if (!coarse) {
    window.addEventListener('pointermove', (e) => {
      pointer.x = (e.clientX / W) * 2 - 1; pointer.y = (e.clientY / H) * 2 - 1;
    }, { passive: true });
  }

  // solo se renderiza cuando alguna «ventana» al escenario está en pantalla
  const seen = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
    active = seen.size > 0;
  }, { rootMargin: '25% 0px' });
  document.querySelectorAll('[data-stage]').forEach((el) => io.observe(el));

  frame();

  return {
    /** progreso 0→1 de la entrada: dibuja suelo, atril y orador */
    setBoot(val) { boot = val; },
    /** fuerza un fotograma (depuración o capturas); snap = sin suavizado */
    step(dt = 0.016, snap = false) { if (snap) first = true; tick(dt); },
    destroy() { cancelAnimationFrame(raf); io.disconnect(); renderer.dispose(); },
  };
}
