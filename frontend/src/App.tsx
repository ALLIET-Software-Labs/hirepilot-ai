import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingWorkspace } from './components/LandingWorkspace';
import { JobSetupView } from './components/JobSetupView';
import { AnalysisView } from './components/AnalysisView';
import { ResumeStudioView } from './components/ResumeStudioView';
import { InterviewPrepView } from './components/InterviewPrepView';
import { ChecklistView } from './components/ChecklistView';
import { LocalAiStatusModal } from './components/LocalAiStatusModal';
import { 
  StepId, 
  SystemHealth, 
  ApplicationSession, 
  ParsedResume, 
  TailoredResumeData, 
  ChecklistItem 
} from './types';
import { api } from './services/api';
import { storage } from './services/storage';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';

export function App() {
  const [currentStep, setCurrentStep] = useState<StepId>('landing');
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

  const [sessions, setSessions] = useState<ApplicationSession[]>([]);
  const [activeSession, setActiveSession] = useState<ApplicationSession | null>(null);

  // Setup view form scratch state
  const [setupResumeText, setSetupResumeText] = useState('');
  const [setupResumeFilename, setSetupResumeFilename] = useState('');
  const [setupJobDescription, setSetupJobDescription] = useState('');
  const [setupCompanyName, setSetupCompanyName] = useState('');
  const [setupJobTitle, setSetupJobTitle] = useState('');

  // Global loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load initial health and sessions
  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const health = await api.getHealth();
      setSystemHealth(health);
    } catch (e: any) {
      console.warn('Backend or Ollama not reachable:', e);
      setSystemHealth({
        status: 'offline',
        privacy_mode: 'local_inference',
        search_provider: 'duckduckgo_fallback',
        tavily_configured: false,
        ollama: {
          connected: false,
          target_model: 'gemma3:4b',
          model_available: false,
          available_models: [],
          endpoint: 'http://localhost:11434',
          message: 'HirePilot backend or Ollama is offline. Start the backend and Ollama to enable local AI.'
        }
      });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const loadedSessions = storage.getSessions();
    setSessions(loadedSessions);

    const activeId = storage.getActiveSessionId();
    if (activeId) {
      const current = loadedSessions.find((s) => s.id === activeId);
      if (current) {
        setActiveSession(current);
        setSetupResumeText(current.resume_text || '');
        setSetupResumeFilename(current.resume_filename || '');
        setSetupJobDescription(current.job_description || '');
        setSetupCompanyName(current.company_name || '');
        setSetupJobTitle(current.job_title || '');
      }
    }
  }, []);

  // Action handlers
  const handleStartNew = () => {
    setActiveSession(null);
    storage.setActiveSessionId(null);
    setSetupResumeText('');
    setSetupResumeFilename('');
    setSetupJobDescription('');
    setSetupCompanyName('');
    setSetupJobTitle('');
    setErrorMessage(null);
    setCurrentStep('setup');
  };

  const handleSelectSession = (session: ApplicationSession) => {
    setActiveSession(session);
    storage.setActiveSessionId(session.id);
    setSetupResumeText(session.resume_text || '');
    setSetupResumeFilename(session.resume_filename || '');
    setSetupJobDescription(session.job_description || '');
    setSetupCompanyName(session.company_name || '');
    setSetupJobTitle(session.job_title || '');
    setErrorMessage(null);

    // Navigate to furthest completed step
    if (session.checklist && session.checklist.length > 0) {
      setCurrentStep('checklist');
    } else if (session.interview_prep) {
      setCurrentStep('interview');
    } else if (session.tailored_resume) {
      setCurrentStep('studio');
    } else if (session.analysis) {
      setCurrentStep('analysis');
    } else {
      setCurrentStep('setup');
    }
  };

  const handleDeleteSession = (id: string) => {
    storage.deleteSession(id);
    const updated = storage.getSessions();
    setSessions(updated);
    if (activeSession?.id === id) {
      setActiveSession(null);
      setCurrentStep('landing');
    }
  };

  const handleLoadSample = (resume: string, jd: string, company: string, title: string) => {
    setActiveSession(null);
    storage.setActiveSessionId(null);
    setSetupResumeText(resume);
    setSetupResumeFilename('Alex_Rivera_Staff_Engineer_Resume.txt');
    setSetupJobDescription(jd);
    setSetupCompanyName(company);
    setSetupJobTitle(title);
    setErrorMessage(null);
    setCurrentStep('setup');
  };

  // Step 1 -> Step 2: Analyze Job
  const handleProceedToAnalysis = async (data: {
    resumeText: string;
    resumeFilename: string;
    jobDescription: string;
    companyName: string;
    jobTitle: string;
    parsedResumeMetadata?: ParsedResume | null;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStepText('Comparing resume against JD with local gemma3:4b...');

    try {
      const sessionId = activeSession?.id || `session_${Date.now()}`;
      
      // Call analyze endpoint
      const analysisResult = await api.analyzeJob({
        resume_text: data.resumeText,
        job_description: data.jobDescription,
        company_name: data.companyName,
        job_title: data.jobTitle,
      });

      // Also trigger company research in parallel if company name is provided
      let companyResearchResult = null;
      if (data.companyName.trim()) {
        try {
          companyResearchResult = await api.researchCompany({
            company_name: data.companyName,
            job_title: data.jobTitle,
          });
        } catch (researchErr) {
          console.warn('Company web research non-fatal error:', researchErr);
        }
      }

      const updatedSession: ApplicationSession = {
        id: sessionId,
        updated_at: new Date().toISOString(),
        company_name: data.companyName,
        job_title: data.jobTitle || analysisResult.target_role || 'Target Role',
        job_description: data.jobDescription,
        resume_text: data.resumeText,
        resume_filename: data.resumeFilename,
        clarification_answers: activeSession?.clarification_answers || {},
        analysis: analysisResult,
        company_research: companyResearchResult || activeSession?.company_research,
        tailored_resume: activeSession?.tailored_resume,
        interview_prep: activeSession?.interview_prep,
        checklist: activeSession?.checklist,
      };

      setActiveSession(updatedSession);
      storage.saveSession(updatedSession);
      setSessions(storage.getSessions());
      setCurrentStep('analysis');
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis failed. Please check Ollama connectivity and model status.');
    } finally {
      setIsLoading(false);
      setLoadingStepText('');
    }
  };

  // Step 2 -> Step 3: Tailor Resume
  const handleProceedToTailor = async (clarificationAnswers: Record<string, string>) => {
    if (!activeSession) return;
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStepText('Synthesizing ATS-friendly resume with action & impact bullets...');

    try {
      const tailoredResult = await api.tailorResume({
        resume_text: activeSession.resume_text,
        job_description: activeSession.job_description,
        clarification_answers: clarificationAnswers,
        target_role: activeSession.job_title || activeSession.analysis?.target_role || 'Target Role',
        contact_info: {
          detected_name: activeSession.analysis?.candidate_name || 'Candidate',
        },
      });

      const updatedSession: ApplicationSession = {
        ...activeSession,
        clarification_answers: clarificationAnswers,
        tailored_resume: tailoredResult,
      };

      setActiveSession(updatedSession);
      storage.saveSession(updatedSession);
      setSessions(storage.getSessions());
      setCurrentStep('studio');
    } catch (err: any) {
      setErrorMessage(err.message || 'Resume synthesis failed. Please ensure Ollama is running.');
    } finally {
      setIsLoading(false);
      setLoadingStepText('');
    }
  };

  // Step 3 -> Step 4: Interview Prep
  const handleProceedToInterview = async () => {
    if (!activeSession) return;
    
    // If interview prep already exists, navigate directly
    if (activeSession.interview_prep) {
      setCurrentStep('interview');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStepText('Grounding interview questions in JD requirements and web research...');

    try {
      // Conduct company research if not already completed and company is given
      let research = activeSession.company_research;
      if (!research && activeSession.company_name?.trim()) {
        try {
          research = await api.researchCompany({
            company_name: activeSession.company_name,
            job_title: activeSession.job_title,
          });
        } catch (e) {
          console.warn('Research fallback:', e);
        }
      }

      const prepResult = await api.generateInterviewPrep({
        job_description: activeSession.job_description,
        resume_text: activeSession.resume_text,
        company_name: activeSession.company_name,
        job_title: activeSession.job_title,
        research_summary: research,
      });

      const updatedSession: ApplicationSession = {
        ...activeSession,
        company_research: research || activeSession.company_research,
        interview_prep: prepResult,
      };

      setActiveSession(updatedSession);
      storage.saveSession(updatedSession);
      setSessions(storage.getSessions());
      setCurrentStep('interview');
    } catch (err: any) {
      setErrorMessage(err.message || 'Interview prep generation failed.');
    } finally {
      setIsLoading(false);
      setLoadingStepText('');
    }
  };

  // Step 4 -> Step 5: Checklist
  const handleProceedToChecklist = async () => {
    if (!activeSession) return;

    // If checklist already exists, navigate directly
    if (activeSession.checklist && activeSession.checklist.length > 0) {
      setCurrentStep('checklist');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStepText('Constructing prioritized 0–100% preparation checklist...');

    try {
      const result = await api.generateChecklist({
        job_description: activeSession.job_description,
        resume_text: activeSession.resume_text,
        gaps: activeSession.analysis?.missing_or_gap_requirements || [],
        company_name: activeSession.company_name,
      });

      const updatedSession: ApplicationSession = {
        ...activeSession,
        checklist: result.checklist_items || [],
      };

      setActiveSession(updatedSession);
      storage.saveSession(updatedSession);
      setSessions(storage.getSessions());
      setCurrentStep('checklist');
    } catch (err: any) {
      setErrorMessage(err.message || 'Checklist generation failed.');
    } finally {
      setIsLoading(false);
      setLoadingStepText('');
    }
  };

  const handleUpdateChecklist = (items: ChecklistItem[]) => {
    if (!activeSession) return;
    const updatedSession: ApplicationSession = {
      ...activeSession,
      checklist: items,
    };
    setActiveSession(updatedSession);
    storage.saveSession(updatedSession);
    setSessions(storage.getSessions());
  };

  const handleSaveResumeEdits = (updatedResume: TailoredResumeData) => {
    if (!activeSession) return;
    const updatedSession: ApplicationSession = {
      ...activeSession,
      tailored_resume: updatedResume,
    };
    setActiveSession(updatedSession);
    storage.saveSession(updatedSession);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-ink-950">
      {/* Top Navigation */}
      <Navbar
        currentStep={currentStep}
        onNavigate={setCurrentStep}
        systemHealth={systemHealth}
        activeSession={activeSession}
        onNewSession={handleStartNew}
        onOpenHealthModal={() => setIsHealthModalOpen(true)}
      />

      {/* Global Error Alert Banner */}
      {errorMessage && (
        <div className="no-print bg-rose-50 border-b border-rose-200 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-rose-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:bg-rose-100 rounded text-rose-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="flex-1">
        {currentStep === 'landing' && (
          <LandingWorkspace
            sessions={sessions}
            onStartNew={handleStartNew}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            onLoadSample={handleLoadSample}
          />
        )}

        {currentStep === 'setup' && (
          <JobSetupView
            initialResumeText={setupResumeText}
            initialResumeFilename={setupResumeFilename}
            initialJobDescription={setupJobDescription}
            initialCompanyName={setupCompanyName}
            initialJobTitle={setupJobTitle}
            onProceedToAnalysis={handleProceedToAnalysis}
            isLoading={isLoading}
            loadingStepText={loadingStepText}
          />
        )}

        {currentStep === 'analysis' && activeSession?.analysis && (
          <AnalysisView
            analysis={activeSession.analysis}
            onProceedToTailor={handleProceedToTailor}
            isLoadingTailor={isLoading}
            loadingStepText={loadingStepText}
          />
        )}

        {currentStep === 'studio' && activeSession?.tailored_resume && (
          <ResumeStudioView
            initialResume={activeSession.tailored_resume}
            onProceedToInterview={handleProceedToInterview}
            onSaveEdits={handleSaveResumeEdits}
            isLoadingInterview={isLoading}
            loadingStepText={loadingStepText}
            errorMessage={errorMessage}
          />
        )}

        {currentStep === 'interview' && activeSession?.interview_prep && (
          <InterviewPrepView
            research={activeSession.company_research || null}
            interviewPrep={activeSession.interview_prep}
            onProceedToChecklist={handleProceedToChecklist}
            isLoadingChecklist={isLoading}
            loadingStepText={loadingStepText}
          />
        )}

        {currentStep === 'checklist' && activeSession?.checklist && (
          <ChecklistView
            initialChecklist={activeSession.checklist}
            onUpdateChecklist={handleUpdateChecklist}
            onNavigateToStep={setCurrentStep}
            companyName={activeSession.company_name}
            jobTitle={activeSession.job_title}
          />
        )}
      </main>

      {/* Editorial Footer with Alliet Software Labs Credits (Hidden on print) */}
      <footer className="no-print border-t border-[#E2E0D8] bg-white py-8 mt-16 text-xs text-ink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Left: Brand & Alliet Attribution */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <a 
                href="https://alliet.company/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-1.5 -m-1.5 rounded-lg hover:bg-[#FAF9F5] transition-colors"
                title="Visit Alliet Software Labs"
              >
                <img 
                  src="/alliet-emblem.jpg" 
                  alt="Alliet Software Labs" 
                  className="w-9 h-9 rounded-lg object-cover shadow-xs border border-ink-950/10 group-hover:scale-105 transition-transform" 
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-extrabold text-sm text-ink-950 tracking-tight">
                      Alliet Software Labs
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-ink-100 text-ink-700 font-semibold">
                      Open Source
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-500 block">
                    Engineering intelligence platforms & developer tools
                  </span>
                </div>
              </a>
            </div>

            {/* Right: Quick Links, Contact, and Privacy Diagnostics */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-ink-600">
              <a 
                href="https://alliet.company/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium hover:text-cobalt-600 transition-colors"
              >
                alliet.company
              </a>
              <span className="text-ink-300">·</span>
              <a 
                href="mailto:contact@alliet.company" 
                className="font-medium hover:text-cobalt-600 transition-colors"
                title="Send inquiry to Alliet Software Labs"
              >
                contact@alliet.company
              </a>
              <span className="text-ink-300">·</span>
              <button
                onClick={() => setIsHealthModalOpen(true)}
                className="font-medium hover:text-cobalt-600 transition-colors"
              >
                Model & Privacy Diagnostics
              </button>
            </div>
          </div>

          {/* Sub-footer Bar */}
          <div className="border-t border-[#F4F3EE] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-ink-400">
            <p>
              HirePilot AI is an open-source project created by <a href="https://alliet.company/" target="_blank" rel="noopener noreferrer" className="font-semibold text-ink-700 hover:text-cobalt-600 transition-colors">Alliet Software Labs</a>.
            </p>
            <p className="flex items-center gap-2">
              <span>Local Ollama (gemma3:4b)</span>
              <span>·</span>
              <span>Zero Cloud Data Retention</span>
              <span>·</span>
              <span>Private & ATS-Compliant</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Local AI Health & Diagnostics Modal */}
      <LocalAiStatusModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        systemHealth={systemHealth}
        onRefreshHealth={checkHealth}
        isChecking={isCheckingHealth}
      />
    </div>
  );
}

export default App;
