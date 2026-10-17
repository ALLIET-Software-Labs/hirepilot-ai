import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Search, 
  HelpCircle, 
  CheckSquare, 
  Layers, 
  PlusCircle, 
  ChevronRight,
  Cpu,
  AlertTriangle
} from 'lucide-react';
import { StepId, SystemHealth, ApplicationSession } from '../types';

interface NavbarProps {
  currentStep: StepId;
  onNavigate: (step: StepId) => void;
  systemHealth: SystemHealth | null;
  activeSession: ApplicationSession | null;
  onNewSession: () => void;
  onOpenHealthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onNavigate,
  systemHealth,
  activeSession,
  onNewSession,
  onOpenHealthModal,
}) => {
  const steps: { id: StepId; label: string; icon: React.ReactNode; requiresSession: boolean }[] = [
    { id: 'setup', label: '1. Setup', icon: <Layers className="w-4 h-4" />, requiresSession: false },
    { id: 'analysis', label: '2. Analysis & Gaps', icon: <Search className="w-4 h-4" />, requiresSession: true },
    { id: 'studio', label: '3. Tailored Resume', icon: <FileText className="w-4 h-4" />, requiresSession: true },
    { id: 'interview', label: '4. Interview Prep', icon: <HelpCircle className="w-4 h-4" />, requiresSession: true },
    { id: 'checklist', label: '5. Preparation Plan', icon: <CheckSquare className="w-4 h-4" />, requiresSession: true },
  ];

  const isModelReady = systemHealth?.ollama?.model_available;
  const isOllamaConnected = systemHealth?.ollama?.connected;

  // Calculate checklist progress if available
  const totalItems = activeSession?.checklist?.length || 0;
  const completedItems = activeSession?.checklist?.filter((c) => c.completed).length || 0;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[#E2E0D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Wordmark & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-cobalt-600 rounded-md p-1 -m-1"
              title="ApplyForge AI Home"
            >
              <div className="w-8 h-8 rounded-lg bg-ink-950 flex items-center justify-center text-white shadow-subtle group-hover:bg-cobalt-600 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 7h16M7 7v7a5 5 0 0 0 10 0V7" />
                  <path d="M12 14v6M8 20h8" />
                </svg>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-bold text-lg text-ink-950 tracking-tight">
                    ApplyForge
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cobalt-50 text-cobalt-700 border border-cobalt-200">
                    AI Local
                  </span>
                </div>
              </div>
            </button>

            {/* Current Active Job Badge */}
            {activeSession && activeSession.job_title && (
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#E2E0D8] text-xs text-ink-700">
                <span className="truncate max-w-[180px] font-medium text-ink-900">
                  {activeSession.company_name ? `${activeSession.company_name} — ` : ''}{activeSession.job_title}
                </span>
              </div>
            )}
          </div>

          {/* Step Workflow Navigation */}
          {currentStep !== 'landing' && (
            <nav className="hidden lg:flex items-center gap-1">
              {steps.map((step) => {
                const isActive = currentStep === step.id;
                const isDisabled = step.requiresSession && !activeSession?.analysis;
                return (
                  <button
                    key={step.id}
                    onClick={() => !isDisabled && onNavigate(step.id)}
                    disabled={isDisabled}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-ink-950 text-white shadow-sm'
                        : isDisabled
                        ? 'text-ink-400 cursor-not-allowed opacity-60'
                        : 'text-ink-700 hover:text-ink-950 hover:bg-[#EFECE6]'
                    }`}
                  >
                    {step.icon}
                    <span>{step.label}</span>
                    {step.id === 'checklist' && totalItems > 0 && (
                      <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-cobalt-500 text-white' : 'bg-cobalt-100 text-cobalt-800'
                      }`}>
                        {progressPercent}%
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Controls: Model Pill & Action */}
          <div className="flex items-center gap-3">
            {/* Ollama Local Health Pill */}
            <button
              onClick={onOpenHealthModal}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                isModelReady
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : isOllamaConnected
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
              title="Click to view local model status & privacy details"
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isModelReady ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isModelReady ? 'bg-emerald-500' : isOllamaConnected ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
              </span>
              <span className="hidden sm:inline font-mono text-[11px]">
                {isModelReady ? 'gemma3:4b (Local)' : isOllamaConnected ? 'Model Missing' : 'Ollama Offline'}
              </span>
            </button>

            {/* New Application CTA */}
            <button
              onClick={onNewSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-ink-900 border border-[#E2E0D8] hover:bg-[#F4F3EE] hover:border-ink-400 shadow-subtle transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cobalt-600" />
              <span>New Job</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
