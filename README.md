# Factory Defense S1.9

[Play online](https://yenchen-c.github.io/Factory_FPS/)

Download `Factory_Defense_S1.9.html` and open it directly, or play through GitHub Pages. No Python is needed to play. Background music uses the requested YouTube embed and needs an internet connection; click **啟用背景音樂** and, if necessary, the video play button. Offline sound effects use Web Audio.

## S1.9 changes

- Added distinct synthesized weapon fire, grenade explosions and flashbang sounds, with volume/mute controls and distance attenuation.
- Flashbangs clear pursuit memory and routes. Blinded enemies ignore sounds and must reacquire the player after recovering.
- Doors have 300 HP, matching walls. Gunfire, melee, shockwaves and explosions can destroy them. Broken doors no longer render, block movement/projectiles, or offer interaction. Door damage persists between waves and resets with a new game.
- English release filename; `index.html` points to the latest version. S1.8 remains in Git history.

## Build and verify

Run `python build.py` to produce the standalone release and update the homepage. The build uses only Python's standard library; all game code and Three.js are bundled into the output. Run each `test*.cjs` with Node.js to verify gameplay logic. Tests use a mocked renderer, so they do not measure GPU performance or subjective sound quality.

See `VERSION_CONTROL.md` for the version-control workflow. Keep changes in `src/`, rebuild, run checks, and commit source plus release together.
