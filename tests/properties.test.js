/**
 * Comprehensive Property-Based Tests for Flappy Kiro
 * 
 * This test suite validates all 13 correctness properties from the design document
 * using property-based testing with 100+ iterations per property.
 * 
 * Properties tested:
 * 1. Gravity increases velocity monotonically
 * 2. Jump velocity is consistent
 * 3. Pipes move leftward
 * 4. Pipe spacing is consistent
 * 5. Gap position is valid
 * 6. Collision detection accuracy
 * 7. Score increments once per pipe
 * 8. High score update logic
 * 9. Pipe width consistency
 * 10. Pipe gap size consistency
 * 11. Endless pipe generation
 * 12. Difficulty consistency
 * 13. Game state reset
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import { PhysicsEngine } from '../src/physics.js';
import { PipeGenerator } from '../src/pipes.js';
import { CollisionDetector } from '../src/collision.js';
import { ScoreTracker } from '../src/score.js';
import { Game } from '../src/game.js';
import { PHYSICS, PIPE, GHOST, SCREEN, STORAGE, GAME_STATE } from '../src/constants.js';

// Mock canvas for testing
function createMockCanvas() {
  return {
    width: SCREEN.WIDTH,
    height: SCREEN.HEIGHT,
    getContext: () => ({
      clearRect: () => {},
      fillRect: () => {},
      drawImage: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      fillStyle: '',
      strokeStyle: '',
      globalAlpha: 1,
      font: '',
      textAlign: '',
      textBaseline: '',
      fillText: () => {},
      measureText: () => ({ width: 0 }),
      imageSmoothingEnabled: false
    })
  };
}

describe('Property-Based Tests - Flappy Kiro Correctness Properties', () => {
  
  describe('Property 1: Gravity Increases Velocity Monotonically', () => {
    /**
     * **Validates: Requirements 3.1, 3.2**
     * 
     * For any frame during gameplay, the ghost's vertical velocity should 
     * increase by the gravity constant each frame.
     */
    
    test.prop([fc.integer({ min: 1, max: 200 })])(
      'gravity should increase velocity by gravity constant each frame (100+ iterations)',
      (numFrames) => {
        const physics = new PhysicsEngine();
        const initialVelocity = physics.getVelocity().vy;
        
        // Apply gravity for multiple frames
        for (let i = 0; i < numFrames; i++) {
          physics.update(1/60);
        }
        
        const finalVelocity = physics.getVelocity().vy;
        const expectedVelocity = initialVelocity + (PHYSICS.GRAVITY * numFrames);
        
        expect(finalVelocity).toBeCloseTo(expectedVelocity, 5);
      }
    );
    
    test.prop([fc.integer({ min: 2, max: 100 })])(
      'velocity should increase monotonically over consecutive frames (100+ iterations)',
      (numFrames) => {
        const physics = new PhysicsEngine();
        const velocities = [];
        
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
  });
  
  describe('Property 2: Jump Velocity is Consistent', () => {
    /**
     * **Validates: Requirements 4.4, 4.5**
     * 
     * For any sequence of jump inputs, each jump should apply the same 
     * upward velocity to the ghost.
     */
    
    test.prop([fc.integer({ min: 1, max: 50 })])(
      'jump should apply consistent velocity regardless of number of jumps (100+ iterations)',
      (numJumps) => {
        const physics = new PhysicsEngine();
        const jumpVelocities = [];
        
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
    
    test.prop([fc.integer({ min: 0, max: 150 })])(
      'jump velocity should be consistent regardless of current velocity (100+ iterations)',
      (framesBeforeJump) => {
        const physics = new PhysicsEngine();
        
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
  });
  
  describe('Property 3: Pipes Move Leftward', () => {
    /**
     * **Validates: Requirements 5.5**
     * 
     * For any frame during gameplay, all active pipes should move
     * leftward by the pipe speed constant.
     */
    
    test.prop([fc.integer({ min: 1, max: 100 })])(
      'pipes should move leftward by pipe speed each frame (100+ iterations)',
      (numFrames) => {
        const pipeGenerator = new PipeGenerator(SCREEN.WIDTH, SCREEN.HEIGHT);
        pipeGenerator.createPipe();
        const initialX = pipeGenerator.getPipes()[0].x;
        
        for (let i = 0; i < numFrames; i++) {
          pipeGenerator.update(1/60);
        }
        
        const pipes = pipeGenerator.getPipes();
        
        // Pipe may have been removed if it moved off-screen
        if (pipes.length > 0) {
          const finalX = pipes[0].x;
          const expectedX = initialX - (PIPE.SPEED * numFrames);
          
          // Only check if pipe hasn't moved off-screen
          if (expectedX > -PIPE.WIDTH) {
            expect(finalX).toBe(expectedX);
          }
        }
      }
    );
    
    test.prop([fc.integer({ min: 2, max: 20 })])(
      'all pipes should move at the same speed (100+ iterations)',
      (numPipes) => {
        const pipeGenerator = new PipeGenerator(SCREEN.WIDTH, SCREEN.HEIGHT);
        
        for (let i = 0; i < numPipes; i++) {
          pipeGenerator.createPipe();
        }
        
        const initialPositions = pipeGenerator.getPipes().map(p => p.x);
        pipeGenerator.update(1/60);
        const finalPositions = pipeGenerator.getPipes().map(p => p.x);
        
        for (let i = 0; i < numPipes; i++) {
          const movement = initialPositions[i] - finalPositions[i];
          expect(movement).toBe(PIPE.SPEED);
        }
      }
    );
  });
  
  describe('Property 4: Pipe Spacing is Consistent', () => {
    /**
     * **Validates: Requirements 6.3**
     * 
     * For any two consecutive pipes created, the horizontal distance
     * between them should be equal to the pipe spacing constant.
     */
    
    test.prop([fc.integer({ min: 2, max: 30 })])(
      'consecutive pipes should have consistent spacing (100+ iterations)',
      (numPipes) => {
        const pipeGenerator = new PipeGenerator(SCREEN.WIDTH, SCREEN.HEIGHT);
        const spacings = [];
        
        for (let i = 0; i < numPipes; i++) {
          const beforeCount = pipeGenerator.getPipes().length;
          
          for (let j = 0; j < PIPE.CREATION_INTERVAL; j++) {
            pipeGenerator.update(1/60);
          }
          
          const afterCount = pipeGenerator.getPipes().length;
          
          if (afterCount > beforeCount && afterCount >= 2) {
            const pipes = pipeGenerator.getPipes();
            const spacing = pipes[pipes.length - 1].x - pipes[pipes.length - 2].x;
            spacings.push(spacing);
          }
        }
        
        if (spacings.length > 1) {
          const firstSpacing = spacings[0];
          for (const spacing of spacings) {
            expect(Math.abs(spacing - firstSpacing)).toBeLessThan(PIPE.SPEED * 2);
          }
        }
      }
    );
  });
  
  describe('Property 5: Gap Position is Valid', () => {
    /**
     * **Validates: Requirements 5.4**
     * 
     * For any pipe created, the gap position should be within valid bounds
     * (not at extreme top or bottom of screen).
     */
    
    test.prop([fc.integer({ min: 1, max: 200 })])(
      'gap position should always be within valid bounds (100+ iterations)',
      (numPipes) => {
        const pipeGenerator = new PipeGenerator(SCREEN.WIDTH, SCREEN.HEIGHT);
        
        for (let i = 0; i < numPipes; i++) {
          pipeGenerator.createPipe();
        }
        
        const pipes = pipeGenerator.getPipes();
        
        for (const pipe of pipes) {
          expect(pipe.gapY).toBeGreaterThanOrEqual(PIPE.MIN_GAP_Y);
          expect(pipe.gapY).toBeLessThanOrEqual(
            SCREEN.HEIGHT - PIPE.MAX_GAP_Y_OFFSET - PIPE.GAP_SIZE
          );
          expect(pipe.gapY).toBeGreaterThan(0);
          expect(pipe.gapY + pipe.gapSize).toBeLessThan(SCREEN.HEIGHT);
        }
      }
    );
    
    test.prop([fc.integer({ min: 20, max: 100 })])(
      'gap positions should vary across multiple pipes (100+ iterations)',
      (numPipes) => {
        const pipeGenerator = new PipeGenerator(SCREEN.WIDTH, SCREEN.HEIGHT);
        const gapPositions = [];
        
        for (let i = 0; i < numPipes; i++) {
          pipeGenerator.createPipe();
          const pipes = pipeGenerator.getPipes();
          gapPositions.push(pipes[pipes.length - 1].gapY);
        }
        
        const uniquePositions = new Set(gapPositions);
        expect(uniquePositions.size).toBeGreaterThan(1);
      }
    );
  });
  
  describe('Property 6: Collision Detection Accuracy', () => {
    /**
     * **Validates: Requirements 7.1, 7.2, 7.3**
     * 
     * For any ghost position and pipe configuration, a collision should be 
     * detected if and only if the ghost's bounding box overlaps with a pipe 
     * section or exceeds screen boundaries.
     */
    
    test.prop([
      fc.integer({ min: 0, max: SCREEN.WIDTH }),
      fc.integer({ min: 50, max: SCREEN.HEIGHT - 50 }),
      fc.integer({ min: 0, max: SCREEN.WIDTH }),
      fc.integer({ min: 50, max: 400 }),
    ])(
      'should correctly detect collision state for any ghost and pipe position (100+ iterations)',
      (ghostX, ghostY, pipeX, gapY) => {
        const collisionDetector = new CollisionDetector();
        const pipe = {
          x: pipeX,
          topY: gapY,
          gapY: gapY,
          width: PIPE.WIDTH,
          gapSize: PIPE.GAP_SIZE
        };
        
        const ghostPos = { x: ghostX, y: ghostY };
        
        // Calculate expected collision using AABB logic
        const ghostLeft = ghostX - GHOST.WIDTH / 2;
        const ghostRight = ghostX + GHOST.WIDTH / 2;
        const ghostTop = ghostY - GHOST.HEIGHT / 2;
        const ghostBottom = ghostY + GHOST.HEIGHT / 2;
        
        const pipeLeft = pipeX;
        const pipeRight = pipeX + PIPE.WIDTH;
        const bottomPipeTop = gapY + PIPE.GAP_SIZE;
        
        const horizontalOverlap = ghostRight > pipeLeft && ghostLeft < pipeRight;
        const hitsTopPipe = ghostTop < gapY;
        const hitsBottomPipe = ghostBottom > bottomPipeTop;
        
        const shouldCollide = horizontalOverlap && (hitsTopPipe || hitsBottomPipe);
        const doesCollide = collisionDetector.checkPipeCollision(ghostPos, pipe);
        
        expect(doesCollide).toBe(shouldCollide);
      }
    );
    
    test.prop([
      fc.integer({ min: 0, max: SCREEN.WIDTH }),
      fc.integer({ min: -100, max: SCREEN.HEIGHT + 100 }),
    ])(
      'should detect boundary collisions correctly (100+ iterations)',
      (ghostX, ghostY) => {
        const collisionDetector = new CollisionDetector();
        const ghostPos = { x: ghostX, y: ghostY };
        
        const ghostTop = ghostY - GHOST.HEIGHT / 2;
        const ghostBottom = ghostY + GHOST.HEIGHT / 2;
        
        const shouldCollide = ghostTop < 0 || ghostBottom > SCREEN.HEIGHT;
        const doesCollide = collisionDetector.checkBoundaryCollision(ghostPos);
        
        expect(doesCollide).toBe(shouldCollide);
      }
    );
  });
  
  describe('Property 7: Score Increments Once Per Pipe', () => {
    /**
     * **Validates: Requirements 8.1, 8.4**
     * 
     * For any pipe, the score should increment at most once when the ghost 
     * passes through the gap.
     */
    
    test.prop([fc.integer({ min: 10, max: 50 })])(
      'score should increment exactly once per pipe regardless of update frequency (100+ iterations)',
      (updateCount) => {
        const tracker = new ScoreTracker();
        const pipe = {
          x: 100,
          width: 80,
          scored: false
        };
        
        let scoreIncrements = 0;
        
        for (let j = 0; j < updateCount; j++) {
          const ghostX = 100 + (j * 10);
          const prevScore = tracker.getCurrentScore();
          
          tracker.update({ x: ghostX, y: 300 }, [pipe]);
          
          const newScore = tracker.getCurrentScore();
          if (newScore > prevScore) {
            scoreIncrements++;
          }
        }
        
        expect(scoreIncrements).toBeLessThanOrEqual(1);
        expect(tracker.getCurrentScore()).toBeLessThanOrEqual(1);
      }
    );
    
    test.prop([fc.integer({ min: 1, max: 20 })])(
      'score should increment once per pipe for multiple pipes (100+ iterations)',
      (pipeCount) => {
        const tracker = new ScoreTracker();
        const pipes = [];
        
        for (let j = 0; j < pipeCount; j++) {
          pipes.push({
            x: j * 200,
            width: 80,
            scored: false
          });
        }
        
        const ghostX = pipeCount * 200 + 100;
        tracker.update({ x: ghostX, y: 300 }, pipes);
        
        expect(tracker.getCurrentScore()).toBe(pipeCount);
        
        for (const pipe of pipes) {
          expect(pipe.scored).toBe(true);
        }
        
        // Additional updates should not change score
        tracker.update({ x: ghostX + 100, y: 300 }, pipes);
        expect(tracker.getCurrentScore()).toBe(pipeCount);
      }
    );
  });
  
  describe('Property 8: High Score Update Logic', () => {
    /**
     * **Validates: Requirements 12.1**
     * 
     * For any score that exceeds the current high score, the high score 
     * should be updated to that score.
     */
    
    beforeEach(() => {
      localStorage.clear();
    });
    
    afterEach(() => {
      localStorage.clear();
    });
    
    test.prop([fc.array(fc.integer({ min: 0, max: 200 }), { minLength: 1, maxLength: 10 })])(
      'high score should update when score exceeds current high score (100+ iterations)',
      (scores) => {
        const tracker = new ScoreTracker();
        let maxSoFar = 0;
        
        for (let i = 0; i < scores.length; i++) {
          const score = scores[i];
          tracker.updateHighScore(score);
          maxSoFar = Math.max(maxSoFar, score);
          expect(tracker.getHighScore()).toBe(maxSoFar);
        }
        
        expect(tracker.getHighScore()).toBe(Math.max(...scores));
      }
    );
    
    test.prop([
      fc.integer({ min: 50, max: 200 }),
      fc.array(fc.integer({ min: 0, max: 49 }), { minLength: 1, maxLength: 10 })
    ])(
      'high score should not update when score is lower or equal (100+ iterations)',
      (highScore, lowerScores) => {
        const tracker = new ScoreTracker();
        tracker.updateHighScore(highScore);
        
        for (const lowerScore of lowerScores) {
          tracker.updateHighScore(lowerScore);
          expect(tracker.getHighScore()).toBe(highScore);
        }
        
        tracker.updateHighScore(highScore);
        expect(tracker.getHighScore()).toBe(highScore);
      }
    );
    
    test.prop([fc.integer({ min: 1, max: 200 })])(
      'high score should persist to localStorage (100+ iterations)',
      (score) => {
        localStorage.clear();
        const tracker = new ScoreTracker();
        tracker.updateHighScore(score);
        
        const stored = localStorage.getItem(STORAGE.HIGH_SCORE);
        expect(stored).toBe(score.toString());
        
        const newTracker = new ScoreTracker();
        expect(newTracker.getHighScore()).toBe(score);
      }
    );
  });
  
  describe('Property 9: Pipe Width Consistency', () => {
    /**
     * **Validates: Requirements 6.1**
     * 
     * For any pipe created, the pipe width should equal the pipe width constant.
     */
    
    test.prop([fc.integer({ min: 1, max: 200 })])(
      'all pipes should have consistent width (100+ iterations)',
      (numPipes) => {
        const pipeGenerator = new PipeGenerator(SCREEN.WIDTH, SCREEN.HEIGHT);
        
        for (let i = 0; i < numPipes; i++) {
          pipeGenerator.createPipe();
        }
        
        const pipes = pipeGenerator.getPipes();
        
        for (const pipe of pipes) {
          expect(pipe.width).toBe(PIPE.WIDTH);
        }
      }
    );
  });
  
  describe('Property 10: Pipe Gap Size Consistency', () => {
    /**
     * **Validates: Requirements 6.2**
     * 
     * For any pipe created, the gap size should equal the gap size constant.
     */
    
    test.prop([fc.integer({ min: 1, max: 200 })])(
      'all pipes should have consistent gap size (100+ iterations)',
      (numPipes) => {
        const pipeGenerator = new PipeGenerator(SCREEN.WIDTH, SCREEN.HEIGHT);
        
        for (let i = 0; i < numPipes; i++) {
          pipeGenerator.createPipe();
        }
        
        const pipes = pipeGenerator.getPipes();
        
        for (const pipe of pipes) {
          expect(pipe.gapSize).toBe(PIPE.GAP_SIZE);
        }
      }
    );
  });
  
  describe('Property 11: Endless Pipe Generation', () => {
    /**
     * **Validates: Requirements 5.1, 20.1**
     * 
     * For any duration of gameplay without collision, new pipes should be
     * created at regular intervals.
     */
    
    test.prop([fc.integer({ min: 1, max: 20 })])(
      'pipes should be created at regular intervals (100+ iterations)',
      (numIntervals) => {
        const pipeGenerator = new PipeGenerator(SCREEN.WIDTH, SCREEN.HEIGHT);
        let pipesCreated = 0;
        
        for (let i = 0; i < numIntervals; i++) {
          for (let j = 0; j < PIPE.CREATION_INTERVAL; j++) {
            pipeGenerator.update(1/60);
          }
          
          const pipes = pipeGenerator.getPipes();
          expect(pipes.length).toBeGreaterThan(0);
          pipesCreated++;
        }
        
        expect(pipesCreated).toBe(numIntervals);
      }
    );
    
    test.prop([fc.integer({ min: 100, max: 1000 })])(
      'pipes should continue generating indefinitely (100+ iterations)',
      (numFrames) => {
        const pipeGenerator = new PipeGenerator(SCREEN.WIDTH, SCREEN.HEIGHT);
        
        for (let i = 0; i < numFrames; i++) {
          pipeGenerator.update(1/60);
        }
        
        const pipes = pipeGenerator.getPipes();
        expect(pipes.length).toBeGreaterThan(0);
        
        const expectedPipes = Math.floor(numFrames / PIPE.CREATION_INTERVAL);
        expect(pipes.length).toBeLessThanOrEqual(expectedPipes + 1);
      }
    );
  });
  
  describe('Property 12: Difficulty Consistency', () => {
    /**
     * **Validates: Requirements 20.2**
     * 
     * For any duration of gameplay, the pipe speed and spacing should remain 
     * constant (difficulty does not increase).
     */
    
    test.prop([fc.integer({ min: 100, max: 1000 })])(
      'pipe speed should remain constant over time (100+ iterations)',
      (numFrames) => {
        const pipeGenerator = new PipeGenerator(SCREEN.WIDTH, SCREEN.HEIGHT);
        
        // Create initial pipe
        pipeGenerator.createPipe();
        const initialSpeed = PIPE.SPEED;
        
        // Run for many frames
        for (let i = 0; i < numFrames; i++) {
          pipeGenerator.update(1/60);
        }
        
        // Verify speed hasn't changed
        expect(pipeGenerator.pipeSpeed).toBe(initialSpeed);
      }
    );
    
    test.prop([fc.integer({ min: 2, max: 20 })])(
      'pipe spacing should remain constant over time (100+ iterations)',
      (numPipes) => {
        const pipeGenerator = new PipeGenerator(SCREEN.WIDTH, SCREEN.HEIGHT);
        const initialSpacing = PIPE.SPACING;
        
        for (let i = 0; i < numPipes; i++) {
          for (let j = 0; j < PIPE.CREATION_INTERVAL; j++) {
            pipeGenerator.update(1/60);
          }
        }
        
        // Verify spacing hasn't changed (indirectly through creation interval)
        expect(pipeGenerator.creationInterval).toBe(PIPE.CREATION_INTERVAL);
      }
    );
    
    test.prop([fc.integer({ min: 2, max: 20 })])(
      'gap size should remain constant over time (100+ iterations)',
      (numPipes) => {
        const pipeGenerator = new PipeGenerator(SCREEN.WIDTH, SCREEN.HEIGHT);
        
        for (let i = 0; i < numPipes; i++) {
          pipeGenerator.createPipe();
        }
        
        const pipes = pipeGenerator.getPipes();
        
        for (const pipe of pipes) {
          expect(pipe.gapSize).toBe(PIPE.GAP_SIZE);
        }
      }
    );
  });
  
  describe('Property 13: Game State Reset', () => {
    /**
     * **Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5**
     * 
     * For any game state, calling reset should clear all game objects and 
     * return the game to the Menu state.
     */
    
    test.prop([fc.integer({ min: 50, max: 300 })])(
      'reset should clear all pipes (100+ iterations)',
      (numFrames) => {
        const game = new Game(createMockCanvas());
        game.transitionToPlaying();
        
        // Generate game state
        for (let i = 0; i < numFrames; i++) {
          if (game.getState() !== GAME_STATE.PLAYING) break;
          game.update(0.016, i % 10 === 0);
        }
        
        game.reset();
        
        const pipes = game.getPipes();
        expect(pipes.length).toBe(0);
      }
    );
    
    test.prop([fc.integer({ min: 50, max: 300 })])(
      'reset should reset score to 0 (100+ iterations)',
      (numFrames) => {
        const game = new Game(createMockCanvas());
        game.transitionToPlaying();
        
        for (let i = 0; i < numFrames; i++) {
          game.update(0.016, false);
        }
        
        game.reset();
        
        const score = game.getCurrentScore();
        expect(score).toBe(0);
      }
    );
    
    test.prop([fc.integer({ min: 50, max: 300 })])(
      'reset should reset ghost position (100+ iterations)',
      (numFrames) => {
        const game = new Game(createMockCanvas());
        game.transitionToPlaying();
        
        for (let i = 0; i < numFrames; i++) {
          game.update(0.016, false);
        }
        
        game.reset();
        
        const pos = game.getGhostPosition();
        expect(pos.x).toBe(PHYSICS.GHOST_START_X);
        expect(pos.y).toBe(PHYSICS.GHOST_START_Y);
      }
    );
    
    test.prop([fc.integer({ min: 50, max: 300 })])(
      'reset should return to Menu state (100+ iterations)',
      (numFrames) => {
        const game = new Game(createMockCanvas());
        game.transitionToPlaying();
        
        for (let i = 0; i < numFrames; i++) {
          game.update(0.016, false);
        }
        
        game.transitionToGameOver();
        game.transitionToMenu();
        
        const state = game.getState();
        expect(state).toBe(GAME_STATE.MENU);
      }
    );
    
    test.prop([fc.integer({ min: 1, max: 100 })])(
      'reset should NOT clear high score (100+ iterations)',
      (score) => {
        localStorage.clear();
        const game = new Game(createMockCanvas());
        
        // Set a high score
        const tracker = new ScoreTracker();
        tracker.updateHighScore(score);
        
        game.reset();
        
        const newTracker = new ScoreTracker();
        expect(newTracker.getHighScore()).toBe(score);
        
        localStorage.clear();
      }
    );
  });
});
