/**
 * math/complex.js
 * -----------------------------------------------------------------------
 * Small complex-number toolkit. A complex number is a plain pair [re, im],
 * which keeps hot loops (domain colouring, fractals) allocation-light.
 * -----------------------------------------------------------------------
 */
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const scale = (a, k) => [a[0] * k, a[1] * k];
export const conj = (a) => [a[0], -a[1]];
export const abs = (a) => Math.hypot(a[0], a[1]);
export const arg = (a) => Math.atan2(a[1], a[0]);
export const fromPolar = (r, th) => [r * Math.cos(th), r * Math.sin(th)];

export function div(a, b) {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
}
export const inv = (a) => div([1, 0], a);

export function exp(z) {
  const e = Math.exp(z[0]);
  return [e * Math.cos(z[1]), e * Math.sin(z[1])];
}
export const log = (z) => [Math.log(abs(z)), arg(z)]; // principal branch
export const sin = (z) => [Math.sin(z[0]) * Math.cosh(z[1]), Math.cos(z[0]) * Math.sinh(z[1])];
export const cos = (z) => [Math.cos(z[0]) * Math.cosh(z[1]), -Math.sin(z[0]) * Math.sinh(z[1])];

/** Integer power by repeated multiplication (exact for the sizes used here, no polar rounding). */
export function powInt(z, n) {
  if (n === 0) return [1, 0];
  if (n < 0) return inv(powInt(z, -n));
  let out = [1, 0];
  let base = z;
  let k = n;
  while (k > 0) {
    if (k & 1) out = mul(out, base);
    base = mul(base, base);
    k >>= 1;
  }
  return out;
}

/** The n distinct n-th roots of w (principal root first). Roots of 0 are all 0. */
export function nthRoots(w, n) {
  const r = Math.pow(abs(w), 1 / n);
  const th = arg(w);
  return Array.from({ length: n }, (_, k) => fromPolar(r, (th + 2 * Math.PI * k) / n));
}

/** "a + bi" with clean signs; tiny parts are snapped to zero so −0.000 never shows. */
export function formatC(z, digits = 3) {
  const snap = (v) => (Math.abs(v) < 0.5 * Math.pow(10, -digits) ? 0 : v);
  const re = snap(z[0]);
  const im = snap(z[1]);
  if (!Number.isFinite(re) || !Number.isFinite(im)) return "—";
  const r = re.toFixed(digits);
  const i = Math.abs(im).toFixed(digits);
  return `${r} ${im < 0 ? "−" : "+"} ${i}i`.replace("-", "−");
}

export function formatPolar(z, digits = 3) {
  const r = abs(z);
  if (!Number.isFinite(r)) return "—";
  if (r < 1e-12) return "0";
  return `${r.toFixed(digits)} ∠ ${((arg(z) * 180) / Math.PI).toFixed(1)}°`;
}

/* ---- Conformal-mapping catalogue (analytic f with its derivative f') ---------------------- */
export const MAPPINGS = [
  { key: "square", label: "w = z²", f: (z) => mul(z, z), df: (z) => scale(z, 2), note: "doubles every angle at the origin (not conformal at z = 0)" },
  { key: "cube", label: "w = z³", f: (z) => powInt(z, 3), df: (z) => scale(powInt(z, 2), 3), note: "triples angles about the origin" },
  { key: "inverse", label: "w = 1/z", f: (z) => inv(z), df: (z) => scale(inv(mul(z, z)), -1), note: "inversion: circles and lines map to circles and lines" },
  { key: "exp", label: "w = eᶻ", f: exp, df: exp, note: "vertical lines → circles, horizontal lines → rays" },
  { key: "sin", label: "w = sin z", f: sin, df: cos, note: "maps the strip |Re z| < π/2 onto the plane minus two slits" },
  {
    key: "joukowski", label: "w = z + 1/z",
    f: (z) => add(z, inv(z)), df: (z) => sub([1, 0], inv(mul(z, z))),
    note: "Joukowski map: the unit circle collapses onto the segment [−2, 2]",
  },
  {
    key: "mobius", label: "w = (z−1)/(z+1)",
    f: (z) => div(sub(z, [1, 0]), add(z, [1, 0])), df: (z) => scale(inv(mul(add(z, [1, 0]), add(z, [1, 0]))), 2),
    note: "Möbius transformation: sends the right half-plane to the unit disc",
  },
];

/* ---- Domain-colouring catalogue ---------------------------------------------------------- */
const roots3 = (z) => sub(powInt(z, 3), [1, 0]);
export const COLOR_FUNCTIONS = [
  { key: "z3m1", label: "z³ − 1", f: roots3, note: "three zeros at the cube roots of unity; the hue wheel winds once around each zero" },
  { key: "ratio", label: "(z − 1)/(z² + z + 1)", f: (z) => div(sub(z, [1, 0]), add(add(mul(z, z), z), [1, 0])), note: "one zero, two poles (the primitive cube roots of unity)" },
  { key: "sin", label: "sin z", f: sin, note: "zeros at every integer multiple of π; |sin z| grows exponentially off the real axis" },
  { key: "exp", label: "eᶻ", f: exp, note: "no zeros or poles; the colours repeat every 2π in the imaginary direction" },
  { key: "inv2", label: "1/(z² + 1)", f: (z) => inv(add(mul(z, z), [1, 0])), note: "poles at ±i — the bright vortices" },
  { key: "z", label: "z (identity)", f: (z) => z, note: "pure argument wheel: hue = arg z, brightness bands = log|z|" },
];

/** Hue from argument, brightness bands from log-modulus. Returns [r,g,b] 0–255 on a light palette. */
export function domainColor(w) {
  const m = Math.hypot(w[0], w[1]);
  if (!Number.isFinite(m)) return [255, 255, 255];
  const h = ((Math.atan2(w[1], w[0]) / (2 * Math.PI)) + 1) % 1;
  const band = Math.log2(m + 1e-12);
  const frac = band - Math.floor(band);
  const l = 0.55 + 0.25 * (1 - frac) - (m > 1e6 ? 0.3 : 0);
  const s = 0.75;
  return hslToRgb(h, s, Math.min(0.95, Math.max(0.2, l)));
}

export function hslToRgb(h, s, l) {
  const f = (n) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

/** Escape-time iteration for z ← z² + c. Returns a smooth iteration count, or `max` if bounded. */
export function escapeTime(z0, c, max) {
  let x = z0[0], y = z0[1];
  for (let i = 0; i < max; i++) {
    const x2 = x * x, y2 = y * y;
    if (x2 + y2 > 256) return i + 1 - Math.log2(Math.log(x2 + y2) / 2);
    y = 2 * x * y + c[1];
    x = x2 - y2 + c[0];
  }
  return max;
}
