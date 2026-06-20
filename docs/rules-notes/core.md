# Core Set — settled rules cache

Greppable rulings from the Core rulebook (`rules/Legendary_Rules-Core_Set.pdf`). One-line entries: rule + solo handling + source page.

---

## Turn structure / Play phase ordering (Step 2)

"Play each card in your hand in any order, one at a time. Each time you play a card, do what that card says." — Core p.11. There is NO Core rule defining a delay/bank window: a card's instruction is resolved when the card is played ("do what that card says"), not held. Solo: identical (single player owns the whole turn).

## Recruiting and fighting can interleave with card plays

"In between playing cards from your hand, or after you've played all your cards, you can recruit any number of Heroes and fight any number of Villains. You can recruit and fight in the same turn." — Core p.12. So Recruit/Attack POINTS accrued earlier in the turn persist in a pool and may be spent at any point in the Play phase. This is a points pool, NOT an effect-banking primitive.

## Superpower abilities — conditional on PRIOR play, fire when the card is played

"You can use that special Superpower ability only if you have already played another card of that hero class earlier in your turn." — Core p.11–12. The ability's CONDITION looks backward (a same-class card already played); the ability itself resolves at the moment its card is played. Once-per-card: "You can only use a card's Superpower once, even if you played two or more cards of the required hero class earlier in the turn." (p.12)

## Superpower icon count — printed icons mean N OTHER cards, NOT including the bearer — SETTLED

The condition counts cards played earlier this turn EXCLUDING the bearer card; the bearer is never one of its own required icons.
- Single-icon (Core): "only if you have already played ANOTHER card of that hero class earlier in your turn." — Core p.11–12. Odinson example (1 Strength icon): "If you play two Odinson cards as your first two cards of the turn, you won't get to use the Superpower ability for the first Odinson card you play this turn, but you will get to use the Superpower for the second Odinson card you play this turn." (Core p.12) → second copy fires because the FIRST copy is the "another" — bearer not counted.
- Multi-icon "Critical Hit" (Dark City): "These potent new Superpower abilities show two icons instead of one. You can only use this Superpower ability if you have played cards with both of those icons earlier in your turn. For example, if a card says '[icon][icon]: You get +3 [attack]', you get that bonus only if you already played two OTHER [icon] cards earlier in your turn." — Dark City rules p.1 ("Critical Hit Superpowers"). N icons = N OTHERS played earlier; bearer excluded.
- VERDICT: icons mean N OTHERS. A card printed with 4 [S.H.I.E.L.D.] icons needs 4 OTHER S.H.I.E.L.D. cards played earlier (5 incl. bearer). Team icons (Avengers/X-Men/S.H.I.E.L.D.) "work the same way as Superpowers that use hero class icons" (Core p.12).
- ENGINE NOTE: the engine condition-check counts cards played this turn EXCLUDING the bearer, so an N-icon card coded with N condition entries fires at N others — which MATCHES the rulebook. Coding N entries for an N-icon card is CORRECT, not off-by-one too-strict. (Quicksilver ×4, Higher-Further-Faster ×2, Captain Marvel Sword-of-S.H.I.E.L.D. ×4 are correctly coded if each entry = one OTHER required card.)
- Solo: identical (single player; "earlier in your turn" is the same turn-local condition). Applies to both Golden Solo and What If?.

## Locations & "Villain"/"Henchman" conditions — MATCH THE LITERAL KEYWORD. "Villain"-keyed skips Locations (incl. HYDRA Base); "Henchman"-keyed DOES hit HYDRA Base (it IS a Henchman). Game-wide. (Paul owner ruling 2026-06-19, refined.)

The rulebook carve-out names VILLAINS specifically: *"Locations do not count as Villains. Special abilities that mention Villains do not work on Locations."* It does NOT say "Locations aren't Henchmen." So the discriminator is the literal keyword the card/scheme uses:
- **A "VILLAIN"-keyed condition never applies to a Location-type card** (incl. HYDRA Base, `type === "Location"`), regardless of how it's fought or what group it belongs to. All settled:
  - "Whenever you defeat a Villain" triggers (War Machine "Military-Industrial Complex" +1 Recruit, Nightbringer) do NOT fire on defeating a Location card itself — HYDRA Base included.
  - A Location does NOT count toward any Scheme's "N **Villains** escaped" / Villain-escape Evil-Wins tally (the scheme text says "Villains"; a Location is also a PLACE — rulesheet *"Once placed, Locations don't move"* — it cannot flee).
  - "for each Villain", choose/KO/affect "a Villain" in the city — Locations excluded (they also live in `cityLocations[]`, not `city[]`).
- **HYDRA Base IS a Henchman ("Henchman Location"), so a condition keyed on the word "HENCHMAN" (not "Villain") DOES apply to it.** The carve-out names Villains, not Henchmen, and HYDRA Base's printed type is Henchman. Worked example: War Machine "Simulated Target Practice" — *"fight a **Henchman** from your Victory Pile"* — a defeated HYDRA Base IS a valid target (CORRECT as-is, NOT a leak). Its Henchman identity is real, not cosmetic.
- LEGITIMATE non-Location case: defeating a real Villain/Henchman that merely occupies the city space UNDER a Location IS a normal Villain defeat and DOES fire Villain triggers — the Location card is untouched.
- Applies to ALL schemes/cards, present and future, BOTH solo modes. Full reasoning + sources: `docs/rules-notes/revelations.md` (Locations-vs-Villains + HYDRA Base + Lethal Legion entries).

## No general "bank an effect / hold a pending play for later this turn" primitive — CONFIRMED

Core neither grants nor forbids banking an effect for later in the same turn; it simply has no banking concept (cards "do what they say" when played — Core p.11). Resolve-now is an INFERENCE from that absence, not a stated rule. Bears on Revelations "this turn" timing (Demon Sight / Chaos Magic / Hex Bolt). Full open-question record: `docs/rules-notes/open-rules-questions.md`.
