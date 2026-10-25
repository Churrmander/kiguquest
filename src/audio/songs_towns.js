/* src/audio/songs_towns.js — title, intro, towns, tea house, credits. Notation: docs/audio.md */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { arp, bass, weave, block, stab } = NP.audio.dsl;
  const d = (pat, n) => (pat + ' ').repeat(n).trim();
  const song = NP.audio.song;
  // oom-pah-pah strum for 3/4 folk bars: chord stabs on beats 2 and 3
  const oom = (chords, oct) => chords.map((c) => `r:4 ^${c}${oct}:4 ^${c}${oct}:4`).join(' | ') + ' |';

  // ---------------------------------------------------------------- title
  {
    const cA = ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D'];
    const cB = ['Em', 'C', 'G', 'D', 'Em', 'C', 'D', 'D'];
    const I = {
      p1: 'r:16 | r:8 g5:2 a5:2 b5:2 d6:2 |',
      p2: '^G4:16 | ^D4:16 |',
      tri: 'g2:8 d3:8 | d2:8 a2:8 |',
      noi: 'r:16 | k:4 h:4 s:2 s:2 s:2 s:2 |',
    };
    const A = {
      p1: `b4:2 d5:2 g5:4 d5:2 b4:2 g5:4 | a5:2 f#5:2 d5:4 a4:2 d5:2 f#5:4 | g5:2 e5:2 b4:4 e5:2 g5:2 b5:4 | c6:4 g5:2 e5:2 g5:4 c5:4 |
           b4:2 d5:2 g5:4 b5:2 a5:2 g5:4 | f#5:2 a5:2 d6:4 c6:2 a5:2 f#5:4 | e5:2 g5:2 c6:4 b5:2 g5:2 e5:4 | d5:2 f#5:2 a5:2 d6:2 c6:8 |`,
      p2: arp(cA, 4),
      tri: bass(cA, '1:4 1:2 5:2 1:4 5:2 8:2', 2),
      noi: 'k:4 h:2 h:2 s:4 h:2 h:2 |'.repeat(8),
    };
    const B = {
      p1: `%d1 g5:4 b5:4 e6:8 | e6:4 d6:4 c6:4 g5:4 | b5:4 d6:4 g6:8 | f#6:4 e6:4 d6:4 a5:4 |
           g5:4 b5:4 e6:6 g6:2 | g6:4 e6:4 c6:4 e6:4 | d6:4 f#6:4 a6:4 f#6:4 | d6:8 r:4 a5:2 d6:2 |`,
      p2: arp(cB, 4),
      tri: bass(cB, '1:2 1:2 5:2 1:2 8:2 5:2 1:2 5:2', 2),
      noi: 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 |'.repeat(8),
    };
    song('title', {
      desc: 'Title screen: bright, hopeful folk-pop with a rising fanfare intro.',
      bpm: 112, loop: 1, order: 'I A B A B',
      inst: { p1: { duty: 2, vol: 11 }, p2: { duty: 1, vol: 6 }, noi: { vol: 8 } },
      sections: { I, A, B },
    });
  }

  // ---------------------------------------------------------------- intro (professor's lab)
  {
    const cA = ['F', 'Dm', 'Bb', 'C', 'F', 'Am', 'Bb', 'C'];
    const cB = ['Dm', 'Gm', 'C', 'F', 'Dm', 'Bb', 'C', 'C'];
    const A = {
      p1: `%ep a5:4 c6:2 a5:2 f5:4 c5:4 | d5:2 f5:2 a5:4 d6:4 a5:4 | bb5:4 a5:2 g5:2 f5:4 d5:4 | e5:2 g5:2 c6:4 bb5:4 g5:4 |
           a5:4 c6:2 a5:2 f6:4 c6:4 | e6:4 c6:2 a5:2 e5:4 a5:4 | d6:4 bb5:2 d6:2 f6:4 d6:4 | c6:4 e6:2 g5:2 c6:8 |`,
      p2: arp(cA, 4),
      tri: bass(cA, '1:8 5:8', 2),
      noi: 'k:8 h:4 h:4 |'.repeat(8),
    };
    const B = {
      p1: `%d1 d6:2 r:2 d6:2 r:2 c6:2 a5:2 f5:4 | g5:2 r:2 g5:2 r:2 bb5:2 d6:2 g6:4 | e6:2 r:2 e6:2 r:2 d6:2 c6:2 g5:4 | a5:4 c6:4 f6:8 |
           d6:2 r:2 d6:2 r:2 e6:2 f6:2 a6:4 | bb5:4 d6:4 f6:4 d6:4 | c6:2 d6:2 e6:2 g6:2 c6:8 | bb5:4 g5:4 e5:4 g5:4 |`,
      p2: arp(cB, 4),
      tri: bass(cB, '1:4 5:4 1:4 8:4', 2),
      noi: 'k:4 h:4 s:4 h:4 |'.repeat(8),
    };
    song('intro', {
      desc: 'Professor\'s lab and opening scenes: warm, curious and gently playful.',
      bpm: 84, loop: 0, order: 'A B A B',
      inst: { p1: { duty: 2, vol: 10 }, p2: { duty: 1, vol: 5, arp: 2 }, tri: { vol: 12 }, noi: { vol: 4 } },
      sections: { A, B },
    });
  }

  // ---------------------------------------------------------------- home_town (Button Town) — DS-style arrangement
  {
    const cA = ['C', 'Em', 'Am', 'F', 'C', 'G', 'F', 'G7'];
    const cB = ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'C'];
    const cC = ['Fmaj7', 'Em7', 'Dm7', 'G', 'Fmaj7', 'Em7', 'Am7', 'Gsus,G7'];
    const cI = ['C', 'Am', 'F', 'G'];
    // the original melodies (sounding an octave lower through inst.mel.tr)
    const mA = `e5:4 g5:2 e5:2 c5:4 r:2 d5:2 | e5:4 b4:2 e5:2 g5:6 r:2 | a5:4 g5:2 e5:2 c5:4 e5:2 d5:2 | f5:4 e5:2 c5:2 a4:4 c5:4 |
           e5:4 g5:2 e5:2 c6:4 g5:2 e5:2 | d5:4 g5:2 d5:2 b4:4 d5:4 | f5:2 e5:2 d5:2 c5:2 a4:4 c5:4 | d5:4 f5:2 d5:2 g5:8 |`;
    const mB = `c6:2 b5:2 a5:4 e5:2 a5:2 c6:4 | a5:2 g5:2 f5:4 c5:2 f5:2 a5:4 | g5:2 e5:2 g5:4 c6:2 b5:2 g5:4 | d5:2 g5:2 b5:4 a5:2 g5:2 d5:4 |
           c6:2 b5:2 a5:4 e6:2 d6:2 c6:4 | a5:2 c6:2 f6:4 e6:2 d6:2 c6:4 | b5:4 d6:4 g6:4 f6:2 d6:2 | e6:8 g5:4 e5:4 |`;
    const ctrB = 'e4:8 c4:8 | f4:8 c4:8 | e4:8 g4:8 | d4:8 b3:8 | e4:8 a4:8 | f4:8 a4:8 | g4:8 f4:8 | e4:16 |';
    // breakdown: the piano takes a quiet new tune over the IV chord colour
    const pnoC = '%v10 a4:4 c5:4 e5:6 r:2 | g4:4 b4:4 d5:6 r:2 | f4:4 a4:4 c5:4 e5:4 | d5:8 b4:4 g4:4 | a4:4 c5:4 f5:4 e5:4 | e5:4 d5:4 b4:4 g4:4 | c5:4 e5:4 a4:4 c5:4 | d5:8 b4:4 f5:4 |';
    const groove = d('k:4 g:2 g:2 i:4 g:2 g:2 |', 8);
    const I = { harp: arp(cI, 3), pad: block(cI, 3), bass: 'c2:16 | a1:16 | f1:16 | g1:8 g1:4 b1:4 |' };
    const A = { mel: mA, keys: weave(cA, 3, [0, 1, 2, 1], 16, 2), bass: bass(cA, '1:6 5:2 1:4 5:4', 2), drm: groove };
    const A2 = { mel: mA, harp: arp(cA, 3), pad: block(cA, 3), bass: bass(cA, '1:6 5:2 1:4 5:4', 2), drm: d('k:4 g:2 g:2 i:4 g:2 k:2 |', 8) };
    const B = {
      mel: mB, ctr: ctrB, keys: weave(cB, 3, [0, 2, 1, 2], 16, 2), pad: block(cB, 3), bass: bass(cB, '1:4 5:4 8:4 5:4', 2),
      drm: d('k:4 g:2 g:2 i:4 g:2 g:2 |', 7) + ' k:4 g:2 g:2 i:2 i:2 t:2 t:2 |',
    };
    const C = { keys: pnoC, harp: weave(cC, 3, [0, 1, 2, 3], 16, 4), pad: '%v3 ' + block(cC, 3), bass: '%v7 ' + bass(cC, '1:16', 2), drm: d('r:16 |', 7) + ' r:8 y:8 |' };
    song('home_town', {
      desc: 'Button Town: gentle, nostalgic home theme (flute, piano, harp, strings).',
      bpm: 92, swing: 0.04, loop: 1, order: 'I A A2/rd B C A2/hi B', gain: 0.86,
      inst: {
        mel: { patch: 'flute', vol: 11, tr: -12 }, ctr: { patch: 'reed', vol: 6, pan: 0.3 }, keys: { patch: 'piano', vol: 7, pan: -0.25 },
        harp: { patch: 'harp', vol: 7, arp: 2, pan: 0.35 }, pad: { patch: 'strings', vol: 4 }, bass: { patch: 'ebass', vol: 11 }, drm: { patch: 'kit', vol: 8 },
      },
      vars: { rd: { mel: { patch: 'reed', vol: 10 } }, hi: { mel: { tr: 0, vol: 9 } } },
      sections: { I, A, A2, B, C },
    });
  }

  // ---------------------------------------------------------------- town_thimble (folk waltz, 3/4) — DS-style arrangement
  {
    const cA = ['D', 'G', 'D', 'A', 'D', 'G', 'A', 'D'];
    const cB = ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'A', 'D'];
    const cC = ['G', 'D', 'Em', 'A', 'G', 'D', 'Em,A', 'D'];
    const mA = `f#5:4 a5:4 d6:4 | b5:4 g5:4 d5:4 | f#5:4 a5:2 f#5:2 d5:4 | e5:4 a5:4 c#6:4 |
           d6:4 a5:4 f#5:4 | g5:2 a5:2 b5:4 d6:4 | c#6:4 e6:4 a5:4 | d6:8 a5:2 f#5:2 |`;
    const mB = `b5:4 d6:4 f#6:4 | g6:4 d6:4 b5:4 | a5:4 d6:4 f#6:4 | e6:6 c#6:2 a5:4 |
           b5:2 c#6:2 d6:4 f#6:4 | g6:4 f#6:2 e6:2 d6:4 | c#6:4 d6:4 e6:4 | d6:12 |`;
    // counter line under B (sustained, a sixth below)
    const ctrB = 'd4:12 | b3:12 | a3:12 | c#4:12 | d4:12 | d4:6 b3:6 | a3:6 g3:6 | f#3:12 |';
    // breakdown: a music-box glockenspiel answer (sparse) over harp
    const glkC = 'b4:4 r:4 d5:4 | a4:8 r:4 | g4:4 b4:4 e5:4 | c#5:8 r:4 | b4:4 r:4 d5:4 | f#5:8 r:4 | e5:4 g4:4 c#5:4 | d5:8 r:4 |';
    const oom = (ch) => stab(ch, 'r:4 X:4 X:4', 3, 12);
    const I = { gtr: oom(['D', 'A', 'D', 'A']), bass: bass(['D', 'A', 'D', 'A'], '1:4 r:8', 2, 12), drm: d('k:4 j:4 j:4 |', 4) };
    const A = { mel: mA, gtr: oom(cA), bass: bass(cA, '1:4 5:4 5:4', 2, 12), drm: d('k:4 j:4 j:4 |', 7) + ' k:4 j:4 i:2 i:2 |' };
    const B = { mel: mB, ctr: ctrB, gtr: oom(cB), pz: weave(cB, 3, [0, 2, 1], 12, 4), bass: bass(cB, '1:4 5:4 5:4', 2, 12), drm: d('k:4 j:2 j:2 i:4 |', 8) };
    const C = { glk: glkC, harp: weave(cC, 3, [0, 1, 2, 3, 2, 1], 12, 2), pad: '%v4 ' + block(cC, 3, 12), bass: '%v7 ' + bass(cC, '1:12', 2, 12) };
    song('town_thimble', {
      desc: 'Thimble Village: cosy folk waltz (reed, guitar strum, pizzicato, music-box breakdown).',
      bpm: 112, bar: 12, loop: 1, order: 'I A B A/mr C B', gain: 0.95,
      inst: {
        mel: { patch: 'reed', vol: 10, tr: -12 }, ctr: { patch: 'strings', vol: 5, pan: -0.2 }, gtr: { patch: 'guitar', vol: 4, pan: 0.3 },
        pz: { patch: 'pizz', vol: 6, pan: -0.35 }, glk: { patch: 'glock', vol: 9, pan: 0.15 }, harp: { patch: 'harp', vol: 8, pan: -0.3 },
        pad: { patch: 'pad', vol: 5 }, bass: { patch: 'ebass', vol: 11 }, drm: { patch: 'kit', vol: 8 },
      },
      vars: { mr: { mel: { patch: 'marimba', vol: 11 } } },
      sections: { I, A, B, C },
    });
  }

  // ---------------------------------------------------------------- tea_house (lullaby, 3/4)
  {
    const cA = ['C', 'Am', 'F', 'G', 'C', 'Em', 'F', 'G'];
    const cB = ['F', 'C', 'Dm', 'G', 'F', 'C', 'G', 'C'];
    const A = {
      p1: `e5:6 g5:2 e5:4 | a5:6 e5:2 c5:4 | f5:4 a5:4 c6:4 | b5:6 g5:2 d5:4 |
           e5:6 g5:2 c6:4 | b5:6 g5:2 e5:4 | a5:4 g5:4 f5:4 | d5:12 |`,
      p2: arp(cA, 4, 12),
      tri: bass(cA, '1:6 5:6', 2, 12),
      noi: 'k:6 h:6 |'.repeat(8),
    };
    const B = {
      p1: `c6:6 a5:2 f5:4 | e6:6 c6:2 g5:4 | d6:4 f6:4 a5:4 | g5:4 b5:4 d6:4 |
           c6:6 a5:2 c6:4 | g6:6 e6:2 c6:4 | b5:4 d6:4 g5:4 | c6:12 |`,
      p2: arp(cB, 4, 12),
      tri: bass(cB, '1:6 5:6', 2, 12),
      noi: 'k:6 h:6 |'.repeat(8),
    };
    song('tea_house', {
      desc: 'Tea House and heal stations: soft, lullaby-ish and calming.',
      bpm: 72, bar: 12, loop: 0, order: 'A B A B',
      inst: { p1: { duty: 2, vol: 8, env: 'pluck' }, p2: { duty: 1, vol: 4, arp: 2 }, tri: { vol: 11 }, noi: { vol: 3 } },
      sections: { A, B },
    });
  }

  // ---------------------------------------------------------------- credits
  {
    const cA = ['C', 'G', 'Am', 'Em', 'F', 'C', 'Dm', 'G'];
    const cB = ['F', 'G', 'Em', 'Am', 'F', 'G', 'C', 'C'];
    const A = {
      p1: `g5:4 e5:2 c5:2 e5:4 g5:4 | d6:4 b5:2 g5:2 b5:4 d6:4 | c6:4 a5:2 e5:2 a5:4 c6:4 | b5:4 g5:2 e5:2 g5:4 b5:4 |
           a5:4 f5:2 c5:2 f5:4 a5:4 | g5:4 c6:4 e6:8 | f6:4 d6:2 a5:2 d6:4 f6:4 | g6:4 d6:4 b5:4 g5:4 |`,
      p2: arp(cA, 4),
      tri: bass(cA, '1:4 1:2 5:2 1:4 5:4', 2),
      noi: 'k:4 h:2 h:2 s:4 h:2 h:2 |'.repeat(8),
    };
    const B = {
      p1: `%d1 c6:8 a5:4 c6:4 | b5:8 d6:4 g6:4 | g6:6 e6:2 b5:8 | c6:4 e6:4 a6:8 |
           a6:4 f6:4 c6:4 a5:4 | g5:4 b5:4 d6:4 g6:4 | e6:8 c6:4 g5:4 | c6:12 g5:2 e5:2 |`,
      p2: arp(cB, 4),
      tri: bass(cB, '1:2 1:2 5:2 1:2 8:2 5:2 1:2 5:2', 2),
      noi: 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 |'.repeat(8),
    };
    song('credits', {
      desc: 'Ending credits roll: warm, reflective, looks back over the journey.',
      bpm: 100, loop: 0, order: 'A B A2 B',
      inst: { p1: { duty: 2, vol: 11 }, p2: { duty: 1, vol: 6 }, noi: { vol: 7 } },
      sections: { A, B, A2: Object.assign({}, A, { p1: '%d1 ' + A.p1, p2: arp(cA, 5) }) },
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
