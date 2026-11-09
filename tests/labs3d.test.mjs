import * as L from "../src/math/lab3d";
import * as E from "../src/math/expr";
let failed = 0;
const ok = (n, c, x = "") => { if (!c) { failed++; console.log("FAIL", n, x); } else console.log("ok  ", n); };
const near = (a, b, t = 1e-6) => Math.abs(a - b) < t;

// 2-D Riemann sums
const f = (x, y) => x * y;           // ∫∫_[0,2]² xy = 4
const lo = L.riemann2D(f, 0, 2, 0, 2, 20, "lower").sum, up = L.riemann2D(f, 0, 2, 0, 2, 20, "upper").sum, mid = L.riemann2D(f, 0, 2, 0, 2, 20, "mid").sum;
ok("lower ≤ exact ≤ upper", lo <= 4 && up >= 4, `${lo} ${up}`);
ok("midpoint close to 4", near(mid, 4, 1e-9), mid);
ok("sums converge with n", Math.abs(L.riemann2D(f, 0, 2, 0, 2, 40, "left").sum - 4) < Math.abs(L.riemann2D(f, 0, 2, 0, 2, 10, "left").sum - 4));
ok("integral2D of 1 + sin x cos y", near(L.integral2D((x, y) => 1 + Math.sin(x) * Math.cos(y), 0, 2, 0, 2), 4 + (1 - Math.cos(2)) * Math.sin(2), 1e-4));

// Fourier / Gibbs
const gE = L.waveErrors("square", 199);
ok("Gibbs overshoot ≈ 17.9% of height 1 (8.95% of the jump)", near(gE.overshoot, 0.1790, 0.003), gE.overshoot);
ok("square wave S_N(π/2) → 1", near(L.fourierPartial("square", 4001, Math.PI / 2), 1, 1e-3));
ok("L² error decreases with N", L.waveErrors("square", 50).rms < L.waveErrors("square", 10).rms);
ok("triangle converges uniformly (no overshoot)", L.waveErrors("triangle", 41).overshoot < 0.01);
ok("sawtooth S_N(π/2) → 1/2", near(L.fourierPartial("sawtooth", 2001, Math.PI / 2), 0.5, 2e-3));

// Riemann sphere
const s = L.stereo([3, 4]);
ok("stereo on unit sphere", near(Math.hypot(...s), 1));
ok("stereo(0) = south pole", near(L.stereo([0, 0])[2], -1));
ok("stereo(1/z̄) mirrors in the equator", near(L.stereo([0.3, 0.4])[2], -L.stereo([0.3 / 0.25, 0.4 / 0.25])[2]));

// branches
const b1 = L.branchPoint("sqrt", 4, 0), b2 = L.branchPoint("sqrt", 4, 2 * Math.PI), b3 = L.branchPoint("sqrt", 4, 4 * Math.PI);
ok("√z: after one turn the sign flips", near(b1.w[0], 2) && near(b2.w[0], -2));
ok("√z: after two turns it returns", near(b3.w[0], 2));
ok("log z height = θ", near(L.branchPoint("log", 2, 7).h, 7));

// 3×3 linear algebra
const A = [[2, 0, 0], [0, 3, 4], [0, 4, 9]]; // eigenvalues 11, 2, 1
const eg = L.eigen3(A);
ok("eigenvalues 11, 2, 1", eg.real.length === 3 && near(eg.real[0].value, 11, 1e-6) && near(eg.real[1].value, 2, 1e-6) && near(eg.real[2].value, 1, 1e-6), JSON.stringify(eg.values));
ok("A v = λ v for each eigenpair", eg.real.every((e) => { const av = L.mulMV(A, e.vec); return near(av[0], e.value * e.vec[0], 1e-6) && near(av[1], e.value * e.vec[1], 1e-6) && near(av[2], e.value * e.vec[2], 1e-6); }));
ok("det and trace", near(L.det3(A), 2 * (27 - 16)) && near(L.trace3(A), 14));
const R = [[0, -1, 0], [1, 0, 0], [0, 0, 1]]; // rotation about z: one real eigenvalue 1, complex pair
const er = L.eigen3(R);
ok("rotation: real eigenvalue 1 along z", er.real.length === 1 && near(er.real[0].value, 1) && near(Math.abs(er.real[0].vec[2]), 1), JSON.stringify(er.real));
ok("rotation: complex pair with |λ| = 1", er.complex && near(Math.hypot(er.complex.re, er.complex.im), 1, 1e-6), JSON.stringify(er.complex));
const Sh = [[1, 1, 0], [0, 1, 0], [0, 0, 1]]; // shear: defective, repeated eigenvalue 1
ok("shear: eigenvalues all 1", L.eigen3(Sh).values.every((v) => near(v, 1, 1e-4)), JSON.stringify(L.eigen3(Sh).values));
ok("blend3(A,0)=I and blend3(A,1)=A", near(L.blend3(A, 0)[1][1], 1) && near(L.blend3(A, 1)[2][2], 9));

// RK4 + div/curl
const rot = (x, y, z) => [-y, x, 0];
let p = [1, 0, 0]; for (let i = 0; i < 628; i++) p = L.rk4step3(rot, p, 0.01);
ok("RK4 rotation after 2π returns to start", near(p[0], 1, 1e-4) && near(p[1], 0, 1e-2), p);
const dc = L.divCurl3(rot, [0.3, 0.2, 0.1]);
ok("rotation field: div 0, curl (0,0,2)", near(dc.div, 0, 1e-6) && near(dc.curl[2], 2, 1e-5));
const lor = E.compileReal("10*(y-x)", ["x", "y", "z"]);
ok("compileReal accepts x,y,z", lor.ok && near(lor.f(1, 2, 3), 10));

console.log(failed ? `${failed} FAILED` : "all passed");
process.exit(failed ? 1 : 0);
