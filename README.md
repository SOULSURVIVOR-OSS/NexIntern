# InternLoom AI — Intelligent Candidate Shortlisting Engine

A full-stack, local AI campus recruitment engine that combines **deep local semantic sentence embeddings** (`BAAI/bge-small-en-v1.5`), **PyMuPDF PDF parsing**, and **multi-tier keyword matching** (BM25 + TF-IDF + Skills Ontology) with an **Apple-inspired interactive web frontend**.

---

## 👥 Hackathon Team Architecture

| Member | Module | Technology Stack | Responsibility |
| :--- | :--- | :--- | :--- |
| **Member 1 (You)** | Semantic AI Ranking Engine | Python 3.12, FastAPI, Sentence-Transformers, `BAAI/bge-small-en-v1.5`, scikit-learn, NumPy | Zero external LLMs. Computes deep meaning similarity & cosine scores (0–100%). |
| **Friend 1** | Ingestion & Keyword Matcher | PyMuPDF, rank_bm25, scikit-learn TF-IDF, `skills.json` taxonomy | Parses multi-page PDF resumes, extracts contact & sections, computes BM25 & skills ontology match. |
| **Friend 2** | Interactive Recruiter UI | React 19, TypeScript, Vite, Tailwind CSS, Motion, Lucide Icons | Apple-style stage workflow: JD upload, PDF drag-and-drop, animated analysis, interactive shortlist & AI chat. |

---

## 🏗️ System Architecture

```
   ┌────────────────────────────────────────────────────────┐
   │             FRONTEND (React 19 + Vite)                 │
   │  - Stage 1: Role Specification & Bias Scanner          │
   │  - Stage 2: Multi-PDF Resume Drag & Drop Upload        │
   │  - Stage 3: Cinematic Analysis Experience               │
   │  - Stage 4: Ranked Shortlist, Compare, AI Recruiter    │
   └───────────────────────────┬────────────────────────────┘
                               │  POST /api/upload-and-rank (FormData)
                               │  POST /semantic-rank (JSON)
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │             FASTAPI BACKEND GATEWAY (Port 8000)        │
   │     CORS-enabled • Preloads local embedding model      │
   └─────────────┬────────────────────────────┬─────────────┘
                 │                            │
                 ▼                            ▼
      [ PyMuPDF Parser ]             [ Keyword Engine ]
      Extracts text, contacts,       Computes BM25Okapi,
      skills & resume sections       TF-IDF & skills ontology
                 │                            │
                 ▼                            │
      [ Local Semantic AI ]                   │
      BAAI/bge-small-en-v1.5                  │
      Sentence embeddings                     │
      Cosine similarity (scikit-learn)        │
                 │                            │
                 └─────────────┬──────────────┘
                               │
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │                  HYBRID SCORING ENGINE                 │
   │       Total Score = (60% Semantic + 40% Keyword)       │
   │    • Dynamic weight adjustment slider (10% - 90%)      │
   │    • Generates evidence snippets & human justifications│
   │    • Resilient to typos, messy dates & missing headers │
   └────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart: Running the Entire System

### Step 1: Start the Backend (Terminal 1)

```bash
./run_backend.sh
```
*Or manually:*
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- **Backend API**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/health`

---

### Step 2: Start the Frontend (Terminal 2)

```bash
./run_frontend.sh
```
*Or manually:*
```bash
cd frontend
npm install
npm run dev
```
- **Frontend App**: `http://localhost:3000`

---

## 📁 Repository Structure

```
.
├── backend/                     # Python FastAPI AI Backend
│   ├── main.py                  # API endpoints (CORS, /api/upload-and-rank, /semantic-rank)
│   ├── embeddings.py            # Local BAAI/bge-small-en-v1.5 model singleton
│   ├── ranking.py               # scikit-learn cosine similarity & 0-100 conversion
│   ├── pdf_parser.py            # PyMuPDF PDF extraction, text cleaning, skills & contact detection
│   ├── keyword_engine.py        # BM25Okapi, TF-IDF, and skill ontology matching
│   ├── skills.json              # Comprehensive 8-category technical skills database
│   ├── models.py                # Pydantic validation schemas
│   ├── demo_request.py          # Terminal demo test script
│   ├── test_api.py              # Backend unit tests
│   └── requirements.txt         # Production backend dependencies
│
├── frontend/                    # React 19 + TypeScript Frontend
│   ├── src/
│   │   ├── components/          # 17 Apple-style modular components
│   │   │   ├── Navbar.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── JDUploadStage.tsx
│   │   │   ├── ResumeUploadStage.tsx
│   │   │   ├── AnalysisExperience.tsx
│   │   │   ├── ShortlistSection.tsx
│   │   │   ├── CandidateCard.tsx
│   │   │   ├── CandidateDetailModal.tsx
│   │   │   ├── CandidateComparisonModal.tsx
│   │   │   ├── RecruiterChatDrawer.tsx
│   │   │   ├── AlgorithmInspectorModal.tsx
│   │   │   ├── BiasScannerModal.tsx
│   │   │   ├── ResumeUploadModal.tsx
│   │   │   ├── JDViewerModal.tsx
│   │   │   ├── RankingTable.tsx
│   │   │   └── ScoreCounter.tsx
│   │   ├── services/
│   │   │   ├── matchingEngine.ts # Deterministic matching & domain scoring
│   │   │   └── apiClient.ts      # HTTP client connecting React to FastAPI
│   │   ├── data/
│   │   │   └── sampleData.ts     # Benchmark roles & 24 campus candidate profiles
│   │   ├── types.ts              # Full TypeScript contracts
│   │   ├── App.tsx               # Orchestration & stage state
│   │   └── main.tsx              # React DOM entrypoint
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts           # Proxy to backend on port 8000
│   └── index.html
│
├── run_backend.sh               # 1-click script to run backend
├── run_frontend.sh              # 1-click script to run frontend
└── README.md                    # System documentation
```
# InternLoom-AI
# InternLoom-AI
# InternLoom-AI
