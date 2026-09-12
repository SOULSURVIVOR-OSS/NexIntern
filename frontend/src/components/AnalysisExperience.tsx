import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, Sparkles, CheckCircle2, ShieldCheck, Database, Layers } from 'lucide-react';

interface AnalysisExperienceProps {
  candidateCount: number;
  onComplete: () => void;
}

export const AnalysisExperience: React.FC<AnalysisExperienceProps> = ({
  candidateCount,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { title: 'Normalizing candidate text & extracting skills ontology', icon: Layers },
    { title: 'Calculating BM25 lexical term relevance and project depth', icon: Database },
    { title: 'Running local semantic embeddings (BAAI/bge-small-en-v1.5)', icon: Cpu },
    { title: 'Executing dual-engine mathematical fusion & ranking spread', icon: Sparkles },
  ];

  useEffect(() => {
    const totalDuration = 2800; // ms
    const intervalTime = 40;
    const increment = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }

        // Update active step indicator
        if (next < 25) setActiveStep(0);
        else if (next < 50) setActiveStep(1);
        else if (next < 75) setActiveStep(2);
        else setActiveStep(3);

        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <section className="min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-black/[0.07] shadow-xl relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#0071e3]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Animated Central Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-50 to-indigo-50 border border-sky-100 flex items-center justify-center mx-auto mb-6 shadow-xs relative">
          <Cpu className="w-8 h-8 text-[#0071e3] animate-pulse" />
          <Sparkles className="w-4 h-4 text-indigo-500 absolute -top-1 -right-1 animate-bounce" />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] tracking-tight mb-2">
          Evaluating Candidate Pool
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Ranking {candidateCount} candidates through deterministic dual-engine analysis.
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-black/[0.04] h-2 rounded-full overflow-hidden mb-6 p-0.5">
          <motion.div
            className="bg-gradient-to-r from-[#0071e3] to-indigo-600 h-full rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>

        {/* Step Indicator */}
        <div className="space-y-3 text-left bg-black/[0.02] p-4 rounded-2xl border border-black/[0.03]">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isFinished = activeStep > idx || progress === 100;
            const isCurrent = activeStep === idx && progress < 100;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs transition-opacity duration-200 ${
                  isCurrent ? 'opacity-100 font-semibold text-slate-900' : isFinished ? 'opacity-70 text-slate-700' : 'opacity-35 text-slate-400'
                }`}
              >
                {isFinished ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-[#0071e3] border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className="truncate">{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Deterministic • Mathematical Scoring</span>
        </div>

      </div>
    </section>
  );
};
