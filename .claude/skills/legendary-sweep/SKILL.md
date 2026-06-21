---
name: legendary-sweep
description: Periodic transcript-derived learning loop for the Marvel Legendary project. Reads recent session transcripts (main project dir + Revelations/other worktree dirs), captures cross-expansion domain learnings into docs/sweep-inbox.md, then promotes durable items to canonical homes and prunes dead one-offs. Invoke with /legendary-sweep, roughly per expansion or every couple weeks. Pass A capture is mechanical; Pass B promotion needs Paul's approval.
---

# Legendary Sweep

Reconstructs Marvel Legendary **domain** learnings from on-disk session transcripts instead of relying on live conversation memory — so no session can be "missed," including cleared ones. The Legendary counterpart to cc-helper's `learning-sweep` and the baseball project's `baseball-sweep`.

Two passes per run: **Pass A** captures new-transcript learnings into `docs/sweep-inbox.md` (the single staging surface); **Pass B** drains the inbox — promotes durable items to their canonical homes and prunes dead one-offs.

## Scope — what this sweep is FOR

Deliberately narrow. Legendary already documents well (`/plans`, `/specs`, `expansion-mechanics/`, `expansion-progress/`, `known-issues.md`). This sweep does **not** duplicate them. It captures only the two things those docs miss:

1. **Cross-expansion reuse memory** — the "we already solved this in expansion X" thread that no single per-expansion doc owns.
2. **In-session discoveries that never got written down** — bugs found while fixing, corrections made while testing, conventions set on the fly; they live in the transcript but evaporate when a session is cleared.

CC/workflow meta-learnings from these same sessions are captured separately by cc-helper's global `learning-sweep` — not here.

**State file:** `.claude/skills/legendary-sweep/sweep-state.json` — `{ "last_sweep": "YYYY-MM-DD" | null, "swept_sessions": [<session-id>, ...] }`. The `swept_sessions` ledger is the authoritative "already processed" record (a session-id is the transcript filename minus `.jsonl`).

## Pass A — Capture (transcripts → sweep-inbox.md)

### A1. Find new transcripts

The authoritative "is this transcript new" test is the `swept_sessions` ledger. The date floor is only a coarse scan bound, deliberately loose so a transcript dropped by a failed subagent gets another chance.

1. **Scan floor.** Read `sweep-state.json`; take `last_sweep` minus 10 days as the scan floor. If `last_sweep` is null (first run) or an argument supplies a date, use that instead. **First-run caution:** an unbounded first run processes the entire history (~35+ transcripts across both dirs) — for the first real run either pass a recent date arg, or decide with Paul whether to backfill all history or seed `swept_sessions` to "start from now."
2. **Already-swept set.** The `swept_sessions` array from `sweep-state.json`.
3. **Candidate transcripts.** Legendary work happens on the main project AND on git worktrees, each with its OWN transcript directory. Scan **both**:
   - `C:\Users\Paul\.claude\projects\D--Games-Digital-Marvel-Legendary-Claude-Code-marvel-legendary\`
   - every sibling dir matching `C:\Users\Paul\.claude\projects\D--Games-Digital-Marvel-Legendary-Claude-Code-marvel-legendary--worktrees-*\`
   Take top-level `*.jsonl` files with mtime on/after the scan floor. Exclude `*/subagents/*` files. A transcript is **new** if its session-id is not in `swept_sessions`.
4. If no new transcripts, skip to Pass B (still drain the inbox).

### A2. Distill, then extract via batched subagent fan-out

Raw transcripts are huge (2–4 MB each) — mostly tool results and system noise. **Never read a raw `.jsonl` into any model context.**

1. **Distill.** Run the bundled script on every new transcript, writing each result to a temp file (strips noise locally, zero model tokens, ~90% size cut):
   ```
   python "D:\Games\Digital\Marvel Legendary\Claude Code\marvel-legendary\.claude\skills\legendary-sweep\scripts\distill_transcript.py" <transcript.jsonl> > <temp-dir>\<session-id>.txt
   ```
   Retire the temp files to `D:\Claude Code\_to-delete\` when the run finishes.
2. **Batch.** Group the distilled files into batches of ~5 — amortizes per-subagent overhead, the dominant cost.
3. **Fan out.** Dispatch one **Sonnet** general-purpose subagent per batch, all in a single message (parallel). The orchestrator supplies each subagent its batch as a list of (distilled-file-path, session-id, session-date) triples (the orchestrator knows the date from the transcript's file mtime; the distiller does not preserve timestamps).

Each subagent prompt must be self-contained. For each distilled file in its batch, instruct the subagent to:

- Read the distilled file (already noise-stripped — never touch the raw `.jsonl`).
- Apply the **Legendary extraction lens** (below).
- **Return** (do NOT write files) one tagged candidate line per genuine learning, in the inbox capture format:
  ```
  - <session-date> #tag — <one-line statement>. <optional detail / why it matters>.
  ```
  Tags: `#pattern` · `#decision` · `#gotcha` · `#gap`. Add `#pin` as a second tag only for a rare-but-durable item (the orchestrator surfaces all proposed pins to Paul).
- If the session yielded no durable domain learning, return the single line `no learnings`.

**Why subagents return lines instead of writing the inbox:** parallel writes to one file race and clobber. The orchestrator (single context) collects every batch's lines and appends them serially.

### A3. Append to the inbox

The orchestrator:
1. Collects all returned candidate lines; drops `no learnings`; de-dups near-identical lines within this run.
2. Appends them to the **Capture log** section of `docs/sweep-inbox.md` (newest at top, below the append marker).
3. Adds every processed session-id to `swept_sessions` in `sweep-state.json` (a session is marked swept only after its lines are captured — preserves retry-safety).

### Legendary extraction lens

**Capture:**
- **Reusable code patterns / helpers** that recur or will recur across expansions — and recurring-bug rules ("when you add state to a villain card, check the clone pipeline"). Tag `#pattern`.
- **Design or rules-interpretation decision precedents** — the "we chose Option B and here's why" calls that a future expansion will face again (templated-vs-fixed henchmen, epic-variant modeling, scheme-count handling). Tag `#decision`.
- **Empirical in-session discoveries** not yet written in any doc — a bug found while fixing, a correction made while testing, a convention established on the fly. Tag `#gotcha`.
- **Recurring deferred items / pre-flight gaps** that span expansions — "expansions of type X always need hook Y that doesn't exist yet." Tag `#gap`.

**Exclude:**
- CC/workflow meta-learnings (captured by cc-helper's `learning-sweep`).
- Per-expansion status / progress narrative (belongs in `docs/expansion-progress/`).
- One-off rules lookups already cached in `docs/rules-notes/`.
- Anything already written into a `/plan`, `/spec`, the expansion's own `expansion-mechanics/` or `expansion-progress/` file, or `CLAUDE.md`.

## Pass B — Promote & Prune (drain the inbox)

Runs in this session (not a subagent — needs Paul's interactive approval). Reviews the **whole** inbox, not just this run's captures, so recurrence across sweeps drives promotion.

### B1. Read the inbox capture log

Read every item in `docs/sweep-inbox.md`'s Capture log.

### B2. Decide each item's fate

- **Promote** — durable, or recurring across sweeps → route to its canonical home (table below).
- **Prune** — a one-off (no `#pin`) whose capture date is older than ~3 sweeps and that has neither recurred nor earned a verdict. **Never prune a `#pin` item on dwell time.**
- **Keep pending** — genuinely still awaiting a verdict.

**Promotion targets:**

| Kind of learning | Canonical home |
|---|---|
| Deep engine code trap / reusable pattern (`#pattern`, `#gotcha`) | `docs/engine-gotchas.md` (on-demand reference; promote a truly every-session rule inline to `CLAUDE.md` only if it earns the auto-loaded slot, else point at engine-gotchas) |
| Cross-expansion design/rules-decision precedent (`#decision`) | `docs/expansion-decisions.md` |
| Card-content rules ruling | `docs/rules-notes/` (cited to source) |
| Recurring pre-flight gap across expansions (`#gap`) | `docs/known-issues.md` (or a pre-flight checklist for `/analyze-expansion` / `/new-expansion`) |
| Data / inventory convention | `docs/card-inventory/card-reading-rules.md` |

Quality rules:
- **Promotion is consolidation, not addition** — refine the existing rule at the destination; never add a parallel second rule.
- **Contradictions are not bugs.** When two items conflict, document *when each applies*.
- **Surface what's working**, not only corrections.
- Flag any candidate that would touch a stable-mode foundation doc (e.g. `golden-solo-history.md`) for Paul rather than auto-editing.

### B3. Present candidates

For each promote/prune proposal: **what it is** (one plain-English sentence), **why it matters** (one sentence), **fate + destination**. Number them. Then ask:

> "Approve all, skip specific numbers, or redirect any?"

### B4. Apply approved items

- **Promote:** append/refine at the destination. **Check the destination first — never duplicate an item already present** (refine the existing line instead).
- **Drain the inbox (MANDATORY):** delete every **promoted** and **pruned** item from `sweep-inbox.md`, **including residue from prior runs** — an item whose content already sits in its canonical home gets deleted now even if it was promoted in an earlier sweep. Keep `#pin` items and genuine still-pending items.

## Finalize

1. Update `sweep-state.json`: set `last_sweep` to today's date; `swept_sessions` already updated in A3.
2. Report a short summary: items captured in Pass A; items promoted/pruned in Pass B and where; **inbox size before → after**.
3. **Verify the drain actually happened.** Re-read `sweep-inbox.md` and confirm the Capture log holds ONLY `#pin` + genuine still-pending items. If any promoted/pruned line remains, delete it before declaring done.

## Rules

- **Transcripts are the permanent raw record.** The inbox is a holding pen, not an archive — drain it toward empty.
- Never auto-apply Pass B promotions without Paul's approval.
- Always distill before reading (A2). Never read a raw `.jsonl` into any model context.
- Scan BOTH the main project dir and its `*--worktrees-*` sibling dirs (A1) — Legendary's expansion work often happens on a worktree.
- CC/workflow meta-learnings route to cc-helper's `learning-sweep`, not here.
