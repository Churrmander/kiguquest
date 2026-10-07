/* src/art/kigu/looks-starters.js — look specs: the three starter families (konko, ottopi, sprubun lines).
 * A spec is ~10 lines: palette + hood/ears + hair + a few parts. Parts are documented in docs/art-kigu.md. */
(function (root) {
  'use strict';
  const K = root.NP.art.kigu;
  const D = K.define;

  // ---------------------------------------------------------------- fox line (Ember)
  const FOX = { main: '#f28a3a', sub: '#fff1d8', hair: '#b85a26', mitt: '#5a3430', foot: '#5a3430', eye: '#f0a020', flame: '#ffd640', inner: '#ffc9a0', acc: '#d63a3a', trim: '#fff1d8' };
  D('konko', {
    name: 'Konko', stage: 1, size: 47, rise: 7, pal: FOX,
    hood: { type: 'up', ears: { kind: 'tri', h: 9, w: 4, lean: 1 } },
    hair: { style: 'short', bangs: 'part' },
    arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [
      ['tail', { kind: 'fox', len: 19, r: 5, tip: 'sub', angle: 50, dx: 3, flame: 'flame' }],
      ['belly', { mat: 'sub' }],
    ],
  });
  D('kitsuri', {
    name: 'Kitsuri', stage: 2, size: 54, rise: 8, pal: FOX, bodyW: 1.0,
    hood: { type: 'band', ears: { kind: 'tri', h: 10, w: 4.5, lean: 1, mat: 'main' }, mat: 'main' },
    hair: { style: 'long', bangs: 'part', drop: 2 },
    arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [
      ['tail', { kind: 'fox', len: 20, r: 5, tip: 'sub', angle: 52, dx: 3, flame: 'flame', id: 'a' }],
      ['tail', { kind: 'fox', len: 20, r: 5, tip: 'sub', angle: -52, dx: -3, flame: 'flame', id: 'b', side: -1 }],
      ['belly', { mat: 'sub' }],
      ['scarf', { mat: 'acc', hang: 10, stripe: 'trim' }],
      ['bell', { at: 'neck', dy: 7, dx: -1, r: 2 }],
      ['hat', { kind: 'headband', mat: 'acc', knot: true }],
    ],
  });
  D('kyuubelle', {
    name: 'Kyuubelle', stage: 3, size: 61, rise: 9, pal: Object.assign({}, FOX, { acc: '#c83a4a', main: '#f4913e', fire: '#6fd8ff', mask: '#fff6e6' }),
    hood: { type: 'band', ears: { kind: 'tri', h: 11, w: 5, lean: 1, mat: 'main' }, mat: 'main' },
    hair: { style: 'long', bangs: 'part', drop: 4 },
    arms: { mittMat: 'mitt', mat: 'acc' }, footMat: 'foot',
    parts: [
      ['tail', { kind: 'fox', n: 9, base: 'back', fan: 100, len: 23, r: 3.6, tip: 'sub', dy: 4, curl: 0.1, tipAt: 0.78 }],
      ['belly', { mat: 'acc', kind: 'jacket', len: 4, trim: 'trim' }],
      ['scarf', { mat: 'sub', hang: 0, thick: -1 }],
      ['shapes', { stage: 'headgear', at: 'head', g: 'mask', list: [['e', 13, 9, 4.5, 5.5, 'mask'], ['p', [[10, 5], [13, 2], [16, 5]], 'mask'], ['l', 11, 8, 15, 8, 'acc'], ['l', 12, 11, 14, 11, 'acc']] }],
      ['shapes', { stage: 'front', at: 'head', m: true, g: 'fire', shade: 0, list: [['p', [[17, 10], [20, 4], [19, 8], [22, 1], [23, 9], [21, 14], [18, 14]], 'fire', 0], ['p', [[19, 12], [21, 8], [22, 12]], 'sub', 0]] }],
    ],
  });

  // ---------------------------------------------------------------- otter line (Tide)
  const OT = { main: '#38b2b6', sub: '#fff0d8', hair: '#7a4a2c', mitt: '#2a7f90', foot: '#2a7f90', eye: '#5a3a1a', shell: '#f59ab0', acc: '#ffd23a', acc2: '#5cc0f0', navy: '#27406a', bubble: '#cdeeff', freck: '#a06a4a' };
  D('ottopi', {
    name: 'Ottopi', stage: 1, size: 47, rise: 4, pal: OT,
    hood: { type: 'up', ears: { kind: 'round', h: 3, w: 3.2, lean: 1, dy: 1 } },
    hair: { style: 'short', bangs: 'part', lock: true },
    face: ['freckles'],
    arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [
      ['tail', { kind: 'otter', len: 14, r: 5, angle: 55, dx: 3, dy: 2 }],
      ['belly', { mat: 'sub', w: 1.1 }],
      ['shapes', { stage: 'outfit', at: 'chest', g: 'shell', list: [['e', 0, 4, 4.5, 3.5, 'shell'], ['l', 0, 1, 0, 7, 'shell', -1], ['l', -2, 2, -3, 6, 'shell', -1], ['l', 2, 2, 3, 6, 'shell', -1]] }],
    ],
  });
  D('ottelia', {
    name: 'Ottelia', stage: 2, size: 54, rise: 5, pal: Object.assign({}, OT, { poncho: '#ffd84a' }),
    hood: { type: 'band', ears: { kind: 'round', h: 3, w: 3.4, lean: 1, dy: 1 }, mat: 'main' },
    hair: { style: 'bob', bangs: 'part' },
    face: ['freckles'],
    arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [
      ['belly', { kind: 'poncho', mat: 'poncho', trim: 'acc' }],
      ['collar', { kind: 'sailor', mat: 'sub', trim: 'navy' }],
      ['tail', { kind: 'otter', len: 14, r: 4.5, angle: 50, dx: 3 }],
      ['ring', { at: 'waist', dy: -1, rx: 9, ry: 3.5, th: 2.2, mat: 'sub', mat2: 'shell', n: 6 }],
      ['shapes', { stage: 'headgear', at: 'head', m: true, g: 'clip', list: [['e', 11, 7, 2, 2, 'bubble'], ['e', 14, 10, 1.3, 1.3, 'bubble']] }],
    ],
  });
  D('ottomarine', {
    name: 'Ottomarine', stage: 3, size: 61, rise: 7, pal: Object.assign({}, OT, { coat: '#27406a', gold: '#f4c542' }),
    hood: { type: 'none' },
    hair: { style: 'bob', bangs: 'part' },
    face: ['freckles'],
    arms: { mittMat: 'mitt', mat: 'coat' }, footMat: 'foot',
    parts: [
      ['tail', { kind: 'otter', len: 18, r: 6, angle: 50, dx: 3, dy: 3 }],
      ['belly', { kind: 'jacket', mat: 'coat', len: 5, trim: 'gold' }],
      ['shapes', { stage: 'outfit', at: 'chest', m: true, g: 'buttons', list: [['e', 4, 3, 1, 1, 'gold'], ['e', 4, 8, 1, 1, 'gold']] }],
      ['hat', { kind: 'beret', mat: 'coat' }],
      ['hat', { kind: 'buns', mat: 'hair' }],
      ['ring', { at: 'handR', dx: -6, dy: -2, rx: 7, ry: 7, th: 2.6, mat: 'sub', mat2: 'shell', n: 4 }],
    ],
  });

  // ---------------------------------------------------------------- bunny line (Sprout)
  const BUN = { main: '#8fdc9c', sub: '#fff5e8', hair: '#d8f0c0', mitt: '#6ec48a', foot: '#6ec48a', eye: '#3a8a5a', clover: '#4ea86a', leaf: '#5cc860', cheek: '#ffb0c0', acc: '#ffffff', lily: '#fff8f0', inner: '#ffb7c5', flowerP: '#ff9ec0', flowerY: '#ffe060' };
  D('sprubun', {
    name: 'Sprubun', stage: 1, size: 48, rise: 10, pal: BUN,
    hood: { type: 'up', ears: { kind: 'floppy', h: 11, w: 3.4, lean: 2, droop: 1, dx: -1 } },
    hair: { style: 'short', bangs: 'spiky' },
    arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [
      ['tail', { kind: 'puff', r: 4, tip: 'sub', dx: 4 }],
      ['belly', { mat: 'sub' }],
      ['spots', { mat: 'clover', pts: [[-5, 0, 1.2], [5, 2, 1.2], [-4, 9, 1.2]] }],
      ['hat', { kind: 'sprout', lift: 1 }],
    ],
  });
  D('lapinlily', {
    name: 'Lapinlily', stage: 2, size: 55, rise: 10, pal: BUN,
    hood: { type: 'up', ears: { kind: 'leaf', h: 12, w: 3.4, lean: 3, mat: 'lily', inner: 'flowerP', dx: 0 }, mat: 'lily' },
    hair: { style: 'braid', bangs: 'part', mat: 'hair', side: -1, tie: 'flowerP' },
    arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [
      ['tail', { kind: 'puff', r: 4, tip: 'sub', dx: 4 }],
      ['skirt', { mat: 'leaf', len: 3, flare: 3, scallop: 6, up: 9, trim: 'lily' }],
      ['belly', { kind: 'apron', mat: 'lily' }],
    ],
  });
  D('lapinelle', {
    name: 'Lapinelle', stage: 3, size: 61, rise: 10, pal: Object.assign({}, BUN, { main: '#7ed490' }),
    hood: { type: 'none', ears: { kind: 'floppy', h: 14, w: 3.6, lean: 3, droop: 2, dx: 0, over: true, mat: 'lily', inner: 'flowerP' } },
    hair: { style: 'long', bangs: 'part', drop: 3 },
    arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [
      ['tail', { kind: 'puff', r: 4.5, tip: 'sub', dx: 4 }],
      ['skirt', { mat: 'flowerP', len: 5, flare: 5, scallop: 7, up: 9, trim: 'lily' }],
      ['belly', { kind: 'bib', mat: 'leaf', straps: 'leaf' }],
      ['hat', { kind: 'flowers', n: 6, mat: 'flowerP', mat2: 'flowerY', core: 'sub' }],
      ['shapes', { stage: 'front', at: 'handR', g: 'wand', list: [['c', 2, -16, 2, 8, 0.8, 0.8, 'metal'], ['e', 3, -15, 3.5, 2.5, 'leaf'], ['d', 8, -13, 'lens'], ['d', 9, -10, 'lens']] }],
    ],
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
