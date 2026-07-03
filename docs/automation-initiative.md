# Marvel Legendary — Automation Initiative (Handoff)

_Created 2026-07-03 by the cc-helper coordinator session. Purpose: transfer the full automation-exploration context into the Legendary project so the next phase is driven natively from here, not steered from outside. **Read this first — it points to everything else.** Detailed receipts live cc-helper-side (Section 8); this doc is self-contained on the operational essentials._

---

## 1. The goal (and its hard limit)

Explore where the expansion-build workflow can be automated to **simplify Paul's work — start small, expand later.** Not "automate everything."

**Hard constraint that bounds all of this:** card *behavior* is bespoke hand-coded JS (`cardAbilities.js` / `script.js`), NOT data-driven. Automation can only ever generate the **skeleton** — `cardDatabase.js` rows, `index.html` setup entries, asset/SW wiring. Every ability's logic stays manual. On the cleanest pilot the scaffolder handles only **~15–25%** of a build; the rest is irreducibly hand-coded. This is true on any expansion.

## 2. DONE — the game-test gate (merged to local master 2026-07-03)

The `/game-test` harness was hardened into an automated pass/fail gate and wired into Phase-4d.

- **What it is:** `gtRunTestCase(tc)` runs an "A2 TestCase" and computes a verdict — PASS / FAIL / ERROR / BLOCKED — via a **fail-closed ladder**: only all-green over ≥1 real machine assertion PASSes; every uncertain state (timeout, unvetted setup, human-route, undefined probe, empty assertions) routes to BLOCKED/ERROR/FAIL, never a silent pass. Replaces the old hand-typed ✅/❌.
- **Where:** `.claude/skills/game-test/SKILL.md` — sections A2 contract runner ("Executor CORE"), A3 console-check (`classifyConsole`), A4 popup auto-drive (`installGameTestHarness` / `gtInject.selections`), A5 injector (`gtInject`). Phase-4d in `.claude/skills/new-expansion/SKILL.md` now gates on the executor's verdict. A2 design spec: `docs/superpowers/specs/2026-07-03-gametest-assertion-contract-design.md`.
- **How well verified:** built piece-by-piece with live proof each step; adversarially cold-read (which found + fixed **3 silent-PASS holes** — empty-assertions→PASS, undefined-probe→PASS, loose console whitelist); re-verified clean; then proven to **FAIL a real bug** (B6 recruit over-credit: actual 6 vs expected 0) and **PASS a real working ability** (Thor "Surge of Power"). Commits `869fcb8..a6851c7`.
- **State:** on **local master, NOT pushed to origin** (commits are local-only). Pushing is Paul's deliberate step.
- **One minor open caveat:** `{by:'first'}` / `{by:'index'}` on `card-choice-city-hq` can hit shared-popup decoy elements → timeout. Prefer `{by:'name'}` there. Worth a one-line note in the A4 registry comment.

## 3. The reuse reframe — READ THIS, it changes the picture

The earlier "all 9 unbuilt expansions rate HARD" survey was **reuse-blind.** A full-context pass found the engine already implements the scary-looking subsystems — Shards, S.H.I.E.L.D. Officers, the Artifact zone, Cosmic Threat, capture-onto-villain, the transform lifecycle, the threat-counter idiom. Each expansion's real cost **collapses to the few genuinely-new systems that remain.**

- **Ranking (easiest → hardest): [`docs/expansion-reuse-difficulty-ranking.md`](expansion-reuse-difficulty-ranking.md).** Heroes of Asgard is actually the **easiest** (~80–85% reuse), not HARD.
- **Confidence caveat (from that doc):** the middle four expansions were reuse-scanned against live code (high confidence); the top/bottom are survey estimates biased HIGH.
- **Implication:** building expansions is far cheaper than the thin survey implied. This reopens "how much is even worth automating, and which expansion."

## 4. Recommended automation roadmap (from the full-context analysis)

Source: cc-helper `expansion-automation-analysis.md`. The analysis **reordered** the plan:

1. **FIRST — three small, zero-risk tools** (bigger near-term ROI than the scaffolder; they also double as the scaffolder's own verification layer, and help on already-shipped expansions today):
   1. **SW-cache regenerator + auto-`CACHE_NAME`-bump** → eliminates the documented #1 deploy bug ("changes don't show on GitHub Pages"). Fold into `/deploy`. **Highest ROI of anything here.**
   2. **DB↔inventory consistency linter** (read-only; reusable on the shipped expansions).
   3. **Image-path resolver.**
2. **THEN — the mechanical scaffolder** (DB rows + setup HTML + SW wiring), on the pilot chosen in Section 5.

## 5. Which expansion first — OPEN, two lenses that disagree

- **Scaffolder-data-shape lens → New Mutants.** Cleanest card-data shape (standard types, no new card type, small set). The one worry — dual-base `0+/0+` Warlock cards — was verified fine (engine already ships dual-icon cards, e.g. Throg). Best case for *validating the scaffolder*.
- **Build-effort / reuse lens → Heroes of Asgard.** Easiest full build (~80–85% reuse). Best case for *cheapest actual expansion to ship*.

These answer different questions. **Reconcile with Paul before committing.** The reuse finding is newer and fuller-context; weight it. `[open decision]`

## 6. Implementation gotchas

- **Count-check trap:** heroes store **4 card DEFS per hero** (rarity Common / Common 2 / Uncommon / Rare), NOT 14 rows — the 5/5/3/1 copies are applied at deck-build from `rarity`. Any "DB count == inventory" check must count **distinct defs per rarity**, not raw copy totals (14/100).
- **Scaffolder scope** is ~15–25%; don't over-promise it.

## 7. New bug findings logged this session (in `known-issues.md`)

- **B21** — S.H.I.E.L.D. officer-gain paths (`drawSHIELDOfficer`, `moveShieldOfficerToHand`) `pop()` the master template array `shieldOfficers`, not the live `shieldDeck` → cross-game officer-pool state-bleed. Code-traced by 2 scouts, not reproduced live; line numbers scout-cited (verify at fix time). Deferred to the base-code branch.
- **B11 correction** — Mole Man `hq2ReserveRecruit += 6` does NOT reproduce in shipped content (the only shipped resize, Earthquake LEFT-add, makes two offsets cancel); wrongness is only reachable via unshipped RIGHT-add content. Re-tag B11 as latent-only, or fix its "wrong under Earthquake" example.

## 8. Detailed receipts (cc-helper side, read-only reference)

- `cc-helper/docs/legendary-automation/expansion-difficulty-survey.md` — the thin-scout difficulty survey. **Superseded by the reuse ranking (Section 3) for difficulty judgments.**
- `.../expansion-automation-analysis.md` — the full-context pilot analysis (source of the Section 4 roadmap).
- `.../2026-06-25-automation-prep-grounding.md` + `2026-06-25-swv1-coordinator-facts.md` — original grounding (machine-checkable done-criteria for scaffolder phases; game-test hardening targets — now mostly built).
- `.../shield-build-readiness.md` — SHIELD scout note (SHIELD = complex; not a scaffolder pilot).

## 9. Status — decided vs open

**Decided / done:** the game-test gate is built, adversarially verified, and merged to local master. Usable now for any local build.

**Open — Paul's calls:**
- Push local master (8 commits) to origin? (Deliberate step; not done.)
- Which expansion/tool to tackle first (Section 5 reconciliation; the three tools in Section 4 vs the scaffolder).
- Whether the modest scaffolder payoff (~20%) is worth building at all vs. just shipping the 3 verification/wiring tools (esp. the deploy-bug fix, which stands on its own).

**Next session:** start from this doc + the reuse ranking. Pick the first concrete tool/expansion with Paul, then build → verify (the game-test gate now backs you) → iterate.
