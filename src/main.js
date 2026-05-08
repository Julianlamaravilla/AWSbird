/**
 * Flappy Kiro - Main Entry Point
 * 
 * This file initializes the game, loads assets, and starts the game loop.
 * Orchestrates all game systems at 60 FPS using requestAnimationFrame.
 */

import { SCREEN, GAME_STATE } from './constants.js';
import { AssetLoader } from './assets.js';
import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { InputSystem } from './input.js';
import { PerformanceMonitor } from './performance.js';

// Game systems
let game = null;
let renderer = null;
let inputSystem = null;

// DOM elements — populated inside init() after DOMContentLoaded
let canvas = null;
let loadingScreen = null;
let errorScreen = null;
let errorMessage = null;

// Performance monitoring
let performanceMonitor = null;
let showPerformanceStats = false; // Set to true to display FPS counter

// Game loop state
let lastTimestamp = 0;
let audioInitialized = false;

/**
 * Initialize the game.
 * Called only after DOMContentLoaded so all DOM elements and ES module
 * bindings are guaranteed to be fully initialized.
 */
async function init() {
  // Query DOM elements here — safe because DOMContentLoaded has already fired
  canvas = document.getElementById('gameCanvas');
  loadingScreen = document.getElementById('loadingScreen');
  errorScreen = document.getElementById('errorScreen');
  errorMessage = document.getElementById('errorMessage');

  try {
    console.log('Initializing Flappy Kiro...');

    // Load all assets
    await AssetLoader.loadAssets();

    // Verify assets are ready
    if (!AssetLoader.isReady()) {
      throw new Error('Assets failed to load properly');
    }

    // Initialize game systems
    game = new Game(canvas);
    renderer = new Renderer(canvas);
    // Pass a game-state provider so InputSystem can restrict jump registration
    // to the PLAYING state, preventing a phantom jump on the first touch after
    // tapping a menu button.
    inputSystem = new InputSystem(canvas, () => game.getState());

    // Initialize performance monitor
    performanceMonitor = new PerformanceMonitor(false); // Set to true for detailed profiling

    // Initialize input system
    inputSystem.init();

    // Set up interaction handlers for audio initialization and state transitions.
    // Both mouse (desktop) and touch (mobile) paths share handleCanvasClick.
    // { passive: false } is required so that event.preventDefault() is honoured
    // by the browser; without it, modern browsers silently ignore the call.
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchstart', handleCanvasClick, { passive: false });

    // Set up keyboard shortcuts for performance monitoring
    window.addEventListener('keydown', handleKeyPress);

    // Hide loading screen
    loadingScreen.classList.add('hidden');

    console.log('Game initialized successfully');

    // Start game loop
    startGameLoop();

  } catch (error) {
    console.error('Failed to initialize game:', error);
    showError('Failed to load game assets. Please refresh the page.');
  }
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyPress(event) {
  // Press 'P' to toggle performance stats display
  if (event.key === 'p' || event.key === 'P') {
    showPerformanceStats = !showPerformanceStats;
    console.log(`Performance stats display: ${showPerformanceStats ? 'ON' : 'OFF'}`);
  }
  
  // Press 'R' to print performance report
  if (event.key === 'r' || event.key === 'R') {
    if (performanceMonitor) {
      performanceMonitor.printReport();
    }
  }
}

/**
 * Normalize pointer coordinates from a MouseEvent or TouchEvent into
 * canvas-local {x, y} values.
 *
 * For touch events we prefer touches[0] (finger still on screen) and fall
 * back to changedTouches[0] (finger just lifted) so touchend also works if
 * ever needed.
 *
 * CSS scaling is accounted for: when the canvas element is resized via CSS its
 * logical pixel dimensions (canvas.width / canvas.height) may differ from its
 * rendered size (rect.width / rect.height).  Without scaling, touch/click
 * coordinates would miss the hit-test regions whenever the canvas is scaled.
 *
 * @param {MouseEvent|TouchEvent} event
 * @returns {{ x: number, y: number }}
 */
function getEventCoords(event) {
  const rect = canvas.getBoundingClientRect();
  let clientX, clientY;

  if (event.touches && event.touches.length > 0) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else if (event.changedTouches && event.changedTouches.length > 0) {
    clientX = event.changedTouches[0].clientX;
    clientY = event.changedTouches[0].clientY;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;

  return { x, y };
}

/**
 * Shared logic for menu-button interactions triggered by either a mouse click
 * or a touchstart event.  Initializes audio on the first gesture (browser
 * requirement) and drives MENU → PLAYING and GAME_OVER → MENU transitions.
 *
 * @param {MouseEvent|TouchEvent} event
 */
async function handleMenuInteraction(event) {
  if (!audioInitialized) {
    console.log('Initializing audio on first user interaction...');
    const success = await game.initAudio();
    if (success) {
      audioInitialized = true;
      console.log('Audio initialized successfully');
    } else {
      console.warn('Audio initialization failed, continuing without audio');
      audioInitialized = true;
    }
  }

  const currentState = game.getState();

  if (currentState === GAME_STATE.MENU) {
    if (isClickOnStartButton(event)) {
      game.transitionToPlaying();
    }
  } else if (currentState === GAME_STATE.GAME_OVER) {
    if (isClickOnRestartButton(event)) {
      game.transitionToMenu();
    }
  }
  // Jump input during PLAYING state is handled exclusively by InputSystem.
}

/**
 * Handle canvas interaction from either a mouse click or a touchstart.
 *
 * For touchstart we call event.preventDefault() to suppress the ~300 ms
 * synthetic ghost-click that mobile browsers would otherwise fire after the
 * touch, which would trigger a double interaction on the same tap.
 * The listener is registered with { passive: false } (see init()) so the
 * browser actually honours the preventDefault() call.
 *
 * @param {MouseEvent|TouchEvent} event
 */
function handleCanvasClick(event) {
  if (event.type === 'touchstart') {
    event.preventDefault();
  }
  handleMenuInteraction(event);
}

/**
 * Check if the interaction hit the Start Game button (Menu state).
 * @param {MouseEvent|TouchEvent} event
 */
function isClickOnStartButton(event) {
  const { x, y } = getEventCoords(event);

  // Button dimensions mirror Renderer.drawMenu
  const buttonWidth = 200;
  const buttonHeight = 50;
  const buttonX = SCREEN.WIDTH / 2 - buttonWidth / 2;
  const buttonY = SCREEN.HEIGHT / 2 - buttonHeight / 2;

  return x >= buttonX && x <= buttonX + buttonWidth &&
         y >= buttonY && y <= buttonY + buttonHeight;
}

/**
 * Check if the interaction hit the Restart button (GameOver state).
 * @param {MouseEvent|TouchEvent} event
 */
function isClickOnRestartButton(event) {
  const { x, y } = getEventCoords(event);

  // Button dimensions mirror Renderer.drawGameOver
  const buttonWidth = 200;
  const buttonHeight = 50;
  const buttonX = SCREEN.WIDTH / 2 - buttonWidth / 2;
  const buttonY = SCREEN.HEIGHT / 2 + 50;

  return x >= buttonX && x <= buttonX + buttonWidth &&
         y >= buttonY && y <= buttonY + buttonHeight;
}

/**
 * Show error screen
 */
function showError(message) {
  loadingScreen.classList.add('hidden');
  errorMessage.textContent = message;
  errorScreen.classList.add('visible');
}

/**
 * Main game loop - runs at 60 FPS
 * Updates all game systems and renders each frame
 */
function gameLoop(timestamp) {
  // Update performance monitor
  if (performanceMonitor) {
    performanceMonitor.update();
  }
  
  // Calculate delta time in seconds
  const deltaTime = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;
  
  // Cap delta time to prevent large jumps (e.g., when tab is inactive)
  const cappedDeltaTime = Math.min(deltaTime, 0.1);
  
  // Update game state
  update(cappedDeltaTime);
  
  // Render frame
  render();
  
  // Continue loop
  requestAnimationFrame(gameLoop);
}

/**
 * Start the game loop
 */
function startGameLoop() {
  requestAnimationFrame((timestamp) => {
    lastTimestamp = timestamp;
    requestAnimationFrame(gameLoop);
  });
}

/**
 * Update game state each frame
 * Orchestrates all game systems in correct order
 */
function update(deltaTime) {
  // Get jump input from input system
  const jumpInput = inputSystem.getJumpInput();
  
  // Update game logic (only during Playing state)
  game.update(deltaTime, jumpInput);
  
  // Reset input state after processing
  inputSystem.reset();
}

/**
 * Render the game each frame
 * Delegates rendering to Renderer system
 */
function render() {
  // Get current game state and data
  const gameState = game.getState();
  const ghostPos = game.getGhostPosition();
  const pipes = game.getPipes();
  const score = game.getCurrentScore();
  const highScore = game.getHighScore();
  
  // Render entire frame
  renderer.render(gameState, ghostPos, pipes, score, highScore);
  
  // Optionally render performance stats
  if (showPerformanceStats && performanceMonitor) {
    renderPerformanceStats();
  }
}

/**
 * Render performance statistics overlay
 */
function renderPerformanceStats() {
  const ctx = renderer.ctx;
  const stats = performanceMonitor.getStats();
  
  ctx.save();
  
  // Draw semi-transparent background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(10, 10, 200, 100);
  
  // Draw stats text
  ctx.fillStyle = '#00FF00';
  ctx.font = '14px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  ctx.fillText(`FPS: ${stats.fps}`, 20, 20);
  ctx.fillText(`Frame Time: ${stats.avgFrameTime}ms`, 20, 40);
  ctx.fillText(`Min FPS: ${stats.minFPS}`, 20, 60);
  ctx.fillText(`Max FPS: ${stats.maxFPS}`, 20, 80);
  
  if (stats.memory) {
    ctx.fillText(`Memory: ${stats.memory.used}MB`, 20, 100);
  }
  
  ctx.restore();
}

// Start the game once the DOM is fully parsed.
// <script type="module"> is deferred by the browser, so DOMContentLoaded has
// not yet fired when this module evaluates — the listener below will always
// trigger correctly, regardless of where the script tag appears in the HTML.
window.addEventListener('DOMContentLoaded', init);

// Handle window focus/blur for pause functionality
window.addEventListener('blur', () => {
  console.log('Game window lost focus');
  // Game continues running but with capped deltaTime to prevent physics jumps
});

window.addEventListener('focus', () => {
  console.log('Game window gained focus');
  // Reset lastTimestamp to prevent large deltaTime on first frame after focus
  lastTimestamp = performance.now();
});
