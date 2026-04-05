# Card Image Reading Rules

Detailed rules for reading card data from images and databases. Referenced from CLAUDE.md.

---

## DB vs. Image Authority

- `cardDatabase.js` is the authoritative source for class, team, cost, condition, and base attack/recruit values — NEVER override these from card images
- Card images should ONLY be used to extract the **effect text** (the written description of what the card does) which is not stored in the database for hero cards
- Class icons (Tech gear, Covert eye, Strength fist, Instinct bolt, Ranged crosshair) and team icons (X-Men X, Avengers A, S.H.I.E.L.D. eagle) are easily confused by image readers — always trust the DB fields
- The small `[ClassName]:` or `[TeamName]:` trigger icons embedded in effect text (e.g. the icon before "Gain another Shard") are equally prone to misreading — after recording an effect, cross-check the trigger icon against (a) the card's own class/team in the DB and (b) what the code actually checks; a mismatch means the image was likely misread, not that the code is wrong
- When building card reference data: pull all structured fields from DB first, then read images only to fill in the effect text column

## Card Layout Anatomy

- Hero card layout: upper-left (top) = Team affiliation; upper-left (bottom) = Class (stacked directly below Team); lower-left = Base Value (attack/recruit when played); lower-right = Cost (recruit to acquire)
- Villain/Mastermind/Henchmen: lower-right = Fight value
- Silver Surfer (Fantastic Four set) is the only hero with no team affiliation — his team slot is empty. This is correct; do not flag as missing data.

## Effect Text Reading

- When reading effect text from images: if the text starts with `[Tag]:` (a trigger condition), cross-check that Tag against the DB `condition` field. Match = write as-is. Mismatch = flag in "Needs Review" for manual review, do not guess.
- New expansion cards (not yet in DB): use per-corner reads — target each corner of the image explicitly rather than reading the whole card at once, to minimise corner confusion.
- **Never use thematic, flavor, or contextual reasoning to guess uncertain card data.** If a value cannot be confirmed from available assets, flag and leave for human spot-check.

## Tool Gotchas

- Glob tool fails on paths containing spaces when searching from the game root (e.g. `Visual Assets/Villains/*.webp` = no results). Use the full project-root path: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/Visual Assets/...`
- **Large BGG reference files:** X-Men reference is 107K+ tokens — too large for a single Read. Use `Grep` to find section headers, then pass targeted line ranges to subagents. Split by card type section.

## Inventory Template Notes

Hero card effects use this format:
- **SPECIAL ABILITY**: Unconditional effect that fires every time the card is played
- **SUPERPOWER**: Conditional effect requiring a prior card of matching class/team played this turn — written as `[ClassName]:` or `[TeamName]:` trigger
- Use `NA` when a card has no Special Ability or no Superpower
- Attack/Recruit shown as `0+` means "starts at 0, modified by ability"; `-` means not applicable
- **Thrown Artifact base values:** Cards that are pure Thrown Artifacts (produce attack/recruit only when thrown) have no printed base value — use `-` in the Attack and Recruit columns, not `0+`.

This distinction matters for code: Superpowers require checking `classPlayedThisTurn` or equivalent flag.

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
