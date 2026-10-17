"""
ApplyForge AI - FastAPI Application Server
Provides REST APIs for:
- Health and local Ollama connectivity
- Resume parsing (PDF, DOCX, TXT)
- Resume & JD Gap Analysis with Contextual Clarification Questions
- ATS-Friendly Tailored Resume Synthesis & Keyword Coverage
- Live Company Web Research with Verified Citations
- Grounded Interview Questions & STAR Answers
- Prioritized Preparation Checklist with 0-100% Progress Tracking
- Professional ATS-Compliant DOCX Export
"""

import os
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load local environment variables (.env)
load_dotenv()

import sys
import os

# Add backend directory to sys.path so modules resolve whether invoked from root or backend
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

try:
    from backend.resume_parser import parse_resume_file
    from backend.search_service import conduct_company_research
    from backend.ollama_client import (
        check_ollama_status,
        analyze_resume_and_jd,
        generate_tailored_resume,
        generate_interview_preparation,
        generate_preparation_checklist
    )
    from backend.docx_generator import generate_resume_docx
except ImportError:
    from resume_parser import parse_resume_file
    from search_service import conduct_company_research
    from ollama_client import (
        check_ollama_status,
        analyze_resume_and_jd,
        generate_tailored_resume,
        generate_interview_preparation,
        generate_preparation_checklist
    )
    from docx_generator import generate_resume_docx

app = FastAPI(
    title="ApplyForge AI API",
    description="Local AI Career Preparation Platform powered by Ollama and gemma3:4b",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server & production builds
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request & Response Models ---

class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., min_length=20, description="Extracted resume text")
    job_description: str = Field(..., min_length=20, description="Target job description")
    company_name: Optional[str] = ""
    job_title: Optional[str] = ""


class TailorResumeRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)
    job_description: str = Field(..., min_length=20)
    clarification_answers: Optional[Dict[str, str]] = Field(default_factory=dict)
    target_role: Optional[str] = ""
    contact_info: Optional[Dict[str, Any]] = Field(default_factory=dict)


class CompanyResearchRequest(BaseModel):
    company_name: str = Field(..., min_length=1)
    job_title: Optional[str] = ""


class InterviewPrepRequest(BaseModel):
    job_description: str = Field(..., min_length=20)
    resume_text: str = Field(..., min_length=20)
    company_name: Optional[str] = ""
    job_title: Optional[str] = ""
    research_summary: Optional[Dict[str, Any]] = None


class ChecklistRequest(BaseModel):
    job_description: str = Field(..., min_length=20)
    resume_text: str = Field(..., min_length=20)
    gaps: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    company_name: Optional[str] = ""


# --- Endpoints ---

@app.get("/api/health")
async def health_check():
    """Verify backend status, Ollama model availability, and search provider."""
    ollama_status = await check_ollama_status()
    tavily_key = os.getenv("TAVILY_API_KEY", "").strip()
    
    return {
        "status": "healthy",
        "privacy_mode": "local_inference",
        "search_provider": "tavily" if tavily_key else "duckduckgo_fallback",
        "tavily_configured": bool(tavily_key),
        "ollama": ollama_status
    }


@app.post("/api/parse-resume")
async def parse_resume_endpoint(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None)
):
    """Parse resume from uploaded PDF/DOCX/TXT file or fallback text input."""
    try:
        if file and file.filename:
            content = await file.read()
            if len(content) > 10 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="Uploaded file exceeds maximum limit of 10MB.")
            parsed_data = parse_resume_file(file.filename, content)
            return parsed_data

        if raw_text and raw_text.strip():
            cleaned = raw_text.strip()
            words = cleaned.split()
            return {
                "text": cleaned,
                "filename": "pasted_resume.txt",
                "word_count": len(words),
                "detected_name": "Candidate",
                "email": "",
                "phone": "",
                "links": []
            }

        raise HTTPException(status_code=400, detail="Please upload a resume file or paste resume text.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to process resume: {str(e)}")


@app.post("/api/analyze")
async def analyze_endpoint(payload: AnalyzeRequest):
    """Analyze resume vs JD, identify matches, gaps, and contextual clarification questions."""
    try:
        analysis = await analyze_resume_and_jd(
            resume_text=payload.resume_text,
            job_description=payload.job_description,
            company_name=payload.company_name or "",
            job_title=payload.job_title or ""
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/api/tailor-resume")
async def tailor_resume_endpoint(payload: TailorResumeRequest):
    """Synthesize ATS-optimized role-targeted resume without inventing candidate credentials."""
    try:
        tailored = await generate_tailored_resume(
            resume_text=payload.resume_text,
            job_description=payload.job_description,
            clarification_answers=payload.clarification_answers,
            target_role=payload.target_role or "Target Role",
            contact_info=payload.contact_info or {}
        )
        return tailored
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume tailoring failed: {str(e)}")


@app.post("/api/company-research")
async def company_research_endpoint(payload: CompanyResearchRequest):
    """Perform real web searches for company overview and reported interview questions."""
    try:
        research = await conduct_company_research(
            company_name=payload.company_name,
            job_title=payload.job_title or ""
        )
        return research
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Company research failed: {str(e)}")


@app.post("/api/interview-prep")
async def interview_prep_endpoint(payload: InterviewPrepRequest):
    """Generate categorized interview questions and STAR answers grounded in JD and verified research."""
    try:
        prep = await generate_interview_preparation(
            job_description=payload.job_description,
            resume_text=payload.resume_text,
            company_name=payload.company_name or "",
            job_title=payload.job_title or "",
            research_summary=payload.research_summary
        )
        return prep
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview prep generation failed: {str(e)}")


@app.post("/api/checklist")
async def checklist_endpoint(payload: ChecklistRequest):
    """Generate prioritized preparation checklist items tailored to role and gaps."""
    try:
        checklist = await generate_preparation_checklist(
            job_description=payload.job_description,
            resume_text=payload.resume_text,
            gaps=payload.gaps,
            company_name=payload.company_name or ""
        )
        return checklist
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Checklist generation failed: {str(e)}")


@app.post("/api/export-docx")
async def export_docx_endpoint(resume_data: Dict[str, Any]):
    """Generate ATS-compliant .docx binary document from resume structure."""
    try:
        buffer = generate_resume_docx(resume_data)
        filename = f"ApplyForge_Resume_{resume_data.get('candidate_name', 'Tailored').replace(' ', '_')}.docx"
        return Response(
            content=buffer.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DOCX export failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
