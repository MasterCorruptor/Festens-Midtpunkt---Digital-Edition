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

function deckExists(deckId) {
    const officialDeck = findDeckById(officialDecksPath, deckId, "official");
    const customDeck = findDeckById(customDecksPath, deckId, "custom");

    return officialDeck !== null || customDeck !== null;
}

function deckNameExists(deckName) {
    const allDecks = readDeckSummariesFromFolder(officialDecksPath, "official")
        .concat(readDeckSummariesFromFolder(customDecksPath, "custom"));

    return allDecks.some(function (deck) {
        return deck.name.toLowerCase() === deckName.toLowerCase();
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

    if (deckType === "official") {
        return res.status(403).json({
            error: "Official decks cannot be edited"
        });
    }

    deckData.id = deckId;
    deckData.type = "custom";

    const filePath = getCustomDeckFilePath(deckId);

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