import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

/** Colour tokens for SVG/canvas drawing (kept in sync with the frosted-white theme). */
export const PLOT = {
  grid: "rgba(100,116,139,0.18)",
  gridStrong: "rgba(100,116,139,0.34)",
  axis: "#94a3b8",
  text: "#64748b",
  ink: "#1e293b",
  teal: "#0e8ea3",
  amber: "#c2740a",
  red: "#dc3b54",
  blue: "#3b6fd8",
  violet: "#8b4fd8",
  green: "#1f9d57",
};

/** A "nice" tick step (1, 2, 5 × 10ⁿ) giving roughly `target` ticks over `span`. */
export function niceStep(span, target = 8) {
  const raw = span / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / mag;
  return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * mag;
}

export function ticksFor(lo, hi, target = 8) {
  const step = niceStep(hi - lo, target);
  const out = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : Number(v.toPrecision(12)));
  return out;
}

export const fmtTick = (v) => {
  const s = Number(v.toFixed(2)).toString();
  return s.startsWith("-") ? "−" + s.slice(1) : s;
};

/** SVG path from points; `null` / non-finite entries start a new sub-path (used to break at poles). */
export function pathD(points, X, Y) {
  let d = "";
  let pen = false;
  for (const p of points) {
    if (!p || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) { pen = false; continue; }
    d += `${pen ? "L" : "M"}${X(p[0]).toFixed(2)},${Y(p[1]).toFixed(2)}`;
    pen = true;
  }
  return d;
}

/** Arrow in *pixel* coordinates (use with the X / Y helpers passed to MathPlot children). */
export function Arrow({ x1, y1, x2, y2, color = PLOT.teal, width = 2, dashed = false, head = 8, opacity = 1 }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (!(len > 0.5)) return null;
  const ux = dx / len, uy = dy / len;
  const h = Math.min(head, len * 0.6);
  const bx = x2 - ux * h, by = y2 - uy * h;
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeDasharray={dashed ? "5 4" : undefined} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${bx - uy * h * 0.45},${by + ux * h * 0.45} ${bx + uy * h * 0.45},${by - ux * h * 0.45}`} fill={color} />
    </g>
  );
}

/**
 * Responsive SVG plot with grid, axes and ticks, plus an optional pixel-painted canvas underlay.
 *   xr, yr        data ranges
 *   square        force 1:1 aspect (height follows the data ranges)
 *   paint(x, y)   optional → [r, g, b] for a heat-map / domain-colouring underlay
 *   paintKey      string that changes whenever `paint` should be re-run
 *   onPointer     (type: "down"|"move"|"up", {x, y}) in data coordinates (enables dragging)
 *   children      render-prop receiving { X, Y, sx, sy, W, H } (data → pixel helpers)
 */
export default function MathPlot({
  xr, yr, width = 560, height = 320, square = false, grid = true, axes = true,
  xLabel, yLabel, paint, paintKey = "", paintRes = 190, onPointer, label, children, ticksTarget = 8, yTicks = true, xTicks = true,
}) {
  const [x0, x1] = xr, [y0, y1] = yr;
  // The SVG is drawn at its real on-screen pixel width (measured), so text and strokes never get scaled.
  const wrapRef = useRef(null);
  const [measured, setMeasured] = useState(null);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const read = () => { const w = Math.round(el.clientWidth / 4) * 4; if (w > 0) setMeasured((cur) => (cur === w ? cur : w)); };
    read();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const W = measured || width;
  const H = square ? Math.round((W * (y1 - y0)) / (x1 - x0)) : height;
  const padL = 34, padB = 24;
  const X = (x) => ((x - x0) / (x1 - x0)) * W;
  const Y = (y) => H - ((y - y0) / (y1 - y0)) * H;
  const sx = W / (x1 - x0), sy = H / (y1 - y0);
  const svgRef = useRef(null);
  const canvasRef = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (!paint) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const cw = paintRes, ch = Math.max(8, Math.round((paintRes * H) / W));
    cv.width = cw; cv.height = ch;
    const ctx = cv.getContext("2d");
    const img = ctx.createImageData(cw, ch);
    for (let j = 0; j < ch; j++) {
      const y = y1 - ((j + 0.5) / ch) * (y1 - y0);
      for (let i = 0; i < cw; i++) {
        const x = x0 + ((i + 0.5) / cw) * (x1 - x0);
        const c = paint(x, y);
        const k = 4 * (j * cw + i);
        img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = c[3] === undefined ? 255 : c[3];
      }
    }
    ctx.putImageData(img, 0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paintKey, x0, x1, y0, y1, W, H, paintRes]);

  const toData = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: x0 + ((e.clientX - r.left) / r.width) * (x1 - x0), y: y1 - ((e.clientY - r.top) / r.height) * (y1 - y0) };
  };
  const handlers = onPointer ? {
    onPointerDown: (e) => { dragging.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); onPointer("down", toData(e)); },
    onPointerMove: (e) => { if (dragging.current) onPointer("move", toData(e)); },
    onPointerUp: (e) => { if (dragging.current) { dragging.current = false; onPointer("up", toData(e)); } },
    onPointerCancel: () => { dragging.current = false; },
  } : {};

  const xt = ticksFor(x0, x1, ticksTarget), yt = ticksFor(y0, y1, Math.max(3, Math.round(ticksTarget * (H / W) + 1)));
  const ax = x0 <= 0 && x1 >= 0 ? X(0) : null, ay = y0 <= 0 && y1 >= 0 ? Y(0) : null;

  return (
    <div ref={wrapRef} className={"qp-plot-wrap" + (onPointer ? " interactive" : "")} style={{ height: H, maxWidth: square ? `${((62 * (x1 - x0)) / (y1 - y0)).toFixed(1)}vh` : undefined }}>
      {paint && <canvas ref={canvasRef} className="qp-plot-canvas" aria-hidden="true" />}
      <svg
        ref={svgRef} className="qp-plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}
        style={{ touchAction: onPointer ? "none" : undefined }} {...handlers}
      >
        {grid && xt.map((t) => <line key={"gx" + t} x1={X(t)} x2={X(t)} y1={0} y2={H} stroke={PLOT.grid} />)}
        {grid && yTicks && yt.map((t) => <line key={"gy" + t} x1={0} x2={W} y1={Y(t)} y2={Y(t)} stroke={PLOT.grid} />)}
        {axes && ax !== null && <line x1={ax} x2={ax} y1={0} y2={H} stroke={PLOT.gridStrong} strokeWidth={1.3} />}
        {axes && ay !== null && <line x1={0} x2={W} y1={ay} y2={ay} stroke={PLOT.gridStrong} strokeWidth={1.3} />}
        {xTicks && xt.map((t) => (
          <text key={"tx" + t} x={X(t)} y={H - 5} fontSize={10} fill={PLOT.text} textAnchor="middle" stroke="rgba(255,255,255,0.8)" strokeWidth={3} paintOrder="stroke">{fmtTick(t)}</text>
        ))}
        {yTicks && yt.map((t) => (
          <text key={"ty" + t} x={4} y={Y(t) - 3} fontSize={10} fill={PLOT.text} stroke="rgba(255,255,255,0.8)" strokeWidth={3} paintOrder="stroke">{fmtTick(t)}</text>
        ))}
        {xLabel && <text x={W - 6} y={H - 16} fontSize={11} fill={PLOT.text} textAnchor="end" fontStyle="italic" stroke="rgba(255,255,255,0.85)" strokeWidth={3} paintOrder="stroke">{xLabel}</text>}
        {yLabel && <text x={padL + 6} y={14} fontSize={11} fill={PLOT.text} fontStyle="italic" stroke="rgba(255,255,255,0.85)" strokeWidth={3} paintOrder="stroke">{yLabel}</text>}
        <g>{children({ X, Y, sx, sy, W, H })}</g>
      </svg>
    </div>
  );
}

/** Small helper for a labelled slider row, matching the rest of the lab. */
export function Slider({ label, value, min, max, step = 0.1, onChange, format }) {
  return (
    <div className="qp-slider-row">
      <label>{label} = {format ? format(value) : value}</label>
      <input type="range" min={min} max={max} step={step} value={value} className="qp-slider" onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

/** Row of mutually exclusive chips. */
export function Chips({ options, value, onChange }) {
  return (
    <div className="qp-chip-row">
      {options.map((o) => (
        <button key={o.key} className={"qp-chip" + (o.key === value ? " active" : "")} onClick={() => onChange(o.key)}>{o.label}</button>
      ))}
    </div>
  );
}

/** Sub-lab switcher shared by the three math modules (same behaviour as QuantumLab). */
export function LabSwitcher({ experiments, initial }) {
  const [key, setKey] = React.useState(initial || experiments[0].key);
  const active = experiments.find((e) => e.key === key) || experiments[0];
  const Active = active.Component;
  return (
    <div>
      <div className="qp-chip-row" style={{ marginBottom: 14 }}>
        {experiments.map((e) => (
          <button key={e.key} className={"qp-chip" + (e.key === active.key ? " active" : "")} onClick={() => setKey(e.key)}>{e.label}</button>
        ))}
      </div>
      <Active />
    </div>
  );
}

/** Sequential light-theme colour ramp, t ∈ [0, 1] → [r, g, b]. */
const RAMP = [[240, 247, 252], [186, 222, 240], [110, 188, 208], [40, 140, 165], [74, 80, 168], [60, 36, 110]];
export function rampColor(t) {
  const u = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0)) * (RAMP.length - 1);
  const i = Math.min(RAMP.length - 2, Math.floor(u)), f = u - i;
  return RAMP[i].map((c, k) => Math.round(c + (RAMP[i + 1][k] - c) * f));
}

/** Diverging blue–white–red ramp, t ∈ [−1, 1]. */
export function divergingColor(t) {
  const u = Math.min(1, Math.max(-1, Number.isFinite(t) ? t : 0));
  const a = Math.abs(u);
  const hot = u >= 0 ? [220, 59, 84] : [59, 111, 216];
  const mid = [248, 250, 252];
  return mid.map((c, k) => Math.round(c + (hot[k] - c) * Math.pow(a, 0.85)));
}
