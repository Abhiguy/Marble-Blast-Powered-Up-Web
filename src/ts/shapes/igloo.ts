import { MissionElement, MissionElementStaticShape } from "../parsing/mis_parser";
import { Collision } from "../physics/collision";
import { Shape } from "../shape";
import { MisParser } from "../parsing/mis_parser";
import { Level, TimeState } from "../level";
import { Vector3 } from "../math/vector3";
import { Util } from "../util";
import { AudioSource } from "../audio";
import { Quaternion } from "../math/quaternion";

/** Igloo Item Shoots Snow balls to the marble... */
// Code written by Abhi :)
export class IglooItem extends Shape {
	dtsPath = "shapes/hazards/igloo.dts";
	SnowBall: Shape;
	sounds = ["gunfire.wav"];
	soundSource: AudioSource;

	async init(level?: Level, srcElement?: MissionElement) {
		// No hiccups when loading the level
		await super.init(level, srcElement);
        // Take Heed though.... The SnowBall is a separate entity
		this.SnowBall = new Shape("shapes/hazards/snowball.dts");
		await this.SnowBall.init(level);
        // The Snowballs would be added along with the igloo in the level
		this.group.add(this.SnowBall.group);
		let elScale = MisParser.parseVector3((srcElement as MissionElementStaticShape).scale);
		this.SnowBall.setTransform(new Vector3(2.2, 0, 0.35 / elScale.z), this.worldOrientation, new Vector3(1 / elScale.x, 1 / elScale.y, 1 / elScale.z));
	}

	async onLevelStart() {
		this.soundSource = this.level.audio.createAudioSource(this.sounds[0], undefined, this.worldPosition);
		this.soundSource.gainFactor = 0.5;
	    this.soundSource.maxDistance = 15;
		this.soundSource.setLoop(true);
		this.soundSource.play();
		await this.soundSource.promise;
	}

	onMarbleContact(collision: Collision) {
		if (!collision) return; // We're probably in a replay if this is the case
		this.level.replay.recordMarbleContact(this);
	}

	tick(time: TimeState, onlyVisual = false) {	
		super.tick(time, onlyVisual);

		if (!onlyVisual&& this.level.marble && this.level.marble.body) {
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

        // The Very Part which Makes igloo appear like it were shooting Snowballs
		const speed = 7; // units per second
		const period = 1; // seconds for full back-and-forth cycle

		const t = (time.currentAttemptTime / 1000) % period;
		const pingPongT = t < period / 2 ? t / (period / 2) : 0.99 + 200 * (t - period / 2) / (period / 2); // Make them shooting
		const travelDistance = speed * pingPongT;

		// Initial offset from init (hardcoded)
		const initialOffset = new Vector3(2.2, 0, 0.35);

		// Rotate local forward vector (1,0,0) by igloo rotationQuat
		function quatMultiply(a: Quaternion, b: Quaternion): Quaternion {
			return new Quaternion(
				a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
				a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
				a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
				a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z
			);
		}

		const qVec = new Quaternion(1, 0, 0, 0);
		const qConj = new Quaternion(-this.group.orientation.x, -this.group.orientation.y, -this.group.orientation.z, this.group.orientation.w);
        const rotatedQ = quatMultiply(quatMultiply(this.worldOrientation, qVec), qConj);
		const worldForward = new Vector3(rotatedQ.x, rotatedQ.y, rotatedQ.z);

		// Calculate new snowball position
		const newPos = initialOffset.clone().add(worldForward.multiplyScalar(travelDistance));

		// Update snowball transform and recompute
		this.SnowBall.setTransform(newPos, this.group.orientation, new Vector3(1, 1, 1));
		this.SnowBall.group.recomputeTransform();

		this.colliders.forEach((c) => {
			c.body.position.copy(this.worldPosition);
			c.body.syncShapes();
		});
		}
	}				
					
}