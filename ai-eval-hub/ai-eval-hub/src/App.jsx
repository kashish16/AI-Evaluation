import { useState } from "react";
import EvalHub from "./components/EvalHub";
import History from "./components/History";
import PromptLibrary from "./components/PromptLibrary";
import Reports from "./components/Reports";

const NAV = [
  { id: "eval",     icon: "ti-clipboard-check", label: "Evaluate"        },
  { id: "library",  icon: "ti-books",            label: "Prompt Library"  },
  { id: "history",  icon: "ti-history",          label: "History"         },
  { id: "reports",  icon: "ti-chart-bar",        label: "Reports"         },
];

export default function App() {
  const [page, setPage]       = useState("eval");
  const [sessions, setSessions] = useState(() => {
    try { return JSON.parse(localStorage.getItem("aiev2_sessions") || "[]"); }
    catch { return []; }
  });
  const [startPrompt, setStartPrompt] = useState("");

  const saveSession = (s) => {
    const updated = [s, ...sessions];
    setSessions(updated);
    localStorage.setItem("aiev2_sessions", JSON.stringify(updated));
  };

  const deleteSession = (id) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem("aiev2_sessions", JSON.stringify(updated));
  };

  const usePrompt = (p) => {
    setStartPrompt(p);
    setPage("eval");
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"Inter,system-ui,sans-serif", background:"#f8fafc" }}>
      {/* Sidebar */}
      <aside style={{ width:210, background:"#0f172a", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"22px 18px 18px", borderBottom:"1px solid #1e293b" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <i className="ti ti-robot" style={{ color:"#fff", fontSize:17 }} />
            </div>
            <div>
              <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13 }}>AI Eval Hub</div>
              <div style={{ color:"#475569", fontSize:10 }}>SMB Response Evaluator</div>
            </div>
          </div>
        </div>

        <nav style={{ padding:"10px 8px", flex:1 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 12px",
                borderRadius:7, border:"none", cursor:"pointer", marginBottom:2, textAlign:"left",
                background: page===n.id ? "#6366f1" : "transparent",
                color: page===n.id ? "#fff" : "#64748b",
                fontSize:13, fontWeight: page===n.id ? 600 : 400 }}>
              <i className={`ti ${n.icon}`} style={{ fontSize:16 }} />
              {n.label}
            </button>
          ))}
        </nav>

        <div style={{ padding:"14px 18px", borderTop:"1px solid #1e293b" }}>
          <div style={{ color:"#334155", fontSize:10, marginBottom:3 }}>SESSIONS LOGGED</div>
          <div style={{ color:"#f1f5f9", fontSize:24, fontWeight:700 }}>{sessions.length}</div>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex:1, overflow:"auto" }}>
        {page === "eval"    && <EvalHub    onSave={saveSession} startPrompt={startPrompt} onClearPrompt={() => setStartPrompt("")} />}
        {page === "library" && <PromptLibrary onUse={usePrompt} />}
        {page === "history" && <History sessions={sessions} onDelete={deleteSession} />}
        {page === "reports" && <Reports sessions={sessions} />}
      </main>
    </div>
  );
}
