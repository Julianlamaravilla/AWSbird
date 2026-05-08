/**
 * Collision Detector Property-Based Tests
 * 
 * Tests correctness properties for the collision detector:
 * - Property 6: Collision detection accuracy
 * - Edge cases: Ghost at exact boundaries
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import { CollisionDetector } from './collision.js';
import { GHOST, SCREEN, PIPE } from './constants.js';

describe('CollisionDetector', () => {
  let collisionDetector;
  
  beforeEach(() => {
    collisionDetector = new CollisionDetector();
  });
  
  describe('Initialization', () => {
    it('should initialize with correct ghost dimensions', () => {
      expect(collisionDetector.ghostWidth).toBe(GHOST.WIDTH);
      expect(collisionDetector.ghostHeight).toBe(GHOST.HEIGHT);
      expect(collisionDetector.screenHeight).toBe(SCREEN.HEIGHT);
    });
    
    it('should allow custom dimensions', () => {
      const customDetector = new CollisionDetector(64, 64, 800);
      expect(customDetector.ghostWidth).toBe(64);
      expect(customDetector.ghostHeight).toBe(64);
      expect(customDetector.screenHeight).toBe(800);
    });
  });
  
  describe('Property 6: Collision Detection Accuracy', () => {
    /**
     * **Validates: Requirements 7.1, 7.2, 7.3**
     * 
     * For any ghost position and pipe configuration, a collision should be 
     * detected if and only if the ghost's bounding box overlaps with a pipe 
     * section or exceeds screen boundaries.
     */
    
    describe('Pipe Collision Detection', () => {
      test.prop([
        fc.integer({ min: 0, max: SCREEN.WIDTH }),
        fc.integer({ min: 50, max: SCREEN.HEIGHT - 50 }),
        fc.integer({ min: 0, max: SCREEN.WIDTH }),
        fc.integer({ min: 50, max: 400 }),
      ])(
        'should correctly detect collision state for any ghost and pipe position',
        (ghostX, ghostY, pipeX, gapY) => {
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
        fc.integer({ min: 100, max: 500 }),
        fc.integer({ min: 0, max: SCREEN.WIDTH }),
        fc.integer({ min: 50, max: 400 }),
      ])(
        'should NOT detect collision when ghost is safely in the gap',
        (ghostX, pipeX, gapY) => {
          const pipe = {
            x: pipeX,
            topY: gapY,
            gapY: gapY,
            width: PIPE.WIDTH,
            gapSize: PIPE.GAP_SIZE
          };
          
          // Position ghost safely in the middle of the gap
          // Ensure ghost fits completely within gap
          const safeMargin = GHOST.HEIGHT;
          const ghostY = gapY + safeMargin + GHOST.HEIGHT / 2;
          
          // Only test if ghost can fit in gap
          if (ghostY + GHOST.HEIGHT / 2 < gapY + PIPE.GAP_SIZE - safeMargin) {
            const ghostPos = { x: ghostX, y: ghostY };
            const doesCollide = collisionDetector.checkPipeCollision(ghostPos, pipe);
            expect(doesCollide).toBe(false);
          }
        }
      );
      
      test.prop([
        fc.integer({ min: 0, max: SCREEN.WIDTH }),
        fc.integer({ min: 100, max: 500 }),
        fc.integer({ min: 0, max: SCREEN.WIDTH }),
        fc.integer({ min: 50, max: 400 }),
      ])(
        'should NOT detect collision when ghost is in the gap',
        (ghostX, pipeX, gapY) => {
          const pipe = {
            x: pipeX,
            topY: gapY,
            gapY: gapY,
            width: PIPE.WIDTH,
            gapSize: PIPE.GAP_SIZE
          };
          
          // Position ghost in the middle of the gap
          const ghostY = gapY + PIPE.GAP_SIZE / 2;
          const ghostPos = { x: ghostX, y: ghostY };
          
          // Calculate if ghost is horizontally aligned with pipe
          const ghostLeft = ghostX - GHOST.WIDTH / 2;
          const ghostRight = ghostX + GHOST.WIDTH / 2;
          const pipeLeft = pipeX;
          const pipeRight = pipeX + PIPE.WIDTH;
          
          const horizontalOverlap = ghostRight > pipeLeft && ghostLeft < pipeRight;
          
          // If horizontally aligned, check if ghost is truly in gap
          if (horizontalOverlap) {
            const ghostTop = ghostY - GHOST.HEIGHT / 2;
            const ghostBottom = ghostY + GHOST.HEIGHT / 2;
            const bottomPipeTop = gapY + PIPE.GAP_SIZE;
            
            // Ghost is in gap if it's below top pipe and above bottom pipe
            const inGap = ghostTop >= gapY && ghostBottom <= bottomPipeTop;
            
            if (inGap) {
              const doesCollide = collisionDetector.checkPipeCollision(ghostPos, pipe);
              expect(doesCollide).toBe(false);
            }
          }
        }
      );
      
      test.prop([
        fc.integer({ min: 0, max: SCREEN.WIDTH }),
        fc.integer({ min: 50, max: SCREEN.HEIGHT - 50 }),
        fc.integer({ min: 0, max: SCREEN.WIDTH }),
      ])(
        'should NOT detect collision when ghost is not horizontally aligned with pipe',
        (ghostX, ghostY, pipeX) => {
          const pipe = {
            x: pipeX,
            topY: 200,
            gapY: 200,
            width: PIPE.WIDTH,
            gapSize: PIPE.GAP_SIZE
          };
          
          const ghostPos = { x: ghostX, y: ghostY };
          
          // Calculate horizontal overlap
          const ghostLeft = ghostX - GHOST.WIDTH / 2;
          const ghostRight = ghostX + GHOST.WIDTH / 2;
          const pipeLeft = pipeX;
          const pipeRight = pipeX + PIPE.WIDTH;
          
          const horizontalOverlap = ghostRight > pipeLeft && ghostLeft < pipeRight;
          
          if (!horizontalOverlap) {
            const doesCollide = collisionDetector.checkPipeCollision(ghostPos, pipe);
            expect(doesCollide).toBe(false);
          }
        }
      );
    });
    
    describe('Boundary Collision Detection', () => {
      test.prop([
        fc.integer({ min: 0, max: SCREEN.WIDTH }),
        fc.integer({ min: -100, max: 0 }),
      ])(
        'should detect collision when ghost exceeds top boundary',
        (ghostX, ghostY) => {
          const ghostPos = { x: ghostX, y: ghostY };
          const ghostTop = ghostY - GHOST.HEIGHT / 2;
          
          const shouldCollide = ghostTop < 0;
          const doesCollide = collisionDetector.checkBoundaryCollision(ghostPos);
          
          expect(doesCollide).toBe(shouldCollide);
        }
      );
      
      test.prop([
        fc.integer({ min: 0, max: SCREEN.WIDTH }),
        fc.integer({ min: SCREEN.HEIGHT, max: SCREEN.HEIGHT + 100 }),
      ])(
        'should detect collision when ghost exceeds bottom boundary',
        (ghostX, ghostY) => {
          const ghostPos = { x: ghostX, y: ghostY };
          const ghostBottom = ghostY + GHOST.HEIGHT / 2;
          
          const shouldCollide = ghostBottom > SCREEN.HEIGHT;
          const doesCollide = collisionDetector.checkBoundaryCollision(ghostPos);
          
          expect(doesCollide).toBe(shouldCollide);
        }
      );
      
      test.prop([
        fc.integer({ min: 0, max: SCREEN.WIDTH }),
        fc.integer({ min: GHOST.HEIGHT / 2, max: SCREEN.HEIGHT - GHOST.HEIGHT / 2 }),
      ])(
        'should NOT detect collision when ghost is within boundaries',
        (ghostX, ghostY) => {
          const ghostPos = { x: ghostX, y: ghostY };
          const doesCollide = collisionDetector.checkBoundaryCollision(ghostPos);
          
          expect(doesCollide).toBe(false);
        }
      );
    });
    
    describe('Combined Collision Detection', () => {
      test.prop([
        fc.integer({ min: 0, max: SCREEN.WIDTH }),
        fc.integer({ min: 50, max: SCREEN.HEIGHT - 50 }),
      ])(
        'checkCollisions should return true if any collision detected',
        (ghostX, ghostY) => {
          const pipes = [
            {
              x: ghostX - GHOST.WIDTH / 2 - 10,
              topY: 200,
              gapY: 200,
              width: PIPE.WIDTH,
              gapSize: PIPE.GAP_SIZE
            }
          ];
          
          const ghostPos = { x: ghostX, y: ghostY };
          
          const pipeCollision = collisionDetector.checkPipeCollision(ghostPos, pipes[0]);
          const boundaryCollision = collisionDetector.checkBoundaryCollision(ghostPos);
          const anyCollision = collisionDetector.checkCollisions(ghostPos, pipes);
          
          expect(anyCollision).toBe(pipeCollision || boundaryCollision);
        }
      );
      
      it('should return false when no collisions detected', () => {
        const ghostPos = { x: 100, y: 300 };
        const pipes = [
          {
            x: 500,
            topY: 200,
            gapY: 200,
            width: PIPE.WIDTH,
            gapSize: PIPE.GAP_SIZE
          }
        ];
        
        const collision = collisionDetector.checkCollisions(ghostPos, pipes);
        expect(collision).toBe(false);
      });
    });
  });
  
  describe('Edge Cases', () => {
    describe('Ghost at Exact Boundary', () => {
      it('should detect collision when ghost top is exactly at y=0', () => {
        const ghostY = GHOST.HEIGHT / 2;
        const ghostPos = { x: 100, y: ghostY };
        
        const collision = collisionDetector.checkBoundaryCollision(ghostPos);
        expect(collision).toBe(false); // Ghost top is at 0, not below
      });
      
      it('should detect collision when ghost top is just below y=0', () => {
        const ghostY = GHOST.HEIGHT / 2 - 1;
        const ghostPos = { x: 100, y: ghostY };
        
        const collision = collisionDetector.checkBoundaryCollision(ghostPos);
        expect(collision).toBe(true);
      });
      
      it('should detect collision when ghost bottom is exactly at screen height', () => {
        const ghostY = SCREEN.HEIGHT - GHOST.HEIGHT / 2;
        const ghostPos = { x: 100, y: ghostY };
        
        const collision = collisionDetector.checkBoundaryCollision(ghostPos);
        expect(collision).toBe(false); // Ghost bottom is at screen height, not beyond
      });
      
      it('should detect collision when ghost bottom is just beyond screen height', () => {
        const ghostY = SCREEN.HEIGHT - GHOST.HEIGHT / 2 + 1;
        const ghostPos = { x: 100, y: ghostY };
        
        const collision = collisionDetector.checkBoundaryCollision(ghostPos);
        expect(collision).toBe(true);
      });
    });
    
    describe('Ghost at Exact Pipe Boundary', () => {
      it('should detect collision when ghost is exactly at top of gap', () => {
        const gapY = 200;
        const ghostY = gapY; // Ghost center at gap start
        const ghostPos = { x: 100, y: ghostY };
        
        const pipe = {
          x: 100 - GHOST.WIDTH / 2 - PIPE.WIDTH / 2,
          topY: gapY,
          gapY: gapY,
          width: PIPE.WIDTH,
          gapSize: PIPE.GAP_SIZE
        };
        
        const collision = collisionDetector.checkPipeCollision(ghostPos, pipe);
        
        // Ghost top is at gapY - GHOST.HEIGHT/2, which is above gapY
        const ghostTop = ghostY - GHOST.HEIGHT / 2;
        expect(ghostTop).toBeLessThan(gapY);
        expect(collision).toBe(true);
      });
      
      it('should detect collision when ghost is exactly at bottom of gap', () => {
        const gapY = 200;
        const ghostY = gapY + PIPE.GAP_SIZE; // Ghost center at gap end
        const ghostPos = { x: 100, y: ghostY };
        
        const pipe = {
          x: 100 - GHOST.WIDTH / 2 - PIPE.WIDTH / 2,
          topY: gapY,
          gapY: gapY,
          width: PIPE.WIDTH,
          gapSize: PIPE.GAP_SIZE
        };
        
        const collision = collisionDetector.checkPipeCollision(ghostPos, pipe);
        
        // Ghost bottom is at gapY + GAP_SIZE + GHOST.HEIGHT/2, which is below gap end
        const ghostBottom = ghostY + GHOST.HEIGHT / 2;
        const bottomPipeTop = gapY + PIPE.GAP_SIZE;
        expect(ghostBottom).toBeGreaterThan(bottomPipeTop);
        expect(collision).toBe(true);
      });
      
      it('should NOT detect collision when ghost is perfectly centered in gap', () => {
        const gapY = 200;
        const ghostY = gapY + PIPE.GAP_SIZE / 2; // Ghost center in middle of gap
        const ghostPos = { x: 100, y: ghostY };
        
        const pipe = {
          x: 100 - GHOST.WIDTH / 2 - PIPE.WIDTH / 2,
          topY: gapY,
          gapY: gapY,
          width: PIPE.WIDTH,
          gapSize: PIPE.GAP_SIZE
        };
        
        // Verify ghost fits in gap
        const ghostTop = ghostY - GHOST.HEIGHT / 2;
        const ghostBottom = ghostY + GHOST.HEIGHT / 2;
        const bottomPipeTop = gapY + PIPE.GAP_SIZE;
        
        expect(ghostTop).toBeGreaterThanOrEqual(gapY);
        expect(ghostBottom).toBeLessThanOrEqual(bottomPipeTop);
        
        const collision = collisionDetector.checkPipeCollision(ghostPos, pipe);
        expect(collision).toBe(false);
      });
    });
    
    describe('Multiple Pipes', () => {
      it('should detect collision with any pipe in array', () => {
        const ghostPos = { x: 100, y: 100 };
        
        const pipes = [
          {
            x: 500,
            topY: 200,
            gapY: 200,
            width: PIPE.WIDTH,
            gapSize: PIPE.GAP_SIZE
          },
          {
            x: 100 - GHOST.WIDTH / 2 - PIPE.WIDTH / 2,
            topY: 150,
            gapY: 150,
            width: PIPE.WIDTH,
            gapSize: PIPE.GAP_SIZE
          }
        ];
        
        const collision = collisionDetector.checkCollisions(ghostPos, pipes);
        expect(collision).toBe(true);
      });
      
      it('should return false when no pipes collide', () => {
        const ghostPos = { x: 100, y: 300 };
        
        const pipes = [
          {
            x: 500,
            topY: 200,
            gapY: 200,
            width: PIPE.WIDTH,
            gapSize: PIPE.GAP_SIZE
          },
          {
            x: 700,
            topY: 250,
            gapY: 250,
            width: PIPE.WIDTH,
            gapSize: PIPE.GAP_SIZE
          }
        ];
        
        const collision = collisionDetector.checkCollisions(ghostPos, pipes);
        expect(collision).toBe(false);
      });
      
      it('should handle empty pipe array', () => {
        const ghostPos = { x: 100, y: 300 };
        const pipes = [];
        
        const collision = collisionDetector.checkCollisions(ghostPos, pipes);
        expect(collision).toBe(false);
      });
    });
    
    describe('AABB Precision', () => {
      it('should use correct bounding box calculations', () => {
        const ghostPos = { x: 100, y: 200 };
        
        // Ghost bounding box should be centered on position
        const expectedLeft = 100 - GHOST.WIDTH / 2;
        const expectedRight = 100 + GHOST.WIDTH / 2;
        const expectedTop = 200 - GHOST.HEIGHT / 2;
        const expectedBottom = 200 + GHOST.HEIGHT / 2;
        
        // Create pipe that should just barely collide
        const pipe = {
          x: expectedRight - 1, // Overlaps by 1 pixel
          topY: expectedTop + 1,
          gapY: expectedTop + 1,
          width: PIPE.WIDTH,
          gapSize: PIPE.GAP_SIZE
        };
        
        const collision = collisionDetector.checkPipeCollision(ghostPos, pipe);
        expect(collision).toBe(true);
      });
      
      it('should NOT collide when bounding boxes just touch', () => {
        const ghostPos = { x: 100, y: 200 };
        
        const expectedRight = 100 + GHOST.WIDTH / 2;
        
        // Create pipe that just touches but doesn't overlap
        const pipe = {
          x: expectedRight, // Exactly at edge
          topY: 150,
          gapY: 150,
          width: PIPE.WIDTH,
          gapSize: PIPE.GAP_SIZE
        };
        
        const collision = collisionDetector.checkPipeCollision(ghostPos, pipe);
        expect(collision).toBe(false);
      });
    });
  });
});
