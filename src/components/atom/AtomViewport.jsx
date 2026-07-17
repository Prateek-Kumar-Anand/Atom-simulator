import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import StageCanvas from "../common/StageCanvas";

const SHELL_COLORS = ["#4fd8e0", "#6bd68a", "#f2a94e", "#c084fc", "#5b8def", "#ef5b6f"];

const NUCLEON_RADIUS = 0.32;

/** Deterministic seeded PRNG (mulberry32) so the packing is stable across re-renders. */
function makeSeededRandom(seed) {
  let s = seed >>> 0;
  return function rand() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Tight nucleon packing: nucleons start at random points inside a small ball
 * and are relaxed (pairwise separation + gentle centering pull) until every
 * pair sits at ~touching distance (2 × nucleon radius). This is a compact,
 * jitter-free cluster — much closer to how a real nucleus looks — instead of
 * the loose, evenly-spread-out fibonacci-sphere layout used previously.
 */
function useNucleonLayout(protons, neutrons) {
  return useMemo(() => {
    const total = protons + neutrons;
    if (total === 0) return { positions: [], nucleusRadius: 0.85 };

    const flags = [];
    let pLeft = protons, nLeft = neutrons;
    for (let i = 0; i < total; i++) {
      if (pLeft > 0 && (pLeft >= nLeft || nLeft === 0)) { flags.push("p"); pLeft--; }
      else { flags.push("n"); nLeft--; }
    }

    const rand = makeSeededRandom(total * 9301 + 49297);
    const startRadius = NUCLEON_RADIUS * (Math.cbrt(total) * 0.9 + 0.6);
    const pos = [];
    for (let i = 0; i < total; i++) {
      let x, y, z, d2;
      do {
        x = rand() * 2 - 1; y = rand() * 2 - 1; z = rand() * 2 - 1;
        d2 = x * x + y * y + z * z;
      } while (d2 > 1 || d2 < 1e-6);
      pos.push([x * startRadius, y * startRadius, z * startRadius]);
    }

    const minDist = NUCLEON_RADIUS * 1.96; // nearly touching, slight gap to avoid z-fighting
    const iterations = 180;
    for (let iter = 0; iter < iterations; iter++) {
      let cx = 0, cy = 0, cz = 0;
      for (const p of pos) { cx += p[0]; cy += p[1]; cz += p[2]; }
      cx /= total; cy /= total; cz /= total;
      const pull = 0.006;
      for (const p of pos) { p[0] -= cx * pull; p[1] -= cy * pull; p[2] -= cz * pull; }

      for (let i = 0; i < total; i++) {
        for (let j = i + 1; j < total; j++) {
          const dx = pos[j][0] - pos[i][0], dy = pos[j][1] - pos[i][1], dz = pos[j][2] - pos[i][2];
          let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < 1e-6) dist = 1e-6;
          if (dist < minDist) {
            const push = (minDist - dist) * 0.5;
            const nx = dx / dist, ny = dy / dist, nz = dz / dist;
            pos[i][0] -= nx * push; pos[i][1] -= ny * push; pos[i][2] -= nz * push;
            pos[j][0] += nx * push; pos[j][1] += ny * push; pos[j][2] += nz * push;
          }
        }
      }
    }

    let maxDist = 0;
    for (const p of pos) {
      const d = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
      if (d > maxDist) maxDist = d;
    }
    const nucleusRadius = maxDist + NUCLEON_RADIUS;
    const positions = pos.map((p, i) => ({ pos: p, isProton: flags[i] === "p" }));
    return { positions, nucleusRadius };
  }, [protons, neutrons]);
}

function Nucleon({ position, isProton }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[NUCLEON_RADIUS, 16, 16]} />
      <meshStandardMaterial
        color={isProton ? "#ef5b6f" : "#5b8def"}
        emissive={isProton ? "#6b1620" : "#152a52"}
        emissiveIntensity={0.65}
        roughness={0.35}
        metalness={0.2}
      />
    </mesh>
  );
}

function ElectronShell({ radius, count, index }) {
  const spinnerRef = useRef();
  const speed = 0.55 / (index * 0.65 + 1); // outer shells drift more slowly
  useFrame((_, dt) => { if (spinnerRef.current) spinnerRef.current.rotation.y += speed * dt; });
  const color = SHELL_COLORS[index % SHELL_COLORS.length];

  return (
    <group rotation={[0.35 * index + 0.25, 0, 0.22 * index]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.012, 8, 96]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      <group ref={spinnerRef}>
        {Array.from({ length: count }).map((_, e) => {
          const angle = (e / count) * Math.PI * 2;
          return (
            <mesh key={e} position={[radius * Math.cos(angle), 0, radius * Math.sin(angle)]}>
              <sphereGeometry args={[0.17, 12, 12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.15} roughness={0.2} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function AtomModel({ protons, neutrons, shellCounts }) {
  const { positions, nucleusRadius } = useNucleonLayout(protons, neutrons);
  return (
    <group>
      {positions.map((n, i) => <Nucleon key={i} position={n.pos} isProton={n.isProton} />)}
      {shellCounts.map((count, i) => (
        <ElectronShell key={i} radius={nucleusRadius + 1.7 + i * 1.3} count={count} index={i} />
      ))}
    </group>
  );
}

export default function AtomViewport({ protons, neutrons, shellCounts }) {
  return (
    <StageCanvas cameraDistance={9 + shellCounts.length * 1.5} minDistance={4} maxDistance={42}>
      <AtomModel protons={protons} neutrons={neutrons} shellCounts={shellCounts} />
    </StageCanvas>
  );
}
