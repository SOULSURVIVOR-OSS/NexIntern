import React, { useState } from 'react';
import { X, GitCompare, Sparkles, MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react';
import { CandidateMatchResult } from '../types';

interface CandidateComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CandidateMatchResult[];
  initialCandAId?: string;
  initialCandBId?: string;
  onAskChatAboutPair: (candA: CandidateMatchResult, candB: CandidateMatchResult) => void;
}

export const CandidateComparisonModal: React.FC<CandidateComparisonModalProps> = ({
  isOpen,
  onClose,
  candidates,
  initialCandAId,
  initialCandBId,
  onAskChatAboutPair,
}) => {
  if (!isOpen || candidates.length < 2) return null;

  const defaultA = candidates.find(c => c.candidateId === initialCandAId) || candidates[0];
  const defaultB = candidates.find(c => c.candidateId === initialCandBId) || (candidates[1] || candidates[0]);

  const [candAId, setCandAId] = useState<string>(defaultA.candidateId);
  const [candBId, setCandBId] = useState<string>(defaultB.candidateId);

  const candA = candidates.find(c => c.candidateId === candAId) || candidates[0];
  const candB = candidates.find(c => c.candidateId === candBId) || candidates[1];

  const totalReqA = candA.matchedExplicitSkills.length + candA.missingRequiredSkills.length;
  const reqPercentA = totalReqA > 0 ? Math.round((candA.matchedExplicitSkills.length / totalReqA) * 100) : 0;

  const totalReqB = candB.matchedExplicitSkills.length + candB.missingRequiredSkills.length;
  const reqPercentB = totalReqB > 0 ? Math.round((candB.matchedExplicitSkills.length / totalReqB) * 100) : 0;

  const skillsB = new Set(candB.matchedExplicitSkills);
  const skillsA = new Set(candA.matchedExplicitSkills);

  const commonSkills = candA.matchedExplicitSkills.filter(s => skillsB.has(s));
  const uniqueToA = candA.matchedExplicitSkills.filter(s => !skillsB.has(s));
  const uniqueToB = candB.matchedExplicitSkills.filter(s => !skillsA.has(s));

  const isAHigher = candA.finalScore >= candB.finalScore;
  const higher = isAHigher ? candA : candB;
  const lower = isAHigher ? candB : candA;
  const scoreDiff = Math.abs(candA.finalScore - candB.finalScore);

  // Generate concise explanation based on real data
  const explanation = `${higher.candidate.name} is ranked higher than ${lower.candidate.name} with an overall score advantage of +${scoreDiff}% (${higher.finalScore}% vs ${lower.finalScore}%). Specifically, ${higher.candidate.name} achieved higher ${higher.semanticScore > lower.semanticScore ? `semantic relevance (${higher.semanticScore}% vs ${lower.semanticScore}%)` : `keyword coverage (${higher.keywordScore}% vs ${lower.keywordScore}%)`} and demonstrates verified skills in ${uniqueToA.length > 0 && isAHigher ? uniqueToA.slice(0, 3).join(', ') : uniqueToB.slice(0, 3).join(', ')}.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.14)] border border-black/[0.08] overflow-hidden my-6">
        
        {/* Apple-style Header */}
        <div className="p-6 border-b border-black/[0.06] flex items-center justify-between bg-[#fbfbfd]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1d1d1f] tracking-tight">
                Candidate Head-to-Head Comparison
              </h2>
              <p className="text-xs text-slate-500">
                Direct side-by-side audit explaining why one candidate is ranked above another.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-black/[0.05] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Selectors */}
        <div className="p-5 border-b border-black/[0.06] bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#0071e3] block mb-1.5">
              Candidate A:
            </label>
            <select
              value={candAId}
              onChange={(e) => setCandAId(e.target.value)}
              className="w-full bg-[#fbfbfd] border border-black/[0.08] text-slate-900 text-xs rounded-xl p-2.5 focus:outline-none focus:border-[#0071e3] font-medium"
            >
              {candidates.map(c => (
                <option key={c.candidateId} value={c.candidateId}>
                  #{c.rank} {c.candidate.name} ({c.finalScore}% Match)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block mb-1.5">
              Candidate B:
            </label>
            <select
              value={candBId}
              onChange={(e) => setCandBId(e.target.value)}
              className="w-full bg-[#fbfbfd] border border-black/[0.08] text-slate-900 text-xs rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 font-medium"
            >
              {candidates.map(c => (
                <option key={c.candidateId} value={c.candidateId}>
                  #{c.rank} {c.candidate.name} ({c.finalScore}% Match)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparative Table Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 text-xs text-slate-600">
          
          {/* Side-by-Side Metric Cards */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Candidate A Column */}
            <div className={`p-5 rounded-2xl border text-center transition-all ${isAHigher ? 'bg-sky-50/30 border-[#0071e3]/30' : 'bg-[#fbfbfd] border-black/[0.06]'}`}>
              <span className="text-xs font-mono font-bold text-slate-400">#{candA.rank}</span>
              <h3 className="text-base font-bold text-[#1d1d1f] mt-0.5 truncate">
                {candA.candidate.name}
              </h3>
              <div className="text-3xl font-black text-[#1d1d1f] tracking-tight my-2">
                {candA.finalScore}%
              </div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Overall Match
              </span>
            </div>

            {/* Candidate B Column */}
            <div className={`p-5 rounded-2xl border text-center transition-all ${!isAHigher ? 'bg-indigo-50/30 border-indigo-200' : 'bg-[#fbfbfd] border-black/[0.06]'}`}>
              <span className="text-xs font-mono font-bold text-slate-400">#{candB.rank}</span>
              <h3 className="text-base font-bold text-[#1d1d1f] mt-0.5 truncate">
                {candB.candidate.name}
              </h3>
              <div className="text-3xl font-black text-[#1d1d1f] tracking-tight my-2">
                {candB.finalScore}%
              </div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Overall Match
              </span>
            </div>

          </div>

          {/* Detailed Metric Rows */}
          <div className="bg-[#fbfbfd] rounded-2xl border border-black/[0.06] overflow-hidden">
            <div className="p-3 border-b border-black/[0.06] font-bold text-[11px] uppercase tracking-wider text-slate-400 text-center">
              Detailed Score Comparison
            </div>

            <div className="divide-y divide-black/[0.04]">
              
              {/* Semantic Row */}
              <div className="grid grid-cols-3 p-3.5 items-center text-center">
                <span className={`font-bold text-sm ${candA.semanticScore >= candB.semanticScore ? 'text-[#0071e3]' : 'text-slate-700'}`}>
                  {candA.semanticScore}%
                </span>
                <span className="text-xs font-medium text-slate-500">Semantic Match</span>
                <span className={`font-bold text-sm ${candB.semanticScore >= candA.semanticScore ? 'text-indigo-600' : 'text-slate-700'}`}>
                  {candB.semanticScore}%
                </span>
              </div>

              {/* Keyword Row */}
              <div className="grid grid-cols-3 p-3.5 items-center text-center">
                <span className={`font-bold text-sm ${candA.keywordScore >= candB.keywordScore ? 'text-[#0071e3]' : 'text-slate-700'}`}>
                  {candA.keywordScore}%
                </span>
                <span className="text-xs font-medium text-slate-500">Keyword Match</span>
                <span className={`font-bold text-sm ${candB.keywordScore >= candA.keywordScore ? 'text-indigo-600' : 'text-slate-700'}`}>
                  {candB.keywordScore}%
                </span>
              </div>

              {/* Required Skills Row */}
              <div className="grid grid-cols-3 p-3.5 items-center text-center">
                <span className={`font-bold text-sm ${reqPercentA >= reqPercentB ? 'text-[#0071e3]' : 'text-slate-700'}`}>
                  {reqPercentA}%
                </span>
                <span className="text-xs font-medium text-slate-500">Required Skills</span>
                <span className={`font-bold text-sm ${reqPercentB >= reqPercentA ? 'text-indigo-600' : 'text-slate-700'}`}>
                  {reqPercentB}%
                </span>
              </div>

            </div>
          </div>

          {/* AI RECRUITER EXPLANATION (Why Candidate A > Candidate B) */}
          <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0071e3]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Why is {higher.candidate.name} ranked higher?
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              {explanation}
            </p>
          </div>

          {/* Unique Skills Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <span className="font-bold text-xs text-slate-900 block mb-2">
                Unique to {candA.candidate.name}:
              </span>
              <div className="flex flex-wrap gap-1">
                {uniqueToA.length > 0 ? (
                  uniqueToA.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded bg-sky-50 text-[#0071e3] text-[10px] font-semibold border border-sky-100 max-w-full break-words">
                      ✓ {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic text-[11px]">No unique required skills over Candidate B.</span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 min-w-0">
              <span className="font-bold text-xs text-slate-900 block mb-2">
                Unique to {candB.candidate.name}:
              </span>
              <div className="flex flex-wrap gap-1">
                {uniqueToB.length > 0 ? (
                  uniqueToB.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100 max-w-full break-words">
                      ✓ {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic text-[11px]">No unique required skills over Candidate A.</span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-black/[0.06] bg-[#fbfbfd] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onAskChatAboutPair(candA, candB);
            }}
            className="px-4 py-2 rounded-full text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask AI Recruiter About This Pair</span>
          </button>

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
