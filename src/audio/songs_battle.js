/* src/audio/songs_battle.js — battle themes. Notation: docs/audio.md */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { arp, bass, weave, block, stab } = NP.audio.dsl;
  const song = NP.audio.song;
  const d = (pat, n) => (pat + ' ').repeat(n).trim();

  // ---------------------------------------------------------------- battle_wild (Em, scrappy and quick) — DS-style arrangement
  {
    const cA = ['Em', 'Em', 'C', 'D', 'Em', 'Em', 'C', 'B'];
    const cB = ['Am', 'G', 'C', 'B', 'Am', 'G', 'B', 'B'];
    const cC = ['Em', 'C', 'Am', 'B', 'Em', 'C', 'Am', 'B'];
    // the original melodies (sounding an octave lower through inst.mel.tr)
    const mA = `e5:2 e5:2 g5:2 e5:2 b5:4 g5:2 e5:2 | e5:2 e5:2 g5:2 b5:2 e6:4 d6:2 b5:2 | c6:2 c6:2 b5:2 g5:2 e5:4 g5:2 c6:2 | d6:2 d6:2 c6:2 a5:2 f#5:4 a5:4 |
           e5:2 e5:2 g5:2 e5:2 b5:4 g5:2 e5:2 | g5:2 b5:2 e6:2 g6:2 e6:4 b5:4 | c6:4 e6:4 g6:4 e6:4 | d#6:2 f#6:2 b5:2 d#6:2 b5:8 |`;
    const mB = `a5:4 c6:4 e6:4 c6:4 | b5:4 d6:4 g6:4 d6:4 | c6:4 e6:4 g6:4 e6:4 | f#6:4 d#6:4 b5:4 d#6:4 |
           a5:2 a5:2 c6:2 a5:2 e6:4 c6:2 a5:2 | b5:2 b5:2 d6:2 b5:2 g6:4 d6:2 b5:2 | b5:2 d#6:2 f#6:2 b6:2 f#6:2 d#6:2 b5:4 | f#6:2 d#6:2 b5:2 d#6:2 b5:8 |`;
    // breakdown: a low reed figure over timpani (written at pitch)
    const rdC = 'e4:8 g4:4 f#4:4 | e4:8 c4:8 | a3:8 c4:4 e4:4 | d#4:12 r:4 | e4:8 g4:4 b4:4 | c5:8 g4:8 | a4:8 c5:4 e4:4 | f#4:8 d#4:4 b3:4 |';
    const drive = '1:2 1:2 8:2 1:2 1:2 1:2 8:2 5:2';
    const beat = 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 |';
    const I = {
      br: '=Em3:2 r:2 =Em3:2 r:2 =Em3:4 r:4 | =C3:2 r:2 =D3:2 r:2 =B2:8 |',
      st: '[ e3:1 e3:1 b3:1 e3:1 ]x4 | [ c3:1 c3:1 g3:1 c3:1 ]x2 [ b2:1 b2:1 f#3:1 b2:1 ]x2 |',
      bass: 'e2:2 r:2 e2:2 r:2 e2:4 r:4 | c2:2 r:2 d2:2 r:2 b1:8 |',
      drm: 'm:2 r:2 m:2 r:2 p:2 p:2 p:2 p:2 | k:2 r:2 k:2 r:2 p:2 p:2 s:2 x:2 |',
    };
    const A = { mel: mA, st: weave(cA, 3, [0, 2, 3, 2], 16, 2), bass: bass(cA, drive, 2), drm: d(beat, 7) + ' k:2 h:2 s:2 s:2 t:2 t:2 m:2 s:2 |' };
    const B = {
      mel: mB, br: stab(cB, 'r:2 X:2 r:4 r:2 X:2 r:4', 3), pad: block(cB, 3), bass: bass(cB, drive, 2),
      drm: 'x:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 | ' + d(beat, 6) + ' k:2 s:2 s:2 s:2 t:2 t:2 m:2 x:2 |',
    };
    const C = {
      rd: rdC, pad: '%v4 ' + block(cC, 3), bass: '%v8 ' + bass(cC, '1:2 r:2 1:2 r:2 1:2 r:2 5:2 1:2', 2),
      drm: '%v8 ' + d('p:4 r:4 m:4 r:2 m:2 |', 7) + ' %v10 t:2 t:2 t:2 t:2 s:2 s:2 s:2 s:2 |',
    };
    song('battle_wild', {
      desc: 'Wild Kigu encounters: quick, bouncy and driving (brass lead, staccato strings, timpani breakdown).',
      bpm: 160, loop: 1, order: 'I A B C A/w B/w', gain: 0.89,
      inst: {
        mel: { patch: 'brass', vol: 11, tr: -12 }, br: { patch: 'brass', vol: 4, pan: 0.3 }, st: { patch: 'stac', vol: 7, pan: -0.2 },
        rd: { patch: 'reed', vol: 10 }, pad: { patch: 'strings', vol: 5 }, bass: { patch: 'synbass', vol: 12 }, drm: { patch: 'kit', vol: 11 },
      },
      vars: { w: { mel: { patch: 'warm' }, br: { vol: 5 } } },
      sections: { I, A, B, C },
    });
  }

  // ---------------------------------------------------------------- battle_tailor (trainer, Dm driving)
  {
    const cA = ['Dm', 'Dm', 'Bb', 'C', 'Dm', 'Dm', 'Bb', 'A'];
    const cB = ['F', 'C', 'Gm', 'A', 'F', 'C', 'A', 'A'];
    const A = {
      p1: `d5:4 f5:2 a5:2 d6:4 a5:4 | d6:2 d6:2 e6:2 f6:2 e6:4 d6:4 | bb5:4 d6:2 f6:2 bb5:4 f5:4 | c6:2 c6:2 d6:2 e6:2 g6:8 |
           d5:4 f5:2 a5:2 d6:4 f6:4 | a6:4 f6:2 d6:2 a5:8 | bb5:2 d6:2 f6:2 bb6:2 a6:4 f6:4 | e6:2 c#6:2 a5:2 c#6:2 e6:4 a5:4 |`,
      p2: arp(cA, 4),
      tri: bass(cA, '1:2 1:2 8:2 1:2 5:2 1:2 8:2 5:2', 2),
      noi: d('k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 |', 7) + ' k:2 h:2 s:2 h:2 k:2 s:2 s:2 s:2 |',
    };
    const B = {
      p1: `a5:2 c6:2 f6:4 e6:2 c6:2 a5:4 | g5:2 c6:2 e6:4 d6:2 c6:2 g5:4 | g5:2 bb5:2 d6:4 g6:4 d6:4 | a5:2 c#6:2 e6:4 a6:4 e6:4 |
           f6:4 e6:2 c6:2 a5:2 c6:2 f6:4 | e6:4 d6:2 c6:2 g5:2 c6:2 e6:4 | a5:2 c#6:2 e6:2 a6:2 g6:2 e6:2 c#6:2 e6:2 | a6:8 e6:4 c#6:4 |`,
      p2: arp(cB, 4),
      tri: bass(cB, '1:2 1:2 8:2 1:2 5:2 1:2 8:2 5:2', 2),
      noi: d('k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 |', 8),
    };
    song('battle_tailor', {
      desc: 'Trainer battles: driving, determined and energetic.',
      bpm: 168, loop: 0, order: 'A B A B',
      inst: { p1: { duty: 2, vol: 11 }, p2: { duty: 1, vol: 6 }, noi: { vol: 9 } },
      sections: { A, B },
    });
  }

  // ---------------------------------------------------------------- battle_master (big, brassy, Cm)
  {
    const cA = ['Cm', 'Ab', 'Bb', 'G', 'Cm', 'Ab', 'Fm', 'G'];
    const cB = ['Eb', 'Bb', 'Cm', 'G', 'Ab', 'Eb', 'Fm', 'G'];
    const A = {
      p1: `c5:2 c5:2 c5:2 eb5:2 g5:4 eb5:4 | ab5:2 ab5:2 c6:2 ab5:2 eb6:4 c6:4 | bb5:2 bb5:2 d6:2 bb5:2 f6:4 d6:4 | g5:2 b5:2 d6:2 g6:2 f6:8 |
           c5:2 c5:2 c5:2 eb5:2 g5:4 c6:4 | ab5:2 c6:2 eb6:2 ab6:2 g6:4 eb6:4 | f6:2 f6:2 ab5:2 c6:2 f6:4 c6:4 | d6:2 d6:2 b5:2 g5:2 d6:8 |`,
      p2: arp(cA, 4),
      tri: bass(cA, '1:2 1:2 1:2 5:2 1:2 1:2 8:2 5:2', 2),
      noi: d('k:2 h:2 s:2 h:2 k:2 k:2 s:2 x:2 |', 8),
    };
    const B = {
      p1: `g5:4 bb5:4 eb6:8 | d6:4 f6:4 bb6:8 | c6:4 eb6:4 g6:8 | d6:4 g6:4 b5:4 d6:4 |
           ab5:4 c6:4 eb6:4 ab6:4 | g6:4 eb6:4 bb5:4 g5:4 | f6:4 ab6:4 c7:4 ab6:4 | g6:8 d6:4 b5:4 |`,
      p2: 'eb5:4 g5:4 bb5:8 | f5:4 bb5:4 d6:8 | eb5:4 g5:4 c6:8 | b4:4 d5:4 g5:4 b5:4 | c5:4 eb5:4 ab5:4 c6:4 | bb4:4 g4:4 eb5:4 bb4:4 | ab5:4 c6:4 f6:4 c6:4 | b5:8 g5:4 d5:4 |',
      tri: bass(cB, '1:4 1:2 5:2 1:4 5:2 8:2', 2),
      noi: d('k:4 s:2 h:2 k:2 k:2 s:2 h:2 |', 8),
    };
    song('battle_master', {
      desc: 'Salon Master battles: big, brassy and celebratory.',
      bpm: 152, loop: 0, order: 'A B A B',
      inst: { p1: { duty: 2, vol: 12 }, p2: { duty: 1, vol: 8 }, tri: { vol: 14 }, noi: { vol: 10 } },
      sections: { A, B },
    });
  }

  // ---------------------------------------------------------------- battle_rival (cocky, fast, Am)
  {
    const cA = ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E'];
    const cB = ['Dm', 'Am', 'F', 'E', 'Dm', 'Am', 'E', 'E'];
    const A = {
      p1: `a5:2 a5:1 c6:1 e6:2 c6:2 a5:2 e5:2 a5:4 | f5:2 f5:1 a5:1 c6:2 a5:2 f6:4 c6:4 | g5:2 g5:1 c6:1 e6:2 c6:2 g6:4 e6:4 | g5:2 b5:2 d6:2 g6:2 f6:2 d6:2 b5:4 |
           a5:2 a5:1 c6:1 e6:2 c6:2 a5:2 e5:2 a5:4 | c6:2 a5:2 f5:2 a5:2 c6:2 f6:2 a6:4 | d6:2 f6:2 a6:2 f6:2 d6:2 f6:2 d6:4 | g#5:2 b5:2 e6:2 g#6:2 e6:8 |`,
      p2: arp(cA, 4),
      tri: bass(cA, '1:2 1:2 8:2 1:2 1:2 8:2 5:2 1:2', 2),
      noi: d('k:2 h:2 s:2 h:2 k:2 h:2 s:2 s:1 s:1 |', 8),
    };
    const B = {
      p1: `d6:4 d6:2 f6:2 a6:4 f6:4 | c6:4 c6:2 e6:2 a6:4 e6:4 | a5:4 a5:2 c6:2 f6:4 c6:4 | b5:4 g#5:2 b5:2 e6:4 g#6:4 |
           d6:4 d6:2 f6:2 a6:4 f6:4 | e6:2 c6:2 a5:2 c6:2 e6:4 a5:4 | e6:2 g#6:2 b6:2 g#6:2 e6:2 g#5:2 b5:2 e6:2 | e6:8 b5:4 g#5:4 |`,
      p2: arp(cB, 4),
      tri: bass(cB, '1:2 1:2 8:2 1:2 1:2 8:2 5:2 1:2', 2),
      noi: d('k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 |', 8),
    };
    song('battle_rival', {
      desc: 'Rival battles: fast, competitive and a little cheeky.',
      bpm: 174, loop: 0, order: 'A B A B',
      inst: { p1: { duty: 1, vol: 11 }, p2: { duty: 2, vol: 6 }, noi: { vol: 9 } },
      sections: { A, B },
    });
  }

  // ---------------------------------------------------------------- battle_society (menacing march, Dm)
  {
    const cA = ['Dm', 'Dm', 'Gm', 'A', 'Dm', 'Bb', 'A', 'A'];
    const cB = ['Bb', 'A', 'Bb', 'A', 'Gm', 'Dm', 'A', 'A'];
    const A = {
      p1: `d5:3 r:1 d5:3 r:1 f5:2 e5:2 d5:2 r:2 | d5:3 r:1 d5:3 r:1 a5:2 g5:2 f5:2 r:2 | g5:3 r:1 g5:3 r:1 bb5:2 a5:2 g5:2 r:2 | a5:3 r:1 c#6:3 r:1 e6:2 d6:2 c#6:2 r:2 |
           d6:4 c6:2 bb5:2 a5:4 f5:4 | bb5:4 a5:2 g5:2 f5:4 d5:4 | e5:3 r:1 e5:3 r:1 g5:2 f5:2 e5:2 r:2 | c#6:2 e6:2 a6:4 e6:4 c#6:4 |`,
      p2: arp(cA, 4),
      tri: bass(cA, '1:3 r:1 1:3 r:1 5:2 1:2 5:2 r:2', 2),
      noi: d('k:4 s:4 k:4 s:2 s:1 s:1 |', 8),
    };
    const B = {
      p1: `bb5:2 d6:2 f6:2 d6:2 bb5:2 d6:2 f6:4 | a5:2 c#6:2 e6:2 c#6:2 a5:2 c#6:2 e6:4 | bb5:2 d6:2 f6:2 bb6:2 a6:4 f6:4 | e6:2 c#6:2 a5:2 c#6:2 e6:8 |
           g5:4 bb5:4 d6:4 g6:4 | f6:4 d6:4 a5:4 f5:4 | a5:3 r:1 a5:3 r:1 c#6:2 e6:2 a6:4 | e6:8 r:4 a5:2 c#6:2 |`,
      p2: arp(cB, 4),
      tri: bass(cB, '1:3 r:1 1:3 r:1 5:2 1:2 5:2 r:2', 2),
      noi: d('k:4 s:4 k:2 k:2 s:2 s:1 s:1 |', 8),
    };
    song('battle_society', {
      desc: 'Starch Society battles: menacing, precise and march-like.',
      bpm: 124, loop: 0, order: 'A B A B',
      inst: { p1: { duty: 0, vol: 12 }, p2: { duty: 0, vol: 6, arp: 2 }, tri: { vol: 14 }, noi: { vol: 9 } },
      sections: { A, B },
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
