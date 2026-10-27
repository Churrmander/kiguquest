/* src/audio/songs_p2.js — Phase-2 songs: legendary/admin/elite/champion battles, league, hall of fame, ending. Notation: docs/audio.md */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { arp, bass, weave, block, stab } = NP.audio.dsl;
  const song = NP.audio.song;
  const d = (pat, n) => (pat + ' ').repeat(n).trim();
  const roll = (drum, n) => d(drum + ':1', n); // n one-step hits (timpani / snare rolls)

  // ---------------------------------------------------------------- battle_legend (Gm, epic and mythic) — DS-style arrangement
  // Brass over a choir-like pad, harp and heavy timpani; the strings sing the head in long notes as the build; strings lead on the A repeat.
  {
    const cA = ['Gm', 'Eb', 'Bb', 'F', 'Gm', 'Eb', 'Cm', 'D'];
    const cB = ['Gm', 'F', 'Eb', 'D', 'Gm', 'F', 'D', 'D'];
    const cC = ['Gm', 'Eb', 'Cm', 'D', 'Gm', 'Bb', 'Cm,D', 'Gm'];
    // the original melodies (sounding an octave lower through inst.mel.tr)
    const mA = `g5:6 bb5:2 d6:8 | eb6:6 d6:2 bb5:8 | bb5:4 d6:4 f6:8 | a5:4 c6:4 f6:4 e6:4 |
           g5:2 g5:2 bb5:2 d6:2 g6:8 | g6:4 eb6:4 bb5:4 eb6:4 | c6:4 eb6:4 g6:4 c7:4 | f#6:4 d6:4 a5:4 f#5:4 |`;
    const mB = `g5:1 a5:1 bb5:1 d6:1 g6:2 d6:2 bb5:2 d6:2 g6:4 | f5:1 g5:1 a5:1 c6:1 f6:2 c6:2 a5:2 c6:2 f6:4 | eb5:1 f5:1 g5:1 bb5:1 eb6:2 bb5:2 g5:2 bb5:2 eb6:4 | d6:1 e6:1 f#6:1 a6:1 d6:2 f#6:2 a6:4 f#6:4 |
           g5:1 a5:1 bb5:1 d6:1 g6:2 d6:2 bb5:2 d6:2 g6:4 | f5:1 g5:1 a5:1 c6:1 f6:2 c6:2 a5:2 c6:2 f6:4 | a5:2 d6:2 f#6:2 a6:2 f#6:2 d6:2 a5:4 | d6:8 f#6:4 a6:4 |`;
    // a low horn counter line under A (written at pitch)
    const hnA = 'd4:16 | eb4:16 | f4:16 | f4:8 c4:8 | d4:16 | g4:8 eb4:8 | eb4:16 | d4:8 f#4:8 |';
    // build: the head in augmentation on strings (written at pitch)
    const slC = 'g4:6 bb4:2 d5:8 | eb5:6 d5:2 bb4:8 | c5:8 eb5:8 | d5:8 f#4:8 | g4:6 bb4:2 d5:8 | f5:6 eb5:2 d5:8 | eb5:4 d5:4 c5:4 a4:4 | g4:16 |';
    const drive = '1:2 1:2 8:2 1:2 5:2 1:2 8:2 5:2';
    const groove = 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 |';
    const I = {
      ch: '=Gm3:16 | =D3:16 |', bass: 'g1:16 | d2:16 |',
      tp: '%v6 ' + roll('p', 16) + ' | %v9 ' + roll('m', 8) + ' m:2 m:2 p:4 |',
      drm: 'y:16 | r:8 s:2 s:2 s:2 x:2 |',
    };
    const A = {
      mel: mA, hn: hnA, ch: block(cA, 3), st: weave(cA, 3, [0, 2, 3, 2], 16, 2), bass: bass(cA, drive, 2),
      tp: d('m:4 r:4 p:2 p:2 r:4 | m:4 r:4 p:2 p:2 r:4 | m:4 r:4 p:2 p:2 r:4 | m:2 m:2 p:2 p:2 m:1 m:1 m:1 m:1 p:4 |', 2),
      drm: 'kx:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 | ' + d(groove, 6) + ' k:2 h:2 s:2 s:2 t:2 t:2 s:2 x:2 |',
    };
    const B = {
      mel: mB, hn: '%v6 ' + stab(cB, 'X:2 r:2 X:2 r:2 r:8', 3), ch: block(cB, 3), st: weave(cB, 3, [0, 2, 3, 2], 16, 1), bass: bass(cB, drive, 2),
      tp: d('m:2 r:2 m:2 r:2 p:4 r:4 |', 7) + ' ' + roll('m', 8) + ' p:2 p:2 p:4 |',
      drm: d('k:2 h:2 s:2 h:2 k:2 h:2 s:2 s:1 s:1 |', 7) + ' k:2 s:2 s:2 s:2 t:2 t:2 m:2 x:2 |',
    };
    const C = {
      sl: slC, hp: arp(cC, 3), ch: '%v5 ' + block(cC, 3), bass: '%v8 ' + bass(cC, '1:8 5:8', 2),
      tp: '%v7 ' + d('p:8 m:8 |', 2) + ' %v9 ' + d('p:4 r:4 m:4 r:4 |', 2) + ' %v11 ' + d('p:2 r:2 p:2 r:2 m:2 m:2 r:4 |', 2) +
        ' %v13 p:2 p:2 m:2 m:2 p:2 p:2 m:2 m:2 | ' + roll('m', 8) + ' p:2 p:2 y:4 |',
      drm: d('r:16 |', 6) + ' r:8 s:2 s:2 s:2 s:2 | ' + roll('s', 8) + ' s:2 s:2 x:4 |',
    };
    song('battle_legend', {
      desc: 'Astara and Anwela legendary battles: epic, soaring and mythic (brass, choir pad, timpani, string build; strings lead on the repeat).',
      bpm: 150, loop: 1, order: 'I A B C A/x B/y', gain: 0.8,
      inst: {
        mel: { patch: 'brass', vol: 12, tr: -12 }, hn: { patch: 'brass', vol: 4, pan: 0.3 }, sl: { patch: 'strings', vol: 11 },
        ch: { patch: 'pad', vol: 6 }, st: { patch: 'stac', vol: 5, pan: -0.2 }, hp: { patch: 'harp', vol: 6, arp: 2, pan: 0.35 },
        bass: { patch: 'synbass', vol: 12 }, tp: { patch: 'kit', vol: 9 }, drm: { patch: 'kit', vol: 10 },
      },
      vars: { x: { mel: { patch: 'strings', vol: 11 }, hn: { vol: 8 } }, y: { st: { patch: 'pizz', vol: 6 }, ch: { patch: 'strings', vol: 5 } } },
      sections: { I, A, B, C },
    });
  }

  // ---------------------------------------------------------------- battle_admin (Am, tense and urgent) — DS-style arrangement
  // A soft pulse lead over a 16th staccato pedal, off-beat piano jabs and shaker; a phrygian (Bb) piano breakdown with a heartbeat kick.
  {
    const cA = ['Am', 'Am', 'F', 'E', 'Am', 'Dm', 'E', 'E'];
    const cB = ['F', 'E', 'Am', 'Am', 'Dm', 'E', 'Am', 'E'];
    const cC = ['Am', 'Bb', 'Am', 'Bb', 'F', 'E', 'F', 'E'];
    // the original melodies (sounding an octave lower through inst.mel.tr)
    const mA = `a5:1 r:1 a5:1 r:1 c6:2 e6:2 a6:4 e6:4 | a5:1 r:1 a5:1 r:1 c6:2 e6:2 g#6:4 e6:4 | f5:1 r:1 f5:1 r:1 a5:2 c6:2 f6:4 c6:4 | e6:2 d6:2 c6:2 b5:2 g#5:8 |
           a5:1 r:1 a5:1 r:1 c6:2 e6:2 a6:4 e6:4 | d6:2 f6:2 a6:2 f6:2 d6:4 a5:4 | g#5:2 b5:2 e6:2 g#6:2 b6:2 a6:2 g#6:4 | e6:8 r:8 |`;
    const mB = `[ f6:2 ]x4 c6:4 a5:4 | [ e6:2 ]x4 b5:4 g#5:4 | [ a5:2 ]x4 c6:4 e6:4 | a6:4 e6:4 c6:4 a5:4 |
           [ d6:2 ]x4 f6:4 a6:4 | [ e6:2 ]x4 g#6:4 b5:4 | a5:2 c6:2 e6:2 a6:2 e6:2 c6:2 a5:4 | g#5:2 b5:2 e6:2 g#6:2 e6:8 |`;
    // breakdown: a low piano line over the heartbeat (written at pitch)
    const pnC = `a3:4 c4:4 e4:4 c4:4 | bb3:4 d4:4 f4:8 | a3:4 c4:4 e4:4 a4:4 | bb4:8 f4:8 |
           a4:4 f4:4 c4:4 a3:4 | g#3:4 b3:4 e4:8 | f4:4 a4:4 c5:4 a4:4 | g#4:8 e4:4 b3:4 |`;
    const jab = 'r:2 X:1 r:1 r:4 r:2 X:1 r:1 r:4';
    const I = {
      st: weave(['Am', 'E'], 3, [0, 0, 0, 2], 16, 1), bass: 'a1:3 r:1 a1:3 r:1 a1:2 r:6 | e1:3 r:1 e1:3 r:1 e2:2 e1:2 g#1:2 b1:2 |',
      drm: 'k:4 r:4 k:4 r:4 | k:2 k:2 s:2 s:2 s:1 s:1 s:1 s:1 x:4 |',
    };
    const A = {
      mel: mA, st: weave(cA, 3, [0, 0, 0, 2], 16, 1), pn: stab(cA, jab, 3), bass: bass(cA, '1:3 r:1 1:3 r:1 5:2 1:2 8:2 5:2', 2),
      drm: d('k:2 h:1 h:1 s:2 h:2 k:2 k:2 s:2 h:1 h:1 |', 7) + ' k:2 s:1 s:1 s:2 s:1 s:1 t:2 t:2 s:2 x:2 |',
    };
    const B = {
      mel: mB, st: weave(cB, 3, [0, 2, 0, 3], 16, 1), pn: stab(cB, jab, 3), pad: block(cB, 3), bass: bass(cB, '1:2 1:2 8:2 1:2 1:2 5:2 8:2 5:2', 2),
      drm: 'kx:2 g:2 s:2 g:2 k:2 g:2 s:2 g:2 | ' + d('k:2 g:2 s:2 g:2 k:2 k:2 s:2 g:2 |', 6) + ' s:2 s:2 s:1 s:1 s:2 t:2 t:2 a:2 x:2 |',
    };
    const C = {
      pn: '%v10 ' + pnC, pad: '%v4 ' + block(cC, 3), bass: '%v9 ' + bass(cC, '1:2 r:2 1:2 r:2 1:2 r:2 1:2 r:2', 2),
      drm: d('k:2 k:2 r:4 i:4 r:4 |', 6) + ' k:2 k:2 s:2 s:2 s:2 s:2 s:2 s:2 | ' + roll('s', 8) + ' t:2 t:2 a:2 x:2 |',
    };
    song('battle_admin', {
      desc: 'Pleat (Starch Society admin) battles: tense, sharp and urgent (pulse lead, staccato pedal, piano jabs, heartbeat breakdown; reed and pizzicato on the repeat).',
      bpm: 148, loop: 1, order: 'I A B C A/r B/r', gain: 0.9,
      inst: {
        mel: { patch: 'lead', vol: 11, tr: -12 }, st: { patch: 'stac', vol: 5, pan: -0.2 }, pn: { patch: 'piano', vol: 6, pan: 0.25 },
        pad: { patch: 'strings', vol: 5 }, bass: { patch: 'synbass', vol: 12 }, drm: { patch: 'kit', vol: 10 },
      },
      vars: { r: { mel: { patch: 'reed', vol: 12 }, st: { patch: 'pizz', vol: 7 } } },
      sections: { I, A, B, C },
    });
  }

  // ---------------------------------------------------------------- battle_needle (Fm, grand and polished) — DS-style arrangement
  // A warm lead doubled by reed over rippling 16th piano, brass stabs and timpani; a harp and piano breakdown; brass takes the lead on the repeat.
  {
    const cA = ['Fm', 'Db', 'Ab', 'Eb', 'Fm', 'Db', 'Bbm', 'C'];
    const cB = ['Db', 'Eb', 'Fm', 'Fm', 'Db', 'Eb', 'C', 'C'];
    const cC = ['Db', 'Eb', 'C', 'Fm', 'Db', 'Eb', 'C', 'C'];
    // the original melodies (sounding an octave lower through inst tr)
    const mA = `f5:2 ab5:2 c6:4 f6:4 c6:4 | db6:4 f6:4 ab6:4 f6:4 | ab5:2 c6:2 eb6:4 ab6:4 eb6:4 | g6:4 eb6:4 bb5:4 g5:4 |
           f5:2 ab5:2 c6:4 f6:4 ab6:4 | f6:4 db6:4 ab5:4 db6:4 | bb5:2 db6:2 f6:4 bb6:4 f6:4 | g5:2 c6:2 e6:2 g6:2 e6:2 c6:2 g5:4 |`;
    const mB = `db6:8 c6:4 db6:4 | eb6:8 d6:4 eb6:4 | f6:6 eb6:2 c6:8 | ab6:4 f6:4 c6:4 f6:4 |
           db6:2 f6:2 ab6:4 f6:2 db6:2 ab5:4 | eb6:2 g6:2 bb6:4 g6:2 eb6:2 bb5:4 | e6:2 g6:2 c7:4 g6:4 e6:4 | c6:8 e6:4 g6:4 |`;
    // breakdown: the piano alone over harp (written at pitch)
    const pnC = `f4:2 ab4:2 c5:4 db5:4 c5:4 | bb4:2 g4:2 eb4:4 g4:4 bb4:4 | c5:2 e4:2 g4:4 c5:4 e5:4 | f5:8 c5:4 ab4:4 |
           f4:2 ab4:2 c5:4 db5:4 f5:4 | eb5:4 db5:4 c5:4 bb4:4 | c5:2 db5:2 e5:4 g5:4 e5:4 | c5:8 g4:4 e4:4 |`;
    const drive = '1:2 1:2 8:2 1:2 5:2 1:2 8:2 5:2';
    const I = {
      pn: weave(['Fm', 'C'], 3, [0, 1, 2, 3], 16, 1), bass: bass(['Fm', 'C'], drive, 2),
      tp: 'm:4 r:12 | m:2 m:2 p:2 p:2 m:1 m:1 m:1 m:1 p:4 |', drm: 'r:16 | r:8 s:2 s:2 s:2 x:2 |',
    };
    const A = {
      mel: mA, dbl: mA, pn: weave(cA, 3, [0, 1, 2, 3], 16, 1), bass: bass(cA, drive, 2), tp: d('m:4 r:12 |', 8),
      drm: 'kx:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 | ' + d('k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 |', 6) + ' k:2 h:2 s:2 s:2 t:2 t:2 t:2 s:2 |',
    };
    const B = {
      mel: mB, dbl: mB, pn: weave(cB, 3, [0, 2, 1, 3], 16, 1), pad: block(cB, 3), hn: stab(cB, 'X:2 r:2 X:2 r:6 X:2 r:2', 3),
      bass: bass(cB, drive, 2), tp: d('m:4 r:4 p:4 r:4 |', 8),
      drm: d('k:2 o:2 s:2 h:2 k:2 k:2 s:2 o:2 |', 7) + ' s:2 s:2 t:2 t:2 s:1 s:1 s:1 s:1 x:4 |',
    };
    const C = {
      pn: '%v9 ' + pnC, hp: arp(cC, 3), pad: '%v4 ' + block(cC, 3), bass: '%v8 ' + bass(cC, '1:8 5:8', 2),
      drm: d('i:4 r:4 i:4 r:2 i:2 |', 6) + ' k:2 s:2 k:2 s:2 k:2 s:2 s:2 s:2 | ' + roll('s', 8) + ' t:2 t:2 m:2 x:2 |',
    };
    // tag: the lead outlines the changes over brass stabs and the piano ripple, back into A (sounding an octave lower)
    const cT = ['Fm', 'Db', 'Bbm', 'C'];
    const T = {
      mel: 'f5:4 ab5:4 c6:4 f6:4 | f6:4 db6:4 ab5:4 db6:4 | bb5:4 db6:4 f6:4 db6:4 | c6:4 e6:4 g6:4 e6:4 |', pn: weave(cT, 3, [0, 1, 2, 3], 16, 1),
      hn: stab(cT, 'X:2 r:2 X:2 r:2 X:2 X:2 r:4', 3), bass: bass(cT, drive, 2), tp: d('m:4 r:4 p:4 r:4 |', 3) + ' ' + roll('m', 8) + ' p:2 p:2 p:4 |',
      drm: d('k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 |', 3) + ' k:2 s:2 s:2 s:2 t:2 t:2 s:1 s:1 x:2 |',
    };
    song('battle_needle', {
      desc: 'Four Needles Elite Four battles: grand, intense and polished (warm lead doubled by reed, rippling piano, brass stabs; brass lead on the repeat).',
      bpm: 162, loop: 1, order: 'I A B C A/b B/b T', gain: 0.88,
      inst: {
        mel: { patch: 'warm', vol: 10, tr: -12 }, dbl: { patch: 'reed', vol: 6, tr: -12, pan: 0.2 }, pn: { patch: 'piano', vol: 6, pan: -0.25 },
        hn: { patch: 'brass', vol: 5, pan: 0.3 }, hp: { patch: 'harp', vol: 7, arp: 2, pan: 0.35 }, pad: { patch: 'strings', vol: 5 },
        bass: { patch: 'synbass', vol: 12 }, tp: { patch: 'kit', vol: 10 }, drm: { patch: 'kit', vol: 10 },
      },
      vars: { b: { mel: { patch: 'brass', vol: 11 }, dbl: { mute: true }, hn: { vol: 6 } } },
      sections: { I, A, B, C, T },
    });
  }

  // ---------------------------------------------------------------- battle_grand (Bm, the biggest) — DS-style arrangement
  // Brass doubled by strings, choir pad, 16th staccato strings, pushing brass stabs, harp sweeps and the heaviest timpani; a brass fanfare build.
  {
    const cA = ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'Em', 'A'];
    const cB = ['D', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A'];
    const cC = ['G', 'A', 'Bm', 'Bm', 'G', 'A', 'F#', 'F#'];
    // the original melodies (sounding an octave lower through inst tr)
    const mA = `b5:4 d6:4 f#6:8 | g6:4 f#6:2 e6:2 d6:8 | d6:4 f#6:4 a6:8 | a6:4 g6:2 f#6:2 e6:8 |
           b5:2 d6:2 f#6:4 b6:4 f#6:4 | g6:4 b6:4 g6:4 d6:4 | e6:4 g6:4 b6:4 g6:4 | c#6:2 e6:2 a6:4 e6:4 c#6:4 |`;
    const mB = `a5:2 d6:2 f#6:2 a6:2 d6:8 | e6:2 a6:2 c#6:2 e6:2 a5:8 | b5:2 d6:2 f#6:2 b6:2 f#6:8 | g6:2 b6:2 d6:2 g6:2 d6:8 |
           a5:2 d6:2 f#6:2 a6:2 d6:8 | e6:4 c#6:4 a5:4 c#6:4 | g5:2 b5:2 d6:2 g6:2 b6:4 g6:4 | a6:8 e6:4 c#6:4 |`;
    // build: a brass fanfare that climbs to F# (written at pitch)
    const hzC = 'd4:2 d4:2 d4:2 g4:4 b4:6 | c#4:2 c#4:2 c#4:2 e4:4 a4:6 | d4:2 f#4:2 b4:4 d5:8 | c#5:4 b4:4 a4:4 f#4:4 | g4:2 g4:2 g4:2 b4:4 d5:6 | a4:2 a4:2 a4:2 c#5:4 e5:6 | f#5:8 e5:4 c#5:4 | a#4:16 |';
    const drive = '1:1 1:1 8:2 1:1 1:1 8:2 5:1 5:1 8:2 1:1 1:1 5:2';
    const groove = 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 |';
    const fill = roll('m', 8) + ' p:2 p:2 p:4 |';
    const I = {
      hz: 'b3:2 b3:2 b3:2 d4:4 f#4:6 | a3:2 a3:2 a3:2 c#4:4 e4:6 |', ch: '=Bm3:16 | =A3:16 |',
      bass: 'b1:2 b1:2 b1:2 b1:4 b1:6 | a1:2 a1:2 a1:2 a1:4 a1:6 |',
      tp: 'm:2 m:2 m:2 p:4 p:6 | ' + roll('m', 8) + ' p:2 p:2 y:4 |', drm: 'x:2 r:14 | r:8 s:2 s:2 s:2 s:2 |',
    };
    const A = {
      mel: mA, dbl: mA, ch: block(cA, 3), st: weave(cA, 3, [0, 0, 2, 0, 3, 0, 2, 0], 16, 1), hn: stab(cA, 'X:3 X:3 X:2 r:8', 3), bass: bass(cA, drive, 2),
      tp: d('m:4 r:4 p:4 r:4 |', 7) + ' ' + fill,
      drm: d('kx:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 | ' + d(groove, 2) + ' k:2 h:2 s:2 h:2 k:2 k:2 s:2 x:2 |', 2),
    };
    const B = {
      mel: mB, dbl: mB, ch: block(cB, 3), hp: arp(cB, 3), st: weave(cB, 3, [0, 2, 3, 2], 16, 1), hn: stab(cB, 'X:3 X:3 X:2 r:8', 3), bass: bass(cB, drive, 2),
      tp: d('m:2 r:2 m:2 r:2 p:2 r:2 p:2 r:2 |', 7) + ' ' + fill,
      drm: d('kx:2 h:2 s:2 o:2 k:2 h:2 s:2 h:2 | k:2 h:2 s:2 o:2 k:2 k:2 s:2 h:2 |', 3) + ' k:2 h:2 s:2 o:2 k:2 k:2 s:2 h:2 | k:2 s:2 s:2 s:2 t:2 t:2 t:2 x:2 |',
    };
    const C = {
      hz: hzC, ch: '%v5 ' + block(cC, 3), st: '%v5 ' + weave(cC, 3, [0, 2], 16, 2), bass: '%v10 ' + bass(cC, '1:4 r:2 1:2 5:4 r:4', 2),
      tp: d('p:4 r:12 |', 2) + ' ' + d('p:4 r:4 m:4 r:4 |', 2) + ' ' + d('p:2 r:2 p:2 r:2 m:2 r:2 m:2 r:2 |', 2) +
        ' m:2 m:2 p:2 p:2 m:2 m:2 p:2 p:2 | ' + roll('m', 8) + ' p:2 p:2 y:4 |',
      drm: d('k:4 r:4 s:4 r:4 |', 4) + ' ' + d('k:4 h:4 s:4 h:4 |', 2) + ' k:2 s:2 k:2 s:2 k:2 s:2 s:2 s:2 | ' + roll('s', 8) + ' s:2 s:2 x:4 |',
    };
    song('battle_grand', {
      desc: 'Weave Guardian (champion) battle: triumphant, epic and relentless (brass doubled by strings, choir pad, timpani, brass fanfare build; warm lead on the repeat).',
      bpm: 156, loop: 1, order: 'I A B C A/w B/w', gain: 0.76,
      inst: {
        mel: { patch: 'brass', vol: 12, tr: -12 }, dbl: { patch: 'strings', vol: 6, tr: -12 }, hz: { patch: 'brass', vol: 11, pan: 0.1 },
        hn: { patch: 'brass', vol: 4, pan: 0.3 }, ch: { patch: 'pad', vol: 6 }, st: { patch: 'stac', vol: 6, pan: -0.2 },
        hp: { patch: 'harp', vol: 5, pan: 0.35 }, bass: { patch: 'synbass', vol: 12 }, tp: { patch: 'kit', vol: 9 }, drm: { patch: 'kit', vol: 10 },
      },
      vars: { w: { mel: { patch: 'warm', vol: 11 }, hn: { vol: 6 } } },
      sections: { I, A, B, C },
    });
  }

  // ---------------------------------------------------------------- league (Em, stately) — DS-style arrangement
  // A horn-like brass melody over harp and strings with timpani and a soft snare; a glockenspiel breakdown; strings take the tune on the repeat.
  {
    const cA = ['Em', 'C', 'G', 'D', 'Em', 'C', 'D', 'B'];
    const cB = ['C', 'D', 'Em', 'Bm', 'C', 'D', 'B', 'B'];
    const cC = ['Em', 'C', 'G', 'D', 'Em', 'Am', 'D', 'B'];
    // the original melodies (sounding an octave lower through inst.mel.tr); B's peak is kept short instead of holding a high C
    const mA = `b5:6 g5:2 e5:8 | c6:6 g5:2 e5:8 | d6:6 b5:2 g5:8 | a5:6 f#5:2 d6:8 |
           e6:6 b5:2 g5:8 | e6:4 d6:4 c6:4 g5:4 | d6:4 f#6:4 a6:8 | d#6:4 f#6:4 b5:8 |`;
    const mB = `g5:4 c6:4 e6:8 | f#5:4 a5:4 d6:8 | g5:4 b5:4 e6:8 | f#5:4 b5:4 d6:8 |
           e6:4 g6:4 c7:2 b6:2 g6:4 | d6:4 f#6:4 a6:4 f#6:4 | b5:4 d#6:4 f#6:6 e6:2 | f#6:8 d#6:4 b5:4 |`;
    const ctrB = 'e4:8 g4:8 | f#4:8 a4:8 | g4:8 b4:8 | f#4:16 | g4:8 e4:8 | f#4:8 d4:8 | d#4:8 f#4:8 | d#4:16 |';
    // breakdown: a music-box glockenspiel over harp (written at pitch)
    const glkC = 'b4:4 e5:4 g5:8 | c5:4 e5:4 g5:8 | b4:4 d5:4 g5:8 | a4:4 d5:4 f#5:8 | g5:4 e5:4 b4:8 | c5:4 e5:4 a5:8 | f#5:4 d5:4 a4:8 | b4:4 d#5:4 f#5:8 |';
    const I = {
      hp: arp(['Em', 'B'], 3), pad: block(['Em', 'B'], 3), bass: 'e2:16 | b1:16 |',
      tp: '%v6 ' + roll('p', 16) + ' | %v9 m:4 r:4 m:2 m:2 p:4 |',
    };
    const A = {
      mel: mA, hp: arp(cA, 3), pad: block(cA, 3), bass: bass(cA, '1:8 5:4 8:4', 2),
      tp: d('p:8 r:8 | p:8 r:8 | p:8 r:8 | p:4 r:4 m:2 m:2 m:2 m:2 |', 2),
      drm: d('k:8 h:4 s:4 |', 7) + ' k:4 s:2 s:2 s:2 s:2 s:1 s:1 s:1 s:1 |',
    };
    const B = {
      mel: mB, ctr: ctrB, hp: weave(cB, 3, [0, 1, 2, 3, 2, 1], 16, 2), pad: block(cB, 3), bass: bass(cB, '1:8 5:4 8:4', 2),
      tp: d('p:4 r:4 m:4 r:4 |', 8),
      drm: 'kx:8 h:4 s:4 | ' + d('k:8 h:4 s:4 |', 6) + ' k:4 s:2 s:2 t:2 t:2 s:2 s:2 |',
    };
    const C = {
      glk: glkC, hp: arp(cC, 3), pad: '%v3 ' + block(cC, 3), bass: '%v7 ' + bass(cC, '1:16', 2),
      tp: d('r:16 |', 6) + ' %v6 p:8 r:8 | ' + roll('p', 12) + ' m:4 |', drm: d('r:16 |', 7) + ' r:8 y:8 |',
    };
    song('league', {
      desc: 'Grand Atelier and Elite Four halls: stately, expectant and regal (horn-like brass, harp, timpani, glockenspiel breakdown; strings on the repeat).',
      bpm: 96, loop: 1, order: 'I A B C A/s B', gain: 0.92,
      inst: {
        mel: { patch: 'brass', vol: 10, tr: -12 }, ctr: { patch: 'reed', vol: 7, pan: 0.3 }, glk: { patch: 'glock', vol: 9, pan: 0.15 },
        hp: { patch: 'harp', vol: 6, arp: 2, pan: -0.3 }, pad: { patch: 'strings', vol: 4 }, bass: { patch: 'ebass', vol: 11 },
        tp: { patch: 'kit', vol: 9 }, drm: { patch: 'kit', vol: 6 },
      },
      vars: { s: { mel: { patch: 'strings', vol: 10 } } },
      sections: { I, A, B, C },
    });
  }

  // ---------------------------------------------------------------- hall_of_fame (C, triumphant then warm) — DS-style arrangement
  // A proud brass statement with timpani, then the warm half on flute over harp; a piano interlude; strings take the brass tune on the repeat.
  {
    const cA = ['C', 'F', 'C', 'G', 'Am', 'F', 'G', 'C'];
    const cB = ['F', 'G', 'C', 'Am', 'F', 'G', 'C', 'C'];
    const cC = ['F', 'C', 'Dm', 'G', 'F', 'C', 'Dm,G', 'C'];
    // the original melodies (sounding an octave lower through inst tr); the long high notes are broken up so nothing holds above A5
    const mA = `e5:4 g5:4 c6:8 | f6:6 e6:2 c6:8 | g5:4 c6:4 e6:8 | d6:6 b5:2 g5:8 |
           a5:4 c6:4 e6:8 | a6:4 g6:2 f6:2 c6:8 | b5:4 d6:4 g6:8 | c6:8 e6:4 g6:4 |`;
    const mB = `a5:4 c6:4 f6:8 | b5:4 d6:4 g6:8 | c6:4 e6:4 g6:4 c7:2 b6:2 | a6:4 g6:4 e6:4 c6:4 |
           a5:4 c6:4 f6:4 a6:4 | b5:4 d6:4 g6:4 f6:4 | c7:2 b6:2 g6:4 e6:4 g6:4 | c6:16 |`;
    // interlude: a warm piano tune (written at pitch)
    const pnC = 'a4:4 c5:4 f5:6 e5:2 | e5:4 d5:4 c5:8 | d5:4 f5:4 a5:6 g5:2 | g5:8 d5:4 b4:4 | a4:4 c5:4 f5:6 a5:2 | g5:4 e5:4 c5:8 | f5:4 d5:4 b4:4 d5:4 | c5:16 |';
    const I = {
      hn: '%v8 =C3:4 =C3:2 =C3:2 =F3:8 | =G3:8 =G3:4 r:4 |', bass: 'c2:8 f1:8 | g1:12 r:4 |',
      tp: 'm:4 r:4 m:2 m:2 p:4 | p:2 p:2 p:2 p:2 m:4 r:4 |', drm: 'x:16 | r:8 s:2 s:2 s:2 s:2 |',
    };
    const A = {
      mel: mA, hn: stab(cA, 'X:4 r:4 X:2 X:2 r:4', 3), pad: block(cA, 3), hp: arp(cA, 3), bass: bass(cA, '1:8 5:4 8:4', 2),
      tp: d('p:4 r:12 | m:4 r:12 | p:4 r:12 | m:4 r:4 m:2 m:2 p:4 |', 2),
      drm: 'kx:4 h:2 h:2 s:4 h:2 h:2 | ' + d('k:4 h:2 h:2 s:4 h:2 h:2 |', 6) + ' k:4 s:2 s:2 s:2 s:2 t:2 t:2 |',
    };
    const B = {
      fl: mB, hp: weave(cB, 3, [0, 1, 2, 3, 2, 1], 16, 2), pad: '%v4 ' + block(cB, 3), bass: bass(cB, '1:6 5:2 1:4 5:4', 2),
      drm: d('k:4 g:2 g:2 i:4 g:2 g:2 |', 7) + ' k:4 g:2 g:2 i:4 y:4 |',
    };
    const C = {
      pn: pnC, hp: weave(cC, 3, [0, 1, 2, 3], 16, 4), pad: '%v3 ' + block(cC, 3), bass: '%v7 ' + bass(cC, '1:16', 2), drm: d('r:16 |', 7) + ' r:8 y:8 |',
    };
    song('hall_of_fame', {
      desc: 'Hall of Fame induction: triumphant, then warm and glowing (brass and timpani, flute over harp, piano interlude; strings on the repeat).',
      bpm: 92, loop: 1, order: 'I A B C A/s B', gain: 0.92,
      inst: {
        mel: { patch: 'brass', vol: 11, tr: -12 }, fl: { patch: 'flute', vol: 11, tr: -12 }, hn: { patch: 'brass', vol: 4, pan: 0.3 },
        pn: { patch: 'piano', vol: 9, pan: -0.1 }, hp: { patch: 'harp', vol: 6, arp: 2, pan: 0.35 }, pad: { patch: 'strings', vol: 5 },
        bass: { patch: 'ebass', vol: 11 }, tp: { patch: 'kit', vol: 9 }, drm: { patch: 'kit', vol: 7 },
      },
      vars: { s: { mel: { patch: 'strings', vol: 11 }, hn: { vol: 7 } } },
      sections: { I, A, B, C },
    });
  }

  // ---------------------------------------------------------------- ending (G, warm and conclusive) — DS-style arrangement
  // Flute over piano and a gentle groove, a reed counter and harp in B, a quiet piano interlude; strings sing the tune on the repeat.
  {
    const cA = ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D'];
    const cB = ['Am', 'Em', 'F', 'C', 'Am', 'G', 'F', 'G'];
    const cC = ['C', 'G', 'Am', 'Em', 'F', 'C', 'D', 'D'];
    // the original melodies (sounding an octave lower through inst.mel.tr)
    const mA = `d6:8 b5:4 g5:4 | a5:8 f#5:4 d5:4 | g5:8 b5:4 e6:4 | e6:8 c6:4 g5:4 |
           d6:6 b5:2 g5:4 b5:4 | a5:6 f#5:2 a5:4 d6:4 | c6:4 e6:4 g6:8 | f#6:8 a5:4 d6:4 |`;
    const mB = `c6:8 e6:4 a5:4 | b5:8 g5:4 e5:4 | a5:4 c6:4 f6:8 | e6:8 g6:4 e6:4 |
           a5:4 c6:4 e6:4 a6:4 | g6:6 d6:2 b5:8 | a5:4 c6:4 f6:4 a5:4 | d6:8 g5:8 |`;
    const ctrB = 'c4:8 e4:8 | b3:8 g3:8 | a3:8 c4:8 | g3:8 c4:8 | e4:8 c4:8 | d4:8 b3:8 | a3:8 c4:8 | b3:8 d4:8 |';
    // interlude: a quiet piano tune (written at pitch)
    const pnC = 'e4:4 g4:4 c5:6 b4:2 | b4:4 a4:4 g4:8 | a4:4 c5:4 e5:6 d5:2 | d5:4 b4:4 g4:8 | a4:4 c5:4 f5:6 e5:2 | e5:4 d5:4 c5:8 | d5:4 f#5:4 a5:4 f#5:4 | d5:8 a4:4 f#4:4 |';
    const I = { hp: arp(['G', 'D'], 3), pad: block(['G', 'D'], 3), bass: 'g1:16 | d2:16 |' };
    const A = {
      mel: mA, keys: weave(cA, 3, [0, 1, 2, 1], 16, 2), pad: '%v3 ' + block(cA, 3), bass: bass(cA, '1:6 5:2 1:4 5:4', 2),
      drm: d('k:4 h:4 i:4 h:4 |', 7) + ' k:4 h:4 i:2 i:2 t:2 t:2 |',
    };
    const B = {
      mel: mB, ctr: ctrB, hp: arp(cB, 3), pad: block(cB, 3), bass: bass(cB, '1:4 5:4 8:4 5:4', 2),
      drm: 'kx:4 h:2 h:2 i:4 h:2 h:2 | ' + d('k:4 h:2 h:2 i:4 h:2 h:2 |', 6) + ' k:4 h:2 h:2 i:2 i:2 y:4 |',
    };
    const C = { keys: '%v9 ' + pnC, hp: weave(cC, 3, [0, 1, 2, 3], 16, 4), pad: '%v3 ' + block(cC, 3), bass: '%v7 ' + bass(cC, '1:16', 2), drm: d('r:16 |', 7) + ' r:8 y:8 |' };
    song('ending', {
      desc: 'Final ending scene: warm, emotional and conclusive (flute, piano, reed counter, harp; strings sing the tune on the repeat).',
      bpm: 88, swing: 0.03, loop: 1, order: 'I A B C A/st B', gain: 0.92,
      inst: {
        mel: { patch: 'flute', vol: 11, tr: -12 }, ctr: { patch: 'reed', vol: 6, pan: 0.3 }, keys: { patch: 'piano', vol: 7, pan: -0.25 },
        hp: { patch: 'harp', vol: 6, arp: 2, pan: 0.35 }, pad: { patch: 'strings', vol: 4 }, bass: { patch: 'ebass', vol: 11 }, drm: { patch: 'kit', vol: 6 },
      },
      vars: { st: { mel: { patch: 'strings', vol: 10 } } },
      sections: { I, A, B, C },
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
