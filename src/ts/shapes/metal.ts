import { PowerUp } from "./power_up";
import { state } from "../state";
import { MissionElementItem, MisParser } from "../parsing/mis_parser";

/** Temporarily makes marble heavier */
export class Metal extends PowerUp {
	dtsPath = "shapes/metal/metal.dts";
	pickUpName = (state.modification === 'gold')? "Metal Marble PowerUp!" : "Metal Marble PowerUp!";
	sounds = ["pumetalvoice.wav", "usemetal.wav", "metal_bouncehard1.wav", "metal_bouncehard2.wav", "metal_bouncehard3.wav", "metal_bouncehard4.wav", "metal_roll.wav"];
	isActive = false;
	MetalTime: number; // The duration for which the metal lasts. can be changed from the mis!

	constructor(element: MissionElementItem) {
		super(element);
		this.MetalTime = MisParser.parseNumber(String(element.metaltime)) || 5000; // Default to 5000 if not set
	}
		
	async onLevelStart() {
		this.level.MetalTime = this.MetalTime;
	}
	 

	pickUp(): boolean {
		return this.level.pickUpPowerUp(this);
	}

	use() {
        this.level.marble.enableMetal(this.level.timeState, this.MetalTime); // Gee..flexible metal duration
		this.isActive = true;
		this.level.marble.jumpImpulse *= 0.5; // Metal powerup halves the jump impulse
		this.level.marble.metal = true;
		// Schedule deactivation after 5 seconds (5000 ms) or override
        setTimeout(() => {
        this.level.marble.metal = false;
        this.level.marble.jumpImpulse = 7.3; // Restore jump impulse
        this.isActive = false;
        }, this.MetalTime);

		this.level.deselectPowerUp();
	}
    reset() {
		this.level.marble.metal = false; // Pronbably the metal effect on marble is vanished if respawn
		this.level.marble.jumpImpulse = 7.3; // Restore jump impulse
		this.isActive = false; // Reset the metal if it were active and respawned
		this.lastPickUpTime = null; // Force available on restart
	}
		
}