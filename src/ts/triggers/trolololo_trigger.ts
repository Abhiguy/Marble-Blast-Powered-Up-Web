import { Trigger } from "./trigger";
import { state } from "../state";
import { addTrick, finishCombo } from "./tricks";

/** The TrololoTrigger penalizes the player when they touch it. It immediately adds a negative trick score and ends the combo.*/
export class TrololoTrigger extends Trigger {
	onMarbleEnter() {
		// Add a penalty trick (negative score)
		// This will immediately ruin any ongoing combo
		addTrick("TROLOLOLOLO", -50000);

		// Force finish the combo so the penalty gets applied
		finishCombo();

		// Show a red alert on the screen to indicate penalty
		state.menu.hud.displayAlert("TROLOLOLOLO\n50,000", "#ff0000d0");
		state.level.fastRespawnPlayer(); // Respawning Respawning Respawning immediately! :)
	}
}