/**
 * Game Constants and Configuration
 * 
 * This file contains all game constants and configuration values
 * in a centralized location for easy tuning and maintenance.
 */

// Screen Dimensions
export const SCREEN = {
  WIDTH: 800,
  HEIGHT: 600
};

// Physics Constants
export const PHYSICS = {
  GRAVITY: 0.6,           // pixels/frame²
  JUMP_VELOCITY: -12,     // pixels/frame (negative = upward)
  GHOST_START_X: 100,     // Fixed horizontal position
  GHOST_START_Y: 300      // Starting vertical position
};

// Pipe Constants
export const PIPE = {
  SPACING: 200,           // Horizontal distance between pipes (pixels)
  WIDTH: 80,              // Pipe width (pixels)
  GAP_SIZE: 120,          // Vertical gap size (pixels)
  SPEED: 5,               // Leftward movement speed (pixels/frame)
  CREATION_INTERVAL: 90,  // Frames between pipe creation (~1.5 seconds at 60 FPS)
  MIN_GAP_Y: 50,          // Minimum gap Y position from top (pixels)
  MAX_GAP_Y_OFFSET: 50    // Offset from bottom for max gap position (pixels)
};

// Ghost/Character Constants
export const GHOST = {
  WIDTH: 32,              // Sprite width (pixels)
  HEIGHT: 32              // Sprite height (pixels)
};

// Color Palette
export const COLORS = {
  BACKGROUND: '#87CEEB',  // Sky Blue
  PIPE: '#228B22',        // Forest Green
  PIPE_ACCENT: '#1a6b1a', // Dark Green
  GHOST: '#FFFFFF',       // White
  TEXT: '#FFFFFF',        // White
  TEXT_SHADOW: 'rgba(0, 0, 0, 0.5)',
  SCORE_FEEDBACK: '#FFD700',  // Gold
  COLLISION_EFFECT: '#FF6B6B', // Red
  BUTTON_NORMAL: '#45a049',
  BUTTON_HOVER: '#4CAF50',
  BUTTON_BORDER: '#558B55',
  BUTTON_BORDER_HOVER: '#66BB6A'
};

// Animation Timings (milliseconds)
export const ANIMATION = {
  GHOST_IDLE_DURATION: 250,      // ms per frame
  GHOST_FLYING_DURATION: 150,    // ms per frame
  GHOST_FALLING_DURATION: 100,   // ms per frame
  GHOST_HIT_DURATION: 50,        // ms per frame
  COLLISION_EFFECT_DURATION: 200,
  SCORE_FEEDBACK_DURATION: 1000,
  SCREEN_SHAKE_DURATION: 200,
  BUTTON_HOVER_DURATION: 100,
  MENU_FADE_IN_DURATION: 500
};

// Audio Volumes (0.0 to 1.0)
export const AUDIO = {
  MASTER_VOLUME: 1.0,
  JUMP_VOLUME: 0.7,
  GAME_OVER_VOLUME: 0.8
};

// Game States
export const GAME_STATE = {
  MENU: 'Menu',
  PLAYING: 'Playing',
  GAME_OVER: 'GameOver'
};

// Asset Paths
export const ASSETS = {
  GHOST_SPRITE: 'assets/ghosty.png',
  JUMP_SOUND: 'assets/jump.wav',
  GAME_OVER_SOUND: 'assets/game_over.wav'
};

// LocalStorage Keys
export const STORAGE = {
  HIGH_SCORE: 'flappyKiroHighScore'
};

// Frame Rate
export const FRAME_RATE = {
  TARGET_FPS: 60,
  TARGET_FRAME_TIME: 1000 / 60  // ~16.67ms
};
