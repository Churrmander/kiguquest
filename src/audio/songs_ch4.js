/* src/audio/songs_ch4.js — Chapter 4 songs: route_desert (Route 4 and the Dust Bowl), town_desert (Canvas Rest and the Oasis),
 * town_quarry (Bobbin Quarry). Same DS-style arrangement style as songs_world.js. Notation: docs/audio.md */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { arp, bass, weave, block, stab } = NP.audio.dsl;
  const song = NP.audio.song;
  const d = (pat, n) => (pat + ' ').repeat(n).trim();

  // ---------------------------------------------------------------- route_desert (D minor, rolling and dusty) — DS-style arrangement
  // A clarinet tune over the old desert cadence (Dm C Bb A), hand-drum toms and shaker, marimba ripples; a flute alone in the breakdown.
  {
    const cA = ['Dm', 'C', 'Bb', 'A', 'Dm', 'C', 'Bb', 'A'];
    const cB = ['Bb', 'F', 'C', 'A', 'Bb', 'F', 'Gm', 'A'];
    const cC = ['Dm', 'C', 'Dm', 'A', 'Bb', 'C', 'Dm', 'A'];
    const cI = ['Dm', 'A'];
    // the melodies (sounding an octave lower through inst.mel.tr)
    const mA = `d6:4 f6:2 e6:2 d6:4 a5:4 | c6:4 e6:2 d6:2 c6:4 g5:4 | bb5:2 c6:2 d6:4 f6:4 d6:4 | c#6:8 e6:4 a5:4 |
           d6:2 e6:2 f6:4 a6:4 f6:4 | g6:2 f6:2 e6:4 c6:4 g5:4 | f6:4 d6:4 bb5:4 d6:4 | c#6:4 e6:4 a6:8 |`;
    const mB = `d6:6 c6:2 bb5:8 | a5:4 c6:4 f6:8 | e6:6 d6:2 c6:4 g5:4 | a5:4 c#6:4 e6:8 |
           f6:6 e6:2 d6:4 bb5:4 | c6:4 f6:4 a6:8 | g6:4 f6:4 d6:4 bb5:4 | a5:4 c#6:4 e6:4 g6:4 |`;
    // breakdown: a lone flute (written at pitch)
    const flC = '%v10 a4:6 g4:2 f4:4 e4:4 | g4:6 f4:2 e4:4 c4:4 | f4:4 a4:4 d5:8 | c#5:12 r:4 | d5:6 c5:2 bb4:4 a4:4 | g4:6 a4:2 e4:8 | f4:4 e4:4 d4:4 f4:4 | e4:16 |';
    const hand = 'k:4 g:2 g:2 t:4 g:2 g:2 |';
    const I = { mar: weave(cI, 3, [0, 1, 2, 1], 16, 2), bass: 'd2:16 | a1:16 |', drm: d('t:4 g:2 g:2 t:2 t:2 g:2 g:2 |', 2) };
    const A = { mel: mA, mar: weave(cA, 3, [0, 1, 2, 1], 16, 2), gtr: stab(cA, 'X:4 r:2 X:2 r:4 X:4', 3), bass: bass(cA, '1:4 r:2 1:2 5:4 8:4', 2), drm: d(hand, 7) + ' k:4 t:2 t:2 t:2 t:2 t:4 |' };
    const B = {
      mel: mB, harp: arp(cB, 3), pad: block(cB, 3), gtr: stab(cB, 'X:4 r:2 X:2 r:4 X:4', 3), bass: bass(cB, '1:4 r:2 1:2 5:4 8:4', 2),
      drm: 'y:4 g:2 g:2 t:4 g:2 g:2 | ' + d(hand, 6) + ' k:2 g:2 t:2 g:2 t:2 t:2 t:2 t:2 |',
    };
    const C = { fl: flC, pad: '%v3 ' + block(cC, 3), bass: '%v6 ' + bass(cC, '1:16', 2), drm: d('r:4 g:2 g:2 r:4 g:2 g:2 |', 7) + ' r:8 y:8 |' };
    song('route_desert', {
      desc: 'Route 4 and the Dust Bowl: rolling, dusty and a little mysterious (clarinet over Dm-C-Bb-A, marimba, hand drums, flute breakdown).',
      bpm: 112, loop: 1, order: 'I A B A C B', gain: 0.95,
      inst: {
        mel: { patch: 'reed', vol: 10, tr: -12 }, fl: { patch: 'flute', vol: 10, pan: 0.15 }, mar: { patch: 'marimba', vol: 5, pan: 0.3 },
        gtr: { patch: 'guitar', vol: 4, pan: -0.3 }, harp: { patch: 'harp', vol: 4, arp: 2, pan: 0.35 }, pad: { patch: 'strings', vol: 3 },
        bass: { patch: 'ebass', vol: 11 }, drm: { patch: 'kit', vol: 9 },
      },
      sections: { I, A, B, C },
    });
  }

  // ---------------------------------------------------------------- town_desert (G major, shady and slow) — DS-style arrangement
  // Canvas Rest and the Oasis: a lazy afternoon in the shade. Warm lead, harp, nylon strum, wood block and shaker.
  {
    const cA = ['G', 'Em', 'C', 'D', 'G', 'Em', 'Am', 'D'];
    const cB = ['C', 'D', 'Bm', 'Em', 'C', 'D', 'G', 'G'];
    const cI = ['G', 'D'];
    const mA = `b5:4 d6:4 g6:6 f#6:2 | e6:8 b5:4 g5:4 | c6:4 e6:4 g6:4 e6:4 | d6:12 r:4 |
           b5:4 d6:4 g6:4 a6:4 | b6:6 a6:2 g6:4 e6:4 | c6:4 e6:4 a6:4 g6:4 | f#6:8 d6:8 |`;
    const mB = `e6:6 g6:2 e6:4 c6:4 | f#6:6 a6:2 f#6:4 d6:4 | d6:4 f#6:4 b6:8 | g6:6 f#6:2 e6:8 |
           e6:4 g6:4 c7:4 b6:4 | a6:4 f#6:4 d6:4 a6:4 | g6:16 | r:8 d6:4 g6:4 |`;
    const strum = (ch) => stab(ch, 'X:4 r:2 X:2 X:4 r:2 X:2', 3);
    const lazy = 'k:4 g:2 g:2 w:4 g:2 g:2 |';
    const I = { gtr: strum(cI), harp: arp(cI, 3), bass: 'g1:16 | d2:16 |', drm: d('r:4 g:2 g:2 w:4 g:2 g:2 |', 2) };
    const A = { mel: mA, gtr: strum(cA), harp: arp(cA, 3), bass: bass(cA, '1:6 5:2 8:4 5:4', 2), drm: d(lazy, 7) + ' k:4 g:2 g:2 w:2 w:2 w:4 |' };
    const B = { mel: mB, gtr: strum(cB), pad: block(cB, 3), harp: arp(cB, 3), bass: bass(cB, '1:6 5:2 8:4 5:4', 2), drm: d(lazy, 6) + ' k:4 r:4 y:8 | r:8 w:2 w:2 w:4 |' };
    song('town_desert', {
      desc: 'Canvas Rest and the Oasis: a slow, shady afternoon (warm lead, harp, nylon strum, wood block and shaker).',
      bpm: 96, loop: 1, order: 'I A B A', gain: 0.95,
      inst: {
        mel: { patch: 'warm', vol: 10, tr: -12 }, gtr: { patch: 'guitar', vol: 5, pan: -0.3 }, harp: { patch: 'harp', vol: 5, arp: 2, pan: 0.35 },
        pad: { patch: 'strings', vol: 3 }, bass: { patch: 'ebass', vol: 10 }, drm: { patch: 'kit', vol: 8 },
      },
      sections: { I, A, B },
    });
  }

  // ---------------------------------------------------------------- town_quarry (C major, sturdy work song) — DS-style arrangement
  // Bobbin Quarry: a steady brass tune with anvil clinks on the off-beats, pizzicato and a walking bass.
  {
    const cA = ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G'];
    const cB = ['F', 'G', 'Em', 'Am', 'F', 'G', 'C', 'C'];
    const cI = ['C', 'G'];
    const mA = `e6:4 g6:4 c6:4 e6:4 | d6:4 g6:4 b5:8 | c6:4 e6:4 a6:4 g6:4 | f6:8 a5:8 |
           e6:2 e6:2 g6:4 c7:4 g6:4 | b6:4 a6:4 g6:4 d6:4 | c6:4 a6:4 f6:4 c6:4 | d6:4 b5:4 g5:8 |`;
    const mB = `a5:4 c6:4 f6:6 e6:2 | d6:4 b5:4 g5:8 | g5:4 b5:4 e6:6 d6:2 | c6:12 r:4 |
           f6:4 a6:4 c7:6 a6:2 | b6:4 g6:4 d6:8 | e6:4 d6:4 c6:8 | r:16 |`;
    const work = 'k:4 h:2 a:2 s:4 h:2 h:2 |';
    const I = { pz: stab(cI, 'X:2 r:2 X:2 r:2 X:2 r:2 X:2 r:2', 3), bass: 'c2:16 | g1:16 |', drm: d('k:4 r:2 a:2 r:4 a:4 |', 2) };
    const A = { mel: mA, pz: stab(cA, 'X:2 r:2 X:2 r:2 X:2 r:2 X:2 r:2', 3), mar: weave(cA, 3, [0, 2, 1, 2], 16, 2), bass: bass(cA, '1:4 3:4 5:4 3:4', 2), drm: d(work, 7) + ' k:2 s:2 s:2 s:2 t:2 t:2 a:4 |' };
    const B = { mel: mB, pad: block(cB, 3), pz: stab(cB, 'X:2 r:2 X:2 r:2 X:2 r:2 X:2 r:2', 3), bass: bass(cB, '1:4 3:4 5:4 3:4', 2), drm: d(work, 6) + ' k:4 h:2 a:2 s:2 s:2 s:4 | x:8 a:4 a:4 |' };
    // breakdown: the marimba alone over pizzicato, then the anvils come back in (written at pitch)
    const cC = ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'G'];
    const marC = 'a4:4 c5:4 e5:4 c5:4 | f4:4 a4:4 c5:8 | e5:4 g5:4 c5:4 e5:4 | d5:8 b4:8 | c5:4 e5:4 a5:4 g5:4 | f5:4 e5:4 c5:8 | d5:4 b4:4 g4:4 b4:4 | d5:12 r:4 |';
    const C = { mt: marC, pz: stab(cC, 'X:4 r:4 X:4 r:4', 3), pad: '%v3 ' + block(cC, 3), bass: '%v7 ' + bass(cC, '1:8 5:8', 2), drm: d('k:4 r:4 a:4 r:4 |', 7) + ' k:2 a:2 a:2 a:2 s:2 s:2 s:4 |' };
    song('town_quarry', {
      desc: 'Bobbin Quarry: a sturdy work song (brass tune, anvil clinks, pizzicato, marimba and a walking bass).',
      bpm: 104, loop: 1, order: 'I A B A C B', gain: 0.95,
      inst: {
        mel: { patch: 'brass', vol: 9, tr: -12 }, pz: { patch: 'pizz', vol: 5, pan: -0.25 }, mar: { patch: 'marimba', vol: 4, pan: 0.3 },
        mt: { patch: 'marimba', vol: 9, pan: 0.1 }, pad: { patch: 'strings', vol: 3 }, bass: { patch: 'ebass', vol: 11 }, drm: { patch: 'kit', vol: 9 },
      },
      sections: { I, A, B, C },
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
