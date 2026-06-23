// Secret Wars Vol. 1 Expansion
// 2026-06-22
//
// Effect implementation lands in Phase 3 (built against the frozen Phase 2.5 specs).
// Keystone Multiple-Masterminds engine change is built in Phase 3a-1 (in script.js),
// before its consumers (Apocalyptic Magneto ascension, Dark Alliance scheme).

// --- KEYWORDS & HELPERS ---

// gainSidekick() — cost-free, cap-free Sidekick gain (Secret Wars insert p.1: "gain" ≠ "recruit").
// Unlike recruitSidekick() (script.js), this does NOT touch sidekickRecruited or recruit points,
// so it ignores the 1-Sidekick-per-turn recruit cap and costs nothing.
// destination: "discard" (default) | "hand" | "deckTop".
// Consumers (Phase 3b/3c/3e): Magik Rally, King of Wakanda (×3 deckTop on Illuminati), Maximus
// Enslave, Namor Lead, Ultimate Spidey Marvel Team-Up, Corrupt-the-Next-Gen.
async function gainSidekick(destination = "discard") {
  if (sidekickDeck.length === 0) {
    onscreenConsole.log("No Sidekicks remain in the Sidekick Stack."); // graceful no-op
    return null;
  }
  const sk = sidekickDeck.pop();
  if (destination === "hand") {
    playerHand.push(sk);
  } else if (destination === "deckTop") {
    playerDeck.push(sk);
    sk.revealed = true;
  } else {
    playerDiscardPile.push(sk);
  }
  onscreenConsole.log(
    `Gained a Sidekick (<span class="console-highlights">${sk.name}</span>).`,
  );
  updateGameBoard();
  return sk;
}

// --- HERO CARD ABILITIES ---

// --- VILLAIN CARD EFFECTS ---

// Domain of Apocalypse — Apocalyptic Magneto (DB id 282, Attack 8 / VP 6).
// Fight: "Gain an X-Men Hero from the HQ for free." Reuse recruitXMen() (cardAbilities.js) — the
// shipped "free X-Men Hero from HQ → discard, refill slot" operation (base Magneto's Bitter Captor
// tactic). It greys-out non-X-Men slots and no-ops gracefully when no X-Men Hero is available.
async function apocalypticMagnetoFight(villainCard) {
  await recruitXMen();
}

// Escape: "Magneto ascends to become a new Mastermind." Registers a second active (ascended)
// Mastermind via the shared Multiple-Masterminds keystone (script.js ascendToMastermind):
// no Tactics, defeated by one fight at printed Attack 8, reverts to a VP-6 Villain in the Victory
// Pile on defeat. Granted ability is the base Magneto Master Strike ("Each player reveals an X-Men
// Hero or discards down to four cards") — identical text; reuse magnetoStrike() (cardAbilities.js),
// which already self-applies correctly in solo. Win now requires defeating this Mastermind too
// (Golden Solo: additional must-kill gate outside Final Showdown math; What If? Solo: per p.19).
async function apocalypticMagnetoEscape(villainCard) {
  ascendToMastermind(villainCard, {
    masterStrikeFn: "magnetoStrike",
    masterStrikeConsoleLog:
      "Each player reveals an <img src='Visual Assets/Icons/X-Men.svg' alt='X-Men Icon' class='console-card-icons'> Hero or discards down to four cards.",
    defeatAttack: 8,
    vp: 6,
  });
}

// --- SCHEME TWIST EFFECTS ---

// --- MASTERMIND EFFECTS ---

// --- HENCHMEN EFFECTS ---
