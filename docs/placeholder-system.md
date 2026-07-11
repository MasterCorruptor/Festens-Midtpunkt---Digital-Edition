# Player placeholder system

## Current supported placeholders

Placeholder replacement is implemented by `prepareCardText` in `script.js`.

### Sequential placeholder: `{player}`

Every exact, lowercase `{player}` occurrence is replaced from a randomly shuffled copy of the registered-player list. Each occurrence consumes the next player, so replacements within one card are unique until the available players are exhausted.

Actual deck example:

```text
Kort 6 - {player} må gi {player} en klem.
```

With enough players, the two occurrences receive different names.

### Numbered placeholders: `{playerN}`

The implementation recognizes exact, lowercase placeholders matching `{player` followed by one or more digits and `}`. Examples include `{player1}`, `{player2}`, `{player0}`, and `{player123}`.

Distinct placeholder tokens are collected in first-appearance order. The first distinct token gets the first shuffled player, the second gets the second player, and so on. The numeric value does not select a player index and does not control ordering.

All repeats of the same token receive the same name. The bundled `fest` deck demonstrates this:

```text
Kort 7 - {player1} må fortelle en vits til {player2}. Dersom {player2} ler, må {player2} gi {player1} en klem.
```

`{player1}` is consistent throughout that card, as is `{player2}`.

## Replacement order

1. If there are no registered players, the source card is returned unchanged.
2. A fresh shuffled copy of all players is created for the displayed card.
3. All `{player}` occurrences are replaced sequentially.
4. Numbered placeholders are then identified in the partly prepared text.
5. Each distinct numbered token is assigned by its first-appearance order from the beginning of the same shuffled player list.

Because both forms start at the beginning of that list independently, a card mixing `{player}` and `{player1}` can assign the same player to both. Uniqueness is not global across the two placeholder forms.

## Uniqueness behavior

- Repeated plain `{player}` occurrences use different players while enough players exist.
- Repeated identical numbered placeholders intentionally use the same player.
- Different numbered tokens use different players while enough players exist.
- Assignments are randomized separately each time a card is displayed.
- There is no rule preventing the same person from being selected on consecutive cards.

## Player-count requirements

The placeholder function itself does not calculate a required number of players. Game start only checks the deck-level `minPlayers`, `maxPlayers`, and `playerCountRule` values.

Authors must therefore set deck metadata high enough for the maximum number of distinct assignments needed by any card:

- a card with three `{player}` occurrences needs at least three players for full replacement;
- a card with `{player1}`, `{player2}`, and `{player3}` needs at least three players;
- a mixed card may repeat assignments across placeholder forms even with enough players.

## Edge cases

- If there are fewer players than plain occurrences, excess `{player}` tokens remain unchanged.
- If there are fewer players than distinct numbered tokens, tokens without an assigned player remain unchanged.
- With zero players, all placeholders remain unchanged.
- Matching is case-sensitive; `{Player}` and `{PLAYER1}` are not supported.
- Whitespace variants such as `{ player }` are not supported.
- Only ASCII digits are recognized in numbered tokens.
- `{player1}` and `{player01}` are distinct tokens despite their related numbers.
- The number has no semantic meaning: if `{player2}` appears before `{player1}`, `{player2}` receives the first shuffled player.
- Replacement uses literal text insertion into `textContent`, so player names are not interpreted as HTML.

## Known limitations

- Deck metadata is not validated against placeholder demand.
- Plain and numbered placeholders do not share a single uniqueness pool.
- Unsupported or unresolved placeholders are displayed verbatim without warning.
- There is no escape syntax for intentionally displaying a supported token after replacement.

## Suggested improvements

Proposals, not current behavior:

- Document and test a single canonical authoring convention for multi-player cards.
- Validate placeholder demand against minimum player count when saving a deck.
- Decide whether mixed plain/numbered placeholders should share uniqueness guarantees before changing existing behavior.
