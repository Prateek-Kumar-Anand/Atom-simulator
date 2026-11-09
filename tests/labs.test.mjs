import * as Q from "../src/physics/quantumLab";
import * as H from "../src/physics/hydro";
import { tunnelingProbability } from "../src/physics/quantum";
let failed = 0;
const ok = (n, c, x = "") => { if (!c) { failed++; console.log("FAIL", n, x); } else console.log("ok  ", n); };
const near = (a, b, t = 1e-9) => Math.abs(a - b) < t;
const integ = (f, a, b, n = 4000) => { const h = (b - a) / n; let s = 0; for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * h) * h; return s; };

// ---- box
ok("box E1 for 1 nm electron = 0.376 eV", near(Q.boxEnergy(1, 1), 0.3760, 1e-3), Q.boxEnergy(1, 1));
ok("box E ∝ n²", near(Q.boxEnergy(3, 2) / Q.boxEnergy(1, 2), 9));
ok("box normalised", near(integ((x) => Q.boxPsi(4, 1.3, x) ** 2, 0, 1.3), 1, 1e-6));
ok("box orthogonal", near(integ((x) => Q.boxPsi(2, 1, x) * Q.boxPsi(5, 1, x), 0, 1), 0, 1e-6));
ok("box P(left third) closed form", near(Q.boxProbLeft(2, 1 / 3), integ((x) => Q.boxPsi(2, 1, x) ** 2, 0, 1 / 3), 1e-6));
ok("box <x> matrix element", near(Q.boxMatrixX(1, 2, 1), integ((x) => x * Q.boxPsi(1, 1, x) * Q.boxPsi(2, 1, x), 0, 1), 1e-6));
ok("box superposition normalised at any t", [0, 0.7, 3].every((t) => near(integ((x) => Q.boxSuperDensity(1, 2, 0.6, 1, x, t), 0, 1), 1, 1e-6)));
// ---- HO
ok("HO normalised n=0..8", [0, 1, 2, 5, 8].every((n) => near(integ((x) => Q.hoPsi(n, x) ** 2, -12, 12, 6000), 1, 1e-6)));
ok("HO orthogonal", near(integ((x) => Q.hoPsi(2, x) * Q.hoPsi(4, x), -12, 12, 6000), 0, 1e-7));
ok("HO <ξ²> = n+½", near(integ((x) => x * x * Q.hoPsi(3, x) ** 2, -12, 12, 6000), 3.5, 1e-5));
ok("HO ground state forbidden prob ≈ 15.7 %", near(Q.hoForbiddenProbability(0), 0.1573, 1e-3), Q.hoForbiddenProbability(0));
ok("HO forbidden prob decreases with n", Q.hoForbiddenProbability(10) < Q.hoForbiddenProbability(0));
ok("HO classical density normalised", near(integ((x) => Q.hoClassicalDensity(4, x), -3 + 1e-9, 3 - 1e-9, 200000), 1, 2e-2));
// ---- FFT / sim
ok("FFT round trip", (() => { const re = Float64Array.from({ length: 64 }, (_, i) => Math.sin(i) + i / 10), im = new Float64Array(64); const r0 = Float64Array.from(re); Q.fft(re, im); Q.fft(re, im, true); return r0.every((v, i) => near(v, re[i], 1e-10)); })());
ok("FFT of cos has 2 peaks", (() => { const re = Float64Array.from({ length: 64 }, (_, i) => Math.cos((2 * Math.PI * 5 * i) / 64)), im = new Float64Array(64); Q.fft(re, im); return near(re[5], 32, 1e-9) && near(re[59], 32, 1e-9) && near(re[7], 0, 1e-9); })());
{
  const sim = Q.createPacketSim({ V: Q.makePotential("free"), x0: 0, sigma: 1.5, energyEV: 0, dtFs: 0.2 });
  const s0 = sim.stats();
  ok("free packet normalised at start", near(s0.norm, 1, 1e-6) && near(s0.dX, 1.5, 1e-3), JSON.stringify(s0));
  sim.step(250); // t = 50 fs
  const s1 = sim.stats();
  const analytic = 1.5 * Math.sqrt(1 + Math.pow((Q.HB2M * 2 * 50) / (Q.HBAR_EV_FS * 2 * 1.5 * 1.5), 2)); // σ(t)=σ0√(1+(ħt/2mσ0²)²), ħ/m = 2·HB2M/ħ... in nm²/fs
  const hbm = (2 * Q.HB2M) / Q.HBAR_EV_FS; // ħ/m in nm²/fs
  const an = 1.5 * Math.sqrt(1 + Math.pow((hbm * 50) / (2 * 1.5 * 1.5), 2));
  ok("free spreading matches analytic σ(t)", near(s1.dX, an, 2e-3), `${s1.dX} vs ${an}`);
  ok("norm conserved", near(s1.norm, 1, 1e-6), s1.norm);
  ok("Δx Δk ≥ ½ (Gaussian = ½ at t=0)", near(s0.dX * s0.dK, 0.5, 1e-3) && s1.dX * s1.dK >= 0.5 - 1e-6);
}
{
  const E = 0.5, V0 = 1, w = 0.6;
  const sim = Q.createPacketSim({ V: Q.makePotential("barrier", V0, w), x0: -15, sigma: 3, energyEV: E, dtFs: 0.1 });
  sim.step(900);
  const st = sim.stats(-w / 2 - 0.2, w / 2 + 0.2);
  const Tth = tunnelingProbability(E, V0, w, 1);
  ok("tunnelling: T + R = 1", near(st.probLeft + st.probRight, 1, 5e-3), `${st.probLeft}+${st.probRight}`);
  ok("tunnelling: packet T ≈ plane-wave T", Math.abs(st.probRight - Tth) < 0.06, `${st.probRight} vs ${Tth}`);
  ok("packet mean energy ≈ E", near(st.energy, E, 0.03), st.energy);
}
{
  const sim = Q.createPacketSim({ V: Q.makePotential("barrier", 1, 0.6), x0: -15, sigma: 3, energyEV: 3, dtFs: 0.1 });
  sim.step(600); const st = sim.stats(-0.5, 0.5);
  ok("E ≫ V0: mostly transmitted", st.probRight > 0.9, st.probRight);
}
ok("makePotential shapes", Q.makePotential("step", 2, 1)(1) === 2 && Q.makePotential("well", 2, 1)(0) === -2 && Q.makePotential("double", 1, 0.5)(0) === 0 && Q.makePotential("double", 1, 0.5)(0.75) === 1);
// ---- qubit
{
  const zero = Q.qubitFromAngles(0, 0);
  ok("|0> bloch = +z", Q.bloch(zero).every((v, i) => near(v, [0, 0, 1][i])));
  const plus = Q.applyGate(zero, Q.GATES.H);
  ok("H|0> = +x", Q.bloch(plus).every((v, i) => near(v, [1, 0, 0][i], 1e-12)));
  ok("S|+x> = +y", Q.bloch(Q.applyGate(plus, Q.GATES.S)).every((v, i) => near(v, [0, 1, 0][i], 1e-12)));
  ok("X|0> = -z", near(Q.bloch(Q.applyGate(zero, Q.GATES.X))[2], -1));
  ok("T twice = S", (() => { const a = Q.bloch(Q.applyGate(Q.applyGate(plus, Q.GATES.T), Q.GATES.T)), b = Q.bloch(Q.applyGate(plus, Q.GATES.S)); return a.every((v, i) => near(v, b[i], 1e-12)); })());
  ok("Ry(π/2)|0> = +x", Q.bloch(Q.applyGate(zero, Q.rotation("y", Math.PI / 2))).every((v, i) => near(v, [1, 0, 0][i], 1e-12)));
  ok("Rx(π/2)|0> = -y", Q.bloch(Q.applyGate(zero, Q.rotation("x", Math.PI / 2))).every((v, i) => near(v, [0, -1, 0][i], 1e-12)));
  ok("Rz(π/2)|+x> = +y", Q.bloch(Q.applyGate(plus, Q.rotation("z", Math.PI / 2))).every((v, i) => near(v, [0, 1, 0][i], 1e-12)));
  ok("Bloch vector unit length", near(Math.hypot(...Q.bloch(Q.qubitFromAngles(1.1, 2.3))), 1));
  ok("gates are unitary (norm kept)", ["X", "Y", "Z", "H", "S", "T"].every((g) => { const s = Q.applyGate(Q.qubitFromAngles(0.8, 0.4), Q.GATES[g]); return near(s.a[0] ** 2 + s.a[1] ** 2 + s.b[0] ** 2 + s.b[1] ** 2, 1); }));
  ok("Stern–Gerlach z→x→z = 25 %", near(Q.sgChain(Q.bloch(zero), ["z", "x", "z"]).at(-1), 0.25));
  ok("z→z→z stays 100 %", near(Q.sgChain(Q.bloch(zero), ["z", "z"]).at(-1), 1));
  ok("probPlus x for |0> is ½", near(Q.probPlus(Q.bloch(zero), Q.AXES.x), 0.5));
}
// ---- hydrogen
ok("R10 at 0 = 2", near(Q.hydrogenRadial(1, 0, 0), 2, 1e-12));
for (const [n, l] of [[1, 0], [2, 0], [2, 1], [3, 2], [4, 1], [5, 3]]) {
  ok(`R_${n}${l} normalised`, near(integ((r) => Q.hydrogenRadial(n, l, r) ** 2 * r * r, 0, 40 * n * n, 40000), 1, 1e-4));
  ok(`<r> ${n}${l}`, near(integ((r) => Q.hydrogenRadial(n, l, r) ** 2 * r ** 3, 0, 40 * n * n, 40000), Q.hydrogenMeanR(n, l), 1e-3 * n * n));
}
ok("angular densities integrate to 1", [[0, 0], [1, 0], [1, 1], [2, 1], [3, 2]].every(([l, m]) => near(2 * Math.PI * integ((c) => Q.angularDensity(l, m, c), -1, 1, 4000), 1, 1e-5)));
ok("R_20 has a radial node at r = 2", near(Q.hydrogenRadial(2, 0, 2), 0, 1e-12));
ok("2p density zero in the xy plane", near(Q.hydrogenDensity(2, 1, 0, 3, 0), 0, 1e-15));
ok("3d m=0 density has a nodal cone at 54.7°", near(Q.angularDensity(2, 0, Math.cos(Math.acos(Math.sqrt(1 / 3)))), 0, 1e-12));
ok("hydrogen energies", near(Q.hydrogenEnergy(1), -13.6057, 1e-4) && near(Q.hydrogenEnergy(2), -3.4014, 1e-3));
// ---- Mach–Zehnder
ok("MZ φ=0 all to D1; φ=π all to D2", near(Q.machZehnder(0).d1, 1) && near(Q.machZehnder(Math.PI).d2, 1));
ok("MZ probabilities sum to 1", near(Q.machZehnder(1.3).d1 + Q.machZehnder(1.3).d2, 1));
ok("bomb tester 50/25/25", (() => { const b = Q.bombTester(); return near(b.absorbed + b.d1 + b.d2, 1) && b.d2 === 0.25; })());

// ================= hydro
{
  const b = H.buoyancy(998, 500, 0.1);
  ok("floating: Fb = W, 50 % submerged", near(b.Fb, b.W, 1e-9) && near(b.subFrac, 500 / 998, 1e-12) && b.floats);
  const s = H.buoyancy(998, 7800, 0.1);
  ok("sinking: apparent weight = W − Fb", !s.floats && near(s.apparent, s.W - s.Fb) && s.net > 0);
  ok("hydrostatic 10 m water ≈ 2 atm", near(H.hydrostaticPressure(998, 10) / H.ATM, 1.966, 5e-3));
  ok("Torricelli v at 1 m", near(H.torricelliSpeed(1), 4.4294, 1e-3));
  // numeric ODE vs analytic head
  let h = 1.2, t = 0; const dt = 1e-3, R = 0.2, r = 0.01, Cd = 0.6;
  while (t < 200) { h += -Cd * (r * r) / (R * R) * Math.sqrt(2 * H.G * Math.max(h, 0)) * dt; t += dt; }
  ok("Torricelli analytic head matches ODE", near(H.torricelliHead(1.2, R, r, Cd, 200), h, 2e-3), `${H.torricelliHead(1.2, R, r, Cd, 200)} vs ${h}`);
  ok("empty time makes head zero", H.torricelliHead(1.2, R, r, Cd, H.torricelliEmptyTime(1.2, R, r, Cd) + 1e-6) === 0 && H.torricelliHead(1.2, R, r, Cd, H.torricelliEmptyTime(1.2, R, r, Cd) * 0.99) > 0);
  ok("jet range 2√(h y)", near(H.torricelliRange(0.8, 0.5), 2 * Math.sqrt(0.4)));
}
{
  const mu = 1e-3, R = 0.002, L = 1.5, dP = 40;
  const p = H.poiseuille(mu, 998, R, L, dP);
  const Qint = integ((r) => H.poiseuilleProfile(mu, R, L, dP, r) * 2 * Math.PI * r, 0, R);
  ok("Poiseuille Q = ∫ v dA", near(Qint, p.Q, p.Q * 1e-5), `${Qint} vs ${p.Q}`);
  ok("v_max = 2 v_avg", near(H.poiseuilleProfile(mu, R, L, dP, 0), p.vmax, 1e-12));
  ok("Q ∝ R⁴", near(H.poiseuille(mu, 998, 2 * R, L, dP).Q / p.Q, 16));
  ok("no slip at wall", H.poiseuilleProfile(mu, R, L, dP, R) === 0);
}
{
  const U = 3, a = 0.5;
  for (const g of [0, 4, -6]) {
    let maxVn = 0; for (let th = 0; th < 6.3; th += 0.1) { const [u, v] = H.cylinderVelocity(a * Math.cos(th) * 1.0000001, a * Math.sin(th) * 1.0000001, U, a, g); maxVn = Math.max(maxVn, Math.abs(u * Math.cos(th) + v * Math.sin(th))); }
    ok(`surface is a streamline (Γ=${g})`, maxVn < 1e-5, maxVn);
    const surf = (th) => { const [u, v] = H.cylinderVelocity(a * Math.cos(th) * 1.0000001, a * Math.sin(th) * 1.0000001, U, a, g); return -u * Math.sin(th) + v * Math.cos(th); };
    ok(`tangential speed formula (Γ=${g})`, near(surf(1.1), H.cylinderSurfaceSpeed(1.1, U, a, g), 1e-5));
    const rho = 1000; // lift by integrating pressure
    const liftNum = -integ((th) => 0.5 * rho * U * U * H.pressureCoefficient(H.cylinderSurfaceSpeed(th, U, a, g), U) * Math.sin(th) * a, 0, 2 * Math.PI, 20000);
    ok(`lift by pressure integral = ρUΓ_cw (Γ=${g})`, near(liftNum, H.kuttaLift(rho, U, g), 1e-6 * Math.max(1, Math.abs(H.kuttaLift(rho, U, g)))), `${liftNum} vs ${H.kuttaLift(rho, U, g)}`);
    const drag = -integ((th) => 0.5 * rho * U * U * H.pressureCoefficient(H.cylinderSurfaceSpeed(th, U, a, g), U) * Math.cos(th) * a, 0, 2 * Math.PI, 20000);
    ok(`d'Alembert: zero drag (Γ=${g})`, Math.abs(drag) < 1e-6, drag);
  }
  ok("stagnation points at Γ=0: θ=0,π", (() => { const s = H.cylinderStagnation(3, 0.5, 0); return near(s[0], 0) && near(s[1], Math.PI); })());
  ok("stagnation leaves surface for large Γ", H.cylinderStagnation(3, 0.5, 4 * Math.PI * 0.5 * 3 * 1.2) === null);
  ok("stagnation speed zero", (() => { const g = 5; const s = H.cylinderStagnation(3, 0.5, g); return near(H.cylinderSurfaceSpeed(s[0], 3, 0.5, g), 0, 1e-12); })());
  ok("far field → uniform stream", (() => { const [u, v] = H.cylinderVelocity(200, 150, U, a, 4); return near(u, U, 1e-2) && Math.abs(v) < 1e-2; })());
  ok("streamline wraps past cylinder", (() => { const sl = H.traceStreamline(-6, 0.3, U, a, 0, 6.5); return sl.at(-1)[0] > 5 && sl.every((p) => Math.hypot(p[0], p[1]) > a * 0.98); })());
}
{
  ok("Cd → 24/Re for small Re", near(H.sphereCd(0.001) * 0.001 / 24, 1, 5e-3));
  ok("Cd = 0.44 at high Re", H.sphereCd(1e5) === 0.44);
  ok("Cd continuous near 1000", Math.abs(H.sphereCd(999.9) - 0.44) < 0.05);
  const d = 0.001, rs = 7800, rf = 1420, mu = 10; // steel bead in honey
  const vt = H.terminalVelocity(d, rs, rf, mu), vs = H.stokesTerminal(rs, rf, d, mu);
  ok("terminal velocity ≈ Stokes at tiny Re", near(vt / vs, 1, 5e-3), `${vt} vs ${vs}`);
  ok("net force ≈ 0 at terminal", Math.abs(H.fallAcceleration(vt, d, rs, rf, mu)) < 1e-6);
  const sim = H.simulateFall(0.02, 1100, 1.225, 1.81e-5, 20);
  const vtAir = H.terminalVelocity(0.02, 1100, 1.225, 1.81e-5);
  ok("simulation approaches terminal speed", Math.abs(sim.at(-1).v - vtAir) / vtAir < 0.01, `${sim.at(-1).v} vs ${vtAir}`);
  ok("speed monotonic increasing", sim.every((p, i) => i === 0 || p.v >= sim[i - 1].v - 1e-12));
  ok("light sphere does not sink", H.terminalVelocity(0.01, 500, 998, 1e-3) === 0);
  ok("rain drop (2 mm) terminal ≈ 6–7 m/s", (() => { const v = H.terminalVelocity(0.002, 998, 1.225, 1.81e-5); return v > 5.5 && v < 8; })());
  ok("distance = ∫ v dt", (() => { const s = H.simulateFall(0.02, 1100, 1.225, 1.81e-5, 3, 600); let y = 0; for (let i = 1; i < s.length; i++) y += 0.5 * (s[i].v + s[i - 1].v) * (s[i].t - s[i - 1].t); return near(y, s.at(-1).y, 1e-9); })());
}
{
  const deep = H.waveProps(100, 5000), shallow = H.waveProps(5000, 10);
  ok("deep water c = √(gλ/2π)", near(deep.c, Math.sqrt(H.G * 100 / (2 * Math.PI)), 1e-6) && deep.regime === "deep");
  ok("deep cg = c/2", near(deep.cg / deep.c, 0.5, 1e-6));
  ok("shallow c = √(gh), cg = c", near(shallow.c, Math.sqrt(H.G * 10), 1e-2 * 10) && near(shallow.cg / shallow.c, 1, 1e-3) && shallow.regime === "shallow");
  ok("dispersion: longer waves faster in deep water", H.waveProps(200, 5000).c > H.waveProps(50, 5000).c);
  ok("orbit: circle in deep water at surface", (() => { const o = H.waveOrbit(1, deep.k, 5000, 5000); return near(o.ax / o.az, 1, 1e-6); })());
  ok("orbit: flat ellipse in shallow water", (() => { const o = H.waveOrbit(1, shallow.k, 10, 5); return o.az < 0.1 * o.ax; })());
  ok("orbit vertical amplitude = a at surface", near(H.waveOrbit(0.7, shallow.k, 10, 10).az, 0.7, 1e-12));
}
console.log(failed ? `\n${failed} FAILED` : "\nall passed");
