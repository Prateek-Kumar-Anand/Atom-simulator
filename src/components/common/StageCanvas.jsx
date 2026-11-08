import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

/**
 * StageCanvas — the common 3D "set" used by every experiment viewport
 * (atom, hydrogen spectrum, particle collisions). Centralizes camera
 * setup, a three-point light rig, soft neutral lighting for the frosted-white backdrop, and
 * pointer/scroll orbit controls so individual experiments only need to
 * describe their own geometry.
 */
export default function StageCanvas({ children, cameraDistance = 12, minDistance = 4, maxDistance = 34, autoRotateSpeed = 0.6, controlsEnabled = true }) {
  return (
    <Canvas
      className="qp-viewport"
      dpr={[1, 2]}
      camera={{ position: [cameraDistance * 0.6, cameraDistance * 0.5, cameraDistance * 0.6], fov: 45 }}
    >
      <ambientLight color="#ffffff" intensity={1.35} />
      <pointLight color="#ffffff" intensity={2.2} distance={80} position={[9, 10, 8]} />
      <pointLight color="#ffe9d2" intensity={1.0} distance={80} position={[-9, -6, -8]} />
      <directionalLight color="#dbe7ff" intensity={0.6} position={[-5, 8, -3]} />
      {children}
      <OrbitControls
        enabled={controlsEnabled}
        enablePan={false}
        minDistance={minDistance}
        maxDistance={maxDistance}
        autoRotate
        autoRotateSpeed={autoRotateSpeed}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
