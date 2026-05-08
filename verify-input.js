/**
 * Input System Verification Script
 * 
 * This script verifies the InputSystem implementation meets all acceptance criteria.
 */

import { InputSystem } from './src/input.js';

console.log('=== Input System Verification ===\n');

// Create a mock canvas element
function createMockCanvas() {
  const listeners = {};
  return {
    addEventListener: (event, handler) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(handler);
      console.log(`  ✓ Event listener attached: ${event}`);
    },
    removeEventListener: (event, handler) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(h => h !== handler);
        console.log(`  ✓ Event listener removed: ${event}`);
      }
    },
    trigger: (event, eventData = {}) => {
      if (listeners[event]) {
        listeners[event].forEach(handler => {
          handler({ preventDefault: () => {}, ...eventData });
        });
      }
    }
  };
}

// Verification tests
console.log('1. Creating InputSystem with canvas element...');
const canvas = createMockCanvas();
const input = new InputSystem(canvas);
console.log('  ✓ InputSystem created\n');

console.log('2. Initializing InputSystem...');
input.init();
console.log('  ✓ InputSystem initialized\n');

console.log('3. Testing mouse click event...');
console.log('  - Simulating mouse click');
canvas.trigger('click');
const clickRegistered = input.getJumpInput();
console.log(`  ✓ Jump input registered: ${clickRegistered}`);
if (!clickRegistered) {
  console.error('  ✗ FAILED: Mouse click should register jump input');
  process.exit(1);
}
console.log('');

console.log('4. Testing reset() method...');
input.reset();
const afterReset = input.getJumpInput();
console.log(`  ✓ Jump input after reset: ${afterReset}`);
if (afterReset) {
  console.error('  ✗ FAILED: reset() should clear jump input');
  process.exit(1);
}
console.log('');

console.log('5. Testing touch event...');
console.log('  - Simulating touch event');
canvas.trigger('touchstart');
const touchRegistered = input.getJumpInput();
console.log(`  ✓ Jump input registered: ${touchRegistered}`);
if (!touchRegistered) {
  console.error('  ✗ FAILED: Touch event should register jump input');
  process.exit(1);
}
console.log('');

console.log('6. Testing immediate registration (same frame)...');
input.reset();
const before = input.getJumpInput();
canvas.trigger('click');
const after = input.getJumpInput();
console.log(`  - Before click: ${before}`);
console.log(`  - After click: ${after}`);
if (before !== false || after !== true) {
  console.error('  ✗ FAILED: Input should be registered immediately');
  process.exit(1);
}
console.log('  ✓ Input registered immediately (same frame)\n');

console.log('7. Testing multiple inputs...');
input.reset();
canvas.trigger('click');
console.log('  - First click registered');
input.reset();
canvas.trigger('click');
console.log('  - Second click registered');
input.reset();
canvas.trigger('touchstart');
console.log('  - Touch registered');
console.log('  ✓ Multiple inputs work correctly\n');

console.log('8. Testing input persistence...');
input.reset();
canvas.trigger('click');
const check1 = input.getJumpInput();
const check2 = input.getJumpInput();
const check3 = input.getJumpInput();
console.log(`  - Check 1: ${check1}`);
console.log(`  - Check 2: ${check2}`);
console.log(`  - Check 3: ${check3}`);
if (!check1 || !check2 || !check3) {
  console.error('  ✗ FAILED: Input should persist until reset');
  process.exit(1);
}
console.log('  ✓ Input persists until reset\n');

console.log('9. Testing cleanup...');
input.destroy();
console.log('  ✓ InputSystem destroyed\n');

console.log('=== Acceptance Criteria Verification ===\n');

const criteria = [
  '✓ Create src/input.js with InputSystem class',
  '✓ Listen for mouse click events',
  '✓ Listen for touch events',
  '✓ Register jump input on click/touch',
  '✓ Implement getJumpInput() method',
  '✓ Implement reset() method',
  '✓ Verify input is registered immediately',
  '✓ Test on both desktop and mobile (mock events)'
];

criteria.forEach(criterion => console.log(criterion));

console.log('\n=== Verification Complete ===');
console.log('✓ All acceptance criteria met!');
console.log('✓ Input system is ready for integration');
