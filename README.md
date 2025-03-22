# HR API Game

A simple game built with p5.js that demonstrates API interactions.

## Live Demo

You can play the game directly via GitHub Pages:

- Main game: https://rubergart.github.io/MyAPI_Game/
- Minimal version: https://rubergart.github.io/MyAPI_Game/minimal_game.html

## Game Controls

- Use ←/→ arrow keys to move
- SPACE to shoot
- Press W for an instant win (cheat code for testing)

## Structure

This repository contains:

- `index.html` - Main game with simplified implementation
- `minimal_game.html` - Simplified version for testing
- `sketch.js` - Full game implementation (may have path issues on GitHub Pages)
- Various test files for debugging

## GitHub Pages Notes

The game is hosted on GitHub Pages at the URL pattern:
`https://rubergart.github.io/MyAPI_Game/`

If you encounter any issues accessing the game, try using the minimal version which has all code embedded in the HTML file.

## Local Development

To run the game locally, simply open any of the HTML files in a web browser.

## Troubleshooting

If you see only a blank page with a header:
1. Try the minimal version at `/minimal_game.html`
2. Check browser console for any errors
3. Ensure the p5.js library is loading correctly

## Setup with GitHub Pages

To host this game on GitHub Pages:

1. Clone the repository
2. Create a GitHub repository
3. Push the code to GitHub
4. Go to repository Settings > Pages
5. Select the main branch as the source

## Development

The game uses:
- p5.js for canvas rendering
- Supabase for storing email addresses (optional)

## Credits

Created by RubergArt 