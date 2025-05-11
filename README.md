# Tongo - Star Trek DS9 Fan Game

This is a browser-based implementation of Tongo, the fictional card game featured in Star Trek: Deep Space Nine. The game is based on fan rules created by Noel & Celeste Green in August 2005.

## About Tongo

Tongo is a gambling card game played primarily by Ferengi in the Star Trek universe. This implementation brings the fictional game to life with simplified mechanics that capture the essence of the game as described in the show and expanded upon by fans.

## How to Play

1. **Setup**: Open `index.html` in a web browser to start the game.
2. **Players**: You play against three AI opponents named after DS9 characters (Quark, Rom, and Nog).
3. **Goal**: Build the strongest hand possible and win the pot of latinum through strategic betting and card management.

## Game Mechanics

### Cards
- **Asset Cards**: Numbered 1-7 in seven different colors (red, blue, yellow, green, purple, orange, and black)
- **Acquire Cards**: Special cards with various effects, including "Wild Card" that can help complete winning combinations

### Game Stages

#### Stage One - Risking
- The dealer sets an opening risk amount and prices
- Players take turns matching or raising the risk
- If you can't meet the risk, you must retreat

#### Stage Two - Assessment
- Players can:
  - Purchase new asset cards
  - Sell their entire hand for new cards
  - Acquire special cards
  - Confront opponents if they believe they have a winning hand
  - Retreat from the game

#### Stage Three - Confront
- When a player confronts, others must:
  - Meet the current risk
  - Raise the risk
  - Evade by discarding 3 cards and paying a fee
  - Retreat from the game

### Winning Hands (from strongest to weakest)
1. **Full Monopoly** – 1 through 7 of every seven colors
2. **Monopoly** – 1 through 7 of any one color, or one of all 7 colors
3. **Full Consortium** – 7 of the same number or color
4. **Consortium** – A Monopoly or Full Consortium achieved with a wild card
5. **Material Continuum** – 2 pairs of both number and colors
6. **Treasury** – 5 of a kind (numbers or colors)
7. **Reserve** – 2 of a kind (same number or color)

## Controls

- **Risk**: Match or raise the current risk amount
- **Purchase**: Buy a new asset card from the table
- **Sell**: Exchange your entire hand for new cards
- **Acquire**: Buy a special acquire card
- **Confront**: Challenge other players when you think you have the best hand
- **Retreat**: Leave the game (you lose your bets)
- **Evade**: During a confrontation, discard 3 cards to end the confrontation

## Files Included

- `index.html` - The main game interface
- `styles.css` - Styling for the game
- `tongo.js` - Game logic and mechanics

## Credits

- Original fan rules by Noel & Celeste Green (August 2005)
- Star Trek: Deep Space Nine created by Rick Berman & Michael Piller
- This implementation is for fan enjoyment only and is not affiliated with or endorsed by Paramount

## Future Improvements

- Multiplayer support
- Advanced game mechanics (indexing the margin, leveraging the buy-in)
- More detailed AI strategies
- Sound effects and animations
- Mobile-friendly responsive design

## License

This project is created for fan enjoyment and educational purposes only. Star Trek and all related marks, logos, and characters are owned by Paramount Pictures.