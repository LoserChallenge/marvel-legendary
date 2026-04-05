# Golden Solo Mode — Implementation History

Extracted from CLAUDE.md on 2026-04-03 to keep the main file focused on active work. All content below is resolved/historical.

---

## Implementation Status

All 7 phases implemented and stable (2026-03-09). Compatibility audit complete (2026-03-26). Mode flag: `gameMode` global (`'whatif'` | `'golden'`). Key functions: `goldenRefillHQ()`, `goldenHQRotate()`, bystander discard popup, Final Showdown, hero deck restructuring.

## Architectural Rules

**Villain draws mid-turn:** `enterCityNotDraw = true` does NOT suppress the Golden Solo block. Mid-turn card effects must call `processVillainCard()` (single draw) not `drawVillainCard()` (full round). Any new expansion card that draws a villain card mid-turn must follow this same pattern. Enforced by the anti-pattern hook and the expansion-validator subagent.

**"Other Player" effects:** Keep the existing silent skip for Golden Solo — do not apply hero superpower bonuses to the hero deck. New expansion cards with "each other player" wording should follow the same approach. (Broader review deferred — see `docs/known-issues.md`.)

---

## Post-Launch Bug Fixes (2026-03-09)

| Bug | Fix |
|-----|-----|
| Game Mode radio buttons hidden behind Final Blow panel | `#game-mode-section` `bottom` raised from `44vh` to `62vh` in `styles.css` |
| Confirm Choices showed scheme's hero count (e.g. 3) instead of Golden Solo count (5) | Validation at `script.js` ~line 2996 now reads game mode from DOM instead of stale `gameMode` global |
| RANDOMIZE HEROES always picked 3 regardless of Golden Solo mode | `randomizeHero()` ~line 2379 now reads DOM for Golden Solo hero count |
| RANDOMIZE ALL picked scheme's hero count instead of Golden Solo count | `randomizeHeroWithRequirements()` ~line 2875 now reads DOM for Golden Solo hero count |
| Plutonium Scheme Twist caused 6+ villain cards drawn per round in Golden Solo | `handlePlutoniumSchemeTwist` at `script.js:5469` called `drawVillainCard()` (full round machinery) instead of `processVillainCard()` (single draw) — fixed 2026-03-12 |
| 36 card-effect functions called `drawVillainCard()` mid-turn, triggering full Golden Solo rounds | All 22 Type 1 call sites replaced with `processVillainCard()`; 5 HQ fill-in-place assignments replaced with `goldenRefillHQ()` conditionals; 2 async chain bugs fixed; 1 log message updated — applied 2026-03-26 |
| Final Showdown crashed with "Attempted to assign to readonly property" — game never resolved | `confirmMastermindAttack()` at `script.js:14582` declared `mastermindAttack` as `const` then tried to add 4 to it for the Final Showdown threshold — changed to `let` — fixed 2026-03-31 |

---

## Testing Status

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
- [x] Final Showdown pass: combined recruit+attack >= strength+4 -> Ultimate Victory (confirmed in play 2026-03-31; bug fixed)
- [ ] Final Showdown fail: points too low -> no victory
- [ ] Card effects that draw extra villain cards (Emma Frost, Electro, Kingpin, Forge, etc.) draw single cards only — not full Golden Solo rounds
- [ ] KO effects on HQ cards (Skrull, Kraven, Morg) rotate HQ correctly rather than fill-in-place
- [ ] Mystique and Reignfire escape effects resolve correctly (no hang)

---

## Compatibility Audit (2026-03-12) — Complete

All fixes applied 2026-03-26. Full report: `docs/golden-solo-compatibility-report.md`.

---

## GotG Code Bugs — Resolved (2026-03-31)

Verified against physical cards and card images: all three functions were correct. The suspected bugs were false positives caused by the reference data misreading trigger icons in effect text (Covert eye, Guardians swirl, and Tech gear icons confused during the image-reading pass). Reference data corrected in `docs/card-effects-reference/guardians-of-the-galaxy.md`.

---

## Low-Priority Cleanup Items — Complete (2026-03-31)

All items captured in implementation plan: `docs/superpowers/plans/2026-03-31-deferred-cleanup.md`
T2, T1, L5, L2, L3, L4, L6, L7, L8, L10, R1, R2 all done.
