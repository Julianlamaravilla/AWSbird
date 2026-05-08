/**
 * Renderer
 * 
 * Handles all canvas rendering for game objects and UI.
 * Draws background, pipes, ghost, score, menu, and game over screens.
 */

import { SCREEN, COLORS, GHOST, GAME_STATE } from './constants.js';
import { AssetLoader } from './assets.js';

export class Renderer {
  /**
   * Create a new Renderer
   * @param {HTMLCanvasElement} canvas - The canvas element to render to
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for performance
    
    // Set canvas dimensions
    this.canvas.width = SCREEN.WIDTH;
    this.canvas.height = SCREEN.HEIGHT;
    
    // Disable image smoothing for pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
    
    // Cache frequently used values to minimize property access
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
    
    // Pre-calculate common positions for UI elements
    this.centerX = this.canvasWidth / 2;
    this.centerY = this.canvasHeight / 2;
    
    console.log('Renderer: Initialized with canvas dimensions', SCREEN.WIDTH, 'x', SCREEN.HEIGHT);
  }
  
  /**
   * Render the entire game frame
   * @param {string} gameState - Current game state (Menu, Playing, GameOver)
   * @param {Object} ghostPos - Ghost position {x, y}
   * @param {Array} pipes - Array of pipe objects
   * @param {number} score - Current score
   * @param {number} highScore - High score
   */
  render(gameState, ghostPos, pipes, score, highScore) {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background (always)
    this.drawBackground();
    
    // Draw game objects based on state
    if (gameState === GAME_STATE.PLAYING) {
      // Playing state: draw pipes, ghost, and score
      this.drawPipes(pipes);
      this.drawGhost(ghostPos);
      this.drawScore(score);
    } else if (gameState === GAME_STATE.MENU) {
      // Menu state: draw menu screen
      this.drawMenu(highScore);
    } else if (gameState === GAME_STATE.GAME_OVER) {
      // Game over state: draw pipes, ghost, and game over screen
      this.drawPipes(pipes);
      this.drawGhost(ghostPos);
      this.drawGameOver(score, highScore);
    }
  }
  
  /**
   * Draw light blue background
   */
  drawBackground() {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  /**
   * Draw ghost sprite at position
   * @param {Object} pos - Ghost position {x, y}
   */
  drawGhost(pos) {
    const ghostSprite = AssetLoader.getAsset('ghostSprite');
    
    if (!ghostSprite) {
      // Fallback: draw white rectangle if sprite not loaded
      this.ctx.fillStyle = COLORS.GHOST;
      this.ctx.fillRect(
        pos.x - GHOST.WIDTH / 2,
        pos.y - GHOST.HEIGHT / 2,
        GHOST.WIDTH,
        GHOST.HEIGHT
      );
      return;
    }
    
    // Draw ghost sprite centered on position
    this.ctx.drawImage(
      ghostSprite,
      pos.x - GHOST.WIDTH / 2,
      pos.y - GHOST.HEIGHT / 2,
      GHOST.WIDTH,
      GHOST.HEIGHT
    );
  }
  
  /**
   * Draw all pipes in green with batched rendering
   * @param {Array} pipes - Array of pipe objects
   */
  drawPipes(pipes) {
    if (pipes.length === 0) return;
    
    // Batch pipe rendering to minimize context state changes
    this.ctx.fillStyle = COLORS.PIPE;
    
    // Draw all pipe sections in one batch
    for (const pipe of pipes) {
      // Draw top pipe section
      this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.topY);
      
      // Draw bottom pipe section
      const bottomY = pipe.gapY + pipe.gapSize;
      const bottomHeight = this.canvasHeight - bottomY;
      this.ctx.fillRect(pipe.x, bottomY, pipe.width, bottomHeight);
    }
    
    // Draw pipe caps in a second batch
    this.ctx.fillStyle = COLORS.PIPE_ACCENT;
    
    const capHeight = 8;
    const capOverhang = 4;
    
    for (const pipe of pipes) {
      // Top pipe cap
      this.ctx.fillRect(
        pipe.x - capOverhang,
        pipe.topY - capHeight,
        pipe.width + capOverhang * 2,
        capHeight
      );
      
      // Bottom pipe cap
      const bottomY = pipe.gapY + pipe.gapSize;
      this.ctx.fillRect(
        pipe.x - capOverhang,
        bottomY,
        pipe.width + capOverhang * 2,
        capHeight
      );
    }
  }
  
  /**
   * Draw current score during gameplay
   * @param {number} score - Current score
   */
  drawScore(score) {
    // Cache text to avoid repeated string conversion
    const scoreText = score.toString();
    
    this.ctx.save();
    
    // Draw text shadow for readability
    this.ctx.fillStyle = COLORS.TEXT_SHADOW;
    this.ctx.font = 'bold 32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(scoreText, this.centerX + 2, 22);
    
    // Draw score text
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.fillText(scoreText, this.centerX, 20);
    
    this.ctx.restore();
  }
  
  /**
   * Draw menu screen with title and start button
   * @param {number} highScore - High score to display
   */
  drawMenu(highScore) {
    this.ctx.save();
    
    // Cache text to avoid repeated string conversion
    const highScoreText = `High Score: ${highScore}`;
    
    // Draw title
    this.ctx.fillStyle = COLORS.TEXT_SHADOW;
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('Flappy Kiro', this.centerX + 3, this.centerY - 97);
    
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.fillText('Flappy Kiro', this.centerX, this.centerY - 100);
    
    // Draw "Start Game" button
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = this.centerX - buttonWidth / 2;
    const buttonY = this.centerY - buttonHeight / 2;
    
    // Button background
    this.ctx.fillStyle = COLORS.BUTTON_NORMAL;
    this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Button border
    this.ctx.strokeStyle = COLORS.BUTTON_BORDER;
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Button text
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText('Start Game', this.centerX, this.centerY);
    
    // Draw high score
    this.ctx.fillStyle = COLORS.TEXT_SHADOW;
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText(highScoreText, this.centerX + 2, this.centerY + 72);
    
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.fillText(highScoreText, this.centerX, this.centerY + 70);
    
    this.ctx.restore();
  }
  
  /**
   * Draw game over screen with scores and restart button
   * @param {number} score - Final score
   * @param {number} highScore - High score
   */
  drawGameOver(score, highScore) {
    this.ctx.save();
    
    // Cache text to avoid repeated string conversion
    const scoreText = `Score: ${score}`;
    const highScoreText = `High Score: ${highScore}`;
    
    // Draw semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Draw "Game Over" text
    this.ctx.fillStyle = COLORS.TEXT_SHADOW;
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('Game Over', this.centerX + 3, this.centerY - 97);
    
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.fillText('Game Over', this.centerX, this.centerY - 100);
    
    // Draw final score
    this.ctx.fillStyle = COLORS.TEXT_SHADOW;
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText(scoreText, this.centerX + 2, this.centerY - 32);
    
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.fillText(scoreText, this.centerX, this.centerY - 35);
    
    // Draw high score
    this.ctx.fillStyle = COLORS.TEXT_SHADOW;
    this.ctx.fillText(highScoreText, this.centerX + 2, this.centerY + 8);
    
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.fillText(highScoreText, this.centerX, this.centerY + 5);
    
    // Draw "Restart" button
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = this.centerX - buttonWidth / 2;
    const buttonY = this.centerY + 50;
    
    // Button background
    this.ctx.fillStyle = COLORS.BUTTON_NORMAL;
    this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Button border
    this.ctx.strokeStyle = COLORS.BUTTON_BORDER;
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Button text
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText('Restart', this.centerX, buttonY + buttonHeight / 2);
    
    this.ctx.restore();
  }
}
