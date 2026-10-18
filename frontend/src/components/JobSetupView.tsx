import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Building2, 
  Briefcase, 
  Link as LinkIcon, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Edit3, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ParsedResume } from '../types';
import { api } from '../services/api';

interface JobSetupViewProps {
  initialResumeText: string;
  initialResumeFilename: string;
  initialJobDescription: string;
  initialCompanyName: string;
  initialJobTitle: string;
  onProceedToAnalysis: (data: {
    resumeText: string;
    resumeFilename: string;
    jobDescription: string;
    companyName: string;
    jobTitle: string;
    parsedResumeMetadata?: ParsedResume | null;
  }) => Promise<void>;
  isLoading: boolean;
  loadingStepText: string;
}

export const JobSetupView: React.FC<JobSetupViewProps> = ({
  initialResumeText,
  initialResumeFilename,
  initialJobDescription,
  initialCompanyName,
  initialJobTitle,
  onProceedToAnalysis,
  isLoading,
  loadingStepText,
}) => {
  const [resumeText, setResumeText] = useState(initialResumeText);
  const [resumeFilename, setResumeFilename] = useState(initialResumeFilename);
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [jobTitle, setJobTitle] = useState(initialJobTitle);
  const [jobUrl, setJobUrl] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Senior');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [parsedMetadata, setParsedMetadata] = useState<ParsedResume | null>(null);
  const [showManualEditor, setShowManualEditor] = useState(!initialResumeText);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const result = await api.parseResumeFile(file);
      setResumeText(result.text);
      setResumeFilename(result.filename);
      setParsedMetadata(result);
      setShowManualEditor(false);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to read file. Please verify it is a valid PDF, DOCX, or TXT.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const isFormValid = resumeText.trim().length >= 100 && jobDescription.trim().length >= 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;
    onProceedToAnalysis({
      resumeText,
      resumeFilename: resumeFilename || 'Uploaded_Resume.txt',
      jobDescription,
      companyName,
      jobTitle,
      parsedResumeMetadata: parsedMetadata,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider text-cobalt-700 bg-cobalt-500/10 border border-cobalt-500/20">
          <span>Step 1 of 5</span>
          <span>·</span>
          <span>Role Ingestion</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink-950 tracking-tight leading-tight">
          Job & Candidate Setup
        </h1>
        <p className="text-xs sm:text-sm text-ink-600 leading-relaxed max-w-2xl font-normal">
          Upload your existing resume and paste the target job description to initiate the grounded gap comparison. Your career data remains 100% on-device.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Resume Input */}
          <div className="bg-white border border-[#E2E0D8] rounded-2xl p-6 sm:p-7 shadow-card space-y-4 hover:border-ink-300 transition-all">
            <div className="flex items-center justify-between">
              <label className="font-heading text-sm font-bold text-ink-950 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cobalt-600" />
                <span>Candidate Resume</span>
              </label>

              {resumeText && (
                <button
                  type="button"
                  onClick={() => setShowManualEditor(!showManualEditor)}
                  className="text-xs text-cobalt-700 hover:text-cobalt-800 flex items-center gap-1 font-semibold"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{showManualEditor ? 'Hide Text Editor' : 'Edit Text'}</span>
                </button>
              )}
            </div>

            {/* Drag & Drop Upload Card */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                resumeText && !uploadError
                  ? 'border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/50'
                  : 'border-[#D5D1C7] bg-[#FAF9F5] hover:border-cobalt-500 hover:bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {isUploading ? (
                <div className="py-4 space-y-2 flex flex-col items-center">
                  <Loader2 className="w-7 h-7 text-cobalt-600 animate-spin" />
                  <p className="text-xs font-semibold text-ink-800">
                    Extracting document text locally...
                  </p>
                </div>
              ) : resumeText ? (
                <div className="space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink-900 truncate max-w-xs mx-auto">
                      {resumeFilename || 'Resume Loaded'}
                    </h4>
                    <p className="text-[11px] text-ink-600 mt-0.5">
                      {resumeText.split(/\s+/).filter(Boolean).length} words extracted successfully
                    </p>
                    {parsedMetadata?.detected_name && (
                      <p className="text-[11px] font-mono text-cobalt-700 mt-0.5">
                        Detected: {parsedMetadata.detected_name}
                      </p>
                    )}
                  </div>
                  <span className="inline-block text-[10px] text-cobalt-700 font-semibold underline mt-1">
                    Click or drop another file to replace
                  </span>
                </div>
              ) : (
                <div className="py-4 space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-ivory-200 text-ink-600 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-cobalt-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-900">
                      Drop resume file here, or <span className="text-cobalt-600 underline">browse</span>
                    </p>
                    <p className="text-[11px] text-ink-500 mt-0.5">
                      Supports PDF, DOCX, and TXT (Max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Direct Text Editor Fallback */}
            {showManualEditor && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs text-ink-600">
                  <span>Resume Content (Raw Text)</span>
                  <span className="font-mono">
                    {resumeText.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here (experience, skills, projects, education)..."
                  rows={9}
                  className="w-full text-xs font-mono p-3 rounded-lg border border-[#E2E0D8] bg-white focus:outline-none focus:ring-2 focus:ring-cobalt-600 text-ink-900 resize-none leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Right Column: Job Description & Target Details */}
          <div className="bg-white border border-[#E2E0D8] rounded-2xl p-6 sm:p-7 shadow-card space-y-4 hover:border-ink-300 transition-all">
            <div className="flex items-center justify-between">
              <label className="font-heading text-sm font-bold text-ink-950 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cobalt-600" />
                <span>Target Job & Role Requirements</span>
              </label>
              <span className="text-[11px] font-mono text-ink-500 font-medium bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E2E0D8]">
                {jobDescription.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            {/* Meta fields: Company & Job Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-mono font-bold text-ink-600 uppercase tracking-wider mb-1">
                  Company Name <span className="text-cobalt-600 font-normal">(for web research)</span>
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-400" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Stripe, Wipro, Google"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#D5D3CB] bg-[#FAF9F5] focus:bg-white text-ink-950 focus:outline-none focus:ring-4 focus:ring-cobalt-500/10 focus:border-cobalt-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-ink-600 uppercase tracking-wider mb-1">
                  Target Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5D3CB] bg-[#FAF9F5] focus:bg-white text-ink-950 focus:outline-none focus:ring-4 focus:ring-cobalt-500/10 focus:border-cobalt-600 transition-all"
                />
              </div>
            </div>

            {/* Job Description Textarea */}
            <div className="space-y-1.5">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here (responsibilities, technical qualifications, cloud/tooling requirements)..."
                rows={11}
                className="w-full text-xs sm:text-sm p-4 rounded-xl border border-[#D5D3CB] bg-[#FAF9F5] focus:bg-white focus:outline-none focus:ring-4 focus:ring-cobalt-500/10 focus:border-cobalt-600 text-ink-950 placeholder:text-ink-400 resize-none leading-relaxed transition-all shadow-inner-sm"
              />
            </div>
          </div>
        </div>

        {/* Action Button & Loading Feedback */}
        <div className="pt-4 border-t border-[#E2E0D8] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-ink-600">
            {!isFormValid ? (
              <span className="text-amber-700 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Please provide both a resume and job description (minimum 100 characters each)
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Inputs validated and ready for local AI processing
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold transition-all shadow-card ${
              !isFormValid || isLoading
                ? 'bg-ink-300 text-ink-500 cursor-not-allowed'
                : 'bg-ink-950 text-white hover:bg-ink-900 hover:shadow-card-hover'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cobalt-400" />
                <span>{loadingStepText || 'Analyzing with Local gemma3:4b...'}</span>
              </>
            ) : (
              <>
                <span>Analyze Job & Match Resume</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
