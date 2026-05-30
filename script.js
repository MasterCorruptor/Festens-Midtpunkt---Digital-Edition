const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");

const menuButton = document.getElementById("menuButton");

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
const backToDeckEditorButton = document.getElementById("backToDeckEditorButton");

const addCardToDeckButton = document.getElementById("addCardToDeckButton");
const saveDeckButton = document.getElementById("saveDeckButton");
const saveDeckMessage = document.getElementById("saveDeckMessage");

const chooseDeckButton = document.getElementById("chooseDeckButton");
const chooseDeckScreen = document.getElementById("chooseDeckScreen");

const backFromChooseDeckButton =
    document.getElementById("backFromChooseDeckButton");

let players = [];
let currentDeck = null;
let currentCardIndex = 0;
let recentCards = [];
let selectedDeckId = null;
let deckBeingEdited = null;


async function showDeckInfo(deckId) {

    const deckListResponse = await fetch("data/decks/index.json");
	const defaultDeckList = await deckListResponse.json();

	const localDeckList =
		JSON.parse(localStorage.getItem("localDeckList")) || [];

	const deckList = defaultDeckList.concat(localDeckList);

	const selectedDeck = deckList.find(function (deck) {
		return deck.id === deckId;
	});

    let deckData;

	if (selectedDeck.file === null) {
		deckData = JSON.parse(localStorage.getItem("deck_" + selectedDeck.id));
	}
	else {
		deckData = await loadDeck(selectedDeck.file);
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
	if (isValidPlayerCount(deckData, players.length)) {
    deckCurrentPlayerStatus.textContent =
        "✓ " + players.length + " spillere registrert";
	}
	else {
    deckCurrentPlayerStatus.textContent =
        "✗ " + players.length + " spillere registrert";
	}
    menuScreen.style.display = "none";
	chooseDeckScreen.style.display = "none";
	deckInfoScreen.style.display = "flex";
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

    const deckListResponse = await fetch("data/decks/index.json");
	const defaultDeckList = await deckListResponse.json();

	const localDeckList =
		JSON.parse(localStorage.getItem("localDeckList")) || [];

	const deckList = defaultDeckList.concat(localDeckList);

	const selectedDeck = deckList.find(function (deck) {
		return deck.id === deckId;
	});

	if (selectedDeck.file === null) {
		currentDeck = JSON.parse(
			localStorage.getItem("deck_" + selectedDeck.id)
		);
	}
	else {
		currentDeck = await loadDeck(selectedDeck.file);
	}
	
	console.log("Spillere:", players.length);
	console.log("Min:", currentDeck.minPlayers);
	console.log("Max:", currentDeck.maxPlayers);
	console.log("Rule:", currentDeck.playerCountRule);

    if (!isValidPlayerCount(currentDeck, players.length)) {
        deckError.textContent = "Antall spillere passer ikke for denne kortstokken.";
        return;
    }

    currentDeck.cards = shuffleCards(currentDeck.cards);
    currentCardIndex = 0;

    menuScreen.style.display = "none";
    deckInfoScreen.style.display = "none";
    gameScreen.style.display = "flex";

    cardText.textContent = prepareCardText(currentDeck.cards[currentCardIndex]);
    recentCards = [currentDeck.cards[currentCardIndex]];
}

cardText.addEventListener("click", function () {
    showNextCard();
});

menuButton.addEventListener("click", function () {
    gameScreen.style.display = "none";
    menuScreen.style.display = "flex";

    cardText.textContent = "";
    currentDeck = null;
    currentCardIndex = 0;
});

addPlayerButton.addEventListener("click", function () {

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
});

deckEditorButton.addEventListener("click", function () {
    menuScreen.style.display = "none";
    deckEditorScreen.style.display = "flex";

    showDeckEditorList();
});

backFromEditorButton.addEventListener("click", function () {
    deckEditorScreen.style.display = "none";
    menuScreen.style.display = "flex";
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

function showNextCard() {
    currentCardIndex++;

    if (currentCardIndex >= currentDeck.cards.length) {
        currentDeck.cards = shuffleCards(currentDeck.cards);

        let attempts = 0;

        while (
            recentCards.includes(currentDeck.cards[0]) &&
            attempts < 20
        ) {
            currentDeck.cards = shuffleCards(currentDeck.cards);
            attempts++;
        }

        currentCardIndex = 0;
    }

    const nextCard = currentDeck.cards[currentCardIndex];

    cardText.textContent = prepareCardText(nextCard);

    recentCards.push(nextCard);

    if (recentCards.length > 2) {
        recentCards.shift();
    }
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
            preparedText = preparedText.replaceAll(placeholder, playerName);
        }
    });

    return preparedText;
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

	const deckListResponse = await fetch("data/decks/index.json");
	const defaultDeckList = await deckListResponse.json();

	const localDeckList =
		JSON.parse(localStorage.getItem("localDeckList")) || [];

	const deckList = defaultDeckList.concat(localDeckList);

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

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Slett";
        deleteButton.classList.add("removeButton");
		
		deleteButton.addEventListener("click", function () {

			localStorage.removeItem("deck_" + deck.id);

			let localDeckList =
				JSON.parse(localStorage.getItem("localDeckList")) || [];

			localDeckList = localDeckList.filter(function (localDeck) {
				return localDeck.id !== deck.id;
			});

			localStorage.setItem(
				"localDeckList",
				JSON.stringify(localDeckList)
			);

			showDeckEditorList();
		});
		
		if (deck.file !== null) {
			deleteButton.disabled = true;
		}

        deckRow.appendChild(deckName);
        deckRow.appendChild(editButton);
        deckRow.appendChild(deleteButton);

        deckEditorList.appendChild(deckRow);
    });
}

async function openDeckForEditing(deck) {
    let deckData;

	if (deck.file === null) {
		deckData = JSON.parse(localStorage.getItem("deck_" + deck.id));
	}
	else {
		deckData = await loadDeck(deck.file);
	}

    deckBeingEdited = deckData;

    editDeckName.value = deckData.name;
    editDeckDescription.value = deckData.description;
    editDeckAgeRating.value = deckData.ageRating;
    editDeckMinPlayers.value = deckData.minPlayers;
    editDeckMaxPlayers.value = deckData.maxPlayers;
    editDeckPlayerCountRule.value = deckData.playerCountRule;

    editDeckCardList.innerHTML = "";

    deckData.cards.forEach(function (card) {

		const cardRow = createCardEditorRow(card);

		editDeckCardList.appendChild(cardRow);
	});

    deckEditorScreen.style.display = "none";
    editDeckScreen.style.display = "flex";
}

backToDeckEditorButton.addEventListener("click", function () {
    editDeckScreen.style.display = "none";
    deckEditorScreen.style.display = "flex";

    showDeckEditorList();
});

function createCardEditorRow(cardText) {

    const cardRow = document.createElement("div");
    cardRow.classList.add("cardEditorRow");

    const cardInput = document.createElement("input");
    cardInput.type = "text";
    cardInput.value = cardText;
    cardInput.classList.add("cardEditorInput");

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

addCardToDeckButton.addEventListener("click", function () {
    const cardRow = createCardEditorRow("");

    editDeckCardList.appendChild(cardRow);
});

saveDeckButton.addEventListener("click", function () {
    const cardInputs = editDeckCardList.querySelectorAll(".cardEditorInput");

    const cards = [];

    cardInputs.forEach(function (input) {
        const cardText = input.value.trim();

        if (cardText !== "") {
            cards.push(cardText);
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
        cards: cards
    };

    localStorage.setItem(
		"deck_" + updatedDeck.id,
		JSON.stringify(updatedDeck)
	);
	
	let localDeckList =
    JSON.parse(localStorage.getItem("localDeckList")) || [];

const deckAlreadyExists = localDeckList.some(function (deck) {
    return deck.id === updatedDeck.id;
});

if (!deckAlreadyExists) {
    localDeckList.push({
        id: updatedDeck.id,
        name: updatedDeck.name,
        file: null
    });
}
else {
    localDeckList = localDeckList.map(function (deck) {
        if (deck.id === updatedDeck.id) {
            return {
                id: updatedDeck.id,
                name: updatedDeck.name,
                file: null
            };
        }

        return deck;
    });
}

localStorage.setItem(
    "localDeckList",
    JSON.stringify(localDeckList)
);

	console.log(updatedDeck);

	saveDeckMessage.textContent =
    "Kortstokken er lagret lokalt.";
});

async function loadDeck(deckFile) {
    const response = await fetch("data/decks/" + deckFile);
    const deckData = await response.json();

    const savedDeck = localStorage.getItem("deck_" + deckData.id);

    if (savedDeck !== null) {
        return JSON.parse(savedDeck);
    }

    return deckData;
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

    editDeckCardList.innerHTML = "";
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
    menuScreen.style.display = "none";
    chooseDeckScreen.style.display = "flex";

    showChooseDeckList();
});

backFromChooseDeckButton.addEventListener("click", function () {
    chooseDeckScreen.style.display = "none";
    menuScreen.style.display = "flex";
});

async function showChooseDeckList() {
    deckButtonList.innerHTML = "";

    const deckListResponse = await fetch("data/decks/index.json");
    const defaultDeckList = await deckListResponse.json();

    const localDeckList =
        JSON.parse(localStorage.getItem("localDeckList")) || [];

    const deckList = defaultDeckList.concat(localDeckList);

    deckList.forEach(function (deck) {
        const deckButton = document.createElement("button");
        deckButton.textContent = deck.name;

        deckButton.addEventListener("click", function () {
            showDeckInfo(deck.id);
        });

        deckButtonList.appendChild(deckButton);
    });
}

