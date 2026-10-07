/* NP.mapkit — helpers for building map definitions in code (grids, rects, rooms). Maps are plain data + generator scripts. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  NP.maps = NP.maps || {};

  const kit = {
    grid(w, h, ch) { return Array.from({ length: h }, () => new Array(w).fill(ch)); },
    rect(g, x, y, w, h, ch) {
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (g[yy] && xx >= 0 && xx < g[0].length) g[yy][xx] = ch;
    },
    /** polyline of axis-aligned segments with thickness t: pts [[x,y],...] */
    path(g, pts, t, ch) {
      for (let i = 0; i + 1 < pts.length; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
        kit.rect(g, Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0) + t, Math.abs(y1 - y0) + t, ch);
      }
    },
    rows(g) { return g.map((r) => r.join('')); },
    reg(def) {
      if (NP.maps[def.id]) throw new Error('duplicate map ' + def.id);
      NP.maps[def.id] = def;
      return def;
    },

    /**
     * A simple indoor room with a 2-wide door mat in the bottom wall.
     * o: { id, name, w, h, floor:'floor_wood', wall:'wall_wood', doorX, exit:{to,door}, music, stamps, npcs, props, extra }
     */
    room(o) {
      const w = o.w || 10, h = o.h || 9;
      const dx = o.doorX === undefined ? (w >> 1) - 1 : o.doorX;
      const g = kit.grid(w, h, 'f');
      kit.rect(g, 0, 0, w, 2, 'W');
      kit.rect(g, 0, h - 1, w, 1, 'W');
      kit.rect(g, 0, 2, 1, h - 2, 'W');
      kit.rect(g, w - 1, 2, 1, h - 2, 'W');
      kit.rect(g, dx, h - 1, 2, 1, 'm');
      if (o.carpet) kit.rect(g, o.carpet[0], o.carpet[1], o.carpet[2], o.carpet[3], 'c');
      const def = Object.assign({
        border: 'void', music: null, battleBg: 'indoor', indoor: true,
        legend: { f: o.floor || 'floor_wood', W: o.wall || 'wall_wood', m: 'mat', c: o.carpetTerrain || 'carpet_red' },
        rows: kit.rows(g), stamps: [], npcs: [], props: [], triggers: [], interact: [],
        spawns: { door: { x: dx, y: h - 2, dir: 'up' } },
        warps: [{ xs: [dx, dx + 1], y: h - 1, to: o.exit.to, door: o.exit.door, sound: 'door' }],
      }, o);
      delete def.exit; delete def.doorX; delete def.floor; delete def.wall; delete def.carpet; delete def.carpetTerrain;
      return kit.reg(def);
    },
  };
  NP.mapkit = kit;
})(typeof globalThis !== 'undefined' ? globalThis : window);
