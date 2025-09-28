# Smellyhead Card Game Rules

## Overview
Smellyhead is a multiplayer shedding-type card game where players try to get rid of all their cards. The game features special card powers that affect gameplay and create strategic depth.

## Setup
- **Players**: Minimum 2 players required to start
- **Deck**: Uses multiple standard 52-card decks + 2 Jokers per deck
  - Number of decks = ceil(players / 2)
- **Deal**: Each player receives:
  - 3 cards face-down (cannot see until hand is empty)
  - 3 cards face-up (visible to all players)
  - 3 cards in hand (private)

## Game Piles
- **Draw Pile**: Remaining cards after dealing, face-down
- **Discard Pile**: Cards played during the game, face-up
- **Graveyard Pile**: Cards cleared from discard pile by special powers

## Basic Rules

### Playing Cards
1. Players take turns playing cards from their hand
2. Cards must generally be played in ascending order (higher value than the top card)
3. If a player cannot play a valid card, they must pick up the entire discard pile
4. After playing a card, the player draws one card from the draw pile (if available)

### Turn Order
- Game direction can be clockwise (direction = 1) or counterclockwise (direction = -1)
- Some special cards change the direction of play

## Special Card Powers

### 2 (Two)
- **Can be played on anything**
- Resets the pile 
- Changes direction of play
- Next player must play higher than 2

### 4 (Four)
- Changes direction of play
- Next player continues in new direction

### 6 (Six)
- Next player must play an even-numbered card
- Affects game state: `even = 1`

### 7 (Seven)
- Next player must play a card lower than 7
- Affects game state: `lowerthan = -1`

### 10 (Ten)
- **Can be played on anything**
- Clears the entire discard pile to the graveyard
- Changes direction of play
- Essentially resets the game state

### Jack (J)
- Acts as the card below it in the discard pile
- Inherits the powers of the second-to-top card
- If no card below, acts as a normal card

### Joker
- **Can be played on anything**
- When played, can specify a suit that must be played next
- Acts as a wild card

## Special Rules

### Four of a Kind Clear
- If 4 consecutive cards of the same value are played on top of each other
- The entire discard pile is automatically cleared to the graveyard
- Play continues as if the pile was empty

### Game State Variables
The game tracks several state variables that affect valid plays:

- `direction`: 1 (clockwise) or -1 (counterclockwise)
- `even`: 0 (no restriction), 1 (must play even), -1 (must play odd)
- `lowerthan`: 1 (must play higher), -1 (must play lower than 7)
- `suit`: '' (no restriction) or specific suit requirement

### Card Hierarchy
Cards are ranked numerically:
- 2 = 2, 3 = 3, ..., 10 = 10
- J = 11, Q = 12, K = 13, A = 14
- Joker = 15 (highest)

## Winning Conditions
*(Not yet implemented in current codebase)*

Players win by getting rid of all cards in this order:
1. First, play all cards from hand
2. Then, play face-up cards (can only play if hand is empty)
3. Finally, play face-down cards (blind - reveal and play if valid, otherwise pick up pile)

## Implementation Notes

### Current Status
- ✅ Basic game setup and dealing
- ✅ Core card playing logic
- ✅ Special card powers (2, 4, 6, 7, J, 10, Joker)
- ✅ Four-of-a-kind clearing
- ✅ Direction changes
- ❌ Turn management
- ❌ Win conditions
- ❌ Face-up/face-down card logic
- ❌ Complete UI integration

### Technical Architecture
- **Backend**: Node.js with Express and Socket.IO
- **Frontend**: Vanilla JavaScript with ASCII art UI
- **Game Logic**: State machine pattern with separate modules for rules, state, and deck management
- **Testing**: Jest test suite with comprehensive coverage

The game is designed to be extended with additional features and card powers as needed.