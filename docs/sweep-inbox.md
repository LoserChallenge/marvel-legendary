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

<!-- DRAINED 2026-07-04 (Pass A+B, single run): 11 new transcripts swept (9 main-dir 07-03/04 efficiency-initiative/reuse-scout/linter-build/game-test-readiness + 2 base-code-fixes worktree 07-04 B1/B6/B8/B23 fixes; current live session excluded). ~60 raw candidates extracted via 3 Sonnet batches. THIN net yield BY DESIGN — those sessions documented as they went, so nearly everything was already in a canonical home (verified in-doc): all SWV1 decisions in expansion-decisions.md, B6/B11/B20/B21/B22/B23 in known-issues.md, skrulled-shared-flag + villain-attack-slots + transform-and-defer-VP + splice-by-identity in engine-gotchas.md, 0+ notation in card-reading-rules.md. PROMOTED 3 (Paul-approved): engine-gotchas.md ← busy-lock-across-await (B1 async discipline) + state-injection-vetted-setter (window.x no-ops on let bindings → false-pass); card-reading-rules.md ← inventory-verify-vs-DB-linter-are-different-links (B22). SKIPPED per Paul: the gain≠recruit / real-play-frequency ruling heuristic (edge-case rulings stay per-case, decided each time — not enshrined). ROUTED OUT to cc-helper's learning-sweep (CC/workflow-meta): game-test silent-pass verdict-holes, popup-visibility detection, validate-tool-against-shipped-data, /goal-vs-cc-goal methodology. Inbox empty by design; transcripts are the permanent record. -->

<!-- DRAINED 2026-06-29 (Pass B): all 80 captured items (Secret Wars Vol. 1 build, 06-22 → 06-29) resolved. PROMOTED → engine-gotchas.md (~49 engine traps across Mastermind/Secondary-masterminds/Villain-escape/Counters/Played-cards/KO/Scheme-twists/City-resize/DOM-setup/Misc-helpers: secondary-mastermind handling, villain-escape bystander orphaning, off-grid attack/Bribe pipeline, provisional-grant floor-at-0 clawback exploit class, cross-game initGame state leaks, reusable helpers/templates [stampCardsAsInDeckVillains, koControlledHeroByIdentity, gainSidekick, punisherHailOfBullets, CaptainAmerica color-count], keyword-grant Teleport cleanup, dual-class classes-array safety); expansion-decisions.md (8 precedents: deck-top-villain popup-fight model, hybrid noRulesText predicate, non-Location "each other player" handling, Teleport rider-fire rule, ascending-villain-not-an-escape, base-bug fix-branch rule, scheme-scope SKIP-vs-DEFER gate, no-Epic-side masterminds); rules-notes/secret-wars-vol1.md (Annihilation Wave → M.O.D.O.K. printing-error rationale); known-issues.md (new base bug B20 — "Build an Army of Annihilation" loss mechanic snapshot-vs-additive → 10-loss unreachable); expansion-asset-pipeline.md (worktree staging-copy gotcha). PRUNED as already-canonical: items covered by existing engine-gotchas (defeatBonuses hub, attack-twin reads) + expansion-decisions (Multiple-Masterminds, Epic-MM modeling) + rules-notes secret-wars-vol1 (BATCH 6/7/8/10 — Ghost Racers KO zone, Dark Alliance pool, Bystander-Stack source, Pan-Dimensional Plague slot-keyed, Untouchable-defeat-stands, Teleport card-content) + known-issues B6/B12/B19. MERGED into kept entries: 61→60, 64→67, 123→73. ROUTED OUT to cc-helper (CC/workflow meta, out of this sweep's scope; cc-helper's own learning-sweep reads the same transcripts): items 65, 90, 97, 110, 125 — note 65 (static audit can't observe runtime behavior) is also structurally addressed by the new /new-expansion Phase-4d hero-ability behavioral gate added 2026-06-29. Inbox empty by design; transcripts are the permanent record. -->

<!-- DRAINED 2026-06-22 (Pass B): all 31 captured items resolved. PROMOTED → expansion-decisions.md (derive-mechanic-novelty-from-code-search, w/ Shards example) and card-reading-rules.md (title-from-reference-not-filename; hero rarity→copy mapping + non-standard distributions; inventory pass-execution scaling). PRUNED as already-canonical in CLAUDE.md (reference-first protocol [#pin], class/team-from-alt-text, mastermind-tactic-VP-inheritance, checkEvilWins/updateEvilWinsTracker twin, console.log baseline=0, cumulative attack+recruit pattern, Phase-2.5 frozen specs). PRUNED as resolved/recorded in their inventory files (WWH Skaar=Strength, Infini-Tendrils 4+, Korg two-icons, spellings, Destiny Force notation, Sentry hero→MM transform, double-sided-no-Epic MMs, Feast/Trap! gap; New Mutants Karma=X-Men; SHIELD Taskmaster printed 3+/4 + Ranged→Range already done; Messiah Silver Samurai, Evil Clones=Hero Deck, Boom-Boom 0+, Epic Bastion="enemies"). PRUNED as out-of-scope → cc-helper learning-sweep (Phase-3 game-test gating, auditor blind-compare definition fix, reuse-scout verdict gate, doc line-number drift, console-capture-harness detail, engine-gotchas-vs-CLAUDE.md-not-duplicates). One domain item remains tracked in its OWN draft, not here: Weapon X villain per-card copy counts (needs a physical card count) — owned by docs/card-inventory/drafts/weapon-x.md. Inbox empty by design; see git history for the captured set. -->
