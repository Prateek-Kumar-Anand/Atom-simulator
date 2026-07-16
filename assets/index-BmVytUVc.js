import {
  r as l,
  j as e,
  C as re,
  S as ie,
  O as le,
  u as I,
  V as q,
  E as oe,
  B as ce,
  a as de,
  R as he
} from "./three-BbJmJy5C.js";
import {
  R as O,
  L as U,
  C as D,
  X as T,
  Y as V,
  T as B,
  a as me,
  b as $,
  A as ue,
  c as pe,
  d as xe
} from "./charts-CN3KVD3g.js";
(function() {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const r of document.querySelectorAll('link[rel="modulepreload"]')) n(r);
  new MutationObserver(r => {
    for (const i of r)
      if (i.type === "childList")
        for (const h of i.addedNodes) h.tagName === "LINK" && h.rel === "modulepreload" && n(h)
  }).observe(document, {
    childList: !0,
    subtree: !0
  });

  function a(r) {
    const i = {};
    return r.integrity && (i.integrity = r.integrity), r.referrerPolicy && (i.referrerPolicy = r.referrerPolicy), r.crossOrigin === "use-credentials" ? i.credentials = "include" : r.crossOrigin === "anonymous" ? i.credentials = "omit" : i.credentials = "same-origin", i
  }

  function n(r) {
    if (r.ep) return;
    r.ep = !0;
    const i = a(r);
    fetch(r.href, i)
  }
})();
const S = {
  hEV: 4135667696e-24,
  c: 299792458,
  hc_eVnm: 1239.8419843
};

function f(s, t = 3) {
  return s == null || Number.isNaN(s) ? "—" : Math.abs(s) !== 0 && (Math.abs(s) < .001 || Math.abs(s) >= 1e5) ? s.toExponential(t) : s.toLocaleString(void 0, {
    maximumFractionDigits: t
  })
}

function fe(s, t, a = "text/plain") {
  const n = new Blob([t], {
      type: a
    }),
    r = URL.createObjectURL(n),
    i = document.createElement("a");
  i.href = r, i.download = s, document.body.appendChild(i), i.click(), document.body.removeChild(i), URL.revokeObjectURL(r)
}

function Y(s) {
  let t = 0,
    a = 0,
    n = 0;
  if (s >= 380 && s < 440) t = -(s - 440) / 60, a = 0, n = 1;
  else if (s < 490) t = 0, a = (s - 440) / 50, n = 1;
  else if (s < 510) t = 0, a = 1, n = -(s - 510) / 20;
  else if (s < 580) t = (s - 510) / 70, a = 1, n = 0;
  else if (s < 645) t = 1, a = -(s - 645) / 65, n = 0;
  else if (s <= 780) t = 1, a = 0, n = 0;
  else return "rgb(70,70,95)";
  let r = 1;
  s < 420 ? r = .3 + .7 * (s - 380) / 40 : s > 700 && (r = .3 + .7 * (780 - s) / 80);
  const i = .8,
    h = Math.round(255 * Math.pow(Math.max(t, 0) * r, i)),
    o = Math.round(255 * Math.pow(Math.max(a, 0) * r, i)),
    c = Math.round(255 * Math.pow(Math.max(n, 0) * r, i));
  return `rgb(${h},${o},${c})`
}
const L = [{
    key: "atom",
    label: "Atomic Structure",
    code: "01"
  }, {
    key: "spectrum",
    label: "Hydrogen Spectrum",
    code: "02"
  }, {
    key: "photoelectric",
    label: "Photoelectric Effect",
    code: "03"
  }, {
    key: "decay",
    label: "Radioactive Decay",
    code: "04"
  }, {
    key: "particles",
    label: "Particle Collisions",
    code: "05"
  }],
  X = l.createContext(null);

function je({
  children: s
}) {
  const [t, a] = l.useState("atom"), [n, r] = l.useState(() => new Set(["atom"])), [i, h] = l.useState([]), [o, c] = l.useState(!1);
  l.useEffect(() => {
    r(v => new Set(v).add(t))
  }, [t]);
  const d = l.useCallback((v, m, y) => {
      h(g => [{
        id: Date.now(),
        module: v,
        label: m,
        detail: y,
        time: new Date().toLocaleTimeString()
      }, ...g]), c(!0)
    }, []),
    u = l.useCallback(() => {
      const v = ["QUANTA — Atomic Physics Laboratory — Session Report", `Generated: ${new Date().toLocaleString()}`, `Modules explored: ${n.size} / ${L.length}`, "".padEnd(60, "-"), ...i.slice().reverse().map(m => `[${m.time}] ${m.module} — ${m.label}
  ${m.detail}`)];
      fe("atomic-physics-lab-report.txt", v.join(`

`))
    }, [i, n]),
    x = {
      active: t,
      setActive: a,
      visited: n,
      results: i,
      log: d,
      exportResults: u,
      notebookOpen: o,
      setNotebookOpen: c
    };
  return e.jsx(X.Provider, {
    value: x,
    children: s
  })
}

function N() {
  const s = l.useContext(X);
  if (!s) throw new Error("useApp must be used within AppProvider");
  return s
}

function ye() {
  const {
    visited: s
  } = N();
  return e.jsxs("header", {
    className: "qp-topbar",
    children: [e.jsxs("div", {
      className: "qp-brand",
      children: [e.jsx("span", {
        className: "qp-brand-mark",
        children: "Q"
      }), "UANTA ", e.jsxs("span", {
        className: "qp-brand-sub",
        children: ["// ", "Atomic Physics Laboratory"]
      })]
    }), e.jsxs("div", {
      className: "qp-progress",
      children: [e.jsx("span", {
        children: "SESSION PROGRESS"
      }), e.jsx("div", {
        className: "qp-progress-track",
        children: e.jsx("div", {
          className: "qp-progress-fill",
          style: {
            width: `${s.size/L.length*100}%`
          }
        })
      }), e.jsxs("span", {
        children: [s.size, "/", L.length]
      })]
    })]
  })
}
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ve = s => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
  Q = (...s) => s.filter((t, a, n) => !!t && n.indexOf(t) === a).join(" ");
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var be = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ge = l.forwardRef(({
  color: s = "currentColor",
  size: t = 24,
  strokeWidth: a = 2,
  absoluteStrokeWidth: n,
  className: r = "",
  children: i,
  iconNode: h,
  ...o
}, c) => l.createElement("svg", {
  ref: c,
  ...be,
  width: t,
  height: t,
  stroke: s,
  strokeWidth: n ? Number(a) * 24 / Number(t) : a,
  className: Q("lucide", r),
  ...o
}, [...h.map(([d, u]) => l.createElement(d, u)), ...Array.isArray(i) ? i : [i]]));
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const b = (s, t) => {
  const a = l.forwardRef(({
    className: n,
    ...r
  }, i) => l.createElement(ge, {
    ref: i,
    iconNode: t,
    className: Q(`lucide-${ve(s)}`, n),
    ...r
  }));
  return a.displayName = `${s}`, a
};
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ne = b("Activity", [
  ["path", {
    d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
    key: "169zse"
  }]
]);
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ke = b("BookOpen", [
  ["path", {
    d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",
    key: "vv98re"
  }],
  ["path", {
    d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
    key: "1cyq3y"
  }]
]);
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const qe = b("ChevronDown", [
  ["path", {
    d: "m6 9 6 6 6-6",
    key: "qrunsl"
  }]
]);
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const J = b("ChevronRight", [
  ["path", {
    d: "m9 18 6-6-6-6",
    key: "mthhwq"
  }]
]);
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Se = b("Download", [
  ["path", {
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
    key: "ih7n3h"
  }],
  ["polyline", {
    points: "7 10 12 15 17 10",
    key: "2ggqvy"
  }],
  ["line", {
    x1: "12",
    x2: "12",
    y1: "15",
    y2: "3",
    key: "1vk2je"
  }]
]);
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Me = b("FlaskConical", [
  ["path", {
    d: "M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2",
    key: "pzvekw"
  }],
  ["path", {
    d: "M8.5 2h7",
    key: "csnxdl"
  }],
  ["path", {
    d: "M7 16h10",
    key: "wp8him"
  }]
]);
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const C = b("Info", [
  ["circle", {
    cx: "12",
    cy: "12",
    r: "10",
    key: "1mglay"
  }],
  ["path", {
    d: "M12 16v-4",
    key: "1dtifu"
  }],
  ["path", {
    d: "M12 8h.01",
    key: "e9boi3"
  }]
]);
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ee = b("Lightbulb", [
  ["path", {
    d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
    key: "1gvzjb"
  }],
  ["path", {
    d: "M9 18h6",
    key: "x1upvd"
  }],
  ["path", {
    d: "M10 22h4",
    key: "ceow96"
  }]
]);
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const we = b("NotebookPen", [
  ["path", {
    d: "M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4",
    key: "re6nr2"
  }],
  ["path", {
    d: "M2 6h4",
    key: "aawbzj"
  }],
  ["path", {
    d: "M2 10h4",
    key: "l0bgd4"
  }],
  ["path", {
    d: "M2 14h4",
    key: "1gsvsf"
  }],
  ["path", {
    d: "M2 18h4",
    key: "1bu2t1"
  }],
  ["path", {
    d: "M18.4 2.6a2.17 2.17 0 0 1 3 3L16 11l-4 1 1-4Z",
    key: "1dba1m"
  }]
]);
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ce = b("Orbit", [
  ["circle", {
    cx: "12",
    cy: "12",
    r: "3",
    key: "1v7zrd"
  }],
  ["circle", {
    cx: "19",
    cy: "5",
    r: "2",
    key: "mhkx31"
  }],
  ["circle", {
    cx: "5",
    cy: "19",
    r: "2",
    key: "v8kfzx"
  }],
  ["path", {
    d: "M10.4 21.9a10 10 0 0 0 9.941-15.416",
    key: "eohfx2"
  }],
  ["path", {
    d: "M13.5 2.1a10 10 0 0 0-9.841 15.416",
    key: "19pvbm"
  }]
]);
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const se = b("Pause", [
  ["rect", {
    x: "14",
    y: "4",
    width: "4",
    height: "16",
    rx: "1",
    key: "zuxfzm"
  }],
  ["rect", {
    x: "6",
    y: "4",
    width: "4",
    height: "16",
    rx: "1",
    key: "1okwgv"
  }]
]);
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const te = b("Play", [
  ["polygon", {
    points: "6 3 20 12 6 21 6 3",
    key: "1oa8hb"
  }]
]);
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ae = b("RotateCcw", [
  ["path", {
    d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
    key: "1357e3"
  }],
  ["path", {
    d: "M3 3v5h5",
    key: "1xhq8a"
  }]
]);
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ee = b("Sparkles", [
  ["path", {
    d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
    key: "4pj2yx"
  }],
  ["path", {
    d: "M20 3v4",
    key: "1olli1"
  }],
  ["path", {
    d: "M22 5h-4",
    key: "1gvqau"
  }],
  ["path", {
    d: "M4 17v2",
    key: "vumght"
  }],
  ["path", {
    d: "M5 18H3",
    key: "zchphs"
  }]
]);
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Re = b("Waves", [
  ["path", {
    d: "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    key: "knzxuh"
  }],
  ["path", {
    d: "M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    key: "2jd2cc"
  }],
  ["path", {
    d: "M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    key: "rd2r6e"
  }]
]);
/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Le = b("X", [
    ["path", {
      d: "M18 6 6 18",
      key: "1bl5f8"
    }],
    ["path", {
      d: "m6 6 12 12",
      key: "d8bk6v"
    }]
  ]),
  Ae = {
    atom: Ce,
    spectrum: Re,
    photoelectric: ee,
    decay: Ne,
    particles: Me
  };

function Pe() {
  const {
    active: s,
    setActive: t,
    visited: a
  } = N();
  return e.jsx("nav", {
    className: "qp-sidebar",
    children: L.map(n => {
      const r = Ae[n.key];
      return e.jsxs("button", {
        className: "qp-nav-item" + (s === n.key ? " active" : ""),
        onClick: () => t(n.key),
        children: [e.jsx("span", {
          className: "qp-nav-code",
          children: n.code
        }), e.jsx(r, {
          size: 16
        }), e.jsx("span", {
          className: "qp-nav-label",
          children: n.label
        }), a.has(n.key) && e.jsx("span", {
          className: "qp-nav-check"
        })]
      }, n.key)
    })
  })
}
const $e = {
  atom: {
    title: "Atomic structure",
    body: ["An atom consists of a dense, positively charged nucleus (protons + neutrons) surrounded by electrons occupying discrete energy shells.", "Nuclear radius scales approximately as r ≈ r₀·A^(1/3), which is why heavier nuclei are only modestly larger than light ones.", "Shell capacities follow 2, 8, 8, 18, 18, 32 (2n² up to a cap) — the simplified Bohr model taught before quantum subshells (s, p, d, f)."]
  },
  spectrum: {
    title: "Hydrogen spectrum",
    body: ["Bohr's model restricts the electron to discrete orbits with energy Eₙ = −13.6 eV / n².", "A transition between levels emits or absorbs a photon with energy ΔE = |E_ni − E_nf|, and wavelength λ = hc / ΔE.", "Transitions ending on n=1 form the Lyman series (UV), n=2 the Balmer series (mostly visible), and n=3 the Paschen series (infrared)."]
  },
  photoelectric: {
    title: "Photoelectric effect",
    body: ["Einstein's explanation: light arrives in quanta (photons) of energy E = hf, not as a continuous wave.", "An electron is only emitted if a single photon's energy exceeds the metal's work function φ; extra energy becomes kinetic energy: KEmax = hf − φ.", "Increasing intensity increases the number of photons per second (more electrons, if hf > φ) but never changes each photon's energy."]
  },
  decay: {
    title: "Radioactive decay",
    body: ["Decay is a random per-atom process. The population follows N(t) = N₀·e^(−λt), where λ = ln 2 / T½ is the decay constant.", "Half-life T½ is the time for half of a sample to decay — it is independent of how many atoms remain.", "Activity A(t) = λN(t) is the number of decays per second, and decreases exponentially alongside the population."]
  },
  particles: {
    title: "Particle collisions",
    body: ["For an elastic collision, both momentum (Σmv) and kinetic energy (Σ½mv²) are conserved.", "For two bodies colliding along the line joining their centers, exchanged velocity depends on the mass ratio — a light particle hitting a heavy one mostly bounces back.", "Wall bounces here are perfectly elastic (speed preserved, direction reflected), so total kinetic energy stays constant even though momentum direction changes at each wall."]
  }
};

function ze() {
  const {
    active: s
  } = N(), [t, a] = l.useState(!1), n = $e[s];
  return e.jsxs("div", {
    className: "qp-drawer" + (t ? " open" : ""),
    children: [e.jsxs("button", {
      className: "qp-drawer-toggle",
      onClick: () => a(r => !r),
      children: [e.jsx(ke, {
        size: 14
      }), " Theory — ", n.title, " ", t ? e.jsx(qe, {
        size: 14
      }) : e.jsx(J, {
        size: 14
      })]
    }), t && e.jsx("div", {
      className: "qp-drawer-body",
      children: n.body.map((r, i) => e.jsx("p", {
        children: r
      }, i))
    })]
  })
}

function Ie() {
  const {
    results: s,
    exportResults: t,
    notebookOpen: a,
    setNotebookOpen: n
  } = N();
  return e.jsxs("div", {
    className: "qp-notebook" + (a ? " open" : ""),
    children: [e.jsxs("div", {
      className: "qp-notebook-head",
      children: [e.jsxs("span", {
        children: [e.jsx(we, {
          size: 14
        }), " Lab Notebook (", s.length, ")"]
      }), e.jsxs("div", {
        children: [e.jsx("button", {
          className: "qp-icon-btn",
          onClick: t,
          title: "Export results",
          children: e.jsx(Se, {
            size: 15
          })
        }), e.jsx("button", {
          className: "qp-icon-btn",
          onClick: () => n(r => !r),
          title: "Toggle notebook",
          children: a ? e.jsx(Le, {
            size: 15
          }) : e.jsx(J, {
            size: 15
          })
        })]
      })]
    }), a && e.jsxs("div", {
      className: "qp-notebook-body",
      children: [s.length === 0 && e.jsx("p", {
        className: "qp-muted small",
        children: "No results recorded yet — use “Record result” in any experiment."
      }), s.map(r => e.jsxs("div", {
        className: "qp-notebook-entry",
        children: [e.jsxs("div", {
          className: "qp-notebook-entry-head",
          children: [e.jsx("strong", {
            children: r.module
          }), e.jsx("span", {
            className: "qp-muted small",
            children: r.time
          })]
        }), e.jsx("div", {
          className: "qp-muted small",
          children: r.label
        }), e.jsx("div", {
          className: "small",
          children: r.detail
        })]
      }, r.id))]
    })]
  })
}

function H({
  label: s,
  children: t
}) {
  return e.jsxs("div", {
    className: "qp-hud",
    children: [e.jsx("div", {
      className: "qp-hud-corner tl"
    }), e.jsx("div", {
      className: "qp-hud-corner tr"
    }), e.jsx("div", {
      className: "qp-hud-corner bl"
    }), e.jsx("div", {
      className: "qp-hud-corner br"
    }), e.jsxs("div", {
      className: "qp-hud-label",
      children: [e.jsx("span", {
        className: "qp-dot-live"
      }), s]
    }), e.jsx("div", {
      className: "qp-hud-hint",
      children: "DRAG · ORBIT  SCROLL · ZOOM"
    }), t]
  })
}

function F({
  children: s,
  cameraDistance: t = 12,
  minDistance: a = 4,
  maxDistance: n = 34,
  autoRotateSpeed: r = .6
}) {
  return e.jsxs(re, {
    className: "qp-viewport",
    dpr: [1, 2],
    camera: {
      position: [t * .6, t * .5, t * .6],
      fov: 45
    },
    children: [e.jsx("ambientLight", {
      color: "#3a4a5c",
      intensity: 1.15
    }), e.jsx("pointLight", {
      color: "#6fe3ea",
      intensity: 2.4,
      distance: 80,
      position: [9, 10, 8]
    }), e.jsx("pointLight", {
      color: "#f2a94e",
      intensity: 1.3,
      distance: 80,
      position: [-9, -6, -8]
    }), e.jsx("directionalLight", {
      color: "#8fa8c8",
      intensity: .55,
      position: [-5, 8, -3]
    }), e.jsx(ie, {
      radius: 140,
      depth: 60,
      count: 2e3,
      factor: 2,
      fade: !0,
      speed: .4
    }), s, e.jsx(le, {
      enablePan: !1,
      minDistance: a,
      maxDistance: n,
      autoRotate: !0,
      autoRotateSpeed: r,
      enableDamping: !0,
      dampingFactor: .08
    })]
  })
}
const G = ["#4fd8e0", "#6bd68a", "#f2a94e", "#c084fc", "#5b8def", "#ef5b6f"];

function mulberryNF(s) {
  return function() {
    s |= 0, s = s + 1831565813 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function fccLatticePoints(s) {
  const t = [],
    a = 8;
  for (let n = -a; n <= a; n++)
    for (let r = -a; r <= a; r++)
      for (let i = -a; i <= a; i++)((n + r + i) % 2 + 2) % 2 === 0 && t.push([n, r, i]);
  return t.sort((n, r) => n[0] * n[0] + n[1] * n[1] + n[2] * n[2] - (r[0] * r[0] + r[1] * r[1] + r[2] * r[2])), t.slice(0, s)
}

function Oe(s, t) {
  return l.useMemo(() => {
    const a = s + t;
    if (a <= 0) return {
      positions: [],
      nucleusRadius: .85
    };
    const n = .64 / Math.sqrt(2);
    let r = fccLatticePoints(a).map(([x, v, m]) => [x * n, v * n, m * n]);
    let i = 0,
      h = 0,
      o = 0;
    for (const x of r) i += x[0], h += x[1], o += x[2];
    i /= a, h /= a, o /= a, r = r.map(x => [x[0] - i, x[1] - h, x[2] - o]);
    const c = mulberryNF(a * 7919 + s * 104729);
    for (let x = a - 1; x > 0; x--) {
      const v = Math.floor(c() * (x + 1));
      [r[x], r[v]] = [r[v], r[x]]
    }
    let d = 0;
    for (const x of r) {
      const v = Math.hypot(x[0], x[1], x[2]);
      v > d && (d = v)
    }
    return {
      positions: r.map((x, v) => ({
        pos: x,
        isProton: v < s
      })),
      nucleusRadius: d + .32
    }
  }, [s, t])
}

function De({
  position: s,
  isProton: t
}) {
  return e.jsxs("mesh", {
    position: s,
    children: [e.jsx("sphereGeometry", {
      args: [.32, 16, 16]
    }), e.jsx("meshStandardMaterial", {
      color: t ? "#ef5b6f" : "#5b8def",
      emissive: t ? "#6b1620" : "#152a52",
      emissiveIntensity: .65,
      roughness: .35,
      metalness: .2
    })]
  })
}

function Te({
  radius: s,
  count: t,
  index: a
}) {
  const n = l.useRef(),
    r = .55 / (a * .65 + 1);
  I((h, o) => {
    n.current && (n.current.rotation.y += r * o)
  });
  const i = G[a % G.length];
  return e.jsxs("group", {
    rotation: [.35 * a + .25, 0, .22 * a],
    children: [e.jsxs("mesh", {
      rotation: [Math.PI / 2, 0, 0],
      children: [e.jsx("torusGeometry", {
        args: [s, .012, 8, 96]
      }), e.jsx("meshBasicMaterial", {
        color: i,
        transparent: !0,
        opacity: .3
      })]
    }), e.jsx("group", {
      ref: n,
      children: Array.from({
        length: t
      }).map((h, o) => {
        const c = o / t * Math.PI * 2;
        return e.jsxs("mesh", {
          position: [s * Math.cos(c), 0, s * Math.sin(c)],
          children: [e.jsx("sphereGeometry", {
            args: [.17, 12, 12]
          }), e.jsx("meshStandardMaterial", {
            color: i,
            emissive: i,
            emissiveIntensity: 1.15,
            roughness: .2
          })]
        }, o)
      })
    })]
  })
}

function Ve({
  protons: s,
  neutrons: t,
  shellCounts: a
}) {
  const {
    positions: n,
    nucleusRadius: r
  } = Oe(s, t);
  return e.jsxs("group", {
    children: [n.map((i, h) => e.jsx(De, {
      position: i.pos,
      isProton: i.isProton
    }, h)), a.map((i, h) => e.jsx(Te, {
      radius: r + 1.7 + h * 1.3,
      count: i,
      index: h
    }, h))]
  })
}

function Be({
  protons: s,
  neutrons: t,
  shellCounts: a
}) {
  return e.jsx(F, {
    cameraDistance: 9 + a.length * 1.5,
    minDistance: 4,
    maxDistance: 42,
    children: e.jsx(Ve, {
      protons: s,
      neutrons: t,
      shellCounts: a
    })
  })
}
const He = {
    nonmetal: "#4fd8e0",
    "noble gas": "#c084fc",
    "alkali metal": "#ef5b6f",
    "alkaline earth metal": "#f2a94e",
    metalloid: "#6bd68a",
    halogen: "#5b8def",
    "transition metal": "#f2c14e",
    "post-transition metal": "#9ad1d4",
    lanthanide: "#e0a3ff",
    actinide: "#ff9e9e",
    unknown: "#8a8f98"
  },
  Fe = [
    ["H", "Hydrogen", 1, 1, "nonmetal"],
    ["He", "Helium", 2, 4, "noble gas"],
    ["Li", "Lithium", 3, 7, "alkali metal"],
    ["Be", "Beryllium", 4, 9, "alkaline earth metal"],
    ["B", "Boron", 5, 11, "metalloid"],
    ["C", "Carbon", 6, 12, "nonmetal"],
    ["N", "Nitrogen", 7, 14, "nonmetal"],
    ["O", "Oxygen", 8, 16, "nonmetal"],
    ["F", "Fluorine", 9, 19, "halogen"],
    ["Ne", "Neon", 10, 20, "noble gas"],
    ["Na", "Sodium", 11, 23, "alkali metal"],
    ["Mg", "Magnesium", 12, 24, "alkaline earth metal"],
    ["Al", "Aluminium", 13, 27, "metalloid"],
    ["Si", "Silicon", 14, 28, "metalloid"],
    ["P", "Phosphorus", 15, 31, "nonmetal"],
    ["S", "Sulfur", 16, 32, "nonmetal"],
    ["Cl", "Chlorine", 17, 35, "halogen"],
    ["Ar", "Argon", 18, 40, "noble gas"],
    ["K", "Potassium", 19, 39, "alkali metal"],
    ["Ca", "Calcium", 20, 40, "alkaline earth metal"],
    ["Sc", "Scandium", 21, 45, "transition metal"],
    ["Ti", "Titanium", 22, 48, "transition metal"],
    ["V", "Vanadium", 23, 51, "transition metal"],
    ["Cr", "Chromium", 24, 52, "transition metal"],
    ["Mn", "Manganese", 25, 55, "transition metal"],
    ["Fe", "Iron", 26, 56, "transition metal"],
    ["Co", "Cobalt", 27, 59, "transition metal"],
    ["Ni", "Nickel", 28, 59, "transition metal"],
    ["Cu", "Copper", 29, 64, "transition metal"],
    ["Zn", "Zinc", 30, 65, "transition metal"],
    ["Ga", "Gallium", 31, 70, "post-transition metal"],
    ["Ge", "Germanium", 32, 73, "metalloid"],
    ["As", "Arsenic", 33, 75, "metalloid"],
    ["Se", "Selenium", 34, 79, "nonmetal"],
    ["Br", "Bromine", 35, 80, "halogen"],
    ["Kr", "Krypton", 36, 84, "noble gas"],
    ["Rb", "Rubidium", 37, 85, "alkali metal"],
    ["Sr", "Strontium", 38, 88, "alkaline earth metal"],
    ["Y", "Yttrium", 39, 89, "transition metal"],
    ["Zr", "Zirconium", 40, 91, "transition metal"],
    ["Nb", "Niobium", 41, 93, "transition metal"],
    ["Mo", "Molybdenum", 42, 96, "transition metal"],
    ["Tc", "Technetium", 43, 98, "transition metal"],
    ["Ru", "Ruthenium", 44, 101, "transition metal"],
    ["Rh", "Rhodium", 45, 103, "transition metal"],
    ["Pd", "Palladium", 46, 106, "transition metal"],
    ["Ag", "Silver", 47, 108, "transition metal"],
    ["Cd", "Cadmium", 48, 112, "transition metal"],
    ["In", "Indium", 49, 115, "post-transition metal"],
    ["Sn", "Tin", 50, 119, "post-transition metal"],
    ["Sb", "Antimony", 51, 122, "metalloid"],
    ["Te", "Tellurium", 52, 128, "metalloid"],
    ["I", "Iodine", 53, 127, "halogen"],
    ["Xe", "Xenon", 54, 131, "noble gas"],
    ["Cs", "Caesium", 55, 133, "alkali metal"],
    ["Ba", "Barium", 56, 137, "alkaline earth metal"],
    ["La", "Lanthanum", 57, 139, "lanthanide"],
    ["Ce", "Cerium", 58, 140, "lanthanide"],
    ["Pr", "Praseodymium", 59, 141, "lanthanide"],
    ["Nd", "Neodymium", 60, 144, "lanthanide"],
    ["Pm", "Promethium", 61, 145, "lanthanide"],
    ["Sm", "Samarium", 62, 150, "lanthanide"],
    ["Eu", "Europium", 63, 152, "lanthanide"],
    ["Gd", "Gadolinium", 64, 157, "lanthanide"],
    ["Tb", "Terbium", 65, 159, "lanthanide"],
    ["Dy", "Dysprosium", 66, 163, "lanthanide"],
    ["Ho", "Holmium", 67, 165, "lanthanide"],
    ["Er", "Erbium", 68, 167, "lanthanide"],
    ["Tm", "Thulium", 69, 169, "lanthanide"],
    ["Yb", "Ytterbium", 70, 173, "lanthanide"],
    ["Lu", "Lutetium", 71, 175, "lanthanide"],
    ["Hf", "Hafnium", 72, 178, "transition metal"],
    ["Ta", "Tantalum", 73, 181, "transition metal"],
    ["W", "Tungsten", 74, 184, "transition metal"],
    ["Re", "Rhenium", 75, 186, "transition metal"],
    ["Os", "Osmium", 76, 190, "transition metal"],
    ["Ir", "Iridium", 77, 192, "transition metal"],
    ["Pt", "Platinum", 78, 195, "transition metal"],
    ["Au", "Gold", 79, 197, "transition metal"],
    ["Hg", "Mercury", 80, 201, "transition metal"],
    ["Tl", "Thallium", 81, 204, "post-transition metal"],
    ["Pb", "Lead", 82, 207, "post-transition metal"],
    ["Bi", "Bismuth", 83, 209, "post-transition metal"],
    ["Po", "Polonium", 84, 209, "post-transition metal"],
    ["At", "Astatine", 85, 210, "halogen"],
    ["Rn", "Radon", 86, 222, "noble gas"],
    ["Fr", "Francium", 87, 223, "alkali metal"],
    ["Ra", "Radium", 88, 226, "alkaline earth metal"],
    ["Ac", "Actinium", 89, 227, "actinide"],
    ["Th", "Thorium", 90, 232, "actinide"],
    ["Pa", "Protactinium", 91, 231, "actinide"],
    ["U", "Uranium", 92, 238, "actinide"],
    ["Np", "Neptunium", 93, 237, "actinide"],
    ["Pu", "Plutonium", 94, 244, "actinide"],
    ["Am", "Americium", 95, 243, "actinide"],
    ["Cm", "Curium", 96, 247, "actinide"],
    ["Bk", "Berkelium", 97, 247, "actinide"],
    ["Cf", "Californium", 98, 251, "actinide"],
    ["Es", "Einsteinium", 99, 252, "actinide"],
    ["Fm", "Fermium", 100, 257, "actinide"],
    ["Md", "Mendelevium", 101, 258, "actinide"],
    ["No", "Nobelium", 102, 259, "actinide"],
    ["Lr", "Lawrencium", 103, 262, "actinide"],
    ["Rf", "Rutherfordium", 104, 267, "transition metal"],
    ["Db", "Dubnium", 105, 268, "transition metal"],
    ["Sg", "Seaborgium", 106, 271, "transition metal"],
    ["Bh", "Bohrium", 107, 272, "transition metal"],
    ["Hs", "Hassium", 108, 270, "transition metal"],
    ["Mt", "Meitnerium", 109, 276, "unknown"],
    ["Ds", "Darmstadtium", 110, 281, "unknown"],
    ["Rg", "Roentgenium", 111, 280, "unknown"],
    ["Cn", "Copernicium", 112, 285, "transition metal"],
    ["Nh", "Nihonium", 113, 286, "post-transition metal"],
    ["Fl", "Flerovium", 114, 289, "post-transition metal"],
    ["Mc", "Moscovium", 115, 290, "post-transition metal"],
    ["Lv", "Livermorium", 116, 293, "post-transition metal"],
    ["Ts", "Tennessine", 117, 294, "halogen"],
    ["Og", "Oganesson", 118, 294, "noble gas"]
  ],
  z = Fe.map(([s, t, a, n, r]) => ({
    symbol: s,
    name: t,
    Z: a,
    A: n,
    neutrons: n - a,
    category: r
  }));
const CFG = {
  H: ["1s1"],
  He: ["1s2"],
  Li: ["1s2", "2s1"],
  Be: ["1s2", "2s2"],
  B: ["1s2", "2s2", "2p1"],
  C: ["1s2", "2s2", "2p2"],
  N: ["1s2", "2s2", "2p3"],
  O: ["1s2", "2s2", "2p4"],
  F: ["1s2", "2s2", "2p5"],
  Ne: ["1s2", "2s2", "2p6"],
  Na: ["1s2", "2s2", "2p6", "3s1"],
  Mg: ["1s2", "2s2", "2p6", "3s2"],
  Al: ["1s2", "2s2", "2p6", "3s2", "3p1"],
  Si: ["1s2", "2s2", "2p6", "3s2", "3p2"],
  P: ["1s2", "2s2", "2p6", "3s2", "3p3"],
  S: ["1s2", "2s2", "2p6", "3s2", "3p4"],
  Cl: ["1s2", "2s2", "2p6", "3s2", "3p5"],
  Ar: ["1s2", "2s2", "2p6", "3s2", "3p6"],
  K: ["1s2", "2s2", "2p6", "3s2", "3p6", "4s1"],
  Ca: ["1s2", "2s2", "2p6", "3s2", "3p6", "4s2"],
  Sc: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d1", "4s2"],
  Ti: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d2", "4s2"],
  V: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d3", "4s2"],
  Cr: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d5", "4s1"],
  Mn: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d5", "4s2"],
  Fe: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d6", "4s2"],
  Co: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d7", "4s2"],
  Ni: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d8", "4s2"],
  Cu: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s1"],
  Zn: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2"],
  Ga: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p1"],
  Ge: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p2"],
  As: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p3"],
  Se: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p4"],
  Br: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p5"],
  Kr: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6"],
  Rb: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "5s1"],
  Sr: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "5s2"],
  Y: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d1", "5s2"],
  Zr: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d2", "5s2"],
  Nb: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d4", "5s1"],
  Mo: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d5", "5s1"],
  Tc: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d5", "5s2"],
  Ru: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d7", "5s1"],
  Rh: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d8", "5s1"],
  Pd: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10"],
  Ag: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "5s1"],
  Cd: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "5s2"],
  In: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "5s2", "5p1"],
  Sn: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "5s2", "5p2"],
  Sb: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "5s2", "5p3"],
  Te: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "5s2", "5p4"],
  I: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "5s2", "5p5"],
  Xe: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "5s2", "5p6"],
  Cs: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "5s2", "5p6", "6s1"],
  Ba: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "5s2", "5p6", "6s2"],
  La: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "5s2", "5p6", "5d1", "6s2"],
  Ce: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f1", "5s2", "5p6", "5d1", "6s2"],
  Pr: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f3", "5s2", "5p6", "6s2"],
  Nd: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f4", "5s2", "5p6", "6s2"],
  Pm: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f5", "5s2", "5p6", "6s2"],
  Sm: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f6", "5s2", "5p6", "6s2"],
  Eu: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f7", "5s2", "5p6", "6s2"],
  Gd: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f7", "5s2", "5p6", "5d1", "6s2"],
  Tb: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f9", "5s2", "5p6", "6s2"],
  Dy: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f10", "5s2", "5p6", "6s2"],
  Ho: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f11", "5s2", "5p6", "6s2"],
  Er: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f12", "5s2", "5p6", "6s2"],
  Tm: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f13", "5s2", "5p6", "6s2"],
  Yb: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "6s2"],
  Lu: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d1", "6s2"],
  Hf: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d2", "6s2"],
  Ta: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d3", "6s2"],
  W: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d4", "6s2"],
  Re: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d5", "6s2"],
  Os: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d6", "6s2"],
  Ir: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d7", "6s2"],
  Pt: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d9", "6s1"],
  Au: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "6s1"],
  Hg: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "6s2"],
  Tl: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "6s2", "6p1"],
  Pb: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "6s2", "6p2"],
  Bi: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "6s2", "6p3"],
  Po: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "6s2", "6p4"],
  At: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "6s2", "6p5"],
  Rn: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "6s2", "6p6"],
  Fr: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "6s2", "6p6", "7s1"],
  Ra: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "6s2", "6p6", "7s2"],
  Ac: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "6s2", "6p6", "6d1", "7s2"],
  Th: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "6s2", "6p6", "6d2", "7s2"],
  Pa: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f2", "6s2", "6p6", "6d1", "7s2"],
  U: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f3", "6s2", "6p6", "6d1", "7s2"],
  Np: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f4", "6s2", "6p6", "6d1", "7s2"],
  Pu: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f6", "6s2", "6p6", "7s2"],
  Am: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f7", "6s2", "6p6", "7s2"],
  Cm: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f7", "6s2", "6p6", "6d1", "7s2"],
  Bk: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f9", "6s2", "6p6", "7s2"],
  Cf: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f10", "6s2", "6p6", "7s2"],
  Es: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f11", "6s2", "6p6", "7s2"],
  Fm: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f12", "6s2", "6p6", "7s2"],
  Md: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f13", "6s2", "6p6", "7s2"],
  No: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f14", "6s2", "6p6", "7s2"],
  Lr: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f14", "6s2", "6p6", "7s2", "7p1"],
  Rf: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f14", "6s2", "6p6", "6d2", "7s2"],
  Db: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f14", "6s2", "6p6", "6d3", "7s2"],
  Sg: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f14", "6s2", "6p6", "6d4", "7s2"],
  Bh: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f14", "6s2", "6p6", "6d5", "7s2"],
  Hs: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f14", "6s2", "6p6", "6d6", "7s2"],
  Mt: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f14", "6s2", "6p6", "6d7", "7s2"],
  Ds: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f14", "6s2", "6p6", "6d8", "7s2"],
  Rg: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f14", "6s2", "6p6", "6d9", "7s2"],
  Cn: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f14", "6s2", "6p6", "6d10", "7s2"],
  Nh: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f14", "6s2", "6p6", "6d10", "7s2", "7p1"],
  Fl: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f14", "6s2", "6p6", "6d10", "7s2", "7p2"],
  Mc: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f14", "6s2", "6p6", "6d10", "7s2", "7p3"],
  Lv: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f14", "6s2", "6p6", "6d10", "7s2", "7p4"],
  Ts: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f14", "6s2", "6p6", "6d10", "7s2", "7p5"],
  Og: ["1s2", "2s2", "2p6", "3s2", "3p6", "3d10", "4s2", "4p6", "4d10", "4f14", "5s2", "5p6", "5d10", "5f14", "6s2", "6p6", "6d10", "7s2", "7p6"]
};
const SUP = {
  0: "⁰",
  1: "¹",
  2: "²",
  3: "³",
  4: "⁴",
  5: "⁵",
  6: "⁶",
  7: "⁷",
  8: "⁸",
  9: "⁹"
};

function toSup(n) {
  return String(n).split("").map(d => SUP[d]).join("")
}

function parseSub(p) {
  const m = p.match(/^(\d)([spdf])(\d+)$/);
  return {
    n: +m[1],
    l: m[2],
    c: +m[3]
  }
}

function subConfig(sym) {
  return (CFG[sym] || []).map(parseSub)
}

function fmtConfig(sym) {
  return subConfig(sym).map(o => `${o.n}${o.l}${toSup(o.c)}`).join(" ")
}

function shellTotals(sym) {
  const t = {};
  let maxN = 0;
  for (const o of subConfig(sym)) {
    t[o.n] = (t[o.n] || 0) + o.c;
    if (o.n > maxN) maxN = o.n
  }
  const out = [];
  for (let n = 1; n <= maxN; n++) out.push(t[n] || 0);
  return out
}

function Ke(s) {
  return z.find(t => t.Z === s) || z[0]
}

function Ze(s) {
  const a = Ke(s);
  return shellTotals(a.symbol)
}

function Ge({
  selectedZ: s,
  onSelect: t
}) {
  return e.jsx("div", {
    className: "qp-element-grid",
    children: z.map(a => e.jsxs("button", {
      className: "qp-element-btn" + (a.Z === s ? " active" : ""),
      style: {
        "--accent": He[a.category]
      },
      onClick: () => t(a.Z),
      title: `${a.name} (Z=${a.Z})`,
      children: [e.jsx("span", {
        className: "num",
        children: a.Z
      }), e.jsx("span", {
        className: "sym",
        children: a.symbol
      })]
    }, a.Z))
  })
}

function p({
  label: s,
  value: t,
  accent: a
}) {
  return e.jsxs("div", {
    className: "qp-readout",
    children: [e.jsx("span", {
      className: "qp-readout-label",
      children: s
    }), e.jsx("span", {
      className: "qp-readout-value",
      style: a ? {
        color: a
      } : void 0,
      children: t
    })]
  })
}

function _e({
  element: s,
  shells: t,
  onRecord: a
}) {
  return e.jsxs("div", {
    className: "qp-card",
    children: [e.jsxs("h3", {
      children: [s.name, " ", e.jsxs("span", {
        className: "qp-muted",
        children: ["(", s.symbol, ")"]
      })]
    }), e.jsxs("div", {
      className: "qp-readout-grid",
      children: [e.jsx(p, {
        label: "Atomic number (Z)",
        value: s.Z
      }), e.jsx(p, {
        label: "Mass number (A)",
        value: s.A
      }), e.jsx(p, {
        label: "Protons",
        value: s.Z,
        accent: "#ef5b6f"
      }), e.jsx(p, {
        label: "Neutrons",
        value: s.neutrons,
        accent: "#5b8def"
      }), e.jsx(p, {
        label: "Electrons",
        value: s.Z,
        accent: "#4fd8e0"
      }), e.jsx(p, {
        label: "Category",
        value: s.category
      })]
    }), e.jsxs("div", {
      className: "qp-shellrow",
      children: [e.jsx("span", {
        className: "qp-muted small",
        children: "Shell configuration:"
      }), e.jsx("strong", {
        children: t.join(" – ")
      })]
    }), e.jsxs("div", {
      className: "qp-shellrow",
      children: [e.jsx("span", {
        className: "qp-muted small",
        children: "Electron configuration (s,p,d,f):"
      }), e.jsx("strong", {
        className: "qp-econfig",
        children: fmtConfig(s.symbol)
      })]
    }), e.jsx("button", {
      className: "qp-btn qp-btn-primary",
      onClick: a,
      style: {
        marginTop: 12
      },
      children: "Record observation"
    })]
  })
}

function We() {
  const {
    log: s
  } = N(), [t, a] = l.useState(6), n = Ke(t), r = l.useMemo(() => Ze(t), [t]);
  return e.jsxs("div", {
    className: "qp-lab-grid",
    children: [e.jsxs("div", {
      className: "qp-main-col",
      children: [e.jsxs("p", {
        className: "qp-instructions",
        children: [e.jsx(C, {
          size: 14
        }), " Drag the viewport to rotate the model, scroll to zoom, and pick an element to inspect its nucleus and electron shells (Bohr model, shells derived from the real ground-state s/p/d/f configuration)."]
      }), e.jsx(H, {
        label: `ATOM · ${n.symbol}-${n.A}`,
        children: e.jsx(Be, {
          protons: t,
          neutrons: n.neutrons,
          shellCounts: r
        })
      }), e.jsx(Ge, {
        selectedZ: t,
        onSelect: a
      })]
    }), e.jsx("div", {
      className: "qp-side-col",
      children: e.jsx(_e, {
        element: n,
        shells: r,
        onRecord: () => s("Atomic Structure", `${n.name} (Z=${n.Z})`, `Shells ${r.join("-")}, ${n.neutrons} neutrons, config ${fmtConfig(n.symbol)}`)
      })
    })]
  })
}
const Ue = 6,
  K = s => 1.6 + (s - 1) * 1.15;

function Ye() {
  return e.jsxs("mesh", {
    children: [e.jsx("sphereGeometry", {
      args: [.4, 20, 20]
    }), e.jsx("meshStandardMaterial", {
      color: "#ef5b6f",
      emissive: "#6b1620",
      emissiveIntensity: .7
    })]
  })
}

function Xe({
  ni: s,
  nf: t
}) {
  return e.jsx(e.Fragment, {
    children: Array.from({
      length: Ue
    }, (a, n) => n + 1).map(a => e.jsxs("mesh", {
      rotation: [Math.PI / 2, 0, 0],
      children: [e.jsx("torusGeometry", {
        args: [K(a), .008, 8, 96]
      }), e.jsx("meshBasicMaterial", {
        color: "#4fd8e0",
        transparent: !0,
        opacity: a === s || a === t ? .55 : .12
      })]
    }, a))
  })
}

function Qe({
  ni: s
}) {
  const t = K(s);
  return e.jsxs("mesh", {
    position: [t, 0, 0],
    children: [e.jsx("sphereGeometry", {
      args: [.19, 16, 16]
    }), e.jsx("meshStandardMaterial", {
      color: "#4fd8e0",
      emissive: "#4fd8e0",
      emissiveIntensity: 1.2
    })]
  })
}

function Je({
  ni: s,
  emission: t,
  color: a
}) {
  const n = l.useRef(),
    r = K(s),
    [i, h] = l.useState(1),
    o = l.useRef(0);
  return I((c, d) => {
    if (!n.current) return;
    const u = t ? 1 : -1;
    n.current.position.x += u * d * 4.5, o.current += Math.abs(u * d * 4.5), h(Math.max(0, 1 - o.current / 9))
  }), e.jsxs("mesh", {
    ref: n,
    position: [t ? r : r + 4, 0, 0],
    children: [e.jsx("sphereGeometry", {
      args: [.14, 12, 12]
    }), e.jsx("meshBasicMaterial", {
      color: a,
      transparent: !0,
      opacity: i
    }), e.jsx("pointLight", {
      color: a,
      intensity: 1.6,
      distance: 6
    })]
  })
}

function es({
  ni: s,
  nf: t,
  emitToken: a,
  color: n,
  emission: r
}) {
  return e.jsxs(F, {
    cameraDistance: 12,
    minDistance: 5,
    maxDistance: 26,
    autoRotateSpeed: .4,
    children: [e.jsx(Ye, {}), e.jsx(Xe, {
      ni: s,
      nf: t
    }), e.jsx(Qe, {
      ni: s
    }), a > 0 && e.jsx(Je, {
      ni: s,
      emission: r,
      color: n
    }, a)]
  })
}
const ss = [1, 2, 3, 4, 5, 6],
  w = s => 92 - (1 - 1 / (s * s)) / (1 - 1 / 36) * 82;

function ts({
  ni: s,
  nf: t,
  color: a
}) {
  return e.jsxs("svg", {
    viewBox: "0 0 300 110",
    className: "qp-level-svg",
    children: [ss.map(n => e.jsxs("g", {
      children: [e.jsx("line", {
        x1: "20",
        x2: "280",
        y1: w(n),
        y2: w(n),
        className: "qp-level-line" + (n === s || n === t ? " active" : "")
      }), e.jsx("text", {
        x: "6",
        y: w(n) + 3,
        className: "qp-level-text",
        children: n
      })]
    }, n)), e.jsx("line", {
      x1: "150",
      x2: "150",
      y1: w(s),
      y2: w(t),
      stroke: a,
      strokeWidth: "2",
      markerEnd: "url(#arrow)"
    }), e.jsx("defs", {
      children: e.jsx("marker", {
        id: "arrow",
        markerWidth: "8",
        markerHeight: "8",
        refX: "4",
        refY: "4",
        orient: "auto",
        children: e.jsx("path", {
          d: "M0,0 L8,4 L0,8 z",
          fill: a
        })
      })
    })]
  })
}

function _(s, z = 1) {
  return -13.605693 * z * z / (s * s)
}

function as(s) {
  return {
    1: "Lyman (UV)",
    2: "Balmer (visible)",
    3: "Paschen (IR)",
    4: "Brackett (IR)",
    5: "Pfund (IR)"
  } [s] || `n = ${s} series`
}

function ns(s, t, z = 1) {
  const a = Math.abs(_(s, z) - _(t, z)),
    n = s > t,
    r = S.hc_eVnm / a,
    i = S.c / (r * 1e-9);
  return {
    dE: a,
    wavelengthNm: r,
    frequencyHz: i,
    emission: n,
    series: as(Math.min(s, t)),
    visible: r >= 380 && r <= 780
  }
}

function rs() {
  const {
    log: s
  } = N(), [t, a] = l.useState(3), [n, r] = l.useState(2), [i, h] = l.useState(0), [g, k] = l.useState(1), o = l.useMemo(() => ns(t, n, g), [t, n, g]), c = o.visible ? Y(o.wavelengthNm) : "#5b6472", ge = Ke(g);
  return e.jsxs("div", {
    className: "qp-lab-grid",
    children: [e.jsxs("div", {
      className: "qp-main-col",
      children: [e.jsxs("p", {
        className: "qp-instructions",
        children: [e.jsx(C, {
          size: 14
        }), " Pick an element (its nuclear charge Z scales the Bohr formula Eₙ = −13.6·Z²/n² eV, exact for hydrogen-like one-electron ions), choose an initial level n", e.jsx("sub", {
          children: "i"
        }), " and final level n", e.jsx("sub", {
          children: "f"
        }), ", then trigger a transition to emit or absorb a photon."]
      }), e.jsx(H, {
        label: `${ge.symbol.toUpperCase()} · BOHR MODEL (Z=${g})`,
        children: e.jsx(es, {
          ni: t,
          nf: n,
          emitToken: i,
          color: c,
          emission: o.emission
        })
      }), e.jsxs("div", {
        className: "qp-card",
        children: [e.jsx("h4", {
          children: "Energy-level diagram"
        }), e.jsx(ts, {
          ni: t,
          nf: n,
          color: c
        })]
      }), e.jsxs("div", {
        className: "qp-card",
        children: [e.jsx("h4", {
          children: "Visible spectrum position"
        }), e.jsx("div", {
          className: "qp-spectrum-bar",
          children: o.visible && e.jsx("div", {
            className: "qp-spectrum-marker",
            style: {
              left: `${(o.wavelengthNm-380)/400*100}%`,
              background: c
            }
          })
        }), e.jsxs("div", {
          className: "qp-spectrum-labels",
          children: [e.jsx("span", {
            children: "380 nm (violet)"
          }), e.jsx("span", {
            children: "780 nm (red)"
          })]
        })]
      })]
    }), e.jsxs("div", {
      className: "qp-side-col",
      children: [e.jsxs("div", {
        className: "qp-card",
        children: [e.jsxs("div", {
          className: "qp-slider-row",
          children: [e.jsx("label", {
            children: "Element (Z)"
          }), e.jsxs("select", {
            className: "qp-select",
            value: g,
            onChange: d => k(Number(d.target.value)),
            children: z.map(d => e.jsx("option", {
              value: d.Z,
              children: `${d.Z} — ${d.name} (${d.symbol})`
            }, d.Z))
          })]
        }), e.jsxs("div", {
          className: "qp-slider-row",
          children: [e.jsxs("label", {
            children: ["Initial level n", e.jsx("sub", {
              children: "i"
            }), " = ", t]
          }), e.jsx("input", {
            type: "range",
            min: 1,
            max: 6,
            value: t,
            onChange: d => a(Number(d.target.value)),
            className: "qp-slider"
          })]
        }), e.jsxs("div", {
          className: "qp-slider-row",
          children: [e.jsxs("label", {
            children: ["Final level n", e.jsx("sub", {
              children: "f"
            }), " = ", n]
          }), e.jsx("input", {
            type: "range",
            min: 1,
            max: 6,
            value: n,
            onChange: d => r(Number(d.target.value)),
            className: "qp-slider"
          })]
        }), e.jsxs("button", {
          className: "qp-btn qp-btn-primary",
          disabled: t === n,
          onClick: () => h(d => d + 1),
          children: [e.jsx(Ee, {
            size: 14
          }), " ", o.emission ? "Emit photon" : "Absorb photon"]
        })]
      }), e.jsxs("div", {
        className: "qp-card",
        children: [e.jsx("h4", {
          children: "Results"
        }), e.jsxs("div", {
          className: "qp-readout-grid",
          children: [e.jsx(p, {
            label: "Element",
            value: `${ge.name} (Z=${g})`
          }), e.jsx(p, {
            label: "Transition",
            value: t === n ? "—" : `n=${t} → n=${n}`
          }), e.jsx(p, {
            label: "Series",
            value: o.series
          }), e.jsx(p, {
            label: "ΔE",
            value: `${f(o.dE)} eV`,
            accent: "#f2a94e"
          }), e.jsx(p, {
            label: "Wavelength (λ)",
            value: `${f(o.wavelengthNm)} nm`,
            accent: c
          }), e.jsx(p, {
            label: "Frequency",
            value: `${f(o.frequencyHz/1e14)}×10¹⁴ Hz`
          }), e.jsx(p, {
            label: "In visible range?",
            value: o.visible ? "Yes" : "No (UV/IR)"
          })]
        }), e.jsx("button", {
          className: "qp-btn",
          onClick: () => s("Hydrogen Spectrum", `${ge.symbol}: n=${t}→n=${n}`, `ΔE=${f(o.dE)} eV, λ=${f(o.wavelengthNm)} nm, ${o.series}`),
          children: "Record result"
        })]
      })]
    })]
  })
}

function is({
  photonE: s,
  intensity: t,
  freqTHz: a,
  emitting: n,
  KEmax: r,
  metalName: i
}) {
  const h = Y(S.hc_eVnm / s);
  return e.jsxs("div", {
    className: "qp-card qp-photo-stage",
    children: [e.jsxs("div", {
      className: "qp-photo-source",
      children: [e.jsx(ee, {
        size: 28,
        color: "#f2a94e"
      }), e.jsx("div", {
        className: "qp-photo-beam",
        style: {
          opacity: .35 + t / 100 * .65
        },
        children: Array.from({
          length: 5
        }).map((o, c) => e.jsx("span", {
          className: "qp-photon-line",
          style: {
            animationDelay: `${c*.15}s`,
            animationDuration: `${1.4-Math.min(a/20,.9)}s`,
            background: h
          }
        }, c))
      })]
    }), e.jsxs("div", {
      className: "qp-photo-plate",
      children: [e.jsxs("span", {
        className: "qp-plate-label",
        children: [i, " plate"]
      }), n && Array.from({
        length: Math.max(1, Math.round(t / 15))
      }).map((o, c) => e.jsx("span", {
        className: "qp-electron-pop",
        style: {
          left: `${10+c*14}%`,
          animationDelay: `${c*.1}s`,
          animationDuration: `${1.1-Math.min(r*.05,.6)}s`
        }
      }, c))]
    })]
  })
}
const A = {
    stroke: "#7c8a9c",
    fontSize: 10
  },
  ne = {
    background: "#0d131c",
    border: "1px solid #1f2b3a",
    fontSize: 12
  };

function ls({
  workFunctionEV: s,
  thresholdFreq: t
}) {
  const a = l.useMemo(() => {
    const n = [];
    for (let r = 3; r <= 13; r += .4) n.push({
      f: r.toFixed(1),
      KE: Math.max(0, S.hEV * r * 1e14 - s)
    });
    return n
  }, [s]);
  return e.jsxs("div", {
    className: "qp-card",
    children: [e.jsx("h4", {
      children: "Kinetic energy vs. frequency"
    }), e.jsx(O, {
      width: "100%",
      height: 200,
      children: e.jsxs(U, {
        data: a,
        children: [e.jsx(D, {
          stroke: "#1f2b3a"
        }), e.jsx(T, {
          dataKey: "f",
          tick: A,
          label: {
            value: "f (×10¹⁴ Hz)",
            position: "insideBottom",
            offset: -4,
            fill: "#7c8a9c",
            fontSize: 10
          },
          stroke: "#7c8a9c"
        }), e.jsx(V, {
          tick: A,
          label: {
            value: "KEmax (eV)",
            angle: -90,
            position: "insideLeft",
            fill: "#7c8a9c",
            fontSize: 10
          },
          stroke: "#7c8a9c"
        }), e.jsx(B, {
          contentStyle: ne
        }), e.jsx(me, {
          x: t.toFixed(1),
          stroke: "#ef5b6f",
          strokeDasharray: "4 4",
          label: {
            value: "f₀",
            fill: "#ef5b6f",
            fontSize: 10
          }
        }), e.jsx($, {
          type: "monotone",
          dataKey: "KE",
          stroke: "#4fd8e0",
          dot: !1,
          strokeWidth: 2
        })]
      })
    })]
  })
}

function os({
  stoppingV: s,
  intensity: t
}) {
  const a = l.useMemo(() => {
    const n = [];
    for (let r = -s - 1; r <= 4; r += .4) {
      const i = r <= -s ? 0 : Math.min(1, (r + s) / (s + 2)) * (t / 100);
      n.push({
        v: r.toFixed(1),
        I: Number(i.toFixed(3))
      })
    }
    return n
  }, [s, t]);
  return e.jsxs("div", {
    className: "qp-card",
    children: [e.jsx("h4", {
      children: "Photocurrent vs. retarding voltage (idealized)"
    }), e.jsx(O, {
      width: "100%",
      height: 180,
      children: e.jsxs(ue, {
        data: a,
        children: [e.jsx(D, {
          stroke: "#1f2b3a"
        }), e.jsx(T, {
          dataKey: "v",
          tick: A,
          label: {
            value: "V (volts)",
            position: "insideBottom",
            offset: -4,
            fill: "#7c8a9c",
            fontSize: 10
          },
          stroke: "#7c8a9c"
        }), e.jsx(V, {
          tick: A,
          stroke: "#7c8a9c"
        }), e.jsx(B, {
          contentStyle: ne
        }), e.jsx(pe, {
          type: "monotone",
          dataKey: "I",
          stroke: "#f2a94e",
          fill: "#f2a94e33",
          strokeWidth: 2
        })]
      })
    })]
  })
}
const W = [{
  name: "Cesium",
  symbol: "Cs",
  phi: 2.14
}, {
  name: "Sodium",
  symbol: "Na",
  phi: 2.28
}, {
  name: "Potassium",
  symbol: "K",
  phi: 2.3
}, {
  name: "Calcium",
  symbol: "Ca",
  phi: 2.87
}, {
  name: "Zinc",
  symbol: "Zn",
  phi: 4.33
}, {
  name: "Copper",
  symbol: "Cu",
  phi: 4.7
}, {
  name: "Silver",
  symbol: "Ag",
  phi: 4.73
}, {
  name: "Platinum",
  symbol: "Pt",
  phi: 6.35
}];

function cs(s) {
  return S.hEV * s
}

function ds(s, t) {
  const a = cs(s),
    n = Math.max(0, a - t),
    r = n,
    i = t / S.hEV;
  return {
    photonE: a,
    KEmax: n,
    stoppingVoltage: r,
    thresholdFrequency: i,
    emitting: a > t
  }
}

function hs() {
  const {
    log: s
  } = N(), [t, a] = l.useState(5), [n, r] = l.useState(8.5), [i, h] = l.useState(60), o = W[t], c = ds(n * 1e14, o.phi);
  return e.jsxs("div", {
    className: "qp-lab-grid",
    children: [e.jsxs("div", {
      className: "qp-main-col",
      children: [e.jsxs("p", {
        className: "qp-instructions",
        children: [e.jsx(C, {
          size: 14
        }), " Intensity changes how many photons per second arrive (more electrons), but only frequency changes each photon’s energy — that’s the key photoelectric insight."]
      }), e.jsx(is, {
        photonE: c.photonE,
        intensity: i,
        freqTHz: n,
        emitting: c.emitting,
        KEmax: c.KEmax,
        metalName: o.name
      }), e.jsx(ls, {
        workFunctionEV: o.phi,
        thresholdFreq: c.thresholdFrequency / 1e14
      }), e.jsx(os, {
        stoppingV: c.stoppingVoltage,
        intensity: i
      })]
    }), e.jsxs("div", {
      className: "qp-side-col",
      children: [e.jsxs("div", {
        className: "qp-card",
        children: [e.jsx("h4", {
          children: "Metal surface"
        }), e.jsx("div", {
          className: "qp-chip-row",
          children: W.map((d, u) => e.jsx("button", {
            className: "qp-chip" + (u === t ? " active" : ""),
            onClick: () => a(u),
            children: d.symbol
          }, d.symbol))
        }), e.jsxs("div", {
          className: "qp-slider-row",
          children: [e.jsxs("label", {
            children: ["Frequency = ", n.toFixed(1), "×10¹⁴ Hz"]
          }), e.jsx("input", {
            type: "range",
            min: 3,
            max: 13,
            step: .1,
            value: n,
            onChange: d => r(Number(d.target.value)),
            className: "qp-slider"
          })]
        }), e.jsxs("div", {
          className: "qp-slider-row",
          children: [e.jsxs("label", {
            children: ["Intensity = ", i, "%"]
          }), e.jsx("input", {
            type: "range",
            min: 0,
            max: 100,
            value: i,
            onChange: d => h(Number(d.target.value)),
            className: "qp-slider"
          })]
        })]
      }), e.jsxs("div", {
        className: "qp-card",
        children: [e.jsx("h4", {
          children: "Results"
        }), e.jsxs("div", {
          className: "qp-readout-grid",
          children: [e.jsx(p, {
            label: "Work function φ",
            value: `${o.phi} eV`
          }), e.jsx(p, {
            label: "Photon energy E=hf",
            value: `${f(c.photonE)} eV`,
            accent: "#f2a94e"
          }), e.jsx(p, {
            label: "Threshold frequency f₀",
            value: `${f(c.thresholdFrequency/1e14)}×10¹⁴ Hz`
          }), e.jsx(p, {
            label: "Max kinetic energy",
            value: `${f(c.KEmax)} eV`,
            accent: "#4fd8e0"
          }), e.jsx(p, {
            label: "Stopping potential Vs",
            value: `${f(c.stoppingVoltage)} V`
          }), e.jsx(p, {
            label: "Emission occurring?",
            value: c.emitting ? "Yes" : "No — below threshold"
          })]
        }), e.jsx("button", {
          className: "qp-btn",
          onClick: () => s("Photoelectric Effect", `${o.name}, f=${n.toFixed(1)}e14 Hz`, `KEmax=${f(c.KEmax)} eV, Vs=${f(c.stoppingVoltage)} V`),
          children: "Record result"
        })]
      })]
    })]
  })
}

function ms({
  aliveArray: s
}) {
  return e.jsx("div", {
    className: "qp-card",
    children: e.jsx("div", {
      className: "qp-atom-grid",
      children: s.map((t, a) => e.jsx("span", {
        className: "qp-atom-dot" + (t ? "" : " decayed")
      }, a))
    })
  })
}

function us({
  data: s
}) {
  return e.jsxs("div", {
    className: "qp-card",
    children: [e.jsx("h4", {
      children: "Population over time"
    }), e.jsx(O, {
      width: "100%",
      height: 220,
      children: e.jsxs(U, {
        data: s,
        children: [e.jsx(D, {
          stroke: "#1f2b3a"
        }), e.jsx(T, {
          dataKey: "t",
          stroke: "#7c8a9c",
          tick: {
            fontSize: 10
          },
          label: {
            value: "sim time",
            position: "insideBottom",
            offset: -4,
            fill: "#7c8a9c",
            fontSize: 10
          }
        }), e.jsx(V, {
          stroke: "#7c8a9c",
          tick: {
            fontSize: 10
          }
        }), e.jsx(B, {
          contentStyle: {
            background: "#0d131c",
            border: "1px solid #1f2b3a",
            fontSize: 12
          }
        }), e.jsx(xe, {
          wrapperStyle: {
            fontSize: 11
          }
        }), e.jsx($, {
          type: "stepAfter",
          dataKey: "N",
          name: "Simulated N(t)",
          stroke: "#4fd8e0",
          dot: !1,
          strokeWidth: 2
        }), e.jsx($, {
          type: "monotone",
          dataKey: "theory",
          name: "Theoretical N₀e^(−λt)",
          stroke: "#f2a94e",
          dot: !1,
          strokeDasharray: "4 3",
          strokeWidth: 1.5
        })]
      })
    })]
  })
}
const E = [{symbol:"H",z:1,name:"Tritium (H-3)",real:"12.32 years",simHalfLife:20.6},{symbol:"He",z:2,name:"Helium-6",real:"0.807 s",simHalfLife:3},{symbol:"Li",z:3,name:"Lithium-8",real:"0.838 s",simHalfLife:3},{symbol:"Be",z:4,name:"Beryllium-7",real:"53.22 days",simHalfLife:14.0},{symbol:"B",z:5,name:"Boron-12",real:"0.0202 s",simHalfLife:3},{symbol:"C",z:6,name:"Carbon-14",real:"5,730 years",simHalfLife:29.8},{symbol:"N",z:7,name:"Nitrogen-13",real:"9.97 min",simHalfLife:3},{symbol:"O",z:8,name:"Oxygen-15",real:"122.2 s",simHalfLife:3},{symbol:"F",z:9,name:"Fluorine-18",real:"109.77 min",simHalfLife:4.2},{symbol:"Ne",z:10,name:"Neon-24",real:"3.38 min",simHalfLife:3},{symbol:"Na",z:11,name:"Sodium-22",real:"2.6019 years",simHalfLife:18.3},{symbol:"Mg",z:12,name:"Magnesium-28",real:"20.92 hours",simHalfLife:7.8},{symbol:"Al",z:13,name:"Aluminium-26",real:"717,000 years",simHalfLife:37.1},{symbol:"Si",z:14,name:"Silicon-32",real:"153 years",simHalfLife:24.4},{symbol:"P",z:15,name:"Phosphorus-32",real:"14.268 days",simHalfLife:12.0},{symbol:"S",z:16,name:"Sulfur-35",real:"87.37 days",simHalfLife:14.7},{symbol:"Cl",z:17,name:"Chlorine-36",real:"301,000 years",simHalfLife:35.8},{symbol:"Ar",z:18,name:"Argon-39",real:"269 years",simHalfLife:25.3},{symbol:"K",z:19,name:"Potassium-40",real:"1.248 billion years",simHalfLife:48.3},{symbol:"Ca",z:20,name:"Calcium-45",real:"162.6 days",simHalfLife:15.7},{symbol:"Sc",z:21,name:"Scandium-46",real:"83.79 days",simHalfLife:14.7},{symbol:"Ti",z:22,name:"Titanium-44",real:"59.1 years",simHalfLife:23.0},{symbol:"V",z:23,name:"Vanadium-49",real:"330 days",simHalfLife:16.7},{symbol:"Cr",z:24,name:"Chromium-51",real:"27.7 days",simHalfLife:13.0},{symbol:"Mn",z:25,name:"Manganese-54",real:"312.2 days",simHalfLife:16.6},{symbol:"Fe",z:26,name:"Iron-55",real:"2.744 years",simHalfLife:18.4},{symbol:"Co",z:27,name:"Cobalt-60",real:"5.27 years",simHalfLife:19.4},{symbol:"Ni",z:28,name:"Nickel-63",real:"100.1 years",simHalfLife:23.8},{symbol:"Cu",z:29,name:"Copper-64",real:"12.7 hours",simHalfLife:7.1},{symbol:"Zn",z:30,name:"Zinc-65",real:"243.9 days",simHalfLife:16.3},{symbol:"Ga",z:31,name:"Gallium-67",real:"3.26 days",simHalfLife:9.8},{symbol:"Ge",z:32,name:"Germanium-68",real:"270.8 days",simHalfLife:16.4},{symbol:"As",z:33,name:"Arsenic-74",real:"17.77 days",simHalfLife:12.3},{symbol:"Se",z:34,name:"Selenium-75",real:"119.8 days",simHalfLife:15.2},{symbol:"Br",z:35,name:"Bromine-82",real:"35.3 hours",simHalfLife:8.6},{symbol:"Kr",z:36,name:"Krypton-85",real:"10.76 years",simHalfLife:20.4},{symbol:"Rb",z:37,name:"Rubidium-87",real:"49.2 billion years",simHalfLife:50},{symbol:"Sr",z:38,name:"Strontium-90",real:"28.8 years",simHalfLife:21.9},{symbol:"Y",z:39,name:"Yttrium-90",real:"64 hours",simHalfLife:9.5},{symbol:"Zr",z:40,name:"Zirconium-93",real:"1.53 million years",simHalfLife:38.2},{symbol:"Nb",z:41,name:"Niobium-94",real:"20,300 years",simHalfLife:31.7},{symbol:"Mo",z:42,name:"Molybdenum-99",real:"65.94 hours",simHalfLife:9.5},{symbol:"Tc",z:43,name:"Technetium-99m",real:"6.01 hours",simHalfLife:6.0},{symbol:"Ru",z:44,name:"Ruthenium-106",real:"373.6 days",simHalfLife:16.9},{symbol:"Rh",z:45,name:"Rhodium-105",real:"35.36 hours",simHalfLife:8.6},{symbol:"Pd",z:46,name:"Palladium-107",real:"6.5 million years",simHalfLife:40.4},{symbol:"Ag",z:47,name:"Silver-110m",real:"249.9 days",simHalfLife:16.3},{symbol:"Cd",z:48,name:"Cadmium-109",real:"461.4 days",simHalfLife:17.2},{symbol:"In",z:49,name:"Indium-111",real:"2.8047 days",simHalfLife:9.6},{symbol:"Sn",z:50,name:"Tin-121m",real:"55 years",simHalfLife:22.9},{symbol:"Sb",z:51,name:"Antimony-125",real:"2.7582 years",simHalfLife:18.4},{symbol:"Te",z:52,name:"Tellurium-127m",real:"109 days",simHalfLife:15.1},{symbol:"I",z:53,name:"Iodine-131",real:"8.02 days",simHalfLife:11.2},{symbol:"Xe",z:54,name:"Xenon-133",real:"5.243 days",simHalfLife:10.5},{symbol:"Cs",z:55,name:"Caesium-137",real:"30.17 years",simHalfLife:22.0},{symbol:"Ba",z:56,name:"Barium-133",real:"10.51 years",simHalfLife:20.4},{symbol:"La",z:57,name:"Lanthanum-137",real:"60,000 years",simHalfLife:33.4},{symbol:"Ce",z:58,name:"Cerium-144",real:"284.6 days",simHalfLife:16.5},{symbol:"Pr",z:59,name:"Praseodymium-143",real:"13.57 days",simHalfLife:11.9},{symbol:"Nd",z:60,name:"Neodymium-147",real:"10.98 days",simHalfLife:11.6},{symbol:"Pm",z:61,name:"Promethium-147",real:"2.6234 years",simHalfLife:18.3},{symbol:"Sm",z:62,name:"Samarium-151",real:"90 years",simHalfLife:23.6},{symbol:"Eu",z:63,name:"Europium-152",real:"13.517 years",simHalfLife:20.8},{symbol:"Gd",z:64,name:"Gadolinium-153",real:"240.4 days",simHalfLife:16.2},{symbol:"Tb",z:65,name:"Terbium-160",real:"72.3 days",simHalfLife:14.4},{symbol:"Dy",z:66,name:"Dysprosium-159",real:"144.4 days",simHalfLife:15.5},{symbol:"Ho",z:67,name:"Holmium-166",real:"26.83 hours",simHalfLife:8.2},{symbol:"Er",z:68,name:"Erbium-169",real:"9.4 days",simHalfLife:11.4},{symbol:"Tm",z:69,name:"Thulium-171",real:"1.92 years",simHalfLife:17.8},{symbol:"Yb",z:70,name:"Ytterbium-169",real:"32.02 days",simHalfLife:13.2},{symbol:"Lu",z:71,name:"Lutetium-177",real:"6.647 days",simHalfLife:10.9},{symbol:"Hf",z:72,name:"Hafnium-182",real:"8.9 million years",simHalfLife:40.8},{symbol:"Ta",z:73,name:"Tantalum-182",real:"114.43 days",simHalfLife:15.1},{symbol:"W",z:74,name:"Tungsten-185",real:"75.1 days",simHalfLife:14.5},{symbol:"Re",z:75,name:"Rhenium-187",real:"41.2 billion years",simHalfLife:50},{symbol:"Os",z:76,name:"Osmium-185",real:"93.6 days",simHalfLife:14.8},{symbol:"Ir",z:77,name:"Iridium-192",real:"73.83 days",simHalfLife:14.5},{symbol:"Pt",z:78,name:"Platinum-193",real:"50 years",simHalfLife:22.7},{symbol:"Au",z:79,name:"Gold-198",real:"2.6947 days",simHalfLife:9.5},{symbol:"Hg",z:80,name:"Mercury-203",real:"46.612 days",simHalfLife:13.8},{symbol:"Tl",z:81,name:"Thallium-204",real:"3.78 years",simHalfLife:18.9},{symbol:"Pb",z:82,name:"Lead-210",real:"22.3 years",simHalfLife:21.5},{symbol:"Bi",z:83,name:"Bismuth-210",real:"5.012 days",simHalfLife:10.4},{symbol:"Po",z:84,name:"Polonium-210",real:"138.4 days",simHalfLife:15.4},{symbol:"At",z:85,name:"Astatine-211",real:"7.214 hours",simHalfLife:6.2},{symbol:"Rn",z:86,name:"Radon-222",real:"3.82 days",simHalfLife:10.0},{symbol:"Fr",z:87,name:"Francium-223",real:"22.00 min",simHalfLife:3},{symbol:"Ra",z:88,name:"Radium-226",real:"1,600 years",simHalfLife:27.9},{symbol:"Ac",z:89,name:"Actinium-227",real:"21.772 years",simHalfLife:21.5},{symbol:"Th",z:90,name:"Thorium-232",real:"14.05 billion years",simHalfLife:50},{symbol:"Pa",z:91,name:"Protactinium-231",real:"32,760 years",simHalfLife:32.4},{symbol:"U",z:92,name:"Uranium-238",real:"4.468 billion years",simHalfLife:50},{symbol:"Np",z:93,name:"Neptunium-237",real:"2.144 million years",simHalfLife:38.7},{symbol:"Pu",z:94,name:"Plutonium-239",real:"24,110 years",simHalfLife:32.0},{symbol:"Am",z:95,name:"Americium-241",real:"432.2 years",simHalfLife:26.0},{symbol:"Cm",z:96,name:"Curium-244",real:"18.1 years",simHalfLife:21.2},{symbol:"Bk",z:97,name:"Berkelium-247",real:"1,380 years",simHalfLife:27.7},{symbol:"Cf",z:98,name:"Californium-251",real:"898 years",simHalfLife:27.1},{symbol:"Es",z:99,name:"Einsteinium-252",real:"471.7 days",simHalfLife:17.3},{symbol:"Fm",z:100,name:"Fermium-257",real:"100.5 days",simHalfLife:14.9},{symbol:"Md",z:101,name:"Mendelevium-258",real:"51.5 days",simHalfLife:13.9},{symbol:"No",z:102,name:"Nobelium-259",real:"58 min",simHalfLife:3.2},{symbol:"Lr",z:103,name:"Lawrencium-266",real:"11 hours",simHalfLife:6.9},{symbol:"Rf",z:104,name:"Rutherfordium-267",real:"1.3 hours",simHalfLife:3.7},{symbol:"Db",z:105,name:"Dubnium-268",real:"16 hours",simHalfLife:7.4},{symbol:"Sg",z:106,name:"Seaborgium-271",real:"2.4 min",simHalfLife:3},{symbol:"Bh",z:107,name:"Bohrium-270",real:"61 s",simHalfLife:3},{symbol:"Hs",z:108,name:"Hassium-269",real:"16 s",simHalfLife:3},{symbol:"Mt",z:109,name:"Meitnerium-278",real:"8 s",simHalfLife:3},{symbol:"Ds",z:110,name:"Darmstadtium-281",real:"12.7 s",simHalfLife:3},{symbol:"Rg",z:111,name:"Roentgenium-282",real:"130 s",simHalfLife:3},{symbol:"Cn",z:112,name:"Copernicium-285",real:"29 s",simHalfLife:3},{symbol:"Nh",z:113,name:"Nihonium-286",real:"20 s",simHalfLife:3},{symbol:"Fl",z:114,name:"Flerovium-289",real:"1.9 s",simHalfLife:3},{symbol:"Mc",z:115,name:"Moscovium-290",real:"0.65 s",simHalfLife:3},{symbol:"Lv",z:116,name:"Livermorium-293",real:"0.061 s",simHalfLife:3},{symbol:"Ts",z:117,name:"Tennessine-294",real:"0.08 s",simHalfLife:3},{symbol:"Og",z:118,name:"Oganesson-294",real:"0.00089 s",simHalfLife:3}];

function Z(s) {
  return Math.LN2 / s
}

function ps(s, t, a) {
  return s * Math.exp(-Z(t) * a)
}

function xs(s, t) {
  return 1 - Math.exp(-Z(s) * t)
}

function fs(s, t, a) {
  const n = xs(t, a);
  let r = 0;
  for (let i = 0; i < s.length; i++) s[i] && Math.random() < n && (s[i] = !1), s[i] && r++;
  return r
}
const js = .15;

function ys({
  atomCount: s,
  halfLife: t,
  speed: a,
  resetToken: n
}) {
  const r = l.useRef(new Array(s).fill(!0)),
    i = l.useRef(0),
    [h, o] = l.useState(() => new Array(s).fill(!0)),
    [c, d] = l.useState([{
      t: 0,
      N: s,
      theory: s
    }]),
    [u, x] = l.useState(!1);
  l.useEffect(() => {
    r.current = new Array(s).fill(!0), o(new Array(s).fill(!0)), d([{
      t: 0,
      N: s,
      theory: s
    }]), i.current = 0, x(!1)
  }, [s, n]), l.useEffect(() => {
    if (!u) return;
    const y = setInterval(() => {
      const g = js * a;
      i.current += g;
      const j = fs(r.current, t, g);
      o(r.current.slice()), d(M => {
        const P = ps(s, t, i.current),
          k = [...M, {
            t: Number(i.current.toFixed(2)),
            N: j,
            theory: Number(P.toFixed(1))
          }];
        return k.length > 200 ? k.slice(k.length - 200) : k
      }), j === 0 && x(!1)
    }, 150);
    return () => clearInterval(y)
  }, [u, t, a, s]);
  const v = h.filter(Boolean).length,
    m = Z(t);
  return {
    aliveView: h,
    chartData: c,
    playing: u,
    setPlaying: x,
    currentN: v,
    lambda: m,
    elapsed: i.current
  }
}

function vs() {
  const {
    log: s
  } = N(), [t, a] = l.useState(5), [n, r] = l.useState(E[5].simHalfLife), [i, h] = l.useState(100), [o, c] = l.useState(1), [d, u] = l.useState(0), x = ys({
    atomCount: i,
    halfLife: n,
    speed: o,
    resetToken: d
  }), v = x.elapsed / n;
  return e.jsxs("div", {
    className: "qp-lab-grid",
    children: [e.jsxs("div", {
      className: "qp-main-col",
      children: [e.jsxs("p", {
        className: "qp-instructions",
        children: [e.jsx(C, {
          size: 14
        }), " Each dot represents an atom; it independently decays with a probability set by the half-life. Simulation time is compressed to fit real half-lives (from seconds to millennia) into a watchable demo."]
      }), e.jsx(ms, {
        aliveArray: x.aliveView
      }), e.jsx(us, {
        data: x.chartData
      })]
    }), e.jsxs("div", {
      className: "qp-side-col",
      children: [e.jsxs("div", {
        className: "qp-card",
        children: [e.jsx("h4", {
          children: "Isotope"
        }), e.jsx("select", {
          className: "qp-select",
          value: t,
          onChange: m => {
            const y = Number(m.target.value);
            a(y), r(E[y].simHalfLife), u(g => g + 1)
          },
          children: E.map((m, y) => e.jsxs("option", {
            value: y,
            children: [m.name, " (T½ = ", m.real, ")"]
          }, m.name))
        }), e.jsxs("div", {
          className: "qp-slider-row",
          children: [e.jsxs("label", {
            children: ["Simulated half-life = ", n, "s"]
          }), e.jsx("input", {
            type: "range",
            min: 3,
            max: 50,
            value: n,
            onChange: m => r(Number(m.target.value)),
            className: "qp-slider"
          })]
        }), e.jsxs("div", {
          className: "qp-slider-row",
          children: [e.jsxs("label", {
            children: ["Atom count = ", i]
          }), e.jsx("input", {
            type: "range",
            min: 20,
            max: 150,
            step: 10,
            value: i,
            onChange: m => h(Number(m.target.value)),
            className: "qp-slider"
          })]
        }), e.jsxs("div", {
          className: "qp-slider-row",
          children: [e.jsxs("label", {
            children: ["Speed = ", o, "×"]
          }), e.jsx("input", {
            type: "range",
            min: 1,
            max: 5,
            value: o,
            onChange: m => c(Number(m.target.value)),
            className: "qp-slider"
          })]
        }), e.jsxs("div", {
          className: "qp-btn-row",
          children: [e.jsxs("button", {
            className: "qp-btn qp-btn-primary",
            onClick: () => x.setPlaying(m => !m),
            children: [x.playing ? e.jsx(se, {
              size: 14
            }) : e.jsx(te, {
              size: 14
            }), " ", x.playing ? "Pause" : "Start"]
          }), e.jsxs("button", {
            className: "qp-btn",
            onClick: () => u(m => m + 1),
            children: [e.jsx(ae, {
              size: 14
            }), " Reset"]
          })]
        })]
      }), e.jsxs("div", {
        className: "qp-card",
        children: [e.jsx("h4", {
          children: "Results"
        }), e.jsxs("div", {
          className: "qp-readout-grid",
          children: [e.jsx(p, {
            label: "Remaining atoms",
            value: `${x.currentN} / ${i}`,
            accent: "#4fd8e0"
          }), e.jsx(p, {
            label: "Decay constant λ",
            value: `${f(x.lambda)} /s`
          }), e.jsx(p, {
            label: "Mean lifetime τ = 1/λ",
            value: `${f(1/x.lambda)} s`
          }), e.jsx(p, {
            label: "Half-lives elapsed",
            value: f(v, 2)
          }), e.jsx(p, {
            label: "Elapsed sim time",
            value: `${f(x.elapsed,1)} s`
          })]
        }), e.jsx("button", {
          className: "qp-btn",
          onClick: () => s("Radioactive Decay", E[t].name, `${x.currentN}/${i} remaining after ${f(x.elapsed,1)}s (${f(v,2)} half-lives)`),
          children: "Record result"
        })]
      })]
    })]
  })
}

function bs(s, t) {
  ["x", "y", "z"].forEach(a => {
    s.pos[a] > t - s.radius && (s.pos[a] = t - s.radius, s.vel[a] *= -1), s.pos[a] < -t + s.radius && (s.pos[a] = -t + s.radius, s.vel[a] *= -1)
  })
}

function gs(s, t) {
  const a = new q().subVectors(s.pos, t.pos),
    n = a.length(),
    r = s.radius + t.radius;
  if (n >= r || n <= 1e-4) return !1;
  const i = a.clone().normalize(),
    h = (r - n) / 2;
  s.pos.addScaledVector(i, h), t.pos.addScaledVector(i, -h);
  const c = new q().subVectors(s.vel, t.vel).dot(i);
  if (c >= 0) return !1;
  const d = 2 * t.mass / (s.mass + t.mass) * c,
    u = 2 * s.mass / (s.mass + t.mass) * c;
  return s.vel.addScaledVector(i, -d), t.vel.addScaledVector(i, u), !0
}

function Ns(s) {
  return s.reduce((t, a) => t.addScaledVector(a.vel, a.mass), new q).length()
}

function ks(s) {
  return s.reduce((t, a) => t + .5 * a.mass * a.vel.lengthSq(), 0)
}
const R = 5;

function qs() {
  const s = l.useMemo(() => new oe(new ce(R * 2, R * 2, R * 2)), []);
  return e.jsx("lineSegments", {
    geometry: s,
    children: e.jsx("lineBasicMaterial", {
      color: "#2a3a4d"
    })
  })
}

function Ss({
  balls: s,
  resetToken: t,
  playing: a,
  onStats: n
}) {
  const r = l.useRef([]),
    i = l.useRef(a);
  l.useEffect(() => {
    i.current = a
  }, [a]);
  const h = l.useRef(null),
    o = JSON.stringify(s.map(k => [k.mass, k.speed]));
  l.useEffect(() => {
    const k = s.length,
      b = Math.PI * (3 - Math.sqrt(5)),
      L = s.map((A, W) => {
        const X = .32 + Math.cbrt(A.mass) * .22,
          Y2 = W * b,
          Q = R * .55,
          pos = new q(Math.cos(Y2) * Q, (W % 3 - 1) * .7, Math.sin(Y2) * Q),
          dir = new q(-pos.x, 0, -pos.z);
        dir.lengthSq() < 1e-6 && dir.set(1, 0, 0), dir.normalize();
        const vel = dir.multiplyScalar(A.speed);
        return {
          pos,
          vel,
          mass: A.mass,
          radius: X
        }
      });
    h.current = {
      particles: L,
      collisions: 0
    }, r.current = r.current.slice(0, k)
  }, [t, o]), I((k, b) => {
    const L = h.current;
    if (!L || !i.current) return;
    const A = Math.min(b, .05),
      W = L.particles;
    W.forEach(X => {
      X.pos.addScaledVector(X.vel, A), bs(X, R)
    });
    for (let X = 0; X < W.length; X++)
      for (let Y2 = X + 1; Y2 < W.length; Y2++) gs(W[X], W[Y2]) && (L.collisions += 1);
    W.forEach((X, Y2) => {
      const Q = r.current[Y2];
      Q && Q.position.copy(X.pos)
    })
  }), l.useEffect(() => {
    const k = setInterval(() => {
      const b = h.current;
      b && n({
        momentum: Ns(b.particles),
        ke: ks(b.particles),
        collisions: b.collisions,
        speeds: b.particles.map(L => L.vel.length())
      })
    }, 200);
    return () => clearInterval(k)
  }, [n]), e.jsx(e.Fragment, {
    children: s.map((k, b) => e.jsx("mesh", {
      ref: L => {
        r.current[b] = L
      },
      children: [e.jsx("sphereGeometry", {
        args: [.32 + Math.cbrt(k.mass) * .22, 20, 20]
      }), e.jsx("meshStandardMaterial", {
        color: k.color,
        emissive: k.color,
        emissiveIntensity: .5,
        roughness: .3
      })]
    }, b))
  })
}

function Ms(s) {
  return e.jsxs(F, {
    cameraDistance: 14,
    minDistance: 6,
    maxDistance: 30,
    autoRotateSpeed: .5,
    children: [e.jsx(qs, {}), e.jsx(Ss, {
      ...s
    })]
  })
}

function ws() {
  const {
    log: s
  } = N(), [t, a] = l.useState([{
    mass: 1.5,
    speed: 2.2
  }, {
    mass: 3,
    speed: 1.4
  }, {
    mass: 2,
    speed: 1.8
  }]), [d, u] = l.useState(!0), [x, v] = l.useState(0), [m, y] = l.useState({
    momentum: 0,
    ke: 0,
    collisions: 0,
    speeds: []
  }), g = l.useCallback(j => y(j), []), P = l.useMemo(() => t.map((j, M) => ({
    ...j,
    color: G[M % G.length]
  })), [t]), b = j => {
    a(M => {
      if (j === M.length) return M;
      if (j < M.length) return M.slice(0, j);
      const k = Array.from({
        length: j - M.length
      }, (Y2, Q) => ({
        mass: 1 + (M.length + Q) % 4 * .7,
        speed: 1.2 + (M.length + Q) % 3 * .6
      }));
      return [...M, ...k]
    })
  }, L = (j, M) => a(k => k.map((Y2, Q) => Q === j ? {
    ...Y2,
    mass: M
  } : Y2)), A = (j, M) => a(k => k.map((Y2, Q) => Q === j ? {
    ...Y2,
    speed: M
  } : Y2));
  return e.jsxs("div", {
    className: "qp-lab-grid",
    children: [e.jsxs("div", {
      className: "qp-main-col",
      children: [e.jsxs("p", {
        className: "qp-instructions",
        children: [e.jsx(C, {
          size: 14
        }), ` ${t.length} spheres bounce elastically off the walls and each other inside the box. Set how many balls, and each one's mass and launch speed — momentum and kinetic energy stay conserved through every collision.`]
      }), e.jsx(H, {
        label: "PARTICLE COLLISION CHAMBER",
        children: e.jsx(Ms, {
          balls: P,
          resetToken: x,
          playing: d,
          onStats: g
        })
      })]
    }), e.jsxs("div", {
      className: "qp-side-col",
      children: [e.jsxs("div", {
        className: "qp-card",
        children: [e.jsxs("div", {
          className: "qp-slider-row",
          children: [e.jsxs("label", {
            children: ["Number of balls = ", t.length]
          }), e.jsx("input", {
            type: "range",
            min: 2,
            max: 10,
            step: 1,
            value: t.length,
            onChange: j => b(Number(j.target.value)),
            className: "qp-slider"
          })]
        }), ...t.map((j, M) => e.jsxs(e.Fragment, {
          children: [e.jsxs("h4", {
            children: [`Ball ${M+1} `, e.jsx("span", {
              className: "qp-swatch",
              style: {
                background: G[M % G.length]
              }
            })]
          }), e.jsxs("div", {
            className: "qp-slider-row",
            children: [e.jsxs("label", {
              children: ["Mass = ", j.mass.toFixed(1)]
            }), e.jsx("input", {
              type: "range",
              min: .5,
              max: 5,
              step: .1,
              value: j.mass,
              onChange: k => L(M, Number(k.target.value)),
              className: "qp-slider"
            })]
          }), e.jsxs("div", {
            className: "qp-slider-row",
            children: [e.jsxs("label", {
              children: ["Speed = ", j.speed.toFixed(1)]
            }), e.jsx("input", {
              type: "range",
              min: .3,
              max: 4,
              step: .1,
              value: j.speed,
              onChange: k => A(M, Number(k.target.value)),
              className: "qp-slider"
            })]
          })]
        }, M)), e.jsxs("div", {
          className: "qp-btn-row",
          children: [e.jsxs("button", {
            className: "qp-btn qp-btn-primary",
            onClick: () => u(j => !j),
            children: [d ? e.jsx(se, {
              size: 14
            }) : e.jsx(te, {
              size: 14
            }), " ", d ? "Pause" : "Resume"]
          }), e.jsxs("button", {
            className: "qp-btn",
            onClick: () => v(j => j + 1),
            children: [e.jsx(ae, {
              size: 14
            }), " Reset"]
          })]
        })]
      }), e.jsxs("div", {
        className: "qp-card",
        children: [e.jsx("h4", {
          children: "Results"
        }), e.jsxs("div", {
          className: "qp-readout-grid",
          children: [e.jsx(p, {
            label: "Ball speeds",
            value: m.speeds.map(j => f(j, 2)).join(", ")
          }), e.jsx(p, {
            label: "Total momentum |p|",
            value: f(m.momentum, 2)
          }), e.jsx(p, {
            label: "Total kinetic energy",
            value: f(m.ke, 2),
            accent: "#4fd8e0"
          }), e.jsx(p, {
            label: "Collisions",
            value: m.collisions,
            accent: "#f2a94e"
          })]
        }), e.jsx("button", {
          className: "qp-btn",
          onClick: () => s("Particle Collisions", `${t.length} balls`, `${m.collisions} collisions, KE=${f(m.ke,2)}`),
          children: "Record result"
        })]
      })]
    })]
  })
}
const Cs = {
  atom: We,
  spectrum: rs,
  photoelectric: hs,
  decay: vs,
  particles: ws
};

function Es() {
  const {
    active: s
  } = N(), t = Cs[s];
  return e.jsxs("div", {
    className: "qp-app",
    children: [e.jsx(ye, {}), e.jsx(Pe, {}), e.jsx("main", {
      className: "qp-main",
      children: e.jsx(t, {})
    }), e.jsx(ze, {}), e.jsx(Ie, {})]
  })
}

function Rs() {
  return e.jsx(je, {
    children: e.jsx(Es, {})
  })
}
de.createRoot(document.getElementById("root")).render(e.jsx(he.StrictMode, {
  children: e.jsx(Rs, {})
}));