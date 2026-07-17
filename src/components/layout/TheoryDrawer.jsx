import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import { THEORY } from "../../physics/theory";
import { useApp } from "../../context/AppContext";

export default function TheoryDrawer() {
  const { active } = useApp();
  const [open, setOpen] = useState(false);
  const theory = THEORY[active];

  return (
    <div className={"qp-drawer" + (open ? " open" : "")}>
      <button className="qp-drawer-toggle" onClick={() => setOpen((v) => !v)}>
        <BookOpen size={14} /> Theory — {theory.title} {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && (
        <div className="qp-drawer-body">
          {theory.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}
    </div>
  );
}
