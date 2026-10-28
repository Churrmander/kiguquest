/* NP.BattleScene move animations — attacks, special casts, status moves, conditions, items — made in-engine from static sprites:
 * squash and stretch, lunges, the foe's AutoSprite battle pose, tints and white flashes on the sprite, screen shake, and a small
 * particle system (sparks, rings, orbs, arrows, flames, bubbles, shards, item icons). Mixed into NP.BattleScene.prototype, so
 * `this` is the scene. Everything is drawn into the battle stage (above the command panel, which is drawn over it) and particles
 * that leave the stage are dropped, so no effect ever spills outside the 256x144 stage.
 *
 * Per-Kigu display state used here (see BattleScene.setDisp): offx/offy (px), sx/sy (squash, 1 = none, anchored at the feet),
 * pose (foe shows its battle pose), tint {col, amt}, white (frames of white flash). */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const A = () => NP.assets;
  const STAGE_H = NP.BOX_Y;
  const FX = { ember: 'flame', tide: 'drop', sprout: 'leaf', volt: 'bolt', frost: 'flake', pebble: 'rock', gale: 'gust', dream: 'star', spook: 'shadow', buzz: 'sparkle', fluff: 'hit_normal', brawl: 'punch', nettle: 'poison', terra: 'dust', shade: 'shadow', iron: 'slash', drake: 'glow' };
  const CAST_SFX = { ember: 'flame', tide: 'splash', sprout: 'leaf', volt: 'zap', pebble: 'rock', gale: 'whoosh', frost: 'ice', fluff: 'cast_fluff', brawl: 'cast_brawl',
    nettle: 'cast_nettle', terra: 'cast_terra', dream: 'cast_dream', buzz: 'cast_buzz', spook: 'cast_spook', drake: 'cast_drake', shade: 'cast_shade', iron: 'cast_iron' };
  const SWING_SFX = { brawl: 'punch', iron: 'slash', shade: 'slash', drake: 'slash', sprout: 'whip', nettle: 'whip', buzz: 'whip', pebble: 'heavy', terra: 'heavy' };
  const COND = {
    brn: { col: '#ff7030', sfx: 'flame' }, psn: { col: '#b060e0', sfx: 'poison' }, tox: { col: '#9040d0', sfx: 'poison' },
    par: { col: '#ffe040', sfx: 'zap' }, slp: { col: '#a8b8ff', sfx: 'sleep' }, frz: { col: '#9fdcff', sfx: 'ice' },
  };
  const typeCol = (type) => (NP.data.types[type] && NP.data.types[type].color) || '#f8f0c0';
  const on = () => NP.Game.opts.battleAnim !== false;
  const rnd = (a, b) => a + Math.random() * (b - a); // cosmetic only: never the battle RNG

  /** Nearest-neighbour squash/stretch of a battle sprite around its feet anchor (w/2, h-2). */
  function stretch(spr, sx, sy) {
    const out = new NP.Bitmap(spr.w, spr.h), ax = spr.w / 2, ay = spr.h - 2;
    for (let y = 0; y < spr.h; y++) {
      const v = Math.round(ay + (y - ay) / sy);
      if (v < 0 || v >= spr.h) continue;
      for (let x = 0; x < spr.w; x++) {
        const u = Math.round(ax + (x - ax) / sx);
        if (u >= 0 && u < spr.w) out.u32[y * spr.w + x] = spr.u32[v * spr.w + u];
      }
    }
    return out;
  }

  const M = {
    // ------------------------------------------------------------------------------------------- particles & camera
    emit(p) {
      if (on()) this.parts.push(Object.assign({ t: 0, life: 20, vx: 0, vy: 0, ay: 0, drag: 1, size: 2, kind: 'dot', col: '#ffffff' }, p));
    },
    /** n particles bursting out of (x, y). o: {col, cols, speed, life, kind, size, ay, up} */
    burstAt(x, y, n, o) {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rnd(-0.2, 0.2), s = (o.speed || 2.4) * rnd(0.6, 1.2);
        this.emit({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (o.up || 0), ay: o.ay || 0, drag: 0.9, life: (o.life || 16) + rnd(-3, 3) | 0,
          kind: o.kind || 'spark', size: o.size || 2, col: o.cols ? o.cols[i % o.cols.length] : o.col });
      }
    },
    ring(x, y, col, o) { this.emit(Object.assign({ x, y, kind: 'ring', r: 2, dr: 1.6, life: 12, col }, o || {})); },
    quakeFor(n, amp) { if (on()) this.quake = { n, amp }; },
    flashScreen(col, a) { if (on()) this.scrFlash = { col, a }; },

    stepFx() {
      for (const p of this.parts) {
        p.t++;
        p.vx *= p.drag; p.vy = p.vy * p.drag + p.ay;
        p.x += p.vx; p.y += p.vy;
        if (p.dr) p.r += p.dr;
      }
      this.parts = this.parts.filter((p) => p.t < p.life && p.y < STAGE_H + 4 && p.y > -16 && p.x > -16 && p.x < NP.W + 16);
      if (this.quake && --this.quake.n <= 0) this.quake = null;
      if (this.scrFlash) { this.scrFlash.a -= 0.06; if (this.scrFlash.a <= 0) this.scrFlash = null; }
      for (const d of this.disp) if (d && d.white > 0) d.white--;
    },

    drawParts(fb) {
      for (const p of this.parts) {
        const a = p.t > p.life * 0.6 ? Math.max(0, 1 - (p.t - p.life * 0.6) / (p.life * 0.4)) : 1;
        const x = Math.round(p.x), y = Math.round(p.y), s = p.size;
        if (p.t < 0 || y >= STAGE_H) continue;
        switch (p.kind) {
          case 'ring': if (y - p.r < STAGE_H) fb.circle(x, y, Math.round(p.r), p.col, false); break;
          case 'spark': fb.line(x, y, Math.round(p.x - p.vx * 1.6), Math.round(p.y - p.vy * 1.6), p.col); fb.set(x, y, '#ffffff'); break;
          case 'plus': fb.blendRect(x - 2, y, 5, 1, p.col, a); fb.blendRect(x, y - 2, 1, 5, p.col, a); break;
          case 'arrow': { // 5px chevron pointing along vy
            const dn = p.vy > 0 ? -1 : 1;
            for (let k = 0; k < 3; k++) fb.blendRect(x - k, y + dn * k, 1 + 2 * k, 1, p.col, a);
            fb.blendRect(x, y + dn * 3, 1, 2, p.col, a);
            break;
          }
          case 'bubble': fb.circle(x, y, s, p.col, false); fb.set(x - 1, y - 1, '#ffffff'); break;
          case 'shard': fb.blendRect(x, y, s, s + 1, p.col, a); fb.set(x, y, '#ffffff'); break;
          case 'orb':
            fb.circle(x, y, s + 1, p.col, true); fb.circle(x, y, Math.max(1, s - 1), '#ffffff', true); break;
          case 'bmp': fb.blit(p.bmp, x - (p.bmp.w >> 1), y - (p.bmp.h >> 1), { alpha: a }); break;
          default: fb.blendRect(x - (s >> 1), y - (s >> 1), s, s, p.col, a);
        }
      }
    },

    /** Shake the stage rows (the panel and data boxes are drawn after this, so they stay put); edge pixels repeat. */
    applyQuake(fb) {
      if (!this.quake) return;
      const q = this.quake, dx = Math.round(rnd(-q.amp, q.amp)), dy = Math.round(rnd(-q.amp, q.amp) * 0.5);
      if (!dx && !dy) return;
      const W = fb.w, src = fb.u32.slice(0, W * STAGE_H);
      for (let y = 0; y < STAGE_H; y++) {
        const sy = Math.max(0, Math.min(STAGE_H - 1, y - dy));
        for (let x = 0; x < W; x++) fb.u32[y * W + x] = src[sy * W + Math.max(0, Math.min(W - 1, x - dx))];
      }
    },
    drawScreenFlash(fb) { if (this.scrFlash) fb.blendRect(0, 0, NP.W, STAGE_H, this.scrFlash.col, this.scrFlash.a); },

    /** The battle sprite for a display state, with pose, squash and tint applied. Returns [bitmap, blitOpts]. */
    kiguSprite(d, side, frame) {
      let spr = null;
      if (side === 1 && d.pose) spr = A().kiguPose(d.species, d.alt);
      if (!spr) spr = side === 0 ? A().kiguBack(d.species, d.alt, frame) : A().kiguFront(d.species, d.alt, frame);
      if (d.sx !== 1 || d.sy !== 1) spr = stretch(spr, d.sx, d.sy);
      const o = { alpha: d.alpha };
      if (d.white > 0) o.fill = '#ffffff';
      else if (d.tint && d.tint.amt > 0) { o.tint = d.tint.col; o.tintAmt = d.tint.amt; }
      else if (d.status === 'frz') { o.tint = COND.frz.col; o.tintAmt = 0.45; }
      return [spr, o];
    },

    // --------------------------------------------------------------------------------------------------- moves
    *evMove(e) {
      const d = this.dsp(e.who), mv = NP.data.moves[e.move];
      if (!d || !mv) return;
      if (!on()) { yield* this.wait(4); return; }
      const side = e.who.side.index, self = mv.target === 'self';
      const t = this.disp[self ? side : 1 - side], col = typeCol(mv.type);
      if (mv.category === 'physical') yield* this.animStrike(d, t, col, mv);
      else if (mv.category === 'special') yield* this.animCast(d, t, mv, col);
      else yield* this.animSupport(d, t, mv, col, self);
      this.pendingLunge = d; // reset (pose, squash, tint, position) once the hit has played
    },

    /** Physical: wind-up squash and pull-back, then a hopping lunge at the target with dust at her feet. */
    *animStrike(d, t, col, mv) {
      const dir = d.mon.side.index === 0 ? 1 : -1;
      d.pose = true;
      for (let i = 1; i <= 6; i++) { d.sx = 1 + i * 0.02; d.sy = 1 - i * 0.025; d.offx = -dir * i * 0.7; yield; }
      NP.snd.sfx((mv && SWING_SFX[mv.type]) || 'swing');
      for (let i = 1; i <= 5; i++) {
        const k = i / 5;
        d.sx = 1.12 - k * 0.2; d.sy = 0.85 + k * 0.23;
        d.offx = -dir * 4 + dir * 26 * k; d.offy = -Math.sin(k * Math.PI) * 7;
        if (i === 1) for (let j = 0; j < 4; j++) this.emit({ x: d.x + rnd(-10, 10), y: d.y - 1, vx: -dir * rnd(0.4, 1.2), vy: -rnd(0.2, 0.8), life: 14, size: 2, col: '#e8dcc0' });
        yield;
      }
      d.sx = 0.94; d.sy = 1.06; d.offy = 0;
      yield;
      d.sx = 1; d.sy = 1;
    },

    /** Special: she gathers type-coloured light, throws a projectile with a trail, it bursts on the target. */
    *animCast(d, t, mv, col) {
      d.pose = true;
      d.tint = { col, amt: 0 };
      NP.snd.sfx('charge');
      for (let i = 0; i < 16; i++) {
        const c = this.mid(d);
        d.tint.amt = 0.4 + 0.2 * Math.sin(i * 0.8);
        d.sy = 1 + Math.sin(i * 0.8) * 0.03; d.sx = 2 - d.sy;
        if (i % 2 === 0) {
          const a = rnd(0, Math.PI * 2), r = 26;
          this.emit({ x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r, vx: -Math.cos(a) * 1.9, vy: -Math.sin(a) * 1.9, life: 13, size: 3, col: i % 4 ? col : '#ffffff' });
        }
        yield;
      }
      d.tint = null; d.sx = 1; d.sy = 1;
      if (!t) return;
      NP.snd.sfx(CAST_SFX[mv.type] || 'beam');
      const p0 = this.mid(d), p1 = this.mid(t), name = FX[mv.type], n = name ? A().fxFrames(name) : 0;
      for (let i = 0; i <= 14; i++) {
        const k = i / 14, x = p0.x + (p1.x - p0.x) * k, y = p0.y + (p1.y - p0.y) * k - Math.sin(k * Math.PI) * 14;
        for (let j = 0; j < 2; j++) this.emit({ x: x + rnd(-3, 3), y: y + rnd(-3, 3), vx: rnd(-0.4, 0.4), vy: rnd(-0.4, 0.4), life: 12, size: 3, col: j ? col : '#ffffff' });
        this.emit({ x, y, life: 2, kind: 'orb', size: 4, col }); // the projectile: a type-coloured orb with a white core
        if (n) this.fx = { bmp: A().fx(name, i % n), x, y };
        yield;
      }
      this.fx = null;
      this.ring(p1.x, p1.y, '#ffffff', { dr: 2.2, life: 10 });
      this.ring(p1.x, p1.y, col, { dr: 1.5, life: 14 });
      this.burstAt(p1.x, p1.y, 12, { cols: [col, '#ffffff'], speed: 2.6, life: 16 });
      if (name) yield* this.playFx(name, t);
    },

    /** Status moves: a rising aura on herself, or a wave of light that washes over the target and makes her wobble. */
    *animSupport(d, t, mv, col, self) {
      d.pose = true;
      if (self || !t) {
        NP.snd.sfx('buff');
        d.tint = { col, amt: 0 };
        const c = this.mid(d), h = c.y - d.y;
        for (let i = 0; i < 22; i++) {
          d.tint.amt = 0.4 * Math.sin((i / 22) * Math.PI);
          if (i % 2 === 0) this.emit({ x: c.x + rnd(-18, 18), y: d.y + d.offy - 2, vy: -rnd(1.4, 2.2), life: 18, kind: i % 4 ? 'dot' : 'plus', size: 2, col: i % 3 ? col : '#ffffff' });
          if (i === 0 || i === 10) this.ring(c.x, c.y - h * 0.1, col, { dr: 2, life: 12 });
          yield;
        }
        d.tint = null;
        return;
      }
      NP.snd.sfx('debuff');
      for (let i = 0; i < 6; i++) { d.offy = -Math.sin((i / 6) * Math.PI) * 4; yield; }
      const p0 = this.mid(d);
      for (let i = 0; i < 18; i++) { // a spiral of motes travelling to the target
        const p1 = this.mid(t), k = i / 18, a = i * 0.9;
        this.emit({ x: p0.x + (p1.x - p0.x) * k + Math.cos(a) * 8, y: p0.y + (p1.y - p0.y) * k + Math.sin(a) * 8, life: 12, size: 2, col: i & 1 ? col : '#ffffff' });
        yield;
      }
      t.tint = { col, amt: 0 };
      for (let i = 0; i < 16; i++) { t.tint.amt = 0.45 * Math.sin((i / 16) * Math.PI); t.offx = Math.sin(i * 1.3) * 3; yield; }
      t.tint = null; t.offx = 0;
    },

    *unlunge() {
      const d = this.pendingLunge;
      if (!d) return;
      this.pendingLunge = null;
      const ox = d.offx, oy = d.offy;
      for (let i = 1; i <= 6; i++) { d.offx = ox * (1 - i / 6); d.offy = oy * (1 - i / 6); yield; }
      Object.assign(d, { offx: 0, offy: 0, sx: 1, sy: 1, pose: false, tint: null });
    },

    /** Impact: white flash and knock-back on the target, sparks and a ring in the move's colour, a shake for big hits. */
    *evHit(e) {
      const d = this.dsp(e.who);
      if (!d || d.mon !== e.who) return;
      NP.snd.sfx(e.eff > 1 ? 'hit_super' : e.eff < 1 && e.eff > 0 ? 'hit_weak' : 'hit');
      const mv = NP.data.moves[e.move];
      if (mv && NP.data.sfx && NP.data.sfx['imp_' + mv.type]) NP.snd.sfx('imp_' + mv.type); // the move type's own impact layer
      if (on()) {
        const c = this.mid(d), col = mv ? typeCol(mv.type) : '#ffffff', away = d.mon.side.index === 0 ? -1 : 1, big = e.eff > 1 || e.crit;
        d.white = 3;
        this.ring(c.x, c.y, '#ffffff', { dr: big ? 2.4 : 1.8, life: 9 });
        this.burstAt(c.x, c.y, big ? 14 : 9, { cols: [col, '#ffffff', '#fff2a0'], speed: big ? 3.2 : 2.4, life: 13 });
        if (big) { this.quakeFor(12, 3); this.flashScreen('#ffffff', 0.45); } else this.quakeFor(5, 1);
        if (mv && mv.category === 'physical') this.playFxAsync(e.eff > 1 ? 'hit_super' : e.eff < 1 ? 'hit_weak' : 'hit_normal', d);
        for (let i = 0; i < 14; i++) {
          d.offx = away * Math.max(0, 6 - i) + (i % 2 ? 1 : -1) * (i < 10 ? (big ? 2 : 1) : 0);
          d.blink = i > 3 && i < 9 && i % 2 ? 1 : 0;
          yield;
        }
        d.blink = 0; d.offx = 0;
      }
      yield* this.unlunge();
    },

    /** A miss: the target side-steps. */
    *evMiss(e) {
      const t = e.target && this.dsp(e.target);
      if (!on() || !t || t.mon !== e.target) { yield* this.wait(6); return; }
      NP.snd.sfx('dodge');
      const dir = t.mon.side.index === 0 ? -1 : 1;
      for (let i = 0; i < 12; i++) { t.offx = dir * Math.sin((i / 12) * Math.PI) * 12; yield; }
      t.offx = 0;
    },

    /** Frame-cycled bitmap effect from NP.art.icons.fx at the Kigu's centre; blocks until it ends. */
    *playFx(name, d) {
      if (!d || !on()) return;
      const n = A().fxFrames(name);
      const f0 = A().fx(name, 0);
      if (!f0) { yield* this.wait(6); return; }
      for (let f = 0; f < n * 3; f++) {
        const c = this.mid(d);
        this.fx = { bmp: A().fx(name, Math.floor(f / 3) % n), x: c.x, y: c.y };
        yield;
      }
      this.fx = null;
    },
    /** Same effect as particles (frames advance as the particle ages), so it plays alongside other motion. */
    playFxAsync(name, d) {
      const n = A().fxFrames(name);
      if (!n || !A().fx(name, 0)) return;
      const c = this.mid(d);
      for (let f = 0; f < n; f++) this.emit({ x: c.x, y: c.y, kind: 'bmp', bmp: A().fx(name, f), t: -f * 3, life: 3 }); // t < 0 = not shown yet
    },

    // ------------------------------------------------------------------------------------- stats, conditions, hp
    *evBoost(e) {
      const d = this.dsp(e.who);
      NP.snd.sfx(e.amt > 0 ? 'stat_up' : 'stat_down');
      if (!d || !on()) { yield* this.wait(8); return; }
      const up = e.amt > 0, col = up ? '#ff8a5c' : '#5c9cff', c = this.mid(d);
      d.tint = { col, amt: 0 };
      for (let i = 0; i < 26; i++) {
        d.tint.amt = 0.45 * Math.sin((i / 26) * Math.PI);
        if (i % 2 === 0) {
          const x = c.x + rnd(-20, 20);
          this.emit(up ? { x, y: d.y + d.offy - 4, vy: -2, life: 20, kind: 'arrow', col: i % 4 ? col : '#ffffff' }
            : { x, y: c.y - 30, vy: 2, life: 20, kind: 'arrow', col: i % 4 ? col : '#ffffff' });
        }
        yield;
      }
      d.tint = null;
    },

    /** One pass of a condition's look on a Kigu (on gaining it, and before each turn's condition damage). */
    *condFx(d, status, frames) {
      const c = COND[status];
      if (!d || !c || !on()) return;
      const m = this.mid(d);
      d.tint = { col: c.col, amt: 0 };
      for (let i = 0; i < frames; i++) {
        const k = Math.sin((i / frames) * Math.PI);
        d.tint.amt = status === 'frz' ? 0.6 * Math.min(1, (i / frames) * 2) : 0.4 * k;
        const x = m.x + rnd(-16, 16);
        if (status === 'brn' && i % 2 === 0) this.emit({ x, y: d.y + d.offy - rnd(0, 20), vy: -rnd(0.8, 1.6), vx: rnd(-0.2, 0.2), life: 16, size: 3, col: ['#ffd040', '#ff7030', '#e83820'][i % 3] });
        if ((status === 'psn' || status === 'tox') && i % 3 === 0) this.emit({ x, y: m.y + rnd(0, 18), vy: -rnd(0.4, 0.9), life: 18, kind: 'bubble', size: 2, col: c.col });
        if (status === 'par') {
          d.offx = i % 4 < 2 ? 1 : -1;
          if (i % 3 === 0) this.emit({ x, y: m.y + rnd(-14, 14), vx: rnd(-2.5, 2.5), vy: rnd(-2.5, 2.5), life: 6, kind: 'spark', col: i % 2 ? c.col : '#ffffff' });
        }
        if (status === 'slp' && i % 14 === 0) { const z = A().emote('zzz'); if (z) this.emit({ x: m.x + 10, y: m.y - 14, vx: 0.4, vy: -0.6, life: 26, kind: 'bmp', bmp: z }); }
        if (status === 'frz' && i % 3 === 0) this.emit({ x, y: m.y + rnd(-18, 10), vx: rnd(-0.6, 0.6), vy: rnd(0.2, 0.9), life: 18, kind: 'shard', size: 2, col: '#d8f4ff' });
        yield;
      }
      d.tint = null; d.offx = 0;
    },

    *evStatus(e) {
      const d = this.dsp(e.who);
      if (d && d.mon === e.who) d.status = e.status;
      if (e.status) {
        NP.snd.sfx(COND[e.status] ? COND[e.status].sfx : 'status');
        if (d && d.mon === e.who && COND[e.status]) yield* this.condFx(d, e.status, 30);
        else yield* this.wait(8);
      } else if (d && d.mon === e.who && on()) { // cured: a clean sparkle
        NP.snd.sfx('sparkle');
        const c = this.mid(d);
        this.burstAt(c.x, c.y, 10, { cols: ['#ffffff', '#fff2a0'], speed: 1.8, life: 16, kind: 'plus' });
        yield* this.wait(14);
      }
    },

    /** HP change: a green glow and rising pluses while healing; the condition's look before condition damage. */
    *evHp(e) {
      const d = this.dsp(e.who);
      if (!d || d.mon !== e.who) return;
      const heal = e.cause === 'heal' || e.cause === 'item' || e.cause === 'drain';
      if (e.cause === 'status' && e.who.status) yield* this.condFx(d, e.who.status, 18);
      if (heal) NP.snd.sfx('heal_tick');
      const steps = Math.max(6, Math.min(40, Math.abs(e.to - e.from) / e.max * 60));
      d.maxhp = e.max;
      if (heal && on()) d.tint = { col: '#70e080', amt: 0 };
      const c = this.mid(d);
      for (let i = 1; i <= steps; i++) {
        d.hp = e.from + (e.to - e.from) * (i / steps);
        if (d.tint) d.tint.amt = 0.4 * Math.sin((i / steps) * Math.PI);
        if (heal && i % 3 === 1) this.emit({ x: c.x + rnd(-16, 16), y: c.y + rnd(0, 20), vy: -rnd(0.7, 1.2), life: 18, kind: 'plus', col: i % 2 ? '#80f090' : '#ffffff' });
        yield;
      }
      d.tint = null;
      d.hp = e.to;
      if (e.who.side.index === 0 && e.to > 0 && e.to / e.max < 0.2) NP.snd.sfx('low_hp');
      yield* this.wait(4);
    },

    /** Bag item used on a Kigu (or a held item triggering): the item pops up over her head and twinkles. */
    *evUse(e) {
      const who = e.target || e.who, d = this.dsp(who);
      if (!d || d.mon !== who || !on()) { yield* this.wait(4); return; }
      const id = typeof e.item === 'string' ? e.item : e.item && e.item.id;
      const icon = id && A().itemIcon(id);
      NP.snd.sfx('item_use');
      const c = this.mid(d), top = Math.max(14, c.y - 34);
      for (let i = 0; i < 26; i++) {
        const k = Math.min(1, i / 8), y = top + (1 - k) * 10 - Math.sin(Math.min(1, i / 8) * Math.PI) * 4;
        if (icon) this.fx = { bmp: icon, x: c.x, y: Math.round(y) };
        if (i === 10) { this.ring(c.x, top, '#ffffff', { dr: 1.6, life: 10 }); this.burstAt(c.x, top, 8, { cols: ['#ffffff', '#fff2a0'], speed: 1.6, life: 14, kind: 'plus' }); }
        yield;
      }
      this.fx = null;
    },
  };

  Object.assign(NP.BattleScene.prototype, M);
  NP.BattleFX = { stretch, typeCol, FX };
})(typeof globalThis !== 'undefined' ? globalThis : window);
