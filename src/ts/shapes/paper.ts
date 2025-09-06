import { PowerUp } from "./power_up";
import { state } from "../state";
import { MissionElementItem, MisParser } from "../parsing/mis_parser";

/** Temporarily makes marble lighter */
export class Paper extends PowerUp {
	dtsPath = "shapes/paper/paper.dts";
	pickUpName = (state.modification === 'gold') ? "Paper Marble PowerUp!" : "Paper Marble PowerUp!";
	sounds = ["pupapervoice.wav", "usepaper.wav", "paper_bouncehard1.wav", "paper_bouncehard2.wav", "paper_bouncehard3.wav", "paper_bouncehard4.wav", "paper_roll.wav"];
	isActive = false;
	paperTime: number; // The duration for which the paper lasts. can be changed from the mis!

	constructor(element: MissionElementItem) {
		super(element);
		this.paperTime = element.papertime ? MisParser.parseNumber(element.papertime) : 5000; // Default to 5000 if not set
	}

	pickUp(): boolean {
		return this.level.pickUpPowerUp(this);
	}

	use() {
		this.level.marble.enablePaper(this.level.timeState, this.paperTime); // Gee...flexible paper duration
		this.isActive = true;
		this.level.marble.jumpImpulse *= 3; // Paper powerup triples the jump impulse
		this.level.marble.paper = true;
		// Schedule deactivation after 5 seconds (5000 ms)
		setTimeout(() => {
			this.level.marble.paper = false;
			this.level.marble.jumpImpulse = 7.3; // Restore jump impulse
			this.isActive = false;
		}, this.paperTime);

		this.level.deselectPowerUp();
	}
	reset() {
		this.level.marble.paper = false; // Probably the paper effect on marble is vanished if respawn
		this.level.marble.jumpImpulse = 7.3; // Restore jump impulse
		this.isActive = false; // Reset the paper if it were active and respawned
		this.lastPickUpTime = null; // <-- Force available on restart
	}

}