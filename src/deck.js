class Card {
    constructor(suit, value, numericValue) {
        this.suit = suit;
        this.value = value;
        this.numericValue = numericValue;
    }
}

class Deck {
    constructor(numDecks = 1) {
        this.cards = [];
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = {'2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9, '10':10, 'J':11, 'Q':12, 'K':13,'A':14};

        for (let i = 0; i < numDecks; i++) {
            for (let suit of suits) {
                for (let value in values) {
                    this.cards.push(new Card(suit, value, values[value]));
                }
            }
            // Add Jokers
            this.cards.push(new Card(null, 'Joker', 15));
            this.cards.push(new Card(null, 'Joker', 15));
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw(numCards = 1) {
        return this.cards.splice(0, numCards);
    }
}

module.exports = Deck;