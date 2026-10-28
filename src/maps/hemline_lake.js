/* Hemline Lake — the end of Hemline Riverside: the fishing contest grounds on the west shore, the Fishing Master's hut, a big
 * lake to paddle and fish, and the island in the middle that nobody ever reaches. Tide's big moment (there's no Tide Salon).
 *
 *  The contest (a Distraction and Diversion): 90 seconds of fishing off the dock. Your score is your three biggest fish added
 *  together, and only fish landed during the contest count. Three locals enter too. Old Wade wins every year with a score
 *  nobody can beat, so the best you can do on the dock is 2nd; the locals then tell you the rumour about the island.
 *  Each prize is given once; a finish also gives any lower prize you haven't had (2nd place gives the 3rd place prize too).
 *  Once all three are won the contest is closed to you ("Let some of the small fry have a chance at winning!").
 *    1st: the Gold Scale   2nd: 3 Wish Candies   3rd: 5 Silk Spools
 *  1st place is won by meeting Ryukoi: paddle out toward the island, get pulled under into her cave (its puddles are the
 *  cave's tall grass), beat her (she won't take a spool yet), ride her whirlpool back, and show the Master your sketch.
 *  She's the first Ryukoi, gold-scaled and ancient; she can be befriended later with a Super Rod in her cave's pool.
 *  Rare fish shown to the Master: a big reward and, the first time, the Fishing Master stamp on your Tailor Card.
 *  Lunkers (the top 5% of a fish's size range) can be traded with the Master at any time. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 32, H = 30;
  const DOCK = { x: 14, y: 17 };            // where the contest is fished from (facing east, out over the lake)
  const ISLAND = { x: 21, y: 15 };
  const PRIZES = { 1: ['gold_scale', 1], 2: ['wish_candy', 3], 3: ['silk_spool', 5] };
  const WADE_SCORE = 312;                   // Old Wade's three fish: nobody beats this on the dock

  const M = L.map({
    id: 'hemline_lake', name: 'Hemline Lake', music: 'route_meadow', battleBg: 'water', border: 'treeline', w: W, h: H, view: 'town',
    legend: { '.': 'grass', T: 'treeline', p: 'path', w: 'water', '~': 'sea', s: 'sand', b: 'bridge_h', f: 'flowers' },
  });
  M.border(2, 'T');
  M.blob(20, 15.5, 8.5, 10.5, 'w');                   // the lake
  M.rect(17, 0, 4, 6, '~');                           // the fast river comes in from Hemline Riverside (not paddleable)
  M.blob(ISLAND.x, ISLAND.y, 2.2, 1.6, 's').blob(ISLAND.x, ISLAND.y, 1.2, 0.6, '.');   // the island
  M.rect(10, 0, 3, 5, 'p').rect(4, 4, 9, 1, 'p').rect(4, 4, 1, 21, 'p');               // the road in, and down the west shore
  M.rect(4, 11, 3, 2, 'p');                           // lane to the hut door (x5), off the shore road
  M.rect(5, 17, 6, 1, 'p').rect(11, 17, 4, 1, 'b');  // the dock
  M.rect(2, 2, 2, 1, 'f').rect(6, 22, 3, 1, 'f').rect(26, 3, 2, 1, 'f');

  M.building('house_s', 3, 8, 'blue', 'hut', 'lake_hut');
  M.stamp('tent', 5, 19, 'blue');
  M.sign(9, 5, 'HEMLINE LAKE\\nContest grounds: this way!', 'lake sign');
  M.sign(9, 10, 'FISHING MASTER\\nContest entry, rare fish, lunker trades.', 'hut sign');
  M.trees([[2, 8], [2, 14], [7, 24], [27, 2], [24, 26], [ISLAND.x - 1, ISLAND.y - 1]]);
  M.stamp('bench', 6, 15).stamp('barrel', 9, 14).stamp('crate', 10, 14).stamp('rock', 28, 26).stamp('bush', 11, 24);
  M.spawn('north', 11, 2, 'down').spawn('grounds', 5, 12, 'down').spawn('dock', DOCK.x, DOCK.y, 'right');
  M.edge('n', 10, 12, 'hemline_river', 'south');

  M.enc('water', [['kerochapu', 14, 18, 40], ['waddlecoat', 14, 18, 35], ['jellybob', 14, 18, 25]]);
  M.def.fishing = {
    water: 'fresh',
    kigu: { 1: [['gilfin', 10, 14, 50], ['kiskat', 10, 14, 50]], 2: [['kiskat', 16, 22, 40], ['zeel', 16, 22, 30], ['gilfin', 16, 22, 30]], 3: [['slickish', 32, 38, 35], ['zeel', 32, 38, 35], ['gilfin', 32, 38, 30]] },
  };

  // ---- the island: paddle close and something pulls you under (before you've met her); afterwards, a swirl you can dive into
  const nearIsland = (x, y) => Math.hypot((x - ISLAND.x) / 1.2, y - ISLAND.y) <= 3.4;
  for (const [x, y] of M.cells('w', ISLAND.x - 5, ISLAND.y - 5, 11, 11)) {
    if (!nearIsland(x, y)) continue;
    M.trigger({ x, y, id: 'island', when: (c) => !c.flag('ryukoi_met') && c.ow.paddling(), script: 'lake_pulled_under' });
  }
  M.interact(ISLAND.x - 3, ISLAND.y, 'lake_swirl', 'the swirl west of the island (back down to Ryukoi\'s cave once you\'ve met her)');

  // ---- the people at the grounds
  M.npc('wade', 10, 16, 'elder_m', 'right', null, { script: 'lake_wade', note: 'Old Wade, who wins the contest every year' });
  M.npc('pip', 7, 18, 'child_m', 'right', ['Pip: I\'m entering the contest again! Last year I landed a Bluegill THIS big.\\p...Okay, it was this big. But it was very fierce.']);
  M.npc('coral', 10, 21, 'lady', 'up', ['Coral: Old Wade wins every year. Every single year!\\pThey say he fishes by the island in the middle of the lake, where the best fish live.\\pNobody else has ever got near it. The water just won\'t let you.']);
  M.npc('buyer', 3, 17, 'cook', 'right', null, { script: 'fish_buyer', note: 'buys fish from the Fish Pocket (bigger pays more)' });
  M.pickup('spool', 27, 24, 'silk_spool', 1);
  M.reg();

  // ------------------------------------------------------------------------------------ the Fishing Master's hut
  L.room({ id: 'lake_hut', name: 'Fishing Master\'s Hut', w: 9, h: 8, doorX: 3, floor: 'floor_wood', exit: { to: 'hemline_lake', door: 'hut' } })
    .stamp('display_case', 1, 2).stamp('bookshelf', 6, 0).stamp('table_s', 6, 4).stamp('plant', 7, 6)
    .npc('master', 4, 3, 'fisher', 'down', null, { script: 'fishing_master', note: 'the Fishing Master: contest, rare fish, lunkers, the Ryukoi sketch' })
    .interact(1, 2, 'A stuffed Sturgeon as long as a bed. The plaque says: "THE ONE THAT DIDN\'T GET AWAY."', 'trophy fish')
    .spawn('master', 4, 4, 'up')
    .reg();

  // ------------------------------------------------------------------------------------ Ryukoi's cave (under the lake)
  const C = L.map({
    id: 'ryukoi_cave', name: 'Underwater Cave', music: 'cave', battleBg: 'cave', border: 'cave_wall', w: 20, h: 16, indoor: true, dark: true,
    legend: { C: 'cave_wall', '.': 'cave_floor', ':': 'puddle', o: 'cave_pool' }, fill: '.',
  });
  C.ascii(0, 0, [
    'CCCCCCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCCCCCCCCC',
    'CCCCCCooooooooCCCCCC',   // her pool, at the back of the cave
    'CCCCCooooooooooCCCCC',
    'CCCCC..oooooo..CCCCC',
    'CCCC............CCCC',
    'CCC..::::..::::..CCC',
    'CCC..::::..::::..CCC',
    'CCC::::........::CCC',
    'CCC::::..::::..::CCC',
    'CCC......::::....CCC',
    'CCC..::.......::.CCC',
    'CCC......oo......CCC',   // the landing pool: its current runs back up to the surface
    'CCCC....oooo....CCCC',
    'CCCCCCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCCCCCCCCC',
  ]);
  C.spawn('landing', 9, 11, 'up');
  C.enc('puddle', [['gilfin', 12, 16, 60], ['kiskat', 12, 16, 40]]);
  C.def.fishing = {
    water: 'fresh',
    kigu: { 1: [['gilfin', 12, 16, 70], ['kiskat', 12, 16, 30]], 3: [['gilfin', 35, 40, 70], ['slickish', 35, 40, 30]] },
    extra: [{ item: 'gold_scale', chance: 1 / 100, rod: 2 }],   // Ryukoi's shed scales, now and then (Good Rod or better)
    legend: { rod: 3, sp: 'ryukoi', lv: 50, chance: 0.25, flag: 'ryukoi_joined', needs: 'ryukoi_met', music: 'battle_master',
      kigu: { alt: true, ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 } },
      after: 'Ryukoi slipped back into the deep. She looked pleased with the challenge.' },
  };
  for (const [x, y] of [[9, 12], [10, 12], [8, 13], [9, 13], [10, 13], [11, 13]]) C.interact(x, y, 'cave_current', 'the landing pool: ride the current back up');
  for (let x = 6; x <= 13; x++) C.trigger({ x, y: 5, id: 'ryukoi', when: (c) => !c.flag('ryukoi_beaten'), script: 'ryukoi_rises' });
  C.reg();

  // ------------------------------------------------------------------------------------ scripts
  const S = NP.scripts, F = () => NP.Fishing;
  const k = (s) => 'hemline_lake.' + s;

  S.lake_pulled_under = function* (c) {
    yield* c.sayT(k('tug.1'), 'You feel something tugging at your feet...');
    yield* c.emote('player', 'exclaim');
    NP.snd.sfx('splash');
    yield* c.sayT(k('tug.2'), 'Something pulled {player} under the water!');
    c.set('ryukoi_met');
    yield* c.warp('ryukoi_cave', 9, 11, 'up');
    yield* c.sayT(k('tug.3'), '...{player} came up in a cave under the lake! There\'s air down here, and puddles everywhere.');
  };
  S.lake_swirl = function* (c) {
    if (!c.flag('ryukoi_met')) { yield* c.sayT(k('swirl.0'), 'The water is very still here. Too still.'); return; }
    if (!c.ow.paddling()) { yield* c.sayT(k('swirl.far'), 'The water swirls gently out there.'); return; }
    if (yield* c.ask('The water swirls gently here. It\'s the way down to Ryukoi\'s cave.\\nDive down?')) {
      NP.snd.sfx('splash');
      yield* c.warp('ryukoi_cave', 9, 11, 'up');
    }
  };
  S.cave_current = function* (c) {
    if (yield* c.ask('A strong current swirls up toward the surface.\\nRide it back up?')) {
      NP.snd.sfx('splash');
      yield* c.warp('hemline_lake', 5, 12, 'down');
    }
  };

  /** Ryukoi rises from her pool. She won't take a spool yet: the first one is slapped away, later ones she just ignores. */
  S.ryukoi_rises = function* (c) {
    yield* c.face('player', 'up');
    yield* c.sayT(k('ryu.1'), 'The water in the pool begins to glow gold...');
    yield* c.emote('player', 'exclaim');
    yield* c.sayT(k('ryu.2'), 'A Kigu with shining gold scales rose out of the water!\\pShe looks very, very old. And very, very sure of herself.');
    const ivs = { hp: 20, atk: 20, def: 20, spa: 20, spd: 20, spe: 20 };
    const res = yield* c.wildBattle('ryukoi', 18, { bg: 'cave', music: 'battle_master', canLose: true,
      noCatch: { first: 'She deftly slaps away the spool!', again: 'It seems this Kigu doesn\'t want to bond with you...' },
      kigu: { alt: true, ivs, moves: ['fin_flap', 'pounce', 'aqua_dash', 'koi_rush'] } });
    if (res && res.winner === 0) {
      c.set('ryukoi_beaten');
      yield* c.sayT(k('ryu.win.1'), 'Ryukoi gave {player} a nod of approval.');
      yield* c.sayT(k('ryu.win.2'), 'She swished her tail, and her pool began to spin into a whirlpool!');
      NP.snd.sfx('splash');
      yield* c.sayT(k('ryu.win.3'), '{player} jumped into the whirlpool!');
      yield* c.warp('hemline_lake', 5, 12, 'down');
      yield* c.sayT(k('ryu.win.4'), '...and came up right by the contest grounds!\\pYou have her in your Sketchbook now. Better show the Fishing Master!');
      return;
    }
    if (res && res.winner === 1) return;   // she won: you wake up in a Tea House (canLose)
    yield* c.sayT(k('ryu.fled'), 'Ryukoi sank back into her pool. She\'ll be waiting.');
    yield* c.walk('player', ['down']);
  };

  S.lake_wade = function* (c) {
    if (c.flag('fc_prize1')) {
      yield* c.sayT(k('wade.after'), 'Old Wade: So you met her. I fished by her cave for fifty years, and she never once came up for me.\\pShe chose well. Don\'t tell her I said that.');
      return;
    }
    yield* c.sayT(k('wade.1'), 'Old Wade: Eh? You want to know my secret?\\pThe best fish in this lake swim round the island. Bigger than anything off the dock.\\pHow I get out there is my business, youngster.');
  };

  // ---- the Fishing Master
  S.fishing_master = function* (c) {
    const st = F().st();
    yield* c.sayT(k('m.hi'), 'Master: Welcome, welcome! I\'m the Fishing Master, and this is my hut.\\pWhat can I do for you?');
    for (;;) {
      const opts = [];
      if (c.flag('ryukoi_beaten') && !c.flag('fc_prize1')) opts.push(['sketch', 'Show my sketch']);
      opts.push(['contest', 'Enter the contest']);
      if (st.pocket.some((e) => NP.data.fish[e.id].rare && !e.shown)) opts.push(['rare', 'Show a rare fish']);
      if (st.pocket.some((e) => F().isLunker(e))) opts.push(['lunker', 'Trade a lunker']);
      opts.push(['bye', 'Bye']);
      const i = yield* c.choose(opts.map((o) => o[1]));
      const what = i < 0 ? 'bye' : opts[i][0];
      if (what === 'bye') break;
      if (what === 'contest') { if (yield* S.contest_enter(c)) return; }
      else if (what === 'rare') yield* S.master_rare(c);
      else if (what === 'lunker') yield* S.master_lunker(c);
      else if (what === 'sketch') yield* S.master_sketch(c);
    }
    yield* c.sayT(k('m.bye'), 'Master: Tight lines!');
  };

  /** give every prize from `place` down that hasn't been given yet */
  function* prizes(c, place) {
    for (let p = place; p <= 3; p++) {
      if (c.flag('fc_prize' + p)) continue;
      c.set('fc_prize' + p);
      yield* c.giveItem(PRIZES[p][0], PRIZES[p][1]);
    }
  }

  S.contest_enter = function* (c) {
    if (c.flag('fc_prize1') && c.flag('fc_prize2') && c.flag('fc_prize3')) {
      yield* c.sayT(k('m.closed'), 'Master: Whoa there, Master Angler! Let some of the small fry have a chance at winning!');
      return false;
    }
    if (!F().rodTier()) { yield* c.sayT(k('m.norod'), 'Master: You\'ll need a rod to enter, youngster. Gus on Route 2 has more rods than sense.'); return false; }
    yield* c.sayT(k('m.rules'), 'Master: Here\'s how it works. You fish off the end of the dock for 90 seconds.\\pYour three biggest fish are added together, and that\'s your score.\\pOnly fish you land during the contest count! No Kigu bite on the dock, either. We keep it fair.');
    if (!(yield* c.ask('Master: Ready to fish?'))) return false;
    yield* c.warp('hemline_lake', DOCK.x, DOCK.y, 'right');
    yield* c.sayT(k('m.go'), 'Master: Ready... set... FISH!');
    c.ow.contest = { t: F().CONTEST_FRAMES, catches: [], over: false, end: 'contest_end' };
    return true;
  };

  S.contest_end = function* (c) {
    const ow = c.ow, mine = F().contestScore(ow.contest.catches);
    ow.contest = null;
    NP.snd.sfx('save');
    yield* c.sayT(k('end.1'), 'Master: TIME\'S UP! Rods down, everyone!');
    yield* c.warp('lake_hut', 4, 4, 'up');
    const rng = NP.rng;
    const field = [{ who: 'Old Wade', cm: WADE_SCORE }, { who: 'Pip', cm: 80 + rng.int(41) }, { who: 'Coral', cm: 45 + rng.int(31) }, { who: '{player}', cm: mine, me: true }];
    field.sort((a, b) => b.cm - a.cm || (a.me ? 1 : -1));   // a tie goes to the local
    const place = field.findIndex((e) => e.me) + 1;
    yield* c.say('Master: Here are the results!\\p' + field.map((e, j) => (j + 1) + '. ' + e.who + ', ' + e.cm + ' cm').slice(0, 2).join('\\n') + '\\p' + field.map((e, j) => (j + 1) + '. ' + e.who + ', ' + e.cm + ' cm').slice(2).join('\\n'));
    if (place <= 3 && !c.flag('fc_prize' + place)) {
      yield* c.say('Master: ' + ['', '', 'Second place goes to {player}!', 'Third place goes to {player}!'][place]);
      yield* prizes(c, place);
    } else if (place <= 3) yield* c.say('Master: Well fished! You\'ve already had that prize, though.');
    else yield* c.sayT(k('end.4th'), 'Master: Not this time, youngster. Better luck next time!');
    if (!c.flag('fc_prize1')) {
      yield* c.sayT(k('end.wade'), 'Master: And Old Wade wins again, with three enormous fish.\\pNobody can work out where he catches them. He says the island, but nobody can get near it.');
    }
  };

  S.master_rare = function* (c) {
    const e = yield* F().pickFish(c, (q) => NP.data.fish[q.id].rare && !q.shown, 'Master: A rare fish? Let\'s have a look!');
    if (!e) return;
    const d = NP.data.fish[e.id];
    e.shown = true;
    yield* c.say('Master: Well, I\'ll be... a ' + d.name + '! ' + e.cm + ' cm of it!\\pI\'ve only ever seen a drawing of one of these.');
    if (!c.flag('stamp_fishing_master')) {
      c.set('stamp_fishing_master');
      yield* c.jingleWait('j_key_item');
      yield* c.sayT(k('m.stamp'), 'Master: That earns you the Fishing Master stamp! Hand me your Tailor Card.\\p...There! Every angler in Tsumugi will know what you\'ve done.\\p{player}\'s Tailor Card got the Fishing Master stamp!');
    }
    NP.state.money += d.reward;
    NP.snd.sfx('save');
    yield* c.say('Master: And here\'s $' + d.reward + ' for the privilege. Keep the fish, of course!\\p{player} received $' + d.reward + '!');
  };

  S.master_lunker = function* (c) {
    const e = yield* F().pickFish(c, (q) => F().isLunker(q), 'Master: A lunker? Show me!');
    if (!e) return;
    const d = NP.data.fish[e.id], prize = [null, ['silk_spool', 2], ['gold_spool', 1], ['wish_candy', 1]][d.rod];
    yield* c.say('Master: Now THAT is a ' + d.name + '! ' + e.cm + ' cm!\\pI\'ll trade you for it. How about ' + (prize[1] > 1 ? prize[1] + ' ' + NP.data.items[prize[0]].name + 's' : 'a ' + NP.data.items[prize[0]].name) + '?');
    if (!(yield* c.ask('Trade the ' + d.name + '?'))) return;
    F().take(e);
    yield* c.giveItem(prize[0], prize[1]);
  };

  S.master_sketch = function* (c) {
    yield* c.sayT(k('m.sk.1'), 'Master: What\'s that? You met something under the lake?\\pShow me your Sketchbook...');
    yield* c.emote('master', 'exclaim');
    yield* c.sayT(k('m.sk.2'), 'Master: Gold scales... whiskers like ribbons... That\'s her. That\'s the first Ryukoi!\\pLong ago, a little Gilfin saw something shiny at the top of a waterfall.\\pShe swam up it for months, and at the top she found a golden scale. It made her into the very first Ryukoi.\\pThey say she grows new scales, and gives one to any Gilfin that makes it up the waterfall.');
    yield* c.sayT(k('m.sk.3'), 'Master: Old Wade! Pip! Coral! Come and look at this!\\p...Everyone agrees: getting up close and personal with a legendary Kigu beats any fish.\\pFirst prize goes to {player}!');
    yield* prizes(c, 1);
    yield* c.sayT(k('m.sk.4'), 'Master: That Gold Scale is one of hers. Give it to a Gilfin of Lv30 or more and she\'ll evolve into a Ryukoi.\\pAny other Kigu holding it lands critical hits with Tide moves more often.\\pAnd if you\'re ever back with a Super Rod... well. She might just take a spool from you then.');
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
