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

// Get canvas element
const canvas = document.getElementById('gameCanvas');

// Get UI elements
const loadingScreen = document.getElementById('loadingScreen');
const errorScreen = document.getElementById('errorScreen');
const errorMessage = document.getElementById('errorMessage');

// Game systems
let game = null;
let renderer = null;
let inputSystem = null;

// Performance monitoring
let performanceMonitor = null;
let showPerformanceStats = false; // Set to true to display FPS counter

// Game loop state
let lastTimestamp = 0;
let audioInitialized = false;

/**
 * Initialize the game
 */
async function init() {
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
    inputSystem = new InputSystem(canvas);
    
    // Initialize performance monitor
    performanceMonitor = new PerformanceMonitor(false); // Set to true for detailed profiling
    
    // Initialize input system
    inputSystem.init();
    
    // Set up click handler for audio initialization and game state transitions
    canvas.addEventListener('click', handleCanvasClick);
    
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
 * Handle canvas click for audio initialization and state transitions
 */
async function handleCanvasClick(event) {
  // Initialize audio on first user interaction (browser requirement)
  if (!audioInitialized) {
    console.log('Initializing audio on first user interaction...');
    const success = await game.initAudio();
    if (success) {
      audioInitialized = true;
      console.log('Audio initialized successfully');
    } else {
      console.warn('Audio initialization failed, continuing without audio');
      audioInitialized = true; // Set to true to prevent repeated attempts
    }
  }
  
  // Handle state transitions based on current game state
  const currentState = game.getState();
  
  if (currentState === GAME_STATE.MENU) {
    // Check if click is on "Start Game" button
    if (isClickOnStartButton(event)) {
      game.transitionToPlaying();
    }
  } else if (currentState === GAME_STATE.GAME_OVER) {
    // Check if click is on "Restart" button
    if (isClickOnRestartButton(event)) {
      game.transitionToMenu();
    }
  }
  // Note: Jump input during PLAYING state is handled by InputSystem
}

/**
 * Check if click is on Start Game button (Menu state)
 */
function isClickOnStartButton(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Button dimensions (from Renderer.drawMenu)
  const buttonWidth = 200;
  const buttonHeight = 50;
  const buttonX = SCREEN.WIDTH / 2 - buttonWidth / 2;
  const buttonY = SCREEN.HEIGHT / 2 - buttonHeight / 2;
  
  return x >= buttonX && x <= buttonX + buttonWidth &&
         y >= buttonY && y <= buttonY + buttonHeight;
}

/**
 * Check if click is on Restart button (GameOver state)
 */
function isClickOnRestartButton(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Button dimensions (from Renderer.drawGameOver)
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

// Start the game when the page loads
window.addEventListener('load', init);

// Handle window focus/blur for pause functionality
window.addEventListener('blur', () => {
  console.log('Game window lost focus');
  // Note: Game continues running but with capped deltaTime to prevent physics jumps
});

window.addEventListener('focus', () => {
  console.log('Game window gained focus');
  // Reset lastTimestamp to prevent large deltaTime on first frame after focus
  lastTimestamp = performance.now();
});
