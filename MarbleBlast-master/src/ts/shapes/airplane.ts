import { PowerUp } from "./power_up";
import { state } from "../state";

/** Airplane in which the marble flies! . */
export class Airplane extends PowerUp {
	dtsPath = "shapes/airplane/airplane.dts";
	showSequences = false;
	shareNodeTransforms = false;
	autoUse = true;
	ambientRotate = false;
	customPickUpAlert = "";
	pickUpName = (state.modification === 'gold')? this.customPickUpAlert : this.customPickUpAlert;
	sounds = ["airplane_noise.wav", "airplane_crash.wav"];

	pickUp(): boolean {
		return true;
	}
	use() {
		this.level.marble.enableAirplane();
		this.level.pitch = 0; // Setting the camera
	}
}