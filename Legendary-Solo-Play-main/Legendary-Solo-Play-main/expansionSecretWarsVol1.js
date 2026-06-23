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

// Cross-Dimensional Rampage (SHARED) — Secret Wars insert: "Cross-Dimensional <Family> Rampage" =
// "each player reveals a <Family> Hero or gains a Wound." Solo "each player" = the active player.
// Adapted from revealClassOrWound() (expansionRevelations.js:2329): swap the single-class predicate
// for a case-insensitive NAME-substring family match, and EXTEND the scanned pool to include the
// Victory Pile (spec: a defeated family villain in the VP — e.g. Apocalyptic Weapon X itself — counts).
// No family card available → forced Wound (drawWound() handles invulnerability).
// Consumers (3c): Apocalyptic Weapon X Escape + Wolverine of Future Past Escape (Wolverine family),
// Ultimate Thor Escape (Thor family).
function crossDimensionalRampage(familyNames, villainName) {
  const families = familyNames.map((f) => f.toLowerCase());
  const cardsYouHave = [
    ...playerHand,
    ...playerArtifacts,
    ...cardsPlayedThisTurn.filter(
      (c) =>
        !c.isCopied && !c.sidekickToDestroy && !c.markedForDeletion && !c.isSimulation,
    ),
    ...victoryPile,
  ];
  const isFamily = (c) =>
    c && c.name && families.some((f) => c.name.toLowerCase().includes(f));
  if (!cardsYouHave.some(isFamily)) {
    onscreenConsole.log(
      `No matching Hero to reveal — <span class="console-highlights">${villainName}</span><span class="bold-spans">'s</span> Cross-Dimensional Rampage forces a Wound.`,
    );
    return drawWound();
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Reveal a matching Hero to avoid gaining a Wound?`,
      "Reveal Hero",
      "Gain Wound",
    );
    const title = document.querySelector(".info-or-choice-popup-title");
    if (title) title.textContent = villainName;
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      onscreenConsole.log(
        `Revealed a matching Hero — no Wound from <span class="console-highlights">${villainName}</span>.`,
      );
      resolve();
    };
    denyButton.onclick = () => {
      closeInfoChoicePopup();
      drawWound();
      resolve();
    };
  });
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

// Domain of Apocalypse — Apocalyptic Blink (DB id 281, Attack 5 / VP 3).
// Fight: "Reveal the top card of your deck. Draw it or Teleport it." Solo = active player only.
// Reveal playerDeck top (reshuffle the discard pile in if the deck is empty); two-button choice —
// Draw (drawCard() pops the revealed top card to hand) or Teleport (route through the real teleport()
// so it returns next turn via cardsToBeDrawnNextTurn). Same reveal→draw-or-teleport shape as
// Dr. Strange "Cloak of Levitation" and Inferno Darkchilde (KO variant, Limbo).
async function apocalypticBlinkFight(villainCard) {
  if (playerDeck.length === 0) {
    if (playerDiscardPile.length === 0) {
      onscreenConsole.log("Your deck and discard pile are empty — nothing to reveal.");
      return;
    }
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
    updateGameBoard();
  }
  const revealed = playerDeck[playerDeck.length - 1]; // top of deck = end of array
  onscreenConsole.log(
    `<span class="console-highlights">Apocalyptic Blink</span> — revealed <span class="console-highlights">${revealed.name}</span> from the top of your deck. Draw it or Teleport it.`,
  );
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Reveal: ${revealed.name}. Draw it or Teleport it?`,
      "Draw it",
      "Teleport it",
    );
    const title = document.querySelector(".info-or-choice-popup-title");
    if (title) title.textContent = "Apocalyptic Blink";
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      drawCard(); // pops the revealed top card into hand
      resolve();
    };
    denyButton.onclick = async () => {
      closeInfoChoicePopup();
      const card = playerDeck.pop(); // the revealed top card
      playerHand.push(card); // teleport() expects the card in hand; it removes it to the next-turn queue
      await teleport(card);
      resolve();
    };
  });
}

// Domain of Apocalypse — Apocalyptic Rogue (DB id 283, Attack 6 / VP 4).
// Fight: "Reveal the top card of the Hero deck. The player of your choice gains it." Solo: the only
// player is the active player, who gains the revealed Hero (from the Hero DECK top, not an HQ slot →
// no HQ refill) to their discard pile.
async function apocalypticRogueFight(villainCard) {
  if (heroDeck.length === 0) {
    onscreenConsole.log("The Hero deck is empty — nothing to reveal.");
    return;
  }
  const card = heroDeck.pop(); // top of Hero deck = end of array
  playerDiscardPile.push(card);
  onscreenConsole.log(
    `<span class="console-highlights">Apocalyptic Rogue</span> — you gain <span class="console-highlights">${card.name}</span> from the top of the Hero deck to your discard pile.`,
  );
  updateGameBoard();
}

// Escape: "Reveal the top card of the Hero deck. Each player reveals their hand and discards a card
// of that class." Solo: the active player. PEEK the Hero deck top to name a class (it is NOT gained on
// Escape — leave it on top). Force-discard one hand card matching that class (any class for dual-class
// cards), routed through checkDiscardForInvulnerability(). Multiple matches → player picks which (the
// mandatory discard is the player's own card); reuse showCardSelectionPopup(). No match → no discard.
async function apocalypticRogueEscape(villainCard) {
  if (heroDeck.length === 0) {
    onscreenConsole.log("The Hero deck is empty — no class to reveal.");
    return;
  }
  const revealed = heroDeck[heroDeck.length - 1]; // peek; stays on top of the Hero deck
  const wantedClasses = (revealed.classes || []).map((c) => String(c).toLowerCase());
  onscreenConsole.log(
    `<span class="console-highlights">Apocalyptic Rogue</span> — revealed <span class="console-highlights">${revealed.name}</span> (${(revealed.classes || []).join("/") || "no class"}). Discard a matching card from your hand.`,
  );
  const isMatch = (c) =>
    c.classes && c.classes.some((cl) => wantedClasses.includes(String(cl).toLowerCase()));
  const eligible = playerHand.filter(isMatch);
  if (eligible.length === 0) {
    onscreenConsole.log("No matching card in your hand — nothing discarded.");
    return;
  }
  let chosen = eligible[0];
  if (eligible.length > 1) {
    chosen = await showCardSelectionPopup({
      title: "Apocalyptic Rogue",
      instructions: `Discard a matching card from your hand (${(revealed.classes || []).join("/")}).`,
      confirmText: "DISCARD",
      items: eligible,
    });
  }
  playerHand.splice(playerHand.indexOf(chosen), 1);
  await checkDiscardForInvulnerability(chosen);
  updateGameBoard();
}

// Domain of Apocalypse — Apocalyptic Weapon X (DB id 284, Attack 7 / VP 5).
// Fight: "KO one of your Heroes." Reuse FightKOHeroYouHave() (cardAbilities.js) — picker over Heroes
// in hand/artifacts/played; parameterized title + empty-pool guard confirmed fixed. Mandatory if able.
async function apocalypticWeaponXFight(villainCard) {
  await FightKOHeroYouHave("Apocalyptic Weapon X");
}

// Escape: "Cross-Dimensional Wolverine Rampage." SHARED helper — reveal a Wolverine-family card
// (name contains "Wolverine", "Weapon X", or "Old Man Logan") or gain a Wound.
async function apocalypticWeaponXEscape(villainCard) {
  await crossDimensionalRampage(
    ["Wolverine", "Weapon X", "Old Man Logan"],
    "Apocalyptic Weapon X",
  );
}

// Limbo — Inferno Colossus (DB id 285, Attack 5 / VP 3).
// Ambush: "The Mastermind captures a Bystander." The bystander attaches to the MASTERMIND (its
// .bystanders array), not to Colossus. Reuse the bystanderDeck source (mirrors demogoblinAmbush) +
// the MM-capture plumbing attachBystanderToMastermindFromVillainDeck() (popup + attach to the main
// mastermind via getSelectedMastermind). Multi-mastermind "the Mastermind" picker is deferred to 3e
// (secondary-MM captured-bystander wiring); main mastermind is correct for the common case.
async function infernoColossusAmbush(villainCard) {
  onscreenConsole.log(
    `Ambush! <span class="console-highlights">Inferno Colossus</span> — the Mastermind captures a Bystander.`,
  );
  if (bystanderDeck.length === 0) {
    onscreenConsole.log("There are no Bystanders left to be captured.");
    return;
  }
  const card = bystanderDeck.pop();
  await attachBystanderToMastermindFromVillainDeck(card);
}

// Fight: "KO one of your Heroes." Reuse FightKOHeroYouHave() (parameterized title + empty-pool guard).
async function infernoColossusFight(villainCard) {
  await FightKOHeroYouHave("Inferno Colossus");
}

// Limbo — Inferno Cyclops (DB id 286, Attack 6 / VP 4).  (confidence: LOW)
// Ambush: "Inferno Cyclops captures a Bystander." The bystander attaches to THIS villain card
// (city[index].bystander array) — mirror demogoblinAmbush exactly.
async function infernoCyclopsAmbush(villainCard) {
  onscreenConsole.log(
    `Ambush! <span class="console-highlights">Inferno Cyclops</span> captures a Bystander.`,
  );
  if (bystanderDeck.length === 0) {
    onscreenConsole.log("There are no Bystanders left to be captured.");
    return;
  }
  const card = bystanderDeck.pop();
  const cyclopsIndex = city.findIndex((c) => c === villainCard);
  if (cyclopsIndex === -1) {
    onscreenConsole.log("Inferno Cyclops is not in the city — Bystander not captured.");
    return;
  }
  await attachBystanderToVillain(cyclopsIndex, card);
}

// Escape: "The Mastermind captures all the Bystanders this Villain had. (Players still discard for the
// Bystander being carried away.)" handleVillainEscape() runs FIRST and, by default, pushes a villain's
// attached bystanders to escapedVillainsDeck (lost) and fires the carry-away discard (showDiscardCardPopup,
// 1 card) via handleVillainEscapeActions.handleDiscard — both BEFORE this escapeEffect runs. So this
// effect REDIRECTS those bystanders out of escapedVillainsDeck and onto the Mastermind's .bystanders
// (the card OVERRIDES the default "bystander is lost"); the discard penalty has already been applied by
// the default path, satisfying "players still discard." Main mastermind per the 3e multi-MM deferral.
async function infernoCyclopsEscape(villainCard) {
  const carried = villainCard.bystander || [];
  if (carried.length === 0) {
    onscreenConsole.log(
      `<span class="console-highlights">Inferno Cyclops</span> was carrying no Bystanders.`,
    );
    return;
  }
  const mastermind = getSelectedMastermind();
  if (!mastermind.bystanders) mastermind.bystanders = [];
  carried.forEach((b) => {
    const i = escapedVillainsDeck.indexOf(b); // undo the default "escaped with the villain" push
    if (i !== -1) escapedVillainsDeck.splice(i, 1);
    mastermind.bystanders.push(b);
  });
  villainCard.bystander = []; // transferred to the Mastermind
  updateMastermindOverlay();
  onscreenConsole.log(
    `The Mastermind captures ${carried.length} Bystander${carried.length !== 1 ? "s" : ""} that <span class="console-highlights">Inferno Cyclops</span> was carrying.`,
  );
  updateGameBoard();
}

// Limbo — Inferno Darkchilde (DB id 287, Attack 5 / VP 3).
// Fight: "Reveal the top card of your deck. KO it or Teleport it." Same reveal→choice shape as
// Apocalyptic Blink, but the non-Teleport branch KOs (koPile) instead of drawing (mirrors demogoblinFeast's
// KO-the-deck-top: koPile.push + koBonuses).
async function infernoDarkchildeFight(villainCard) {
  if (playerDeck.length === 0) {
    if (playerDiscardPile.length === 0) {
      onscreenConsole.log("Your deck and discard pile are empty — nothing to reveal.");
      return;
    }
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
    updateGameBoard();
  }
  const revealed = playerDeck[playerDeck.length - 1];
  onscreenConsole.log(
    `<span class="console-highlights">Inferno Darkchilde</span> — revealed <span class="console-highlights">${revealed.name}</span> from the top of your deck. KO it or Teleport it.`,
  );
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Reveal: ${revealed.name}. KO it or Teleport it?`,
      "KO it",
      "Teleport it",
    );
    const title = document.querySelector(".info-or-choice-popup-title");
    if (title) title.textContent = "Inferno Darkchilde";
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      const card = playerDeck.pop();
      koPile.push(card);
      koBonuses();
      updateGameBoard();
      resolve();
    };
    denyButton.onclick = async () => {
      closeInfoChoicePopup();
      const card = playerDeck.pop();
      playerHand.push(card); // teleport() removes it from hand into the next-turn queue
      await teleport(card);
      resolve();
    };
  });
}

// Escape: "Each player Teleports a random card from their hand." Solo: the active player Teleports ONE
// engine-chosen random hand card (returns next turn via the real teleport()). Empty hand → no-op.
async function infernoDarkchildeEscape(villainCard) {
  if (playerHand.length === 0) {
    onscreenConsole.log("Your hand is empty — nothing to Teleport.");
    return;
  }
  const idx = Math.floor(Math.random() * playerHand.length);
  const card = playerHand[idx];
  onscreenConsole.log(
    `<span class="console-highlights">Inferno Darkchilde</span> — you Teleport a random card (<span class="console-highlights">${card.name}</span>) from your hand.`,
  );
  await teleport(card);
}

// Limbo — Inferno Nightcrawler (DB id 288, Attack 4 / VP 2).
// Fight: "Up to two cards in your hand that have a Recruit icon gain Teleport this turn." Player may
// grant Teleport to 0, 1, or 2 eligible hand cards (recruitIcon === true, not already Teleport). Reuse
// the Azazel grant pattern (keywords.push("Teleport"); temporaryTeleport = true) — the engine's
// end-of-turn / on-teleport cleanup strips the temp keyword. Up-to-2 via a loop over the proven
// showCardSelectionPopup() with a "DONE" sentinel tile (no bespoke multi-select needed).
async function infernoNightcrawlerFight(villainCard) {
  let eligible = playerHand.filter(
    (c) => c.recruitIcon === true && !(c.keywords || []).includes("Teleport"),
  );
  if (eligible.length === 0) {
    onscreenConsole.log(
      "No cards with a Recruit icon in your hand to gain Teleport.",
    );
    return;
  }
  let granted = 0;
  while (granted < 2 && eligible.length > 0) {
    const doneTile = { name: "Done", text: "DONE", _doneSentinel: true };
    const choice = await showCardSelectionPopup({
      title: "Inferno Nightcrawler",
      instructions: `Choose a card with a Recruit icon to gain Teleport this turn (${granted}/2 chosen), or choose DONE.`,
      confirmText: "CONFIRM",
      items: [...eligible, doneTile],
    });
    if (!choice || choice._doneSentinel) break;
    if (!choice.keywords) choice.keywords = [];
    choice.keywords.push("Teleport");
    choice.temporaryTeleport = true;
    granted++;
    onscreenConsole.log(
      `<span class="console-highlights">${choice.name}</span> gains Teleport this turn.`,
    );
    eligible = eligible.filter((c) => c !== choice);
  }
  updateGameBoard();
}

// --- SCHEME TWIST EFFECTS ---

// --- MASTERMIND EFFECTS ---

// --- HENCHMEN EFFECTS ---
