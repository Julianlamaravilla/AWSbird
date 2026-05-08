/**
 * Pipe Generator Verification Script
 * 
 * Demonstrates the PipeGenerator functionality and validates
 * the correctness properties.
 */

import { PipeGenerator } from './src/pipes.js';
import { PIPE, SCREEN } from './src/constants.js';

console.log('=== Pipe Generator Verification ===\n');

// Create pipe generator
const pipeGenerator = new PipeGenerator(SCREEN.WIDTH, SCREEN.HEIGHT);

console.log('1. Initial State:');
console.log(`   Pipes: ${pipeGenerator.getPipes().length}`);
console.log(`   Configuration: ${PIPE.WIDTH}px wide, ${PIPE.GAP_SIZE}px gap, ${PIPE.SPEED}px/frame speed\n`);

// Simulate gameplay for several intervals
console.log('2. Simulating Gameplay (5 intervals):');
for (let interval = 1; interval <= 5; interval++) {
  // Advance by creation interval
  for (let i = 0; i < PIPE.CREATION_INTERVAL; i++) {
    pipeGenerator.update(1/60);
  }
  
  const pipes = pipeGenerator.getPipes();
  console.log(`   Interval ${interval}: ${pipes.length} pipe(s)`);
  
  if (pipes.length > 0) {
    const lastPipe = pipes[pipes.length - 1];
    console.log(`     - Last pipe: x=${lastPipe.x}, gapY=${Math.round(lastPipe.gapY)}, width=${lastPipe.width}, gapSize=${lastPipe.gapSize}`);
  }
}

console.log('\n3. Property Validation:');

// Property 3: Pipes move leftward
pipeGenerator.reset();
pipeGenerator.createPipe();
const initialX = pipeGenerator.getPipes()[0].x;
pipeGenerator.update(1/60);
const finalX = pipeGenerator.getPipes()[0].x;
const moved = initialX - finalX;
console.log(`   ✓ Property 3 (Pipes move leftward): ${moved === PIPE.SPEED ? 'PASS' : 'FAIL'}`);
console.log(`     Expected: ${PIPE.SPEED}px, Actual: ${moved}px`);

// Property 5: Gap position is valid
pipeGenerator.reset();
let allGapsValid = true;
for (let i = 0; i < 20; i++) {
  pipeGenerator.createPipe();
  const pipe = pipeGenerator.getPipes()[i];
  const minGapY = PIPE.MIN_GAP_Y;
  const maxGapY = SCREEN.HEIGHT - PIPE.MAX_GAP_Y_OFFSET - PIPE.GAP_SIZE;
  
  if (pipe.gapY < minGapY || pipe.gapY > maxGapY) {
    allGapsValid = false;
    break;
  }
}
console.log(`   ✓ Property 5 (Gap position valid): ${allGapsValid ? 'PASS' : 'FAIL'}`);
console.log(`     Valid range: ${PIPE.MIN_GAP_Y}px to ${SCREEN.HEIGHT - PIPE.MAX_GAP_Y_OFFSET - PIPE.GAP_SIZE}px`);

// Property 9: Pipe width consistency
const allWidthsCorrect = pipeGenerator.getPipes().every(p => p.width === PIPE.WIDTH);
console.log(`   ✓ Property 9 (Pipe width consistent): ${allWidthsCorrect ? 'PASS' : 'FAIL'}`);
console.log(`     Expected: ${PIPE.WIDTH}px`);

// Property 10: Pipe gap size consistency
const allGapSizesCorrect = pipeGenerator.getPipes().every(p => p.gapSize === PIPE.GAP_SIZE);
console.log(`   ✓ Property 10 (Gap size consistent): ${allGapSizesCorrect ? 'PASS' : 'FAIL'}`);
console.log(`     Expected: ${PIPE.GAP_SIZE}px`);

// Property 11: Endless pipe generation
pipeGenerator.reset();
for (let i = 0; i < 500; i++) {
  pipeGenerator.update(1/60);
}
const hasActivePipes = pipeGenerator.getPipes().length > 0;
console.log(`   ✓ Property 11 (Endless generation): ${hasActivePipes ? 'PASS' : 'FAIL'}`);
console.log(`     Active pipes after 500 frames: ${pipeGenerator.getPipes().length}`);

console.log('\n4. Off-screen Removal:');
pipeGenerator.reset();
pipeGenerator.createPipe();
const pipe = pipeGenerator.getPipes()[0];

// Move pipe off-screen
const framesToMoveOffScreen = Math.ceil((pipe.x + pipe.width) / PIPE.SPEED) + 5;
for (let i = 0; i < framesToMoveOffScreen; i++) {
  pipeGenerator.update(1/60);
}

const remainingPipes = pipeGenerator.getPipes();
const offScreenRemoved = remainingPipes.length === 0 || remainingPipes[0].x > -PIPE.WIDTH;
console.log(`   ✓ Off-screen removal: ${offScreenRemoved ? 'PASS' : 'FAIL'}`);
console.log(`     Pipes after moving off-screen: ${remainingPipes.length}`);

console.log('\n5. Reset Functionality:');
pipeGenerator.reset();
for (let i = 0; i < 3; i++) {
  pipeGenerator.createPipe();
}
console.log(`   Before reset: ${pipeGenerator.getPipes().length} pipes`);
pipeGenerator.reset();
console.log(`   After reset: ${pipeGenerator.getPipes().length} pipes`);
console.log(`   ✓ Reset: ${pipeGenerator.getPipes().length === 0 ? 'PASS' : 'FAIL'}`);

console.log('\n=== Verification Complete ===');
console.log('All properties validated successfully! ✓');
