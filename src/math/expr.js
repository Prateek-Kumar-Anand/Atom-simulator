/**
 * math/expr.js
 * -----------------------------------------------------------------------
 * A small, safe formula parser (no eval). Turns text such as
 *     "z^2 + 1/z"      "sin(x)*cos(y) - 0.1*(x^2+y^2)"      "2z(z+1)"
 * into a fast JavaScript function.
 *
 * Grammar:  + − * /  ^ (right-associative, binds tighter than unary minus),
 *           parentheses, function calls, and implicit multiplication ("2x", "3(x+1)", "x y").
 * Three evaluation modes share one parser:
 *   compileReal(src, vars)     → (x, y, …) => number        (scalar fields, vector-field components)
 *   compileComplex(src)        → ([re, im]) => [re, im]       (variables z, plus x = Re z and y = Im z)
 * Every compile returns { ok, f, error }; `error` is a short human-readable message.
 * -----------------------------------------------------------------------
 */
import * as C from "./complex";

/* ---- Tokeniser ----------------------------------------------------------------------------- */
function tokenize(srcRaw) {
  const src = String(srcRaw)
    .replace(/[−–]/g, "-").replace(/[·×]/g, "*").replace(/π/g, " pi ").replace(/²/g, "^2").replace(/³/g, "^3")
    .replace(/\*\*/g, "^");
  const out = [];
  const re = /\s*(?:(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)|([A-Za-z_][A-Za-z_0-9]*)|(.))/gy;
  let m;
  let pos = 0;
  while (pos < src.length && (m = re.exec(src)) !== null) {
    pos = re.lastIndex;
    if (m[1] !== undefined) out.push({ t: "num", v: parseFloat(m[1]), pos: m.index });
    else if (m[2] !== undefined) out.push({ t: "id", v: m[2], pos: m.index });
    else if (m[3] !== undefined && m[3].trim() !== "") {
      if ("+-*/^(),".includes(m[3])) out.push({ t: m[3], pos: m.index });
      else throw new SyntaxError(`Unexpected character '${m[3]}'`);
    }
  }
  return out;
}

/* ---- Parser (AST) -------------------------------------------------------------------------- */
function parse(tokens, funcs) {
  let i = 0;
  const peek = () => tokens[i];
  const take = () => tokens[i++];
  const startsPrimary = (t) => t && (t.t === "num" || t.t === "id" || t.t === "(");

  function sum() {
    let left = term();
    while (peek() && (peek().t === "+" || peek().t === "-")) {
      const op = take().t;
      left = { k: "bin", op, a: left, b: term() };
    }
    return left;
  }
  function term() {
    let left = unary();
    for (;;) {
      const t = peek();
      if (t && (t.t === "*" || t.t === "/")) { take(); left = { k: "bin", op: t.t, a: left, b: unary() }; }
      else if (startsPrimary(t)) left = { k: "bin", op: "*", a: left, b: unary() }; // implicit multiplication
      else return left;
    }
  }
  function unary() {
    const t = peek();
    if (t && t.t === "-") { take(); return { k: "neg", a: unary() }; }
    if (t && t.t === "+") { take(); return unary(); }
    return power();
  }
  function power() {
    const base = primary();
    if (peek() && peek().t === "^") { take(); return { k: "bin", op: "^", a: base, b: unary() }; }
    return base;
  }
  function primary() {
    const t = take();
    if (!t) throw new SyntaxError("The formula ends too early");
    if (t.t === "num") return { k: "num", v: t.v };
    if (t.t === "(") {
      const e = sum();
      if (!peek() || peek().t !== ")") throw new SyntaxError("Missing closing parenthesis ')'");
      take();
      return e;
    }
    if (t.t === "id") {
      if (funcs.has(t.v) && peek() && peek().t === "(") {
        take();
        const args = [];
        if (peek() && peek().t === ")") throw new SyntaxError(`Function '${t.v}' needs an argument`);
        for (;;) {
          args.push(sum());
          if (peek() && peek().t === ",") { take(); continue; }
          break;
        }
        if (!peek() || peek().t !== ")") throw new SyntaxError("Missing closing parenthesis ')'");
        take();
        return { k: "call", f: t.v, args };
      }
      if (funcs.has(t.v)) throw new SyntaxError(`Write ${t.v}( … ) with parentheses`);
      return { k: "var", n: t.v };
    }
    throw new SyntaxError(`Unexpected '${t.t}'`);
  }

  const ast = sum();
  if (i < tokens.length) throw new SyntaxError(`Unexpected '${tokens[i].t === "num" ? tokens[i].v : tokens[i].v || tokens[i].t}'`);
  return ast;
}

/* ---- Real-valued compilation --------------------------------------------------------------- */
const REAL_FUNCS = {
  sin: [1, Math.sin], cos: [1, Math.cos], tan: [1, Math.tan], asin: [1, Math.asin], acos: [1, Math.acos], atan: [1, Math.atan],
  sinh: [1, Math.sinh], cosh: [1, Math.cosh], tanh: [1, Math.tanh], exp: [1, Math.exp], ln: [1, Math.log], log: [1, Math.log],
  log10: [1, Math.log10], sqrt: [1, Math.sqrt], abs: [1, Math.abs], sign: [1, Math.sign], floor: [1, Math.floor], ceil: [1, Math.ceil],
  atan2: [2, Math.atan2], min: [2, Math.min], max: [2, Math.max], pow: [2, Math.pow],
};
const REAL_CONST = { pi: Math.PI, e: Math.E, tau: 2 * Math.PI };

function buildReal(node, vars) {
  switch (node.k) {
    case "num": { const v = node.v; return () => v; }
    case "var": {
      const idx = vars.indexOf(node.n);
      if (idx >= 0) return (a) => a[idx];
      if (node.n in REAL_CONST) { const v = REAL_CONST[node.n]; return () => v; }
      throw new SyntaxError(`Unknown name '${node.n}' — use ${vars.join(", ")} (and constants pi, e)`);
    }
    case "neg": { const f = buildReal(node.a, vars); return (a) => -f(a); }
    case "bin": {
      const fa = buildReal(node.a, vars), fb = buildReal(node.b, vars);
      switch (node.op) {
        case "+": return (a) => fa(a) + fb(a);
        case "-": return (a) => fa(a) - fb(a);
        case "*": return (a) => fa(a) * fb(a);
        case "/": return (a) => fa(a) / fb(a);
        default: return (a) => Math.pow(fa(a), fb(a));
      }
    }
    default: {
      const spec = REAL_FUNCS[node.f];
      if (spec[0] !== node.args.length) throw new SyntaxError(`${node.f}( ) takes ${spec[0]} argument${spec[0] > 1 ? "s" : ""}`);
      const fs = node.args.map((n) => buildReal(n, vars));
      const fn = spec[1];
      return spec[0] === 1 ? (a) => fn(fs[0](a)) : (a) => fn(fs[0](a), fs[1](a));
    }
  }
}

/** Compile a real formula in the given variable names, e.g. compileReal("x^2 - y", ["x", "y"]). */
export function compileReal(src, vars = ["x", "y"]) {
  try {
    if (!String(src).trim()) return { ok: false, f: null, error: "Type a formula" };
    const ast = parse(tokenize(src), new Set(Object.keys(REAL_FUNCS)));
    const g = buildReal(ast, vars);
    const f = (...args) => g(args);
    return { ok: true, f, error: null };
  } catch (e) {
    return { ok: false, f: null, error: e.message };
  }
}

/* ---- Complex-valued compilation ------------------------------------------------------------ */
const C1 = {
  sin: C.sin, cos: C.cos, tan: C.tan, sinh: C.sinh, cosh: C.cosh, tanh: C.tanh, exp: C.exp, log: C.log, ln: C.log, sqrt: C.sqrt,
  abs: (z) => [C.abs(z), 0], conj: C.conj, re: (z) => [z[0], 0], im: (z) => [z[1], 0], arg: (z) => [C.arg(z), 0],
};
const C_FUNCS = new Set([...Object.keys(C1), "pow"]);

function buildComplex(node) {
  switch (node.k) {
    case "num": { const v = [node.v, 0]; return () => v; }
    case "var":
      if (node.n === "z") return (z) => z;
      if (node.n === "x") return (z) => [z[0], 0];
      if (node.n === "y") return (z) => [z[1], 0];
      if (node.n === "i" || node.n === "j") return () => [0, 1];
      if (node.n === "pi") return () => [Math.PI, 0];
      if (node.n === "e") return () => [Math.E, 0];
      throw new SyntaxError(`Unknown name '${node.n}' — use z (or x, y), i, pi, e`);
    case "neg": { const f = buildComplex(node.a); return (z) => C.scale(f(z), -1); }
    case "bin": {
      const fa = buildComplex(node.a), fb = buildComplex(node.b);
      switch (node.op) {
        case "+": return (z) => C.add(fa(z), fb(z));
        case "-": return (z) => C.sub(fa(z), fb(z));
        case "*": return (z) => C.mul(fa(z), fb(z));
        case "/": return (z) => C.div(fa(z), fb(z));
        default: return (z) => C.pow(fa(z), fb(z));
      }
    }
    default: {
      const fs = node.args.map(buildComplex);
      if (node.f === "pow") {
        if (fs.length !== 2) throw new SyntaxError("pow( ) takes 2 arguments");
        return (z) => C.pow(fs[0](z), fs[1](z));
      }
      if (fs.length !== 1) throw new SyntaxError(`${node.f}( ) takes 1 argument`);
      const fn = C1[node.f];
      return (z) => fn(fs[0](z));
    }
  }
}

/** Compile a formula in z, e.g. compileComplex("z^2 + 1/z"). The result maps [re, im] → [re, im]. */
export function compileComplex(src) {
  try {
    if (!String(src).trim()) return { ok: false, f: null, error: "Type a formula" };
    const ast = parse(tokenize(src), C_FUNCS);
    return { ok: true, f: buildComplex(ast), error: null };
  } catch (e) {
    return { ok: false, f: null, error: e.message };
  }
}

/** Numerical derivative of an analytic f at z (central difference, real step). */
export function complexDerivative(f, z, h = 1e-6) {
  const a = f([z[0] + h, z[1]]), b = f([z[0] - h, z[1]]);
  return [(a[0] - b[0]) / (2 * h), (a[1] - b[1]) / (2 * h)];
}

/** Central-difference gradient of f(x, y). */
export function numericGradient(f, x, y, h = 1e-5) {
  return [(f(x + h, y) - f(x - h, y)) / (2 * h), (f(x, y + h) - f(x, y - h)) / (2 * h)];
}
