/**
 * math/vectorSpace.js
 * -----------------------------------------------------------------------
 * Linear algebra in ℝ², scalar fields with analytic gradients, gradient
 * descent (with momentum) and a finite-difference Laplace solver.
 * -----------------------------------------------------------------------
 */

/* ---- Linear algebra in ℝ² ---------------------------------------------------------------- */
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
export const norm = (a) => Math.hypot(a[0], a[1]);
export const det2 = (a, b) => a[0] * b[1] - a[1] * b[0]; // det of the matrix whose columns are a and b

/** Coordinates (c1, c2) of w in the basis {v1, v2}, or null when the vectors are dependent. */
export function coordinates(v1, v2, w) {
  const d = det2(v1, v2);
  if (Math.abs(d) < 1e-9) return null;
  return [det2(w, v2) / d, det2(v1, w) / d];
}

/** Gram–Schmidt: orthonormal basis of span{v1, v2}. Returns 0, 1 or 2 unit vectors. */
export function gramSchmidt(v1, v2) {
  const out = [];
  const n1 = norm(v1);
  if (n1 < 1e-9) {
    const n2 = norm(v2);
    return n2 < 1e-9 ? [] : [[v2[0] / n2, v2[1] / n2]];
  }
  const e1 = [v1[0] / n1, v1[1] / n1];
  out.push(e1);
  const p = dot(v2, e1);
  const r = [v2[0] - p * e1[0], v2[1] - p * e1[1]];
  const nr = norm(r);
  if (nr > 1e-9) out.push([r[0] / nr, r[1] / nr]);
  return out;
}

/** Eigen-decomposition of a real 2×2 matrix [[a, b], [c, d]]. */
export function eig2(a, b, c, d) {
  const tr = a + d, dt = a * d - b * c;
  const disc = (tr * tr) / 4 - dt;
  if (disc < -1e-12) {
    const im = Math.sqrt(-disc);
    return { type: "complex", values: [[tr / 2, im], [tr / 2, -im]], vectors: [] };
  }
  const s = Math.sqrt(Math.max(0, disc));
  const l1 = tr / 2 + s, l2 = tr / 2 - s;
  const vec = (l) => {
    // (A − λI)v = 0
    let v;
    if (Math.abs(b) > 1e-12) v = [b, l - a];
    else if (Math.abs(c) > 1e-12) v = [l - d, c];
    else v = Math.abs(l - a) < 1e-12 ? [1, 0] : [0, 1];
    const n = norm(v);
    return [v[0] / n, v[1] / n];
  };
  if (s < 1e-9) {
    // repeated eigenvalue: one direction unless the matrix is a multiple of I
    const scalar = Math.abs(b) < 1e-12 && Math.abs(c) < 1e-12 && Math.abs(a - d) < 1e-12;
    return { type: "repeated", values: [[l1, 0], [l2, 0]], vectors: scalar ? [[1, 0], [0, 1]] : [vec(l1)] };
  }
  return { type: "real", values: [[l1, 0], [l2, 0]], vectors: [vec(l1), vec(l2)] };
}

export function matrixRank2(a, b, c, d) {
  if (Math.abs(a * d - b * c) > 1e-9) return 2;
  return Math.max(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(d)) > 1e-9 ? 1 : 0;
}

/* ---- Scalar fields (analytic gradient) ---------------------------------------------------- */
export const FIELDS = [
  {
    key: "bowl", label: "Bowl  x² + y²", domain: [-3, 3, -3, 3],
    f: (x, y) => x * x + y * y, grad: (x, y) => [2 * x, 2 * y], start: [2.4, 1.8], eta: 0.2,
    note: "convex, with ∇²f = 4 (not harmonic). One global minimum at the origin.",
  },
  {
    key: "ravine", label: "Ravine  ½(x² + 10y²)", domain: [-3, 3, -3, 3],
    f: (x, y) => 0.5 * (x * x + 10 * y * y), grad: (x, y) => [x, 10 * y], start: [2.6, 1.2], eta: 0.15,
    note: "ill-conditioned: steep across, shallow along — plain descent zig-zags.",
  },
  {
    key: "saddle", label: "Saddle  x² − y²", domain: [-3, 3, -3, 3],
    f: (x, y) => x * x - y * y, grad: (x, y) => [2 * x, -2 * y], start: [1.5, 0.05], eta: 0.1,
    note: "harmonic (∇²f = 0): a saddle with no minimum — descent escapes along y.",
  },
  {
    key: "waves", label: "Waves  sin x · cos y", domain: [-4.5, 4.5, -4.5, 4.5],
    f: (x, y) => Math.sin(x) * Math.cos(y), grad: (x, y) => [Math.cos(x) * Math.cos(y), -Math.sin(x) * Math.sin(y)], start: [0.4, 0.5], eta: 0.4,
    note: "many minima and maxima; ∇²f = −2f, so it is not harmonic.",
  },
  {
    key: "himmelblau", label: "Himmelblau", domain: [-5, 5, -5, 5],
    f: (x, y) => Math.pow(x * x + y - 11, 2) + Math.pow(x + y * y - 7, 2),
    grad: (x, y) => [4 * x * (x * x + y - 11) + 2 * (x + y * y - 7), 2 * (x * x + y - 11) + 4 * y * (x + y * y - 7)],
    start: [0, 0], eta: 0.01,
    note: "four separate minima — the one you reach depends on the start point.",
  },
  {
    key: "rosenbrock", label: "Rosenbrock banana", domain: [-2, 2, -1, 3],
    f: (x, y) => Math.pow(1 - x, 2) + 100 * Math.pow(y - x * x, 2),
    grad: (x, y) => [-2 * (1 - x) - 400 * x * (y - x * x), 200 * (y - x * x)],
    start: [-1.2, 1], eta: 0.001,
    note: "a long curved valley — easy to find, painfully slow to follow.",
  },
];

/** Five-point finite-difference Laplacian ∇²f (used to test whether a field is harmonic). */
export function laplacian(f, x, y, h = 1e-3) {
  return (f(x + h, y) + f(x - h, y) + f(x, y + h) + f(x, y - h) - 4 * f(x, y)) / (h * h);
}

/* ---- Gradient descent -------------------------------------------------------------------- */
/**
 * Heavy-ball gradient descent:  v ← β v − η ∇f(x);  x ← x + v.   (β = 0 is plain descent.)
 * Stops at |∇f| < tol, on divergence, or after maxSteps. Returns the full path and why it stopped.
 */
export function descend(field, start, eta, beta, maxSteps = 400, tol = 1e-5, bound = 50) {
  let x = start[0], y = start[1], vx = 0, vy = 0;
  const path = [{ x, y, f: field.f(x, y), g: norm(field.grad(x, y)) }];
  let status = "max-steps";
  for (let k = 0; k < maxSteps; k++) {
    const [gx, gy] = field.grad(x, y);
    if (Math.hypot(gx, gy) < tol) { status = "converged"; break; }
    vx = beta * vx - eta * gx;
    vy = beta * vy - eta * gy;
    x += vx; y += vy;
    if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > bound || Math.abs(y) > bound) { status = "diverged"; break; }
    const g = field.grad(x, y);
    path.push({ x, y, f: field.f(x, y), g: Math.hypot(g[0], g[1]) });
  }
  return { path, status };
}

/* ---- Laplace equation  ∇²u = 0  on the unit square -------------------------------------------- */
/**
 * Grid of (N+2)² nodes (interior N×N plus Dirichlet boundary), row index j = y (0 at the bottom).
 * `bc` = {top(x), bottom(x), left(y), right(y)} with x, y ∈ [0, 1].
 */
export function makeLaplaceGrid(N, bc) {
  const M = N + 2;
  const u = new Float64Array(M * M);
  for (let i = 0; i < M; i++) {
    const t = i / (N + 1);
    u[(M - 1) * M + i] = bc.top(t);
    u[i] = bc.bottom(t);
    u[i * M] = bc.left(t);
    u[i * M + (M - 1)] = bc.right(t);
  }
  // corners: average the two meeting edges so the boundary is single-valued
  const avg = (a, b) => (a + b) / 2;
  u[0] = avg(bc.bottom(0), bc.left(0));
  u[M - 1] = avg(bc.bottom(1), bc.right(0));
  u[(M - 1) * M] = avg(bc.top(0), bc.left(1));
  u[M * M - 1] = avg(bc.top(1), bc.right(1));
  return { N, M, u };
}

export const LAPLACE_METHODS = [
  { key: "jacobi", label: "Jacobi" },
  { key: "gs", label: "Gauss–Seidel" },
  { key: "sor", label: "SOR (optimal ω)" },
  { key: "gd", label: "Gradient descent (step α)" },
];

/** One sweep over the interior. Returns the largest change, a cheap convergence indicator. */
export function laplaceSweep(grid, method, alpha = 0.2, scratch = null) {
  const { N, M, u } = grid;
  let maxChange = 0;
  if (method === "jacobi" || method === "gd") {
    const next = scratch || new Float64Array(u.length);
    next.set(u);
    // Jacobi is exactly gradient descent on the Dirichlet energy with step 1/4: u − ¼∇E = average of neighbours.
    const a = method === "jacobi" ? 0.25 : alpha;
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        const k = j * M + i;
        const gradE = 4 * u[k] - u[k - 1] - u[k + 1] - u[k - M] - u[k + M];
        const nv = u[k] - a * gradE;
        maxChange = Math.max(maxChange, Math.abs(nv - u[k]));
        next[k] = nv;
      }
    }
    u.set(next);
  } else {
    const omega = method === "sor" ? 2 / (1 + Math.sin(Math.PI / (N + 1))) : 1;
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        const k = j * M + i;
        const gs = 0.25 * (u[k - 1] + u[k + 1] + u[k - M] + u[k + M]);
        const nv = u[k] + omega * (gs - u[k]);
        maxChange = Math.max(maxChange, Math.abs(nv - u[k]));
        u[k] = nv;
      }
    }
  }
  return maxChange;
}

/** Dirichlet energy E = ½ Σ |∇u|² h⁰ (in grid units): the quantity Laplace relaxation minimises. */
export function dirichletEnergy(grid) {
  const { N, M, u } = grid;
  let e = 0;
  for (let j = 0; j <= N; j++) {
    for (let i = 0; i <= N; i++) {
      const k = j * M + i;
      e += 0.5 * (Math.pow(u[k + 1] - u[k], 2) + Math.pow(u[k + M] - u[k], 2));
    }
  }
  return e;
}

/** Max |Δu| residual: largest violation of the discrete mean-value property over the interior. */
export function laplaceResidual(grid) {
  const { N, M, u } = grid;
  let r = 0;
  for (let j = 1; j <= N; j++) for (let i = 1; i <= N; i++) {
    const k = j * M + i;
    r = Math.max(r, Math.abs(0.25 * (u[k - 1] + u[k + 1] + u[k - M] + u[k + M]) - u[k]));
  }
  return r;
}

export const LAPLACE_PRESETS = [
  { key: "plate", label: "Four edges (set below)", custom: true },
  { key: "sine", label: "Sine top — exact solution known", exact: (x, y) => Math.sin(Math.PI * x) * Math.sinh(Math.PI * y) / Math.sinh(Math.PI), bc: { top: (x) => Math.sin(Math.PI * x), bottom: () => 0, left: () => 0, right: () => 0 } },
  { key: "ramp", label: "Linear ramp left → right", exact: (x) => x, bc: { top: (x) => x, bottom: (x) => x, left: () => 0, right: () => 1 } },
];

/** Classify the linear system x′ = J x by trace and determinant. */
export function classifyLinear(tr, det) {
  const eps = 1e-6;
  if (Math.abs(det) < eps) return "degenerate (det ≈ 0): a line of equilibria or a shear";
  if (det < 0) return "saddle — unstable";
  const disc = tr * tr - 4 * det;
  if (Math.abs(tr) < eps) return "centre — closed orbits (neutral)";
  if (disc >= 0) return tr < 0 ? "stable node — flow converges" : "unstable node — flow diverges";
  return tr < 0 ? "stable spiral — flow spirals inward" : "unstable spiral — flow spirals outward";
}

/** Central-difference Jacobian of F(x, y) = (P, Q). Returns [[Px, Py], [Qx, Qy]]. */
export function jacobian(P, Q, x, y, h = 1e-5) {
  return [
    [(P(x + h, y) - P(x - h, y)) / (2 * h), (P(x, y + h) - P(x, y - h)) / (2 * h)],
    [(Q(x + h, y) - Q(x - h, y)) / (2 * h), (Q(x, y + h) - Q(x, y - h)) / (2 * h)],
  ];
}

/** Trajectory of x′ = F(x) from (x0, y0) by RK4 with a normalised (arc-length-like) step. */
export function flowTrajectory(P, Q, x0, y0, win, dt = 0.04, steps = 600, dir = 1) {
  const pts = [[x0, y0]];
  let x = x0, y = y0;
  const F = (px, py) => [dir * P(px, py), dir * Q(px, py)];
  for (let i = 0; i < steps; i++) {
    const k1 = F(x, y), k2 = F(x + (dt / 2) * k1[0], y + (dt / 2) * k1[1]), k3 = F(x + (dt / 2) * k2[0], y + (dt / 2) * k2[1]), k4 = F(x + dt * k3[0], y + dt * k3[1]);
    x += (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    y += (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > win * 1.5 || Math.abs(y) > win * 1.5) break;
    pts.push([x, y]);
  }
  return pts;
}
