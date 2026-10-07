/* src/art/human/spec.js — look-spec normalisation shared by the overworld and portrait renderers.
 *
 * A look spec is a small plain object (see docs/art-human.md). normalize(spec) fills defaults, resolves colour names
 * and returns the canonical form both renderers consume, so one spec always yields the same person at both scales.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const HUM = (NP.art.human = NP.art.human || {});
  const L = HUM._;
  const { Color } = NP;

  const BUILDS = ['child', 'teen', 'adult', 'elder', 'stout', 'tall'];
  L.BUILDS = BUILDS;

  /** Outfit templates: which garments they imply (used for defaults; renderers switch on outfit.type). */
  L.OUTFITS = {
    tee: { bottom: 'pants' },
    jacket: { bottom: 'pants' },
    hoodie: { bottom: 'pants' },
    vest: { bottom: 'pants' },
    dress: { bottom: 'none' },
    apron: { bottom: 'skirt' },
    labcoat: { bottom: 'pants' },
    uniform: { bottom: 'pants' },
    cardigan: { bottom: 'skirt' },
    coat: { bottom: 'pants' },
    overalls: { bottom: 'overall' },
    robe: { bottom: 'none' },
    maid: { bottom: 'none' },
    suit: { bottom: 'pants' },
    sailor: { bottom: 'skirt' },
    gown: { bottom: 'none' },
  };
  L.BOTTOMS = ['pants', 'shorts', 'skirt', 'longskirt', 'none', 'overall'];
  L.HAIRSTYLES = []; // filled by hair modules
  L.ACCS = []; // filled by accessory modules

  function skinRamp(v) {
    if (Array.isArray(v)) return v.map((c) => Color.parse(c));
    if (typeof v === 'number' && v >= 0 && v < L.SKIN_ORDER.length) return L.SKIN[L.SKIN_ORDER[v]].map((c) => Color.parse(c));
    if (typeof v === 'string' && L.SKIN[v]) return L.SKIN[v].map((c) => Color.parse(c));
    if (typeof v === 'string') return L.ramp(v); // a hex base
    return L.SKIN.fair.map((c) => Color.parse(c));
  }

  function hairRamp(c) {
    const base = L.col(c, L.HAIR);
    const r = L.ramp(base);
    return r;
  }

  /** Accessory entry: 'type' | 'type:color' | 'type:color/color2' | {type,color,color2,...} */
  function normAcc(a) {
    if (!a) return null;
    if (typeof a === 'string') {
      const [type, cols] = a.split(':');
      const [c1, c2] = (cols || '').split('/');
      a = { type, color: c1 || undefined, color2: c2 || undefined };
    }
    const o = Object.assign({}, a);
    if (o.color !== undefined) o.color = L.col(o.color);
    if (o.color2 !== undefined) o.color2 = L.col(o.color2);
    return o;
  }

  /**
   * Canonical spec:
   * { id, name, build, sex, skin:[4], hair:{style,color,ramp:[4]}, eyes, face:{eyes,mouth,blush,brows},
   *   outfit:{type, main, trim, under, pattern}, bottom:{type,color}, legs, shoes, acc:[...], pose, facial, seed }
   */
  function normalize(spec, id) {
    spec = spec || {};
    const S = {};
    S.id = spec.id || id || 'custom';
    S.name = spec.name || S.id;
    S.build = BUILDS.includes(spec.build) ? spec.build : 'teen';
    S.sex = spec.sex === 'f' ? 'f' : 'm';
    S.skin = skinRamp(spec.skin === undefined ? 'fair' : spec.skin);
    const hs = spec.hair || {};
    const hstyle = typeof hs === 'string' ? hs : hs.style;
    S.hair = { style: hstyle || (S.sex === 'f' ? 'bob' : 'short'), color: L.col((typeof hs === 'object' && hs.color) || spec.hairColor || 'brown', L.HAIR) };
    S.hair.ramp = hairRamp(S.hair.color);
    S.eyes = L.col(spec.eyes || 'brown', L.EYES);
    const f = spec.face || {};
    S.face = {
      eyes: f.eyes || 'normal', // normal | happy | serious | sleepy | sharp | closed | wide
      mouth: f.mouth || 'smile', // smile | grin | flat | o | smirk | frown | cat
      blush: f.blush === undefined ? S.build === 'child' || S.sex === 'f' : !!f.blush,
      brows: f.brows || 'normal', // normal | stern | worried | raised
      lashes: f.lashes === undefined ? S.sex === 'f' : !!f.lashes,
    };
    const o = typeof spec.outfit === 'string' ? { type: spec.outfit } : Object.assign({}, spec.outfit || {});
    o.type = L.OUTFITS[o.type] ? o.type : 'tee';
    o.main = L.col(o.main || spec.top || 'blue');
    o.trim = L.col(o.trim || spec.trim || 'white');
    o.under = L.col(o.under || spec.under || o.trim);
    S.outfit = o;
    const b = typeof spec.bottom === 'string' ? { type: spec.bottom } : Object.assign({}, spec.bottom || {});
    b.type = L.BOTTOMS.includes(b.type) ? b.type : L.OUTFITS[o.type].bottom;
    b.color = L.col(b.color || spec.bottomColor || (b.type === 'none' ? o.main : 'navy'));
    S.bottom = b;
    S.legs = spec.legs ? L.col(spec.legs) : null; // socks / tights colour (null = bare skin below shorts/skirts)
    S.shoes = L.col(spec.shoes || 'brown');
    S.acc = (spec.acc || []).map(normAcc).filter(Boolean);
    S.pose = spec.pose || 'stand';
    S.facial = spec.facial || null; // 'beard' | 'mustache' | 'stubble' | null
    S.facialColor = spec.facialColor ? L.col(spec.facialColor, L.HAIR) : S.hair.color;
    S.seed = spec.seed || S.id;
    return S;
  }
  L.normalize = normalize;
  L.hasAcc = (S, type) => S.acc.find((a) => a.type === type) || null;
})(typeof globalThis !== 'undefined' ? globalThis : window);
