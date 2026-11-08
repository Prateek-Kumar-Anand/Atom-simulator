import React, { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { sampleMaxwellBoltzmann, characteristicSpeeds } from "../../physics/thermodynamics";
import { CHART, TOOLTIP_STYLE, xAxisLabel } from "../common/chartTheme";

/**
 * Maxwell–Boltzmann molecular speed distribution at the current gas state.
 * The x-axis is numeric so the v_p and v_rms markers sit at their true positions
 * (as text categories they only drew when they happened to equal a sampled label).
 */
export default function MaxwellBoltzmannChart({ molarMass, T, color }) {
  const chartData = useMemo(() => sampleMaxwellBoltzmann(molarMass, T, 80), [molarMass, T]);
  const { vp, vMean, vRms } = useMemo(() => characteristicSpeeds(molarMass, T), [molarMass, T]);
  const vMax = vRms * 2.6;

  return (
    <div className="qp-card">
      <h4>Maxwell–Boltzmann speed distribution</h4>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 14, right: 14, left: 0, bottom: 6 }}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="v" type="number" domain={[0, vMax]} tickFormatter={(v) => Math.round(v)}
            stroke={CHART.axis} tick={CHART.tick} label={xAxisLabel("Molecular speed (m/s)")}
          />
          <YAxis stroke={CHART.axis} tick={CHART.tick} width={30} tickFormatter={(v) => Number(v).toExponential(0)} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [Number(v).toExponential(2), "f(v)"]} labelFormatter={(v) => `v = ${Math.round(v)} m/s`} />
          <Area type="monotone" dataKey="f" stroke={color} fill={color} fillOpacity={0.22} strokeWidth={2} isAnimationActive={false} />
          <ReferenceLine x={vp} stroke="#64748b" strokeDasharray="3 3" label={{ value: "vₚ", fill: "#64748b", fontSize: 10, position: "top" }} />
          <ReferenceLine x={vRms} stroke="#e08a0b" strokeDasharray="3 3" label={{ value: "v_rms", fill: "#e08a0b", fontSize: 10, position: "top" }} />
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
