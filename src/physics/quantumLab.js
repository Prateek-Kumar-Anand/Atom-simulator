/**
 * physics/quantumLab.js
 * -----------------------------------------------------------------------
 * Numerical models for the additional quantum experiments:
 *   • particle in an infinite box        • quantum harmonic oscillator
 *   • 1-D wave-packet scattering (split-operator FFT Schrödinger solver)
 *   • spin-½ / qubit (Bloch sphere, Stern–Gerlach chains)
 *   • hydrogen-atom orbitals            • Mach–Zehnder interferometer
 *
 * Units for the electron experiments: lengths in nm, energies in eV, times in fs.
 *   ħ = 0.658212 eV·fs,   ħ²/2mₑ = 0.0380998 eV·nm²
 * -----------------------------------------------------------------------
 */
export const HBAR_EV_FS = 0.6582119569; // ħ in eV·fs
export const HB2M = 0.0380998212; // ħ²/(2 mₑ) in eV·nm²
export const A0_NM = 0.0529177210903; // Bohr radius in nm
export const HC_EV_NM = 1239.84198;
export const RYDBERG_EV = 13.605693;

/* ---- Particle in an infinite box ---------------------------------------------------------- */
export const boxEnergy = (n, Lnm) => (n * n * Math.PI * Math.PI * HB2M) / (Lnm * Lnm);
export const boxPsi = (n, L, x) => (x < 0 || x > L ? 0 : Math.sqrt(2 / L) * Math.sin((n * Math.PI * x) / L));
/** P(0 < x < f·L) for eigenstate n (closed form). */
export const boxProbLeft = (n, f) => f - Math.sin(2 * n * Math.PI * f) / (2 * n * Math.PI);
/** ⟨n₁|x|n₂⟩ for n₁ ≠ n₂ (zero unless n₁ + n₂ is odd). */
export function boxMatrixX(n1, n2, L) {
  if (n1 === n2) return L / 2;
  if ((n1 + n2) % 2 === 0) return 0;
  return (-8 * L * n1 * n2) / (Math.PI * Math.PI * Math.pow(n1 * n1 - n2 * n2, 2));
}
/** Density of cos α |n₁⟩ + sin α |n₂⟩ at time t (fs). */
export function boxSuperDensity(n1, n2, alpha, L, x, tFs) {
  const a = Math.cos(alpha), b = Math.sin(alpha);
  const dw = (boxEnergy(n2, L) - boxEnergy(n1, L)) / HBAR_EV_FS; // rad / fs
  const p1 = boxPsi(n1, L, x), p2 = boxPsi(n2, L, x);
  return a * a * p1 * p1 + b * b * p2 * p2 + 2 * a * b * p1 * p2 * Math.cos(dw * tFs);
}

/* ---- Quantum harmonic oscillator ---------------------------------------------------------- */
/** Normalised eigenfunction ψₙ(ξ) with ξ = x/a, a = √(ħ/mω). Stable three-term recurrence. */
export function hoPsi(n, xi) {
  let p0 = Math.pow(Math.PI, -0.25) * Math.exp(-xi * xi / 2);
  if (n === 0) return p0;
  let p1 = Math.SQRT2 * xi * p0;
  for (let k = 1; k < n; k++) {
    const p2 = Math.sqrt(2 / (k + 1)) * xi * p1 - Math.sqrt(k / (k + 1)) * p0;
    p0 = p1; p1 = p2;
  }
  return p1;
}
export const hoTurningPoint = (n) => Math.sqrt(2 * n + 1);
/** Classical probability density for the same energy (in ξ), zero outside the turning points. */
export function hoClassicalDensity(n, xi) {
  const t = hoTurningPoint(n);
  return Math.abs(xi) < t ? 1 / (Math.PI * Math.sqrt(t * t - xi * xi)) : 0;
}
/** Probability of finding the particle in the classically forbidden region |ξ| > √(2n+1). */
export function hoForbiddenProbability(n, steps = 4000) {
  const t = hoTurningPoint(n), hi = t + 8, h = (hi - t) / steps;
  let s = 0;
  for (let i = 0; i < steps; i++) { const x = t + (i + 0.5) * h; s += Math.pow(hoPsi(n, x), 2) * h; }
  return 2 * s;
}
/** Length scale a = √(ħ/mω) for an electron, with ħω in eV → nm. */
export const hoLength = (hbarOmegaEV) => Math.sqrt((2 * HB2M) / hbarOmegaEV);

/* ---- FFT + split-operator Schrödinger solver ---------------------------------------------- */
export function fft(re, im, inverse = false) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inverse ? 2 : -2) * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = i + k + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti;
        re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
  if (inverse) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}

export const POTENTIALS = [
  { key: "free", label: "Free space" },
  { key: "barrier", label: "Rectangular barrier" },
  { key: "step", label: "Potential step" },
  { key: "well", label: "Square well" },
  { key: "double", label: "Double barrier (resonant tunnelling)" },
  { key: "harmonic", label: "Harmonic trap" },
];

/** Potential energy V(x) in eV for the chosen preset, centred on x = 0. V0 in eV, w in nm. */
export function makePotential(key, V0, w) {
  switch (key) {
    case "barrier": return (x) => (Math.abs(x) <= w / 2 ? V0 : 0);
    case "step": return (x) => (x >= 0 ? V0 : 0);
    case "well": return (x) => (Math.abs(x) <= w / 2 ? -V0 : 0);
    case "double": { const gap = 1.0; return (x) => (Math.abs(Math.abs(x) - (gap + w) / 2) <= w / 2 ? V0 : 0); }
    case "harmonic": return (x) => V0 * Math.pow(x / 5, 2); // V0 = potential energy 5 nm from the centre
    default: return () => 0;
  }
}

/**
 * Split-operator solver:  ψ ← e^{−iVΔt/2ħ} F⁻¹ e^{−iħk²Δt/2m} F e^{−iVΔt/2ħ} ψ.
 * Unconditionally unitary; edges have a weak absorbing mask whose lost probability is tallied per side.
 */
export function createPacketSim({ N = 1024, L = 60, V = () => 0, x0 = -15, sigma = 1.5, energyEV = 1, dtFs = 0.1 }) {
  const dx = L / N;
  const x = Float64Array.from({ length: N }, (_, i) => -L / 2 + (i + 0.5) * dx);
  const Varr = Float64Array.from(x, V);
  const k0 = Math.sqrt(Math.max(energyEV, 0) / HB2M);
  const re = new Float64Array(N), im = new Float64Array(N);
  const amp = Math.pow(2 * Math.PI * sigma * sigma, -0.25);
  for (let i = 0; i < N; i++) {
    const env = amp * Math.exp(-Math.pow(x[i] - x0, 2) / (4 * sigma * sigma));
    re[i] = env * Math.cos(k0 * x[i]); im[i] = env * Math.sin(k0 * x[i]);
  }
  const kin = { c: new Float64Array(N), s: new Float64Array(N), k: new Float64Array(N) };
  for (let j = 0; j < N; j++) {
    const k = ((2 * Math.PI) / L) * (j < N / 2 ? j : j - N);
    kin.k[j] = k;
    const ph = (-HB2M * k * k * dtFs) / HBAR_EV_FS;
    kin.c[j] = Math.cos(ph); kin.s[j] = Math.sin(ph);
  }
  const hc = new Float64Array(N), hs = new Float64Array(N);
  for (let i = 0; i < N; i++) { const ph = (-Varr[i] * dtFs) / (2 * HBAR_EV_FS); hc[i] = Math.cos(ph); hs[i] = Math.sin(ph); }
  const xa = 0.88 * (L / 2);
  const mask = Float64Array.from(x, (xx) => { const ax = Math.abs(xx); if (ax <= xa) return 1; const s = (ax - xa) / (L / 2 - xa); return Math.exp(-0.25 * s * s); });
  const sim = { N, L, dx, x, V: Varr, re, im, t: 0, dtFs, k0, lostLeft: 0, lostRight: 0, kin };

  const halfV = () => {
    for (let i = 0; i < N; i++) { const a = re[i], b = im[i]; re[i] = a * hc[i] - b * hs[i]; im[i] = a * hs[i] + b * hc[i]; }
  };
  sim.step = (n = 1) => {
    for (let s = 0; s < n; s++) {
      halfV();
      fft(re, im);
      for (let j = 0; j < N; j++) { const a = re[j], b = im[j]; re[j] = a * kin.c[j] - b * kin.s[j]; im[j] = a * kin.s[j] + b * kin.c[j]; }
      fft(re, im, true);
      halfV();
      for (let i = 0; i < N; i++) {
        if (mask[i] < 1) {
          const d = (1 - mask[i] * mask[i]) * (re[i] * re[i] + im[i] * im[i]) * dx;
          if (x[i] < 0) sim.lostLeft += d; else sim.lostRight += d;
          re[i] *= mask[i]; im[i] *= mask[i];
        }
      }
      sim.t += dtFs;
    }
  };
  sim.density = () => Float64Array.from({ length: N }, (_, i) => re[i] * re[i] + im[i] * im[i]);
  /** Norm, ⟨x⟩, Δx, ⟨k⟩, Δk, ⟨E⟩ and probabilities left of xl / right of xr (absorbed tails included). */
  sim.stats = (xl = 0, xr = 0) => {
    let norm = 0, mx = 0, mx2 = 0, pl = 0, pr = 0, pot = 0;
    for (let i = 0; i < N; i++) {
      const d = (re[i] * re[i] + im[i] * im[i]) * dx;
      norm += d; mx += d * x[i]; mx2 += d * x[i] * x[i]; pot += d * Varr[i];
      if (x[i] < xl) pl += d;
      if (x[i] > xr) pr += d;
    }
    const fr = Float64Array.from(re), fi = Float64Array.from(im);
    fft(fr, fi);
    let kn = 0, mk = 0, mk2 = 0;
    for (let j = 0; j < N; j++) { const d = fr[j] * fr[j] + fi[j] * fi[j]; kn += d; mk += d * kin.k[j]; mk2 += d * kin.k[j] * kin.k[j]; }
    mk /= kn; mk2 /= kn;
    const xm = mx / (norm || 1);
    return {
      norm, meanX: xm, dX: Math.sqrt(Math.max(0, mx2 / (norm || 1) - xm * xm)),
      meanK: mk, dK: Math.sqrt(Math.max(0, mk2 - mk * mk)),
      energy: HB2M * mk2 + pot / (norm || 1),
      probLeft: pl + sim.lostLeft, probRight: pr + sim.lostRight, total: norm + sim.lostLeft + sim.lostRight,
    };
  };
  return sim;
}

/* ---- Spin-½ / qubit ------------------------------------------------------------------------ */
const cm = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const ca = (a, b) => [a[0] + b[0], a[1] + b[1]];
const S = Math.SQRT1_2;
export const GATES = {
  X: [[[0, 0], [1, 0]], [[1, 0], [0, 0]]],
  Y: [[[0, 0], [0, -1]], [[0, 1], [0, 0]]],
  Z: [[[1, 0], [0, 0]], [[0, 0], [-1, 0]]],
  H: [[[S, 0], [S, 0]], [[S, 0], [-S, 0]]],
  S: [[[1, 0], [0, 0]], [[0, 0], [0, 1]]],
  T: [[[1, 0], [0, 0]], [[0, 0], [S, S]]],
};
export const qubitFromAngles = (theta, phi) => ({ a: [Math.cos(theta / 2), 0], b: [Math.sin(theta / 2) * Math.cos(phi), Math.sin(theta / 2) * Math.sin(phi)] });
export function applyGate(st, U) {
  return { a: ca(cm(U[0][0], st.a), cm(U[0][1], st.b)), b: ca(cm(U[1][0], st.a), cm(U[1][1], st.b)) };
}
export const rotation = (axis, ang) => {
  const c = Math.cos(ang / 2), s = Math.sin(ang / 2);
  if (axis === "x") return [[[c, 0], [0, -s]], [[0, -s], [c, 0]]];
  if (axis === "y") return [[[c, 0], [-s, 0]], [[s, 0], [c, 0]]];
  return [[[c, -s], [0, 0]], [[0, 0], [c, s]]];
};
/** Bloch vector (x, y, z) = (⟨σx⟩, ⟨σy⟩, ⟨σz⟩). */
export function bloch(st) {
  const { a, b } = st;
  const ab = cm([a[0], -a[1]], b); // a* b
  return [2 * ab[0], 2 * ab[1], a[0] * a[0] + a[1] * a[1] - b[0] * b[0] - b[1] * b[1]];
}
export const AXES = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
/** Probability of the + outcome of a spin measurement along unit vector n. */
export const probPlus = (r, n) => (1 + r[0] * n[0] + r[1] * n[1] + r[2] * n[2]) / 2;
/**
 * Pass an ensemble through a chain of Stern–Gerlach filters, each keeping the "+" beam of its axis.
 * Returns the expected beam intensity (fraction of the original atoms) after each stage.
 */
export function sgChain(r0, axes) {
  let r = r0, frac = 1;
  return axes.map((ax) => {
    const n = AXES[ax];
    frac *= probPlus(r, n);
    r = n;
    return frac;
  });
}

/* ---- Hydrogen orbitals -------------------------------------------------------------------- */
const factorial = (n) => { let v = 1; for (let k = 2; k <= n; k++) v *= k; return v; };
/** Associated Laguerre polynomial L_p^α(x) by recurrence. */
export function laguerre(p, alpha, x) {
  if (p === 0) return 1;
  let l0 = 1, l1 = 1 + alpha - x;
  for (let k = 1; k < p; k++) { const l2 = ((2 * k + 1 + alpha - x) * l1 - (k + alpha) * l0) / (k + 1); l0 = l1; l1 = l2; }
  return l1;
}
/** Radial function R_nl(r) with r in units of the Bohr radius (∫ R² r² dr = 1). */
export function hydrogenRadial(n, l, r) {
  const rho = (2 * r) / n;
  const norm = Math.sqrt(Math.pow(2 / n, 3) * factorial(n - l - 1) / (2 * n * factorial(n + l)));
  return norm * Math.exp(-rho / 2) * Math.pow(rho, l) * laguerre(n - l - 1, 2 * l + 1, rho);
}
/** Associated Legendre P_l^m(x) for m ≥ 0 (no Condon–Shortley phase; only squares are used). */
function legendre(l, m, x) {
  let pmm = 1;
  if (m > 0) { const s = Math.sqrt(Math.max(0, 1 - x * x)); let f = 1; for (let i = 1; i <= m; i++) { pmm *= f * s; f += 2; } }
  if (l === m) return pmm;
  let pm1 = x * (2 * m + 1) * pmm;
  if (l === m + 1) return pm1;
  let pl = 0;
  for (let ll = m + 2; ll <= l; ll++) { pl = (x * (2 * ll - 1) * pm1 - (ll + m - 1) * pmm) / (ll - m); pmm = pm1; pm1 = pl; }
  return pl;
}
/** |Y_lm(θ)|² (independent of φ). */
export function angularDensity(l, m, cosTheta) {
  const am = Math.abs(m);
  const p = legendre(l, am, cosTheta);
  return ((2 * l + 1) / (4 * Math.PI)) * (factorial(l - am) / factorial(l + am)) * p * p;
}
/** |ψ_nlm|² at (ρ, z) in the half-plane containing the z-axis, lengths in a₀. */
export function hydrogenDensity(n, l, m, rho, z) {
  const r = Math.hypot(rho, z);
  if (r < 1e-9) return l === 0 ? Math.pow(hydrogenRadial(n, 0, 0), 2) / (4 * Math.PI) : 0;
  const R = hydrogenRadial(n, l, r);
  return R * R * angularDensity(l, m, z / r);
}
export const hydrogenEnergy = (n) => -RYDBERG_EV / (n * n);
export const hydrogenMeanR = (n, l) => 0.5 * (3 * n * n - l * (l + 1));
export const ORBITAL_NAMES = ["s", "p", "d", "f", "g"];

/* ---- Mach–Zehnder interferometer ------------------------------------------------------------ */
/** Detector probabilities for relative phase φ (radians); port 1 is the bright port at φ = 0. */
export function machZehnder(phi) {
  return { d1: Math.pow(Math.cos(phi / 2), 2), d2: Math.pow(Math.sin(phi / 2), 2) };
}
/** Elitzur–Vaidman: an absorbing object blocks one arm (50 % absorbed, 25 % each detector). */
export const bombTester = () => ({ absorbed: 0.5, d1: 0.25, d2: 0.25 });
