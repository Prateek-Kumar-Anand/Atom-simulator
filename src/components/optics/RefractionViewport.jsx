import React from "react";
import { Line } from "@react-three/drei";
import StageCanvas from "../common/StageCanvas";

const LEN = 5;

function InterfacePlane() {
  return (
    <group>
      <mesh position={[0, -2.5, -0.05]} rotation={[0, 0, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#5b8def" transparent opacity={0.12} />
      </mesh>
      <Line points={[[-5, 0, 0], [5, 0, 0]]} color="#7c8a9c" lineWidth={1.5} />
      <Line points={[[0, -3.5, 0], [0, 3.5, 0]]} color="#3a4a5c" lineWidth={1} dashed dashSize={0.15} gapSize={0.1} />
    </group>
  );
}

export default function RefractionViewport({ theta1Deg, theta2Deg, tir }) {
  const t1 = (theta1Deg * Math.PI) / 180;
  const incident = [[-Math.sin(t1) * LEN, Math.cos(t1) * LEN, 0], [0, 0, 0]];

  let secondRay = null;
  let secondColor = "#4fd8e0";
  if (tir) {
    const reflected = [[0, 0, 0], [Math.sin(t1) * LEN, Math.cos(t1) * LEN, 0]];
    secondRay = reflected;
    secondColor = "#ef5b6f";
  } else if (theta2Deg !== null) {
    const t2 = (theta2Deg * Math.PI) / 180;
    secondRay = [[0, 0, 0], [Math.sin(t2) * LEN, -Math.cos(t2) * LEN, 0]];
  }

  return (
    <StageCanvas cameraDistance={9} minDistance={4} maxDistance={18} autoRotateSpeed={0}>
      <InterfacePlane />
      <Line points={incident} color="#f2a94e" lineWidth={2.4} />
      {secondRay && <Line points={secondRay} color={secondColor} lineWidth={2.4} />}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#e8eef5" emissive="#e8eef5" emissiveIntensity={0.6} />
      </mesh>
    </StageCanvas>
  );
}
