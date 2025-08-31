import { Shape } from "../shape";
import { TimeState } from "../level";

/** Diappear Platforms..Probably the limbo Stuff. */
export class DisappearPlatform extends Shape {
	dtsPath = "shapes/platforms/platform_fake.dts";
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
			 }
			 else {
				this.setOpacity(0);
			 }
	
	}
}