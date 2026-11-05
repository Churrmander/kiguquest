/* NP.TileMap — a loaded map: terrain grid + stamps + collision + warps, and the tile renderer.
 *
 * Map definition (see src/maps/*.js):
 *  { id, name, music, battleBg, border:'treeline', legend:{ch:terrainId}, rows:[...], stamps:[{id,x,y,variant,name,to,spawn}],
 *    warps:[{x|xs, y, to, tx,ty,dir | door | spawn}], spawns:{name:{x,y,dir}}, npcs:[...], encounters:{grass:[{sp,min,max,w}]}, ... }
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const T = 16;

  class TileMap {
    constructor(def) {
      this.def = def;
      this.id = def.id;
      this.h = def.rows.length;
      this.w = def.rows[0].length;
      this.grid = new Array(this.w * this.h);
      for (let y = 0; y < this.h; y++) {
        const row = def.rows[y];
        if (row.length !== this.w) throw new Error('map ' + def.id + ': row ' + y + ' has width ' + row.length + ', expected ' + this.w);
        for (let x = 0; x < this.w; x++) {
          const id = def.legend[row[x]];
          if (!id) throw new Error('map ' + def.id + ": unknown legend char '" + row[x] + "' at " + x + ',' + y);
          this.grid[y * this.w + x] = id;
        }
      }
      this.masks = new Array(this.w * this.h);
      this.blocked = new Uint8Array(this.w * this.h);
      this.warps = new Map();
      this.doors = {};
      this.placements = [];
      const A = NP.assets;
      for (const s of def.stamps || []) {
        const sd = A.stampDef(s.id);
        // deco: a per-placement decoration painted onto the stamp's art (`boxes: true` = window flower boxes beside the door)
        const p = { id: s.id, x: s.x, y: s.y, variant: s.variant, def: sd, name: s.name, w: sd.w, h: sd.h, over: sd.over || 0, layer: sd.layer || 'obj', goneIf: s.goneIf, showIf: s.showIf, roll: !!s.roll, deco: s.boxes ? 'boxes' : null };
        this.placements.push(p);
        // every 'D' cell is a door (a double front door has two); the stamp's `name` points at the first (west) one
        const doorCells = [];
        for (let yy = 0; yy < sd.h; yy++) {
          for (let xx = 0; xx < sd.w; xx++) {
            const ch = sd.solid[yy][xx];
            const gx = s.x + xx, gy = s.y + yy;
            if (gx < 0 || gy < 0 || gx >= this.w || gy >= this.h) continue;
            if (ch === '#') this.blocked[gy * this.w + gx] = 1;
            if (ch === 'D') doorCells.push({ x: gx, y: gy });
          }
        }
        if (!doorCells.length && s.to) doorCells.push(sd.door ? { x: s.x + sd.door[0], y: s.y + sd.door[1] } : { x: s.x + (sd.w >> 1), y: s.y + sd.h - 1 });
        for (const door of doorCells) {
          this.blocked[door.y * this.w + door.x] = 0;
          if (s.to) this.warps.set(door.x + ',' + door.y, { x: door.x, y: door.y, to: s.to, spawn: s.spawn || 'door', door: s.toDoor, door_: true, stamp: p });
        }
        if (doorCells.length && s.name) this.doors[s.name] = doorCells[0];
      }
      for (const w of def.warps || []) {
        const xs = w.xs || (Array.isArray(w.x) ? w.x : [w.x]);
        const ys = w.ys || (Array.isArray(w.y) ? w.y : [w.y]);
        for (const x of xs) for (const y of ys) this.warps.set(x + ',' + y, Object.assign({}, w, { x, y }));
      }
      this.objs = this.placements.filter((p) => p.layer !== 'floor');
      this.floors = this.placements.filter((p) => p.layer === 'floor');
      // thin interior walls on tile EDGES (def.edgeWalls): { h: N, x0, x1 } = the edge between rows N-1 and N for columns x0..x1;
      // { v: N, y0, y1 } = the edge between columns N-1 and N for rows y0..y1. They block moving across that edge (edgeBlocked).
      this.edges = new Set();
      for (const e of def.edgeWalls || []) {
        if (e.h !== undefined) for (let x = e.x0; x <= e.x1; x++) { this.edges.add(x + ',' + (e.h - 1) + ',down'); this.edges.add(x + ',' + e.h + ',up'); }
        else for (let y = e.y0; y <= e.y1; y++) { this.edges.add((e.v - 1) + ',' + y + ',right'); this.edges.add(e.v + ',' + y + ',left'); }
      }
    }

    /** true when a thin wall stands on the edge you'd cross leaving (x, y) in direction dir ('up'|'down'|'left'|'right') */
    edgeBlocked(x, y, dir) { return this.edges.size > 0 && this.edges.has(x + ',' + y + ',' + dir); }
    /** can something step from (x, y) to the neighbouring tile in `dir` without crossing an edge wall? (terrain not checked) */
    static dirTo(x, y, nx, ny) { return nx > x ? 'right' : nx < x ? 'left' : ny > y ? 'down' : 'up'; }

    inBounds(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
    idAt(x, y) { return this.inBounds(x, y) ? this.grid[y * this.w + x] : null; }
    tdef(x, y) { return NP.assets.terrainDef(this.idAt(x, y) || this.def.border || 'void'); }
    /** static collision only (terrain + stamps). Water blocks unless canSwim. */
    solid(x, y, canSwim) {
      if (!this.inBounds(x, y)) return true;
      if (this.blocked[y * this.w + x]) return true;
      const t = this.tdef(x, y);
      return !!(t.solid || (t.water && !canSwim));
    }
    ledge(x, y) { return this.inBounds(x, y) ? this.tdef(x, y).ledge || null : null; }
    encounterKind(x, y) { return this.inBounds(x, y) ? this.tdef(x, y).encounter || null : null; }
    /** Field move Snip: take a placed stamp out of the world (and its collision). Remembered so syncSnips can put it back. */
    removeStamp(p) {
      const i = this.placements.indexOf(p);
      if (i < 0) return;
      this.placements.splice(i, 1);
      this._solidCells(p, 0);
      this.objs = this.placements.filter((q) => q.layer !== 'floor');
      this.floors = this.placements.filter((q) => q.layer === 'floor');
      (this.snipped = this.snipped || new Map()).set('snip:' + this.id + ':' + p.x + ',' + p.y, p);
    }
    _solidCells(p, v) {
      for (let yy = 0; yy < p.h; yy++) for (let xx = 0; xx < p.w; xx++) {
        const gx = p.x + xx, gy = p.y + yy;
        if (p.def.solid[yy][xx] === '#' && this.inBounds(gx, gy)) this.blocked[gy * this.w + gx] = v;
      }
    }
    /** Make the map agree with the save's flags: bushes with a `snip:<map>:<x>,<y>` flag are gone, all others are standing.
     *  Idempotent both ways, so a cached map never leaks one game's cuts into another. */
    syncSnips(flags) {
      for (const p of this.placements.slice()) if (p.id === 'bush' && flags['snip:' + this.id + ':' + p.x + ',' + p.y]) this.removeStamp(p);
      // story stamps: `goneIf: flag` (a stuck cart that gets pushed away) and `showIf: flag` (the same cart, pushed clear)
      const off = (p) => !!((p.goneIf && flags[p.goneIf]) || (p.showIf && !flags[p.showIf]));
      let changed = false;
      for (const p of this.placements.slice()) if ((p.goneIf || p.showIf) && off(p)) { changed = true; this.removeStamp(p); this.snipped.delete('snip:' + this.id + ':' + p.x + ',' + p.y); (this.offStamps = this.offStamps || new Set()).add(p); }
      for (const p of Array.from(this.offStamps || [])) {
        if (off(p)) continue;
        changed = true;
        this.offStamps.delete(p);
        this.placements.push(p);
        this._solidCells(p, 1);
        this.objs = this.placements.filter((q) => q.layer !== 'floor');
        this.floors = this.placements.filter((q) => q.layer === 'floor');
      }
      if (changed) this.placeRev = (this.placeRev || 0) + 1;
      if (!this.snipped) return;
      for (const [k, p] of Array.from(this.snipped)) {
        if (flags[k]) continue;
        this.snipped.delete(k);
        this.placements.push(p);
        this._solidCells(p, 1);
        this.objs = this.placements.filter((q) => q.layer !== 'floor');
        this.floors = this.placements.filter((q) => q.layer === 'floor');
      }
    }

    /** Field move Shove: slide a pushable stamp (stamp def `shove: true`) one tile. Remembered in the flag
     *  `shove:<map>:<homeX>,<homeY>` = 'x,y', so syncShoves puts every rock back where the save says it is. */
    moveStamp(p, x, y) {
      this._solidCells(p, 0);
      p.x = x; p.y = y;
      this._solidCells(p, 1);
      this.placeRev = (this.placeRev || 0) + 1;
    }
    /** an ore cart that rolls along the rails when you push it (stamp placed with `roll: true`); remembered like a Shove rock */
    cartAt(x, y) { return this.placements.find((p) => p.roll && p.x === x && p.y === y) || null; }
    isRail(x, y) { const t = this.inBounds(x, y) && NP.terrain[this.idAt(x, y)]; return !!(t && t.group === 'rail'); }
    /** the directions a rail tile joins up with (its rail neighbours) */
    railDirs(x, y) { return [['up', 0, -1], ['down', 0, 1], ['left', -1, 0], ['right', 1, 0]].filter(([, dx, dy]) => this.isRail(x + dx, y + dy)).map((d) => d[0]); }
    shoveAt(x, y) { return this.placements.find((p) => p.def.shove && p.x === x && p.y === y) || null; }
    syncShoves(flags) {
      for (const p of this.placements) {
        if (!p.def.shove && !p.roll) continue;
        if (p.homeX === undefined) { p.homeX = p.x; p.homeY = p.y; }
        const v = flags['shove:' + this.id + ':' + p.homeX + ',' + p.homeY];
        const [x, y] = v ? v.split(',').map(Number) : [p.homeX, p.homeY];
        if (x !== p.x || y !== p.y) this.moveStamp(p, x, y);
      }
    }

    /** (a door whose building is hidden by a story flag, like a cave that hasn't been found yet, leads nowhere) */
    warpAt(x, y) { const w = this.warps.get(x + ',' + y); return w && !(w.stamp && this.placements.indexOf(w.stamp) < 0) ? w : null; }
    stepSound(x, y) { return (this.tdef(x, y).step || 'step'); }

    maskAt(x, y) {
      const i = y * this.w + x;
      let m = this.masks[i];
      if (m === undefined) {
        const t = this.tdef(x, y);
        m = t.autotile ? NP.assets.computeMask((xx, yy) => this.idAt(xx, yy), x, y) : 0;
        this.masks[i] = m;
      }
      return m;
    }

    /** Terrain tiles + floor-layer stamps for the pixel rect [camX,camX+vw) x [camY,camY+vh) onto fb. Returns the overlay list
     *  (animated terrain overlays) for the caller to draw last. Shared by the flat renderer and the pseudo-3D ground pass.
     *  tileFn(terrainId, tx, ty, outside) -> Bitmap | null is the 3D ground pass's hook to substitute a tile's picture. */
    drawTerrain(fb, camX, camY, tick, vw, vh, tileFn) {
      const A = NP.assets;
      const x0 = Math.floor(camX / T), y0 = Math.floor(camY / T);
      const x1 = Math.ceil((camX + vw) / T), y1 = Math.ceil((camY + vh) / T);
      const border = this.def.border || 'void';
      const overlays = [];
      for (let ty = y0; ty < y1; ty++) {
        for (let tx = x0; tx < x1; tx++) {
          const id = this.idAt(tx, ty);
          const dx = tx * T - camX, dy = ty * T - camY;
          if (tileFn) { // the 3D ground pass may swap a tile for its own picture (forest floor under billboard trees, tinted cobble...)
            const alt = tileFn(id === null ? border : id, tx, ty, id === null);
            if (alt) { fb.blit(alt, dx, dy); continue; }
          }
          if (id === null) {
            fb.blit(A.terrain(border, 255, tick >> 4, (tx * 7 + ty * 3) & 3), dx, dy);
            continue;
          }
          const def = A.terrainDef(id);
          const frame = def.frames > 1 ? A.frameAt(def, tick) : 0;
          const variant = def.variants > 1 ? A.variantAt(id, tx, ty) : 0;
          fb.blit(A.terrain(id, this.maskAt(tx, ty), frame, variant), dx, dy);
          if (def.hasOverlay) overlays.push([id, tx, ty, frame]);
        }
      }
      // floor-layer stamps; the 3D ground pass (tileFn) also paints `ground3d` stamps (solid but flat, e.g. crop plots) into the ground
      const flat = tileFn ? this.floors.concat(this.objs.filter((p) => p.def.ground3d)) : this.floors;
      for (const p of flat) {
        if (p.x + p.w <= x0 - 1 || p.x >= x1 + 1 || p.y + p.h <= y0 - 1 || p.y >= y1 + 1) continue;
        fb.blit(A.stamp(p.id, p.variant, A.frameAt(p.def, tick), p.deco), p.x * T - camX, p.y * T - camY);
      }
      return overlays;
    }

    /**
     * Draw the world. cam = top-left pixel of the view in map pixels. actors: [{sortY, draw(fb, ox, oy)}] where ox/oy
     * subtract the camera (actor draws itself at its own pixel pos - o). With NP.view3d.on the pseudo-3D renderer takes over.
     */
    draw(fb, camX, camY, tick, actors) {
      if (NP.view3d && NP.view3d.on) return NP.view3d.draw(this, fb, camX, camY, tick, actors);
      const A = NP.assets;
      const x0 = Math.floor(camX / T), y0 = Math.floor(camY / T);
      const x1 = Math.ceil((camX + NP.W) / T), y1 = Math.ceil((camY + NP.H) / T);
      const overlays = this.drawTerrain(fb, camX, camY, tick, NP.W, NP.H);
      const visible = (p) => p.x + p.w > x0 - 1 && p.x < x1 + 1 && p.y + p.h > y0 - 1 && p.y - Math.ceil((p.def.rise || 0) / T) < y1 + 1;
      // y-sorted objects: stamp bases and actors
      const list = [];
      for (const p of this.objs) {
        if (!visible(p)) continue;
        list.push({ sortY: (p.y + p.h) * T, order: 0, p });
        // a building's roof overhang (`rise` above a stamp with a 3D volume) is its own layer. It sorts just after the row in front of
        // the footprint's top edge, so anything standing in the band the roof covers (the ceil(rise/16) rows behind the building) is
        // drawn UNDER the roof and clipped by it, the way a building hides what is behind it. (Sorting it before that row put people
        // and washing lines on top of the shingles.) Things further north never overlap the roof, so their order does not matter.
        if (p.def.vol && p.def.rise > 0 && !p.over) list.push({ sortY: p.y * T + 1, order: 0, p, roof: true });
      }
      for (const a of actors || []) list.push({ sortY: a.sortY, order: 1, a });
      if (this.edges.size) for (const w of this.edgeArt()) list.push({ sortY: w.sortY, order: 0, w });
      list.sort((a, b) => a.sortY - b.sortY || a.order - b.order);
      for (const e of list) {
        if (e.a) { e.a.draw(fb, camX, camY); continue; }
        if (e.w) { if (e.w.bmp) fb.blit(e.w.bmp, e.w.x - camX, e.w.y - camY); continue; }
        const p = e.p, bmp = A.stamp(p.id, p.variant, A.frameAt(p.def, tick), p.deco);
        const dx = p.x * T - camX, dy = p.y * T - camY - (p.def.rise || 0);   // rise: tall art stands up past the footprint
        if (e.roof) { fb.blit(bmp, dx, dy, { sx: 0, sy: 0, sw: bmp.w, sh: p.def.rise }); continue; }
        if (p.def.vol && p.def.rise > 0 && !p.over) { fb.blit(bmp, dx, dy + p.def.rise, { sx: 0, sy: p.def.rise, sw: bmp.w, sh: bmp.h - p.def.rise }); continue; }
        if (p.over > 0 && p.over < p.h) fb.blit(bmp, dx, dy + p.over * T, { sx: 0, sy: p.over * T, sw: bmp.w, sh: bmp.h - p.over * T });
        else if (!p.over) fb.blit(bmp, dx, dy);
        else fb.blit(bmp, dx, dy); // fully "over": drawn with the base too, then again on top
      }
      for (const p of this.objs) {
        if (!p.over || !visible(p)) continue;
        const bmp = A.stamp(p.id, p.variant, A.frameAt(p.def, tick), p.deco);
        fb.blit(bmp, p.x * T - camX, p.y * T - camY, { sx: 0, sy: 0, sw: bmp.w, sh: Math.min(bmp.h, p.over * T) });
      }
      for (const [id, tx, ty, frame] of overlays) {
        const o = A.overlay(id, frame);
        if (o) fb.blit(o, tx * T - camX, ty * T - camY);
      }
      // terrain drawn above actors (`overActors`, e.g. treeline_secret: a walkable gap that still looks like the tree wall)
      this.drawOverTerrain(fb, camX, camY, tick, x0, y0, x1, y1);
    }

    drawOverTerrain(fb, camX, camY, tick, x0, y0, x1, y1) {
      if (this._over === undefined) {
        this._over = [];
        for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (NP.assets.terrainDef(this.grid[y * this.w + x]).overActors) this._over.push([x, y]);
      }
      const A = NP.assets;
      for (const [tx, ty] of this._over) {
        if (tx < x0 - 1 || tx > x1 || ty < y0 - 1 || ty > y1) continue;
        const id = this.grid[ty * this.w + tx], def = A.terrainDef(id);
        fb.blit(A.terrain(id, this.maskAt(tx, ty), def.frames > 1 ? A.frameAt(def, tick) : 0, def.variants > 1 ? A.variantAt(id, tx, ty) : 0), tx * T - camX, ty * T - camY);
      }
    }

    /** the edge walls as y-sorted pieces: [{ x, y, sortY, bmp }] in map px (art: NP.art.tiles.edgeWall, else a plain strip) */
    edgeArt() {
      if (this._edgeArt) return this._edgeArt;
      const out = [], tiles = NP.art && NP.art.tiles, wall = this.def.edgeWallTerrain || 'wall_wood';
      const art = (k) => (tiles && tiles.edgeWall ? tiles.edgeWall(k, wall) : null);
      for (const e of this.def.edgeWalls || []) {
        if (e.h !== undefined) {
          // a wall-top cap 3px above the edge and the wall face hanging 5px below it, over the south tile
          for (let x = e.x0; x <= e.x1; x++) out.push({ x: x * T, y: e.h * T - 3, sortY: e.h * T + 5, bmp: art(x === e.x0 ? 'hw' : x === e.x1 ? 'he' : 'h') });
        } else {
          for (let y = e.y0; y <= e.y1; y++) out.push({ x: e.v * T - 2, y: y * T, sortY: (y + 1) * T, bmp: art('v') });
          out.push({ x: e.v * T - 2, y: (e.y1 + 1) * T, sortY: (e.y1 + 1) * T + 5, bmp: art('vend') });
        }
      }
      return (this._edgeArt = out);
    }
  }

  NP.TileMap = TileMap;
  NP.maps = NP.maps || {};
})(typeof globalThis !== 'undefined' ? globalThis : window);
