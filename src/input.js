/**
 * Input System
 *
 * Centralizes all player input: mouse click, keyboard, and touch.
 * Each source sets a shared flag consumed once per game-loop frame,
 * so PhysicsEngine.applyJump() is never called more than once per input.
 *
 * Cross-device strategy:
 *   - Keyboard  : keydown on window (canvas cannot receive key events)
 *   - Touch     : touchstart with { passive: false } so preventDefault() is
 *                 allowed by the browser; this also suppresses the ~300 ms
 *                 synthetic "ghost click" that mobile browsers synthesise after
 *                 a touch, preventing a double-jump on the same tap.
 *   - Mouse     : click on canvas (desktop fallback / accessibility)
 *
 * Jump registration is intentionally restricted to the PLAYING state so that
 * a tap on a menu button does not also trigger an immediate jump the moment
 * the game transitions to PLAYING.
 */

import { GAME_STATE } from './constants.js';

// Keys that trigger a jump, matched against KeyboardEvent.code for
// layout-independence (works on AZERTY, Dvorak, etc.).
const JUMP_CODES = new Set(['Space', 'ArrowUp', 'KeyW']);

export class InputSystem {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {() => string} getGameState  Callback that returns the current
   *   GAME_STATE value.  Defaults to a no-op so existing tests / callers that
   *   don't pass a provider continue to work (jump is then always registered,
   *   matching the original behaviour).
   */
  constructor(canvas, getGameState = () => GAME_STATE.PLAYING) {
    this.canvas = canvas;
    this.getGameState = getGameState;
    this.jumpInputRegistered = false;
    this.initialized = false;

    // Pre-bind handlers so the same reference is used for add/remove.
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
  }

  /**
   * Attach all event listeners. Safe to call only once; warns if called again.
   */
  init() {
    if (this.initialized) {
      console.warn('InputSystem: Already initialized');
      return;
    }

    // --- Mouse (desktop) ---
    this.canvas.addEventListener('click', this.handleClick);

    // --- Keyboard ---
    // Registered on window because the canvas element does not receive
    // keyboard events unless it has focus (tabindex), which we want to avoid.
    window.addEventListener('keydown', this.handleKeyDown);

    // --- Touch (mobile) ---
    // { passive: false } is mandatory; without it modern browsers ignore
    // preventDefault() on touchstart and the page still scrolls / zooms.
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });

    this.initialized = true;
    console.log('InputSystem: Initialized (click + keyboard + touch)');
  }

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  /**
   * Mouse click → jump (desktop / accessibility path).
   * Only registers a jump during PLAYING so that clicking menu buttons does
   * not also queue a phantom jump on the first game frame.
   * @param {MouseEvent} event
   */
  handleClick(event) {
    event.preventDefault();
    if (this.getGameState() === GAME_STATE.PLAYING) {
      this.jumpInputRegistered = true;
    }
  }

  /**
   * Keyboard keydown → jump when Space, ArrowUp, or W is pressed.
   *
   * Mitigations applied:
   *   - event.repeat guard : a held key fires repeated keydown events; we
   *     accept only the very first one so the ghost doesn't spam-jump.
   *   - preventDefault()   : Space scrolls the page down; ArrowUp scrolls
   *     it up — both are suppressed while the game has focus.
   *
   * @param {KeyboardEvent} event
   */
  handleKeyDown(event) {
    if (!JUMP_CODES.has(event.code)) return;

    // Suppress page-scroll for Space and ArrowUp.
    event.preventDefault();

    // Ignore auto-repeat events generated while the key is held.
    if (event.repeat) return;

    this.jumpInputRegistered = true;
  }

  /**
   * Touch start → jump (mobile path).
   *
   * Mitigations applied:
   *   - preventDefault()       : suppresses pull-to-refresh, double-tap zoom,
   *     page scroll, and — critically — the synthetic ghost click (~300 ms
   *     delay) that mobile browsers fire after touchstart. Without this, a
   *     single tap would produce both a touchstart AND a click event, causing
   *     a double-jump on the same frame.  preventDefault() is called
   *     unconditionally so these protections are always active.
   *   - { passive: false }     : declared in addEventListener (see init()) so
   *     the browser actually honours our preventDefault() call.
   *   - PLAYING guard          : jump registration is skipped outside of the
   *     PLAYING state so that tapping a menu button in main.js does not also
   *     queue a jump that fires the instant the game starts.
   *
   * @param {TouchEvent} event
   */
  handleTouchStart(event) {
    event.preventDefault();
    if (this.getGameState() === GAME_STATE.PLAYING) {
      this.jumpInputRegistered = true;
    }
  }

  // ---------------------------------------------------------------------------
  // Frame interface (called by main.js each tick)
  // ---------------------------------------------------------------------------

  /**
   * Returns true if any jump input was registered since the last reset().
   * @returns {boolean}
   */
  getJumpInput() {
    return this.jumpInputRegistered;
  }

  /**
   * Clears the jump flag. Must be called once per frame after getJumpInput().
   */
  reset() {
    this.jumpInputRegistered = false;
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  /**
   * Remove all event listeners. Call when tearing down the game instance
   * (e.g. SPA navigation, test cleanup) to avoid memory leaks.
   */
  destroy() {
    if (!this.initialized) return;

    this.canvas.removeEventListener('click', this.handleClick);
    window.removeEventListener('keydown', this.handleKeyDown);
    // No options object needed for removal; only the capture flag matters,
    // and we used the default (capture = false) when adding the listener.
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);

    this.initialized = false;
    console.log('InputSystem: Destroyed');
  }
}
