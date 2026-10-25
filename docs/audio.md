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
`NP.data.sfx[id] = 'wave freq[>freq2] dur [vol] [@start] [fields…]; …'`. Segments play one after another unless given `@seconds`.
Waves: `t` triangle, `s` sine, `p0..p3` pulse (12.5/25/50/75 %), `n` band-pass noise (freq = centre, sweeps to freq2), `nl` / `nh` low-/high-pass
noise (freq = cutoff), `w` sawtooth, `q` square. Fields:
| field | meaning |
|---|---|
| `0.4` | volume 0..1 (default 0.5) |
| `@0.12` | start time in seconds (default: right after the previous segment) |
| `ep` `ed` `es` `eh` | envelope pluck / decay / swell / hold (noise defaults to decay) |
| `v6` `v6/14` | vibrato depth in Hz, optional rate (default 9 Hz) |
| `d8` | detuned double: adds a copy 8 cents higher, both at 0.65 x vol (width, chorus) |
| `o` `o0.4` | sub-octave layer: triangle (sine for `s`) an octave down at 0.6 (or the given) x vol; skipped below 50 Hz |
| `~0.07` `~0.07x3` | echo: 2 (or n) repeats every 0.07 s at 0.38^k x vol; does not move the next segment's start |
| `lp1500` `lp2000>600` | osc lowpass cutoff (sweeping), event fields `lp` / `lp2` |
| `P-0.4` `R0.3` | pan -1..1, reverb send 0..1 (event fields `pan` / `rev`) |

`lp`, `pan`, `rev`, `nl`/`nh` (event `filt`) and `w`/`q` (channels `saw`/`sq`) are passed on to `voices()` and need the DS engine. Older engines ignore
the extra fields and play `nl`/`nh` as band-pass noise, so every SFX must sound right without them; don't use `w`/`q` until the engine has them.
Unknown fields are reported by `parseSfx(...).errors`. Example: `'t 784 0.04 0.4 ep d8; t 1175 0.1 0.4 ed d8 ~0.07x1'`.

SFX style (DS era): put the body on triangle or sine (with `d` for width), and use pulse only as a quiet 50 % edge with `lp`. Make thumps from falling sines
(`s 150>50 … ed`) plus a mid-range noise crack. Keep noise mostly under ~2.5 kHz, use a short `~` echo on chimes, and keep everything 50 Hz to 12 kHz,
under 1.5 s and vol <= 1. Loudness ladder (render-tool LUFS): text ~-45, cursor ~-39, menu ~-31, chimes ~-27, hits -32 (weak) / -26 / -23 (super),
cries ~-20.

## Cries
`cry(id)` "speaks" the species' sound-word (`NP.data.species[id].cry`, e.g. `Kon!`, `Piiraa!`) split into up to 3 syllables:
* The vowel sets a formant band, used for the breath noise and the `lp` cutoff (a 1050, e 1500, i 1900, o 720, u 520 Hz).
* The onset shapes the attack: a plosive adds a noise click and a pitch scoop, m/n add a swell, l/r/w/y add a glide in, s/f/h/z add a hiss, and z adds a buzz.
* The coda shapes the release: n/m end in a hum tail, k/t/p in a click, s/f in a hiss.
* Long vowels (`ii`) and the last syllable are drawn out. A word without vowels (`Bzz`) is a buzz.
* The evolution `family` hash picks the timbre (pulse plus detuned triangle, soft triangle/sine, or pulse plus sub-octave), duty, detune, formant shift and
  pitch region (~210-535 Hz). `stage` lowers the pitch (x0.8, x0.66), lowers the formants and slows the voice. So an evolution line sounds related.
* The species id hash picks one of 8 word-level contours (rising, falling, arch, chirpy, growl, warble, yip-call, coo) and a small pitch/speed jitter.
  A trailing `!` falls at the end, `?` rises and `~` warbles.

Ids without species data (numbers, test ids) get a pseudo-word from the hash. Cries are deterministic, 0.2-0.55 s long, at most 2.5 kHz per event. They take
a string/number id or an object with `.id`. `tools/audio-render.mjs cry:<id>` loads the species table so it renders the real word.

## Content
Songs: title, intro, home_town, route_meadow, town_thimble, tea_house, battle_wild, battle_tailor, battle_master, battle_rival, battle_society,
forest_gingham, city_seamstead, society_theme, cave, sad, credits (all P1), plus P2: battle_legend, battle_admin, battle_needle, battle_grand, league,
hall_of_fame, ending. Jingles: all 13 in BIBLE §8. SFX: all 39 ids. Not yet written: battle_damask, city_b…city_h, route_b….
All compositions are original.
