import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { CHART, TOOLTIP_STYLE, xAxisLabel } from "../common/chartTheme";

/** Velocity and pressure along the pipe's length — the constriction shows up as a
 * velocity spike and a matching pressure dip (continuity + Bernoulli in one picture). */
export default function FlowChart({ data }) {
  return (
    <div className="qp-card">
      <h4>Velocity &amp; pressure along the pipe</h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 6 }}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="xFrac" type="number" domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]}
            stroke={CHART.axis} tick={CHART.tick}
            tickFormatter={(v) => Number(v).toFixed(2)}
            label={xAxisLabel("Position along pipe (inlet → outlet)")}
          />
          <YAxis yAxisId="v" stroke="#0fa3b8" tick={CHART.tick} width={40} />
          <YAxis yAxisId="p" orientation="right" stroke="#e08a0b" tick={CHART.tick} width={46} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => Number(v).toFixed(2)} labelFormatter={(v) => `x = ${Number(v).toFixed(2)}`} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line yAxisId="v" type="monotone" dataKey="v" name="Velocity (m/s)" stroke="#0fa3b8" dot={false} strokeWidth={2} isAnimationActive={false} />
          <Line yAxisId="p" type="monotone" dataKey="Pkpa" name="Pressure (kPa)" stroke="#e08a0b" dot={false} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
