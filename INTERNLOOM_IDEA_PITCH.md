# InternLoom AI — Executive Idea Pitch & Project Overview

> **Tagline:** *"Find the right candidate. Not just the right keywords."*  
> **Category:** AI / HRTech / Campus Recruitment / Next-Gen Placement  
> **Submission Type:** Hackathon Project Brief & Innovation Pitch

---

## 💡 1. The Core Idea in 30 Seconds

Most automated resume screeners fail in one of two extremes:
1. **Traditional ATS keyword scanners** blindly look for exact keyword matches, rejecting brilliant students who describe skills differently (e.g. *FastAPI* vs *REST APIs*, *Node* vs *Node.js*) or made minor formatting typos.
2. **Generic LLM wrappers** ask ChatGPT or Claude to *"grade this resume out of 100"*, resulting in arbitrary scores, black-box hallucinations, non-reproducible decisions, and major privacy leaks.

**InternLoom AI** introduces a **groundbreaking, dual-engine hybrid shortlisting engine**:
It mathematically pairs **local vector semantic embeddings (`BAAI/bge-small-en-v1.5`)** with **BM25 token relevance & skills ontology matching**, wrapped in an Apple-inspired recruiter interface with live dynamic weight controls and automated HR bias auditing.

---

## 🎯 2. The Problem We Are Solving

* **The Vocabulary Mismatch Trap:** Students describe their projects using varied terminology (*"architected client-server APIs"* vs *"built REST endpoints"*). Traditional ATS filters rank them as zero match.
* **The "Black Box" Trust Crisis:** Hiring teams cannot legally or ethically rely on arbitrary LLM ratings when rejected candidates ask *"Why wasn't I shortlisted?"*
* **Artificial Barrier Inflation in JDs:** Campus job descriptions frequently contain exclusionary institutional elitism (*"Tier 1 IIT/NIT only"*) and unrealistic experience inflation (*"3+ years experience for an intern role"*), unnecessarily slashing qualified applicant pools by 80%+.
* **Messy Campus Resumes:** Students frequently submit multi-column PDFs, informal dates (*"Summer '24"*), and spelling slips (*"reaktjs"*).

---

## ⚙️ 3. How InternLoom AI Solves It (The Architecture)

InternLoom AI operates on a **mathematically transparent, dual-engine pipeline**:

```
                         [ Candidate Resume PDF ]
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │    PyMuPDF Ingestion      │
                      │  Resilient Normalization  │
                      └─────────────┬─────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
┌───────────────────────┐                       ┌───────────────────────┐
│  Engine 1: Keyword    │                       │  Engine 2: Semantic   │
│  & Skills Ontology    │                       │  Sentence Embeddings  │
│                       │                       │                       │
│ • BM25Okapi           │                       │ • BAAI/bge-small-en   │
│ • Sublinear TF-IDF    │                       │ • Cosine Similarity   │
│ • 8-category database │                       │ • Zero LLM scoring    │
└───────────┬───────────┘                       └───────────┬───────────┘
            │                                               │
            └───────────────────────┬───────────────────────┘
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │    Hybrid Scorer Fusion   │
                      │  Score = w_sem*S + w_kw*K │
                      └─────────────┬─────────────┘
                                    │
                                    ▼
                      [ Apple-Style Recruiter UI ]
```

### The Scoring Equation:
$$\text{Final Score} = \left[ w_{\text{keyword}} \times \text{Score}_{\text{BM25 / Ontology}} \right] + \left[ w_{\text{semantic}} \times \text{Score}_{\text{BGE-Cosine}} \right]$$

* **$w_{\text{keyword}}$ vs $w_{\text{semantic}}$**: Dynamically adjustable via an interactive UI slider (10% to 90%), putting hiring teams in total control.

---

## 🌟 4. Key Differentiators & Unique Selling Points (USPs)

1. **100% Deterministic & Local AI (Zero Blind LLM Guesswork):**
   * Embeddings are generated locally using `BAAI/bge-small-en-v1.5`.
   * Cosine similarities are calculated via `scikit-learn`.
   * Completely reproducible scores down to two decimal places.

2. **Resilient Ingestion Pipeline (Messy Resume Recovery):**
   * Levenshtein typo tolerance recovers misspelled technologies (e.g. `reaktjs` $\rightarrow$ `React`).
   * Normalizes informal dates and infers missing section headers.

3. **Job Description Bias & Exclusion Scanner:**
   * Audits JDs for elitist criteria, experience inflation, and aggressive corporate jargon (*"rockstar"*, *"work around the clock"*).
   * Provides 1-click inclusive rephrasing that preserves technical rigor while expanding candidate access.

4. **Head-to-Head Candidate Audits:**
   * Direct side-by-side comparison explaining *why* Candidate A is ranked higher than Candidate B with exact score deltas and unique skill tags.

5. **AI Recruiter Q&A Drawer:**
   * Natural language assistant that answers recruiter questions strictly grounded in verifiable resume citations.

---

## 📈 5. Target Market & Real-World Impact

* **University Placement Offices:** Handle 5,000+ student applications in minutes with transparent, defensible shortlisting.
* **Early-Stage Tech Startups:** Rapidly screen candidates based on actual full-stack project competence rather than pedigree.
* **Enterprise Talent Acquisition:** Remove hiring bias and maintain strict regulatory compliance through mathematical explainability.

---

## 🚀 6. Hackathon Pitch Checklist

| Dimension | Hackathon Evaluation Rubric | InternLoom AI Implementation |
| :--- | :--- | :--- |
| **Technical Innovation** | Dual-Engine Synergy | Combined BM25Okapi, TF-IDF, and local BGE sentence embeddings |
| **Engineering Rigor** | Full-Stack Execution | Python FastAPI + React 19 + TypeScript + Express + Vite |
| **Design Aesthetics** | Apple-Inspired Minimalist UX | 5-stage workflow, animated counters, motion layout transitions |
| **Ethical AI** | Inclusivity & Transparency | Built-in HR bias scanner, explainable scoring, zero LLM bias |
| **Completeness** | Production Ready | Tested APIs, Swagger docs, live demo runner, and automated PDF export |
