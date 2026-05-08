/**
 * Input System
 * 
 * Handles mouse clicks and touch events for jump input.
 * Registers input immediately (same frame) for minimal latency.
 */

export class InputSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.jumpInputRegistered = false;
    this.initialized = false;
    
    // Bind event handlers to maintain 'this' context
    this.handleClick = this.handleClick.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
  }
  
  /**
   * Initialize input system by attaching event listeners
   */
  init() {
    if (this.initialized) {
      console.warn('InputSystem: Already initialized');
      return;
    }
    
    // Listen for mouse click events
    this.canvas.addEventListener('click', this.handleClick);
    
    // Listen for touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart);
    
    this.initialized = true;
    console.log('InputSystem: Initialized');
  }
  
  /**
   * Handle mouse click events
   * @param {MouseEvent} event - The mouse event
   */
  handleClick(event) {
    event.preventDefault();
    this.jumpInputRegistered = true;
  }
  
  /**
   * Handle touch start events
   * @param {TouchEvent} event - The touch event
   */
  handleTouchStart(event) {
    event.preventDefault();
    this.jumpInputRegistered = true;
  }
  
  /**
   * Check if jump input was registered this frame
   * @returns {boolean} True if jump input was registered
   */
  getJumpInput() {
    return this.jumpInputRegistered;
  }
  
  /**
   * Reset input state (call after processing input)
   */
  reset() {
    this.jumpInputRegistered = false;
  }
  
  /**
   * Clean up event listeners
   */
  destroy() {
    if (!this.initialized) {
      return;
    }
    
    this.canvas.removeEventListener('click', this.handleClick);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    
    this.initialized = false;
    console.log('InputSystem: Destroyed');
  }
}
