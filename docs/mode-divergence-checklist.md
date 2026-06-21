# Mode-Divergence Checklist — Golden Solo vs What If? Solo

**Purpose:** the authoritative gate for dual-mode testing. `expansion-validator` is Golden-Solo-only and cannot catch What If? divergences. Use this list to decide, per expansion, whether any mechanic behaves differently across the two modes — if it touches anything below, that mechanic needs a dual-mode `/game-test` before merge.

**How to use it (the gate):**
1. For each new/modified mechanic in the expansion, ask: *does it touch any row below?*
2. **Any row touched → dual-mode `/game-test` is mandatory for that mechanic** (run the assertion in both `gameMode === 'golden'` and `gameMode === 'whatif'`).
3. The aliased `gameMode` grep (below) is a **cheap first-pass signal, not proof** — zero hits means no *direct* mode-branching in the expansion file, but divergence can still live in a shared `script.js` helper the file merely calls.

**Source of truth for the differences:** `docs/golden-solo-history.md`, the "Golden Solo Rules Summary" + "Scheme Hero Requirements Infrastructure" sections of `CLAUDE.md`, and the modes' setup logic in `script.js` (`getEffectiveSetupRequirements()`, `goldenRefillHQ()`, `processVillainCard()`).

---

## The divergent-mechanic list

| # | Mechanic area | Golden Solo | What If? Solo | A card/scheme touches it if it… |
|---|---|---|---|---|
| 1 | **Villain draw count / round** | 2 per round (1 if a bystander is spent) | 3 on turn 1, then 1 per round | draws extra villain cards, or changes the per-round draw count (Scheme Twists, mastermind effects) |
| 2 | **HQ refill behavior** | rotation — new card rightmost, others slide left (`goldenRefillHQ` / `goldenHQRotate`) | fill-in-place at the emptied slot | refills, KOs, or otherwise manipulates an HQ slot |
| 3 | **Bystander-spend reduction** | spend a bystander to cut that round's villain draws to 1 | not present | adds/removes bystanders to the victory pile in a way that interacts with the spend, or alters the spend rule |
| 4 | **Villain group count** | base 2 groups; `extraVillainGroups: N` adds more (Golden only); `alwaysLeads` honored | single-group cap (Kree-Skrull War known-issue tension with multi-group schemes) | is a scheme that requires extra villain groups, or a mastermind that `alwaysLeads` |
| 5 | **Villain deck composition (setup)** | 2 bystanders default + all 10 henchmen of the chosen group shuffled in (2-player rules) | scheme-driven counts, single group | a scheme overrides bystander/henchmen counts (`requiredVillains`, `specificVillainRequirement`, `extraVillainGroups`) — all flow through `getEffectiveSetupRequirements()` |
| 6 | **Win condition / Final Showdown** | 4 mastermind defeats → Final Showdown: combined recruit+attack ≥ strength+4 | standard single mastermind defeat | reads/writes `cumulativeAttackPoints` or `cumulativeRecruitPoints`, adds an evil-wins condition, or changes how the mastermind is defeated |
| 7 | **Hero count** | `scheme.requiredHeroes` (no longer hardcoded 5); setup/randomize read the DOM for the Golden count | `scheme.requiredHeroes` | now largely unified via `requiredHeroes`, but a scheme with `heroRequirements` (team composition / required hero) should be exercised in both modes to confirm validation + randomize fill behave |
| 8 | **"Each other player" effects** | silent skip (no other hero decks exist) — EXCEPT the Revelations Location solo rule: "do it yourself" (see `docs/expansion-decisions.md`) | same skip / self-application | has any "each other player" / "each player" wording |
| 9 | **Player-count scaling** | solo = 1 player; any count that scales by number of players | solo = 1 player | scales an effect by player count, or assumes multiplayer setup counts |

---

## Cheap first-pass grep (signal, not proof)

Run against the expansion JS file. Hits mean the file branches on mode directly → exercise both modes for those branches:

```
gameMode|isGolden|\bmode\b|'golden'|'whatif'
```

Zero hits → no *direct* branching in this file. **Not** a guarantee of no divergence — a shared `script.js` helper the file calls (e.g. `processVillainCard`, `goldenRefillHQ`, `getEffectiveSetupRequirements`) can diverge on the file's behalf. Fall back to the mechanic table above as the real gate.

---

## Revelations note

Revelations surfaced ~0 confirmed mode-divergence bugs. That may be robustness, or it may be looking-bias (What If? was under-exercised). This checklist exists to remove the looking-bias: divergence is now checked deliberately per mechanic, not discovered by accident.
