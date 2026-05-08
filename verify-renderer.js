/**
 * Renderer Visual Verification Script
 * 
 * Creates a test HTML page to visually verify renderer functionality.
 * Tests all rendering methods with different game states.
 */

import { Renderer } from './src/renderer.js';
import { AssetLoader } from './src/assets.js';
import { GAME_STATE } from './src/constants.js';

console.log('=== Renderer Visual Verification ===\n');

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

async function init() {
  console.log('Initializing renderer verification...');
  
  // Load assets first
  try {
    await AssetLoader.loadAssets();
    console.log('✓ Assets loaded successfully');
  } catch (error) {
    console.error('✗ Failed to load assets:', error);
    document.body.innerHTML = '<h1 style="color: red;">Failed to load assets. Check console for details.</h1>';
    return;
  }
  
  // Create test canvases
  createTestSection('Menu State', testMenuState);
  createTestSection('Playing State', testPlayingState);
  createTestSection('Game Over State', testGameOverState);
  createTestSection('Rendering Order Test', testRenderingOrder);
  
  console.log('\n✓ All visual tests rendered');
  console.log('Check the browser window to verify visual appearance');
}

function createTestSection(title, testFunction) {
  const section = document.createElement('div');
  section.style.marginBottom = '30px';
  
  const heading = document.createElement('h2');
  heading.textContent = title;
  section.appendChild(heading);
  
  const canvas = document.createElement('canvas');
  section.appendChild(canvas);
  
  document.body.appendChild(section);
  
  testFunction(canvas);
}

function testMenuState(canvas) {
  console.log('\nTest: Menu State Rendering');
  const renderer = new Renderer(canvas);
  
  renderer.render(
    GAME_STATE.MENU,
    { x: 100, y: 300 },
    [],
    0,
    42
  );
  
  console.log('✓ Menu state rendered');
  console.log('  - Should show: "Flappy Kiro" title');
  console.log('  - Should show: "Start Game" button');
  console.log('  - Should show: "High Score: 42"');
}

function testPlayingState(canvas) {
  console.log('\nTest: Playing State Rendering');
  const renderer = new Renderer(canvas);
  
  const pipes = [
    { x: 400, topY: 150, gapY: 150, width: 80, gapSize: 120 },
    { x: 600, topY: 200, gapY: 200, width: 80, gapSize: 120 },
    { x: 800, topY: 100, gapY: 100, width: 80, gapSize: 120 }
  ];
  
  renderer.render(
    GAME_STATE.PLAYING,
    { x: 100, y: 300 },
    pipes,
    15,
    42
  );
  
  console.log('✓ Playing state rendered');
  console.log('  - Should show: Light blue background');
  console.log('  - Should show: 3 green pipes with gaps');
  console.log('  - Should show: Ghost sprite at (100, 300)');
  console.log('  - Should show: Score "15" at top center');
}

function testGameOverState(canvas) {
  console.log('\nTest: Game Over State Rendering');
  const renderer = new Renderer(canvas);
  
  const pipes = [
    { x: 400, topY: 150, gapY: 150, width: 80, gapSize: 120 },
    { x: 600, topY: 200, gapY: 200, width: 80, gapSize: 120 }
  ];
  
  renderer.render(
    GAME_STATE.GAME_OVER,
    { x: 100, y: 300 },
    pipes,
    15,
    42
  );
  
  console.log('✓ Game Over state rendered');
  console.log('  - Should show: Semi-transparent overlay');
  console.log('  - Should show: "Game Over" text');
  console.log('  - Should show: "Score: 15"');
  console.log('  - Should show: "High Score: 42"');
  console.log('  - Should show: "Restart" button');
}

function testRenderingOrder(canvas) {
  console.log('\nTest: Rendering Order Verification');
  const renderer = new Renderer(canvas);
  
  // Create pipes at different positions to verify layering
  const pipes = [
    { x: 50, topY: 150, gapY: 150, width: 80, gapSize: 120 },
    { x: 200, topY: 200, gapY: 200, width: 80, gapSize: 120 }
  ];
  
  // Ghost positioned to overlap with first pipe
  renderer.render(
    GAME_STATE.PLAYING,
    { x: 90, y: 300 },
    pipes,
    5,
    10
  );
  
  console.log('✓ Rendering order test rendered');
  console.log('  - Ghost should appear IN FRONT of pipes');
  console.log('  - Score should appear IN FRONT of everything');
  console.log('  - Background should be behind everything');
}

// Add some styling
document.body.style.fontFamily = 'Arial, sans-serif';
document.body.style.padding = '20px';
document.body.style.backgroundColor = '#f0f0f0';

const title = document.createElement('h1');
title.textContent = 'Renderer Visual Verification';
document.body.insertBefore(title, document.body.firstChild);

const instructions = document.createElement('p');
instructions.textContent = 'Visual verification of renderer functionality. Check console for detailed test results.';
instructions.style.marginBottom = '30px';
document.body.insertBefore(instructions, document.body.children[1]);
