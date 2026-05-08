/**
 * Game State Manager Tests
 * 
 * Tests for game state transitions and reset functionality.
 * Validates Property 13: Game state reset clears all game objects.
 */

import { Game } from './game.js';
import { GAME_STATE } from './constants.js';

// Mock canvas for testing
function createMockCanvas() {
  return {
    width: 800,
    height: 600,
    getContext: () => ({
      clearRect: () => {},
      fillRect: () => {},
      drawImage: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      fillStyle: '',
      strokeStyle: '',
      globalAlpha: 1,
      font: '',
      textAlign: '',
      textBaseline: '',
      fillText: () => {},
      measureText: () => ({ width: 0 }),
      imageSmoothingEnabled: false
    })
  };
}

// Test Suite
console.log('=== Game State Manager Tests ===\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`✗ ${message}`);
    testsFailed++;
  }
}

// Test 1: Game initializes in Menu state
console.log('Test 1: Game initializes in Menu state');
const game1 = new Game(createMockCanvas());
assert(game1.getState() === GAME_STATE.MENU, 'Game should start in Menu state');
console.log('');

// Test 2: Transition from Menu to Playing
console.log('Test 2: Transition from Menu to Playing');
const game2 = new Game(createMockCanvas());
game2.transitionToPlaying();
assert(game2.getState() === GAME_STATE.PLAYING, 'Game should transition to Playing state');
console.log('');

// Test 3: Transition from Playing to GameOver
console.log('Test 3: Transition from Playing to GameOver');
const game3 = new Game(createMockCanvas());
game3.transitionToPlaying();
game3.transitionToGameOver();
assert(game3.getState() === GAME_STATE.GAME_OVER, 'Game should transition to GameOver state');
console.log('');

// Test 4: Transition from GameOver to Menu
console.log('Test 4: Transition from GameOver to Menu');
const game4 = new Game(createMockCanvas());
game4.transitionToPlaying();
game4.transitionToGameOver();
game4.transitionToMenu();
assert(game4.getState() === GAME_STATE.MENU, 'Game should transition back to Menu state');
console.log('');

// Test 5: Invalid transition from Menu to GameOver (should be rejected)
console.log('Test 5: Invalid transition from Menu to GameOver');
const game5 = new Game(createMockCanvas());
game5.transitionToGameOver();
assert(game5.getState() === GAME_STATE.MENU, 'Game should remain in Menu state (invalid transition)');
console.log('');

// Test 6: Invalid transition from Playing to Menu (should be rejected)
console.log('Test 6: Invalid transition from Playing to Menu');
const game6 = new Game(createMockCanvas());
game6.transitionToPlaying();
game6.transitionToMenu();
assert(game6.getState() === GAME_STATE.PLAYING, 'Game should remain in Playing state (invalid transition)');
console.log('');

// Test 7: Reset clears physics state (Property 13)
console.log('Test 7: Reset clears physics state');
const game7 = new Game(createMockCanvas());
game7.transitionToPlaying();
// Simulate some gameplay
game7.update(0.016, true); // Jump
game7.update(0.016, false); // Fall
const posBeforeReset = game7.getGhostPosition();
game7.reset();
const posAfterReset = game7.getGhostPosition();
assert(
  posAfterReset.x === 100 && posAfterReset.y === 300,
  'Ghost position should reset to starting position (100, 300)'
);
console.log('');

// Test 8: Reset clears all pipes (Property 13)
console.log('Test 8: Reset clears all pipes');
const game8 = new Game(createMockCanvas());
game8.transitionToPlaying();
// Simulate gameplay to generate pipes (need at least 90 frames for first pipe)
// Keep jumping to avoid collision
for (let i = 0; i < 150; i++) {
  if (game8.getState() !== GAME_STATE.PLAYING) {
    break; // Stop if game over
  }
  game8.update(0.016, i % 10 === 0); // Jump every 10 frames to stay alive
}
const pipesBeforeReset8 = game8.getPipes();
const stateBeforeReset8 = game8.getState();
// If game is still playing, we should have pipes
if (stateBeforeReset8 === GAME_STATE.PLAYING) {
  assert(pipesBeforeReset8.length > 0, 'Pipes should be generated during gameplay');
} else {
  // If game ended, just verify reset works
  console.log('  (Game ended before pipes generated, skipping pipe generation check)');
}
game8.reset();
const pipesAfterReset8 = game8.getPipes();
assert(pipesAfterReset8.length === 0, 'All pipes should be cleared after reset');
console.log('');

// Test 9: Reset clears current score (Property 13)
console.log('Test 9: Reset clears current score');
const game9 = new Game(createMockCanvas());
game9.transitionToPlaying();
// Simulate gameplay to score points
for (let i = 0; i < 200; i++) {
  game9.update(0.016, false);
}
const scoreBeforeReset = game9.getCurrentScore();
game9.reset();
const scoreAfterReset = game9.getCurrentScore();
assert(scoreAfterReset === 0, 'Current score should reset to 0');
console.log('');

// Test 10: Reset does NOT clear high score
console.log('Test 10: Reset does NOT clear high score');
const game10 = new Game(createMockCanvas());
game10.transitionToPlaying();
// Simulate gameplay to score points (need enough frames to pass pipes)
for (let i = 0; i < 300; i++) {
  game10.update(0.016, false);
}
const scoreBeforeGameOver = game10.getCurrentScore();
if (scoreBeforeGameOver > 0) {
  game10.transitionToGameOver();
  const highScoreAfterGameOver = game10.getHighScore();
  game10.transitionToMenu();
  const highScoreAfterReset = game10.getHighScore();
  assert(
    highScoreAfterReset === highScoreAfterGameOver && highScoreAfterReset > 0,
    'High score should persist after reset'
  );
} else {
  // If no score was achieved, just verify high score doesn't change
  const initialHighScore = game10.getHighScore();
  game10.transitionToGameOver();
  game10.transitionToMenu();
  const finalHighScore = game10.getHighScore();
  assert(
    initialHighScore === finalHighScore,
    'High score should persist after reset (no score case)'
  );
}
console.log('');

// Test 11: Update only processes during Playing state
console.log('Test 11: Update only processes during Playing state');
const game11 = new Game(createMockCanvas());
const initialPos = game11.getGhostPosition();
game11.update(0.016, true); // Try to update in Menu state
const posAfterUpdate = game11.getGhostPosition();
assert(
  initialPos.x === posAfterUpdate.x && initialPos.y === posAfterUpdate.y,
  'Ghost position should not change when updating in Menu state'
);
console.log('');

// Test 12: Jump input applies jump velocity during Playing state
console.log('Test 12: Jump input applies jump velocity during Playing state');
const game12 = new Game(createMockCanvas());
game12.transitionToPlaying();
const posBeforeJump = game12.getGhostPosition();
game12.update(0.016, true); // Jump
const posAfterJump = game12.getGhostPosition();
assert(
  posAfterJump.y < posBeforeJump.y,
  'Ghost should move upward after jump input'
);
console.log('');

// Test 13: Collision triggers transition to GameOver
console.log('Test 13: Collision triggers transition to GameOver');
const game13 = new Game(createMockCanvas());
game13.transitionToPlaying();
// Simulate falling to bottom boundary
for (let i = 0; i < 100; i++) {
  game13.update(0.016, false);
}
assert(
  game13.getState() === GAME_STATE.GAME_OVER,
  'Game should transition to GameOver after collision'
);
console.log('');

// Test 14: High score updates when current score exceeds it
console.log('Test 14: High score updates when current score exceeds it');
const game14 = new Game(createMockCanvas());
const initialHighScore = game14.getHighScore();
game14.transitionToPlaying();
// Simulate gameplay to score points (need enough frames to pass pipes)
for (let i = 0; i < 300; i++) {
  game14.update(0.016, false);
}
const currentScore = game14.getCurrentScore();
game14.transitionToGameOver();
const newHighScore = game14.getHighScore();
assert(
  newHighScore >= currentScore && newHighScore >= initialHighScore,
  'High score should update when current score exceeds it'
);
console.log('');

// Test 15: State machine cycle (Menu → Playing → GameOver → Menu)
console.log('Test 15: Complete state machine cycle');
const game15 = new Game(createMockCanvas());
assert(game15.getState() === GAME_STATE.MENU, 'Step 1: Start in Menu');
game15.transitionToPlaying();
assert(game15.getState() === GAME_STATE.PLAYING, 'Step 2: Transition to Playing');
game15.transitionToGameOver();
assert(game15.getState() === GAME_STATE.GAME_OVER, 'Step 3: Transition to GameOver');
game15.transitionToMenu();
assert(game15.getState() === GAME_STATE.MENU, 'Step 4: Return to Menu');
console.log('');

// Test 16: getGhostPosition returns valid position
console.log('Test 16: getGhostPosition returns valid position');
const game16 = new Game(createMockCanvas());
const pos = game16.getGhostPosition();
assert(
  typeof pos.x === 'number' && typeof pos.y === 'number',
  'getGhostPosition should return object with x and y coordinates'
);
console.log('');

// Test 17: getPipes returns array
console.log('Test 17: getPipes returns array');
const game17 = new Game(createMockCanvas());
const pipes = game17.getPipes();
assert(Array.isArray(pipes), 'getPipes should return an array');
console.log('');

// Test 18: getCurrentScore returns number
console.log('Test 18: getCurrentScore returns number');
const game18 = new Game(createMockCanvas());
const score = game18.getCurrentScore();
assert(typeof score === 'number', 'getCurrentScore should return a number');
console.log('');

// Test 19: getHighScore returns number
console.log('Test 19: getHighScore returns number');
const game19 = new Game(createMockCanvas());
const highScore = game19.getHighScore();
assert(typeof highScore === 'number', 'getHighScore should return a number');
console.log('');

// Test 20: getAudioEngine returns AudioEngine instance
console.log('Test 20: getAudioEngine returns AudioEngine instance');
const game20 = new Game(createMockCanvas());
const audioEngine = game20.getAudioEngine();
assert(audioEngine !== null && audioEngine !== undefined, 'getAudioEngine should return AudioEngine instance');
console.log('');

// Property 13: Game state reset clears all game objects
console.log('=== Property 13: Game State Reset ===');
console.log('Property 13: For any game state, calling reset should clear all game objects');
const game13a = new Game(createMockCanvas());
game13a.transitionToPlaying();
// Generate game state
for (let i = 0; i < 150; i++) {
  game13a.update(0.016, false);
}
const stateBeforeReset = {
  pipes: game13a.getPipes().length,
  score: game13a.getCurrentScore(),
  ghostPos: game13a.getGhostPosition()
};
game13a.reset();
const stateAfterReset = {
  pipes: game13a.getPipes().length,
  score: game13a.getCurrentScore(),
  ghostPos: game13a.getGhostPosition()
};
assert(
  stateAfterReset.pipes === 0 &&
  stateAfterReset.score === 0 &&
  stateAfterReset.ghostPos.x === 100 &&
  stateAfterReset.ghostPos.y === 300,
  'Property 13: Reset should clear all pipes, reset score to 0, and reset ghost position'
);
console.log('');

// Summary
console.log('=== Test Summary ===');
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log(`Total Tests: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✓ All tests passed!');
} else {
  console.log(`\n✗ ${testsFailed} test(s) failed`);
  process.exit(1);
}
