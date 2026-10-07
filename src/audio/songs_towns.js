/* src/audio/songs_towns.js — title, intro, towns, tea house, credits. Notation: docs/audio.md */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { arp, bass } = NP.audio.dsl;
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

  // ---------------------------------------------------------------- home_town (Button Town)
  {
    const cA = ['C', 'Em', 'Am', 'F', 'C', 'G', 'F', 'G7'];
    const cB = ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'C'];
    const A = {
      p1: `%ep e5:4 g5:2 e5:2 c5:4 r:2 d5:2 | e5:4 b4:2 e5:2 g5:6 r:2 | a5:4 g5:2 e5:2 c5:4 e5:2 d5:2 | f5:4 e5:2 c5:2 a4:4 c5:4 |
           e5:4 g5:2 e5:2 c6:4 g5:2 e5:2 | d5:4 g5:2 d5:2 b4:4 d5:4 | f5:2 e5:2 d5:2 c5:2 a4:4 c5:4 | d5:4 f5:2 d5:2 g5:8 |`,
      p2: arp(cA, 4),
      tri: bass(cA, '1:6 5:2 1:4 5:4', 2),
      noi: 'k:4 h:2 h:2 s:4 h:4 |'.repeat(8),
    };
    const B = {
      p1: `%ep c6:2 b5:2 a5:4 e5:2 a5:2 c6:4 | a5:2 g5:2 f5:4 c5:2 f5:2 a5:4 | g5:2 e5:2 g5:4 c6:2 b5:2 g5:4 | d5:2 g5:2 b5:4 a5:2 g5:2 d5:4 |
           c6:2 b5:2 a5:4 e6:2 d6:2 c6:4 | a5:2 c6:2 f6:4 e6:2 d6:2 c6:4 | b5:4 d6:4 g6:4 f6:2 d6:2 | e6:8 g5:4 e5:4 |`,
      p2: arp(cB, 4),
      tri: bass(cB, '1:4 5:4 8:4 5:4', 2),
      noi: 'k:4 h:2 h:2 s:4 h:2 k:2 |'.repeat(8),
    };
    song('home_town', {
      desc: 'Button Town: gentle, nostalgic waltz-time home theme.',
      bpm: 92, swing: 0.04, loop: 0, order: 'A A2 B A',
      inst: { p1: { duty: 2, vol: 10 }, p2: { duty: 1, vol: 5 }, tri: { vol: 12 }, noi: { vol: 4 } },
      sections: { A, A2: Object.assign({}, A, { p2: arp(cA, 5) }), B },
    });
  }

  // ---------------------------------------------------------------- town_thimble (folk waltz, 3/4)
  {
    const cA = ['D', 'G', 'D', 'A', 'D', 'G', 'A', 'D'];
    const cB = ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'A', 'D'];
    const A = {
      p1: `f#5:4 a5:4 d6:4 | b5:4 g5:4 d5:4 | f#5:4 a5:2 f#5:2 d5:4 | e5:4 a5:4 c#6:4 |
           d6:4 a5:4 f#5:4 | g5:2 a5:2 b5:4 d6:4 | c#6:4 e6:4 a5:4 | d6:8 a5:2 f#5:2 |`,
      p2: oom(cA, 4),
      tri: bass(cA, '1:4 5:4 5:4', 2, 12),
      noi: 'k:4 s:2 h:2 s:2 h:2 |'.repeat(8),
    };
    const B = {
      p1: `%d1 b5:4 d6:4 f#6:4 | g6:4 d6:4 b5:4 | a5:4 d6:4 f#6:4 | e6:6 c#6:2 a5:4 |
           b5:2 c#6:2 d6:4 f#6:4 | g6:4 f#6:2 e6:2 d6:4 | c#6:4 d6:4 e6:4 | d6:12 |`,
      p2: oom(cB, 4),
      tri: bass(cB, '1:4 5:4 5:4', 2, 12),
      noi: 'k:4 h:2 h:2 s:2 h:2 |'.repeat(8),
    };
    song('town_thimble', {
      desc: 'Thimble Village: cosy folk strum, sewing-circle charm.',
      bpm: 112, bar: 12, loop: 0, order: 'A B A B',
      inst: { p1: { duty: 2, vol: 10, env: 'pluck' }, p2: { duty: 1, vol: 5, env: 'pluck' }, tri: { vol: 12 }, noi: { vol: 4 } },
      sections: { A, B },
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
