/* Hemline — the busy craft-town of hemmers. Salon #2 (Master Bryn, Buzz) + Tea House, General Store and two houses.
 * Voice: practical, brisk ("Measure twice. Hem once."). The hemmers' grievance: the Society's ready-made uniforms undercut them. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 28, H = 24;

  const M = L.map({
    id: 'hemline', name: 'Hemline', music: 'town_thimble', battleBg: 'grass', border: 'treeline', w: W, h: H,
    legend: { '.': 'grass', T: 'treeline', c: 'cobble', f: 'flowers', F: 'fence', p: 'path' },
    // Mimi runs ahead to Hemline once the shrine incident is over
    onEnter: function* (c) { if (c.flag('shrine1_done')) c.showNpc('mimi_h'); },
  });

  // ---- ground: trees round the edge, a main street east-west, a back street, and short lanes to every door
  M.rect(0, 0, W, 2, 'T').rect(0, 2, 2, H - 2, 'T').rect(W - 2, 2, 2, H - 2, 'T').rect(0, 22, W, 2, 'T');
  M.rect(0, 11, W, 2, 'c');                       // main street (x0 west to Gingham Woods, x27 east towards Seamstead)
  M.rect(3, 18, 22, 2, 'c');                      // back street
  M.rect(12, 13, 2, 5, 'c');                      // connector
  M.rect(12, 7, 2, 4, 'c');                       // lane to the Salon door
  M.rect(4, 8, 2, 3, 'c');                        // lane to the Tea House door
  M.rect(21, 8, 2, 3, 'c');                       // lane to the General Store door
  M.rect(3, 13, 6, 1, 'f').rect(16, 14, 3, 2, 'f').rect(19, 21, 5, 1, 'f').rect(3, 21, 6, 1, 'f');
  M.rect(8, 8, 3, 1, 'f').rect(16, 8, 4, 1, 'f');

  // ---- buildings (doors face the street below them)
  M.building('salon', 10, 2, 'buzz', 'salon', 'hemline_salon');
  M.building('tea_house', 3, 4, null, 'tea', 'hemline_tea');
  M.building('general_store', 20, 4, null, 'store', 'hemline_store');
  M.building('house_s', 3, 15, 'green', 'house1', 'hemline_house1');
  M.building('house_m', 20, 14, 'blue', 'house2', 'hemline_house2');

  // ---- scenery
  M.sign(11, 10, 'HEMLINE\\nWe\'ll take you in.', 'town sign');
  M.sign(2, 10, 'HEMLINE\\nWest: Gingham Woods\\nSpindle Shrine', 'west sign');
  M.sign(24, 10, 'EAST: SEAMSTEAD CITY\\nA short walk by seam road.', 'east sign (Route 3 Seam Road)');
  M.stamp('lamp', 9, 9).stamp('lamp', 15, 9).stamp('lamp', 20, 9);
  M.stamp('well', 9, 13).stamp('cloth_line', 5, 14).stamp('cloth_line', 14, 15).stamp('bench', 17, 10).stamp('barrel', 19, 7).stamp('crate', 25, 7).stamp('haystack', 16, 20);
  M.stamp('flowerbed', 8, 3).stamp('flowerbed', 18, 3).stamp('barrel', 8, 7);
  M.trees([[2, 5], [8, 4], [25, 4], [2, 15], [7, 16], [25, 16], [17, 13], [4, 20], [23, 20], [11, 15]]);
  M.stamp('bush', 25, 14).stamp('bush', 2, 18).stamp('boulder', 25, 20).stamp('rock', 9, 20);

  M.spawn('west', 2, 11, 'right').spawn('east', 25, 12, 'left');
  M.edge('w', 11, 12, 'spindle_shrine', 'east').edge('e', 11, 12, 'route3', 'west');

  // ---- townsfolk: the hemmers' grievance, one line at a time
  M.npc('peddler', 17, 5, 'gentleman', 'left', ['Mr. Sharp, humble peddler. Nothing suspicious!\\pThe chef\'s hat? I am not a chef. Keep your eyes sharp, friend!']);
  M.npc('hemmer', 7, 10, 'tailor_m', 'down', ['Measure twice. Hem once.\\pThat was on my shop sign. Then the Society "inspected" it.\\pNow the sign says nothing at all.']);
  M.npc('hemmer2', 14, 9, 'tailor_f', 'down', ['Their ready-made uniforms cost half what mine do.\\pThey are all one size, which they call "Fine".\\pI cannot compete with "Fine".']);
  M.npc('kid', 15, 17, 'child_m', 'up', ['The Pressers said my dad\'s shop sign was a quarter inch crooked.\\pIt is a hanging sign. It swings!'], { move: 'turn' });
  M.npc('oldtailor', 7, 15, 'old_tailor', 'right', ['Every hem in Hemline is knotted twice. Always has been.\\pNobody ever needed an inspector to tell us what is straight.']);
  M.npc('vf', 24, 9, 'villager_f2', 'down', ['Bryn\'s bees make the honey for the whole town.\\pThe Society said honey was "sticky".\\pOf course it is sticky! That is what honey is for!'], { move: 'wander', range: 1 });
  M.npc('eldm', 18, 9, 'elder_m', 'left', ['They stood outside the shop at dawn with a ruler and a clipboard.\\pVery polite. Very slow.\\pCustomers did not come in.\\pNobody likes to be measured on the way to buy buttons.']);
  M.npc('mimi_h', 13, 9, 'mimi', 'down', null, { hidden: true, script: function* (c) {
    if (c.state.badges && c.state.badges[1]) yield* c.sayT('hemline.mimi.2', 'Mimi: Seamstead City is next! I want to see the lights.\\pAnd I need more lavender. A lot more lavender.');
    else yield* c.sayT('hemline.mimi.1', 'Mimi: Bryn is waiting in the Salon! Do not let her talk speed fool you.\\pShe listens to every word. Probably while counting bees.');
  } });

  M.pickup('cake', 25, 9, 'snack_cake', 2);
  M.hidden('barrel_spool', 19, 7, 'bond_spool', 2, 'Bond Spools in a barrel');
  M.reg();

  // ------------------------------------------------------------------------------------ Tea House
  L.tea({ id: 'hemline_tea', exit: { to: 'hemline', door: 'tea' }, guests: [
    { id: 'guest1', x: 7, y: 6, look: 'tailor_f', dir: 'left', say: ['I stitch hems all day. Tea is the only thing that stays the same length.'] },
    { id: 'guest2', x: 2, y: 5, look: 'gentleman', dir: 'right', say: ['Hemline tea is brewed strong.\\pWe need it for the early mornings, measuring and re-measuring.'] },
  ] }).reg();

  // ---------------------------------------------------------------------------------- General Store
  L.store({ id: 'hemline_store', exit: { to: 'hemline', door: 'store' },
    stock: ['bond_spool', 'snack_cake', 'fancy_cake', 'aloe_balm', 'mint_tea', 'wake_bell', 'numb_away', 'scent_spray', 'thread_ball'],
    gated: [{ badges: 1, items: ['silk_spool'] }],
    guests: [{ id: 'shopper', x: 7, y: 5, look: 'villager_m1', dir: 'left', say: ['Bryn\'s honey is on the second shelf. Do not ask about the third shelf.\\pThe third shelf is Society uniforms.'] }] }).reg();

  // --------------------------------------------------------------------------------------- Salon
  const team = (list) => L.team(list);
  const salon = L.room({
    id: 'hemline_salon', name: 'Hemline Salon', w: 10, h: 12, doorX: 4, floor: 'floor_wood', wall: 'wall_plaster', music: 'town_thimble', battleBg: 'indoor',
    exit: { to: 'hemline', door: 'salon' }, carpet: [4, 2, 2, 9], carpetTerrain: 'carpet_green',
  });
  salon.stamp('mannequin', 1, 2).stamp('mannequin', 8, 2).stamp('bookshelf', 0, 0).stamp('cloth_shelf', 7, 0)
    .stamp('sewing_machine', 1, 5).stamp('sewing_machine', 8, 7).stamp('window', 4, 1).stamp('window', 5, 1).stamp('table_s', 1, 9);
  salon.npc('bryn', 4, 3, 'bryn', 'down', null, { script: 'bryn', note: 'Master Tailor #2 (Buzz)' });
  salon.trainer('salon_t1', 6, 8, 'tailor_f', 'left', { cls: 'Tailor', name: 'Wren', sight: 3, reward: 7, ai: 1, team: [['buzzlet', 11], ['webbi', 12]],
    intro: 'Bryn says: ten stitches, ten bees, ten seconds. I am the ten seconds!', win: 'Eleven seconds. Oops.', after: 'Bryn is at the back. She is faster than she sounds.' });
  salon.trainer('salon_t2', 3, 5, 'tailor_m', 'right', { cls: 'Tailor', name: 'Dov', sight: 3, reward: 8, ai: 1, team: [['silkie', 12], ['sprubun', 12]],
    intro: 'Nobody reaches Bryn without showing me a clean hem first.', win: 'Clean hem. Very clean. Go on through.', after: 'Mind the bees. They do not bite. Much.' });
  salon.reg().brynTeam = team([['webbi', 12], ['cocoona', 13], ['honeybelle', 15]]);

  // -------------------------------------------------------------------------------------- houses
  L.room({ id: 'hemline_house1', name: 'Hemmer\'s House', w: 9, h: 8, doorX: 3, exit: { to: 'hemline', door: 'house1' } })
    .stamp('sewing_machine', 1, 2).stamp('sewing_machine', 2, 2).stamp('table_l', 5, 3).stamp('bookshelf', 6, 0).stamp('plant', 1, 5)
    .npc('stitcher', 4, 5, 'tailor_f', 'left', ['I hem uniforms for the Society now, since nobody else is buying.\\pThey pay fair, and on time.\\p...That is the part I cannot argue with.'])
    .reg();
  L.room({ id: 'hemline_house2', name: 'House', w: 8, h: 7, doorX: 3, exit: { to: 'hemline', door: 'house2' } })
    .stamp('bed', 6, 2).stamp('tv', 1, 2).stamp('rug_b', 3, 3)
    .npc('grandma', 3, 2, 'elder_f', 'down', ['Bryn\'s grandmother kept the woods before her.\\pBryn does it now, bees and all.\\pShe says the Society is a problem. I say she is right.\\pShe also needs a sandwich.'])
    .reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
