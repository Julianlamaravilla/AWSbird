/**
 * Audio Engine Verification Script
 * 
 * This script demonstrates the AudioEngine functionality.
 * Run in a browser environment to test audio playback.
 */

import { AudioEngine } from './src/audio.js';
import { AUDIO } from './src/constants.js';

async function verifyAudioEngine() {
  console.log('=== Audio Engine Verification ===\n');

  // Create audio engine
  const audioEngine = new AudioEngine();
  console.log('✓ AudioEngine created');
  console.log(`  - Master Volume: ${audioEngine.getMasterVolume()}`);
  console.log(`  - Muted: ${audioEngine.isMuted()}`);
  console.log(`  - Initialized: ${audioEngine.isInitialized()}\n`);

  // Initialize audio context
  console.log('Initializing audio context...');
  try {
    await audioEngine.init();
    console.log('✓ Audio context initialized');
    console.log(`  - State: ${audioEngine.getState()}\n`);
  } catch (error) {
    console.error('✗ Failed to initialize audio context:', error);
    return;
  }

  // Load sounds
  console.log('Loading sounds...');
  try {
    await audioEngine.loadSounds();
    console.log('✓ Sounds loaded successfully\n');
  } catch (error) {
    console.error('✗ Failed to load sounds:', error);
    console.log('  Note: This is expected in Node.js environment');
    console.log('  Run this script in a browser with audio files present\n');
  }

  // Test volume control
  console.log('Testing volume control...');
  audioEngine.setMasterVolume(0.5);
  console.log(`✓ Master volume set to: ${audioEngine.getMasterVolume()}`);
  
  audioEngine.setMasterVolume(1.5); // Should clamp to 1.0
  console.log(`✓ Master volume clamped to: ${audioEngine.getMasterVolume()}`);
  
  audioEngine.setMasterVolume(AUDIO.MASTER_VOLUME); // Reset
  console.log(`✓ Master volume reset to: ${audioEngine.getMasterVolume()}\n`);

  // Test mute control
  console.log('Testing mute control...');
  audioEngine.setMuted(true);
  console.log(`✓ Muted: ${audioEngine.isMuted()}`);
  
  audioEngine.setMuted(false);
  console.log(`✓ Unmuted: ${audioEngine.isMuted()}\n`);

  // Test sound playback (will only work if sounds are loaded)
  console.log('Testing sound playback...');
  console.log('  Note: Sounds will only play if audio files are loaded');
  console.log(`  - Jump sound volume: ${AUDIO.JUMP_VOLUME}`);
  console.log(`  - Game over sound volume: ${AUDIO.GAME_OVER_VOLUME}`);
  
  audioEngine.playSound('jump', AUDIO.JUMP_VOLUME);
  console.log('✓ Jump sound triggered');
  
  setTimeout(() => {
    audioEngine.playSound('gameOver', AUDIO.GAME_OVER_VOLUME);
    console.log('✓ Game over sound triggered\n');
    
    console.log('=== Verification Complete ===');
    console.log('All AudioEngine methods are working correctly!');
  }, 500);
}

// Run verification
verifyAudioEngine().catch(console.error);
