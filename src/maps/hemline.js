/* Hemline — the busy craft-town of hemmers and Bryn's honey. Salon #2 (Master Bryn, Buzz) + Tea House, General Store and two houses.
 * You should read the honey at a glance: straw skeps in an apiary by the back street, wild Buzzlets buzzing over the flowers, a
 * honey stall on the main street, and Hemline Honey in the General Store.
 * Voice: practical, brisk ("Measure twice. Hem once."). The hemmers' grievance: the Society's ready-made uniforms undercut them. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 28, H = 24;

  const M = L.map({
    id: 'hemline', name: 'Hemline', music: 'town_thimble', battleBg: 'grass', border: 'treeline', w: W, h: H,
    view: 'street',   // 3D camera preset (street | town | flat-ish), see src/engine/persp.js
    legend: { '.': 'grass', T: 'treeline', c: 'cobble', f: 'flowers', F: 'fence', p: 'path' },
    // Mimi runs ahead to Hemline once the shrine incident is over
    onEnter: function* (c) { if (c.flag('shrine1_done')) c.showNpc('mimi_h'); },
  });

  // ---- ground: trees round the edge, a main street east-west, a back street, and short lanes to every door
  M.rect(0, 0, W, 2, 'T').rect(0, 2, 2, H - 2, 'T').rect(W - 2, 2, 2, H - 2, 'T').rect(0, 22, W, 2, 'T');
  M.rect(0, 11, W, 2, 'c');                       // main street (x0 west to Gingham Woods, x27 east towards Seamstead)
  M.rect(5, 18, 18, 2, 'c');                      // back street (door to door)
  M.rect(12, 13, 2, 5, 'c');                      // connector
  M.rect(12, 7, 3, 4, 'c');                       // lane to the Salon door (3 wide, centred on it)
  M.rect(4, 8, 3, 3, 'c');                        // lane to the Tea House door
  M.rect(21, 8, 3, 3, 'c');                       // lane to the General Store door
  M.rect(3, 13, 6, 1, 'f').rect(16, 14, 3, 2, 'f').rect(13, 21, 7, 1, 'f').rect(3, 21, 6, 1, 'f');
  M.rect(8, 8, 3, 1, 'f').rect(16, 8, 4, 1, 'f');

  // ---- buildings (doors face the street below them)
  M.building('salon', 10, 2, 'buzz', 'salon', 'hemline_salon');
  M.building('tea_house', 3, 4, null, 'tea', 'hemline_tea');
  M.building('general_store', 20, 4, null, 'store', 'hemline_store');
  M.building('house_s', 3, 15, 'green', 'house1', 'hemline_house1');
  M.building('house_m', 20, 14, 'blue', 'house2', 'hemline_house2');

  // ---- scenery
  M.sign(11, 10, 'HEMLINE\\nWe\'ll take you in.', 'town sign');
  M.sign(2, 10, 'HEMLINE\\nWest to Gingham Woods\\nand the Spindle Shrine', 'west sign');
  M.sign(24, 10, 'EAST: SEAMSTEAD CITY\\nIt\'s a short walk along the Seam Road.', 'east sign (Route 3 Seam Road)');
  M.stamp('lamp', 9, 9).stamp('lamp', 15, 9).stamp('lamp', 20, 9);
  M.stamp('well', 9, 13).stamp('cloth_line', 5, 14).stamp('cloth_line', 9, 16).stamp('bench', 17, 10).stamp('barrel', 19, 7).stamp('crate', 25, 7);
  M.stamp('flowerbed', 8, 3).stamp('flowerbed', 18, 3).stamp('barrel', 8, 7);
  M.trees([[2, 5], [8, 4], [25, 4], [2, 15], [8, 20], [25, 16], [17, 13], [4, 20], [23, 20], [11, 15]]);
  M.stamp('bush', 25, 14).stamp('bush', 2, 18).stamp('boulder', 25, 20).stamp('rock', 10, 20);
  // ---- the honey: Bryn's apiary south of the back street, a stall on the main street, and wild Buzzlets about the flowers
  M.stamp('skep', 14, 20).stamp('skep', 16, 20).stamp('skep', 18, 20);
  M.stamp('skep', 11, 8).stamp('skep', 15, 8);   // Bryn keeps a hive either side of the Salon path
  M.stamp('honey_stall', 14, 13);
  for (const [x, y] of [[15, 20], [17, 21], [9, 2], [18, 2], [16, 14], [6, 13]]) M.stamp('buzzlet_fly', x, y);
  const STALL = 'HEMLINE HONEY\\nFresh from Bryn\'s hives.\\pJars are at the General Store, 250 each.';
  const SKEP = 'A straw skep, humming away. Bryn\'s bees live here.\\nThey\'re busy, but polite.';
  M.interact(14, 13, STALL, 'honey stall').interact(15, 13, STALL, 'honey stall');
  M.interact(14, 20, SKEP, 'skep').interact(16, 20, SKEP, 'skep').interact(18, 20, SKEP, 'skep').interact(11, 8, SKEP, 'skep').interact(15, 8, SKEP, 'skep');

  M.spawn('west', 2, 11, 'right').spawn('east', 25, 12, 'left');
  M.edge('w', 11, 12, 'spindle_shrine', 'east').edge('e', 11, 12, 'route3', 'west');
  // no sequence break: the seam road east waits for the Buzz Button (otherwise Bryn, the Paddle Disc and Chapter 2's ending are skippable)
  M.trigger({ x: 26, y: 11, w: 1, h: 2, id: 'east_before_bryn', when: (c) => !c.flag('badge2'), script: function* (c) {
    yield* c.sayT('hemline.east_block', 'Mimi: Wait up, {player}! Bryn is expecting you at the Salon first.\\pIt\'s the big building north of the main street.\\pSeamstead will still be there afterwards, I promise!');
    yield* c.walk('player', ['left']);
  } });

  // ---- townsfolk: the hemmers' grievance, one line at a time
  M.npc('beekeeper', 16, 13, 'villager_m2', 'left', ['The bees are Bryn\'s. The jars are mine. The sticky fingers are everybody\'s.\\pThe Society wanted the hives in neat straight rows, but the bees didn\'t agree.']);
  M.npc('peddler', 17, 5, 'gentleman', 'left', ['I\'m Mr. Sharp, just a humble peddler. Nothing suspicious!\\pThe chef\'s hat? Oh, I\'m not a chef. Keep your eyes sharp, friend!']);
  M.npc('hemmer', 7, 10, 'tailor_m', 'down', ['"Measure twice, hem once." That used to be painted on my shop sign,\\puntil the Society came by and "inspected" it.\\pNow the sign doesn\'t say anything at all.']);
  M.npc('hemmer2', 14, 9, 'tailor_f', 'down', ['Their ready-made uniforms cost half what mine do.\\pThey only come in one size, and they call it "Fine".\\pHow am I supposed to compete with "Fine"?']);
  M.npc('kid', 15, 17, 'child_m', 'up', ['The Pressers said my dad\'s shop sign was a quarter inch crooked.\\pIt\'s a hanging sign, so of course it swings!'], { move: 'turn' });
  M.npc('oldtailor', 7, 15, 'old_tailor', 'right', ['Every hem in Hemline is knotted twice, and it always has been.\\pNobody ever needed an inspector to tell us what\'s straight.']);
  M.npc('vf', 24, 9, 'villager_f2', 'down', ['Bryn\'s bees make honey for the whole town, and the Society called it "sticky".\\pWell, of course it\'s sticky! That\'s what honey is for!'], { move: 'wander', range: 1 });
  M.npc('eldm', 18, 9, 'elder_m', 'left', ['They stood outside the shop at dawn with a ruler and a clipboard.\\pThey were very polite about it, and very slow, and the customers stayed away.\\pWho wants to be measured on the way to buy buttons?']);
  M.npc('mimi_h', 13, 9, 'mimi', 'down', null, { hidden: true, script: function* (c) {
    if (c.state.badges && c.state.badges[1]) yield* c.sayT('hemline.mimi.2', 'Mimi: Seamstead City is next! I can\'t wait to see the lights.\\pOh, and I need more lavender. A lot more lavender.');
    else yield* c.sayT('hemline.mimi.1', 'Mimi: Bryn\'s waiting in the Salon! She talks fast, but don\'t let that fool you.\\pShe listens to every word. Probably while she\'s counting bees, too.');
  } });

  M.pickup('cake', 25, 9, 'snack_cake', 2);
  M.hidden('barrel_spool', 19, 7, 'bond_spool', 2, 'Bond Spools in a barrel');
  M.reg();

  // ------------------------------------------------------------------------------------ Tea House
  L.tea({ id: 'hemline_tea', exit: { to: 'hemline', door: 'tea' }, guests: [
    { id: 'guest1', x: 7, y: 6, look: 'tailor_f', dir: 'left', say: ['I stitch hems all day. Tea is the only thing that stays the same length.'] },
    { id: 'guest2', x: 2, y: 5, look: 'gentleman', dir: 'right', say: ['We brew our tea strong in Hemline.\\pWe need it for the early mornings, with all that measuring and re-measuring.'] },
  ] }).reg();

  // ---------------------------------------------------------------------------------- General Store
  L.store({ id: 'hemline_store', exit: { to: 'hemline', door: 'store' },
    stock: ['bond_spool', 'snack_cake', 'honey_jar', 'fancy_cake', 'aloe_balm', 'mint_tea', 'wake_bell', 'numb_away', 'scent_spray', 'thread_ball'],
    gated: [{ badges: 1, items: ['silk_spool'] }],
    guests: [{ id: 'shopper', x: 7, y: 5, look: 'villager_m1', dir: 'left', say: ['Bryn\'s honey is on the second shelf. Don\'t ask about the third shelf.\\pThe third shelf is Society uniforms.'] }] }).reg();

  // --------------------------------------------------------------------------------------- Salon
  const team = (list) => L.team(list);
  const salon = L.room({
    id: 'hemline_salon', name: 'Hemline Salon', w: 10, h: 12, doorX: 4, floor: 'floor_wood', wall: 'wall_plaster', music: 'town_thimble', battleBg: 'gym',
    exit: { to: 'hemline', door: 'salon' }, carpet: [4, 2, 2, 9], carpetTerrain: 'carpet_green',
  });
  salon.stamp('mannequin', 1, 2).stamp('mannequin', 8, 2).stamp('bookshelf', 0, 0).stamp('cloth_shelf', 7, 0)
    .stamp('sewing_machine', 1, 5).stamp('sewing_machine', 8, 7).stamp('window', 4, 1).stamp('window', 5, 1).stamp('table_s', 1, 9);
  salon.npc('bryn', 4, 3, 'bryn', 'down', null, { script: 'bryn', note: 'Master Tailor #2 (Buzz)' });
  salon.trainer('salon_t1', 6, 8, 'tailor_f', 'left', { cls: 'Tailor', name: 'Wren', sight: 3, reward: 7, ai: 1, team: [['buzzlet', 11], ['spinnet', 12]],
    intro: 'Bryn always says "ten stitches, ten bees, ten seconds". I\'m the ten seconds!', win: 'Eleven seconds. Oops.', after: 'Bryn\'s right at the back. She battles even faster than she talks!' });
  salon.trainer('salon_t2', 3, 5, 'tailor_m', 'right', { cls: 'Tailor', name: 'Dov', sight: 3, reward: 8, ai: 1, team: [['acolarva', 12], ['sprubun', 12]],
    intro: 'Nobody reaches Bryn without showing me a clean hem first.', win: 'Now that\'s a clean hem. A very clean hem! Go on through.', after: 'Mind the bees. They don\'t bite. ...Much.' });
  salon.reg().brynTeam = team([['spinnet', 12], ['vowspun', 13], ['hunnibloom', 14]]);

  // -------------------------------------------------------------------------------------- houses
  L.room({ id: 'hemline_house1', name: 'Hemmer\'s House', w: 9, h: 8, doorX: 3, exit: { to: 'hemline', door: 'house1' } })
    .stamp('sewing_machine', 1, 2).stamp('sewing_machine', 2, 2).stamp('table_l', 5, 3).stamp('bookshelf', 6, 0).stamp('plant', 1, 5)
    .npc('stitcher', 4, 5, 'tailor_f', 'left', ['I hem uniforms for the Society now, since nobody else is buying.\\pAnd they pay fairly, and on time. ...That\'s the part I can\'t argue with.'])
    .reg();
  L.room({ id: 'hemline_house2', name: 'House', w: 8, h: 7, doorX: 3, exit: { to: 'hemline', door: 'house2' } })
    .stamp('bed', 6, 2).stamp('tv', 1, 2).stamp('rug_b', 3, 3)
    .npc('grandma', 3, 2, 'elder_f', 'down', ['Bryn\'s grandmother looked after the woods, and now Bryn does, bees and all.\\pShe says the Society is a problem, and I think she\'s right.\\pI also think she needs a sandwich.'])
    .reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
