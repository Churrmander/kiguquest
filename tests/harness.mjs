// Shared headless driver for gameplay tests.
import { loadNP } from '../tools/load.mjs';

export function boot(seed) {
  const { NP } = loadNP({ quiet: true });
  NP.rng.seed(seed === undefined ? 12345 : seed);
  const G = NP.Game;
  const bot = {
    NP, G,
    tick(n = 1) { for (let i = 0; i < n; i++) { G.tick(); G.render(); } },
    hold(btn, frames) { NP.Input.set(btn, true); bot.tick(frames); NP.Input.set(btn, false); bot.tick(1); },
    tap(btn) { NP.Input.set(btn, true); bot.tick(2); NP.Input.set(btn, false); bot.tick(2); },
    get ow() { return G.find(NP.Overworld); },
    top() { return G.top(); },
    /** press A every few frames until pred() is true */
    mash(pred, max = 3000, btn = 'a') {
      for (let i = 0; i < max; i++) {
        if (pred()) { NP.Input.set(btn, false); bot.tick(1); return true; }
        if (i % 6 === 0) NP.Input.set(btn, true); else NP.Input.set(btn, false);
        bot.tick(1);
      }
      NP.Input.set(btn, false);
      return pred();
    },
    idle() { const ow = bot.ow; return G.top() === ow && !ow.busy && !ow.player.moving; },
    /** walk a path like ['up',3,'left'] using real key input */
    walk(steps) {
      const list = [];
      for (let i = 0; i < steps.length; i++) { const n = typeof steps[i + 1] === 'number' ? steps[++i] : 1; for (let k = 0; k < n; k++) list.push(steps[i - (n > 1 || typeof steps[i] === 'number' ? 1 : 0)]); }
      return list;
    },
    go(dir, n = 1) {
      const ow = bot.ow;
      for (let i = 0; i < n; i++) {
        let guard = 0;
        // turn + step
        while (guard++ < 80) {
          const p = ow.player;
          const before = p.x + ',' + p.y;
          NP.Input.set(dir, true);
          bot.tick(1);
          if (p.x + ',' + p.y !== before || p.moving) break;
        }
        NP.Input.set(dir, false);
        let g = 0;
        while (ow.player.moving && g++ < 60) bot.tick(1);
        if (!bot.idle() && G.top() === ow) bot.mash(() => bot.idle() || G.top() !== ow, 4000);
        if (G.top() !== ow) return false;
      }
      return true;
    },
    /** BFS on the current map to (x,y); walks with real input. Returns true if we got there (or left the map via a warp). */
    travel(tx, ty, max = 400) {
      const ow = bot.ow;
      const DIRS = [['up', 0, -1], ['down', 0, 1], ['left', -1, 0], ['right', 1, 0]];
      const startMap = ow.map.id;
      for (let iter = 0; iter < max; iter++) {
        if (G.top() !== ow || !bot.idle()) { bot.mash(() => G.top() === ow && bot.idle(), 20000); }
        if (ow.map.id !== startMap) return true;
        const p = ow.player, m = ow.map;
        if (p.x === tx && p.y === ty) return true;
        // BFS
        const key = (x, y) => x + ',' + y;
        const prev = new Map([[key(p.x, p.y), null]]);
        const q = [[p.x, p.y]];
        let found = false;
        while (q.length && !found) {
          const [x, y] = q.shift();
          for (const [d, dx, dy] of DIRS) {
            const nx = x + dx, ny = y + dy, k = key(nx, ny);
            if (prev.has(k)) continue;
            if (m.solid(nx, ny)) continue;
            if (m.ledge(nx, ny)) continue;
            if (ow.actorAt(nx, ny, p) && !(nx === tx && ny === ty)) continue;
            prev.set(k, [x, y, d]);
            if (nx === tx && ny === ty) { found = true; break; }
            q.push([nx, ny]);
          }
        }
        if (!found) return false;
        let cur = key(tx, ty), first = null;
        while (prev.get(cur)) { const [px, py, d] = prev.get(cur); first = d; cur = key(px, py); }
        if (!bot.go(first, 1)) { bot.mash(() => G.top() === ow && bot.idle(), 20000); }
      }
      return false;
    },
    pos() { const p = bot.ow.player; return [bot.ow.map.id, p.x, p.y]; },
  };
  return bot;
}
