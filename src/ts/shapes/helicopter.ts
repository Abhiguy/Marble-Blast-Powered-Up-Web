import { PowerUp } from "./power_up";
import { state } from "../state";
import { MisParser, MissionElementItem } from "../parsing/mis_parser";

/** Reduces gravity temporarily. */
export class Helicopter extends PowerUp {
	dtsPath = "shapes/images/helicopter.dts";
	showSequences = false;
	shareNodeTransforms = false;
	pickUpName = (state.modification === 'gold')? "Gyrocopter PowerUp" : "Helicopter PowerUp";
	sounds = ["pugyrocoptervoice.wav", "use_gyrocopter.wav", "usex2.wav"];
	GyrocopterGravityMultiplier: number; // The multiplier for the gyrocopter's gravity, can be changed in the .mis! And is default
	GyrocopterTime: number; // The time for the gyrocopter to be active, can be changed in the .mis! And is default
	AirAcceleration: number; // The air acceleration of the gyrocopter, can be changed in the .mis! And is default

	constructor(element: MissionElementItem) {
				super(element);

				this.GyrocopterGravityMultiplier = MisParser.parseNumber(String(element.gyrocoptergravitymultiplier)) || 0.25; // Default to 0.25 or (1/4th of level gravity) if not set
				this.GyrocopterTime = MisParser.parseNumber(String(element.gyrocoptertime)) || 5000; // Default to 5000ms (5 seconds) if not set
				this.AirAcceleration = MisParser.parseNumber(String(element.airacceleration)) || 5; // Default air acceleration of gyrocopter is 5 if not set
	}

	async onLevelStart() {
		this.level.GyrocopterGravityMultiplier = this.GyrocopterGravityMultiplier;
		this.level.GyrocopterTime = this.GyrocopterTime;
		this.level.AirAcceleration = this.AirAcceleration;
	}

	pickUp(): boolean {
		return this.level.pickUpPowerUp(this);
	}

	use() {
		if (this.level.marble.doubler) {
			this.level.audio.play(this.sounds[2]);
			this.level.marble.enableHelicopterDoubler(this.level.timeState);
			this.level.marble.doubler = false; // Reset doubler
		}
		else {
			this.level.marble.enableHelicopter(this.level.timeState);
		}
		this.level.deselectPowerUp();
	}
}