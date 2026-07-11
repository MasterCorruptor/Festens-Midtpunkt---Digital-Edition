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

The `Godta` button records the displayed normal card as accepted and advances to the next normal card. `Avvis` records it as rejected and displays a random penalty card when the deck contains penalty cards. Pressing `Godta` while a penalty card or the no-penalty message is displayed advances without increasing the accepted-normal-card count. Placeholder substitution happens when a card is displayed and does not alter the stored card string.

After the final normal card, the game shows a summary with accepted cards, rejected cards, penalty cards drawn, and up to three players most frequently selected through placeholders.

Normal cards are traversed once in their shuffled order. Penalty cards are chosen randomly and can repeat. No recent-card history is needed because normal cards are not reshuffled within the same game.

## End and restart behavior

After every normal card has been accepted or rejected, the game ends automatically on the summary screen. The summary shows accepted normal cards, rejected normal cards, penalty cards drawn, and the most frequently selected players.

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
