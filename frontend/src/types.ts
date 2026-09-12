export interface JobDescription {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  department: string;
  summary: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  qualifications: string[];
  rawText: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface ProjectItem {
  title: string;
  technologies: string[];
  description: string;
  link?: string;
}

export interface CandidateResume {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  education: {
    degree: string;
    institution: string;
    graduationYear: string;
    gpa?: string;
  };
  summary: string;
  skills: string[];
  experience: WorkExperience[];
  projects: ProjectItem[];
  rawText: string;
  formatCharacteristics: {
    hasInconsistentDates?: boolean;
    hasTypoVariations?: string[];
    missingStandardHeaders?: boolean;
    formatType: 'clean-structured' | 'dense-academic' | 'plain-text' | 'creative-layout';
  };
}

export interface SemanticMatchDetail {
  jdConcept: string;
  candidateMention: string;
  similarity: number;
  domain: string;
  reasoning: string;
}

export interface FormattingResilienceLog {
  type: 'typo_fixed' | 'date_normalized' | 'header_inferred' | 'tech_alias_resolved';
  original: string;
  resolved: string;
  detail: string;
}

export interface CandidateMatchResult {
  candidateId: string;
  candidate: CandidateResume;
  rank: number;
  finalScore: number;       // 0 - 100
  keywordScore: number;     // 0 - 100
  semanticScore: number;    // 0 - 100
  
  // Requirement 3: Top 3 explanation data
  matchedExplicitSkills: string[];
  missingRequiredSkills: string[];
  preferredMatchedSkills: string[];
  semanticRelatedMatches: SemanticMatchDetail[];
  
  // Domain breakdown
  domainScores: {
    Frontend: number;
    Backend: number;
    Database: number;
    DevOps: number;
    Fundamentals: number;
  };
  
  // Explanation & Evidence
  explanation: string;
  strengths: string[];
  areasToProbe: string[];
  evidenceSnippets: { skill: string; snippet: string }[];
  
  // Bonus: Graceful parsing logs
  formattingLogs: FormattingResilienceLog[];
}

export interface ScoringWeights {
  keywordWeight: number;    // e.g. 0.4
  semanticWeight: number;   // e.g. 0.6
  minScoreFilter: number;
  mustHaveSkills: string[];
}

export interface BiasFlag {
  category: 'education' | 'experience' | 'language' | 'tools';
  severity: 'high' | 'medium' | 'low';
  excerpt: string;
  reason: string;
  suggestion: string;
}

export interface BiasAnalysisResult {
  biasScore: number; // 0 (best) - 100 (worst)
  summary: string;
  flags: BiasFlag[];
  improvedJD?: string;
}

export interface RecruiterChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  comparedCandidateIds?: [string, string];
}
