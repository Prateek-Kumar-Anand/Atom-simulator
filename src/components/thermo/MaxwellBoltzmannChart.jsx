import React, { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { sampleMaxwellBoltzmann, characteristicSpeeds } from "../../physics/thermodynamics";

/** Maxwell–Boltzmann molecular speed distribution at the current gas state. */
export default function MaxwellBoltzmannChart({ molarMass, T, color }) {
  const data = useMemo(() => sampleMaxwellBoltzmann(molarMass, T, 80), [molarMass, T]);
  const { vp, vMean, vRms } = useMemo(() => characteristicSpeeds(molarMass, T), [molarMass, T]);
  const chartData = data.map((p) => ({ v: Math.round(p.v), f: p.f }));

  return (
    <div className="qp-card">
      <h4>Maxwell–Boltzmann speed distribution</h4>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 6, right: 12, left: 0, bottom: 6 }}>
          <CartesianGrid stroke="#1f2b3a" />
          <XAxis
            dataKey="v" stroke="#7c8a9c" tick={{ fontSize: 10 }}
            label={{ value: "Molecular speed (m/s)", position: "insideBottom", offset: -4, fill: "#7c8a9c", fontSize: 10 }}
          />
          <YAxis stroke="#7c8a9c" tick={{ fontSize: 10 }} width={30} />
          <Tooltip contentStyle={{ background: "#0d131c", border: "1px solid #1f2b3a", fontSize: 12 }} />
          <Area type="monotone" dataKey="f" stroke={color} fill={color} fillOpacity={0.22} strokeWidth={2} />
          <ReferenceLine x={Math.round(vp)} stroke="#7c8a9c" strokeDasharray="3 3" label={{ value: "vₚ", fill: "#7c8a9c", fontSize: 10 }} />
          <ReferenceLine x={Math.round(vRms)} stroke="#f2a94e" strokeDasharray="3 3" label={{ value: "v_rms", fill: "#f2a94e", fontSize: 10 }} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="qp-shellrow small qp-muted">
        <span>Most probable v<sub>p</sub> = {vp.toFixed(0)} m/s</span>
        <span>Mean v&#772; = {vMean.toFixed(0)} m/s</span>
        <span>RMS v<sub>rms</sub> = {vRms.toFixed(0)} m/s</span>
      </div>
    </div>
  );
}
