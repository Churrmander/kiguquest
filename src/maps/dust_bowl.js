/* The Dust Bowl — open desert between Canvas Rest and Bobbin Quarry, under a dust storm most of the time (map weather 'dust':
 * battles here start in the Dust mood, and Tumbleyarn only rolls in while it blows). Levels 22-26.
 * The way across is marked by the nomads' threads: red posts lead to the Quarry; blue and yellow posts wander off to a "very proud"
 * post at a dead end (with something for your trouble); green posts lead south to the Oasis.
 * Story: a Society slab cart is stuck in the sand on the red route. Push it out (or battle its bored guard) and he grumbles where
 * the slabs go: north, to the Works. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 40, H = 30;

  function* cart(c, npc) {
    const k = (s) => 'dust_bowl.carter.' + s;
    if (c.flag('cart_pushed')) { yield* c.sayT(k('after'), 'Carter: The cart\'s rolling again, more or less. I\'ll wait for the wind to drop.\\pThe Works can wait a bit longer for its slabs. Nobody up there has ever thanked me for being on time.'); return; }
    yield* c.sayT(k('1'), 'Carter: Don\'t look at me like that. The wheel sank, so here we are.\\pI\'ve been pushing for an hour and the cart\'s moved about a thumb.');
    const r = yield* c.choose(['Help push', 'Battle him', 'Leave it'], { cancel: 2 });
    if (r === 2 || r < 0) { yield* c.sayT(k('leave'), 'Carter: Sure, leave the man with the cart. Everyone does.'); return; }
    if (r === 1) {
      yield* c.sayT(k('battle'), 'Carter: A battle? Out here? ...Fine. Anything\'s better than pushing.');
      const won = yield* c.trainerBattle({ cls: 'Presser', name: 'Carter', look: 'grunt_m', ai: 1, reward: 12, music: 'battle_society', team: L.team([['chiseltail|nibblit', 24], ['sandkit|kittabra', 24]]) });
      if (!won) return;
      yield* c.sayT(k('won'), 'Carter: You hit harder than the wind out here. Look, while we\'re both standing here,\\pyou might as well give the cart a shove. I\'ll even say please.');
    }
    yield* c.ow.fadeOut(10);
    NP.snd.sfx('ledge');
    c.set('cart_pushed');
    L.hideStamps(c);
    c.placeNpc(npc, 22, 8, 'down');
    yield* c.wait(10);
    yield* c.ow.fadeIn(10);
    yield* c.sayT(k('2'), 'Heave... HO! The wheel popped out of the sand, and the cart rolled clear.');
    yield* c.sayT(k('3'), 'Carter: Well, would you look at that. Thanks, kid.\\pThese go north to the Works. Word is, they\'re polished flat as a pond up there.');
    yield* c.sayT(k('4'), 'Carter: Pressing stone, they call it. I don\'t know what they\'re pressing,\\pand I stopped asking around the time my back started hurting. Here, for your trouble.');
    yield* c.giveItem('bond_spool', 3);
  }

  const proud = (key, lines) => function* (c) { yield* c.sayT('dust_bowl.' + key, lines); };

  const M = L.map({
    id: 'dust_bowl', name: 'The Dust Bowl', music: 'route_desert', battleBg: 'desert', border: 'cliff', w: W, h: H, view: 'street',
    weather: { dust: 80 },   // most visits; the storm lifts now and then so you can see where you've been
    legend: { u: 'dune', C: 'cliff', ';': 'dry_grass', t: 'track' },
    fill: 'C',
  });
  // corridors carved out of the sandstone (fill is cliff). The red route: west gate -> east -> north -> east -> north -> east gate
  M.rect(0, 20, 14, 3, 'u');                                         // in from Canvas Rest (rows 20-22)
  M.rect(11, 9, 4, 14, 'u');                                         // north up the first canyon
  M.rect(11, 10, 18, 3, 'u');                                        // east along the middle shelf (the stuck cart is here)
  M.rect(25, 3, 4, 10, 'u');                                         // north again
  M.rect(25, 3, 15, 3, 'u');                                         // east to the Quarry road (rows 3-5)
  // wrong ways: blue (east along the bottom to a dead end), yellow (a pocket to the north-west), green (south to the Oasis)
  M.rect(14, 21, 13, 3, 'u').rect(22, 18, 5, 8, 'u');               // blue: a bowl that ends at a proud post
  M.rect(2, 3, 13, 4, 'u').rect(6, 7, 4, 3, 'u').rect(10, 8, 1, 2, 'u');                    // yellow: up and round to the west
  M.rect(29, 10, 7, 3, 'u').rect(32, 13, 4, 17, 'u');               // green: east then south, out to the Oasis
  // wide spots get dry grass and the odd rock
  M.rect(3, 4, 5, 2, ';').rect(16, 10, 4, 2, ';').rect(23, 19, 3, 5, ';').rect(32, 15, 3, 4, ';').rect(30, 3, 5, 2, ';').rect(12, 14, 3, 4, ';');
  M.stamp('rock', 14, 12).stamp('boulder', 9, 21).stamp('rock', 26, 7).stamp('boulder', 35, 11).stamp('cactus', 3, 21).stamp('cactus', 26, 23, 'plain').stamp('cactus', 8, 4);
  // the thread posts (stamps; each one says what it is)
  const post = (x, y, colour, text) => { M.stamp('thread_post', x, y, colour); M.interact(x, y, text || ('A wooden post with a ' + colour + ' thread knotted round the top. It streams off to the east.'), colour + ' post'); };
  post(3, 20, 'red', 'A wooden post with a red thread knotted round the top.\\nThe nomads say: follow the red.'); post(11, 19, 'red'); post(14, 10, 'red'); post(25, 12, 'red'); post(28, 5, 'red'); post(37, 3, 'red');
  post(15, 23, 'blue'); post(22, 18, 'blue');
  post(10, 8, 'yellow'); post(6, 9, 'yellow');
  post(29, 12, 'green', 'A wooden post with a green thread. A painted arrow points south: OASIS.'); post(32, 14, 'green');
  // the proud posts at the dead ends
  M.stamp('thread_post', 24, 25, 'blue');
  M.interact(24, 25, proud('proud_blue', ['This isn\'t the way. It\'s just a post, and a very proud one.\\pSomeone has knotted every colour of thread round it, like medals.']), 'proud post (blue wrong way)');
  M.stamp('thread_post', 2, 3, 'yellow');
  M.interact(2, 3, proud('proud_yellow', ['Another post. It stands up very straight, as if it knows you\'re looking.\\pThe yellow thread just goes round and round it. You\'ve come the wrong way.']), 'proud post (yellow wrong way)');
  // the stuck slab cart: blocks the middle shelf until it's pushed, then sits in the alcove to the north
  // (the carter stands at the north end, against the cliff behind him, so the near cliff never hides him: owner's note)
  M.stamp('slab_cart', 20, 11, null, { goneIf: 'cart_pushed' }).stamp('slab_cart', 20, 12, null, { goneIf: 'cart_pushed' });
  M.rect(20, 7, 4, 2, 'u');                                           // the alcove the cart rolls into
  M.stamp('slab_cart', 20, 7, null, { showIf: 'cart_pushed' });
  M.npc('carter', 20, 10, 'grunt_m', 'left', null, { script: cart, note: 'stuck slab cart (help push or battle); with the cart he blocks the shelf' });

  // the road north to Route 5 and Shibuyarn: three Pressers stand on it until the Terra Button (Gusset "has a word" with them)
  M.rect(26, 0, 3, 3, 'u');
  M.npc('north1', 26, 2, 'grunt_m', 'down', ['Presser: This road is for Works traffic only, by order of the Society.\\pIt\'s a very tidy road. We\'d hate for anyone to scuff it.'], { hideIf: 'badge4', note: 'blocks the north road until badge4' });
  M.npc('north2', 28, 2, 'grunt_f', 'down', ['Presser: The foreman at the Quarry keeps glaring at us from his hut.\\pIf he comes over here, I\'m going to pretend I\'m a post.'], { hideIf: 'badge4', note: 'blocks the north road until badge4' });
  M.npc('north3', 27, 2, 'grunt_m', 'down', ['Presser: North of here is Route 5, then the big city. You\'re not allowed up there yet.\\pYou\'re not allowed up there until somebody with a Button says so.'], { hideIf: 'badge4', note: 'blocks the north road until badge4' });
  M.sign(29, 3, 'NORTH: ROUTE 5\\nPylon Road to Shibuyarn', 'north sign');
  M.spawn('north', 27, 1, 'down');
  M.spawn('west', 1, 21, 'right').spawn('east', 38, 4, 'left').spawn('south', 33, 28, 'up');
  M.edge('n', 26, 28, 'route5', 'south').edge('w', 20, 22, 'canvas_rest', 'east').edge('e', 3, 5, 'bobbin_quarry', 'west').edge('s', 32, 35, 'dust_oasis', 'north');

  M.enc('grass', [['dunehop|nibblit', 22, 25, 22], ['sandkit|kittabra', 22, 25, 20], ['stingle|chirpadee', 23, 25, 18], ['pricklepot|nibblit', 23, 25, 16], ['chiseltail|nibblit', 22, 24, 12], ['jerbix|nibblit', 25, 26, 4], ['tumbleyarn|chirpadee', 23, 25, 8]]);
  // Tumbleyarn only rolls in on the wind: without the storm, her slot goes to Dunehop
  M.def.encFilter = (list) => (NP.Weather.now === 'dust' ? list : list.map((e) => (e.sp === 'tumbleyarn' ? Object.assign({}, e, { sp: L.sp('dunehop|nibblit') }) : e)));

  M.trainer('db_t1', 11, 16, 'hiker', 'right', { cls: 'Hiker', name: 'Burl', sight: 3, reward: 13, ai: 1, team: [['chiseltail|nibblit', 23], ['tortile|kumi', 24]],
    intro: 'Can\'t see a thing in this storm! Oh, hello. Let\'s battle while we wait for it to clear.', win: 'I didn\'t see that coming. I didn\'t see anything coming.', after: 'Keep your scarf up. Sand in the teeth is no way to live.' });
  M.trainer('db_t2', 25, 8, 'picnicker', 'right', { cls: 'Nomad', name: 'Sefa', sight: 3, reward: 14, ai: 2, team: [['sandkit|kittabra', 24], ['dunehop|nibblit', 24], ['pricklepot|nibblit', 25]],
    intro: 'You followed the red thread all the way here? Then you\'ve earned a proper battle!', win: 'The red thread brought you to a proper fight, and you\'re good at it.', after: 'My grandmother tied that red thread. She tied it twice, because the wind always pulls one knot loose.' });
  M.trainer('db_t3', 24, 20, 'camper', 'left', { cls: 'Camper', name: 'Dov', sight: 3, reward: 11, ai: 1, team: [['dunehop|nibblit', 23], ['tumbleyarn|chirpadee', 24]],
    intro: 'Are you lost too? Battle me, and then we can be lost together!', win: 'Okay, I\'m still lost, but I\'m lost and impressed.', after: 'Someone told me to follow the blue thread. I think they were teasing me.' });
  M.pickup('yellow_prize', 3, 4, 'wish_candy', 1);                     // the yellow detour pays off a little
  M.pickup('blue_prize', 25, 24, 'revive_tea', 1);
  M.pickup('mid', 12, 10, 'dune_cocoa', 1);
  M.hidden('rock', 26, 7, 'silk_spool', 2, 'silk spools under a rock');
  M.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
