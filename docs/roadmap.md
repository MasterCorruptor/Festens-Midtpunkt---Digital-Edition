# Roadmap

This roadmap separates confirmed limitations observed in the current repository from proposed work. Proposed items are not implemented commitments and do not describe current functionality.

Current documented release: **v0.8.0**.

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

- The dependency lockfile is tracked, but the image still uses `npm install` instead of `npm ci`.
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
- Keep frontend response handling and actionable messages consistent as endpoints evolve.
- Preserve current endpoint and deck-field compatibility while adding validation.

### 4. Improve deployment correctness

- Track and enforce a dependency lockfile.
- Add a minimal `.dockerignore`.
- Add health checking and configurable port support with the current default retained.
- Confirm a persistence layout that protects custom decks without making official decks dependent on an incomplete host mount.

### 5. Isolated usability fixes

- Improve editor-side validation before requests are sent.
- Explain deck-specific player rules in the selection flow.
- Improve editor feedback and validation consistency.

## v0.6.0 worklist

The following items are approved goals for the next version. They are planning targets, not current behavior. Each item should be implemented and manually verified separately before the next item begins.

### Goal 1: Revise the deck editor layout

Status: **Completed and manually verified.**

#### Objective

Make the deck editor easier to scan and operate without excessive vertical scrolling, while retaining every current field and function.

#### Scope

- Group related metadata fields into clear sections.
- Use available horizontal space on wider screens, for example a two-column metadata layout where practical.
- Keep a single-column, touch-friendly layout on narrow screens.
- Keep primary actions such as save, card-list navigation, and back navigation easy to reach.
- Preserve bulk import, placeholder tools, normal cards, penalty cards, and the separate card-list screen.
- Coordinate the editor structure with the persistent bottom actions described in Goal 6.

#### Acceptance criteria

- All existing editor functions remain available.
- Common metadata can be reviewed with materially less scrolling on a typical desktop viewport.
- Labels remain visually associated with the correct fields.
- No controls overlap or extend outside the viewport.
- The editor remains usable at mobile width without horizontal page scrolling.
- Opening, saving, returning, and reopening a deck preserves the correct data.

#### Risks and dependencies

- Layout changes can affect keyboard focus order and mobile behavior.
- This goal should coordinate with Goal 4 so autosizing fields do not undermine the compact layout.

### Goal 2: Show player-rule identifiers in labels

Status: **Completed and manually verified.**

#### Objective

Include the implemented rule identifier in parentheses wherever a player rule is presented to the user.

#### Target labels

- `Opp til maks spillere (any)`
- `Akkurat samme som min og maks dersom de er like (exact)`
- `Må være partall med spillere (even)`
- `Må være oddetall med spillere (odd)`

#### Acceptance criteria

- Every editor option includes its identifier in parentheses.
- Deck information explains the selected rule, not only the numeric range.
- The underlying values sent to the API remain `any`, `exact`, `even`, and `odd`.
- Existing decks load and save without changing their stored rule values.
- Player-count validation behavior remains unchanged.

### Goal 3: Differentiate menu-navigation buttons

Status: **Completed and manually verified.**

#### Objective

Give `Tilbake til meny` buttons a distinct, consistent color treatment so they are immediately recognizable as navigation rather than a primary game/editor action.

#### Scope

- Apply a dedicated reusable CSS class to menu-return buttons.
- Define normal, hover, focus, active, and disabled states where relevant.
- Maintain readable contrast in the current dark theme.
- Do not change the meaning or behavior of the buttons.

#### Acceptance criteria

- Every button that returns directly to the main menu uses the same distinct treatment.
- Primary actions such as start, save, accept, and reject retain their existing visual priority.
- The navigation color remains recognizable on desktop and mobile widths.
- Keyboard focus is clearly visible.
- Existing menu navigation continues to work from deck information, editor, game, and summary flows.

### Goal 4: Add dynamically resizing text fields

Status: **Completed and manually verified.**

#### Objective

Allow text-entry fields to grow with their content while preserving the user's ability to resize applicable multiline fields manually.

#### Scope

- Automatically increase textarea height as content gains lines.
- Evaluate converting long single-line card inputs to multiline textareas so long card text can wrap and expand vertically.
- Preserve manual vertical resizing for multiline fields.
- Recalculate size when existing decks are loaded, bulk cards are added, or the card-list screen is reopened.
- Apply sensible minimum and maximum dimensions so one field cannot make the editor unusable.

#### Acceptance criteria

- Entered text remains visible without unnecessary internal scrolling for normal content lengths.
- Multiline fields grow as lines are added and do not shrink below their minimum size.
- Manual resizing continues to work after automatic resizing.
- Long words and placeholders do not overflow their containers.
- Autosizing works for description, bulk inputs, normal cards, and penalty cards where those controls are multiline.
- Saved JSON remains an array of card strings; the deck format does not change.

#### Risks and dependencies

- Native single-line `input` elements cannot wrap; card-field conversion must preserve focus, placeholder insertion, row removal, and saving.
- Autosizing must be tested together with Goal 1 on desktop and mobile layouts.

### Goal 5: Clear unsubmitted player-name input on reload

Status: **Completed and manually verified.**

#### Objective

Ensure text typed into the player-name field but not added to the player list does not reappear after reload, including `Ctrl+F5`.

#### Scope

- Clear the player-name input during application initialization.
- Prevent or override browser form-state restoration for this field where necessary.
- Do not change the in-memory player-list behavior during normal screen navigation.

#### Acceptance criteria

- Type a name without pressing `Legg til spiller`; after normal reload and `Ctrl+F5`, the field is empty.
- Submitted players still appear in the list until the page is reloaded.
- Returning from another application screen without reloading does not unexpectedly clear partially typed input.
- Empty input does not create a player.
- Enter-key and button-based player registration continue to work.

### Goal 6: Add persistent bottom navigation and save actions

Status: **Completed and manually verified.**

#### Objective

Keep back, main-menu, and save actions available near the bottom edge of the viewport so users do not need to scroll to the end of a long screen to navigate or save.

#### Scope

- Introduce a reusable bottom action bar for screens with relevant back, menu, or save controls.
- Include `Tilbake`, `Tilbake til meny`, and `Lagre kortstokk` only where each action is already valid.
- Evaluate `position: sticky` as the preferred implementation, using fixed positioning only where sticky behavior cannot satisfy the screen flow.
- Preserve the distinct menu-navigation styling from Goal 3 and clear visual priority for save actions.
- Support desktop, narrow mobile screens, browser zoom, and mobile safe-area insets.
- Add sufficient content spacing so the action bar never covers fields, messages, cards, or the final list row.

#### Acceptance criteria

- Relevant actions remain visible or immediately reachable while scrolling long editor and card-list screens.
- The action bar stays aligned to the usable viewport width and does not stretch beyond the application panel.
- No content is obscured behind the bar at the top, middle, or end of a page.
- Save, back, and menu actions retain their existing behavior and confirmation/error messages.
- Buttons wrap or stack cleanly when the viewport is too narrow for one row.
- Keyboard focus is visible, and tab order follows a predictable sequence.
- Mobile browser controls and safe-area insets do not overlap the buttons.
- The action bar does not appear on screens where none of its actions are relevant.

#### Risks and dependencies

- Fixed positioning can cover content or behave poorly when a mobile keyboard opens; sticky positioning should be tested first.
- Goal 6 depends on the structural layout decisions in Goal 1 and the navigation color system in Goal 3.
- Goal 4 autosizing must not push focused fields behind the action bar.

### Recommended implementation order

1. Goal 5 — isolated browser-state bug with the smallest change surface.
2. Goal 2 — text-only rule presentation with unchanged stored values.
3. Goal 3 — reusable navigation styling with no behavior change.
4. Goal 1 — editor structure and responsive layout.
5. Goal 6 — persistent bottom actions integrated into the revised layout.
6. Goal 4 — dynamic sizing integrated with the revised layout and bottom action bar.

After all six goals pass their individual tests, run a combined desktop/mobile editor regression and the existing game/API smoke tests before setting the final v0.6.0 release number.

## v0.7.0 worklist

The repository owner approved the following incremental goals. Each goal is implemented and manually verified before work begins on the next one.

1. Protect unsaved deck-editor changes during internal navigation, reload, and page closing. **Completed and manually verified.**
2. Present all user-facing errors consistently in Norwegian while retaining useful technical server logs. **Completed and manually verified.**
3. Add immediate editor validation with field-specific Norwegian feedback. **Completed and manually verified.**
4. Add live deck statistics without changing the stored deck format. **Completed and manually verified.**
5. Detect and clearly mark duplicate cards without deleting them automatically. **Completed and manually verified.**
6. Add card-list search and filtering without changing stored card order. **Completed and manually verified.**
7. Add a non-destructive card preview with player placeholder examples. **Completed and manually verified.**
8. Establish and manually verify the current Docker baseline on Docker Desktop. **Completed and manually verified.**
9. Implement only separately approved Docker corrections found by the baseline test. **Completed and manually verified: low-risk 9A corrections.**

Docker corrections may be released separately from v0.7.0 if they require an independent deployment-focused patch.

## v0.8.0 worklist

The repository owner approved the following incremental goals. Each goal is implemented and manually verified before work begins on the next one.

1. Show normal-card and penalty-card counters as `Kort X av Y` and `Straffekort X av Y`. **Completed and manually verified.**
2. Hide the reject action for decks without penalty cards. **Completed and manually verified.**
3. Treat rejecting a normal card and drawing its penalty card as one action and one summary count. **Completed and manually verified.**
4. Clarify the game-summary labels with informal, natural Norwegian wording. **Completed and manually verified.**
5. Add a transition when a normal card is accepted. **Completed and manually verified.**
6. Add a distinct transition when a normal card is rejected. **Completed and manually verified.**
7. Add a transition and persistent pulsing red frame when a penalty card is shown. **Completed and manually verified.**
8. Add a restrained animation when the summary appears. **Completed and manually verified.**
9. Add a short, timed confetti effect at game completion. **Completed and manually verified after duration adjustment.**
10. Respect the operating system or browser preference for reduced motion. **Completed and manually verified.**
11. Run a combined visual and functional regression test. **Completed and manually verified, including Docker Compose on host port 27015.**
12. Preserve the manually expanded first full draft of the official family deck as an intentional v0.8.0 content update. **Completed and manually verified: 50 normal cards and 20 penalty cards.**

Password protection for custom decks is deferred to v0.9.0 so its storage, recovery, and server-administration consequences can be designed and tested independently.

## Deferred README ideas requiring separate approval

The README lists import/export, improved mobile UI, user accounts, sharing, synchronization, an administration panel, and a deck library. None are implemented in the current repository. They are not prioritized here because they expand scope beyond stabilizing and documenting the recovered baseline. Each should be evaluated as a separate implementation task before inclusion in an active roadmap.

## Change constraints

Future work should remain incremental, preserve the current stack, maintain API and JSON compatibility unless a migration is approved, keep Docker deployment working, and update documentation whenever behavior changes.
