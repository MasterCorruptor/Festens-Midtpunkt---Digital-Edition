# Architecture

## Current implementation

Festens Midtpunkt is a single-process web application. A Node.js/Express server serves the static frontend and exposes a JSON API for deck discovery and custom-deck persistence. There is no build step, database, authentication layer, or separate frontend service.

### Frontend responsibilities

The frontend consists of `index.html`, `style.css`, and `script.js` in the repository root. It:

- switches between menu, deck selection, deck information, editor, and game screens by changing element display styles;
- keeps the registered players, selected deck, current shuffled cards, counters, and summary statistics in browser memory;
- fetches deck summaries and full deck data from `/api/decks`;
- validates the selected deck's player-count rules before starting;
- shuffles cards, advances through them, and replaces player placeholders;
- sends create, update, and delete requests for custom decks.

Refreshing or closing the page clears players and game state. Decks are not stored in browser Local Storage.

### Backend responsibilities

`server/server.js`:

- serves the repository root as static content;
- parses JSON request bodies and enables CORS;
- reads official and custom deck JSON files synchronously;
- returns deck lists and full deck objects;
- creates, updates, and deletes custom-deck files;
- permits editing official and custom decks, while preventing deletion of official decks;
- listens on the fixed internal port `3000`.

### Storage model

Runtime deck storage is under `server/data/decks`:

- `official/` contains the three bundled decks. They can be updated through the editor/API but cannot be deleted through the API.
- `custom/` contains one writable JSON file per custom deck. It is currently empty.

The API scans these directories on each request; it does not maintain an in-memory catalog. The custom filename is derived as `<deck id>.json`.

`server/data/decks/official` is the single authoritative location for official deck data.

### Data flow

1. Express serves `index.html`, `style.css`, and `script.js`.
2. The browser requests `GET /api/decks` to populate deck lists.
3. The browser requests `GET /api/decks/:id` for deck information, editing, and game start.
4. During play, shuffling and placeholder replacement happen entirely in the browser.
5. Editor actions send `POST`, `PUT`, or `DELETE` requests to the API.
6. The server writes or removes JSON files in `server/data/decks/custom`.

## Deployment model

Direct execution uses `npm start` from `server/` and exposes port `3000`. Docker builds one Node 24 Alpine image. Docker Compose maps host port `27015` to container port `3000` and bind-mounts `./server/data` at `/app/server/data`. The application is therefore reached at `http://localhost:27015` on the Docker host or `http://<server-ip>:27015` from another machine that can reach the host and port.

See [docker.md](docker.md) for operational details.

## Important architectural constraints

- The documented project stack is HTML, CSS, vanilla JavaScript, Node.js, Express, JSON, Docker, and Docker Compose.
- Existing API and JSON formats are compatibility surfaces.
- Official decks are protected against deletion by API behavior, not filesystem permissions. They remain writable through the update endpoint.
- State is single-host filesystem state; there is no locking or coordination for concurrent writes.
- All filesystem operations are synchronous and errors are not handled locally.
- The static middleware exposes the repository root, including files not required by the UI. What is present depends on the deployed copy.

## Known limitations

- There are no automated tests or formal schema validation.
- Save, delete, deck-list, and individual-deck read failures are surfaced in their relevant frontend screens.
- The browser retains no player or in-progress game state across reloads.
- API validation covers the implemented deck fields, while additional unknown properties are currently preserved rather than rejected.

## Suggested improvements

Proposals, not current behavior:

- Add predictable JSON handling for unexpected filesystem and parsing errors.
- Add focused API and browser-flow tests.
- Restrict static serving to the actual public assets.
