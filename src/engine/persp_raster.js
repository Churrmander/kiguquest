/* src/engine/persp_raster.js — NP.view3d.raster: perspective-correct textured quads with a per-pixel depth test, for real 3D volumes
 * (building walls, roof slopes, awnings, fence rails...). Extends NP.view3d (persp.js); uses the same camera as the ground and sprites:
 * a world point (x, y map px; z height above the ground) projects to  x' = 120 + u*f/Z,  y' = hz + (hh - z)*f/Z,  Z = f + v.
 *
 *   R.face(fb, st, tex, pts, uv, n, o)   pts = [[x,y,z] x4] (outer face counter-clockwise or not: the outward normal n = [nx,ny,nz]
 *                                         decides culling), uv = [[s,t] x4] in texels of tex, o = { shade: 0..256, noCull, cut, alpha: 0..256 }.
 *   Texture pixels with alpha < 128 are skipped. Colours are fogged per pixel by depth; faces nearer than the hero are drilled by the
 *   hero cutaway (V.cut) unless o.cut === false. Faces far away use a pre-filtered mip of the texture.
 * No allocations per call: all scratch lives in typed arrays.
 */
(function (root) {
  'use strict';
  const NP = root.NP, V = NP.view3d;
  const { SW, SH } = V.consts;
  const R = (V.raster = {});

  // scratch polygon: up to 8 vertices of [sx, sy, iz, s*iz, t*iz] plus camera-space (u, Z, h, s, t) for clipping
  const CU = new Float64Array(16), CZ = new Float64Array(16), CH = new Float64Array(16), CS = new Float64Array(16), CT = new Float64Array(16);
  const QU = new Float64Array(16), QZ = new Float64Array(16), QH = new Float64Array(16), QS = new Float64Array(16), QT = new Float64Array(16);
  const PX = new Float64Array(16), PY = new Float64Array(16), PI = new Float64Array(16), PS = new Float64Array(16), PT = new Float64Array(16);
  let fogLut = null, fogKey = null;

  /** fog weight (0..256) by camera depth Z in 4-px steps; rebuilt when the fog settings change */
  function fogTable() {
    const c = V.cfg, key = c.f + '|' + c.fogStart + '|' + c.fogEnd;
    if (key === fogKey) return fogLut;
    fogKey = key;
    fogLut = new Uint16Array(1024);
    for (let i = 0; i < 1024; i++) fogLut[i] = Math.round(V.fogAt(i * 4 + 2 - c.f) * 256);
    return fogLut;
  }

  /** textured, fogged, depth-tested triangle from the PX/PY/PI/PS/PT scratch vertices i0,i1,i2 */
  function tri(fb, tex, i0, i1, i2, shade, cutting, alpha) {
    // sort by y
    let a = i0, b = i1, c = i2, t;
    if (PY[a] > PY[b]) { t = a; a = b; b = t; }
    if (PY[b] > PY[c]) { t = b; b = c; c = t; }
    if (PY[a] > PY[b]) { t = a; a = b; b = t; }
    const ay = PY[a], by = PY[b], cy = PY[c];
    const yStart = Math.max(0, Math.ceil(ay - 0.5)), yEnd = Math.min(SH, Math.ceil(cy - 0.5));
    if (yStart >= yEnd || cy - ay < 1e-6) return;
    const du = fb.u32, zb = V.zb, tu = tex.u32, tw = tex.w, th = tex.h, cm = V.cut.mask, cutIz = V.cut.iz * 1.02;
    const nfZ0 = 0.14 * V.cfg.f, nfZ1 = 0.24 * V.cfg.f, nfK = 256 / (nfZ1 - nfZ0);   // faces only dissolve right at the lens (sprites: V.cfg.nearFade)
    const fl = fogLut, fc = V._fogC, fr = fc & 255, fg = (fc >>> 8) & 255, fbl = (fc >>> 16) & 255;
    const ax = PX[a], bx = PX[b], cx = PX[c], aI = PI[a], bI = PI[b], cI = PI[c], aS = PS[a], bS = PS[b], cS = PS[c], aT = PT[a], bT = PT[b], cT = PT[c];
    const dyL = cy - ay;
    for (let y = yStart; y < yEnd; y++) {
      const yc = y + 0.5;
      // long edge a->c
      const tl = (yc - ay) / dyL;
      let xl = ax + (cx - ax) * tl, il = aI + (cI - aI) * tl, sl = aS + (cS - aS) * tl, tl2 = aT + (cT - aT) * tl;
      // short edge: a->b above b, b->c below
      let xr, ir, sr, tr;
      if (yc < by) {
        const d = by - ay; const k = d > 1e-9 ? (yc - ay) / d : 0;
        xr = ax + (bx - ax) * k; ir = aI + (bI - aI) * k; sr = aS + (bS - aS) * k; tr = aT + (bT - aT) * k;
      } else {
        const d = cy - by; const k = d > 1e-9 ? (yc - by) / d : 0;
        xr = bx + (cx - bx) * k; ir = bI + (cI - bI) * k; sr = bS + (cS - bS) * k; tr = bT + (cT - bT) * k;
      }
      if (xl > xr) { let q = xl; xl = xr; xr = q; q = il; il = ir; ir = q; q = sl; sl = sr; sr = q; q = tl2; tl2 = tr; tr = q; }
      const xs = Math.max(0, Math.ceil(xl - 0.5)), xe = Math.min(SW, Math.ceil(xr - 0.5));
      if (xs >= xe) continue;
      const w = xr - xl, inv = w > 1e-9 ? 1 / w : 0, off = xs + 0.5 - xl;
      const dI = (ir - il) * inv, dS = (sr - sl) * inv, dT = (tr - tl2) * inv;
      let iz = il + dI * off, ws = sl + dS * off, wt = tl2 + dT * off;
      const row = y * SW;
      for (let x = xs; x < xe; x++, iz += dI, ws += dS, wt += dT) {
        const i = row + x;
        if (zb[i] >= iz) continue;
        const z = 1 / iz;
        let tx = (ws * z) | 0, ty = (wt * z) | 0;
        if (tx < 0) tx = 0; else if (tx >= tw) tx = tw - 1;
        if (ty < 0) ty = 0; else if (ty >= th) ty = th - 1;
        const col = tu[ty * tw + tx];
        if ((col | 0) >= 0) continue;
        let aa = alpha;
        if (cutting && iz > cutIz) { const m = cm[i]; if (m) { if (alpha === 256) { if (m === 1 || ((x + y) & 1)) continue; } else { if (m === 1) continue; aa = alpha >> 1; } } }
        if (z < nfZ1) { const t = (z - nfZ0) * nfK; if (t <= 0) continue; if (t < 256) aa = (aa * t) >> 8; }   // right at the lens: fade out
        if (aa < 256 && alpha === 256) { if (aa <= 6) continue; }
        let r = col & 255, g = (col >>> 8) & 255, bl = (col >>> 16) & 255;
        if (shade !== 256) { r = (r * shade) >> 8; g = (g * shade) >> 8; bl = (bl * shade) >> 8; }
        const zi = (z * 0.25) | 0, fw = fl[zi > 1023 ? 1023 : zi];
        if (fw) { r += ((fr - r) * fw) >> 8; g += ((fg - g) * fw) >> 8; bl += ((fbl - bl) * fw) >> 8; }
        if (aa < 256) {                                    // blended (late pass, or fading at the lens): no depth write
          const d = du[i], dr = d & 255, dg = (d >>> 8) & 255, db = (d >>> 16) & 255;
          r = dr + (((r - dr) * aa) >> 8); g = dg + (((g - dg) * aa) >> 8); bl = db + (((bl - db) * aa) >> 8);
        } else zb[i] = iz;
        du[i] = (0xff000000 | (bl << 16) | (g << 8) | r) >>> 0;
      }
    }
  }

  /**
   * Blend a convex polygon lying on the ground (pts = [[x,y] ...] map px) with a flat colour: soft shadows under buildings.
   * a = opacity 0..1, rgb = packed 0xBBGGRR. Lines stay lines under perspective, so projecting the vertices is enough.
   */
  const GX = new Float64Array(32), GY = new Float64Array(32);
  R.groundPoly = function (fb, st, pts, a, rgb) {
    const f = st.f, zNear = f * 0.1, n = pts.length;
    if (n > 30) return;
    let m = 0;
    for (let k = 0; k < n; k++) {
      const dx = pts[k][0] - st.px, dy = pts[k][1] - st.py, Z = f + dx * st.Fx + dy * st.Fy;
      if (Z < zNear) return;                                   // (shadows that reach behind the lens are simply dropped)
      const sc = f / Z;
      GX[m] = 120 + (dx * st.Rx + dy * st.Ry) * sc; GY[m] = st.hz + st.hh * sc; m++;
    }
    let y0 = 1e9, y1 = -1e9;
    for (let k = 0; k < m; k++) { if (GY[k] < y0) y0 = GY[k]; if (GY[k] > y1) y1 = GY[k]; }
    const du = fb.u32, rr = rgb & 255, gg = (rgb >>> 8) & 255, bb = (rgb >>> 16) & 255, ia = 1 - a;
    for (let y = Math.max(0, Math.ceil(y0 - 0.5)), ye = Math.min(SH, Math.ceil(y1 - 0.5)); y < ye; y++) {
      const yc = y + 0.5;
      let xl = 1e9, xr = -1e9;
      for (let k = 0; k < m; k++) {
        const k2 = k + 1 === m ? 0 : k + 1, ya = GY[k], yb = GY[k2];
        if ((yc < ya && yc < yb) || (yc >= ya && yc >= yb)) continue;
        const x = GX[k] + (yc - ya) / (yb - ya) * (GX[k2] - GX[k]);
        if (x < xl) xl = x; if (x > xr) xr = x;
      }
      for (let x = Math.max(0, Math.ceil(xl - 0.5)), xe = Math.min(SW, Math.ceil(xr - 0.5)); x < xe; x++) {
        const i = y * SW + x, p = du[i];
        du[i] = (0xff000000 | ((((p >>> 16) & 255) * ia + bb * a) << 16) | ((((p >>> 8) & 255) * ia + gg * a) << 8) | ((p & 255) * ia + rr * a)) >>> 0;
      }
    }
  };

  /**
   * Draw one textured quad. pts: [[x,y,z] x4], uv: [[s,t] x4], n: outward normal [nx,ny,nz]. o: { shade, noCull, cut }.
   * Returns true when something was submitted (for stats).
   */
  R.face = function (fb, st, tex, pts, uv, n, o) {
    const f = st.f;
    if (!(o && o.noCull)) {
      const cx = st.px - st.Fx * f, cy = st.py - st.Fy * f, ch = st.hh;
      if ((cx - pts[0][0]) * n[0] + (cy - pts[0][1]) * n[1] + (ch - pts[0][2]) * n[2] <= 0) return false;
    }
    fogTable();
    const zNear = f * 0.1;
    let nv = 0, anyIn = false;
    for (let k = 0; k < 4; k++) {
      const p = pts[k], dx = p[0] - st.px, dy = p[1] - st.py;
      CU[k] = dx * st.Rx + dy * st.Ry; CZ[k] = f + dx * st.Fx + dy * st.Fy; CH[k] = p[2]; CS[k] = uv[k][0]; CT[k] = uv[k][1];
      if (CZ[k] >= zNear) anyIn = true;
    }
    if (!anyIn) return false;
    // clip against the near plane (Sutherland-Hodgman, one plane)
    for (let k = 0; k < 4; k++) {
      const k2 = (k + 1) & 3, in1 = CZ[k] >= zNear, in2 = CZ[k2] >= zNear;
      if (in1) { QU[nv] = CU[k]; QZ[nv] = CZ[k]; QH[nv] = CH[k]; QS[nv] = CS[k]; QT[nv] = CT[k]; nv++; }
      if (in1 !== in2) {
        const t = (zNear - CZ[k]) / (CZ[k2] - CZ[k]);
        QU[nv] = CU[k] + (CU[k2] - CU[k]) * t; QZ[nv] = zNear; QH[nv] = CH[k] + (CH[k2] - CH[k]) * t; QS[nv] = CS[k] + (CS[k2] - CS[k]) * t; QT[nv] = CT[k] + (CT[k2] - CT[k]) * t;
        nv++;
      }
    }
    if (nv < 3) return false;
    // mip level from the face's projected size per texel (the denser of the two directions, so grazing walls stay crisp)
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, sMin = 1e9, sMax = -1e9, tMin = 1e9, tMax = -1e9;
    for (let k = 0; k < nv; k++) {
      const sc = f / QZ[k], sx = 120 + QU[k] * sc, sy = st.hz + (st.hh - QH[k]) * sc;
      if (sx < minX) minX = sx; if (sx > maxX) maxX = sx; if (sy < minY) minY = sy; if (sy > maxY) maxY = sy;
      if (QS[k] < sMin) sMin = QS[k]; if (QS[k] > sMax) sMax = QS[k]; if (QT[k] < tMin) tMin = QT[k]; if (QT[k] > tMax) tMax = QT[k];
    }
    if (maxX < 0 || minX > SW || maxY < 0 || minY > SH) return false;
    let tuse = tex, L = 0;
    {
      let dens = Math.max((maxX - minX) / Math.max(1, sMax - sMin), (maxY - minY) / Math.max(1, tMax - tMin));   // screen px per texel
      if (dens < 0.5) { while (dens < 0.62 && L < 4) { dens *= 2; L++; } tuse = V.mip(tex, L); }
    }
    const k2 = 1 / (1 << L), hz = st.hz, hh = st.hh;
    for (let k = 0; k < nv; k++) {
      const iz = 1 / QZ[k], sc = f * iz;
      PX[k] = 120 + QU[k] * sc; PY[k] = hz + (hh - QH[k]) * sc; PI[k] = iz; PS[k] = QS[k] * k2 * iz; PT[k] = QT[k] * k2 * iz;
    }
    const shade = o && o.shade !== undefined ? o.shade : 256, cutting = !(o && o.cut === false) && V.cut.on;
    const alpha = o && o.alpha !== undefined ? o.alpha : 256;
    if (alpha <= 6) return false;
    for (let k = 1; k + 1 < nv; k++) tri(fb, tuse, 0, k, k + 1, shade, cutting, alpha);
    return true;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
