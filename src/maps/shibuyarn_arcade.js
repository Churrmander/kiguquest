/* src/maps/shibuyarn_arcade.js — the Lucky Spool, Shibuyarn's prize arcade (Chapter 5). The games, counters and prizes live in
 * src/game/arcade/; this file is the room. Until the Spark Cellar is cleared (flag shibuyarn_lights) the city has brownouts and
 * only Moth Patrol and the claw machine run (they have their own batteries); the other cabinets are dark.
 * The door on the city map is the Chapter 4-6 work: map 'shibuyarn', building name 'arcade'. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const LIGHTS = 'shibuyarn_lights';
  const lit = (c) => c.flag(LIGHTS);
  const music = NP.data.songs && NP.data.songs.city_shibuyarn ? 'city_shibuyarn' : 'city_seamstead';

  const M = L.room({
    id: 'shibuyarn_arcade', name: 'Lucky Spool Arcade', w: 16, h: 12, doorX: 7, floor: 'arcade_carpet', wall: 'wall_wood',
    music, battleBg: 'indoor', exit: { to: 'shibuyarn', door: 'arcade' }, carpet: [10, 2, 5, 2], carpetTerrain: 'floor_tile',
  });

  // the cabinets along the back wall: the bottom tile of each is the one you face to play
  // plus a second pair standing back to back in the middle of the floor (the same games, for busy days)
  const CABS = [['cab_1', 'moth', 1, 1, false], ['cab_2', 'button', 2, 1, true], ['cab_3', 'steam', 3, 1, true], ['platformer', 'hop', 4, 1, true],
    ['cab_1', 'moth', 3, 5, false], ['platformer', 'hop', 4, 5, true]];
  for (const [id, art, x, y, needsPower] of CABS) {
    if (needsPower) M.def.stamps.push(L.variantByFlag({ id: 'arcade_cab', x, y }, LIGHTS, 'off', art));
    else M.stamp('arcade_cab', x, y, art);
    M.interact(x, y + 1, function* (c) { yield* c.arcade(id); }, 'cabinet: ' + id);
  }
  M.stamp('neon_sign', 6, 0).stamp('claw_machine', 6, 1);
  M.interact(6, 2, function* (c) { yield* c.arcade('claw'); }, 'Plush Catcher');
  M.interact(7, 2, function* (c) { yield* c.arcade('claw'); }, 'Plush Catcher');

  // the counters on the right: coins at the left register, prizes at the right one
  M.stamp('prize_shelf', 10, 0).stamp('prize_shelf', 12, 0).stamp('poster', 14, 1)
    .stamp('counter_l', 10, 4).stamp('counter_c', 11, 4).stamp('counter_m', 12, 4).stamp('counter_c', 13, 4).stamp('counter_r', 14, 4);
  M.interact(11, 4, function* (c) { yield* c.arcade('coins'); }, 'coin counter');
  M.interact(13, 4, function* (c) { yield* c.arcade('prizes'); }, 'prize counter');
  M.npc('coin_clerk', 11, 3, 'shopkeeper', 'down', null, { script: function* (c) { yield* c.arcade('coins'); }, note: 'coin counter (money for coins)' });
  M.npc('prize_clerk', 13, 3, 'schoolgirl', 'down', null, { script: function* (c) { yield* c.arcade('prizes'); }, note: 'prize counter (tickets for prizes)' });

  // seating and a drinks machine by the door
  M.stamp('fridge', 14, 6).stamp('table_s', 10, 8).stamp('chair', 10, 9).stamp('chair', 11, 9).stamp('plant', 1, 10).stamp('plant', 14, 10);

  // people
  const say = (c, n, key, line) => c.sayT('shibuyarn_arcade.' + n.id + '.' + key, line);
  M.npc('owner', 5, 7, 'lady', 'down', null, {
    note: 'Hattie, the owner',
    script: function* (c, n) {
      if (!lit(c)) {
        yield* say(c, n, 'dark1', "Welcome to the Lucky Spool! Well, to some of it. The power keeps cutting out all over the city, so most of my cabinets are dark.");
        yield* say(c, n, 'dark2', "Moth Patrol and the claw machine run off their own batteries, so those two still work. Buy your coins at the counter on the right.");
      } else if (!c.flag('arcade_owner_lit')) {
        c.set('arcade_owner_lit');
        yield* say(c, n, 'lit1', "Everything's running again, and I hear we have you to thank for it!");
        yield* say(c, n, 'lit2', "Here, have a cup of coins on the house. Go and try Steam Chase, it's the one everybody was missing.");
        NP.arcade.st().coins += 30;
        NP.snd.sfx('pickup');
        yield* c.say('{player} got 30 coins!');
      } else {
        yield* say(c, n, 'lit3', "If you win enough tickets, have a look at the top shelf of the prize counter. There's a Kigu up there who's been waiting for a Tailor.");
      }
    },
  });
  M.npc('kid', 1, 5, 'child_m', 'up', null, {
    note: 'Moth Patrol tips; Steam Chase tips once the lights are back',
    script: function* (c, n) {
      if (!lit(c)) yield* say(c, n, '1', "I've been stuck on wave three of Moth Patrol all week. The green moths at the top are worth the most, so I try to get those first.");
      else yield* say(c, n, '2', "Steam Chase is back! If you grab a Soft Rinse while all four irons are close, you can bump every one of them for loads of points.");
    },
  });
  M.npc('claw_fan', 8, 4, 'schoolgirl', 'left', null, {
    note: 'claw machine tips',
    script: function* (c, n) {
      yield* say(c, n, '1', "The trick with the claw is to line it up right over a plush's head. If it only gets an ear, it'll slip off on the way up.");
      yield* say(c, n, '2', "And yes, I have spent all my pocket money here. I don't want to talk about it.");
    },
  });
  M.npc('regular', 12, 8, 'artist', 'left', null, {
    note: 'Rooftop Hop tips',
    script: function* (c, n) {
      if (!lit(c)) yield* say(c, n, '1', "I only come here for Rooftop Hop, and it's been dark for a week. I'm just sitting here out of habit now.");
      else yield* say(c, n, '2', "Hold B in Rooftop Hop to run. You'll need the extra speed for the wide gaps on the last stage, the night one.");
    },
  });
  const def = M.reg();
  def.onEnter = function* (c) { L.syncStamps(c); };
  // Shibuyarn itself is built on the Chapter 4-6 branch. Until it is merged in, the door leads back to Seamstead's Tea House so
  // the room still links up (tests/maps.test.mjs checks every warp has somewhere to go).
  const exit = def.warps.find((w) => w.to === 'shibuyarn');
  Object.defineProperty(exit, 'to', { enumerable: true, get: () => (NP.maps.shibuyarn ? 'shibuyarn' : 'seamstead') });
  Object.defineProperty(exit, 'door', { enumerable: true, get: () => (NP.maps.shibuyarn ? 'arcade' : 'tea') });
})(typeof globalThis !== 'undefined' ? globalThis : window);
