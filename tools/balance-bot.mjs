// Balance check for the story trainers (dev tool, not part of the test suite: it is statistical and slow).
//   node tools/balance-bot.mjs [runs-per-starter=40] [level-offset=0]   (offset shifts every reference level, e.g. -2 = an under-levelled player)
// 1. Replays the walkthrough + chapter-2 bot tests, recording every trainer battle (foe team, AI level) in story order.
// 2. Re-fights each one `runs` times per starter (konko / ottopi / sprubun lines) with a reference party whose level follows a
//    plausible progression curve, played by the greedy AI at full HP, and reports win rate, turns and HP left.
import { loadNP } from './load.mjs';

const RUNS = +process.argv[2] || 40;
const OFFSET = +process.argv[3] || 0;
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;   // e.g. ONLY=Rival : only fights whose 'class name' matches
const PROGRESS = !!process.env.PROGRESS;                                // PROGRESS=1: a natural run (real XP from every fight + wild battles), instead of reference levels
const GRIND = +process.env.GRIND || 1;                                  // scales the number of wild battles per map in PROGRESS mode
const SWEEP = !!process.env.SWEEP;                                      // SWEEP=1: for the selected fights, show win% as the foe's levels shift by 0,-1,-2,-3
const log = [];
globalThis.__onBoot = (bot) => {
  const OW = bot.NP.Overworld, orig = OW.prototype.runBattle;
  OW.prototype.runBattle = function* (cfg) {
    if (!cfg.wild && cfg.trainer) log.push({ map: this.map.id, name: cfg.trainer.name, cls: cfg.trainer.cls, ai: cfg.trainer.ai, master: !!cfg.trainer.master, foe: cfg.foe.map((k) => [k.species, k.level]) });
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
    const extra = { map: id, name: n.trainer.name, cls: n.trainer.cls, ai: n.trainer.ai || 0, master: false, foe: n.trainer.team.map((t) => [t.sp, t.lv]), added: true };
    if (at < 0) continue;                       // a map the story run never reached
    log.splice(at + 1, 0, extra);
  }
}
// SHIFT="Rival:-2,Bryn:-1": try lowering (or raising) a trainer's levels without touching the maps. Matches on 'map class name', e.g. SHIFT="thimble Rival:-2".
const SHIFTS = (process.env.SHIFT || '').split(',').filter(Boolean).map((x) => { const [re, d] = x.split(':'); return [new RegExp(re), +d]; });
const seen = new Set();
const fights = log.filter((f) => { const k = f.map + '|' + f.name + '|' + JSON.stringify(f.foe); if (seen.has(k)) return false; seen.add(k); return true; })
  .map((f) => { let d = 0; for (const [re, x] of SHIFTS) if (re.test(f.map + ' ' + f.cls + ' ' + f.name)) d += x; return d ? Object.assign({}, f, { foe: f.foe.map(([sp, lv]) => [sp, Math.max(2, lv + d)]) }) : f; });

// Where a player plausibly is when she meets each trainer (lead Kigu level; the team behind her is lead-2 and lead-3).
// Keyed by `map|name`; this is the knob to tune. Early levelling is fast (wild Kigu + route trainers), later it slows.
const LEAD = {
  'route1|Bo': 5, 'route1|Suzu': 6, 'route1|Tomo': 7,
  'thimble|Tomo': 10, 'salon|Ren': 10, 'salon|Noa': 11, 'salon|Poppy': 12, 'thimble|Tuck': 12,
  'route2|Reed': 12, 'route2|Tally': 12, 'route2|Gus': 13, 'route2|Kei': 13,
  'gingham_woods|Pete': 14, 'gingham_woods|Tess': 14, 'gingham_woods|Yuki': 14,
  'spindle_shrine|Pin': 15, 'spindle_shrine|Welt': 15, 'spindle_shrine|Crease': 15,
  'hemline_salon|Wren': 16, 'hemline_salon|Dov': 16, 'hemline_salon|Bryn': 16,
};
const leadAt = (f, i) => (LEAD[f.map + '|' + f.name.replace(/^.* /, '')] ?? LEAD[f.map + '|' + f.name] ?? 6 + i) + OFFSET;
// Tomo (story: "takes the starter that beats yours") always fields the counter to the player's starter
const COUNTER = { konko: 'ottopi', ottopi: 'sprubun', sprubun: 'konko' };
const EVO = { peepi: ['larkette', 14], nibbi: ['nibblenna', 15], konko: ['kitsuri', 16], ottopi: ['ottelia', 17], sprubun: ['lapinlily', 17] };
const form = (sp, lv) => (EVO[sp] && lv >= EVO[sp][1] ? EVO[sp][0] : sp);
const party = (starter, lead, seed) => [[starter, lead], ['peepi', lead - 2], ['nibbi', lead - 3]]
  .filter(([, lv]) => lv >= 3)
  .map(([sp, lv], j) => Kigu.create(form(sp, lv), lv, { rng: new NP.RNG(seed * 31 + j), nature: 'hardy', alt: false, ot: 'Ren' }));
const foeTeam = (f, starter) => f.foe.map(([sp, lv], j) => { const s0 = f.cls === 'Rival' && j === 0 ? COUNTER[starter] : sp; return [form(s0, lv), lv]; });

function fight(f, starter, lead, seed) {
  const rng = new NP.RNG(seed);
  const pa = party(starter, lead, seed);
  const pb = foeTeam(f, starter).map(([sp, lv], j) => Kigu.create(sp, lv, { rng: new NP.RNG(seed * 17 + j), nature: 'hardy', alt: false }));
  const start = pa.reduce((s, k) => s + Kigu.maxHp(k), 0);
  const bt = new B.Battle({ wild: false, rng, sides: [{ player: true, party: pa, ai: 2 }, { party: pb, ai: f.ai }] });
  let s = bt.begin(), guard = 0, turns = 0;
  while (!s.done && guard++ < 1500) {
    let ans; const r = s.request;
    if (r && r.need === 'actions') { ans = [B.AI.choose(bt, bt.sides[0].active[r.slots[0]], 0)]; turns++; }
    else if (r && r.need === 'replace') ans = bt.sides[0].benched().sort((a, b) => b.level - a.level)[0].idx;
    s = bt.step(ans);
  }
  const left = pa.reduce((x, k) => x + k.hp, 0);
  return { won: bt.winner === 0, turns, hp: left / start };
}

if (PROGRESS) {
  // wild battles a player plausibly fights on each outdoor map before the trainers there; the lowest-level Kigu leads (rotation)
  const WILDS = { route1: 6, thimble: 6, route2: 6, gingham_woods: 8 };
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
    const score = (id) => { const m = NP.data.moves[id]; return m.power ? m.power * (types.includes(m.type) ? 1.5 : 1) * ((m.acc || 100) / 100) : 20; };
    k.moves = Array.from(ids).sort((a, b) => score(b) - score(a)).slice(0, 4).map((id) => Kigu.makeMove(id));
  };
  const evolve = (pa) => pa.forEach((k) => { const e = EVO[k.species]; if (e && k.level >= e[1]) { (k._prev = k._prev || []).push(k.species); k.species = e[0]; } rebuild(k); });
  const battle = (pa, foe, wild, ai, seed) => {
    const bt = new B.Battle({ wild, rng: new NP.RNG(seed), sides: [{ player: true, party: pa, ai: 2 }, { party: foe, ai }] });
    let st = bt.begin(), g = 0;
    while (!st.done && g++ < 1500) {
      let ans; const r = st.request;
      if (r && r.need === 'actions') ans = [B.AI.choose(bt, bt.sides[0].active[r.slots[0]], 0)];
      else if (r && r.need === 'replace') ans = bt.sides[0].benched().sort((a, b) => b.level - a.level)[0].idx;
      st = bt.step(ans);
    }
    return bt.winner === 0;
  };
  const stats = fights.map(() => ({ won: 0, n: 0, lead: 0, sum: [0, 0, 0] }));
  for (const starter of ['konko', 'ottopi', 'sprubun']) for (let r = 0; r < RUNS; r++) {
    const rng = new NP.RNG(5000 + r);
    const mk = (sp, lv) => Kigu.create(sp, lv, { rng: new NP.RNG(rng.int(1e6)), nature: 'hardy', alt: false, ot: 'Ren' });
    const pa = [mk(starter, 5)];
    let lastMap = null, seed = 9000 + r * 101;
    fights.forEach((f, i) => {
      if (f.map !== lastMap) {
        lastMap = f.map;
        if (f.map === 'route1') pa.push(mk('peepi', 3), mk('nibbi', 3));
        const n = Math.round((WILDS[f.map] || 0) * GRIND);
        for (let w = 0; w < n; w++) {
          const [sp, lv] = pickWild(f.map, rng);
          pa.sort((a, b) => a.level - b.level);            // rotate: the lowest-level Kigu takes the wild fight
          const foe = [mk(sp, lv)];
          heal(pa); battle(pa, foe, true, 0, seed++); heal(pa); evolve(pa);
        }
      }
      pa.sort((a, b) => b.level - a.level);                 // trainers: the strongest Kigu leads
      const foe = foeTeam(f, starter).map(([sp, lv]) => mk(sp, lv));
      const lead = pa[0].level, lv3 = pa.slice(0, 3).map((k) => k.level);
      heal(pa);
      const won = battle(pa, foe, false, f.ai, seed++);
      heal(pa); evolve(pa);
      const t = stats[i]; t.n++; t.won += won ? 1 : 0; t.lead += lead; lv3.forEach((l, j) => { t.sum[j] += l; });
    });
  }
  console.log('NATURAL RUN: each chain = starter L5 + peepi/nibbi from Route 1, all trainers in story order, wild battles x' + GRIND + ' per map (' + JSON.stringify(WILDS) + '), full heal (HP/PP/status) between fights, best-4 moves rebuilt after every level; ' + (3 * RUNS) + ' chains\n');
  console.log('  #  map              fight                          foe team                natural party lvls  win%');
  fights.forEach((f, i) => {
    const t = stats[i], rate = t.won / t.n, lv = t.sum.map((x) => Math.round(x / t.n));
    const tag = rate < 0.75 ? '  <-- HARD' : rate > 0.99 ? '  (trivial)' : '';
    console.log(String(i).padStart(3) + '  ' + f.map.padEnd(15) + '  ' + (f.cls + ' ' + f.name).slice(0, 28).padEnd(28) + '  ' + f.foe.map(([sp, l]) => sp + l).join(' ').slice(0, 22).padEnd(22) + '  ' + lv.join('/').padEnd(18) + '  ' + String(Math.round(rate * 100)).padStart(3) + '%' + tag);
  });
  process.exit(0);
}
console.log('trainer battles recorded in story order:', fights.length, '| runs per starter:', RUNS, '| level offset:', OFFSET, '| player AI: greedy, full HP at start\n');
console.log('  #  map              fight                          foe team                lead  win%  (konko/ottopi/sprubun)  turns  hp-left');
const flagged = [];
const shifted = (f, d) => Object.assign({}, f, { foe: f.foe.map(([sp, lv]) => [sp, Math.max(2, lv + d)]) });
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
