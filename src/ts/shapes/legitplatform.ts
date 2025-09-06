import { Shape } from "../shape";
import { TimeState } from "../level";


/** Legit Platforms...Probably the limbo stuff */
export class LegitPlatform extends Shape {
	dtsPath = "shapes/platforms/platform_real.dts";
	async onLevelStart() {
		this.setOpacity(0); // Start invisible
	}
	tick(time: TimeState, onlyVisual: boolean) {
		if (onlyVisual) return;
		super.tick(time);

		let dist = this.level.marble.body.position.distanceTo(this.worldPosition);
		if (dist < 10.0) {
			this.setOpacity(1);
		}
		else {
			this.setOpacity(0);
		}

	}
}