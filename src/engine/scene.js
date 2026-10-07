/* NP.Scene — base class for scenes: generator "tasks" (script-style code that can wait frames / for input),
 * plus message-box and menu helpers used by overworld, battle and menu scenes.
 *
 *   class MyScene extends NP.Scene {
 *     *intro() { yield* this.say('Hello!'); const r = yield* this.choose(['Yes','No']); ... }
 *   }
 *
 * Generators yield: nothing (wait one frame) or a number (wait that many frames).
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Input, ui } = NP;

  class Scene {
    constructor(theme) {
      this.opaque = true;
      this.finished = false;
      this.game = null;
      this.tasks = [];
      this.theme = theme || 'light';
      this.msg = new ui.Message(this.theme);
      this.menus = []; // menus currently shown (drawn by drawUI)
      this.result = undefined;
    }

    enter() {}
    exit() {}

    /** Start a generator as a concurrent task. Returns the task handle ({done}). */
    spawn(gen, name) {
      const t = { gen, done: false, wait: 0, name: name || '' };
      this.tasks.push(t);
      return t;
    }

    stepTasks() {
      for (const t of this.tasks.slice()) {
        if (t.done) continue;
        if (t.wait > 0) { t.wait--; continue; }
        const r = t.gen.next();
        if (r.done) t.done = true;
        else if (typeof r.value === 'number') t.wait = r.value - 1 > 0 ? r.value - 1 : 0;
      }
      this.tasks = this.tasks.filter((t) => !t.done);
    }

    update() {
      this.stepTasks();
    }

    draw(fb, frame) {
      this.drawUI(fb, frame);
    }

    drawUI(fb, frame) {
      for (const m of this.menus) m.draw(fb);
      this.msg.draw(fb, frame === undefined ? NP.Game.frame : frame);
    }

    // ---- generator helpers (use with yield*) ----
    *wait(n) {
      for (let i = 0; i < n; i++) yield;
    }

    *waitFor(pred) {
      while (!pred()) yield;
    }

    /** Show a message and wait until the player has read it all. opts: {auto, keep, hold, speed} */
    *say(text, opts) {
      this.msg.begin(text, opts);
      while (this.msg.active) {
        this.msg.update();
        yield;
      }
    }

    /** Run a Menu modally. Returns {type:'select', index, item} or {type:'cancel'}. */
    *menu(menu) {
      this.menus.push(menu);
      let r = null;
      // swallow the A press that opened us
      yield;
      while (!(r = menu.update())) yield;
      this.menus = this.menus.filter((m) => m !== menu);
      return r;
    }

    /** Yes/No box at the lower right; returns true for Yes. B = No. */
    *yesno(defaultNo) {
      const m = new ui.Menu({ items: ['Yes', 'No'], x: 176, y: 62, theme: this.theme, cursor: defaultNo ? 1 : 0, cancelable: true });
      m.x = 240 - m.w - 4;
      m.y = 112 - m.h - 2;
      const r = yield* this.menu(m);
      return r.type === 'select' && r.index === 0;
    }

    /** Pick from a list at the lower right. items: strings or {label,...}. Returns index or -1 for cancel. */
    *choose(items, o) {
      o = o || {};
      const m = new ui.Menu(Object.assign({ items, theme: this.theme, cancelable: true }, o));
      if (o.x === undefined && o.y === undefined) { m.x = 240 - m.w - 4; m.y = 112 - m.h - 2; }
      const r = yield* this.menu(m);
      return r.type === 'select' ? r.index : -1;
    }
  }

  NP.Scene = Scene;
})(typeof globalThis !== 'undefined' ? globalThis : window);
