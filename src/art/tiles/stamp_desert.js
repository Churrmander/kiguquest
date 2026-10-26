/* src/art/tiles/stamp_desert.js — Chapter 4 props: the tent camp, the Dust Bowl and Bobbin Quarry.
 *  tent (4x3, canvas colours)      cactus (1x2, flowering or plain)     palm (2x3, oasis)
 *  thread_post (1x1, a post with a coloured thread knotted on; red / blue / yellow / green)
 *  slab_cart (2x1, a Society cart loaded with pale pressing slabs)   slab_stack (1x1)
 *  ore_cart (1x1, empty / full)    lever (1x1, track switch: left / right)    buffer (1x1, end-of-track buffer with a sign)
 *  cave_mouth (3x2, a timbered tunnel entrance; door in the middle of the bottom row)   scarf_nest (3x2 floor, the sand cave's nest)   nest_rim (its front rim, drawn over the sleepers)
 * Same rules as every stamp: lit from the top-left, 1px ink outline from S.omap, a soft contact shadow last. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const S = K.S;
  const { P, col } = K;
  K.addPal({
    cn0: '#fffaf0', cn1: '#f4e8d0', cn2: '#e4d0ac', cn3: '#c8ae84', cn4: '#9c8462',   // tent canvas
    cc0: '#c8e890', cc1: '#8cc860', cc2: '#5ca048', cc3: '#3c7838', cc4: '#245028',   // cactus
    cbl: '#ff8ab0', cbl2: '#e04a7a',                                                 // cactus flower
    pm1: '#9ad860', pm2: '#5cb040', pm3: '#3a8a34', pm4: '#246028',                  // palm fronds
    pt1: '#d8a868', pt2: '#b07c48', pt3: '#80562e',                                  // palm trunk
    sb0: '#ffffff', sb1: '#eef2f8', sb2: '#d4dce8', sb3: '#a8b4c8',                  // pressing slabs (Society white-blue)
  });
  const WOOD = [P.o0, P.o1, P.o2, P.o3, P.o4, P.o5];
  const CANVAS = [P.cn0, P.cn1, P.cn2, P.cn3, P.cn4];
  const ink = (extra) => S.omap([[WOOD, P.o6], [CANVAS, P.cn4]].concat(extra || []), 'ink');

  // ============================================================================================ tent (4x3)
  const STRIPES = { cream: null, red: ['#e85a50', '#b83a3a'], blue: ['#5a8ae0', '#3a5ab0'], green: ['#6ab060', '#40804a'], ochre: ['#e8a840', '#b07828'] };
  K.stamp('tent', {
    w: 4, h: 3, variants: Object.keys(STRIPES),
    paint: (v) => {
      const b = K.B(64, 48);
      const st = STRIPES[v];
      // the ridge runs left-right at y 8; canvas falls to the ground at y 40 on both slopes (3/4 view: we see the front slope)
      for (let y = 8; y <= 40; y++) {
        const t = (y - 8) / 32, half = 10 + t * 20;
        for (let x = Math.round(32 - half); x <= Math.round(32 + half); x++) {
          const u = (x - (32 - half)) / (2 * half);
          let c = u < 0.12 ? P.cn0 : u < 0.55 ? P.cn1 : u < 0.86 ? P.cn2 : P.cn3;
          if (st && ((x + 2) >> 3) % 2 === 0) c = u < 0.55 ? col(st[0]) : col(st[1]);   // painted stripes down the canvas
          if ((y - 8) % 8 === 7) c = P.cn3;                                             // seams across
          b.set(x, y, c);
        }
      }
      // the door flap, tied back: a dark triangle with a lit edge
      for (let y = 22; y <= 40; y++) { const w = Math.round((y - 22) * 0.55); for (let x = 32 - w; x <= 32 + w; x++) b.set(x, y, y > 38 ? P.o5 : P.cn4); }
      for (let y = 22; y <= 40; y++) { const w = Math.round((y - 22) * 0.55); b.set(32 - w - 1, y, P.cn0); }
      b.fillRect(26, 30, 2, 2, P.red2);                                                 // a tie-back knot
      // ridge pole and guy ropes with pegs
      b.fillRect(20, 6, 24, 2, P.o3); b.fillRect(20, 6, 24, 1, P.o1);
      b.fillRect(31, 2, 2, 5, P.o3); b.set(31, 2, P.o1);
      b.set(32, 1, P.red1); b.set(33, 1, P.red1); b.set(34, 2, P.red2);              // pennant
      b.line(14, 30, 4, 42, P.o4); b.line(50, 30, 60, 42, P.o4);
      b.fillRect(3, 42, 2, 2, P.o3); b.fillRect(59, 42, 2, 2, P.o3);
      K.outer(b, ink());
      K.shadow(b, 32, 44, 26, 3);
      return b;
    },
  });

  // ============================================================================================ cactus (1x2)
  K.stamp('cactus', {
    w: 1, h: 2, over: 1, solid: ['.', '#'], variants: ['flower', 'plain'],
    paint: (v) => {
      const b = K.B(16, 32);
      const tn = K.tn('cc0', 'cc1', 'cc2', 'cc3', 'cc4');
      // trunk + two arms (rounded columns, lit left)
      const column = (x, y0, y1, w) => { for (let y = y0; y <= y1; y++) for (let i = 0; i < w; i++) { const t = i / (w - 1); b.set(x + i, y, tn[t < 0.25 ? 1 : t < 0.6 ? 2 : t < 0.85 ? 3 : 4]); } b.fillRect(x + 1, y0 - 1, w - 2, 1, tn[1]); };
      column(6, 6, 29, 5);
      column(1, 12, 20, 4); b.fillRect(3, 20, 4, 3, tn[2]); b.fillRect(3, 22, 4, 1, tn[3]);
      column(11, 9, 17, 4); b.fillRect(10, 17, 3, 3, tn[2]); b.fillRect(10, 19, 3, 1, tn[3]);
      // ribs and spines
      for (let y = 8; y < 29; y += 3) { b.set(8, y, tn[3]); b.set(7, y + 1, P.cn0); b.set(10, y + 1, P.cn0); }
      for (let y = 14; y < 20; y += 3) { b.set(2, y, P.cn0); b.set(13, y - 3, P.cn0); }
      if (v === 'flower') { b.fillRect(7, 3, 3, 3, col('#ff8ab0')); b.set(8, 2, col('#ffd0e0')); b.set(9, 5, col('#e04a7a')); b.set(1, 11, col('#ff8ab0')); b.set(2, 11, col('#ffd0e0')); }
      // a little sand mound at the foot
      b.fillRect(4, 29, 9, 2, P.s2); b.fillRect(5, 29, 7, 1, P.s1);
      K.outer(b, S.omap([[tn, P.cc4], [[P.s1, P.s2], P.s4]], 'cc4'));
      K.shadow(b, 9, 31, 6, 1);
      return b;
    },
  });

  // ============================================================================================ palm (2x3): fronds over, trunk solid
  K.stamp('palm', {
    w: 2, h: 3, over: 2, solid: ['..', '..', '##'],
    paint: () => {
      const b = K.B(32, 48);
      const tr = K.tn('pt1', 'pt1', 'pt2', 'pt3', 'pt3');
      // a gently curved trunk with ring bands
      for (let y = 14; y < 46; y++) {
        const cx = 15 + Math.round(Math.sin((y - 14) / 14) * 2);
        for (let i = -2; i <= 2; i++) b.set(cx + i, y, tr[i < -1 ? 0 : i < 1 ? 2 : 4]);
        if (y % 4 === 0) { b.set(cx - 1, y, P.pt3); b.set(cx, y, P.pt3); }
      }
      // fronds: five long leaves drooping from the crown
      const leaf = (ang, len) => {
        for (let t = 0; t <= len; t++) {
          const x = 16 + Math.cos(ang) * t, y = 13 + Math.sin(ang) * t + (t * t) / (len * 1.6);
          const w = Math.max(1, Math.round(3 * (1 - t / len) + 0.6));
          for (let k = -w; k <= w; k++) b.set(Math.round(x), Math.round(y + k * 0.6), k < 0 ? P.pm1 : k < 1 ? P.pm2 : P.pm3);
        }
      };
      leaf(Math.PI, 14); leaf(0, 14); leaf(-2.4, 12); leaf(-0.7, 12); leaf(-1.57, 9); leaf(2.7, 11); leaf(0.45, 11);
      b.fillRect(14, 12, 4, 3, P.pt2);                                         // the crown
      b.set(13, 15, P.o4); b.set(18, 15, P.o4); b.set(14, 16, P.o3);         // dates
      K.outer(b, S.omap([[[P.pm1, P.pm2, P.pm3], P.pm4], [[P.pt1, P.pt2, P.pt3], P.o6]], 'pm4'));
      K.shadow(b, 16, 46, 9, 2);
      return b;
    },
  });

  // ============================================================================================ thread post (1x1)
  const THREADS = { red: ['#ff6a5a', '#d83a3a'], blue: ['#6aa0ff', '#3a64d0'], yellow: ['#ffe060', '#d8a820'], green: ['#7ad86a', '#3a9a44'] };
  K.stamp('thread_post', {
    w: 1, h: 1, variants: Object.keys(THREADS),
    paint: (v) => {
      const b = K.B(16, 16);
      const [lt, dk] = THREADS[v].map(col);
      K.cyl(b, 6, 2, 4, 12, K.TN.wood);
      b.fillRect(6, 2, 4, 1, P.o0);
      // the thread: wound round the top and streaming off on the wind (east)
      b.fillRect(5, 4, 6, 2, lt); b.fillRect(5, 5, 6, 1, dk);
      for (let x = 11; x < 16; x++) b.set(x, 4 + ((x >> 1) & 1), (x & 1) ? lt : dk);
      b.fillRect(5, 13, 6, 1, P.s3);
      K.outer(b, S.omap([[WOOD, P.o6], [[lt, dk], P.ink]], 'o6'));
      K.shadow(b, 8, 14, 4, 1);
      return b;
    },
  });

  // ============================================================================================ slab cart (2x1) and slab stack (1x1)
  function slabs(b, x, y, n) {
    for (let i = 0; i < n; i++) {
      const yy = y - i * 3;
      b.fillRect(x, yy, 12, 3, P.sb1); b.fillRect(x, yy, 12, 1, P.sb0); b.fillRect(x, yy + 2, 12, 1, P.sb3); b.set(x + 11, yy + 1, P.sb2);
    }
  }
  K.stamp('slab_cart', {
    w: 2, h: 1,
    paint: () => {
      const b = K.B(32, 16);
      b.fillRect(3, 7, 26, 5, P.o3); b.fillRect(3, 7, 26, 1, P.o1); b.fillRect(3, 11, 26, 1, P.o5);   // bed
      slabs(b, 5, 4, 2); slabs(b, 17, 4, 2);
      b.fillRect(9, 2, 4, 2, col('#4a6ab8')); b.set(10, 2, col('#a8c0ff'));                         // the Society's blue stamp
      for (const wx of [7, 23]) { b.ellipse(wx, 12, 3, 3, P.o4, true); b.ellipse(wx, 12, 1, 1, P.o2, true); }
      b.fillRect(0, 8, 3, 1, P.o4);                                                                  // the push bar
      // half sunk in sand at the back wheel
      b.fillRect(19, 13, 10, 3, P.s2); b.fillRect(20, 13, 8, 1, P.s1);
      K.outer(b, S.omap([[WOOD, P.o6], [[P.sb0, P.sb1, P.sb2, P.sb3], P.st5], [[P.s1, P.s2], P.s4]], 'ink'));
      K.shadow(b, 16, 14, 13, 1);
      return b;
    },
  });
  K.stamp('slab_stack', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      slabs(b, 2, 11, 4);
      b.fillRect(2, 0, 12, 1, P.sb0);
      K.outer(b, S.omap([[[P.sb0, P.sb1, P.sb2, P.sb3], P.st5]], 'ink'));
      K.shadow(b, 8, 14, 7, 1);
      return b;
    },
  });

  // ============================================================================================ ore cart (1x1)
  K.stamp('ore_cart', {
    w: 1, h: 1, variants: ['full', 'empty'],
    paint: (v) => {
      const b = K.B(16, 16);
      const st = K.TN.steel;
      b.fillRect(2, 5, 12, 7, st[2]); b.fillRect(2, 5, 12, 1, st[0]); b.fillRect(2, 5, 1, 7, st[1]); b.fillRect(13, 5, 1, 7, st[3]);
      b.fillRect(2, 8, 12, 1, st[3]);                                       // rivet band
      for (const x of [4, 8, 11]) b.set(x, 8, st[0]);
      if (v === 'full') { K.blob(b, 6, 4, 3, 2, K.TN.rock); K.blob(b, 10, 4, 3, 2, K.TN.rock); b.set(8, 2, col('#c8a0ff')); }
      else b.fillRect(3, 6, 10, 1, st[4]);
      b.fillRect(3, 12, 3, 2, P.n4); b.fillRect(10, 12, 3, 2, P.n4);
      K.outer(b, S.omap([[st, P.ink], [K.TN.rock, P.r4]], 'ink'));
      K.shadow(b, 8, 14, 6, 1);
      return b;
    },
  });

  // ============================================================================================ lever (1x1): a track-switch lever
  K.stamp('lever', {
    w: 1, h: 1, variants: ['left', 'right'],
    paint: (v) => {
      const b = K.B(16, 16);
      const st = K.TN.steel;
      b.fillRect(3, 10, 10, 4, P.o3); b.fillRect(3, 10, 10, 1, P.o1); b.fillRect(3, 13, 10, 1, P.o5);   // timber base
      const tipX = v === 'left' ? 4 : 12;
      b.line(8, 10, tipX, 3, st[3]); b.line(8, 10, tipX + (v === 'left' ? 1 : -1), 3, st[1]);
      b.fillRect(tipX - 1, 1, 3, 3, col('#e84a3a')); b.set(tipX - 1, 1, col('#ff9a8a'));               // red knob
      b.fillRect(6, 9, 4, 2, st[2]);
      K.outer(b, S.omap([[WOOD, P.o6], [st, P.ink]], 'ink'));
      K.shadow(b, 8, 14, 6, 1);
      return b;
    },
  });

  // ============================================================================================ buffer stop (1x1) with the Society sign
  K.stamp('buffer', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      b.fillRect(1, 9, 14, 4, P.o3); b.fillRect(1, 9, 14, 1, P.o1); b.fillRect(1, 12, 14, 1, P.o5);
      b.fillRect(2, 10, 3, 2, col('#e8c040')); b.fillRect(11, 10, 3, 2, col('#e8c040'));               // buffer pads
      b.fillRect(3, 1, 10, 7, P.sb1); b.fillRect(3, 1, 10, 1, P.sb0); b.fillRect(3, 7, 10, 1, P.sb3);  // white sign
      b.fillRect(5, 3, 6, 1, col('#3a5ab0')); b.fillRect(5, 5, 4, 1, col('#3a5ab0'));                   // flat blue writing
      b.fillRect(7, 8, 2, 1, P.o4);
      K.outer(b, S.omap([[WOOD, P.o6], [[P.sb0, P.sb1, P.sb3], P.st5]], 'ink'));
      K.shadow(b, 8, 14, 7, 1);
      return b;
    },
  });

  // ============================================================================================ shove rock (1x1): a loose boulder
  // `shove: true` makes it pushable with Disc: Shove (overworld.js). It sits on fresh scrape marks and has a crack across it,
  // so it reads as different from the fixed `boulder`.
  K.stamp('shove_rock', {
    w: 1, h: 1, shove: true, variants: ['desert', 'cave', 'magnet'],
    paint: (v) => {
      const b = K.B(16, 16);
      // `magnet`: a charged lodestone from the Spark Cellar, slate blue with a yellow bolt where it hums
      const tn = v === 'cave' ? K.tn('cv0', 'cv1', 'cv2', 'cv3', 'cv4') : v === 'magnet' ? K.tn('st0', 'st1', 'st2', 'st3', 'st4') : K.tn('ss0', 'ss1', 'ss2', 'ss3', 'ss4');
      K.blob(b, 8, 8, 7, 6, tn);
      if (v === 'magnet') {
        const y = col('#f4d040'), yd = col('#c89a20');
        for (const [x, yy] of [[9, 4], [8, 5], [7, 6], [8, 7], [9, 7], [8, 8], [7, 9], [6, 10]]) b.set(x, yy, y);
        b.set(10, 4, yd); b.set(9, 8, yd); b.set(7, 10, yd);
      } else { b.line(4, 6, 8, 9, tn[4]); b.line(8, 9, 11, 7, tn[4]); b.line(8, 10, 9, 12, tn[3]); }
      b.set(5, 4, tn[0]); b.set(6, 4, tn[0]); b.set(5, 5, tn[0]);
      K.outer(b, S.omap([[tn, v === 'cave' ? P.cv6 : v === 'magnet' ? P.st6 : P.ss6]], 'ink'));
      b.hline(1, 15, 3, P.s3); b.hline(12, 15, 3, P.s3);               // scrape marks either side
      K.shadow(b, 8, 14, 7, 2);
      return b;
    },
  });

  // ============================================================================================ burrow (1x1, floor)
  // a Jerbi burrow: a dark hole in the sand with a little kicked-up mound on the near side
  K.stamp('burrow', {
    w: 1, h: 1, layer: 'floor', solid: ['.'],
    paint: () => {
      const b = K.B(16, 16);
      K.blob(b, 8, 9.5, 7.5, 5.5, K.tn('cn0', 'cn1', 'cn2', 'cn3', 'cn4'));   // the kicked-up rim of pale dirt
      K.blob(b, 8, 8.5, 6, 4, K.tn('#4a2e18', '#3a2412', '#2e1c0e', '#24160a', '#1a1008'));   // the hole
      b.set(5, 7, col('#6a4a2a')); b.set(6, 6, col('#6a4a2a'));
      for (const [x, y] of [[3, 12], [12, 12], [13, 10]]) b.set(x, y, col('#e8d0a0'));
      return b;
    },
  });

  // ============================================================================================ scarf nest (3x2, floor)
  // the sand cave's nest: a ring of old cloth and scarves heaped into a raised rim, with a soft hollow in the middle
  K.stamp('scarf_nest', {
    w: 3, h: 2, layer: 'floor', solid: ['...', '...'],
    paint: () => {
      const b = K.B(48, 32);
      K.blob(b, 24, 17, 21, 12, CANVAS);                                   // the heaped rim
      K.blob(b, 24, 18, 14, 7, K.tn('cn3', 'cn3', 'cn4', 'cn4', 'cn4'), { lx: 0.55, ly: 0.72 });   // the hollow (lit from the far side)
      K.blob(b, 24, 19, 11, 5, K.tn('cn2', 'cn2', 'cn3', 'cn3', 'cn4'), { lx: 0.4, ly: 0.6 });
      // scarves draped over the rim: a red one, a teal one and a yellow one
      const drape = (x0, y0, x1, y1, c1, c2) => { for (let t = 0; t <= 1.0001; t += 0.05) { const x = Math.round(x0 + (x1 - x0) * t), y = Math.round(y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 2); b.set(x, y, col(c1)); b.set(x, y + 1, col(c1)); b.set(x, y + 2, col(c2)); } };
      drape(5, 13, 16, 7, '#e05a4a', '#a83a34');
      drape(30, 7, 43, 14, '#4ab0a0', '#2a7a72');
      drape(14, 26, 32, 27, '#e8b840', '#b07828');
      for (const [x, y, c] of [[4, 17, '#a83a34'], [6, 18, '#a83a34'], [43, 18, '#2a7a72'], [41, 19, '#2a7a72']]) b.set(x, y, col(c));
      K.outer(b, ink());
      K.shadow(b, 24, 29, 21, 2);
      return b;
    },
  });

  // the nest's front rim, drawn over whoever is sleeping in it (place it one row below the nest's top, over the sleepers' legs)
  K.stamp('nest_rim', {
    w: 3, h: 2, over: 1, layer: 'obj', solid: ['...', '###'],
    paint: () => {
      const b = K.B(48, 32);
      K.blob(b, 24, 14, 22, 5.5, K.tn('cn2', 'cn2', 'cn3', 'cn3', 'cn4'));   // a shade down from the canvas, so it sits in the den
      const drape = (x0, y0, x1, y1, c1, c2) => { for (let t = 0; t <= 1.0001; t += 0.05) { const x = Math.round(x0 + (x1 - x0) * t), y = Math.round(y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 2); b.set(x, y, col(c1)); b.set(x, y + 1, col(c2)); } };
      drape(6, 11, 22, 13, '#e8b840', '#b07828');
      drape(26, 13, 42, 11, '#e05a4a', '#a83a34');
      K.outer(b, ink());
      K.shadow(b, 24, 20, 20, 2);
      return b;
    },
  });

  // ============================================================================================ cave mouth (3x2): timbered tunnel entrance
  //   'dune': no timber, just a dark hollow dug into packed sand (the sand cave on the Sun Flats)
  K.stamp('cave_mouth', {
    w: 3, h: 2, solid: ['###', '#D#'], variants: ['mine', 'dune'],
    paint: (v) => {
      const b = K.B(48, 32);
      const rock = K.tn('ss0', 'ss1', 'ss2', 'ss3', 'ss4');
      if (v === 'dune') {
        const sand = K.tn('ss1', 'ss2', 'ss2', 'ss3', 'ss4');   // the dune's own sandstone, so the arch reads as cut into it
        K.blob(b, 24, 20, 23, 12, sand);
        for (let y = 9; y < 32; y++) for (let x = 13; x < 35; x++) {
          const dx = (x + 0.5 - 24) / 10.5, dy = (y - 20) / 10.5;
          if (y >= 20 || dx * dx + dy * dy <= 1) b.set(x, y, y < 13 ? col('#3a2618') : y < 17 ? col('#24160e') : col('#180e08'));
        }
        for (const [x0, x1, y] of [[3, 10, 22], [37, 44, 21], [5, 11, 27], [38, 45, 27]]) for (let x = x0; x <= x1; x++) b.set(x, y, P.ss3);   // wind ripples
        K.outer(b, S.omap([[sand, P.ss5]], 'ink'));
        return b;
      }
      K.blob(b, 24, 18, 23, 15, rock);
      // the dark mouth, an arch
      for (let y = 10; y < 32; y++) for (let x = 15; x < 33; x++) {
        const dx = (x + 0.5 - 24) / 9, dy = (y - 18) / 9;
        if (y >= 18 || dx * dx + dy * dy <= 1) b.set(x, y, y < 14 ? col('#2a1c18') : col('#1a1210'));
      }
      // timber frame: two posts and a lintel
      b.fillRect(14, 12, 3, 20, P.o2); b.fillRect(14, 12, 1, 20, P.o1);
      b.fillRect(31, 12, 3, 20, P.o3); b.fillRect(33, 12, 1, 20, P.o5);
      b.fillRect(12, 9, 24, 4, P.o2); b.fillRect(12, 9, 24, 1, P.o0); b.fillRect(12, 12, 24, 1, P.o4);
      // a lantern on the lintel
      b.fillRect(22, 13, 4, 4, col('#ffd860')); b.set(22, 13, col('#fff4c0'));
      K.outer(b, S.omap([[rock, P.ss6], [WOOD, P.o6]], 'ink'));
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
