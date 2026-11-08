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

const HALF_SPAN = 3.4; // total half-height of the barrier structure

function SlitBarrier({ mode, slitSeparationUm, slitWidthUm }) {
  // Visual height of each individual slit opening — this used to be ignored
  // entirely, so the "slit width" slider had no effect on the 3D scene even
  // though it correctly changed the physics/chart.
  const openingH = Math.min(1.2, Math.max(0.12, (slitWidthUm / 50) * 1.2));

  if (mode === "single") {
    const barLen = HALF_SPAN - openingH / 2;
    const barY = openingH / 2 + barLen / 2;
    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, barY, 0]}><boxGeometry args={[0.15, barLen, 0.15]} /><meshStandardMaterial color="#64748b" /></mesh>
        <mesh position={[0, -barY, 0]}><boxGeometry args={[0.15, barLen, 0.15]} /><meshStandardMaterial color="#64748b" /></mesh>
      </group>
    );
  }

  // Double slit: a central opaque post separates the two openings. Its height
  // tracks the separation slider (as before); each opening's own height now
  // tracks the width slider instead of staying a fixed size.
  const postHeight = Math.min(1.8, Math.max(0.3, (slitSeparationUm / 200) * 1.8));
  const outerLen = HALF_SPAN - postHeight / 2 - openingH;
  const outerY = postHeight / 2 + openingH + outerLen / 2;
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, outerY, 0]}><boxGeometry args={[0.15, outerLen, 0.15]} /><meshStandardMaterial color="#64748b" /></mesh>
      <mesh position={[0, 0, 0]}><boxGeometry args={[0.15, postHeight, 0.15]} /><meshStandardMaterial color="#64748b" /></mesh>
      <mesh position={[0, -outerY, 0]}><boxGeometry args={[0.15, outerLen, 0.15]} /><meshStandardMaterial color="#64748b" /></mesh>
    </group>
  );
}

export default function DiffractionViewport({ mode, pattern, wavelengthNm, slitSeparationUm, slitWidthUm }) {
  const color = useMemo(() => wavelengthToColor(wavelengthNm), [wavelengthNm]);
  return (
    <StageCanvas cameraDistance={10} minDistance={5} maxDistance={20} autoRotateSpeed={0.25}>
      <SlitBarrier mode={mode} slitSeparationUm={slitSeparationUm} slitWidthUm={slitWidthUm} />
      <ScreenStrip pattern={pattern} color={color} />
    </StageCanvas>
  );
}
