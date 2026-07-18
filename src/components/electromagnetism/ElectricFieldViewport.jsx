import React, { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Line } from "@react-three/drei";
import { fieldLines, sampleFieldGrid } from "../../physics/electromagnetism";

const SCALE = 0.16; // cm -> world units

function ChargeSphere({ charge, index, setDragging }) {
  const isProbe = charge.q === 0;
  const color = isProbe ? "#6bd68a" : charge.q > 0 ? "#ef5b6f" : "#5b8def";
  const radius = isProbe ? 0.22 : 0.32 + Math.min(0.28, Math.abs(charge.q) * 0.012);
  return (
    <mesh
      position={[charge.x * SCALE, charge.y * SCALE, 0.02]}
      onPointerDown={(e) => { e.stopPropagation(); setDragging(index); }}
    >
      {isProbe ? <octahedronGeometry args={[radius, 0]} /> : <sphereGeometry args={[radius, 24, 24]} />}
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.85} />
    </mesh>
  );
}

function DragPlane({ dragging, onDrag, setDragging }) {
  return (
    <mesh
      onPointerMove={(e) => { if (dragging === null) return; e.stopPropagation(); onDrag(dragging, e.point.x / SCALE, e.point.y / SCALE); }}
      onPointerUp={() => setDragging(null)}
      onPointerLeave={() => setDragging(null)}
    >
      <planeGeometry args={[44, 44]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

function FieldLines({ lines }) {
  return lines.map((pts, i) => {
    if (pts.length < 2) return null;
    const points = pts.map((p) => [p.x * SCALE, p.y * SCALE, 0]);
    return <Line key={i} points={points} color="#4fd8e0" lineWidth={1} transparent opacity={0.55} />;
  });
}

function FieldVectors({ grid }) {
  const maxMag = Math.max(1e-6, ...grid.map((g) => g.mag));
  return grid.map((g, i) => {
    const len = 0.18 + (Math.min(1, g.mag / maxMag) * 0.55);
    const ux = g.Ex / (g.mag || 1);
    const uy = g.Ey / (g.mag || 1);
    const x0 = g.x * SCALE, y0 = g.y * SCALE;
    const x1 = x0 + ux * len, y1 = y0 + uy * len;
    const t = Math.min(1, g.mag / maxMag);
    const color = `rgb(${Math.round(79 + t * 160)},${Math.round(216 - t * 90)},${Math.round(224 - t * 100)})`;
    return <Line key={i} points={[[x0, y0, 0.01], [x1, y1, 0.01]]} color={color} lineWidth={1.4} />;
  });
}

export default function ElectricFieldViewport({ charges, onDragCharge }) {
  const [dragging, setDragging] = useState(null);

  const handleDrag = (index, x, y) => {
    onDragCharge(index, Math.max(-14, Math.min(14, x)), Math.max(-14, Math.min(14, y)));
  };

  const sourceCharges = useMemo(() => charges.filter((c) => c.q !== 0), [charges]);
  const lines = useMemo(() => fieldLines(sourceCharges, 10, 9), [sourceCharges]);
  const grid = useMemo(() => sampleFieldGrid(sourceCharges, 9, 9), [sourceCharges]);

  return (
    <Canvas className="qp-viewport" dpr={[1, 2]} camera={{ position: [0, 0, 11], fov: 48 }}>
      <ambientLight color="#3a4a5c" intensity={1.2} />
      <pointLight color="#6fe3ea" intensity={2} distance={60} position={[6, 8, 8]} />
      <Stars radius={140} depth={60} count={1200} factor={2} fade speed={0.3} />
      <DragPlane dragging={dragging} onDrag={handleDrag} setDragging={setDragging} />
      <FieldVectors grid={grid} />
      <FieldLines lines={lines} />
      {charges.map((c, i) => (
        <ChargeSphere key={i} charge={c} index={i} setDragging={setDragging} />
      ))}
      <OrbitControls enablePan={false} enabled={dragging === null} minDistance={5} maxDistance={22} enableDamping dampingFactor={0.1} />
    </Canvas>
  );
}
