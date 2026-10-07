/* src/art/tiles/stamp_buildings.js — outdoor buildings: house_s / house_m / house_l, lab, tea_house, general_store, salon, windmill.
 * Every building is a patchwork-roofed cottage (K.roof) with a 'D' door tile in the bottom row; all other tiles are solid. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const S = K.S;
  const { P, col } = K;

  const ROOF_VARIANTS = ['red', 'blue', 'green', 'yellow', 'pink', 'gray'];
  const solidRows = (w, h, doorCol) => {
    const rows = [];
    for (let y = 0; y < h; y++) rows.push(y === h - 1 ? '#'.repeat(doorCol) + 'D' + '#'.repeat(w - doorCol - 1) : '#'.repeat(w));
    return rows;
  };
  const BLOOM = [P.pk2, P.yl2, P.red1, P.bl1];

  /** round attic window set into the roof */
  function atticWindow(b, cx, cy) {
    b.circle(cx, cy, 5, P.o5, true);
    b.circle(cx, cy, 4, P.p0, true);
    b.circle(cx, cy, 3, P.gl3, true);
    b.set(cx - 1, cy - 1, P.gl1); b.set(cx - 2, cy, P.gl2); b.set(cx, cy - 2, P.gl2);
    b.fillRect(cx, cy - 3, 1, 7, P.p0);
    b.fillRect(cx - 3, cy, 7, 1, P.p0);
  }

  // ============================================================================================ houses
  K.stamp('house_s', {
    w: 4, h: 3, solid: solidRows(4, 3, 2), variants: ROOF_VARIANTS,
    paint: (variant) => {
      const r = K.ramp(variant);
      return S.house({
        w: 4, h: 3, ramp: r, roofTop: 1, roofBottom: 22, inset: 12, doorCol: 2,
        windows: [{ x: 12, y: 29, w: 9, h: 8, shutter: r }, { x: 50, y: 29, w: 6, h: 8, curtain: r }],
        extras: (b) => { S.flowerBox(b, 11, 41, 11, BLOOM); },
      });
    },
  });

  K.stamp('house_m', {
    w: 5, h: 4, solid: solidRows(5, 4, 2), variants: ROOF_VARIANTS,
    paint: (variant) => {
      const r = K.ramp(variant);
      return S.house({
        w: 5, h: 4, ramp: r, roofTop: 1, roofBottom: 29, inset: 12, doorCol: 2,
        windows: [{ x: 11, y: 39, w: 11, h: 9, shutter: r }, { x: 58, y: 39, w: 11, h: 9, shutter: r }],
        extras: (b) => {
          S.chimney(b, 56, 5, 11);
          atticWindow(b, 40, 15);
          S.flowerBox(b, 10, 52, 13, BLOOM); S.flowerBox(b, 57, 52, 13, BLOOM);
        },
      });
    },
  });

  K.stamp('house_l', {
    w: 6, h: 4, solid: solidRows(6, 4, 3), variants: ROOF_VARIANTS,
    paint: (variant) => {
      const r = K.ramp(variant);
      return S.house({
        w: 6, h: 4, ramp: r, roofTop: 1, roofBottom: 29, inset: 14, doorCol: 3,
        windows: [{ x: 11, y: 39, w: 9, h: 9, shutter: r }, { x: 31, y: 39, w: 9, h: 9, shutter: r }, { x: 71, y: 39, w: 11, h: 9, shutter: r }],
        extras: (b) => {
          S.chimney(b, 72, 5, 11);
          atticWindow(b, 48, 15);
          S.flowerBox(b, 10, 52, 11, BLOOM); S.flowerBox(b, 30, 52, 11, BLOOM); S.flowerBox(b, 70, 52, 13, BLOOM);
        },
      });
    },
  });

  // ============================================================================================ lab
  K.stamp('lab', {
    w: 7, h: 5, solid: solidRows(7, 5, 3),
    paint: () => {
      const r = K.ramp('teal');
      const st = [P.st1, P.st2, P.st3, P.st4, P.st5];
      return S.house({
        w: 7, h: 5, ramp: r, roofTop: 8, roofBottom: 33, inset: 16, doorCol: 3, doorW: 14, doorH: 16,
        trimBand: P.st3,
        windows: [{ x: 10, y: 44, w: 14, h: 12 }, { x: 28, y: 44, w: 14, h: 12 }, { x: 70, y: 44, w: 14, h: 12 }, { x: 88, y: 44, w: 14, h: 12 }],
        doorFn: (b, x, y, w, h) => {
          b.fillRect(x - 1, y - 1, w + 2, h + 1, P.st6);
          b.fillRect(x, y, w, h, P.st4);
          for (const lx of [x + 1, x + 8]) {
            b.fillRect(lx, y + 1, 5, h - 2, P.gl3);
            b.fillRect(lx, y + 1, 1, h - 2, P.gl2);
            b.set(lx + 1, y + 2, P.gl1); b.set(lx + 2, y + 3, P.gl1);
          }
          b.fillRect(x + 6, y, 2, h, P.st5);
          b.set(x + 5, y + (h >> 1), P.gd2); b.set(x + 8, y + (h >> 1), P.gd2);
        },
        extras: (b, c) => {
          // rooftop gear: lightning-rod with a red button-ball, and a vent box
          b.fillRect(82, 3, 2, 12, P.n3); b.set(82, 3, P.n1);
          b.circle(83, 3, 2, P.red2, true); b.set(82, 2, P.red0);
          b.fillRect(24, 11, 10, 7, P.n2); b.fillRect(24, 11, 10, 1, P.n0); b.fillRect(24, 17, 10, 1, P.n4);
          for (let x = 26; x < 33; x += 2) b.vline(x, 13, 3, P.n4);
          // plaque over the door: teal panel with a big button and thread dashes
          b.fillRect(45, 49, 22, 11, r[5]);
          b.fillRect(46, 50, 20, 9, r[2]);
          b.fillRect(46, 50, 20, 1, r[1]); b.fillRect(46, 58, 20, 1, r[3]);
          S.button(b, 56, 54, P.p0, P.p2, r[4]);
          K.stitchH(b, 48, 54, 5, P.p0, 1, 1); K.stitchH(b, 60, 54, 5, P.p0, 1, 1);
          S.flowerBox(b, 9, 58, 16, BLOOM); S.flowerBox(b, 27, 58, 16, BLOOM); S.flowerBox(b, 69, 58, 16, BLOOM); S.flowerBox(b, 87, 58, 16, BLOOM);
        },
      });
    },
  });

  // ============================================================================================ tea house
  const HEART = ['.xx.xx.', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'];
  K.stamp('tea_house', {
    w: 5, h: 4, solid: solidRows(5, 4, 2),
    paint: () => {
      const r = K.ramp('pink');
      return S.house({
        w: 5, h: 4, ramp: r, roofTop: 8, roofBottom: 31, inset: 12, doorCol: 2, trimBand: P.pk1,
        windows: [{ x: 10, y: 40, w: 12, h: 10, curtain: r }],
        extras: (b) => {
          // heart flag on a pole at the ridge
          b.fillRect(40, 0, 2, 11, P.o4); b.set(40, 0, P.o2);
          b.fillRect(42, 1, 13, 9, P.red2);
          b.fillRect(42, 1, 13, 1, P.red1); b.fillRect(42, 9, 13, 1, P.red3);
          b.blit(K.spr(HEART, { x: P.p0 }), 45, 3);
          for (let i = 0; i < 3; i++) b.set(55, 2 + i * 3, P.red3);   // swallow-tail nicks
          atticWindow(b, 58, 20);
          S.flowerBox(b, 9, 53, 14, BLOOM);
          // striped awning over the door
          S.awning(b, 31, 43, 18, 3, P.pk2, P.p1, [P.pk0, P.pk1, P.pk3, P.pk4]);
          // hanging teapot sign on a bracket
          b.fillRect(58, 38, 12, 1, P.o4); b.fillRect(58, 38, 1, 12, P.o4);
          b.fillRect(60, 41, 9, 9, P.pk4); b.fillRect(61, 42, 7, 7, P.p1);
          b.fillRect(62, 45, 5, 3, P.pk2); b.fillRect(62, 44, 3, 1, P.pk3); b.set(61, 45, P.pk2); b.set(67, 45, P.pk2);
          b.set(63, 43, P.pk3); b.set(64, 43, P.pk3); b.set(65, 48, P.pk3); b.set(66, 48, P.pk3);
        },
        outlineExtra: [[[P.red2, P.red1, P.red3, P.pk4, P.p1], P.red4]],
      });
    },
  });

  // ============================================================================================ general store
  K.stamp('general_store', {
    w: 5, h: 4, solid: solidRows(5, 4, 2),
    paint: () => {
      const r = K.ramp('blue');
      return S.house({
        w: 5, h: 4, ramp: r, roofTop: 1, roofBottom: 27, inset: 10, doorCol: 2,
        windows: [],
        extras: (b) => {
          // two shop windows with shelves of goods
          const shopWin = (x) => {
            S.window(b, x, 46, 22, 11);
            for (let i = 0; i < 2; i++) {
              const sy = 50 + i * 4;
              b.hline(x + 1, sy + 1, 20, P.o3);
              for (let k = 0; k < 6; k++) b.fillRect(x + 2 + k * 3 + (i ? 1 : 0), sy - 2, 2, 3, [P.red1, P.yl2, P.bl2, P.pk2, P.f2, P.pu2][(k + i * 2) % 6]);
            }
          };
          shopWin(8); shopWin(50);
          // sign above the door: wooden board with a big button
          b.fillRect(30, 39, 20, 10, P.o5);
          b.fillRect(31, 40, 18, 8, P.o2);
          b.fillRect(31, 40, 18, 1, P.o1); b.fillRect(31, 47, 18, 1, P.o3);
          S.button(b, 40, 44, P.p1, P.p3, P.o5);
          K.stitchH(b, 32, 44, 4, P.p0, 1, 1); K.stitchH(b, 44, 44, 4, P.p0, 1, 1);
          // red-and-cream striped awning under the eaves
          S.awning(b, 4, 28, 72, 8, P.red2, P.p1, [P.red0, P.red1, P.red3, P.red4]);
        },
        outlineExtra: [[[P.red2, P.red1, P.red3, P.p1], P.red4]],
      });
    },
  });

  // ============================================================================================ salon
  const SALON_TYPES = Object.keys(S.TYPE_COLORS);
  const SCISSORS = [
    '..x.....x..', '..xx...xx..', '...xx.xx...', '....xxx....', '.....o.....', '....xxx....', '..xx.x.xx..', '.x..x.x..x.', '.x..xxx..x.', '..xx...xx..',
  ];
  const SALON_RAMPS = {};
  for (const t of SALON_TYPES) SALON_RAMPS[t] = S.ramp6(S.TYPE_COLORS[t]);
  K.stamp('salon', {
    w: 7, h: 5, solid: solidRows(7, 5, 3), variants: SALON_TYPES,
    paint: (variant) => {
      const r = SALON_RAMPS[variant];
      return S.house({
        w: 7, h: 5, ramp: r, roofTop: 1, roofBottom: 30, inset: 16, doorCol: 3, doorH: 14, trimBand: r[2],
        windows: [{ x: 11, y: 52, w: 24, h: 13 }, { x: 77, y: 52, w: 24, h: 13 }],
        extras: (b) => {
          // little dress forms in the display windows
          for (const wx of [11, 77]) for (let k = 0; k < 2; k++) {
            const cx = wx + 7 + k * 10;
            b.fillRect(cx - 2, wx === 11 ? 57 : 57, 5, 5, k ? r[3] : r[2]);
            b.fillRect(cx - 2, 57, 1, 5, r[1]);
            b.set(cx, 55, P.o1); b.set(cx, 56, P.o2);
            b.fillRect(cx, 62, 1, 2, P.o4); b.hline(cx - 1, 64, 3, P.o4);
          }
          // hanging banner with scissors and a button
          b.fillRect(44, 34, 24, 2, P.o4); b.fillRect(44, 34, 24, 1, P.o2);
          b.set(43, 34, P.gd2); b.set(68, 34, P.gd2); b.set(43, 35, P.gd4); b.set(68, 35, P.gd4);
          b.fillRect(47, 36, 18, 23, r[2]);
          b.fillRect(47, 36, 2, 23, r[1]); b.fillRect(63, 36, 2, 23, r[3]);
          b.fillRect(47, 36, 18, 1, r[4]);
          for (let yy = 55; yy <= 58; yy++) for (let xx = 47; xx < 65; xx++) if (Math.abs(xx - 55.5) < (yy - 54) * 1.6) b.set(xx, yy, 0);
          K.stitchH(b, 50, 38, 12, P.p0, 2, 2);
          b.blit(K.spr(SCISSORS, { x: r[4], o: r[4] }), 51, 41);
          b.blit(K.spr(SCISSORS, { x: P.p0, o: P.gd2 }), 50, 40);
          S.button(b, 56, 53, P.p0, P.p2, r[4]);
        },
        outlineExtra: [[[P.p0, P.gd2, P.gd4], r[5]]],
      });
    },
  });

  // ============================================================================================ windmill (animated)
  const SAIL_COLORS = ['pink', 'sky', 'yellow', 'mint'];
  K.stamp('windmill', {
    w: 3, h: 4, frames: 4, animSpeed: 10,
    paint: (variant, frame) => {
      const W = 48, H = 64, cx = 24, hubY = 21;
      const b = K.B(W, H);
      const rr = K.ramp('red');
      // tower
      for (let y = 25; y < H; y++) {
        const hw = 9 + Math.round(((y - 25) * 5) / 38);
        for (let x = cx - hw; x < cx + hw; x++) {
          const lx = x - (cx - hw), rx = cx + hw - 1 - x;
          b.set(x, y, lx < 3 ? P.p0 : rx < 4 ? P.p3 : rx < 6 ? P.p2 : P.p1);
        }
        if (y >= 56) for (let x = cx - hw; x < cx + hw; x++) b.set(x, y, ((x + (y >> 2)) & 3) === 0 ? P.c3 : (x - (cx - hw) < 3 ? P.c1 : P.c2));
        else if (y % 8 === 4) for (let x = cx - hw + 3; x < cx + hw - 4; x += 4) b.set(x, y, P.p2);
      }
      for (let x = 14; x < 34; x++) b.set(x, 63, P.c4);
      // conical cap
      for (let y = 13; y <= 25; y++) {
        const hw = 1 + Math.round(((y - 13) * 12) / 12);
        for (let x = cx - hw; x <= cx + hw; x++) {
          const t = (x - (cx - hw)) / Math.max(1, 2 * hw);
          let c = t < 0.28 ? rr[1] : t < 0.65 ? rr[2] : rr[3];
          if (y === 25) c = rr[4];
          else if ((y - 13) % 4 === 3) c = t < 0.65 ? rr[3] : rr[4];
          b.set(x, y, c);
        }
      }
      S.door(b, 20, 51, 8, 12);
      S.window(b, 21, 36, 6, 6);
      // sails: four cloth blades on timber arms, rotating 22.5deg per frame
      for (let k = 0; k < 4; k++) {
        const a = (-90 + k * 90 + frame * 22.5) * Math.PI / 180;
        const dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
        const sr = K.ramp(SAIL_COLORS[k]);
        const P0 = [cx + dx * 4, hubY + dy * 4], P1 = [cx + dx * 20, hubY + dy * 20];
        const pts = [P0, P1, [P1[0] + nx * 6, P1[1] + ny * 6], [P0[0] + nx * 6, P0[1] + ny * 6]];
        b.polygon(pts, sr[2]);
        // lattice lines across the blade + dark border
        for (let t = 0.2; t < 1; t += 0.2) {
          const ax = P0[0] + (P1[0] - P0[0]) * t, ay = P0[1] + (P1[1] - P0[1]) * t;
          b.line(Math.round(ax), Math.round(ay), Math.round(ax + nx * 6), Math.round(ay + ny * 6), sr[3]);
        }
        const edge = (p, q, c) => b.line(Math.round(p[0]), Math.round(p[1]), Math.round(q[0]), Math.round(q[1]), c);
        edge(pts[0], pts[1], P.o4); edge(pts[1], pts[2], sr[4]); edge(pts[2], pts[3], sr[4]); edge(pts[3], pts[0], sr[4]);
        edge([cx, hubY], P1, P.o3);
      }
      b.circle(cx, hubY, 3, P.o4, true); b.circle(cx, hubY, 2, P.o2, true); b.set(cx - 1, hubY - 1, P.o0);
      const sails = SAIL_COLORS.flatMap((n) => K.ramp(n).slice(0, 5));
      K.outer(b, S.omap([[rr.slice(0, 5), rr[5]], [sails, P.ink2]], 'p6'));
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
