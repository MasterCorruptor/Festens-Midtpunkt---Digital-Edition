# Game flow

## Current screen flow

The application is a single HTML page with eight screen containers. JavaScript hides and shows them; navigation does not change the URL.

```text
Menu
├─ Velg spill → Deck selection → Deck information → Game → Summary
│                                  └─ Back → Menu       ├─ Restart → Game
│                                                       └─ Back → Menu
├─ Rediger kortstokker → Deck editor list → Edit/new deck → Card list
│                         └─ Back → Menu       └─ Back → Deck editor list
└─ Player registration

Game → Back to menu → Menu
```

## Player registration

Players are added on the menu with the button or Enter key. Input is trimmed and formatted by lowercasing it, then capitalizing each space- and hyphen-separated component. For example, `ola-nordmann` becomes `Ola-Nordmann`.

Blank names are ignored. Duplicate names are rejected case-insensitively with `Spilleren eksisterer allerede.` Each listed player can be removed. The player array exists only in page memory and remains populated while moving between screens or returning from a game. A reload clears it.

Text entered in the player-name field but not submitted remains while navigating between the application's screens. A page load or reload clears the unsubmitted field, including when the browser attempts to restore form values.

## Deck selection

Selecting `Velg spill` requests `GET /api/decks` and creates one button per returned official or custom deck. Choosing a button requests the full deck from `GET /api/decks/:id` and displays:

- name;
- description;
- age rating;
- inclusive minimum/maximum player range;
- player-rule description with its stored identifier in parentheses;
- whether the current registered-player count passes validation.

The rule line identifies `any`, `exact`, `even`, or `odd`, while the status line reflects all range and `playerCountRule` checks.

If the deck list cannot be loaded, the selection or editor screen displays `Kunne ikke laste kortstokkene` followed by the reported error. Failures while opening deck information, starting a selected deck, or opening a deck for editing are displayed on the screen where the action was initiated.

## Game start

Pressing `Start spill` fetches the selected deck again. If the registered count is invalid, the deck information screen remains visible and displays `Antall spillere passer ikke for denne kortstokken.`

If the deck has no normal cards, the information screen remains visible and displays `Kortstokken inneholder ingen kort.`

When valid, the browser:

1. shuffles the deck's card array in place with a Fisher-Yates shuffle using `Math.random()`;
2. sets the current index to zero;
3. shows the game screen;
4. prepares and displays the first card.

There is no loading indicator or explicit handling for failed fetches.

## Card drawing

The `Godta` button advances to the next normal card. `Avvis` is shown only when the selected deck contains at least one penalty card. It displays a random penalty card before the game can advance. Decks without penalty cards can therefore be completed with `Godta`, but their normal cards cannot be rejected through the user interface. Placeholder substitution happens when a card is displayed and does not alter the stored card string.

After the final normal card, the game confirms `Dere kom gjennom hele kortstokken.` and shows the total number of normal cards completed as `Dere har nå gått gjennom X kort.`, the penalty count as `Straffekort trukket i løpet av dette spillet`, and up to three players under `Spillerne som dukket opp flest ganger i kortene!`. Rejecting a normal card and drawing its penalty card are one action, represented by the single penalty-card counter.

Normal cards are traversed once in their shuffled order. Penalty cards are chosen randomly and can repeat. No recent-card history is needed because normal cards are not reshuffled within the same game.

The game screen shows the current normal-card position as `Kort X av Y`, where `Y` is the number of normal cards in the selected deck. While a penalty card is visible, the indicator reads `Straffekort X av Y`, where `X` is the number of penalty cards drawn during the current game and `Y` is the number of available penalty cards in the deck. Penalty cards are still selected randomly and can repeat; the indicator is a draw counter, not a unique-position guarantee. Drawing a penalty card does not advance the normal-card position. Restarting the game resets both counters and shows `Kort 1 av Y` after the new shuffle.

Accepting a normal card runs an approximately half-second, two-part transition: the current card receives a brief green border and glow while it fades and moves slightly left, then the next card fades in from the right with its normal white border. Game controls are temporarily disabled during the transition to prevent double input. Accepting a penalty card and rejecting a normal card do not use this same transition.

Rejecting a normal card uses a distinct transition before the penalty card is displayed. The rejected card receives a brief red border and glow, then fades and moves slightly right. The penalty card then fades in with a small downward movement and a red border and glow. Its red frame remains and pulses slowly while the penalty card is active, then returns to the normal white frame when the next normal card is shown. Controls remain disabled until the rejection and penalty-card entrance sequence is complete.

## End and restart behavior

After every normal card has been accepted or rejected, the game ends automatically on the summary screen. The completed-card sentence uses the deck's total number of normal cards because all of them have been traversed at that point. The summary separately shows penalty cards drawn and identifies the players most frequently selected through placeholders. It does not show accepted or rejected normal cards as separate counts because every available rejection necessarily draws exactly one penalty card.

When the summary screen is shown, its heading, text, and statistics fade in and move slightly upward into place over approximately 1.5 seconds. The fixed bottom action bar is outside the animated content so it stays anchored to the viewport throughout the entrance. This entrance does not delay or alter the summary statistics or navigation actions.

The summary also starts a temporary confetti effect made from DOM elements. It creates 180 pieces whose start times are distributed across approximately 6.2 seconds. Each piece falls at the original speed for roughly two to three seconds, producing a continuous effect that finishes after approximately 9.3 seconds. The pieces ignore pointer input and are removed after 9.5 seconds at the latest. Starting another game or leaving the summary clears remaining pieces immediately.

If the browser reports `prefers-reduced-motion: reduce`, card transitions and the summary entrance are skipped, confetti elements are not created, and the penalty-card pulse is disabled. Active penalty cards retain a static red border and subtle red shadow so the card type remains visually distinct without motion. Game state, counters, and navigation behavior remain unchanged.

`Tilbake til meny` clears the displayed card, current deck, current card index, counters, and player-selection statistics, then shows the menu. Registered players remain.

Buttons that return directly to the main menu use a consistent secondary navigation color, distinct from primary game and editor actions.

Screens with back, main-menu, save, start, restart, or new-deck actions group the relevant controls in a fixed bottom action bar. A reserved content area, responsive wrapping, and mobile safe-area spacing keep the bar from covering the final fields or list rows.

`Spill igjen` starts the selected deck again with a new shuffle and reset counters. `Tilbake til meny` on the summary returns to the menu. Registered players remain in both cases.

## Deck editor flow

The editor list loads the same API deck summaries. Official decks can be opened and replaced through `PUT`, but their delete buttons are disabled and the API rejects attempts to delete them. Custom decks can be opened, replaced through `PUT`, or deleted through `DELETE` after confirmation. Canceling the confirmation leaves the deck unchanged. A new deck is sent through `POST`.

Normal and penalty cards can be imported from separate multiline textareas, with one non-blank line becoming one card. Each import reports how many cards were added. Bulk inputs and their messages are cleared when another or new deck is opened.

On wide screens, deck metadata uses a two-column grid and the normal/penalty card import sections are displayed side by side. The editor collapses to one column on narrow screens while preserving the same field order and functions.

Placeholder insertion controls and their usage explanation are shown in a dedicated full-width player-code section above the normal and penalty card import columns. This keeps the two bulk inputs aligned while allowing placeholders to be inserted into whichever supported text field was focused last.

Description, bulk-entry, normal-card, and penalty-card textareas grow vertically with their content up to a defined maximum. Multiline card fields still save as plain strings in the existing JSON arrays, and users can manually resize textareas vertically when they need additional space.

After a successful save, the UI displays `Kortstokken er lagret på serveren.` If the API returns an error, the editor displays `Kunne ikke lagre kortstokken` followed by the server error and does not show a success message.

If all text is removed from an individual normal-card or penalty-card field, leaving that field removes its empty row from the card list. Saving also filters any remaining blank card values before sending the deck to the API.

The editor records its state when a deck is opened or successfully saved. Returning to the deck list with later changes opens a Norwegian dialog with options to save and leave, discard the changes, or continue editing. A failed save keeps the editor and dialog open. Text still present in either bulk-import field must be added to the card list before saving, because bulk input is not part of the stored deck format. Reloading or closing the page with unsaved editor changes invokes the browser's standard leave-page warning.

Before sending a save request, the editor validates required metadata, integer player limits, the selected player-count rule, and the presence of at least one normal card. Invalid controls are marked and receive a field-specific Norwegian message, focus moves to the first invalid control, and no API request is sent until these local errors are corrected. Server validation remains the final authority.

A compact deck overview updates during editing and displays the current number of normal cards, penalty cards, total cards, and cards containing at least one supported player placeholder. These values are derived from the editor rows and are not stored as additional deck metadata.

Duplicate detection compares cards within their own category, case-insensitively and after trimming and collapsing whitespace. Every matching field is marked with a yellow warning, while the overview counts only extra copies beyond the first. Normal and penalty cards are not compared with each other, and duplicates remain editable and saveable because repeated cards can be intentional.

The separate card-list screen provides case-insensitive text search, a normal/penalty category selector, and an optional duplicate-only filter. It reports the number of visible matches, updates while visible card text is edited, and resets when the card list is reopened. Filtering only hides editor rows; it does not reorder, remove, or modify stored cards.

Each card-list row provides a non-destructive preview dialog. It labels normal and penalty cards, replaces the supported `{player}`, `{player1}`, and `{player2}` placeholders with registered names when enough are available, and fills missing names with clearly disclosed examples. Unknown brace placeholders remain visible and are listed as warnings. Previewing does not mutate card text, saved JSON, game counters, or player-selection statistics.

## Known limitations

- Player and game state are not persistent.
- The start button is not disabled for an invalid player count; validation occurs after it is pressed.
- The exact-count rule is only usable when minimum and maximum are equal.

## Suggested improvements

Proposals, not current behavior:

- Validate that a deck has at least one card before it can start.
- Explain non-`any` player rules on the deck information screen.
- Correct the editor's server-storage success message and only show success after a successful response.
- Add focused editor-flow tests.
