# Flappy Kiro

A browser-based endless scroller game inspired by classic arcade gameplay. Guide a ghost character through an infinite stream of pipes, testing your reflexes and timing.

## Features

- 🎮 Simple one-click/tap controls
- 👻 Charming ghost protagonist
- 🎵 Retro sound effects
- 🏆 High score tracking with localStorage persistence
- 📱 Responsive canvas rendering
- 🎨 Retro arcade aesthetics

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd flappy-kiro
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm test` - Run tests (to be implemented)

### Project Structure

```
flappy-kiro/
├── index.html              # Main HTML entry point
├── src/
│   ├── main.js            # Game initialization and loop
│   ├── constants.js       # Game constants and configuration
│   ├── physics.js         # Physics engine (Task 4)
│   ├── pipes.js           # Pipe generator (Task 5)
│   ├── collision.js       # Collision detector (Task 6)
│   ├── score.js           # Score tracker (Task 7)
│   ├── input.js           # Input system (Task 8)
│   ├── audio.js           # Audio engine (Task 9)
│   ├── renderer.js        # Renderer (Task 10)
│   ├── game.js            # Game state manager (Task 11)
│   └── assets.js          # Asset loader (Task 2)
├── assets/
│   ├── ghosty.png         # Ghost sprite (32x32)
│   ├── jump.wav           # Jump sound effect
│   └── game_over.wav      # Game over sound effect
├── package.json           # Project dependencies
└── vite.config.js         # Vite configuration
```

## Game Controls

- **Mouse Click** or **Touch** - Make the ghost jump
- **Spacebar** - Jump (optional enhancement)

## Technical Details

### Canvas Specifications
- **Dimensions**: 800x600 pixels
- **Background**: Light blue (#87CEEB)
- **Rendering**: Pixel-perfect with disabled image smoothing

### Physics
- **Gravity**: 0.6 pixels/frame²
- **Jump Velocity**: -12 pixels/frame
- **Target Frame Rate**: 60 FPS

### Pipes
- **Width**: 80 pixels
- **Gap Size**: 120 pixels
- **Speed**: 5 pixels/frame
- **Spacing**: 200 pixels

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Requires HTML5 Canvas and Web Audio API support.

## Implementation Status

### Completed Tasks
- ✅ Task 1: Project Structure and Build Configuration

### Pending Tasks
- ⏳ Task 2: Asset Loading System
- ⏳ Task 3: Constants and Configuration (completed as part of Task 1)
- ⏳ Task 4: Physics Engine
- ⏳ Task 5: Pipe Generator
- ⏳ Task 6: Collision Detector
- ⏳ Task 7: Score Tracker
- ⏳ Task 8: Input System
- ⏳ Task 9: Audio Engine
- ⏳ Task 10: Renderer
- ⏳ Task 11: Game State Manager
- ⏳ Task 12: Main Game Loop
- ⏳ Tasks 13-29: Additional features and polish

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Inspired by classic Flappy Bird gameplay
- Built with vanilla JavaScript and Vite
- Ghost sprite and sound effects included in assets/
