# Pre-Automation Readiness Sweep

**Date:** 2026-07-03
**Author:** worker session (marvel-legendary, master @ `b12797b`)
**Purpose:** Independent inventory of everything that should be fixed / reviewed / hardened **before** an automation layer (`/goal`-driven mechanical scaffolding + a later `/game-test`-gated test-fix loop) is introduced into the expansion-build workflow. **Enumeration only — no code changed.**

**Method:** built from live code + docs as they stand **today, post-SWV1-merge**. Cross-checked (not inherited) against the pre-merge grounding doc `D:\Claude Code\cc-helper\docs\legendary-automation\2026-06-25-automation-prep-grounding.md` (2026-06-25). Where I verified something on disk, the item says "verified."

**Severity legend:**
- **BLOCKER** — automation would produce false confidence, corrupt state, or silently fail without this. Do not automate the affected step until fixed.
- **SHOULD-FIX** — automation runs but is degraded: friction, wrong results, or needs a human babysitting it. Fix before leaning on it.
- **NICE-TO-HAVE** — polish / low-frequency / cosmetic.

**The one-line bottom line:** the *mechanical scaffolding* phases (card-data→DB, setup wiring, asset/SW wiring, syntax + count checks) are close to automatable — but they verify *structure and counts, not content correctness* (C6), so they still need a human content-check before running unattended. The `/game-test`-as-auto-gate half is **not ready** — the single true blocker is **no machine pass/fail contract (A2, verified absent)**; assertions are prose a human eyeballs. Phase-4d makes that gate mandatory on every hero ability, so **nothing downstream of 4d can be safely automated until the harness fails closed.** (Stale-build risk (A1) is real but low-frequency in the local flow — a mandatory precondition before *unattended* gating, not the frequent blocker the Revelations baseline implied.)

---

## A. game-test harness readiness

The harness is written for a **human operator applying judgment** ("always check", "recommend to Paul", "confirm before trusting"). An unattended `/goal` loop has no such judgment. Every advisory below has to become an *automatic precondition or post-assertion that fails closed* before a `/game-test` pass is trustworthy enough to gate on.

### A1 — No stale-build freshness gate · **SHOULD-FIX** (→ BLOCKER-class precondition the moment gating goes unattended) · *re-tagged down from BLOCKER 2026-07-03*
- **What:** Chromium's HTTP cache can serve stale `script.js`/`cardAbilities.js`/`expansion*.js` even across a fresh port/process. A fix-on-disk isn't reflected and the test passes against old code.
- **Reconciliation (why re-tagged):** the SWV1 coordinator's firm in-build data (`…swv1-coordinator-facts.md` "game-test incidents", line 14) records **no local stale-serve false-pass recalled across the entire SWV1 build** — the local flow serves via a local HTTP server, and tests use deterministic `browser_evaluate` injection (often monkey-patching the real fn into `window`), which sidesteps the HTTP cache. The "#1 false-confidence source" framing was inherited from the *Revelations* grounding; the actual #1 in-build reliability problem was the **popup/softlock deadlock (A4)**, per the same firm note. So A1's observed frequency is LOW, not #1.
- **Does it collapse into A7?** No — verified distinct. A1 = same serve-root, **HTTP-cache serves stale** (SKILL.md lines 81–82 document this explicitly, separate from the Service Worker and from GH-Pages). A7 = **wrong serve-root** resolves to the `master` folder instead of the worktree. Different mechanisms, both real.
- **Why it still matters for autonomy:** exactly one hard local instance exists (Revelations R2-10, a real false-pass on cached code). The damage mode is **silent greenlight** — an unattended loop can't catch a stale-code pass by eye. So the freshness assertion is *cheap insurance against a rare-but-high-damage* failure → mandatory **before** a fully unattended gate, even though it's not a frequent live problem in the attended flow today.
- **What it needs:** inject a unique build marker on disk → assert via `<function>.toString()` (or served-content hash) BEFORE trusting any assertion; hard-fail "could not confirm fresh build." Cheap, and it also subsumes A7's freshness check.
- **Source:** `.claude/skills/game-test/SKILL.md` lines 80–84; reconciled against `D:\Claude Code\cc-helper\docs\legendary-automation\2026-06-25-swv1-coordinator-facts.md` line 14.

### A2 — No explicit pass/fail assertion contract · **BLOCKER** · *verified absent 2026-07-03*
- **What:** Phase 2.5 "executable assertions" are free-form English ("Set up state S → play the card → assert observable result R"). There is no standard harness that runs an assertion and emits a machine-parseable PASS/FAIL verdict. Results are recorded as hand-typed ✅/❌ plus screenshots.
- **Verification (not just inferred):** grepped the whole project for `assert(`/`expect(`/`verdict`/`PASS/FAIL` in a runner sense and for any `test/`/`harness/`/`assertions/` dir or `.js` runner → **none exists**. Every hit is prose in docs/skills. Sampled the SWV1 spec directly: the "Executable assertion" fields are natural-language ("trigger Apocalyptic Magneto Escape → assert a 2nd active mastermind exists occupying a 2nd board slot…") — human-executed, human-judged. Results in `docs/playwright-runs/` are screenshots + a hand-written `consolidated-dual-mode-results.md`. The "executable" naming is aspirational; there is no code form.
- **Why it blocks:** a test-fix loop that "gates on a `/game-test` pass" has nothing structured to gate on — a human reads the prose assertion, drives the state, eyeballs the delta, and types the verdict. Automate that and you're automating the eyeballing, which is where false passes live.
- **What it needs:** a fixed assertion API (setup fn → action → expected observable → boolean verdict + captured actual) the loop calls, so pass/fail is deterministic and logged, not narrated. **This is the single true BLOCKER for the auto-gate half.**
- **Source:** `.claude/skills/new-expansion/SKILL.md` line 133; `docs/expansion-specs/secret-wars-vol1.md` (assertion fields); `docs/playwright-runs/` (result format).

### A3 — sw.js 404 whitelist + console-error check are advisory, not codified · **SHOULD-FIX**
- **What:** the skill says "ignore the known `sw.js` 404 in local-serve mode… Flag anything else" and "always check dev-tools console after every invocation." Both are human judgment calls, not automatic gates.
- **Why it complicates:** silent upstream failures (a `try/catch → console.error` with no on-screen signal) produce a test that *looks* like it passed while the function actually threw. For autonomy this must be a mandatory post-assertion: fail the gate on any unexpected `console.error`/`console.warn`, whitelisting only the `sw.js` 404.
- **Current state:** advisory prose in two places; no automatic console-error gate.
- **What it needs:** codified whitelist (the sw.js 404 path pattern) + auto-fail-on-unexpected-console-error step.
- **Source:** `.claude/skills/game-test/SKILL.md` lines 49, 89.

### A4 — Popup auto-dismiss / selection-driving · **RESOLVED 2026-07-03** (`harness-hardening` branch)
- **What:** all three parts landed. (a) 100ms auto-dismiss interval + in-page `Promise.race` hard-timeout (env survives, fast labelled failure). (b) **selection-driving** — `installGameTestHarness()` drives the intended `.popup-card` (by name/index/id) then confirms via the real play path; card-choice popups are queue-driven, never blind-confirmed (a blind confirm on a multi-select picker resolves the pick as "nothing"). (c) **re-install-after-navigation** — idempotent installer, re-called after any reload (which wipes it).
- **Verified live** (whatif, real `KO1To4FromDiscard` picker): named-pick-not-default; re-entrant 2nd-use of the shared popup; empty-queue → `POPUP-TIMEOUT` at ~2s, env alive, no wrong pick; post-reload re-install drives correctly. Fail-closed preserved — an undeclared/unmatched selection is never guessed.
- **Residual (NOT A4):** sibling selection popups (`order-choice`/`draw-choice`/`card-choice-city-hq`) still blind-auto-confirm — same risk class, tracked in the game-test SKILL.md scope note.
- **Source:** `.claude/skills/game-test/SKILL.md` `installGameTestHarness()`; `docs/known-issues.md` §5 T1.

### A5 — No vetted state-injection helper (binding + implicit-global traps) · **SHOULD-FIX**
- **What:** `citySize`/`totalAttackPoints`/`cumulativeAttackPoints`/etc. are top-level `let`, NOT window-aliased — `window.citySize = 7` silently no-ops. Writing `globalName = value` creates an implicit global that *masks* missing-initialization bugs (a `transformScheme()` diagnostic passed this way while the real game crashed).
- **Why it complicates:** free-form `browser_evaluate` assignments are the trap; an auto-runner doing ad-hoc injection will hit both and either fail to set state or mask the very bug under test.
- **What it needs:** a fixed injection API that assigns to lexical bindings correctly and, for cold-start tests, does `window.<name>=undefined; delete window.<name>;` to force the real init path. Encode it; forbid free-form eval injection in the loop.
- **Source:** `.claude/skills/game-test/SKILL.md` lines 86–89.

### A6 — No seedable RNG for randomness-dependent flows · **SHOULD-FIX**
- **What:** scripted multi-turn runs are unreliable under RNG; the skill's own guidance is "play the game" for these.
- **Why it complicates:** an auto-gate must classify RNG-dependent assertions as human-playtest-only and NOT auto-pass them — but nothing enforces that routing, so a flaky assertion could report a spurious pass/fail.
- **What it needs:** either seedable RNG (deterministic multi-turn) or an explicit fail-closed carve-out that routes RNG-dependent assertions to a human. No seeding exists today.
- **Source:** `.claude/skills/game-test/SKILL.md` line 75.

### A7 — Worktree serve-path trap · **SHOULD-FIX** (overlaps A1)
- **What:** rooting the HTTP server at an **absolute** path can resolve to the MAIN folder (`master`) and serve stale code without the branch's changes — you verify against the wrong code.
- **Why it complicates:** an expansion build runs on a worktree; if the runner serves the wrong root it silently tests master. Must use a branch-relative root + assert the served build has the branch's changes.
- **Source:** `.claude/skills/game-test/SKILL.md` line 84.

### A8 — Structural-vs-geometry DOM detection · **NICE-TO-HAVE**
- **What:** broken images collapse layout, so `offsetParent`/bounding-box tests read DOM state wrong; use structural selectors + `getComputedStyle(el).display`.
- **Why minor:** already well-documented; only bites if the runner falls back to geometry. Encode the approved selector set.
- **Source:** `.claude/skills/game-test/SKILL.md` lines 95, 106.

### A9 — Single-threaded server breaks screenshot art · **NICE-TO-HAVE**
- **What:** Python `http.server` bursts throw `ERR_CONNECTION_REFUSED`, breaking card art. Counts/DOM/logic unaffected.
- **Why minor:** only matters if a gate reads *visual* state; logic gating is unaffected. Use a threaded server for screenshot-dependent runs.
- **Source:** `.claude/skills/game-test/SKILL.md` line 94.

---

## B. Phase-4d gate vs harness state (the crux)

### B1 — Phase-4d mandates dual-mode runtime `/game-test` on EVERY new hero ability, but the harness that runs it is a manual babysit · **BLOCKER for anything downstream of 4d**
- **What:** Phase 4d ("Hero-Ability Behavioral Sweep") is a **hard done-criterion**: every new hero ability gets a runtime behavioral `/game-test` — no hero ships on static audit alone — and a FAIL or *missing run* blocks the merge gate. Dual-mode (`golden` AND `whatif`) for any conditional/computed/per-X ability.
- **Why it blocks:** running that gate needs everything in Section A to fail closed — freshness (A1), a pass/fail contract (A2), console gating (A3), selection-popup driving (A4), safe injection (A5). Today none of those is automatic. So 4d is, right now, a **human-in-the-loop** gate: a person drives the state, watches the delta in both modes, and judges. An auto-runner would risk a stale-build false pass, a selection-popup stall, or a masked-init false pass — on the single gate that exists specifically because static audit missed real bugs (SWV1 Magik "Dimensional Portal" granted +0; Old Man Logan "Loner" residual — both passed `/expansion-audit`, caught only in playtest).
- **Implication:** you *can* automate Phases 0–2 and 4a–4b (mechanical, objective). You **cannot** automate 4d — or a test-fix loop that gates on it — until the harness is hardened. Honest verdict: **4d is a manual babysit today.**
- **Source:** `.claude/skills/new-expansion/SKILL.md` lines 274–296; grounding doc §4.

### B2 — 4d state injection is judgment-heavy per ability (not mechanical) · **SHOULD-FIX / inherent**
- **What:** 4d step 1 = "inject a state that exercises the ability (N Sidekicks for a per-Sidekick bonus, a KO-eligible target, a known draw pile)." Choosing *what state exercises THIS ability* is bespoke reasoning, not a template fill.
- **Why it complicates:** automation can template the common shapes (flat +Attack, +Recruit) but novel/conditional abilities need an authored assertion — which loops straight back to A2 (no executable contract). The judgment doesn't vanish; it moves into spec authoring.
- **Source:** `.claude/skills/new-expansion/SKILL.md` lines 284–289.

---

## C. /new-expansion pipeline (what an auto-runner would trip on)

### C1 — Only Phases 0–2 and 4a–4b are cleanly machine-checkable; 2.5 and 3 are the judgment core · **SHOULD-FIX (scope boundary)**
- **What:** Phase 0 pre-flight, Phase 1 (card data + images), Phase 2 (setup wiring), Phase 4a (audit ran + merge gate), Phase 4b (`node --check`) have objective done-states. Phase 2.5 (spec authoring), Phase 3 (effect code), Phase 4c/4d (dual-mode + hero sweep) are judgment/execution.
- **Why it matters:** the automation scope must be drawn at 0–2 / 4a–4b. Crossing into 2.5/3/4d is where bugs live. This is the intended boundary, not a defect — but automation must *encode* it so a `/goal` run doesn't wander past it.
- **Source:** grounding §3; `.claude/skills/new-expansion/SKILL.md` phase structure.

### C2 — Phase-1 "card count in DB == inventory count" gate breaks on non-1:1 card structures · **SHOULD-FIX**
- **What:** the count-match check assumes 1 inventory row = 1 DB entry. Several *finalized-but-unbuilt* expansions violate that: World War Hulk (15 transforming heroes with 1–3 extra transform cards each; 6 double-sided masterminds), Messiah Complex (4 clone heroes on a non-standard 4/4/4/2 rarity distribution), SWV1 precedent (dual-class 2-element `classes` arrays). New Mutants (Warlock dual 0+/0+ Tech cards).
- **Why it complicates:** a naive auto-count gate will false-alarm (transform cards look like "extra" DB entries) or false-pass (miscount collapses two rows to one). The next expansion's card structure has to be inspected before the count gate can be trusted.
- **Source:** `docs/expansion-pipeline-status.md` notes for WWH (line 106), Messiah (94), New Mutants (100); grounding §3 Phase 1.

### C3 — Phase-2 script-tag insertion is load-order-dependent and only presence-checkable · **SHOULD-FIX**
- **What:** the new `expansion[Name].js` `<script>` must be added "in sequence" inside a nested `onload` callback chain in `index.html`. A grep confirms the tag *exists*; it can't confirm it's in the right position in the chain, and a wrong position breaks loading silently.
- **Why it complicates:** auto-insertion into a hand-ordered nested-onload chain is fragile; the machine check (grep) gives false confidence that wiring is correct when only presence was verified.
- **Source:** `.claude/skills/new-expansion/SKILL.md` line 81.

### C4 — Phase-4a merge gate needs a stable catalog format + human triage · **SHOULD-FIX**
- **What:** the merge gate ("HIGH == 0, OR every HIGH has a documented Defer rationale") is parseable from the audit catalog Summary table — but the triage step ("user makes the gameplay call: is the CODE wrong or is the card-text stale?") is irreducibly human.
- **Why it complicates:** an auto-runner can detect HIGH>0 but cannot *resolve* a HIGH finding (that's a rules/gameplay judgment). Automation can gate on the count but must hand triage to a human; and the parse depends on the catalog Summary-table format staying stable.
- **Source:** `.claude/skills/new-expansion/SKILL.md` lines 250–258.

### C5 — `node --check` is a hook (fires on Edit/Write), not a runner-invoked step · **SHOULD-FIX**
- **What:** the JS syntax safety net is a `PostToolUse` hook that runs `spawnSync('node', ['--check', file])` after every Edit/Write. Verified in `.claude/settings.json` (PostToolUse matcher `Edit|Write`).
- **Why it complicates:** (1) if automation writes files by any path *other* than Edit/Write, it bypasses the check entirely; (2) the hook signals failure via stderr + exit 1 — the runner must actually *read and act on* that, not assume silence = success; (3) the hook calls bare `node`, which resolves in the hook environment but **not** in the Bash tool (see F1) — so a runner shelling `node --check` directly will fail.
- **Source:** `.claude/settings.json` PostToolUse; CLAUDE.md "Platform & Constraints."

### C6 — The mechanical-scaffolding checks verify structure/counts, NOT content correctness · **SHOULD-FIX**
- **What:** every "safe to automate" done-check in Phases 0–2 / 4a–4b is structural or a count, never a field-value comparison:
  - Phase 1 gate = "card count in DB == inventory count" (a **count** match).
  - `node --check` = **syntax** only.
  - image `image:` paths = **exists on disk**, not "is the right image."
  - Phase 2 setup wiring = **presence-grep** per card name (count match).
- **The gap:** a card entered with the **wrong class, wrong cost, wrong attack/VP, or the wrong ability-function name** passes every one of these — the count still matches, the syntax is still valid, the path still resolves. Nothing in the automatable set compares inventory field → DB field. Content correctness is currently caught only by (a) the **human** Phase-1 checkpoint ("does this match what you'd expect?") and (b) the Phase-4a audit — which runs *after* effects are written, far downstream of scaffolding.
- **Why it matters for automation:** a `/goal` scaffolding run that silently writes a wrong stat produces a green mechanical pass and corrupts the build; it surfaces only at the audit or in playtest. The reference-first discipline makes this *closable* (inventory is authoritative and machine-comparable, so a field-level inventory↔DB diff is buildable) — but that diff is **not** part of the current checks. Until it is, auto-scaffolding still needs a human content-check checkpoint before it can be trusted unattended.
- **Source:** `.claude/skills/new-expansion/SKILL.md` Phase 1/2 checks; grounding §3 (checks enumerated as counts + path-resolves + node --check).

---

## D. Open bugs / deferred issues live on master that could block or corrupt an automated build

### D1 — B1: Golden Solo recruit-race duplicates a unique card (state-corrupting) · **BLOCKER for trusting automated Golden-Solo game-tests**
- **What:** CONFIRMED symptom; a unique 1-copy Rare appears 3× (HQ + 2 discard). Root cause diagnosed (recruit-flow race: stale closure index splice + `isRecruiting` cleared on a 500ms timer, not on async completion) but **NOT fully locked** — the 3-instance mechanism is untraced.
- **Why it blocks:** it fires on *any* Golden Solo recruit whose branch runs >500ms (popups, bystander rescue, Wall-Crawl awaits). An automated game-test that drives Golden Solo recruit flows can trip this mid-run → nondeterministic state corruption → false fails and un-reproducible results. Highest-priority base bug, unpatched on master.
- **Source:** `docs/known-issues.md` §2 B1 (lines 50–60).

### D2 — B20: Build-an-Army-of-Annihilation loss mechanic wrong (Twist-4 loss unreachable), live on merged SWV1 · **SHOULD-FIX**
- **What:** CANDIDATE, game-test-confirmed wrong at Twist 3 — evil-wins uses a per-twist snapshot instead of additive accumulation, so the 10-villain loss threshold is never reached. Unpatched; deferred to the base-code branch.
- **Why it complicates:** it's a known-wrong behavior in a *merged* expansion. An automated regression/test-fix loop that game-tests SWV1 will surface it and could either flag it as a new failure or "fix" it off-target. The runner must know it's known-and-deferred.
- **Source:** `docs/known-issues.md` §2 B20 (lines 177–181).

### D3 — Cluster of deferred base bugs unpatched on master (B4, B5, B6, B8-residual, B9, B10-guarded, B11, B19) · **SHOULD-FIX (awareness)** · *spot-verified still-live 2026-07-03*
- **What:** the "next base-code-branch batch" roll-up — all CANDIDATE, code-traced, deliberately unpatched, awaiting a dedicated base-code branch.
- **Spot-check (3 confirmed still live on master, not silently fixed):** **B6** — `recruitXMen()` (`cardAbilities.js:12659`) still does `totalRecruitPoints += hero.cost` after `recruitHeroConfirmed` with no offsetting deduction (`:12908`); **B11** — Mole Man still hardcodes `hq2ReserveRecruit += 6` (`expansionFantasticFour.js:2644`); **B19** free-recruit path — `doomHeroRecruit` still adds `hero.cost` post-confirm (`cardAbilities.js:11114`). `morgAmbush` (B4) function still present (`expansionFantasticFour.js:3193`). No downgrade.
- **Why it complicates:** any automated audit/test pass over the *base* game will re-surface these. Without a known-and-deferred manifest, the runner re-reports them as new findings or attempts fixes on master (violating the "fixes go on a base-code branch" discipline).
- **Source:** `docs/known-issues.md` §1 roll-up (lines 15–34) + §2.

### D4 — Deferred RULES questions still open (the late-ruling-→-rework class) · **SHOULD-FIX before any automated NEW-expansion build**
- **What:** three standing rules decisions: (1) "other player" effects cross-expansion pass (blanket-suppress vs case-by-case; interim per-card convention in place); (2) Kree-Skrull War villain-count (1-group cap vs 2-group requirement); (3) always-leads mastermind ↔ keyword-by-Location-name collision.
- **Why it complicates:** this is the exact failure that drove the Revelations bug volume — a ruling that settles *late* throws away build+verify cycles. An automated build has no judgment to catch an unresolved ruling; it will encode a guess into frozen specs. **Rule:** the next expansion's rules ambiguities must be resolved in `/analyze-expansion` (via `rules-oracle`) BEFORE the automated build starts.
- **Source:** `docs/known-issues.md` §3 (lines 191–227); grounding §1b; CLAUDE.md rule 8.

### D5 — B8 residual: skrulled/gainScarletWitchAsHero converter cancel-vanish, open rules sub-question · **NICE-TO-HAVE**
- **What:** the `gainAsHero`/`corruptSidekick` converter class is fully fixed on the merged SW branch, but the `skrulled`/`gainScarletWitchAsHero` instances are still CANDIDATE with an unsettled disposition (converted form has no printed VP). Very low frequency.
- **Source:** `docs/known-issues.md` §2 B8 (lines 112–124).

---

## E. Stale / misleading docs an automated runner (or we) might trust wrongly

### E1 — known-issues.md tells you to "verify B7 / B10 merged to master" — now stale (they ARE merged) · **SHOULD-FIX (doc)**
- **What:** B7 (Teleport keyword-strip) and B10 (`cityPermBuff[-1]` NaN guard) both say "verify it has merged to master before any base-code-pass work." SWV1 merged 2026-06-28. **Verified B7 is live on master** at `script.js:12194–12204` (hand-cleanup now strips the `"Teleport"` keyword). B10's guard shipped with SWV1 too.
- **Why it misleads:** a runner reading the "verify before touching this path" instruction might treat these as unresolved and redo or revert them.
- **Fix:** update B7/B10 status from "verify merged" to "merged (on master as of SWV1, 2026-06-28)."
- **Source:** `docs/known-issues.md` lines 108, 138, vs verified `script.js:12194`.

### E2 — known-issues.md header still frames SWV1 as the *active* build → base-code branch reads as PINNED · **SHOULD-FIX (doc)**
- **What:** the fix-discipline header (lines 5, 17) says fixes are "PINNED while an expansion build is active (currently Secret Wars Vol.1)." SWV1 is **merged**; no expansion build is active right now.
- **Why it misleads:** an automated runner (or a fresh session) reading this concludes a build is in flight and the base-code branch is pinned, when in fact the base-code batch is now **unpinned** and runnable.
- **Fix:** flip the header to "no active expansion build; base-code batch UNPINNED."
- **Source:** `docs/known-issues.md` lines 5, 17.

### E3 — pipeline-status.md is the "what's next" routing doc and is hand-maintained · **NICE-TO-HAVE**
- **What:** the SWV1 staleness flagged earlier was fixed in `b12797b` (table now shows SWV1 merged; I verified). No residual staleness found. But this is the doc an auto-runner keys "which expansion is next / what phase" off of, and it's entirely hand-updated.
- **Why it matters:** if a future automated phase forgets to update it, the next run routes off stale status. Low risk now; worth encoding a status-write step into any automation.
- **Source:** `docs/expansion-pipeline-status.md` (verified current).

### E4 — The grounding doc itself is pre-merge (2026-06-25) and partly stale · **SHOULD-FIX (awareness)**
- **What:** `2026-06-25-automation-prep-grounding.md` predates the SWV1 merge. Its game-test §4 is still accurate on the *open* hardening targets, but several "still open" notes (T1 part-a) are since DONE, and its base-bug status predates the merge that moved B7/B10/B12/B16/B17 onto master.
- **Why it matters:** the initiative should use it for *coverage angles*, not conclusions — exactly as this sweep was told to. Flagging it so it isn't trusted wholesale.
- **Source:** grounding doc date/header.

---

## F. Environment / infra gotchas automation must encode

### F1 — `node` is not on the Bash tool's PATH · **SHOULD-ENCODE** (constraint with a known workaround) · *re-tagged down from BLOCKER 2026-07-03*
- **What:** a runner invoking bare `node --check` (or any node) via the Bash tool fails — `node` isn't resolvable there. It IS resolvable in the hook environment (which is why the PostToolUse syntax hook works).
- **Workaround (why not a blocker):** two available — (1) call the full path `C:\Program Files\nodejs\node.exe --check <file>`, or (2) just edit via Edit/Write and read the PostToolUse hook's result (it runs the check and prints `SYNTAX ERROR` + exit 1 on failure). Not a true blocker; automation just has to *encode* one of these instead of assuming bare `node` works.
- **Source:** CLAUDE.md "Platform & Constraints"; `.claude/settings.json` PostToolUse hook (uses bare `node`, works in hook env only).

### F2 — Absolute Windows backslash paths get mangled in Node `-e` scripts · **SHOULD-FIX**
- **What:** absolute Windows paths with backslashes double-escape in `node -e` one-liners; use relative paths from the working directory.
- **Source:** CLAUDE.md "Platform & Constraints."

### F3 — Playwright MCP setup constraints must be encoded faithfully · **SHOULD-FIX**
- **What:** local-scope only; `file://` blocked (needs a local HTTP server); 1920×1080 viewport required (default ~400px renders the wrong mobile UI); game start needs a **trusted `pointerdown`** on `#begin-game` (a scripted `element.click()` silently no-ops); live-UI tests must go through the real play path (`selectedCards=[idx]` → `confirmActions()`/`endTurn()`) so the trailing `updateGameBoard()` runs.
- **Why it complicates:** miss any one and every run mis-starts or reads a stale DOM. A `/goal` loop has to encode the whole setup ritual verbatim.
- **Source:** `.claude/skills/game-test/SKILL.md` "Setup ritual" (22–30) + "Driving the harness" (91–118).

### F4 — Worktree + shared-doc canonical-side discipline is subtle · **SHOULD-FIX**
- **What:** expansion builds happen on a **worktree branch**, never master. Shared docs have a canonical side (rules-notes master copy is *scratch* and can clobber the worktree's canonical copy; the mechanics doc *flips* canonical side when the branch is cut). Rules 5/10 in CLAUDE.md.
- **Why it complicates:** an automated build must create/confirm the worktree first (per the "Worktree orientation first" rule) and must not write the wrong side of a shared doc — the rules-notes clobber and mechanics-doc side-flip already caused real drift once each. These are easy for a mechanical runner to violate.
- **Source:** CLAUDE.md "Session Roles & Folder Discipline" (rules 5, 10) + "Shared-doc canonical homes" table.

### F5 — Parallel agents can't execute bash (staging) · **NICE-TO-HAVE**
- **What:** parallel/background agents get permission-denied on bash; the staging pattern uses agents for read/plan only, with `mkdir`/`mv` executed in the main session.
- **Why it matters:** if automation fans out staging work to agents, the file-move half must stay in the main session or it silently fails.
- **Source:** CLAUDE.md "Expansion Asset Pipeline" (staging agent pattern).

### F6 — No defined isolation/rollback boundary for an automated scaffolding run that writes wrong files mid-run · **SHOULD-FIX**
- **What (isolation — exists):** the worktree convention already gives isolation. Expansion work happens on **one long-lived worktree branch, never master** (CLAUDE.md "Session Roles & Folder Discipline" + "Branch strategy for expansions"), so a bad automated write can't touch the shippable `master` tree. Commits are save points ("commit before you stop"). That boundary is real and should be a hard precondition: an automated build MUST create/confirm the worktree first (per "Worktree orientation first").
- **What (rollback — NOT defined):** there is **no automation-specific rollback protocol**. The generic git levers exist (`git checkout -- <file>`, `git reset`), but nothing defines *per-phase commit checkpoints* so a wrong scaffolding write reverts cleanly to the last-good phase, and there's no dry-run/preview mode. The "commit before you stop" rule gives per-*session* save points, not per-*automated-phase* ones — so a multi-phase `/goal` run that corrupts files in phase 2 has no clean, defined revert-to-end-of-phase-1 path; recovery is ad-hoc.
- **Why it matters:** an unattended scaffolding run needs a defined "if a phase's checks fail, revert to the last green checkpoint and stop" path. Recommend: commit at each phase boundary (Phase 1 ✅ → commit, Phase 2 ✅ → commit) as automated checkpoints, so rollback is `git reset --hard <last-phase-commit>` on the worktree. Cheap to define; absent today.
- **Source:** CLAUDE.md "Session Roles & Folder Discipline" (isolation rules 3, 4; branch strategy) — isolation present, rollback protocol absent.

---

## Confidence + what I might have missed

**Where I'm confident (verified on disk today):**
- SWV1 merge discipline held — `sw.js` is `legendary-v6` with `expansionSecretWarsVol1.js` in `FILES_TO_CACHE` (verified).
- B7's fix is live on master (`script.js:12194–12204`, verified) — so E1 is a real doc-staleness item, not a guess.
- Pipeline dependency docs exist (`expansion-decisions.md`, `mode-divergence-checklist.md`, `expansion-specs/secret-wars-vol1.md`) and no next-expansion mechanics doc exists yet (clean automation start point).
- The syntax check is a PostToolUse hook in `settings.json`, not a runner step (verified) — C5/F1 are real.
- Game-test hardening: part (a) of the popup timeout IS shipped in the skill (verified in SKILL.md); (b)/(c) genuinely open.

**Firming-pass resolutions (2026-07-03) — three earlier uncertainties now settled:**
- **A1 severity (was BLOCKER):** reconciled against the SWV1 coordinator firm note → **re-tagged SHOULD-FIX** (BLOCKER-class precondition only when gating goes unattended). Verified it does NOT collapse into A7 — distinct mechanism (HTTP-cache stale vs wrong serve-root). Observed local frequency is low; damage mode is silent-greenlight, so cheap freshness insurance is warranted before autonomy.
- **A2 (was inferred):** **verified absent** — no `.js` runner, no `test/`/`harness/` dir, prose-only assertions, screenshot+hand-typed results. Stays BLOCKER, now on evidence not inference.
- **D3 (only B7 checked before):** **spot-verified 3 more still live** (B6 @ `cardAbilities.js:12908`, B11 @ `expansionFantasticFour.js:2644`, B19-path @ `cardAbilities.js:11114`; B4 `morgAmbush` present @ `:3193`). No downgrade.

**Still less sure — a later pass should probe:**
1. **B1's blast radius under automation (D1).** Rated BLOCKER for *Golden-Solo* game-tests specifically. If the auto-gate runs mostly What If? mode or avoids >500ms recruit branches, practical risk is lower. Someone who knows which flows the gate would actually drive should re-weight.
2. **Audit-catalog Summary-table format stability (C4).** Assumed the Revelations/SWV1 catalog format is consistent enough to machine-parse the merge gate. If it has drifted between expansions, the parse is more fragile than rated.
3. **Count-gate edge cases for the *specific* next expansion (C2/C6).** The 1:1-breakage severity depends entirely on which expansion is picked next — Shadows of Nightmare (5 heroes, no transforms) ≈ non-issue; WWH (transforms + double-sided masterminds) ≈ real. Content-check (C6) severity scales the same way.
4. **Outside the eight categories:** the `/expansion-audit` subagent pipeline's own reliability under automation (fans out ~9 subagents — do they fail closed on a bad run?), and whether `/game-test`'s per-worktree tracking docs (`playwright-verification-plan.md`) exist by default or must be created. Both worth a targeted look.
