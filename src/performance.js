/**
 * Performance Monitoring System
 * 
 * Provides FPS tracking, frame time measurement, and performance profiling
 * to ensure the game maintains 60 FPS target.
 */

/**
 * FPS Counter
 * Tracks frames per second and frame time
 */
export class FPSCounter {
  /**
   * Create a new FPS Counter
   * @param {number} sampleSize - Number of frames to average over
   */
  constructor(sampleSize = 60) {
    this.sampleSize = sampleSize;
    this.frameTimes = [];
    this.lastFrameTime = performance.now();
    this.fps = 60;
    this.avgFrameTime = 16.67;
    this.minFPS = 60;
    this.maxFPS = 60;
  }
  
  /**
   * Update FPS counter (call once per frame)
   */
  update() {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    
    // Add frame time to samples
    this.frameTimes.push(frameTime);
    
    // Keep only recent samples
    if (this.frameTimes.length > this.sampleSize) {
      this.frameTimes.shift();
    }
    
    // Calculate average frame time
    const sum = this.frameTimes.reduce((a, b) => a + b, 0);
    this.avgFrameTime = sum / this.frameTimes.length;
    
    // Calculate FPS
    this.fps = 1000 / this.avgFrameTime;
    
    // Track min/max FPS
    this.minFPS = Math.min(this.minFPS, this.fps);
    this.maxFPS = Math.max(this.maxFPS, this.fps);
  }
  
  /**
   * Get current FPS
   * @returns {number} Current FPS
   */
  getFPS() {
    return Math.round(this.fps);
  }
  
  /**
   * Get average frame time in milliseconds
   * @returns {number} Average frame time
   */
  getAvgFrameTime() {
    return this.avgFrameTime.toFixed(2);
  }
  
  /**
   * Get minimum FPS recorded
   * @returns {number} Minimum FPS
   */
  getMinFPS() {
    return Math.round(this.minFPS);
  }
  
  /**
   * Get maximum FPS recorded
   * @returns {number} Maximum FPS
   */
  getMaxFPS() {
    return Math.round(this.maxFPS);
  }
  
  /**
   * Reset FPS statistics
   */
  reset() {
    this.frameTimes = [];
    this.fps = 60;
    this.avgFrameTime = 16.67;
    this.minFPS = 60;
    this.maxFPS = 60;
  }
  
  /**
   * Check if FPS is below target
   * @param {number} targetFPS - Target FPS (default 60)
   * @returns {boolean} True if below target
   */
  isBelowTarget(targetFPS = 60) {
    return this.fps < targetFPS;
  }
}

/**
 * Performance Profiler
 * Measures execution time of specific code sections
 */
export class PerformanceProfiler {
  constructor() {
    this.measurements = new Map();
    this.activeTimers = new Map();
  }
  
  /**
   * Start timing a section
   * @param {string} label - Section label
   */
  start(label) {
    this.activeTimers.set(label, performance.now());
  }
  
  /**
   * End timing a section
   * @param {string} label - Section label
   */
  end(label) {
    if (!this.activeTimers.has(label)) {
      console.warn(`PerformanceProfiler: No active timer for "${label}"`);
      return;
    }
    
    const startTime = this.activeTimers.get(label);
    const duration = performance.now() - startTime;
    this.activeTimers.delete(label);
    
    // Store measurement
    if (!this.measurements.has(label)) {
      this.measurements.set(label, {
        count: 0,
        total: 0,
        min: Infinity,
        max: 0,
        avg: 0
      });
    }
    
    const stats = this.measurements.get(label);
    stats.count++;
    stats.total += duration;
    stats.min = Math.min(stats.min, duration);
    stats.max = Math.max(stats.max, duration);
    stats.avg = stats.total / stats.count;
  }
  
  /**
   * Get measurements for a section
   * @param {string} label - Section label
   * @returns {Object} Measurement statistics
   */
  getMeasurement(label) {
    return this.measurements.get(label);
  }
  
  /**
   * Get all measurements
   * @returns {Map} All measurements
   */
  getAllMeasurements() {
    return this.measurements;
  }
  
  /**
   * Print measurements to console
   */
  printMeasurements() {
    console.log('=== Performance Profile ===');
    for (const [label, stats] of this.measurements) {
      console.log(`${label}:`);
      console.log(`  Count: ${stats.count}`);
      console.log(`  Avg: ${stats.avg.toFixed(3)}ms`);
      console.log(`  Min: ${stats.min.toFixed(3)}ms`);
      console.log(`  Max: ${stats.max.toFixed(3)}ms`);
    }
  }
  
  /**
   * Reset all measurements
   */
  reset() {
    this.measurements.clear();
    this.activeTimers.clear();
  }
}

/**
 * Memory Monitor
 * Tracks memory usage (if available)
 */
export class MemoryMonitor {
  constructor() {
    this.supported = performance.memory !== undefined;
    this.samples = [];
    this.maxSamples = 100;
  }
  
  /**
   * Check if memory monitoring is supported
   * @returns {boolean} True if supported
   */
  isSupported() {
    return this.supported;
  }
  
  /**
   * Take a memory sample
   */
  sample() {
    if (!this.supported) return;
    
    const memory = {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      timestamp: performance.now()
    };
    
    this.samples.push(memory);
    
    // Keep only recent samples
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }
  
  /**
   * Get current memory usage in MB
   * @returns {Object} Memory usage statistics
   */
  getCurrentUsage() {
    if (!this.supported || this.samples.length === 0) {
      return null;
    }
    
    const latest = this.samples[this.samples.length - 1];
    return {
      used: (latest.usedJSHeapSize / 1048576).toFixed(2),
      total: (latest.totalJSHeapSize / 1048576).toFixed(2),
      limit: (latest.jsHeapSizeLimit / 1048576).toFixed(2)
    };
  }
  
  /**
   * Detect potential memory leaks
   * @returns {boolean} True if memory usage is increasing consistently
   */
  detectLeak() {
    if (!this.supported || this.samples.length < 10) {
      return false;
    }
    
    // Check if memory is consistently increasing
    let increases = 0;
    for (let i = 1; i < this.samples.length; i++) {
      if (this.samples[i].usedJSHeapSize > this.samples[i - 1].usedJSHeapSize) {
        increases++;
      }
    }
    
    // If more than 80% of samples show increase, potential leak
    return (increases / this.samples.length) > 0.8;
  }
  
  /**
   * Reset memory samples
   */
  reset() {
    this.samples = [];
  }
}

/**
 * Performance Monitor
 * Combines FPS counter, profiler, and memory monitor
 */
export class PerformanceMonitor {
  /**
   * Create a new Performance Monitor
   * @param {boolean} enableProfiling - Enable detailed profiling
   */
  constructor(enableProfiling = false) {
    this.fpsCounter = new FPSCounter();
    this.profiler = enableProfiling ? new PerformanceProfiler() : null;
    this.memoryMonitor = new MemoryMonitor();
    this.enabled = true;
    this.frameCount = 0;
  }
  
  /**
   * Update performance monitor (call once per frame)
   */
  update() {
    if (!this.enabled) return;
    
    this.fpsCounter.update();
    this.frameCount++;
    
    // Sample memory every 60 frames (~1 second)
    if (this.frameCount % 60 === 0) {
      this.memoryMonitor.sample();
    }
  }
  
  /**
   * Start profiling a section
   * @param {string} label - Section label
   */
  startProfile(label) {
    if (this.profiler && this.enabled) {
      this.profiler.start(label);
    }
  }
  
  /**
   * End profiling a section
   * @param {string} label - Section label
   */
  endProfile(label) {
    if (this.profiler && this.enabled) {
      this.profiler.end(label);
    }
  }
  
  /**
   * Get performance statistics
   * @returns {Object} Performance stats
   */
  getStats() {
    return {
      fps: this.fpsCounter.getFPS(),
      avgFrameTime: this.fpsCounter.getAvgFrameTime(),
      minFPS: this.fpsCounter.getMinFPS(),
      maxFPS: this.fpsCounter.getMaxFPS(),
      memory: this.memoryMonitor.getCurrentUsage(),
      frameCount: this.frameCount
    };
  }
  
  /**
   * Print performance report to console
   */
  printReport() {
    const stats = this.getStats();
    console.log('=== Performance Report ===');
    console.log(`FPS: ${stats.fps} (min: ${stats.minFPS}, max: ${stats.maxFPS})`);
    console.log(`Avg Frame Time: ${stats.avgFrameTime}ms`);
    console.log(`Total Frames: ${stats.frameCount}`);
    
    if (stats.memory) {
      console.log(`Memory: ${stats.memory.used}MB / ${stats.memory.total}MB`);
    }
    
    if (this.profiler) {
      this.profiler.printMeasurements();
    }
    
    if (this.memoryMonitor.detectLeak()) {
      console.warn('⚠ Potential memory leak detected!');
    }
  }
  
  /**
   * Enable/disable performance monitoring
   * @param {boolean} enabled - Enable monitoring
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  
  /**
   * Reset all performance statistics
   */
  reset() {
    this.fpsCounter.reset();
    if (this.profiler) {
      this.profiler.reset();
    }
    this.memoryMonitor.reset();
    this.frameCount = 0;
  }
}
