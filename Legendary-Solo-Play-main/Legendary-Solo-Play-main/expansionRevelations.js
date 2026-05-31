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
 * A destroyed / non-existent space (1A: destroyedSpaces[i] === true) does NOT count.
 * Returns a number 0 to citySize.
 */
function calculateLastStand() {
  let emptyCount = 0;
  for (let i = 0; i < city.length; i++) {
    const isDestroyed = typeof destroyedSpaces !== "undefined" && destroyedSpaces[i] === true;
    if ((!city[i] || city[i] === null) && !isDestroyed) {
      emptyCount++;
    }
  }
  return emptyCount;
}

/**
 * Revelations keyword / Location attack bonus for a CITY or HQ villain.
 * Effects: Last Stand (+1/empty space, Double x2), Dark Memories (+1/unique discard class
 * capped 5, Double x2), Lethal Legion (+3 while this villain's ONE exact-name Location is
 * in the city — Grim Reaper's similarly-named tactic-Locations do NOT count).
 * Returns the own-effect attack bonus (0 if this villain has none).
 * Consumed by BOTH updateVillainAttackValues twins (duplicate-fn hazard — keep callers in sync).
 */
function revelationsVillainOwnAttack(villain) {
  const kw = villain.keywords || [];
  if (kw.includes("Double Last Stand")) return calculateLastStand() * 2;
  if (kw.includes("Last Stand")) return calculateLastStand();
  if (kw.includes("Double Dark Memories")) return calculateDarkMemories() * 2;
  if (kw.includes("Dark Memories")) return calculateDarkMemories();
  // Lethal Legion +3-while-Location: case-insensitive KEYWORD substring match against
  // cityLocations[] names. Grim Reaper "Always Leads: Lethal Legion" puts both the Lethal
  // Legion's own Locations AND Grim Reaper's tactic-Locations in play together, and BOTH
  // legitimately satisfy the trigger (the printed villain text quotes a keyword, e.g. "'Maze'
  // Location", not a full card name). So Living Laser's "Maze" matches Laser Maze AND Maze of Bones.
  const LETHAL_LEGION_KEYWORD = {
    "Living Laser": "maze",
    "M'Baku": "cult",
    "Power Man (Erik Josten)": "prison",
    "Swordsman": "carnival",
  };
  const keyword = LETHAL_LEGION_KEYWORD[villain.name];
  if (
    keyword &&
    typeof cityLocations !== "undefined" &&
    Array.isArray(cityLocations) &&
    cityLocations.some(
      (loc) => loc && typeof loc.name === "string" && loc.name.toLowerCase().includes(keyword),
    )
  ) {
    return 3;
  }
  return 0;
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

// --- SHARED POPUP HELPERS ---

// Multi-card KO-from-discard popup. Used by Revelations effects that say
// "KO [up to N] cards from your discard pile" (may-skip). Replaces the old
// Yes/No + auto-pick-cheapest anti-pattern with a proper card-choice-popup.
// maxCount defaults to 1. When > 1, selecting beyond max uses FIFO (oldest
// selection drops), matching the canonical KO1To4FromDiscard pattern.
async function koUpToNFromDiscardPile(sourceName, maxCount = 1) {
  updateGameBoard();
  return new Promise((resolve) => {
    if (playerDiscardPile.length === 0) {
      onscreenConsole.log(`<span class="console-highlights">${sourceName}</span>: No cards in discard pile to KO.`);
      resolve();
      return;
    }

    const discardCardsWithIndex = playerDiscardPile.map((card, index) => ({ ...card, originalIndex: index }));
    genericCardSort(discardCardsWithIndex);

    const cardchoicepopup = document.querySelector(".card-choice-popup");
    const modalOverlay = document.getElementById("modal-overlay");
    const selectionRow1 = document.querySelector(".card-choice-popup-selectionrow1");
    const previewElement = document.querySelector(".card-choice-popup-preview");
    const titleElement = document.querySelector(".card-choice-popup-title");
    const instructionsElement = document.querySelector(".card-choice-popup-instructions");

    const plural = maxCount === 1 ? "a Card" : `up to ${maxCount} Cards`;
    titleElement.textContent = `KO ${plural} from Discard`;

    function renderInstructions(selectedCards) {
      instructionsElement.textContent = "";
      const sourceSpan = document.createElement("span");
      sourceSpan.className = "console-highlights";
      sourceSpan.textContent = sourceName;
      instructionsElement.appendChild(sourceSpan);
      if (selectedCards.length === 0) {
        const suffix = maxCount === 1
          ? ": Choose a card from your discard pile to KO."
          : `: Choose up to ${maxCount} cards from your discard pile to KO.`;
        instructionsElement.appendChild(document.createTextNode(suffix));
      } else {
        instructionsElement.appendChild(document.createTextNode(": Selected "));
        selectedCards.forEach((c, i) => {
          if (i > 0) instructionsElement.appendChild(document.createTextNode(", "));
          const nameSpan = document.createElement("span");
          nameSpan.className = "console-highlights";
          nameSpan.textContent = c.name;
          instructionsElement.appendChild(nameSpan);
        });
        instructionsElement.appendChild(document.createTextNode(` (${selectedCards.length}/${maxCount}).`));
      }
    }

    document.querySelector(".card-choice-popup-selectionrow1label").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2label").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2-container").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.height = "50%";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.top = "28%";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.transform = "translateY(-50%)";
    document.querySelector(".card-choice-popup-closebutton").style.display = "none";

    selectionRow1.textContent = "";
    previewElement.textContent = "";
    previewElement.style.backgroundColor = "var(--panel-backgrounds)";

    const selectedCards = [];
    setupIndependentScrollGradients(selectionRow1, null);

    const confirmButton = document.getElementById("card-choice-popup-confirm");
    const otherChoiceButton = document.getElementById("card-choice-popup-otherchoice");
    const noThanksButton = document.getElementById("card-choice-popup-nothanks");

    function updateConfirmLabel() {
      if (selectedCards.length === 0) {
        confirmButton.textContent = maxCount === 1 ? "KO CARD" : "KO CARDS";
        confirmButton.disabled = true;
      } else {
        confirmButton.textContent = `KO ${selectedCards.length} CARD${selectedCards.length !== 1 ? "S" : ""}`;
        confirmButton.disabled = false;
      }
    }

    otherChoiceButton.style.display = "none";
    noThanksButton.textContent = "NO THANKS";
    noThanksButton.style.display = "inline-block";
    noThanksButton.disabled = false;

    renderInstructions(selectedCards);
    updateConfirmLabel();

    discardCardsWithIndex.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.className = "popup-card";
      cardElement.setAttribute("data-original-index", card.originalIndex);

      const cardImage = document.createElement("img");
      cardImage.src = card.image;
      cardImage.alt = card.name;
      cardImage.className = "popup-card-image";

      cardElement.addEventListener("mouseover", () => {
        previewElement.textContent = "";
        const previewImage = document.createElement("img");
        previewImage.src = card.image;
        previewImage.alt = card.name;
        previewImage.className = "popup-card-preview-image";
        previewElement.appendChild(previewImage);
        previewElement.style.backgroundColor = "var(--accent)";
      });

      cardElement.addEventListener("click", () => {
        const idx = selectedCards.findIndex((c) => c.originalIndex === card.originalIndex);
        if (idx > -1) {
          selectedCards.splice(idx, 1);
          cardImage.classList.remove("selected");
        } else {
          if (selectedCards.length >= maxCount) {
            // FIFO: drop the oldest selection
            const oldest = selectedCards.shift();
            const oldestEl = selectionRow1.querySelector(`[data-original-index="${oldest.originalIndex}"] img`);
            if (oldestEl) oldestEl.classList.remove("selected");
          }
          selectedCards.push(card);
          cardImage.classList.add("selected");
        }
        renderInstructions(selectedCards);
        updateConfirmLabel();
      });

      cardElement.appendChild(cardImage);
      selectionRow1.appendChild(cardElement);
    });

    if (discardCardsWithIndex.length > 20) {
      selectionRow1.classList.add("multi-row", "three-row");
      document.querySelector(".card-choice-popup-selectionrow1-container").style.height = "75%";
      document.querySelector(".card-choice-popup-selectionrow1-container").style.top = "40%";
      selectionRow1.style.gap = "0.3vw";
    } else if (discardCardsWithIndex.length > 10) {
      selectionRow1.classList.add("multi-row");
      selectionRow1.classList.remove("three-row");
      document.querySelector(".card-choice-popup-selectionrow1-container").style.height = "50%";
      document.querySelector(".card-choice-popup-selectionrow1-container").style.top = "25%";
    } else {
      selectionRow1.classList.remove("multi-row", "three-row");
    }

    setupDragScrolling(selectionRow1);

    confirmButton.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (selectedCards.length === 0) return;
      setTimeout(() => {
        // Splice in descending original-index order to keep remaining indices valid
        const toRemove = [...selectedCards].sort((a, b) => b.originalIndex - a.originalIndex);
        toRemove.forEach((c) => {
          const removed = playerDiscardPile.splice(c.originalIndex, 1)[0];
          koPile.push(removed);
          onscreenConsole.log(`<span class="console-highlights">${sourceName}</span>: KO'd <span class="console-highlights">${removed.name}</span>.`);
          koBonuses();
        });
        updateGameBoard();
        closeCardChoicePopup();
        resolve();
      }, 100);
    };

    noThanksButton.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      setTimeout(() => {
        onscreenConsole.log(`<span class="console-highlights">${sourceName}</span>: Chose not to KO a card.`);
        updateGameBoard();
        closeCardChoicePopup();
        resolve();
      }, 100);
    };

    modalOverlay.style.display = "block";
    cardchoicepopup.style.display = "block";
  });
}

// Single-card retrieve-from-discard-to-hand popup. Used by effects that say
// "Put a card from your discard pile into your hand." No KO, no koBonuses.
async function takeOneFromDiscardToHand(sourceName) {
  updateGameBoard();
  return new Promise((resolve) => {
    if (playerDiscardPile.length === 0) {
      onscreenConsole.log(`<span class="console-highlights">${sourceName}</span>: No cards in discard pile to take.`);
      resolve();
      return;
    }

    const discardCardsWithIndex = playerDiscardPile.map((card, index) => ({ ...card, originalIndex: index }));
    genericCardSort(discardCardsWithIndex);

    const cardchoicepopup = document.querySelector(".card-choice-popup");
    const modalOverlay = document.getElementById("modal-overlay");
    const selectionRow1 = document.querySelector(".card-choice-popup-selectionrow1");
    const previewElement = document.querySelector(".card-choice-popup-preview");
    const titleElement = document.querySelector(".card-choice-popup-title");
    const instructionsElement = document.querySelector(".card-choice-popup-instructions");

    titleElement.textContent = "Take a Card from Discard to Hand";
    instructionsElement.textContent = "";
    const sourceSpan = document.createElement("span");
    sourceSpan.className = "console-highlights";
    sourceSpan.textContent = sourceName;
    instructionsElement.appendChild(sourceSpan);
    instructionsElement.appendChild(document.createTextNode(": Choose a card from your discard pile to put into your hand."));

    document.querySelector(".card-choice-popup-selectionrow1label").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2label").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2-container").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.height = "50%";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.top = "28%";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.transform = "translateY(-50%)";
    document.querySelector(".card-choice-popup-closebutton").style.display = "none";

    selectionRow1.textContent = "";
    previewElement.textContent = "";
    previewElement.style.backgroundColor = "var(--panel-backgrounds)";

    let selectedCard = null;
    setupIndependentScrollGradients(selectionRow1, null);

    const confirmButton = document.getElementById("card-choice-popup-confirm");
    const otherChoiceButton = document.getElementById("card-choice-popup-otherchoice");
    const noThanksButton = document.getElementById("card-choice-popup-nothanks");

    confirmButton.textContent = "TAKE CARD";
    confirmButton.disabled = true;
    otherChoiceButton.style.display = "none";
    noThanksButton.textContent = "NO THANKS";
    noThanksButton.style.display = "inline-block";
    noThanksButton.disabled = false;

    discardCardsWithIndex.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.className = "popup-card";
      cardElement.setAttribute("data-original-index", card.originalIndex);

      const cardImage = document.createElement("img");
      cardImage.src = card.image;
      cardImage.alt = card.name;
      cardImage.className = "popup-card-image";

      cardElement.addEventListener("mouseover", () => {
        previewElement.textContent = "";
        const previewImage = document.createElement("img");
        previewImage.src = card.image;
        previewImage.alt = card.name;
        previewImage.className = "popup-card-preview-image";
        previewElement.appendChild(previewImage);
        previewElement.style.backgroundColor = "var(--accent)";
      });

      cardElement.addEventListener("click", () => {
        selectionRow1.querySelectorAll("img.selected").forEach((img) => img.classList.remove("selected"));
        if (selectedCard && selectedCard.originalIndex === card.originalIndex) {
          selectedCard = null;
          confirmButton.disabled = true;
        } else {
          selectedCard = card;
          cardImage.classList.add("selected");
          confirmButton.disabled = false;
        }
      });

      cardElement.appendChild(cardImage);
      selectionRow1.appendChild(cardElement);
    });

    if (discardCardsWithIndex.length > 20) {
      selectionRow1.classList.add("multi-row", "three-row");
      document.querySelector(".card-choice-popup-selectionrow1-container").style.height = "75%";
      document.querySelector(".card-choice-popup-selectionrow1-container").style.top = "40%";
      selectionRow1.style.gap = "0.3vw";
    } else if (discardCardsWithIndex.length > 10) {
      selectionRow1.classList.add("multi-row");
      selectionRow1.classList.remove("three-row");
      document.querySelector(".card-choice-popup-selectionrow1-container").style.height = "50%";
      document.querySelector(".card-choice-popup-selectionrow1-container").style.top = "25%";
    } else {
      selectionRow1.classList.remove("multi-row", "three-row");
    }

    setupDragScrolling(selectionRow1);

    confirmButton.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (!selectedCard) return;
      setTimeout(() => {
        const removed = playerDiscardPile.splice(selectedCard.originalIndex, 1)[0];
        playerHand.push(removed);
        onscreenConsole.log(`<span class="console-highlights">${sourceName}</span>: Took <span class="console-highlights">${removed.name}</span> into your hand.`);
        updateGameBoard();
        closeCardChoicePopup();
        resolve();
      }, 100);
    };

    noThanksButton.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      setTimeout(() => {
        onscreenConsole.log(`<span class="console-highlights">${sourceName}</span>: Chose not to take a card.`);
        updateGameBoard();
        closeCardChoicePopup();
        resolve();
      }, 100);
    };

    modalOverlay.style.display = "block";
    cardchoicepopup.style.display = "block";
  });
}

// Reveal top N of the player deck; player KOs any subset, the rest go back on
// top in original (top-down) order. Reshuffles discard if the deck is empty.
// Used by effects like Maze of Bones ("Look at top 4, KO any number").
async function revealTopNKOAny(sourceName, revealCount) {
  updateGameBoard();
  return new Promise((resolve) => {
    // Reshuffle discard into deck if deck can't cover revealCount
    if (playerDeck.length < revealCount && playerDiscardPile.length > 0) {
      playerDeck = shuffle(playerDiscardPile.concat(playerDeck));
      playerDiscardPile = [];
    }

    const revealed = [];
    for (let i = 0; i < revealCount && playerDeck.length > 0; i++) {
      revealed.push(playerDeck.pop());
    }

    if (revealed.length === 0) {
      onscreenConsole.log(`<span class="console-highlights">${sourceName}</span>: Deck is empty, nothing to reveal.`);
      resolve();
      return;
    }

    // revealed[0] is top of deck (popped first), revealed[last] is deepest
    const revealedWithIndex = revealed.map((card, index) => ({ ...card, revealIndex: index }));

    const cardchoicepopup = document.querySelector(".card-choice-popup");
    const modalOverlay = document.getElementById("modal-overlay");
    const selectionRow1 = document.querySelector(".card-choice-popup-selectionrow1");
    const previewElement = document.querySelector(".card-choice-popup-preview");
    const titleElement = document.querySelector(".card-choice-popup-title");
    const instructionsElement = document.querySelector(".card-choice-popup-instructions");

    titleElement.textContent = `Reveal Top ${revealed.length} — KO Any`;

    function renderInstructions(selectedCards) {
      instructionsElement.textContent = "";
      const sourceSpan = document.createElement("span");
      sourceSpan.className = "console-highlights";
      sourceSpan.textContent = sourceName;
      instructionsElement.appendChild(sourceSpan);
      if (selectedCards.length === 0) {
        instructionsElement.appendChild(document.createTextNode(`: Choose any number of these cards to KO; the rest return to the top of your deck.`));
      } else {
        instructionsElement.appendChild(document.createTextNode(": Selected "));
        selectedCards.forEach((c, i) => {
          if (i > 0) instructionsElement.appendChild(document.createTextNode(", "));
          const nameSpan = document.createElement("span");
          nameSpan.className = "console-highlights";
          nameSpan.textContent = c.name;
          instructionsElement.appendChild(nameSpan);
        });
        instructionsElement.appendChild(document.createTextNode(` (${selectedCards.length}).`));
      }
    }

    document.querySelector(".card-choice-popup-selectionrow1label").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2label").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2-container").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.height = "50%";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.top = "28%";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.transform = "translateY(-50%)";
    document.querySelector(".card-choice-popup-closebutton").style.display = "none";

    selectionRow1.textContent = "";
    previewElement.textContent = "";
    previewElement.style.backgroundColor = "var(--panel-backgrounds)";

    const selectedCards = [];
    setupIndependentScrollGradients(selectionRow1, null);

    const confirmButton = document.getElementById("card-choice-popup-confirm");
    const otherChoiceButton = document.getElementById("card-choice-popup-otherchoice");
    const noThanksButton = document.getElementById("card-choice-popup-nothanks");

    function updateConfirmLabel() {
      if (selectedCards.length === 0) {
        confirmButton.textContent = "PUT ALL BACK";
      } else {
        confirmButton.textContent = `KO ${selectedCards.length} CARD${selectedCards.length !== 1 ? "S" : ""}`;
      }
      confirmButton.disabled = false;
    }

    otherChoiceButton.style.display = "none";
    noThanksButton.style.display = "none";

    renderInstructions(selectedCards);
    updateConfirmLabel();

    // Display in reveal order (top of deck first)
    revealedWithIndex.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.className = "popup-card";
      cardElement.setAttribute("data-reveal-index", card.revealIndex);

      const cardImage = document.createElement("img");
      cardImage.src = card.image;
      cardImage.alt = card.name;
      cardImage.className = "popup-card-image";

      cardElement.addEventListener("mouseover", () => {
        previewElement.textContent = "";
        const previewImage = document.createElement("img");
        previewImage.src = card.image;
        previewImage.alt = card.name;
        previewImage.className = "popup-card-preview-image";
        previewElement.appendChild(previewImage);
        previewElement.style.backgroundColor = "var(--accent)";
      });

      cardElement.addEventListener("click", () => {
        const idx = selectedCards.findIndex((c) => c.revealIndex === card.revealIndex);
        if (idx > -1) {
          selectedCards.splice(idx, 1);
          cardImage.classList.remove("selected");
        } else {
          selectedCards.push(card);
          cardImage.classList.add("selected");
        }
        renderInstructions(selectedCards);
        updateConfirmLabel();
      });

      cardElement.appendChild(cardImage);
      selectionRow1.appendChild(cardElement);
    });

    setupDragScrolling(selectionRow1);

    confirmButton.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      setTimeout(() => {
        const selectedIndices = new Set(selectedCards.map((c) => c.revealIndex));
        // KO selected cards
        revealed.forEach((card, i) => {
          if (selectedIndices.has(i)) {
            koPile.push(card);
            onscreenConsole.log(`<span class="console-highlights">${sourceName}</span>: KO'd <span class="console-highlights">${card.name}</span>.`);
            koBonuses();
          }
        });
        // Put unselected back on top in original order:
        // revealed[0] was popped first (was top) → it should be on top after.
        // Deck top == end of array, so push in reverse reveal order.
        for (let i = revealed.length - 1; i >= 0; i--) {
          if (!selectedIndices.has(i)) {
            playerDeck.push(revealed[i]);
          }
        }
        const keptCount = revealed.length - selectedCards.length;
        if (keptCount > 0) {
          onscreenConsole.log(`<span class="console-highlights">${sourceName}</span>: Put ${keptCount} card${keptCount !== 1 ? "s" : ""} back on top of your deck.`);
        }
        updateGameBoard();
        closeCardChoicePopup();
        resolve();
      }, 100);
    };

    modalOverlay.style.display = "block";
    cardchoicepopup.style.display = "block";
  });
}

// Multi-select KO-of-your-heroes popup. Scans artifacts + hand + played cards
// (same sources as FightKOHeroYouHave), lets the player KO up to maxCount
// with a NO THANKS skip option. Played cards are marked with markedToDestroy
// so the turn-end cleanup handles them; hand/artifact cards are spliced + KO'd.
async function koUpToNHeroesYouHave(sourceName, maxCount) {
  updateGameBoard();
  return new Promise((resolve) => {
    const artifactHeroes = playerArtifacts.filter((card) => card.type === "Hero");
    const handHeroes = playerHand.filter((card) => card.type === "Hero");
    const playedHeroes = cardsPlayedThisTurn.filter(
      (card) =>
        card.type === "Hero" &&
        card.isCopied !== true &&
        card.sidekickToDestroy !== true &&
        !card.markedForDeletion &&
        !card.isSimulation
    );

    if (artifactHeroes.length === 0 && handHeroes.length === 0 && playedHeroes.length === 0) {
      onscreenConsole.log(`<span class="console-highlights">${sourceName}</span>: No Heroes available to KO.`);
      resolve();
      return;
    }

    genericCardSort(artifactHeroes);
    genericCardSort(handHeroes);
    genericCardSort(playedHeroes);

    const cardchoicepopup = document.querySelector(".card-choice-popup");
    const modalOverlay = document.getElementById("modal-overlay");
    const selectionRow1 = document.querySelector(".card-choice-popup-selectionrow1");
    const selectionRow2 = document.querySelector(".card-choice-popup-selectionrow2");
    const selectionRow1Label = document.querySelector(".card-choice-popup-selectionrow1label");
    const selectionRow2Label = document.querySelector(".card-choice-popup-selectionrow2label");
    const previewElement = document.querySelector(".card-choice-popup-preview");
    const titleElement = document.querySelector(".card-choice-popup-title");
    const instructionsElement = document.querySelector(".card-choice-popup-instructions");

    titleElement.textContent = `KO up to ${maxCount} Hero${maxCount !== 1 ? "es" : ""}`;

    selectionRow1Label.style.display = "block";
    selectionRow2Label.style.display = "block";
    selectionRow2.style.display = "flex";
    document.querySelector(".card-choice-popup-selectionrow2-container").style.display = "block";
    selectionRow1Label.textContent = "Artifacts & Hand";
    selectionRow2Label.textContent = "Played Cards";
    document.querySelector(".card-choice-popup-closebutton").style.display = "none";

    selectionRow1.style.height = "";
    selectionRow2.style.height = "";
    selectionRow1.textContent = "";
    selectionRow2.textContent = "";
    previewElement.textContent = "";
    previewElement.style.backgroundColor = "var(--panel-backgrounds)";

    document.querySelector(".card-choice-popup-selectionrow1-container").style.height = "40%";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.top = "0";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.transform = "none";

    setupIndependentScrollGradients(selectionRow1, selectionRow2);

    // selectedEntries: [{card, location, imageEl}]
    const selectedEntries = [];

    const confirmButton = document.getElementById("card-choice-popup-confirm");
    const otherChoiceButton = document.getElementById("card-choice-popup-otherchoice");
    const noThanksButton = document.getElementById("card-choice-popup-nothanks");

    function renderInstructions() {
      instructionsElement.textContent = "";
      const sourceSpan = document.createElement("span");
      sourceSpan.className = "console-highlights";
      sourceSpan.textContent = sourceName;
      instructionsElement.appendChild(sourceSpan);
      if (selectedEntries.length === 0) {
        instructionsElement.appendChild(document.createTextNode(`: Select up to ${maxCount} Hero${maxCount !== 1 ? "es" : ""} to KO, or skip.`));
      } else {
        instructionsElement.appendChild(document.createTextNode(": Selected "));
        selectedEntries.forEach((e, i) => {
          if (i > 0) instructionsElement.appendChild(document.createTextNode(", "));
          const nameSpan = document.createElement("span");
          nameSpan.className = "console-highlights";
          nameSpan.textContent = e.card.name;
          instructionsElement.appendChild(nameSpan);
        });
        instructionsElement.appendChild(document.createTextNode(` (${selectedEntries.length}/${maxCount}).`));
      }
    }

    function updateConfirmLabel() {
      if (selectedEntries.length === 0) {
        confirmButton.textContent = `KO HERO${maxCount !== 1 ? "ES" : ""}`;
        confirmButton.disabled = true;
      } else {
        confirmButton.textContent = `KO ${selectedEntries.length} HERO${selectedEntries.length !== 1 ? "ES" : ""}`;
        confirmButton.disabled = false;
      }
    }

    otherChoiceButton.style.display = "none";
    noThanksButton.textContent = "NO THANKS";
    noThanksButton.style.display = "inline-block";
    noThanksButton.disabled = false;

    function createCardElement(card, location, row) {
      const cardElement = document.createElement("div");
      cardElement.className = "popup-card";
      cardElement.setAttribute("data-card-id", card.id);
      cardElement.setAttribute("data-location", location);

      const cardImage = document.createElement("img");
      cardImage.src = card.image;
      cardImage.alt = card.name;
      cardImage.className = "popup-card-image";

      cardElement.addEventListener("mouseover", () => {
        previewElement.textContent = "";
        const previewImage = document.createElement("img");
        previewImage.src = card.image;
        previewImage.alt = card.name;
        previewImage.className = "popup-card-preview-image";
        previewElement.appendChild(previewImage);
        previewElement.style.backgroundColor = "var(--accent)";
      });

      cardElement.addEventListener("click", () => {
        const idx = selectedEntries.findIndex((e) => e.card.id === card.id && e.location === location);
        if (idx > -1) {
          selectedEntries.splice(idx, 1);
          cardImage.classList.remove("selected");
        } else {
          if (selectedEntries.length >= maxCount) {
            // FIFO: drop oldest
            const oldest = selectedEntries.shift();
            oldest.imageEl.classList.remove("selected");
          }
          selectedEntries.push({ card, location, imageEl: cardImage });
          cardImage.classList.add("selected");
        }
        renderInstructions();
        updateConfirmLabel();
      });

      cardElement.appendChild(cardImage);
      row.appendChild(cardElement);
    }

    if (artifactHeroes.length > 0) {
      const artifactLabel = document.createElement("span");
      artifactLabel.textContent = "Artifacts: ";
      artifactLabel.className = "row-divider-text";
      selectionRow1.appendChild(artifactLabel);
    }
    artifactHeroes.forEach((card) => createCardElement(card, "artifacts", selectionRow1));

    if (handHeroes.length > 0) {
      const handLabel = document.createElement("span");
      handLabel.textContent = "Hand: ";
      handLabel.className = "row-divider-text";
      selectionRow1.appendChild(handLabel);
    }
    handHeroes.forEach((card) => createCardElement(card, "hand", selectionRow1));

    playedHeroes.forEach((card) => createCardElement(card, "played", selectionRow2));

    setupDragScrolling(selectionRow1);
    setupDragScrolling(selectionRow2);

    renderInstructions();
    updateConfirmLabel();

    confirmButton.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (selectedEntries.length === 0) return;
      setTimeout(() => {
        selectedEntries.forEach(({ card, location }) => {
          if (location === "artifacts") {
            const i = playerArtifacts.findIndex((c) => c.id === card.id);
            if (i !== -1) playerArtifacts.splice(i, 1);
            koPile.push(card);
          } else if (location === "hand") {
            const i = playerHand.findIndex((c) => c.id === card.id);
            if (i !== -1) playerHand.splice(i, 1);
            koPile.push(card);
          } else if (location === "played") {
            card.markedToDestroy = true;
            koPile.push(card);
          }
          onscreenConsole.log(`<span class="console-highlights">${sourceName}</span>: KO'd <span class="console-highlights">${card.name}</span>.`);
          koBonuses();
        });
        updateGameBoard();
        closeCardChoicePopup();
        resolve();
      }, 100);
    };

    noThanksButton.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      setTimeout(() => {
        onscreenConsole.log(`<span class="console-highlights">${sourceName}</span>: Chose not to KO any Heroes.`);
        updateGameBoard();
        closeCardChoicePopup();
        resolve();
      }, 100);
    };

    modalOverlay.style.display = "block";
    cardchoicepopup.style.display = "block";
  });
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
  await koUpToNFromDiscardPile("Hypersonic Cannon", 1);
}

// Overwhelming Firepower (Rare) — Whenever you defeat a Villain or Mastermind this turn,
// draw a card and rescue a Bystander.
function warMachineOverwhelmingFirepower() {
  onscreenConsole.log(`<span class="console-highlights">Overwhelming Firepower</span>: Whenever you defeat a Villain or Mastermind this turn, draw a card and rescue a Bystander.`);
  // Per-turn flag for fight resolution flow.
}

// --- VILLAIN CARD EFFECTS ---

// Helper: Reveal a hero of a given class or suffer a consequence
function revealClassOrWound(className, iconFile, villainName) {
  const cardsYouHave = [
    ...playerHand,
    ...playerArtifacts,
    ...cardsPlayedThisTurn.filter(c => !c.isCopied && !c.sidekickToDestroy && !c.markedForDeletion && !c.isSimulation),
  ];
  const hasClass = cardsYouHave.some(c => c.classes && c.classes.includes(className));
  if (!hasClass) {
    onscreenConsole.log(`You have no <img src="Visual Assets/Icons/${iconFile}" alt="${className} Icon" class="console-card-icons"> Hero to reveal. Gaining a Wound.`);
    drawWound();
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Reveal a <img src="Visual Assets/Icons/${iconFile}" alt="${className} Icon" class="console-card-icons"> Hero to avoid gaining a Wound?`,
      "Reveal Hero",
      "Gain Wound",
    );
    const t1 = document.querySelector(".info-or-choice-popup-title");
    if (t1) t1.textContent = villainName;
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      onscreenConsole.log(`You revealed a <img src="Visual Assets/Icons/${iconFile}" alt="${className} Icon" class="console-card-icons"> Hero.`);
      resolve();
    };
    denyButton.onclick = () => {
      closeInfoChoicePopup();
      drawWound();
      resolve();
    };
  });
}

// Helper: Reveal a hero of a given class or discard a card
function revealClassOrDiscard(className, iconFile, villainName) {
  const cardsYouHave = [
    ...playerHand,
    ...playerArtifacts,
    ...cardsPlayedThisTurn.filter(c => !c.isCopied && !c.sidekickToDestroy && !c.markedForDeletion && !c.isSimulation),
  ];
  const hasClass = cardsYouHave.some(c => c.classes && c.classes.includes(className));
  if (!hasClass) {
    onscreenConsole.log(`You have no <img src="Visual Assets/Icons/${iconFile}" alt="${className} Icon" class="console-card-icons"> Hero. Discarding a card.`);
    if (playerHand.length > 0) {
      const card = playerHand.pop();
      playerDiscardPile.push(card);
      onscreenConsole.log(`Discarded <span class="console-highlights">${card.name}</span>.`);
      updateGameBoard();
    }
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Reveal a <img src="Visual Assets/Icons/${iconFile}" alt="${className} Icon" class="console-card-icons"> Hero to avoid discarding?`,
      "Reveal Hero",
      "Discard a Card",
    );
    const t2 = document.querySelector(".info-or-choice-popup-title");
    if (t2) t2.textContent = villainName;
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      onscreenConsole.log(`You revealed a <img src="Visual Assets/Icons/${iconFile}" alt="${className} Icon" class="console-card-icons"> Hero.`);
      resolve();
    };
    denyButton.onclick = () => {
      closeInfoChoicePopup();
      if (playerHand.length > 0) {
        const card = playerHand.pop();
        playerDiscardPile.push(card);
        onscreenConsole.log(`Discarded <span class="console-highlights">${card.name}</span>.`);
        updateGameBoard();
      }
      resolve();
    };
  });
}

// === Army of Evil ===

// Blackout — Ambush: reveal Range or discard. Fight: Draw two cards.
async function blackoutAmbush() {
  onscreenConsole.log(`Ambush! <span class="console-highlights">Blackout</span>: Reveal a <img src="Visual Assets/Icons/Range.svg" alt="Range Icon" class="console-card-icons"> Hero or discard a card.`);
  await revealClassOrDiscard("Range", "Range.svg", "BLACKOUT");
}

function blackoutFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Blackout</span>: Draw two cards.`);
  drawCard();
  drawCard();
}

// Count Nefaria — Ambush/Escape: unless all 5 classes revealed among all heroes, wound.
async function countNefariaAmbush() {
  const cardsYouHave = [
    ...playerHand,
    ...playerArtifacts,
    ...cardsPlayedThisTurn.filter(c => !c.isCopied && !c.sidekickToDestroy && !c.markedForDeletion && !c.isSimulation),
  ];
  const CLASSES = ["Strength", "Instinct", "Covert", "Tech", "Range"];
  const found = new Set();
  for (const card of cardsYouHave) {
    if (card.classes) {
      for (const cls of card.classes) {
        if (CLASSES.includes(cls)) found.add(cls);
      }
    }
  }
  if (found.size >= 5) {
    onscreenConsole.log(`Ambush! <span class="console-highlights">Count Nefaria</span>: Your revealed cards include all 5 Hero Classes. No Wound.`);
  } else {
    onscreenConsole.log(`Ambush! <span class="console-highlights">Count Nefaria</span>: Your cards are missing ${5 - found.size} Hero Class(es). Gaining a Wound.`);
    await drawWound();
  }
}

async function countNefariaEscape() {
  onscreenConsole.log(`Escape! <span class="console-highlights">Count Nefaria</span> escaped!`);
  await countNefariaAmbush();
}

// Dome of Darkforce (Location) — When you fight a villain here, reveal Range or discard.
// Fight (defeating the Location itself): Draw two cards.
async function domeOfDarkforceFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Dome of Darkforce</span>: Draw two cards.`);
  drawCard();
  drawCard();
}

// Klaw — Ambush: capture a Tech or Range Hero cost <=5 from HQ. Fight: Gain that hero.
async function klawAmbush(klaw) {
  const hqCards = typeof hq !== "undefined" ? hq : [];
  let capturedIdx = -1;
  for (let i = 0; i < hqCards.length; i++) {
    const card = hqCards[i];
    if (card && card.type === "Hero" && card.cost <= 5 &&
        card.classes && (card.classes.includes("Tech") || card.classes.includes("Range"))) {
      capturedIdx = i;
      break;
    }
  }
  if (capturedIdx === -1) {
    onscreenConsole.log(`Ambush! <span class="console-highlights">Klaw</span>: No eligible Hero in HQ to capture.`);
    return;
  }
  const captured = hqCards[capturedIdx];
  if (!klaw.capturedHero) klaw.capturedHero = [];
  klaw.capturedHero.push(captured);
  hqCards[capturedIdx] = null;
  onscreenConsole.log(`Ambush! <span class="console-highlights">Klaw</span> captured <span class="console-highlights">${captured.name}</span> (cost ${captured.cost}) from the HQ.`);
  if (typeof goldenRefillHQ === "function" && gameMode === "golden") {
    goldenRefillHQ(capturedIdx);
  } else if (heroDeck.length > 0) {
    hqCards[capturedIdx] = heroDeck.pop();
  }
  updateGameBoard();
}

function klawFight(klaw) {
  onscreenConsole.log(`Fight! <span class="console-highlights">Klaw</span>: Gain the captured Hero.`);
  if (klaw && klaw.capturedHero && klaw.capturedHero.length > 0) {
    const hero = klaw.capturedHero.pop();
    playerDiscardPile.push(hero);
    onscreenConsole.log(`You gained <span class="console-highlights">${hero.name}</span>.`);
    updateGameBoard();
    return;
  }
  onscreenConsole.log(`No captured Hero to gain.`);
}

// Mister Hyde — Fight: KO one of your Heroes.
function misterHydeFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Mister Hyde</span>: KO one of your Heroes.`);
  return FightKOHeroYouHave("Mister Hyde");
}

// === Dark Avengers ===

// Ares — Last Stand (keyword). Fight: KO one of your Heroes.
function aresFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Ares</span>: KO one of your Heroes.`);
  return FightKOHeroYouHave("Ares");
}

// Captain Marvel (Noh-Varr) — Last Stand. Ambush/Escape: if other Dark Avengers in city, wound.
async function captainMarvelNohVarrAmbush() {
  const otherDA = city.filter(v => v && v.team === "Dark Avengers" && v.name !== "Captain Marvel (Noh-Varr)");
  if (otherDA.length > 0) {
    onscreenConsole.log(`Ambush! <span class="console-highlights">Captain Marvel (Noh-Varr)</span>: Other Dark Avengers in the city. Gaining a Wound.`);
    await drawWound();
  } else {
    onscreenConsole.log(`Ambush! <span class="console-highlights">Captain Marvel (Noh-Varr)</span>: No other Dark Avengers in the city. No effect.`);
  }
}

async function captainMarvelNohVarrEscape() {
  onscreenConsole.log(`Escape! <span class="console-highlights">Captain Marvel (Noh-Varr)</span> escaped!`);
  const otherDA = city.filter(v => v && v.team === "Dark Avengers");
  if (otherDA.length > 0) {
    onscreenConsole.log(`Other Dark Avengers in the city. Gaining a Wound.`);
    await drawWound();
  }
}

// Dark Hawkeye (Bullseye) — Last Stand. Fight: KO one of your Heroes.
async function darkHawkeyeFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Dark Hawkeye (Bullseye)</span>: KO one of your Heroes.`);
  await FightKOHeroYouHave("Dark Hawkeye (Bullseye)");
}

// Dark Ms. Marvel (Moonstone) — Last Stand. Fight: "each other player" effect — solo skip.
function darkMsMarvelFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Dark Ms. Marvel (Moonstone)</span>: "Each other player" effect skipped in solo.`);
}

// Dark Spider-Man (Scorpion) — Double Last Stand. Fight: Reveal top 2, KO one cost <=2.
async function darkSpiderManFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Dark Spider-Man (Scorpion)</span>: Reveal top two cards of your deck.`);
  if (playerDeck.length === 0 && playerDiscardPile.length > 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  const revealed = [];
  for (let i = 0; i < 2 && playerDeck.length > 0; i++) {
    revealed.push(playerDeck.pop());
  }
  if (revealed.length === 0) {
    onscreenConsole.log(`No cards to reveal.`);
    return;
  }
  const koAble = revealed.filter(c => (c.cost || 0) <= 2);
  const names = revealed.map(c => `${c.name} (cost ${c.cost || 0})`).join(", ");
  onscreenConsole.log(`Revealed: ${names}.`);
  if (koAble.length > 0) {
    const toKO = koAble[0];
    koPile.push(toKO);
    const remaining = revealed.filter(c => c !== toKO);
    for (const c of remaining) playerDeck.push(c);
    onscreenConsole.log(`KO'd <span class="console-highlights">${toKO.name}</span> (cost ${toKO.cost}). Put the rest back.`);
  } else {
    for (const c of revealed.reverse()) playerDeck.push(c);
    onscreenConsole.log(`No card costs 2 or less. Put them back.`);
  }
  updateGameBoard();
}

// Dark Wolverine (Daken) — Last Stand. Ambush: reveal Instinct or wound.
// Escape: same + reshuffle Daken back into villain deck.
async function darkWolverineAmbush() {
  onscreenConsole.log(`Ambush! <span class="console-highlights">Dark Wolverine (Daken)</span>: Reveal an <img src="Visual Assets/Icons/Instinct.svg" alt="Instinct Icon" class="console-card-icons"> Hero or gain a Wound.`);
  await revealClassOrWound("Instinct", "Instinct.svg", "DARK WOLVERINE");
}

async function darkWolverineEscape(daken) {
  onscreenConsole.log(`Escape! <span class="console-highlights">Dark Wolverine (Daken)</span>: Reveal an <img src="Visual Assets/Icons/Instinct.svg" alt="Instinct Icon" class="console-card-icons"> Hero or gain a Wound, then shuffle back into Villain Deck.`);
  await revealClassOrWound("Instinct", "Instinct.svg", "DARK WOLVERINE");
  villainDeck.push(daken);
  villainDeck = shuffle(villainDeck);
  onscreenConsole.log(`<span class="console-highlights">Dark Wolverine (Daken)</span> shuffled back into the Villain Deck.`);
}

// Sentry — Fight: KO up to two from discard (only as The Void). Escape: wound.
async function sentryFight() {
  const sentryIdx = city.findIndex(v => v && v.name === "Sentry");
  const isVoid = sentryIdx === 1 || sentryIdx === 3;
  if (isVoid) {
    onscreenConsole.log(`Fight! <span class="console-highlights">The Void</span>: KO up to two cards from your discard pile.`);
    await koUpToNFromDiscardPile("The Void", 2);
  } else {
    onscreenConsole.log(`Fight! <span class="console-highlights">Sentry</span>: No fight effect (not The Void).`);
  }
}

async function sentryEscape() {
  onscreenConsole.log(`Escape! <span class="console-highlights">Sentry</span>: Gaining a Wound.`);
  await drawWound();
}

// Sentry's Watchtower (Location) — Fight: Gain the hero in the HQ space under this.
// TODO (Cluster D Batch 4 — NOT YET IMPLEMENTED): "Villains here get Last Stand" is unwired.
// revelationsVillainOwnAttack only reads each villain's OWN keywords; it does NOT detect a
// Sentry's Watchtower sharing the space, so the Last Stand grant never fires. When implemented it
// must go through attackFromOwnEffects (the attack-modifier pipeline), not card.attack.
function sentrysWatchtowerFight() {
  const wtIdx = typeof cityLocations !== "undefined"
    ? cityLocations.findIndex(loc => loc && loc.name === "Sentry's Watchtower")
    : -1;
  if (wtIdx !== -1 && hq[wtIdx]) {
    const hero = hq[wtIdx];
    playerDiscardPile.push(hero);
    hq[wtIdx] = heroDeck.length > 0 ? heroDeck.pop() : null;
    onscreenConsole.log(`Fight! <span class="console-highlights">Sentry's Watchtower</span>: Gained <span class="console-highlights">${hero.name}</span> from the HQ.`);
    updateGameBoard();
  } else {
    onscreenConsole.log(`Fight! <span class="console-highlights">Sentry's Watchtower</span>: No hero in the corresponding HQ space.`);
  }
}

// === Hood's Gang ===

// Cancer — Dark Memories (attack in updateVillainAttackValues). Ambush/Escape: if discard non-empty, wound.
async function cancerAmbush() {
  if (playerDiscardPile.length > 0) {
    onscreenConsole.log(`Ambush! <span class="console-highlights">Cancer</span>: You have cards in your discard pile. Gaining a Wound.`);
    await drawWound();
  } else {
    onscreenConsole.log(`Ambush! <span class="console-highlights">Cancer</span>: Your discard pile is empty. No effect.`);
  }
}

async function cancerEscape() {
  onscreenConsole.log(`Escape! <span class="console-highlights">Cancer</span> escaped!`);
  if (playerDiscardPile.length > 0) {
    onscreenConsole.log(`You have cards in your discard pile. Gaining a Wound.`);
    await drawWound();
  }
}

// Chemistro — Dark Memories. Fight: Exchange a played card with HQ card of same or lower cost.
async function chemistroFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Chemistro</span>: Exchange a played card with an HQ card of same or lower cost.`);
  const playedHeroes = cardsPlayedThisTurn.filter(c => c.type === "Hero" && !c.isCopied && !c.markedForDeletion && !c.isSimulation);
  if (playedHeroes.length === 0) {
    onscreenConsole.log(`No played Heroes to exchange.`);
    return;
  }
  const bestPlayed = playedHeroes.reduce((a, b) => (a.cost || 0) >= (b.cost || 0) ? a : b);
  const hqCards = typeof hq !== "undefined" ? hq : [];
  let bestHQIdx = -1;
  let bestHQCost = -1;
  for (let i = 0; i < hqCards.length; i++) {
    if (hqCards[i] && hqCards[i].cost <= bestPlayed.cost && hqCards[i].cost > bestHQCost) {
      bestHQIdx = i;
      bestHQCost = hqCards[i].cost;
    }
  }
  if (bestHQIdx === -1) {
    onscreenConsole.log(`No HQ card of cost <=${bestPlayed.cost} to swap.`);
    return;
  }
  const gained = hqCards[bestHQIdx];
  if (gameMode === "golden") {
    onscreenConsole.log(`Chemistro Fight: Exchange effect not supported in Golden Solo mode.`);
    return;
  }
  hqCards[bestHQIdx] = bestPlayed;
  playerDiscardPile.push(gained);
  const idx = cardsPlayedThisTurn.indexOf(bestPlayed);
  if (idx !== -1) cardsPlayedThisTurn.splice(idx, 1);
  onscreenConsole.log(`Exchanged <span class="console-highlights">${bestPlayed.name}</span> (cost ${bestPlayed.cost}) for <span class="console-highlights">${gained.name}</span> (cost ${gained.cost}).`);
  updateGameBoard();
}

// Madam Masque — Dark Memories. Ambush: guess type, if wrong play it. Fight: KO a hero.
async function madamMasqueAmbush() {
  if (villainDeck.length === 0) {
    onscreenConsole.log(`Ambush! <span class="console-highlights">Madam Masque</span>: Villain Deck is empty.`);
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton, extraButton } = showHeroAbilityMayPopup(
      `<span class="console-highlights">Madam Masque</span> Ambush! Guess the top card of the Villain Deck:`,
      "Villain",
      "Bystander",
      "Strike / Twist",
      true,
    );
    const t3 = document.querySelector(".info-or-choice-popup-title");
    if (t3) t3.textContent = "MADAM MASQUE";
    function handleGuess(guess) {
      closeInfoChoicePopup();
      const topCard = villainDeck[villainDeck.length - 1];
      const cardType = topCard.type || "Unknown";
      let correct = false;
      if (guess === "Villain" && (cardType === "Villain" || cardType === "Location")) correct = true;
      if (guess === "Bystander" && cardType === "Bystander") correct = true;
      if (guess === "Strike" && cardType === "Master Strike") correct = true;
      if (guess === "Twist" && cardType === "Scheme Twist") correct = true;
      onscreenConsole.log(`You guessed "${guess}". Top card: <span class="console-highlights">${topCard.name || cardType}</span> (${cardType}).`);
      if (correct) {
        onscreenConsole.log(`Correct! No penalty.`);
      } else {
        onscreenConsole.log(`Wrong! Playing that card from the Villain Deck.`);
        if (typeof processVillainCard === "function") {
          processVillainCard();
        }
      }
      resolve();
    }
    confirmButton.onclick = () => handleGuess("Villain");
    denyButton.onclick = () => handleGuess("Bystander");
    extraButton.onclick = function () {
      closeInfoChoicePopup();
      const { confirmButton: strikeBtn, denyButton: twistBtn } = showHeroAbilityMayPopup(
        `Strike or Twist?`, "Master Strike", "Scheme Twist",
      );
      strikeBtn.onclick = () => handleGuess("Strike");
      twistBtn.onclick = () => handleGuess("Twist");
    };
  });
}

async function madamMasqueFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Madam Masque</span>: KO one of your Heroes.`);
  await FightKOHeroYouHave("Madam Masque");
}

// The Brothers Grimm — Must discard two identical cards to fight. Fight: KO from discard.
async function brothersGrimmFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">The Brothers Grimm</span>: You may KO a card from your discard pile.`);
  await koUpToNFromDiscardPile("The Brothers Grimm", 1);
}

// The Dark Dimension (Location) — Villains here get Dark Memories (in updateVillainAttackValues).
// Fight: Take another turn after this one.
function theDarkDimensionFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">The Dark Dimension</span>: Take another turn after this one!`);
  // Extra turn flag — to be fully wired when extra-turn mechanism is implemented
}

// === Lethal Legion ===

// Carnival of Wonders (Location) — "each other player" triggered effect — solo skip.
function carnivalOfWondersFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Carnival of Wonders</span> defeated.`);
}

// Laser Maze (Location) — triggered: reveal Range or wound (handled by Location trigger system).
function laserMazeFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Laser Maze</span> defeated.`);
}

// Living Laser — +3 while "Maze" Location in city (in updateVillainAttackValues).
// Fight/Escape: reveal Range or wound.
async function livingLaserFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Living Laser</span>: Reveal a <img src="Visual Assets/Icons/Range.svg" alt="Range Icon" class="console-card-icons"> Hero or gain a Wound.`);
  await revealClassOrWound("Range", "Range.svg", "LIVING LASER");
}

async function livingLaserEscape() {
  onscreenConsole.log(`Escape! <span class="console-highlights">Living Laser</span>: Reveal a <img src="Visual Assets/Icons/Range.svg" alt="Range Icon" class="console-card-icons"> Hero or gain a Wound.`);
  await revealClassOrWound("Range", "Range.svg", "LIVING LASER");
}

// M'Baku — +3 while "Cult" Location in city. Fight/Escape: reveal hand, discard Tech.
function mbakuFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">M'Baku</span>: Discard a <img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> card from hand.`);
  const techCards = playerHand.filter(c => c.classes && c.classes.includes("Tech"));
  if (techCards.length > 0) {
    const card = techCards[0];
    playerHand.splice(playerHand.indexOf(card), 1);
    playerDiscardPile.push(card);
    onscreenConsole.log(`Discarded <span class="console-highlights">${card.name}</span>.`);
    updateGameBoard();
  } else {
    onscreenConsole.log(`No <img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> cards to discard.`);
  }
}

function mbakuEscape() {
  onscreenConsole.log(`Escape! <span class="console-highlights">M'Baku</span>: Discard a <img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> card from hand.`);
  const techCards = playerHand.filter(c => c.classes && c.classes.includes("Tech"));
  if (techCards.length > 0) {
    const card = techCards[0];
    playerHand.splice(playerHand.indexOf(card), 1);
    playerDiscardPile.push(card);
    onscreenConsole.log(`Discarded <span class="console-highlights">${card.name}</span>.`);
    updateGameBoard();
  } else {
    onscreenConsole.log(`No <img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> cards to discard.`);
  }
}

// Power Man (Erik Josten) — +3 while "Prison" in city. Escape: VP villain to escape or wound.
async function powerManEscape() {
  onscreenConsole.log(`Escape! <span class="console-highlights">Power Man (Erik Josten)</span>: Put a Villain from VP into Escape Pile or gain a Wound.`);
  const villainsInVP = victoryPile.filter(c => c.type === "Villain");
  if (villainsInVP.length === 0) {
    onscreenConsole.log(`No Villains in Victory Pile. Gaining a Wound.`);
    await drawWound();
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Put a Villain from VP into the Escape Pile, or gain a Wound?`,
      "Lose a Villain",
      "Gain Wound",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      const idx = victoryPile.findIndex(c => c.type === "Villain");
      if (idx !== -1) {
        const v = victoryPile.splice(idx, 1)[0];
        escapedVillainsDeck.push(v);
        onscreenConsole.log(`<span class="console-highlights">${v.name}</span> moved to the Escape Pile.`);
        updateGameBoard();
      }
      resolve();
    };
    denyButton.onclick = async function () {
      closeInfoChoicePopup();
      await drawWound();
      resolve();
    };
  });
}

// Swordsman — +3 while "Carnival" in city. Ambush: capture bystanders.
async function swordsmanAmbush(swordsman) {
  onscreenConsole.log(`Ambush! <span class="console-highlights">Swordsman</span>: Swordsman and each Location capture a Bystander.`);
  if (bystanderDeck.length > 0) {
    const bystander = bystanderDeck.pop();
    const swordsmanIdx = city.findIndex(c => c === swordsman);
    if (swordsmanIdx !== -1) {
      await villainEffectAttachBystanderToVillain(swordsmanIdx, bystander);
    }
  }
  if (typeof cityLocations !== "undefined") {
    for (let i = 0; i < cityLocations.length; i++) {
      if (cityLocations[i] && bystanderDeck.length > 0) {
        const bystander = bystanderDeck.pop();
        onscreenConsole.log(`<span class="console-highlights">${cityLocations[i].name}</span> captured a Bystander.`);
        if (!cityLocations[i].capturedBystanders) cityLocations[i].capturedBystanders = [];
        cityLocations[i].capturedBystanders.push(bystander);
      }
    }
  }
  updateGameBoard();
}

// "The Raft" Prison (Location) — triggered: VP villain to escape (handled by trigger system).
function theRaftPrisonFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">"The Raft" Prison</span> defeated.`);
}

// White Gorilla Cult (Location) — triggered: discard Tech (handled by trigger system).
function whiteGorillaCultFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">White Gorilla Cult</span> defeated.`);
}

// --- SCHEME TWIST EFFECTS ---

// Twist counter — tracks total twists across both sides of transforming schemes
let revelationsTwistCount = 0;

// === Earthquake Drains the Ocean / Tsunami Crushes the Coast ===

// Earthquake (Side A) Twist: The tide rushes in. Transform to Tsunami.
async function earthquakeDrainsTheOceanTwist() {
  revelationsTwistCount++;
  onscreenConsole.log(`Scheme Twist #${revelationsTwistCount}! The tide rushes in. Transforming to <span class="console-highlights">Tsunami Crushes the Coast</span>.`);
  transformScheme();
  // Tsunami: the two Low Tide spaces + Bridge + Streets (indices 0-3) are destroyed,
  // leaving Rooftops/Bank/Sewers (4,5,6) = 3 spaces. Occupants escape, left-to-right.
  onscreenConsole.log(`The coast floods — city spaces are destroyed. Villains in destroyed spaces escape!`);
  if (typeof resizeCityForScheme === "function") {
    await resizeCityForScheme([4, 5, 6]);
  }
}

// Tsunami (Side B) Twist: The tide rushes out. Transform back, then play another villain card.
async function tsunamiCrushesTheCoastTwist() {
  revelationsTwistCount++;
  onscreenConsole.log(`Scheme Twist #${revelationsTwistCount}! The tide rushes out. Transforming back to <span class="console-highlights">Earthquake Drains the Ocean</span>.`);
  transformScheme();
  // The tide recedes: all 7 spaces are restored to active.
  onscreenConsole.log(`City spaces restored. Playing another card from the Villain Deck.`);
  if (typeof resizeCityForScheme === "function") {
    await resizeCityForScheme([0, 1, 2, 3, 4, 5, 6]);
  }
  if (typeof processVillainCard === "function") {
    await processVillainCard();
  }
}

// === House of M / "No More Mutants" ===

// House of M (Side A) Twist: KO all non-X-Men Heroes from HQ. If 2+ Scarlet Witch in city, transform.
// Otherwise, play another villain card.
async function houseOfMTwist() {
  revelationsTwistCount++;
  onscreenConsole.log(`Scheme Twist #${revelationsTwistCount}! KO all non-X-Men Heroes from the HQ.`);
  const hqCards = typeof hq !== "undefined" ? hq : [];
  // Iterate BACKWARD: goldenRefillHQ (golden mode) splices slot i and shifts everything after it
  // left, so a forward loop's i++ would jump over the hero that slid into slot i and skip it.
  // Going high→low, splice only touches already-processed indices and pushes the new card at the
  // end (past the cursor) — pending indices (< i) are untouched, so every qualifier is KO'd. (M3)
  for (let i = hqCards.length - 1; i >= 0; i--) {
    if (hqCards[i] && hqCards[i].type === "Hero" && hqCards[i].team !== "X-Men") {
      onscreenConsole.log(`KO'd <span class="console-highlights">${hqCards[i].name}</span> from HQ.`);
      koPile.push(hqCards[i]);
      if (typeof goldenRefillHQ === "function" && gameMode === "golden") {
        hqCards[i] = null;
        goldenRefillHQ(i);
      } else {
        hqCards[i] = heroDeck.length > 0 ? heroDeck.pop() : null;
      }
    }
  }
  // Check for 2+ Scarlet Witch in city
  const scarletWitchCount = city.filter(v => v && v.name && v.name.includes("Scarlet Witch")).length;
  if (scarletWitchCount >= 2) {
    onscreenConsole.log(`${scarletWitchCount} Scarlet Witch cards in the city. Transforming to <span class="console-highlights">"No More Mutants"</span>.`);
    transformScheme();
  } else {
    onscreenConsole.log(`Fewer than 2 Scarlet Witch in city. Playing another card from the Villain Deck.`);
    if (typeof processVillainCard === "function") {
      await processVillainCard();
    }
  }
  updateGameBoard();
}

// "No More Mutants" (Side B) Twist: KO all X-Men Heroes from HQ. Play another villain card.
async function noMoreMutantsTwist() {
  revelationsTwistCount++;
  onscreenConsole.log(`Scheme Twist #${revelationsTwistCount}! KO all X-Men Heroes from the HQ.`);
  const hqCards = typeof hq !== "undefined" ? hq : [];
  // Iterate BACKWARD — same reason as houseOfMTwist: goldenRefillHQ splices+shifts, so a forward
  // loop would skip the hero that slides into the just-cleared slot. (M3)
  for (let i = hqCards.length - 1; i >= 0; i--) {
    if (hqCards[i] && hqCards[i].type === "Hero" && hqCards[i].team === "X-Men") {
      onscreenConsole.log(`KO'd <span class="console-highlights">${hqCards[i].name}</span> from HQ.`);
      koPile.push(hqCards[i]);
      if (typeof goldenRefillHQ === "function" && gameMode === "golden") {
        hqCards[i] = null;
        goldenRefillHQ(i);
      } else {
        hqCards[i] = heroDeck.length > 0 ? heroDeck.pop() : null;
      }
    }
  }
  onscreenConsole.log(`Playing another card from the Villain Deck.`);
  if (typeof processVillainCard === "function") {
    await processVillainCard();
  }
  updateGameBoard();
}

// === Secret HYDRA Corruption / Open HYDRA Revolution ===

// Track officers placed next to scheme
let hydraOfficersNextToScheme = 0;

// Secret HYDRA (Side A) Twist: For each twist in KO pile (including this one),
// put an Officer next to scheme. Then transform.
async function secretHydraCorruptionTwist() {
  revelationsTwistCount++;
  // Count twists in KO pile
  // The engine (handleSchemeTwist, script.js:5887) pushes this twist to koPile BEFORE the effect
  // runs, so the filter already counts "this one" — do NOT add +1 (would double-count). (PT-4 fix.)
  const twistsInKO = koPile.filter(c => c.type === "Scheme Twist").length;
  onscreenConsole.log(`Scheme Twist #${revelationsTwistCount}! ${twistsInKO} Twist(s) in KO pile (including this one).`);
  hydraOfficersNextToScheme += twistsInKO;
  onscreenConsole.log(`${hydraOfficersNextToScheme} S.H.I.E.L.D. Officers now next to the Scheme.`);
  onscreenConsole.log(`Transforming to <span class="console-highlights">Open HYDRA Revolution</span>.`);
  transformScheme();
}

// Open HYDRA (Side B) Twist: Same officer placement, then transform back if evil hasn't won.
async function openHydraRevolutionTwist() {
  revelationsTwistCount++;
  // The engine (handleSchemeTwist, script.js:5887) pushes this twist to koPile BEFORE the effect
  // runs, so the filter already counts "this one" — do NOT add +1 (would double-count). (PT-4 fix.)
  const twistsInKO = koPile.filter(c => c.type === "Scheme Twist").length;
  onscreenConsole.log(`Scheme Twist #${revelationsTwistCount}! ${twistsInKO} Twist(s) in KO pile. Adding Officers.`);
  hydraOfficersNextToScheme += twistsInKO;
  onscreenConsole.log(`${hydraOfficersNextToScheme} S.H.I.E.L.D. Officers now next to the Scheme.`);
  if (hydraOfficersNextToScheme >= 15) {
    onscreenConsole.log(`15+ Officers next to Scheme. Evil Wins!`);
    // Evil wins will be checked by the endGame system
  } else {
    onscreenConsole.log(`Transforming back to <span class="console-highlights">Secret HYDRA Corruption</span>.`);
    transformScheme();
  }
}

// === The Korvac Saga / Korvac Revealed ===

// Korvac Saga (Side A) Twist: Discard down to 4 cards or KO a bystander from VP. Transform.
async function theKorvacSagaTwist() {
  revelationsTwistCount++;
  onscreenConsole.log(`Scheme Twist #${revelationsTwistCount}! Discard down to four cards or KO a Bystander from your Victory Pile.`);
  return new Promise((resolve) => {
    const handInfo = playerHand.length > 4
      ? `Discard to 4 (discard ${playerHand.length - 4} card${playerHand.length - 4 !== 1 ? "s" : ""})`
      : `Discard to 4 (hand already at ${playerHand.length})`;
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Korvac Twist: Choose — discard down to 4 cards in hand, or KO a Bystander from your Victory Pile.`,
      handInfo,
      "KO Bystander",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      if (playerHand.length > 4) {
        while (playerHand.length > 4) {
          const card = playerHand.pop();
          playerDiscardPile.push(card);
          onscreenConsole.log(`Discarded <span class="console-highlights">${card.name}</span>.`);
        }
      } else {
        onscreenConsole.log(`Hand already at 4 or fewer — no discard needed.`);
      }
      onscreenConsole.log(`Transforming to <span class="console-highlights">Korvac Revealed</span>.`);
      transformScheme();
      updateGameBoard();
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      const bystanders = victoryPile.filter(c => c.type === "Bystander");
      if (bystanders.length > 0) {
        const b = bystanders[0];
        victoryPile.splice(victoryPile.indexOf(b), 1);
        koPile.push(b);
        onscreenConsole.log(`KO'd a Bystander from Victory Pile.`);
      } else {
        onscreenConsole.log(`No Bystanders in Victory Pile to KO.`);
      }
      onscreenConsole.log(`Transforming to <span class="console-highlights">Korvac Revealed</span>.`);
      transformScheme();
      updateGameBoard();
      resolve();
    };
  });
}

// Korvac Revealed (Side B) Twist:
// Even-numbered twists (2,4,6): discard Avengers Hero or wound, then transform back.
// Twist 8: Evil Wins!
async function korvacRevealedTwist() {
  revelationsTwistCount++;
  onscreenConsole.log(`Scheme Twist #${revelationsTwistCount}!`);
  if (revelationsTwistCount >= 8) {
    onscreenConsole.log(`Twist 8: Evil Wins! <span class="console-highlights">Korvac</span> has triumphed!`);
    // Evil wins handled by endGame check
    return;
  }
  if (revelationsTwistCount % 2 === 0) {
    // Even twist: discard Avengers or wound
    const avengersHeroes = playerHand.filter(c => c.type === "Hero" && c.team === "Avengers");
    if (avengersHeroes.length > 0) {
      const card = avengersHeroes[0];
      playerHand.splice(playerHand.indexOf(card), 1);
      playerDiscardPile.push(card);
      onscreenConsole.log(`Discarded <span class="console-highlights">${card.name}</span> (Avengers Hero).`);
    } else {
      onscreenConsole.log(`No Avengers Heroes in hand. Gaining a Wound.`);
      await drawWound();
    }
    onscreenConsole.log(`Transforming back to <span class="console-highlights">The Korvac Saga</span>.`);
    transformScheme();
  } else {
    // Odd twist on Side B — transform back without penalty
    onscreenConsole.log(`Transforming back to <span class="console-highlights">The Korvac Saga</span>.`);
    transformScheme();
  }
  updateGameBoard();
}

// --- MASTERMIND EFFECTS ---

// === Grim Reaper ===

// Master Strike (Normal): enters city as a 7 Attack "Graveyard" Location,
// +2 Attack while villain here, worth 5VP.
async function grimReaperStrike() {
  onscreenConsole.log(`Master Strike! A 7 Attack <span class="console-highlights">Graveyard</span> Location enters the city (+2 Attack while a Villain is here). Worth 5VP.`);
  // Create a Graveyard Location card and place it
  if (typeof cityLocations !== "undefined") {
    const graveyard = {
      name: "Graveyard",
      type: "Location",
      attack: 7,
      originalAttack: 7,
      victoryPoints: 5,
      fightEffect: "None",
      team: "Lethal Legion",
      keywords: [],
      classes: [],
      image: "Visual Assets/Masterminds/Revelations_GrimReaper.webp",
      bonusWhileVillain: 2,
    };
    if (typeof placeLocation === "function") {
      await placeLocation(graveyard);
    }
  }
}

// Master Strike (Epic): 8 Attack Graveyard, +3 bonus, 6VP.
// If 3+ Locations in city, each player gains a Wound.
async function epicGrimReaperStrike() {
  onscreenConsole.log(`Epic Master Strike! An 8 Attack <span class="console-highlights">Graveyard</span> Location enters the city (+3 Attack while a Villain is here). Worth 6VP.`);
  if (typeof cityLocations !== "undefined") {
    const graveyard = {
      name: "Graveyard",
      type: "Location",
      attack: 8,
      originalAttack: 8,
      victoryPoints: 6,
      fightEffect: "None",
      team: "Lethal Legion",
      keywords: [],
      classes: [],
      image: "Visual Assets/Masterminds/Revelations_GrimReaper_Epic.webp",
      bonusWhileVillain: 3,
    };
    if (typeof placeLocation === "function") {
      await placeLocation(graveyard);
    }
    // Check for 3+ Locations
    const locationCount = cityLocations.filter(loc => loc !== null).length;
    if (locationCount >= 3) {
      onscreenConsole.log(`3+ Locations in the city. Gaining a Wound.`);
      await drawWound();
    }
  }
}

// Grim Reaper Tactics — all 4 become Locations when fought

async function grimReaperCarnivalOfConcussions() {
  onscreenConsole.log(`Tactic Fight! <span class="console-highlights">Carnival of Concussions</span>: Draw three cards.`);
  drawCard(); drawCard(); drawCard();
  // Becomes a Location: "Whenever you fight a Villain here, each other player KOs a Bystander from VP."
  onscreenConsole.log(`This Tactic enters the city as a Location.`);
  if (typeof placeLocation === "function") {
    await placeLocation({
      name: "Carnival of Concussions",
      type: "Location",
      attack: 8,
      originalAttack: 8,
      victoryPoints: 6,
      fightEffect: "None",
      team: "Lethal Legion",
      keywords: [],
      classes: [],
      image: "Visual Assets/Masterminds/Revelations_GrimReaper_CarnivalOfConcussions.webp",
      triggeredAbility: "carnivalOfConcussionsTrigger",
    });
  }
}

async function grimReaperCultOfSkulls() {
  onscreenConsole.log(`Tactic Fight! <span class="console-highlights">Cult of Skulls</span>: KO up to two cards from your discard pile.`);
  await koUpToNFromDiscardPile("Cult of Skulls", 2);
  onscreenConsole.log(`This Tactic enters the city as a Location.`);
  if (typeof placeLocation === "function") {
    await placeLocation({
      name: "Cult of Skulls",
      type: "Location",
      attack: 8,
      originalAttack: 8,
      victoryPoints: 6,
      fightEffect: "None",
      team: "Lethal Legion",
      keywords: [],
      classes: [],
      image: "Visual Assets/Masterminds/Revelations_GrimReaper_CultOfSkulls.webp",
      triggeredAbility: "cultOfSkullsTrigger",
    });
  }
}

async function grimReaperMazeOfBones() {
  onscreenConsole.log(`Tactic Fight! <span class="console-highlights">Maze of Bones</span>: Look at the top four cards of your deck. KO any number, put the rest back.`);
  await revealTopNKOAny("Maze of Bones", 4);
  onscreenConsole.log(`This Tactic enters the city as a Location.`);
  if (typeof placeLocation === "function") {
    await placeLocation({
      name: "Maze of Bones",
      type: "Location",
      attack: 8,
      originalAttack: 8,
      victoryPoints: 6,
      fightEffect: "None",
      team: "Lethal Legion",
      keywords: [],
      classes: [],
      image: "Visual Assets/Masterminds/Revelations_GrimReaper_MazeOfBones.webp",
      triggeredAbility: "mazeOfBonesTrigger",
    });
  }
}

async function grimReaperPrisonOfCoffins() {
  onscreenConsole.log(`Tactic Fight! <span class="console-highlights">Prison of Coffins</span>: You get +5 <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons">.`);
  totalRecruitPoints += 5;
  cumulativeRecruitPoints += 5;
  updateGameBoard();
  onscreenConsole.log(`This Tactic enters the city as a Location.`);
  if (typeof placeLocation === "function") {
    await placeLocation({
      name: "Prison of Coffins",
      type: "Location",
      attack: 8,
      originalAttack: 8,
      victoryPoints: 6,
      fightEffect: "None",
      team: "Lethal Legion",
      keywords: [],
      classes: [],
      image: "Visual Assets/Masterminds/Revelations_GrimReaper_PrisonOfCoffins.webp",
      triggeredAbility: "prisonOfCoffinsTrigger",
    });
  }
}

// === Mandarin ===

// Picker: if multiple Mandarin's Rings are in Victory Pile, show a card-choice
// popup for the player to pick which one returns. If only one, auto-pick.
// Splices the chosen ring from victoryPile and returns it, or null if none exist.
function pickRingFromVictoryPile(titleLabel) {
  return new Promise((resolve) => {
    const ringIndices = [];
    victoryPile.forEach((c, i) => {
      if (c && c.team === "Mandarin's Rings") ringIndices.push(i);
    });
    if (ringIndices.length === 0) {
      resolve(null);
      return;
    }
    if (ringIndices.length === 1) {
      const ring = victoryPile.splice(ringIndices[0], 1)[0];
      resolve(ring);
      return;
    }

    const rings = ringIndices.map((vpIdx) => ({ ...victoryPile[vpIdx], vpIndex: vpIdx }));
    genericCardSort(rings);

    const cardchoicepopup = document.querySelector(".card-choice-popup");
    const modalOverlay = document.getElementById("modal-overlay");
    const selectionRow1 = document.querySelector(".card-choice-popup-selectionrow1");
    const previewElement = document.querySelector(".card-choice-popup-preview");
    const titleElement = document.querySelector(".card-choice-popup-title");
    const instructionsElement = document.querySelector(".card-choice-popup-instructions");

    titleElement.textContent = titleLabel;
    instructionsElement.textContent = "Choose a Mandarin's Ring to return to the city.";

    document.querySelector(".card-choice-popup-selectionrow1label").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2label").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2-container").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.height = "50%";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.top = "28%";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.transform = "translateY(-50%)";
    document.querySelector(".card-choice-popup-closebutton").style.display = "none";

    selectionRow1.textContent = "";
    previewElement.textContent = "";
    previewElement.style.backgroundColor = "var(--panel-backgrounds)";

    let selected = null;
    setupIndependentScrollGradients(selectionRow1, null);

    const confirmButton = document.getElementById("card-choice-popup-confirm");
    const otherChoiceButton = document.getElementById("card-choice-popup-otherchoice");
    const noThanksButton = document.getElementById("card-choice-popup-nothanks");
    confirmButton.textContent = "RETURN RING";
    confirmButton.disabled = true;
    otherChoiceButton.style.display = "none";
    noThanksButton.style.display = "none";

    rings.forEach((ring) => {
      const cardElement = document.createElement("div");
      cardElement.className = "popup-card";
      cardElement.setAttribute("data-vp-index", ring.vpIndex);

      const cardImage = document.createElement("img");
      cardImage.src = ring.image;
      cardImage.alt = ring.name;
      cardImage.className = "popup-card-image";

      cardElement.addEventListener("mouseover", () => {
        previewElement.textContent = "";
        const previewImage = document.createElement("img");
        previewImage.src = ring.image;
        previewImage.alt = ring.name;
        previewImage.className = "popup-card-preview-image";
        previewElement.appendChild(previewImage);
        previewElement.style.backgroundColor = "var(--accent)";
      });

      cardElement.addEventListener("click", () => {
        selectionRow1.querySelectorAll("img.selected").forEach((img) => img.classList.remove("selected"));
        if (selected && selected.vpIndex === ring.vpIndex) {
          selected = null;
          confirmButton.disabled = true;
        } else {
          selected = ring;
          cardImage.classList.add("selected");
          confirmButton.disabled = false;
        }
      });

      cardElement.appendChild(cardImage);
      selectionRow1.appendChild(cardElement);
    });

    setupDragScrolling(selectionRow1);

    confirmButton.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (!selected) return;
      setTimeout(() => {
        const ring = victoryPile.splice(selected.vpIndex, 1)[0];
        closeCardChoicePopup();
        resolve(ring);
      }, 100);
    };

    modalOverlay.style.display = "block";
    cardchoicepopup.style.display = "block";
  });
}

// Master Strike (Normal): put a Ring from VP into city (player chooses if 2+),
// or gain a Wound. Uses enterCityFromRight so placement matches normal villain
// draws (Sewers entry, shift left, escape overflow) and ambush does NOT re-fire.
async function mandarinStrike() {
  const hasRings = victoryPile.some((c) => c && c.team === "Mandarin's Rings");
  if (!hasRings) {
    onscreenConsole.log(`Master Strike! You have no Mandarin's Rings in your Victory Pile. Gaining a Wound.`);
    await drawWound();
    return;
  }
  const ring = await pickRingFromVictoryPile("Master Strike — Return a Ring");
  if (!ring) return;
  onscreenConsole.log(`Master Strike! <span class="console-highlights">${ring.name}</span> returns from your Victory Pile to the city.`);
  await enterCityFromRight(ring);
  updateGameBoard();
}

// Master Strike (Epic): same as normal, but wound goes on top of deck.
async function epicMandarinStrike() {
  const hasRings = victoryPile.some((c) => c && c.team === "Mandarin's Rings");
  if (!hasRings) {
    onscreenConsole.log(`Epic Master Strike! No Rings in VP. Gaining a Wound to the top of your deck.`);
    if (woundDeck.length > 0) {
      const wound = woundDeck.pop();
      playerDeck.push(wound);
      onscreenConsole.log(`Wound placed on top of your deck.`);
      updateGameBoard();
    }
    return;
  }
  const ring = await pickRingFromVictoryPile("Epic Master Strike — Return a Ring");
  if (!ring) return;
  onscreenConsole.log(`Epic Master Strike! <span class="console-highlights">${ring.name}</span> returns from your Victory Pile to the city.`);
  await enterCityFromRight(ring);
  updateGameBoard();
}

// Mandarin Tactics

function mandarinCirclesUnbroken() {
  const ringCount = victoryPile.filter(c => c.team === "Mandarin's Rings").length;
  onscreenConsole.log(`Tactic Fight! <span class="console-highlights">Circles Unbroken</span>: Draw ${ringCount} card(s) (one per Ring in VP).`);
  for (let i = 0; i < ringCount; i++) drawCard();
}

async function mandarinDragonOfHeavenSpaceship() {
  onscreenConsole.log(`Tactic Fight! <span class="console-highlights">Dragon of Heaven Spaceship</span>: KO up to two of your Heroes.`);
  await koUpToNHeroesYouHave("Dragon of Heaven Spaceship", 2);
  onscreenConsole.log(`This Tactic enters the city as a Location.`);
  if (typeof placeLocation === "function") {
    await placeLocation({
      name: "Dragon of Heaven Spaceship",
      type: "Location",
      attack: 9,
      originalAttack: 9,
      victoryPoints: 6,
      fightEffect: "mandarinDragonOfHeavenSpaceshipLocationFight",
      team: "Mandarin's Rings",
      keywords: [],
      classes: [],
      image: "Visual Assets/Masterminds/Revelations_Mandarin_DragonOfHeavenSpaceship.webp",
      triggeredAbility: "dragonOfHeavenTrigger",
    });
  }
}

async function mandarinDragonOfHeavenSpaceshipLocationFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Dragon of Heaven Spaceship</span> Location: KO up to two of your Heroes.`);
  await koUpToNHeroesYouHave("Dragon of Heaven Spaceship (Location)", 2);
}

async function mandarinIntertwiningPowers() {
  // "Each other player" without 2 Rings gains wound — in solo, check yourself
  const ringCount = victoryPile.filter(c => c.team === "Mandarin's Rings").length;
  if (ringCount < 2) {
    onscreenConsole.log(`Tactic Fight! <span class="console-highlights">Intertwining Powers</span>: You have fewer than 2 Rings in VP. Gaining a Wound.`);
    await drawWound();
  } else {
    onscreenConsole.log(`Tactic Fight! <span class="console-highlights">Intertwining Powers</span>: You have ${ringCount} Rings — no penalty.`);
  }
}

async function mandarinRingsSeekTheirTrueHand() {
  onscreenConsole.log(`Tactic Fight! <span class="console-highlights">Rings Seek Their True Hand</span>: Reveal a <img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> Hero or put a Ring from VP into the Escape Pile.`);
  const cardsYouHave = [...playerHand, ...cardsPlayedThisTurn.filter(c => !c.isCopied && !c.markedForDeletion && !c.isSimulation)];
  const hasTech = cardsYouHave.some(c => c.classes && c.classes.includes("Tech"));
  if (hasTech) {
    onscreenConsole.log(`You revealed a <img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> Hero.`);
    return;
  }
  const rings = victoryPile.filter(c => c.team === "Mandarin's Rings");
  if (rings.length > 0) {
    const ring = rings[0];
    const idx = victoryPile.indexOf(ring);
    victoryPile.splice(idx, 1);
    escapedVillainsDeck.push(ring);
    onscreenConsole.log(`<span class="console-highlights">${ring.name}</span> moved from VP to the Escape Pile.`);
    updateGameBoard();
  } else {
    onscreenConsole.log(`No Tech Hero and no Rings in VP.`);
  }
}

// === The Hood ===

// Master Strike (Normal): reveal top 6, discard all non-grey Heroes, put rest back.
async function theHoodStrike() {
  onscreenConsole.log(`Master Strike! Reveal the top 6 cards of your deck, discard all non-grey Heroes.`);
  if (playerDeck.length === 0 && playerDiscardPile.length > 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  const revealed = [];
  for (let i = 0; i < 6 && playerDeck.length > 0; i++) {
    revealed.push(playerDeck.pop());
  }
  const nonGrey = revealed.filter(c => c.type === "Hero" && c.color !== "Grey");
  const rest = revealed.filter(c => !(c.type === "Hero" && c.color !== "Grey"));
  for (const c of nonGrey) {
    playerDiscardPile.push(c);
    onscreenConsole.log(`Discarded <span class="console-highlights">${c.name}</span>.`);
  }
  // Put rest back on top in any order
  for (const c of rest.reverse()) {
    playerDeck.push(c);
  }
  onscreenConsole.log(`Discarded ${nonGrey.length} non-grey Hero(es). Put ${rest.length} card(s) back on top.`);
  updateGameBoard();
}

// Master Strike (Epic): discard entire deck, shuffle 6 random grey cards to form new deck.
async function epicHoodStrike() {
  onscreenConsole.log(`Epic Master Strike! Discard your entire deck, then shuffle 6 random grey cards from discard to form your new deck.`);
  // Move entire deck to discard
  while (playerDeck.length > 0) {
    playerDiscardPile.push(playerDeck.pop());
  }
  // Pick 6 random grey cards from discard
  const greyCards = playerDiscardPile.filter(c => c.color === "Grey");
  const newDeck = [];
  for (let i = 0; i < 6 && greyCards.length > 0; i++) {
    const randIdx = Math.floor(Math.random() * greyCards.length);
    const card = greyCards.splice(randIdx, 1)[0];
    const discIdx = playerDiscardPile.indexOf(card);
    if (discIdx !== -1) playerDiscardPile.splice(discIdx, 1);
    newDeck.push(card);
  }
  playerDeck = shuffle(newDeck);
  onscreenConsole.log(`New deck formed with ${playerDeck.length} grey card(s). Remaining discard: ${playerDiscardPile.length} cards.`);
  updateGameBoard();
}

// Hood Tactics

function theHoodDemonicRevelation() {
  // "Each other player reveals hand and discards a non-grey Hero" — solo: do it to yourself
  onscreenConsole.log(`Tactic Fight! <span class="console-highlights">Demonic Revelation</span>: Discard a non-grey Hero from your hand.`);
  const nonGreyHeroes = playerHand.filter(c => c.type === "Hero" && c.color !== "Grey");
  if (nonGreyHeroes.length > 0) {
    const card = nonGreyHeroes[0];
    playerHand.splice(playerHand.indexOf(card), 1);
    playerDiscardPile.push(card);
    onscreenConsole.log(`Discarded <span class="console-highlights">${card.name}</span>.`);
    updateGameBoard();
  } else {
    onscreenConsole.log(`No non-grey Heroes in hand.`);
  }
}

async function theHoodFocusMagicThroughGuns() {
  // "Each other player" — solo: apply to yourself
  onscreenConsole.log(`Tactic Fight! <span class="console-highlights">Focus Magic Through Guns</span>: Reveal a <img src="Visual Assets/Icons/Covert.svg" alt="Covert Icon" class="console-card-icons"> Hero or discard a card. Then reveal a <img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> Hero or gain a Wound.`);
  await revealClassOrDiscard("Covert", "Covert.svg", "FOCUS MAGIC THROUGH GUNS");
  await revealClassOrWound("Tech", "Tech.svg", "FOCUS MAGIC THROUGH GUNS");
}

function theHoodPaeanToDormammu() {
  // "Each other player discards their deck" — solo: discard your own deck
  onscreenConsole.log(`Tactic Fight! <span class="console-highlights">Paean to Dormammu</span>: Discard your entire deck.`);
  while (playerDeck.length > 0) {
    playerDiscardPile.push(playerDeck.pop());
  }
  onscreenConsole.log(`Deck discarded (${playerDiscardPile.length} cards now in discard).`);
  updateGameBoard();
}

async function theHoodWarehouse() {
  onscreenConsole.log(`Tactic Fight! <span class="console-highlights">The Hood's Warehouse</span>: Rescue 4 Bystanders.`);
  for (let i = 0; i < 4; i++) {
    if (bystanderDeck.length > 0) {
      const bystander = bystanderDeck.pop();
      victoryPile.push(bystander);
      onscreenConsole.log(`Rescued a <span class="console-highlights">Bystander</span>.`);
    }
  }
  updateGameBoard();
  onscreenConsole.log(`This Tactic enters the city as a Location.`);
  if (typeof placeLocation === "function") {
    await placeLocation({
      name: "The Hood's Warehouse",
      type: "Location",
      attack: 9,
      originalAttack: 9,
      victoryPoints: 6,
      fightEffect: "None",
      team: "Hood's Gang",
      keywords: [],
      classes: [],
      image: "Visual Assets/Masterminds/Revelations_TheHood_TheHoodsWarehouse.webp",
      triggeredAbility: "hoodsWarehouseTrigger",
    });
  }
}

// === Location "Whenever you fight a Villain here" triggered abilities ===
// The engine fires window[location.triggeredAbility](locationCard, cityIndex) from
// defeatVillain() (script.js) after a Villain sharing this Location's city space is defeated.
// 10 of the 11 Revelations Location triggers are "each other player ..." effects; the Revelations
// solo rule says these apply to YOU in 1-player solo. They are being converted from the old
// announce-and-skip to true self-apply, staged by group (GP-3a/b done; GP-3c/d pending). Triggers
// not yet converted still use announceOtherPlayerLocationTrigger (announce + skip) as an interim.
// The Hood's Warehouse (the 11th) is not an each-other-player effect — it plays a Villain card.

const RANGE_ICON = `<img src="Visual Assets/Icons/Range.svg" alt="Range Icon" class="console-card-icons">`;
const TECH_ICON = `<img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons">`;

// Shared announce-and-skip helper for the not-yet-converted "each other player" Location triggers.
function announceOtherPlayerLocationTrigger(name, effectText) {
  onscreenConsole.log(
    `<span class="console-highlights">${name}</span> triggers — "${effectText}" No other players in solo — skipped.`,
  );
}

// Settled non-grey predicate (GP-3, rule 8): a "non-grey" card is anything that is NOT a basic grey
// S.H.I.E.L.D. card (color "Grey") and NOT a Wound (Wounds count as grey — their color is "None").
// Matches the inventory ("non-grey card", revelations.md:569) + core-game convention. Intentionally
// stricter than epicHoodStrike's color==="Grey"-only grey filter (which omits Wounds — deferred M2).
function isNonGreyCard(c) {
  return !!c && c.color !== "Grey" && c.type !== "Wound" && c.name !== "Wound";
}

// GP-3b solo self-apply helper for Location triggers "reveals their hand and discards a <X> card".
// In 1-player solo "each other player" → you. Reveals your hand (a formality solo), then discards one
// matching card from hand: nothing if none qualify, auto if exactly one, player-picker if 2+ (per the
// 2026-05-28 "present choices" triage). `predicate(card)` selects qualifying cards; `descrText` is the
// human label of what's being discarded (e.g. "a non-grey card"). Returns a Promise; callers await.
function revealHandDiscardMatching(predicate, label, descrText) {
  return new Promise((resolve) => {
    // Caller (the trigger fn) emits the rich announce with the class icon; descrText here is plain
    // text, safe for textContent in the picker instruction and the no-match / discard log lines.
    const matchIndices = [];
    playerHand.forEach((c, i) => { if (c && predicate(c)) matchIndices.push(i); });

    if (matchIndices.length === 0) {
      onscreenConsole.log(`No ${descrText} in hand — nothing to discard.`);
      resolve();
      return;
    }
    if (matchIndices.length === 1) {
      const card = playerHand.splice(matchIndices[0], 1)[0];
      playerDiscardPile.push(card);
      onscreenConsole.log(`Discarded <span class="console-highlights">${card.name}</span>.`);
      updateGameBoard();
      resolve();
      return;
    }

    // 2+ qualifying cards → single-select picker (modeled on pickRingFromVictoryPile).
    const matches = matchIndices.map((i) => ({ ...playerHand[i], handIndex: i }));
    genericCardSort(matches);

    const cardchoicepopup = document.querySelector(".card-choice-popup");
    const modalOverlay = document.getElementById("modal-overlay");
    const selectionRow1 = document.querySelector(".card-choice-popup-selectionrow1");
    const previewElement = document.querySelector(".card-choice-popup-preview");
    const titleElement = document.querySelector(".card-choice-popup-title");
    const instructionsElement = document.querySelector(".card-choice-popup-instructions");
    if (!cardchoicepopup || !modalOverlay || !selectionRow1 || !titleElement || !instructionsElement) {
      // Defensive: if the popup DOM is unexpectedly absent, fall back to discarding the first match.
      const card = playerHand.splice(matchIndices[0], 1)[0];
      playerDiscardPile.push(card);
      onscreenConsole.log(`Discarded <span class="console-highlights">${card.name}</span>.`);
      updateGameBoard();
      resolve();
      return;
    }

    titleElement.textContent = label;
    instructionsElement.textContent = `Choose ${descrText} to discard.`;

    document.querySelector(".card-choice-popup-selectionrow1label").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2label").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2-container").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.height = "50%";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.top = "28%";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.transform = "translateY(-50%)";
    document.querySelector(".card-choice-popup-closebutton").style.display = "none";

    selectionRow1.textContent = "";
    previewElement.textContent = "";
    previewElement.style.backgroundColor = "var(--panel-backgrounds)";

    let selected = null;
    setupIndependentScrollGradients(selectionRow1, null);

    const confirmButton = document.getElementById("card-choice-popup-confirm");
    const otherChoiceButton = document.getElementById("card-choice-popup-otherchoice");
    const noThanksButton = document.getElementById("card-choice-popup-nothanks");
    confirmButton.textContent = "DISCARD";
    confirmButton.disabled = true;
    otherChoiceButton.style.display = "none";
    noThanksButton.style.display = "none";

    matches.forEach((entry) => {
      const cardElement = document.createElement("div");
      cardElement.className = "popup-card";
      cardElement.setAttribute("data-hand-index", entry.handIndex);

      const cardImage = document.createElement("img");
      cardImage.src = entry.image;
      cardImage.alt = entry.name;
      cardImage.className = "popup-card-image";

      cardElement.addEventListener("mouseover", () => {
        previewElement.textContent = "";
        const previewImage = document.createElement("img");
        previewImage.src = entry.image;
        previewImage.alt = entry.name;
        previewImage.className = "popup-card-preview-image";
        previewElement.appendChild(previewImage);
        previewElement.style.backgroundColor = "var(--accent)";
      });

      cardElement.addEventListener("click", () => {
        selectionRow1.querySelectorAll("img.selected").forEach((img) => img.classList.remove("selected"));
        if (selected && selected.handIndex === entry.handIndex) {
          selected = null;
          confirmButton.disabled = true;
        } else {
          selected = entry;
          cardImage.classList.add("selected");
          confirmButton.disabled = false;
        }
      });

      cardElement.appendChild(cardImage);
      selectionRow1.appendChild(cardElement);
    });

    setupDragScrolling(selectionRow1);

    confirmButton.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (!selected) return;
      setTimeout(() => {
        const card = playerHand.splice(selected.handIndex, 1)[0];
        playerDiscardPile.push(card);
        onscreenConsole.log(`Discarded <span class="console-highlights">${card.name}</span>.`);
        closeCardChoicePopup();
        updateGameBoard();
        resolve();
      }, 100);
    };

    modalOverlay.style.display = "block";
    cardchoicepopup.style.display = "block";
  });
}

// GP-3c shared picker: move one Victory-Pile card of `cardType` to a destination pile (via destPush,
// a callback so it always targets the live global array even if reassigned). 0 eligible → noneMsg +
// resolve; 1 → auto-move; 2+ → single-select picker (modeled on pickRingFromVictoryPile). actionVerb
// is the past-tense log lead (e.g. "KO'd", "Moved to the Escape Pile:"). Returns a Promise; await it.
function moveOneFromVictoryPile(cardType, destPush, label, actionVerb, noneMsg) {
  return new Promise((resolve) => {
    const indices = [];
    victoryPile.forEach((c, i) => { if (c && c.type === cardType) indices.push(i); });

    if (indices.length === 0) {
      onscreenConsole.log(noneMsg);
      resolve();
      return;
    }
    if (indices.length === 1) {
      const card = victoryPile.splice(indices[0], 1)[0];
      destPush(card);
      onscreenConsole.log(`${actionVerb} <span class="console-highlights">${card.name}</span>.`);
      updateGameBoard();
      resolve();
      return;
    }

    const choices = indices.map((vpIdx) => ({ ...victoryPile[vpIdx], vpIndex: vpIdx }));
    genericCardSort(choices);

    const cardchoicepopup = document.querySelector(".card-choice-popup");
    const modalOverlay = document.getElementById("modal-overlay");
    const selectionRow1 = document.querySelector(".card-choice-popup-selectionrow1");
    const previewElement = document.querySelector(".card-choice-popup-preview");
    const titleElement = document.querySelector(".card-choice-popup-title");
    const instructionsElement = document.querySelector(".card-choice-popup-instructions");
    if (!cardchoicepopup || !modalOverlay || !selectionRow1 || !titleElement || !instructionsElement) {
      // Defensive: popup DOM unexpectedly absent → move the first eligible card and resolve.
      const card = victoryPile.splice(indices[0], 1)[0];
      destPush(card);
      onscreenConsole.log(`${actionVerb} <span class="console-highlights">${card.name}</span>.`);
      updateGameBoard();
      resolve();
      return;
    }

    titleElement.textContent = label;
    instructionsElement.textContent = `Choose a ${cardType} from your Victory Pile.`;

    document.querySelector(".card-choice-popup-selectionrow1label").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2label").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2-container").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.height = "50%";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.top = "28%";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.transform = "translateY(-50%)";
    document.querySelector(".card-choice-popup-closebutton").style.display = "none";

    selectionRow1.textContent = "";
    previewElement.textContent = "";
    previewElement.style.backgroundColor = "var(--panel-backgrounds)";

    let selected = null;
    setupIndependentScrollGradients(selectionRow1, null);

    const confirmButton = document.getElementById("card-choice-popup-confirm");
    const otherChoiceButton = document.getElementById("card-choice-popup-otherchoice");
    const noThanksButton = document.getElementById("card-choice-popup-nothanks");
    confirmButton.textContent = "CONFIRM";
    confirmButton.disabled = true;
    otherChoiceButton.style.display = "none";
    noThanksButton.style.display = "none";

    choices.forEach((entry) => {
      const cardElement = document.createElement("div");
      cardElement.className = "popup-card";
      cardElement.setAttribute("data-vp-index", entry.vpIndex);

      const cardImage = document.createElement("img");
      cardImage.src = entry.image;
      cardImage.alt = entry.name;
      cardImage.className = "popup-card-image";

      cardElement.addEventListener("mouseover", () => {
        previewElement.textContent = "";
        const previewImage = document.createElement("img");
        previewImage.src = entry.image;
        previewImage.alt = entry.name;
        previewImage.className = "popup-card-preview-image";
        previewElement.appendChild(previewImage);
        previewElement.style.backgroundColor = "var(--accent)";
      });

      cardElement.addEventListener("click", () => {
        selectionRow1.querySelectorAll("img.selected").forEach((img) => img.classList.remove("selected"));
        if (selected && selected.vpIndex === entry.vpIndex) {
          selected = null;
          confirmButton.disabled = true;
        } else {
          selected = entry;
          cardImage.classList.add("selected");
          confirmButton.disabled = false;
        }
      });

      cardElement.appendChild(cardImage);
      selectionRow1.appendChild(cardElement);
    });

    setupDragScrolling(selectionRow1);

    confirmButton.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (!selected) return;
      setTimeout(() => {
        const card = victoryPile.splice(selected.vpIndex, 1)[0];
        destPush(card);
        onscreenConsole.log(`${actionVerb} <span class="console-highlights">${card.name}</span>.`);
        closeCardChoicePopup();
        updateGameBoard();
        resolve();
      }, 100);
    };

    modalOverlay.style.display = "block";
    cardchoicepopup.style.display = "block";
  });
}

// GP-3d shared picker (hand twin of moveOneFromVictoryPile): remove one card from your hand matching
// `predicate` to a destination (via destPush, a callback so it always targets the live global array).
// 0 eligible → noneMsg + resolve; 1 → auto-move; 2+ → single-select picker (same DOM as the VP twin).
// actionVerb is the past-tense log lead (e.g. "KO'd"); `instruction` is the picker prompt; optional
// postAction(card) runs after each move (e.g. koBonuses). Returns a Promise; await it.
function removeOneFromHand(predicate, destPush, label, instruction, actionVerb, noneMsg, postAction) {
  return new Promise((resolve) => {
    const indices = [];
    playerHand.forEach((c, i) => { if (c && predicate(c)) indices.push(i); });

    if (indices.length === 0) {
      onscreenConsole.log(noneMsg);
      resolve();
      return;
    }
    if (indices.length === 1) {
      const card = playerHand.splice(indices[0], 1)[0];
      destPush(card);
      onscreenConsole.log(`${actionVerb} <span class="console-highlights">${card.name}</span>.`);
      if (postAction) postAction(card);
      updateGameBoard();
      resolve();
      return;
    }

    const choices = indices.map((handIdx) => ({ ...playerHand[handIdx], handIndex: handIdx }));
    genericCardSort(choices);

    const cardchoicepopup = document.querySelector(".card-choice-popup");
    const modalOverlay = document.getElementById("modal-overlay");
    const selectionRow1 = document.querySelector(".card-choice-popup-selectionrow1");
    const previewElement = document.querySelector(".card-choice-popup-preview");
    const titleElement = document.querySelector(".card-choice-popup-title");
    const instructionsElement = document.querySelector(".card-choice-popup-instructions");
    if (!cardchoicepopup || !modalOverlay || !selectionRow1 || !titleElement || !instructionsElement) {
      // Defensive: popup DOM unexpectedly absent → move the first eligible card and resolve.
      const card = playerHand.splice(indices[0], 1)[0];
      destPush(card);
      onscreenConsole.log(`${actionVerb} <span class="console-highlights">${card.name}</span>.`);
      if (postAction) postAction(card);
      updateGameBoard();
      resolve();
      return;
    }

    titleElement.textContent = label;
    instructionsElement.textContent = instruction;

    document.querySelector(".card-choice-popup-selectionrow1label").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2label").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow2-container").style.display = "none";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.height = "50%";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.top = "28%";
    document.querySelector(".card-choice-popup-selectionrow1-container").style.transform = "translateY(-50%)";
    document.querySelector(".card-choice-popup-closebutton").style.display = "none";

    selectionRow1.textContent = "";
    previewElement.textContent = "";
    previewElement.style.backgroundColor = "var(--panel-backgrounds)";

    let selected = null;
    setupIndependentScrollGradients(selectionRow1, null);

    const confirmButton = document.getElementById("card-choice-popup-confirm");
    const otherChoiceButton = document.getElementById("card-choice-popup-otherchoice");
    const noThanksButton = document.getElementById("card-choice-popup-nothanks");
    confirmButton.textContent = "CONFIRM";
    confirmButton.disabled = true;
    otherChoiceButton.style.display = "none";
    noThanksButton.style.display = "none";

    choices.forEach((entry) => {
      const cardElement = document.createElement("div");
      cardElement.className = "popup-card";
      cardElement.setAttribute("data-hand-index", entry.handIndex);

      const cardImage = document.createElement("img");
      cardImage.src = entry.image;
      cardImage.alt = entry.name;
      cardImage.className = "popup-card-image";

      cardElement.addEventListener("mouseover", () => {
        previewElement.textContent = "";
        const previewImage = document.createElement("img");
        previewImage.src = entry.image;
        previewImage.alt = entry.name;
        previewImage.className = "popup-card-preview-image";
        previewElement.appendChild(previewImage);
        previewElement.style.backgroundColor = "var(--accent)";
      });

      cardElement.addEventListener("click", () => {
        selectionRow1.querySelectorAll("img.selected").forEach((img) => img.classList.remove("selected"));
        if (selected && selected.handIndex === entry.handIndex) {
          selected = null;
          confirmButton.disabled = true;
        } else {
          selected = entry;
          cardImage.classList.add("selected");
          confirmButton.disabled = false;
        }
      });

      cardElement.appendChild(cardImage);
      selectionRow1.appendChild(cardElement);
    });

    setupDragScrolling(selectionRow1);

    confirmButton.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (!selected) return;
      setTimeout(() => {
        const card = playerHand.splice(selected.handIndex, 1)[0];
        destPush(card);
        onscreenConsole.log(`${actionVerb} <span class="console-highlights">${card.name}</span>.`);
        if (postAction) postAction(card);
        closeCardChoicePopup();
        updateGameBoard();
        resolve();
      }, 100);
    };

    modalOverlay.style.display = "block";
    cardchoicepopup.style.display = "block";
  });
}

// GP-3c: KO a Bystander from your Victory Pile (Carnival of Concussions).
function koBystanderFromVictoryPile(label) {
  return moveOneFromVictoryPile(
    "Bystander",
    (card) => koPile.push(card),
    label,
    "KO'd",
    "No Bystander in your Victory Pile — nothing to KO.",
  );
}

// GP-3c: put a Villain from your Victory Pile into the Escape Pile (Prison of Coffins).
// NOTE: the global escape pile is `escapedVillainsDeck` (script.js:778) — there is NO `escapePile`.
// (The two pre-existing `escapePile` typos in powerManEscape + mandarinRingsSeekTheirTrueHand were
// fixed in the escapePile micro fix-group.)
function escapeVillainFromVictoryPile(label) {
  return moveOneFromVictoryPile(
    "Villain",
    (card) => escapedVillainsDeck.push(card),
    label,
    "Moved to the Escape Pile:",
    "No Villain in your Victory Pile — nothing to escape.",
  );
}

// GP-3c: choose — put a Villain from your Victory Pile into the Escape Pile, OR gain a Wound
// ("The Raft" Prison). No Villain in VP → forced Wound (mirrors powerManEscape's no-villain path).
async function escapeVillainOrWound(label) {
  const hasVillain = victoryPile.some((c) => c && c.type === "Villain");
  if (!hasVillain) {
    onscreenConsole.log(`No Villain in your Victory Pile. Gaining a Wound.`);
    await drawWound();
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Put a Villain from your Victory Pile into the Escape Pile, or gain a Wound?`,
      "Escape a Villain",
      "Gain Wound",
    );
    const titleEl = document.querySelector(".info-or-choice-popup-title");
    if (titleEl) titleEl.textContent = label;
    confirmButton.onclick = async () => {
      closeInfoChoicePopup();
      await escapeVillainFromVictoryPile(label); // picker chooses which Villain
      resolve();
    };
    denyButton.onclick = async () => {
      closeInfoChoicePopup();
      await drawWound();
      resolve();
    };
  });
}

// GP-3d: capture a Bystander from your Victory Pile onto a Location (Carnival of Wonders #9).
// Pushes the chosen Bystander to `locationCard.capturedBystanders` (PT-2 infra) — it is rescued back
// to your Victory Pile when that Location is itself defeated (defeatLocation, script.js:12084).
function captureBystanderFromVPToLocation(locationCard, label) {
  if (!Array.isArray(locationCard.capturedBystanders)) locationCard.capturedBystanders = [];
  return moveOneFromVictoryPile(
    "Bystander",
    (card) => locationCard.capturedBystanders.push(card),
    label,
    `Captured by ${locationCard.name}:`,
    "No Bystander in your Victory Pile — nothing to capture.",
  );
}

// GP-3d: reveal your hand and KO one non-grey Hero from it (Dragon of Heaven Spaceship #10).
// Source = HAND only (the "reveals their hand and KOs" construction scopes the KO to the revealed
// hand — same idiom as Cult of Skulls #5 "reveals their hand and discards", which is hand-scoped).
// 0 qualifying → nothing; 1 → auto-KO; 2+ → single-select picker. koBonuses() fires per KO.
function koNonGreyHeroFromHand(label) {
  return removeOneFromHand(
    (c) => c.type === "Hero" && isNonGreyCard(c),
    (card) => koPile.push(card),
    label,
    "Choose a non-grey Hero from your hand to KO.",
    "KO'd",
    "No non-grey Hero in your hand — nothing to KO.",
    () => koBonuses(),
  );
}

// --- Grim Reaper Tactic Locations ---
// Solo self-apply (GP-3c): "each other player KOs a Bystander from their Victory Pile" → you do it.
async function carnivalOfConcussionsTrigger() {
  onscreenConsole.log(
    `<span class="console-highlights">Carnival of Concussions</span> triggers — in solo, KO a Bystander from your Victory Pile.`,
  );
  await koBystanderFromVictoryPile("Carnival of Concussions");
}

// Solo self-apply (GP-3b): "each other player reveals their hand and discards a non-grey card" → you do it.
async function cultOfSkullsTrigger() {
  onscreenConsole.log(
    `<span class="console-highlights">Cult of Skulls</span> triggers — in solo, reveal your hand and discard a non-grey card.`,
  );
  await revealHandDiscardMatching(isNonGreyCard, "Cult of Skulls", "a non-grey card");
}

// Solo self-apply (GP-3): "each other player gains a Wound" → you gain a Wound.
async function mazeOfBonesTrigger() {
  onscreenConsole.log(
    `<span class="console-highlights">Maze of Bones</span> triggers — in solo, you gain a Wound.`,
  );
  await drawWound();
}

// Solo self-apply (GP-3c): "each other player puts a Villain from their Victory Pile into the Escape Pile" → you do it.
async function prisonOfCoffinsTrigger() {
  onscreenConsole.log(
    `<span class="console-highlights">Prison of Coffins</span> triggers — in solo, put a Villain from your Victory Pile into the Escape Pile.`,
  );
  await escapeVillainFromVictoryPile("Prison of Coffins");
}

// --- Mandarin Tactic Location ---
// Solo self-apply (GP-3d): "each other player reveals their hand and KOs one of their non-grey Heroes" → you do it.
async function dragonOfHeavenTrigger() {
  onscreenConsole.log(
    `<span class="console-highlights">Dragon of Heaven Spaceship</span> triggers — in solo, reveal your hand and KO one of your non-grey Heroes.`,
  );
  await koNonGreyHeroFromHand("Dragon of Heaven Spaceship");
}

// --- The Hood Tactic Location (LIVE: affects the solo player) ---
async function hoodsWarehouseTrigger() {
  onscreenConsole.log(
    `<span class="console-highlights">The Hood's Warehouse</span> triggers — When you fight a Villain here, play another card from the Villain Deck.`,
  );
  await processVillainCard();
}

// --- Army of Evil group Location ---
// Solo self-apply (GP-3): "each other player reveals a Range Hero or discards a card" → you do it.
async function domeOfDarkforceTrigger() {
  onscreenConsole.log(
    `<span class="console-highlights">Dome of Darkforce</span> triggers — in solo, you reveal a ${RANGE_ICON} Hero or discard a card.`,
  );
  await revealClassOrDiscard("Range", "Range.svg", "Dome of Darkforce");
}

// --- Lethal Legion group Locations ---
// Solo self-apply (GP-3d): "each other player chooses a Bystander from their Victory Pile to be
// captured by Carnival of Wonders" → you choose one of yours; it is captured onto this Location.
async function carnivalOfWondersTrigger(locationCard, cityIndex) {
  onscreenConsole.log(
    `<span class="console-highlights">Carnival of Wonders</span> triggers — in solo, choose a Bystander from your Victory Pile to be captured by Carnival of Wonders.`,
  );
  await captureBystanderFromVPToLocation(locationCard, "Carnival of Wonders");
}

// Solo self-apply (GP-3): "each other player reveals a Range Hero or gains a Wound" → you do it.
async function laserMazeTrigger() {
  onscreenConsole.log(
    `<span class="console-highlights">Laser Maze</span> triggers — in solo, you reveal a ${RANGE_ICON} Hero or gain a Wound.`,
  );
  await revealClassOrWound("Range", "Range.svg", "Laser Maze");
}

// Solo self-apply (GP-3c): "each other player puts a Villain from their Victory Pile into the Escape Pile or gains a Wound" → you do it.
async function raftPrisonTrigger() {
  onscreenConsole.log(
    `<span class="console-highlights">"The Raft" Prison</span> triggers — in solo, put a Villain from your Victory Pile into the Escape Pile or gain a Wound.`,
  );
  await escapeVillainOrWound(`"The Raft" Prison`);
}

// Solo self-apply (GP-3b): "each other player reveals their hand and discards a Tech card" → you do it.
async function whiteGorillaCultTrigger() {
  onscreenConsole.log(
    `<span class="console-highlights">White Gorilla Cult</span> triggers — in solo, reveal your hand and discard a ${TECH_ICON} card.`,
  );
  await revealHandDiscardMatching(
    (c) => Array.isArray(c.classes) && c.classes.includes("Tech"),
    "White Gorilla Cult",
    "a Tech card",
  );
}

// --- HENCHMEN EFFECTS ---

// === HYDRA Base (Henchman Location) ===
// +2 Attack while a Villain is in the same space — handled via the Location's bonusWhileVillain
// field + getLocationEffectiveAttack (E-3 refactor), NOT in updateVillainAttackValues.
// Fight: KO one of your Heroes.
function hydraBaseFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">HYDRA Base</span>: KO one of your Heroes.`);
  return FightKOHeroYouHave("HYDRA Base");
}

// === Mandarin's Rings (10 unique fight effects) ===

// Daimonic, The White Light — Fight: Draw a card.
function mandarinRingDaimonic() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Daimonic, The White Light</span>: Draw a card.`);
  drawCard();
}

// Incandescence, The Flame Blast — Fight: KO a card from discard.
async function mandarinRingIncandescence() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Incandescence, The Flame Blast</span>: You may KO a card from your discard pile.`);
  await koUpToNFromDiscardPile("Incandescence, The Flame Blast", 1);
}

// Influence, The Impact Beam — Fight: +1 Recruit.
function mandarinRingInfluence() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Influence, The Impact Beam</span>: +1 <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons">.`);
  totalRecruitPoints += 1;
  cumulativeRecruitPoints += 1;
  updateGameBoard();
}

// Liar, The Mento-Intensifier — Fight: Look at top of your deck, choose to discard or keep.
// (Solo adaptation: "another player's deck" -> your own deck)
async function mandarinRingLiar() {
  if (playerDeck.length === 0 && playerDiscardPile.length > 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  if (playerDeck.length === 0) {
    onscreenConsole.log(`Fight! <span class="console-highlights">Liar</span>: No cards in deck.`);
    return;
  }
  const topCard = playerDeck[playerDeck.length - 1];
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `<span class="console-highlights">Liar</span>: Top of your deck is <span class="bold-spans">${topCard.name}</span>. Discard it or put it back?`,
      "Discard",
      "Put It Back",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      const card = playerDeck.pop();
      playerDiscardPile.push(card);
      onscreenConsole.log(`Discarded <span class="console-highlights">${card.name}</span>.`);
      updateGameBoard();
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      onscreenConsole.log(`Left <span class="console-highlights">${topCard.name}</span> on top.`);
      resolve();
    };
  });
}

// Lightning, The Electro-Blast — Fight: Reveal top of deck, may KO it.
async function mandarinRingLightning() {
  if (playerDeck.length === 0 && playerDiscardPile.length > 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  if (playerDeck.length === 0) {
    onscreenConsole.log(`Fight! <span class="console-highlights">Lightning</span>: No cards in deck.`);
    return;
  }
  const topCard = playerDeck[playerDeck.length - 1];
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `<span class="console-highlights">Lightning</span>: Revealed <span class="bold-spans">${topCard.name}</span>. KO it?`,
      "KO It",
      "Keep It",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      const card = playerDeck.pop();
      koPile.push(card);
      onscreenConsole.log(`KO'd <span class="console-highlights">${card.name}</span>.`);
      updateGameBoard();
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      onscreenConsole.log(`Left <span class="console-highlights">${topCard.name}</span> on top.`);
      resolve();
    };
  });
}

// Nightbringer, The Black Light — Fight: Reveal top 3 of villain deck, may defeat a villain worth 2VP or less.
async function mandarinRingNightbringer() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Nightbringer, The Black Light</span>: Reveal top three cards of the Villain Deck.`);
  if (villainDeck.length === 0) {
    onscreenConsole.log(`Villain Deck is empty.`);
    return;
  }
  const revealed = [];
  for (let i = 0; i < 3 && villainDeck.length > 0; i++) {
    revealed.push(villainDeck.pop());
  }
  const eligible = revealed.filter(c => c.type === "Villain" && (c.victoryPoints || 0) <= 2);
  const names = revealed.map(c => `${c.name} (${c.type}, ${c.victoryPoints || 0}VP)`).join(", ");
  onscreenConsole.log(`Revealed: ${names}.`);
  if (eligible.length > 0) {
    const target = eligible[0];
    const remaining = revealed.filter(c => c !== target);
    victoryPile.push(target);
    onscreenConsole.log(`Defeated <span class="console-highlights">${target.name}</span> (${target.victoryPoints}VP)!`);
    // Put rest back on top
    for (const c of remaining.reverse()) villainDeck.push(c);
  } else {
    onscreenConsole.log(`No eligible Villain (2VP or less). Put them all back.`);
    for (const c of revealed.reverse()) villainDeck.push(c);
  }
  updateGameBoard();
}

// Remaker, The Matter Rearranger — Fight: Choose a card from discard, put it in your hand.
// (Solo adaptation: "player on your right" -> yourself)
async function mandarinRingRemaker() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Remaker, The Matter Rearranger</span>: You may put a card from your discard pile into your hand.`);
  await takeOneFromDiscardToHand("Remaker, The Matter Rearranger");
}

// Spectral, The Disintegration Beam — Fight: KO one of your Heroes.
function mandarinRingSpectral() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Spectral, The Disintegration Beam</span>: KO one of your Heroes.`);
  return FightKOHeroYouHave("Spectral, The Disintegration Beam");
}

// Spin, The Vortex Beam — Fight: Reveal top 6 of deck, discard all cost-0, put rest back.
function mandarinRingSpin() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Spin, The Vortex Beam</span>: Reveal top six cards of your deck.`);
  if (playerDeck.length === 0 && playerDiscardPile.length > 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  const revealed = [];
  for (let i = 0; i < 6 && playerDeck.length > 0; i++) {
    revealed.push(playerDeck.pop());
  }
  const costZero = revealed.filter(c => (c.cost || 0) === 0);
  const rest = revealed.filter(c => (c.cost || 0) > 0);
  for (const c of costZero) {
    playerDiscardPile.push(c);
    onscreenConsole.log(`Discarded <span class="console-highlights">${c.name}</span> (cost 0).`);
  }
  for (const c of rest.reverse()) {
    playerDeck.push(c);
  }
  onscreenConsole.log(`Discarded ${costZero.length} cost-0 card(s). Put ${rest.length} back on top.`);
  updateGameBoard();
}

// Zero, The Ice Blast — Fight: Choose a cost-0 card you played. Add it to hand at end of turn.
function mandarinRingZero() {
  const costZeroPlayed = cardsPlayedThisTurn.filter(c => (c.cost || 0) === 0 && !c.isCopied && !c.markedForDeletion && !c.isSimulation);
  if (costZeroPlayed.length === 0) {
    onscreenConsole.log(`Fight! <span class="console-highlights">Zero, The Ice Blast</span>: No cost-0 cards played this turn.`);
    return;
  }
  const card = costZeroPlayed[0];
  onscreenConsole.log(`Fight! <span class="console-highlights">Zero, The Ice Blast</span>: <span class="console-highlights">${card.name}</span> will be added to your hand at end of turn as an extra card.`);
  // Mark card for end-of-turn retrieval
  card.addToHandEndOfTurn = true;
}

// --- BYSTANDER EFFECTS ---

// Dog Show Judge — When rescued: reveal top of each player's deck, "judge" best in show, draw it.
// Solo: just reveal top of your deck, draw it.
function bystanderDogShowJudge() {
  onscreenConsole.log(`Rescued <span class="console-highlights">Dog Show Judge</span>! Reveal the top card of your deck and draw it.`);
  if (playerDeck.length === 0 && playerDiscardPile.length > 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  if (playerDeck.length > 0) {
    drawCard();
  }
}

// Lawyer — When rescued: reveal top 3 of deck, draw each with 10+ words of rules text.
function bystanderLawyer() {
  onscreenConsole.log(`Rescued <span class="console-highlights">Lawyer</span>! Reveal top 3 cards of your deck.`);
  if (playerDeck.length === 0 && playerDiscardPile.length > 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  const revealed = [];
  for (let i = 0; i < 3 && playerDeck.length > 0; i++) {
    revealed.push(playerDeck.pop());
  }
  if (revealed.length === 0) {
    onscreenConsole.log(`No cards to reveal.`);
    return;
  }
  // Approximate "10+ words of rules text" — cards with abilities are wordy
  // Use a heuristic: cards with unconditionalAbility or conditionalAbility != "None"
  const wordy = revealed.filter(c =>
    (c.unconditionalAbility && c.unconditionalAbility !== "None") ||
    (c.conditionalAbility && c.conditionalAbility !== "None")
  );
  const rest = revealed.filter(c => !wordy.includes(c));
  for (const c of wordy) {
    playerHand.push(c);
    onscreenConsole.log(`Drew <span class="console-highlights">${c.name}</span> (has rules text).`);
  }
  // Put rest back on top
  for (const c of rest.reverse()) {
    playerDeck.push(c);
  }
  onscreenConsole.log(`Drew ${wordy.length}, put ${rest.length} back.`);
  updateGameBoard();
}

// Rocket Test Pilot — When rescued: choose Recruit or Attack, then Hyperspeed 3.
async function bystanderRocketTestPilot() {
  onscreenConsole.log(`Rescued <span class="console-highlights">Rocket Test Pilot</span>!`);
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Choose Recruit or Attack. Then Hyperspeed 3 for that icon.`,
      "Attack",
      "Recruit",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      hyperspeed(3, "attack");
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      hyperspeed(3, "recruit");
      resolve();
    };
  });
}
