import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, CheckCircle2, SlidersHorizontal, Cpu, ShieldCheck } from 'lucide-react';
import { ScoreCounter } from './ScoreCounter';

interface HeroSectionProps {
  onStartShortlisting: () => void;
  onSeeHowItWorks: () => void;
  candidateCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartShortlisting,
  onSeeHowItWorks,
  candidateCount,
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32">
      {/* Subtle Apple-like ambient chromatic aura */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 113, 227, 0.18), rgba(88, 86, 214, 0.12), transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Subtle Pill Tag */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/[0.03] border border-black/[0.06] text-xs font-medium text-slate-700 mb-6 backdrop-blur-xs shadow-2xs"
        >
          <span className="w-2 h-2 rounded-full bg-[#0071e3] animate-pulse" />
          <span>Next-Generation Campus Recruitment Engine</span>
        </motion.div>

        {/* Apple-style Monumental Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#1d1d1f] leading-[1.08]"
        >
          Find the right candidate.
          <br />
          <span className="bg-gradient-to-r from-[#1d1d1f] via-slate-700 to-[#0071e3] bg-clip-text text-transparent">
            Not just the right keywords.
          </span>
        </motion.h1>

        {/* Clean Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          InternLoom AI combines semantic understanding with explicit skill matching to intelligently rank candidates against any job description.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4"
        >
          <button
            onClick={onStartShortlisting}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.99]"
          >
            <span>Start Shortlisting</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onSeeHowItWorks}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-medium bg-black/[0.04] hover:bg-black/[0.07] text-[#1d1d1f] transition-all duration-200"
          >
            See how it works
          </button>
        </motion.div>

        {/* Live Interactive Dual-Engine Teaser Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="mt-14 max-w-2xl mx-auto rounded-3xl bg-white/85 backdrop-blur-xl border border-black/[0.07] p-6 sm:p-7 text-left shadow-[0_12px_40px_rgba(0,0,0,0.06)] relative overflow-hidden group hover:border-black/[0.12] transition-all"
        >
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-sky-50 text-[#0071e3] border border-sky-100 flex items-center justify-center font-bold text-sm">
                #1
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#1d1d1f]">Aarav Sharma</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Strong Fit
                  </span>
                </div>
                <p className="text-xs text-slate-500">B.Tech Computer Science • Full-Stack Portfolio</p>
              </div>
            </div>

            {/* Score animation */}
            <div className="text-right">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                Overall Match
              </span>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
                <ScoreCounter value={92.4} decimals={1} suffix="%" />
              </div>
            </div>
          </div>

          {/* Tri-metric breakdown */}
          <div className="grid grid-cols-3 gap-3 my-4 py-3 bg-black/[0.02] rounded-2xl px-4 border border-black/[0.03]">
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Semantic Match</span>
              <span className="text-sm font-semibold text-[#1d1d1f]">94%</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Keyword Match</span>
              <span className="text-sm font-semibold text-[#1d1d1f]">91%</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Required Skills</span>
              <span className="text-sm font-semibold text-[#1d1d1f]">90%</span>
            </div>
          </div>

          {/* Matched tags */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-500 mr-1 font-medium">Verified Evidence:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-100">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> React
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-100">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Node.js
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-100">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PostgreSQL
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200">
              ⚠ Docker (Junior Level)
            </span>
          </div>

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-black/[0.04] flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Transparent mathematical scoring • Zero blind LLM guesswork
            </span>
            <span className="font-semibold text-[#0071e3] group-hover:underline cursor-pointer" onClick={onStartShortlisting}>
              Evaluate {candidateCount} Resumes →
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
