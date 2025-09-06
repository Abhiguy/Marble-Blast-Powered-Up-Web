import { Shape } from "../shape";
import { AudioSource } from "../audio";
import { MissionElementStaticShape } from "../parsing/mis_parser";
import { Collision } from "../physics/collision";

/** The Music Pad which on contact an audio is heard! */
export class MusicPad extends Shape {
	dtsPath = "shapes/musicpad/startarea.dts";
	collideable = true;
	sounds = ["1.wav", "2.wav", "3.wav", "4.wav", "5.wav"];
	soundSource: AudioSource;
	padIndex = -1;
	canUse = true;

	constructor(el: MissionElementStaticShape) {
		super();

		switch (el._name) {
			case "MusicPad1":
				this.padIndex = 1;
				break;
			case "MusicPad2":
				this.padIndex = 2;
				break;
			case "MusicPad3":
				this.padIndex = 3;
				break;
			case "MusicPad4":
				this.padIndex = 4;
				break;
			case "MusicPad5":
				this.padIndex = 5;
				break;
		}
	}

	onMarbleContact(collision: Collision) {
		if (!collision || !this.canUse) return;

		let padIndex = 0;

		// Touching Each Pad will Pop a Sound and a index is noted.

		this.level.audio.play(this.sounds[this.padIndex - 1]);
		padIndex = this.padIndex;

		// Add pad index to sequence
		this.level.musicCodeSequence.push(padIndex);

		// Clamp the length to max 5 inputs
		if (this.level.musicCodeSequence.length > 5) {
			this.level.musicCodeSequence.shift();
		}

		// Check if the correct code is triggered when touching the pads...
		if (!this.level.crackedMusicCode && this.level.musicCodeSequence.length === 5) {
			let isCorrect = this.level.musicCodeSequence.every((val, index) =>
				val === this.level.correctMusicCode[index]
			);

			if (isCorrect) {
				this.level.crackedMusicCode = true;
			}
		}

		this.canUse = false; // Block further triggers until reset

		// Reset after 1 second
		setTimeout(() => {
			this.canUse = true;
		}, 1000);
	}
}
