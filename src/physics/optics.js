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
