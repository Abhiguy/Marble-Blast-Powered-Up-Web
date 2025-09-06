import { Shape } from "../shape";
import { TimeState } from "../level";
import { RigidBody } from "../physics/rigid_body";
import { Collision } from "../physics/collision";
import { Vector3 } from "../math/vector3";
import { Quaternion } from "../math/quaternion";
import { MisParser, MissionElementStaticShape } from "../parsing/mis_parser";

/** The Rotating Platforms. Probably the Limbo Stuff */
export class RotatingPlatform2 extends Shape {
	dtsPath = "shapes/platforms/rotatingplatform.dts";
	collideable = true;
	ambientRotate = false;
	body: RigidBody;
	baseOrientation = new Quaternion();
	rotmultiplier: number;
	keepGravity = false;
	keepPauses = false;
	spinAxis: Vector3;
	spinRate: number;
	element: MissionElementStaticShape;
	paused = false;
	pauseUntil = 0;      // ms timestamp when 1‑sec halt ends
	angleRef = 0;        // angle at the start of current half‑turn (rad)
	currentAngle = 0;    // continuously growing angle (rad)
	lastTimeMs = NaN;    // previous frame’s timeSinceLoad (ms)

	constructor(element: MissionElementStaticShape) {
		super();
		this.element = element;
		// Parse the Rotating Platform's Spin Axis directly from Mis file.
		if (element.x_axisrot)
			this.spinAxis = new Vector3(
				MisParser.parseNumber(element.x_axisrot),
				MisParser.parseNumber(element.y_axisrot),
				MisParser.parseNumber(element.z_axisrot)
			);
		else
			this.spinAxis = new Vector3(1, 0, 0);
		this.rotmultiplier = element.rotmultiplier ? MisParser.parseNumber(element.rotmultiplier) : 3000;
		this.keepGravity = element.keepgravity ? MisParser.parseBoolean(element.keepgravity) : false;
		this.keepPauses = element.keeppauses ? MisParser.parseBoolean(element.keeppauses) : false;
		this.spinRate = 1 / this.rotmultiplier * Math.PI * 2;
	}

	reset(): void {
		//First frame capturing original orientation
		if (this.baseOrientation.w === 0 &&
			this.baseOrientation.x === 0 &&
			this.baseOrientation.y === 0 &&
			this.baseOrientation.z === 0) {
			this.baseOrientation.copy(this.worldOrientation);
		}
	}

	tick(time: TimeState, onlyVisual = false) {
		super.tick(time, onlyVisual);

		// Every frame- everything in *milliseconds
		const nowMs = time.timeSinceLoad;  // already ms
		const dtMs = isNaN(this.lastTimeMs) ? 0 : nowMs - this.lastTimeMs;
		this.lastTimeMs = nowMs;

		// Handle an active pause
		if (this.paused && this.keepPauses) {
			if (nowMs >= this.pauseUntil) {
				// Halt finished then resume rotation
				this.paused = false;
				this.angleRef = this.currentAngle; // reset body
			} else {
				return;  // stay frozen
			}
		}

		// Advance rotation (spinRate is rad/ms, dtMs is ms)
		this.currentAngle += this.spinRate * dtMs;

		// Trigger a 1‑s pause every 180° (π rad)...we don't want to slip off
		if (Math.abs(this.currentAngle - this.angleRef) >= Math.PI && this.keepPauses) {
			this.paused = true;
			this.pauseUntil = nowMs + 1000;  // 1s = 1000ms
		}

		//Apply orientation — even on the frame we hit π so the mesh stops exactly at 180°
		const spinQuat = new Quaternion().setFromAxisAngle(
			this.spinAxis, this.currentAngle);
		const newOrientation = this.baseOrientation.clone().multiply(spinQuat);
		this.setTransform(this.worldPosition, newOrientation, this.worldScale);
	}


	onMarbleContact(collision: Collision) {
		if (!collision) return; // We're probably in a replay if this is the case
		this.level.replay.recordMarbleContact(this);
		if (this.keepGravity && !this.paused) {
			this.level.setUp(collision.normal, false); // smooth transition
		}
	}
}