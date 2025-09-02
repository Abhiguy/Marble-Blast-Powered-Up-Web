import { specialFrictionFactor } from "../interior";
import { Collision } from "../physics/collision";
import { Shape } from "../shape";

/** Iceslicks are super slippery. */
export class Iceslick extends Shape {
	dtsPath = "shapes/ice_slick/oilslick.dts";
	friction = specialFrictionFactor['friction_none'];

	onMarbleContact(collision: Collision): void {
		if(!collision) return;
        this.level.marble.enableIce(this.level.timeState);
	}
}