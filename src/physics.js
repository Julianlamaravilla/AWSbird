/**
 * Physics Engine
 * 
 * Handles gravity, velocity, and position updates for the ghost character.
 * Applies constant downward acceleration (gravity) and manages jump mechanics.
 */

import { PHYSICS, GHOST } from './constants.js';

export class PhysicsEngine {
  constructor(gravity = PHYSICS.GRAVITY, jumpVelocity = PHYSICS.JUMP_VELOCITY) {
    this.gravity = gravity;
    this.jumpVelocity = jumpVelocity;
    
    // Initialize position
    this.position = {
      x: PHYSICS.GHOST_START_X,
      y: PHYSICS.GHOST_START_Y
    };
    
    // Initialize velocity
    this.velocity = {
      vx: 0,
      vy: 0
    };
  }
  
  /**
   * Update physics simulation
   * Applies gravity and updates position based on velocity
   * @param {number} deltaTime - Time elapsed since last frame (in seconds)
   */
  update(deltaTime) {
    // Apply gravity to velocity (gravity is in pixels/frame²)
    this.velocity.vy += this.gravity;
    
    // Update position based on velocity
    this.position.x += this.velocity.vx;
    this.position.y += this.velocity.vy;
  }
  
  /**
   * Apply jump velocity to the ghost
   * Sets vertical velocity to jump velocity constant (negative = upward)
   */
  applyJump() {
    this.velocity.vy = this.jumpVelocity;
  }
  
  /**
   * Get current ghost position
   * @returns {{x: number, y: number}} Current position
   */
  getPosition() {
    return { ...this.position };
  }
  
  /**
   * Get current ghost velocity
   * @returns {{vx: number, vy: number}} Current velocity
   */
  getVelocity() {
    return { ...this.velocity };
  }
  
  /**
   * Reset physics engine to initial state
   * Returns ghost to starting position with zero velocity
   */
  reset() {
    this.position.x = PHYSICS.GHOST_START_X;
    this.position.y = PHYSICS.GHOST_START_Y;
    this.velocity.vx = 0;
    this.velocity.vy = 0;
  }
}
