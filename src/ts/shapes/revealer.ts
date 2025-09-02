import { PowerUp } from "./power_up";
import { state } from "../state";

/** Temporarily unhides all hidden platforms....Probably the limbo stuff */
export class Revealer extends PowerUp {
	dtsPath = "shapes/items/magnifying.dts";
	pickUpName = (state.modification === 'gold')? "Illusion Revealer!" : "Illusion Revealer!";
	sounds = ["purevealervoice.wav"];
	isActive = false;

	pickUp(): boolean {
		return this.level.pickUpPowerUp(this);
	}

	use() {
		this.isActive = true;
		this.level.marble.revealer = true;
		// Schedule deactivation after 5 seconds (5000 ms)
        setTimeout(() => {
        this.level.marble.revealer = false;
        this.isActive = false;
        }, 5000);

		this.level.deselectPowerUp();
	}

		
}