/**
 * Pure maths behind the 3-D animated labs (real, complex and vector). Nothing here touches React or the DOM.
 */

/* ---- Real analysis: double Riemann sums ---------------------------------------------------- */
export const RULES_2D = [
  { key: "lower", label: "Lower sum (min)" },
  { key: "left", label: "Lower-left corner" },
  { key: "mid", label: "Midpoint" },
  { key: "right", label: "Upper-right corner" },
  { key: "upper", label: "Upper sum (max)" },
];

/** Riemann sum of f(x, y) over [ax,bx]×[ay,by] with an n×n grid. Returns {sum, heights[j][i], dx, dy}. */
export function riemann2D(f, ax, bx, ay, by, n, rule) {
  const dx = (bx - ax) / n, dy = (by - ay) / n;
  let sum = 0;
  const heights = [];
  for (let j = 0; j < n; j++) {
    const row = [];
    for (let i = 0; i < n; i++) {
      const x0 = ax + i * dx, y0 = ay + j * dy;
      let h;
      if (rule === "left") h = f(x0, y0);
      else if (rule === "right") h = f(x0 + dx, y0 + dy);
      else if (rule === "mid") h = f(x0 + dx / 2, y0 + dy / 2);
      else {
        h = rule === "lower" ? Infinity : -Infinity;
        const m = 4;
        for (let b = 0; b <= m; b++) for (let a = 0; a <= m; a++) {
          const v = f(x0 + (a / m) * dx, y0 + (b / m) * dy);
          if (Number.isFinite(v)) h = rule === "lower" ? Math.min(h, v) : Math.max(h, v);
        }
        if (!Number.isFinite(h)) h = 0;
      }
      if (!Number.isFinite(h)) h = 0;
      row.push(h);
      sum += h * dx * dy;
    }
    heights.push(row);
  }
  return { sum, heights, dx, dy };
}
/** Reference value of the double integral (fine midpoint grid). */
export const integral2D = (f, ax, bx, ay, by, n = 160) => riemann2D(f, ax, bx, ay, by, n, "mid").sum;

/* ---- Real analysis: Fourier partial sums (Gibbs phenomenon) --------------------------------- */
export const WAVES = [
  { key: "square", label: "Square wave" },
  { key: "sawtooth", label: "Sawtooth" },
  { key: "triangle", label: "Triangle wave" },
];
/** The 2π-periodic target on (−π, π]. All three have amplitude 1. */
export function waveTarget(kind, x) {
  const t = ((((x + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
  if (kind === "square") return t === 0 ? 0 : t > 0 ? 1 : -1;
  if (kind === "sawtooth") return t / Math.PI;
  return 1 - (2 * Math.abs(t)) / Math.PI;
}
/** Partial Fourier sum with harmonics k = 1 … N. */
export function fourierPartial(kind, N, x) {
  let s = 0;
  for (let k = 1; k <= N; k++) {
    if (kind === "square") { if (k % 2) s += (4 / Math.PI) * Math.sin(k * x) / k; }
    else if (kind === "sawtooth") s += (2 / Math.PI) * (k % 2 ? 1 : -1) * Math.sin(k * x) / k;
    else if (k % 2) s += (8 / (Math.PI * Math.PI)) * Math.cos(k * x) / (k * k);
  }
  return s;
}
/** Max of S_N over a period minus the target's top value (overshoot) and the RMS (L²) error. */
export function waveErrors(kind, N, samples = 0) {
  samples = Math.max(samples, 2400, 120 * N); // the Gibbs peak is only ~π/N wide
  let mx = -Infinity, se = 0;
  for (let i = 0; i < samples; i++) {
    const x = -Math.PI + ((i + 0.5) / samples) * 2 * Math.PI;
    const s = fourierPartial(kind, N, x);
    mx = Math.max(mx, s);
    se += Math.pow(s - waveTarget(kind, x), 2);
  }
  return { max: mx, overshoot: mx - 1, rms: Math.sqrt(se / samples) };
}

/* ---- Complex analysis ------------------------------------------------------------------------ */
/** Stereographic projection of z onto the unit Riemann sphere (north pole = ∞). */
export function stereo(z) {
  const r2 = z[0] * z[0] + z[1] * z[1], d = 1 + r2;
  return [(2 * z[0]) / d, (2 * z[1]) / d, (r2 - 1) / d];
}
/**
 * Points of the multi-valued surfaces: returns {x, y, h, w} for polar coordinates (r, θ), with θ allowed to run
 * past 2π so that all sheets are visited. h is the plotted height (Im of the multi-valued function).
 */
export function branchPoint(kind, r, th) {
  const x = r * Math.cos(th), y = r * Math.sin(th);
  if (kind === "sqrt") { const s = Math.sqrt(r); return { x, y, h: s * Math.sin(th / 2), w: [s * Math.cos(th / 2), s * Math.sin(th / 2)] }; }
  if (kind === "cbrt") { const s = Math.cbrt(r); return { x, y, h: s * Math.sin(th / 3), w: [s * Math.cos(th / 3), s * Math.sin(th / 3)] }; }
  const lr = Math.log(Math.max(r, 1e-9)); // log z
  return { x, y, h: th, w: [lr, th] };
}
export const BRANCHES = [
  { key: "sqrt", label: "√z — two sheets", turns: 4 * Math.PI, note: "Going once round the origin lands you on the other sheet; two turns bring you back. z = 0 is a branch point." },
  { key: "cbrt", label: "∛z — three sheets", turns: 6 * Math.PI, note: "Three sheets, glued cyclically at the branch point z = 0." },
  { key: "log", label: "log z — infinitely many sheets", turns: 6 * Math.PI, note: "The height is Im log z = θ: a helicoid with no top or bottom — every turn is a new sheet." },
];

/* ---- Vector spaces: 3×3 linear algebra ------------------------------------------------------- */
export const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
export const mulMV = (A, v) => [A[0][0] * v[0] + A[0][1] * v[1] + A[0][2] * v[2], A[1][0] * v[0] + A[1][1] * v[1] + A[1][2] * v[2], A[2][0] * v[0] + A[2][1] * v[1] + A[2][2] * v[2]];
export const det3 = (A) => A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
export const trace3 = (A) => A[0][0] + A[1][1] + A[2][2];
export const blend3 = (A, t) => A.map((row, i) => row.map((v, j) => (1 - t) * (i === j ? 1 : 0) + t * v));
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);

/** Real eigenvalues/eigenvectors of a 3×3 matrix (cubic by Cardano/trig + null-space by cross products). */
export function eigen3(A) {
  const tr = trace3(A);
  const c2 = (A[0][0] * A[1][1] - A[0][1] * A[1][0]) + (A[0][0] * A[2][2] - A[0][2] * A[2][0]) + (A[1][1] * A[2][2] - A[1][2] * A[2][1]);
  const d = det3(A);
  // λ³ − tr λ² + c2 λ − d = 0 → depressed cubic t³ + p t + q = 0 with λ = t + tr/3
  const p = c2 - (tr * tr) / 3, q = (-2 * tr * tr * tr) / 27 + (tr * c2) / 3 - d;
  const disc = -(4 * p * p * p + 27 * q * q);
  let roots = [];
  if (Math.abs(p) < 1e-12 && Math.abs(q) < 1e-12) roots = [0, 0, 0];
  else if (disc >= -1e-9) {
    const m = 2 * Math.sqrt(Math.max(0, -p / 3));
    const arg = Math.max(-1, Math.min(1, ((3 * q) / (p * m)) || 0));
    const th = Math.acos(arg) / 3;
    roots = [0, 1, 2].map((k) => m * Math.cos(th - (2 * Math.PI * k) / 3));
  } else {
    const D = (q * q) / 4 + (p * p * p) / 27;
    const u = Math.cbrt(-q / 2 + Math.sqrt(D)), v = Math.cbrt(-q / 2 - Math.sqrt(D));
    const t1 = u + v;
    const re = -t1 / 2, im = ((u - v) * Math.sqrt(3)) / 2;
    const lam = [t1 + tr / 3, re + tr / 3];
    return { real: [makeEig(A, lam[0])].filter(Boolean), complex: { re: lam[1], im: Math.abs(im) }, values: [lam[0]] };
  }
  const lams = roots.map((t) => t + tr / 3).sort((a, b) => b - a);
  const real = [];
  for (const l of lams) {
    const e = makeEig(A, l);
    if (e && !real.some((r) => Math.abs(r.value - l) < 1e-6)) real.push(e);
    else if (!e && !real.some((r) => Math.abs(r.value - l) < 1e-6)) real.push({ value: l, vec: null });
  }
  return { real, complex: null, values: lams };
}
function makeEig(A, l) {
  const M = A.map((row, i) => row.map((v, j) => v - (i === j ? l : 0)));
  const cands = [cross(M[0], M[1]), cross(M[0], M[2]), cross(M[1], M[2])];
  let best = cands[0];
  for (const c of cands) if (len(c) > len(best)) best = c;
  const n = len(best);
  if (n < 1e-7) return null; // degenerate (repeated eigenvalue): no unique direction from this method
  return { value: l, vec: best.map((c) => c / n) };
}

/** RK4 step of x' = F(x) in 3-D. F: (x,y,z) → [dx,dy,dz]. */
export function rk4step3(F, p, h) {
  const k1 = F(p[0], p[1], p[2]);
  const k2 = F(p[0] + 0.5 * h * k1[0], p[1] + 0.5 * h * k1[1], p[2] + 0.5 * h * k1[2]);
  const k3 = F(p[0] + 0.5 * h * k2[0], p[1] + 0.5 * h * k2[1], p[2] + 0.5 * h * k2[2]);
  const k4 = F(p[0] + h * k3[0], p[1] + h * k3[1], p[2] + h * k3[2]);
  return [p[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), p[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]), p[2] + (h / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2])];
}
/** Divergence and curl of a 3-D field at a point (central differences). */
export function divCurl3(F, p, h = 1e-4) {
  const d = (i, axis) => {
    const a = [...p], b = [...p]; a[axis] += h; b[axis] -= h;
    const fa = F(a[0], a[1], a[2]), fb = F(b[0], b[1], b[2]);
    return (fa[i] - fb[i]) / (2 * h);
  };
  const J = [[d(0, 0), d(0, 1), d(0, 2)], [d(1, 0), d(1, 1), d(1, 2)], [d(2, 0), d(2, 1), d(2, 2)]];
  return { J, div: J[0][0] + J[1][1] + J[2][2], curl: [J[2][1] - J[1][2], J[0][2] - J[2][0], J[1][0] - J[0][1]] };
}
