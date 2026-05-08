/**
 * Audio Engine
 * 
 * Manages sound effects using Web Audio API with HTML5 Audio fallback.
 * Handles audio context initialization, sound loading, and playback.
 * Provides volume control and mute functionality.
 */

import { AUDIO, ASSETS } from './constants.js';
import { AudioSourcePool } from './pooling.js';

export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.masterVolume = AUDIO.MASTER_VOLUME;
    this.muted = false;
    this.initialized = false;
    this.useWebAudio = true;
    
    // Audio source pooling for performance
    this.audioSourcePool = null;
    
    // Fallback using HTML5 Audio elements
    this.audioElements = {};
  }

  /**
   * Initialize audio context (requires user interaction for browsers)
   * @returns {Promise<boolean>} True if initialization successful
   */
  async init() {
    try {
      // Try to initialize Web Audio API
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      
      if (AudioContext) {
        this.audioContext = new AudioContext();
        
        // Resume audio context if suspended (browser requirement)
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
        
        // Initialize audio source pool for performance
        this.audioSourcePool = new AudioSourcePool(this.audioContext, 8);
        
        this.useWebAudio = true;
        this.initialized = true;
        console.log('AudioEngine: Web Audio API initialized successfully');
        console.log(`AudioEngine: Audio context state: ${this.audioContext.state}`);
        return true;
      } else {
        // Fallback to HTML5 Audio
        console.warn('AudioEngine: Web Audio API not available, using HTML5 Audio fallback');
        this.useWebAudio = false;
        this.initialized = true;
        return true;
      }
    } catch (error) {
      console.error('AudioEngine: Failed to initialize Web Audio API:', error);
      console.log('AudioEngine: Falling back to HTML5 Audio');
      this.useWebAudio = false;
      this.initialized = true;
      return true;
    }
  }

  /**
   * Load audio files
   * @returns {Promise<void>}
   */
  async loadSounds() {
    try {
      if (this.useWebAudio && this.audioContext) {
        // Load sounds using Web Audio API
        await this.loadSoundWebAudio('jump', ASSETS.JUMP_SOUND);
        await this.loadSoundWebAudio('gameOver', ASSETS.GAME_OVER_SOUND);
      } else {
        // Load sounds using HTML5 Audio
        await this.loadSoundHTML5('jump', ASSETS.JUMP_SOUND);
        await this.loadSoundHTML5('gameOver', ASSETS.GAME_OVER_SOUND);
      }
      
      console.log('AudioEngine: All sounds loaded successfully');
    } catch (error) {
      console.error('AudioEngine: Failed to load sounds:', error);
      throw error;
    }
  }

  /**
   * Load sound using Web Audio API
   * @param {string} name - Sound name
   * @param {string} url - Sound file URL
   * @returns {Promise<void>}
   */
  async loadSoundWebAudio(name, url) {
    try {
      console.log(`AudioEngine: Loading sound (Web Audio): ${name} from ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.sounds[name] = audioBuffer;
      console.log(`AudioEngine: Successfully loaded sound: ${name} (${audioBuffer.duration.toFixed(2)}s)`);
    } catch (error) {
      console.error(`AudioEngine: Failed to load sound ${name}:`, error);
      throw error;
    }
  }

  /**
   * Load sound using HTML5 Audio (fallback)
   * @param {string} name - Sound name
   * @param {string} url - Sound file URL
   * @returns {Promise<void>}
   */
  async loadSoundHTML5(name, url) {
    return new Promise((resolve, reject) => {
      console.log(`AudioEngine: Loading sound (HTML5 Audio): ${name} from ${url}`);
      
      const audio = new Audio();
      
      audio.addEventListener('canplaythrough', () => {
        this.audioElements[name] = audio;
        console.log(`AudioEngine: Successfully loaded sound: ${name}`);
        resolve();
      }, { once: true });
      
      audio.addEventListener('error', () => {
        const error = `Failed to load audio: ${name} from ${url}`;
        console.error(`AudioEngine: ${error}`);
        reject(new Error(error));
      }, { once: true });
      
      audio.preload = 'auto';
      audio.src = url;
      audio.load();
    });
  }

  /**
   * Play a sound with volume control
   * @param {string} name - Sound name ('jump' or 'gameOver')
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  playSound(name, volume = 1.0) {
    if (!this.initialized) {
      console.warn('AudioEngine: Not initialized, cannot play sound');
      return;
    }

    if (this.muted) {
      return;
    }

    try {
      if (this.useWebAudio && this.audioContext) {
        this.playSoundWebAudio(name, volume);
      } else {
        this.playSoundHTML5(name, volume);
      }
    } catch (error) {
      console.error(`AudioEngine: Failed to play sound ${name}:`, error);
    }
  }

  /**
   * Play sound using Web Audio API with pooling
   * @param {string} name - Sound name
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  playSoundWebAudio(name, volume) {
    const audioBuffer = this.sounds[name];
    
    if (!audioBuffer) {
      console.warn(`AudioEngine: Sound not loaded: ${name}`);
      return;
    }

    try {
      // Resume audio context if suspended (handle browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Use audio source pool for efficient playback
      this.audioSourcePool.playSound(audioBuffer, volume * this.masterVolume);
    } catch (error) {
      console.error(`AudioEngine: Error playing sound ${name}:`, error);
    }
  }

  /**
   * Play sound using HTML5 Audio (fallback)
   * @param {string} name - Sound name
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  playSoundHTML5(name, volume) {
    const audio = this.audioElements[name];
    
    if (!audio) {
      console.warn(`AudioEngine: Sound not loaded: ${name}`);
      return;
    }

    try {
      audio.volume = volume * this.masterVolume;
      audio.currentTime = 0;
      
      // Play returns a promise, catch any errors
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('AudioEngine: Audio playback failed:', err);
        });
      }
    } catch (error) {
      console.error(`AudioEngine: Error playing sound ${name}:`, error);
    }
  }

  /**
   * Set master volume
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    console.log(`AudioEngine: Master volume set to ${this.masterVolume.toFixed(2)}`);
  }

  /**
   * Set muted state
   * @param {boolean} muted - True to mute, false to unmute
   */
  setMuted(muted) {
    this.muted = muted;
    console.log(`AudioEngine: ${muted ? 'Muted' : 'Unmuted'}`);
  }

  /**
   * Get master volume
   * @returns {number} Current master volume (0.0 to 1.0)
   */
  getMasterVolume() {
    return this.masterVolume;
  }

  /**
   * Get muted state
   * @returns {boolean} True if muted
   */
  isMuted() {
    return this.muted;
  }

  /**
   * Check if audio engine is initialized
   * @returns {boolean} True if initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get audio context state (for debugging)
   * @returns {string} Audio context state or 'N/A' if using HTML5 Audio
   */
  getState() {
    if (this.useWebAudio && this.audioContext) {
      return this.audioContext.state;
    }
    return 'HTML5 Audio';
  }
}
