import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  FileCheck2, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Trash2, 
  Play, 
  Building2, 
  CheckSquare,
  Lock,
  FileText
} from 'lucide-react';
import { ApplicationSession } from '../types';
import { SAMPLE_RESUME, SAMPLE_JOB_DESCRIPTION, SAMPLE_COMPANY, SAMPLE_TITLE } from '../data/sampleData';

interface LandingWorkspaceProps {
  sessions: ApplicationSession[];
  onStartNew: () => void;
  onSelectSession: (session: ApplicationSession) => void;
  onDeleteSession: (id: string) => void;
  onLoadSample: (resume: string, jd: string, company: string, title: string) => void;
}

export const LandingWorkspace: React.FC<LandingWorkspaceProps> = ({
  sessions,
  onStartNew,
  onSelectSession,
  onDeleteSession,
  onLoadSample,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-ink-800 border border-[#E2E0D8] shadow-xs">
          <a 
            href="https://alliet.company/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-ink-900 hover:text-cobalt-600 transition-colors"
            title="Alliet Software Labs"
          >
            <img src="/alliet-emblem.jpg" alt="Alliet" className="w-3.5 h-3.5 rounded object-cover" />
            <span>Built by Alliet Software Labs</span>
          </a>
          <span className="text-ink-300">·</span>
          <span className="text-cobalt-700 flex items-center gap-1">
            <Lock className="w-3 h-3 text-cobalt-600" />
            100% Local Private AI
          </span>
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-ink-950 tracking-tight leading-[1.15]">
          Turn any job description into your application and interview game plan.
        </h1>

        <p className="text-base sm:text-lg text-ink-700 leading-relaxed font-normal">
          ApplyForge AI analyzes your verified experience against target role requirements, crafts an ATS-optimized resume without fabricating skills, searches real interview reports, and creates an actionable 0–100% preparation checklist.
        </p>

        {/* Primary CTA Buttons */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onStartNew}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-ink-950 text-white hover:bg-ink-900 shadow-card hover:shadow-card-hover transition-all group"
          >
            <span>Prepare for a Job</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onLoadSample(SAMPLE_RESUME, SAMPLE_JOB_DESCRIPTION, SAMPLE_COMPANY, SAMPLE_TITLE)}
            className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold bg-white text-ink-800 border border-[#E2E0D8] hover:bg-[#F4F3EE] hover:border-ink-400 transition-all shadow-subtle"
          >
            <Play className="w-4 h-4 text-cobalt-600 fill-cobalt-600/20" />
            <span>Try Sample Role (Stripe Staff Eng)</span>
          </button>
        </div>

        {/* Privacy Callout */}
        <div className="pt-2 flex items-center justify-center gap-6 text-xs text-ink-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Local Inference (Ollama gemma3:4b)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-ink-500" />
            <span>Resume Never Leaves Your PC</span>
          </div>
        </div>
      </div>

      {/* Recent Sessions or Beautiful Empty State */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-ink-950">
              Workspace Applications
            </h2>
            <p className="text-xs text-ink-600">
              Prepared roles stored locally in your browser
            </p>
          </div>
          {sessions.length > 0 && (
            <span className="text-xs font-mono font-medium text-ink-500">
              {sessions.length} Saved {sessions.length === 1 ? 'Role' : 'Roles'}
            </span>
          )}
        </div>

        {sessions.length === 0 ? (
          /* Empty State */
          <div className="border border-dashed border-[#D5D1C7] rounded-xl p-10 bg-white text-center space-y-4 shadow-subtle">
            <div className="w-12 h-12 mx-auto rounded-xl bg-ivory-200 border border-[#E2E0D8] flex items-center justify-center text-ink-600">
              <FileText className="w-6 h-6 text-ink-600" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-heading text-base font-semibold text-ink-900">
                No job applications created yet
              </h3>
              <p className="text-xs text-ink-600">
                Start by uploading your resume and pasting a target job description, or load our pre-configured demo to explore the workflow.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onStartNew}
                className="px-4 py-2 rounded-md text-xs font-semibold bg-ink-950 text-white hover:bg-ink-900 transition-colors"
              >
                Start New Application
              </button>
              <button
                onClick={() => onLoadSample(SAMPLE_RESUME, SAMPLE_JOB_DESCRIPTION, SAMPLE_COMPANY, SAMPLE_TITLE)}
                className="px-4 py-2 rounded-md text-xs font-semibold bg-[#F4F3EE] text-ink-800 hover:bg-[#EFECE6] border border-[#E2E0D8] transition-colors"
              >
                Load Sample Application
              </button>
            </div>
          </div>
        ) : (
          /* Sessions Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => {
              const checklistTotal = session.checklist?.length || 0;
              const checklistDone = session.checklist?.filter((c) => c.completed).length || 0;
              const progress = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;
              const formattedDate = new Date(session.updated_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={session.id}
                  className="group relative bg-white border border-[#E2E0D8] rounded-xl p-5 hover:border-ink-400 hover:shadow-card-hover transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#E2E0D8] flex items-center justify-center text-ink-700">
                          <Building2 className="w-4 h-4 text-cobalt-600" />
                        </div>
                        <div>
                          <h4 className="font-heading text-sm font-bold text-ink-950 truncate max-w-[170px]">
                            {session.company_name || 'Target Company'}
                          </h4>
                          <span className="text-[11px] text-ink-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formattedDate}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="text-ink-400 hover:text-forge-crimson p-1 rounded hover:bg-rose-50 transition-colors"
                        title="Delete application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-ink-900 truncate">
                        {session.job_title || 'Software Engineering Role'}
                      </div>
                      <div className="text-[11px] text-ink-600 truncate mt-0.5">
                        {session.resume_filename || 'Uploaded Resume'}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-ink-600">Readiness Progress</span>
                        <span className="font-mono font-bold text-ink-900">{progress}%</span>
                      </div>
                      <div className="w-full bg-[#EFECE6] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-cobalt-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#F4F3EE] mt-4 flex items-center justify-between">
                    <button
                      onClick={() => onSelectSession(session)}
                      className="text-xs font-semibold text-cobalt-700 hover:text-cobalt-800 flex items-center gap-1 group-hover:underline"
                    >
                      <span>Resume Preparation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono bg-ivory-200 px-1.5 py-0.5 rounded text-ink-700">
                      {checklistDone}/{checklistTotal} topics
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feature Pillars — Editorial Layout */}
      <div className="pt-8 border-t border-[#E2E0D8]">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h3 className="font-heading text-xl font-bold text-ink-950">
            Engineered for Grounded Accuracy
          </h3>
          <p className="text-xs sm:text-sm text-ink-600">
            Unlike generic conversational AI, ApplyForge AI operates strictly on verified facts and proven recruiting standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-[#E2E0D8] rounded-xl p-5 space-y-2.5 shadow-subtle">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h4 className="font-heading text-sm font-bold text-ink-950">
              Zero-Fabrication Guarantee
            </h4>
            <p className="text-xs text-ink-600 leading-relaxed">
              We never invent skills, metrics, degrees, or positions. Every bullet is strictly grounded in what you have verified.
            </p>
          </div>

          <div className="bg-white border border-[#E2E0D8] rounded-xl p-5 space-y-2.5 shadow-subtle">
            <div className="w-8 h-8 rounded-lg bg-cobalt-50 text-cobalt-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-heading text-sm font-bold text-ink-950">
              ATS Single-Column Format
            </h4>
            <p className="text-xs text-ink-600 leading-relaxed">
              Optimized for automated parsers with clean typography, no tables, and clear headings. Export to PDF or Word (.docx).
            </p>
          </div>

          <div className="bg-white border border-[#E2E0D8] rounded-xl p-5 space-y-2.5 shadow-subtle">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <h4 className="font-heading text-sm font-bold text-ink-950">
              Verified Web Research
            </h4>
            <p className="text-xs text-ink-600 leading-relaxed">
              Real web search extracts company tech stacks and reported interview questions with live citation source links.
            </p>
          </div>

          <div className="bg-white border border-[#E2E0D8] rounded-xl p-5 space-y-2.5 shadow-subtle">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h4 className="font-heading text-sm font-bold text-ink-950">
              0–100% Preparation Plan
            </h4>
            <p className="text-xs text-ink-600 leading-relaxed">
              Prioritized checklist covering technical gaps, architecture concepts, and behavioral scenarios to track your readiness.
            </p>
          </div>
        </div>

        {/* Alliet Software Labs Open Source Showcase */}
        <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#080E24] to-[#121B3B] text-white shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-white/10 text-white border border-white/15">
              <span>Open Source Platform</span>
              <span>·</span>
              <span className="text-cobalt-300">Alliet Software Labs</span>
            </div>
            <h4 className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight">
              Built for Candidate Privacy & Real Results
            </h4>
            <p className="text-xs sm:text-sm text-ink-200 leading-relaxed font-normal">
              ApplyForge AI is engineered and maintained by <strong>Alliet Software Labs</strong>. We believe your career history and interview preparation should remain 100% private and on your device.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="https://alliet.company/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-ink-950 hover:bg-ink-100 transition-all shadow-subtle flex items-center gap-2"
            >
              <span>Visit alliet.company</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="mailto:contact@alliet.company"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all"
            >
              contact@alliet.company
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
