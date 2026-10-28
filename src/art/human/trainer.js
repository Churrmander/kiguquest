/* src/art/human/trainer.js — 80×80 trainer battle sprites (front / back) for NP.art.human.
 *
 * Full-body figure ≈ 4 heads tall (DS 5th-gen trainer proportions: more grown-up than the overworld sprite, same person,
 * same palette). Feet on row 77, outline on row 78: anchor bottom-centre (40, 78). Built by L.compose (ow.js) at target 'tr'.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const HUM = NP.art.human;
  const L = HUM._;
  const TR = (L.trainer = L.trainer || {});
  TR.MAX_COLORS = 32;
  TR.POSES = ['ready', 'windup', 'throw', 'follow'];
  /** kind 'front' | 'back'; pose (back only): 'ready' (= plain back) | 'windup' | 'throw' | 'follow' — the right arm throwing. */
  TR.render = function (S, kind, pose) {
    return L.compose(S, 'tr', kind === 'back' ? 'up' : 'down', 0, kind === 'back' ? pose : null).render({ outline: 'flat', maxColors: TR.MAX_COLORS });
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
