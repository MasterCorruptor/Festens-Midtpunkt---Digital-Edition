const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const configuredPort = Number(process.env.PORT);
const PORT = Number.isInteger(configuredPort) &&
    configuredPort >= 1 &&
    configuredPort <= 65535
    ? configuredPort
    : 3000;
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
        return "Kortstokkdata må være et JSON-objekt.";
    }

    if (typeof deckData.name !== "string" || deckData.name.trim() === "") {
        return "Kortstokken må ha et navn.";
    }

    if (shouldValidateId && !isValidDeckId(deckData.id)) {
        return "Kortstokk-ID kan bare inneholde små bokstaver, tall og understrek.";
    }

    if (typeof deckData.description !== "string") {
        return "Kortstokkbeskrivelsen må være tekst.";
    }

    if (!Number.isInteger(deckData.minPlayers) || deckData.minPlayers < 1) {
        return "Minimum antall spillere må være et positivt heltall.";
    }

    if (!Number.isInteger(deckData.maxPlayers) || deckData.maxPlayers < deckData.minPlayers) {
        return "Maksimum antall spillere må være et heltall som er likt eller større enn minimum.";
    }

    if (typeof deckData.ageRating !== "string" || deckData.ageRating.trim() === "") {
        return "Kortstokken må ha en aldersgrense.";
    }

    const validPlayerCountRules = ["any", "exact", "even", "odd"];

    if (!validPlayerCountRules.includes(deckData.playerCountRule)) {
        return "Spillerregelen må være any, exact, even eller odd.";
    }

    if (deckData.playerCountRule === "exact" &&
        deckData.minPlayers !== deckData.maxPlayers) {
        return "Spillerregelen exact krever at minimum og maksimum er like.";
    }

    const firstEvenPlayerCount = deckData.minPlayers % 2 === 0
        ? deckData.minPlayers
        : deckData.minPlayers + 1;

    if (deckData.playerCountRule === "even" &&
        firstEvenPlayerCount > deckData.maxPlayers) {
        return "Spillerintervallet inneholder ikke et gyldig partall.";
    }

    const firstOddPlayerCount = deckData.minPlayers % 2 !== 0
        ? deckData.minPlayers
        : deckData.minPlayers + 1;

    if (deckData.playerCountRule === "odd" &&
        firstOddPlayerCount > deckData.maxPlayers) {
        return "Spillerintervallet inneholder ikke et gyldig oddetall.";
    }

    if (!Array.isArray(deckData.cards) || deckData.cards.length === 0) {
        return "Kortstokken må inneholde minst ett vanlig kort.";
    }

    const hasInvalidCard = deckData.cards.some(function (card) {
        return typeof card !== "string" || card.trim() === "";
    });

    if (hasInvalidCard) {
        return "Vanlige kort må inneholde tekst.";
    }

    if (deckData.penaltyCards !== undefined) {
        if (!Array.isArray(deckData.penaltyCards)) {
            return "Straffekort må være en liste.";
        }

        const hasInvalidPenaltyCard = deckData.penaltyCards.some(function (card) {
            return typeof card !== "string" || card.trim() === "";
        });

        if (hasInvalidPenaltyCard) {
            return "Straffekort må inneholde tekst.";
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
            error: "Kortstokken ble ikke funnet."
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
			error: "Kortstokk-ID-en finnes allerede."
		});
	}
	
	if (deckNameExists(deckData.name)) {
		return res.status(409).json({
			error: "Kortstokknavnet finnes allerede."
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
            error: "Kortstokken ble ikke funnet."
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
            error: "Kortstokknavnet finnes allerede."
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
            error: "Kortstokken ble ikke funnet."
        });
    }

    if (deckType === "official") {
        return res.status(403).json({
            error: "Offisielle kortstokker kan ikke slettes."
        });
    }

    const filePath = getCustomDeckFilePath(deckId);

    fs.unlinkSync(filePath);

    res.json({
        success: true
    });
});

app.use("/api", function (req, res) {
    res.status(404).json({
        error: "API-adressen ble ikke funnet."
    });
});

app.use(function (error, req, res, next) {
    console.error("Uventet serverfeil:", error);

    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return res.status(400).json({
            error: "Forespørselen inneholder ugyldig JSON."
        });
    }

    if (res.headersSent) {
        return next(error);
    }

    res.status(500).json({
        error: "En intern serverfeil oppstod. Prøv igjen senere."
    });
});

app.listen(PORT, function () {
    console.log("Server kjører på http://localhost:" + PORT);
});
