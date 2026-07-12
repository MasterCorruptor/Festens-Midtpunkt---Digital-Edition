# HTTP API

## Current implementation

The API is implemented in `server/server.js`, uses JSON request and response bodies for its explicit routes, and listens on port `3000`. CORS is enabled without an origin restriction. There is no authentication.

### Endpoint summary

| Method | Path | Purpose | Official decks | Custom decks |
| --- | --- | --- | --- | --- |
| `GET` | `/api/decks` | List deck summaries | Read | Read |
| `GET` | `/api/decks/:id` | Get a full deck | Read | Read |
| `POST` | `/api/decks` | Create a deck | Cannot create over an official ID/name | Create |
| `PUT` | `/api/decks/:id` | Replace a deck | Update | Update |
| `DELETE` | `/api/decks/:id` | Delete a deck | Forbidden | Delete |

### `GET /api/decks`

Returns `200 OK` with an array. Official summaries are returned first, followed by custom summaries; filesystem enumeration order is not explicitly sorted.

```json
[
  {
    "id": "fest",
    "name": "Fest",
    "type": "official"
  }
]
```

Only `id`, `name`, and server-derived `type` are included.

### `GET /api/decks/:id`

Returns `200 OK` with the complete stored deck plus a server-derived `type` field:

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
  ],
  "type": "official"
}
```

If no matching ID exists, returns `404`:

```json
{ "error": "Kortstokken ble ikke funnet." }
```

Official decks are searched before custom decks.

### `POST /api/decks`

Accepts a JSON object. The editor sends the fields documented in [deck-format.md](deck-format.md). The server mutates the object to set `type` to `custom`, then writes it to `server/data/decks/custom/<id>.json`.

Success: `201 Created` with the stored object, including `"type": "custom"`.

Conflict responses:

- `409` with `{ "error": "Kortstokk-ID-en finnes allerede." }` when an official or custom deck has the same exact ID.
- `409` with `{ "error": "Kortstokknavnet finnes allerede." }` when an official or custom deck name matches case-insensitively.

Validation response:

- `400` with `{ "error": "Kortstokkdata må være et JSON-objekt." }` when the body is not a JSON object.
- `400` with `{ "error": "Kortstokk-ID kan bare inneholde små bokstaver, tall og understrek." }` when `id` is missing, empty, not a string, or contains other characters.
- `400` when `name` or `ageRating` is missing, not a string, or blank.
- `400` when `description` is not a string.
- `400` when `minPlayers` is not a positive integer, or `maxPlayers` is not an integer greater than or equal to it.
- `400` when `playerCountRule` is not `any`, `exact`, `even`, or `odd`.
- `400` when `exact` has different minimum and maximum values, or an `even`/`odd` range contains no permitted player count.
- `400` with `{ "error": "Kortstokken må inneholde minst ett vanlig kort." }` when `cards` is missing, is not an array, or is empty.
- `400` when a normal or penalty card is not a non-empty string, or when `penaltyCards` is present but is not an array.

The server validates the implemented deck fields and card element types before writing the request. It does not reject additional unknown properties.

### `PUT /api/decks/:id`

Accepts a JSON object and replaces the official or custom deck file identified by the path parameter. The server overrides body values for `id` and `type`, using the path ID and the existing deck type.

Success: `200 OK` with the stored replacement object.

Errors:

- `404` with `{ "error": "Kortstokken ble ikke funnet." }` if the path ID is unknown.
- `400` when the replacement fails the same deck validation used for creation, except that the path supplies the existing ID.
- `409` with `{ "error": "Kortstokknavnet finnes allerede." }` when another official or custom deck already uses the submitted name, compared case-insensitively.

The current deck is excluded from the duplicate-name comparison, so it can be saved without changing its name. Official decks can be updated but remain protected from deletion.

### `DELETE /api/decks/:id`

Deletes the custom file derived from the path ID.

Success: `200 OK`:

```json
{ "success": true }
```

Errors:

- `404` with `{ "error": "Kortstokken ble ikke funnet." }` if the ID is unknown.
- `403` with `{ "error": "Offisielle kortstokker kan ikke slettes." }` for an official deck.

## General error behavior and limitations

- Malformed JSON returns `400` with `{ "error": "Forespørselen inneholder ugyldig JSON." }`.
- JSON parsing, directory access, file writes, and file deletion use synchronous calls. Unexpected failures are logged with their technical details on the server, while the client receives `500` with a generic Norwegian error that does not expose internal paths or stack traces.
- Deck list, individual-deck read, save, and delete flows check HTTP status and display API errors on their relevant frontend screens.
- Unknown `/api/...` paths return `404` with `{ "error": "API-adressen ble ikke funnet." }`.
- New deck IDs are restricted to lowercase ASCII letters, numbers, and underscores before a filename is constructed.

## Compatibility notes

The `type` field is server-controlled for normal API operations. Bundled official JSON files may initially omit it, and GET responses add it in memory. Files replaced through PUT include the existing server-derived type. Official deck data is stored only under `server/data/decks/official`.
