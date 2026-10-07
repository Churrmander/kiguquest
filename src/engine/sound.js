/* NP.snd — thin, always-safe wrappers around NP.audio (which is built separately and may be absent/headless).
 * Game code calls NP.snd.sfx('cursor') etc. and never has to check whether audio exists. Also keeps a record of
 * what was requested so headless tests can assert on it (NP.snd.log).
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});

  const snd = {
    log: [],
    logging: false,
    song: null,
    _rec(kind, id) {
      if (this.logging) this.log.push(kind + ':' + id);
    },
    sfx(id) {
      this._rec('sfx', id);
      try { if (NP.audio && NP.audio.sfx) NP.audio.sfx(id); } catch (e) { /* audio must never break the game */ }
    },
    cry(id) {
      this._rec('cry', id);
      try { if (NP.audio && NP.audio.cry) NP.audio.cry(id); } catch (e) { /* */ }
    },
    play(id, opts) {
      this._rec('song', id);
      this.song = id;
      try { if (NP.audio && NP.audio.playSong) NP.audio.playSong(id, opts); } catch (e) { /* */ }
    },
    stop(fadeMs) {
      this._rec('stop', '');
      this.song = null;
      try { if (NP.audio && NP.audio.stopSong) NP.audio.stopSong(fadeMs); } catch (e) { /* */ }
    },
    jingle(id, done) {
      this._rec('jingle', id);
      let called = false;
      const fin = () => { if (!called) { called = true; if (done) done(); } };
      try {
        if (NP.audio && NP.audio.playJingle) NP.audio.playJingle(id, fin);
        else fin();
      } catch (e) { fin(); }
    },
    pause() { try { if (NP.audio && NP.audio.pauseSong) NP.audio.pauseSong(); } catch (e) { /* */ } },
    resume() { try { if (NP.audio && NP.audio.resumeSong) NP.audio.resumeSong(); } catch (e) { /* */ } },
  };

  NP.snd = snd;
})(typeof globalThis !== 'undefined' ? globalThis : window);
