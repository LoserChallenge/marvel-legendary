# Open Rules Questions (unverified — flagged, not blocking)

Low-impact rules ambiguities surfaced during implementation. Each is implemented on a
defensible reading; listed here so the reading is visible rather than buried in code.

## Cable + Hellcat simultaneous reaction to the same Master Strike (F-G6, 2026-06-01)

- **Cards:** Cable "Disaster Survivalist" (discard from hand when a Master Strike would be
  played → draw 3 next turn) and Hellcat "Second Chance at Life" (discard from hand when a
  Master Strike/Scheme Twist would occur → draw 3 now, cancel it, shuffle it back).
- **Question:** When both are in hand and the *same* Master Strike would occur, and the player
  uses Hellcat to cancel it — does Hellcat's cancel preempt/negate Cable's bonus, or are the
  two reactions independent (Cable's draw-3-next-turn still stands)?
- **Implemented reading:** Independent. In `handleMasterStrike` (script.js), Cable is offered
  first (existing `processCableCards`), then Hellcat. Both trigger on the same "would occur"
  event; Cable's bonus is granted on the would-be event regardless of Hellcat's subsequent
  cancel. So a player can take Cable's draw-3-next-turn AND cancel the strike with Hellcat.
- **Status:** Unverified against rulebook. Practical impact tiny (requires both rare cards in
  hand simultaneously). Defensible but flag for confirmation if it ever comes up in play.

## Earthquake/Tsunami "3 Villains escaped" — do escaped Henchmen count? (2026-06-11 playtest)

- **Card:** Earthquake Drains the Ocean / Tsunami Crushes the Coast.
  Evil Wins: "When 3 Villains per player have escaped **or** the Villain Deck runs out." (Solo = 3.)
- **Question:** When the Tsunami transform destroys city spaces and the occupants escape, the
  escapees can include **Henchmen** (e.g. Mandarin's Rings, HYDRA Base) as well as Villains.
  Does the "3 Villains escaped" loss counter count **only Villain-type** cards, or any escaped
  card (Henchmen included)?
- **Why it matters:** drives both the loss-tracking logic AND the on-screen counter (see the
  display item in the hands-on playtest log — the counter should reflect whatever the correct
  ruling is). Paul's reading from the card text: **Villains only, NOT Henchmen.**
- **To verify:** Revelations rulesheet definition of "Villain" for escape/loss conditions, and
  whether Legendary's general rule treats escaped Henchmen as "Villains" for scheme Evil-Wins
  counts. Route to `rules-oracle` (rules PDFs are master-folder-side; flag if unavailable here).
- **Status:** Unverified. Logged, not yet implemented/changed.
