/* NP.ui — GBA-style windows, message box, menus, bars. All drawing targets an NP.Bitmap (the 240x160 framebuffer).
 *
 * Themes: 'light' (overworld: cream window, dark text) and 'dark' (battle: navy window, white text).
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Font, Input } = NP;

  const THEMES = {
    light: { bg: '#f8f4e4', b1: '#1c2438', b2: '#6f86c0', b3: '#fdfcf4', ink: '#383848', shadow: '#c8c8d0', dim: '#9898a8', sel: '#d83838', hi: '#e8ecf8' },
    dark: { bg: '#283050', b1: '#0c1020', b2: '#8ea0d0', b3: '#485880', ink: '#f8f8f8', shadow: '#586078', dim: '#a0a8c0', sel: '#f8d048', hi: '#384468' },
    plain: { bg: '#f8f8f8', b1: '#303040', b2: '#303040', b3: '#303040', ink: '#303040', shadow: '#d0d0d8', dim: '#9898a8', sel: '#d83838', hi: '#e8ecf8' },
  };

  // ---- text variable substitution ({player}, {rival}, ...) ----
  NP.fmtVars = NP.fmtVars || {};
  NP.fmt = function (s) {
    return String(s).replace(/\{(\w+)\}/g, (m, k) => {
      const f = NP.fmtVars[k];
      if (!f) return m;
      try { const v = f(); return v === undefined || v === null ? m : String(v); } catch (e) { return m; }
    });
  };

  const ui = { THEMES };

  /** Rounded 3-ring window. */
  ui.frame = function (fb, x, y, w, h, theme) {
    const t = THEMES[theme || 'light'];
    const c = [fb.get(x, y), fb.get(x + w - 1, y), fb.get(x, y + h - 1), fb.get(x + w - 1, y + h - 1)];
    fb.fillRect(x, y, w, h, t.b1);
    fb.fillRect(x + 1, y + 1, w - 2, h - 2, t.b2);
    fb.fillRect(x + 2, y + 2, w - 4, h - 4, t.b3);
    fb.fillRect(x + 3, y + 3, w - 6, h - 6, t.bg);
    fb.set(x, y, c[0]); fb.set(x + w - 1, y, c[1]); fb.set(x, y + h - 1, c[2]); fb.set(x + w - 1, y + h - 1, c[3]);
    // soften the second ring's corners too
    fb.set(x + 1, y + 1, t.b1); fb.set(x + w - 2, y + 1, t.b1); fb.set(x + 1, y + h - 2, t.b1); fb.set(x + w - 2, y + h - 2, t.b1);
  };

  /** Flat panel (no ring) for inner boxes. */
  ui.panel = function (fb, x, y, w, h, color, edge) {
    if (edge) fb.fillRect(x, y, w, h, edge);
    fb.fillRect(x + (edge ? 1 : 0), y + (edge ? 1 : 0), w - (edge ? 2 : 0), h - (edge ? 2 : 0), color);
  };

  ui.text = function (fb, str, x, y, theme, o) {
    const t = THEMES[theme || 'light'];
    o = o || {};
    return Font.draw(fb, str, x, y, { color: o.color || t.ink, shadow: o.shadow === undefined ? t.shadow : o.shadow, align: o.align, outline: o.outline, lineHeight: o.lineHeight });
  };

  ui.cursor = function (fb, x, y, theme) {
    const t = THEMES[theme || 'light'];
    Font.draw(fb, '▶', x, y, { color: t.sel, shadow: null });
  };

  ui.moreArrow = function (fb, x, y, frame, theme) {
    const t = THEMES[theme || 'light'];
    const bob = (frame >> 3) & 1;
    Font.draw(fb, '▼', x, y + bob, { color: t.sel, shadow: null });
  };

  // HP colours
  const HP_G = '#48d048', HP_Y = '#f8c820', HP_R = '#f83820', HP_BG = '#485848';
  ui.hpColor = (pct) => (pct > 0.5 ? HP_G : pct > 0.2 ? HP_Y : HP_R);

  /** HP bar, total footprint (w x 5). cur/max may be fractional during animation. */
  ui.hpBar = function (fb, x, y, w, cur, max) {
    fb.fillRect(x, y, w, 5, '#202838');
    fb.fillRect(x + 1, y + 1, w - 2, 3, HP_BG);
    const pct = max > 0 ? Math.max(0, Math.min(1, cur / max)) : 0;
    let fw = Math.round((w - 2) * pct);
    if (cur > 0 && fw < 1) fw = 1;
    if (fw > 0) {
      const col = ui.hpColor(pct);
      fb.fillRect(x + 1, y + 1, fw, 3, col);
      fb.fillRect(x + 1, y + 1, fw, 1, NP.Color.shade(col, 0.35));
    }
  };

  ui.expBar = function (fb, x, y, w, pct) {
    fb.fillRect(x, y, w, 4, '#202838');
    fb.fillRect(x + 1, y + 1, w - 2, 2, '#485868');
    const fw = Math.round((w - 2) * Math.max(0, Math.min(1, pct)));
    if (fw > 0) fb.fillRect(x + 1, y + 1, fw, 2, '#40a0f8');
  };

  // ---------------------------------------------------------------------------------------------
  // Message box: typewriter text, 2 lines per screen, ▼ wait arrow, optional auto-advance.
  // ---------------------------------------------------------------------------------------------
  class Message {
    constructor(theme) {
      this.theme = theme || 'light';
      this.visible = false;
      this.active = false;
      this.screens = [];
      this.si = 0;
      this.chars = 0;
      this.waiting = false;
      this.waitT = 0;
      this.opts = {};
      this.box = { x: 0, y: 112, w: 240, h: 48 };
    }

    /** Split into screens: '\p' (or '\f') = new screen; '\n' = line break; otherwise word-wrapped; 2 lines per screen. */
    static paginate(text, maxW) {
      const screens = [];
      for (const para of NP.fmt(text).split(/\\p|\f|\x0c/)) {
        const lines = Font.wrap(para.replace(/\\n/g, '\n'), maxW);
        for (let i = 0; i < lines.length; i += 2) screens.push(lines.slice(i, i + 2));
      }
      return screens.length ? screens : [['']];
    }

    begin(text, opts) {
      this.opts = opts || {};
      if (this.opts.box) this.box = this.opts.box;
      this.screens = Message.paginate(text, this.box.w - 24);
      this.si = 0;
      this.chars = 0;
      this.waiting = false;
      this.waitT = 0;
      this.visible = true;
      this.active = true;
    }

    get speed() {
      if (this.opts.speed !== undefined) return this.opts.speed;
      const o = NP.Game && NP.Game.opts ? NP.Game.opts.textSpeed : 1;
      return o === 0 ? 0.5 : o === 2 ? 2 : o === 3 ? 999 : 1;
    }

    get total() {
      return this.screens[this.si].reduce((n, l) => n + l.length, 0);
    }

    update() {
      if (!this.active) return;
      const total = this.total;
      if (!this.waiting) {
        if (Input.pressed.a || Input.pressed.b) this.chars = total;
        else this.chars = Math.min(total, this.chars + this.speed);
        if (this.chars >= total) { this.waiting = true; this.waitT = 0; }
      } else {
        this.waitT++;
        const auto = this.opts.auto;
        const last = this.si === this.screens.length - 1;
        if ((auto && this.waitT >= auto && (!last || !this.opts.hold)) || Input.pressed.a || Input.pressed.b) this.advance();
      }
    }

    advance() {
      this.si++;
      if (this.si >= this.screens.length) {
        this.active = false;
        if (!this.opts.keep) this.visible = false;
      } else {
        this.chars = 0;
        this.waiting = false;
      }
    }

    close() {
      this.active = false;
      this.visible = false;
    }

    draw(fb, frame) {
      if (!this.visible) return;
      const b = this.box, t = THEMES[this.theme];
      ui.frame(fb, b.x, b.y, b.w, b.h, this.theme);
      const scr = this.screens[Math.min(this.si, this.screens.length - 1)];
      let left = Math.floor(this.chars);
      const lh = 16;
      for (let i = 0; i < scr.length; i++) {
        const line = scr[i];
        const shown = line.slice(0, Math.max(0, left));
        left -= line.length;
        if (shown) ui.text(fb, shown, b.x + 12, b.y + 11 + i * lh, this.theme);
      }
      if (this.waiting && !this.opts.auto) ui.moreArrow(fb, b.x + b.w - 18, b.y + b.h - 15, frame || 0, this.theme);
    }
  }

  // ---------------------------------------------------------------------------------------------
  // Menu: vertical list or grid with ▶ cursor, scrolling, disabled items, right-aligned values.
  // ---------------------------------------------------------------------------------------------
  class Menu {
    /**
     * opts: { items:[{label, right?, disabled?, value?}|string], x, y, w?, h?, cols=1, colW?, visible=8, theme='light',
     *         cancelable=true, cursor=0, lineH=14, frame=true, title?, wrap=true, pad=8 }
     */
    constructor(o) {
      this.items = o.items.map((it) => (typeof it === 'string' ? { label: it } : it));
      this.x = o.x || 0;
      this.y = o.y || 0;
      this.cols = o.cols || 1;
      this.lineH = o.lineH || 14;
      this.visible = o.visible || 8;
      this.theme = o.theme || 'light';
      this.cancelable = o.cancelable !== false;
      this.cur = o.cursor || 0;
      this.top = 0;
      this.frameOn = o.frame !== false;
      this.title = o.title;
      this.wrap = o.wrap !== false;
      this.pad = o.pad === undefined ? 8 : o.pad;
      let maxLabel = 0;
      for (const it of this.items) maxLabel = Math.max(maxLabel, Font.width(it.label) + (it.right ? Font.width(it.right) + 12 : 0));
      this.colW = o.colW || maxLabel + 14;
      const rows = Math.ceil(this.items.length / this.cols);
      this.rowsShown = Math.min(rows, this.visible);
      this.w = o.w || this.pad * 2 + this.colW * this.cols + 4;
      this.h = o.h || this.pad * 2 + this.rowsShown * this.lineH - 2 + (this.title ? this.lineH : 0) + 2;
      if (o.anchorRight) this.x = o.anchorRight - this.w;
      if (o.anchorBottom) this.y = o.anchorBottom - this.h;
      this.scrollTo();
    }

    get rows() { return Math.ceil(this.items.length / this.cols); }

    scrollTo() {
      const r = Math.floor(this.cur / this.cols);
      if (r < this.top) this.top = r;
      if (r >= this.top + this.visible) this.top = r - this.visible + 1;
    }

    /** returns null | {type:'select', index, item} | {type:'cancel'} */
    update() {
      const d = Input.menuDir();
      const n = this.items.length;
      if (d && n) {
        const old = this.cur;
        if (d === 'up') this.cur = this.cols === 1 ? (this.cur - 1 + n) % n : this.cur - this.cols >= 0 ? this.cur - this.cols : this.cur;
        else if (d === 'down') this.cur = this.cols === 1 ? (this.cur + 1) % n : this.cur + this.cols < n ? this.cur + this.cols : this.cur;
        else if (d === 'left' && this.cols > 1) this.cur = this.cur % this.cols > 0 ? this.cur - 1 : this.cur;
        else if (d === 'right' && this.cols > 1) this.cur = this.cur % this.cols < this.cols - 1 && this.cur + 1 < n ? this.cur + 1 : this.cur;
        if (this.cur !== old) { NP.snd.sfx('cursor'); this.scrollTo(); }
      }
      if (Input.pressed.a && n) {
        const it = this.items[this.cur];
        if (it.disabled) { NP.snd.sfx('error'); return null; }
        NP.snd.sfx('select');
        return { type: 'select', index: this.cur, item: it };
      }
      if (Input.pressed.b && this.cancelable) {
        NP.snd.sfx('cancel');
        return { type: 'cancel' };
      }
      return null;
    }

    draw(fb) {
      const t = THEMES[this.theme];
      if (this.frameOn) ui.frame(fb, this.x, this.y, this.w, this.h, this.theme);
      let oy = this.y + this.pad + (this.frameOn ? 0 : 0);
      if (this.title) {
        ui.text(fb, this.title, this.x + this.pad + 4, oy - 1, this.theme, { color: t.dim });
        oy += this.lineH;
      }
      const first = this.top * this.cols;
      const last = Math.min(this.items.length, first + this.visible * this.cols);
      for (let i = first; i < last; i++) {
        const it = this.items[i];
        const r = Math.floor(i / this.cols) - this.top, c = i % this.cols;
        const ix = this.x + this.pad + 2 + c * this.colW, iy = oy + r * this.lineH - 1;
        if (i === this.cur) ui.cursor(fb, ix, iy, this.theme);
        ui.text(fb, it.label, ix + 8, iy, this.theme, it.disabled ? { color: t.dim } : {});
        if (it.right) ui.text(fb, it.right, ix + this.colW - 6 - Font.width(it.right), iy, this.theme, it.disabled ? { color: t.dim } : {});
      }
      // scroll hints
      if (this.top > 0) Font.draw(fb, '▲', this.x + this.w - 12, this.y + 4, { color: t.dim });
      if (this.top + this.visible < this.rows) Font.draw(fb, '▼', this.x + this.w - 12, this.y + this.h - 12, { color: t.dim });
    }
  }

  ui.Message = Message;
  ui.Menu = Menu;
  NP.ui = ui;
})(typeof globalThis !== 'undefined' ? globalThis : window);
