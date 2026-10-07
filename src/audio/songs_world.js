/* src/audio/songs_world.js — routes, forest, city, villain theme, cave, sad. Notation: docs/audio.md */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { arp, bass } = NP.audio.dsl;
  const song = NP.audio.song;
  const d = (pat, n) => (pat + ' ').repeat(n).trim();

  // ---------------------------------------------------------------- route_meadow (sunny, walking tempo)
  {
    const cA = ['G', 'C', 'G', 'D', 'G', 'C', 'D', 'G'];
    const cB = ['Em', 'C', 'Am', 'D', 'Em', 'C', 'D', 'G'];
    const A = {
      p1: `d5:2 g5:2 b5:2 g5:2 d6:4 b5:4 | c6:2 e6:2 g6:2 e6:2 c6:4 g5:4 | b5:2 d6:2 g6:2 d6:2 b5:4 g5:4 | a5:2 d6:2 f#6:2 d6:2 a5:4 f#5:4 |
           g5:2 b5:2 d6:2 b5:2 g6:4 d6:4 | e6:2 g6:2 c7:2 g6:2 e6:4 c6:4 | d6:2 f#6:2 a6:2 f#6:2 d6:4 a5:4 | g5:2 b5:2 d6:2 g6:2 g6:8 |`,
      p2: arp(cA, 4),
      tri: bass(cA, '1:2 5:2 8:2 5:2 1:2 5:2 8:2 5:2', 2),
      noi: d('k:4 h:4 s:4 h:4 |', 8),
    };
    const B = {
      p1: `e6:4 g6:2 e6:2 b5:4 e6:4 | e6:4 g6:2 e6:2 c6:4 e6:4 | c6:4 e6:2 c6:2 a5:4 c6:4 | d6:4 f#6:2 d6:2 a5:4 d6:4 |
           b5:2 e6:2 g6:2 e6:2 b6:4 g6:4 | g6:2 e6:2 c6:2 e6:2 g6:4 c6:4 | f#6:2 a6:2 d6:2 f#6:2 a5:4 d6:4 | g5:4 b5:4 d6:4 g6:4 |`,
      p2: arp(cB, 4),
      tri: bass(cB, '1:2 5:2 8:2 5:2 1:2 5:2 8:2 5:2', 2),
      noi: d('k:4 h:4 s:4 h:2 k:2 |', 8),
    };
    song('route_meadow', {
      desc: 'Meadow Lane and early routes: sunny, upbeat walking tempo.',
      bpm: 126, loop: 0, order: 'A B A B',
      inst: { p1: { duty: 2, vol: 11, env: 'pluck' }, p2: { duty: 1, vol: 5 }, noi: { vol: 6 } },
      sections: { A, B },
    });
  }

  // ---------------------------------------------------------------- forest_gingham (mysterious, airy)
  {
    const cA = ['Am7', 'Fmaj7', 'Am7', 'Fmaj7', 'Dm7', 'Em7', 'Fmaj7', 'E'];
    const cB = ['Dm7', 'Am7', 'Fmaj7', 'E', 'Dm7', 'Am7', 'Fmaj7', 'E'];
    const A = {
      p1: `%es e6:8 d6:4 c6:4 | c6:8 a5:8 | e6:8 g6:4 e6:4 | a5:8 c6:4 r:4 | d6:6 f6:2 a5:8 | g6:8 e6:4 b5:4 | c6:4 e6:4 a5:8 | g#5:8 b5:4 e6:4 |`,
      p2: arp(cA, 5),
      tri: bass(cA, '1:8 5:8', 2),
      noi: d('k:8 h:4 h:4 |', 8),
    };
    const B = {
      p1: `d6:2 r:2 a5:2 r:2 f6:2 r:2 d6:2 r:2 | c6:2 r:2 e6:2 r:2 a6:2 r:2 e6:2 r:2 | a5:2 r:2 c6:2 r:2 f6:2 r:2 c6:2 r:2 | g#5:2 r:2 b5:2 r:2 e6:4 r:4 |
           d6:2 r:2 a5:2 r:2 f6:2 r:2 d6:2 r:2 | e6:2 c6:2 a5:2 c6:2 e6:4 a5:4 | c6:2 a5:2 f5:2 a5:2 c6:8 | b5:4 g#5:4 e5:8 |`,
      p2: arp(cB, 4),
      tri: bass(cB, '1:4 r:2 5:2 1:4 r:4', 2),
      noi: d('k:8 r:4 h:4 |', 8),
    };
    song('forest_gingham', {
      desc: 'Gingham Woods: mysterious, airy and softly dappled.',
      bpm: 88, loop: 0, order: 'A B A B',
      inst: { p1: { duty: 2, vol: 9 }, p2: { duty: 1, vol: 4, arp: 2 }, tri: { vol: 12 }, noi: { vol: 3 } },
      sections: { A, B },
    });
  }

  // ---------------------------------------------------------------- city_seamstead (bustling, jazzy, swing)
  {
    const cA = ['Fmaj7', 'D7', 'Gm7', 'C7', 'Fmaj7', 'D7', 'Gm7', 'C7'];
    const cB = ['Bb', 'Am7', 'Dm7', 'G7', 'Gm7', 'C7', 'Fmaj7', 'C7'];
    const stab = (cs) => cs.map((c) => `r:2 ^${c}4:3 r:5 ^${c}4:3 r:3`).join(' | ') + ' |';
    const A = {
      p1: `a5:2 c6:2 r:2 e6:2 d6:2 c6:2 a5:4 | f#5:2 a5:2 r:2 c6:2 a5:2 f#5:2 d5:4 | g5:2 bb5:2 r:2 d6:2 f6:2 d6:2 bb5:4 | e5:2 g5:2 bb5:2 c6:2 e6:4 r:4 |
           c6:2 e6:2 a6:2 e6:2 c6:2 a5:2 f5:4 | d6:2 f#6:2 a5:2 c6:2 f#6:4 d6:4 | bb5:2 d6:2 g6:2 f6:2 d6:2 bb5:2 g5:4 | g5:2 bb5:2 c6:2 e6:2 g6:8 |`,
      p2: stab(cA),
      tri: bass(cA, '1:4 5:4 3:4 5:4', 2),
      noi: d('k:4 h:2 h:2 s:4 h:2 h:2 |', 8),
    };
    const B = {
      p1: `d6:4 f6:2 d6:2 bb5:4 r:4 | e6:4 c6:2 e6:2 a5:4 r:4 | f6:4 a6:2 f6:2 d6:4 r:4 | d6:2 f6:2 b5:2 d6:2 g5:8 |
           bb5:2 d6:2 g6:2 d6:2 bb5:2 d6:2 f6:4 | e6:2 g6:2 bb6:2 g6:2 e6:4 c6:4 | a5:4 c6:4 f6:4 c6:4 | e6:2 bb5:2 g5:2 e5:2 c5:8 |`,
      p2: stab(cB),
      tri: bass(cB, '1:4 5:4 3:4 5:4', 2),
      noi: d('k:4 h:2 h:2 s:4 h:2 k:2 |', 8),
    };
    song('city_seamstead', {
      desc: 'Seamstead city: bustling, jazzy and full of shop-window energy.',
      bpm: 132, swing: 0.25, loop: 0, order: 'A B A B',
      inst: { p1: { duty: 1, vol: 11, env: 'pluck' }, p2: { duty: 2, vol: 6, env: 'pluck', arp: 1 }, tri: { vol: 13 }, noi: { vol: 6 } },
      sections: { A, B },
    });
  }

  // ---------------------------------------------------------------- society_theme (stiff, strings-and-snare)
  {
    const cA = ['Bm', 'Bm', 'G', 'F#', 'Bm', 'G', 'Em', 'F#'];
    const cB = ['G', 'F#', 'Bm', 'Bm', 'G', 'F#', 'Em', 'F#'];
    const A = {
      p1: `b4:6 r:2 d5:4 f#5:4 | b5:6 r:2 a5:4 f#5:4 | g5:6 r:2 b5:4 d6:4 | c#6:6 r:2 a#5:4 f#5:4 |
           b4:6 r:2 d5:4 f#5:4 | d6:6 r:2 b5:4 g5:4 | e5:4 g5:4 b5:4 e6:4 | c#6:4 a#5:4 f#5:8 |`,
      p2: arp(cA, 4),
      tri: bass(cA, '1:3 r:1 1:3 r:1 5:4 1:4', 2),
      noi: d('k:4 s:4 k:4 s:2 s:1 s:1 |', 8),
    };
    const B = {
      p1: `[ g5:1 ]x8 [ b5:1 ]x8 | [ f#5:1 ]x8 [ a#5:1 ]x8 | [ b5:1 ]x8 [ d6:1 ]x8 | [ f#6:1 ]x8 [ d6:1 ]x8 |
           [ d6:1 ]x8 [ g6:1 ]x8 | [ c#6:1 ]x8 [ a#5:1 ]x8 | [ e6:1 ]x8 [ b5:1 ]x8 | [ f#6:1 ]x4 [ c#6:1 ]x4 [ a#5:1 ]x8 |`,
      p2: arp(cB, 4),
      tri: bass(cB, '1:3 r:1 1:3 r:1 5:4 1:4', 2),
      noi: d('k:2 s:1 s:1 s:2 s:2 k:2 s:1 s:1 s:2 s:2 |', 8),
    };
    song('society_theme', {
      desc: 'Starch Society scenes: stiff, strings-and-snare villain theme.',
      bpm: 108, loop: 0, order: 'A B A B',
      inst: { p1: { duty: 1, vol: 10 }, p2: { duty: 0, vol: 6, arp: 2 }, tri: { vol: 14 }, noi: { vol: 8 } },
      sections: { A, B },
    });
  }

  // ---------------------------------------------------------------- cave (echoing drips)
  {
    const cA = ['Em', 'Em', 'C', 'C', 'Am', 'Am', 'B', 'B'];
    const cB = ['Em', 'Em', 'D', 'D', 'C', 'C', 'B', 'B'];
    const pairs = [['e5', 'b5'], ['g5', 'e5'], ['c6', 'g5'], ['e6', 'c6'], ['a5', 'e5'], ['c6', 'a5'], ['d#6', 'b5'], ['f#6', 'd#6']];
    const A = {
      p1: pairs.map(([x, y]) => `${x}:2 r:6 ${y}:2 r:6`).join(' | ') + ' |',
      p2: pairs.map(([x, y]) => `r:6 ${x}:2 r:6 ${y}:2`).join(' | ') + ' |',
      tri: bass(cA, '1:8 5:8', 2),
      noi: d('h:2 r:14 |', 8),
    };
    const B = {
      p1: `e6:2 b5:2 g5:2 e5:2 g5:2 b5:2 e6:4 | g6:4 e6:4 b5:8 | d6:2 a5:2 f#5:2 d5:2 f#5:2 a5:2 d6:4 | f#6:4 d6:4 a5:8 |
           c6:2 g5:2 e5:2 c5:2 e5:2 g5:2 c6:4 | e6:4 c6:4 g5:8 | b5:2 f#5:2 d#5:2 b4:2 d#5:2 f#5:2 b5:4 | d#6:4 b5:4 f#5:8 |`,
      p2: arp(cB, 5),
      tri: bass(cB, '1:8 5:8', 2),
      noi: d('k:8 r:4 h:4 |', 8),
    };
    song('cave', {
      desc: 'Caves and tunnels: sparse, echoing and slightly uneasy.',
      bpm: 76, loop: 0, order: 'A B A B',
      inst: { p1: { duty: 2, vol: 9, env: 'pluck' }, p2: { duty: 2, vol: 4, env: 'pluck', arp: 4 }, tri: { vol: 12 }, noi: { vol: 4 } },
      sections: { A, B: Object.assign({}, B) },
    });
    // the echo line in A is quieter: handled by p2's low volume
  }

  // ---------------------------------------------------------------- sad (whiteout)
  {
    const cA = ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'Gm', 'A'];
    const cB = ['Bb', 'F', 'Gm', 'A', 'Bb', 'F', 'A', 'Dm'];
    const A = {
      p1: `%es f5:8 a5:4 g5:4 | d6:8 c6:4 bb5:4 | bb5:8 a5:4 g5:4 | e5:8 c#6:8 | f5:8 a5:4 d6:4 | f6:8 e6:4 d6:4 | d6:6 c6:2 bb5:4 g5:4 | a5:16 |`,
      p2: arp(cA, 4),
      tri: bass(cA, '1:8 5:8', 2),
      noi: d('k:8 r:8 |', 8),
    };
    const B = {
      p1: `%es d6:8 f6:4 d6:4 | c6:8 a5:4 f5:4 | bb5:8 d6:4 g6:4 | a5:4 c#6:4 e6:8 | d6:8 f6:4 bb6:4 | a6:8 f6:4 c6:4 | e6:4 c#6:4 a5:8 | d6:16 |`,
      p2: arp(cB, 4),
      tri: bass(cB, '1:8 5:8', 2),
      noi: d('k:8 r:8 |', 8),
    };
    song('sad', {
      desc: 'Whiteout and sad story moments: slow, hushed and mournful.',
      bpm: 66, loop: 0, order: 'A B',
      inst: { p1: { duty: 2, vol: 9 }, p2: { duty: 1, vol: 4, arp: 4, env: 'pluck' }, tri: { vol: 12 }, noi: { vol: 3 } },
      sections: { A, B },
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
