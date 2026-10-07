/* src/art/human/api.js — the public NP.art.human API (DESIGN §4B): overworld / front / back / has / ids / looks / make.
 * Results are cached per look — callers must clone() bitmaps before mutating them.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const HUM = NP.art.human;
  const L = HUM._;

  function build(table) {
    const cache = Object.create(null);
    const norm = Object.create(null);
    const api = { looks: table };
    const spec = (id) => {
      if (!table[id]) throw new Error('NP.art.human: unknown look "' + id + '"');
      return norm[id] || (norm[id] = L.normalize(table[id], id));
    };
    const memo = (kind, id, fn) => {
      const k = kind + ':' + id;
      return cache[k] || (cache[k] = fn(spec(id)));
    };
    api.has = (id) => Object.prototype.hasOwnProperty.call(table, id);
    api.ids = () => Object.keys(table);
    api.overworld = (id) => memo('ow', id, (S) => L.ow.build(S));
    api.front = (id) => memo('front', id, (S) => L.portrait.render(S, 'front'));
    api.back = (id) => memo('back', id, (S) => L.portrait.render(S, 'back'));
    /** The normalised (canonical) spec of a look — handy for tools and tests. */
    api.spec = (id) => spec(id);
    return api;
  }

  const main = build(HUM.looks);
  Object.assign(HUM, main);
  HUM.looks = main.looks;

  let adhoc = 0;
  /** make(spec) -> an API object for a one-off look (quick NPCs). Its methods take an optional (ignored) id. */
  HUM.make = function (spec) {
    const id = (spec && spec.id) || 'adhoc_' + ++adhoc;
    const table = {};
    table[id] = Object.assign({}, spec, { id });
    const a = build(table);
    const wrap = (fn) => (x) => fn(id);
    return {
      id,
      looks: table,
      has: (x) => x === undefined || x === id,
      ids: () => [id],
      overworld: wrap(a.overworld),
      front: wrap(a.front),
      back: wrap(a.back),
      spec: wrap(a.spec),
    };
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
