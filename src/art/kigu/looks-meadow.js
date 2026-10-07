/* src/art/kigu/looks-meadow.js — Meadow Lane / Thimble Village species (cat, hamster, sparrow lines). */
(function (root) {
  'use strict';
  const K = root.NP.art.kigu;
  const D = K.define;

  const CAT = { main: '#eceef4', sub: '#ffffff', hair: '#9aa0b4', mitt: '#c7cbd8', foot: '#c7cbd8', eye: '#4aa0d8', inner: '#ffb7c5', acc: '#ffc940', gold: '#f4c542', patch: '#9aa0b4' };
  D('mittsy', {
    name: 'Mittsy', stage: 1, size: 45, rise: 6, pal: CAT,
    hood: { type: 'up', ears: { kind: 'tri', h: 7, w: 4.5, lean: 2 } },
    hair: { style: 'short', bangs: 'spiky' }, eyes: { style: 'sleepy' }, mouth: 'cat', face: ['whiskers'],
    arms: { mittMat: 'mitt', mittR: 3.6 }, footMat: 'foot',
    parts: [
      ['tail', { kind: 'cat', len: 18, r: 4, tip: 'patch', angle: 50, dx: 3 }],
      ['belly', { mat: 'sub' }],
      ['bell', { at: 'head', dy: 7, dx: 6, r: 2 }],
    ],
  });
  D('meowvelle', {
    name: 'Meowvelle', stage: 2, size: 56, rise: 8, pal: Object.assign({}, CAT, { main: '#33334a', sub: '#ffffff', hair: '#55556e', mitt: '#ffffff', foot: '#ffffff', acc: '#d8405a', eye: '#f0c030' }),
    hood: { type: 'up', ears: { kind: 'tri', h: 8, w: 4.5, lean: 2, over: true } },
    hair: { style: 'short', bangs: 'part' }, mouth: 'cat', face: ['whiskers'],
    arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [
      ['tail', { kind: 'cat', len: 22, r: 4, tip: 'acc', angle: 50, dx: 3, tipAt: 0.85 }],
      ['belly', { mat: 'sub', kind: 'v' }],
      ['bowtie', { mat: 'acc' }],
      ['hat', { kind: 'tophat', mat: 'main', band: 'acc', dx: 1, tilt: 1 }],
      ['shapes', { stage: 'front', at: 'handR', g: 'cane', list: [['c', 2, -2, 2, 12, 0.9, 0.9, 'metal'], ['c', 2, -2, 5, -4, 0.9, 0.9, 'metal'], ['e', 2, 13, 1.4, 1, 'gold']] }],
    ],
  });
  const HAM = { main: '#ecc088', sub: '#fff4de', hair: '#c4622e', mitt: '#fff4de', foot: '#fff4de', eye: '#5a3020', inner: '#ffb7c5', acc: '#ffffff', seed: '#7a5a2a', apron: '#fff8f0', red: '#e0505a', bun: '#d99a52' };
  D('nibbi', {
    name: 'Nibbi', stage: 1, size: 44, rise: 3, pal: HAM,
    hood: { type: 'up', ears: { kind: 'round', h: 2, w: 3, lean: 1, dy: 1 } },
    hair: { style: 'twin', bangs: 'spiky', len: 8 }, mouth: 'nom', headW: 1.05,
    arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [
      ['tail', { kind: 'puff', r: 2.5, dx: 4 }],
      ['belly', { mat: 'sub' }],
      ['shapes', { stage: 'headgear', at: 'face', m: true, g: 'cheeks', list: [['e', 9, 6, 3.5, 4, 'sub'], ['d', 9, 6, 'seed', -1]] }],
    ],
  });
  D('nibblenna', {
    name: 'Nibblenna', stage: 2, size: 53, rise: 10, pal: HAM,
    hood: { type: 'up', ears: { kind: 'round', h: 2, w: 3.2, lean: 1, dy: 1, over: true } },
    hair: { style: 'twin', bangs: 'part', len: 10 }, mouth: 'nom', headW: 1.05,
    arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [
      ['tail', { kind: 'puff', r: 3, dx: 4 }],
      ['belly', { kind: 'apron', mat: 'apron', pocket: 'red' }],
      ['hat', { kind: 'chef', mat: 'apron' }],
      ['shapes', { stage: 'front', at: 'handR', g: 'basket', list: [['e', 0, 0, 6, 3.5, 'bun'], ['e', -2, -3, 2.6, 2.3, 'bun', 1], ['e', 2, -3, 2.6, 2.3, 'bun', 1], ['e', 0, -4, 2.4, 2, 'sub']] }],
    ],
  });

  const SPR = { main: '#e6b84a', sub: '#fff0c0', hair: '#c88a3a', mitt: '#c88a3a', foot: '#e89a3a', eye: '#3a2a20', inner: '#ffb7c5', acc: '#8a5a3a', acc2: '#4ea0e0', note: '#3a4a80', page: '#fff8e8' };
  D('peepi', {
    name: 'Peepi', stage: 1, size: 44, rise: 4, pal: SPR,
    hood: { type: 'up', ears: null },
    hair: { style: 'short', bangs: 'spiky', mat: 'hair' }, mouth: 'flat',
    arms: { type: 'wing', mat: 'mitt', tip: 'acc' }, footMat: 'foot',
    parts: [
      ['tail', { kind: 'puff', r: 2.5, dx: 4, tip: 'acc' }],
      ['belly', { mat: 'sub' }],
      ['hat', { kind: 'tuft', n: 3, mat: 'hair' }],
    ],
  });
  D('larkette', {
    name: 'Larkette', stage: 2, size: 52, rise: 6, pal: Object.assign({}, SPR, { main: '#d8a240', hair: '#8a5a30' }),
    hood: { type: 'band', mat: 'main' },
    hair: { style: 'bob', bangs: 'part' },
    arms: { type: 'wing', mat: 'hair', tip: 'sub' }, footMat: 'foot',
    parts: [
      ['wings', { kind: 'feather', mat: 'hair', mat2: 'main', sz: 0.7, over: false }],
      ['skirt', { mat: 'main', len: 3, flare: 4, scallop: 6, up: 8, trim: 'sub' }],
      ['belly', { mat: 'sub' }],
      ['hat', { kind: 'tuft', n: 3, mat: 'hair', lean: 1.2 }],
      ['hat', { kind: 'headband', mat: 'acc2' }],
      ['shapes', { stage: 'front', at: 'handL', g: 'songbook', list: [['r', -3, -4, 7, 6, 'note'], ['r', -2, -3, 5, 4, 'page'], ['d', 0, -2, 'note']] }],
    ],
  });
  D('larkessa', {
    name: 'Larkessa', stage: 3, size: 60, rise: 8, pal: Object.assign({}, SPR, { main: '#c88a4a', hair: '#7a4a2a', sub: '#fff0c8', acc2: '#5ab0f0', gold: '#f4c542' }),
    hood: { type: 'none' },
    hair: { style: 'long', bangs: 'part', drop: 3 },
    arms: { type: 'wing', mat: 'hair', tip: 'sub' }, footMat: 'foot',
    parts: [
      ['cape', { mat: 'acc2', trim: 'sub', flare: 9, drop: 7 }],
      ['wings', { kind: 'feather', mat: 'hair', mat2: 'main', sz: 0.7 }],
      ['skirt', { mat: 'main', len: 5, flare: 6, scallop: 7, up: 10, trim: 'sub' }],
      ['belly', { mat: 'sub', kind: 'v' }],
      ['hat', { kind: 'crown', mat: 'gold', points: 5 }],
      ['hat', { kind: 'stars', pts: [[-16, 6], [16, 4], [-14, -4]], mat: 'gold' }],
    ],
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
