# Known Issues / Deferred

Detailed descriptions of open issues. Summary pointers are in CLAUDE.md.

---

## Summary panel hero names truncate on narrow screens

Accepted for now; revisit in next UI pass.

---

## Kree-Skrull War scheme villain count conflict

**Symptom:** The Kree-Skrull War scheme enforces both Kree Starforce and Skrulls as required villain groups in What If? Solo, even though What If? Solo is normally a 1-villain-group mode.

**Root cause:** `getEffectiveSetupRequirements` returns the scheme's `specificVillainRequirement` array unchanged in What If? mode. Kree-Skrull War has 2 specific requirements, so both are enforced regardless of game mode.

**The open question:** For schemes that explicitly require 2 villain groups (Kree-Skrull War), should What If? Solo honour the scheme's count (2) or always cap at 1? This is a rules interpretation question that needs a deliberate decision before fixing.

**Status:** Deferred — needs rules clarification before implementation.

---

## "Other player" effects in solo mode

**Problem:** The current rule is "silent skip" for Golden Solo — but the codebase isn't consistent. Some cards correctly suppress the effect, while others apply it to the active player instead. The inventory passes have surfaced specific cases:

**Known inconsistencies (found during inventory):**
- **Shriek (PtTR)** — Card says "each other player gains a Wound." Code applies wound to active player. Should be suppressed per the current rule.
- **Death (Dark City)** — Code scope includes played cards + artifacts; card says hand only. (Separate bug, but same category of "check all villain effects against card text.")

**The bigger question:** Not all "other player" effects translate cleanly to a 1-player game. Some are purely negative (Shriek's wound — skip makes sense), some are mixed (reveal-or-penalty — does the solo player reveal?), and some affect game state in ways that matter even solo. A blanket "suppress all" rule may not be correct for every case.

**What's needed:** After all expansion inventories are complete, do a single pass across all expansions to catalogue every "other player" / "each other player" / "each player" card, then decide case-by-case how each should behave in Golden Solo.

**Status:** Deferred — waiting until all expansion inventories are finalized so the full list is available. Will be addressed naturally by `/analyze-expansion` as each expansion is processed.

---

## Korvac (Revelations) — two documented modelling limitations

**Context:** "Korvac Revealed" *counts as* a 19-Attack Villain but is engineered as a `type:"Location"` entry in `cityLocations[]` to reuse the fightable/render/defeat plumbing (`placeKorvac()`, `expansionRevelations.js`). It carries `isSchemeVillain:true`. The Grim Reaper "+1 per Location" attack, Epic Grim Reaper "3+ Locations → Wound", and Swordsman "each Location captures a Bystander" all exclude it (fixed 2026-06-04). Two leaks were deliberately **left as documented limitations** (coordinator decision, 2026-06-04):

1. **Korvac is NOT counted by "for each Villain in the city" effects** (e.g. Sandman's +2 Attack per Villain). Because Korvac lives in `cityLocations[]`, not `city[]`, villain-count effects under-count by 1 while Korvac is revealed. **Why deferred:** player-favourable (the enemy reads *weaker*, never causes a loss), niche combo, and the fix is a cross-expansion change to villain-count code in 4 files (only Sandman can actually co-occur — GotG/PtTR villain counts are scheme-bound and can't share a game with the Korvac scheme).

2. **Placing Korvac into a city whose Location slots are all full would KO the weakest real Location** (the overflow path KOs the lowest-Attack Location; Korvac at Attack 19 is always the highest, so it displaces a real one rather than being displaced). **Why deferred:** requires 5 Locations already in play at the moment Korvac reveals — near-unreachable. (The Earthquake/Tsunami "destroy a space" path that could silently KO Korvac cannot occur — those are a different scheme, and only one scheme is in play per game.)

**Status:** Deferred by design — both are niche/near-unreachable and neither can cost the player a game. Revisit only if play surfaces them.

---

## Villain/Mastermind overlay UX pass

**Problem:** Bystanders and captured heroes currently display as small thumbnails overlaid on the villain/mastermind card. This works functionally but doesn't match how physical cards look on the table.

**Desired behavior:** Refactor to use the Location fan-out pattern (full-size cards shifted in position to look stacked, mimicking physical tabletop card placement). The Location system already implements this CSS pattern — extend it to bystander and captured-hero overlays.

**Scope:** Cross-cutting — affects the base game bystander-on-villain display, Skrull captures, Klaw captures, and any future captured-card mechanic across all expansions.

**Status:** Deferred — log as a standalone UX pass after Revelations merges. Klaw currently has no visual indicator for captured heroes (functional only via console messages).

---

## Always-leads mastermind ↔ expansion keyword collision

**Symptom:** When an expansion villain trigger matches Location names by a quoted keyword (e.g. Lethal Legion "+3 Attack while a 'Maze' Location is in the city"), the *always-leading* mastermind's own tactic-Locations can unexpectedly satisfy that keyword too — Grim Reaper's "Maze of Bones" tactic-Location triggered Lethal Legion's bonus. It worked as designed in that pairing, but the interaction is unvetted for other mastermind/expansion combinations.

**Root cause:** keyword-name matching across card types has no cross-mastermind awareness; the audit pipeline does not flag when an always-leading mastermind's tactic-Locations can satisfy another card's keyword condition.

**Status:** Deferred — low-frequency cross-combination. When adding any keyword-by-Location-name trigger, check whether the always-leading masterminds' tactic-Locations also match the keyword. Surfaced by `/legendary-sweep` 2026-06-20.
