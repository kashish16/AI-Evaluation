# 🤖 AI Eval Hub — SMB Response Evaluator

> Type your prompt **once** → open ChatGPT, Claude, Gemini, Copilot & Meta AI with one click → paste and collect responses → score them side by side → get ranked results with charts → export CSV.

---

## 🎯 The Problem This Solves

Traditional AI evaluation means:
1. Open ChatGPT → paste prompt → copy response somewhere
2. Open Claude → paste same prompt → copy response
3. Repeat for Gemini, Copilot, Meta AI…
4. Try to compare 5 responses in a messy document

**This tool fixes all of that in one place.**

---

## ✨ How It Works (4 Steps)

```
Step 1 → Write your prompt once
Step 2 → Click to open each AI chat in a new tab, paste, get responses
Step 3 → Come back and rate each response 1–5 stars across 5 criteria
Step 4 → See ranked results, bar chart, criteria table → export CSV
```

---

## 📋 Scoring Criteria (1–5 stars each)

| Criterion | What it measures |
|---|---|
| **Clarity** | Easy to understand for a non-technical business owner? |
| **Accuracy** | Factually correct and reliable? |
| **Usefulness** | Actually solves the problem at hand? |
| **Specificity** | Tailored to small business context, not generic? |
| **Actionable** | Can the user implement this right now? |

**Overall score** = average of all 5 criteria.

---

## 🗂 Pages

| Page | What it does |
|---|---|
| **Evaluate** | The 4-step evaluation workflow |
| **Prompt Library** | 24 ready-to-use SMB prompts, filterable by category & difficulty |
| **History** | All past sessions, expandable, searchable, exportable |
| **Reports** | Bar chart, radar chart, criteria table, win rates, CSV/JSON export |

---

## 🚀 Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/ai-eval-hub.git
cd ai-eval-hub
npm install
npm run dev
# Open http://localhost:5173
```

## Deploy to GitHub Pages (free, auto)

1. Push to GitHub
2. Go to **Settings → Pages → Source → GitHub Actions**
3. Done — auto-deploys on every push to `main`

---

## 🧰 Tech Stack

| Tech | Why |
|---|---|
| React 18 | Component-based, clean state management per step |
| Vite | Instant dev server, tiny production build |
| localStorage | No backend — sessions persist privately in browser |
| Vanilla SVG | Custom bar + radar charts, zero chart library dependencies |
| Tabler Icons | Clean icon set via CDN |

---

## 📊 Business Categories Covered

Marketing & Social Media • Customer Service • Financial Planning • HR & Hiring • Legal & Compliance • Market Research • Sales & Pricing • Inventory & Operations

---

## 📄 License
MIT — free to use, fork and adapt.
