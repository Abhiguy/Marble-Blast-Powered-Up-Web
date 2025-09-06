import { TimeState } from "../level";
import { Shape } from "../shape";
import { Vector3 } from "../math/vector3";
import { PathedInterior } from "../pathed_interior";

/** Kaiten Rotating Stand Support */
export class KaitenSupport extends Shape {
	dtsPath = "shapes/dts_interiors/kaitensupport.dts";
	collideable = false;

	tick(time: TimeState, onlyVisual = false) {
		super.tick(time, onlyVisual);

		// Find the pathed interior named "KeyMPlatform"
		// the stand will rotate according to the platform's positions to make it uniform..
		const platform = this.level.interiors.find(
			i => i instanceof PathedInterior && i.element?._name === "KeyMPlatform"
		) as PathedInterior | undefined;

		if (!platform) return;

		// Get current position of platform and KaitenSupport
		const platformPos = platform.currentPosition.clone().add(new Vector3(0, -20, 0));
		const supportPos = this.group.position;

		// Vector from support to behind platform
		const direction = platformPos.sub(supportPos);
		const yaw = Math.atan2(direction.y, direction.x);

		// Rotate support to face behind the platform (like MBPU)
		this.group.orientation.setFromAxisAngle(new Vector3(0, 0, 1), yaw);
		this.group.recomputeTransform();
	}
}