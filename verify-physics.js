/**
 * Physics Engine Verification Script
 * 
 * Demonstrates the physics engine functionality:
 * - Gravity application
 * - Jump mechanics
 * - Position updates
 */

import { PhysicsEngine } from './src/physics.js';
import { PHYSICS } from './src/constants.js';

console.log('=== Physics Engine Verification ===\n');

// Create physics engine
const physics = new PhysicsEngine();

console.log('Initial State:');
console.log('Position:', physics.getPosition());
console.log('Velocity:', physics.getVelocity());
console.log('');

// Simulate gravity for 5 frames
console.log('Applying gravity for 5 frames:');
for (let i = 1; i <= 5; i++) {
  physics.update(1/60);
  console.log(`Frame ${i}:`, {
    position: physics.getPosition(),
    velocity: physics.getVelocity()
  });
}
console.log('');

// Apply jump
console.log('Applying jump:');
physics.applyJump();
console.log('After jump:', {
  position: physics.getPosition(),
  velocity: physics.getVelocity()
});
console.log('');

// Simulate a few more frames after jump
console.log('Simulating 3 frames after jump:');
for (let i = 1; i <= 3; i++) {
  physics.update(1/60);
  console.log(`Frame ${i}:`, {
    position: physics.getPosition(),
    velocity: physics.getVelocity()
  });
}
console.log('');

// Reset
console.log('Resetting physics engine:');
physics.reset();
console.log('After reset:', {
  position: physics.getPosition(),
  velocity: physics.getVelocity()
});
console.log('');

// Verify constants
console.log('Physics Constants:');
console.log('Gravity:', PHYSICS.GRAVITY, 'pixels/frame²');
console.log('Jump Velocity:', PHYSICS.JUMP_VELOCITY, 'pixels/frame');
console.log('Ghost Start Position:', `(${PHYSICS.GHOST_START_X}, ${PHYSICS.GHOST_START_Y})`);
console.log('');

console.log('✓ Physics Engine verification complete!');
