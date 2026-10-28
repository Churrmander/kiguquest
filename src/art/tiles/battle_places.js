/* src/art/tiles/battle_places.js — town and indoor battle backgrounds: city, indoor, gym, society, cave. See battle_kit.js for the stage
 * (256x144, horizon y 60, foe platform centred (188,88), player platform centred (66,142)). Rooms put their floor line at y 67. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const M = Math;
  const K = NP.art.tiles.kit;
  const BB = K.bb;
  const { rgb, mix, tone, ramp, px, glow, sstep, clamp, lerp, noise, hf } = BB;
  const W = BB.W, H = BB.H, HY = BB.HY;
  const tint = (o) => Object.assign({ rim: ['#c4d8e4', '#6a86a2'], edge: ['#5a809a', '#36526e'], halo: '#1c3450' }, o);
  const rect = (b, x0, y0, x1, y1, c, a) => BB.paint(b, M.round(x0), M.round(y0), M.round(x1), M.round(y1), () => (a === undefined || a >= 1 ? c : [c[0], c[1], c[2], a]));
  const FLOOR = 67;                                // rooms: where the back wall meets the floor
  /** room floor: gradient from the wall foot down, a warm wash on the left, a cool falloff bottom-right */
  function floorGrad(b, stops, soft, cool, coolA) {
    const g = ramp(stops);
    BB.vgrad(b, FLOOR, H, (y) => g((y - FLOOR) / (H - FLOOR)), soft);
    BB.glow(b, 254, H, 150, 82, cool, coolA, 1.3);
  }

  // ================================================================================================ city (Seamstead plaza)
  const HAZE_C = rgb('#f6efe6');
  /** striped shop awning: stripes of width 3, lit top edge, shaded hem and a soft shadow underneath */
  function awning(b, x, y, w, h, c1, c2, hz) {
    const f = (c) => mix(rgb(c), hz[0], hz[1]);
    const a1 = f(c1), a2 = f(c2);
    for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) {
      let c = (M.floor(i / 3) & 1) ? a2 : a1;
      if (j === 0) c = tone(c, 0.25); else if (j === h - 1) c = tone(c, -0.28);
      px(b, x + i, y + j, c, 1);
    }
    rect(b, x, y + h, x + w, y + h + 2, [60, 70, 120], 0.16);
  }
  /** pastel shopfront: wall, cornice, rows of windows, awning at street level */
  function shop(b, o) {
    const f = (c) => mix(rgb(c), o.haze[0], o.haze[1]);
    const wall = f(o.wall), wl = tone(wall, 0.14), wd = tone(wall, -0.13), roof = f(o.roof);
    BB.paint(b, o.x, o.top, o.x + o.w, o.base, (x, y) => { const t = (x - o.x) / o.w; return t < 0.14 ? wl : t > 0.86 ? wd : wall; });
    rect(b, o.x - 1, o.top - 2, o.x + o.w + 1, o.top + 1, roof);
    rect(b, o.x - 1, o.top - 2, o.x + o.w + 1, o.top - 1, tone(roof, 0.3));
    const rows = M.max(1, M.floor((o.base - o.top - 12) / 7));
    for (let r = 0; r < rows; r++) for (let x = o.x + 3; x + 4 <= o.x + o.w - 2; x += 7) {
      const y = o.top + 4 + r * 7;
      rect(b, x - 1, y - 1, x + 5, y + 5, f('#fffaf0'));
      rect(b, x, y, x + 4, y + 4, f('#a6d8f0'));
      px(b, x, y, f('#e8f8ff'), 1); px(b, x + 1, y, f('#e8f8ff'), 1);
      px(b, x + 3, y + 3, f('#6aa8d8'), 1);
    }
    awning(b, o.x, o.base - 8, o.w, 4, o.awn[0], o.awn[1], o.haze);
    rect(b, o.x + 2, o.base - 3, o.x + o.w - 2, o.base, tone(wall, -0.3), 0.55);
  }

  BB.define('city', Object.assign(BB.stage(tint({ rim: ['#c6d6ea', '#728cae'], edge: ['#5c7898', '#34496c'], halo: '#1a2c4c' })), {
    sky(b) {
      const sky = ramp([[0, '#4a90e6'], [0.3, '#80bdf0'], [0.62, '#b8dcf6'], [0.86, '#ecf2f2'], [1, '#fcf3e6']]);
      BB.vgrad(b, 0, 74, (y) => sky(y / 68));
      BB.glow(b, 6, -10, 156, 116, '#fff2c8', 0.28, 1.3);
      BB.streak(b, 176, 8, 72, 3.2, 61, '#ffffff', 0.46);
      BB.streak(b, 68, 17, 64, 2.8, 62, '#ffffff', 0.3);
      BB.streak(b, 220, 24, 40, 2.6, 64, '#ffffff', 0.34);
      BB.puff(b, 204, 40, 58, 13, 63, { a: 0.8 });
      BB.puff(b, 92, 36, 40, 9, 65, { a: 0.6 });
      // far rooftops fading into the haze (a taller skyline than the near row)
      const far = [[-4, 28, 40], [22, 24, 34], [44, 30, 42], [72, 22, 32], [92, 28, 38], [118, 24, 34], [140, 28, 42], [162, 24, 37], [184, 28, 40], [206, 26, 36], [230, 30, 41]];
      far.forEach(([x, w, t], k) => shop(b, { x, w, top: t, base: 68, wall: ['#f2c4cc', '#f8e8c8', '#bfe6d0', '#d4c8ec', '#f6c8a8'][k % 5], roof: ['#c87890', '#c8a070', '#78b498', '#9484c0', '#d88a70'][k % 5], awn: [['#f4a0b8', '#fff4f4'], ['#78c8c0', '#f4fffa']][k % 2], haze: [HAZE_C, 0.58] }));
      // nearer pastel shopfronts along the street (left) and flanking the vanishing point (right)
      const near = [[-8, 34, 36], [24, 28, 42], [50, 32, 33], [80, 26, 44], [104, 30, 38], [132, 22, 41], [220, 28, 30], [246, 18, 38]];
      near.forEach(([x, w, t], k) => shop(b, { x, w, top: t, base: 70, wall: ['#f8d0d8', '#fdf0cc', '#c8f0dc', '#e0d4f8', '#fbd8b8'][(k + 2) % 5], roof: ['#d4849c', '#d4aa78', '#82c0a0', '#9c8ccc', '#e49478'][(k + 2) % 5], awn: [['#f58aa8', '#ffffff'], ['#5cc4bc', '#ffffff'], ['#f8c84c', '#ffffff']][k % 3], haze: [HAZE_C, 0.2] }));
      // lime trees overlapping the shopfronts
      BB.tree(b, 120, 71, 34, { hi: '#e6fa84', mid: '#9ad852', lo: '#3c9a4c', trunk: '#7a5c50', haze: [HAZE_C, 0.1] });
      BB.tree(b, 232, 71, 40, { hi: '#e6fa84', mid: '#9ad852', lo: '#3c9a4c', trunk: '#7a5c50', haze: [HAZE_C, 0.06] });
      BB.tree(b, 12, 71, 30, { hi: '#e6fa84', mid: '#9ad852', lo: '#3c9a4c', trunk: '#7a5c50', haze: [HAZE_C, 0.14] });
      // bunting across the street
      const by = (x) => 16 + 8 * M.sin(((x - 108) / 146) * M.PI);
      for (let x = 108; x <= 254; x += 0.5) px(b, x, by(x), [120, 100, 120], 0.5);
      for (let x = 114, k = 0; x < 254; x += 7, k++) BB.poly(b, [[x - 2.2, by(x)], [x + 2.2, by(x)], [x, by(x) + 4.5]], ['#f56a7a', '#ffd25a', '#62c4c0', '#ffffff'][k % 4], 0.95);
    },
    ground(b) {
      const g = ramp([[0, '#f4efe4'], [0.14, '#e2e0e0'], [0.5, '#c4c8d6'], [1, '#9ea8c4']]);
      BB.vgrad(b, 67, H, (y) => g((y - 67) / (H - 67)), 7);
      BB.glow(b, 30, 76, 140, 40, '#fff8e0', 0.22, 1.2);
      BB.glow(b, 254, H, 150, 82, '#1c2c68', 0.22, 1.3);
      // pale cobbles receding to the vanishing point
      BB.plane(b, { yh: 62, vx: 192, kx: 5.6, kz: 440, y0: 68, cell: (b2, x, y, iu, iv, fu, fv, du, dv) => {
        const fd = sstep(68, 92, y), h1 = hf(iu, iv, 17);
        px(b2, x, y, h1 > 0.5 ? [255, 250, 238] : [120, 140, 190], (0.05 + 0.06 * M.abs(h1 - 0.5)) * fd);
        const j = M.max(BB.joint(fu, du, 0.4), BB.joint(fv, dv, 0.4));
        if (j > 0) px(b2, x, y, [104, 120, 166], 0.16 * j * fd);
      } });
      // a pale pavement along the shopfronts with a kerb receding to the vanishing point
      BB.poly(b, [[0, 70], [162, 70], [162, 75], [0, 82]], [252, 246, 236], 0.5);
      for (let x = 0; x < 162; x++) { const y = 82 - (x / 162) * 7; px(b, x, y, [255, 255, 250], 0.7); px(b, x, y + 1, [120, 132, 176], 0.3); }
      // long soft shadows from the shopfronts
      BB.poly(b, [[0, 85], [76, 79], [128, 100], [0, 104]], [50, 70, 140], 0.06);
    },
  }));

  // ================================================================================================ indoor (cosy hall)
  BB.define('indoor', Object.assign(BB.stage(tint({ rim: ['#e2d0d0', '#948090'], edge: ['#86708a', '#52405c'], halo: '#3a2038' })), {
    sky(b) {
      const wall = ramp([[0, '#c89a88'], [0.12, '#e8c8ac'], [0.45, '#f7e2c6'], [1, '#fcefd6']]);
      BB.vgrad(b, 0, 70, (y) => wall(y / 64));
      BB.glow(b, 8, -4, 170, 106, '#fff4d4', 0.34, 1.2);
      BB.paint(b, 0, 0, W, 46, (x) => (x % 14 < 2 ? [212, 150, 140, 0.09] : null));
      // crown moulding and a picture rail
      BB.paint(b, 0, 0, W, 7, (x, y) => (y === 6 ? [255, 238, 205, 0.55] : y < 6 ? [150, 90, 80, 0.3 * (1 - y / 7)] : null));
      BB.paint(b, 0, 13, W, 15, (x, y) => (y === 13 ? [255, 240, 214, 0.5] : [170, 110, 90, 0.18]));
      // wainscot: wood panels under a chair rail
      BB.paint(b, 0, 45, W, FLOOR, (x, y) => {
        if (y === 45) return [250, 224, 176];
        if (y === 46) return [190, 130, 90];
        const px_ = x % 26, inP = px_ >= 3 && px_ < 23 && y >= 49 && y < 62;
        let c = mix(rgb('#d9a06c'), rgb('#b4764c'), (y - 46) / 18);
        if (inP) c = mix(c, [255, 226, 180], (px_ === 3 || y === 49) ? 0.35 : (px_ === 22 || y === 61) ? -0.2 : 0.06);
        return c;
      });
      rect(b, 0, 63, W, FLOOR, rgb('#8c5c46'));
      rect(b, 0, 63, W, 64, rgb('#c08a62'));
      // a small framed patchwork sampler on the open wall
      const fx = 124, fy = 18;
      rect(b, fx - 1, fy - 1, fx + 15, fy + 13, rgb('#9a6a4c'));
      rect(b, fx - 1, fy - 1, fx + 15, fy, rgb('#d4a07a'));
      for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) rect(b, fx + 1 + i * 3.25, fy + 1 + j * 3.6, fx + 1 + (i + 1) * 3.25, fy + 1 + (j + 1) * 3.6, rgb(['#ee8aa6', '#fde8c6', '#6cc2ba', '#f6cc6c'][(i + j * 3) % 4]));
      BB.glow(b, fx + 7, fy + 16, 10, 3, '#a06a50', 0.18, 1);
      // arched window with patchwork curtains
      const wx = 224, wy = 8, ww = 22, wh = 42;
      BB.poly(b, [[wx - 2, wy + 7], [wx + 4, wy + 1], [wx + ww - 4, wy + 1], [wx + ww + 2, wy + 7], [wx + ww + 2, wy + wh + 2], [wx - 2, wy + wh + 2]], rgb('#fdf4e4'));
      BB.paint(b, wx, wy + 3, wx + ww, wy + wh, (x, y) => { if (y < wy + 7 && M.abs(x - (wx + ww / 2)) > (y - wy + 3) * 2 + 5) return null; return mix(rgb('#7cb8ee'), rgb('#dcf0fc'), (y - wy) / wh); });
      // a far lime tree and hill through the glass
      BB.paint(b, wx, wy + 30, wx + ww, wy + wh, (x, y) => (y > wy + 33 + 2 * M.sin(x * 0.4) ? [150, 210, 120, 0.8] : null));
      BB.lobe(b, wx + 6, wy + 30, 4, 3.4, rgb('#e6fa84'), rgb('#9ad852'), rgb('#3c9a4c'), 0.85);
      rect(b, wx + ww / 2 - 1, wy + 3, wx + ww / 2 + 1, wy + wh, rgb('#fdf4e4'));
      rect(b, wx, wy + 20, wx + ww, wy + 22, rgb('#fdf4e4'));
      const cur = ['#ee8aa6', '#fde8c6', '#6cc2ba', '#f6cc6c'];
      for (const [cx0, side] of [[wx - 4, 0], [wx + ww - 3, 1]]) {
        for (let x = 0; x < 8; x++) for (let y = 0; y < wh + 4; y++) {
          const hh = hf(M.floor(y / 5), side, 4), fold = 0.5 + 0.5 * M.sin((x + side * 2) * 1.2);
          const c = mix(rgb(cur[(hh * 4) | 0]), rgb('#7a3a58'), 0.28 * (1 - fold));
          px(b, cx0 + x, wy + 2 + y, c, 1);
          if (y % 5 === 0 && x % 2 === 0) px(b, cx0 + x, wy + 2 + y, [255, 248, 226], 0.55);
        }
        rect(b, cx0, wy + 22, cx0 + 8, wy + 24, rgb('#f6cc6c'));
      }
      BB.shaft(b, wx + 11, wy + 8, 170, 68, 11, 30, '#fff2c8', 0.16, { fadeIn: 0.02, fadeOut: 0.7 });
    },
    ground(b) {
      floorGrad(b, [[0, '#f6dba8'], [0.2, '#e6bc80'], [0.6, '#cf9862'], [1, '#aa724e']], 4, '#3a1c48', 0.24);
      BB.glow(b, 30, 78, 140, 40, '#fff6d0', 0.2, 1.2);
      BB.plane(b, { yh: 62, vx: 128, kx: 3.1, kz: 170, y0: 68, cell: (b2, x, y, iu, iv, fu, fv, du, dv) => {
        const fd = sstep(69, 90, y), a = BB.joint(fu, du, 0.45);
        if (a > 0) px(b2, x, y, [110, 62, 44], 0.17 * a * fd);
        if (hf(iu, iv, 6) < 0.45) { const e = BB.joint(fv, dv, 0.4); if (e > 0) px(b2, x, y, [110, 62, 44], 0.13 * e * fd); }
        if ((iu + iv) & 1) px(b2, x, y, [255, 240, 200], 0.045 * fd);
      } });
      BB.shaft(b, 238, 68, 186, 136, 13, 34, '#fff2c0', 0.2, { fadeIn: 0.04, fadeOut: 0.6 });
    },
  }));

  // ================================================================================================ gym (the Master Tailor's Salon hall)
  /** hanging banner with a swallowtail hem, gold trim and a button emblem */
  function banner(b, x, y0, w, h) {
    const cl = rgb('#f4e2c0'), gold = rgb('#e8b84c');
    BB.poly(b, [[x, y0], [x + w, y0], [x + w, y0 + h], [x + w / 2, y0 + h - 4], [x, y0 + h]], (xx) => { const t = (xx + 0.5 - x) / w; return t < 0.2 ? tone(cl, 0.2) : t > 0.78 ? tone(cl, -0.22) : cl; });
    rect(b, x - 1, y0 - 1, x + w + 1, y0 + 1, gold);
    for (let y = y0; y < y0 + h - 2; y++) { px(b, x, y, gold, 0.9); px(b, x + w - 1, y, tone(gold, -0.2), 0.9); }
    const cx = x + w / 2, cy = y0 + 12;
    BB.lobe(b, cx, cy, 4.8, 4.8, rgb('#fff2b8'), rgb('#e8b448'), rgb('#9a6428'), 1);
    BB.lobe(b, cx, cy, 3.1, 3.1, rgb('#d49a3a'), rgb('#f2c860'), rgb('#fff0a8'), 1);
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) px(b, cx + dx * 0.9, cy + dy * 0.9, [110, 60, 40], 1);
    // a stitched hem band low on the banner
    for (let xx = x + 2; xx < x + w - 2; xx++) if (xx & 1) px(b, xx, y0 + h - 10, gold, 0.7);
    px(b, x + w / 2, y0 + h - 3, gold, 0.9);
    BB.glow(b, x + w / 2, y0 + 4, 10, 16, '#ffe6b0', 0.1, 1);
  }
  BB.define('gym', Object.assign(BB.stage(tint({ rim: ['#ecd6a8', '#88687e'], edge: ['#6e5c88', '#3c2e5a'], halo: '#28143c', haloA: 0.4 })), {
    sky(b) {
      const wall = ramp([[0, '#4e2444'], [0.2, '#7e3456'], [0.55, '#b85a6e'], [1, '#e48e88']]);
      BB.vgrad(b, 0, 70, (y) => wall(y / 64));
      // padded wall panels
      BB.paint(b, 0, 0, W, 60, (x) => { const p = x % 32; return p === 0 ? [255, 200, 190, 0.1] : p === 1 ? [60, 20, 50, 0.12] : null; });
      // banners (the right-hand pair and one beside the foe's HP box) + warm spotlight cones
      for (const [x, a] of [[158, 0.15], [212, 0.17], [62, 0.14]]) BB.shaft(b, x, -6, x + 22, 86, 3, 28, '#ffe4a8', a, { fadeIn: 0.02, fadeOut: 0.75 });
      banner(b, 126, 2, 14, 44);
      banner(b, 222, 2, 14, 48);
      banner(b, 241, 2, 14, 40);
      // dark wood dado with a gold rail
      BB.paint(b, 0, 60, W, FLOOR, (x, y) => (y === 60 ? [236, 184, 92] : y === 61 ? [150, 90, 70] : mix(rgb('#7c4a54'), rgb('#4e2a40'), (y - 62) / 5)));
      BB.glow(b, 128, 62, 150, 12, '#ffd8a0', 0.18, 1.2);
    },
    ground(b) {
      floorGrad(b, [[0, '#f6d0a8'], [0.3, '#e4a888'], [1, '#bc7a78']], 4, '#2c0c44', 0.26);
      const PAL = ['#e8708c', '#f6d890', '#6cbcb4', '#f4eadc', '#b48ad0'].map(rgb);
      // patchwork quilt floor: harlequin diamonds in muted fabric colours with stitched seams
      BB.plane(b, { yh: 62, vx: 128, kx: 2.7, kz: 210, y0: 68, cell: (b2, x, y, iu, iv, fu, fv, du, dv) => {
        const fd = sstep(70, 104, y), dd = M.abs(fu - 0.5) + M.abs(fv - 0.5);
        if (dd < 0.5) px(b2, x, y, PAL[(hf(iu, iv, 3) * PAL.length) | 0], (0.13 + 0.05 * ((iu + iv) & 1)) * fd);
        const e = M.abs(dd - 0.5) / (0.5 * (du + dv));
        if (e < 1 && ((x + y) & 3) < 2) px(b2, x, y, [255, 246, 220], 0.26 * (1 - e) * fd);
      } });
      BB.glow(b, 30, 78, 140, 40, '#fff0c8', 0.2, 1.2);
      BB.glow(b, 188, 92, 78, 18, '#ffe8b0', 0.16, 1.1);
      BB.glow(b, 66, 136, 100, 24, '#ffe8b0', 0.12, 1.1);
    },
  }));

  // ================================================================================================ society (Crisp & Co. interior)
  BB.define('society', Object.assign(BB.stage(tint({ rim: ['#d4e4f6', '#7a98c0'], edge: ['#6888b4', '#3a5680'], halo: '#14284a' })), {
    sky(b) {
      const wall = ramp([[0, '#9cb2da'], [0.14, '#d0e0f6'], [0.5, '#edf4fe'], [1, '#f8fbff']]);
      BB.vgrad(b, 0, 70, (y) => wall(y / 64));
      // pressed pleats: crisp creases, straight as a ruler
      BB.paint(b, 0, 5, W, 64, (x) => { const p = x % 10; return p === 0 ? [96, 128, 184, 0.16] : p === 1 ? [255, 255, 255, 0.22] : p > 5 && p < 9 ? [126, 156, 208, 0.05] : null; });
      // cold ceiling light panels and their wash
      for (const x of [134, 182, 230]) { rect(b, x, 0, x + 18, 3, rgb('#f6fdff')); BB.glow(b, x + 9, 0, 24, 32, '#e4f6ff', 0.3, 1.2); }
      rect(b, 0, 3, W, 5, rgb('#b8cae8'));
      // blue frieze with white piping
      rect(b, 0, 38, W, 44, rgb('#5278c0'));
      rect(b, 0, 37, W, 38, rgb('#fdfdff')); rect(b, 0, 44, W, 45, rgb('#fdfdff'));
      BB.paint(b, 0, 39, W, 43, (x, y) => (y === 41 && x % 6 < 3 ? [200, 220, 255, 0.7] : y === 39 ? [120, 152, 214, 0.5] : null));
      // flat-iron banner
      const bx = 228, by = 6, bh = 50;
      BB.poly(b, [[bx, by], [bx + 19, by], [bx + 19, by + bh], [bx + 9.5, by + bh - 4], [bx, by + bh]], (x) => (x + 0.5 - bx < 3 ? rgb('#ffffff') : x + 0.5 - bx > 16 ? rgb('#d8e6f8') : rgb('#f4f9ff')));
      rect(b, bx - 1, by - 1, bx + 20, by + 1, rgb('#5278c0'));
      for (let y = by; y < by + bh - 2; y++) { px(b, bx, y, rgb('#5278c0'), 1); px(b, bx + 18, y, rgb('#4468ac'), 1); }
      const IRON = ['...oooooooo....', '..o........o...', '..o........o...', '.ooooooooooooo.', 'owwXXXXXXXXXXoo', 'oXXXXXXXXXXXXXo', 'oXXXXXXXXXXXXoo', '.oooooooooooo..'];
      const iy = by + 22;
      IRON.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const ch = row[i]; if (ch !== '.') px(b, bx + 2 + i, iy + j, ch === 'o' ? rgb('#3a58a4') : ch === 'w' ? rgb('#d4e6ff') : rgb('#6a8cd4'), 1); } });
      for (const [dx, dy, r] of [[6, 18, 2], [10, 15, 2.4], [13, 12.5, 1.6], [9, 9, 1.4]]) BB.glow(b, bx + dx, by + dy, r + 1, r + 1, '#bcd2f4', 0.8, 0.7);
      for (let i = 0; i < 15; i += 2) px(b, bx + 2 + i, by + bh - 9, rgb('#5278c0'), 0.8);
      // steam drifting up the wall from a vent
      rect(b, 136, 58, 152, 61, rgb('#8aa4cc'));
      for (let x = 137; x < 152; x += 3) rect(b, x, 59, x + 2, 60, rgb('#4a6496'));
      for (const [x, y, w, h, a] of [[144, 56, 26, 10, 0.7], [148, 46, 22, 9, 0.6], [144, 36, 18, 8, 0.5], [150, 27, 13, 7, 0.38]]) BB.puff(b, x, y, w, h, x + y, { a, shade: '#b4c8ea' });
      rect(b, 0, 64, W, FLOOR, rgb('#8aa4cc')); rect(b, 0, 64, W, 65, rgb('#f2f8ff'));
    },
    ground(b) {
      floorGrad(b, [[0, '#eef4fc'], [0.3, '#d8e4f6'], [1, '#a8bee4']], 4, '#14306c', 0.22);
      BB.plane(b, { yh: 62, vx: 128, kx: 4.6, kz: 330, y0: 68, cell: (b2, x, y, iu, iv, fu, fv, du, dv) => {
        if ((iu + iv) & 1) px(b2, x, y, [88, 124, 196], 0.08);
        const j = M.max(BB.joint(fu, du, 0.45), BB.joint(fv, dv, 0.45));
        if (j > 0) px(b2, x, y, [90, 122, 184], 0.2 * j);
      } });
      BB.glow(b, 30, 78, 140, 40, '#ffffff', 0.3, 1.2);
      for (const x of [146, 194, 242]) BB.glow(b, x, 92, 22, 42, '#ffffff', 0.12, 1.1);
    },
  }));

  // ================================================================================================ cave
  /** glowing crystal cluster: tall prisms lit from the top-left with a soft glow behind */
  function crystals(b, x, by, list, base, glowc) {
    BB.glow(b, x, by - 12, 20, 18, glowc, 0.32, 1.3);
    for (const [dx, h, w, lean] of list) {
      const x0 = x + dx, tipx = x0 + lean;
      BB.poly(b, [[x0 - w, by], [tipx - w * 0.35, by - h + 3], [tipx, by - h], [tipx + w * 0.35, by - h + 3], [x0 + w, by]], (xx, yy) => {
        const t = clamp((xx + 0.5 - (x0 - w)) / (2 * w), 0, 1), u = (by - yy) / h;
        const c = t < 0.4 ? mix(rgb(base[0]), rgb(base[1]), 0.5 * u) : t < 0.75 ? rgb(base[1]) : rgb(base[2]);
        return mix(c, [255, 255, 255], 0.35 * u * u);
      });
      px(b, tipx, by - h + 1, [255, 255, 255], 1);
    }
  }
  const HAZE_V = rgb('#cabcdc');
  BB.define('cave', Object.assign(BB.stage(tint({ rim: ['#b4aae0', '#5a5090'], edge: ['#5c5290', '#2c244c'], halo: '#10082c', haloA: 0.42 })), {
    sky(b) {
      const wall = ramp([[0, '#20183e'], [0.25, '#3c3068'], [0.55, '#6c5898'], [0.84, '#b4a0cc'], [1, '#dccfe6']]);
      BB.vgrad(b, 0, 72, (y) => wall(y / 66));
      BB.glow(b, 128, 62, 130, 28, '#b8f4f0', 0.4, 1.3);                      // a misty glow from the far tunnel mouth
      BB.shaft(b, 64, -8, 164, 86, 6, 28, '#dcf6ff', 0.2, { fadeIn: 0.02, fadeOut: 0.8 });
      BB.shaft(b, 110, -8, 206, 86, 5, 20, '#dcf6ff', 0.14, { fadeIn: 0.02, fadeOut: 0.8 });
      // rock strata receding
      BB.ridge(b, { base: 68, h: BB.hills(71, 15, 0.075, 5), color: (x, y, d) => mix(rgb('#8c78b0'), HAZE_V, 0.3 + 0.5 * sstep(0, 14, d)) });
      BB.ridge(b, { base: 71, h: BB.hills(73, 12, 0.11, 3.5), color: (x, y, d) => mix(mix(rgb('#5c4a8e'), rgb('#48387a'), sstep(0, 12, d)), HAZE_V, 0.14 + 0.3 * sstep(3, 16, d)) });
      // stalactites hanging from the ceiling (shorter over the foe, longer at the sides)
      for (let x = -4; x < W + 6; x += 9) {
        const hh = 6 + hf(x, 8, 3) * 14 + (x > 120 && x < 228 ? 0 : 5), w = 3.8 + hf(x, 9, 3) * 2.8, xx = x + hf(x, 7, 3) * 6;
        BB.poly(b, [[xx - w, -1], [xx + w, -1], [xx + 0.5, hh]], (px_) => (px_ + 0.5 < xx - w * 0.2 ? rgb('#76629e') : rgb('#3a2e62')));
      }
      rect(b, 0, 0, W, 2, rgb('#2c2250'));
      for (const [x, h, w] of [[16, 18, 5.5], [34, 11, 4.4], [104, 14, 5], [114, 8, 3.6], [212, 10, 4.4], [232, 16, 5.5]]) {   // hazy stalagmites
        BB.poly(b, [[x - w, 74], [x - 0.5, 74 - h], [x + 0.5, 74 - h], [x + w, 74]], (xx) => mix(xx + 0.5 < x - w * 0.15 ? rgb('#6a5a98') : rgb('#40346c'), HAZE_V, 0.28));
      }
      crystals(b, 245, 70, [[-7, 19, 2.8, -2], [-1, 29, 3.5, 1], [6, 16, 2.6, 2], [-13, 11, 2.2, -2]], ['#b4f6f6', '#58cce6', '#2f7cc0'], '#6cf0ff');
      crystals(b, 130, 69, [[0, 11, 2.6, 0], [5, 7, 2.2, 1], [-5, 7, 2.2, -1]], ['#ffd0f0', '#f488cc', '#a8509c'], '#ff9ee0');
      BB.scatter(2, 30, 0, 2, W, 66, null, (x, y, r) => { px(b, x, y, [236, 252, 255], 0.35 + 0.4 * r); });
    },
    ground(b) {
      const g = ramp([[0, '#d4c8e6'], [0.16, '#9a8cb8'], [0.5, '#6c5c8e'], [1, '#42365e']]);
      BB.vgrad(b, 66, H, (y) => g((y - 66) / (H - 66)), 8);
      BB.glow(b, 40, 77, 150, 40, '#e0f6ff', 0.22, 1.2);
      BB.glow(b, 254, H, 150, 82, '#0c0630', 0.3, 1.3);
      BB.paint(b, 0, 68, W, H, (x, y) => {                                   // soft mottled rock, no hard texture
        const n = BB.noise2(x / 24, y / 8, 5) * 0.65 + BB.noise2(x / 9, y / 3.4, 9) * 0.35;
        return n > 0.5 ? [232, 244, 255, (n - 0.5) * 0.2] : [30, 18, 76, (0.5 - n) * 0.26];
      });
      BB.scatter(13, 9, 0, 72, W, 140, (x, y) => BB.free(x, y, 3), (x, y) => {   // glowing cave mushrooms
        BB.glow(b, x, y, 6, 4, '#7af0ff', 0.28, 1.3);
        px(b, x, y, [190, 255, 255], 1); px(b, x - 1, y, [90, 214, 236], 1); px(b, x + 1, y, [90, 214, 236], 1); px(b, x, y + 1, [210, 240, 244], 1);
      });
    },
  }));
})(typeof globalThis !== 'undefined' ? globalThis : window);
