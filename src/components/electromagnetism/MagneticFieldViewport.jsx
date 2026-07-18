import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import StageCanvas from "../common/StageCanvas";
import { barMagnetFieldLines } from "../../physics/electromagnetism";

const SCALE = 0.9;

function BarMagnetGeometry() {
  return (
    <group>
      <mesh position={[-0.9, 0, 0]}>
        <boxGeometry args={[1.8, 1, 1]} />
        <meshStandardMaterial color="#5b8def" emissive="#5b8def" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0.9, 0, 0]}>
        <boxGeometry args={[1.8, 1, 1]} />
        <meshStandardMaterial color="#ef5b6f" emissive="#ef5b6f" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

function BarMagnetField({ strength }) {
  const lines = useMemo(() => barMagnetFieldLines(strength, 10), [strength]);
  return lines.map((pts, i) => (
    <Line key={i} points={pts.map((p) => [p.x * SCALE, p.y * SCALE, 0])} color="#4fd8e0" lineWidth={1.3} transparent opacity={0.7} />
  ));
}

function WireGeometry({ direction }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.18, 0.18, 7, 20]} />
      <meshStandardMaterial color="#f2a94e" emissive="#f2a94e" emissiveIntensity={direction > 0 ? 0.5 : 0.15} />
    </mesh>
  );
}

function WireField({ direction }) {
  const radii = [1, 1.8, 2.6, 3.4, 4.2];
  return (
    <group>
      {radii.map((r, ri) => {
        const points = Array.from({ length: 65 }, (_, i) => {
          const a = (i / 64) * Math.PI * 2;
          return [Math.cos(a) * r, Math.sin(a) * r, 0];
        });
        return <Line key={ri} points={points} color="#4fd8e0" lineWidth={1.2} transparent opacity={0.5} />;
      })}
      {radii.map((r, ri) => (
        <group key={"arrows" + ri}>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2 + ri * 0.3;
            const tangent = a + (direction > 0 ? Math.PI / 2 : -Math.PI / 2);
            const x = Math.cos(a) * r, y = Math.sin(a) * r;
            return (
              <mesh key={i} position={[x, y, 0]} rotation={[0, 0, tangent]}>
                <coneGeometry args={[0.12, 0.3, 8]} />
                <meshStandardMaterial color="#6bd68a" emissive="#6bd68a" emissiveIntensity={0.6} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

function SolenoidGeometry({ turns = 14 }) {
  const coils = Array.from({ length: turns }, (_, i) => (i / (turns - 1) - 0.5) * 5.5);
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {coils.map((z, i) => (
        <mesh key={i} position={[0, z, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.1, 0.06, 10, 32]} />
          <meshStandardMaterial color="#f2a94e" emissive="#f2a94e" emissiveIntensity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function SolenoidField({ direction }) {
  const insideLines = [-0.6, -0.3, 0, 0.3, 0.6].map((r) => [[-2.9 * direction, r * 2, 0], [2.9 * direction, r * 2, 0]]);
  return (
    <group>
      {insideLines.map((pts, i) => <Line key={i} points={pts} color="#4fd8e0" lineWidth={2} />)}
      {insideLines.map((pts, i) => (
        <mesh key={"h" + i} position={pts[1]} rotation={[0, 0, direction > 0 ? -Math.PI / 2 : Math.PI / 2]}>
          <coneGeometry args={[0.13, 0.32, 8]} />
          <meshStandardMaterial color="#6bd68a" emissive="#6bd68a" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* Approximate external return-path loops, bar-magnet style */}
      {barMagnetFieldLines(6, 5).map((pts, i) => (
        <Line key={"ext" + i} points={pts.map((p) => [p.x * direction * 0.7, p.y * 0.9, 0])} color="#4fd8e0" lineWidth={1} transparent opacity={0.35} />
      ))}
    </group>
  );
}

export default function MagneticFieldViewport({ source, strength, currentA: _currentA, direction }) {
  return (
    <StageCanvas cameraDistance={11} minDistance={5} maxDistance={22} autoRotateSpeed={0.35}>
      {source === "bar" && <><BarMagnetGeometry /><BarMagnetField strength={strength} /></>}
      {source === "wire" && <><WireGeometry direction={direction} /><WireField direction={direction} /></>}
      {source === "solenoid" && <><SolenoidGeometry /><SolenoidField direction={direction} /></>}
    </StageCanvas>
  );
}
