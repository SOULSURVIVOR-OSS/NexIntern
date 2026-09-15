import React, { useState, useMemo, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  X,
  Sliders,
  Sparkles,
  GitCompare,
  Download,
  RotateCcw,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  GraduationCap,
  Briefcase,
  Layers,
  ChevronDown
} from 'lucide-react';
import { CandidateMatchResult, ScoringWeights, JobDescription } from '../types';
import { CandidateCard } from './CandidateCard';

// Helper function to extract a normalized 0-10 numerical CGPA from text strings like '8.9 / 10' or '3.8/4.0'
export function parseCgpaValue(gpaStr?: string): number | null {
  if (!gpaStr) return null;
  const cleaned = gpaStr.trim();
  // e.g. 8.9 / 10 or 8.9/10
  const tenScaleMatch = cleaned.match(/([\d.]+)\s*(?:\/|\s+out\s+of\s+)\s*10/i);
  if (tenScaleMatch) {
    const val = parseFloat(tenScaleMatch[1]);
    return isNaN(val) ? null : val;
  }
  // e.g. 3.8 / 4 or 3.8/4.0 -> convert to 10 scale (val / 4 * 10)
  const fourScaleMatch = cleaned.match(/([\d.]+)\s*(?:\/|\s+out\s+of\s+)\s*4(?:\.0)?/i);
  if (fourScaleMatch) {
    const val = parseFloat(fourScaleMatch[1]);
    return isNaN(val) ? null : Number(((val / 4) * 10).toFixed(2));
  }
  // raw number e.g. "8.5" or "85%"
  const percentMatch = cleaned.match(/([\d.]+)%/);
  if (percentMatch) {
    const val = parseFloat(percentMatch[1]);
    return isNaN(val) ? null : Number((val / 10).toFixed(2));
  }
  const rawNumMatch = cleaned.match(/[\d.]+/);
  if (rawNumMatch) {
    const val = parseFloat(rawNumMatch[0]);
    if (!isNaN(val)) {
      if (val <= 4.0) return Number(((val / 4) * 10).toFixed(2));
      if (val <= 10.0) return val;
      if (val <= 100) return Number((val / 10).toFixed(2));
    }
  }
  return null;
}

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
  onGoToResumes?: () => void;
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
  onGoToResumes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<'all' | 'strong' | 'moderate' | 'developing'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Dedicated Filter Modal/Drawer State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minCgpa, setMinCgpa] = useState<number>(0);
  const [projectsFilter, setProjectsFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState('');

  // Extract all unique candidate skills and frequency sorted
  const availableSkills = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates.forEach((c) => {
      c.candidate.skills.forEach((skill) => {
        const trimmed = skill.trim();
        if (trimmed) {
          counts[trimmed] = (counts[trimmed] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([skill, count]) => ({ name: skill, count }));
  }, [candidates]);

  // Filtered skills list based on search in filter popup
  const filteredAvailableSkills = useMemo(() => {
    if (!skillSearch.trim()) return availableSkills.slice(0, 24);
    const q = skillSearch.toLowerCase();
    return availableSkills.filter((s) => s.name.toLowerCase().includes(q));
  }, [availableSkills, skillSearch]);

  // Active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (minCgpa > 0) count++;
    if (projectsFilter !== 'all') count++;
    if (selectedSkills.length > 0) count += selectedSkills.length;
    return count;
  }, [minCgpa, projectsFilter, selectedSkills]);

  // Reset custom filters
  const handleResetFilters = () => {
    setMinCgpa(0);
    setProjectsFilter('all');
    setSelectedSkills([]);
    setSkillSearch('');
  };

  const handleToggleSkill = (skillName: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillName) ? prev.filter((s) => s !== skillName) : [...prev, skillName]
    );
  };

  // Filter candidates combining tier, search, CGPA, skills, and projects
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // 1. Tier filter
      if (selectedTier === 'strong' && c.finalScore < 75) return false;
      if (selectedTier === 'moderate' && (c.finalScore < 50 || c.finalScore >= 75)) return false;
      if (selectedTier === 'developing' && c.finalScore >= 50) return false;

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.candidate.name.toLowerCase().includes(q);
        const matchesCollege = c.candidate.education.institution.toLowerCase().includes(q);
        const matchesSkills = c.matchedExplicitSkills.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesCollege && !matchesSkills) return false;
      }

      // 3. CGPA Filter
      if (minCgpa > 0) {
        const parsed = parseCgpaValue(c.candidate.education.gpa);
        if (parsed === null || parsed < minCgpa) return false;
      }

      // 4. Projects (Yes or No)
      if (projectsFilter === 'yes') {
        const count = c.candidate.projects ? c.candidate.projects.length : 0;
        if (count === 0) return false;
      } else if (projectsFilter === 'no') {
        const count = c.candidate.projects ? c.candidate.projects.length : 0;
        if (count > 0) return false;
      }

      // 5. Skills filter (Match ANY or ALL selected skills)
      if (selectedSkills.length > 0) {
        const candidateSkillsLower = c.candidate.skills.map((s) => s.toLowerCase());
        const hasAllSelected = selectedSkills.every((req) => {
          const reqLower = req.toLowerCase();
          return candidateSkillsLower.some((cs) => cs.includes(reqLower) || reqLower.includes(cs));
        });
        if (!hasAllSelected) return false;
      }

      return true;
    });
  }, [candidates, selectedTier, searchQuery, minCgpa, projectsFilter, selectedSkills]);

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
    const headers = [
      'Rank',
      'Name',
      'Email',
      'CGPA',
      'Projects Count',
      'Final Score',
      'Keyword Score',
      'Semantic Score',
      'Matched Skills',
      'Missing Skills',
    ];
    const rows = candidates.map((c) => [
      c.rank,
      `"${c.candidate.name}"`,
      `"${c.candidate.email}"`,
      `"${c.candidate.education.gpa || 'N/A'}"`,
      c.candidate.projects ? c.candidate.projects.length : 0,
      c.finalScore,
      c.keywordScore,
      c.semanticScore,
      `"${c.matchedExplicitSkills.join(', ')}"`,
      `"${c.missingRequiredSkills.join(', ')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `InternLoom_Shortlist_${jobDescription.title.replace(/\s+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#0071e3] dark:text-sky-400 mb-1.5 block">
            Ranked Shortlist
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Your shortlist.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-[#a1a1a6]">
            <span className="font-semibold text-slate-900 dark:text-[#f5f5f7]">
              {candidates.length} candidates
            </span>{' '}
            analyzed for{' '}
            <span className="font-medium text-slate-900 dark:text-[#f5f5f7]">
              {jobDescription.title}
            </span>
            . Ranked by overall fit.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={onOpenChat}
            className="px-3.5 py-2 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/50 text-[#0071e3] dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800/60 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI Recruiter</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-full text-xs font-medium text-slate-700 dark:text-[#ededf0] bg-white dark:bg-[#181a20] hover:bg-slate-50 dark:hover:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* MATCHING ENGINE BANNER */}
      <div className="bg-white dark:bg-[#181a20] rounded-3xl p-5 sm:p-6 border border-black/[0.07] dark:border-white/[0.08] shadow-xs mb-8 overflow-hidden min-w-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 min-w-0">
          {/* Dual-Engine Description */}
          <div className="space-y-1 max-w-lg min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-300">
                Matching Engine
              </span>
              <button
                onClick={onOpenFormula}
                className="text-xs font-semibold text-[#0071e3] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Inspect Formula</span>
              </button>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
              Dual-Engine Hybrid Intelligence
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#a1a1a6] leading-relaxed">
              Transparent deterministic scoring combining explicit lexical token relevance (BM25) with conceptual domain ontology embedding proximity.
            </p>
          </div>

          {/* Interactive Weight Balance Slider */}
          <div className="w-full lg:w-96 bg-black/[0.02] dark:bg-white/[0.04] p-4 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] space-y-3 min-w-0 shrink-0">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0071e3] dark:bg-sky-400" />
                <span className="font-semibold text-slate-800 dark:text-[#f5f5f7]">
                  Keyword ({Math.round(weights.keywordWeight * 100)}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                <span className="font-semibold text-slate-800 dark:text-[#f5f5f7]">
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
              className="w-full accent-[#0071e3] dark:accent-sky-400 cursor-pointer"
            />

            <div className="flex justify-between items-center text-[11px] text-slate-400 dark:text-[#86868b]">
              <span>More exact keyword match</span>
              <span>More conceptual match</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 min-w-0">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-lg min-w-0">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate, college, or skill..."
              className="w-full pl-9 pr-4 py-2 rounded-full text-xs bg-white dark:bg-[#181a20] text-slate-900 dark:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.1] focus:outline-none focus:border-[#0071e3] dark:focus:border-sky-400 shadow-2xs placeholder:text-slate-400 dark:placeholder:text-[#6e6e73]"
            />
          </div>

          {/* Dedicated Filter Button */}
          <button
            id="shortlist-filter-button"
            onClick={() => setIsFilterOpen(true)}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer ${
              activeFilterCount > 0
                ? 'bg-[#0071e3] text-white border-[#0071e3] hover:bg-[#0077ed]'
                : 'bg-white dark:bg-[#181a20] text-slate-700 dark:text-[#ededf0] border-black/[0.08] dark:border-white/[0.1] hover:bg-slate-50 dark:hover:bg-white/[0.05]'
            }`}
            title="Filter by CGPA, Skills, and Projects"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-[#0071e3] text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Tier Filter Pills & View Switcher */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap min-w-0">
          <div className="flex items-center bg-black/[0.03] dark:bg-white/[0.05] p-1 rounded-full border border-black/[0.04] dark:border-white/[0.08] text-xs max-w-full overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedTier('all')}
              className={`px-3 py-1 rounded-full transition whitespace-nowrap cursor-pointer ${
                selectedTier === 'all'
                  ? 'bg-white dark:bg-[#22252e] text-slate-900 dark:text-[#f5f5f7] font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-[#a1a1a6] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({candidates.length})
            </button>
            <button
              onClick={() => setSelectedTier('strong')}
              className={`px-3 py-1 rounded-full transition whitespace-nowrap cursor-pointer ${
                selectedTier === 'strong'
                  ? 'bg-white dark:bg-[#22252e] text-slate-900 dark:text-[#f5f5f7] font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-[#a1a1a6] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Strong (≥75%)
            </button>
            <button
              onClick={() => setSelectedTier('moderate')}
              className={`px-3 py-1 rounded-full transition whitespace-nowrap cursor-pointer ${
                selectedTier === 'moderate'
                  ? 'bg-white dark:bg-[#22252e] text-slate-900 dark:text-[#f5f5f7] font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-[#a1a1a6] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Moderate (50-74%)
            </button>
            <button
              onClick={() => setSelectedTier('developing')}
              className={`px-3 py-1 rounded-full transition whitespace-nowrap cursor-pointer ${
                selectedTier === 'developing'
                  ? 'bg-white dark:bg-[#22252e] text-slate-900 dark:text-[#f5f5f7] font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-[#a1a1a6] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Developing
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-black/[0.03] dark:bg-white/[0.05] p-1 rounded-full border border-black/[0.04] dark:border-white/[0.08] shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#22252e] text-slate-900 dark:text-[#f5f5f7] shadow-2xs'
                  : 'text-slate-500 dark:text-[#86868b]'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#22252e] text-slate-900 dark:text-[#f5f5f7] shadow-2xs'
                  : 'text-slate-500 dark:text-[#86868b]'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 mb-6 flex-wrap text-xs">
          <span className="text-slate-400 dark:text-[#86868b] font-medium text-[11px] uppercase tracking-wider">
            Active Filters:
          </span>

          {minCgpa > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/50 text-[#0071e3] dark:text-sky-300 font-medium border border-sky-200 dark:border-sky-800/60">
              <GraduationCap className="w-3 h-3" />
              <span>CGPA ≥ {minCgpa.toFixed(1)}</span>
              <button
                onClick={() => setMinCgpa(0)}
                className="hover:text-red-500 transition cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {projectsFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-800/60">
              <Layers className="w-3 h-3" />
              <span>Projects: {projectsFilter === 'yes' ? 'Yes (Has projects)' : 'No (None)'}</span>
              <button
                onClick={() => setProjectsFilter('all')}
                className="hover:text-red-500 transition cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800/60"
            >
              <span>{skill}</span>
              <button
                onClick={() => handleToggleSkill(skill)}
                className="hover:text-red-500 transition cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            onClick={handleResetFilters}
            className="text-slate-500 hover:text-slate-800 dark:text-[#a1a1a6] dark:hover:text-white underline text-[11px] font-medium ml-1 cursor-pointer"
          >
            Reset all
          </button>
        </div>
      )}

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
        <div className="bg-white dark:bg-[#181a20] rounded-3xl border border-black/[0.07] dark:border-white/[0.08] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-[#a1a1a6]">
              <thead className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06] text-[11px] font-semibold text-slate-500 dark:text-[#86868b] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Rank</th>
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">CGPA</th>
                  <th className="py-3.5 px-4">Projects</th>
                  <th className="py-3.5 px-4">Overall Fit</th>
                  <th className="py-3.5 px-4">Semantic</th>
                  <th className="py-3.5 px-4">Keyword</th>
                  <th className="py-3.5 px-4">Matched Core Skills</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {filteredCandidates.map((c) => (
                  <tr
                    key={c.candidateId}
                    className="hover:bg-slate-50/60 dark:hover:bg-white/[0.04] transition cursor-pointer"
                    onClick={() => onSelectCandidate(c)}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-[#f5f5f7]">#{c.rank}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-[#f5f5f7]">{c.candidate.name}</div>
                      <div className="text-[11px] text-slate-400 dark:text-[#86868b]">{c.candidate.education.institution}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {c.candidate.education.gpa || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {c.candidate.projects && c.candidate.projects.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                          {c.candidate.projects.length} {c.candidate.projects.length === 1 ? 'project' : 'projects'}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-[11px]">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">{c.finalScore}%</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-[#ededf0]">{c.semanticScore}%</td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-[#ededf0]">{c.keywordScore}%</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {c.matchedExplicitSkills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/60 font-medium text-[10px]"
                          >
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
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1d1d1f] dark:bg-white text-white dark:text-[#121316] hover:bg-black dark:hover:bg-slate-100 transition cursor-pointer"
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
      {candidates.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#181a20] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] my-8 shadow-2xs">
          <p className="text-base font-bold text-slate-800 dark:text-[#f5f5f7]">Your candidate pool is empty</p>
          <p className="text-xs text-slate-500 dark:text-[#a1a1a6] mt-1 max-w-sm mx-auto">
            Upload candidate resumes in the Resumes stage to run evaluation and view ranked insights.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2.5 flex-wrap">
            {onGoToResumes && (
              <button
                onClick={onGoToResumes}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white transition shadow-2xs cursor-pointer"
              >
                Upload Resumes
              </button>
            )}
          </div>
        </div>
      ) : filteredCandidates.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-[#181a20] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] my-8">
          <p className="text-sm font-semibold text-slate-800 dark:text-[#f5f5f7]">No candidates match the active filter criteria.</p>
          <p className="text-xs text-slate-500 dark:text-[#a1a1a6] mt-1">
            Try adjusting your CGPA cutoff, skills selection, or project requirements.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTier('all');
              handleResetFilters();
            }}
            className="mt-4 px-4 py-2 rounded-full text-xs font-semibold bg-black/[0.05] dark:bg-white/[0.08] text-slate-700 dark:text-slate-200 hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* FILTER MODAL */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-lg bg-white dark:bg-[#181a20] rounded-3xl border border-black/[0.08] dark:border-white/[0.1] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0071e3] dark:text-sky-300 flex items-center justify-center">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-[#f5f5f7]">
                      Filter Shortlist
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#a1a1a6]">
                      Filter candidates by CGPA, Required Skills, and Projects
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body with Scroll */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* 1. CGPA Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#f5f5f7] flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#0071e3] dark:text-sky-400" />
                      <span>Minimum CGPA (Scale of 10)</span>
                    </label>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0071e3] dark:text-sky-300 border border-sky-100 dark:border-sky-900/60">
                      {minCgpa > 0 ? `≥ ${minCgpa.toFixed(1)}` : 'Any CGPA'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="9.5"
                    step="0.5"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(parseFloat(e.target.value))}
                    className="w-full accent-[#0071e3] dark:accent-sky-400 cursor-pointer"
                  />

                  <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-[#86868b]">
                    <span>Any</span>
                    <span>6.0+</span>
                    <span>7.0+</span>
                    <span>8.0+</span>
                    <span>8.5+</span>
                    <span>9.0+</span>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {[0, 7.0, 8.0, 8.5, 9.0].map((val) => (
                      <button
                        key={val}
                        onClick={() => setMinCgpa(val)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                          minCgpa === val
                            ? 'bg-[#0071e3] text-white shadow-2xs'
                            : 'bg-black/[0.03] dark:bg-white/[0.05] text-slate-600 dark:text-[#a1a1a6] hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {val === 0 ? 'Any' : `≥ ${val.toFixed(1)}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Projects Filter (Yes or No) */}
                <div className="space-y-3 pt-2 border-t border-black/[0.05] dark:border-white/[0.06]">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#f5f5f7] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Projects Experience</span>
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setProjectsFilter('all')}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition text-center cursor-pointer ${
                        projectsFilter === 'all'
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-2xs'
                          : 'bg-black/[0.02] dark:bg-white/[0.04] text-slate-600 dark:text-[#a1a1a6] border-black/[0.05] dark:border-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      All Candidates
                    </button>

                    <button
                      onClick={() => setProjectsFilter('yes')}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition text-center cursor-pointer ${
                        projectsFilter === 'yes'
                          ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-2xs'
                          : 'bg-black/[0.02] dark:bg-white/[0.04] text-slate-600 dark:text-[#a1a1a6] border-black/[0.05] dark:border-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      Yes (Has Projects)
                    </button>

                    <button
                      onClick={() => setProjectsFilter('no')}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition text-center cursor-pointer ${
                        projectsFilter === 'no'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                          : 'bg-black/[0.02] dark:bg-white/[0.04] text-slate-600 dark:text-[#a1a1a6] border-black/[0.05] dark:border-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      No (Zero Projects)
                    </button>
                  </div>
                </div>

                {/* 3. Skills Filter */}
                <div className="space-y-3 pt-2 border-t border-black/[0.05] dark:border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#f5f5f7] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Filter by Skills</span>
                    </label>
                    {selectedSkills.length > 0 && (
                      <span className="text-[11px] text-[#0071e3] dark:text-sky-400 font-semibold">
                        {selectedSkills.length} selected
                      </span>
                    )}
                  </div>

                  {/* Skill Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="Search skill (e.g. React, Python, Docker)..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] focus:outline-none focus:border-[#0071e3] text-slate-900 dark:text-[#f5f5f7] placeholder:text-slate-400"
                    />
                  </div>

                  {/* Skills Pill Selector */}
                  <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                    {filteredAvailableSkills.map((s) => {
                      const isSelected = selectedSkills.includes(s.name);
                      return (
                        <button
                          key={s.name}
                          onClick={() => handleToggleSkill(s.name)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                              : 'bg-black/[0.02] dark:bg-white/[0.04] text-slate-700 dark:text-[#ededf0] border-black/[0.05] dark:border-white/[0.08] hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
                          }`}
                        >
                          <span>{s.name}</span>
                          <span
                            className={`text-[10px] px-1 rounded-full ${
                              isSelected
                                ? 'bg-emerald-700 text-white'
                                : 'bg-black/[0.05] dark:bg-white/[0.1] text-slate-500 dark:text-slate-300'
                            }`}
                          >
                            {s.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between">
                <button
                  onClick={handleResetFilters}
                  disabled={activeFilterCount === 0}
                  className={`text-xs font-medium transition cursor-pointer ${
                    activeFilterCount > 0
                      ? 'text-slate-600 dark:text-[#a1a1a6] hover:text-slate-900 dark:hover:text-white'
                      : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  Clear filters
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition shadow-2xs cursor-pointer"
                  >
                    Apply Filters ({filteredCandidates.length} matches)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-black/[0.05] dark:border-white/[0.06] text-center text-xs text-slate-400 dark:text-[#86868b]">
        <p>InternLoom AI • Intelligent Shortlisting Engine</p>
      </footer>
    </section>
  );
};
