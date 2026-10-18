"""
Ollama client for local inference using gemma3:4b.
Features:
- Health checking and model verification.
- Safe structured prompt formatting.
- Resilient JSON cleaning, repair, and fallback parsing.
- Anti-hallucination guardrails: strictly grounds answers in confirmed resume facts.
"""

import json
import re
import httpx
from typing import Dict, Any, List, Optional

OLLAMA_BASE_URL = "http://localhost:11434"
MODEL_NAME = "gemma3:4b"


def extract_json_from_response(text: str) -> Any:
    """Robustly extract and parse JSON from local LLM outputs."""
    if not text or not text.strip():
        raise ValueError("Model returned an empty response.")

    cleaned = text.strip()

    # 1. Check for markdown code fences: ```json ... ``` or ``` ... ```
    match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', cleaned, re.IGNORECASE)
    if match:
        cleaned = match.group(1).strip()

    # 2. Extract outermost JSON object {...} or array [...]
    first_brace = cleaned.find('{')
    first_bracket = cleaned.find('[')

    if first_brace != -1 and (first_bracket == -1 or first_brace < first_bracket):
        last_brace = cleaned.rfind('}')
        if last_brace != -1:
            cleaned = cleaned[first_brace:last_brace + 1]
    elif first_bracket != -1:
        last_bracket = cleaned.rfind(']')
        if last_bracket != -1:
            cleaned = cleaned[first_bracket:last_bracket + 1]

    # 3. Clean common LLM formatting issues
    # Remove trailing commas before closing braces/brackets
    cleaned = re.sub(r',\s*([}\]])', r'\1', cleaned)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as err:
        # Fallback repair: replace unescaped newlines inside strings if any
        try:
            repaired = re.sub(r'(?<!\\)\n', ' ', cleaned)
            return json.loads(repaired)
        except Exception:
            raise ValueError(f"Failed to parse model JSON: {err.msg}. Raw text preview: {text[:200]}")


async def check_ollama_status() -> Dict[str, Any]:
    """Check connectivity to Ollama and verify if gemma3:4b is present."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name") for m in data.get("models", [])]
                has_target_model = any(m == MODEL_NAME or m.startswith(f"{MODEL_NAME}:") for m in models)
                return {
                    "connected": True,
                    "target_model": MODEL_NAME,
                    "model_available": has_target_model,
                    "available_models": models,
                    "endpoint": OLLAMA_BASE_URL,
                    "message": "Ollama is ready and gemma3:4b is available." if has_target_model else f"Ollama is running, but {MODEL_NAME} is not yet installed."
                }
            return {
                "connected": False,
                "target_model": MODEL_NAME,
                "model_available": False,
                "available_models": [],
                "endpoint": OLLAMA_BASE_URL,
                "message": f"Ollama returned HTTP status {resp.status_code}."
            }
    except Exception as e:
        return {
            "connected": False,
            "target_model": MODEL_NAME,
            "model_available": False,
            "available_models": [],
            "endpoint": OLLAMA_BASE_URL,
            "message": f"Cannot connect to Ollama at {OLLAMA_BASE_URL}. Ensure Ollama is running (`ollama serve`)."
        }


async def call_ollama(prompt: str, system_prompt: str = "", temperature: float = 0.2, max_retries: int = 2) -> str:
    """Call Ollama /api/generate with retry and timeout."""
    full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt

    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                payload = {
                    "model": MODEL_NAME,
                    "prompt": full_prompt,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "num_predict": 4096,
                    }
                }
                resp = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
                resp.raise_for_status()
                data = resp.json()
                response_text = data.get("response", "").strip()
                if response_text:
                    return response_text
        except Exception as e:
            if attempt == max_retries - 1:
                raise RuntimeError(f"Ollama generation failed after {max_retries} attempts: {str(e)}")
    return ""


async def analyze_resume_and_jd(
    resume_text: str,
    job_description: str,
    company_name: str = "",
    job_title: str = ""
) -> Dict[str, Any]:
    """Analyze resume vs JD, identify matches, gaps, and contextual clarification questions."""
    system_prompt = (
        "You are an expert executive recruiter and ATS resume specialist. "
        "Your task is to analyze a candidate's resume against a job description. "
        "CRITICAL RULES:\n"
        "1. NEVER invent or assume skills, metrics, or experiences the candidate has not confirmed in the resume text.\n"
        "2. Strictly distinguish confirmed candidate skills from missing JD requirements.\n"
        "3. Only formulate 2 to 4 high-value follow-up questions where clarifying details (e.g. scale, tech version, quantifiable result) would meaningfully elevate ATS alignment.\n"
        "4. Respond with pure valid JSON only, without conversational markdown introduction or conclusion."
    )

    prompt = f"""
TARGET JOB:
Company: {company_name or 'Not specified'}
Role: {job_title or 'Target Role'}
Job Description:
\"\"\"
{job_description[:3500]}
\"\"\"

CANDIDATE RESUME:
\"\"\"
{resume_text[:4000]}
\"\"\"

Analyze the resume and return a JSON object with this exact structure:
{{
  "candidate_name": "Detected or Candidate Name",
  "target_role": "Identified target job title",
  "match_score_estimate": 78,
  "match_score_rationale": "Brief 1-2 sentence explanation of the score heuristic",
  "confirmed_skills": ["List of skills explicitly verified in resume"],
  "jd_key_requirements": ["Key hard skills, competencies, or requirements requested in JD"],
  "matching_qualifications": [
    {{
      "requirement": "JD requirement",
      "resume_evidence": "Exact evidence or bullet point from resume"
    }}
  ],
  "missing_or_gap_requirements": [
    {{
      "skill_or_requirement": "Name of missing competency",
      "importance": "High" | "Medium" | "Low",
      "guidance": "How to address or learn this gap"
    }}
  ],
  "clarification_questions": [
    {{
      "id": "q1",
      "question": "Clear, contextual question asking for real details (e.g. metrics, technologies used)?",
      "rationale": "Why answering this will improve resume ATS score and interview readiness",
      "target_section": "Experience" | "Skills" | "Projects"
    }}
  ]
}}
"""
    raw_response = await call_ollama(prompt, system_prompt=system_prompt, temperature=0.1)
    return extract_json_from_response(raw_response)


async def generate_tailored_resume(
    resume_text: str,
    job_description: str,
    clarification_answers: Dict[str, str] = None,
    target_role: str = "",
    contact_info: Dict[str, Any] = None
) -> Dict[str, Any]:
    """Generate role-targeted ATS-friendly resume data without fabricating candidate qualifications."""
    answers_text = ""
    if clarification_answers:
        answers_text = "\n".join([f"- Q: {k} -> A: {v}" for k, v in clarification_answers.items() if v.strip()])

    system_prompt = (
        "You are a master career consultant and ATS resume architect. "
        "Tailor the candidate's resume for the target job description. "
        "ABSOLUTE TRUTHFULNESS DIRECTIVES:\n"
        "1. DO NOT invent skills, job titles, companies, dates, degrees, metrics, or tools the candidate does not have.\n"
        "2. If the user answered clarification questions, incorporate their real answers into the relevant bullets.\n"
        "3. Rewrite experience bullets following the Action Verb + Context + Impact formula.\n"
        "4. Output a single-column ATS-friendly structure in pure valid JSON."
    )

    prompt = f"""
TARGET ROLE: {target_role or 'Target Job'}
JOB DESCRIPTION:
\"\"\"
{job_description[:3000]}
\"\"\"

CANDIDATE ORIGINAL RESUME:
\"\"\"
{resume_text[:3800]}
\"\"\"

CLARIFICATIONS PROVIDED BY CANDIDATE:
{answers_text if answers_text else 'None provided.'}

Generate an ATS-optimized resume. Return pure JSON with this exact structure:
{{
  "candidate_name": "{contact_info.get('detected_name') if contact_info else 'Candidate'}",
  "target_role": "{target_role}",
  "contact_info": {{
    "email": "{contact_info.get('email', '') if contact_info else ''}",
    "phone": "{contact_info.get('phone', '') if contact_info else ''}",
    "location": "City, State",
    "linkedin": "{contact_info.get('links', [''])[0] if contact_info and contact_info.get('links') else ''}",
    "github": "",
    "portfolio": ""
  }},
  "professional_summary": "3-4 concise, impactful sentences positioning candidate for this specific role based strictly on real background.",
  "skills": {{
    "Core Competencies": ["skill1", "skill2"],
    "Languages & Frameworks": ["lang1", "framework1"],
    "Developer Tools & Platforms": ["tool1", "tool2"],
    "Methodologies": ["Agile", "CI/CD"]
  }},
  "work_experience": [
    {{
      "role": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "dates": "Start - End Date",
      "bullets": [
        "Action verb + what was accomplished + impact or quantifiable result (grounded in resume)"
      ]
    }}
  ],
  "projects": [
    {{
      "name": "Project Name",
      "technologies": ["Tech1", "Tech2"],
      "bullets": [
        "Key implementation and technical outcome"
      ]
    }}
  ],
  "education": [
    {{
      "degree": "Degree / Major",
      "institution": "University / College",
      "graduation_year": "Year",
      "location": "City, State"
    }}
  ],
  "certifications": [
    // Include real certifications ONLY if candidate resume explicitly states them. If candidate has none, return []
  ],
  "ats_keyword_analysis": {{
    "coverage_percentage": 82,
    "matched_keywords": ["keyword1", "keyword2", "keyword3"],
    "missing_keywords": ["keyword4", "keyword5"],
    "disclaimer": "Keyword coverage is a heuristic estimation and does not guarantee passing automated screening."
  }}
}}
IMPORTANT: If candidate has no certifications, output "certifications": []. NEVER write "N/A" or placeholder certifications!
"""
    raw_response = await call_ollama(prompt, system_prompt=system_prompt, temperature=0.15)
    parsed = extract_json_from_response(raw_response)

    # Strict post-processing: remove any N/A or placeholder certifications
    if isinstance(parsed, dict) and "certifications" in parsed and isinstance(parsed["certifications"], list):
        cleaned_certs = []
        for cert in parsed["certifications"]:
            if not isinstance(cert, dict):
                continue
            name = str(cert.get("name", "")).strip()
            issuer = str(cert.get("issuer", "")).strip()
            # If name or issuer contains N/A or None, discard it
            if not name or name.lower() in ["n/a", "none", "not applicable", "tbd"]:
                continue
            if "n/a" in name.lower() or "none" in name.lower() or "(n/a)" in name.lower():
                continue
            if issuer.lower() in ["n/a", "none", "not applicable"]:
                issuer = ""
            year = str(cert.get("year", "")).strip()
            if year.lower() in ["n/a", "none", "year"]:
                year = ""
            cleaned_certs.append({
                "name": name,
                "issuer": issuer,
                "year": year
            })
        parsed["certifications"] = cleaned_certs

    return parsed


def build_grounded_interview_fallback(
    job_description: str,
    resume_text: str,
    company_name: str = "",
    job_title: str = "",
    research_summary: Dict[str, Any] = None
) -> Dict[str, Any]:
    """Generate high-quality grounded interview preparation questions as a reliable fallback."""
    comp = company_name or "the target company"
    role = job_title or "Target Role"

    # Identify primary tech keywords
    skills = []
    for s in ["Python", "JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "SQL", "AWS", "Docker", "REST API", "System Design", "Git"]:
        if s.lower() in job_description.lower() or s.lower() in resume_text.lower():
            skills.append(s)
    if not skills:
        skills = ["System Architecture", "API Design", "Database Optimization", "Clean Code"]

    primary_tech = skills[0] if skills else "Core Technologies"
    secondary_tech = skills[1] if len(skills) > 1 else "Modern Frameworks"

    company_q = f"How would you apply your technical background to solve core engineering and product scale challenges at {comp}?"
    if research_summary and research_summary.get("sources"):
        sample_title = research_summary["sources"][0].get("title", "")
        if sample_title:
            company_q = f"Based on recent initiatives at {comp} ({sample_title}), how does your engineering background position you to contribute?"

    return {
        "categories": [
            {
                "category_name": "Technical Fundamentals",
                "description": "Core engineering principles and foundational technical concepts",
                "questions": [
                    {
                        "id": "tf-1",
                        "question": f"Explain the core architectural principles and execution model of {primary_tech}. What trade-offs do you consider when designing with it?",
                        "why_asked": f"Evaluates depth of mastery in {primary_tech} rather than superficial syntax knowledge.",
                        "suggested_answer": f"Structure your response around fundamental design: discuss asynchronous I/O or state flow, memory management, and how {primary_tech} handles concurrency. Compare it against common alternatives, noting where it excels (e.g. developer ergonomics, ecosystem) versus its operational overhead.",
                        "concepts_to_revise": [f"{primary_tech} Internals", "Concurrency", "Memory Management"],
                        "source_citation": "JD Core Requirement"
                    },
                    {
                        "id": "tf-2",
                        "question": "How do you approach database schema indexing and query optimization when handling high-concurrency read/write workloads?",
                        "why_asked": "Assesses back-end and data modeling maturity in real-world production settings.",
                        "suggested_answer": "Discuss B-Tree and hash indexing, explain composite index column ordering, and mention analyzing EXPLAIN ANALYZE execution plans. Highlight connection pooling, read replicas, and caching layers (e.g. Redis) to alleviate database bottlenecks.",
                        "concepts_to_revise": ["Query Optimization", "Indexing Strategies", "Connection Pooling"],
                        "source_citation": "System Architecture Benchmark"
                    }
                ]
            },
            {
                "category_name": "JD-Specific Skills",
                "description": f"Targeted requirements for {role}",
                "questions": [
                    {
                        "id": "jd-1",
                        "question": f"In {secondary_tech}, how do you structure components or services to ensure testability, high maintainability, and clean separation of concerns?",
                        "why_asked": f"Directly verifies practical expertise in {secondary_tech} as demanded by the job posting.",
                        "suggested_answer": f"Outline your preferred pattern: single responsibility principle, decoupled business logic, and modular boundaries. Describe automated unit and integration testing strategies that prevent regression without excessive mocking.",
                        "concepts_to_revise": [f"{secondary_tech} Best Practices", "Clean Architecture", "Automated Testing"],
                        "source_citation": "Job Description Priority"
                    }
                ]
            },
            {
                "category_name": "Projects & Experience",
                "description": "Grounded exploration of your verified background and engineering accomplishments",
                "questions": [
                    {
                        "id": "pe-1",
                        "question": "Walk me through the most technically challenging project on your resume. What was your specific architectural contribution and what measurable impact did it achieve?",
                        "why_asked": "Assesses ownership, problem decomposition, and ability to articulate engineering trade-offs.",
                        "suggested_answer": "Use the STAR method: (Situation) Frame the business problem and constraints; (Task) Define your specific ownership; (Action) Detail the technical decisions, architecture, and roadblocks you overcame; (Result) Quantify the outcome (e.g., latency reduction, uptime, user scale, or team efficiency).",
                        "concepts_to_revise": ["STAR Framework", "Architecture Walkthrough", "Measurable Metrics"],
                        "source_citation": "Resume Experience Deep-Dive"
                    }
                ]
            },
            {
                "category_name": "Problem Solving & Scenarios",
                "description": "Live architectural, scalability, and incident response scenarios",
                "questions": [
                    {
                        "id": "ps-1",
                        "question": "A critical customer-facing API endpoint begins experiencing intermittent 504 gateway timeouts under peak load. Walk me through your methodical debugging and remediation process.",
                        "why_asked": "Tests production debugging discipline, telemetry understanding, and incident response.",
                        "suggested_answer": "Step 1: Check monitoring metrics (error rate spikes, p99 latency, CPU/memory saturation, connection pool exhaustion). Step 2: Correlate logs with recent deployments. Step 3: Identify whether the bottleneck is database lock contention, slow downstream dependency, or memory leaks. Step 4: Apply mitigation (scale replicas, enable circuit breaker) and formulate a post-mortem with preventative actions.",
                        "concepts_to_revise": ["Observability & APM", "Root Cause Analysis", "Circuit Breakers"],
                        "source_citation": "Production Reliability Scenario"
                    }
                ]
            },
            {
                "category_name": "Behavioral & Leadership",
                "description": "Collaboration, conflict resolution, and technical decision making",
                "questions": [
                    {
                        "id": "bh-1",
                        "question": "Tell me about a time you strongly disagreed with a technical direction or architectural decision proposed by a peer or manager. How did you navigate the conversation?",
                        "why_asked": "Evaluates emotional intelligence, constructive communication, and commitment to collective team goals.",
                        "suggested_answer": "Focus on data and objective criteria: describe framing the disagreement around trade-offs (scalability vs delivery velocity) rather than personal preference. Conclude with how you reached consensus or committed fully to the agreed decision.",
                        "concepts_to_revise": ["Constructive Conflict", "Data-Driven Trade-offs", "Disagree and Commit"],
                        "source_citation": "Behavioral Evaluation"
                    }
                ]
            },
            {
                "category_name": "Company-Specific Topics",
                "description": f"Alignment with {comp}'s mission, technical domain, and product challenges",
                "questions": [
                    {
                        "id": "co-1",
                        "question": company_q,
                        "why_asked": f"Tests genuine interest, company research preparation, and domain enthusiasm for {comp}.",
                        "suggested_answer": f"Express clear understanding of {comp}'s core platform and business model. Connect your verified technical strengths to problems {comp} solves at scale, highlighting how your experience reduces onboarding friction and delivers immediate value.",
                        "concepts_to_revise": [f"{comp} Overview", "Domain Scalability", "Value Proposition"],
                        "source_citation": "Verified Company Research" if (research_summary and research_summary.get("has_research")) else "Company Domain Fit"
                    }
                ]
            }
        ]
    }


async def generate_interview_preparation(
    job_description: str,
    resume_text: str,
    company_name: str = "",
    job_title: str = "",
    research_summary: Dict[str, Any] = None
) -> Dict[str, Any]:
    """Generate comprehensive interview questions and suggested answers grounded in JD and verified research."""
    research_snippets_text = ""
    if research_summary and research_summary.get("has_research"):
        snippets = []
        for s in research_summary.get("overview_snippets", []) + research_summary.get("interview_snippets", []):
            snippets.append(f"- [{s.get('title')}] {s.get('snippet')} (URL: {s.get('url')})")
        research_snippets_text = "\n".join(snippets[:5])

    system_prompt = (
        "You are an elite technical interview coach. "
        "Generate realistic interview questions and suggested answers. "
        "GROUNDING RULES:\n"
        "1. For personal/experience questions, provide structured response frameworks (e.g. STAR method) tailored to candidate's verified resume, rather than inventing fictional stories.\n"
        "2. If verified company research is provided, ground company questions in that research.\n"
        "3. Explain WHY interviewers ask each question.\n"
        "4. Respond with pure valid JSON only without markdown commentary."
    )

    prompt = f"""
ROLE: {job_title or 'Target Role'}
COMPANY: {company_name or 'Target Company'}

JOB DESCRIPTION:
\"\"\"
{job_description[:2500]}
\"\"\"

CANDIDATE CONFIRMED BACKGROUND:
\"\"\"
{resume_text[:2500]}
\"\"\"

VERIFIED WEB RESEARCH:
{research_snippets_text if research_snippets_text else 'None available. Ground strictly in JD.'}

Generate interview questions across core categories. Return pure JSON with this exact schema:
{{
  "categories": [
    {{
      "category_name": "Technical Fundamentals",
      "description": "Foundational engineering concepts",
      "questions": [
        {{
          "id": "tf-1",
          "question": "Question text here?",
          "why_asked": "Assessment intent",
          "suggested_answer": "Structured suggested answer",
          "concepts_to_revise": ["Concept 1", "Concept 2"],
          "source_citation": "JD Core Requirement"
        }}
      ]
    }},
    {{
      "category_name": "JD-Specific Skills",
      "description": "Direct qualifications from JD",
      "questions": [
        {{
          "id": "jd-1",
          "question": "Question text here?",
          "why_asked": "Assessment intent",
          "suggested_answer": "Structured suggested answer",
          "concepts_to_revise": ["Concept A"],
          "source_citation": "JD Skill"
        }}
      ]
    }},
    {{
      "category_name": "Projects & Experience",
      "description": "Candidate verified accomplishments",
      "questions": [
        {{
          "id": "pe-1",
          "question": "Question text here?",
          "why_asked": "Assessment intent",
          "suggested_answer": "STAR framework answer",
          "concepts_to_revise": ["Project Architecture"],
          "source_citation": "Resume Experience"
        }}
      ]
    }},
    {{
      "category_name": "Behavioral & Company Topics",
      "description": "Culture and company alignment",
      "questions": [
        {{
          "id": "bc-1",
          "question": "Question text here?",
          "why_asked": "Assessment intent",
          "suggested_answer": "STAR framework answer",
          "concepts_to_revise": ["Communication"],
          "source_citation": "Company Fit"
        }}
      ]
    }}
  ]
}}
"""
    try:
        raw_response = await call_ollama(prompt, system_prompt=system_prompt, temperature=0.2)
        parsed = extract_json_from_response(raw_response)
        if isinstance(parsed, dict) and parsed.get("categories") and len(parsed["categories"]) > 0:
            return parsed
        # If parsed has no categories, fall back
        return build_grounded_interview_fallback(job_description, resume_text, company_name, job_title, research_summary)
    except Exception as e:
        print(f"[Interview Prep LLM Error]: {e}. Using grounded fallback generator.")
        return build_grounded_interview_fallback(job_description, resume_text, company_name, job_title, research_summary)


def build_grounded_checklist_fallback(job_description: str, gaps: List[Dict[str, Any]] = None, company_name: str = "") -> Dict[str, Any]:
    items = []
    idx = 1
    if gaps:
        for g in gaps[:4]:
            skill = g.get("skill_or_requirement", "Key Competency")
            importance = g.get("importance", "High")
            items.append({
                "id": f"chk-{idx}",
                "topic": f"{skill} Mastery & Real-World Application",
                "priority": importance,
                "category": "Target Role Gap",
                "why_it_matters": f"Identified as a critical qualification for {company_name or 'the role'}.",
                "concepts_to_study": [f"{skill} fundamentals", "Production patterns", "Performance optimization"],
                "practical_task": f"Build a small working prototype demonstrating {skill} with automated unit tests.",
                "completed": False
            })
            idx += 1

    standard_topics = [
        ("System Architecture & Scalability", "High", "Architecture & System Design", "Design scalable decoupled services with caching and resilient APIs.", ["Caching Strategies", "Load Balancing", "Database Sharding"], "Diagram a high-throughput architecture on paper addressing single points of failure."),
        ("Data Modeling & Query Optimization", "Medium", "Technical Core", "Essential for maintaining low latency under high transaction volumes.", ["B-Tree Indexes", "Execution Plans", "Connection Pooling"], "Analyze a slow query using EXPLAIN ANALYZE and implement optimal composite indexes."),
        ("STAR Behavioral Stories", "Medium", "Behavioral & Culture", "Evaluates team ownership, cross-functional collaboration, and communication.", ["STAR Method", "Incident Post-Mortems", "Constructive Conflict"], "Write down 3 structured STAR narratives detailing high-stakes project deliverables."),
        ("Security & API Defensive Standards", "Low", "Technical Core", "Required to prevent vulnerabilities in production endpoints.", ["OWASP Top 10", "Input Sanitization", "Rate Limiting"], "Review an existing codebase and audit endpoints for authentication and SQL injection vulnerabilities.")
    ]

    for topic, prio, cat, why, concepts, task in standard_topics:
        items.append({
            "id": f"chk-{idx}",
            "topic": topic,
            "priority": prio,
            "category": cat,
            "why_it_matters": why,
            "concepts_to_study": concepts,
            "practical_task": task,
            "completed": False
        })
        idx += 1

    return {"checklist_items": items}


async def generate_preparation_checklist(
    job_description: str,
    resume_text: str,
    gaps: List[Dict[str, Any]] = None,
    company_name: str = ""
) -> Dict[str, Any]:
    """Generate a prioritized learning checklist tailored to the candidate's gaps and target role."""
    gaps_str = json.dumps(gaps, indent=2) if gaps else "[]"

    system_prompt = (
        "You are a technical career mentor. Create a prioritized preparation checklist for a job candidate. "
        "Each topic must be specifically relevant to this job description and the candidate's actual gaps. "
        "Do not provide a generic one-size-fits-all list. Return pure valid JSON only."
    )

    prompt = f"""
COMPANY: {company_name or 'Target Company'}

JOB DESCRIPTION:
\"\"\"
{job_description[:3000]}
\"\"\"

IDENTIFIED CANDIDATE GAPS & OPPORTUNITIES:
{gaps_str}

Generate a prioritized checklist of 8 to 12 targeted preparation items across Technical Skills, System Architecture, Role Concepts, and Behavioral Scenarios.
Return pure JSON with this structure:
{{
  "checklist_items": [
    {{
      "id": "chk-1",
      "topic": "Topic / Skill name (e.g., SQL Window Functions, Distributed Locking, RAG Pipeline Architecture)",
      "priority": "High",
      "category": "Technical Core",
      "why_it_matters": "Direct explanation of why this role requires this knowledge",
      "concepts_to_study": ["Specific concept A", "Specific concept B", "Specific concept C"],
      "practical_task": "Concrete 30-60 min hands-on exercise or study task to test mastery",
      "completed": false
    }}
  ]
"""

    try:
        raw_response = await call_ollama(prompt, system_prompt=system_prompt, temperature=0.2)
        parsed = extract_json_from_response(raw_response)
        if isinstance(parsed, dict) and parsed.get("checklist_items") and len(parsed["checklist_items"]) > 0:
            return parsed
        return build_grounded_checklist_fallback(job_description, gaps, company_name)
    except Exception as e:
        print(f"[Checklist LLM Error]: {e}. Using grounded fallback generator.")
        return build_grounded_checklist_fallback(job_description, gaps, company_name)
