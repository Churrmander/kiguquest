/* Shared named scripts used by several maps ('tea', 'pc', 'shop', 'poppy'). Generators taking (ctx, npc). */
(function (root) {
  'use strict';
  const NP = root.NP;
  NP.scripts = NP.scripts || {};
  const S = NP.scripts;

  S.tea = function* (c) {
    yield* c.sayT('script.tea.1', 'Welcome to the Tea House!\\pWould your Kigu like to rest with a nice cup of cocoa?');
    if (yield* c.ask('Rest your Kigu?')) {
      c.setHealPoint();
      yield* c.sayT('script.tea.2', 'Please wait here with the menu, dear...');
      yield* c.healAnim();
      yield* c.sayT('script.tea.3', 'Your Kigu are all rested up! Please come again!');
    } else yield* c.sayT('script.tea.4', 'Come by any time. The kettle is always warm.');
  };

  S.pc = function* (c) {
    yield* c.sayT('script.pc.1', '{player} turned on the storage terminal.');
    yield* c.pc();
  };

  S.shop = function* (c) {
    yield* c.sayT('script.shop.1', 'Welcome to the General Store! How can I help you?');
    const stock = c.map.def.shopStock || ['bond_spool', 'snack_cake'];
    const list = stock.slice();
    if (c.state.badges && c.state.badges[0]) list.push('silk_spool');
    yield* c.shop(list);
    yield* c.sayT('script.shop.2', 'Please come again!');
  };

  S.poppy = function* (c) {
    const st = c.state;
    if (st.badges && st.badges[0]) {
      yield* c.sayT('script.poppy.1', 'Poppy: Your threads are strong, {player}. Keep sewing your own path!');
      return;
    }
    yield* c.sayT('script.poppy.2', "Poppy: Welcome to the Thimble Salon! I'm Poppy, a Master Tailor.\\pMy Fluff Kigu look soft, but every cuddle is a clever stitch. Show me what you and your Kigu are made of!");
    const won = yield* c.trainerBattle({ cls: 'Master', name: 'Poppy', look: 'poppy', ai: 2, reward: 12, master: true, music: 'battle_master', team: c.map.def.poppyTeam });
    if (!won) { yield* c.sayT('script.poppy.3', 'Poppy: Oh dear! Rest your Kigu and come back. I will keep the kettle on.'); return; }
    yield* c.sayT('script.poppy.4', 'Poppy: Every seam held. Wonderful!\\pA Master Tailor gives a Button to an apprentice who has earned it. Please take this one.');
    c.state.badges = c.state.badges || [];
    c.state.badges[0] = true;
    yield* c.jingleWait('j_button');
    yield* c.sayT('script.poppy.5', '{player} received the Fluff Button!');
    yield* c.sayT('script.poppy.6', 'It lets your Kigu up to Lv20 obey you fully. Also, take this Disc.\\pIt teaches a Kigu to Snip, to cut down small trees.');
    yield* c.giveItem('disc_snip', 1);
    c.set('badge1');
    yield* c.sayT('script.poppy.7', 'Poppy: And here, a spool of my cream cotton. It is what I learned on.\\pA good seam begins with good thread.');
    yield* c.giveItem('cream_thread', 1);
    yield* c.sayT('script.poppy.8', "Poppy: One more thing. My old teacher stitched this handkerchief. See the little 'D'?\\pShe knotted every hem twice. I have not seen her in many years...\\pIf you ever meet someone who sews like this, tell her the kettle is on.");
    yield* c.giveItem('d_handkerchief', 1);
    yield* c.sayT('script.poppy.9', 'Poppy: Now go and see Tsumugi, {player}. Every seam road has a story.\\pAnd remember: every stitch counts!');
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
