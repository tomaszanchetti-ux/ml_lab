# ML Lab — Plan

**Goal.** Pass Revolut's rounds for Lead Applied AI Engineer: (1) problem solving · (2) ML basis: maths + statistics · (3) ML design · (4) team leaders · (5) product / area managers. Round 2 is the one the CV doesn't cover, so it gets the most weight. Started 22/09/2026.

**Method.** Two tracks in parallel. Theory gives the vocabulary and the formulas; the lab makes them empirical on real credit data. Every module points at a card and every card points back at a module. Progress is measured by `docs/NOTES.md`: one paragraph per module and per card, in Tomás's own words.

## Track A — Theory (one PDF per module, in `theory/`)

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
