/* src/maps/ch4_lib.js — Chapter 4 mechanics shared by Route 4, Canvas Rest, the Dust Bowl and Bobbin Quarry.
 *  L.switchLever(a, b, label)   an interact script: a track switch. Gate `a` starts shut and gate `b` starts open (define `b` the
 *                               other way round: its `closed` look is the open rail). Each pull flips both, so the track points
 *                               one way or the other. Flag-persisted through L.setGate.
 *  L.leverStamp(M, x, y, a)     the lever stamp, leaning left or right with gate `a`.
 *  L.fenceRoad(M, o)            fence both sides of a straight road so walking it passes every trainer standing in the fence line
 *                               (owner's rule: route trainers can't be skipped). See the function for the options.
 *  L.hideStamps(c)              re-apply `goneIf` / `showIf` stamps after a script sets their flag (the slab cart moving).
 *  Flags: east_gate_open, r4_*, dust_scarf (bag), mimi_camp_done, cart_pushed, oasis_*, quarry_reached, rival4_done,
 *         herd_done (Boulderina settled), gusset_back (tea in the hut), badge4. */
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

  /** o: { h: true (road runs east-west; lines are rows) or false (north-south; lines are columns), lines: [row or col, ...],
   *  from, to: the span along the road, open: [[x, y], ...] cells left open (gates into the side areas; one per side, so a side
   *  can't be used to walk round a trainer) }. Only open ground is fenced (cliffs, water and buildings already block); each
   *  trainer standing in a fence line keeps their cell. */
  L.fenceRoad = (M, o) => {
    M.legend('F', 'fence').legend('G', 'fence_sand');                         // grass fence, and the same fence on sand
    const keep = new Set((o.open || []).map(([x, y]) => x + ',' + y));
    for (const n of M.def.npcs) keep.add(n.x + ',' + n.y);                    // people keep their spots (trainers in the line are the point)
    for (const st of M.def.stamps || []) {                                    // so do props: their own footprint already blocks
      const sd = NP.stamps && NP.stamps[st.id];
      if (!sd || !sd.solid) continue;
      sd.solid.forEach((row, yy) => { for (let xx = 0; xx < row.length; xx++) if (row[xx] !== '.') keep.add((st.x + xx) + ',' + (st.y + yy)); });
    }
    const open = (ch) => !!ch && '.,;sufdvpg'.includes(ch);
    for (const line of o.lines) for (let a = o.from; a <= o.to; a++) {
      const x = o.h ? a : line, y = o.h ? line : a;
      const ch = M.at(x, y);
      if (!keep.has(x + ',' + y) && open(ch)) M.set(x, y, 'su;'.includes(ch) ? 'G' : 'F');
    }
    return M;
  };

  L.hideStamps = (c) => c.map.syncSnips(NP.state.flags);
})(typeof globalThis !== 'undefined' ? globalThis : window);
