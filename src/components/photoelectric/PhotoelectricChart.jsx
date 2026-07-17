import React, { useMemo } from "react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { CONST } from "../../physics/constants";

const AXIS_STYLE = { stroke: "#7c8a9c", fontSize: 10 };
const TOOLTIP_STYLE = { background: "#0d131c", border: "1px solid #1f2b3a", fontSize: 12 };

export function KineticEnergyChart({ workFunctionEV, thresholdFreq }) {
  const data = useMemo(() => {
    const arr = [];
    for (let f = 3; f <= 13; f += 0.4) {
      arr.push({ f: f.toFixed(1), KE: Math.max(0, CONST.hEV * f * 1e14 - workFunctionEV) });
    }
    return arr;
  }, [workFunctionEV]);

  return (
    <div className="qp-card">
      <h4>Kinetic energy vs. frequency</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid stroke="#1f2b3a" />
          <XAxis dataKey="f" tick={AXIS_STYLE} label={{ value: "f (×10¹⁴ Hz)", position: "insideBottom", offset: -4, fill: "#7c8a9c", fontSize: 10 }} stroke="#7c8a9c" />
          <YAxis tick={AXIS_STYLE} label={{ value: "KEmax (eV)", angle: -90, position: "insideLeft", fill: "#7c8a9c", fontSize: 10 }} stroke="#7c8a9c" />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <ReferenceLine x={thresholdFreq.toFixed(1)} stroke="#ef5b6f" strokeDasharray="4 4" label={{ value: "f₀", fill: "#ef5b6f", fontSize: 10 }} />
          <Line type="monotone" dataKey="KE" stroke="#4fd8e0" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PhotocurrentChart({ stoppingV, intensity }) {
  const data = useMemo(() => {
    const arr = [];
    for (let v = -stoppingV - 1; v <= 4; v += 0.4) {
      const current = v <= -stoppingV ? 0 : Math.min(1, (v + stoppingV) / (stoppingV + 2)) * (intensity / 100);
      arr.push({ v: v.toFixed(1), I: Number(current.toFixed(3)) });
    }
    return arr;
  }, [stoppingV, intensity]);

  return (
    <div className="qp-card">
      <h4>Photocurrent vs. retarding voltage (idealized)</h4>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <CartesianGrid stroke="#1f2b3a" />
          <XAxis dataKey="v" tick={AXIS_STYLE} label={{ value: "V (volts)", position: "insideBottom", offset: -4, fill: "#7c8a9c", fontSize: 10 }} stroke="#7c8a9c" />
          <YAxis tick={AXIS_STYLE} stroke="#7c8a9c" />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Area type="monotone" dataKey="I" stroke="#f2a94e" fill="#f2a94e33" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
