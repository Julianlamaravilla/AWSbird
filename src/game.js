/**
 * Game State Manager
 * 
 * Manages game states and state transitions.
 * Coordinates all game systems (physics, pipes, score, collision, audio).
 * Implements state machine: Menu → Playing → GameOver → Menu
 */

import { GAME_STATE } from './constants.js';
import { PhysicsEngine } from './physics.js';
import { PipeGenerator } from './pipes.js';
import { ScoreTracker } from './score.js';
import { CollisionDetector } from './collision.js';
import { AudioEngine } from './audio.js';

export class Game {
  /**
   * Create a new Game instance
   * @param {HTMLCanvasElement} canvas - The game canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    
    // Initialize game state
    this.state = GAME_STATE.MENU;
    
    // Initialize game systems
    this.physics = new PhysicsEngine();
    this.pipeGenerator = new PipeGenerator();
    this.scoreTracker = new ScoreTracker();
    this.collisionDetector = new CollisionDetector();
    this.audioEngine = new AudioEngine();
    
    console.log('Game: Initialized in Menu state');
  }
  
  /**
   * Initialize audio engine (requires user interaction)
   * @returns {Promise<boolean>} True if initialization successful
   */
  async initAudio() {
    try {
      await this.audioEngine.init();
      await this.audioEngine.loadSounds();
      return true;
    } catch (error) {
      console.error('Game: Failed to initialize audio:', error);
      return false;
    }
  }
  
  /**
   * Get current game state
   * @returns {string} Current state (Menu, Playing, or GameOver)
   */
  getState() {
    return this.state;
  }
  
  /**
   * Transition from Menu to Playing state
   * Starts the game and resets all systems
   */
  transitionToPlaying() {
    if (this.state !== GAME_STATE.MENU) {
      console.warn(`Game: Cannot transition to Playing from ${this.state}`);
      return;
    }
    
    // Reset all game systems
    this.physics.reset();
    this.pipeGenerator.reset();
    this.scoreTracker.reset();
    
    // Transition to Playing state
    this.state = GAME_STATE.PLAYING;
    console.log('Game: Transitioned to Playing state');
  }
  
  /**
   * Transition from Playing to GameOver state
   * Triggered by collision detection
   */
  transitionToGameOver() {
    if (this.state !== GAME_STATE.PLAYING) {
      console.warn(`Game: Cannot transition to GameOver from ${this.state}`);
      return;
    }
    
    // Update high score if current score exceeds it
    const currentScore = this.scoreTracker.getCurrentScore();
    this.scoreTracker.updateHighScore(currentScore);
    
    // Play game over sound
    this.audioEngine.playSound('gameOver', 0.8);
    
    // Transition to GameOver state
    this.state = GAME_STATE.GAME_OVER;
    console.log('Game: Transitioned to GameOver state');
  }
  
  /**
   * Transition from GameOver to Menu state
   * Triggered by restart button
   */
  transitionToMenu() {
    if (this.state !== GAME_STATE.GAME_OVER) {
      console.warn(`Game: Cannot transition to Menu from ${this.state}`);
      return;
    }
    
    // Reset all game systems
    this.reset();
    
    // Transition to Menu state
    this.state = GAME_STATE.MENU;
    console.log('Game: Transitioned to Menu state');
  }
  
  /**
   * Reset all game state and return to Menu
   * Clears all game objects (pipes, physics state, score)
   * Validates Property 13: Game state reset clears all game objects
   */
  reset() {
    // Reset physics engine (ghost position and velocity)
    this.physics.reset();
    
    // Reset pipe generator (clear all pipes)
    this.pipeGenerator.reset();
    
    // Reset score tracker (current score only, not high score)
    this.scoreTracker.reset();
    
    // State is set by the calling method (transitionToMenu)
    console.log('Game: All game systems reset');
  }
  
  /**
   * Update game logic (called each frame during Playing state)
   * @param {number} deltaTime - Time elapsed since last frame (in seconds)
   * @param {boolean} jumpInput - Whether jump input was registered this frame
   */
  update(deltaTime, jumpInput) {
    if (this.state !== GAME_STATE.PLAYING) {
      return;
    }
    
    // Handle jump input
    if (jumpInput) {
      this.physics.applyJump();
      this.audioEngine.playSound('jump', 0.7);
    }
    
    // Update physics
    this.physics.update(deltaTime);
    
    // Update pipes
    this.pipeGenerator.update(deltaTime);
    
    // Update score
    const ghostPos = this.physics.getPosition();
    const pipes = this.pipeGenerator.getPipes();
    this.scoreTracker.update(ghostPos, pipes);
    
    // Check collisions
    const collision = this.collisionDetector.checkCollisions(ghostPos, pipes);
    if (collision) {
      this.transitionToGameOver();
    }
  }
  
  /**
   * Get ghost position for rendering
   * @returns {Object} Ghost position {x, y}
   */
  getGhostPosition() {
    return this.physics.getPosition();
  }
  
  /**
   * Get all pipes for rendering
   * @returns {Array} Array of pipe objects
   */
  getPipes() {
    return this.pipeGenerator.getPipes();
  }
  
  /**
   * Get current score for rendering
   * @returns {number} Current score
   */
  getCurrentScore() {
    return this.scoreTracker.getCurrentScore();
  }
  
  /**
   * Get high score for rendering
   * @returns {number} High score
   */
  getHighScore() {
    return this.scoreTracker.getHighScore();
  }
  
  /**
   * Get audio engine instance
   * @returns {AudioEngine} Audio engine
   */
  getAudioEngine() {
    return this.audioEngine;
  }
}
