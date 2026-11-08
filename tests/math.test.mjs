import * as C from "../src/math/complex";
import * as R from "../src/math/realAnalysis";
import * as V from "../src/math/vectorSpace";
let failed = 0;
const ok = (name, cond, extra = "") => { if (!cond) { failed++; console.log("FAIL", name, extra); } else console.log("ok  ", name); };
const near = (a, b, t = 1e-9) => Math.abs(a - b) < t;
const nearC = (a, b, t = 1e-9) => near(a[0], b[0], t) && near(a[1], b[1], t);

// ---- complex
ok("Euler e^{iπ}+1=0", nearC(C.add(C.exp([0, Math.PI]), [1, 0]), [0, 0]));
ok("i² = −1", nearC(C.mul([0, 1], [0, 1]), [-1, 0]));
ok("div/mul inverse", nearC(C.mul(C.div([3, 4], [1, -2]), [1, -2]), [3, 4]));
ok("powInt vs polar", nearC(C.powInt([1, 1], 8), C.fromPolar(Math.pow(Math.SQRT2, 8), 8 * Math.PI / 4), 1e-9));
const rts = C.nthRoots([8, 0], 3);
ok("cube roots of 8 cube back", rts.every((z) => nearC(C.powInt(z, 3), [8, 0], 1e-9)));
const unity = C.nthRoots([1, 0], 7);
ok("roots of unity sum to 0", nearC(unity.reduce(C.add, [0, 0]), [0, 0]));
ok("sin² + cos² = 1 (complex)", (() => { const z = [0.7, -1.3]; return nearC(C.add(C.mul(C.sin(z), C.sin(z)), C.mul(C.cos(z), C.cos(z))), [1, 0], 1e-9); })());
ok("formatC clean zero", C.formatC([-1e-9, 2]) === "0.000 + 2.000i", C.formatC([-1e-9, 2]));
ok("formatC negative", C.formatC([1, -2]) === "1.000 − 2.000i", C.formatC([1, -2]));
ok("formatC negative real", C.formatC([-1.5, 2]) === "−1.500 + 2.000i", C.formatC([-1.5, 2]));
for (const m of C.MAPPINGS) {
  const z = [0.8, 0.45], h = 1e-6;
  const num = C.scale(C.sub(m.f(C.add(z, [h, 0])), m.f(C.sub(z, [h, 0]))), 1 / (2 * h));
  ok(`derivative of ${m.label}`, nearC(num, m.df(z), 1e-5), JSON.stringify([num, m.df(z)]));
}
ok("Joukowski maps unit circle to [-2,2]", (() => { for (let t = 0; t < 6.28; t += 0.3) { const w = C.MAPPINGS[5].f(C.fromPolar(1, t)); if (Math.abs(w[1]) > 1e-9 || Math.abs(w[0]) > 2 + 1e-9) return false; } return true; })());
ok("Möbius maps right half-plane inside unit disc", C.abs(C.MAPPINGS[6].f([0.3, 5])) < 1 && C.abs(C.MAPPINGS[6].f([2, -1])) < 1);
ok("Mandelbrot: 0 inside, 1 outside", C.escapeTime([0, 0], [0, 0], 100) === 100 && C.escapeTime([0, 0], [1, 1], 100) < 5);
ok("domainColor finite", C.domainColor([0, 0]).every(Number.isFinite) && C.domainColor([Infinity, 0]).length === 3);

// ---- real analysis
const inv = R.SEQUENCES[0];
ok("findN 1/n ε=0.01 → 101", R.findN(inv.a, 0, 0.01) === 101, R.findN(inv.a, 0, 0.01));
ok("findN oscillating → null", R.findN(R.SEQUENCES[7].a, 0, 0.5) === null);
ok("findN (1+1/n)^n converges to e", R.findN(R.SEQUENCES[3].a, Math.E, 0.01) !== null);
ok("findN 2^n/n! small", R.findN(R.SEQUENCES[6].a, 0, 1e-6) < 30);
for (const s of R.SERIES.filter((s) => s.sum !== null)) {
  const ps = R.partialSums(s, 4000);
  const tol = s.key === "basel" || s.key === "tele" ? 1e-3 : s.kind === "conditional" ? 2e-3 : 1e-6;
  ok(`series sum ${s.key}`, near(ps[ps.length - 1], s.sum, tol), `${ps[ps.length - 1]} vs ${s.sum}`);
}
ok("harmonic diverges (S grows)", R.partialSums(R.SERIES[8], 5000)[4999] > 9);
const geo = R.seriesTests(R.SERIES[0], 20);
ok("ratio test geometric ½", near(geo.ratio, 0.5) && near(geo.root, 0.5, 1e-6));
ok("ratio verdicts", R.ratioVerdict(0.5).includes("converges") && R.ratioVerdict(1.5).includes("diverges") && R.ratioVerdict(1).includes("inconclusive"));
const sq = R.EPS_DELTA[0];
const dd = R.findDelta(sq.f, 1, 1, 0.1);
ok("ε-δ for x² at 1, ε=.1: δ≈0.0488", near(dd.delta, Math.sqrt(1.1) - 1, 2e-3) && dd.resolved, JSON.stringify(dd));
ok("ε-δ jump has no δ", !R.findDelta(R.EPS_DELTA[3].f, 0, R.EPS_DELTA[3].limitAt(0), 0.5).resolved);
ok("ε-δ removable sinc at 0", near(R.findDelta(R.EPS_DELTA[1].f, 0, 1, 0.01).delta, Math.sqrt(0.06), 2e-3));
ok("ε-δ 1/x shrinks near 0", R.findDelta(R.EPS_DELTA[2].f, 0.25, 4, 0.1).delta < R.findDelta(R.EPS_DELTA[2].f, 2, 0.5, 0.1).delta);
for (const g of R.INTEGRANDS) {
  const [a, b] = g.range; const exact = g.F(b) - g.F(a);
  const L = R.riemann(g.f, a, b, 400, "lower").sum, U = R.riemann(g.f, a, b, 400, "upper").sum;
  ok(`Darboux ${g.key} L ≤ I ≤ U`, L <= exact + 1e-9 && U >= exact - 1e-9, `${L} ${exact} ${U}`);
  ok(`midpoint ${g.key} converges`, near(R.riemann(g.f, a, b, 400, "mid").sum, exact, 1e-2));
  ok(`U−L shrinks ${g.key}`, U - L < R.riemann(g.f, a, b, 10, "upper").sum - R.riemann(g.f, a, b, 10, "lower").sum);
}
ok("left/right sums bracket for monotone x²", R.riemann(R.INTEGRANDS[0].f, 0, 3, 50, "left").sum < 9 && R.riemann(R.INTEGRANDS[0].f, 0, 3, 50, "right").sum > 9);
ok("trapezoid exact for linear", near(R.riemann((x) => 2 * x + 1, 0, 4, 1, "trap").sum, 20));
for (const t of R.TAYLOR) {
  const x = t.R === Infinity ? 1.7 : 0.5;
  ok(`Taylor ${t.key} N=30`, near(R.taylorPoly(t, 30, x), t.f(x), 1e-8), `${R.taylorPoly(t, 30, x)} vs ${t.f(x)}`);
}
ok("Taylor diverges outside R (ln at 1.5)", Math.abs(R.taylorPoly(R.TAYLOR[3], 40, 1.5) - Math.log(2.5)) > 10);
ok("Lagrange bound dominates error", (() => { const t = R.TAYLOR[0]; for (const N of [3, 5, 9]) for (const x of [0.5, 2, 3.2]) if (Math.abs(t.f(x) - R.taylorPoly(t, N, x)) > R.lagrangeBound(t, N, x) + 1e-12) return false; return true; })());

// ---- vector spaces
ok("coordinates", (() => { const c = V.coordinates([1, 1], [-1, 2], [3, 3]); return c && near(c[0], 3) && near(c[1], 0); })());
ok("dependent → null", V.coordinates([1, 2], [2, 4], [1, 1]) === null);
ok("coordinates reconstruct w", (() => { const v1 = [2, 0.5], v2 = [-1, 1.5], w = [0.7, -2]; const [a, b] = V.coordinates(v1, v2, w); return near(a * v1[0] + b * v2[0], w[0]) && near(a * v1[1] + b * v2[1], w[1]); })());
ok("Gram–Schmidt orthonormal", (() => { const [e1, e2] = V.gramSchmidt([3, 1], [1, 2]); return near(V.norm(e1), 1) && near(V.norm(e2), 1) && near(V.dot(e1, e2), 0); })());
ok("Gram–Schmidt dependent → 1 vector", V.gramSchmidt([1, 1], [2, 2]).length === 1);
const e = V.eig2(2, 1, 1, 2);
ok("eig sym [[2,1],[1,2]] = 3,1", e.type === "real" && near(e.values[0][0], 3) && near(e.values[1][0], 1));
ok("eigvecs satisfy Av=λv", (() => { const A = [3, 1, 0.5, 2]; const r = V.eig2(...A); return r.vectors.every((v, i) => { const Av = [A[0] * v[0] + A[1] * v[1], A[2] * v[0] + A[3] * v[1]]; return near(Av[0], r.values[i][0] * v[0], 1e-9) && near(Av[1], r.values[i][0] * v[1], 1e-9); }); })());
ok("eig rotation is complex", V.eig2(0, -1, 1, 0).type === "complex" && near(V.eig2(0, -1, 1, 0).values[0][1], 1));
ok("eig diagonal", (() => { const r = V.eig2(2, 0, 0, 5); return r.type === "real" && r.vectors.length === 2; })());
ok("eig identity repeated 2 vecs", V.eig2(1, 0, 0, 1).vectors.length === 2);
ok("eig Jordan repeated 1 vec", V.eig2(1, 1, 0, 1).vectors.length === 1);
ok("rank", V.matrixRank2(1, 2, 2, 4) === 1 && V.matrixRank2(0, 0, 0, 0) === 0 && V.matrixRank2(1, 0, 0, 1) === 2);
for (const f of V.FIELDS) {
  const [x, y] = [f.domain[0] * 0.3 + 0.17, f.domain[2] * 0.2 + 0.31], h = 1e-6;
  const gn = [(f.f(x + h, y) - f.f(x - h, y)) / (2 * h), (f.f(x, y + h) - f.f(x, y - h)) / (2 * h)];
  const ga = f.grad(x, y);
  ok(`grad ${f.key}`, Math.abs(gn[0] - ga[0]) < 1e-4 * (1 + Math.abs(ga[0])) && Math.abs(gn[1] - ga[1]) < 1e-4 * (1 + Math.abs(ga[1])), `${gn} vs ${ga}`);
}
ok("saddle harmonic, bowl not", Math.abs(V.laplacian(V.FIELDS[2].f, 0.4, 0.9)) < 1e-4 && near(V.laplacian(V.FIELDS[0].f, 0.4, 0.9), 4, 1e-3));
ok("waves ∇²f = −2f", near(V.laplacian(V.FIELDS[3].f, 0.8, 0.3), -2 * V.FIELDS[3].f(0.8, 0.3), 1e-3));
const bowl = V.descend(V.FIELDS[0], [2.4, 1.8], 0.2, 0, 400);
ok("descent converges on bowl", bowl.status === "converged" && Math.hypot(bowl.path.at(-1).x, bowl.path.at(-1).y) < 1e-4);
ok("f decreases monotonically (bowl, plain)", bowl.path.every((p, i) => i === 0 || p.f <= bowl.path[i - 1].f + 1e-12));
ok("too-large η diverges", V.descend(V.FIELDS[0], [2.4, 1.8], 1.2, 0, 400).status === "diverged");
const slow = V.descend(V.FIELDS[1], [2.6, 1.2], 0.15, 0, 2000), fast = V.descend(V.FIELDS[1], [2.6, 1.2], 0.15, 0.7, 2000);
ok("momentum speeds up the ravine", fast.path.length < slow.path.length, `${fast.path.length} vs ${slow.path.length}`);
const him = V.descend(V.FIELDS[4], [0, 0], 0.01, 0, 3000);
ok("Himmelblau reaches a minimum (f≈0)", him.path.at(-1).f < 1e-6, him.path.at(-1).f);
ok("saddle escapes", V.descend(V.FIELDS[2], [1.5, 0.05], 0.1, 0, 400).path.at(-1).f < -10);

// Laplace
const P = V.LAPLACE_PRESETS.find((p) => p.key === "sine");
function solve(method, N = 32, alpha, maxIt = 20000) {
  const g = V.makeLaplaceGrid(N, P.bc); let it = 0, ch = 1;
  while (it < maxIt && ch > 1e-10) { ch = V.laplaceSweep(g, method, alpha); it++; }
  let err = 0;
  for (let j = 0; j <= N + 1; j++) for (let i = 0; i <= N + 1; i++) err = Math.max(err, Math.abs(g.u[j * g.M + i] - P.exact(i / (N + 1), j / (N + 1))));
  return { it, err, g };
}
const jac = solve("jacobi"), gs = solve("gs"), sor = solve("sor"), gd = solve("gd", 32, 0.2);
ok("Jacobi matches exact (h²)", jac.err < 2e-3, jac.err);
ok("GS matches exact", gs.err < 2e-3 && near(gs.err, jac.err, 1e-6));
ok("SOR matches exact", sor.err < 2e-3);
ok("GD(α=.2) matches exact", gd.err < 2e-3, gd.err);
ok("GS ≈ half of Jacobi iterations", gs.it < jac.it * 0.7, `${gs.it} vs ${jac.it}`);
ok("SOR ≪ GS iterations", sor.it < gs.it / 3, `${sor.it} vs ${gs.it}`);
ok("residual small after solve", V.laplaceResidual(sor.g) < 1e-8);
ok("Dirichlet energy decreases under Jacobi", (() => { const g = V.makeLaplaceGrid(20, P.bc); let prev = V.dirichletEnergy(g); for (let k = 0; k < 60; k++) { V.laplaceSweep(g, "jacobi"); const e = V.dirichletEnergy(g); if (e > prev + 1e-12) return false; prev = e; } return true; })());
ok("max principle (interior within boundary range)", (() => { const { g } = jac; let lo = Infinity, hi = -Infinity, ilo = Infinity, ihi = -Infinity; for (let j = 0; j < g.M; j++) for (let i = 0; i < g.M; i++) { const v = g.u[j * g.M + i], b = i === 0 || j === 0 || i === g.M - 1 || j === g.M - 1; if (b) { lo = Math.min(lo, v); hi = Math.max(hi, v); } else { ilo = Math.min(ilo, v); ihi = Math.max(ihi, v); } } return ilo >= lo - 1e-9 && ihi <= hi + 1e-9; })());
ok("GD with α>0.25 blows up", (() => { const g = V.makeLaplaceGrid(16, P.bc); for (let k = 0; k < 400; k++) V.laplaceSweep(g, "gd", 0.3); return V.laplaceResidual(g) > 1 || !Number.isFinite(V.laplaceResidual(g)); })());
console.log(failed ? `\n${failed} FAILED` : "\nall passed");
