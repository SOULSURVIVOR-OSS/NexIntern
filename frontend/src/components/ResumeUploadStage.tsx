import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, CheckCircle2, Trash2, Plus, Sparkles, ArrowRight, ArrowLeft, Users, AlertCircle } from 'lucide-react';
import { CandidateResume, JobDescription } from '../types';

interface ResumeUploadStageProps {
  jobDescription: JobDescription;
  candidates: CandidateResume[];
  onAddCandidate: (candidate: CandidateResume) => void;
  onRemoveCandidate: (id: string) => void;
  onProceedToAnalyze: () => void;
  onBackToJD: () => void;
  onOpenCustomModal: () => void;
}

export const ResumeUploadStage: React.FC<ResumeUploadStageProps> = ({
  jobDescription,
  candidates,
  onAddCandidate,
  onRemoveCandidate,
  onProceedToAnalyze,
  onBackToJD,
  onOpenCustomModal,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

  // Simulated drag-and-drop batch upload
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const fileNames = files.map(f => f.name);
    setUploadingFiles(fileNames);

    // Simulate ingestion of new files
    setTimeout(() => {
      files.forEach((file, idx) => {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        const newCandidate: CandidateResume = {
          id: `uploaded-${Date.now()}-${idx}`,
          name: cleanName.length > 2 ? cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : `Applicant ${candidates.length + 1}`,
          email: `${cleanName.toLowerCase().replace(/\s+/g, '.')}@campus.edu`,
          education: {
            degree: 'B.Tech in Computer Engineering',
            institution: 'University Placement Candidate',
            graduationYear: '2025',
          },
          summary: 'Newly uploaded candidate resume parsed via InternLoom ingestion layer.',
          skills: ['React', 'JavaScript', 'Node.js', 'Express', 'Git'],
          experience: [],
          projects: [
            {
              title: 'Full Stack Web Platform',
              technologies: ['React', 'Node.js'],
              description: 'Built interactive student platform with modern stack.',
            }
          ],
          rawText: `Resume of ${cleanName}\nSkills: React, JavaScript, Node.js, Express, Git.`,
          formatCharacteristics: {
            formatType: 'clean-structured',
          },
        };
        onAddCandidate(newCandidate);
      });
      setUploadingFiles([]);
    }, 800);
  };

  return (
    <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#0071e3] mb-2 block">
          Step 02 of 03
        </span>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f]">
          Now, meet your candidates.
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Upload and review resumes to rank against <span className="font-semibold text-slate-900">{jobDescription.title}</span>.
        </p>
      </div>

      {/* Upload Zone & Stats Bar */}
      <div className="space-y-6">
        
        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`bg-white rounded-3xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-[#0071e3] bg-sky-50/50 scale-[0.99]'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
          }`}
        >
          <input
            type="file"
            id="resume-file-input"
            className="hidden"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
          />
          <label htmlFor="resume-file-input" className="cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0071e3] flex items-center justify-center mx-auto mb-3 border border-sky-100 shadow-2xs">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-[#1d1d1f]">
              Drop candidate resumes here, or click to browse
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Supports multiple PDFs, DOCX, or TXT files
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-black/[0.04] text-slate-700 hover:bg-black/[0.08] transition">
              <Plus className="w-3 h-3" /> Select Additional Resumes
            </div>
          </label>
        </div>

        {/* Upload in progress indicator */}
        {uploadingFiles.length > 0 && (
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-center gap-3 animate-pulse">
            <Sparkles className="w-4 h-4 text-[#0071e3]" />
            <span className="text-xs text-sky-900 font-medium">
              Parsing and indexing {uploadingFiles.length} new resume{uploadingFiles.length > 1 ? 's' : ''}...
            </span>
          </div>
        )}

        {/* Ready Candidates Count Strip */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Candidate Pool ({candidates.length})
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              ✓ Ready for Analysis
            </span>
          </div>

          <button
            onClick={onOpenCustomModal}
            className="text-xs font-semibold text-[#0071e3] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Paste / Test Custom Resume</span>
          </button>
        </div>

        {/* Candidate Cards Grid (Apple-style cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[460px] overflow-y-auto p-1 pr-2">
          <AnimatePresence>
            {candidates.map((cand, idx) => {
              const fileNum = String(idx + 1).padStart(2, '0');
              const fileName = `resume_${cand.name.toLowerCase().replace(/\s+/g, '_')}.pdf`;
              
              return (
                <motion.div
                  key={cand.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group text-left"
                >
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      Candidate {fileNum}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ready
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#1d1d1f] tracking-tight truncate">
                      {cand.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {fileName}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-medium">
                      {cand.education.degree} ({cand.education.institution})
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">
                      {cand.skills.length} skills listed
                    </span>
                    {candidates.length > 3 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveCandidate(cand.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 transition"
                        title="Remove candidate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>

      {/* Action Footer */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/80">
        <button
          onClick={onBackToJD}
          className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-medium text-slate-600 hover:text-[#1d1d1f] hover:bg-black/[0.04] transition flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Job Description</span>
        </button>

        <button
          onClick={onProceedToAnalyze}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.99]"
        >
          <span>Analyze Candidates</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </section>
  );
};
