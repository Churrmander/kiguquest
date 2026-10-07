/* src/audio/songs_p2.js — Phase-2 songs: legendary/admin/elite/champion battles, league, hall of fame, ending. Notation: docs/audio.md */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { arp, bass } = NP.audio.dsl;
  const song = NP.audio.song;
  const d = (pat, n) => (pat + ' ').repeat(n).trim();
  // tracks helper: chord lists drive arps + bass; melody strings are given per section
  const sec = (mel, chords, bassPat, drums, o) =>
    Object.assign({ p1: mel, p2: arp(chords, (o && o.arpOct) || 4), tri: bass(chords, bassPat, 2), noi: drums }, o && o.extra);

  song('battle_legend', {

    desc: 'Warpa and Weftie legendary battles: epic, soaring and mythic.',
    bpm: 150, loop: 0, order: 'A B A B',
    inst: { p1: { duty: 2, vol: 12 }, p2: { duty: 1, vol: 7 }, tri: { vol: 14 }, noi: { vol: 10 } },
    sections: {
      A: sec(`g5:6 bb5:2 d6:8 | eb6:6 d6:2 bb5:8 | bb5:4 d6:4 f6:8 | a5:4 c6:4 f6:4 e6:4 |
              g5:2 g5:2 bb5:2 d6:2 g6:8 | g6:4 eb6:4 bb5:4 eb6:4 | c6:4 eb6:4 g6:4 c7:4 | f#6:4 d6:4 a5:4 f#5:4 |`,
        ['Gm', 'Eb', 'Bb', 'F', 'Gm', 'Eb', 'Cm', 'D'], '1:2 1:2 8:2 1:2 5:2 1:2 8:2 5:2', d('k:2 h:2 s:2 h:2 k:2 k:2 s:2 x:2 |', 8)),
      B: sec(`g5:1 a5:1 bb5:1 d6:1 g6:2 d6:2 bb5:2 d6:2 g6:4 | f5:1 g5:1 a5:1 c6:1 f6:2 c6:2 a5:2 c6:2 f6:4 | eb5:1 f5:1 g5:1 bb5:1 eb6:2 bb5:2 g5:2 bb5:2 eb6:4 | d6:1 e6:1 f#6:1 a6:1 d6:2 f#6:2 a6:4 f#6:4 |
              g5:1 a5:1 bb5:1 d6:1 g6:2 d6:2 bb5:2 d6:2 g6:4 | f5:1 g5:1 a5:1 c6:1 f6:2 c6:2 a5:2 c6:2 f6:4 | a5:2 d6:2 f#6:2 a6:2 f#6:2 d6:2 a5:4 | d6:8 f#6:4 a6:4 |`,
        ['Gm', 'F', 'Eb', 'D', 'Gm', 'F', 'D', 'D'], '1:2 1:2 8:2 1:2 1:2 5:2 8:2 5:2', d('k:2 h:2 s:2 h:2 k:2 h:2 s:2 s:1 s:1 |', 8)),
    },
  });

  song('battle_admin', {

    desc: 'Pleat (Starch Society admin) battles: tense, sharp and urgent.',
    bpm: 148, loop: 0, order: 'A B A B',
    inst: { p1: { duty: 0, vol: 12 }, p2: { duty: 1, vol: 6 }, tri: { vol: 14 }, noi: { vol: 9 } },
    sections: {
      A: sec(`a5:1 r:1 a5:1 r:1 c6:2 e6:2 a6:4 e6:4 | a5:1 r:1 a5:1 r:1 c6:2 e6:2 g#6:4 e6:4 | f5:1 r:1 f5:1 r:1 a5:2 c6:2 f6:4 c6:4 | e6:2 d6:2 c6:2 b5:2 g#5:8 |
              a5:1 r:1 a5:1 r:1 c6:2 e6:2 a6:4 e6:4 | d6:2 f6:2 a6:2 f6:2 d6:4 a5:4 | g#5:2 b5:2 e6:2 g#6:2 b6:4 g#6:4 | e6:8 r:8 |`,
        ['Am', 'Am', 'F', 'E', 'Am', 'Dm', 'E', 'E'], '1:3 r:1 1:3 r:1 5:2 1:2 8:2 5:2', d('k:2 s:2 k:2 s:2 k:2 k:2 s:2 s:2 |', 8)),
      B: sec(`[ f6:2 ]x4 c6:4 a5:4 | [ e6:2 ]x4 b5:4 g#5:4 | [ a5:2 ]x4 c6:4 e6:4 | a6:4 e6:4 c6:4 a5:4 |
              [ d6:2 ]x4 f6:4 a6:4 | [ e6:2 ]x4 g#6:4 b5:4 | a5:2 c6:2 e6:2 a6:2 e6:2 c6:2 a5:4 | g#5:2 b5:2 e6:2 g#6:2 e6:8 |`,
        ['F', 'E', 'Am', 'Am', 'Dm', 'E', 'Am', 'E'], '1:2 1:2 8:2 1:2 1:2 5:2 8:2 5:2', d('k:2 s:2 k:2 s:2 k:2 s:1 s:1 s:2 s:2 |', 8)),
    },
  });

  song('battle_needle', {

    desc: 'Four Needles Elite Four battles: grand, intense and polished.',
    bpm: 162, loop: 0, order: 'A B A B',
    inst: { p1: { duty: 1, vol: 12 }, p2: { duty: 2, vol: 7 }, tri: { vol: 14 }, noi: { vol: 10 } },
    sections: {
      A: sec(`f5:2 ab5:2 c6:4 f6:4 c6:4 | db6:4 f6:4 ab6:4 f6:4 | ab5:2 c6:2 eb6:4 ab6:4 eb6:4 | g6:4 eb6:4 bb5:4 g5:4 |
              f5:2 ab5:2 c6:4 f6:4 ab6:4 | f6:4 db6:4 ab5:4 db6:4 | bb5:2 db6:2 f6:4 bb6:4 f6:4 | g5:2 c6:2 e6:2 g6:2 e6:2 c6:2 g5:4 |`,
        ['Fm', 'Db', 'Ab', 'Eb', 'Fm', 'Db', 'Bbm', 'C'], '1:2 1:2 8:2 1:2 5:2 1:2 8:2 5:2', d('k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 |', 8)),
      B: sec(`db6:8 c6:4 db6:4 | eb6:8 d6:4 eb6:4 | f6:6 eb6:2 c6:8 | ab6:4 f6:4 c6:4 f6:4 |
              db6:2 f6:2 ab6:4 f6:2 db6:2 ab5:4 | eb6:2 g6:2 bb6:4 g6:2 eb6:2 bb5:4 | e6:2 g6:2 c7:4 g6:4 e6:4 | c6:8 e6:4 g6:4 |`,
        ['Db', 'Eb', 'Fm', 'Fm', 'Db', 'Eb', 'C', 'C'], '1:2 1:2 8:2 1:2 5:2 1:2 8:2 5:2', d('k:2 h:2 s:2 h:2 k:2 k:2 s:2 s:2 |', 8)),
    },
  });

  song('battle_grand', {

    desc: 'Grand Tailor Champion battle: triumphant, epic and relentless.',
    bpm: 156, loop: 0, order: 'A B A B',
    inst: { p1: { duty: 2, vol: 12 }, p2: { duty: 1, vol: 8 }, tri: { vol: 14 }, noi: { vol: 10 } },
    sections: {
      A: sec(`b5:4 d6:4 f#6:8 | g6:4 f#6:2 e6:2 d6:8 | d6:4 f#6:4 a6:8 | a6:4 g6:2 f#6:2 e6:8 |
              b5:2 d6:2 f#6:4 b6:4 f#6:4 | g6:4 b6:4 g6:4 d6:4 | e6:4 g6:4 b6:4 g6:4 | c#6:2 e6:2 a6:4 e6:4 c#6:4 |`,
        ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'Em', 'A'], '1:2 1:2 8:2 1:2 5:2 1:2 8:2 5:2', d('k:2 h:2 s:2 h:2 k:2 k:2 s:2 x:2 |', 8)),
      B: sec(`a5:2 d6:2 f#6:2 a6:2 d6:8 | e6:2 a6:2 c#6:2 e6:2 a5:8 | b5:2 d6:2 f#6:2 b6:2 f#6:8 | g6:2 b6:2 d6:2 g6:2 d6:8 |
              a5:2 d6:2 f#6:2 a6:2 d6:8 | e6:4 c#6:4 a5:4 c#6:4 | g5:2 b5:2 d6:2 g6:2 b6:4 g6:4 | a6:8 e6:4 c#6:4 |`,
        ['D', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A'], '1:2 1:2 8:2 1:2 5:2 1:2 8:2 5:2', d('k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 |', 8)),
    },
  });

  song('league', {

    desc: 'Grand Atelier and Elite Four halls: stately, expectant and regal.',
    bpm: 96, loop: 0, order: 'A B A B',
    inst: { p1: { duty: 2, vol: 11 }, p2: { duty: 1, vol: 6, arp: 2 }, tri: { vol: 13 }, noi: { vol: 6 } },
    sections: {
      A: sec(`b5:6 g5:2 e5:8 | c6:6 g5:2 e5:8 | d6:6 b5:2 g5:8 | a5:6 f#5:2 d6:8 |
              e6:6 b5:2 g5:8 | e6:4 d6:4 c6:4 g5:4 | d6:4 f#6:4 a6:8 | d#6:4 f#6:4 b5:8 |`,
        ['Em', 'C', 'G', 'D', 'Em', 'C', 'D', 'B'], '1:8 5:4 8:4', d('k:8 h:4 s:4 |', 8)),
      B: sec(`g5:4 c6:4 e6:8 | f#5:4 a5:4 d6:8 | g5:4 b5:4 e6:8 | f#5:4 b5:4 d6:8 |
              e6:4 g6:4 c7:8 | d6:4 f#6:4 a6:8 | b5:4 d#6:4 f#6:4 b6:4 | f#6:8 d#6:4 b5:4 |`,
        ['C', 'D', 'Em', 'Bm', 'C', 'D', 'B', 'B'], '1:8 5:4 8:4', d('k:8 h:4 s:4 |', 8)),
    },
  });

  song('hall_of_fame', {

    desc: 'Hall of Fame induction: solemn, proud and glowing.',
    bpm: 92, loop: 0, order: 'A B',
    inst: { p1: { duty: 2, vol: 10, env: 'pluck' }, p2: { duty: 1, vol: 5, arp: 2 }, tri: { vol: 12 }, noi: { vol: 4 } },
    sections: {
      A: sec(`e5:4 g5:4 c6:8 | f6:6 e6:2 c6:8 | g5:4 c6:4 e6:8 | d6:6 b5:2 g5:8 |
              a5:4 c6:4 e6:8 | a6:6 f6:2 c6:8 | b5:4 d6:4 g6:8 | c6:8 e6:4 g6:4 |`,
        ['C', 'F', 'C', 'G', 'Am', 'F', 'G', 'C'], '1:8 5:4 8:4', d('k:8 h:4 h:4 |', 8)),
      B: sec(`a5:4 c6:4 f6:8 | b5:4 d6:4 g6:8 | c6:4 e6:4 g6:4 c7:4 | a6:8 e6:4 c6:4 |
              a5:4 c6:4 f6:4 a6:4 | b5:4 d6:4 g6:4 b6:4 | c7:8 g6:4 e6:4 | c6:16 |`,
        ['F', 'G', 'C', 'Am', 'F', 'G', 'C', 'C'], '1:8 5:4 8:4', d('k:8 h:4 s:4 |', 8)),
    },
  });

  song('ending', {

    desc: 'Final ending scene: soaring, emotional and conclusive.',
    bpm: 88, loop: 0, order: 'A B',
    inst: { p1: { duty: 2, vol: 10, env: 'pluck' }, p2: { duty: 1, vol: 5, arp: 2 }, tri: { vol: 12 }, noi: { vol: 4 } },
    sections: {
      A: sec(`d6:8 b5:4 g5:4 | a5:8 f#5:4 d5:4 | g5:8 b5:4 e6:4 | e6:8 c6:4 g5:4 |
              d6:6 b5:2 g5:4 b5:4 | a5:6 f#5:2 a5:4 d6:4 | c6:4 e6:4 g6:8 | f#6:8 a5:4 d6:4 |`,
        ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D'], '1:8 5:4 8:4', d('k:8 h:4 h:4 |', 8)),
      B: sec(`c6:8 e6:4 a5:4 | b5:8 g5:4 e5:4 | a5:4 c6:4 f6:8 | e6:8 g6:4 e6:4 |
              a5:4 c6:4 e6:4 a6:4 | g6:6 d6:2 b5:8 | a5:4 c6:4 f6:4 a5:4 | d6:8 g5:8 |`,
        ['Am', 'Em', 'F', 'C', 'Am', 'G', 'F', 'G'], '1:8 5:4 8:4', d('k:8 h:4 s:4 |', 8)),
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
