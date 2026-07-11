# Roadmap

This roadmap separates confirmed limitations observed in the current repository from proposed work. Proposed items are not implemented commitments and do not describe current functionality.

Current documented release: **v0.5.0**.

## Current baseline

The application currently provides:

- three filesystem-backed official decks;
- filesystem-backed creation, editing, and deletion of custom decks;
- in-memory player registration;
- deck player-count checks;
- client-side shuffling and placeholder replacement;
- a single Express process serving both UI and API;
- direct Node and Docker Compose execution.

## Confirmed limitations

### Validation and error handling

- Implemented deck fields are validated before persistence; additional unknown properties are still accepted.
- Synchronous filesystem and JSON errors lack route-level handling.

### Testing

- `npm test` is only the package-manager placeholder and exits with an error.
- There are no API, deck-format, placeholder, game-flow, or Docker smoke tests.

### Game and editor behavior

- Player and game state are cleared on reload.
- Older or manually created empty decks are blocked at game start.
- Placeholder demand is not tied to minimum player count.
- Player-rule validation rejects unsatisfiable `exact`, `even`, and `odd` ranges.
- Custom-deck deletion now requires confirmation.
- API failures are now presented in the relevant deck-list, information, game-start, editor, save, and delete flows.

### Deployment

- The dependency lockfile is ignored, and the image uses `npm install`.
- There is no `.dockerignore` or health check.
- The port is fixed at `3000` inside the process.
- The Compose bind mount replaces all server deck data, not only custom data.

## Proposed priorities

### 1. Preserve and verify the baseline

- Keep the README and `/docs` pages synchronized with behavior changes.
- Keep `server/data/decks/official` as the single authoritative source for bundled official decks.
- Add repeatable manual smoke-test instructions and representative fixture expectations.

### 2. Add focused automated tests

- Test all API success and documented error paths.
- Test player-count rules and placeholder edge cases.
- Test custom-deck persistence in a temporary data directory.
- Add a container build/start/API smoke test.

### 3. Strengthen validation and errors

- Decide whether unknown deck properties should be rejected or preserved for forward compatibility.
- Return consistent JSON errors for malformed or failed operations.
- Make the frontend check response status and show actionable messages.
- Preserve current endpoint and deck-field compatibility while adding validation.

### 4. Improve deployment correctness

- Track and enforce a dependency lockfile.
- Add a minimal `.dockerignore`.
- Add health checking and configurable port support with the current default retained.
- Confirm a persistence layout that protects custom decks without making official decks dependent on an incomplete host mount.

### 5. Isolated usability fixes

- Correct the persistence wording in the editor.
- Improve editor-side validation before requests are sent.
- Explain deck-specific player rules in the selection flow.
- Improve editor feedback and validation consistency.

## Deferred README ideas requiring separate approval

The README lists import/export, improved mobile UI, user accounts, sharing, synchronization, an administration panel, and a deck library. None are implemented in the current repository. They are not prioritized here because they expand scope beyond stabilizing and documenting the recovered baseline. Each should be evaluated as a separate implementation task before inclusion in an active roadmap.

## Change constraints

Future work should remain incremental, preserve the current stack, maintain API and JSON compatibility unless a migration is approved, keep Docker deployment working, and update documentation whenever behavior changes.
