import { useState } from "react";

const PROMPTS = [
  { cat:"Customer Service",         diff:"Easy",   goal:"Reply drafting",       text:"How should I handle a negative Google review from a customer who claims they never received their order, but our tracking shows it was delivered?" },
  { cat:"Customer Service",         diff:"Medium",  goal:"Policy writing",       text:"Write a complete refund and returns policy for a small online handmade jewellery shop. Make it clear, fair and customer-friendly." },
  { cat:"Customer Service",         diff:"Hard",    goal:"De-escalation",        text:"A loyal 5-year customer is threatening to leave and post negative reviews unless I give them a permanent 40% discount. How do I handle this professionally?" },
  { cat:"Marketing & Social Media", diff:"Easy",   goal:"Content creation",     text:"Write 5 Instagram captions for a local bakery promoting a weekend croissant sale. Include relevant hashtags and a strong call to action." },
  { cat:"Marketing & Social Media", diff:"Medium",  goal:"Strategy",             text:"Create a 30-day social media content calendar for a home cleaning service targeting working parents in a suburban area." },
  { cat:"Marketing & Social Media", diff:"Hard",    goal:"Crisis PR",             text:"Our food truck got a viral TikTok video with 1.2M views claiming we served undercooked food. Draft a full public response strategy." },
  { cat:"Financial Planning",       diff:"Easy",   goal:"Budgeting",            text:"Create a simple monthly budget template for a small café with 4 employees that tracks revenue, COGS, labour, rent and utilities." },
  { cat:"Financial Planning",       diff:"Medium",  goal:"Pricing",              text:"I run a freelance graphic design studio. How should I calculate and set my hourly rate? Walk me through it step by step." },
  { cat:"Financial Planning",       diff:"Hard",    goal:"Cash flow analysis",   text:"My retail store has $12,000 monthly revenue but only $800 profit. Identify the most likely causes and give me a prioritised action plan." },
  { cat:"HR & Hiring",              diff:"Easy",   goal:"Job description",      text:"Write a job description for a part-time social media manager for a local gym. Budget is $900/month for 20 hours per week." },
  { cat:"HR & Hiring",              diff:"Medium",  goal:"Interview process",    text:"Create a structured interview process with questions and a scoring rubric for hiring a customer service representative for an e-commerce shop." },
  { cat:"HR & Hiring",              diff:"Hard",    goal:"Team conflict",         text:"Two of my best employees are in open conflict and it is affecting the whole team's morale. I cannot afford to lose either of them. What do I do?" },
  { cat:"Legal & Compliance",       diff:"Easy",   goal:"Contract drafting",    text:"Draft a simple freelance contract template for a photographer covering payment terms, image usage rights, revision rounds and cancellation policy." },
  { cat:"Legal & Compliance",       diff:"Medium",  goal:"Privacy compliance",   text:"What data privacy regulations apply to a small e-commerce store that collects customer emails in the UK and EU?" },
  { cat:"Legal & Compliance",       diff:"Hard",    goal:"Dispute resolution",   text:"A contractor I paid $3,000 delivered work that does not match our agreed scope and is refusing to revise it. What are my legal options?" },
  { cat:"Market Research",          diff:"Easy",   goal:"Competitor analysis",  text:"Give me a framework for analysing 3 local competitors for my new smoothie bar. What should I look at and how do I compare them?" },
  { cat:"Market Research",          diff:"Medium",  goal:"Customer research",    text:"I want to understand why customers choose competitors over me. Write a 10-question customer survey I can send via email." },
  { cat:"Market Research",          diff:"Hard",    goal:"Market sizing",         text:"How do I estimate the total addressable market for a mobile pet grooming service in a city of 500,000 people?" },
  { cat:"Sales & Pricing",          diff:"Easy",   goal:"Cold email",           text:"Write a 3-email cold outreach sequence for a B2B cleaning company targeting small law offices within 10 miles of their location." },
  { cat:"Sales & Pricing",          diff:"Medium",  goal:"Pricing strategy",     text:"I am losing customers to a cheaper competitor. Should I match their prices, differentiate on quality, or do something else entirely? Analyse all my options." },
  { cat:"Sales & Pricing",          diff:"Hard",    goal:"Sales funnel",          text:"Design a complete sales funnel for a $497 online bookkeeping course for self-employed freelancers, from traffic to close." },
  { cat:"Inventory & Operations",   diff:"Easy",   goal:"Checklist",            text:"Create a daily opening and closing checklist for a small coffee shop with 3 staff members." },
  { cat:"Inventory & Operations",   diff:"Medium",  goal:"Inventory system",     text:"I am running out of some products too fast while overstocking others. How do I set up a simple reorder point system for my boutique clothing shop?" },
  { cat:"Inventory & Operations",   diff:"Hard",    goal:"Supply chain",          text:"My main supplier just raised prices by 22% with only 2 weeks notice. What are all my options? Give me a prioritised action plan." },
];

const CATS  = ["All", ...new Set(PROMPTS.map(p => p.cat))];
const DIFFS = ["All", "Easy", "Medium", "Hard"];
const DIFF_COLORS = { Easy:"#059669", Medium:"#d97706", Hard:"#dc2626" };

export default function PromptLibrary({ onUse }) {
  const [cat,    setCat]    = useState("All");
  const [diff,   setDiff]   = useState("All");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(null);

  const filtered = PROMPTS.filter(p =>
    (cat  === "All" || p.cat  === cat) &&
    (diff === "All" || p.diff === diff) &&
    (!search || p.text.toLowerCase().includes(search.toLowerCase()) ||
                p.goal.toLowerCase().includes(search.toLowerCase()))
  );

  const copy = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ padding:"28px 32px" }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:"#1e293b", margin:0 }}>Prompt Library</h1>
        <p style={{ color:"#64748b", fontSize:13, margin:"4px 0 0" }}>{PROMPTS.length} ready-to-use SMB evaluation prompts</p>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <i className="ti ti-search" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", fontSize:15 }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search prompts..."
            style={{ width:"100%", padding:"9px 12px 9px 34px", border:"1px solid #e2e8f0", borderRadius:9, fontSize:13, boxSizing:"border-box" }} />
        </div>
        <select value={cat} onChange={e => setCat(e.target.value)}
          style={{ padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:9, fontSize:13, color:"#374151" }}>
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
        <div style={{ display:"flex", gap:6 }}>
          {DIFFS.map(d => (
            <button key={d} onClick={() => setDiff(d)}
              style={{ padding:"7px 14px", borderRadius:20,
                border:`1.5px solid ${diff===d ? (DIFF_COLORS[d]||"#6366f1") : "#e2e8f0"}`,
                background: diff===d ? ((DIFF_COLORS[d]||"#6366f1")+"18") : "#fff",
                color: diff===d ? (DIFF_COLORS[d]||"#6366f1") : "#64748b",
                fontSize:12, fontWeight: diff===d ? 600 : 400, cursor:"pointer" }}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize:12, color:"#94a3b8", marginBottom:12 }}>{filtered.length} prompts</div>

      <div style={{ display:"grid", gap:10 }}>
        {filtered.map((p, i) => (
          <div key={i} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"14px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10, flexWrap:"wrap" }}>
              <span style={{ fontSize:11, padding:"3px 8px", borderRadius:6, background:"#eef2ff", color:"#6366f1", fontWeight:500 }}>{p.cat}</span>
              <span style={{ fontSize:11, padding:"3px 8px", borderRadius:6,
                background: DIFF_COLORS[p.diff]+"18", color: DIFF_COLORS[p.diff], fontWeight:500 }}>{p.diff}</span>
              <span style={{ fontSize:11, color:"#94a3b8" }}>Goal: {p.goal}</span>
              <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
                <button onClick={() => copy(p.text, i)}
                  style={{ padding:"5px 11px", borderRadius:7, border:"1px solid #e2e8f0", background:"#fff",
                    color: copied===i ? "#059669" : "#64748b", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                  <i className={`ti ${copied===i ? "ti-check" : "ti-copy"}`} style={{ fontSize:13 }} />
                  {copied===i ? "Copied" : "Copy"}
                </button>
                <button onClick={() => onUse(p.text)}
                  style={{ padding:"5px 11px", borderRadius:7, border:"1px solid #6366f1", background:"#eef2ff",
                    color:"#6366f1", fontSize:12, cursor:"pointer", fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
                  <i className="ti ti-player-play" style={{ fontSize:13 }} />Use
                </button>
              </div>
            </div>
            <p style={{ fontSize:13, color:"#374151", lineHeight:1.65, margin:0 }}>{p.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
