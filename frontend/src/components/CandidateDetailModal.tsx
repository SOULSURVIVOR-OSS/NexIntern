import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, GitCompare, GraduationCap, Code2, Sparkles, MapPin, Mail, FileText, ChevronRight } from 'lucide-react';
import { CandidateMatchResult } from '../types';
import { ScoreCounter } from './ScoreCounter';

interface CandidateDetailModalProps {
  candidate: CandidateMatchResult | null;
  onClose: () => void;
  onCompare: (candidate: CandidateMatchResult) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  onClose,
  onCompare,
}) => {
  if (!candidate) return null;

  const [activeTab, setActiveTab] = useState<'breakdown' | 'evidence' | 'rawText'>('breakdown');
  const c = candidate.candidate;

  // Calculate experience relevance score
  const totalRequired = candidate.matchedExplicitSkills.length + candidate.missingRequiredSkills.length;
  const requiredMatchPercent = totalRequired > 0
    ? Math.round((candidate.matchedExplicitSkills.length / totalRequired) * 100)
    : 0;
  
  const experienceRelevance = Math.round(
    (candidate.semanticScore * 0.5) + (candidate.keywordScore * 0.3) + (requiredMatchPercent * 0.2)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.14)] border border-black/[0.08] overflow-hidden my-6">
        
        {/* Apple-style Header */}
        <div className="p-6 sm:p-7 border-b border-black/[0.06] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-black/[0.04] flex items-center justify-center font-bold text-base text-[#1d1d1f] tracking-tight shrink-0">
              #{candidate.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] tracking-tight">
                  {c.name}
                </h2>
                {candidate.rank === 1 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-[#0071e3] border border-sky-200">
                    Top Ranked
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {c.education.degree} • {c.education.institution} (Class of {c.education.graduationYear})
              </p>
              {c.email && (
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {c.email}
                  {c.location && <>• <MapPin className="w-3 h-3 ml-1" /> {c.location}</>}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Overall Score
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
                {candidate.finalScore}%
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-black/[0.05] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Minimal Tab Switcher */}
        <div className="px-6 border-b border-black/[0.06] bg-[#fbfbfd] flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`py-3 px-1 border-b-2 font-semibold transition ${
              activeTab === 'breakdown'
                ? 'border-[#0071e3] text-[#0071e3]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Match Breakdown & Analysis
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-1 border-b-2 font-semibold transition ${
              activeTab === 'evidence'
                ? 'border-[#0071e3] text-[#0071e3]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Evidence Snippets ({candidate.evidenceSnippets?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('rawText')}
            className={`py-3 px-1 border-b-2 font-semibold transition ${
              activeTab === 'rawText'
                ? 'border-[#0071e3] text-[#0071e3]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Raw Resume & Ingestion Log
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 text-xs text-slate-600">
          
          {activeTab === 'breakdown' && (
            <>
              {/* SECTION: MATCH BREAKDOWN (Apple-style clean metrics) */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-3">
                  Match Breakdown
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  
                  <div className="bg-[#fbfbfd] p-3.5 rounded-2xl border border-black/[0.05]">
                    <span className="text-[11px] text-slate-500 block font-medium mb-1">
                      Semantic Match
                    </span>
                    <span className="text-xl font-bold text-[#1d1d1f] block">
                      {candidate.semanticScore}%
                    </span>
                    <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-indigo-600 h-1 rounded-full" style={{ width: `${candidate.semanticScore}%` }} />
                    </div>
                  </div>

                  <div className="bg-[#fbfbfd] p-3.5 rounded-2xl border border-black/[0.05]">
                    <span className="text-[11px] text-slate-500 block font-medium mb-1">
                      Keyword Match
                    </span>
                    <span className="text-xl font-bold text-[#1d1d1f] block">
                      {candidate.keywordScore}%
                    </span>
                    <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#0071e3] h-1 rounded-full" style={{ width: `${candidate.keywordScore}%` }} />
                    </div>
                  </div>

                  <div className="bg-[#fbfbfd] p-3.5 rounded-2xl border border-black/[0.05]">
                    <span className="text-[11px] text-slate-500 block font-medium mb-1">
                      Required Skills
                    </span>
                    <span className="text-xl font-bold text-[#1d1d1f] block">
                      {requiredMatchPercent}%
                    </span>
                    <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-emerald-600 h-1 rounded-full" style={{ width: `${requiredMatchPercent}%` }} />
                    </div>
                  </div>

                  <div className="bg-[#fbfbfd] p-3.5 rounded-2xl border border-black/[0.05]">
                    <span className="text-[11px] text-slate-500 block font-medium mb-1">
                      Experience Relevance
                    </span>
                    <span className="text-xl font-bold text-[#1d1d1f] block">
                      {experienceRelevance}%
                    </span>
                    <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-slate-800 h-1 rounded-full" style={{ width: `${experienceRelevance}%` }} />
                    </div>
                  </div>

                </div>
              </div>

              {/* "Why this candidate?" */}
              <div className="bg-[#fbfbfd] rounded-2xl p-5 border border-black/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#0071e3]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1d1d1f]">
                    Why this candidate?
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {candidate.explanation}
                </p>
              </div>

              {/* Strong Matches & Potential Gaps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* STRONG MATCHES */}
                <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900 mb-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Strong Matches ({candidate.matchedExplicitSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.matchedExplicitSkills.map(s => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg bg-white text-emerald-800 text-[11px] font-semibold border border-emerald-200/80 shadow-2xs max-w-full break-words"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* POTENTIAL GAPS */}
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900 mb-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Potential Gaps ({candidate.missingRequiredSkills.length})</span>
                  </div>
                  {candidate.missingRequiredSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.missingRequiredSkills.map(s => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-lg bg-white text-amber-800 text-[11px] font-semibold border border-amber-200/80 shadow-2xs max-w-full break-words"
                        >
                          ⚠ {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">No missing required skills detected.</span>
                  )}
                </div>

              </div>

              {/* Projects & Experience */}
              {c.projects && c.projects.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-2.5">
                    Verified Projects
                  </span>
                  <div className="space-y-2">
                    {c.projects.map((p, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-[#fbfbfd] border border-black/[0.05]">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-900 text-xs">{p.title}</span>
                          {p.link && <span className="text-[10px] text-slate-400 font-mono">{p.link}</span>}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {p.technologies.map(t => (
                            <span key={t} className="px-1.5 py-0.5 rounded bg-white text-[10px] font-medium text-slate-600 border border-slate-200">
                              {t}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-900 block">
                Direct Textual Citations from Candidate Resume
              </span>
              <p className="text-xs text-slate-500">
                These passages explicitly corroborate the candidate's proficiency in required skills:
              </p>

              <div className="space-y-2.5 pt-1">
                {candidate.evidenceSnippets?.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[#fbfbfd] border border-black/[0.05]">
                    <span className="font-bold text-[#0071e3] text-xs block mb-1">
                      Skill Verified: {item.skill}
                    </span>
                    <blockquote className="text-[11px] text-slate-700 font-mono bg-white p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                      "{item.snippet}"
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rawText' && (
            <div className="space-y-4">
              {candidate.formattingLogs && candidate.formattingLogs.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100">
                  <span className="font-bold text-sky-900 text-xs block mb-1">
                    Resilient Ingestion Logs:
                  </span>
                  <ul className="list-disc list-inside text-[11px] text-sky-800 space-y-0.5">
                    {candidate.formattingLogs.map((l, i) => (
                      <li key={i}>{l.detail}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-900 text-xs block mb-1.5">Full Raw Resume:</span>
                <pre className="p-4 rounded-2xl bg-[#fbfbfd] border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {c.rawText}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-black/[0.06] bg-[#fbfbfd] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onCompare(candidate);
            }}
            className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-black/[0.08] transition flex items-center gap-1.5 shadow-2xs"
          >
            <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
            <span>Compare Head-to-Head</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-[#1d1d1f] hover:bg-black text-white transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
