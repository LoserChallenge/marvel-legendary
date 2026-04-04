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

## Card Image Reading Gotcha

- `cardDatabase.js` is the authoritative source for class, team, cost, condition, and base attack/recruit values — NEVER override these from card images
- Card images should ONLY be used to extract the **effect text** (the written description of what the card does) which is not stored in the database for hero cards
- Class icons (Tech gear, Covert eye, Strength fist, Instinct bolt, Ranged crosshair) and team icons (X-Men X, Avengers A, S.H.I.E.L.D. eagle) are easily confused by image readers — always trust the DB fields
- The small `[ClassName]:` or `[TeamName]:` trigger icons embedded in effect text (e.g. the icon before "Gain another Shard") are equally prone to misreading — after recording an effect, cross-check the trigger icon against (a) the card's own class/team in the DB and (b) what the code actually checks; a mismatch means the image was likely misread, not that the code is wrong
- When building card reference data: pull all structured fields from DB first, then read images only to fill in the effect text column
- Hero card layout: upper-left (top) = Team affiliation; upper-left (bottom) = Class (stacked directly below Team); lower-left = Base Value (attack/recruit when played); lower-right = Cost (recruit to acquire). Villain/Mastermind/Henchmen: lower-right = Fight value.
- Silver Surfer (Fantastic Four set) is the only hero with no team affiliation — his team slot is empty. This is correct; do not flag as missing data.
- When reading effect text from images: if the text starts with `[Tag]:` (a trigger condition), cross-check that Tag against the DB `condition` field. Match → write as-is. Mismatch → flag in "Needs Review" for manual review, do not guess.
- New expansion cards (not yet in DB): use per-corner reads — target each corner of the image explicitly rather than reading the whole card at once, to minimise corner confusion.
- **Never use thematic, flavor, or contextual reasoning to guess uncertain card data.** If a value cannot be confirmed from available assets, flag as ⚠️ and leave for human spot-check — do not guess based on what "makes sense" for a character.
- Glob tool fails on paths containing spaces when searching from the game root (e.g. `Visual Assets/Villains/*.webp` → no results). Use the full project-root path: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/Visual Assets/...`

## Card Effect Inventory Template

Hero card effects in inventory files (working copies in `docs/staging-plans/`, finalized in `docs/card-effects-reference/`) use this format:
- **SPECIAL ABILITY**: Unconditional effect that fires every time the card is played
- **SUPERPOWER**: Conditional effect requiring a prior card of matching class/team played this turn — written as `[ClassName]:` or `[TeamName]:` trigger
- Use `NA` when a card has no Special Ability or no Superpower
- Attack/Recruit shown as `0+` means "starts at 0, modified by ability"; `—` means not applicable

This distinction matters for code: Superpowers require checking `classPlayedThisTurn` or equivalent flag.
- **Villain quantity default:** Villain cards with no `quantity` field in the DB default to **2** (engine uses `quantity || 2`). Group total = sum of all quantities; standard group = 8 cards.
- **Henchmen quantity:** Hardcoded to **10** copies per group in `generateVillainDeck()` at `script.js:3874` — no `quantity` field on henchmen DB objects.
- **Hardcoded villain fight effects:** Some villain fight effects are not in the DB `fightEffect` field but triggered by name-check in `handlePostDefeat()` in `script.js`. Known case: Endless Armies of HYDRA. A DB-vs-code audit will show these as "no fight effect" even though they fire in-game.
- **VP bonus villains:** Some villain VP values are deceptively low because real scoring is in `calculateVillainVP()` as end-of-game multipliers. Known cases: Supreme HYDRA (3× HYDRA count − 1 bonus VP), Ultron (+1 VP per Tech card in deck).

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

- Any changes to What If? Solo behavior
- Two Handed mode

## Reference Files

- `revisions-additions.md` — prioritised list of planned UI/setup screen changes
- `card-directory.pdf` — full card list for all expansions with faction symbols
- `rules/` — PDF rulesheets for all expansions. Read tool PDF support works when VS Code is launched with the full user PATH (so `pdftoppm` is accessible). It's intermittent: try `Read` first; if it fails with a pdftoppm error, **stop and tell the user** to fully close and reopen VS Code (not just reload window), then retry. Do not use pdftotext or any other workaround.
- `docs/card-effects-reference/` — finalized card inventory files for all expansions (both in-game and new); source of truth for audits. `icons/` subfolder holds visual reference PNGs (see Visual Reference Setup below). ⚠️ In-game expansion files still in old format — Track B inventory runs will replace them.
- `docs/expansion-pipeline-status.md` — pipeline progress table for all expansions; update this at the end of every inventory session.

## Planned Work (in order)

1. **UI/Setup Screen improvements** ✅ Complete — merged to master (2026-03-28)
2. **Villain deck rules fix (Golden Solo)** ✅ Complete — merged to master (2026-03-30)
3. **Health check cleanup** ✅ Complete — merged to master (2026-03-30)
4. **Health check cleanup Phase 2** ✅ Complete — merged to master (2026-03-30)
5. **Card Effect Auditor system** ✅ Complete — merged to master (2026-03-31)
6. **Expansion content** — complete inventories for all expansions (both tracks), then review and overhaul `/new-expansion`, then implement one at a time
   - **Two inventory tracks — see `docs/expansion-pipeline-status.md` for full status.** Track A (new expansions): stage → inventory (PDF-primary) → verify → user review → move to `card-effects-reference/`. Track B (in-game expansions): inventory (DB-primary) → verify → user review → replace file in `card-effects-reference/`. CLAUDE.md is updated between each step so the current position is always clear.
   - **Revelations status:** ✅ Pass 1 + Pass 2 complete (2026-04-03). **Next: User final review with physical cards, then Revelations inventory is done.**
   - **Core Set status:** ✅ All passes complete (2026-04-03). Finalized at `docs/card-effects-reference/core-set.md`.
   - **Dark City status:** ✅ Pass 1 + Pass 2 complete (2026-04-03). Pass 2 applied 10 corrections (icon swaps, Attack/Recruit mix-ups, scheme rewrites from physical cards, Evil Wins confirmed). Remaining notes: Cable Disaster Survivalist in-game behavior check; "other player" effects broader review; Death code scope fix (low priority). **Next: File is ready to move to `docs/card-effects-reference/dark-city.md`.**
   - **Fantastic Four status:** ✅ Pass 1 complete (2026-04-03). 5 heroes, 2 villain groups, 2 masterminds, 4 schemes. No henchmen/bystanders in this expansion. New keywords: Focus, Cosmic Threat, Burrow. 8 ⚠️ flags on hero effect text (card images too small — effects derived from code; need physical card spot-check). **Next: Pass 2 — invoke `/inventory-verifier` in a fresh session.**
   - ⛔ **`/new-expansion` IS NOT READY** — do not invoke it under any circumstances. It predates the inventory approach and needs a full review/rewrite once all expansions are staged. The inventory file is one example of what it doesn't yet account for.

## Visual Reference Setup ✅ Complete (2026-04-02)

At the start of each expansion inventory session, `Read` `docs/card-effects-reference/icons/icon-reference.md` — a single text file with hyper-detailed descriptions of all class icons, team icons, recruit/attack icons, card layout anatomy, value notation, and inline trigger icon identification. This replaces loading multiple PNG files.

If any description proves insufficient for a specific card, the original PNG files remain available in `docs/card-effects-reference/icons/` as fallback — `icon-reference.md` Part 9 lists what each file covers.

**Source:** `Icons.pdf` saved to `docs/card-effects-reference/icons/Icons.pdf`; card layout pages extracted from `rules/Legendary_Rules-Core_Set.pdf` pages 5, 7, 8, 10 via `pdftoppm -r 150 -png`.

## Expansion Asset Pipeline

### Overview
- **Staging area**: `expansions/[name]/` at project root — raw images + PDFs per expansion; outside game root so never served by GitHub Pages
- **Production**: `Visual Assets/` inside the game root — heroes go in `Visual Assets/Heroes/[Expansion Display Name]/`, everything else in flat type folders
- **Import mapping** (staging subfolder → production folder):
  - `Heroes/` → `Visual Assets/Heroes/[Expansion Display Name]/`
  - `Villains/` → `Visual Assets/Villains/`
  - `Masterminds/` → `Visual Assets/Masterminds/`
  - `Schemes/` → `Visual Assets/Schemes/`
  - `Henchmen/` → `Visual Assets/Henchmen/`
  - `Bystanders/` → `Visual Assets/Other/Bystanders/`
  - `Sidekicks/` → `Visual Assets/Sidekicks/`
- When it's time to import: copy files directly — no renaming needed at that stage, names are already production-ready

### Staging Subfolder Structure
Every organized expansion folder must have these subfolders (create only what the expansion has cards for):
```
expansions/[expansion-name]/
  Heroes/
  Villains/
  Masterminds/
  Schemes/
  Henchmen/
  Bystanders/
  Sidekicks/
  Locations/   ← only for expansions with Location cards (e.g. Revelations)
```

### File Naming Convention
Prefix = CamelCase expansion name, no spaces (e.g. `Revelations_`, `HeroesOfAsgard_`, `XMen_`, `SecretWarsV1_`)

| Card type | Format |
|---|---|
| Hero | `[Prefix]_[HeroName]_[CardTitle].webp` |
| Villain | `[Prefix]_[VillainGroup]_[CardName].webp` |
| Mastermind lead | `[Prefix]_[MastermindName].webp` |
| Mastermind tactic | `[Prefix]_[MastermindName]_[TacticName].webp` |
| Mastermind epic | `[Prefix]_[MastermindName]_Epic.webp` |
| Scheme | `[Prefix]_[SchemeName].webp` |
| Henchmen (standalone) | `[Prefix]_[CardName].webp` |
| Henchmen (grouped) | `[Prefix]_[HenchmenGroup]_[CardName].webp` |
| Bystander / Sidekick | `[Prefix]_[CardName].webp` |
| Location (villain-group) | `[Prefix]_[VillainGroup]_[LocationName].webp` |

**Name formatting rules:**
- All names CamelCase, no spaces
- Article "The": always at the front — `TheHood`, `TheKorvacSaga` (not `HoodThe`)
- Hyphens: keep when part of the actual card name (`Noh-Varr`, `World-Serpent`, `Electro-Blast`); remove if they replaced spaces in the source filename
- Disambiguators in parentheses: fold in, drop parens — `CaptainMarvelNohVarr` not `CaptainMarvel(Noh-Varr)`
- `+` signs in source filenames: remove, run words together CamelCase
- Villain group cards: parse the group name and individual card name — insert underscore between them

### Staging Process (for each unorganized expansion)
1. Run `ls` on the raw staging folder to see all files
2. Read card images in batches to extract card names where filenames have `_1Rare`/`_2Common`/`_3Common`/`_4Uncommon` suffixes
3. Read mastermind tactic images (numbered Tactic1–4) to extract tactic names
4. **Stop and ask the user before proceeding** when:
   - A card title is partially obscured or unreadable
   - An unfamiliar card type appears (e.g. Henchman-Villain, Location, Henchman Location, or any type not in the table above)
5. Present the full rename plan as a table for user approval before executing any changes
6. After approval: create subfolders, rename files, move into subfolders
7. After organizing: produce the **hero data list** in-chat (see below) — hero name, 4 card names, cost of each, team affiliation, class; flag uncertain icon reads for user confirmation
8. Once user confirms/corrects the list, save finalized version to `docs/staging-plans/[expansion]-card-data.md`
9. **Update CLAUDE.md** after each expansion: mark it ✅, remove resolved pending details, add any interim plan/next-step context needed for seamless session handoff
9. Do NOT invoke `/new-expansion` during staging — that skill is for code implementation only

### Card Inventory

**Three-pass process for every expansion:**
- **Pass 1** — Build the file in a fresh session: `/inventory-creator`
- **Pass 2** — Independent verification in a fresh session: `/inventory-verifier`
- **Pass 3** — User spot-check with physical cards; focused on remaining `⚠️` flags and `[___]` placeholders

**Partial sessions are supported** — state the scope at the start (e.g., "heroes only"). The file accumulates sections across sessions.

**Sources — answer one question to determine which to use:**

> Is this expansion already coded in the game?

**Yes (Core Set, Dark City, F4, GotG, PtTR, any future coded expansion):**
1. `cardDatabase.js` — all structured fields; copy counts derived from `rarity` field
2. `cardAbilities*.js` / expansion files — hero effect text; `script.js` for villain/scheme/mastermind effects
3. Card images in `Visual Assets/Heroes/[Expansion Display Name]/` — spot-check only

**No (Revelations, Secret Wars, Heroes of Asgard, X-Men, all unstaged expansions):**
1. PDF inventory in `expansions/[expansion-name]/` — everything
2. Card images in `expansions/[expansion-name]/` subfolders — cross-check
3. `docs/card-effects-reference/[expansion].md` if exists — additional cross-check

**Output:** `docs/staging-plans/[expansion]-card-data.md`, following `docs/card-effects-reference/TEMPLATE.md` exactly. After Pass 3, move to `docs/card-effects-reference/[expansion].md`.

### Pipeline Status

See `docs/expansion-pipeline-status.md` for the full status table of all expansions.

**secret-wars-vol1 notes (for next session):** Pass 1 complete (2026-04-03) — 1060 lines. 14 heroes, 6 villain groups (incl. dual-nature Manhattan Earth-1610), 4 masterminds, 8 schemes, 3 henchmen groups (incl. dual-nature Thor Corps), 1 bystander, 1 sidekick type, 30 Ambitions (new card type). New keywords: Teleport, Rise of the Living Dead, Cross-Dimensional Rampage, Bribe. **Deferred:** Deadlands (Zombie) villains, Wasteland villains/mastermind, all 30 Ambitions — unique rules, user has no images, low priority. 11 icon flags for user review. **Next: Pass 2 — invoke `/inventory-verifier` in a fresh session.**

**revelations notes (for next session):** Pass 1 + Pass 2 complete (2026-04-03). New card types: Locations (4 per villain group), Transforming Schemes (4 double-sided), Mandarin's Rings (10 unique henchmen), HYDRA Base (Henchman Location). New keywords: Hyperspeed, Dark Memories, Last Stand. **Next: User final review with physical cards.**

## Golden Solo Rules Summary

- **Setup:** 5 heroes always; villain deck = 2-player rules (2 bystanders default, 10 henchmen shuffled in); hero deck restructured (10-card starting stack on top, Rares shuffled into main deck)
- **Each round:** Draw 6; HQ rotates (1 added right, 1 removed left — skip round 1); optional bystander spend to reduce villain draws; draw **2** villain cards; play 6 cards
- **HQ refill:** New card always goes rightmost, others slide left — rotation, not fill-in-place
- **"Other player" effects:** Apply to top card of hero deck (KO or cycle depending on effect)
- **Win:** 4 Mastermind defeats; **Ultimate Victory:** Final Showdown — combined recruit+attack ≥ Mastermind strength+4

## Automations Set Up

- **Git worktrees**: `.worktrees/` directory is gitignored; feature branches live at `.worktrees/<branch-name>`
- **Subagent**: `.claude/agents/codebase-navigator.md` — for targeted code searches without flooding context
- **Hook**: `.claude/hookify.block-asset-edits.local.md` — blocks Edit/Write/MultiEdit on `Visual Assets/` or `Audio Assets/`; reads are allowed
- **Hook**: `.claude/settings.json` — JS syntax check (`node --check`) runs automatically after every `.js` file edit
- **Hook**: `.claude/settings.json` — anti-pattern guard: blocks `drawVillainCard()` calls in `expansion*.js` and `cardAbilities*.js` files (use `processVillainCard()` instead)
- **Subagent**: `.claude/agents/audit-tracker.md` — scans card files for remaining compatibility fixes; use at start of any fix session
- **Subagent**: `.claude/agents/revision-tracker.md` — scans HTML/JS for UI revision progress; use at start of any UI revision session
- **Skill**: `.claude/skills/golden-solo-fixer/SKILL.md` — step-by-step guide for executing compatibility audit fixes; invoke with `/golden-solo-fixer`
- **Skill**: `.claude/skills/new-expansion/SKILL.md` — ⛔ NOT READY, do not invoke — needs full review/rewrite after all expansions are staged
- **Skill**: `.claude/skills/stage-expansion/SKILL.md` — organizes and renames files in a raw staging folder (Step 1 of expansion pipeline); invoke with `/stage-expansion`
- **Skill**: `.claude/skills/inventory-creator/SKILL.md` — builds Pass 1 card inventory file; invoke with `/inventory-creator`. Works for any expansion; supports full or partial scope. Sources determined by whether expansion is in-game or not (see Card Inventory section above)
- **Skill**: `.claude/skills/inventory-verifier/SKILL.md` — Pass 2 independent verification; invoke with `/inventory-verifier`. Same unified approach as Pass 1
- **Hook**: `.claude/settings.json` — worktree warning: PreToolUse advisory when editing `script.js` or `cardAbilities*.js` (large files, consider worktree for substantial changes)
- **Subagent**: `.claude/agents/expansion-validator.md` — validates a finished expansion JS file against all 7 Golden Solo compatibility rules; run as the final step of `/new-expansion` (also not ready)
- **Skill**: `.claude/skills/deploy/SKILL.md` — pre-push checklist + push to master + GitHub Pages verification reminder; invoke with `/deploy`
- **MCP**: GitHub MCP is installed — use it to check GitHub Pages deployment status, open/close issues, and inspect Actions logs without leaving the chat
- **Reference**: `docs/card-effects-reference/` — per-expansion card data and effect text, source of truth for audits (built, hero data needs rebuild)
- **Subagent**: `.claude/agents/card-effect-auditor.md` — compares card reference data against code implementations, flags mismatches (built)
- **Reference**: `docs/card-effect-audit-results-2026-03-31.md` — first audit run results (65 issues flagged, but results are **not reliable** — audit ran against old reference files with known quality issues). Re-run after in-game expansion inventories are complete.

## Workflow Preferences

- When a plan or prior discussion specifies worktrees/branch isolation, follow that approach — confirm with user if deviating
- Always read and understand code before proposing changes
- Propose a plan and get approval before editing any files
- Use the `codebase-navigator` subagent for searching large files
- Explain all terminal steps in plain English

## Implementation Status

All 7 phases of Golden Solo Mode implemented and stable (2026-03-09). Key functions in `script.js`: `goldenRefillHQ()` (~line 4634), `goldenHQRotate()` (~line 4714), bystander discard popup (~line 4533), Final Showdown (~lines 14349–14678), hero deck restructuring (~line 3769). Mode flag: `gameMode` global (`'whatif'` | `'golden'`).

### Post-Launch Bug Fixes (2026-03-09)

| Bug | Fix |
|-----|-----|
| Game Mode radio buttons hidden behind Final Blow panel | `#game-mode-section` `bottom` raised from `44vh` to `62vh` in `styles.css` |
| Confirm Choices showed scheme's hero count (e.g. 3) instead of Golden Solo count (5) | Validation at `script.js` ~line 2996 now reads game mode from DOM instead of stale `gameMode` global |
| RANDOMIZE HEROES always picked 3 regardless of Golden Solo mode | `randomizeHero()` ~line 2379 now reads DOM for Golden Solo hero count |
| RANDOMIZE ALL picked scheme's hero count instead of Golden Solo count | `randomizeHeroWithRequirements()` ~line 2875 now reads DOM for Golden Solo hero count |
| Plutonium Scheme Twist caused 6+ villain cards drawn per round in Golden Solo | `handlePlutoniumSchemeTwist` at `script.js:5469` called `drawVillainCard()` (full round machinery) instead of `processVillainCard()` (single draw) — fixed 2026-03-12 |
| 36 card-effect functions called `drawVillainCard()` mid-turn, triggering full Golden Solo rounds | All 22 Type 1 call sites replaced with `processVillainCard()`; 5 HQ fill-in-place assignments replaced with `goldenRefillHQ()` conditionals; 2 async chain bugs fixed; 1 log message updated — applied 2026-03-26 |
| Final Showdown crashed with "Attempted to assign to readonly property" — game never resolved | `confirmMastermindAttack()` at `script.js:14582` declared `mastermindAttack` as `const` then tried to add 4 to it for the Final Showdown threshold — changed to `let` — fixed 2026-03-31 |

### Testing Status

**Note on villain draw counts:**
- What If? Solo: 3 villain cards on Turn 1, then 1 per round — this is correct original behavior
- Golden Solo: 2 villain cards every round (or 1 if bystander spent)

**Passed:**
- [x] Game Mode section visible and clickable
- [x] Confirm Choices shows correct hero count (5) for Golden Solo
- [x] RANDOMIZE HEROES picks 5 heroes for Golden Solo
- [x] RANDOMIZE ALL picks 5 heroes for Golden Solo
- [x] Hero deck restructuring console message appears on game start
- [x] HQ starts with 5 heroes
- [x] Round 1: no HQ rotation
- [x] Round 2+: HQ rotates (1 card added right, 1 removed left)
- [x] 2 villain cards drawn per round in Golden Solo
- [x] Recruiting a hero rotates HQ (not fill-in-place)
- [x] What If? Solo regression: villain draw count unchanged (1/round after turn 1)
- [x] Villain deck bystander count: 2 by default, scheme special counts respected (code verified)
- [x] Villain deck henchmen: all 10 cards shuffled in for Golden Solo (code verified)

**Still to test in-game:**
- [ ] Villain deck bystander count confirmed in actual play (default 2, or scheme override)
- [ ] Villain deck henchmen count confirmed in actual play (10 cards)
- [ ] Bystander discard popup appears when bystanders in victory pile
- [ ] Spending bystander reduces villain draws to 1 that round
- [ ] Villain KO of HQ card rotates HQ
- [x] 4th Mastermind defeat triggers Final Showdown button label
- [x] Final Showdown pass: combined recruit+attack ≥ strength+4 → Ultimate Victory (confirmed in play 2026-03-31; bug fixed — see Post-Launch Bug Fixes)
- [ ] Final Showdown fail: points too low → no victory
- [ ] Card effects that draw extra villain cards (Emma Frost, Electro, Kingpin, Forge, etc.) draw single cards only — not full Golden Solo rounds
- [ ] KO effects on HQ cards (Skrull, Kraven, Morg) rotate HQ correctly rather than fill-in-place
- [ ] Mystique and Reignfire escape effects resolve correctly (no hang)

---

## Compatibility Audit (2026-03-12) — Complete

All fixes applied 2026-03-26. Full report: `docs/golden-solo-compatibility-report.md`.

**Key architectural rule:** `enterCityNotDraw = true` does NOT suppress the Golden Solo block. Mid-turn card effects must call `processVillainCard()` (single draw) not `drawVillainCard()` (full round). Any new expansion card that draws a villain card mid-turn must follow this same pattern.

**"Other Player" effects:** Keep the existing silent skip for Golden Solo — do not apply hero superpower bonuses to the hero deck. New expansion cards with "each other player" wording should follow the same approach.

---

## Known Issues / Deferred

### Low-priority cleanup items — in progress

All items captured in implementation plan: `docs/superpowers/plans/2026-03-31-deferred-cleanup.md`

**All cleanup items complete** ✅ (2026-03-31) — T2, T1, L5, L2, L3, L4, L6, L7, L8, L10, R1, R2 all done

Remaining deferred (not in plan):
- **Summary panel hero names truncate on narrow screens** — accepted for now; revisit in next UI pass.
- **Kree-Skrull War scheme villain count** — needs rules decision (see Known Issues below)

### GotG Code Bugs — Resolved (2026-03-31)

Verified against physical cards and card images: all three functions were correct. The suspected bugs were false positives caused by the reference data misreading trigger icons in effect text (Covert eye, Guardians swirl, and Tech gear icons confused during the image-reading pass). Reference data corrected in `docs/card-effects-reference/guardians-of-the-galaxy.md`.

### Scheme vs Game Mode villain count conflict

**Symptom:** The Kree-Skrull War scheme enforces both Kree Starforce and Skrulls as required villain groups in What If? Solo, even though What If? Solo is normally a 1-villain-group mode.

**Root cause:** `getEffectiveSetupRequirements` returns the scheme's `specificVillainRequirement` array unchanged in What If? mode. Kree-Skrull War has 2 specific requirements, so both are enforced regardless of game mode.

**The open question:** For schemes that explicitly require 2 villain groups (Kree-Skrull War), should What If? Solo honour the scheme's count (2) or always cap at 1? This is a rules interpretation question that needs a deliberate decision before fixing.

**Status:** Deferred — needs rules clarification before implementation.
