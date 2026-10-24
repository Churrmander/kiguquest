/* NP.art.autosprite — the approved AutoSprite Kigu art (art/autosprite/, imported into data.js by tools/import-autosprite.mjs) as
 * battle sprites with the same cells and anchors as NP.art.kigu, so NP.assets can prefer it and fall back per view.
 *
 *   has(id, view)                     view: 'front' | 'pose' | 'back'
 *   front(id, { alt, frame })  -> Bitmap 96x96,   anchor bottom-centre (48, 94)
 *   pose(id, { alt })          -> Bitmap 96x96,   the dynamic battle pose (foe side, used while she strikes)
 *   back(id, { alt, frame })   -> Bitmap 128x128, anchor (64, 126)
 *   IDLE                       -> 6 idle frames: the upper body bobs 1px (the seam row is doubled, feet stay planted)
 *
 * The sprites are static, so motion is made here and in the battle scene. alt = the rare colourway: costume colours hue-rotated
 * by 150 degrees (skin, hair-dark and near-grey colours are kept). Results are cached; callers clone() before mutating. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  NP.art = NP.art || {};
  const { Bitmap, Color } = NP;
  const DATA = () => NP.art.autospriteData || {};
  const CELL = { front: { w: 96, h: 96 }, pose: { w: 96, h: 96 }, back: { w: 128, h: 128 } };
  const IDLE = 6, BOB = [0, 0, 1, 1, 1, 0];
  const cache = new Map();

  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  function unb64(s) {
    const out = [];
    let acc = 0, bits = 0;
    for (let i = 0; i < s.length; i++) {
      const v = B64.indexOf(s[i]);
      if (v < 0) continue; // '=' padding
      acc = (acc << 6) | v; bits += 6;
      if (bits >= 8) { bits -= 8; out.push((acc >> bits) & 255); }
    }
    return out;
  }

  /** Costume colours hue-rotated; skin tones, greys and very dark/light colours stay, so the girl and the outline read the same. */
  function altColour(hex) {
    const [h, s, l] = Color.toHSL(hex);
    if (s * Math.min(l, 1 - l) * 2 < 0.12 || l < 0.16 || l > 0.93) return hex; // greys, outline darks, highlights
    if (h >= 12 && h <= 42 && l > 0.6 && s < 0.85) return hex; // skin
    return Color.adjust(hex, { h: 150 });
  }

  /** The decoded sprite at battle size (cropped), as a Bitmap plus its body-axis x. */
  function raw(id, view, alt) {
    const key = 'r|' + id + '|' + view + '|' + !!alt;
    if (cache.has(key)) return cache.get(key);
    const s = DATA()[id] && DATA()[id][view];
    let v = null;
    if (s) {
      const pal = [];
      for (let i = 0; i < s.pal.length; i += 6) { const hex = s.pal.slice(i, i + 6); pal.push(alt ? altColour('#' + hex) : '#' + hex); }
      const b = new Bitmap(s.w, s.h), runs = unb64(s.rle);
      let p = 0;
      for (let i = 0; i < runs.length; i += 2) {
        const c = runs[i], n = runs[i + 1];
        if (c) for (let k = 0; k < n; k++) b.set((p + k) % s.w, ((p + k) / s.w) | 0, pal[c - 1]);
        p += n;
      }
      v = { bmp: b, cx: s.cx };
    }
    cache.set(key, v);
    return v;
  }

  /** Place the crop in its cell: body axis on the centre column, feet on row h-2. Upper body lifted by `bob` px, seam doubled. */
  function cell(id, view, alt, frame) {
    const bob = view === 'pose' ? 0 : BOB[((frame | 0) % IDLE + IDLE) % IDLE];
    const key = 'c|' + id + '|' + view + '|' + !!alt + '|' + bob;
    if (cache.has(key)) return cache.get(key);
    const r = raw(id, view, alt);
    let out = null;
    if (r) {
      const C = CELL[view], s = r.bmp;
      out = new Bitmap(C.w, C.h);
      const dx = Math.max(0, Math.min(C.w - s.w, Math.round(C.w / 2 - r.cx))), dy = C.h - 2 - s.h;
      if (!bob) out.blit(s, dx, dy);
      else {
        const seam = Math.round(s.h * 0.55); // rows above the seam (head and chest) rise; legs stay
        out.blit(s, dx, dy + seam, { sy: seam, sh: s.h - seam });
        out.blit(s, dx, dy - bob, { sh: seam });
        for (let k = 0; k < bob; k++) out.blit(s, dx, dy + seam - bob + k, { sy: seam, sh: 1 });
      }
    }
    cache.set(key, out);
    return out;
  }

  NP.art.autosprite = {
    IDLE,
    ids: () => Object.keys(DATA()),
    has: (id, view) => !!(DATA()[id] && DATA()[id][view || 'front']),
    front: (id, o) => cell(id, 'front', o && o.alt, o && o.frame),
    pose: (id, o) => cell(id, DATA()[id] && DATA()[id].pose ? 'pose' : 'front', o && o.alt, 0),
    back: (id, o) => cell(id, 'back', o && o.alt, o && o.frame),
    clearCache: () => cache.clear(),
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
