# Card Image Reading Rules

Detailed rules for reading card data from images and databases. Referenced from CLAUDE.md.

---

## Source Authority — reference-first

The reference document is the foremost authority for **every** field — names, copy counts, costs, fight values, VP, class, team, **and effect text**. Card images are a **verification/backup source**, not a primary one.

- **Not-in-game expansions:** `expansions/[name]/[name]-reference.md` (BGG-derived) is authoritative for ALL fields, including effect text. **The reference encodes hero class/team in its image alt-text** (e.g. `![Microbadge: Legendary fan - Ranged Hero]` → class Range; `Covert Hero` → Covert). Read class/team from that alt-text — do NOT eyeball the card's class icon.
- **In-game expansions:** `cardDatabase.js` is authoritative for structured fields (class, team, cost, condition, base attack/recruit, VP, fight values). For effect text not stored in the DB, use the finalized inventory if present, otherwise the card image.
- **Card images verify the reference; they never override it.** Read images to confirm reference values and to catch the rare reference typo or fill a genuine reference gap. When an image read conflicts with the reference, **the reference wins** UNLESS the image clearly and unambiguously shows the reference is wrong — then flag `⚠️` for the user's Pass 3. Never silently swap in an image-derived value.
- Class icons, team icons, and inline `[ClassName]:` / `[TeamName]:` trigger icons are the **most error-prone image reads** — repeated false positives have come from reading these off the art when the answer was already in the reference. Never let an icon read override the reference's class/team/trigger.
- **Build order:** fill every field from the reference (or DB) first; then use images to verify and to flag suspected reference errors. Reconcile field-by-field — do not spot-check.
- **Card-image filenames are staging-derived and can be mislabeled — never treat a filename as the card title.** Take the title from the reference and confirm against the card art. E.g. Shadows of Nightmare's `MasterOfTheSanctum` / `FleetingDarkMagic` / `MedallionOfManyCoats` filenames were wrong while the printed titles matched the reference.

## Mastermind Tactics — stat inheritance

- A Mastermind's Tactic cards **inherit the main Mastermind card's Attack and VP unless the tactic states otherwise.** References (and the cards) typically print Attack/VP only on the main Mastermind, not on each tactic — so record each tactic with the Mastermind's Attack and VP.
- Most tactics are **VP 6** (the common Mastermind VP), but exceptions exist — verify each tactic against its card image and flag any that genuinely differ. A tactic's lower-right number is its Fight value, not VP; do not record it as VP.

## Card Layout Anatomy

- Hero card layout: upper-left (top) = Team affiliation; upper-left (bottom) = Class (stacked directly below Team); lower-left = Base Value (attack/recruit when played); lower-right = Cost (recruit to acquire)
- Villain/Mastermind/Henchmen: lower-right = Fight value
- Silver Surfer (Fantastic Four set) is the only hero with no team affiliation — his team slot is empty. This is correct; do not flag as missing data.

## Effect Text Reading

- When reading effect text from images: if the text starts with `[Tag]:` (a trigger condition), cross-check that Tag against the DB `condition` field. Match = write as-is. Mismatch = flag in "Needs Review" for manual review, do not guess.
- New expansion cards (not yet in DB): use per-corner reads — target each corner of the image explicitly rather than reading the whole card at once, to minimise corner confusion.
- **Never use thematic, flavor, or contextual reasoning to guess uncertain card data.** If a value cannot be confirmed from available assets, flag and leave for human spot-check.

## Tool & Platform Gotchas

- `poppler` installed via winget; binaries copied to `C:\Users\Paul\bin` — Bash tool can run `pdftoppm`/`pdftotext` directly.
- `pdftoppm` PNG output: always pass `-png` flag — without it, outputs `.ppm` files. Output filenames auto-include a hyphen separator (e.g., `prefix-01.png` not `prefix1.png`).
- Rules PDFs are in `rules/` — read them with the Read tool as needed (visual layout and icons included).
- **PDF token cost:** Each page = one image render regardless of text size — use default (smaller) text to fit more content per page and reduce page count. Never attach PDFs in chat; always use the Read tool with page ranges.
- **Expansion inventory PDFs:** User places them in `expansions/[expansion-name]/` (e.g. `expansions/revelations/revelations-Inventory.pdf`). Always read page-by-page with the Read tool. **Never use pdftotext or any other conversion tool on these PDFs** — they contain reference images that must be read visually. If the Read tool fails on any PDF, **stop immediately and tell the user** — do not attempt any workaround. Known fix: the Read tool's PDF renderer relies on `pdftoppm` being on PATH at VS Code launch time — if it fails, ask the user to fully close and reopen VS Code (not just reload window), then retry.
- Glob tool fails on paths containing spaces when searching from the game root (e.g. `Visual Assets/Villains/*.webp` = no results). Use the full project-root path: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/Visual Assets/...`
- **Large BGG reference files:** X-Men reference is 107K+ tokens — too large for a single Read. Use `Grep` to find section headers, then pass targeted line ranges to subagents. Split by card type section.

## Inventory Template Notes

Hero card effects use this format:
- **SPECIAL ABILITY**: Unconditional effect that fires every time the card is played
- **SUPERPOWER**: Conditional effect requiring a prior card of matching class/team played this turn — written as `[ClassName]:` or `[TeamName]:` trigger
- Use `NA` when a card has no Special Ability or no Superpower
- Attack/Recruit shown as `0+` means "starts at 0, modified by ability"; `-` means not applicable
- **Thrown Artifact base values:** Cards that are pure Thrown Artifacts (produce attack/recruit only when thrown) have no printed base value — use `-` in the Attack and Recruit columns, not `0+`.
- **Hero rarity → copy-count mapping** is normalized at the orchestrator/assembly step, not per-reader: 5 copies → Common, 3 → Uncommon, 1 → Rare (a standard hero = 5/5/3/1 across two Commons, one Uncommon, one Rare = 14 cards). **Non-standard distributions exist** — flag them ⚠️ and map explicitly rather than forcing 5/5/3/1 (e.g. Messiah Complex clone heroes use 4/4/4/2; the DB rarity mapping will not match).

This distinction matters for code: Superpowers require checking `classPlayedThisTurn` or equivalent flag.

## Inventory Pass Execution (scaling)

- Run inventory passes with **parallel subagents — one per card type** (the orchestrator keeps only the returned summaries, so its context stays lean regardless of set size). **Chunk further when a card type has a large image set** — e.g. WWH Heroes = 78 images → ~5 subagents split by hero-group; a single reader over 78 images exceeds reliable context. WWH (400 cards, ~12 readers) fit in one session with context to spare because each reader burns its own.

## DB Quantity & Scoring Gotchas

- **Villain quantity default:** Villain cards with no `quantity` field in the DB default to **2** (engine uses `quantity || 2`). Group total = sum of all quantities; standard group = 8 cards.
- **Henchmen quantity:** Hardcoded to **10** copies per group in `generateVillainDeck()` at `script.js:3874` — no `quantity` field on henchmen DB objects.
- **Hardcoded villain fight effects:** Some villain fight effects are not in the DB `fightEffect` field but triggered by name-check in `handlePostDefeat()` in `script.js`. Known case: Endless Armies of HYDRA. A DB-vs-code audit will show these as "no fight effect" even though they fire in-game.
- **VP bonus villains:** Some villain VP values are deceptively low because real scoring is in `calculateVillainVP()` as end-of-game multipliers. Known cases: Supreme HYDRA (3x HYDRA count - 1 bonus VP), Ultron (+1 VP per Tech card in deck).

## Expansion-Specific New Card Types

### X-Men Expansion
- **Traps**: In Villain Deck but NOT Villains; challenge to complete this turn or suffer consequences. At least 1 per villain group.
- **Horrors**: 20 unique game-modifier cards shuffled into Villain Deck; ongoing effects or one-shot Ambush triggers.
- **Tokens**: Optional physical cards for summoned Villains/Masterminds (9 standard + 1 Battleship from Epic Deathbird).
- **Divided**: Hero cards split into two halves, each with own class/ability. Player chooses one half when played.
- **Ascending Villains**: Some Villains/Horrors "ascend" to become new Masterminds mid-game (no Tactics deck).
- **Shadow-X dual cards**: Villain side has no VP; "Fight: Gain this as a Hero" flips to Hero side. Piercing Energy cannot target them.
- X-Men staging folder also has a `Horror/` subfolder (not in standard staging template).

### S.H.I.E.L.D. Expansion
- **Adapting Masterminds**: No lead card; 4 tactics rotate on top — whichever is face-up acts as the Mastermind. Both HYDRA High Council and HYDRA Super-Adaptoid use this format.
- **Named S.H.I.E.L.D. Officers**: 8 unique cards (2 copies each) with individual abilities, stored in `Officers/` subfolder. These supplement the generic Officers from Core Set.
- **New keywords**: Undercover (send S.H.I.E.L.D. Hero to Victory Pile, worth 1VP), S.H.I.E.L.D. Level (S.H.I.E.L.D./HYDRA cards in Victory Pile), Hydra Level (S.H.I.E.L.D./HYDRA cards in Escape Pile).
- **Production import conflict**: Existing `Visual Assets/Heroes/SHIELD/` holds grey starters (Agent, Trooper, Officer). Expansion hero team + named Officers need a folder naming strategy at import time.
