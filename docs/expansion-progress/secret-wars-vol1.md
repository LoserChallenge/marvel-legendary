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

## Phase 2: Setup Screen — ⬜ Not started
<!-- index.html dropdowns (incl. new Illuminati/Cabal team filters) + create expansionSecretWarsVol1.js skeleton + script tag + sw.js FILES_TO_CACHE -->

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

## Phase 2.5: Behavioral Specs frozen — ⬜ Not started
<!-- docs/expansion-specs/secret-wars-vol1.md — committed before Phase 3; LOW-confidence flags on ambiguous cards -->

## Phase 3: Effects — ⬜ Not started
- 3a-1 **KEYSTONE — Multiple Masterminds engine** (core change, infrastructure-first): ⬜
- 3a-2 Other keywords & helpers: ⬜
- 3b Heroes (14): ⬜
- 3c Villains (4 groups; incl. Magneto ascension → keystone consumer; Manhattan/Thor-Corps gain-as-hero): ⬜
- 3d Masterminds (Madelyne + Demon Goblins/fight-gate; Nimrod ≥6-recruit gate): ⬜
- 3e Schemes (8; Dark Alliance → keystone consumer; 3 gated on open decisions): ⬜
- 3f Henchmen/Bystanders (M.O.D.O.K.s, Thor Corps, Banker): ⬜

## Phase 4: Validation — ⬜ Not started
<!-- /expansion-audit + MANDATORY dual-mode gate (multi-mastermind touches rows 4/6/8) + guided test -->

---

## Open Decisions (block specific cards/schemes; NOT guessed — see mechanics doc Open Questions)
1. **Fragmented Realities — solo shape** (gameplay call, Paul). Degenerate at 1 player.
2. **Build an Army of Annihilation — henchman stand-in** (gameplay call, Paul). "Annihilation Wave Henchmen" not in this box.
3. **gainSidekick() helper design** (technical — propose & surface). Cost-free, cap-free Sidekick-gain helper is genuinely missing.
4. **Dual-class storage** (technical — verify & surface). Mechanics doc recommends 2-element `classes: ["Covert","Tech"]` array, NOT a slash string; must grep script.js for raw `classes[0]` reads before relying on it.
5. **Smash Two Dimensions — parallel-dimension cost** (scope call). High-cost new build; deferral candidate per Core Engine Changes #2.
