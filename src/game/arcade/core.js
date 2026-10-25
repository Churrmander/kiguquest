/* src/game/arcade/core.js — the Shibuyarn prize arcade: coins and tickets, the cabinet scene every arcade game runs in,
 * a small pixel kit the games share, and NP.arcade.run(), which map scripts reach through `yield* c.arcade(id, opts)`.
 *
 *   NP.arcade.register(id, { title, cost, lights, blurb:[lines], create() -> game, tickets(score), drawTitle(fb, t) })
 *   game: { score, over, update(), draw(fb, t) }   (update reads NP.Input; draw paints the whole 256x192 screen)
 *   ids: 'cab_1' Moth Patrol, 'cab_2' Button Breaker, 'cab_3' Steam Chase, 'platformer' Rooftop Hop, 'claw' Plush Catcher,
 *        plus the counters 'coins' and 'prizes' (counters.js).
 *
 * Save data lives in NP.state.arcade (made on first use, so old saves need nothing): coins, tickets, best scores, plushes won,
 * Tailor Card designs owned and the one in use.
 */
(function (root) {
  'use strict';
  const NP = root.NP;
  const { Input, Scene, Font, Bitmap } = NP;
  const AR = (NP.arcade = NP.arcade || {});

  AR.games = {};
  AR.COIN_PRICE = 20; // money per coin at the counter
  AR.LIGHTS_FLAG = 'shibuyarn_lights'; // set by Chapter 5 when the Spark Cellar is cleared

  AR.register = function (id, def) {
    AR.games[id] = Object.assign({ id, cost: 3, lights: true, blurb: [] }, def);
    return AR.games[id];
  };

  /** The arcade save block, created (and topped up with any missing fields) on first use. */
  AR.st = function () {
    const s = NP.state;
    const a = s.arcade || (s.arcade = {});
    if (typeof a.coins !== 'number') a.coins = 0;
    if (typeof a.tickets !== 'number') a.tickets = 0;
    for (const k of ['best', 'plays', 'plush', 'cards', 'bought']) if (!a[k] || typeof a[k] !== 'object') a[k] = {};
    a.cards.plain = 1;
    if (!a.card || !a.cards[a.card]) a.card = 'plain';
    return a;
  };
  AR.lit = () => !!(NP.state && NP.state.flags && NP.state.flags[AR.LIGHTS_FLAG]);
  /** Can this cabinet be played right now? (the brownout leaves only the cabinets that don't need the city power) */
  AR.working = (id) => { const g = AR.games[id]; return !!g && (!g.lights || AR.lit()); };
  AR.addTickets = function (n) { const a = AR.st(); a.tickets = Math.min(99999, a.tickets + Math.max(0, n | 0)); return a.tickets; };

  // =========================================================================================== pixel kit
  const K = (AR.kit = {});
  const cache = new Map();
  /** Bitmap from ASCII rows, cached by key. pal maps a character to a colour; '.' and unknown characters are transparent. */
  K.spr = function (key, rows, pal) {
    let b = cache.get(key);
    if (!b) { b = Bitmap.fromRows(rows, pal); cache.set(key, b); }
    return b;
  };
  K.memo = function (key, make) {
    let b = cache.get(key);
    if (!b) { b = make(); cache.set(key, b); }
    return b;
  };
  /** Arcade lettering: game font with a dark outline (reads on any background). */
  K.text = function (fb, s, x, y, color, o) {
    o = o || {};
    return Font.draw(fb, String(s), x, y, { color: color || '#ffffff', outline: o.outline === undefined ? '#101020' : o.outline, shadow: null, align: o.align });
  };
  K.center = (fb, s, y, color, o) => K.text(fb, s, NP.W >> 1, y, color, Object.assign({ align: 'center' }, o));
  /** Axis-aligned box overlap; boxes are {x, y, w, h}. */
  K.hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  K.rand = (n) => NP.rng.int(n);
  K.chance = (p) => NP.rng.chance(p);
  K.sfx = (id) => { if (NP.snd) NP.snd.sfx(id); };
  K.pad = (n, w) => { let s = String(Math.max(0, n | 0)); while (s.length < w) s = '0' + s; return s; };
  /** Starfield / dot backdrop helper: deterministic speckles. */
  K.speckle = function (fb, seed, n, colors, y0, y1, drift) {
    let s = seed >>> 0;
    const r = () => { s = (s * 1103515245 + 12345) >>> 0; return s >>> 8; };
    for (let i = 0; i < n; i++) {
      const x = r() % NP.W, y = y0 + ((r() % (y1 - y0)) + (drift || 0) * (1 + (i % 3))) % (y1 - y0);
      fb.set(x, y | 0, colors[i % colors.length]);
    }
  };
  /** A Kigu party icon (32x32, frame 0|1) if the art is loaded, else null. */
  K.kiguIcon = (id, frame) => (NP.assets && NP.data.species[id] ? NP.assets.kiguIcon(id, frame || 0) : null);

  // Shared top strip for every cabinet: 12 px, score left, best centre, lives / coins right.
  K.hud = function (fb, game, def) {
    fb.fillRect(0, 0, NP.W, 12, '#0c0c1c');
    fb.hline(0, 12, NP.W, '#3a3a6a');
    K.text(fb, 'SCORE ' + K.pad(game.score, 6), 4, 2, '#f8f8f8');
    K.text(fb, 'BEST ' + K.pad(Math.max(game.score, AR.st().best[def.id] || 0), 6), NP.W >> 1, 2, '#f8d048', { align: 'center' });
    if (game.lives !== undefined) {
      const ic = def.lifeIcon ? def.lifeIcon() : null;
      for (let i = 0; i < Math.min(5, game.lives); i++) {
        if (ic) fb.blit(ic, NP.W - 2 - ic.w - i * (ic.w + 1), 2);
        else fb.fillRect(NP.W - 10 - i * 8, 4, 5, 5, '#f87878');
      }
    }
  };

  // =========================================================================================== cabinet scene
  const CAB = { bezel: '#1a1430', bezelHi: '#5a3a8a', ink: '#f8f8f8', dim: '#a8a0c8', gold: '#f8d048', pink: '#f878b8' };

  class CabinetScene extends Scene {
    /** o: { free: n } gives n free plays (the rival's turn at the claw, Chapter 5) */
    constructor(id, o) {
      super('dark');
      this.id = id;
      this.def = AR.games[id];
      this.free = (o && o.free) | 0;
      this.storyGo = this.free > 0;
      this.phase = 'attract';
      this.t = 0;
      this.game = null;
      this.note = '';
      this.won = 0;        // tickets shown on the results screen (counts up)
      this.payout = 0;     // tickets earned by the last game
      this.result = { plays: 0, tickets: 0, score: 0 };
    }
    enter() { this.spawn(this.run(), 'cabinet'); }

    *run() {
      yield;
      for (;;) {
        const go = yield* this.attract();
        if (!go) break;
        yield* this.play();
        yield* this.results();
        if (this.storyGo && this.free === 0) break;   // a story's free go (the rival's claw) hands straight back to the scene
      }
      NP.Game.pop();
    }

    *attract() {
      this.phase = 'attract';
      this.note = '';
      // a short beat before A counts again, so mashing through the results screen can't start (and pay for) another go
      let wait = 45;
      for (;;) {
        yield;
        if (Input.pressed.b) { K.sfx('cancel'); return false; }
        if (wait > 0) { wait--; if (wait === 0 && Input.held.a) wait = 1; continue; } // and A must be let go first
        if (Input.pressed.a) {
          const a = AR.st(), cost = this.def.cost;
          if (this.free > 0) { this.free--; K.sfx('pickup'); return true; }
          if (a.coins < cost) { K.sfx('error'); this.note = 'You need ' + cost + ' coins. The coin counter can sell you some.'; continue; }
          a.coins -= cost;
          K.sfx('pickup');
          return true;
        }
      }
    }

    *play() {
      this.phase = 'play';
      this.game = this.def.create();
      this.paused = false;
      const a = AR.st();
      a.plays[this.id] = (a.plays[this.id] || 0) + 1;
      this.result.plays++;
      let quit = false;
      yield; // let go of the A press that put the coins in, so it doesn't also act on the game's first frame
      while (!this.game.over && !quit) {
        if (this.pauseCool > 0) this.pauseCool--;
        if (Input.pressed.start && !(this.pauseCool > 0)) {
          K.sfx('menu_open');
          this.paused = true;
          const r = yield* this.choose(['Keep playing', 'Stop here'], { x: 88, y: 76, theme: 'dark' });
          this.paused = false;
          if (r === 1) quit = true;
          this.pauseCool = 30; // no pausing again straight away (no stepping frame by frame through the pause menu)
          yield;
          continue;
        }
        this.game.update();
        this.t++;
        yield;
      }
      // a short beat on the last frame before the results
      if (!quit) for (let i = 0; i < 40; i++) { this.t++; yield; }
    }

    *results() {
      this.phase = 'results';
      const g = this.game, a = AR.st();
      const score = g.score | 0;
      this.newBest = !this.def.noScore && score > (a.best[this.id] || 0);
      if (this.newBest) a.best[this.id] = score;
      this.payout = Math.max(0, this.def.tickets(score, g) | 0);
      AR.addTickets(this.payout);
      this.result.tickets += this.payout;
      this.result.score = Math.max(this.result.score, score);
      if (g.prize && this.def.onPrize) this.def.onPrize(g.prize, this);
      this.won = 0;
      if (this.newBest) K.sfx('levelup');
      for (;;) {
        if (this.won < this.payout) {
          this.won = Math.min(this.payout, this.won + Math.max(1, Math.ceil(this.payout / 40)));
          if ((this.t & 3) === 0) K.sfx('cursor');
        } else if (Input.pressed.a || Input.pressed.b) { K.sfx('select'); return; }
        this.t++;
        yield;
      }
    }

    draw(fb, frame) {
      const d = this.def, a = AR.st();
      if (this.phase === 'attract') {
        d.drawTitle(fb, this.t + (frame | 0));
        // coin slot panel
        fb.fillRect(0, NP.H - 34, NP.W, 34, CAB.bezel);
        fb.hline(0, NP.H - 34, NP.W, CAB.bezelHi);
        const blink = ((frame | 0) >> 5) & 1;
        const cost = this.free > 0 ? 'FREE PLAY' : d.cost + ' COINS';
        if (this.note) K.center(fb, this.note, NP.H - 30, CAB.pink);
        else if (blink) K.center(fb, 'PRESS A  -  ' + cost, NP.H - 30, CAB.gold);
        K.text(fb, 'Coins ' + a.coins, 6, NP.H - 15, CAB.ink);
        K.text(fb, 'Tickets ' + a.tickets, NP.W >> 1, NP.H - 15, CAB.ink, { align: 'center' });
        K.text(fb, 'B: step away', NP.W - 6, NP.H - 15, CAB.dim, { align: 'right' });
      } else if (this.phase === 'play' || !this.game) {
        if (this.game) this.game.draw(fb, this.t);
        if (this.game && !d.noHud) K.hud(fb, this.game, d);
        if (this.paused) fb.blendRect(0, 0, NP.W, NP.H, '#000010', 0.45);
      } else {
        this.game.draw(fb, this.t);
        fb.blendRect(0, 0, NP.W, NP.H, '#06061a', 0.7);
        const g = this.game;
        K.center(fb, g.endTitle || 'GAME OVER', 44, CAB.pink);
        if (!d.noScore) {
          K.center(fb, 'SCORE  ' + K.pad(g.score, 6), 70, CAB.ink);
          if (this.newBest) { if (((frame | 0) >> 3) & 1) K.center(fb, 'NEW BEST!', 84, CAB.gold); }
          else K.center(fb, 'BEST   ' + K.pad(a.best[this.id] || 0, 6), 84, CAB.dim);
        }
        if (g.prizeText) K.center(fb, g.prizeText, 102, '#90e0ff');
        K.center(fb, 'TICKETS  +' + this.won, 120, CAB.gold);
        drawTicket(fb, (NP.W >> 1) - 46, 118);
        if (this.won >= this.payout) K.center(fb, 'A: continue', 150, CAB.dim);
      }
      this.drawUI(fb, frame);
    }
  }
  AR.CabinetScene = CabinetScene;

  /** 12x8 ticket stub (orange with a punched hole), used on results and the prize counter */
  function ticketBmp() {
    return K.spr('ticket', [
      '.oooooooooo.',
      'oyyyyyyyyyyo',
      'oyrrryyyyyyo',
      'oyrrry.yyyyo',
      'oyyyyyyyyyyo',
      'oyrrryyyyyyo',
      'oyyyyyyyyyyo',
      '.oooooooooo.',
    ], { o: '#a83810', y: '#f8a838', r: '#f8e0a0' });
  }
  function drawTicket(fb, x, y) { fb.blit(ticketBmp(), x, y); }
  function coinBmp() {
    return K.spr('coin', [
      '..oooo..',
      '.oyyyyo.',
      'oyywwyyo',
      'oywyyyyo',
      'oyyyyy+o',
      'oyyyy++o',
      '.o++++o.',
      '..oooo..',
    ], { o: '#7a5010', y: '#f8d048', w: '#fff8c8', '+': '#c89020' });
  }
  K.ticket = ticketBmp;
  K.coin = coinBmp;

  // =========================================================================================== the script hook
  /** Map scripts: `yield* c.arcade(id, opts)`. Runs a cabinet, a counter, or explains why a cabinet is dark. Returns the
   * cabinet scene's result ({plays, tickets, score}) or null. */
  AR.run = function* (c, id, o) {
    AR.st();
    if (AR.counters && AR.counters[id]) return yield* AR.counters[id](c, o || {});
    const def = AR.games[id];
    if (!def) { yield* c.say('The screen just says "COMING SOON" in pink letters.'); return null; }
    if (!AR.working(id)) {
      yield* c.sayT('arcade.dark', 'The screen is dark. A note taped to the glass says, "Out of order until the power comes back. Sorry! Hattie"');
      return null;
    }
    const s = new CabinetScene(id, o);
    NP.Game.push(s);
    yield* c.ow.waitFor(() => s.finished);
    return s.result;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
