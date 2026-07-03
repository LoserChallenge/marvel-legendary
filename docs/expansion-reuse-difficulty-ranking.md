# Reuse-Checked Build-Difficulty Ranking — Unbuilt Expansions

_Date: 2026-07-03. Author: read-only ANALYSIS session (full Legendary context). Method: 4 `pattern-reuse-scout` surveys (Into the Cosmos, S.H.I.E.L.D., Shadows of Nightmare, Heroes of Asgard) verifying mechanics against live code; 2 deep inventory reads (Weapon X, New Mutants); a thin-context scout survey as the base map. Companion docs (cc-helper side): `cc-helper/docs/legendary-automation/expansion-difficulty-survey.md` (base map) and `expansion-automation-analysis.md` (scaffolder pilot). Receipts: file:line evidence is from the scout reports; `[unverified]` marks expansions not reuse-scanned._

---

## Headline

The original survey's "all 9 expansions rate HARD" was a **reuse-blind illusion**. The engine is far more general than a thin-context read shows: every scary-looking subsystem is already built and shipped — Shards, S.H.I.E.L.D. Officers, the Artifact zone, Cosmic Threat, capture-a-card-onto-a-villain, the transform lifecycle, and the threat-counter idiom. For each surveyed expansion, difficulty did **not** spread across the set — it **collapsed to one (or a few) contained new pieces.** The discriminator across the surveyed four is simply: **how many genuinely-new systems remain after reuse.**

**Confidence is inverted from intuition:** the middle four are the best-understood (their code was actually checked); the top two and bottom three are still gut-and-survey estimates, biased HIGH.

---

## Ranking (easiest → hardest)

| # | Expansion | Reuse | Genuine new work left | Surveyed? · Confidence |
|---|---|---|---|---|
| **1** | **Heroes of Asgard** | ~80–85% | One moderate build: Villainous-Weapon lifecycle glue (+ two tiny keyword helpers: `isWorthy()`, `throwArtifact()`) | ✅ High |
| **2** | **Weapon X** | — | Berserk (fight-fail modifies core loop) + Weapon X Sequence + 10 Enraging Wounds | ❌ deep-read only · Med |
| **3** | **New Mutants** | — | Moonlight/Sunlight HQ odd/even engine + 3 heavy schemes | ❌ deep-read only · Med |
| **4** | **S.H.I.E.L.D.** | ~70–75% | One structural build: no-lead Adapting Mastermind (mid-game identity swap of the primary slot) | ✅ High |
| **5** | **Shadows of Nightmare** | ~70–75% | One invasive build: the Astral Plane (new off-city board slot + Nightmare living in it as a Mastermind) | ✅ High |
| **6** | **Into the Cosmos** | ~55–60% | **Three** builds: Celestial Boons (HIGH), Contest of Champions (med-high), Danger Sense (med) — plus the biggest set to wire | ✅ High |
| **7** | **Messiah Complex** | — | Many new mechanics at once (clones, ascending masterminds, veiled/unveiled random-swap schemes) | ❌ `[unverified]` · Low |
| **8** | **World War Hulk** | — | Sheer volume (400 cards); transforms on heroes AND masterminds; Trap! type | ❌ `[unverified]` · Low |
| **9** | **X-Men** | — | Three new card types (Traps/Horrors/Tokens) + mid-game mastermind creation | ❌ `[unverified]` · Low |

**Biggest moves vs. the pre-reuse gut rank:** Heroes of Asgard #6 → #1 (its heaviest-looking part, the Artifact zone, is entirely free from Guardians). Shadows #3 → #5 (small set, but the Astral Plane is the most tentacled single build). Into the Cosmos stayed mid-pack — Shards being free did NOT make it easy, because Boons/Contest/Danger Sense are the real cost.

---

## Per-expansion reuse detail (surveyed four)

### Heroes of Asgard — ~80–85% reuse · LOW-to-MEDIUM
| Mechanic | Verdict | Evidence (file:line) |
|---|---|---|
| Artifact zone | **REUSE** (near-complete) | GotG `playerArtifacts` zone: `expansionGuardiansOfTheGalaxy.js:9,237,93,211`; DOM `index.html:815,825`; first-class in `script.js` (count 7544, reset 11706/12209, save-state 12359/17850) |
| Villainous Weapons | **ADAPT** | Infinity-Gem-in-villain-group template `cardDatabase.js:3888-3900`; capture-onto-villain `script.js:5641`; release-on-defeat `17294`; attack via `attackFrom*` twin slots `10639` |
| Transforms (Tactic→Weapon, Surtur→Artifact) | **REUSE/ADAPT** | `transformsToLocation` skip-VP-until-defeated `script.js:16612-16623`; `transformScheme()` 2309 |
| Worthy | **ADAPT** (tiny) | `cardsPlayedThisTurn` pools `script.js:790`; cross-pool check pattern GotG `:2349` |
| Thrown Artifact | **ADAPT** (modest) | variant of artifact-use; deck-bottom + run-ability |
| Conqueror | **ADAPT** | Location `bonusWhileVillain` / `getLocationEffectiveAttack()` `script.js:12663-12672` |
| "Player on right" (Mangog, Naglfar) | **REUSE** (solo no-op convention) | `otherPlayerNoEffect` GotG `:6025` — gameplay ruling only, not engineering |
| Epic overlay | **REUSE** (declarative) | `getSelectedMastermind()` `script.js:1013-1016` |
| Scheme layer (bulk) | **REUSE** | enters-as-villain `enterCityFromRight` 5478; reveal-top-of-villain-deck; twist-marker + evil-wins counter (Dark Alliance) |
- **One real build:** the Villainous-Weapon lifecycle *glue* (reveal → capture onto correct city villain → `attackFromWeapon` slot → release to `playerArtifacts` on defeat). Three "genuinely new" items (Weapon glue, `isWorthy()`, `throwArtifact()`) are ADAPT-with-real-code, not BUILD-from-nothing.

### S.H.I.E.L.D. — ~70–75% reuse · MEDIUM
| Mechanic | Verdict | Evidence (file:line) |
|---|---|---|
| S.H.I.E.L.D. Officer (named recruitable stack) | **REUSE** (~80%) | Core `shieldDeck` global `script.js:531` (reset 5071), DB `shieldOfficers` `cardDatabase.js:119`; recruit action `recruitOfficer()` 18930; badge 7541/8385; gain fns `cardAbilities.js:7088,15868`. Officer ≈ Sidekick (own stack), NOT HQ hero |
| Adapting Masterminds (no lead, rotating tactics) | **ADAPT** (biggest cost) | tactics stack + pop exist `script.js:1043,16613`; **win = `tactics.length===0`** (no counter to build) `15912`. GAP: primary-slot image/name/attack set once `5119`, never swapped |
| Undercover (move Hero to VP as 1VP) | **ADAPT** (small) | `victoryPile.push()` ubiquitous; scoring reads `card.victoryPoints` `17798` → must stamp `victoryPoints:1` |
| S.H.I.E.L.D. Level / Hydra Level (threat tracks) | **REUSE** | `pile.filter().length` on-read; idiom already written (Supreme HYDRA VP block `17809-17818`); tracker already has a S.H.I.E.L.D. case `11427` |
- **One real build:** the no-lead Adapting Mastermind — mid-game swap of the primary slot's identity (image+name+attack). Everything else in that mechanic already exists.

### Shadows of Nightmare — ~70–75% reuse · MEDIUM
| Mechanic | Verdict | Evidence (file:line) |
|---|---|---|
| Ritual Artifacts (no Attack/Recruit) | **ADAPT** (mostly reuse) | NOT a new card type — GotG Artifact keyword+zone; no-value card model exists (Drax `cardDatabase.js:10935`); discard-self templates (Revelations 1308, SWV1 1390); per-turn flags exist |
| Demonic Bargain | **BUILD** (thin, from reused parts) | reveal-branch-on-cost SWV1 608; discard-top Revelations 1813; `drawWound()` `cardAbilities.js:313`. Pervasive (~15 wiring sites) |
| Astral Plane (off-city zone + recruit-to-fight) | **REUSE hard parts, BUILD container** | recruit-to-fight = hardened `usesRecruitToFight` flag (twins 7669/7930, gate 12476, defeat 13053); escape-on-displace `handleVillainEscape` 6302 + Ra'ktar pattern FF 2999 |
| Cross-stack SHIELD Officers | **REUSE — no cross-expansion blocker** | Officers are core (see SHIELD row); `shieldDeck` always initialized |
| Epic / mastermind | **REUSE** (data-driven) | `{...base,...base.epic}` `script.js:1014` |
- **One real build:** the Astral Plane — a new one-slot off-city board space (state var + DOM cell + invisible to `for i<citySize` loops) plus Nightmare-as-Mastermind-in-the-Astral-Plane. The most tentacled single piece of the four (touches fight-gating, escape, villain movement, and mastermind logic at once).

### Into the Cosmos — ~55–60% reuse · MEDIUM
| Mechanic | Verdict | Evidence (file:line) |
|---|---|---|
| Shards currency + "unlimited supply" | **REUSE** (~free) | GotG `shardSupply=500` default `expansionGuardiansOfTheGalaxy.js:6`; take-1-return-rest `script.js:13748-13762,16563`; supply-empty win `10043`; player counter + click-spend + burn-5-for-+10 (Gamora). **No cap exists to override** — "unlimited" ≈ doing nothing |
| Burn N Shards | **ADAPT** (low) | spend/return exists; missing "consume w/o +Attack, once/turn" gate |
| Cosmic Threat (Beyonder cost + Celestial dual-class) | **REUSE** (~free) | Built in FF, NOT GotG: `cosmicThreat()` `expansionFantasticFour.js:553`; Beyonder threshold 319-430; **Celestial dual-class map already hardcoded** `script.js:9197-9219` — pre-wired for ItC names |
| Special bystanders w/ triggers | **REUSE** | `rescueBystanderAbility()` `cardAbilitiesDarkCity.js:7506` |
| Spawned token-villains | **ADAPT** (low-med) | `enterCityFromRight` 5478; Revelations enters-as-villain 3911 |
| Danger Sense (hero + villain) | **BUILD** (med) | reveal-N framework adjacent (Mr. Sinister `cardAbilitiesDarkCity.js:13418`); per-type +Attack bonus is new |
| Contest of Champions | **BUILD** (med-high) | no reveal-and-compare precedent; `hasClass()` reusable, scoring engine new |
| **Celestial Boons** | **BUILD** (HIGH — biggest) | no persistent-per-turn-registry keyed to victory-pile contents; 5 heterogeneous effects, no reuse |
- **Three real builds** (Boons HIGH + Contest + Danger Sense) plus the largest card set — why it lands hardest of the surveyed four despite Shards + Cosmic Threat being free.

---

## Cross-cutting corrections (to the thin-context survey)

1. **Reuse collapses difficulty to one contained piece per expansion** — the "spread-out HARD" framing was wrong for the four checked.
2. **S.H.I.E.L.D. Officers are CORE engine, always loaded** (`shieldDeck` init every game, 30 officer cards in base `cardDatabase.js`). Two consequences: SHIELD's "new Officer type" was never really new (~80% pre-built), and Shadows of Nightmare has **no cross-expansion ordering dependency** on a future SHIELD build (the survey's flagged blocker doesn't exist).
3. **Cosmic Threat lives in Fantastic Four + `script.js`, not GotG**, and its Celestial dual-class mappings are already hardcoded for Into the Cosmos card names — REUSE, not a fresh dual-class build.

## Side finding — base-game bug to log (out of scope for this analysis)

Two scouts independently found: `drawSHIELDOfficer()` (`cardAbilities.js:15868/15869`) and `moveShieldOfficerToHand()` pop the **master template array** `shieldOfficers` instead of the live `shieldDeck` copy — while `recruitOfficer()` and Revelations use `shieldDeck`. So the two gain paths deplete different arrays and the template is permanently mutated (never reset). **Recommend: catalogue in `docs/known-issues.md` (base-game bugs); route all officer gains through one canonical stack.** `[unverified — flagged by scouts, not independently reproduced]`

## Implications

- **Next build to pick, on cost alone:** Heroes of Asgard (cheapest, high-confidence) or Weapon X / New Mutants (smallest, but reuse-unverified). Into the Cosmos is NOT the freebie its Shards reuse suggests.
- **Scaffolder pilot (separate axis — card DATA shape, not behavior):** still New Mutants, per the cc-helper scaffolder analysis (`expansion-automation-analysis.md`). Reuse findings don't change the scaffolder pilot; they change build-order.
- **Open option:** run `pattern-reuse-scout` on the bottom three (Messiah / WWH / X-Men) to see if any collapse the way Asgard did. Their floors (volume, new card types) are real, but "HARD" is `[unverified]` for them.

## To double-check at build time

- BUILD verdicts (Danger Sense, Contest of Champions, Celestial Boons) are "no precedent found by grep" — re-verify in-code before committing effort; especially whether Contest of Champions can lean on existing `hasClass`/class-count machinery.
- Confirm the Secret Wars Vol.1 helper functions cited (`revealTopDrawIfCost`, `crossDimensionalRampage`, Kitty Pryde) are present on whatever branch a build starts from; if not, prefer the Revelations-based equivalents.
- The five `[unverified]` expansions (top-2 + bottom-3) have not been reuse-scanned; treat their ranks as provisional.
