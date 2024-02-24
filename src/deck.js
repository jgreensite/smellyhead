class Deck {
    constructor(numDecks = 1) {
        this.cards = [];
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        for (let i = 0; i < numDecks; i++) {
            for (let suit of suits) {
                for (let value of values) {
                    this.cards.push({ suit, value });
                }
            }
            // Add Jokers
            this.cards.push({ value: 'Joker' });
            this.cards.push({ value: 'Joker' });
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