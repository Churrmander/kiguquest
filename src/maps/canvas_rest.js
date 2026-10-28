/* Canvas Rest — the tent camp at the edge of the Dust Bowl. A Tea House (Dune Cocoa!), a General Store, and the weavers' tents.
 * Story: Mimi has designed a dust scarf, but Chief Weft won't give sun-cloth to strangers, and the camp's children keep going
 * missing. Three chores (Weaver Ama, Healer Josi, Dr. Faro), each with a clue, then Mimi's clue lead to the sand cave on the Sun
 * Flats (sun_flats.js). The children come home, and the chief gives Mimi sun-cloth for two scarves: that gets you through the dust
 * storm. Mr. Sharp is "just a humble rug". West: Route 4. East: the Dust Bowl. South: the Sun Flats. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 32, H = 22;

  // ---- Mimi, the chief and the sun-cloth (owner's padding idea; the flats and the sand cave are in sun_flats.js)
  // Mimi's first scene: she's designed a dust scarf, but Chief Weft won't give sun-cloth to strangers, and the camp's children
  // keep going missing. So you both help around camp: three chores, each with a clue, then Mimi's clue, then the sand cave.
  function* mimiCamp(c) {
    c.set('mimi_camp_done');
    c.set('sun_quest');
    const m = c.npc('mimi_c');
    yield* c.emote(m, 'exclaim');
    yield* c.approach(m);                                            // she runs over from the well, so she's on screen as she talks
    yield* c.sayT('canvas_rest.mimi.1', 'Mimi: {player}, look at this place! Every tent is sewn from sun-cloth,\\pand they double the seams so the sand can\'t creep in. I\'ve drawn twenty pages already!');
    yield* c.sayT('canvas_rest.mimi.2', 'Mimi: The weavers say a dust storm is blowing across the Dust Bowl.\\pYou can\'t see your own feet out there, never mind the road.');
    yield* c.sayT('canvas_rest.mimi.3', 'Mimi: So I designed a scarf for it, with a tight weave so the grit stays out. I showed it to Chief Weft, and she loved it!\\pBut she won\'t give us any sun-cloth. She says it\'s far too precious to hand out to strangers.');
    yield* c.sayT('canvas_rest.mimi.4', 'Mimi: And something\'s wrong here. Children from the camp keep going missing out on the flats, and everyone\'s frightened.\\pLet\'s ask around and help where we can. If the camp gets to know us, maybe the chief will change her mind.');
    yield* c.sayT('canvas_rest.mimi.5', 'Mimi: {rival} didn\'t wait, by the way. They wrapped a towel round their face and charged straight into the storm.\\pThey shouted "see you on the other side!" I hope they meant the other side of the desert.');
    yield* c.walkTo(m, 16, 12);
    yield* c.face(m, 'down');
  }

  // the three chores: each giver wants something from the flats, and tells you what they've seen
  const choresDone = (c) => ['needles', 'herbs', 'journal'].every((k) => c.flag('chore_' + k));
  const chore = (key, o) => function* (c) {
    const k = (s) => 'canvas_rest.' + key + '.' + s;
    if (!c.flag('sun_quest')) { yield* c.sayT(k('flavour'), o.flavour); return; }
    if (c.flag('chore_' + key)) { yield* c.sayT(k('after'), o.after); return; }
    if (!o.has(c)) { yield* c.sayT(k('ask'), o.ask); return; }
    delete c.state.bag[o.item];
    c.set('chore_' + key);
    NP.snd.sfx('pickup');
    yield* c.sayT(k('thanks'), o.thanks);
    yield* c.sayT(k('clue'), o.clue);
    if (choresDone(c)) yield* c.sayT('canvas_rest.chores_done', 'Mimi is waving at you from over by the well.');
  };

  // the children come home (runs in camp, straight after the sand cave)
  function* kidsHome(c) {
    const chief = c.npc('chief'), m = c.npc('mimi_c');
    c.state.flags.mimi_at_cave = false;
    c.placeNpc(m, 14, 10, 'right'); c.showNpc('mimi_c');
    yield* c.sayT('canvas_rest.home.1', 'Word runs through the camp faster than the wind. Parents come running from every tent,\\pand Tavi, Nell and little Bo run straight into their arms.');
    yield* c.sayT('canvas_rest.home.2', 'The big desert Kigu watches from the edge of the camp, holding her herbs. One of the mothers walks over,\\ptakes her paw, and leads her over to sit with the children.');
    yield* c.approach(chief);
    yield* c.sayT('canvas_rest.home.3', 'Chief Weft: You found our children, and you brought them home without anyone getting hurt. Not even her.\\pI said sun-cloth isn\'t for strangers. You two aren\'t strangers anymore.');
    yield* c.sayT('canvas_rest.home.4', 'Chief Weft hands Mimi a folded length of sun-cloth. It\'s thin and light, and the desert heat doesn\'t get through it at all.');
    yield* c.sayT('canvas_rest.home.5', 'Mimi: There\'s enough for two! One for you, and one for me. Give me a moment. Don\'t look!');
    yield* c.ow.fadeOut(10);
    NP.snd.sfx('save');
    yield* c.wait(20);
    yield* c.ow.fadeIn(10);
    yield* c.sayT('canvas_rest.home.6', 'Mimi: Done! A sun-cloth dust scarf, with a tight weave so the grit stays out. It\'s my first design that anyone has actually worn!');
    yield* c.giveItem('dust_scarf', 1);
    yield* c.sayT('canvas_rest.home.7', 'Mimi: The nomads tie red thread on posts to mark the safe way across the Dust Bowl.\\pFollow the red, and you\'ll come out at Bobbin Quarry. I\'m staying here to sketch some more!');
    yield* c.walkTo(m, 16, 12);
    yield* c.face(m, 'down');
    yield* c.walkTo(chief, 16, 8);
    yield* c.face(chief, 'down');
  }
  NP.scripts.kids_home = kidsHome;

  const M = L.map({
    id: 'canvas_rest', name: 'Canvas Rest', music: 'town_desert', battleBg: 'desert', border: 'dune', w: W, h: H, view: 'town',
    legend: { u: 'dune', s: 'sand', C: 'cliff', d: 'track', v: 'track_v', ';': 'dry_grass' },
    fill: 'u',
  });
  M.rect(0, 0, W, 2, 'C').rect(0, 20, W, 2, 'C').rect(0, 2, 1, 18, 'C').rect(W - 1, 2, 1, 18, 'C');
  M.rect(0, 10, 1, 2, 'u').rect(W - 1, 10, 1, 2, 'u');
  M.rect(14, 15, 3, 7, 'v');                                                 // the path south to the Sun Flats (3 wide, centred on the square)
  M.rect(0, 10, W, 2, 'd');                                                  // the caravan road straight through camp
  M.building('tea_house', 6, 4, null, 'tea', 'canvas_tea');
  M.building('general_store', 21, 4, null, 'store', 'canvas_store');
  M.rect(7, 8, 3, 2, 'v').rect(22, 8, 3, 2, 'v');                           // lanes to the doors, 3 wide and centred
  M.rect(13, 12, 5, 3, 'v');                                                 // a little square by the well
  M.stamp('well', 14, 13);
  // the weavers' tents
  M.stamp('tent', 2, 14, 'red').stamp('tent', 8, 15, 'cream').stamp('tent', 19, 15, 'blue').stamp('tent', 25, 14, 'ochre').stamp('tent', 13, 3, 'green');
  M.stamp('cloth_line', 11, 8).stamp('cloth_line', 27, 8).stamp('cactus', 1, 3).stamp('cactus', 29, 3, 'plain').stamp('palm', 17, 5).stamp('barrel', 5, 9).stamp('crate', 19, 8);
  M.blob(27.5, 18.5, 1.6, 1, ';');
  // lamps on the corners where the lanes meet the road
  M.stamp('lamp', 6, 8).stamp('lamp', 25, 8);
  M.sign(12, 9, 'CANVAS REST\\nDUNE\'T FRAY!\\pWater at the well. Shade in every tent. Sand everywhere else.', 'camp sign');
  M.sign(29, 9, 'EAST: THE DUST BOWL\\nFollow the red thread.', 'east sign');
  M.spawn('west', 1, 10, 'right').spawn('east', 30, 10, 'left').spawn('south', 15, 19, 'up');
  M.edge('w', 10, 11, 'route4', 'east').edge('e', 10, 11, 'dust_bowl', 'west').edge('s', 14, 16, 'sun_flats', 'north');
  M.sign(17, 19, 'SOUTH: THE SUN FLATS\\nCactus field and spring.', 'south sign');
  M.trigger({ x: 2, y: 10, w: 1, h: 2, id: 'mimi_camp', when: (c) => !c.flag('mimi_camp_done'), script: mimiCamp });
  // nobody walks into the storm without a scarf (only a save made mid-scene can get here without one)
  M.trigger({ x: 29, y: 10, w: 1, h: 2, id: 'storm_gate', when: (c) => !c.state.bag.dust_scarf, script: function* (c) {
    yield* c.sayT('canvas_rest.storm_gate', 'A weaver: Whoa, there! You\'ll have sand in your eyes in two steps.\\pNobody crosses the Dust Bowl without a sun-cloth scarf, and only Chief Weft gives those out.');
    yield* c.walk('player', ['left', 1]);
  } });

  M.npc('mimi_c', 16, 12, 'mimi', 'down', null, { hideIf: 'mimi_at_cave', script: function* (c) {
    if (c.flag('sun_quest') && !c.flag('kids_home')) {
      if (!choresDone(c)) {
        const left = [!c.flag('chore_needles') && 'the weaver by the red tent', !c.flag('chore_herbs') && 'the healer', !c.flag('chore_journal') && 'the researcher on the east side of camp'].filter(Boolean);
        yield* c.sayT('canvas_rest.mimi.chores', 'Mimi: I\'m doing chores too! I\'ve carried so much water my arms have gone floppy.\\pYou could try ' + left.join(', and ') + '. They all need things from the Sun Flats, south of camp.');
        return;
      }
      if (!c.flag('sand_cave_found')) {
        yield* c.sayT('canvas_rest.mimi.clue1', 'Mimi: You\'re back! Look what I found, snagged on the thorns at the edge of the flats.\\pIt\'s a scrap of woven scarf, and a child\'s sandal. The scarf scrap smells of herbs.');
        yield* c.sayT('canvas_rest.mimi.clue2', 'Mimi: So let\'s put it together. Little footprints going south-east, with big soft paw prints right beside them.\\pSomeone neatly picking silver-leaf at the spring, the week little Bo had a cough.');
        yield* c.sayT('canvas_rest.mimi.clue3', 'Mimi: A big Kigu in a woven scarf, carrying something small towards the humming dune. And now this scarf.\\pIt\'s the Echo Dune, south-east on the flats! Somebody\'s taking the children there, and I don\'t think she means them any harm.');
        yield* c.sayT('canvas_rest.mimi.clue4', 'Mimi: Come on! I\'ll meet you at the Echo Dune.');
        c.set('sand_cave_found');
        c.set('mimi_at_cave');
        yield* c.ow.fadeOut(6);
        yield* c.ow.fadeIn(6);
        return;
      }
    }
    if (c.flag('herd_done')) { yield* c.sayT('canvas_rest.mimi.later', 'Mimi: The weavers asked me to make ten more scarves! TEN! For money!\\pI\'m trying very hard to act normal about it.'); return; }
    yield* c.sayT('canvas_rest.mimi.again', 'Mimi: Keep your scarf up over your nose in the storm, and follow the red thread.\\pIf you see a very proud post, you\'ve gone the wrong way.');
  } });
  M.npc('weaver1', 4, 13, 'villager_f2', 'down', null, { note: 'chore: Pricklepot needles', script: chore('needles', {
    item: 'cactus_needles', has: (c) => (c.state.bag.cactus_needles || 0) >= 3,
    flavour: 'We sew every tent twice. Once for the shade, and once for the wind.\\pYour friend asked about our seams for an hour! I liked her.',
    ask: 'Weaver Ama: You want to help? Then I need needles. We sew sun-cloth with Pricklepot spines, because nothing else gets through it.\\pThe wild Pricklepot shed them in the cactus field on the Sun Flats. Three good bundles would keep me going all season.',
    thanks: 'Weaver Ama: Oh, these are lovely and straight. Thank you. I can sew again!',
    clue: 'Weaver Ama: You\'re looking for the children too, aren\'t you? When I was out gathering spines last week, I saw small footprints\\pgoing south-east, with big soft paw prints walking right beside them. As if somebody was holding their hands.',
    after: 'Weaver Ama: Every stitch in that tent is a Pricklepot spine. Well, the last forty are.\\pWe sewed Gusset\'s big tent at the Quarry, too. If he ever says a seam has come loose, tell him I don\'t believe him.',
  }) });
  M.npc('healer', 10, 13, 'nurse_aide', 'down', null, { note: 'chore: spring herbs', script: chore('herbs', {
    item: 'desert_herbs', has: (c) => (c.state.bag.desert_herbs || 0) >= 3,
    flavour: 'I look after anyone in camp who gets sick. Mostly it\'s sunburn. Sometimes it\'s too much Dune Cocoa.',
    ask: 'Healer Josi: I\'ve run out of silver-leaf, and half the camp has a sand cough. It grows at the spring on the Sun Flats.\\pCould you bring me three handfuls? Pick it near the water, where it\'s greenest.',
    thanks: 'Healer Josi: Silver-leaf! I can make a whole pot of cough tea with this. Thank you.',
    clue: 'Healer Josi: Funny thing, though. Someone\'s been picking silver-leaf at the spring for days, very neatly, leaving the roots so it grows back.\\pNobody from camp has been out there. And little Bo had a cough the week he went missing.',
    after: 'Healer Josi: The cough tea is working. Mostly people just like the taste, I think.',
  }) });
  M.npc('researcher', 26, 12, 'scientist', 'left', null, { note: 'chore: the stolen journal', script: chore('journal', {
    item: 'field_journal', has: (c) => !!c.state.bag.field_journal,
    flavour: 'I study desert Kigu. Right now I\'m studying how much sand gets into a sandwich. The answer is "all of it".',
    ask: 'Dr. Faro: A Dunehop stole my field journal! I put it down for one second to eat a biscuit, and she hopped off with it.\\pShe lives in the burrows on the south side of the Sun Flats. Please get it back. It\'s three months of notes!',
    thanks: 'Dr. Faro: My journal! It\'s only a little bit chewed. Thank you, thank you!',
    clue: 'Dr. Faro: Wait, look at my last page. I sketched this at dusk the night the first child went missing.\\pIt\'s a big Kigu in a woven scarf, walking towards the Echo Dune with something small on her back. I thought it was a bundle of herbs.',
    after: 'Dr. Faro: I\'m writing a whole chapter on Dunehop now. Chapter title: "Why?"',
  }) });
  M.npc('chief', 16, 8, 'elder_f', 'down', null, { note: 'Chief Weft (the sun-cloth quest)', script: function* (c) {
    if (c.flag('kids_home') || (c.state.bag.dust_scarf && !c.flag('sun_quest'))) { yield* c.sayT('canvas_rest.chief.after', 'Chief Weft: Our children play by the well again, and their big friend visits every evening. She brings herbs.\\pTravel safely, and keep your scarf up in the storm.'); return; }
    yield* c.sayT('canvas_rest.chief.1', 'Chief Weft: Sun-cloth takes a whole season to weave. It keeps out the heat and the sand better than anything,\\pso we don\'t give it to strangers. I\'m sorry. Your friend\'s design is beautiful, though.');
    yield* c.sayT('canvas_rest.chief.2', 'Chief Weft: And right now, I can\'t think about scarves. Three of our children have gone missing: Tavi, Nell and little Bo.\\pOur searchers found nothing but footprints that stop at the dunes. If you hear anything, anything at all, tell me.');
    c.set('sun_quest');
  } });
  M.npc('parent', 12, 12, 'villager_f1', 'down', null, { note: 'a worried parent, then a happy one', script: function* (c) {
    if (c.flag('kids_home')) { yield* c.sayT('canvas_rest.parent.after', 'My Bo is home, and his cough is gone! That big Kigu made him herb tea every night.\\pShe can visit whenever she likes. As long as she brings him back by sunset.'); return; }
    yield* c.sayT('canvas_rest.parent.1', 'My little Bo went out to look at the cactus flowers, and he never came back.\\pThe searchers say the wind wiped out his footprints. Please, if you\'re going out on the flats, keep your eyes open.');
  } });
  M.npc('kid_tavi', 10, 18, 'camp_kid_m', 'right', ['Tavi: The big Kigu sang to us every night. She can hum like the dune!\\pShe wasn\'t scary. She just didn\'t know we had our own mums.'], { showIf: 'kids_home' });
  M.npc('kid_nell', 12, 15, 'camp_kid_f', 'down', ['Nell: She taught us how to find water under the sand. I\'m going to be a nomad when I grow up.'], { showIf: 'kids_home' });
  M.npc('kid_bo', 17, 17, 'net_kid', 'left', ['Bo: She gave me tea when I was coughing. It tasted like grass. I liked it.'], { showIf: 'kids_home' });
  M.npc('sand_friend', 12, 18, 'sand_mother', 'down', ['The big desert Kigu is sitting with the children, humming softly.\\pShe looks up at you, and nods.'], { showIf: 'kids_home', note: 'the big desert Kigu, visiting the camp' });
  M.npc('weaver2', 23, 13, 'elder_m', 'left', ['The Society wants to buy our tents and press them flat for "neat storage".\\pA flat tent is just a very expensive blanket. I told them no.']);
  M.npc('kid', 18, 12, 'child_m', 'up', ['I saw a Tumbleyarn roll past in the storm last week! She was so wrapped up in scarves that all I could see were her eyes.\\pThey only come out when the dust is blowing.'], { move: 'wander', range: 2 });
  M.npc('sharp', 28, 13, 'gentleman', 'left', null, { script: L.giver('rug', 'snack_cake', 1, {
    give: ['Mr. Sharp: Camel? No, no. I\'m a rug. Just a humble rug, minding my own business.\\pA rug that has a spare Snack Cake, as it happens. Rugs get peckish.'],
    got: ['Mr. Sharp: Off you go, and don\'t tell anyone you talked to a rug. They\'d never believe you.'],
    again: ['Mr. Sharp: I\'m still a rug. A very relaxed rug. Pay me no attention at all.'],
  }) });
  M.pickup('scent', 29, 18, 'scent_spray', 1);
  M.hidden('well', 15, 13, 'wish_candy', 1, 'something shiny at the bottom of the well');
  M.reg();

  L.tea({ id: 'canvas_tea', name: 'Tea House', exit: { to: 'canvas_rest', door: 'tea' }, guests: [
    { id: 'g1', x: 7, y: 6, look: 'hiker', dir: 'left', say: ['They serve Dune Cocoa here, with cinnamon. It\'s the best thing in the whole desert.\\pThe store sells it by the cup, if you want some for the road.'] },
    { id: 'g2', x: 2, y: 5, look: 'villager_m2', dir: 'right', say: ['I drove a slab cart for the Society once. The wheels sink, the slabs slide, and nobody says thank you.\\pNow I sell tea towels. People say thank you for tea towels.'] },
  ] }).reg();
  L.store({ id: 'canvas_store', exit: { to: 'canvas_rest', door: 'store' },
    stock: ['bond_spool', 'silk_spool', 'snack_cake', 'fancy_cake', 'dune_cocoa', 'aloe_balm', 'mint_tea', 'wake_bell', 'numb_away', 'scent_spray', 'thread_ball', 'revive_tea'],
    gated: [{ badges: 3, items: ['gold_spool'] }],
    guests: [{ id: 'shopper', x: 7, y: 5, look: 'villager_f1', dir: 'left', say: ['I always buy two Dune Cocoas. One to drink, and one to hold, because it\'s cold at night out here.'] }] }).reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
