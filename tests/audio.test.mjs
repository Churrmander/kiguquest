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
  for (const id of [...A.songs(), ...A.jingles()]) {
    const p = A.validate(id);
    assert.deepEqual(Array.from(p), [], p.join('\n'));
    const c = A.compile(id);
    let last = 0;
    for (const e of c.events) {
      assert.ok(e.t >= last - 1e-9 && e.t < c.total + 1e-6, id + ': events sorted and inside song');
      last = e.t;
      assert.ok(e.dur > 0 && e.vol >= 0 && e.vol <= 1, id + ': dur/vol');
      if (e.ch !== 'noi') assert.ok(e.f >= 30 && e.f <= 4200, id + ': freq ' + e.f);
    }
    // structure: all four voices are used and the loop is musically meaningful
    const used = new Set(c.events.map((e) => e.ch));
    if (!A.isJingle(id)) {
      for (const ch of ['p1', 'p2', 'tri', 'noi']) assert.ok(used.has(ch), id + ' uses ' + ch);
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
  // notation negatives
  assert.ok(A.notation.parseTrack('c5:2 zz', 'p1', A.notation.DEFAULT_INST.p1).errors.length);
  assert.equal(A.notation.parseTrack('[ c5:1 d5:1 ]x3 r:2', 'p1', A.notation.DEFAULT_INST.p1).steps, 8);
  assert.equal(A.notation.midiOf('a4'), 69);
  assert.ok(Math.abs(A.notation.hz(69) - 440) < 1e-9);
  assert.deepEqual(Array.from(A.notation.chord('Am3').tones), [57, 60, 64, 69]);
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
  const counts = { osc: 0, noise: 0 };
  let inst = null;
  const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {}, setTargetAtTime() {} });
  const node = () => ({ connect() {}, disconnect() {}, gain: param(), frequency: param(), Q: param(), start() {}, stop() {} });
  class Ctx {
    constructor() { inst = this; this.currentTime = 0; this.sampleRate = 8000; this.state = 'running'; this.destination = node(); }
    resume() {}
    createGain() { return node(); }
    createWaveShaper() { return Object.assign(node(), { curve: null, oversample: 'none' }); }
    createBuffer(c, n) { return { getChannelData: () => new Float32Array(n) }; }
    createPeriodicWave() { return {}; }
    createOscillator() { counts.osc++; return Object.assign(node(), { setPeriodicWave() {} }); }
    createBufferSource() { counts.noise++; return node(); }
    createBiquadFilter() { return node(); }
  }
  const { NP } = loadNP({ files: [...core, sound, ...files], extra: { AudioContext: Ctx } });
  const A = NP.audio;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  assert.equal(A.init(), true);
  A.playSong('battle_wild');
  assert.equal(A.current(), 'battle_wild');
  assert.ok(counts.osc > 0, 'scheduler created voices on start');
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
