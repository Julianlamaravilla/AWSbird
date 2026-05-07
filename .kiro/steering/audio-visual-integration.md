# Audio-Visual Integration Steering for Flappy Kiro

## Overview

This steering document provides comprehensive guidance on integrating audio and visual feedback systems in Flappy Kiro. It covers sound effect implementation, screen shake mechanics, UI animation patterns, and synchronized audio-visual feedback to create an immersive arcade experience.

---

## Part 1: Sound Effect Integration

### Audio Asset Management

#### Audio Files

1. **jump.wav**
   - Duration: ~100-200ms
   - Format: WAV (uncompressed for low latency)
   - Sample Rate: 44.1 kHz
   - Bit Depth: 16-bit
   - Channels: Mono
   - Volume: Normalized to -3dB (prevent clipping)

2. **game_over.wav**
   - Duration: ~300-500ms
   - Format: WAV (uncompressed for low latency)
   - Sample Rate: 44.1 kHz
   - Bit Depth: 16-bit
   - Channels: Mono
   - Volume: Normalized to -3dB

#### Audio Context Initialization

```javascript
class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.masterVolume = 1.0;
    this.initialized = false;
  }
  
  // Initialize audio context (requires user interaction)
  async init() {
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // Resume audio context if suspended (required by browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.initialized = true;
      console.log('Audio context initialized');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      this.initialized = false;
    }
  }
  
  // Load audio file
  async loadSound(name, url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds[name] = audioBuffer;
      console.log(`Loaded sound: ${name}`);
    } catch (error) {
      console.error(`Failed to load sound ${name}:`, error);
    }
  }
  
  // Play sound with volume control
  playSound(name, volume = 1.0) {
    if (!this.initialized || !this.sounds[name]) {
      console.warn(`Sound not available: ${name}`);
      return;
    }
    
    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.sounds[name];
      gainNode.gain.value = volume * this.masterVolume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start(0);
    } catch (error) {
      console.error(`Failed to play sound ${name}:`, error);
    }
  }
  
  // Set master volume (0.0 to 1.0)
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
  
  // Mute/unmute
  setMuted(muted) {
    this.masterVolume = muted ? 0 : 1;
  }
}
```

### Sound Effect Triggers

#### Jump Sound

```javascript
// Play jump sound when player jumps
function handleJumpInput(audioEngine, physics) {
  physics.applyJump();
  audioEngine.playSound('jump', 0.7);  // 70% volume
}
```

**Timing**: Immediate (same frame as input)
**Volume**: 0.7 (70% of master volume)
**Frequency**: Multiple times per second (player can jump repeatedly)

#### Game Over Sound

```javascript
// Play game over sound on collision
function handleCollision(audioEngine, gameState) {
  gameState.transitionToGameOver();
  audioEngine.playSound('game_over', 0.8);  // 80% volume
}
```

**Timing**: Immediate (same frame as collision)
**Volume**: 0.8 (80% of master volume)
**Frequency**: Once per game session

### Audio Fallback Strategy

```javascript
class AudioEngineFallback {
  constructor() {
    this.audioElements = {};
    this.masterVolume = 1.0;
  }
  
  // Fallback using HTML5 Audio elements
  async loadSound(name, url) {
    try {
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.audioElements[name] = audio;
    } catch (error) {
      console.error(`Failed to load audio: ${name}`, error);
    }
  }
  
  playSound(name, volume = 1.0) {
    try {
      const audio = this.audioElements[name];
      if (audio) {
        audio.volume = volume * this.masterVolume;
        audio.currentTime = 0;
        audio.play().catch(err => console.warn('Audio playback failed:', err));
      }
    } catch (error) {
      console.error(`Failed to play sound ${name}:`, error);
    }
  }
  
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
}
```

---

## Part 2: Screen Shake Mechanics

### Screen Shake Implementation

Screen shake provides tactile feedback for collisions and impacts, enhancing the sense of impact.

#### Basic Screen Shake

```javascript
class ScreenShake {
  constructor(intensity = 5, duration = 200) {
    this.intensity = intensity;
    this.duration = duration;
    this.elapsedTime = 0;
    this.active = false;
  }
  
  trigger() {
    this.active = true;
    this.elapsedTime = 0;
  }
  
  update(deltaTime) {
    if (!this.active) return;
    
    this.elapsedTime += deltaTime;
    
    if (this.elapsedTime >= this.duration) {
      this.active = false;
    }
  }
  
  getOffset() {
    if (!this.active) return { x: 0, y: 0 };
    
    const progress = this.elapsedTime / this.duration;
    const intensity = this.intensity * (1 - progress);  // Decay over time
    
    return {
      x: (Math.random() - 0.5) * intensity * 2,
      y: (Math.random() - 0.5) * intensity * 2
    };
  }
}
```

#### Advanced Screen Shake with Easing

```javascript
class AdvancedScreenShake {
  constructor(intensity = 5, duration = 200, easing = 'easeOutQuad') {
    this.intensity = intensity;
    this.duration = duration;
    this.easing = easing;
    this.elapsedTime = 0;
    this.active = false;
  }
  
  trigger() {
    this.active = true;
    this.elapsedTime = 0;
  }
  
  update(deltaTime) {
    if (!this.active) return;
    
    this.elapsedTime += deltaTime;
    
    if (this.elapsedTime >= this.duration) {
      this.active = false;
    }
  }
  
  easeOutQuad(t) {
    return t * (2 - t);
  }
  
  getOffset() {
    if (!this.active) return { x: 0, y: 0 };
    
    const progress = this.elapsedTime / this.duration;
    const eased = this.easeOutQuad(1 - progress);  // Reverse for decay
    const intensity = this.intensity * eased;
    
    return {
      x: (Math.random() - 0.5) * intensity * 2,
      y: (Math.random() - 0.5) * intensity * 2
    };
  }
}
```

#### Applying Screen Shake to Canvas

```javascript
function render(ctx, gameState, screenShake) {
  const shake = screenShake.getOffset();
  
  ctx.save();
  ctx.translate(shake.x, shake.y);
  
  // Render all game elements
  drawBackground(ctx);
  drawPipes(ctx);
  drawGhost(ctx);
  drawUI(ctx);
  
  ctx.restore();
}
```

### Screen Shake Triggers

#### Collision Shake

```javascript
function handleCollision(audioEngine, screenShake, gameState) {
  gameState.transitionToGameOver();
  audioEngine.playSound('game_over', 0.8);
  screenShake.trigger();  // Intensity: 5, Duration: 200ms
}
```

**Intensity**: 5 pixels
**Duration**: 200ms
**Frequency**: Once per game session

#### Optional: Pipe Pass Shake (Subtle)

```javascript
function handlePipePass(screenShake) {
  // Very subtle shake on successful pipe pass
  const subtleShake = new ScreenShake(2, 100);  // Intensity: 2, Duration: 100ms
  subtleShake.trigger();
}
```

**Intensity**: 2 pixels (subtle)
**Duration**: 100ms
**Frequency**: Once per pipe passed

---

## Part 3: UI Animation Patterns

### Menu Screen Animations

#### Title Animation

```javascript
class TitleAnimation {
  constructor(x, y, text) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.scale = 0.8;
    this.targetScale = 1.0;
    this.opacity = 0;
    this.targetOpacity = 1;
    this.elapsedTime = 0;
    this.duration = 500;  // 0.5 seconds
  }
  
  update(deltaTime) {
    this.elapsedTime += deltaTime;
    
    if (this.elapsedTime < this.duration) {
      const progress = this.elapsedTime / this.duration;
      
      // Ease-out animation
      const eased = 1 - Math.pow(1 - progress, 3);
      
      this.scale = 0.8 + (this.targetScale - 0.8) * eased;
      this.opacity = this.targetOpacity * eased;
    } else {
      this.scale = this.targetScale;
      this.opacity = this.targetOpacity;
    }
  }
  
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-this.x, -this.y);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.x, this.y);
    
    ctx.restore();
  }
}
```

#### Button Animation

```javascript
class AnimatedButton {
  constructor(x, y, width, height, text) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
    this.hovered = false;
    this.scale = 1;
    this.targetScale = 1;
    this.opacity = 1;
    this.animationSpeed = 0.15;
  }
  
  update(mouseX, mouseY) {
    this.hovered = this.isPointInside(mouseX, mouseY);
    this.targetScale = this.hovered ? 1.1 : 1;
    
    // Smooth scale animation
    this.scale += (this.targetScale - this.scale) * this.animationSpeed;
  }
  
  isPointInside(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }
  
  draw(ctx) {
    ctx.save();
    
    // Apply scale transform
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-(this.width / 2), -(this.height / 2));
    
    // Draw button background
    ctx.fillStyle = this.hovered ? '#4CAF50' : '#45a049';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw button border
    ctx.strokeStyle = this.hovered ? '#66BB6A' : '#558B55';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.width, this.height);
    
    // Draw button text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.width / 2, this.height / 2);
    
    ctx.restore();
  }
}
```

### Score Display Animations

#### Animated Score Counter

```javascript
class AnimatedScoreDisplay {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.score = 0;
    this.displayScore = 0;
    this.targetScore = 0;
    this.animationSpeed = 0.1;
    this.scale = 1;
  }
  
  setScore(newScore) {
    this.targetScore = newScore;
  }
  
  update() {
    // Smooth animation from displayScore to targetScore
    this.displayScore += (this.targetScore - this.displayScore) * this.animationSpeed;
    
    // Slight scale pulse when score changes
    if (Math.abs(this.targetScore - this.score) > 0.5) {
      this.scale = 1.1;
    }
    
    this.scale += (1 - this.scale) * 0.1;
    
    if (Math.abs(this.displayScore - this.targetScore) < 0.1) {
      this.score = this.targetScore;
    }
  }
  
  draw(ctx) {
    ctx.save();
    
    // Apply scale for pulse effect
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-this.x, -this.y);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Score: ${Math.floor(this.displayScore)}`, this.x, this.y);
    
    ctx.restore();
  }
}
```

#### Score Increment Feedback

```javascript
class ScoreIncrementFeedback {
  constructor(x, y) {
    this.x = x;
    this.y = y;
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
    const progress = this.elapsedTime / this.duration;
    const opacity = 1 - progress;
    
    ctx.save();
    ctx.globalAlpha = opacity;
    
    // Scale effect
    const scale = 1 + progress * 0.5;
    ctx.translate(this.x, this.y);
    ctx.scale(scale, scale);
    ctx.translate(-this.x, -this.y);
    
    ctx.fillStyle = '#FFD700';  // Gold
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+1`, this.x, this.y);
    
    ctx.restore();
  }
}
```

### Game Over Screen Animation

```javascript
class GameOverScreen {
  constructor(score, highScore) {
    this.score = score;
    this.highScore = highScore;
    this.elapsedTime = 0;
    this.duration = 500;  // 0.5 seconds fade-in
    this.opacity = 0;
  }
  
  update(deltaTime) {
    this.elapsedTime += deltaTime;
    
    if (this.elapsedTime < this.duration) {
      this.opacity = this.elapsedTime / this.duration;
    } else {
      this.opacity = 1;
    }
  }
  
  draw(ctx, width, height) {
    ctx.save();
    
    // Semi-transparent overlay
    ctx.globalAlpha = this.opacity * 0.7;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    
    // Game Over text
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Game Over', width / 2, height / 2 - 60);
    
    // Score display
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`Score: ${this.score}`, width / 2, height / 2);
    ctx.fillText(`High Score: ${this.highScore}`, width / 2, height / 2 + 50);
    
    ctx.restore();
  }
}
```

---

## Part 4: Synchronized Audio-Visual Feedback

### Jump Feedback System

```javascript
class JumpFeedback {
  constructor(audioEngine, screenShake) {
    this.audioEngine = audioEngine;
    this.screenShake = screenShake;
  }
  
  trigger(ghostX, ghostY) {
    // Audio: Play jump sound
    this.audioEngine.playSound('jump', 0.7);
    
    // Visual: Optional subtle screen shake (very subtle)
    // Uncomment for more pronounced feedback
    // const subtleShake = new ScreenShake(1, 50);
    // subtleShake.trigger();
  }
}
```

### Collision Feedback System

```javascript
class CollisionFeedback {
  constructor(audioEngine, screenShake) {
    this.audioEngine = audioEngine;
    this.screenShake = screenShake;
    this.collisionEffects = [];
  }
  
  trigger(ghostX, ghostY) {
    // Audio: Play game over sound
    this.audioEngine.playSound('game_over', 0.8);
    
    // Visual: Screen shake
    this.screenShake.trigger();
    
    // Visual: Collision effect (expanding circle)
    this.collisionEffects.push(new CollisionEffect(ghostX, ghostY));
  }
  
  update(deltaTime) {
    this.collisionEffects = this.collisionEffects.filter(effect => {
      effect.update(deltaTime);
      return effect.active;
    });
  }
  
  draw(ctx) {
    for (const effect of this.collisionEffects) {
      effect.draw(ctx);
    }
  }
}

class CollisionEffect {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.duration = 200;
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

### Pipe Pass Feedback System

```javascript
class PipePassFeedback {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.feedbackEffects = [];
  }
  
  trigger(pipeX, gapY, gapSize) {
    // Optional: Play subtle sound (could be a different sound)
    // this.audioEngine.playSound('pipe_pass', 0.5);
    
    // Visual: Score increment feedback
    const centerY = gapY + gapSize / 2;
    this.feedbackEffects.push(new ScoreIncrementFeedback(pipeX, centerY));
  }
  
  update(deltaTime) {
    this.feedbackEffects = this.feedbackEffects.filter(effect => {
      effect.update(deltaTime);
      return effect.active;
    });
  }
  
  draw(ctx) {
    for (const effect of this.feedbackEffects) {
      effect.draw(ctx);
    }
  }
}
```

---

## Part 5: Audio-Visual Timing Synchronization

### Frame-Perfect Synchronization

```javascript
class AudioVisualSynchronizer {
  constructor(audioEngine, screenShake, collisionFeedback) {
    this.audioEngine = audioEngine;
    this.screenShake = screenShake;
    this.collisionFeedback = collisionFeedback;
  }
  
  // Ensure audio and visual feedback trigger simultaneously
  triggerCollisionFeedback(ghostX, ghostY) {
    // Both audio and visual trigger in the same frame
    this.audioEngine.playSound('game_over', 0.8);
    this.screenShake.trigger();
    this.collisionFeedback.trigger(ghostX, ghostY);
  }
  
  triggerJumpFeedback(ghostX, ghostY) {
    // Audio and visual feedback synchronized
    this.audioEngine.playSound('jump', 0.7);
    // Optional: Subtle visual feedback
  }
}
```

### Timing Constants

```javascript
const AUDIO_VISUAL_TIMING = {
  // Jump feedback
  JUMP_SOUND_DURATION: 150,      // ms
  JUMP_VISUAL_DURATION: 100,     // ms
  
  // Collision feedback
  COLLISION_SOUND_DURATION: 400, // ms
  COLLISION_SHAKE_DURATION: 200, // ms
  COLLISION_EFFECT_DURATION: 200, // ms
  
  // Pipe pass feedback
  PIPE_PASS_SOUND_DURATION: 100, // ms
  PIPE_PASS_VISUAL_DURATION: 1000, // ms
  
  // UI animations
  BUTTON_HOVER_DURATION: 100,    // ms
  SCORE_ANIMATION_DURATION: 500, // ms
  MENU_FADE_IN_DURATION: 500     // ms
};
```

---

## Part 6: Audio Settings and Accessibility

### Audio Settings UI

```javascript
class AudioSettings {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.masterVolume = 1.0;
    this.soundEnabled = true;
  }
  
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.audioEngine.setMasterVolume(this.masterVolume);
  }
  
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.audioEngine.setMuted(!this.soundEnabled);
  }
  
  getMasterVolume() {
    return this.masterVolume;
  }
  
  isSoundEnabled() {
    return this.soundEnabled;
  }
}

// Volume slider UI
class VolumeSlider {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.value = 1.0;
    this.dragging = false;
  }
  
  handleMouseDown(mouseX, mouseY) {
    if (this.isPointInside(mouseX, mouseY)) {
      this.dragging = true;
      this.updateValue(mouseX);
    }
  }
  
  handleMouseMove(mouseX, mouseY) {
    if (this.dragging) {
      this.updateValue(mouseX);
    }
  }
  
  handleMouseUp() {
    this.dragging = false;
  }
  
  updateValue(mouseX) {
    const relativeX = mouseX - this.x;
    this.value = Math.max(0, Math.min(1, relativeX / this.width));
  }
  
  isPointInside(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }
  
  draw(ctx) {
    // Draw background
    ctx.fillStyle = '#333';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Draw filled portion
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(this.x, this.y, this.width * this.value, this.height);
    
    // Draw border
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // Draw slider handle
    const handleX = this.x + this.width * this.value;
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(handleX - 5, this.y - 5, 10, this.height + 10);
  }
}
```

### Accessibility Considerations

```javascript
// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function getAnimationDuration(normalDuration) {
  return prefersReducedMotion ? normalDuration * 0.5 : normalDuration;
}

function shouldPlayAnimation(animationType) {
  if (prefersReducedMotion) {
    // Skip non-essential animations
    return animationType === 'essential';
  }
  return true;
}

// Respect prefers-color-scheme
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

function getBackgroundColor() {
  return prefersDarkMode ? '#1a1a1a' : '#87CEEB';
}
```

---

## Part 7: Performance Optimization for Audio-Visual

### Audio Pooling

```javascript
class AudioPool {
  constructor(audioContext, maxSounds = 8) {
    this.audioContext = audioContext;
    this.maxSounds = maxSounds;
    this.activeSounds = [];
  }
  
  playSound(audioBuffer, volume = 1.0) {
    // Reuse oldest sound if pool is full
    if (this.activeSounds.length >= this.maxSounds) {
      this.activeSounds.shift();
    }
    
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = audioBuffer;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.onended = () => {
      const index = this.activeSounds.indexOf(source);
      if (index > -1) {
        this.activeSounds.splice(index, 1);
      }
    };
    
    source.start(0);
    this.activeSounds.push(source);
  }
}
```

### Visual Effect Pooling

```javascript
class EffectPool {
  constructor(maxEffects = 16) {
    this.maxEffects = maxEffects;
    this.activeEffects = [];
  }
  
  addEffect(effect) {
    if (this.activeEffects.length >= this.maxEffects) {
      this.activeEffects.shift();
    }
    this.activeEffects.push(effect);
  }
  
  update(deltaTime) {
    this.activeEffects = this.activeEffects.filter(effect => {
      effect.update(deltaTime);
      return effect.active;
    });
  }
  
  draw(ctx) {
    for (const effect of this.activeEffects) {
      effect.draw(ctx);
    }
  }
}
```

---

## Part 8: Testing Audio-Visual Synchronization

### Manual Testing Checklist

- [ ] Jump sound plays immediately on input
- [ ] Game over sound plays immediately on collision
- [ ] Screen shake triggers simultaneously with collision sound
- [ ] Score feedback appears at correct position
- [ ] Button hover animation is smooth
- [ ] Menu fade-in animation is smooth
- [ ] No audio lag or delay
- [ ] Audio doesn't block gameplay
- [ ] Visual effects don't cause frame drops
- [ ] Audio works on different browsers
- [ ] Audio works with different volume levels

### Automated Testing

```javascript
// Test audio-visual synchronization
function testAudioVisualSync() {
  const audioEngine = new AudioEngine();
  const screenShake = new ScreenShake();
  const startTime = performance.now();
  
  // Trigger collision feedback
  audioEngine.playSound('game_over', 0.8);
  screenShake.trigger();
  
  const endTime = performance.now();
  const syncTime = endTime - startTime;
  
  console.log(`Audio-visual sync time: ${syncTime}ms`);
  
  // Should be < 16ms (one frame at 60 FPS)
  if (syncTime < 16) {
    console.log('✓ Audio-visual synchronization is frame-perfect');
  } else {
    console.warn('⚠ Audio-visual synchronization may have lag');
  }
}
```

---

## Summary

This steering document provides comprehensive guidance for integrating audio and visual feedback in Flappy Kiro:

- **Sound Effect Integration**: Web Audio API implementation with fallback
- **Screen Shake Mechanics**: Collision feedback with easing functions
- **UI Animation Patterns**: Menu, buttons, and score animations
- **Audio-Visual Synchronization**: Frame-perfect feedback timing
- **Audio Settings**: Volume control and accessibility options
- **Performance Optimization**: Audio and effect pooling
- **Testing**: Manual and automated synchronization testing

Follow these patterns to create an immersive, responsive audio-visual experience that enhances gameplay without compromising performance.
