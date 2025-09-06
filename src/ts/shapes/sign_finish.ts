import { TimeState } from "../level";
import { Shape } from "../shape";

/** The flickering finish sign, usually above the finish pad. */
export class SignFinish extends Shape {
	dtsPath = "shapes/signs/finishlinesign.dts";

	tick(time: TimeState, onlyVisual = false) {
		// Freeze signfinish completely if stopwatch is active
		if (this.level.stopWatchActive) {
			this.isTSStatic = true;
		}
		super.tick(time, onlyVisual);
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

		// Continue with visual tick
		this.tick(time, true);
		super.render(time);
	}
}