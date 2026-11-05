/* NP.Clock — the day-night cycle (owner's call, 2026-10-27). Time comes from the real clock on the player's device, like the
 * DS games; Options > Time of day can pin it to one phase instead (handy for testing, or for a player who only plays at night).
 *  Phases: morning 5:00-9:59, day 10:00-16:59, evening 17:00-19:59, night 20:00-4:59.
 *  - Outdoors the screen takes the phase's tint (NP.Clock.draw, after the map and before the weather); lamps glow at night.
 *    Indoor maps (def.indoor) and dark maps (def.dark) are never tinted.
 *  - Encounter entries can carry `time: 'night'` (or 'morning|evening', any '|' list of phases) to appear only then.
 *  - Evolutions with `time: 'night'` count a dark map as night too (NP.Clock.night()).
 *  - Grass battles fought outdoors at night use the 'night' battle background.
 *  Tests: NP.Clock.fake = hour (0-23) overrides the device clock; null goes back to it. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const C = (NP.Clock = { fake: null, fakeDay: null });
  C.PHASES = ['morning', 'day', 'evening', 'night'];
  C.LABEL = { morning: 'Morning', day: 'Day', evening: 'Evening', night: 'Night' };

  // the Options setting: 0 Auto (device clock), 1-4 pin one phase
  const opt = () => { const o = (NP.state && NP.state.opts) || (NP.Game && NP.Game.opts) || {}; return o.clock || 0; };
  const PIN_HOUR = [null, 7, 12, 18, 22];

  C.hour = function () {
    if (C.fake !== null && C.fake !== undefined) return C.fake;
    const pin = PIN_HOUR[opt()];
    if (pin !== null && pin !== undefined) return pin;
    return new Date().getHours();
  };
  /** today's date as a day number (local days since 1970): for once-a-day things like shaking a tree. Tests: NP.Clock.fakeDay = n. */
  C.day = function () {
    if (C.fakeDay !== null && C.fakeDay !== undefined) return C.fakeDay;
    const d = new Date();
    return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
  };
  C.minute = function () { return (C.fake !== null && C.fake !== undefined) || opt() ? 0 : new Date().getMinutes(); };
  C.phaseAt = (h) => (h >= 5 && h < 10 ? 'morning' : h >= 10 && h < 17 ? 'day' : h >= 17 && h < 20 ? 'evening' : 'night');
  C.phase = () => C.phaseAt(C.hour());
  // night for evolutions and the like: the night phase, or anywhere dark (caves)
  C.night = () => C.phase() === 'night' || !!(NP.Weather && NP.Weather.dark);
  // does an encounter entry's `time` allow the current phase?
  C.allows = (time) => !time || time.split('|').indexOf(C.phase()) >= 0;
  C.filter = (list) => (list && list.some((e) => e.time) ? list.filter((e) => C.allows(e.time)) : list);
  C.outdoors = (def) => !!def && !def.indoor && !def.dark && def.border !== 'void';
  // the clock for menus: "9:04 PM"
  C.text = function () {
    const h = C.hour(), m = C.minute();
    return ((h + 11) % 12 + 1) + ':' + (m < 10 ? '0' : '') + m + (h < 12 ? ' AM' : ' PM');
  };

  // ---- drawing
  // per phase: multiply each channel by m, then add a (a multiply keeps colours rich instead of washing them out)
  const TINT = {
    morning: { m: [0.92, 0.86, 0.9], a: [22, 10, 24] },
    day: null,
    evening: { m: [1, 0.86, 0.74], a: [8, 0, 0] },
    night: { m: [0.4, 0.46, 0.7], a: [4, 8, 28] },
  };
  function tint(fb, t) {
    const d = fb.data, m = t.m, a = t.a;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = d[i] * m[0] + a[0]; d[i + 1] = d[i + 1] * m[1] + a[1]; d[i + 2] = d[i + 2] * m[2] + a[2];
    }
  }
  // a soft warm pool of light round a point (screen space), drawn over the night tint
  function glow(fb, x, y, rad, a) {
    x = Math.round(x); y = Math.round(y);
    const d = fb.data, r2 = rad * rad;
    for (let j = -rad; j <= rad; j++) {
      const yy = y + j;
      if (yy < 0 || yy >= fb.h) continue;
      for (let i = -rad; i <= rad; i++) {
        const xx = x + i, q = i * i + j * j;
        if (xx < 0 || xx >= fb.w || q > r2) continue;
        const k = a * (1 - q / r2), p = (yy * fb.w + xx) * 4;
        d[p] += (255 - d[p]) * k; d[p + 1] += (226 - d[p + 1]) * k * 0.9; d[p + 2] += (150 - d[p + 2]) * k * 0.6;
      }
    }
  }
  // ---- light through the windows of a room (opt-in: def.windowLight, def.nightGlow; the player's house)
  //  def.windowLight = [{ x, y, w, h, from: 'n'|'s'|'e'|'w', k? }] = the patch of floor the window lights (tiles), brightest on the `from`
  //  side; k (default 1) scales its strength (e.g. a softer pool over a bed, so a sleeper's face stays readable).
  //  def.nightGlow = [{ x, y, w }] = lamps and screens that glow at night (a warm pool centred on the tile row).
  //  def.lightPhase() -> phase | null overrides the clock (the first morning in the house is always morning).
  //  Each pool starts right at its window (the patch's `from` edge is the window wall) and fades towards its far end in stepped bands.
  //  The light pulls each pixel towards c (by up to a, more in the bright core by the window); the window's cross bar shows as a
  //  2 px darker cross through the pool, applied after the banding so it never rounds away. `skew` slants the beam: each pixel
  //  further from the window is shifted that many pixels sideways (+ = towards the south for side windows, towards the east for
  //  north/south ones), so the low morning and evening sun rakes across the floor while the midday pool stays square under the
  //  window. A patch can scale it (`skew: 0` for a pool boxed in by walls). Morning also scatters a few dust motes in the core.
  const WIN = {
    morning: { c: [255, 216, 140], a: 0.85, len: 1, core: 0.35, skew: 0.3, motes: true },   // low early sun: long, warm peach-gold, raking
    day: { c: [255, 244, 196], a: 0.34, len: 0.35, skew: 0 },                                 // pale yellow, a short square pool under the window
    evening: { c: [255, 160, 96], a: 0.44, len: 1, skew: -0.3 },                            // orange, long again, raking the other way
    night: { c: [159, 183, 255], a: 0.34, len: 0.8, skew: 0, dim: [0.62, 0.66, 0.84] },     // moonlight blue; the room goes dim
  };
  const MOTE = [255, 244, 208];
  C.roomPhase = (def) => (def && typeof def.lightPhase === 'function' && def.lightPhase()) || C.phase();
  // In the 3D view the pools lie on the floor: each screen pixel is traced back to the floor point under it (NP.view3d.unproject)
  // and lit by where that point falls in the patch, so the pool keeps its place and perspective instead of floating in screen space.
  function windowPools(fb, def, cx, cy) {
    const ph = C.roomPhase(def), L = WIN[ph], d = fb.data;
    const V = NP.view3d, in3d = !!(V && V.on && V.project && V.unproject && V.state && V.state());
    if (L.dim) for (let i = 0; i < d.length; i += 4) { d[i] *= L.dim[0]; d[i + 1] *= L.dim[1]; d[i + 2] *= L.dim[2]; }
    for (const w of def.windowLight || []) {
      const X0 = w.x * 16, Y0 = w.y * 16, W = w.w * 16, H = w.h * 16, ns = w.from === 'n' || w.from === 's';
      const along = ns ? H : W, span = ns ? W : H, reach = Math.max(16, along * L.len);
      const skew = (L.skew || 0) * (w.skew === undefined ? 1 : w.skew), shift = Math.ceil(reach * Math.abs(skew));
      // the area the slanted pool can reach: the patch widened sideways by the slant
      const BX0 = ns ? X0 - shift : X0, BY0 = ns ? Y0 : Y0 - shift, BW = ns ? W + 2 * shift : W, BH = ns ? H : H + 2 * shift;
      // the screen box to scan: that rectangle (flat), or the box round its four projected corners (3D)
      let sx0, sy0, sx1, sy1;
      if (in3d) {
        const cs = [[BX0, BY0], [BX0 + BW, BY0], [BX0, BY0 + BH], [BX0 + BW, BY0 + BH]].map(([x, y]) => V.project(x, y));
        if (cs.some((q) => !q)) continue;
        sx0 = Math.floor(Math.min(...cs.map((q) => q.x))); sx1 = Math.ceil(Math.max(...cs.map((q) => q.x)));
        sy0 = Math.floor(Math.min(...cs.map((q) => q.y))); sy1 = Math.ceil(Math.max(...cs.map((q) => q.y)));
      } else { sx0 = BX0 - cx; sy0 = BY0 - cy; sx1 = sx0 + BW; sy1 = sy0 + BH; }
      const bar = Math.round(reach * 0.42), mid = span >> 1;
      for (let yy = Math.max(0, sy0); yy < Math.min(fb.h, sy1); yy++) {
        for (let xx = Math.max(0, sx0); xx < Math.min(fb.w, sx1); xx++) {
          let i, j;
          if (in3d) {
            const q = V.unproject(xx + 0.5, yy + 0.5);
            if (!q) continue;
            i = Math.floor(q.x - X0); j = Math.floor(q.y - Y0);
          } else { i = xx + cx - X0; j = yy + cy - Y0; }
          // distance from the window side, then the sideways position with the slant taken out
          const t = w.from === 'n' ? j : w.from === 's' ? H - 1 - j : w.from === 'w' ? i : W - 1 - i;
          if (t < 0 || t >= reach) continue;
          const a = (ns ? i : j) - Math.round(t * skew);
          if (a < 0 || a >= span) continue;
          const side = Math.min(a, span - 1 - a);
          let k = L.a * (w.k || 1) * (1 - t / reach) * Math.min(1, (side + 1) / 4);
          if (L.core && t < reach * 0.35) k += L.core * (w.k || 1) * (1 - t / (reach * 0.35));   // the bright spill right under the sill
          k = Math.round(k * 8) / 8;                         // stepped, so the pool reads as pixel-art bands, not a blur
          if (a === mid || a === mid - 1 || t === bar || t === bar + 1) k *= 0.35;            // the window's cross bar
          if (L.motes && t < reach * 0.35 && (((i * 73856093) ^ (j * 19349663) ^ (w.x * 83492791)) >>> 0) % 211 === 0) k = 1;   // a dust mote
          if (k <= 0) continue;
          const p = (yy * fb.w + xx) * 4, c = k === 1 ? MOTE : L.c;
          d[p] += (c[0] - d[p]) * k; d[p + 1] += (c[1] - d[p + 1]) * k; d[p + 2] += (c[2] - d[p + 2]) * k;
        }
      }
    }
    if (ph === 'night') for (const g of def.nightGlow || []) {
      const wx = g.x * 16 + (g.w || 1) * 8, wy = g.y * 16 + 6, rad = 14 + 6 * (g.w || 1);
      if (in3d) { const q = V.project(wx, wy); if (q) glow(fb, q.x, q.y, Math.max(4, Math.round(rad * q.scale)), 0.45); }
      else glow(fb, wx - cx, wy - cy, rad, 0.45);
    }
  }
  C.drawRoom = function (fb, def, cx, cy) { if (def && def.indoor && (def.windowLight || def.nightGlow)) windowPools(fb, def, cx, cy); };

  C.draw = function (fb, def, cx, cy) {
    if (def && def.indoor) { C.drawRoom(fb, def, cx, cy); return; }
    if (!C.outdoors(def)) return;
    const ph = C.phase(), t = TINT[ph];
    if (t) tint(fb, t);
    if (ph !== 'night' && ph !== 'evening') return;
    const a = ph === 'night' ? 0.5 : 0.2;
    for (const s of def.stamps || []) {
      if (s.id !== 'lamp') continue;
      // the lantern head sits on the top tile of the 1x2 stamp
      const mx = s.x * 16 + 8, my = s.y * 16 + 6;
      if (NP.view3d && NP.view3d.on) {
        const q = NP.view3d.project(mx, s.y * 16 + 30);
        if (q) glow(fb, q.x, q.y - 24 * q.scale, Math.round(22 * q.scale), a);
      } else glow(fb, mx - cx, my - cy, 22, a);
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
