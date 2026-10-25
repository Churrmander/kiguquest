/* src/game/arcade/prizes.js — what the prize counter sells for tickets: held items (defined here with their battle hooks),
 * Cabbi the taxi Kigu, and Tailor Card designs. Held items whose icons already exist in src/art/icons/items-held.js are given
 * data here; the type pins (pin_<type>) give that type's moves a 20% boost. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const AR = NP.arcade;
  const FX = NP.battleFx;
  const reg = (id, def) => (FX && FX.registerItem ? FX.registerItem(id, def) : (NP.data.items[id] = def));

  // ------------------------------------------------------------------------------------------- held items
  const eff = (move, target) => (NP.Battle && NP.Battle.effectiveness ? NP.Battle.effectiveness(move.type, target) : NP.typeEffect(move.type, target.types));
  reg('expert_belt', {
    name: 'Expert Belt', pocket: 'items', price: 0, desc: 'Held: moves that are super effective hit 20% harder.',
    held: { modDamage(c, dmg) { if (c.move && c.target && eff(c.move, c.target) > 1) return Math.floor(dmg * 1.2); } },
  });
  reg('sturdy_sash', {
    name: 'Sturdy Sash', pocket: 'items', price: 0, desc: 'Held: at full HP, she hangs on with 1 HP after a hit that would knock her out. Used up.',
    held: {
      onDamage(c, amount) {
        const m = c.holder;
        if (c.cause === 'hit' && m.hp === m.maxhp && amount >= m.hp && m.hp > 1) {
          c.battle.msg(m.label() + ' hung on with the Sturdy Sash!');
          c.battle.consumeItem(m);
          return m.hp - 1;
        }
      },
    },
  });
  reg('quick_claw', {
    name: 'Quick Claw', pocket: 'items', price: 0, desc: 'Held: sometimes lets her move first.',
    held: { modBracket(c, v) { if (c.battle.rand(5) === 0) return v + 1; } },
  });
  reg('coin_charm', {
    name: 'Coin Charm', pocket: 'items', price: 0, desc: 'Held: doubles the prize money you win from Tailor battles.',
    held: {},
  });
  // type pins: one for each type, a 20% boost to moves of that type
  for (const t of Object.keys(NP.data.types)) {
    const T = NP.data.types[t].name;
    reg('pin_' + t, {
      name: T + ' Pin', pocket: 'items', price: 0, desc: 'Held: ' + T + '-type moves are 20% stronger.', pinType: t,
      held: { modPower(c, p) { if (c.move && c.move.type === t) return Math.floor(p * 1.2); } },
    });
  }

  // ------------------------------------------------------------------------------------------- the catalogue
  AR.CABBI = 'cabbi';   // added by the Chapter 4-6 work; the prize hides itself until the species exists
  AR.CARDS = {
    plain: { name: 'Classic', price: 0, desc: 'The card the Tailor Association hands out.' },
    gingham: { name: 'Gingham', price: 150, desc: 'Red and white gingham, like a picnic blanket.' },
    denim: { name: 'Denim', price: 200, desc: 'Blue denim with orange topstitching and a rivet in each corner.' },
    patchwork: { name: 'Patchwork', price: 250, desc: 'Squares of every fabric in Tsumugi, stitched together.' },
    neon: { name: 'Neon Night', price: 300, desc: 'Shibuyarn after dark: pink and blue neon on deep purple.' },
    starry: { name: 'Starry Sky', price: 300, desc: 'Navy blue scattered with little gold stars.' },
    gold: { name: 'Gold Thread', price: 1000, desc: 'Cream silk with gold embroidery. For the arcade\'s best customers.' },
  };
  /** The sections of the prize counter. Each prize: { kind, id, price, name, desc, icon() } */
  AR.catalogue = function () {
    const items = [
      ['plum_treat', 150], ['wish_candy', 250], ['snack_bag', 300], ['quick_claw', 450],
      ['expert_belt', 700], ['sturdy_sash', 700], ['coin_charm', 900],
    ].filter(([id]) => NP.data.items[id]).map(([id, price]) => ({ kind: 'item', id, price, name: NP.data.items[id].name, desc: NP.data.items[id].desc }));
    const pins = Object.keys(NP.data.types).filter((t) => NP.data.items['pin_' + t])
      .map((t) => ({ kind: 'item', id: 'pin_' + t, price: 400, name: NP.data.items['pin_' + t].name, desc: NP.data.items['pin_' + t].desc }));
    const kigu = [];
    if (NP.data.species[AR.CABBI]) {
      kigu.push({ kind: 'kigu', id: AR.CABBI, price: 2000, level: 25, name: NP.data.species[AR.CABBI].name + ' Lv25',
        desc: 'A taxi Kigu who rushes everywhere, very kindly. The arcade only has the one.', once: true });
    }
    const cards = Object.keys(AR.CARDS).map((k) => ({ kind: 'card', id: k, price: AR.CARDS[k].price, name: AR.CARDS[k].name + ' card', desc: AR.CARDS[k].desc, once: true }));
    const out = [{ name: 'Held items', list: items }, { name: 'Type Pins', list: pins }];
    if (kigu.length) out.push({ name: 'Kigu', list: kigu });
    out.push({ name: 'Card designs', list: cards });
    return out;
  };
  /** Has this one-off prize already been taken? */
  AR.owned = function (p) {
    const a = AR.st();
    if (p.kind === 'card') return p.id === 'plain' || !!a.cards[p.id];
    if (p.kind === 'kigu') return !!a.bought[p.id];
    return false;
  };

  // coin charm: doubles Tailor prize money while a party Kigu holds it (overworld.js calls this when paying out)
  AR.moneyBonus = function (money) {
    const party = NP.state ? NP.state.party : [];
    return party.some((k) => k && k.item === 'coin_charm') ? money * 2 : money;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
