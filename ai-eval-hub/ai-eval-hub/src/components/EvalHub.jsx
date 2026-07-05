import { useState, useEffect } from "react";

const BOTS = [
  { id:"chatgpt",  name:"ChatGPT",   url:"https://chat.openai.com",           color:"#10a37f", initials:"GP" },
  { id:"claude",   name:"Claude",    url:"https://claude.ai",                  color:"#da7756", initials:"CL" },
  { id:"gemini",   name:"Gemini",    url:"https://gemini.google.com",          color:"#4285f4", initials:"GM" },
  { id:"copilot",  name:"Copilot",   url:"https://copilot.microsoft.com",      color:"#0078d4", initials:"CO" },
  { id:"metaai",   name:"Meta AI",   url:"https://www.meta.ai",                color:"#0064e0", initials:"MA" },
];

const CRITERIA = [
  { id:"clarity",     label:"Clarity",     desc:"Is the response easy to understand?" },
  { id:"accuracy",    label:"Accuracy",    desc:"Is the information factually correct?" },
  { id:"usefulness",  label:"Usefulness",  desc:"Does it actually solve the problem?" },
  { id:"specificity", label:"Specificity", desc:"Tailored to small business context?" },
  { id:"actionable",  label:"Actionable",  desc:"Can the user act on it right now?" },
];

const CATEGORIES = [
  "Customer Service","Marketing & Social Media","Financial Planning",
  "HR & Hiring","Legal & Compliance","Market Research",
  "Sales & Pricing","Inventory & Operations",
];

const QUICK_PROMPTS = [
  { label:"Customer review",    text:"How should I handle a negative Google review from a customer claiming they never received their order, but our tracking shows it was delivered?" },
  { label:"Instagram captions", text:"Write 5 Instagram captions for a local bakery promoting a weekend croissant sale. Include relevant hashtags and a call to action." },
  { label:"Cash flow problem",  text:"My retail store has $12,000 monthly revenue but only $800 profit. Identify the most likely causes and give me a prioritised action plan." },
  { label:"Job description",    text:"Write a job description for a part-time social media manager for a local gym. Budget is $900/month for 20 hrs/week." },
  { label:"Pricing strategy",   text:"I'm losing customers to a cheaper competitor. Should I match their prices, differentiate on quality, or do something else? Analyse my options." },
  { label:"Refund policy",      text:"Write a clear and fair refund and returns policy for a small online handmade jewellery shop." },
];

function Stars({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display:"flex", gap:2 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{ background:"none", border:"none", cursor:"pointer", padding:"0 1px",
            fontSize:22, lineHeight:1,
            color: n <= (hover || value) ? "#f59e0b" : "#e2e8f0" }}>
          ★
        </button>
      ))}
    </div>
  );
}

const emptyScores = () => Object.fromEntries(BOTS.map(b => [b.id, Object.fromEntries(CRITERIA.map(c => [c.id, 0]))]));

export default function EvalHub({ onSave, startPrompt, onClearPrompt }) {
  const [step, setStep]         = useState(1);
  const [prompt, setPrompt]     = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [evaluator, setEvaluator] = useState("");
  const [selectedBots, setSelectedBots] = useState(["chatgpt","claude","gemini"]);
  const [scores, setScores]     = useState(emptyScores());
  const [notes, setNotes]       = useState(Object.fromEntries(BOTS.map(b => [b.id, ""])));
  const [opened, setOpened]     = useState({});
  const [copied, setCopied]     = useState(false);
  const [winner, setWinner]     = useState("");
  const [summary, setSummary]   = useState("");

  useEffect(() => {
    if (startPrompt) { setPrompt(startPrompt); onClearPrompt(); }
  }, [startPrompt]);

  const activeBots = BOTS.filter(b => selectedBots.includes(b.id));

  const toggleBot = (id) => {
    if (selectedBots.includes(id)) {
      if (selectedBots.length > 2) setSelectedBots(s => s.filter(x => x !== id));
    } else {
      if (selectedBots.length < 5) setSelectedBots(s => [...s, id]);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openBot = (bot) => {
    window.open(bot.url, "_blank");
    setOpened(o => ({ ...o, [bot.id]: true }));
  };

  const setScore = (botId, critId, val) => {
    setScores(s => ({ ...s, [botId]: { ...s[botId], [critId]: val } }));
  };

  const getAvg = (botId) => {
    const vals = CRITERIA.map(c => scores[botId][c.id]).filter(v => v > 0);
    return vals.length ? (vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(2) : "0.00";
  };

  const getCritAvg = (botId, critId) => scores[botId][critId] || 0;

  const ranked = [...activeBots]
    .map(b => ({ ...b, avg: parseFloat(getAvg(b.id)) }))
    .sort((a, b) => b.avg - a.avg);

  const handleSave = () => {
    const session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      prompt, category, evaluator,
      bots: selectedBots,
      scores: Object.fromEntries(activeBots.map(b => [b.name, getAvg(b.id)])),
      notes,
      winner,
      summary,
      ranked: ranked.map(b => ({ name: b.name, avg: b.avg, scores: scores[b.id] })),
    };
    onSave(session);
    // reset
    setStep(1); setPrompt(""); setScores(emptyScores());
    setNotes(Object.fromEntries(BOTS.map(b => [b.id, ""])));
    setOpened({}); setWinner(""); setSummary("");
  };

  const STEP_LABELS = ["Write prompt","Open AIs","Score responses","Results"];

  return (
    <div style={{ padding:"28px 32px", maxWidth:820, margin:"0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:"#1e293b", margin:0 }}>Evaluation Session</h1>
        <p style={{ color:"#64748b", fontSize:13, margin:"4px 0 0" }}>
          Type your prompt once → open each AI → paste → score → get results
        </p>
      </div>

      {/* Step bar */}
      <div style={{ display:"flex", background:"#f1f5f9", borderRadius:10, padding:4, marginBottom:24, gap:0 }}>
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const isActive = step === n;
          const isDone   = step > n;
          return (
            <button key={n} onClick={() => step > n && setStep(n)}
              style={{ flex:1, padding:"8px 4px", border:"none", borderRadius:7, cursor: step > n ? "pointer" : "default",
                fontSize:12, fontWeight:500, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                background: isActive ? "#6366f1" : isDone ? "#ecfdf5" : "transparent",
                color: isActive ? "#fff" : isDone ? "#059669" : "#94a3b8" }}>
              <span style={{ width:18, height:18, borderRadius:"50%", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700,
                background: isActive ? "rgba(255,255,255,0.3)" : isDone ? "#059669" : "#e2e8f0",
                color: isActive ? "#fff" : isDone ? "#fff" : "#94a3b8" }}>
                {isDone ? "✓" : n}
              </span>
              <span style={{ display: window.innerWidth < 500 ? "none" : "inline" }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── STEP 1: WRITE PROMPT ─── */}
      {step === 1 && (
        <div>
          <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"18px 20px", marginBottom:14 }}>
            <h3 style={{ fontSize:14, fontWeight:600, color:"#1e293b", marginBottom:12 }}>
              <i className="ti ti-writing" style={{ marginRight:7, color:"#6366f1" }} />Evaluation details
            </h3>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:12, color:"#64748b", display:"block", marginBottom:5 }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ width:"100%", padding:"8px 10px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13 }}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, color:"#64748b", display:"block", marginBottom:5 }}>Your name (evaluator)</label>
                <input value={evaluator} onChange={e => setEvaluator(e.target.value)}
                  placeholder="e.g. Rahul"
                  style={{ width:"100%", padding:"8px 10px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, boxSizing:"border-box" }} />
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, color:"#64748b", display:"block", marginBottom:5 }}>Bots to compare (2–5)</label>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                {BOTS.map(b => {
                  const on = selectedBots.includes(b.id);
                  return (
                    <button key={b.id} onClick={() => toggleBot(b.id)}
                      style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:20,
                        border:`1.5px solid ${on ? b.color : "#e2e8f0"}`,
                        background: on ? b.color+"15" : "#fff",
                        color: on ? b.color : "#64748b",
                        fontSize:13, fontWeight: on ? 600 : 400, cursor:"pointer" }}>
                      <div style={{ width:16, height:16, borderRadius:4, background:b.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#fff", fontWeight:700 }}>{b.initials[0]}</div>
                      {b.name}
                      {on && <i className="ti ti-check" style={{ fontSize:12 }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ fontSize:12, color:"#64748b", display:"block", marginBottom:5 }}>Your prompt</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder="Type the exact business question you'll paste into each AI..."
                rows={4}
                style={{ width:"100%", border:"1px solid #e2e8f0", borderRadius:8, padding:"10px 12px",
                  fontSize:13, resize:"vertical", fontFamily:"inherit", boxSizing:"border-box", lineHeight:1.6 }} />
            </div>
          </div>

          {/* Quick prompts */}
          <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"14px 18px", marginBottom:14 }}>
            <div style={{ fontSize:12, color:"#64748b", marginBottom:10, fontWeight:500 }}>
              <i className="ti ti-bolt" style={{ marginRight:5, color:"#f59e0b" }} />Quick load a prompt
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {QUICK_PROMPTS.map((q, i) => (
                <button key={i} onClick={() => setPrompt(q.text)}
                  style={{ padding:"8px 12px", border:"1px solid #e2e8f0", borderRadius:8, background:"#f8fafc",
                    color:"#374151", fontSize:12, cursor:"pointer", textAlign:"left" }}>
                  <div style={{ fontWeight:500, marginBottom:2, color:"#6366f1" }}>{q.label}</div>
                  <div style={{ color:"#94a3b8", fontSize:11, lineHeight:1.4, overflow:"hidden",
                    display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                    {q.text}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => { if (!prompt.trim()) { alert("Please enter a prompt first."); return; } setStep(2); }}
            style={{ width:"100%", padding:"12px", borderRadius:10, border:"none", cursor:"pointer",
              background:"#6366f1", color:"#fff", fontWeight:600, fontSize:14 }}>
            Next: Open AIs and collect responses →
          </button>
        </div>
      )}

      {/* ─── STEP 2: OPEN AIs ─── */}
      {step === 2 && (
        <div>
          {/* Prompt box with copy */}
          <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"16px 18px", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#1e293b" }}>
                <i className="ti ti-message" style={{ marginRight:7, color:"#6366f1" }} />Your prompt — copy this
              </div>
              <button onClick={copyPrompt}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:20,
                  border:`1.5px solid ${copied ? "#059669" : "#6366f1"}`,
                  background: copied ? "#ecfdf5" : "#eef2ff",
                  color: copied ? "#059669" : "#6366f1",
                  fontSize:12, fontWeight:600, cursor:"pointer" }}>
                <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} style={{ fontSize:14 }} />
                {copied ? "Copied!" : "Copy prompt"}
              </button>
            </div>
            <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"12px 14px",
              fontSize:13, color:"#374151", lineHeight:1.6, borderLeft:"4px solid #6366f1" }}>
              {prompt}
            </div>
          </div>

          {/* Instructions */}
          <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:13, color:"#92400e" }}>
            <i className="ti ti-info-circle" style={{ marginRight:7 }} />
            <strong>How to use:</strong> Click each button below → a new tab opens → paste your prompt → get the response → come back and click the next button.
          </div>

          {/* Bot open buttons */}
          <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"16px 18px", marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#1e293b", marginBottom:14 }}>
              Open each AI and paste your prompt
            </div>
            {activeBots.map(b => (
              <div key={b.id}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10,
                  border:`1.5px solid ${opened[b.id] ? "#059669" : "#e2e8f0"}`,
                  background: opened[b.id] ? "#f0fdf4" : "#f8fafc",
                  marginBottom:8, cursor:"pointer", transition:"all .15s" }}
                onClick={() => openBot(b)}>
                <div style={{ width:38, height:38, borderRadius:10, background:b.color, display:"flex",
                  alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14, flexShrink:0 }}>
                  {b.initials}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:"#1e293b" }}>{b.name}</div>
                  <div style={{ fontSize:11, color:"#94a3b8" }}>{b.url}</div>
                </div>
                {opened[b.id] ? (
                  <div style={{ display:"flex", alignItems:"center", gap:5, color:"#059669", fontSize:13, fontWeight:600 }}>
                    <i className="ti ti-check-circle" style={{ fontSize:18 }} /> Done — got response
                  </div>
                ) : (
                  <div style={{ display:"flex", alignItems:"center", gap:5, color:"#6366f1", fontSize:13, fontWeight:600 }}>
                    <i className="ti ti-external-link" style={{ fontSize:16 }} /> Click to open
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setStep(1)}
              style={{ padding:"11px 20px", borderRadius:10, border:"1px solid #e2e8f0", background:"#fff",
                color:"#64748b", fontWeight:500, fontSize:13, cursor:"pointer" }}>
              ← Back
            </button>
            <button onClick={() => setStep(3)}
              style={{ flex:1, padding:"11px", borderRadius:10, border:"none",
                background:"#6366f1", color:"#fff", fontWeight:600, fontSize:14, cursor:"pointer" }}>
              I have all responses — start scoring →
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 3: SCORE ─── */}
      {step === 3 && (
        <div>
          <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:10, padding:"10px 14px",
            marginBottom:16, fontSize:13, color:"#92400e" }}>
            <i className="ti ti-star" style={{ marginRight:7 }} />
            Rate each AI's response 1–5 stars on all 5 criteria. 5 = exceptional, 1 = poor.
          </div>

          {activeBots.map(b => (
            <div key={b.id}
              style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"16px 18px", marginBottom:12 }}>
              {/* Bot header */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, paddingBottom:12, borderBottom:"1px solid #f1f5f9" }}>
                <div style={{ width:36, height:36, borderRadius:9, background:b.color, display:"flex",
                  alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14 }}>
                  {b.initials}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:"#1e293b" }}>{b.name}</div>
                  <div style={{ fontSize:11, color:"#94a3b8" }}>Rate 1–5 stars per criterion</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:11, color:"#94a3b8" }}>Average</div>
                  <div style={{ fontSize:20, fontWeight:700, color:b.color }}>{getAvg(b.id)}</div>
                </div>
              </div>

              {/* Criteria */}
              {CRITERIA.map(c => (
                <div key={c.id}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"8px 0", borderBottom:"1px solid #f8fafc" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{c.label}</div>
                    <div style={{ fontSize:11, color:"#94a3b8" }}>{c.desc}</div>
                  </div>
                  <Stars value={scores[b.id][c.id]} onChange={val => setScore(b.id, c.id, val)} />
                </div>
              ))}

              {/* Notes */}
              <div style={{ marginTop:12 }}>
                <label style={{ fontSize:12, color:"#64748b", display:"block", marginBottom:5 }}>
                  Notes on {b.name}'s response
                </label>
                <textarea value={notes[b.id]}
                  onChange={e => setNotes(n => ({ ...n, [b.id]: e.target.value }))}
                  placeholder={`What was good or bad about ${b.name}'s answer?`}
                  rows={2}
                  style={{ width:"100%", border:"1px solid #e2e8f0", borderRadius:8, padding:"8px 10px",
                    fontSize:12, resize:"vertical", fontFamily:"inherit", boxSizing:"border-box" }} />
              </div>
            </div>
          ))}

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setStep(2)}
              style={{ padding:"11px 20px", borderRadius:10, border:"1px solid #e2e8f0", background:"#fff",
                color:"#64748b", fontWeight:500, fontSize:13, cursor:"pointer" }}>
              ← Back
            </button>
            <button onClick={() => setStep(4)}
              style={{ flex:1, padding:"11px", borderRadius:10, border:"none",
                background:"#6366f1", color:"#fff", fontWeight:600, fontSize:14, cursor:"pointer" }}>
              See results →
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 4: RESULTS ─── */}
      {step === 4 && (
        <div>
          {/* Winner banner */}
          {ranked[0] && ranked[0].avg > 0 && (
            <div style={{ background:"linear-gradient(135deg,#ecfdf5,#d1fae5)", border:"1px solid #6ee7b7",
              borderRadius:12, padding:"16px 20px", marginBottom:16, display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ fontSize:36 }}>🏆</div>
              <div>
                <div style={{ fontSize:13, color:"#065f46", fontWeight:500 }}>Best response this session</div>
                <div style={{ fontSize:22, fontWeight:700, color:"#059669" }}>{ranked[0].name}</div>
                <div style={{ fontSize:13, color:"#047857" }}>Overall score: {ranked[0].avg.toFixed(2)} / 5.00</div>
              </div>
            </div>
          )}

          {/* Score bars */}
          <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"18px 20px", marginBottom:14 }}>
            <h3 style={{ fontSize:14, fontWeight:600, color:"#1e293b", marginBottom:16 }}>Overall ranking</h3>
            {ranked.map((b, i) => {
              const pct = (b.avg / 5) * 100;
              const col = b.avg >= 4 ? "#059669" : b.avg >= 3 ? "#d97706" : "#dc2626";
              return (
                <div key={b.id} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:24, height:24, borderRadius:6, background: i===0?"#fef3c7":"#f1f5f9",
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700,
                        color: i===0?"#d97706":"#94a3b8" }}>
                        {i+1}
                      </div>
                      <div style={{ width:28, height:28, borderRadius:7, background:b.color, display:"flex",
                        alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:12 }}>
                        {b.initials}
                      </div>
                      <span style={{ fontSize:14, fontWeight:500, color:"#1e293b" }}>{b.name}</span>
                    </div>
                    <span style={{ fontSize:18, fontWeight:700, color:col }}>{b.avg.toFixed(2)}</span>
                  </div>
                  <div style={{ height:8, background:"#f1f5f9", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:b.color, borderRadius:4, transition:"width .6s" }} />
                  </div>
                  {notes[b.id] && (
                    <div style={{ marginTop:5, fontSize:12, color:"#64748b", fontStyle:"italic",
                      paddingLeft:10, borderLeft:"2px solid #e2e8f0" }}>
                      {notes[b.id]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Criteria breakdown table */}
          <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"18px 20px", marginBottom:14 }}>
            <h3 style={{ fontSize:14, fontWeight:600, color:"#1e293b", marginBottom:14 }}>Criteria breakdown</h3>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", fontSize:12, borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign:"left", padding:"6px 0 10px", color:"#64748b", fontWeight:500 }}>Criteria</th>
                    {activeBots.map(b => (
                      <th key={b.id} style={{ textAlign:"center", padding:"6px 8px 10px", color:b.color, fontWeight:600 }}>
                        {b.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CRITERIA.map(c => (
                    <tr key={c.id} style={{ borderTop:"1px solid #f1f5f9" }}>
                      <td style={{ padding:"8px 0", color:"#374151", fontWeight:500, fontSize:12 }}>{c.label}</td>
                      {activeBots.map(b => {
                        const v = scores[b.id][c.id];
                        const col = v>=4?"#059669":v>=3?"#d97706":v>0?"#dc2626":"#cbd5e1";
                        return (
                          <td key={b.id} style={{ textAlign:"center", padding:"8px" }}>
                            <span style={{ fontWeight:700, color:col, fontSize:15 }}>{v || "—"}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Winner + summary */}
          <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"18px 20px", marginBottom:14 }}>
            <h3 style={{ fontSize:14, fontWeight:600, color:"#1e293b", marginBottom:14 }}>Final verdict</h3>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, color:"#64748b", display:"block", marginBottom:8 }}>Confirm best bot</label>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {activeBots.map(b => (
                  <button key={b.id} onClick={() => setWinner(b.name)}
                    style={{ padding:"7px 16px", borderRadius:20,
                      border:`1.5px solid ${winner===b.name ? "#059669" : "#e2e8f0"}`,
                      background: winner===b.name ? "#ecfdf5" : "#fff",
                      color: winner===b.name ? "#059669" : "#64748b",
                      fontWeight: winner===b.name ? 700 : 400, fontSize:13, cursor:"pointer" }}>
                    {winner===b.name && "✓ "}{b.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize:12, color:"#64748b", display:"block", marginBottom:6 }}>Overall notes</label>
              <textarea value={summary} onChange={e => setSummary(e.target.value)}
                placeholder="What were the key differences between the responses? What stood out?"
                rows={3}
                style={{ width:"100%", border:"1px solid #e2e8f0", borderRadius:8, padding:"10px 12px",
                  fontSize:13, resize:"vertical", fontFamily:"inherit", boxSizing:"border-box" }} />
            </div>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setStep(3)}
              style={{ padding:"11px 20px", borderRadius:10, border:"1px solid #e2e8f0", background:"#fff",
                color:"#64748b", fontWeight:500, fontSize:13, cursor:"pointer" }}>
              ← Adjust scores
            </button>
            <button onClick={handleSave}
              style={{ flex:1, padding:"11px", borderRadius:10, border:"none",
                background:"#059669", color:"#fff", fontWeight:600, fontSize:14, cursor:"pointer" }}>
              <i className="ti ti-device-floppy" style={{ marginRight:7 }} />Save to history
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
