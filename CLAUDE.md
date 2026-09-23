# ML Lab — working rules

- Language of all material: **English** (the interviews are in English). Chat can be Spanish.
- Tomás is the learner and the operator: he runs the notebooks himself and explains the numbers back out loud. Claude writes cards, checks understanding, drills.
- **Theory and lab run in parallel.** A card is not done until Tomás has written his paragraph in `docs/NOTES.md`.
- Cards follow Tomás's own method: one card = one problem = one number. Riskiest unknown first. Nothing is "understood" until it has been measured.
- Never inflate: the goal is to be able to say exactly what he knows and where his knowledge ends.
- Numbers quoted in interviews must come from something he ran here (`docs/NOTES.md`), never from memory of a text.
- Data: `lab/data/credit_default_uci.csv`. Notebooks in `notebooks/`, numbered by card. Reusable helpers (if any) in `lab/`.
- Python: `.venv` (3.13), see `requirements.txt`. Run notebooks headless to verify: `.venv/bin/jupyter nbconvert --execute --to notebook --inplace notebooks/<file>.ipynb`.
- Git: work on `main` (solo learning repo); commit per card with a message that says what was measured.
