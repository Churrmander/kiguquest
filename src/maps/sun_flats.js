/* The Sun Flats and the sand cave — south of Canvas Rest (Chapter 4 padding: the sun-cloth quest, from the owner's idea).
 * Chief Weft won't hand out sun-cloth to strangers, and the camp's children keep going missing. Three chores around camp each
 * turn up a clue (Pricklepot needles in the cactus field, herbs from the spring, a researcher's journal a Dunehop ran off with), Mimi
 * finds the last one, and together they point to the Echo Dune. In the cave under it, a big desert Kigu with a woven scarf has
 * been scooping up children who wander off and mothering them. You battle her, your Kigu talk her round, the children go home,
 * and the chief gives Mimi sun-cloth for two scarves. (The scenes in camp are in canvas_rest.js.)
 * Story text never names Chapter 4 species (they may be renamed); the battles use their ids.
 * Flags: sun_quest, needle_1..3, herb_1..3, jerbi_hop, journal_got, chore_needles/herbs/journal, sand_cave_found, kids_home. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 32, H = 26;

  /** how many of a set of pickups you have: counts the flags, and keeps the key item's count in step */
  const gather = (prefix, item, n, line) => function* (c) {
    c.set(prefix + n);
    NP.snd.sfx('pickup');
    const got = [1, 2, 3].filter((i) => c.flag(prefix + i)).length;
    c.state.bag[item] = got;
    yield* c.sayT('sun_flats.' + prefix + n, line + (got < 3 ? '\\p(' + got + ' of 3.)' : '\\pThat\'s all three!'));
  };

  const M = L.map({
    id: 'sun_flats', name: 'The Sun Flats', music: 'route_desert', battleBg: 'desert', border: 'cliff', w: W, h: H, view: 'street',
    legend: { u: 'dune', s: 'sand', C: 'cliff', w: 'water', '.': 'grass', ';': 'dry_grass', f: 'flowers' },
    fill: 'u',
  });
  M.rect(0, 0, W, 2, 'C').rect(0, H - 2, W, 2, 'C').rect(0, 2, 2, H - 4, 'C').rect(W - 2, 2, 2, H - 4, 'C');
  M.rect(14, 0, 3, 2, 'u');                                        // up to Canvas Rest
  // the cactus field (west): wild Pricklepot grow here and shed their spines in the sand
  M.blob(8, 8, 6, 5, ';').blob(4, 11, 3, 2, ';');
  for (const [x, y] of [[2, 8], [14, 7], [14, 9], [13, 4], [3, 4], [2, 9]]) M.set(x, y, 'u');   // nibble the edges so they aren't straight strips
  for (const [x, y, w] of [[15, 4, 1], [14, 8, 2], [3, 15, 1], [16, 11, 1], [9, 14, 2], [2, 6, 1]]) M.rect(x, y, w, 1, ';');   // stray tufts
  for (const [x, y, v] of [[4, 5], [8, 4, 'plain'], [11, 6], [6, 9, 'plain'], [10, 10], [3, 12], [12, 12, 'plain']]) M.stamp('cactus', x, y, v || null);
  // the spring (east): an oval pool with a grassy bank, palms, and a sand rim before the cliffs
  M.blob(23, 8, 5.6, 4.5, 's');
  M.blob(23, 8, 5, 3.6, '.');
  M.rect(21, 6, 5, 1, 'w').rect(20, 7, 7, 2, 'w').rect(21, 9, 5, 1, 'w');   // the pool: an oval, not a blob
  M.rect(19, 10, 2, 1, 'f').rect(25, 5, 2, 1, 'f');
  M.stamp('palm', 18, 5).stamp('palm', 27, 10).stamp('palm', 26, 3);
  M.rect(W - 2, 2, 2, H - 4, 'C').rect(0, 2, 2, H - 4, 'C');      // (the pool and the grass ran into the cliffs)
  // the Dunehop burrows (south): dry grass with holes in it
  M.blob(14, 18, 6.8, 3, ';').blob(10, 20, 3, 2, ';');
  for (const [x, y] of [[8, 17], [20, 18], [19, 20], [7, 19], [12, 15]]) M.set(x, y, 'u');
  for (const [x, y, w] of [[21, 14, 1], [6, 19, 2], [24, 22, 1], [4, 23, 2], [19, 22, 1]]) M.rect(x, y, w, 1, ';');
  for (const [x, y] of [[11, 17], [18, 19], [14, 20], [9, 21], [20, 17], [16, 16]]) M.set(x, y, 'u').stamp('burrow', x, y);   // bare sand round each hole
  M.stamp('rock', 9, 18).stamp('rock', 17, 16).stamp('boulder', 21, 20).stamp('rock', 13, 22);
  M.stamp('cactus', 16, 7, 'plain').stamp('cactus', 3, 21).stamp('rock', 28, 22).stamp('boulder', 4, 16).stamp('rock', 20, 23).stamp('cactus', 14, 10);
  M.stamp('rock', 16, 13).stamp('cactus', 12, 15, 'plain').stamp('rock', 12, 4).blob(14, 13, 1.2, 1, ';');
  // the Echo Dune (south-east): a free-standing ridge of packed sand that hums in the wind. The cave under it only shows once
  // you know where to look; its mouth sits in a notch in the ridge's south face
  M.blob(25, 16.5, 3.4, 2, 'C').rect(23, 19, 1, 1, 'C').rect(27, 19, 1, 1, 'C');
  M.rect(24, 18, 3, 2, 'u').rect(24, 20, 3, 1, 's').set(25, 21, 's');   // the notch the mouth sits in, and the trodden sand out of it
  M.stamp('cave_mouth', 24, 18, 'dune', { name: 'cave', to: 'sand_cave', showIf: 'sand_cave_found' });
  M.interact(23, 19, function* (c) {
    yield* c.sayT('sun_flats.echo_dune', c.flag('sand_cave_found') ? 'The wind hums across the mouth of the cave.' : 'A tall ridge of packed sand. When the wind blows across it, it hums like somebody singing a lullaby.');
  }, 'the Echo Dune');
  M.sign(17, 3, 'THE SUN FLATS\\nCactus field to the west, the spring to the east.\\pChildren: stay where the camp can see you!', 'flats sign');
  M.spawn('north', 15, 2, 'down');
  M.edge('n', 14, 16, 'canvas_rest', 'south');
  M.enc('grass', [['pricklepot|nibblit', 20, 23, 34], ['dunehop|nibblit', 20, 23, 30], ['sandkit|kittabra', 20, 22, 20], ['stingle|chirpadee', 21, 23, 16]]);

  // chore 1: Pricklepot needles in the cactus field
  const needle = (n, x, y) => M.def.props.push({ id: 'needle_' + n, x, y, icon: 'item:cactus_needles', hideIf: 'needle_' + n, showIf: 'sun_quest', note: 'Pricklepot needles (chore)',
    script: gather('needle_', 'cactus_needles', n, 'Lying in the sand by the cactus is a little heap of long, pale spines. A Pricklepot must have shed them.') });
  needle(1, 5, 6); needle(2, 9, 8); needle(3, 4, 11);
  // chore 2: herbs from the spring
  const herb = (n, x, y) => M.def.props.push({ id: 'herb_' + n, x, y, icon: 'item:desert_herbs', hideIf: 'herb_' + n, showIf: 'sun_quest', note: 'spring herbs (chore)',
    script: gather('herb_', 'desert_herbs', n, n === 2
      ? 'A clump of silver-leaf herbs grows by the water. Someone has already picked half of it, and very neatly, too.'
      : 'A clump of silver-leaf herbs grows by the water. You pick a good handful.') });
  herb(1, 20, 6); herb(2, 27, 8); herb(3, 21, 10);
  // chore 3: the Dunehop with the journal hops off twice, then turns round and battles
  const HOPS = [[11, 17], [18, 19], [14, 20]];
  M.npc('jerbi_thief', HOPS[0][0], HOPS[0][1], 'dunehop|child_f', 'down', null, { showIf: 'sun_quest', hideIf: 'journal_got', note: 'the Dunehop with the journal (chore)', script: function* (c, n) {
    const hop = (c.state.flags.jerbi_hop || 0);
    if (hop < 2) {
      yield* c.sayT('sun_flats.dunehop.' + hop, hop === 0
        ? 'A Dunehop is sitting on a notebook, chewing the corner. She sees you, grabs it in her teeth, and bounces off!'
        : 'The Dunehop peeks out of a burrow with the notebook. "Jeb!" Off she bounces again.');
      NP.snd.sfx('ledge');
      c.state.flags.jerbi_hop = hop + 1;
      yield* c.ow.fadeOut(4);
      c.placeNpc(n, HOPS[hop + 1][0], HOPS[hop + 1][1], 'down');
      yield* c.ow.fadeIn(4);
      return;
    }
    yield* c.sayT('sun_flats.dunehop.2', 'The Dunehop has nowhere left to hop. She drops the notebook, puffs up her cheeks, and squares up to you!');
    const res = yield* c.wildBattle('dunehop', 22);
    if (res && res.fled) return;
    c.set('journal_got');
    c.hideNpc(n.id);
    yield* c.giveItem('field_journal', 1, { found: true });
  } });
  // padding: two optional trainers out on the flats
  M.trainer('sf_t1', 7, 14, 'camper', 'right', { cls: 'Camper', name: 'Ilse', sight: 3, reward: 11, ai: 1, team: [['sandkit|kittabra', 21], ['pricklepot|nibblit', 22]],
    intro: 'I\'m practising for the caravan trials! You\'re my practice!', win: 'Okay, I need more practice.', after: 'The kids from camp used to play out here. Now their parents keep them by the well.' });
  M.trainer('sf_t2', 22, 13, 'picnicker', 'left', { cls: 'Picnicker', name: 'Rue', sight: 3, reward: 12, ai: 1, team: [['dunehop|nibblit', 22], ['stingle|chirpadee', 22]],
    intro: 'This is the only grass for miles, and I brought a whole picnic. You can have a battle instead!', win: 'Fine, have a sandwich too.', after: 'Sometimes the Echo Dune hums at night. It sounds like somebody singing.' });
  M.pickup('candy', 29, 3, 'snack_cake', 2);
  M.reg();

  // ------------------------------------------------------------------------------------------ the sand cave
  function* cave(c) {
    if (c.flag('kids_home')) return;
    const k = c.npc('sand_mother'), m = c.npc('mimi_sc');
    yield* c.sayT('sand_cave.1', 'At the back of the cave there\'s a nest of old scarves and blankets. Three children are curled up in it, fast asleep.\\pIn front of them stands a big desert Kigu in a woven scarf, with a bundle of herbs at her hip.');
    yield* c.emote(k, 'exclaim');
    yield* c.sayT('sand_cave.2', 'She spreads her arms wide in front of the nest and lets out a low growl. She isn\'t going to let anyone near them.');
    yield* c.sayT('sand_cave.3', 'Mimi: She thinks we\'re here to take her babies. {player}, we have to calm her down first!');
    const res = yield* c.wildBattle('sandoa', 25, { noCatch: true });
    if (res && res.fled) { yield* c.sayT('sand_cave.fled', 'The Kigu is still standing guard in front of the nest.'); return; }
    yield* c.sayT('sand_cave.4', 'The Kigu sits down heavily between you and the nest. She\'s out of breath, and she looks more tired than angry.');
    const lead = c.state.party.find((q) => q.hp > 0) || c.state.party[0];
    const name = lead ? NP.Kigu.displayName(lead) : 'your Kigu';
    yield* c.sayT('sand_cave.5', name + ' walks up to her slowly and sits down too. The two of them look at each other for a long moment.');
    yield* c.sayT('sand_cave.6', name + ' points at the sleeping children, then back towards the cave mouth, and makes a small, worried chirp.\\pThe big Kigu shakes her head and hugs her scarf tighter.');
    yield* c.sayT('sand_cave.7', name + ' points again, towards the camp, and mimes someone looking around, hands up to their eyes, searching and searching.\\pThen ' + name + ' puts both hands over her heart and droops.');
    yield* c.sayT('sand_cave.8', 'The big Kigu goes very still. She chitters something quiet, a question, and ' + name + ' chitters back and nods.');
    yield* c.sayT('sand_cave.9', 'Mimi: I think she found them lost in the dunes and didn\'t know they had families waiting for them.\\pShe was only looking after them.');
    yield* c.sayT('sand_cave.10', 'The big Kigu looks at the nest for a long time. Then she gently nudges each of the children awake.');
    yield* c.ow.fadeOut(12);
    c.set('kids_home');
    c.hideNpc(k.id); c.hideNpc(m.id);
    for (const id of ['cave_kid1', 'cave_kid2', 'cave_kid3']) c.hideNpc(id);
    c.ow.loadMap('canvas_rest', 15, 11, 'down', { noEnter: true });
    yield* c.wait(6);
    yield* c.ow.fadeIn(12);
    yield* NP.scripts.kids_home(c);
  }
  const C = L.map({
    id: 'sand_cave', name: 'Sand Cave', music: 'cave', battleBg: 'cave', border: 'cave_wall', w: 16, h: 12, indoor: true,
    legend: { w: 'cave_wall', f: 'cave_floor' }, fill: 'w',
  });
  C.rect(3, 2, 10, 6, 'f').rect(6, 7, 4, 3, 'f').rect(7, 10, 2, 2, 'f').rect(2, 4, 1, 3, 'f').rect(13, 3, 1, 3, 'f');   // a rounded den, and the way in
  C.warp({ xs: [7, 8], y: 11, to: 'sun_flats', door: 'cave', sound: 'door' });
  C.spawn('door', 7, 10, 'up');
  C.stamp('scarf_nest', 6, 3).stamp('nest_rim', 6, 4, null, { goneIf: 'kids_home' }).stamp('rock', 3, 7).stamp('boulder', 12, 6).stamp('rock', 13, 3).stamp('barrel', 3, 3).stamp('crate', 11, 2);   // the nest, and a few things she's gathered
  for (const [i, x, y, look] of [[1, 6, 4, 'camp_kid_m_nap'], [2, 7, 4, 'camp_kid_f_nap'], [3, 8, 4, 'net_kid_nap']]) {
    C.npc('cave_kid' + i, x, y, look, 'down', ['The child is fast asleep, wrapped up in an old scarf.'], { hideIf: 'kids_home' });
  }
  C.npc('sand_mother', 7, 7, 'sand_mother', 'down', null, { hideIf: 'kids_home', script: cave, note: 'the big desert Kigu who took the children in (battle, then talk)' });
  C.npc('mimi_sc', 8, 9, 'mimi', 'up', ['Mimi: Careful. She looks scared, not angry.'], { hideIf: 'kids_home' });
  C.trigger({ x: 6, y: 8, w: 4, h: 1, id: 'sand_mother', when: (c) => !c.flag('kids_home'), script: cave });
  C.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
