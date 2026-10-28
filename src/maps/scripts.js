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
      yield* c.sayT('script.tea.2', 'Have a look at the menu while you wait, dear...');
      yield* c.healAnim();
      yield* c.sayT('script.tea.3', 'Your Kigu are all rested up! Please come again!');
    } else yield* c.sayT('script.tea.4', 'Come by any time. The kettle is always warm.');
    // saves from before round 4 already ran Bobbin's errand: her Exp Share is waiting at the counter instead
    if (c.flag('errand_done') && !c.state.bag.exp_share && NP.data.items.exp_share) {
      yield* c.sayT('script.tea.share.1', 'Oh! A parcel came for you, dear, from Professor Bobbin.\\pShe says she forgot to give you this before you left.');
      yield* c.giveItem('exp_share', 1);
      yield* c.sayT('script.tea.share.2', 'It\'s an Exp Share. Kigu who sit out a battle still get half the Exp. Points.\\pYou can switch it off in your Key Items if you ever want to.');
    }
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
      yield* c.sayT('script.poppy.1', 'Poppy: You and your Kigu have come so far, {player}. Keep sewing your own path!');
      return;
    }
    // pre-Salon quest (padding): her yarn basket first, then her two apprentices. Both are a few steps away and both are friendly,
    // so it reads as "help Poppy get ready", not as a locked door
    if (!c.flag('yarn_basket')) {
      c.set('poppy_asked');
      yield* c.sayT('script.poppy.basket.1', 'Poppy: Oh, a challenger! How lovely, come in, come in!\\pBut, oh dear... I can\'t find my yarn basket anywhere.');
      yield* c.sayT('script.poppy.basket.2', 'Poppy: My Kigu won\'t battle without their cardigans done up.\\pI last saw a little Kittabra batting my yarn about outside.');
      yield* c.sayT('script.poppy.basket.3', 'Poppy: Would you be a dear and look for it? Try the flowers by the road.');
      return;
    }
    if (!c.flag('poppy_basket_back')) {
      c.set('poppy_basket_back');
      yield* c.sayT('script.poppy.basket.4', 'Poppy: My yarn basket! And not a single tangle. Thank you, {player}!\\pEvery stitch counts, and that was a very kind one.');
    }
    if (!c.flag('tr_salon_salon_t1') || !c.flag('tr_salon_salon_t2')) {
      yield* c.sayT('script.poppy.apprentices', 'Poppy: Now, house rules! Ren and Noa battle every challenger first.\\pThey\'ve been practising all week. Go on, show them your stitches!');
      return;
    }
    yield* c.sayT('script.poppy.2', "Poppy: Welcome to the Thimble Salon! I'm Poppy, Master Tailor.\\pMy Fluff Kigu look all soft and cuddly, but they\'re cleverer than you\'d think.\\pShow me what you and your Kigu are made of!");
    const won = yield* c.trainerBattle({ cls: 'Master', name: 'Poppy', look: 'poppy', ai: 2, reward: 12, master: true, music: 'battle_master', team: c.map.def.poppyTeam });
    if (!won) { yield* c.sayT('script.poppy.3', 'Poppy: Oh dear! Rest your Kigu and come back. I\'ll keep the kettle on.'); return; }
    yield* c.sayT('script.poppy.4', 'Poppy: Wonderful! Every single seam held.\\pYou\'ve earned a Button, dear. I sewed this one with my own thread.');
    c.state.badges = c.state.badges || [];
    c.state.badges[0] = true;
    yield* c.jingleWait('j_button');
    yield* c.sayT('script.poppy.5', '{player} received the Fluff Button!');
    yield* c.sayT('script.poppy.6', 'With it, your Kigu will obey you fully up to Lv20.\\pAnd take this Disc, too. It lets your Kigu Snip away small bushes.\\pJust face a bush and press A.');
    yield* c.giveItem('disc_snip', 1);
    c.set('badge1');
    yield* c.sayT('script.poppy.7', 'Poppy: And here, a spool of my cream cotton. It\'s what I learned on.\\pA good seam begins with good thread.');
    yield* c.giveItem('cream_thread', 1);
    yield* c.sayT('script.poppy.8', "Poppy: Oh, one more thing. My old teacher stitched this handkerchief.\\pSee the little 'D'? She always knotted every hem twice.\\pI haven't seen her in years...\\pIf you ever meet someone who sews like that, tell her the kettle's on.");
    yield* c.giveItem('d_handkerchief', 1);
    // the Society's inspection waits right outside, so Poppy rests the team first (a forced fight on low HP is a gate, not a detour)
    yield* c.sayT('script.poppy.tea', 'Poppy: Your Kigu look worn out after all that. Here, a cup of tea before you go.');
    NP.snd.sfx('save');
    NP.State.healAll();
    yield* c.sayT('script.poppy.tea2', 'Your Kigu are feeling much better!');
    yield* c.sayT('script.poppy.9', 'Poppy: Now go and see Tsumugi, {player}. There\'s so much more out there.\\pAnd remember: every stitch counts!');
  };
  S.bryn = function* (c) {
    const st = c.state;
    if (st.badges && st.badges[1]) {
      yield* c.sayT('script.bryn.1', 'Bryn: Little threads, big hive!\\pSeamstead City is east along the seam road, so off you go!\\pAnd keep an eye on anyone who tells you everything\'s on sale.');
      return;
    }
    yield* c.sayT('script.bryn.2', 'Bryn: Welcome to the Hemline Salon!\\pI\'m Bryn! I\'m the Master Tailor here, and the Warden of the woods.\\pI make the honey, I check every hem in town, and I\'m late for three things!\\pLittle threads, big hive!');
    if (c.flag('shrine1_done')) yield* c.sayT('script.bryn.3', 'Bryn: Mimi told me everything.\\pThe Everspool, the Pressers, the Vowspun, the rinse... all of it!\\pFour things I needed to hear, and one I really hoped I wouldn\'t.\\pSomebody has to say it out loud, so I will. The Society is a problem.\\pThere. I said it.');
    yield* c.sayT('script.bryn.4', 'Bryn: But a Button has to be earned, so show me your stitches!\\pMy bees and I are ready!');
    const won = yield* c.trainerBattle({ cls: 'Master', name: 'Bryn', look: 'bryn', ai: 2, reward: 14, master: true, music: 'battle_master', team: c.map.def.brynTeam });
    if (!won) { yield* c.sayT('script.bryn.5', 'Bryn: Ooh, so close! Rest your Kigu and have some tea.\\pI\'ll be here. Probably. Unless the bees need me.'); return; }
    yield* c.sayT('script.bryn.6', 'Bryn: Every seam held, even the sticky ones! Here, this Button is yours.\\pYou earned every thread of it.');
    st.badges = st.badges || [];
    st.badges[1] = true;
    c.set('badge2');
    yield* c.jingleWait('j_button');
    yield* c.sayT('script.bryn.7', '{player} received the Buzz Button!');
    yield* c.sayT('script.bryn.8', 'Bryn: Now your Kigu will obey you up to Lv30! Oh, and take this Paddle Disc!\\pIt lets your Kigu paddle across calm water. Face the water and press A.\\pIt\'s for when the planks run out.');
    yield* c.giveItem('disc_paddle', 1);
    yield* c.sayT('script.bryn.9', 'Bryn: Oh, and this! It\'s a length of golden-green silk from the Everspool.\\pIt\'s the straightest thread in the world, and it\'s never been pressed flat.\\pKeep it somewhere you can see it, okay?');
    yield* c.giveItem('everspool_silk', 1);
    yield* c.sayT('script.bryn.10', 'Bryn: Seamstead City is next, east along the seam road.\\pIt\'s big and bright and loud, and it\'s full of uniforms.\\pCrisp & Co. has a store there where everything\'s always on sale.\\pThat\'s the trick, so mind what you\'re offered!\\pLittle threads, big hive!');
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
