/* NP.boot — create the first scene. The platform shell (src/platform/browser.js) or a test calls this once. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});

  NP.boot = function () {
    NP.Game.reset(new NP.TitleScene());
    return NP.Game;
  };

  /** Skip the title: start a fresh game directly at the lab (tests, ?quick in the browser). */
  NP.quickStart = function (name, gender) {
    NP.state = NP.State.fresh(name || NP.State.defaultName(gender || 'm'), gender || 'm');
    // the quick start skips the first morning in Button Town and begins at the lab door
    Object.assign(NP.state.flags, { woke: true, kite_call: true, morning_done: true });
    const ow = new NP.Overworld();
    NP.Game.reset(ow);
    ow.loadMap('lab', 5, 9, 'up');
    return ow;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
