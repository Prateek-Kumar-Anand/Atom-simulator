import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot,
} from "recharts";

/** path: [{V, P}] in m^3 / Pa. current: {V, P} for the live marker. color: accent for line + dot. */
export default function PVChart({ path, current, color }) {
  const data = path.map((p) => ({ V: Number((p.V * 1000).toFixed(4)), P: Number((p.P / 1000).toFixed(3)) }));
  const currentV = current ? Number((current.V * 1000).toFixed(4)) : null;
  const currentP = current ? Number((current.P / 1000).toFixed(3)) : null;

  return (
    <div className="qp-card">
      <h4>P–V diagram</h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 6 }}>
          <CartesianGrid stroke="#1f2b3a" />
          <XAxis
            dataKey="V" type="number" domain={["dataMin", "dataMax"]} stroke="#7c8a9c" tick={{ fontSize: 10 }}
            label={{ value: "Volume (L)", position: "insideBottom", offset: -4, fill: "#7c8a9c", fontSize: 10 }}
          />
          <YAxis
            stroke="#7c8a9c" tick={{ fontSize: 10 }}
            label={{ value: "Pressure (kPa)", angle: -90, position: "insideLeft", fill: "#7c8a9c", fontSize: 10 }}
          />
          <Tooltip contentStyle={{ background: "#0d131c", border: "1px solid #1f2b3a", fontSize: 12 }} />
          <Line type="monotone" dataKey="P" name="Process path" stroke={color} dot={false} strokeWidth={2} />
          {currentV !== null && <ReferenceDot x={currentV} y={currentP} r={6} fill={color} stroke="#0d131c" strokeWidth={2} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
