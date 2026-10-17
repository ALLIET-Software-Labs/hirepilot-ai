import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckSquare, 
  Square, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Filter, 
  BookOpen, 
  AlertCircle, 
  Check, 
  Trophy,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { ChecklistItem } from '../types';

interface ChecklistViewProps {
  initialChecklist: ChecklistItem[];
  onUpdateChecklist: (items: ChecklistItem[]) => void;
  onNavigateToStep: (step: any) => void;
  companyName: string;
  jobTitle: string;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  initialChecklist,
  onUpdateChecklist,
  onNavigateToStep,
  companyName,
  jobTitle,
}) => {
  const [items, setItems] = useState<ChecklistItem[]>(initialChecklist);
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  // Sync state if initialChecklist changes
  useEffect(() => {
    setItems(initialChecklist);
  }, [initialChecklist]);

  // Compute stats
  const total = items.length;
  const completed = items.filter((i) => i.completed).length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const highPriorityRemaining = items.filter((i) => i.priority === 'High' && !i.completed).length;

  // Trigger celebration on reaching 100%
  useEffect(() => {
    if (progressPercent === 100 && total > 0 && !hasTriggeredConfetti) {
      setHasTriggeredConfetti(true);
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2563EB', '#0D9488', '#0F172A', '#FDE68A'],
        });
      } catch (e) {
        // ignore if canvas unavailable
      }
    } else if (progressPercent < 100) {
      setHasTriggeredConfetti(false);
    }
  }, [progressPercent, total, hasTriggeredConfetti]);

  const toggleItem = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updated);
    onUpdateChecklist(updated);
  };

  const markAllComplete = () => {
    const updated = items.map((i) => ({ ...i, completed: true }));
    setItems(updated);
    onUpdateChecklist(updated);
  };

  const resetAll = () => {
    const updated = items.map((i) => ({ ...i, completed: false }));
    setItems(updated);
    onUpdateChecklist(updated);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Completed' && item.completed) ||
      (statusFilter === 'Pending' && !item.completed);
    return matchesPriority && matchesStatus;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-2xl font-bold text-ink-950">
            Prioritized Preparation Checklist
          </h1>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cobalt-50 text-cobalt-700 border border-cobalt-200">
            {total} Action Topics
          </span>
        </div>
        <p className="text-xs sm:text-sm text-ink-600">
          Targeted study roadmap constructed from your resume gaps, target role requirements, and technical interview benchmarks.
        </p>
      </div>

      {/* Progress & Milestone Overview Card */}
      <div className="bg-white border border-[#E2E0D8] rounded-xl p-6 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-ink-500">
                Application Preparation Readiness
              </span>
              {progressPercent === 100 && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Checklist Complete</span>
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-3xl font-extrabold text-ink-950">
                {progressPercent}%
              </span>
              <span className="text-xs text-ink-600">
                ({completed} of {total} topics mastered)
              </span>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3">
            {highPriorityRemaining > 0 ? (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg text-xs text-rose-800">
                <Flame className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">
                  {highPriorityRemaining} High Priority Remaining
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">All High Priority Covered!</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#EFECE6] rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              progressPercent === 100 ? 'bg-emerald-600' : 'bg-cobalt-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Disclaimer / Realism Note */}
        <p className="text-[11px] text-ink-500 italic pt-1">
          * Note: 100% progress reflects completion of this structured preparation plan; it does not guarantee interview offers or measure actual live testing performance.
        </p>
      </div>

      {/* 100% Celebration Banner */}
      {progressPercent === 100 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-subtle flex items-start gap-4 animate-fadeIn">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-heading text-sm font-bold text-emerald-950">
              Checklist Fully Completed! Readiness Plan Achieved.
            </h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              You have systematically reviewed all identified JD gap concepts, system architecture principles, and behavioral interview questions for {companyName || 'the role'}. Your customized ATS resume is ready to download.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => onNavigateToStep('studio')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 transition-colors flex items-center gap-1.5"
              >
                <span>Download Tailored Resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Bulk Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E0D8] pb-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-ink-600 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Priority:</span>
          </span>
          {(['All', 'High', 'Medium', 'Low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                priorityFilter === p
                  ? 'bg-ink-950 text-white'
                  : 'bg-white text-ink-700 border border-[#E2E0D8] hover:bg-[#F4F3EE]'
              }`}
            >
              {p}
            </button>
          ))}

          <span className="font-semibold text-ink-600 ml-3">Status:</span>
          {(['All', 'Pending', 'Completed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                statusFilter === s
                  ? 'bg-ink-950 text-white'
                  : 'bg-white text-ink-700 border border-[#E2E0D8] hover:bg-[#F4F3EE]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={markAllComplete}
            className="text-ink-600 hover:text-ink-900 font-medium px-2 py-1 rounded hover:bg-[#F4F3EE]"
          >
            Mark All Done
          </button>
          <span className="text-ink-300">|</span>
          <button
            onClick={resetAll}
            className="text-ink-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Checklist Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-10 bg-white border border-[#E2E0D8] rounded-xl text-xs text-ink-500">
            No preparation items match the selected filter criteria.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`group p-4 sm:p-5 rounded-xl border transition-all cursor-pointer flex items-start gap-4 select-none ${
                item.completed
                  ? 'bg-[#FAF9F5]/70 border-[#E2E0D8] opacity-75'
                  : 'bg-white border-[#E2E0D8] hover:border-ink-400 hover:shadow-subtle'
              }`}
            >
              {/* Checkbox */}
              <div className="pt-0.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(item.id);
                  }}
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    item.completed
                      ? 'bg-cobalt-600 border-cobalt-600 text-white'
                      : 'border-[#CBD5E1] bg-white hover:border-cobalt-500'
                  }`}
                >
                  {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              </div>

              {/* Item Content */}
              <div className="space-y-1.5 flex-1 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    item.priority === 'High'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : item.priority === 'Medium'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}>
                    {item.priority} Priority
                  </span>

                  {item.category && (
                    <span className="text-[10px] font-mono text-ink-500 bg-ivory-200 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  )}
                </div>

                <h3 className={`font-heading text-sm sm:text-base font-bold text-ink-950 ${
                  item.completed ? 'line-through text-ink-500' : ''
                }`}>
                  {item.topic}
                </h3>

                {/* Why it matters */}
                {item.why_it_matters && (
                  <p className="text-ink-600 leading-relaxed font-normal">
                    <span className="font-semibold text-ink-800">Why it matters: </span>
                    {item.why_it_matters}
                  </p>
                )}

                {/* Concepts to study */}
                {item.concepts_to_study && item.concepts_to_study.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider mr-1">
                      Key Concepts:
                    </span>
                    {item.concepts_to_study.map((c, cIdx) => (
                      <span
                        key={cIdx}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#FAF9F5] border border-[#EAE8E0] text-ink-700 font-mono"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Practical revision task */}
                {item.practical_task && (
                  <div className="mt-2 p-2.5 rounded-lg bg-[#FAF9F5] border border-[#EAE8E0] text-[11px] text-ink-800 flex items-start gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-cobalt-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-ink-900">Recommended Exercise: </span>
                      <span>{item.practical_task}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
