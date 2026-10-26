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
        { name: 'earL', polys: [[[2, 0], [12, 0], [15, 9], [12, 13], [2, 13]]], z: 4, pivot: [12, 13], parent: 'upper', comp: 'main', fill: [['upper', [box(2, 10, 15, 15), box(11, 0, 16, 13)]]] },
        { name: 'earR', polys: [[[31, 9], [34, 0], [45, 0], [45, 13], [34, 13]]], z: 4, pivot: [34, 13], parent: 'upper', comp: 'main', fill: [['upper', [box(31, 10, 45, 15), box(30, 0, 35, 13)]]] },
        { name: 'capeL', polys: [box(0, 30, 11, 66)], z: 0.5, pivot: [12, 32], parent: 'upper', comp: 'main', extend: [box(9, 30, 16, 66)] },
        { name: 'capeR', polys: [box(38, 30, 49, 66)], z: 0.5, pivot: [37, 32], parent: 'upper', comp: 'main', extend: [box(33, 30, 40, 66)] },
        ...breathe(58, 49, 78),
      ],
      anim: { upper: BOB, earL: { ang: ['twitch', -12, 8] }, earR: { ang: ['twitch', 12, 13] }, capeL: { ang: ['tab', 'OPEN', -1.25, 1] }, capeR: { ang: ['tab', 'OPEN', 1.25, 1] } },
    },
    back: {
      parts: [
        { name: 'hand', polys: [[[43, 32], [54, 32], [54, 50], [41, 50], [41, 43], [43, 41]]], z: 3, pivot: [43, 49], parent: 'upper', comp: 'main', fill: [['upper', [box(39, 44, 46, 52)]]] },
        { name: 'earL', polys: [[[6, 0], [16, 0], [18, 9], [16, 13], [6, 13]]], z: 4, pivot: [16, 13], parent: 'upper', comp: 'main', fill: [['upper', [box(6, 10, 18, 15), box(15, 0, 20, 14)]]] },
        { name: 'earR', polys: [[[36, 9], [38, 0], [48, 0], [48, 13], [38, 13]]], z: 4, pivot: [38, 13], parent: 'upper', comp: 'main', fill: [['upper', [box(36, 10, 48, 15), box(34, 0, 39, 14)]]] },
        ...breathe(60, 54, 80),
      ],
      anim: { upper: BOB, hand: { dx: ['tab', 'SWAY', 0.5, 1] }, earL: { ang: ['twitch', -10, 8] }, earR: { ang: ['twitch', 10, 13] } },
    },
  };

  R.tomibou = { // striped wings flap, hood ears twitch, the striped tail sways
    front: {
      parts: [
        { name: 'earL', polys: [box(0, 0, 7, 5)], z: 4, pivot: [5, 6], parent: 'upper', comp: 'main', fill: [['upper', [box(0, 4, 8, 7)]]] },
        { name: 'earR', polys: [box(29, 0, 36, 5)], z: 4, pivot: [31, 6], parent: 'upper', comp: 'main', fill: [['upper', [box(28, 4, 36, 7), box(27, 0, 30, 5)]]] },
        { name: 'wingL', polys: [box(1, 35, 9, 49)], z: 0.5, pivot: [9, 37], parent: 'upper', comp: 'main', extend: [box(7, 35, 13, 49)] },
        { name: 'wingR', polys: [box(28, 35, 36, 49)], z: 0.5, pivot: [28, 37], parent: 'upper', comp: 'main', extend: [box(24, 35, 30, 49)] },
        ...breathe(51, 36, 64),
      ],
      anim: { upper: BOB, earL: { ang: ['twitch', -12, 8] }, earR: { ang: ['twitch', 12, 13] }, wingL: { ang: ['tab', 'OPEN', -2.5, 1] }, wingR: { ang: ['tab', 'OPEN', 2.5, 1] } },
    },
    back: {
      parts: [
        { name: 'tail', polys: [[[37, 41], [52, 41], [52, 66], [38, 66], [38, 62], [37, 62]]], z: 3, pivot: [37, 52], parent: 'upper', comp: 'main', fill: [['upper', [box(34, 43, 41, 60)]], ['lower', [box(37, 62, 48, 67)]]] },
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
        { name: 'wingL', polys: [box(4, 33, 15, 56)], z: 0, pivot: [17, 42], parent: 'upper', comp: 'main', extend: [box(13, 33, 20, 56)] },
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
        { name: 'earL', polys: [[[2, 0], [16, 0], [16, 9], [13, 13], [2, 13]]], z: 4, parent: 'upper', comp: 'main', fill: [['upper', [box(3, 10, 15, 15)]]] },
        { name: 'earR', polys: [[[20, 0], [36, 0], [36, 13], [24, 13], [20, 8]]], z: 4, parent: 'upper', comp: 'main', fill: [['upper', [box(20, 10, 36, 15)]]] },
        ...breathe(50, 37, 76),
      ],
      anim: { upper: BOB, tail: { dy: ['tab', 'SWAY', 0.5, 0] }, earL: { dx: ['twitch', -1, 8] }, earR: { dx: ['twitch', 1, 13] } }, // thin ear outlines: whole-pixel flicks
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
        { name: 'gloveL', polys: [box(0, 46, 13, 60)], z: 3, comp: 'main', fill: [['upper', [box(0, 44, 15, 60)]], ['lower', [box(0, 58, 15, 62)]]] },
        { name: 'gloveR', polys: [box(34, 46, 47, 60)], z: 3, comp: 'main', fill: [['upper', [box(32, 44, 47, 60)]], ['lower', [box(32, 58, 47, 62)]]] },
        { name: 'earL', polys: [box(3, 0, 16, 11)], z: 4, pivot: [12, 11], parent: 'head', comp: 'main', fill: [['head', [box(3, 9, 16, 13), box(14, 0, 19, 12)]]] },
        { name: 'earR', polys: [box(32, 0, 45, 11)], z: 4, pivot: [35, 11], parent: 'head', comp: 'main', fill: [['head', [box(32, 9, 45, 13), box(29, 0, 34, 12)]]] },
        { name: 'head', polys: [box(0, 0, 47, 35)], z: 3, pivot: [23, 35], comp: 'main', fill: [['upper', [box(0, 33, 47, 37)]]] },
        ...breathe(60, 47, 78),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, gloveL: { dy: ['tab', 'FLICK', 0.5, 0] }, gloveR: { dy: ['tab', 'FLICK', 0.5, 0] },
        earL: { ang: ['twitch', -10, 8] }, earR: { ang: ['twitch', 10, 13] } },
    },
    back: {
      parts: [
        { name: 'glove', polys: [box(48, 40, 66, 61)], z: 3, pivot: [50, 56], parent: 'upper', comp: 'main', fill: [['upper', [box(44, 38, 66, 61)]]] },
        { name: 'earL', polys: [box(18, 0, 30, 9)], z: 4, pivot: [24, 10], parent: 'upper', comp: 'main', fill: [['upper', [box(18, 8, 30, 11), box(28, 0, 33, 11)]]] },
        { name: 'earR', polys: [box(46, 0, 58, 11)], z: 4, pivot: [50, 12], parent: 'upper', comp: 'main', fill: [['upper', [box(46, 10, 58, 13), box(44, 0, 49, 13)]]] },
        ...breathe(70, 66, 99),
      ],
      anim: { upper: BOB, glove: { ang: ['tab', 'SWAY', 2, 2] }, earL: { ang: ['twitch', -9, 8] }, earR: { ang: ['twitch', 9, 13] } },
    },
  };

  R.kumazen = { // sleepy: the head rocks after the breath and the paws a beat after that, ears twitch
    front: {
      parts: [
        { name: 'pawL', polys: [box(0, 46, 12, 65)], z: 3, comp: 'main', fill: [['upper', [box(0, 44, 14, 66)]]] },
        { name: 'pawR', polys: [box(50, 46, 62, 65)], z: 3, comp: 'main', fill: [['upper', [box(48, 44, 62, 66)]]] },
        { name: 'earL', polys: [[[10, 0], [21, 0], [24, 6], [21, 11], [10, 11]]], z: 4, pivot: [20, 11], parent: 'head', comp: 'main', fill: [['head', [box(10, 9, 24, 12), box(19, 0, 25, 12)]]] },
        { name: 'earR', polys: [[[38, 6], [40, 0], [50, 0], [50, 11], [40, 11]]], z: 4, pivot: [41, 11], parent: 'head', comp: 'main', fill: [['head', [box(38, 9, 50, 12), box(37, 0, 43, 12)]]] },
        { name: 'head', polys: [box(0, 0, 62, 34)], z: 3, pivot: [31, 34], comp: 'main', fill: [['upper', [box(0, 32, 62, 36)]]] },
        ...breathe(64, 62, 85),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, pawL: { dy: ['tab', 'NOD', 1, 2] }, pawR: { dy: ['tab', 'NOD', 1, 2] }, earL: { ang: ['twitch', -8, 8] }, earR: { ang: ['twitch', 8, 13] } },
    },
    back: {
      parts: [
        { name: 'paw', polys: [box(53, 38, 68, 58)], z: 3, pivot: [55, 56], comp: 'main', fill: [['upper', [box(50, 36, 68, 59)]]] },
        { name: 'earL', polys: [[[20, 0], [30, 0], [32, 5], [30, 9], [20, 9]]], z: 4, pivot: [27, 9], parent: 'upper', comp: 'main', fill: [['upper', [box(20, 7, 32, 10), box(28, 0, 33, 10)]]] },
        { name: 'earR', polys: [[[41, 5], [43, 0], [55, 0], [55, 11], [43, 11]]], z: 4, pivot: [45, 11], parent: 'upper', comp: 'main', fill: [['upper', [box(41, 9, 55, 12), box(40, 0, 46, 12)]]] },
        ...breathe(70, 68, 97),
      ],
      anim: { upper: BOB, paw: { dy: ['tab', 'NOD', 1, 2], ang: ['tab', 'FLICK', 3, 0] }, earL: { ang: ['twitch', -8, 8] }, earR: { ang: ['twitch', 8, 13] } },
    },
  };

  // ---------------------------------------------------------------- batch 5
  R.kumi = { // the head rocks after the breath, ears twitch, the raised paw waves
    front: {
      parts: [
        { name: 'earL', polys: [[[0, 0], [13, 0], [13, 4], [11, 9], [0, 9]]], z: 4, pivot: [7, 10], parent: 'head', comp: 'main', fill: [['head', [box(0, 8, 10, 11), box(9, 3, 14, 11)]]] },
        { name: 'earR', polys: [[[30, 0], [43, 0], [43, 9], [32, 9], [30, 4]]], z: 4, pivot: [36, 10], parent: 'head', comp: 'main', fill: [['head', [box(33, 8, 43, 11), box(29, 3, 34, 11)]]] },
        { name: 'head', polys: [box(0, 0, 43, 33)], z: 3, pivot: [21, 33], comp: 'main', fill: [['upper', [box(0, 31, 43, 35)]]] },
        ...breathe(50, 43, 65),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, earL: { ang: ['twitch', -10, 8] }, earR: { ang: ['twitch', 10, 13] } },
    },
    back: {
      parts: [
        { name: 'paw', polys: [[[44, 42], [46, 41], [53, 41], [53, 56], [40, 56], [40, 44], [43, 43]]], z: 4, pivot: [40, 50], parent: 'upper', comp: 'main', fill: [['upper', [box(38, 46, 46, 57)]]] },
        { name: 'earL', polys: [box(9, 0, 25, 10)], z: 4, pivot: [17, 11], parent: 'upper', comp: 'main', fill: [['upper', [box(9, 9, 23, 12), box(22, 3, 27, 12)]]] },
        { name: 'earR', polys: [box(38, 0, 50, 12)], z: 4, pivot: [41, 13], parent: 'upper', comp: 'main', fill: [['upper', [box(38, 11, 50, 14), box(36, 4, 41, 14)]]] },
        ...breathe(62, 54, 87),
      ],
      anim: { upper: BOB, paw: { ang: ['tab', 'FLICK', 3, 0] }, earL: { ang: ['twitch', -8, 8] }, earR: { ang: ['twitch', 8, 13] } },
    },
  };

  R.lapinade = { // the rose bouquet sways after the breath
    front: {
      parts: [
        { name: 'roses', polys: [box(0, 28, 20, 42)], z: 4, pivot: [18, 40], parent: 'upper', comp: 'main', fill: [['upper', [box(14, 28, 24, 44), box(10, 40, 24, 44)]]] },
        { name: 'lock', polys: [box(54, 26, 64, 52)], z: 3, pivot: [58, 26], parent: 'upper', comp: 'main', fill: [['upper', [box(52, 26, 66, 54)]]] },
        ...breathe(64, 88, 87),
      ],
      anim: { upper: BOB, roses: { ang: ['tab', 'SWAY', 4, 2] }, lock: { ang: ['tab', 'SWAY', 1, 2] } },
    },
    back: {
      parts: [
        { name: 'rose', polys: [[[61, 18], [80, 18], [80, 40], [58, 40], [58, 24], [61, 24]]], z: 4, pivot: [62, 40], parent: 'upper', comp: 'main', fill: [['upper', [box(56, 36, 66, 42)]]] },
        ...breathe(72, 80, 95),
      ],
      anim: { upper: BOB, rose: { ang: ['tab', 'FLICK', 3, 0] } },
    },
  };

  R.lapinlily = { // long ears twitch, the braid swings, the raised hand waves
    front: {
      parts: [
        { name: 'earL', polys: [box(3, 0, 18, 18)], z: 4, pivot: [13, 19], parent: 'upper', comp: 'main', fill: [['upper', [box(3, 16, 18, 21)]]] },
        { name: 'earR', polys: [box(25, 0, 42, 18)], z: 4, pivot: [30, 19], parent: 'upper', comp: 'main', fill: [['upper', [box(25, 16, 42, 21)]]] },
        { name: 'braid', polys: [[[33, 36], [39, 36], [45, 48], [45, 65], [37, 65], [37, 50], [33, 44]]], z: 3, pivot: [36, 37], parent: 'upper', comp: 'main', fill: [['upper', [box(31, 36, 40, 64)]], ['lower', [box(34, 56, 40, 66)]]] },
        ...breathe(56, 45, 78),
      ],
      anim: { upper: BOB, braid: { ang: ['tab', 'SWAY', 2, 2] }, earL: { ang: ['twitch', -8, 8] }, earR: { ang: ['twitch', 8, 13] } },
    },
    back: {
      parts: [
        { name: 'braid', polys: [[[0, 46], [20, 46], [20, 60], [16, 62], [15, 65], [13, 67], [11, 70], [11, 80], [0, 80]]], z: 3, pivot: [22, 47], parent: 'upper', comp: 'main', fill: [['upper', [box(16, 44, 26, 76)]]] },
        { name: 'hand', polys: [box(54, 48, 63, 58)], z: 4, pivot: [54, 54], parent: 'upper', comp: 'main', fill: [['upper', [box(52, 50, 57, 58)]]] },
        { name: 'earL', polys: [box(20, 0, 36, 20)], z: 4, pivot: [28, 22], parent: 'upper', comp: 'main', fill: [['upper', [box(20, 18, 36, 23)]]] },
        { name: 'earR', polys: [box(46, 0, 63, 20)], z: 4, pivot: [50, 22], parent: 'upper', comp: 'main', fill: [['upper', [box(46, 18, 63, 23)]]] },
        ...breathe(76, 63, 104),
      ],
      anim: { upper: BOB, braid: { ang: ['tab', 'SWAY', 2, 2] }, hand: { ang: ['tab', 'FLICK', 2, 0] }, earL: { ang: ['twitch', -6, 8] }, earR: { ang: ['twitch', 6, 13] } },
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
        { name: 'tail', polys: [box(13, 51, 30, 64)], z: 3, pivot: [31, 60], parent: 'upper', comp: 'main', fill: [['upper', [box(26, 50, 36, 66), [[18, 61], [30, 55], [30, 67], [18, 67]]]]] },
        ...breathe(72, 81, 102),
      ],
      anim: { upper: BOB, notesL: { dy: ['float', 0.5, 1.4] }, notesR: { dy: ['float', 3.6, 1.4] }, tail: { ang: ['tab', 'SWAY', -3, 1] } },
    },
  };

  R.lyripip = { // music notes drift, wings lift on the breath, tail sways
    front: {
      parts: [
        { name: 'note1', polys: [box(45, 9, 52, 18)], z: 5, comp: 'floater' },
        { name: 'note2', polys: [box(45, 18, 52, 27)], z: 5, comp: 'floater' },
        { name: 'note3', polys: [box(42, 27, 52, 35)], z: 5, comp: 'floater' },
        { name: 'wingL', polys: [box(0, 35, 11, 48)], z: 3, pivot: [12, 41], parent: 'upper', comp: 'main', fill: [['upper', [box(8, 35, 14, 48), box(4, 46, 10, 49)]]] },
        { name: 'wingR', polys: [box(41, 35, 52, 48)], z: 3, pivot: [40, 41], parent: 'upper', comp: 'main', fill: [['upper', [box(38, 35, 44, 48)]]] },
        ...breathe(52, 52, 74),
      ],
      anim: { upper: BOB, note1: { dy: ['float', 0.5, 1.4] }, note2: { dy: ['float', 2.6, 1.4] }, note3: { dy: ['float', 4.7, 1.4, true] }, wingL: { ang: ['tab', 'OPEN', 4, 1] }, wingR: { ang: ['tab', 'OPEN', -4, 1] } },
    },
    back: {
      parts: [
        { name: 'note1', polys: [box(66, 8, 80, 20)], z: 5, comp: 'floater' },
        { name: 'note2', polys: [box(66, 20, 80, 33)], z: 5, comp: 'floater' },
        { name: 'note3', polys: [box(66, 33, 80, 45)], z: 5, comp: 'floater' },
        { name: 'tail', polys: [[[0, 58], [11, 58], [17, 65], [17, 82], [0, 82]]], z: 3, pivot: [17, 72], parent: 'upper', comp: 'main',
          fill: [['upper', [[[10, 57], [18, 57], [18, 70], [12, 66]]]], ['lower', [box(12, 64, 22, 84)]]] },
        ...breathe(70, 80, 95),
      ],
      anim: { upper: BOB, note1: { dy: ['float', 0.5, 1.4] }, note2: { dy: ['float', 2.6, 1.4] }, note3: { dy: ['float', 4.7, 1.4] }, tail: { ang: ['tab', 'SWAY', -2, 0] } },
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
        { name: 'arm', polys: [box(46, 47, 62, 60)], z: 4, pivot: [46, 54], parent: 'upper', comp: 'main', fill: [['upper', [box(44, 49, 50, 60)]]] },
        { name: 'hat', polys: [box(0, 0, 62, 29)], z: 4, pivot: [31, 30], comp: 'main', fill: [['upper', [box(12, 26, 50, 31), box(5, 27, 12, 31), box(50, 28, 52, 30)]]] },
        ...breathe(76, 62, 103),
      ],
      anim: { upper: BOB, hat: { dy: ['tab', 'NOD', 1, 2], ang: ['tab', 'SWAY', 1.5, 2] }, arm: { ang: ['tab', 'FLICK', 3, 0] } },
    },
  };

  // ---------------------------------------------------------------- batch 6
  R.molli = { // the head rocks after the breath, ears twitch, claws settle; the raised paw waves (back)
    front: {
      parts: [
        { name: 'earL', polys: [[[0, 0], [14, 0], [14, 4], [11, 10], [0, 10]]], z: 4, pivot: [9, 10], parent: 'head', comp: 'main', fill: [['head', [box(3, 0, 16, 12)]]] },
        { name: 'earR', polys: [[[31, 0], [45, 0], [45, 11], [33, 11], [31, 6]]], z: 4, pivot: [35, 10], parent: 'head', comp: 'main', fill: [['head', [box(29, 0, 41, 12)]]] },
        { name: 'clawL', polys: [box(0, 41, 10, 52)], z: 3, comp: 'main', fill: [['upper', [box(0, 41, 12, 53)]]] },
        { name: 'clawR', polys: [box(35, 41, 45, 52)], z: 3, comp: 'main', fill: [['upper', [box(33, 41, 45, 53)]]] },
        { name: 'head', polys: [box(0, 0, 45, 30)], z: 3, pivot: [22, 30], comp: 'main', fill: [['upper', [box(0, 28, 45, 32)]]] },
        ...breathe(50, 45, 61),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, clawL: { dy: ['tab', 'NOD', 1, 2] }, clawR: { dy: ['tab', 'NOD', 1, 2] },
        earL: { dy: ['twitch', -1, 8] }, earR: { dy: ['twitch', -1, 13] } },
    },
    back: {
      parts: [
        { name: 'paw', polys: [box(40, 33, 59, 56)], z: 3, pivot: [42, 46], parent: 'upper', comp: 'main', fill: [['upper', [box(36, 35, 45, 56)]]] },
        { name: 'earL', polys: [[[8, 0], [22, 0], [22, 5], [19, 10], [8, 10]]], z: 4, pivot: [16, 9], parent: 'upper', comp: 'main', fill: [['upper', [box(6, 0, 24, 12)]]] },
        { name: 'earR', polys: [[[33, 9], [33, 2], [48, 2], [48, 14], [38, 14]]], z: 4, pivot: [39, 13], parent: 'upper', comp: 'main', fill: [['upper', [box(32, 0, 44, 16)]]] },
        ...breathe(56, 59, 78),
      ],
      anim: { upper: BOB, paw: { ang: ['tab', 'FLICK', 2, 0] }, earL: { dy: ['twitch', -1, 8] }, earR: { dy: ['twitch', -1, 13] } },
    },
  };

  R.molluna = { // the pickaxe hand swings after the breath, the hard hat settles
    front: {
      parts: [
        { name: 'arm', polys: [[[40, 33], [67, 33], [67, 62], [48, 62], [48, 57], [40, 57]]], z: 4, pivot: [43, 37], parent: 'upper', comp: 'main', fill: [['upper', [box(36, 33, 46, 58)]], ['lower', [box(40, 54, 50, 61)]]] },
        { name: 'mittL', polys: [box(0, 50, 20, 65)], z: 3, parent: 'upper', comp: 'main' },
        { name: 'hat', polys: [box(14, 0, 52, 18)], z: 4, comp: 'main', fill: [['upper', [box(14, 15, 52, 20)]]] },
        ...breathe(58, 67, 77),
      ],
      anim: { upper: BOB, arm: { ang: ['tab', 'SWAY', 1.5, 2] }, hat: { dy: ['tab', 'NOD', 1, 2] } },
    },
    back: {
      parts: [
        { name: 'pick', polys: [[[0, 15], [13, 15], [13, 17], [17, 17], [17, 27], [14, 30], [9, 33], [8, 51], [0, 51]]], z: 0.5, pivot: [24, 34], comp: 'main', extend: [box(8, 15, 20, 51)] },
        { name: 'hand', polys: [box(46, 30, 60, 46)], z: 4, pivot: [48, 40], parent: 'upper', comp: 'main', fill: [['upper', [box(42, 32, 50, 46)]]] },
        { name: 'hat', polys: [box(14, 0, 46, 21)], z: 4, comp: 'main', fill: [['upper', [box(14, 18, 46, 23)]]] },
        ...breathe(60, 60, 83),
      ],
      anim: { upper: BOB, pick: { ang: ['tab', 'SWAY', 2, 2] }, hand: { ang: ['tab', 'SWAY', 1, 2] }, hat: { dy: ['tab', 'NOD', 1, 2] } },
    },
  };

  R.mothelia = { // big moth wings open on the in-breath, dust motes drift
    front: {
      parts: [
        { name: 'dust', polys: [box(0, 0, 72, 84)], z: 5, comp: 'floater' },
        { name: 'wingUL', polys: [box(0, 12, 22, 44)], z: 0, pivot: [24, 40], parent: 'upper', comp: 'main', extend: [box(18, 12, 28, 44)] },
        { name: 'wingUR', polys: [box(50, 12, 72, 44)], z: 0, pivot: [48, 40], parent: 'upper', comp: 'main', extend: [box(44, 12, 54, 44)] },
        { name: 'wingLL', polys: [box(0, 45, 22, 72)], z: 0, pivot: [24, 48], parent: 'upper', comp: 'main', extend: [box(18, 45, 28, 72)] },
        { name: 'wingLR', polys: [[[50, 45], [72, 45], [72, 74], [56, 74], [56, 63], [50, 63]]], z: 0, pivot: [48, 48], parent: 'upper', comp: 'main', extend: [box(44, 45, 54, 72)] },
        ...breathe(66, 72, 84),
      ],
      anim: { upper: BOB, dust: { dy: ['float', 1.0, 1.4] }, wingUL: { ang: ['tab', 'OPEN', 1.25, 0] }, wingUR: { ang: ['tab', 'OPEN', -1.25, 0] },
        wingLL: { ang: ['tab', 'OPEN', -1, 1] }, wingLR: { ang: ['tab', 'OPEN', 1, 1] } },
    },
    back: {
      parts: [
        { name: 'dust', polys: [box(0, 0, 59, 99)], z: 5, comp: 'floater' },
        { name: 'wingL', polys: [[[0, 20], [22, 20], [26, 40], [28, 60], [24, 76], [0, 76]]], z: 3, pivot: [26, 36], parent: 'upper', comp: 'main', fill: [['upper', [box(20, 20, 30, 76)]]] },
        { name: 'wingR', polys: [[[33, 30], [59, 30], [59, 88], [40, 88], [40, 60], [36, 45]]], z: 3, pivot: [35, 38], parent: 'upper', comp: 'main', fill: [['upper', [box(31, 30, 44, 82)]]] },
        ...breathe(80, 59, 99),
      ],
      anim: { upper: BOB, dust: { dy: ['float', 1.0, 1.4] }, wingL: { ang: ['tab', 'OPEN', 1, 0] }, wingR: { ang: ['tab', 'OPEN', -1, 1] } },
    },
  };

  R.needlance = { // the lance sways in her grip, the head settles after the breath; the tail sways (back)
    front: {
      parts: [
        { name: 'lance', polys: [[[0, 0], [9, 0], [9, 23], [10, 23], [10, 49], [12, 50], [12, 78], [9, 78], [7, 50], [6, 40], [0, 38]]], z: 1.5, pivot: [10, 45], parent: 'upper', extend: [box(7, 40, 16, 50)] },
        { name: 'head', polys: [box(8, 0, 46, 33)], z: 3, comp: 'main', fill: [['upper', [box(8, 31, 46, 35)]]] },
        ...breathe(58, 46, 78),
      ],
      anim: { upper: BOB, lance: { ang: ['tab', 'SWAY', 1.5, 2] }, head: { dy: ['tab', 'NOD', 1, 0] } },
    },
    back: {
      parts: [
        { name: 'lance', polys: [[[56, 0], [73, 0], [73, 52], [64, 63], [59, 97], [49, 97], [54, 63], [56, 52]]], z: 4, pivot: [60, 58], fill: [['upper', [box(50, 48, 68, 64)]]] }, // turns in her fist
        { name: 'tail', polys: [[[0, 64], [6, 64], [6, 72], [7, 72], [7, 74], [21, 74], [21, 84], [0, 84]]], z: 0.5, pivot: [20, 78], comp: 'main', extend: [box(9, 72, 24, 82)] },
        ...breathe(70, 73, 97),
      ],
      anim: { upper: BOB, lance: { dx: ['tab', 'SWAY', 0.5, 2] }, tail: { ang: ['tab', 'SWAY', 2, 0] } },
    },
  };

  R.nibblit = { // pigtails swing after the breath, hamster ears twitch
    front: {
      parts: [
        { name: 'tailL', polys: [box(0, 18, 10, 42)], z: 3, pivot: [8, 19], parent: 'upper', comp: 'main', fill: [['upper', [box(6, 18, 13, 42)]]] },
        { name: 'tailR', polys: [box(39, 18, 49, 42)], z: 3, pivot: [41, 19], parent: 'upper', comp: 'main', fill: [['upper', [box(36, 18, 43, 42)]]] },
        { name: 'earL', polys: [[[0, 0], [10, 0], [12, 6], [10, 10], [0, 10]]], z: 4, pivot: [9, 10], parent: 'upper', comp: 'main', fill: [['upper', [box(0, 0, 15, 13)]]] },
        { name: 'earR', polys: [[[37, 6], [39, 0], [49, 0], [49, 10], [39, 10]]], z: 4, pivot: [40, 10], parent: 'upper', comp: 'main', fill: [['upper', [box(34, 0, 49, 13)]]] },
        ...breathe(46, 49, 62),
      ],
      anim: { upper: BOB, tailL: { ang: ['tab', 'SWAY', 1.5, 2] }, tailR: { ang: ['tab', 'SWAY', 1.5, 2] }, earL: { dy: ['twitch', -1, 8] }, earR: { dy: ['twitch', -1, 13] } },
    },
    back: {
      parts: [
        { name: 'tailL', polys: [box(0, 18, 14, 56)], z: 3, pivot: [12, 19], parent: 'upper', comp: 'main', fill: [['upper', [box(10, 18, 18, 56)]]] },
        { name: 'tailR', polys: [box(52, 18, 66, 59)], z: 3, pivot: [54, 19], parent: 'upper', comp: 'main', fill: [['upper', [box(48, 18, 56, 59)]]] },
        { name: 'earL', polys: [[[8, 0], [20, 0], [22, 6], [20, 9], [8, 9]]], z: 4, pivot: [18, 9], parent: 'upper', comp: 'main', fill: [['upper', [box(6, 0, 24, 12)]]] },
        { name: 'earR', polys: [[[40, 6], [42, 0], [56, 0], [56, 10], [42, 10]]], z: 4, pivot: [43, 10], parent: 'upper', comp: 'main', fill: [['upper', [box(36, 0, 58, 13)]]] },
        ...breathe(60, 66, 83),
      ],
      anim: { upper: BOB, tailL: { ang: ['tab', 'SWAY', 1.5, 2] }, tailR: { ang: ['tab', 'SWAY', 1.5, 2] }, earL: { dy: ['twitch', -1, 8] }, earR: { dy: ['twitch', -1, 13] } },
    },
  };

  R.nibblenna = { // pigtails swing after the breath, the chef's hat settles; the raised hand waves (back)
    front: {
      parts: [
        { name: 'tailL', polys: [box(0, 18, 11, 42)], z: 3, pivot: [9, 19], parent: 'upper', comp: 'main', fill: [['upper', [box(7, 18, 14, 42)]]] },
        { name: 'tailR', polys: [box(41, 18, 52, 42)], z: 3, pivot: [43, 19], parent: 'upper', comp: 'main', fill: [['upper', [box(38, 18, 45, 42)]]] },
        { name: 'hat', polys: [box(13, 0, 38, 9)], z: 4, comp: 'main', fill: [['upper', [box(13, 7, 38, 11)]]] },
        ...breathe(56, 52, 75),
      ],
      anim: { upper: BOB, tailL: { ang: ['tab', 'SWAY', 1.5, 2] }, tailR: { ang: ['tab', 'SWAY', 1.5, 2] }, hat: { dy: ['tab', 'NOD', 1, 2] } },
    },
    back: {
      parts: [
        { name: 'tailL', polys: [box(0, 22, 14, 46)], z: 3, pivot: [12, 23], parent: 'upper', comp: 'main', fill: [['upper', [box(10, 22, 18, 46)]]] },
        { name: 'hand', polys: [box(50, 49, 58, 58)], z: 4, pivot: [49, 54], parent: 'upper', comp: 'main', fill: [['upper', [box(47, 49, 51, 58)]]] },
        { name: 'hat', polys: [box(20, 0, 46, 12)], z: 4, comp: 'main', fill: [['upper', [box(20, 9, 46, 14)]]] },
        ...breathe(64, 58, 95),
      ],
      anim: { upper: BOB, tailL: { ang: ['tab', 'SWAY', 1.5, 2] }, hand: { dx: ['tab', 'SWAY', 0.5, 0] }, hat: { dy: ['tab', 'NOD', 1, 2] } },
    },
  };

  // ---------------------------------------------------------------- batch 7
  R.ottelia = { // flipper sleeves flap and the head rocks (front); the tail sways and the raised flipper waves (back)
    front: {
      parts: [
        { name: 'finL', polys: [box(0, 44, 9, 55)], z: 3, pivot: [10, 48], parent: 'upper', comp: 'main', fill: [['upper', [box(7, 44, 12, 55)]]] },
        { name: 'finR', polys: [box(43, 44, 52, 55)], z: 3, pivot: [42, 48], parent: 'upper', comp: 'main', fill: [['upper', [box(40, 44, 45, 55)]]] },
        { name: 'head', polys: [box(0, 0, 53, 35)], z: 3, pivot: [26, 36], parent: 'upper', comp: 'main', fill: [['upper', [box(0, 33, 53, 38)]]] },
        ...breathe(60, 52, 77),
      ],
      anim: { upper: BOB, head: { ang: ['tab', 'SWAY', 1.5, 2] }, finL: { ang: ['tab', 'OPEN', 5, 1] }, finR: { ang: ['tab', 'OPEN', -5, 1] } },
    },
    back: {
      parts: [
        { name: 'tail', polys: [[[0, 62], [10, 62], [10, 74], [14, 74], [14, 80], [0, 80]]], z: 3, pivot: [7, 80], comp: 'main', fill: [['lower', [box(10, 62, 20, 80), box(0, 77, 16, 82)]]] },
        { name: 'fin', polys: [box(55, 46, 66, 58)], z: 4, pivot: [56, 54], parent: 'upper', comp: 'main', fill: [['upper', [box(52, 48, 58, 58)]]] },
        ...breathe(66, 66, 102),
      ],
      anim: { upper: BOB, tail: { ang: ['tab', 'SWAY', -3, 0] }, fin: { ang: ['tab', 'FLICK', 4, 0] } },
    },
  };

  R.ottomarine = { // the life ring swings after the breath, the cap settles, the fish tail sways
    front: {
      parts: [
        { name: 'ring', polys: [box(46, 40, 66, 70)], z: 4, pivot: [50, 55], parent: 'upper', comp: 'main', fill: [['upper', [box(42, 40, 50, 70)]], ['lower', [box(44, 63, 66, 72)]]] },
        { name: 'tail', polys: [box(0, 70, 18, 84)], z: 3, pivot: [20, 74], comp: 'main', fill: [['lower', [box(14, 68, 24, 84)]]] },
        { name: 'hat', polys: [box(17, 0, 53, 10), box(22, 10, 47, 17)], z: 4, comp: 'main', fill: [['upper', [box(16, 13, 50, 18)]]] },
        ...breathe(66, 66, 87),
      ],
      anim: { upper: BOB, ring: { ang: ['tab', 'SWAY', 2, 2] }, tail: { ang: ['tab', 'SWAY', 2, 0] }, hat: { dy: ['tab', 'NOD', 1, 2] } },
    },
    back: {
      parts: [
        { name: 'tail', polys: [box(0, 70, 18, 86)], z: 3, pivot: [20, 76], comp: 'main', fill: [['lower', [box(14, 68, 24, 86)]]] },
        { name: 'hand', polys: [box(58, 50, 69, 62)], z: 4, pivot: [59, 57], parent: 'upper', comp: 'main', fill: [['upper', [box(55, 52, 61, 62)]]] },
        { name: 'hat', polys: [box(20, 0, 58, 22)], z: 4, comp: 'main', fill: [['upper', [box(20, 19, 58, 24)]]] },
        ...breathe(70, 69, 100),
      ],
      anim: { upper: BOB, tail: { ang: ['tab', 'SWAY', -2.5, 0] }, hand: { ang: ['tab', 'FLICK', 4.5, 0] }, hat: { dy: ['tab', 'NOD', 1, 2] } },
    },
  };

  R.ottopi = { // the head rocks after the breath, ears twitch, the tail sways; the raised paw waves (back)
    front: {
      parts: [
        { name: 'tail', polys: [box(30, 46, 38, 57)], z: 0.5, pivot: [30, 52], comp: 'main', extend: [box(26, 46, 32, 57)] },
                        { name: 'head', polys: [box(0, 0, 38, 34)], z: 3, pivot: [19, 34], comp: 'main', fill: [['upper', [box(0, 32, 38, 36)]]] },
        ...breathe(52, 38, 67),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, tail: { dy: ['tab', 'SWAY', 0.5, 0] } },
    },
    back: {
      parts: [
        { name: 'tail', polys: [[[0, 55], [11, 55], [11, 58], [22, 58], [22, 71], [0, 71]]], z: 3, pivot: [24, 62], comp: 'main', fill: [['upper', [box(18, 54, 28, 62)]], ['lower', [box(18, 62, 28, 72), box(0, 69, 24, 74)]]] },
        { name: 'paw', polys: [box(46, 42, 57, 56)], z: 4, pivot: [47, 52], parent: 'upper', comp: 'main', fill: [['upper', [box(43, 44, 49, 56)]]] },
        ...breathe(62, 57, 89),
      ],
      anim: { upper: BOB, tail: { ang: ['tab', 'SWAY', -2, 0] }, paw: { ang: ['tab', 'FLICK', 4.5, 0] } },
    },
  };

  R.pebblump = { // the stone hood rocks after the breath; the raised hand waves (back)
    front: {
      parts: [
        { name: 'head', polys: [box(0, 0, 35, 31)], z: 3, pivot: [17, 33], parent: 'upper', comp: 'main', fill: [['upper', [box(2, 29, 25, 33)]]] },
        ...breathe(48, 35, 62),
      ],
      anim: { upper: BOB, head: { ang: ['tab', 'SWAY', 1.5, 2] } },
    },
    back: {
      parts: [
        { name: 'hand', polys: [box(39, 35, 48, 46)], z: 4, pivot: [41, 44], parent: 'upper', comp: 'main', fill: [['upper', [box(37, 37, 43, 46)]]] },
        { name: 'head', polys: [box(0, 0, 40, 32), box(40, 0, 46, 34)], z: 3, pivot: [24, 32], comp: 'main', fill: [['upper', [box(0, 30, 48, 34)]]] },
        ...breathe(60, 48, 83),
      ],
      anim: { upper: BOB, hand: { ang: ['tab', 'FLICK', 5, 0] }, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1, 2] } },
    },
  };

  R.chirpadee = { // chick wings lift on the breath, the crest twitches
    front: {
      parts: [
        { name: 'wingL', polys: [box(0, 36, 12, 47)], z: 3, pivot: [13, 40], parent: 'upper', comp: 'main', fill: [['upper', [box(10, 36, 15, 47)]]] },
        { name: 'wingR', polys: [box(31, 36, 43, 47)], z: 3, pivot: [30, 40], parent: 'upper', comp: 'main', fill: [['upper', [box(28, 36, 33, 47)]]] },
        { name: 'crest', polys: [box(15, 0, 28, 6)], z: 4, pivot: [21, 8], parent: 'upper', comp: 'main', fill: [['upper', [box(15, 5, 28, 8)]]] },
        ...breathe(50, 43, 62),
      ],
      anim: { upper: BOB, wingL: { ang: ['tab', 'OPEN', 5, 0] }, wingR: { ang: ['tab', 'OPEN', -5, 0] }, crest: { ang: ['tab', 'SWAY', 3.5, 2] } },
    },
    back: {
      parts: [
        { name: 'wingL', polys: [box(0, 38, 16, 54)], z: 3, pivot: [17, 44], parent: 'upper', comp: 'main', fill: [['upper', [box(12, 38, 20, 56)]]] },
        { name: 'wingR', polys: [box(39, 38, 56, 57)], z: 3, pivot: [38, 44], parent: 'upper', comp: 'main', fill: [['upper', [box(35, 38, 41, 57), box(40, 52, 50, 58)]]] },
        { name: 'crest', polys: [box(26, 0, 38, 9)], z: 4, pivot: [31, 10], parent: 'upper', comp: 'main', fill: [['upper', [box(26, 8, 38, 11)]]] },
        ...breathe(60, 56, 83),
      ],
      anim: { upper: BOB, wingL: { ang: ['tab', 'OPEN', 4.5, 0] }, wingR: { ang: ['tab', 'OPEN', -4.5, 1] }, crest: { ang: ['tab', 'SWAY', -3.5, 2] } },
    },
  };

  R.tomasquire = { // the tomato hood rocks after the breath, its leaf crown sways; the raised hand waves (back)
    front: {
      parts: [
        { name: 'leaves', polys: [box(18, 0, 34, 9)], z: 4, pivot: [25, 10], parent: 'head', comp: 'main', fill: [['head', [box(18, 7, 34, 11)]]] },
        { name: 'head', polys: [box(0, 0, 51, 36)], z: 3, pivot: [25, 36], comp: 'main', fill: [['upper', [box(8, 34, 35, 38)]]] },
        ...breathe(52, 51, 62),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], dx: ['tab', 'SWAY', 0.5, 2] }, leaves: { ang: ['tab', 'SWAY', 3, 2] } },
    },
    back: {
      parts: [
        { name: 'hand', polys: [box(30, 50, 45, 62)], z: 4, pivot: [31, 55], parent: 'upper', comp: 'main', fill: [['upper', [box(28, 50, 34, 62)]]] },
        { name: 'leaves', polys: [box(18, 0, 42, 10)], z: 4, pivot: [28, 11], parent: 'head', comp: 'main', fill: [['head', [box(18, 8, 42, 12)]]] },
        { name: 'head', polys: [box(0, 0, 55, 39), box(18, 39, 34, 40)], z: 3, pivot: [27, 38], comp: 'main', fill: [['upper', [box(0, 37, 55, 41)]]] },
        ...breathe(62, 55, 83),
      ],
      anim: { upper: BOB, hand: { ang: ['tab', 'FLICK', 3, 0] }, head: { dy: ['tab', 'NOD', 1, 0], dx: ['tab', 'SWAY', 0.5, 2] }, leaves: { ang: ['tab', 'SWAY', -2, 2] } },
    },
  };

  // ---------------------------------------------------------------- batch 8
  R.wiskedabra = { // the top-hatted head rocks after the breath, the bowed tail sways
    front: {
      parts: [
        { name: 'tail', polys: [[[42, 44], [54, 44], [54, 68], [37, 68], [37, 55], [42, 55]]], z: 0.5, pivot: [37, 64], comp: 'main', extend: [box(30, 58, 40, 70)] },
        { name: 'head', polys: [box(0, 0, 41, 35)], z: 3, pivot: [20, 34], comp: 'main', fill: [['upper', [box(0, 33, 41, 38)]]] },
        ...breathe(60, 54, 80),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, tail: { ang: ['tab', 'SWAY', 2.5, 0] } },
    },
    back: {
      parts: [
        { name: 'tail', polys: [box(0, 46, 17, 69)], z: 3, pivot: [13, 70], parent: 'upper', comp: 'main', fill: [['lower', [box(5, 66, 18, 71)]]] },
        { name: 'head', polys: [box(22, 0, 71, 38), box(33, 39, 53, 39)], z: 3, pivot: [44, 39], comp: 'main', fill: [['upper', [box(22, 36, 71, 42)]]] },
        ...breathe(68, 72, 84),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, tail: { ang: ['tab', 'SWAY', -3, 0] } },
    },
  };

  R.kittabra = { // the cat hood rocks after the breath, the striped tail sways
    front: {
      parts: [
        { name: 'tail', polys: [[[34, 38], [45, 38], [45, 58], [30, 58], [30, 52], [32, 52], [32, 44]]], z: 0.5, pivot: [30, 55], comp: 'main', extend: [box(26, 50, 32, 58)] },
        { name: 'head', polys: [box(0, 0, 40, 31), box(11, 32, 24, 32)], z: 3, pivot: [19, 32], comp: 'main', fill: [['upper', [box(0, 29, 40, 35)]]] },
        ...breathe(50, 44, 64),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, tail: { ang: ['tab', 'SWAY', 3.5, 0] } },
    },
    back: {
      parts: [
        { name: 'tail', polys: [[[0, 46], [14, 46], [14, 63], [16, 64], [19, 67], [20, 72], [0, 72]]], z: 0.5, pivot: [17, 68], comp: 'main', extend: [box(12, 60, 26, 74)] },
        { name: 'head', polys: [box(14, 0, 63, 37)], z: 3, pivot: [38, 40], comp: 'main', fill: [['upper', [box(14, 35, 53, 40)]]] },
        ...breathe(66, 64, 85),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, tail: { ang: ['tab', 'SWAY', -3, 0] } },
    },
  };

  R.prowlure = { // the top-hatted head rocks after the breath, the bowed tail sways
    front: {
      parts: [
        { name: 'tail', polys: [[[47, 38], [63, 38], [63, 62], [50, 62], [50, 58], [47, 58]]], z: 3, pivot: [53, 63], comp: 'main', fill: [['lower', [box(50, 60, 57, 65)]]] },
        { name: 'head', polys: [box(0, 0, 50, 34)], z: 3, pivot: [26, 35], comp: 'main', fill: [['upper', [box(0, 32, 50, 37)]]] },
        ...breathe(64, 62, 78),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, tail: { ang: ['tab', 'SWAY', 2, 0] } },
    },
    back: {
      parts: [
        { name: 'tail', polys: [[[0, 26], [18, 26], [18, 42], [15, 44], [15, 51], [0, 51]]], z: 3, pivot: [9, 52], parent: 'upper', comp: 'main', fill: [['upper', [box(3, 49, 16, 54)]]] },
        { name: 'head', polys: [box(24, 0, 66, 32), box(29, 33, 54, 36)], z: 3, pivot: [45, 34], comp: 'main', fill: [['upper', [box(24, 30, 66, 39)]]] },
        ...breathe(64, 66, 81),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, tail: { ang: ['tab', 'SWAY', -2, 0] } },
    },
  };

  R.pilfurr = { // the masked head rocks after the breath, the scarf end and tail sway
    front: {
      parts: [
        { name: 'tail', polys: [[[32, 36], [40, 36], [40, 50], [27, 50], [27, 47], [30, 46], [31, 45], [32, 44]]], z: 0.5, pivot: [28, 48], comp: 'main', extend: [box(22, 44, 30, 50)] },
        { name: 'scarf', polys: [box(28, 29, 36, 36)], z: 4, parent: 'upper', comp: 'main', fill: [['upper', [box(26, 29, 30, 36)]]] },
        { name: 'head', polys: [box(0, 0, 33, 28)], z: 3, pivot: [15, 29], comp: 'main', fill: [['upper', [box(0, 26, 33, 31)]]] },
        ...breathe(49, 40, 62),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, scarf: { dx: ['tab', 'SWAY', 0.5, 2] }, tail: { ang: ['tab', 'SWAY', 3, 0] } },
    },
    back: {
      parts: [
        { name: 'tail', polys: [box(0, 47, 9, 61)], z: 3, pivot: [4, 61], parent: 'upper', comp: 'main', fill: [['upper', [box(0, 59, 10, 63)]]] },
        { name: 'scarf', polys: [box(8, 37, 18, 48)], z: 4, pivot: [19, 40], parent: 'upper', comp: 'main', fill: [['upper', [box(16, 38, 22, 46)]]] },
        { name: 'head', polys: [box(10, 0, 59, 33), box(10, 34, 40, 34)], z: 3, pivot: [36, 35], comp: 'main', fill: [['upper', [box(10, 32, 59, 37)]]] },
        ...breathe(66, 59, 83),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, scarf: { ang: ['tab', 'SWAY', -2, 2] }, tail: { ang: ['tab', 'SWAY', -4, 0] } },
    },
  };

  R.kerochapu = { // the lily-pad umbrella sways in her hand after the breath
    front: {
      parts: [
        { name: 'brolly', polys: [[[0, 0], [30, 0], [30, 11], [22, 11], [14, 12], [13, 13], [13, 32], [9, 32], [9, 12], [0, 12]]], z: 4, pivot: [11, 33], parent: 'upper', comp: 'main', fill: [['upper', [box(12, 13, 15, 33)]]] },
        ...breathe(50, 39, 62),
      ],
      anim: { upper: BOB, brolly: { ang: ['tab', 'SWAY', 2, 2] } },
    },
    back: {
      parts: [
        { name: 'brolly', polys: [[[20, 0], [61, 0], [61, 18], [46, 18], [46, 44], [38, 44], [38, 18], [20, 18]]], z: 4, pivot: [41, 46], parent: 'upper', comp: 'main' },
        ...breathe(66, 61, 83),
      ],
      anim: { upper: BOB, brolly: { ang: ['tab', 'SWAY', -2, 2] } },
    },
  };

  R.sandkit = { // the big-eared head rocks after the breath, the brush tail sways
    front: {
      parts: [
        { name: 'tail', polys: [[[31, 41], [41, 41], [41, 57], [26, 57], [26, 45], [31, 44]]], z: 0.5, pivot: [27, 50], comp: 'main', extend: [box(22, 45, 28, 56)] },
        { name: 'head', polys: [box(0, 0, 41, 31)], z: 3, pivot: [19, 33], comp: 'main', fill: [['upper', [box(0, 29, 41, 34)]]] },
        ...breathe(54, 41, 62),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1, 2] }, tail: { ang: ['tab', 'SWAY', 3, 0] } },
    },
    back: {
      parts: [
        { name: 'tail', polys: [[[0, 51], [16, 51], [16, 59], [18, 59], [18, 74], [0, 74]]], z: 0.5, pivot: [20, 64], comp: 'main', extend: [box(16, 55, 26, 74)] },
        { name: 'head', polys: [box(0, 0, 49, 37)], z: 3, pivot: [28, 39], comp: 'main', fill: [['upper', [box(0, 35, 49, 40)]]] },
        ...breathe(72, 49, 83),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, tail: { ang: ['tab', 'SWAY', -2, 0] } },
    },
  };

  // ---------------------------------------------------------------- batch 9
  R.sandoa = { // the big-eared head rocks after the breath, the tail tip sways behind the cape; the raised glove waves (back)
    front: {
      parts: [
        { name: 'tail', polys: [[[47, 45], [58, 45], [58, 66], [49, 66], [49, 51], [47, 51]]], z: 0.5, pivot: [50, 64], comp: 'main', extend: [box(44, 50, 50, 68)] },
        { name: 'head', polys: [box(0, 0, 58, 33)], z: 3, pivot: [29, 35], comp: 'main', fill: [['upper', [box(0, 31, 58, 36)]]] },
        ...breathe(66, 58, 78),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.25, 2] }, tail: { ang: ['tab', 'SWAY', 2.5, 0] } },
    },
    back: {
      parts: [
        { name: 'arm', polys: [[[50, 31], [57, 31], [57, 50], [44, 50], [44, 40]]], z: 4, pivot: [45, 47], parent: 'upper', comp: 'main', fill: [['upper', [box(42, 38, 48, 50)]]] },
        { name: 'head', polys: [[[10, 0], [57, 0], [57, 30], [48, 30], [48, 36], [10, 36]]], z: 3, pivot: [31, 38], parent: 'upper', comp: 'main', fill: [['upper', [box(14, 34, 48, 39)]]] },
        ...breathe(82, 57, 93),
      ],
      anim: { upper: BOB, head: { ang: ['tab', 'SWAY', 1.25, 2] }, arm: { ang: ['tab', 'FLICK', 3, 0] } },
    },
  };

  R.hushroud = { // the sheet sways from the hem after the breath; the wisp drifts (front)
    front: {
      parts: [
        { name: 'wisp', polys: [box(37, 0, 48, 14)], z: 5, comp: 'floater' },
        { name: 'lower', polys: [box(0, 55, 48, 64)], z: 1, comp: 'main' },
        { name: 'upper', polys: null, z: 2, pivot: [24, 58], fill: [['lower', [box(0, 52, 48, 55)]]] },
      ],
      anim: { upper: { dy: ['tab', 'BOB', 1], ang: ['tab', 'SWAY', 0.75, 2] }, wisp: { dx: ['tab', 'SWAY', 0.5, 2], dy: ['float', 1.0, 1.4] } },
    },
    back: {
      parts: [
        { name: 'top', polys: [box(0, 0, 49, 39)], z: 2.1, parent: 'upper' },
        // the left hem fold and the right strand's foot stay planted, so the hem lines meet the seam side by side
        { name: 'lower', polys: [box(0, 70, 49, 83), box(0, 66, 13, 70), box(42, 69, 46, 70)], z: 1 },
        { name: 'upper', polys: null, z: 2, pivot: [24, 72], fill: [['lower', [box(2, 64, 2, 66), box(9, 63, 13, 66), box(14, 67, 49, 69)]]] },
      ],
      anim: { upper: { dy: ['tab', 'BOB', 1], dx: ['tab', 'SWAY', 0.5, 2] }, top: { dx: ['tab', 'SWAY', 0.5, 2] } }, // the back is all thin outline: whole-pixel sway, no rotation
    },
  };

  R.myceliquin = { // the toadstool cap rocks after the breath, spores drift
    front: {
      parts: [
        { name: 's1', polys: [box(0, 0, 8, 8)], z: 5 },
        { name: 's2', polys: [box(0, 12, 4, 16)], z: 5 },
        { name: 's3', polys: [box(0, 28, 6, 38)], z: 5 },
        { name: 's4', polys: [box(40, 4, 46, 10)], z: 5 },
        { name: 's5', polys: [box(40, 29, 46, 43)], z: 5 },
        { name: 'head', polys: [box(0, 0, 45, 31)], z: 3, pivot: [22, 33], parent: 'upper', comp: 'main', fill: [['upper', [box(3, 29, 43, 34)]]] },
        ...breathe(55, 46, 62),
      ],
      anim: { upper: BOB, head: { ang: ['tab', 'SWAY', 1.5, 2] },
        s1: { dy: ['float', 0.5, 1.4] }, s2: { dy: ['float', 3.1, 1.4, true] }, s3: { dy: ['float', 1.8, 1.4] }, s4: { dy: ['float', 4.2, 1.4] }, s5: { dy: ['float', 2.4, 1.4] } },
    },
    back: {
      parts: [
        { name: 's1', polys: [box(0, 0, 15, 13)], z: 5 },
        { name: 's2', polys: [box(0, 33, 7, 39)], z: 5 },
        { name: 's3', polys: [box(0, 45, 7, 52)], z: 5 },
        { name: 's4', polys: [box(61, 36, 67, 42)], z: 5 },
        { name: 's5', polys: [box(54, 57, 61, 64)], z: 5 },
        { name: 'head', polys: [box(8, 0, 61, 33)], z: 3, pivot: [32, 35], comp: 'main', fill: [['upper', [box(10, 31, 56, 36)]]] },
        ...breathe(70, 67, 83),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] },
        s1: { dy: ['float', 0.5, 1.4] }, s2: { dy: ['float', 3.1, 1.4] }, s3: { dy: ['float', 1.8, 1.4] }, s4: { dy: ['float', 4.2, 1.4] }, s5: { dy: ['float', 2.4, 1.4] } },
    },
  };

  R.cordymime = { // the head and toadstool parasol rock after the breath, spores drift
    front: {
      parts: [
        { name: 's1', polys: [box(50, 24, 58, 30)], z: 5 },
        { name: 's2', polys: [box(48, 31, 53, 36)], z: 5 },
        { name: 's3', polys: [box(53, 31, 58, 39)], z: 5 },
        { name: 'head', polys: [box(0, 0, 52, 35)], z: 3, pivot: [30, 37], parent: 'upper', comp: 'main', fill: [['upper', [box(0, 33, 52, 38)]]] },
        ...breathe(66, 59, 78),
      ],
      anim: { upper: BOB, head: { ang: ['tab', 'SWAY', 1, 2] },
        s1: { dy: ['float', 0.5, 1.4] }, s2: { dx: ['tab', 'SWAY', 0.5, 2], dy: ['float', 2.6, 1.4] }, s3: { dy: ['float', 4.4, 1.4] } },
    },
    back: {
      parts: [
        { name: 's1', polys: [box(58, 35, 67, 45)], z: 5 },
        { name: 's2', polys: [box(54, 45, 62, 52)], z: 5 },
        { name: 's3', polys: [box(57, 52, 67, 61), box(63, 45, 67, 51)], z: 5 },
        { name: 'head', polys: [box(0, 0, 56, 14), box(0, 14, 54, 45)], z: 3, pivot: [36, 47], parent: 'upper', comp: 'main', fill: [['upper', [box(18, 43, 52, 48)]]] },
        ...breathe(84, 67, 96),
      ],
      anim: { upper: BOB, head: { ang: ['tab', 'SWAY', 1, 2] },
        s1: { dy: ['float', 0.5, 1.4] }, s2: { dy: ['float', 2.6, 1.4] }, s3: { dy: ['float', 4.4, 1.4] } },
    },
  };

  R.silkie = { // the hood rocks after the breath, the antenna knobs bob
    front: {
      parts: [
        { name: 'antL', polys: [box(3, 0, 11, 4)], z: 4, parent: 'head', comp: 'main', fill: [['head', [box(4, 3, 11, 6)]]] },
        { name: 'antR', polys: [box(24, 0, 32, 4)], z: 4, parent: 'head', comp: 'main', fill: [['head', [box(24, 3, 31, 6)]]] },
        { name: 'head', polys: [box(0, 0, 35, 32)], z: 3, pivot: [17, 33], comp: 'main', fill: [['upper', [box(0, 30, 35, 35)]]] },
        ...breathe(52, 35, 62),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, antL: { dy: ['float', 1.0, 1.4, true] }, antR: { dy: ['float', 3.6, 1.4, true] } },
    },
    back: {
      parts: [
        { name: 'antL', polys: [box(16, 0, 28, 8)], z: 4, parent: 'head', comp: 'main', fill: [['head', [box(19, 7, 27, 10)]]] },
        { name: 'antR', polys: [box(44, 3, 54, 10)], z: 4, parent: 'head', comp: 'main', fill: [['head', [box(43, 8, 54, 13)]]] },
        { name: 'head', polys: [box(10, 0, 54, 44)], z: 3, pivot: [30, 46], comp: 'main', fill: [['upper', [box(12, 42, 48, 47)]]] },
        ...breathe(70, 54, 83),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1, 2] }, antL: { dy: ['float', 1.0, 1.4, true] }, antR: { dy: ['float', 3.6, 1.4, true] } },
    },
  };

  R.stingle = { // the hood rocks after the breath, the stinger tail sways
    front: {
      parts: [
        { name: 'tail', polys: [[[27, 17], [38, 17], [38, 46], [22, 46], [22, 38], [25, 37]]], z: 0.5, pivot: [23, 42], parent: 'upper', comp: 'main', extend: [box(18, 36, 26, 47)] },
        { name: 'head', polys: [box(0, 0, 27, 31)], z: 3, pivot: [12, 33], comp: 'main', fill: [['upper', [box(0, 29, 27, 34)]]] },
        ...breathe(50, 38, 60),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, tail: { ang: ['tab', 'SWAY', 2, 0] } },
    },
    back: {
      parts: [
        { name: 'tail', polys: [[[0, 30], [14, 30], [14, 52], [22, 52], [22, 63], [10, 63], [0, 55]]], z: 0.5, pivot: [24, 58], comp: 'main', extend: [box(18, 50, 30, 64)] },
        { name: 'head', polys: [box(18, 0, 57, 27)], z: 3, pivot: [36, 29], comp: 'main', fill: [['upper', [box(20, 25, 57, 30)]]] },
        ...breathe(64, 57, 80),
      ],
      anim: { upper: BOB, head: { dy: ['tab', 'NOD', 1, 0], ang: ['tab', 'SWAY', 1.5, 2] }, tail: { ang: ['tab', 'SWAY', -1.5, 0] } },
    },
  };

  // ---------------------------------------------------------------- batch 10
  R.lanternid = { // the lantern swings on its hook after the breath (front: the cord tilts and the lantern slides)
    front: {
      parts: [
        { name: 'cord', polys: [box(53, 10, 57, 15)], z: 4.5, pivot: [55, 10], parent: 'upper', comp: 'main' },
        { name: 'lantern', polys: [box(50, 16, 59, 28)], z: 4, parent: 'upper', comp: 'main' },
        ...breathe(62, 68, 76),
      ],
      anim: { upper: BOB, cord: { ang: ['tab', 'OPEN', 8, 10] }, lantern: { dx: ['tab', 'OPEN', -1, 10] } },
    },
    back: {
      parts: [
        { name: 'lantern', polys: [[[14, 13], [19, 13], [19, 19], [23, 19], [23, 35], [11, 35], [11, 19], [14, 19]]], z: 4, pivot: [16, 12], parent: 'upper', comp: 'main' },
        ...breathe(74, 81, 97),
      ],
      anim: { upper: BOB, lantern: { ang: ['tab', 'OPEN', -3, 10] } },
    },
  };

  R.mossgable = { // the hard-hatted head rocks after the breath, the hammer sways in her grip
    front: {
      parts: [
        { name: 'tool', polys: [box(0, 19, 8, 32)], z: 4, pivot: [6, 34], parent: 'upper', comp: 'main', fill: [['upper', [box(3, 30, 9, 34)]]] },
        { name: 'head', polys: [box(9, 0, 41, 30)], z: 3, pivot: [24, 32], parent: 'upper', comp: 'main', fill: [['upper', [box(9, 28, 41, 33)]]] },
        ...breathe(64, 50, 78),
      ],
      anim: { upper: BOB, head: { ang: ['tab', 'SWAY', 1.5, 2] }, tool: { ang: ['tab', 'SWAY', 3, 2] } },
    },
    back: {
      parts: [
        { name: 'tool', polys: [[[52, 25], [65, 25], [65, 41], [51, 41], [51, 33]]], z: 4, pivot: [55, 44], parent: 'upper', comp: 'main', fill: [['upper', [box(52, 38, 59, 43)]]] },
        { name: 'head', polys: [box(14, 0, 52, 33)], z: 3, pivot: [30, 35], parent: 'upper', comp: 'main', fill: [['upper', [box(14, 31, 52, 36)]]] },
        ...breathe(76, 65, 93),
      ],
      anim: { upper: BOB, head: { ang: ['tab', 'SWAY', 1.5, 2] }, tool: { ang: ['tab', 'SWAY', -2.5, 2] } },
    },
  };

  R.tortile = { // the turtle hood rocks after the breath; the raised fist waves (back)
    front: {
      parts: [
        { name: 'head', polys: [box(0, 0, 32, 26)], z: 3, pivot: [15, 27], parent: 'upper', comp: 'main', fill: [['upper', [box(0, 24, 32, 29)]]] },
        ...breathe(48, 32, 62),
      ],
      anim: { upper: BOB, head: { ang: ['tab', 'SWAY', 2, 2] } },
    },
    back: {
      parts: [
        { name: 'arm', polys: [box(37, 31, 45, 46)], z: 4, pivot: [39, 46], parent: 'upper', comp: 'main', fill: [['upper', [box(34, 36, 39, 46)]]] },
        { name: 'head', polys: [box(5, 0, 41, 31)], z: 3, pivot: [20, 33], parent: 'upper', comp: 'main', fill: [['upper', [box(5, 29, 38, 34)]]] },
        ...breathe(66, 45, 83),
      ],
      anim: { upper: BOB, head: { ang: ['tab', 'SWAY', 2, 2] }, arm: { ang: ['tab', 'FLICK', 3.5, 0] } },
    },
  };

  R.slumbrio = { // the dream bubble drifts, the nightcap tail sways; the raised fist waves (back)
    front: {
      parts: [
        { name: 'bubble', polys: [box(0, 0, 21, 15), box(0, 16, 16, 17), box(0, 18, 11, 22)], z: 5, parent: 'upper', pivot: [10, 22] },
        { name: 'cap', polys: [[[46, 27], [58, 27], [58, 44], [49, 44], [47, 35], [46, 33]]], z: 4, pivot: [48, 28], parent: 'upper', comp: 'main', fill: [['upper', [box(44, 27, 50, 34)]]] },
        ...breathe(68, 58, 78),
      ],
      anim: { upper: BOB, bubble: { dy: ['float', 0.5, 1.4, true] }, cap: { ang: ['tab', 'SWAY', 3, 2] } },
    },
    back: {
      parts: [
        { name: 'cap', polys: [[[0, 37], [15, 37], [15, 40], [11, 44], [11, 54], [0, 54]]], z: 4, pivot: [10, 37], parent: 'upper', comp: 'main', fill: [['upper', [box(5, 34, 16, 40)]]] },
        { name: 'fist', polys: [box(54, 43, 63, 54)], z: 4, pivot: [54, 49], parent: 'upper', comp: 'main', fill: [['upper', [box(51, 44, 56, 54)]]] },
        ...breathe(76, 63, 91),
      ],
      anim: { upper: BOB, cap: { ang: ['tab', 'SWAY', -3, 2] }, fist: { ang: ['tab', 'FLICK', 4, 0] } },
    },
  };

  R.somnia = { // dream orbs drift around her, each out of step
    front: {
      parts: [
        { name: 'o1', polys: [box(0, 16, 8, 25)], z: 5 },
        { name: 'o2', polys: [box(3, 32, 14, 43)], z: 5 },
        { name: 'o3', polys: [box(0, 52, 8, 61)], z: 5 },
        { name: 'o4', polys: [box(64, 24, 74, 34)], z: 5 },
        { name: 'o5', polys: [box(64, 42, 75, 55)], z: 5 },
        ...breathe(80, 75, 87),
      ],
      anim: { upper: BOB, o1: { dy: ['float', 0.5, 2.4] }, o2: { dy: ['float', 2.6, 2.4, true] }, o3: { dy: ['float', 4.4, 2.4] }, o4: { dy: ['float', 1.6, 2.4] }, o5: { dy: ['float', 3.5, 2.4] } },
    },
    back: {
      parts: [
        { name: 'o1', polys: [box(10, 16, 19, 25)], z: 5 },
        { name: 'o2', polys: [box(10, 32, 21, 43)], z: 5 },
        { name: 'o3', polys: [box(3, 48, 13, 57)], z: 5 },
        { name: 'o4', polys: [box(66, 23, 74, 32)], z: 5 },
        { name: 'o5', polys: [box(68, 39, 78, 50)], z: 5 },
        ...breathe(74, 78, 85),
      ],
      anim: { upper: BOB, o1: { dy: ['float', 0.5, 2.4] }, o2: { dy: ['float', 2.6, 2.4] }, o3: { dy: ['float', 4.4, -2.4] }, o4: { dy: ['float', 1.6, 2.4] }, o5: { dy: ['float', 3.5, 2.4] } },
    },
  };

  R.scurrent = { // the hood rocks after the breath, the striped tail sways behind
    front: {
      parts: [
        { name: 'spark', polys: [box(8, 30, 11, 33)], z: 5, parent: 'head' },
        { name: 'tail', polys: [[[40, 25], [51, 25], [51, 52], [35, 52], [35, 29], [40, 27]]], z: 0.5, pivot: [32, 48], comp: 'main', extend: [box(28, 30, 36, 52)] },
        { name: 'head', polys: [[[4, 0], [41, 0], [41, 26], [37, 28], [34, 32], [4, 32]]], z: 3, pivot: [19, 34], parent: 'upper', comp: 'main', fill: [['upper', [box(4, 30, 36, 35)]]] },
        ...breathe(52, 51, 64),
      ],
      anim: { upper: BOB, head: { ang: ['tab', 'SWAY', 1.5, 2] }, tail: { ang: ['tab', 'SWAY', 2, 0] } },
    },
    back: {
      parts: [
        { name: 'sparkR', polys: [box(45, 31, 55, 38)], z: 5, parent: 'head' },
        { name: 'tail', polys: [[[0, 31], [20, 31], [20, 52], [16, 60], [0, 60]]], z: 0.5, pivot: [19, 52], comp: 'main', extend: [box(15, 40, 24, 62)] },
        { name: 'head', polys: [[[14, 0], [56, 0], [56, 32], [26, 32], [24, 29], [14, 29]]], z: 3, pivot: [36, 34], parent: 'upper', comp: 'main', fill: [['upper', [box(16, 26, 56, 35)]]] },
        ...breathe(60, 56, 71),
      ],
      anim: { upper: BOB, head: { ang: ['tab', 'SWAY', 1.5, 2] }, tail: { ang: ['tab', 'SWAY', -2, 0] } },
    },
  };

  // ---------------------------------------------------------------- batch 11
  R.spectrina = { // the lantern swings in her hand, the ghost flames drift out of step
    front: {
      parts: [
        { name: 'f1', polys: [box(0, 10, 10, 28)], z: 5 },
        { name: 'f2', polys: [box(54, 22, 62, 36)], z: 5 },
        { name: 'f3', polys: [box(59, 39, 66, 52)], z: 5 },
        { name: 'lantern', polys: [box(9, 43, 18, 65)], z: 4, pivot: [14, 44], parent: 'upper', comp: 'main', fill: [['upper', [box(8, 44, 20, 66)]]] },
        ...breathe(70, 66, 78),
      ],
      anim: { upper: BOB, lantern: { ang: ['tab', 'SWAY', 2.5, 2] }, f1: { dy: ['float', 0.5, 1.4] }, f2: { dy: ['float', 2.6, 1.4] }, f3: { dy: ['float', 4.4, 1.4] } },
    },
    back: {
      parts: [
        { name: 'f1', polys: [box(4, 26, 16, 44)], z: 5 },
        { name: 'f2', polys: [box(68, 15, 79, 35)], z: 5 },
        { name: 'f3', polys: [box(77, 50, 87, 70)], z: 5 },
        { name: 'lantern', polys: [[[63, 43], [70, 43], [70, 53], [74, 53], [74, 71], [61, 71], [61, 54], [63, 54]]], z: 4, pivot: [66, 44], parent: 'upper', comp: 'main', fill: [['upper', [box(60, 50, 64, 71)]]] },
        ...breathe(82, 87, 91),
      ],
      anim: { upper: BOB, lantern: { ang: ['tab', 'SWAY', -2.5, 2] }, f1: { dy: ['float', 0.5, 1.4] }, f2: { dy: ['float', 2.6, 1.4] }, f3: { dy: ['float', 4.4, 1.4] } },
    },
  };

  R.spindra = { // the spider legs flex after the breath; the staff sways in her hand (back)
    front: {
      parts: [
        { name: 'legL', polys: [[[0, 15], [11, 15], [11, 25], [9, 26], [9, 44], [0, 44]]], z: 3, pivot: [12, 28], parent: 'upper', comp: 'main', fill: [['upper', [box(8, 18, 14, 36)]]] },
        { name: 'legR', polys: [[[48, 15], [60, 15], [60, 44], [50, 44], [50, 26], [48, 25]]], z: 3, pivot: [47, 28], parent: 'upper', comp: 'main', fill: [['upper', [box(46, 18, 52, 36)]]] },
        ...breathe(70, 60, 77),
      ],
      anim: { upper: BOB, legL: { ang: ['tab', 'SWAY', 2, 0] }, legR: { ang: ['tab', 'SWAY', -2, 0] } },
    },
    back: {
      parts: [
        { name: 'legs', polys: [[[0, 10], [21, 10], [21, 15], [17, 17], [16, 22], [10, 24], [8, 27], [8, 44], [0, 44]]], z: 3, pivot: [18, 26], parent: 'upper', comp: 'main', fill: [['upper', [box(8, 14, 22, 30)]]] },
        { name: 'staff', polys: [[[58, 16], [71, 16], [71, 34], [57, 34], [57, 30]]], z: 4, pivot: [58, 36], parent: 'upper', comp: 'main', fill: [['upper', [box(55, 30, 62, 36)]]] },
        ...breathe(72, 71, 79),
      ],
      anim: { upper: BOB, legs: { ang: ['tab', 'SWAY', 2.5, 0] }, staff: { ang: ['tab', 'SWAY', -2, 2] } },
    },
  };

  R.sprubun = { // the lop-eared hood rocks after the breath, its long ears swinging with it
    front: {
      parts: [
        { name: 'head', polys: [box(0, 0, 51, 30)], z: 3, pivot: [25, 32], parent: 'upper', comp: 'main', fill: [['upper', [box(0, 28, 51, 33)]]] },
        ...breathe(56, 51, 68),
      ],
      anim: { upper: BOB, head: { ang: ['tab', 'SWAY', 1.5, 2] } },
    },
    back: {
      parts: [
        { name: 'head', polys: [box(0, 0, 63, 41), box(52, 42, 62, 42)], z: 3, pivot: [30, 43], parent: 'upper', comp: 'main', fill: [['upper', [box(10, 39, 50, 44)]]] },
        ...breathe(62, 63, 84),
      ],
      anim: { upper: BOB, head: { ang: ['tab', 'SWAY', 1, 2] } },
    },
  };

  R.thimbelot = { // the needle lance sways in her grip, the button shield tilts
    front: {
      parts: [
        { name: 'lance', polys: [box(6, 3, 15, 37)], z: 4, pivot: [12, 40], parent: 'upper', comp: 'main', fill: [['upper', [box(9, 33, 16, 40)]]] },
        { name: 'shield', polys: [box(47, 42, 64, 62)], z: 4, pivot: [50, 52], parent: 'upper', comp: 'main', fill: [['upper', [box(44, 42, 50, 62)]]] },
        ...breathe(76, 72, 87),
      ],
      anim: { upper: BOB, lance: { ang: ['tab', 'SWAY', 1, 2] }, shield: { ang: ['tab', 'FLICK', 4, 0] } },
    },
    back: {
      parts: [
        { name: 'lance', polys: [box(64, 2, 80, 41)], z: 4, pivot: [67, 47], parent: 'upper', comp: 'main' },
        ...breathe(80, 80, 98),
      ],
      anim: { upper: BOB, lance: { ang: ['tab', 'SWAY', -1.25, 2] } },
    },
  };

  R.tumbleyarn = { // the whole yarn ball rocks on its little legs
    front: {
      parts: [
        { name: 'lower', polys: [box(0, 47, 50, 58)], z: 1, comp: 'main' },
        { name: 'upper', polys: null, z: 2, pivot: [25, 26], fill: [['lower', [box(0, 44, 50, 47)]]] },
      ],
      anim: { upper: { dy: ['tab', 'BOB', 1], ang: ['tab', 'SWAY', 2, 0] } },
    },
    back: {
      parts: [
        { name: 'lower', polys: [box(0, 61, 67, 77)], z: 1, comp: 'main' },
        { name: 'upper', polys: null, z: 2, pivot: [33, 32], fill: [['lower', [box(0, 58, 67, 61)]]] },
      ],
      anim: { upper: { dy: ['tab', 'BOB', 1], ang: ['tab', 'SWAY', -1.5, 0] } },
    },
  };

  R.tumbora = { // the fringed parasol sways in her hand after the breath
    front: {
      parts: [
        { name: 'parasol', polys: [[[0, 0], [31, 0], [31, 18], [16, 18], [16, 24], [12, 24], [12, 18], [0, 18]]], z: 4, pivot: [14, 27], parent: 'upper', comp: 'main', fill: [['upper', [box(12, 18, 17, 28)]]] },
        ...breathe(66, 48, 76),
      ],
      anim: { upper: BOB, parasol: { ang: ['tab', 'SWAY', 2, 2] } },
    },
    back: {
      parts: [
        { name: 'parasol', polys: [[[22, 0], [66, 0], [66, 26], [46, 26], [46, 44], [42, 44], [42, 26], [36, 26], [36, 24], [22, 24]]], z: 4, pivot: [44, 48], parent: 'upper', comp: 'main' },
        ...breathe(88, 66, 101),
      ],
      anim: { upper: BOB, parasol: { ang: ['tab', 'SWAY', -1, 2] } },
    },
  };

  NP.art.autospriteRigs = R;
})(typeof globalThis !== 'undefined' ? globalThis : window);
