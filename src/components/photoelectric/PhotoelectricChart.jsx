import React, { useMemo } from "react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { CONST } from "../../physics/constants";
import { CHART, TOOLTIP_STYLE, xAxisLabel, yAxisLabel } from "../common/chartTheme";

const F_MIN = 3; // ×10¹⁴ Hz — matches the frequency slider's lower bound

/**
 * KE_max vs. frequency. The x-axis is numeric (not a list of text categories) so the
 * threshold marker f₀ and the current-frequency marker are drawn at their exact
 * positions. Previously f₀ was matched against pre-rounded text labels and silently
 * failed to render for most metals; it also fell off the chart for high-φ metals
 * such as platinum, so the axis now widens to include f₀.
 */
export function KineticEnergyChart({ workFunctionEV, thresholdFreq, currentFreq }) {
  const fMax = Math.max(13, Math.ceil(thresholdFreq + 1));

  const data = useMemo(() => {
    const freqs = new Set();
    const steps = 80;
    for (let i = 0; i <= steps; i++) freqs.add(Number((F_MIN + ((fMax - F_MIN) * i) / steps).toFixed(4)));
    freqs.add(Number(thresholdFreq.toFixed(4))); // exact kink at the threshold frequency
    return [...freqs]
      .sort((a, b) => a - b)
      .map((f) => ({ f, KE: Math.max(0, CONST.hEV * f * 1e14 - workFunctionEV) }));
  }, [workFunctionEV, thresholdFreq, fMax]);

  return (
    <div className="qp-card">
      <h4>Kinetic energy vs. frequency</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 8, right: 14, left: 0, bottom: 6 }}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="f" type="number" domain={[F_MIN, fMax]} allowDataOverflow
            tickFormatter={(v) => Number(v).toFixed(0)} tick={CHART.tick} stroke={CHART.axis}
            label={xAxisLabel("f (×10¹⁴ Hz)")}
          />
          <YAxis tick={CHART.tick} stroke={CHART.axis} label={yAxisLabel("KEmax (eV)")} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${Number(v).toFixed(2)} eV`, "KEmax"]} labelFormatter={(v) => `f = ${Number(v).toFixed(2)}×10¹⁴ Hz`} />
          <ReferenceLine x={thresholdFreq} stroke="#e23d57" strokeDasharray="4 4" label={{ value: "f₀", fill: "#e23d57", fontSize: 10, position: "top" }} />
          {currentFreq >= F_MIN && currentFreq <= fMax && (
            <ReferenceLine x={currentFreq} stroke="#0fa3b8" strokeDasharray="2 3" label={{ value: "now", fill: "#0fa3b8", fontSize: 10, position: "top" }} />
          )}
          <Line type="linear" dataKey="KE" stroke="#0fa3b8" dot={false} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Idealized photocurrent vs. retarding voltage. Below the threshold frequency no
 * electrons are emitted at all, so the current must be zero at every voltage — the old
 * version still drew a positive current there, contradicting the physics it teaches.
 */
export function PhotocurrentChart({ stoppingV, intensity, emitting }) {
  const data = useMemo(() => {
    const arr = [];
    const vStart = -(stoppingV + 1);
    const vEnd = 4;
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const v = vStart + ((vEnd - vStart) * i) / steps;
      let current = 0;
      if (emitting && v > -stoppingV) {
        current = Math.min(1, (v + stoppingV) / (stoppingV + 2)) * (intensity / 100);
      }
      arr.push({ v: Number(v.toFixed(3)), I: Number(current.toFixed(3)) });
    }
    return arr;
  }, [stoppingV, intensity, emitting]);

  return (
    <div className="qp-card">
      <h4>Photocurrent vs. retarding voltage (idealized)</h4>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 8, right: 14, left: 0, bottom: 6 }}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="v" type="number" domain={["dataMin", "dataMax"]}
            tickFormatter={(v) => Number(v).toFixed(1)} tick={CHART.tick} stroke={CHART.axis}
            label={xAxisLabel("V (volts)")}
          />
          <YAxis domain={[0, 1]} tick={CHART.tick} stroke={CHART.axis} label={yAxisLabel("I (relative)")} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [Number(v).toFixed(2), "Current"]} labelFormatter={(v) => `V = ${Number(v).toFixed(2)} V`} />
          {emitting && <ReferenceLine x={-stoppingV} stroke="#e23d57" strokeDasharray="4 4" label={{ value: "−Vs", fill: "#e23d57", fontSize: 10, position: "top" }} />}
          <Area type="monotone" dataKey="I" stroke="#e08a0b" fill="#e08a0b33" strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
