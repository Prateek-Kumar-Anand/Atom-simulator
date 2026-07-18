import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import StageCanvas from "../common/StageCanvas";

const SCALE = 0.28;

function AxisLine({ xFar }) {
  return <Line points={[[-xFar, 0, 0], [xFar, 0, 0]]} color="#2a3a4d" lineWidth={1} />;
}

function MirrorSurface({ kind }) {
  const h = 3.4;
  if (kind === "plane") {
    return <Line points={[[0, -h, 0], [0, h, 0]]} color="#4fd8e0" lineWidth={3} />;
  }
  const bulge = kind === "concave" ? 0.55 : -0.55;
  const pts = Array.from({ length: 40 }, (_, i) => {
    const t = (i / 39) * 2 - 1; // -1..1
    const y = t * h;
    const x = bulge * (1 - t * t);
    return [x, y, 0];
  });
  return <Line points={pts} color="#4fd8e0" lineWidth={3} />;
}

function Arrow({ x, height, color, dashed }) {
  return (
    <group>
      <Line points={[[x, 0, 0.05], [x, height, 0.05]]} color={color} lineWidth={2.5} dashed={dashed} dashSize={0.15} gapSize={0.1} />
      <mesh position={[x, height, 0.05]} rotation={[0, 0, height >= 0 ? 0 : Math.PI]}>
        <coneGeometry args={[0.14, 0.35, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

function Ray({ points, color }) {
  return <Line points={points.map(([x, y]) => [x, y, 0])} color={color} lineWidth={1.6} transparent opacity={0.85} />;
}

export default function MirrorViewport({ rays, objX, objHeight, imgX, imgHeight, kind, isVirtual, xFar }) {
  const worldRays = useMemo(() => rays ? {
    ray1: rays.ray1.map(([x, y]) => [x * SCALE, y * SCALE]),
    ray2: rays.ray2.map(([x, y]) => [x * SCALE, y * SCALE]),
    ray3: rays.ray3.map(([x, y]) => [x * SCALE, y * SCALE]),
  } : null, [rays]);

  return (
    <StageCanvas cameraDistance={10} minDistance={4} maxDistance={20} autoRotateSpeed={0}>
      <AxisLine xFar={xFar * SCALE} />
      <MirrorSurface kind={kind} />
      {worldRays && <Ray points={worldRays.ray1} color="#4fd8e0" />}
      {worldRays && <Ray points={worldRays.ray2} color="#6bd68a" />}
      {worldRays && <Ray points={worldRays.ray3} color="#f2a94e" />}
      <Arrow x={objX * SCALE} height={objHeight * SCALE} color="#e8eef5" />
      <Arrow x={imgX * SCALE} height={imgHeight * SCALE} color={isVirtual ? "#c084fc" : "#ef5b6f"} dashed={isVirtual} />
    </StageCanvas>
  );
}
