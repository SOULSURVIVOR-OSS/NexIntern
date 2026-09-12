"""FastAPI application for the Semantic & Hybrid Resume Ranking Engine.

Combines:
- Member 1: Local BAAI/bge-small-en-v1.5 sentence embeddings & scikit-learn cosine similarity.
- Member 2: PyMuPDF PDF extraction, contact detection, skill ontology, BM25 & TF-IDF.
- Member 3: CORS-enabled REST API ready for Google Project IDX / Web Frontend.
"""

import logging
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models import (
    CandidateScore,
    ContactInfo,
    HybridCandidateScore,
    HybridRankingResponse,
    SemanticRankRequest,
)
from embeddings import embedding_engine
from ranking import compute_cosine_similarity, rank_candidates
from pdf_parser import parse_jd, parse_resume
from keyword_engine import keyword_engine

# Configure standard logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ranking_orchestrator")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager that loads the local embedding model once at startup."""
    logger.info("Starting Semantic & Hybrid Resume Ranking Service...")
    logger.info("Pre-loading local embedding model '%s'...", embedding_engine.model_name)
    embedding_engine.load_model()
    logger.info("Service initialized and ready to handle requests.")
    yield
    logger.info("Shutting down Resume Ranking Service.")


app = FastAPI(
    title="Smart Shortlisting & Semantic Resume Ranking Engine",
    description=(
        "Unified AI recruitment ranking service combining local sentence embeddings "
        "(BAAI/bge-small-en-v1.5), scikit-learn cosine similarity, PyMuPDF PDF parsing, "
        "and multi-tier keyword/skill matching (BM25 + TF-IDF + Ontology)."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend integrations (Google Project IDX, React, Vue, HTML/JS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(
    "/",
    tags=["General"],
    summary="Service status & documentation links",
)
async def root():
    """Welcome endpoint providing quick links to interactive documentation."""
    return {
        "service": "Smart Shortlisting Resume Ranking Engine",
        "status": "online",
        "embedding_model": embedding_engine.model_name,
        "docs_url": "/docs",
        "endpoints": {
            "pure_semantic_rank": "POST /semantic-rank",
            "pdf_upload_and_rank": "POST /api/upload-and-rank",
            "json_hybrid_rank": "POST /api/hybrid-rank",
            "health_check": "GET /health",
        },
    }


@app.get(
    "/health",
    tags=["General"],
    summary="Service health and model readiness check",
)
async def health_check():
    """Check service health and model load state."""
    return {
        "status": "healthy",
        "model_loaded": embedding_engine.is_loaded,
        "model_name": embedding_engine.model_name,
    }


# ==============================================================================
# 1. PURE SEMANTIC RANKING (Member 1 Specification Contract)
# ==============================================================================
@app.post(
    "/semantic-rank",
    response_model=List[CandidateScore],
    status_code=status.HTTP_200_OK,
    tags=["Member 1 - Semantic Ranking"],
    summary="Pure Semantic Ranking (Text JSON input)",
    description=(
        "Computes semantic similarity embeddings for the provided Job Description "
        "and candidate resumes using local BAAI/bge-small-en-v1.5 and scikit-learn cosine similarity. "
        "Returns only candidate names and semantic_score (0-100)."
    ),
)
async def semantic_rank(payload: SemanticRankRequest) -> List[CandidateScore]:
    """Rank resumes against the provided job description using local embeddings only."""
    try:
        jd_text = payload.job_description
        resume_texts = [resume.text for resume in payload.resumes]
        candidate_names = [resume.name for resume in payload.resumes]

        # Batch encode JD + resumes together
        all_texts = [jd_text] + resume_texts
        all_embeddings = embedding_engine.encode(all_texts)

        jd_embedding = all_embeddings[0]
        resume_embeddings = all_embeddings[1:]

        results = rank_candidates(
            jd_embedding=jd_embedding,
            resume_embeddings=resume_embeddings,
            candidate_names=candidate_names,
        )
        return results

    except Exception as exc:
        logger.exception("Error during pure semantic ranking: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during semantic ranking: {str(exc)}",
        )


# ==============================================================================
# 2. FULL HYBRID PIPELINE FOR FRONTEND (PDF Uploads + JD Text)
# ==============================================================================
@app.post(
    "/api/upload-and-rank",
    response_model=HybridRankingResponse,
    status_code=status.HTTP_200_OK,
    tags=["Frontend Integration"],
    summary="Upload PDF resumes and rank against Job Description",
    description=(
        "Accepts multipart/form-data with resume PDF files and Job Description text (or PDF). "
        "Parses PDFs, extracts skills & contact info, computes local semantic similarity and keyword scores, "
        "and returns a comprehensive sorted leaderboard."
    ),
)
async def upload_and_rank(
    job_description: str = Form(..., description="Job Description text"),
    files: List[UploadFile] = File(..., description="Uploaded candidate resume PDFs"),
    semantic_weight: float = Form(0.60, description="Weight for Semantic AI (0.0 to 1.0)"),
) -> HybridRankingResponse:
    """End-to-end endpoint for frontend: parse PDFs, compute hybrid scores, return leaderboard."""
    if not files:
        raise HTTPException(status_code=400, detail="No resume files provided.")

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    try:
        # Step 1: Parse Job Description
        jd_data = parse_jd(job_description)
        required_skills = jd_data.get("required_skills", [])

        # Step 2: Parse each uploaded PDF resume
        parsed_resumes = []
        for file in files:
            file_bytes = await file.read()
            if not file_bytes:
                continue

            try:
                parsed = parse_resume(file_bytes)
                # Fallback to filename if candidate name wasn't detected by heuristic
                if not parsed.get("candidate_name") or parsed.get("candidate_name") == "Unknown Candidate":
                    clean_filename = file.filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").title()
                    parsed["candidate_name"] = clean_filename
                parsed["filename"] = file.filename
                parsed_resumes.append(parsed)
            except Exception as parse_err:
                logger.warning("Failed to parse PDF file '%s': %s", file.filename, parse_err)

        if not parsed_resumes:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from any of the uploaded PDF files."
            )

        # Step 3: Run Keyword Engine (Ontology match + BM25 + TF-IDF)
        keyword_results = keyword_engine.score_batch(parsed_resumes, jd_data)
        # Create a lookup map by candidate name or index
        kw_map = {res["candidate_name"]: res for res in keyword_results}

        # Step 4: Run Semantic AI Engine (BAAI/bge-small-en-v1.5 + scikit-learn cosine similarity)
        resume_texts = [p.get("cleaned_text", "") for p in parsed_resumes]
        all_texts = [jd_data.get("cleaned_text", job_description)] + resume_texts
        all_embeddings = embedding_engine.encode(all_texts)

        jd_emb = all_embeddings[0]
        resume_embs = all_embeddings[1:]

        semantic_scores_raw = compute_cosine_similarity(jd_emb, resume_embs)

        # Step 5: Merge into Hybrid Leaderboard
        kw_weight = max(0.0, min(1.0, 1.0 - semantic_weight))
        sem_weight = max(0.0, min(1.0, semantic_weight))

        hybrid_candidates: List[HybridCandidateScore] = []
        for idx, p in enumerate(parsed_resumes):
            cand_name = p.get("candidate_name", f"Candidate {idx+1}")
            kw_data = kw_map.get(cand_name, {})

            # Semantic score mapped to 0-100
            raw_sim = float(semantic_scores_raw[idx])
            sem_score = round(max(0.0, min(1.0, raw_sim)) * 100.0, 2)

            kw_score = float(kw_data.get("keyword_score", 0.0))

            # Composite hybrid score
            total_score = round((sem_weight * sem_score) + (kw_weight * kw_score), 2)

            contact_dict = p.get("contact", {})
            contact_obj = ContactInfo(
                name=contact_dict.get("name"),
                email=contact_dict.get("email"),
                phone=contact_dict.get("phone"),
                github=contact_dict.get("github"),
                linkedin=contact_dict.get("linkedin"),
            )

            hybrid_candidates.append(
                HybridCandidateScore(
                    rank=0,  # Will be assigned after sorting
                    name=cand_name,
                    total_score=total_score,
                    semantic_score=sem_score,
                    keyword_score=kw_score,
                    matched_skills=kw_data.get("matched_skills", []),
                    missing_skills=kw_data.get("missing_skills", []),
                    additional_skills=kw_data.get("additional_skills", []),
                    contact=contact_obj,
                    explanation=kw_data.get("explanation"),
                )
            )

        # Sort by total_score descending
        hybrid_candidates.sort(key=lambda c: c.total_score, reverse=True)

        # Assign ranks
        for rank_num, cand in enumerate(hybrid_candidates, start=1):
            cand.rank = rank_num

        return HybridRankingResponse(
            required_skills=required_skills,
            total_candidates=len(hybrid_candidates),
            ranked_candidates=hybrid_candidates,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error during hybrid upload and rank: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal ranking error: {str(exc)}",
        )
