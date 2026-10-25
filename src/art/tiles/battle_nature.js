/* src/art/tiles/battle_nature.js — outdoor battle backgrounds: grass, forest, water, night. See battle_kit.js for the stage layout
 * (256x144, horizon y 60, foe platform centred (188,88), player platform centred (66,142)). */
(function (root) {
  'use strict';
  const NP = root.NP;
  const M = Math;
  const K = NP.art.tiles.kit;
  const BB = K.bb;
  const { rgb, mix, ramp, px, glow, sstep, clamp, lerp, noise, hf } = BB;
  const W = BB.W, H = BB.H, HY = BB.HY;
  const tint = (o) => Object.assign({ rim: ['#c4d8e4', '#6a86a2'], edge: ['#5a809a', '#36526e'], halo: '#1c3450' }, o);

  /** cloth-bolt windmill, tower height h; haze = [rgb, amount] pulls it toward the distance colour */
  function windmill(b, x, by, h, hz, rot) {
    const f = (c) => mix(rgb(c), hz[0], hz[1]);
    const wall = [f('#fffaec'), f('#eadcc8'), f('#c9b6b8')], roof = [f('#f69480'), f('#dc6060'), f('#a84660')];
    const top = by - h, wb = h * 0.28, wt = h * 0.17;
    BB.poly(b, [[x - wb, by], [x - wt, top], [x + wt, top], [x + wb, by]], (xx, yy) => {
      const hw = lerp(wt, wb, clamp((yy + 0.5 - top) / (by - top), 0, 1)), t = (xx + 0.5 - (x - hw)) / (2 * hw);
      return t < 0.3 ? wall[0] : t < 0.74 ? wall[1] : wall[2];
    });
    BB.poly(b, [[x - wt - 1.2, top + 0.5], [x, top - h * 0.3], [x + wt + 1.2, top + 0.5]], (xx) => (xx + 0.5 < x ? roof[0] : roof[2]));
    px(b, x, by - 1, f('#7a5460'), 1); px(b, x - 1, by - 1, f('#7a5460'), 1);
    px(b, x, top + h * 0.35, f('#8ccaf0'), 1);
    px(b, x, top + h * 0.6, f('#8ccaf0'), 1);
    const hx = x, hy = top - h * 0.02, L = h * 1.0, cloth = ['#fffaf0', '#f6a8bc', '#82d2cc', '#f8dc72'];
    for (let k = 0; k < 4; k++) {
      const a = rot + (k * M.PI) / 2, ux = M.cos(a), uy = M.sin(a), nx = -uy, ny = ux;
      const c0 = 0.28, c1 = 0.96, wd = 2.4 + h * 0.03;
      BB.poly(b, [[hx + ux * L * c0, hy + uy * L * c0], [hx + ux * L * c1, hy + uy * L * c1], [hx + ux * L * c1 + nx * wd, hy + uy * L * c1 + ny * wd], [hx + ux * L * c0 + nx * wd, hy + uy * L * c0 + ny * wd]], f(cloth[k]), 1);
      for (let s = 0; s <= L; s += 0.5) px(b, hx + ux * s, hy + uy * s, f('#8a6a5a'), 1);
    }
    BB.glow(b, hx, hy, 1.8, 1.8, f('#e8c890'), 1, 0.5);
  }
  BB.windmill = windmill;

  /** the shared outdoor sky: gradient down to the haze band (t = 1 at y = HY + 6) with a soft sun wash in the top-left */
  function skyGrad(b, stops, sun) {
    const g = ramp(stops);
    BB.vgrad(b, 0, HY + 14, (y) => g(y / (HY + 6)));
    if (sun) BB.glow(b, 6, -10, 156, 116, sun, 0.3, 1.3);
  }
  /** the shared ground plane: gradient from the haze line to the bottom, a warm wash on the left, a cool falloff bottom-right */
  function groundGrad(b, stops, y0, soft, warm, cool, coolA) {
    const g = ramp(stops);
    BB.vgrad(b, y0, H, (y) => g((y - y0) / (H - y0)), soft);
    BB.glow(b, 24, HY + 12, 140, 46, warm, 0.2, 1.2);
    BB.glow(b, 254, H, 150, 82, cool, coolA === undefined ? 0.22 : coolA, 1.3);
  }

  // ================================================================================================ grass
  /** patchwork hill: squares of field colours with faint stitched seams */
  function patchRidge(b, o) {
    const pal = o.pal.map(rgb), thread = rgb(o.thread);
    return BB.ridge(b, {
      base: o.base, h: o.h,
      color: (x, y, d) => {
        const u = (x + (y - o.base) * 0.5) / o.cw, v = (y - 42) / o.ch, iu = M.floor(u), iv = M.floor(v), fu = u - iu, fv = v - iv;
        const hh = hf(iu, iv, o.seed);
        let c = pal[(hh * pal.length) | 0];
        c = mix(c, hh > 0.5 ? [255, 250, 226] : [70, 120, 110], 0.07);
        if (d < 1.6) c = mix(c, [255, 255, 236], 0.28);
        if ((fu < 0.07 || fv < 0.16) && ((x + y) & 3) < 2) c = mix(c, thread, 0.42);
        return mix(c, o.hazeC, o.hazeA + 0.22 * sstep(0, 10, d));
      },
    });
  }

  const HAZE_G = rgb('#f2f6e0');
  BB.define('grass', Object.assign(BB.stage(tint({ rim: ['#c6dce0', '#6a8aa0'], edge: ['#5a8499', '#36546c'], halo: '#1e3a4c' })), {
    sky(b) {
      skyGrad(b, [[0, '#3a82e4'], [0.3, '#6cb0f0'], [0.62, '#a8d6f6'], [0.86, '#dcf0f2'], [1, '#f2f6e0']], '#fff2c4');
      // high stratus bands, then fair-weather puffs sitting on the haze
      BB.streak(b, 186, 8, 74, 3.4, 1, '#ffffff', 0.5);
      BB.streak(b, 74, 17, 66, 3, 2, '#ffffff', 0.34);
      BB.streak(b, 222, 27, 48, 3.2, 3, '#ffffff', 0.42);
      BB.streak(b, 128, 36, 86, 2.6, 4, '#ffffff', 0.3);
      BB.streak(b, 40, 45, 60, 2.4, 9, '#ffffff', 0.26);
      BB.puff(b, 230, 50, 58, 14, 3, { a: 0.85 });
      BB.puff(b, 138, 55, 42, 9, 5, { a: 0.7 });
      BB.puff(b, 28, 56, 50, 11, 7, { a: 0.75 });
      // far hills (blue-green haze)
      BB.ridge(b, { base: 66, h: BB.hills(3, 15, 0.033, 6), color: (x, y, d) => mix(mix(rgb('#8cc2bc'), rgb('#b0d8c4'), sstep(0, 3, 3 - d)), HAZE_G, 0.16 + 0.5 * sstep(0, 14, d)) });
      // patchwork mid hills, windmill on the right
      const tops = patchRidge(b, { base: 71, h: BB.hills(9, 10, 0.047, 3), seed: 5, cw: 14, ch: 3.8, thread: '#fff6c8', hazeC: HAZE_G, hazeA: 0.04,
        pal: ['#9ad878', '#7cc866', '#e4dc8c', '#b2e284', '#8fd08a', '#9ad878', '#f0c4c4'] });
      windmill(b, 238, tops[238] + 4, 23, [HAZE_G, 0.1], -0.5);
      for (const [tx, th] of [[12, 13], [28, 11], [100, 12], [115, 10], [252, 12], [136, 9], [216, 8]]) BB.tree(b, tx, tops[tx] + 3, th, { haze: [HAZE_G, 0.22] });
    },
    ground(b) {
      groundGrad(b, [[0, '#d8f2b8'], [0.16, '#b8e690'], [0.5, '#8ccd70'], [1, '#5fb066']], 63, 10, '#fff8d0', '#27508a');
      BB.plane(b, { yh: HY, vx: 140, kx: 3.4, kz: 330, cell: (b2, x, y, iu) => { if (iu & 1) px(b2, x, y, [255, 255, 215], 0.05); } });
      BB.scatter(15, 12, 0, 74, W, 140, (x, y) => BB.free(x, y, 3), (x, y, r, k) => {   // a few meadow flowers in the open corners
        BB.glow(b, x, y + 1.5, 4, 1.5, '#2c6a44', 0.22, 1);
        const c = [[255, 140, 176], [255, 252, 232], [255, 228, 92]][k % 3];
        px(b, x, y, c, 1); px(b, x - 1, y, c, 0.8); px(b, x + 1, y, c, 0.8); px(b, x, y - 1, c, 0.8); px(b, x, y + 1, c, 0.8);
        px(b, x, y, [255, 176, 64], 1);
      });
    },
  }));

  // ================================================================================================ desert (Route 4, the Dust Bowl, Bobbin Quarry)
  /** a flat-topped sandstone mesa: lit left face, shaded right face, a few strata lines, hazed toward the distance */
  function mesa(b, x0, x1, top, base, hz) {
    const f = (c) => mix(rgb(c), hz[0], hz[1]);
    const lit = f('#f0c890'), mid = f('#dca46c'), dark = f('#b47a54'), seam = f('#c48a5c'), cap = f('#fae0b0');
    const slope = (base - top) * 0.35;
    BB.poly(b, [[x0, base], [x0 + slope, top], [x1 - slope, top], [x1, base]], (x, y) => {
      const t = (x + 0.5 - x0) / (x1 - x0);
      let c = t < 0.22 ? lit : t < 0.78 ? mid : dark;
      if (((y - top) | 0) % 5 === 3 && t > 0.1 && t < 0.92) c = seam;
      return c;
    });
    BB.poly(b, [[x0 + slope - 1, top + 1.5], [x0 + slope, top], [x1 - slope, top], [x1 - slope + 1, top + 1.5]], cap, 1);
  }
  /** a saguaro-style cactus: trunk plus one or two arms, lit on the left */
  function cactus(b, x, by, h, hz) {
    const f = (c) => mix(rgb(c), hz[0], hz[1]);
    const lit = f('#8cd070'), mid = f('#5aa452'), dark = f('#3a7a44');
    const col = (xx, x0, w) => ((xx + 0.5 - x0) / w < 0.34 ? lit : (xx + 0.5 - x0) / w < 0.72 ? mid : dark);
    const w = M.max(2, h * 0.22);
    BB.paint(b, M.round(x - w / 2), M.round(by - h), M.round(x + w / 2), M.round(by), (xx) => col(xx, x - w / 2, w));
    const ay = by - h * 0.55, aw = w * 0.8;
    BB.paint(b, M.round(x - w / 2 - aw * 1.6), M.round(ay), M.round(x - w / 2), M.round(ay + aw), () => mid);
    BB.paint(b, M.round(x - w / 2 - aw * 1.6), M.round(ay - h * 0.28), M.round(x - w / 2 - aw * 0.6), M.round(ay + aw), (xx) => col(xx, x - w / 2 - aw * 1.6, aw));
    if (h > 9) {
      const by2 = by - h * 0.4;
      BB.paint(b, M.round(x + w / 2), M.round(by2), M.round(x + w / 2 + aw * 1.4), M.round(by2 + aw), () => dark);
      BB.paint(b, M.round(x + w / 2 + aw * 0.4), M.round(by2 - h * 0.22), M.round(x + w / 2 + aw * 1.4), M.round(by2 + aw), (xx) => col(xx, x + w / 2 + aw * 0.4, aw));
    }
  }
  const HAZE_D = rgb('#fbeed2');
  BB.define('desert', Object.assign(BB.stage(tint({ rim: ['#f2dcb4', '#b08a62'], edge: ['#b0845a', '#7a5438'], halo: '#4a2c1c' })), {
    sky(b) {
      skyGrad(b, [[0, '#3c8ce0'], [0.3, '#78b8ec'], [0.6, '#b8dcf0'], [0.84, '#f2ecd8'], [1, '#fbeed2']], '#fff0c0');
      BB.streak(b, 192, 10, 70, 3, 21, '#ffffff', 0.42);
      BB.streak(b, 70, 20, 60, 2.6, 22, '#ffffff', 0.3);
      BB.streak(b, 230, 30, 40, 2.4, 23, '#ffffff', 0.3);
      // far mesas in the haze, then low dunes
      mesa(b, 4, 62, 44, 70, [HAZE_D, 0.45]);
      mesa(b, 150, 196, 49, 70, [HAZE_D, 0.5]);
      mesa(b, 206, 258, 40, 70, [HAZE_D, 0.38]);
      BB.ridge(b, { base: 68, h: BB.hills(41, 7, 0.028, 2), color: (x, y, d) => mix(mix(rgb('#f6d8a0'), rgb('#e2b47c'), sstep(0, 6, d)), HAZE_D, 0.18 + 0.3 * sstep(0, 10, d)) });
      const tops = BB.ridge(b, { base: 72, h: BB.hills(47, 6, 0.04, 1), color: (x, y, d) => mix(d < 1.4 ? rgb('#fff0c8') : mix(rgb('#f2cc8c'), rgb('#d8a468'), sstep(0, 5, d)), HAZE_D, 0.06 + 0.2 * sstep(2, 10, d)) });
      for (const [cx, ch] of [[24, 11], [120, 8], [242, 12], [96, 6]]) cactus(b, cx, tops[cx] + 3, ch, [HAZE_D, 0.18]);
    },
    ground(b) {
      groundGrad(b, [[0, '#fff0cc'], [0.16, '#f6dca4'], [0.5, '#eac084'], [1, '#d09a62']], 63, 10, '#fff8d8', '#6a3a28', 0.18);
      // wind ripples: soft curved bands across the sand
      BB.plane(b, { yh: HY, vx: 136, kx: 3.2, kz: 300, cell: (b2, x, y, iu, iv) => { if ((iv & 3) === 0) px(b2, x, y, [190, 128, 80], 0.08); else if ((iv & 3) === 1) px(b2, x, y, [255, 250, 225], 0.07); } });
      BB.scatter(31, 10, 0, 76, W, 140, (x, y) => BB.free(x, y, 3), (x, y, r, k) => {   // pebbles and a few tufts of dry grass
        BB.glow(b, x, y + 1.2, 3, 1.2, '#7a4a30', 0.22, 1);
        if (k % 3) { px(b, x, y, [196, 150, 112], 1); px(b, x + 1, y, [160, 116, 86], 1); px(b, x, y - 1, [236, 206, 170], 1); }
        else for (let i = -1; i <= 1; i++) { px(b, x + i, y, [176, 160, 84], 1); px(b, x + i * 1.6, y - 2, [206, 196, 110], 0.9); }
      });
    },
  }));

  // ================================================================================================ forest (Gingham Woods)
  const HAZE_F = rgb('#eef3c0');
  BB.define('forest', Object.assign(BB.stage(tint({ rim: ['#bcd8c6', '#587f7c'], edge: ['#487a7a', '#2a4858'], halo: '#143436' })), {
    sky(b) {
      skyGrad(b, [[0, '#2a6a66'], [0.26, '#3f8a66'], [0.56, '#80c470'], [0.84, '#d0e89c'], [1, '#f0f4c6']], '#fff0b4');
      for (const [x0, w0, w1, a] of [[100, 5, 17, 0.2], [140, 4, 18, 0.24], [184, 5, 20, 0.2], [230, 5, 16, 0.18]]) BB.shaft(b, x0, -8, x0 + 74, 86, w0, w1, '#fff6c0', a);
      // layered tree-lines receding into the haze, with hazy trunks
      BB.ridge(b, { base: 68, h: BB.hills(21, 17, 0.1, 7), color: (x, y, d) => mix(rgb('#9cca8c'), HAZE_F, 0.4 + 0.4 * sstep(0, 16, d)) });
      for (let x = 3; x < W; x += 9) { const hh = hf(x, 5, 9); BB.poly(b, [[x, 46 + hh * 10], [x + 1.4, 46 + hh * 10], [x + 1.4, 70], [x, 70]], mix(rgb('#5a8a64'), HAZE_F, 0.45), 0.5); }
      BB.ridge(b, { base: 71, h: BB.hills(33, 13, 0.13, 4), color: (x, y, d) => mix(mix(rgb('#70b872'), rgb('#4e9c68'), sstep(0, 14, d)), HAZE_F, 0.16 + 0.34 * sstep(4, 18, d)) });
      for (const x of [10, 48, 90, 117, 133, 236]) BB.tree(b, x, 74, 21 + hf(x, 2, 2) * 5, { hi: '#c4ea78', mid: '#6cb458', lo: '#2a7654', trunk: '#6a5448', haze: [HAZE_F, 0.2] });
      // canopy overhang with light peeking through: a dense top row and a ragged lower fringe
      for (let x = -8; x < W + 10; x += 12) {
        const j = hf(x, 3, 7);
        BB.lobe(b, x + j * 6, -1 + j * 6, 12 + j * 5, 8 + hf(x, 4, 7) * 6, rgb('#7cd078'), rgb('#2c8460'), rgb('#124a4c'), 1);
      }
      for (let x = -4; x < W + 8; x += 17) {
        const j = hf(x, 13, 7);
        if (j < 0.35) continue;
        BB.lobe(b, x + j * 8, 11 + j * 5, 7 + j * 3, 5 + j * 2, rgb('#86d67c'), rgb('#33906a'), rgb('#185650'), 1);
      }
      BB.scatter(7, 20, 0, 2, W, 20, null, (x, y, r) => BB.glow(b, x, y, 2 + r * 2.4, 1.6 + r * 1.6, '#fffbd0', 0.55, 1));
      // festival lanterns strung through the branches
      const lx0 = 124, lx1 = 252, sag = (t) => lerp(14, 12, t) + 13 * M.sin(M.PI * t);
      for (let x = lx0; x <= lx1; x += 0.5) px(b, x, sag((x - lx0) / (lx1 - lx0)), [118, 84, 70], 0.75);
      [0.1, 0.26, 0.42, 0.58, 0.74, 0.9].forEach((t, k) => {
        const x = lx0 + (lx1 - lx0) * t, y = sag(t) + 3.5;
        BB.glow(b, x, y + 1, 8, 8, ['#ffb04a', '#ff8a6a', '#ffd060'][k % 3], 0.42, 1.3);
        BB.poly(b, [[x - 1.8, y - 1.5], [x + 1.8, y - 1.5], [x + 2.3, y + 2.5], [x - 2.3, y + 2.5]], ['#ff9a3c', '#f2605a', '#ffc040'][k % 3], 1);
        px(b, x - 1, y, [255, 244, 170], 1);
      });
    },
    ground(b) {
      const g = ramp([[0, '#e2f0a8'], [0.16, '#b6dc7c'], [0.5, '#7cba60'], [1, '#3e8454']]);
      BB.vgrad(b, 65, H, (y) => g((y - 65) / (H - 65)), 10);
      for (const [cx, cy, rx, ry, a] of [[106, 77, 38, 8, 0.24], [236, 90, 30, 7, 0.2], [18, 92, 30, 8, 0.18], [128, 112, 34, 9, 0.16]]) BB.glow(b, cx, cy, rx, ry, '#fff8c4', a, 1.1);
      BB.glow(b, 254, H, 150, 82, '#10385a', 0.22, 1.3);
      BB.plane(b, { yh: HY, vx: 128, kx: 2.6, kz: 210, cell: (b2, x, y, iu, iv) => { const a = (iu & 1 ? 0.045 : 0) + (iv & 1 ? 0.045 : 0); if (a) px(b2, x, y, [255, 255, 215], a); } });
      // a big near trunk framing the right edge, tucked into the canopy
      BB.poly(b, [[245, -2], [258, -2], [258, H], [243, H]], (x, y) => { const t = clamp((x - 243) / 14, 0, 1), k = 0.5 + 0.5 * M.sin(y * 0.35 + x); return t < 0.3 ? mix(rgb('#9a7660'), rgb('#7e6050'), k * 0.4) : t < 0.66 ? mix(rgb('#684e4c'), rgb('#5a4446'), k * 0.5) : rgb('#3c3044'); });
      BB.glow(b, 248, 30, 5, 20, '#86d676', 0.4, 1);
      BB.glow(b, 249, 110, 4, 12, '#2c5a3c', 0.3, 1);
      for (const [lx, ly, r] of [[241, 3, 12], [254, 6, 11], [248, 11, 9]]) BB.lobe(b, lx, ly, r, r * 0.7, rgb('#7cd078'), rgb('#2c8460'), rgb('#124a4c'), 1);
      BB.scatter(11, 9, 0, 72, W, 140, (x, y) => BB.free(x, y, 3), (x, y) => {   // tiny mushrooms
        BB.glow(b, x, y + 1.5, 4, 1.6, '#1c4a3c', 0.3, 1);
        px(b, x, y + 1, [250, 240, 214], 1); px(b, x, y + 0, [250, 240, 214], 1);
        BB.poly(b, [[x - 2, y], [x + 2, y], [x + 1.5, y - 2], [x - 1.5, y - 2]], [232, 84, 84], 1);
        px(b, x - 1, y - 1, [255, 244, 236], 1);
      });
    },
  }));

  // ================================================================================================ water
  const HAZE_W = rgb('#eef8fa');
  BB.define('water', Object.assign(BB.stage(tint({ rim: ['#c4e0e8', '#6698b2'], edge: ['#4888a8', '#285878'], halo: '#123e5c', foam: 0.5 })), {
    sky(b) {
      skyGrad(b, [[0, '#2a74d8'], [0.3, '#60acee'], [0.62, '#a2d4f4'], [0.86, '#dcf0f8'], [1, '#f0f8fa']], '#fff4cc');
      BB.streak(b, 180, 9, 72, 3.4, 11, '#ffffff', 0.5);
      BB.streak(b, 62, 20, 64, 3, 12, '#ffffff', 0.32);
      BB.streak(b, 226, 30, 44, 3.2, 13, '#ffffff', 0.4);
      BB.streak(b, 120, 40, 70, 2.4, 14, '#ffffff', 0.26);
      BB.puff(b, 38, 58, 62, 14, 21, { a: 0.8 });
      BB.puff(b, 154, 58, 54, 11, 22, { a: 0.7 });
      BB.puff(b, 222, 56, 50, 13, 23, { a: 0.85 });
      // a hazy island with a striped lighthouse
      BB.ridge(b, { base: 66, h: (x) => 13 * M.exp(-(((x - 238) / 26) ** 2)) + 3.5 * noise(x * 0.2, 4) * M.exp(-(((x - 238) / 42) ** 2)), color: (x, y, d) => mix(mix(rgb('#7fb9b4'), rgb('#9ccdb8'), sstep(0, 3, 3 - d)), HAZE_W, 0.2 + 0.5 * sstep(0, 10, d)) });
      const lx = 236, ly = 57, lh = 17, hz = (c) => mix(rgb(c), HAZE_W, 0.12);
      BB.poly(b, [[lx - 3.4, ly], [lx - 2.2, ly - lh], [lx + 2.2, ly - lh], [lx + 3.4, ly]], (x, y) => ((M.floor((y - ly + lh) / 4) & 1) ? hz('#e8605c') : hz('#fff8f0')));
      BB.poly(b, [[lx - 3.2, ly - lh], [lx, ly - lh - 4.5], [lx + 3.2, ly - lh]], hz('#c8484c'), 1);
      BB.glow(b, lx, ly - lh - 1, 6, 5, '#fff2a0', 0.9, 1);
      // sailboat with a patchwork sail
      const sx = 132, sy = 65, sm = (c) => mix(rgb(c), HAZE_W, 0.12);
      BB.poly(b, [[sx - 6, sy], [sx + 6, sy], [sx + 3.5, sy + 2.5], [sx - 3.5, sy + 2.5]], sm('#a26c58'), 1);
      BB.poly(b, [[sx, sy - 1], [sx, sy - 14], [sx + 6, sy - 1]], (x, y) => (y < sy - 9 ? sm('#fff8ec') : x > sx + 2 ? sm('#f4a0b8') : sm('#fff1b8')), 1);
      BB.poly(b, [[sx - 0.8, sy - 1], [sx - 0.8, sy - 10], [sx - 5, sy - 1]], sm('#fff8ec'), 1);
    },
    ground(b) {
      const sea = ramp([[0, '#c6f0f2'], [0.1, '#94e0ec'], [0.4, '#56b8e8'], [1, '#2a6cc4']]);
      BB.vgrad(b, 63, H, (y) => sea((y - 63) / (H - 63)), 7);
      BB.glow(b, 30, 75, 130, 34, '#ffffff', 0.2, 1.2);
      BB.glow(b, 254, H, 150, 82, '#123c7a', 0.2, 1.3);
      // long soft swell lines with broken crests
      BB.plane(b, { yh: HY, vx: 128, kx: 1.5, kz: 165, cell: (b2, x, y, iu, iv, fu, fv, du, dv) => {
        const n = noise(iu * 0.9 + fu * 0.9 + iv * 5.1, 31), a = BB.joint(fv, dv, 0.55) * sstep(0.42, 0.74, n);
        if (a > 0) px(b2, x, y, [240, 252, 255], 0.3 * a);
        const a2 = BB.joint((fv + 0.5) % 1, dv, 0.4) * sstep(0.6, 0.85, noise(iu * 1.3 + fu + iv * 3.7, 44));
        if (a2 > 0) px(b2, x, y, [20, 80, 150], 0.1 * a2);
      } });
      BB.scatter(5, 32, 0, 68, 170, 140, (x, y) => BB.free(x, y, 2), (x, y, r) => BB.glow(b, x, y, 1.8 + r * 1.4, 0.9, '#ffffff', 0.7, 0.8));
    },
  }));

  // ================================================================================================ night
  const HAZE_N = rgb('#d49cc4');
  BB.define('night', Object.assign(BB.stage(tint({ rim: ['#9eb0e4', '#485890'], edge: ['#3c5288', '#1c2850'], halo: '#080e2c', haloA: 0.42 })), {
    sky(b) {
      skyGrad(b, [[0, '#141c58'], [0.28, '#26348c'], [0.58, '#4a58b8'], [0.84, '#b490cc'], [1, '#f0b8c4']]);
      BB.glow(b, 232, 28, 108, 84, '#9ab0f4', 0.22, 1.4);
      // stars: one jittered star per 16x8 cell (sparser low down), so they spread evenly with no hash streaks
      for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < W / 16; gx++) {
        if (hf(gx, gy, 61) < 0.18 + gy * 0.07) continue;
        const x = gx * 16 + hf(gx, gy, 62) * 15, y = gy * 7.5 + hf(gx, gy, 63) * 7, r = hf(gx, gy, 64);
        const a = 0.45 + 0.5 * r, c = r > 0.8 ? [255, 244, 196] : [226, 232, 255];
        px(b, x, y, c, a * (1 - y / 66));
        if (r > 0.93) { px(b, x - 1, y, c, 0.5); px(b, x + 1, y, c, 0.5); px(b, x, y - 1, c, 0.5); px(b, x, y + 1, c, 0.5); }
      }
      BB.streak(b, 74, 20, 70, 3.2, 41, '#8c8cec', 0.22);
      BB.streak(b, 200, 46, 56, 3.2, 42, '#c8a0dc', 0.3);
      BB.streak(b, 120, 40, 50, 2.6, 43, '#a49ae0', 0.18);
      // the moon, top right
      BB.glow(b, 236, 24, 28, 28, '#fff4d0', 0.35, 1.8);
      BB.lobe(b, 236, 24, 11, 11, rgb('#fffbe8'), rgb('#f6ecc4'), rgb('#d8cca8'), 1);
      for (const [cx, cy, r] of [[233, 20, 2.6], [239, 28, 2.2], [236, 17, 1.5], [230, 26, 1.2]]) BB.glow(b, cx, cy, r, r, '#c8b890', 0.35, 0.8);
      // hazy hills and lit cottages
      BB.ridge(b, { base: 67, h: BB.hills(51, 13, 0.038, 5), color: (x, y, d) => mix(mix(rgb('#5a5aa0'), rgb('#6868ac'), sstep(0, 3, 3 - d)), HAZE_N, 0.3 + 0.5 * sstep(0, 14, d)) });
      const tops = BB.ridge(b, { base: 72, h: BB.hills(57, 9, 0.056, 2.5), color: (x, y, d) => mix(mix(rgb('#34407c'), rgb('#4a5896'), sstep(0, 2.5, 2.5 - d)), HAZE_N, 0.1 + 0.4 * sstep(0, 12, d)) });
      for (const x of [110, 126, 96, 20, 34, 246, 232]) {
        const y = tops[x] + 2.5;
        BB.poly(b, [[x - 3.5, y], [x + 3.5, y], [x + 3.5, y - 3.5], [x, y - 7], [x - 3.5, y - 3.5]], rgb('#2c3470'), 1);
        BB.glow(b, x, y - 1.8, 2.6, 2.2, '#ffd470', 0.95, 0.7);
      }
      // strung lanterns
      const ly = (x) => 52 + 3.5 * M.sin(((x - 108) / 146) * M.PI * 3);
      for (let x = 108; x <= 254; x += 0.5) px(b, x, ly(x), [70, 60, 110], 0.5);
      for (let x = 116, k = 0; x < 254; x += 18, k++) { const y = ly(x) + 2; BB.glow(b, x, y, 6.5, 6.5, k % 2 ? '#ff9a5a' : '#ffd070', 0.5, 1.3); px(b, x, y, [255, 240, 180], 1); px(b, x, y + 1, [255, 170, 80], 1); }
    },
    ground(b) {
      groundGrad(b, [[0, '#9c94c8'], [0.14, '#5c70b0'], [0.5, '#34528f'], [1, '#1e3a72']], 65, 10, '#b4d4ff', '#060c2c', 0.3);
      BB.plane(b, { yh: HY, vx: 140, kx: 3.4, kz: 330, cell: (b2, x, y, iu) => { if (iu & 1) px(b2, x, y, [170, 200, 255], 0.03); } });
      BB.scatter(9, 18, 0, 70, W, 140, (x, y) => BB.free(x, y, 2), (x, y) => { BB.glow(b, x, y, 5, 5, '#e8ff8a', 0.4, 1.4); px(b, x, y, [255, 255, 200], 1); });
    },
  }));
})(typeof globalThis !== 'undefined' ? globalThis : window);
