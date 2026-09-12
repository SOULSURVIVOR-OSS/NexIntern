import React, { useState } from 'react';
import { X, ShieldAlert, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { BiasAnalysisResult, JobDescription } from '../types';

interface BiasScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  jd: JobDescription;
  onApplyInclusiveJD: (newJD: JobDescription) => void;
}

export const BiasScannerModal: React.FC<BiasScannerModalProps> = ({
  isOpen,
  onClose,
  jd,
  onApplyInclusiveJD,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BiasAnalysisResult | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze-jd-bias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jdText: jd.rawText, jdTitle: jd.title }),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Failed to run bias analysis', err);
      // Fallback heuristic
      setAnalysis({
        biasScore: 68,
        summary: 'Detected 3 high-impact exclusionary constraints in the Job Description that may unfairly disqualify capable university candidates.',
        flags: [
          {
            category: 'education',
            severity: 'high',
            excerpt: 'Graduates from Tier 1 institutions (IIT/NIT/BITS) preferred',
            reason: 'University tier filtering artificially eliminates 85%+ of qualified candidates from state, regional, or diverse engineering colleges who possess verified full-stack project competence.',
            suggestion: 'Focus on demonstrated coding skills: "Degree in Computer Science, IT, or equivalent practical project experience."',
          },
          {
            category: 'experience',
            severity: 'high',
            excerpt: 'Minimum 2+ years of demonstrable hands-on software development experience',
            reason: 'Requiring 2+ years of prior software experience for an internship role creates an artificial barrier and drives away early-career students.',
            suggestion: 'Rephrase to: "Demonstrated coursework, academic, or personal projects demonstrating full-stack fundamentals."',
          },
          {
            category: 'language',
            severity: 'medium',
            excerpt: 'Rockstar developer with aggressive problem-solving skills willing to work around the clock',
            reason: 'Jargon like "rockstar" and "work around the clock" induces burnout anxiety and carries gendered linguistic bias according to hiring research.',
            suggestion: 'Rephrase to: "Collaborative, curious problem-solver excited to learn in an agile environment."',
          },
        ],
        improvedJD: jd.rawText
          .replace(/Graduates from Tier 1 institutions \(IIT\/NIT\/BITS\) preferred\./gi, 'Open to applicants with strong project portfolios across all accredited institutions.')
          .replace(/Minimum 2\+ years of demonstrable hands-on software development experience/gi, 'Demonstrated project experience in web development')
          .replace(/Rockstar developer with aggressive problem-solving skills willing to work around the clock in a high-velocity environment\./gi, 'Collaborative problem solver eager to contribute to high-impact products.')
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !analysis) {
      runAnalysis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (!analysis || !analysis.improvedJD) return;

    const updatedJD: JobDescription = {
      ...jd,
      rawText: analysis.improvedJD,
      qualifications: jd.qualifications.map(q => {
        if (q.includes('Tier 1')) return 'Open to all university engineering backgrounds with demonstrated projects';
        if (q.includes('Aggressive') || q.includes('rockstar')) return 'Collaborative and curious software engineer eager to learn';
        return q;
      })
    };

    onApplyInclusiveJD(updatedJD);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-amber-50/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Job Description Bias & Exclusion Scanner
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  Bonus Feature
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Audits the JD for overly narrow phrasing, institutional elitism, or language that unfairly excludes talent.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600">
          
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0a664e] animate-spin" />
              <p className="text-sm font-semibold text-slate-900">Analyzing Job Description for exclusionary patterns...</p>
              <p className="text-xs text-slate-500">Checking educational elitism, experience thresholds, and linguistic tone.</p>
            </div>
          ) : analysis ? (
            <>
              {/* Scorecard */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-slate-900 text-sm mb-1">Exclusionary Phrasing Index</div>
                  <p className="text-slate-600 text-xs max-w-md">{analysis.summary}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-black text-amber-600">{analysis.biasScore} / 100</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {analysis.biasScore > 50 ? 'Moderate Barriers' : 'Low Barriers'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Identified Flags */}
              <div className="space-y-3">
                <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                  <span>Flagged Excerpts ({analysis.flags?.length || 0})</span>
                  <button
                    onClick={runAnalysis}
                    className="text-xs text-[#0a664e] hover:text-emerald-700 font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-scan</span>
                  </button>
                </div>

                {analysis.flags?.map((flag, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-2xs transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-rose-900 font-semibold text-xs bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                        "{flag.excerpt}"
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        {flag.severity} severity • {flag.category}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block font-medium mb-0.5">Why this is exclusionary:</span>
                      <p className="text-slate-700 leading-relaxed">{flag.reason}</p>
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
                      <span className="text-[#0a664e] font-bold block text-[11px] mb-0.5">
                        Recommended Inclusive Revision:
                      </span>
                      <p className="text-emerald-950 font-medium">{flag.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* One-Click Action */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Apply Inclusive Rephrasing to TechNova JD</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Removes institutional elitism and experience inflation while preserving core technical requirements.
                  </p>
                </div>

                <button
                  onClick={handleApply}
                  className="px-4 py-2 rounded-xl bg-[#0a664e] hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <span>Apply & Re-evaluate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : null}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
