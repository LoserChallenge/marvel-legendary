# Secret Wars Volume 1 — Implementation Progress

Started: 2026-06-22
Status: Planning (initial setup — phase order proposed, awaiting coordinator confirmation)
Branch: `secret-wars-vol1` (worktree)

## Scope (locked — staged assets only)

**IN:** 14 heroes (56 cards); 4 villain groups (Domain of Apocalypse, Limbo, Manhattan Earth-1610, Sentinel Territories); 2 masterminds (Madelyne Pryor, Nimrod) + their 8 tactics; 8 schemes; 2 henchmen groups (M.O.D.O.K.s, Thor Corps); Banker bystander; Sidekicks (reuse existing stack).

**DEFERRED (out — do NOT build):** Wasteland group, The Deadlands (zombie) group, Ghost Racers henchmen, all 30 Ambitions + Ambition Row / "A Player is the Mastermind" mode, Wasteland Hulk + Zombie Green Goblin masterminds. → **Bribe** and **Rise of the Living Dead** keywords have zero in-scope cards and are NOT implemented this build.

---

## Phase 0: Pre-flight — ✅ Complete
- Inventory finalized (Pass 2, in-scope clean): `docs/card-inventory/final/secret-wars-vol1.md`
- Mechanics ref ready: `docs/expansion-mechanics/secret-wars-vol1.md`
- Rules notes cached: `docs/rules-notes/secret-wars-vol1.md`
- ⚠️ **Staging images blocker:** `expansions/secret-wars-vol1/` is gitignored + lives only in the main folder, absent from this worktree. Must be copied into the worktree before Phase 1a image import.

## Phase 1: Card Data + Images — ✅ Complete (2026-06-22)
- **Images:** 95 webp copied to production (56 heroes → `Visual Assets/Heroes/Secret Wars Vol. 1/`; 16 villains; 10 masterminds; 8 schemes; 2 henchmen; 1 bystander).
- **cardDatabase.js:** 14 heroes (56 cards, groups 57–70, inner ids 225–280); 4 villain groups (24–27, ids 281–296); 2 masterminds (19, 20) + 8 tactics (297–304); 8 schemes (37–44); 2 henchmen (9, 10); Banker bystander ×3 under `"Secret Wars Vol. 1"` key in `expansionBystanders`.
- Verified: `node --check` clean; all 80 inner ids unique; deferred content absent; in-scope counts match inventory.
- New teams introduced: `"Illuminati"`, `"Cabal"` (need setup-screen filter entries in Phase 2).
- **(d) dual-class:** RESOLVED safe — zero `classes[0]` reads in codebase; all consumers use `.includes()`/`.some()`/iteration; icon renderer already does `classes.slice(0,3)`. Stored dual-class as 2-element arrays (e.g. `["Covert","Tech"]`); color = first class's color (color is display + Grey-check only).
- **Open/flag:** masterminds have NO `epic{}` block (inventory captured no Epic-side data) — confirm whether Epic variants are in scope before 3d. Scheme `endGame`/`twistEffect` are camelCase placeholders to wire in 3e. `backingTrack: ""` (falsy-safe, default music).

## Phase 2: Setup Screen — ✅ Complete (2026-06-22)
- **Scheme scope applied (coordinator decision):** removed Fragmented Realities (id 41, skipped) + Smash Two Dimensions Together (id 44, deferred) from cardDatabase.js + deleted their 2 images. 6 schemes remain (Build an Army of Annihilation, Corrupt the Next Generation, Crush Them With My Bare Hands, Dark Alliance, Master of Tyrants, Pan-Dimensional Plague).
  - Build an Army of Annihilation: at 3e use **M.O.D.O.K.s as the "Annihilation Wave Henchmen" stand-in** (named group is a pre-release printing error; rules-as-intended — scheme spawns its own 10-henchman army from M.O.D.O.K. art/stats).
- **index.html registration:** OVERALL SET + heroes-section Sets filter get "Secret Wars Vol. 1" (matches Revelations' partial pattern — per-section scheme/MM/villain/henchmen Sets filters were never given Revelations either; left as-is). Card entries: 6 schemes, 2 masterminds, 4 villain groups, 2 henchmen, 14 heroes (each behind `<hr data-set="Revelations">`).
- **Team filters:** added `Cabal` + `Illuminati` to #heroteamfilter.
- **expansionSecretWarsVol1.js** skeleton created; script tag wired into the load chain (after Revelations, before updatesContent); added to `sw.js` FILES_TO_CACHE (CACHE_NAME stays `legendary-v5` — bump at merge).
- **Epic toggle:** SW masterminds have no `epic{}` → `script.js:973` (`if (mastermind.epic)`) auto-hides the toggle. No toggle exposed. ✓
- **Verified:** `node --check` clean (skeleton + cardDatabase); grep confirms 6/2/4/2/14 registrations, both team filters, 0 epic blocks, removed schemes absent.
- **ASSET GAP (flag):** no `Illuminati.svg` / `Cabal.svg` team icons exist (staging shipped none) — using `Unaffiliated.svg` placeholder for those 8 heroes + 2 team filters. Reversible; needs proper icons before ship.
- **LIVE SMOKE TEST — ✅ PASS (`/game-test`, 2026-06-23):** game loads with no real console errors (only known sw.js 404); all dropdowns populate (14/4/2/6/2 + Cabal/Illuminati filters); Epic toggle stays hidden for Madelyne; full game started (Madelyne + Pan-Dimensional Plague + Limbo + M.O.D.O.K.s + 3 SWV1 heroes) — **12 SWV1 board images all loaded (naturalWidth>0), 0 broken**; M.O.D.O.K.s/Madelyne/Limbo render with full art. Setup validation correctly reads scheme `requiredHeroes:3` / What-If `requiredVillains:1`. Screenshot: `docs/playwright-runs/2026-06-23/swv1-phase2-smoke-board.jpeg`.
- **Minor observation (benign):** empty `backingTrack:""` on SWV1 schemes emits a one-time `console.warn` "No scheme or backingTrack found, using default" (`script.js:19100`) and plays default music — working as designed (falsy-safe). Optional polish: assign an existing track name per scheme.

### (c) gainSidekick() helper — proposed design (read-only; for Phase 3a-2 build)
Cost-free, cap-free Sidekick gain is genuinely missing (`recruitSidekick()` @ script.js:17782 always sets `sidekickRecruited` + deducts cost). Proposed:
```
async function gainSidekick(destination = "discard") { // "discard" | "hand" | "deckTop"
  if (sidekickDeck.length === 0) { onscreenConsole.log("No Sidekicks remain in the deck."); return null; }
  const sk = sidekickDeck.pop();
  if (destination === "hand") playerHand.push(sk);
  else if (destination === "deckTop") { playerDeck.push(sk); sk.revealed = true; }
  else playerDiscardPile.push(sk);
  onscreenConsole.log(`Gained a Sidekick (<span class="console-highlights">${sk.name}</span>) → ${destination}.`);
  updateGameBoard();
  return sk;
}
```
Does NOT touch `sidekickRecruited` or recruit points (per insert: gain ≠ recruit). Consumers: Magik Rally, King of Wakanda (×3, deckTop via Illuminati), Maximus Enslave, Namor Lead, Ultimate Spidey Marvel Team-Up; also Corrupt-the-Next-Gen "gain to deck top". Mirrors `recruitSidekick()` destination branches minus the cap/cost.
<!-- index.html dropdowns + create expansionSecretWarsVol1.js skeleton + script tag + sw.js FILES_TO_CACHE entry -->

## Phase 2.5: Behavioral Specs frozen — ✅ Complete / FROZEN (2026-06-23)
- `docs/expansion-specs/secret-wars-vol1.md` — ~87 card blocks, **36 LOW-confidence markers** (30 cards + keystone/shared-mechanics blocks; each LOW = mandatory dynamic `/game-test` in Phase 3). Committed BEFORE any Phase 3 code (the Phase-4 blind-compare contract).
- Front-loaded: **Open Questions for ratification** (Q1 "each other player" solo rule + per-card calls; Q2–Q7 scheme/card reading calls) + **Shared Mechanics & Keystone** (Multiple Masterminds engine spec, gainSidekick w/ empty-stack guard, Teleport, Cross-Dim Rampage, dual-class, no-rules-text predicate, gain-as-hero converter, free-defeat, Banker reserve, ≥6-recruit gate, Demon Goblins).
- Authoring: front section + keystone authored by lead; 4 per-card drafts via parallel subagents (inventory + mechanics-doc inputs), every block reviewed against the inventory before freeze.
- **HOLD Phase 3** pending coordinator review of the frozen spec + ratification of Open Questions Q1–Q7. None block the keystone (3a-1); Q1–Q7 gate specific consumers in 3b–3e.

## Phase 3: Effects — 🟨 In progress
- 3a-1 **KEYSTONE — Multiple Masterminds engine** (core change, infrastructure-first): ✅ built (commit `7e58d01`) + coordinator-reviewed (PASS) + **dual-mode `/game-test` PASS 2026-06-23** (see below).
- 3a-2 Other keywords & helpers: 🟨 `gainSidekick()` helper built (expansionSecretWarsVol1.js) — cost-free/cap-free, empty-stack guard, 3 destinations; validator + code-review clean. Remaining 3a-2 keywords (Teleport grant, Cross-Dim Rampage, no-rules-text predicate, etc.) still ⬜.
- 3b Heroes (14): ⬜
- 3c Villains: 🟨 **Apocalyptic Magneto built EARLY** (keystone consumer) — `apocalypticMagnetoFight` (reuses `recruitXMen`), `apocalypticMagnetoEscape` (reuses keystone `ascendToMastermind` + base `magnetoStrike`). Remaining Domain/Limbo/Manhattan/Sentinel villains ⬜.
- 3d Masterminds (Madelyne + Demon Goblins/fight-gate; Nimrod ≥6-recruit gate): ⬜
- 3e Schemes (8; Dark Alliance → keystone consumer; 3 gated on open decisions): ⬜
- 3f Henchmen/Bystanders (M.O.D.O.K.s, Thor Corps, Banker): ⬜

### Keystone dual-mode `/game-test` — ✅ PASS (2026-06-23), both `golden` + `whatif`
Validated via Apocalyptic Magneto ascension (state-injection; randomize-all start, then direct fn calls):
1. **Escape → secondary** ✅ `apocalypticMagnetoEscape` registers 1 ascended secondary (attack 8, VP 6, 0 tactics, `masterStrike:"magnetoStrike"`); `#mastermind-2` slot renders with "8" overlay + correct art.
2. **Master Strike → both fire** ✅ real `handleMasterStrike` loop fires the main MM's strike AND the secondary's (`magnetoStrike`); `mastermindDefeated` stays false.
3. **One-fight defeat → VP-6 Villain** ✅ spend 8 → ascended Magneto lands in Victory Pile as `type:"Villain", victoryPoints:6`; slot hides.
4. **Win gate** ✅ both directions: win fires ONLY when main MM defeated AND `allSecondaryMastermindsDefeated()`; a live secondary blocks the win even with main defeated.
5. **Golden Assertion 4** ✅ `secondaryMasterminds` referenced nowhere in Final-Showdown/cumulative-points math (grep-confirmed: only master-strike loop, win-gate helpers, registration, slot render, click listener) — secondary is a separate must-kill gate, NOT folded into Showdown points; main 4-defeat→Showdown flow unchanged.
6. **Fight smoke** ✅ `apocalypticMagnetoFight` → X-Men HQ slots selectable, non-X-Men greyed, chosen hero → discard, slot refilled. ⚠️ **but** recruit went 0→+3 (hero.cost), see finding below.

### Findings surfaced this session (for coordinator)
- ⚠️ **`recruitXMen` over-credits recruit (pre-existing BASE bug, not introduced here).** `recruitHeroConfirmed` no longer deducts cost (script.js:18843-18389 — caller does via `spendRecruitCost`), but `recruitXMen` still does `totalRecruitPoints += hero.cost` with no offsetting spend → net **+cost** recruit instead of free (net 0). Affects base Magneto "Bitter Captor" tactic AND Apocalyptic Magneto Fight. **Recommend** central 1-line fix in `recruitXMen` (drop the `+= hero.cost` / negative-zone twin) — benefits base too. NOT unilaterally patched (shared base code; affects shipped base Magneto). Decision needed.
- ℹ️ **Escape double-existence (cosmetic).** On escape the engine pushes Magneto to `escapedVillainsDeck` + increments `escapedVillainsCount` (script.js:6181-6182) BEFORE the escape effect ascends him. No double-VP (ascended is a separate logical object; revert uses `createVillainCopy(sourceCard)`). But Magneto also counts as an "escaped villain" toward escape-based loss conditions. Minor; flag for ruling — arguably an ascended MM shouldn't count as escaped.

## Phase 4: Validation — ⬜ Not started
<!-- /expansion-audit + MANDATORY dual-mode gate (multi-mastermind touches rows 4/6/8) + guided test -->

---

## Open Decisions (block specific cards/schemes; NOT guessed — see mechanics doc Open Questions)
1. **Fragmented Realities — solo shape** (gameplay call, Paul). Degenerate at 1 player.
2. **Build an Army of Annihilation — henchman stand-in** (gameplay call, Paul). "Annihilation Wave Henchmen" not in this box.
3. **gainSidekick() helper design** (technical — propose & surface). Cost-free, cap-free Sidekick-gain helper is genuinely missing.
4. **Dual-class storage** (technical — verify & surface). Mechanics doc recommends 2-element `classes: ["Covert","Tech"]` array, NOT a slash string; must grep script.js for raw `classes[0]` reads before relying on it.
5. **Smash Two Dimensions — parallel-dimension cost** (scope call). High-cost new build; deferral candidate per Core Engine Changes #2.
