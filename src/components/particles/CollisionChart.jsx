import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { CHART, TOOLTIP_STYLE } from "../common/chartTheme";

/** Momentum and kinetic energy over time — should read flat (momentum always, KE only if elastic). */
export default function CollisionChart({ data }) {
  return (
    <div className="qp-card">
      <h4>Momentum &amp; kinetic energy over time</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
          <XAxis dataKey="t" stroke={CHART.axis} tick={CHART.tick} label={{ value: "sim time (s)", position: "insideBottom", offset: -4, fill: "#64748b", fontSize: 10 }} />
          <YAxis stroke={CHART.axis} tick={CHART.tick} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="momentum" name="Total |p|" stroke="#3a6fe0" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="ke" name="Total KE" stroke="#e08a0b" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
