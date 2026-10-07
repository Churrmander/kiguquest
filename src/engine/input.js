/* NP.Input — the virtual GBA pad: up down left right a b start select l r.
 *
 * The browser shell (src/platform/browser.js) and tests both drive it through Input.set(button, isDown).
 * Game code only reads: Input.held[b], Input.pressed[b] (this frame's edge), Input.repeat[b] (edge + auto-repeat),
 * Input.released[b], Input.dir() (most-recently-pressed held direction).
 * Input.update() is called exactly once per logic frame by NP.Game.tick().
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});

  const BUTTONS = ['up', 'down', 'left', 'right', 'a', 'b', 'start', 'select', 'l', 'r'];
  const DIRS = ['up', 'down', 'left', 'right'];
  const REPEAT_DELAY = 16, REPEAT_RATE = 4;

  const Input = {
    BUTTONS,
    held: {}, pressed: {}, released: {}, repeat: {},
    _down: {}, _latch: {}, _prev: {}, _hold: {}, _order: [],

    /** Physical button state. A down edge is latched so even a sub-frame tap registers for one frame. */
    set(button, isDown) {
      if (BUTTONS.indexOf(button) < 0) return;
      if (isDown && !this._down[button]) this._latch[button] = true;
      this._down[button] = !!isDown;
    },

    /** Advance one logic frame: derive held/pressed/released/repeat. */
    update() {
      for (const b of BUTTONS) {
        const d = !!(this._down[b] || this._latch[b]);
        const p = !!this._prev[b];
        this.held[b] = d;
        this.pressed[b] = d && !p;
        this.released[b] = !d && p;
        this._hold[b] = d ? (this._hold[b] || 0) + 1 : 0;
        const hf = this._hold[b];
        this.repeat[b] = this.pressed[b] || (hf > REPEAT_DELAY && (hf - REPEAT_DELAY) % REPEAT_RATE === 0);
        this._prev[b] = d;
        this._latch[b] = false;
        if (DIRS.indexOf(b) >= 0) {
          const i = this._order.indexOf(b);
          if (d && i < 0) this._order.push(b);
          if (!d && i >= 0) this._order.splice(i, 1);
        }
      }
    },

    /** Most recently pressed direction that is still held, or null. */
    dir() {
      return this._order.length ? this._order[this._order.length - 1] : null;
    },

    /** Direction pressed/repeating THIS frame (for menus), or null. */
    menuDir() {
      for (let i = this._order.length - 1; i >= 0; i--) if (this.repeat[this._order[i]]) return this._order[i];
      return null;
    },

    anyPressed() {
      return BUTTONS.some((b) => this.pressed[b]);
    },

    reset() {
      this._down = {}; this._latch = {}; this._prev = {}; this._hold = {}; this._order = [];
      for (const k of ['held', 'pressed', 'released', 'repeat']) this[k] = {};
    },
  };

  NP.Input = Input;
})(typeof globalThis !== 'undefined' ? globalThis : window);
