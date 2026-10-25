/* src/art/tiles/terrain_desert.js — Chapter 4 ground: dry_grass (the desert's encounter grass: sun-bleached tufts on sand).
 * Re-uses the tallgrass painter and recolours it, so the blades sway and hide legs exactly like the meadow grass. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const { P } = K;
  K.addPal({ dg0: '#f8e8a8', dg1: '#e0c47c', dg2: '#c4a25c', dg3: '#a4824a', dg4: '#806240', dg5: '#5c4634' });
  // tallgrass colour -> dry grass colour (ground showing between the tufts becomes sand)
  const MAP = new Map([[P.t0, P.dg0], [P.t1, P.dg1], [P.t2, P.dg2], [P.t3, P.dg3], [P.t4, P.dg4], [P.t5, P.dg5],
    [P.g2, P.s2], [P.g3, P.s3], [P.g1, P.s1]]);
  const recolour = (b) => { if (!b) return b; for (let i = 0; i < b.u32.length; i++) { const c = MAP.get(b.u32[i]); if (c !== undefined) b.u32[i] = c; } return b; };
  const tall = () => NP.terrain.tallgrass;
  K.terrain('dry_grass', {
    encounter: 'grass', step: 'grass', autotile: true, frames: 4, animSpeed: 30,
    paint: (m, f) => recolour(tall().draw(m === 0 ? 0 : 255 & ~K.DIR.N, f, 0).clone()),
    paintOverlay: (f) => recolour(tall().drawOverlay(f).clone()),
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
