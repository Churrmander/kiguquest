/* Basting Green — a small village between Meadow Lane and Thimble. On Tidy Day the Starch Society's parade of folded sheets
 * fills the north road, so the way to Thimble is round Ribbon Loop to the east (padding beat 3). The parade has moved on by the
 * time you come back from Thimble, and the road is open both ways from then on. */
(function (root) {
  'use strict';
  const NP = root.NP, K = NP.mapkit;

  // ---- Tidy Day: two Pressers march down to greet you. No fight: the first Society battle is still Tuck in Thimble.
  function* tidyDay(c) {
    c.set('tidy_seen');
    const a = c.npc('tack'), b = c.npc('ply');
    yield* c.emote('player', 'exclaim');
    c.music('society_theme');
    yield* c.walk(a, ['down', 8]);
    yield* c.walk(b, ['down', 8]);
    yield* c.face('player', 'up');
    yield* c.sayT('basting_green.tidy.1', 'Tack: Good morning, citizen! Happy Tidy Day!\\pThe Society for Tidy Living thanks you for your patience.');
    yield* c.sayT('basting_green.tidy.2', 'Ply: The parade of folded sheets is on the north road.\\pIt is very long. And very, very straight.');
    yield* c.sayT('basting_green.tidy.3', 'Tack: Nobody crosses the parade. That would be untidy.\\pYou may stand in line and admire the folds.');
    yield* c.sayT('basting_green.tidy.4', 'Ply: Participation is optional. Mostly.\\pFlat is fair!');
    yield* c.walk(a, ['up', 8]);
    yield* c.walk(b, ['up', 8]);
    yield* c.face(a, 'down'); yield* c.face(b, 'down');
    c.music('town_thimble');
    yield* c.sayT('basting_green.tidy.5', 'Villager: Pressers. Every year the parade takes the main road.\\pRibbon Loop goes round to Thimble from the east road, dear.');
  }

  // ---- the crooked bunting: pat it flat and it springs right back (the small joke from the padding list)
  function* bunting(c) {
    yield* c.sayT('basting_green.bunting.1', 'A string of bunting, hung a little crooked.');
    if (!(yield* c.ask('Pat the bunting straight?'))) return;
    NP.snd.sfx('leaf');
    yield* c.sayT('basting_green.bunting.2', '{player} patted the bunting flat...\\p...and it sprang right back, crooked as ever.');
    if (!c.flag('bunting_pat') && !c.flag('thimble_reached')) {
      c.set('bunting_pat');
      yield* c.sayT('basting_green.bunting.3', 'Ply (from the parade): I saw that! ...Honestly? It looks nicer crooked.\\pDo not tell Tack I said so.');
    }
  }

  const W = 24, H = 22;
  const g = K.grid(W, H, '.');
  K.rect(g, 0, 0, 2, H, 'T'); K.rect(g, W - 2, 0, 2, H, 'T'); K.rect(g, 0, 0, W, 2, 'T'); K.rect(g, 0, H - 2, W, 2, 'T');
  K.rect(g, 2, 2, 9, 4, 'T'); K.rect(g, 13, 2, 9, 4, 'T');     // woods to the north: the road is the only way through
  K.rect(g, 11, 0, 2, H, 'p');                                  // north road (Thimble) to south road (Meadow Lane)
  K.rect(g, 13, 11, 11, 2, 'p');                                // east road to Ribbon Loop
  K.rect(g, 4, 13, 6, 1, 'f'); K.rect(g, 15, 15, 5, 2, 'f'); K.rect(g, 3, 18, 3, 1, 'f');
  K.rect(g, 14, 17, 1, 3, 'F'); K.rect(g, 20, 14, 1, 4, 'F');

  K.reg({
    id: 'basting_green', name: 'Basting Green', music: 'town_thimble', battleBg: 'grass', border: 'treeline',
    view: 'street',
    legend: { '.': 'grass', T: 'treeline', p: 'path', f: 'flowers', F: 'fence' },
    rows: K.rows(g),
    stamps: [
      { id: 'house_s', x: 4, y: 7, variant: 'green', name: 'gran', to: 'basting_house' },
      { id: 'house_m', x: 15, y: 6, variant: 'yellow' },
      { id: 'cloth_line', x: 7, y: 15 }, { id: 'cloth_line', x: 16, y: 13 },
      { id: 'well', x: 8, y: 11 }, { id: 'bench', x: 4, y: 15 }, { id: 'lamp', x: 10, y: 10 }, { id: 'lamp', x: 13, y: 14 },
      { id: 'tree', x: 3, y: 12 }, { id: 'tree', x: 19, y: 18 }, { id: 'tree', x: 8, y: 18 }, { id: 'sign', x: 10, y: 17 }, { id: 'sign', x: 20, y: 10 },
      { id: 'flowerbed', x: 8, y: 8 }, { id: 'barrel', x: 3, y: 10 },
    ],
    interact: [
      { x: 10, y: 17, say: 'BASTING GREEN\\nLoose stitches hold the best memories.' },
      { x: 20, y: 10, say: 'EAST: RIBBON LOOP\\nThe long way round to Thimble Village.' },
      { x: 7, y: 15, script: bunting }, { x: 8, y: 15, script: bunting }, { x: 16, y: 13, script: bunting }, { x: 17, y: 13, script: bunting },
    ],
    spawns: { south: { x: 11, y: 19, dir: 'up' }, north: { x: 11, y: 2, dir: 'down' }, east: { x: 22, y: 11, dir: 'left' } },
    warps: [
      { xs: [11, 12], y: 21, to: 'route1', spawn: 'north', sound: 'none' },
      { xs: [11, 12], y: 0, to: 'thimble', spawn: 'south', sound: 'none' },
      { x: 23, ys: [11, 12], to: 'ribbon_loop', spawn: 'west', sound: 'none' },
    ],
    triggers: [{ x: 11, y: 16, w: 2, h: 1, id: 'tidy_day', when: (c) => !c.flag('tidy_seen') && !c.flag('thimble_reached'), script: tidyDay }],
    npcs: [
      // the parade: folded-sheet bearers fill the north road until you have reached Thimble the long way round
      { id: 'march1', x: 11, y: 3, look: 'grunt_m', dir: 'right', hideIf: 'thimble_reached',
        say: ['Left, right, fold! Left, right, fold!\\pPlease do not cross the parade. You will crease it.'] },
      { id: 'march2', x: 12, y: 3, look: 'grunt_f', dir: 'left', hideIf: 'thimble_reached',
        say: ['These sheets were folded in thirds by hand.\\pThen in thirds again. Then we ran out of thirds.'] },
      { id: 'march3', x: 11, y: 5, look: 'villager_m2', dir: 'down', hideIf: 'thimble_reached',
        say: ['They asked me to carry a sheet. I could not think of a reason to say no.\\pThe parade goes all the way to Thimble. Try Ribbon Loop!'] },
      { id: 'march4', x: 12, y: 5, look: 'villager_f2', dir: 'down', hideIf: 'thimble_reached',
        say: ['I have been holding this sheet since breakfast. My arms are so flat.\\pIf you are off to Thimble, take the east road. It is lovely.'] },
      { id: 'tack', x: 11, y: 7, look: 'grunt_m', dir: 'down', hideIf: 'thimble_reached',
        say: ['Tack: The parade has right of way, citizen. Everything in its place!\\pThimble is that way. The parade is also that way. So: no.'] },
      { id: 'ply', x: 12, y: 7, look: 'grunt_f', dir: 'down', hideIf: 'thimble_reached',
        say: ['Ply: Ribbon Loop is the scenic route. I would take it myself.\\p...Please do not tell Tack I said that either.'] },
      { id: 'kidb', x: 6, y: 11, look: 'child_m', dir: 'right', move: 'turn',
        say: ['Ribbon Loop has a Silkie who munches leaves by the hay all day.\\pJust snacks and sunshine. I want to be her when I grow up.'] },
      { id: 'vlb', x: 17, y: 11, look: 'villager_f1', dir: 'left', move: 'wander', range: 2,
        say: ['Tidy Day comes every year now. It used to be Ribbon Day.\\pWe tied ribbons on everything. Nobody folded anything.'] },
      { id: 'flb', x: 16, y: 18, look: 'fisher', dir: 'up',
        say: ['The Tailors on Ribbon Loop love a friendly battle.\\pWin a few and Master Poppy will hear about it!'] },
    ],
  });
  // after Thimble: the parade has moved on, and the green is just a quiet green
  NP.maps.basting_green.onEnter = function* (c) {
    if (c.flag('thimble_reached')) for (const id of ['march1', 'march2', 'march3', 'march4', 'tack', 'ply']) c.hideNpc(id);
  };

  // ---------------------------------------------------------------------- Gran Tansy's house: cocoa
  K.room({
    id: 'basting_house', name: "Gran Tansy's House", w: 8, h: 7, doorX: 3, exit: { to: 'basting_green', door: 'gran' },
    stamps: [{ id: 'bookshelf', x: 1, y: 0 }, { id: 'table_s', x: 4, y: 3 }, { id: 'plant', x: 6, y: 4 }, { id: 'rug_b', x: 2, y: 4 }],
    npcs: [{
      id: 'gran', x: 3, y: 3, look: 'elder_f', dir: 'down',
      script: function* (c) {
        yield* c.sayT('basting_house.gran.1', 'Gran Tansy: Come in out of the parade, dear. Sit, sit.\\pYour Kigu look like they could use a cup of cocoa.');
        // a rest, not a heal point: a blackout still wakes you at the last Tea House or at home
        NP.State.healAll();
        NP.snd.sfx('save');
        yield* c.sayT('basting_house.gran.2', 'It was a warm cup of cocoa. Your Kigu feel refreshed!');
        yield* c.sayT('basting_house.gran.3', 'Gran Tansy: I stitched ribbons for Tidy Day when it was Ribbon Day.\\pNow they want everything folded. Folded! Ribbons!');
      },
    }],
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
