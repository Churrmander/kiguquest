/* src/art/tiles/draw.js — painter helpers shared by terrains, stamps and battle backgrounds (internal; NP.art.tiles.kit).
 *
 *  - extra palette families (snow, ice, desert, brick, straw, asphalt, steel, gold, glass, marble, night rock, sky)
 *  - cel-shaded primitives: blob (sphere-ish), cyl (vertical cylinder), box (3/4-view block), hip roof with patchwork shingles
 *  - tiny ASCII "stickers" (paste a small sprite into a larger bitmap), shadows, dashes, stitch lines
 * Light always comes from the TOP-LEFT; every primitive uses a 5-tone ramp [hi, lt, base, mid, dk].
 */
(function (root) {
  'use strict';
  const NP = root.NP;
  const { Bitmap, Color } = NP;
  const K = NP.art.tiles.kit;
  const { P, col } = K;

  // ------------------------------------------------------------------------------------------------ extra palette
  K.addPal = function (obj) {
    for (const k in obj) {
      K.HEX[k] = obj[k];
      K.P[k] = Color.q15(Color.parse(obj[k]));
    }
  };
  K.addPal({
    // snow / ice
    sn0: '#ffffff', sn1: '#eef8ff', sn2: '#d2e8fc', sn3: '#acc8f0', sn4: '#8aa4dc', sn5: '#6a80bc',
    ic0: '#f4ffff', ic1: '#c8f6fc', ic2: '#94e4f4', ic3: '#64c4ea', ic4: '#4298d0', ic5: '#3070b0',
    // desert dune sand (deeper / oranger than beach sand)
    dn0: '#fff0c0', dn1: '#fcd890', dn2: '#f0b868', dn3: '#d89450', dn4: '#b47048', dn5: '#8c5040',
    // terracotta brick
    br0: '#f8c8a0', br1: '#e89870', br2: '#d06c54', br3: '#a8484c', br4: '#7c3048', br5: '#542240',
    // straw / thatch
    hy0: '#fff4b0', hy1: '#fce070', hy2: '#e8b848', hy3: '#c08c38', hy4: '#8c6030',
    // city asphalt / slate (blue-grey)
    as0: '#b4bcd0', as1: '#8c94ac', as2: '#6c7490', as3: '#545c78', as4: '#3e4460', as5: '#2a2e48',
    // Starch Society steel-blue and white
    st0: '#ffffff', st1: '#e4effa', st2: '#bcd2ee', st3: '#8cacdc', st4: '#6080c4', st5: '#405ca4', st6: '#2a3a78',
    // gold
    gd0: '#fffbd0', gd1: '#fce890', gd2: '#f4c840', gd3: '#d09820', gd4: '#9c6418', gd5: '#644020',
    // window glass
    gl0: '#ffffff', gl1: '#d8f8ff', gl2: '#a0e0f8', gl3: '#68bce8', gl4: '#4890d0', gl5: '#2c5ca0',
    // marble
    mb0: '#ffffff', mb1: '#f6f2fa', mb2: '#dedaec', mb3: '#bab6d0', mb4: '#9490b0', mb5: '#6c688c',
    // night rock (Victory Road) and moonlit cave
    vr0: '#9a86cc', vr1: '#7866aa', vr2: '#5e4e8e', vr3: '#463a70', vr4: '#322a54', vr5: '#221c3c',
    // sky + cloud + distant hills (battle backgrounds)
    sk0: '#f0fbff', sk1: '#c8ecff', sk2: '#9ad8fa', sk3: '#70bcf0', sk4: '#54a0e0', sk5: '#3c7ccc',
    cl0: '#ffffff', cl1: '#eaf4ff', cl2: '#cfe2f8', cl3: '#b0c8ee',
    hl0: '#a8e8a8', hl1: '#80d0a0', hl2: '#60b090', hl3: '#489080',
    // purples for night
    nt0: '#8c8cf0', nt1: '#6464d0', nt2: '#4848a8', nt3: '#343484', nt4: '#242460', nt5: '#181848',
    // darks
    ink2: '#20182c', ink3: '#2c2038',
  });

  // ------------------------------------------------------------------------------------------------ tone ramps
  /** ramp of packed colours from palette names: tn('g0','g1','g2','g3','g4') or an array */
  K.tn = function () {
    const a = Array.isArray(arguments[0]) ? arguments[0] : Array.prototype.slice.call(arguments);
    return a.map(col);
  };
  // named 5-tone ramps [hi, lt, base, mid, dk]
  K.TN = {
    grass: K.tn('g1', 'g2', 'g3', 'g4', 'g5'),
    leaf: K.tn('f1', 'f2', 'f3', 'f4', 'f5'),
    leafLight: K.tn('f0', 'f1', 'f2', 'f3', 'f4'),
    pine: K.tn('f2', 'f3', 'f4', 'f5', 'f6'),
    wood: K.tn('o0', 'o1', 'o2', 'o3', 'o4'),
    woodDark: K.tn('o1', 'o2', 'o3', 'o4', 'o5'),
    bark: K.tn('b0', 'b1', 'b2', 'b3', 'b4'),
    rock: K.tn('r0', 'r1', 'r2', 'r3', 'r4'),
    stone: K.tn('n0', 'n1', 'n2', 'n3', 'n4'),
    cave: K.tn('v1', 'v2', 'v3', 'v4', 'v5'),
    plaster: K.tn('p0', 'p1', 'p2', 'p3', 'p4'),
    sand: K.tn('s0', 's1', 's2', 's3', 's4'),
    hay: K.tn('hy0', 'hy1', 'hy2', 'hy3', 'hy4'),
    snow: K.tn('sn0', 'sn1', 'sn2', 'sn3', 'sn4'),
    ice: K.tn('ic0', 'ic1', 'ic2', 'ic3', 'ic4'),
    gold: K.tn('gd0', 'gd1', 'gd2', 'gd3', 'gd4'),
    brick: K.tn('br0', 'br1', 'br2', 'br3', 'br4'),
    steel: K.tn('st1', 'st2', 'st3', 'st4', 'st5'),
    water: K.tn('w1', 'w2', 'w3', 'w4', 'w5'),
  };
  /** 5-tone ramp [hi, lt, base, mid, dk] from a roof/accent ramp name */
  K.tn5 = function (name) {
    const r = K.ramp(name);
    return [r[0], r[1], r[2], r[3], r[4]];
  };

  // ------------------------------------------------------------------------------------------------ small helpers
  /** set a pixel with a palette colour (alpha-less) */
  K.dot = (b, x, y, c) => { if (x >= 0 && y >= 0 && x < b.w && y < b.h) b.u32[y * b.w + x] = col(c); return b; };
  /** fill rect with palette colour */
  K.rect = (b, x, y, w, h, c) => b.fillRect(x, y, w, h, col(c));
  /** paste an ASCII sticker at (x,y); '.' and unmapped chars are transparent */
  K.stick = function (dst, x, y, rows, map, o) {
    const s = K.spr(rows, map);
    dst.blit(s, x, y, o);
    return dst;
  };
  /** only where dst is transparent */
  K.stickUnder = function (dst, x, y, rows, map) {
    return K.under(dst, K.spr(rows, map), x, y);
  };
  K.opaque = (b, x, y) => x >= 0 && y >= 0 && x < b.w && y < b.h && b.u32[y * b.w + x] >>> 24 > 0;

  /** repaint an opaque-pixel's colour using fn(colour,x,y) (skips transparent) */
  K.recolor = function (b, fn) {
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
      const c = b.u32[y * b.w + x];
      if (c >>> 24) { const n = fn(c, x, y); if (n !== undefined && n !== null) b.u32[y * b.w + x] = col(n); }
    }
    return b;
  };

  /** Outer 1px outline (needs a transparent margin), colour or fn(neighbourColour)->colour */
  K.outer = function (b, color, o) {
    const W = b.w, H = b.h, src = b.u32.slice();
    const diag = !!(o && o.diag);
    const fixed = typeof color === 'function' ? null : col(color);
    const at = (x, y) => (x >= 0 && y >= 0 && x < W && y < H ? src[y * W + x] : 0);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (src[y * W + x] >>> 24) continue;
      let nb = 0;
      const ds = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      if (diag) ds.push([-1, -1], [1, -1], [-1, 1], [1, 1]);
      for (const [dx, dy] of ds) { const c = at(x + dx, y + dy); if (c >>> 24 && (c >>> 24) === 255) { nb = c; break; } }
      if (nb) b.u32[y * W + x] = fixed !== null ? fixed : col(color(nb, x, y));
    }
    return b;
  };

  // ------------------------------------------------------------------------------------------------ shading primitives
  const TH = [0.62, 0.26, -0.16, -0.52];
  function band(l, th) { return l > th[0] ? 0 : l > th[1] ? 1 : l > th[2] ? 2 : l > th[3] ? 3 : 4; }
  K.band = band;

  /**
   * Cel-shaded ellipse (sphere-ish). tn = 5 tones [hi, lt, base, mid, dk] (packed). o: { th, lx, ly, lz, skip(x,y) }
   * Returns the number of pixels painted.
   */
  K.blob = function (b, cx, cy, rx, ry, tn, o) {
    o = o || {};
    const lx = o.lx === undefined ? -0.55 : o.lx, ly = o.ly === undefined ? -0.72 : o.ly, lz = o.lz === undefined ? 0.42 : o.lz;
    const th = o.th || TH;
    const arx = rx + 0.5, ary = ry + 0.5;
    let n = 0;
    for (let y = Math.floor(cy - ary); y <= Math.ceil(cy + ary); y++) for (let x = Math.floor(cx - arx); x <= Math.ceil(cx + arx); x++) {
      const dx = (x - cx) / arx, dy = (y - cy) / ary, d2 = dx * dx + dy * dy;
      if (d2 > 1) continue;
      if (o.skip && o.skip(x, y)) continue;
      const nz = Math.sqrt(1 - d2);
      const l = lx * dx + ly * dy + lz * nz;
      const c = tn[Math.min(tn.length - 1, Math.round((band(l, th) * (tn.length - 1)) / 4))];
      b.set(x, y, c);
      n++;
    }
    return n;
  };

  /**
   * Flat-toned leafy "lobe" (the tree / bush / hedge building block): four flat tones built from shifted ellipses so the
   * light cap sits top-left and a deep rim sits bottom-right. tn = [hi, lt, base, mid, dk]. o.wrap = [w,h] paints wrapped copies
   * (periodic textures). Returns nothing; paints into b.
   */
  K.lobe = function (b, cx, cy, rx, ry, tn, o) {
    o = o || {};
    const arx = rx + 0.5, ary = ry + 0.5;
    const inE = (x, y, ex, ey, erx, ery) => { const dx = (x - ex) / erx, dy = (y - ey) / ery; return dx * dx + dy * dy <= 1; };
    const hiOn = o.hi !== false;
    const wx = o.wrap ? o.wrap[0] : 0, wy = o.wrap ? o.wrap[1] : 0;
    const offs = [];
    if (wx) { for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) offs.push([ox * wx, oy * wy]); } else offs.push([0, 0]);
    for (const [ox, oy] of offs) {
      const ccx = cx + ox, ccy = cy + oy;
      if (wx && (ccx + arx < -0.5 || ccx - arx > wx || ccy + ary < -0.5 || ccy - ary > wy)) continue;
      for (let y = Math.floor(ccy - ary); y <= Math.ceil(ccy + ary); y++) for (let x = Math.floor(ccx - arx); x <= Math.ceil(ccx + arx); x++) {
        if (!inE(x, y, ccx, ccy, arx, ary)) continue;
        if (wx && (x < 0 || y < 0 || x >= wx || y >= wy)) continue;
        let k = 3;
        if (inE(x, y, ccx - 0.10 * arx, ccy - 0.16 * ary, arx * 0.93, ary * 0.93)) k = 2;
        if (inE(x, y, ccx - 0.30 * arx, ccy - 0.38 * ary, arx * 0.74, ary * 0.72)) k = 1;
        if (hiOn && inE(x, y, ccx - 0.46 * arx, ccy - 0.52 * ary, arx * 0.40, ary * 0.36)) k = 0;
        if (k === 3 && !inE(x, y, ccx - 0.03 * arx, ccy - 0.06 * ary, arx * 0.97, ary * 0.97)) k = 4;
        b.set(x, y, tn[k]);
      }
    }
  };

  /** periodic scallop profile (16 long, values 0..amp): n bumps per tile */
  K.scallop = function (n, amp, phase) {
    const out = new Float32Array(16);
    const per = 16 / n;
    for (let i = 0; i < 16; i++) {
      const t = (((i + 0.5 + (phase || 0)) % per) + per) % per;
      const u = t / per * 2 - 1;                    // -1..1 across a bump
      out[i] = Math.sqrt(Math.max(0, 1 - u * u)) * amp;
    }
    return out;
  };

  /** Vertical cylinder (trunks, barrels, pillars, posts): lit on the left. */
  K.cyl = function (b, x, y, w, h, tn) {
    for (let i = 0; i < w; i++) {
      const t = w <= 1 ? 0.3 : i / (w - 1);
      const k = t < 0.2 ? 1 : t < 0.5 ? 2 : t < 0.8 ? 3 : 4;
      const c = tn[Math.min(tn.length - 1, Math.round((k * (tn.length - 1)) / 4))];
      b.fillRect(x + i, y, 1, h, c);
    }
    return b;
  };

  /**
   * 3/4-view block: top face th px tall, front face below; lit from the top-left.
   * o: { th, top, topHi, front, frontHi, frontDk, side (px of darker right edge), out (outline colour or null) }
   */
  K.box = function (b, x, y, w, h, o) {
    const th = o.th === undefined ? 4 : o.th;
    const top = col(o.top), front = col(o.front);
    b.fillRect(x, y, w, th, top);
    if (o.topHi) { b.fillRect(x, y, w, 1, col(o.topHi)); b.fillRect(x, y, 1, th, col(o.topHi)); }
    b.fillRect(x, y + th, w, h - th, front);
    if (o.frontHi) b.fillRect(x, y + th, w, 1, col(o.frontHi));
    if (o.frontDk) b.fillRect(x, y + h - 1, w, 1, col(o.frontDk));
    if (o.side) b.fillRect(x + w - o.side, y + th, o.side, h - th, col(o.frontDk || o.front));
    if (o.out) {
      const c = col(o.out);
      b.strokeRect(x - 1, y - 1, w + 2, h + 2, c);
    }
    return b;
  };

  /** soft contact shadow under an object: ellipse centred (cx,cy) */
  K.contact = function (b, cx, cy, rx, ry, a) {
    return K.shadow(b, cx, cy, rx, ry, a);
  };

  /** Dashed stitch line (horizontal): dash/gap lengths, two colours alternate */
  K.stitchH = function (b, x, y, len, c, dash, gap) {
    dash = dash || 2; gap = gap || 2;
    for (let i = 0; i < len; i++) if (i % (dash + gap) < dash) K.dot(b, x + i, y, c);
    return b;
  };
  K.stitchV = function (b, x, y, len, c, dash, gap) {
    dash = dash || 2; gap = gap || 2;
    for (let i = 0; i < len; i++) if (i % (dash + gap) < dash) K.dot(b, x, y + i, c);
    return b;
  };

  // ------------------------------------------------------------------------------------------------ hip roof with patchwork shingles
  /**
   * Paints a hip roof: rows y0..y1 (inclusive) between x0..x1 (inclusive). The ridge (top) is narrower by `inset` px each side.
   * r = roof ramp [hi, lt, base, mid, dk, out]. o: { inset, row (course height, default 5), alt (alternate patch tone), stitch (colour) }
   * The roof is fully opaque inside its trapezoid; nothing is drawn outside it.
   */
  K.roof = function (b, x0, y0, x1, y1, r, o) {
    o = o || {};
    const inset = o.inset === undefined ? 8 : o.inset;
    const rowH = o.row || 5;
    const Hh = y1 - y0;
    const [hi, lt, base, mid, dk] = r;
    const alt = o.alt || lt;
    const stitchC = o.stitch || hi;
    for (let y = y0; y <= y1; y++) {
      const t = Hh <= 0 ? 1 : (y - y0) / Hh;
      const k = Math.round(inset * (1 - t));
      const xl = x0 + k, xr = x1 - k;
      const ly = y - y0;
      for (let x = xl; x <= xr; x++) {
        let c;
        if (ly === 0) c = lt;                                   // ridge top
        else if (ly === 1) c = hi;                              // ridge highlight
        else if (ly === 2) c = mid;                             // ridge shadow line
        else if (y >= y1 - 1) c = y === y1 ? dk : lt;           // eave trim
        else {
          const cy = ly - 3;
          const course = Math.floor(cy / rowH), lr = cy % rowH;
          const off = (course & 1) * 4;
          const lx = (x - x0 + off + 64) % 8;
          const patch = (Math.floor((x - x0 + off + 64) / 8) + course) & 1;
          if (lr === rowH - 1) c = (lx & 3) < 2 ? dk : mid;     // course shadow = stitched seam
          else if (lr === rowH - 2) c = patch ? mid : base;     // lower band of the shingle
          else if (lx === 0) c = mid;                           // vertical joint
          else c = patch ? alt : base;
          if (lr === 0 && lx !== 0 && course > 0) c = patch ? hi : lt; // catch-light at the top of each shingle
        }
        b.u32[y * b.w + x] = c;
      }
      // hip edges: lit left, shaded right
      const e1 = ly < 2 ? null : hi, e2 = ly < 2 ? null : dk;
      if (e1 !== null && xl < xr) { b.u32[y * b.w + xl] = hi; if (xl + 1 < xr && ly > 2 && y < y1 - 1) b.u32[y * b.w + xl + 1] = lt; }
      if (e2 !== null && xl < xr) { b.u32[y * b.w + xr] = dk; if (xr - 1 > xl && ly > 2 && y < y1 - 1) b.u32[y * b.w + xr - 1] = mid; }
    }
    return b;
  };

  /** Stable tiny pseudo-random in [0,1) for texture scatter */
  K.rnd = (x, y, s) => K.hf(x | 0, y | 0, s | 0);
})(typeof globalThis !== 'undefined' ? globalThis : window);
