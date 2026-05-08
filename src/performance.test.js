/**
 * Performance Optimization Tests
 * 
 * Tests for performance monitoring, object pooling, and optimization features.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FPSCounter, PerformanceProfiler, MemoryMonitor, PerformanceMonitor } from './performance.js';
import { ObjectPool, AudioSourcePool, EffectPool } from './pooling.js';

describe('FPSCounter', () => {
  let fpsCounter;
  
  beforeEach(() => {
    fpsCounter = new FPSCounter(10);
  });
  
  it('should initialize with default values', () => {
    expect(fpsCounter.getFPS()).toBe(60);
    expect(fpsCounter.getMinFPS()).toBe(60);
    expect(fpsCounter.getMaxFPS()).toBe(60);
  });
  
  it('should update FPS based on frame times', () => {
    // Simulate 60 FPS (16.67ms per frame)
    for (let i = 0; i < 10; i++) {
      fpsCounter.lastFrameTime = performance.now() - 16.67;
      fpsCounter.update();
    }
    
    const fps = fpsCounter.getFPS();
    expect(fps).toBeGreaterThan(55);
    expect(fps).toBeLessThan(65);
  });
  
  it('should track min and max FPS', () => {
    // Simulate varying frame times
    fpsCounter.lastFrameTime = performance.now() - 16.67; // 60 FPS
    fpsCounter.update();
    
    fpsCounter.lastFrameTime = performance.now() - 33.33; // 30 FPS
    fpsCounter.update();
    
    fpsCounter.lastFrameTime = performance.now() - 8.33; // 120 FPS
    fpsCounter.update();
    
    const minFPS = fpsCounter.getMinFPS();
    const maxFPS = fpsCounter.getMaxFPS();
    
    // Min should be lower than max
    expect(minFPS).toBeLessThan(maxFPS);
    // Should track reasonable range
    expect(minFPS).toBeLessThanOrEqual(60);
    expect(maxFPS).toBeGreaterThanOrEqual(60);
  });
  
  it('should reset statistics', () => {
    fpsCounter.update();
    fpsCounter.reset();
    
    expect(fpsCounter.getFPS()).toBe(60);
    expect(fpsCounter.frameTimes.length).toBe(0);
  });
  
  it('should detect when FPS is below target', () => {
    // Simulate low FPS
    for (let i = 0; i < 10; i++) {
      fpsCounter.lastFrameTime = performance.now() - 33.33; // 30 FPS
      fpsCounter.update();
    }
    
    expect(fpsCounter.isBelowTarget(60)).toBe(true);
    expect(fpsCounter.isBelowTarget(25)).toBe(false);
  });
});

describe('PerformanceProfiler', () => {
  let profiler;
  
  beforeEach(() => {
    profiler = new PerformanceProfiler();
  });
  
  it('should measure execution time', () => {
    profiler.start('test');
    
    // Simulate some work
    const start = performance.now();
    while (performance.now() - start < 10) {
      // Busy wait for 10ms
    }
    
    profiler.end('test');
    
    const measurement = profiler.getMeasurement('test');
    expect(measurement).toBeDefined();
    expect(measurement.count).toBe(1);
    expect(measurement.avg).toBeGreaterThan(5);
  });
  
  it('should track multiple measurements', () => {
    for (let i = 0; i < 5; i++) {
      profiler.start('test');
      profiler.end('test');
    }
    
    const measurement = profiler.getMeasurement('test');
    expect(measurement.count).toBe(5);
  });
  
  it('should track min and max times', () => {
    profiler.start('test');
    profiler.end('test');
    
    const measurement = profiler.getMeasurement('test');
    expect(measurement.min).toBeLessThanOrEqual(measurement.max);
    expect(measurement.avg).toBeGreaterThanOrEqual(measurement.min);
    expect(measurement.avg).toBeLessThanOrEqual(measurement.max);
  });
  
  it('should reset measurements', () => {
    profiler.start('test');
    profiler.end('test');
    profiler.reset();
    
    expect(profiler.getMeasurement('test')).toBeUndefined();
  });
});

describe('ObjectPool', () => {
  let pool;
  let createCount = 0;
  let resetCount = 0;
  
  beforeEach(() => {
    createCount = 0;
    resetCount = 0;
    
    pool = new ObjectPool(
      () => {
        createCount++;
        return { id: createCount, active: true };
      },
      (obj) => {
        resetCount++;
        obj.active = false;
      },
      5, // initial size
      10  // max size
    );
  });
  
  it('should pre-allocate initial objects', () => {
    expect(createCount).toBe(5);
    expect(pool.getPooledCount()).toBe(5);
  });
  
  it('should acquire objects from pool', () => {
    const obj = pool.acquire();
    
    expect(obj).toBeDefined();
    expect(pool.getActiveCount()).toBe(1);
    expect(pool.getPooledCount()).toBe(4);
  });
  
  it('should release objects back to pool', () => {
    const obj = pool.acquire();
    pool.release(obj);
    
    expect(pool.getActiveCount()).toBe(0);
    expect(pool.getPooledCount()).toBe(5);
    expect(resetCount).toBe(1);
  });
  
  it('should create new objects when pool is empty', () => {
    // Acquire all pre-allocated objects
    for (let i = 0; i < 5; i++) {
      pool.acquire();
    }
    
    expect(createCount).toBe(5);
    
    // Acquire one more (should create new)
    pool.acquire();
    
    expect(createCount).toBe(6);
  });
  
  it('should respect max pool size', () => {
    // Acquire and release many objects
    for (let i = 0; i < 20; i++) {
      const obj = pool.acquire();
      pool.release(obj);
    }
    
    // Pool should not exceed max size
    expect(pool.getPooledCount()).toBeLessThanOrEqual(10);
  });
  
  it('should release all active objects', () => {
    for (let i = 0; i < 3; i++) {
      pool.acquire();
    }
    
    expect(pool.getActiveCount()).toBe(3);
    
    pool.releaseAll();
    
    expect(pool.getActiveCount()).toBe(0);
  });
});

describe('EffectPool', () => {
  let effectPool;
  
  beforeEach(() => {
    effectPool = new EffectPool(5);
  });
  
  it('should add effects to pool', () => {
    const effect = {
      active: true,
      update: () => {},
      draw: () => {}
    };
    
    effectPool.addEffect(effect);
    
    expect(effectPool.getActiveCount()).toBe(1);
  });
  
  it('should update and remove inactive effects', () => {
    const effect1 = {
      active: true,
      update: function() { this.active = false; },
      draw: () => {}
    };
    
    const effect2 = {
      active: true,
      update: () => {},
      draw: () => {}
    };
    
    effectPool.addEffect(effect1);
    effectPool.addEffect(effect2);
    
    expect(effectPool.getActiveCount()).toBe(2);
    
    effectPool.update(16);
    
    expect(effectPool.getActiveCount()).toBe(1);
  });
  
  it('should respect max effects limit', () => {
    for (let i = 0; i < 10; i++) {
      effectPool.addEffect({
        active: true,
        update: () => {},
        draw: () => {}
      });
    }
    
    expect(effectPool.getActiveCount()).toBe(5);
  });
  
  it('should clear all effects', () => {
    for (let i = 0; i < 3; i++) {
      effectPool.addEffect({
        active: true,
        update: () => {},
        draw: () => {}
      });
    }
    
    effectPool.clear();
    
    expect(effectPool.getActiveCount()).toBe(0);
  });
});

describe('PerformanceMonitor', () => {
  let monitor;
  
  beforeEach(() => {
    monitor = new PerformanceMonitor(false);
  });
  
  it('should initialize with default values', () => {
    const stats = monitor.getStats();
    
    expect(stats.fps).toBe(60);
    expect(stats.frameCount).toBe(0);
  });
  
  it('should update frame count', () => {
    monitor.update();
    monitor.update();
    monitor.update();
    
    const stats = monitor.getStats();
    expect(stats.frameCount).toBe(3);
  });
  
  it('should track FPS', () => {
    for (let i = 0; i < 60; i++) {
      monitor.update();
    }
    
    const stats = monitor.getStats();
    expect(stats.fps).toBeGreaterThan(0);
  });
  
  it('should enable and disable monitoring', () => {
    monitor.setEnabled(false);
    monitor.update();
    
    const stats = monitor.getStats();
    expect(stats.frameCount).toBe(0);
    
    monitor.setEnabled(true);
    monitor.update();
    
    const stats2 = monitor.getStats();
    expect(stats2.frameCount).toBe(1);
  });
  
  it('should reset statistics', () => {
    monitor.update();
    monitor.update();
    monitor.reset();
    
    const stats = monitor.getStats();
    expect(stats.frameCount).toBe(0);
  });
});

describe('Performance Optimization Integration', () => {
  it('should minimize object allocations in game loop', () => {
    // Create object pool
    const pool = new ObjectPool(
      () => ({ x: 0, y: 0, active: true }),
      (obj) => { obj.active = false; },
      10,
      20
    );
    
    // Simulate game loop with object reuse
    const objects = [];
    
    // Acquire objects
    for (let i = 0; i < 5; i++) {
      objects.push(pool.acquire());
    }
    
    expect(pool.getActiveCount()).toBe(5);
    
    // Release objects
    for (const obj of objects) {
      pool.release(obj);
    }
    
    expect(pool.getActiveCount()).toBe(0);
    expect(pool.getPooledCount()).toBe(10);
  });
  
  it('should maintain 60 FPS target', () => {
    const fpsCounter = new FPSCounter();
    
    // Simulate 60 FPS for 60 frames
    for (let i = 0; i < 60; i++) {
      fpsCounter.lastFrameTime = performance.now() - 16.67;
      fpsCounter.update();
    }
    
    const fps = fpsCounter.getFPS();
    expect(fps).toBeGreaterThan(55);
    expect(fps).toBeLessThan(65);
    // FPS should be close to target (allow small variance)
    expect(Math.abs(fps - 60)).toBeLessThan(10);
  });
});
