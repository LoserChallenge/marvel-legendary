# Expansion Decisions — cross-expansion design & rules precedents

On-demand reference. **Not auto-loaded** — consult during `/analyze-expansion` and before building a new mechanic. Records the design and rules-interpretation choices that recur across expansions, so a future expansion facing the same fork reuses the decided answer instead of re-litigating it. Pure mechanics traps and code patterns live in `docs/engine-gotchas.md`; this file is the "we chose X, here's why" layer.

---

## Architecture / modeling choices

- **City resize → Model B (`destroyedSpaces[]` flag array), not physical realloc (Model A).** Schemes that shrink/grow the city (Earthquake/Tsunami) flag spaces as destroyed rather than resizing `city[]`. Model A was killed because `initCityArrays()` does `fill(null)` and would wipe occupants on every resize. Model B reuses ~12 existing `destroyedSpaces` read sites, matches the "destroy/restore a space" card-text semantics, and is toggle-safe. Verify restore (toggle-back) is wired for any restoring scheme.
- **Epic Masterminds → single DB entry + `epic` sub-object + setup toggle** (Revelations Option B). Runtime spread `{...base, ...base.epic}` produces the epic variant; detect via `mastermind.name === "Epic X"`. (Already summarized in CLAUDE.md.)
- **Expandable henchman group → `cards[]` array template** (Mandarin's Rings, Revelations Option B). Mandarin's Rings is the only henchman group with a `cards[]` array; guard any cards-aware code with `if (henchman.cards)` so identical-copy groups keep the template path.
- **A fightable scheme-side entity with no city slot → a `type:"Location"` entity via `placeLocation()`** (Korvac, Grim Reaper Graveyard) — NOT by making `#scheme-place` clickable. The Location fight/affordability/VP/defeat chain comes free. Tag it `isSchemeVillain:true` and exclude from Location-count loops (see `docs/known-issues.md` for Korvac's documented residual limitations). Korvac toggles: place on transform to Side B, remove on transform back to Side A.
- **Hero-as-villain seeding recipe** (Skrull pattern, reused by Revelations Scarlet Witch): on the hero card placed in the villain deck set `type:"Villain"`, `attack:0`, `skrulled:true`, `fightEffect:"gainAsHeroFn"`. `skrulled:true` guards the VP-push skip across all 4 defeat handlers; clear `fightEffect` on the gained hero to prevent re-fire; any custom flags must be added to the `createVillainCopy()` whitelist.

## Reusable-UI decisions

- **Free-ordering "return cards in any order" → canonical helpers** `chooseReturnOrderSingleRow` / `pickFromCardsSingleRow`. For per-card TOP/BOTTOM placement, loop `pickFromCardsSingleRow` + `handleCardPlacement` per card. Reuse these, don't rebuild custom UI. (Both are hardcoded to `playerDeck` — parameterize the target deck for hero-deck cases; see `docs/engine-gotchas.md`.) "Top or bottom in any order" means the player chooses per-card placement AND ordering — dropping the "bottom" option is a regression even when reusing a helper.
- **Card-choice from a pool → `card-choice-popup`** (0 eligible → nothing; 1 → auto-act; 2+ → single-select by stored index). Precedent: `pickRingFromVictoryPile`, `moveOneFromVictoryPile`. The stored `vpIndex` is non-stale because nothing mutates `victoryPile` between popup-open and confirm.
- **Mr. Fantastic Nullifier negation scope → explicit allow-list `Set` of negatable trigger-function names**, NOT an exclude-list — new triggers are opt-IN to negation, preventing accidental negation of future effects.

## Rules-interpretation precedents

> Card-content rulings live in `docs/rules-notes/` (the canonical home, cited to source). The items here are the cross-expansion *interpretation patterns* a future expansion will re-encounter.

- **Match the LITERAL keyword for Locations.** "Villain"-keyed effects (defeat a Villain; N Villains escaped) skip ALL Locations including HYDRA Base; "Henchman"-keyed effects DO hit HYDRA Base (a genuine Henchman Location). Final ruling — ended the R2-3 churn. Full ruling + source: `docs/rules-notes/core.md` + `revelations.md`.
- **"each other player" on a LOCATION trigger in solo = self-apply ("do it yourself").** Non-Location "each-other-player" effects (tactics, master strikes, villain ambushes) stay deferred. Source: Revelations rulebook solo rule. (This is CLAUDE.md rule 8's origin.)
- **Card-text scope idioms:** "reveals their hand and [effect]" scopes the effect HAND-ONLY (the reveal-hand prefix is the idiom); a separate "KO up to two of your Heroes" stays broad (hand + played). "non-grey card" = any non-grey card in hand; "non-grey Hero" = Heroes only. A "non-grey" predicate must exclude BOTH color "Grey" AND Wounds (color "None" / type "Wound").
- **Superpower icon counts = N OTHER cards** (engine excludes the bearer via `cardsPlayedThisTurn.slice(0,-1)`); the DB entry count equals the printed icon count — no off-by-one. `conditionType:"None"` is a silent permanent-disable (`isConditionMet` has no case → returns false); icon-based superpowers use `conditionType:"playedCards"` + `condition:"Class&Class"`.
- **"this turn" / "fight it this turn" resolves at the moment the ability resolves** — there is no banking window in this engine.
- **A scheme's on-defeat win consequence (defeat X → win) is NOT a card `fightEffect`** for Nullifier purposes — the Ultimate Nullifier only cancels card `fightEffect` fields, not win-condition triggers chained off a defeat.

## Process precedents

- **Multi-part engine fixes with differing risk profiles → sequenced dispatches.** Ship and validate the lower-risk piece first, then the heavier/unknown piece (Fix 1A: reader-fix before resize). Avoids the heavy work running while the lighter design is still unvalidated.
- **Mode-coverage asymmetry is intentional.** `expansion-validator` is Golden-Solo-only by design (What If? is the base engine; Golden adds the structural rules worth validating). What If? behavioral divergences are caught by `/code-review` (flagging `gameMode` branching) + dual-mode live verification, not a second validator. *(Caveat from the 2026-06-20 retrospective: dual-mode divergences produced ~0 confirmed bugs across the Revelations build — keep dual-mode as a light check, not a heavy gate. See `docs/revelations-retrospective.md`.)*
- **Derive a mechanic's novelty from a code search, never from memory.** Before tagging a mechanic "new" in an expansion analysis (and before building it), grep the codebase — what looks new is often already built. Shards, e.g., is one of the most heavily-built mechanics (~440 refs in GotG + core); Into the Cosmos *extends* the Shards cap, it does not introduce Shards. Ties to the reuse-first `pattern-reuse-scout` survey (CLAUDE.md rule 9).
