/**
 * Renderer Tests
 * 
 * Tests for the Renderer class that handles all canvas rendering.
 */

import { Renderer } from './renderer.js';
import { AssetLoader } from './assets.js';
import { SCREEN, COLORS, GHOST, GAME_STATE } from './constants.js';

// Mock canvas and context
function createMockCanvas() {
  const mockContext = {
    clearRect: () => {},
    fillRect: () => {},
    drawImage: () => {},
    fillText: () => {},
    strokeRect: () => {},
    save: () => {},
    restore: () => {},
    imageSmoothingEnabled: true,
    webkitImageSmoothingEnabled: true,
    mozImageSmoothingEnabled: true,
    msImageSmoothingEnabled: true,
    fillStyle: '',
    strokeStyle: '',
    font: '',
    textAlign: '',
    textBaseline: '',
    lineWidth: 0
  };
  
  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: () => mockContext
  };
  
  return { canvas: mockCanvas, ctx: mockContext };
}

// Test Suite: Renderer Initialization
console.log('=== Renderer Initialization Tests ===');

// Test 1: Constructor sets canvas dimensions
{
  const { canvas } = createMockCanvas();
  const renderer = new Renderer(canvas);
  
  if (canvas.width === SCREEN.WIDTH && canvas.height === SCREEN.HEIGHT) {
    console.log('✓ Test 1 passed: Canvas dimensions set correctly');
  } else {
    console.error('✗ Test 1 failed: Canvas dimensions incorrect');
    console.error(`  Expected: ${SCREEN.WIDTH}x${SCREEN.HEIGHT}`);
    console.error(`  Got: ${canvas.width}x${canvas.height}`);
  }
}

// Test 2: Constructor disables image smoothing
{
  const { canvas, ctx } = createMockCanvas();
  const renderer = new Renderer(canvas);
  
  if (ctx.imageSmoothingEnabled === false &&
      ctx.webkitImageSmoothingEnabled === false &&
      ctx.mozImageSmoothingEnabled === false &&
      ctx.msImageSmoothingEnabled === false) {
    console.log('✓ Test 2 passed: Image smoothing disabled for pixel-perfect rendering');
  } else {
    console.error('✗ Test 2 failed: Image smoothing not properly disabled');
  }
}

// Test Suite: Background Rendering
console.log('\n=== Background Rendering Tests ===');

// Test 3: drawBackground fills canvas with correct color
{
  const { canvas, ctx } = createMockCanvas();
  const renderer = new Renderer(canvas);
  
  let fillRectCalled = false;
  let correctColor = false;
  let correctDimensions = false;
  
  ctx.fillRect = (x, y, width, height) => {
    fillRectCalled = true;
    correctDimensions = (x === 0 && y === 0 && width === SCREEN.WIDTH && height === SCREEN.HEIGHT);
  };
  
  renderer.drawBackground();
  correctColor = (ctx.fillStyle === COLORS.BACKGROUND);
  
  if (fillRectCalled && correctColor && correctDimensions) {
    console.log('✓ Test 3 passed: Background drawn with correct color and dimensions');
  } else {
    console.error('✗ Test 3 failed: Background rendering incorrect');
    console.error(`  fillRect called: ${fillRectCalled}`);
    console.error(`  Correct color: ${correctColor} (expected ${COLORS.BACKGROUND}, got ${ctx.fillStyle})`);
    console.error(`  Correct dimensions: ${correctDimensions}`);
  }
}

// Test Suite: Ghost Rendering
console.log('\n=== Ghost Rendering Tests ===');

// Test 4: drawGhost renders sprite at correct position
{
  const { canvas, ctx } = createMockCanvas();
  const renderer = new Renderer(canvas);
  
  // Mock AssetLoader
  const mockSprite = { width: 32, height: 32 };
  AssetLoader.getAsset = (name) => name === 'ghostSprite' ? mockSprite : null;
  
  let drawImageCalled = false;
  let correctPosition = false;
  
  ctx.drawImage = (img, x, y, width, height) => {
    drawImageCalled = true;
    const ghostPos = { x: 100, y: 300 };
    const expectedX = ghostPos.x - GHOST.WIDTH / 2;
    const expectedY = ghostPos.y - GHOST.HEIGHT / 2;
    correctPosition = (x === expectedX && y === expectedY && width === GHOST.WIDTH && height === GHOST.HEIGHT);
  };
  
  renderer.drawGhost({ x: 100, y: 300 });
  
  if (drawImageCalled && correctPosition) {
    console.log('✓ Test 4 passed: Ghost sprite rendered at correct position');
  } else {
    console.error('✗ Test 4 failed: Ghost rendering incorrect');
    console.error(`  drawImage called: ${drawImageCalled}`);
    console.error(`  Correct position: ${correctPosition}`);
  }
}

// Test 5: drawGhost fallback when sprite not loaded
{
  const { canvas, ctx } = createMockCanvas();
  const renderer = new Renderer(canvas);
  
  // Mock AssetLoader to return null
  AssetLoader.getAsset = () => null;
  
  let fillRectCalled = false;
  let correctColor = false;
  
  ctx.fillRect = (x, y, width, height) => {
    fillRectCalled = true;
    const ghostPos = { x: 100, y: 300 };
    const expectedX = ghostPos.x - GHOST.WIDTH / 2;
    const expectedY = ghostPos.y - GHOST.HEIGHT / 2;
    correctColor = (ctx.fillStyle === COLORS.GHOST);
  };
  
  renderer.drawGhost({ x: 100, y: 300 });
  
  if (fillRectCalled && correctColor) {
    console.log('✓ Test 5 passed: Ghost fallback rendering works');
  } else {
    console.error('✗ Test 5 failed: Ghost fallback rendering incorrect');
  }
}

// Test Suite: Pipe Rendering
console.log('\n=== Pipe Rendering Tests ===');

// Test 6: drawPipes renders all pipes in green
{
  const { canvas, ctx } = createMockCanvas();
  const renderer = new Renderer(canvas);
  
  const pipes = [
    { x: 400, topY: 150, gapY: 150, width: 80, gapSize: 120 },
    { x: 600, topY: 200, gapY: 200, width: 80, gapSize: 120 }
  ];
  
  let fillRectCallCount = 0;
  let correctColor = false;
  
  ctx.fillRect = () => {
    fillRectCallCount++;
    if (ctx.fillStyle === COLORS.PIPE || ctx.fillStyle === COLORS.PIPE_ACCENT) {
      correctColor = true;
    }
  };
  
  renderer.drawPipes(pipes);
  
  // Should draw: 2 pipes × (top section + bottom section + 2 caps) = 8 rectangles minimum
  if (fillRectCallCount >= 8 && correctColor) {
    console.log('✓ Test 6 passed: Pipes rendered correctly');
  } else {
    console.error('✗ Test 6 failed: Pipe rendering incorrect');
    console.error(`  fillRect call count: ${fillRectCallCount} (expected >= 8)`);
    console.error(`  Correct color: ${correctColor}`);
  }
}

// Test 7: drawPipes handles empty pipe array
{
  const { canvas, ctx } = createMockCanvas();
  const renderer = new Renderer(canvas);
  
  let fillRectCalled = false;
  ctx.fillRect = () => { fillRectCalled = true; };
  
  renderer.drawPipes([]);
  
  if (!fillRectCalled) {
    console.log('✓ Test 7 passed: Empty pipe array handled correctly');
  } else {
    console.error('✗ Test 7 failed: fillRect called with empty pipe array');
  }
}

// Test Suite: Score Rendering
console.log('\n=== Score Rendering Tests ===');

// Test 8: drawScore displays score with text shadow
{
  const { canvas, ctx } = createMockCanvas();
  const renderer = new Renderer(canvas);
  
  let fillTextCallCount = 0;
  let correctText = false;
  let shadowDrawn = false;
  let textDrawn = false;
  
  ctx.fillText = (text, x, y) => {
    fillTextCallCount++;
    if (text === '42') {
      correctText = true;
      if (ctx.fillStyle === COLORS.TEXT_SHADOW) {
        shadowDrawn = true;
      } else if (ctx.fillStyle === COLORS.TEXT) {
        textDrawn = true;
      }
    }
  };
  
  renderer.drawScore(42);
  
  if (fillTextCallCount === 2 && correctText && shadowDrawn && textDrawn) {
    console.log('✓ Test 8 passed: Score rendered with text shadow');
  } else {
    console.error('✗ Test 8 failed: Score rendering incorrect');
    console.error(`  fillText call count: ${fillTextCallCount} (expected 2)`);
    console.error(`  Correct text: ${correctText}`);
    console.error(`  Shadow drawn: ${shadowDrawn}`);
    console.error(`  Text drawn: ${textDrawn}`);
  }
}

// Test Suite: Menu Rendering
console.log('\n=== Menu Rendering Tests ===');

// Test 9: drawMenu displays title, button, and high score
{
  const { canvas, ctx } = createMockCanvas();
  const renderer = new Renderer(canvas);
  
  let titleDrawn = false;
  let buttonDrawn = false;
  let highScoreDrawn = false;
  let fillRectCalled = false;
  let strokeRectCalled = false;
  
  ctx.fillText = (text, x, y) => {
    if (text === 'Flappy Kiro') titleDrawn = true;
    if (text === 'Start Game') buttonDrawn = true;
    if (text.includes('High Score: 100')) highScoreDrawn = true;
  };
  
  ctx.fillRect = () => { fillRectCalled = true; };
  ctx.strokeRect = () => { strokeRectCalled = true; };
  
  renderer.drawMenu(100);
  
  if (titleDrawn && buttonDrawn && highScoreDrawn && fillRectCalled && strokeRectCalled) {
    console.log('✓ Test 9 passed: Menu screen rendered correctly');
  } else {
    console.error('✗ Test 9 failed: Menu rendering incomplete');
    console.error(`  Title drawn: ${titleDrawn}`);
    console.error(`  Button drawn: ${buttonDrawn}`);
    console.error(`  High score drawn: ${highScoreDrawn}`);
    console.error(`  Button background drawn: ${fillRectCalled}`);
    console.error(`  Button border drawn: ${strokeRectCalled}`);
  }
}

// Test Suite: Game Over Rendering
console.log('\n=== Game Over Rendering Tests ===');

// Test 10: drawGameOver displays all required elements
{
  const { canvas, ctx } = createMockCanvas();
  const renderer = new Renderer(canvas);
  
  let gameOverTextDrawn = false;
  let scoreDrawn = false;
  let highScoreDrawn = false;
  let restartButtonDrawn = false;
  let overlayDrawn = false;
  
  ctx.fillText = (text, x, y) => {
    if (text === 'Game Over') gameOverTextDrawn = true;
    if (text === 'Score: 42') scoreDrawn = true;
    if (text === 'High Score: 100') highScoreDrawn = true;
    if (text === 'Restart') restartButtonDrawn = true;
  };
  
  ctx.fillRect = (x, y, width, height) => {
    if (x === 0 && y === 0 && width === SCREEN.WIDTH && height === SCREEN.HEIGHT) {
      overlayDrawn = true;
    }
  };
  
  renderer.drawGameOver(42, 100);
  
  if (gameOverTextDrawn && scoreDrawn && highScoreDrawn && restartButtonDrawn && overlayDrawn) {
    console.log('✓ Test 10 passed: Game over screen rendered correctly');
  } else {
    console.error('✗ Test 10 failed: Game over rendering incomplete');
    console.error(`  Game Over text: ${gameOverTextDrawn}`);
    console.error(`  Score: ${scoreDrawn}`);
    console.error(`  High score: ${highScoreDrawn}`);
    console.error(`  Restart button: ${restartButtonDrawn}`);
    console.error(`  Overlay: ${overlayDrawn}`);
  }
}

// Test Suite: Render Method
console.log('\n=== Render Method Tests ===');

// Test 11: render() calls correct methods for Playing state
{
  const { canvas, ctx } = createMockCanvas();
  const renderer = new Renderer(canvas);
  
  // Mock AssetLoader
  AssetLoader.getAsset = () => ({ width: 32, height: 32 });
  
  let backgroundDrawn = false;
  let pipesDrawn = false;
  let ghostDrawn = false;
  let scoreDrawn = false;
  
  const originalDrawBackground = renderer.drawBackground;
  const originalDrawPipes = renderer.drawPipes;
  const originalDrawGhost = renderer.drawGhost;
  const originalDrawScore = renderer.drawScore;
  
  renderer.drawBackground = () => { backgroundDrawn = true; originalDrawBackground.call(renderer); };
  renderer.drawPipes = () => { pipesDrawn = true; };
  renderer.drawGhost = () => { ghostDrawn = true; };
  renderer.drawScore = () => { scoreDrawn = true; };
  
  const pipes = [{ x: 400, topY: 150, gapY: 150, width: 80, gapSize: 120 }];
  renderer.render(GAME_STATE.PLAYING, { x: 100, y: 300 }, pipes, 5, 10);
  
  if (backgroundDrawn && pipesDrawn && ghostDrawn && scoreDrawn) {
    console.log('✓ Test 11 passed: Playing state renders correctly');
  } else {
    console.error('✗ Test 11 failed: Playing state rendering incomplete');
    console.error(`  Background: ${backgroundDrawn}`);
    console.error(`  Pipes: ${pipesDrawn}`);
    console.error(`  Ghost: ${ghostDrawn}`);
    console.error(`  Score: ${scoreDrawn}`);
  }
}

// Test 12: render() calls correct methods for Menu state
{
  const { canvas, ctx } = createMockCanvas();
  const renderer = new Renderer(canvas);
  
  let backgroundDrawn = false;
  let menuDrawn = false;
  
  const originalDrawBackground = renderer.drawBackground;
  const originalDrawMenu = renderer.drawMenu;
  
  renderer.drawBackground = () => { backgroundDrawn = true; originalDrawBackground.call(renderer); };
  renderer.drawMenu = () => { menuDrawn = true; };
  
  renderer.render(GAME_STATE.MENU, { x: 100, y: 300 }, [], 0, 10);
  
  if (backgroundDrawn && menuDrawn) {
    console.log('✓ Test 12 passed: Menu state renders correctly');
  } else {
    console.error('✗ Test 12 failed: Menu state rendering incomplete');
    console.error(`  Background: ${backgroundDrawn}`);
    console.error(`  Menu: ${menuDrawn}`);
  }
}

// Test 13: render() calls correct methods for GameOver state
{
  const { canvas, ctx } = createMockCanvas();
  const renderer = new Renderer(canvas);
  
  // Mock AssetLoader
  AssetLoader.getAsset = () => ({ width: 32, height: 32 });
  
  let backgroundDrawn = false;
  let pipesDrawn = false;
  let ghostDrawn = false;
  let gameOverDrawn = false;
  
  const originalDrawBackground = renderer.drawBackground;
  const originalDrawPipes = renderer.drawPipes;
  const originalDrawGhost = renderer.drawGhost;
  const originalDrawGameOver = renderer.drawGameOver;
  
  renderer.drawBackground = () => { backgroundDrawn = true; originalDrawBackground.call(renderer); };
  renderer.drawPipes = () => { pipesDrawn = true; };
  renderer.drawGhost = () => { ghostDrawn = true; };
  renderer.drawGameOver = () => { gameOverDrawn = true; };
  
  const pipes = [{ x: 400, topY: 150, gapY: 150, width: 80, gapSize: 120 }];
  renderer.render(GAME_STATE.GAME_OVER, { x: 100, y: 300 }, pipes, 5, 10);
  
  if (backgroundDrawn && pipesDrawn && ghostDrawn && gameOverDrawn) {
    console.log('✓ Test 13 passed: GameOver state renders correctly');
  } else {
    console.error('✗ Test 13 failed: GameOver state rendering incomplete');
    console.error(`  Background: ${backgroundDrawn}`);
    console.error(`  Pipes: ${pipesDrawn}`);
    console.error(`  Ghost: ${ghostDrawn}`);
    console.error(`  Game Over: ${gameOverDrawn}`);
  }
}

// Test Suite: Rendering Order
console.log('\n=== Rendering Order Tests ===');

// Test 14: Verify rendering order (background → pipes → ghost → UI)
{
  const { canvas, ctx } = createMockCanvas();
  const renderer = new Renderer(canvas);
  
  // Mock AssetLoader
  AssetLoader.getAsset = () => ({ width: 32, height: 32 });
  
  const renderOrder = [];
  
  const originalDrawBackground = renderer.drawBackground;
  const originalDrawPipes = renderer.drawPipes;
  const originalDrawGhost = renderer.drawGhost;
  const originalDrawScore = renderer.drawScore;
  
  renderer.drawBackground = () => { renderOrder.push('background'); originalDrawBackground.call(renderer); };
  renderer.drawPipes = () => { renderOrder.push('pipes'); };
  renderer.drawGhost = () => { renderOrder.push('ghost'); };
  renderer.drawScore = () => { renderOrder.push('score'); };
  
  const pipes = [{ x: 400, topY: 150, gapY: 150, width: 80, gapSize: 120 }];
  renderer.render(GAME_STATE.PLAYING, { x: 100, y: 300 }, pipes, 5, 10);
  
  const expectedOrder = ['background', 'pipes', 'ghost', 'score'];
  const orderCorrect = JSON.stringify(renderOrder) === JSON.stringify(expectedOrder);
  
  if (orderCorrect) {
    console.log('✓ Test 14 passed: Rendering order is correct');
  } else {
    console.error('✗ Test 14 failed: Rendering order incorrect');
    console.error(`  Expected: ${expectedOrder.join(' → ')}`);
    console.error(`  Got: ${renderOrder.join(' → ')}`);
  }
}

console.log('\n=== All Renderer Tests Complete ===');
