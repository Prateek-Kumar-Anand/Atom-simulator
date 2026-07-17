/**
 * physics/particles.js
 * -----------------------------------------------------------------------
 * Elastic two-body collision, general vector form. For particles at
 * positions x1, x2 with velocities v1, v2 and masses m1, m2, colliding
 * along the line joining their centers:
 *
 *   n   = (x1 - x2) / |x1 - x2|                  (unit normal)
 *   Δv  = (v1 - v2) · n
 *   v1' = v1 - (2 m2 / (m1 + m2)) Δv n
 *   v2' = v2 + (2 m1 / (m1 + m2)) Δv n
 *
 * This simultaneously conserves total momentum (Σ m v) and total kinetic
 * energy (Σ ½ m v²) — the two invariants a student should see hold
 * steady in the simulation's readouts. Wall bounces simply negate the
 * velocity component along the wall's normal (coefficient of
 * restitution = 1), which also preserves speed and therefore total KE,
 * even though the *system's* momentum vector changes at each bounce
 * (expected: the wall is an external body, not part of the two-particle
 * system).
 *
 * stepParticles() extends this to any number of bodies by resolving every
 * unique pair each tick — physically correct as long as no more than two
 * particles occupy the same point in time (true for the sphere sizes and
 * particle counts used here), since real multi-body collisions are rare
 * simultaneous events, not a distinct three-body physical law.
 *
 * Inelastic collisions are modeled with a coefficient of restitution e
 * (0 ≤ e ≤ 1), the standard generalization of the elastic formula above:
 *   v1' = v1 − ((1+e) m2 / (m1+m2)) Δv n
 *   v2' = v2 + ((1+e) m1 / (m1+m2)) Δv n
 * e = 1 recovers the perfectly elastic case (KE conserved); e = 0 is a
 * perfectly inelastic collision along the line of impact (the colliding
 * pair's velocity component along n becomes equal — they stop separating
 * — while total momentum stays exactly conserved regardless of e, since
 * restitution only changes how much KE the impact dissipates, not the
 * momentum bookkeeping). Wall bounces stay perfectly elastic (e = 1) so
 * the system doesn't simply run out of energy demonstrating an inelastic
 * particle-particle interaction.
 * -----------------------------------------------------------------------
 */
import * as THREE from "three";

export function resolveWallCollision(p, boundsHalf) {
  ["x", "y", "z"].forEach((axis) => {
    if (p.pos[axis] > boundsHalf - p.radius) {
      p.pos[axis] = boundsHalf - p.radius;
      p.vel[axis] *= -1;
    }
    if (p.pos[axis] < -boundsHalf + p.radius) {
      p.pos[axis] = -boundsHalf + p.radius;
      p.vel[axis] *= -1;
    }
  });
}

/** Returns true if a and b collided (and mutates their positions/velocities per the given restitution e). */
export function resolveParticleCollision(a, b, restitution = 1) {
  const delta = new THREE.Vector3().subVectors(a.pos, b.pos);
  const dist = delta.length();
  const minDist = a.radius + b.radius;
  if (dist >= minDist || dist <= 1e-4) return false;

  const n = delta.clone().normalize();
  const overlap = (minDist - dist) / 2;
  a.pos.addScaledVector(n, overlap);
  b.pos.addScaledVector(n, -overlap);

  const relVel = new THREE.Vector3().subVectors(a.vel, b.vel);
  const dot = relVel.dot(n);
  if (dot >= 0) return false; // already separating, no impulse needed

  const factorA = (((1 + restitution) * b.mass) / (a.mass + b.mass)) * dot;
  const factorB = (((1 + restitution) * a.mass) / (a.mass + b.mass)) * dot;
  a.vel.addScaledVector(n, -factorA);
  b.vel.addScaledVector(n, factorB);
  return true;
}

/** Resolve wall collisions for every particle, then every pairwise collision. Returns the number of particle-particle collisions this step. */
export function stepParticles(particles, boundsHalf, restitution = 1) {
  for (const p of particles) resolveWallCollision(p, boundsHalf);
  let collisions = 0;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      if (resolveParticleCollision(particles[i], particles[j], restitution)) collisions++;
    }
  }
  return collisions;
}

export function totalMomentum(particles) {
  return particles
    .reduce((acc, p) => acc.addScaledVector(p.vel, p.mass), new THREE.Vector3())
    .length();
}

export function totalKineticEnergy(particles) {
  return particles.reduce((sum, p) => sum + 0.5 * p.mass * p.vel.lengthSq(), 0);
}
