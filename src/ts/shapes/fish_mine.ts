import { Shape } from "../shape";
import { Util } from "../util";
import { PHYSICS_TICK_RATE, TimeState } from "../level";
import { Vector3 } from "../math/vector3";
import { BlendingType } from "../rendering/renderer";
import { MisParser, MissionElementStaticShape } from "../parsing/mis_parser";
import { Quaternion } from "../math/quaternion";

/** Fish mines cute little beings but explode the marble on contact with them 😈 */
export class FishMine extends Shape {
	dtsPath = "shapes/hazards/fish.dts";
	disappearTime = -Infinity;
	sounds = ['explode1.wav'];
	shareMaterials = false;
	mover = false;
	startPosition: Vector3;
	endPosition: Vector3;
	customOffset: Vector3;
	moveT = 0; // 0=start, 1=end
	moveSpeed: number; // units per second
	moveDirection = 1; // 1=forward, -1=backward
	turnProgress = 0;
	turning = false;
	turnStartQuat = new Quaternion();
	turnEndQuat = new Quaternion();
	initialRotation = new Quaternion();

	constructor(element: MissionElementStaticShape) {
		super();
		this.mover = element._name === "Mover";

		// Parse custom offsets from the .mis file, default to 0 if not set
		this.customOffset = new Vector3(
			MisParser.parseNumber(String(element.my_x)),
			MisParser.parseNumber(String(element.my_y)),
			MisParser.parseNumber(String(element.my_z))
		);

		// Parse moveSpeed from .mis file, default to 2 if not set
		this.moveSpeed = MisParser.parseNumber(String(element.myspeed)) || 2;
	}

	async onLevelStart() {
		this.startPosition = this.worldPosition.clone();
		if (this.mover) {
			this.endPosition = this.startPosition.clone().add(this.customOffset);
		} else {
			this.endPosition = this.startPosition.clone();
		}
		this.moveT = 0;
		this.moveDirection = 1;
		this.initialRotation = this.group.orientation.clone();
	}

	onMarbleContact() {
		let time = this.level.timeState;

		if (this.level.stopWatchActive) return; // Don't explode if the stop watch is active

		let marble = this.level.marble;
		let minePos = this.worldPosition;
		let vec = marble.body.position.clone().sub(minePos);

		// Add velocity to the marble
		let explosionStrength = this.computeExplosionStrength(vec.length());
		marble.body.linearVelocity.addScaledVector(vec.normalize(), explosionStrength);
		marble.slidingTimeout = 2;
		this.disappearTime = time.timeSinceLoad;
		this.setCollisionEnabled(false);

		this.level.audio.play(this.sounds[0]);
		this.level.particles.createEmitter(FishMineParticle, this.worldPosition);
		this.level.particles.createEmitter(FishMineSmokeParticle, this.worldPosition);
		this.level.particles.createEmitter(FishMineSparksParticle, this.worldPosition);
		// Normally, we would add a light here, but eh.

		this.level.replay.recordMarbleContact(this);
	}

	/** Computes the strength of the explosion (force) based on distance from it. */
	computeExplosionStrength(r: number) {
		// Figured out through testing by RandomityGuy
		if (r >= 10.25) return 0;
		if (r >= 10) return Util.lerp(30.0087, 30.7555, r - 10);

		// The explosion first becomes stronger the further you are away from it, then becomes weaker again (parabolic).
		let a = 0.071436222;
		let v = ((r - 5) ** 2) / (-4 * a) + 87.5;

		return v;
	}

	tick(time: TimeState, onlyVisual: boolean) {
		if (onlyVisual) return;

		// Enable or disable the collision based on disappear time
		let visible = time.timeSinceLoad >= this.disappearTime + 5000;
		this.setCollisionEnabled(visible);

		// Moving Fish Mines...
		let moveSpeed = this.moveSpeed; // units per second
		let distance = this.startPosition.distanceTo(this.endPosition);
		let physicsDelta = 1 / PHYSICS_TICK_RATE; // fixed timestep in seconds

		if (distance > 0) {
			this.moveT += (moveSpeed / distance) * this.moveDirection * physicsDelta;

			// Compute yaw from start -> end so fish faces along its path
			let delta = this.endPosition.clone().sub(this.startPosition);
			let forwardYaw = Math.atan2(delta.y, delta.x);
			const eps = 1e-3; // small nudge to avoid exact antipodal quaternions

			let forwardQuat = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), forwardYaw);
			let backwardQuat = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), forwardYaw + Math.PI - eps);

			// Check for direction changes and trigger quick turn (only when direction actually flips)
			if (this.moveT >= 1) {
				this.moveT = 1;
				if (this.moveDirection !== -1) {
					this.moveDirection = -1;
					this.turnProgress = 0;
					this.turning = true;
					this.turnStartQuat.copy(this.group.orientation); // start from current orientation
					this.turnEndQuat.copy(backwardQuat); // target is backward along path
				}
			} else if (this.moveT <= 0) {
				this.moveT = 0;
				if (this.moveDirection !== 1) {
					this.moveDirection = 1;
					this.turnProgress = 0;
					this.turning = true;
					this.turnStartQuat.copy(this.group.orientation); // start from current orientation
					this.turnEndQuat.copy(forwardQuat); // target is forward along path
				}
			}

			// Handle quick turn if active
			if (this.turning) {
				const turnDuration = 0.3; // seconds for the pivot
				this.turnProgress += physicsDelta / turnDuration;
				if (this.turnProgress >= 1) {
					this.turnProgress = 1;
					this.turning = false;
				}
				this.group.orientation.copy(this.turnStartQuat).slerp(this.turnEndQuat, this.turnProgress);
			}

			// Interpolate position
			this.worldPosition = this.startPosition.clone().lerp(this.endPosition, this.moveT);
			this.worldMatrix.setPosition(this.worldPosition);
			this.group.position.copy(this.worldPosition);
			this.group.recomputeTransform();

			// Update collision geometry
			this.updateCollisionGeometry(0xffffffff);
		}
	}

	render(time: TimeState) {
		let opacity = Util.clamp((time.timeSinceLoad - (this.disappearTime + 5000)) / 1000, 0, 1);
		this.setOpacity(opacity);
	}

	reset() {
		super.reset();
		// Resettin the fish positions and orientations....
		if (this.startPosition) {
			this.worldPosition.copy(this.startPosition);
			this.worldMatrix.setPosition(this.worldPosition);

			this.group.position.copy(this.worldPosition);
			// Restore original spawn rotation
			if (this.initialRotation) {
				this.group.orientation.copy(this.initialRotation);
			}
			this.group.recomputeTransform();
		}
		// Preventing any hiccups
		if (this.mover) {
			this.moveT = 0;
			this.moveDirection = 1;

			// Reset turning state
			this.turning = false;
			this.turnProgress = 0;
		}
	}
}

/** The fire particle. */
const FishMineParticle = {
	ejectionPeriod: 0.2,
	ambientVelocity: new Vector3(0, 0, 0),
	ejectionVelocity: 2,
	velocityVariance: 1,
	emitterLifetime: 50,
	inheritedVelFactor: 0.2,
	particleOptions: {
		texture: 'particles/smoke.png',
		blending: BlendingType.Additive,
		spinSpeed: 40,
		spinRandomMin: -90,
		spinRandomMax: 90,
		lifetime: 1000,
		lifetimeVariance: 150,
		dragCoefficient: 0.8,
		acceleration: 0,
		colors: [{ r: 0.56, g: 0.36, b: 0.26, a: 1 }, { r: 0.56, g: 0.36, b: 0.26, a: 0 }],
		sizes: [0.5, 1],
		times: [0, 1]
	}
};
/** The smoke particle. */
export const FishMineSmokeParticle = {
	ejectionPeriod: 0.5,
	ambientVelocity: new Vector3(0, 0, 0),
	ejectionVelocity: 0.8,
	velocityVariance: 0.4,
	emitterLifetime: 50,
	inheritedVelFactor: 0.25,
	particleOptions: {
		texture: 'particles/smoke.png',
		blending: BlendingType.Normal,
		spinSpeed: 40,
		spinRandomMin: -90,
		spinRandomMax: 90,
		lifetime: 1200,
		lifetimeVariance: 300,
		dragCoefficient: 0.85,
		acceleration: -8,
		colors: [{ r: 0.56, g: 0.36, b: 0.26, a: 1 }, { r: 0.2, g: 0.2, b: 0.2, a: 1 }, { r: 0, g: 0, b: 0, a: 0 }],
		sizes: [1, 1.5, 2],
		times: [0, 0.5, 1]
	}
};
/** The sparks exploding away. */
export const FishMineSparksParticle = {
	ejectionPeriod: 0.4,
	ambientVelocity: new Vector3(0, 0, 0),
	ejectionVelocity: 13 / 4,
	velocityVariance: 6.75 / 4,
	emitterLifetime: 100,
	inheritedVelFactor: 0.2,
	particleOptions: {
		texture: 'particles/spark.png',
		blending: BlendingType.Additive,
		spinSpeed: 40,
		spinRandomMin: -90,
		spinRandomMax: 90,
		lifetime: 500,
		lifetimeVariance: 350,
		dragCoefficient: 0.75,
		acceleration: -8,
		colors: [{ r: 0.6, g: 0.4, b: 0.3, a: 1 }, { r: 0.6, g: 0.4, b: 0.3, a: 1 }, { r: 1, g: 0.4, b: 0.3, a: 0 }],
		sizes: [0.5, 0.25, 0.25],
		times: [0, 0.5, 1]
	}
};