/**
 * Physics Engine Property-Based Tests
 * 
 * Tests correctness properties for the physics engine:
 * - Property 1: Gravity increases velocity monotonically
 * - Property 2: Jump velocity is consistent
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import { PhysicsEngine } from './physics.js';
import { PHYSICS } from './constants.js';

describe('PhysicsEngine', () => {
  let physics;
  
  beforeEach(() => {
    physics = new PhysicsEngine();
  });
  
  describe('Initialization', () => {
    it('should initialize with correct starting position', () => {
      const position = physics.getPosition();
      expect(position.x).toBe(PHYSICS.GHOST_START_X);
      expect(position.y).toBe(PHYSICS.GHOST_START_Y);
    });
    
    it('should initialize with zero velocity', () => {
      const velocity = physics.getVelocity();
      expect(velocity.vx).toBe(0);
      expect(velocity.vy).toBe(0);
    });
  });
  
  describe('Property 1: Gravity Increases Velocity Monotonically', () => {
    /**
     * **Validates: Requirements 3.1, 3.2**
     * 
     * For any frame during gameplay, the ghost's vertical velocity should 
     * increase by the gravity constant each frame.
     */
    test.prop([fc.integer({ min: 1, max: 100 })])(
      'gravity should increase velocity by gravity constant each frame',
      (numFrames) => {
        const initialVelocity = physics.getVelocity().vy;
        
        // Apply gravity for multiple frames
        for (let i = 0; i < numFrames; i++) {
          physics.update(1/60); // deltaTime for 60 FPS
        }
        
        const finalVelocity = physics.getVelocity().vy;
        const expectedVelocity = initialVelocity + (PHYSICS.GRAVITY * numFrames);
        
        // Verify velocity increased by gravity * numFrames
        expect(finalVelocity).toBeCloseTo(expectedVelocity, 5);
      }
    );
    
    test.prop([fc.integer({ min: 2, max: 50 })])(
      'velocity should increase monotonically over consecutive frames',
      (numFrames) => {
        const velocities = [];
        
        // Collect velocities over multiple frames
        for (let i = 0; i < numFrames; i++) {
          velocities.push(physics.getVelocity().vy);
          physics.update(1/60);
        }
        
        // Verify each velocity is greater than the previous
        for (let i = 1; i < velocities.length; i++) {
          expect(velocities[i]).toBeGreaterThan(velocities[i - 1]);
        }
      }
    );
    
    it('should apply gravity constant correctly', () => {
      const initialVelocity = physics.getVelocity().vy;
      physics.update(1/60);
      const newVelocity = physics.getVelocity().vy;
      
      expect(newVelocity - initialVelocity).toBeCloseTo(PHYSICS.GRAVITY, 5);
    });
  });
  
  describe('Property 2: Jump Velocity is Consistent', () => {
    /**
     * **Validates: Requirements 4.4, 4.5**
     * 
     * For any sequence of jump inputs, each jump should apply the same 
     * upward velocity to the ghost.
     */
    test.prop([fc.integer({ min: 1, max: 20 })])(
      'jump should apply consistent velocity regardless of number of jumps',
      (numJumps) => {
        const jumpVelocities = [];
        
        // Apply multiple jumps and record velocities
        for (let i = 0; i < numJumps; i++) {
          physics.applyJump();
          jumpVelocities.push(physics.getVelocity().vy);
          
          // Simulate some frames between jumps
          physics.update(1/60);
          physics.update(1/60);
        }
        
        // Verify all jump velocities are the same
        for (let i = 0; i < jumpVelocities.length; i++) {
          expect(jumpVelocities[i]).toBe(PHYSICS.JUMP_VELOCITY);
        }
      }
    );
    
    test.prop([fc.integer({ min: 0, max: 100 })])(
      'jump velocity should be consistent regardless of current velocity',
      (framesBeforeJump) => {
        // Let gravity affect velocity for some frames
        for (let i = 0; i < framesBeforeJump; i++) {
          physics.update(1/60);
        }
        
        // Apply jump
        physics.applyJump();
        const velocityAfterJump = physics.getVelocity().vy;
        
        // Verify jump velocity is always the same constant
        expect(velocityAfterJump).toBe(PHYSICS.JUMP_VELOCITY);
      }
    );
    
    it('should set velocity to jump velocity constant', () => {
      physics.applyJump();
      const velocity = physics.getVelocity().vy;
      
      expect(velocity).toBe(PHYSICS.JUMP_VELOCITY);
      expect(velocity).toBe(-12); // Negative = upward
    });
  });
  
  describe('Position Updates', () => {
    it('should update position based on velocity', () => {
      const initialPosition = physics.getPosition();
      
      // Set a known velocity
      physics.velocity.vy = 10;
      physics.update(1/60);
      
      const newPosition = physics.getPosition();
      
      // Position should be initial + velocity + gravity effect
      // After update: velocity becomes 10 + 0.6, position becomes initial + 10
      // But gravity is applied first, so velocity becomes 10.6, then position += 10.6
      expect(newPosition.y).toBeCloseTo(initialPosition.y + 10 + PHYSICS.GRAVITY, 5);
    });
    
    it('should maintain horizontal position (fixed X)', () => {
      const initialX = physics.getPosition().x;
      
      // Update multiple times
      for (let i = 0; i < 10; i++) {
        physics.update(1/60);
      }
      
      const finalX = physics.getPosition().x;
      expect(finalX).toBe(initialX);
    });
  });
  
  describe('Reset Functionality', () => {
    it('should reset position to starting position', () => {
      // Move the ghost
      physics.update(1/60);
      physics.update(1/60);
      
      // Reset
      physics.reset();
      
      const position = physics.getPosition();
      expect(position.x).toBe(PHYSICS.GHOST_START_X);
      expect(position.y).toBe(PHYSICS.GHOST_START_Y);
    });
    
    it('should reset velocity to zero', () => {
      // Apply jump and gravity
      physics.applyJump();
      physics.update(1/60);
      
      // Reset
      physics.reset();
      
      const velocity = physics.getVelocity();
      expect(velocity.vx).toBe(0);
      expect(velocity.vy).toBe(0);
    });
  });
  
  describe('Getter Methods', () => {
    it('getPosition should return a copy of position', () => {
      const position1 = physics.getPosition();
      const position2 = physics.getPosition();
      
      // Verify they are different objects
      expect(position1).not.toBe(position2);
      
      // But have the same values
      expect(position1.x).toBe(position2.x);
      expect(position1.y).toBe(position2.y);
    });
    
    it('getVelocity should return a copy of velocity', () => {
      const velocity1 = physics.getVelocity();
      const velocity2 = physics.getVelocity();
      
      // Verify they are different objects
      expect(velocity1).not.toBe(velocity2);
      
      // But have the same values
      expect(velocity1.vx).toBe(velocity2.vx);
      expect(velocity1.vy).toBe(velocity2.vy);
    });
  });
});
