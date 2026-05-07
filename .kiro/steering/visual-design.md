# Visual Design Steering for Flappy Kiro

## Overview

This steering document provides comprehensive guidance on sprite rendering, animation systems, and visual effects for Flappy Kiro. It covers character animations, environmental textures, parallax effects, canvas optimization, and visual feedback patterns to create a polished retro arcade experience.

---

## Part 1: Sprite Rendering Patterns

### Ghosty Character Rendering

#### Base Sprite Properties
- **Dimensions**: 32x32 pixels
- **Format**: PNG with transparency
- **Color Palette**: White ghost with black eyes (retro style)
- **Anchor Point**: Center of sprite (16, 16)

#### Rendering Implementation

```javascript
// Basic sprite rendering
function drawGhost(ctx, x, y, ghostSprite, scale = 1) {
  const width = 32 * scale;
  const height = 32 * scale;
  
  // Center the sprite on the ghost position
  ctx.drawImage(
    ghostSprite,
    x - width / 2,
    y - height / 2,
    width,
    height
  );
}

// Sprite rendering with rotation (optional enhancement)
function drawGhostRotated(ctx, x, y, ghostSprite, rotation = 0, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  const width = 32 * scale;
  const height = 32 * scale;
  
  ctx.drawImage(
    ghostSprite,
    -width / 2,
    -height / 2,
    width,
    height
  );
  
  ctx.restore();
}

// Sprite rendering with opacity (for fade effects)
function drawGhostWithOpacity(ctx, x, y, ghostSprite, opacity = 1, scale = 1) {
  ctx.save();
  ctx.globalAlpha = opacity;
  
  const width = 32 * scale;
  const height = 32 * scale;
  
  ctx.drawImage(
    ghostSprite,
    x - width / 2,
    y - height / 2,
    width,
    height
  );
  
  ctx.restore();
}
```

#### Sprite Quality Considerations

- **Pixel-Perfect Rendering**: Disable image smoothing for retro aesthetic
  ```javascript
  ctx.imageSmoothingEnabled = false;
  ```

- **Scaling**: Use integer multiples (1x, 2x, 3x) to maintain pixel-perfect appearance
  - Avoid fractional scaling that causes blurring
  - Use `Math.floor()` for position calculations

- **Transparency**: Ensure PNG has proper alpha channel
  - Test on light blue background for visibility
  - Verify no anti-aliasing artifacts around edges

---

## Part 2: Animation Systems

### Ghosty Character Animations

#### Animation States

The ghost character should have multiple animation states to enhance visual feedback:

1. **Idle Animation** (Menu/Game Over)
   - Gentle floating motion
   - 2-3 frame loop
   - Duration: 1 second per cycle

2. **Flying Animation** (During gameplay)
   - Slight wing flutter or body movement
   - 2-4 frame loop
   - Duration: 0.5 seconds per cycle
   - Responds to jump input with visual feedback

3. **Falling Animation** (High velocity downward)
   - Stretched or tilted appearance
   - Indicates danger to player
   - Triggers when velocity exceeds threshold

4. **Hit Animation** (Collision)
   - Brief flash or shake
   - 3-4 frames
   - Duration: 0.2 seconds
   - Plays before game over screen

#### Animation Frame Structure

```javascript
// Animation frame definition
const ghostAnimations = {
  idle: {
    frames: [0, 1, 2, 1],  // Frame indices in sprite sheet
    duration: 250,          // ms per frame
    loop: true
  },
  flying: {
    frames: [0, 1],
    duration: 150,
    loop: true
  },
  falling: {
    frames: [2, 3],
    duration: 100,
    loop: true
  },
  hit: {
    frames: [4, 5, 4, 5],
    duration: 50,
    loop: false
  }
};

// Animation controller
class AnimationController {
  constructor(sprite, animations) {
    this.sprite = sprite;
    this.animations = animations;
    this.currentAnimation = 'idle';
    this.currentFrame = 0;
    this.elapsedTime = 0;
  }
  
  setAnimation(name) {
    if (this.currentAnimation !== name) {
      this.currentAnimation = name;
      this.currentFrame = 0;
      this.elapsedTime = 0;
    }
  }
  
  update(deltaTime) {
    const animation = this.animations[this.currentAnimation];
    this.elapsedTime += deltaTime;
    
    if (this.elapsedTime >= animation.duration) {
      this.elapsedTime = 0;
      this.currentFrame++;
      
      if (this.currentFrame >= animation.frames.length) {
        if (animation.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = animation.frames.length - 1;
        }
      }
    }
  }
  
  getCurrentFrame() {
    const animation = this.animations[this.currentAnimation];
    return animation.frames[this.currentFrame];
  }
}
```

#### Animation Triggers

```javascript
// Update animation based on game state and physics
function updateGhostAnimation(animController, velocity, gameState) {
  if (gameState === 'Menu' || gameState === 'GameOver') {
    animController.setAnimation('idle');
  } else if (gameState === 'Playing') {
    // Falling animation when velocity is high
    if (velocity.vy > 8) {
      animController.setAnimation('falling');
    } else {
      animController.setAnimation('flying');
    }
  }
}
```

### Pipe Animation

#### Pipe Movement
- Pipes move smoothly leftward at constant speed
- No animation frames needed; movement is handled by position updates
- Visual feedback: Slight color variation or shading to indicate depth

#### Pipe Rendering

```javascript
function drawPipe(ctx, pipe, pipeColor = '#228B22') {
  // Top pipe section
  ctx.fillStyle = pipeColor;
  ctx.fillRect(pipe.x, 0, pipe.width, pipe.topY);
  
  // Bottom pipe section
  ctx.fillRect(pipe.x, pipe.gapY + pipe.gapSize, pipe.width, 600 - (pipe.gapY + pipe.gapSize));
  
  // Optional: Add pipe cap for visual polish
  ctx.fillStyle = '#1a6b1a';  // Darker green
  ctx.fillRect(pipe.x - 4, pipe.topY - 8, pipe.width + 8, 8);
  ctx.fillRect(pipe.x - 4, pipe.gapY + pipe.gapSize, pipe.width + 8, 8);
}
```

---

## Part 3: Wall Textures and Environmental Design

### Pipe Textures

#### Texture Patterns

1. **Solid Green** (Default)
   - Color: `#228B22` (Forest Green)
   - Simple and retro
   - High contrast with light blue background

2. **Striped Pattern** (Optional Enhancement)
   - Vertical stripes for depth
   - Pattern: 2px green, 2px darker green
   - Adds visual interest without complexity

3. **Gradient Shading** (Optional Enhancement)
   - Subtle gradient from top to bottom
   - Creates 3D appearance
   - Darker at edges, lighter in center

#### Texture Implementation

```javascript
// Solid texture (default)
function drawPipeSolid(ctx, pipe) {
  ctx.fillStyle = '#228B22';
  ctx.fillRect(pipe.x, 0, pipe.width, pipe.topY);
  ctx.fillRect(pipe.x, pipe.gapY + pipe.gapSize, pipe.width, 600 - (pipe.gapY + pipe.gapSize));
}

// Striped texture
function drawPipeStriped(ctx, pipe) {
  const stripeWidth = 2;
  
  // Top pipe
  for (let i = 0; i < pipe.topY; i += stripeWidth * 2) {
    ctx.fillStyle = '#228B22';
    ctx.fillRect(pipe.x, i, pipe.width, stripeWidth);
    ctx.fillStyle = '#1a6b1a';
    ctx.fillRect(pipe.x, i + stripeWidth, pipe.width, stripeWidth);
  }
  
  // Bottom pipe
  const bottomStart = pipe.gapY + pipe.gapSize;
  for (let i = bottomStart; i < 600; i += stripeWidth * 2) {
    ctx.fillStyle = '#228B22';
    ctx.fillRect(pipe.x, i, pipe.width, stripeWidth);
    ctx.fillStyle = '#1a6b1a';
    ctx.fillRect(pipe.x, i + stripeWidth, pipe.width, stripeWidth);
  }
}

// Gradient texture
function drawPipeGradient(ctx, pipe) {
  // Top pipe gradient
  const topGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
  topGradient.addColorStop(0, '#1a6b1a');
  topGradient.addColorStop(0.5, '#228B22');
  topGradient.addColorStop(1, '#1a6b1a');
  
  ctx.fillStyle = topGradient;
  ctx.fillRect(pipe.x, 0, pipe.width, pipe.topY);
  
  // Bottom pipe gradient
  ctx.fillStyle = topGradient;
  ctx.fillRect(pipe.x, pipe.gapY + pipe.gapSize, pipe.width, 600 - (pipe.gapY + pipe.gapSize));
}
```

### Background Design

#### Background Layers

1. **Primary Background** (Static)
   - Color: `#87CEEB` (Sky Blue)
   - Fills entire canvas
   - Rendered first (back layer)

2. **Optional: Cloud Layer** (Parallax)
   - White clouds with slight transparency
   - Moves slower than pipes
   - Adds depth perception

3. **Optional: Grid Pattern** (Subtle)
   - Very faint grid overlay
   - Suggests retro arcade aesthetic
   - Opacity: 5-10%

#### Background Implementation

```javascript
// Basic background
function drawBackground(ctx, width, height) {
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, width, height);
}

// Background with clouds (parallax)
class CloudLayer {
  constructor(screenWidth, screenHeight) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.clouds = this.generateClouds();
    this.offset = 0;
  }
  
  generateClouds() {
    const clouds = [];
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: Math.random() * this.screenWidth,
        y: Math.random() * (this.screenHeight * 0.3),
        width: 60 + Math.random() * 40,
        height: 30 + Math.random() * 20
      });
    }
    return clouds;
  }
  
  update(pipeSpeed) {
    // Clouds move at 30% of pipe speed (parallax effect)
    this.offset += pipeSpeed * 0.3;
    
    if (this.offset > this.screenWidth) {
      this.offset = 0;
    }
  }
  
  draw(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    
    for (const cloud of this.clouds) {
      const x = (cloud.x - this.offset) % this.screenWidth;
      
      // Draw cloud shape (simple circles)
      ctx.beginPath();
      ctx.arc(x, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
      ctx.arc(x + cloud.width * 0.3, cloud.y - cloud.height * 0.2, cloud.width * 0.4, 0, Math.PI * 2);
      ctx.arc(x + cloud.width * 0.6, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Background with grid pattern
function drawBackgroundWithGrid(ctx, width, height) {
  // Base background
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, width, height);
  
  // Grid overlay
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.lineWidth = 1;
  
  const gridSize = 40;
  
  // Vertical lines
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}
```

---

## Part 4: Parallax Effects

### Parallax Scrolling

Parallax creates depth by moving background elements at different speeds relative to the foreground.

#### Implementation Strategy

```javascript
class ParallaxLayer {
  constructor(speed, screenWidth, screenHeight) {
    this.speed = speed;           // 0.0 to 1.0 (fraction of pipe speed)
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.offset = 0;
  }
  
  update(pipeSpeed) {
    this.offset += pipeSpeed * this.speed;
  }
  
  getOffset() {
    return this.offset % this.screenWidth;
  }
}

// Multi-layer parallax system
class ParallaxSystem {
  constructor(screenWidth, screenHeight) {
    this.layers = [
      new ParallaxLayer(0.1, screenWidth, screenHeight),  // Far background
      new ParallaxLayer(0.3, screenWidth, screenHeight),  // Mid background
      new ParallaxLayer(0.6, screenWidth, screenHeight),  // Near background
      new ParallaxLayer(1.0, screenWidth, screenHeight)   // Pipes (full speed)
    ];
  }
  
  update(pipeSpeed) {
    for (const layer of this.layers) {
      layer.update(pipeSpeed);
    }
  }
  
  getLayerOffset(layerIndex) {
    return this.layers[layerIndex].getOffset();
  }
}
```

#### Parallax Layer Speeds

- **Far Background** (Stars/Mountains): 0.1x pipe speed
- **Mid Background** (Clouds): 0.3x pipe speed
- **Near Background** (Foreground elements): 0.6x pipe speed
- **Pipes**: 1.0x pipe speed (full speed)

---

## Part 5: Canvas Drawing Optimization

### Performance Best Practices

#### 1. Minimize Context State Changes

```javascript
// BAD: Multiple state changes
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 100, 100);
ctx.fillStyle = 'blue';
ctx.fillRect(100, 0, 100, 100);

// GOOD: Batch similar operations
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 100, 100);
ctx.fillRect(200, 0, 100, 100);
ctx.fillStyle = 'blue';
ctx.fillRect(100, 0, 100, 100);
```

#### 2. Use Appropriate Drawing Methods

```javascript
// For rectangles: Use fillRect (faster than path)
ctx.fillRect(x, y, width, height);

// For circles: Use arc path (necessary for circles)
ctx.beginPath();
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fill();

// For text: Cache text measurements
const textMetrics = ctx.measureText(text);
const textWidth = textMetrics.width;
```

#### 3. Disable Image Smoothing for Pixel Art

```javascript
// Disable smoothing for retro aesthetic
ctx.imageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
```

#### 4. Batch Rendering Operations

```javascript
// Render in order: background → pipes → ghost → UI
function render(ctx, gameState) {
  // Background (once per frame)
  drawBackground(ctx);
  
  // Parallax layers (if used)
  drawParallaxLayers(ctx);
  
  // Pipes (batch all pipes)
  for (const pipe of pipes) {
    drawPipe(ctx, pipe);
  }
  
  // Ghost (single sprite)
  drawGhost(ctx, ghostPos);
  
  // UI (text, score)
  drawUI(ctx, score, highScore);
}
```

#### 5. Avoid Expensive Operations in Game Loop

```javascript
// BAD: Creating new objects every frame
function update() {
  const gradient = ctx.createLinearGradient(...);  // Expensive
  ctx.fillStyle = gradient;
}

// GOOD: Create once, reuse
const gradient = ctx.createLinearGradient(...);
function update() {
  ctx.fillStyle = gradient;
}
```

#### 6. Use RequestAnimationFrame

```javascript
// Automatically syncs with browser refresh rate (60 FPS)
function gameLoop(timestamp) {
  update(timestamp);
  render();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

---

## Part 6: Sprite Atlas Usage

### Sprite Sheet Organization

For games with multiple sprites, use a sprite sheet (atlas) to reduce HTTP requests and improve performance.

#### Sprite Sheet Layout

```
┌─────────────────────────────────────┐
│  Ghost Idle  │  Ghost Flying       │
│  (32x32)     │  (32x32)            │
├─────────────────────────────────────┤
│  Ghost Falling │  Ghost Hit        │
│  (32x32)       │  (32x32)          │
├─────────────────────────────────────┤
│  Pipe Top    │  Pipe Bottom       │
│  (80x100)    │  (80x100)          │
└─────────────────────────────────────┘
```

#### Sprite Sheet Implementation

```javascript
class SpriteSheet {
  constructor(image, frameWidth, frameHeight) {
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.framesPerRow = Math.floor(image.width / frameWidth);
  }
  
  drawFrame(ctx, frameIndex, x, y, width, height) {
    const col = frameIndex % this.framesPerRow;
    const row = Math.floor(frameIndex / this.framesPerRow);
    
    const sourceX = col * this.frameWidth;
    const sourceY = row * this.frameHeight;
    
    ctx.drawImage(
      this.image,
      sourceX, sourceY,
      this.frameWidth, this.frameHeight,
      x - width / 2, y - height / 2,
      width, height
    );
  }
}

// Usage
const ghostSheet = new SpriteSheet(ghostImage, 32, 32);
ghostSheet.drawFrame(ctx, 0, ghostX, ghostY, 32, 32);  // Frame 0
ghostSheet.drawFrame(ctx, 1, ghostX, ghostY, 32, 32);  // Frame 1
```

#### Benefits

- **Reduced HTTP Requests**: One image file instead of multiple
- **Better Caching**: Browser caches single sprite sheet
- **Faster Loading**: Fewer network round trips
- **Memory Efficiency**: Single image in memory

---

## Part 7: Visual Feedback Patterns

### Score Increment Feedback

When the player passes through a pipe, provide visual feedback:

```javascript
class ScoreFeedback {
  constructor(x, y, score) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.duration = 1000;  // 1 second
    this.elapsedTime = 0;
    this.active = true;
  }
  
  update(deltaTime) {
    this.elapsedTime += deltaTime;
    this.y -= 1;  // Float upward
    
    if (this.elapsedTime >= this.duration) {
      this.active = false;
    }
  }
  
  draw(ctx) {
    const opacity = 1 - (this.elapsedTime / this.duration);
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#FFD700';  // Gold
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`+1`, this.x, this.y);
    ctx.restore();
  }
}
```

### Collision Feedback

Visual feedback when collision occurs:

```javascript
class CollisionEffect {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.duration = 200;  // 0.2 seconds
    this.elapsedTime = 0;
    this.active = true;
  }
  
  update(deltaTime) {
    this.elapsedTime += deltaTime;
    
    if (this.elapsedTime >= this.duration) {
      this.active = false;
    }
  }
  
  draw(ctx) {
    const progress = this.elapsedTime / this.duration;
    const radius = 20 + progress * 30;
    const opacity = 1 - progress;
    
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = '#FF6B6B';  // Red
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
```

### Screen Shake Effect

Subtle screen shake on collision for impact feedback:

```javascript
class ScreenShake {
  constructor(intensity = 5, duration = 200) {
    this.intensity = intensity;
    this.duration = duration;
    this.elapsedTime = 0;
    this.active = true;
  }
  
  update(deltaTime) {
    this.elapsedTime += deltaTime;
    
    if (this.elapsedTime >= this.duration) {
      this.active = false;
    }
  }
  
  getOffset() {
    if (!this.active) return { x: 0, y: 0 };
    
    const progress = this.elapsedTime / this.duration;
    const intensity = this.intensity * (1 - progress);
    
    return {
      x: (Math.random() - 0.5) * intensity * 2,
      y: (Math.random() - 0.5) * intensity * 2
    };
  }
}

// Apply shake to canvas
function render(ctx, gameState, screenShake) {
  const shake = screenShake.getOffset();
  ctx.save();
  ctx.translate(shake.x, shake.y);
  
  // Render game
  drawBackground(ctx);
  drawPipes(ctx);
  drawGhost(ctx);
  
  ctx.restore();
}
```

### UI Animation Patterns

#### Button Hover Effect

```javascript
class Button {
  constructor(x, y, width, height, text) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
    this.hovered = false;
    this.scale = 1;
  }
  
  update(mouseX, mouseY) {
    this.hovered = this.isPointInside(mouseX, mouseY);
    
    // Smooth scale animation
    const targetScale = this.hovered ? 1.1 : 1;
    this.scale += (targetScale - this.scale) * 0.1;
  }
  
  isPointInside(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }
  
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-(this.width / 2), -(this.height / 2));
    
    // Draw button background
    ctx.fillStyle = this.hovered ? '#4CAF50' : '#45a049';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw button text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.width / 2, this.height / 2);
    
    ctx.restore();
  }
}
```

#### Score Display Animation

```javascript
class ScoreDisplay {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.score = 0;
    this.displayScore = 0;
    this.animationSpeed = 0.1;
  }
  
  setScore(newScore) {
    this.score = newScore;
  }
  
  update() {
    // Smooth animation from displayScore to score
    this.displayScore += (this.score - this.displayScore) * this.animationSpeed;
  }
  
  draw(ctx) {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Score: ${Math.floor(this.displayScore)}`, this.x, this.y);
  }
}
```

---

## Part 8: Color Palette Reference

### Primary Colors

- **Background**: `#87CEEB` (Sky Blue)
- **Pipes**: `#228B22` (Forest Green)
- **Pipe Accent**: `#1a6b1a` (Dark Green)
- **Ghost**: `#FFFFFF` (White)
- **Ghost Eyes**: `#000000` (Black)

### Accent Colors

- **Score Feedback**: `#FFD700` (Gold)
- **Collision Effect**: `#FF6B6B` (Red)
- **Button Hover**: `#4CAF50` (Green)
- **Text**: `#FFFFFF` (White)
- **Text Shadow**: `#000000` (Black, opacity 0.5)

### Optional Enhancement Colors

- **Cloud**: `#FFFFFF` (White, opacity 0.3)
- **Grid**: `#000000` (Black, opacity 0.05)
- **Parallax Layer 1**: `#B0E0E6` (Powder Blue)
- **Parallax Layer 2**: `#ADD8E6` (Light Blue)

---

## Part 9: Animation Timing Guidelines

### Frame Rates and Durations

- **Game Loop**: 60 FPS (16.67 ms per frame)
- **Ghost Idle Animation**: 1000 ms per cycle (4 frames = 250 ms each)
- **Ghost Flying Animation**: 500 ms per cycle (2 frames = 250 ms each)
- **Ghost Falling Animation**: 200 ms per cycle (2 frames = 100 ms each)
- **Collision Effect**: 200 ms total duration
- **Score Feedback**: 1000 ms total duration
- **Screen Shake**: 200 ms total duration
- **Button Hover**: 100 ms transition time

### Easing Functions

```javascript
// Linear easing (no acceleration)
function easeLinear(t) {
  return t;
}

// Ease-out (deceleration)
function easeOutQuad(t) {
  return t * (2 - t);
}

// Ease-in-out (acceleration then deceleration)
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Apply easing to animation
function animateValue(startValue, endValue, duration, elapsedTime, easingFunction) {
  const t = Math.min(elapsedTime / duration, 1);
  const eased = easingFunction(t);
  return startValue + (endValue - startValue) * eased;
}
```

---

## Part 10: Accessibility Considerations

### Visual Accessibility

1. **Color Contrast**: Ensure sufficient contrast between elements
   - Ghost (white) on background (light blue): Good contrast
   - Text (white) on background: Good contrast
   - Consider colorblind-friendly palette

2. **Text Readability**:
   - Use sans-serif fonts (Arial, Helvetica)
   - Minimum font size: 16px for body text
   - Add text shadow for readability on complex backgrounds

3. **Animation Considerations**:
   - Avoid rapid flashing (> 3 Hz) to prevent seizures
   - Provide option to reduce motion for accessibility
   - Ensure animations don't interfere with gameplay

### Implementation Example

```javascript
// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function getAnimationDuration(normalDuration) {
  return prefersReducedMotion ? normalDuration * 0.5 : normalDuration;
}
```

---

## Summary

This steering document provides comprehensive guidance for implementing polished visual design in Flappy Kiro:

- **Sprite Rendering**: Pixel-perfect rendering with proper scaling and transparency
- **Animation Systems**: Multiple animation states with smooth transitions
- **Environmental Design**: Textured pipes and parallax backgrounds
- **Canvas Optimization**: Performance best practices for smooth 60 FPS gameplay
- **Visual Feedback**: Score increments, collision effects, and screen shake
- **Accessibility**: Color contrast and motion preferences

Follow these patterns to create a visually polished, performant, and accessible retro arcade experience.
