/* src/engine/persp.js — NP.view3d: the pseudo-3D overworld view (tilted ground plane + upright 2D billboards), à la a late-era
 * handheld RPG street scene. Off by default (NP.view3d.on = false): the flat renderer in tilemap.js is untouched.
 *
 * How it works (all CPU, all in a Bitmap, so it runs headless):
 *  1. Ground: the map's terrain is rendered flat once into an off-screen "ground" bitmap (with a margin of border tiles round it;
 *     re-rendered when the animation frame or the grid changes). Each screen row is then a perspective slice of that bitmap
 *     (classic mode-7: per-row scale, nearest-neighbour sampling), faded towards a fog colour with distance.
 *  2. Billboards: stamps (houses, trees, props) and actors are drawn as upright sprites, scaled by the depth of their base point,
 *     sorted far-to-near. Actors are first drawn flat into a small scratch bitmap through their normal draw(fb, camX, camY).
 *  Camera: pivots on the map pixel at screen centre (camX+120, camY+80) — the overworld passes the player — and sits `f` map pixels
 *  behind it looking north (yaw 0). The pivot lands on screen row `pivotRow`, where the scale is exactly 1 (pixel-perfect there).
 *
 *  Tuning: NP.view3d.cfg = { f, hz, pivotRow, fogStart, fogEnd, fog, yaw }.   Presets: NP.view3d.preset('street'|'town'|'flat-ish').
 *  API: on, toggle(), draw(tm, fb, camX, camY, tick, actors), project(mapX, mapY) -> {x, y, scale} | null (for emotes, arrows...).
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Bitmap } = NP;
  const T = 16, SW = 240, SH = 160, MARGIN = 14;

  const PRESETS = {
    street: { f: 210, hz: -64, pivotRow: 102, fogStart: 120, fogEnd: 520, fog: '#bcd8f2', yaw: 0 },
    town: { f: 260, hz: -90, pivotRow: 98, fogStart: 160, fogEnd: 640, fog: '#c4dcef', yaw: 0 },
    'flat-ish': { f: 420, hz: -160, pivotRow: 92, fogStart: 300, fogEnd: 1200, fog: '#cfe3f3', yaw: 0 },
  };

  const V = {
    on: false,
    cfg: Object.assign({}, PRESETS.street),
    _ground: null, _last: null,
    toggle() { V.on = !V.on; return V.on; },
    preset(name) { Object.assign(V.cfg, PRESETS[name] || PRESETS.street); },
  };

  function packFog(c) { return NP.Color.parse(c) >>> 0; }

  // ------------------------------------------------------------------------------------------------ ground cache
  function groundFor(tm, tick) {
    const key = tick >> 4;
    let g = V._ground;
    const gw = (tm.w + MARGIN * 2) * T, gh = (tm.h + MARGIN * 2) * T;
    if (g && g.tm === tm && g.w === gw && g.key === key && sameGrid(g.grid, tm.grid)) return g;
    if (!g || g.w !== gw || g.h !== gh) g = { bmp: new Bitmap(gw, gh), w: gw, h: gh };
    g.tm = tm; g.key = key; g.grid = tm.grid.slice();
    tm.drawTerrain(g.bmp, -MARGIN * T, -MARGIN * T, tick, gw, gh);
    V._ground = g;
    return g;
  }
  function sameGrid(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  // ------------------------------------------------------------------------------------------------ projection
  function frameState(camX, camY) {
    const c = V.cfg, hh = c.pivotRow - c.hz, s = Math.sin(c.yaw || 0), co = Math.cos(c.yaw || 0);
    return { f: c.f, hz: c.hz, hh, px: camX + 120, py: camY + 80, Rx: co, Ry: s, Fx: s, Fy: -co };
  }
  function project(st, x, y) {
    const dx = x - st.px, dy = y - st.py;
    const u = dx * st.Rx + dy * st.Ry, v = dx * st.Fx + dy * st.Fy, Z = st.f + v;
    if (Z < st.f * 0.25) return null;
    const scale = st.f / Z;
    return { x: 120 + u * scale, y: st.hz + st.hh * scale, scale, v };
  }
  V.project = (x, y) => (V._last ? project(V._last, x, y) : null);

  // ------------------------------------------------------------------------------------------------ scaled sprite
  /** nearest-neighbour scaled blit of src (whole bitmap) with its anchor (ax, ay) placed at screen (X, Y); fog t in 0..1. */
  function sprite(fb, src, ax, ay, X, Y, scale, fogT, fogC) {
    const dw = Math.max(1, Math.round(src.w * scale)), dh = Math.max(1, Math.round(src.h * scale));
    const x0 = Math.round(X - ax * scale), y0 = Math.round(Y - ay * scale);
    const du = fb.u32, su = src.u32, W = fb.w, H = fb.h;
    const fr = fogC & 255, fg = (fogC >>> 8) & 255, fbl = (fogC >>> 16) & 255;
    const ya = Math.max(0, -y0), yb = Math.min(dh, H - y0), xa = Math.max(0, -x0), xb = Math.min(dw, W - x0);
    for (let y = ya; y < yb; y++) {
      const sy = Math.min(src.h - 1, Math.floor(y / scale + 0.0001)) * src.w;
      const di = (y0 + y) * W + x0;
      for (let x = xa; x < xb; x++) {
        let c = su[sy + Math.min(src.w - 1, Math.floor(x / scale + 0.0001))];
        const a = c >>> 24;
        if (a < 128) continue;
        if (fogT > 0.02) {
          const r = (c & 255) + (fr - (c & 255)) * fogT, g = ((c >>> 8) & 255) + (fg - ((c >>> 8) & 255)) * fogT, b = ((c >>> 16) & 255) + (fbl - ((c >>> 16) & 255)) * fogT;
          c = (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
        } else c |= 0xff000000;
        du[di + x] = c >>> 0;
      }
    }
  }

  // ------------------------------------------------------------------------------------------------ the frame
  const scratch = { bmp: null };
  V.draw = function (tm, fb, camX, camY, tick, actors) {
    const A = NP.assets, c = V.cfg, st = frameState(camX, camY);
    V._last = st;
    const fogC = packFog(c.fog), fogR = fogC & 255, fogG = (fogC >>> 8) & 255, fogB = (fogC >>> 16) & 255;
    const g = groundFor(tm, tick), gu = g.bmp.u32, gw = g.w, gh = g.h;
    const du = fb.u32;
    const offX = MARGIN * T, offY = MARGIN * T;
    // ---- ground, one perspective slice per screen row
    for (let r = 0; r < SH; r++) {
      const d = r - c.hz, row = r * SW;
      if (d <= 0) { for (let x = 0; x < SW; x++) du[row + x] = fogC | 0xff000000; continue; }
      const scale = d / st.hh, Z = c.f / scale, v = Z - c.f;
      const fogT = Math.max(0, Math.min(1, (v - c.fogStart) / (c.fogEnd - c.fogStart)));
      const inv = 1 / scale;
      for (let sx = 0; sx < SW; sx++) {
        const u = (sx - 120) * inv;
        const mx = Math.floor(st.px + u * st.Rx + v * st.Fx) + offX, my = Math.floor(st.py + u * st.Ry + v * st.Fy) + offY;
        let col;
        if (mx < 0 || my < 0 || mx >= gw || my >= gh) col = fogC | 0xff000000;
        else {
          col = gu[my * gw + mx];
          if (fogT > 0.02) {
            const rr = (col & 255) + (fogR - (col & 255)) * fogT, gg = ((col >>> 8) & 255) + (fogG - ((col >>> 8) & 255)) * fogT, bb = ((col >>> 16) & 255) + (fogB - ((col >>> 16) & 255)) * fogT;
            col = 0xff000000 | (bb << 16) | (gg << 8) | rr;
          }
        }
        du[row + sx] = col >>> 0;
      }
    }
    // ---- billboards: stamps + actors, far to near
    const items = [];
    for (const p of tm.objs) {
      const q = project(st, (p.x + p.w / 2) * T, (p.y + p.h) * T);
      if (!q) continue;
      items.push({ v: q.v, order: 0, q, p });
    }
    for (const a of actors || []) {
      const ax = a.x !== undefined ? a.x : camX + 128, q = project(st, ax, a.sortY);
      if (!q) continue;
      items.push({ v: q.v, order: 1, q, a, ax });
    }
    items.sort((a, b) => b.v - a.v || a.order - b.order);
    for (const e of items) {
      const q = e.q, fogT = Math.max(0, Math.min(1, (q.v - c.fogStart) / (c.fogEnd - c.fogStart)));
      if (e.p) {
        const bmp = A.stamp(e.p.id, e.p.variant, A.frameAt(e.p.def, tick));
        if (q.x + bmp.w * q.scale / 2 < 0 || q.x - bmp.w * q.scale / 2 > SW || q.y - bmp.h * q.scale > SH || q.y < 0) continue;
        sprite(fb, bmp, bmp.w / 2, bmp.h, q.x, q.y, q.scale, fogT, fogC);
      } else {
        if (q.x < -40 || q.x > SW + 40 || q.y < 0 || q.y - 56 * q.scale > SH) continue;
        const s = scratch.bmp || (scratch.bmp = new Bitmap(64, 64));
        s.u32.fill(0);
        e.a.draw(s, e.ax - 32, e.a.sortY - 56);
        sprite(fb, s, 32, 56, q.x, q.y, q.scale, fogT, fogC);
      }
    }
  };

  NP.view3d = V;
})(typeof globalThis !== 'undefined' ? globalThis : window);
