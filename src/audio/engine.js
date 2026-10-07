/* src/audio/engine.js — NP.audio playback: WebAudio look-ahead scheduler + voices. Safe no-op when AudioContext is missing.
 * Songs/SFX are compiled to timed events by notation.js (which also turns each event into primitive voices); this file only plays them. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const A = (NP.audio = NP.audio || {});
  const N = A.notation;
  const LOOK = 0.2;    // seconds scheduled ahead
  const TICK = 25;     // ms between scheduler runs
  const PRE = 0.05;    // start latency of a (re)started song

  const st = {
    ctx: null, master: null, musicGain: null, sfxGain: null, noiseBuf: null, waves: {},
    vol: { music: 0.6, sfx: 0.8 },
    cur: null, opts: null,          // requested song (tracked even when headless)
    playing: null,                   // { comp, bus, t0, pass, idx, loopIdx, timer }
    paused: false,
    saved: null,                     // { id, pos }: where the music stopped when it was paused / ducked by a jingle
    jingle: null,                    // { bus, end, fin, terminal, ducked, requested, timer }
    last: {},
  };

  const now = () => (st.ctx ? st.ctx.currentTime : 0);

  A.init = function () {
    if (st.ctx) {
      try { if (st.ctx.state === 'suspended') st.ctx.resume(); } catch (e) { /* */ }
      return true;
    }
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return false;
    try {
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = 0.9;
      // gentle soft limiter instead of a compressor: linear below 0.7, tanh knee above (mirrored in tools/audio-synth.mjs)
      const lim = ctx.createWaveShaper();
      const curve = new Float32Array(4097);
      for (let i = 0; i < curve.length; i++) {
        const x = (i / (curve.length - 1)) * 2 - 1, a = Math.abs(x), k = 0.7;
        curve[i] = a <= k ? x : Math.sign(x) * (k + (1 - k) * Math.tanh((a - k) / (1 - k)));
      }
      lim.curve = curve;
      try { lim.oversample = '2x'; } catch (e) { /* */ }
      const mg = ctx.createGain(); mg.gain.value = st.vol.music;
      const sg = ctx.createGain(); sg.gain.value = st.vol.sfx;
      mg.connect(master); sg.connect(master); master.connect(lim); lim.connect(ctx.destination);
      // 1s of white noise, reused by every noise voice
      const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let s = 12345;
      for (let i = 0; i < d.length; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; d[i] = (s / 4294967296) * 2 - 1; }
      Object.assign(st, { ctx, master, musicGain: mg, sfxGain: sg, noiseBuf: buf });
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { st.ctx = null; return false; }
    if (st.cur && !st.paused && !st.jingle && !st.playing) startSong(st.cur, st.opts, 0, 0);
    return true;
  };

  // ---------- voices ----------
  function pulseWave(i) {
    if (st.waves[i]) return st.waves[i];
    const d = N.DUTY[i], n = 48;
    const re = new Float32Array(n), im = new Float32Array(n);
    for (let k = 1; k < n; k++) {
      re[k] = Math.sin(2 * Math.PI * k * d) / (Math.PI * k);
      im[k] = (1 - Math.cos(2 * Math.PI * k * d)) / (Math.PI * k);
    }
    return (st.waves[i] = st.ctx.createPeriodicWave(re, im));
  }

  function applyEnv(param, when, pts) {
    param.setValueAtTime(pts[0][1], when + pts[0][0]);
    for (let i = 1; i < pts.length; i++) param.linearRampToValueAtTime(pts[i][1], when + pts[i][0]);
  }

  function osc(dest, when, v) {
    const ctx = st.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    if (v.wave === 'pulse') o.setPeriodicWave(pulseWave(v.duty));
    else o.type = v.wave;
    o.frequency.setValueAtTime(v.f, when);
    if (v.f2 && v.f2 !== v.f) o.frequency.exponentialRampToValueAtTime(Math.max(20, v.f2), when + v.dur);
    if (v.vib) {
      const l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = v.vib.rate;
      lg.gain.setValueAtTime(0, when);
      lg.gain.linearRampToValueAtTime(v.vib.depth, when + (v.vib.delay || 0.001));
      l.connect(lg); lg.connect(o.frequency);
      l.start(when); l.stop(when + v.dur + 0.03);
    }
    applyEnv(g.gain, when, N.envPoints(v.env, v.dur, v.amp));
    o.connect(g); g.connect(dest);
    o.start(when); o.stop(when + v.dur + 0.03);
  }

  function noise(dest, when, v) {
    const ctx = st.ctx;
    const src = ctx.createBufferSource();
    src.buffer = st.noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = v.filt === 'hp' ? 'highpass' : v.filt === 'lp' ? 'lowpass' : 'bandpass';
    f.frequency.setValueAtTime(v.fc, when);
    if (v.fc2 && v.fc2 !== v.fc) f.frequency.exponentialRampToValueAtTime(Math.max(40, v.fc2), when + v.dur);
    f.Q.value = v.q;
    const g = ctx.createGain();
    applyEnv(g.gain, when, N.envPoints(v.env, v.dur, v.amp));
    src.connect(f); f.connect(g); g.connect(dest);
    src.start(when, Math.random() * 0.8); src.stop(when + v.dur + 0.03);
  }

  function voice(dest, when, e) {
    for (const v of N.voices(e)) { if (v.k === 'osc') osc(dest, when, v); else noise(dest, when, v); }
  }
  function playEvents(events, dest, when0) { for (const e of events) voice(dest, when0 + e.t, e); }

  // ---------- song playback ----------
  // Song clock: song position 0 of the first pass was (or would have been) heard at ctx time p.t0. After the end, the part from loopStart
  // repeats forever, so position(now) is exact and independent of how far ahead the scheduler has run.
  function firstIdx(ev, t) {
    let lo = 0, hi = ev.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (ev[m].t < t - 1e-9) lo = m + 1; else hi = m; }
    return lo;
  }
  function posAt(p, t) {
    const c = p.comp, el = t - p.t0;
    if (el <= 0) return 0;
    if (el < c.total || !c.loops) return Math.min(el, c.total);
    const ll = c.total - c.loopStart;
    return c.loopStart + ((el - c.total) % ll);
  }
  const whenOf = (p, e) => {
    const c = p.comp;
    return p.t0 + (p.pass === 0 ? e.t : c.total + (p.pass - 1) * (c.total - c.loopStart) + (e.t - c.loopStart));
  };

  function killPlaying(fadeSec) {
    const p = st.playing;
    if (!p) return;
    clearInterval(p.timer);
    st.playing = null;
    try {
      const t = now();
      if (fadeSec > 0) {
        p.bus.gain.cancelScheduledValues(t);
        p.bus.gain.setValueAtTime(p.bus.gain.value, t);
        p.bus.gain.linearRampToValueAtTime(0, t + fadeSec);
        setTimeout(() => { try { p.bus.disconnect(); } catch (e) { /* */ } }, fadeSec * 1000 + 250);
      } else p.bus.disconnect();
    } catch (e) { /* */ }
  }

  function tick() {
    const p = st.playing;
    if (!p || !st.ctx) return;
    const t = st.ctx.currentTime, ev = p.comp.events;
    let guard = 0;
    for (;;) {
      if (p.idx >= ev.length) {
        if (p.comp.loops && p.loopIdx < ev.length && guard++ < 4) { p.pass++; p.idx = p.loopIdx; } else {
          if (!p.comp.loops && t > p.t0 + p.comp.total + 0.5) killPlaying(0);
          break;
        }
      }
      const e = ev[p.idx];
      const when = whenOf(p, e);
      if (when > t + LOOK) break;
      if (when >= t - 0.05) voice(p.bus, Math.max(when, t), e);
      p.idx++;
    }
  }

  function startSong(id, opts, fadeMs, pos) {
    killPlaying(0.05);
    if (!st.ctx) return;
    const comp = A.compile(id);
    if (!comp) return;
    pos = Math.max(0, Math.min(pos || 0, comp.total));
    const t = st.ctx.currentTime;
    const start = t + PRE;
    const bus = st.ctx.createGain();
    if (fadeMs > 0) { bus.gain.setValueAtTime(0, t); bus.gain.linearRampToValueAtTime(1, t + fadeMs / 1000); }
    bus.connect(st.musicGain);
    const ev = comp.events;
    const p = { comp, bus, t0: start - pos, pass: 0, idx: firstIdx(ev, pos), loopIdx: firstIdx(ev, comp.loopStart), timer: 0 };
    // notes that were already sounding at `pos` continue (re-struck) for their remaining length, so a resume is seamless
    if (pos > 0) {
      for (let i = p.idx - 1; i >= 0 && ev[i].t > pos - comp.maxDur - 1e-9; i--) {
        const e = ev[i];
        const left = e.t + e.dur - pos;
        if (e.ch !== 'noi' && left > 0.05) voice(bus, start, Object.assign({}, e, { t: 0, dur: left }));
      }
    }
    st.playing = p;
    p.timer = setInterval(tick, TICK);
    tick();
  }

  // where a (re)started song begins: the saved position if it belongs to this song
  function resumePos(id) { return st.saved && st.saved.id === id ? st.saved.pos : 0; }

  A.playSong = function (id, opts) {
    opts = opts || {};
    id = A.resolve(id);
    if (!NP.data.songs[id]) return;
    if (st.cur === id && !opts.restart && (st.playing || st.jingle || st.paused || !st.ctx)) return;
    st.cur = id; st.opts = opts; st.paused = false; st.saved = null;
    if (st.jingle) { st.jingle.requested = true; return; } // starts when the jingle ends
    startSong(id, opts, opts.fadeMs || 0, 0);
  };

  A.stopSong = function (fadeMs) {
    st.cur = null; st.opts = null; st.paused = false; st.saved = null;
    killPlaying((fadeMs || 0) / 1000); // a running jingle rings out; nothing resumes afterwards
  };

  A.pauseSong = function () {
    if (st.paused || !st.cur) return;
    st.paused = true;
    if (st.playing) { st.saved = { id: st.cur, pos: posAt(st.playing, now()) }; killPlaying(0.03); } else if (!st.saved) st.saved = { id: st.cur, pos: 0 };
  };

  A.resumeSong = function () {
    if (!st.paused) return;
    st.paused = false;
    if (!st.cur || st.jingle) return; // a running jingle restarts the music when it ends
    if (st.ctx) startSong(st.cur, st.opts, 0, resumePos(st.cur));
    st.saved = null;
  };

  A.current = () => st.cur;
  /** Exact song position (seconds from the start of the first pass; wraps inside the loop) of the music that is playing or paused. */
  A.position = () => (st.playing ? posAt(st.playing, now()) : st.saved ? st.saved.pos : 0);

  // ---------- jingles ----------
  function endJingle(resumeMusic) {
    const j = st.jingle;
    if (!j) return;
    clearInterval(j.timer);
    st.jingle = null;
    const bus = j.bus;
    setTimeout(() => { try { bus.disconnect(); } catch (e) { /* */ } }, 400);
    if (resumeMusic) {
      if (j.terminal && !j.requested) {
        // victory-style jingle: the music it replaced is gone for good (unless the game asked for another song meanwhile)
        if (st.cur === j.ducked) { st.cur = null; st.opts = null; st.paused = false; }
      }
      if (st.cur && !st.paused) startSong(st.cur, st.opts, 0, resumePos(st.cur));
      if (!st.paused) st.saved = null; // (a paused game keeps its position for resumeSong)
    }
    j.fin();
  }

  A.playJingle = function (id, onDone) {
    let done = false;
    const fin = () => { if (!done) { done = true; if (onDone) { try { onDone(); } catch (e) { /* */ } } } };
    id = A.resolve(id);
    const comp = NP.data.songs[id] && A.compile(id);
    if (!comp || !st.ctx) { fin(); return; }
    let ducked = st.cur;
    if (st.jingle) { ducked = st.jingle.ducked; endJingle(false); } // a newer jingle cuts the older one short
    if (st.playing) { // duck the music, remembering the exact position
      st.saved = { id: st.cur, pos: posAt(st.playing, now()) };
      killPlaying(0.04);
    }
    const bus = st.ctx.createGain();
    bus.connect(st.musicGain);
    const t = st.ctx.currentTime + PRE;
    playEvents(comp.events, bus, t);
    const j = { bus, end: t + comp.seconds + 0.3, fin, terminal: !comp.resume, ducked, requested: false, timer: 0 };
    j.timer = setInterval(() => { if (st.ctx.currentTime >= j.end) endJingle(true); }, 30);
    st.jingle = j;
  };

  // ---------- one-shots ----------
  A.sfx = function (id) {
    if (!st.ctx) return;
    const c = A.sfxEvents(id);
    if (!c) return;
    const t = st.ctx.currentTime;
    if (st.last[id] !== undefined && t - st.last[id] < 0.035) return;
    st.last[id] = t;
    playEvents(c.events, st.sfxGain, t + 0.005);
  };

  A.cry = function (speciesId) {
    if (!st.ctx) return;
    const c = A.cryEvents(speciesId);
    playEvents(c.events, st.sfxGain, st.ctx.currentTime + 0.005);
  };

  A.setVolume = function (v) {
    v = v || {};
    if (typeof v.music === 'number') st.vol.music = Math.max(0, Math.min(1, v.music));
    if (typeof v.sfx === 'number') st.vol.sfx = Math.max(0, Math.min(1, v.sfx));
    if (st.ctx) {
      st.musicGain.gain.setTargetAtTime(st.vol.music, st.ctx.currentTime, 0.02);
      st.sfxGain.gain.setTargetAtTime(st.vol.sfx, st.ctx.currentTime, 0.02);
    }
  };
  A.getVolume = () => ({ music: st.vol.music, sfx: st.vol.sfx });
  A.hasContext = () => !!st.ctx;
})(typeof globalThis !== 'undefined' ? globalThis : window);
