import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Trail } from "@react-three/drei";
import StageCanvas from "../common/StageCanvas";

const BOX = 4; // half-extent of the field region cube
const FIT = 0.85; // the path is scaled so its largest extent fills this fraction of the box

function FieldRegionBox() {
  return (
    <mesh>
      <boxGeometry args={[BOX * 2, BOX * 2, BOX * 2]} />
      <meshStandardMaterial color="#64748b" wireframe transparent opacity={0.45} />
    </mesh>
  );
}

/** A grid of dot/cross glyphs on the z=0 plane showing the uniform B field's
 * direction the way textbooks do: a ring (dot) for "out of the page", an X
 * for "into the page". Magnitude is conveyed by how many markers glow. */
function BFieldGlyphs({ bz }) {
  const n = 5;
  const spacing = (BOX * 1.6) / (n - 1);
  const outOfPage = bz > 0;
  const glyphs = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = -BOX * 0.8 + i * spacing;
      const y = -BOX * 0.8 + j * spacing;
      glyphs.push([x, y]);
    }
  }
  if (Math.abs(bz) < 1e-9) return null;
  const color = "#e08a0b";
  return (
    <group>
      {glyphs.map(([x, y], idx) => (
        <group key={idx} position={[x, y, 0]}>
          {outOfPage ? (
            <mesh rotation={[0, 0, 0]}>
              <ringGeometry args={[0.07, 0.11, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.55} />
            </mesh>
          ) : (
            <group rotation={[0, 0, Math.PI / 4]}>
              <mesh>
                <boxGeometry args={[0.24, 0.04, 0.02]} />
                <meshBasicMaterial color={color} transparent opacity={0.55} />
              </mesh>
              <mesh>
                <boxGeometry args={[0.04, 0.24, 0.02]} />
                <meshBasicMaterial color={color} transparent opacity={0.55} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

/** A handful of upward/downward arrows showing a uniform E field, when present. */
function EFieldArrows({ ey }) {
  if (Math.abs(ey) < 1e-6) return null;
  const up = ey > 0;
  const xs = [-BOX * 0.7, -BOX * 0.35, 0, BOX * 0.35, BOX * 0.7];
  const len = 1.1;
  return (
    <group>
      {xs.map((x, i) => {
        const y0 = up ? -len / 2 : len / 2;
        const y1 = up ? len / 2 : -len / 2;
        return (
          <group key={i} position={[x, 0, -BOX * 0.85]}>
            <Line points={[[0, y0, 0], [0, y1, 0]]} color="#9b59e6" lineWidth={1.6} transparent opacity={0.6} />
            <mesh position={[0, y1, 0]} rotation={[0, 0, up ? 0 : Math.PI]}>
              <coneGeometry args={[0.09, 0.22, 8]} />
              <meshStandardMaterial color="#9b59e6" emissive="#9b59e6" emissiveIntensity={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function TrajectoryPath({ points, color }) {
  return <Line points={points} color={color} lineWidth={2.4} />;
}

function MovingParticle({ points, color }) {
  const ref = useRef();
  const idx = useRef(0);
  const clock = useRef(0);
  useFrame((_, dt) => {
    if (!ref.current || points.length === 0) return;
    clock.current += dt;
    if (clock.current > 0.008) {
      clock.current = 0;
      idx.current = (idx.current + 1) % points.length;
    }
    const p = points[idx.current];
    ref.current.position.set(p[0], p[1], p[2]);
  });
  return (
    <Trail width={2.5} length={5} color={color} attenuation={(t) => t * t}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} />
      </mesh>
    </Trail>
  );
}

export default function LorentzForceViewport({ trajectoryPoints, particleCharge, bz = 0, ey = 0 }) {
  // The physical orbit radius ranges from ~0.1 m to tens of metres across the sliders, so a fixed
  // world scale left the path either a dot or flying out of the view after a few points. Normalise
  // the path to the box instead; the true radius is shown in the readouts.
  const points = useMemo(() => {
    let extent = 0;
    for (const p of trajectoryPoints) extent = Math.max(extent, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));
    const s = extent > 0 ? (BOX * FIT) / extent : 1;
    return trajectoryPoints.map((p) => [p.x * s, p.y * s, p.z * s]);
  }, [trajectoryPoints]);
  const color = particleCharge >= 0 ? "#e23d57" : "#3a6fe0";

  return (
    <StageCanvas cameraDistance={9} minDistance={4} maxDistance={20} autoRotateSpeed={0.25}>
      <FieldRegionBox />
      <BFieldGlyphs bz={bz} />
      <EFieldArrows ey={ey} />
      {points.length > 1 && <TrajectoryPath points={points} color={color} />}
      {points.length > 1 && <MovingParticle points={points} color={color} />}
    </StageCanvas>
  );
}
