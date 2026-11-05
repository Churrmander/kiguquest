// Balance check for the story trainers (dev tool, not part of the test suite: it is statistical and slow).
//   node tools/balance-bot.mjs [runs-per-starter=40] [level-offset=0]   (offset shifts every reference level, e.g. -2 = an under-levelled player)
// 1. Replays the walkthrough + chapter-2 bot tests, recording every trainer battle (foe team with any hand-picked moves, held
//    item and nature, AI level) in story order.
// 2. Re-fights each one `runs` times per starter (konko / ottopi / sprubun lines) with a reference party whose level follows a
//    plausible progression curve, played by the greedy AI at full HP, and reports win rate, turns and HP left.
// Env: ONLY=re (fights to show), SWEEP=1, SHIFT="re:-1", PROGRESS=1 (natural run with real Exp, GRIND=x wild scale, PARTY=solo|trio|full,
//      EXPSHARE=0), SMART=1 (player uses set-up moves) and ITEMS=n (Snack Cakes per fight) for a prepared player. Delete the cache after
//      changing any trainer. Ch1 retune (2026-10-29): careless = PROGRESS=1; prepared = PROGRESS=1 GRIND=3 PARTY=full SMART=1 ITEMS=5.
import { loadNP } from './load.mjs';

const RUNS = +process.argv[2] || 40;
const OFFSET = +process.argv[3] || 0;
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;   // e.g. ONLY=Rival : only fights whose 'class name' matches
const PROGRESS = !!process.env.PROGRESS;                                // PROGRESS=1: a natural run (real XP from every fight + wild battles), instead of reference levels
const PARTY = process.env.PARTY || 'trio';                              // PROGRESS mode team: solo, trio or full (see the PROGRESS block)
const GRIND = +process.env.GRIND || 1;                                  // scales the number of wild battles per map in PROGRESS mode
const SWEEP = !!process.env.SWEEP;                                      // SWEEP=1: for the selected fights, show win% as the foe's levels shift by 0,-1,-2,-3
const SMART = !!process.env.SMART;                                      // SMART=1: a thoughtful player also uses her set-up moves (Fox Fire, Shell Guard, Seed Sow, Sweet Talk) against a strong foe
const SETUP = ['foxfire', 'shell_guard', 'seed_sow', 'sweet_talk'];    // the set-up moves a SMART player keeps and uses
const ITEMS = +process.env.ITEMS || 0;                                  // ITEMS=5: a prepared player brings that many Snack Cakes to each fight (eats one when the active Kigu is under 1/3 HP)
const log = [];
// a foe's hand-picked set (moves, held item, nature from L.team), so a boss like Poppy's Lucky Thimble Wiskedabra is fought as she really is
const setOf = (t) => (t && (t.moves || t.item || t.nature) ? { moves: t.moves, item: t.item, nature: t.nature } : undefined);
globalThis.__onBoot = (bot) => {
  const OW = bot.NP.Overworld, orig = OW.prototype.runBattle, origT = OW.prototype.trainerBattle;
  let team = null;
  OW.prototype.trainerBattle = function* (def) { team = def.team; try { return yield* origT.call(this, def); } finally { team = null; } };
  OW.prototype.runBattle = function* (cfg) {
    if (!cfg.wild && cfg.trainer) log.push({ map: this.map.id, name: cfg.trainer.name, cls: cfg.trainer.cls, ai: cfg.trainer.ai, master: !!cfg.trainer.master, foe: cfg.foe.map((k, j) => [k.species, k.level, setOf(team && team[j])]) });
    return yield* orig.call(this, cfg);
  };
};
// The recording takes ~25s (it replays the bot tests), so it is cached; delete .preview/battle-log.json (or RERECORD=1) after changing any trainer.
import fs from 'node:fs';
const CACHE = new URL('../.preview/battle-log.json', import.meta.url);
if (fs.existsSync(CACHE) && !process.env.RERECORD) log.push(...JSON.parse(fs.readFileSync(CACHE, 'utf8')));
else {
  const realLog = console.log; console.log = () => {};      // the bot tests are chatty
  await import('../tests/walkthrough.test.mjs');
  await import('../tests/chapter2.test.mjs');
  console.log = realLog;
  fs.mkdirSync(new URL('../.preview/', import.meta.url), { recursive: true });
  fs.writeFileSync(CACHE, JSON.stringify(log));
}

const { NP } = loadNP({ quiet: true });
const { Kigu, Battle: B } = NP;
// The bot only fights what it walks into; add the NPC trainers it skipped (their teams are static data), after the last recorded fight on their map.
{
  const { NP: NP0 } = loadNP({ quiet: true });
  const have = new Set(log.map((f) => f.map + '|' + f.name));
  for (const [id, m] of Object.entries(NP0.maps)) for (const n of m.npcs || []) {
    if (!n.trainer || have.has(id + '|' + n.trainer.name)) continue;
    let at = -1; log.forEach((f, i) => { if (f.map === id) at = i; });
    const extra = { map: id, name: n.trainer.name, cls: n.trainer.cls, ai: n.trainer.ai || 0, master: false, foe: n.trainer.team.map((t) => [t.sp, t.lv, setOf(t)]), added: true };
    if (at < 0) continue;                       // a map the story run never reached
    log.splice(at + 1, 0, extra);
  }
}
// SHIFT="Rival:-2,Bryn:-1": try lowering (or raising) a trainer's levels without touching the maps. Matches on 'map class name', e.g. SHIFT="thimble Rival:-2".
const SHIFTS = (process.env.SHIFT || '').split(',').filter(Boolean).map((x) => { const [re, d] = x.split(':'); return [new RegExp(re), +d]; });
const seen = new Set();
const fights = log.filter((f) => { const k = f.map + '|' + f.name + '|' + JSON.stringify(f.foe); if (seen.has(k)) return false; seen.add(k); return true; })
  .map((f) => { let d = 0; for (const [re, x] of SHIFTS) if (re.test(f.map + ' ' + f.cls + ' ' + f.name)) d += x; return d ? Object.assign({}, f, { foe: f.foe.map(([sp, lv, o]) => [sp, Math.max(2, lv + d), o]) }) : f; });

// Where a player plausibly is when she meets each trainer (lead Kigu level; the team behind her is lead-2 and lead-3).
// Keyed by `map|name`; this is the knob to tune. Early levelling is fast (wild Kigu + route trainers), later it slows.
const LEAD = {
  // Chapter 1 (retuned 2026-10-28): a normal player who fights every Tailor and some wild Kigu reaches Poppy at about Lv14-16
  // (PROGRESS=1 GRIND=0.5 lands a level or two above these; the reference is a player who skipped a few wild Kigu)
  'route1|Lia': 5, 'route1|Bo': 6, 'route1|Rival': 7, 'route1|Suzu': 8,
  'ribbon_loop|Tam': 10, 'ribbon_loop|Pim': 10, 'ribbon_loop|Oki': 11, 'ribbon_loop|Rio': 11,
  'salon|Ren': 13, 'salon|Noa': 13, 'salon|Poppy': 15, 'thimble|Tuck': 15,
  'route2|Reed': 12, 'route2|Tally': 12, 'route2|Gus': 13, 'route2|Kei': 13,
  'gingham_woods|Pete': 14, 'gingham_woods|Tess': 14, 'gingham_woods|Yuki': 14,
  'spindle_shrine|Pin': 15, 'spindle_shrine|Welt': 15, 'spindle_shrine|Crease': 15,
  'hemline_salon|Wren': 16, 'hemline_salon|Dov': 16, 'hemline_salon|Bryn': 16,
};
const leadAt = (f, i) => (LEAD[f.map + '|' + f.name.replace(/^.* /, '')] ?? LEAD[f.map + '|' + f.name] ?? (f.cls === 'Rival' ? LEAD[f.map + '|Rival'] : undefined) ?? 6 + i) + OFFSET;
// The rival (owner's rule, button_town.js WEAK) always takes the starter that is weak to the player's, so the first fights lean her way
const COUNTER = { konko: 'sprubun', ottopi: 'konko', sprubun: 'ottopi' };
const EVO = { chirpadee: ['lyripip', 14], nibblit: ['nibblenna', 15], konko: ['kitsuri', 16], ottopi: ['ottelia', 17], sprubun: ['lapinlily', 17] };
const form = (sp, lv) => (EVO[sp] && lv >= EVO[sp][1] ? EVO[sp][0] : sp);
const party = (starter, lead, seed) => [[starter, lead], ['chirpadee', lead - 2], ['nibblit', lead - 3]]
  .filter(([, lv]) => lv >= 3)
  .map(([sp, lv], j) => Kigu.create(form(sp, lv), lv, { rng: new NP.RNG(seed * 31 + j), nature: 'hardy', alt: false, ot: 'Ren' }));
// [species, level, set]: the rival's lead is swapped for the counter starter (and her default moves); a set's moves only fit its own species
const foeTeam = (f, starter) => f.foe.map(([sp, lv, o], j) => { const s0 = f.cls === 'Rival' && j === 0 ? COUNTER[starter] : sp; const sp1 = form(s0, lv); return [sp1, lv, s0 === sp && sp1 === sp ? o : undefined]; });
// wild-caught and story foes: the recorded nature (or hardy), held item and moves when the trainer set them
const foeKigu = (sp, lv, o, rng) => Kigu.create(sp, lv, { rng, nature: (o && o.nature) || 'hardy', alt: false, item: o && o.item, moves: o && o.moves });

// the player's turn: greedy move, or a Snack Cake on a Kigu under 1/3 HP while the supply lasts
const choose = (bt, slot, bag) => {
  const me = bt.sides[0].active[slot];
  if (bag.cakes > 0 && me.kigu.hp > 0 && me.kigu.hp < me.maxhp / 3 && me.maxhp - me.kigu.hp >= 20) { bag.cakes--; return { type: 'item', item: 'snack_cake', party: me.idx }; }
  const foe = bt.sides[1].active[0];
  if (SMART && foe && !foe.fainted && foe.level >= me.level - 1 && me.hp > me.maxhp / 2) {
    // burn a physical attacker (and light the foxfire), raise Defense against one, plant a seed that saps her every turn, or talk her Attack down
    const at = (id) => me.moves.findIndex((m) => m.id === id && m.pp > 0 && SETUP.includes(id)), phys = foe.stats.atk >= foe.stats.spa;
    let i;
    if (phys && !foe.status && !foe.hasType('ember') && (i = at('foxfire')) >= 0) return { type: 'move', move: i, target: { side: 1, slot: 0 } };
    if (phys && me.boosts.def < 2 && (i = at('shell_guard')) >= 0) return { type: 'move', move: i, target: null };
    if (!foe.volatiles.leechseed && !foe.hasType('sprout') && (i = at('seed_sow')) >= 0) return { type: 'move', move: i, target: { side: 1, slot: 0 } };
    if (phys && foe.boosts.atk > -2 && (i = at('sweet_talk')) >= 0) return { type: 'move', move: i, target: { side: 1, slot: 0 } };
  }
  return B.AI.choose(bt, me, 0);
};

function fight(f, starter, lead, seed) {
  const rng = new NP.RNG(seed);
  const pa = party(starter, lead, seed);
  const pb = foeTeam(f, starter).map(([sp, lv, o], j) => foeKigu(sp, lv, o, new NP.RNG(seed * 17 + j)));
  const start = pa.reduce((s, k) => s + Kigu.maxHp(k), 0);
  const bt = new B.Battle({ wild: false, rng, sides: [{ player: true, party: pa, ai: 2 }, { party: pb, ai: f.ai }] });
  let s = bt.begin(), guard = 0, turns = 0;
  const bag = { cakes: ITEMS };
  while (!s.done && guard++ < 1500) {
    let ans; const r = s.request;
    if (r && r.need === 'actions') { ans = [choose(bt, r.slots[0], bag)]; turns++; }
    else if (r && r.need === 'replace') ans = bt.sides[0].benched().sort((a, b) => b.level - a.level)[0].idx;
    s = bt.step(ans);
  }
  const left = pa.reduce((x, k) => x + k.hp, 0);
  return { won: bt.winner === 0, turns, hp: left / start };
}

if (PROGRESS) {
  // wild battles a player plausibly fights on each outdoor map before the trainers there; the lowest-level Kigu leads (rotation)
  // (Thimble, Basting Green and Button Town are towns with no wild Kigu; the Salon's fights come straight after Ribbon Loop's)
  const WILDS = { route1: 6, ribbon_loop: 6, route2: 6, gingham_woods: 8 };
  const pickWild = (map, rng) => {
    const tbl = NP.maps[map].encounters.grass; let r = rng.next() * tbl.reduce((a, e) => a + e.w, 0);
    for (const e of tbl) { r -= e.w; if (r <= 0) return [e.sp, e.min + Math.floor(rng.next() * (e.max - e.min + 1))]; }
    return [tbl[0].sp, tbl[0].min];
  };
  const heal = (pa) => pa.forEach((k) => Kigu.healFull(k));   // HP, PP and status (Tea House / items between fights)
  // a sensible player keeps the four strongest moves she has learnt (power, x1.5 for STAB; status moves count as 20)
  const rebuild = (k) => {
    const ids = new Set();
    for (const sp of [k.species, ...(k._prev || [])]) for (const [l, id] of NP.data.species[sp].learnset) if (l <= k.level) ids.add(id);
    const types = Kigu.sp(k).types;
    const score = (id) => { const m = NP.data.moves[id]; return m.power ? m.power * (types.includes(m.type) ? 1.5 : 1) * ((m.acc || 100) / 100) : SMART && SETUP.includes(id) ? 45 : 20; };
    k.moves = Array.from(ids).sort((a, b) => score(b) - score(a)).slice(0, 4).map((id) => Kigu.makeMove(id));
  };
  const evolve = (pa) => pa.forEach((k) => { const e = EVO[k.species]; if (e && k.level >= e[1]) { (k._prev = k._prev || []).push(k.species); k.species = e[0]; } rebuild(k); });
  // Bobbin's Exp Share is handed over before Route 1 and is on unless switched off (EXPSHARE=0 to switch it off)
  const EXPSHARE = process.env.EXPSHARE !== '0';
  const battle = (pa, foe, wild, ai, seed) => {
    const bt = new B.Battle({ wild, expShare: EXPSHARE, rng: new NP.RNG(seed), sides: [{ player: true, party: pa, ai: 2 }, { party: foe, ai }] });
    let st = bt.begin(), g = 0;
    const bag = { cakes: wild ? 0 : ITEMS };
    while (!st.done && g++ < 1500) {
      let ans; const r = st.request;
      if (r && r.need === 'actions') ans = [choose(bt, r.slots[0], bag)];
      else if (r && r.need === 'replace') ans = bt.sides[0].benched().sort((a, b) => b.level - a.level)[0].idx;
      st = bt.step(ans);
    }
    return bt.winner === 0;
  };
  const stats = fights.map(() => ({ won: 0, n: 0, lead: 0, sum: [0, 0, 0], per: { konko: 0, ottopi: 0, sprubun: 0 } }));
  for (const starter of ['konko', 'ottopi', 'sprubun']) for (let r = 0; r < RUNS; r++) {
    const rng = new NP.RNG(5000 + r);
    const mk = (sp, lv) => Kigu.create(sp, lv, { rng: new NP.RNG(rng.int(1e6)), nature: 'hardy', alt: false, ot: 'Ren' });
    const pa = [mk(starter, 5)];
    let lastMap = null, seed = 9000 + r * 101;
    fights.forEach((f, i) => {
      if (f.map !== lastMap) {
        lastMap = f.map;
        // PARTY=solo: the starter alone; trio (default): + Chirpadee and Nibblit from Route 1; full: + Kittabra (Route 1) and the hay Acolarva (Ribbon Loop)
        if (f.map === 'route1' && PARTY !== 'solo') pa.push(mk('chirpadee', 3), mk('nibblit', 3));
        if (f.map === 'route1' && PARTY === 'full') pa.push(mk('kittabra', 4));
        if (f.map === 'ribbon_loop' && PARTY === 'full') pa.push(mk('acolarva', 9));
        const n = Math.round((WILDS[f.map] || 0) * GRIND);
        for (let w = 0; w < n; w++) {
          const [sp, lv] = pickWild(f.map, rng);
          pa.sort((a, b) => a.level - b.level);            // rotate: the lowest-level Kigu takes the wild fight
          const foe = [mk(sp, lv)];
          heal(pa); battle(pa, foe, true, 0, seed++); heal(pa); evolve(pa);
        }
      }
      pa.sort((a, b) => b.level - a.level);                 // trainers: the strongest Kigu leads
      const foe = foeTeam(f, starter).map(([sp, lv, o]) => foeKigu(sp, lv, o, new NP.RNG(rng.int(1e6))));
      const lead = pa[0].level, lv3 = pa.slice(0, 3).map((k) => k.level);
      heal(pa);
      const won = battle(pa, foe, false, f.ai, seed++);
      heal(pa); evolve(pa);
      const t = stats[i]; t.n++; t.won += won ? 1 : 0; t.per[starter] += won ? 1 : 0; t.lead += lead; lv3.forEach((l, j) => { t.sum[j] += l; });
    });
  }
  console.log('NATURAL RUN: each chain = starter L5' + { solo: ' alone', trio: ' + chirpadee/nibblit from Route 1', full: ' + chirpadee/nibblit/kittabra from Route 1 + the hay acolarva' }[PARTY] + ', all trainers in story order, wild battles x' + GRIND + ' per map (' + JSON.stringify(WILDS) + '), full heal (HP/PP/status) between fights, best-4 moves rebuilt after every level, Exp Share ' + (EXPSHARE ? 'on' : 'off') + (SMART ? ', uses set-up moves' : '') + (ITEMS ? ', ' + ITEMS + ' Snack Cakes per trainer fight' : '') + '; ' + (3 * RUNS) + ' chains\n');
  console.log('  #  map              fight                          foe team                natural party lvls  win%  (konko/ottopi/sprubun)');
  fights.forEach((f, i) => {
    const t = stats[i], rate = t.won / t.n, lv = t.sum.map((x) => Math.round(x / t.n));
    const tag = rate < 0.75 ? '  <-- HARD' : rate > 0.99 ? '  (trivial)' : '';
    console.log(String(i).padStart(3) + '  ' + f.map.padEnd(15) + '  ' + (f.cls + ' ' + f.name).slice(0, 28).padEnd(28) + '  ' + f.foe.map(([sp, l]) => sp + l).join(' ').slice(0, 22).padEnd(22) + '  ' + lv.join('/').padEnd(18) + '  ' + String(Math.round(rate * 100)).padStart(3) + '%  (' + ['konko', 'ottopi', 'sprubun'].map((s) => String(Math.round((t.per[s] / RUNS) * 100)).padStart(3)).join('/') + ')' + tag);
  });
  process.exit(0);
}
console.log('trainer battles recorded in story order:', fights.length, '| runs per starter:', RUNS, '| level offset:', OFFSET, '| player AI: greedy, full HP at start' + (ITEMS ? ', ' + ITEMS + ' Snack Cakes per fight' : '') + '\n');
console.log('  #  map              fight                          foe team                lead  win%  (konko/ottopi/sprubun)  turns  hp-left');
const flagged = [];
const shifted = (f, d) => Object.assign({}, f, { foe: f.foe.map(([sp, lv, o]) => [sp, Math.max(2, lv + d), o]) });
fights.forEach((f, i) => {
  if (ONLY && !ONLY.test(f.cls + ' ' + f.name)) return;
  const lead = leadAt(f, i), per = {}, all = [];
  if (SWEEP) {
    const row = [0, -1, -2, -3].map((d) => { let w = 0, n = 0; for (const st of ['konko', 'ottopi', 'sprubun']) for (let r = 0; r < RUNS; r++) { w += fight(shifted(f, d), st, lead, 1000 + r).won ? 1 : 0; n++; } return 'foe' + (d ? d : '+0') + ': ' + String(Math.round((w / n) * 100)).padStart(3) + '%'; });
    console.log(String(i).padStart(3) + '  ' + f.map.padEnd(10) + (f.cls + ' ' + f.name).padEnd(14) + f.foe.map(([sp, lv]) => sp + lv).join(' ').padEnd(24) + 'lead L' + lead + '   ' + row.join('   '));
    return;
  }
  for (const st of ['konko', 'ottopi', 'sprubun']) {
    const rs = []; for (let r = 0; r < RUNS; r++) rs.push(fight(f, st, lead, 1000 + r));
    per[st] = rs.filter((x) => x.won).length / RUNS; all.push(...rs);
  }
  const wins = all.filter((x) => x.won), rate = wins.length / all.length;
  const turns = all.reduce((s, x) => s + x.turns, 0) / all.length, hp = wins.length ? wins.reduce((s, x) => s + x.hp, 0) / wins.length : 0;
  const tag = rate < 0.75 ? '  <-- HARD' : rate > 0.99 && hp > 0.85 ? '  (trivial)' : '';
  if (rate < 0.75) flagged.push({ i, f, lead, rate, per });
  const team = f.foe.map(([sp, lv]) => sp + lv).join(' ');
  console.log(String(i).padStart(3) + '  ' + f.map.padEnd(15) + '  ' + (f.cls + ' ' + f.name).slice(0, 28).padEnd(28) + '  ' + team.slice(0, 22).padEnd(22) + '  L' + String(lead).padEnd(3) + '  ' + String(Math.round(rate * 100)).padStart(3) + '%  (' + ['konko', 'ottopi', 'sprubun'].map((s) => String(Math.round(per[s] * 100)).padStart(3)).join('/') + ')   ' + turns.toFixed(1).padStart(5) + '  ' + Math.round(hp * 100) + '%' + tag);
});
console.log('\nflagged HARD (<75% win at the reference level):', flagged.length ? flagged.map((x) => x.f.cls + ' ' + x.f.name + ' @' + x.f.map).join('; ') : 'none');
process.exit(0);
