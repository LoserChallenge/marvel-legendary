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

// gainVillainAsHero() — SHARED converter for "Fight: Gain this as a Hero" (Manhattan Earth-1610
// villains + Thor Corps henchmen). Generalizes gainScarletWitchAsHero() (expansionRevelations.js):
// runs on the fight COPY during defeat, flips it to its Hero form, and routes it to the discard pile.
// The real card's `gainAsHero` DB flag already skipped the Victory-Pile push (script.js defeat
// handlers), so this is the only place the card lands. Rules (insert p.1): a gained Hero's cost = its
// old Villain Attack value — passed in heroForm.cost. The installed ability fields fire only when the
// card is LATER played as a Hero (engine play-flow), never at gain time.
function gainVillainAsHero(villainCopy, heroForm) {
  if (!villainCopy) return;
  villainCopy.type = "Hero";
  villainCopy.heroName = heroForm.heroName || villainCopy.name;
  villainCopy.team = heroForm.team;
  villainCopy.classes = [...heroForm.classes];
  villainCopy.color = heroForm.color;
  villainCopy.cost = heroForm.cost;
  villainCopy.attack = heroForm.attack || 0;
  villainCopy.recruit = heroForm.recruit || 0;
  villainCopy.attackIcon = !!heroForm.attackIcon;
  villainCopy.recruitIcon = !!heroForm.recruitIcon;
  villainCopy.bonusAttack = heroForm.bonusAttack || 0;
  villainCopy.bonusRecruit = heroForm.bonusRecruit || 0;
  // Flat (non-multiplied) superpower payout — bonusAttack() reads these and takes its simple path.
  villainCopy.multiplier = "None";
  villainCopy.multiplierAttribute = "None";
  villainCopy.multiplierLocation = "None";
  villainCopy.unconditionalAbility = heroForm.unconditionalAbility || "None";
  villainCopy.conditionalAbility = heroForm.conditionalAbility || "None";
  villainCopy.conditionType = heroForm.conditionType || "None";
  villainCopy.condition = heroForm.condition || "None";
  villainCopy.invulnerability = "None";
  villainCopy.keywords = heroForm.keywords ? [...heroForm.keywords] : [];
  // Strip villain residue so the gained Hero carries no fight/escape/ambush behavior or attack overlay.
  villainCopy.fightEffect = "";
  villainCopy.escapeEffect = "None";
  villainCopy.ambushEffect = "None";
  villainCopy.gainAsHero = false;
  villainCopy.attackFromScheme = 0;
  villainCopy.overlayTextAttack = "";
  playerDiscardPile.push(villainCopy);
  onscreenConsole.log(
    `You defeated <span class="console-highlights">${villainCopy.name}</span> and gained it as a Hero — added to your discard pile.`,
  );
  updateGameBoard();
}

// --- HERO CARD ABILITIES ---

// Manhattan — Ultimate Wasp hero form: "[COVERT]: You get +2 Attack." Superpower (conditionType
// "playedCards", condition "Covert"). Mirrors the base ThorBonusAttack pattern: log + bonusAttack(),
// which adds card.bonusAttack (=2) to both attack totals.
function ultimateWaspBonusAttack(card) {
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Covert.svg" alt="Covert Icon" class="console-card-icons"> Hero played. Superpower Ability activated.`,
  );
  onscreenConsole.log(
    `+2<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  bonusAttack();
}

// ============================================================================
// PHASE 3b — HERO CARD ABILITIES
// ============================================================================
//
// Build map: docs/expansion-progress/secret-wars-vol1-3b-heroes-reusemap.md
// Frozen specs: docs/expansion-specs/secret-wars-vol1.md (lines 105-513)
// Engine dispatch (script.js:11363-11481): the engine adds base card.attack/recruit and gates
// conditionalAbility superpowers via isConditionMet() BEFORE calling fn(card). It does NOT
// auto-apply card.bonusAttack — flat/computed grants are applied directly to BOTH totals here.

// Shared: real (non-copied / non-simulated) cards played this turn EXCLUDING `self` — backs every
// "for each OTHER card you played this turn" count. Excludes the playing card by object identity
// (the engine pushes it to cardsPlayedThisTurn before firing its ability) and strips copy/simulation
// residue so it can't inflate counts.
function otherRealCardsPlayedThisTurn(self) {
  return cardsPlayedThisTurn.filter(
    (c) =>
      c !== self &&
      !c.isCopied &&
      !c.sidekickToDestroy &&
      !c.markedToDestroy &&
      !c.markedForDeletion &&
      !c.isSimulation,
  );
}

// --- Family 1: count cardsPlayedThisTurn / HQ by predicate → grant (IronManArcReactor pattern) ---

// Apocalyptic Kitty Pryde — Disrupt Circuits (Uncommon, special).
// "You get +1 Attack for each [TECH] Hero in the HQ." Counts dual-class Tech cards; empty HQ slots
// guarded. Source is the HQ (`hq`), NOT cards played this turn.
function apocalypticKittyPrydeDisruptCircuits() {
  const techInHQ = hq.filter(
    (c) => c && c.classes && c.classes.includes("Tech"),
  ).length;
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> Heroes in the HQ: ${techInHQ}. +${techInHQ}<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += techInHQ;
  cumulativeAttackPoints += techInHQ;
  updateGameBoard();
}

// Black Panther — Multifaceted Genius (Common B, special).
// "You get +1 Attack for each other multicolored card you played this turn." Multicolored = dual-class
// (classes.length >= 2). Excludes self (Multifaceted Genius is itself dual-class).
function blackPantherMultifacetedGenius(card) {
  const count = otherRealCardsPlayedThisTurn(card).filter(
    (c) => c.classes && c.classes.length >= 2,
  ).length;
  onscreenConsole.log(
    `Other multicolored cards played this turn: ${count}. +${count}<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += count;
  cumulativeAttackPoints += count;
  updateGameBoard();
}

// Captain Marvel — Absorb Energies (Common A, [RANGE] superpower).
// "For each other [RANGED] Hero you have played this turn, you get +1 Recruit." DB class string is
// "Range". Excludes self. (Engine already confirmed a Range Hero this turn before calling.)
function captainMarvelAbsorbEnergies(card) {
  const count = otherRealCardsPlayedThisTurn(card).filter(
    (c) => c.classes && c.classes.includes("Range"),
  ).length;
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Range.svg" alt="Range Icon" class="console-card-icons"> Hero played. Superpower Ability activated.`,
  );
  onscreenConsole.log(
    `Other Range Heroes played this turn: ${count}. +${count}<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> gained.`,
  );
  totalRecruitPoints += count;
  cumulativeRecruitPoints += count;
  updateGameBoard();
}

// Captain Marvel — Marvelous Strength (Uncommon, [STRENGTH] superpower). Twin of Absorb Energies,
// Attack instead of Recruit. "For each other [STRENGTH] Hero you have played this turn, +1 Attack."
function captainMarvelMarvelousStrength(card) {
  const count = otherRealCardsPlayedThisTurn(card).filter(
    (c) => c.classes && c.classes.includes("Strength"),
  ).length;
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Strength.svg" alt="Strength Icon" class="console-card-icons"> Hero played. Superpower Ability activated.`,
  );
  onscreenConsole.log(
    `Other Strength Heroes played this turn: ${count}. +${count}<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += count;
  cumulativeAttackPoints += count;
  updateGameBoard();
}

// Proxima Midnight — Master Combatant (Common B, special).
// "If the most recent Hero you have played this turn has a Recruit icon, +2 Recruit. If it has an
// Attack icon, +2 Attack." Looks at the most recent OTHER Hero (the one before this card). A card with
// both icons grants both. No prior Hero → nothing.
function proximaMidnightMasterCombatant(card) {
  const priorHeroes = otherRealCardsPlayedThisTurn(card).filter(
    (c) => c.type === "Hero",
  );
  const recent = priorHeroes[priorHeroes.length - 1];
  if (!recent) {
    onscreenConsole.log(
      `No prior Hero played this turn — <span class="console-highlights">Master Combatant</span> grants nothing.`,
    );
    return;
  }
  if (recent.recruitIcon) {
    onscreenConsole.log(
      `<span class="console-highlights">${recent.name}</span> has a Recruit icon. +2<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> gained.`,
    );
    totalRecruitPoints += 2;
    cumulativeRecruitPoints += 2;
  }
  if (recent.attackIcon) {
    onscreenConsole.log(
      `<span class="console-highlights">${recent.name}</span> has an Attack icon. +2<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
    );
    totalAttackPoints += 2;
    cumulativeAttackPoints += 2;
  }
  updateGameBoard();
}

// Ultimate Spider-Man — Hero from Another Dimension (Rare, special).
// "You get +2 Attack for each other card you have played this turn that costs 1 or 2." Excludes self.
function ultimateSpiderManHeroFromAnotherDimension(card) {
  const count = otherRealCardsPlayedThisTurn(card).filter(
    (c) => c.cost === 1 || c.cost === 2,
  ).length;
  const bonus = count * 2;
  onscreenConsole.log(
    `Other cost-1/2 cards played this turn: ${count}. +${bonus}<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += bonus;
  cumulativeAttackPoints += bonus;
  updateGameBoard();
}

// --- Trivial special abilities: draw a card ---

function blackPantherCatlikeReflexes() {
  onscreenConsole.log(`<span class="console-highlights">Catlike Reflexes</span> — draw a card.`);
  drawCard();
}

function captainMarvelSupersonicFlight() {
  onscreenConsole.log(`<span class="console-highlights">Supersonic Flight</span> — draw a card.`);
  drawCard();
}

function superiorIronManOptimizedTechnology() {
  onscreenConsole.log(`<span class="console-highlights">Optimized Technology</span> — draw a card.`);
  drawCard();
}

// --- Trivial flat icon-gated superpowers (condition already met by the engine) ---

// Captain Marvel — Cosmic Energies (Rare): [RANGE][RANGE][STRENGTH][STRENGTH] → +6 Attack.
function captainMarvelCosmicEnergies() {
  onscreenConsole.log(
    `Superpower Ability activated. +6<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += 6;
  cumulativeAttackPoints += 6;
  updateGameBoard();
}

// Lady Thor — Heir to the Hammer (Uncommon): [RANGE][STRENGTH] → +2 Attack.
function ladyThorHeirToTheHammer() {
  onscreenConsole.log(
    `Superpower Ability activated. +2<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += 2;
  cumulativeAttackPoints += 2;
  updateGameBoard();
}

// Proxima Midnight — General of the Black Order (Uncommon): [INSTINCT] → +3 Recruit.
function proximaMidnightGeneralOfTheBlackOrder() {
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Instinct.svg" alt="Instinct Icon" class="console-card-icons"> Hero played. Superpower Ability activated. +3<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> gained.`,
  );
  totalRecruitPoints += 3;
  cumulativeRecruitPoints += 3;
  updateGameBoard();
}

// Proxima Midnight — Supernova Spear (Rare): [COVERT] → +4 Recruit and +4 Attack.
function proximaMidnightSupernovaSpear() {
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Covert.svg" alt="Covert Icon" class="console-card-icons"> Hero played. Superpower Ability activated. +4<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> and +4<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalRecruitPoints += 4;
  cumulativeRecruitPoints += 4;
  totalAttackPoints += 4;
  cumulativeAttackPoints += 4;
  updateGameBoard();
}

// Superior Iron Man — Armor Upgrades (Common A): [TECH] → +2 Attack.
function superiorIronManArmorUpgrades() {
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> Hero played. Superpower Ability activated. +2<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += 2;
  cumulativeAttackPoints += 2;
  updateGameBoard();
}

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

// Manhattan (Earth-1610) — all four: "Fight: Gain this as a Hero." The DB entries carry gainAsHero:true
// (skips the Victory-Pile push, script.js defeat handlers) and a fightEffect that calls the shared
// gainVillainAsHero() converter with the card's Hero form (inventory Section 1 hero-stats table).
// Hero cost = old Villain Attack value (insert p.1). These have no VP (gained as Heroes, not scored).

// Ultimate Captain America (DB id 289, Villain Attack 6) → Avengers / Strength / 0+ Attack,
// "You get +1 Attack for each color of Hero you have" (unconditional, fires on later play).
// RULING (Finding G, rules-notes BATCH 3): this is a reskin of Core "Captain America – Perfect
// Teamwork" — identical effect. REUSE the shipped counter CaptainAmericaCountUniqueColorsAndAddAttack
// (cardAbilities.js), which counts DISTINCT Hero colors across HAND + Artifacts + play this turn
// (includes this card), updating both Attack totals. (Only 5 colors exist, so the +5 cap is implicit.)
async function ultimateCaptainAmericaFight(villainCopy) {
  gainVillainAsHero(villainCopy, {
    team: "Avengers",
    classes: ["Strength"],
    color: "Green",
    cost: 6,
    attack: 0,
    attackIcon: true,
    unconditionalAbility: "CaptainAmericaCountUniqueColorsAndAddAttack",
  });
}

// Ultimate Captain Marvel (DB id 290, Villain Attack 4) → Avengers / Range / 2 Recruit, Teleport keyword.
async function ultimateCaptainMarvelFight(villainCopy) {
  gainVillainAsHero(villainCopy, {
    team: "Avengers",
    classes: ["Range"],
    color: "Blue",
    cost: 4,
    recruit: 2,
    recruitIcon: true,
    keywords: ["Teleport"],
  });
}

// Ultimate Thor (DB id 291, Villain Attack 7) → Avengers / Range / 3+ Attack, "[RANGED]: You get +3
// Attack" (superpower → reuse base ThorBonusAttack + bonusAttack:3, condition Range).
async function ultimateThorFight(villainCopy) {
  gainVillainAsHero(villainCopy, {
    team: "Avengers",
    classes: ["Range"],
    color: "Blue",
    cost: 7,
    attack: 3,
    attackIcon: true,
    bonusAttack: 3,
    conditionalAbility: "ThorBonusAttack",
    conditionType: "playedCards",
    condition: "Range",
  });
}

// Ultimate Thor Escape: "Cross-Dimensional Thor Rampage." SHARED helper — reveal a "Thor"-family card
// (name contains "Thor") in hand / played / Victory Pile, or gain a Wound. Independent of the Fight
// converter (an escaping Thor is never gained as a Hero).
async function ultimateThorEscape(villainCard) {
  await crossDimensionalRampage(["Thor"], "Ultimate Thor");
}

// Ultimate Wasp (DB id 292, Villain Attack 5) → Avengers / Covert / 2+ Attack, "[COVERT]: You get +2
// Attack" (superpower → ultimateWaspBonusAttack + bonusAttack:2, condition Covert).
async function ultimateWaspFight(villainCopy) {
  gainVillainAsHero(villainCopy, {
    team: "Avengers",
    classes: ["Covert"],
    color: "Red",
    cost: 5,
    attack: 2,
    attackIcon: true,
    bonusAttack: 2,
    conditionalAbility: "ultimateWaspBonusAttack",
    conditionType: "playedCards",
    condition: "Covert",
  });
}

// Sentinel Territories (Earth-1610) — "alters/changes the future" delayed effects. Each schedules a
// bonus/penalty for the active player's OWN next turn (solo: "the next player" = you). Deferred via the
// engine flags declared in script.js, consumed at their turn-start sites (Colossus → drawVillainCard;
// Kate Pryde recruit + Rachel attack-delta promote → endTurn tail). Rules-notes SPEC-Q2 (Colossus).

// Colossus of Future Past (DB id 293, Attack 5 / VP 3).
// Fight: "Colossus changes the future: Don't play a Villain card at the beginning of next turn."
// = skip ONE villain card next turn (Golden 2→1, What If? 1→0). Stacks if fought twice (rules-notes
// SPEC-Q2). Sets the deferred skip counter; drawVillainCard() consumes + clears it next turn.
async function colossusOfFuturePastFight(villainCard) {
  sentinelSkipVillainNextTurn += 1;
  onscreenConsole.log(
    `<span class="console-highlights">Colossus of Future Past</span> changes the future — one fewer Villain card will be played at the start of your next turn.`,
  );
}

// Kate Pryde of Future Past (DB id 294, Attack 4 / VP 2).
// Fight: "You get +1 Recruit. Then, Kate Pryde alters the future: At the beginning of the next
// player's turn, that player gets +1 Recruit." Solo: +1 Recruit now + +1 Recruit at the start of your
// own next turn. Twin rule: both grants update totalRecruitPoints AND cumulativeRecruitPoints (the
// deferred one pays out in endTurn).
async function katePrydeOfFuturePastFight(villainCard) {
  totalRecruitPoints += 1;
  cumulativeRecruitPoints += 1;
  sentinelRecruitNextTurn += 1; // paid out at the start of next turn (endTurn consumer)
  onscreenConsole.log(
    `<span class="console-highlights">Kate Pryde of Future Past</span> — you get +1<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> now, and +1<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> at the start of your next turn.`,
  );
  updateGameBoard();
}

// Rachel Summers of Future Past (DB id 295, Attack 6 / VP 4).
// Fight: "Rachel Summers alters the future: During the next player's turn, all Villains and the
// Mastermind get -1 Attack." Solo: schedule -1 to all villains + Mastermind during your next turn
// (deferred delta promoted to active in endTurn). Escape: this turn, +1 to all villains + Mastermind.
async function rachelSummersOfFuturePastFight(villainCard) {
  sentinelVillainAttackDeltaNextTurn -= 1;
  onscreenConsole.log(
    `<span class="console-highlights">Rachel Summers of Future Past</span> alters the future — all Villains and the Mastermind get -1<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> during your next turn.`,
  );
}

// Escape: "This turn, all Villains and the Mastermind get +1 Attack." Applies immediately (active
// delta) for the turn the player is about to take; expires at the next endTurn promote.
async function rachelSummersOfFuturePastEscape(villainCard) {
  sentinelVillainAttackDelta += 1;
  onscreenConsole.log(
    `<span class="console-highlights">Rachel Summers of Future Past</span> escapes — all Villains and the Mastermind get +1<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> this turn.`,
  );
  updateGameBoard();
}

// Wolverine of Future Past (DB id 296, Attack 7 / VP 5).
// Fight: "Wolverine alters the future: At the start of the next player's turn, you draw a card, and
// that player draws a card." Solo: "you" and "that player" are the same active player → draw 2 cards
// at the start of next turn. Reuse the engine's nextTurnsDraw mechanic (consumed in endTurn).
async function wolverineOfFuturePastFight(villainCard) {
  nextTurnsDraw += 2;
  onscreenConsole.log(
    `<span class="console-highlights">Wolverine of Future Past</span> alters the future — you draw 2 extra cards at the start of your next turn.`,
  );
}

// Escape: "Cross-Dimensional Wolverine Rampage." SHARED helper — reveal a Wolverine-family card
// (name contains "Wolverine", "Weapon X", or "Old Man Logan") or gain a Wound.
async function wolverineOfFuturePastEscape(villainCard) {
  await crossDimensionalRampage(
    ["Wolverine", "Weapon X", "Old Man Logan"],
    "Wolverine of Future Past",
  );
}

// --- SCHEME TWIST EFFECTS ---

// --- MASTERMIND EFFECTS ---

// --- HENCHMEN EFFECTS ---
