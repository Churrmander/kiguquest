/* Kite Hill Salon — Dart's Gale Salon (Salon #5). Mechanic: fan lanes. Two bands of fans cross the hangar floor; stepping onto one
 * blows you along it to the far wall (like the Route 6 gusts, which were the tutorial). Above each band is a wall with a single gap
 * at one end, so the fans have to be blowing the right way. A lever by each band turns its fans round.
 * Band 1 (rows 11-12) starts blowing west, and the gap is in the east (pull the lever). Band 2 (rows 6-7) starts blowing east,
 * and the gap is in the west (pull the second lever). Two Pilot apprentices, then Dart. Opens once her balloon flies (balloon_fixed).
 * Prize: Gale Button, Disc: Glide. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const w = 15, h = 16;

  function* dart(c) {
    const st = c.state;
    if (st.badges && st.badges[4]) {
      yield* c.sayT('script.dart.after', 'Dart: My balloon\'s waiting by the hangar, and so am I. Come and find me when you\'re ready to fly over the pass.');
      return;
    }
    yield* c.sayT('script.dart.1', 'Dart: You read the wind! Most people stand in the fans and shout at them.\\pI\'m Dart, Master Tailor of Kite Hill. I sew sails, I sew balloons, and I never sit still.');
    yield* c.sayT('script.dart.2', 'Dart: You fixed my balloon, so I owe you a flight. But first, let\'s see if you can keep up with me!');
    const team = L.team([['larkette|peepi', 36], ['kamiko|kamipi', 37], ['propera|propi', 37], ['cumulo|cloudli', 38]]);
    const won = yield* c.trainerBattle({ cls: 'Master', name: 'Dart', look: 'dart', ai: 3, reward: 28, master: true, music: 'battle_master', team });
    if (!won) { yield* c.sayT('script.dart.lose', 'Dart: Blown away! Don\'t worry, it happens to everyone up here.\\pGo and rest at the Tea House, then come back and try again.'); return; }
    yield* c.sayT('script.dart.3', 'Dart: Whoosh! You flew right past me. That\'s the Gale Button, and you\'ve earned every stitch of it.');
    st.badges = st.badges || []; st.badges[4] = true;
    c.set('badge5');
    yield* c.jingleWait('j_button');
    yield* c.sayT('script.dart.4', '{player} received the Gale Button!');
    yield* c.sayT('script.dart.5', 'Dart: Your Kigu will listen to you up to Lv60 now. And take this. It\'s Disc: Glide.\\pWith it, a Kigu can ride the wind across a gap. You\'ll want it up north, trust me.');
    yield* c.giveItem('disc_glide', 1);
    yield* c.sayT('script.dart.6', 'Dart: Right! My balloon is by the hangar, flag and all. Meet me there, and we\'ll go over the pass.\\pBring your friends, and bring a scarf, because it\'s cold over the top.');
  }
  NP.scripts.dart = dart;

  const M = L.room({ id: 'kite_salon', name: 'Kite Hill Salon', w, h, doorX: 6, floor: 'deck', wall: 'wall_stone', music: 'town_thimble', battleBg: 'gym',
    exit: { to: 'kite_hill', door: 'salon' }, legend: { B: 'barrier', E: 'fan_e', V: 'fan_w' } });
  // walls above each band, with one gap each: band 1's gap at the east end, band 2's at the west end
  M.rect(1, 10, 12, 1, 'B').rect(2, 5, 12, 1, 'B');
  M.gate('fan1', { flag: 'kite_fan1', cells: M.cells('f', 1, 11, 13, 2), closed: 'V', open: 'E', note: 'band 1 fans: west until the lever is pulled' });
  M.gate('fan2', { flag: 'kite_fan2', cells: M.cells('f', 1, 6, 13, 2), closed: 'E', open: 'V', note: 'band 2 fans: east until the lever is pulled' });
  L.leverStamp(M, 3, 13, 'fan1');
  M.interact(3, 13, L.switchLever('fan1', 'fan1', 'A lever marked FANS. An arrow on it points west, then east.'), 'band 1 fan lever');
  L.leverStamp(M, 8, 9, 'fan2');
  M.interact(8, 9, L.switchLever('fan2', 'fan2', 'A lever marked FANS. An arrow on it points east, then west.'), 'band 2 fan lever');
  M.stamp('plant', 1, 13).stamp('plant', 13, 13).stamp('plant', 1, 2).stamp('plant', 13, 2);
  M.sign(10, 13, 'KITE HILL SALON\\nMaster Tailor: Dart\\p"Lean into the wind, and it\'ll carry you."', 'salon sign');
  M.trainer('ks_t1', 11, 8, 'pilot', 'down', { cls: 'Pilot', name: 'Wren', sight: 1, reward: 18, ai: 2, team: [['kamipi', 34], ['propi', 35]],
    intro: 'Most people end up flat against the wall on their first try. You made it through!', win: 'You read the wind better than I do.', after: 'The second lot of fans blow east, but the gap is in the west. Dart thinks that\'s hilarious.' });
  M.trainer('ks_t2', 2, 3, 'skier', 'down', { cls: 'Pilot', name: 'Lark', sight: 1, reward: 18, ai: 2, team: [['cloudli', 35], ['peepi', 35], ['kamipi', 36]],
    intro: 'Dart\'s right behind me, and she\'s in a flying mood. You\'ll have to get past me first!', win: 'Whoosh. Off you go, then.', after: 'When Dart wins, she does a little spin. When she loses, she does a bigger spin.' });
  M.npc('dart', 7, 2, 'dart', 'down', null, { script: 'dart', note: 'Master Tailor Dart (Gale)' });
  M.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
