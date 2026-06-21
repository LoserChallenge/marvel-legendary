# Marvel Legendary — Solo Play Web App

## About the User

- Complete beginner — no coding background
- No terminal experience — walk through every command step by step
- No mental model of file/folder structure — explain where things are in plain English
- Learns best by seeing the result first, then understanding why
- Will not always know what follow-up questions to ask — flag things proactively
- Prefers to approve changes before they are made
- Always explain what a change will do in plain English before doing it

## Project Goal

Enhance the existing Legendary Solo Play web app. Golden Solo Mode is complete. Active work: UI/setup screen improvements, then full expansion content additions.

## Project Location

- Working directory: `D:\Games\Digital\Marvel Legendary\Claude Code\marvel-legendary`
- Source files (extracted): `Legendary-Solo-Play-main\Legendary-Solo-Play-main\`

## Source Files

| File | Purpose |
|------|---------|
| `script.js` | Core game engine — turn logic, UI, villain deck, HQ, mastermind, city |
| `cardAbilities.js` | Hero card effects — Core Set |
| `cardAbilitiesDarkCity.js` | Hero card effects — Dark City expansion |
| `cardAbilitiesSidekicks.js` | Sidekick card effects |
| `cardDatabase.js` | All card data definitions |
| `index.html` | Setup screen + game board HTML |
| `styles.css` | All styling |
| `expansionFantasticFour.js` | Fantastic Four expansion |
| `expansionGuardiansOfTheGalaxy.js` | Guardians of the Galaxy expansion |
| `expansionPaintTheTownRed.js` | Paint the Town Red expansion |
| `expansionRevelations.js` | Revelations expansion |
| `updatesContent.js` | Patch notes |
| `sw.js` | Service Worker — caches all game files for offline/PWA support |

## How to Run

Open `Legendary-Solo-Play-main\Legendary-Solo-Play-main\index.html` directly in a browser. No server, build step, or install needed.

## Deployment

- Game is hosted on GitHub Pages at: `https://LoserChallenge.github.io/marvel-legendary/`
- Push to `master` branch deploys automatically (~1 min delay; hard refresh `Ctrl+Shift+R` to bust cache)
- **Service Worker cache:** After pushing code changes, bump `CACHE_NAME` in `sw.js` (e.g. `'legendary-v3'` → `'legendary-v4'`). Without this, users' browsers will keep serving the old cached files. This is the #1 cause of "changes don't show on GitHub Pages."
- **`FILES_TO_CACHE` in `sw.js`:** When adding a new expansion JS file, also add its path to the `FILES_TO_CACHE` array — bumping `CACHE_NAME` alone is not enough; the file won't be served offline/PWA without an explicit entry
- Rules PDFs (105MB) are gitignored — local only
- Core Set card images are in `Visual Assets/Heroes/Reskinned Core/` (not a subfolder named "Core Set")

## Backups

- **Original-game baseline** — frozen reference copy of the original game (base + all already-integrated expansions, pre-Revelations). Emergency reference only: never modify, never merge expansions into it. Names are evergreen by design (no version/date/expansion strings; provenance lives in the tag annotation).
  - **Git tag:** `original-game-baseline` (annotated; pushed to origin).
  - **Folder copy:** `D:\Games\Digital\Marvel Legendary\_original-game-backup\`.

## Platform & Constraints

- Windows 11, VS Code
- Static HTML/JS/CSS — no server, no build step, opens directly in a browser
- No package.json / no npm
- User is on Claude Pro — no API usage
- `node` is installed at `C:\Program Files\nodejs\node.exe` but not on the Bash tool's PATH — manual `node --check` will fail; rely on the hook runner instead
- When running Node `-e` scripts, use relative paths from the working directory — absolute Windows paths with backslashes get mangled by double-escaping
- PDF/image tool gotchas (poppler, pdftoppm, inventory PDFs) — see `docs/card-inventory/card-reading-rules.md`
- **Staging `mv` gotcha:** Filenames starting with `---` (or any leading dash) are parsed as flags by bash. Use `mv -- "---filename" dest` to end option parsing.

## onscreenConsole vs console Gotcha

- **`onscreenConsole.log()`** is the game's **in-game message panel** that players see during play. Use it for every game event — card plays, villain moves, ability activations, Locations entering the city, anything the player needs to know about.
- **`console.log()`** is the **browser's developer tools** console (F12). It's invisible to players and should only appear in dev-only instrumentation that gets removed before a feature ships. Treat any `console.log` in game logic as a red flag.
- **Rule:** when writing game logic, reach for `onscreenConsole.log()` first. If you find yourself typing `console.log()` for something a player would want to see, stop — it's a bug.
- **Highlight syntax:** wrap card/hero/villain names in `<span class="console-highlights">${name}</span>` to render them in the game's highlight colour. Canonical pattern: villain/Location announcements (grep `console-highlights` in `script.js`).
- **Caught by:** 2026-04-12 Revelations playtest. `placeLocation()` used `console.log`, so Locations entered the city with zero on-screen announcement. Fixed 2026-04-13 (Fix 1D).

## Async Gotchas

- Making an ability `async` requires `await` at ALL its call sites; `placeLocation()` is `async`. Detail → `docs/engine-gotchas.md` (Async patterns).

## Villain Card Cloning Gotcha

- Custom state added to a villain at ambush time must be whitelisted in `createVillainCopy()` or the fight effect gets a stripped copy. Detail → `docs/engine-gotchas.md` (Villain identity & escape state).

## transformScheme() Limitation

- `transformScheme()` swaps scheme image/name/object only — it does NOT resize the city, the global `selectedScheme` isn't pre-populated by setup, and `#scheme-place` has a hidden-token selector trap (`img.card-image`). Detail → `docs/engine-gotchas.md` (Scheme transform; City resize).

## Duplicate updateHighlights() Gotcha

- `script.js` has TWO `function updateHighlights()` declarations — keep both in sync; `usesRecruitToFight` has THREE affordability gates (both twins + `showAttackButton()`). Detail → `docs/engine-gotchas.md` (Twin functions).

## cardDatabase.js Class/Color Reference

- Hero classes in the DB use: `"Strength"`, `"Instinct"`, `"Covert"`, `"Tech"`, `"Range"` (NOT "Ranged")
- Canonical source: the `const CLASSES = [...]` array in `script.js`
- Color mapping: Strength=Green, Instinct=Yellow, Covert=Red, Tech=Black, Range=Blue
- Always verify against the DB before bulk inserts — inventory files use different terminology

## Villain Attack / Mechanic Flags

- Modified villain attack lives in `attackFrom*` fields, NOT `card.attack` (writing `card.attack` is invisible — base comes from card art); `updateVillainAttackValues()` + `updateHQVillainAttackValues()` are twins. New DB flags like `usesRecruitToFight: true` enable recruit-only fight cost. Detail → `docs/engine-gotchas.md` (Attack / fight-cost pipeline; Twin functions).

## Expansion Effect Function Patterns

- Hero abilities: `async function heroNameCardTitle() { ... }` — must match `unconditionalAbility`/`conditionalAbility` in cardDatabase.js exactly
- Villain effects: `function villainNameAmbush/Fight/Escape(villainCard)` — villain card passed as arg when needed
- Choice popups: `const { confirmButton, denyButton } = showHeroAbilityMayPopup(text, label1, label2)` → wire `onclick`, call `closeInfoChoicePopup()` + `resolve()`
- Wound effects: call `drawWound()` (handles invulnerability) not `defaultWoundDraw()`
- KO hero: reuse existing `FightKOHeroYouHave()` — presents card-choice popup
- KO from discard/hand (player chooses): use `card-choice-popup` pattern (see `KO1To4FromDiscard()` in `cardAbilities.js`). Do NOT use `showHeroAbilityMayPopup` — that's only for Yes/No on a known card, not for selecting from a pool.
- Retrieve from discard (player chooses): same `card-choice-popup` pattern, moving to hand instead of KO pile
- Evil wins: add `case "conditionName":` (matches the scheme's `endGame` value) to the `switch (condition)` over `endGameConditions` in `script.js` — the scheme end-game / evil-wins switch inside `updateGameBoard()`. **Twin to keep in sync:** if the condition needs a live on-screen counter, also add a `case "Scheme Name":` (keyed on scheme `name`, NOT `endGame`) to the switch in `updateEvilWinsTracker()`. (There is no `checkEvilWins`/`updateEvilWinsText` function despite stale code comments naming them.)

## Card Reading & Inventory Rules

Detailed rules for reading card data from images, DB authority hierarchy, inventory template format, quantity gotchas, and expansion-specific new card types (X-Men, S.H.I.E.L.D.) — see `docs/card-inventory/card-reading-rules.md`.

**Key rule (inlined because it applies to all card work):** The expansion **inventory is the official source for card CONTENT** — attack, VP, cost, effect text, what each card does. Canonical files: `expansions/[name]/[name]-reference.md` (BGG-derived reference) and `docs/card-inventory/final/[name].md` (finalized inventory). Read card content from the inventory, **NEVER from card images** — images are a last resort only for effect text the inventory genuinely lacks; never read numbers off card art, never guess from icons. If `cardDatabase.js` disagrees with the inventory on a value (e.g. a stale or zeroed attack/VP), **the inventory wins — correct the DB.** `cardDatabase.js` stays authoritative ONLY for field FORMAT/conventions — exact class-name strings (`"Range"` not `"Ranged"`), color mapping, field structure; don't import the inventory's terminology verbatim. Flag genuinely uncertain data for human spot-check.

**Coordinators:** route worker sessions and subagents to the inventory files as the authoritative source for any card-data question. Never point them at card images for card numbers or effects. *(Why: an image-read subagent misread a Mastermind Tactic's 6 VP as a recruit cost and reported VP 0 — the inventory had it right.)*

## Attack / Recruit-Granting Function Pattern

- Every function granting attack/recruit updates BOTH the current-turn total (`totalAttackPoints`/`totalRecruitPoints`) AND the Final Showdown cumulative (`cumulativeAttackPoints`/`cumulativeRecruitPoints`), then calls `updateGameBoard()`. Missing the cumulative silently breaks Final Showdown. Detail → `docs/engine-gotchas.md` (Attack / fight-cost pipeline).

## Mastermind Code Gotchas

- Match mastermind names to `cardDatabase.js` exactly (wrong name → `undefined` from `masterminds.find()`); use `getSelectedMastermind()`; Epic masterminds are a runtime `{...base, ...base.epic}` overlay. Detail → `docs/engine-gotchas.md` (Mastermind).

## Out of Scope

- Any changes to What If? Solo behavior outside the expansion pipeline (What If? adaptations for new expansions ARE in scope via `/analyze-expansion`)
- Two Handed mode

## Reference Files

- `rules/` — PDF rulesheets for all expansions. Read tool PDF support works when VS Code is launched with the full user PATH (so `pdftoppm` is accessible). It's intermittent: try `Read` first; if it fails with a pdftoppm error, **stop and tell the user** to fully close and reopen VS Code (not just reload window), then retry. Do not use pdftotext or any other workaround.
- `docs/card-inventory/final/` — finalized card inventory files; source of truth for audits.
- `docs/card-inventory/card-reading-rules.md` — card image reading rules, DB authority, inventory template notes, expansion-specific card types
- `docs/expansion-asset-pipeline.md` — staging structure, naming conventions, import mapping, inventory process, visual reference setup
- `docs/expansion-pipeline-status.md` — pipeline progress table for all expansions
- `docs/expansion-mechanics/` — mechanics reference docs produced by `/analyze-expansion`
- `docs/expansion-progress/` — implementation progress files produced by `/new-expansion`
- `docs/expansion-specs/` — frozen per-card behavioral specs (effect text + intended behavior + engine function + executable `/game-test` assertion + confidence flag), authored in `/new-expansion` Phase 2.5 BEFORE effect code; the contract the Phase 4 audit blind-compares against
- `docs/mode-divergence-checklist.md` — authoritative gate for dual-mode testing: the mechanics that behave differently in Golden vs What If? Solo. Consulted in `/analyze-expansion` (flag mechanics) and `/new-expansion` Phase 4c (force dual-mode `/game-test`)
- `docs/priorities.md` — live task tracker (in-flight / deferred / ongoing / completed); consult on direction
- `docs/known-issues.md` — detailed descriptions of open/deferred issues
- `docs/golden-solo-history.md` — Golden Solo implementation history, architectural rules, testing checklist
- `docs/engine-gotchas.md` — cross-expansion code traps & reusable patterns (twin-function parity, attack/defeat pipelines, Location plumbing, scheme-transform reads, state lifecycle). **Consult before expansion code work and during `/expansion-audit`.** On-demand (not auto-loaded); CLAUDE.md keeps only the highest-frequency rules inline.
- `docs/expansion-decisions.md` — cross-expansion design & rules-interpretation precedents (the "we chose X, here's why" layer). **Consult during `/analyze-expansion` and before building a new mechanic.**
- `docs/revelations-retrospective.md` — what drove the Revelations bug volume + structural-prevention map; input to future build/gate workflow improvements.

## Planned Work

**Active mission:** bring expansions into the game one at a time (inventory → `/analyze-expansion` → `/new-expansion`). Revelations complete + merged (2026-06-20); next expansion not yet selected.

**Live task list — in-flight / deferred / ongoing:** `docs/priorities.md`. **Pipeline status table:** `docs/expansion-pipeline-status.md`. Consult both for what's next; this section stays durable-context only.

## Visual Reference Setup ✅ Complete

For inventory sessions: read `docs/card-inventory/icons/icon-reference.md` at session start. Full details in `docs/expansion-asset-pipeline.md`.

## Expansion Asset Pipeline

Staging structure, file naming conventions, staging process steps, card inventory sources, and import mapping — see `docs/expansion-asset-pipeline.md`.

**Key facts (inlined for quick reference):**
- **Staging area**: `expansions/[name]/` at project root (outside game root)
- **Production**: `Visual Assets/` inside the game root
- **Inventory**: 3-pass process — `/inventory-creator` → `/inventory-verifier` → user spot-check
- **Pipeline status**: `docs/expansion-pipeline-status.md` for full progress table
- **Staging agent pattern:** Parallel agents cannot execute bash (permission denied in background). Use agents for steps 1–3 of `/stage-expansion` (image reading + plan writing only). Execute all `mkdir`/`mv` renames in the main session.

## Golden Solo Rules Summary

- **Setup:** Hero count follows `scheme.requiredHeroes` (no longer hardcoded to 5); villain deck = 2-player rules (2 bystanders default, 10 henchmen shuffled in); hero deck restructured (10-card starting stack on top, Rares shuffled into main deck)
- **Each round:** Draw 6; HQ rotates (1 added right, 1 removed left — skip round 1); optional bystander spend to reduce villain draws; draw **2** villain cards; play 6 cards
- **HQ refill:** New card always goes rightmost, others slide left — rotation, not fill-in-place
- **"Other player" effects:** Currently silent skip — under review (see Known Issues)
- **Win:** 4 Mastermind defeats; **Ultimate Victory:** Final Showdown — combined recruit+attack ≥ Mastermind strength+4

## Automations Set Up

**Hooks:**
- JS syntax check (`node --check`) — runs automatically after every `.js` file edit
- Anti-pattern guard — blocks `drawVillainCard()` calls in `expansion*.js` and `cardAbilities*.js` (use `processVillainCard()` instead)
- Asset edit blocker (`hookify.block-asset-edits.local.md`) — blocks Edit/Write on `Visual Assets/` or `Audio Assets/`; reads allowed
- Worktree advisory — warns when editing `script.js` or `cardAbilities*.js` (large files, consider worktree)

**Skills (expansion pipeline, in order):**
- `/stage-expansion` — organizes and renames files in a raw staging folder
- `/inventory-creator` — builds Pass 1 card inventory file; any expansion, full or partial scope
- `/inventory-verifier` — Pass 2 independent verification in a fresh session
- `/analyze-expansion` — collaborative rules analysis; produces mechanics reference in `docs/expansion-mechanics/`; flags each mechanic against `docs/mode-divergence-checklist.md`; consults `docs/expansion-decisions.md`; final step dispatches `pattern-reuse-scout`
- `/new-expansion` — multi-phase code integration with progress tracking in `docs/expansion-progress/`; **Phase 2.5 authors + freezes per-card behavioral specs (with executable `/game-test` assertions) to `docs/expansion-specs/` BEFORE any effect code**; Phase 3 builds-to-spec and runs the assertions; Phase 4 runs `/expansion-audit` (blind-compare to spec) + the dual-mode gate
- `/expansion-audit` — pre-merge audit pipeline: dispatches `engine-integration-auditor` → `expansion-validator` → 6 card-type auditors + `keyword-consistency-auditor`, consolidates findings to `docs/audit-results/`. Spec: `docs/superpowers/specs/2026-05-28-expansion-audit-pipeline-design.md`

**Skills (other):**
- `/game-test` — Playwright orchestrator. Drives the live game in a real browser for verification (post-fix), diagnostic (pre-implementation scoping), reproduction, or regression. Handles HTTP-server setup, 1920×1080 viewport, state injection, screenshots, and results tracking. Reach for it on any bug-list work where deterministic state-injection beats manual playtest.
- `/deploy` — pre-push checklist + push to master + GitHub Pages verification
- **`/write-plan` default-location gotcha:** Superpowers' `writing-plans` skill drops output at `~/.claude/plans/{auto-slug}.md` by default — a **global** path with a machine-generated name (e.g. `temporal-coalescing-kettle.md`). For project work, override with an explicit in-repo path like `docs/superpowers/plans/YYYY-MM-DD-descriptive-name.md` inside the active worktree, or move+rename the file immediately after creation and update any references.

**Subagents:**
- `codebase-navigator` — targeted code searches without flooding context
- `expansion-validator` — validates expansion JS against 7 Golden Solo rules; run inside `/expansion-audit`; emits a standing "NOT COVERED: What If? behavioral" footer (it's Golden-only — dual-mode gate is separate)
- **Expansion audit pipeline** (run via `/expansion-audit`, see `docs/superpowers/specs/2026-05-28-expansion-audit-pipeline-design.md`):
  - `engine-integration-auditor` — discovers engine touchpoints + finds state-propagation gaps (E-N IDs)
  - `pattern-reuse-scout` — finds prior-art implementations of new mechanics. Run in `/analyze-expansion` AND as the mandatory reuse-first survey before building any new mechanic (rule 9)
  - `keyword-consistency-auditor` — keyword implemented-once / consistent-across-types / scoped
  - `hero-card-auditor`, `villain-card-auditor`, `henchmen-card-auditor`, `mastermind-card-auditor`, `scheme-card-auditor`, `misc-card-auditor` — per-card-type audit (text-vs-code, engine, mode, cross-card, choices, base rules)
- `rules-oracle` — authoritative rules/mechanics lookup from the `rules/` rulebooks + inventory; solo-framed, quotes source + page, caches findings to `docs/rules-notes/`. Use for ambiguous mechanics/keyword/interaction/solo-handling questions (rules 6 + 8). Advisor only — never edits code.

**MCP Servers:**
- **Playwright MCP** — Microsoft `@playwright/mcp@latest`, local-scope (this project only). Drives a real Chromium browser: click, fill, screenshot, read DOM, evaluate JS in the page. **Use for:** bug verification where a specific game state reproduces the issue — inject state via `browser_evaluate` (skip setup, pre-stack decks, jump to a UI state), then verify via DOM / onscreenConsole / screenshot. Bug-backlog triage, regression checks, deterministic reproductions. **Don't use for:** subjective UX feel, randomness-dependent multi-turn flows, anything needing real play instincts. **Setup quirks:** `file://` is blocked — launch via a local Python HTTP server pointed at the game's directory; default viewport is narrow (~400px = mobile layout), set 1920×1080 at session start; `sw.js` 404 console error on local-serve is expected noise (path-prefix mismatch with GitHub Pages), not a bug. Full install history + deeper gotchas: `D:\Claude Code\cc-helper\docs\cc-guide.md` → Playwright MCP entry.
- **GitHub MCP** — check deployment status, issues, Actions logs without leaving chat.

**References:**
- `docs/card-inventory/final/` — per-expansion finalized card data and effect text; source of truth for audits.

**Other:**
- Git worktrees: `.worktrees/` is gitignored; feature branches at `.worktrees/<branch-name>`
- **Branch strategy for expansions:** One long-lived branch per expansion (e.g., `revelations`), accumulating all work. Merge to master only when the expansion is fully complete. Do NOT create separate branches per step or phase.

## Workflow Preferences

- When a plan or prior discussion specifies worktrees/branch isolation, follow that approach — confirm with user if deviating
- Always read and understand code before proposing changes
- Propose a plan and get approval before editing any files
- Use the `codebase-navigator` subagent for searching large files
- Explain all terminal steps in plain English
- **When executing a fix plan written in a prior session, verify each fix's stated root cause empirically before implementing.**
- **When executing a multi-step doc/config plan, check current file state (both master and worktree) before assuming all steps are pending** — prior sessions may have already applied some steps. Apply Phase 1 of systematic-debugging to the plan's hypothesis, not just to the original bug. Prior-session plans can be based on incomplete playtest observation and may misdiagnose — don't trust-and-apply.

## Session Roles & Folder Discipline (READ FIRST)

This project runs as **two folders with two roles** during an active expansion. Getting this wrong is the #1 source of confusion and lost/uncommitted work — follow it exactly.

**The two folders:**
- **Main folder (this one) = `master` = the finished, stable, shippable game.** Sessions opened here are **COORDINATORS / DIRECTORS** during an active expansion: plan, dispatch prompts to worker sessions, and do project-wide or master-only work. **Do NOT do expansion game-dev here.**
- **Worktree folder = the active expansion branch = ALL expansion development** (e.g. `.worktrees\revelations`). The worker session lives here.

**The rules:**
1. **One session works ONLY in the folder it was opened in.** NEVER reach across folders with `git -C <other folder>` or relative paths into the other tree. Need the other folder? Open a session in it.
2. **Open a worktree via the Desktop folder picker** pointed at the worktree path (e.g. `.worktrees\revelations`) — **NOT the branch switcher.** The branch switcher tries to switch the main folder's branch and triggers the "uncommitted changes on master" warning; never do that.
3. **Commit before you stop.** On a feature branch, commits are save points — commit work-in-progress freely and often, even if broken or incomplete (the worktree isolates it from `master`). **Never end a session with uncommitted work.**
4. **Verify location at session start:** run `git rev-parse --show-toplevel` and `git branch --show-current`; confirm you're where you intend before working.
5. **CLAUDE.md during an expansion:** the worktree's copy is the live one for branch-specific content; this master copy is frozen and reconciled at merge. This "Session Roles & Folder Discipline" section is the canonical copy — preserve it when reconciling CLAUDE.md at merge.
6. **Card data comes from the inventory, not card images.** For any card-data question (attack/VP/cost/effect text), route workers and subagents to the expansion inventory files — see "Card Reading & Inventory Rules" below. Never let a worker or subagent read structured card numbers off card art.
7. **Independent review is a required gate, not optional self-check.** The implementing session's own verification (e.g. `/game-test`) is never sufficient alone — cold-read review must be subagent-delegated (its reviewers run in fresh context). Coordinators bake into EACH fix-group's done-criteria: run `expansion-validator` (on touched expansion files) + `/code-review` on the diff before calling the group done. **Verify mode-sensitive fixes in BOTH `gameMode` `'whatif'` and `'golden'`** — `expansion-validator` is Golden-Solo-only, so What If? divergences (behavioral, not structural) are caught via dual-mode verification + `/code-review` flagging `gameMode` branching, never by the validator. Before merge: full pass — `expansion-validator` + `/code-review` (high) + `sandbox-review` (separate session) + user playtest (both modes where relevant). Don't skip these because a fix "looks small."
8. **Rules/mechanics ambiguity goes to the expansion rules PDF before assumption or escalation.** When a card interaction, keyword, or solo-mode handling is ambiguous — "each other player" effects, keyword stacking, how a mechanic resolves in 1-player solo, what a fight/defeat requirement actually is — consult the expansion's rules PDF in `rules/` (the canonical home for all rulebooks — Core, solo rulesets, every expansion; an expansion still being staged may have its PDF only in `expansions/[name]/`) alongside the inventory before implementing on a guess or asking Paul. Route workers and subagents there too — or use the `rules-oracle` subagent, which does this lookup and cites source + page. Together the inventory (card content) and the rules PDF (mechanics/interactions) resolve most questions; escalate to Paul only what both genuinely leave open. *(Why: Cluster C implemented the ~10 Location "each other player" triggers as announce-and-skip on an interim convention; the Revelations rulebook's solo rule — "when a Location tells 'each other player' to do something, do it yourself" — would have settled it pre-implementation and avoided the rework.)*
9. **Reuse-first: survey prior art before building any new mechanic.** Before implementing a NEW mechanic or feature — a new scheme/keyword behavior, a bespoke counter or board indicator, a resource-spending player action, a gain/move helper (NOT a localized bug fix) — the diagnose phase MUST include a `pattern-reuse-scout` survey for existing implementations (scheme-specific state/counters, board indicators, Recruit/Attack-spending actions, gain/move-card helpers). Coordinators bake this survey into the diagnose dispatch by default; workers run the scout and report what exists vs. what's genuinely missing. Justify every new function by showing no existing pattern fit — adapt before building fresh. *(Why: the `pattern-reuse-scout` subagent exists for exactly this but only fired when manually prompted; tying it to the diagnose-first step that already runs every fix-group makes reuse-first the default, not a reminder.)*

## Scheme Hero Requirements Infrastructure

Both game modes use `scheme.requiredHeroes` for hero count (Golden Solo no longer hardcodes 5). Schemes can optionally declare a `heroRequirements` field:

```js
heroRequirements: {
    teamComposition: [{ team: "X-Men", count: 4 }, { team: "non:X-Men", count: 2 }],
    requiredHero: ["Spider-Man"]
}
```

- **Banner** (`#hero-requirements-banner`): shows/hides based on selected scheme's `heroRequirements`
- **Validation**: `showConfirmChoicesPopup()` checks team composition + required heroes; blocks game start if unmet
- **Randomize**: `pickHeroesForRequirements()` helper fills required heroes → team constraints → random remainder
- **Villain/henchmen requirements** already handled separately via `specificVillainRequirement` / `specificHenchmenRequirement`
- Spec: `docs/superpowers/specs/2026-04-05-scheme-hero-requirements-design.md`
- **Status**: Merged to master (2026-04-06). No current schemes use `heroRequirements` yet — infrastructure ready for expansion schemes

**Villain-side scheme overrides:** `getEffectiveSetupRequirements()` in `script.js` is the single source of truth for setup validation. It combines scheme fields (`requiredVillains`, `specificVillainRequirement`, `extraVillainGroups`) with game-mode rules (Golden Solo base = 2 villain groups) and mastermind `alwaysLeads`. Setup display, start-game validator, and checkbox auto-lock all read from it — no caller bypasses it. New scheme-specific villain overrides should extend this function, not the call sites.

- **`extraVillainGroups: N`** (added 2026-04-15 for Revelations Earthquake/Tsunami) — Golden Solo adds N extra villain groups on top of the base 2. What If? Solo ignores this field (uses `requiredVillains` directly). Applied in `getEffectiveSetupRequirements()` Golden Solo branch only.

## Golden Solo Implementation

Complete and stable. Mode flag: `gameMode` (`'whatif'` | `'golden'`). Full history, architectural rules, and testing checklist: `docs/golden-solo-history.md`

---

## Known Issues / Deferred

Details in `docs/known-issues.md`. Summary:
- **Hero name truncation** on narrow screens — accepted, revisit in next UI pass
- **Kree-Skrull War villain count** — rules decision needed (What If? Solo 1-group cap vs. scheme's 2-group requirement)
- **"Other player" effects** — inconsistent solo handling; full review deferred until all inventories are finalized (will be addressed by `/analyze-expansion`)
- **Villain/Mastermind overlay UX pass** — bystanders and captured heroes currently shrink to small thumbnails on the villain/mastermind card. Refactor to match the Location fan-out pattern (full-size cards shifted in position to mimic physical tabletop stacking). Cross-cutting — touches base game, every expansion. Unblocked (Revelations merged 2026-06-20); not yet scheduled.
