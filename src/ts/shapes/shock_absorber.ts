import { PowerUp } from "./power_up";
import { state } from "../state";
import { MisParser, MissionElementItem } from "../parsing/mis_parser";

/** Temporarily reduces marble restitution. */
export class ShockAbsorber extends PowerUp {
	dtsPath = "shapes/items/shockabsorber.dts";
	pickUpName = (state.modification === 'gold')? "Shock Absorber PowerUp" : "Anti-Recoil PowerUp";
	an = state.modification !== 'gold';
	sounds = ["pushockabsorbervoice.wav", "superbounceactive.wav", "usex2.wav"];
	ShockAbsorberTime: number; // The time for the shock absorber to be active, can be changed in the .mis! And is default

	constructor(element: MissionElementItem) {
		super(element);
		this.ShockAbsorberTime = MisParser.parseNumber(String(element.shockabsorbertime)) || 5000; // Default to 5000ms (5 seconds) if not set
	}
		
	async onLevelStart() {
		this.level.ShockAbsorberTime = this.ShockAbsorberTime;
	}

	pickUp(): boolean {
		return this.level.pickUpPowerUp(this);
	}

	use() {
		if (this.level.marble.doubler) {
			this.level.audio.play(this.sounds[2]);
			this.level.marble.enableShockAbsorberDoubler(this.level.timeState);
			this.level.marble.doubler = false; // Reset doubler
		}
		else {
			this.level.marble.enableShockAbsorber(this.level.timeState);
		}
		this.level.deselectPowerUp();
	}
}