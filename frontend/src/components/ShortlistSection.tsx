import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, Sliders, Sparkles, GitCompare, Download, RotateCcw, LayoutGrid, List, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { CandidateMatchResult, ScoringWeights, JobDescription } from '../types';
import { CandidateCard } from './CandidateCard';

interface ShortlistSectionProps {
  candidates: CandidateMatchResult[];
  jobDescription: JobDescription;
  weights: ScoringWeights;
  onWeightsChange: (weights: ScoringWeights) => void;
  onSelectCandidate: (candidate: CandidateMatchResult) => void;
  onCompareCandidate: (candidate: CandidateMatchResult) => void;
  onOpenFormula: () => void;
  onOpenChat: () => void;
  onRestart: () => void;
}

export const ShortlistSection: React.FC<ShortlistSectionProps> = ({
  candidates,
  jobDescription,
  weights,
  onWeightsChange,
  onSelectCandidate,
  onCompareCandidate,
  onOpenFormula,
  onOpenChat,
  onRestart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<'all' | 'strong' | 'moderate' | 'developing'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // Tier filter
      if (selectedTier === 'strong' && c.finalScore < 75) return false;
      if (selectedTier === 'moderate' && (c.finalScore < 50 || c.finalScore >= 75)) return false;
      if (selectedTier === 'developing' && c.finalScore >= 50) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.candidate.name.toLowerCase().includes(q);
        const matchesCollege = c.candidate.education.institution.toLowerCase().includes(q);
        const matchesSkills = c.matchedExplicitSkills.some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesCollege && !matchesSkills) return false;
      }

      return true;
    });
  }, [candidates, selectedTier, searchQuery]);

  // Handle slider changes
  const handleWeightSlider = (val: number) => {
    const kwWeight = Number((val / 100).toFixed(2));
    const semWeight = Number((1 - kwWeight).toFixed(2));
    onWeightsChange({
      ...weights,
      keywordWeight: kwWeight,
      semanticWeight: semWeight,
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Rank', 'Name', 'Email', 'Final Score', 'Keyword Score', 'Semantic Score', 'Matched Skills', 'Missing Skills'];
    const rows = candidates.map(c => [
      c.rank,
      `"${c.candidate.name}"`,
      `"${c.candidate.email}"`,
      c.finalScore,
      c.keywordScore,
      c.semanticScore,
      `"${c.matchedExplicitSkills.join(', ')}"`,
      `"${c.missingRequiredSkills.join(', ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `InternLoom_Shortlist_${jobDescription.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#0071e3] mb-1.5 block">
            Ranked Shortlist
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f]">
            Your shortlist.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            <span className="font-semibold text-slate-900">{candidates.length} candidates</span> analyzed for{' '}
            <span className="font-medium text-slate-900">{jobDescription.title}</span>. Ranked by overall fit.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={onOpenChat}
            className="px-3.5 py-2 rounded-full text-xs font-semibold bg-sky-50 text-[#0071e3] hover:bg-sky-100 border border-sky-200 transition flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI Recruiter</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-full text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-black/[0.08] transition flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* MATCHING ENGINE BANNER (Hackathon Requirement) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.07] shadow-xs mb-8 overflow-hidden min-w-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 min-w-0">
          
          {/* Dual-Engine Description */}
          <div className="space-y-1 max-w-lg min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/[0.04] text-slate-700">
                Matching Engine
              </span>
              <button
                onClick={onOpenFormula}
                className="text-xs font-semibold text-[#0071e3] hover:underline flex items-center gap-1"
              >
                <span>Inspect Formula</span>
              </button>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#1d1d1f] tracking-tight">
              Dual-Engine Hybrid Intelligence
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Transparent deterministic scoring combining explicit lexical token relevance (BM25) with conceptual domain ontology embedding proximity.
            </p>
          </div>

          {/* Interactive Weight Balance Slider */}
          <div className="w-full lg:w-96 bg-black/[0.02] p-4 rounded-2xl border border-black/[0.04] space-y-3 min-w-0 shrink-0">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
                <span className="font-semibold text-slate-800">
                  Keyword ({Math.round(weights.keywordWeight * 100)}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span className="font-semibold text-slate-800">
                  Semantic ({Math.round(weights.semanticWeight * 100)}%)
                </span>
              </div>
            </div>

            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={Math.round(weights.keywordWeight * 100)}
              onChange={(e) => handleWeightSlider(Number(e.target.value))}
              className="w-full accent-[#0071e3] cursor-pointer"
            />

            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>More exact keyword match</span>
              <span>More conceptual match</span>
            </div>
          </div>

        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 min-w-0">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, college, or skill..."
            className="w-full pl-9 pr-4 py-2 rounded-full text-xs bg-white border border-black/[0.08] focus:outline-none focus:border-[#0071e3] shadow-2xs placeholder:text-slate-400"
          />
        </div>

        {/* Tier Filter Pills & View Switcher */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap min-w-0">
          <div className="flex items-center bg-black/[0.03] p-1 rounded-full border border-black/[0.04] text-xs max-w-full overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedTier('all')}
              className={`px-3 py-1 rounded-full transition whitespace-nowrap ${
                selectedTier === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({candidates.length})
            </button>
            <button
              onClick={() => setSelectedTier('strong')}
              className={`px-3 py-1 rounded-full transition whitespace-nowrap ${
                selectedTier === 'strong'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Strong (≥75%)
            </button>
            <button
              onClick={() => setSelectedTier('moderate')}
              className={`px-3 py-1 rounded-full transition whitespace-nowrap ${
                selectedTier === 'moderate'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Moderate (50-74%)
            </button>
            <button
              onClick={() => setSelectedTier('developing')}
              className={`px-3 py-1 rounded-full transition whitespace-nowrap ${
                selectedTier === 'developing'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Developing
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-black/[0.03] p-1 rounded-full border border-black/[0.04] shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
              title="Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-full transition ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Candidate Cards Grid with Framer Motion spring-based layout animation */}
      {viewMode === 'grid' ? (
        <motion.div
          layout
          transition={{
            layout: {
              type: 'spring',
              stiffness: 260,
              damping: 24,
              mass: 0.85,
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 min-w-0"
        >
          <AnimatePresence mode="popLayout">
            {filteredCandidates.map((c, idx) => (
              <CandidateCard
                key={c.candidateId}
                candidate={c}
                onSelect={onSelectCandidate}
                onCompare={onCompareCandidate}
                index={idx}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Alternative Compact List Table */
        <div className="bg-white rounded-3xl border border-black/[0.07] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Rank</th>
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Overall Fit</th>
                  <th className="py-3.5 px-4">Semantic</th>
                  <th className="py-3.5 px-4">Keyword</th>
                  <th className="py-3.5 px-4">Matched Core Skills</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.map((c) => (
                  <tr
                    key={c.candidateId}
                    className="hover:bg-slate-50/60 transition cursor-pointer"
                    onClick={() => onSelectCandidate(c)}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900">#{c.rank}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{c.candidate.name}</div>
                      <div className="text-[11px] text-slate-400">{c.candidate.education.institution}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-sm text-[#1d1d1f]">{c.finalScore}%</span>
                    </td>
                    <td className="py-3 px-4 font-medium">{c.semanticScore}%</td>
                    <td className="py-3 px-4 font-medium">{c.keywordScore}%</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {c.matchedExplicitSkills.slice(0, 3).map(s => (
                          <span key={s} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCandidate(c);
                        }}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1d1d1f] text-white hover:bg-black"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCandidates.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-black/[0.06] my-8">
          <p className="text-sm font-semibold text-slate-800">No candidates match the active filter.</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting "All".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTier('all');
            }}
            className="mt-4 px-4 py-2 rounded-full text-xs font-semibold bg-black/[0.05] text-slate-700 hover:bg-black/[0.08]"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-black/[0.05] text-center text-xs text-slate-400">
        <p>InternLoom AI • Intelligent Shortlisting Engine • Apple-Inspired Minimal Interface</p>
      </footer>

    </section>
  );
};
