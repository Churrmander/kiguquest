/* Bobbin Quarry Salon — Gusset's Terra Salon (Salon #4). Mechanic: track switches (L.switchLever). Three rail barriers cross the
 * big tent (owner's pick: the Salon is a huge striped tent at the Quarry's edge), each with two sets of points: one way leads on, the other into a siding that ends at a Society buffer ("Stop. Flat is fair.").
 * Every switch starts pointing into the siding, so you see the joke once, then pull the lever. No pushing, no ice, just switches.
 * Two Miner apprentices, then Gusset. Open once the herd is home (gusset_back). Prize: Terra Button, Linen Thread, Disc: Shove. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const w = 13, h = 16;

  function* gusset(c) {
    const st = c.state;
    if (st.badges && st.badges[3]) {
      yield* c.sayT('script.gusset.after', 'Gusset: Whatever that Press is, it\'s draining the sparks out of the cave up north.\\pGo and look, then tell me I\'m wrong.');
      return;
    }
    yield* c.sayT('script.gusset.1', 'Gusset: You found the points. Most people pull every lever at once and hope.\\pI\'m Gusset, Master Tailor of the Quarry. I cut stone, and I sew a little.\\pI don\'t talk much, so let\'s battle.');
    const won = yield* c.trainerBattle({ cls: 'Master', name: 'Gusset', look: 'gusset|hiker', ai: 2, reward: 24, master: true, music: 'battle_master', team: c.map.def.gussetTeam });
    if (!won) { yield* c.sayT('script.gusset.lose', 'Gusset: Not yet. Go and rest at the Tea House, then come back.\\pThe stone isn\'t going anywhere, and neither am I.'); return; }
    yield* c.sayT('script.gusset.2', 'Gusset: ...Solid seams. You earned this.');
    st.badges = st.badges || []; st.badges[3] = true;
    c.set('badge4');
    yield* c.jingleWait('j_button');
    yield* c.sayT('script.gusset.3', '{player} received the Terra Button!');
    yield* c.sayT('script.gusset.4', 'Gusset: Your Kigu will listen to you up to Lv50 now. Take some of my linen, too.\\pIt\'s rough, and it doesn\'t break. That\'s the best you can say about any thread.');
    yield* c.giveItem('linen_thread', 1);
    yield* c.sayT('script.gusset.5', 'Gusset: And this is Disc: Shove. A loose rock is just a rock that\'s waiting for someone to ask it nicely.\\pThere\'s one down in my tunnels, on the lower floor. See what\'s behind it.');
    yield* c.giveItem('disc_shove', 1);
    yield* c.sayT('script.gusset.6', 'Gusset: Whatever that Press is, it\'s draining the sparks out of the cave up north.\\pGo and look, then tell me I\'m wrong.');
    yield* c.sayT('script.gusset.7', 'Gusset: The road north starts at the top of the Dust Bowl. It\'ll be open by the time you get there.\\p...I may have had a word with the Pressers who were blocking it. A short word.');
  }
  NP.scripts.gusset = gusset;

  const M = L.room({ id: 'quarry_salon', name: 'Bobbin Quarry Salon', w, h, doorX: 5, floor: 'floor_wood', wall: 'wall_canvas', music: 'town_thimble', battleBg: 'gym',
    exit: { to: 'bobbin_quarry', door: 'salon' }, legend: { B: 'barrier_wood', r: 'rail_h', v: 'rail_v' } });
  // the three rail barriers (rows 12, 8, 4) and the walls that box in each siding
  M.rect(1, 12, 11, 1, 'B').rect(1, 8, 11, 1, 'B').rect(1, 4, 11, 1, 'B');
  M.rect(9, 9, 1, 3, 'B');                                        // siding 1 (east, rows 9-11) walled off from band 2
  M.rect(3, 5, 1, 3, 'B');                                        // siding 2 (west, rows 5-7)
  M.rect(8, 2, 1, 2, 'B');                                        // siding 3 (east, rows 2-3)
  // rails laid along each band, for the look of a cart hall
  M.rect(1, 13, 11, 1, 'r').rect(1, 10, 8, 1, 'r').rect(4, 6, 8, 1, 'r');
  // and the spurs that join each band to the next through its points, or run into a siding to its buffer (owner's note: the
  // rails used to stop short of each other)
  M.set(2, 11, 'v').set(10, 11, 'v').rect(10, 9, 1, 2, 'v');                     // band 1: on at x2, siding at x10
  M.set(7, 9, 'v').set(7, 7, 'v').set(2, 9, 'v').rect(2, 5, 1, 3, 'v');            // band 2: on at x7, siding at x2
  M.set(4, 5, 'v').set(4, 3, 'v').set(10, 5, 'v').rect(10, 2, 1, 2, 'v');           // band 3: on at x4, siding at x10
  // points: gate a (the way on) starts shut, gate b (into the siding) starts open
  const pts = (n, xa, xb, y) => {
    M.gate('a' + n, { cells: [[xa, y]], closed: 'B', open: 'v', flag: 'sal4_a' + n, note: 'switch ' + n + ': the way on' });
    M.gate('b' + n, { cells: [[xb, y]], closed: 'v', open: 'B', flag: 'sal4_a' + n, note: 'switch ' + n + ': into the siding' });
  };
  pts(1, 2, 10, 12); pts(2, 7, 2, 8); pts(3, 4, 10, 4);
  // gates a and b of a switch share one flag, so they always flip together; one lever per band
  L.leverStamp(M, 11, 14, 'a1').interact(11, 14, L.switchLever('a1', 'b1', 'A track switch with a red knob, marked POINTS 1.'), 'lever 1');
  L.leverStamp(M, 1, 11, 'a2').interact(1, 11, L.switchLever('a2', 'b2', 'A track switch with a red knob, marked POINTS 2.'), 'lever 2');
  L.leverStamp(M, 11, 5, 'a3').interact(11, 5, L.switchLever('a3', 'b3', 'A track switch with a red knob, marked POINTS 3.'), 'lever 3');
  // the sidings end at Society buffers
  const buffer = (x, y, n) => { M.stamp('buffer', x, y); M.interact(x, y, 'A white Society sign on the buffer says: STOP. FLAT IS FAIR.\\pSomebody has drawn a little flower on it in pencil.', 'siding ' + n + ' buffer'); };
  buffer(11, 9, 1); buffer(1, 5, 2); buffer(11, 2, 3);
  M.stamp('ore_cart', 5, 13, 'full').stamp('ore_cart', 6, 6, 'empty').stamp('slab_stack', 2, 9).stamp('plant', 1, 14);
  M.trainer('sal4_t1', 5, 11, 'hiker', 'left', { cls: 'Miner', name: 'Flint', sight: 4, reward: 12, ai: 2, team: [['chiseltail|nibblit', 26], ['tortile|kumi', 26]],
    intro: 'Gusset says I talk too much, so this is me talking less. Battle!', win: 'That\'s... a lot to take in. Quietly.', after: 'Points 2 is on the left wall. Don\'t tell Gusset I told you.' });
  M.trainer('sal4_t2', 8, 5, 'hiker', 'down', { cls: 'Miner', name: 'Mica', sight: 2, reward: 13, ai: 2, team: [['pebblump|kumi', 26], ['chiseltail|nibblit', 27], ['sandkit|kittabra', 26]],
    intro: 'Gusset trained me himself, and he never said a word the whole time!', win: 'Huh. That\'s what losing sounds like.', after: 'Gusset stitched the flowers on his hard hat himself. Don\'t mention them. He goes red.' });
  M.npc('gusset', 4, 2, 'gusset|hiker', 'down', null, { script: 'gusset', note: 'Master Tailor #4 (Terra)' });
  M.reg().gussetTeam = L.team([['quarrel|chiseltail', 27, { nature: 'adamant' }], ['mossgable|tortile', 27], ['bouldame|pebblump', 29]]);
})(typeof globalThis !== 'undefined' ? globalThis : window);
