/* src/art/kigu/looks-ch4.js — Chapter 4 species (Route 4, the Dust Bowl, Bobbin Quarry): jerboa, tumbleweed, scorpion, cactus,
 * fennec, tortoise, geode and chipmunk. Battle sprites come from AutoSprite (art/autosprite/kigu); these specs give the size and
 * anchors those sprites are scaled to, the party icons, and the fallback art for any missing view. */
(function (root) {
  'use strict';
  const K = root.NP.art.kigu;
  const D = K.define;
  const G = { hand: { mittMat: 'mitt' } };

  // ---- jerboa
  const JER = { main: '#e2c08a', sub: '#f6e6c4', hair: '#7a4a2a', mitt: '#e2c08a', foot: '#c89a62', eye: '#6a4a2a', inner: '#f2b0a0', acc: '#7aa0b0', lens: '#bfe6ff', dark: '#8a6a44' };
  D('jerbi', { name: 'Jerbi', stage: 1, size: 60, rise: 6, pal: JER, hood: { type: 'up', ears: { kind: 'tri', h: 9, w: 3.4, lean: 1 } }, hair: { style: 'short', bangs: 'part' }, mouth: 'o', arms: G.hand, footMat: 'foot',
    parts: [['belly', { mat: 'sub' }], ['tail', { kind: 'cat', len: 20, r: 1.5, angle: 70, dx: 3 }], ['hat', { kind: 'goggles', mat: 'acc' }]] });
  D('jerbix', { name: 'Jerbix', stage: 2, size: 76, rise: 8, pal: JER, hood: { type: 'up', ears: { kind: 'tri', h: 10, w: 3.6, lean: 1 } }, hair: { style: 'short', bangs: 'part' }, mouth: 'o', arms: G.hand, footMat: 'foot',
    parts: [['skirt', { mat: 'main', len: 5, flare: 5, up: 9, trim: 'dark' }], ['tail', { kind: 'cat', len: 22, r: 1.5, angle: 70, dx: 3 }], ['hat', { kind: 'goggles', mat: 'acc' }]] });

  // ---- tumbleweed (yarn ends)
  const TUM = { main: '#8a5a3a', sub: '#c84a3a', hair: '#6a3a24', mitt: '#3a6a8a', foot: '#7a4a2a', eye: '#4a2a1a', acc: '#d8a040', cape: '#c84a3a', dark: '#5a3a24' };
  D('tumbi', { name: 'Tumbi', stage: 1, size: 58, rise: 4, pal: TUM, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'spiky' }, mouth: 'flat', arms: G.hand, footMat: 'foot', bodyW: 1.25,
    parts: [['stripes', { mat: 'sub', y0: 6, step: 3, th: 1 }], ['spots', { mat: 'acc', pts: [[-5, 2, 1.4], [5, 6, 1.2], [-1, 10, 1.2]] }]] });
  D('tumbora', { name: 'Tumbora', stage: 2, size: 76, rise: 8, pal: TUM, hood: { type: 'none' }, hair: { style: 'long', bangs: 'part' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['cape', { mat: 'cape', trim: 'acc', flare: 7, drop: 5 }], ['stripes', { mat: 'acc', y0: 12, step: 4, th: 1 }]] });

  // ---- scorpion
  const SKO = { main: '#d2b080', sub: '#efdcb4', hair: '#5a3a2a', mitt: '#b08a5a', foot: '#9a744a', eye: '#4a2a3a', cape: '#4a3458', acc: '#f4c542', dark: '#7a5a3a' };
  D('skorpi', { name: 'Skorpi', stage: 1, size: 60, rise: 6, pal: SKO, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, mouth: 'flat', arms: { mittMat: 'mitt', mittR: 3.4 }, footMat: 'foot',
    parts: [['belly', { mat: 'sub' }], ['tail', { kind: 'dragon', len: 22, r: 2.6, angle: 40, dx: 4, curl: 0.8 }]] });
  D('skorpika', { name: 'Skorpika', stage: 2, size: 76, rise: 8, pal: SKO, hood: { type: 'up', ears: null }, hair: { style: 'long', bangs: 'part' }, mouth: 'flat', arms: { mittMat: 'mitt', mittR: 4 }, footMat: 'foot',
    parts: [['cape', { mat: 'cape', trim: 'main', flare: 6, drop: 4 }], ['tail', { kind: 'dragon', len: 26, r: 3, angle: 40, dx: 4, curl: 0.8 }]] });

  // ---- cactus
  const CAC = { main: '#6cae4a', sub: '#a8d880', hair: '#6a4a2a', mitt: '#6cae4a', foot: '#c8683a', eye: '#3a5a2a', acc: '#f08aa8', flower: '#f08aa8', dark: '#3a7a2a', hat: '#e8c070' };
  D('cactli', { name: 'Cactli', stage: 1, size: 62, rise: 4, pal: CAC, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['spots', { mat: 'dark', pts: [[-5, 1, 0.8], [4, 4, 0.8], [-2, 9, 0.8], [6, -2, 0.8]] }], ['hat', { kind: 'sprout', mat: 'acc' }]] });
  D('cactara', { name: 'Cactara', stage: 2, size: 76, rise: 6, pal: CAC, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['skirt', { mat: 'main', len: 4, flare: 4, up: 9, trim: 'sub' }], ['hat', { kind: 'flowers', mat: 'flower', mat2: 'hat', core: 'acc' }]] });

  // ---- fennec
  const FEN = { main: '#ecc88a', sub: '#fff2d8', hair: '#6a4a2a', mitt: '#ecc88a', foot: '#d0a468', eye: '#6a4a2a', inner: '#fff2d8', acc: '#f08a30', cape: '#e0b070', dark: '#8a6a44' };
  D('sandkit', { name: 'Sandkit', stage: 1, size: 62, rise: 10, pal: FEN, hood: { type: 'up', ears: { kind: 'tri', h: 10, w: 5.5, lean: 2 } }, hair: { style: 'short', bangs: 'part' }, mouth: 'cat', arms: G.hand, footMat: 'foot',
    parts: [['belly', { mat: 'sub' }], ['tail', { kind: 'puff', r: 3.4, dx: 4 }], ['scarf', { mat: 'acc', hang: 7 }]] });
  D('sandoa', { name: 'Sandoa', stage: 2, size: 78, rise: 12, pal: FEN, hood: { type: 'up', ears: { kind: 'tri', h: 11, w: 6, lean: 2 } }, hair: { style: 'long', bangs: 'part' }, mouth: 'cat', arms: G.hand, footMat: 'foot',
    parts: [['cape', { mat: 'cape', trim: 'acc', flare: 7, drop: 4 }], ['tail', { kind: 'puff', r: 4, dx: 4 }]] });

  // ---- tortoise (slate)
  const SLA = { main: '#7a8a4a', sub: '#e0d8a8', hair: '#5a3a24', mitt: '#7a8a4a', foot: '#5a6a34', eye: '#3a3a2a', shell: '#4a4a52', acc: '#f4c542', lamp: '#fff3a0', dark: '#3a3a40' };
  D('slatli', { name: 'Slatli', stage: 1, size: 62, rise: 4, pal: SLA, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['belly', { mat: 'sub' }], ['cape', { mat: 'shell', trim: 'dark', flare: 3, drop: 2 }]] });
  D('slatina', { name: 'Slatina', stage: 2, size: 78, rise: 6, pal: SLA, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['cape', { mat: 'shell', trim: 'dark', flare: 6, drop: 3 }], ['hat', { kind: 'hard', mat: 'acc' }]] });

  // ---- geode
  const GEO = { main: '#8a8a90', sub: '#b4b4ba', hair: '#4a3a3a', mitt: '#6a6a72', foot: '#5a5a62', eye: '#7a4ea8', gem: '#a070e0', gem2: '#d8b8ff', cape: '#8a8a90', dark: '#4a4a52' };
  D('geodie', { name: 'Geodie', stage: 1, size: 60, rise: 4, pal: GEO, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['cape', { mat: 'cape', trim: 'gem', flare: 4, drop: 3 }], ['spots', { mat: 'dark', pts: [[-5, 1, 1.4], [4, 5, 1.2], [-2, 10, 1.2]] }]] });
  D('geodrusa', { name: 'Geodrusa', stage: 2, size: 76, rise: 8, pal: GEO, hood: { type: 'up', ears: null }, hair: { style: 'short', bangs: 'part' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['cape', { mat: 'gem', trim: 'gem2', flare: 6, drop: 3 }], ['belly', { kind: 'v', mat: 'gem' }], ['hat', { kind: 'crown', mat: 'gem', points: 5, gem: 'gem2' }]] });
  D('geodora', { name: 'Geodora', stage: 2, size: 80, rise: 12, pal: GEO, hood: { type: 'up', ears: null }, hair: { style: 'long', bangs: 'part' }, mouth: 'flat', arms: G.hand, footMat: 'foot',
    parts: [['skirt', { mat: 'main', len: 6, flare: 7, up: 9, trim: 'gem' }], ['hat', { kind: 'halo', mat: 'gem' }]] });

  // ---- chipmunk (quarry miner)
  const CHI = { main: '#b0643a', sub: '#f2d8b0', hair: '#5a3020', mitt: '#b0643a', foot: '#8a4a2a', eye: '#4a2a1a', stripe: '#4a2618', acc: '#f4c542', apron: '#c8a878', dark: '#7a3a20' };
  D('chippi', { name: 'Chippi', stage: 1, size: 60, rise: 6, pal: CHI, hood: { type: 'up', ears: { kind: 'round', h: 2, w: 3, lean: 1, dy: 1 } }, hair: { style: 'short', bangs: 'spiky' }, mouth: 'nom', arms: G.hand, footMat: 'foot',
    parts: [['belly', { mat: 'sub' }], ['tail', { kind: 'puff', r: 3.6, dx: 4 }], ['stripes', { mat: 'stripe', y0: 2, step: 4, th: 1 }]] });
  D('chippona', { name: 'Chippona', stage: 2, size: 76, rise: 8, pal: CHI, hood: { type: 'up', ears: { kind: 'round', h: 2, w: 3.2, lean: 1, dy: 1 } }, hair: { style: 'short', bangs: 'spiky' }, mouth: 'nom', arms: { mittMat: 'acc', mittR: 4 }, footMat: 'foot',
    parts: [['belly', { kind: 'apron', mat: 'apron' }], ['tail', { kind: 'puff', r: 4.2, dx: 4 }], ['hat', { kind: 'hard', mat: 'acc' }]] });
})(typeof globalThis !== 'undefined' ? globalThis : window);
