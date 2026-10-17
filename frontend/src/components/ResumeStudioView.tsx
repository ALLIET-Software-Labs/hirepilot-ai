import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Edit3, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Eye, 
  RotateCcw,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import { TailoredResumeData } from '../types';
import { api } from '../services/api';

interface ResumeStudioViewProps {
  initialResume: TailoredResumeData;
  onProceedToInterview: () => void;
  onSaveEdits: (updatedResume: TailoredResumeData) => void;
  isLoadingInterview?: boolean;
  loadingStepText?: string;
  errorMessage?: string | null;
}

export const ResumeStudioView: React.FC<ResumeStudioViewProps> = ({
  initialResume,
  onProceedToInterview,
  onSaveEdits,
  isLoadingInterview = false,
  loadingStepText = '',
  errorMessage = null,
}) => {
  const [resume, setResume] = useState<TailoredResumeData>(initialResume);
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      const filename = `ApplyForge_${(resume.candidate_name || 'Resume').replace(/\s+/g, '_')}_Tailored.docx`;
      await api.exportDocx(resume, filename);
    } catch (err: any) {
      alert(`DOCX Export failed: ${err.message}`);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleCopyText = () => {
    const textSections = [];
    textSections.push(resume.candidate_name.toUpperCase());
    if (resume.target_role) textSections.push(resume.target_role);
    
    const contactParts = Object.values(resume.contact_info || {}).filter(Boolean);
    if (contactParts.length) textSections.push(contactParts.join(' | '));

    textSections.push('\n--- PROFESSIONAL SUMMARY ---');
    textSections.push(resume.professional_summary);

    textSections.push('\n--- SKILLS ---');
    Object.entries(resume.skills || {}).forEach(([cat, list]) => {
      textSections.push(`${cat}: ${Array.isArray(list) ? list.join(', ') : list}`);
    });

    textSections.push('\n--- WORK EXPERIENCE ---');
    (resume.work_experience || []).forEach((exp) => {
      textSections.push(`\n${exp.role} | ${exp.company} (${exp.dates || ''})`);
      exp.bullets.forEach((b) => textSections.push(`• ${b}`));
    });

    textSections.push('\n--- PROJECTS ---');
    (resume.projects || []).forEach((proj) => {
      textSections.push(`\n${proj.name} [${(proj.technologies || []).join(', ')}]`);
      proj.bullets.forEach((b) => textSections.push(`• ${b}`));
    });

    textSections.push('\n--- EDUCATION ---');
    (resume.education || []).forEach((edu) => {
      textSections.push(`${edu.degree}, ${edu.institution} (${edu.graduation_year || ''})`);
    });

    navigator.clipboard.writeText(textSections.join('\n'));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleBulletChange = (expIdx: number, bulletIdx: number, val: string) => {
    const updated = { ...resume };
    updated.work_experience[expIdx].bullets[bulletIdx] = val;
    setResume(updated);
    onSaveEdits(updated);
  };

  const atsAnalysis = resume.ats_keyword_analysis;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Controls Toolbar (Hidden on Print) */}
      <div className="no-print bg-white border border-[#E2E0D8] rounded-xl p-4 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5 text-center md:text-left">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-lg font-bold text-ink-950">
              Tailored ATS Resume Studio
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-cobalt-50 text-cobalt-700 border border-cobalt-200 rounded">
              Single-Column ATS Standard
            </span>
          </div>
          <p className="text-xs text-ink-600">
            Edit text directly or export to clean PDF / Word (.docx).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isEditing
                ? 'bg-ink-950 text-white border-ink-950'
                : 'bg-white text-ink-800 border-[#E2E0D8] hover:bg-[#F4F3EE]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Done Editing' : 'Edit Resume'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-ink-800 border border-[#E2E0D8] hover:bg-[#F4F3EE] transition-all"
            title="Copy entire resume text to clipboard"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-ink-600" />}
            <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-ink-800 border border-[#E2E0D8] hover:bg-[#F4F3EE] transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cobalt-600" />
            <span>{isExportingDocx ? 'Generating DOCX...' : 'Word (.docx)'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cobalt-600 text-white hover:bg-cobalt-700 transition-all shadow-subtle"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={onProceedToInterview}
            disabled={isLoadingInterview}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold shadow-card ml-2 transition-all ${
              isLoadingInterview
                ? 'bg-ink-800 text-white cursor-wait opacity-90'
                : 'bg-ink-950 text-white hover:bg-ink-900'
            }`}
          >
            {isLoadingInterview ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cobalt-400" />
                <span>Preparing...</span>
              </>
            ) : (
              <>
                <span>Interview Prep</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ATS Keyword Analysis Bar (Hidden on Print) */}
      {atsAnalysis && (
        <div className="no-print bg-white border border-[#E2E0D8] rounded-xl p-5 shadow-subtle space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-ink-700">
                JD Keyword Match Coverage
              </span>
              <span className="text-xs font-mono font-bold text-cobalt-700 bg-cobalt-50 px-2 py-0.5 rounded border border-cobalt-200">
                {atsAnalysis.coverage_percentage}% Estimated
              </span>
            </div>
            <p className="text-[11px] text-ink-500 italic">
              {atsAnalysis.disclaimer || 'Coverage estimate is a heuristic metric and does not guarantee passing automated screening.'}
            </p>
          </div>

          {/* Coverage Bar */}
          <div className="w-full bg-[#EFECE6] rounded-full h-2 overflow-hidden">
            <div
              className="bg-cobalt-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${atsAnalysis.coverage_percentage}%` }}
            />
          </div>

          {/* Keywords Chips */}
          <div className="flex flex-wrap gap-4 pt-1 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
                Matched In Resume ({atsAnalysis.matched_keywords?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1">
                {atsAnalysis.matched_keywords?.slice(0, 10).map((kw, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {atsAnalysis.missing_keywords && atsAnalysis.missing_keywords.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider block">
                  Missing / Unconfirmed In Resume ({atsAnalysis.missing_keywords.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {atsAnalysis.missing_keywords.slice(0, 6).map((kw, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Virtual 8.5" x 11" Paper Canvas for ATS Resume */}
      <div className="flex justify-center">
        <div
          id="resume-document-container"
          className="w-full max-w-[850px] bg-white border border-[#E2E0D8] shadow-resume p-8 sm:p-12 space-y-6 text-ink-950 rounded-lg print:border-none print:shadow-none print:p-0"
        >
          {/* Resume Header */}
          <div className="text-center space-y-1 border-b border-ink-900 pb-3">
            {isEditing ? (
              <input
                type="text"
                value={resume.candidate_name}
                onChange={(e) => {
                  const updated = { ...resume, candidate_name: e.target.value };
                  setResume(updated);
                  onSaveEdits(updated);
                }}
                className="w-full font-heading text-2xl font-bold text-center border-b border-cobalt-400 focus:outline-none"
              />
            ) : (
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-950">
                {resume.candidate_name}
              </h1>
            )}

            {resume.target_role && (
              <p className="text-xs sm:text-sm font-bold text-cobalt-700 uppercase tracking-wider">
                {resume.target_role}
              </p>
            )}

            {/* Contact Info Line */}
            <div className="text-[11px] text-ink-600 flex flex-wrap items-center justify-center gap-x-2 pt-1">
              {resume.contact_info?.email && <span>{resume.contact_info.email}</span>}
              {resume.contact_info?.phone && <span>• {resume.contact_info.phone}</span>}
              {resume.contact_info?.location && <span>• {resume.contact_info.location}</span>}
              {resume.contact_info?.linkedin && <span>• {resume.contact_info.linkedin}</span>}
              {resume.contact_info?.github && <span>• {resume.contact_info.github}</span>}
            </div>
          </div>

          {/* Section: Professional Summary */}
          {resume.professional_summary && (
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-950 border-b border-ink-300 pb-0.5">
                Professional Summary
              </h2>
              {isEditing ? (
                <textarea
                  value={resume.professional_summary}
                  onChange={(e) => {
                    const updated = { ...resume, professional_summary: e.target.value };
                    setResume(updated);
                    onSaveEdits(updated);
                  }}
                  rows={4}
                  className="w-full text-xs p-2 border border-cobalt-400 rounded focus:outline-none leading-relaxed"
                />
              ) : (
                <p className="text-xs text-ink-800 leading-relaxed">
                  {resume.professional_summary}
                </p>
              )}
            </div>
          )}

          {/* Section: Skills & Competencies */}
          {resume.skills && Object.keys(resume.skills).length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-950 border-b border-ink-300 pb-0.5">
                Skills & Technical Competencies
              </h2>
              <div className="text-xs space-y-1">
                {Object.entries(resume.skills).map(([category, items], idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 text-[11px]">
                    <span className="font-bold text-ink-900 min-w-[170px]">{category}:</span>
                    <span className="text-ink-700">
                      {Array.isArray(items) ? items.join(', ') : items}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Professional Experience */}
          {resume.work_experience && resume.work_experience.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-950 border-b border-ink-300 pb-0.5">
                Professional Experience
              </h2>
              <div className="space-y-4">
                {resume.work_experience.map((exp, expIdx) => (
                  <div key={expIdx} className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-xs">
                      <div>
                        <span className="font-bold text-ink-950">{exp.role}</span>
                        {exp.company && <span className="text-ink-700 font-medium"> | {exp.company}</span>}
                      </div>
                      <span className="text-[11px] font-mono text-ink-500 italic">
                        {[exp.location, exp.dates].filter(Boolean).join(' — ')}
                      </span>
                    </div>

                    {/* Bullet Points */}
                    <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-ink-800 leading-relaxed">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx}>
                          {isEditing ? (
                            <textarea
                              value={bullet}
                              onChange={(e) => handleBulletChange(expIdx, bIdx, e.target.value)}
                              rows={2}
                              className="w-full text-xs p-1 border border-cobalt-400 rounded focus:outline-none leading-normal"
                            />
                          ) : (
                            <span>{bullet}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Key Projects */}
          {resume.projects && resume.projects.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-950 border-b border-ink-300 pb-0.5">
                Key Technical Projects
              </h2>
              <div className="space-y-3">
                {resume.projects.map((proj, pIdx) => (
                  <div key={pIdx} className="space-y-1 text-xs">
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-ink-950">{proj.name}</span>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span className="text-[11px] font-mono text-ink-600">
                          {proj.technologies.join(', ')}
                        </span>
                      )}
                    </div>
                    <ul className="list-disc list-outside pl-4 space-y-0.5 text-ink-800 leading-relaxed">
                      {proj.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Education */}
          {resume.education && resume.education.length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-950 border-b border-ink-300 pb-0.5">
                Education
              </h2>
              <div className="space-y-1 text-xs">
                {resume.education.map((edu, eIdx) => (
                  <div key={eIdx} className="flex justify-between items-baseline text-[11px]">
                    <div>
                      <span className="font-bold text-ink-950">{edu.degree}</span>
                      {edu.institution && <span className="text-ink-700">, {edu.institution}</span>}
                    </div>
                    <span className="text-ink-500 font-mono">
                      {[edu.location, edu.graduation_year].filter(Boolean).join(' — ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Certifications */}
          {resume.certifications && resume.certifications.length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-950 border-b border-ink-300 pb-0.5">
                Certifications
              </h2>
              <ul className="list-disc list-outside pl-4 text-xs text-ink-800 space-y-0.5">
                {resume.certifications.map((cert, cIdx) => (
                  <li key={cIdx}>
                    <span className="font-semibold">{cert.name}</span>
                    {cert.issuer && <span className="text-ink-600"> — {cert.issuer}</span>}
                    {cert.year && <span className="text-ink-500"> ({cert.year})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Floating Navigation (Hidden on Print) */}
      <div className="no-print pt-6 border-t border-[#E2E0D8] space-y-3">
        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-2 shadow-subtle animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
            <span className="text-[11px] text-rose-600 font-semibold underline cursor-pointer" onClick={onProceedToInterview}>
              Retry
            </span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-600">
            Tailored resume ready. Continue to company web research & role-specific interview preparation.
          </p>
          <button
            onClick={onProceedToInterview}
            disabled={isLoadingInterview}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-card ${
              isLoadingInterview
                ? 'bg-ink-800 text-white cursor-wait opacity-90'
                : 'bg-ink-950 text-white hover:bg-ink-900 shadow-card-hover'
            }`}
          >
            {isLoadingInterview ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cobalt-400" />
                <span>{loadingStepText || 'Generating Interview Questions with Local AI...'}</span>
              </>
            ) : (
              <>
                <span>Continue to Interview Prep & Research</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
