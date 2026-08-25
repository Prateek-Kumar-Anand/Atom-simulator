import React, { useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import StageCanvas from "../common/StageCanvas";

const SCALE = 1.15;

function toWorld(p) {
  return [p.x * SCALE, p.y * SCALE, 0];
}

function PrismSolid({ apex, baseLeft, baseRight }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(apex.x * SCALE, apex.y * SCALE);
    shape.lineTo(baseLeft.x * SCALE, baseLeft.y * SCALE);
    shape.lineTo(baseRight.x * SCALE, baseRight.y * SCALE);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.7, bevelEnabled: false, curveSegments: 1 });
    geo.translate(0, 0, -0.35);
    return geo;
  }, [apex, baseLeft, baseRight]);

  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        color="#bfe8ff"
        transparent
        opacity={0.24}
        roughness={0.05}
        metalness={0}
        transmission={0.55}
        thickness={0.8}
        ior={1.45}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function PrismEdges({ apex, baseLeft, baseRight }) {
  const pts = [toWorld(apex), toWorld(baseLeft), toWorld(baseRight), toWorld(apex)];
  return <Line points={pts} color="#8fd8ea" lineWidth={1.6} transparent opacity={0.75} />;
}

function RaySegment({ points, color, width = 1.8, dashed = false, opacity = 0.95 }) {
  if (!points) return null;
  return (
    <Line
      points={points.map(toWorld)}
      color={color}
      lineWidth={width}
      dashed={dashed}
      dashSize={0.12}
      gapSize={0.08}
      transparent
      opacity={opacity}
    />
  );
}

function TirSpark({ point }) {
  if (!point) return null;
  return (
    <mesh position={toWorld(point)}>
      <sphereGeometry args={[0.09, 12, 12]} />
      <meshStandardMaterial color="#ef5b6f" emissive="#ef5b6f" emissiveIntensity={1.2} />
    </mesh>
  );
}

export default function PrismViewport({ geometryBase, rays, mode }) {
  if (!geometryBase) return <StageCanvas cameraDistance={9} minDistance={4} maxDistance={18} autoRotateSpeed={0} />;
  const { apex, baseLeft, baseRight } = geometryBase;

  return (
    <StageCanvas cameraDistance={9} minDistance={4} maxDistance={18} autoRotateSpeed={0.2}>
      <PrismSolid apex={apex} baseLeft={baseLeft} baseRight={baseRight} />
      <PrismEdges apex={apex} baseLeft={baseLeft} baseRight={baseRight} />

      {mode === "spectrum" && rays[0] && (
        <RaySegment points={rays[0].incident} color="#e8eef5" width={2.2} />
      )}

      {rays.map((r, i) => (
        <group key={i}>
          {mode !== "spectrum" && <RaySegment points={r.incident} color="#e8eef5" width={2.2} />}
          <RaySegment points={r.internal} color={r.color} width={1.6} opacity={0.85} />
          {r.tir ? (
            <TirSpark point={r.internal ? r.internal[1] : r.incident[1]} />
          ) : (
            <RaySegment points={r.exit} color={r.color} width={2} />
          )}
        </group>
      ))}
    </StageCanvas>
  );
}
