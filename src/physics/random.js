/**
 * physics/random.js
 * -----------------------------------------------------------------------
 * Deterministic seeded PRNG (mulberry32), used everywhere a viewport needs
 * a stable, repeatable pseudo-random layout (particle starting positions,
 * nucleon packing, gas-molecule placement, etc.) that doesn't reshuffle on
 * every re-render. Previously copy-pasted verbatim into four separate
 * viewport files; consolidated here as the single source of truth.
 * -----------------------------------------------------------------------
 */
export function makeSeededRandom(seed) {
  let s = seed >>> 0;
  return function rand() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
