/* src/audio/songs_ch5.js — Chapters 5 and 6 songs: city_shibuyarn (the big city: bright city pop) and town_kite (Kite Hill: breezy and
 * open). Same DS-style arrangement style as songs_world.js. Notation: docs/audio.md */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { arp, bass, weave, block, stab } = NP.audio.dsl;
  const song = NP.audio.song;
  const d = (pat, n) => (pat + ' ').repeat(n).trim();

  // ---------------------------------------------------------------- city_shibuyarn (F major, city pop) — DS-style arrangement
  // A bright synth lead over electric piano stabs, a busy synth bass and a four-on-the-floor kit; a glockenspiel solo in the breakdown.
  {
    const cA = ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Bb', 'C'];
    const cB = ['Bb', 'C', 'Am', 'Dm', 'Bb', 'C', 'F', 'F'];
    const cC = ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'C', 'C'];
    const cI = ['F', 'C'];
    const mA = `a5:2 c6:2 f6:4 e6:2 f6:2 a6:4 | g6:4 e6:2 c6:2 g5:8 | f6:2 e6:2 d6:4 a5:4 d6:4 | d6:6 c6:2 bb5:8 |
           a5:2 c6:2 f6:4 g6:2 a6:2 c7:4 | bb6:4 a6:2 g6:2 e6:8 | d6:2 f6:2 bb6:4 a6:2 g6:2 f6:4 | e6:4 g6:4 c7:8 |`;
    const mB = `d6:4 f6:4 bb6:6 a6:2 | g6:4 e6:4 c6:8 | c6:4 e6:4 a6:6 g6:2 | f6:4 d6:4 a5:8 |
           bb5:2 d6:2 f6:4 bb6:4 a6:4 | g6:4 c7:4 bb6:2 a6:2 g6:4 | a6:8 f6:4 c6:4 | f6:12 r:4 |`;
    const glC = 'd5:4 f5:4 a5:4 f5:4 | bb4:4 d5:4 f5:8 | a4:4 c5:4 f5:4 a5:4 | g5:8 e5:8 | d5:4 f5:4 a5:4 d6:4 | bb5:4 a5:4 f5:8 | g5:4 e5:4 c5:4 e5:4 | g5:12 r:4 |';
    const pop = 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 |';
    const I = { ep: stab(cI, 'X:2 r:2 X:2 r:2 X:4 r:4', 3), bass: bass(cI, '1:2 1:2 8:2 1:2 5:2 1:2 8:2 5:2', 1), drm: d('k:4 h:4 k:4 h:4 |', 2) };
    const A = { mel: mA, ep: stab(cA, 'r:2 X:2 r:2 X:2 r:2 X:2 r:2 X:2', 3), arp: arp(cA, 4), bass: bass(cA, '1:2 1:2 8:2 1:2 5:2 1:2 8:2 5:2', 1), drm: d(pop, 7) + ' k:2 s:2 s:2 s:2 t:2 t:2 x:4 |' };
    const B = { mel: mB, pad: block(cB, 3), ep: stab(cB, 'r:2 X:2 r:2 X:2 r:2 X:2 r:2 X:2', 3), bass: bass(cB, '1:2 1:2 8:2 1:2 5:2 1:2 8:2 5:2', 1), drm: d(pop, 7) + ' k:2 s:2 k:2 s:2 s:2 s:2 x:4 |' };
    const C = { gl: glC, pad: '%v4 ' + block(cC, 3), bass: '%v8 ' + bass(cC, '1:4 r:4 1:4 5:4', 1), drm: d('k:4 h:4 k:4 h:4 |', 7) + ' k:2 s:2 s:2 s:2 s:2 s:2 x:4 |' };
    song('city_shibuyarn', {
      desc: 'Shibuyarn: a bright city-pop groove (synth lead, electric piano, glockenspiel, busy synth bass, four-on-the-floor kit).',
      bpm: 128, loop: 1, order: 'I A B A C B', gain: 0.9,
      inst: {
        mel: { patch: 'warm', vol: 10, tr: -12 }, ep: { patch: 'epiano', vol: 5, pan: -0.3 }, arp: { patch: 'glock', vol: 3, arp: 2, pan: 0.35 },
        gl: { patch: 'glock', vol: 9, pan: 0.1 }, pad: { patch: 'strings', vol: 3 }, bass: { patch: 'synbass', vol: 11 }, drm: { patch: 'kit', vol: 9 },
      },
      sections: { I, A, B, C },
    });
  }

  // ---------------------------------------------------------------- town_kite (D major, breezy) — DS-style arrangement
  // Kite Hill: a flute tune that keeps lifting, harp arpeggios like wind in the lines, pizzicato and a light shuffle; marimba breakdown.
  {
    const cA = ['D', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A'];
    const cB = ['G', 'A', 'F#m', 'Bm', 'G', 'A', 'D', 'D'];
    const cC = ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'A', 'A'];
    const cI = ['D', 'A'];
    const mA = `f#6:4 a6:4 d7:6 c#7:2 | b6:4 a6:4 e6:8 | f#6:2 g6:2 a6:4 b6:4 d7:4 | d7:6 b6:2 g6:8 |
           a6:4 f#6:4 d6:4 f#6:4 | e6:4 a6:4 c#7:8 | b6:4 d7:4 g6:4 b6:4 | a6:12 r:4 |`;
    const mB = `b6:6 a6:2 g6:4 d6:4 | c#7:6 b6:2 a6:8 | a6:4 f#6:4 c#6:4 f#6:4 | b6:8 d7:8 |
           g6:4 b6:4 d7:4 b6:4 | e7:4 c#7:4 a6:8 | f#6:4 a6:4 d7:4 f#7:4 | d7:12 r:4 |`;
    const marC = 'b4:4 d5:4 f#5:4 d5:4 | g4:4 b4:4 d5:8 | a4:4 d5:4 f#5:4 a5:4 | e5:8 c#5:8 | b4:4 d5:4 f#5:4 b5:4 | g5:4 f#5:4 d5:8 | e5:4 c#5:4 a4:4 c#5:4 | e5:12 r:4 |';
    const breeze = 'k:4 g:2 g:2 s:4 g:2 g:2 |';
    const I = { harp: arp(cI, 4), bass: 'd2:16 | a1:16 |', drm: d('r:4 g:2 g:2 r:4 g:2 g:2 |', 2) };
    const A = { mel: mA, harp: arp(cA, 4), pz: stab(cA, 'X:4 r:4 X:4 r:4', 3), bass: bass(cA, '1:6 5:2 8:4 5:4', 2), drm: d(breeze, 7) + ' k:4 s:2 s:2 t:2 t:2 x:4 |' };
    const B = { mel: mB, harp: arp(cB, 4), pad: block(cB, 3), pz: stab(cB, 'X:4 r:4 X:4 r:4', 3), bass: bass(cB, '1:6 5:2 8:4 5:4', 2), drm: d(breeze, 7) + ' k:4 r:4 y:8 |' };
    const C = { mt: marC, pz: stab(cC, 'X:4 r:4 X:4 r:4', 3), pad: '%v3 ' + block(cC, 3), bass: '%v7 ' + bass(cC, '1:8 5:8', 2), drm: d('r:4 g:2 g:2 r:4 g:2 g:2 |', 7) + ' r:8 y:8 |' };
    song('town_kite', {
      desc: 'Kite Hill: breezy and open (flute tune, harp like wind in the lines, pizzicato, light shuffle, marimba breakdown).',
      bpm: 100, loop: 1, order: 'I A B A C B', gain: 0.95,
      inst: {
        mel: { patch: 'flute', vol: 11, tr: -24 }, harp: { patch: 'harp', vol: 5, arp: 2, pan: 0.35 }, pz: { patch: 'pizz', vol: 5, pan: -0.25 },
        mt: { patch: 'marimba', vol: 9, pan: 0.1 }, pad: { patch: 'strings', vol: 3 }, bass: { patch: 'ebass', vol: 10 }, drm: { patch: 'kit', vol: 8 },
      },
      sections: { I, A, B, C },
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
