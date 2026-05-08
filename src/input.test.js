/**
 * Input System Tests
 * 
 * Tests for mouse click and touch event handling.
 */

import { InputSystem } from './input.js';

// Test suite for InputSystem
export function runInputTests() {
  console.log('=== Running Input System Tests ===\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Helper function to run a test
  function test(name, fn) {
    totalTests++;
    try {
      fn();
      console.log(`✓ ${name}`);
      passedTests++;
    } catch (error) {
      console.error(`✗ ${name}`);
      console.error(`  ${error.message}`);
    }
  }
  
  // Helper function to create a mock canvas
  function createMockCanvas() {
    const listeners = {};
    return {
      addEventListener: (event, handler) => {
        if (!listeners[event]) {
          listeners[event] = [];
        }
        listeners[event].push(handler);
      },
      removeEventListener: (event, handler) => {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter(h => h !== handler);
        }
      },
      trigger: (event, eventData = {}) => {
        if (listeners[event]) {
          listeners[event].forEach(handler => {
            handler({ preventDefault: () => {}, ...eventData });
          });
        }
      },
      getListeners: (event) => listeners[event] || []
    };
  }
  
  // Test 1: Constructor initializes correctly
  test('Constructor initializes with canvas', () => {
    const canvas = createMockCanvas();
    const input = new InputSystem(canvas);
    
    if (input.canvas !== canvas) {
      throw new Error('Canvas not stored correctly');
    }
    if (input.jumpInputRegistered !== false) {
      throw new Error('jumpInputRegistered should be false initially');
    }
    if (input.initialized !== false) {
      throw new Error('initialized should be false initially');
    }
  });
  
  // Test 2: init() attaches event listeners
  test('init() attaches click and touch event listeners', () => {
    const canvas = createMockCanvas();
    const input = new InputSystem(canvas);
    
    input.init();
    
    if (!input.initialized) {
      throw new Error('initialized should be true after init()');
    }
    
    const clickListeners = canvas.getListeners('click');
    const touchListeners = canvas.getListeners('touchstart');
    
    if (clickListeners.length !== 1) {
      throw new Error('Should have exactly one click listener');
    }
    if (touchListeners.length !== 1) {
      throw new Error('Should have exactly one touchstart listener');
    }
  });
  
  // Test 3: Mouse click registers jump input
  test('Mouse click registers jump input', () => {
    const canvas = createMockCanvas();
    const input = new InputSystem(canvas);
    
    input.init();
    
    // Simulate mouse click
    canvas.trigger('click');
    
    if (!input.getJumpInput()) {
      throw new Error('Jump input should be registered after click');
    }
  });
  
  // Test 4: Touch event registers jump input
  test('Touch event registers jump input', () => {
    const canvas = createMockCanvas();
    const input = new InputSystem(canvas);
    
    input.init();
    
    // Simulate touch
    canvas.trigger('touchstart');
    
    if (!input.getJumpInput()) {
      throw new Error('Jump input should be registered after touch');
    }
  });
  
  // Test 5: getJumpInput() returns correct state
  test('getJumpInput() returns false when no input', () => {
    const canvas = createMockCanvas();
    const input = new InputSystem(canvas);
    
    input.init();
    
    if (input.getJumpInput()) {
      throw new Error('Jump input should be false initially');
    }
  });
  
  // Test 6: reset() clears jump input
  test('reset() clears jump input', () => {
    const canvas = createMockCanvas();
    const input = new InputSystem(canvas);
    
    input.init();
    canvas.trigger('click');
    
    if (!input.getJumpInput()) {
      throw new Error('Jump input should be registered');
    }
    
    input.reset();
    
    if (input.getJumpInput()) {
      throw new Error('Jump input should be cleared after reset()');
    }
  });
  
  // Test 7: Multiple clicks register input
  test('Multiple clicks register input', () => {
    const canvas = createMockCanvas();
    const input = new InputSystem(canvas);
    
    input.init();
    
    // First click
    canvas.trigger('click');
    if (!input.getJumpInput()) {
      throw new Error('First click should register');
    }
    
    input.reset();
    
    // Second click
    canvas.trigger('click');
    if (!input.getJumpInput()) {
      throw new Error('Second click should register');
    }
  });
  
  // Test 8: Input persists until reset
  test('Input persists until reset', () => {
    const canvas = createMockCanvas();
    const input = new InputSystem(canvas);
    
    input.init();
    canvas.trigger('click');
    
    // Check multiple times before reset
    if (!input.getJumpInput()) {
      throw new Error('Input should persist (check 1)');
    }
    if (!input.getJumpInput()) {
      throw new Error('Input should persist (check 2)');
    }
    
    input.reset();
    
    if (input.getJumpInput()) {
      throw new Error('Input should be cleared after reset');
    }
  });
  
  // Test 9: destroy() removes event listeners
  test('destroy() removes event listeners', () => {
    const canvas = createMockCanvas();
    const input = new InputSystem(canvas);
    
    input.init();
    input.destroy();
    
    if (input.initialized) {
      throw new Error('initialized should be false after destroy()');
    }
    
    const clickListeners = canvas.getListeners('click');
    const touchListeners = canvas.getListeners('touchstart');
    
    if (clickListeners.length !== 0) {
      throw new Error('Click listeners should be removed');
    }
    if (touchListeners.length !== 0) {
      throw new Error('Touch listeners should be removed');
    }
  });
  
  // Test 10: Input not registered before init
  test('Input not registered before init()', () => {
    const canvas = createMockCanvas();
    const input = new InputSystem(canvas);
    
    // Try to trigger without init
    canvas.trigger('click');
    
    if (input.getJumpInput()) {
      throw new Error('Input should not register before init()');
    }
  });
  
  // Test 11: Both click and touch work independently
  test('Both click and touch work independently', () => {
    const canvas = createMockCanvas();
    const input = new InputSystem(canvas);
    
    input.init();
    
    // Test click
    canvas.trigger('click');
    if (!input.getJumpInput()) {
      throw new Error('Click should register');
    }
    
    input.reset();
    
    // Test touch
    canvas.trigger('touchstart');
    if (!input.getJumpInput()) {
      throw new Error('Touch should register');
    }
  });
  
  // Test 12: Immediate input registration (same frame)
  test('Input is registered immediately (same frame)', () => {
    const canvas = createMockCanvas();
    const input = new InputSystem(canvas);
    
    input.init();
    
    const beforeClick = input.getJumpInput();
    canvas.trigger('click');
    const afterClick = input.getJumpInput();
    
    if (beforeClick !== false) {
      throw new Error('Input should be false before click');
    }
    if (afterClick !== true) {
      throw new Error('Input should be true immediately after click');
    }
  });
  
  // Test 13: Double init warning
  test('Double init() shows warning but works', () => {
    const canvas = createMockCanvas();
    const input = new InputSystem(canvas);
    
    input.init();
    input.init(); // Should warn but not break
    
    if (!input.initialized) {
      throw new Error('Should still be initialized');
    }
  });
  
  // Test 14: destroy() before init() is safe
  test('destroy() before init() is safe', () => {
    const canvas = createMockCanvas();
    const input = new InputSystem(canvas);
    
    // Should not throw error
    input.destroy();
    
    if (input.initialized) {
      throw new Error('Should not be initialized');
    }
  });
  
  // Print summary
  console.log(`\n=== Test Summary ===`);
  console.log(`Passed: ${passedTests}/${totalTests}`);
  console.log(`Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('✓ All tests passed!');
  } else {
    console.log('✗ Some tests failed');
  }
  
  return passedTests === totalTests;
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  runInputTests();
}
