import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Sparkles, ShieldAlert, ArrowRight, CheckCircle2, RefreshCw, Briefcase, MapPin, Building, Plus, Layers } from 'lucide-react';
import { JobDescription } from '../types';
import { benchmarkJobDescriptions } from '../data/sampleData';

interface JDUploadStageProps {
  jobDescription: JobDescription;
  onUpdateJD: (jd: JobDescription) => void;
  onProceed: () => void;
  onOpenBiasScanner: () => void;
}

export const JDUploadStage: React.FC<JDUploadStageProps> = ({
  jobDescription,
  onUpdateJD,
  onProceed,
  onOpenBiasScanner,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [rawText, setRawText] = useState(jobDescription.rawText);

  const handleSelectPreset = (preset: JobDescription) => {
    onUpdateJD(preset);
    setRawText(preset.rawText);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    // Extract skills heuristic
    const lines = rawText.split('\n');
    const title = lines[0]?.replace(/^Position:\s*/i, '').trim() || jobDescription.title;
    
    onUpdateJD({
      ...jobDescription,
      title,
      rawText,
    });
    setIsEditing(false);
  };

  return (
    <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#0071e3] mb-2 block">
          Step 01 of 03
        </span>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f]">
          Define the Target Role.
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Specify or customize your Job Description. Our engine extracts required technical skills and domain constraints automatically.
        </p>
      </div>

      {/* Benchmark Presets Selector */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>Benchmark Job Roles</span>
          </span>
          <span className="text-[11px] text-slate-400">Click to switch roles instantly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {benchmarkJobDescriptions.map((preset) => {
            const isSelected = preset.id === jobDescription.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-white border-[#0071e3] ring-2 ring-[#0071e3]/10 shadow-sm'
                    : 'bg-white/60 hover:bg-white border-black/[0.06] hover:border-black/[0.12]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0071e3]">
                    {preset.department}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#0071e3] animate-pulse" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-[#1d1d1f] tracking-tight truncate">
                  {preset.title}
                </h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {preset.company}
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">{preset.requiredSkills.length}</span> required skills
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active JD Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.07] shadow-xs space-y-6">
        
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] tracking-tight">
                {jobDescription.title}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Specification
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {jobDescription.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {jobDescription.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {jobDescription.employmentType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBiasScanner}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition flex items-center gap-1.5 shadow-2xs"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Bias Scanner</span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Text'}
            </button>
          </div>
        </div>

        {/* Edit mode textarea vs display */}
        {isEditing ? (
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Edit Job Description Plain Text:
            </label>
            <textarea
              rows={12}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full bg-[#fbfbfd] border border-black/[0.08] rounded-2xl p-4 font-mono text-xs text-slate-800 focus:outline-none focus:border-[#0071e3] transition leading-relaxed"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed]"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                Role Overview
              </span>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {jobDescription.summary}
              </p>
            </div>

            {/* Required Skills Badges */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-2.5">
                Required Core Skills ({jobDescription.requiredSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {jobDescription.requiredSkills.map((skill) => (
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

            {/* Preferred Skills Badges */}
            {jobDescription.preferredSkills && jobDescription.preferredSkills.length > 0 && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-2.5">
                  Preferred / Nice-to-Have ({jobDescription.preferredSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {jobDescription.preferredSkills.map((skill) => (
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
          </>
        )}

      </div>

      {/* Proceed button */}
      <div className="mt-10 flex justify-end">
        <button
          onClick={onProceed}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.99]"
        >
          <span>Proceed to Candidate Resumes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </section>
  );
};
