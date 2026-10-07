/* src/art/kigu/looks-p2.js — Phase 2 species (BIBLE §3 #30-58): rock, squirrel, bear, owl, koala, ghost, snow bunny,
 * pincushion, mushroom, thief cat, dragon, and the twin legendaries. */
(function (root) {
  'use strict';
  const K = root.NP.art.kigu;
  const D = K.define;
  const G = { hand: { mittMat: 'mitt' } };

  // ---- pebble
  const PEB = { main: '#a8a49c', sub: '#d8d2c4', hair: '#6a6660', mitt: '#8a867e', foot: '#6a6660', eye: '#6a8a4a', inner: '#d8d2c4', gem: '#6fd8f0', gem2: '#c070e0', dark: '#5a564e' };
  D('pebbi', { name: 'Pebbi', stage: 1, size: 44, rise: 2, pal: PEB, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'spiky' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['spots', { mat: 'sub', pts: [[-5, 1, 1.5], [4, 4, 1.2], [-2, 9, 1.2], [6, -2, 1]] }], ['shapes', { stage: 'headgear', at: 'head', m: true, g: 'clips', list: [['e', 9, 6, 1.6, 1.6, 'gem']] }]] });
  D('boulderina', { name: 'Boulderina', stage: 2, size: 53, rise: 3, pal: PEB, hood: { type: 'none' }, hair: { style: 'twin', bangs: 'part', len: 10 }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['belly', { kind: 'bib', mat: 'sub' }], ['shapes', { stage: 'arms', at: 'shL', m: true, g: 'pauldron', list: [['e', -2, 0, 5, 4, 'main'], ['d', -3, -1, 'sub']] }], ['shapes', { stage: 'headgear', at: 'head', m: true, g: 'crystals', list: [['p', [[8, 6], [10, 0], [12, 6]], 'gem']] }]] });
  D('craggelle', { name: 'Craggelle', stage: 3, size: 60, rise: 7, pal: PEB, hood: { type: 'none' }, hair: { style: 'long', bangs: 'part', drop: 3 }, mouth: 'flat', arms: { mittMat: 'mitt', mittR: 4 }, footMat: 'foot',
    parts: [['skirt', { mat: 'main', len: 5, flare: 6, up: 9, trim: 'sub' }], ['belly', { kind: 'v', mat: 'gem' }], ['shapes', { stage: 'arms', at: 'shL', m: true, g: 'pauldron', list: [['e', -3, 0, 6, 5, 'main'], ['p', [[-3, -5], [-1, -10], [1, -5]], 'gem']] }],
      ['hat', { kind: 'crown', mat: 'gem', points: 5, gem: 'gem2' }]] });

  // ---- volt squirrel
  const VOLT = { main: '#f7d43a', sub: '#fff6c0', hair: '#e0a020', mitt: '#8a5a20', foot: '#8a5a20', eye: '#3a2a20', inner: '#ffe890', bolt: '#ffe14a', dark: '#4a4a66', lens: '#9ae0ff', rim: '#8a8aa8', metal: '#b9c6da' };
  D('sparkin', { name: 'Sparkin', stage: 1, size: 45, rise: 6, pal: VOLT, hood: { type: 'up', ears: { kind: 'tri', h: 6, w: 3.4, lean: 0 } }, hair: { style: 'short', bangs: 'spiky' }, mouth: 'fang', arms: G.hand, footMat: 'foot',
    parts: [['tail', { kind: 'bolt', side: 1, sc: 0.9, mat: 'hair' }], ['belly', { mat: 'sub' }], ['hat', { kind: 'tuft', n: 3, mat: 'hair', lean: 1.4 }]] });
  D('voltessa', { name: 'Voltessa', stage: 2, size: 54, rise: 7, pal: VOLT, hood: { type: 'band', mat: 'main', ears: { kind: 'tri', h: 7, w: 4, lean: 0 } }, hair: { style: 'bob', bangs: 'spiky' }, mouth: 'fang', arms: G.hand, footMat: 'foot',
    parts: [['cape', { mat: 'bolt', flare: 7 }], ['tail', { kind: 'bolt', side: 1, sc: 1.2, mat: 'hair', over: false }], ['belly', { mat: 'sub', kind: 'v' }], ['hat', { kind: 'buns', mat: 'hair', r: 3 }], ['hat', { kind: 'goggles', strap: 'dark', rim: 'rim', lens: 'lens', lift: -2 }],
      ['shapes', { stage: 'arms', at: 'handR', g: 'gloves', list: [['e', 0, 1, 3.4, 3, 'dark']] }]] });

  // ---- bear
  const BEAR = { main: '#a8703a', sub: '#e8c898', hair: '#5a3a20', mitt: '#fff8e8', foot: '#5a3a20', eye: '#3a2a20', inner: '#e8c898', acc: '#e04a3a', robe: '#e8a040', bead: '#8a4a2a', glove: '#e04a3a' };
  D('kumi', { name: 'Kumi', stage: 1, size: 46, rise: 3, pal: BEAR, hood: { type: 'up', ears: { kind: 'round', h: 2, w: 3.4, lean: 1, dy: 1 } }, hair: { style: 'short', bangs: 'part' }, mouth: 'pout', arms: { mittMat: 'mitt', mittR: 3.4 }, footMat: 'foot',
    parts: [['tail', { kind: 'puff', r: 2.5, dx: 4 }], ['belly', { mat: 'sub' }]] });
  D('kumara', { name: 'Kumara', stage: 2, size: 55, rise: 4, pal: Object.assign({}, BEAR, { mitt: '#e04a3a' }), hood: { type: 'band', mat: 'main', ears: { kind: 'round', h: 2, w: 3.6, lean: 1, dy: 1 } }, hair: { style: 'braid', bangs: 'part', side: 1, tie: 'acc' }, mouth: 'pout', arms: { mittMat: 'mitt', mittR: 4.2 }, footMat: 'foot',
    parts: [['tail', { kind: 'puff', r: 3, dx: 4 }], ['belly', { mat: 'sub' }], ['hat', { kind: 'headband', mat: 'acc', knot: true }]] });
  D('kumazen', { name: 'Kumazen', stage: 3, size: 60, rise: 4, pal: Object.assign({}, BEAR, { mitt: '#fff8e8' }), hood: { type: 'none', ears: { kind: 'round', h: 2, w: 3.8, lean: 1, dy: 2, over: true } }, hair: { style: 'short', bangs: 'short' }, eyes: { style: 'closed' }, mouth: 'flat', arms: { mittMat: 'mitt', mittR: 4.4, mat: 'robe' }, footMat: 'foot',
    parts: [['belly', { kind: 'jacket', mat: 'robe', len: 6, trim: 'sub' }], ['shapes', { stage: 'outfit', at: 'chest', g: 'beads', list: [['o', 0, -1, 5, 3, 1, 'bead']] }], ['tail', { kind: 'puff', r: 3, dx: 4 }]] });

  // ---- owl / koala / ghost
  const OWL = { main: '#9a6e46', sub: '#f0dcb8', hair: '#6a4a30', mitt: '#6a4a30', foot: '#d89a3a', eye: '#d89a1a', inner: '#f0dcb8', rim: '#3a2a20', acc: '#3a4a80', page: '#fff8e8', gold: '#f4c542', dark: '#2a2a48' };
  D('hootie', { name: 'Hootie', stage: 1, size: 45, rise: 4, pal: OWL, hood: { type: 'up', ears: { kind: 'tri', h: 5, w: 3.4, lean: 2 } }, hair: { style: 'short', bangs: 'part' }, face: ['glasses'], arms: { type: 'wing', mat: 'hair', tip: 'main' }, footMat: 'foot',
    parts: [['belly', { mat: 'sub' }], ['spots', { mat: 'main', pts: [[-4, 6, 1], [0, 8, 1], [4, 6, 1]] }], ['shapes', { stage: 'front', at: 'handL', g: 'book', list: [['r', -2, -2, 6, 5, 'acc'], ['r', -1, -1, 4, 3, 'page']] }]] });
  D('hootelle', { name: 'Hootelle', stage: 2, size: 55, rise: 6, pal: OWL, hood: { type: 'up', ears: { kind: 'tri', h: 5, w: 3.4, lean: 2, over: true } }, hair: { style: 'short', bangs: 'part' }, face: ['glasses'], arms: { type: 'wing', mat: 'hair', tip: 'main' }, footMat: 'foot',
    parts: [['cape', { mat: 'hair', flare: 6, drop: 2 }], ['belly', { mat: 'sub' }], ['hat', { kind: 'mortar', mat: 'dark', tassel: 'gold' }], ['shapes', { stage: 'front', at: 'handL', g: 'scroll', list: [['r', -2, -8, 4, 12, 'page'], ['r', -3, -9, 6, 2, 'gold'], ['r', -3, 3, 6, 2, 'gold']] }]] });

  const KOA = { main: '#a9adbd', sub: '#e6e8f0', hair: '#7e8296', mitt: '#8a8ea4', foot: '#8a8ea4', eye: '#3a3a5a', inner: '#ffc7d4', pillow: '#fff3d0', acc: '#5a6ab8', gown: '#dfe4ff', star: '#ffe680', ted: '#c48a52', cap: '#7a8ad8' };
  D('dozey', { name: 'Dozey', stage: 1, size: 44, rise: 4, pal: KOA, hood: { type: 'up', ears: { kind: 'round', h: 2, w: 4, lean: 1, dy: 1 } }, hair: { style: 'short', bangs: 'part' }, eyes: { style: 'sleepy' }, mouth: 'yawn', arms: { mittMat: 'mitt', pose: 'front' }, footMat: 'foot',
    parts: [['belly', { mat: 'sub' }], ['shapes', { stage: 'front', at: 'chest', g: 'pillow', list: [['r', -9, 5, 18, 8, 'pillow'], ['l', -9, 9, -7, 9, 'star', 0]] }]] });
  D('slumbelle', { name: 'Slumbelle', stage: 2, size: 55, rise: 6, pal: KOA, hood: { type: 'none', ears: { kind: 'round', h: 2, w: 4, lean: 1, dy: 1, over: true } }, hair: { style: 'long', bangs: 'part' }, eyes: { style: 'sleepy' }, mouth: 'yawn', arms: { mittMat: 'mitt', mat: 'gown' }, footMat: 'foot',
    parts: [['skirt', { mat: 'gown', len: 5, flare: 5, up: 11, trim: 'sub' }], ['belly', { kind: 'v', mat: 'gown' }], ['hat', { kind: 'nightcap', mat: 'cap', band: 'sub' }], ['shapes', { stage: 'front', at: 'handL', g: 'teddy', list: [['e', 0, -2, 4, 4, 'ted'], ['e', -3, -6, 1.6, 1.6, 'ted'], ['e', 3, -6, 1.6, 1.6, 'ted']] }]] });
  D('somnia', { name: 'Somnia', stage: 3, size: 61, rise: 9, pal: Object.assign({}, KOA, { gown: '#3a3a8a', sub: '#d8defa', hair: '#b8c0f0' }), hood: { type: 'none', ears: { kind: 'round', h: 2, w: 4.2, lean: 1, dy: 1, over: true } }, hair: { style: 'long', bangs: 'part', drop: 4 }, eyes: { style: 'closed' }, mouth: 'smile', arms: { mittMat: 'mitt', mat: 'gown' }, footMat: 'foot',
    parts: [['cape', { mat: 'cap', trim: 'star', flare: 10, drop: 7 }], ['skirt', { mat: 'gown', len: 6, flare: 6, up: 11, trim: 'star' }], ['belly', { kind: 'v', mat: 'cap' }], ['hat', { kind: 'crown', mat: 'star', points: 3 }],
      ['shapes', { stage: 'front', at: 'head', m: true, g: 'orbs', shade: 0, list: [['e', 19, 6, 3, 3, 'lens', 0], ['e', 17, 18, 2, 2, 'star', 0]] }]] });

  const GHO = { main: '#f4f0ff', sub: '#d8d0f0', hair: '#8878c0', mitt: '#f4f0ff', foot: '#f4f0ff', eye: '#6a5ab0', inner: '#d8d0f0', lace: '#fff8ff', lamp: '#ffd680', veil: '#e0daf8', acc: '#6a5a9e' };
  D('sheetie', { name: 'Sheetie', stage: 1, size: 45, rise: 0, pal: GHO, cocoon: true, hood: { type: 'up', ears: null }, hair: { bare: true }, mouth: 'flat', arms: { mittMat: 'mitt', pose: 'front', mittR: 2.4 },
    parts: [['skirt', { mat: 'main', len: 1, flare: 4, up: 14, scallop: 7, g: 'hem' }]] });
  D('spectrina', { name: 'Spectrina', stage: 2, size: 55, rise: 6, pal: GHO, hood: { type: 'none' }, hair: { style: 'long', bangs: 'part', drop: 4 }, mouth: 'smile', arms: { mittMat: 'mitt' }, footMat: 'foot',
    parts: [['cape', { mat: 'veil', flare: 9, drop: 8, over: false }], ['skirt', { mat: 'lace', len: 6, flare: 6, scallop: 7, up: 10, trim: 'sub' }], ['belly', { kind: 'v', mat: 'sub' }], ['shapes', { stage: 'front', at: 'handR', g: 'lantern', list: [['r', -3, -2, 6, 7, 'lamp'], ['r', -3, -3, 6, 1, 'acc'], ['r', -3, 5, 6, 1, 'acc'], ['l', 0, -6, 0, -3, 'acc']] }]] });

  // ---- snow bunny / pincushion / mushroom / thief
  const SNO = { main: '#f6fbff', sub: '#d0ecf8', hair: '#b0d8f0', mitt: '#f6fbff', foot: '#e0f0fa', eye: '#4a90d0', inner: '#ffc7d8', scarf: '#5ab8e8', ice: '#9fe6f8', fur: '#ffffff', cape: '#8ac8e8' };
  D('yukimi', { name: 'Yukimi', stage: 1, size: 44, rise: 9, pal: SNO, hood: { type: 'up', ears: { kind: 'long', h: 10, w: 2.8, lean: 2 } }, hair: { style: 'short', bangs: 'part' }, arms: G.hand, footMat: 'foot',
    parts: [['tail', { kind: 'puff', r: 3.5, dx: 4 }], ['scarf', { mat: 'scarf', hang: 7 }], ['spots', { mat: 'sub', pts: [[0, 6, 1.6], [0, 11, 1.6]] }]] });
  D('yukiara', { name: 'Yukiara', stage: 2, size: 55, rise: 9, pal: SNO, hood: { type: 'band', mat: 'main', ears: { kind: 'long', h: 11, w: 3, lean: 2 } }, hair: { style: 'long', bangs: 'part', drop: 2 }, arms: G.hand, footMat: 'foot',
    parts: [['cape', { mat: 'cape', trim: 'fur', flare: 7 }], ['tail', { kind: 'puff', r: 4, dx: 4, over: false }], ['belly', { mat: 'sub', kind: 'v' }], ['hat', { kind: 'crown', mat: 'ice', points: 5 }], ['scarf', { mat: 'fur', hang: 0 }],
      ['shapes', { stage: 'front', at: 'handR', g: 'wand', list: [['c', 2, -14, 2, 6, 0.8, 0.8, 'ice'], ['p', [[0, -14], [2, -22], [4, -14]], 'ice']] }]] });

  const PIN = { main: '#d8483a', sub: '#ffb8a8', hair: '#7a4a8a', mitt: '#f0d8a8', foot: '#8a5a3a', eye: '#3a2a5a', inner: '#ffb8a8', pin: '#e8e8f4', metal: '#c8d0e0', thread: '#4a78c8', leaf: '#5cbf4a', dark: '#5a6a8a', cape: '#3a6ab8' };
  D('pinny', { name: 'Pinny', stage: 1, size: 44, rise: 3, pal: PIN, hood: { type: 'none' }, hair: { style: 'bob', bangs: 'spiky' }, mouth: 'pout', arms: G.hand, footMat: 'foot',
    parts: [['belly', { kind: 'apron', mat: 'leaf' }], ['hat', { kind: 'cap', mat: 'main' }], ['shapes', { stage: 'headgear', at: 'head', m: true, g: 'pins', list: [['c', 7, 3, 11, -2, 0.6, 0.6, 'pin'], ['d', 11, -3, 'main']] }], ['shapes', { stage: 'headgear', at: 'head', g: 'stem', list: [['r', -2, -3, 4, 2, 'leaf']] }]] });
  D('needlette', { name: 'Needlette', stage: 2, size: 55, rise: 8, pal: PIN, hood: { type: 'none' }, hair: { style: 'bob', bangs: 'spiky' }, mouth: 'pout', arms: { mittMat: 'mitt', mat: 'dark' }, footMat: 'dark',
    parts: [['belly', { kind: 'jacket', mat: 'metal', len: 3, trim: 'dark' }], ['hat', { kind: 'thimble', mat: 'metal', dot: 'dark' }], ['shapes', { stage: 'front', at: 'handR', g: 'lance', list: [['c', 2, -24, 2, 12, 0.9, 0.9, 'pin'], ['p', [[0, -24], [4, -24], [2, -32]], 'pin']] }]] });
  D('thimbelle', { name: 'Thimbelle', stage: 3, size: 61, rise: 9, pal: Object.assign({}, PIN, { metal: '#b8c4dc' }), hood: { type: 'none' }, hair: { style: 'long', bangs: 'part', drop: 3 }, mouth: 'smile', arms: { mittMat: 'mitt', mat: 'metal' }, footMat: 'dark',
    parts: [['cape', { mat: 'thread', flare: 10, drop: 8, trim: 'pin' }], ['skirt', { mat: 'metal', len: 6, flare: 6, up: 11, scallop: 7, trim: 'dark' }], ['belly', { kind: 'v', mat: 'main' }], ['hat', { kind: 'thimble', mat: 'metal', dot: 'dark', lift: -1 }]] });

  const SHR = { main: '#8a5a3a', sub: '#e8d8b8', hair: '#6a4a30', mitt: '#e8d8b8', foot: '#6a4a30', eye: '#3a2a20', inner: '#e8d8b8', cap: '#e04a4a', spot: '#fff6e6', spore: '#c890e0', rose: '#ff8aa8' };
  D('shroomi', { name: 'Shroomi', stage: 1, size: 44, rise: 6, pal: SHR, hood: { type: 'up', mat: 'cap', ears: null, pattern: (cv, L) => cv.ell(L.cx, L.hcy - L.hry * 0.5, L.hrx + 3, L.hry * 0.55, 'cap') }, hair: { style: 'short', bangs: 'short' }, arms: G.hand, footMat: 'foot',
    parts: [['belly', { mat: 'sub' }], ['shapes', { stage: 'headgear', at: 'head', g: 'spots', list: [['e', -6, 2, 2, 2, 'spot'], ['e', 4, -1, 2.4, 2.4, 'spot'], ['e', 9, 4, 1.5, 1.5, 'spot']] }], ['shapes', { stage: 'front', at: 'head', g: 'spores', shade: 0, list: [['d', -16, 6, 'spore', 0], ['d', 15, 2, 'spore', 0], ['d', 17, 9, 'spore', 0]] }]] });
  D('shroomelle', { name: 'Shroomelle', stage: 2, size: 55, rise: 9, pal: SHR, hood: { type: 'none' }, hair: { style: 'bob', bangs: 'part' }, arms: G.hand, footMat: 'foot',
    parts: [['skirt', { mat: 'sub', len: 5, flare: 6, up: 10, scallop: 8, trim: 'cap' }], ['belly', { kind: 'bib', mat: 'cap' }],
      ['shapes', { stage: 'headgear', at: 'head', g: 'parasol', list: [['e', 0, 1, 17, 7, 'cap'], ['e', -8, 0, 2.6, 2.4, 'spot'], ['e', 4, -3, 3, 2.6, 'spot'], ['e', 11, 2, 2, 2, 'spot']] }]] });

  const CAT2 = { main: '#3a3048', sub: '#fff0d8', hair: '#1e1a2a', mitt: '#3a3048', foot: '#3a3048', eye: '#f0c030', inner: '#e0508a', acc: '#e0405a', gold: '#f4c542', cape: '#2a2240', ribbon: '#e0405a', stripe: '#fff0d8' };
  D('purrlie', { name: 'Purrlie', stage: 1, size: 44, rise: 6, pal: CAT2, hood: { type: 'up', ears: { kind: 'tri', h: 7, w: 4, lean: 1 } }, hair: { style: 'short', bangs: 'spiky' }, mouth: 'cat', arms: G.hand, footMat: 'foot',
    parts: [['tail', { kind: 'cat', len: 18, r: 4, angle: 50, dx: 3 }], ['scarf', { mat: 'acc', hang: 8 }], ['hat', { kind: 'domino', mat: 'hair' }], ['stripes', { mat: 'stripe', y0: 14, step: 4, th: 1 }]] });
  D('prowlette', { name: 'Prowlette', stage: 2, size: 55, rise: 8, pal: CAT2, hood: { type: 'up', ears: { kind: 'tri', h: 7, w: 4, lean: 1, over: true } }, hair: { style: 'short', bangs: 'spiky' }, mouth: 'cat', arms: G.hand, footMat: 'foot',
    parts: [['cape', { mat: 'cape', trim: 'acc', flare: 8, drop: 6 }], ['tail', { kind: 'cat', len: 22, r: 4, angle: 50, dx: 3, tip: 'ribbon', tipAt: 0.88 }], ['bowtie', { mat: 'acc' }], ['hat', { kind: 'tophat', mat: 'cape', band: 'acc' }], ['hat', { kind: 'domino', mat: 'hair' }]] });

  // ---- dragon
  const DRA = { main: '#c03048', sub: '#ffd8b0', hair: '#2a2236', mitt: '#2a2236', foot: '#2a2236', eye: '#f0b020', inner: '#ffd8b0', horn: '#f0e8d0', wing: '#8a2040', gold: '#f4c542', gown: '#2a1e3c', flame: '#ff9a3a' };
  D('draki', { name: 'Draki', stage: 1, size: 45, rise: 5, pal: DRA, hood: { type: 'up', ears: { kind: 'horn', h: 5, w: 2.4, lean: 1, mat: 'horn' } }, hair: { style: 'short', bangs: 'spiky' }, mouth: 'fang', arms: G.hand, footMat: 'foot',
    parts: [['tail', { kind: 'dragon', len: 16, r: 4, angle: 55, dx: 3, spike: 'horn' }], ['belly', { mat: 'sub' }]] });
  D('drakessa', { name: 'Drakessa', stage: 2, size: 56, rise: 7, pal: DRA, hood: { type: 'up', ears: { kind: 'horn', h: 7, w: 2.8, lean: 2, mat: 'horn' } }, hair: { style: 'short', bangs: 'spiky' }, mouth: 'fang', arms: G.hand, footMat: 'foot',
    parts: [['wings', { kind: 'bat', mat: 'wing', mat2: 'main', sz: 0.66 }], ['tail', { kind: 'dragon', len: 22, r: 4.5, angle: 55, dx: 3, spike: 'horn' }], ['belly', { mat: 'sub' }]] });
  D('drakonia', { name: 'Drakonia', stage: 3, size: 62, rise: 13, pal: Object.assign({}, DRA, { main: '#5a3a8a', wing: '#2a1e4a', sub: '#e8d8ff', gown: '#241a3a' }), hood: { type: 'none' }, hair: { style: 'long', bangs: 'part', drop: 4 }, mouth: 'smile', arms: { mittMat: 'mitt', mat: 'gown' }, footMat: 'foot',
    parts: [['wings', { kind: 'bat', mat: 'wing', mat2: 'main', sz: 0.5 }], ['tail', { kind: 'dragon', len: 24, r: 5, angle: 55, dx: 3, spike: 'horn' }], ['skirt', { mat: 'gown', len: 6, flare: 7, up: 11, trim: 'gold' }], ['belly', { kind: 'v', mat: 'main' }],
      ['shapes', { stage: 'headgear', at: 'head', m: true, g: 'horns', list: [['p', [[2, 4], [4, -3], [6, -8], [7, 2], [6, 6]], 'horn']] }], ['shapes', { stage: 'headgear', at: 'head', g: 'hornc', list: [['p', [[-2, 4], [0, -7], [2, 4]], 'horn']] }]] });

  // ---- legendary twins
  const WAR = { main: '#fff6f0', sub: '#e04048', hair: '#f0e0d8', mitt: '#fff6f0', foot: '#e04048', eye: '#e04a4a', inner: '#f8d0c8', thread: '#ff7a8a', gold: '#f4c542', robe: '#fff6f0' };
  D('warpa', { name: 'Warpa', stage: 1, size: 60, rise: 9, pal: WAR, hood: { type: 'none' }, hair: { style: 'long', bangs: 'part', drop: 4 }, mouth: 'smile', arms: { mittMat: 'mitt', mat: 'robe', pose: 'out' }, footMat: 'foot',
    parts: [['cape', { mat: 'sub', flare: 9, drop: 8, trim: 'gold' }], ['skirt', { mat: 'robe', len: 6, flare: 6, up: 11, trim: 'sub' }], ['belly', { kind: 'v', mat: 'sub' }],
      ['hat', { kind: 'crown', mat: 'gold', points: 7 }],
      ['shapes', { stage: 'front', at: 'handR', m: false, g: 'threadsR', shade: 0, list: [['l', 3, 2, 3, 12, 'thread', 0], ['l', 6, 2, 6, 10, 'thread', 0], ['l', 0, 3, 0, 9, 'thread', 0]] }],
      ['shapes', { stage: 'front', at: 'handL', g: 'threadsL', shade: 0, list: [['l', -3, 2, -3, 12, 'thread', 0], ['l', -6, 2, -6, 10, 'thread', 0], ['l', 0, 3, 0, 9, 'thread', 0]] }]] });
  D('weftie', { name: 'Weftie', stage: 1, size: 60, rise: 9, pal: Object.assign({}, WAR, { sub: '#3a78d8', foot: '#3a78d8', eye: '#3a78d8', thread: '#7ac0ff', hair: '#dce8f8' }), hood: { type: 'none' }, hair: { style: 'long', bangs: 'part', drop: 4 }, mouth: 'smile', arms: { mittMat: 'mitt', mat: 'robe', pose: 'out' }, footMat: 'foot',
    parts: [['cape', { mat: 'sub', flare: 9, drop: 8, trim: 'gold' }], ['skirt', { mat: 'robe', len: 6, flare: 6, up: 11, trim: 'sub' }], ['belly', { kind: 'v', mat: 'sub' }],
      ['hat', { kind: 'crown', mat: 'gold', points: 7 }],
      ['ring', { at: 'chest', rx: 17, ry: 4, th: 1, mat: 'thread', dy: 4 }], ['ring', { at: 'waist', rx: 15, ry: 3, th: 1, mat: 'thread', dy: -6 }]] });
})(typeof globalThis !== 'undefined' ? globalThis : window);
