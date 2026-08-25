/**
 * physics/optics.js
 * -----------------------------------------------------------------------
 * Geometric and wave optics: thin-lens and mirror equations (New Cartesian
 * Sign Convention — distances measured against the incident-light
 * direction are negative), Snell's law refraction, and single-/double-slit
 * diffraction intensity patterns.
 * -----------------------------------------------------------------------
 */

/**
 * Thin lens equation: 1/f = 1/v - 1/u.
 * objectDistanceCm is entered as a positive number (distance in front of the lens);
 * internally u = -objectDistance per the New Cartesian Convention.
 * focalLengthCm is positive for a convex (converging) lens, negative for concave (diverging).
 */
export function solveLens(objectDistanceCm, focalLengthCm, objectHeightCm = 1) {
  const u = -objectDistanceCm;
  const f = focalLengthCm;
  if (Math.abs(1 / f + 1 / u) < 1e-9) return null; // object at focal point → image at infinity
  const v = 1 / (1 / f + 1 / u);
  const m = v / u;
  const imageHeight = m * objectHeightCm;
  return {
    v, u, f, m,
    imageDistance: Math.abs(v),
    imageHeight,
    real: v > 0,
    orientation: m < 0 ? "inverted" : "upright",
    magnitude: Math.abs(m),
  };
}

/**
 * Mirror equation: 1/f = 1/v + 1/u, magnification m = -v/u.
 * objectDistanceCm positive (distance in front of mirror) → u = -objectDistance.
 * f negative for concave (focus in front, real side), positive for convex, null/Infinity for plane.
 */
export function solveMirror(objectDistanceCm, focalLengthCm, objectHeightCm = 1, isPlane = false) {
  const u = -objectDistanceCm;
  if (isPlane) {
    const v = -u; // virtual image, same distance behind the mirror
    return { v, u, f: Infinity, m: 1, imageDistance: Math.abs(v), imageHeight: objectHeightCm, real: false, orientation: "upright", magnitude: 1 };
  }
  const f = focalLengthCm;
  if (Math.abs(1 / f - 1 / u) < 1e-9) return null;
  const v = 1 / (1 / f - 1 / u);
  const m = -v / u;
  const imageHeight = m * objectHeightCm;
  return {
    v, u, f, m,
    imageDistance: Math.abs(v),
    imageHeight,
    real: v < 0,
    orientation: m < 0 ? "inverted" : "upright",
    magnitude: Math.abs(m),
  };
}

/**
 * Build the three classic principal-ray paths for a thin-lens ray diagram (each an array of
 * [x,y] segment points, in the same cm units as objectDistance/focalLength). The lens sits at
 * x=0, the object tip at x=-objectDistance, and rays are extended to xFar on the far side.
 */
export function computeLensRays(objectDistanceCm, focalLengthCm, objectHeightCm, xFar) {
  const od = objectDistanceCm, f = focalLengthCm, ho = objectHeightCm;
  const objX = -od;

  // Ray 1: parallel to axis, then through the far focal point (0->f slope).
  const slope1 = (0 - ho) / (f - 0);
  const ray1 = [[objX, ho], [0, ho], [xFar, ho + slope1 * xFar]];

  // Ray 2: straight through the lens center, undeviated.
  const slope2 = (0 - ho) / (0 - objX);
  const ray2 = [[objX, ho], [0, 0], [xFar, slope2 * xFar]];

  // Ray 3: aimed at the near focal point (-f,0), emerges parallel to the axis.
  const yAtLens = ho + ((0 - ho) / (-f - objX)) * (0 - objX);
  const ray3 = [[objX, ho], [0, yAtLens], [xFar, yAtLens]];

  return { ray1, ray2, ray3 };
}

/**
 * Build the three classic principal-ray paths for a spherical-mirror ray diagram. The mirror
 * sits at x=0 (reflective surface facing -x, toward the object). fMag and radiusMag are the
 * *magnitudes* of the focal length and radius of curvature; concave/convex controls whether
 * F and C sit in front of (concave) or behind (convex) the mirror.
 */
export function computeMirrorRays(objectDistanceCm, fMagCm, objectHeightCm, isConcave, xFar) {
  const od = objectDistanceCm, ho = objectHeightCm;
  const objX = -od;
  const Fx = isConcave ? -fMagCm : fMagCm;
  const Cx = isConcave ? -2 * fMagCm : 2 * fMagCm;

  // Ray 1: parallel to axis, reflects through F.
  const slope1 = (0 - ho) / (Fx - 0);
  const ray1 = [[objX, ho], [0, ho], [-xFar, ho - slope1 * xFar]];

  // Ray 2: through F, reflects parallel to the axis.
  const yAtMirror2 = ho + ((0 - ho) / (Fx - objX)) * (0 - objX);
  const ray2 = [[objX, ho], [0, yAtMirror2], [-xFar, yAtMirror2]];

  // Ray 3: through C, reflects straight back along itself.
  const yAtMirror3 = ho + ((0 - ho) / (Cx - objX)) * (0 - objX);
  const slope3 = (yAtMirror3 - 0) / (0 - Cx);
  const ray3 = [[objX, ho], [0, yAtMirror3], [-xFar, yAtMirror3 - slope3 * xFar]];

  return { ray1, ray2, ray3 };
}

/** Snell's law: n1·sinθ1 = n2·sinθ2. Angles in degrees. Returns null on total internal reflection. */
export function snellRefract(n1, n2, theta1Deg) {
  const theta1 = (theta1Deg * Math.PI) / 180;
  const sinTheta2 = (n1 / n2) * Math.sin(theta1);
  if (Math.abs(sinTheta2) > 1) {
    // Total internal reflection: critical angle is still meaningful to report.
    const critical = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : null;
    return { totalInternalReflection: true, criticalAngleDeg: critical };
  }
  const theta2 = Math.asin(sinTheta2);
  return { totalInternalReflection: false, theta2Deg: (theta2 * 180) / Math.PI };
}

/** Common refractive indices for the medium picker. */
export const MEDIA = [
  { key: "vacuum", label: "Vacuum", n: 1.0 },
  { key: "air", label: "Air", n: 1.0003 },
  { key: "ice", label: "Ice", n: 1.31 },
  { key: "water", label: "Water", n: 1.33 },
  { key: "glycerin", label: "Glycerin", n: 1.47 },
  { key: "crownGlass", label: "Crown glass", n: 1.52 },
  { key: "flintGlass", label: "Flint glass", n: 1.62 },
  { key: "sapphire", label: "Sapphire", n: 1.77 },
  { key: "diamond", label: "Diamond", n: 2.42 },
];

/** Rough single-element refractive-index estimates (sodium-D, 589 nm) for the elemental
 * media picker — lets the Refraction Lab sweep across the full 118-element table. Values
 * are illustrative teaching approximations (solid/liquid form at STP where applicable, and
 * a common dense-glass-like placeholder for elements without a simple transparent form). */
export function elementRefractiveIndex(Z) {
  const KNOWN = { 1: 1.000132, 2: 1.000035, 6: 2.417, 7: 1.000298, 8: 1.000271, 10: 1.000067, 14: 3.42, 26: 2.9, 29: 1.10, 47: 0.18, 79: 0.47 };
  if (KNOWN[Z]) return KNOWN[Z];
  // Smooth teaching placeholder so every one of the 118 elements returns a plausible n.
  return 1.3 + ((Z * 37) % 100) / 100;
}

// --- Ray optics: prism dispersion -------------------------------------------

/**
 * Two-term Cauchy dispersion equation: n(λ) = A + B/λ², with λ in micrometres.
 * A good teaching-accurate fit to real glasses across the visible band (the
 * coefficients below reproduce BK7 crown glass's tabulated n_F/n_d/n_C to
 * within ~0.001) while staying simple enough to invert/differentiate by hand.
 */
export function cauchyIndex(wavelengthNm, A, B) {
  const lambdaUm = wavelengthNm / 1000;
  return A + B / (lambdaUm * lambdaUm);
}

/** Dispersive glass presets (Cauchy A, B) for the prism experiment. */
export const GLASS_PRESETS = [
  { key: "crown", label: "Crown glass (BK7)", A: 1.5046, B: 0.0042 },
  { key: "flint", label: "Flint glass", A: 1.6200, B: 0.0135 },
  { key: "denseFlint", label: "Dense flint glass", A: 1.7200, B: 0.0200 },
  { key: "diamond", label: "Diamond (illustrative)", A: 2.379, B: 0.0134 },
];

/** Vector form of Snell's law. d = incident unit direction (propagation), N = unit
 * normal pointing back toward the side the ray arrived from (dot(N,d) < 0), eta =
 * n_from/n_to. Returns the refracted unit direction, or null on total internal reflection. */
function refractVector(d, N, eta) {
  const cosI = -(d.x * N.x + d.y * N.y);
  const sin2T = eta * eta * (1 - cosI * cosI);
  if (sin2T > 1) return null;
  const cosT = Math.sqrt(1 - sin2T);
  const k = eta * cosI - cosT;
  return { x: eta * d.x + k * N.x, y: eta * d.y + k * N.y };
}

function rotate(v, rad) {
  const c = Math.cos(rad), s = Math.sin(rad);
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
}

/**
 * Trace one ray of refractive index n through a symmetric triangular prism
 * (apex at the origin pointing toward +y, base below). incidenceDeg is the
 * angle of incidence on the first face, measured from that face's normal.
 * Returns the full geometric path plus the deviation angle, or a TIR flag.
 */
export function tracePrismRay(apexAngleDeg, incidenceDeg, n, opts = {}) {
  const { faceLen = 3.2, entryFrac = 0.55, backTraceLen = 3.4, exitLen = 3.6 } = opts;
  const half = (apexAngleDeg * Math.PI) / 360; // (A/2) in radians
  const apex = { x: 0, y: 0 };
  const dLeft = { x: -Math.sin(half), y: -Math.cos(half) };
  const dRight = { x: Math.sin(half), y: -Math.cos(half) };
  const baseLeft = { x: dLeft.x * faceLen, y: dLeft.y * faceLen };
  const baseRight = { x: dRight.x * faceLen, y: dRight.y * faceLen };
  const Nleft = { x: -Math.cos(half), y: Math.sin(half) };
  const Nright = { x: Math.cos(half), y: Math.sin(half) };

  const P0 = { x: dLeft.x * faceLen * entryFrac, y: dLeft.y * faceLen * entryFrac };
  const t1 = (incidenceDeg * Math.PI) / 180;
  const dIncident = rotate({ x: -Nleft.x, y: -Nleft.y }, t1);
  const sourcePoint = { x: P0.x - dIncident.x * backTraceLen, y: P0.y - dIncident.y * backTraceLen };
  const geometry = { apex, baseLeft, baseRight, incident: [sourcePoint, P0] };

  const d1 = refractVector(dIncident, Nleft, 1 / n);
  if (!d1) return { tir: true, stage: "entry", ...geometry };

  const denom = d1.x * Nright.x + d1.y * Nright.y;
  const tHit = denom !== 0 ? -(P0.x * Nright.x + P0.y * Nright.y) / denom : Infinity;
  const P1 = { x: P0.x + d1.x * tHit, y: P0.y + d1.y * tHit };
  geometry.internal = [P0, P1];

  const d2 = refractVector(d1, { x: -Nright.x, y: -Nright.y }, n);
  if (!d2) return { tir: true, stage: "exit", ...geometry };

  const P2 = { x: P1.x + d2.x * exitLen, y: P1.y + d2.y * exitLen };
  const dot = Math.max(-1, Math.min(1, dIncident.x * d2.x + dIncident.y * d2.y));
  const deviationDeg = (Math.acos(dot) * 180) / Math.PI;

  return { tir: false, ...geometry, exit: [P1, P2], deviationDeg };
}

/** Trace the same incidence geometry across several wavelengths through one glass
 * preset — the core of the dispersion/rainbow-fan visualization. */
export function prismDispersionFan(apexAngleDeg, incidenceDeg, glass, wavelengthsNm, opts) {
  return wavelengthsNm.map((wavelengthNm) => {
    const n = cauchyIndex(wavelengthNm, glass.A, glass.B);
    return { wavelengthNm, n, ...tracePrismRay(apexAngleDeg, incidenceDeg, n, opts) };
  });
}

/** Angle of minimum deviation for a symmetric ray path (r1 = r2 = A/2): a classic
 * prism-spectrometer reference value, used to measure n from a measured δmin. */
export function minimumDeviationDeg(apexAngleDeg, n) {
  const halfA = (apexAngleDeg * Math.PI) / 360;
  const s = n * Math.sin(halfA);
  if (s > 1) return null; // no symmetric solution exists at this n/apex combination
  const theta1 = Math.asin(s);
  return (2 * theta1 - apexAngleDeg * (Math.PI / 180)) * (180 / Math.PI);
}

/** Representative visible-spectrum sample wavelengths (violet -> red) for the ray fan. */
export const SPECTRUM_SAMPLE_NM = [430, 460, 490, 520, 550, 580, 610, 640, 670];

// --- Diffraction & interference ---------------------------------------------

function sinc(x) {
  if (Math.abs(x) < 1e-9) return 1;
  return Math.sin(x) / x;
}

/** Single-slit diffraction intensity at angle theta (radians): I/I0 = sinc²(π·a·sinθ/λ). */
export function singleSlitIntensity(thetaRad, slitWidthUm, wavelengthNm) {
  const a = slitWidthUm * 1e-6;
  const lambda = wavelengthNm * 1e-9;
  const beta = (Math.PI * a * Math.sin(thetaRad)) / lambda;
  return sinc(beta) ** 2;
}

/** Young's double-slit intensity: interference (cos²) modulated by the single-slit envelope. */
export function doubleSlitIntensity(thetaRad, slitSeparationUm, slitWidthUm, wavelengthNm) {
  const d = slitSeparationUm * 1e-6;
  const lambda = wavelengthNm * 1e-9;
  const delta = (Math.PI * d * Math.sin(thetaRad)) / lambda;
  const interference = Math.cos(delta) ** 2;
  const envelope = singleSlitIntensity(thetaRad, slitWidthUm, wavelengthNm);
  return interference * envelope;
}

/** Sample an intensity pattern across a screen at distance L, returning {mm, I} points. */
export function sampleDiffractionPattern(kind, params, screenDistanceM, halfWidthMm = 25, steps = 300) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const mm = -halfWidthMm + (i / steps) * halfWidthMm * 2;
    const y = mm / 1000;
    const theta = Math.atan2(y, screenDistanceM);
    const I = kind === "single"
      ? singleSlitIntensity(theta, params.slitWidthUm, params.wavelengthNm)
      : doubleSlitIntensity(theta, params.slitSeparationUm, params.slitWidthUm, params.wavelengthNm);
    pts.push({ mm, I });
  }
  return pts;
}
