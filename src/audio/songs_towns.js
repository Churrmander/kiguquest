/* src/audio/songs_towns.js — title, intro, towns, tea house, credits. Notation: docs/audio.md */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { arp, bass, weave, block, stab } = NP.audio.dsl;
  const d = (pat, n) => (pat + ' ').repeat(n).trim();
  const song = NP.audio.song;
  // oom-pah-pah strum for 3/4 folk bars: chord stabs on beats 2 and 3
  const oom = (chords, oct) => chords.map((c) => `r:4 ^${c}${oct}:4 ^${c}${oct}:4`).join(' | ') + ' |';

  // ---------------------------------------------------------------- title — DS-style arrangement
  {
    const cA = ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D'];
    const cB = ['Em', 'C', 'G', 'D', 'Em', 'C', 'D', 'D'];
    const cC = ['Em', 'C', 'G', 'D', 'Em', 'C', 'Am', 'D'];
    const cI = ['G', 'C', 'G', 'D'];
    // the original melodies (sounding an octave lower through inst.mel.tr)
    const mA = `b4:2 d5:2 g5:4 d5:2 b4:2 g5:4 | a5:2 f#5:2 d5:4 a4:2 d5:2 f#5:4 | g5:2 e5:2 b4:4 e5:2 g5:2 b5:4 | c6:4 g5:2 e5:2 g5:4 c5:4 |
           b4:2 d5:2 g5:4 b5:2 a5:2 g5:4 | f#5:2 a5:2 d6:4 c6:2 a5:2 f#5:4 | e5:2 g5:2 c6:4 b5:2 g5:2 e5:4 | d5:2 f#5:2 a5:2 d6:2 c6:8 |`;
    const mB = `g5:4 b5:4 e6:8 | e6:4 d6:4 c6:4 g5:4 | b5:4 d6:4 g6:8 | f#6:4 e6:4 d6:4 a5:4 |
           g5:4 b5:4 e6:6 g6:2 | g6:4 e6:4 c6:4 e6:4 | d6:4 f#6:4 a6:4 f#6:4 | d6:8 r:4 a5:2 d6:2 |`;
    // low horn counterline under B (written at pitch)
    const ctrB = 'e4:8 b3:8 | c4:8 e4:8 | d4:8 b3:8 | a3:8 f#3:8 | g3:8 b3:8 | c4:8 g3:8 | f#3:8 a3:8 | d4:8 c4:8 |';
    // breakdown: a quiet piano tune over harp
    const pnoC = '%v10 b4:4 g4:4 e4:6 r:2 | e4:4 g4:4 c5:8 | d5:4 b4:4 g4:4 b4:4 | a4:12 r:4 | g4:4 b4:4 e5:6 d5:2 | c5:4 e5:4 g4:8 | a4:4 c5:4 e5:4 c5:4 | d5:8 f#4:4 a4:4 |';
    const I = {
      br: '=G3:4 r:2 =G3:2 =G3:8 | =C3:4 r:2 =C3:2 =C3:8 | =G3:4 r:2 =G3:2 =Em3:8 | =D3:12 r:4 |',
      mel: 'r:16 | r:16 | r:16 | r:8 g5:2 a5:2 b5:2 d6:2 |',
      pad: block(cI, 3),
      bass: 'g2:4 r:2 g2:2 g2:8 | c2:4 r:2 c2:2 c2:8 | g2:4 r:2 g2:2 e2:8 | d2:12 r:4 |',
      drm: 'm:4 r:2 m:2 m:8 | m:4 r:2 m:2 m:8 | m:4 r:2 m:2 y:8 | k:4 s:2 s:2 s:2 s:2 t:2 t:2 |',
    };
    const beat = 'k:4 h:2 h:2 s:4 h:2 h:2 |';
    const A = { mel: mA, harp: arp(cA, 3), pad: block(cA, 3), bass: bass(cA, '1:4 1:2 5:2 1:4 5:2 8:2', 2), drm: d(beat, 7) + ' k:4 h:2 h:2 s:2 s:2 t:2 t:2 |' };
    const A2 = {
      mel: mA, keys: weave(cA, 3, [0, 1, 2, 1], 16, 2), pad: block(cA, 3), bass: bass(cA, '1:4 1:2 5:2 1:4 5:2 8:2', 2),
      drm: d('k:4 h:2 h:2 s:4 h:2 k:2 |', 7) + ' k:2 h:2 s:2 h:2 s:2 s:2 t:2 t:2 |',
    };
    const B = {
      mel: mB, ctr: ctrB, st: weave(cB, 3, [0, 2, 3, 2], 16, 2), pad: block(cB, 3), bass: bass(cB, '1:2 1:2 5:2 1:2 8:2 5:2 1:2 5:2', 2),
      drm: 'x:4 h:2 h:2 s:4 h:2 k:2 | ' + d('k:4 h:2 h:2 s:4 h:2 k:2 |', 6) + ' k:2 h:2 s:2 h:2 s:2 s:2 t:2 x:2 |',
    };
    const C = { keys: pnoC, harp: weave(cC, 3, [0, 1, 2, 3], 16, 4), pad: '%v3 ' + block(cC, 3), bass: '%v7 ' + bass(cC, '1:16', 2), drm: d('r:4 g:2 g:2 i:4 g:2 g:2 |', 7) + ' r:8 y:8 |' };
    song('title', {
      desc: 'Title screen: bright, hopeful folk-pop with a brass fanfare intro (warm lead, horns, harp, piano breakdown).',
      bpm: 112, loop: 1, order: 'I A B A2/br C B', gain: 0.9,
      inst: {
        mel: { patch: 'warm', vol: 10, tr: -12 }, br: { patch: 'brass', vol: 7 }, ctr: { patch: 'brass', vol: 5, pan: 0.3 },
        st: { patch: 'stac', vol: 5, pan: -0.25 }, keys: { patch: 'piano', vol: 7, pan: -0.25 }, harp: { patch: 'harp', vol: 6, arp: 2, pan: 0.35 },
        pad: { patch: 'strings', vol: 4 }, bass: { patch: 'ebass', vol: 11 }, drm: { patch: 'kit', vol: 9 },
      },
      vars: { br: { mel: { patch: 'brass', vol: 11 } } },
      sections: { I, A, A2, B, C },
    });
  }

  // ---------------------------------------------------------------- intro (professor's lab) — DS-style arrangement
  {
    const cA = ['F', 'Dm', 'Bb', 'C', 'F', 'Am', 'Bb', 'C'];
    const cB = ['Dm', 'Gm', 'C', 'F', 'Dm', 'Bb', 'C', 'C'];
    const cC = ['Bbmaj7', 'Am7', 'Gm7', 'C', 'Bbmaj7', 'Am7', 'Gm7', 'Csus,C7'];
    // the original melodies (sounding an octave lower through inst.mel.tr)
    const mA = `a5:4 c6:2 a5:2 f5:4 c5:4 | d5:2 f5:2 a5:4 d6:4 a5:4 | bb5:4 a5:2 g5:2 f5:4 d5:4 | e5:2 g5:2 c6:4 bb5:4 g5:4 |
           a5:4 c6:2 a5:2 f6:4 c6:4 | e6:4 c6:2 a5:2 e5:4 a5:4 | d6:4 bb5:2 d6:2 f6:4 d6:4 | c6:4 e6:2 g5:2 c6:8 |`;
    const mB = `d6:2 r:2 d6:2 r:2 c6:2 a5:2 f5:4 | g5:2 r:2 g5:2 r:2 bb5:2 d6:2 g6:4 | e6:2 r:2 e6:2 r:2 d6:2 c6:2 g5:4 | a5:4 c6:4 f6:8 |
           d6:2 r:2 d6:2 r:2 e6:2 f6:2 a6:4 | bb5:4 d6:4 f6:4 d6:4 | c6:2 d6:2 e6:2 g6:2 c6:8 | bb5:4 g5:4 e5:4 g5:4 |`;
    // breakdown: the e-piano wonders off on its own over a ticking clock
    const epC = '%v9 d5:4 f4:4 a4:8 | c5:4 e4:4 g4:8 | bb4:4 d5:4 f5:6 d5:2 | e5:8 c5:4 g4:4 | f4:4 a4:4 d5:4 f5:4 | e5:6 c5:2 a4:8 | g4:4 bb4:4 d5:4 c5:4 | f4:4 g4:4 e4:4 bb4:4 |';
    const I = { mar: weave(['F', 'C'], 4, [0, 1, 2, 1], 16, 2), pad: block(['F', 'C'], 3), bass: bass(['F', 'C'], '1:8 5:8', 2), drm: d('w:4 r:4 w:2 w:2 r:4 |', 2) };
    const A = {
      mel: mA, pz: stab(cA, 'r:4 X:2 r:2 r:4 X:2 r:2', 3), keys: weave(cA, 3, [0, 1, 2, 1], 16, 4), bass: bass(cA, '1:6 5:2 1:4 5:4', 2),
      drm: d('k:4 g:2 g:2 w:4 g:2 g:2 |', 7) + ' k:4 g:2 g:2 w:2 w:2 g:2 g:2 |',
    };
    const B = {
      mel: mB, mar: weave(cB, 3, [0, 1, 2, 3], 16, 2), pad: block(cB, 3), bass: bass(cB, '1:4 5:4 1:4 8:4', 2),
      drm: d('k:4 g:2 g:2 s:4 g:2 g:2 |', 7) + ' k:4 g:2 w:2 w:2 w:2 t:2 t:2 |',
    };
    const C = {
      ep: epC, pz: '%v4 ' + weave(cC, 3, [0, 2], 16, 4), pad: '%v3 ' + block(cC, 3), bass: '%v7 ' + bass(cC, '1:16', 2),
      drm: d('w:4 r:4 i:4 r:4 |', 7) + ' w:4 r:4 y:8 |',
    };
    song('intro', {
      desc: 'Professor\'s lab and opening scenes: warm, curious and gently playful (clarinet lead, pizzicato, marimba, e-piano).',
      bpm: 84, swing: 0.03, loop: 1, order: 'I A B A/fl C B', gain: 0.95,
      inst: {
        mel: { patch: 'reed', vol: 10, tr: -12 }, pz: { patch: 'pizz', vol: 5, pan: -0.3 }, keys: { patch: 'epiano', vol: 7, pan: 0.25 },
        mar: { patch: 'marimba', vol: 7, pan: 0.35 }, ep: { patch: 'epiano', vol: 10, pan: 0.1 }, pad: { patch: 'strings', vol: 4 },
        bass: { patch: 'ebass', vol: 11 }, drm: { patch: 'kit', vol: 7 },
      },
      vars: { fl: { mel: { patch: 'flute', vol: 11 } } },
      sections: { I, A, B, C },
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

  // ---------------------------------------------------------------- tea_house (lullaby, 3/4) — DS-style arrangement
  {
    const cA = ['C', 'Am', 'F', 'G', 'C', 'Em', 'F', 'G'];
    const cB = ['F', 'C', 'Dm', 'G', 'F', 'C', 'G', 'C'];
    const cC = ['Fmaj7', 'Em7', 'Dm7', 'G', 'Fmaj7', 'Em7', 'Dm7', 'Gsus,G'];
    // the original melodies (sounding an octave lower through inst.mel.tr)
    const mA = `e5:6 g5:2 e5:4 | a5:6 e5:2 c5:4 | f5:4 a5:4 c6:4 | b5:6 g5:2 d5:4 |
           e5:6 g5:2 c6:4 | b5:6 g5:2 e5:4 | a5:4 g5:4 f5:4 | d5:12 |`;
    const mB = `c6:6 a5:2 f5:4 | e6:6 c6:2 g5:4 | d6:4 f6:4 a5:4 | g5:4 b5:4 d6:4 |
           c6:6 a5:2 c6:4 | g6:6 e6:2 c6:4 | b5:4 d6:4 g5:4 | c6:12 |`;
    const ctrB = 'a3:12 | g3:12 | f3:12 | g3:6 b3:6 | c4:12 | e4:6 c4:6 | d4:6 b3:6 | c4:12 |';
    // breakdown: the harp sings alone over soft e-piano chords
    const hpC = 'a4:4 c5:4 e5:4 | d5:6 b4:2 g4:4 | f4:4 a4:4 c5:4 | b4:8 r:4 | c5:4 e5:4 a4:4 | g4:4 b4:4 e5:4 | d5:6 c5:2 a4:4 | c5:6 b4:6 |';
    const brush = d('k:4 g:4 i:4 |', 7);
    const I = { harp: weave(['C', 'G'], 3, [0, 1, 2, 3, 2, 1], 12, 2), pad: block(['C', 'G'], 3, 12), bass: bass(['C', 'G'], '1:12', 2, 12), drm: 'g:12 | g:6 g:6 |' };
    const A = {
      mel: mA, harp: weave(cA, 3, [0, 1, 2, 3, 2, 1], 12, 2), pad: block(cA, 3, 12), bass: bass(cA, '1:6 5:6', 2, 12), drm: brush + ' k:4 g:4 g:2 g:2 |',
    };
    const B = {
      mel: mB, ctr: ctrB, harp: weave(cB, 3, [0, 2, 1, 2, 3, 2], 12, 2), pad: block(cB, 3, 12), bass: bass(cB, '1:6 5:6', 2, 12), drm: brush + ' k:4 g:4 e:4 |',
    };
    const C = { hp: hpC, keys: block(cC, 3, 12), pad: '%v3 ' + block(cC, 3, 12), bass: '%v6 ' + bass(cC, '1:12', 2, 12), drm: d('g:12 |', 7) + ' g:6 e:6 |' };
    song('tea_house', {
      desc: 'Tea House and heal stations: soft lullaby (e-piano lead, harp, string counterline, brushes, harp breakdown).',
      bpm: 72, bar: 12, loop: 1, order: 'I A B A/fl C B', gain: 1,
      inst: {
        mel: { patch: 'epiano', vol: 11, tr: -12 }, ctr: { patch: 'strings', vol: 5, pan: -0.2 }, harp: { patch: 'harp', vol: 6, pan: 0.3 },
        hp: { patch: 'harp', vol: 9, pan: -0.1 }, keys: { patch: 'epiano', vol: 5, pan: 0.2 }, pad: { patch: 'pad', vol: 4 },
        bass: { patch: 'ebass', vol: 9 }, drm: { patch: 'kit', vol: 6 },
      },
      vars: { fl: { mel: { patch: 'flute', vol: 9 } } },
      sections: { I, A, B, C },
    });
  }

  // ---------------------------------------------------------------- credits — DS-style arrangement
  {
    const cA = ['C', 'G', 'Am', 'Em', 'F', 'C', 'Dm', 'G'];
    const cB = ['F', 'G', 'Em', 'Am', 'F', 'G', 'C', 'C'];
    const cC = ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'G'];
    const cI = ['C', 'G', 'Am', 'F'];
    // the original melodies (sounding an octave lower through inst.*.tr)
    const mA = `g5:4 e5:2 c5:2 e5:4 g5:4 | d6:4 b5:2 g5:2 b5:4 d6:4 | c6:4 a5:2 e5:2 a5:4 c6:4 | b5:4 g5:2 e5:2 g5:4 b5:4 |
           a5:4 f5:2 c5:2 f5:4 a5:4 | g5:4 c6:4 e6:8 | f6:4 d6:2 a5:2 d6:4 f6:4 | g6:4 d6:4 b5:4 g5:4 |`;
    const mB = `c6:8 a5:4 c6:4 | b5:8 d6:4 g6:4 | g6:6 e6:2 b5:8 | c6:4 e6:4 a6:6 g6:2 |
           a6:4 f6:4 c6:4 a5:4 | g5:4 b5:4 d6:4 g6:4 | e6:8 c6:4 g5:4 | c6:12 g5:2 e5:2 |`;
    const hnB = 'a3:8 c4:8 | b3:8 d4:8 | b3:8 g3:8 | a3:8 c4:8 | c4:8 a3:8 | d4:8 b3:8 | g3:8 e3:8 | e3:8 g3:8 |';
    // breakdown: a piano looks back, alone over harp
    const pnoC = '%v10 e5:4 c5:4 a4:8 | f4:4 a4:4 c5:4 a4:4 | g4:4 c5:4 e5:6 d5:2 | d5:8 b4:4 g4:4 | a4:4 c5:4 e5:4 a5:4 | g5:4 f5:4 c5:8 | d5:4 f5:4 a4:4 d5:4 | b4:8 d5:4 g4:4 |';
    const I = { harp: arp(cI, 3), pad: block(cI, 3), bass: 'c2:16 | g1:16 | a1:16 | f1:8 g1:8 |', drm: d('r:16 |', 3) + ' r:8 y:8 |' };
    const A = {
      mel: mA, keys: weave(cA, 3, [0, 1, 2, 1], 16, 2), pad: '%v3 ' + block(cA, 3), bass: bass(cA, '1:4 1:2 5:2 1:4 5:4', 2),
      drm: d('k:4 h:2 h:2 s:4 h:2 h:2 |', 7) + ' k:4 h:2 h:2 s:2 s:2 t:2 t:2 |',
    };
    const B = {
      sm: mB, hn: hnB, harp: arp(cB, 3), pad: block(cB, 3), bass: bass(cB, '1:2 1:2 5:2 1:2 8:2 5:2 1:2 5:2', 2),
      drm: 'x:4 h:2 h:2 s:4 h:2 k:2 | ' + d('k:4 h:2 h:2 s:4 h:2 k:2 |', 6) + ' k:2 h:2 s:2 h:2 s:2 s:2 t:2 t:2 |',
    };
    const C = { pno: pnoC, harp: weave(cC, 3, [0, 1, 2, 3], 16, 4), pad: '%v3 ' + block(cC, 3), bass: '%v7 ' + bass(cC, '1:16', 2), drm: d('r:4 g:2 g:2 i:4 g:2 g:2 |', 7) + ' r:8 y:8 |' };
    song('credits', {
      desc: 'Ending credits roll: warm, reflective, looks back over the journey (flute, string lead, horns, harp, piano breakdown).',
      bpm: 100, loop: 1, order: 'I A B A/pn C B', gain: 0.92,
      inst: {
        mel: { patch: 'flute', vol: 11, tr: -12 }, sm: { patch: 'strings', vol: 10, tr: -12 }, hn: { patch: 'brass', vol: 5, pan: 0.3 },
        keys: { patch: 'piano', vol: 7, pan: -0.25 }, pno: { patch: 'piano', vol: 9 }, harp: { patch: 'harp', vol: 6, arp: 2, pan: 0.35 },
        pad: { patch: 'pad', vol: 4 }, bass: { patch: 'ebass', vol: 11 }, drm: { patch: 'kit', vol: 8 },
      },
      vars: { pn: { mel: { patch: 'piano', vol: 11 }, keys: { patch: 'harp', vol: 6 } } },
      sections: { I, A, B, C },
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
