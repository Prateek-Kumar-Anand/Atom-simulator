import React, { useMemo } from "react";
import StageCanvas from "../common/StageCanvas";
import { wavelengthToColor } from "../../physics/constants";

const SCREEN_WIDTH = 8;

function ScreenStrip({ pattern, color }) {
  const maxI = Math.max(1e-6, ...pattern.map((p) => p.I));
  const barWidth = SCREEN_WIDTH / pattern.length;
  return (
    <group position={[0, 0, -3]}>
      {pattern.map((p, i) => {
        const t = p.I / maxI;
        const x = -SCREEN_WIDTH / 2 + i * barWidth;
        return (
          <mesh key={i} position={[x, 0, 0]}>
            <boxGeometry args={[barWidth * 0.95, 3.2, 0.08]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={Math.max(0.03, t * 1.4)} transparent opacity={0.35 + t * 0.65} />
          </mesh>
        );
      })}
    </group>
  );
}

function SlitBarrier({ mode, slitSeparationUm }) {
  const gap = mode === "double" ? Math.min(1.4, (slitSeparationUm / 60) * 0.6) : 0;
  return (
    <group position={[0, 0, 0]}>
      {mode === "single" ? (
        <>
          <mesh position={[0, 1.9, 0]}><boxGeometry args={[0.15, 3, 0.15]} /><meshStandardMaterial color="#7c8a9c" /></mesh>
          <mesh position={[0, -1.9, 0]}><boxGeometry args={[0.15, 3, 0.15]} /><meshStandardMaterial color="#7c8a9c" /></mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 2.6, 0]}><boxGeometry args={[0.15, 1.8, 0.15]} /><meshStandardMaterial color="#7c8a9c" /></mesh>
          <mesh position={[0, 0, 0]}><boxGeometry args={[0.15, gap, 0.15]} /><meshStandardMaterial color="#7c8a9c" /></mesh>
          <mesh position={[0, -2.6, 0]}><boxGeometry args={[0.15, 1.8, 0.15]} /><meshStandardMaterial color="#7c8a9c" /></mesh>
        </>
      )}
    </group>
  );
}

export default function DiffractionViewport({ mode, pattern, wavelengthNm, slitSeparationUm, slitWidthUm }) {
  const color = useMemo(() => wavelengthToColor(wavelengthNm), [wavelengthNm]);
  return (
    <StageCanvas cameraDistance={10} minDistance={5} maxDistance={20} autoRotateSpeed={0.25}>
      <SlitBarrier mode={mode} slitSeparationUm={slitSeparationUm} />
      <ScreenStrip pattern={pattern} color={color} />
    </StageCanvas>
  );
}
