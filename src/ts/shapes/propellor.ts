import { Collision } from "../physics/collision";
import { Shape } from "../shape";
import { TimeState } from "../level";
import { Vector3 } from "../math/vector3";
import { Quaternion } from "../math/quaternion";

/** Propellors follow the marble... */
export class Propellor extends Shape {
	dtsPath = "shapes/hazards/propellor.dts";

	onMarbleContact(collision: Collision) {
		if (!collision) return; // We're probably in a replay if this is the case
		this.level.replay.recordMarbleContact(this);
	}

	tick(time: TimeState, onlyVisual = false) {
		super.tick(time, onlyVisual);

		if (!onlyVisual && this.level.marble && this.level.marble.body) {
			// Follow the marble
			let dir = this.level.marble.body.position.clone().sub(this.worldPosition).normalize();
			dir.z = 0;
			dir.normalize();

			// Compute yaw angle (rotation around Z)
			let yaw = Math.atan2(dir.y, dir.x);

			const rotationQuat = new Quaternion();
			rotationQuat.setFromAxisAngle(new Vector3(0, 0, 1), yaw);

			this.group.orientation.copy(rotationQuat);
			this.group.recomputeTransform();
		}
	}

}