/* src/art/human/hd.js — imported high-detail overworld sprites (NP.art.human.hd), produced by tools/import-sprites.mjs.
 * An imported look replaces the generated 16x24 overworld sprite: same API shape { w, h, frames:{down,up,left,right:[b,b,b]} }, but the canvas can
 * be taller (e.g. 20x32) and carry up to 32 colours. The feet stay on the bottom 16x16 tile row (the overworld draws a sprite at y - (h - 16)).
 * Portraits (front/back) still come from the generator until sheets are imported for them. Loaded after api.js. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Bitmap, Color } = NP;
  const HUM = NP.art.human;
  const store = (HUM.hd = HUM.hd || {});
  const built = {};
  const ALPHA = '0123456789abcdefghijklmnopqrstuv';

  /** HUM.hd.add(id, { w, h, palette:['#rrggbb', ...<=32], frames:{ down:[rows,rows,rows], up:..., left:..., right:... } })  rows = array of strings, '.' = clear */
  store.add = function (id, def) { store[id] = def; delete built[id]; };
  store.build = function (id) {
    if (built[id]) return built[id];
    const d = store[id], pal = d.palette.map((c) => Color.parse(c));
    const frames = {};
    for (const dir of Object.keys(d.frames)) {
      frames[dir] = d.frames[dir].map((rows) => {
        const b = new Bitmap(d.w, d.h);
        rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const i = ALPHA.indexOf(r[x]); if (i >= 0) b.set(x, y, pal[i]); } });
        return b;
      });
    }
    return (built[id] = { w: d.w, h: d.h, frames });
  };

  const baseOverworld = HUM.overworld;
  store.enabled = false; // opt-in (browser: add ?hd to the URL) until the whole cast is imported in the same format
  HUM.overworld = (id) => (store.enabled && Object.prototype.hasOwnProperty.call(store, id) && id !== 'add' && id !== 'build' && id !== 'enabled' ? store.build(id) : baseOverworld(id));
})(typeof globalThis !== 'undefined' ? globalThis : window);
