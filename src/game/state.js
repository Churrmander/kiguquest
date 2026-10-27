/* NP.state — the whole save file as plain JSON, plus helpers (party, bag, dex, flags) and localStorage save/load. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const KEY = 'kiguquest.save.v1';

  NP.fmtVars = NP.fmtVars || {};
  NP.fmtVars.player = () => (NP.state && NP.state.name) || 'Hero';
  NP.fmtVars.rival = () => (NP.state && NP.state.rival) || 'Draco';

  // Lore: the two protagonists are Dahlia (girl) and Draco (boy), childhood friends. You play one (and may rename them); the other is your
  // friendly rival. Defaults: girl = Dahlia, boy = Draco. If you give yourself the rival's default name, the rival gets a near-twin instead.
  const DEFAULT_NAME = { f: 'Dahlia', m: 'Draco' };
  const RIVAL_ALT = { f: 'Dalia', m: 'Drake' };
  const other = (g) => (g === 'f' ? 'm' : 'f');
  const defaultName = (g) => DEFAULT_NAME[g === 'f' ? 'f' : 'm'];
  const rivalNameFor = (playerName, gender) => {
    const rg = other(gender === 'f' ? 'f' : 'm'), n = DEFAULT_NAME[rg];
    return String(playerName || '').trim().toLowerCase() === n.toLowerCase() ? RIVAL_ALT[rg] : n;
  };

  const S = {
    fresh(name, gender) {
      return {
        v: 1, name: name || defaultName(gender), gender: gender || 'm', rival: rivalNameFor(name || defaultName(gender), gender || 'm'),
        party: [], box: [], bag: {}, money: 1000, flags: {}, badges: [], steps: 0, frames: 0, repel: 0,
        pos: { map: 'player_house', x: 6, y: 3, dir: 'down' },
        healPoint: { map: 'player_house', spawn: 'door' },
        visited: {},
        dex: { seen: {}, caught: {} }, starter: null, rivalStarter: null,
        fish: { pocket: [], log: {} },
        registered: null,   // the key item Select uses (a rod now; bikes later)   // the Fish Pocket and the Fishing Log (src/game/fishing.js)
        opts: { textSpeed: 1, battleAnim: true, battleStyle: 'shift' },
        saved: 0,
      };
    },
    lookId(st) { return (st || NP.state).gender === 'f' ? 'hero_f' : 'hero_m'; },
    /** the rival is the other protagonist: opposite-gender hero look */
    rivalLookId(st) { return (st || NP.state).gender === 'f' ? 'hero_m' : 'hero_f'; },

    // ---- storage
    hasSave() { try { return !!root.localStorage.getItem(KEY); } catch (e) { return false; } },
    peek() {
      try {
        const s = JSON.parse(root.localStorage.getItem(KEY));
        return s ? { name: s.name, badges: s.badges.filter(Boolean).length, dex: Object.keys(s.dex.caught).length, frames: s.frames, map: s.pos.map } : null;
      } catch (e) { return null; }
    },
    save(state) {
      state = state || NP.state;
      try {
        state.saved = Date.now();
        root.localStorage.setItem(KEY, JSON.stringify(state));
        return true;
      } catch (e) { return false; }
    },
    load() {
      try {
        const s = JSON.parse(root.localStorage.getItem(KEY));
        if (!s || !s.party) return null;
        const f = S.fresh();
        const st = Object.assign(f, s);
        st.opts = Object.assign(f.opts, s.opts || {});
        if (!st.rival || st.rival === 'Tomo') st.rival = rivalNameFor(st.name, st.gender); // saves from before the lore change
        S.migrateSpecies(st); // saves from before the round 2 Kigu renames
        return st;
      } catch (e) { return null; }
    },
    /** Move renamed species ids (NP.data.renamed, old -> new) onto their new ids: party, box, Sketchbook, starters. */
    migrateSpecies(st) {
      const R = (NP.data && NP.data.renamed) || {};
      const to = (id) => R[id] || id;
      for (const k of (st.party || []).concat(st.box || [])) if (k && k.species) k.species = to(k.species);
      for (const key of ['seen', 'caught']) {
        const m = (st.dex && st.dex[key]) || {};
        for (const id of Object.keys(m)) if (R[id]) { m[R[id]] = m[id]; delete m[id]; }
      }
      if (st.starter) st.starter = to(st.starter);
      if (st.rivalStarter) st.rivalStarter = to(st.rivalStarter);
      return st;
    },
    erase() { try { root.localStorage.removeItem(KEY); } catch (e) { /* */ } },

    // ---- helpers (operate on NP.state)
    flag(k) { return !!NP.state.flags[k]; },
    setFlag(k, v) { NP.state.flags[k] = v === undefined ? true : v; },
    count(item) { return NP.state.bag[item] || 0; },
    addItem(item, n) { NP.state.bag[item] = (NP.state.bag[item] || 0) + (n || 1); },
    removeItem(item, n) {
      const b = NP.state.bag;
      b[item] = (b[item] || 0) - (n || 1);
      if (b[item] <= 0) delete b[item];
    },
    seen(id) { NP.state.dex.seen[id] = 1; },
    caught(id) { NP.state.dex.seen[id] = 1; NP.state.dex.caught[id] = 1; },
    /** add to party or, if full, the box. returns 'party'|'box' */
    addKigu(k) {
      S.caught(k.species);
      if (!k.ot) { k.ot = NP.state.name; }
      if (NP.state.party.length < 6) { NP.state.party.push(k); return 'party'; }
      NP.state.box.push(k);
      return 'box';
    },
    hasUsable() { return NP.state.party.some((k) => k.hp > 0); },
    firstUsable() { return NP.state.party.findIndex((k) => k.hp > 0); },
    healAll() { for (const k of NP.state.party) NP.Kigu.healFull(k); },
    timeString() {
      const s = Math.floor(NP.state.frames / 60);
      return Math.floor(s / 3600) + ':' + NP.util.pad(Math.floor(s / 60) % 60, 2) + ':' + NP.util.pad(s % 60, 2);
    },
  };
  S.defaultName = defaultName;
  S.rivalNameFor = rivalNameFor;
  NP.State = S;
  NP.state = null;
})(typeof globalThis !== 'undefined' ? globalThis : window);
