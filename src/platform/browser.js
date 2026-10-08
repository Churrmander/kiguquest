/* Browser shell — the ONLY file that touches the DOM. Blits NP.Game's 240x160 framebuffer to the canvas, maps the keyboard to
 * NP.Input, unlocks the AudioContext on the first gesture and runs the fixed 60 Hz game loop. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const canvas = document.getElementById('screen');
  if (!canvas || !NP || !NP.Game) { console.error('browser.js: missing canvas or NP.Game'); return; }
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;
  const img = ctx.createImageData(240, 160);

  // ---- sizing: integer scale that fits the window
  function fit() {
    const s = Math.max(1, Math.floor(Math.min(root.innerWidth / 240, (root.innerHeight - 44) / 160)));
    canvas.style.width = 240 * s + 'px';
    canvas.style.height = 160 * s + 'px';
  }
  root.addEventListener('resize', fit);
  fit();

  // ---- input
  const KEYS = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    KeyZ: 'a', KeyX: 'b', Enter: 'start', Backspace: 'select', ShiftRight: 'select', KeyA: 'l', KeyS: 'r',
    Space: 'a', Escape: 'b',
  };
  let unlocked = false;
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    try { if (NP.audio && NP.audio.init) NP.audio.init(); } catch (e) { console.warn('audio init failed', e); }
  }
  root.addEventListener('keydown', (e) => {
    unlock();
    if (e.code === 'KeyM' && !e.repeat) { muted = !muted; try { NP.audio && NP.audio.setVolume && NP.audio.setVolume({ music: muted ? 0 : 0.55, sfx: muted ? 0 : 0.55 }); } catch (x) { /* */ } return; }
    if (e.code === 'KeyF' && !e.repeat) { if (document.fullscreenElement) document.exitFullscreen(); else canvas.requestFullscreen && canvas.requestFullscreen(); return; }
    if (e.code === 'KeyV' && !e.repeat) { if (NP.view3d) NP.view3d.toggle(); return; }
    const b = KEYS[e.code];
    if (!b) return;
    e.preventDefault();
    NP.Input.set(b, true);
  });
  root.addEventListener('keyup', (e) => {
    const b = KEYS[e.code];
    if (!b) return;
    e.preventDefault();
    NP.Input.set(b, false);
  });
  root.addEventListener('pointerdown', unlock);
  root.addEventListener('blur', () => NP.Input.reset());
  let muted = false;
  try { if (NP.art && NP.art.human && NP.art.human.hd && /[?&]hd\b/.test(root.location.search)) NP.art.human.hd.enabled = true; } catch (e) { /* */ }

  // ---- loop
  let last = performance.now(), acc = 0;
  const STEP = 1000 / 60;
  const seenErrors = {};
  function frame(now) {
    acc += Math.min(200, now - last);
    last = now;
    let steps = 0;
    while (acc >= STEP && steps < 6) {
      acc -= STEP;
      steps++;
      try { NP.Game.tick(); } catch (err) {
        const k = String(err && err.message);
        if (!seenErrors[k]) { seenErrors[k] = 1; console.error('tick error:', err); }
      }
    }
    if (steps > 0 || true) {
      let fb;
      try { fb = NP.Game.render(); } catch (err) {
        const k = 'render ' + String(err && err.message);
        if (!seenErrors[k]) { seenErrors[k] = 1; console.error('render error:', err); }
        fb = NP.Game.fb;
      }
      img.data.set(fb.data);
      ctx.putImageData(img, 0, 0);
    }
    root.requestAnimationFrame(frame);
  }

  // ---- go
  try {
    const q = new URLSearchParams(root.location.search);
    NP.boot();
    if (q.has('quick')) NP.quickStart(q.get('name') || 'Ren', q.get('gender') || 'm');
  } catch (err) { console.error('boot error:', err); }
  root.NPDebug = { NP, game: NP.Game };
  root.requestAnimationFrame(frame);
})(window);
