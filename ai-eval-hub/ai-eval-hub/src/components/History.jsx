import { useState } from "react";

export default function History({ sessions, onDelete }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const filtered = sessions.filter(s =>
    !search ||
    s.prompt?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase()) ||
    s.winner?.toLowerCase().includes(search.toLowerCase())
  );

  const BOT_COLORS = { ChatGPT:"#10a37f", Claude:"#da7756", Gemini:"#4285f4", Copilot:"#0078d4", "Meta AI":"#0064e0" };

  const exportAll = () => {
    const rows = [["Date","Category","Prompt","Bot","Overall Score","Winner","Notes","Summary"]];
    sessions.forEach(s => {
      Object.entries(s.scores || {}).forEach(([bot, score]) => {
        rows.push([
          new Date(s.date).toLocaleDateString(),
          s.category, (s.prompt||"").replace(/"/g,"'"),
          bot, score, s.winner||"",
          (s.notes?.[bot.toLowerCase().replace(" ","")] || "").replace(/"/g,"'"),
          (s.summary||"").replace(/"/g,"'"),
        ]);
      });
    });
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "ai_eval_all_sessions.csv";
    a.click();
  };

  if (sessions.length === 0) return (
    <div style={{ padding:"60px 32px", textAlign:"center", color:"#94a3b8" }}>
      <i className="ti ti-history" style={{ fontSize:48, display:"block", marginBottom:14 }} />
      <p style={{ fontSize:15 }}>No sessions yet. Complete your first evaluation!</p>
    </div>
  );

  return (
    <div style={{ padding:"28px 32px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"#1e293b", margin:0 }}>Session History</h1>
          <p style={{ color:"#64748b", fontSize:13, margin:"4px 0 0" }}>{sessions.length} sessions logged</p>
        </div>
        <button onClick={exportAll}
          style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:9,
            border:"1px solid #e2e8f0", background:"#fff", color:"#374151", fontSize:13, cursor:"pointer", fontWeight:500 }}>
          <i className="ti ti-download" /> Export all CSV
        </button>
      </div>

      <div style={{ position:"relative", marginBottom:16 }}>
        <i className="ti ti-search" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by prompt, category or winner..."
          style={{ width:"100%", padding:"9px 12px 9px 34px", border:"1px solid #e2e8f0", borderRadius:9, fontSize:13, boxSizing:"border-box" }} />
      </div>

      <div style={{ display:"grid", gap:10 }}>
        {filtered.map(s => {
          const isOpen = expanded === s.id;
          const bestBot = Object.entries(s.scores || {}).sort((a,b) => b[1]-a[1])[0];
          return (
            <div key={s.id} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, overflow:"hidden" }}>
              {/* Summary row */}
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", cursor:"pointer" }}
                onClick={() => setExpanded(isOpen ? null : s.id)}>
                <div style={{ width:36, height:36, borderRadius:9, background:"#eef2ff",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <i className="ti ti-clipboard-check" style={{ color:"#6366f1", fontSize:17 }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:"#1e293b", marginBottom:2,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {s.prompt?.slice(0,90)}{(s.prompt?.length||0) > 90 ? "…" : ""}
                  </div>
                  <div style={{ fontSize:11, color:"#94a3b8" }}>
                    {s.category} • {new Date(s.date).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                    {s.evaluator && ` • ${s.evaluator}`}
                  </div>
                </div>
                {bestBot && (
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:11, color:"#059669", fontWeight:600 }}>🏆 {bestBot[0]}</div>
                    <div style={{ fontSize:11, color:"#94a3b8" }}>{parseFloat(bestBot[1]).toFixed(2)}/5</div>
                  </div>
                )}
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  <button onClick={e => { e.stopPropagation(); onDelete(s.id); }}
                    style={{ background:"none", border:"none", cursor:"pointer", color:"#cbd5e1", padding:4 }}>
                    <i className="ti ti-trash" style={{ fontSize:15 }} />
                  </button>
                  <i className={`ti ${isOpen ? "ti-chevron-up" : "ti-chevron-down"}`}
                    style={{ color:"#94a3b8", fontSize:16, padding:4 }} />
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ borderTop:"1px solid #f1f5f9", padding:"14px 16px", background:"#fafafa" }}>
                  {/* Full prompt */}
                  <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:9, padding:"10px 13px",
                    marginBottom:12, fontSize:13, color:"#374151", lineHeight:1.65,
                    borderLeft:"4px solid #6366f1" }}>
                    {s.prompt}
                  </div>

                  {/* Bot scores */}
                  <div style={{ display:"grid", gap:8, marginBottom:12 }}>
                    {Object.entries(s.scores || {}).sort((a,b) => b[1]-a[1]).map(([bot, score]) => {
                      const col = BOT_COLORS[bot] || "#6366f1";
                      const pct = (parseFloat(score)/5)*100;
                      const note = s.notes?.[bot.toLowerCase().replace(/\s/g,"")];
                      return (
                        <div key={bot} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:9, padding:"10px 13px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                            <div style={{ width:26, height:26, borderRadius:6, background:col, display:"flex",
                              alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:11 }}>
                              {bot.slice(0,2).toUpperCase()}
                            </div>
                            <span style={{ fontSize:13, fontWeight:500, color:"#1e293b", flex:1 }}>{bot}</span>
                            <span style={{ fontSize:16, fontWeight:700, color: parseFloat(score)>=4?"#059669":parseFloat(score)>=3?"#d97706":"#dc2626" }}>
                              {parseFloat(score).toFixed(2)}/5
                            </span>
                          </div>
                          <div style={{ height:6, background:"#f1f5f9", borderRadius:3, overflow:"hidden", marginBottom: note?8:0 }}>
                            <div style={{ height:"100%", width:`${pct}%`, background:col, borderRadius:3 }} />
                          </div>
                          {note && <div style={{ fontSize:12, color:"#64748b", fontStyle:"italic" }}>{note}</div>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary */}
                  {s.summary && (
                    <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:9, padding:"10px 13px",
                      fontSize:13, color:"#92400e" }}>
                      <strong>Evaluator notes: </strong>{s.summary}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
