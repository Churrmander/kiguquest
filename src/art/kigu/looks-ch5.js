/* src/art/kigu/looks-ch5.js — Chapter 5 and 6 species: glowworm, coil spring, bat, stalactite (Route 5/6, the Spark Cellar),
 * vending machine, capsule toy, neon sign, taxi, bento (Shibuyarn), paper crane, propeller, cloud (Kite Hill). Code-drawn looks
 * (no AutoSprite art yet): they give the battle sprites, party icons and the size and anchors any later art is scaled to. */
(function (root) {
  'use strict';
  const K = root.NP.art.kigu;
  const D = K.define;
  const G = { hand: { mittMat: 'mitt' } };

  // ---- glowworm
  const GLW = { main: '#8ab86a', sub: '#e8f8c8', hair: '#4a5a3a', mitt: '#8ab86a', foot: '#5a7a4a', eye: '#3a5a2a', acc: '#e8ff9a', lamp: '#f4ffb0', dark: '#4a6a3a', cape: '#3a4a6a', gem: '#c8f0ff' };
  D('glowgrub', { name: 'Glowgrub', stage: 1, size: 60, rise: 8, pal: GLW, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, mouth: 'o', arms: G.hand, footMat: 'foot',
    parts: [['belly', { mat: 'sub' }], ['hat', { kind: 'antennae', mat: 'dark', tip: 'acc' }], ['tail', { kind: 'puff', r: 3.6, dx: 4, mat: 'acc' }]] });
  D('glowmira', { name: 'Glowmira', stage: 2, size: 78, rise: 12, pal: GLW, hood: { type: 'none' }, hair: { style: 'long', bangs: 'part', mat: 'sub' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['cape', { mat: 'cape', trim: 'acc', flare: 8, drop: 5 }], ['hat', { kind: 'stars', mat: 'acc', pts: [[-14, 4], [13, 8], [-11, 16], [15, 18]] }], ['skirt', { mat: 'cape', len: 5, flare: 6, up: 9, trim: 'acc' }]] });

  // ---- coil spring
  const COI = { main: '#d88a4a', sub: '#f4d8b0', hair: '#b8642a', mitt: '#b9c6da', foot: '#8a5a3a', eye: '#6a3a1a', acc: '#f4c542', cape: '#c8743a', dark: '#7a4020', stripe: '#9a5a2a' };
  D('boingo', { name: 'Boingo', stage: 1, size: 60, rise: 6, pal: COI, hood: { type: 'up', ears: null }, hair: { style: 'twin', bangs: 'spiky', len: 7 }, mouth: 'o', arms: G.hand, footMat: 'foot',
    parts: [['stripes', { mat: 'stripe', y0: 4, step: 3, th: 1 }], ['hat', { kind: 'bun', mat: 'acc' }]] });
  D('teslaria', { name: 'Teslaria', stage: 2, size: 76, rise: 8, pal: COI, hood: { type: 'none' }, hair: { style: 'long', bangs: 'part' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['cape', { mat: 'cape', trim: 'acc', flare: 7, drop: 4 }], ['stripes', { mat: 'stripe', y0: 10, step: 3, th: 1 }], ['bowtie', { mat: 'acc' }]] });

  // ---- bat
  const BAT = { main: '#5a4a6a', sub: '#c8b8d8', hair: '#2a2234', mitt: '#5a4a6a', foot: '#3a3048', eye: '#c8a0f0', inner: '#d898b8', wing: '#4a3a5a', cape: '#2e2a4a', acc: '#f4e8a0', dark: '#2a2234' };
  D('batnap', { name: 'Batnap', stage: 1, size: 60, rise: 8, pal: BAT, hood: { type: 'up', ears: { kind: 'tri', h: 7, w: 4.5, lean: 2 } }, hair: { style: 'short', bangs: 'spiky' }, eyes: { style: 'sleepy' }, mouth: 'cat', arms: G.hand, footMat: 'foot',
    parts: [['wings', { kind: 'bat', mat: 'wing', mat2: 'inner', dy: 4 }], ['belly', { mat: 'sub' }]] });
  D('noctura', { name: 'Noctura', stage: 2, size: 78, rise: 12, pal: BAT, hood: { type: 'none' }, hair: { style: 'long', bangs: 'part' }, eyes: { style: 'sleepy' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['wings', { kind: 'bat', mat: 'cape', mat2: 'wing', dy: 3 }], ['hat', { kind: 'nightcap', mat: 'cape' }], ['hat', { kind: 'stars', mat: 'acc', pts: [[-14, 4], [13, 8], [-11, 16], [15, 18]] }]] });

  // ---- stalactite
  const STL = { main: '#9a98a8', sub: '#d8d6e4', hair: '#4a4858', mitt: '#8a8898', foot: '#5a5868', eye: '#5a5a7a', acc: '#c8e8ff', gem: '#e0f4ff', cape: '#e8e4f0', dark: '#5a5868', stripe: '#7a7888' };
  D('dripstone', { name: 'Dripstone', stage: 1, size: 60, rise: 6, pal: STL, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, eyes: { style: 'sleepy' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['stripes', { mat: 'stripe', y0: 6, step: 4, th: 1 }], ['shapes', { stage: 'headgear', at: 'head', m: true, g: 'drips', list: [['p', [[4, 2], [6, 10], [8, 2]], 'main'], ['p', [[9, 3], [10, 7], [11, 3]], 'main']] }], ['tail', { kind: 'cat', len: 16, r: 1.4, angle: 30, dx: 3 }]] });
  D('stalaghost', { name: 'Stalaghost', stage: 2, size: 78, rise: 10, pal: STL, hood: { type: 'none' }, hair: { style: 'long', bangs: 'part' }, eyes: { style: 'sleepy' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['cape', { mat: 'cape', trim: 'acc', flare: 7, drop: 5 }], ['hat', { kind: 'crown', mat: 'gem', points: 5, gem: 'acc' }]] });

  // ---- vending machine
  const VEN = { main: '#e8584a', sub: '#f4f4f8', hair: '#5a3a2a', mitt: '#e8584a', foot: '#8a2a2a', eye: '#4a2a2a', acc: '#8ad8ff', lens: '#bfe6ff', cape: '#4a8ad8', dark: '#9a2a2a', gold: '#f4c542' };
  D('kachunk', { name: 'Kachunk', stage: 1, size: 62, rise: 4, pal: VEN, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'short' }, mouth: 'o', arms: G.hand, footMat: 'foot', bodyW: 1.15,
    parts: [['belly', { kind: 'bib', mat: 'sub', pocket: true }], ['spots', { mat: 'acc', pts: [[-3, 3, 1.2], [0, 3, 1.2], [3, 3, 1.2]] }]] });
  D('vendox', { name: 'Vendox', stage: 2, size: 78, rise: 6, pal: VEN, hood: { type: 'none' }, hair: { style: 'bob', bangs: 'short' }, mouth: 'flat', arms: G.hand, footMat: 'foot', bodyW: 1.15,
    parts: [['cape', { mat: 'cape', trim: 'acc', flare: 6, drop: 4 }], ['belly', { kind: 'jacket', mat: 'main', trim: 'sub', len: 6 }], ['hat', { kind: 'crown', mat: 'gold', points: 3, gem: 'acc' }]] });

  // ---- capsule toy
  const CAP = { main: '#f4a8c8', sub: '#f8f4ff', hair: '#7a5a8a', mitt: '#f4a8c8', foot: '#c878a8', eye: '#7a4ea8', acc: '#8ad8e8', cape: '#f8f4ff', dark: '#b06890', gem: '#f4d84a' };
  D('gachapop', { name: 'Gachapop', stage: 1, size: 58, rise: 4, pal: CAP, hood: { type: 'up', ears: null, mat: 'main' }, hair: { style: 'short', bangs: 'part' }, mouth: 'o', arms: G.hand, footMat: 'foot', bodyW: 1.2,
    parts: [['belly', { mat: 'sub' }], ['hat', { kind: 'bow', mat: 'acc' }]] });
  D('capsuma', { name: 'Capsuma', stage: 2, size: 76, rise: 8, pal: CAP, hood: { type: 'up', ears: null }, hair: { style: 'twin', bangs: 'part', len: 9 }, mouth: 'o', arms: G.hand, footMat: 'foot',
    parts: [['skirt', { mat: 'sub', len: 5, flare: 7, up: 9, scallop: 8, trim: 'main' }], ['spots', { mat: 'gem', pts: [[-4, 2, 1], [0, 2, 1], [4, 2, 1]] }], ['hat', { kind: 'bow', mat: 'acc' }]] });

  // ---- neon sign
  const NEO = { main: '#3a2e5a', sub: '#ff6ad8', hair: '#2a2240', mitt: '#3a2e5a', foot: '#2a2240', eye: '#ff8ae0', acc: '#6af0ff', cape: '#2a2240', dark: '#1a1430', stripe: '#ff6ad8' };
  D('blinkeon', { name: 'Blinkeon', stage: 1, size: 60, rise: 8, pal: NEO, hood: { type: 'up', ears: { kind: 'tri', h: 6, w: 3, lean: 0 } }, hair: { style: 'short', bangs: 'spiky' }, mouth: 'cat', arms: G.hand, footMat: 'foot',
    parts: [['stripes', { mat: 'stripe', y0: 6, step: 5, th: 1 }], ['collar', { mat: 'acc' }]] });
  D('neonova', { name: 'Neonova', stage: 2, size: 78, rise: 10, pal: NEO, hood: { type: 'none' }, hair: { style: 'long', bangs: 'part' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['skirt', { mat: 'main', len: 6, flare: 7, up: 9, trim: 'acc' }], ['stripes', { mat: 'stripe', y0: 8, step: 5, th: 1 }], ['hat', { kind: 'halo', mat: 'acc' }]] });

  // ---- taxi
  const CAB = { main: '#f4c83a', sub: '#2a2a30', hair: '#5a3a2a', mitt: '#f4c83a', foot: '#2a2a30', eye: '#4a3a2a', acc: '#ffffff', lamp: '#fff3a0', dark: '#a8801a' };
  D('cabriolet', { name: 'Cabriolet', stage: 1, size: 70, rise: 8, pal: CAB, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'spiky' }, mouth: 'o', arms: G.hand, footMat: 'foot',
    parts: [['stripes', { mat: 'sub', y0: 8, step: 6, th: 1 }], ['hat', { kind: 'cap', mat: 'sub' }], ['skirt', { mat: 'sub', len: 3, flare: 3, up: 10 }]] });

  // ---- bento
  const BEN = { main: '#c8384a', sub: '#fbfaf2', hair: '#3a2a2a', mitt: '#c8384a', foot: '#6a2a2a', eye: '#3a2a2a', acc: '#2e4a3a', gold: '#f4c542', cape: '#1e1a1a', dark: '#7a1a2a' };
  D('obento', { name: 'Obento', stage: 1, size: 60, rise: 6, pal: BEN, hood: { type: 'up', ears: { kind: 'tri', h: 4, w: 4, lean: 0 }, mat: 'main' }, hair: { style: 'short', bangs: 'part' }, mouth: 'nom', arms: G.hand, footMat: 'foot', bodyW: 1.1,
    parts: [['belly', { kind: 'bib', mat: 'sub' }], ['spots', { mat: 'acc', pts: [[-3, 4, 1.5], [3, 4, 1.5]] }]] });
  D('jubako', { name: 'Jubako', stage: 2, size: 78, rise: 8, pal: BEN, hood: { type: 'none' }, hair: { style: 'bun', bangs: 'part' }, mouth: 'nom', arms: G.hand, footMat: 'foot',
    parts: [['cape', { mat: 'cape', trim: 'main', flare: 6, drop: 4 }], ['belly', { kind: 'jacket', mat: 'main', trim: 'gold', len: 6 }], ['hat', { kind: 'bun', mat: 'gold' }]] });

  // ---- paper crane
  const KAM = { main: '#f8f6f0', sub: '#f4a8b8', hair: '#4a3a3a', mitt: '#f8f6f0', foot: '#c8c4bc', eye: '#3a3a4a', acc: '#e8384a', wing: '#f8f6f0', gold: '#c8d4e4', dark: '#a8a49c' };
  D('foldling', { name: 'Foldling', stage: 1, size: 60, rise: 8, pal: KAM, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, mouth: 'o', arms: G.hand, footMat: 'foot',
    parts: [['wings', { kind: 'feather', mat: 'wing', mat2: 'sub', dy: 4 }], ['hat', { kind: 'tuft', mat: 'acc' }]] });
  D('tsurugami', { name: 'Tsurugami', stage: 2, size: 78, rise: 12, pal: KAM, hood: { type: 'none' }, hair: { style: 'long', bangs: 'part' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['wings', { kind: 'angel', mat: 'wing', mat2: 'sub', dy: 3 }], ['hat', { kind: 'crown', mat: 'gold', points: 3, gem: 'acc' }]] });

  // ---- propeller
  const PRP = { main: '#6a8a5a', sub: '#e8dcc0', hair: '#5a3a24', mitt: '#8a5a3a', foot: '#4a3a2a', eye: '#4a3a2a', acc: '#e84a3a', lens: '#bfe6ff', cape: '#8a5a3a', dark: '#3a4a2a', stripe: '#f4f0e8' };
  D('whirligig', { name: 'Whirligig', stage: 1, size: 60, rise: 6, pal: PRP, hood: { type: 'none' }, hair: { style: 'short', bangs: 'spiky' }, mouth: 'o', arms: G.hand, footMat: 'foot',
    parts: [['hat', { kind: 'goggles', mat: 'acc' }], ['hat', { kind: 'cap', mat: 'main' }], ['scarf', { mat: 'stripe', hang: 7 }]] });
  D('aviatrix', { name: 'Aviatrix', stage: 2, size: 78, rise: 8, pal: PRP, hood: { type: 'none' }, hair: { style: 'twin', bangs: 'spiky', len: 9 }, mouth: 'o', arms: G.hand, footMat: 'foot',
    parts: [['belly', { kind: 'jacket', mat: 'cape', trim: 'sub', len: 5 }], ['hat', { kind: 'goggles', mat: 'acc' }], ['scarf', { mat: 'stripe', hang: 9 }]] });

  // ---- cloud
  const CLD = { main: '#f4f8ff', sub: '#c8dcf4', hair: '#6a7a9a', mitt: '#f4f8ff', foot: '#b8c8e0', eye: '#4a6a9a', acc: '#8ac8f0', cape: '#e4eef8', dark: '#9ab0d0', gem: '#f4a8c8' };
  D('flumble', { name: 'Flumble', stage: 1, size: 60, rise: 8, pal: CLD, hood: { type: 'up', ears: { kind: 'round', h: 2, w: 3.4, lean: 1, dy: 1 } }, hair: { style: 'short', bangs: 'part' }, eyes: { style: 'sleepy' }, mouth: 'o', arms: G.hand, footMat: 'foot', bodyW: 1.15,
    parts: [['spots', { mat: 'acc', pts: [[-5, 9, 1], [0, 11, 1], [5, 9, 1]] }]] });
  D('cumulo', { name: 'Cumulo', stage: 2, size: 78, rise: 10, pal: CLD, hood: { type: 'up', ears: { kind: 'round', h: 2, w: 3.6, lean: 1, dy: 1 } }, hair: { style: 'long', bangs: 'part' }, eyes: { style: 'sleepy' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['cape', { mat: 'cape', trim: 'acc', flare: 8, drop: 5 }], ['hat', { kind: 'bow', mat: 'acc' }]] });
})(typeof globalThis !== 'undefined' ? globalThis : window);
