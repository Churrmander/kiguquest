/* NP.Game — the scene stack, the 240x160 framebuffer, fades and the fixed-step tick.
 *
 * A scene is any object with optional enter()/exit()/update()/draw(fb)/opaque. Scenes are stacked: only the top scene
 * gets update(); drawing starts at the lowest scene below the top that is opaque (so a menu with opaque=false is drawn
 * over the overworld). NP.Scene (scene.js) is the usual base class, adding generator scripts and message/menu helpers.
 *
 * Headless use (tests/tools):  Game.tick(); Game.render() -> Bitmap. Browser: src/platform/browser.js drives both.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Bitmap, Input } = NP;

  const Game = {
    fb: new Bitmap(240, 160),
    scenes: [],
    frame: 0,
    opts: { textSpeed: 1, battleAnim: true, battleStyle: 'shift', sound: true, lcd: false, run: 'hold' },
    // full-screen fade overlay: alpha 0..1 of `color`
    fade: { a: 0, color: '#000000', from: 0, to: 0, t: 0, dur: 0 },
    flash: 0,

    push(scene) {
      scene.game = this;
      this.scenes.push(scene);
      if (scene.enter) scene.enter();
      return scene;
    },
    pop() {
      const s = this.scenes.pop();
      if (s) {
        s.finished = true;
        if (s.exit) s.exit();
      }
      return s;
    },
    /** Replace the whole stack with one scene. */
    reset(scene) {
      while (this.scenes.length) this.pop();
      return this.push(scene);
    },
    top() {
      return this.scenes[this.scenes.length - 1];
    },
    find(ctor) {
      for (let i = this.scenes.length - 1; i >= 0; i--) if (this.scenes[i] instanceof ctor) return this.scenes[i];
      return null;
    },

    /** Start a fade. to=1 -> fully covered by colour, to=0 -> clear. */
    fadeTo(to, frames, color) {
      const f = this.fade;
      if (color) f.color = color;
      f.from = f.a;
      f.to = to;
      f.t = 0;
      f.dur = Math.max(1, frames | 0);
      if (frames <= 0) { f.a = to; f.dur = 0; }
    },
    get fading() {
      return this.fade.dur > 0 && this.fade.t < this.fade.dur;
    },

    tick() {
      Input.update();
      this.frame++;
      const f = this.fade;
      if (f.dur > 0 && f.t < f.dur) {
        f.t++;
        f.a = f.from + (f.to - f.from) * (f.t / f.dur);
        if (f.t >= f.dur) f.a = f.to;
      }
      if (this.flash > 0) this.flash--;
      const t = this.top();
      if (t && t.update) t.update();
    },

    render() {
      const fb = this.fb;
      let i = this.scenes.length - 1;
      while (i > 0 && this.scenes[i].opaque === false) i--;
      if (i < 0) fb.clear('#000000');
      for (let j = Math.max(0, i); j < this.scenes.length; j++) if (this.scenes[j].draw) this.scenes[j].draw(fb, this.frame);
      if (this.fade.a > 0.001) fb.blendRect(0, 0, 240, 160, this.fade.color, this.fade.a);
      if (this.flash > 0) fb.blendRect(0, 0, 240, 160, '#ffffff', Math.min(1, this.flash / 6));
      return fb;
    },

    /** Convenience for tests: run n ticks (rendering is skipped unless render=true). */
    run(n, render) {
      for (let i = 0; i < n; i++) {
        this.tick();
        if (render) this.render();
      }
    },

    /** Tap a button for `frames` frames then release (one extra frame), ticking the game. */
    press(button, frames) {
      Input.set(button, true);
      this.run(frames || 2);
      Input.set(button, false);
      this.run(1);
    },
  };

  NP.Game = Game;
})(typeof globalThis !== 'undefined' ? globalThis : window);
