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
    {{
      "name": "Certification Name",
      "issuer": "Issuing Org",
      "year": "Year"
    }}
  ],
  "ats_keyword_analysis": {{
    "coverage_percentage": 82,
    "matched_keywords": ["keyword1", "keyword2", "keyword3"],
    "missing_keywords": ["keyword4", "keyword5"],
    "disclaimer": "Keyword coverage is a heuristic estimation and does not guarantee passing automated screening."
  }}
}}
"""
    raw_response = await call_ollama(prompt, system_prompt=system_prompt, temperature=0.15)
    return extract_json_from_response(raw_response)


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
        research_snippets_text = "\n".join(snippets[:6])

    system_prompt = (
        "You are an elite technical interview coach and hiring manager. "
        "Generate realistic, high-value interview questions and suggested answers. "
        "GROUNDING RULES:\n"
        "1. For personal/experience questions, provide structured response frameworks (e.g. STAR method) tailored to candidate's verified resume, rather than inventing fictional stories.\n"
        "2. If verified company research is provided, include company-specific and reported questions citing the source.\n"
        "3. Explain WHY interviewers ask each question so candidates understand the underlying assessment criteria.\n"
        "4. Respond with pure valid JSON only."
    )

    prompt = f"""
ROLE: {job_title or 'Target Role'}
COMPANY: {company_name or 'Target Company'}

JOB DESCRIPTION:
\"\"\"
{job_description[:3000]}
\"\"\"

CANDIDATE CONFIRMED BACKGROUND:
\"\"\"
{resume_text[:3000]}
\"\"\"

VERIFIED WEB RESEARCH & REPORTED INTERVIEW EXPERIENCES:
{research_snippets_text if research_snippets_text else 'No specific company web snippets available. Ground strictly in JD requirements.'}

Generate comprehensive interview questions across all 6 core categories. Return pure JSON with this structure:
{{
  "categories": [
    {{
      "category_name": "Technical Fundamentals",
      "description": "Foundational engineering concepts required for this level",
      "questions": [
        {{
          "id": "tf1",
          "question": "Question text",
          "why_asked": "Interviewer intention and what they evaluate",
          "suggested_answer": "Clear, technically sound suggested answer",
          "concepts_to_revise": ["Concept 1", "Concept 2"],
          "source_citation": "JD Core Requirement"
        }}
      ]
    }},
    {{
      "category_name": "JD-Specific Skills",
      "description": "Questions evaluating direct qualifications from the job description",
      "questions": [...]
    }},
    {{
      "category_name": "Projects & Experience",
      "description": "Deep-dives into candidate verified resume projects and achievements",
      "questions": [...]
    }},
    {{
      "category_name": "Problem Solving & System Scenarios",
      "description": "Architectural, debugging, and real-world scenario challenges",
      "questions": [...]
    }},
    {{
      "category_name": "Behavioral & Culture Fit",
      "description": "STAR-format questions on collaboration, conflict, and ownership",
      "questions": [...]
    }},
    {{
      "category_name": "Company-Specific Topics",
      "description": "Questions grounded in company mission, tech stack, or reported interview patterns",
      "questions": [...]
    }}
  ]
}}
"""
    raw_response = await call_ollama(prompt, system_prompt=system_prompt, temperature=0.2)
    return extract_json_from_response(raw_response)


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
      "priority": "High" | "Medium" | "Low",
      "category": "Technical Core" | "Architecture & System Design" | "Domain / JD Skill" | "Behavioral & Culture",
      "why_it_matters": "Direct explanation of why this role requires this knowledge",
      "concepts_to_study": ["Specific concept A", "Specific concept B", "Specific concept C"],
      "practical_task": "Concrete 30-60 min hands-on exercise or study task to test mastery",
      "completed": false
    }}
  ]
}}
"""
    raw_response = await call_ollama(prompt, system_prompt=system_prompt, temperature=0.2)
    return extract_json_from_response(raw_response)
