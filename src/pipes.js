/**
 * Pipe Generator
 * 
 * Manages pipe creation, movement, and removal for the endless scroller.
 * Creates pipes at regular intervals with random gap positions,
 * moves them leftward, and removes off-screen pipes.
 */

import { PIPE, SCREEN } from './constants.js';

export class PipeGenerator {
  /**
   * Create a new PipeGenerator
   * @param {number} screenWidth - Width of the game screen
   * @param {number} screenHeight - Height of the game screen
   */
  constructor(screenWidth = SCREEN.WIDTH, screenHeight = SCREEN.HEIGHT) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.pipes = [];
    this.framesSinceLastPipe = 0;
    
    // Pipe configuration from constants
    this.pipeSpacing = PIPE.SPACING;
    this.pipeWidth = PIPE.WIDTH;
    this.gapSize = PIPE.GAP_SIZE;
    this.pipeSpeed = PIPE.SPEED;
    this.creationInterval = PIPE.CREATION_INTERVAL;
    this.minGapY = PIPE.MIN_GAP_Y;
    this.maxGapY = this.screenHeight - PIPE.MAX_GAP_Y_OFFSET - this.gapSize;
  }
  
  /**
   * Update pipe positions and create new pipes
   * @param {number} deltaTime - Time elapsed since last frame (in seconds)
   */
  update(deltaTime) {
    // Move all pipes leftward
    for (const pipe of this.pipes) {
      pipe.x -= this.pipeSpeed;
    }
    
    // Remove off-screen pipes (completely off the left side)
    this.pipes = this.pipes.filter(pipe => pipe.x + pipe.width > 0);
    
    // Increment frame counter
    this.framesSinceLastPipe++;
    
    // Create new pipe if interval reached
    if (this.framesSinceLastPipe >= this.creationInterval) {
      this.createPipe();
      this.framesSinceLastPipe = 0;
    }
  }
  
  /**
   * Create a new pipe with random gap position
   * @private
   */
  createPipe() {
    // Random gap position within valid bounds
    const gapY = this.minGapY + Math.random() * (this.maxGapY - this.minGapY);
    
    const pipe = {
      x: this.screenWidth,  // Start off-screen to the right
      topY: gapY,           // Top pipe ends at gap start
      gapY: gapY,           // Gap starts here
      width: this.pipeWidth,
      gapSize: this.gapSize,
      scored: false         // Track if player has scored for this pipe
    };
    
    this.pipes.push(pipe);
  }
  
  /**
   * Get all active pipes
   * @returns {Array} Array of pipe objects
   */
  getPipes() {
    return this.pipes;
  }
  
  /**
   * Reset the pipe generator (clear all pipes)
   */
  reset() {
    this.pipes = [];
    this.framesSinceLastPipe = 0;
  }
}
