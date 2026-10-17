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
  FileText
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

  const answeredCount = Object.values(answers).filter((a) => a.trim().length > 0).length;
  const questions = analysis.clarification_questions || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Match Score Card */}
      <div className="bg-white border border-[#E2E0D8] rounded-xl p-6 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cobalt-700 bg-cobalt-50 px-2.5 py-0.5 rounded-full border border-cobalt-200">
            <Shield className="w-3.5 h-3.5" />
            <span>Strict Fact-Checking Mode Active</span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-ink-950">
            Role Alignment & Gap Analysis
          </h1>
          <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
            {analysis.match_score_rationale || 'Analysis derived by comparing confirmed resume evidence against job description requirements.'}
          </p>
        </div>

        {/* Match Heuristic Score */}
        <div className="shrink-0 flex items-center gap-3 bg-[#FAF9F5] border border-[#E2E0D8] px-5 py-3.5 rounded-xl">
          <div className="text-right">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-500">
              ATS Fit Heuristic
            </span>
            <span className="font-heading text-3xl font-extrabold text-ink-950">
              {analysis.match_score_estimate || 75}%
            </span>
          </div>
          <div className="w-10 h-10 rounded-full border-4 border-cobalt-600 border-t-transparent animate-spin-slow flex items-center justify-center text-xs font-bold text-cobalt-700">
            <CheckCircle2 className="w-5 h-5 text-cobalt-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E0D8]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-ink-950 text-ink-950'
              : 'border-transparent text-ink-500 hover:text-ink-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Match & Gap Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab('clarifications')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'clarifications'
              ? 'border-ink-950 text-ink-950'
              : 'border-transparent text-ink-500 hover:text-ink-800'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>Targeted Clarifications</span>
          {questions.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
              {questions.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Overview Breakdown */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Confirmed Skills vs Missing Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Confirmed Candidate Skills */}
            <div className="bg-white border border-[#E2E0D8] rounded-xl p-5 space-y-3 shadow-subtle">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-sm font-bold text-ink-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Confirmed Resume Skills</span>
                </h3>
                <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {analysis.confirmed_skills?.length || 0} Verified
                </span>
              </div>
              <p className="text-[11px] text-ink-600">
                Skills explicitly verified in your resume. We never infer unmentioned competencies.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {analysis.confirmed_skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-md bg-[#FAF9F5] border border-[#E2E0D8] text-ink-900 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Identified Missing Gaps */}
            <div className="bg-white border border-[#E2E0D8] rounded-xl p-5 space-y-3 shadow-subtle">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-sm font-bold text-ink-950 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Identified Gaps & Missing Skills</span>
                </h3>
                <span className="text-[11px] font-mono font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  {analysis.missing_or_gap_requirements?.length || 0} Gaps
                </span>
              </div>
              <p className="text-[11px] text-ink-600">
                JD requirements without direct evidence in your resume.
              </p>
              <div className="space-y-2 pt-1 max-h-64 overflow-y-auto pr-1">
                {analysis.missing_or_gap_requirements?.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-[#EAE8E0] bg-[#FAF9F5] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink-900">{gap.skill_or_requirement}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        gap.importance === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : gap.importance === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {gap.importance} Priority
                      </span>
                    </div>
                    {gap.guidance && (
                      <p className="text-[11px] text-ink-600 leading-normal">{gap.guidance}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Matching Qualifications Evidence Matrix */}
          <div className="bg-white border border-[#E2E0D8] rounded-xl p-5 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-sm font-bold text-ink-950 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cobalt-600" />
                  <span>Matching Qualifications & Resume Evidence</span>
                </h3>
                <p className="text-xs text-ink-600 mt-0.5">
                  Direct cross-references between the job description requirements and your verified resume bullets.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#F4F3EE]">
              {analysis.matching_qualifications?.map((item, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-cobalt-700 uppercase tracking-wider block">
                      Target Job Requirement
                    </span>
                    <p className="text-xs font-semibold text-ink-900 leading-snug">
                      {item.requirement}
                    </p>
                  </div>
                  <div className="space-y-1 pl-0 md:pl-4 md:border-l border-[#F4F3EE]">
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
                      Confirmed Resume Evidence
                    </span>
                    <p className="text-xs font-mono text-ink-700 bg-[#FAF9F5] p-2 rounded border border-[#EAE8E0] leading-relaxed">
                      "{item.resume_evidence}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Clarification Questions */}
      {activeTab === 'clarifications' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Optional Clarification Step</span>
              <p className="text-[11px] leading-relaxed">
                Answering these questions lets ApplyForge AI enhance your tailored resume with specific real details (scale, tools, metrics, versions) you may not have listed. You can answer as many or as few as you like, or skip completely.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="bg-white border border-[#E2E0D8] rounded-xl p-5 space-y-3 shadow-subtle"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cobalt-700 bg-cobalt-50 px-2 py-0.5 rounded">
                      Target Area: {q.target_section || 'Experience'}
                    </span>
                    <span className="text-xs text-ink-400 font-mono">Question {idx + 1} of {questions.length}</span>
                  </div>
                  <h4 className="font-heading text-sm font-bold text-ink-950 pt-1">
                    {q.question}
                  </h4>
                  {q.rationale && (
                    <p className="text-xs text-ink-600 italic">
                      Why this matters: {q.rationale}
                    </p>
                  )}
                </div>

                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Optional: Enter specific details (e.g., 'Used PostgreSQL with connection pooling handling 10k RPS', or 'Led a team of 3 engineers using Scrum')..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-lg border border-[#E2E0D8] bg-[#FAF9F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-cobalt-600 text-ink-900 resize-none leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="pt-4 border-t border-[#E2E0D8] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-ink-600 flex items-center gap-2">
          {activeTab === 'clarifications' ? (
            <span>
              {answeredCount > 0 ? (
                <span className="text-emerald-700 font-medium">
                  {answeredCount} clarification{answeredCount === 1 ? '' : 's'} answered
                </span>
              ) : (
                <span>You can skip questions and proceed anytime.</span>
              )}
            </span>
          ) : (
            <span>Ready to synthesize ATS-optimized resume.</span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {activeTab === 'overview' && questions.length > 0 && (
            <button
              onClick={() => setActiveTab('clarifications')}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-white text-ink-800 border border-[#E2E0D8] hover:bg-[#F4F3EE] transition-colors"
            >
              Review Clarifications ({questions.length})
            </button>
          )}

          <button
            onClick={() => onProceedToTailor(answers)}
            disabled={isLoadingTailor}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-2.5 rounded-lg text-xs font-bold bg-ink-950 text-white hover:bg-ink-900 shadow-card transition-all"
          >
            {isLoadingTailor ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>{loadingStepText || 'Synthesizing Resume with gemma3:4b...'}</span>
              </>
            ) : (
              <>
                <span>Generate Tailored Resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
