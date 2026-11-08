import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import StageCanvas from "../common/StageCanvas";

const MAX_N = 6;
const shellRadius = (n) => 1.6 + (n - 1) * 1.15;

function Nucleus() {
  return (
    <mesh>
      <sphereGeometry args={[0.4, 20, 20]} />
      <meshStandardMaterial color="#e23d57" emissive="#6b1620" emissiveIntensity={0.7} />
    </mesh>
  );
}

function ShellRings({ ni, nf }) {
  return (
    <>
      {Array.from({ length: MAX_N }, (_, i) => i + 1).map((n) => (
        <mesh key={n} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[shellRadius(n), 0.008, 8, 96]} />
          <meshBasicMaterial color="#0fa3b8" transparent opacity={n === ni || n === nf ? 0.55 : 0.12} />
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
      <meshStandardMaterial color="#0fa3b8" emissive="#0fa3b8" emissiveIntensity={1.2} />
    </mesh>
  );
}

/**
 * A single transient photon burst.
 * Emission (n_i -> n_f, n_f < n_i): starts at the n_i shell (where the electron
 * currently sits) and travels outward, fading into space — it never approaches
 * the nucleus, so no clamping is needed.
 * Absorption (n_i -> n_f, n_f > n_i): an incoming photon must be captured at the
 * destination shell n_f and stop there — it should never sail past that shell,
 * through the inner shells, and through the nucleus. Its start/target positions
 * are anchored to n_f (not n_i) and its inward travel is clamped at the n_f radius.
 */
function Photon({ ni, nf, emission, color }) {
  const ref = useRef();
  const start = emission ? shellRadius(ni) : shellRadius(nf) + 3;
  const target = emission ? null : shellRadius(nf);
  const matRef = useRef();
  const traveledRef = useRef(0);
  const arrivedAtRef = useRef(null);

  useFrame((_, dt) => {
    if (!ref.current) return;

    if (!emission && arrivedAtRef.current !== null) {
      // Absorbed: hold at the destination shell and fade out quickly instead
      // of continuing to travel.
      const elapsed = performance.now() / 1000 - arrivedAtRef.current;
      if (matRef.current) matRef.current.opacity = Math.max(0, 1 - elapsed / 0.5);
      return;
    }

    const dir = emission ? 1 : -1;
    const step = dir * dt * 4.5;
    let nextX = ref.current.position.x + step;

    if (!emission && nextX <= target) {
      nextX = target; // clamp: never overshoot past the target shell (and never reach the nucleus)
      arrivedAtRef.current = performance.now() / 1000;
    }

    ref.current.position.x = nextX;
    traveledRef.current += Math.abs(step);

    if (emission && matRef.current) {
      matRef.current.opacity = Math.max(0, 1 - traveledRef.current / 9);
    }
  });

  return (
    <mesh ref={ref} position={[start, 0, 0]}>
      <sphereGeometry args={[0.14, 12, 12]} />
      <meshBasicMaterial ref={matRef} color={color} transparent opacity={1} />
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
      {emitToken > 0 && <Photon key={emitToken} ni={ni} nf={nf} emission={emission} color={color} />}
    </StageCanvas>
  );
}
