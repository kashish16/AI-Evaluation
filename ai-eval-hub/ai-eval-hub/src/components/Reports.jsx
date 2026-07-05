import { useState } from "react";

const CRITERIA = ["clarity","accuracy","usefulness","specificity","actionable"];
const CRIT_LABELS = { clarity:"Clarity", accuracy:"Accuracy", usefulness:"Usefulness", specificity:"Specificity", actionable:"Actionable" };
const BOT_COLORS = { ChatGPT:"#10a37f", Claude:"#da7756", Gemini:"#4285f4", Copilot:"#0078d4", "Meta AI":"#0064e0" };

function BarChart({ data }) {
  if (!data.length) return null;
  const maxH = 140; const barW = 44; const gap = 18;
  const w = data.length * (barW + gap) + gap;
  return (
    <svg width={w} height={maxH + 40} style={{ overflow:"visible" }}>
      {[0,1,2,3,4,5].map(v => {
        const y = maxH - (v / 5) * maxH;
        return (
          <g key={v}>
            <line x1={gap} y1={y} x2={w} y2={y} stroke="#f1f5f9" strokeWidth="1"/>
            <text x={gap - 4} y={y + 4} fontSize="9" fill="#cbd5e1" textAnchor="end">{v}</text>
          </g>
        );
      })}
      {data.map(({ name, avg, color }, i) => {
        const bh = (avg / 5) * maxH;
        const x  = gap + i * (barW + gap);
        const col = BOT_COLORS[name] || color || "#6366f1";
        return (
          <g key={name}>
            <rect x={x} y={maxH - bh} width={barW} height={bh} rx="5" fill={col} opacity="0.9"/>
            <text x={x + barW/2} y={maxH - bh - 5} fontSize="11" fill={col} textAnchor="middle" fontWeight="700">{avg.toFixed(1)}</text>
            <text x={x + barW/2} y={maxH + 16} fontSize="10" fill="#64748b" textAnchor="middle">{name}</text>
          </g>
        );
      })}
    </svg>
  );
}

function RadarChart({ data, size = 200 }) {
  const cx = size / 2; const cy = size / 2; const r = size * 0.35;
  const n  = CRITERIA.length;
  const angle = i => (Math.PI * 2 * i / n) - Math.PI / 2;
  const pt    = (i, val) => ({
    x: cx + r * (val / 5) * Math.cos(angle(i)),
    y: cy + r * (val / 5) * Math.sin(angle(i)),
  });
  const axPt  = i => ({ x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) });

  return (
    <svg width={size} height={size}>
      {[1,2,3,4,5].map(lvl => {
        const pts = CRITERIA.map((_, i) => ({ x: cx + r*(lvl/5)*Math.cos(angle(i)), y: cy + r*(lvl/5)*Math.sin(angle(i)) }));
        return <polygon key={lvl} points={pts.map(p=>`${p.x},${p.y}`).join(" ")} fill="none" stroke="#e2e8f0" strokeWidth="1"/>;
      })}
      {CRITERIA.map((_, i) => {
        const p = axPt(i);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1"/>;
      })}
      {CRITERIA.map((c, i) => {
        const p = axPt(i);
        const ox = p.x < cx - 5 ? -8 : p.x > cx + 5 ? 8 : 0;
        const oy = p.y < cy - 5 ? -8 : p.y > cy + 5 ? 10 : 0;
        return <text key={i} x={p.x + ox} y={p.y + oy} fontSize="9" fill="#94a3b8" textAnchor="middle">{CRIT_LABELS[c]}</text>;
      })}
      {data.map(({ name, scores }, di) => {
        const color = BOT_COLORS[name] || "#6366f1";
        const pts   = CRITERIA.map((c, i) => pt(i, scores[c] || 0));
        return (
          <g key={name}>
            <polygon points={pts.map(p=>`${p.x},${p.y}`).join(" ")} fill={color+"33"} stroke={color} strokeWidth="1.8"/>
            {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={color}/>)}
          </g>
        );
      })}
    </svg>
  );
}

export default function Reports({ sessions }) {
  const [filter, setFilter] = useState("All");

  if (!sessions.length) return (
    <div style={{ padding:"60px 32px", textAlign:"center", color:"#94a3b8" }}>
      <i className="ti ti-chart-bar" style={{ fontSize:48, display:"block", marginBottom:14 }}/>
      <p style={{ fontSize:15 }}>No sessions yet. Run some evaluations first!</p>
    </div>
  );

  // Aggregate by bot name
  const botMap = {};
  sessions.forEach(s => {
    (s.ranked || []).forEach(r => {
      if (!botMap[r.name]) botMap[r.name] = { name:r.name, avgs:[], criteriaTotal:{}, criteriaCounts:{} };
      botMap[r.name].avgs.push(r.avg);
      CRITERIA.forEach(c => {
        botMap[r.name].criteriaTotal[c]  = (botMap[r.name].criteriaTotal[c]  || 0) + (r.scores?.[c] || 0);
        botMap[r.name].criteriaCounts[c] = (botMap[r.name].criteriaCounts[c] || 0) + (r.scores?.[c] ? 1 : 0);
      });
    });
  });

  const botStats = Object.values(botMap).map(b => {
    const avg = b.avgs.reduce((a,v)=>a+v,0) / b.avgs.length;
    const scores = Object.fromEntries(CRITERIA.map(c => [c, b.criteriaCounts[c] ? (b.criteriaTotal[c]/b.criteriaCounts[c]) : 0]));
    return { name:b.name, avg, scores, sessions: b.avgs.length };
  }).sort((a,b) => b.avg - a.avg);

  const barData  = botStats.map(b => ({ name:b.name, avg:b.avg }));
  const radarData = botStats.map(b => ({ name:b.name, scores:b.scores }));

  const wins = {};
  sessions.forEach(s => { if(s.winner) wins[s.winner] = (wins[s.winner]||0)+1; });

  const categories = [...new Set(sessions.map(s=>s.category))];
  const catOptions = ["All", ...categories];

  const filteredSessions = filter==="All" ? sessions : sessions.filter(s=>s.category===filter);

  const exportCSV = () => {
    const rows = [["Date","Category","Evaluator","Prompt","Bot","Overall","Clarity","Accuracy","Usefulness","Specificity","Actionable","Winner","Notes","Summary"]];
    sessions.forEach(s => {
      (s.ranked||[]).forEach(r => {
        rows.push([
          new Date(s.date).toLocaleDateString(),
          s.category, s.evaluator||"",
          (s.prompt||"").replace(/"/g,"'"),
          r.name,
          r.avg.toFixed(2),
          ...(CRITERIA.map(c => r.scores?.[c] || 0)),
          s.winner||"",
          (s.notes?.[r.name.toLowerCase().replace(/\s/g,"")] || "").replace(/"/g,"'"),
          (s.summary||"").replace(/"/g,"'"),
        ]);
      });
    });
    const csv = rows.map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "ai_eval_report.csv";
    a.click();
  };

  const exportJSON = () => {
    const a = document.createElement("a");
    a.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessions, null, 2));
    a.download = "ai_eval_sessions.json";
    a.click();
  };

  return (
    <div style={{ padding:"28px 32px" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"#1e293b", margin:0 }}>Reports & Analytics</h1>
          <p style={{ color:"#64748b", fontSize:13, margin:"4px 0 0" }}>{sessions.length} sessions • {botStats.length} bots evaluated</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={exportCSV}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:9,
              border:"1px solid #e2e8f0", background:"#fff", color:"#374151", fontSize:13, cursor:"pointer", fontWeight:500 }}>
            <i className="ti ti-file-spreadsheet"/> Export CSV
          </button>
          <button onClick={exportJSON}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:9,
              border:"none", background:"#6366f1", color:"#fff", fontSize:13, cursor:"pointer", fontWeight:500 }}>
            <i className="ti ti-download"/> Export JSON
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[
          { label:"Sessions",    value:sessions.length,                  icon:"ti-clipboard-list",  color:"#6366f1" },
          { label:"Bots tested", value:botStats.length,                  icon:"ti-robot",            color:"#8b5cf6" },
          { label:"Top bot",     value:botStats[0]?.name || "—",        icon:"ti-trophy",           color:"#f59e0b" },
          { label:"Top score",   value:botStats[0]?.avg.toFixed(2)||"—", icon:"ti-star",            color:"#059669" },
        ].map(s => (
          <div key={s.label} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"14px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:s.color+"18",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <i className={`ti ${s.icon}`} style={{ color:s.color, fontSize:15 }}/>
              </div>
              <span style={{ fontSize:12, color:"#64748b" }}>{s.label}</span>
            </div>
            <div style={{ fontSize:22, fontWeight:700, color:"#1e293b" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"18px 20px" }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:"#1e293b", marginBottom:16 }}>Average score by bot</h3>
          <div style={{ overflowX:"auto" }}>
            <BarChart data={barData}/>
          </div>
          <div style={{ display:"flex", gap:12, marginTop:12, flexWrap:"wrap" }}>
            {barData.map(b => (
              <div key={b.name} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:BOT_COLORS[b.name]||"#6366f1" }}/>
                <span style={{ fontSize:11, color:"#64748b" }}>{b.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"18px 20px" }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:"#1e293b", marginBottom:16 }}>Criteria radar</h3>
          <div style={{ display:"flex", justifyContent:"center" }}>
            <RadarChart data={radarData} size={200}/>
          </div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginTop:8 }}>
            {radarData.map(b => (
              <div key={b.name} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:BOT_COLORS[b.name]||"#6366f1" }}/>
                <span style={{ fontSize:11, color:"#64748b" }}>{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed table */}
      <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"18px 20px", marginBottom:14 }}>
        <h3 style={{ fontSize:14, fontWeight:600, color:"#1e293b", marginBottom:14 }}>Detailed criteria scores</h3>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"2px solid #f1f5f9" }}>
                <th style={{ textAlign:"left", padding:"8px 12px 10px 0", color:"#64748b", fontWeight:500 }}>Bot</th>
                {CRITERIA.map(c => (
                  <th key={c} style={{ textAlign:"center", padding:"8px", color:"#64748b", fontWeight:500 }}>{CRIT_LABELS[c]}</th>
                ))}
                <th style={{ textAlign:"center", padding:"8px", color:"#1e293b", fontWeight:600 }}>Overall</th>
                <th style={{ textAlign:"center", padding:"8px", color:"#64748b", fontWeight:500 }}>Sessions</th>
                <th style={{ textAlign:"center", padding:"8px", color:"#64748b", fontWeight:500 }}>Wins</th>
              </tr>
            </thead>
            <tbody>
              {botStats.map((b, i) => (
                <tr key={b.name} style={{ borderTop:"1px solid #f8fafc" }}>
                  <td style={{ padding:"10px 12px 10px 0" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:10, height:10, borderRadius:2, background:BOT_COLORS[b.name]||"#6366f1", flexShrink:0 }}/>
                      <span style={{ fontWeight:500, color:"#1e293b" }}>{b.name}</span>
                      {i===0 && <span style={{ fontSize:14 }}>🏆</span>}
                    </div>
                  </td>
                  {CRITERIA.map(c => {
                    const v = parseFloat(b.scores[c] || 0);
                    return (
                      <td key={c} style={{ textAlign:"center", padding:"10px 8px" }}>
                        <span style={{ fontWeight:600, color:v>=4?"#059669":v>=3?"#d97706":"#dc2626" }}>
                          {v.toFixed(1)}
                        </span>
                      </td>
                    );
                  })}
                  <td style={{ textAlign:"center", padding:"10px 8px", fontWeight:700, color:"#6366f1", fontSize:15 }}>
                    {b.avg.toFixed(2)}
                  </td>
                  <td style={{ textAlign:"center", padding:"10px 8px", color:"#94a3b8" }}>{b.sessions}</td>
                  <td style={{ textAlign:"center", padding:"10px 8px", color:"#94a3b8" }}>{wins[b.name]||0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Win rate */}
      <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"18px 20px", marginBottom:14 }}>
        <h3 style={{ fontSize:14, fontWeight:600, color:"#1e293b", marginBottom:14 }}>Win rate (sessions won)</h3>
        {Object.entries(wins).sort((a,b)=>b[1]-a[1]).map(([bot,w]) => {
          const pct = (w/sessions.length)*100;
          const col = BOT_COLORS[bot]||"#6366f1";
          return (
            <div key={bot} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:13, fontWeight:500, color:"#1e293b" }}>{bot}</span>
                <span style={{ fontSize:13, color:col, fontWeight:600 }}>{w} win{w!==1?"s":""} ({pct.toFixed(0)}%)</span>
              </div>
              <div style={{ height:8, background:"#f1f5f9", borderRadius:4, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:col, borderRadius:4, transition:"width .6s" }}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* Session list */}
      <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"18px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:"#1e293b" }}>Session log</h3>
          <select value={filter} onChange={e=>setFilter(e.target.value)}
            style={{ padding:"6px 10px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:12, color:"#374151" }}>
            {catOptions.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        {filteredSessions.map(s => {
          const best = Object.entries(s.scores||{}).sort((a,b)=>b[1]-a[1])[0];
          return (
            <div key={s.id} style={{ padding:"11px 0", borderBottom:"1px solid #f8fafc", display:"flex", gap:12, alignItems:"flex-start" }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:500, color:"#1e293b", marginBottom:3,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {s.prompt?.slice(0,85)}{(s.prompt?.length||0)>85?"…":""}
                </div>
                <div style={{ fontSize:11, color:"#94a3b8" }}>
                  {s.category} • {new Date(s.date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
                  {s.evaluator && ` • ${s.evaluator}`}
                </div>
                {s.summary && (
                  <div style={{ fontSize:11, color:"#64748b", marginTop:4, fontStyle:"italic" }}>
                    {s.summary.slice(0,100)}{s.summary.length>100?"…":""}
                  </div>
                )}
              </div>
              {best && (
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:11, color:"#059669", fontWeight:600 }}>🏆 {best[0]}</div>
                  <div style={{ fontSize:11, color:"#94a3b8" }}>{parseFloat(best[1]).toFixed(2)}/5</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
