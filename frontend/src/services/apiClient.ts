/**
 * API Client for connecting InternLoom Frontend to the FastAPI AI Backend.
 */

export interface BackendCandidateScore {
  name: string;
  semantic_score: number;
}

export interface BackendHybridCandidate {
  rank: number;
  name: string;
  total_score: number;
  semantic_score: number;
  keyword_score: number;
  matched_skills: string[];
  missing_skills: string[];
  additional_skills: string[];
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
    github?: string;
    linkedin?: string;
  };
  explanation?: string;
}

export interface BackendHybridResponse {
  required_skills: string[];
  total_candidates: number;
  ranked_candidates: BackendHybridCandidate[];
}

const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Check if the local FastAPI AI backend is online and model is loaded.
 */
export async function checkBackendHealth(): Promise<{ status: string; model_loaded: boolean } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.debug('FastAPI backend is not reachable:', err);
  }
  return null;
}

/**
 * Calls Member 1's pure semantic ranking endpoint (POST /semantic-rank).
 * Uses local BAAI/bge-small-en-v1.5 embeddings & scikit-learn cosine similarity.
 */
export async function rankSemanticallyViaBackend(
  jobDescriptionText: string,
  candidates: { name: string; text: string }[]
): Promise<BackendCandidateScore[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/semantic-rank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_description: jobDescriptionText,
        resumes: candidates,
      }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to connect to FastAPI /semantic-rank, falling back:', err);
  }
  return null;
}

/**
 * Calls the full end-to-end PDF parsing and hybrid ranking endpoint (POST /api/upload-and-rank).
 */
export async function uploadAndRankPdfsViaBackend(
  jobDescriptionText: string,
  pdfFiles: File[],
  semanticWeight = 0.6
): Promise<BackendHybridResponse | null> {
  try {
    const formData = new FormData();
    formData.append('job_description', jobDescriptionText);
    formData.append('semantic_weight', String(semanticWeight));

    for (const file of pdfFiles) {
      formData.append('files', file);
    }

    const res = await fetch(`${API_BASE_URL}/api/upload-and-rank`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to connect to FastAPI /api/upload-and-rank:', err);
  }
  return null;
}
