import { Shape } from "../shape";
import { TimeState } from "../level";
import { RigidBody } from "../physics/rigid_body";
import { Collision } from "../physics/collision";
import { Vector3 } from "../math/vector3";
import { Quaternion } from "../math/quaternion";


/** The Rotating Platforms. Probably the Limbo Stuff */
export class RotatingPlatform1 extends Shape {
	dtsPath = "shapes/platforms/rotatingplatform.dts";
	collideable = true;
	ambientRotate = false;
	body: RigidBody;
	spinRate = 1 / 1500 * Math.PI * 2;
	spinAxis = new Vector3(0, 0, 1);
	modifyYaw = true;

	tick(time: TimeState, onlyVisual = false) {
		super.tick(time, onlyVisual);

		let spinAnimation = new Quaternion();
		spinAnimation.setFromAxisAngle(this.spinAxis, time.timeSinceLoad * this.spinRate);

		let orientation = this.worldOrientation.clone();
		spinAnimation.multiplyQuaternions(orientation, spinAnimation);

		this.group.orientation.copy(spinAnimation);
		this.group.recomputeTransform();

		this.colliders.forEach((c) => {
			c.body.position.copy(this.group.position);
			c.body.orientation.copy(this.group.orientation);
			c.body.syncShapes();
		});
	}


	onMarbleContact(collision: Collision) {
		if (!collision) return; // We're probably in a replay if this is the case
		this.level.replay.recordMarbleContact(this);
		if (this.modifyYaw)
			this.level.yaw += this.spinRate;
	}
}