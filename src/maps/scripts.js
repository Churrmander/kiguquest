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
    yield* c.sayT('script.poppy.2', "Poppy: Welcome to the Thimble Salon! I am Poppy, Master Tailor.\\pMy Fluff Kigu look soft. Every cuddle is a clever stitch.\\pShow me what you and your Kigu are made of!");
    const won = yield* c.trainerBattle({ cls: 'Master', name: 'Poppy', look: 'poppy', ai: 2, reward: 12, master: true, music: 'battle_master', team: c.map.def.poppyTeam });
    if (!won) { yield* c.sayT('script.poppy.3', 'Poppy: Oh dear! Rest your Kigu and come back. I will keep the kettle on.'); return; }
    yield* c.sayT('script.poppy.4', 'Poppy: Every seam held. Wonderful!\\pYou have earned a Button. I sewed it on with my own thread.');
    c.state.badges = c.state.badges || [];
    c.state.badges[0] = true;
    yield* c.jingleWait('j_button');
    yield* c.sayT('script.poppy.5', '{player} received the Fluff Button!');
    yield* c.sayT('script.poppy.6', 'It lets your Kigu obey you fully up to Lv20.\\pAlso, take this Disc.\\pIt lets your Kigu Snip small bushes. Face one and press A.');
    yield* c.giveItem('disc_snip', 1);
    c.set('badge1');
    yield* c.sayT('script.poppy.7', 'Poppy: And here, a spool of my cream cotton. It is what I learned on.\\pA good seam begins with good thread.');
    yield* c.giveItem('cream_thread', 1);
    yield* c.sayT('script.poppy.8', "Poppy: One more thing. My old teacher stitched this.\\pSee the little 'D'? She knotted every hem twice.\\pI have not seen her in years...\\pIf you meet someone who sews like that, tell her the kettle is on.");
    yield* c.giveItem('d_handkerchief', 1);
    yield* c.sayT('script.poppy.9', 'Poppy: Now go and see Tsumugi, {player}. Every seam road has a story.\\pAnd remember: every stitch counts!');
  };
  S.bryn = function* (c) {
    const st = c.state;
    if (st.badges && st.badges[1]) {
      yield* c.sayT('script.bryn.1', 'Bryn: Little threads, big hive!\\pSeamstead City is east along the seam road.\\pGo on. And keep an eye on anyone who says everything is on sale.');
      return;
    }
    yield* c.sayT('script.bryn.2', 'Bryn: Welcome to the Hemline Salon!\\pI am Bryn: Master Tailor, Warden of the woods, honey-maker, hem-checker.\\pAlso late for three things!\\pLittle threads, big hive!');
    if (c.flag('shrine1_done')) yield* c.sayT('script.bryn.3', 'Bryn: Mimi told me everything.\\pThe Everspool, the Pressers, the Cocoona, the rinse.\\pFour things I needed to hear, and one I hoped I would not.\\pSomebody had to say it out loud.\\pSo: the Society is a problem. There. I said it.');
    yield* c.sayT('script.bryn.4', 'Bryn: But a Button has to be earned, so! Show me your stitches.\\pMy bees and I are ready!');
    const won = yield* c.trainerBattle({ cls: 'Master', name: 'Bryn', look: 'bryn', ai: 2, reward: 14, master: true, music: 'battle_master', team: c.map.def.brynTeam });
    if (!won) { yield* c.sayT('script.bryn.5', 'Bryn: Ooh, so close! Rest your Kigu and have some tea.\\pI will be here. Probably. Unless the bees need me.'); return; }
    yield* c.sayT('script.bryn.6', 'Bryn: Every seam held. Even the sticky ones! Please take this Button.\\pYou earned every thread.');
    st.badges = st.badges || [];
    st.badges[1] = true;
    c.set('badge2');
    yield* c.jingleWait('j_button');
    yield* c.sayT('script.bryn.7', '{player} received the Buzz Button!');
    yield* c.sayT('script.bryn.8', 'Bryn: With it, your Kigu obey you up to Lv30. Also this Disc: Paddle!\\pIt lets your Kigu paddle across calm water. Face the water and press A.\\pFor when the planks run out.');
    yield* c.giveItem('disc_paddle', 1);
    yield* c.sayT('script.bryn.9', 'Bryn: And this.\\pA length of silk from the Everspool.\\pGolden-green, and the straightest thread in the world.\\pIt has never once been pressed flat. Keep it somewhere you can see it.');
    yield* c.giveItem('everspool_silk', 1);
    yield* c.sayT('script.bryn.10', 'Bryn: Seamstead City is next, east along the seam road.\\pBig, bright, loud, and full of uniforms.\\pCrisp & Co. has a store there. Everything is on sale.\\pThat is the trick, so mind what you are offered!\\pLittle threads, big hive!');
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
