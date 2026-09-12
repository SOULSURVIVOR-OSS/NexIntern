import React from 'react';
import { X, Briefcase, Building, MapPin, CheckCircle2, ShieldAlert, FileText } from 'lucide-react';
import { JobDescription } from '../types';

interface JDViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  jd: JobDescription;
  onOpenBiasScanner: () => void;
}

export const JDViewerModal: React.FC<JDViewerModalProps> = ({
  isOpen,
  onClose,
  jd,
  onOpenBiasScanner,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.14)] border border-black/[0.08] overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-6 border-b border-black/[0.06] flex items-start justify-between gap-4 bg-[#fbfbfd]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] tracking-tight">
                {jd.title}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                {jd.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {jd.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {jd.employmentType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBiasScanner}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition flex items-center gap-1 shadow-2xs"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Bias Scanner</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-black/[0.05] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 text-xs text-slate-600">
          
          {/* Summary */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Role Summary
            </span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {jd.summary}
            </p>
          </div>

          {/* Required Skills */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-2.5">
              Required Core Skills ({jd.requiredSkills.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {jd.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-sky-50 text-[#0071e3] text-xs font-semibold border border-sky-100 shadow-2xs"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#0071e3]" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Skills */}
          {jd.preferredSkills && jd.preferredSkills.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-2.5">
                Preferred Skills ({jd.preferredSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {jd.preferredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Raw Text Specification */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Raw JD Ingestion Text
            </span>
            <pre className="p-4 rounded-2xl bg-[#fbfbfd] border border-black/[0.06] font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {jd.rawText}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/[0.06] bg-[#fbfbfd] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-[#1d1d1f] hover:bg-black text-white transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
