import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * Label3D — a small billboarded badge (always faces the camera, like a
 * sprite) carrying one or two characters of text, rendered onto a canvas
 * texture. Used for pole markers (N/S) and similar short in-scene labels.
 * Deliberately avoids drei's <Text>, which lazy-loads a font over the
 * network via Suspense — this stays fully offline and synchronous.
 */
function makeLabelTexture(text, color) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, size, size);
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 8, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.16;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.lineWidth = 5;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.font = "bold 68px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, size / 2, size / 2 + 4);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function Label3D({ text, position, color = "#1e293b", scale = 0.6 }) {
  const texture = useMemo(() => makeLabelTexture(text, color), [text, color]);
  return (
    <sprite position={position} scale={[scale, scale, scale]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
}
