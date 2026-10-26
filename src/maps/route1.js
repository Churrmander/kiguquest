/* Route 1 — Meadow Lane: Button Town -> Basting Green (then Thimble Village). */
(function (root) {
  'use strict';
  const NP = root.NP, K = NP.mapkit;
  const W = 26, H = 40;
  const g = K.grid(W, H, '.');
  K.rect(g, 0, 0, 3, H, 'T'); K.rect(g, W - 3, 0, 3, H, 'T');
  K.rect(g, 3, 0, 4, 2, 'T'); K.rect(g, 18, 0, 5, 2, 'T');
  K.rect(g, 3, 37, 8, 3, 'T'); K.rect(g, 15, 37, 8, 3, 'T');
  K.path(g, [[12, 38], [12, 30], [6, 30], [6, 20], [14, 20], [14, 10], [12, 10], [12, 1]], 2, 'p');
  K.rect(g, 12, 0, 2, 3, 'p');
  K.rect(g, 12, 38, 2, 2, 'p');
  // tall grass
  K.rect(g, 14, 30, 7, 5, ','); K.rect(g, 3, 22, 3, 6, ','); K.rect(g, 8, 23, 6, 5, ','); K.rect(g, 16, 12, 6, 6, ',');
  K.rect(g, 4, 8, 6, 6, ','); K.rect(g, 17, 22, 5, 3, ','); K.rect(g, 8, 33, 3, 3, ',');
  // flowers, pond, ledge
  K.rect(g, 8, 36, 3, 1, 'f'); K.rect(g, 15, 25, 4, 1, 'f'); K.rect(g, 8, 13, 3, 2, 'f');
  K.rect(g, 18, 3, 5, 4, 'w');
  K.rect(g, 15, 28, 6, 1, 'd');
  // one-way ledges (hop down, never climb) funnel the walk north through each trainer's line of sight (owner's rule: no skipping)
  K.rect(g, 3, 26, 3, 1, 'd'); K.rect(g, 8, 26, 14, 1, 'd');   // Lia's row: only the lane at x6-7 goes north
  K.rect(g, 3, 18, 11, 1, 'd'); K.rect(g, 16, 18, 7, 1, 'd');  // Bo's row: only the lane at x14-15
  K.rect(g, 3, 6, 9, 1, 'd'); K.rect(g, 14, 6, 4, 1, 'd');     // Suzu's row: only the lane at x12-13

  const team = (list) => list.map(([sp, lv]) => ({ sp, lv }));

  K.reg({
    id: 'route1', name: 'Route 1  Meadow Lane', music: 'route_meadow', battleBg: 'grass', border: 'treeline',
    view: 'street',   // 3D camera preset (street | town | flat-ish), see src/engine/persp.js
    legend: { '.': 'grass', T: 'treeline', p: 'path', ',': 'tallgrass', f: 'flowers', w: 'water', d: 'ledge_d' },
    rows: K.rows(g),
    stamps: [
      { id: 'sign', x: 14, y: 37 }, { id: 'sign', x: 11, y: 3 },
      { id: 'tree', x: 4, y: 35 }, { id: 'tree', x: 9, y: 28 }, { id: 'tree', x: 17, y: 32 }, { id: 'tree', x: 20, y: 20 }, { id: 'tree', x: 10, y: 17 },
      { id: 'tree', x: 3, y: 15 }, { id: 'tree', x: 19, y: 9 }, { id: 'tree', x: 8, y: 5 }, { id: 'tree', x: 16, y: 6 }, { id: 'tree', x: 4, y: 3 },
      { id: 'bush', x: 3, y: 30 }, { id: 'bush', x: 21, y: 35 }, { id: 'bush', x: 22, y: 26 }, { id: 'boulder', x: 10, y: 11 }, { id: 'rock', x: 18, y: 19 },
      { id: 'bush', x: 7, y: 7 }, { id: 'stump', x: 15, y: 3 },
    ],
    interact: [
      { x: 14, y: 37, say: 'MEADOW LANE\\nNorth: Basting Green, Thimble Village\\nSouth: Button Town' },
      { x: 11, y: 3, say: 'BASTING GREEN is just ahead!\\nThimble Village is a short walk past it.' },
    ],
    spawns: { south: { x: 12, y: 37, dir: 'up' }, north: { x: 12, y: 2, dir: 'down' } },
    warps: [
      { xs: [12, 13], y: 39, to: 'button_town', spawn: 'north', sound: 'none' },
      { xs: [12, 13], y: 0, to: 'basting_green', spawn: 'south', sound: 'none' },
    ],
    encounters: {
      grass: [
        { sp: 'chirpadee', min: 2, max: 4, w: 30 }, { sp: 'nibblit', min: 2, max: 4, w: 30 },   // a Lv5 starter should win these comfortably
        { sp: 'kittabra', min: 3, max: 5, w: 25 }, { sp: 'silkie', min: 3, max: 4, w: 10 },
      ],
    },
    props: [
      { id: 'item_cake', x: 4, y: 33, icon: 'item:snack_cake', hideIf: 'r1_cake', script: function* (c) { c.set('r1_cake'); yield* c.giveItem('snack_cake', 1, { found: true }); } },
      { id: 'item_spool', x: 21, y: 15, icon: 'item:bond_spool', hideIf: 'r1_spool', script: function* (c) { c.set('r1_spool'); yield* c.giveItem('bond_spool', 2, { found: true }); } },
      { id: 'item_sugar', x: 4, y: 12, icon: 'item:sugar_cube', hideIf: 'r1_sugar', script: function* (c) { c.set('r1_sugar'); yield* c.giveItem('sugar_cube', 1, { found: true }); } },
    ],
    npcs: [
      { id: 'hiker', x: 11, y: 36, look: 'elder_m', dir: 'right',
        say: ['Tall grass is where wild Kigu nap in the sun.\\pWeaken one first, since a sleepy Kigu is much easier to befriend.'] },
      { id: 'kid', x: 9, y: 19, look: 'child_f', dir: 'down', move: 'turn',
        say: ['My Chirpadee learned Quick Dash!\\pNow she always gets to the snacks first.'] },
      { id: 'lia', x: 8, y: 25, look: 'tailor_f', dir: 'left',
        trainer: { cls: 'Tailor', name: 'Lia', sight: 2, reward: 6, ai: 0, team: team([['chirpadee', 3], ['nibblit', 3]]),
          intro: 'You have a Kigu too? Let\'s compare stitches!', win: 'Oh! Your seams are tighter than mine.', after: 'My Chirpadee has forgiven you. I\'m still working on it.' } },
      { id: 'bo', x: 13, y: 17, look: 'net_kid', dir: 'right',
        trainer: { cls: 'Net Kid', name: 'Bo', sight: 2, reward: 5, ai: 0, team: team([['kittabra', 4]]),
          intro: 'I befriended my Kittabra in this very grass!', win: 'She fell asleep on me...', after: 'Kittabra naps a lot, but she naps fiercely.' } },
      { id: 'suzu', x: 11, y: 5, look: 'picnicker', dir: 'right',
        trainer: { cls: 'Picnicker', name: 'Suzu', sight: 2, reward: 6, ai: 1, team: team([['sprubun', 4], ['chirpadee', 4]]),
          intro: 'My picnic is over, so now it\'s battle time! Ready?', win: 'My sandwiches are going to get cold...', after: 'There\'s a Salon in Thimble with a real Master Tailor. Pack a snack first!' } },
    ],
    triggers: [
      {
        x: 3, y: 8, w: 20, h: 1, id: 'rival1', when: (c) => !c.flag('rival1_done'), 
        script: function* (c) {
          const t = c.npc('tomo_r1');
          c.placeNpc(t, c.player.x, 4, 'down');
          c.showNpc('tomo_r1');
          yield* c.emote('player', 'exclaim');
          yield* c.say('{rival}: Hold it, {player}!');
          yield* c.walk(t, ['down', 3]);
          yield* c.face('player', 'up');
          yield* c.say('{rival}: Thimble first, {player}? I\'ve been practising since the kite.\\pCome on, then. Show me your best, and I\'ll show you mine!');
          const rs = c.state.rivalStarter || 'ottopi';
          const won = yield* c.trainerBattle({ cls: 'Rival', name: '{rival}', look: 'rival', ai: 2, reward: 10, canLose: true, team: team([[rs, 5], ['chirpadee', 4]]) });
          c.set('rival1_done');
          if (won) yield* c.say('{rival}: Whoa! Okay, your Kigu are tougher than I thought.\\pNice one, {player}. I\'ll be right behind you in Thimble Village!');
          else yield* c.say('{rival}: Told you they were tough! But you were brilliant, {player}.\\pYou should rest up. Rematch at the Salon? Deal?');
          yield* c.walk(t, ['right', 3]);
          c.hideNpc('tomo_r1');
        },
      },
    ],
  });
  // the rival waits off-path until the trigger fires
  NP.maps.route1.npcs.push({ id: 'tomo_r1', x: 13, y: 4, look: 'rival', dir: 'down', hidden: true, say: ['{rival}: ...'] });
})(typeof globalThis !== 'undefined' ? globalThis : window);
