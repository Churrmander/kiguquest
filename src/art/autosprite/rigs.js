/* NP.art.autospriteRigs — the paper-doll idle rigs, per Kigu and view (front | back), in battle-sprite crop pixels (the
 * data.js crops). Format and tracks: see rig.js. Every rig is scored by the art critic (8/10 or more) before it lands here;
 * preview one with `node tools/preview-idle.mjs <id> [--view back] [--gif DIR]`. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  NP.art = NP.art || {};
  const box = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const BOB = { dy: ['tab', 'BOB', 1] };
  // clip a polygon's y between y0 and y1 (bands of one tail fan)
  const band = (poly, y0, y1) => [poly.map(([x, y]) => [x, Math.min(Math.max(y, y0), y1)])];

  /** The breathing pair every rig ends with: legs below `seam` stay planted, everything above it rises with BOB (the seam
   *  row is grown upward under it, so no gap opens). W, H: the crop size (any bigger box works). */
  const breathe = (seam, W, H) => [
    { name: 'lower', polys: [box(0, seam, W, H)], z: 1, comp: 'main' },
    { name: 'upper', polys: null, z: 2, pivot: [0, seam], fill: [['lower', [box(0, seam - 3, W, seam)]]] },
  ];

  const R = {};

  // ---------------------------------------------------------------- Kyuubelle: nine tails, foxfire wisps
  {
    const body = [[28, 0], [54, 0], [56, 22], [55, 32], [58, 44], [57, 59], [51, 61], [51, 87], [24, 87], [24, 80], [26, 79], [26, 61],
      [21, 59], [20, 45], [25, 35], [25, 19], [27, 19]];
    const lower = body.filter((p) => p[1] >= 59).concat([[21, 59], [57, 59]]);
    const tails = [[0, 25], [39, 25], [39, 33], [37, 45], [45, 52], [48, 56], [50, 64], [49, 72], [46, 80], [38, 81], [30, 84], [0, 84]];
    R.kyuubelle = {
      front: {
        parts: [
          { name: 'w1', polys: [box(10, 5, 24, 22)], z: 5, comp: 'floater' },
          { name: 'w2', polys: [box(58, 5, 70, 22)], z: 5, comp: 'floater' },
          { name: 'w3', polys: [box(0, 62, 12, 80)], z: 5, comp: 'floater' },
          { name: 'w4', polys: [box(52, 77, 61, 86)], z: 5 },
          { name: 'earL', polys: [box(28, 0, 37, 10)], z: 3, pivot: [33, 11], parent: 'upper', comp: 'main' },
          { name: 'lower', polys: [lower], z: 1, comp: 'main' },
          { name: 'upper', polys: [body], z: 2, pivot: [39, 58], comp: 'main', fill: [['lower', [box(0, 55, 96, 59)]]] },
          // three tail groups per fan; the middle group sits behind and runs on under its neighbours, so no seam opens
          { name: 'L1', polys: [box(0, 0, 39, 49)], z: 0.5, pivot: [36, 56], comp: 'main', extend: [body] },
          { name: 'L3', polys: [box(0, 61, 39, 96)], z: 0.5, pivot: [36, 56], comp: 'main', extend: [body] },
          { name: 'L2', polys: [box(0, 49, 39, 61)], z: 0, pivot: [36, 56], comp: 'main', extend: [body, box(0, 40, 39, 70)] },
          { name: 'R1', polys: [box(39, 0, 96, 50)], z: 0.5, pivot: [42, 56], comp: 'main', extend: [body] },
          { name: 'R3', polys: [box(39, 60, 96, 96)], z: 0.5, pivot: [42, 56], comp: 'main', extend: [body] },
          { name: 'R2', polys: [box(39, 50, 96, 60)], z: 0, pivot: [42, 56], comp: 'main', extend: [body, box(39, 41, 96, 69)] },
        ],
        anim: {
          upper: BOB, earL: { ang: ['twitch', -8, 13] },
          L1: { ang: ['tab', 'OPEN', -1.25, 0] }, L2: { ang: ['tab', 'OPEN', -1.25, 1] }, L3: { ang: ['tab', 'OPEN', -1.25, 2] },
          R1: { ang: ['tab', 'OPEN', 1.25, 0] }, R2: { ang: ['tab', 'OPEN', 1.25, 1] }, R3: { ang: ['tab', 'OPEN', 1.25, 2] },
          w1: { dy: ['float', 0.5, 1.4] }, w2: { dy: ['float', 2.1, 1.4, true] }, // w2 only rises: air between it and the tail tip
          w3: { dy: ['float', 4.2, 1.4] }, w4: { dy: ['float', 1.0, 1.4] },
        },
      },
      back: {
        parts: [
          { name: 'w1', polys: [box(20, 6, 32, 24)], z: 5, comp: 'floater' },
          { name: 'w2', polys: [box(7, 21, 19, 39)], z: 5, comp: 'floater' },
          { name: 'w3', polys: [box(69, 12, 82, 29)], z: 5, comp: 'floater' },
          { name: 'w4', polys: [box(79, 30, 89, 47)], z: 5, comp: 'floater' },
          { name: 'w5', polys: [box(73, 54, 85, 71)], z: 5, comp: 'floater' },
          { name: 'w6', polys: [box(12, 82, 25, 97)], z: 5, comp: 'floater' },
          { name: 'ear', polys: [box(58, 3, 69, 15)], z: 4, pivot: [62, 16], parent: 'upper', comp: 'main', fill: [['upper', [box(57, 12, 70, 17)]]] },
          // seen from behind the tails overlap in depth, so the whole bunch lifts as one piece from the tailbone
          { name: 'tails', polys: [tails], z: 3, pivot: [47, 64], comp: 'main', fill: [['upper', [box(28, 22, 52, 66)]], ['lower', [box(30, 66, 52, 82)]]] },
          { name: 'lower', polys: [box(0, 66, 96, 99)], z: 1, comp: 'main' },
          { name: 'upper', polys: null, z: 2, pivot: [55, 66], fill: [['lower', [box(0, 63, 96, 66)]]] },
        ],
        anim: {
          upper: BOB, ear: { ang: ['twitch', 8, 3] }, tails: { ang: ['tab', 'OPEN', -1.25, 0] },
          w1: { dy: ['float', 0.5, 1.4] }, w2: { dy: ['float', 2.1, 1.4] }, w3: { dy: ['float', 4.2, 1.4] },
          w4: { dy: ['float', 1.0, 1.4] }, w5: { dy: ['float', 3.1, 1.4] }, w6: { dy: ['float', 5.2, 1.4, true] }, // w6 sits on the ground line
        },
      },
    };
  }

  // ---------------------------------------------------------------- Konko: flame-tipped tail, hood ears
  R.konko = {
    front: {
      parts: [
        { name: 'flame', polys: [box(31, 20, 44, 42)], z: 1, pivot: [37, 42], parent: 'tail' },
        { name: 'tail', polys: [box(26, 38, 44, 56), box(24, 44, 27, 55)], z: 0, pivot: [25, 48], comp: 'main', extend: [box(18, 42, 26, 55), box(31, 36, 44, 42)] },
        { name: 'earR', polys: [box(18, 0, 26, 7)], z: 4, pivot: [21, 8], parent: 'upper', comp: 'main', fill: [['upper', [box(18, 5, 26, 8)]]] },
        { name: 'earL', polys: [box(2, 0, 10, 7)], z: 4, pivot: [7, 8], parent: 'upper', comp: 'main', fill: [['upper', [box(2, 5, 10, 8)]]] },
        { name: 'lower', polys: [box(0, 46, 44, 67)], z: 2, comp: 'main' },
        { name: 'upper', polys: null, z: 3, pivot: [14, 46], fill: [['lower', [box(0, 43, 44, 46)]]] },
      ],
      anim: { upper: BOB, tail: { ang: ['tab', 'SWAY', -2, 0] }, flame: { ang: ['tab', 'SWAY', -1.5, 2] }, earR: { ang: ['twitch', 10, 9] }, earL: { ang: ['twitch', -10, 20] } },
    },
    back: {
      parts: [
        { name: 'fire', polys: [box(58, 20, 70, 46)], z: 5, comp: 'floater' },
        { name: 'flame', polys: [box(0, 22, 19, 56)], z: 4, pivot: [14, 55], parent: 'tail' },
        { name: 'tail', polys: [[[0, 30], [18, 30], [20, 48], [26, 50], [31, 56], [31, 64], [24, 68], [16, 71], [8, 70], [0, 68]]], z: 3, pivot: [27, 58], comp: 'main',
          fill: [['upper', [box(16, 46, 34, 62)]], ['lower', [box(16, 62, 34, 72)]]], extend: [box(0, 30, 19, 58)] },
        { name: 'ear', polys: [box(45, 0, 56, 12)], z: 4, pivot: [49, 13], parent: 'upper', comp: 'main', fill: [['upper', [box(44, 9, 57, 14)]]] },
        { name: 'lower', polys: [box(0, 62, 70, 89)], z: 1, comp: 'main' },
        { name: 'upper', polys: null, z: 2, pivot: [35, 62], fill: [['lower', [box(0, 59, 70, 62)]]] },
      ],
      anim: { upper: BOB, tail: { ang: ['tab', 'SWAY', 2, 0] }, flame: { ang: ['tab', 'SWAY', 1.5, 2] }, ear: { ang: ['twitch', 10, 9] }, fire: { dy: ['float', 1.0, 1.4] } },
    },
  };

  // ---------------------------------------------------------------- Dunehop: tufted tail, big ears
  R.dunehop = {
    front: {
      parts: [
        { name: 'tuft', polys: [box(31, 43, 38, 55)], z: 1, pivot: [33, 44], parent: 'tail', comp: 'main' },
        { name: 'tail', polys: [box(24, 38, 38, 46)], z: 0, pivot: [23, 43], comp: 'main', extend: [box(19, 40, 24, 46), box(31, 43, 38, 48)] },
        { name: 'earL', polys: [[[0, 0], [9, 0], [9, 9], [7, 13], [0, 13]]], z: 4, pivot: [5, 13], parent: 'upper', comp: 'main', fill: [['upper', [box(0, 9, 10, 14)]]] },
        { name: 'earR', polys: [[[21, 0], [30, 0], [30, 13], [23, 13], [21, 9]]], z: 4, pivot: [25, 13], parent: 'upper', comp: 'main', fill: [['upper', [box(20, 9, 30, 14)]]] },
        { name: 'lower', polys: [box(0, 40, 38, 60)], z: 2, comp: 'main' },
        { name: 'upper', polys: null, z: 3, pivot: [14, 40], fill: [['lower', [box(0, 37, 38, 40)]]] },
      ],
      anim: { upper: BOB, tail: { ang: ['tab', 'FLICK', 1.5, 0] }, earL: { ang: ['twitch', -7, 10] }, earR: { ang: ['twitch', 7, 11] } },
    },
    back: {
      parts: [
        { name: 'tuft', polys: [box(0, 60, 9, 75)], z: 4, pivot: [7, 61], parent: 'tail', comp: 'main' },
        { name: 'tail', polys: [[[0, 54], [19, 54], [19, 62], [9, 62], [9, 75], [0, 75]]], z: 3, pivot: [19, 58], comp: 'main', extend: [box(0, 60, 9, 64)] },
        { name: 'ear', polys: [box(24, 0, 34, 10)], z: 4, pivot: [28, 11], parent: 'upper', comp: 'main', fill: [['upper', [box(23, 8, 35, 12)]]] },
        { name: 'lower', polys: [box(0, 56, 45, 80)], z: 1, comp: 'main' },
        { name: 'upper', polys: null, z: 2, pivot: [25, 56], fill: [['lower', [box(0, 53, 45, 56)]]] },
      ],
      anim: { upper: BOB, tail: { ang: ['tab', 'FLICK', -1.5, 0] }, ear: { ang: ['twitch', 7, 10] } },
    },
  };

  // ---------------------------------------------------------------- batch 1
  R.kitsuri = {
    front: {
      parts: [
        { name: 'tailL', polys: [[[0, 33], [7, 33], [8, 57], [0, 57]]], z: 0, pivot: [7, 57], comp: 'main', extend: [box(5, 44, 12, 60)] },
        { name: 'tailR', polys: [[[39, 29], [50, 29], [50, 58], [34, 58], [34, 50], [38, 45]]], z: 0, pivot: [35, 55], comp: 'main', extend: [box(30, 44, 38, 60)] },
        { name: 'ear', polys: [box(27, 0, 35, 8)], z: 4, pivot: [30, 9], parent: 'upper', comp: 'main', fill: [['upper', [box(26, 6, 36, 10)]]] },
        ...breathe(58, 50, 77),
      ],
      anim: { upper: BOB, tailL: { ang: ['tab', 'SWAY', -2, 0] }, tailR: { ang: ['tab', 'SWAY', 2, 2] }, ear: { ang: ['twitch', 10, 9] } },
    },
    back: {
      parts: [
        { name: 'tails', polys: [[[0, 34], [20, 34], [24, 38], [38, 38], [46, 52], [46, 66], [40, 80], [32, 92], [0, 94]]], z: 3, pivot: [42, 70], comp: 'main',
          fill: [['upper', [box(25, 38, 48, 77)]], ['lower', [box(25, 78, 48, 95)]]] },
        { name: 'ear', polys: [box(58, 0, 74, 18)], z: 4, pivot: [64, 19], parent: 'upper', comp: 'main', fill: [['upper', [box(56, 15, 76, 21)]]] },
        ...breathe(78, 78, 103),
      ],
      anim: { upper: BOB, tails: { ang: ['tab', 'SWAY', 1.5, 0] }, ear: { ang: ['twitch', 8, 9] } },
    },
  };

  R.boulderina = { // the head settles after the breath, the heavy rock pauldrons a beat after that
    front: {
      parts: [
        { name: 'padL', polys: [[[0, 24], [4, 24], [4, 23], [11, 23], [11, 37], [0, 37]]], z: 3, comp: 'main', fill: [['upper', [box(0, 21, 13, 38)]]] },
        { name: 'padR', polys: [[[34, 23], [42, 23], [42, 24], [45, 24], [45, 37], [34, 37]]], z: 3, comp: 'main', fill: [['upper', [box(32, 21, 45, 38)]]] },
        { name: 'head', polys: [box(0, 0, 45, 27)], z: 3, comp: 'main', fill: [['upper', [box(0, 25, 45, 29)]], ['padL', [box(0, 19, 13, 23)]], ['padR', [box(32, 19, 45, 23)]]] },
        ...breathe(56, 45, 75),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0] }, padL: { dy: ['tab', 'NOD', 1, 2] }, padR: { dy: ['tab', 'NOD', 1, 2] } },
    },
    back: {
      parts: [
        { name: 'padL', polys: [[[12, 30], [18, 30], [20, 34], [20, 53], [14, 54], [5, 53], [5, 40]]], z: 3, comp: 'main', fill: [['upper', [box(5, 28, 22, 55)]]] },
        { name: 'padR', polys: [[[41, 30], [53, 30], [56, 36], [56, 40], [68, 40], [68, 59], [46, 59], [41, 50]]], z: 3, comp: 'main', fill: [['upper', [box(39, 28, 68, 60)]]] },
        { name: 'head', polys: [box(0, 0, 68, 29)], z: 3, comp: 'main', fill: [['upper', [box(0, 27, 68, 31)]]] },
        ...breathe(62, 68, 96),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0] }, padL: { dy: ['tab', 'NOD', 1, 2] }, padR: { dy: ['tab', 'NOD', 1, 2] } },
    },
  };

  R.buzzlet = { // wings flutter, antennae twitch
    front: {
      parts: [
        { name: 'wingL', polys: [[[2, 32], [7, 32], [8, 33], [12, 33], [12, 46], [2, 46]]], z: 0, pivot: [13, 40], parent: 'upper', comp: 'main', extend: [box(10, 33, 16, 46)] },
        { name: 'wingR', polys: [[[37, 32], [44, 32], [44, 46], [33, 46], [33, 33], [37, 33]]], z: 0, pivot: [32, 40], parent: 'upper', comp: 'main', extend: [box(29, 33, 35, 46)] },
        { name: 'antL', polys: [box(8, 0, 15, 6)], z: 4, pivot: [12, 7], parent: 'upper', comp: 'main', fill: [['upper', [box(8, 5, 15, 8)]]] },
        { name: 'antR', polys: [box(29, 0, 36, 6)], z: 4, pivot: [32, 7], parent: 'upper', comp: 'main', fill: [['upper', [box(29, 5, 36, 8)]]] },
        ...breathe(52, 45, 64),
      ],
      anim: { upper: BOB, wingL: { ang: ['tab', 'BUZZ', -6, 0] }, wingR: { ang: ['tab', 'BUZZ', 6, 0] }, antL: { ang: ['twitch', -9, 5] }, antR: { ang: ['twitch', 9, 15] } },
    },
    back: {
      parts: [
        { name: 'wingL', polys: [[[0, 37], [10, 37], [10, 39], [13, 39], [13, 40], [14, 40], [14, 41], [17, 41], [17, 54], [0, 54]]], z: 3, pivot: [17, 45], parent: 'upper', comp: 'main', fill: [['upper', [box(5, 37, 38, 56)]]] },
        { name: 'wingR', polys: [box(18, 37, 38, 56)], z: 3, pivot: [18, 45], parent: 'upper', comp: 'main', fill: [['upper', [box(5, 37, 38, 56)]]] },
        { name: 'antL', polys: [box(14, 0, 22, 9)], z: 4, pivot: [18, 10], parent: 'upper', comp: 'main', fill: [['upper', [box(14, 8, 22, 11)]]] },
        { name: 'antR', polys: [box(40, 0, 50, 9)], z: 4, pivot: [43, 10], parent: 'upper', comp: 'main', fill: [['upper', [box(40, 8, 50, 11)]]] },
        ...breathe(62, 53, 85),
      ],
      anim: { upper: BOB, wingL: { ang: ['tab', 'BUZZ', -5, 0] }, wingR: { ang: ['tab', 'BUZZ', 5, 0] }, antL: { ang: ['twitch', -9, 5] }, antR: { ang: ['twitch', 9, 15] } },
    },
  };

  R.saguarose = { // the sun hat settles after the breath, the cactus-pad arms a beat later
    front: {
      parts: [
        { name: 'padL', polys: [box(0, 33, 16, 52)], z: 3, comp: 'main', fill: [['upper', [box(0, 33, 19, 53)]]] },
        { name: 'padR', polys: [box(39, 33, 56, 52)], z: 3, comp: 'main', fill: [['upper', [box(36, 37, 56, 53)]]] },
        { name: 'hat', polys: [[[0, 0], [57, 0], [57, 25], [45, 25], [41, 22], [40, 16], [33, 16], [14, 15], [13, 22], [8, 23], [0, 23]]], z: 4, pivot: [27, 15],
          comp: 'main', fill: [['upper', [box(0, 12, 57, 27)]]] },
        ...breathe(57, 56, 76),
      ],
      anim: { upper: BOB, hat: { dy: ['tab', 'NOD', 1, 2], ang: ['tab', 'SWAY', 0.5, 2] }, padL: { dy: ['tab', 'NOD', 1, 2] }, padR: { dy: ['tab', 'NOD', 1, 2] } },
    },
    back: {
      parts: [
        { name: 'padR', polys: [[[41, 26], [55, 26], [55, 52], [39, 52], [39, 30], [41, 30]]], z: 3, comp: 'main', fill: [['upper', [box(36, 26, 55, 53)]]] },
        { name: 'hat', polys: [[[0, 0], [55, 0], [55, 22], [42, 22], [38, 25], [30, 29], [26, 30], [0, 30]]], z: 4, pivot: [27, 28],
          comp: 'main', fill: [['upper', [box(10, 20, 55, 32)]]] }, // the brim's left overhang has air under it
        ...breathe(62, 55, 86),
      ],
      anim: { upper: BOB, hat: { dy: ['tab', 'NOD', 1, 2] }, padR: { dy: ['tab', 'NOD', 1, 2] } },
    },
  };

  R.pricklepot = { // the flower on top sways
    front: {
      parts: [
        { name: 'flower', polys: [box(8, 0, 19, 7)], z: 4, pivot: [13, 8], parent: 'upper', comp: 'main', fill: [['upper', [box(8, 5, 19, 9)]]] },
        ...breathe(46, 26, 62),
      ],
      anim: { upper: BOB, flower: { ang: ['tab', 'SWAY', 5, 2], dy: ['tab', 'NOD', 1, 2] } },
    },
    back: {
      parts: [
        { name: 'flower', polys: [box(13, 0, 27, 9)], z: 4, pivot: [20, 10], parent: 'upper', comp: 'main', fill: [['upper', [box(13, 7, 27, 11)]]] },
        ...breathe(60, 38, 83),
      ],
      anim: { upper: BOB, flower: { ang: ['tab', 'SWAY', 5, 2], dy: ['tab', 'NOD', 1, 2] } },
    },
  };

  R.chiseltail = { // bushy tail sways, hood ears twitch
    front: {
      parts: [
        { name: 'tail', polys: [[[29, 24], [38, 24], [38, 50], [28, 50], [28, 42]]], z: 0, pivot: [30, 46], comp: 'main', extend: [box(24, 30, 31, 50)] },
        { name: 'earL', polys: [box(4, 0, 12, 5)], z: 4, pivot: [8, 6], parent: 'upper', comp: 'main', fill: [['upper', [box(4, 4, 12, 7)]]] },
        { name: 'earR', polys: [box(21, 0, 29, 5)], z: 4, pivot: [25, 6], parent: 'upper', comp: 'main', fill: [['upper', [box(21, 4, 29, 7)]]] },
        ...breathe(44, 38, 60),
      ],
      anim: { upper: BOB, tail: { ang: ['tab', 'SWAY', 2, 0] }, earL: { ang: ['twitch', -10, 8] }, earR: { ang: ['twitch', 10, 9] } },
    },
    back: {
      parts: [
        { name: 'tail', polys: [[[0, 36], [24, 36], [28, 50], [26, 64], [12, 64], [0, 58]]], z: 3, pivot: [24, 58], comp: 'main',
          fill: [['upper', [box(10, 36, 30, 59)]], ['lower', [box(10, 60, 30, 66)]]] },
        { name: 'ear', polys: [box(34, 0, 45, 7)], z: 4, pivot: [38, 8], parent: 'upper', comp: 'main', fill: [['upper', [box(33, 3, 46, 10)]]] },
        ...breathe(60, 50, 80),
      ],
      anim: { upper: BOB, tail: { ang: ['tab', 'SWAY', -2, 0] }, ear: { ang: ['twitch', 8, 9] } },
    },
  };

  // ---------------------------------------------------------------- batch 2
  R.quarrel = { // striped tail sways, hood ear twitches
    front: {
      parts: [
        { name: 'tail', polys: [[[45, 38], [61, 38], [61, 64], [42, 64], [42, 57], [44, 50], [45, 45]]], z: 0, pivot: [44, 59], comp: 'main', extend: [box(38, 50, 47, 64)] },
        { name: 'ear', polys: [box(32, 0, 40, 6)], z: 4, pivot: [36, 7], parent: 'upper', comp: 'main', fill: [['upper', [box(32, 5, 40, 8)]]] },
        ...breathe(62, 61, 76),
      ],
      anim: { upper: BOB, tail: { ang: ['tab', 'SWAY', 2, 0] }, ear: { ang: ['twitch', 10, 9] } },
    },
    back: {
      parts: [
        { name: 'tail', polys: [[[0, 48], [22, 48], [32, 60], [32, 72], [0, 74]]], z: 3, pivot: [30, 64], comp: 'main',
          fill: [['upper', [box(15, 48, 34, 74)]], ['lower', [box(15, 75, 34, 80)]]] },
        { name: 'ear', polys: [box(44, 0, 54, 9)], z: 4, pivot: [48, 10], parent: 'upper', comp: 'main', fill: [['upper', [box(43, 7, 55, 12)]]] },
        ...breathe(75, 61, 91),
      ],
      anim: { upper: BOB, tail: { ang: ['tab', 'SWAY', -2, 0] }, ear: { ang: ['twitch', 8, 9] } },
    },
  };

  R.cocoona = { // a pupa: the cocoon breathes and her head settles a beat later
    front: {
      parts: [
        { name: 'head', polys: [box(8, 8, 35, 31)], z: 3, comp: 'main', fill: [['upper', [box(6, 6, 37, 33)]]] },
        ...breathe(50, 43, 71),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0] } },
    },
    back: {
      parts: [
        { name: 'head', polys: [box(14, 0, 52, 33)], z: 3, comp: 'main', fill: [['upper', [box(12, 0, 52, 35)]]] },
        ...breathe(60, 52, 89),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0] } },
    },
  };

  R.craggoth = { // crystal shards float around her
    front: {
      parts: [
        { name: 's1', polys: [box(5, 15, 14, 26)], z: 5, comp: 'floater' },
        { name: 's2', polys: [box(2, 28, 9, 37)], z: 5, comp: 'floater' },
        { name: 's3', polys: [box(51, 15, 59, 26)], z: 5, comp: 'floater' },
        { name: 's4', polys: [box(55, 24, 63, 34)], z: 5, comp: 'floater' },
        ...breathe(66, 65, 85),
      ],
      anim: { upper: BOB, s1: { dy: ['float', 0.5, 1.4] }, s2: { dy: ['float', 2.6, 1.4] }, s3: { dy: ['float', 4.1, 1.4] }, s4: { dy: ['float', 1.5, 1.4] } },
    },
    back: {
      parts: [
        { name: 's1', polys: [box(18, 15, 28, 31)], z: 5, comp: 'floater' },
        { name: 's2', polys: [box(16, 29, 22, 41)], z: 5, comp: 'floater' },
        { name: 's3', polys: [box(66, 24, 74, 36)], z: 5, comp: 'floater' },
        { name: 's4', polys: [box(65, 36, 72, 47)], z: 5, comp: 'floater' },
        ...breathe(70, 76, 108),
      ],
      anim: { upper: BOB, s1: { dy: ['float', 0.5, 1.4] }, s2: { dy: ['float', 2.6, 1.4] }, s3: { dy: ['float', 4.1, 1.4] }, s4: { dy: ['float', 4.1, 1.4] } }, // s3/s4 drift together so they never touch
    },
  };

  R.daisia = { // hair curls follow the breath, skirt petals flutter
    front: {
      parts: [
        { name: 'curlL', polys: [box(0, 31, 7, 41)], z: 3, comp: 'main', fill: [['upper', [box(0, 27, 9, 34)]]] },
        { name: 'curlR', polys: [box(44, 31, 51, 41)], z: 3, comp: 'main', fill: [['upper', [box(42, 27, 51, 34)]]] },
        ...breathe(66, 51, 78),
      ],
      anim: { upper: BOB, curlL: { dy: ['tab', 'NOD', 1, 0] }, curlR: { dy: ['tab', 'NOD', 1, 0] } },
    },
    back: {
      parts: [
        { name: 'petalL', polys: [box(0, 60, 10, 80)], z: 3, pivot: [11, 68], parent: 'upper', comp: 'main', fill: [['upper', [box(0, 58, 13, 81)]]] },
        { name: 'petalR', polys: [box(52, 62, 62, 82)], z: 3, pivot: [51, 70], parent: 'upper', comp: 'main', fill: [['upper', [box(49, 60, 62, 82)]]] },
        ...breathe(83, 62, 100),
      ],
      anim: { upper: BOB, petalL: { ang: ['tab', 'SWAY', -2, 0] }, petalR: { ang: ['tab', 'SWAY', 1, 1] } },
    },
  };

  R.daisip = { // the flower head settles a beat after the breath (petal rings are too thin-lined to turn)
    front: {
      parts: [
        { name: 'head', polys: [box(0, 0, 40, 30)], z: 3, comp: 'main', fill: [['upper', [box(0, 0, 40, 32)]]] },
        ...breathe(50, 40, 62),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0] } },
    },
    back: {
      parts: [
        { name: 'head', polys: [box(0, 0, 51, 44)], z: 3, comp: 'main', fill: [['upper', [box(0, 0, 51, 46)]]] },
        ...breathe(62, 51, 82),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0] } },
    },
  };

  R.dozala = { // round ears wiggle
    front: {
      parts: [
        { name: 'earL', polys: [box(0, 0, 10, 16)], z: 4, pivot: [10, 14], parent: 'upper', comp: 'main', fill: [['upper', [box(0, 10, 14, 18)]]] },
        { name: 'earR', polys: [box(34, 0, 44, 16)], z: 4, pivot: [34, 14], parent: 'upper', comp: 'main', fill: [['upper', [box(30, 10, 44, 18)]]] },
        ...breathe(45, 44, 62),
      ],
      anim: { upper: BOB, earL: { dy: ['twitch', -1, 8] }, earR: { dy: ['twitch', -1, 13] } }, // ears perk up
    },
    back: {
      parts: [
        { name: 'earL', polys: [box(0, 0, 12, 18)], z: 4, pivot: [12, 17], parent: 'upper', comp: 'main', fill: [['upper', [box(0, 13, 16, 20)]]] },
        { name: 'earR', polys: [box(36, 0, 48, 20)], z: 4, pivot: [36, 19], parent: 'upper', comp: 'main', fill: [['upper', [box(32, 15, 48, 22)]]] },
        ...breathe(58, 48, 83),
      ],
      anim: { upper: BOB, earL: { dy: ['twitch', -1, 8] }, earR: { dy: ['twitch', -1, 13] } }, // ears perk up
    },
  };

  // ---------------------------------------------------------------- batch 3
  R.wyvrant = { // wings lift on the in-breath, tail sways
    front: {
      parts: [
        { name: 'wingL', polys: [box(0, 20, 23, 54)], z: 0, pivot: [25, 34], parent: 'upper', comp: 'main', extend: [box(20, 20, 30, 54)] },
        { name: 'wingR', polys: [[[59, 18], [83, 18], [83, 52], [66, 52], [66, 48], [59, 48]]], z: 0, pivot: [57, 34], parent: 'upper', comp: 'main', extend: [box(52, 18, 62, 54)] },
        { name: 'tail', polys: [[[53, 49], [66, 49], [66, 53], [83, 53], [83, 76], [57, 76], [57, 62]]], z: 0, pivot: [55, 62], comp: 'main', extend: [box(48, 54, 58, 74)] },
        ...breathe(60, 83, 80),
      ],
      anim: { upper: BOB, wingL: { ang: ['tab', 'OPEN', 1.25, 0] }, wingR: { ang: ['tab', 'OPEN', -1.25, 0] }, tail: { ang: ['tab', 'SWAY', 1.5, 0] } },
    },
    back: {
      parts: [
        { name: 'wingL', polys: [box(0, 18, 26, 55)], z: 3, pivot: [27, 35], parent: 'upper', comp: 'main', fill: [['upper', [box(18, 18, 32, 56)]]] },
        { name: 'wingR', polys: [box(57, 18, 76, 56)], z: 3, pivot: [55, 35], parent: 'upper', comp: 'main', fill: [['upper', [box(50, 18, 62, 56)]]] },
        { name: 'tail', polys: [[[0, 50], [12, 50], [30, 56], [30, 60], [25, 63], [23, 66], [21, 69], [0, 78]]], z: 3, pivot: [34, 56], comp: 'main',
          fill: [['upper', [box(16, 50, 34, 58)]], ['lower', [box(14, 56, 40, 65), box(25, 65, 40, 78)]]] },
        { name: 'lower', polys: [box(0, 62, 76, 80)], z: 1, comp: 'main' },
        // the tail root sits above the seam, so the hips under it fill deeper than the usual 3px band
        { name: 'upper', polys: null, z: 2, pivot: [0, 62], fill: [['lower', [box(0, 59, 76, 62), box(22, 50, 40, 62)]]] },
      ],
      anim: { upper: BOB, wingL: { ang: ['tab', 'OPEN', 1.25, 0] }, wingR: { ang: ['tab', 'OPEN', -1.25, 0] }, tail: { ang: ['tab', 'SWAY', -1.5, 0] } },
    },
  };

  R.smolava = { // little wings flap, tail sways
    front: {
      parts: [
        { name: 'wingL', polys: [box(0, 32, 12, 46)], z: 0, pivot: [14, 38], parent: 'upper', comp: 'main', extend: [box(10, 32, 16, 46)] },
        { name: 'wingR', polys: [box(41, 32, 54, 46)], z: 0, pivot: [39, 38], parent: 'upper', comp: 'main', extend: [box(37, 32, 44, 46)] },
        { name: 'tail', polys: [box(42, 46, 54, 58)], z: 0, pivot: [40, 52], comp: 'main', extend: [box(37, 46, 43, 58)] },
        ...breathe(52, 54, 64),
      ],
      anim: { upper: BOB, wingL: { ang: ['tab', 'OPEN', 2, 0] }, wingR: { ang: ['tab', 'OPEN', -2, 0] }, tail: { ang: ['tab', 'SWAY', 2, 0] } },
    },
    back: {
      parts: [
        { name: 'wingL', polys: [box(0, 38, 19, 57)], z: 3, pivot: [21, 46], parent: 'upper', comp: 'main', fill: [['upper', [box(10, 38, 24, 58)]]] },
        { name: 'wingR', polys: [box(32, 42, 48, 56)], z: 3, pivot: [33, 47], parent: 'upper', comp: 'main', fill: [['upper', [box(30, 40, 50, 58)]]] },
        { name: 'tail', polys: [[[0, 62], [16, 62], [22, 66], [22, 70], [15, 72], [13, 74], [0, 76]]], z: 3, pivot: [24, 66], comp: 'main', fill: [['lower', [box(16, 62, 28, 72)]]] },
        ...breathe(60, 57, 79),
      ],
      anim: { upper: BOB, wingL: { ang: ['tab', 'OPEN', 2, 0] }, wingR: { ang: ['tab', 'OPEN', -2, 1] }, tail: { ang: ['tab', 'SWAY', -2, 0] } },
    },
  };

  R.empyress = { // great wings open on the in-breath
    front: { // the wings fan out from low on the wing, so the hem never tears
      parts: [
        { name: 'wingL', polys: [[[0, 0], [26, 0], [26, 36], [22, 48], [18, 60], [15, 67], [0, 67]]], z: 0, pivot: [16, 68], parent: 'upper', comp: 'main', extend: [box(20, 0, 32, 67)] },
        { name: 'wingR', polys: [[[66, 0], [92, 0], [92, 67], [77, 67], [74, 60], [70, 48], [66, 36]]], z: 0, pivot: [76, 68], parent: 'upper', comp: 'main', extend: [box(60, 0, 72, 67)] },
        ...breathe(70, 92, 88),
      ],
      anim: { upper: BOB, wingL: { ang: ['tab', 'OPEN', -1.25, 0] }, wingR: { ang: ['tab', 'OPEN', 1.25, 1] } },
    },
    back: {
      parts: [
        { name: 'wingL', polys: [[[0, 5], [28, 5], [30, 20], [28, 40], [20, 68], [0, 68]]], z: 3, pivot: [31, 24], parent: 'upper', comp: 'main', fill: [['upper', [box(20, 5, 36, 68)]]] },
        { name: 'wingR', polys: [[[56, 5], [84, 5], [84, 68], [64, 68], [56, 40], [54, 20]]], z: 3, pivot: [53, 24], parent: 'upper', comp: 'main', fill: [['upper', [box(48, 5, 64, 68)]]] },
        ...breathe(72, 84, 88),
      ],
      anim: { upper: BOB, wingL: { ang: ['tab', 'OPEN', -1.25, 0] }, wingR: { ang: ['tab', 'OPEN', 1.25, 1] } },
    },
  };

  R.rockabye = { // the stone hood settles a beat after the breath
    front: {
      parts: [
        { name: 'head', polys: [box(0, 0, 36, 29)], z: 3, pivot: [18, 29], comp: 'main', fill: [['upper', [box(0, 0, 36, 31)]]] },
        ...breathe(48, 36, 60),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] } }, // a lullaby rock
    },
    back: {
      parts: [
        { name: 'hand', polys: [[[36, 30], [44, 30], [44, 42], [32, 42], [32, 34], [35, 33]]], z: 4, pivot: [35, 40], parent: 'upper', comp: 'main', fill: [['upper', [box(32, 38, 42, 43)]]] },
        { name: 'head', polys: [box(0, 0, 42, 33)], z: 3, pivot: [21, 33], comp: 'main', fill: [['upper', [box(0, 0, 44, 30), box(0, 30, 33, 35)]]] }, // not into the air by the hand
        ...breathe(66, 44, 80),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', -1.5, 2] }, hand: { ang: ['tab', 'FLICK', 2, 0] } },
    },
  };

  R.amethystar = { // sparkles and the gem halo float
    front: {
      parts: [
        { name: 'sp1', polys: [box(3, 28, 10, 35)], z: 5, comp: 'floater' },
        { name: 'sp2', polys: [box(37, 28, 44, 35)], z: 5, comp: 'floater' },
        { name: 'sp3', polys: [box(0, 42, 5, 52)], z: 5, comp: 'floater' },
        { name: 'sp4', polys: [box(40, 48, 45, 56)], z: 5, comp: 'floater' },
        { name: 'halo', polys: [box(0, 0, 45, 7), [[0, 7], [9, 7], [9, 14], [8, 21], [7, 25], [0, 25]], [[33, 6], [45, 6], [45, 25], [36, 25], [36, 13], [33, 11]]], z: 4, parent: 'upper' },
        ...breathe(66, 45, 80),
      ],
      anim: { upper: BOB, halo: { dy: ['float', 3.0, 1.4] }, sp1: { dy: ['float', 0.5, 1.4] }, sp2: { dy: ['float', 2.6, 1.4] }, sp3: { dy: ['float', 4.1, 1.4] }, sp4: { dy: ['float', 1.5, 1.4] } },
    },
    back: {
      parts: [
        { name: 'head', polys: [box(0, 0, 42, 35)], z: 3, pivot: [21, 35], comp: 'main', fill: [['upper', [box(0, 33, 42, 37)]]] }, // the ruff is welded to the hood
        ...breathe(72, 42, 87),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1, 2] } },
    },
  };

  R.geodrusa = { // the crystal hood rocks and settles after the breath
    front: {
      parts: [
        { name: 'head', polys: [box(0, 0, 38, 35)], z: 3, pivot: [19, 34], comp: 'main', fill: [['upper', [box(0, 0, 38, 37)]]] },
        ...breathe(62, 38, 76),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.25, 2] } },
    },
    back: {
      parts: [
        { name: 'hand', polys: [box(38, 40, 47, 50)], z: 4, pivot: [40, 50], parent: 'upper', comp: 'main', fill: [['upper', [box(36, 46, 47, 52)]]] },
        { name: 'head', polys: [box(0, 0, 47, 40)], z: 3, pivot: [23, 40], comp: 'main', fill: [['upper', [box(0, 0, 47, 42)]]] },
        ...breathe(80, 47, 98),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', -1.25, 2] }, hand: { ang: ['twitch', 8, 5] } },
    },
  };

  // ---------------------------------------------------------------- batch 4
  R.hootamo = { // owl ear tufts twitch, the cape wings flare (front), the scroll hand waves (back)
    front: {
      parts: [
        { name: 'earL', polys: [[[2, 0], [12, 0], [15, 9], [12, 13], [2, 13]]], z: 4, pivot: [12, 13], parent: 'upper', comp: 'main', fill: [['upper', [box(2, 10, 15, 15)]]] },
        { name: 'earR', polys: [[[31, 9], [34, 0], [45, 0], [45, 13], [34, 13]]], z: 4, pivot: [34, 13], parent: 'upper', comp: 'main', fill: [['upper', [box(31, 10, 45, 15)]]] },
        { name: 'capeL', polys: [box(0, 30, 11, 66)], z: 0.5, pivot: [12, 32], parent: 'upper', comp: 'main', extend: [box(9, 30, 16, 66)] },
        { name: 'capeR', polys: [box(38, 30, 49, 66)], z: 0.5, pivot: [37, 32], parent: 'upper', comp: 'main', extend: [box(33, 30, 40, 66)] },
        ...breathe(58, 49, 78),
      ],
      anim: { upper: BOB, earL: { ang: ['twitch', -12, 8] }, earR: { ang: ['twitch', 12, 13] }, capeL: { ang: ['tab', 'OPEN', -1.25, 1] }, capeR: { ang: ['tab', 'OPEN', 1.25, 1] } },
    },
    back: {
      parts: [
        { name: 'hand', polys: [box(41, 32, 54, 50)], z: 3, pivot: [43, 49], parent: 'upper', comp: 'main', fill: [['upper', [box(39, 44, 46, 52)]]] },
        { name: 'earL', polys: [[[6, 0], [16, 0], [18, 9], [16, 13], [6, 13]]], z: 4, pivot: [16, 13], parent: 'upper', comp: 'main', fill: [['upper', [box(6, 10, 18, 15)]]] },
        { name: 'earR', polys: [[[36, 9], [38, 0], [48, 0], [48, 13], [38, 13]]], z: 4, pivot: [38, 13], parent: 'upper', comp: 'main', fill: [['upper', [box(36, 10, 48, 15)]]] },
        ...breathe(60, 54, 80),
      ],
      anim: { upper: BOB, hand: { ang: ['tab', 'SWAY', 2, 1] }, earL: { ang: ['twitch', -10, 8] }, earR: { ang: ['twitch', 10, 13] } },
    },
  };

  R.tomibou = { // striped wings flap, hood ears twitch, the striped tail sways
    front: {
      parts: [
        { name: 'earL', polys: [box(0, 0, 7, 5)], z: 4, pivot: [5, 6], parent: 'upper', comp: 'main', fill: [['upper', [box(0, 4, 8, 7)]]] },
        { name: 'earR', polys: [box(29, 0, 36, 5)], z: 4, pivot: [31, 6], parent: 'upper', comp: 'main', fill: [['upper', [box(28, 4, 36, 7)]]] },
        { name: 'wingL', polys: [box(1, 35, 9, 50)], z: 0.5, pivot: [9, 37], parent: 'upper', comp: 'main', extend: [box(7, 35, 13, 50)] },
        { name: 'wingR', polys: [box(28, 35, 36, 50)], z: 0.5, pivot: [28, 37], parent: 'upper', comp: 'main', extend: [box(24, 35, 30, 50)] },
        ...breathe(46, 36, 64),
      ],
      anim: { upper: BOB, earL: { ang: ['twitch', -12, 8] }, earR: { ang: ['twitch', 12, 13] }, wingL: { ang: ['tab', 'OPEN', -1.5, 1] }, wingR: { ang: ['tab', 'OPEN', 1.5, 1] } },
    },
    back: {
      parts: [
        { name: 'tail', polys: [box(37, 41, 52, 66)], z: 3, pivot: [37, 52], parent: 'upper', comp: 'main', fill: [['upper', [box(34, 43, 41, 60)]]] },
        { name: 'earL', polys: [box(7, 0, 16, 8)], z: 4, pivot: [12, 9], parent: 'upper', comp: 'main', fill: [['upper', [box(7, 7, 16, 10)]]] },
        { name: 'earR', polys: [box(40, 0, 51, 8)], z: 4, pivot: [44, 9], parent: 'upper', comp: 'main', fill: [['upper', [box(40, 7, 51, 10)]]] },
        ...breathe(62, 52, 85),
      ],
      anim: { upper: BOB, tail: { ang: ['tab', 'SWAY', 2, 0] }, earL: { ang: ['twitch', -8, 8] }, earR: { ang: ['twitch', 8, 13] } },
    },
  };

  R.hunnibloom = { // bee wings flutter, antennae twitch
    front: {
      parts: [
        { name: 'wingL', polys: [[[0, 20], [17, 20], [17, 56], [6, 56], [6, 42], [0, 42]]], z: 0, pivot: [17, 42], parent: 'upper', extend: [box(13, 33, 20, 56)] },
        { name: 'wingR', polys: [box(50, 24, 66, 55)], z: 0, pivot: [50, 40], parent: 'upper', comp: 'main', extend: [box(48, 26, 52, 53)] },
        { name: 'antL', polys: [box(20, 0, 29, 8)], z: 4, pivot: [25, 9], parent: 'upper', comp: 'main', fill: [['upper', [box(20, 7, 29, 10)]]] },
        { name: 'antR', polys: [box(40, 0, 49, 6)], z: 4, pivot: [44, 7], parent: 'upper', comp: 'main', fill: [['upper', [box(40, 5, 49, 8)]]] },
        ...breathe(58, 67, 78),
      ],
      anim: { upper: BOB, wingL: { ang: ['tab', 'BUZZ', -4, 0] }, wingR: { ang: ['tab', 'BUZZ', 4, 0] }, antL: { ang: ['twitch', -9, 5] }, antR: { ang: ['twitch', 9, 15] } },
    },
    back: {
      parts: [
        { name: 'wingL', polys: [box(0, 36, 20, 70)], z: 3, pivot: [22, 50], parent: 'upper', comp: 'main', fill: [['upper', [box(16, 36, 26, 70)]]] },
        { name: 'antL', polys: [box(28, 0, 38, 10)], z: 4, pivot: [33, 11], parent: 'upper', comp: 'main', fill: [['upper', [box(28, 9, 38, 12)]]] },
        { name: 'antR', polys: [box(54, 0, 66, 12)], z: 4, pivot: [56, 14], parent: 'upper', comp: 'main', fill: [['upper', [box(52, 11, 60, 15)]]] },
        ...breathe(78, 87, 102),
      ],
      anim: { upper: BOB, wingL: { ang: ['tab', 'BUZZ', -5, 0] }, antL: { ang: ['twitch', -9, 5] }, antR: { ang: ['twitch', 9, 15] } },
    },
  };

  R.jerbix = { // big ears twitch, the tail tuft bobs (front) or swings (back)
    front: {
      parts: [
        { name: 'tail', polys: [box(0, 52, 8, 61)], z: 0, comp: 'main', extend: [box(6, 50, 12, 62)] },
        { name: 'earL', polys: [[[3, 0], [13, 0], [15, 8], [13, 13], [3, 13]]], z: 4, pivot: [11, 13], parent: 'upper', comp: 'main', fill: [['upper', [box(3, 10, 15, 15)]]] },
        { name: 'earR', polys: [[[20, 0], [33, 0], [33, 12], [24, 13], [20, 8]]], z: 4, pivot: [25, 13], parent: 'upper', comp: 'main', fill: [['upper', [box(20, 10, 33, 15)]]] },
        ...breathe(50, 37, 76),
      ],
      anim: { upper: BOB, tail: { dy: ['tab', 'SWAY', 0.5, 0] }, earL: { ang: ['twitch', -7, 8] }, earR: { ang: ['twitch', 7, 13] } },
    },
    back: {
      parts: [
        { name: 'tail', polys: [box(0, 66, 17, 82)], z: 0.5, pivot: [18, 72], comp: 'main', extend: [box(14, 62, 24, 78)] },
        { name: 'earL', polys: [[[12, 0], [24, 0], [26, 10], [24, 16], [12, 16]]], z: 4, pivot: [21, 16], parent: 'upper', comp: 'main', fill: [['upper', [box(12, 13, 26, 18)]]] },
        { name: 'earR', polys: [[[33, 10], [35, 0], [48, 0], [48, 15], [35, 16]]], z: 4, pivot: [37, 16], parent: 'upper', comp: 'main', fill: [['upper', [box(33, 13, 48, 18)]]] },
        ...breathe(68, 56, 98),
      ],
      anim: { upper: BOB, tail: { ang: ['tab', 'SWAY', -2, 0] }, earL: { ang: ['twitch', -8, 8] }, earR: { ang: ['twitch', 8, 13] } },
    },
  };

  R.kumara = { // the head rocks after the breath, ears twitch, the boxing gloves bounce
    front: {
      parts: [
        { name: 'gloveL', polys: [box(0, 46, 13, 61)], z: 3, comp: 'main', fill: [['upper', [box(0, 44, 15, 61)]]] },
        { name: 'gloveR', polys: [box(34, 46, 47, 61)], z: 3, comp: 'main', fill: [['upper', [box(32, 44, 47, 61)]]] },
        { name: 'earL', polys: [box(3, 0, 16, 11)], z: 4, pivot: [12, 11], parent: 'head', comp: 'main', fill: [['head', [box(3, 9, 16, 13)]]] },
        { name: 'earR', polys: [box(32, 0, 45, 11)], z: 4, pivot: [35, 11], parent: 'head', comp: 'main', fill: [['head', [box(32, 9, 45, 13)]]] },
        { name: 'head', polys: [box(0, 0, 47, 35)], z: 3, pivot: [23, 35], comp: 'main', fill: [['upper', [box(0, 33, 47, 37)]]] },
        ...breathe(60, 47, 78),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, gloveL: { dy: ['tab', 'FLICK', 0.5, 0] }, gloveR: { dy: ['tab', 'FLICK', 0.5, 0] },
        earL: { ang: ['twitch', -10, 8] }, earR: { ang: ['twitch', 10, 13] } },
    },
    back: {
      parts: [
        { name: 'glove', polys: [box(48, 40, 66, 61)], z: 3, pivot: [50, 56], comp: 'main', fill: [['upper', [box(44, 38, 66, 61)]]] },
        { name: 'earL', polys: [box(18, 0, 30, 9)], z: 4, pivot: [24, 10], parent: 'upper', comp: 'main', fill: [['upper', [box(18, 8, 30, 11)]]] },
        { name: 'earR', polys: [box(46, 0, 58, 11)], z: 4, pivot: [50, 12], parent: 'upper', comp: 'main', fill: [['upper', [box(46, 10, 58, 13)]]] },
        ...breathe(70, 66, 99),
      ],
      anim: { upper: BOB, glove: { dy: ['tab', 'NOD', 1, 2], ang: ['tab', 'SWAY', 2, 2] }, earL: { ang: ['twitch', -9, 8] }, earR: { ang: ['twitch', 9, 13] } },
    },
  };

  R.kumazen = { // sleepy: the head rocks after the breath and the paws a beat after that, ears twitch
    front: {
      parts: [
        { name: 'pawL', polys: [box(0, 46, 12, 65)], z: 3, comp: 'main', fill: [['upper', [box(0, 44, 14, 66)]]] },
        { name: 'pawR', polys: [box(50, 46, 62, 65)], z: 3, comp: 'main', fill: [['upper', [box(48, 44, 62, 66)]]] },
        { name: 'earL', polys: [[[10, 0], [21, 0], [24, 6], [21, 11], [10, 11]]], z: 4, pivot: [20, 11], parent: 'head', comp: 'main', fill: [['head', [box(10, 9, 24, 12)]]] },
        { name: 'earR', polys: [[[38, 6], [40, 0], [50, 0], [50, 11], [40, 11]]], z: 4, pivot: [41, 11], parent: 'head', comp: 'main', fill: [['head', [box(38, 9, 50, 12)]]] },
        { name: 'head', polys: [box(0, 0, 62, 34)], z: 3, pivot: [31, 34], comp: 'main', fill: [['upper', [box(0, 32, 62, 36)]]] },
        ...breathe(64, 62, 85),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, pawL: { dy: ['tab', 'NOD', 1, 2] }, pawR: { dy: ['tab', 'NOD', 1, 2] }, earL: { ang: ['twitch', -8, 8] }, earR: { ang: ['twitch', 8, 13] } },
    },
    back: {
      parts: [
        { name: 'paw', polys: [box(53, 38, 68, 58)], z: 3, pivot: [55, 56], comp: 'main', fill: [['upper', [box(50, 36, 68, 59)]]] },
        { name: 'earL', polys: [[[20, 0], [30, 0], [32, 5], [30, 9], [20, 9]]], z: 4, pivot: [27, 9], parent: 'upper', comp: 'main', fill: [['upper', [box(20, 7, 32, 10)]]] },
        { name: 'earR', polys: [[[41, 5], [43, 0], [55, 0], [55, 11], [43, 11]]], z: 4, pivot: [45, 11], parent: 'upper', comp: 'main', fill: [['upper', [box(41, 9, 55, 12)]]] },
        ...breathe(70, 68, 97),
      ],
      anim: { upper: BOB, paw: { dy: ['tab', 'NOD', 1, 2], ang: ['tab', 'FLICK', 3, 0] }, earL: { ang: ['twitch', -8, 8] }, earR: { ang: ['twitch', 8, 13] } },
    },
  };

  // ---------------------------------------------------------------- batch 5
  R.kumi = { // the head rocks after the breath, ears twitch, the raised paw waves
    front: {
      parts: [
        { name: 'earL', polys: [box(0, 0, 10, 9)], z: 4, pivot: [7, 10], parent: 'head', comp: 'main', fill: [['head', [box(0, 8, 10, 11)]]] },
        { name: 'earR', polys: [box(33, 0, 43, 9)], z: 4, pivot: [36, 10], parent: 'head', comp: 'main', fill: [['head', [box(33, 8, 43, 11)]]] },
        { name: 'head', polys: [box(0, 0, 43, 33)], z: 3, pivot: [21, 33], comp: 'main', fill: [['upper', [box(0, 31, 43, 35)]]] },
        ...breathe(50, 43, 65),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, earL: { ang: ['twitch', -10, 8] }, earR: { ang: ['twitch', 10, 13] } },
    },
    back: {
      parts: [
        { name: 'paw', polys: [box(40, 41, 53, 56)], z: 4, pivot: [42, 52], parent: 'upper', comp: 'main', fill: [['upper', [box(38, 46, 46, 57)]]] },
        { name: 'earL', polys: [box(9, 0, 23, 10)], z: 4, pivot: [17, 11], parent: 'upper', comp: 'main', fill: [['upper', [box(9, 9, 23, 12)]]] },
        { name: 'earR', polys: [box(38, 0, 50, 12)], z: 4, pivot: [41, 13], parent: 'upper', comp: 'main', fill: [['upper', [box(38, 11, 50, 14)]]] },
        ...breathe(62, 54, 87),
      ],
      anim: { upper: BOB, paw: { ang: ['tab', 'FLICK', 2, 0] }, earL: { ang: ['twitch', -8, 8] }, earR: { ang: ['twitch', 8, 13] } },
    },
  };

  R.lapinade = { // the rose bouquet sways after the breath
    front: {
      parts: [
        { name: 'roses', polys: [box(0, 28, 20, 42)], z: 4, pivot: [18, 40], parent: 'upper', comp: 'main', fill: [['upper', [box(14, 28, 24, 44)]]] },
        ...breathe(64, 88, 87),
      ],
      anim: { upper: BOB, roses: { ang: ['tab', 'SWAY', 3, 2] } },
    },
    back: {
      parts: [
        { name: 'rose', polys: [box(58, 24, 80, 40)], z: 4, pivot: [62, 40], parent: 'upper', comp: 'main', fill: [['upper', [box(56, 36, 66, 42)]]] },
        ...breathe(72, 80, 95),
      ],
      anim: { upper: BOB, rose: { ang: ['tab', 'FLICK', 2, 0] } },
    },
  };

  R.lapinlily = { // long ears twitch, the braid swings, the raised hand waves
    front: {
      parts: [
        { name: 'earL', polys: [box(3, 0, 18, 18)], z: 4, pivot: [13, 19], parent: 'upper', comp: 'main', fill: [['upper', [box(3, 16, 18, 21)]]] },
        { name: 'earR', polys: [box(25, 0, 42, 18)], z: 4, pivot: [30, 19], parent: 'upper', comp: 'main', fill: [['upper', [box(25, 16, 42, 21)]]] },
        { name: 'braid', polys: [[[33, 36], [39, 36], [45, 48], [45, 65], [37, 65], [37, 50], [33, 44]]], z: 3, pivot: [36, 37], parent: 'upper', comp: 'main', fill: [['upper', [box(31, 36, 40, 64)]]] },
        ...breathe(56, 45, 78),
      ],
      anim: { upper: BOB, braid: { ang: ['tab', 'SWAY', 1, 2] }, earL: { ang: ['twitch', -8, 8] }, earR: { ang: ['twitch', 8, 13] } },
    },
    back: {
      parts: [
        { name: 'braid', polys: [box(0, 46, 20, 80)], z: 3, pivot: [22, 47], parent: 'upper', comp: 'main', fill: [['upper', [box(16, 44, 26, 76)]]] },
        { name: 'hand', polys: [box(54, 48, 63, 58)], z: 4, pivot: [54, 54], parent: 'upper', comp: 'main', fill: [['upper', [box(52, 50, 57, 58)]]] },
        { name: 'earL', polys: [box(20, 0, 36, 20)], z: 4, pivot: [28, 22], parent: 'upper', comp: 'main', fill: [['upper', [box(20, 18, 36, 23)]]] },
        { name: 'earR', polys: [box(46, 0, 63, 20)], z: 4, pivot: [50, 22], parent: 'upper', comp: 'main', fill: [['upper', [box(46, 18, 63, 23)]]] },
        ...breathe(76, 63, 104),
      ],
      anim: { upper: BOB, braid: { ang: ['tab', 'SWAY', 1, 2] }, hand: { ang: ['tab', 'FLICK', 2, 0] }, earL: { ang: ['twitch', -6, 8] }, earR: { ang: ['twitch', 6, 13] } },
    },
  };

  R.larkestra = { // music notes drift, the head rocks to the tune
    front: {
      parts: [
        { name: 'notesL', polys: [box(3, 18, 22, 48)], z: 5, comp: 'floater' },
        { name: 'notesR', polys: [box(52, 20, 66, 42)], z: 5, comp: 'floater' },
        { name: 'head', polys: [box(0, 0, 74, 36)], z: 3, pivot: [37, 36], comp: 'main', fill: [['upper', [box(0, 34, 74, 38)]]] },
        ...breathe(62, 74, 85),
      ],
      anim: { upper: BOB, notesL: { dy: ['float', 0.5, 1.4] }, notesR: { dy: ['float', 3.6, 1.4] }, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1, 2] } },
    },
    back: {
      parts: [
        { name: 'notesL', polys: [box(0, 20, 26, 60)], z: 5, comp: 'floater' },
        { name: 'notesR', polys: [box(68, 28, 81, 54)], z: 5, comp: 'floater' },
        { name: 'tail', polys: [box(13, 51, 30, 64)], z: 3, pivot: [31, 60], parent: 'upper', comp: 'main', fill: [['upper', [box(26, 50, 36, 66)]]] },
        ...breathe(72, 81, 102),
      ],
      anim: { upper: BOB, notesL: { dy: ['float', 0.5, 1.4] }, notesR: { dy: ['float', 3.6, 1.4] }, tail: { ang: ['tab', 'SWAY', -2, 1] } },
    },
  };

  R.lyripip = { // music notes drift, wings lift on the breath, tail sways
    front: {
      parts: [
        { name: 'notes', polys: [box(42, 9, 52, 35)], z: 5, comp: 'floater' },
        { name: 'wingL', polys: [box(0, 35, 11, 48)], z: 3, pivot: [12, 41], parent: 'upper', comp: 'main', fill: [['upper', [box(8, 35, 14, 48)]]] },
        { name: 'wingR', polys: [box(41, 35, 52, 48)], z: 3, pivot: [40, 41], parent: 'upper', comp: 'main', fill: [['upper', [box(38, 35, 44, 48)]]] },
        ...breathe(52, 52, 74),
      ],
      anim: { upper: BOB, notes: { dy: ['float', 2.0, 1.4] }, wingL: { ang: ['tab', 'OPEN', 2, 0] }, wingR: { ang: ['tab', 'OPEN', -2, 0] } },
    },
    back: {
      parts: [
        { name: 'notes', polys: [box(66, 8, 80, 45)], z: 5, comp: 'floater' },
        { name: 'tail', polys: [[[0, 58], [11, 58], [17, 65], [17, 82], [0, 82]]], z: 3, pivot: [17, 72], comp: 'main', fill: [['lower', [box(12, 64, 22, 84)]]] },
        ...breathe(70, 80, 95),
      ],
      anim: { upper: BOB, notes: { dy: ['float', 2.0, 1.4] }, tail: { ang: ['tab', 'SWAY', -2, 0] } },
    },
  };

  R.lilyrana = { // the frog hat rocks after the breath, the raised hand waves
    front: {
      parts: [
        { name: 'head', polys: [box(0, 0, 53, 33)], z: 3, pivot: [26, 33], comp: 'main', fill: [['upper', [box(0, 31, 53, 35)]]] },
        ...breathe(56, 53, 77),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] } },
    },
    back: {
      parts: [
        { name: 'hand', polys: [box(52, 46, 62, 58)], z: 4, pivot: [52, 54], parent: 'upper', comp: 'main', fill: [['upper', [box(50, 48, 55, 58)]]] },
        { name: 'hat', polys: [box(0, 0, 62, 29)], z: 4, comp: 'main', fill: [['upper', [box(0, 26, 62, 31)]]] },
        ...breathe(76, 62, 103),
      ],
      anim: { upper: BOB, hat: { dy: ['tab', 'NOD', 1, 2] }, hand: { ang: ['tab', 'FLICK', 2, 0] } },
    },
  };

  NP.art.autospriteRigs = R;
})(typeof globalThis !== 'undefined' ? globalThis : window);
