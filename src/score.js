/**
 * Score Tracker
 * 
 * Tracks current score and manages high score persistence.
 * Increments score when ghost passes through pipes and persists
 * high score to localStorage.
 */

import { STORAGE, GHOST } from './constants.js';

export class ScoreTracker {
  constructor() {
    this.currentScore = 0;
    this.highScore = 0;
    
    // Load high score from localStorage
    this.loadHighScore();
  }
  
  /**
   * Update score tracking based on ghost position and pipes
   * Checks if ghost has passed through any pipes and increments score
   * @param {Object} ghostPos - Ghost position {x, y}
   * @param {Array} pipes - Array of pipe objects
   */
  update(ghostPos, pipes) {
    // Check each pipe to see if ghost has passed through it
    for (const pipe of pipes) {
      // Check if ghost has passed the pipe (ghost.x > pipe.x + pipe.width)
      // and the pipe hasn't been scored yet
      if (!pipe.scored && ghostPos.x > pipe.x + pipe.width) {
        // Mark pipe as scored to prevent double-scoring
        pipe.scored = true;
        
        // Increment score
        this.currentScore++;
      }
    }
  }
  
  /**
   * Get current score
   * @returns {number} Current score
   */
  getCurrentScore() {
    return this.currentScore;
  }
  
  /**
   * Get high score
   * @returns {number} High score
   */
  getHighScore() {
    return this.highScore;
  }
  
  /**
   * Update high score if current score exceeds it
   * Saves to localStorage if updated
   * @param {number} score - Score to compare with high score
   */
  updateHighScore(score) {
    if (score > this.highScore) {
      this.highScore = score;
      this.saveHighScore();
    }
  }
  
  /**
   * Reset current score to 0
   * Does not reset high score
   */
  reset() {
    this.currentScore = 0;
  }
  
  /**
   * Load high score from localStorage
   * Initializes to 0 if not found or if localStorage unavailable
   */
  loadHighScore() {
    try {
      const stored = localStorage.getItem(STORAGE.HIGH_SCORE);
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          this.highScore = parsed;
        } else {
          this.highScore = 0;
        }
      } else {
        this.highScore = 0;
      }
    } catch (error) {
      console.warn('Failed to load high score from localStorage:', error);
      this.highScore = 0;
    }
  }
  
  /**
   * Save high score to localStorage
   * Handles localStorage unavailability gracefully
   */
  saveHighScore() {
    try {
      localStorage.setItem(STORAGE.HIGH_SCORE, this.highScore.toString());
    } catch (error) {
      console.warn('Failed to save high score to localStorage:', error);
    }
  }
}
