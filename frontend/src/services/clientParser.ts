import { JobDescription, CandidateResume } from '../types';

export function extractTextFromPdfBase64(base64Data: string): string {
  try {
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    // In browser environment, use atob
    const rawString = typeof window !== 'undefined' ? window.atob(cleanBase64) : Buffer.from(cleanBase64, 'base64').toString('binary');

    // 1. Look for text in standard PDF text object operators: (Some text) Tj or [(Some) (text)] TJ
    const tjMatches = rawString.match(/\(([^()]{2,120})\)\s*T[jJ]/g);
    if (tjMatches && tjMatches.length > 5) {
      const extracted = tjMatches.map(m => {
        const inner = m.match(/\(([^()]+)\)/);
        return inner ? inner[1] : '';
      }).filter(Boolean).join(' ');
      if (extracted.length > 60) return extracted;
    }

    // 2. Extract printable ASCII runs
    const asciiRuns = rawString.match(/[\x20-\x7E\t\n\r]{4,}/g);
    if (asciiRuns && asciiRuns.length > 0) {
      const filtered = asciiRuns.filter(chunk => 
        !chunk.startsWith('/Length') && 
        !chunk.startsWith('/Filter') && 
        !chunk.startsWith('/Font') &&
        !chunk.startsWith('xref') &&
        !chunk.startsWith('trailer') &&
        !chunk.startsWith('/Root') &&
        !chunk.startsWith('/Pages') &&
        chunk.length > 3
      );
      return filtered.join('\n');
    }
  } catch (err) {
    console.warn('Could not extract text from PDF base64:', err);
  }
  return '';
}

const TECH_SKILLS: { name: string; aliases: string[]; category: 'frontend' | 'backend' | 'database' | 'devopsAndCloud' | 'foundations' }[] = [
  { name: 'React', aliases: ['react', 'react.js', 'reactjs'], category: 'frontend' },
  { name: 'TypeScript', aliases: ['typescript', 'ts'], category: 'frontend' },
  { name: 'JavaScript', aliases: ['javascript', 'js', 'es6'], category: 'frontend' },
  { name: 'Node.js', aliases: ['node.js', 'nodejs', 'node js', 'node'], category: 'backend' },
  { name: 'Express', aliases: ['express', 'express.js', 'expressjs'], category: 'backend' },
  { name: 'REST APIs', aliases: ['rest api', 'rest apis', 'restful', 'restful api'], category: 'backend' },
  { name: 'Python', aliases: ['python', 'python3'], category: 'backend' },
  { name: 'Django', aliases: ['django'], category: 'backend' },
  { name: 'FastAPI', aliases: ['fastapi'], category: 'backend' },
  { name: 'Java', aliases: ['java', 'core java'], category: 'backend' },
  { name: 'Spring Boot', aliases: ['spring boot', 'springboot', 'spring'], category: 'backend' },
  { name: 'Go', aliases: ['golang', 'go lang'], category: 'backend' },
  { name: 'C++', aliases: ['c++', 'cpp'], category: 'backend' },
  { name: 'PostgreSQL', aliases: ['postgresql', 'postgres', 'psql'], category: 'database' },
  { name: 'MongoDB', aliases: ['mongodb', 'mongo'], category: 'database' },
  { name: 'MySQL', aliases: ['mysql'], category: 'database' },
  { name: 'SQLite', aliases: ['sqlite', 'sqlite3', 'room'], category: 'database' },
  { name: 'Firebase', aliases: ['firebase', 'firestore'], category: 'database' },
  { name: 'Vector databases', aliases: ['vector database', 'vector db', 'pinecone', 'faiss'], category: 'database' },
  { name: 'Redis', aliases: ['redis'], category: 'database' },
  { name: 'SQL', aliases: ['sql', 'rdbms'], category: 'database' },
  { name: 'Docker', aliases: ['docker', 'containerization'], category: 'devopsAndCloud' },
  { name: 'Kubernetes', aliases: ['kubernetes', 'k8s'], category: 'devopsAndCloud' },
  { name: 'AWS', aliases: ['aws', 'amazon web services', 's3', 'ec2'], category: 'devopsAndCloud' },
  { name: 'Git', aliases: ['git', 'github', 'gitlab', 'version control'], category: 'devopsAndCloud' },
  { name: 'CI/CD', aliases: ['ci/cd', 'ci cd', 'github actions'], category: 'devopsAndCloud' },
  { name: 'Linux', aliases: ['linux', 'bash', 'shell scripting'], category: 'devopsAndCloud' },
  { name: 'TailwindCSS', aliases: ['tailwind', 'tailwindcss'], category: 'frontend' },
  { name: 'Next.js', aliases: ['next.js', 'nextjs'], category: 'frontend' },
  { name: 'Vue.js', aliases: ['vue', 'vue.js', 'vuejs'], category: 'frontend' },
  { name: 'Flutter', aliases: ['flutter', 'dart'], category: 'frontend' },
  { name: 'React Native', aliases: ['react native', 'react-native'], category: 'frontend' },
  { name: 'Kotlin', aliases: ['kotlin', 'android sdk', 'android'], category: 'frontend' },
  { name: 'PyTorch', aliases: ['pytorch', 'torch'], category: 'foundations' },
  { name: 'TensorFlow', aliases: ['tensorflow', 'tf', 'keras'], category: 'foundations' },
  { name: 'OpenCV', aliases: ['opencv', 'cv2'], category: 'foundations' },
  { name: 'CNNs', aliases: ['cnn', 'cnns', 'convolutional neural network'], category: 'foundations' },
  { name: 'RAG pipelines', aliases: ['rag', 'rag pipelines', 'langchain'], category: 'foundations' },
  { name: 'Jest', aliases: ['jest', 'unit test', 'unit testing'], category: 'foundations' },
  { name: 'GraphQL', aliases: ['graphql'], category: 'backend' },
];

export function parseJDClient(fileName: string, rawText?: string, base64Data?: string): JobDescription {
  let effectiveText = rawText || '';
  if (!effectiveText && base64Data) {
    effectiveText = extractTextFromPdfBase64(base64Data);
  }

  const lines = effectiveText.split('\n').map(l => l.trim()).filter(Boolean);
  const lower = effectiveText.toLowerCase();

  // 1. Detect Title
  let title = '';
  for (const line of lines.slice(0, 8)) {
    const titleMatch = line.match(/(?:title|position|role|job)\s*[:\-]\s*(.+)/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
      break;
    }
  }
  if (!title) {
    for (const line of lines.slice(0, 5)) {
      if (/(?:intern|developer|engineer|analyst|architect)/i.test(line) && line.length < 60) {
        title = line.replace(/^[#*\-•\d.]+\s*/, '').trim();
        break;
      }
    }
  }
  if (!title) {
    title = fileName.replace(/\.[^.]+$/, '').replace(/[_\-]+/g, ' ').replace(/\b(?:jd|job|description)\b/gi, '').trim();
    if (!title) title = 'Software Engineer Intern';
  }

  // 2. Detect Company
  let company = 'TechNova Solutions';
  for (const line of lines.slice(0, 10)) {
    const compMatch = line.match(/(?:company|organization|at)\s*[:\-]\s*(.+)/i);
    if (compMatch && compMatch[1]) {
      company = compMatch[1].trim();
      break;
    }
  }

  // 3. Location
  let location = 'Bangalore, India (Hybrid)';
  if (lower.includes('remote')) location = 'Remote';
  else if (lower.includes('hybrid')) location = 'Hybrid (India / Global)';
  else if (lower.includes('pune')) location = 'Pune, India';
  else if (lower.includes('bengaluru') || lower.includes('bangalore')) location = 'Bengaluru, India';

  // 4. Skills extraction
  const foundRequired: string[] = [];
  const foundPreferred: string[] = [];
  const breakdown: Record<string, string[]> = {
    frontend: [],
    backend: [],
    database: [],
    devopsAndCloud: [],
    foundations: [],
  };

  const preferredSectionIndex = lower.search(/\b(?:preferred|bonus|good to have|nice to have|plus|desired)\b/);
  const preferredText = preferredSectionIndex !== -1 ? lower.slice(preferredSectionIndex) : '';
  const requiredText = preferredSectionIndex !== -1 ? lower.slice(0, preferredSectionIndex) : lower;

  TECH_SKILLS.forEach(skill => {
    const inPreferred = preferredText && skill.aliases.some(alias => {
      const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(preferredText);
    });

    const inRequired = skill.aliases.some(alias => {
      const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(requiredText);
    });

    if (inPreferred && !foundPreferred.includes(skill.name)) {
      foundPreferred.push(skill.name);
    } else if (inRequired && !foundRequired.includes(skill.name)) {
      foundRequired.push(skill.name);
      breakdown[skill.category].push(skill.name);
    }
  });

  if (foundRequired.length === 0) {
    foundRequired.push('TypeScript', 'React', 'Node.js', 'Git');
  }

  const responsibilities = lines
    .filter(l => l.startsWith('•') || l.startsWith('-') || l.startsWith('*') || /^\d+\./.test(l))
    .map(l => l.replace(/^[•\-*\d.]+\s*/, '').trim())
    .filter(l => l.length > 20 && l.length < 200)
    .slice(0, 5);

  return {
    id: `role-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    company,
    location,
    department: /data|ai|ml/i.test(title) ? 'AI & Data Science' : /mobile|android/i.test(title) ? 'Mobile Engineering' : 'Engineering',
    employmentType: 'Full-time Internship (6 Months)',
    experienceLevel: 'Student / Recent Graduate',
    summary: `${company} is recruiting for a ${title} position. Target competencies include ${foundRequired.slice(0, 4).join(', ')}.`,
    requiredSkills: foundRequired,
    preferredSkills: foundPreferred.length > 0 ? foundPreferred : ['Docker', 'AWS'],
    responsibilities: responsibilities.length > 0 ? responsibilities : [
      `Develop reliable features and application components aligning with ${title} standards.`,
      `Collaborate with team members to review code, write clean tests, and optimize performance.`,
      `Integrate APIs and database storage systems supporting scalable product delivery.`
    ],
    qualifications: [
      'Pursuing or completed degree in Computer Science, Information Technology, or related field',
      'Demonstrated project portfolio or coding repositories showing hands-on development experience'
    ],
    rawText: effectiveText || `Job Description for ${title} at ${company}`,
    analysisSummary: `Core requisition screening highlights mandatory proficiency in ${foundRequired.join(', ')}.`,
    competencyBreakdown: breakdown,
    sourceFileName: fileName,
    analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export function parseResumeClient(fileName: string, rawText?: string, base64Data?: string): CandidateResume {
  let effectiveText = rawText || '';
  if (!effectiveText && base64Data) {
    effectiveText = extractTextFromPdfBase64(base64Data);
  }

  const lines = effectiveText.split('\n').map(l => l.trim()).filter(Boolean);
  const lower = effectiveText.toLowerCase();

  // 1. Detect Name
  let name = '';
  for (const line of lines.slice(0, 6)) {
    if (
      line.length >= 3 &&
      line.length <= 40 &&
      !line.includes('@') &&
      !line.includes('http') &&
      !line.includes('github') &&
      !/(?:resume|curriculum|vitae|page|phone|email|profile|summary)/i.test(line)
    ) {
      name = line.replace(/^[#*\-•\d.]+\s*/, '').trim();
      break;
    }
  }
  if (!name) {
    name = fileName
      .replace(/\.[^.]+$/, '')
      .replace(/[_\-]+/g, ' ')
      .replace(/\b(?:resume|cv|profile|intern|final|latest|updated)\b/gi, '')
      .trim();
    name = name.length > 2
      ? name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'Applicant Candidate';
  }

  // 2. Email
  const emailMatch = effectiveText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const email = emailMatch ? emailMatch[0] : `${name.toLowerCase().replace(/\s+/g, '.')}@campus.edu`;

  // 3. Phone
  const phoneMatch = effectiveText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : undefined;

  // 4. Skills extraction
  const extractedSkills: string[] = [];
  TECH_SKILLS.forEach(s => {
    const found = s.aliases.some(alias => {
      const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(lower);
    });
    if (found && !extractedSkills.includes(s.name)) {
      extractedSkills.push(s.name);
    }
  });

  if (extractedSkills.length === 0) {
    extractedSkills.push('Software Engineering', 'Problem Solving', 'Git');
  }

  // 5. Education
  let degree = 'B.Tech in Computer Science';
  const degMatch = effectiveText.match(/\b(B\.?E\.?|B\.?Tech|M\.?Tech|B\.?Sc|BCA|MCA|Bachelor|Master)[^\n,.]*/i);
  if (degMatch) degree = degMatch[0].trim();

  let institution = 'University Institute of Technology';
  const instMatch = effectiveText.match(/(?:university|institute|college|school)\s+of\s+[^\n,.]+|[A-Z][A-Za-z\s]+(?:university|institute|college)/i);
  if (instMatch) institution = instMatch[0].trim();

  const gpaMatch = effectiveText.match(/\b(?:gpa|cgpa)\s*[:\-]?\s*([0-9]\.[0-9]{1,2}(?:\s*\/\s*10)?)/i);
  const gpa = gpaMatch ? gpaMatch[1] : undefined;

  // 6. Summary
  const summary = `${name} is an engineering candidate with demonstrated technical skills in ${extractedSkills.slice(0, 5).join(', ')}.`;

  return {
    id: `uploaded-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    email,
    phone,
    education: {
      degree,
      institution,
      graduationYear: '2025',
      gpa,
    },
    summary,
    skills: extractedSkills,
    experience: [],
    projects: [
      {
        title: `${name} Application Project`,
        technologies: extractedSkills.slice(0, 3),
        description: `Full lifecycle implementation demonstrating practical software architecture using ${extractedSkills.slice(0, 3).join(', ')}.`,
      }
    ],
    rawText: effectiveText || `Resume of ${name}\nSkills: ${extractedSkills.join(', ')}`,
    formatCharacteristics: {
      formatType: 'clean-structured',
    },
  };
}
