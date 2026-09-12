import React, { useState } from 'react';
import { Sparkles, Sliders, ShieldCheck, GitCompare, MessageSquare, ArrowRight, Menu, X, RotateCcw, Cpu } from 'lucide-react';

export type AppStage = 'landing' | 'jd' | 'resumes' | 'analyzing' | 'shortlist';

interface NavbarProps {
  currentStage: AppStage;
  onStageChange: (stage: AppStage) => void;
  candidateCount: number;
  onOpenChat: () => void;
  onOpenCompare: () => void;
  onOpenAlgo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStage,
  onStageChange,
  candidateCount,
  onOpenChat,
  onOpenCompare,
  onOpenAlgo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#fbfbfd]/85 backdrop-blur-md border-b border-black/[0.06] transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onStageChange('landing')}
            className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1d1d1f] to-[#3a3a3c] flex items-center justify-center text-white shadow-xs group-hover:scale-[1.03] transition-transform">
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-[#1d1d1f]">
                InternLoom <span className="font-normal text-slate-500">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                Smart Shortlisting Engine
              </span>
            </div>
          </button>

          {/* Flow Stepper Nav (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-black/[0.03] p-1 rounded-full border border-black/[0.04]">
            <button
              onClick={() => onStageChange('landing')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                currentStage === 'landing'
                  ? 'bg-white text-[#1d1d1f] shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-[#1d1d1f]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onStageChange('jd')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                currentStage === 'jd'
                  ? 'bg-white text-[#1d1d1f] shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-[#1d1d1f]'
              }`}
            >
              Job Description
            </button>
            <button
              onClick={() => onStageChange('resumes')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                currentStage === 'resumes'
                  ? 'bg-white text-[#1d1d1f] shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-[#1d1d1f]'
              }`}
            >
              Resumes ({candidateCount})
            </button>
            <button
              onClick={() => onStageChange('shortlist')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                currentStage === 'shortlist'
                  ? 'bg-white text-[#1d1d1f] shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-[#1d1d1f]'
              }`}
            >
              Shortlist
            </button>
          </nav>
        </div>

        {/* Action Controls (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Audit Algorithm Modal Button */}
          <button
            onClick={onOpenAlgo}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Inspect Mathematical Hybrid Scoring Formula"
          >
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit Engine</span>
          </button>

          {/* Head-to-Head Compare Button */}
          <button
            onClick={onOpenCompare}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Compare two candidates side-by-side"
          >
            <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
            <span>Compare</span>
          </button>

          {/* AI Recruiter Assistant Trigger */}
          <button
            onClick={onOpenChat}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Recruiter</span>
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenChat}
            className="p-2 rounded-xl text-[#0071e3] bg-sky-50"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-black/[0.04]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-black/[0.06] bg-white p-4 space-y-2">
          <button
            onClick={() => {
              onStageChange('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-800 hover:bg-slate-50"
          >
            Overview
          </button>
          <button
            onClick={() => {
              onStageChange('jd');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-800 hover:bg-slate-50"
          >
            Job Description
          </button>
          <button
            onClick={() => {
              onStageChange('resumes');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-800 hover:bg-slate-50"
          >
            Resumes ({candidateCount})
          </button>
          <button
            onClick={() => {
              onStageChange('shortlist');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-800 hover:bg-slate-50"
          >
            Shortlist
          </button>
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => {
                onOpenAlgo();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-center rounded-xl bg-slate-100 text-xs font-medium text-slate-700"
            >
              Audit Engine
            </button>
            <button
              onClick={() => {
                onOpenCompare();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-center rounded-xl bg-indigo-50 text-xs font-medium text-indigo-700"
            >
              Compare
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
