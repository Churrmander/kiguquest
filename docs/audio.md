# Audio — `NP.audio` (owner: Composer)

Files: `src/audio/notation.js` (parser/compiler/validator/DSL), `sfx.js`, `songs_*.js` (data), `engine.js` (WebAudio playback).
Tools: `node tools/audio-check.mjs` (validate all songs), `node tools/audio-render.mjs [--loops N] [--out DIR] [ids|cry:<species>]` (stereo WAV to `.preview/audio/`;
loudness printed is mono-equivalent BS.1770, i.e. comparable with the older mono renders). `tools/audio-synth.mjs` mirrors the engine's voices, filters, panning and reverb.
The browser shell (`src/platform/browser.js`) must call **`NP.audio.init()` from the first user gesture** (keydown/pointerdown); until then
everything is tracked but silent (`playSong` remembers the song and starts it on `init`).

## API
`init() -> bool`, `playSong(id,{fadeMs,restart})`, `stopSong(fadeMs)`, `pauseSong()`, `resumeSong()`, `current()`, `playJingle(id,onDone)`
(music stops, jingle plays, music resumes where it was; with no AudioContext `onDone` fires immediately), `sfx(id)`, `cry(speciesId)`,
`setVolume({music,sfx})`, `getVolume()`, `songs()` (looping songs), `jingles()`, `sfxs()`, `info(id) -> {kind:'song'|'jingle'|'sfx', seconds, loops}`,
`compile(id)` (timed events), `validate(id)` (problem list), `hasContext()`. Data: `NP.data.songs[id]`, `NP.data.sfx[id]`.
`NP.snd` (engine/sound.js) calls `sfx, cry, playSong, stopSong, playJingle, pauseSong, resumeSong` — all implemented with those signatures.

## Sound engine (DS-style)
Every music note goes through an instrument **patch** (`NP.audio.notation.PATCHES`): layers of WebAudio primitives (band-limited
oscillators, optional per-voice lowpass with a cutoff sweep, filtered noise), an ADSR envelope with release, delayed vibrato, a stereo
pan and a send to a shared reverb (a ConvolverNode with a generated impulse, `reverbIR`; mirrored by FFT convolution in the renderer).
There is no fixed channel count: a song names as many channels as it needs.

| patch | sound | typical use |
|---|---|---|
| `flute` | sine + soft 2nd harmonic + breath noise, delayed vibrato | gentle leads (oct 4-5) |
| `warm` | detuned saw + square through a key-tracked lowpass | upbeat leads |
| `reed` | lowpassed 25% pulse + sine | clarinet / musette / countermelody |
| `brass` | two saws with a filter that opens on the attack | battle leads, stabs |
| `strings`, `stac`, `pad` | detuned saws (wide stereo), slow swell / staccato / soft bed | chords, ostinati |
| `piano`, `epiano`, `marimba`, `glock` | decaying partials | accompaniment, sparing sparkle |
| `harp`, `guitar`, `pizz` | plucked, cutoff closes as it decays | arpeggios, strums |
| `ebass`, `synbass` | sine + lowpassed saw / square | bass lines (oct 1-3) |
| `kit` | drums (below) | percussion |
| `lead`, `ep`, `bass` | softened legacy voices | what old `p1`, `p2`, `tri` map onto |

**Old songs** (`p1/p2/tri/noi`) still work unchanged: `p1`→`lead` (lowpassed pulse, soft attack, vibrato), `p2`→`ep` (soft pluck, panned
left), `tri`→`bass`, `noi`→`kit`. If a legacy `p1` mostly sits at/above G#5 it is dropped an octave (and `p2` with it when needed);
`inst.p1.tr` / `inst.p2.tr` override that (`compile(id).lift` shows what was applied).

## Song format
```js
NP.audio.song('id', {
  bpm: 92, bar: 16,          // bar = steps per bar; 1 step = a 16th note (bar 12 = 3/4 waltz, 8 = short jingle bars)
  swing: 0.04,               // optional, delays odd steps by swing*step
  gain: 0.9,                 // optional whole-song trim (0..2)
  inst: {                    // channel name -> instrument; any names you like
    mel:  { patch: 'flute', vol: 11, tr: -12 },        // tr = transpose semitones
    keys: { patch: 'piano', vol: 7, pan: -0.25 },      // pan -1..1 (default: the patch's), rev 0..1 reverb send
    harp: { patch: 'harp', vol: 7, arp: 2 },
    bass: { patch: 'ebass', vol: 11 }, drm: { patch: 'kit', vol: 8 },
  },
  vars: { rd: { mel: { patch: 'reed' } }, hi: { mel: { tr: 0 } } },   // variations: per-channel inst overrides for one pass
  loop: 1,                   // index into `order` where the loop restarts (-1 + kind:'jingle' = one-shot)
  order: 'I A A/rd B C A/hi B',   // 'A/rd' = section A played with variation rd
  sections: { I:{…}, A:{ mel:'…', keys:'…', bass:'…', drm:'…' }, … },
});
```
A section may leave channels out (they rest), which is how breakdowns and instrument changes between sections are written. Every track in a
section must have the same number of steps, and bars are separated by `|` (the validator checks each bar boundary). `inst` fields: `patch`,
`vol` 0..15, `pan`, `rev`, `tr`, `env` hold|pluck|decay|swell (bends the patch envelope), `gate` note length fraction, `arp` steps per
arpeggio note (default 1), `duty` 0..3 (pulse patches), `mute` (useful in `vars`).
Legacy channels: `p1` lead, `p2` second voice, `tri` bass, `noi` drums (each section must then have all four).
The validator keeps DS-style songs gentle at the top: per-patch note ranges, nothing above E6, no held notes above C6.

### Track text
Whitespace-separated tokens:
| token | meaning |
|---|---|
| `c5` `f#4` `bb3` `:N` | note (name, optional `#`/`b`, octave; c4 = middle C) and `:N` length in steps — **length is sticky** (default 2 at track start) |
| `c4+e4+g4:8` | notes struck together |
| `r` `r:4` | rest |
| `^Am4:16` | arpeggio of a chord for N steps: root,3rd,5th,octave (7th chords: root,3,5,7) cycling every `arp` steps. Chords: `C Cm C7 Cm7 Cmaj7 Csus Cdim Cadd9`, root octave digit after |
| `=Am3:16` | block chord (all tones held; triads without the octave) |
| `[ … ]x3` | repeat (nestable) |
| `\|` | bar line (checked) |
| `%d2` `%v8` `%ep` `%iflute` | change duty / volume (0-15) / envelope (h,p,d,s) / instrument patch from here on |
| drum track | `k` kick, `s` snare, `h` hat, `o` open hat, `x` crash, `t` tom, `m` timpani, `p` low timpani, `w` wood block, `a` anvil, `g` shaker, `c` clap, `i` rim, `y` cymbal swell, `j` tambourine, `e` triangle; combine `kh`; `:N` length, `r` rest |
Helpers for authors (`NP.audio.dsl`): `arp(['C','Am','F,G'], 4)` builds per-bar arpeggios (a comma splits a bar), `bass(chords, '1:4 5:4 8:4 5:4', 2)` builds a bass
line from chord degrees `1 3 4 5 7 8` (+`r`), `block(chords, 3)` held block chords, `stab(chords, 'X:2 r:2 X:4 r:8', 3)` chord hits,
`weave(chords, 3, [0,1,2,1], 16, 2)` broken chords, `comp`, `tr`, `dtr`, `rep(str,n)`.

## Voice primitives (`notation.voices(event)`, shared by engine and renderer)
`{k:'osc', wave:'pulse'|'square'|'sawtooth'|'triangle'|'sine', duty, f, f2, vib, dur, amp, env, lp?, lp2?, lpt?, q?, pan?, rev?}` and
`{k:'noise', filt:'lp'|'hp'|'bp', fc, fc2, q, dur, amp, env, pan?, rev?}`. `lp` = lowpass cutoff Hz (sweeps exponentially to `lp2` over `lpt`
seconds, Q in dB, default -3); `pan` -1..1 (equal-power, +3 dB so a centred voice is as loud as an unpanned one); `rev` = reverb send.
`env` is a name (hold|pluck|decay|swell) or `{a,d,s,s2,r}`. Events without a patch (SFX, cries) use the legacy voices: `ch` `p1`/`p2`
(pulse), `tri`, `sin`, `saw`, `sq`, `noi` (`d:'n'` noise, optional `filt`, `q`), and may carry `lp`/`lp2`/`lpt`/`q`, `pan`, `rev`.

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

## Attack sounds
`src/game/battlefx.js` picks sounds by move type: physical moves swing with `SWING_SFX[type]` (`punch`, `slash`, `whip`, `heavy`, else `swing`), special moves cast
with `CAST_SFX[type]` (every type has one; `cast_<type>` for the ones without an older elemental sfx), and every hit plays `hit`/`hit_super`/`hit_weak` plus the
type's own impact layer `imp_<type>`. `engine.js` gives battle sounds (`hit*`, `imp_*`, `cast_*`, swings, `shake`) a random ±4 % pitch wobble per play.

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
DS-style arrangements so far: home_town, route_meadow, town_thimble, battle_wild (the rest are legacy and play through the softened patches).
Songs: title, intro, home_town, route_meadow, town_thimble, tea_house, battle_wild, battle_tailor, battle_master, battle_rival, battle_society,
forest_gingham, city_seamstead, society_theme, cave, sad, credits (all P1), plus P2: battle_legend, battle_admin, battle_needle, battle_grand, league,
hall_of_fame, ending. Jingles: all 13 in BIBLE §8. SFX: all 39 ids. Not yet written: battle_damask, city_b…city_h, route_b….
All compositions are original.
