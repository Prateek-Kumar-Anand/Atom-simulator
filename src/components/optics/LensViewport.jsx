import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import StageCanvas from "../common/StageCanvas";

const SCALE = 0.28; // cm -> world units

function AxisLine({ xFar }) {
  return <Line points={[[-xFar, 0, 0], [xFar, 0, 0]]} color="#2a3a4d" lineWidth={1} />;
}

function LensShape({ isConvex }) {
  const h = 3.2;
  if (isConvex) {
    return (
      <mesh>
        <cylinderGeometry args={[h, h, 0.35, 32, 1, false, 0, Math.PI * 2]} />
        <meshStandardMaterial color="#4fd8e0" transparent opacity={0.22} />
      </mesh>
    );
  }
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.18, h * 2, 0.35]} />
        <meshStandardMaterial color="#f2a94e" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function Arrow({ x, height, color, dashed }) {
  const points = [[x, 0, 0.05], [x, height, 0.05]];
  return (
    <group>
      <Line points={points} color={color} lineWidth={2.5} dashed={dashed} dashSize={0.15} gapSize={0.1} />
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

export default function LensViewport({ rays, objX, objHeight, imgX, imgHeight, isConvex, isVirtual, xFar }) {
  const worldRays = useMemo(() => ({
    ray1: rays.ray1.map(([x, y]) => [x * SCALE, y * SCALE]),
    ray2: rays.ray2.map(([x, y]) => [x * SCALE, y * SCALE]),
    ray3: rays.ray3.map(([x, y]) => [x * SCALE, y * SCALE]),
  }), [rays]);

  return (
    <StageCanvas cameraDistance={10} minDistance={4} maxDistance={20} autoRotateSpeed={0}>
      <AxisLine xFar={xFar * SCALE} />
      <LensShape isConvex={isConvex} />
      <Ray points={worldRays.ray1} color="#4fd8e0" />
      <Ray points={worldRays.ray2} color="#6bd68a" />
      <Ray points={worldRays.ray3} color="#f2a94e" />
      <Arrow x={objX * SCALE} height={objHeight * SCALE} color="#e8eef5" />
      <Arrow x={imgX * SCALE} height={imgHeight * SCALE} color={isVirtual ? "#c084fc" : "#ef5b6f"} dashed={isVirtual} />
    </StageCanvas>
  );
}
