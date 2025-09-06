import { MissionElement, MissionElementStaticShape } from "../parsing/mis_parser";
import { Collision } from "../physics/collision";
import { Shape } from "../shape";
import { MisParser } from "../parsing/mis_parser";
import { Level } from "../level";
import { Vector3 } from "../math/vector3";
import { Util } from "../util";

/** Spring Board launches the marble with force depending upon how hard it hits with... */
export class SpringBoard extends Shape {
	dtsPath = "shapes/hazards/springboard.dts";
	spring: Shape;

	async init(level?: Level, srcElement?: MissionElement) {
		// No hiccups when loading the level
		await super.init(level, srcElement);

		this.spring = new Shape("shapes/hazards/springboardspring.dts");
		await this.spring.init(level);

		this.group.add(this.spring.group);
		let elScale = MisParser.parseVector3((srcElement as MissionElementStaticShape).scale);
		this.spring.setTransform(new Vector3(0, 0, -4 / elScale.z), this.worldOrientation, new Vector3(1 / elScale.x, 1 / elScale.y, 2 / elScale.z));
	}

	onMarbleContact(collision: Collision) {
		if (!collision) return; // We're probably in a replay if this is the case
		let marble = this.level.marble;
		let boardCenter = this.worldPosition;
		let distanceVec = marble.body.position.clone().sub(boardCenter);
		let r = distanceVec.length();

		if (r >= 10.25) return;

		// parabolic force calculation --- Whether player hits the board with tiny or hard force (ParaBolic)
		let a = 0.071436222;
		let rawForce = (r >= 10)
			? Util.lerp(30.0087, 30.7555, r - 10)
			: ((r - 5) ** 2) / (-4 * a) + 75;

		// Final scaling and soft floor
		let scaledForce = Math.max(7, rawForce * 0.41 + marble.body.linearVelocity.length() * 0.39); // min force 7, max ~26

		// Launch the marble gently along the normal
		let direction = collision.normal.clone().normalize();
		marble.body.linearVelocity.addScaledVector(direction, scaledForce);
		marble.slidingTimeout = 2; // Make sure we don't slide on the bumper after bouncing off it

		this.level.replay.recordMarbleContact(this);
	}
}