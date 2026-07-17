import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/** Momentum and kinetic energy over time — should read flat (momentum always, KE only if elastic). */
export default function CollisionChart({ data }) {
  return (
    <div className="qp-card">
      <h4>Momentum &amp; kinetic energy over time</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid stroke="#1f2b3a" />
          <XAxis dataKey="t" stroke="#7c8a9c" tick={{ fontSize: 10 }} label={{ value: "sim time (s)", position: "insideBottom", offset: -4, fill: "#7c8a9c", fontSize: 10 }} />
          <YAxis stroke="#7c8a9c" tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ background: "#0d131c", border: "1px solid #1f2b3a", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="momentum" name="Total |p|" stroke="#5b8def" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="ke" name="Total KE" stroke="#f2a94e" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
