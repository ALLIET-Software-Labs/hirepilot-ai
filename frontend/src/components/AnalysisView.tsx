import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  SkipForward, 
  Check, 
  Info,
  Shield,
  Layers,
  FileText,
  Clock,
  Compass,
  CornerDownRight,
  ChevronRight,
  Zap,
  Target
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisViewProps {
  analysis: AnalysisResult;
  onProceedToTailor: (clarificationAnswers: Record<string, string>) => void;
  isLoadingTailor: boolean;
  loadingStepText: string;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  analysis,
  onProceedToTailor,
  isLoadingTailor,
  loadingStepText,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'clarifications'>('overview');

  const handleAnswerChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const handleApplyQuickChip = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const handleClearAnswer = (questionId: string) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const answeredCount = Object.values(answers).filter((a) => a.trim().length > 0).length;
  const questions = analysis.clarification_questions || [];
  const matchScore = analysis.match_score_estimate || 75;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      
      {/* Top Alignment Score & Fact-Check Card */}
      <div className="bg-white border border-[#E2E0D8] rounded-2xl p-6 sm:p-7 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:border-ink-300">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cobalt-700 bg-cobalt-500/10 px-2.5 py-0.5 rounded-full border border-cobalt-500/20">
              <Shield className="w-3.5 h-3.5 text-cobalt-600" />
              <span>Zero-Fabrication Mode</span>
            </span>
            <span className="text-[11px] text-ink-500 font-medium">
              · Verified Local Inference
            </span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink-950 tracking-tight leading-tight">
            Role Alignment & Gap Audit
          </h1>

          <p className="text-xs sm:text-sm text-ink-600 leading-relaxed font-normal">
            {analysis.match_score_rationale || 'Analysis derived by comparing confirmed resume evidence against job description requirements without fabricating claims.'}
          </p>
        </div>

        {/* ATS Readiness Heuristic Score Gauge */}
        <div className="shrink-0 flex items-center gap-4 bg-gradient-to-br from-[#FAF9F5] to-[#F4F3EE] border border-[#E2E0D8] px-5 py-4 rounded-2xl shadow-subtle min-w-[190px]">
          <div className="text-right">
            <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-ink-500">
              ATS Fit Score
            </span>
            <div className="flex items-baseline justify-end gap-1">
              <span className="font-heading text-3xl sm:text-4xl font-extrabold text-ink-950 tabular-nums tracking-tight">
                {matchScore}
              </span>
              <span className="text-sm font-bold text-ink-500 font-mono">%</span>
            </div>
            <span className={`text-[10px] font-semibold block mt-0.5 ${
              matchScore >= 80 ? 'text-emerald-700' : matchScore >= 60 ? 'text-amber-700' : 'text-ink-600'
            }`}>
              {matchScore >= 80 ? 'High Competency Match' : matchScore >= 60 ? 'Moderate Alignment' : 'Gap Bridging Needed'}
            </span>
          </div>

          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Background Track Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#E2E0D8]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cobalt-600 transition-all duration-1000 ease-out"
                strokeDasharray={`${matchScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <CheckCircle2 className="w-5 h-5 text-cobalt-600 absolute" />
          </div>
        </div>
      </div>

      {/* Segmented Control Pill Navigation */}
      <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-1">
        <div className="bg-[#EFECE6]/80 p-1 rounded-xl border border-[#E2E0D8] inline-flex items-center gap-1 shadow-inner-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`h-9 px-4 rounded-lg text-xs font-bold flex items-center gap-2 transition-all select-none ${
              activeTab === 'overview'
                ? 'bg-white text-ink-950 shadow-xs border border-[#D5D3CB]'
                : 'text-ink-600 hover:text-ink-950 hover:bg-white/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cobalt-600" />
            <span>Match & Gap Breakdown</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-ink-100 text-ink-700 font-bold ml-0.5">
              {analysis.confirmed_skills?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('clarifications')}
            className={`h-9 px-4 rounded-lg text-xs font-bold flex items-center gap-2 transition-all select-none relative ${
              activeTab === 'clarifications'
                ? 'bg-white text-ink-950 shadow-xs border border-[#D5D3CB]'
                : 'text-ink-600 hover:text-ink-950 hover:bg-white/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Targeted Clarifications</span>
            {questions.length > 0 && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                answeredCount > 0 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-900 animate-pulse'
              }`}>
                {questions.length}
              </span>
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-ink-500 font-medium">
          <Clock className="w-3.5 h-3.5 text-ink-400" />
          <span>Step 2 of 5</span>
        </div>
      </div>

      {/* Tab 1: Overview Breakdown */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Confirmed Skills vs Missing Requirements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Confirmed Candidate Skills Card */}
            <div className="bg-white border border-[#E2E0D8] rounded-2xl p-6 space-y-4 shadow-card hover:border-ink-300 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-sm sm:text-base font-bold text-ink-950 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Confirmed Resume Skills</span>
                  </h3>
                  <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {analysis.confirmed_skills?.length || 0} Verified
                  </span>
                </div>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Competencies explicitly extracted from your resume. We never infer unmentioned technologies.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {analysis.confirmed_skills && analysis.confirmed_skills.length > 0 ? (
                  analysis.confirmed_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1 rounded-lg bg-[#FAF9F5] border border-[#E2E0D8] text-ink-900 font-medium hover:border-cobalt-300 transition-colors"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-ink-500 italic">No specific skills parsed from raw text.</span>
                )}
              </div>
            </div>

            {/* Identified Missing Gaps Card */}
            <div className="bg-white border border-[#E2E0D8] rounded-2xl p-6 space-y-4 shadow-card hover:border-ink-300 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-sm sm:text-base font-bold text-ink-950 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Identified Gaps & Missing Skills</span>
                  </h3>
                  <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {analysis.missing_or_gap_requirements?.length || 0} Gaps
                  </span>
                </div>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Key job requirements with no direct proof in your resume. These are prioritized in your Prep Plan.
                </p>
              </div>

              <div className="space-y-2 pt-1 max-h-72 overflow-y-auto pr-1">
                {analysis.missing_or_gap_requirements && analysis.missing_or_gap_requirements.length > 0 ? (
                  analysis.missing_or_gap_requirements.map((gap, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-[#EAE8E0] bg-[#FAF9F5] text-xs space-y-1 hover:border-ink-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-ink-950 truncate">{gap.skill_or_requirement}</span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                          gap.importance === 'High'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : gap.importance === 'Medium'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                          {gap.importance} Priority
                        </span>
                      </div>
                      {gap.guidance && (
                        <p className="text-[11px] text-ink-600 leading-normal">{gap.guidance}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-ink-500 italic">No glaring skill gaps identified!</span>
                )}
              </div>
            </div>
          </div>

          {/* Matching Qualifications Evidence Matrix */}
          <div className="bg-white border border-[#E2E0D8] rounded-2xl p-6 sm:p-7 space-y-5 shadow-card hover:border-ink-300 transition-all">
            <div className="space-y-1">
              <h3 className="font-heading text-base font-bold text-ink-950 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cobalt-600" />
                <span>Target Requirement vs Verified Resume Evidence</span>
              </h3>
              <p className="text-xs text-ink-600">
                Audited correlation matrix showing exact alignment points between job requirements and your background.
              </p>
            </div>

            <div className="divide-y divide-[#F4F3EE] border-t border-[#F4F3EE] pt-1">
              {analysis.matching_qualifications?.map((item, idx) => (
                <div key={idx} className="py-3.5 first:pt-2 last:pb-0 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-cobalt-700 uppercase tracking-wider block">
                      Target Job Requirement
                    </span>
                    <p className="text-xs font-semibold text-ink-950 leading-snug">
                      {item.requirement}
                    </p>
                  </div>
                  <div className="space-y-1 pl-0 md:pl-4 md:border-l border-[#F4F3EE]">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider block">
                      Verified Resume Evidence
                    </span>
                    <p className="text-xs font-mono text-ink-800 bg-[#FAF9F5] p-2.5 rounded-lg border border-[#EAE8E0] leading-relaxed">
                      "{item.resume_evidence}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Clarification Questions (Completely Redesigned with World-Class Psychology) */}
      {activeTab === 'clarifications' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* AI Career Coach Advisor Card (Replaces harsh yellow alert box) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/[0.08] via-amber-500/[0.03] to-transparent border border-amber-500/20 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 mt-0.5 text-amber-700">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-sm text-ink-950">
                    Optional Contextual Clarifications
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-800 bg-amber-100 px-2 py-0.2 rounded-full">
                    Accelerator
                  </span>
                </div>
                <p className="text-xs text-ink-700 leading-relaxed font-normal max-w-2xl">
                  Answering gives ApplyForge AI real metrics, scale, and tools to strengthen your resume without inventing claims. Feel free to answer as few as you like, click quick suggestion chips, or skip completely.
                </p>
              </div>
            </div>

            <button
              onClick={() => onProceedToTailor({})}
              disabled={isLoadingTailor}
              className="text-xs font-semibold text-ink-700 hover:text-ink-950 px-3.5 py-2 rounded-lg bg-white border border-[#E2E0D8] hover:bg-[#FAF9F5] transition-all shrink-0 flex items-center gap-1.5 shadow-xs"
              title="Skip answering and synthesize with existing resume facts"
            >
              <span>Skip All & Tailor Now</span>
              <SkipForward className="w-3.5 h-3.5 text-ink-500" />
            </button>
          </div>

          {/* Clarification Question Cards */}
          <div className="space-y-5">
            {questions.map((q, idx) => {
              const currentVal = answers[q.id] || '';
              const isAnswered = currentVal.trim().length > 0;

              return (
                <div
                  key={q.id || idx}
                  className={`bg-white border rounded-2xl p-6 sm:p-7 space-y-4 shadow-card transition-all ${
                    isAnswered ? 'border-cobalt-300 ring-2 ring-cobalt-500/5' : 'border-[#E2E0D8] hover:border-ink-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cobalt-700 bg-cobalt-50 px-2.5 py-0.5 rounded-full border border-cobalt-200">
                        Target Area: {q.target_section || 'Experience'}
                      </span>
                      {isAnswered && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Answered
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-ink-400 font-mono font-medium">
                      Question {idx + 1} of {questions.length}
                    </span>
                  </div>

                  {/* Question Title */}
                  <h4 className="font-heading text-base sm:text-lg font-bold text-ink-950 leading-snug pt-0.5">
                    {q.question}
                  </h4>

                  {/* Why this matters — Sleek Intelligence Callout */}
                  {q.rationale && (
                    <div className="p-3.5 rounded-xl bg-cobalt-500/[0.04] border border-cobalt-500/15 flex items-start gap-2.5 text-xs text-ink-800">
                      <Sparkles className="w-4 h-4 text-cobalt-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-ink-950 block">Why this matters for your resume:</span>
                        <p className="text-ink-700 leading-relaxed">{q.rationale}</p>
                      </div>
                    </div>
                  )}

                  {/* Textarea Input with Optical Polish */}
                  <div className="space-y-2.5">
                    <textarea
                      value={currentVal}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      placeholder="e.g. Led migration to AWS ECS with Docker, reducing deployment latency by 35%... (or click a quick suggestion below)"
                      rows={3}
                      className="w-full text-xs sm:text-sm p-4 rounded-xl border border-[#D5D3CB] bg-[#FAF9F5] focus:bg-white focus:outline-none focus:ring-4 focus:ring-cobalt-500/10 focus:border-cobalt-600 text-ink-950 placeholder:text-ink-400 resize-none leading-relaxed transition-all shadow-inner-sm"
                    />

                    {/* Quick Suggestion Chips (Friction-Reduction Psychology) */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-ink-500 font-semibold mr-1">
                        Quick Options:
                      </span>
                      
                      <button
                        type="button"
                        onClick={() => handleApplyQuickChip(q.id, "I haven't worked with this in production yet.")}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#EFECE6] border border-[#E2E0D8] text-ink-700 hover:text-ink-950 transition-colors"
                      >
                        Haven't used in production
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyQuickChip(q.id, "Hands-on experience in personal projects and coursework.")}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#EFECE6] border border-[#E2E0D8] text-ink-700 hover:text-ink-950 transition-colors"
                      >
                        Personal projects & coursework
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyQuickChip(q.id, "Self-taught and familiar with the core architectural concepts.")}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#EFECE6] border border-[#E2E0D8] text-ink-700 hover:text-ink-950 transition-colors"
                      >
                        Familiar with core concepts
                      </button>

                      {isAnswered && (
                        <button
                          type="button"
                          onClick={() => handleClearAnswer(q.id)}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors ml-auto"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grounded Workflow Action Dock */}
      <div className="pt-6 border-t border-[#E2E0D8] flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Status Text & Clarity Indicator */}
        <div className="text-xs text-ink-600 flex items-center gap-2">
          {activeTab === 'clarifications' ? (
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${answeredCount > 0 ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              {answeredCount > 0 ? (
                <span className="text-ink-950 font-medium">
                  <strong className="text-emerald-700 font-bold">{answeredCount}</strong> of {questions.length} clarifications answered · Ready to tailor
                </span>
              ) : (
                <span>You can answer questions or skip to proceed anytime.</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Gaps identified. Ready to generate your role-tailored resume.</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {activeTab === 'overview' && questions.length > 0 && (
            <button
              onClick={() => setActiveTab('clarifications')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-ink-800 border border-[#E2E0D8] hover:bg-[#F4F3EE] hover:border-ink-400 transition-all shadow-subtle"
            >
              Review Clarifications ({questions.length})
            </button>
          )}

          {activeTab === 'clarifications' && (
            <button
              onClick={() => onProceedToTailor({})}
              disabled={isLoadingTailor}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-ink-700 border border-[#E2E0D8] hover:bg-[#F4F3EE] hover:text-ink-950 transition-all"
            >
              Skip All
            </button>
          )}

          <button
            onClick={() => onProceedToTailor(answers)}
            disabled={isLoadingTailor}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl text-xs font-bold bg-ink-950 text-white hover:bg-ink-900 shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed min-w-[220px]"
          >
            {isLoadingTailor ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0" />
                <span className="truncate">{loadingStepText || 'Synthesizing Resume with gemma3:4b...'}</span>
              </>
            ) : (
              <>
                <span>Generate Tailored Resume</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
