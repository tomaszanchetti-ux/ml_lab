# ML Lab — Tomás Zanchetti

Two tracks, one repo, run in parallel. Purpose: pass Revolut's technical rounds (ML basis: maths + statistics · ML design · problem solving) with **understanding**, not memorisation.

| Track | Where | What |
|---|---|---|
| **Theory** | `theory/` | One PDF per module (+ HTML source). Read once, answer the questions out loud in English. |
| **Lab** | `lab/`, `notebooks/` | One Jupyter notebook per card. Real data, real numbers. One card = one problem = one number. |
| **Plan & notes** | `docs/` | `PLAN.md` = roadmap of both tracks. `NOTES.md` = your own words per module and per card — those paragraphs are your interview answers. |

## Setup (once)

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

## Run a notebook

```bash
.venv/bin/jupyter notebook notebooks/
```

Then open the card you're on. Run cells top to bottom (Shift+Enter). Read the numbers. Write your paragraph in `docs/NOTES.md`.

## Data

`lab/data/credit_default_uci.csv` — UCI "Default of credit card clients" (Yeh & Lien, 2009): 30,000 credit-card customers of a Taiwanese bank, 23 features, target = defaulted next month (22.1 %). Public domain for research. Source: https://archive.ics.uci.edu/dataset/350
