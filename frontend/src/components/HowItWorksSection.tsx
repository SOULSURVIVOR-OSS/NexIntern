import React from 'react';
import { motion } from 'motion/react';
import { FileUp, Cpu, Award, Check, Sparkles, SlidersHorizontal, ArrowRight } from 'lucide-react';

interface HowItWorksSectionProps {
  onStart: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onStart }) => {
  const steps = [
    {
      num: '01',
      tag: 'UPLOAD',
      title: 'Add your Job Description and candidate resumes.',
      description: 'Upload your campus job description and multiple student resumes. Our parser handles PDFs, Word documents, or raw text with zero formatting penalties.',
      icon: FileUp,
      accent: 'from-sky-50 to-blue-50 text-[#0071e3] border-sky-100',
      visual: (
        <div className="mt-4 p-3.5 bg-black/[0.02] rounded-2xl border border-black/[0.04] text-left text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
            <span>Job Description</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">✓ Parsed</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>10 Required Skills Extracted</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>18 Candidate Resumes Attached</span>
          </div>
        </div>
      ),
    },
    {
      num: '02',
      tag: 'ANALYZE',
      title: 'InternLoom AI combines keyword and semantic understanding.',
      description: 'Unlike black-box LLMs, our dual-engine architecture computes deterministic BM25 lexical precision alongside domain-aware semantic embedding proximity.',
      icon: Cpu,
      accent: 'from-indigo-50 to-purple-50 text-indigo-600 border-indigo-100',
      visual: (
        <div className="mt-4 p-3.5 bg-black/[0.02] rounded-2xl border border-black/[0.04] text-left text-xs space-y-2.5">
          <div className="flex justify-between text-[11px]">
            <span className="font-medium text-slate-600">BM25 Keyword Engine</span>
            <span className="font-semibold text-slate-900">50% Weight</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0071e3] h-1.5 rounded-full w-[50%]" />
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="font-medium text-slate-600">Semantic Domain Ontology</span>
            <span className="font-semibold text-slate-900">50% Weight</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full w-[50%]" />
          </div>
        </div>
      ),
    },
    {
      num: '03',
      tag: 'RANK',
      title: 'Candidates are ranked with transparent, explainable scores.',
      description: 'Review an objectively ordered shortlist with deep evidence citations, gap analyses, and instant head-to-head comparative explanations.',
      icon: Award,
      accent: 'from-emerald-50 to-teal-50 text-[#0a664e] border-emerald-100',
      visual: (
        <div className="mt-4 p-3.5 bg-black/[0.02] rounded-2xl border border-black/[0.04] text-left text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">#1 Aarav Sharma</span>
            <span className="font-bold text-[#0071e3] bg-sky-50 px-2 py-0.5 rounded-full">92.4%</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>#2 Rohan Gupta</span>
            <span className="font-medium text-slate-700">89.6%</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>#3 Priya Nair</span>
            <span className="font-medium text-slate-700">88.7%</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 border-t border-black/[0.05] bg-[#fbfbfd]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-[#0071e3] mb-2 block">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
            Intelligent shortlisting, simplified.
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Three intuitive steps from raw resumes to explainable hiring decisions.
          </p>
        </motion.div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between text-left group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono font-bold tracking-widest text-slate-400">
                      {step.num}
                    </span>
                    <span className="text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-black/[0.03] text-slate-700">
                      {step.tag}
                    </span>
                  </div>

                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${step.accent} flex items-center justify-center mb-5 border`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-lg font-bold text-[#1d1d1f] tracking-tight leading-snug mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                {step.visual}
              </motion.div>
            );
          })}
        </div>

        {/* Action button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-14"
        >
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold bg-[#1d1d1f] hover:bg-black text-white transition-all shadow-xs hover:shadow hover:scale-[1.02]"
          >
            <span>Proceed to Step 01: Job Description</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

      </div>
    </section>
  );
};
