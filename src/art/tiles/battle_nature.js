/* src/art/tiles/battle_nature.js — outdoor battle backgrounds: grass, forest, water, night. See battle_kit.js for the stage layout. */
(function (root) {
  'use strict';
  const NP = root.NP;
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
    const hx = x, hy = top - h * 0.02, L = h * 1.0, cloth = ['#fffaf0', '#f6a8bc', '#82d2cc', '#f8dc72'];
    for (let k = 0; k < 4; k++) {
      const a = rot + (k * Math.PI) / 2, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
      const c0 = 0.28, c1 = 0.96, wd = 2.4;
      BB.poly(b, [[hx + ux * L * c0, hy + uy * L * c0], [hx + ux * L * c1, hy + uy * L * c1], [hx + ux * L * c1 + nx * wd, hy + uy * L * c1 + ny * wd], [hx + ux * L * c0 + nx * wd, hy + uy * L * c0 + ny * wd]], f(cloth[k]), 1);
      for (let s = 0; s <= L; s += 0.5) px(b, hx + ux * s, hy + uy * s, f('#8a6a5a'), 1);
    }
    BB.glow(b, hx, hy, 1.6, 1.6, f('#e8c890'), 1, 0.5);
  }
  BB.windmill = windmill;

  // ================================================================================================ grass
  /** patchwork hill: squares of field colours with faint stitched seams */
  function patchRidge(b, o) {
    const pal = o.pal.map(rgb), thread = rgb(o.thread);
    return BB.ridge(b, {
      base: o.base, h: o.h,
      color: (x, y, d) => {
        const u = (x + (y - o.base) * 0.5) / o.cw, v = (y - 20) / o.ch, iu = Math.floor(u), iv = Math.floor(v), fu = u - iu, fv = v - iv;
        const hh = hf(iu, iv, o.seed);
        let c = pal[(hh * pal.length) | 0];
        c = mix(c, hh > 0.5 ? [255, 250, 226] : [70, 120, 110], 0.07);
        if (d < 1.6) c = mix(c, [255, 255, 236], 0.28);
        if ((fu < 0.07 || fv < 0.16) && ((x + y) & 3) < 2) c = mix(c, thread, 0.42);
        return mix(c, o.hazeC, o.hazeA + 0.22 * sstep(0, 9, d));
      },
    });
  }

  const HAZE_G = rgb('#f2f6e0');
  BB.define('grass', Object.assign(BB.stage(tint({ rim: ['#c6dce0', '#6a8aa0'], edge: ['#5a8499', '#36546c'], halo: '#1e3a4c' })), {
    sky(b) {
      const sky = ramp([[0, '#3a82e4'], [0.3, '#6cb0f0'], [0.62, '#a8d6f6'], [0.86, '#dcf0f2'], [1, '#f2f6e0']]);
      BB.vgrad(b, 0, 50, (y) => sky(y / 44));
      BB.glow(b, 6, -8, 140, 90, '#fff2c4', 0.3, 1.3);
      BB.streak(b, 170, 7, 70, 3.2, 1, '#ffffff', 0.5);
      BB.streak(b, 70, 15, 64, 2.8, 2, '#ffffff', 0.34);
      BB.streak(b, 205, 22, 44, 3, 3, '#ffffff', 0.42);
      BB.streak(b, 120, 29, 80, 2.4, 4, '#ffffff', 0.3);
      BB.puff(b, 214, 33, 50, 11, 3, { a: 0.85 });
      BB.puff(b, 128, 36, 38, 8, 5, { a: 0.7 });
      BB.puff(b, 26, 37, 44, 9, 7, { a: 0.75 });
      // far hills (blue-green haze)
      BB.ridge(b, { base: 44, h: BB.hills(3, 12, 0.035, 5), color: (x, y, d) => mix(mix(rgb('#8cc2bc'), rgb('#b0d8c4'), sstep(0, 3, 3 - d)), HAZE_G, 0.16 + 0.5 * sstep(0, 12, d)) });
      // patchwork mid hills, windmill on the right
      const tops = patchRidge(b, { base: 49, h: BB.hills(9, 9, 0.05, 2.5), seed: 5, cw: 13, ch: 3.6, thread: '#fff6c8', hazeC: HAZE_G, hazeA: 0.04,
        pal: ['#9ad878', '#7cc866', '#e4dc8c', '#b2e284', '#8fd08a', '#9ad878', '#f0c4c4'] });
      windmill(b, 219, tops[219] + 4, 19, [HAZE_G, 0.1], -0.5);
      for (const [tx, th] of [[12, 12], [27, 10], [96, 11], [109, 9], [233, 11], [130, 8]]) BB.tree(b, tx, tops[tx] + 3, th, { haze: [HAZE_G, 0.22] });
    },
    ground(b) {
      const g = ramp([[0, '#d8f2b8'], [0.16, '#b8e690'], [0.5, '#8ccd70'], [1, '#5fb066']]);
      BB.vgrad(b, 41, H, (y) => g((y - 41) / 71), 9);
      BB.glow(b, 24, 50, 130, 38, '#fff8d0', 0.2, 1.2);
      BB.glow(b, 238, 112, 140, 64, '#27508a', 0.22, 1.3);
      BB.plane(b, { yh: HY, vx: 130, kx: 3.2, kz: 300, cell: (b2, x, y, iu) => { if (iu & 1) px(b2, x, y, [255, 255, 215], 0.05); } });
      BB.scatter(15, 9, 0, 52, W, 100, (x, y) => BB.free(x, y, 3), (x, y, r, k) => {   // a few meadow flowers in the open corners
        BB.glow(b, x, y + 1.5, 4, 1.5, '#2c6a44', 0.22, 1);
        const c = [[255, 140, 176], [255, 252, 232], [255, 228, 92]][k % 3];
        px(b, x, y, c, 1); px(b, x - 1, y, c, 0.8); px(b, x + 1, y, c, 0.8); px(b, x, y - 1, c, 0.8); px(b, x, y + 1, c, 0.8);
        px(b, x, y, [255, 176, 64], 1);
      });
    },
  }));

  // ================================================================================================ forest (Gingham Woods)
  const HAZE_F = rgb('#eef3c0');
  BB.define('forest', Object.assign(BB.stage(tint({ rim: ['#bcd8c6', '#587f7c'], edge: ['#487a7a', '#2a4858'], halo: '#143436' })), {
    sky(b) {
      const g = ramp([[0, '#2a6a66'], [0.26, '#3f8a66'], [0.56, '#80c470'], [0.84, '#d0e89c'], [1, '#f0f4c6']]);
      BB.vgrad(b, 0, 50, (y) => g(y / 44));
      BB.glow(b, 4, -10, 150, 100, '#fff0b4', 0.3, 1.2);
      for (const [x0, w0, w1, a] of [[96, 5, 15, 0.2], [132, 4, 16, 0.24], [172, 5, 18, 0.2], [214, 5, 14, 0.18]]) BB.shaft(b, x0, -8, x0 + 62, 62, w0, w1, '#fff6c0', a);
      // layered tree-lines receding into the haze, with hazy trunks
      BB.ridge(b, { base: 46, h: BB.hills(21, 14, 0.11, 6), color: (x, y, d) => mix(rgb('#9cca8c'), HAZE_F, 0.4 + 0.4 * sstep(0, 14, d)) });
      for (let x = 3; x < W; x += 9) { const hh = hf(x, 5, 9); BB.poly(b, [[x, 30 + hh * 8], [x + 1.4, 30 + hh * 8], [x + 1.4, 48], [x, 48]], mix(rgb('#5a8a64'), HAZE_F, 0.45), 0.5); }
      BB.ridge(b, { base: 49, h: BB.hills(33, 11, 0.14, 3), color: (x, y, d) => mix(mix(rgb('#70b872'), rgb('#4e9c68'), sstep(0, 12, d)), HAZE_F, 0.16 + 0.34 * sstep(4, 16, d)) });
      for (const x of [10, 46, 84, 110, 125, 216]) BB.tree(b, x, 52, 18 + hf(x, 2, 2) * 4, { hi: '#c4ea78', mid: '#6cb458', lo: '#2a7654', trunk: '#6a5448', haze: [HAZE_F, 0.2] });
      // canopy overhang with light peeking through
      for (let x = -8; x < W + 10; x += 12) {
        const j = hf(x, 3, 7);
        BB.lobe(b, x + j * 6, -2 + j * 5, 11 + j * 4, 7 + hf(x, 4, 7) * 5, rgb('#7cd078'), rgb('#2c8460'), rgb('#124a4c'), 1);
      }
      BB.scatter(7, 16, 0, 2, W, 15, null, (x, y, r) => BB.glow(b, x, y, 2 + r * 2.4, 1.6 + r * 1.6, '#fffbd0', 0.55, 1));
      // festival lanterns strung through the branches
      const lx0 = 118, lx1 = 238, sag = (t) => lerp(10, 9, t) + 11 * Math.sin(Math.PI * t);
      for (let x = lx0; x <= lx1; x += 0.5) px(b, x, sag((x - lx0) / (lx1 - lx0)), [118, 84, 70], 0.75);
      [0.1, 0.26, 0.42, 0.58, 0.74, 0.9].forEach((t, k) => {
        const x = lx0 + (lx1 - lx0) * t, y = sag(t) + 3;
        BB.glow(b, x, y + 1, 7, 7, ['#ffb04a', '#ff8a6a', '#ffd060'][k % 3], 0.42, 1.3);
        BB.poly(b, [[x - 1.6, y - 1], [x + 1.6, y - 1], [x + 2, y + 2], [x - 2, y + 2]], ['#ff9a3c', '#f2605a', '#ffc040'][k % 3], 1);
        px(b, x - 1, y, [255, 244, 170], 1);
      });
    },
    ground(b) {
      const g = ramp([[0, '#e2f0a8'], [0.16, '#b6dc7c'], [0.5, '#7cba60'], [1, '#3e8454']]);
      BB.vgrad(b, 43, H, (y) => g((y - 43) / 69), 9);
      for (const [cx, cy, rx, ry, a] of [[100, 54, 34, 7, 0.24], [216, 64, 28, 6, 0.2], [18, 66, 26, 7, 0.18], [122, 82, 30, 8, 0.16]]) BB.glow(b, cx, cy, rx, ry, '#fff8c4', a, 1.1);
      BB.glow(b, 238, 112, 140, 64, '#10385a', 0.22, 1.3);
      BB.plane(b, { yh: HY, vx: 120, kx: 2.4, kz: 190, cell: (b2, x, y, iu, iv) => { const a = (iu & 1 ? 0.045 : 0) + (iv & 1 ? 0.045 : 0); if (a) px(b2, x, y, [255, 255, 215], a); } });
      // a big near trunk framing the right edge, tucked into the canopy
      BB.poly(b, [[230, -2], [242, -2], [242, 112], [228, 112]], (x, y) => { const t = clamp((x - 228) / 13, 0, 1), k = 0.5 + 0.5 * Math.sin(y * 0.35 + x); return t < 0.3 ? mix(rgb('#9a7660'), rgb('#7e6050'), k * 0.4) : t < 0.66 ? mix(rgb('#684e4c'), rgb('#5a4446'), k * 0.5) : rgb('#3c3044'); });
      BB.glow(b, 233, 24, 5, 16, '#86d676', 0.4, 1);
      for (const [lx, ly, r] of [[226, 3, 12], [238, 5, 11], [232, 9, 9]]) BB.lobe(b, lx, ly, r, r * 0.7, rgb('#7cd078'), rgb('#2c8460'), rgb('#124a4c'), 1);
      BB.scatter(11, 7, 0, 50, W, 100, (x, y) => BB.free(x, y, 3), (x, y) => {   // tiny mushrooms
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
      const sky = ramp([[0, '#2a74d8'], [0.3, '#60acee'], [0.62, '#a2d4f4'], [0.86, '#dcf0f8'], [1, '#f0f8fa']]);
      BB.vgrad(b, 0, 52, (y) => sky(y / 46));
      BB.glow(b, 6, -8, 140, 90, '#fff4cc', 0.28, 1.3);
      BB.streak(b, 165, 8, 68, 3.2, 11, '#ffffff', 0.5);
      BB.streak(b, 60, 17, 60, 2.8, 12, '#ffffff', 0.32);
      BB.streak(b, 210, 24, 40, 3, 13, '#ffffff', 0.4);
      BB.puff(b, 36, 37, 58, 12, 21, { a: 0.8 });
      BB.puff(b, 146, 37, 50, 10, 22, { a: 0.7 });
      BB.puff(b, 205, 35, 46, 11, 23, { a: 0.85 });
      // a hazy island with a striped lighthouse
      BB.ridge(b, { base: 44, h: (x) => 11 * Math.exp(-(((x - 222) / 24) ** 2)) + 3 * noise(x * 0.2, 4) * Math.exp(-(((x - 222) / 40) ** 2)), color: (x, y, d) => mix(mix(rgb('#7fb9b4'), rgb('#9ccdb8'), sstep(0, 3, 3 - d)), HAZE_W, 0.2 + 0.5 * sstep(0, 9, d)) });
      const lx = 220, ly = 36, hz = (c) => mix(rgb(c), HAZE_W, 0.12);
      BB.poly(b, [[lx - 3, ly], [lx - 2, ly - 14], [lx + 2, ly - 14], [lx + 3, ly]], (x, y) => ((Math.floor((y - ly + 14) / 3.5) & 1) ? hz('#e8605c') : hz('#fff8f0')));
      BB.poly(b, [[lx - 3, ly - 14], [lx, ly - 18], [lx + 3, ly - 14]], hz('#c8484c'), 1);
      BB.glow(b, lx, ly - 15, 5, 4, '#fff2a0', 0.9, 1);
      // sailboat with a patchwork sail
      const sx = 128, sy = 43, sm = (c) => mix(rgb(c), HAZE_W, 0.12);
      BB.poly(b, [[sx - 5, sy], [sx + 5, sy], [sx + 3, sy + 2], [sx - 3, sy + 2]], sm('#a26c58'), 1);
      BB.poly(b, [[sx, sy - 1], [sx, sy - 12], [sx + 5, sy - 1]], (x, y) => (y < sy - 8 ? sm('#fff8ec') : x > sx + 2 ? sm('#f4a0b8') : sm('#fff1b8')), 1);
      BB.poly(b, [[sx - 0.8, sy - 1], [sx - 0.8, sy - 9], [sx - 4.5, sy - 1]], sm('#fff8ec'), 1);
    },
    ground(b) {
      const sea = ramp([[0, '#c6f0f2'], [0.1, '#94e0ec'], [0.4, '#56b8e8'], [1, '#2a6cc4']]);
      BB.vgrad(b, 41, H, (y) => sea((y - 41) / 71), 7);
      BB.glow(b, 30, 52, 120, 30, '#ffffff', 0.2, 1.2);
      BB.glow(b, 238, 112, 140, 64, '#123c7a', 0.2, 1.3);
      // long soft swell lines with broken crests
      BB.plane(b, { yh: HY, vx: 120, kx: 1.4, kz: 150, cell: (b2, x, y, iu, iv, fu, fv, du, dv) => {
        const n = noise(iu * 0.9 + fu * 0.9 + iv * 5.1, 31), a = BB.joint(fv, dv, 0.55) * sstep(0.42, 0.74, n);
        if (a > 0) px(b2, x, y, [240, 252, 255], 0.3 * a);
        const a2 = BB.joint((fv + 0.5) % 1, dv, 0.4) * sstep(0.6, 0.85, noise(iu * 1.3 + fu + iv * 3.7, 44));
        if (a2 > 0) px(b2, x, y, [20, 80, 150], 0.1 * a2);
      } });
      BB.scatter(5, 26, 0, 46, 150, 100, (x, y) => BB.free(x, y, 2), (x, y, r) => BB.glow(b, x, y, 1.8 + r * 1.4, 0.9, '#ffffff', 0.7, 0.8));
    },
  }));

  // ================================================================================================ night
  const HAZE_N = rgb('#d49cc4');
  BB.define('night', Object.assign(BB.stage(tint({ rim: ['#9eb0e4', '#485890'], edge: ['#3c5288', '#1c2850'], halo: '#080e2c', haloA: 0.42 })), {
    sky(b) {
      const sky = ramp([[0, '#141c58'], [0.28, '#26348c'], [0.58, '#4a58b8'], [0.84, '#b490cc'], [1, '#f0b8c4']]);
      BB.vgrad(b, 0, 50, (y) => sky(y / 44));
      BB.glow(b, 214, 22, 100, 70, '#9ab0f4', 0.22, 1.4);
      BB.scatter(3, 70, 0, 0, W, 34, null, (x, y, r) => { const a = 0.45 + 0.5 * r, c = r > 0.8 ? [255, 244, 196] : [226, 232, 255]; px(b, x, y, c, a * (1 - y / 44)); if (r > 0.93) { px(b, x - 1, y, c, 0.5); px(b, x + 1, y, c, 0.5); px(b, x, y - 1, c, 0.5); px(b, x, y + 1, c, 0.5); } });
      BB.streak(b, 70, 14, 66, 3, 41, '#8c8cec', 0.22);
      BB.streak(b, 190, 31, 50, 3, 42, '#c8a0dc', 0.3);
      // the moon
      BB.glow(b, 210, 21, 24, 24, '#fff4d0', 0.35, 1.8);
      BB.lobe(b, 210, 21, 10, 10, rgb('#fffbe8'), rgb('#f6ecc4'), rgb('#d8cca8'), 1);
      for (const [cx, cy, r] of [[207, 18, 2.4], [213, 24, 2], [210, 15, 1.4]]) BB.glow(b, cx, cy, r, r, '#c8b890', 0.35, 0.8);
      // hazy hills, a windmill and lit cottages
      BB.ridge(b, { base: 45, h: BB.hills(51, 11, 0.04, 4), color: (x, y, d) => mix(mix(rgb('#5a5aa0'), rgb('#6868ac'), sstep(0, 3, 3 - d)), HAZE_N, 0.3 + 0.5 * sstep(0, 12, d)) });
      const tops = BB.ridge(b, { base: 50, h: BB.hills(57, 8, 0.06, 2), color: (x, y, d) => mix(mix(rgb('#34407c'), rgb('#4a5896'), sstep(0, 2.5, 2.5 - d)), HAZE_N, 0.1 + 0.4 * sstep(0, 10, d)) });
      for (const [x, w] of [[104, 1], [118, 0], [92, 0], [20, 1], [228, 1], [214, 0]]) {
        const y = tops[x] + 2.5;
        BB.poly(b, [[x - 3, y], [x + 3, y], [x + 3, y - 3], [x, y - 6], [x - 3, y - 3]], rgb('#2c3470'), 1);
        BB.glow(b, x, y - 1.5, 2.4, 2, '#ffd470', 0.95, 0.7);
      }
      // strung lanterns
      for (let x = 100; x <= 236; x += 0.5) px(b, x, 33 + 3 * Math.sin(((x - 100) / 136) * Math.PI * 3), [70, 60, 110], 0.5);
      for (let x = 108, k = 0; x < 236; x += 17, k++) { const y = 33 + 3 * Math.sin(((x - 100) / 136) * Math.PI * 3) + 2; BB.glow(b, x, y, 6, 6, k % 2 ? '#ff9a5a' : '#ffd070', 0.5, 1.3); px(b, x, y, [255, 240, 180], 1); px(b, x, y + 1, [255, 170, 80], 1); }
    },
    ground(b) {
      const g = ramp([[0, '#9c94c8'], [0.14, '#5c70b0'], [0.5, '#34528f'], [1, '#1e3a72']]);
      BB.vgrad(b, 43, H, (y) => g((y - 43) / 69), 9);
      BB.glow(b, 40, 52, 140, 36, '#b4d4ff', 0.2, 1.2);
      BB.glow(b, 238, 112, 140, 64, '#060c2c', 0.3, 1.3);
      BB.plane(b, { yh: HY, vx: 130, kx: 3.2, kz: 300, cell: (b2, x, y, iu) => { if (iu & 1) px(b2, x, y, [170, 200, 255], 0.03); } });
      BB.scatter(9, 14, 0, 48, W, 100, (x, y) => BB.free(x, y, 2), (x, y, r) => { BB.glow(b, x, y, 5, 5, '#e8ff8a', 0.4, 1.4); px(b, x, y, [255, 255, 200], 1); });
    },
  }));
})(typeof globalThis !== 'undefined' ? globalThis : window);
