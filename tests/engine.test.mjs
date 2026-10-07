import assert from 'node:assert/strict';
import { loadNP } from '../tools/load.mjs';
const { NP } = loadNP({ quiet: true });
const { Input, Game, ui, Scene } = NP;

// ---- Input: edges, repeat, dir priority
Input.reset();
Input.set('left', true); Game.tick();
assert.ok(Input.pressed.left && Input.held.left);
Game.tick();
assert.ok(!Input.pressed.left && Input.held.left);
Input.set('up', true); Game.tick();
assert.equal(Input.dir(), 'up', 'most recent direction wins');
Input.set('up', false); Game.tick();
assert.equal(Input.dir(), 'left');
Input.set('left', false); Game.tick(); Game.tick();
assert.equal(Input.dir(), null);
// sub-frame tap still registers
Input.set('a', true); Input.set('a', false); Game.tick();
assert.ok(Input.pressed.a, 'latched tap');
Game.tick();

// ---- Message: pagination and variable substitution
NP.state = { name: 'Yuki', flags: {} };
assert.equal(NP.fmt('Hi {player}!'), 'Hi Yuki!');
const scr = ui.Message.paginate('One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty\\pSecond page', 216);
assert.ok(scr.length >= 2 && scr.every((s) => s.length <= 2), 'two lines per screen');
assert.equal(scr[scr.length - 1][0], 'Second page');

// ---- Scene tasks: say -> wait for A; menus return selection
class T extends Scene {
  constructor() { super(); this.log = []; }
  enter() {
    this.spawn((function* (s) {
      yield* s.say('Hello there');
      s.log.push('said');
      const i = yield* s.choose(['One', 'Two', 'Three']);
      s.log.push('picked ' + i);
    })(this));
  }
}
Game.reset(new T());
const sc = Game.top();
for (let i = 0; i < 40; i++) Game.tick();
Input.set('a', true); Game.tick(); Input.set('a', false); Game.tick(); // dismiss the message
for (let i = 0; i < 4; i++) Game.tick();
assert.deepEqual(sc.log.slice(0, 1), ['said']);
Input.set('down', true); Game.tick(); Input.set('down', false); Game.tick();
Input.set('a', true); Game.tick(); Input.set('a', false); Game.tick(); Game.tick();
assert.deepEqual(sc.log, ['said', 'picked 1']);

// ---- Game: fades finish, opaque stacking
Game.fadeTo(1, 10);
for (let i = 0; i < 12; i++) Game.tick();
assert.equal(Game.fade.a, 1);
assert.ok(!Game.fading);
Game.fadeTo(0, 0);
assert.equal(Game.fade.a, 0);

// ---- TileMap: collision, ledges, warps, doors
const tm = new NP.TileMap(NP.maps.route1);
assert.ok(tm.solid(0, 0), 'border trees are solid');
assert.ok(!tm.solid(12, 35));
assert.equal(tm.ledge(16, 28), 'down');
assert.ok(tm.warpAt(12, 0) && tm.warpAt(12, 0).to === 'thimble');
const bt = new NP.TileMap(NP.maps.button_town);
assert.ok(bt.doors.lab && bt.warpAt(bt.doors.lab.x, bt.doors.lab.y).to === 'lab');
assert.ok(bt.solid(bt.doors.lab.x - 1, bt.doors.lab.y), 'wall next to the door is solid');
assert.ok(!bt.solid(bt.doors.lab.x, bt.doors.lab.y), 'door tile is walkable');

// ---- rendering never throws and draws something
const fb = new NP.Bitmap(240, 160);
tm.draw(fb, 100, 400, 0, []);
assert.ok(fb.countColors() > 4);
// the framebuffer of a running game
const ow = NP.quickStart('Ren', 'm');
for (let i = 0; i < 30; i++) Game.tick();
const out = Game.render();
assert.equal(out.w, 240);
assert.ok(out.countColors() > 4);

// ---- sound wrapper is safe without audio
NP.snd.sfx('cursor'); NP.snd.play('title'); NP.snd.jingle('j_item', () => {}); NP.snd.stop();
console.log('engine ok');
