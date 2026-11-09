export const THEORY = {
  atom: {
    title: "Atomic structure",
    body: [
      "An atom consists of a dense, positively charged nucleus (protons + neutrons) surrounded by electrons occupying discrete energy shells.",
      "Nuclear radius scales approximately as r ≈ r₀·A^(1/3), which is why heavier nuclei are only modestly larger than light ones.",
      "Shell capacities follow 2, 8, 8, 18, 18, 32 (2n² up to a cap) — the simplified Bohr model taught before quantum subshells (s, p, d, f).",
      "The periodic table's shape is a direct picture of subshell filling order: each row (period) ends when a shell of s/p subshells is complete, and an element's column (group) shares its outermost electron count — which is why elements in the same group behave chemically alike.",
    ],
  },
  spectrum: {
    title: "Hydrogen spectrum",
    body: [
      "Bohr's model restricts the electron to discrete orbits with energy Eₙ = −13.6 eV / n².",
      "A transition between levels emits or absorbs a photon with energy ΔE = |E_ni − E_nf|, and wavelength λ = hc / ΔE.",
      "Transitions ending on n=1 form the Lyman series (UV), n=2 the Balmer series (mostly visible), and n=3 the Paschen series (infrared).",
    ],
  },
  photoelectric: {
    title: "Photoelectric effect",
    body: [
      "Einstein's explanation: light arrives in quanta (photons) of energy E = hf, not as a continuous wave.",
      "An electron is only emitted if a single photon's energy exceeds the metal's work function φ; extra energy becomes kinetic energy: KEmax = hf − φ.",
      "Increasing intensity increases the number of photons per second (more electrons, if hf > φ) but never changes each photon's energy.",
    ],
  },
  decay: {
    title: "Radioactive decay",
    body: [
      "Decay is a random per-atom process. The population follows N(t) = N₀·e^(−λt), where λ = ln 2 / T½ is the decay constant.",
      "Half-life T½ is the time for half of a sample to decay — it is independent of how many atoms remain.",
      "Activity A(t) = λN(t) is the number of decays per second, and decreases exponentially alongside the population.",
    ],
  },
  particles: {
    title: "Particle collisions",
    body: [
      "For an elastic collision, both momentum (Σmv) and kinetic energy (Σ½mv²) are conserved.",
      "For two bodies colliding along the line joining their centers, exchanged velocity depends on the mass ratio — a light particle hitting a heavy one mostly bounces back.",
      "Wall bounces here are perfectly elastic (speed preserved, direction reflected), so total kinetic energy stays constant even though momentum direction changes at each wall.",
    ],
  },
  thermo: {
    title: "Thermodynamic processes",
    body: [
      "For an ideal gas, PV = nRT relates pressure, volume, and temperature at every instant, regardless of the process.",
      "Isothermal (T constant): W = nRT·ln(V2/V1), ΔU = 0. Isobaric (P constant): W = PΔV. Isochoric (V constant): W = 0. Adiabatic (Q = 0): all work comes from internal energy, ΔU = −W.",
      "The first law of thermodynamics, ΔU = Q − W, holds in every case — only how Q, W, and ΔU trade off against each other changes with the process.",
    ],
  },
  fluid: {
    title: "Fluid dynamics",
    body: [
      "Continuity (mass conservation): A₁v₁ = A₂v₂ — an incompressible fluid must speed up wherever the pipe narrows, since the same volume has to pass every cross-section per second.",
      "Bernoulli's equation (energy conservation along a streamline): P + ½ρv² stays constant, so the faster-moving fluid at a constriction is at lower pressure — the mechanism behind lift, atomizers, and Venturi meters.",
      "The Reynolds number Re = ρvD/μ compares inertial to viscous forces: low Re (< ~2300) gives smooth laminar flow, high Re (> ~4000) gives chaotic, mixing turbulent flow.",
      "Hydrostatics and buoyancy: pressure grows with depth as P = P₀ + ρgh, and a submerged body feels an upward force equal to the weight of the fluid it displaces (Archimedes). A body floats when its average density is below the fluid's.",
      "Torricelli's law: a jet leaves a hole at v = √(2gh), the speed of a body falling through the head h. The head obeys dh/dt ∝ −√h, so a tank empties in a time T = (A/a)√(2h₀/g)/Cd.",
      "Poiseuille flow: in a laminar pipe the velocity profile is a parabola and Q = πR⁴ΔP / 8μL — doubling the radius multiplies the flow sixteen-fold. Wall shear stress is τ = ΔP·R/2L.",
      "Potential flow past a cylinder: a uniform stream plus a doublet gives surface speed 2U sin θ, a symmetric pressure field and zero drag (d'Alembert's paradox). Adding circulation Γ gives lift per unit span L = ρUΓ (Kutta–Joukowski).",
      "Drag on a sphere: at low Reynolds number F = 3πμdv (Stokes), giving v_t = (ρₛ − ρ)gd²/18μ; at high Re drag grows as ½ρCdAv² with Cd ≈ 0.44. Terminal speed is where weight = buoyancy + drag.",
      "Surface gravity waves obey ω² = gk·tanh(kh): in deep water c = √(gλ/2π) (long waves faster), in shallow water c = √(gh). Water particles move in closed orbits that flatten with depth, and energy travels at the group speed.",
    ],
  },
  quantum: {
    title: "Quantum physics",
    body: [
      "Double slit: particles build up an interference pattern one at a time, but only when no which-path information exists — obtaining which-slit information erases the interference term and leaves only the single-slit diffraction envelope.",
      "Tunneling: a particle with energy below a barrier's height still has a nonzero probability of appearing on the far side, T = [1 + V0²sinh²(κL) / 4E(V0−E)]⁻¹ — classically forbidden, quantum mechanically routine (it's how scanning tunneling microscopes and some radioactive decay work).",
      "Entanglement: two particles can share a correlated quantum state so that measuring one instantly correlates with the other's outcome — but each individual result is still random, and confirming the correlation requires ordinary communication, so no information travels faster than light.",
      "Particle in a box: confinement quantises the energy, Eₙ = n²h²/8mL². The ground state is never at zero (zero-point energy), and a superposition of two levels oscillates at the beat frequency (E₂ − E₁)/h.",
      "Harmonic oscillator: levels are evenly spaced, Eₙ = (n + ½)ħω. The wavefunction penetrates the classically forbidden region, and a coherent state is a Gaussian that oscillates like a classical mass without spreading.",
      "Wave-packet scattering: solving the time-dependent Schrödinger equation shows a packet splitting into reflected and transmitted parts at a barrier, step or well; the packet obeys ΔxΔk ≥ ½ at all times.",
      "Spin-½ and the qubit: a two-level state is a point on the Bloch sphere, gates are rotations of it, and a measurement along n̂ gives '+' with probability (1 + r·n̂)/2. Sequential Stern–Gerlach filters (z → x → z) show that measuring one component destroys knowledge of another.",
      "Hydrogen orbitals: ψₙₗₘ = Rₙₗ(r)Yₗₘ(θ,φ) with Eₙ = −13.6 eV/n². n sets size and energy, l the shape and m the orientation; there are n − l − 1 radial and l angular nodes.",
      "Mach–Zehnder interferometer: a single photon takes both arms and interferes with itself, P(D1) = cos²(φ/2). The Elitzur–Vaidman bomb tester detects an absorbing object without the detected photon ever touching it.",
    ],
  },
  electromagnetism: {
    title: "Electromagnetism",
    body: [
      "Coulomb's law gives the field and potential of a point charge: E = kQ/r² (a vector pointing away from positive charge) and V = kQ/r (a scalar); field lines start on positive charges and end on negative ones, and their density represents field strength.",
      "Magnetic fields are always sourced by moving charge: a bar magnet's dipole pattern, a straight wire's concentric circles (B = μ0I/2πr, direction from the right-hand rule), and a solenoid's uniform interior field (B = μ0nI) are all the same underlying physics viewed at different geometries.",
      "The Lorentz force F = q(E + v × B) is what unifies electric and magnetic effects on a moving charge — the magnetic term is always perpendicular to velocity, so B alone can never speed a particle up or slow it down, only steer it into a curve.",
      "Maxwell's equations predict a self-sustaining electromagnetic wave: a changing E creates a B, a changing B creates an E, and the pair propagates at c = 1/√(μ0ε0) — no medium required.",
    ],
  },
  optics: {
    title: "Optics",
    body: [
      "Thin lenses and curved mirrors both obey a single reciprocal relationship between object and image distance (1/f = 1/v − 1/u for lenses, 1/f = 1/v + 1/u for mirrors); three principal rays are enough to construct any image geometrically.",
      "A real image is one where light rays actually converge (can be projected on a screen); a virtual image is where rays only appear to diverge from after passing through the optical element (found by extending rays backward).",
      "Snell's law, n1·sinθ1 = n2·sinθ2, governs refraction at any interface — light bends toward the normal entering a denser medium, and beyond the critical angle going the other way, it undergoes total internal reflection instead of transmitting at all.",
      "Diffraction (a single slit spreading light into a broad central band) and interference (two coherent slits adding wave crests and troughs) combine in Young's double-slit experiment: sharp interference fringes riding on top of a broader diffraction envelope.",
      "Dispersion: a glass's refractive index n(λ) is slightly higher for shorter wavelengths, so a prism bends violet light more than red — tracing each color's ray through both faces of a prism fans white light into a spectrum, the same demonstration Newton used in 1666.",
    ],
  },
  real: {
    title: "Real analysis",
    body: [
      "A sequence converges to L when, for every ε > 0, there is an N such that |aₙ − L| < ε for all n ≥ N. The smaller the tolerance ε, the further out N has to be — the lab finds the smallest N for you.",
      "A series Σaₙ converges when its partial sums Sₙ converge. The ratio test (ρ = lim |aₙ₊₁/aₙ|) and root test give convergence for ρ < 1 and divergence for ρ > 1; ρ = 1 is inconclusive — the harmonic series diverges while Σ1/n² converges, and both have ρ = 1. Conditionally convergent series such as the alternating harmonic series converge only because of cancellation.",
      "f is continuous at a when for every ε > 0 there is a δ > 0 with |x − a| < δ ⇒ |f(x) − f(a)| < ε. For 1/x the δ that works shrinks as a → 0, so the function is continuous everywhere on (0, ∞) but not uniformly continuous there.",
      "The Riemann integral is the common value of the lower sums L(f, P) and upper sums U(f, P) as the partition P refines; f is integrable exactly when U − L can be made arbitrarily small. Midpoint and trapezoid sums converge faster (error ∝ 1/n²) than left and right sums (∝ 1/n) for smooth f.",
      "Taylor's theorem: f(x) = Tₙ(x) + Rₙ(x) with Lagrange remainder |Rₙ(x)| ≤ M|x|ⁿ⁺¹/(n+1)!, where M bounds |f⁽ⁿ⁺¹⁾|. For sin, cos and eˣ the remainder → 0 for every x (radius ∞); for ln(1+x), 1/(1−x) and arctan x the series converges only for |x| < 1, however smooth the function is.",
    ],
  },
  complex: {
    title: "Complex analysis",
    body: [
      "A complex number z = x + iy is a point (x, y) of the plane, with modulus |z| = √(x² + y²) and argument θ = arg z. Euler's formula e^(iθ) = cos θ + i sin θ gives the polar form z = r·e^(iθ), so multiplying complex numbers multiplies their moduli and adds their arguments.",
      "De Moivre: zⁿ = rⁿ·e^(inθ). The equation wⁿ = z has exactly n solutions, ⁿ√r · e^(i(θ + 2πk)/n) for k = 0 … n−1: they lie on a circle, equally spaced at 360°/n.",
      "An analytic function (complex-differentiable on an open set) satisfies the Cauchy–Riemann equations and is conformal wherever f′(z) ≠ 0: it rotates every tangent direction by arg f′(z) and scales lengths by |f′(z)|, so it preserves angles. At zeros of f′ (such as z = 0 for z²) angles are multiplied instead.",
      "Domain colouring plots hue = arg f(z) and brightness = |f(z)|. Around a zero of order m the hue wheel winds m times in one direction, around a pole of order m in the opposite direction — the argument principle in picture form.",
      "Iterating z → z² + c: the Mandelbrot set is the set of c whose orbit of 0 stays bounded; the Julia set J_c is the boundary of the points that stay bounded for that c. J_c is connected exactly when c is in the Mandelbrot set, and Cantor dust otherwise (Fatou–Julia).",
    ],
  },
  vector: {
    title: "Vector spaces, gradients and the Laplace equation",
    body: [
      "Vectors v₁, v₂ form a basis of ℝ² when they are linearly independent (det[v₁ v₂] ≠ 0): every w is then c₁v₁ + c₂v₂ for exactly one pair (c₁, c₂). Gram–Schmidt turns any basis into an orthonormal one. A matrix is a linear map; its eigenvectors are the directions it only stretches, with det = λ₁λ₂ and trace = λ₁ + λ₂.",
      "The gradient ∇f = (∂f/∂x, ∂f/∂y) points in the direction of steepest ascent, is perpendicular to the level curves of f, and its length is the steepest slope. The directional derivative along a unit vector u is D_u f = ∇f · u.",
      "Gradient descent minimises f by iterating x ← x − η∇f(x). It converges for small enough η (for a quadratic with curvature λ_max, η < 2/λ_max); ill-conditioned valleys make it zig-zag, and heavy-ball momentum v ← βv − η∇f damps the zig-zag. Saddle points and several local minima (Himmelblau) show why the start point matters.",
      "Laplace's equation ∇²u = ∂²u/∂x² + ∂²u/∂y² = 0 governs steady-state temperature, electrostatic potential and irrotational flow. Its solutions (harmonic functions) obey the mean-value property — u at a point equals the average of u on any circle around it — and the maximum principle: extrema occur on the boundary.",
      "Discretised on a grid, ∇²u = 0 says each interior value is the average of its four neighbours. That makes Jacobi iteration exactly gradient descent on the Dirichlet energy E = ½∫|∇u|² with step ¼; Gauss–Seidel and over-relaxation (SOR) are faster descents on the same energy.",
    ],
  },
};
