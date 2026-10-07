/* src/audio/songs_jingles.js — one-shot fanfares (kind 'jingle', no loop). Notation: docs/audio.md */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const J = (id, bpm, bar, tracks, inst) =>
    NP.audio.song(id, { kind: 'jingle', bpm, bar, inst, loop: -1, order: 'A', sections: { A: tracks } });
  const rep = NP.audio.dsl.rep;

  J('j_win_wild', 160, 8, {
    p1: 'e5:1 e5:1 e5:2 c5:2 g5:2 | a5:2 g5:2 e5:2 g5:2 | c6:8',
    p2: '^C4:8 | ^F4:8 | ^C4:8',
    tri: 'c3:2 r:2 c3:2 r:2 | f3:2 r:2 f3:2 r:2 | c3:8',
    noi: 'k:2 s:2 k:2 s:2 | k:2 s:2 k:2 s:2 | kx:8',
  });
  J('j_win_tailor', 150, 8, {
    p1: 'g4:2 c5:2 e5:2 g5:2 | a5:4 g5:2 e5:2 | f5:2 e5:2 d5:2 g5:2 | c6:8',
    p2: '^C4:8 | ^F4:8 | ^G4:8 | ^C4:8',
    tri: 'c3:4 g3:4 | f3:4 c4:4 | g3:4 d3:4 | c3:8',
    noi: rep('k:2 h:2 s:2 h:2 |', 3) + ' kx:8',
  });
  J('j_win_master', 140, 8, {
    p1: 'd5:2 d5:2 d5:2 a5:2 | g5:3 f#5:1 g5:2 b5:2 | a5:2 f#5:2 d5:2 f#5:2 | e5:2 g5:2 b5:2 e6:2 | d6:8',
    p2: 'f#4:2 f#4:2 f#4:2 d5:2 | d5:3 d5:1 d5:2 g5:2 | f#5:2 d5:2 a4:2 d5:2 | b4:2 e5:2 g5:2 b5:2 | a5:8',
    tri: 'd3:2 r:1 d3:1 d3:2 r:2 | g3:2 r:1 g3:1 g3:2 r:2 | d3:2 r:1 d3:1 d3:2 r:2 | e3:2 r:1 e3:1 e3:2 e3:2 | d3:8',
    noi: rep('k:2 s:2 k:2 s:2 |', 4) + ' kx:8',
  }, { p1: { duty: 1, vol: 12 }, p2: { duty: 1, vol: 9 } });
  J('j_levelup', 170, 8, {
    p1: 'c5:1 e5:1 g5:1 c6:1 e6:2 c6:2 | g5:1 c6:1 e6:1 g6:1 c7:4',
    p2: '^C4:8 | ^C5:8',
    tri: 'c3:4 g3:4 | c3:8',
    noi: 'k:4 s:4 | kx:8',
  });
  J('j_heal', 120, 8, {
    p1: '%ep e5:2 g5:2 c6:2 e6:2 | d6:2 c6:2 g5:2 e5:2 | c6:8',
    p2: '%ep ^C4:8 | ^G3:8 | ^C4:8',
    tri: 'c3:8 | g2:8 | c3:8',
  });
  J('j_item', 150, 4, { p1: 'g5:1 b5:1 d6:2 | g6:4', p2: 'd5:2 g5:2 | b5:4', tri: 'g3:4 | g3:4' });
  J('j_key_item', 130, 8, {
    p1: 'e5:2 g5:2 b5:2 e6:2 | d6:2 b5:2 g5:2 b5:2 | e6:8',
    p2: '^Em4:8 | ^G4:8 | ^Em4:8',
    tri: 'e3:4 b3:4 | g3:4 d3:4 | e3:8',
    noi: 'k:4 s:4 | k:4 s:4 | kx:8',
  });
  J('j_evolve', 120, 8, {
    p1: 'c5:2 d5:2 e5:2 g5:2 | e5:2 g5:2 a5:2 c6:2 | g5:2 a5:2 b5:2 d6:2 | c6:2 e6:2 g6:4',
    p2: '^C4:8 | ^Am4:8 | ^G4:8 | ^C5:8',
    tri: 'c3:8 | a2:8 | g2:8 | c3:8',
    noi: 'h:2 h:2 h:2 h:2 | h:2 h:2 h:2 h:2 | h:2 h:2 h:2 h:2 | kx:8',
  });
  J('j_caught', 140, 8, {
    p1: 'g4:2 c5:2 e5:2 g5:2 | e5:2 c5:2 g5:4 | a5:2 f5:2 a5:2 c6:2 | b5:2 g5:2 c6:4',
    p2: '^C4:8 | ^C4:8 | ^F4:8 | ^G4:4 ^C4:4',
    tri: 'c3:4 g3:4 | c3:4 g3:4 | f3:4 c4:4 | g3:4 c3:4',
    noi: 'k:2 h:2 s:2 h:2 | k:2 h:2 s:2 h:2 | k:2 h:2 s:2 h:2 | k:2 s:2 k:2 kx:2',
  });
  J('j_button', 120, 8, {
    p1: 'f5:2 f5:2 f5:2 c6:2 | a5:4 c6:2 f6:2 | e6:2 d6:2 c6:2 bb5:2 | a5:2 bb5:2 c6:4 | g5:2 a5:2 bb5:2 d6:2 | f6:8',
    p2: 'a4:2 a4:2 a4:2 f5:2 | f5:4 a5:2 c6:2 | c6:2 bb5:2 a5:2 g5:2 | f5:2 g5:2 a5:4 | e5:2 f5:2 g5:2 bb5:2 | a5:8',
    tri: 'f3:2 r:1 f3:1 f3:2 r:2 | f3:4 a3:4 | c3:2 r:2 c4:2 r:2 | f3:2 g3:2 a3:2 f3:2 | c3:4 e3:4 | f3:8',
    noi: rep('k:2 s:2 k:2 s:2 |', 5) + ' kx:8',
  }, { p1: { duty: 1, vol: 12 }, p2: { duty: 2, vol: 8 } });
  J('j_encounter_society', 100, 8, {
    p1: 'e4:1 e4:1 r:2 e4:1 f4:1 r:2 | e4:2 b3:2 e4:4',
    p2: 'b3:1 b3:1 r:2 b3:1 c4:1 r:2 | b3:2 f3:2 b3:4',
    tri: 'e2:4 e2:4 | e2:8',
    noi: 'k:2 s:2 k:2 s:2 | k:2 s:1 s:1 sx:4',
  }, { p1: { duty: 0, vol: 12 }, p2: { duty: 0, vol: 9 } });
  J('j_encounter_tailor', 160, 8, {
    p1: 'a4:1 a4:1 c5:2 e5:2 a5:2 | g5:2 e5:2 d5:4',
    p2: '^Am4:8 | ^G4:8',
    tri: 'a2:2 a3:2 a2:2 a3:2 | g2:2 g3:2 g2:4',
    noi: 'k:2 h:2 s:2 h:2 | k:2 h:2 s:2 s:2',
  });
  J('j_shop', 130, 8, {
    p1: '%ep g5:2 e5:2 c5:2 e5:2 | g5:2 a5:2 g5:4',
    p2: '^C4:8 | ^F4:8',
    tri: 'c3:4 g3:4 | f3:4 c4:4',
    noi: 'h:2 h:2 h:2 h:2 | h:2 h:2 h:2 h:2',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
