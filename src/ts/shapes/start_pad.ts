import { GO_TIME, TimeState } from "../level";
import { MissionElementStaticShape } from "../parsing/mis_parser";
import { Shape } from "../shape";

/** The starting location of the level. */
export class StartPad extends Shape {
	dtsPath = "shapes/pads/startarea.dts";
	padIndex: number;
	proximity: boolean;

	constructor(el: MissionElementStaticShape, useProximity: boolean) {
		super();

		const name = el._name; // With no further ado. If some levels have multiple startpads....they would be spawned at all of them
		let nameReplaced = name.replace("StartPoint", ""); // Titled as Startpoint1, Startpoint2, etc.
		const index = nameReplaced === "" ? -1 : parseInt(nameReplaced); // Titled as Startpoint1, Startpoint2, etc. 
		this.padIndex = index; // padIndex is used to handle the Array of StartPads
		this.proximity = useProximity; // If true, the pad will only be visible when the marble is close to it.
	}

	tick(time: TimeState, onlyVisual = false) {
		// Freeze startpad completely if stopwatch is active
		if (this.level.stopWatchActive) {
			this.isTSStatic = true;
		}
		super.tick(time, onlyVisual);
		// In Competency level...When one leaves the original pad....he respawns to the Array of startpads..started at index 1.
		if (this.level.mission.competency) {
			const originalPad = this.level.shapes.find(s => s instanceof StartPad && s.padIndex === -1) as StartPad;
			let dist = this.level.marble.body.position.distanceTo(originalPad.worldPosition);

			// Only mark that the player has left the first pad
			if (dist > 4.0 && !this.level.currentCheckpoint) { // If he is not at any indexed checkpoints
				this.level.leftPad = true;
			}
		}
	}

	render(time: TimeState) {
		// Unfreeze after the watch effect is over....
		if (!this.level.stopWatchActive && this.isTSStatic) {
			this.isTSStatic = false;
			this.hasBeenRendered = false;
			this.group.recomputeTransform?.();
		}

		// Freeze logic
		if (this.level.stopWatchActive) {
			this.isTSStatic = true;
		}

		// Skip rendering if static and already rendered
		if (this.isTSStatic && this.hasBeenRendered) return;

		if (this.proximity) {
			let dist = this.level.marble.body.position.distanceTo(this.worldPosition);
			if (dist < 10.0) {
				this.setOpacity(1);
			}
			else {
				this.setOpacity(0);
			}
		}

		// Continue with visual tick
		this.tick(time, true);
		super.render(time);
	}
}