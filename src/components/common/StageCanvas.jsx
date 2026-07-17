import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";

/**
 * StageCanvas — the common 3D "set" used by every experiment viewport
 * (atom, hydrogen spectrum, particle collisions). Centralizes camera
 * setup, a three-point light rig, a soft starfield backdrop, and
 * pointer/scroll orbit controls so individual experiments only need to
 * describe their own geometry.
 */
export default function StageCanvas({ children, cameraDistance = 12, minDistance = 4, maxDistance = 34, autoRotateSpeed = 0.6 }) {
  return (
    <Canvas
      className="qp-viewport"
      dpr={[1, 2]}
      camera={{ position: [cameraDistance * 0.6, cameraDistance * 0.5, cameraDistance * 0.6], fov: 45 }}
    >
      <ambientLight color="#3a4a5c" intensity={1.15} />
      <pointLight color="#6fe3ea" intensity={2.4} distance={80} position={[9, 10, 8]} />
      <pointLight color="#f2a94e" intensity={1.3} distance={80} position={[-9, -6, -8]} />
      <directionalLight color="#8fa8c8" intensity={0.55} position={[-5, 8, -3]} />
      <Stars radius={140} depth={60} count={2000} factor={2} fade speed={0.4} />
      {children}
      <OrbitControls
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
