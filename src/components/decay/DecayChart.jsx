import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { CHART, TOOLTIP_STYLE } from "../common/chartTheme";

export default function DecayChart({ data }) {
  return (
    <div className="qp-card">
      <h4>Population over time</h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
          <XAxis dataKey="t" stroke={CHART.axis} tick={CHART.tick} label={{ value: "sim time", position: "insideBottom", offset: -4, fill: "#64748b", fontSize: 10 }} />
          <YAxis stroke={CHART.axis} tick={CHART.tick} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="stepAfter" dataKey="N" name="Simulated N(t)" stroke="#0fa3b8" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="theory" name="Theoretical N₀e^(−λt)" stroke="#e08a0b" dot={false} strokeDasharray="4 3" strokeWidth={1.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
