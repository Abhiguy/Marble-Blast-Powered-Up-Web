import { Shape } from "../shape";
import { TimeState } from "../level";

/** A Different type of Start Pad for some specific levels */
export class SpecialStartPad extends Shape {
	dtsPath = "shapes/pads/startarea.dts";
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