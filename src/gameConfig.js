const gameConfig = {
    // Number of cards each player receives in their hand
    startingHandSize: 3,

    // Number of face-up and face-down cards each player receives
    faceCardsSize: 3,

    // Determine if players can play multiple cards of the same rank in a single turn
    allowMultipleCards: true,

    // Defines which cards have special powers and what those powers are.
    // The keys are the card values ('2', '4', '6', '7', '10', 'J', 'Joker')
    specialCards: {
        '2': {
            description: 'Can be played on anything, resets the pile, changes direction of play. Next player must play higher than 2.',
            canPlayOnAnything: true,
            resetsPile: true,
            changesDirection: true,
            ruleEffect: null // Default rule applies
        },
        '4': {
            description: 'Changes direction of play.',
            changesDirection: true
        },
        '6': {
            description: 'Next player must play an even-numbered card.',
            ruleEffect: { even: true }
        },
        '7': {
            description: 'Next player must play a card lower than 7.',
            ruleEffect: { lowerthan: true }
        },
        '10': {
            description: 'Can be played on anything, clears the discard pile to the graveyard, changes direction.',
            canPlayOnAnything: true,
            clearsPile: true,
            changesDirection: true,
            fastPlay: true // Activates fast play (chain reaction)
        },
        'J': {
            description: 'Acts as the card below it in the discard pile. Inherits the powers of the second-to-top card.'
        },
        'Joker': {
            description: 'Can be played on anything. When played, can specify a suit that must be played next. Acts as a wild card.',
            canPlayOnAnything: true,
            requiresSuitSelection: true
        }
    },

    // If consecutive cards of the same rank clear the pile
    fourOfAKindClears: true
};

module.exports = gameConfig;