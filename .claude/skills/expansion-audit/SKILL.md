---
name: expansion-audit
description: Runs the full pre-merge audit pipeline on a Marvel Legendary expansion — engine-integration-auditor, expansion-validator, the six card-type auditors, and keyword-consistency-auditor — then consolidates all findings into a single severity-tagged catalog for triage. Use as the validation gate before merging an expansion to master (invoked by /new-expansion Phase 4), or standalone to re-audit an expansion. Trigger on "/expansion-audit", "audit this expansion", "run the audit pipeline".
---

# Expansion Audit

Orchestrates the expansion audit pipeline. You dispatch the auditor subagents, collect their findings, and consolidate them into one catalog. You do NOT fix anything — you produce the findings catalog and hand it to triage.

## Step 1: Prerequisites

Confirm for the named expansion `<expansion>`:
- Finalized inventory exists: `docs/card-inventory/final/<expansion>.md`
- Expansion JS file exists in the game code dir
- `cardDatabase.js` has the expansion's entries
- Engine-touchpoints reference exists: `docs/audit-pipeline/engine-touchpoints.md`

If the engine-touchpoints reference is MISSING, halt and tell the user: "Run engine-integration-auditor in bootstrap mode first — its Pass 1 will seed docs/audit-pipeline/engine-touchpoints.md." (The reference doc ships with the pipeline, so this should normally exist.)

If inventory or DB entries are missing, halt and report what's missing.

## Step 2: Engine integration (sequential, first)

Dispatch `engine-integration-auditor` for `<expansion>`. Capture its full output (new touchpoints + propagation gaps with `E-N` IDs). If it appended new touchpoints to the reference doc, that's expected.

Hold its gap findings — they become prompt context for the card-type auditors.

## Step 3: Expansion validator (sequential)

Dispatch `expansion-validator` against the expansion JS file. Capture its 7-rule output.

## Step 4: Parallel batch (seven subagents)

Dispatch these seven IN PARALLEL (single message, multiple Agent calls):
- `hero-card-auditor`
- `villain-card-auditor`
- `henchmen-card-auditor`
- `mastermind-card-auditor`
- `scheme-card-auditor`
- `misc-card-auditor`
- `keyword-consistency-auditor`

Pass each card-type auditor:
- the expansion name
- the engine-integration gap findings (the `E-N` list from Step 2) as context, so they can cite `RELATED: E-N`
- a note that the pattern-reuse catalog (if present) is in `docs/expansion-mechanics/<expansion>.md`

Pass `keyword-consistency-auditor` the expansion name (it reads the mechanics doc's keyword section itself).

## Step 5: Consolidate

Merge ALL findings into `docs/audit-results/<expansion>-<YYYY-MM-DD>.md` (use the real current date). Structure:

1. **Summary header** — expansion, date, totals by severity (H/M/L), each subagent run with pass/fail/issue-count
2. **HIGH severity** — every HIGH finding across all subagents, grouped by card (all issues for one card colocated)
3. **MEDIUM severity** — same grouping
4. **LOW severity** — same grouping
5. **Could not be audited** — cards/items needing manual review
6. **Engine touchpoints discovered this run** — any new ones the engine auditor appended

## Step 6: Report

Tell the user the catalog path and the headline numbers (e.g. "12 HIGH, 8 MEDIUM, 5 LOW across 6 auditors"). Suggest triage as the next step: walk HIGH findings in plain English, Paul makes the gameplay call (code wrong vs reference wrong), tag each Fix Now / Defer / Reject.

## Notes

- All auditors are static-analysis only. If a finding needs in-browser confirmation, that's a `/game-test` (Playwright) job during triage, not part of this skill.
- This skill reports; it never fixes.
