/* src/audio/songs_jingles.js — one-shot fanfares (kind 'jingle', no loop). Notation: docs/audio.md
   DS-style voicing: named channels on instrument patches (lead, harmony, harp/strings bed, e-bass, kit). Lengths and tunes match the
   originals; jingles whose tunes climbed past C6 now sound an octave lower (inst tr -12) with a glockenspiel doubling for sparkle. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  // default band; a jingle overrides or adds channels through its own inst
  const BAND = {
    mel: { patch: 'brass', vol: 11 }, mel2: { patch: 'warm', vol: 7, pan: 0.25 }, bell: { patch: 'glock', vol: 6, pan: 0.3 },
    harm: { patch: 'harp', vol: 7, pan: -0.3 }, pad: { patch: 'strings', vol: 5 }, bass: { patch: 'ebass', vol: 11 }, drm: { patch: 'kit', vol: 9 },
  };
  // gain trims each jingle back to the loudness of its older version (render-tool LUFS)
  const GAIN = { j_win_wild: 0.76, j_win_tailor: 0.82, j_win_master: 0.86, j_levelup: 0.8, j_heal: 0.64, j_item: 0.83, j_key_item: 0.91,
    j_evolve: 0.72, j_caught: 0.84, j_button: 0.98, j_encounter_society: 0.84, j_encounter_tailor: 0.78, j_shop: 0.9 };
  const J = (id, bpm, bar, tracks, inst) =>
    NP.audio.song(id, { kind: 'jingle', bpm, bar, gain: GAIN[id] || 1, inst: Object.assign({}, BAND, inst), loop: -1, order: 'A', sections: { A: tracks } });
  const rep = NP.audio.dsl.rep;
  const LOW = { tr: -12 };
  const low = (o) => Object.assign({}, o, LOW);

  // battle victories: brass fanfare over harp and strings
  J('j_win_wild', 160, 8, {
    mel: 'e5:1 e5:1 e5:2 c5:2 g5:2 | a5:2 g5:2 e5:2 g5:2 | c6:8',
    harm: '^C4:8 | ^F4:8 | ^C4:8',
    pad: '=C4:8 | =F3:8 | =C4:8',
    bass: 'c2:2 r:2 c3:2 r:2 | f2:2 r:2 f3:2 r:2 | c2:8',
    drm: 'k:2 s:2 k:2 s:2 | k:2 s:2 k:2 s:2 | kx:8',
  });
  J('j_win_tailor', 150, 8, {
    mel: 'g4:2 c5:2 e5:2 g5:2 | a5:4 g5:2 e5:2 | f5:2 e5:2 d5:2 g5:2 | c6:8',
    mel2: 'e4:2 g4:2 c5:2 e5:2 | f5:4 e5:2 c5:2 | d5:2 c5:2 b4:2 d5:2 | e5:8',
    harm: '^C4:8 | ^F4:8 | ^G4:8 | ^C4:8',
    bass: 'c2:4 g2:4 | f2:4 c3:4 | g2:4 d2:4 | c2:8',
    drm: rep('k:2 h:2 s:2 h:2 |', 3) + ' kx:8',
  }, { mel2: { patch: 'reed', vol: 7, pan: 0.25 } });
  J('j_win_master', 140, 8, {
    mel: 'd5:2 d5:2 d5:2 a5:2 | g5:3 f#5:1 g5:2 b5:2 | a5:2 f#5:2 d5:2 f#5:2 | e5:2 g5:2 b5:2 e6:2 | d6:8',
    mel2: 'f#4:2 f#4:2 f#4:2 d5:2 | d5:3 d5:1 d5:2 g5:2 | f#5:2 d5:2 a4:2 d5:2 | b4:2 e5:2 g5:2 b5:2 | a5:8',
    bell: 'd5:2 d5:2 d5:2 a5:2 | g5:3 f#5:1 g5:2 b5:2 | a5:2 f#5:2 d5:2 f#5:2 | e5:2 g5:2 b5:2 e6:2 | d6:8',
    pad: '=D3:8 | =G3:8 | =D3:8 | =Em3:8 | =D3:8',
    bass: 'd2:2 r:1 d2:1 d2:2 r:2 | g2:2 r:1 g2:1 g2:2 r:2 | d2:2 r:1 d2:1 d2:2 r:2 | e2:2 r:1 e2:1 e2:2 e2:2 | d2:8',
    drm: rep('k:2 s:2 k:2 s:2 |', 4) + ' kx:8',
  }, { mel: low({ patch: 'brass', vol: 12 }), mel2: low({ patch: 'brass', vol: 8, pan: 0.25 }), bell: low(BAND.bell) });
  // level up: quick rising arpeggio, warm lead doubled by glockenspiel
  J('j_levelup', 170, 8, {
    mel: 'c5:1 e5:1 g5:1 c6:1 e6:2 c6:2 | g5:1 c6:1 e6:1 g6:1 c7:4',
    bell: 'c5:1 e5:1 g5:1 c6:1 e6:2 c6:2 | g5:1 c6:1 e6:1 g6:1 c7:4',
    harm: '^C4:8 | ^C5:8',
    bass: 'c2:4 g2:4 | c2:8',
    drm: 'k:4 s:4 | kx:8',
  }, { mel: low({ patch: 'warm', vol: 11 }), bell: low(BAND.bell) });
  // healed: soft e-piano and glockenspiel chime over harp, no drums
  J('j_heal', 120, 8, {
    mel: 'e5:2 g5:2 c6:2 e6:2 | d6:2 c6:2 g5:2 e5:2 | c6:8',
    bell: 'e5:2 g5:2 c6:2 e6:2 | d6:2 c6:2 g5:2 e5:2 | c6:8',
    harm: '^C4:8 | ^G3:8 | ^C4:8',
    pad: '=C4:8 | =G3:8 | =C4:8',
    bass: 'c2:8 | g1:8 | c2:8',
  }, { mel: low({ patch: 'epiano', vol: 11 }), bell: low({ patch: 'glock', vol: 7, pan: 0.3 }), pad: { patch: 'pad', vol: 5 } });
  // item get
  J('j_item', 150, 4, {
    mel: 'g5:1 b5:1 d6:2 | g6:4', bell: 'g5:1 b5:1 d6:2 | g6:4', harm: 'd4:2 g4:2 | b4:4', bass: 'g2:4 | g2:4',
  }, { mel: low({ patch: 'warm', vol: 11 }), bell: low({ patch: 'glock', vol: 8, pan: 0.3 }) });
  J('j_key_item', 130, 8, {
    mel: 'e5:2 g5:2 b5:2 e6:2 | d6:2 b5:2 g5:2 b5:2 | e6:8',
    bell: 'e5:2 g5:2 b5:2 e6:2 | d6:2 b5:2 g5:2 b5:2 | e6:8',
    harm: '^Em3:8 | ^G3:8 | ^Em3:8',
    pad: '=Em3:8 | =G3:8 | =Em3:8',
    bass: 'e2:4 b2:4 | g2:4 d2:4 | e2:8',
    drm: 'k:4 s:4 | k:4 s:4 | kx:8',
  }, { mel: low({ patch: 'brass', vol: 11 }), bell: low(BAND.bell) });
  // evolution: flute climbs over strings and harp
  J('j_evolve', 120, 8, {
    mel: 'c5:2 d5:2 e5:2 g5:2 | e5:2 g5:2 a5:2 c6:2 | g5:2 a5:2 b5:2 d6:2 | c6:2 e6:2 g6:4',
    bell: 'c5:2 d5:2 e5:2 g5:2 | e5:2 g5:2 a5:2 c6:2 | g5:2 a5:2 b5:2 d6:2 | c6:2 e6:2 g6:4',
    harm: '^C3:8 | ^Am3:8 | ^G3:8 | ^C4:8',
    pad: '=C3:8 | =Am3:8 | =G3:8 | =C4:8',
    bass: 'c2:8 | a1:8 | g1:8 | c2:8',
    drm: 'g:2 g:2 g:2 g:2 | g:2 g:2 g:2 g:2 | g:2 g:2 h:2 h:2 | kx:8',
  }, { mel: low({ patch: 'flute', vol: 12 }), bell: low({ patch: 'glock', vol: 5, pan: 0.3 }) });
  J('j_caught', 140, 8, {
    mel: 'g4:2 c5:2 e5:2 g5:2 | e5:2 c5:2 g5:4 | a5:2 f5:2 a5:2 c6:2 | b5:2 g5:2 c6:4',
    harm: '^C4:8 | ^C4:8 | ^F4:8 | ^G4:4 ^C4:4',
    pad: '=C4:8 | =C4:8 | =F3:8 | =G3:4 =C4:4',
    bass: 'c2:4 g2:4 | c2:4 g2:4 | f2:4 c3:4 | g2:4 c2:4',
    drm: 'k:2 h:2 s:2 h:2 | k:2 h:2 s:2 h:2 | k:2 h:2 s:2 h:2 | k:2 s:2 k:2 kx:2',
  });
  // gym button: the big one — low brass pair, glockenspiel, strings
  J('j_button', 120, 8, {
    mel: 'f5:2 f5:2 f5:2 c6:2 | a5:4 c6:2 f6:2 | e6:2 d6:2 c6:2 bb5:2 | a5:2 bb5:2 c6:4 | g5:2 a5:2 bb5:2 d6:2 | f6:8',
    mel2: 'a4:2 a4:2 a4:2 f5:2 | f5:4 a5:2 c6:2 | c6:2 bb5:2 a5:2 g5:2 | f5:2 g5:2 a5:4 | e5:2 f5:2 g5:2 bb5:2 | a5:8',
    bell: 'f5:2 f5:2 f5:2 c6:2 | a5:4 c6:2 f6:2 | e6:2 d6:2 c6:2 bb5:2 | a5:2 bb5:2 c6:4 | g5:2 a5:2 bb5:2 d6:2 | f6:8',
    pad: '=F3:8 | =F3:8 | =C3:8 | =F3:8 | =C3:8 | =F3:8',
    bass: 'f2:2 r:1 f2:1 f2:2 r:2 | f2:4 a2:4 | c2:2 r:2 c3:2 r:2 | f2:2 g2:2 a2:2 f2:2 | c2:4 e2:4 | f2:8',
    drm: rep('k:2 s:2 k:2 s:2 |', 5) + ' kx:8',
  }, { mel: low({ patch: 'brass', vol: 12 }), mel2: low({ patch: 'reed', vol: 9, pan: 0.25 }), bell: low({ patch: 'glock', vol: 5, pan: 0.3 }) });
  // encounters
  J('j_encounter_society', 100, 8, {
    mel: 'e4:1 e4:1 r:2 e4:1 f4:1 r:2 | e4:2 b3:2 e4:4',
    mel2: 'b3:1 b3:1 r:2 b3:1 c4:1 r:2 | b3:2 f3:2 b3:4',
    bass: 'e2:4 e2:4 | e2:8',
    drm: 'k:2 s:2 k:2 s:2 | k:2 s:1 s:1 sx:4',
  }, { mel: { patch: 'brass', vol: 12 }, mel2: { patch: 'reed', vol: 10, pan: -0.2 }, bass: { patch: 'synbass', vol: 12 } });
  J('j_encounter_tailor', 160, 8, {
    mel: 'a4:1 a4:1 c5:2 e5:2 a5:2 | g5:2 e5:2 d5:4',
    harm: '^Am3:8 | ^G3:8',
    bass: 'a1:2 a2:2 a1:2 a2:2 | g1:2 g2:2 g1:4',
    drm: 'k:2 h:2 s:2 h:2 | k:2 h:2 s:2 s:2',
  }, { harm: { patch: 'stac', vol: 7, pan: -0.25 }, bass: { patch: 'synbass', vol: 12 } });
  // shop door: marimba over e-piano, shaker
  J('j_shop', 130, 8, {
    mel: 'g5:2 e5:2 c5:2 e5:2 | g5:2 a5:2 g5:4',
    harm: '^C4:8 | ^F4:8',
    bass: 'c2:4 g2:4 | f2:4 c3:4',
    drm: 'g:2 g:2 g:2 g:2 | g:2 g:2 g:2 g:2',
  }, { mel: { patch: 'marimba', vol: 11 }, harm: { patch: 'epiano', vol: 7, arp: 2, pan: -0.25 } });
})(typeof globalThis !== 'undefined' ? globalThis : window);
