/* ==========================================================================
   Escenario 3D — «el debate se construye»
   Líneas + colores planos (sin texturas). Todo es geometría generada aquí:
   una oradora y un orador (siluetas lisas, sin cara) en sus atriles,
   la esfera-cronómetro del suelo y la sala con público y jurado.
   El scroll mueve la cámara de un plano a otro a lo largo de toda la página:
   es un único viaje, de la primera palabra al último colaborador.
   ========================================================================== */
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const C = {
  cream: 0xe9ecdc, pale: 0xcfd8c4, sage: 0xa3b596, sageHi: 0xb7c5aa,
  g400: 0x6c8a78, g500: 0x4a6858, brand: 0x344e41, brandHi: 0x3f5d4d,
  g700: 0x22362c, g750: 0x1a2a22, g800: 0x14201a, floor: 0x19281f,
  gold: 0xcca300, line: 0xeef0e4, lineDim: 0xa9bdad, tick: 0x7e9b89,
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

/* ---------- personas: silueta lisa, sin cara ----------
   Volúmenes suaves fundidos en una sola malla por figura, color plano con una
   sombra de dos tonos y contorno fino. Aparecen «subiendo» desde el suelo. */
const hullRes = { value: new THREE.Vector2(1, 1) };
const LIGHT = new THREE.Vector3(0.35, 0.85, -0.55).normalize();

function tint(geo, color) {
  const c = new THREE.Color(color);
  const n = geo.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  geo.setAttribute('aColor', new THREE.BufferAttribute(arr, 3));
  return geo;
}

function bodyMats(lineColor, px) {
  const cut = { value: 1e3 };
  const fill = new THREE.ShaderMaterial({
    uniforms: { uCut: cut, uLight: { value: LIGHT } },
    vertexShader: /* glsl */`
      attribute vec3 aColor;
      varying vec3 vC; varying vec3 vN; varying vec3 vW;
      void main() {
        vC = aColor;
        vN = mat3(modelMatrix) * normal;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */`
      uniform float uCut; uniform vec3 uLight;
      varying vec3 vC; varying vec3 vN; varying vec3 vW;
      void main() {
        if (vW.y > uCut) discard;
        float l = dot(normalize(vN), uLight);
        gl_FragColor = vec4(vC * (l > -0.05 ? 1.0 : 0.8), 1.0);
        #include <colorspace_fragment>
      }`,
    side: THREE.DoubleSide,
  });
  const hull = new THREE.ShaderMaterial({
    uniforms: { uCut: cut, uRes: hullRes, uPx: { value: px }, uColor: { value: new THREE.Color(lineColor) } },
    vertexShader: /* glsl */`
      uniform vec2 uRes; uniform float uPx;
      varying vec3 vW;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vec4 clip = projectionMatrix * viewMatrix * w;
        vec4 nClip = projectionMatrix * viewMatrix * vec4(normalize(mat3(modelMatrix) * normal), 0.0);
        vec2 dir = nClip.xy * uRes;
        float len = length(dir);
        if (len > 1e-6) clip.xy += (dir / len) / uRes * 2.0 * uPx * clip.w; // grosor constante en píxeles
        gl_Position = clip;
      }`,
    fragmentShader: /* glsl */`
      uniform float uCut; uniform vec3 uColor;
      varying vec3 vW;
      void main() {
        if (vW.y > uCut) discard;
        gl_FragColor = vec4(uColor, 1.0);
        #include <colorspace_fragment>
      }`,
    side: THREE.BackSide,
  });
  return { cut, fill, hull };
}

function skinned(geos, mats) {
  const geo = mergeGeometries(geos, false);
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, mats.fill), new THREE.Mesh(geo, mats.hull));
  g.children.forEach((m) => { m.frustumCulled = false; });
  return g;
}

/** Aparición de una figura: sube un plano de corte desde los pies. */
class Rise {
  constructor(root, mats, base = 0, height = 1.9) { this.root = root; this.mats = mats; this.base = base; this.h = height; this.p = -1; }
  set(p) {
    if (Math.abs(p - this.p) < 0.0005) return;
    this.p = p;
    this.root.visible = p > 0.002;
    this.mats.cut.value = p >= 0.999 ? 1e3 : this.base + easeIO(p) * this.h;
  }
}

const profile = (pts, sx, sz) => {
  const curve = new THREE.SplineCurve(pts.map(([r, y]) => new THREE.Vector2(r, y)));
  const g = new THREE.LatheGeometry(curve.getPoints(26), 30);
  g.scale(sx, 1, sz);
  return g;
};
const TORSO = {
  a: { pts: [[0.176, 0.86], [0.166, 0.96], [0.153, 1.06], [0.166, 1.18], [0.182, 1.29], [0.188, 1.37], [0.172, 1.418], [0.128, 1.447], [0.074, 1.466], [0.05, 1.476]], sx: 1.12, sz: 0.64, shoulder: 0.215 },
  b: { pts: [[0.19, 0.86], [0.176, 0.96], [0.14, 1.07], [0.157, 1.18], [0.172, 1.29], [0.173, 1.37], [0.156, 1.418], [0.115, 1.447], [0.068, 1.466], [0.046, 1.476]], sx: 1.1, sz: 0.66, shoulder: 0.198 },
};

function hairGeos(style, color) {
  const out = [];
  const cap = new THREE.SphereGeometry(0.113, 30, 14, 0, Math.PI * 2, 0, Math.PI * 0.43);
  cap.scale(0.93, 1.1, 1.0); cap.rotateX(style === 'short' ? -0.62 : -0.5); cap.translate(0, 0.012, -0.012);
  out.push(tint(cap, color));
  if (style === 'bun') {
    const bun = new THREE.SphereGeometry(0.052, 18, 14); bun.translate(0, 0.085, -0.118);
    out.push(tint(bun, color));
  } else if (style === 'bob') {
    const back = new THREE.SphereGeometry(1, 22, 16); back.scale(0.108, 0.145, 0.078); back.translate(0, -0.055, -0.052);
    out.push(tint(back, color));
  }
  return out;
}

function armParts(tones, side) {
  const upper = new THREE.CapsuleGeometry(0.05, 0.25, 6, 16); upper.translate(0, -0.125, 0);
  const fore = new THREE.CapsuleGeometry(0.042, 0.2, 6, 16); fore.translate(0, -0.1, 0);
  const hand = new THREE.SphereGeometry(1, 16, 12); hand.scale(0.035, 0.058, 0.024); hand.translate(0.004 * side, -0.275, 0);
  return { upper: tint(upper, tones.jacket), lower: [tint(fore, tones.jacket), tint(hand, tones.skin)] };
}

/**
 * tones: { jacket, shirt, trousers, skin, hair, shoes } · opts: build 'a'|'b', hair 'short'|'bun'|'bob',
 * seated (busto fundido en una malla, sin articular), line (color del contorno), px (grosor)
 */
function makeHuman(tones, { build = 'a', hair = 'short', seated = false, line = C.line, px = 1.2, base = 0 } = {}) {
  const T = TORSO[build];
  const mats = bodyMats(line, px);
  const root = new THREE.Group();
  const body = [];

  if (!seated) {
    [-1, 1].forEach((s) => {
      const leg = new THREE.CylinderGeometry(0.083, 0.056, 0.84, 18); leg.translate(0.092 * s, 0.5, 0);
      const shoe = new THREE.SphereGeometry(1, 16, 10); shoe.scale(0.056, 0.042, 0.122); shoe.translate(0.092 * s, 0.042, 0.036);
      body.push(tint(leg, tones.trousers), tint(shoe, tones.shoes));
    });
  }
  const hips = new THREE.SphereGeometry(1, 22, 14); hips.scale(build === 'b' ? 0.184 : 0.172, 0.12, 0.118); hips.translate(0, 0.93, 0);
  body.push(tint(hips, tones.trousers));
  body.push(tint(profile(T.pts, T.sx, T.sz), tones.jacket));
  const shirt = new THREE.ConeGeometry(0.058, 0.17, 16); shirt.rotateX(Math.PI); shirt.scale(1, 1, 0.36); shirt.rotateX(-0.27); shirt.translate(0, 1.385, 0.1);
  body.push(tint(shirt, tones.shirt));
  const neck = new THREE.CylinderGeometry(0.047, 0.053, 0.13, 16); neck.translate(0, 1.5, 0);
  body.push(tint(neck, tones.skin));

  const headGeo = new THREE.SphereGeometry(0.107, 30, 22); headGeo.scale(0.9, 1.13, 0.97);
  const headGeos = [tint(headGeo, tones.skin), ...hairGeos(hair, tones.hair)];
  const HEAD = [0, 1.64, 0.012];

  if (seated) {
    // todo fundido: cabeza y brazos en reposo, sin articular
    headGeos.forEach((g) => { g.translate(...HEAD); body.push(g); });
    [-1, 1].forEach((s) => {
      const a = armParts(tones, s);
      const mS = new THREE.Matrix4().makeTranslation(T.shoulder * s, 1.385, 0).multiply(new THREE.Matrix4().makeRotationX(-0.32));
      const mE = mS.clone().multiply(new THREE.Matrix4().makeTranslation(0, -0.26, 0)).multiply(new THREE.Matrix4().makeRotationX(-0.75));
      a.upper.applyMatrix4(mS); a.lower.forEach((g) => g.applyMatrix4(mE));
      body.push(a.upper, ...a.lower);
    });
    body.forEach((g) => g.translate(0, -0.46, 0));
    root.add(skinned(body, mats));
    return { root, build: new Rise(root, mats, base, 1.5) };
  }

  root.add(skinned(body, mats));
  const head = new THREE.Group(); head.position.set(...HEAD); root.add(head);
  head.add(skinned(headGeos, mats));

  const arm = (s) => {
    const a = armParts(tones, s);
    const shoulder = new THREE.Group(); shoulder.position.set(T.shoulder * s, 1.385, 0); root.add(shoulder);
    shoulder.add(skinned([a.upper], mats));
    const elbow = new THREE.Group(); elbow.position.set(0, -0.26, 0); shoulder.add(elbow);
    elbow.add(skinned(a.lower, mats));
    return { shoulder, elbow };
  };
  const armA = arm(1); const armB = arm(-1);
  // pose de reposo: una mano apoyada en el atril
  armB.shoulder.rotation.set(-0.62, 0, -0.08); armB.elbow.rotation.set(-0.78, 0, 0);
  armA.shoulder.rotation.set(-0.9, 0, 0.3); armA.elbow.rotation.set(-0.9, 0, 0);

  return { root, build: new Rise(root, mats, base, 1.9), head, armA, armB };
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

/* ==========================================================================
   Planos de cámara. Cada plano tiene variante horizontal (l) y vertical (p).
   cam / tgt: posición y punto de mira · ox, oy: desplazamiento en pantalla
   ========================================================================== */
const BASE = { a: 1, la: 1, b: 0, lb: 0, arcs: 0, waves: 0, room: 0, time: 0, hand: 0, free: 0, tagA: 0, sides: 0, papers: 0, dim: 1 };
const SHOTS = [
  { // inicio: la oradora
    l: { cam: [1.6, 1.58, -5.15], tgt: [-1.25, 0.96, 0], ox: 0.23, oy: 0.02 },
    p: { cam: [2.5, 1.9, -6.9], tgt: [-1.2, 0.95, 0], ox: 0.08, oy: 0.4 },
    s: { waves: 1, tagA: 1 },
  },
  { // quiénes somos: plano medio, ella a la derecha del texto
    el: '#quienes', from: 1, to: 0.1,
    l: { cam: [2.5, 1.45, -3.1], tgt: [-1.3, 1.2, 0], ox: 0.31, oy: 0 },
    p: { cam: [3.6, 2.2, -6.2], tgt: [-1.2, 1.0, 0], ox: 0.1, oy: 0.34 },
    s: { waves: 0.7 },
  },
  {
    el: '.about__row', from: 1, to: 0.25,
    l: { cam: [0.2, 2.9, -4.9], tgt: [-1.25, 1.0, 0], ox: 0.31, oy: 0.02 },
    p: { cam: [1.4, 4.2, -7.4], tgt: [-1.2, 1.0, 0], ox: 0.1, oy: 0.3 },
    s: { waves: 0.3, dim: 0.8 },
  },
  { // pilares y cifras: la cámara se eleva y la escena queda de fondo
    el: '.pillars', from: 1, to: 0.3,
    l: { cam: [4.2, 6.5, -9.5], tgt: [0, 0.6, 0], ox: 0.05, oy: 0 },
    s: { dim: 0.2 },
  },
  {
    el: '.facts', from: 1, to: 0.2,
    l: { cam: [1.5, 9.5, -8.5], tgt: [0, 0.4, 0], ox: 0, oy: 0 },
    s: { dim: 0.2, lb: 0.6 },
  },
  { // acto I · dos posturas
    el: '#act-1', from: 1.05, to: 0,
    l: { cam: [0.6, 1.75, -9.6], tgt: [0, 1.12, 0], ox: 0.2, oy: 0.02 },
    p: { cam: [10.3, 2.9, -7.9], tgt: [0, 1.0, 0], ox: 0, oy: 0.2 },
    s: { b: 1, lb: 1, arcs: 0.5, sides: 1 },
  },
  {
    el: '#act-1', from: 0, to: -0.9,
    l: { cam: [-1.6, 2.3, -9.3], tgt: [0, 1.1, 0], ox: 0.2, oy: 0.02 },
    p: { cam: [9.2, 3.6, -9.2], tgt: [0, 1.0, 0], ox: 0, oy: 0.2 },
    s: { b: 1, lb: 1, arcs: 1, sides: 1 },
  },
  { // acto II · siete minutos (el suelo es un cronómetro)
    el: '#act-2', from: 1, to: 0,
    l: { cam: [0, 14.2, -5.4], tgt: [0, 0, 0], ox: 0.21, oy: 0 },
    p: { cam: [0, 33, -9], tgt: [0, 0, 0], ox: 0, oy: 0.16 },
    s: { b: 1, lb: 1, arcs: 0.25, hand: 1, time: 0.12 },
  },
  {
    el: '#act-2', from: 0, to: -0.9,
    l: { cam: [1.6, 13.4, -6.6], tgt: [0, 0, 0], ox: 0.21, oy: 0 },
    p: { cam: [3, 31, -12], tgt: [0, 0, 0], ox: 0, oy: 0.16 },
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
  { // calendario · portada: el reloj de la sala
    el: '#calendario', from: 1, to: 0,
    l: { cam: [0, 13.5, -5.2], tgt: [0, 0, 0], ox: 0.27, oy: 0.2 },
    p: { cam: [0, 30, -10], tgt: [0, 0, 0], ox: 0, oy: 0.2 },
    s: { b: 1, lb: 1, arcs: 0.2, hand: 1, time: 0.15, room: 1 },
  },
  {
    el: '.cal__layout', from: 1, to: 0.3,
    l: { cam: [0, 17, -1.8], tgt: [0, 0, 0], ox: 0, oy: 0 },
    p: { cam: [0, 34, -4], tgt: [0, 0, 0], ox: 0, oy: 0 },
    s: { b: 1, lb: 1, arcs: 0.2, hand: 1, time: 0.62, room: 1, dim: 0.16 },
  },
  { // galería · travelling a ras de suelo junto al público
    el: '#galeria', from: 1, to: 0,
    l: { cam: [-7.6, 1.55, -3.4], tgt: [0.4, 1.05, 1.4], ox: 0, oy: -0.04 },
    s: { b: 1, lb: 1, arcs: 0.6, time: 1, room: 1, dim: 0.5 },
  },
  { // publicaciones · los folios salen volando del atril
    el: '#publicaciones', from: 1, to: 0,
    l: { cam: [1.2, 1.3, -7.2], tgt: [0, 2.3, 0], ox: 0.2, oy: 0.06 },
    p: { cam: [2, 1.6, -13], tgt: [0, 2.4, 0], ox: 0, oy: 0.18 },
    s: { b: 1, lb: 1, arcs: 1, room: 1, time: 1, papers: 0.75 },
  },
  {
    el: '#posts-board', from: 1, to: 0.3,
    l: { cam: [3.2, 2.4, -8], tgt: [0, 2.6, 0], ox: 0, oy: 0 },
    s: { b: 1, lb: 1, arcs: 1, room: 1, time: 1, papers: 1, dim: 0.3 },
  },
  {
    el: '.socials', from: 1, to: 0.2,
    l: { cam: [-2.6, 5, -8.6], tgt: [0, 2.2, 0], ox: 0, oy: 0 },
    s: { b: 1, lb: 1, arcs: 0.5, room: 1, time: 1, papers: 1, dim: 0.28 },
  },
  { // únete · el atril libre
    el: '#unete', from: 1.3, to: 0.45,
    l: { cam: [4.5, 2.15, -2.9], tgt: [0.75, 1.02, 0.25], ox: 0.2, oy: 0.02 },
    p: { cam: [6.4, 2.7, -4.3], tgt: [0.85, 0.95, 0.25], ox: 0, oy: 0.36 },
    s: { b: 0, lb: 1, time: 1, room: 1, free: 1, papers: 0.3 },
  },
  {
    el: '#unete', from: 0.45, to: -0.4,
    l: { cam: [3.6, 1.85, -2.2], tgt: [0.8, 1.05, 0.25], ox: 0.2, oy: 0.02 },
    p: { cam: [5.5, 2.4, -3.6], tgt: [0.85, 0.95, 0.25], ox: 0, oy: 0.3 },
    s: { b: 0, lb: 1, time: 1, room: 1, free: 1, papers: 0.15 },
  },
  { // documentos · sobre el folio del atril
    el: '#documentos', from: 1, to: 0,
    l: { cam: [1.75, 4.6, -1.5], tgt: [0.95, 1.1, 0.05], ox: 0.27, oy: 0.14 },
    p: { cam: [3.4, 5.4, -3.6], tgt: [0.95, 1.1, 0.05], ox: 0, oy: 0.2 },
    s: { b: 0, lb: 1, room: 1, time: 1 },
  },
  {
    el: '#docs-grid', from: 1, to: 0.3,
    l: { cam: [1.9, 6.4, -1.9], tgt: [0.95, 1.1, 0.05], ox: 0, oy: 0 },
    s: { b: 0, lb: 1, room: 1, time: 1, dim: 0.16 },
  },
  { // colaboradores · la sala entera
    el: '#colaboradores', from: 1, to: 0,
    l: { cam: [0, 9, -17], tgt: [0, 0.9, 0.5], ox: 0.2, oy: 0.2 },
    p: { cam: [0, 12, -25], tgt: [0, 0.9, 0.5], ox: 0, oy: 0.18 },
    s: { b: 1, lb: 1, arcs: 1, room: 1, time: 1, hand: 1 },
  },
  {
    el: '#collab-grid', from: 1, to: 0.3,
    l: { cam: [3, 9, -13], tgt: [0, 0.6, 0.5], ox: 0, oy: 0 },
    s: { b: 1, lb: 1, arcs: 1, room: 1, time: 1, hand: 1, dim: 0.16 },
  },
];
// sin variante vertical propia: misma mirada, más lejos y centrada
SHOTS.forEach((sh) => {
  if (sh.p) return;
  const { cam, tgt } = sh.l;
  sh.p = { cam: cam.map((c, i) => tgt[i] + (c - tgt[i]) * 1.8), tgt, ox: 0, oy: 0.12 };
});

const NUM = ['ox', 'oy', 'a', 'la', 'b', 'lb', 'arcs', 'waves', 'room', 'time', 'hand', 'free', 'tagA', 'sides', 'papers', 'dim'];

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
    const t = (i / ARC_N) * Math.PI * 2; return new THREE.Vector3(-Math.sin(t) * (R + 0.14), 0.012, Math.cos(t) * (R + 0.14)); // sentido horario visto desde arriba
  }), M.goldBold);
  scene.add(timeArc);

  /* ---- los dos turnos ---- */
  const X = 1.45;
  const stationA = new THREE.Group(); stationA.position.set(-X, 0, 0); stationA.rotation.y = Math.PI / 2; scene.add(stationA);
  const stationB = new THREE.Group(); stationB.position.set(X, 0, 0); stationB.rotation.y = -Math.PI / 2; scene.add(stationB);

  const PX = coarse ? 1.05 : 1.25;
  const spA = makeHuman({ jacket: 0x14201a, shirt: 0xeef0e4, trousers: 0x1c2c24, skin: 0xe3e6d3, hair: 0x0d1511, shoes: 0x0d1511 }, { build: 'a', hair: 'short', px: PX });
  const spB = makeHuman({ jacket: 0xc7d3bb, shirt: 0x263b30, trousers: 0xa3b79f, skin: 0xeef0e4, hair: 0xd2ae62, shoes: 0x1c2c24 }, { build: 'b', hair: 'bun', px: PX });
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

  /* ---- folios: salen del atril y dan vueltas sobre la sala ---- */
  const PAPERS = coarse ? 30 : 70;
  const paperMat = new THREE.ShaderMaterial({
    uniforms: { uLight: { value: LIGHT } },
    vertexShader: /* glsl */`
      varying vec3 vW;
      void main() {
        vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uLight; varying vec3 vW;
      void main() {
        vec3 n = normalize(cross(dFdx(vW), dFdy(vW)));
        float l = abs(dot(n, uLight));
        vec3 c = vec3(0.871, 0.880, 0.790) * (l > 0.5 ? 1.0 : (l > 0.2 ? 0.86 : 0.72));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
    side: THREE.DoubleSide,
  });
  const papers = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.21, 0.297), paperMat, PAPERS);
  papers.frustumCulled = false; papers.visible = false; scene.add(papers);
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const flock = Array.from({ length: PAPERS }, (_, i) => ({
    a: rnd() * 6.283, r: 0.9 + rnd() * 3.6, h: 0.5 + rnd() * 3.9, sp: 0.18 + rnd() * 0.4, ph: rnd() * 6.283, d: (i / PAPERS) * 0.55,
  }));
  const dummy = new THREE.Object3D();
  const DESK = new THREE.Vector3(-X + 0.52, 1.16, 0);
  function flyPapers(amount, t) {
    papers.visible = amount > 0.004;
    if (!papers.visible) return;
    for (let i = 0; i < PAPERS; i++) {
      const f = flock[i];
      const q = clamp01(amount * 1.55 - f.d);
      const e = 1 - Math.pow(1 - q, 3);
      const ang = f.a + e * 2.4 + t * f.sp * 0.3;
      dummy.position.set(
        lerp(DESK.x, Math.cos(ang) * f.r, e),
        DESK.y + e * f.h + Math.sin(t * 0.7 + f.ph) * 0.14 * e,
        lerp(DESK.z, Math.sin(ang) * f.r * 0.85, e),
      );
      dummy.rotation.set(f.ph + t * f.sp + e * 5, f.a + t * f.sp * 0.7, e * 3 + f.ph);
      dummy.scale.setScalar(smooth(0, 0.14, q));
      dummy.updateMatrix();
      papers.setMatrixAt(i, dummy.matrix);
    }
    papers.instanceMatrix.needsUpdate = true;
  }

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
      const k = i + ri * 2;
      const s = makeHuman({
        jacket: [0x22362c, 0x1a2a22, 0x2a4135][k % 3], shirt: 0x6c8a78, trousers: 0x14201a, skin: 0xa4b9a8,
        hair: [0x14201a, 0x6c8a78, 0x1c2c24][k % 3], shoes: 0x14201a,
      }, { build: k % 2 ? 'a' : 'b', hair: ['bob', 'short', 'bun', 'short'][k % 4], seated: true, line: C.lineDim, px: 0.9, base: y });
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
    const s = makeHuman({ jacket: [0x1c2c24, 0x26392f, 0x1c2c24][i], shirt: 0xcfd8c4, trousers: 0x14201a, skin: 0xd5dcc8, hair: [0x0d1511, 0xd2ae62, 0x6c8a78][i], shoes: 0x14201a },
      { build: i === 1 ? 'b' : 'a', hair: i === 1 ? 'bob' : 'short', seated: true, line: C.line, px: 1.0 });
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
    hullRes.value.set(W, H);
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
  let active = true; let raf = 0; let time = 0; let lastDim = -1;
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

    // folios
    flyPapers(cur.papers, time);

    // en los tramos con mucho contenido la escena se atenúa y queda de fondo
    if (Math.abs(cur.dim - lastDim) > 0.004) { lastDim = cur.dim; canvas.style.opacity = cur.dim.toFixed(3); }

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
      if (key === 'sides') return smooth(0.5, 1, cur.sides) * smooth(0.4, 0.9, cur.b);
      if (key === 'tagA') return cur.tagA * smooth(0.85, 1, boot);
      return smooth(0.6, 1, cur[key]) * smooth(0.6, 1, cur.dim);
    });
  }

  resize();
  window.addEventListener('resize', resize);
  if (!coarse) {
    window.addEventListener('pointermove', (e) => {
      pointer.x = (e.clientX / W) * 2 - 1; pointer.y = (e.clientY / H) * 2 - 1;
    }, { passive: true });
  }

  // se renderiza durante todo el viaje; solo descansa en los logos y el pie
  const seen = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
    active = seen.size > 0;
  }, { rootMargin: '25% 0px' });
  document.querySelectorAll('main > section:not(.partners)').forEach((el) => io.observe(el));

  frame();

  return {
    /** progreso 0→1 de la entrada: dibuja suelo, atril y orador */
    setBoot(val) { boot = val; },
    /** fuerza un fotograma (depuración o capturas); snap = sin suavizado */
    step(dt = 0.016, snap = false) { if (snap) first = true; tick(dt); },
    destroy() { cancelAnimationFrame(raf); io.disconnect(); renderer.dispose(); },
  };
}
