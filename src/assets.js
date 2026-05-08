/**
 * Asset Loader
 * 
 * Loads sprites and audio files before game starts.
 * Displays loading screen while assets load.
 * Displays error message if asset fails to load.
 */

import { ASSETS } from './constants.js';

export class AssetLoader {
  static assets = {};
  static ready = false;
  static loadingErrors = [];

  /**
   * Load all required assets
   * @returns {Promise<boolean>} True if all assets loaded successfully
   */
  static async loadAssets() {
    console.log('AssetLoader: Starting asset loading...');
    this.ready = false;
    this.loadingErrors = [];

    try {
      // Load all assets in parallel
      const loadPromises = [
        this.loadImage('ghostSprite', ASSETS.GHOST_SPRITE),
        this.loadAudio('jumpSound', ASSETS.JUMP_SOUND),
        this.loadAudio('gameOverSound', ASSETS.GAME_OVER_SOUND)
      ];

      await Promise.all(loadPromises);

      // Check if any errors occurred
      if (this.loadingErrors.length > 0) {
        console.error('AssetLoader: Failed to load some assets:', this.loadingErrors);
        throw new Error(`Failed to load ${this.loadingErrors.length} asset(s)`);
      }

      this.ready = true;
      console.log('AssetLoader: All assets loaded successfully');
      this.logLoadedAssets();
      return true;

    } catch (error) {
      console.error('AssetLoader: Asset loading failed:', error);
      this.ready = false;
      throw error;
    }
  }

  /**
   * Load an image asset
   * @param {string} name - Asset name
   * @param {string} path - Asset path
   * @returns {Promise<void>}
   */
  static async loadImage(name, path) {
    return new Promise((resolve, reject) => {
      console.log(`AssetLoader: Loading image: ${name} from ${path}`);
      
      const img = new Image();
      
      img.onload = () => {
        this.assets[name] = img;
        console.log(`AssetLoader: Successfully loaded image: ${name} (${img.width}x${img.height})`);
        resolve();
      };
      
      img.onerror = () => {
        const error = `Failed to load image: ${name} from ${path}`;
        console.error(`AssetLoader: ${error}`);
        this.loadingErrors.push(error);
        reject(new Error(error));
      };
      
      img.src = path;
    });
  }

  /**
   * Load an audio asset
   * @param {string} name - Asset name
   * @param {string} path - Asset path
   * @returns {Promise<void>}
   */
  static async loadAudio(name, path) {
    return new Promise((resolve, reject) => {
      console.log(`AssetLoader: Loading audio: ${name} from ${path}`);
      
      const audio = new Audio();
      
      audio.addEventListener('canplaythrough', () => {
        this.assets[name] = audio;
        console.log(`AssetLoader: Successfully loaded audio: ${name}`);
        resolve();
      }, { once: true });
      
      audio.addEventListener('error', () => {
        const error = `Failed to load audio: ${name} from ${path}`;
        console.error(`AssetLoader: ${error}`);
        this.loadingErrors.push(error);
        reject(new Error(error));
      }, { once: true });
      
      // Set audio properties
      audio.preload = 'auto';
      audio.src = path;
      
      // Start loading
      audio.load();
    });
  }

  /**
   * Get a loaded asset by name
   * @param {string} name - Asset name
   * @returns {HTMLImageElement|HTMLAudioElement|null} The loaded asset or null
   */
  static getAsset(name) {
    if (!this.assets[name]) {
      console.warn(`AssetLoader: Asset not found: ${name}`);
      return null;
    }
    return this.assets[name];
  }

  /**
   * Check if all assets are loaded and ready
   * @returns {boolean} True if all assets are loaded
   */
  static isReady() {
    return this.ready;
  }

  /**
   * Log all loaded assets to console
   */
  static logLoadedAssets() {
    console.log('AssetLoader: Loaded assets:');
    for (const [name, asset] of Object.entries(this.assets)) {
      if (asset instanceof HTMLImageElement) {
        console.log(`  - ${name}: Image (${asset.width}x${asset.height})`);
      } else if (asset instanceof HTMLAudioElement) {
        console.log(`  - ${name}: Audio (${asset.duration.toFixed(2)}s)`);
      } else {
        console.log(`  - ${name}: ${typeof asset}`);
      }
    }
  }

  /**
   * Get loading errors
   * @returns {Array<string>} Array of error messages
   */
  static getErrors() {
    return this.loadingErrors;
  }
}
