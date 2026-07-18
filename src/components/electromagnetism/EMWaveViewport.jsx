import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import StageCanvas from "../common/StageCanvas";

const LENGTH = 9;
const STEPS = 120;
const STEMS = 22;

function WaveCurve({ axis, color, amplitude, cyclesVisible, speed }) {
  const lineRef = useRef();
  const stemRefs = useRef([]);
  const phaseRef = useRef(0);

  const basePositions = useMemo(() => new Float32Array((STEPS + 1) * 3), []);
  const stemPositions = useMemo(() => Array.from({ length: STEMS }, () => new Float32Array(6)), []);

  useFrame((_, dt) => {
    phaseRef.current += dt * speed;
    const phase = phaseRef.current;
    const k = (2 * Math.PI * cyclesVisible) / LENGTH;

    const posAttr = lineRef.current?.geometry?.attributes?.position;
    for (let i = 0; i <= STEPS; i++) {
      const x = (i / STEPS) * LENGTH - LENGTH / 2;
      const val = amplitude * Math.sin(k * x - phase);
      basePositions[i * 3 + 0] = x;
      basePositions[i * 3 + 1] = axis === "y" ? val : 0;
      basePositions[i * 3 + 2] = axis === "z" ? val : 0;
    }
    if (posAttr) { posAttr.array.set(basePositions); posAttr.needsUpdate = true; }

    for (let s = 0; s < STEMS; s++) {
      const x = (s / (STEMS - 1)) * LENGTH - LENGTH / 2;
      const val = amplitude * Math.sin(k * x - phase);
      const arr = stemPositions[s];
      arr[0] = x; arr[1] = 0; arr[2] = 0;
      arr[3] = x; arr[4] = axis === "y" ? val : 0; arr[5] = axis === "z" ? val : 0;
      const stemAttr = stemRefs.current[s]?.geometry?.attributes?.position;
      if (stemAttr) { stemAttr.array.set(arr); stemAttr.needsUpdate = true; }
    }
  });

  return (
    <group>
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={STEPS + 1} array={basePositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={2} />
      </line>
      {stemPositions.map((arr, s) => (
        <line key={s} ref={(el) => { stemRefs.current[s] = el; }}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={2} array={arr} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color={color} transparent opacity={0.45} />
        </line>
      ))}
    </group>
  );
}

function PropagationAxis() {
  const geom = useMemo(() => {
    const points = [new THREE.Vector3(-LENGTH / 2 - 0.4, 0, 0), new THREE.Vector3(LENGTH / 2 + 0.4, 0, 0)];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);
  return (
    <line geometry={geom}>
      <lineBasicMaterial color="#7c8a9c" transparent opacity={0.5} />
    </line>
  );
}

export default function EMWaveViewport({ amplitude, wavelengthFrac, speedFactor }) {
  const cyclesVisible = 1 / wavelengthFrac;
  return (
    <StageCanvas cameraDistance={12} minDistance={6} maxDistance={24} autoRotateSpeed={0.4}>
      <PropagationAxis />
      <WaveCurve axis="y" color="#4fd8e0" amplitude={amplitude} cyclesVisible={cyclesVisible} speed={speedFactor} />
      <WaveCurve axis="z" color="#f2a94e" amplitude={amplitude} cyclesVisible={cyclesVisible} speed={speedFactor} />
    </StageCanvas>
  );
}
