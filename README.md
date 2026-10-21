# HirePilot AI — Private, Grounded AI Career Preparation Platform
### Created and Open-Sourced by [Alliet Software Labs](https://alliet.company/)

[![GitHub: ALLIET-Software-Labs/hirepilot-ai](https://img.shields.io/badge/GitHub-ALLIET--Software--Labs%2Fhirepilot--ai-181717.svg?logo=github)](https://github.com/ALLIET-Software-Labs/hirepilot-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Privacy: 100% Local](https://img.shields.io/badge/Privacy-100%25_On--Device-emerald.svg)](#zero-telemetry-privacy-architecture)
[![Model: gemma3:4b](https://img.shields.io/badge/Model-gemma3:4b-purple.svg)](https://ollama.com/library/gemma3)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-teal.svg)](https://fastapi.tiangolo.com/)
[![Frontend: React 19 + Vite](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB.svg)](https://vitejs.dev/)
[![Maintained by: Alliet Software Labs](https://img.shields.io/badge/Maintained%20by-Alliet%20Software%20Labs-080E24.svg)](https://alliet.company/)

> **An open-source, zero-fabrication career preparation platform powered by 100% on-device local AI.**  
> Transform any job description and resume into a role-targeted ATS resume, mathematical gap audit, verified company research, situational interview answers, and an actionable 0–100% readiness checklist—without sending your confidential career history to cloud servers.
>
> 🌐 **Website:** [https://alliet.company/](https://alliet.company/)  
> 📂 **GitHub Repository:** [https://github.com/ALLIET-Software-Labs/hirepilot-ai](https://github.com/ALLIET-Software-Labs/hirepilot-ai)  
> ✉️ **Contact:** [contact@alliet.company](mailto:contact@alliet.company)  
> 💡 **Emblem & Brand:** Official Open-Source Project by Alliet Software Labs

---

## Table of Contents
1. [Why HirePilot AI?](#1-why-hirepilot-ai)
2. [Key Capabilities & Architecture](#2-key-capabilities--architecture)
3. [Zero-Telemetry Privacy Architecture](#3-zero-telemetry-privacy-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Prerequisites](#5-prerequisites)
6. [Quick Start Guide](#6-quick-start-guide)
7. [Step-by-Step Workflow](#7-step-by-step-workflow)
8. [Project Structure](#8-project-structure)
9. [Contributing Guidelines](#9-contributing-guidelines)
10. [FAQ & Troubleshooting](#10-faq--troubleshooting)
11. [License & Credits](#11-license--credits)

---

## 1. Why HirePilot AI?

Most AI resume tools act as generic chat wrappers: they hallucinate skills you don't have, flatten rich career history into tiny one-bullet summaries, and send your sensitive contact and employment history to proprietary third-party clouds.

**HirePilot AI** was built to solve these fundamental flaws:

* **Zero-Fabrication Guarantee:** Strictly grounds every bullet, summary sentence, and interview answer in candidate-verified facts. It will never invent jobs, degrees, or imaginary tools.
* **Mathematically Calibrated ATS Scoring:** Computes realistic, dynamic ATS match percentages based on verified competency ratios, priority gap weighting, experience seniority checks, and lexical keyword density—no hardcoded 85% hallucinations.
* **Dynamic Resume Expansion:** Scales dynamically with your experience. Generates 3–5 high-impact bullets per work experience and 2–4 detailed technical bullets per project, preserving all your real achievements.
* **100% On-Device Privacy:** All inference runs on your machine via [Ollama](https://ollama.com/) with Google DeepMind's `gemma3:4b`. Your career data never leaves your computer.
* **Real Web Intelligence:** Conducts verified live company web searches with source citations for interview preparation without exposing personal candidate details to search engines.

---

## 2. Key Capabilities & Architecture

| Module | Core Functionality | Output Format |
| :--- | :--- | :--- |
| **Resume & JD Ingestion** | Local parsing of PDF, DOCX, and TXT resumes with automatic contact and profile link heuristics. | Clean extracted text & metadata |
| **Role Alignment Audit** | Mathematical ATS fit scoring, confirmed skills vs identified gaps (High / Medium / Low priority). | Visual score gauge & audit cards |
| **Contextual Clarifications** | Generates targeted follow-up questions only when details (scale, metrics, versions) elevate ATS score. | Optional interactive Q&A |
| **ATS Resume Studio** | Synthesizes an ATS-compliant single-column resume with action-verb + impact formulas. | Editable canvas, PDF print, native DOCX |
| **Company Web Research** | Real web search identifying company tech stacks, mission, and reported interview questions. | Live citations with source links |
| **STAR Interview Prep** | Role-specific technical, behavioral, and architectural questions with structured sample answers. | Categorized accordion with copy-to-clipboard |
| **0–100% Prep Checklist** | Prioritized study roadmap with hands-on practice tasks and progress tracking. | Interactive checkboxes & confetti milestones |

---

## 3. Zero-Telemetry Privacy Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │                 LOCAL MACHINE BOUNDARY                 │
                    │                                                        │
Candidate Resume ──►│  HirePilot Frontend (React 19 + Vite)                  │
Job Description  ──►│          │                                             │
                    │          ▼                                             │
                    │  HirePilot Backend (FastAPI Python)                    │
                    │          │                                             │
                    │          ▼                                             │
                    │  Ollama Inference (gemma3:4b at localhost:11434)      │
                    │  • Resume Parsing & Gap Analysis                       │
                    │  • Dynamic Resume Tailoring                            │
                    │  • Interview & Checklist Synthesis                     │
                    │                                                        │
                    └──────────────────────────┬─────────────────────────────┘
                                               │ (Only search query: e.g. "Stripe engineering tech stack")
                                               ▼
                              ┌──────────────────────────────────┐
                              │ Privacy-Isolated Web Search Engine│
                              │ (DuckDuckGo or optional Tavily)  │
                              └──────────────────────────────────┘
```

- **Zero Cloud LLMs:** All reasoning, parsing, and tailoring run locally on port `11434`.
- **Zero Candidate PII Exfiltration:** Candidate names, phone numbers, email addresses, and work history are strictly prevented from reaching any search query.
- **Local State Persistence:** All application sessions, progress checklists, and draft edits are stored exclusively in your browser's `localStorage`.

---

## 4. Technology Stack

- **Frontend:**
  - React 19 (TypeScript)
  - Vite 8 (Ultra-fast HMR and bundle optimization)
  - Tailwind CSS (Warm Ivory editorial minimalism design system)
  - Lucide React (Crisp iconography)
  - Canvas Confetti (Milestone celebration animations)
- **Backend:**
  - Python 3.10+
  - FastAPI & Uvicorn (Asynchronous high-performance REST APIs)
  - Pydantic v2 (Strict schema validation)
  - HTTPX (Asynchronous local Ollama client)
  - `pypdf` & `python-docx` (Native binary document parsing and generation)
  - `ddgs` (DuckDuckGo Search) & optional `tavily-python`
- **Local AI Engine:**
  - [Ollama](https://ollama.com/) running `gemma3:4b` locally

---

## 5. Prerequisites

Before installing HirePilot AI, ensure you have the following installed on your system:

1. **Python 3.10 or newer** (verify with `python --version`)
2. **Node.js 18 or newer** (verify with `node --version`)
3. **Ollama**:
   - Download and install Ollama from [https://ollama.com/download](https://ollama.com/download)
   - Pull the required local model:
     ```bash
     ollama pull gemma3:4b
     ```
   - Verify Ollama is running:
     ```bash
     ollama list
     ```

---

## 6. Quick Start Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/ALLIET-Software-Labs/hirepilot-ai.git
cd hirepilot-ai
```

### Step 2: Configure Environment (Optional)
```bash
# Windows PowerShell:
Copy-Item .env.example .env

# macOS / Linux:
cp .env.example .env
```
> *Note: By default, HirePilot AI uses the built-in DuckDuckGo web search fallback with zero setup required. If you have a Tavily Search API key, you may add `TAVILY_API_KEY=your_key` to `.env` for enhanced research depth.*

### Step 3: Run the Backend Service (FastAPI)
```bash
# Install backend dependencies
python -m pip install -r requirements.txt
# Alternatively:
python -m pip install fastapi "uvicorn[standard]" pydantic python-multipart httpx pypdf python-docx ddgs python-dotenv

# Start the backend server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*The backend will be live at `http://127.0.0.1:8000` (API documentation accessible at `http://127.0.0.1:8000/docs`).*

### Step 4: Run the Frontend Application (Vite + React)
In a separate terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
*Open your browser and navigate to: **`http://127.0.0.1:5173/`**.*

---

## 7. Step-by-Step Workflow

1. **Job & Resume Setup:**
   - Upload your existing resume (`.pdf`, `.docx`, or `.txt`) or paste raw resume text.
   - Paste the target job description.
   - Enter the target company name (used for web research) and role title.
2. **Role Alignment Audit:**
   - Review your **ATS Fit Score** (dynamically calibrated between 35% and 96%).
   - Inspect confirmed candidate skills vs prioritized requirement gaps.
   - Answer contextual follow-up questions to provide real metrics, or click **Skip All**.
3. **Tailored ATS Resume Studio:**
   - View your tailored single-column resume formatted for ATS parsers.
   - Review JD keyword match coverage.
   - Edit summary, skills, experience bullets, and project descriptions in real time.
   - Export to **PDF** (using native vector print styling) or **Microsoft Word (.docx)**.
4. **Company Research & Interview Prep:**
   - Read live-sourced company overview snippets and reported interview questions.
   - Study model STAR answers for Technical, Behavioral, and System Architecture questions.
5. **0–100% Preparation Checklist:**
   - Work through prioritized preparation cards (High, Medium, Low priority).
   - Complete hands-on revision exercises and track your readiness meter to 100%.

---

## 8. Project Structure

```
hirepilot-ai/
├── backend/
│   ├── __init__.py
│   ├── main.py              # FastAPI server, REST endpoints, and error handlers
│   ├── ollama_client.py     # Local Ollama client, dynamic ATS scoring, prompt templates
│   ├── resume_parser.py     # Local PDF, DOCX, and TXT parsing with contact heuristics
│   ├── docx_generator.py    # Native ATS-compliant single-column Word document builder
│   └── search_service.py    # Isolated company web research with live citations
├── frontend/
│   ├── index.html           # HTML5 entry with Google Fonts (Outfit, Inter, JetBrains Mono)
│   ├── package.json         # React 19, Vite, Lucide React, Tailwind CSS
│   ├── tailwind.config.js   # Custom warm ivory & slate editorial design tokens
│   ├── src/
│   │   ├── App.tsx          # Main state machine coordinator and step router
│   │   ├── main.tsx         # React root mounting
│   │   ├── index.css        # Tailwind directives and clean print media styles
│   │   ├── types/index.ts   # TypeScript interfaces for resume, analysis, and checklist
│   │   ├── services/
│   │   │   ├── api.ts       # REST client for backend endpoints
│   │   │   └── storage.ts   # LocalStorage persistence with legacy migration support
│   │   ├── data/sampleData.ts # Alex Rivera Staff Engineer demo dataset
│   │   └── components/
│   │       ├── Navbar.tsx             # Brand header, active role, and Ollama status
│   │       ├── LandingWorkspace.tsx   # Hero workspace, recent sessions, and features
│   │       ├── JobSetupView.tsx       # Aligned inputs & drag-and-drop resume upload
│   │       ├── AnalysisView.tsx       # Dynamic ATS score gauge & gap clarification Q&A
│   │       ├── ResumeStudioView.tsx   # Virtual 8.5"x11" canvas, inline editing, and export
│   │       ├── InterviewPrepView.tsx  # Verified research citations & STAR questions
│   │       ├── ChecklistView.tsx      # 0–100% prep progress, task cards, confetti
│   │       └── LocalAiStatusModal.tsx # Privacy disclosures and Ollama diagnostics
├── .env.example             # Environment variable templates
├── .gitignore               # Clean git hygiene excluding secrets and temporary data
└── README.md                # Comprehensive documentation
```

---

## 9. Contributing Guidelines

We welcome community contributions from developers, designers, and career coaches worldwide!

### How to Contribute
1. **Fork the Repository:** Click the "Fork" button on GitHub.
2. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or for bug fixes:
   git checkout -b fix/issue-description
   ```
3. **Commit with Clear Messages:** Follow conventional commit formatting:
   - `feat: add export to Markdown format`
   - `fix: resolve bullet wrapping in mobile view`
   - `docs: update setup instructions for macOS`
4. **Test Before Submitting:**
   - Verify frontend compiles with zero errors: `npm run build` in `frontend/`
   - Verify backend runs cleanly: `python -m uvicorn backend.main:app`
5. **Open a Pull Request:** Submit your PR with a concise description of your changes, screenshots (if applicable), and testing steps.

### Reporting Issues
If you encounter a bug or have a feature suggestion, please open an issue on GitHub with:
- Operating System & Browser version
- Ollama model and version (`ollama --version`)
- Clear reproduction steps or sample error message

---

## 10. FAQ & Troubleshooting

#### Q: Why is my first resume generation taking ~20 seconds?
On cold boot, Ollama loads the `gemma3:4b` weights into your machine's RAM / VRAM. Subsequent inferences reuse the warm model in memory and generate significantly faster.

#### Q: Can I use another local model (e.g. `llama3:8b` or `mistral`)?
Yes! You can set `MODEL_NAME` in `backend/ollama_client.py` or through your `.env` file to any model installed in your local Ollama library. We recommend `gemma3:4b` or `qwen3:4b-instruct` for optimal latency and structured JSON adherence.

#### Q: Does HirePilot AI guarantee I will pass automated ATS screeners?
No resume tool can honestly guarantee human recruiter hiring decisions. HirePilot AI maximizes your alignment by formatting your real experience with proven action-impact formulas, matching verified keywords, and eliminating formatting barriers (tables, floating text boxes, graphic shapes) that cause ATS parsers to fail.

---

## 11. License & Credits

**HirePilot AI** is proudly created, maintained, and open-sourced by **[Alliet Software Labs](https://alliet.company/)**.

- **Organization:** Alliet Software Labs  
- **Official Website:** [https://alliet.company/](https://alliet.company/)  
- **GitHub Repository:** [https://github.com/ALLIET-Software-Labs/hirepilot-ai](https://github.com/ALLIET-Software-Labs/hirepilot-ai)  
- **Support & Inquiries:** [contact@alliet.company](mailto:contact@alliet.company)  
- **License:** Open-source software released under the [MIT License](https://opensource.org/licenses/MIT).
