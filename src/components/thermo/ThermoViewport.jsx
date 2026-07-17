import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import StageCanvas from "../common/StageCanvas";

const HALF_SIDE = 1.6;
const BASE_Y = -3;
const N_MOLECULES = 28;
const BASE_SPEED = 2.6;

function makeSeededRandom(seed) {
  let s = seed >>> 0;
  return function rand() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Cylinder({ height }) {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(HALF_SIDE * 2, height, HALF_SIDE * 2)), [height]);
  return (
    <group position={[0, BASE_Y + height / 2, 0]}>
      <mesh>
        <boxGeometry args={[HALF_SIDE * 2, height, HALF_SIDE * 2]} />
        <meshStandardMaterial color="#0d1622" transparent opacity={0.12} roughness={0.4} metalness={0.1} />
      </mesh>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color="#2a3a4d" />
      </lineSegments>
    </group>
  );
}

function Piston({ height }) {
  return (
    <mesh position={[0, BASE_Y + height + 0.08, 0]}>
      <boxGeometry args={[HALF_SIDE * 2.12, 0.16, HALF_SIDE * 2.12]} />
      <meshStandardMaterial color="#7c8a9c" emissive="#2a3a4d" emissiveIntensity={0.4} roughness={0.35} metalness={0.6} />
    </mesh>
  );
}

function GasMolecules({ heightRef, speedFactorRef, color }) {
  const meshRefs = useRef([]);
  const stateRef = useRef(null);

  useEffect(() => {
    const rand = makeSeededRandom(42);
    const molecules = Array.from({ length: N_MOLECULES }, () => {
      const x = (rand() * 2 - 1) * (HALF_SIDE - 0.2);
      const z = (rand() * 2 - 1) * (HALF_SIDE - 0.2);
      const y = BASE_Y + 0.2 + rand() * 1.5;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(rand() * 2 - 1);
      const dir = new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi) * 0.6, Math.sin(phi) * Math.sin(theta));
      return { pos: new THREE.Vector3(x, y, z), dir: dir.normalize() };
    });
    stateRef.current = molecules;
  }, []);

  useFrame((_, dt) => {
    const molecules = stateRef.current;
    if (!molecules) return;
    const height = heightRef.current;
    const speed = BASE_SPEED * speedFactorRef.current;
    const yMin = BASE_Y + 0.16;
    const yMax = BASE_Y + height - 0.16;
    const clampedDt = Math.min(dt, 0.05);

    molecules.forEach((m, i) => {
      m.pos.addScaledVector(m.dir, speed * clampedDt);
      if (m.pos.x > HALF_SIDE - 0.16) { m.pos.x = HALF_SIDE - 0.16; m.dir.x *= -1; }
      if (m.pos.x < -HALF_SIDE + 0.16) { m.pos.x = -HALF_SIDE + 0.16; m.dir.x *= -1; }
      if (m.pos.z > HALF_SIDE - 0.16) { m.pos.z = HALF_SIDE - 0.16; m.dir.z *= -1; }
      if (m.pos.z < -HALF_SIDE + 0.16) { m.pos.z = -HALF_SIDE + 0.16; m.dir.z *= -1; }
      if (m.pos.y > Math.max(yMax, yMin + 0.05)) { m.pos.y = Math.max(yMax, yMin + 0.05); m.dir.y *= -1; }
      if (m.pos.y < yMin) { m.pos.y = yMin; m.dir.y *= -1; }
      if (meshRefs.current[i]) meshRefs.current[i].position.copy(m.pos);
    });
  });

  return (
    <>
      {Array.from({ length: N_MOLECULES }).map((_, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el; }}>
          <sphereGeometry args={[0.09, 10, 10]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.1} />
        </mesh>
      ))}
    </>
  );
}

export default function ThermoViewport({ height, temperatureFactor, color = "#4fd8e0" }) {
  const heightRef = useRef(height);
  const speedFactorRef = useRef(Math.sqrt(Math.max(temperatureFactor, 0.05)));
  useEffect(() => { heightRef.current = height; }, [height]);
  useEffect(() => { speedFactorRef.current = Math.sqrt(Math.max(temperatureFactor, 0.05)); }, [temperatureFactor]);

  return (
    <StageCanvas cameraDistance={13} minDistance={6} maxDistance={26} autoRotateSpeed={0.35}>
      <Cylinder height={height} />
      <Piston height={height} />
      <GasMolecules heightRef={heightRef} speedFactorRef={speedFactorRef} color={color} />
    </StageCanvas>
  );
}
