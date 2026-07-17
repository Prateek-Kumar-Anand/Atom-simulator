import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import StageCanvas from "../common/StageCanvas";

const MAX_N = 6;
const shellRadius = (n) => 1.6 + (n - 1) * 1.15;

function Nucleus() {
  return (
    <mesh>
      <sphereGeometry args={[0.4, 20, 20]} />
      <meshStandardMaterial color="#ef5b6f" emissive="#6b1620" emissiveIntensity={0.7} />
    </mesh>
  );
}

function ShellRings({ ni, nf }) {
  return (
    <>
      {Array.from({ length: MAX_N }, (_, i) => i + 1).map((n) => (
        <mesh key={n} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[shellRadius(n), 0.008, 8, 96]} />
          <meshBasicMaterial color="#4fd8e0" transparent opacity={n === ni || n === nf ? 0.55 : 0.12} />
        </mesh>
      ))}
    </>
  );
}

function Electron({ ni }) {
  const r = shellRadius(ni);
  return (
    <mesh position={[r, 0, 0]}>
      <sphereGeometry args={[0.19, 16, 16]} />
      <meshStandardMaterial color="#4fd8e0" emissive="#4fd8e0" emissiveIntensity={1.2} />
    </mesh>
  );
}

/** A single transient photon burst: travels outward (emission) or inward (absorption), fading as it goes. */
function Photon({ ni, emission, color }) {
  const ref = useRef();
  const start = shellRadius(ni);
  const [opacity, setOpacity] = useState(1);
  const traveledRef = useRef(0);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const dir = emission ? 1 : -1;
    ref.current.position.x += dir * dt * 4.5;
    traveledRef.current += Math.abs(dir * dt * 4.5);
    setOpacity(Math.max(0, 1 - traveledRef.current / 9));
  });

  return (
    <mesh ref={ref} position={[emission ? start : start + 4, 0, 0]}>
      <sphereGeometry args={[0.14, 12, 12]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
      <pointLight color={color} intensity={1.6} distance={6} />
    </mesh>
  );
}

export default function SpectrumViewport({ ni, nf, emitToken, color, emission }) {
  return (
    <StageCanvas cameraDistance={12} minDistance={5} maxDistance={26} autoRotateSpeed={0.4}>
      <Nucleus />
      <ShellRings ni={ni} nf={nf} />
      <Electron ni={ni} />
      {emitToken > 0 && <Photon key={emitToken} ni={ni} emission={emission} color={color} />}
    </StageCanvas>
  );
}
