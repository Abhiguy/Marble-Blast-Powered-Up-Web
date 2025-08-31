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
	x_axisrot: number;
	y_axisrot: number;
	z_axisrot: number;
	rotmultiplier: number;
	keepGravity: boolean = false;
  keepPauses: boolean = false;
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
		this.x_axisrot = MisParser.parseNumber(String(element.x_axisrot));
		this.y_axisrot = MisParser.parseNumber(String(element.y_axisrot));
		this.z_axisrot = MisParser.parseNumber(String(element.z_axisrot));
		this.rotmultiplier = MisParser.parseNumber(String(element.rotmultiplier)) || 3000;
		this.keepGravity = MisParser.parseNumber(String(element.keepgravity)) !== 0;
    this.keepPauses = MisParser.parseNumber(String(element.keeppauses)) === 1;
		this.spinAxis = new Vector3(this.x_axisrot, this.y_axisrot, this.z_axisrot);
		this.spinRate = 1 / this.rotmultiplier * Math.PI * 2;
	}

	tick(time: TimeState, onlyVisual = false) {
    super.tick(time, onlyVisual);

    //First frame capturing original orientation
        if (this.baseOrientation.w === 0 &&
            this.baseOrientation.x === 0 &&
            this.baseOrientation.y === 0 &&
            this.baseOrientation.z === 0) {
            this.baseOrientation.copy(this.worldOrientation);
        }

    // Every frame- everything in *milliseconds
      const nowMs = time.timeSinceLoad;  // already ms
      const dtMs  = isNaN(this.lastTimeMs) ? 0 : nowMs - this.lastTimeMs;
      this.lastTimeMs = nowMs;

    // Handle an active pause
        if (this.paused && this.keepPauses) {
            if (nowMs >= this.pauseUntil) {
              // Halt finished then resume rotation
              this.paused   = false;
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
          this.pauseUntil = nowMs + 1000;  // 1 s = 1000 ms
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