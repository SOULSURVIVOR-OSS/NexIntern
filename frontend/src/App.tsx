import React, { useState, useMemo } from 'react';
import { sampleJobDescription, sampleCandidates } from './data/sampleData';
import { evaluateCandidates } from './services/matchingEngine';
import { JobDescription, CandidateResume, CandidateMatchResult, ScoringWeights } from './types';
import { Navbar, AppStage } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { JDUploadStage } from './components/JDUploadStage';
import { ResumeUploadStage } from './components/ResumeUploadStage';
import { AnalysisExperience } from './components/AnalysisExperience';
import { ShortlistSection } from './components/ShortlistSection';
import { CandidateDetailModal } from './components/CandidateDetailModal';
import { CandidateComparisonModal } from './components/CandidateComparisonModal';
import { RecruiterChatDrawer } from './components/RecruiterChatDrawer';
import { AlgorithmInspectorModal } from './components/AlgorithmInspectorModal';
import { BiasScannerModal } from './components/BiasScannerModal';
import { ResumeUploadModal } from './components/ResumeUploadModal';
import { JDViewerModal } from './components/JDViewerModal';
import { Check } from 'lucide-react';

export default function App() {
  // 1. Navigation & Stage State
  const [currentStage, setCurrentStage] = useState<AppStage>('landing');

  // 2. Core Model State (Preserving all logic & data)
  const [jobDescription, setJobDescription] = useState<JobDescription>(sampleJobDescription);
  const [candidates, setCandidates] = useState<CandidateResume[]>(sampleCandidates);
  const [weights, setWeights] = useState<ScoringWeights>({
    keywordWeight: 0.5,
    semanticWeight: 0.5,
    minScoreFilter: 0,
    mustHaveSkills: [],
  });

  // 3. UI, Modals & Drawers State
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatchResult | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareCandAId, setCompareCandAId] = useState<string | undefined>();
  const [compareCandBId, setCompareCandBId] = useState<string | undefined>();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState<string | undefined>();
  const [isAlgoModalOpen, setIsAlgoModalOpen] = useState(false);
  const [isBiasModalOpen, setIsBiasModalOpen] = useState(false);
  const [isJDModalOpen, setIsJDModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 4. Source of Truth Scoring Calculation (Deterministic Hybrid Engine)
  const rankedResults = useMemo(() => {
    return evaluateCandidates(jobDescription, candidates, weights);
  }, [jobDescription, candidates, weights]);

  // Handlers
  const handleAddCandidate = (newCand: CandidateResume) => {
    setCandidates(prev => [newCand, ...prev]);
    showToast(`Added ${newCand.name} to candidate pool.`);
  };

  const handleRemoveCandidate = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
    showToast('Candidate removed from pool.');
  };

  const handleOpenCompare = (candA?: CandidateMatchResult, candB?: CandidateMatchResult) => {
    if (candA) setCompareCandAId(candA.candidateId);
    if (candB) {
      setCompareCandBId(candB.candidateId);
    } else if (rankedResults.length > 1) {
      const other = rankedResults.find(r => r.candidateId !== candA?.candidateId) || rankedResults[1];
      setCompareCandBId(other.candidateId);
    }
    setIsCompareModalOpen(true);
  };

  const handleAskChatAboutPair = (candA: CandidateMatchResult, candB: CandidateMatchResult) => {
    setChatInitialQuery(`Why is ${candA.candidate.name} ranked higher than ${candB.candidate.name}?`);
    setIsChatOpen(true);
  };

  const handleApplyInclusiveJD = (newJD: JobDescription) => {
    setJobDescription(newJD);
    showToast('Applied inclusive JD rephrasing! Candidates updated.');
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] font-sans antialiased selection:bg-[#0071e3] selection:text-white flex flex-col">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-[#1d1d1f] text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Apple-style Navigation Bar */}
      <Navbar
        currentStage={currentStage}
        onStageChange={setCurrentStage}
        candidateCount={candidates.length}
        onOpenChat={() => setIsChatOpen(!isChatOpen)}
        onOpenCompare={() => handleOpenCompare(rankedResults[0], rankedResults[1])}
        onOpenAlgo={() => setIsAlgoModalOpen(true)}
      />

      {/* Stage Views */}
      <main className="flex-1">
        
        {/* STAGE 1: LANDING OVERVIEW */}
        {currentStage === 'landing' && (
          <>
            <HeroSection
              onStartShortlisting={() => setCurrentStage('jd')}
              onSeeHowItWorks={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              candidateCount={candidates.length}
            />
            <HowItWorksSection onStart={() => setCurrentStage('jd')} />
          </>
        )}

        {/* STAGE 2: JOB DESCRIPTION UPLOAD & SPECIFICATION */}
        {currentStage === 'jd' && (
          <JDUploadStage
            jobDescription={jobDescription}
            onUpdateJD={setJobDescription}
            onProceed={() => setCurrentStage('resumes')}
            onOpenBiasScanner={() => setIsBiasModalOpen(true)}
          />
        )}

        {/* STAGE 3: RESUME UPLOAD */}
        {currentStage === 'resumes' && (
          <ResumeUploadStage
            jobDescription={jobDescription}
            candidates={candidates}
            onAddCandidate={handleAddCandidate}
            onRemoveCandidate={handleRemoveCandidate}
            onProceedToAnalyze={() => setCurrentStage('analyzing')}
            onBackToJD={() => setCurrentStage('jd')}
            onOpenCustomModal={() => setIsUploadModalOpen(true)}
          />
        )}

        {/* STAGE 4: CINEMATIC AI ANALYSIS EXPERIENCE */}
        {currentStage === 'analyzing' && (
          <AnalysisExperience
            candidateCount={candidates.length}
            onComplete={() => setCurrentStage('shortlist')}
          />
        )}

        {/* STAGE 5: SHORTLIST RESULTS & DUAL-ENGINE INTELLIGENCE */}
        {currentStage === 'shortlist' && (
          <ShortlistSection
            candidates={rankedResults}
            jobDescription={jobDescription}
            weights={weights}
            onWeightsChange={setWeights}
            onSelectCandidate={(c) => setSelectedCandidate(c)}
            onCompareCandidate={(c) => handleOpenCompare(c)}
            onOpenFormula={() => setIsAlgoModalOpen(true)}
            onOpenChat={() => setIsChatOpen(true)}
            onRestart={() => setCurrentStage('landing')}
          />
        )}

      </main>

      {/* Modals & Drawers */}

      {/* Candidate Detail Modal */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onCompare={(c) => {
          setSelectedCandidate(null);
          handleOpenCompare(c);
        }}
      />

      {/* Candidate Comparison Modal */}
      <CandidateComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        candidates={rankedResults}
        initialCandAId={compareCandAId}
        initialCandBId={compareCandBId}
        onAskChatAboutPair={handleAskChatAboutPair}
      />

      {/* AI Recruiter Assistant Drawer */}
      <RecruiterChatDrawer
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatInitialQuery(undefined);
        }}
        candidates={rankedResults}
        jd={jobDescription}
        initialQuery={chatInitialQuery}
      />

      {/* Algorithm Transparency Modal */}
      <AlgorithmInspectorModal
        isOpen={isAlgoModalOpen}
        onClose={() => setIsAlgoModalOpen(false)}
        keywordWeight={weights.keywordWeight}
        semanticWeight={weights.semanticWeight}
      />

      {/* JD Bias Scanner Modal */}
      <BiasScannerModal
        isOpen={isBiasModalOpen}
        onClose={() => setIsBiasModalOpen(false)}
        jd={jobDescription}
        onApplyInclusiveJD={handleApplyInclusiveJD}
      />

      {/* Custom Resume Upload Modal */}
      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddCandidate={handleAddCandidate}
      />

      {/* JD Viewer Modal */}
      <JDViewerModal
        isOpen={isJDModalOpen}
        onClose={() => setIsJDModalOpen(false)}
        jd={jobDescription}
        onOpenBiasScanner={() => {
          setIsJDModalOpen(false);
          setIsBiasModalOpen(true);
        }}
      />

    </div>
  );
}
