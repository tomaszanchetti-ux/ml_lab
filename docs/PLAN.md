# ML Lab — Plan

**Goal.** Pass Revolut's rounds for Lead Applied AI Engineer: (1) problem solving · (2) ML basis: maths + statistics · (3) ML design · (4) team leaders · (5) product / area managers. Round 2 is the one the CV doesn't cover, so it gets the most weight. Started 22/09/2026.

**Method.** Two tracks in parallel. Theory gives the vocabulary and the formulas; the lab makes them empirical on real credit data. Every module points at a card and every card points back at a module. Progress is measured by `docs/NOTES.md`: one paragraph per module and per card, in Tomás's own words.

## 🎯 Sprint to 8 October — "Machine Learning 1 (Basics)", 1 hour

Confirmed 29/09. Syllabus from Revolut, verbatim: **(1) Maths** — Normal, Bernoulli, Poisson; bias and variance · **(2) Probability** — Bernoulli, Binomial, Gaussian, random variables · **(3) Statistics** — bias, statistical significance, A/B testing · **(4) Machine Learning** — basic models, pros and cons. Their prep links: alexeygrigorev `theory.md` (the closest to topic 4), kojino 120 questions (`probability.md`, `statistical-inference.md`, `predictive-modeling.md`), iamtodor Q&A, dingran quant-notes, awesome-ML courses.

| Day | Theory | Lab / drills | Output |
|---|---|---|---|
| 29–30/09 | Module 1 §02–05: random variables, distributions, CLT/CI, tests & A/B | Card 0 answers · **Card 1** (rule vs. logistic regression, precision/recall/AUC) | NOTES.md M1 + C0 + C1 |
| 1–2/10 | **Module 2**: what a model is · linear/logistic · bias–variance · regularisation · validation · trees/RF/GBM · kNN, naive Bayes, SVM, NN (one paragraph each, pros/cons) · metrics | **Card 3** (overfit on purpose: bias–variance you can see) | NOTES.md M2 + C3 |
| 3–4/10 | **Question bank** (~100 Q, built from their links, mapped to the 4 topics, 3–5-line model answers) | Mock 1 (English, 45 min, all four topics) | list of weak spots |
| 5–6/10 | Cheat sheets: distributions (mean/variance/when) · models pros/cons table · A/B checklist | Mocks 2–3 on the weak spots | — |
| 7/10 | Light review only | — | sleep |
| **8/10** | **Interview** | | |

Modules 3 (ML design) and 4 (problem solving) move to after 8/10.

## Track A — Theory: four modules, one per Revolut topic (rebuilt 29/09, `theory/`)

Decision 29/09: one module per topic, from zero upwards, concepts shown in real Revolut-shaped cases. Each section = idea in plain words · formula · example · 30-second answer · exercises; answers at the back. The first draft (`theory/_v1/`) is kept for reference only.

| # | Module | Revolut topic | Status |
|---|---|---|---|
| 1 | **Probability** — rules, random variables, Bernoulli · Binomial · Poisson · Normal · heavy tails | 2 | ✅ `theory/module-1/Module 1 - Probability.pdf` (29/09) |
| 2 | **Statistics** — population vs. sample, bias (all kinds), sampling, CLT, confidence intervals, tests, p-values, power, A/B end to end | 3 | ⏳ 30/09 |
| 3 | **Maths for ML** — what a model is, loss, bias–variance, under/overfitting, validation, leakage | 1 | ⏳ 1/10 |
| 4 | **The models** — linear/logistic regression, regularisation, metrics, kNN, naive Bayes, trees, random forest, gradient boosting, SVM, neural nets, k-means — pros/cons and when | 4 | ⏳ 2/10 |

## Track A (old plan, superseded) — Theory (one PDF per module, in `theory/`)

| # | Module | Content | Status |
|---|---|---|---|
| 1 | **Probability & statistics for ML** | notation · probability rules · Bayes with the fraud example · expectation, variance, z-scores · distributions (Bernoulli, binomial, Poisson, normal, heavy tails) · sampling, CLT, confidence intervals · bias vs. noise, survivorship · hypothesis tests, p-values, power, A/B tests | 📖 reading (22/09) |
| 2 | **What a model is** | function + loss + optimisation · linear & logistic regression · train/validation/test, leakage · overfitting, bias/variance, regularisation · metrics: accuracy trap, precision, recall, F1, ROC-AUC, PR-AUC, calibration · trees & gradient boosting · embeddings; how a transformer learns (masked modelling → PRAGMA) | ⏳ next |
| 3 | **ML design** | four whiteboard cases: fraud screening · dispute automation · next-best-product · support agent — requirements → data → model → serving/latency → evals → rollout → monitoring → governance | ⏳ |
| 4 | **Drills** | Revolut-style problem-solving cases (MECE, hypothesis per data request, root cause before solution) · mock rounds in English per interviewer type · the calibrated technical-honesty line | ⏳ |

## Track B — Lab (one notebook per card, in `notebooks/`)

Project: **a credit-default model, end to end** — the shape of Revolut's ML rounds (imbalanced classes, base rates, precision/recall, calibration, leakage, threshold = business decision) and a rebuild, with your own hands, of the lender project. Data: UCI credit-card default, 30,000 customers, 22.1 % default.

| Card | Problem | The number | Pairs with | Status |
|---|---|---|---|---|
| 0 | **Block 0 — measure the data** before modelling anything | base rate · mean vs. median · default rate per segment with CI | Module 1 | 🟢 ready — `notebooks/card0_measure.ipynb` |
| 1 | **Baseline**: a hand-made rule vs. logistic regression; why accuracy lies | precision, recall, PR-AUC on a held-out test set | Module 2 | ⏳ |
| 2 | **Threshold = money**: move the cut-off, watch precision/recall trade; expected loss → price per customer | € expected loss at each threshold | Modules 1–2 | ⏳ |
| 3 | **Overfit on purpose**: gradient boosting; train vs. test curves; regularisation; feature importance | train-test gap | Module 2 | ⏳ |
| 4 | **Leakage & survivorship**: inject a leaky feature and watch the score explode; train only on "approved" customers and watch it break | AUC before/after | Module 1 §4 | ⏳ |
| 5 | **Calibration & serving**: are the probabilities honest?; wrap the model in a tiny API, score one applicant, log it | calibration curve · latency per call | Module 3 | ⏳ |
| 6 | **Mini-PRAGMA** (optional): synthetic transaction sequences → learned customer embeddings → same classifier on top | lift vs. hand-made features | Module 2 | ⏳ |

Later, if wanted: the Kaggle credit-card fraud set (0.17 % fraud) for the rare-event pain.

## Cadence

- Theory: one module per week. Lab: one or two cards per week. Each card ≤ 2 hours.
- Every session ends with a paragraph in `NOTES.md` and a commit.
- Adjust as soon as Revolut confirms the format of each round.
