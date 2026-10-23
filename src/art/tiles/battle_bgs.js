/* src/art/tiles/battle_bgs.js — 256x144 battle backdrops in the 5th-generation manner: a scenic, layered view with depth
 * (sky, distant hills / treeline / buildings, a ground plane with perspective bands) and two elliptical platforms: the foe's
 * upper-right, the player's lower-left (close to the camera, its front edge hidden by the command panel).
 *
 * Each background is composed from layers by scene(o); everything is per-pixel, deterministic, no gradients (ordered dither
 * between bands only). Registered through K.battleBg(id, { paint, enemyBase, playerBase }); bases are the sprite anchor
 * points (feet) on each platform. playerBase.y lies below 144: the player's Kigu stands partly behind the command panel.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Bitmap, Color } = NP;
  const K = NP.art.tiles.kit;
  const W = 256, H = 144;
  const P = (c) => Color.q15(Color.parse(c));
  const FOE = { x: 188, y: 90, rx: 58, ry: 13 };
  const PLY = { x: 66, y: 140, rx: 86, ry: 19 };

  /** Dithered vertical bands: cols = [top..bottom], stops = y where each band starts (len = cols.length). */
  function bands(b, x0, x1, ys, cols, y0, y1) {
    for (let y = y0; y < y1; y++) {
      let i = 0;
      while (i + 1 < ys.length && y >= ys[i + 1]) i++;
      const next = Math.min(cols.length - 1, i + 1), span = (ys[next] || y1) - ys[i];
      const t = span > 0 ? (y - ys[i]) / span : 0;
      for (let x = x0; x < x1; x++) b.u32[y * W + x] = P(t > 0.75 && K.dith(x, y, (t - 0.75) * 4 * 0.5) ? cols[next] : cols[i]);
    }
  }
  /** 1D smooth noise in [-1,1] from a seed (sum of sines). */
  function wave(seed, x, f) {
    const r = K.rng(seed);
    let v = 0, n = 0;
    for (let h = 1; h <= 4; h++) { const ph = r.next() * 6.28, a = 1 / h; v += a * Math.sin(x * f * h * (0.8 + r.next() * 0.4) + ph); n += a; }
    return v / n;
  }
  /** Silhouette layer: from y = base - height(x) down to `to`, colour c (with an optional lit top rim). */
  function ridge(b, seed, base, amp, f, c, rim, to) {
    for (let x = 0; x < W; x++) {
      const top = Math.round(base - amp * (0.55 + 0.45 * wave(seed, x, f)));
      for (let y = Math.max(0, top); y < (to || base + 1); y++) b.u32[y * W + x] = P(rim && y === top ? rim : c);
    }
  }
  /** Rounded tree crowns along the horizon (forest edge). */
  function treeline(b, seed, base, h, cols) {
    const r = K.rng(seed);
    for (let x = -10; x < W + 10;) {
      const w = 10 + Math.floor(r.next() * 12), th = h * (0.7 + r.next() * 0.5), cx = x + w / 2, cy = base - th + w * 0.5;
      for (let y = Math.floor(cy - w * 0.6); y <= base; y++) for (let xx = Math.floor(cx - w * 0.7); xx <= cx + w * 0.7; xx++) {
        if (xx < 0 || xx >= W || y < 0 || y >= H) continue;
        const dx = (xx - cx) / (w * 0.7), dy = (y - cy) / (w * 0.6);
        if (y < cy && dx * dx + dy * dy > 1) continue;
        const lit = dx < -0.25 && dy < 0.2 ? 0 : dx > 0.35 || y > cy + w * 0.2 ? 2 : 1;
        b.u32[y * W + xx] = P(cols[lit]);
      }
      x += Math.floor(w * 0.7);
    }
  }
  /** Ground plane with perspective bands (mown-lawn stripes widening toward the camera). */
  function ground(b, y0, cols, freq) {
    for (let y = y0; y < H; y++) {
      const z = 60 / (y - y0 + 6);
      const k = Math.floor(z * (freq || 1));
      const frac = z * (freq || 1) - k;
      for (let x = 0; x < W; x++) {
        let i = k & 1;
        if (frac < 0.15 && K.dith(x, y, 0.5)) i = 1 - i;
        const deep = y < y0 + 6 ? 2 : i;
        b.u32[y * W + x] = P(cols[deep]);
      }
    }
  }
  /** The platform disc: a thick ellipse (side band), top surface with a lit back-left rim and a shaded front-right,
   *  an inner ring, and optional tufts on its edge. c = { top, light, dark, side, line, tuft } */
  function platform(b, p, c, o) {
    o = o || {};
    const th = Math.max(3, Math.round(p.ry * 0.35));
    const inE = (x, y, cx, cy, rx, ry) => { const dx = (x - cx) / rx, dy = (y - cy) / ry; return dx * dx + dy * dy; };
    const d = new Bitmap(W, H); // drawn apart, then outlined, so the silhouette edge is one clean line
    for (let y = Math.floor(p.y - p.ry - 2); y <= p.y + p.ry + th + 2; y++) {
      if (y < 0 || y >= H) continue;
      for (let x = Math.floor(p.x - p.rx - 2); x <= p.x + p.rx + 2; x++) {
        if (x < 0 || x >= W) continue;
        const e = inE(x, y, p.x, p.y, p.rx, p.ry);
        const s = inE(x, y, p.x, p.y + th, p.rx, p.ry);
        let col = null;
        if (e <= 1) {
          if (e > 0.86) col = (x - p.x) / p.rx + (y - p.y) / p.ry < -0.2 ? c.light : c.dark; // rim: lit back-left
          else if (e > 0.5 && e < 0.58) col = c.dark; // inner ring
          else col = (x - p.x) / p.rx * 0.6 + (y - p.y) / p.ry > 0.55 && K.dith(x, y, 0.5) ? c.dark : c.top;
        } else if (s <= 1 && y > p.y) col = s > 0.92 ? c.line : c.side;
        if (col) d.u32[y * W + x] = P(col);
      }
    }
    d.outline(P(c.line));
    b.blit(d, 0, 0);
    if (c.tuft) { // grass tufts along the front edge
      const r = K.rng(o.seed || 7);
      for (let i = 0; i < 14; i++) {
        const a = Math.PI * (0.1 + r.next() * 0.8), x = Math.round(p.x + Math.cos(a) * p.rx * 0.97), y = Math.round(p.y + Math.sin(a) * p.ry * 0.97);
        for (let k = 0; k < 3; k++) { const yy = y - k; if (yy >= 0 && yy < H && x >= 0 && x < W) b.u32[yy * W + x + (k === 2 ? (i & 1 ? 1 : -1) : 0)] = P(k === 0 ? c.dark : c.tuft); }
      }
    }
  }
  function clouds(b, seed, n, y0, y1, cols) {
    const r = K.rng(seed);
    for (let i = 0; i < n; i++) {
      const cx = r.next() * W, cy = y0 + r.next() * (y1 - y0), w = 14 + r.next() * 26;
      for (let j = 0; j < 4; j++) {
        const px = cx + (j - 1.5) * w * 0.35, py = cy - (j === 1 || j === 2 ? w * 0.12 : 0), rr = w * (j === 1 || j === 2 ? 0.32 : 0.24);
        for (let y = Math.floor(py - rr); y <= py + rr * 0.6; y++) for (let x = Math.floor(px - rr); x <= px + rr; x++) {
          if (x < 0 || x >= W || y < 0 || y >= H) continue;
          const d = ((x - px) ** 2 + (y - py) ** 2) / (rr * rr);
          if (d <= 1) b.u32[y * W + x] = P(y > py + rr * 0.25 ? cols[1] : cols[0]);
        }
      }
    }
  }
  function fill(b, y0, y1, c) { for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) b.u32[y * W + x] = P(c); }

  // ------------------------------------------------------------------------------------------------ the backgrounds
  const GRASS_PLAT = { top: '#90d868', light: '#c8f498', dark: '#5aa848', side: '#6a8a3c', line: '#3c5a30', tuft: '#4c9a40' };
  const reg = (id, paint, o) => K.battleBg(id, Object.assign({ paint, enemyBase: { x: FOE.x, y: FOE.y + 2 }, playerBase: { x: PLY.x, y: PLY.y + 8 } }, o || {}));

  reg('grass', () => {
    const b = new Bitmap(W, H);
    bands(b, 0, W, [0, 14, 30, 44], ['#5ab0f0', '#78c4f8', '#98d8fc', '#c4ecfc'], 0, 66);
    clouds(b, 'grass-c', 6, 10, 40, ['#ffffff', '#d8eefc']);
    ridge(b, 'grass-m', 60, 18, 0.03, '#94b8d8', '#b4d0e8', 66);
    ridge(b, 'grass-h', 64, 9, 0.05, '#6ca870', '#88c080', 70);
    treeline(b, 'grass-t', 70, 12, ['#5ca048', '#3e8640', '#2c6a3c']);
    ground(b, 70, ['#8cd060', '#7cc054', '#5aa448'], 1.2);
    platform(b, FOE, GRASS_PLAT, { seed: 3 });
    platform(b, PLY, GRASS_PLAT, { seed: 5 });
    return b;
  });

  reg('forest', () => {
    const b = new Bitmap(W, H);
    bands(b, 0, W, [0, 20, 40], ['#4c8c88', '#6aa89c', '#9cc8ac'], 0, 60);
    fill(b, 58, 76, '#1e4434'); // deep shade between the trunks
    ridge(b, 'for-1', 58, 30, 0.04, '#3a6c58', null, 62);
    treeline(b, 'for-2', 66, 26, ['#3e7a48', '#2c5e40', '#1e4434']);
    const r = K.rng('for-trunks'); // tree trunks in the middle distance
    for (let i = 0; i < 9; i++) {
      const x0 = Math.floor(r.next() * W), w = 3 + Math.floor(r.next() * 4);
      for (let y = 30; y < 74; y++) for (let x = x0; x < x0 + w && x < W; x++) b.u32[y * W + x] = P(x === x0 ? '#6a5040' : '#4a3832');
    }
    treeline(b, 'for-3', 46, 18, ['#4c8a50', '#346c44', '#24503a']);
    ground(b, 74, ['#6aa850', '#5c9a48', '#3e7a40'], 1);
    for (let y = 74; y < H; y++) for (let x = 0; x < W; x++) if (K.hf(x >> 3, y >> 2, 9) > 0.86 && K.dith(x, y, 0.5)) b.u32[y * W + x] = P('#8cc860'); // dappled light
    const plat = { top: '#7cbc58', light: '#a8dc80', dark: '#4c8c44', side: '#5a6a38', line: '#2c4430', tuft: '#3e7a40' };
    platform(b, FOE, plat, { seed: 2 });
    platform(b, PLY, plat, { seed: 4 });
    return b;
  });

  reg('indoor', () => {
    const b = new Bitmap(W, H);
    fill(b, 0, 58, '#e8dcc0'); // plaster wall
    for (let y = 0; y < 58; y += 1) for (let x = 0; x < W; x++) if ((x % 32 === 0) || y === 10) b.u32[y * W + x] = P('#d4c4a4');
    fill(b, 50, 58, '#a07048'); fill(b, 50, 51, '#c89060'); // wainscot rail
    for (const wx of [40, 176]) { // windows with light
      for (let y = 12; y < 40; y++) for (let x = wx; x < wx + 40; x++) b.u32[y * W + x] = P(x === wx || x === wx + 39 || y === 12 || y === 39 || x === wx + 20 || y === 26 ? '#8a6040' : y < 20 ? '#bfe6ff' : '#98d0f8');
    }
    for (let i = 0; i < 4; i++) for (let y = 30; y < 50; y++) for (let x = 100 + i * 14; x < 110 + i * 14; x++) b.u32[y * W + x] = P(y === 30 ? '#f8e8c8' : ['#e05a5a', '#5a8ae0', '#f0c040', '#6cbf6a'][i]); // fabric bolts
    for (let y = 58; y < H; y++) { // plank floor in perspective
      const z = 60 / (y - 52);
      for (let x = 0; x < W; x++) {
        const px = (x - 128) * z * 0.12 + 128, seam = Math.abs(px - Math.round(px / 8) * 8) < 0.4 * z * 0.12 + 0.25;
        b.u32[y * W + x] = P(seam ? '#a87040' : (Math.floor(px / 8) & 1) ? '#d8a068' : '#cc9460');
      }
    }
    const rug = { top: '#d86a7a', light: '#f8a0a8', dark: '#a84858', side: '#7a3444', line: '#4a2030' };
    platform(b, FOE, rug);
    platform(b, PLY, rug);
    return b;
  });

  reg('cave', () => {
    const b = new Bitmap(W, H);
    fill(b, 0, H, '#2c2230');
    ridge(b, 'cave-1', 70, 40, 0.06, '#4a3c44', '#5c4c50', 78);
    ridge(b, 'cave-2', 74, 20, 0.09, '#5a4844', '#6e5a50', 80);
    const r = K.rng('stal'); // stalactites
    for (let i = 0; i < 14; i++) {
      const x0 = r.next() * W, len = 8 + r.next() * 22, w = 3 + r.next() * 4;
      for (let y = 0; y < len; y++) for (let x = Math.floor(x0 - w * (1 - y / len)); x <= x0 + w * (1 - y / len); x++) if (x >= 0 && x < W) b.u32[y * W + x] = P(x < x0 ? '#5a4a50' : '#3e3240');
    }
    ground(b, 80, ['#7c6250', '#6e5648', '#4e3e3c'], 0.9);
    for (let y = 80; y < H; y++) for (let x = 0; x < W; x++) if (K.hf(x >> 2, y >> 1, 4) > 0.93) b.u32[y * W + x] = P('#9c7e64'); // pebbles
    const plat = { top: '#a08470', light: '#c4a88c', dark: '#76604e', side: '#5a4840', line: '#30262a' };
    platform(b, FOE, plat);
    platform(b, PLY, plat);
    return b;
  });

  reg('water', () => {
    const b = new Bitmap(W, H);
    bands(b, 0, W, [0, 18, 36], ['#64b8f4', '#8ccef8', '#bce4fc'], 0, 60);
    clouds(b, 'water-c', 5, 12, 44, ['#ffffff', '#dceffc']);
    ridge(b, 'water-i', 60, 8, 0.05, '#7ca8b8', '#9cc0cc', 62);
    for (let y = 62; y < H; y++) { // sea with sparkling ripple lines
      const z = 50 / (y - 56);
      for (let x = 0; x < W; x++) {
        const dash = Math.max(2, Math.round(14 / z)), ripple = y % 3 === 0 && K.hf(Math.floor((x + y * 7) / dash), y, 11) > 0.82;
        b.u32[y * W + x] = P(ripple ? '#d4f0ff' : y < 70 ? '#4a9ae0' : (Math.floor(z * 1.4) & 1) ? '#3e88d4' : '#4892dc');
      }
    }
    const pad = { top: '#6cc070', light: '#a0e090', dark: '#3e9a54', side: '#2e7a54', line: '#1e4a40' }; // lily-pad rafts
    platform(b, FOE, pad);
    platform(b, PLY, pad);
    return b;
  });

  reg('city', () => {
    const b = new Bitmap(W, H);
    bands(b, 0, W, [0, 20, 40], ['#78b8ec', '#9ccaf0', '#cce4f4'], 0, 64);
    const r = K.rng('city');
    for (let x = 0; x < W;) { // building silhouettes with windows
      const w = 18 + Math.floor(r.next() * 22), h = 18 + Math.floor(r.next() * 34), far = r.next() < 0.5;
      const c = far ? '#a8b8d0' : '#d8c8b8', d = far ? '#8c9cb8' : '#b0a090', top = 66 - h;
      for (let y = top; y < 66; y++) for (let xx = x; xx < x + w && xx < W; xx++) {
        const win = !far && (xx - x) % 6 > 2 && (y - top) % 7 > 3 && xx - x > 1 && xx - x < w - 2;
        b.u32[y * W + xx] = P(win ? '#6888b0' : xx === x ? d : y === top ? '#f0e8dc' : c);
      }
      x += w - (far ? 4 : 0);
    }
    ground(b, 66, ['#c8c4bc', '#bab6b0', '#8c8890'], 1.4);
    const plat = { top: '#e4e0d4', light: '#fcf8ec', dark: '#a8a4a4', side: '#84808c', line: '#4a4658' };
    platform(b, FOE, plat);
    platform(b, PLY, plat);
    return b;
  });

  reg('gym', () => {
    const b = new Bitmap(W, H);
    bands(b, 0, W, [0, 24, 46], ['#3a2c5c', '#54407c', '#7a5c9c'], 0, 64);
    for (let i = 0; i < 5; i++) { // spotlight beams
      const x0 = 30 + i * 50;
      for (let y = 0; y < 64; y++) for (let x = x0 - y * 0.35; x < x0 + 6 + y * 0.35; x++) if (K.dith(Math.floor(x), y, 0.5)) b.u32[y * W + Math.floor(x)] = P('#9c84c4');
    }
    fill(b, 58, 64, '#f4c542'); fill(b, 58, 59, '#fff098'); // stage edge banner
    for (let x = 0; x < W; x += 12) for (let y = 59; y < 64; y++) b.u32[y * W + x] = P('#c8902c');
    ground(b, 64, ['#e8e0f4', '#d8cce8', '#9c8cb8'], 1.6);
    const plat = { top: '#f4d4e0', light: '#fff0f8', dark: '#d098b4', side: '#a06890', line: '#5a3060' };
    platform(b, FOE, plat);
    platform(b, PLY, plat);
    return b;
  });

  reg('night', () => {
    const b = new Bitmap(W, H);
    bands(b, 0, W, [0, 22, 44], ['#141838', '#24285a', '#3c3c74'], 0, 66);
    for (let i = 0; i < 70; i++) { const x = Math.floor(K.hf(i, 1, 5) * W), y = Math.floor(K.hf(i, 2, 5) * 56); b.u32[y * W + x] = P(i % 7 ? '#c8d0ff' : '#ffffff'); }
    for (let y = 8; y < 30; y++) for (let x = 200; x < 222; x++) { const d = (x - 211) ** 2 + (y - 19) ** 2; if (d <= 100 && (x - 215) ** 2 + (y - 16) ** 2 > 70) b.u32[y * W + x] = P('#fff4c0'); } // crescent moon
    ridge(b, 'night-m', 60, 16, 0.03, '#2c3058', '#3c4070', 66);
    treeline(b, 'night-t', 70, 12, ['#2c4a58', '#1e3848', '#142a3a']);
    ground(b, 70, ['#3c6a5c', '#345e54', '#24443e'], 1.2);
    const plat = { top: '#4c7c64', light: '#6c9c7c', dark: '#30584c', side: '#284440', line: '#142424', tuft: '#2c5448' };
    platform(b, FOE, plat, { seed: 3 });
    platform(b, PLY, plat, { seed: 5 });
    return b;
  });

  K.BATTLE_BG = { w: W, h: H, foe: FOE, player: PLY };
})(typeof globalThis !== 'undefined' ? globalThis : window);
