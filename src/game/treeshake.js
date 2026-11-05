/* src/game/treeshake.js — NP.TreeShake: shake a tree in the wild (owner's call, approved 2026-10-28).
 *
 * Press A facing a tree (a `tree`, `pine` or `tree_big` trunk, or the edge of a `treeline` wall) on a wild map and you shake it.
 * One time in eight a bird Kigu tumbles out and a wild battle starts. Each tree shakes once per day (NP.Clock.day()); a second
 * shake the same day gets nothing. Towns never shake: a map with `town: true`, any indoor map and remembered scenes (`memory`).
 *
 * The birds come from the map's table, `def.treeShake` (or `def.shake`): [{ sp, min, max, w, time? }], the same shape as an encounter
 * table (`time: 'night'` entries only appear then). Chapter 1's wild maps use Chirpadee (common) and Lyripip (rare). A map with no
 * table shakes but nothing ever falls out.
 *
 * Flags: 'shake:<map>:<x>,<y>' = the day number it was last shaken (x, y = the tile you pressed A on: the trunk, or the treeline tile).
 * Text keys: field.shake.shook / .nothing / .bird / .again.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const TS = (NP.TreeShake = {});
  TS.RATE = 1 / 8;
  /** stamp id -> the trunk cells relative to the stamp's top-left */
  TS.TRUNKS = { tree: [[0, 1]], pine: [[0, 1]], tree_big: [[0, 2], [1, 2]] };

  /** can trees be shaken on this map at all? */
  TS.wild = (def) => !!def && !def.town && !def.indoor && !def.memory && !def.dark;
  /** the map's bird table (or null) */
  TS.table = (def) => (def && (def.treeShake || def.shake)) || null;

  /** the shakeable tree at (x, y) on TileMap m: { x, y, stamp|null } (x, y = the tile itself), or null */
  TS.treeAt = function (m, x, y) {
    if (!m || !TS.wild(m.def) || !m.inBounds(x, y)) return null;
    for (const p of m.placements) {
      const cells = TS.TRUNKS[p.id];
      if (!cells) continue;
      for (const [dx, dy] of cells) if (p.x + dx === x && p.y + dy === y) return { x, y, stamp: p };
    }
    const id = m.idAt(x, y);
    if (id === 'treeline') return { x, y, stamp: null };
    return null;
  };

  TS.key = (mapId, t) => 'shake:' + mapId + ':' + t.x + ',' + t.y;
  TS.shakenToday = (mapId, t) => NP.state.flags[TS.key(mapId, t)] === NP.Clock.day();

  /** the roll: null (nothing falls) or { sp, lv }. rng = NP.rng (seeded in tests). */
  TS.roll = function (def, rng) {
    let list = TS.table(def);
    if (list && NP.Clock) list = NP.Clock.filter(list);
    list = (list || []).filter((e) => NP.data.species[e.sp]);
    if (!list.length || !rng.chance(TS.RATE)) return null;
    const e = rng.weighted(list);
    return { sp: e.sp, lv: rng.range(e.min, e.max) };
  };

  /** the scene: the leaves rustle; maybe a Kigu drops out and you battle her */
  TS.shake = function* (c, t) {
    const m = c.map;
    if (TS.shakenToday(m.id, t)) {
      yield* c.sayT('field.shake.again', 'You\'ve already given this tree a shake today.\\pMaybe something will be up there again tomorrow.');
      return;
    }
    NP.snd.sfx('leaf');
    c.ow.shakeT = { x: t.x, y: t.y, n: 16 };
    yield* c.wait(16);
    c.set(TS.key(m.id, t), NP.Clock.day());
    yield* c.sayT('field.shake.shook', 'You gave the tree a good shake.');
    const hit = NP.State.hasUsable() ? TS.roll(m.def, NP.rng) : null;
    if (!hit) {
      yield* c.sayT('field.shake.nothing', 'A few leaves drifted down, but that was all.');
      return;
    }
    yield* c.emote('player', 'exclaim');
    yield* c.sayT('field.shake.bird', 'A Kigu tumbled out of the branches!');
    yield* c.wildBattle(hit.sp, hit.lv);
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
