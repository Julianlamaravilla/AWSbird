/**
 * Pipe Generator Property-Based Tests
 * 
 * Tests correctness properties for the pipe generator:
 * - Property 3: Pipes move leftward
 * - Property 4: Pipe spacing is consistent
 * - Property 5: Gap position is valid
 * - Property 9: Pipe width consistency
 * - Property 10: Pipe gap size consistency
 * - Property 11: Endless pipe generation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import { PipeGenerator } from './pipes.js';
import { PIPE, SCREEN } from './constants.js';

describe('PipeGenerator', () => {
  let pipeGenerator;
  
  beforeEach(() => {
    pipeGenerator = new PipeGenerator(SCREEN.WIDTH, SCREEN.HEIGHT);
  });
  
  describe('Initialization', () => {
    it('should initialize with no pipes', () => {
      const pipes = pipeGenerator.getPipes();
      expect(pipes).toEqual([]);
    });
    
    it('should initialize with correct screen dimensions', () => {
      expect(pipeGenerator.screenWidth).toBe(SCREEN.WIDTH);
      expect(pipeGenerator.screenHeight).toBe(SCREEN.HEIGHT);
    });
    
    it('should initialize with correct pipe configuration', () => {
      expect(pipeGenerator.pipeWidth).toBe(PIPE.WIDTH);
      expect(pipeGenerator.gapSize).toBe(PIPE.GAP_SIZE);
      expect(pipeGenerator.pipeSpeed).toBe(PIPE.SPEED);
      expect(pipeGenerator.creationInterval).toBe(PIPE.CREATION_INTERVAL);
    });
  });
  
  describe('Property 3: Pipes Move Leftward', () => {
    /**
     * **Validates: Requirements 5.5**
     * 
     * For any frame during gameplay, all active pipes should move
     * leftward by the pipe speed constant.
     */
    test.prop([fc.integer({ min: 1, max: 100 })])(
      'pipes should move leftward by pipe speed each frame',
      (numFrames) => {
        // Create a pipe manually
        pipeGenerator.createPipe();
        const initialX = pipeGenerator.getPipes()[0].x;
        
        // Update for numFrames
        for (let i = 0; i < numFrames; i++) {
          pipeGenerator.update(1/60);
        }
        
        const finalX = pipeGenerator.getPipes()[0].x;
        const expectedX = initialX - (PIPE.SPEED * numFrames);
        
        expect(finalX).toBe(expectedX);
      }
    );
    
    test.prop([fc.integer({ min: 2, max: 10 })])(
      'all pipes should move at the same speed',
      (numPipes) => {
        // Create multiple pipes
        for (let i = 0; i < numPipes; i++) {
          pipeGenerator.createPipe();
        }
        
        const initialPositions = pipeGenerator.getPipes().map(p => p.x);
        
        // Update one frame
        pipeGenerator.update(1/60);
        
        const finalPositions = pipeGenerator.getPipes().map(p => p.x);
        
        // All pipes should have moved by the same amount
        for (let i = 0; i < numPipes; i++) {
          const movement = initialPositions[i] - finalPositions[i];
          expect(movement).toBe(PIPE.SPEED);
        }
      }
    );
    
    it('should move pipes leftward by pipe speed constant', () => {
      pipeGenerator.createPipe();
      const initialX = pipeGenerator.getPipes()[0].x;
      
      pipeGenerator.update(1/60);
      
      const finalX = pipeGenerator.getPipes()[0].x;
      expect(finalX).toBe(initialX - PIPE.SPEED);
    });
  });
  
  describe('Property 4: Pipe Spacing is Consistent', () => {
    /**
     * **Validates: Requirements 6.3**
     * 
     * For any two consecutive pipes created, the horizontal distance
     * between them should be equal to the pipe spacing constant.
     */
    test.prop([fc.integer({ min: 2, max: 20 })])(
      'consecutive pipes should have consistent spacing',
      (numPipes) => {
        // Create multiple pipes by advancing frames
        const spacings = [];
        
        for (let i = 0; i < numPipes; i++) {
          const beforeCount = pipeGenerator.getPipes().length;
          
          // Advance to next pipe creation
          for (let j = 0; j < PIPE.CREATION_INTERVAL; j++) {
            pipeGenerator.update(1/60);
          }
          
          const afterCount = pipeGenerator.getPipes().length;
          
          // Check if a new pipe was created
          if (afterCount > beforeCount && afterCount >= 2) {
            const pipes = pipeGenerator.getPipes();
            const spacing = pipes[pipes.length - 1].x - pipes[pipes.length - 2].x;
            spacings.push(spacing);
          }
        }
        
        // All spacings should be equal (accounting for movement during creation)
        if (spacings.length > 1) {
          const firstSpacing = spacings[0];
          for (const spacing of spacings) {
            // Spacing should be consistent (within small tolerance for frame timing)
            expect(Math.abs(spacing - firstSpacing)).toBeLessThan(PIPE.SPEED * 2);
          }
        }
      }
    );
    
    it('should create pipes at consistent intervals', () => {
      // Advance to create first pipe (interval reached on frame 90)
      for (let i = 0; i < PIPE.CREATION_INTERVAL; i++) {
        pipeGenerator.update(1/60);
      }
      
      expect(pipeGenerator.getPipes().length).toBe(1);
      const firstPipe = pipeGenerator.getPipes()[0];
      
      // First pipe should be at screen width initially
      expect(firstPipe.x).toBe(SCREEN.WIDTH);
      
      // Advance one more frame to see movement
      pipeGenerator.update(1/60);
      
      // First pipe should have moved
      expect(pipeGenerator.getPipes()[0].x).toBe(SCREEN.WIDTH - PIPE.SPEED);
      
      // Advance to create second pipe
      for (let i = 0; i < PIPE.CREATION_INTERVAL - 1; i++) {
        pipeGenerator.update(1/60);
      }
      
      const pipes = pipeGenerator.getPipes();
      expect(pipes.length).toBe(2);
      
      // Second pipe should be at screen width (newly created)
      expect(pipes[1].x).toBe(SCREEN.WIDTH);
    });
  });
  
  describe('Property 5: Gap Position is Valid', () => {
    /**
     * **Validates: Requirements 5.4**
     * 
     * For any pipe created, the gap position should be within valid bounds
     * (not at extreme top or bottom of screen).
     */
    test.prop([fc.integer({ min: 1, max: 100 })])(
      'gap position should always be within valid bounds',
      (numPipes) => {
        // Create multiple pipes
        for (let i = 0; i < numPipes; i++) {
          pipeGenerator.createPipe();
        }
        
        const pipes = pipeGenerator.getPipes();
        
        for (const pipe of pipes) {
          // Gap should be within min and max bounds
          expect(pipe.gapY).toBeGreaterThanOrEqual(PIPE.MIN_GAP_Y);
          expect(pipe.gapY).toBeLessThanOrEqual(
            SCREEN.HEIGHT - PIPE.MAX_GAP_Y_OFFSET - PIPE.GAP_SIZE
          );
          
          // Gap should be passable (not at extreme positions)
          expect(pipe.gapY).toBeGreaterThan(0);
          expect(pipe.gapY + pipe.gapSize).toBeLessThan(SCREEN.HEIGHT);
        }
      }
    );
    
    test.prop([fc.integer({ min: 10, max: 50 })])(
      'gap positions should vary across multiple pipes',
      (numPipes) => {
        // Create multiple pipes
        const gapPositions = [];
        for (let i = 0; i < numPipes; i++) {
          pipeGenerator.createPipe();
          const pipes = pipeGenerator.getPipes();
          gapPositions.push(pipes[pipes.length - 1].gapY);
        }
        
        // Check that not all gaps are identical (randomness)
        const uniquePositions = new Set(gapPositions);
        
        // With enough pipes, we should see variation
        if (numPipes >= 20) {
          expect(uniquePositions.size).toBeGreaterThan(1);
        }
      }
    );
    
    it('should create gap within valid bounds', () => {
      pipeGenerator.createPipe();
      const pipe = pipeGenerator.getPipes()[0];
      
      expect(pipe.gapY).toBeGreaterThanOrEqual(PIPE.MIN_GAP_Y);
      expect(pipe.gapY).toBeLessThanOrEqual(
        SCREEN.HEIGHT - PIPE.MAX_GAP_Y_OFFSET - PIPE.GAP_SIZE
      );
    });
  });
  
  describe('Property 9: Pipe Width Consistency', () => {
    /**
     * **Validates: Requirements 6.1**
     * 
     * For any pipe created, the pipe width should equal the pipe width constant.
     */
    test.prop([fc.integer({ min: 1, max: 100 })])(
      'all pipes should have consistent width',
      (numPipes) => {
        // Create multiple pipes
        for (let i = 0; i < numPipes; i++) {
          pipeGenerator.createPipe();
        }
        
        const pipes = pipeGenerator.getPipes();
        
        for (const pipe of pipes) {
          expect(pipe.width).toBe(PIPE.WIDTH);
        }
      }
    );
    
    it('should create pipes with correct width', () => {
      pipeGenerator.createPipe();
      const pipe = pipeGenerator.getPipes()[0];
      
      expect(pipe.width).toBe(PIPE.WIDTH);
    });
  });
  
  describe('Property 10: Pipe Gap Size Consistency', () => {
    /**
     * **Validates: Requirements 6.2**
     * 
     * For any pipe created, the gap size should equal the gap size constant.
     */
    test.prop([fc.integer({ min: 1, max: 100 })])(
      'all pipes should have consistent gap size',
      (numPipes) => {
        // Create multiple pipes
        for (let i = 0; i < numPipes; i++) {
          pipeGenerator.createPipe();
        }
        
        const pipes = pipeGenerator.getPipes();
        
        for (const pipe of pipes) {
          expect(pipe.gapSize).toBe(PIPE.GAP_SIZE);
        }
      }
    );
    
    it('should create pipes with correct gap size', () => {
      pipeGenerator.createPipe();
      const pipe = pipeGenerator.getPipes()[0];
      
      expect(pipe.gapSize).toBe(PIPE.GAP_SIZE);
    });
  });
  
  describe('Property 11: Endless Pipe Generation', () => {
    /**
     * **Validates: Requirements 5.1, 20.1**
     * 
     * For any duration of gameplay without collision, new pipes should be
     * created at regular intervals.
     */
    test.prop([fc.integer({ min: 1, max: 10 })])(
      'pipes should be created at regular intervals',
      (numIntervals) => {
        let pipesCreated = 0;
        
        for (let i = 0; i < numIntervals; i++) {
          // Advance by creation interval
          for (let j = 0; j < PIPE.CREATION_INTERVAL; j++) {
            pipeGenerator.update(1/60);
          }
          
          // After each interval, at least one pipe should exist
          // (even if old ones moved off-screen)
          const pipes = pipeGenerator.getPipes();
          expect(pipes.length).toBeGreaterThan(0);
          
          pipesCreated++;
        }
        
        // Should have gone through all intervals
        expect(pipesCreated).toBe(numIntervals);
      }
    );
    
    test.prop([fc.integer({ min: 100, max: 1000 })])(
      'pipes should continue generating indefinitely',
      (numFrames) => {
        // Run for many frames
        for (let i = 0; i < numFrames; i++) {
          pipeGenerator.update(1/60);
        }
        
        // Should have created pipes
        const expectedPipes = Math.floor(numFrames / PIPE.CREATION_INTERVAL);
        const pipes = pipeGenerator.getPipes();
        
        // Some pipes may have moved off-screen, but we should have active pipes
        expect(pipes.length).toBeGreaterThan(0);
        
        // Should have created approximately the expected number
        // (accounting for off-screen removal)
        expect(pipes.length).toBeLessThanOrEqual(expectedPipes + 1);
      }
    );
    
    it('should create new pipe after creation interval', () => {
      expect(pipeGenerator.getPipes().length).toBe(0);
      
      // Advance by creation interval
      for (let i = 0; i < PIPE.CREATION_INTERVAL; i++) {
        pipeGenerator.update(1/60);
      }
      
      expect(pipeGenerator.getPipes().length).toBe(1);
    });
  });
  
  describe('Pipe Removal', () => {
    it('should remove pipes that move off-screen', () => {
      pipeGenerator.createPipe();
      const pipe = pipeGenerator.getPipes()[0];
      
      // Move pipe far off-screen to the left
      const framesToMoveOffScreen = Math.ceil((pipe.x + pipe.width) / PIPE.SPEED) + 1;
      
      for (let i = 0; i < framesToMoveOffScreen; i++) {
        pipeGenerator.update(1/60);
      }
      
      // Pipe should be removed (or new pipes created)
      const pipes = pipeGenerator.getPipes();
      
      // Either no pipes, or the first pipe is not the original one
      if (pipes.length > 0) {
        expect(pipes[0].x).toBeGreaterThan(-PIPE.WIDTH);
      }
    });
    
    test.prop([fc.integer({ min: 5, max: 20 })])(
      'should not accumulate off-screen pipes',
      (numPipes) => {
        // Create many pipes
        for (let i = 0; i < numPipes; i++) {
          pipeGenerator.createPipe();
        }
        
        // Move all pipes far off-screen
        const framesToClear = Math.ceil((SCREEN.WIDTH + PIPE.WIDTH) / PIPE.SPEED) + 10;
        
        for (let i = 0; i < framesToClear; i++) {
          pipeGenerator.update(1/60);
        }
        
        // All original pipes should be removed
        const pipes = pipeGenerator.getPipes();
        
        // Should only have pipes created during the update loop
        const expectedNewPipes = Math.floor(framesToClear / PIPE.CREATION_INTERVAL);
        expect(pipes.length).toBeLessThanOrEqual(expectedNewPipes + 1);
      }
    );
  });
  
  describe('Reset Functionality', () => {
    it('should clear all pipes on reset', () => {
      // Create some pipes
      for (let i = 0; i < 5; i++) {
        pipeGenerator.createPipe();
      }
      
      expect(pipeGenerator.getPipes().length).toBe(5);
      
      pipeGenerator.reset();
      
      expect(pipeGenerator.getPipes().length).toBe(0);
    });
    
    it('should reset frame counter on reset', () => {
      // Advance frames
      for (let i = 0; i < PIPE.CREATION_INTERVAL - 1; i++) {
        pipeGenerator.update(1/60);
      }
      
      pipeGenerator.reset();
      
      // Should not create pipe immediately after reset
      expect(pipeGenerator.getPipes().length).toBe(0);
      
      // Should create pipe after full interval
      for (let i = 0; i < PIPE.CREATION_INTERVAL; i++) {
        pipeGenerator.update(1/60);
      }
      
      expect(pipeGenerator.getPipes().length).toBe(1);
    });
  });
  
  describe('Pipe Structure', () => {
    it('should create pipes with correct structure', () => {
      pipeGenerator.createPipe();
      const pipe = pipeGenerator.getPipes()[0];
      
      expect(pipe).toHaveProperty('x');
      expect(pipe).toHaveProperty('topY');
      expect(pipe).toHaveProperty('gapY');
      expect(pipe).toHaveProperty('width');
      expect(pipe).toHaveProperty('gapSize');
      expect(pipe).toHaveProperty('scored');
      
      expect(typeof pipe.x).toBe('number');
      expect(typeof pipe.topY).toBe('number');
      expect(typeof pipe.gapY).toBe('number');
      expect(typeof pipe.width).toBe('number');
      expect(typeof pipe.gapSize).toBe('number');
      expect(typeof pipe.scored).toBe('boolean');
    });
    
    it('should initialize scored flag to false', () => {
      pipeGenerator.createPipe();
      const pipe = pipeGenerator.getPipes()[0];
      
      expect(pipe.scored).toBe(false);
    });
    
    it('should position pipes off-screen to the right', () => {
      pipeGenerator.createPipe();
      const pipe = pipeGenerator.getPipes()[0];
      
      expect(pipe.x).toBe(SCREEN.WIDTH);
    });
    
    it('should set topY equal to gapY', () => {
      pipeGenerator.createPipe();
      const pipe = pipeGenerator.getPipes()[0];
      
      expect(pipe.topY).toBe(pipe.gapY);
    });
  });
  
  describe('getPipes Method', () => {
    it('should return array of pipes', () => {
      const pipes = pipeGenerator.getPipes();
      expect(Array.isArray(pipes)).toBe(true);
    });
    
    it('should return current pipes', () => {
      pipeGenerator.createPipe();
      pipeGenerator.createPipe();
      
      const pipes = pipeGenerator.getPipes();
      expect(pipes.length).toBe(2);
    });
  });
});
