# Marble Blast Powered Up Web
This project is a clean-room web port of the 3D platformer game Marble Blast Powered Up, implemented in TypeScript.

Play it here: https://marbleblast.vaniverse.io/<br>
TAS Rewind version here: https://github.com/RandomityGuy/MBG-Web-Rewind

## Features
This Game is a Mod of the Original Game Marble Blast Gold. It includes almost 4000 community levels, including 150 original MBPU levels (25 Beginner, 30 Intermediate, 70 Advanced and 25 Sandbox ) and more than 3900 community custom levels. It implements all gameplay elements, sounds, music and UI/menu components from both Marble Blast Powered Up - additional features include a replay system and online leaderboards. The game can be played using a keyboard, mouse, gamepad or on your mobile device.


## Screenshots
<img src="./screenshots/toroidal.png" width="640">
<img src="./screenshots/chamber.png" width="640">
<img src="./screenshots/orbiting.png" width="640">
<img src="./screenshots/mobile.png" width="640">
<img src="./screenshots/angular.png" width="640">
<img src="./screenshots/simulacrum.png" width="640">
<img src="./screenshots/last.png" width="640">
<img src="./screenshots/kaiten.png" width="640">
<img src="./screenshots/simplycomplex.png" width="640">
<img src="./screenshots/ocean.png" width="640">
<img src="./screenshots/audio.png" width="640">

## Technical overview
The game is fully implemented in TypeScript and utilizes its own custom rendering and physics engine. Its levels and assets weren't rebuilt from scratch; instead, they are read and imported from .dif, .dts and .mis files used internally by the Torque 3D Engine, on which the original game runs. All the game's internal logic was implemented from scratch, however. The physics simulation runs at a fixed rate of 120 Hz and utilizes continuous collision detection. but there are still slight differences in the physics, because of which times in this game shouldn't be compared to those in the original. The UIs are all implemented in plain HTML and CSS, and local persistence for settings, scores and replays is provided by IndexedDB. The game also features a state-based replay system which guarantees deterministic playback - replays are compressed using [pako](https://github.com/nodeca/pako) and stored locally. Custom levels are supplied by [Marbleland](https://github.com/Vanilagy/Marbleland) and are cached on the server. The backend itself is implemented using Node.js and mostly handles resource loading and leaderboard updates. An SQLite database is used to store online scores. The built-in video renderer is implemented using the WebCodecs API and [my own multiplexing library](https://github.com/Vanilagy/webm-muxer).

## Building and developing
If you wish to build the game yourself, simply clone the repository, then run `npm install --legacy-peer-deps` and `npm run compile`, which will compile the TypeScript code using [rollup](https://rollupjs.org/guide/en/). Then run `npm start` to start up the server (runs on :8080 by default). If you want to configure the port and other server options, modify `server/data/config.json`. For fast development run `npm run watch-fast` (or `npm run watch` for a slower, but typechecked version). If you wish to bundle the project, run `npm run bundle`, which uses [Sarcina](https://github.com/Vanilagy/Sarcina) and writes to `dist/`.

**Note:** This project has a dependency that requires `node-gyp`. Install `node-gyp` _before_ running `npm install` on this project with `npm install -g node-gyp`, and if you're on Windows, make sure to run `npm install --global --production windows-build-tools` right afterwards in an _elevated command prompt_ (one with admin rights) to handle the annoying installation stuff.

## Notes
The current version only runs on the newest versions of Chromium-based browsers, Firefox and Safari, both on desktop and on mobile. Android support should be top-notch, and Safari is as best as it can be given Apple's restrictive PWA features on iOS. Older versions of this project utilized [three.js](https://github.com/mrdoob/three.js/) for rendering and [OimoPhysics](https://github.com/saharan/OimoPhysics) for physics - without them, this project wouldn't even exist. Additional thanks to the maintainers of [pako](https://github.com/nodeca/pako) and [jszip](https://github.com/Stuk/jszip) for making other parts of this project possible, as well as to [Vanilagy](https://github.com/Vanilagy), [RandomityGuy](https://github.com/RandomityGuy) for helping me out with parts of the code, and to the entire Marble Blast community for their feedback and support. I highly recommend you check out GarageGames's original version of Marble Blast Powered Up, as well as the game's community, here: https://marbleblast.com/
