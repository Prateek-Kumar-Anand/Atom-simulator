import { rampColor } from "../math/MathPlot";

/**
 * Build a pixel painter for a scalar field: sequential colour ramp plus thin darker contour bands.
 * Fields with a huge dynamic range (Himmelblau, Rosenbrock) are shown on a square-root scale so the
 * valleys stay readable.
 */
export function makeFieldPainter(field) {
  const [x0, x1, y0, y1] = field.domain;
  const sqrtScale = field.key === "himmelblau" || field.key === "rosenbrock";
  const n = 48;
  const vals = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) vals.push(field.f(x0 + ((i + 0.5) / n) * (x1 - x0), y0 + ((j + 0.5) / n) * (y1 - y0)));
  vals.sort((a, b) => a - b);
  const lo = vals[0];
  const hi = vals[Math.floor(vals.length * 0.96)];
  const tf = (v) => (sqrtScale ? Math.sqrt(Math.max(0, v - lo)) : v - lo);
  const span = tf(hi) || 1;
  const levels = 14;
  return (x, y) => {
    const t = Math.min(1, Math.max(0, tf(field.f(x, y)) / span));
    const c = rampColor(t);
    const band = (t * levels) % 1;
    const k = band < 0.07 && t < 0.999 ? 0.8 : 1;
    return [Math.round(c[0] * k), Math.round(c[1] * k), Math.round(c[2] * k)];
  };
}
