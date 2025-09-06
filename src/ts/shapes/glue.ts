import { PowerUp } from "./power_up";
import { state } from "../state";
import { MissionElementItem, MisParser } from "../parsing/mis_parser";

/** Makes marble stick to the platform surfaces temporarily. */
export class Glue extends PowerUp {
	dtsPath = "shapes/items/glue.dts";
	pickUpName = (state.modification === 'gold') ? "a Super Glue PowerUp!" : "a Super Glue PowerUp!";
	sounds = ["pugluevoice.wav", "useglue.wav"];
	glueTime: number; // The duration for which the glue effect lasts. can be changed from the mis!

	constructor(element: MissionElementItem) {
		super(element);
		this.glueTime = element.gluetime ? MisParser.parseNumber(element.gluetime) : 5000; // Default to 5000 if not set
	}

	pickUp(): boolean {
		return this.level.pickUpPowerUp(this);
	}

	use() {
		this.level.marble.enableGlue(this.level.timeState, this.glueTime); // Gee..flexible glue
		this.level.deselectPowerUp();
	}
}