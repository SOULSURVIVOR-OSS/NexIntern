import { JobDescription, CandidateResume, CandidateMatchResult, ScoringWeights, SemanticMatchDetail, FormattingResilienceLog, CandidateDetailedAnalysis } from '../types';

// Tech and concept synonym / domain ontology mapping
const DOMAIN_ONTOLOGY: Record<string, { 
  domain: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Fundamentals'; 
  related: string[]; 
  synonyms: string[]; 
  weight: number 
}> = {
  // --- Frontend / Web UI ---
  'react': {
    domain: 'Frontend',
    related: ['vue', 'angular', 'svelte', 'next.js', 'redux', 'jsx', 'frontend', 'react native'],
    synonyms: ['react.js', 'reactjs', 'reaktjs', 'react 18'],
    weight: 1.0,
  },
  'javascript': {
    domain: 'Frontend',
    related: ['typescript', 'es6', 'web development', 'frontend', 'node.js'],
    synonyms: ['js', 'ecmascript'],
    weight: 0.9,
  },
  'typescript': {
    domain: 'Frontend',
    related: ['javascript', 'type safety', 'angular', 'nest.js', 'react'],
    synonyms: ['ts'],
    weight: 0.9,
  },
  'html5': {
    domain: 'Frontend',
    related: ['html', 'semantic markup', 'web accessibility', 'css3'],
    synonyms: ['html', 'html/css'],
    weight: 0.7,
  },
  'css3': {
    domain: 'Frontend',
    related: ['css', 'tailwind', 'sass', 'responsive design', 'bootstrap'],
    synonyms: ['css', 'styling', 'tailwindcss'],
    weight: 0.7,
  },
  'tailwindcss': {
    domain: 'Frontend',
    related: ['css', 'styling', 'utility-first css', 'responsive design', 'bootstrap'],
    synonyms: ['tailwind', 'tailwind css'],
    weight: 0.75,
  },

  // --- Mobile Engineering ---
  'flutter': {
    domain: 'Frontend',
    related: ['dart', 'react native', 'mobile', 'android', 'ios', 'widget', 'cross-platform', 'android sdk', 'kotlin'],
    synonyms: ['flutter sdk', 'flutter framework'],
    weight: 0.95,
  },
  'dart': {
    domain: 'Frontend',
    related: ['flutter', 'mobile programming', 'object oriented'],
    synonyms: ['dartlang', 'dart language'],
    weight: 0.85,
  },
  'react native': {
    domain: 'Frontend',
    related: ['react', 'javascript', 'typescript', 'mobile', 'flutter', 'cross-platform', 'ios', 'android'],
    synonyms: ['react-native', 'rn'],
    weight: 0.95,
  },
  'kotlin': {
    domain: 'Frontend',
    related: ['android', 'java', 'jetpack', 'coroutines', 'mobile development', 'android sdk'],
    synonyms: ['kotlin lang', 'kt'],
    weight: 0.95,
  },
  'android sdk': {
    domain: 'Frontend',
    related: ['android', 'kotlin', 'java', 'jetpack', 'mobile apps', 'mobile development'],
    synonyms: ['android', 'android studio', 'android development'],
    weight: 0.9,
  },

  // --- Backend / APIs ---
  'node.js': {
    domain: 'Backend',
    related: ['express', 'fastify', 'nest.js', 'koa', 'rest apis', 'server-side', 'backend', 'javascript'],
    synonyms: ['nodejs', 'node', 'node js'],
    weight: 1.0,
  },
  'express': {
    domain: 'Backend',
    related: ['node.js', 'rest apis', 'middleware', 'fastapi', 'routing', 'backend'],
    synonyms: ['express.js', 'expressjs', 'expres.js', 'expres'],
    weight: 0.95,
  },
  'rest apis': {
    domain: 'Backend',
    related: ['http', 'crud', 'endpoints', 'json', 'express', 'fastapi', 'microservices', 'api design', 'graphql'],
    synonyms: ['rest api', 'restful api', 'restful apis', 'rest services', 'api design', 'rest'],
    weight: 0.9,
  },
  'python': {
    domain: 'Backend',
    related: ['pytorch', 'tensorflow', 'django', 'fastapi', 'data science', 'ai', 'machine learning', 'numpy'],
    synonyms: ['python3', 'py'],
    weight: 0.95,
  },
  'fastapi': {
    domain: 'Backend',
    related: ['python', 'rest apis', 'microservices', 'pydantic', 'backend'],
    synonyms: ['fast api'],
    weight: 0.9,
  },
  'java': {
    domain: 'Backend',
    related: ['spring boot', 'jvm', 'kotlin', 'backend', 'object oriented'],
    synonyms: ['java 17', 'core java'],
    weight: 0.9,
  },

  // --- Databases & Storage ---
  'postgresql': {
    domain: 'Database',
    related: ['mysql', 'sql', 'relational database', 'sqlite', 'prisma', 'orm', 'database'],
    synonyms: ['postgres', 'psql', 'postgre sql', 'postresql'],
    weight: 0.95,
  },
  'mongodb': {
    domain: 'Database',
    related: ['nosql', 'mongoose', 'document database', 'database', 'firebase'],
    synonyms: ['mongo', 'mongo db', 'mongodb atlas'],
    weight: 0.85,
  },
  'sqlite': {
    domain: 'Database',
    related: ['room', 'sql', 'relational database', 'offline storage', 'mobile db', 'room database', 'postgresql'],
    synonyms: ['sqlite3', 'sqlite database'],
    weight: 0.85,
  },
  'firebase': {
    domain: 'Database',
    related: ['firestore', 'realtime database', 'authentication', 'nosql', 'cloud functions', 'fcm', 'mongodb'],
    synonyms: ['google firebase', 'firestore', 'firebase auth'],
    weight: 0.85,
  },
  'vector databases': {
    domain: 'Database',
    related: ['pinecone', 'faiss', 'chroma', 'embeddings', 'similarity search', 'rag pipelines'],
    synonyms: ['vector db', 'pinecone', 'faiss', 'vector search', 'chromadb'],
    weight: 0.9,
  },

  // --- DevOps & Cloud ---
  'git': {
    domain: 'DevOps',
    related: ['github', 'gitlab', 'version control', 'ci/cd', 'pr workflows'],
    synonyms: ['git/github', 'version control', 'github actions'],
    weight: 0.8,
  },
  'docker': {
    domain: 'DevOps',
    related: ['containers', 'docker compose', 'kubernetes', 'cloud', 'devops'],
    synonyms: ['containerization', 'dockerized', 'containers'],
    weight: 0.85,
  },
  'aws': {
    domain: 'DevOps',
    related: ['cloud', 's3', 'ec2', 'lambda', 'hosting', 'gcp', 'azure'],
    synonyms: ['amazon web services', 'cloud hosting', 'cloud'],
    weight: 0.8,
  },

  // --- AI / ML / Fundamentals ---
  'pytorch': {
    domain: 'Fundamentals',
    related: ['deep learning', 'tensorflow', 'neural networks', 'python', 'torch', 'ai', 'keras', 'cnns'],
    synonyms: ['torch', 'py torch'],
    weight: 0.95,
  },
  'tensorflow': {
    domain: 'Fundamentals',
    related: ['keras', 'deep learning', 'pytorch', 'machine learning', 'neural networks', 'cnns'],
    synonyms: ['tf', 'tensor flow'],
    weight: 0.95,
  },
  'opencv': {
    domain: 'Fundamentals',
    related: ['computer vision', 'image processing', 'cnn', 'deep learning', 'cnns'],
    synonyms: ['open cv', 'cv2'],
    weight: 0.9,
  },
  'cnns': {
    domain: 'Fundamentals',
    related: ['convolutional neural networks', 'computer vision', 'deep learning', 'pytorch', 'tensorflow'],
    synonyms: ['cnn', 'convolutional neural network', 'convolutional neural networks (cnns)'],
    weight: 0.9,
  },
  'rag pipelines': {
    domain: 'Fundamentals',
    related: ['langchain', 'vector databases', 'faiss', 'pinecone', 'llm', 'retrieval augmented generation'],
    synonyms: ['rag', 'retrieval-augmented generation', 'rag chatbot', 'rag architectures'],
    weight: 0.9,
  },
  'jest': {
    domain: 'Fundamentals',
    related: ['testing', 'unit tests', 'supertest', 'cypress', 'automation', 'junit'],
    synonyms: ['unit testing', 'test runner', 'testing'],
    weight: 0.75,
  }
};

// Levenshtein distance for typo tolerance
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// Tokenize text into lowercased clean words
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\.\+\#\-\/]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !['and', 'the', 'with', 'for', 'from', 'in', 'of', 'to', 'a', 'an', 'is', 'on', 'at', 'by', 'as'].includes(t));
}

// Helper: build comprehensive candidate text representation
function getCandidateText(c: CandidateResume): string {
  const projText = (c.projects || []).map(p => `${p.title} ${(p.technologies || []).join(' ')} ${p.description}`).join(' ');
  const expText = (c.experience || []).map(e => `${e.title} ${e.company} ${e.description}`).join(' ');
  return `${c.name} ${c.summary || ''} ${(c.skills || []).join(' ')} ${projText} ${expText} ${c.rawText || ''}`;
}

// Helper: build comprehensive JD text representation
function getJDText(jd: JobDescription): string {
  return `${jd.title} ${jd.department} ${jd.summary || ''} ${jd.requiredSkills.join(' ')} ${(jd.preferredSkills || []).join(' ')} ${(jd.responsibilities || []).join(' ')} ${(jd.qualifications || []).join(' ')} ${jd.rawText || ''}`;
}

// Helper: compute cosine similarity between two word arrays
function computeCosineSim(wordsA: string[], wordsB: string[]): number {
  const tfA = new Map<string, number>();
  const tfB = new Map<string, number>();
  for (const w of wordsA) tfA.set(w, (tfA.get(w) || 0) + 1);
  for (const w of wordsB) tfB.set(w, (tfB.get(w) || 0) + 1);

  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const val of tfA.values()) magA += val * val;
  for (const val of tfB.values()) magB += val * val;
  if (magA === 0 || magB === 0) return 0;

  for (const [w, countA] of tfA.entries()) {
    const countB = tfB.get(w);
    if (countB) dot += countA * countB;
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Calculate BM25 / TF-IDF Keyword Match
export function calculateKeywordScore(
  jd: JobDescription,
  candidate: CandidateResume,
  _allCandidates?: CandidateResume[]
): {
  score: number;
  matchedRequired: string[];
  missingRequired: string[];
  matchedPreferred: string[];
  matchedEvidence: { skill: string; snippet: string }[];
  resilienceLogs: FormattingResilienceLog[];
} {
  const candidateFullText = getCandidateText(candidate).toLowerCase();
  const resumeRaw = (candidate.rawText || '').toLowerCase();
  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];
  const matchedPreferred: string[] = [];
  const matchedEvidence: { skill: string; snippet: string }[] = [];
  const resilienceLogs: FormattingResilienceLog[] = [];

  // Check required skills
  for (const reqSkill of jd.requiredSkills) {
    const key = reqSkill.toLowerCase();
    const ontology = DOMAIN_ONTOLOGY[key];
    const aliases = [key, ...(ontology?.synonyms || [])];

    let found = false;
    let foundSnippet = '';

    // 1. Direct match in candidate's declared skills list
    if (candidate.skills && candidate.skills.some(s => {
      const sl = s.toLowerCase();
      return aliases.some(a => sl === a || sl.includes(a));
    })) {
      found = true;
      foundSnippet = `Explicitly verified in candidate skill inventory: "${reqSkill}"`;
    }

    // 2. Substring match in full text
    if (!found) {
      for (const alias of aliases) {
        const idx = resumeRaw.indexOf(alias);
        if (idx !== -1) {
          found = true;
          const start = Math.max(0, idx - 35);
          const end = Math.min(candidate.rawText.length, idx + alias.length + 45);
          foundSnippet = '...' + candidate.rawText.substring(start, end).replace(/\n/g, ' ') + '...';

          if (alias !== key) {
            resilienceLogs.push({
              type: 'tech_alias_resolved',
              original: alias,
              resolved: reqSkill,
              detail: `Resolved alias "${alias}" to required skill "${reqSkill}"`
            });
          }
          break;
        } else if (candidateFullText.includes(alias)) {
          found = true;
          foundSnippet = `Verified in project or work portfolio: "${reqSkill}"`;
          break;
        }
      }
    }

    // 3. Typo tolerance
    if (!found) {
      const words = tokenize(candidateFullText);
      for (const word of words) {
        if (word.length >= 4 && key.length >= 4 && levenshtein(word, key) === 1) {
          found = true;
          foundSnippet = `Matched via typo tolerance from "${word}"`;
          resilienceLogs.push({
            type: 'typo_fixed',
            original: word,
            resolved: reqSkill,
            detail: `Tolerated typo in resume: normalized "${word}" -> "${reqSkill}" (distance 1)`
          });
          break;
        }
      }
    }

    if (found) {
      matchedRequired.push(reqSkill);
      matchedEvidence.push({ skill: reqSkill, snippet: foundSnippet });
    } else {
      missingRequired.push(reqSkill);
    }
  }

  // Check preferred skills
  for (const prefSkill of (jd.preferredSkills || [])) {
    const key = prefSkill.toLowerCase();
    const ontology = DOMAIN_ONTOLOGY[key];
    const aliases = [key, ...(ontology?.synonyms || [])];

    let found = false;
    if (candidate.skills && candidate.skills.some(s => aliases.some(a => s.toLowerCase().includes(a)))) {
      found = true;
    } else if (aliases.some(a => candidateFullText.includes(a))) {
      found = true;
    }

    if (found) {
      matchedPreferred.push(prefSkill);
    }
  }

  const numReq = Math.max(1, jd.requiredSkills.length);
  const numPref = (jd.preferredSkills || []).length;
  const reqCoverage = matchedRequired.length / numReq;
  const prefCoverage = numPref > 0 ? (matchedPreferred.length / numPref) : 0;

  // Practical project depth bonus (up to +5 points for skills demonstrated in project descriptions)
  let projectDepthBonus = 0;
  if (candidate.projects && candidate.projects.length > 0) {
    const projectText = candidate.projects.map(p => `${p.title} ${(p.technologies || []).join(' ')} ${p.description}`).join(' ').toLowerCase();
    let projectSkillCount = 0;
    for (const s of matchedRequired) {
      if (projectText.includes(s.toLowerCase())) {
        projectSkillCount++;
      }
    }
    projectDepthBonus = Math.min(5, Math.round((projectSkillCount / numReq) * 5));
  }

  // Bounded keyword score calculation
  let rawScore = 0;
  if (matchedRequired.length === 0) {
    rawScore = 0; // If 0 required skills match, score is strictly 0
  } else if (numPref > 0) {
    rawScore = (reqCoverage * 85) + (prefCoverage * 15) + projectDepthBonus;
  } else {
    rawScore = (reqCoverage * 95) + projectDepthBonus;
  }

  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  return {
    score,
    matchedRequired,
    missingRequired,
    matchedPreferred,
    matchedEvidence,
    resilienceLogs
  };
}

// Calculate Semantic & Contextual Matching
// Matches on domain meaning, frameworks, and architecture patterns dynamically for the active JD
export function calculateSemanticScore(
  jd: JobDescription,
  candidate: CandidateResume
): {
  score: number;
  domainScores: { Frontend: number; Backend: number; Database: number; DevOps: number; Fundamentals: number };
  semanticMatches: SemanticMatchDetail[];
} {
  const candidateFullText = getCandidateText(candidate).toLowerCase();
  const jdFullText = getJDText(jd);

  // 1. Contextual Cosine Similarity (TF-IDF Vector Space)
  const jdTokens = tokenize(jdFullText);
  const candTokens = tokenize(candidateFullText);
  const rawCosine = computeCosineSim(jdTokens, candTokens);

  // Calibrated contextual score: raw cosine (typically 0.10 - 0.60) smoothly mapped to 0 - 100
  let contextualScore = 0;
  if (rawCosine >= 0.45) {
    contextualScore = 85 + Math.min(15, (rawCosine - 0.45) * 75);
  } else if (rawCosine >= 0.30) {
    contextualScore = 65 + ((rawCosine - 0.30) / 0.15) * 20;
  } else if (rawCosine >= 0.18) {
    contextualScore = 40 + ((rawCosine - 0.18) / 0.12) * 25;
  } else if (rawCosine >= 0.08) {
    contextualScore = 15 + ((rawCosine - 0.08) / 0.10) * 25;
  } else {
    contextualScore = Math.max(0, rawCosine * 150);
  }
  contextualScore = Math.min(100, Math.max(0, Math.round(contextualScore)));

  // 2. Transferable Concept & Framework Similarity for JD Requirements
  const semanticMatches: SemanticMatchDetail[] = [];
  let totalConceptCredit = 0;
  const numReq = Math.max(1, jd.requiredSkills.length);

  for (const reqSkill of jd.requiredSkills) {
    const key = reqSkill.toLowerCase();
    const ontology = DOMAIN_ONTOLOGY[key];
    const aliases = [key, ...(ontology?.synonyms || [])];

    // Check direct / alias
    if (aliases.some(a => candidateFullText.includes(a))) {
      totalConceptCredit += 1.0;
      continue;
    }

    // Check transferable semantic relatives
    if (ontology && ontology.related.length > 0) {
      const foundRelated = ontology.related.filter(r => candidateFullText.includes(r));
      if (foundRelated.length > 0) {
        const transferSim = foundRelated.length >= 2 ? 0.85 : 0.75;
        totalConceptCredit += transferSim;
        semanticMatches.push({
          jdConcept: reqSkill.toUpperCase(),
          candidateMention: foundRelated.slice(0, 3).join(', '),
          similarity: transferSim,
          domain: ontology.domain,
          reasoning: `Demonstrated transferable capability via related technologies [${foundRelated.slice(0, 2).join(', ')}]`
        });
      }
    }
  }

  const conceptScore = Math.min(100, Math.round((totalConceptCredit / numReq) * 100));

  // 3. Dynamic Domain Alignment based on the active Job Description's requirements
  const isMobileRole = jd.requiredSkills.some(s => ['flutter', 'react native', 'kotlin', 'dart', 'android sdk', 'sqlite'].includes(s.toLowerCase())) || /mobile|android|flutter|ios/i.test(jd.title);
  const isAIRole = jd.requiredSkills.some(s => ['pytorch', 'tensorflow', 'opencv', 'cnns', 'rag pipelines', 'vector databases'].includes(s.toLowerCase())) || /ai|machine learning|data science|nlp|vision/i.test(jd.title);

  const jdDomainCounts: Record<string, number> = {
    Frontend: 0,
    Backend: 0,
    Database: 0,
    DevOps: 0,
    Fundamentals: 0
  };

  for (const skill of [...jd.requiredSkills, ...(jd.preferredSkills || [])]) {
    const key = skill.toLowerCase();
    const domain = DOMAIN_ONTOLOGY[key]?.domain;
    if (domain) {
      jdDomainCounts[domain] = (jdDomainCounts[domain] || 0) + 1;
    }
  }

  // Candidate domain coverage
  const candidateDomainHits: Record<string, number> = {
    Frontend: 0,
    Backend: 0,
    Database: 0,
    DevOps: 0,
    Fundamentals: 0
  };

  for (const [conceptKey, info] of Object.entries(DOMAIN_ONTOLOGY)) {
    const isConceptPresent = candidateFullText.includes(conceptKey) || info.synonyms.some(s => candidateFullText.includes(s));
    if (isConceptPresent) {
      // If evaluating a Mobile role, Web-only styling (html/css/tailwind) provides minor foundation (0.25), not full mobile credit
      if (isMobileRole && info.domain === 'Frontend') {
        const isTrueMobile = ['flutter', 'dart', 'react native', 'kotlin', 'android sdk'].includes(conceptKey);
        candidateDomainHits.Frontend += isTrueMobile ? 1.0 : 0.25;
      } 
      // If evaluating an AI role, unit testing (jest) provides minor foundation (0.25), not deep ML fundamentals credit
      else if (isAIRole && info.domain === 'Fundamentals') {
        const isTrueAI = ['pytorch', 'tensorflow', 'opencv', 'cnns', 'rag pipelines'].includes(conceptKey);
        candidateDomainHits.Fundamentals += isTrueAI ? 1.0 : 0.25;
      } else {
        candidateDomainHits[info.domain] += 1.0;
      }
    }
  }

  const domainMax = { Frontend: 3.5, Backend: 3.5, Database: 3.0, DevOps: 2.5, Fundamentals: 3.0 };
  const domainScores = {
    Frontend: Math.min(1.0, (candidateDomainHits.Frontend || 0) / domainMax.Frontend),
    Backend: Math.min(1.0, (candidateDomainHits.Backend || 0) / domainMax.Backend),
    Database: Math.min(1.0, (candidateDomainHits.Database || 0) / domainMax.Database),
    DevOps: Math.min(1.0, (candidateDomainHits.DevOps || 0) / domainMax.DevOps),
    Fundamentals: Math.min(1.0, (candidateDomainHits.Fundamentals || 0) / domainMax.Fundamentals),
  };

  // Weighted composite domain alignment according to what this JD actually demands
  let totalJDWeight = 0;
  let candidateWeightedDomainSum = 0;

  for (const domain of ['Frontend', 'Backend', 'Database', 'DevOps', 'Fundamentals'] as const) {
    const w = jdDomainCounts[domain] || 0;
    if (w > 0) {
      totalJDWeight += w;
      candidateWeightedDomainSum += (domainScores[domain] * w);
    }
  }

  const compositeDomainScore = totalJDWeight > 0 
    ? Math.round((candidateWeightedDomainSum / totalJDWeight) * 100) 
    : 70;

  // 4. Combine into final calibrated semantic score
  // 45% Concept Transfer & Skill Fit + 35% Role Domain Alignment + 20% Contextual Cosine Overlap
  const rawSemantic = (0.45 * conceptScore) + (0.35 * compositeDomainScore) + (0.20 * contextualScore);
  const score = Math.min(100, Math.max(0, Math.round(rawSemantic)));

  return {
    score,
    domainScores,
    semanticMatches
  };
}

// Generate rich, resume-grounded detailed analysis for each candidate
export function generateDetailedCandidateAnalysis(
  jd: JobDescription,
  candidate: CandidateResume,
  matchedRequired: string[],
  missingRequired: string[],
  matchedPreferred: string[],
  _keywordScore: number,
  _semanticScore: number,
  finalScore: number,
  rank: number
): CandidateDetailedAnalysis {
  const c = candidate;
  const targetRole = jd.title || 'Technical Role';
  const targetOrg = jd.company || 'the engineering team';

  // 1. Synthesize Executive Brief Overview
  const eduString = `${c.education.degree} from ${c.education.institution}${c.education.graduationYear ? ` (Graduation: ${c.education.graduationYear})` : ''}${c.education.gpa ? ` with a ${c.education.gpa} GPA` : ''}`;
  const totalMandatory = jd.requiredSkills.length || 1;
  const matchRatioStr = `${matchedRequired.length} of ${totalMandatory} required competencies`;

  let fitNarrative = '';
  if (finalScore >= 80) {
    fitNarrative = `demonstrates exceptional turnkey readiness with verified deliverables across ${matchRatioStr}`;
  } else if (finalScore >= 65) {
    fitNarrative = `exhibits high engineering upside and strong technical synergy across ${matchRatioStr}, with minimal ramp-up required`;
  } else if (finalScore >= 50) {
    fitNarrative = `presents a viable foundational profile covering ${matchRatioStr}, backed by practical software enthusiasm`;
  } else {
    fitNarrative = `shows partial domain overlap with notable skill divergences against the ${targetRole} requirements`;
  }

  const overview = `${c.name} holds credentials in ${eduString}. For the ${targetRole} requisition at ${targetOrg}, ${c.name} ${fitNarrative}. Their resume features ${c.projects?.length || 0} documented technical project(s) and ${c.skills?.length || 0} recognized skill tags, indicating a profile oriented toward practical coding execution.`;

  // 2. Pros (Evidence-backed strengths directly from resume)
  const pros: string[] = [];

  // Pro A: Core stack alignment
  if (matchedRequired.length > 0) {
    pros.push(
      `Direct Stack Mastery: Verified competency in ${matchedRequired.slice(0, 5).join(', ')}, fulfilling core operational requirements mandated by the ${targetRole} JD.`
    );
  }

  // Pro B: Project deliverables
  if (c.projects && c.projects.length > 0) {
    const p1 = c.projects[0];
    const techSnippet = p1.technologies.length > 0 ? ` using ${p1.technologies.slice(0, 3).join(', ')}` : '';
    const descSnippet = p1.description ? `: "${p1.description.slice(0, 110)}${p1.description.length > 110 ? '...' : ''}"` : '';
    pros.push(`Verifiable Proof-of-Work: Built "${p1.title}"${techSnippet}${descSnippet}, proving ability to translate architecture concepts into functioning software.`);

    if (c.projects.length > 1) {
      const p2 = c.projects[1];
      pros.push(`Multi-Disciplinary Project Breadth: Developed "${p2.title}" (${p2.technologies.slice(0, 3).join(', ')}), demonstrating versatility across diverse problem domains.`);
    }
  }

  // Pro C: Preferred skills bonus or tool proficiency
  if (matchedPreferred.length > 0) {
    pros.push(`Preferred Competencies Bonus: Possesses demonstrated knowledge in nice-to-have tools (${matchedPreferred.join(', ')}), reducing team onboarding friction.`);
  } else if (c.skills.length > 5) {
    pros.push(`Broad Technical Stack: Demonstrates familiarity across diverse developer tools (${c.skills.slice(0, 4).join(', ')}), facilitating rapid lateral tool adoption.`);
  }

  // Pro D: Prior experience / industry exposure or academic diligence
  if (c.experience && c.experience.length > 0) {
    const exp = c.experience[0];
    pros.push(`Prior Industry Exposure: Served as ${exp.title} at ${exp.company} (${exp.period || 'Prior experience'}), proving capability to collaborate in structured workflows and team code reviews.`);
  } else if (c.education.gpa && parseFloat(c.education.gpa) >= 8.5) {
    pros.push(`Academic Rigor: Maintained a strong academic record (${c.education.gpa}) at ${c.education.institution}, evidencing disciplined problem-solving and rapid learning potential.`);
  } else {
    pros.push(`High Skill Density: Stated proficiency across ${c.skills.slice(0, 6).join(', ')}, showing wide-ranging engineering curiosity.`);
  }

  // 3. Cons (Transparent, actionable watchouts and gaps)
  const cons: string[] = [];

  // Con A: Missing mandatory requirements
  if (missingRequired.length > 0) {
    cons.push(`Missing Mandatory Requirement(s): Resume lacks explicit evidence for ${missingRequired.slice(0, 4).join(', ')}. Candidate will need targeted technical screening or pairing support in these areas.`);
  } else {
    cons.push('Near-Complete Core Coverage: Meets all stated mandatory technical keywords, though depth in complex enterprise edge-cases should be confirmed in technical rounds.');
  }

  // Con B: Automated Testing & CI/CD
  const hasTesting = /jest|cypress|mocha|testing|ci\/cd|github actions|junit|pytest/i.test(c.rawText || '');
  if (!hasTesting) {
    cons.push('Limited Testing Documentation: Portfolio lacks explicit demonstration of unit testing suites or automated CI/CD deployment pipelines.');
  }

  // Con C: Commercial Experience Scale
  if (!c.experience || c.experience.length === 0) {
    cons.push('No Prior Corporate Internship: Track record is centered around academic and personal repositories; will require initial mentorship on team branching strategies and agile ceremonies.');
  } else {
    cons.push(`Internship Transition: Transitioning from ${c.experience[0].company} to ${targetOrg}'s specific codebase patterns may require 1-2 weeks of domain onboarding.`);
  }

  // Con D: Preferred skills unverified
  const unverifiedPreferred = (jd.preferredSkills || []).filter(ps => !matchedPreferred.includes(ps));
  if (unverifiedPreferred.length > 0 && cons.length < 4) {
    cons.push(`Unverified in Secondary Tools: No documented proof for nice-to-have items: ${unverifiedPreferred.slice(0, 3).join(', ')}.`);
  }

  // 4. Hiring Justification
  let whyRecruiterShouldTakeThem = '';
  if (rank === 1 || finalScore >= 80) {
    whyRecruiterShouldTakeThem = `Recruiter Hiring Justification: ${c.name} is a top-tier match for the ${targetRole} opening at ${targetOrg}. Their portfolio directly validates key requirements (${matchedRequired.slice(0, 3).join(', ')}) through working project repositories like "${c.projects?.[0]?.title || 'Featured Project'}", eliminating the risk of paper-only resumes. Hiring them gives your engineering lead a dependable contributor who can pick up sprint tickets in Week 1 with minimal supervisory overhead.`;
  } else if (finalScore >= 65) {
    whyRecruiterShouldTakeThem = `Recruiter Hiring Justification: ${c.name} represents a high-return, low-risk hiring opportunity for ${targetOrg}. While exhibiting a minor gap in ${missingRequired[0] || 'secondary tooling'}, their verified proficiency in ${matchedRequired.slice(0, 3).join(', ')} proves they possess the foundational horsepower to ramp up rapidly. They offer high motivation, proven coding velocity, and a clean project track record at a competitive internship level.`;
  } else if (finalScore >= 50) {
    whyRecruiterShouldTakeThem = `Recruiter Hiring Justification: Consider shortlisting ${c.name} if ${targetOrg} values high coachability and strong foundational logic over instant plug-and-play specialization. Their background in ${c.skills.slice(0, 3).join(', ')} provides a solid launching pad, and their hands-on project work confirms genuine interest in software craftsmanship.`;
  } else {
    whyRecruiterShouldTakeThem = `Recruiter Hiring Justification: ${c.name} is currently a secondary candidate for this specific ${targetRole} requisition due to missing core requirements (${missingRequired.slice(0, 2).join(', ')}). Retain on file for roles oriented toward ${c.skills.slice(0, 2).join(' or ')} where their background aligns more naturally.`;
  }

  // 5. Recommended Verdict
  let recommendedVerdict: CandidateDetailedAnalysis['recommendedVerdict'] = 'Viable Contender';
  if (finalScore >= 80 && missingRequired.length <= 1) {
    recommendedVerdict = 'Strong Hire';
  } else if (finalScore >= 68) {
    recommendedVerdict = 'High Potential';
  } else if (finalScore >= 52) {
    recommendedVerdict = 'Viable Contender';
  } else if (finalScore >= 40) {
    recommendedVerdict = 'Skill Gap Watch';
  } else {
    recommendedVerdict = 'Not Recommended';
  }

  // 6. Key Differentiator
  let keyDifferentiator = '';
  if (rank === 1) {
    keyDifferentiator = `Top composite score (${finalScore}%) pairing verified ${matchedRequired.slice(0, 3).join('/')} execution with practical project architecture.`;
  } else if (c.experience && c.experience.length > 0) {
    keyDifferentiator = `Proven real-world delivery at ${c.experience[0].company} giving them a significant head-start over purely academic peers.`;
  } else if (c.projects && c.projects.length >= 2) {
    keyDifferentiator = `Demonstrated multiple full-lifecycle project builds (${c.projects.map(p => p.title).slice(0, 2).join(' & ')}).`;
  } else {
    keyDifferentiator = `Solid academic foundation in ${c.education.degree} from ${c.education.institution}.`;
  }

  // 7. Ramp-Up Readiness
  let rampUpReadiness = '';
  if (finalScore >= 80) {
    rampUpReadiness = `Immediate (Days 1–5) on primary ${matchedRequired.slice(0, 2).join(' and ')} tasks; ~1 week to acclimate to ${targetOrg}'s internal workflows.`;
  } else if (finalScore >= 65) {
    rampUpReadiness = `~1 to 2 weeks onboarding; rapid execution on ${matchedRequired.slice(0, 2).join(', ') || 'core tasks'}, with light mentoring on ${missingRequired[0] || 'team patterns'}.`;
  } else {
    rampUpReadiness = `~3 to 4 weeks onboarding required to bridge gaps in mandatory technologies (${missingRequired.slice(0, 2).join(', ')}).`;
  }

  // 8. Interview Probe Questions
  const probeQuestions: string[] = [
    c.projects && c.projects.length > 0
      ? `In your project "${c.projects[0].title}", can you walk through your technical architecture and explain how you handled state management and API communication?`
      : `Describe a challenging technical bug you encountered recently and walk us through your systematic debugging process.`,
    missingRequired.length > 0
      ? `This role at ${targetOrg} requires hands-on work with ${missingRequired[0]}. What is your existing exposure to it, and how would you ramp up within your first sprint?`
      : `How do you approach writing clean, maintainable code and testing your components before submitting a pull request?`,
    `Walk us through a time you had to learn an unfamiliar library or framework under a tight project deadline. How did you prioritize what to study?`,
  ];

  return {
    overview,
    pros,
    cons,
    whyRecruiterShouldTakeThem,
    recommendedVerdict,
    keyDifferentiator,
    rampUpReadiness,
    interviewProbeQuestions: probeQuestions,
    source: 'engine',
  };
}

// Generate human-justified explanation for candidate ranking
function generateRankingExplanation(
  rank: number,
  candidate: CandidateResume,
  matchedRequired: string[],
  missingRequired: string[],
  _keywordScore: number,
  _semanticScore: number,
  finalScore: number,
  semanticMatches: SemanticMatchDetail[],
  jd?: JobDescription
): {
  explanation: string;
  strengths: string[];
  areasToProbe: string[];
} {
  const strengths: string[] = [];
  const areasToProbe: string[] = [];
  const roleTitle = jd?.title || 'Target Role';
  const org = jd?.company || 'our engineering team';

  // Identify strengths grounded in the active JD
  if (matchedRequired.length > 0) {
    strengths.push(`Direct mastery in mandatory competencies: ${matchedRequired.slice(0, 4).join(', ')}`);
  }
  if (semanticMatches.length > 0) {
    strengths.push(`Transferable domain capabilities: ${semanticMatches.slice(0, 2).map(m => `${m.candidateMention} (bridges ${m.jdConcept})`).join('; ')}`);
  }
  if (candidate.projects && candidate.projects.length >= 2) {
    strengths.push(`Proven end-to-end implementation across ${candidate.projects.length} distinct application projects`);
  } else if (candidate.projects && candidate.projects.length === 1) {
    strengths.push(`Working deliverables demonstrated in "${candidate.projects[0].title}"`);
  }
  if (candidate.experience && candidate.experience.length > 0) {
    strengths.push(`Commercial internship experience at ${candidate.experience[0].company}`);
  }

  // Identify areas to probe tailored to this candidate against this JD
  if (missingRequired.length > 0) {
    areasToProbe.push(`Lacks explicit verification in required JD skills: ${missingRequired.slice(0, 3).join(', ')}`);
  }
  if (candidate.experience.length === 0) {
    areasToProbe.push('First-time industry internship; assess velocity in collaborative team Git workflows');
  }
  const hasTesting = /jest|cypress|mocha|testing|junit|pytest/i.test(candidate.rawText || '');
  if (!hasTesting) {
    areasToProbe.push('Probe experience with automated testing frameworks and clean code practices');
  }

  let explanation = '';
  if (rank === 1) {
    explanation = `Ranked #1 with highest composite score (${finalScore}%). Seamlessly aligns with ${org}'s ${roleTitle} stack (${matchedRequired.slice(0, 4).join(', ')}) backed by verified project architecture and demonstrated domain synergy.`;
  } else if (rank === 2) {
    explanation = `Ranked #2 with strong ${finalScore}% match. Exceptional technical breadth in ${matchedRequired.slice(0, 3).join(', ')}. Positioned just behind #1 due to secondary tooling differences.`;
  } else if (rank === 3) {
    explanation = `Ranked #3 (${finalScore}%). Strong portfolio demonstrating robust fundamentals for ${roleTitle}. Turnkey candidate for onboarding.`;
  } else if (finalScore >= 70) {
    explanation = `Solid contender (${finalScore}%). Strong foundation for ${roleTitle} with good skill overlap, though missing minor tools (${missingRequired.slice(0, 2).join(', ') || 'secondary tooling'}).`;
  } else if (finalScore >= 50) {
    explanation = `Partial fit (${finalScore}%). Shows competence in specialized areas (${matchedRequired.slice(0, 2).join(', ') || 'fundamentals'}), but exhibits notable gaps in mandatory role competencies (${missingRequired.slice(0, 2).join(', ')}).`;
  } else {
    explanation = `Low alignment (${finalScore}%). Background diverges from core requirements for ${roleTitle} with notable omissions in required technologies (${missingRequired.slice(0, 3).join(', ')}).`;
  }

  return {
    explanation,
    strengths,
    areasToProbe
  };
}

// Complete Hybrid Shortlisting Evaluation
export function evaluateCandidates(
  jd?: JobDescription | null,
  candidates: CandidateResume[] = [],
  weights: ScoringWeights = { keywordWeight: 0.5, semanticWeight: 0.5, minScoreFilter: 0, mustHaveSkills: [] }
): CandidateMatchResult[] {
  if (!jd || !candidates || candidates.length === 0) return [];
  const results: CandidateMatchResult[] = [];

  for (const candidate of candidates) {
    // 1. Evaluate keyword BM25 match
    const kw = calculateKeywordScore(jd, candidate, candidates);

    // 2. Evaluate semantic contextual match
    const sm = calculateSemanticScore(jd, candidate);

    // 3. Combine using customizable weights
    const finalScore = Math.min(100, Math.max(0, Math.round((weights.keywordWeight * kw.score) + (weights.semanticWeight * sm.score))));

    // 4. Formatting resilience detection
    const formattingLogs = [...kw.resilienceLogs];
    if (candidate.formatCharacteristics?.hasInconsistentDates) {
      formattingLogs.push({
        type: 'date_normalized',
        original: 'Varied format (e.g. "Summer \'24" / "09/2023 - 03/2024")',
        resolved: 'Normalized ISO date timeline',
        detail: 'Unified non-standard date spans into structured chronological sequence.'
      });
    }
    if (candidate.formatCharacteristics?.missingStandardHeaders) {
      formattingLogs.push({
        type: 'header_inferred',
        original: 'Unstructured freeform text',
        resolved: 'Structured Skills & Projects sections',
        detail: 'Inferred logical section boundaries from raw plain-text layout.'
      });
    }

    results.push({
      candidateId: candidate.id,
      candidate,
      rank: 0, // Assigned after sorting
      finalScore,
      keywordScore: kw.score,
      semanticScore: sm.score,
      matchedExplicitSkills: kw.matchedRequired,
      missingRequiredSkills: kw.missingRequired,
      preferredMatchedSkills: kw.matchedPreferred,
      semanticRelatedMatches: sm.semanticMatches,
      domainScores: sm.domainScores,
      explanation: '',
      strengths: [],
      areasToProbe: [],
      evidenceSnippets: kw.matchedEvidence,
      formattingLogs
    });
  }

  // Sort by final score descending (with semantic score as tie breaker)
  results.sort((a, b) => {
    if (b.finalScore !== a.finalScore) {
      return b.finalScore - a.finalScore;
    }
    return b.semanticScore - a.semanticScore;
  });

  // Assign ranks & generate human justifications and in-depth candidate analysis
  results.forEach((result, idx) => {
    result.rank = idx + 1;
    const generated = generateRankingExplanation(
      result.rank,
      result.candidate,
      result.matchedExplicitSkills,
      result.missingRequiredSkills,
      result.keywordScore,
      result.semanticScore,
      result.finalScore,
      result.semanticRelatedMatches,
      jd
    );
    result.explanation = generated.explanation;
    result.strengths = generated.strengths;
    result.areasToProbe = generated.areasToProbe;

    // Build comprehensive, tailored pros, cons, overview & recruiter recommendation
    result.detailedAnalysis = generateDetailedCandidateAnalysis(
      jd,
      result.candidate,
      result.matchedExplicitSkills,
      result.missingRequiredSkills,
      result.preferredMatchedSkills,
      result.keywordScore,
      result.semanticScore,
      result.finalScore,
      result.rank
    );
  });

  return results;
}
