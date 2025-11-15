<img width="1104" height="639" alt="{1AEBB550-3E8D-40BD-B4A7-0D42D4ADA5D4}" src="https://github.com/user-attachments/assets/4e8936ad-7206-48ba-9ce2-c5202ece5e80" />

# Aegis - Trust Evaluation Platform
**"Security decisions in seconds"** - Aegis is an AI-powered security assessment platform that automates vendor trust evaluations. It generates instant, source-grounded reports with transparent trust scores, and includes an interactive chat agent to provide further insights and answer specific questions, enabling security teams to make fast, informed decisions.

## 🚀 Overview 
![Structural Diagram](https://github.com/user-attachments/assets/7266272e-81c7-4d69-935d-c50dfad74c58)
Aegis consists of two main components:
 - **Web-Client** (```junction-app/```) - A next.js web application providing an easy to use interface to evaluate products, discuss the evaluation with an agent, and a vault giving oversight over prior scoring.
 - **Deep Research Agent** (```deep_security/```) - An agent based on OpenAi & Langgraph, utilizing various specialist API's to thoroughly investigate the product provided.   

## Highlights
 - **🔒 Firebase Auth + Profiles** – Email/password and Google SSO with enriched user metadata captured in Firestore.
 - **📥 Submission Hub** – Text prompt + binary upload workflow for requesting assessments.
 - **🤖 Multi-LLM Research Agent** – Configurable OpenAI/Anthropic stacks for summarize→research→compress→report loops.
 - **🔎 Search + MCP Integrations** – Pluggable Tavily, OpenAI native search, Anthropic native search, and custom MCP toolchains.
 - **📊 Reports Vault** – High-signal trust brief cards with risk tags, source counts, and sharing links.
 - **🧪 Benchmark Harness** – Pre-wired Deep Research Bench evaluation scripts to validate agent quality.
## 🏗️ Project Structure
```
junction-hack/
├── junction-app/                # Next.js frontend│   
├── app/                     # App Router routes (landing, auth, dashboard, reports)│   
├── components/              # Shared UI (AppChrome, landing sections)
│   ├── contexts/AuthContext.tsx # Client-side auth/session provider
│   ├── lib/firebase.ts          # Firebase initialization
│   ├── public/                  # Static assets
│   └── README.md
├── deep_security/               # LangGraph / Open Deep Research backend
│   ├── src/open_deep_research/  # Config + runtime
│   ├── src/security/            # Auth helpers
│   ├── tests/                   # Benchmark + evaluation scripts
│   ├── README.md
│   └── pyproject.toml
└── example_data.csv             # Sample assessment data
```
## 🎨 Frontend (Next.js)
Modern App Router experience focusing on security analyst workflows:
 - Tech Stack: Next.js 15, TypeScript, Tailwind, shadcn/ui, Lucide icons.
 - Auth Flow: ```AuthContext``` wraps Firebase Auth; guards dashboard and reports routes.
 - Key Screens:
   - Landing page with hero/demo/trust-score highlights.
   - ```/auth``` multi-step login/register with Google SSO fallback.
   - ```/dashboard``` submission form (text + file upload) and quick links to reports.
   - ```/reports``` gallery of trust briefs with status, sources, and risk chips.
## ⚙️ Deep Research Service
LangGraph-backed agent toolbox housed in ```deep_security/```:
 - Configuration Surface: ```src/open_deep_research/configuration.py``` exposes sliders/toggles for structured-output retries, concurrency, model choices, search providers, and MCP settings.
 - Model Pipeline: Separate slots for summarization, researcher, compression, and final-report models (defaults to OpenAI ```gpt-4.1``` / ```gpt-4.1-mini```, but swappable to Anthropic, GPT-5, etc.).
 - Search & MCP: Built-in support for Tavily, OpenAI native, Anthropic native search plus external MCP servers for custom tools/data.
 - Evaluation: ```tests/run_evaluate.py``` and ```tests/extract_langsmith_data.py``` automate Deep Research Bench submissions (LangSmith integration).
## 🧭 Data Flow
 1. User Authenticates – Firebase Auth session hydrates ```AuthContext```.
 2. Submission – Dashboard posts text/binary payload to a Next.js API route or edge function (placeholder today).
 3. Assessment Orchestration – API proxies request to LangGraph runtime (Deep Research service).
 4. LLM + Search Loop – Agent fans out to configured LLMs, search APIs, and MCP tools, storing intermediate notes.
 5. Report Storage – Final trust brief, scores, and citation metadata saved back to Firestore.
 6. Consumption – Reports UI reads Firestore entries for sharing/export.
## 🚀 Quick Start
### Prerequisites
 - Node.js 18+ (or Bun), npm/yarn/pnpm.
 - Python 3.11, ```uv``` or ```pip```.
 - Firebase project (Auth + Firestore) + service credentials.
 - OpenAI and/or Anthropic API keys (plus Tavily key if using default search).
 - LangSmith account if running benchmarks.
### Frontend Setup
```
cd junction-app
cp .env.example .env.local   # fill Firebase + API vars
npm installnpm
run dev
```
Visit [http://localhost:3000](http://localhost:3000).
### Backend Setup
```
cd deep_securityuv venv && source .venv/bin/activate    # or python -m venvuv 
sync                                 # installs LangChain/LangGraph dep
scp .env.example .env                    # configure LLM/search/MCP keys
uvx --from "langgraph-cli[inmem]" langgraph dev --allow-blocking
```
LangGraph Studio UI available at the printed URL (default [http://127.0.0.1:2024)](http://127.0.0.1:2024)).
## 🛠️ Environment Variables
|Component|	Variable|	Description|
|--|--|--|
|junction-app|	NEXT_PUBLIC_FIREBASE_*|	Firebase web config (auth domain, project ID…)|
||NEXT_PUBLIC_ASSESSMENT_API_URL|	(Future) API route for submissions|
|deep_security|	SUMMARIZATION_MODEL, RESEARCH_MODEL…	|Override default LLMs per stage|
||SEARCH_API|	tavily, openai, anthropic, or none|
||MCP_CONFIG_URL, MCP_CONFIG_TOOLS	|Optional MCP server info|
|Shared	|OPENAI_API_KEY, ANTHROPIC_API_KEY	|Provider credentials|
|Shared|	TAVILY_API_KEY	Web |search enrichment|
## 📚 Documentation
- ```junction-app/README.md``` – Frontend development tips.
- ```deep_security/README.md``` – LangGraph configuration, benchmarking, LangSmith usage.
- LangChain docs for MCP + multi-provider LLM setup.
- Firebase docs for Auth/Firestore provisioning.
## 🚢 Deployment
| Layer |	Recommended Target |
|--|--|
|Frontend	|Vercel / Netlify (set Firebase/public env vars)|
|API Routes |	Vercel Edge Functions or Next.js serverless runtime|
|LangGraph|	Dockerized service on cloud VM or LangGraph Platform|
|Firebase	|Managed (Auth + Firestore)|
 1. Build frontend: ```npm run build``` → deploy.
 2. Package LangGraph service with ```uv``` + ```langgraph dev``` or containerize for production.
 3. Wire API route to call LangGraph service; secure with bearer tokens.
 4. Point frontend env vars to production endpoints.
## 🧪 Testing & Evaluation
 - Frontend: ```npm run lint``` / ```npm run test``` (if configured) plus manual UI smoke tests.
 - Backend: Run ```python tests/run_evaluate.py``` for Deep Research Bench; extract results via tests/extract_langsmith_data.py.
 - Integration: Validate that Firestore entries appear when manual assessments are triggered (mock API route until backend is wired).
## 🤝 Contributing
 1. Fork and branch (```git checkout -b feature/<name>```).
 2. Keep frontend TypeScript strict and follow existing Tailwind patterns.
 3. For backend changes, update ```configuration.py``` docs + README when adding config knobs.
 4. Add tests or LangSmith eval notes for new research behaviors.
 5. Submit PR with a concise summary and screenshots if UI-related.
## 📄 License
MIT – see LICENSE.
## 🙋 Support & Questions
Open an issue in this repo.
Check LangGraph + Firebase docs linked above.
Reach out on project Slack/Discord (if applicable) for architecture questions.
