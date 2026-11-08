import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot,
} from "recharts";
import { CHART, TOOLTIP_STYLE, xAxisLabel, yAxisLabel } from "../common/chartTheme";

/** path: [{V, P}] in m^3 / Pa. current: {V, P} for the live marker. color: accent for line + dot. */
export default function PVChart({ path, current, color }) {
  const data = path.map((p) => ({ V: Number((p.V * 1000).toFixed(4)), P: Number((p.P / 1000).toFixed(3)) }));
  const currentV = current ? Number((current.V * 1000).toFixed(4)) : null;
  const currentP = current ? Number((current.P / 1000).toFixed(3)) : null;

  // An isochoric process keeps V fixed, so every point shares one x value. A [min, max] domain
  // would then collapse to zero width and the chart renders degenerate — pad it symmetrically.
  const vs = data.map((d) => d.V);
  const vMin = Math.min(...vs), vMax = Math.max(...vs);
  const pad = vMax - vMin < 1e-9 ? Math.max(0.5, vMin * 0.15) : 0;
  const xDomain = [vMin - pad, vMax + pad];

  return (
    <div className="qp-card">
      <h4>P–V diagram</h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 6, right: 14, left: 0, bottom: 6 }}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="V" type="number" domain={xDomain} tickFormatter={(v) => Number(v).toFixed(1)}
            stroke={CHART.axis} tick={CHART.tick} label={xAxisLabel("Volume (L)")}
          />
          <YAxis stroke={CHART.axis} tick={CHART.tick} label={yAxisLabel("Pressure (kPa)")} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Line type="monotone" dataKey="P" name="Process path" stroke={color} dot={false} strokeWidth={2} isAnimationActive={false} />
          {currentV !== null && <ReferenceDot x={currentV} y={currentP} r={6} fill={color} stroke="#ffffff" strokeWidth={2} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
