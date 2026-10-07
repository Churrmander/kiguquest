/* Route 1 — Meadow Lane: Button Town -> Thimble Village. */
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
  K.rect(g, 8, 36, 3, 1, 'f'); K.rect(g, 15, 26, 4, 1, 'f'); K.rect(g, 8, 13, 3, 2, 'f');
  K.rect(g, 18, 3, 5, 4, 'w');
  K.rect(g, 15, 28, 6, 1, 'd');

  const team = (list) => list.map(([sp, lv]) => ({ sp, lv }));

  K.reg({
    id: 'route1', name: 'Route 1  Meadow Lane', music: 'route_meadow', battleBg: 'grass', border: 'treeline',
    legend: { '.': 'grass', T: 'treeline', p: 'path', ',': 'tallgrass', f: 'flowers', w: 'water', d: 'ledge_d' },
    rows: K.rows(g),
    stamps: [
      { id: 'sign', x: 14, y: 37 }, { id: 'sign', x: 11, y: 3 },
      { id: 'tree', x: 4, y: 35 }, { id: 'tree', x: 9, y: 29 }, { id: 'tree', x: 17, y: 32 }, { id: 'tree', x: 20, y: 20 }, { id: 'tree', x: 10, y: 17 },
      { id: 'tree', x: 3, y: 15 }, { id: 'tree', x: 19, y: 9 }, { id: 'tree', x: 8, y: 5 }, { id: 'tree', x: 16, y: 6 }, { id: 'tree', x: 4, y: 3 },
      { id: 'bush', x: 3, y: 30 }, { id: 'bush', x: 21, y: 35 }, { id: 'bush', x: 22, y: 26 }, { id: 'boulder', x: 10, y: 11 }, { id: 'rock', x: 18, y: 19 },
      { id: 'flowerbed', x: 7, y: 7 }, { id: 'stump', x: 15, y: 3 },
    ],
    interact: [
      { x: 14, y: 37, say: 'MEADOW LANE\\nNorth: Thimble Village\\nSouth: Button Town' },
      { x: 11, y: 3, say: 'THIMBLE VILLAGE is just ahead!\\nTea House - General Store - Salon' },
    ],
    spawns: { south: { x: 12, y: 37, dir: 'up' }, north: { x: 12, y: 2, dir: 'down' } },
    warps: [
      { xs: [12, 13], y: 39, to: 'button_town', spawn: 'north', sound: 'none' },
      { xs: [12, 13], y: 0, to: 'thimble', spawn: 'south', sound: 'none' },
    ],
    encounters: {
      grass: [
        { sp: 'peepi', min: 2, max: 4, w: 30 }, { sp: 'nibbi', min: 2, max: 4, w: 30 },
        { sp: 'mittsy', min: 3, max: 5, w: 25 }, { sp: 'silkie', min: 3, max: 4, w: 10 },
      ],
    },
    props: [
      { id: 'item_cake', x: 4, y: 33, icon: 'item:snack_cake', hideIf: 'r1_cake', script: function* (c) { c.set('r1_cake'); yield* c.giveItem('snack_cake', 1, { found: true }); } },
      { id: 'item_spool', x: 21, y: 15, icon: 'item:bond_spool', hideIf: 'r1_spool', script: function* (c) { c.set('r1_spool'); yield* c.giveItem('bond_spool', 2, { found: true }); } },
      { id: 'item_sugar', x: 4, y: 12, icon: 'item:sugar_cube', hideIf: 'r1_sugar', script: function* (c) { c.set('r1_sugar'); yield* c.giveItem('sugar_cube', 1, { found: true }); } },
    ],
    npcs: [
      { id: 'hiker', x: 11, y: 36, look: 'elder_m', dir: 'right',
        say: ['Tall grass is where wild Kigu nap in the sun.\\pIf you want a Kigu to join you, weaken her first. Sleepy Kigu are much easier to befriend.'] },
      { id: 'kid', x: 9, y: 19, look: 'child_f', dir: 'down', move: 'turn',
        say: ['My Peepi learned Quick Dash!\\pShe always gets to the snack first.'] },
      { id: 'lia', x: 6, y: 25, look: 'tailor_f', dir: 'down',
        trainer: { cls: 'Tailor', name: 'Lia', sight: 4, reward: 6, ai: 0, team: team([['peepi', 3], ['nibbi', 3]]),
          intro: 'You have a Kigu too? Let us compare stitches!', win: 'Oh! Your seams are tighter than mine.', after: 'Keep your Kigu rested. Thimble Village has a Tea House.' } },
      { id: 'bo', x: 12, y: 25, look: 'net_kid', dir: 'left',
        trainer: { cls: 'Net Kid', name: 'Bo', sight: 3, reward: 5, ai: 0, team: team([['mittsy', 4]]),
          intro: 'I befriended my Mittsy in this very grass!', win: 'She fell asleep on me...', after: 'Mittsy naps a lot, but she naps fiercely.' } },
      { id: 'suzu', x: 15, y: 15, look: 'picnicker', dir: 'left',
        trainer: { cls: 'Picnicker', name: 'Suzu', sight: 4, reward: 6, ai: 1, team: team([['sprubun', 4], ['peepi', 4]]),
          intro: 'Picnic time is over! Battle time!', win: 'My sandwiches are going to get cold...', after: 'Thimble Village has a Salon with a Master Tailor. Good luck!' } },
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
          yield* c.say('{rival}: Did you think you would beat me to Thimble Village? Not a chance.\\pI have been training my Kigu all morning. Let me show you how strong we are!');
          const rs = c.state.rivalStarter || 'ottopi';
          const won = yield* c.trainerBattle({ cls: 'Rival', name: '{rival}', look: 'tomo', ai: 2, reward: 10, team: team([[rs, 6], ['peepi', 5]]) });
          c.set('rival1_done');
          if (won) yield* c.say('{rival}: ...Tch. So you are not just lucky.\\pFine. I will be waiting in Thimble Village. Do not get sleepy on me!');
          else yield* c.say('{rival}: Ha! Better get your Kigu some rest before you try again.');
          yield* c.walk(t, ['right', 3]);
          c.hideNpc('tomo_r1');
        },
      },
    ],
  });
  // the rival waits off-path until the trigger fires
  NP.maps.route1.npcs.push({ id: 'tomo_r1', x: 13, y: 4, look: 'tomo', dir: 'down', hidden: true, say: ['{rival}: ...'] });
})(typeof globalThis !== 'undefined' ? globalThis : window);
