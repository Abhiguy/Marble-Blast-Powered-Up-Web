import { Shape } from "../shape";
import { TimeState } from "../level";

/** the Grass */
export class Grass extends Shape {
	dtsPath = "shapes/slendy/grass.dts";
	collideable = false;

	async onLevelStart() {
		this.setOpacity(0); // Start invisible
	}

	tick(time: TimeState, onlyVisual: boolean) {
		if (onlyVisual) return;
		super.tick(time);

		let dist = this.level.marble.body.position.distanceTo(this.worldPosition);
		if (dist < 10.0) {
			this.setOpacity(1);
		} else {
			this.setOpacity(0);
		}
	}
}