/* src/art/tiles/stamp_lib.js — shared helpers for stamps (K.S): outline maps, facade parts (windows, doors, awnings, planters),
 * gingham / patchwork fabric, and the generic cottage builder used by every house-like stamp. Internal; see stamp_*.js. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const { P, col } = K;
  const { Color } = NP;
  const S = (K.S = {});

  /** BIBLE §2 type colours (drive the salon variants). */
  S.TYPE_COLORS = {
    fluff: '#b8b09a', ember: '#ef7d3c', tide: '#4f8fe8', volt: '#f2cf3a', sprout: '#6cbf4a', frost: '#8fdcdc',
    brawl: '#c4453a', nettle: '#a055b0', terra: '#d9b25f', gale: '#9db3f0', dream: '#f0609c', buzz: '#a6b92e',
    pebble: '#b09a4a', spook: '#6a5a9e', drake: '#5b3fd6', shade: '#5a4a42', iron: '#aab4c8',
  };

  /** [hi, lt, base, mid, dk, out] ramp (packed) for any base colour */
  S.ramp6 = (hex) => Color.ramp(hex, [2, 1, 0, -1, -2, -3]).map(col);

  /** outline colour function for K.outer: groups = [[tones[], outlineColour], ...] chosen by the neighbouring pixel's colour */
  S.omap = (groups, fallback) => {
    const m = new Map();
    for (const [tones, out] of groups) for (const t of tones) if (!m.has(t >>> 0)) m.set(t >>> 0, col(out));
    const fb = col(fallback);
    return (nb) => m.get(nb >>> 0) || fb;
  };
  const tones = (r) => r.slice(0, 5);
  S.tones = tones;

  /** gingham / patchwork check: c1 = light, c2 = mid, c3 = overlap (darkest) */
  S.gingham = (b, x, y, w, h, c1, c2, c3, cell) => {
    cell = cell || 2;
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      const a = ((xx / cell) | 0) & 1, d = ((yy / cell) | 0) & 1;
      b.set(x + xx, y + yy, a && d ? c3 : a || d ? c2 : c1);
    }
    return b;
  };

  /** four-hole button, d = 5 or 7 px across (cream disc, dark holes, lit rim) */
  S.button = (b, cx, cy, face, rim, hole) => {
    b.circle(cx, cy, 3, rim, true);
    b.circle(cx, cy, 2, face, true);
    b.set(cx - 1, cy - 1, hole); b.set(cx + 1, cy - 1, hole); b.set(cx - 1, cy + 1, hole); b.set(cx + 1, cy + 1, hole);
    b.set(cx - 1, cy - 2, P.white);
    return b;
  };

  // ---------------------------------------------------------------------------------------------- facade parts
  /** wooden plank door with two panels and a golden button knob */
  S.door = (b, x, y, w, h, o) => {
    o = o || {};
    b.fillRect(x - 1, y - 1, w + 2, h + 1, o.frame || P.o6);
    b.fillRect(x, y, w, h, P.o3);
    b.fillRect(x, y, 1, h, P.o2);
    b.fillRect(x + w - 1, y, 1, h, P.o4);
    const half = (h - 5) >> 1;
    b.strokeRect(x + 2, y + 2, w - 4, half, P.o4);
    b.strokeRect(x + 2, y + 3 + half, w - 4, h - 5 - half - 1, P.o4);
    b.fillRect(x + 3, y + 3, w - 6, 1, P.o2);
    b.fillRect(x + w - 4, y + (h >> 1), 2, 2, P.gd2);
    b.set(x + w - 3, y + (h >> 1) + 1, P.gd4);
    if (o.arch) { b.set(x - 1, y - 1, 0); b.set(x + w, y - 1, 0); }
    return b;
  };

  /** window: dark frame, pale casing, glass with a glint, muntins, sill; optional shutters / curtain valance */
  S.window = (b, x, y, w, h, o) => {
    o = o || {};
    b.fillRect(x - 1, y - 1, w + 2, h + 2, P.o5);
    b.fillRect(x, y, w, h, P.p0);
    b.fillRect(x + 1, y + 1, w - 2, h - 2, P.gl3);
    for (let yy = 0; yy < h - 2; yy++) for (let xx = 0; xx < w - 2; xx++) {
      const d = xx - yy;
      if (d === 1 || d === 2) b.set(x + 1 + xx, y + 1 + yy, P.gl2);
    }
    b.set(x + 1, y + 1, P.gl1);
    b.fillRect(x + (w >> 1), y, 1, h, P.p0);
    b.fillRect(x, y + (h >> 1), w, 1, P.p0);
    b.fillRect(x - 2, y + h + 1, w + 4, 1, P.p0);
    b.fillRect(x - 2, y + h + 2, w + 4, 1, P.p4);
    if (o.shutter) {
      const r = o.shutter;
      for (const sx of [x - 5, x + w + 2]) {
        b.fillRect(sx, y - 1, 3, h + 2, r[2]);
        b.fillRect(sx, y - 1, 1, h + 2, r[1]);
        b.fillRect(sx + 2, y - 1, 1, h + 2, r[3]);
        for (let yy = y + 1; yy < y + h; yy += 3) b.hline(sx, yy, 3, r[4]);
      }
    }
    if (o.curtain) {
      const r = o.curtain;
      b.fillRect(x + 1, y + 1, w - 2, 2, r[2]);
      for (let xx = x + 1; xx < x + w - 1; xx += 2) b.set(xx, y + 3, r[3]);
      b.fillRect(x + 1, y + 1, w - 2, 1, r[1]);
    }
    return b;
  };

  /** planter box with flowers (x,y = top-left of the box, w wide) */
  S.flowerBox = (b, x, y, w, pal) => {
    b.fillRect(x, y, w, 3, P.o3);
    b.fillRect(x, y, w, 1, P.o2);
    b.fillRect(x, y + 2, w, 1, P.o5);
    for (let i = 1; i < w - 1; i += 2) {
      b.set(x + i, y - 1, P.f3);
      b.set(x + i + (i % 4 === 1 ? 1 : -1), y - 1, P.f2);
      const c = pal[(i >> 1) % pal.length];
      b.set(x + i, y - 2, c);
    }
    return b;
  };

  /** striped scalloped awning from (x,y), w wide, h tall (stripes 4px) */
  S.awning = (b, x, y, w, h, c1, c2, edge) => {
    for (let xx = 0; xx < w; xx++) {
      const stripe = (xx >> 2) & 1;
      const base = stripe ? c2 : c1;
      const bottom = y + h + (((xx & 3) === 1 || (xx & 3) === 2) ? 2 : 1);
      for (let yy = y; yy < bottom; yy++) {
        let c = base;
        if (yy === y) c = edge[1];
        else if (yy >= bottom - 2) c = stripe ? edge[2] : edge[3];
        b.set(x + xx, yy, c);
      }
    }
    b.fillRect(x, y + 1, w, 1, edge[0]);
  };

  // ---------------------------------------------------------------------------------------------- the cottage builder
  const WALL = { base: 'p1', hi: 'p0', sh: 'p2', dk: 'p3' };
  /**
   * o: { w, h (tiles), ramp (roof [hi,lt,base,mid,dk,out]), roofTop, roofBottom (px rows, inclusive), inset, doorCol, doorW, doorH,
   *      wall: {base,hi,sh,dk}, windows: [{x,y,w,h, shutter, curtain}], trimBand, extras(b, ctx), outlineExtra: [[tones,out]] }
   * Returns the finished (outlined) bitmap. The wall is cream plaster with timber corner posts, a stone plinth and a patchwork roof.
   */
  S.house = function (o) {
    const W = o.w * 16, H = o.h * 16;
    const b = K.B(W, H);
    const r = o.ramp;
    const rt = o.roofTop === undefined ? 1 : o.roofTop, rb = o.roofBottom;
    const wl = 3, wr = W - 4;
    const wc = Object.assign({}, WALL, o.wall || {});
    const cw = (k) => col(wc[k]);
    // wall body
    b.fillRect(wl, rb + 1, wr - wl + 1, H - rb - 1, cw('base'));
    b.fillRect(wl, rb + 1, wr - wl + 1, 2, cw('dk'));
    b.fillRect(wl, rb + 3, wr - wl + 1, 1, cw('sh'));
    for (let i = 0; i < ((W * H) >> 6); i++) {
      const x = wl + 2 + (K.h32(i, o.w, 11) % (wr - wl - 3)), y = rb + 5 + (K.h32(i, o.h, 12) % (H - rb - 12));
      b.set(x, y, cw('sh'));
    }
    // timber corner posts, plinth
    b.fillRect(wl, rb + 1, 2, H - rb - 1, P.o3); b.fillRect(wl, rb + 1, 1, H - rb - 1, P.o2);
    b.fillRect(wr - 1, rb + 1, 2, H - rb - 1, P.o4); b.fillRect(wr - 1, rb + 1, 1, H - rb - 1, P.o3);
    if (o.trimBand) b.fillRect(wl + 2, H - 12, wr - wl - 3, 2, col(o.trimBand));
    b.fillRect(wl + 2, H - 3, wr - wl - 3, 3, P.c2);
    for (let x = wl + 2; x < wr - 1; x += 4) b.fillRect(x + (((x >> 2) & 1) ? 2 : 0), H - 3, 1, 2, P.c3);
    b.fillRect(wl + 2, H - 1, wr - wl - 3, 1, P.c4);
    // roof
    K.roof(b, 1, rt, W - 2, rb, r, { inset: o.inset === undefined ? 10 : o.inset, row: 5, alt: r[1] });
    // door + windows
    const doorW = o.doorW || 10, doorH = o.doorH || 14;
    const dx = (o.doorCol * 16) + ((16 - doorW) >> 1);
    if (o.doorFn) o.doorFn(b, dx, H - doorH, doorW, doorH);
    else S.door(b, dx, H - doorH, doorW, doorH);
    for (const wn of o.windows || []) S.window(b, wn.x, wn.y, wn.w, wn.h, wn);
    if (o.extras) o.extras(b, { W, H, rt, rb, dx, doorW, doorH, r });
    // outline: roof dark / wall dark / brick dark
    K.outer(b, S.omap([[tones(r), r[5]], [K.tn('br0', 'br1', 'br2', 'br3', 'br4'), 'br5'], [[P.o2, P.o3, P.o4], P.o6]].concat(o.outlineExtra || []), 'p6'));
    return b;
  };

  /** small brick chimney with a stone cap, x,y = top-left, 7 wide */
  S.chimney = (b, x, y, h) => {
    b.fillRect(x, y, 7, h, P.br2);
    b.fillRect(x, y, 2, h, P.br1);
    b.fillRect(x + 5, y, 2, h, P.br3);
    for (let yy = y + 2; yy < y + h; yy += 3) b.hline(x, yy, 7, P.br3);
    b.fillRect(x - 1, y - 2, 9, 2, P.c2);
    b.fillRect(x - 1, y - 2, 9, 1, P.c1);
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
