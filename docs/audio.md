# Audio — `NP.audio` (owner: Composer)

Files: `src/audio/notation.js` (parser/compiler/validator/DSL), `sfx.js`, `songs_*.js` (data), `engine.js` (WebAudio playback).
Tools: `node tools/audio-check.mjs` (validate all songs), `node tools/audio-render.mjs [ids|cry:<species>]` (WAV to `.preview/audio/`).
The browser shell (`src/platform/browser.js`) must call **`NP.audio.init()` from the first user gesture** (keydown/pointerdown); until then
everything is tracked but silent (`playSong` remembers the song and starts it on `init`).

## API
`init() -> bool`, `playSong(id,{fadeMs,restart})`, `stopSong(fadeMs)`, `pauseSong()`, `resumeSong()`, `current()`, `playJingle(id,onDone)`
(music stops, jingle plays, music resumes where it was; with no AudioContext `onDone` fires immediately), `sfx(id)`, `cry(speciesId)`,
`setVolume({music,sfx})`, `getVolume()`, `songs()` (looping songs), `jingles()`, `sfxs()`, `info(id) -> {kind:'song'|'jingle'|'sfx', seconds, loops}`,
`compile(id)` (timed events), `validate(id)` (problem list), `hasContext()`. Data: `NP.data.songs[id]`, `NP.data.sfx[id]`.
`NP.snd` (engine/sound.js) calls `sfx, cry, playSong, stopSong, playJingle, pauseSong, resumeSong` — all implemented with those signatures.

## Song format
```js
NP.audio.song('id', {
  bpm: 92, bar: 16,          // bar = steps per bar; 1 step = a 16th note (bar 12 = 3/4 waltz, 8 = short jingle bars)
  swing: 0.04,               // optional, delays odd steps by swing*step
  inst: { p1:{duty:2, vol:11, env:'pluck'}, p2:{duty:1, vol:5, arp:2}, tri:{vol:12}, noi:{vol:4} },
  loop: 0,                   // index into `order` where the loop restarts (-1 + kind:'jingle' = one-shot)
  order: 'A A2 B A',         // section names, played in this order
  sections: { A:{p1:'…', p2:'…', tri:'…', noi:'…'}, … },
});
```
Channels: `p1` lead pulse, `p2` second pulse (arpeggios/harmony), `tri` triangle bass, `noi` noise drums. Every track of a section must have the same
number of steps, and bars are separated by `|` (the validator checks each bar boundary). `inst` fields: `duty` 0..3 = 12.5/25/50/75 %,
`vol` 0..15, `env` hold|pluck|decay|swell, `gate` note length fraction, `arp` steps per arpeggio note (default 1).

### Track text
Whitespace-separated tokens:
| token | meaning |
|---|---|
| `c5` `f#4` `bb3` `:N` | note (name, optional `#`/`b`, octave; c4 = middle C) and `:N` length in steps — **length is sticky** (default 2 at track start) |
| `r` `r:4` | rest |
| `^Am4:16` | arpeggio of a chord for N steps: root,3rd,5th,octave (7th chords: root,3,5,7) cycling every `arp` steps. Chords: `C Cm C7 Cm7 Cmaj7 Csus Cdim Cadd9`, root octave digit after |
| `[ … ]x3` | repeat (nestable) |
| `\|` | bar line (checked) |
| `%d2` `%v8` `%ep` | change duty / volume (0-15) / envelope (h,p,d,s) from here on |
| noise track | `k` kick, `s` snare, `h` hat, `o` open hat, `x` crash, `t` tom; combine `kh`; `:N` length, `r` rest |
Helpers for authors (`NP.audio.dsl`): `arp(['C','Am','F,G'], 4)` builds per-bar arpeggios (a comma splits a bar), `bass(chords, '1:4 5:4 8:4 5:4', 2)` builds a bass
line from chord degrees `1 3 4 5 7 8` (+`r`), `rep(str,n)`.

## SFX format
`NP.data.sfx[id] = 'wave freq[>freq2] dur [vol] [@start] [e<h|p|d|s>] [v<depth>]; …'`. Waves: `p0..p3` pulse, `t` triangle, `s` sine, `n` noise
(freq = band-pass centre, sweeps to freq2). Segments play one after another unless given `@seconds`. `v` adds vibrato. Example: `'p2 988 0.045 0.4; p2 1480 0.08 0.4 ed'`.

## Cries
`cry(id)` hashes the species id (FNV) to choose base pitch (~190-1000 Hz), one of six contours (rising, falling, arch, chirps, growl, warble), duty and length
(0.2-0.42 s). Deterministic; accepts a string/number id or an object with `.id`.

## Content
Songs: title, intro, home_town, route_meadow, town_thimble, tea_house, battle_wild, battle_tailor, battle_master, battle_rival, battle_society,
forest_gingham, city_seamstead, society_theme, cave, sad, credits (all P1), plus P2: battle_legend, battle_admin, battle_needle, battle_grand, league,
hall_of_fame, ending. Jingles: all 13 in BIBLE §8. SFX: all 39 ids. Not yet written: battle_damask, city_b…city_h, route_b….
All compositions are original.
