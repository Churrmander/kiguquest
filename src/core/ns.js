/* Shared namespaces. Loaded right after the core libs so every other file can assume these exist. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  NP.W = 240; // GBA screen
  NP.H = 160;
  NP.TILE = 16;

  NP.data = NP.data || {}; // content registries: NP.data.species[id], NP.data.moves[id], NP.data.items[id], ...
  NP.art = NP.art || {};   // art generators: NP.art.kigu, NP.art.human, NP.art.tiles, NP.art.icons
  NP.terrain = NP.terrain || {}; // terrain registry (metadata + drawers), owned by the tile artist
  NP.stamps = NP.stamps || {};   // stamp (multi-tile object) registry, owned by the tile artist

  /** Register helper: NP.reg(NP.data.moves, 'tackle', {...}) — throws on duplicate ids so typos surface early. */
  NP.reg = function (table, id, def) {
    if (Object.prototype.hasOwnProperty.call(table, id)) throw new Error('NP.reg: duplicate id "' + id + '"');
    def.id = id;
    table[id] = def;
    return def;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
