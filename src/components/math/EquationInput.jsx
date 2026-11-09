import React, { useMemo, useRef } from "react";
import { compileComplex, compileReal } from "../../math/expr";

/**
 * Compile a formula string. While the text is mid-edit and invalid, `f` keeps returning the
 * last valid function so the picture never blanks out; `error` tells the user what is wrong.
 *   mode "complex" → f([re, im]) → [re, im], variable z (x, y = Re z, Im z)
 *   mode "real"    → f(x, y, …) → number, variables given by `vars`
 */
export function useFormula(src, mode = "real", vars = ["x", "y"]) {
  const last = useRef(null);
  const key = vars.join(",");
  const res = useMemo(() => (mode === "complex" ? compileComplex(src) : compileReal(src, vars)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [src, mode, key]);
  if (res.ok) last.current = res.f;
  return { ok: res.ok, error: res.error, f: res.ok ? res.f : last.current };
}

/** Labelled one-line formula editor with live error message and clickable examples. */
export default function EquationInput({ label, prefix, value, onChange, error, examples = [], hint, id }) {
  const inputId = id || "eq-" + String(label).replace(/\W+/g, "-");
  return (
    <div className="qp-eq">
      <label htmlFor={inputId} className="qp-eq-label">{label}</label>
      <div className={"qp-eq-row" + (error ? " invalid" : "")}>
        {prefix && <span className="qp-eq-prefix">{prefix}</span>}
        <input
          id={inputId} className="qp-eq-input" type="text" value={value} spellCheck={false} autoComplete="off" autoCapitalize="off"
          onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={inputId + "-msg"}
        />
      </div>
      <div id={inputId + "-msg"} className={"qp-eq-msg" + (error ? " error" : "")} role={error ? "alert" : undefined}>
        {error ? `⚠ ${error}` : hint || "Valid formula"}
      </div>
      {examples.length > 0 && (
        <div className="qp-eq-examples">
          {examples.map((ex) => (
            <button key={ex} type="button" className="qp-chip" onClick={() => onChange(ex)}>{ex}</button>
          ))}
        </div>
      )}
    </div>
  );
}
