import { Shape } from "../shape";
import { TimeState } from "../level";

/** Appear Platforms...Probably the limbo stuff */
export class AppearPlatform extends Shape {
	dtsPath = "shapes/platforms/platform_real.dts";
	async onLevelStart() {
		this.setOpacity(0); // Start invisible
	}
	tick(time: TimeState, onlyVisual: boolean) {
		if (onlyVisual) return;
		super.tick(time);
		let marble = this.level.marble;
		if (marble.revealer) {
			this.setOpacity(1);
		}
		else {
			this.setOpacity(0);
		}

	}
}