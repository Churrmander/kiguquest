/* src/art/tiles/stamp_temple.js — the rebuilt Spindle Shrine (owner's art direction, STORY Ch2, 2026-10-26): a grand Japanese temple deep
 * in Gingham Woods. Outdoor pieces:
 *   `temple`        12x6 (+rise 32)  the worship hall: two tiers of sweeping curved roofs in slate tiles, vermilion pillars, white plaster,
 *                                    a thick thread rope (shimenawa) with thread streamers over the double door, a bell rope and offering box.
 *                                    `default pressed` (pressed = the Society's work, as on the old `shrine`: drained white and pale
 *                                    blue-grey, streamers ironed into flat squares, the rope pulled dead straight, lanterns dark).
 *                                    Door: the two middle cells of the bottom row. 3D: a hip-roofed volume behind the facade.
 *   `torii`         4x3              the red gate on the approach. Walk through the middle two columns; the two pillar feet block. The beams
 *                                    (rows 0-1) draw over actors.
 *   `stone_lantern` 1x2              a grey stone toro: base, post, lit firebox, curved cap.
 *   `sacred_tree`   2x3              a great old tree with a thick thread rope tied round its trunk. Canopy rows walkable, over 2.
 *   `basin`         2x2              the water basin pavilion: a little roofed stand over a stone trough with ladles.
 * Indoor pieces (the hall map):
 *   `altar_steps`   8x2              raised wooden steps up to the altar, red cloth runner down the middle (a floor stamp: you walk up them).
 *   `everspool`     2x3 (+rise 8)    the Everspool high on a lacquered pedestal; its golden-green thread loops round in a slow circle
 *                                    (6 frames). Solid.
 *   `ward`          1x1 (+rise 16)   one tile of the woven ward across a doorway: `up` (shimmering curtain of thread, 4 frames, solid by map
 *                                    collision) and `down` (slack, dull, hanging in tatters; the map keeps it walkable).
 *   `shide`         1x1              wall decor: a thread rope swag with zigzag thread streamers, for the hall's wall rows.
 *   `temple_pillar` 1x2              a vermilion lacquered pillar with black bands on a stone footing.
 * Hall terrains: `floor_temple` (long polished boards), `wall_temple` (plaster panels between dark lacquered posts) and `shrine_runner` (flat red runner, gold edge).
 * Ground: `gravel` (raked shrine gravel, edged into grass) and `sando` (the stone approach slabs; same group as the gravel).
 */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const { P, col } = K;
  const T = 16;

  // ------------------------------------------------------------------------------------------------ palettes
  const PALE = ['#ffffff', '#eef2f8', '#d4dcea', '#aab6cc', '#8492ac', '#4c5470'].map(col);
  const VERM = ['#ffb08c', '#f4704c', '#d84a34', '#a83428', '#6c2224'].map(col);   // vermilion lacquer: hi, lt, base, sh, dk
  const SLATE = ['#a8b4c8', '#7c8aa4', '#5c6884', '#424a66', '#2c3048', '#1c1e30'].map(col);   // roof tiles: hi .. outline
  const ROPE = ['#fff4c8', '#ecd690', '#c8a860', '#8c7040'].map(col);   // straw-gold thread rope
  const THREAD = ['#e8ffb0', '#b8e060', '#78b438', '#4c7c2c'].map(col);   // the Everspool's golden-green thread
  const PAL = {
    default: {
      tile: SLATE, verm: VERM, wall: [P.p0, P.p1, P.p2, P.p3], wood: [P.o1, P.o2, P.o3, P.o4, P.o5, P.o6],
      stone: [P.c0, P.c1, P.c2, P.c3, P.c4, P.c5], rope: ROPE, paper: P.p0, gold: [P.gd0 || col('#fff0a0'), col('#f0c040'), col('#b07c20')],
      lamp: [P.l0, P.l1, P.l2], streamer: [P.p0, P.p2], bell: [col('#f8d860'), col('#c89830'), col('#7c5820')],
    },
    pressed: {
      tile: [PALE[1], PALE[2], PALE[3], PALE[4], PALE[5], col('#343a50')], verm: [PALE[0], PALE[1], PALE[2], PALE[3], PALE[5]],
      wall: [P.st0 || PALE[0], PALE[0], PALE[1], PALE[2]], wood: [PALE[1], PALE[2], PALE[3], PALE[4], PALE[5], col('#343a50')],
      stone: [PALE[0], PALE[1], PALE[2], PALE[3], PALE[4], PALE[5]], rope: [PALE[0], PALE[1], PALE[2], PALE[3]], paper: PALE[1],
      gold: [PALE[1], PALE[2], PALE[3]], lamp: [PALE[2], PALE[3], PALE[3]], streamer: [PALE[0], PALE[2]], bell: [PALE[1], PALE[3], PALE[4]],
    },
  };

  // ------------------------------------------------------------------------------------------------ helpers
  /** A sweeping temple roof seen from the front: concave hips that flare out to upturned eave tips.
   *  cx centre, y0 ridge row, y1 eave row, hw0 half width at the ridge, hw1 half width at the eave, lift = how far the tips curl up. */
  function curvedRoof(b, cx, y0, y1, hw0, hw1, lift, tl) {
    const H = y1 - y0;
    const half = (y) => { const t = (y - y0) / H; return hw0 + (hw1 - hw0) * Math.pow(t, 1.9); };
    const eaveY = (x) => { const u = Math.min(1, Math.abs(x - cx) / hw1); return y1 - Math.round(lift * Math.pow(u, 3.2)); };
    // light from the top left: the left third of the roof a step lighter, the right third a step darker
    const tone = (x, i) => { const sh = x < cx - hw1 * 0.34 ? -1 : x > cx + hw1 * 0.34 ? 1 : 0; return tl[Math.max(0, Math.min(4, i + sh))]; };
    for (let y = y0; y <= y1; y++) {
      const h = Math.round(half(y));
      for (let x = cx - h; x <= cx + h; x++) {
        if (y > eaveY(x)) continue;
        const ry = y - y0;
        let c;
        // vertical rows of round tiles: a lit crest, the body, a shadowed trough
        const k = ((x - cx) % 6 + 6) % 6;
        c = k === 0 ? tone(x, 3) : k === 1 ? tone(x, 0) : k === 2 || k === 3 ? tone(x, 1) : tone(x, 2);
        if (ry < 3) c = ry === 0 ? tl[4] : ry === 1 ? tl[1] : tl[0];   // ridge cap
        b.u32[y * b.w + x] = c;
      }
      // hip edges: a bright left verge, a dark right one
      if (y > y0 + 1 && y <= eaveY(cx - h)) { b.u32[y * b.w + (cx - h)] = tl[0]; b.u32[y * b.w + (cx + h)] = tl[4]; }
    }
    // the eave: a solid band of tiles following the curl out to the upturned tips, then a dark fascia with round tile ends along it
    for (let x = Math.round(cx - hw1); x <= Math.round(cx + hw1); x++) {
      const ey = eaveY(x), u = Math.abs(x - cx) / hw1, th = Math.max(2, Math.round(5 - 3 * Math.pow(u, 4)));
      for (let y = ey - th; y <= ey; y++) if (!b.isOpaque(x, y)) { const k = ((x - cx) % 6 + 6) % 6; b.set(x, y, k === 0 ? tone(x, 3) : k === 1 ? tone(x, 0) : tone(x, 1)); }
      if (!b.isOpaque(x, ey - th - 1)) b.set(x, ey - th - 1, x < cx ? tl[0] : tl[4]);
      b.set(x, ey - 2, tl[2]); b.set(x, ey - 1, tl[4]); b.set(x, ey, tl[5]);
    }
    for (let x = Math.round(cx - hw1) + 3; x <= Math.round(cx + hw1) - 3; x += 6) {
      const ey = eaveY(x);
      b.set(x, ey - 2, tl[0]); b.set(x + 1, ey - 2, tl[1]); b.set(x, ey - 1, tl[3]);
    }
    // the eave's shadow falls across whatever stands below it (2 rows, the second dithered), but not past the tips
    for (let x = Math.round(cx - hw1 * 0.92); x <= Math.round(cx + hw1 * 0.92); x++) {
      const ey = eaveY(x);
      if (b.isOpaque(x, ey + 1)) b.set(x, ey + 1, tl[4]);
      if (b.isOpaque(x, ey + 2) && ((x + ey) & 1)) b.set(x, ey + 2, tl[3]);
    }
    // ridge ends: little upturned fins
    for (const s of [-1, 1]) {
      const x = cx + s * hw0;
      b.fillRect(x - 1, y0 - 3, 3, 3, tl[4]); b.set(x - s, y0 - 4, tl[4]); b.set(x, y0 - 3, tl[1]);
    }
  }

  /** a vermilion pillar, x..x+w-1 from y0 to y1: lit left edge, shaded right, dark outline, a stone footing */
  function pillar(b, x, y0, y1, w, v, st) {
    b.fillRect(x, y0, w, y1 - y0 + 1, v[2]);
    b.vline(x, y0, y1 - y0 + 1, v[4]); b.vline(x + w - 1, y0, y1 - y0 + 1, v[4]);
    b.vline(x + 1, y0, y1 - y0 + 1, v[1]); if (w > 4) b.vline(x + 2, y0, y1 - y0 + 1, v[0]);
    b.vline(x + w - 2, y0, y1 - y0 + 1, v[3]);
    b.fillRect(x - 1, y1 - 1, w + 2, 2, st[3]); b.hline(x - 1, y1 - 1, w + 2, st[1]);
  }

  /** a thick twisted thread rope from x0 to x1, sagging `sag` px in the middle (0 = dead straight), 3 px thick */
  function rope(b, x0, x1, y, sag, r) {
    for (let x = x0; x <= x1; x++) {
      const t = (x - x0) / Math.max(1, x1 - x0), yy = y + Math.round(sag * 4 * t * (1 - t));
      const tw = ((x - x0) % 4);
      b.set(x, yy - 1, r[3]); b.set(x, yy, tw < 2 ? r[0] : r[1]); b.set(x, yy + 1, tw < 2 ? r[1] : r[2]); b.set(x, yy + 2, r[3]);
    }
    return (x) => { const t = (x - x0) / Math.max(1, x1 - x0); return y + Math.round(sag * 4 * t * (1 - t)); };
  }

  /** a zigzag thread streamer (shide) hanging from (x, y); pressed = ironed into one flat square */
  function streamer(b, x, y, s, pressed, outline) {
    if (pressed) { b.fillRect(x - 1, y + 1, 4, 5, s[0]); b.strokeRect(x - 2, y, 6, 7, outline); b.hline(x - 1, y + 5, 4, s[1]); return; }
    // a paper-white zigzag of folded thread ribbon, 2 px wide, lit side white and shadow side grey
    const zz = [[0, 1, 3], [1, 3, 3], [0, 5, 3], [1, 7, 3]];
    for (const [dx, dy, len] of zz) { b.fillRect(x + dx, y + dy, 2, 2, s[0]); b.set(x + dx + 2, y + dy, s[1]); b.set(x + dx + 2, y + dy + 1, s[1]); void len; }
    b.set(x, y, outline); b.set(x + 1, y, outline);
  }


  // ------------------------------------------------------------------------------------------------ ground: raked gravel and the stone approach
  // `gravel`: pale grey shrine gravel raked into soft rows, edged into grass like the dirt path. `sando`: the approach of big square
  // stone slabs laid through the gravel (same group, so the gravel draws no grass lip against it).
  const GPX = K.profile('gravel-x', 0.8, [2, 3]), GPY = K.profile('gravel-y', 0.8, [2, 3]);
  const gravelTex = (x, y, v) => {
    // loose pale pebbles: mostly two light greys, scattered dark grains and bright stones, and a faint raked furrow every 5 rows
    const h = K.h32(x + v * 16, y, 313) % 23;
    if (h === 0 || h === 1) return P.n2;          // sparse darker pebbles
    if (h === 2) return P.c2;
    if ((y + v * 2) % 5 === 0 && K.h32(x, y + v, 314) % 3 === 0) return P.c2;   // a faint raked furrow
    return (K.h32(x, y, 315 + v) % 3) ? P.n1 : P.c1;
  };
  K.terrain('gravel', {
    autotile: true, variants: 2, step: 'sand',
    paint: (m, f, v) => K.edgedGround(m, v, gravelTex, { lip: 1.4, R: 6, px: GPX, py: GPY, edgeDark: P.g4, shadow: P.c3, rim: P.n0 }),
  });
  K.terrain('sando', {
    group: 'gravel', variants: 2, step: 'stone',
    paint: (m, f, v) => {
      const b = K.B(T, T);
      b.fillRect(0, 0, T, T, P.c2);
      b.fillRect(1, 1, 14, 14, P.c1); b.hline(1, 1, 14, P.c0); b.vline(1, 1, 14, P.c0); b.hline(1, 14, 14, P.c3); b.vline(14, 1, 14, P.c3);
      b.hline(0, 15, T, P.c4); b.vline(15, 0, T, P.c4);
      for (let i = 0; i < 9; i++) b.set(3 + (K.h32(i, v, 41) % 10), 3 + (K.h32(i, v, 42) % 10), (i % 3) ? P.c2 : P.c0);
      b.set(2, 2, P.c0); b.set(13, 13, P.c4);
      return b;
    },
  });

  // ------------------------------------------------------------------------------------------------ temple
  const TW = 192, TH = 96 + 32;
  function paintTemple(variant) {
    const pressed = variant === 'pressed';
    const A = PAL[pressed ? 'pressed' : 'default'];
    const b = K.B(TW, TH), cx = 96, tl = A.tile, v = A.verm, st = A.stone, wd = A.wood, wl = A.wall;
    const OUT = tl[5];

    // ---- stone platform and the front steps (bottom row)
    const gs = pressed ? st : [P.n0, P.n1, P.n2, P.n3, P.n4, P.n5];   // cool grey granite
    b.fillRect(6, 104, 180, 24, gs[2]);
    b.fillRect(6, 104, 180, 2, gs[0]); b.hline(6, 106, 180, gs[1]);
    for (let r = 0; r < 3; r++) {
      const y = 107 + r * 7;
      b.hline(7, y + 6, 178, gs[4]);
      for (let x = 6 + (r & 1) * 6 + 12; x < 186; x += 12) { b.vline(x, y, 6, gs[4]); b.vline(x + 1, y, 6, gs[1]); }
      b.hline(7, y, 178, gs[1]);
    }
    for (let i = 0; i < 40; i++) b.set(8 + (K.h32(i, 7, 71) % 176), 108 + (K.h32(i, 8, 72) % 18), (i & 1) ? gs[3] : gs[1]);
    b.fillRect(6, 125, 180, 3, gs[3]); b.hline(6, 127, 180, gs[5]);
    b.vline(6, 104, 24, gs[1]); b.vline(185, 104, 24, gs[4]);
    // steps up to the door, centred on the door cells (x 80..111)
    for (let i = 0; i < 4; i++) {
      const y = 108 + i * 5, x0 = 78 - i * 2, w = 36 + i * 4;
      b.fillRect(x0, y, w, 5, gs[1]); b.hline(x0, y, w, gs[0]); b.hline(x0, y + 1, w, gs[0]); b.hline(x0, y + 4, w, gs[3]);
      b.vline(x0, y, 5, gs[2]); b.vline(x0 + w - 1, y, 5, gs[4]);
    }

    // ---- lower storey: plaster panels between vermilion pillars, latticed side screens, the open double door
    const fy0 = 70, fy1 = 104;
    b.fillRect(14, fy0, 164, fy1 - fy0, wl[1]);
    b.fillRect(14, fy0, 164, 3, wl[3]); b.hline(14, fy0 + 3, 164, wl[2]);
    // lattice screens (paper behind a vermilion grid) in the four side bays
    for (const [x0, x1] of [[22, 46], [52, 74], [118, 140], [146, 170]]) {
      b.fillRect(x0, fy0 + 7, x1 - x0, 22, A.paper);
      for (let x = x0 + 3; x < x1; x += 4) b.vline(x, fy0 + 7, 22, v[3]);
      for (let y = fy0 + 10; y < fy0 + 29; y += 5) b.hline(x0, y, x1 - x0, v[3]);
      b.strokeRect(x0 - 1, fy0 + 6, x1 - x0 + 2, 24, wd[4]);
      b.fillRect(x0 - 1, fy0 + 30, x1 - x0 + 2, 2, wd[2]); b.hline(x0 - 1, fy0 + 31, x1 - x0 + 2, wd[4]);   // wooden sill
      b.fillRect(x0 - 1, fy1 - 4, x1 - x0 + 2, 3, wd[3]); b.hline(x0 - 1, fy1 - 4, x1 - x0 + 2, wd[1]);   // wooden skirting board
    }
    // the doorway: dark interior, a warm glow of candles at the back (default only), red door leaves folded open
    b.fillRect(80, fy0 + 4, 32, fy1 - fy0 - 4, wd[5]);
    b.fillRect(82, fy0 + 6, 28, fy1 - fy0 - 6, OUT);
    if (!pressed) { b.fillRect(90, fy0 + 20, 12, 10, wd[4]); for (const x of [92, 96, 100]) { b.set(x, fy0 + 18, A.lamp[1]); b.set(x, fy0 + 19, A.lamp[0]); b.vline(x, fy0 + 20, 3, A.lamp[2]); } }
    else { b.fillRect(90, fy0 + 20, 12, 10, wd[4]); }
    for (const x of [80, 106]) { b.fillRect(x, fy0 + 4, 6, fy1 - fy0 - 4, v[2]); b.vline(x, fy0 + 4, fy1 - fy0 - 4, v[1]); b.vline(x + 5, fy0 + 4, fy1 - fy0 - 4, v[4]); for (let y = fy0 + 8; y < fy1; y += 6) b.hline(x + 1, y, 4, v[3]); }
    // pillars
    for (const x of [14, 48, 76, 110, 142, 174]) pillar(b, x, fy0, fy1, 6, v, st);
    // tie beam over the bays, with gold end caps
    b.fillRect(12, fy0, 168, 5, v[2]); b.hline(12, fy0, 168, v[1]); b.hline(12, fy0 + 4, 168, v[4]);
    for (const x of [14, 48, 76, 110, 142, 174]) { b.fillRect(x + 1, fy0 + 1, 4, 3, A.gold[1]); b.set(x + 1, fy0 + 1, A.gold[0]); }
    // offering box in front of the door, on the top step
    b.fillRect(84, 99, 24, 9, wd[3]); b.fillRect(84, 99, 24, 2, wd[1]); b.hline(84, 107, 24, wd[5]);
    for (let x = 86; x < 106; x += 3) b.vline(x, 101, 5, wd[4]);
    b.vline(84, 99, 9, wd[5]); b.vline(107, 99, 9, wd[5]);

    // ---- lower roof (a wide pent roof skirting the whole hall)
    curvedRoof(b, cx, 50, 70, 74, 95, 7, tl);

    // ---- the thread rope and streamers along the lower eave, the bell rope over the door
    const ry = rope(b, 22, 170, 72, pressed ? 0 : 3, A.rope);
    for (let x = 30; x <= 162; x += 22) streamer(b, x, ry(x) + 3, A.streamer, pressed, OUT);
    // big thick knot of rope over the door with the bell
    b.fillRect(88, 72, 16, 5, A.rope[1]); b.hline(88, 72, 16, A.rope[0]); b.hline(88, 76, 16, A.rope[3]);
    for (let x = 90; x < 104; x += 3) b.vline(x, 73, 3, A.rope[2]);
    b.circle(96, 80, 3, A.bell[1], true); b.set(95, 79, A.bell[0]); b.hline(94, 83, 5, A.bell[2]);
    // the bell rope: red-and-white thread braid hanging to the offering box
    for (let y = 84; y < 99; y++) { b.set(96, y, ((y >> 1) & 1) ? v[2] : A.streamer[0]); b.set(97, y, ((y >> 1) & 1) ? A.streamer[0] : v[3]); }

    // ---- upper storey (a band of lattice and bracket work between the roofs)
    b.fillRect(36, 38, 120, 14, v[2]);
    b.hline(36, 38, 120, v[1]); b.hline(36, 51, 120, v[4]);
    for (let x = 40; x < 152; x += 8) { b.fillRect(x, 41, 5, 8, A.paper); b.vline(x + 2, 41, 8, v[3]); b.hline(x, 44, 5, v[3]); }
    // bracket clusters under the upper eave
    for (let x = 38; x < 156; x += 16) { b.fillRect(x, 36, 6, 3, wd[2]); b.hline(x, 36, 6, wd[1]); b.hline(x, 38, 6, wd[4]); }
    // a gold name plaque on the upper storey: a spool and thread, no lettering
    b.fillRect(86, 40, 20, 10, A.gold[2]); b.fillRect(87, 41, 18, 8, A.gold[1]); b.hline(87, 41, 18, A.gold[0]);
    b.fillRect(93, 43, 6, 4, pressed ? PALE[3] : VERM[2]); b.hline(92, 43, 8, A.gold[2]); b.hline(92, 46, 8, A.gold[2]);
    if (!pressed) { b.set(99, 45, THREAD[1]); b.set(100, 46, THREAD[1]); b.set(101, 45, THREAD[1]); b.set(102, 44, THREAD[1]); }
    else b.hline(99, 45, 4, PALE[4]);

    // ---- upper roof
    curvedRoof(b, cx, 4, 38, 30, 72, 8, tl);
    // gold finials at the ridge ends and a little gold flame in the middle
    for (const x of [cx - 30, cx + 30]) { b.fillRect(x - 1, 0, 3, 4, A.gold[1]); b.set(x - 1, 0, A.gold[0]); b.set(x + 1, 3, A.gold[2]); }
    b.fillRect(cx - 2, 1, 5, 3, A.gold[1]); b.set(cx, 0, A.gold[0]); b.hline(cx - 2, 3, 5, A.gold[2]);

    // ---- hanging lanterns at the lower eave corners
    for (const lx of [26, 162]) {
      const lo = pressed ? PALE[4] : OUT;
      b.vline(lx + 3, 64, 4, lo);
      b.fillRect(lx, 68, 8, 10, pressed ? PALE[4] : v[2]); b.fillRect(lx + 1, 69, 6, 8, pressed ? PALE[3] : A.lamp[1]);
      b.vline(lx + 2, 69, 8, pressed ? PALE[2] : A.lamp[0]); b.hline(lx, 68, 8, lo); b.hline(lx, 77, 8, lo);
      b.hline(lx + 1, 72, 6, pressed ? PALE[3] : v[1]);
      b.vline(lx + 3, 78, 3, A.rope[2]);
    }
    return b;
  }
  K.stamp('temple', {
    w: 12, h: 6, rise: 32, over: 0, variants: ['default', 'pressed'],
    solid: ['############', '############', '############', '############', '############', '#####DD#####'],
    paint: (v) => paintTemple(v),
    // 3D: a deep hip-roofed hall behind the facade (the facade carries both tiers of curved roof)
    vol: (variant) => {
      const pressed = variant === 'pressed';
      return {
        w: 12, h: 6, W: TW, H: TH, ramp: pressed ? [PALE[1], PALE[2], PALE[3], PALE[4], PALE[5], col('#343a50')] : SLATE,
        wall: pressed ? { base: 'n0', hi: 'n0', sh: 'n1', dk: 'n2' } : { base: 'p1', hi: 'p0', sh: 'p2', dk: 'p3' },
        wl: 14, wr: 177, roofL: 1, roofR: 190, rt: 4, rb: 70, inset: 30, Hw: 58, Ztop: 124, windows: null, plinth: 24, awnings: [], backFlip: true,
      };
    },
  });

  // ------------------------------------------------------------------------------------------------ torii
  K.stamp('torii', {
    w: 4, h: 3, over: 2, variants: ['default'],
    solid: ['....', '....', '#..#'],
    paint: () => {
      const b = K.B(64, 48), v = VERM, OUT = col('#2a1418'), BL = [col('#5c5a68'), col('#3c3a48'), col('#2c2a34')];
      // pillars: three tones (lit left, base, shadowed right), black feet
      for (const x of [5, 53]) {
        b.fillRect(x, 10, 6, 34, v[2]); b.vline(x, 10, 34, OUT); b.vline(x + 5, 10, 34, OUT);
        b.vline(x + 1, 10, 34, v[0]); b.vline(x + 2, 10, 34, v[1]); b.vline(x + 4, 10, 34, v[3]);
        b.fillRect(x - 1, 40, 8, 6, BL[2]); b.hline(x - 1, 40, 8, BL[0]); b.vline(x - 1, 40, 6, BL[1]); b.hline(x - 1, 45, 8, OUT);
      }
      // lower tie beam (nuki) running through the pillars, ends poking out
      b.fillRect(1, 15, 62, 4, v[2]); b.hline(1, 15, 62, v[0]); b.hline(1, 16, 62, v[1]); b.hline(1, 18, 62, OUT); b.vline(1, 15, 4, OUT); b.vline(62, 15, 4, OUT);
      // a thread rope slung under the beam between the pillars, with three paper-white streamers
      const ry = rope(b, 11, 52, 20, 2, ROPE);
      for (const x of [17, 30, 43]) streamer(b, x, ry(x) + 3, [P.p0, P.n2], false, ROPE[3]);
      // the centre strut and a dark wooden plaque with a gold rim
      b.fillRect(29, 7, 6, 8, v[2]); b.vline(29, 7, 8, OUT); b.vline(34, 7, 8, OUT); b.vline(30, 7, 8, v[1]);
      b.fillRect(27, 8, 10, 7, P.o5); b.strokeRect(27, 8, 10, 7, col('#c8a040')); b.hline(28, 9, 8, P.o4); b.set(27, 8, col('#fff0a0'));
      b.fillRect(30, 10, 4, 3, col('#c8a040')); b.hline(30, 10, 4, col('#fff0a0'));   // a little gold spool on the plaque
      // top lintel (kasagi + shimaki): black cap curving up at both ends, lit top edge, over a red beam
      for (let x = 0; x < 64; x++) {
        const u = Math.abs(x - 31.5) / 32, lift = Math.round(4 * Math.pow(u, 3));
        b.fillRect(x, 3 - lift, 1, 4, BL[2]); b.set(x, 3 - lift, BL[0]); b.set(x, 4 - lift, BL[1]); b.set(x, 2 - lift, OUT);
        b.fillRect(x, 7 - lift, 1, 2, v[2]); b.set(x, 7 - lift, v[1]); b.set(x, 9 - lift, OUT);
      }
      return b;
    },
  });

  // ------------------------------------------------------------------------------------------------ stone lantern
  K.stamp('stone_lantern', {
    w: 1, h: 2, over: 1, solid: ['.', '#'], variants: ['default', 'dark'],
    paint: (variant) => {
      const b = K.B(16, 32), s = [P.n0, P.n1, P.n2, P.n3, P.n4, P.n5], lit = variant !== 'dark';
      K.shadow(b, 8, 30, 7, 2);
      b.fillRect(1, 26, 14, 4, s[2]); b.hline(1, 26, 14, s[1]); b.hline(1, 29, 14, s[4]); b.vline(1, 26, 4, s[3]); b.vline(14, 26, 4, s[4]);   // wide base
      b.fillRect(5, 19, 6, 7, s[2]); b.vline(5, 19, 7, s[1]); b.vline(9, 19, 7, s[3]); b.vline(4, 19, 7, s[4]); b.vline(10, 19, 7, s[4]);    // squat post
      b.fillRect(2, 17, 12, 2, s[2]); b.hline(2, 17, 12, s[1]); b.hline(2, 18, 12, s[4]);                                                  // saucer
      b.fillRect(2, 10, 12, 7, s[3]); b.strokeRect(2, 10, 12, 7, s[5]); b.vline(3, 11, 5, s[2]);                                           // wide firebox
      b.fillRect(5, 11, 6, 5, lit ? P.l1 : s[4]); if (lit) { b.hline(5, 11, 6, P.l0); b.hline(5, 15, 6, P.l2); b.vline(8, 11, 5, s[3]); } else b.vline(8, 11, 5, s[5]);
      for (let x = 0; x < 16; x++) {                                                                                                       // broad curved cap
        const u = Math.abs(x - 7.5) / 8, top = 4 + Math.round(4 * u) - (u > 0.85 ? 1 : 0);
        b.fillRect(x, top, 1, 10 - top, s[2]); b.set(x, top, x < 8 ? s[0] : s[1]); b.set(x, 9, s[4]); if (x > 9) b.set(x, top + 1, s[3]);
      }
      b.fillRect(6, 1, 4, 3, s[2]); b.hline(6, 1, 4, s[0]); b.set(9, 3, s[4]);                                                            // the knob on top
      return b;
    },
  });

  // ------------------------------------------------------------------------------------------------ sacred tree
  K.stamp('sacred_tree', {
    w: 2, h: 3, over: 2, solid: ['..', '..', '##'], variants: ['default'],
    paint: () => {
      const b = K.B(32, 48);
      K.shadow(b, 16, 45, 13, 3);
      // a thick, knotted trunk spreading into roots, in vertical bark tones
      b.fillRect(9, 24, 14, 21, P.b2);
      b.fillRect(7, 40, 18, 5, P.b2); b.fillRect(5, 43, 4, 2, P.b2); b.fillRect(23, 43, 4, 2, P.b2);
      for (let x = 9; x < 23; x++) { const t = (x - 9) / 13, c = t < 0.2 ? P.b0 : t < 0.45 ? P.b1 : t < 0.75 ? P.b2 : P.b3; b.vline(x, 24, 21, c); }
      for (const [x, y, h] of [[12, 28, 6], [16, 37, 5], [19, 26, 7], [14, 40, 3]]) b.vline(x, y, h, P.b3);   // bark furrows
      b.vline(8, 26, 19, P.b4); b.vline(23, 26, 19, P.b4); b.hline(5, 45, 22, P.b4);
      // the thread rope round the trunk with two white streamers
      for (let x = 8; x <= 23; x++) { const yy = 32 + (x === 8 || x === 23 ? 1 : 0); b.set(x, yy - 1, ROPE[3]); b.set(x, yy, (x & 2) ? ROPE[0] : ROPE[1]); b.set(x, yy + 1, (x & 2) ? ROPE[1] : ROPE[2]); b.set(x, yy + 2, ROPE[3]); }
      streamer(b, 11, 35, [P.p0, P.n2], false, ROPE[3]); streamer(b, 18, 35, [P.p0, P.n2], false, ROPE[3]);
      // a big lime canopy in chunky lobes, like the forest billboards: lime on top, deep green underneath
      const F = [P.g0, P.g1, P.g2, P.g3, P.g4, P.g5];
      for (const [cx, cy, r] of [[9, 16, 9], [23, 16, 9], [16, 10, 10], [16, 19, 9]]) b.circle(cx, cy, r, F[3], true);
      for (const [cx, cy, r] of [[9, 13, 7], [16, 8, 8], [23, 13, 7]]) b.circle(cx, cy, r, F[2], true);
      for (const [cx, cy, r] of [[8, 11, 4], [15, 6, 5], [22, 11, 4]]) b.circle(cx, cy, r, F[1], true);
      for (const [cx, cy, r] of [[7, 9, 2], [13, 4, 2], [21, 9, 2]]) b.circle(cx, cy, r, F[0], true);
      for (const [cx, cy, r] of [[25, 20, 5], [16, 23, 5], [7, 20, 4]]) b.circle(cx, cy, r, F[4], true);
      const o = b.clone();
      for (let y = 0; y < 30; y++) for (let x = 0; x < 32; x++) {
        if (o.isOpaque(x, y)) continue;
        if (o.isOpaque(x + 1, y) || o.isOpaque(x - 1, y) || o.isOpaque(x, y + 1) || o.isOpaque(x, y - 1)) b.set(x, y, F[5]);
      }
      return b;
    },
  });

  // ------------------------------------------------------------------------------------------------ water basin pavilion
  K.stamp('basin', {
    w: 2, h: 2, over: 0, variants: ['default'],
    paint: () => {
      const b = K.B(32, 32), v = VERM, s = [P.n0, P.n1, P.n2, P.n3, P.n4, P.n5];
      K.shadow(b, 16, 30, 14, 2);
      // the stone trough with water
      b.fillRect(5, 20, 22, 9, s[2]); b.hline(5, 20, 22, s[0]); b.hline(5, 28, 22, s[4]); b.vline(5, 20, 9, s[1]); b.vline(26, 20, 9, s[4]);
      b.fillRect(7, 21, 18, 3, P.w3); b.hline(7, 21, 18, P.w2); b.set(10, 22, P.w0); b.set(19, 22, P.w1);
      // two wooden ladles across it
      for (const x of [10, 18]) { b.hline(x, 19, 7, P.o3); b.fillRect(x, 18, 3, 2, P.o2); b.set(x, 18, P.o1); }
      // four red posts and a little curved slate roof
      for (const x of [3, 27]) { b.fillRect(x, 8, 2, 21, v[2]); b.vline(x, 8, 21, v[1]); b.set(x + 1, 28, v[4]); }
      for (let x = 0; x < 32; x++) {
        const u = Math.abs(x - 15.5) / 16, lift = Math.round(3 * Math.pow(u, 4)), top = 2 + Math.round(4 * u);
        for (let y = top; y <= 9 - lift; y++) b.set(x, y, ((x % 4) === 0 ? SLATE[3] : (x % 4) === 1 ? SLATE[0] : SLATE[1]));
        b.set(x, 9 - lift, SLATE[5]); b.set(x, top, SLATE[4]);
      }
      return b;
    },
  });

  // ------------------------------------------------------------------------------------------------ indoor: altar steps
  K.stamp('altar_steps', {
    w: 8, h: 2, over: 0, layer: 'floor', solid: ['........', '........'], variants: ['default'],
    paint: () => {
      // dark lacquered wood, so the steps stand out from the honey floor: a light tread, a dark riser, a shadow under each nose
      const b = K.B(128, 32), L = [col('#c88a5c'), col('#9c5c3c'), col('#7a4030'), col('#5a2c28'), col('#3a1c20')], G = [col('#fff0a0'), col('#f0c040'), col('#b07c20')];
      for (let i = 0; i < 3; i++) {
        const y = 1 + i * 10, x0 = 12 - i * 6, w = 104 + i * 12;
        b.fillRect(x0, y, w, 3, L[0]); b.hline(x0, y, w, G[0]);                      // tread with a gold nosing line
        b.fillRect(x0, y + 3, w, 6, L[2]); b.hline(x0, y + 3, w, L[4]);              // riser, shadow under the nose
        for (let x = x0 + 9; x < x0 + w; x += 18) b.vline(x, y + 4, 5, L[3]);
        b.hline(x0, y + 9, w, L[4]); b.vline(x0, y, 10, L[1]); b.vline(x0 + w - 1, y, 10, L[4]);
      }
      // the red runner down the middle: flat red with gold edges, lit on each tread, darker on each riser
      for (let i = 0; i < 3; i++) { const y = 1 + i * 10; b.fillRect(53, y, 22, 3, VERM[1]); b.fillRect(53, y + 3, 22, 7, VERM[2]); b.hline(53, y + 3, 22, VERM[4]); }
      b.vline(52, 1, 31, G[1]); b.vline(75, 1, 31, G[2]);
      return b;
    },
  });

  // ------------------------------------------------------------------------------------------------ indoor: the Everspool
  K.stamp('everspool', {
    w: 2, h: 3, rise: 8, over: 0, frames: 6, animSpeed: 12, variants: ['default'],
    paint: (variant, f) => {
      const b = K.B(32, 56), gold = [col('#fff0a0'), col('#f0c040'), col('#b07c20'), col('#6c4818')];
      const LQ = [col('#9c5c3c'), col('#7a4030'), col('#5a2c28'), col('#3a1c20')];   // dark lacquered wood
      K.shadow(b, 16, 54, 13, 2);
      // a tapering lacquered-wood pedestal: broad foot, one gold band, a round red tray on top
      b.fillRect(5, 47, 22, 7, LQ[1]); b.hline(5, 47, 22, LQ[0]); b.hline(5, 53, 22, LQ[3]); b.vline(5, 47, 7, LQ[0]); b.vline(26, 47, 7, LQ[3]);
      for (let y = 27; y < 47; y++) { const hw = 3 + Math.round((y - 27) / 8); b.hline(16 - hw, y, hw * 2, LQ[1]); b.set(16 - hw, y, LQ[0]); b.set(17 - hw, y, LQ[0]); b.set(15 + hw, y, LQ[3]); }
      b.fillRect(11, 37, 10, 2, gold[1]); b.hline(11, 37, 10, gold[0]); b.hline(11, 38, 10, gold[2]);
      b.fillRect(5, 23, 22, 4, VERM[2]); b.hline(5, 23, 22, VERM[0]); b.hline(5, 26, 22, VERM[4]); b.vline(5, 23, 4, VERM[1]); b.vline(26, 23, 4, VERM[4]);
      // a few golden-green sparkles drifting up past the spool (they rise a pixel each frame and wrap)
      for (const [sx, sy] of [[5, 14], [26, 8], [6, 4], [25, 18]]) { const y = 2 + ((sy - f * 2 + 40) % 20); b.set(sx, y, THREAD[0]); b.set(sx, y + 1, THREAD[1]); }
      // the spool: two dark lacquer flanges with gold rims (darker than the thread, so the barrel is the bright part) and a fat
      // barrel wound in golden-green thread. Three diagonal highlight bands slide down the winding over the 6 frames.
      for (const fy of [4, 19]) {
        b.fillRect(8, fy, 16, 4, LQ[2]); b.hline(8, fy, 16, gold[1]); b.hline(8, fy + 3, 16, LQ[3]);
        b.vline(8, fy, 4, LQ[3]); b.vline(23, fy, 4, LQ[3]); b.hline(9, fy + 1, 14, LQ[1]); b.set(9, fy, gold[0]); b.set(10, fy, gold[0]);
      }
      b.fillRect(10, 8, 12, 11, THREAD[2]);
      for (let y = 8; y < 19; y++) { b.set(10, y, THREAD[3]); b.set(11, y, THREAD[2]); b.set(21, y, THREAD[3]); b.set(20, y, THREAD[3]); if (y % 2 === 0) b.hline(12, y, 8, THREAD[2]); else b.hline(12, y, 8, THREAD[1]); }
      for (let k = 0; k < 3; k++) for (let y = 8; y < 19; y++) {
        const x = 11 + ((y + k * 5 - f * 2 + 66) % 15);   // a band leaning down to the right
        if (x >= 11 && x <= 20) { b.set(x, y, k === 0 ? col('#ffffff') : THREAD[0]); if (x + 1 <= 20) b.set(x + 1, y, THREAD[1]); }
      }
      // the loose end: a short 2 px tail of thread curling off the barrel's right side and back
      for (const [x, y] of [[22, 12], [23, 13], [24, 14], [24, 15], [23, 16]]) { b.set(x, y, THREAD[1]); b.set(x, y + 1, THREAD[3]); }
      return b;
    },
  });

  // ------------------------------------------------------------------------------------------------ indoor: a vermilion hall pillar
  K.stamp('temple_pillar', {
    w: 1, h: 2, variants: ['default'],
    paint: () => {
      const b = K.B(16, 32), v = VERM, OUT = col('#3a1a1c');
      K.shadow(b, 8, 30, 7, 2);
      b.fillRect(3, 26, 10, 4, P.n2); b.hline(3, 26, 10, P.n0); b.hline(3, 29, 10, P.n4); b.vline(3, 26, 4, P.n3); b.vline(12, 26, 4, P.n4);   // stone footing
      b.fillRect(4, 2, 8, 24, v[2]);
      b.vline(4, 2, 24, OUT); b.vline(11, 2, 24, OUT); b.vline(5, 2, 24, v[1]); b.vline(6, 2, 24, v[0]); b.vline(10, 2, 24, v[3]);
      for (const y of [4, 22]) { b.fillRect(4, y, 8, 2, col('#2c2430')); b.hline(4, y, 8, col('#5c5064')); }                            // black lacquer bands
      b.fillRect(2, 0, 12, 2, P.o3); b.hline(2, 0, 12, P.o1); b.hline(2, 1, 12, P.o5);                                                     // beam bracket
      return b;
    },
  });

  // ------------------------------------------------------------------------------------------------ indoor: the woven ward
  // Two tiles tall (1x1 footprint + rise 16) so it reads as a curtain filling the doorway, hung from a rope lintel.
  K.stamp('ward', {
    w: 1, h: 1, rise: 16, over: 0, frames: 4, animSpeed: 10, layer: 'obj', solid: ['.'], variants: ['up', 'down'],
    paint: (variant, f) => {
      const b = K.B(16, 32);
      // the lintel: a straw-gold thread rope across the top, the same rope as the shide swags
      b.hline(0, 1, 16, ROPE[3]); b.hline(0, 2, 16, ROPE[1]); b.hline(0, 3, 16, ROPE[2]); b.hline(0, 4, 16, ROPE[3]);
      for (let x = 0; x < 16; x += 4) { b.set(x, 2, ROPE[0]); b.set(x + 1, 3, ROPE[1]); }
      if (variant === 'down') {
        // slack: a few short, dull loose threads hanging from the lintel
        const DULL = [col('#bcb294'), col('#968c70'), col('#6c6450')];
        for (const [x, len] of [[2, 4], [8, 3], [12, 5]]) {
          for (let y = 5; y < 5 + len; y++) { const sx = x + (y > 5 + len * 0.6 ? 1 : 0); b.set(sx, y, y === 4 + len ? DULL[2] : DULL[0]); b.set(sx + 1, y, DULL[1]); }
        }
        return b;
      }
      // up: straight vertical threads every 2 px from the lintel to the floor (a sheer curtain: the gaps stay open), alternating
      // two golds; a soft bright band slides down the curtain over the 4 frames; the threads themselves never break
      const G = [col('#fff8d0'), col('#f8d860'), col('#e0b040'), col('#a87c28')];
      const band = 5 + f * 7;
      for (let x = 0; x < 16; x += 2) {
        for (let y = 5; y < 31; y++) {
          const d = Math.abs(y - band);
          b.set(x, y, d < 2 ? G[0] : d < 4 ? G[1] : (x % 4 === 0 ? G[1] : G[2]));
        }
      }
      // a faint weft every 8 rows binds the threads, so it reads as woven
      for (let y = 12; y < 31; y += 8) for (let x = 1; x < 16; x += 4) b.set(x, y, G[3]);
      b.hline(0, 31, 16, G[3]);   // hem
      return b;
    },
  });

  // ------------------------------------------------------------------------------------------------ indoor: thread streamers on the wall
  K.stamp('shide', {
    w: 1, h: 1, over: 0, solid: ['#'], variants: ['default'],
    paint: () => {
      const b = K.B(16, 16);
      for (let x = 0; x < 16; x++) { const yy = 3 + Math.round(2 * Math.sin((x / 15) * Math.PI)); b.set(x, yy - 1, ROPE[3]); b.set(x, yy, (x & 2) ? ROPE[0] : ROPE[1]); b.set(x, yy + 1, ROPE[2]); }
      // one big folded-paper streamer, 3 px wide with a grey shade column, so it still reads at 1x
      b.set(7, 6, P.o5); b.set(8, 6, P.o5);
      for (const [dx, dy] of [[0, 7], [2, 9], [0, 11], [2, 13]]) { b.fillRect(6 + dx, dy, 3, 2, P.p0); b.vline(9 + dx, dy, 2, P.p3); b.hline(6 + dx, dy + 1, 3, P.p1); }
      return b;
    },
  });

  // ------------------------------------------------------------------------------------------------ indoor terrains for the hall
  // `wall_temple`: white plaster panels framed by dark lacquered posts and a tie beam (group 'wall', same autotile rule as the
  // other walls: face / skirting base / flat top). `shrine_runner`: a flat red cloth runner with a gold edge (no woven noise).
  const D = K.DIR;
  const LAC = [col('#6c4a3c'), col('#4c3028'), col('#2e1c1a'), col('#1c1012')];   // dark lacquered wood: lt, base, sh, outline
  const PLASTER = [col('#fbf8ee'), col('#ece6d4'), col('#d6cdb4')];
  K.terrain('wall_temple', {
    solid: true, autotile: true, group: 'wall', variants: 2,
    paint: (m, f, v) => {
      const hasN = m & D.N, hasE = m & D.E, hasS = m & D.S, hasW = m & D.W;
      const open = { N: !hasN, E: !hasE, W: !hasW };
      const notch = (hasN && hasE && !(m & D.NE)) || (hasN && hasW && !(m & D.NW));
      const b = K.B(T, T);
      const backTop = hasS && open.N && hasE && hasW;   // the top row of the back wall: the upper plaster panel, so the wall stands 2 tiles
      if (backTop) {
        b.fillRect(0, 0, T, T, PLASTER[0]);
        b.fillRect(0, 0, T, 2, LAC[1]); b.hline(0, 2, T, LAC[3]);   // the ceiling beam
        for (let i = 0; i < 3; i++) b.set(K.h32(i, v, 7) % 15, 4 + K.h32(i, v, 8) % 10, PLASTER[1]);
        if (v === 0) { b.fillRect(0, 0, 3, T, LAC[1]); b.vline(0, 0, T, LAC[0]); b.vline(3, 0, T, LAC[3]); b.vline(2, 0, T, LAC[2]); }
        return b;
      }
      if (hasS && (open.N || open.E || open.W || notch)) {
        // flat top: a smooth dark lacquered cap with a lit inner edge; a beam joint marks every other tile
        b.fillRect(0, 0, T, T, LAC[1]);
        if (open.N) { b.hline(0, 0, T, LAC[0]); b.hline(0, 1, T, LAC[0]); }
        if (open.W) { b.vline(0, 0, T, LAC[0]); b.vline(1, 0, T, LAC[0]); }
        if (open.E) { b.vline(15, 0, T, LAC[3]); b.vline(14, 0, T, LAC[0]); }
        if (v === 0) { b.hline(0, 0, T, LAC[3]); b.hline(0, 1, T, LAC[2]); }
        b.hline(0, 15, T, LAC[3]);
        return b;
      }
      // face: plaster with a soft lit-from-top gradient, a post at the left edge of every other tile, a tie beam across
      b.fillRect(0, 0, T, T, PLASTER[1]);
      b.fillRect(0, 0, T, 6, PLASTER[0]);
      for (let i = 0; i < 4; i++) b.set(K.h32(i, v, 5) % 15, 6 + K.h32(i, v, 6) % 8, PLASTER[2]);
      b.fillRect(0, 3, T, 3, LAC[1]); b.hline(0, 3, T, LAC[0]); b.hline(0, 6, T, LAC[3]);   // nageshi tie beam
      if (v === 0) { b.fillRect(0, 0, 3, T, LAC[1]); b.vline(0, 0, T, LAC[0]); b.vline(3, 0, T, LAC[3]); b.vline(2, 0, T, LAC[2]); }
      if (!hasS) {   // skirting where the wall meets the floor
        b.fillRect(0, 10, T, 6, LAC[1]); b.hline(0, 10, T, LAC[0]); b.hline(0, 15, T, LAC[3]); b.hline(0, 9, T, PLASTER[2]);   // dark wainscot, lit top edge
      }
      return b;
    },
  });
  // `floor_temple`: long, calm horizontal floorboards (4 px boards in two tones, soft seams, an end joint only rarely)
  K.terrain('floor_temple', {
    variants: 3, step: 'wood',
    paint: (m, f, v) => {
      const b = K.B(T, T);
      const W = [col('#d8ac80'), col('#ca9c70'), col('#b88a60')];   // two board tones and a seam only one shade darker
      for (let r = 0; r < 4; r++) {
        const y0 = r * 4, tone = (r & 1) ? W[1] : W[0];
        b.fillRect(0, y0, T, 3, tone);
        b.hline(0, y0 + 3, T, W[2]);
        if (K.h32(r, v, 9) % 7 === 0) b.vline(2 + K.h32(r, v, 10) % 12, y0, 3, W[2]);   // a rare end joint: boards run several tiles long
      }
      return b;
    },
  });
  K.terrain('shrine_runner', {
    autotile: true, step: 'step',
    paint: (m) => {
      const b = K.B(T, T);
      const RED = [col('#e8604c'), col('#c83c34'), col('#a02c2c'), col('#5c1820')], GOLD = [col('#fff0a0'), col('#f0c040'), col('#b07c20')];
      const open = { N: !(m & D.N), E: !(m & D.E), S: !(m & D.S), W: !(m & D.W) };
      for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
        let d = 99;
        if (open.N) d = Math.min(d, y); if (open.S) d = Math.min(d, 15 - y);
        if (open.W) d = Math.min(d, x); if (open.E) d = Math.min(d, 15 - x);
        let c = RED[1];
        if (d === 0) c = RED[3]; else if (d === 1) c = GOLD[1]; else if (d === 2) c = GOLD[2];
        else if (open.W && d === 3 && x < 8) c = RED[0];      // lit left fold
        else if (open.E && d === 3 && x > 8) c = RED[2];
        else if (d === 5) c = col('#d8603c');                // a faint inner line for depth
        b.set(x, y, c);
      }
      if (open.W && open.E) { b.set(3, 4, GOLD[0]); b.set(3, 12, GOLD[0]); }
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
