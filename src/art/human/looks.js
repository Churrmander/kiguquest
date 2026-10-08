/* src/art/human/looks.js — the look specs for every person in BIBLE §4 (NP.art.human.looks[id]).
 *
 * A look is a few lines: build / sex / skin / hair / eyes / face / outfit / bottom / legs / shoes / acc[] (see docs/art-human.md).
 * Colour names come from paper.js (L.CLOTH, L.HAIR, L.EYES) or any hex.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const HUM = NP.art.human;
  const looks = (HUM.looks = HUM.looks || {});
  const def = (id, spec) => { spec.id = id; looks[id] = spec; };
  const hair = (style, color) => ({ style, color });
  const out = (type, main, trim, under) => ({ type, main, trim, under });

  // ---- P1: heroes, rival, friends, professor ----
  def('hero_m', { name: 'Hero (boy)', build: 'teen', sex: 'm', skin: 'fair', hair: hair('spiky', 'chestnut'), eyes: 'brown',
    face: { eyes: 'normal', mouth: 'grin', brows: 'normal' }, outfit: out('jacket', 'red', 'white', 'white'), bottom: { type: 'pants', color: 'navy' }, shoes: 'white',
    acc: ['satchel:#a0642e'] });
  def('hero_f', { name: 'Hero (girl)', build: 'teen', sex: 'f', skin: 'fair', hair: hair('ponytail', 'blonde'), eyes: 'blue',
    face: { eyes: 'normal', mouth: 'smile' }, outfit: out('overalls', 'white', 'denim', 'white'), bottom: { type: 'shorts', color: 'denim' }, legs: 'white', shoes: 'chocolate',
    acc: ['beret:#b8302e/#e8c870', 'satchel:#a0642e', 'belt:#7c4e30', 'spools'] });
  def('tomo', { name: 'Tomo', build: 'teen', sex: 'm', skin: 'pale', hair: hair('sidepart', 'ink'), eyes: 'grey',
    face: { eyes: 'serious', mouth: 'flat', brows: 'stern' }, outfit: out('jacket', 'charcoal', 'starch', 'white'), bottom: { type: 'pants', color: 'slate' }, shoes: 'black',
    acc: ['glasses:#4a3a58', 'scarf:starch'] });
  def('mimi', { name: 'Mimi', build: 'teen', sex: 'f', skin: 'fair', hair: hair('bob', 'honey'), eyes: 'green',
    face: { eyes: 'happy', mouth: 'grin' }, outfit: out('cardigan', 'pink', 'white', 'cream'), bottom: { type: 'skirt', color: 'plum' }, legs: 'white', shoes: 'rose',
    acc: ['bow:#f0508a'] });
  def('prof_bobbin', { name: 'Professor Bobbin', build: 'elder', sex: 'f', skin: 'pale', hair: hair('bun', 'silver'), eyes: 'brown',
    face: { eyes: 'happy', mouth: 'smile', brows: 'raised', blush: true }, outfit: out('labcoat', 'white', 'yellow', 'lilac'), bottom: { type: 'pants', color: 'slate' }, shoes: 'brown',
    acc: ['roundglasses:#c8a020', 'tape'] });
  def('mom', { name: 'Mom', build: 'adult', sex: 'f', skin: 'fair', hair: hair('ponytail', 'auburn'), eyes: 'hazel',
    face: { eyes: 'happy', mouth: 'smile' }, outfit: out('apron', 'teal', 'white', 'cream'), bottom: { type: 'skirt', color: 'brown' }, shoes: 'brown' });
  def('aide_f', { name: 'Lab Aide', build: 'teen', sex: 'f', skin: 'warm', hair: hair('ponytail', 'teal'), eyes: 'teal',
    face: { eyes: 'normal', mouth: 'smile' }, outfit: out('labcoat', 'white', 'sky', 'sky'), bottom: { type: 'pants', color: 'slate' }, shoes: 'white' });
  def('aide_m', { name: 'Lab Aide', build: 'teen', sex: 'm', skin: 'tan', hair: hair('messy', 'black'), eyes: 'dark',
    face: { eyes: 'normal', mouth: 'smile' }, outfit: out('labcoat', 'white', 'sky', 'sky'), bottom: { type: 'pants', color: 'khaki' }, shoes: 'brown', acc: ['glasses:#6a6a7c'] });

  // ---- townsfolk ----
  def('villager_f1', { name: 'Villager', build: 'adult', sex: 'f', skin: 'warm', hair: hair('long', 'brown'), eyes: 'brown',
    face: { eyes: 'normal', mouth: 'smile' }, outfit: out('dress', 'sky', 'white'), shoes: 'brown' });
  def('villager_f2', { name: 'Villager', build: 'adult', sex: 'f', skin: 'pale', hair: hair('wavy', 'ginger'), eyes: 'green',
    face: { eyes: 'happy', mouth: 'grin' }, outfit: out('cardigan', 'mint', 'white', 'cream'), bottom: { type: 'longskirt', color: 'forest' }, shoes: 'brown' });
  def('villager_m1', { name: 'Villager', build: 'adult', sex: 'm', skin: 'tan', hair: hair('short', 'brown'), eyes: 'brown',
    face: { eyes: 'normal', mouth: 'smile' }, outfit: out('vest', 'olive', 'white', 'cream'), bottom: { type: 'pants', color: 'brown' }, shoes: 'chocolate' });
  def('villager_m2', { name: 'Villager', build: 'stout', sex: 'm', skin: 'warm', hair: hair('cropped', 'grey'), eyes: 'dark', facial: 'mustache',
    face: { eyes: 'normal', mouth: 'smile' }, outfit: out('tee', 'orange', 'white'), bottom: { type: 'pants', color: 'denim' }, shoes: 'brown' });
  def('elder_m', { name: 'Elder', build: 'elder', sex: 'm', skin: 'fair', hair: hair('bald', 'white'), eyes: 'dark', facial: 'beard', facialColor: 'white',
    face: { eyes: 'happy', mouth: 'smile', brows: 'worried' }, outfit: out('robe', 'forest', 'gold'), shoes: 'brown', acc: ['cane'] });
  def('elder_f', { name: 'Elder', build: 'elder', sex: 'f', skin: 'pale', hair: hair('bun', 'white'), eyes: 'brown',
    face: { eyes: 'happy', mouth: 'smile', blush: true }, outfit: out('cardigan', 'lilac', 'white', 'cream'), bottom: { type: 'longskirt', color: 'plum' }, shoes: 'brown', acc: ['cane'] });
  def('child_m', { name: 'Boy', build: 'child', sex: 'm', skin: 'warm', hair: hair('spiky', 'black'), eyes: 'brown',
    face: { eyes: 'wide', mouth: 'grin' }, outfit: out('tee', 'yellow', 'white'), bottom: { type: 'shorts', color: 'blue' }, shoes: 'red', acc: ['cap:#3e6ad0/#f6f4f0'] });
  def('child_f', { name: 'Girl', build: 'child', sex: 'f', skin: 'fair', hair: hair('pigtails', 'pink'), eyes: 'pink',
    face: { eyes: 'wide', mouth: 'grin' }, outfit: out('dress', 'lilac', 'white'), shoes: 'rose' });
  def('shopkeeper', { name: 'Shopkeeper', build: 'stout', sex: 'm', skin: 'warm', hair: hair('short', 'chestnut'), eyes: 'brown', facial: 'mustache',
    face: { eyes: 'happy', mouth: 'grin' }, outfit: out('apron', 'green', 'white', 'cream'), bottom: { type: 'pants', color: 'brown' }, shoes: 'brown' });
  def('tea_maid', { name: 'Tea Maid', build: 'teen', sex: 'f', skin: 'pale', hair: hair('bob', 'plum'), eyes: 'violet',
    face: { eyes: 'happy', mouth: 'smile' }, outfit: out('maid', 'wine', 'white', 'pink'), legs: 'white', shoes: 'black', acc: ['maidcap:#f06a9c'] });

  // ---- trainers ----
  def('tailor_f', { name: 'Tailor', build: 'teen', sex: 'f', skin: 'fair', hair: hair('twinbun', 'copper'), eyes: 'amber',
    face: { eyes: 'normal', mouth: 'smile' }, outfit: out('vest', 'wine', 'white', 'cream'), bottom: { type: 'skirt', color: 'charcoal' }, legs: 'slate', shoes: 'brown', acc: ['belt:#7c4e30', 'spools'] });
  def('tailor_m', { name: 'Tailor', build: 'teen', sex: 'm', skin: 'tan', hair: hair('messy', 'brown'), eyes: 'brown',
    face: { eyes: 'sharp', mouth: 'smirk' }, outfit: out('vest', 'denim', 'white', 'cream'), bottom: { type: 'pants', color: 'charcoal' }, shoes: 'brown', acc: ['belt:#7c4e30', 'spools'] });
  def('net_kid', { name: 'Net Kid', build: 'child', sex: 'm', skin: 'fair', hair: hair('messy', 'blonde'), eyes: 'blue',
    face: { eyes: 'wide', mouth: 'grin' }, outfit: out('hoodie', 'green', 'white'), bottom: { type: 'shorts', color: 'khaki' }, shoes: 'brown', acc: ['goggles:#d8a030', 'backpack:#d8363a'] });
  def('picnicker', { name: 'Picnicker', build: 'teen', sex: 'f', skin: 'warm', hair: hair('pigtails', 'ginger'), eyes: 'green',
    face: { eyes: 'happy', mouth: 'grin' }, outfit: out('tee', 'white', 'red', 'white'), bottom: { type: 'skirt', color: 'red' }, legs: 'white', shoes: 'brown', acc: ['hat:#e8c870/#d8363a', 'backpack:#4a9a48'] });
  def('hiker', { name: 'Hiker', build: 'stout', sex: 'm', skin: 'tan', hair: hair('short', 'brown'), eyes: 'brown', facial: 'beard',
    face: { eyes: 'normal', mouth: 'smile' }, outfit: out('vest', 'khaki', 'white', 'red'), bottom: { type: 'pants', color: 'olive' }, shoes: 'chocolate', acc: ['backpack:#d06a2a', 'headband:#d8363a'] });
  def('grunt_m', { name: 'Presser', build: 'adult', sex: 'm', skin: 'pale', hair: hair('cropped', 'ink'), eyes: 'grey',
    face: { eyes: 'serious', mouth: 'flat', brows: 'stern' }, outfit: out('uniform', 'white', 'starch', 'white'), bottom: { type: 'pants', color: 'white' }, shoes: 'slate', acc: ['flatcap:#e8ecf4/#4c7ee0'] });
  def('grunt_f', { name: 'Presser', build: 'adult', sex: 'f', skin: 'pale', hair: hair('ponytail', 'ink'), eyes: 'grey',
    face: { eyes: 'serious', mouth: 'flat', brows: 'stern' }, outfit: out('uniform', 'white', 'starch', 'white'), bottom: { type: 'skirt', color: 'white' }, legs: 'slate', shoes: 'slate', acc: ['flatcap:#e8ecf4/#4c7ee0'] });
  def('poppy', { name: 'Poppy', build: 'adult', sex: 'f', skin: 'brown', hair: hair('bun', 'black'), eyes: 'dark',
    face: { eyes: 'happy', mouth: 'grin' }, outfit: out('apron', 'orange', 'white', 'cream'), bottom: { type: 'pants', color: 'denim' }, shoes: 'brown', acc: ['spools', 'bandana:#f2cc40'] });

  // ---- P2 ----
  def('pleat', { name: 'Pleat', build: 'tall', sex: 'm', skin: 'pale', hair: hair('sidepart', 'silver'), eyes: 'grey',
    face: { eyes: 'sharp', mouth: 'flat', brows: 'stern' }, outfit: out('suit', '#3e4a6e', 'starch', 'white'), bottom: { type: 'pants', color: '#3e4a6e' }, shoes: 'black', acc: ['pince:#8a9ac8', 'glasses:#c8d0e8'] });
  def('madame_damask', { name: 'Madame Damask', build: 'tall', sex: 'f', skin: 'pale', hair: hair('bun', 'iron'), eyes: 'grey',
    face: { eyes: 'sharp', mouth: 'flat', brows: 'stern', lashes: true }, outfit: out('gown', 'slate', 'silver', 'white'), shoes: 'black', acc: ['brooch:#c8d0e8'] });
  def('bryn', { name: 'Bryn', build: 'adult', sex: 'm', skin: 'brown', hair: hair('curly', 'black'), eyes: 'dark',
    face: { eyes: 'happy', mouth: 'grin' }, outfit: out('jacket', 'teal', 'yellow', 'white'), bottom: { type: 'pants', color: 'charcoal' }, shoes: 'yellow', acc: ['tape', 'headband:#f2cc40'] });
  def('sailor', { name: 'Sailor', build: 'adult', sex: 'm', skin: 'tan', hair: hair('short', 'brown'), eyes: 'blue', facial: 'stubble',
    face: { eyes: 'normal', mouth: 'grin' }, outfit: out('sailor', 'white', 'navy', 'red'), bottom: { type: 'pants', color: 'white' }, shoes: 'navy', acc: ['flatcap:#f6f4f0/#2e3c74'] });
  def('camper', { name: 'Camper', build: 'teen', sex: 'm', skin: 'warm', hair: hair('spiky', 'ginger'), eyes: 'green',
    face: { eyes: 'normal', mouth: 'grin' }, outfit: out('vest', 'green', 'white', 'khaki'), bottom: { type: 'shorts', color: 'khaki' }, shoes: 'brown', acc: ['cap:#4a9a48/#f6f4f0', 'backpack:#c89a64'] });
  def('schoolgirl', { name: 'Schoolgirl', build: 'teen', sex: 'f', skin: 'fair', hair: hair('long', 'black'), eyes: 'dark',
    face: { eyes: 'normal', mouth: 'smile' }, outfit: out('sailor', 'navy', 'white', 'red'), bottom: { type: 'skirt', color: 'navy' }, legs: 'white', shoes: 'black' });
  def('scientist', { name: 'Scientist', build: 'tall', sex: 'm', skin: 'pale', hair: hair('messy', 'platinum'), eyes: 'blue',
    face: { eyes: 'wide', mouth: 'o', brows: 'raised' }, outfit: out('labcoat', 'white', 'lilac', 'mint'), bottom: { type: 'pants', color: 'slate' }, shoes: 'black', acc: ['goggles:#72b0ec'] });
  def('nurse_aide', { name: 'Nurse Aide', build: 'teen', sex: 'f', skin: 'fair', hair: hair('bob', 'rose'), eyes: 'pink',
    face: { eyes: 'happy', mouth: 'smile' }, outfit: out('dress', 'white', 'pink'), legs: 'white', shoes: 'white', acc: ['maidcap:#f06a9c'] });
  def('rocker', { name: 'Rocker', build: 'teen', sex: 'm', skin: 'pale', hair: hair('spiky', 'purple'), eyes: 'violet',
    face: { eyes: 'sharp', mouth: 'smirk' }, outfit: out('jacket', 'black', 'silver', 'red'), bottom: { type: 'pants', color: 'charcoal' }, shoes: 'red', acc: ['sash:#d8363a'] });
  def('cook', { name: 'Cook', build: 'stout', sex: 'm', skin: 'warm', hair: hair('bald', 'brown'), eyes: 'brown', facial: 'mustache',
    face: { eyes: 'happy', mouth: 'grin' }, outfit: out('apron', 'white', 'red', 'white'), bottom: { type: 'pants', color: 'slate' }, shoes: 'black', acc: ['maidcap:#f6f4f0'] });
  def('fisher', { name: 'Fisher', build: 'adult', sex: 'm', skin: 'tan', hair: hair('short', 'grey'), eyes: 'blue', facial: 'beard',
    face: { eyes: 'normal', mouth: 'smile' }, outfit: out('overalls', 'yellow', 'white', 'khaki'), bottom: { type: 'overall', color: 'forest' }, shoes: 'chocolate', acc: ['hat:#e8c870/#2e6a3e', 'fishingrod'] });
  def('pilot', { name: 'Pilot', build: 'adult', sex: 'm', skin: 'brown', hair: hair('cropped', 'black'), eyes: 'dark',
    face: { eyes: 'normal', mouth: 'smirk' }, outfit: out('jacket', 'tan', 'cream', 'white'), bottom: { type: 'pants', color: 'khaki' }, shoes: 'chocolate', acc: ['goggles:#d8a030', 'scarf:#f6f4f0'] });
  def('skier', { name: 'Skier', build: 'teen', sex: 'f', skin: 'pale', hair: hair('pigtails', 'lavender'), eyes: 'sky',
    face: { eyes: 'happy', mouth: 'grin' }, outfit: out('coat', 'sky', 'white', 'white'), bottom: { type: 'pants', color: 'navy' }, shoes: 'white', acc: ['earmuffs:#f06a9c'] });
  def('artist', { name: 'Artist', build: 'teen', sex: 'f', skin: 'warm', hair: hair('messy', 'mint'), eyes: 'teal',
    face: { eyes: 'sleepy', mouth: 'smile' }, outfit: out('apron', 'lilac', 'yellow', 'white'), bottom: { type: 'pants', color: 'denim' }, shoes: 'red', acc: ['flower:#f06a9c', 'headband:#f2cc40'] });
  def('gentleman', { name: 'Gentleman', build: 'tall', sex: 'm', skin: 'fair', hair: hair('sidepart', 'grey'), eyes: 'grey', facial: 'mustache',
    face: { eyes: 'sharp', mouth: 'smile' }, outfit: out('suit', 'wine', 'gold', 'white'), bottom: { type: 'pants', color: 'charcoal' }, shoes: 'black', acc: ['cane', 'necktie:#f2cc40'] });
  def('lady', { name: 'Lady', build: 'adult', sex: 'f', skin: 'fair', hair: hair('wavy', 'blonde'), eyes: 'blue',
    face: { eyes: 'happy', mouth: 'smile', lashes: true }, outfit: out('gown', 'rose', 'white', 'white'), shoes: 'rose', acc: ['hat:#fbd8b0/#e0587e'] });
  def('twins_a', { name: 'Twin', build: 'child', sex: 'f', skin: 'fair', hair: hair('twinbun', 'pink'), eyes: 'pink',
    face: { eyes: 'wide', mouth: 'grin' }, outfit: out('dress', 'pink', 'white'), shoes: 'rose' });
  def('twins_b', { name: 'Twin', build: 'child', sex: 'f', skin: 'fair', hair: hair('twinbun', 'blue'), eyes: 'sky',
    face: { eyes: 'wide', mouth: 'grin' }, outfit: out('dress', 'sky', 'white'), shoes: 'blue' });
  def('old_tailor', { name: 'Old Tailor', build: 'elder', sex: 'm', skin: 'warm', hair: hair('fluff', 'white'), eyes: 'brown', facial: 'mustache', facialColor: 'white',
    face: { eyes: 'happy', mouth: 'smile', brows: 'worried' }, outfit: out('vest', 'plum', 'gold', 'cream'), bottom: { type: 'pants', color: 'slate' }, shoes: 'brown', acc: ['roundglasses:#c8a020', 'tape'] });

  // ---- story one-offs: the Spindle Shrine guardian, Pressed (bleached white, blue piping) and herself again (chapter 2)
  def('cocoona_pressed', { name: 'Pressed Cocoona', build: 'child', sex: 'f', skin: 'pale', hair: hair('pigtails', 'white'), eyes: 'sky',
    face: { eyes: 'normal', mouth: 'flat' }, outfit: out('hoodie', 'white', 'starch', 'white'), bottom: { type: 'shorts', color: 'white' }, legs: 'white', shoes: 'white' });
  def('cocoona', { name: 'Cocoona', build: 'child', sex: 'f', skin: 'fair', hair: hair('pigtails', 'blonde'), eyes: 'amber',
    face: { eyes: 'happy', mouth: 'grin', blush: true }, outfit: out('hoodie', 'cream', 'gold', 'white'), bottom: { type: 'shorts', color: 'khaki' }, legs: 'white', shoes: 'brown' });
})(typeof globalThis !== 'undefined' ? globalThis : window);
