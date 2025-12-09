# LexiStack

A beautiful 3D word tower game built with Three.js and Nuxt. Connect adjacent letters to form words and clear the tower before it reaches the top!

## Features

- 🎮 **Engaging Gameplay**: Connect adjacent letters (including diagonals) to form valid words
- 🎨 **Beautiful 3D Graphics**: Stunning Three.js visuals with particle effects and smooth animations
- 📱 **Mobile-Friendly**: Fully responsive design optimized for touch devices
- 📚 **Comprehensive Dictionary**: 370,000+ word dictionary for endless gameplay
- ⚡ **Performance Optimized**: Smooth 60fps gameplay with efficient rendering
- 🎯 **Combo System**: Build your combo multiplier with longer words for higher scores

## How to Play

1. Tap or click adjacent letters to build words
2. Letters must be connected (including diagonals)
3. Submit valid words to clear tiles and score points
4. Each cleared word adds time to the timer
5. Longer words boost your combo multiplier
6. Keep the tower below the danger line!

## Tech Stack

- **Nuxt 4**: Vue.js framework
- **Three.js**: 3D graphics rendering
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Styling (via Nuxt UI)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run typecheck
```

## Testing the Game

1. **Start the dev server**: `npm run dev`
2. **Navigate to** `http://localhost:3000`
3. **Landing Page**: You should see:
   - Hero section with "Play Now" button
   - Feature cards
   - How to Play instructions
   - High Scores button
4. **Click "Play Now"** to start the game
5. **Game Screen**: 
   - Tap/click adjacent letters to build words
   - Submit valid words to clear tiles
   - Watch the timer and danger line
   - Build combos for higher scores
6. **Game Over**: 
   - View final score and stats
   - Option to play again or return home
   - High scores are saved automatically

## Known Limitations

- Dictionary loads on first use (may take a moment)
- Mobile touch interactions work best with single taps (drag selection not yet implemented)
- Sound effects are stubbed (ready for future implementation)

## Deployment

This project is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel for automatic deployments.

## License

MIT

