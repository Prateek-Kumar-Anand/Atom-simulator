import { numericGradient } from "../../math/expr";

/** Build a scalar-field record (same shape as FIELDS entries) from a compiled f(x, y). */
export function makeCustomField(f, label, half) {
  return {
    key: "custom",
    label: `f = ${label}`,
    domain: [-half, half, -half, half],
    f: (x, y) => f(x, y),
    grad: (x, y) => numericGradient(f, x, y, 1e-5),
    start: [Number((half * 0.6).toFixed(2)), Number((half * 0.45).toFixed(2))],
    eta: 0.05,
    note: "Your own formula — the gradient is computed numerically (central differences).",
  };
}
