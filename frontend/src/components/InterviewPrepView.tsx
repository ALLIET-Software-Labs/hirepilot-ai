import React, { useState } from 'react';
import { 
  Building2, 
  ExternalLink, 
  Search, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Star, 
  Bookmark, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Code2, 
  Users, 
  BrainCircuit, 
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { CompanyResearchResult, InterviewPrepResult, InterviewQuestionItem } from '../types';

interface InterviewPrepViewProps {
  research: CompanyResearchResult | null;
  interviewPrep: InterviewPrepResult;
  onProceedToChecklist: () => void;
  isLoadingChecklist: boolean;
  loadingStepText: string;
}

export const InterviewPrepView: React.FC<InterviewPrepViewProps> = ({
  research,
  interviewPrep,
  onProceedToChecklist,
  isLoadingChecklist,
  loadingStepText,
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyAnswer = (q: InterviewQuestionItem) => {
    const text = `Q: ${q.question}\n\nWHY IT'S ASKED:\n${q.why_asked}\n\nSUGGESTED ANSWER:\n${q.suggested_answer}\n\nCONCEPTS TO REVISE: ${(q.concepts_to_revise || []).join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = interviewPrep?.categories || [];
  const filteredCategories = activeCategoryFilter === 'All' 
    ? categories 
    : categories.filter((c) => c.category_name === activeCategoryFilter);

  const totalQuestions = categories.reduce((acc, cat) => acc + (cat.questions?.length || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E2E0D8] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-ink-950">
              Company Research & Interview Prep
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cobalt-50 text-cobalt-700 border border-cobalt-200">
              {totalQuestions} Grounded Questions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-600 mt-1">
            Questions tailored to the job description, confirmed resume experience, and real web intelligence.
          </p>
        </div>

        <button
          onClick={onProceedToChecklist}
          disabled={isLoadingChecklist}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-ink-950 text-white hover:bg-ink-900 shadow-card transition-all"
        >
          {isLoadingChecklist ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>{loadingStepText || 'Generating Preparation Plan...'}</span>
            </>
          ) : (
            <>
              <span>Review Preparation Checklist</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Verified Web Research Section (If Company Research was Conducted) */}
      {research && research.has_research ? (
        <div className="bg-white border border-[#E2E0D8] rounded-xl p-6 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F4F3EE] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cobalt-50 text-cobalt-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold text-ink-950">
                  Verified Company Intelligence: {research.company_name}
                </h3>
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Live search verified via {research.provider.toUpperCase()}
                </span>
              </div>
            </div>

            <span className="text-xs font-mono text-ink-500">
              {research.sources?.length || 0} Web Sources Found
            </span>
          </div>

          {/* Sources List with Clickable Links */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-ink-600 uppercase tracking-wider block">
              Verified Web Citations & Snippets
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {research.sources?.slice(0, 4).map((source, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-[#EAE8E0] bg-[#FAF9F5] text-xs space-y-1.5 hover:border-cobalt-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-ink-900 truncate">
                      {source.title || 'Source Citation'}
                    </h4>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cobalt-600 hover:text-cobalt-800 shrink-0"
                        title="Open external source"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-ink-600 line-clamp-3 leading-relaxed">
                    "{source.snippet}"
                  </p>
                  {source.url && (
                    <span className="text-[10px] font-mono text-ink-400 truncate block">
                      {source.url.replace(/^https?:\/\/(www\.)?/, '')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-[#EAE8E0] bg-white text-xs text-ink-600 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-ink-400 shrink-0" />
          <span>
            {research?.message || 'No company name was specified. Interview questions are grounded in target job requirements and confirmed candidate background.'}
          </span>
        </div>
      )}

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2">
        <button
          onClick={() => setActiveCategoryFilter('All')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            activeCategoryFilter === 'All'
              ? 'bg-ink-950 text-white'
              : 'bg-white text-ink-700 border border-[#E2E0D8] hover:bg-[#F4F3EE]'
          }`}
        >
          All Categories ({totalQuestions})
        </button>

        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setActiveCategoryFilter(cat.category_name)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeCategoryFilter === cat.category_name
                ? 'bg-ink-950 text-white'
                : 'bg-white text-ink-700 border border-[#E2E0D8] hover:bg-[#F4F3EE]'
            }`}
          >
            {cat.category_name} ({cat.questions?.length || 0})
          </button>
        ))}
      </div>

      {/* Categorized Interview Questions Accordion */}
      <div className="space-y-6">
        {filteredCategories.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-3">
            <div className="border-b border-[#E2E0D8] pb-1.5">
              <h2 className="font-heading text-base font-bold text-ink-950">
                {cat.category_name}
              </h2>
              {cat.description && (
                <p className="text-xs text-ink-500">{cat.description}</p>
              )}
            </div>

            <div className="space-y-3">
              {cat.questions?.map((q, qIdx) => {
                const isExpanded = expandedQuestions[q.id] ?? (qIdx === 0 && catIdx === 0);
                const isBookmarked = bookmarkedQuestions[q.id];

                return (
                  <div
                    key={q.id || qIdx}
                    className="bg-white border border-[#E2E0D8] rounded-xl overflow-hidden shadow-subtle hover:border-ink-300 transition-all"
                  >
                    {/* Question Header */}
                    <div
                      onClick={() => toggleQuestion(q.id)}
                      className="p-4 sm:p-5 cursor-pointer flex items-start justify-between gap-4 select-none"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-cobalt-700 bg-cobalt-50 px-2 py-0.5 rounded border border-cobalt-200">
                            {q.source_citation || 'JD Core'}
                          </span>
                          {isBookmarked && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>Bookmarked</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-heading text-sm sm:text-base font-bold text-ink-950 pt-1 leading-snug">
                          {q.question}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(q.id);
                          }}
                          className={`p-1.5 rounded hover:bg-[#F4F3EE] transition-colors ${
                            isBookmarked ? 'text-amber-500' : 'text-ink-400 hover:text-ink-700'
                          }`}
                          title="Bookmark for review"
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                        <div className="text-ink-400 p-1">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Answer & Revision Body */}
                    {isExpanded && (
                      <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-[#F4F3EE] space-y-4 bg-[#FAF9F5]/40 text-xs">
                        {/* Why an interviewer asks this */}
                        {q.why_asked && (
                          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                              <BrainCircuit className="w-3.5 h-3.5" />
                              <span>Interviewer Assessment Intent</span>
                            </span>
                            <p className="text-ink-800 leading-relaxed font-normal">
                              {q.why_asked}
                            </p>
                          </div>
                        )}

                        {/* Suggested Answer Framework */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-cobalt-800">
                              Suggested Structured Answer (STAR Framework)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyAnswer(q)}
                              className="text-[11px] font-semibold text-cobalt-700 hover:text-cobalt-800 flex items-center gap-1"
                            >
                              {copiedId === q.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Answer</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="p-3.5 rounded-lg bg-white border border-[#E2E0D8] text-ink-900 leading-relaxed whitespace-pre-line font-sans">
                            {q.suggested_answer}
                          </div>
                        </div>

                        {/* Concepts to Revise */}
                        {q.concepts_to_revise && q.concepts_to_revise.length > 0 && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                              Concepts to Revise:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {q.concepts_to_revise.map((c, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#E2E0D8] text-ink-700 font-mono"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="pt-6 border-t border-[#E2E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-ink-600">
          Interview questions mastered. Proceed to prioritized action checklist.
        </p>
        <button
          onClick={onProceedToChecklist}
          disabled={isLoadingChecklist}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold bg-ink-950 text-white hover:bg-ink-900 shadow-card transition-all disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px]"
        >
          {isLoadingChecklist ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0" />
              <span className="truncate">{loadingStepText || 'Generating Preparation Plan...'}</span>
            </>
          ) : (
            <>
              <span>Continue to Preparation Plan</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
