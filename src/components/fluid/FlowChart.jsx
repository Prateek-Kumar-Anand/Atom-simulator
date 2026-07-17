import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/** Velocity and pressure along the pipe's length — the constriction shows up as a
 * velocity spike and a matching pressure dip (continuity + Bernoulli in one picture). */
export default function FlowChart({ data }) {
  return (
    <div className="qp-card">
      <h4>Velocity &amp; pressure along the pipe</h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 6 }}>
          <CartesianGrid stroke="#1f2b3a" />
          <XAxis
            dataKey="xFrac" stroke="#7c8a9c" tick={{ fontSize: 10 }}
            tickFormatter={(v) => v.toFixed(1)}
            label={{ value: "Position along pipe", position: "insideBottom", offset: -4, fill: "#7c8a9c", fontSize: 10 }}
          />
          <YAxis yAxisId="v" stroke="#4fd8e0" tick={{ fontSize: 10 }} width={40} />
          <YAxis yAxisId="p" orientation="right" stroke="#f2a94e" tick={{ fontSize: 10 }} width={46} />
          <Tooltip contentStyle={{ background: "#0d131c", border: "1px solid #1f2b3a", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line yAxisId="v" type="monotone" dataKey="v" name="Velocity (m/s)" stroke="#4fd8e0" dot={false} strokeWidth={2} />
          <Line yAxisId="p" type="monotone" dataKey="Pkpa" name="Pressure (kPa)" stroke="#f2a94e" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
