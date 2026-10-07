/* The 17 types and the effectiveness chart (classic Gen 2–5 relationships under Kigu Quest names). */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});

  const LIST = [
    ['fluff', 'Fluff', '#b8b09a'], ['ember', 'Ember', '#ef7d3c'], ['tide', 'Tide', '#4f8fe8'], ['volt', 'Volt', '#f2cf3a'],
    ['sprout', 'Sprout', '#6cbf4a'], ['frost', 'Frost', '#8fdcdc'], ['brawl', 'Brawl', '#c4453a'], ['nettle', 'Nettle', '#a055b0'],
    ['terra', 'Terra', '#d9b25f'], ['gale', 'Gale', '#9db3f0'], ['dream', 'Dream', '#f0609c'], ['buzz', 'Buzz', '#a6b92e'],
    ['pebble', 'Pebble', '#b09a4a'], ['spook', 'Spook', '#6a5a9e'], ['drake', 'Drake', '#5b3fd6'], ['shade', 'Shade', '#5a4a42'],
    ['iron', 'Iron', '#aab4c8'],
  ];

  // attacker -> { defender: multiplier }   (missing = 1)
  const CHART = {
    fluff: { pebble: 0.5, iron: 0.5, spook: 0 },
    ember: { sprout: 2, frost: 2, buzz: 2, iron: 2, ember: 0.5, tide: 0.5, pebble: 0.5, drake: 0.5 },
    tide: { ember: 2, terra: 2, pebble: 2, tide: 0.5, sprout: 0.5, drake: 0.5 },
    volt: { tide: 2, gale: 2, volt: 0.5, sprout: 0.5, drake: 0.5, terra: 0 },
    sprout: { tide: 2, terra: 2, pebble: 2, ember: 0.5, sprout: 0.5, nettle: 0.5, gale: 0.5, buzz: 0.5, drake: 0.5, iron: 0.5 },
    frost: { sprout: 2, terra: 2, gale: 2, drake: 2, ember: 0.5, tide: 0.5, frost: 0.5, iron: 0.5 },
    brawl: { fluff: 2, frost: 2, pebble: 2, shade: 2, iron: 2, nettle: 0.5, gale: 0.5, dream: 0.5, buzz: 0.5, spook: 0 },
    nettle: { sprout: 2, nettle: 0.5, terra: 0.5, pebble: 0.5, spook: 0.5, iron: 0 },
    terra: { ember: 2, volt: 2, nettle: 2, pebble: 2, iron: 2, sprout: 0.5, buzz: 0.5, gale: 0 },
    gale: { sprout: 2, brawl: 2, buzz: 2, volt: 0.5, pebble: 0.5, iron: 0.5 },
    dream: { brawl: 2, nettle: 2, dream: 0.5, iron: 0.5, shade: 0 },
    buzz: { sprout: 2, dream: 2, shade: 2, ember: 0.5, brawl: 0.5, nettle: 0.5, gale: 0.5, spook: 0.5, iron: 0.5 },
    pebble: { ember: 2, frost: 2, gale: 2, buzz: 2, brawl: 0.5, terra: 0.5, iron: 0.5 },
    spook: { dream: 2, spook: 2, shade: 0.5, iron: 0.5, fluff: 0 },
    drake: { drake: 2, iron: 0.5 },
    shade: { dream: 2, spook: 2, brawl: 0.5, shade: 0.5, iron: 0.5 },
    iron: { frost: 2, pebble: 2, ember: 0.5, tide: 0.5, volt: 0.5, iron: 0.5 },
  };

  const types = {};
  for (const [id, name, color] of LIST) types[id] = { id, name, color };
  NP.data.types = types;
  NP.data.typeIds = LIST.map((t) => t[0]);
  NP.data.typeChart = CHART;

  /** Multiplier of a single attacking type vs a single defending type. '???' (typeless) is always 1. */
  NP.typeMult = function (att, def) {
    const row = CHART[att];
    if (!row) return 1;
    const v = row[def];
    return v === undefined ? 1 : v;
  };

  /** Combined multiplier vs a list of defending types (0, 0.25, 0.5, 1, 2, 4). */
  NP.typeEffect = function (att, defTypes) {
    let m = 1;
    for (let i = 0; i < defTypes.length; i++) m *= NP.typeMult(att, defTypes[i]);
    return m;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
