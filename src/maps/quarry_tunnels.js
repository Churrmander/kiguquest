/* Bobbin Quarry tunnels (2 floors) and Gusset's hut. The pre-Salon quest: the herd.
 * Pressers dug too fast and spooked a Pebbi herd, which now fills the cart tunnels. Floor 1: Pebbi sit across the side tunnels and
 * shuffle aside once their leader settles; two Pressers and a Hiker. Floor 2: the lead Boulderina has planted herself across the
 * last tunnel, with Gusset stuck behind her. You battle her; she sits down and settles, the herd follows her lead, and she picks you.
 * Then Gusset climbs out, and has tea with you in his hut: the slab orders show the slabs are Press plates.
 * After the Salon (Disc: Shove): a loose rock on floor 2 hides a crystal alcove with a Geodie in it.
 * Dark maps (`dark: true`): Skorpi can evolve down here. Levels 24-27. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;

  // ---- floor 1
  const M = L.map({
    id: 'quarry_tunnels', name: 'Quarry Tunnels', music: 'cave', battleBg: 'cave', border: 'cave_wall', w: 30, h: 22,
    indoor: true, dark: true,
    legend: { w: 'cave_wall', f: 'cave_floor', h: 'rail_h', v: 'rail_v', ';': 'dry_grass' },
    fill: 'w',
  });
  // tunnels: the main cart line runs east from the entrance, then south; side tunnels branch north and south
  M.rect(2, 16, 26, 3, 'f').rect(3, 17, 23, 1, 'h');           // the main line, in from the tunnel mouth (bottom left)
  M.rect(24, 4, 4, 15, 'f').rect(25, 5, 1, 12, 'v');            // north up the east tunnel
  M.rect(8, 4, 17, 3, 'f');                                      // the top gallery
  M.rect(8, 7, 3, 9, 'f');                                       // a side tunnel joining the gallery to the main line
  M.rect(14, 9, 7, 5, 'f');                                      // a chamber off the side tunnel (cave grass grows in the damp)
  M.rect(15, 10, 5, 3, ';');
  M.rect(2, 4, 6, 3, 'f');                                       // the stairs alcove, west end of the gallery
  M.rect(11, 11, 3, 1, 'f');
  L.stairs(M, 3, 5, 'down', 'quarry_tunnels_2', 'up');
  M.spawn('door', 3, 18, 'up').spawn('up', 4, 5, 'right');
  M.warp({ xs: [2, 3], y: 19, to: 'bobbin_quarry', door: 'tunnel', sound: 'door' });
  M.rect(2, 19, 2, 1, 'f');
  M.stamp('ore_cart', 6, 17, 'full').stamp('ore_cart', 25, 9, 'empty').stamp('rock', 12, 5).stamp('rock', 19, 13).stamp('lamp', 22, 15);
  M.sign(5, 15, 'TUNNEL 1 / CART LINE\\nMind the carts. Mind your head. Mind the Pebbi.', 'tunnel sign');
  M.enc('grass', [['pebbi|kumi', 24, 26, 34], ['slatli|kumi', 24, 26, 26], ['chippi|nibbi', 24, 25, 22], ['geodie|kumi', 25, 26, 6], ['skorpi|peepi', 24, 26, 12]]);
  // the herd: Pebbi sitting across the tunnels until Boulderina settles (each one a little joke)
  const pebbi = (id, x, y, dir, line) => M.npc(id, x, y, 'pebbi|child_f', dir, [line], { hideIf: 'herd_done', note: 'Pebbi of the herd (gone once herd_done)' });
  // three of them sit across the side tunnel (a short cut, open once the herd goes home); the way on is round by the east line
  pebbi('peb1', 8, 7, 'down', 'A Pebbi is sitting right across the tunnel. She stares at you, very firmly.\\pShe isn\'t moving until her leader says so.');
  pebbi('peb2', 9, 7, 'down', 'This Pebbi has rolled herself into a ball. "Tok," she says, which seems to mean "no".');
  pebbi('peb3', 10, 7, 'down', 'This Pebbi keeps looking down the tunnel towards the deep end, where her leader is.\\pShe\'s waiting to be told it\'s safe.');
  M.trainer('qt_t1', 16, 16, 'grunt_m', 'down', { cls: 'Presser', name: 'Rivet', sight: 3, reward: 13, ai: 1, music: 'battle_society', team: [['chippi|nibbi', 24], ['slatli|kumi', 25]],
    intro: 'We dug a little fast, all right? The quota said "faster". You can\'t argue with a quota.', win: 'I can\'t argue with you either, apparently.', after: 'The big one\'s down on the next floor. She doesn\'t like Pressers. Honestly, I can\'t blame her.' });
  M.trainer('qt_t2', 22, 4, 'grunt_f', 'down', { cls: 'Presser', name: 'Twill', sight: 2, reward: 13, ai: 1, music: 'battle_society', team: [['mittsy', 24], ['pebbi|kumi', 25], ['sandkit|mittsy', 25]],
    intro: 'This gallery is now Society property. Please exit flatly.', win: 'That was not a flat exit.', after: 'I signed the slab orders without reading them. I\'m starting to think I should have.' });
  M.trainer('qt_t3', 16, 9, 'hiker', 'down', { cls: 'Miner', name: 'Haddie', sight: 2, reward: 12, ai: 1, team: [['pebbi|kumi', 25], ['chippi|nibbi', 25]],
    intro: 'Gusset\'s my boss. If you\'re going down after him, you\'ll get past me first!', win: 'Fair enough. You\'ll do.', after: 'Tell Gusset we\'ve put the kettle on. He\'ll know what that means.' });
  M.pickup('order', 18, 5, 'slab_order', 1, 'a dropped Society slab order');
  M.pickup('cake', 26, 5, 'fancy_cake', 1);
  M.hidden('cart1', 6, 17, 'thread_ball', 1, 'a Thread Ball in the ore cart');
  M.reg();

  // ---- floor 2: the deep tunnel, Boulderina, Gusset, and (later) the geode alcove behind a loose rock
  function* boulderina(c, n) {
    if (c.flag('herd_done')) return;
    yield* c.sayT('quarry_tunnels_2.boul.1', 'A huge Boulderina has planted herself right across the tunnel.\\pThe whole herd is huddled behind her, and every one of them is watching you.');
    yield* c.sayT('quarry_tunnels_2.boul.2', 'Gusset: (from somewhere behind the herd) ...Careful. She\'s scared, not cross.\\pShow her you mean it, and she\'ll listen.');
    yield* c.emote(n, 'exclaim');
    const res = yield* c.wildBattle('boulderina', 26);
    if (res && res.fled) { yield* c.sayT('quarry_tunnels_2.boul.fled', 'Boulderina hasn\'t budged an inch.'); return; }
    c.set('herd_done');
    yield* c.ow.fadeOut(8);
    c.hideNpc(n.id);
    yield* c.ow.fadeIn(8);
    if (res && res.caught) yield* c.sayT('quarry_tunnels_2.boul.kept', 'Boulderina sat down with a thump, right in the middle of the tunnel.\\pOne by one, the Pebbi of the herd sat down beside her, and the tunnel went quiet.');
    else {
      yield* c.sayT('quarry_tunnels_2.boul.3', 'Boulderina sat down with a thump, right in the middle of the tunnel.\\pOne by one, the Pebbi of the herd sat down beside her, and the tunnel went quiet.');
      yield* c.sayT('quarry_tunnels_2.boul.4', 'After a while, Boulderina got up, dusted off her shoulders, and walked over to you.\\pShe stood at your side, as if she\'d always meant to.');
      yield* c.giveKigu('boulderina', 26);
    }
    yield* gussetOut(c);
  }

  function* gussetOut(c) {
    const g = c.npc('gusset_t');
    c.placeNpc(g, c.player.x + 1, c.player.y - 2, 'down');
    c.showNpc('gusset_t');
    yield* c.walk(g, ['down', 1]);
    yield* c.face('player', 'up');
    yield* c.sayT('quarry_tunnels_2.gusset.1', 'A dusty man in a hard hat with tiny flowers stitched round the brim climbs out of the dark.\\pHe looks at the herd, then at you, for a long moment.');
    yield* c.sayT('quarry_tunnels_2.gusset.2', 'Gusset: She chose you, and that\'s a bond worth keeping. Look after it.\\p...And thank you.');
    yield* c.sayT('quarry_tunnels_2.gusset.3', 'Gusset: The herd will walk home on their own now. Come up to my hut.\\pThere\'s tea, and there\'s something I need to show somebody.');
    yield* c.ow.fadeOut(12);
    c.hideNpc('gusset_t');
    c.ow.loadMap('quarry_hut', 4, 5, 'up', { noEnter: true });
    yield* c.wait(6);
    yield* c.ow.fadeIn(12);
    yield* NP.scripts.gusset_hut(c);
  }

  const M2 = L.map({
    id: 'quarry_tunnels_2', name: 'Quarry Tunnels B1', music: 'cave', battleBg: 'cave', border: 'cave_wall', w: 28, h: 22,
    indoor: true, dark: true,
    legend: { w: 'cave_wall', f: 'cave_floor', h: 'rail_h', v: 'rail_v', ';': 'dry_grass' },
    fill: 'w',
  });
  M2.rect(2, 3, 6, 4, 'f');                                       // stairs landing
  M2.rect(5, 6, 3, 12, 'f').rect(6, 7, 1, 10, 'v');               // down the west cart line
  M2.rect(5, 15, 18, 3, 'f').rect(7, 16, 15, 1, 'h');             // east along the bottom
  M2.rect(20, 4, 3, 14, 'f');                                     // north up to the herd
  M2.rect(15, 3, 11, 4, 'f');                                     // the deep end, where Gusset is stuck
  M2.rect(10, 8, 7, 5, 'f').rect(11, 9, 5, 3, ';');              // a damp chamber with cave grass
  M2.rect(8, 10, 2, 1, 'f');
  // the geode alcove behind a loose rock in the chamber's north doorway (Disc: Shove, after the Salon): push it up into the alcove
  M2.rect(12, 7, 1, 1, 'f').rect(9, 3, 5, 4, 'f');
  M2.stamp('shove_rock', 12, 7, 'cave');
  L.stairs(M2, 3, 4, 'up', 'quarry_tunnels', 'up');
  M2.spawn('up', 4, 4, 'right');
  M2.stamp('ore_cart', 21, 16, 'empty').stamp('rock', 17, 5).stamp('lamp', 22, 3);
  M2.enc('grass', [['pebbi|kumi', 25, 27, 34], ['slatli|kumi', 25, 27, 26], ['geodie|kumi', 25, 27, 14], ['skorpi|peepi', 25, 27, 14], ['chippi|nibbi', 25, 26, 12]]);
  M2.npc('boulderina', 20, 6, 'boulderina|elder_f', 'down', null, { script: boulderina, hideIf: 'herd_done', note: 'the lead Boulderina: battle her to settle the herd' });
  for (const [i, x, y] of [[1, 21, 6], [2, 22, 6], [3, 19, 4], [4, 23, 5]]) M2.npc('herd' + i, x, y, 'pebbi|child_f', 'down', ['A Pebbi peeks out from behind her leader. "Tok?"'], { hideIf: 'herd_done' });
  M2.npc('gusset_t', 24, 4, 'gusset|hiker', 'down', null, { hidden: true });
  M2.npc('geode', 10, 4, 'geodie|child_f', 'left', null, { hideIf: 'geode_met', gate: 'shove', note: 'the crystal alcove Kigu (static encounter, behind the loose rock)', script: function* (c, n) {
    yield* c.sayT('quarry_tunnels_2.geode.1', 'The alcove glitters violet. A sleepy-eyed Geodie blinks at you from the crystals.');
    c.set('geode_met');
    yield* c.wildBattle('geodie', 26);
    c.hideNpc(n.id);
  } });
  M2.trainer('qt2_t1', 7, 12, 'hiker', 'left', { cls: 'Miner', name: 'Clem', sight: 4, reward: 13, ai: 2, team: [['slatli|kumi', 26], ['pebbi|kumi', 26]],
    intro: 'Down here, you either battle or you go back up. There\'s no third option!', win: 'All right, all right. Third option: you win.', after: 'The geodes down here grow in the darkest corners. Some say a Kigu sleeps in one.' });
  M2.trainer('qt2_t2', 14, 15, 'grunt_m', 'down', { cls: 'Presser', name: 'Tack', sight: 2, reward: 14, ai: 2, music: 'battle_society', team: [['chippi|nibbi', 26], ['sandkit|mittsy', 26], ['silkie', 27]],
    intro: 'I\'m not lost. I\'m conducting a survey of what lost feels like.', win: 'Survey complete. Lost feels like losing.', after: 'If you see my team on the way out, tell them I said I\'m fine. Firmly.' });
  M2.pickup('spool', 12, 9, 'silk_spool', 2);
  M2.pickup('candy', 25, 6, 'wish_candy', 1);
  M2.reg();

  // ---- Gusset's hut: tea, the slab orders, and the quarry maps
  NP.scripts.gusset_hut = function* (c) {
    c.set('gusset_back');
    const g = c.npc('gusset_h');
    yield* c.sayT('quarry_hut.1', 'Gusset pours two cups of tea and pushes one across the table without a word.\\pThen he lays a stack of papers next to it. Every one has a blue Society stamp.');
    if (!c.state.bag.slab_order) yield* c.giveItem('slab_order', 1);
    yield* c.sayT('quarry_hut.2', 'Gusset: These are slab orders. We cut forty a month, flat and polished like glass, and they all get shipped north to the Works.\\pI cut those slabs myself. They told me it was pressing stone,\\pbut nobody ever said what they meant to press.');
    yield* c.sayT('quarry_hut.3', 'Gusset: Look at the size on that order. That isn\'t a floor, or a wall.\\pThose are plates for a press, and a press that big could flatten a town.');
    yield* c.sayT('quarry_hut.4', 'Gusset: Here. These are my quarry maps, every cart tunnel I ever dug.\\pIf the Society wants my stone, they can find their own way through my hill.');
    yield* c.giveItem('quarry_maps', 1);
    yield* c.sayT('quarry_hut.5', 'Gusset: And take this tape measure. It belongs to an old friend, a professor down south.\\pTell her I still have her spare one. Well, I don\'t now, do I? You do.');
    yield* c.giveItem('spare_tape', 1);
    yield* c.sayT('quarry_hut.6', 'Gusset: The Salon\'s open. Come and see me when you\'re ready.\\pI don\'t go easy on people I like.');
    c.hideNpc('gusset_h');
  };
  L.room({ id: 'quarry_hut', name: 'Foreman\'s Hut', w: 9, h: 8, doorX: 3, exit: { to: 'bobbin_quarry', door: 'hut' } })
    .stamp('table_l', 3, 3).stamp('bookshelf', 6, 0).stamp('stove', 1, 2).stamp('plant', 7, 5).stamp('chair', 4, 5)
    .npc('gusset_h', 4, 2, 'gusset|hiker', 'down', ['Gusset: ...'], { hideIf: 'gusset_back' })
    .npc('helper', 1, 5, 'hiker', 'right', ['The kettle\'s always on in here. Gusset says a quarry runs on tea and stubbornness.'])
    .reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
