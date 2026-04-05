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

| File | Lines | Purpose |
|------|-------|---------|
| `script.js` | 19,322 | Core game engine — turn logic, UI, villain deck, HQ, mastermind, city |
| `cardAbilities.js` | 17,704 | Hero card effects — Core set |
| `cardAbilitiesDarkCity.js` | 16,972 | Hero card effects — Dark City expansion |
| `cardAbilitiesSidekicks.js` | 2,470 | Sidekick card effects |
| `cardDatabase.js` | 9,869 | All card data definitions |
| `index.html` | 1,830 | Setup screen + game board HTML |
| `styles.css` | 8,804 | All styling |
| `expansionFantasticFour.js` | 5,851 | Fantastic Four expansion |
| `expansionGuardiansOfTheGalaxy.js` | 7,052 | Guardians of the Galaxy expansion |
| `expansionPaintTheTownRed.js` | 5,582 | Paint the Town Red expansion |
| `updatesContent.js` | 475 | Patch notes |

## How to Run

Open `Legendary-Solo-Play-main\Legendary-Solo-Play-main\index.html` directly in a browser. No server, build step, or install needed.

## Deployment

- Game is hosted on GitHub Pages at: `https://LoserChallenge.github.io/marvel-legendary/`
- Push to `master` branch deploys automatically (~1 min delay; hard refresh `Ctrl+Shift+R` to bust cache)
- Rules PDFs (105MB) are gitignored — local only
- Core Set card images are in `Visual Assets/Heroes/Reskinned Core/` (not a subfolder named "Core Set")

## Platform & Constraints

- Windows 11, VS Code
- Static HTML/JS/CSS — no server, no build step, opens directly in a browser
- No package.json / no npm
- User is on Claude Pro — no API usage
- `node` is installed at `C:\Program Files\nodejs\node.exe` but not on the Bash tool's PATH — manual `node --check` will fail; rely on the hook runner instead
- When running Node `-e` scripts, use relative paths from the working directory — absolute Windows paths with backslashes get mangled by double-escaping
- `poppler` installed via winget; binaries copied to `C:\Users\Paul\bin` — Bash tool can run `pdftoppm`/`pdftotext` directly.
- `pdftoppm` PNG output: always pass `-png` flag — without it, outputs `.ppm` files. Output filenames auto-include a hyphen separator (e.g., `prefix-01.png` not `prefix1.png`).
- Rules PDFs are in `rules/` — read them with the Read tool as needed (visual layout and icons included).
- **PDF token cost:** Each page = one image render regardless of text size — use default (smaller) text to fit more content per page and reduce page count. Never attach PDFs in chat; always use the Read tool with page ranges.
- **Expansion inventory PDFs:** User places them in `expansions/[expansion-name]/` (e.g. `expansions/revelations/revelations-Inventory.pdf`). Always read page-by-page with the Read tool. **Never use pdftotext or any other conversion tool on these PDFs** — they contain reference images that must be read visually. If the Read tool fails on any PDF, **stop immediately and tell the user** — do not attempt any workaround. Known fix: the Read tool's PDF renderer relies on `pdftoppm` being on PATH at VS Code launch time — if it fails, ask the user to fully close and reopen VS Code (not just reload window), then retry.

## JS/HTML Pairing Rule

When removing an HTML element, always grep `script.js` for matching `getElementById()` calls at the top level. Null references at the top of `script.js` crash ALL subsequent listener registration silently (e.g., removing `#donate-call-to-action` from HTML broke the Welcome popup close button because `script.js` crashed before registering its listener).

## GitHub Pages / HTTP Serving Gotchas

- Browsers on `https://` treat uncaught JS errors more strictly than `file://` — errors that silently fail locally can crash the loading screen on GitHub Pages
- `initCosmicBackground()` and `initSplash()` in `expansionGuardiansOfTheGalaxy.js` assume DOM elements that don't exist — both have null guards added; any future expansion splash code must do the same
- `drawVillainCard()` must NOT be called inside `initGame()` — it shows a popup requiring player input, causing a deadlock while the loading screen is still visible. It is called in `onBeginGame()` after the loader hides (~line 3571)

## CSS Grid Overflow Gotcha

- Grid columns using `1fr` do not shrink below content size by default — use `minmax(0, 1fr)` and `min-width: 0` on children when text must truncate rather than push other columns off-screen

## Async Gotchas

- When making a card ability function `async`, grep for ALL its call sites and add `await` there too — callers in `cardAbilities.js` and expansion files are often sync and will silently fire-and-forget otherwise (this was missed for `heroSkrulled` callers in health check phase 2 and caught by code review).

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

## Mastermind Code Gotchas

- Mastermind names in `cardDatabase.js` must be matched exactly — `"The Supreme Intelligence of the Kree"` not `"Supreme Intelligence"`. Wrong names silently return `undefined` from `masterminds.find()`.
- `showConfirmChoicesPopup` receives a stub `{ name: selectedMastermind }` from its caller (~line 3514) — not a full mastermind object. Code inside needing `mastermind.alwaysLeads` etc. must call `masterminds.find(m => m.name === mastermind.name)` internally.
- `getSelectedMastermind()` already exists in `script.js` — use it instead of manual DOM + `masterminds.find()` lookups in setup screen functions.

## Out of Scope

- Any changes to What If? Solo behavior outside the expansion pipeline (What If? adaptations for new expansions ARE in scope via `/analyze-expansion`)
- Two Handed mode

## Reference Files

- `revisions-additions.md` — prioritised list of planned UI/setup screen changes
- `card-directory.pdf` — full card list for all expansions with faction symbols
- `rules/` — PDF rulesheets for all expansions. Read tool PDF support works when VS Code is launched with the full user PATH (so `pdftoppm` is accessible). It's intermittent: try `Read` first; if it fails with a pdftoppm error, **stop and tell the user** to fully close and reopen VS Code (not just reload window), then retry. Do not use pdftotext or any other workaround.
- `docs/card-inventory/final/` — finalized card inventory files; source of truth for audits. 8 finalized (2026-04-04).
- `docs/card-inventory/card-reading-rules.md` — card image reading rules, DB authority, inventory template notes, expansion-specific card types
- `docs/expansion-asset-pipeline.md` — staging structure, naming conventions, import mapping, inventory process, visual reference setup
- `docs/expansion-pipeline-status.md` — pipeline progress table for all expansions
- `docs/expansion-mechanics/` — mechanics reference docs produced by `/analyze-expansion`
- `docs/expansion-progress/` — implementation progress files produced by `/new-expansion`

## Planned Work (in order)

1. ✅ UI revisions, Golden Solo villain fix, health check (phases 1+2), card effect auditor — all merged to master by 2026-03-31
2. **Expansion content** — complete inventories for all expansions (both tracks), then implement one at a time
   - **Two inventory tracks — see `docs/expansion-pipeline-status.md` for full status and per-expansion notes.** Track A (new expansions): stage → inventory (PDF-primary) → verify → user review → move to `final/`. Track B (in-game expansions): inventory (DB-primary) → verify → user review → move to `final/`.
   - **Current position (2026-04-04):** All 5 in-game expansions + Revelations + Secret Wars Vol. 1 + Heroes of Asgard fully finalized in `card-inventory/final/` (8 total). X-Men Pass 1 complete (awaiting Pass 2). S.H.I.E.L.D. staged (awaiting Pass 1). Track A new expansions next.
   - `/analyze-expansion` → `/new-expansion` pipeline is ready. Run `/analyze-expansion` first (produces mechanics reference), then `/new-expansion` (multi-phase code integration with progress tracking).

## Visual Reference Setup ✅ Complete

For inventory sessions: read `docs/card-inventory/icons/icon-reference.md` at session start. Full details in `docs/expansion-asset-pipeline.md`.

## Expansion Asset Pipeline

Staging structure, file naming conventions, staging process steps, card inventory sources, and import mapping — see `docs/expansion-asset-pipeline.md`.

**Key facts (inlined for quick reference):**
- **Staging area**: `expansions/[name]/` at project root (outside game root)
- **Production**: `Visual Assets/` inside the game root
- **Inventory**: 3-pass process — `/inventory-creator` → `/inventory-verifier` → user spot-check
- **Pipeline status**: `docs/expansion-pipeline-status.md` for full progress table

## Golden Solo Rules Summary

- **Setup:** 5 heroes always; villain deck = 2-player rules (2 bystanders default, 10 henchmen shuffled in); hero deck restructured (10-card starting stack on top, Rares shuffled into main deck)
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
- `/golden-solo-fixer` — executes remaining Golden Solo compatibility audit fixes
- `/deploy` — pre-push checklist + push to master + GitHub Pages verification

**Subagents:**
- `codebase-navigator` — targeted code searches without flooding context
- `audit-tracker` — scans card files for remaining compatibility fixes
- `revision-tracker` — scans HTML/JS for UI revision progress
- `expansion-validator` — validates expansion JS against 7 Golden Solo rules; run as Phase 4 of `/new-expansion`
- `card-effect-auditor` — compares card reference data against code implementations

**References:**
- `docs/card-inventory/final/` — per-expansion card data and effect text, source of truth for audits. 8 finalized (2026-04-04). X-Men in `drafts/` awaiting Pass 2.
- `docs/card-effect-audit-results-2026-03-31.md` — first audit run (65 issues, but **not reliable** — ran against old reference files). Re-run ready.

**Other:**
- Git worktrees: `.worktrees/` is gitignored; feature branches at `.worktrees/<branch-name>`
- GitHub MCP installed — check deployment status, issues, Actions logs without leaving chat

## Workflow Preferences

- When a plan or prior discussion specifies worktrees/branch isolation, follow that approach — confirm with user if deviating
- Always read and understand code before proposing changes
- Propose a plan and get approval before editing any files
- Use the `codebase-navigator` subagent for searching large files
- Explain all terminal steps in plain English

## Golden Solo Implementation

All 7 phases implemented and stable (2026-03-09). Compatibility audit complete (2026-03-26). Mode flag: `gameMode` global (`'whatif'` | `'golden'`). Key functions: `goldenRefillHQ()`, `goldenHQRotate()`, bystander discard popup, Final Showdown, hero deck restructuring.

Full history (bug fixes, testing checklist, audit details): `docs/golden-solo-history.md`

**Key architectural rule:** `enterCityNotDraw = true` does NOT suppress the Golden Solo block. Mid-turn card effects must call `processVillainCard()` (single draw) not `drawVillainCard()` (full round). Any new expansion card that draws a villain card mid-turn must follow this same pattern.

**"Other Player" effects:** Keep the existing silent skip for Golden Solo — do not apply hero superpower bonuses to the hero deck. New expansion cards with "each other player" wording should follow the same approach.

---

## Known Issues / Deferred

- **Summary panel hero names truncate on narrow screens** — accepted for now; revisit in next UI pass.
- **"Other player" effects — broader solo mode review** — needs a dedicated conversation (see below)
- **Kree-Skrull War scheme villain count** — needs rules decision (see below)

### Scheme vs Game Mode villain count conflict

**Symptom:** The Kree-Skrull War scheme enforces both Kree Starforce and Skrulls as required villain groups in What If? Solo, even though What If? Solo is normally a 1-villain-group mode.

**Root cause:** `getEffectiveSetupRequirements` returns the scheme's `specificVillainRequirement` array unchanged in What If? mode. Kree-Skrull War has 2 specific requirements, so both are enforced regardless of game mode.

**The open question:** For schemes that explicitly require 2 villain groups (Kree-Skrull War), should What If? Solo honour the scheme's count (2) or always cap at 1? This is a rules interpretation question that needs a deliberate decision before fixing.

**Status:** Deferred — needs rules clarification before implementation.

### "Other player" effects in solo mode

**Problem:** The current rule is "silent skip" for Golden Solo — but the codebase isn't consistent. Some cards correctly suppress the effect, while others apply it to the active player instead. The inventory passes have surfaced specific cases:

**Known inconsistencies (found during inventory):**
- **Shriek (PtTR)** — Card says "each other player gains a Wound." Code applies wound to active player. Should be suppressed per the current rule.
- **Death (Dark City)** — Code scope includes played cards + artifacts; card says hand only. (Separate bug, but same category of "check all villain effects against card text.")

**The bigger question:** Not all "other player" effects translate cleanly to a 1-player game. Some are purely negative (Shriek's wound — skip makes sense), some are mixed (reveal-or-penalty — does the solo player reveal?), and some affect game state in ways that matter even solo. A blanket "suppress all" rule may not be correct for every case.

**What's needed:** After all expansion inventories are complete, do a single pass across all expansions to catalogue every "other player" / "each other player" / "each player" card, then decide case-by-case how each should behave in Golden Solo.

**Status:** Deferred — waiting until all expansion inventories are finalized so the full list is available.
