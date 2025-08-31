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
	musicPad1 = false;
	musicPad2 = false;
	musicPad3 = false;
	musicPad4 = false;
	musicPad5 = false;
	canUse = true;

	constructor(el: MissionElementStaticShape) {
		super();

		this.musicPad1 = el._name === "MusicPad1";
		this.musicPad2 = el._name === "MusicPad2";
		this.musicPad3 = el._name === "MusicPad3";
		this.musicPad4 = el._name === "MusicPad4";
		this.musicPad5 = el._name === "MusicPad5";
	}

	onMarbleContact(collision: Collision) {
		if (!collision || !this.canUse) return;

        let padIndex = 0;

        // Touching Each Pad will Pop a Sound and a index is noted.
	    if (this.musicPad1) {
		    this.level.audio.play(this.sounds[0]);
		    padIndex = 1;
	    }

	    if (this.musicPad2) {
		    this.level.audio.play(this.sounds[1]);
		    padIndex = 2;
	    }
		 
	    if (this.musicPad3) {
		    this.level.audio.play(this.sounds[2]);
		    padIndex = 3;
	    }

	    if (this.musicPad4) {
		    this.level.audio.play(this.sounds[3]);
		    padIndex = 4;
	    }

	    if (this.musicPad5) {
		    this.level.audio.play(this.sounds[4]);
		    padIndex = 5;
	    }

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
