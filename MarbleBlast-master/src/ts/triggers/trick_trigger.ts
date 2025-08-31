import { Trigger } from "./trigger";
import { state } from "../state";
import { MissionElementTrigger } from "../parsing/mis_parser";
import { addTrick, finishCombo } from "./tricks";

interface TrickTriggerElement extends MissionElementTrigger {
	trick?: string;
	points?: string;
	color?: string;
}

/** A trick trigger awards a named trick with point value on enter. */
export class TrickTrigger extends Trigger {
	element: TrickTriggerElement;
	color = this.element.color; // coloured text

	onMarbleEnter() {
		const trickName = this.element.trick || "Unnamed Trick";
		const trickPoints = Number(this.element.points) || 0;

		addTrick(trickName, trickPoints); // Adds to trick combo
		finishCombo(); // Immediately applies score from combo
		state.menu.hud.displayAlert(`${trickName}\n${trickPoints.toLocaleString()}`, this.color);
	}
}
