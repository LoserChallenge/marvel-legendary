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

## Platform & Constraints

- Windows 11, VS Code
- Static HTML/JS/CSS — no server, no build step, opens directly in a browser
- No package.json / no npm
- User is on Claude Pro — no API usage
- `node` is installed at `C:\Program Files\nodejs\node.exe` but not on the Bash tool's PATH — manual `node --check` will fail; rely on the hook runner instead
- When running Node `-e` scripts, use relative paths from the working directory — absolute Windows paths with backslashes get mangled by double-escaping
- PDF/image tool gotchas (poppler, pdftoppm, inventory PDFs) — see `docs/card-inventory/card-reading-rules.md`
- **Staging `mv` gotcha:** Filenames starting with `---` (or any leading dash) are parsed as flags by bash. Use `mv -- "---filename" dest` to end option parsing.

## JS/HTML Pairing Rule

When removing an HTML element, always grep `script.js` for matching `getElementById()` calls at the top level. Null references at the top of `script.js` crash ALL subsequent listener registration silently (e.g., removing `#donate-call-to-action` from HTML broke the Welcome popup close button because `script.js` crashed before registering its listener).

## GitHub Pages / HTTP Serving Gotchas

- Browsers on `https://` treat uncaught JS errors more strictly than `file://` — errors that silently fail locally can crash the loading screen on GitHub Pages
- `initCosmicBackground()` and `initSplash()` in `expansionGuardiansOfTheGalaxy.js` assume DOM elements that don't exist — both have null guards added; any future expansion splash code must do the same
- `drawVillainCard()` must NOT be called inside `initGame()` — it shows a popup requiring player input, causing a deadlock while the loading screen is still visible. It is called in `onBeginGame()` after the loader hides (~line 3571)

## CSS Grid Overflow Gotcha

- Grid columns using `1fr` do not shrink below content size by default — use `minmax(0, 1fr)` and `min-width: 0` on children when text must truncate rather than push other columns off-screen

## onscreenConsole vs console Gotcha

- **`onscreenConsole.log()`** is the game's **in-game message panel** that players see during play. Use it for every game event — card plays, villain moves, ability activations, Locations entering the city, anything the player needs to know about.
- **`console.log()`** is the **browser's developer tools** console (F12). It's invisible to players and should only appear in dev-only instrumentation that gets removed before a feature ships. Treat any `console.log` in game logic as a red flag.
- **Rule:** when writing game logic, reach for `onscreenConsole.log()` first. If you find yourself typing `console.log()` for something a player would want to see, stop — it's a bug.
- **Highlight syntax:** wrap card/hero/villain names in `<span class="console-highlights">${name}</span>` to render them in the game's highlight colour. Canonical pattern at `script.js:5138-5140` (villain announcement).
- **Caught by:** 2026-04-12 Revelations playtest. `placeLocation()` at `script.js:601` used `console.log`, so Locations entered the city with zero on-screen announcement. Fixed 2026-04-13 (Fix 1D).

## Async Gotchas

- When making a card ability function `async`, grep for ALL its call sites and add `await` there too — callers in `cardAbilities.js` and expansion files are often sync and will silently fire-and-forget otherwise (this was missed for `heroSkrulled` callers in health check phase 2 and caught by code review).
- `placeLocation()` in `script.js` is `async` (line 584) — any expansion function calling it must use `await placeLocation(...)` and be declared `async` itself; missing `await` causes a race condition when the city is full (overflow popup fires and forgets before the player chooses)

## Villain Card Cloning Gotcha

- Villain cards are cloned when placed into the `city[]` array by `processRegularVillainCard()` — custom properties added by ambush effects (e.g. `capturedHero`) are NOT preserved on the city copy. Ambush functions that need to attach state must find the card in `city[]` after placement and modify the city copy directly.

## transformScheme() Limitation

- `transformScheme()` in `script.js` only swaps the scheme image/name/object — it does NOT resize the city. Schemes that change city size (Earthquake/Tsunami) need a separate `resizeCityForScheme(newSize)` call. As of Phase 4 playtest (2026-04-12), this function does not exist yet and is part of the fix plan.

## generateVillainDeck Type Gotcha

- `generateVillainDeck()` overwrites every card's `type` to `"Villain"` — new card types (e.g. Location) need a preservation check: `const cardType = modifiedCard.type === "Location" ? "Location" : "Villain";` (already added on location-system branch)

## Duplicate updateHighlights() Gotcha

- `script.js` contains TWO `function updateHighlights()` declarations — the second overwrites the first in JS, but both must be kept in sync since either may become active after refactoring. When modifying city villain affordability checks or fight button logic, grep for all `updateHighlights` definitions and patch both.

## cardDatabase.js CRLF Gotcha

- `cardDatabase.js` uses CRLF line endings — any Node script doing string replacement must normalize (`db.replace(/\r\n/g, '\n')`) or markers won't match. Restore CRLF on write.

## cardDatabase.js Class/Color Reference

- Hero classes in the DB use: `"Strength"`, `"Instinct"`, `"Covert"`, `"Tech"`, `"Range"` (NOT "Ranged")
- Canonical source: `script.js` line ~13778 `const CLASSES = [...]`
- Color mapping: Strength=Green, Instinct=Yellow, Covert=Red, Tech=Black, Range=Blue
- Always verify against the DB before bulk inserts — inventory files use different terminology

## Villain Mechanic Flags

- **`usesRecruitToFight: true`** — add to villain DB entry for recruit-only fight cost (e.g. Mister Hyde); both `updateHighlights()` declarations gate affordability on this flag; missing it silently disables the entire mechanic with no error

## Villain Attack Modifier Pipeline

- **Modified villain/henchman attack values live in `attackFromMastermind` / `attackFromScheme` / `attackFromOwnEffects` / `attackFromHeroEffects` / `attackFromShards` fields**, NOT in `card.attack`. The display overlay (`script.js:~8534`) and fight-cost calculation (`recalculateVillainAttack()` at `script.js:11706`) both read only these modifier fields — writing to `card.attack` directly is invisible because the base number comes from the printed card art.
- **Canonical precedent:** the `mastermind.alwaysLeadsBonus` check at `script.js:9937`. Add new mastermind/scheme/own-effect villain bonuses inside `updateVillainAttackValues()` following that pattern.
- **Duplicate function pattern (like `updateHighlights`):** `updateVillainAttackValues()` (city, line 9921) and `updateHQVillainAttackValues()` (HQ, line 10137) both need identical modifier logic — patch both in parallel.
- **The overlay is conditional:** `if (totalAttackModifiers !== 0)` at `script.js:~8533` — if nothing sets a modifier field, no overlay is drawn and the player sees only the card art's printed number.
- Caught by: Fix 1C Part B failed the 2026-04-13 Revelations playtest because it mutated `card.attack` at setup time instead of using this pipeline; the fight logic worked but the card displayed its base art value.

## Expansion Effect Function Patterns

- Hero abilities: `async function heroNameCardTitle() { ... }` — must match `unconditionalAbility`/`conditionalAbility` in cardDatabase.js exactly
- Villain effects: `function villainNameAmbush/Fight/Escape(villainCard)` — villain card passed as arg when needed
- Choice popups: `const { confirmButton, denyButton } = showHeroAbilityMayPopup(text, label1, label2)` → wire `onclick`, call `closeInfoChoicePopup()` + `resolve()`
- Wound effects: call `drawWound()` (handles invulnerability) not `defaultWoundDraw()`
- KO hero: reuse existing `FightKOHeroYouHave()` — presents card-choice popup
- KO from discard/hand (player chooses): use `card-choice-popup` pattern (see `KO1To4FromDiscard()` in `cardAbilities.js:11814`). Do NOT use `showHeroAbilityMayPopup` — that's only for Yes/No on a known card, not for selecting from a pool.
- Retrieve from discard (player chooses): same `card-choice-popup` pattern, moving to hand instead of KO pile
- Evil wins: add `case "conditionName":` to the switch in `script.js` `checkEvilWins` (~line 9065)

## City Card Click Handler Pattern

- `popupMinimized` is `false` during normal gameplay — villain/Location click handlers must use `if (!popupMinimized) { handle click }` to allow clicks during play. The guard looks inverted but matches how the variable is named. Do NOT use `if (!popupMinimized) return;` — that blocks clicks during normal play.

## Card Reading & Inventory Rules

Detailed rules for reading card data from images, DB authority hierarchy, inventory template format, quantity gotchas, and expansion-specific new card types (X-Men, S.H.I.E.L.D.) — see `docs/card-inventory/card-reading-rules.md`.

**Key rule (inlined because it applies to all card work):** `cardDatabase.js` is authoritative for structured fields (class, team, cost, values). Card images are ONLY for effect text. Never guess from icons or context — flag uncertain data for human spot-check.

## Attack-Granting Function Pattern

- Every function that grants attack must update BOTH `totalAttackPoints` (current turn display) AND `cumulativeAttackPoints` (Final Showdown tracking) — missing the second one silently breaks Final Showdown
- Check every `totalAttackPoints +=` line has a matching `cumulativeAttackPoints +=`
- Attack-granting functions must also call `updateGameBoard()` after modifying points — missing this means the on-screen total won't refresh until the next natural update (caught in Vengeance is Rocket 2026-03-31)

## Node.js vm Gotcha (cardDatabase.js scripts)

- `const` declarations inside `vm.runInContext()` are block-scoped to the script and NOT accessible on the context object — `context.heroes` will be `undefined`
- Fix: before running, replace the declaration: `code = code.replace(/\bconst heroes\s*=/, 'heroes =');`
- Apply the same pattern for any other top-level `const` arrays you need from the DB
- `cardDatabase.js` assigns `window.henchmen = henchmen` etc. at the end — stub `window` in the vm context: `const context = { window: {} };` or the script crashes with "window is not defined"
- Reusable extraction script: `scripts/extract-hero-data.js <FolderName>` — pass the image folder name (e.g. `"Dark City"`, `"GotG"`, `"PtTR"`) to extract hero data for any expansion

## Randomize Button Event Gotcha

- `randomizeMastermind()`, `randomizeScheme()`, etc. set radio `.checked = true` programmatically — this does NOT fire DOM `change` events. Any new logic added via `addEventListener('change', ...)` on setup screen forms must ALSO be called directly inside the corresponding `randomize*()` function, or it won't trigger when users click Randomize.

## Mastermind Code Gotchas

- Mastermind names in `cardDatabase.js` must be matched exactly — `"The Supreme Intelligence of the Kree"` not `"Supreme Intelligence"`. Wrong names silently return `undefined` from `masterminds.find()`.
- `showConfirmChoicesPopup` receives a stub `{ name: selectedMastermind }` from its caller (~line 3514) — not a full mastermind object. Code inside needing `mastermind.alwaysLeads` etc. must call `masterminds.find(m => m.name === mastermind.name)` internally.
- `getSelectedMastermind()` already exists in `script.js` — use it instead of manual DOM + `masterminds.find()` lookups in setup screen functions.
- **Epic masterminds are a runtime object-spread overlay, not a separate DB entry.** `script.js:868` returns `{ ...baseMastermind, ...baseMastermind.epic }` when the Epic checkbox is checked — runtime `mastermind.name` becomes `"Epic Mandarin"` (etc.) and all overlaid fields (`attack`, `masterStrike`, `image`) take their epic values. Detect via `mastermind.name === "Epic X"`.

## Out of Scope

- Any changes to What If? Solo behavior outside the expansion pipeline (What If? adaptations for new expansions ARE in scope via `/analyze-expansion`)
- Two Handed mode

## Reference Files

- `rules/` — PDF rulesheets for all expansions. Read tool PDF support works when VS Code is launched with the full user PATH (so `pdftoppm` is accessible). It's intermittent: try `Read` first; if it fails with a pdftoppm error, **stop and tell the user** to fully close and reopen VS Code (not just reload window), then retry. Do not use pdftotext or any other workaround.
- `docs/card-inventory/final/` — finalized card inventory files; source of truth for audits. 10 finalized (Into the Cosmos 2026-04-05).
- `docs/card-inventory/card-reading-rules.md` — card image reading rules, DB authority, inventory template notes, expansion-specific card types
- `docs/expansion-asset-pipeline.md` — staging structure, naming conventions, import mapping, inventory process, visual reference setup
- `docs/expansion-pipeline-status.md` — pipeline progress table for all expansions
- `docs/expansion-mechanics/` — mechanics reference docs produced by `/analyze-expansion`
- `docs/expansion-progress/` — implementation progress files produced by `/new-expansion`
- `docs/known-issues.md` — detailed descriptions of open/deferred issues
- `docs/golden-solo-history.md` — Golden Solo implementation history, architectural rules, testing checklist

## Planned Work (in order)

1. ✅ UI revisions, Golden Solo villain fix, health check (phases 1+2), card effect auditor — all merged to master by 2026-03-31
2. **Expansion content** — complete inventories for all expansions (both tracks), then implement one at a time
   - **Two inventory tracks — see `docs/expansion-pipeline-status.md` for full status and per-expansion notes.** Track A (new expansions): stage → inventory (PDF-primary) → verify → user review → move to `final/`. Track B (in-game expansions): inventory (DB-primary) → verify → user review → move to `final/`.
   - **Current position:** See `docs/expansion-pipeline-status.md` for full pipeline status. Active focus: Revelations Phase 4 (fix plan + playtest, on `revelations` branch).
   - `/analyze-expansion` → `/new-expansion` pipeline is ready. Run `/analyze-expansion` first (produces mechanics reference), then `/new-expansion` (multi-phase code integration with progress tracking).
   - **Revelations:** Phases 1-3 complete. Phase 4 in progress (fix plan + playtest). All work on `revelations` branch (`.worktrees/revelations`). Fix plan: `docs/superpowers/plans/2026-04-12-revelations-phase4-fixes.md` (inside worktree). Full status and issue table: `docs/expansion-progress/revelations.md`.
3. **Project optimization fixes** — 5 workflow fixes identified 2026-04-14, plan at `docs/superpowers/plans/2026-04-14-project-optimization-fixes.md`. P1/P3/P4 have no blockers. **P2 blocked:** confirm which of Revelations fixes 1A/1B/1C are applied. **P5 blocked:** choose Option A (warning hook) or Option B (flip sync direction) for CLAUDE.md/worktree sync.

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
- `/analyze-expansion` — collaborative rules analysis; produces mechanics reference in `docs/expansion-mechanics/`
- `/new-expansion` — multi-phase code integration with progress tracking in `docs/expansion-progress/`

**Skills (other):**
- `/game-test` — Playwright orchestrator. Drives the live game in a real browser for verification (post-fix), diagnostic (pre-implementation scoping), reproduction, or regression. Handles HTTP-server setup, 1920×1080 viewport, state injection, screenshots, and results tracking. Reach for it on any bug-list work where deterministic state-injection beats manual playtest.
- `/golden-solo-fixer` — executes remaining Golden Solo compatibility audit fixes
- `/deploy` — pre-push checklist + push to master + GitHub Pages verification
- **`/write-plan` default-location gotcha:** Superpowers' `writing-plans` skill drops output at `~/.claude/plans/{auto-slug}.md` by default — a **global** path with a machine-generated name (e.g. `temporal-coalescing-kettle.md`). For project work, override with an explicit in-repo path like `docs/superpowers/plans/YYYY-MM-DD-descriptive-name.md` inside the active worktree, or move+rename the file immediately after creation and update any references.

**Subagents:**
- `codebase-navigator` — targeted code searches without flooding context
- `audit-tracker` — scans card files for remaining compatibility fixes
- `revision-tracker` — scans HTML/JS for UI revision progress
- `expansion-validator` — validates expansion JS against 7 Golden Solo rules; run as Phase 4 of `/new-expansion`
- `card-effect-auditor` — compares card reference data against code implementations

**MCP Servers:**
- **Playwright MCP** — Microsoft `@playwright/mcp@latest`, local-scope (this project only). Drives a real Chromium browser: click, fill, screenshot, read DOM, evaluate JS in the page. **Use for:** bug verification where a specific game state reproduces the issue — inject state via `browser_evaluate` (skip setup, pre-stack decks, jump to a UI state), then verify via DOM / onscreenConsole / screenshot. Bug-backlog triage, regression checks, deterministic reproductions. **Don't use for:** subjective UX feel, randomness-dependent multi-turn flows, anything needing real play instincts. **Setup quirks:** `file://` is blocked — launch via a local Python HTTP server pointed at the game's directory; default viewport is narrow (~400px = mobile layout), set 1920×1080 at session start; `sw.js` 404 console error on local-serve is expected noise (path-prefix mismatch with GitHub Pages), not a bug. Full install history + deeper gotchas: `D:\Claude Code\cc-helper\docs\cc-guide.md` → Playwright MCP entry.
- **GitHub MCP** — check deployment status, issues, Actions logs without leaving chat.

**References:**
- `docs/card-inventory/final/` — per-expansion card data and effect text, source of truth for audits. 10 finalized (Into the Cosmos 2026-04-05). X-Men in `drafts/` awaiting Pass 2.
- `docs/card-effect-audit-results-2026-03-31.md` — first audit run (65 issues, but **not reliable** — ran against old reference files). Re-run ready.

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

## Golden Solo Implementation

Complete and stable. Mode flag: `gameMode` (`'whatif'` | `'golden'`). Full history, architectural rules, and testing checklist: `docs/golden-solo-history.md`

---

## Known Issues / Deferred

Details in `docs/known-issues.md`. Summary:
- **Hero name truncation** on narrow screens — accepted, revisit in next UI pass
- **Kree-Skrull War villain count** — rules decision needed (What If? Solo 1-group cap vs. scheme's 2-group requirement)
- **"Other player" effects** — inconsistent solo handling; full review deferred until all inventories are finalized (will be addressed by `/analyze-expansion`)
