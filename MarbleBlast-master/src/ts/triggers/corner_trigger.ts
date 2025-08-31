import { Trigger } from "./trigger";
import { state } from "../state";
import { MissionElementTrigger } from "../parsing/mis_parser";
import { addTrick, finishCombo } from "./tricks";

interface CornerTriggerElement extends MissionElementTrigger {
	pos?: string;
}

// Acceptable full-lap patterns (forwards & backwards)
const validLapSequences = [
	"12341", "23412", "34123", "41234", // clockwise
	"14321", "21432", "32143", "43214"  // counter-clockwise
];

// Known bad or junk patterns that break lap detection
const invalidLapSequences = [
	"13", "24", "31", "42",
	"121", "232", "343", "414",
	"212", "323", "434", "141"
];

export class CornerTrigger extends Trigger {
	element: CornerTriggerElement;

	static lapSequence: string = "";
	static lapStartTime: number = 0;

	onMarbleEnter() {
		if (!state.level?.mission.backwardClock) return;

		const pos = this.element.pos;
		if (!pos) return;

		console.log(`[CornerTrigger] Entered corner pos: ${pos}`);

		// Start new lap if not already tracking
		if (!CornerTrigger.lapSequence) {
			CornerTrigger.lapStartTime = state.level.getCurrentTime();
		}

		CornerTrigger.lapSequence += pos;

		// Only check the last 5 chars for lap sequence
		const recentSequence = CornerTrigger.lapSequence.slice(-5);

		// Check for valid lap completion
		if (validLapSequences.includes(recentSequence)) {
			const timeNow = state.level.getCurrentTime();
			let delta = Math.max(1, Math.abs(CornerTrigger.lapStartTime - timeNow)); // avoid 0

			const points = Math.floor(200000000 / delta);
			addTrick("<spush><color:0000ff>Full Lap<spop>", points);
			finishCombo();
			state.menu.hud.displayAlert(`Full Lap\n${points.toLocaleString()}`, "#0000ffd0");

			if (delta < 3000) {
				addTrick("<spush><color:00ff00>Septic Eye<spop>", 50000);
				finishCombo();
				state.menu.hud.displayAlert("Septic Eye\n50,000", "#00ff00d0");
			}

			// Reset sequence tracking
			CornerTrigger.lapSequence = pos;
			CornerTrigger.lapStartTime = timeNow;
			return;
		}

		// Check for broken pattern
		for (const invalid of invalidLapSequences) {
			if (CornerTrigger.lapSequence.includes(invalid)) {
				console.log(`[CornerTrigger] Invalid pattern hit: ${CornerTrigger.lapSequence}`);
				CornerTrigger.lapSequence = pos;
				CornerTrigger.lapStartTime = state.level.getCurrentTime();
				return;
			}
		}
	}
}
