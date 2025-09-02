import { PowerUp } from "./power_up";
import { state } from "../state";
import { PHYSICS_TICK_RATE } from "../level";
import { AudioSource } from "../audio";
import { MissionElementItem, MisParser } from "../parsing/mis_parser";

/** The Stop Watch! */
export class StopWatch extends PowerUp {
	dtsPath = "shapes/items/stopwatch.dts";
	pickUpName = (state.modification === 'gold')? "Stopped Time PowerUp!" : "Stopped Time PowerUp!";
	sounds = ["puwatchvoice.wav", "usewatch.wav"];
	watchSound: AudioSource;
	timeBonus: number;
	audio: any;
	cooldownDuration = 4000; // Override the default cooldown duration for the Stop Watch;
	stopWatchTime: number | undefined;
	
	
		constructor(element: MissionElementItem) {
				super(element);

				this.stopWatchTime = MisParser.parseNumber(String(element.stopwatchtime)) || 5000; // Default to 5000 if not set
				this.timeBonus = this.stopWatchTime;
		}

	pickUp(): boolean {
		return this.level.pickUpPowerUp(this);
	}

	use(t: number) {
		// Enable the Stopwatch in level by activating it...probably the use function activates the flag..
		// This is done to modify the shapes and force shapes behaviour in level...which will ultimately freeze
		// as long as the watch is active
		this.level.stopWatchActive = true;

		if (!this.level.schedule) return;

		// Stop any previous watchSound if activated already...avoiding sound glitches
		if (this.level.timeTravelSound) {
			this.level.timeTravelSound.stop();
			this.level.timeTravelSound = null;
		}
		let timeToRevert = (1 - t) * 1000 / PHYSICS_TICK_RATE;
		this.level.addTimeTravelBonus(this.timeBonus, timeToRevert);
		this.level.timeTravelSound = this.level.audio.createAudioSource('usewatch.wav');
		this.level.timeTravelSound.setLoop(true);
		this.level.timeTravelSound.play();

		this.level.deselectPowerUp();
	}

	reset() {
		super.reset();
		this.level.stopWatchActive = false; // Reset global flag on level reset
	}
}