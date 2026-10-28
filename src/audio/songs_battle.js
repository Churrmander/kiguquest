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

  // ---------------------------------------------------------------- battle_tailor (trainer, Dm) — DS-style arrangement
  // The lightest trainer theme: a jaunty clarinet-like reed over pizzicato off-beats; marimba and strings join in B.
  {
    const cA = ['Dm', 'Dm', 'Bb', 'C', 'Dm', 'Dm', 'Bb', 'A'];
    const cB = ['F', 'C', 'Gm', 'A', 'F', 'C', 'A', 'A'];
    const cC = ['Gm', 'Dm', 'Bb', 'A', 'Gm', 'Dm', 'Bb,C', 'A'];
    // the original melodies (sounding an octave lower through inst.mel.tr)
    const mA = `d5:4 f5:2 a5:2 d6:4 a5:4 | d6:2 d6:2 e6:2 f6:2 e6:4 d6:4 | bb5:4 d6:2 f6:2 bb5:4 f5:4 | c6:2 c6:2 d6:2 e6:2 g6:8 |
           d5:4 f5:2 a5:2 d6:4 f6:4 | a6:4 f6:2 d6:2 a5:8 | bb5:2 d6:2 f6:2 bb6:2 a6:4 f6:4 | e6:2 c#6:2 a5:2 c#6:2 e6:4 a5:4 |`;
    const mB = `a5:2 c6:2 f6:4 e6:2 c6:2 a5:4 | g5:2 c6:2 e6:4 d6:2 c6:2 g5:4 | g5:2 bb5:2 d6:4 g6:4 d6:4 | a5:2 c#6:2 e6:4 a6:4 e6:4 |
           f6:4 e6:2 c6:2 a5:2 c6:2 f6:4 | e6:4 d6:2 c6:2 g5:2 c6:2 e6:4 | a5:2 c#6:2 e6:2 a6:2 g6:2 e6:2 c#6:2 e6:2 | a6:8 e6:4 c#6:4 |`;
    const ctrB = 'a3:8 c4:8 | g3:8 e3:8 | bb3:8 d4:8 | c#4:8 e4:8 | c4:8 a3:8 | e4:8 g4:8 | e4:8 c#4:8 | e4:16 |';
    // breakdown: the marimba answers with the opening figure turned around (written at pitch)
    const mrC = `g4:2 bb4:2 d5:4 c5:2 bb4:2 g4:4 | a4:2 d5:2 f5:4 e5:2 d5:2 a4:4 | bb4:2 d5:2 f5:4 d5:2 bb4:2 f4:4 | e4:2 a4:2 c#5:4 e5:4 c#5:4 |
           g4:2 bb4:2 d5:4 c5:2 bb4:2 g4:4 | a4:2 d5:2 f5:4 a5:4 f5:4 | bb4:2 d5:2 f5:2 d5:2 c5:2 e5:2 g5:4 | a5:4 e5:2 c#5:2 a4:8 |`;
    const off = (ch) => stab(ch, 'r:2 X:2 r:2 X:2 r:2 X:2 r:2 X:2', 3);
    const drive = '1:2 1:2 8:2 1:2 5:2 1:2 8:2 5:2';
    const I = {
      pz: stab(['Dm', 'A'], 'X:2 r:2 X:2 r:2 X:2 r:2 X:2 X:2', 3),
      bass: 'd2:2 r:2 d2:2 r:2 d2:2 r:2 d2:2 d2:2 | a1:2 r:2 a1:2 r:2 a1:2 a1:2 c#2:2 e2:2 |',
      drm: 'k:2 r:2 h:2 r:2 k:2 r:2 h:2 h:2 | k:2 r:2 s:2 r:2 t:2 t:2 s:2 s:2 |',
    };
    const A = { mel: mA, pz: off(cA), bass: bass(cA, drive, 2), drm: d('k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 |', 7) + ' k:2 h:2 s:2 h:2 k:2 s:2 t:2 t:2 |' };
    const B = {
      mel: mB, ctr: ctrB, mr: weave(cB, 3, [0, 2, 1, 2], 16, 2), pz: off(cB), bass: bass(cB, drive, 2),
      drm: 'kx:2 h:2 s:2 o:2 k:2 h:2 s:2 h:2 | ' + d('k:2 h:2 s:2 o:2 k:2 k:2 s:2 h:2 |', 6) + ' k:2 s:2 s:2 s:2 t:2 t:2 s:2 x:2 |',
    };
    const C = {
      mr: '%v10 ' + mrC, pz: stab(cC, 'X:2 r:6 X:2 r:6', 3), pad: '%v4 ' + block(cC, 3), bass: '%v8 ' + bass(cC, '1:4 r:4 5:4 r:4', 2),
      drm: d('i:4 g:2 g:2 i:4 g:2 g:2 |', 6) + ' k:2 g:2 s:2 g:2 k:2 s:2 s:2 s:2 | s:1 s:1 s:1 s:1 s:2 s:2 t:2 t:2 x:4 |',
    };
    // turnaround: the lead rests while the marimba runs up and down the changes, back into A
    const cT = ['Dm', 'Bb', 'C', 'A'];
    const T = {
      mr: `%v10 d4:2 f4:2 a4:2 d5:2 c5:2 a4:2 f4:2 a4:2 | bb3:2 d4:2 f4:2 bb4:2 a4:2 f4:2 d4:2 f4:2 |
           c4:2 e4:2 g4:2 c5:2 bb4:2 g4:2 e4:2 g4:2 | a3:2 c#4:2 e4:2 a4:2 g4:2 e4:2 c#4:2 e4:2 |`,
      pz: off(cT), bass: bass(cT, drive, 2),
      drm: d('k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 |', 3) + ' k:2 s:2 s:2 s:2 t:2 t:2 s:1 s:1 x:2 |',
    };
    song('battle_tailor', {
      desc: 'Trainer battles: driving, determined and light on its feet (reed lead, pizzicato, marimba breakdown; warm lead on the repeat).',
      bpm: 168, loop: 1, order: 'I A B C A/w B/w T', gain: 0.9,
      inst: {
        mel: { patch: 'reed', vol: 12, tr: -12 }, ctr: { patch: 'strings', vol: 5, pan: -0.2 }, mr: { patch: 'marimba', vol: 8, pan: 0.3 },
        pz: { patch: 'pizz', vol: 6, pan: -0.3 }, pad: { patch: 'strings', vol: 5 }, bass: { patch: 'ebass', vol: 12 }, drm: { patch: 'kit', vol: 9 },
      },
      vars: { w: { mel: { patch: 'warm', vol: 10 }, pz: { vol: 7 } } },
      sections: { I, A, B, C, T },
    });
  }

  // ---------------------------------------------------------------- battle_master (big, brassy, Cm) — DS-style arrangement
  // Brass lead over 16th staccato strings and timpani; B adds the old second voice as a string counter; strings double the lead on the repeat.
  {
    const cA = ['Cm', 'Ab', 'Bb', 'G', 'Cm', 'Ab', 'Fm', 'G'];
    const cB = ['Eb', 'Bb', 'Cm', 'G', 'Ab', 'Eb', 'Fm', 'G'];
    const cC = ['Cm', 'Cm', 'Ab', 'Ab', 'Fm', 'Fm', 'G', 'G'];
    // the original melody and counter line (both sounding an octave lower through inst tr)
    const mA = `c5:2 c5:2 c5:2 eb5:2 g5:4 eb5:4 | ab5:2 ab5:2 c6:2 ab5:2 eb6:4 c6:4 | bb5:2 bb5:2 d6:2 bb5:2 f6:4 d6:4 | g5:2 b5:2 d6:2 g6:2 f6:8 |
           c5:2 c5:2 c5:2 eb5:2 g5:4 c6:4 | ab5:2 c6:2 eb6:2 ab6:2 g6:4 eb6:4 | f6:2 f6:2 ab5:2 c6:2 f6:4 c6:4 | d6:2 d6:2 b5:2 g5:2 d6:8 |`;
    const mB = `g5:4 bb5:4 eb6:8 | d6:4 f6:4 bb6:4 f6:4 | c6:4 eb6:4 g6:8 | d6:4 g6:4 b5:4 d6:4 |
           ab5:4 c6:4 eb6:4 ab6:4 | g6:4 eb6:4 bb5:4 g5:4 | f6:4 ab6:4 c7:4 ab6:4 | g6:8 d6:4 b5:4 |`;
    const ctrB = 'eb5:4 g5:4 bb5:8 | f5:4 bb5:4 d6:8 | eb5:4 g5:4 c6:8 | b4:4 d5:4 g5:4 b5:4 | c5:4 eb5:4 ab5:4 c6:4 | bb4:4 g4:4 eb5:4 bb4:4 | ab5:4 c6:4 f6:4 c6:4 | b5:8 g5:4 d5:4 |';
    // build: a horn sings the head in long notes over pizzicato while the timpani grows (written at pitch)
    const hzC = 'c4:6 d4:2 eb4:8 | g4:8 f4:4 eb4:4 | ab4:6 g4:2 f4:8 | eb4:8 c4:8 | f4:6 g4:2 ab4:8 | c5:8 ab4:4 f4:4 | g4:8 b4:8 | d5:8 b4:4 g4:4 |';
    const I = {
      hn: '%v8 =Cm3:2 r:2 =Cm3:2 r:2 =Cm3:4 =Cm3:4 | =Ab2:4 =Bb2:4 =G2:8 |',
      bass: 'c2:2 r:2 c2:2 r:2 c2:4 c2:4 | ab1:4 bb1:4 g1:8 |',
      tp: 'm:2 r:2 m:2 r:2 p:4 p:4 | p:4 p:4 m:1 m:1 m:1 m:1 m:1 m:1 m:1 m:1 |',
      drm: 'x:4 r:12 | r:8 s:2 s:2 s:2 s:2 |',
    };
    const A = {
      mel: mA, dbl: mA, st: weave(cA, 3, [0, 0, 2, 0, 3, 0, 2, 0], 16, 1), hn: stab(cA, 'X:2 r:6 X:2 r:2 X:2 r:2', 3),
      bass: bass(cA, '1:2 1:2 1:2 5:2 1:2 1:2 8:2 5:2', 2),
      tp: d('m:4 r:12 | m:4 r:12 | m:4 r:12 | m:4 r:8 p:2 p:2 |', 2),
      drm: 'kx:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 | ' + d('k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 |', 6) + ' k:2 h:2 s:2 s:2 t:2 t:2 s:2 x:2 |',
    };
    const B = {
      mel: mB, dbl: mB, ctr: ctrB, pad: block(cB, 3), st: weave(cB, 3, [0, 2, 3, 2], 16, 2), bass: bass(cB, '1:4 1:2 5:2 1:4 5:2 8:2', 2),
      tp: d('p:4 r:4 m:4 r:4 |', 7) + ' m:2 m:2 p:2 p:2 m:1 m:1 m:1 m:1 p:4 |',
      drm: d('k:4 s:2 h:2 k:2 k:2 s:2 h:2 |', 7) + ' k:2 s:2 s:2 s:2 t:2 t:2 s:1 s:1 x:2 |',
    };
    const C = {
      hz: hzC, pz: weave(cC, 3, [0, 2, 1, 2], 16, 2), pad: '%v4 ' + block(cC, 3), bass: '%v8 ' + bass(cC, '1:4 r:4 1:4 r:4', 2),
      tp: '%v6 ' + d('p:4 r:4 p:4 r:4 |', 2) + ' %v8 ' + d('m:4 r:4 m:2 m:2 r:4 |', 2) + ' %v10 ' + d('p:2 r:2 p:2 r:2 m:2 m:2 m:2 r:2 |', 2) +
        ' %v12 m:2 m:2 m:2 m:2 p:2 p:2 p:2 p:2 | m:1 m:1 m:1 m:1 m:1 m:1 m:1 m:1 p:2 p:2 y:4 |',
      drm: d('r:16 |', 6) + ' s:4 s:4 s:2 s:2 s:2 s:2 | s:1 s:1 s:1 s:1 s:1 s:1 s:1 s:1 s:2 s:2 x:4 |',
    };
    song('battle_master', {
      desc: 'Salon Master battles: big, brassy and celebratory (brass lead, staccato strings, timpani build; strings double the lead on the repeat).',
      bpm: 152, loop: 1, order: 'I A B C A/d B/d', gain: 0.84,
      inst: {
        mel: { patch: 'brass', vol: 12, tr: -12 }, dbl: { patch: 'strings', vol: 6, tr: -12, mute: true }, ctr: { patch: 'strings', vol: 6, tr: -12, pan: -0.25 },
        hn: { patch: 'brass', vol: 4, pan: 0.3 }, hz: { patch: 'brass', vol: 10, pan: 0.1 }, st: { patch: 'stac', vol: 6, pan: -0.2 },
        pz: { patch: 'pizz', vol: 7, pan: -0.3 }, pad: { patch: 'pad', vol: 5 }, bass: { patch: 'synbass', vol: 12 },
        tp: { patch: 'kit', vol: 10 }, drm: { patch: 'kit', vol: 10 },
      },
      vars: { d: { dbl: { mute: false }, hn: { vol: 6 } } },
      sections: { I, A, B, C },
    });
  }

  // ---------------------------------------------------------------- battle_rival (heroic, fast, Am) — DS-style arrangement
  // A friend, not a villain: warm lead over a guitar chug and tambourine, a major-key brass anthem as the contrast, low brass doubling on the repeat.
  {
    const cA = ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E'];
    const cB = ['Dm', 'Am', 'F', 'E', 'Dm', 'Am', 'E', 'E'];
    const cC = ['F', 'G', 'C', 'Am', 'F', 'G', 'E', 'E'];
    // the original melodies (sounding an octave lower through inst.mel.tr; inst.lo doubles them two octaves down)
    const mA = `a5:2 a5:1 c6:1 e6:2 c6:2 a5:2 e5:2 a5:4 | f5:2 f5:1 a5:1 c6:2 a5:2 f6:4 c6:4 | g5:2 g5:1 c6:1 e6:2 c6:2 g6:4 e6:4 | g5:2 b5:2 d6:2 g6:2 f6:2 d6:2 b5:4 |
           a5:2 a5:1 c6:1 e6:2 c6:2 a5:2 e5:2 a5:4 | c6:2 a5:2 f5:2 a5:2 c6:2 f6:2 a6:4 | d6:2 f6:2 a6:2 f6:2 d6:2 f6:2 d6:4 | g#5:2 b5:2 e6:2 g#6:2 e6:8 |`;
    const mB = `d6:4 d6:2 f6:2 a6:4 f6:4 | c6:4 c6:2 e6:2 a6:4 e6:4 | a5:4 a5:2 c6:2 f6:4 c6:4 | b5:4 g#5:2 b5:2 e6:4 g#6:4 |
           d6:4 d6:2 f6:2 a6:4 f6:4 | e6:2 c6:2 a5:2 c6:2 e6:4 a5:4 | e6:2 g#6:2 b6:2 g#6:2 e6:2 g#5:2 b5:2 e6:2 | e6:8 b5:4 g#5:4 |`;
    // contrast: a heroic C-major brass anthem over harp and strings (written at pitch)
    const hzC = 'a4:4 c5:4 f5:6 e5:2 | d5:4 b4:4 g4:8 | e4:4 g4:4 c5:6 b4:2 | a4:12 r:4 | f4:4 a4:4 c5:6 d5:2 | e5:4 d5:4 b4:8 | g#4:4 b4:4 e5:6 d5:2 | e5:16 |';
    const chug = 'X:2 r:1 X:1 r:2 X:2 r:2 X:2 r:1 X:1 X:2';
    const drive = '1:2 1:2 8:2 1:2 1:2 8:2 5:2 1:2';
    const I = {
      gt: stab(['Am', 'E'], chug, 3), bass: bass(['Am', 'E'], drive, 2),
      drm: 'k:2 r:2 k:2 r:2 s:2 r:2 k:2 k:2 | s:2 s:2 s:2 s:2 t:2 t:2 s:1 s:1 x:2 |',
    };
    const A = {
      mel: mA, lo: mA, gt: stab(cA, chug, 3), bass: bass(cA, drive, 2),
      drm: d('k:2 j:2 s:2 j:2 k:2 k:2 s:2 j:2 |', 7) + ' k:2 j:2 s:2 j:2 k:2 s:1 s:1 s:2 s:2 |',
    };
    const B = {
      mel: mB, lo: mB, hn: stab(cB, 'X:3 r:1 X:2 r:2 r:8', 3), pad: block(cB, 3), gt: stab(cB, chug, 3), bass: bass(cB, drive, 2),
      drm: 'kx:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 | ' + d('k:2 h:2 s:2 o:2 k:2 k:2 s:2 h:2 |', 6) + ' k:2 s:2 s:2 s:2 t:2 t:2 t:2 x:2 |',
    };
    const C = {
      hz: hzC, hp: arp(cC, 3), pad: '%v5 ' + block(cC, 3), bass: '%v9 ' + bass(cC, '1:8 5:8', 2),
      drm: d('k:4 j:4 s:4 j:4 |', 6) + ' k:2 j:2 s:2 j:2 k:2 s:2 s:2 s:2 | s:1 s:1 s:1 s:1 s:2 s:2 t:2 t:2 x:4 |',
    };
    // tag: a low brass riff in unison with the guitar, back into A (written at pitch)
    const cT = ['Am', 'F', 'G', 'E'];
    const T = {
      hz: `a3:2 a3:2 c4:2 a3:2 e4:2 a3:2 d4:2 c4:2 | f3:2 f3:2 a3:2 f3:2 c4:2 f3:2 a3:2 c4:2 |
           g3:2 g3:2 b3:2 g3:2 d4:2 g3:2 b3:2 d4:2 | e3:2 g#3:2 b3:2 e4:2 g#4:2 e4:2 b3:2 g#3:2 |`,
      gt: stab(cT, chug, 3), bass: bass(cT, drive, 2),
      drm: d('k:2 j:2 s:2 j:2 k:2 k:2 s:2 j:2 |', 2) + ' k:2 j:2 s:2 j:2 k:2 s:2 t:2 t:2 | t:2 t:2 s:2 s:2 s:1 s:1 s:1 s:1 x:4 |',
    };
    song('battle_rival', {
      desc: 'Rival battles: fast, competitive and heroic, a friend not a villain (warm lead, guitar chug, brass anthem; low brass doubling on the repeat).',
      bpm: 174, loop: 1, order: 'I A B A/h C B/h T', gain: 0.86,
      inst: {
        mel: { patch: 'warm', vol: 11, tr: -12 }, lo: { patch: 'brass', vol: 6, tr: -24, mute: true }, hz: { patch: 'brass', vol: 10, pan: 0.1 },
        hn: { patch: 'brass', vol: 5, pan: 0.3 }, gt: { patch: 'guitar', vol: 4, pan: -0.3 }, hp: { patch: 'harp', vol: 6, arp: 2, pan: 0.35 },
        pad: { patch: 'strings', vol: 4 }, bass: { patch: 'synbass', vol: 12 }, drm: { patch: 'kit', vol: 10 },
      },
      vars: { h: { lo: { mute: false }, hn: { vol: 6 } } },
      sections: { I, A, B, C, T },
    });
  }

  // ---------------------------------------------------------------- battle_society (menacing march, Dm) — DS-style arrangement
  // Low brass march over a 16th staccato pedal, piano hits, anvil and timpani; a phrygian (Eb) breakdown on reed and claps; strings take the tune on the repeat.
  {
    const cA = ['Dm', 'Dm', 'Gm', 'A', 'Dm', 'Bb', 'A', 'A'];
    const cB = ['Bb', 'A', 'Bb', 'A', 'Gm', 'Dm', 'A', 'A'];
    const cC = ['Dm', 'Dm', 'Eb', 'Eb', 'Dm', 'Dm', 'Gm', 'A'];
    // the original melodies (sounding an octave lower through inst.mel.tr)
    const mA = `d5:3 r:1 d5:3 r:1 f5:2 e5:2 d5:2 r:2 | d5:3 r:1 d5:3 r:1 a5:2 g5:2 f5:2 r:2 | g5:3 r:1 g5:3 r:1 bb5:2 a5:2 g5:2 r:2 | a5:3 r:1 c#6:3 r:1 e6:2 d6:2 c#6:2 r:2 |
           d6:4 c6:2 bb5:2 a5:4 f5:4 | bb5:4 a5:2 g5:2 f5:4 d5:4 | e5:3 r:1 e5:3 r:1 g5:2 f5:2 e5:2 r:2 | c#6:2 e6:2 a6:4 e6:4 c#6:4 |`;
    const mB = `bb5:2 d6:2 f6:2 d6:2 bb5:2 d6:2 f6:4 | a5:2 c#6:2 e6:2 c#6:2 a5:2 c#6:2 e6:4 | bb5:2 d6:2 f6:2 bb6:2 a6:4 f6:4 | e6:2 c#6:2 a5:2 c#6:2 e6:8 |
           g5:4 bb5:4 d6:4 g6:4 | f6:4 d6:4 a5:4 f5:4 | a5:3 r:1 a5:3 r:1 c#6:2 e6:2 a6:4 | e6:8 r:4 a5:2 c#6:2 |`;
    const ctrB = 'd4:8 f4:8 | e4:8 c#4:8 | d4:8 f4:8 | e4:16 | d4:8 bb3:8 | a3:8 f4:8 | e4:8 g4:8 | e4:8 c#4:8 |';
    // breakdown: a whispered reed motif over the bass ostinato, claps and anvil (written at pitch)
    const rdC = 'd4:4 r:2 e4:2 f4:4 e4:4 | d4:8 a3:8 | eb4:4 r:2 f4:2 g4:4 f4:4 | eb4:8 bb3:8 | d4:4 r:2 e4:2 f4:4 a4:4 | g4:8 f4:8 | g4:4 bb4:4 d5:4 bb4:4 | a4:4 c#5:4 e5:8 |';
    const march = '1:3 r:1 1:3 r:1 5:2 1:2 5:2 r:2';
    const I = {
      pn: '=Dm2:4 r:12 | =A2:4 r:12 |',
      bass: 'd2:3 r:1 d2:3 r:1 d2:2 r:6 | a1:3 r:1 a1:3 r:1 a1:2 r:6 |',
      tp: 'p:4 r:12 | p:4 r:4 m:2 m:2 m:2 m:2 |',
      drm: 'ka:4 r:4 s:2 s:1 s:1 s:2 s:2 | k:4 r:4 s:1 s:1 s:1 s:1 s:1 s:1 s:1 s:1 |',
    };
    const A = {
      mel: mA, st: weave(cA, 3, [0, 0, 1, 0], 16, 1), pn: stab(cA, 'X:4 r:12', 2), bass: bass(cA, march, 2),
      tp: d('p:4 r:12 | p:4 r:12 | p:4 r:12 | p:4 r:4 m:2 m:2 m:2 m:2 |', 2),
      drm: 'ka:4 s:2 s:1 s:1 k:4 s:4 | ' + d('k:4 s:2 s:1 s:1 k:4 s:4 |', 3) + ' ka:4 s:2 s:1 s:1 k:4 s:4 | ' + d('k:4 s:2 s:1 s:1 k:4 s:4 |', 2) +
        ' k:2 s:1 s:1 s:2 s:1 s:1 s:1 s:1 s:1 s:1 s:2 s:2 |',
    };
    const B = {
      mel: mB, ctr: ctrB, pad: block(cB, 3), st: weave(cB, 3, [0, 0, 2, 0], 16, 1), pn: stab(cB, 'X:4 r:12', 2), bass: bass(cB, march, 2),
      tp: d('p:4 r:4 m:4 r:4 |', 8),
      drm: 'kx:4 s:4 k:2 k:2 s:2 s:1 s:1 | ' + d('k:4 s:4 k:2 k:2 s:2 s:1 s:1 |', 6) + ' s:2 s:2 s:2 s:2 s:1 s:1 s:1 s:1 t:2 x:2 |',
    };
    const C = {
      rd: rdC, pad: '%v4 ' + block(cC, 3), bass: '%v9 ' + bass(cC, '1:2 r:2 1:2 8:2 r:2 1:2 5:2 r:2', 2),
      tp: '%v8 ' + d('p:8 r:8 |', 4) + ' ' + d('p:4 r:4 p:4 r:4 |', 2) + ' p:2 p:2 m:2 m:2 p:2 p:2 m:2 m:2 | m:1 m:1 m:1 m:1 m:1 m:1 m:1 m:1 m:2 m:2 p:4 |',
      drm: d('k:4 c:4 r:4 c:4 |', 3) + ' ka:4 c:4 r:4 c:2 c:2 | ' + d('k:4 c:4 k:2 r:2 c:4 |', 2) +
        ' k:2 s:2 c:2 s:2 k:2 s:2 c:2 s:2 | s:1 s:1 s:1 s:1 s:1 s:1 s:1 s:1 s:2 s:2 t:2 x:2 |',
    };
    song('battle_society', {
      desc: 'Starch Society battles: menacing, precise and march-like (low brass, snare march, anvil, phrygian reed breakdown; strings lead on the repeat).',
      bpm: 124, loop: 1, order: 'I A B C A/s B', gain: 0.9,
      inst: {
        mel: { patch: 'brass', vol: 11, tr: -12 }, ctr: { patch: 'reed', vol: 7, pan: 0.3 }, rd: { patch: 'reed', vol: 11 },
        st: { patch: 'stac', vol: 5, pan: -0.2 }, pn: { patch: 'piano', vol: 7, pan: -0.15 }, pad: { patch: 'strings', vol: 5 },
        bass: { patch: 'synbass', vol: 12 }, tp: { patch: 'kit', vol: 10 }, drm: { patch: 'kit', vol: 10 },
      },
      vars: { s: { mel: { patch: 'strings', vol: 10 }, pn: { vol: 9 } } },
      sections: { I, A, B, C },
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
