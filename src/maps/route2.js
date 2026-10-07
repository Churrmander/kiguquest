/* Route 2 — Plankwater: Thimble Village -> the long bridge -> Gingham Woods. Society inspectors on the planks (`route2_inspectors`). */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const GATE_FLAG = 'shrine1_done'; // the Society's checkpoint at the south end looks "pressed" until the shrine incident is over

  // ---- the bridge inspectors: two Pressers measuring planks; they stop you on the first board, battle once, then stand down
  function* inspectors(c) {
    const a = c.npc('insp_a'), b = c.npc('insp_b');
    yield* c.face('player', 'up');
    yield* c.emote('player', 'exclaim');
    yield* c.jingleWait('j_encounter_society');
    c.music('society_theme');
    yield* c.sayT('route2.insp.1', 'Tally: Plank eleven... level. Plank twelve... level. Plank thirteen...\\pNotch! Is that a splinter?');
    yield* c.sayT('route2.insp.2', 'Notch: A splinter is a crease in the wood, Tally.\\pWe must note it in the report.');
    yield* c.walk(a, ['down', 3]);
    yield* c.walk(b, ['down', 3]);
    yield* c.sayT('route2.insp.3', 'Tally: Halt, Tailor! The Society is measuring this bridge.\\pEvery plank, every nail.\\pFlat is fair!');
    yield* c.sayT('route2.insp.4', 'Notch: And since you are here, we will measure you too. Hold still.\\pCollar, three millimetres wide of standard. Hem, two millimetres crooked.');
    yield* c.sayT('route2.insp.5', 'Tally: A hem that crooked could snag a plank!\\pFor the safety of the bridge, we must iron you out.');
    yield* c.sayT('route2.insp.6', '{player}\'s Kigu stuck her tongue out at the folding ruler.');
    const won = yield* c.trainerBattle({ cls: 'Presser', name: 'Tally', look: 'grunt_m', ai: 1, reward: 8, music: 'battle_society', team: L.team([['mittsy', 9], ['silkie', 9]]) });
    if (won) {
      yield* c.sayT('route2.insp.win.1', 'Tally: The ruler... bent. It has never bent. Notch, write that down.');
      yield* c.sayT('route2.insp.win.2', 'Notch: I would rather write that the bridge is fine. ...It is fine.\\pPlank fourteen is a little soft, but it is fine.');
      yield* c.sayT('route2.insp.win.3', 'Tally: ...Fall in, Notch. The Pleat will want our report.');
      yield* c.sayT('route2.insp.win.4', 'Notch: Tailor? The Pleat is at the Spindle Shrine today.\\pIf you are going that way, do not fuss.\\pShe does not like fuss. Flat is fair!');
    }
    c.music('route_meadow');
    c.set('route2_insp_done');
    yield* c.walk(a, ['up', 9]);
    c.hideNpc('insp_a');
    yield* c.walk(b, ['up', 9]);
    c.hideNpc('insp_b');
  }

  const M = L.map({
    id: 'route2', name: 'Route 2  Plankwater', music: 'route_meadow', battleBg: 'grass', border: 'treeline', w: 24, h: 46,
    legend: { '.': 'grass', T: 'treeline', p: 'path', ',': 'tallgrass', f: 'flowers', w: 'water', B: 'bridge_v' },
    onEnter: function* (c) { L.syncStamps(c); },
  });
  const W = 24, H = 46;

  // ---- ground
  M.rect(0, 0, 2, H, 'T').rect(W - 2, 0, 2, H, 'T');
  M.rect(2, 0, 8, 2, 'T').rect(12, 0, 10, 2, 'T').rect(2, 44, 8, 2, 'T').rect(12, 44, 10, 2, 'T');
  // tall grass (south half, then north half), flowers
  M.rect(12, 36, 7, 5, ',').rect(2, 38, 5, 5, ',').rect(13, 29, 6, 4, ',').rect(2, 31, 3, 3, ',');
  M.rect(2, 13, 4, 5, ',').rect(16, 13, 4, 3, ',').rect(3, 3, 6, 5, ',').rect(17, 2, 4, 4, ',');
  M.rect(13, 41, 3, 1, 'f').rect(8, 37, 2, 1, 'f').rect(16, 9, 3, 1, 'f').rect(5, 10, 3, 1, 'f');
  // the road: south bank, bridge, north bank
  M.path([[10, 44], [10, 34], [6, 34], [6, 29], [10, 29], [10, 27]], 2, 'p');
  M.path([[10, 17], [10, 12], [14, 12], [14, 6], [10, 6], [10, 0]], 2, 'p');
  M.rect(2, 18, 20, 9, 'w');
  M.rect(10, 18, 2, 9, 'B');

  // ---- scenery
  M.sign(9, 43, 'ROUTE 2  Plankwater\\nNorth: Gingham Woods\\nSouth: Thimble Village', 'south signpost');
  M.sign(9, 28, 'PLANKWATER BRIDGE\\nMind the third plank from the end.', 'bridge sign (south bank)');
  M.sign(12, 4, 'GINGHAM WOODS ahead.\\nQuiet, please. The trees are listening.', 'north signpost');
  M.stamp('gate_house', 9, 39, 'pressed');
  L.variantByFlag(M.def.stamps[M.def.stamps.length - 1], GATE_FLAG, 'pressed', 'default');
  // trees are 1x2 (top y, base y+1)
  M.trees([[3, 35], [8, 40], [20, 42], [19, 33], [4, 27], [20, 28], [18, 11], [8, 7], [20, 7], [12, 14], [3, 10], [16, 3]]);
  M.trees([[14, 32], [20, 36]], 'pine');
  M.stamp('bush', 4, 36).stamp('bush', 18, 41).stamp('boulder', 17, 28).stamp('rock', 5, 42).stamp('stump', 3, 17).stamp('flowerbed', 20, 11).stamp('bench', 17, 16);

  // ---- people and pickups
  M.spawn('south', 10, 43, 'up').spawn('north', 10, 2, 'down');
  M.edge('s', 10, 11, 'thimble', 'north').edge('n', 10, 11, 'gingham_woods', 'south');

  M.trainer('reed', 13, 35, 'camper', 'left', { cls: 'Camper', name: 'Reed', sight: 3, reward: 6, ai: 0, team: [['sprubun', 8], ['mittsy', 8]],
    intro: 'This trail is my campsite! Well, the bit beside it is.\\pLet us see whose Kigu sleeps better!', win: 'My Kigu really did need a nap...', after: 'The bridge is just up ahead. Walk it slowly. It creaks.' });
  M.trainer('mina', 4, 32, 'schoolgirl', 'right', { cls: 'Schoolgirl', name: 'Mina', sight: 3, reward: 6, ai: 0, team: [['nibbi', 8], ['peepi', 9]],
    intro: 'I walked all the way from Hemline for a field trip.\\pSo I am going to battle everyone on the way home!', win: 'Teacher says to learn from every loss. This is a lot of learning.', after: 'Hemline is past the woods. They hem everything there, even the curtains.' });
  M.trainer('gus', 13, 17, 'fisher', 'left', { cls: 'Fisher', name: 'Gus', sight: 3, reward: 8, ai: 1, team: [['ribbi', 10], ['ottopi', 10]],
    intro: 'Fish are not biting, so I will bite you instead. Metaphorically.', win: 'There goes my supper...', after: 'The river is calm today. The Pressers upstream keep checking its width.' });
  M.trainer('kei', 7, 16, 'net_kid', 'right', { cls: 'Net Kid', name: 'Kei', sight: 3, reward: 6, ai: 1, team: [['webbi', 9], ['silkie', 10]],
    intro: 'Shh! Do not scare the webs! ...Oh. Battle? Okay!', win: 'My webs got tangled up in yours.', after: 'There are webs in the woods. They are stronger than they look.' });
  M.trainer('brock', 17, 9, 'hiker', 'left', { cls: 'Hiker', name: 'Brock', sight: 4, reward: 8, ai: 1, team: [['molli', 11], ['kumi', 11], ['molli', 12]],
    intro: 'Good boots, good socks, good Kigu. That is the whole secret!', win: 'My boots are fine. It is my pride that has a blister.', after: 'The woods past this road are quiet. Quiet is a kind of trail marker.' });

  M.npc('picnic', 19, 16, 'lady', 'left', null, { script: 'restfree', note: 'free rest spot' });
  M.pickup('cake', 7, 40, 'snack_cake', 2);
  M.pickup('spool', 20, 38, 'bond_spool', 3);
  M.pickup('balm', 20, 14, 'aloe_balm', 1);
  // gated: two things drifting in the river, out of reach of the bridge. Needs Disc: Paddle (Bryn gives it in Hemline).
  const gated = (kind) => { M.def.props[M.def.props.length - 1].gate = kind; };
  M.pickup('drift1', 5, 22, 'revive_tea', 1); gated('paddle');
  M.pickup('drift2', 17, 23, 'fancy_cake', 1); gated('paddle');
  M.pickup('spray', 4, 9, 'scent_spray', 1);
  M.hidden('stump_sugar', 3, 17, 'sugar_cube', 1, 'hidden Sugar Cube under the stump');

  M.enc('grass', [['nibbi', 5, 7, 25], ['peepi', 5, 7, 25], ['mittsy', 5, 8, 20], ['ribbi', 6, 8, 15], ['daisip|sprubun', 6, 8, 10], ['silkie', 6, 7, 5]]);

  // the inspectors wait on the middle of the bridge until the scene removes them (cast defs)
  M.npc('insp_a', 10, 21, 'grunt_m', 'down', ['Tally: Plank twelve... level.'], { hideIf: 'route2_insp_done' });
  M.npc('insp_b', 11, 21, 'grunt_f', 'down', ['Notch: Please wait. Planks are being measured.'], { hideIf: 'route2_insp_done' });
  M.trigger({ x: 10, y: 26, w: 2, h: 1, id: 'route2_inspectors', when: (c) => !c.flag('route2_insp_done'), script: inspectors });

  M.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
