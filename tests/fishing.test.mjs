// Fishing (2026-10-26): data, Gus's rod and Fish Pocket, casting with real key input (Select, the "!", A), the Fish Pocket and
// Fishing Log, the Tea House cook and meal boosts, the Gold Scale (Tide crits, Gilfin's evolution), the contest's prizes, and
// Ryukoi (pulled under at the island, her cave, the spool she won't take).
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

function fresh(seed) {
  const t = boot(seed);
  const { NP } = t;
  const ow = NP.quickStart('Ren', 'f');
  const st = NP.state;
  Object.assign(st.flags, { intro_done: true, has_starter: true, tomo_left_lab: true, route2_open: true, route2_insp_done: true });
  st.party.push(NP.Kigu.create('konko', 40, { ot: 'Ren' }));
  ow.msg.close(); ow.tasks = [];
  return { t, NP, ow, st };
}
const settle = (t) => assert.ok(t.mash(() => t.idle(), 3000), 'script finished');
function said(NP) {   // record every overworld line
  const lines = [];
  const say0 = NP.Overworld.prototype.say;
  NP.Overworld.prototype.say = function* (text, o) { lines.push(NP.fmt(String(text))); yield* say0.call(this, text, o); };
  return lines;
}
const run = (t, ow, fn) => { ow.runScript(fn); settle(t); };

// ------------------------------------------------------------------ data
{
  const { NP } = fresh(1);
  const F = NP.Fishing, I = NP.art.icons;
  for (const id of NP.data.fishIds) {
    const d = NP.data.fish[id];
    assert.ok(d.min < d.max && d.rod >= 1 && d.rod <= 3, id + ' size/rod');
    if (d.dish) assert.ok(NP.data.items[d.dish], id + ' dish ' + d.dish);
    assert.ok(I.has('item', 'fish_' + id), id + ' has an icon');
  }
  let spots = 0;
  for (const [id, def] of Object.entries(NP.maps)) {
    const f = def.fishing;
    if (!f) continue;
    spots++;
    for (const r of Object.keys(f.kigu || {})) for (const [sp] of f.kigu[r]) {
      assert.ok(NP.data.species[sp], id + ' rod ' + r + ': ' + sp);
      assert.ok(NP.data.species[sp].types.includes('tide'), id + ': rods only hook Tide Kigu (' + sp + ')');
    }
    for (const e of f.extra || []) assert.ok(NP.data.items[e.item], id + ' extra ' + e.item);
    assert.ok(F.fishFor(Object.assign({ water: f.water }, f), id, 3, false).length, id + ' has fish to land');
  }
  assert.ok(spots >= 11, 'fishing spots: ' + spots);
  // fresh and salt never mix; the oasis only has pupfish; the oasis pupfish takes an Old Rod (the Good Rod's payoff)
  assert.ok(F.fishFor({ water: 'salt' }, 'button_town', 3, false).every((f) => f.water === 'salt'));
  assert.equal(F.fishFor(NP.maps.dust_oasis.fishing, 'dust_oasis', 1, false).map((f) => f.id).join(), 'desert_pupfish');
  assert.ok(!F.fishFor({ water: 'fresh' }, 'route1', 3, false).some((f) => f.id === 'desert_pupfish'), 'pupfish live only in the desert');
  // lunkers and prices
  const big = { id: 'catfish', cm: 90 }, small = { id: 'catfish', cm: 30 };
  assert.ok(F.isLunker(big) && !F.isLunker(small));
  assert.ok(F.price(big) > F.price(small) * 2);
}

// ------------------------------------------------------------------ Gus, then casting on Route 2
{
  console.log('>> gus + casting');
  const { t, NP, ow, st } = fresh(7);
  const F = NP.Fishing, lines = said(NP);
  ow.loadMap('route2', 10, 17, 'down', { noEnter: true });
  t.tick(3);
  run(t, ow, 'gus_rod');
  assert.equal(st.bag.old_rod, 1, 'Gus gave the Old Rod');
  assert.equal(st.bag.fishing_log, 1, 'and the Fishing Log');
  assert.ok(st.flags.fish_pocket, 'and sewed on the Fish Pocket');
  assert.ok(lines.some((l) => l === '...Don\'t ask how that works.'));
  assert.equal(F.rodTier(), 1);

  assert.ok(t.travel(10, 22, 300), 'onto the bridge');
  t.tap('left'); t.tick(8);   // face the river
  assert.equal(ow.player.dir, 'left');
  const K0 = F.KIGU_CHANCE, N0 = F.NIBBLE;
  F.KIGU_CHANCE = [0, 0, 0, 0]; F.NIBBLE = 0;
  // pressing A before the bite scares the fish off
  t.tap('select'); t.tick(10);
  assert.ok(ow.bobber, 'the float is out');
  t.tap('a');
  settle(t);
  assert.equal(st.fish.pocket.length, 0, 'too early: nothing landed');
  assert.ok(lines.some((l) => /reeled in too soon/.test(l)));
  // a proper cast: wait for the "!", then A
  let landed = 0;
  for (let i = 0; i < 6; i++) {
    t.tap('select');
    let g = 0;
    while (!(ow.bobber && ow.bobber.bite) && g++ < 400) t.tick(1);
    assert.ok(ow.bobber && ow.bobber.bite, 'a bite');
    assert.equal(ow.player.emote, 'exclaim');
    t.tap('a');
    settle(t);
    landed = st.fish.pocket.length;
  }
  assert.equal(landed, 6, 'six fish in the Fish Pocket');
  assert.ok(st.fish.pocket.every((e) => NP.data.fish[e.id].water === 'fresh' && NP.data.fish[e.id].rod === 1), 'Old Rod, fresh water: ' + st.fish.pocket.map(F.label));
  const logged = Object.values(st.fish.log).reduce((a, r) => a + r.n, 0);
  assert.equal(logged, 6, 'all six in the Fishing Log');
  assert.ok(Object.values(st.fish.log).every((r) => r.where === 'route2' && r.best > 0));
  // missing the "!" lets it go
  t.tap('select');
  let g = 0;
  while (!(ow.bobber && ow.bobber.bite) && g++ < 400) t.tick(1);
  t.tick(F.HOOK_FRAMES + 4);
  settle(t);
  assert.equal(st.fish.pocket.length, 6, 'missed: nothing landed');
  assert.ok(lines.some((l) => l === 'It got away...'));
  // a Kigu on the line starts a wild battle (rods only hook fish-based Tide Kigu)
  F.KIGU_CHANCE = [0, 1, 1, 1];
  t.tap('select');
  g = 0;
  while (!(ow.bobber && ow.bobber.bite) && g++ < 400) t.tick(1);
  t.tap('a');
  t.mash(() => t.top() !== ow, 900);
  const bs = t.top();
  assert.ok(bs instanceof NP.BattleScene, 'a wild battle');
  assert.ok(['gilfin', 'kiskat'].includes(bs.cfg.foe[0].species), 'Route 2, Old Rod: ' + bs.cfg.foe[0].species);
  assert.equal(bs.cfg.bg, 'water');
  F.KIGU_CHANCE = K0; F.NIBBLE = N0;
  t.mash(() => t.top() === ow && t.idle(), 20000);
  // no water in front: no cast
  ow.loadMap('route2', 10, 30, 'down', { noEnter: true });
  t.tick(3);
  t.tap('select'); settle(t);
  assert.ok(!ow.bobber && lines.some((l) => /no water here/.test(l)));

  // the Bag: a Fish pocket, the rod used from it, and the Fishing Log
  const bag = new NP.BagScene({ mode: 'field' });
  NP.Game.push(bag); t.tick(2);
  bag.pocket = 3;
  assert.equal(bag.list().length, 6, 'the Fish pocket lists the fish');
  assert.ok(bag.list().every((it) => it.fish && /cm$/.test(it.d.name)));
  NP.Game.pop(); t.tick(2);
  const log = new NP.FishLogScene();
  NP.Game.push(log); t.tick(3); t.tap('b'); t.tick(3);
  assert.notEqual(t.top(), log, 'the Fishing Log closes');

  // selling: a shop buys fish (bigger pays more)
  const before = st.money, first = st.fish.pocket[0], price = F.price(first);
  const shop = new NP.ShopScene(['bond_spool']);
  NP.Game.push(shop); t.tick(2);
  t.tap('down'); t.tap('down'); t.tap('a'); t.tick(4);   // Sell fish
  t.tap('a'); t.tick(4);                                  // the first fish
  assert.equal(st.money, before + price, 'sold for its price');
  assert.equal(st.fish.pocket.length, 5);
  t.tap('b'); t.tick(4); t.tap('b'); t.tick(4);
}

// ------------------------------------------------------------------ the Tea House cook, meals, the Gold Scale
{
  console.log('>> cook, meals, gold scale');
  const { t, NP, ow, st } = fresh(9);
  const F = NP.Fishing;
  st.flags.fish_pocket = true;
  st.fish.pocket.push({ id: 'mackerel', cm: 30 }, { id: 'catfish', cm: 89 });   // the catfish is a lunker: two dishes
  ow.loadMap('hemline_tea', 5, 6, 'up', { noEnter: true });
  t.tick(3);
  run(t, ow, 'tea_cook');
  assert.equal(st.fish.pocket.length, 0, 'both fish cooked');
  assert.equal(st.bag.mackerel_onigiri, 1);
  assert.equal(st.bag.bass_stew, 2, 'a lunker makes two dishes');
  // a meal: heals, and her next battle starts with the boost
  const k = st.party[0];
  const r = NP.Items.apply('mackerel_onigiri', k);
  assert.ok(/raring to go/.test(r.text) && k.meal && k.meal.atk === 1);
  assert.equal(NP.Items.why('mackerel_onigiri', k), '', 'a meal is welcome even at full HP');
  const B = NP.Battle;
  const bt = new B.Battle({ wild: true, rng: new NP.RNG(3), sides: [{ player: true, party: [k] }, { party: [NP.Kigu.create('nibblit', 5)] }] });
  const ev = bt.begin().events;
  assert.equal(bt.sides[0].active[0].boosts.atk, 1, 'meal boost at the start of battle');
  assert.equal(k.meal, undefined, 'the meal is used up');
  assert.ok(ev.some((e) => e.t === 'msg' && /full of energy from her meal/.test(e.text)));
  // the Gold Scale: inspires her, +1 crit stage on Tide moves only; Gilfin evolves holding it at Lv30+
  const holder = NP.Kigu.create('ottelia', 20, { item: 'gold_scale' });
  const bt2 = new B.Battle({ wild: true, rng: new NP.RNG(3), sides: [{ player: true, party: [holder] }, { party: [NP.Kigu.create('nibblit', 5)] }] });
  assert.ok(bt2.begin().events.some((e) => e.t === 'msg' && /is inspired by the scale she's holding!/.test(e.text)));
  const mon = bt2.sides[0].active[0];
  assert.equal(bt2.chain('modCritStage', mon, 0, { move: NP.data.moves.bubble_pop }), 1, 'Tide move: +1 crit stage');
  assert.equal(bt2.chain('modCritStage', mon, 0, { move: NP.data.moves.pounce }), 0, 'other moves: no change');
  const gil = (lv, item) => NP.Kigu.create('gilfin', lv, { item });
  assert.equal(NP.Kigu.evolutionFor(gil(30, 'gold_scale'), { trigger: 'level' }).to, 'ryukoi');
  assert.equal(NP.Kigu.evolutionFor(gil(30, null), { trigger: 'level' }), null, 'no scale: she stays a Gilfin');
  assert.equal(NP.Kigu.evolutionFor(gil(29, 'gold_scale'), { trigger: 'level' }), null, 'not before Lv30');
  // Ryukoi won't take a spool yet: the first is slapped away, the rest are ignored
  const foe = NP.Kigu.create('ryukoi', 18, { alt: true });
  const bt3 = new B.Battle({ wild: true, rng: new NP.RNG(3), noCatch: { first: 'She deftly slaps away the spool!', again: 'It seems this Kigu doesn\'t want to bond with you...' },
    sides: [{ player: true, party: [NP.Kigu.create('konko', 30)] }, { party: [foe] }] });
  bt3.begin();
  B.throwSpool(bt3, bt3.sides[0].active[0], { item: 'master_spool' });
  B.throwSpool(bt3, bt3.sides[0].active[0], { item: 'master_spool' });
  const msgs = bt3.drain().filter((e) => e.t === 'msg').map((e) => e.text);
  assert.equal(msgs.join(' | '), 'She deftly slaps away the spool! | It seems this Kigu doesn\'t want to bond with you...');
  assert.ok(!bt3.caught);
}

// ------------------------------------------------------------------ the contest and the Fishing Master
{
  console.log('>> contest');
  const { t, NP, ow, st } = fresh(11);
  const F = NP.Fishing, lines = said(NP);
  st.bag.old_rod = 1; st.flags.fish_pocket = true;
  ow.loadMap('hemline_lake', DOCKX(NP), 17, 'right', { noEnter: true });
  t.tick(3);
  // a 270 cm haul beats Pip and Coral but never Old Wade: 2nd place, which also gives the 3rd place prize
  ow.contest = { t: 30, catches: [100, 90, 80, 5], over: false, end: 'contest_end' };
  t.tick(40);
  settle(t);
  assert.equal(ow.map.id, 'lake_hut');
  assert.ok(!ow.contest, 'the contest is over');
  assert.ok(lines.some((l) => /2\. Ren, 270 cm/.test(l)), 'Ren came 2nd: ' + lines.filter((l) => /cm/.test(l)).join(' | '));
  assert.ok(lines.some((l) => /1\. Old Wade/.test(l)), 'Old Wade wins');
  assert.equal(st.bag.wish_candy, 3, '2nd place: 3 Wish Candies');
  assert.equal(st.bag.silk_spool, 5, 'and the unclaimed 3rd place prize');
  assert.ok(st.flags.fc_prize2 && st.flags.fc_prize3 && !st.flags.fc_prize1);
  assert.ok(lines.some((l) => /the island/.test(l)), 'the island rumour');
  // the same again: nothing new
  ow.contest = { t: 5, catches: [100, 90, 80], over: false, end: 'contest_end' };
  t.tick(10); settle(t);
  assert.equal(st.bag.wish_candy, 3);
  assert.ok(lines.some((l) => /already had that prize/.test(l)));
  // the sketch of Ryukoi wins 1st: the Gold Scale; then the contest is closed
  st.flags.ryukoi_beaten = true;
  run(t, ow, NP.scripts.master_sketch);
  assert.equal(st.bag.gold_scale, 1);
  assert.ok(st.flags.fc_prize1);
  run(t, ow, function* (c) { yield* NP.scripts.contest_enter(c); });
  assert.ok(lines.some((l) => l === 'Master: Whoa there, Master Angler! Let some of the small fry have a chance at winning!'));
  // a rare fish: the stamp the first time, and a reward; the same fish can't be shown twice
  st.fish.pocket.push({ id: 'gold_carp', cm: 60 });
  const m0 = st.money;
  run(t, ow, NP.scripts.master_rare);
  assert.ok(st.flags.stamp_fishing_master, 'Fishing Master stamp');
  assert.equal(st.money, m0 + NP.data.fish.gold_carp.reward);
  assert.equal(st.fish.pocket.length, 1, 'you keep the fish');
  assert.ok(st.fish.pocket[0].shown);
  // a lunker trade
  st.fish.pocket.push({ id: 'perch', cm: 35 });
  run(t, ow, NP.scripts.master_lunker);
  assert.equal(st.bag.silk_spool, 7, 'an Old Rod lunker: 2 Silk Spools');
  assert.ok(!st.fish.pocket.some((e) => e.id === 'perch'));
}

// ------------------------------------------------------------------ Ryukoi: pulled under at the island, her cave
{
  console.log('>> ryukoi');
  const { t, NP, ow, st } = fresh(13);
  const rl = said(NP);
  st.party[0].moves = ['pounce'].map(NP.Kigu.makeMove);   // mashing A uses the first move: make it a hit
  st.bag.disc_paddle = 1;
  const def = NP.maps.hemline_lake;
  const ring = def.triggers.filter((q) => q.id === 'island');
  assert.ok(ring.length >= 8, 'a ring of water round the island');
  // stand on the lake just outside the ring and paddle in
  const tm = ow.tileMap('hemline_lake');
  const start = (() => {
    for (const q of ring) for (const [dx, dy, d] of [[-1, 0, 'right'], [1, 0, 'left'], [0, -1, 'down'], [0, 1, 'up']]) {
      const x = q.x + dx, y = q.y + dy;
      if (tm.idAt(x, y) === 'water' && !ring.some((r) => r.x === x && r.y === y)) return [x, y, d];
    }
  })();
  ow.loadMap('hemline_lake', start[0], start[1], start[2], { noEnter: true });
  t.tick(3);
  assert.ok(ow.paddling());
  t.go(start[2], 1);
  settle(t);
  assert.equal(ow.map.id, 'ryukoi_cave', 'pulled under into the cave');
  assert.ok(st.flags.ryukoi_met);
  assert.ok(NP.maps.ryukoi_cave.encounters.puddle.length, 'puddles have wild Kigu');
  assert.equal(NP.terrain.puddle.encounter, 'puddle');
  assert.ok(!NP.terrain.puddle.water, 'you walk through puddles (no Paddle needed)');
  // up to her pool: she rises, and the battle has her lines for the spool
  let g = 0;
  while (ow.player.y > 6 && g++ < 20) t.go('up', 1);
  NP.Input.set('up', true); t.tick(2); NP.Input.set('up', false);
  g = 0;
  while (!(t.top() instanceof NP.BattleScene) && g++ < 3000) { t.tick(1); if (g % 6 === 0) { NP.Input.set('a', true); t.tick(1); NP.Input.set('a', false); } }
  const bs = t.top();
  assert.ok(bs instanceof NP.BattleScene, 'Ryukoi\'s battle');
  assert.equal(bs.cfg.foe[0].species, 'ryukoi');
  assert.equal(bs.cfg.foe[0].alt, true, 'the gold one');
  assert.equal(bs.cfg.noCatch.first, 'She deftly slaps away the spool!');
  assert.ok(bs.cfg.canLose);
  t.mash(() => t.top() === ow && t.idle(), 30000);
  assert.ok(st.flags.ryukoi_beaten, 'beat her (Lv40 Konko): ' + rl.slice(-6).join(' | ') + ' @' + t.pos());
  assert.equal(ow.map.id, 'hemline_lake', 'the whirlpool took you back to the contest grounds');
  // the Super Rod pool: she bites only once you've met her
  const pool = NP.maps.ryukoi_cave.fishing.legend;
  assert.equal(pool.sp, 'ryukoi'); assert.equal(pool.rod, 3); assert.equal(pool.needs, 'ryukoi_met');
}
function DOCKX() { return 14; }
console.log('fishing ok');
