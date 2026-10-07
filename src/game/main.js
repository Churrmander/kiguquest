/* NP.boot — create the first scene. The platform shell (src/platform/browser.js) or a test calls this once. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});

  NP.boot = function () {
    NP.Game.reset(new NP.TitleScene());
    return NP.Game;
  };

  /** Skip the title: start a fresh game directly (tests, ?quick in the browser). */
  NP.quickStart = function (name, gender) {
    NP.state = NP.State.fresh(name || 'Ren', gender || 'm');
    const ow = new NP.Overworld();
    NP.Game.reset(ow);
    ow.loadMap('lab', 5, 9, 'up');
    return ow;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
