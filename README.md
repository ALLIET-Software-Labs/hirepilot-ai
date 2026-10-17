# ApplyForge AI — Premium AI Career Preparation Platform
### Built by [Alliet Software Labs](https://alliet.company/)

> **An open-source, privacy-first career copilot powered by 100% on-device local AI.**  
> Transform any job description into an ATS-aligned resume, verified company research, role-specific interview answers, and an actionable 0–100% preparation checklist without sending sensitive career data to the cloud.
>
> **Website:** [https://alliet.company/](https://alliet.company/)  
> **Contact:** [contact@alliet.company](mailto:contact@alliet.company)  
> **Emblem & Identity:** Open-Source Release by Alliet Software Labs

---

## 1. Product Overview

**ApplyForge AI** acts as a focused career copilot, replacing generic chatbots with an architectural workflow engineered for precision, truthfulness, and privacy:

1. **Resume & Job Ingestion:** Upload an existing resume (`.pdf`, `.docx`, `.txt`) and paste the target job description. Contact information and candidate experience are parsed locally.
2. **Fact-Grounded Analysis & Gap Audit:** Compares verified resume qualifications against target JD competencies. Distinguishes confirmed skills from missing requirements.
3. **Contextual Clarifications:** Surfaces high-value follow-up questions only when additional details (scale, metrics, versions) meaningfully elevate ATS alignment. Users can answer or skip any question.
4. **Tailored ATS Resume Studio:** Synthesizes an ATS-friendly single-column resume with action-verb-context-impact bullets without fabricating candidate credentials. Shows JD keyword coverage and exports to pristine **PDF (Print)** and **Microsoft Word (.docx)**.
5. **Verified Company Research & Live Citations:** Conducts real web searches (via DuckDuckGo or configurable Tavily API) to identify company tech stacks, mission, and publicly reported interview questions, linking live source URLs.
6. **STAR Interview Preparation:** Generates realistic interview questions across 6 core categories with structured answers, interviewer assessment rationale, and revision topics.
7. **0–100% Readiness Checklist:** Prioritized study plan (High/Medium/Low priority) with concrete hands-on revision tasks and persistent local progress tracking with milestone celebration.

---

## 2. Zero-Telemetry Privacy Architecture

- **100% Local Inference:** Core resume parsing, gap auditing, resume tailoring, interview answer generation, and checklist roadmaps run entirely on-device via **Ollama** and the **`gemma3:4b`** model (`http://localhost:11434`).
- **No Resume Uploads:** Your resume, contact details, career history, and answers are **never** transmitted to any cloud LLM or third-party server.
- **Isolated Web Searches:** Company web research transmits **only** the company name and job title query keywords (e.g. `Stripe developer platform interview questions`) to search engines—never candidate text or PII.
- **Local Persistence:** All application state, tailored resumes, and preparation checklist progress are stored locally in the browser (`localStorage`).

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS (editorial minimalism theme), Lucide React, Canvas Confetti.
- **Backend:** Python 3.11+, FastAPI, Uvicorn, Pydantic, HTTPX.
- **Resume Parsing:** `pypdf` (PDF extraction), `python-docx` (DOCX extraction and generation).
- **DOCX Generation:** `python-docx` for native ATS-standard single-column Word document export.
- **Web Research:** Real-time web search with clickable citations via `ddgs` (DuckDuckGo fallback) and optional `Tavily Search API`.
- **Local AI:** Ollama running the `gemma3:4b` model locally at `http://localhost:11434`.

---

## 4. Prerequisites

1. **Python 3.11+** installed and added to PATH.
2. **Node.js v20+** and **npm** installed.
3. **Ollama** installed with `gemma3:4b`:
   ```powershell
   # Verify Ollama is installed and running
   ollama --version
   ollama list

   # If gemma3:4b is not yet pulled:
   ollama pull gemma3:4b
   ```

---

## 5. Quick Start (Windows PowerShell)

### Step 1: Clone or Navigate to Directory
```powershell
cd "c:\Users\home\Downloads\ApplyForge AI"
```

### Step 2: Configure Environment (Optional)
Copy the example environment configuration:
```powershell
Copy-Item .env.example .env
```
*(Optional: If you have a Tavily Search API key, add `TAVILY_API_KEY=your_key` to `.env`. Otherwise, ApplyForge AI uses the built-in DuckDuckGo search fallback automatically).*

### Step 3: Run the Backend Service (FastAPI)
In a PowerShell window:
```powershell
# Install backend dependencies (if not already installed)
python -m pip install fastapi "uvicorn[standard]" pydantic python-multipart httpx pypdf python-docx ddgs python-dotenv

# Start the FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs on: `http://127.0.0.1:8000` (API docs at `http://127.0.0.1:8000/docs`).*

### Step 4: Run the Frontend Application (Vite React)
In a second PowerShell window:
```powershell
cd "c:\Users\home\Downloads\ApplyForge AI\frontend"

# Install frontend dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
*Open your browser and navigate to: **`http://127.0.0.1:5173/`**.*

---

## 6. Verification and Testing Performed

All components of ApplyForge AI have been empirically verified and tested:

| Workflow / Component | Test Performed | Result |
| :--- | :--- | :--- |
| **Ollama Connectivity** | Verified `gemma3:4b` availability on `http://localhost:11434/api/tags` | **PASS** — Model ready and responsive |
| **Backend API Health** | `GET /api/health` checked | **PASS** — Returns healthy status, model availability, and search provider |
| **Live Web Research** | Queried `Stripe` software engineering interview questions | **PASS** — Returned 7 verified search citations with live Wikipedia and official URLs |
| **Resume & JD Analysis** | `POST /api/analyze` executed with verified candidate resume vs Stripe JD | **PASS** — Accurately detected confirmed skills, identified missing `Redis` gap, and formulated contextual clarification questions |
| **Checklist Generation** | `POST /api/checklist` executed with role gaps | **PASS** — Generated 9 prioritized preparation items with hands-on practice tasks |
| **ATS DOCX Export** | `POST /api/export-docx` executed | **PASS** — Generated 37KB valid single-column ATS Word document adhering to ATS guidelines |
| **Frontend Production Build** | `npm run build` executed in `frontend/` | **PASS** — Zero TypeScript or bundling errors, generated clean CSS & JS assets |

---

## 7. Project Architecture

```
ApplyForge AI/
├── backend/
│   ├── __init__.py
│   ├── main.py              # FastAPI application server and REST endpoints
│   ├── ollama_client.py     # Local Ollama client with gemma3:4b structured prompt templates
│   ├── resume_parser.py     # PDF, DOCX, and TXT parsing with contact heuristic extraction
│   ├── docx_generator.py    # Native ATS-compliant single-column Word document generator
│   └── search_service.py    # Privacy-isolated web research service (Tavily + DuckDuckGo fallback)
├── frontend/
│   ├── index.html           # HTML5 entry with Google Fonts (Outfit, Inter, JetBrains Mono)
│   ├── package.json         # React 19, Vite, Lucide React, Tailwind CSS
│   ├── tailwind.config.js   # Custom editorial minimalism design tokens
│   ├── src/
│   │   ├── App.tsx          # Main workflow state coordinator and step router
│   │   ├── main.tsx         # React root mounting
│   │   ├── index.css        # Tailwind directives and ATS @media print stylesheet
│   │   ├── types/index.ts   # TypeScript interfaces for resume, analysis, and checklist data
│   │   ├── services/
│   │   │   ├── api.ts       # REST client for backend endpoints
│   │   │   └── storage.ts   # LocalStorage persistence for recent applications & progress
│   │   ├── data/sampleData.ts # Demo Staff Engineer resume and Stripe JD for 1-click testing
│   │   └── components/
│   │       ├── Navbar.tsx             # Wordmark branding, active role, and Ollama status pill
│   │       ├── LandingWorkspace.tsx   # Editorial hero, recent sessions, and feature pillars
│   │       ├── JobSetupView.tsx       # Drag-and-drop resume upload & JD textarea
│   │       ├── AnalysisView.tsx       # Heuristic match score, verified skills vs gaps, and clarifications
│   │       ├── ResumeStudioView.tsx   # Virtual paper ATS canvas, inline editing, and exports
│   │       ├── InterviewPrepView.tsx  # Verified research citations & categorized STAR questions
│   │       ├── ChecklistView.tsx      # 0–100% preparation progress, task cards, and celebration
│   │       └── LocalAiStatusModal.tsx # Privacy boundary disclosure and model diagnostics
├── DESIGN.md                # Spec-compliant design system specification
├── .env.example             # Configuration placeholders
├── .gitignore               # Excludes secrets, node_modules, caches, and candidate uploads
└── README.md                # Comprehensive documentation
```

---

## 8. Known Limitations & Notes

- **Initial Inference Warm-up:** On cold boot, loading `gemma3:4b` weights into memory may take 15–30 seconds. Subsequent generations are fast (~10–20 seconds).
- **ATS Disclaimer:** Keyword match coverage is a heuristic alignment estimation. ApplyForge AI never claims a resume is "guaranteed" to pass automated screening.
- **Checklist 100% Completion:** Achieving 100% on the preparation checklist indicates the candidate has reviewed all planned topics and exercises; it does not measure or guarantee live interview performance.

---

## 9. Credits & Maintainers

**ApplyForge AI** is proudly created and open-sourced by **[Alliet Software Labs](https://alliet.company/)**.

- **Organization:** Alliet Software Labs
- **Official Website:** [https://alliet.company/](https://alliet.company/)
- **Inquiries & Support:** [contact@alliet.company](mailto:contact@alliet.company)
- **License:** Open Source under the MIT License

