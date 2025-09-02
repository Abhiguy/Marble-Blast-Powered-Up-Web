import { AudioSource } from "../audio";
import { Level, TimeState } from "../level";
import { Quaternion } from "../math/quaternion";
import { Vector3 } from "../math/vector3";
import { MisParser, MissionElementTrigger } from "../parsing/mis_parser";
import { Trigger } from "./trigger";

/** A teleport trigger teleports the marble to a specified destination after some time of being inside it. */
export class SeamlessMotionTrigger extends Trigger {
	/** How long after entry until the teleport happens */
	delay = 0;
	entryTime: number = null;
	exitTime: number = null;
	sounds = ["teleport.wav"];
	teleportingSound: AudioSource = null;

	constructor(element: MissionElementTrigger, level: Level) {
		super(element, level);

		if (element.delay) this.delay = MisParser.parseNumber(element.delay);
	}

	onMarbleEnter() {
		let time = this.level.timeState;

		this.exitTime = null;
		this.level.replay.recordMarbleEnter(this);
		if (this.entryTime !== null) return;

		this.entryTime = time.currentAttemptTime;
	}

	onMarbleLeave() {
		let time = this.level.timeState;

		this.exitTime = time.currentAttemptTime;
		this.level.replay.recordMarbleLeave(this);
	}

	tick(time: TimeState) {
		if (this.entryTime === null) return;

		if (time.currentAttemptTime - this.entryTime >= this.delay) {
			this.executeTeleport();
			return;
		}
	}

	executeTeleport() {
		this.entryTime = null;

		let body = this.level.marble.body;

		let offset = MisParser.parseVector3(this.element.offset);

		// Determine where to place the marble
		let position: Vector3 = body.position.clone().add(offset);

		body.position.copy(position);
		body.prevPosition.copy(position); // Avoid funky CCD business

		// Determine camera orientation
		let yaw: number;
		if (this.element.yaw) yaw = MisParser.parseNumber(this.element.yaw);
		else yaw = 0;

		// yaw = -yaw; // Need to flip it for some reason
		if (yaw !== 0.0) {
			// Have to rotate relative to the marble's current orientation
			let destCenter = this.vertices[0].clone().lerp(this.vertices[7], 0.5).add(offset);
			let delta = destCenter.clone().sub(body.position);
			// Rotate this vector by the yaw angle
			delta.applyAxisAngle(new Vector3(0, 0, 1), yaw);
			// Set the marble's position to the new position
			body.position.copy(destCenter.sub(delta));
			body.prevPosition.copy(destCenter.sub(delta)); // Avoid funky CCD business

			// Rotate the marble's orientation
			body.linearVelocity.applyAxisAngle(new Vector3(0, 0, 1), yaw);
			body.angularVelocity.applyAxisAngle(new Vector3(0, 0, 1), yaw);

			let q = new Quaternion();
			q.setFromAxisAngle(new Vector3(0, 0, 1), yaw);
			body.orientation.multiply(q);
			body.prevOrientation.multiply(q);
		}

		this.level.yaw += yaw;
	}

	reset() {
		super.reset();

		this.entryTime = null;
		this.exitTime = null;
	}
}