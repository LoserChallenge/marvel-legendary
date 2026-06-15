# Open Rules Questions — to revisit

Genuinely ambiguous rules/timing calls that were resolved provisionally to keep building, but remain open for later discussion. Distinct from `docs/rules-notes/[expansion].md`, which holds SETTLED rulings (rules-oracle cache). When a question here gets settled, move the ruling to the expansion cache and delete the entry here.

---

## "Play a copy of that card THIS TURN" — immediate vs. banked timing

**Cards:** Scarlet Witch — Hex Bolt ([RANGED] superpower) and Chaos Magic (special ability), Revelations expansion.
- Hex Bolt: *"Discard the top card of any player's deck. You may play a copy of that card this turn."*
- Chaos Magic: *"Reveal the top card of the Hero Deck. You may play a copy of that card this turn. When you do, put that card on the bottom of the Hero Deck."*

**The question:** Does "play a copy … this turn" mean the copy resolves IMMEDIATELY at activation (resolve-now), or may the player BANK the copy and play it at a chosen later moment within the same turn?

**Why it matters (the strategic delta):** Resolve-now forces *setup → activate* (play class-symbol cards first, then activate, so the copy sees the symbols). Banking would allow *activate → see the card → then decide setup → play the copy*, i.e. information before commitment. That's the only practical difference between the two readings.

**Current implementation (provisional): RESOLVE-NOW.** Chosen 2026-06-01 for simplicity + consistency with the existing engine. Built in `expansionRevelations.js` (`playCopyOfCard()`), commit c20ee07.

**Case for resolve-now (what it rests on):**
1. Precedent: the two older "play a copy" cards — Steal Abilities (Rogue, Core: *"…then activate a copy of that card's abilities"*) and Legendary Outlaw (GotG) — are written as single resolve-now instructions, no optionality, no "this turn."
2. Structural: Legendary has no "bank an effect / hold a token for later this turn" primitive anywhere. Every "play another/extra card" effect in the game resolves at its point of resolution. Banking a copy would be the only such effect in the game, with no rules for tracking a held copy. (This argument is sound: the copy is a conjured one-shot, NOT a card in hand — banking it would require new "you hold a pending copy of card X playable later" state with no analogue in the game. Independently confirmed by the sandbox audit, 2026-06-04.)
3. "this turn" reads as scope (the copy is a one-shot that evaporates at end of turn, never enters the deck) rather than a banking window — fits because these copy a whole *card*, unlike the older cards that copy just *abilities*. (Double-edged, flagged by the sandbox review: copying a whole *Hero card* can also be read to SUPPORT banked, since a Hero card is normally played at a time of the player's choosing — so point 3 is not clean directional evidence either way.)

**Case for banked (the open side — NOT dismissed):**
- The card explicitly says "this turn," which on its face suggests a window, not an instant.
- Chaos Magic's "When you do, put that card on the bottom" can be read as deferred ("when you eventually play the copy, then dispose the source").
- At least 1–2 BGG forum posters read it as banked (Paul, 2026-06-01).

**Status:** The rulebook has NO explicit rule (Core + Revelations both silent — confirmed via rules-oracle). Resolve-now is INFERRED from precedent + the absence of a banking primitive — **a genuine lean, NOT certain** (the user disputes it against BGG; the "this turn" = window reading is live). Kept resolve-now provisionally. **Revisit:** worth confirming against the official Upper Deck Legendary FAQ, and worth a closer look at the BGG threads.

**2026-06-10 RESEARCH RESULTS (rules-oracle + web-research):**
- **Rulebook: SILENT on banking — CONFIRMED.** No banking primitive in Core; the only backward/forward sequencing language is the Superpower class-check, which looks BACKWARD ("already played a same-class card earlier this turn"), never forward-banks. Cached `docs/rules-notes/core.md`.
- **Official FAQ (designer "Devin", RPGGeek mirror):** "Whenever [A] happens this turn, do [B]" effects span the REST of the turn after the card is played (not just the instant) — establishes Legendary's "this turn" = a turn-long window, which **supports BANKED**. Caveat: that ruling is for a *whenever-trigger*, NOT the exact "you may [take an action] this turn" optional-action phrasing of these cards — strong supporting evidence, not a direct ruling.
- **No DIRECT ruling found** for the copy cards or Demon Sight. The BGG threads that would likely settle it (#2734732 "Clarification on Scarlet Witch", #2484767 "Chaos Magic vs play restrictions", #2252486) are anti-bot-locked to automated fetch — **a HUMAN can open them in a browser.**
- **NET: both sources LEAN banked.** **Demon Sight (fight-type) has the STRONGEST case** — fighting is already a free-timing pooled-Attack action (Core p.12, "recruit/fight in between playing cards or after"), so "fight it this turn" maps naturally onto the existing turn-long fight window; the current resolve-now (must afford at superpower-fire) is the one spot that sits oddly against the rules. The **copy cards (Chaos Magic / Hex Bolt) are weaker** — no held-card-play concept exists. **The two may deserve DIFFERENT answers** (Demon Sight → banked/turn-long fight window; copy cards → keep resolve-now).
- **Paul's interim decision (2026-06-10): keep resolve-now across all three** — not a merge-blocker. Stronger revisit candidate now; ideally after a human checks BGG #2734732. If switched, Demon Sight's fix is a turn-scoped fightable-target window; the copy cards' fix is a banked-pending-play mechanic.
- **Paul's framing (2026-06-10) — ASSESS EACH CARD INDEPENDENTLY (do not apply a blanket "this turn" ruling):** the "this turn" qualifier never resolves in isolation — each card's OTHER wording/effects interact with it, so the correct timing answer can legitimately differ per card. Demon Sight's already-free-timing fight ≠ the copy cards' play-copy-with-transform interaction ≠ any future "this turn" card. When revisiting, evaluate each card on its full text, NOT by analogy to a sibling card. If it flips to banked, the implementation changes from immediate-play to a banked-copy mechanic (new "pending play" the player triggers later in the turn). Consider making the resolve-now-vs-banked behavior an observable/toggleable flag so a future FAQ answer can flip it without a rebuild (sandbox-review suggestion).

---

## Cable + Hellcat — simultaneous Master Strike reaction stacking

**Cards:** Cable (Master Strike hand-reaction → draw bonus) + Hellcat "Second Chance at Life" (Revelations; discard from hand to cancel a Master Strike / Scheme Twist entirely).

**The question:** If both are in hand when a Master Strike would occur and the player uses Cable's reaction (draw bonus) AND THEN Hellcat to cancel the strike completely (it never resolves), does Cable's bonus still legitimately apply — even though the strike it reacted to never actually happened?

**The real unresolved semantic (named per sandbox review):** does Hellcat **PREVENT** the strike (it never happened → Cable had nothing to react to → Cable's bonus should NOT stand) or **NEGATE** it (it happened, then was nullified → Cable's "would have occurred" trigger stands)? The current code implicitly takes the NEGATE reading.

**Current implementation (provisional):** Cable is *offered* first, then Hellcat; treated as INDEPENDENT reactions, so Cable's bonus stands (rationale: the strike "would have occurred," which is Cable's trigger condition). Implemented F-G6, commit 632a9d2. (Note: Cable is *offered*, not auto-applied — the player retains agency to decline it, so the fixed offer-order doesn't remove player choice.)

**Status:** Defensible but unverified — the rulebook almost certainly doesn't address this specific two-card interaction, so any ruling is INFERRED. Practical impact tiny (both cards in hand reacting to the same strike is rare). **Revisit** only if it surfaces in real play; the prevent-vs-negate distinction is the crux if it does.

---

## Korvac Saga twist + discard-invulnerability — "discard to 4 OR KO a bystander" partial compliance

**Cards:** Korvac Saga scheme twist ("Each player must discard down to four cards or KO a Bystander from their Victory Pile") + any discard-invulnerable hero (e.g. Cyclops "Unending Energy").

**The question:** If the player chooses the "discard down to four" branch but holds a discard-invulnerable card that can't be discarded (so they bottom out at 5 cards), have they satisfied the twist (partial compliance, stop at 5), or must they then switch to the KO-a-bystander branch because they "can't" reach 4?

**Current implementation (provisional):** Partial compliance — discard everything legally discardable; the invulnerable card stays; the player ends at 5 and the twist is satisfied. Built G5 of the auto-pick batch, commit 1d0fab9, by routing through checkDiscardForInvulnerability.

**Status:** RULEBOOK-SILENT on the OR-branch interaction → INFERRED. Note (sandbox review precision): the routing is modeled on the X-Men Master Strike / Clone Saga discard-to-N twins, but those are *pure* discard-to-N with no alternative branch, so "byte-identical" slightly overstates the equivalence — the OR-branch introduces a question the twins don't have. The partial-compliance OUTCOME is still the right reading (Legendary has no principle that a partially-blocked chosen branch forces you to the other branch; standard handling of forced discard under invulnerability is "discard what you legally can and stop"); only the justification was over-claimed as settled engine-consistency. **Revisit** only if it surfaces in real play.

---

## Korvac defeat → instant win bypassing Golden Solo Final Showdown

**Scheme:** Korvac / Korvac Revealed (Revelations). When transformed, the scheme is a 19-Attack / 9VP "Korvac" Villain; "If you defeat Korvac, KO the Mastermind and all its Tactics."

**The question:** Does defeating Korvac in Golden Solo bypass the mandatory Final Showdown (strength+4 Final Blow), or must the player still satisfy it?

**Ruling (rules-oracle, full version in docs/rules-notes/revelations.md):** INSTANT WIN in both modes. Korvac KOs the Mastermind and all Tactics outright → there's no Mastermind card left for the Final Showdown to run against → the strength+4 gate is moot. Both modes collapse to a single "Korvac defeated → win" path. What If? = SETTLED (no Final Blow by default). **Golden Solo bypass = INFERRED.**

**Strict-reading risk (named for completeness, per sandbox review):** Golden Solo's win condition is specifically *landing the strength+4 Final Blow*. A strict reading could hold that KO-ing the Mastermind by other means removes the only valid Final-Blow target and leaves the win-state *undefined* rather than *won*. We keep instant-win because it's almost certainly designer intent — the entire Korvac scheme is built around "defeat Korvac → destroy the Mastermind → win," so the Final-Blow gate is a solo-overlay this effect bypasses by construction.

**Cross-reference (audit-caught dependency):** this instant-win silently assumes the Korvac win-trigger is NOT Nullifier-negated (see the "Ultimate Nullifier … does NOT negate Korvac's win-trigger" entry in `revelations.md`). If the trigger were negated, the Mastermind would survive and the win wouldn't fire. The optionality of the Ultimate Nullifier ("you may") guarantees this in practice — no rational player negates their own win — and the build also exempts the trigger via `cannotBeNullified`.

**Status:** Implemented (Korvac build, Cluster B) as instant-win, no Final-Showdown routing. **Revisit** only if a future rules clarification says a direct-KO scheme should still force the strength+4 showdown — unlikely.

---

## Korvac "counts as a Villain" — does it feed "for each Villain in the city" tallies?

**Scheme:** Korvac Revealed (Revelations). Card text: *"This Scheme counts as a 19 Attack 'Korvac' Villain worth 9VP."* Implemented by reusing the Location plumbing — Korvac is placed in `cityLocations[]` (type `"Location"`, fought via `defeatLocation()`) so the fightable/affordability/VP/defeat chain comes for free.

**The question:** Korvac "counts as a Villain." Should it therefore count toward OTHER effects that tally or target "for each Villain in the city" / "a Villain in the city"? (The converse — whether it counts as a *Location* — is SETTLED separately: it does NOT; see below.)

**Settled half (do not re-litigate):** Korvac is a Villain, NOT a Location. Revelations rulesheet p.2: *"Locations do not count as Villains."* Location is a distinct card type; Korvac never gains the Location keyword. So Korvac must be EXCLUDED from every "for each Location in the city" effect (Grim Reaper "+1 Attack per Location," Epic Grim Reaper "3+ Locations → Wound," and the Ultimate Nullifier over-scope that shares the same Location-plumbing root). This exclusion is implemented and is the settled ruling cached in `docs/rules-notes/revelations.md`.

**The open half:** whether Korvac feeds Villain-counting effects is genuinely unsettled.
- `rules-oracle` (rulebook): INFERRED **yes** — "counts as a Villain" is a blanket grant of Villain status, so Villain tallies should see it. Caveat: space-specific effects ("the Villain in the Bank") wouldn't apply since Korvac occupies no city space.
- Web search (2026-06-04): **no public designer or community ruling exists** (BGG forums 403-blocked, Reddit blocked — one Korvac thread, BGG #2294048, was inaccessible to automated fetch and could be checked by a logged-in human). The closest precedent (a city space holding only a Location still counts as **empty** for Last Stand) leans toward **narrow** counting — but it's a Location precedent, weak by analogy to a card that explicitly IS a Villain.

**Current implementation (provisional): NARROW — Korvac feeds NEITHER tally.** Chosen 2026-06-04. It is the existing behavior (Korvac is typed Location internally, excluded from Location counts via flag, and never added to Villain counts), so it requires zero added code; it matches simple-over-complete; and the only public precedent tilts narrow.

**May be moot:** if no card in realistic pairings actually has a "for each Villain in the city" / villain-in-city-count effect that Korvac would touch, the question never arises. A codebase grep for such effects determines whether this is a live decision or a non-issue.

**Status:** RULEBOOK + public sources SILENT → house-ruling call. Provisionally NARROW (Korvac in no tally). **Revisit** if a "for each Villain in the city" effect surfaces in play and the narrow reading feels wrong, or if the official Upper Deck FAQ / BGG thread #2294048 yields a ruling.

---

## Hellcat "Demon Sight" superpower — "fight it this turn" timing + simplified attack spend

**Card:** Hellcat "Demon Sight" [AVENGERS] superpower (Revelations): after the base reveals the top Villain-deck card, "If it was a Villain, you may fight it this turn." Implemented commit 58380e9 (Option 1).

**Accepted simplifications (provisional):**
1. **Timing = resolve-now.** "Fight it this turn" resolves at superpower-time (you must afford the villain's Attack then), not a banked "fight it anytime this turn" window. Consistent with the **PROVISIONAL resolve-now reading** for Chaos Magic/Hex Bolt (the "Play a copy … this turn" question at the top of this file — itself OPEN, INFERRED, and BGG-disputed, NOT settled). **Dependency: this timing leans on that resolve-now reading — if that question flips to banked after FAQ review, re-examine this one too.**
2. **Plain-pool attack spend.** Cost is deducted straight from totalAttackPoints (cumulativeAttackPoints untouched). This skips the Thor recruit-as-attack counter-popup split and the Negative Zone swap nuance — both rare and N/A to a deck-revealed target (no per-space reserved attack).

**Status:** INFERRED-consistent with the (provisional) "this turn" handling above; reasonable for an edge superpower. **Revisit** if the resolve-now read flips, OR if playtest shows the resolve-now timing is too restrictive (player rarely has attack at superpower-resolution) — if so, the fix is a turn-scoped fightable-target window.
