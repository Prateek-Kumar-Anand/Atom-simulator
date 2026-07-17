import React from "react";

/** Wraps a 3D viewport with corner brackets, a live indicator, and a control hint. */
export default function HUD({ label, children }) {
  return (
    <div className="qp-hud">
      <div className="qp-hud-corner tl" />
      <div className="qp-hud-corner tr" />
      <div className="qp-hud-corner bl" />
      <div className="qp-hud-corner br" />
      <div className="qp-hud-label"><span className="qp-dot-live" />{label}</div>
      <div className="qp-hud-hint">DRAG · ORBIT&nbsp;&nbsp;SCROLL · ZOOM</div>
      {children}
    </div>
  );
}
