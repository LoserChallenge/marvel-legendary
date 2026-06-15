# Revelations — Cached Rules Rulings

Settled rules questions for the Revelations expansion, cached so the ruling is visible
rather than buried in code comments. Each entry: the question, the ruling, the source,
and where it's implemented.

---

## Earthquake / Tsunami — do escaped Henchmen count toward "3 Villains per player escaped"? (Obs 1/2/7)

**Question.** Scheme "Earthquake Drains the Ocean" / "Tsunami Crushes the Coast" loses when
"3 Villains per player" have escaped (solo = 3). Do escaped **Henchmen** count toward that 3,
or only cards printed as Villains?

**Ruling: Henchmen DO count.** A Henchman is a subtype of Villain in Marvel Legendary, so an
escaped Henchman counts as an escaped Villain toward the loss. Solo threshold = **3 escapes
OR the Villain Deck runs out**. (Settled 2026-06-14; originally split out of Obs 1 as Obs 2.)

**Implementation (commit on `revelations`, Obs 1/7).**
- Loss check: `earthquakeEvilWins` case inside `updateGameBoard()` (`script.js`) counts
  `escapedVillainsDeck.filter(c => c.type === "Villain" || c.subtype === "Henchman")`.
- Display: `updateEvilWinsTracker()` `"Earthquake Drains the Ocean"` case shows
  `N/3 Villains Escaped` with the same filter (was falling through to the static
  "See Scheme" default — the visible symptom).
- **Why the subtype filter, not type-only:** most henchmen are DB-typed `"Villain"` (so the
  old `type === "Villain"` filter already counted them), but **HYDRA Base** is typed
  `"Location"` (henchman/Location hybrid) and was silently dropped. All henchmen carry
  `subtype: "Henchman"` (set in `generateVillainDeck`); real Locations (Dome of Darkforce,
  Dark Dimension) are `type: "Location"` with **no** Henchman subtype and are KO'd on
  destroy rather than escaped — so the `subtype === "Henchman"` clause catches HYDRA Base
  while still excluding real Locations, bystanders, and carried-off heroes.

---

## Korvac Revealed — defeating Korvac is an instant win (both modes)

**Ruling (oracle 2026-06-03).** While the scheme is on Side B (Korvac Revealed), the fightable
19-Attack / 9-VP "Korvac" entity is exposed. Defeating Korvac is an **instant win** in both
What If? and Golden Solo. Implemented via the Location-plumbing `korvacDefeated` fight trigger
(`expansionRevelations.js`). See also the Korvac Saga/Revealed twist toggle (Obs 9/10).
