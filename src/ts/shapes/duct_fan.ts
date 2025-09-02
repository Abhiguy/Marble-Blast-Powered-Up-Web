import { ForceShape } from "./force_shape";
import { AudioSource } from "../audio";
import { TimeState } from "../level";

/** Blows the marble away. */
export class DuctFan extends ForceShape {
	dtsPath = "shapes/hazards/ductfan.dts";
	sounds = ["fan_loop.wav"];
	soundSource: AudioSource;

	constructor() {
		super();

		this.addConicForce(10, 2.617, 40);
	}

	async onLevelStart() {
		this.soundSource = this.level.audio.createAudioSource(this.sounds[0], undefined, this.worldPosition);
		this.soundSource.setLoop(true);
		this.soundSource.play();
		await this.soundSource.promise;
	}

	tick(time: TimeState, onlyVisual = false) {
		// Mute the ductfan if stopwatch is active
		if (this.level.stopWatchActive) {
			this.soundSource?.stop();
		}
		else {
			this.soundSource?.play();
		}
		// Freeze ductfan completely if stopwatch is active
		if (this.level.stopWatchActive) return;
		super.tick(time, onlyVisual);
	}
}