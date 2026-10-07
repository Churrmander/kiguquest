/* src/data/text/_api.js — NP.text: the text registry (dialogue, system lines, story scenes, trainer-class banks).
 *
 * Every other file under src/data/text/ only calls NP.text.add(...) / NP.text.addBank(...). Nothing here touches the
 * DOM, the RNG or the game state, so it is safe in Node tests. Missing keys return null / the default, never throw.
 * Full guide: docs/text.md.
 *
 *   NP.text.get('button_town.kid_a')        -> ['page', 'page'] | null        (the hook used by src/game/overworld.js)
 *   NP.text.t('sys.battle.wild', {mon:..})  -> 'formatted string'             (system lines; pages joined with \\p)
 *   NP.text.add({ key: 'one page' | ['page 1', 'page 2'] })                    (authoring)
 *   NP.text.addBank('class.hiker.intro', ['line', ['page 1', 'page 2'], ...])  (alternatives; see docs/text.md)
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});

  const entries = Object.create(null); // key -> string[]            (consecutive pages)
  const banks = Object.create(null);   // key -> string[][]          (alternative variants, each a page list)
  const dupes = [];                    // keys defined twice (tests assert this stays empty)
  let seq = 0;

  /** Known {variables}. The engine/game supplies the contextual ones when it calls NP.text.t / NP.text.fmt. */
  const VARS = {
    player: 'the player\'s name (NP.fmtVars, set by the game)',
    rival: 'the rival\'s name, default Tomo (NP.fmtVars)',
    kigu: 'a Kigu\'s display name, e.g. Konko (nickname or species name)',
    mon: 'a battle label: the plain name for your side, "Wild X" / "Foe X" for the other side (BMon.label())',
    foe: 'the opposing Kigu\'s name/label',
    trainer: 'full trainer title, e.g. "Tailor Lia"',
    cls: 'trainer class, e.g. "Tailor"',
    name: 'a person\'s name (trainer name, NPC name)',
    item: 'an item name, e.g. "Bond Spool"',
    move: 'a move name',
    old: 'a forgotten move name',
    stat: 'a stat name (Attack, Defense, Sp. Atk, Sp. Def, Speed, accuracy, evasiveness)',
    n: 'a count',
    lv: 'a level number',
    hp: 'an HP amount',
    exp: 'an Exp. Points amount',
    money: 'a money amount (digits only; write the $ in the text)',
    to: 'the evolution target\'s species name',
    from: 'the pre-evolution species name',
    place: 'a place name',
    status: 'a status adjective (burned, poisoned, paralyzed, asleep, frozen)',
    starter: 'the player\'s starter species name (Konko / Ottopi / Sprubun)',
    rstarter: 'the rival\'s starter species name',
    twin: 'the legendary twin the player befriended (Warpa or Weftie)',
    twin2: 'the other twin (the one Madame Damask keeps)',
    count: 'a generic number (Buttons earned, Kigu seen...)',
  };

  /** Worst-case values used by tests to check that a line still fits the box (see tests/text.test.mjs). */
  const SAMPLE = {
    player: 'WWWWWWWW', rival: 'WWWWWWWW', kigu: 'WWWWWWWWWW', mon: 'Foe WWWWWWWWWW', foe: 'Foe WWWWWWWWWW',
    trainer: 'Scientist WWWWWWWW', cls: 'Scientist', name: 'WWWWWWWW', item: 'Sparkle Brooch', move: 'Flurry Swipe', old: 'Flurry Swipe',
    stat: 'Sp. Atk', n: '99', lv: '100', hp: '999', exp: '99999', money: '999999', to: 'WWWWWWWWWW', from: 'WWWWWWWWWW',
    place: 'Seamstead City', status: 'paralyzed', starter: 'Ottomarine', rstarter: 'Ottomarine', twin: 'Warpa', twin2: 'Weftie', count: '99',
  };

  function pagesOf(p) {
    if (p === null || p === undefined) return [];
    return (Array.isArray(p) ? Array.from(p) : [p]).map(String);
  }

  function hash(s) {
    let h = 2166136261;
    s = String(s);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }

  /** 'Net Kid' -> 'net_kid' */
  function classKey(cls) {
    return String(cls || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  const TRAINER_KEY = /^([a-z0-9_]+)\.([a-z0-9_]+)\.(intro|win|lose|after)$/;

  /**
   * Trainer fall-back: for '<map>.<npc>.<field>' with no explicit entry, and only if the trainer object in the map has no
   * inline text for that field, use the class bank class.<cls>.<field>. Trainers of one class on one map get different
   * variants (by their order in the map's npc list), and the variant index is shared by intro/win/lose/after, so one trainer
   * keeps one "personality".
   */
  function classFallback(key) {
    const m = TRAINER_KEY.exec(key);
    if (!m || !NP.maps) return null;
    const def = NP.maps[m[1]];
    if (!def || !def.npcs) return null;
    const npc = def.npcs.find((n) => n.id === m[2]);
    if (!npc || !npc.trainer) return null;
    const tr = npc.trainer;
    if (tr[m[3]] !== undefined && tr[m[3]] !== null && tr[m[3]] !== '') return null; // inline text wins
    const cls = classKey(tr.cls);
    const bank = banks['class.' + cls + '.' + m[3]];
    if (!bank || !bank.length) return null;
    const mates = def.npcs.filter((n) => n.trainer && classKey(n.trainer.cls) === cls);
    const idx = Math.max(0, mates.indexOf(npc));
    return bank[(hash(m[1]) + idx) % bank.length];
  }

  const T = {
    VARS, SAMPLE, dupes, classKey, hash,

    /** Define (or replace) one entry. pages: string | string[]. Each array element is one message (<= 2 lines; '\\p' also pages). */
    set(key, pages) {
      key = String(key);
      if (entries[key] || banks[key]) dupes.push(key);
      delete banks[key];
      entries[key] = pagesOf(pages);
      return key;
    },
    /** Bulk define: { key: pages, ... } */
    add(obj) {
      for (const k of Object.keys(obj)) T.set(k, obj[k]);
      return T;
    },
    /** Define a bank of alternative lines. variants: array of (string | string[]). */
    setBank(key, variants) {
      key = String(key);
      if (entries[key] || banks[key]) dupes.push(key);
      delete entries[key];
      banks[key] = (variants || []).map(pagesOf);
      return key;
    },
    addBank(obj) {
      for (const k of Object.keys(obj)) T.setBank(k, obj[k]);
      return T;
    },

    has(key) { return !!(entries[key] || banks[key]); },
    isBank(key) { return !!banks[key]; },
    /** All explicit keys (entries + banks), sorted. */
    keys() { return Object.keys(entries).concat(Object.keys(banks)).sort(); },
    bankKeys() { return Object.keys(banks).sort(); },
    /** Every variant of a key as a list of page lists (a plain entry has exactly one). */
    variants(key) {
      if (banks[key]) return banks[key].map((v) => Array.from(v));
      if (entries[key]) return [Array.from(entries[key])];
      return [];
    },

    /**
     * Pages for `key`, or null. Plain entry -> its pages. Bank -> one variant (pass a seed for a stable choice, e.g. an
     * npc id; without a seed it rotates). Trainer keys with no entry fall back to the class bank (see classFallback).
     */
    get(key, seed) {
      try {
        if (entries[key]) return Array.from(entries[key]);
        const b = banks[key];
        if (b && b.length) return Array.from(b[(seed === undefined ? seq++ : hash(seed)) % b.length]);
        const c = classFallback(String(key));
        return c ? Array.from(c) : null;
      } catch (e) { return null; }
    },
    pick(key, seed) { return T.get(key, seed); },

    /** Substitute {vars}: `vars` first, then NP.fmtVars (player, rival), unknown names are left as written. */
    fmt(str, vars) {
      return String(str).replace(/\{(\w+)\}/g, (m, k) => {
        if (vars && Object.prototype.hasOwnProperty.call(vars, k) && vars[k] !== undefined && vars[k] !== null) return String(vars[k]);
        const f = NP.fmtVars && NP.fmtVars[k];
        if (f) { try { const v = f(); if (v !== undefined && v !== null) return String(v); } catch (e) { /* keep */ } }
        return m;
      });
    },
    /** Formatted pages (array) for `key`, or null. */
    pages(key, vars, seed) {
      const p = T.get(key, seed);
      return p ? p.map((s) => T.fmt(s, vars)) : null;
    },
    /** One formatted string for system lines: pages joined with the \\p page break. `dflt` is used (formatted) if the key is missing. */
    t(key, vars, dflt) {
      const p = T.get(key);
      if (!p || !p.length) return dflt === undefined ? '' : T.fmt(dflt, vars);
      return p.map((s) => T.fmt(s, vars)).join('\\p');
    },

    /** The box a key is written for: { lines, width } in pixels of Font.width. Used by the tests; authors obey it. */
    budget(key) {
      key = String(key);
      if (key === 'sys.battle.prompt') return { lines: 2, width: 112 };     // the half-width "What will X do?" box
      if (key.indexOf('sys.ui.') === 0) return { lines: 1, width: 224 };    // single-line notes drawn straight on a panel
      return { lines: 2, width: 216 };                                      // message box: 240 - 24 px, 2 lines
    },
  };

  NP.text = T;
})(typeof globalThis !== 'undefined' ? globalThis : window);
