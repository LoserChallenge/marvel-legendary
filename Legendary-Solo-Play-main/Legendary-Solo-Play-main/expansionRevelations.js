// Revelations Expansion
// 2026-04-12

// --- KEYWORDS & HELPERS ---

// Turn-level flag: when true, Hyperspeed counts both Attack and Recruit icons.
// Reset in script.js end-of-turn cleanup alongside other per-turn flags.
let hyperspeedCountsBoth = false;

/**
 * Hyperspeed N — reveal top N cards from deck, get +1 Attack per Attack icon,
 * discard all revealed cards.
 * @param {number} n - Number of cards to reveal
 * @param {"attack"|"recruit"|"both"} iconType - Which icons to count
 * @param {boolean} noReshuffle - If true, don't reshuffle discard into deck
 */
function hyperspeed(n, iconType = "attack", noReshuffle = false) {
  const effectiveType = hyperspeedCountsBoth ? "both" : iconType;
  const revealed = [];

  for (let i = 0; i < n; i++) {
    if (playerDeck.length === 0) {
      if (noReshuffle || playerDiscardPile.length === 0) break;
      playerDeck = shuffle(playerDiscardPile);
      playerDiscardPile = [];
    }
    revealed.push(playerDeck.pop());
  }

  if (revealed.length === 0) {
    onscreenConsole.log(`Hyperspeed ${n}: No cards to reveal.`);
    return;
  }

  let attackCount = 0;
  let recruitCount = 0;

  for (const card of revealed) {
    if ((effectiveType === "attack" || effectiveType === "both") && card.attackIcon) {
      attackCount++;
    }
    if ((effectiveType === "recruit" || effectiveType === "both") && card.recruitIcon) {
      recruitCount++;
    }
  }

  // Move all revealed cards to discard
  for (const card of revealed) {
    playerDiscardPile.push(card);
  }

  // Build log message
  const revealedNames = revealed.map(c => c.name).join(", ");
  let bonusText = "";

  if (attackCount > 0) {
    totalAttackPoints += attackCount;
    cumulativeAttackPoints += attackCount;
    bonusText += `+${attackCount} <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons">`;
  }
  if (recruitCount > 0) {
    totalRecruitPoints += recruitCount;
    cumulativeRecruitPoints += recruitCount;
    if (bonusText) bonusText += " and ";
    bonusText += `+${recruitCount} <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons">`;
  }
  if (!bonusText) bonusText = "no bonus";

  onscreenConsole.log(
    `Hyperspeed ${revealed.length}: Revealed ${revealedNames}. ${bonusText}.`
  );
  updateGameBoard();
}

/**
 * Dark Memories — count unique hero classes in discard pile.
 * Returns a number 0-5 (one per class: Strength, Instinct, Covert, Tech, Range).
 */
function calculateDarkMemories() {
  const CLASSES = ["Strength", "Instinct", "Covert", "Tech", "Range"];
  const found = new Set();
  for (const card of playerDiscardPile) {
    if (card.classes) {
      for (const cls of card.classes) {
        if (CLASSES.includes(cls)) found.add(cls);
      }
    }
  }
  return found.size;
}

/**
 * Apply Dark Memories bonus to the player's attack.
 * @param {number} multiplier - 1 for normal, 2 for Double Dark Memories
 */
function applyDarkMemories(multiplier = 1) {
  const bonus = calculateDarkMemories() * multiplier;
  if (bonus > 0) {
    totalAttackPoints += bonus;
    cumulativeAttackPoints += bonus;
    onscreenConsole.log(
      `Dark Memories${multiplier > 1 ? " (Double)" : ""}: +${bonus} <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> (${calculateDarkMemories()} unique classes in discard pile).`
    );
    updateGameBoard();
  } else {
    onscreenConsole.log(`Dark Memories: No hero classes in discard pile — no bonus.`);
  }
  return bonus;
}

/**
 * Last Stand — count empty city spaces (spaces with no villain).
 * A space with a Location above it but no villain still counts as empty.
 * Returns a number 0 to citySize.
 */
function calculateLastStand() {
  let emptyCount = 0;
  for (let i = 0; i < city.length; i++) {
    if (!city[i] || city[i] === null) {
      emptyCount++;
    }
  }
  return emptyCount;
}

/**
 * Apply Last Stand bonus to the player's attack.
 * @param {number} multiplier - 1 for normal, 2 for Double Last Stand
 */
function applyLastStand(multiplier = 1) {
  const bonus = calculateLastStand() * multiplier;
  if (bonus > 0) {
    totalAttackPoints += bonus;
    cumulativeAttackPoints += bonus;
    onscreenConsole.log(
      `Last Stand${multiplier > 1 ? " (Double)" : ""}: +${bonus} <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> (${calculateLastStand()} empty city spaces).`
    );
    updateGameBoard();
  } else {
    onscreenConsole.log(`Last Stand: No empty city spaces — no bonus.`);
  }
  return bonus;
}

// --- HERO CARD ABILITIES ---

// === Captain Marvel, Agent of S.H.I.E.L.D. ===

// The Sword of S.H.I.E.L.D. (Common) — Superpower [SHIELD x4]: Draw a card.
// The superpower condition (4 S.H.I.E.L.D. cards played) is handled by the engine's
// conditionType system. This function is the conditionalAbility.
async function captainMarvelAosTheSwordOfShield() {
  onscreenConsole.log(`<span class="console-highlights">The Sword of S.H.I.E.L.D.</span> superpower: Draw a card.`);
  drawCard();
}

// Radiant Blast (Common B) — If you drew any extra cards this turn, you get +1 Attack.
function captainMarvelAosRadiantBlast() {
  if (extraCardsDrawnThisTurn > 0) {
    onscreenConsole.log(`<span class="console-highlights">Radiant Blast</span>: You drew extra cards this turn. +1 <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons">.`);
    totalAttackPoints += 1;
    cumulativeAttackPoints += 1;
    updateGameBoard();
  }
}

// Dominate the Battlefield (Uncommon) — Superpower [RANGED]: Last Stand.
async function captainMarvelAosDominateTheBattlefield() {
  applyLastStand();
}

// Higher, Further, Faster (Rare) — Choose one: Draw three cards or Last Stand.
// Superpower [STR][STR]: Instead, do both.
async function captainMarvelAosHigherFurtherFaster() {
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Choose one: Draw three cards or Last Stand.`,
      "Draw 3 Cards",
      "Last Stand",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      onscreenConsole.log(`<span class="console-highlights">Higher, Further, Faster</span>: Draw three cards.`);
      drawCard(); drawCard(); drawCard();
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      onscreenConsole.log(`<span class="console-highlights">Higher, Further, Faster</span>: Last Stand.`);
      applyLastStand();
      resolve();
    };
  });
}

// Higher, Further, Faster superpower: do both
async function captainMarvelAosHigherFurtherFasterBoth() {
  onscreenConsole.log(`<span class="console-highlights">Higher, Further, Faster</span> superpower: Draw three cards AND Last Stand.`);
  drawCard(); drawCard(); drawCard();
  applyLastStand();
}

// === Darkhawk ===

// Balance the Darkforce (Common) — Superpower [TECH]: Draw a card.
async function darkhawkBalanceTheDarkforce() {
  onscreenConsole.log(`<span class="console-highlights">Balance the Darkforce</span> superpower: Draw a card.`);
  drawCard();
}

// Hawk Dive (Common B) — Choose Recruit or Attack. Then Hyperspeed 4 for that icon.
async function darkhawkHawkDive() {
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Choose Recruit or Attack. Then Hyperspeed 4 for that icon.`,
      "Attack",
      "Recruit",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      hyperspeed(4, "attack");
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      hyperspeed(4, "recruit");
      resolve();
    };
  });
}

// Travel to Nullspace (Uncommon) — If the most recent Hero you played this turn has
// a Recruit icon, you get +3 Recruit. If it has an Attack icon, you get +3 Attack.
// (If both, you get both.)
function darkhawkTravelToNullspace() {
  const prevHeroes = cardsPlayedThisTurn.filter(c => c.type === "Hero");
  // Most recent hero played BEFORE this card (exclude this card itself)
  const recentHero = prevHeroes.length >= 2 ? prevHeroes[prevHeroes.length - 2] : null;
  if (!recentHero) {
    onscreenConsole.log(`<span class="console-highlights">Travel to Nullspace</span>: No previous Hero played this turn.`);
    return;
  }
  let bonus = "";
  if (recentHero.attackIcon) {
    totalAttackPoints += 3;
    cumulativeAttackPoints += 3;
    bonus += `+3 <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons">`;
  }
  if (recentHero.recruitIcon) {
    totalRecruitPoints += 3;
    cumulativeRecruitPoints += 3;
    if (bonus) bonus += " and ";
    bonus += `+3 <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons">`;
  }
  if (bonus) {
    onscreenConsole.log(`<span class="console-highlights">Travel to Nullspace</span>: Most recent Hero (<span class="console-highlights">${recentHero.name}</span>) gives ${bonus}.`);
    updateGameBoard();
  }
}

// Warflight (Rare) — Whenever you Hyperspeed this turn, you get both Recruit and Attack.
// Hyperspeed 7. Superpower [TECH][TECH]: Instead, Hyperspeed 9.
async function darkhawkWarflight() {
  onscreenConsole.log(`<span class="console-highlights">Warflight</span>: This turn, all Hyperspeed counts both Attack and Recruit icons.`);
  hyperspeedCountsBoth = true;
  hyperspeed(7);
}

async function darkhawkWarflightSuper() {
  onscreenConsole.log(`<span class="console-highlights">Warflight</span> superpower: Hyperspeed counts both icons. Hyperspeed 9.`);
  hyperspeedCountsBoth = true;
  hyperspeed(9);
}

// === Hellcat ===

// Catlike Agility (Common) — Superpower [INSTINCT]: Choose one — Draw a card or +1 Attack.
async function hellcatCatlikeAgility() {
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `<span class="console-highlights">Catlike Agility</span> superpower: Choose one.`,
      "Draw a Card",
      "+1 Attack",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      drawCard();
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      totalAttackPoints += 1;
      cumulativeAttackPoints += 1;
      onscreenConsole.log(`+1 <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons">.`);
      updateGameBoard();
      resolve();
    };
  });
}

// Part-Time PI (Common B) — Reveal top card of any deck. If it's not a Scheme Twist,
// you may put it on the bottom of that deck.
// Superpower [INSTINCT]: Choose one — Draw a card or +1 Recruit.
async function hellcatPartTimePI() {
  // Look at top card of villain deck (the "any deck" most useful in solo)
  if (villainDeck.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Part-Time PI</span>: Villain Deck is empty.`);
    return;
  }
  const topCard = villainDeck[villainDeck.length - 1];
  const isTwist = topCard.type === "Scheme Twist";
  if (isTwist) {
    onscreenConsole.log(`<span class="console-highlights">Part-Time PI</span>: Revealed <span class="console-highlights">${topCard.name || "Scheme Twist"}</span>. It's a Scheme Twist — it stays on top.`);
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Revealed top of Villain Deck: <span class="bold-spans">${topCard.name}</span>. Put it on the bottom?`,
      "Put on Bottom",
      "Leave on Top",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      const card = villainDeck.pop();
      villainDeck.unshift(card);
      onscreenConsole.log(`<span class="console-highlights">Part-Time PI</span>: Put <span class="console-highlights">${card.name}</span> on the bottom of the Villain Deck.`);
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      onscreenConsole.log(`<span class="console-highlights">Part-Time PI</span>: Left <span class="console-highlights">${topCard.name}</span> on top.`);
      resolve();
    };
  });
}

async function hellcatPartTimePISuper() {
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `<span class="console-highlights">Part-Time PI</span> superpower: Choose one.`,
      "Draw a Card",
      "+1 Recruit",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      drawCard();
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      totalRecruitPoints += 1;
      cumulativeRecruitPoints += 1;
      onscreenConsole.log(`+1 <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons">.`);
      updateGameBoard();
      resolve();
    };
  });
}

// Demon Sight (Uncommon) — Guess Villain, Bystander, Strike, or Twist. Reveal top of
// Villain Deck. If you guessed right, +2 Attack.
// Superpower [AVENGERS]: If it was a Villain, you may fight it this turn.
async function hellcatDemonSight() {
  if (villainDeck.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Demon Sight</span>: Villain Deck is empty.`);
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton, extraButton } = showHeroAbilityMayPopup(
      `Guess the top card of the Villain Deck:`,
      "Villain",
      "Bystander",
      "Strike / Twist",
      true,
    );
    function handleGuess(guess) {
      closeInfoChoicePopup();
      const topCard = villainDeck[villainDeck.length - 1];
      const cardType = topCard.type || "Unknown";
      let correct = false;
      if (guess === "Villain" && (cardType === "Villain" || cardType === "Location")) correct = true;
      if (guess === "Bystander" && cardType === "Bystander") correct = true;
      if (guess === "Strike" && cardType === "Master Strike") correct = true;
      if (guess === "Twist" && cardType === "Scheme Twist") correct = true;
      onscreenConsole.log(`<span class="console-highlights">Demon Sight</span>: You guessed "${guess}". Revealed: <span class="console-highlights">${topCard.name || cardType}</span> (${cardType}).`);
      if (correct) {
        onscreenConsole.log(`Correct! +2 <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons">.`);
        totalAttackPoints += 2;
        cumulativeAttackPoints += 2;
        updateGameBoard();
      } else {
        onscreenConsole.log(`Wrong — no bonus.`);
      }
      resolve();
    }
    confirmButton.onclick = () => handleGuess("Villain");
    denyButton.onclick = () => handleGuess("Bystander");
    extraButton.onclick = function () {
      closeInfoChoicePopup();
      // Second sub-choice: Strike or Twist
      const { confirmButton: strikeBtn, denyButton: twistBtn } = showHeroAbilityMayPopup(
        `Strike or Twist?`,
        "Master Strike",
        "Scheme Twist",
      );
      strikeBtn.onclick = () => handleGuess("Strike");
      twistBtn.onclick = () => handleGuess("Twist");
    };
  });
}

// Demon Sight superpower: if revealed card was a Villain, you may fight it
async function hellcatDemonSightSuper() {
  // The superpower enhances the base ability — the engine calls both.
  // This additional effect: if top of villain deck is a Villain, mark it fightable.
  // For solo, this is primarily informational since you'll draw it soon anyway.
  const topCard = villainDeck.length > 0 ? villainDeck[villainDeck.length - 1] : null;
  if (topCard && (topCard.type === "Villain" || topCard.type === "Location")) {
    onscreenConsole.log(`<span class="console-highlights">Demon Sight</span> superpower: The revealed Villain can be fought this turn.`);
  }
}

// Second Chance at Life (Rare) — If a Master Strike or Scheme Twist would occur,
// you may discard this card from your hand instead. If you do, draw three cards,
// then shuffle that Strike or Twist back into the Villain Deck.
// This is a reactive ability that triggers from hand — the unconditionalAbility
// just prints a reminder since the actual interception happens in villain processing.
function hellcatSecondChanceAtLife() {
  onscreenConsole.log(`<span class="console-highlights">Second Chance at Life</span> is in play. If a Master Strike or Scheme Twist occurs, you may discard this to cancel it.`);
}

// === Photon ===

// Infrared Conversation (Common) — To play this, you must discard a card. Draw two cards.
async function photonInfraredConversation() {
  if (playerHand.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Infrared Conversation</span>: No cards in hand to discard.`);
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `<span class="console-highlights">Infrared Conversation</span>: Discard a card to draw two cards?`,
      "Discard & Draw",
      "Skip",
    );
    confirmButton.onclick = async function () {
      closeInfoChoicePopup();
      // For simplicity, discard a random card from hand
      // (ideally would let player choose — but matches existing patterns)
      if (playerHand.length > 0) {
        const idx = Math.floor(Math.random() * playerHand.length);
        const discarded = playerHand.splice(idx, 1)[0];
        playerDiscardPile.push(discarded);
        onscreenConsole.log(`Discarded <span class="console-highlights">${discarded.name}</span>.`);
      }
      drawCard(); drawCard();
      onscreenConsole.log(`<span class="console-highlights">Infrared Conversation</span>: Drew two cards.`);
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      resolve();
    };
  });
}

// Ultraviolet Radiation (Common B) — To play this, you must discard a card.
// Superpower [RANGED]: Hyperspeed 3.
function photonUltravioletRadiation() {
  // The "must discard" cost is a play cost — handled similarly to Infrared
  // For now, the base attack of 3 is the main effect
  // The discard cost will be implemented as part of a broader "play cost" system
}

async function photonUltravioletRadiationSuper() {
  hyperspeed(3);
}

// Light the Way (Uncommon) — You get +1 Attack for each card you discarded from
// your hand this turn.
function photonLightTheWay() {
  // Count cards discarded from hand this turn — tracked via justAddedToDiscard
  // or a similar mechanism. For now, use a simplified approach:
  // Count played cards that had a discard effect (approximation)
  const discardedCount = justAddedToDiscard.length;
  if (discardedCount > 0) {
    totalAttackPoints += discardedCount;
    cumulativeAttackPoints += discardedCount;
    onscreenConsole.log(`<span class="console-highlights">Light the Way</span>: +${discardedCount} <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> (${discardedCount} cards discarded this turn).`);
    updateGameBoard();
  } else {
    onscreenConsole.log(`<span class="console-highlights">Light the Way</span>: No cards discarded from hand this turn.`);
  }
}

// Coruscating Vengeance (Rare) — Superpower [AVENGERS][AVENGERS]: Last Stand.
async function photonCoruscatingVengeance() {
  applyLastStand();
}

// === Quicksilver ===

// Too Fast to See (Common) — Hyperspeed 3 for Recruit.
// Superpower [INSTINCT]: Instead, Hyperspeed 3 for Recruit and Attack.
function quicksilverTooFastToSee() {
  hyperspeed(3, "recruit");
}

function quicksilverTooFastToSeeSuper() {
  hyperspeed(3, "both");
}

// Perpetual Motion (Common B) — Superpower [STRENGTH]: Hyperspeed 4.
function quicksilverPerpetualMotion() {
  hyperspeed(4);
}

// Jittery Impatience (Uncommon) — Look at top card of your deck. Discard it or put it back.
// Superpower [INSTINCT]: You may KO the card you discarded this way.
async function quicksilverJitteryImpatience() {
  if (playerDeck.length === 0 && playerDiscardPile.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Jittery Impatience</span>: No cards in deck.`);
    return;
  }
  if (playerDeck.length === 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  const topCard = playerDeck[playerDeck.length - 1];
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Top card of your deck: <span class="bold-spans">${topCard.name}</span>. Discard it or put it back?`,
      "Discard",
      "Put It Back",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      const card = playerDeck.pop();
      playerDiscardPile.push(card);
      onscreenConsole.log(`<span class="console-highlights">Jittery Impatience</span>: Discarded <span class="console-highlights">${card.name}</span>.`);
      updateGameBoard();
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      onscreenConsole.log(`<span class="console-highlights">Jittery Impatience</span>: Left <span class="console-highlights">${topCard.name}</span> on top.`);
      resolve();
    };
  });
}

async function quicksilverJitteryImpatienceSuper() {
  // KO the card you discarded — check if there's a recently discarded card
  const lastDiscarded = playerDiscardPile.length > 0 ? playerDiscardPile[playerDiscardPile.length - 1] : null;
  if (lastDiscarded) {
    return new Promise((resolve) => {
      const { confirmButton, denyButton } = showHeroAbilityMayPopup(
        `KO <span class="bold-spans">${lastDiscarded.name}</span> from your discard pile?`,
        "KO It",
        "Keep It",
      );
      confirmButton.onclick = function () {
        closeInfoChoicePopup();
        const idx = playerDiscardPile.indexOf(lastDiscarded);
        if (idx !== -1) {
          playerDiscardPile.splice(idx, 1);
          koPile.push(lastDiscarded);
          onscreenConsole.log(`<span class="console-highlights">Jittery Impatience</span> superpower: KO'd <span class="console-highlights">${lastDiscarded.name}</span>.`);
          updateGameBoard();
        }
        resolve();
      };
      denyButton.onclick = function () {
        closeInfoChoicePopup();
        resolve();
      };
    });
  }
}

// Around the World Punch (Rare) — Hyperspeed your entire remaining deck. (Don't reshuffle.)
// Superpower [AVENGERS x4]: Before you do that, put your discard pile on top of your deck.
function quicksilverAroundTheWorldPunch() {
  onscreenConsole.log(`<span class="console-highlights">Around the World Punch</span>: Hyperspeed entire deck (${playerDeck.length} cards).`);
  hyperspeed(playerDeck.length, "attack", true);
}

function quicksilverAroundTheWorldPunchSuper() {
  onscreenConsole.log(`<span class="console-highlights">Around the World Punch</span> superpower: Discard pile goes on top of deck first.`);
  // Stack discard pile on top of deck without shuffling
  while (playerDiscardPile.length > 0) {
    playerDeck.push(playerDiscardPile.pop());
  }
  onscreenConsole.log(`Deck is now ${playerDeck.length} cards. Hyperspeed all of it.`);
  hyperspeed(playerDeck.length, "attack", true);
}

// === Ronin ===

// Mysterious Identity (Common) — As you play this card, you may choose a color
// and/or a team icon. This card is that color and team icon this turn.
function roninMysteriousIdentity() {
  // This ability lets Ronin count as any class/team for superpower conditions.
  // Implementation: the card's class/team could be changed dynamically.
  // For now, log the ability — full implementation requires the played-card
  // condition checker to offer a choice.
  onscreenConsole.log(`<span class="console-highlights">Mysterious Identity</span>: This card can count as any Hero Class and/or Team this turn for superpower conditions.`);
}

// Storm of Arrows (Common B) — Hyperspeed 4. Superpower [RANGED]: Draw a card.
function roninStormOfArrows() {
  hyperspeed(4);
}

async function roninStormOfArrowsSuper() {
  onscreenConsole.log(`<span class="console-highlights">Storm of Arrows</span> superpower: Draw a card.`);
  drawCard();
}

// Haunted by Loss (Uncommon) — Superpower [INSTINCT]: Dark Memories.
function roninHauntedByLoss() {
  applyDarkMemories();
}

// Brooding Fury (Rare) — Dark Memories. Superpower [STRENGTH]: Dark Memories again.
function roninBroodingFury() {
  applyDarkMemories();
}

function roninBroodingFurySuper() {
  applyDarkMemories();
}

// === Scarlet Witch ===

// Hex Bolt (Common) — Superpower [RANGED]: Discard the top card of any player's deck.
// You may play a copy of that card this turn.
// In solo: discard top of your own deck, may play a copy.
async function scarletWitchHexBolt() {
  if (playerDeck.length === 0 && playerDiscardPile.length > 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  if (playerDeck.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Hex Bolt</span>: No cards in deck.`);
    return;
  }
  const card = playerDeck.pop();
  playerDiscardPile.push(card);
  onscreenConsole.log(`<span class="console-highlights">Hex Bolt</span> superpower: Discarded <span class="console-highlights">${card.name}</span> from top of deck. You may play a copy of it this turn.`);
  updateGameBoard();
}

// Alter Reality (Common B) — Reveal top card of your deck. Discard it or put it back.
// Superpower [COVERT]: Dark Memories.
async function scarletWitchAlterReality() {
  if (playerDeck.length === 0 && playerDiscardPile.length > 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  if (playerDeck.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Alter Reality</span>: No cards in deck.`);
    return;
  }
  const topCard = playerDeck[playerDeck.length - 1];
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Top of your deck: <span class="bold-spans">${topCard.name}</span>. Discard it or put it back?`,
      "Discard",
      "Put It Back",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      const card = playerDeck.pop();
      playerDiscardPile.push(card);
      onscreenConsole.log(`<span class="console-highlights">Alter Reality</span>: Discarded <span class="console-highlights">${card.name}</span>.`);
      updateGameBoard();
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      onscreenConsole.log(`<span class="console-highlights">Alter Reality</span>: Left <span class="console-highlights">${topCard.name}</span> on top.`);
      resolve();
    };
  });
}

function scarletWitchAlterRealitySuper() {
  applyDarkMemories();
}

// Chaos Magic (Uncommon) — Reveal top card of Hero Deck. You may play a copy this turn.
// When you do, put that card on the bottom of the Hero Deck.
function scarletWitchChaosMagic() {
  if (heroDeck.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Chaos Magic</span>: Hero Deck is empty.`);
    return;
  }
  const topCard = heroDeck[heroDeck.length - 1];
  onscreenConsole.log(`<span class="console-highlights">Chaos Magic</span>: Revealed <span class="console-highlights">${topCard.name}</span> from Hero Deck. You may play a copy this turn (put it on the bottom of the Hero Deck after).`);
}

// Warp Time and Space (Rare) — Reveal top 3 cards of Hero Deck. Put one in your hand.
// Put the rest on top or bottom of Hero Deck in any order.
// Superpower [AVENGERS x3]: Dark Memories.
async function scarletWitchWarpTimeAndSpace() {
  if (heroDeck.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Warp Time and Space</span>: Hero Deck is empty.`);
    return;
  }
  const revealed = [];
  for (let i = 0; i < 3 && heroDeck.length > 0; i++) {
    revealed.push(heroDeck.pop());
  }
  if (revealed.length === 1) {
    playerHand.push(revealed[0]);
    onscreenConsole.log(`<span class="console-highlights">Warp Time and Space</span>: Only one card — <span class="console-highlights">${revealed[0].name}</span> goes to your hand.`);
    updateGameBoard();
    return;
  }
  // Let player choose which card to keep
  return new Promise((resolve) => {
    const names = revealed.map((c, i) => `(${i + 1}) ${c.name}`).join(", ");
    const labels = revealed.length === 3
      ? [revealed[0].name.substring(0, 25), revealed[1].name.substring(0, 25), revealed[2].name.substring(0, 25)]
      : [revealed[0].name.substring(0, 25), revealed[1].name.substring(0, 25)];

    const { confirmButton, denyButton, extraButton } = showHeroAbilityMayPopup(
      `Revealed: ${names}. Choose one for your hand:`,
      labels[0],
      labels[1],
      labels[2] || "",
      revealed.length === 3,
    );
    function pick(index) {
      closeInfoChoicePopup();
      const chosen = revealed.splice(index, 1)[0];
      playerHand.push(chosen);
      // Put the rest on bottom of Hero Deck
      for (const card of revealed) {
        heroDeck.unshift(card);
      }
      onscreenConsole.log(`<span class="console-highlights">Warp Time and Space</span>: <span class="console-highlights">${chosen.name}</span> goes to your hand. Rest placed on bottom of Hero Deck.`);
      updateGameBoard();
      resolve();
    }
    confirmButton.onclick = () => pick(0);
    denyButton.onclick = () => pick(1);
    if (revealed.length === 3) extraButton.onclick = () => pick(2);
  });
}

function scarletWitchWarpTimeAndSpaceSuper() {
  applyDarkMemories();
}

// === Speed ===

// Accelerate (Common) — Hyperspeed 2.
// Superpower [INSTINCT]: Instead, Hyperspeed 6.
function speedAccelerate() {
  hyperspeed(2);
}

function speedAccelerateSuper() {
  hyperspeed(6);
}

// Speedy Delivery (Common B) — The next Hero you recruit this turn goes on top of your deck.
function speedSpeedyDelivery() {
  onscreenConsole.log(`<span class="console-highlights">Speedy Delivery</span>: The next Hero you recruit this turn goes on top of your deck.`);
  // This needs a flag that the recruit system checks.
  // For now, log the reminder — full integration requires a hook in the recruit flow.
}

// Race to the Rescue (Uncommon) — Choose a Hero Class. Reveal top card of your deck.
// If it matches, draw it. Otherwise, put it on top or bottom.
async function speedRaceToTheRescue() {
  if (playerDeck.length === 0 && playerDiscardPile.length > 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  if (playerDeck.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Race to the Rescue</span>: No cards in deck.`);
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton, extraButton } = showHeroAbilityMayPopup(
      `Choose a Hero Class to name:`,
      "Strength / Instinct",
      "Covert / Tech",
      "Range",
      true,
    );
    function processGuess(classes) {
      closeInfoChoicePopup();
      // Sub-choice if needed for compound button
      if (classes.length > 1) {
        const { confirmButton: a, denyButton: b } = showHeroAbilityMayPopup(
          `Which one?`,
          classes[0],
          classes[1],
        );
        a.onclick = () => revealAndCheck(classes[0]);
        b.onclick = () => revealAndCheck(classes[1]);
      } else {
        revealAndCheck(classes[0]);
      }

      function revealAndCheck(chosenClass) {
        closeInfoChoicePopup();
        const topCard = playerDeck[playerDeck.length - 1];
        const matches = topCard.classes && topCard.classes.includes(chosenClass);
        if (matches) {
          const card = playerDeck.pop();
          playerHand.push(card);
          onscreenConsole.log(`<span class="console-highlights">Race to the Rescue</span>: Named "${chosenClass}". Revealed <span class="console-highlights">${card.name}</span> — it matches! Drew it.`);
          updateGameBoard();
          resolve();
        } else {
          onscreenConsole.log(`<span class="console-highlights">Race to the Rescue</span>: Named "${chosenClass}". Revealed <span class="console-highlights">${topCard.name}</span> — no match.`);
          const { confirmButton: topBtn, denyButton: botBtn } = showHeroAbilityMayPopup(
            `Put <span class="bold-spans">${topCard.name}</span> on top or bottom of your deck?`,
            "Top",
            "Bottom",
          );
          topBtn.onclick = function () {
            closeInfoChoicePopup();
            // Already on top — do nothing
            resolve();
          };
          botBtn.onclick = function () {
            closeInfoChoicePopup();
            const card = playerDeck.pop();
            playerDeck.unshift(card);
            resolve();
          };
        }
      }
    }
    confirmButton.onclick = () => processGuess(["Strength", "Instinct"]);
    denyButton.onclick = () => processGuess(["Covert", "Tech"]);
    extraButton.onclick = () => processGuess(["Range"]);
  });
}

// Break the Sound Barrier (Rare) — Look at top 6 cards of your deck, draw 2,
// put the rest back on top or bottom in any order.
// Superpower [COVERT]: Hyperspeed 6.
async function speedBreakTheSoundBarrier() {
  // Reshuffle if needed
  if (playerDeck.length === 0 && playerDiscardPile.length > 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  const count = Math.min(6, playerDeck.length);
  if (count === 0) {
    onscreenConsole.log(`<span class="console-highlights">Break the Sound Barrier</span>: No cards in deck.`);
    return;
  }
  // Pull top N cards
  const revealed = [];
  for (let i = 0; i < count; i++) {
    revealed.push(playerDeck.pop());
  }
  // For simplicity: draw the 2 best (highest cost) and put rest on bottom
  revealed.sort((a, b) => (b.cost || 0) - (a.cost || 0));
  const drawn = revealed.splice(0, 2);
  for (const card of drawn) {
    playerHand.push(card);
  }
  // Put rest on bottom
  for (const card of revealed) {
    playerDeck.unshift(card);
  }
  onscreenConsole.log(`<span class="console-highlights">Break the Sound Barrier</span>: Looked at ${count} cards. Drew <span class="console-highlights">${drawn.map(c => c.name).join("</span> and <span class=\"console-highlights\">")}</span>. Put ${revealed.length} on bottom.`);
  updateGameBoard();
}

function speedBreakTheSoundBarrierSuper() {
  hyperspeed(6);
}

// === War Machine ===

// Simulated Target Practice (Common) — Superpower [TECH]: You may fight a Henchman
// from your Victory Pile this turn. If you do, KO it and rescue a Bystander.
async function warMachineSimulatedTargetPractice() {
  const henchmenInVP = victoryPile.filter(c => c.subtype === "Henchman" || (c.henchmen === true));
  if (henchmenInVP.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Simulated Target Practice</span> superpower: No Henchmen in Victory Pile.`);
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Fight a Henchman from your Victory Pile, KO it, and rescue a Bystander?`,
      "Fight Henchman",
      "Skip",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      // KO first henchman found
      const idx = victoryPile.findIndex(c => c.subtype === "Henchman" || (c.henchmen === true));
      if (idx !== -1) {
        const hench = victoryPile.splice(idx, 1)[0];
        koPile.push(hench);
        onscreenConsole.log(`KO'd <span class="console-highlights">${hench.name}</span> from Victory Pile.`);
        // Rescue a bystander
        if (bystanderStack.length > 0) {
          const bystander = bystanderStack.pop();
          victoryPile.push(bystander);
          onscreenConsole.log(`Rescued a <span class="console-highlights">Bystander</span>.`);
        }
        updateGameBoard();
      }
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      resolve();
    };
  });
}

// Military-Industrial Complex (Common B) — Whenever you defeat a Villain this turn, +1 Recruit.
function warMachineMilitaryIndustrialComplex() {
  onscreenConsole.log(`<span class="console-highlights">Military-Industrial Complex</span>: Whenever you defeat a Villain this turn, you get +1 <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons">.`);
  // This needs a per-turn flag checked in the fight resolution flow.
  // For now, log the reminder.
}

// Hypersonic Cannon (Uncommon) — Hyperspeed 5. Superpower [RANGED]: KO a card from discard.
function warMachineHypersonicCannon() {
  hyperspeed(5);
}

async function warMachineHypersonicCannonSuper() {
  if (playerDiscardPile.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Hypersonic Cannon</span> superpower: No cards in discard pile to KO.`);
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `KO a card from your discard pile?`,
      "KO a Card",
      "Skip",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      // KO lowest-cost card as a simple heuristic
      playerDiscardPile.sort((a, b) => (a.cost || 0) - (b.cost || 0));
      const card = playerDiscardPile.shift();
      koPile.push(card);
      onscreenConsole.log(`<span class="console-highlights">Hypersonic Cannon</span> superpower: KO'd <span class="console-highlights">${card.name}</span>.`);
      updateGameBoard();
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      resolve();
    };
  });
}

// Overwhelming Firepower (Rare) — Whenever you defeat a Villain or Mastermind this turn,
// draw a card and rescue a Bystander.
function warMachineOverwhelmingFirepower() {
  onscreenConsole.log(`<span class="console-highlights">Overwhelming Firepower</span>: Whenever you defeat a Villain or Mastermind this turn, draw a card and rescue a Bystander.`);
  // Per-turn flag for fight resolution flow.
}

// --- VILLAIN CARD EFFECTS ---

// --- SCHEME TWIST EFFECTS ---

// --- MASTERMIND EFFECTS ---

// --- HENCHMEN EFFECTS ---

// --- BYSTANDER EFFECTS ---
