import { PowerUp } from "./power_up";
import { state } from "../state";

/** Reduces friction temporarily. */
export class Oil extends PowerUp {
	dtsPath = "shapes/items/oil.dts";
	pickUpName = (state.modification === 'gold')? "a Super Oil PowerUp!" : "a Super Oil PowerUp!";
	sounds = ["pugluevoice.wav", "useglue.wav"];

	pickUp(): boolean {
		return this.level.pickUpPowerUp(this);
	}

	use() {
		this.level.marble.enableOil(this.level.timeState);
		this.level.deselectPowerUp();
	}
}