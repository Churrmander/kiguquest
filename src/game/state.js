/* NP.state — the whole save file as plain JSON, plus helpers (party, bag, dex, flags) and localStorage save/load. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const KEY = 'kiguquest.save.v1';

  NP.fmtVars = NP.fmtVars || {};
  NP.fmtVars.player = () => (NP.state && NP.state.name) || 'Hero';
  NP.fmtVars.rival = () => (NP.state && NP.state.rival) || 'Tomo';

  const S = {
    fresh(name, gender) {
      return {
        v: 1, name: name || 'Hero', gender: gender || 'm', rival: 'Tomo',
        party: [], box: [], bag: {}, money: 1000, flags: {}, badges: [], steps: 0, frames: 0, repel: 0,
        pos: { map: 'lab', x: 5, y: 9, dir: 'up' },
        healPoint: { map: 'player_house', spawn: 'door' },
        dex: { seen: {}, caught: {} }, starter: null, rivalStarter: null,
        opts: { textSpeed: 1, battleAnim: true, battleStyle: 'shift' },
        saved: 0,
      };
    },
    lookId(st) { return (st || NP.state).gender === 'f' ? 'hero_f' : 'hero_m'; },

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
        return st;
      } catch (e) { return null; }
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
  NP.State = S;
  NP.state = null;
})(typeof globalThis !== 'undefined' ? globalThis : window);
