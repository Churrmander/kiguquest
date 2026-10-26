/* Seamstead Salon — Zip's Volt Salon (Salon #3). Mechanic: two barrier rows and two switch panels (L.panel). Each panel's only standing tile is in a trainer's sight, so the levers cannot be pulled unseen.
 * Zip is on the main stage at the back; the Salon is open once the Crisp & Co. raid is done (see seamstead.js). */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const w = 12, h = 14;

  function* zip(c) {
    const st = c.state;
    if (st.badges && st.badges[2]) { yield* c.sayT('script.zip.1', 'Zip: Thread, buzz, pulse! You\'re all wired up, {player}!\\pRoute 4 is through the east gate. There are tents out that way,\\pand camels too! ...There are no camels. I checked.'); return; }
    if (!c.flag('crisp_done')) { yield* c.sayT('script.zip.0', 'Zip: Argh! The lights are out, and the Society says that\'s "balanced"!\\pCould you do something about Crisp & Co. first? Pretty please?'); return; }
    yield* c.sayT('script.zip.2', 'Zip: Whoa! You pulled both levers! The Salon is ON, baby!\\pI\'m Zip, Master Tailor, Warden of the lights.\\pI put my name on Crisp & Co., and I never once went down to look.\\pSo, I\'m sorry. And now let me make a fuss. A big, bright, very loud fuss!');
    const won = yield* c.trainerBattle({ cls: 'Master', name: 'Zip', look: 'zip|rocker', ai: 2, reward: 22, master: true, music: 'battle_master', team: c.map.def.zipTeam });
    if (!won) { yield* c.sayT('script.zip.3', 'Zip: Aww, unplugged! Recharge at the Tea House.\\pI\'ll hold the final chord for you.'); return; }
    yield* c.sayT('script.zip.4', 'Zip: Every wire held! Take the Volt Button, {player}.\\pYou earned every volt.');
    st.badges = st.badges || []; st.badges[2] = true;
    c.set('badge3');
    yield* c.jingleWait('j_button');
    yield* c.sayT('script.zip.5', '{player} received the Volt Button!');
    yield* c.sayT('script.zip.6', 'Zip: With that, your Kigu will obey you up to Lv40. And take this Zip Cable.\\pIf the lights ever go out again, plug in and stand out!');
    yield* c.giveItem('zip_cable', 1);
    yield* c.sayT('script.zip.7', 'Zip: One more thing. Madame Damask came to a show once.\\pShe didn\'t clap. She just nodded, very politely, until I stopped.\\pDon\'t let her smooth out your loud bits, {player}.');
    yield* lights(c);
    yield* NP.scripts.seamstead_east_gate(c);
  }
  NP.scripts.zip = zip;

  // ---- after the Volt Button: up to the plaza stage, where Zip says sorry to the city and turns the lights back on
  function* lights(c) {
    c.set('zip_lights');
    yield* c.sayT('script.zip.8', 'Zip: One more favour. Come up to the plaza with me?\\pI\'ve got a big switch with a sparkly handle, and something to say.');
    yield* c.ow.fadeOut(12);
    c.ow.loadMap('seamstead', 18, 13, 'up', { noEnter: true });
    c.hideNpc('dark1'); c.hideNpc('dark2');
    c.placeNpc('zip_s', 18, 12, 'down');
    c.showNpc('zip_s');
    yield* c.wait(8);
    yield* c.ow.fadeIn(12);
    yield* c.sayT('story.zip_lights.1', 'Zip: Seamstead! I put my name on that store, and I never once looked inside.\\pThat was on me. I\'m sorry.');
    yield* c.sayT('story.zip_lights.2', 'Zip: So tonight I\'m doing the one thing I\'m actually good at. Lights, back on!');
    NP.snd.sfx('select');
    NP.Game.flash = 8;
    yield* c.wait(20);
    yield* c.sayT('story.zip_lights.3', 'One by one, the lamps down the avenue flicker... and come back on.');
    yield* c.sayT('story.zip_lights.4', 'Zip: Lamp by lamp! Seamstead, you remember how to shine, don\'t you?');
    if (c.flag('crisp_after')) yield* c.sayT('story.zip_lights.5', 'At the edge of the crowd, {rival} is holding a name tag up to the light.\\pThey catch your eye, and give you a big thumbs up.');
    yield* c.sayT('story.zip_lights.6', 'Zip: Next on my list is Route 4. The Society is "resurfacing" it.\\pI\'m going to resurface their resurfacing. Loudly.');
    c.hideNpc('zip_s');
  }

  const M = L.room({ id: 'seamstead_salon', name: 'Seamstead Salon', w, h, doorX: 5, floor: 'floor_wood', wall: 'wall_plaster', music: 'city_seamstead', battleBg: 'gym',
    exit: { to: 'seamstead', door: 'salon' }, carpet: [5, 2, 2, 11], carpetTerrain: 'carpet_red', legend: { B: 'fence' } });
  M.gate('g1', { cells: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((x) => [x, 9]), closed: 'B', open: 'f', flag: 'sal3_g1', note: 'barrier 1 (panel at the entrance)' });
  M.gate('g2', { cells: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((x) => [x, 5]), closed: 'B', open: 'f', flag: 'sal3_g2', note: 'barrier 2 (panel between barriers)' });
  M.stamp('pc_terminal', 1, 11).interact(1, 12, L.panel(['g1'], 'A panel with a thick yellow lever. The tag on it says "FIRST BARRIER".'), 'panel 1 (opens g1)');
  M.stamp('pc_terminal', 10, 6).interact(10, 7, L.panel(['g2'], 'A panel with a thick yellow lever. The tag on it says "SECOND BARRIER".'), 'panel 2 (opens g2)');
  M.stamp('sewing_machine', 1, 7).stamp('mannequin', 8, 7).stamp('window', 4, 1).stamp('window', 7, 1).stamp('bookshelf', 0, 0).stamp('cloth_shelf', 9, 0).stamp('plant', 10, 12).stamp('plant', 10, 8);
  M.trainer('sal3_t1', 2, 10, 'rocker', 'down', { cls: 'Busker', name: 'Kit', sight: 2, reward: 10, ai: 1, team: [['scurrent|kittabra', 18], ['scurrent|kittabra', 18]],
    intro: 'Zip said no cheating the levers. I\'m the lever police!', win: 'The lever police have been outvoted.', after: 'Barrier two is just past the first one, and its lever\'s on the right.' });
  M.trainer('sal3_t2', 9, 6, 'artist', 'down', { cls: 'Tailor', name: 'Lux', sight: 1, reward: 11, ai: 1, team: [['kumi|nibblit', 19], ['scurrent|kittabra', 19]],
    intro: 'I draw lightning bolts on everything, and that includes you!', win: 'Lightning does strike twice. It struck me twice.', after: 'Zip\'s just past the second barrier. Try not to flinch!' });
  M.npc('zip', 5, 3, 'zip|rocker', 'down', null, { script: 'zip', note: 'Master Tailor #3 (Volt)' });
  M.reg().zipTeam = L.team([['scurrent|kittabra', 19], ['kumara|silkie', 20], ['arcorn|kittabra', 22]]);
})(typeof globalThis !== 'undefined' ? globalThis : window);
