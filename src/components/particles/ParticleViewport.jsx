import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import StageCanvas from "../common/StageCanvas";
import { stepParticles, totalMomentum, totalKineticEnergy } from "../../physics/particles";

const BOUNDS_HALF = 5;
export const BALL_COLORS = ["#c084fc", "#f2a94e", "#4fd8e0", "#6bd68a", "#ef5b6f", "#5b8def", "#e0c34f", "#8de0c0"];

function BoundingBox() {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(BOUNDS_HALF * 2, BOUNDS_HALF * 2, BOUNDS_HALF * 2)), []);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#2a3a4d" />
    </lineSegments>
  );
}

/** Deterministic seeded PRNG (mulberry32), so a given ball count/config starts from a repeatable layout. */
function makeSeededRandom(seed) {
  let s = seed >>> 0;
  return function rand() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Build N particles from ball configs, spread on a ring with evenly-fanned inward velocities so they collide. */
function buildParticles(balls, resetToken) {
  const n = balls.length;
  const rand = makeSeededRandom(n * 7919 + resetToken * 104729 + 17);
  return balls.map((ball, i) => {
    const radius = 0.32 + Math.cbrt(ball.mass) * 0.22;
    const angle = (i / n) * Math.PI * 2;
    const ringR = BOUNDS_HALF * 0.55;
    const jitterY = (rand() - 0.5) * 2.4;
    const pos = new THREE.Vector3(Math.cos(angle) * ringR, jitterY, Math.sin(angle) * ringR);
    // Velocity points roughly inward/across the chamber, with a bit of per-ball randomness so paths aren't perfectly symmetric.
    const targetAngle = angle + Math.PI + (rand() - 0.5) * 1.1;
    const vel = new THREE.Vector3(Math.cos(targetAngle), (rand() - 0.5) * 0.3, Math.sin(targetAngle)).multiplyScalar(ball.speed);
    return { pos, vel, mass: ball.mass, radius, color: ball.color };
  });
}

function VelocityArrow({ i, arrowRefs }) {
  // ArrowHelper direction/length are mutated imperatively in the frame loop (see below),
  // so the JSX here only needs to mount it with sane initial values.
  return (
    <arrowHelper
      ref={(el) => { arrowRefs.current[i] = el; }}
      args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0xffffff, 0.3, 0.18]}
    />
  );
}

function ParticleSwarm({ balls, resetToken, playing, restitution, showVectors, onStats }) {
  const meshRefs = useRef([]);
  const arrowRefs = useRef([]);
  const playingRef = useRef(playing);
  useEffect(() => { playingRef.current = playing; }, [playing]);
  const restitutionRef = useRef(restitution);
  useEffect(() => { restitutionRef.current = restitution; }, [restitution]);

  const stateRef = useRef(null);

  const ballsSignature = balls.map((b) => `${b.mass}:${b.speed}`).join("|");
  useEffect(() => {
    stateRef.current = { particles: buildParticles(balls, resetToken), collisions: 0 };
    meshRefs.current = meshRefs.current.slice(0, balls.length);
    arrowRefs.current = arrowRefs.current.slice(0, balls.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken, ballsSignature]);

  useFrame((_, dt) => {
    const st = stateRef.current;
    if (!st) return;
    if (playingRef.current) {
      const clampedDt = Math.min(dt, 0.05);
      st.particles.forEach((p) => p.pos.addScaledVector(p.vel, clampedDt));
      st.collisions += stepParticles(st.particles, BOUNDS_HALF, restitutionRef.current);
    }
    st.particles.forEach((p, i) => {
      if (meshRefs.current[i]) meshRefs.current[i].position.copy(p.pos);
      const arrow = arrowRefs.current[i];
      if (arrow) {
        const speed = p.vel.length();
        if (speed > 1e-4) {
          arrow.setDirection(p.vel.clone().normalize());
          arrow.setLength(0.5 + speed * 0.45, 0.28, 0.14);
          arrow.position.copy(p.pos);
          arrow.setColor(new THREE.Color(p.color));
          arrow.visible = showVectors;
        } else {
          arrow.visible = false;
        }
      }
    });
  });

  useEffect(() => {
    const id = setInterval(() => {
      const st = stateRef.current;
      if (!st) return;
      onStats({
        momentum: totalMomentum(st.particles),
        ke: totalKineticEnergy(st.particles),
        collisions: st.collisions,
        speeds: st.particles.map((p) => p.vel.length()),
      });
    }, 200);
    return () => clearInterval(id);
  }, [onStats]);

  return (
    <>
      {balls.map((ball, i) => {
        const radius = 0.32 + Math.cbrt(ball.mass) * 0.22;
        return (
          <mesh key={i} ref={(el) => { meshRefs.current[i] = el; }}>
            <sphereGeometry args={[radius, 20, 20]} />
            <meshStandardMaterial color={ball.color} emissive={ball.color} emissiveIntensity={0.5} roughness={0.3} />
          </mesh>
        );
      })}
      {balls.map((_, i) => <VelocityArrow key={`arrow-${i}`} i={i} arrowRefs={arrowRefs} />)}
    </>
  );
}

export default function ParticleViewport({ balls, resetToken, playing, restitution = 1, showVectors = true, onStats }) {
  return (
    <StageCanvas cameraDistance={14} minDistance={6} maxDistance={30} autoRotateSpeed={0.5}>
      <BoundingBox />
      <ParticleSwarm
        balls={balls} resetToken={resetToken} playing={playing}
        restitution={restitution} showVectors={showVectors} onStats={onStats}
      />
    </StageCanvas>
  );
}
