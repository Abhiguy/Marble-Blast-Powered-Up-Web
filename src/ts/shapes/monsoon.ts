import { AudioSource } from "../audio";
import { Shape } from "../shape";

/** Rain sound emitter. */
export class Monsoon extends Shape {
	dtsPath = "shapes/colmesh.dts";
	sounds = ["rain.wav"];
	collideable = false;
	soundSource: AudioSource;


	async onLevelStart() {
		this.soundSource = this.level.audio.createAudioSource(this.sounds[0], undefined, this.worldPosition);
		this.soundSource.gainFactor = 2;
		this.soundSource.maxDistance = 100;
		this.soundSource.setLoop(true);
		this.soundSource.play();
		await this.soundSource.promise;
	}
}