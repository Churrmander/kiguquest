/* src/art/icons/emotes.js — the 8 overworld emotes (16x16): exclaim, question, heart, sweat, note, anger, sparkle, zzz.
 * A soft speech bubble (white with a faint tint, cool shadow bottom-right, plum outline) with its tail pointing at the speaker's head
 * and a clearly coloured symbol inside. Drawn above an actor by the overworld (`NP.assets.emote(name)`).
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const I = NP.art.icons;
  const K = I._kit;
  const H = I._items;
  const { P, layer } = K;
  const INK = '#3a2450';

  /** bubble body (14x11 round rect at 1,1) + tail, tinted; returns the layer */
  function bubble(tint) {
    const b = layer(16, 16);
    const r = H.R(tint, 0.8);
    H.rrect(b, 1, 1, 14, 11, 4, r, { mode: 'cel', sh: 1, hi: 1 });
    // the tail, pointing down at the speaker's head
    b.set(6, 12, P(r.m)); b.set(7, 12, P(r.m)); b.set(8, 12, P(r.d1)); b.set(9, 12, P(r.d1));
    b.set(7, 13, P(r.m)); b.set(8, 13, P(r.d1));
    b.set(7, 14, P(r.d1));
    return b;
  }
  const finish = (b, tag) => K.finish(b, INK, 16, tag);
  const art = (b, x, y, rows, map) => H.art(b, x, y, rows, map);

  const SYMBOLS = {
    exclaim: { tint: '#ffffff', draw: (b) => {
      art(b, 6, 3, ['.##.', '####', '####', '.##.', '.##.', '....', '.##.', '.##.'], { '#': '#ee3043' });
      art(b, 6, 3, ['....', '.#..', '.#..', '....', '....', '....', '....', '....'], { '#': '#ff9aa0' });
      art(b, 6, 3, ['....', '....', '....', '....', '....', '....', '....', '..#.'], { '#': '#a81c38' });
      b.set(3, 4, P('#ee3043')); b.set(4, 5, P('#ee3043')); b.set(12, 4, P('#ee3043')); b.set(11, 5, P('#ee3043'));   // a startled jolt
    } },
    question: { tint: '#f4f6ff', draw: (b) => {
      art(b, 5, 2, ['.####.', '##..##', '##..##', '...##.', '..##..', '..##..', '......', '..##..', '..##..'], { '#': '#4658dc' });
      art(b, 5, 2, ['.###..', '#.....', '#.....', '......', '......', '......', '......', '.#....', '......'], { '#': '#9aa8ff' });
    } },
    heart: { tint: '#ffeef4', draw: (b) => {
      art(b, 3, 3, ['.###..###.', '##########', '##########', '.########.', '..######..', '...####...', '....##....'], { '#': '#f0487e' });
      art(b, 3, 3, ['.##.......', '#.#.......', '#.........', '..........', '..........', '..........', '..........'], { '#': '#ffc0d4' });
      art(b, 3, 3, ['..........', '..........', '..........', '.......###', '......##..', '.....##...', '..........'].map((r) => r.replace(/#/g, '#')), { '#': '#c82860' });
    } },
    sweat: { tint: '#eef6ff', draw: (b) => {
      art(b, 4, 2, ['...#...', '..###..', '..###..', '.#####.', '#######', '#######', '.#####.', '..###..'], { '#': '#3a9cf0' });
      art(b, 4, 2, ['.......', '.......', '..#....', '.##....', '.#.....', '.......', '.......', '.......'], { '#': '#cfeaff' });
      art(b, 10, 5, ['.#.', '###', '###', '.#.'], { '#': '#6cb8f8' });
      b.set(10, 7, P('#e0f2ff'));
    } },
    note: { tint: '#effcf4', draw: (b) => {
      art(b, 4, 2, ['...###..', '...#..#.', '...#...#', '...#....', '...#....', '.###....', '####....', '.##.....'], { '#': '#1fa684' });
      art(b, 4, 2, ['........', '........', '........', '........', '........', '..#.....', '.#......', '........'], { '#': '#9af4d8' });
      art(b, 10, 6, ['.#.', '###', '.#.'], { '#': '#6ad8b4' });
    } },
    anger: { tint: '#fff2ee', draw: (b) => {
      art(b, 4, 2, ['##....##', '###..###', '.##..##.', '........', '.##..##.', '###..###', '##....##'], { '#': '#e82838' });
      art(b, 4, 2, ['........', '#.......', '........', '........', '........', '.......#', '........'], { '#': '#ff9090' });
    } },
    sparkle: { tint: '#fffbe8', draw: (b) => {
      art(b, 3, 2, ['...#...', '...#...', '..###..', '#######', '..###..', '...#...', '...#...'], { '#': '#f4b81c' });
      art(b, 3, 2, ['.......', '.......', '...#...', '..###..', '...#...', '.......', '.......'], { '#': '#fff6b0' });
      art(b, 10, 2, ['.#.', '###', '.#.'], { '#': '#f4b81c' });
      art(b, 9, 8, ['.#.', '###', '.#.'], { '#': '#ff9ec8' });
    } },
    zzz: { tint: '#f4f0ff', draw: (b) => {
      art(b, 2, 4, ['######', '....#.', '...#..', '..#...', '.#....', '######'], { '#': '#4a52d0' });
      art(b, 9, 2, ['####', '..#.', '.#..', '####'], { '#': '#7a84ec' });
      b.set(12, 8, P('#a8b0fa')); b.set(11, 9, P('#a8b0fa'));
    } },
  };

  for (const name of Object.keys(SYMBOLS)) {
    K.reg.emote[name] = () => {
      const s = SYMBOLS[name], b = bubble(s.tint);
      s.draw(b);
      return finish(b, 'emote_' + name);
    };
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
