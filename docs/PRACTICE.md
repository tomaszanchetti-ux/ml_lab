# Practice — how the sessions run from here

**Interview:** Revolut "Machine Learning 1 (Basics)", 1 hour, **8 October 2026**. Breadth, not depth: their own reference answers are 3–4 bullets each.

**Baseline (done 05/10):** four modules + a wrap-up, each as PDF and video, in `theory/` (copies in `~/Documents/Personal/CV/Interviews/Revolut/`). Tomás is watching/reading them in order; practice starts after that.

## What we practise with — Revolut's own links (local copies in `reference/`, git-ignored)

| Source | File | Use |
|---|---|---|
| kojino · probability (20) | `reference/kojino/probability.md` | **puzzle style** — the main gap: two children, fair coin from a biased one, flips until HH, fair-vs-biased coin (Bayes), shooting star, hash collisions, expected values |
| kojino · statistical inference (16) | `reference/kojino/statistical-inference.md` | A/B hygiene, p-value, CI, selection bias, MLE/MAP, "is unbiased always good?" — maps to Module 2 |
| kojino · predictive modelling (19) | `reference/kojino/predictive-modeling.md` | approach to a dataset, train ≠ test (covariate vs. concept shift), outliers, MSE vs. MAE, metrics for imbalance, compare models, regularisation — Modules 3–4 |
| kojino · data analysis (27) | `reference/kojino/data-analysis.md` | R², curse of dimensionality, "is more data always better?", multicollinearity, feature importance, missing values, ensembles |
| kojino · communication (5) | `reference/kojino/communication.md` | **"explain an A/B test / a confidence interval to an engineer with no statistics"** — Tomás's natural strength, unpractised |
| alexeygrigorev · theory | `reference/other/alexeygrigorev-theory.md` | the closest to topic 4: ~160 short questions tagged 👶 / ⭐ / 🚀. Do all 👶 and ⭐ for linear/logistic regression, validation, classification metrics, regularisation, trees, random forest, gradient boosting; skim the rest |
| iamtodor | `reference/other/iamtodor-README.md` | bias/variance, L1/L2, imbalanced classes, power, CI in layman's terms |

kojino's product-metrics and programming/SQL sections are outside this round's syllabus — skip unless asked.

## Session protocol

1. **In English, out loud style.** Claude asks one question at a time; Tomás answers in 30–60 seconds as he would in the interview; Claude grades it (✅ / ⚠️ / ❌), gives the 3–4-bullet model answer, and names the module section to revisit. No answers shown before he tries.
2. **Order:** (a) a warm-up round of ten mixed 👶 questions to find the weak spots → (b) probability puzzles → (c) statistics / A/B → (d) bias–variance, validation, metrics → (e) models: pros and cons, compare two → (f) "explain it to a non-statistician" → (g) a full 45-minute mock on the 7th.
3. **Then cases:** Revolut-shaped, strategic applications of each module (like the ATO auto-freeze and delinquency-outreach cases done on 24–25/09).
4. **Scorecard:** keep a running list here of questions missed twice — that list is the last thing reviewed on the 7th.
5. Honesty rule stands: "I haven't used that; what I know is what it's for" is a valid answer and is practised as one.

## What we already know about Tomás's answers (from the cases on 24–25/09)

- ✅ Solid: Bayes with the table, conditional probability, base rates, comparing policies in euros, "a model's value is measured against the best non-model baseline", sequential Bayes (posterior → next prior).
- ⚠️ Watch: says **"accuracy" when he means precision** · tied precision to recall (it's the **false-alarm rate** that drives precision for rare events) · dropped a factor in a cost line (the 50 %) · applied a **segment's rate to the whole population** · misread a decimal (0.1 % vs 0.01 %) → habit to drill: state the reading of the numbers out loud first; convert rates to counts.
- Not yet tested: distributions (when to use which), CLT/SE, p-value wording, sample size, bias–variance wording, model pros/cons, puzzles.

## Scorecard — missed twice

_(empty — fill during practice)_
