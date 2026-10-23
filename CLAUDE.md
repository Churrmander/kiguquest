# Kigu Quest — notes for Claude

Read `.claudeignore.md` first and follow it: stay inside this folder and skip the paths it lists.

* Plain JS, no build step, no dependencies. Every file is an IIFE on the global `NP` (see `docs/DESIGN.md`).
* Run tests with `node tests/run.mjs`. After adding or removing a script, edit `src/<area>/files.json` and run
  `node tools/build-index.mjs` (never hand-edit `index.html`).
* Art is generated in code. Preview it with the `tools/preview-*.mjs` scripts and look at the PNGs before committing.
* Visual target: Pokémon Black/White (DS, 5th generation) style only. All designs, names, music and text stay original.
* **Art gate (owner's rule):** every art sample must be scored by the `art-critic` agent (`.claude/agents/art-critic.md`)
  against the owner's references in `.preview/reference/` before the owner sees it. Show the owner only work that scores
  **8/10 or higher**. Below that, hand the critic's fix list back to the artist and iterate. Tell the owner the score.
