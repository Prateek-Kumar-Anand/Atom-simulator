/**
 * utils/exportReport.js
 * -----------------------------------------------------------------------
 * Builds the downloadable lab report in two FIXED formats. Both share one schema so
 * the output is identical from session to session and independent of the viewer's
 * locale (the old export used toLocaleString(), so dates changed shape per machine):
 *
 *   Columns : No. | Date | Time | Module | Experiment | Setup | Result
 *   Date    : YYYY-MM-DD      Time : HH:MM:SS (24 h, local time)
 *   Order   : oldest result first, numbered from 1
 *
 *   • buildCsv()        – spreadsheet (UTF-8 + BOM, CRLF line ends, RFC 4180 quoting). Header row
 *                         + one row per result, nothing else, so it sorts/filters/pivots cleanly.
 *   • buildTextReport() – printable 78-column report: banner, session summary, module checklist,
 *                         then one identically laid-out block per result.
 * -----------------------------------------------------------------------
 */

export const REPORT_TITLE = "QUANTA — Atomic Physics Laboratory";
export const CSV_COLUMNS = ["No.", "Date", "Time", "Module", "Experiment", "Setup", "Result"];
const EMPTY = "—";
const WIDTH = 78;

const pad = (n, w = 2) => String(n).padStart(w, "0");

export const formatDate = (ts) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
export const formatTime = (ts) => {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
export const formatStamp = (ts) => `${formatDate(ts)} ${formatTime(ts)}`;
/** Filename-safe stamp: 20261108-090215 */
export const fileStamp = (ts) => `${formatDate(ts).replace(/-/g, "")}-${formatTime(ts).replace(/:/g, "")}`;

/** "Quantum: Double Slit" -> ["Quantum Physics", "Double Slit"]; "Optics" -> ["Optics", "—"] */
export function splitModule(name) {
  const [head, ...rest] = String(name).split(":");
  const module = head.trim() === "Quantum" ? "Quantum Physics" : head.trim();
  const experiment = rest.join(":").trim();
  return [module, experiment || EMPTY];
}

/** Context stores results newest-first; the report is chronological and numbered. */
export function toRows(results) {
  return results
    .slice()
    .reverse()
    .map((r, i) => {
      const [module, experiment] = splitModule(r.module);
      return {
        no: i + 1,
        date: formatDate(r.ts),
        time: formatTime(r.ts),
        module,
        experiment,
        setup: String(r.label ?? "").replace(/\s+/g, " ").trim() || EMPTY,
        result: String(r.detail ?? "").replace(/\s+/g, " ").trim() || EMPTY,
      };
    });
}

function csvCell(value) {
  let s = String(value);
  // Neutralise spreadsheet formula injection (a cell starting with = + - @ would be evaluated).
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildCsv(results) {
  const lines = [CSV_COLUMNS.map(csvCell).join(",")];
  for (const r of toRows(results)) {
    lines.push([r.no, r.date, r.time, r.module, r.experiment, r.setup, r.result].map(csvCell).join(","));
  }
  return "﻿" + lines.join("\r\n") + "\r\n";
}

function wrap(label, text, width = WIDTH) {
  const lead = ` ${label.padEnd(11)}: `;
  const indent = " ".repeat(lead.length);
  const room = width - lead.length;
  const words = String(text).split(" ");
  const out = [];
  let line = "";
  for (const w of words) {
    if (line && (line + " " + w).length > room) { out.push(line); line = w; }
    else line = line ? line + " " + w : w;
  }
  out.push(line);
  return out.map((l, i) => (i === 0 ? lead : indent) + l).join("\n");
}

/**
 * @param results   newest-first result entries {ts, module, label, detail}
 * @param modules   [{key,label,code}] full module list
 * @param visited   Set of visited module keys
 * @param now       timestamp (ms) of generation
 */
export function buildTextReport(results, modules, visited, now = Date.now()) {
  const heavy = "=".repeat(WIDTH);
  const light = "-".repeat(WIDTH);
  const rows = toRows(results);
  const out = [
    heavy,
    ` ${REPORT_TITLE}`,
    " SESSION REPORT",
    heavy,
    ` ${"Generated".padEnd(15)}: ${formatStamp(now)}`,
    ` ${"Modules visited".padEnd(15)}: ${visited.size} / ${modules.length}`,
    ` ${"Results logged".padEnd(15)}: ${rows.length}`,
    light,
    " MODULES",
    ...modules.map((m) => `  [${visited.has(m.key) ? "x" : " "}] ${m.code}  ${m.label}`),
    light,
    " RESULTS",
    light,
  ];
  if (rows.length === 0) out.push(" (no results recorded in this session)", light);
  for (const r of rows) {
    out.push(
      ` #${pad(r.no, 3)}   ${r.date} ${r.time}`,
      wrap("Module", r.module),
      wrap("Experiment", r.experiment),
      wrap("Setup", r.setup),
      wrap("Result", r.result),
      light
    );
  }
  out.push(" END OF REPORT", heavy);
  return out.join("\n") + "\n";
}
