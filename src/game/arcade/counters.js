/* src/game/arcade/counters.js — the two counters of the Lucky Spool arcade: the coin counter (money for coins) and the prize
 * counter (tickets for prizes, src/game/arcade/prizes.js). Map scripts reach them as c.arcade('coins') and c.arcade('prizes'). */
(function (root) {
  'use strict';
  const NP = root.NP;
  const { Input, ui, Scene, Font } = NP;
  const AR = NP.arcade, K = AR.kit;
  const A = () => NP.assets;

  const BUNDLES = [[10, 0], [50, 5], [100, 15]]; // coins, free bonus coins

  AR.counters = {
    *coins(c) {
      const a = AR.st();
      yield* c.sayT('arcade.coins.1', 'Hi there! Coins are $' + AR.COIN_PRICE + ' each, and I throw in a few extra if you buy a big cup.');
      for (;;) {
        const opts = BUNDLES.map(([n, bonus]) => n + ' coins  $' + n * AR.COIN_PRICE + (bonus ? '  (+' + bonus + ' free)' : ''));
        opts.push('No thanks');
        yield* c.say('You have $' + NP.state.money + ' and ' + a.coins + ' coins.', { keep: true });
        const i = yield* c.choose(opts);
        if (i < 0 || i >= BUNDLES.length) break;
        const [n, bonus] = BUNDLES[i], cost = n * AR.COIN_PRICE;
        if (NP.state.money < cost) { NP.snd.sfx('error'); yield* c.sayT('arcade.coins.poor', "Oh, you're a little short for that one. Maybe a smaller cup?"); continue; }
        if (a.coins + n + bonus > 9999) { yield* c.sayT('arcade.coins.full', "Your coin case is full! Go and spend some first."); continue; }
        NP.state.money -= cost;
        a.coins += n + bonus;
        NP.snd.sfx('pickup');
        yield* c.say('Here you go! That\'s ' + (n + bonus) + ' coins.');
      }
      yield* c.sayT('arcade.coins.bye', 'Have fun, and good luck on the claw!');
    },

    *prizes(c) {
      yield* c.sayT('arcade.prizes.1', 'Welcome to the prize counter! Tickets go in, prizes come out. Take your time looking.');
      const s = new PrizeScene();
      NP.Game.push(s);
      yield* c.ow.waitFor(() => s.finished);
      if (s.gotKigu) {
        const k = yield* c.giveKigu(s.gotKigu.id, s.gotKigu.level);
        if (k) yield* c.sayT('arcade.prizes.kigu', "She's been waiting by the counter for someone to take her out on the road. Look after her!");
      }
      yield* c.sayT('arcade.prizes.bye', 'Come back when you\'ve won a few more tickets!');
    },
  };

  // =========================================================================================== prize counter screen
  class PrizeScene extends Scene {
    constructor() {
      super('light');
      this.tab = 0;
      this.cur = [0, 0, 0, 0];
      this.note = 'What would you like?';
      this.gotKigu = null;
    }
    enter() { this.spawn(this.run(), 'prizes'); }
    get tabs() { return AR.catalogue(); }
    *run() {
      yield;
      for (;;) {
        const tabs = this.tabs, t = Math.min(this.tab, tabs.length - 1), list = tabs[t].list;
        const d = Input.menuDir();
        if (d === 'left' || Input.pressed.l) { this.tab = (t + tabs.length - 1) % tabs.length; NP.snd.sfx('cursor'); }
        else if (d === 'right' || Input.pressed.r) { this.tab = (t + 1) % tabs.length; NP.snd.sfx('cursor'); }
        else if (d === 'up' && list.length) { this.cur[t] = (this.cur[t] + list.length - 1) % list.length; NP.snd.sfx('cursor'); }
        else if (d === 'down' && list.length) { this.cur[t] = (this.cur[t] + 1) % list.length; NP.snd.sfx('cursor'); }
        if (Input.pressed.b) { NP.snd.sfx('cancel'); NP.Game.pop(); return; }
        if (Input.pressed.a && list.length) {
          const p = list[this.cur[t] || 0];
          yield* this.buy(p);
          if (this.gotKigu) { NP.Game.pop(); return; }
        }
        yield;
      }
    }
    *buy(p) {
      const a = AR.st();
      if (AR.owned(p)) { NP.snd.sfx('error'); this.note = p.kind === 'card' ? 'You already have that design.' : 'That prize has already gone home with you.'; return; }
      if (a.tickets < p.price) { NP.snd.sfx('error'); this.note = 'You need ' + (p.price - a.tickets) + ' more tickets for that.'; return; }
      if (p.kind === 'kigu' && NP.state.party.length >= 6 && NP.state.box.length >= 300) { NP.snd.sfx('error'); this.note = 'There is no room for her anywhere!'; return; }
      NP.snd.sfx('select');
      const ok = yield* this.yesno(false);
      if (!ok) { this.note = 'What would you like?'; return; }
      a.tickets -= p.price;
      if (p.kind === 'item') { NP.State.addItem(p.id, 1); this.note = 'You got a ' + p.name + '! It went in your bag.'; }
      else if (p.kind === 'card') { a.cards[p.id] = 1; a.card = p.id; this.note = 'Your Tailor Card now has the ' + AR.CARDS[p.id].name + ' design!'; }
      else if (p.kind === 'kigu') { a.bought[p.id] = 1; this.gotKigu = { id: p.id, level: p.level }; }
      NP.snd.sfx('pickup');
    }
    draw(fb, frame) {
      fb.clear('#f4e8f4');
      for (let y = 0; y < NP.H; y += 8) fb.fillRect(0, y, NP.W, 4, '#ecdcec');
      const a = AR.st(), tabs = this.tabs, t = Math.min(this.tab, tabs.length - 1), list = tabs[t].list, cur = Math.min(this.cur[t] || 0, Math.max(0, list.length - 1));
      // tab strip
      ui.frame(fb, 4, 4, NP.W - 8, 18, 'light');
      ui.text(fb, '<', 10, 9, 'light', { color: '#9098b0' }); ui.text(fb, '>', NP.W - 16, 9, 'light', { color: '#9098b0' });
      ui.text(fb, tabs[t].name, NP.W >> 1, 9, 'light', { color: '#d83838', align: 'center' });
      ui.text(fb, (t + 1) + '/' + tabs.length, NP.W - 24, 9, 'light', { color: '#9098b0', align: 'right', shadow: null });
      // list
      ui.frame(fb, 4, 26, 150, 112, 'light');
      const top = Math.max(0, Math.min(cur - 4, list.length - 8));
      for (let i = 0; i < 8 && top + i < list.length; i++) {
        const p = list[top + i], y = 32 + i * 13;
        const gone = AR.owned(p);
        if (top + i === cur) ui.cursor(fb, 9, y, 'light');
        ui.text(fb, p.name, 18, y, 'light', { color: gone ? '#a8a8b8' : undefined });
        const pr = gone ? 'got' : String(p.price);
        ui.text(fb, pr, 148 - Font.width(pr), y, 'light', { color: gone ? '#a8a8b8' : a.tickets >= p.price ? '#383848' : '#c06060' });
      }
      // picture + description
      ui.frame(fb, 158, 26, NP.W - 162, 112, 'light');
      const p = list[cur];
      if (p) {
        const cx = 158 + ((NP.W - 162) >> 1);
        if (p.kind === 'item') fb.blit(A().itemIcon(p.id), cx - 12, 34);
        else if (p.kind === 'kigu') { const ic = A().kiguIcon(p.id, (NP.Game.frame >> 4) & 1); fb.blit(ic, cx - 16, 30); }
        else if (p.kind === 'card') AR.drawCardSwatch(fb, p.id, cx - 30, 32, 60, 26);
        const lines = Font.wrap(p.desc, NP.W - 176);
        lines.slice(0, 6).forEach((l, i) => ui.text(fb, l, 164, 66 + i * 11, 'light', { color: '#505870', shadow: null }));
      }
      // tickets + note
      ui.frame(fb, 0, NP.H - 52, NP.W, 52, 'light');
      fb.blit(K.ticket(), 10, NP.H - 44);
      ui.text(fb, a.tickets + ' tickets', 26, NP.H - 46, 'light');
      ui.text(fb, a.coins + ' coins', NP.W - 10, NP.H - 46, 'light', { align: 'right', color: '#707890', shadow: null });
      ui.text(fb, this.note, 10, NP.H - 30, 'light');
      ui.text(fb, 'L/R or Left/Right: next shelf   B: done', 10, NP.H - 16, 'light', { color: '#9098b0', shadow: null });
      this.drawUI(fb, frame);
    }
  }
  AR.PrizeScene = PrizeScene;
})(typeof globalThis !== 'undefined' ? globalThis : window);
