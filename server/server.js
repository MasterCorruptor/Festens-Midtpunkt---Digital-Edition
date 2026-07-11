const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const officialDecksPath = path.join(__dirname, "data", "decks", "official");
const customDecksPath = path.join(__dirname, "data", "decks", "custom");

function readDeckSummariesFromFolder(folderPath, deckType) {
    const files = fs.readdirSync(folderPath);

    return files
        .filter(function (file) {
            return file.endsWith(".json");
        })
        .map(function (file) {
            const filePath = path.join(folderPath, file);
            const deckData = JSON.parse(fs.readFileSync(filePath, "utf8"));

            return {
                id: deckData.id,
                name: deckData.name,
                type: deckType
            };
        });
}

function findDeckById(folderPath, deckId, deckType) {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
        if (!file.endsWith(".json")) {
            continue;
        }

        const filePath = path.join(folderPath, file);
        const deckData = JSON.parse(fs.readFileSync(filePath, "utf8"));

        if (deckData.id === deckId) {
            deckData.type = deckType;
            return deckData;
        }
    }

    return null;
}

function getCustomDeckFilePath(deckId) {
    return path.join(customDecksPath, deckId + ".json");
}

function getOfficialDeckFilePath(deckId) {
    return path.join(officialDecksPath, deckId + ".json");
}

function isValidDeckId(deckId) {
    return typeof deckId === "string" && /^[a-z0-9_]+$/.test(deckId);
}

function getDeckValidationError(deckData, shouldValidateId) {
    if (deckData === null || typeof deckData !== "object" || Array.isArray(deckData)) {
        return "Deck data must be a JSON object";
    }

    if (typeof deckData.name !== "string" || deckData.name.trim() === "") {
        return "Deck name is required";
    }

    if (shouldValidateId && !isValidDeckId(deckData.id)) {
        return "Deck id must use lowercase letters, numbers, or underscores";
    }

    if (typeof deckData.description !== "string") {
        return "Deck description must be a string";
    }

    if (!Number.isInteger(deckData.minPlayers) || deckData.minPlayers < 1) {
        return "Deck minPlayers must be a positive integer";
    }

    if (!Number.isInteger(deckData.maxPlayers) || deckData.maxPlayers < deckData.minPlayers) {
        return "Deck maxPlayers must be an integer greater than or equal to minPlayers";
    }

    if (typeof deckData.ageRating !== "string" || deckData.ageRating.trim() === "") {
        return "Deck ageRating is required";
    }

    const validPlayerCountRules = ["any", "exact", "even", "odd"];

    if (!validPlayerCountRules.includes(deckData.playerCountRule)) {
        return "Deck playerCountRule must be any, exact, even, or odd";
    }

    if (deckData.playerCountRule === "exact" &&
        deckData.minPlayers !== deckData.maxPlayers) {
        return "Deck exact rule requires matching minPlayers and maxPlayers";
    }

    const firstEvenPlayerCount = deckData.minPlayers % 2 === 0
        ? deckData.minPlayers
        : deckData.minPlayers + 1;

    if (deckData.playerCountRule === "even" &&
        firstEvenPlayerCount > deckData.maxPlayers) {
        return "Deck player range does not contain an even player count";
    }

    const firstOddPlayerCount = deckData.minPlayers % 2 !== 0
        ? deckData.minPlayers
        : deckData.minPlayers + 1;

    if (deckData.playerCountRule === "odd" &&
        firstOddPlayerCount > deckData.maxPlayers) {
        return "Deck player range does not contain an odd player count";
    }

    if (!Array.isArray(deckData.cards) || deckData.cards.length === 0) {
        return "Deck must contain at least one card";
    }

    const hasInvalidCard = deckData.cards.some(function (card) {
        return typeof card !== "string" || card.trim() === "";
    });

    if (hasInvalidCard) {
        return "Deck cards must be non-empty strings";
    }

    if (deckData.penaltyCards !== undefined) {
        if (!Array.isArray(deckData.penaltyCards)) {
            return "Deck penaltyCards must be an array";
        }

        const hasInvalidPenaltyCard = deckData.penaltyCards.some(function (card) {
            return typeof card !== "string" || card.trim() === "";
        });

        if (hasInvalidPenaltyCard) {
            return "Deck penaltyCards must contain only non-empty strings";
        }
    }

    return null;
}

function deckExists(deckId) {
    const officialDeck = findDeckById(officialDecksPath, deckId, "official");
    const customDeck = findDeckById(customDecksPath, deckId, "custom");

    return officialDeck !== null || customDeck !== null;
}

function deckNameExists(deckName, excludedDeckId) {
    const allDecks = readDeckSummariesFromFolder(officialDecksPath, "official")
        .concat(readDeckSummariesFromFolder(customDecksPath, "custom"));

    return allDecks.some(function (deck) {
        return deck.id !== excludedDeckId &&
            deck.name.toLowerCase() === deckName.toLowerCase();
    });
}

function getDeckType(deckId) {
    if (findDeckById(officialDecksPath, deckId, "official")) {
        return "official";
    }

    if (findDeckById(customDecksPath, deckId, "custom")) {
        return "custom";
    }

    return null;
}

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "..")));

app.get("/api/decks", function (req, res) {
    const officialDecks = readDeckSummariesFromFolder(officialDecksPath, "official");
    const customDecks = readDeckSummariesFromFolder(customDecksPath, "custom");

    res.json(officialDecks.concat(customDecks));
});

app.get("/api/decks/:id", function (req, res) {
    const deckId = req.params.id;

    let deckData = findDeckById(officialDecksPath, deckId, "official");

    if (deckData === null) {
        deckData = findDeckById(customDecksPath, deckId, "custom");
    }

    if (deckData === null) {
        return res.status(404).json({
            error: "Deck not found"
        });
    }

    res.json(deckData);
});

app.post("/api/decks", function (req, res) {
    const deckData = req.body;
	const validationError = getDeckValidationError(deckData, true);

	if (validationError !== null) {
		return res.status(400).json({
			error: validationError
		});
	}

	deckData.type = "custom";
	
	if (deckExists(deckData.id)) {
		return res.status(409).json({
			error: "Deck id already exists"
		});
	}
	
	if (deckNameExists(deckData.name)) {
		return res.status(409).json({
			error: "Deck name already exists"
		});
	}
	
    const filePath = getCustomDeckFilePath(deckData.id);

    fs.writeFileSync(
        filePath,
        JSON.stringify(deckData, null, 4),
        "utf8"
    );

    res.status(201).json(deckData);
});

app.put("/api/decks/:id", function (req, res) {
    const deckId = req.params.id;
    const deckData = req.body;

    const deckType = getDeckType(deckId);

    if (deckType === null) {
        return res.status(404).json({
            error: "Deck not found"
        });
    }

    const validationError = getDeckValidationError(deckData, false);

    if (validationError !== null) {
        return res.status(400).json({
            error: validationError
        });
    }

    if (deckNameExists(deckData.name, deckId)) {
        return res.status(409).json({
            error: "Deck name already exists"
        });
    }

    deckData.id = deckId;
    deckData.type = deckType;

    const filePath = deckType === "official"
        ? getOfficialDeckFilePath(deckId)
        : getCustomDeckFilePath(deckId);

    fs.writeFileSync(
        filePath,
        JSON.stringify(deckData, null, 4),
        "utf8"
    );

    res.json(deckData);
});

app.delete("/api/decks/:id", function (req, res) {
    const deckId = req.params.id;

    const deckType = getDeckType(deckId);

    if (deckType === null) {
        return res.status(404).json({
            error: "Deck not found"
        });
    }

    if (deckType === "official") {
        return res.status(403).json({
            error: "Official decks cannot be deleted"
        });
    }

    const filePath = getCustomDeckFilePath(deckId);

    fs.unlinkSync(filePath);

    res.json({
        success: true
    });
});

app.listen(PORT, function () {
    console.log("Server kjører på http://localhost:" + PORT);
});
