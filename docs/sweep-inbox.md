# Sweep Inbox — raw capture & staging

> **Status:** ACTIVE · created 2026-06-19 · the staging surface for `/legendary-sweep`.
> A holding pen for cross-expansion domain learnings pulled from session transcripts.

## What this file is

A **holding pen** for newly-noticed domain learnings — reusable code patterns, design/rules-decision precedents, in-session discoveries (bugs/corrections/gotchas), and recurring pre-flight gaps. Capture is cheap and append-only.

## What this file is NOT

**It is staging, not a recall surface.** Nothing here auto-loads into any session. An item protects against nothing until it is promoted out of this file to its canonical home. The inbox exists to be **drained toward empty**, not to accumulate.

## What this sweep is FOR (and not)

This sweep is deliberately narrow. Legendary already documents well — `/plans`, `/specs`, `expansion-mechanics/`, `expansion-progress/`, `known-issues.md`. The sweep does **not** duplicate those. It captures the two things those docs miss:

1. **Cross-expansion reuse memory** — the "we already solved this in expansion X, reuse the pattern/precedent" thread that no single per-expansion doc owns.
2. **In-session discoveries that never got written down** — bugs found while fixing, corrections made while testing, conventions established on the fly. These live in the transcript but evaporate from memory when a session is cleared.

## The three fates (every item ends as exactly one)

1. **Promoted** → graduates to its canonical home (see routing table) → **deleted from inbox.**
2. **Pruned** → not durable → **deleted from inbox.**
3. **Pending** → stays *only* until it earns a verdict.

A healthy inbox holds **only category 3** (+ `#pin`).

## Capture format

One line per item: a date, one tag, a one-line statement, optional detail.

```
- YYYY-MM-DD #tag — <one-line statement>. <optional detail / why it matters>.
```

**Tags:** `#pattern` (reusable code pattern / helper / recurring-bug rule) · `#decision` (rules-interpretation or design-decision precedent) · `#gotcha` (empirical in-session discovery not yet in any doc) · `#gap` (recurring deferred item / pre-flight gap spanning expansions). Add `#pin` as a second tag to mark an item **durable even if rare** (exempt from dwell-time pruning).

## Promotion targets (route each keeper)

Promotion is **consolidation, not addition** — refine the existing rule at the destination; never add a parallel second rule.

| Kind of learning | Canonical home |
|---|---|
| Deep engine code trap / reusable pattern (`#pattern`, `#gotcha`) | `docs/engine-gotchas.md` (on-demand reference; CLAUDE.md keeps only highest-frequency rules inline + a pointer) |
| Cross-expansion design/rules-decision precedent (`#decision`) | `docs/expansion-decisions.md` |
| Card-content rules ruling | `docs/rules-notes/` (cited to source) |
| Recurring pre-flight gap across expansions (`#gap`) | `docs/known-issues.md` (or a pre-flight checklist consumed by `/analyze-expansion` / `/new-expansion`) |
| Data / inventory convention | `docs/card-inventory/card-reading-rules.md` |
| CC/workflow meta-learning | **NOT here** → cc-helper's global `learning-sweep` |

---

## Capture log

<!-- Append new items below this line. Newest at top. Drain toward empty. -->

<!-- DRAINED 2026-06-20: the full-backfill run's ~40 captures + the 13 trial items were all promoted (docs/engine-gotchas.md, docs/expansion-decisions.md, docs/known-issues.md) or pruned (already in CLAUDE.md / rules-notes). Inbox is empty by design — see git history for the captured set if needed. -->
