# Kigu Quest — notes for Claude

Read `.claudeignore.md` first and follow it: stay inside this folder and skip the paths it lists.

* Plain JS, no build step, no dependencies. Every file is an IIFE on the global `NP` (see `docs/DESIGN.md`).
* Run tests with `node tests/run.mjs`. After adding or removing a script, edit `src/<area>/files.json` and run
  `node tools/build-index.mjs` (never hand-edit `index.html`).
* Art is generated in code. Preview it with the `tools/preview-*.mjs` scripts and look at the PNGs before committing.
* Visual target: Pokémon Black/White (DS, 5th generation) style only. All designs, names, music and text stay original.
