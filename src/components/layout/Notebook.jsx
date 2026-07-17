import React from "react";
import { NotebookPen, Download, ChevronRight, X } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function Notebook() {
  const { results, exportResults, notebookOpen, setNotebookOpen } = useApp();

  return (
    <div className={"qp-notebook" + (notebookOpen ? " open" : "")}>
      <div className="qp-notebook-head">
        <span><NotebookPen size={14} /> Lab Notebook ({results.length})</span>
        <div>
          <button className="qp-icon-btn" onClick={exportResults} title="Export results"><Download size={15} /></button>
          <button className="qp-icon-btn" onClick={() => setNotebookOpen((v) => !v)} title="Toggle notebook">
            {notebookOpen ? <X size={15} /> : <ChevronRight size={15} />}
          </button>
        </div>
      </div>
      {notebookOpen && (
        <div className="qp-notebook-body">
          {results.length === 0 && <p className="qp-muted small">No results recorded yet — use &ldquo;Record result&rdquo; in any experiment.</p>}
          {results.map((r) => (
            <div key={r.id} className="qp-notebook-entry">
              <div className="qp-notebook-entry-head"><strong>{r.module}</strong><span className="qp-muted small">{r.time}</span></div>
              <div className="qp-muted small">{r.label}</div>
              <div className="small">{r.detail}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
