/* src/audio/songs_world.js — routes, forest, city, villain theme, cave, sad. Notation: docs/audio.md */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { arp, bass, weave, block, stab } = NP.audio.dsl;
  const song = NP.audio.song;
  const d = (pat, n) => (pat + ' ').repeat(n).trim();

  // ---------------------------------------------------------------- route_meadow (sunny, walking tempo) — DS-style arrangement
  {
    const cA = ['G', 'C', 'G', 'D', 'G', 'C', 'D', 'G'];
    const cB = ['Em', 'C', 'Am', 'D', 'Em', 'C', 'D', 'G'];
    const cC = ['Em', 'C', 'G', 'D', 'Em', 'C', 'Am', 'D'];
    const cI = ['G', 'C', 'G', 'D'];
    // the original melodies (sounding an octave lower through inst.mel.tr)
    const mA = `d5:2 g5:2 b5:2 g5:2 d6:4 b5:4 | c6:2 e6:2 g6:2 e6:2 c6:4 g5:4 | b5:2 d6:2 g6:2 d6:2 b5:4 g5:4 | a5:2 d6:2 f#6:2 d6:2 a5:4 f#5:4 |
           g5:2 b5:2 d6:2 b5:2 g6:4 d6:4 | e6:2 g6:2 c7:2 g6:2 e6:4 c6:4 | d6:2 f#6:2 a6:2 f#6:2 d6:4 a5:4 | g5:2 b5:2 d6:2 g6:2 g6:8 |`;
    const mB = `e6:4 g6:2 e6:2 b5:4 e6:4 | e6:4 g6:2 e6:2 c6:4 e6:4 | c6:4 e6:2 c6:2 a5:4 c6:4 | d6:4 f#6:2 d6:2 a5:4 d6:4 |
           b5:2 e6:2 g6:2 e6:2 b6:4 g6:4 | g6:2 e6:2 c6:2 e6:2 g6:4 c6:4 | f#6:2 a6:2 d6:2 f#6:2 a5:4 d6:4 | g5:4 b5:4 d6:4 g6:4 |`;
    // breakdown: a slower flute tune (written at pitch)
    const flC = '%v10 b4:6 a4:2 g4:4 e4:4 | g4:6 e4:2 c5:8 | b4:6 a4:2 g4:4 d5:4 | a4:12 r:4 | b4:6 c5:2 d5:4 e5:4 | e5:6 d5:2 c5:4 g4:4 | a4:4 c5:4 e5:4 d5:4 | d5:8 f#4:4 a4:4 |';
    const strum = (ch) => stab(ch, 'X:2 r:2 X:2 X:2 r:2 X:2 X:2 r:2', 3);
    const walk = '1:2 5:2 8:2 5:2 1:2 5:2 8:2 5:2';
    const I = { gtr: strum(cI), bass: bass(cI, '1:4 r:4 1:2 5:2 8:4', 2), drm: d('r:4 g:2 g:2 i:4 g:2 g:2 |', 4) };
    const A = { mel: mA, gtr: strum(cA), bass: bass(cA, walk, 2), drm: d('k:4 h:2 h:2 s:4 h:2 g:2 |', 8) };
    const B = {
      mel: mB, harp: arp(cB, 3), pad: block(cB, 3), gtr: strum(cB), bass: bass(cB, walk, 2),
      drm: 'x:4 h:2 o:2 s:4 h:2 k:2 | ' + d('k:4 h:2 o:2 s:4 h:2 k:2 |', 6) + ' k:2 h:2 s:2 h:2 s:2 s:2 t:2 t:2 |',
    };
    const C = { fl: flC, harp: arp(cC, 3), pad: '%v3 ' + block(cC, 3), bass: '%v7 ' + bass(cC, '1:8 5:8', 2), drm: d('r:4 g:2 g:2 i:4 g:2 g:2 |', 7) + ' r:4 g:2 g:2 y:8 |' };
    song('route_meadow', {
      desc: 'Meadow Lane and early routes: sunny, upbeat walking tempo (warm lead, brass, guitar strum, flute breakdown).',
      bpm: 126, loop: 1, order: 'I A B A/fl C B', gain: 0.91,
      inst: {
        mel: { patch: 'warm', vol: 10, tr: -12 }, fl: { patch: 'flute', vol: 10, pan: 0.15 }, gtr: { patch: 'guitar', vol: 4, pan: -0.3 },
        harp: { patch: 'harp', vol: 5, arp: 2, pan: 0.35 }, pad: { patch: 'strings', vol: 4 }, bass: { patch: 'ebass', vol: 11 }, drm: { patch: 'kit', vol: 9 },
      },
      vars: { fl: { mel: { patch: 'flute' } } },
      sections: { I, A, B, C },
    });
  }

  // ---------------------------------------------------------------- forest_gingham (mysterious, airy) — DS-style arrangement
  {
    const cA = ['Am7', 'Fmaj7', 'Am7', 'Fmaj7', 'Dm7', 'Em7', 'Fmaj7', 'E'];
    const cB = ['Dm7', 'Am7', 'Fmaj7', 'E', 'Dm7', 'Am7', 'Fmaj7', 'E'];
    const cC = ['Am', 'G', 'F', 'E', 'Am', 'G', 'Fmaj7', 'E'];
    // the original melodies (sounding an octave lower through inst.mel.tr)
    const mA = `e6:8 d6:4 c6:4 | c6:8 a5:8 | e6:8 g6:4 e6:4 | a5:8 c6:4 r:4 | d6:6 f6:2 a5:8 | g6:8 e6:4 b5:4 | c6:4 e6:4 a5:8 | g#5:8 b5:4 e6:4 |`;
    const mB = `d6:2 r:2 a5:2 r:2 f6:2 r:2 d6:2 r:2 | c6:2 r:2 e6:2 r:2 a6:2 r:2 e6:2 r:2 | a5:2 r:2 c6:2 r:2 f6:2 r:2 c6:2 r:2 | g#5:2 r:2 b5:2 r:2 e6:4 r:4 |
           d6:2 r:2 a5:2 r:2 f6:2 r:2 d6:2 r:2 | e6:2 c6:2 a5:2 c6:2 e6:4 a5:4 | c6:2 a5:2 f5:2 a5:2 c6:8 | b5:4 g#5:4 e5:8 |`;
    const ctrB = 'a3:16 | g3:16 | a3:16 | g#3:16 | a3:16 | c4:8 e4:8 | c4:16 | b3:8 g#3:8 |';
    // glockenspiel dew drops, written at pitch
    const glkB = 'r:12 a5:4 | r:16 | r:12 e5:4 | r:16 | r:12 f5:4 | r:16 | r:8 c5:4 e5:4 | r:16 |';
    // breakdown: marimba calls, pizzicato answers (written at pitch)
    const marC = 'a4:2 c5:2 e5:4 r:2 e5:2 c5:4 | d5:2 b4:2 g4:4 r:8 | a4:2 c5:2 f5:4 r:2 e5:2 c5:4 | b4:4 g#4:4 e4:8 | c5:2 e5:2 a5:4 r:2 g5:2 e5:4 | d5:2 g5:2 b4:4 r:8 | c5:4 e5:4 a4:8 | g#4:4 b4:4 e5:8 |';
    const pzC = 'a2:4 r:12 | r:8 g3:2 b3:2 d4:4 | f2:4 r:12 | r:8 e3:4 g#3:4 | a2:4 r:12 | r:8 b3:2 d4:2 g4:4 | f2:4 r:12 | r:8 e3:4 b2:4 |';
    const I = { mar: weave(['Am7', 'Fmaj7'], 3, [0, 2, 3, 2], 16, 2), glk: 'r:12 e5:4 | r:8 c5:8 |', pad: block(['Am', 'F'], 3), bass: 'a1:16 | f1:16 |', drm: d('r:4 g:2 g:2 r:4 g:2 g:2 |', 2) };
    const A = {
      mel: mA, mar: weave(cA, 3, [0, 2, 3, 2], 16, 2), pz: stab(cA, 'r:4 X:2 r:6 X:2 r:2', 3), pad: block(cA, 3), bass: bass(cA, '1:8 5:6 1:2', 2),
      drm: d('k:4 g:2 g:2 w:4 g:2 g:2 |', 7) + ' k:4 g:2 g:2 w:2 w:2 w:2 w:2 |',
    };
    const B = {
      mel: mB, ctr: ctrB, mar: weave(cB, 3, [0, 1, 2, 3], 16, 2), glk: glkB, bass: bass(cB, '1:4 r:2 5:2 1:4 r:4', 2),
      drm: d('k:4 g:2 g:2 w:2 g:2 k:2 g:2 |', 7) + ' k:4 g:2 g:2 t:2 t:2 t:2 t:2 |',
    };
    const C = { mt: marC, pz: pzC, pad: '%v3 ' + block(cC, 3), bass: '%v6 ' + bass(cC, '1:16', 2), drm: d('w:4 r:4 g:4 r:4 |', 7) + ' r:8 y:8 |' };
    song('forest_gingham', {
      desc: 'Gingham Woods: mysterious, airy and softly dappled (flute lead, marimba, pizzicato, glockenspiel drops, wood blocks).',
      bpm: 88, loop: 1, order: 'I A B A/rd C B', gain: 1,
      inst: {
        mel: { patch: 'flute', vol: 11, tr: -12 }, mar: { patch: 'marimba', vol: 6, pan: -0.3 }, pz: { patch: 'pizz', vol: 5, pan: 0.3 },
        ctr: { patch: 'strings', vol: 4, pan: -0.15 }, glk: { patch: 'glock', vol: 6, pan: 0.4 }, mt: { patch: 'marimba', vol: 10, pan: 0.1 },
        pad: { patch: 'pad', vol: 4 }, bass: { patch: 'ebass', vol: 10 }, drm: { patch: 'kit', vol: 6 },
      },
      vars: { rd: { mel: { patch: 'reed', vol: 10 } } },
      sections: { I, A, B, C },
    });
  }

  // ---------------------------------------------------------------- city_seamstead (bustling, jazzy, swing) — DS-style arrangement
  {
    const cA = ['Fmaj7', 'D7', 'Gm7', 'C7', 'Fmaj7', 'D7', 'Gm7', 'C7'];
    const cB = ['Bb', 'Am7', 'Dm7', 'G7', 'Gm7', 'C7', 'Fmaj7', 'C7'];
    const cC = ['Dm7', 'G7', 'Cmaj7', 'Am7', 'Dm7', 'G7', 'Gm7', 'C7'];
    // the original melodies (sounding an octave lower through inst.mel.tr)
    const mA = `a5:2 c6:2 r:2 e6:2 d6:2 c6:2 a5:4 | f#5:2 a5:2 r:2 c6:2 a5:2 f#5:2 d5:4 | g5:2 bb5:2 r:2 d6:2 f6:2 d6:2 bb5:4 | e5:2 g5:2 bb5:2 c6:2 e6:4 r:4 |
           c6:2 e6:2 a6:2 e6:2 c6:2 a5:2 f5:4 | d6:2 f#6:2 a5:2 c6:2 f#6:4 d6:4 | bb5:2 d6:2 g6:2 f6:2 d6:2 bb5:2 g5:4 | g5:2 bb5:2 c6:2 e6:2 g6:8 |`;
    const mB = `d6:4 f6:2 d6:2 bb5:4 r:4 | e6:4 c6:2 e6:2 a5:4 r:4 | f6:4 a6:2 f6:2 d6:4 r:4 | d6:2 f6:2 b5:2 d6:2 g5:8 |
           bb5:2 d6:2 g6:2 d6:2 bb5:2 d6:2 f6:4 | e6:2 g6:2 bb6:2 g6:2 e6:4 c6:4 | a5:4 c6:4 f6:4 c6:4 | e6:2 bb5:2 g5:2 e5:2 c5:8 |`;
    // breakdown: an e-piano solo drifts into C and back (written at pitch)
    const epC = '%v10 f4:2 a4:2 c5:2 e5:4 d5:2 c5:4 | b4:6 d5:2 f5:4 d5:4 | e5:4 g4:4 b4:8 | c5:2 e5:2 g5:4 e5:4 r:4 | f5:4 e5:2 d5:2 c5:4 a4:4 | b4:4 d5:2 f5:2 a5:4 g5:4 | bb4:4 d5:4 f5:4 d5:4 | e5:4 c5:2 bb4:2 g4:8 |';
    const comp = 'r:2 X:3 r:5 X:3 r:3';
    const I = {
      hn: stab(['Fmaj7', 'C7'], 'X:2 r:2 X:2 r:10', 3), ep: stab(['Fmaj7', 'C7'], comp, 3), bass: bass(['Fmaj7', 'C7'], '1:4 3:4 5:4 7:4', 2),
      drm: 'x:4 h:2 h:2 s:4 h:2 h:2 | k:4 h:2 h:2 s:2 s:2 s:2 s:2 |',
    };
    const A = {
      mel: mA, ep: stab(cA, comp, 3), bass: bass(cA, '1:4 3:4 5:4 3:4', 2),
      drm: d('k:4 h:2 h:2 s:4 h:2 h:2 |', 7) + ' k:4 h:2 h:2 s:2 s:2 t:2 t:2 |',
    };
    const B = {
      mel: mB, hn: stab(cB, 'r:4 X:2 r:2 r:4 X:2 r:2', 3), ep: stab(cB, comp, 3), pad: block(cB, 3), bass: bass(cB, '1:4 5:4 3:4 5:4', 2),
      drm: 'x:4 h:2 o:2 s:4 h:2 k:2 | ' + d('k:4 h:2 o:2 s:4 h:2 k:2 |', 6) + ' k:2 h:2 s:2 h:2 s:2 s:2 t:2 x:2 |',
    };
    const C = {
      ept: epC, keys: stab(cC, 'X:6 r:2 X:4 r:4', 3), bass: '%v8 ' + bass(cC, '1:4 3:4 5:4 3:4', 2),
      drm: d('i:4 h:2 h:2 i:4 h:2 h:2 |', 7) + ' i:4 h:2 h:2 y:8 |',
    };
    song('city_seamstead', {
      desc: 'Seamstead city: bustling, jazzy and full of shop-window energy (brass lead, horn stabs, e-piano comping, walking e-bass).',
      bpm: 132, swing: 0.25, loop: 1, order: 'I A B A/sx C B', gain: 0.9,
      inst: {
        mel: { patch: 'brass', vol: 11, tr: -12 }, hn: { patch: 'brass', vol: 5, pan: 0.3 }, ep: { patch: 'epiano', vol: 6, pan: -0.3 },
        ept: { patch: 'epiano', vol: 10, pan: 0.1 }, keys: { patch: 'piano', vol: 4, pan: 0.25 }, pad: { patch: 'strings', vol: 3 },
        bass: { patch: 'ebass', vol: 12 }, drm: { patch: 'kit', vol: 8 },
      },
      vars: { sx: { mel: { patch: 'reed', vol: 11 }, ep: { vol: 5 } } },
      sections: { I, A, B, C },
    });
  }

  // ---------------------------------------------------------------- society_theme (stiff, strings-and-snare) — DS-style arrangement
  {
    const cA = ['Bm', 'Bm', 'G', 'F#', 'Bm', 'G', 'Em', 'F#'];
    const cB = ['G', 'F#', 'Bm', 'Bm', 'G', 'F#', 'Em', 'F#'];
    const cC = ['Bm', 'A', 'G', 'F#', 'Bm', 'A', 'Em', 'F#'];
    // the original melodies (sounding an octave lower through inst.*.tr)
    const mA = `b4:6 r:2 d5:4 f#5:4 | b5:6 r:2 a5:4 f#5:4 | g5:6 r:2 b5:4 d6:4 | c#6:6 r:2 a#5:4 f#5:4 |
           b4:6 r:2 d5:4 f#5:4 | d6:6 r:2 b5:4 g5:4 | e5:4 g5:4 b5:4 e6:4 | c#6:4 a#5:4 f#5:8 |`;
    const mB = `[ g5:1 ]x8 [ b5:1 ]x8 | [ f#5:1 ]x8 [ a#5:1 ]x8 | [ b5:1 ]x8 [ d6:1 ]x8 | [ f#6:1 ]x8 [ d6:1 ]x8 |
           [ d6:1 ]x8 [ g6:1 ]x8 | [ c#6:1 ]x8 [ a#5:1 ]x8 | [ e6:1 ]x8 [ b5:1 ]x8 | [ f#6:1 ]x4 [ c#6:1 ]x4 [ a#5:1 ]x8 |`;
    const hnB = 'b3:16 | a#3:16 | b3:8 d4:8 | f#4:8 d4:8 | b3:16 | c#4:16 | b3:8 g3:8 | a#3:8 c#4:8 |';
    // breakdown: a sneaking low clarinet over pizzicato and timpani (written at pitch)
    const rdC = 'f#4:4 r:4 d4:4 b3:4 | c#4:8 e4:8 | d4:4 r:4 b3:4 g3:4 | a#3:12 r:4 | b3:4 d4:4 f#4:4 b4:4 | a4:8 e4:8 | g4:4 e4:4 b3:4 g4:4 | f#4:8 c#4:4 a#3:4 |';
    const I = {
      br: '=Bm2:4 r:4 =Bm2:4 r:4 | =F#2:8 r:8 |', bass: 'b1:8 r:8 | f#1:8 r:8 |',
      drm: 'p:2 p:2 p:2 p:2 m:4 r:4 | s:1 s:1 s:1 s:1 s:2 s:2 s:2 s:2 s:4 |',
    };
    const march = 'k:4 s:2 s:1 s:1 k:4 s:2 s:2 |';
    const A = {
      mel: mA, st: stab(cA, 'X:1 r:1 X:1 r:1 X:2 X:2 X:1 r:1 X:1 r:1 X:2 X:2', 3), pad: block(cA, 3), bass: bass(cA, '1:3 r:1 1:3 r:1 5:4 1:4', 2),
      drm: d(march, 7) + ' k:2 s:1 s:1 s:2 s:2 s:1 s:1 s:1 s:1 m:2 m:2 |',
    };
    const B = {
      trem: mB, hn: hnB, pad: block(cB, 3), bass: bass(cB, '1:3 r:1 1:3 r:1 5:4 1:4', 2),
      drm: d('k:2 s:1 s:1 s:2 s:2 k:2 s:1 s:1 s:2 s:2 |', 7) + ' x:2 s:1 s:1 s:2 s:2 m:2 m:2 m:2 m:2 |',
    };
    const C = {
      rd: rdC, pz: weave(cC, 2, [0, 2, 1, 2], 16, 2), pad: '%v4 ' + block(cC, 3), bass: '%v8 ' + bass(cC, '1:4 r:12', 2),
      drm: '%v7 ' + d('p:4 r:4 p:2 r:6 |', 7) + ' s:1 s:1 s:1 s:1 s:2 s:2 m:2 m:2 m:2 m:2 |',
    };
    song('society_theme', {
      desc: 'Starch Society scenes: stiff, strings-and-snare villain march (clarinet and brass lead, staccato strings, timpani).',
      bpm: 108, loop: 1, order: 'I A B A/br C B', gain: 0.92,
      inst: {
        mel: { patch: 'reed', vol: 10, tr: -12 }, trem: { patch: 'stac', vol: 8, tr: -12 }, st: { patch: 'stac', vol: 5, pan: -0.25 },
        hn: { patch: 'brass', vol: 6, pan: 0.3 }, br: { patch: 'brass', vol: 7 }, pad: { patch: 'strings', vol: 3 }, pz: { patch: 'pizz', vol: 7, pan: -0.2 },
        rd: { patch: 'reed', vol: 9, pan: 0.1 }, bass: { patch: 'synbass', vol: 11 }, drm: { patch: 'kit', vol: 9 },
      },
      vars: { br: { mel: { patch: 'brass', vol: 11 }, st: { vol: 6 } } },
      sections: { I, A, B, C },
    });
  }

  // ---------------------------------------------------------------- cave (echoing drips) — DS-style arrangement
  {
    const cB = ['Em', 'Em', 'D', 'D', 'C', 'C', 'B', 'B'];
    // drip pairs (glock and its harp echo sound an octave lower through inst.tr)
    const pairs = [['e5', 'b5'], ['g5', 'e5'], ['c6', 'g5'], ['e6', 'c6'], ['a5', 'e5'], ['c6', 'a5'], ['d#6', 'b5'], ['f#6', 'd#6']];
    const lowA = '=Em2:16 | =Em2:16 | =C3:16 | =C3:16 | =Am2:16 | =Am2:16 | =B2:16 | =B2:16 |';
    const lowB = '=Em2:16 | =Em2:16 | =D3:16 | =D3:16 | =C3:16 | =C3:16 | =B2:16 | =B2:16 |';
    // the original melody (sounding an octave lower through inst.mel.tr)
    const mB = `e6:2 b5:2 g5:2 e5:2 g5:2 b5:2 e6:4 | g6:4 e6:4 b5:8 | d6:2 a5:2 f#5:2 d5:2 f#5:2 a5:2 d6:4 | f#6:4 d6:4 a5:8 |
           c6:2 g5:2 e5:2 c5:2 e5:2 g5:2 c6:4 | e6:4 c6:4 g5:8 | b5:2 f#5:2 d#5:2 b4:2 d#5:2 f#5:2 b5:4 | d#6:4 b5:4 f#5:8 |`;
    // breakdown: a lone cello over a timpani heartbeat (written at pitch)
    const celC = 'e3:8 g3:8 | e3:16 | a3:8 c4:8 | b3:16 | g3:8 b3:8 | e4:16 | c4:8 a3:8 | b3:12 r:4 |';
    const I = { lo: '=Em2:16 | =Em2:16 |', bass: 'e1:16 | e1:16 |', glk: 'r:16 | r:12 b5:4 |', drm: 'y:16 | p:2 p:2 p:2 p:2 m:8 |' };
    const A = {
      glk: pairs.map(([x, y]) => `${x}:2 r:6 ${y}:2 r:6`).join(' | ') + ' |',
      hp: pairs.map(([x, y]) => `r:6 ${x}:2 r:6 ${y}:2`).join(' | ') + ' |',
      lo: lowA, bass: 'e2:16 | e2:16 | c2:16 | c2:16 | a1:16 | a1:16 | b1:16 | b1:16 |',
      drm: d('p:4 r:12 | r:16 | p:4 r:12 | r:8 m:2 m:2 r:4 |', 2),
    };
    const B = {
      mel: mB, harp: arp(cB, 3), lo: lowB, bass: bass(cB, '1:8 5:8', 2),
      glk: 'r:12 b5:4 | r:16 | r:12 a5:4 | r:16 | r:12 g5:4 | r:16 | r:12 f#5:4 | r:16 |',
      drm: d('p:8 r:4 h:4 |', 7) + ' p:4 p:4 m:4 m:4 |',
    };
    const C = {
      cel: celC, bass: '%v7 e2:16 | c2:16 | a1:16 | b1:16 | e2:16 | c2:16 | a1:16 | b1:16 |',
      glk: 'r:16 | r:8 e6:2 r:6 | r:16 | r:12 d#6:2 r:2 | r:16 | r:8 g5:2 r:6 | r:16 | r:12 b5:2 r:2 |',
      drm: '%v6 ' + d('p:4 r:4 p:2 r:6 |', 8),
    };
    song('cave', {
      desc: 'Caves and tunnels: sparse, echoing and slightly uneasy (low strings, glockenspiel drips, harp echoes, clarinet, timpani).',
      bpm: 76, loop: 1, order: 'I A B A/mr C B', gain: 1.1,
      inst: {
        glk: { patch: 'glock', vol: 8, tr: -12, pan: -0.3 }, hp: { patch: 'harp', vol: 4, tr: -12, pan: 0.4 }, harp: { patch: 'harp', vol: 4, arp: 4, pan: 0.3 },
        lo: { patch: 'strings', vol: 4 }, mel: { patch: 'reed', vol: 9, tr: -12 }, cel: { patch: 'strings', vol: 7, pan: -0.1 },
        bass: { patch: 'ebass', vol: 9 }, drm: { patch: 'kit', vol: 7 },
      },
      vars: { mr: { glk: { patch: 'marimba', vol: 8 }, hp: { vol: 3 } } },
      sections: { I, A, B, C },
    });
  }

  // ---------------------------------------------------------------- sad (whiteout) — DS-style arrangement
  {
    const cA = ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'Gm', 'A'];
    const cB = ['Bb', 'F', 'Gm', 'A', 'Bb', 'F', 'A', 'Dm'];
    const cC = ['Gm', 'Dm', 'Bb', 'A', 'Gm', 'Dm', 'Bb,A', 'Dm'];
    // the original melodies (sounding an octave lower through inst.mel.tr); B's high peak is folded down
    const mA = `f5:8 a5:4 g5:4 | d6:8 c6:4 bb5:4 | bb5:8 a5:4 g5:4 | e5:8 c#6:8 | f5:8 a5:4 d6:4 | f6:8 e6:4 d6:4 | d6:6 c6:2 bb5:4 g5:4 | a5:16 |`;
    const mB = `d6:8 f6:4 d6:4 | c6:8 a5:4 f5:4 | bb5:8 d6:4 g6:4 | a5:4 c#6:4 e6:8 | d6:8 f6:4 g6:4 | a6:4 f6:4 c6:8 | e6:4 c#6:4 a5:8 | d6:16 |`;
    const ctrB = 'd3:8 f3:8 | c3:8 a3:8 | bb2:8 d3:8 | c#3:8 e3:8 | f3:8 d3:8 | a3:8 c4:8 | e3:8 c#3:8 | d3:16 |';
    // coda/breakdown: the piano alone (written at pitch)
    const pnoC = 'd5:4 bb4:4 g4:8 | a4:4 f4:4 d4:8 | f4:4 bb4:4 d5:6 c5:2 | c#5:12 r:4 | bb4:4 d5:4 g5:6 f5:2 | f5:4 e5:4 d5:8 | d5:4 bb4:4 c#5:4 e5:4 | d5:16 |';
    const I = { pno: weave(['Dm', 'A'], 3, [0, 1, 2, 1], 16, 4), pad: block(['Dm', 'A'], 3), bass: 'd2:16 | a1:16 |', drm: 'r:8 y:8 | r:16 |' };
    const A = {
      mel: mA, pno: weave(cA, 3, [0, 2, 1, 2], 16, 2), pad: block(cA, 3), bass: bass(cA, '1:8 5:8', 2), drm: d('k:8 r:8 |', 7) + ' k:8 y:8 |',
    };
    const B = {
      mel: mB, ctr: ctrB, harp: arp(cB, 3), pno: weave(cB, 3, [0, 2, 1, 2], 16, 2), bass: bass(cB, '1:8 5:8', 2),
      drm: d('k:8 r:8 |', 3) + ' k:8 y:8 | ' + d('k:8 r:8 |', 3) + ' r:8 y:8 |',
    };
    const C = { pt: pnoC, pad: '%v3 ' + block(cC, 3), bass: '%v6 ' + bass(cC, '1:16', 2), drm: d('r:16 |', 7) + ' r:8 y:8 |' };
    song('sad', {
      desc: 'Whiteout and sad story moments: slow, hushed and mournful (piano, strings taking the tune, cello line, harp).',
      bpm: 66, loop: 1, order: 'I A B A/st C', gain: 1.05,
      inst: {
        mel: { patch: 'piano', vol: 11, tr: -12 }, pno: { patch: 'piano', vol: 5, pan: -0.2 }, pt: { patch: 'piano', vol: 9, pan: 0.1 },
        ctr: { patch: 'strings', vol: 6, pan: -0.25 }, harp: { patch: 'harp', vol: 4, arp: 4, pan: 0.35 }, pad: { patch: 'strings', vol: 3 },
        bass: { patch: 'ebass', vol: 8 }, drm: { patch: 'kit', vol: 5 },
      },
      vars: { st: { mel: { patch: 'strings', vol: 9 } } },
      sections: { I, A, B, C },
    });
  }

  // ---------------------------------------------------------------- evolution — a rising, wondering ostinato that keeps climbing
  {
    const cA = ['Am', 'F', 'G', 'E'];
    const cB = ['Am', 'F', 'Dm', 'E7'];
    // the bell ostinato: the same little figure, a step higher each bar
    const bell = 'a4:2 e5:2 a5:2 e5:2 c6:2 e5:2 a5:2 e5:2 | a4:2 f5:2 a5:2 f5:2 c6:2 f5:2 a5:2 f5:2 | b4:2 g5:2 b5:2 g5:2 d6:2 g5:2 b5:2 g5:2 | b4:2 e5:2 g#5:2 e5:2 b5:2 e5:2 g#5:2 b5:2 |';
    const melB = 'e5:8 a5:8 | c6:8 a5:8 | d6:8 f6:8 | e6:12 g#5:4 |';
    const A = { bell, pad: block(cA, 3), bass: bass(cA, '1:4 1:4 1:4 1:4', 2), drm: d('g:2 g:2 w:4 g:2 g:2 w:4 |', 3) + ' g:2 g:2 g:2 g:2 t:2 t:2 y:4 |' };
    const B = { bell, mel: melB, pad: block(cB, 3), bass: bass(cB, '1:2 1:2 8:2 1:2 1:2 8:2 5:2 1:2', 2), drm: d('k:4 g:2 g:2 s:4 g:2 g:2 |', 3) + ' k:2 g:2 s:2 s:2 t:2 t:2 y:4 |' };
    // C: the bells drop out, strings and a soft pulse climb on their own; D: everything back, the flute an octave up
    const cC = ['Fmaj7', 'G', 'Em7', 'Am'];
    const melC = 'c5:4 e5:4 a5:8 | b4:4 d5:4 g5:8 | g4:4 b4:4 e5:4 g5:4 | a5:12 r:4 |';
    const C = { mel: melC, harp: weave(cC, 3, [0, 1, 2, 3], 16, 2), pad: block(cC, 3), bass: bass(cC, '1:8 5:8', 2), drm: d('g:2 g:2 g:2 g:2 w:4 g:2 g:2 |', 3) + ' y:16 |' };
    const D = { bell, mel: 'a5:8 c6:8 | f6:8 c6:8 | g6:8 b5:8 | g#5:4 b5:4 e6:8 |', pad: block(cA, 3), bass: bass(cA, '1:2 1:2 8:2 1:2 1:2 8:2 5:2 1:2', 2), drm: d('k:4 h:2 h:2 s:4 h:2 k:2 |', 3) + ' k:2 s:2 s:2 s:2 t:2 t:2 x:4 |' };
    song('evolution', {
      desc: 'Evolution: a bell ostinato that keeps climbing, with strings swelling underneath (glock, strings, flute, soft pulse).',
      bpm: 132, loop: 0, order: 'A B C D A B C D B', gain: 0.9,
      inst: {
        bell: { patch: 'harp', vol: 8, pan: 0.2 }, mel: { patch: 'flute', vol: 10, tr: -12 }, harp: { patch: 'harp', vol: 5, arp: 2, pan: -0.3 }, pad: { patch: 'strings', vol: 5, env: 'swell' },
        bass: { patch: 'synbass', vol: 9 }, drm: { patch: 'kit', vol: 6 },
      },
      sections: { A, B, C, D },
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
