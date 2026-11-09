import React, { useCallback, useEffect, useRef, useState } from "react";
import { RotateCw, Pause, Play, Home } from "lucide-react";

/**
 * Scene3D — a small dependency-free 3-D renderer on a 2-D canvas.
 *
 * Coordinates are mathematical (x right, y into the page, z up). Each frame the lab's `draw(g, t, dt)` callback
 * describes the scene through `g`; everything is collected, depth-sorted (painter's algorithm) and painted, so
 * surfaces, wireframes, arrows, dots and labels interleave correctly while you orbit.
 *
 *   g.quad(a, b, c, d, [r,g,b], {alpha, stroke})   shaded quadrilateral (flat Lambert light, two-sided)
 *   g.tri(a, b, c, [r,g,b], {alpha, stroke})
 *   g.line(a, b, color, width, alpha)              segment ·  g.path(points, color, width, alpha)  polyline
 *   g.dot(p, radius, color, alpha)                 ·  g.text(p, "label", color, size, align)
 *   g.axes(len, labels)                            ·  g.project(p) → {x, y, d} (screen px, depth)
 *
 * Drag to orbit, wheel / pinch-less zoom, optional auto-rotate. The default view is respectful of
 * `prefers-reduced-motion` (auto-rotate starts off).
 */
const INK = "#475569";
const LIGHT = (() => { const v = [0.35, -0.45, 0.82]; const n = Math.hypot(...v); return v.map((c) => c / n); })();

const css = (c, a = 1) => (typeof c === "string" ? c : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`);

export default function Scene3D({ height = 440, draw, yaw0 = -0.85, pitch0 = 0.5, dist0 = 5, autoRotate = true, label = "3D scene", hint = "Drag to rotate · scroll to zoom" }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const cam = useRef({ yaw: yaw0, pitch: pitch0, dist: dist0 });
  const [rotating, setRotating] = useState(() => {
    try { return autoRotate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return autoRotate; }
  });
  const rotRef = useRef(rotating);
  rotRef.current = rotating;
  const drag = useRef(null);

  const reset = useCallback(() => { cam.current = { yaw: yaw0, pitch: pitch0, dist: dist0 }; }, [yaw0, pitch0, dist0]);

  useEffect(() => {
    const wrap = wrapRef.current, cv = canvasRef.current;
    if (!wrap || !cv) return undefined;
    const ctx = cv.getContext("2d");
    let W = 0, H = height, dpr = 1, raf = 0, last = performance.now(), t0 = last;

    const size = () => {
      W = Math.max(200, Math.round(wrap.clientWidth));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.width = W + "px"; cv.style.height = H + "px";
    };
    size();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(size) : null;
    if (ro) ro.observe(wrap);

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const c = cam.current;
      if (rotRef.current && !drag.current) c.yaw += dt * 0.28;
      const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
      const F = 1.22 * Math.min(W, H) * 1.0;
      const items = [];
      const project = (p) => {
        const x = -sy * p[0] + cy * p[1];
        const y = -sp * cy * p[0] - sp * sy * p[1] + cp * p[2];
        const z = cp * cy * p[0] + cp * sy * p[1] + sp * p[2];
        const d = c.dist - z;
        if (d < 0.3) return null;
        const s = F / d;
        return { x: W / 2 + x * s, y: H * 0.5 - y * s, d, s };
      };
      const g = {
        W, H, cam: c, project,
        quad(a, b, cc, dd, rgb, o = {}) {
          const A = project(a), B = project(b), C = project(cc), D = project(dd);
          if (!A || !B || !C || !D) return;
          // flat shading from the geometric normal
          const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = dd[0] - a[0], vy = dd[1] - a[1], vz = dd[2] - a[2];
          let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
          const nl = Math.hypot(nx, ny, nz) || 1;
          const lam = Math.abs((nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]) / nl);
          const k = 0.62 + 0.5 * lam;
          const col = [Math.min(255, rgb[0] * k), Math.min(255, rgb[1] * k), Math.min(255, rgb[2] * k)];
          items.push({ d: (A.d + B.d + C.d + D.d) / 4, k: 1, pts: [A, B, C, D], col, a: o.alpha ?? 1, stroke: o.stroke });
        },
        tri(a, b, cc, rgb, o = {}) { g.quad(a, b, cc, cc, rgb, o); },
        line(a, b, color = INK, width = 1.5, alpha = 1) {
          const A = project(a), B = project(b);
          if (!A || !B) return;
          items.push({ d: (A.d + B.d) / 2 - 0.0005, k: 2, A, B, col: color, w: width, a: alpha });
        },
        path(pts, color = INK, width = 1.8, alpha = 1) {
          for (let i = 1; i < pts.length; i++) if (pts[i - 1] && pts[i]) g.line(pts[i - 1], pts[i], color, width, alpha);
        },
        dot(p, r = 4, color = "#dc3b54", alpha = 1) {
          const P = project(p);
          if (!P) return;
          items.push({ d: P.d - 0.002, k: 3, P, r: r * Math.min(1.8, Math.max(0.6, 5 / P.d)), col: color, a: alpha });
        },
        text(p, str, color = INK, size = 12, align = "center") {
          const P = project(p);
          if (!P) return;
          items.push({ d: P.d - 0.004, k: 4, P, str, col: color, size, align });
        },
        axes(len = 1.6, labels = ["x", "y", "z"], color = "rgba(71,85,105,0.55)") {
          const tips = [[len, 0, 0], [0, len, 0], [0, 0, len]];
          tips.forEach((t, i) => {
            g.line([0, 0, 0], t, color, 1.4);
            g.text([t[0] * 1.08, t[1] * 1.08, t[2] * 1.08], labels[i], "#334155", 13);
          });
        },
        light(n) { const nl = Math.hypot(...n) || 1; return 0.62 + 0.5 * Math.abs((n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]) / nl); },
      };

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      try { drawRef.current(g, (now - t0) / 1000, dt); } catch (e) { items.length = 0; ctx.fillStyle = "#dc3b54"; ctx.fillText("scene error: " + e.message, 12, 20); }
      items.sort((p, q) => q.d - p.d);
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      for (const it of items) {
        if (it.k === 1) {
          const p = it.pts;
          ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y);
          for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
          ctx.closePath();
          ctx.globalAlpha = it.a; ctx.fillStyle = css(it.col); ctx.fill();
          ctx.lineWidth = 0.7; ctx.strokeStyle = it.stroke || css(it.col);
          ctx.globalAlpha = it.stroke ? Math.min(1, it.a + 0.2) : it.a; ctx.stroke();
        } else if (it.k === 2) {
          ctx.globalAlpha = it.a; ctx.strokeStyle = css(it.col); ctx.lineWidth = it.w;
          ctx.beginPath(); ctx.moveTo(it.A.x, it.A.y); ctx.lineTo(it.B.x, it.B.y); ctx.stroke();
        } else if (it.k === 3) {
          ctx.globalAlpha = it.a; ctx.fillStyle = css(it.col);
          ctx.beginPath(); ctx.arc(it.P.x, it.P.y, it.r, 0, 6.2832); ctx.fill();
          ctx.globalAlpha = it.a * 0.9; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.4; ctx.stroke();
        } else {
          ctx.globalAlpha = 1; ctx.font = `${it.size}px Inter, system-ui, sans-serif`; ctx.textAlign = it.align; ctx.textBaseline = "middle";
          ctx.lineWidth = 3; ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.strokeText(it.str, it.P.x, it.P.y);
          ctx.fillStyle = css(it.col); ctx.fillText(it.str, it.P.x, it.P.y);
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onWheel = (e) => { e.preventDefault(); const c = cam.current; c.dist = Math.min(14, Math.max(2.2, c.dist * Math.exp(e.deltaY * 0.0012))); };
    cv.addEventListener("wheel", onWheel, { passive: false });
    return () => { cancelAnimationFrame(raf); if (ro) ro.disconnect(); cv.removeEventListener("wheel", onWheel); };
  }, [height]);

  const down = (e) => { drag.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const move = (e) => {
    if (!drag.current) return;
    const c = cam.current;
    c.yaw -= (e.clientX - drag.current.x) * 0.008;
    c.pitch = Math.max(-1.45, Math.min(1.45, c.pitch + (e.clientY - drag.current.y) * 0.008));
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const up = () => { drag.current = null; };

  return (
    <div className="qp-scene3d" ref={wrapRef}>
      <canvas
        ref={canvasRef} role="img" aria-label={label} className="qp-scene3d-canvas" style={{ height, touchAction: "none" }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onDoubleClick={reset}
      />
      <div className="qp-scene3d-bar">
        <button type="button" className="qp-chip" onClick={() => setRotating((r) => !r)} aria-pressed={rotating}>
          {rotating ? <Pause size={12} /> : <Play size={12} />} {rotating ? "Stop spin" : "Auto-spin"}
        </button>
        <button type="button" className="qp-chip" onClick={reset}><Home size={12} /> Reset view</button>
        <span className="qp-muted small qp-scene3d-hint"><RotateCw size={11} /> {hint}</span>
      </div>
    </div>
  );
}

/** Mix two RGB colours (t = 0 → a, 1 → b). */
export const mixRGB = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
