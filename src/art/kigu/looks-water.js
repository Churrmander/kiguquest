/* src/art/kigu/looks-water.js — the fishing and Paddling Kigu: catfish, electric eel, koi (and Ryukoi, whose rare colourway is
 * the gold of the ancient Ryukoi at Hemline Lake), pufferfish, seahorse, duck, jellyfish, crab. PLACEHOLDER looks (owner's
 * call, 2026-10-26: "can't we just do placeholder sprites for now?"): code-drawn so the game has battle sprites and icons;
 * they will be replaced with AutoSprite art and go through the art-critic gate then. */
(function (root) {
  'use strict';
  const K = root.NP.art.kigu;
  const D = K.define;
  const G = { hand: { mittMat: 'mitt' } };
  const FIN = (mat, h) => ['shapes', { stage: 'headgear', at: 'head', g: 'fin', list: [['p', [[-4, 1], [-1, -h], [2, -h + 2], [4, 1]], mat]] }];
  const FEELERS = (mat, len) => ['shapes', { stage: 'front', at: 'face', g: 'feelers', m: true, view: 'front', list: [['s', [[6, 5], [11, 6], [13, 6 + len]], 1, 0.6, mat]] }];

  // ---- catfish (fresh water)
  const CAT = { main: '#6a7a6a', sub: '#e4dcc8', hair: '#3a3a30', mitt: '#6a7a6a', foot: '#4a5444', eye: '#3a3a2a', acc: '#d8a040', dark: '#3e4a3c', inner: '#e88a98' };
  D('kiskat', { name: 'Kiskat', stage: 1, size: 60, rise: 6, pal: CAT, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, mouth: 'o', arms: G.hand, footMat: 'foot', bodyW: 1.1,
    parts: [['belly', { mat: 'sub' }], FEELERS('acc', 4), ['tail', { kind: 'dragon', len: 14, r: 3, angle: 40, spike: 'main' }]] });
  D('slickish', { name: 'Slickish', stage: 2, size: 78, rise: 6, pal: CAT, hood: { type: 'up', ears: null }, hair: { style: 'long', bangs: 'part' }, mouth: 'o', arms: G.hand, footMat: 'foot', bodyW: 1.2,
    parts: [['belly', { mat: 'sub' }], FEELERS('acc', 9), ['skirt', { mat: 'dark', len: 5, flare: 6, up: 9, trim: 'acc' }], ['tail', { kind: 'dragon', len: 18, r: 3.6, angle: 42, spike: 'main' }]] });

  // ---- electric eel (fresh water)
  const EEL = { main: '#2e5a4a', sub: '#c8e0a8', hair: '#1e3a30', mitt: '#2e5a4a', foot: '#1e3a30', eye: '#f4e04a', acc: '#f4d83a', dark: '#1a2e26', stripe: '#f4d83a' };
  D('zeel', { name: 'Zeel', stage: 1, size: 66, rise: 8, pal: EEL, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'spiky' }, mouth: 'cat', arms: G.hand, footMat: 'foot',
    parts: [['stripes', { mat: 'stripe', y0: 6, step: 5, th: 1 }], FIN('acc', 6), ['tail', { kind: 'bolt', mat: 'main', sc: 0.75 }]] });

  // ---- koi (fresh water). Ryukoi's rare colourway is the gold of the ancient one in Hemline Lake.
  const KOI = { main: '#f8f4ec', sub: '#f07040', hair: '#c84a2a', mitt: '#f8f4ec', foot: '#e8603a', eye: '#3a2a2a', acc: '#f07040', dark: '#c84a2a', spot: '#f07040' };
  D('gilfin', { name: 'Gilfin', stage: 1, size: 58, rise: 6, pal: KOI, alt: { main: '#f4f0e0', sub: '#3a3a44', acc: '#3a3a44', spot: '#3a3a44', foot: '#3a3a44', dark: '#2a2a30' },
    hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, mouth: 'o', arms: G.hand, footMat: 'foot',
    parts: [['spots', { mat: 'spot', pts: [[-4, 3, 2], [3, 7, 2.4], [-2, 10, 1.6]] }], FIN('acc', 6), ['tail', { kind: 'puff', r: 4, dx: 4, mat: 'acc' }]] });
  const RYU = { main: '#f8f4ec', sub: '#f07040', hair: '#c84a2a', mitt: '#f8f4ec', foot: '#e8603a', eye: '#3a2a2a', acc: '#f07040', dark: '#c84a2a', cape: '#e85a3a', gold: '#f4c542' };
  D('ryukoi', { name: 'Ryukoi', stage: 2, size: 80, rise: 12, pal: RYU, alt: { main: '#f8e8a8', sub: '#f4c542', hair: '#c88a1a', mitt: '#f8e8a8', foot: '#d8a030', acc: '#f4c542', dark: '#a8701a', cape: '#e8b030', gold: '#fff4c0' },
    hood: { type: 'up', ears: { kind: 'horn', h: 6, w: 2, lean: 2 } }, hair: { style: 'long', bangs: 'part' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['cape', { mat: 'cape', trim: 'gold', flare: 8, drop: 5 }], FEELERS('gold', 8), ['tail', { kind: 'dragon', len: 20, r: 4, angle: 40, spike: 'gold' }], ['hat', { kind: 'crown', mat: 'gold', points: 3, gem: 'sub' }]] });

  // ---- pufferfish (salt water)
  const PUF = { main: '#e8d080', sub: '#fbf6e4', hair: '#8a6a2a', mitt: '#e8d080', foot: '#a8884a', eye: '#3a3020', acc: '#8ac06a', dark: '#a8884a', spot: '#a8884a' };
  D('fugubun', { name: 'Fugubun', stage: 1, size: 56, rise: 4, pal: PUF, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, mouth: 'o', arms: G.hand, footMat: 'foot', bodyW: 1.3,
    parts: [['belly', { mat: 'sub' }], ['spots', { mat: 'spot', pts: [[-5, 1, 1], [0, 0, 1], [5, 1, 1]] }], ['hat', { kind: 'tuft', mat: 'acc' }]] });
  D('swellegant', { name: 'Swellegant', stage: 2, size: 74, rise: 6, pal: PUF, hood: { type: 'up', ears: null }, hair: { style: 'bob', bangs: 'part' }, mouth: 'o', arms: G.hand, footMat: 'foot', bodyW: 1.35,
    parts: [['cape', { mat: 'acc', trim: 'sub', flare: 9, drop: 4 }], ['belly', { mat: 'sub' }], ['spots', { mat: 'acc', pts: [[-6, 2, 1.4], [0, 1, 1.4], [6, 2, 1.4]] }], ['hat', { kind: 'tuft', mat: 'acc' }]] });

  // ---- seahorse (salt water)
  const SEA = { main: '#e89a6a', sub: '#f8dcc0', hair: '#6a8a3a', mitt: '#e89a6a', foot: '#b86a4a', eye: '#3a2a3a', acc: '#6aa84a', dark: '#a85a3a', lamp: '#f4f0a0', cape: '#4a7a8a', gold: '#f4f0e8' };
  D('kelpony', { name: 'Kelpony', stage: 1, size: 62, rise: 8, pal: SEA, hood: { type: 'up', ears: { kind: 'leaf', h: 6, w: 3, lean: 2 } }, hair: { style: 'short', bangs: 'part', mat: 'acc' }, eyes: { style: 'sleepy' }, mouth: 'o', arms: G.hand, footMat: 'foot',
    parts: [['belly', { mat: 'sub' }], ['tail', { kind: 'cat', len: 16, r: 2, angle: 30, curl: 1.2 }]] });
  D('kelpuda', { name: 'Kelpuda', stage: 2, size: 78, rise: 12, pal: SEA, hood: { type: 'none' }, hair: { style: 'long', bangs: 'part', mat: 'acc' }, eyes: { style: 'sleepy' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['skirt', { mat: 'cape', len: 6, flare: 7, up: 9, trim: 'sub' }], ['hat', { kind: 'beret', mat: 'gold' }], ['hat', { kind: 'antennae', mat: 'dark', tip: 'lamp' }]] });

  // ---- duck (Paddling)
  const DUK = { main: '#f4f0e4', sub: '#f4c83a', hair: '#7a5a3a', mitt: '#f4f0e4', foot: '#f0a030', eye: '#2a2a2a', acc: '#f4c83a', cape: '#f4c83a', dark: '#c89a2a', wing: '#e8e4d8' };
  D('waddlecoat', { name: 'Waddlecoat', stage: 1, size: 64, rise: 6, pal: DUK, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, mouth: 'o', arms: G.hand, footMat: 'foot',
    parts: [['cape', { mat: 'cape', trim: 'dark', flare: 6, drop: 3 }], ['wings', { kind: 'feather', mat: 'wing', mat2: 'acc', dy: 4 }], ['hat', { kind: 'rainhat', mat: 'acc' }]] });

  // ---- jellyfish (Paddling)
  const JEL = { main: '#c8b0f0', sub: '#f4ecff', hair: '#7a6aa8', mitt: '#c8b0f0', foot: '#9a88c8', eye: '#5a4a8a', acc: '#f4a8d8', lamp: '#f8f0ff', dark: '#8a7ab8', cape: '#a890e0' };
  D('jellybob', { name: 'Jellybob', stage: 1, size: 60, rise: 8, pal: JEL, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, eyes: { style: 'sleepy' }, mouth: 'o', arms: G.hand, footMat: 'foot',
    parts: [['skirt', { mat: 'main', len: 4, flare: 5, up: 10, scallop: 6, trim: 'acc' }], ['spots', { mat: 'lamp', pts: [[-3, 2, 1], [3, 2, 1]] }]] });
  D('pompola', { name: 'Pompola', stage: 2, size: 78, rise: 12, pal: JEL, hood: { type: 'up', ears: null }, hair: { style: 'long', bangs: 'part' }, eyes: { style: 'sleepy' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['skirt', { mat: 'cape', len: 7, flare: 8, up: 9, scallop: 8, trim: 'acc' }], ['hat', { kind: 'halo', mat: 'lamp' }], ['spots', { mat: 'acc', pts: [[-5, 4, 1.2], [0, 6, 1.2], [5, 4, 1.2]] }]] });

  // ---- crab (Paddling, salt water)
  const CRB = { main: '#e05a48', sub: '#f8dcc8', hair: '#8a2a20', mitt: '#e8705a', foot: '#a83a2a', eye: '#2a1a1a', acc: '#f4f0e8', dark: '#a83a2a', cape: '#2a3a6a', gold: '#f4c542' };
  D('clawdet', { name: 'Clawdet', stage: 1, size: 58, rise: 4, pal: CRB, hood: { type: 'up', ears: { kind: 'round', h: 2, w: 2.6, lean: 2, dy: -2 } }, hair: { style: 'short', bangs: 'spiky' }, mouth: 'cat', arms: G.hand, footMat: 'foot', bodyW: 1.25,
    parts: [['belly', { mat: 'sub' }], ['spots', { mat: 'dark', pts: [[-5, 1, 0.8], [5, 1, 0.8]] }], ['hat', { kind: 'cap', mat: 'acc' }]] });   // a cadet's sailor cap, a size too big
  D('crabmiral', { name: 'Crabmiral', stage: 2, size: 78, rise: 6, pal: CRB, hood: { type: 'up', ears: { kind: 'round', h: 2, w: 3, lean: 2, dy: -2 } }, hair: { style: 'bob', bangs: 'spiky' }, mouth: 'flat', arms: G.hand, footMat: 'foot', bodyW: 1.25,
    parts: [['belly', { kind: 'jacket', mat: 'cape', trim: 'gold', len: 6 }], ['hat', { kind: 'cap', mat: 'cape' }], ['collar', { mat: 'acc' }]] });

  // ---- crocodile (Paddling): army green, khaki helmets and coats, brass bars and medals
  const CRC = { main: '#5a8a4a', sub: '#e4dca0', hair: '#2e4a2a', mitt: '#5a8a4a', foot: '#3e6034', eye: '#e8c040', acc: '#7a7a4a', dark: '#3e6034', cape: '#6a6a3a', gold: '#f4c542', spike: '#3e6034' };
  D('alligrunt', { name: 'Alligrunt', stage: 1, size: 60, rise: 5, pal: CRC, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'spiky' }, mouth: 'cat', arms: G.hand, footMat: 'foot', bodyW: 1.15,
    parts: [['belly', { mat: 'sub' }], ['hat', { kind: 'hard', mat: 'acc' }], ['tail', { kind: 'dragon', len: 14, r: 3, angle: 35, spike: 'spike' }]] });   // helmet a size too big
  D('snaptain', { name: 'Snaptain', stage: 2, size: 74, rise: 6, pal: CRC, hood: { type: 'up', ears: null }, hair: { style: 'bob', bangs: 'spiky' }, mouth: 'flat', arms: G.hand, footMat: 'foot', bodyW: 1.2,
    parts: [['belly', { kind: 'jacket', mat: 'cape', trim: 'gold', len: 5 }], ['hat', { kind: 'hard', mat: 'acc' }], ['tail', { kind: 'dragon', len: 17, r: 3.6, angle: 38, spike: 'spike' }]] });
  D('tyranodile', { name: 'Tyranodile', stage: 3, size: 86, rise: 6, pal: CRC, hood: { type: 'up', ears: null }, hair: { style: 'long', bangs: 'spiky' }, mouth: 'flat', arms: G.hand, footMat: 'foot', bodyW: 1.3,
    parts: [['belly', { kind: 'jacket', mat: 'cape', trim: 'gold', len: 8 }], ['spots', { mat: 'gold', pts: [[-5, 3, 0.9], [-3, 3, 0.9], [-5, 6, 0.9]] }], ['hat', { kind: 'cap', mat: 'cape' }], ['tail', { kind: 'dragon', len: 20, r: 4.4, angle: 40, spike: 'spike' }]] });
})(typeof globalThis !== 'undefined' ? globalThis : window);
