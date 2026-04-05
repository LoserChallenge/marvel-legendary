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
