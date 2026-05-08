/**
 * Collision Detector
 * 
 * Detects collisions between ghost and pipes/boundaries using AABB
 * (Axis-Aligned Bounding Box) collision detection.
 */

import { GHOST, SCREEN } from './constants.js';

export class CollisionDetector {
  /**
   * Create a new CollisionDetector
   * @param {number} ghostWidth - Width of ghost sprite (default from constants)
   * @param {number} ghostHeight - Height of ghost sprite (default from constants)
   * @param {number} screenHeight - Height of game screen (default from constants)
   */
  constructor(
    ghostWidth = GHOST.WIDTH,
    ghostHeight = GHOST.HEIGHT,
    screenHeight = SCREEN.HEIGHT
  ) {
    this.ghostWidth = ghostWidth;
    this.ghostHeight = ghostHeight;
    this.screenHeight = screenHeight;
  }
  
  /**
   * Check all collisions (pipes and boundaries)
   * @param {Object} ghostPos - Ghost position {x, y}
   * @param {Array} pipes - Array of pipe objects
   * @returns {boolean} True if collision detected
   */
  checkCollisions(ghostPos, pipes) {
    // Check boundary collisions first (faster)
    if (this.checkBoundaryCollision(ghostPos)) {
      return true;
    }
    
    // Check pipe collisions
    for (const pipe of pipes) {
      if (this.checkPipeCollision(ghostPos, pipe)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Check collision with a single pipe using AABB
   * @param {Object} ghostPos - Ghost position {x, y}
   * @param {Object} pipe - Pipe object with x, topY, gapY, width, gapSize
   * @returns {boolean} True if collision detected
   */
  checkPipeCollision(ghostPos, pipe) {
    // Ghost bounding box (centered on position)
    const ghostLeft = ghostPos.x - this.ghostWidth / 2;
    const ghostRight = ghostPos.x + this.ghostWidth / 2;
    const ghostTop = ghostPos.y - this.ghostHeight / 2;
    const ghostBottom = ghostPos.y + this.ghostHeight / 2;
    
    // Pipe bounding box
    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + pipe.width;
    
    // Check if ghost is horizontally aligned with pipe
    const horizontalOverlap = ghostRight > pipeLeft && ghostLeft < pipeRight;
    
    if (!horizontalOverlap) {
      return false;
    }
    
    // Check if ghost collides with top pipe section or bottom pipe section
    const topPipeBottom = pipe.gapY;
    const bottomPipeTop = pipe.gapY + pipe.gapSize;
    
    // Collision with top pipe (ghost top is above gap start)
    const hitsTopPipe = ghostTop < topPipeBottom;
    
    // Collision with bottom pipe (ghost bottom is below gap end)
    const hitsBottomPipe = ghostBottom > bottomPipeTop;
    
    return hitsTopPipe || hitsBottomPipe;
  }
  
  /**
   * Check collision with screen boundaries
   * @param {Object} ghostPos - Ghost position {x, y}
   * @returns {boolean} True if collision detected
   */
  checkBoundaryCollision(ghostPos) {
    // Ghost bounding box (centered on position)
    const ghostTop = ghostPos.y - this.ghostHeight / 2;
    const ghostBottom = ghostPos.y + this.ghostHeight / 2;
    
    // Check top boundary
    if (ghostTop < 0) {
      return true;
    }
    
    // Check bottom boundary
    if (ghostBottom > this.screenHeight) {
      return true;
    }
    
    return false;
  }
}
