import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import StageCanvas from "../common/StageCanvas";
import { pipeDiameterAt } from "../../physics/fluidDynamics";

const LENGTH = 10; // visual pipe length (world units), independent of physical units
const N_PARTICLES = 90;

function makeSeededRandom(seed) {
  let s = seed >>> 0;
  return function rand() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Visual pipe shell built by revolving a radius(y) profile around the flow axis — the
 * same converging/diverging throat shape used by the physics module (pipeDiameterAt). */
function PipeShell({ d1, d2 }) {
  const scale = 1.6 / d1; // fit the widest section to a consistent on-screen size
  const geometries = useMemo(() => {
    const steps = 48;
    const points = [];
    for (let i = 0; i <= steps; i++) {
      const xFrac = i / steps;
      const d = pipeDiameterAt(xFrac, d1, d2);
      const y = (xFrac - 0.5) * LENGTH;
      points.push(new THREE.Vector2(Math.max(0.02, (d / 2) * scale), y));
    }
    const lathe = new THREE.LatheGeometry(points, 28);
    const edges = new THREE.EdgesGeometry(lathe, 25);
    return { lathe, edges };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d1, d2]);

  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh geometry={geometries.lathe}>
        <meshStandardMaterial color="#0d1622" transparent opacity={0.14} roughness={0.4} metalness={0.15} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={geometries.edges}>
        <lineBasicMaterial color="#2a3a4d" />
      </lineSegments>
    </group>
  );
}

function FlowParticles({ d1, d2, v1, turbulence, color }) {
  const meshRefs = useRef([]);
  const stateRef = useRef(null);
  const scale = 1.6 / d1;

  useEffect(() => {
    const rand = makeSeededRandom(1337);
    const particles = Array.from({ length: N_PARTICLES }, () => {
      const y = (rand() - 0.5) * LENGTH;
      const angle = rand() * Math.PI * 2;
      const radialFrac = rand() * 0.82;
      return { y, angle, radialFrac, wobble: (rand() - 0.5) };
    });
    stateRef.current = particles;
  }, []);

  useFrame((_, dt) => {
    const particles = stateRef.current;
    if (!particles) return;
    const clampedDt = Math.min(dt, 0.05);
    particles.forEach((p, i) => {
      const xFrac = p.y / LENGTH + 0.5;
      const d = pipeDiameterAt(xFrac, d1, d2);
      const localSpeed = v1 * Math.pow(d1 / d, 2); // continuity: v ∝ 1/A ∝ 1/d²
      // Visual speed is scaled (not physically literal m/s), just proportional to the real ratio.
      p.y += localSpeed * 0.9 * clampedDt;
      if (p.y > LENGTH / 2) p.y -= LENGTH;

      // Turbulent jitter: laminar flow keeps particles on smooth parallel paths (angle fixed);
      // turbulence adds a wandering lateral wobble to represent chaotic eddies.
      p.angle += p.wobble * turbulence * clampedDt * 4;
      const jitter = 1 + Math.sin(p.y * 3 + p.angle * 2) * turbulence * 0.25;
      const r = (d / 2) * scale * p.radialFrac * jitter;

      const mesh = meshRefs.current[i];
      if (mesh) {
        // LatheGeometry revolves about local Y, so the pipe's length axis (before the group's
        // own rotation below) is Y — particles must use that same local frame to line up.
        mesh.position.set(r * Math.cos(p.angle), p.y, r * Math.sin(p.angle));
      }
    });
  });

  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {Array.from({ length: N_PARTICLES }).map((_, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el; }}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.1} />
        </mesh>
      ))}
    </group>
  );
}

export default function PipeViewport({ d1, d2, v1, turbulence, color }) {
  return (
    <StageCanvas cameraDistance={11} minDistance={5} maxDistance={24} autoRotateSpeed={0.3}>
      <PipeShell d1={d1} d2={d2} />
      <FlowParticles d1={d1} d2={d2} v1={v1} turbulence={turbulence} color={color} />
    </StageCanvas>
  );
}
