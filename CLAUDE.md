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
- **Game-test serve-path trap (worktree work):** when serving the game for `/game-test`/Playwright from a worktree, root the HTTP server at the WORKTREE's game directory using a path relative to the worktree root — NEVER an absolute path. An absolute path can resolve to the MAIN folder (`master`) and silently serve stale code without the branch's changes, so you verify against the wrong code and get false confidence. Confirm the served build has your changes before trusting any result.
- **State-injection binding trap:** `citySize`, `cityReserveAttack`, `totalAttackPoints`, `cumulativeAttackPoints` are top-level `let` (NOT window-aliased); only `mastermindReserveAttack` is `var` on `window`. Inject test state via bare assignments (`citySize = 7`) to hit the lexical bindings — `window.citySize = 7` won't take.

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

- Villain cards are NOT cloned during ambush placement — `processRegularVillainCard()` at `script.js:5140` does `city[sewersIndex] = villainCard` as a direct reference, so ambush mutations like `villainCard.capturedHero = [...]` persist on the city copy automatically.
- The real copy happens at fight time: `createVillainCopy()` at `script.js:12209` is a hand-rolled whitelist copier that defeatVillain() passes to fight-effect functions. **Any custom state added at ambush time must be added to the `createVillainCopy()` whitelist**, or the fight effect receives a stripped copy. `city[cityIndex]` is also nulled before the fight effect runs, so fight-effect functions cannot fall back to iterating `city[]` — they must read from the villainCopy parameter passed in.
- Pattern for arrays: follow the `bystander: [...(villainCard.bystander || [])]` line in `createVillainCopy()`.
- Caught by: Klaw capture (Revelations Phase 4 playtest 2026-04-12). `capturedHero` was set correctly on the city copy during ambush, but `createVillainCopy()` dropped it before `klawFight()` ran. Fixed 2026-04-14 by adding `capturedHero` to the whitelist and rewriting `klawFight(klaw)` to use its parameter.

## transformScheme() Limitation

- `transformScheme()` in `script.js` only swaps the scheme image/name/object — it does NOT resize the city. Schemes that change city size (Earthquake/Tsunami) need a separate `resizeCityForScheme(newSize)` call. As of Phase 4 playtest (2026-04-12), this function does not exist yet and is part of the fix plan.
- **Selector gotcha (caught 2026-05-28):** `#scheme-place` contains TWO `<img>` elements — the always-hidden BabyHope token (`<div id="scheme-token" style="display:none;">` in `index.html`) AND the visible scheme card image appended by `initGame()` with class `card-image`. Generic selectors like `#scheme-place img` match the BabyHope token FIRST (document order) and silently mutate an invisible element, leaving the visible scheme card unchanged. Always target the visible card explicitly: `#scheme-place img.card-image`. Same pattern likely exists in other game cells with hidden token elements — verify selector specificity whenever you're updating an in-game card image.
- **`selectedScheme` global gotcha (caught 2026-05-28):** Most scheme-reading code in `script.js` uses a *local* pattern (`const selectedScheme = schemes.find(...)` from the setup-screen radio button), so the GLOBAL `selectedScheme` is NOT pre-populated by setup. `transformScheme()` (and any other code that wants to track "current scheme" across transforms) must lazy-init `window.selectedScheme` from the DOM radio on first use, then read/write the global on subsequent calls. Without the lazy init, the first call throws `ReferenceError: selectedScheme is not defined` and the upstream try/catch swallows it silently — the player sees nothing happen.

## Browser Cache Discipline for Local Playwright Testing

- Chromium aggressively caches `script.js` (and other static files) when served by Python `http.server`. The Service Worker is not active in local-serve mode (registration 404s because of GitHub Pages path-prefix mismatch), but the browser's HTTP cache alone is enough to serve stale code through normal `Ctrl+R` page refreshes.
- **Hard refresh isn't always enough.** `Ctrl+Shift+R` typically works, but the most reliable cache flush in Chromium is: **F12 → right-click the toolbar refresh button → "Empty Cache and Hard Reload"**. Recommend this to Paul whenever a fix has just been applied and a real-game playtest is the verification step.
- For Playwright sessions: if a code-on-disk fix isn't reflected in `<function>.toString()`, monkey-patch the new implementation into `window.<funcName>` via `browser_evaluate` to verify the LOGIC, then ask Paul to do a full cache flush when he tests interactively.
- **Always check dev-tools console for errors when verifying a fix.** A function that fails silently upstream (caught by try/catch with `console.error`) produces no on-screen-console signal but leaves a clear trace in F12 → Console. Caught 2026-05-28 — transformScheme threw `ReferenceError` for weeks and nobody noticed because the wrapping try/catch only printed to dev tools.

## Implicit-Global Trap in Eval-Based Tests

- Caught 2026-05-28 during Playwright diagnostic of `transformScheme()`. The function reads a non-existent global (`selectedScheme`) and throws in production. My diagnostic test assigned `selectedScheme = schemes.find(...)` inside `browser_evaluate` — in non-strict mode this creates an implicit global, masking the missing-initialization bug. Test passed; real game still crashed.
- Rule: when testing functions that read globals, **wipe `window.<globalName>` before each test invocation** to force the cold-start path. Use `window.<name> = undefined; delete window.<name>;` to reset cleanly. Don't write `globalName = value` — that creates implicit globals in non-strict scripts and hides initialization bugs.
- Also: when a test passes but the real game still fails, the test is wrong before the production code is. Run cold tests (no implicit setup) and check dev-tools console for errors after every invocation.

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

**Key rule (inlined because it applies to all card work):** The expansion **inventory is the official source for card CONTENT** — attack, VP, cost, effect text, what each card does. Canonical files: `expansions/[name]/[name]-reference.md` (BGG-derived reference) and `docs/card-inventory/final/[name].md` (finalized inventory). Read card content from the inventory, **NEVER from card images** — images are a last resort only for effect text the inventory genuinely lacks; never read numbers off card art, never guess from icons. If `cardDatabase.js` disagrees with the inventory on a value (e.g. a stale or zeroed attack/VP), **the inventory wins — correct the DB.** `cardDatabase.js` stays authoritative ONLY for field FORMAT/conventions — exact class-name strings (`"Range"` not `"Ranged"`), color mapping, field structure; don't import the inventory's terminology verbatim. Flag genuinely uncertain data for human spot-check.

**Coordinators:** route worker sessions and subagents to the inventory files as the authoritative source for any card-data question. Never point them at card images for card numbers or effects. *(Why: an image-read subagent misread a Mastermind Tactic's 6 VP as a recruit cost and reported VP 0 — the inventory had it right.)*

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
   - **Revelations:** Phases 1-3 complete. Phase 4 in progress. All work on `revelations` branch (`.worktrees/revelations`). Fix plan: `docs/superpowers/plans/2026-04-12-revelations-phase4-fixes.md`. Full status: `docs/expansion-progress/revelations.md`.
     - **Phase 4 progress (2026-04-15):** Tier 1 fixes 1B/1C/1D/1E/1F all complete. 1A (scheme transform + city resize) pending — needs empirical diagnostic before implementing. Next: Tier 2 popup fixes starting with 2A (KO-from-discard helper → reused by 2B/2D/2E), then 2C (Mandarin strike placement refactor).

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
- `/analyze-expansion` — collaborative rules analysis; produces mechanics reference in `docs/expansion-mechanics/`; final step dispatches `pattern-reuse-scout`
- `/new-expansion` — multi-phase code integration with progress tracking in `docs/expansion-progress/`; Phase 4 runs `/expansion-audit`
- `/expansion-audit` — pre-merge audit pipeline: dispatches `engine-integration-auditor` → `expansion-validator` → 6 card-type auditors + `keyword-consistency-auditor`, consolidates findings to `docs/audit-results/`. Spec: `docs/superpowers/specs/2026-05-28-expansion-audit-pipeline-design.md`

**Skills (other):**
- `/game-test` — Playwright orchestrator. Drives the live game in a real browser for verification (post-fix), diagnostic (pre-implementation scoping), reproduction, or regression. Handles HTTP-server setup, 1920×1080 viewport, state injection, screenshots, and results tracking. Reach for it on any bug-list work where deterministic state-injection beats manual playtest.
- `/golden-solo-fixer` — executes remaining Golden Solo compatibility audit fixes
- `/deploy` — pre-push checklist + push to master + GitHub Pages verification
- **`/write-plan` default-location gotcha:** Superpowers' `writing-plans` skill drops output at `~/.claude/plans/{auto-slug}.md` by default — a **global** path with a machine-generated name (e.g. `temporal-coalescing-kettle.md`). For project work, override with an explicit in-repo path like `docs/superpowers/plans/YYYY-MM-DD-descriptive-name.md` inside the active worktree, or move+rename the file immediately after creation and update any references.

**Subagents:**
- `codebase-navigator` — targeted code searches without flooding context
- `audit-tracker` — scans card files for remaining compatibility fixes
- `revision-tracker` — scans HTML/JS for UI revision progress
- `expansion-validator` — validates expansion JS against 7 Golden Solo rules; run inside `/expansion-audit`
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
- **When executing a fix plan written in a prior session, verify each fix's stated root cause empirically before implementing.** Apply Phase 1 of systematic-debugging to the plan's hypothesis, not just to the original bug. Prior-session plans can be based on incomplete playtest observation and may misdiagnose — don't trust-and-apply.

## Session Roles & Folder Discipline (worktree)

- You are in the **EXPANSION WORKTREE** — the worker/dev copy. All expansion development happens HERE.
- The main project folder runs coordinator/director sessions (master = the stable, shippable game). Do NOT reach into the main folder from here (no `git -C` into it); if the main folder is needed, a session is opened there directly.
- Commit before you stop — commits are save points; commit work-in-progress freely even if broken; never leave uncommitted work (the worktree isolates it from master).
- This worktree's CLAUDE.md is the live copy during the expansion.
- **Card data comes from the inventory, not card images.** For any card-data question (attack/VP/cost/effect text), route workers and subagents to the expansion inventory files — see "Card Reading & Inventory Rules" below. Never let a worker or subagent read structured card numbers off card art.
- **Independent review is a required gate, not optional self-check.** The implementing session's own verification (e.g. `/game-test`) is never sufficient alone — cold-read review must be subagent-delegated (its reviewers run in fresh context). Coordinators bake into EACH fix-group's done-criteria: run `expansion-validator` (on touched expansion files) + `/code-review` on the diff before calling the group done. **Verify mode-sensitive fixes in BOTH `gameMode` `'whatif'` and `'golden'`** — `expansion-validator` is Golden-Solo-only, so What If? divergences (behavioral, not structural) are caught via dual-mode verification + `/code-review` flagging `gameMode` branching, never by the validator. Before merge: full pass — `expansion-validator` + `/code-review` (high) + `sandbox-review` (separate session) + user playtest (both modes where relevant). Don't skip these because a fix "looks small."
- **Rules/mechanics ambiguity goes to the expansion rules PDF before assumption or escalation.** When a card interaction, keyword, or solo-mode handling is ambiguous — "each other player" effects, keyword stacking, how a mechanic resolves in 1-player solo, what a fight/defeat requirement actually is — consult the expansion's rules PDF in `rules/` (the canonical home for all rulebooks — Core, solo rulesets, every expansion; an expansion still being staged may have its PDF only in `expansions/[name]/`) alongside the inventory before implementing on a guess or asking Paul. Route workers and subagents there too — or use the `rules-oracle` subagent, which does this lookup and cites source + page. Together the inventory (card content) and the rules PDF (mechanics/interactions) resolve most questions; escalate to Paul only what both genuinely leave open. *(Why: Cluster C implemented the ~10 Location "each other player" triggers as announce-and-skip on an interim convention; the Revelations rulebook's solo rule — "when a Location tells 'each other player' to do something, do it yourself" — would have settled it pre-implementation and avoided the rework.)*
- **Reuse-first: survey prior art before building any new mechanic.** Before implementing a NEW mechanic/feature (new scheme/keyword behavior, bespoke counter or board indicator, resource-spending player action, gain/move helper — NOT a localized bug fix), the diagnose phase MUST include a `pattern-reuse-scout` survey for existing implementations (scheme-specific state/counters, board indicators, Recruit/Attack-spending actions, gain/move-card helpers). Coordinators bake the survey into the diagnose dispatch by default; the worker runs the scout and reports what exists vs. what's genuinely missing. Justify every new function by showing no existing pattern fit — adapt before building fresh.
- Full canonical rules live in master's CLAUDE.md under "Session Roles & Folder Discipline (READ FIRST)" — preserve them when reconciling CLAUDE.md at merge.

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

**Villain-side scheme overrides:** `getEffectiveSetupRequirements()` in `script.js:3248` is the single source of truth for setup validation. It combines scheme fields (`requiredVillains`, `specificVillainRequirement`, `extraVillainGroups`) with game-mode rules (Golden Solo base = 2 villain groups) and mastermind `alwaysLeads`. Setup display, start-game validator, and checkbox auto-lock all read from it — no caller bypasses it. New scheme-specific villain overrides should extend this function, not the call sites.

- **`extraVillainGroups: N`** (added 2026-04-15 for Revelations Earthquake/Tsunami) — Golden Solo adds N extra villain groups on top of the base 2. What If? Solo ignores this field (uses `requiredVillains` directly). Applied in `getEffectiveSetupRequirements()` Golden Solo branch only.

## Golden Solo Implementation

Complete and stable. Mode flag: `gameMode` (`'whatif'` | `'golden'`). Full history, architectural rules, and testing checklist: `docs/golden-solo-history.md`

---

## Known Issues / Deferred

Details in `docs/known-issues.md`. Summary:
- **Hero name truncation** on narrow screens — accepted, revisit in next UI pass
- **Kree-Skrull War villain count** — rules decision needed (What If? Solo 1-group cap vs. scheme's 2-group requirement)
- **"Other player" effects** — inconsistent solo handling; full review deferred until all inventories are finalized (will be addressed by `/analyze-expansion`)
- **Villain/Mastermind overlay UX pass** — bystanders and captured heroes currently shrink to small thumbnails on the villain/mastermind card. Refactor to match the Location fan-out pattern (full-size cards shifted in position to mimic physical tabletop stacking). Cross-cutting — touches base game, every expansion. Defer until Revelations merges.
