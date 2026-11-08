import React, { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import StageCanvas from "../common/StageCanvas";
import Label3D from "../common/Label3D";
import { barMagnetFieldLines, wireFieldAt } from "../../physics/electromagnetism";

const SCALE = 0.9;

function BarMagnetGeometry() {
  return (
    <group>
      <mesh position={[-0.62, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.55, 0.55, 1.24, 24]} />
        <meshStandardMaterial color="#3a6fe0" emissive="#2f4f9e" emissiveIntensity={0.35} roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0.62, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.55, 0.55, 1.24, 24]} />
        <meshStandardMaterial color="#e23d57" emissive="#a52f42" emissiveIntensity={0.35} roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.56, 0.56, 0.14, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      <Label3D text="S" position={[-1.35, 0, 0.02]} color="#3a6fe0" scale={0.5} />
      <Label3D text="N" position={[1.35, 0, 0.02]} color="#e23d57" scale={0.5} />
    </group>
  );
}

function BarMagnetField({ strength }) {
  const lines = useMemo(() => barMagnetFieldLines(strength, 10), [strength]);
  return lines.map((pts, i) => (
    <Line key={i} points={pts.map((p) => [p.x * SCALE, p.y * SCALE, 0])} color="#0fa3b8" lineWidth={1.3} transparent opacity={0.7} />
  ));
}

function WireGeometry({ direction }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.18, 0.18, 7, 20]} />
      <meshStandardMaterial color="#e08a0b" emissive="#e08a0b" emissiveIntensity={direction > 0 ? 0.5 : 0.15} roughness={0.3} metalness={0.6} />
    </mesh>
  );
}

/** Small glowing beads flowing along the wire's length, direction set by the
 * conventional-current sign — makes "which way is current flowing" legible
 * at a glance instead of implicit in a slider value. */
function CurrentFlow({ direction, currentA }) {
  const COUNT = 10;
  const refs = useRef([]);
  const speed = 1.4 + Math.min(2.2, currentA * 0.12);
  useFrame((_, dt) => {
    for (let i = 0; i < COUNT; i++) {
      const mesh = refs.current[i];
      if (!mesh) continue;
      let z = mesh.position.z + dt * speed * direction;
      const half = 3.5;
      if (z > half) z -= half * 2;
      if (z < -half) z += half * 2;
      mesh.position.z = z;
    }
  });
  return (
    <group>
      {Array.from({ length: COUNT }, (_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} position={[0, 0, (i / COUNT) * 7 - 3.5]}>
          <sphereGeometry args={[0.09, 10, 10]} />
          <meshStandardMaterial color="#0e7490" emissive="#0fa3b8" emissiveIntensity={0.9} />
        </mesh>
      ))}
    </group>
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
        return <Line key={ri} points={points} color="#0fa3b8" lineWidth={1.2} transparent opacity={0.5} />;
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
                <meshStandardMaterial color="#22a35a" emissive="#22a35a" emissiveIntensity={0.6} />
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
          <torusGeometry args={[1.1, 0.07, 12, 36]} />
          <meshStandardMaterial color="#e08a0b" emissive="#e08a0b" emissiveIntensity={0.3} roughness={0.3} metalness={0.75} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.02, 1.02, 5.6, 24, 1, true]} />
        <meshStandardMaterial color="#0fa3b8" transparent opacity={0.06} side={2} />
      </mesh>
    </group>
  );
}

function SolenoidField({ direction }) {
  const insideLines = [-0.6, -0.3, 0, 0.3, 0.6].map((r) => [[-2.9 * direction, r * 2, 0], [2.9 * direction, r * 2, 0]]);
  const poleX = 3.15 * direction;
  return (
    <group>
      {insideLines.map((pts, i) => <Line key={i} points={pts} color="#0fa3b8" lineWidth={2} />)}
      {insideLines.map((pts, i) => (
        <mesh key={"h" + i} position={pts[1]} rotation={[0, 0, direction > 0 ? -Math.PI / 2 : Math.PI / 2]}>
          <coneGeometry args={[0.13, 0.32, 8]} />
          <meshStandardMaterial color="#22a35a" emissive="#22a35a" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* Approximate external return-path loops, bar-magnet style */}
      {barMagnetFieldLines(6, 5).map((pts, i) => (
        <Line key={"ext" + i} points={pts.map((p) => [p.x * direction * 0.7, p.y * 0.9, 0])} color="#0fa3b8" lineWidth={1} transparent opacity={0.35} />
      ))}
      <Label3D text="N" position={[poleX, 0, 1.05]} color="#e23d57" scale={0.5} />
      <Label3D text="S" position={[-poleX, 0, 1.05]} color="#3a6fe0" scale={0.5} />
    </group>
  );
}

/** A draggable compass: an arrow that orients itself along the local field
 * direction at its own position, plus a drag-plane so the user can carry it
 * anywhere in the plane — the classic "map the field with a compass" exercise. */
function Compass({ probe, fieldDir, mag, maxMag, setDragging }) {
  const angle = Math.atan2(fieldDir.y, fieldDir.x);
  const len = mag > 0 ? 0.35 + Math.min(1, mag / (maxMag || 1)) * 0.55 : 0.3;
  return (
    <group
      position={[probe.x * SCALE, probe.y * SCALE, 0.06]}
      onPointerDown={(e) => { e.stopPropagation(); setDragging(true); }}
    >
      <mesh>
        <ringGeometry args={[0.32, 0.4, 28]} />
        <meshBasicMaterial color="#1e293b" transparent opacity={0.5} />
      </mesh>
      <group rotation={[0, 0, angle]}>
        <mesh position={[len / 2, 0, 0]}>
          <boxGeometry args={[len, 0.05, 0.05]} />
          <meshStandardMaterial color="#22a35a" emissive="#22a35a" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[len, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.11, 0.22, 10]} />
          <meshStandardMaterial color="#22a35a" emissive="#22a35a" emissiveIntensity={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function CompassDragPlane({ dragging, onDrag, setDragging }) {
  return (
    <mesh
      onPointerMove={(e) => { if (!dragging) return; e.stopPropagation(); onDrag(e.point.x / SCALE, e.point.y / SCALE); }}
      onPointerUp={() => setDragging(false)}
      onPointerLeave={() => setDragging(false)}
    >
      <planeGeometry args={[44, 44]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

export default function MagneticFieldViewport({ source, strength, currentA, direction, probe, onDragProbe, probeField }) {
  const [dragging, setDragging] = useState(false);
  const showCompass = (source === "bar" || source === "wire") && probeField;
  // Fixed reference for the compass-needle length. (It used to be derived from the probe's own field,
  // so the ratio was constant and the needle never changed length as it was dragged away from the wire.)
  const maxMag = source === "wire" ? Math.max(1e-12, wireFieldAt(currentA, 1, 0).mag) : 8;

  return (
    <StageCanvas cameraDistance={11} minDistance={5} maxDistance={22} autoRotateSpeed={dragging ? 0 : 0.35} controlsEnabled={!dragging}>
      {showCompass && (
        <CompassDragPlane
          dragging={dragging}
          onDrag={(x, y) => onDragProbe(Math.max(-6, Math.min(6, x)), Math.max(-6, Math.min(6, y)))}
          setDragging={setDragging}
        />
      )}
      {source === "bar" && <><BarMagnetGeometry /><BarMagnetField strength={strength} /></>}
      {source === "wire" && <><WireGeometry direction={direction} /><CurrentFlow direction={direction} currentA={currentA} /><WireField direction={direction} /></>}
      {source === "solenoid" && <><SolenoidGeometry /><SolenoidField direction={direction} /></>}
      {showCompass && (
        <Compass
          probe={probe}
          fieldDir={{ x: probeField.Bx || probeField.x || 0, y: probeField.By || probeField.y || 0 }}
          mag={probeField.mag}
          maxMag={maxMag}
          setDragging={setDragging}
        />
      )}
    </StageCanvas>
  );
}
