/* src/art/kigu/looks-gingham.js — Gingham Woods / Seamstead species (silkworm, bee, spider, daisy, frog, mole lines). */
(function (root) {
  'use strict';
  const K = root.NP.art.kigu;
  const D = K.define;

  const SILK = { main: '#f4f0fa', sub: '#d8ccf0', hair: '#c9b4ea', mitt: '#f4f0fa', foot: '#d8ccf0', eye: '#7a5ab8', inner: '#ffcfe0', acc: '#a8e0b8', acc2: '#ffffff', sack: '#bfe8c4', wing: '#b48ae0', spark: '#fff6b0' };
  D('silkie', {
    name: 'Silkie', stage: 1, size: 44, rise: 4, pal: SILK,
    hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, eyes: { style: 'sleepy' },
    arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [
      ['stripes', { mat: 'sub', y0: 10, step: 4, th: 1 }],
      ['hat', { kind: 'antennae', mat: 'main', tip: 'main', sp: 3, h: 5, ball: 1.4 }],
    ],
  });
  D('cocoona', {
    name: 'Cocoona', stage: 2, size: 50, rise: 2, pal: SILK, cocoon: true, bodyMat: 'sack',
    hood: { type: 'none' }, hair: { style: 'bob', bangs: 'part' }, eyes: { style: 'sleepy' },
    arms: { mittMat: 'main', pose: 'front', mittR: 2.4 },
    parts: [['stripes', { mat: 'sack', y0: 12, step: 5, th: 1 }], ['hat', { kind: 'antennae', mat: 'sub', tip: 'sub', sp: 3, h: 4 }]],
  });
  D('mothelia', {
    name: 'Mothelia', stage: 3, size: 59, rise: 10, pal: SILK,
    hood: { type: 'none' }, hair: { style: 'long', bangs: 'part', drop: 2 },
    arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [
      ['wings', { kind: 'moth', mat: 'wing', mat2: 'main', sz: 0.5 }],
      ['skirt', { mat: 'main', len: 5, flare: 5, scallop: 7, up: 9, trim: 'sub' }],
      ['belly', { kind: 'v', mat: 'wing' }],
      ['hat', { kind: 'antennae', mat: 'sub', tip: 'main', sp: 6, h: 8, ball: 1.6 }],
      ['hat', { kind: 'stars', pts: [[-18, 10], [18, 6], [-16, -2], [17, -6]], mat: 'spark' }],
    ],
  });

  const BEE = { main: '#ffd23a', sub: '#fff4c0', hair: '#f6e070', mitt: '#3a2a3e', foot: '#3a2a3e', eye: '#3a2a3e', inner: '#ffd23a', acc: '#3a2a3e', wing: '#dff4ff', honey: '#e89a1a', petal: '#ff8fb0', pink: '#ff9ec0' };
  D('buzzlet', {
    name: 'Buzzlet', stage: 1, size: 45, rise: 4, pal: BEE,
    hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'spiky' },
    arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [
      ['wings', { kind: 'insect', mat: 'wing', mat2: 'sub', sz: 0.8 }],
      ['stripes', { mat: 'acc', y0: 9, step: 5, th: 2 }],
      ['hat', { kind: 'antennae', mat: 'acc', tip: 'acc', sp: 4, h: 7, ball: 1.5 }],
      ['hat', { kind: 'buns', mat: 'hair', r: 2.6 }],
      ['shapes', { stage: 'front', at: 'handR', g: 'pot', list: [['e', 1, 1, 3.5, 3, 'honey'], ['r', -2, -3, 6, 2, 'honey', 1]] }],
    ],
  });
  D('honeybelle', {
    name: 'Honeybelle', stage: 2, size: 55, rise: 7, pal: BEE,
    hood: { type: 'none' }, hair: { style: 'twin', bangs: 'part', len: 13 },
    arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [
      ['wings', { kind: 'insect', mat: 'wing', mat2: 'sub', sz: 1.1 }],
      ['skirt', { mat: 'main', len: 4, flare: 5, up: 9, scallop: 6, trim: 'honey', pat: 'stripe', mat2: 'acc' }],
      ['belly', { kind: 'bib', mat: 'honey' }],
      ['hat', { kind: 'flowers', n: 5, mat: 'petal', mat2: 'sub', core: 'main' }],
      ['hat', { kind: 'antennae', mat: 'acc', tip: 'acc', sp: 5, h: 9 }],
      ['shapes', { stage: 'front', at: 'handR', g: 'dipper', list: [['c', 2, -14, 2, 8, 0.8, 0.8, 'honey'], ['e', 2, -16, 2.6, 3.2, 'honey'], ['l', 0, -17, 4, -17, 'acc'], ['l', 0, -15, 4, -15, 'acc']] }],
    ],
  });

  const SPI = { main: '#5a3f86', sub: '#8a6cc0', hair: '#c9b4ea', mitt: '#7a5ab0', foot: '#3a2a5a', eye: '#3a2a5a', inner: '#8a6cc0', spot: '#ff4a5a', yarn: '#ff8fb0', silver: '#e8e8f4', black: '#241830', lace: '#d8d0ec', needle: '#cfd6e6' };
  D('webbi', {
    name: 'Webbi', stage: 1, size: 44, rise: 2, pal: SPI,
    hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, eyes: { style: 'dot' }, mouth: 'flat', face: ['eyespots'],
    arms: { mittMat: 'mitt', extraArms: true }, footMat: 'foot',
    parts: [
      ['belly', { mat: 'sub', w: 0.8 }],
      ['shapes', { stage: 'front', at: 'feet', g: 'yarn', list: [['e', 13, -3, 3.2, 3.2, 'yarn'], ['l', 11, -4, 15, -2, 'yarn', -1], ['l', 11, -2, 14, -5, 'yarn', -1]] }],
    ],
  });
  D('webelle', {
    name: 'Webelle', stage: 2, size: 54, rise: 2, pal: Object.assign({}, SPI, { hair: '#2a2236' }),
    hood: { type: 'none' }, hair: { style: 'long', bangs: 'part', drop: 4 }, eyes: { style: 'sleepy' }, mouth: 'flat',
    arms: { mittMat: 'mitt', extraArms: true }, footMat: 'foot',
    parts: [
      ['belly', { kind: 'poncho', mat: 'lace', len: 2, trim: 'silver' }],
      ['skirt', { mat: 'main', len: 4, flare: 4, up: 8, scallop: 6, trim: 'silver' }],
      ['shapes', { stage: 'front', at: 'handR', g: 'needles', list: [['c', 1, -14, 3, 4, 0.7, 0.7, 'needle'], ['c', 4, -14, 1, 4, 0.7, 0.7, 'needle'], ['e', 6, 2, 3, 3, 'yarn']] }],
      ['shapes', { stage: 'headgear', at: 'head', g: 'silverhair', list: [['l', -9, 6, -12, 14, 'silver'], ['l', 10, 7, 13, 15, 'silver'], ['l', -6, 4, -8, 9, 'silver']] }],
    ],
  });

  const DAI = { main: '#ffe24a', sub: '#ffffff', hair: '#f5d050', mitt: '#fff8c8', foot: '#6cbf4a', eye: '#3a6a3a', inner: '#ffffff', leaf: '#6cbf4a', petal: '#ffffff', core: '#ffc21a' };
  D('daisip', {
    name: 'Daisip', stage: 1, size: 44, rise: 0, pal: DAI,
    hood: { type: 'up', mat: 'sub', ears: null, pattern: K.petalRing(10, 2.6, 0.6, 'sub') }, hair: { style: 'short', bangs: 'part' },
    arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [['skirt', { mat: 'main', len: 1, flare: 1, up: 8 }], ['shapes', { stage: 'outfit', at: 'chest', g: 'leaf', m: true, list: [['e', 6, 4, 2.5, 1.5, 'leaf']] }]],
  });
  D('daisia', {
    name: 'Daisia', stage: 2, size: 55, rise: 4, pal: DAI,
    hood: { type: 'none' }, hair: { style: 'long', bangs: 'part', drop: 1 },
    arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [
      ['skirt', { mat: 'sub', len: 5, flare: 6, up: 9, scallop: 8, trim: 'main' }],
      ['belly', { kind: 'bib', mat: 'main', straps: 'main' }],
      ['halo', null],
    ].filter((p) => p[1]).concat([['hat', { kind: 'halo', mat: 'sub' }], ['hat', { kind: 'flowers', n: 5, mat: 'sub', mat2: 'main', core: 'core' }]]),
  });

  const FROG = { main: '#5cc070', sub: '#f0ffd8', hair: '#3a8a5a', mitt: '#8ae09a', foot: '#8ae09a', eye: '#2a5a3a', inner: '#ffcfa0', coat: '#58b868', yellow: '#ffd23a', pad: '#3fae5a', overall: '#4a78c8', hat: '#f2c24a', boot: '#8a5a30' };
  D('ribbi', {
    name: 'Ribbi', stage: 1, size: 44, rise: 4, pal: FROG,
    hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, mouth: 'o',
    arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [
      ['belly', { mat: 'sub', w: 0.9 }],
      ['shapes', { stage: 'headgear', at: 'head', m: true, g: 'frogeyes', list: [['e', 6, 2, 3.4, 3.4, 'sub'], ['e', 6, 3, 1.6, 1.8, 'eye'], ['d', 5, 2, 'shine']] }],
      ['shapes', { stage: 'front', at: 'handR', g: 'brolly', list: [['c', 1, -4, 1, 10, 0.7, 0.7, 'metal'], ['e', 1, -8, 8, 3, 'pad']] }],
    ],
  });
  D('ribbelle', {
    name: 'Ribbelle', stage: 2, size: 54, rise: 6, pal: FROG,
    hood: { type: 'none' }, hair: { style: 'twin', bangs: 'part', len: 10 }, mouth: 'o',
    arms: { mittMat: 'mitt' }, footMat: 'boot',
    parts: [
      ['skirt', { mat: 'pad', len: 4, flare: 5, up: 7, scallop: 6, trim: 'yellow' }],
      ['belly', { kind: 'bib', mat: 'overall', straps: 'overall' }],
      ['hat', { kind: 'rainhat', mat: 'hat', band: 'yellow' }],
      ['shapes', { stage: 'headgear', at: 'head', m: true, g: 'hateyes', list: [['e', 5, -3, 2.4, 2.4, 'sub'], ['d', 5, -3, 'line']] }],
    ],
  });

  const MOLE = { main: '#8a7468', sub: '#d8c4ae', hair: '#5a4a44', mitt: '#e8a8a0', foot: '#5a4a44', eye: '#2a2020', inner: '#e8a8a0', lens: '#9ad8f0', rim: '#c8a040', acc: '#f2c24a', metal: '#aab4c8', lamp: '#fff3a0', boot: '#6a7488' };
  D('molli', {
    name: 'Molli', stage: 1, size: 43, rise: 2, pal: MOLE,
    hood: { type: 'up', ears: { kind: 'round', h: 2, w: 2.6, lean: 1, dy: 2 } }, hair: { style: 'short', bangs: 'spiky' }, eyes: { style: 'slit' }, face: ['nose'],
    arms: { mittMat: 'mitt', mittR: 4.2 }, footMat: 'foot',
    parts: [['belly', { mat: 'sub' }], ['hat', { kind: 'goggles', strap: 'hair', rim: 'rim', lens: 'lens', lift: -1 }]],
  });
  D('molluna', {
    name: 'Molluna', stage: 2, size: 54, rise: 5, pal: MOLE,
    hood: { type: 'none' }, hair: { style: 'bob', bangs: 'part' }, eyes: { style: 'slit' }, face: ['nose'],
    arms: { mittMat: 'mitt', mittR: 4.2 }, footMat: 'boot',
    parts: [
      ['belly', { kind: 'bib', mat: 'boot', straps: 'boot' }],
      ['hat', { kind: 'hard', mat: 'acc', mat2: 'sub', lamp: 'lamp' }],
      ['shapes', { stage: 'front', at: 'handL', g: 'drill', list: [['c', -1, -14, -1, 6, 1.2, 1.2, 'metal'], ['p', [[-4, -14], [2, -14], [-1, -22]], 'metal']] }],
    ],
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
