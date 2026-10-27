/* src/maps/ch4_lib.js — Chapter 4 mechanics shared by Route 4, Canvas Rest, the Dust Bowl and Bobbin Quarry.
 *  L.switchLever(a, b, label)   an interact script: a track switch. Gate `a` starts shut and gate `b` starts open (define `b` the
 *                               other way round: its `closed` look is the open rail). Each pull flips both, so the track points
 *                               one way or the other. Flag-persisted through L.setGate.
 *  L.leverStamp(M, x, y, a)     the lever stamp, leaning left or right with gate `a`.
 *  L.hideStamps(c)              re-apply `goneIf` / `showIf` stamps after a script sets their flag (the slab cart moving).
 *  Flags: east_gate_open, r4_*, dust_scarf (bag), mimi_camp_done, cart_pushed, oasis_*, quarry_reached, rival4_done,
 *         herd_done (Bouldame settled), gusset_back (tea in the hut), badge4. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;

  L.switchLever = (a, b, label) => function* (c, n) {
    const id = c.map.id + '.' + (n && n.id || a);
    yield* c.sayT(id + '.ask', [label || 'A track switch with a red knob. It points the rails one way or the other.']);
    if (!(yield* c.ask('Pull the lever?'))) return;
    const toA = !L.gateOpen(c, a);
    NP.snd.sfx('door');
    L.setGate(c, a, toA);
    L.setGate(c, b, toA);
    L.syncStamps(c);
    yield* c.sayT(id + '.done', ['Ka-CHUNK! The points slid across, and the rails swung over.']);
  };

  L.leverStamp = (M, x, y, a) => {
    const flag = M.gates[a] ? M.gates[a].flag : 'gate_' + M.def.id + '_' + a;
    M.def.stamps.push(L.variantByFlag({ id: 'lever', x, y }, flag, 'left', 'right'));
    return M;
  };

  L.hideStamps = (c) => c.map.syncSnips(NP.state.flags);
})(typeof globalThis !== 'undefined' ? globalThis : window);
