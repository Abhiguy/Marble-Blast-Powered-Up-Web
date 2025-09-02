import { AudioSource } from "../audio";
import { Shape } from "../shape";
import { Level } from "../level";
import { MissionElement } from "../parsing/mis_parser";

/** The TV! */
export class Television extends Shape {
	dtsPath = "shapes/tv/television.dts";
	sounds = ["movieaudio.wav"];
	soundSource: AudioSource;
	collideable = false;

	override async init(level?: Level, srcElement?: MissionElement): Promise<void> {
        await super.init(level, srcElement);
        let iflSeq = this.dts.sequences.find((seq) => seq.iflMatters[0] > 0);
        iflSeq.duration = 14.8;
    }

	async onLevelStart() {
		// Load and play looping audio
		this.soundSource = this.level.audio.createAudioSource(this.sounds[0], undefined, this.worldPosition);
		this.soundSource.gainFactor = 2;
	    this.soundSource.maxDistance = 100;
		this.soundSource.setLoop(true);
		this.soundSource.play();
		await this.soundSource.promise;
	}
}

