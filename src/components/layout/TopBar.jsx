import React from "react";
import { MODULES, useApp } from "../../context/AppContext";

export default function TopBar() {
  const { visited } = useApp();
  return (
    <header className="qp-topbar">
      <div className="qp-brand">
        <span className="qp-brand-mark">Q</span>UANTA <span className="qp-brand-sub">{"// "}Atomic Physics Laboratory</span>
      </div>
      <div className="qp-progress">
        <span>SESSION PROGRESS</span>
        <div className="qp-progress-track">
          <div className="qp-progress-fill" style={{ width: `${(visited.size / MODULES.length) * 100}%` }} />
        </div>
        <span>{visited.size}/{MODULES.length}</span>
      </div>
    </header>
  );
}
