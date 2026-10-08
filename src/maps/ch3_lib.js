/* src/maps/ch3_lib.js — Chapter 3 mechanics shared by Route 3, Seamstead City, Crisp & Co. and the Volt Salon.
 *  L.panel(keys, label)       an interact script: a switch panel that opens the named gates of the current map (flag-persisted).
 *  L.keyDoor(key, item, o)    an interact script: a locked door/gate that opens while you hold a key item (consumed: false).
 *  L.stairs(M, x, y, dir, to, spawn)  one stairs cell + its warp.
 *  L.evoStarter(id)           the first evolution of a starter (the rival's team a chapter on).
 *  Flags: rival3_done, crisp_open, crisp_serge_done, crisp_done (raid over), damask_tea (met Damask), badge3. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;

  const EVO = { konko: 'kitsuri', ottopi: 'ottelia', sprubun: 'lapinlily' };
  L.evoStarter = (id) => EVO[id] || id || 'ottelia';

  L.panel = (keys, label) => function* (c, n) {
    const id = c.map.id + '.' + (n && n.id || keys.join('_'));
    const open = keys.every((k) => L.gateOpen(c, k));
    if (open) { yield* c.sayT(id + '.on', ['The panel hums. Everything here is already switched on.']); return; }
    yield* c.sayT(id + '.ask', [label || 'A switch panel with a big yellow lever.']);
    if (!(yield* c.ask('Pull the lever?'))) return;
    NP.snd.sfx('door');
    for (const k of keys) L.setGate(c, k, true);
    yield* c.sayT(id + '.done', ['Click-CLACK! The barrier fizzled away.']);
  };

  L.keyDoor = (key, item, o) => function* (c, n) {
    o = o || {};
    const id = c.map.id + '.' + (n && n.id || key);
    if (L.gateOpen(c, key)) return;
    if (!NP.state.bag[item]) { yield* c.sayT(id + '.no', o.no || ['The door is locked. A sign reads STAFF ONLY.']); return; }
    yield* c.sayT(id + '.yes', o.yes || ['{player} swiped the Staff Pass. The door slid open!']);
    NP.snd.sfx('door');
    L.setGate(c, key, true);
  };

  /** stairs: one terrain cell ('stairs_up'|'stairs_down' via legend chars u/d) plus the warp. */
  L.stairs = (M, x, y, dir, to, spawn) => {
    M.legend('u', 'stairs_up').legend('d', 'stairs_down');
    M.set(x, y, dir === 'up' ? 'u' : 'd');
    M.warp({ x, y, to, spawn, sound: 'door' });
    return M;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
