import { TimeState } from "../level";
import { Shape } from "../shape";

/** It's the Planet! Having Auto Gravity on which the marble rolls! */
export class Planet extends Shape {
	dtsPath = "shapes/dts_interiors/ball.dts";
	collideable = true;
	tick(time: TimeState,onlyVisual: boolean) {
		super.tick(time, onlyVisual);
		this.level.setUp(this.level.marble.body.position.clone().sub(this.worldPosition).normalize(), true);
	}
}