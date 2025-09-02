import { PowerUp } from "./power_up";
import { state } from "../state";
import { MissionElementItem, MisParser } from "../parsing/mis_parser";

/** Temporarily increase marble restitution. */
export class SuperBounce extends PowerUp {
	dtsPath = "shapes/items/superbounce.dts";
	pickUpName = (state.modification === 'gold')? "Super Bounce PowerUp" : "Marble Recoil PowerUp";
	sounds = ["pusuperbouncevoice.wav", "forcefield.wav", "usex2.wav"];
	BounceRestitution: number; // The multiplier for the marble's bounce restitution, can be changed in the .mis! And is default
	SuperBounceTime: number; // The time for the super bounce to be active, can be changed in the .mis! And is default
	
	constructor(element: MissionElementItem) {
		super(element);

		this.BounceRestitution = MisParser.parseNumber(String(element.bouncerestitution)) || 0.9; // Default bounce restitution 0.9 if not set
		this.SuperBounceTime = MisParser.parseNumber(String(element.superbouncetime)) || 5000; // Default to 5000ms (5 seconds) if not set
	}
	
	async onLevelStart() {
		this.level.BounceRestitution = this.BounceRestitution;
		this.level.SuperBounceTime = this.SuperBounceTime;
	}

	pickUp(): boolean {
		return this.level.pickUpPowerUp(this);
	}

	use() {
		if (this.level.marble.doubler) {
			this.level.audio.play(this.sounds[2]);
			this.level.marble.enableSuperBounceDoubler(this.level.timeState);
			this.level.marble.doubler = false; // Reset doubler
		}
		else {
			this.level.marble.enableSuperBounce(this.level.timeState);
		}
		this.level.deselectPowerUp();
	}
}