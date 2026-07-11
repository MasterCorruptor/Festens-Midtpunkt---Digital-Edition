const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const menuButton = document.getElementById("menuButton");
const acceptCardButton = document.getElementById("acceptCardButton");
const rejectCardButton = document.getElementById("rejectCardButton");
const cardText = document.getElementById("cardText");
const playerNameInput = document.getElementById("playerNameInput");
const addPlayerButton = document.getElementById("addPlayerButton");
const playerList = document.getElementById("playerList");
const playerError = document.getElementById("playerError");
const deckError = document.getElementById("deckError");
const deckCurrentPlayerStatus = document.getElementById("deckCurrentPlayerStatus");
const deckEditorButton = document.getElementById("deckEditorButton");
const deckEditorScreen = document.getElementById("deckEditorScreen");
const deckEditorList = document.getElementById("deckEditorList");
const newDeckButton = document.getElementById("newDeckButton");
const backFromEditorButton = document.getElementById("backFromEditorButton");
const deckEditorMessage = document.getElementById("deckEditorMessage");
const editDeckScreen = document.getElementById("editDeckScreen");
const editDeckName = document.getElementById("editDeckName");
const editDeckDescription = document.getElementById("editDeckDescription");
const editDeckAgeRating = document.getElementById("editDeckAgeRating");
const editDeckMinPlayers = document.getElementById("editDeckMinPlayers");
const editDeckMaxPlayers = document.getElementById("editDeckMaxPlayers");
const editDeckPlayerCountRule = document.getElementById("editDeckPlayerCountRule");
const editDeckCardList = document.getElementById("editDeckCardList");
const editDeckPenaltyCardList = document.getElementById("editDeckPenaltyCardList");
const backToDeckEditorButton = document.getElementById("backToDeckEditorButton");
const saveDeckButton = document.getElementById("saveDeckButton");
const saveDeckMessage = document.getElementById("saveDeckMessage");
const chooseDeckButton = document.getElementById("chooseDeckButton");
const chooseDeckScreen = document.getElementById("chooseDeckScreen");
const backFromChooseDeckButton = document.getElementById("backFromChooseDeckButton");
const deckInfoScreen = document.getElementById("deckInfoScreen");
const deckTitle = document.getElementById("deckTitle");
const deckDescription = document.getElementById("deckDescription");
const deckAgeRating = document.getElementById("deckAgeRating");
const deckPlayerCount = document.getElementById("deckPlayerCount");
const deckPlayerRule = document.getElementById("deckPlayerRule");
const startSelectedDeckButton = document.getElementById("startSelectedDeckButton");
const backToMenuButton = document.getElementById("backToMenuButton");
const deckButtonList = document.getElementById("deckButtonList");
const chooseDeckError = document.getElementById("chooseDeckError");
const insertPlayerButton = document.getElementById("insertPlayerButton");
const insertPlayer1Button = document.getElementById("insertPlayer1Button");
const insertPlayer2Button = document.getElementById("insertPlayer2Button");
const gameSummaryScreen = document.getElementById("gameSummaryScreen");
const gameSummaryStats = document.getElementById("gameSummaryStats");
const restartGameButton = document.getElementById("restartGameButton");
const summaryMenuButton = document.getElementById("summaryMenuButton");
const bulkCardInput = document.getElementById("bulkCardInput");
const addBulkCardsButton = document.getElementById("addBulkCardsButton");
const bulkCardMessage = document.getElementById("bulkCardMessage");
const cardListScreen = document.getElementById("cardListScreen");
const cardListNormalCards = document.getElementById("cardListNormalCards");
const cardListPenaltyCards = document.getElementById("cardListPenaltyCards");
const backToEditDeckButton = document.getElementById("backToEditDeckButton");
const showCardListButton = document.getElementById("showCardListButton");
const bulkPenaltyCardInput = document.getElementById("bulkPenaltyCardInput");
const addBulkPenaltyCardsButton = document.getElementById("addBulkPenaltyCardsButton");
const bulkPenaltyCardMessage = document.getElementById("bulkPenaltyCardMessage");

let players = [];
let currentDeck = null;
let currentCardIndex = 0;
let selectedDeckId = null;
let deckBeingEdited = null;
let activeCardInput = null;
let acceptedCards = 0;
let rejectedCards = 0;
let penaltyCardsDrawn = 0;
let playerPickCounts = {};
let isShowingPenaltyCard = false;

[editDeckDescription, bulkCardInput, bulkPenaltyCardInput].forEach(function (textarea) {
    initializeAutoResizeTextarea(textarea);
});

window.addEventListener("pageshow", function () {
    playerNameInput.value = "";
    resizeEditorTextareas();
});


async function showDeckInfo(deckId) {

	chooseDeckError.textContent = "";

	let deckData;

	try {
		deckData = await getDeckById(deckId);
	} catch (error) {
		chooseDeckError.textContent =
			"Kunne ikke laste kortstokken: " + error.message;
		return;
	}

    selectedDeckId = deckId;

    deckTitle.textContent = deckData.name;
    deckDescription.textContent = deckData.description;
    deckAgeRating.textContent = "Aldersgrense: " + deckData.ageRating;
    deckPlayerCount.textContent =
        "Spillere: " +
        deckData.minPlayers +
        " - " +
        deckData.maxPlayers;
	deckPlayerRule.textContent =
		"Regel: " + getPlayerCountRuleLabel(deckData.playerCountRule);
	if (isValidPlayerCount(deckData, players.length)) {
    deckCurrentPlayerStatus.textContent =
        "✓ " + players.length + " spillere registrert";
	}
	else {
    deckCurrentPlayerStatus.textContent =
        "✗ " + players.length + " spillere registrert";
	}
    showScreen(deckInfoScreen);
	deckError.textContent = "";
}

startSelectedDeckButton.addEventListener("click", function () {
    startDeck(selectedDeckId);
});

backToMenuButton.addEventListener("click", function () {
    deckInfoScreen.style.display = "none";
    menuScreen.style.display = "flex";

    selectedDeckId = null;
});

async function startDeck(deckId) {
    playerError.textContent = "";
	deckError.textContent = "";

	try {
		currentDeck = await getDeckById(deckId);
	} catch (error) {
		deckError.textContent =
			"Kunne ikke starte spillet: " + error.message;
		return;
	}

    if (!isValidPlayerCount(currentDeck, players.length)) {
        deckError.textContent = "Antall spillere passer ikke for denne kortstokken.";
        return;
    }

    if (!Array.isArray(currentDeck.cards) || currentDeck.cards.length === 0) {
        deckError.textContent = "Kortstokken inneholder ingen kort.";
        return;
    }

    currentDeck.cards = shuffleCards(currentDeck.cards);
    currentCardIndex = 0;
	acceptedCards = 0;
	rejectedCards = 0;
	penaltyCardsDrawn = 0;
	playerPickCounts = {};
	isShowingPenaltyCard = false;

    menuScreen.style.display = "none";
    deckInfoScreen.style.display = "none";
	gameSummaryScreen.style.display = "none";
    gameScreen.style.display = "flex";

    cardText.textContent = prepareCardText(currentDeck.cards[currentCardIndex]);
}

restartGameButton.addEventListener("click", function () {
    startDeck(selectedDeckId);
});

acceptCardButton.addEventListener("click", function () {
    if (!isShowingPenaltyCard) {
        acceptedCards++;
    }

    showNextCard();
});

rejectCardButton.addEventListener("click", function () {
    showPenaltyCard();
});

menuButton.addEventListener("click", function () {
    gameScreen.style.display = "none";
    menuScreen.style.display = "flex";

    cardText.textContent = "";
    currentDeck = null;
    currentCardIndex = 0;

    acceptedCards = 0;
    rejectedCards = 0;
    penaltyCardsDrawn = 0;
    playerPickCounts = {};
    isShowingPenaltyCard = false;
});

summaryMenuButton.addEventListener("click", function () {
    gameSummaryScreen.style.display = "none";
    menuScreen.style.display = "flex";

    cardText.textContent = "";
    currentDeck = null;
    currentCardIndex = 0;

    acceptedCards = 0;
    rejectedCards = 0;
    penaltyCardsDrawn = 0;
    isShowingPenaltyCard = false;
});

function addPlayer() {
    let playerName = playerNameInput.value.trim();
    playerName = formatPlayerName(playerName);

    if (playerName === "") {
        return;
    }

    const playerNameExists = players.some(function (existingPlayerName) {
        return existingPlayerName.toLowerCase() === playerName.toLowerCase();
    });

    if (playerNameExists) {
        playerError.textContent = "Spilleren eksisterer allerede.";
        return;
    }

    playerError.textContent = "";

    players.push(playerName);

    const listItem = document.createElement("li");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = playerName;

    const removeButton = document.createElement("button");
    removeButton.classList.add("removeButton");
    removeButton.textContent = "Fjern";

    removeButton.addEventListener("click", function () {
        players = players.filter(function (name) {
            return name !== playerName;
        });

        listItem.remove();
    });

    listItem.appendChild(nameSpan);
    listItem.appendChild(removeButton);

    playerList.appendChild(listItem);

    playerNameInput.value = "";
    playerNameInput.focus();
}

addPlayerButton.addEventListener("click", function () {
    addPlayer();
});

playerNameInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addPlayer();
    }
});

deckEditorButton.addEventListener("click", function () {
    showScreen(deckEditorScreen);

    showDeckEditorList();
});

backFromEditorButton.addEventListener("click", function () {
    showScreen(menuScreen);
});

newDeckButton.addEventListener("click", function () {
    openNewDeckEditor();
});

function shuffleCards(cards) {
    for (let i = cards.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        const temporaryCard = cards[i];
        cards[i] = cards[randomIndex];
        cards[randomIndex] = temporaryCard;
    }

    return cards;
}

function initializeAutoResizeTextarea(textarea) {
    textarea.classList.add("autoResizeTextarea");

    textarea.addEventListener("input", function () {
        autoResizeTextarea(textarea);
    });

    textarea.addEventListener("pointerdown", function () {
        textarea.dataset.resizeStartHeight = String(textarea.offsetHeight);
    });

    textarea.addEventListener("pointerup", function () {
        const startHeight = Number(textarea.dataset.resizeStartHeight);
        const currentHeight = textarea.offsetHeight;

        if (Math.abs(currentHeight - startHeight) > 2) {
            textarea.dataset.userMinHeight = String(currentHeight);
            autoResizeTextarea(textarea);
        }
    });

    requestAnimationFrame(function () {
        autoResizeTextarea(textarea);
    });
}

function autoResizeTextarea(textarea) {
    const computedStyle = window.getComputedStyle(textarea);
    const minimumHeight = parseFloat(computedStyle.minHeight) || 0;
    const maximumHeight = parseFloat(computedStyle.maxHeight);
    const userMinimumHeight = Number(textarea.dataset.userMinHeight) || 0;
    const borderHeight =
        (parseFloat(computedStyle.borderTopWidth) || 0) +
        (parseFloat(computedStyle.borderBottomWidth) || 0);

    textarea.style.height = "auto";

    const contentHeight = textarea.scrollHeight + borderHeight;
    let targetHeight = Math.max(minimumHeight, userMinimumHeight, contentHeight);

    if (Number.isFinite(maximumHeight)) {
        targetHeight = Math.min(targetHeight, maximumHeight);
    }

    textarea.style.height = targetHeight + "px";
    textarea.style.overflowY =
        Number.isFinite(maximumHeight) && contentHeight > maximumHeight
            ? "auto"
            : "hidden";
}

function resetTextareaSize(textarea) {
    delete textarea.dataset.userMinHeight;
    delete textarea.dataset.resizeStartHeight;
    textarea.style.height = "";
    autoResizeTextarea(textarea);
}

function resizeEditorTextareas() {
    const textareas = document.querySelectorAll(
        "#editDeckScreen textarea, #cardListScreen textarea"
    );

    textareas.forEach(function (textarea) {
        autoResizeTextarea(textarea);
    });
}

function showNextCard() {
    rejectCardButton.style.display = "inline-block";
	isShowingPenaltyCard = false;

	currentCardIndex++;

    if (currentCardIndex >= currentDeck.cards.length) {

	const topPlayers = Object.entries(playerPickCounts)
			.sort(function(a, b) {
			return b[1] - a[1];
		})
		.slice(0, 3);

	gameSummaryStats.replaceChildren();

	const acceptedCardsText = document.createElement("p");
	acceptedCardsText.textContent = "Godkjente kort: " + acceptedCards;
	gameSummaryStats.appendChild(acceptedCardsText);

	const penaltyCardsText = document.createElement("p");
	penaltyCardsText.textContent = "Straffekort trukket: " + penaltyCardsDrawn;
	gameSummaryStats.appendChild(penaltyCardsText);

	const rejectedCardsText = document.createElement("p");
	rejectedCardsText.textContent = "Avviste kort: " + rejectedCards;
	gameSummaryStats.insertBefore(rejectedCardsText, penaltyCardsText);

	const topPlayersTitle = document.createElement("h3");
	topPlayersTitle.textContent = "Mest valgte spillere";
	gameSummaryStats.appendChild(topPlayersTitle);

	topPlayers.forEach(function(player, index) {
		const medals = ["🥇", "🥈", "🥉"];
		const playerText = document.createElement("p");

		playerText.textContent =
			medals[index] +
			" " +
			player[0] +
			" - " +
			player[1] +
			" ganger";

		gameSummaryStats.appendChild(playerText);
	});

		gameScreen.style.display = "none";
		gameSummaryScreen.style.display = "flex";

		return;
	}

    const nextCard = currentDeck.cards[currentCardIndex];

    cardText.textContent = prepareCardText(nextCard);
}

function showPenaltyCard() {
    rejectCardButton.style.display = "none";
	isShowingPenaltyCard = true;
	rejectedCards++;

    if (!currentDeck.penaltyCards || currentDeck.penaltyCards.length === 0) {
        cardText.textContent = "Ingen straffekort er lagt inn i denne kortstokken.";
        return;
    }

    penaltyCardsDrawn++;

    const randomIndex = Math.floor(Math.random() * currentDeck.penaltyCards.length);
    const penaltyCard = currentDeck.penaltyCards[randomIndex];

    cardText.textContent = prepareCardText(penaltyCard);
}

function prepareCardText(cardText) {
    if (players.length === 0) {
        return cardText;
    }

    let preparedText = cardText;

    const shuffledPlayers = shuffleCards([...players]);
    let playerIndex = 0;

    preparedText = preparedText.replace(/\{player\}/g, function () {
        const playerName = shuffledPlayers[playerIndex];

        if (playerName === undefined) {
            return "{player}";
        }

		playerIndex++;

		countPlayerPick(playerName);

		return playerName;
    });

    const numberedPlaceholders = preparedText.match(/\{player\d+\}/g);

    if (numberedPlaceholders === null) {
        return preparedText;
    }

    const uniquePlaceholders = [...new Set(numberedPlaceholders)];

    uniquePlaceholders.forEach(function (placeholder, index) {
        const playerName = shuffledPlayers[index];

        if (playerName !== undefined) {
			countPlayerPick(playerName);
			preparedText = preparedText.replaceAll(placeholder, playerName);
		}
    });

    return preparedText;
}

function countPlayerPick(playerName) {
    if (!playerPickCounts[playerName]) {
        playerPickCounts[playerName] = 0;
    }

    playerPickCounts[playerName]++;
}

function isValidPlayerCount(deck, playerCount) {
    if (playerCount < deck.minPlayers) {
        return false;
    }

    if (playerCount > deck.maxPlayers) {
        return false;
    }

    if (deck.playerCountRule === "exact") {
        return playerCount === deck.minPlayers && playerCount === deck.maxPlayers;
    }

    if (deck.playerCountRule === "even") {
        return playerCount % 2 === 0;
    }

    if (deck.playerCountRule === "odd") {
        return playerCount % 2 !== 0;
    }

    return true;
}

function getPlayerCountRuleLabel(playerCountRule) {
    const ruleLabels = {
        any: "Opp til maks spillere (any)",
        exact: "Akkurat samme som min og maks dersom de er like (exact)",
        even: "Må være partall med spillere (even)",
        odd: "Må være oddetall med spillere (odd)"
    };

    return ruleLabels[playerCountRule] || playerCountRule;
}

function formatPlayerName(name) {

    return name
        .toLowerCase()
        .split(" ")
        .map(function (part) {

            return part
                .split("-")
                .map(function (subPart) {
                    return subPart.charAt(0).toUpperCase() +
                           subPart.slice(1);
                })
                .join("-");

        })
        .join(" ");
}

async function showDeckEditorList() {
    deckEditorList.innerHTML = "";
	deckEditorMessage.textContent = "";

	let deckList;

	try {
		deckList = await getDeckList();
	} catch (error) {
		deckEditorMessage.textContent =
			"Kunne ikke laste kortstokkene: " + error.message;
		return;
	}

	deckList.forEach(function (deck) {
        const deckRow = document.createElement("div");
		deckRow.classList.add("deckRow");

        const deckName = document.createElement("span");
        deckName.textContent = deck.name;

        const editButton = document.createElement("button");
        editButton.textContent = "Rediger";
        editButton.classList.add("removeButton");

		editButton.addEventListener("click", function () {
			openDeckForEditing(deck);
		});

		if (deck.type === "official") {
			editButton.disabled = false;
		}

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Slett";
        deleteButton.classList.add("removeButton");

		deleteButton.addEventListener("click", async function () {
			const shouldDelete = window.confirm(
				"Vil du slette kortstokken \"" + deck.name + "\"?"
			);

			if (!shouldDelete) {
				return;
			}

			deckEditorMessage.textContent = "";

			try {
				await deleteDeckData(deck.id);
				await showDeckEditorList();
				deckEditorMessage.textContent = "Kortstokken er slettet.";
			} catch (error) {
				deckEditorMessage.textContent =
					"Kunne ikke slette kortstokken: " + error.message;
			}
		});

		if (deck.type === "official") {
			deleteButton.disabled = true;
		}

        deckRow.appendChild(deckName);
        deckRow.appendChild(editButton);
        deckRow.appendChild(deleteButton);

        deckEditorList.appendChild(deckRow);
    });
}

async function openDeckForEditing(deck) {
	deckEditorMessage.textContent = "";

	let deckData;

	try {
		deckData = await getDeckById(deck.id);
	} catch (error) {
		deckEditorMessage.textContent =
			"Kunne ikke åpne kortstokken: " + error.message;
		return;
	}

    deckBeingEdited = {
    ...deckData,
    file: deck.file
	};

    editDeckName.value = deckData.name;
    editDeckDescription.value = deckData.description;
    editDeckAgeRating.value = deckData.ageRating;
    editDeckMinPlayers.value = deckData.minPlayers;
    editDeckMaxPlayers.value = deckData.maxPlayers;
    editDeckPlayerCountRule.value = deckData.playerCountRule;
	resetTextareaSize(editDeckDescription);

    editDeckCardList.innerHTML = "";
	editDeckPenaltyCardList.innerHTML = "";
	bulkCardInput.value = "";
	bulkPenaltyCardInput.value = "";
	resetTextareaSize(bulkCardInput);
	resetTextareaSize(bulkPenaltyCardInput);
	bulkCardMessage.textContent = "";
	bulkPenaltyCardMessage.textContent = "";

	deckData.cards.forEach(function(card) {

		const cardRow = createCardEditorRow(card);

		editDeckCardList.appendChild(cardRow);
	});

	if (deckData.penaltyCards) {
		deckData.penaltyCards.forEach(function(card) {

			const cardRow = createCardEditorRow(card);

			editDeckPenaltyCardList.appendChild(cardRow);
		});
	}

    deckEditorScreen.style.display = "none";
    editDeckScreen.style.display = "flex";
}

backToDeckEditorButton.addEventListener("click", function () {
    showScreen(deckEditorScreen);

    showDeckEditorList();
});

function createCardEditorRow(cardText) {

    const cardRow = document.createElement("div");
    cardRow.classList.add("cardEditorRow");

    const cardInput = document.createElement("textarea");
    cardInput.rows = 1;
    cardInput.value = cardText;
    cardInput.classList.add("cardEditorInput");
	initializeAutoResizeTextarea(cardInput);
	cardInput.addEventListener("focus", function () {
		activeCardInput = cardInput;
	});

	cardInput.addEventListener("click", function () {
		activeCardInput = cardInput;
	});

	cardInput.addEventListener("blur", function () {
		if (cardInput.value.trim() === "") {
			cardRow.remove();

			if (activeCardInput === cardInput) {
				activeCardInput = null;
			}
		}
	});

    const removeCardButton = document.createElement("button");
    removeCardButton.textContent = "Fjern";
    removeCardButton.classList.add("removeButton");

    removeCardButton.addEventListener("click", function () {
        cardRow.remove();
    });

    cardRow.appendChild(cardInput);
    cardRow.appendChild(removeCardButton);

    return cardRow;
}

bulkCardInput.addEventListener("focus", function () {
    activeCardInput = bulkCardInput;
});

bulkCardInput.addEventListener("click", function () {
    activeCardInput = bulkCardInput;
});

addBulkCardsButton.addEventListener("click", function () {
    const cardLines = bulkCardInput.value.split("\n");
	let addedCards = 0;

    cardLines.forEach(function(cardText) {
        const trimmedCardText = cardText.trim();

        if (trimmedCardText !== "") {
            const cardRow = createCardEditorRow(trimmedCardText);
            editDeckCardList.appendChild(cardRow);
			addedCards++;
        }
    });

    bulkCardInput.value = "";
	autoResizeTextarea(bulkCardInput);
	bulkCardMessage.textContent = addedCards + " kort lagt til.";
});

addBulkPenaltyCardsButton.addEventListener("click", function () {
    const cardLines = bulkPenaltyCardInput.value.split("\n");
    let addedCards = 0;

    cardLines.forEach(function(cardText) {
        const trimmedCardText = cardText.trim();

        if (trimmedCardText !== "") {
            const cardRow = createCardEditorRow(trimmedCardText);
            editDeckPenaltyCardList.appendChild(cardRow);
            addedCards++;
        }
    });

    bulkPenaltyCardInput.value = "";
    autoResizeTextarea(bulkPenaltyCardInput);
    bulkPenaltyCardMessage.textContent = addedCards + " straffekort lagt til.";
});

saveDeckButton.addEventListener("click", async function () {
	returnToDeckEditor();

    const cardInputs = document.querySelectorAll("#editDeckCardList .cardEditorInput");

    const cards = [];

    cardInputs.forEach(function (input) {
        const cardText = input.value.trim();

        if (cardText !== "") {
            cards.push(cardText);
        }
    });

const penaltyCardInputs = document.querySelectorAll("#editDeckPenaltyCardList .cardEditorInput");

const penaltyCards = [];

penaltyCardInputs.forEach(function (input) {
    const cardText = input.value.trim();

    if (cardText !== "") {
        penaltyCards.push(cardText);
    }
});

    const updatedDeck = {
        id: deckBeingEdited.id === "ny_kortstokk"
            ? createDeckId(editDeckName.value.trim())
            : deckBeingEdited.id,
        name: editDeckName.value.trim(),
        description: editDeckDescription.value.trim(),
        minPlayers: Number(editDeckMinPlayers.value),
        maxPlayers: Number(editDeckMaxPlayers.value),
        ageRating: editDeckAgeRating.value.trim(),
        playerCountRule: editDeckPlayerCountRule.value,
        cards: cards,
		penaltyCards: penaltyCards
    };

    saveDeckMessage.textContent = "";

    try {
        const savedDeck = await saveDeckData(updatedDeck);

        deckBeingEdited = savedDeck;
        saveDeckMessage.textContent = "Kortstokken er lagret på serveren.";
    } catch (error) {
        saveDeckMessage.textContent =
            "Kunne ikke lagre kortstokken: " + error.message;
    }
});

async function getDeckById(deckId) {
    const response = await fetch("/api/decks/" + deckId);
    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(responseData.error || "Ukjent serverfeil");
    }

    return responseData;
}

function openNewDeckEditor() {
    deckBeingEdited = {
        id: "ny_kortstokk",
        name: "",
        description: "",
        minPlayers: 2,
        maxPlayers: 10,
        ageRating: "16+",
        playerCountRule: "any",
        cards: []
    };

    editDeckName.value = "";
    editDeckDescription.value = "";
    editDeckAgeRating.value = "16+";
    editDeckMinPlayers.value = 2;
    editDeckMaxPlayers.value = 10;
    editDeckPlayerCountRule.value = "any";
	resetTextareaSize(editDeckDescription);

    editDeckCardList.innerHTML = "";
    editDeckPenaltyCardList.innerHTML = "";
    bulkCardInput.value = "";
    bulkPenaltyCardInput.value = "";
    resetTextareaSize(bulkCardInput);
    resetTextareaSize(bulkPenaltyCardInput);
    bulkCardMessage.textContent = "";
    bulkPenaltyCardMessage.textContent = "";
    saveDeckMessage.textContent = "";

    deckEditorScreen.style.display = "none";
    editDeckScreen.style.display = "flex";
}

function createDeckId(name) {
    return name
        .toLowerCase()
        .replaceAll("æ", "ae")
        .replaceAll("ø", "o")
        .replaceAll("å", "a")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

chooseDeckButton.addEventListener("click", function () {
    showScreen(chooseDeckScreen);

    showChooseDeckList();
});

backFromChooseDeckButton.addEventListener("click", function () {
    showScreen(menuScreen);
});

async function showChooseDeckList() {
    deckButtonList.innerHTML = "";
	chooseDeckError.textContent = "";

    let deckList;

    try {
        deckList = await getDeckList();
    } catch (error) {
        const errorMessage = document.createElement("p");
        errorMessage.textContent =
            "Kunne ikke laste kortstokkene: " + error.message;
        deckButtonList.appendChild(errorMessage);
        return;
    }

    deckList.forEach(function (deck) {
        const deckButton = document.createElement("button");
        deckButton.textContent = deck.name;

        deckButton.addEventListener("click", function () {
            showDeckInfo(deck.id);
        });

        deckButtonList.appendChild(deckButton);
    });
}

function showScreen(screenToShow) {
    menuScreen.style.display = "none";
    chooseDeckScreen.style.display = "none";
    deckInfoScreen.style.display = "none";
    deckEditorScreen.style.display = "none";
    editDeckScreen.style.display = "none";
    gameScreen.style.display = "none";
	gameSummaryScreen.style.display = "none";
	cardListScreen.style.display = "none";

    screenToShow.style.display = "flex";
}

async function saveDeckData(deck) {

    const deckExists =
        deckBeingEdited.id !== "ny_kortstokk";

    const method =
        deckExists ? "PUT" : "POST";

    const url =
        deckExists
            ? "/api/decks/" + deck.id
			: "/api/decks";

    const response = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(deck)
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(responseData.error || "Ukjent serverfeil");
    }

    return responseData;
}

async function deleteDeckData(deckId) {
    const response = await fetch(
        "/api/decks/" + deckId,
        {
            method: "DELETE"
        }
    );

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(responseData.error || "Ukjent serverfeil");
    }

    return responseData;
}

async function getDeckList() {
    const response = await fetch("/api/decks");
    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(responseData.error || "Ukjent serverfeil");
    }

    return responseData;
}

insertPlayerButton.addEventListener("click", function () {
    if (activeCardInput !== null) {
        insertPlaceholder(activeCardInput, "{player}");
    }
});

insertPlayer1Button.addEventListener("click", function () {
    if (activeCardInput !== null) {
        insertPlaceholder(activeCardInput, "{player1}");
    }
});

insertPlayer2Button.addEventListener("click", function () {
    if (activeCardInput !== null) {
        insertPlaceholder(activeCardInput, "{player2}");
    }
});

function insertPlaceholder(inputElement, placeholderText) {
    const start = inputElement.selectionStart;
    const end = inputElement.selectionEnd;

    const beforeText = inputElement.value.substring(0, start);
    const afterText = inputElement.value.substring(end);

    inputElement.value = beforeText + placeholderText + afterText;

    const newCursorPosition = start + placeholderText.length;

    inputElement.focus();
    inputElement.setSelectionRange(newCursorPosition, newCursorPosition);

    if (inputElement instanceof HTMLTextAreaElement) {
        autoResizeTextarea(inputElement);
    }
}

function showCardListEditor() {
    cardListNormalCards.innerHTML = "";
    cardListPenaltyCards.innerHTML = "";

    const normalCardRows = editDeckCardList.querySelectorAll(".cardEditorRow");

    normalCardRows.forEach(function(row) {
        cardListNormalCards.appendChild(row);
    });

    const penaltyCardRows = editDeckPenaltyCardList.querySelectorAll(".cardEditorRow");

    penaltyCardRows.forEach(function(row) {
        cardListPenaltyCards.appendChild(row);
    });

    showScreen(cardListScreen);

    requestAnimationFrame(function () {
        resizeEditorTextareas();
    });
}

showCardListButton.addEventListener("click", function () {
    showCardListEditor();
});

function returnToDeckEditor() {
    const normalCardRows = cardListNormalCards.querySelectorAll(".cardEditorRow");

    normalCardRows.forEach(function(row) {
        editDeckCardList.appendChild(row);
    });

    const penaltyCardRows = cardListPenaltyCards.querySelectorAll(".cardEditorRow");

    penaltyCardRows.forEach(function(row) {
        editDeckPenaltyCardList.appendChild(row);
    });

    showScreen(editDeckScreen);
}

backToEditDeckButton.addEventListener("click", function () {
    returnToDeckEditor();
});

bulkPenaltyCardInput.addEventListener("focus", function () {
    activeCardInput = bulkPenaltyCardInput;
});

bulkPenaltyCardInput.addEventListener("click", function () {
    activeCardInput = bulkPenaltyCardInput;
});
