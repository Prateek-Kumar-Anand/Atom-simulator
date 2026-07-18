import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import StageCanvas from "../common/StageCanvas";

const WORLD_SCALE = 1; // trajectory is already computed in meter-scale units that fit the viewport

function FieldRegionBox() {
  return (
    <mesh>
      <boxGeometry args={[8, 8, 8]} />
      <meshStandardMaterial color="#1f2b3a" wireframe transparent opacity={0.35} />
    </mesh>
  );
}

function TrajectoryPath({ points, color }) {
  return <Line points={points} color={color} lineWidth={2.4} />;
}

function MovingParticle({ points, color }) {
  const ref = useRef();
  const idx = useRef(0);
  useFrame(() => {
    if (!ref.current || points.length === 0) return;
    idx.current = (idx.current + 1) % points.length;
    const p = points[idx.current];
    ref.current.position.set(p[0], p[1], p[2]);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.14, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
    </mesh>
  );
}

export default function LorentzForceViewport({ trajectoryPoints, particleCharge }) {
  const points = useMemo(
    () => trajectoryPoints.map((p) => [p.x * WORLD_SCALE, p.y * WORLD_SCALE, p.z * WORLD_SCALE]),
    [trajectoryPoints]
  );
  const color = particleCharge >= 0 ? "#ef5b6f" : "#5b8def";

  return (
    <StageCanvas cameraDistance={9} minDistance={4} maxDistance={20} autoRotateSpeed={0.25}>
      <FieldRegionBox />
      {points.length > 1 && <TrajectoryPath points={points} color={color} />}
      {points.length > 1 && <MovingParticle points={points} color={color} />}
    </StageCanvas>
  );
}
