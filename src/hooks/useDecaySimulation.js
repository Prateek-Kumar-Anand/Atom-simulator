import { useEffect, useRef, useState } from "react";
import { decayConstant, expectedRemaining, stepDecay } from "../physics/decay";

const TICK_SECONDS = 0.15;

/**
 * useDecaySimulation — drives a discrete-time Monte Carlo radioactive decay
 * simulation. Re-initializes whenever atomCount or resetToken changes;
 * plays/pauses via a plain interval (simple and sufficient, since the decay
 * demo does not need 60fps smoothness like the 3D viewports).
 */
export function useDecaySimulation({ atomCount, halfLife, speed, resetToken }) {
  const aliveRef = useRef(new Array(atomCount).fill(true));
  const timeRef = useRef(0);
  const [aliveView, setAliveView] = useState(() => new Array(atomCount).fill(true));
  const [chartData, setChartData] = useState([{ t: 0, N: atomCount, theory: atomCount }]);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    aliveRef.current = new Array(atomCount).fill(true);
    setAliveView(new Array(atomCount).fill(true));
    setChartData([{ t: 0, N: atomCount, theory: atomCount }]);
    timeRef.current = 0;
    setPlaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atomCount, resetToken]);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => {
      const dt = TICK_SECONDS * speed;
      timeRef.current += dt;
      const aliveCount = stepDecay(aliveRef.current, halfLife, dt);
      setAliveView(aliveRef.current.slice());
      setChartData((prev) => {
        const theory = expectedRemaining(atomCount, halfLife, timeRef.current);
        const next = [...prev, { t: Number(timeRef.current.toFixed(2)), N: aliveCount, theory: Number(theory.toFixed(1)) }];
        return next.length > 200 ? next.slice(next.length - 200) : next;
      });
      if (aliveCount === 0) setPlaying(false);
    }, 150);
    return () => clearInterval(id);
  }, [playing, halfLife, speed, atomCount]);

  const currentN = aliveView.filter(Boolean).length;
  const lambda = decayConstant(halfLife);

  return {
    aliveView, chartData, playing, setPlaying,
    currentN, lambda, elapsed: timeRef.current,
  };
}
