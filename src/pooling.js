/**
 * Object Pooling System
 * 
 * Implements object pooling to minimize garbage collection and improve performance.
 * Provides pools for audio sources and visual effects to avoid creating/destroying
 * objects in the game loop.
 */

/**
 * Generic Object Pool
 * Manages a pool of reusable objects to minimize allocations
 */
export class ObjectPool {
  /**
   * Create a new ObjectPool
   * @param {Function} createFn - Function to create new objects
   * @param {Function} resetFn - Function to reset objects for reuse
   * @param {number} initialSize - Initial pool size
   * @param {number} maxSize - Maximum pool size
   */
  constructor(createFn, resetFn, initialSize = 10, maxSize = 50) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
    this.pool = [];
    this.active = [];
    
    // Pre-allocate initial objects
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }
  
  /**
   * Get an object from the pool
   * @returns {Object} Pooled object
   */
  acquire() {
    let obj;
    
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      // Create new object if pool is empty
      obj = this.createFn();
    }
    
    this.active.push(obj);
    return obj;
  }
  
  /**
   * Return an object to the pool
   * @param {Object} obj - Object to return
   */
  release(obj) {
    const index = this.active.indexOf(obj);
    if (index > -1) {
      this.active.splice(index, 1);
    }
    
    // Reset object state
    this.resetFn(obj);
    
    // Only return to pool if under max size
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    }
  }
  
  /**
   * Release all active objects
   */
  releaseAll() {
    while (this.active.length > 0) {
      this.release(this.active[0]);
    }
  }
  
  /**
   * Get number of active objects
   * @returns {number} Active object count
   */
  getActiveCount() {
    return this.active.length;
  }
  
  /**
   * Get number of pooled objects
   * @returns {number} Pooled object count
   */
  getPooledCount() {
    return this.pool.length;
  }
}

/**
 * Audio Source Pool
 * Manages Web Audio API buffer sources for efficient audio playback
 */
export class AudioSourcePool {
  /**
   * Create a new AudioSourcePool
   * @param {AudioContext} audioContext - Web Audio API context
   * @param {number} maxSources - Maximum concurrent audio sources
   */
  constructor(audioContext, maxSources = 8) {
    this.audioContext = audioContext;
    this.maxSources = maxSources;
    this.activeSources = [];
  }
  
  /**
   * Play a sound using pooled audio sources
   * @param {AudioBuffer} audioBuffer - Audio buffer to play
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  playSound(audioBuffer, volume = 1.0) {
    // Remove finished sources
    this.activeSources = this.activeSources.filter(source => {
      return source.playbackState !== 'finished';
    });
    
    // Limit concurrent sounds
    if (this.activeSources.length >= this.maxSources) {
      // Stop oldest source
      const oldest = this.activeSources.shift();
      try {
        oldest.stop();
      } catch (e) {
        // Source may already be stopped
      }
    }
    
    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = audioBuffer;
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Remove from active list when finished
      source.onended = () => {
        const index = this.activeSources.indexOf(source);
        if (index > -1) {
          this.activeSources.splice(index, 1);
        }
      };
      
      source.start(0);
      this.activeSources.push(source);
    } catch (error) {
      console.error('AudioSourcePool: Failed to play sound:', error);
    }
  }
  
  /**
   * Stop all active sounds
   */
  stopAll() {
    for (const source of this.activeSources) {
      try {
        source.stop();
      } catch (e) {
        // Source may already be stopped
      }
    }
    this.activeSources = [];
  }
  
  /**
   * Get number of active audio sources
   * @returns {number} Active source count
   */
  getActiveCount() {
    return this.activeSources.length;
  }
}

/**
 * Visual Effect Pool
 * Manages visual effects (particles, feedback text, etc.) for efficient rendering
 */
export class EffectPool {
  /**
   * Create a new EffectPool
   * @param {number} maxEffects - Maximum concurrent effects
   */
  constructor(maxEffects = 16) {
    this.maxEffects = maxEffects;
    this.activeEffects = [];
  }
  
  /**
   * Add an effect to the pool
   * @param {Object} effect - Effect object with update() and draw() methods
   */
  addEffect(effect) {
    // Remove oldest effect if at max capacity
    if (this.activeEffects.length >= this.maxEffects) {
      this.activeEffects.shift();
    }
    
    this.activeEffects.push(effect);
  }
  
  /**
   * Update all active effects
   * @param {number} deltaTime - Time elapsed since last frame (ms)
   */
  update(deltaTime) {
    // Update effects and remove inactive ones
    this.activeEffects = this.activeEffects.filter(effect => {
      effect.update(deltaTime);
      return effect.active;
    });
  }
  
  /**
   * Draw all active effects
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  draw(ctx) {
    for (const effect of this.activeEffects) {
      effect.draw(ctx);
    }
  }
  
  /**
   * Clear all effects
   */
  clear() {
    this.activeEffects = [];
  }
  
  /**
   * Get number of active effects
   * @returns {number} Active effect count
   */
  getActiveCount() {
    return this.activeEffects.length;
  }
}
