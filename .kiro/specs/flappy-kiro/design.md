# Flappy Kiro Design Document

## Overview

Flappy Kiro is a browser-based endless scroller game where players guide a ghost character through an infinite stream of pipes. The game combines simple physics mechanics with responsive input handling to create an engaging arcade experience. The architecture is built around a modular game loop that separates concerns into distinct systems: physics, collision detection, rendering, input handling, audio, and game state management.

### Key Design Goals

1. **Responsiveness**: Input latency must be imperceptible; jump inputs apply within the same frame
2. **Modularity**: Clear separation between physics, rendering, collision, and audio systems
3. **Performance**: Consistent 60 FPS rendering with smooth animation
4. **Persistence**: High score tracking across browser sessions using localStorage
5. **Simplicity**: Straightforward game mechanics with predictable difficulty

---

## Architecture

### High-Level System Design

The game is organized around a central game loop that orchestrates multiple independent systems:

```
┌─────────────────────────────────────────────────────────────┐
│                      Game Loop (60 FPS)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Input System │  │ Physics      │  │ Collision    │      │
│  │              │  │ Engine       │  │ Detector     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                       │
│                    │  Game State    │                       │
│                    │  Manager       │                       │
│                    └───────┬────────┘                       │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐             │
│         │                  │                  │             │
│  ┌──────▼──────┐  ┌────────▼────────┐  ┌─────▼──────┐     │
│  │ Renderer    │  │ Audio Engine    │  │ Pipe       │     │
│  │             │  │                 │  │ Generator  │     │
│  └─────────────┘  └─────────────────┘  └────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### System Responsibilities

**Game Loop**: Orchestrates all systems at 60 FPS using `requestAnimationFrame`. Calls update methods on each system in sequence, then renders the frame.

**Input System**: Listens for mouse clicks and touch events. Registers jump inputs and passes them to the physics engine.

**Physics Engine**: Applies gravity to the ghost, updates velocity and position each frame, and applies jump velocity when input is received.

**Collision Detector**: Checks for overlaps between the ghost and pipes, and checks if the ghost has exceeded screen boundaries.

**Game State Manager**: Tracks the current game state (Menu, Playing, GameOver) and coordinates transitions between states.

**Renderer**: Draws all game objects (background, ghost, pipes, UI) to the canvas each frame.

**Audio Engine**: Plays sound effects for jumps and collisions without blocking gameplay.

**Pipe Generator**: Creates new pipes at regular intervals, manages their movement, and removes off-screen pipes.

**Score Tracker**: Increments score when the ghost passes through pipes, updates high score, and manages persistence.

---

## Components and Interfaces

### 1. Physics Engine

**Responsibilities**: Apply gravity, update velocity and position, apply jump velocity

**Key Methods**:
- `update(deltaTime)`: Apply gravity, update velocity and position
- `applyJump()`: Apply upward velocity to counteract gravity
- `getPosition()`: Return current ghost position {x, y}
- `getVelocity()`: Return current velocity {vx, vy}

**State**:
- `position`: {x, y} - Ghost position in pixels
- `velocity`: {vx, vy} - Ghost velocity in pixels/frame
- `gravity`: Constant downward acceleration (pixels/frame²)
- `jumpVelocity`: Upward velocity applied on jump (pixels/frame)

**Constants**:
```
GRAVITY = 0.6 pixels/frame²
JUMP_VELOCITY = -12 pixels/frame
GHOST_X = 100 pixels (fixed horizontal position)
```

### 2. Collision Detector

**Responsibilities**: Detect collisions between ghost and pipes, detect boundary collisions

**Key Methods**:
- `checkCollisions(ghostPos, pipes, screenHeight)`: Return true if collision detected
- `checkPipeCollision(ghostPos, pipe)`: Return true if ghost overlaps pipe
- `checkBoundaryCollision(ghostPos, screenHeight)`: Return true if ghost exceeds boundaries

**Collision Logic**:
- Ghost bounding box: 32x32 pixels (sprite dimensions)
- Pipe collision: AABB (Axis-Aligned Bounding Box) overlap test
- Boundary collision: Y position < 0 or Y position + height > screenHeight

### 3. Pipe Generator

**Responsibilities**: Create pipes at regular intervals, manage pipe positions and removal

**Key Methods**:
- `update(deltaTime)`: Move pipes left, remove off-screen pipes, create new pipes if needed
- `getPipes()`: Return array of active pipes
- `reset()`: Clear all pipes

**State**:
- `pipes`: Array of pipe objects
- `timeSinceLastPipe`: Elapsed time since last pipe creation
- `pipeSpacing`: Horizontal distance between pipes (pixels)
- `pipeWidth`: Width of each pipe section (pixels)
- `gapSize`: Vertical size of gap between pipe sections (pixels)

**Constants**:
```
PIPE_SPACING = 200 pixels
PIPE_WIDTH = 80 pixels
GAP_SIZE = 120 pixels
PIPE_SPEED = 5 pixels/frame (leftward)
PIPE_CREATION_INTERVAL = 90 frames (~1.5 seconds at 60 FPS)
MIN_GAP_Y = 50 pixels (from top)
MAX_GAP_Y = screenHeight - 50 - GAP_SIZE pixels
```

**Pipe Object Structure**:
```javascript
{
  x: number,           // Horizontal position
  topY: number,        // Y position of top pipe section
  gapY: number,        // Y position of gap start
  width: number,       // Pipe width
  gapSize: number,     // Gap height
  scored: boolean      // Whether score was incremented for this pipe
}
```

### 4. Collision Detector

**Responsibilities**: Detect collisions and trigger game over

**Key Methods**:
- `checkCollisions(ghostPos, pipes, screenHeight)`: Return true if collision detected

**Collision Detection Algorithm**:
```
For each pipe:
  If ghost.x + ghostWidth > pipe.x AND ghost.x < pipe.x + pipeWidth:
    If ghost.y < pipe.gapY OR ghost.y + ghostHeight > pipe.gapY + gapSize:
      Return true (collision)

If ghost.y < 0 OR ghost.y + ghostHeight > screenHeight:
  Return true (boundary collision)

Return false
```

### 5. Score Tracker

**Responsibilities**: Track current score, manage high score, handle persistence

**Key Methods**:
- `update(ghostPos, pipes)`: Check if ghost passed any pipes, increment score
- `getCurrentScore()`: Return current score
- `getHighScore()`: Return high score
- `updateHighScore(score)`: Update high score if score exceeds current high score
- `reset()`: Reset current score to 0
- `loadHighScore()`: Load high score from localStorage
- `saveHighScore()`: Save high score to localStorage

**State**:
- `currentScore`: Current game score
- `highScore`: Best score across all sessions
- `lastScoredPipeIndex`: Index of last pipe that was scored (prevent double-scoring)

**Persistence**:
- Key: `"flappyKiroHighScore"`
- Format: JSON number
- Default: 0 if not found

### 6. Input System

**Responsibilities**: Listen for input events, register jump inputs

**Key Methods**:
- `init()`: Attach event listeners
- `getJumpInput()`: Return true if jump input was registered this frame
- `reset()`: Clear input state

**Input Events**:
- Mouse click anywhere on canvas
- Touch event on canvas
- Keyboard spacebar (optional enhancement)

### 7. Audio Engine

**Responsibilities**: Play sound effects without blocking gameplay

**Key Methods**:
- `playJumpSound()`: Play jump.wav
- `playGameOverSound()`: Play game_over.wav

**Implementation**:
- Use Web Audio API or HTML5 Audio elements
- Play sounds asynchronously (non-blocking)
- Handle audio context initialization for browsers that require user interaction

### 8. Renderer

**Responsibilities**: Draw all game objects and UI to canvas

**Key Methods**:
- `render(gameState, ghostPos, pipes, score, highScore)`: Draw entire frame
- `drawBackground()`: Draw light blue background
- `drawGhost(pos)`: Draw ghost sprite
- `drawPipes(pipes)`: Draw all pipes in green
- `drawScore(score)`: Draw current score
- `drawMenu(highScore)`: Draw menu screen
- `drawGameOver(score, highScore)`: Draw game over screen

**Canvas Setup**:
```
Width: 800 pixels
Height: 600 pixels
Background: #87CEEB (light blue)
```

**Rendering Order** (back to front):
1. Background
2. Pipes
3. Ghost
4. Score/UI
5. Menu/GameOver overlays (if applicable)

### 9. Game State Manager

**Responsibilities**: Track game state, coordinate state transitions

**Key Methods**:
- `getState()`: Return current state (Menu, Playing, GameOver)
- `transitionToPlaying()`: Menu → Playing
- `transitionToGameOver()`: Playing → GameOver
- `transitionToMenu()`: GameOver → Menu
- `reset()`: Reset all game systems

**State Machine**:
```
Menu ──[Start Game]──> Playing
                          │
                          ├─[Collision]──> GameOver
                          │                    │
                          └────[Restart]───────┘
```

### 10. Asset Loader

**Responsibilities**: Load sprites and audio files before game starts

**Key Methods**:
- `loadAssets()`: Load all required assets
- `getAsset(name)`: Return loaded asset
- `isReady()`: Return true if all assets loaded

**Assets**:
- `ghosty.png`: Ghost sprite (32x32 pixels)
- `jump.wav`: Jump sound effect
- `game_over.wav`: Game over sound effect

---

## Data Models

### Game State

```javascript
{
  state: "Menu" | "Playing" | "GameOver",
  ghostPosition: { x: number, y: number },
  ghostVelocity: { vx: number, vy: number },
  pipes: Array<Pipe>,
  currentScore: number,
  highScore: number,
  deltaTime: number
}
```

### Pipe

```javascript
{
  x: number,              // Horizontal position (pixels)
  topY: number,           // Y position of top pipe section
  gapY: number,           // Y position of gap start
  width: number,          // Pipe width (pixels)
  gapSize: number,        // Gap height (pixels)
  scored: boolean         // Whether score was incremented
}
```

### Ghost

```javascript
{
  x: number,              // Horizontal position (fixed at 100)
  y: number,              // Vertical position (pixels)
  width: number,          // Sprite width (32 pixels)
  height: number,         // Sprite height (32 pixels)
  velocityY: number       // Vertical velocity (pixels/frame)
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Gravity Increases Velocity

*For any* frame during gameplay, the ghost's vertical velocity should increase by the gravity constant each frame.

**Validates: Requirements 3.1, 3.2**

### Property 2: Jump Velocity is Consistent

*For any* sequence of jump inputs, each jump should apply the same upward velocity to the ghost.

**Validates: Requirements 4.4, 4.5**

### Property 3: Pipes Move Leftward

*For any* frame during gameplay, all active pipes should move leftward by the pipe speed constant.

**Validates: Requirements 5.5**

### Property 4: Pipe Spacing is Consistent

*For any* two consecutive pipes created, the horizontal distance between them should be equal to the pipe spacing constant.

**Validates: Requirements 6.3**

### Property 5: Gap Position is Valid

*For any* pipe created, the gap position should be within valid bounds (not at extreme top or bottom of screen).

**Validates: Requirements 5.4**

### Property 6: Collision Detection Accuracy

*For any* ghost position and pipe configuration, a collision should be detected if and only if the ghost's bounding box overlaps with a pipe section or exceeds screen boundaries.

**Validates: Requirements 7.1, 7.2, 7.3**

### Property 7: Score Increments Once Per Pipe

*For any* pipe, the score should increment at most once when the ghost passes through the gap.

**Validates: Requirements 8.1, 8.4**

### Property 8: High Score Update Logic

*For any* score that exceeds the current high score, the high score should be updated to that score.

**Validates: Requirements 12.1**

### Property 9: Pipe Width Consistency

*For any* pipe created, the pipe width should equal the pipe width constant.

**Validates: Requirements 6.1**

### Property 10: Pipe Gap Size Consistency

*For any* pipe created, the gap size should equal the gap size constant.

**Validates: Requirements 6.2**

### Property 11: Endless Pipe Generation

*For any* duration of gameplay without collision, new pipes should be created at regular intervals.

**Validates: Requirements 5.1, 20.1**

### Property 12: Difficulty Consistency

*For any* duration of gameplay, the pipe speed and spacing should remain constant (difficulty does not increase).

**Validates: Requirements 20.2**

### Property 13: Game State Reset

*For any* game state, calling reset should clear all game objects and return the game to the Menu state.

**Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5**

---

## Error Handling

### Asset Loading Failures

**Scenario**: An asset fails to load (network error, missing file, etc.)

**Handling**:
- Display error message on screen: "Failed to load game assets. Please refresh the page."
- Log error to console with details
- Prevent game from starting until assets are loaded
- Provide retry mechanism (refresh button)

### Audio Playback Failures

**Scenario**: Audio context fails to initialize or sound playback fails

**Handling**:
- Gracefully degrade: game continues without audio
- Log warning to console
- Do not block gameplay or state transitions
- Attempt to recover on next input

### Collision Detection Edge Cases

**Scenario**: Ghost position is exactly at pipe boundary

**Handling**:
- Use inclusive boundary checks (≤, ≥) to ensure collisions are detected
- Collision takes precedence over score increment (if ghost collides while passing, no score)

### High Score Persistence Failures

**Scenario**: localStorage is unavailable or quota exceeded

**Handling**:
- High score remains in memory for current session
- Log warning to console
- Game continues normally
- Attempt to save again on next score update

---

## Testing Strategy

### Unit Tests

**Physics Engine Tests**:
- Verify gravity is applied each frame
- Verify jump velocity is applied correctly
- Verify position updates based on velocity
- Verify velocity increases due to gravity

**Collision Detection Tests**:
- Verify collision with pipe sections
- Verify collision with screen boundaries
- Verify no collision when ghost is in gap
- Verify collision detection with various ghost/pipe positions

**Score Tracking Tests**:
- Verify score increments when passing through gap
- Verify score increments only once per pipe
- Verify high score updates when exceeded
- Verify high score persists to localStorage
- Verify high score loads from localStorage

**Pipe Generation Tests**:
- Verify pipes are created at regular intervals
- Verify pipes are positioned off-screen to the right
- Verify gap positions vary and are within valid bounds
- Verify pipes move leftward each frame
- Verify off-screen pipes are removed

**Input Handling Tests**:
- Verify jump input is registered on click
- Verify jump input is registered on touch
- Verify jump velocity is applied on input

**Audio Engine Tests**:
- Verify jump sound plays on jump input
- Verify game over sound plays on collision
- Verify sounds play asynchronously (non-blocking)

**Renderer Tests**:
- Verify background is light blue
- Verify ghost sprite is rendered
- Verify pipes are rendered in green
- Verify score is displayed
- Verify menu screen displays correctly
- Verify game over screen displays correctly

**Game State Tests**:
- Verify state transitions (Menu → Playing → GameOver → Menu)
- Verify reset clears all game state
- Verify game loop updates all systems each frame

### Integration Tests

**End-to-End Gameplay**:
- Start game from menu
- Jump through multiple pipes
- Verify score increments correctly
- Collide with pipe
- Verify game over screen displays
- Verify high score updates if applicable
- Restart game
- Verify game returns to menu

**Asset Loading**:
- Verify all assets load before game starts
- Verify error message displays if asset fails to load

**Performance**:
- Verify game maintains 60 FPS during gameplay
- Verify no memory leaks during extended play
- Verify smooth animation without stuttering

### Property-Based Tests

**Physics Properties** (100+ iterations):
- For any sequence of frames, gravity should increase velocity monotonically
- For any jump input, velocity should increase by jump velocity constant
- For any velocity, position should update by velocity amount

**Collision Properties** (100+ iterations):
- For any ghost/pipe position, collision should be detected iff bounding boxes overlap
- For any ghost position, collision should be detected iff exceeding boundaries

**Score Properties** (100+ iterations):
- For any pipe sequence, score should increment exactly once per pipe
- For any score exceeding high score, high score should update

**Pipe Properties** (100+ iterations):
- For any pipe sequence, spacing should be consistent
- For any pipe, gap position should be within valid bounds
- For any pipe, width and gap size should be consistent

---

## File Structure and Module Organization

```
flappy-kiro/
├── index.html                 # Main HTML file
├── src/
│   ├── main.js               # Entry point, initializes game
│   ├── game.js               # Game loop and state manager
│   ├── physics.js            # Physics engine
│   ├── collision.js          # Collision detector
│   ├── pipes.js              # Pipe generator
│   ├── score.js              # Score tracker
│   ├── input.js              # Input system
│   ├── audio.js              # Audio engine
│   ├── renderer.js           # Renderer
│   ├── assets.js             # Asset loader
│   └── constants.js          # Game constants
├── assets/
│   ├── ghosty.png            # Ghost sprite
│   ├── jump.wav              # Jump sound
│   └── game_over.wav         # Game over sound
└── tests/
    ├── physics.test.js       # Physics tests
    ├── collision.test.js     # Collision tests
    ├── score.test.js         # Score tests
    ├── pipes.test.js         # Pipe tests
    ├── input.test.js         # Input tests
    ├── audio.test.js         # Audio tests
    ├── renderer.test.js      # Renderer tests
    └── integration.test.js   # Integration tests
```

### Module Exports

**physics.js**:
```javascript
export class PhysicsEngine {
  constructor(gravity, jumpVelocity)
  update(deltaTime)
  applyJump()
  getPosition()
  getVelocity()
  reset()
}
```

**collision.js**:
```javascript
export class CollisionDetector {
  checkCollisions(ghostPos, pipes, screenHeight)
  checkPipeCollision(ghostPos, pipe)
  checkBoundaryCollision(ghostPos, screenHeight)
}
```

**pipes.js**:
```javascript
export class PipeGenerator {
  constructor(screenWidth, screenHeight)
  update(deltaTime)
  getPipes()
  reset()
}
```

**score.js**:
```javascript
export class ScoreTracker {
  constructor()
  update(ghostPos, pipes)
  getCurrentScore()
  getHighScore()
  updateHighScore(score)
  reset()
  loadHighScore()
  saveHighScore()
}
```

**input.js**:
```javascript
export class InputSystem {
  constructor(canvas)
  init()
  getJumpInput()
  reset()
}
```

**audio.js**:
```javascript
export class AudioEngine {
  constructor()
  init()
  playJumpSound()
  playGameOverSound()
}
```

**renderer.js**:
```javascript
export class Renderer {
  constructor(canvas)
  render(gameState, ghostPos, pipes, score, highScore)
  drawBackground()
  drawGhost(pos)
  drawPipes(pipes)
  drawScore(score)
  drawMenu(highScore)
  drawGameOver(score, highScore)
}
```

**assets.js**:
```javascript
export class AssetLoader {
  static async loadAssets()
  static getAsset(name)
  static isReady()
}
```

**game.js**:
```javascript
export class Game {
  constructor(canvas)
  init()
  start()
  update(deltaTime)
  render()
  handleCollision()
  reset()
  getState()
}
```

---

## Design Patterns and Architectural Decisions

### 1. Separation of Concerns

Each system (physics, collision, rendering, audio, input) is independent and communicates through the game loop. This allows:
- Easy testing of individual systems
- Simple replacement of implementations
- Clear responsibility boundaries

### 2. Game Loop Pattern

The central game loop orchestrates all systems at a fixed frame rate:
```javascript
function gameLoop(timestamp) {
  const deltaTime = (timestamp - lastTimestamp) / 1000;
  
  input.update();
  physics.update(deltaTime);
  pipes.update(deltaTime);
  collision.update();
  score.update();
  audio.update();
  renderer.render();
  
  requestAnimationFrame(gameLoop);
}
```

This ensures:
- All systems update in a consistent order
- Physics and collision detection are synchronized
- Rendering happens after all state updates

### 3. State Machine for Game States

The game uses a simple state machine (Menu → Playing → GameOver → Menu) to manage transitions and ensure only valid operations occur in each state.

### 4. Immutable Constants

All magic numbers are defined as constants in `constants.js`:
- Physics values (gravity, jump velocity)
- Pipe values (spacing, width, gap size)
- Screen dimensions
- Timing values

This makes tuning difficulty and performance easy without changing code logic.

### 5. Lazy Asset Loading

Assets are loaded asynchronously before the game starts, preventing the game from starting until all resources are available.

### 6. LocalStorage for Persistence

High score is persisted to localStorage with a simple key-value format, allowing it to survive browser restarts without requiring a backend.

### 7. Non-Blocking Audio

Audio is played asynchronously using the Web Audio API or HTML5 Audio elements, ensuring sound effects never block gameplay or state transitions.

### 8. AABB Collision Detection

Axis-Aligned Bounding Box collision detection is used for simplicity and performance. The ghost and pipes are treated as rectangles, and overlaps are detected using simple arithmetic comparisons.

---

## Performance Considerations

### Frame Rate Target

- Target: 60 FPS (16.67 ms per frame)
- Use `requestAnimationFrame` for smooth animation
- Avoid blocking operations in the game loop

### Memory Management

- Pipes are removed from memory when off-screen (prevent memory leaks)
- Audio objects are reused (not created new each time)
- No unnecessary object allocations in the game loop

### Rendering Optimization

- Only redraw changed elements (full canvas redraw is acceptable for this game)
- Use canvas 2D context efficiently
- Avoid expensive operations like image scaling (use pre-sized sprites)

### Physics Optimization

- Use simple arithmetic for physics calculations
- Avoid trigonometry (not needed for this game)
- Use fixed timestep or delta time for frame-rate independence

---

## Browser Compatibility

- Target: Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires: HTML5 Canvas, Web Audio API or HTML5 Audio
- Fallback: Graceful degradation if audio unavailable
- Input: Mouse and touch events

---

## Future Enhancements

1. **Difficulty Progression**: Increase pipe speed or decrease gap size over time
2. **Power-ups**: Temporary invincibility or slow-motion effects
3. **Leaderboard**: Track top scores with player names
4. **Mobile Optimization**: Touch controls, responsive canvas sizing
5. **Sound Settings**: Mute/unmute audio
6. **Keyboard Controls**: Spacebar for jump
7. **Animations**: Smooth transitions, particle effects
8. **Themes**: Different visual styles (dark mode, seasonal themes)

