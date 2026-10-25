// Audio: validates all song/sfx data headlessly, the compiler, the cry synth, and the engine against a mock AudioContext.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadNP, ROOT } from '../tools/load.mjs';

const core = ['src/core/color.js', 'src/core/rng.js', 'src/core/bitmap.js', 'src/core/font.js', 'src/core/ns.js'];
const files = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/audio/files.json'), 'utf8'));
const sound = 'src/engine/sound.js';
for (const f of files) assert.ok(fs.existsSync(path.join(ROOT, f)), 'files.json entry exists: ' + f);

const P1_SONGS = ['title', 'intro', 'home_town', 'route_meadow', 'town_thimble', 'tea_house', 'battle_wild', 'battle_tailor', 'battle_master',
  'battle_rival', 'battle_society', 'forest_gingham', 'city_seamstead', 'society_theme', 'cave', 'sad', 'credits'];
const JINGLES = ['j_win_wild', 'j_win_tailor', 'j_win_master', 'j_levelup', 'j_heal', 'j_item', 'j_key_item', 'j_evolve', 'j_caught', 'j_button',
  'j_encounter_society', 'j_encounter_tailor', 'j_shop'];
const SFX = ['cursor', 'select', 'cancel', 'error', 'menu_open', 'text', 'bump', 'step_grass', 'door', 'warp', 'ledge', 'battle_start', 'hit', 'hit_super',
  'hit_weak', 'stat_up', 'stat_down', 'faint', 'low_hp', 'exp', 'throw', 'shake', 'caught', 'heal_tick', 'levelup', 'pickup', 'save', 'poison', 'status',
  'flee', 'evolve', 'sparkle', 'whoosh', 'zap', 'splash', 'flame', 'leaf', 'rock', 'cry_generic'];

// ---------- headless (no AudioContext) ----------
{
  const { NP } = loadNP({ files: [...core, sound, ...files] });
  const A = NP.audio;
  for (const id of P1_SONGS) assert.ok(NP.data.songs[id], 'song exists: ' + id);
  for (const id of JINGLES) assert.ok(NP.data.songs[id], 'jingle exists: ' + id);
  for (const id of SFX) assert.ok(NP.data.sfx[id] !== undefined, 'sfx exists: ' + id);
  // every move type has its own impact layer, and battlefx's swing/cast tables only name sfx that exist
  const types = ['fluff', 'ember', 'tide', 'volt', 'sprout', 'frost', 'brawl', 'nettle', 'terra', 'gale', 'dream', 'buzz', 'pebble', 'spook', 'drake', 'shade', 'iron'];
  for (const t of types) assert.ok(NP.data.sfx['imp_' + t] !== undefined, 'impact sfx for ' + t);
  const fxSrc = fs.readFileSync(path.join(ROOT, 'src/game/battlefx.js'), 'utf8');
  for (const m of fxSrc.matchAll(/(?:CAST|SWING)_SFX = \{([^}]*)\}/g)) {
    const named = [...m[1].matchAll(/'([a-z_]+)'/g)].map((x) => x[1]);
    assert.ok(named.length >= 9);
    for (const id of named) assert.ok(NP.data.sfx[id] !== undefined, 'battlefx sfx exists: ' + id);
  }
  for (const t of types) assert.ok(new RegExp('CAST_SFX = \\{[^}]*\\b' + t + ':').test(fxSrc), 'cast sfx for ' + t);
  for (const id of [...A.songs(), ...A.jingles()]) {
    const p = A.validate(id);
    assert.deepEqual(Array.from(p), [], p.join('\n'));
    const c = A.compile(id);
    let last = 0;
    for (const e of c.events) {
      assert.ok(e.t >= last - 1e-9 && e.t < c.total + 1e-6, id + ': events sorted and inside song');
      last = e.t;
      assert.ok(e.dur > 0 && e.vol >= 0 && e.vol <= 1, id + ': dur/vol');
      if (e.d === undefined) assert.ok(e.f >= 30 && e.f <= 4200, id + ': freq ' + e.f);
    }
    // structure: a full band is used and the loop is musically meaningful
    const used = new Set(c.events.map((e) => e.ch));
    if (!A.isJingle(id)) {
      const def = NP.data.songs[A.resolve(id)];
      const modern = def.inst && Object.values(def.inst).some((v) => v.patch);
      if (!modern) for (const ch of ['p1', 'p2', 'tri', 'noi']) assert.ok(used.has(ch), id + ' uses ' + ch);
      else {
        // DS-style songs: >= 5 channels, drums, a bass line, >= 4 distinct instruments, and some section contrast (a variation or breakdown)
        assert.ok(used.size >= 5, id + ' uses >= 5 channels');
        assert.ok(c.events.some((e) => e.d !== undefined), id + ' has drums');
        assert.ok(c.events.some((e) => e.midi !== undefined && e.midi < 48), id + ' has a bass line');
        assert.ok(new Set(c.events.map((e) => e.p)).size >= 5, id + ' uses >= 4 pitched instruments + kit');
        assert.ok(c.events.every((e) => e.p), id + ' every event has a patch');
        assert.ok(c.total - c.loopStart >= 60, id + ' loop is long enough not to wear thin');
      }
      assert.ok(c.loops && c.total - c.loopStart >= 12, id + ' loop length');
      assert.ok(c.sections.length >= 2 && new Set(c.sections.map((s) => s.name)).size >= 2, id + ' has >= 2 distinct sections (A/B structure)');
    } else assert.ok(!c.loops && c.seconds <= 12, id + ' jingle is one-shot');
  }
  assert.ok(A.songs().length >= P1_SONGS.length);
  for (const id of P1_SONGS) assert.ok(A.songs().includes(id));
  for (const id of JINGLES) assert.ok(A.jingles().includes(id));
  // loop point falls on a section boundary
  for (const id of A.songs()) {
    const c = A.compile(id);
    assert.ok(c.sections.some((s) => Math.abs(s.start - c.loopStart) < 1e-9), id + ' loop on section boundary');
  }
  // sfx
  for (const id of SFX) {
    const s = A.sfxEvents(id);
    assert.deepEqual(Array.from(s.errors), [], id);
    assert.ok(s.events.length && s.seconds > 0 && s.seconds < 1.5, id + ' length ' + s.seconds);
    for (const e of s.events) assert.ok(e.f >= 50 && e.f <= 12000 && (e.f2 || e.f) >= 50 && e.vol > 0 && e.vol <= 1, id + ' ranges');
  }
  assert.deepEqual(Array.from(A.sfxs()).sort(), SFX.slice().sort().concat(Array.from(A.sfxs()).filter((x) => !SFX.includes(x))).sort());
  // info
  assert.equal(A.info('home_town').kind, 'song');
  assert.equal(A.info('home_town').loops, true);
  assert.equal(A.info('j_item').kind, 'jingle');
  assert.equal(A.info('hit').kind, 'sfx');
  assert.equal(A.info('nope'), null);
  // cries: deterministic, varied, in range
  const a1 = JSON.stringify(A.cryEvents('konko')), a2 = JSON.stringify(A.cryEvents('konko'));
  assert.equal(a1, a2);
  const set = new Set();
  for (let i = 1; i <= 60; i++) {
    const c = A.cryEvents('species_' + i);
    set.add(JSON.stringify(c.events));
    assert.ok(c.seconds > 0.1 && c.seconds < 0.7, 'cry length');
    for (const e of c.events) assert.ok(e.f >= 50 && e.f <= 2500 && e.vol <= 1);
  }
  assert.ok(set.size >= 55, 'cries vary by species');
  assert.ok(A.cryEvents(17).events.length && A.cryEvents({ id: 'x' }).events.length);
  // sfx layer fields: d (detuned double), o (sub-octave), ~ (echo), lp/P/R pass-through, nl/nh noise filters
  {
    const ps = A.notation.parseSfx;
    const d = ps('t 440 0.1 0.5 d12').events;
    assert.equal(d.length, 2); assert.ok(d[1].f > d[0].f && Math.abs(d[0].vol - 0.325) < 1e-9);
    const o = ps('p2 400 0.1 0.5 o').events;
    assert.equal(o.length, 2); assert.equal(o[1].ch, 'tri'); assert.equal(o[1].f, 200);
    assert.equal(ps('p2 80 0.1 0.5 o').events.length, 1, 'no sub-octave under 50 Hz');
    const ec = ps('s 800 0.1 0.5 ~0.05x2; s 900 0.1');
    assert.equal(ec.events.length, 4); assert.ok(Math.abs(ec.seconds - 0.2) < 1e-9); assert.ok(Math.abs(ec.events.find((e) => e.f === 900).t - 0.1) < 1e-9, 'echo does not move the cursor');
    const f = ps('t 300 0.1 lp900>400 P-0.5 R0.3; nl 500 0.1').events;
    assert.equal(f[0].lp, 900); assert.equal(f[0].lp2, 400); assert.equal(f[0].pan, -0.5); assert.equal(f[0].rev, 0.3); assert.equal(f[1].filt, 'lp');
    assert.ok(ps('t 300 0.1 zz').errors.length, 'unknown field is an error');
  }
  // notation negatives
  assert.ok(A.notation.parseTrack('c5:2 zz', 'p1', A.notation.DEFAULT_INST.p1).errors.length);
  assert.equal(A.notation.parseTrack('[ c5:1 d5:1 ]x3 r:2', 'p1', A.notation.DEFAULT_INST.p1).steps, 8);
  assert.equal(A.notation.midiOf('a4'), 69);
  assert.ok(Math.abs(A.notation.hz(69) - 440) < 1e-9);
  assert.deepEqual(Array.from(A.notation.chord('Am3').tones), [57, 60, 64, 69]);
  // ---------- DS voice model ----------
  const N = A.notation;
  // legacy songs map onto softer patches; leads that lived in octave 6 drop an octave
  const ct = A.compile('battle_tailor');
  assert.equal(ct.lift.p1, -12, 'old octave-6 lead drops an octave');
  assert.ok(ct.events.every((e) => e.p === N.LEGACY_PATCH[e.ch]), 'legacy channels use the legacy patches');
  assert.ok(ct.events.filter((e) => e.ch === 'p1').every((e) => e.midi <= 84 + 1), 'no legacy lead above C#6 after the drop');
  // patch voices: filtered, panned, reverb send; legacy SFX voices unchanged (no pan / lp unless asked)
  const pv = N.voices({ t: 0, dur: 0.5, ch: 'mel', p: 'warm', f: 440, midi: 69, vol: 0.8 });
  assert.ok(pv.length === 2 && pv.every((v) => v.k === 'osc' && v.lp > 0 && v.lp <= 3200 && v.pan !== undefined && v.rev > 0), 'warm lead layers');
  assert.ok(pv[0].dur > 0.5, 'release extends the voice');
  const sv = N.voices({ t: 0, dur: 0.1, ch: 'p1', duty: 1, f: 880, vol: 0.5, env: 'hold' });
  assert.ok(sv.length === 1 && sv[0].wave === 'pulse' && sv[0].lp === undefined && sv[0].pan === undefined, 'sfx voice untouched');
  const lv = N.voices({ t: 0, dur: 0.1, ch: 'saw', f: 300, vol: 0.5, lp: 1200, lp2: 400, pan: -0.5 });
  assert.ok(lv[0].wave === 'sawtooth' && lv[0].lp === 1200 && lv[0].lp2 === 400 && lv[0].pan === -0.5, 'sfx osc lowpass/pan pass through');
  const nv = N.voices({ t: 0, dur: 0.1, ch: 'noi', d: 'n', f: 900, vol: 0.5, filt: 'hp', q: 0.7 });
  assert.ok(nv[0].filt === 'hp' && nv[0].q === 0.7, 'sfx noise filter pass through');
  for (const [name, P] of Object.entries(N.PATCHES)) {
    if (P.drums) continue;
    const vs = N.voices({ t: 0, dur: 0.4, ch: 'x', p: name, f: N.hz(60), midi: 60, vol: 1 });
    assert.ok(vs.length >= 1 && vs.every((v) => v.amp > 0 && v.amp < 1 && v.dur > 0), 'patch ' + name);
    for (const v of vs) { const e = N.envPoints(v.env, v.dur, v.amp); assert.ok(e.every((p, i) => i === 0 || p[0] >= e[i - 1][0]) && e[e.length - 1][1] < 0.001, name + ' env'); }
  }
  // envelopes: ADSR objects are monotonic in time and end silent
  const ep = N.envPoints({ a: 0.01, d: 0.2, s: 0.5, s2: 0.2, r: 0.1 }, 1, 1);
  assert.ok(Math.abs(Math.max(...ep.map((p) => p[1])) - 1) < 1e-9 && ep[ep.length - 1][0] === 1);
  // reverb impulse: deterministic, stereo, unit energy
  const ir1 = N.reverbIR(8000), ir2 = N.reverbIR(8000);
  assert.equal(ir1.length, 2);
  assert.deepEqual(Array.from(ir1[1].slice(200, 260)), Array.from(ir2[1].slice(200, 260)));
  assert.ok(Math.abs(ir1[0].reduce((a, b) => a + b * b, 0) - 1) < 1e-3);
  // notation additions: block chords, simultaneous notes, instrument switch
  const inst = { vol: 10, gate: 0.9 };
  assert.equal(N.parseTrack('=C4:4', 'mel', inst).items.length, 3);
  assert.equal(N.parseTrack('=Cmaj74:4', 'mel', inst).items.length, 4);
  assert.equal(N.parseTrack('c4+e4:4 g4', 'mel', inst).items.length, 3);
  assert.equal(N.parseTrack('c4+e4:4 g4', 'mel', inst).steps, 8);
  assert.equal(N.parseTrack('%iflute c4:4', 'mel', inst).items[0].p, 'flute');
  assert.ok(N.parseTrack('%inope c4:4', 'mel', inst).errors.length);
  // variations: 'A2/rd' swaps the lead instrument for that pass only
  const ch = A.compile('home_town');
  const secAt = (name) => ch.sections.find((x) => x.name === name);
  const pAt = (sec) => new Set(ch.events.filter((e) => e.ch === 'mel' && e.t >= sec.start && e.t < sec.start + sec.steps * ch.stepSec).map((e) => e.p));
  assert.deepEqual([...pAt(secAt('A'))], ['flute']);
  assert.deepEqual([...pAt(secAt('A2/rd'))], ['reed']);
  // validator: modern songs reject shrill held notes, unknown patches and undeclared channels
  NP.data.songs.t_shrill = { desc: 'test song only', bpm: 120, loop: 0, order: 'A A', inst: { a: { patch: 'flute' }, b: { patch: 'nope' } },
    sections: { A: { a: 'e6:8 c4:8 | c4:16 |', z: 'c4:16 | c4:16 |' } } };
  const tv = A.validate('t_shrill').join('\n');
  assert.ok(/shrill note e6/.test(tv) && /patch unknown/.test(tv) && /unknown channel z/.test(tv), tv);
  delete NP.data.songs.t_shrill;

  // no-op API without AudioContext
  assert.equal(A.init(), false);
  A.playSong('title'); assert.equal(A.current(), 'title');
  A.playSong('title'); A.pauseSong(); A.resumeSong(); A.sfx('hit'); A.cry('konko'); A.setVolume({ music: 0.5, sfx: 0.5 });
  let done = 0; A.playJingle('j_item', () => done++); assert.equal(done, 1, 'jingle callback fires headless');
  A.stopSong(100); assert.equal(A.current(), null);
  // NP.snd compatibility
  NP.snd.logging = true;
  NP.snd.sfx('cursor'); NP.snd.cry('konko'); NP.snd.play('home_town'); NP.snd.jingle('j_levelup', () => done++); NP.snd.pause(); NP.snd.resume(); NP.snd.stop(200);
  assert.equal(done, 2);
  assert.equal(A.current(), null);
}

// ---------- engine against a mock AudioContext ----------
{
  const counts = { osc: 0, noise: 0, pan: 0, conv: 0, lp: 0 };
  let inst = null;
  const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {}, setTargetAtTime() {} });
  const node = () => ({ connect() {}, disconnect() {}, gain: param(), frequency: param(), Q: param(), start() {}, stop() {} });
  class Ctx {
    constructor() { inst = this; this.currentTime = 0; this.sampleRate = 8000; this.state = 'running'; this.destination = node(); }
    resume() {}
    createGain() { return node(); }
    createWaveShaper() { return Object.assign(node(), { curve: null, oversample: 'none' }); }
    createBuffer(c, n) { const d = Array.from({ length: c }, () => new Float32Array(n)); return { getChannelData: (i) => d[i] }; }
    createPeriodicWave() { return {}; }
    createOscillator() { counts.osc++; return Object.assign(node(), { setPeriodicWave() {} }); }
    createBufferSource() { counts.noise++; return node(); }
    createBiquadFilter() { counts.lp++; return Object.assign(node(), { type: '' }); }
    createStereoPanner() { counts.pan++; return Object.assign(node(), { pan: param() }); }
    createConvolver() { counts.conv++; return Object.assign(node(), { buffer: null, normalize: true }); }
  }
  const { NP } = loadNP({ files: [...core, sound, ...files], extra: { AudioContext: Ctx } });
  const A = NP.audio;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  assert.equal(A.init(), true);
  A.playSong('battle_wild');
  assert.equal(A.current(), 'battle_wild');
  assert.ok(counts.osc > 0, 'scheduler created voices on start');
  assert.equal(counts.conv, 2, 'music + sfx reverbs');
  assert.ok(counts.pan > 0 && counts.lp > 0, 'patch voices are panned and filtered');
  const comp = A.compile('battle_wild');
  // advance the mock clock past the end of the song: the look-ahead scheduler must wrap to the loop point and keep producing
  let t = 0;
  while (t < comp.total * 1.5) {
    t += 0.5;
    inst.currentTime = t;
    await sleep(30);
  }
  const afterLoop = counts.osc;
  inst.currentTime = t + 1;
  await sleep(60);
  assert.ok(counts.osc > afterLoop, 'still scheduling after the loop point');
  A.stopSong(0);
  const stopped = counts.osc;
  inst.currentTime += 5;
  await sleep(60);
  assert.equal(counts.osc, stopped, 'nothing scheduled after stopSong');
  A.sfx('hit'); A.sfx('levelup'); A.cry('konko');
  const before = counts.osc + counts.noise;
  A.sfx('select');
  assert.ok(counts.osc + counts.noise > before, 'sfx creates voices');
  let fin = 0;
  A.playSong('home_town');
  A.playJingle('j_item', () => fin++);
  inst.currentTime += 10; // a jingle ends on the audio clock, which the mock only moves when told to
  await sleep(100);
  assert.equal(fin, 1, 'jingle finished via timer');
  A.stopSong(0);
  A.playSong('title'); A.pauseSong(); A.resumeSong(); A.stopSong(50);
  assert.equal(A.current(), null);
  await sleep(20);
}
console.log('audio tests passed');
process.exit(0);
