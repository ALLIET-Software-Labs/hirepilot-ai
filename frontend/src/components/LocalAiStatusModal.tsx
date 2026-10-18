import React from 'react';
import { 
  X, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Lock,
  Globe2
} from 'lucide-react';
import { SystemHealth } from '../types';

interface LocalAiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemHealth: SystemHealth | null;
  onRefreshHealth: () => void;
  isChecking: boolean;
}

export const LocalAiStatusModal: React.FC<LocalAiStatusModalProps> = ({
  isOpen,
  onClose,
  systemHealth,
  onRefreshHealth,
  isChecking,
}) => {
  if (!isOpen) return null;

  const ollama = systemHealth?.ollama;
  const isModelReady = ollama?.model_available;
  const isConnected = ollama?.connected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-[#E2E0D8] rounded-xl shadow-modal w-full max-w-lg overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E2E0D8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cobalt-600" />
            <h3 className="font-heading text-base font-bold text-ink-950">
              Local AI & Privacy Diagnostics
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-ink-400 hover:text-ink-700 hover:bg-[#F4F3EE] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Status Overview Card */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isModelReady
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : isConnected
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-rose-50/70 border-rose-200 text-rose-950'
          }`}>
            {isModelReady ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-bold text-sm block">
                {isModelReady
                  ? 'Local AI System Operational'
                  : isConnected
                  ? 'Model gemma3:4b Not Installed'
                  : 'Cannot Connect to Ollama'}
              </span>
              <p className="text-[11px] leading-relaxed">
                {ollama?.message || 'Inspecting local Ollama daemon status...'}
              </p>
            </div>
          </div>

          {/* Details Table */}
          <div className="border border-[#E2E0D8] rounded-xl overflow-hidden divide-y divide-[#EAE8E0] bg-[#FAF9F5]/40">
            <div className="px-4 py-2.5 flex justify-between items-center">
              <span className="text-ink-600 font-medium">Inference Engine:</span>
              <span className="font-mono font-semibold text-ink-900">Ollama (Local)</span>
            </div>
            <div className="px-4 py-2.5 flex justify-between items-center">
              <span className="text-ink-600 font-medium">Local Endpoint:</span>
              <span className="font-mono text-ink-800">{ollama?.endpoint || 'http://localhost:11434'}</span>
            </div>
            <div className="px-4 py-2.5 flex justify-between items-center">
              <span className="text-ink-600 font-medium">Target Model:</span>
              <span className="font-mono font-bold text-cobalt-700">gemma3:4b</span>
            </div>
            <div className="px-4 py-2.5 flex justify-between items-center">
              <span className="text-ink-600 font-medium">Web Search Provider:</span>
              <span className="font-mono text-ink-800 flex items-center gap-1">
                <Globe2 className="w-3.5 h-3.5 text-cobalt-600" />
                {systemHealth?.search_provider === 'tavily' ? 'Tavily API' : 'DuckDuckGo Live Search'}
              </span>
            </div>
            <div className="px-4 py-2.5 flex justify-between items-center">
              <span className="text-ink-600 font-medium">Installed Models:</span>
              <span className="font-mono text-ink-700 truncate max-w-[200px]">
                {ollama?.available_models?.join(', ') || 'None detected'}
              </span>
            </div>
          </div>

          {/* Privacy Guarantee */}
          <div className="p-3.5 rounded-xl border border-[#E2E0D8] bg-white space-y-2">
            <div className="flex items-center gap-2 text-ink-950 font-bold">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Zero-Telemetry Privacy Guarantee</span>
            </div>
            <p className="text-[11px] text-ink-600 leading-relaxed font-normal">
              Candidate resumes, contact details, career history, and interview answers are processed strictly by the local <span className="font-mono text-ink-800">gemma3:4b</span> model on your machine. Web search queries only transmit the company name and job title to discover publicly available interview reports.
            </p>
          </div>

          {/* Open Source Maintainer & Support Card */}
          <div className="p-3.5 rounded-xl border border-[#E2E0D8] bg-[#FAF9F5] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img 
                  src="/alliet-emblem.jpg" 
                  alt="Alliet Software Labs" 
                  className="w-5 h-5 rounded object-cover shadow-xs border border-ink-900/10"
                />
                <span className="font-bold text-ink-950 text-xs">Built by Alliet Software Labs</span>
              </div>
              <span className="text-[10px] font-mono text-ink-500 bg-white px-1.5 py-0.5 rounded border border-[#E2E0D8]">
                Open Source
              </span>
            </div>
            <p className="text-[11px] text-ink-600 leading-relaxed font-normal">
              HirePilot AI is engineered and maintained by Alliet Software Labs as a community career intelligence tool.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
              <a 
                href="https://alliet.company/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-cobalt-700 hover:text-cobalt-800 flex items-center gap-1"
              >
                <span>https://alliet.company/</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-ink-300">·</span>
              <a 
                href="mailto:contact@alliet.company"
                className="font-semibold text-ink-700 hover:text-ink-950"
              >
                contact@alliet.company
              </a>
            </div>
          </div>

          {/* Troubleshooting Guide if Offline */}
          {!isModelReady && (
            <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E2E0D8] text-[11px] space-y-1.5 font-mono text-ink-800">
              <span className="font-bold text-ink-900 block font-sans">Quick Setup Instructions:</span>
              <p>1. Start Ollama: <code className="bg-white px-1.5 py-0.5 rounded border">ollama serve</code></p>
              <p>2. Verify model: <code className="bg-white px-1.5 py-0.5 rounded border">ollama run gemma3:4b "hi"</code></p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#FAF9F5] border-t border-[#E2E0D8] flex items-center justify-between">
          <button
            onClick={onRefreshHealth}
            disabled={isChecking}
            className="flex items-center gap-1.5 text-xs font-semibold text-ink-700 hover:text-ink-950 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Re-check Connectivity</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-ink-950 text-white hover:bg-ink-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
