import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, ArrowUpRight, GitCompare, Sparkles, GraduationCap } from 'lucide-react';
import { CandidateMatchResult } from '../types';
import { ScoreCounter } from './ScoreCounter';

interface CandidateCardProps {
  candidate: CandidateMatchResult;
  onSelect: (candidate: CandidateMatchResult) => void;
  onCompare: (candidate: CandidateMatchResult) => void;
  index: number;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onSelect,
  onCompare,
  index,
}) => {
  const isTopCandidate = candidate.rank === 1;
  const isTopThree = candidate.rank <= 3;
  const c = candidate.candidate;

  // Calculate required skills match percentage
  const totalRequired = candidate.matchedExplicitSkills.length + candidate.missingRequiredSkills.length;
  const requiredMatchPercent = totalRequired > 0
    ? Math.round((candidate.matchedExplicitSkills.length / totalRequired) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        layout: {
          type: 'spring',
          stiffness: 260,
          damping: 24,
          mass: 0.85,
        },
        opacity: { duration: 0.22, ease: 'easeOut' },
        scale: { duration: 0.22, ease: 'easeOut' },
      }}
      className={`rounded-3xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between text-left group relative overflow-hidden w-full min-w-0 ${
        isTopCandidate
          ? 'bg-white border-[#0071e3]/30 shadow-[0_12px_36px_rgba(0,113,227,0.08)] ring-1 ring-[#0071e3]/20'
          : 'bg-white border-black/[0.07] shadow-xs hover:shadow-md hover:border-black/[0.12]'
      }`}
    >
      {/* Top Banner & Header */}
      <div className="min-w-0 w-full">
        <div className="flex items-start justify-between gap-2.5 mb-3.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm tracking-tight shrink-0 ${
                isTopCandidate
                  ? 'bg-[#0071e3] text-white shadow-xs'
                  : isTopThree
                  ? 'bg-slate-900 text-white'
                  : 'bg-black/[0.04] text-slate-700'
              }`}
            >
              #{candidate.rank}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-[#1d1d1f] tracking-tight group-hover:text-[#0071e3] transition-colors truncate">
                  {c.name}
                </h3>
                {isTopCandidate && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0071e3] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 shrink-0">
                    <Sparkles className="w-2.5 h-2.5" /> Top Ranked
                  </span>
                )}
              </div>
              <p
                className="text-xs text-slate-500 truncate mt-0.5"
                title={`${c.education.degree} • ${c.education.institution}`}
              >
                {c.education.degree} • {c.education.institution}
              </p>
            </div>
          </div>

          {/* Overall Match Score (Animated) */}
          <div className="text-right shrink-0 pl-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Overall Match
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
              <ScoreCounter value={candidate.finalScore} decimals={1} suffix="%" />
            </div>
          </div>
        </div>

        {/* Tri-Metric Match Breakdown */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-black/[0.02] rounded-2xl border border-black/[0.03] my-3.5 overflow-hidden">
          <div className="min-w-0">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] gap-1 mb-1">
              <span className="text-slate-500 font-medium truncate" title="Semantic">Semantic</span>
              <span className="font-bold text-slate-800 shrink-0">{candidate.semanticScore}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-1 rounded-full"
                style={{ width: `${candidate.semanticScore}%` }}
              />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] gap-1 mb-1">
              <span className="text-slate-500 font-medium truncate" title="Keyword">Keyword</span>
              <span className="font-bold text-slate-800 shrink-0">{candidate.keywordScore}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
              <div
                className="bg-[#0071e3] h-1 rounded-full"
                style={{ width: `${candidate.keywordScore}%` }}
              />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] gap-1 mb-1">
              <span className="text-slate-500 font-medium truncate" title="Required">Required</span>
              <span className="font-bold text-slate-800 shrink-0">{requiredMatchPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-1 rounded-full"
                style={{ width: `${requiredMatchPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Matched Skills */}
        <div className="space-y-2 mt-3.5 min-w-0">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
              Matched Skills ({candidate.matchedExplicitSkills.length})
            </span>
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {candidate.matchedExplicitSkills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  title={skill}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-100 max-w-full"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate max-w-[180px] sm:max-w-[210px]">{skill}</span>
                </span>
              ))}
              {candidate.matchedExplicitSkills.length > 5 && (
                <span className="text-[10px] text-slate-400 font-medium self-center shrink-0">
                  +{candidate.matchedExplicitSkills.length - 5} more
                </span>
              )}
            </div>
          </div>

          {/* Missing / Gaps */}
          {candidate.missingRequiredSkills.length > 0 && (
            <div className="pt-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                Missing / Unclear ({candidate.missingRequiredSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5 min-w-0">
                {candidate.missingRequiredSkills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    title={skill}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200/60 max-w-full"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="truncate max-w-[180px] sm:max-w-[210px]">{skill}</span>
                  </span>
                ))}
                {candidate.missingRequiredSkills.length > 3 && (
                  <span className="text-[10px] text-slate-400 font-medium self-center shrink-0">
                    +{candidate.missingRequiredSkills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Why this candidate explanation snippet */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 min-w-0">
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 break-words">
            "{candidate.explanation}"
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3.5 border-t border-black/[0.04] flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={() => onCompare(candidate)}
          className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-[#1d1d1f] hover:bg-black/[0.04] transition flex items-center gap-1.5 shrink-0"
        >
          <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
          <span>Compare</span>
        </button>

        <button
          onClick={() => onSelect(candidate)}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1d1d1f] hover:bg-black text-white transition flex items-center gap-1 group-hover:bg-[#0071e3] shrink-0"
        >
          <span>Detailed Analysis</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </motion.div>
  );
};
