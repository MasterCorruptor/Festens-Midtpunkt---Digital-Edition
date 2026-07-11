# Deck JSON format

## Current implemented shape

There is no formal JSON Schema or server-side validator. The following shape is the complete format consistently produced by the editor and consumed by the game UI:

```json
{
  "id": "par",
  "name": "Par",
  "description": "Kort for par.",
  "minPlayers": 2,
  "maxPlayers": 4,
  "ageRating": "16+",
  "playerCountRule": "even",
  "cards": [
    "Par 1 - Hva setter du mest pris på hos partneren din?",
    "Par 2 - Hva var ditt første inntrykk av {player}?",
    "Par 3 - {player}, beskriv en perfekt date for deg."
  ]
}
```

This example is from `server/data/decks/official/par.json`.

## Fields

| Field | Observed type | Current use |
| --- | --- | --- |
| `id` | string | Unique API identity; custom filename base; generated from a new deck's name by the frontend. |
| `name` | string | Display name in selection and editor lists. |
| `description` | string | Displayed on the deck information screen. |
| `minPlayers` | number | Inclusive lower bound checked before game start. |
| `maxPlayers` | number | Inclusive upper bound checked before game start. |
| `ageRating` | string | Display-only label, for example `"16+"` or `"Alle"`. |
| `playerCountRule` | string | Additional player-count rule: `any`, `exact`, `even`, or `odd`. |
| `cards` | array of strings | Ordered card texts before client-side shuffling. |
| `type` | string | Server-derived classification, `official` or `custom`; bundled official files may initially omit it, while API updates persist it. |

## Card structure

Each card is a plain JSON string. There is no card ID, category, weight, or nested metadata. Card strings may contain the placeholders described in [placeholder-system.md](placeholder-system.md).

Actual examples from `fest.json` include:

```json
"Kort 2 - Fortell om en pinlig opplevelse."
```

```json
"Kort 5 - {player} og {player} må sammarbeide!"
```

```json
"Kort 7 - {player1} må fortelle en vits til {player2}. Dersom {player2} ler, må {player2} gi {player1} en klem."
```

## Player-count rules

- `any`: only the inclusive minimum and maximum checks apply.
- `even`: the count must be within the range and even.
- `odd`: the count must be within the range and odd.
- `exact`: the count must equal both `minPlayers` and `maxPlayers`; API validation requires those two fields to be equal.
- Any other value currently falls through to the same behavior as `any` after range checks.

API validation also requires an `even` range to contain at least one even number and an `odd` range to contain at least one odd number.

## Editor-generated IDs

For new decks, the frontend lowercases the name, transliterates `æ`, `ø`, and `å` to `ae`, `o`, and `a`, replaces runs of other non-ASCII-alphanumeric characters with `_`, and trims leading/trailing underscores. Existing custom-deck IDs are retained on edit.

The API enforces the resulting storage-safe format for new decks: at least one lowercase ASCII letter, number, or underscore. Direct API clients cannot create IDs containing other characters.

## Validation assumptions

The UI assumes:

- every fetched deck contains all listed fields;
- `minPlayers` and `maxPlayers` can be compared numerically;
- `cards` is a non-empty array of strings;
- names and IDs are suitable for display and lookup.

The editor trims names, descriptions, age ratings, and cards, converts player counts with `Number`, drops blank card inputs, and limits `playerCountRule` through a select element. Invalid values may still be sent from the editor, but the server validates the complete implemented deck shape before persistence and returns a visible error to the editor.

The server validates the deck object before creation or update. It requires a storage-safe ID for creation, non-blank `name` and `ageRating` strings, a string `description`, valid and satisfiable integer player bounds/rules, at least one non-empty string in `cards`, and only non-empty strings in optional `penaltyCards`. Creation checks duplicate ID, and both creation and update reject a case-insensitive name collision with another deck. Additional unknown properties are not rejected.

## Compatibility considerations

- Keep the existing field names and primitive types for current browser compatibility.
- `type` should remain server-controlled. Official source files may initially omit it; API updates persist the existing server-derived type.
- Adding nested card objects would break the current game and editor, which treat cards as strings.
- Empty `cards` arrays are rejected by the API. Game start also checks this condition to handle older or manually created invalid files safely.
- Duplicate IDs inside manually edited files make lookup ambiguous; the first file returned by directory enumeration wins.

## Authoritative storage

Bundled official deck files are stored under `server/data/decks/official`. There is no secondary root-level deck catalog.
