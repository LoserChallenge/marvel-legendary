# Rules Notes — Secret Wars Volume 1

Cache for Rules Oracle findings on Secret Wars Vol. 1 (solo-framed). Authoritative-source quotes with page cites. Solo rulesets win where they speak; base rule labeled INFERRED where solo is silent.

Sources used:
- Secret Wars rules insert: `expansions/secret-wars-vol1/Legendary_Rules_Secret_Wars_v1.pdf` (2-page insert; image-text, sections quoted below)
- Finalized inventory (card content): `docs/card-inventory/final/secret-wars-vol1.md`
- Golden Solo ruleset: `rules/marvel-legendary-the-golden-solo-ruleset.pdf` (1 page)
- What If? rulebook: `rules/WhatIf_Rulebook.pdf` (28 pages; pages cited by printed page number)

---

## THE HEADLINE FINDING (read first)

**Multiple-Masterminds-in-solo IS officially defined — by the What If? solo ruleset, NOT by Golden Solo.**

- The **What If? rulebook fully defines the "ascend to become a new Mastermind" mechanic** in a dedicated section, "Villains Ascending to Become Additional Masterminds" (printed p.19), AND has a full solo section (printed p.24) that this set's solo mode runs under. The ascend mechanic is identical card-text to Secret Wars (both 2023+ Upper Deck wordings). So for **What If? Solo mode in this app, the rule is SETTLED, not a design decision.**
- **Golden Solo is SILENT.** The Golden Solo ruleset (one page) never mentions multiple/second Masterminds, ascension, or how its bespoke "defeat the Mastermind 4 times → Final Showdown" win condition interacts with a second Mastermind. So **for Golden Solo, multi-mastermind handling is genuinely a design decision the app must make** — but the What If? rule is the obvious faithful template to copy.

---

## Q1 — Multiple Masterminds: full mechanics

The Secret Wars insert ("Multiple Masterminds", p.1) verbatim:

> "When some powerful Villains in this set escape, they ascend to become new Masterminds, so there are multiple Masterminds in the game! Schemes can do this too. Players must defeat all the Masterminds to win. When a Master Strike occurs, each Mastermind does its Master Strike ability. The player whose turn it is picks the order."

The What If? rulebook ("Villains Ascending to Become Additional Masterminds", p.19) is the fuller, authoritative version and adds the critical defeat detail:

> "When some powerful Villains in this set escape, they say that they ascend to become additional Masterminds. This means there are multiple Masterminds in the game!
> • Players must defeat all the Masterminds to win.
> • When a Master Strike occurs, each Mastermind does its Master Strike ability. The player whose turn it is picks the order.
> • If an effect says it does something to 'the Mastermind,' you pick which Mastermind it affects.
> • An ascending Mastermind doesn't have Mastermind Tactics. You only need to fight it once to defeat it and put it into your Victory Pile. Once it's in your Victory Pile, it's considered a Villain card again, not a Mastermind or Tactic card."

**Mechanics summary:**
- **Win condition:** defeat ALL Masterminds (original + every ascended one).
- **Master Strikes:** every Mastermind in play fires its own Master Strike on each Master Strike trigger; current player chooses order.
- **"the Mastermind" targeting:** when an effect names "the Mastermind", the player chooses which one.
- CONFIDENCE: **SETTLED** (both inserts agree; What If? gives the defeat detail).

---

## Q2 — A villain that "ascends to become a new Mastermind": what it becomes mechanically

Governing rule (What If? p.19, quoted above): **an ascended Mastermind has NO Tactics, is defeated by ONE fight, and reverts to a normal Villain card in your Victory Pile.**

For **Apocalyptic Magneto** specifically (inventory `secret-wars-vol1.md` lines 627–630):
> "Fight: Gain an X-Men Hero from the HQ for free.
> Escape: Magneto ascends to become a new Mastermind. He gains the ability, 'Master Strike: Each player reveals an X-Men Hero or discards down to four cards.'
> Attack: 8 | VP: 6"

- **Defeat value:** The rulebook does NOT print a separate "Mastermind strength" for an ascended villain. The only Attack value the card carries is its **printed villain Attack — 8 for Magneto**. The What If? rule says "You only need to fight it once… put it into your Victory Pile" using normal fight rules, and the insert ("Villains You Gain as Heroes", p.1) reinforces that gained/transformed cards keep "their old Villain Attack value." So **you beat the ascended Magneto by spending Attack ≥ 8 (his printed villain Attack), one time.** It does NOT acquire a new/higher Mastermind strength.
- **Tactics:** None. It has ONLY the granted Master Strike ("Each player reveals an X-Men Hero or discards down to four cards" — solo: the active player does it themselves; see Q6/solo "each other player" note). No face-down Tactic stack.
- **Number of defeats:** ONE (vs. four for a normal Mastermind's Tactic stack).
- **Where it sits:** It occupies the Mastermind area as an additional Mastermind while in play; once fought it goes to your Victory Pile and counts as a normal Villain (VP 6) again.
- CONFIDENCE: **SETTLED** for defeat value/Tactics/defeats (What If? p.19 + insert p.1 are explicit). The insert alone never spells out the ascended Attack number — it's the What If? rule + "use old Villain Attack value" line that nails it to printed Attack 8.

---

## Q3 — Solo reconciliation (THE key question)

- **Golden Solo ruleset: SILENT on multiple/second Masterminds.** Full single-page ruleset read; no mention of ascension, additional Masterminds, or how a second Mastermind interacts with "Defeat the Mastermind 4 times" + Final Showdown. The Golden win/lose conditions are written for exactly one Mastermind.
- **What If? Solo ruleset: ADDRESSES it (transitively + directly).** The ascend mechanic is fully defined at p.19 (applies in all modes including solo), and the What If? solo section (p.24) governs solo play. Nothing in the solo section overrides the ascend rule, so in What If? Solo: a second Mastermind appears, fires its Master Strike each Master Strike, and must also be defeated (one fight) to win. The solo "each other player → do it yourself" rule (p.24) handles its Master Strike text in 1-player.
- **Verdict:**
  - **What If? Solo → SETTLED by official rules.** Honor the ascend rule as written: extra Mastermind, one-fight defeat at printed Attack, both Master Strikes fire, win requires defeating both.
  - **Golden Solo → genuine DESIGN DECISION.** Official rules don't define how a second Mastermind meshes with the 4-defeats-then-Final-Showdown structure. App must decide (recommendation in summary).
- CONFIDENCE: **SETTLED** that Golden is silent and What If? defines it; the Golden design call itself is **OPEN** (ours to make).

---

## Q4 — Dark Alliance scheme

Inventory verbatim (`secret-wars-vol1.md` lines 844–849):
> "Dark Alliance
> Setup: 8 Twists.
> Twist 1: Add a random second Mastermind to the game with one Mastermind Tactic.
> Twists 2-4: If the second Mastermind is still in play, it gains another Mastermind Tactic.
> Twists 5-6: Each Mastermind captures a Bystander.
> Twist 7: Evil Wins!"

- **Second Mastermind here is a REAL, full-strength Mastermind, not reduced.** It is a randomly chosen Mastermind card placed into the game at its **normal Attack/strength**. The scheme does NOT reduce its strength — it only controls how many **Tactics** it has: it starts with **one** Tactic (Twist 1), and gains another on each of Twists 2–4 (up to four Tactics) **if still in play**. So unlike an *ascended* villain-Mastermind (no Tactics, one defeat), the Dark Alliance second Mastermind is fought like a normal Mastermind — you defeat it by fighting through however many Tactics it has accumulated.
- **"Twist 7: Evil Wins"** is the scheme's lose condition: when the 7th Scheme Twist is played, the Mastermind completes the Scheme and **all players lose immediately** (the Secret Wars insert/What If? p.15 "Evil Wins" rule: don't finish the turn). Note: 8 Twists are in the deck but **Twist 7 ends the game** — the 8th is effectively never reached. This is a race: defeat both Masterminds before the 7th Twist surfaces.
- CONFIDENCE: **SETTLED** (card text verbatim). One caveat flagged for human spot-check: the card text does not itself restate "normal strength" — that the added Mastermind uses its own printed strength is the default rule (a Mastermind added to the game uses its own card), INFERRED from absence of any reduction clause. Worth a Pass-3 eyeball on the physical card if available.

---

## Q5 — Master of Tyrants scheme (confirm interpretation)

CONFIRMED. Inventory verbatim (`secret-wars-vol1.md` lines 857–861):
> "Master of Tyrants
> Setup: 8 Twists. Choose 3 other Masterminds, and shuffle their 12 Tactics into the Villain Deck. Those Tactics are 'Tyrant Villains' with their printed Attack and no abilities.
> Twists 1-7: Put this Twist under a Tyrant Villain as 'Dark Power.' It gets +2 Attack.
> Twist 8: All Tyrant Villains in the city escape.
> Evil Wins: When 5 Tyrant Villains escape."

- The interpretation in the prompt is **correct**: Master of Tyrants takes **3 OTHER Masterminds' 12 Tactic cards** (4 each) and shuffles them into the Villain Deck as **"Tyrant Villains" — printed Attack, NO abilities.** It does NOT create a second active Mastermind, no Master Strikes, no second win condition. It needs **NO multiple-mastermind support** — these are just special Villains in the Villain Deck.
- CONFIDENCE: **SETTLED** (card text verbatim).

---

## Q6 — Verify interpretation calls

### 6a — Teleport
CONFIRMED (corrected nuance). Secret Wars insert ("Teleport", p.1) verbatim:
> "'Teleport' means 'Instead of playing this card, you may set it aside. At the end of this turn, add it to your new hand as an extra card.'"

- So Teleport = **set the card aside; at end of turn add it to your NEW hand as an extra card** — NOT "put on top of your deck." The inventory's New Keywords line ("Put this card on top of your deck") is a **simplification that conflicts with the actual insert text** — the insert is authoritative. Mechanically the difference matters: a Teleported card comes back THIS turn's-end into your next hand as a bonus card, it is not just placed on the deck to be drawn whenever.
- CONFIDENCE: **SETTLED** (insert verbatim). FLAG: inventory's keyword gloss is wrong/oversimplified — use the insert wording in implementation.

### 6b — Cross-Dimensional Rampage
CONFIRMED. Secret Wars insert ("Cross-Dimensional Rampage", p.1) verbatim:
> "'Cross-Dimensional Hulk Rampage' means 'Each player reveals one of their Hulk Heroes or a Hulk card in their Victory Pile or gains a Wound.'
> • This counts any card that includes 'Hulk' in its card name or Hero name, plus the alternate Hulks 'Maestro' and 'Nul, Breaker of Worlds.' (from Legendary: Fear Itself)
> • Likewise, 'Cross-Dimensional Wolverine Rampage' counts any card with 'Wolverine,' 'Weapon X,' or 'Old Man Logan.'"

- Wording is **"each PLAYER"** (NOT "each other player"). In 1-player solo it applies to **the active (only) player** — you reveal a matching-character Hero/Victory-Pile card or gain a Wound. (Contrast: the solo "each other player → do it yourself" rule is for "each OTHER player" effects; "each player" already includes you, so no translation needed — but the net solo behavior is the same: the active player resolves it.)
- Character-matching confirmed: **Hulk** = any "Hulk" in card/Hero name + "Maestro" + "Nul, Breaker of Worlds." **Wolverine** = any card with "Wolverine," "Weapon X," or "Old Man Logan." (So Old Man Logan and Apocalyptic Weapon X both satisfy a Wolverine Rampage.)
- CONFIDENCE: **SETTLED** (insert verbatim).

### 6c — Sidekicks one-per-turn limit
CONFIRMED. Secret Wars insert ("Sidekicks", p.1) verbatim:
> "Secret Wars adds a new Sidekick Stack to the game. Players can pay to recruit up to one Sidekick per turn. When card effects tell you to 'gain Sidekicks,' that doesn't count against that one-per-turn limit."

- So: the **one-per-turn cap applies only to RECRUITING (paying Recruit for) a Sidekick.** Card effects that "**gain** a Sidekick" (e.g., Magik's Rally the New Mutants, King of Wakanda's three Sidekicks) **do NOT count against the limit** — you can gain multiple via effects in the same turn and still recruit one with Recruit.
- CONFIDENCE: **SETTLED** (insert verbatim).

---

## Other in-scope ascend triggers (for completeness)
Only **two** in-scope sources add a second Mastermind: **Apocalyptic Magneto Escape** (villain ascend, Domain of Apocalypse) and the **Dark Alliance** scheme. All Deadlands/Wasteland ascend villains (Zombie Loki, Zombie Mr. Sinister, Zombie Thanos, Wasteland Kingpin) and the "Dark Apprentice" Ambition are **deferred this build** — same mechanic, but out of scope now.

---

## Decision-relevant summary (plain English)

Is multiple-masterminds-in-solo officially defined, or is it our call?
- **What If? Solo: officially defined — copy it.** The What If? rulebook (p.19) spells out the whole "ascend" mechanic: an ascended villain becomes a second Mastermind with no Tactics, you defeat it with a single fight at its printed villain Attack, both Masterminds fire their Master Strikes each Master Strike (player picks order), and you win only when ALL Masterminds are defeated. Nothing in the solo section overrides this, so What If? Solo is settled.
- **Golden Solo: our design call.** Golden Solo's one-page ruleset never mentions a second Mastermind; its win condition (defeat the Mastermind 4× → Final Showdown) assumes exactly one. So we decide how a second Mastermind fits. **Smallest faithful approach:** treat the ascended/added Mastermind as an *additional* enemy that must also be defeated, using the What If? template — its Master Strike fires alongside the main one, and the main Mastermind keeps its normal 4-defeats + Final Showdown flow. For an *ascended villain* (Magneto): one extra fight at Attack 8 to clear it. For *Dark Alliance*: the second Mastermind is a real Mastermind with 1–4 Tactics (gained on Twists 1–4) at its own normal strength; Twist 7 = instant loss, so it's a race.

Smallest faithful way to honor the two in-scope cards:
- **Apocalyptic Magneto:** on Escape, register a second "Mastermind" object whose only ability is the granted Master Strike, defeat value = printed Attack 8, one fight, then it's a normal VP-6 villain in the Victory Pile. Win now requires defeating both. Its Master Strike fires on each Master Strike.
- **Dark Alliance:** add a random real second Mastermind, give it 1 Tactic on Twist 1 and +1 Tactic on each of Twists 2–4 (if still in play, cap 4), both Masterminds capture a Bystander on Twists 5–6, and Twist 7 = Evil Wins (instant loss). The second Mastermind uses its own normal strength; win requires defeating both.

ONE thing to double-check (flagged): the inventory's **Teleport** gloss ("put on top of your deck") contradicts the authoritative insert ("set aside; add to your new hand at end of turn as an extra card") — implement the insert wording, not the inventory's. Also worth a physical-card Pass-3 confirm that Dark Alliance's second Mastermind is full-strength (no printed reduction; inferred from absence).
