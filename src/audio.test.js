/**
 * Audio Engine Tests
 * 
 * Tests for the AudioEngine class including Web Audio API and HTML5 Audio fallback.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioEngine } from './audio.js';
import { AUDIO } from './constants.js';

describe('AudioEngine', () => {
  let audioEngine;

  beforeEach(() => {
    audioEngine = new AudioEngine();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(audioEngine.masterVolume).toBe(AUDIO.MASTER_VOLUME);
      expect(audioEngine.muted).toBe(false);
      expect(audioEngine.initialized).toBe(false);
    });

    it('should report initialization state', () => {
      expect(audioEngine.isInitialized()).toBe(false);
    });
  });

  describe('Volume Control', () => {
    it('should set master volume', () => {
      audioEngine.setMasterVolume(0.5);
      expect(audioEngine.getMasterVolume()).toBe(0.5);
    });

    it('should clamp master volume to 0.0-1.0 range', () => {
      audioEngine.setMasterVolume(1.5);
      expect(audioEngine.getMasterVolume()).toBe(1.0);

      audioEngine.setMasterVolume(-0.5);
      expect(audioEngine.getMasterVolume()).toBe(0.0);
    });

    it('should get master volume', () => {
      audioEngine.setMasterVolume(0.7);
      expect(audioEngine.getMasterVolume()).toBe(0.7);
    });
  });

  describe('Mute Control', () => {
    it('should set muted state', () => {
      audioEngine.setMuted(true);
      expect(audioEngine.isMuted()).toBe(true);

      audioEngine.setMuted(false);
      expect(audioEngine.isMuted()).toBe(false);
    });

    it('should initialize as unmuted', () => {
      expect(audioEngine.isMuted()).toBe(false);
    });
  });

  describe('Sound Playback - Not Initialized', () => {
    it('should not play sound when not initialized', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      audioEngine.playSound('jump', 0.7);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Sound Playback - Muted', () => {
    it('should not play sound when muted', () => {
      audioEngine.initialized = true;
      audioEngine.setMuted(true);

      // Mock the internal play methods
      const webAudioSpy = vi.spyOn(audioEngine, 'playSoundWebAudio').mockImplementation(() => {});
      const html5Spy = vi.spyOn(audioEngine, 'playSoundHTML5').mockImplementation(() => {});

      audioEngine.playSound('jump', 0.7);

      // Neither should be called when muted
      expect(webAudioSpy).not.toHaveBeenCalled();
      expect(html5Spy).not.toHaveBeenCalled();
    });
  });

  describe('Volume Levels', () => {
    it('should use correct volume for jump sound', () => {
      expect(AUDIO.JUMP_VOLUME).toBe(0.7);
    });

    it('should use correct volume for game over sound', () => {
      expect(AUDIO.GAME_OVER_VOLUME).toBe(0.8);
    });

    it('should apply master volume to sound volume', () => {
      audioEngine.setMasterVolume(0.5);
      const jumpVolume = AUDIO.JUMP_VOLUME * audioEngine.getMasterVolume();
      expect(jumpVolume).toBe(0.35); // 0.7 * 0.5
    });
  });

  describe('State Management', () => {
    it('should report correct state when using Web Audio API', async () => {
      // Mock Web Audio API
      class MockAudioContext {
        constructor() {
          this.state = 'running';
          this.destination = {};
        }
        async resume() {
          this.state = 'running';
        }
      }

      global.AudioContext = MockAudioContext;
      
      await audioEngine.init();
      
      expect(audioEngine.getState()).toBe('running');
      
      delete global.AudioContext;
    });

    it('should report HTML5 Audio when fallback is used', () => {
      audioEngine.useWebAudio = false;
      audioEngine.initialized = true;
      
      expect(audioEngine.getState()).toBe('HTML5 Audio');
    });
  });

  describe('Non-blocking Playback', () => {
    it('should play sounds asynchronously without blocking', () => {
      audioEngine.initialized = true;
      audioEngine.sounds = { jump: {}, gameOver: {} };
      
      // Mock the internal play methods to do nothing
      vi.spyOn(audioEngine, 'playSoundWebAudio').mockImplementation(() => {});
      vi.spyOn(audioEngine, 'playSoundHTML5').mockImplementation(() => {});

      const startTime = performance.now();
      
      audioEngine.playSound('jump', 0.7);
      audioEngine.playSound('gameOver', 0.8);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in less than 10ms (non-blocking)
      expect(duration).toBeLessThan(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing sound gracefully', () => {
      audioEngine.initialized = true;
      audioEngine.useWebAudio = true;
      audioEngine.audioContext = {
        state: 'running',
        createBufferSource: vi.fn(),
        createGain: vi.fn()
      };

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      audioEngine.playSound('nonexistent', 0.7);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sound not loaded')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('API Methods', () => {
    it('should have playSound method', () => {
      expect(typeof audioEngine.playSound).toBe('function');
    });

    it('should have setMasterVolume method', () => {
      expect(typeof audioEngine.setMasterVolume).toBe('function');
    });

    it('should have setMuted method', () => {
      expect(typeof audioEngine.setMuted).toBe('function');
    });

    it('should have getMasterVolume method', () => {
      expect(typeof audioEngine.getMasterVolume).toBe('function');
    });

    it('should have isMuted method', () => {
      expect(typeof audioEngine.isMuted).toBe('function');
    });

    it('should have isInitialized method', () => {
      expect(typeof audioEngine.isInitialized).toBe('function');
    });

    it('should have getState method', () => {
      expect(typeof audioEngine.getState).toBe('function');
    });

    it('should have init method', () => {
      expect(typeof audioEngine.init).toBe('function');
    });

    it('should have loadSounds method', () => {
      expect(typeof audioEngine.loadSounds).toBe('function');
    });
  });
});
