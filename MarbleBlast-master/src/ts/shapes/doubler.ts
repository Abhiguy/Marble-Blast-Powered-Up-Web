import { PowerUp } from "./power_up";
import { state } from "../state";

/** Doubles the strenght of a powerup on pickup and use */
export class Doubler extends PowerUp {
	dtsPath = "shapes/items/doubler.dts";
	sounds = ["getx2.wav", "usex2.wav"];
	pickUpName = (state.modification === 'gold')? "PowerUp Doubler" : "PowerUp Doubler";


	pickUp() {
		this.level.audio.play(this.sounds[0]);
		this.level.marble.doubler = true;
		return true;
	}

	use(t: number) {
		this.level.deselectPowerUp();
	}
}