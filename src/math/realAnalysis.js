/**
 * math/realAnalysis.js
 * -----------------------------------------------------------------------
 * Numerical companions to the core ideas of real analysis: limits of
 * sequences (ε–N), series convergence, continuity (ε–δ), the Riemann /
 * Darboux integral, and Taylor approximation.
 * -----------------------------------------------------------------------
 */

/* ---- Sequences ------------------------------------------------------------------------- */
export const SEQUENCES = [
  { key: "inv", label: "aₙ = 1/n", a: (n) => 1 / n, limit: 0 },
  { key: "altinv", label: "aₙ = (−1)ⁿ/n", a: (n) => (n % 2 ? -1 : 1) / n, limit: 0 },
  { key: "ratio", label: "aₙ = (3n+1)/(n+2)", a: (n) => (3 * n + 1) / (n + 2), limit: 3 },
  { key: "euler", label: "aₙ = (1 + 1/n)ⁿ", a: (n) => Math.pow(1 + 1 / n, n), limit: Math.E },
  { key: "sinc", label: "aₙ = n·sin(1/n)", a: (n) => n * Math.sin(1 / n), limit: 1 },
  { key: "root", label: "aₙ = n^(1/n)", a: (n) => Math.pow(n, 1 / n), limit: 1 },
  {
    key: "fact", label: "aₙ = 2ⁿ/n!",
    a: (n) => { let v = 1; for (let k = 1; k <= n; k++) v *= 2 / k; return v; }, limit: 0,
  },
  { key: "osc", label: "aₙ = (−1)ⁿ  (diverges)", a: (n) => (n % 2 ? -1 : 1), limit: null },
];

/**
 * Smallest N such that |aₙ − L| < ε for every n in [N, horizon].
 * Returns null when some term near the horizon still violates the bound (no N found in range).
 */
export function findN(seq, L, eps, horizon = 2000) {
  if (L === null || !(eps > 0)) return null;
  let lastBad = 0;
  for (let n = 1; n <= horizon; n++) {
    if (!(Math.abs(seq(n) - L) < eps)) lastBad = n;
  }
  return lastBad >= horizon ? null : lastBad + 1;
}

/* ---- Series ---------------------------------------------------------------------------- */
// `start` is the first index; `sum` is the exact value when the series converges (null if it diverges).
export const SERIES = [
  { key: "geo", label: "Σ (½)ⁿ , n ≥ 1", start: 1, term: (n) => Math.pow(0.5, n), sum: 1, kind: "absolute" },
  { key: "geoalt", label: "Σ (−0.8)ⁿ , n ≥ 1", start: 1, term: (n) => Math.pow(-0.8, n), sum: -0.8 / 1.8, kind: "absolute" },
  { key: "basel", label: "Σ 1/n² (Basel)", start: 1, term: (n) => 1 / (n * n), sum: (Math.PI * Math.PI) / 6, kind: "absolute" },
  { key: "fact", label: "Σ 1/n! , n ≥ 1", start: 1, term: (n) => { let f = 1; for (let k = 2; k <= n; k++) f /= k; return f; }, sum: Math.E - 1, kind: "absolute" },
  { key: "tele", label: "Σ 1/(n(n+1)) (telescoping)", start: 1, term: (n) => 1 / (n * (n + 1)), sum: 1, kind: "absolute" },
  { key: "n2n", label: "Σ n/2ⁿ", start: 1, term: (n) => n / Math.pow(2, n), sum: 2, kind: "absolute" },
  { key: "althar", label: "Σ (−1)ⁿ⁺¹/n (alternating harmonic)", start: 1, term: (n) => (n % 2 ? 1 : -1) / n, sum: Math.LN2, kind: "conditional" },
  { key: "leibniz", label: "Σ (−1)ⁿ/(2n+1) , n ≥ 0 (Leibniz)", start: 0, term: (n) => (n % 2 ? -1 : 1) / (2 * n + 1), sum: Math.PI / 4, kind: "conditional" },
  { key: "harm", label: "Σ 1/n (harmonic)", start: 1, term: (n) => 1 / n, sum: null, kind: "divergent" },
  { key: "psqrt", label: "Σ 1/√n (p = ½)", start: 1, term: (n) => 1 / Math.sqrt(n), sum: null, kind: "divergent" },
];

/** Partial sums S_start … S_(start+count−1). */
export function partialSums(series, count) {
  const out = [];
  let s = 0;
  for (let i = 0; i < count; i++) {
    s += series.term(series.start + i);
    out.push(s);
  }
  return out;
}

/** Ratio-test and root-test statistics evaluated at index n. */
export function seriesTests(series, n) {
  const a0 = series.term(n), a1 = series.term(n + 1);
  const ratio = a0 === 0 ? 0 : Math.abs(a1 / a0);
  const root = Math.pow(Math.abs(a0), 1 / Math.max(1, n));
  return { ratio, root };
}

export function ratioVerdict(rho) {
  if (rho < 0.97) return "ρ < 1 → converges absolutely";
  if (rho > 1.03) return "ρ > 1 → diverges";
  return "ρ ≈ 1 → inconclusive (try another test)";
}

/* ---- Continuity (ε–δ) -------------------------------------------------------------------- */
export const EPS_DELTA = [
  { key: "sq", label: "f(x) = x²", f: (x) => x * x, limitAt: (a) => a * a, a: [-2, 2, 1] },
  { key: "sinc", label: "f(x) = sin x / x  (removable at 0)", f: (x) => Math.sin(x) / x, limitAt: (a) => (a === 0 ? 1 : Math.sin(a) / a), a: [-3, 3, 0] },
  { key: "inv", label: "f(x) = 1/x  (not uniformly continuous)", f: (x) => 1 / x, limitAt: (a) => 1 / a, a: [0.2, 3, 1] },
  { key: "step", label: "f(x) = sgn x  (jump at 0)", f: (x) => (x < 0 ? -1 : 1), limitAt: (a) => (a < 0 ? -1 : 1), a: [-2, 2, 0.5], jumpAt: 0 },
  { key: "xsin", label: "f(x) = x·sin(1/x)", f: (x) => (x === 0 ? 0 : x * Math.sin(1 / x)), limitAt: (a) => (a === 0 ? 0 : a * Math.sin(1 / a)), a: [-1, 1, 0] },
];

/**
 * Largest δ (to grid resolution) with |f(x) − L| < ε whenever 0 < |x − a| < δ.
 * Returns {delta, resolved} — `resolved` is false when no positive δ was found at the sampling resolution
 * (the limit does not exist or does not equal L).
 */
export function findDelta(f, a, L, eps, maxDelta = 2, samples = 4000) {
  const h = maxDelta / samples;
  for (let k = 1; k <= samples; k++) {
    const d = k * h;
    const left = f(a - d), right = f(a + d);
    const bad = (v) => !Number.isFinite(v) || Math.abs(v - L) >= eps;
    if (bad(left) || bad(right)) {
      return k === 1 ? { delta: 0, resolved: false } : { delta: (k - 1) * h, resolved: true };
    }
  }
  return { delta: maxDelta, resolved: true };
}

/* ---- Riemann / Darboux integral ------------------------------------------------------------ */
export const INTEGRANDS = [
  { key: "sq", label: "f(x) = x²", f: (x) => x * x, F: (x) => (x * x * x) / 3, range: [0, 3] },
  { key: "sin", label: "f(x) = sin x", f: Math.sin, F: (x) => -Math.cos(x), range: [0, Math.PI] },
  { key: "exp", label: "f(x) = eˣ", f: Math.exp, F: Math.exp, range: [0, 2] },
  { key: "lorentz", label: "f(x) = 1/(1 + x²)", f: (x) => 1 / (1 + x * x), F: Math.atan, range: [-3, 3] },
  { key: "sqrt", label: "f(x) = √x", f: Math.sqrt, F: (x) => (2 / 3) * Math.pow(x, 1.5), range: [0, 4] },
];

export const RULES = [
  { key: "left", label: "Left" },
  { key: "right", label: "Right" },
  { key: "mid", label: "Midpoint" },
  { key: "trap", label: "Trapezoid" },
  { key: "lower", label: "Lower (Darboux L)" },
  { key: "upper", label: "Upper (Darboux U)" },
];

/**
 * Build a uniform partition of [a, b] into n pieces and evaluate the chosen sum.
 * `bars` holds, for each piece, the rectangle (or trapezoid) heights so the lab can draw it.
 */
export function riemann(f, a, b, n, rule) {
  const dx = (b - a) / n;
  let sum = 0;
  const bars = [];
  for (let i = 0; i < n; i++) {
    const x0 = a + i * dx, x1 = x0 + dx;
    let h0, h1;
    if (rule === "left") { h0 = h1 = f(x0); }
    else if (rule === "right") { h0 = h1 = f(x1); }
    else if (rule === "mid") { h0 = h1 = f((x0 + x1) / 2); }
    else if (rule === "trap") { h0 = f(x0); h1 = f(x1); }
    else {
      // Darboux: inf / sup over the sub-interval, sampled finely (exact for the monotone/unimodal integrands used here)
      let lo = Infinity, hi = -Infinity;
      const m = 24;
      for (let k = 0; k <= m; k++) {
        const v = f(x0 + (dx * k) / m);
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
      h0 = h1 = rule === "lower" ? lo : hi;
    }
    sum += ((h0 + h1) / 2) * dx;
    bars.push({ x0, x1, h0, h1 });
  }
  return { sum, bars, dx };
}

/* ---- Taylor series --------------------------------------------------------------------------- */
const fact = (n) => { let v = 1; for (let k = 2; k <= n; k++) v *= k; return v; };
export const TAYLOR = [
  { key: "sin", label: "sin x", f: Math.sin, coef: (n) => (n % 2 ? (((n - 1) / 2) % 2 ? -1 : 1) / fact(n) : 0), R: Infinity, M: () => 1 },
  { key: "cos", label: "cos x", f: Math.cos, coef: (n) => (n % 2 ? 0 : ((n / 2) % 2 ? -1 : 1) / fact(n)), R: Infinity, M: () => 1 },
  { key: "exp", label: "eˣ", f: Math.exp, coef: (n) => 1 / fact(n), R: Infinity, M: (x) => Math.exp(Math.abs(x)) },
  { key: "ln", label: "ln(1 + x)", f: (x) => Math.log(1 + x), coef: (n) => (n === 0 ? 0 : (n % 2 ? 1 : -1) / n), R: 1 },
  { key: "geom", label: "1/(1 − x)", f: (x) => 1 / (1 - x), coef: () => 1, R: 1 },
  { key: "atan", label: "arctan x", f: Math.atan, coef: (n) => (n % 2 ? (((n - 1) / 2) % 2 ? -1 : 1) / n : 0), R: 1 },
];

export function taylorPoly(def, N, x) {
  let s = 0, p = 1;
  for (let n = 0; n <= N; n++) {
    s += def.coef(n) * p;
    p *= x;
  }
  return s;
}

/** Lagrange remainder bound M·|x|^(N+1)/(N+1)!, when the derivative bound M is known. */
export function lagrangeBound(def, N, x) {
  if (!def.M) return null;
  return (def.M(x) * Math.pow(Math.abs(x), N + 1)) / fact(N + 1);
}
