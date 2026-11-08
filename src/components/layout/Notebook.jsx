import React from "react";
import { NotebookPen, Table2, FileText, ChevronRight, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatDate, formatTime, splitModule } from "../../utils/exportReport";

export default function Notebook() {
  const { results, exportCsv, exportReport, notebookOpen, setNotebookOpen } = useApp();
  const empty = results.length === 0;

  return (
    <section className={"qp-notebook" + (notebookOpen ? " open" : "")} aria-label="Lab notebook">
      <div className="qp-notebook-head">
        <span><NotebookPen size={14} /> Lab Notebook ({results.length})</span>
        <div className="qp-notebook-actions">
          <button
            className="qp-chip-btn" onClick={exportCsv} disabled={empty}
            title={empty ? "Record a result first" : "Download all results as a spreadsheet (.csv)"}
          >
            <Table2 size={13} /> Sheet (.csv)
          </button>
          <button
            className="qp-chip-btn" onClick={exportReport} disabled={empty}
            title={empty ? "Record a result first" : "Download a printable report (.txt)"}
          >
            <FileText size={13} /> Report (.txt)
          </button>
          <button className="qp-icon-btn" onClick={() => setNotebookOpen((v) => !v)} title="Toggle notebook" aria-expanded={notebookOpen}>
            {notebookOpen ? <X size={15} /> : <ChevronRight size={15} />}
          </button>
        </div>
      </div>
      {notebookOpen && (
        <div className="qp-notebook-body">
          {empty && <p className="qp-muted small">No results recorded yet — use &ldquo;Record result&rdquo; in any experiment.</p>}
          {results.map((r) => {
            const [module, experiment] = splitModule(r.module);
            return (
              <div key={r.id} className="qp-notebook-entry">
                <div className="qp-notebook-entry-head">
                  <strong>{module}{experiment !== "—" ? ` · ${experiment}` : ""}</strong>
                  <span className="qp-muted small">{formatDate(r.ts)} {formatTime(r.ts)}</span>
                </div>
                <div className="qp-muted small">{r.label}</div>
                <div className="small">{r.detail}</div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
