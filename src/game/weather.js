/* NP.Weather — overworld weather ("moods") for a map, carried into every battle fought there.
 *  Map def: `weather: 'dust'` (always) or `weather: { dust: 70 }` (percent chance, rolled each time you enter the map),
 *  or a function (state) -> id|null for story-driven weather. Ids are the battle moods in src/game/battle/conditions.js
 *  (sun, rain, dust, snow). The overworld draws a screen-space effect for each mood (`NP.Weather.draw`).
 *  NP.Weather.now is the current map's mood; evolution conditions can read it (kigu.js `weather`). */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const W = (NP.Weather = { now: null });

  W.roll = function (def, state, rng) {
    const w = def && def.weather;
    if (!w) return null;
    if (typeof w === 'string') return w;
    if (typeof w === 'function') return w(state || NP.state) || null;
    rng = rng || NP.rng;
    for (const id of Object.keys(w)) if (rng.int(100) < w[id]) return id;
    return null;
  };

  // ---- drawing: cheap full-screen passes over the framebuffer, after the map and before the UI
  const hash = (n) => { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); return (n ^ (n >>> 15)) >>> 0; };
  function tint(fb, r, g, b, a) {
    const d = fb.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = d[i] + (r - d[i]) * a; d[i + 1] = d[i + 1] + (g - d[i + 1]) * a; d[i + 2] = d[i + 2] + (b - d[i + 2]) * a;
    }
  }
  function px(fb, x, y, r, g, b, a) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= fb.w || y >= fb.h) return;
    const d = fb.data, i = (y * fb.w + x) * 4;
    d[i] += (r - d[i]) * a; d[i + 1] += (g - d[i + 1]) * a; d[i + 2] += (b - d[i + 2]) * a;
  }
  const DRAW = {
    // a warm sandy haze, with grit streaking sideways on the wind
    dust(fb, f) {
      tint(fb, 222, 186, 120, 0.28);
      for (let k = 0; k < 90; k++) {
        const h = hash(k * 7919 + 13), sp = 3 + (h % 4);
        const x = ((h % 997) + f * sp) % (fb.w + 40) - 20, y = (hash(k + 101) % fb.h + Math.sin((f + k * 9) / 14) * 4);
        const len = 3 + (h % 5);
        for (let j = 0; j < len; j++) px(fb, x - j, y, 240, 214, 160, 0.55 - j * 0.08);
      }
    },
    sun(fb) { tint(fb, 255, 236, 180, 0.1); },
    rain(fb, f) {
      tint(fb, 70, 90, 130, 0.18);
      for (let k = 0; k < 110; k++) {
        const h = hash(k * 4441 + 7), x = (h % fb.w + f * 2) % fb.w, y = ((hash(k + 55) % fb.h) + f * 7) % fb.h;
        for (let j = 0; j < 5; j++) px(fb, x - j * 0.4, y - j, 200, 215, 240, 0.5);
      }
    },
    snow(fb, f) {
      tint(fb, 225, 235, 250, 0.12);
      for (let k = 0; k < 70; k++) {
        const h = hash(k * 2203 + 3), x = (h % fb.w + Math.sin((f + k * 13) / 20) * 6) % fb.w, y = ((hash(k + 9) % fb.h) + f) % fb.h;
        px(fb, x, y, 255, 255, 255, 0.9); px(fb, x + 1, y, 255, 255, 255, 0.5);
      }
    },
  };
  W.draw = function (fb, id, frame) { const d = id && DRAW[id]; if (d) d(fb, frame || 0); };
})(typeof globalThis !== 'undefined' ? globalThis : window);
