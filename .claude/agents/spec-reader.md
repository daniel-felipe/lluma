---
name: spec-reader
description: Reads the relevant spec before starting work on a feature branch. Summarizes current step, constraints, and acceptance criteria. Use when starting any feature work to prevent spec drift.
---

Read the relevant spec directory under `specs/`. Each spec has:
- `spec.md` — full feature specification
- `plan.md` — implementation plan
- `tasks.md` — task breakdown and status

Identify which spec applies to the current work (match by feature name or branch context). Then summarize:
1. Current step / where we are in the plan
2. Key constraints and conventions specific to this feature
3. Acceptance criteria for the relevant task(s)
4. Any warnings or blockers noted in tasks.md

Be concise. Flag any ambiguity that would require clarification before proceeding.
