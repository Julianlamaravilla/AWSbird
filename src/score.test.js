/**
 * Score Tracker Tests
 * 
 * Tests for score tracking, high score persistence, and correctness properties.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ScoreTracker } from './score.js';
import { STORAGE } from './constants.js';

describe('ScoreTracker', () => {
  let scoreTracker;
  let originalLocalStorage;
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    scoreTracker = new ScoreTracker();
  });
  
  afterEach(() => {
    localStorage.clear();
  });
  
  describe('Initialization', () => {
    it('should initialize with score 0', () => {
      expect(scoreTracker.getCurrentScore()).toBe(0);
    });
    
    it('should initialize with high score 0 if no stored value', () => {
      expect(scoreTracker.getHighScore()).toBe(0);
    });
    
    it('should load high score from localStorage if available', () => {
      localStorage.setItem(STORAGE.HIGH_SCORE, '42');
      const tracker = new ScoreTracker();
      expect(tracker.getHighScore()).toBe(42);
    });
    
    it('should handle invalid localStorage values gracefully', () => {
      localStorage.setItem(STORAGE.HIGH_SCORE, 'invalid');
      const tracker = new ScoreTracker();
      expect(tracker.getHighScore()).toBe(0);
    });
    
    it('should handle negative localStorage values gracefully', () => {
      localStorage.setItem(STORAGE.HIGH_SCORE, '-5');
      const tracker = new ScoreTracker();
      expect(tracker.getHighScore()).toBe(0);
    });
  });
  
  describe('Score Tracking', () => {
    it('should increment score when ghost passes a pipe', () => {
      const ghostPos = { x: 200, y: 300 };
      const pipes = [
        { x: 100, width: 80, scored: false }
      ];
      
      scoreTracker.update(ghostPos, pipes);
      
      expect(scoreTracker.getCurrentScore()).toBe(1);
      expect(pipes[0].scored).toBe(true);
    });
    
    it('should not increment score if ghost has not passed pipe', () => {
      const ghostPos = { x: 150, y: 300 };
      const pipes = [
        { x: 200, width: 80, scored: false }
      ];
      
      scoreTracker.update(ghostPos, pipes);
      
      expect(scoreTracker.getCurrentScore()).toBe(0);
      expect(pipes[0].scored).toBe(false);
    });
    
    it('should not increment score if pipe already scored', () => {
      const ghostPos = { x: 200, y: 300 };
      const pipes = [
        { x: 100, width: 80, scored: true }
      ];
      
      scoreTracker.update(ghostPos, pipes);
      
      expect(scoreTracker.getCurrentScore()).toBe(0);
    });
    
    it('should handle multiple pipes correctly', () => {
      const ghostPos = { x: 400, y: 300 };
      const pipes = [
        { x: 100, width: 80, scored: false },
        { x: 300, width: 80, scored: false },
        { x: 500, width: 80, scored: false }
      ];
      
      scoreTracker.update(ghostPos, pipes);
      
      expect(scoreTracker.getCurrentScore()).toBe(2);
      expect(pipes[0].scored).toBe(true);
      expect(pipes[1].scored).toBe(true);
      expect(pipes[2].scored).toBe(false);
    });
    
    it('should increment score exactly once per pipe across multiple updates', () => {
      const pipes = [
        { x: 100, width: 80, scored: false }
      ];
      
      // Ghost approaches pipe
      scoreTracker.update({ x: 150, y: 300 }, pipes);
      expect(scoreTracker.getCurrentScore()).toBe(0);
      
      // Ghost passes pipe
      scoreTracker.update({ x: 185, y: 300 }, pipes);
      expect(scoreTracker.getCurrentScore()).toBe(1);
      
      // Ghost continues past pipe
      scoreTracker.update({ x: 200, y: 300 }, pipes);
      expect(scoreTracker.getCurrentScore()).toBe(1);
      
      // Ghost far past pipe
      scoreTracker.update({ x: 300, y: 300 }, pipes);
      expect(scoreTracker.getCurrentScore()).toBe(1);
    });
  });
  
  describe('High Score Management', () => {
    it('should update high score when current score exceeds it', () => {
      scoreTracker.updateHighScore(10);
      expect(scoreTracker.getHighScore()).toBe(10);
    });
    
    it('should not update high score when current score is lower', () => {
      scoreTracker.updateHighScore(10);
      scoreTracker.updateHighScore(5);
      expect(scoreTracker.getHighScore()).toBe(10);
    });
    
    it('should not update high score when current score equals it', () => {
      scoreTracker.updateHighScore(10);
      scoreTracker.updateHighScore(10);
      expect(scoreTracker.getHighScore()).toBe(10);
    });
    
    it('should save high score to localStorage when updated', () => {
      scoreTracker.updateHighScore(42);
      expect(localStorage.getItem(STORAGE.HIGH_SCORE)).toBe('42');
    });
    
    it('should persist high score across instances', () => {
      scoreTracker.updateHighScore(25);
      
      const newTracker = new ScoreTracker();
      expect(newTracker.getHighScore()).toBe(25);
    });
  });
  
  describe('Reset', () => {
    it('should reset current score to 0', () => {
      const ghostPos = { x: 200, y: 300 };
      const pipes = [
        { x: 100, width: 80, scored: false }
      ];
      
      scoreTracker.update(ghostPos, pipes);
      expect(scoreTracker.getCurrentScore()).toBe(1);
      
      scoreTracker.reset();
      expect(scoreTracker.getCurrentScore()).toBe(0);
    });
    
    it('should not reset high score', () => {
      scoreTracker.updateHighScore(15);
      scoreTracker.reset();
      expect(scoreTracker.getHighScore()).toBe(15);
    });
  });
  
  describe('LocalStorage Error Handling', () => {
    it('should handle localStorage unavailability on load', () => {
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = () => {
        throw new Error('localStorage unavailable');
      };
      
      const tracker = new ScoreTracker();
      expect(tracker.getHighScore()).toBe(0);
      
      Storage.prototype.getItem = originalGetItem;
    });
    
    it('should handle localStorage unavailability on save', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error('localStorage unavailable');
      };
      
      // Should not throw error
      expect(() => {
        scoreTracker.updateHighScore(10);
      }).not.toThrow();
      
      Storage.prototype.setItem = originalSetItem;
    });
  });
  
  describe('Property 7: Score Increments Once Per Pipe', () => {
    /**
     * **Validates: Requirements 8.1, 8.4**
     * 
     * Property: For any pipe, the score should increment at most once
     * when the ghost passes through the gap.
     * 
     * This property verifies that:
     * 1. Score increments exactly once when ghost passes a pipe
     * 2. Score does not increment multiple times for the same pipe
     * 3. The scored flag prevents double-scoring
     */
    it('should increment score exactly once per pipe regardless of update frequency', () => {
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        const tracker = new ScoreTracker();
        const pipe = {
          x: 100,
          width: 80,
          scored: false
        };
        
        // Simulate ghost passing through pipe with multiple updates
        const updateCount = Math.floor(Math.random() * 20) + 10; // 10-29 updates (ensures ghost passes pipe)
        let scoreIncrements = 0;
        
        for (let j = 0; j < updateCount; j++) {
          const ghostX = 100 + (j * 10); // Ghost moves rightward
          const prevScore = tracker.getCurrentScore();
          
          tracker.update({ x: ghostX, y: 300 }, [pipe]);
          
          const newScore = tracker.getCurrentScore();
          if (newScore > prevScore) {
            scoreIncrements++;
          }
        }
        
        // Score should increment exactly once
        expect(scoreIncrements).toBe(1);
        expect(tracker.getCurrentScore()).toBe(1);
        expect(pipe.scored).toBe(true);
      }
    });
    
    it('should increment score once per pipe for multiple pipes', () => {
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        const tracker = new ScoreTracker();
        const pipeCount = Math.floor(Math.random() * 10) + 1; // 1-10 pipes
        const pipes = [];
        
        for (let j = 0; j < pipeCount; j++) {
          pipes.push({
            x: j * 200,
            width: 80,
            scored: false
          });
        }
        
        // Simulate ghost passing all pipes
        const ghostX = pipeCount * 200 + 100;
        tracker.update({ x: ghostX, y: 300 }, pipes);
        
        // Score should equal number of pipes
        expect(tracker.getCurrentScore()).toBe(pipeCount);
        
        // All pipes should be marked as scored
        for (const pipe of pipes) {
          expect(pipe.scored).toBe(true);
        }
        
        // Additional updates should not change score
        tracker.update({ x: ghostX + 100, y: 300 }, pipes);
        expect(tracker.getCurrentScore()).toBe(pipeCount);
      }
    });
    
    it('should not increment score if ghost has not passed pipe', () => {
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        const tracker = new ScoreTracker();
        const pipeX = Math.random() * 500 + 100; // Random pipe position
        const pipeWidth = 80;
        const ghostX = Math.random() * pipeX; // Ghost before pipe
        
        const pipe = {
          x: pipeX,
          width: pipeWidth,
          scored: false
        };
        
        tracker.update({ x: ghostX, y: 300 }, [pipe]);
        
        // Score should not increment
        expect(tracker.getCurrentScore()).toBe(0);
        expect(pipe.scored).toBe(false);
      }
    });
  });
  
  describe('Property 8: High Score Update Logic', () => {
    /**
     * **Validates: Requirements 12.1**
     * 
     * Property: For any score that exceeds the current high score,
     * the high score should be updated to that score.
     * 
     * This property verifies that:
     * 1. High score updates when new score exceeds it
     * 2. High score does not update when new score is lower or equal
     * 3. High score persists to localStorage
     */
    it('should update high score when score exceeds current high score', () => {
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        localStorage.clear();
        const tracker = new ScoreTracker();
        
        // Generate random scores in ascending order
        const scores = [];
        for (let j = 0; j < 5; j++) {
          scores.push(Math.floor(Math.random() * 100) + j * 20);
        }
        scores.sort((a, b) => a - b);
        
        // Update high score with each score
        for (const score of scores) {
          tracker.updateHighScore(score);
          
          // High score should be the maximum score seen so far
          expect(tracker.getHighScore()).toBe(Math.max(...scores.slice(0, scores.indexOf(score) + 1)));
        }
        
        // Final high score should be the maximum
        expect(tracker.getHighScore()).toBe(Math.max(...scores));
      }
    });
    
    it('should not update high score when score is lower or equal', () => {
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        localStorage.clear();
        const tracker = new ScoreTracker();
        
        const highScore = Math.floor(Math.random() * 100) + 50;
        tracker.updateHighScore(highScore);
        
        // Try to update with lower scores
        for (let j = 0; j < 10; j++) {
          const lowerScore = Math.floor(Math.random() * highScore);
          tracker.updateHighScore(lowerScore);
          
          // High score should remain unchanged
          expect(tracker.getHighScore()).toBe(highScore);
        }
        
        // Try to update with equal score
        tracker.updateHighScore(highScore);
        expect(tracker.getHighScore()).toBe(highScore);
      }
    });
    
    it('should persist high score to localStorage', () => {
      const iterations = 50;
      
      for (let i = 0; i < iterations; i++) {
        localStorage.clear();
        const tracker = new ScoreTracker();
        
        const score = Math.floor(Math.random() * 200) + 1;
        tracker.updateHighScore(score);
        
        // Verify localStorage contains the score
        const stored = localStorage.getItem(STORAGE.HIGH_SCORE);
        expect(stored).toBe(score.toString());
        
        // Verify new instance loads the score
        const newTracker = new ScoreTracker();
        expect(newTracker.getHighScore()).toBe(score);
      }
    });
    
    it('should maintain high score across multiple updates', () => {
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        localStorage.clear();
        const tracker = new ScoreTracker();
        
        let maxScore = 0;
        const updateCount = Math.floor(Math.random() * 20) + 5;
        
        for (let j = 0; j < updateCount; j++) {
          const score = Math.floor(Math.random() * 100);
          tracker.updateHighScore(score);
          maxScore = Math.max(maxScore, score);
          
          // High score should always be the maximum
          expect(tracker.getHighScore()).toBe(maxScore);
        }
      }
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle ghost exactly at pipe boundary', () => {
      const pipe = { x: 100, width: 80, scored: false };
      
      // Ghost exactly at pipe.x + pipe.width
      scoreTracker.update({ x: 180, y: 300 }, [pipe]);
      expect(scoreTracker.getCurrentScore()).toBe(0);
      expect(pipe.scored).toBe(false);
      
      // Ghost just past boundary
      scoreTracker.update({ x: 181, y: 300 }, [pipe]);
      expect(scoreTracker.getCurrentScore()).toBe(1);
      expect(pipe.scored).toBe(true);
    });
    
    it('should handle empty pipes array', () => {
      expect(() => {
        scoreTracker.update({ x: 100, y: 300 }, []);
      }).not.toThrow();
      expect(scoreTracker.getCurrentScore()).toBe(0);
    });
    
    it('should handle score of 0', () => {
      scoreTracker.updateHighScore(0);
      expect(scoreTracker.getHighScore()).toBe(0);
    });
    
    it('should handle very large scores', () => {
      const largeScore = 999999;
      scoreTracker.updateHighScore(largeScore);
      expect(scoreTracker.getHighScore()).toBe(largeScore);
      
      const newTracker = new ScoreTracker();
      expect(newTracker.getHighScore()).toBe(largeScore);
    });
  });
});
