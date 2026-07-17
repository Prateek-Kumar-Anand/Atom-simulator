import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function DecayChart({ data }) {
  return (
    <div className="qp-card">
      <h4>Population over time</h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid stroke="#1f2b3a" />
          <XAxis dataKey="t" stroke="#7c8a9c" tick={{ fontSize: 10 }} label={{ value: "sim time", position: "insideBottom", offset: -4, fill: "#7c8a9c", fontSize: 10 }} />
          <YAxis stroke="#7c8a9c" tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ background: "#0d131c", border: "1px solid #1f2b3a", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="stepAfter" dataKey="N" name="Simulated N(t)" stroke="#4fd8e0" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="theory" name="Theoretical N₀e^(−λt)" stroke="#f2a94e" dot={false} strokeDasharray="4 3" strokeWidth={1.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
