// Core Data Types for ApplyForge AI

export type StepId = 'landing' | 'setup' | 'analysis' | 'studio' | 'interview' | 'checklist';

export interface OllamaHealth {
  connected: boolean;
  target_model: string;
  model_available: boolean;
  available_models: string[];
  endpoint: string;
  message: string;
}

export interface SystemHealth {
  status: string;
  privacy_mode: string;
  search_provider: string;
  tavily_configured: boolean;
  ollama: OllamaHealth;
}

export interface ParsedResume {
  text: string;
  filename: string;
  word_count: number;
  detected_name: string;
  email: string;
  phone: string;
  links: string[];
}

export interface MatchingQualification {
  requirement: string;
  resume_evidence: string;
}

export interface MissingRequirement {
  skill_or_requirement: string;
  importance: 'High' | 'Medium' | 'Low';
  guidance: string;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  rationale: string;
  target_section: 'Experience' | 'Skills' | 'Projects' | string;
}

export interface AnalysisResult {
  candidate_name?: string;
  target_role?: string;
  match_score_estimate: number;
  match_score_rationale: string;
  confirmed_skills: string[];
  jd_key_requirements: string[];
  matching_qualifications: MatchingQualification[];
  missing_or_gap_requirements: MissingRequirement[];
  clarification_questions: ClarificationQuestion[];
}

export interface ResumeWorkExperience {
  role: string;
  company: string;
  location?: string;
  dates: string;
  bullets: string[];
}

export interface ResumeProject {
  name: string;
  technologies: string[];
  bullets: string[];
  link?: string;
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  graduation_year?: string;
  location?: string;
}

export interface ResumeCertification {
  name: string;
  issuer?: string;
  year?: string;
}

export interface ATSKeywordAnalysis {
  coverage_percentage: number;
  matched_keywords: string[];
  missing_keywords: string[];
  disclaimer: string;
}

export interface TailoredResumeData {
  candidate_name: string;
  target_role: string;
  contact_info: {
    email: string;
    phone: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  professional_summary: string;
  skills: Record<string, string[]>;
  work_experience: ResumeWorkExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  certifications: ResumeCertification[];
  ats_keyword_analysis?: ATSKeywordAnalysis;
}

export interface SearchSource {
  title: string;
  url: string;
  snippet: string;
}

export interface CompanyResearchResult {
  has_research: boolean;
  company_name: string;
  job_title: string;
  provider: string;
  sources: SearchSource[];
  overview_snippets: SearchSource[];
  interview_snippets: SearchSource[];
  message: string;
}

export interface InterviewQuestionItem {
  id: string;
  question: string;
  why_asked: string;
  suggested_answer: string;
  concepts_to_revise: string[];
  source_citation?: string;
}

export interface InterviewCategory {
  category_name: string;
  description: string;
  questions: InterviewQuestionItem[];
}

export interface InterviewPrepResult {
  categories: InterviewCategory[];
}

export interface ChecklistItem {
  id: string;
  topic: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  why_it_matters: string;
  concepts_to_study: string[];
  practical_task: string;
  completed: boolean;
}

export interface ApplicationSession {
  id: string;
  updated_at: string;
  company_name: string;
  job_title: string;
  job_description: string;
  resume_text: string;
  resume_filename: string;
  clarification_answers: Record<string, string>;
  analysis?: AnalysisResult;
  tailored_resume?: TailoredResumeData;
  company_research?: CompanyResearchResult;
  interview_prep?: InterviewPrepResult;
  checklist?: ChecklistItem[];
}
