import {
  SystemHealth,
  ParsedResume,
  AnalysisResult,
  TailoredResumeData,
  CompanyResearchResult,
  InterviewPrepResult,
  ChecklistItem
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback to text
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new ApiError(errorMessage, response.status);
    }

    return await response.json() as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Unable to connect to ApplyForge AI backend service.', 0);
  }
}

export const api = {
  getHealth: async (): Promise<SystemHealth> => {
    return request<SystemHealth>('/api/health');
  },

  parseResumeFile: async (file: File): Promise<ParsedResume> => {
    const formData = new FormData();
    formData.append('file', file);
    return request<ParsedResume>('/api/parse-resume', {
      method: 'POST',
      body: formData,
    });
  },

  parseResumeText: async (rawText: string): Promise<ParsedResume> => {
    const formData = new FormData();
    formData.append('raw_text', rawText);
    return request<ParsedResume>('/api/parse-resume', {
      method: 'POST',
      body: formData,
    });
  },

  analyzeJob: async (data: {
    resume_text: string;
    job_description: string;
    company_name?: string;
    job_title?: string;
  }): Promise<AnalysisResult> => {
    return request<AnalysisResult>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  tailorResume: async (data: {
    resume_text: string;
    job_description: string;
    clarification_answers?: Record<string, string>;
    target_role?: string;
    contact_info?: any;
  }): Promise<TailoredResumeData> => {
    return request<TailoredResumeData>('/api/tailor-resume', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  researchCompany: async (data: {
    company_name: string;
    job_title?: string;
  }): Promise<CompanyResearchResult> => {
    return request<CompanyResearchResult>('/api/company-research', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  generateInterviewPrep: async (data: {
    job_description: string;
    resume_text: string;
    company_name?: string;
    job_title?: string;
    research_summary?: CompanyResearchResult | null;
  }): Promise<InterviewPrepResult> => {
    return request<InterviewPrepResult>('/api/interview-prep', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  generateChecklist: async (data: {
    job_description: string;
    resume_text: string;
    gaps?: any[];
    company_name?: string;
  }): Promise<{ checklist_items: ChecklistItem[] }> => {
    return request<{ checklist_items: ChecklistItem[] }>('/api/checklist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  exportDocx: async (resumeData: TailoredResumeData, filename: string = 'ApplyForge_Resume.docx'): Promise<void> => {
    const response = await fetch(`${API_BASE}/api/export-docx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resumeData),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate DOCX file: ${response.statusText}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};
