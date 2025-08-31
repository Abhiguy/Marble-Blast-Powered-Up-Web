import { Shape } from "../shape";
import { Util } from "../util";
import { PHYSICS_TICK_RATE, TimeState } from "../level";
import { Vector3 } from "../math/vector3";
import { BlendingType } from "../rendering/renderer";
import { MissionElementStaticShape, MisParser } from "../parsing/mis_parser";

/** Sky mines explode on contact and knock the marble away. */
export class SkyMine extends Shape {
	dtsPath = "shapes/hazards/skymine.dts";
	disappearTime = -Infinity;
	sounds = ['explode1.wav'];
	shareMaterials = false;
	mover = false;
	startPosition: Vector3;
	endPosition: Vector3;
	customOffset: Vector3;
	moveT: number = 0; // 0=start, 1=end
    moveSpeed: number; // units per second
    moveDirection: number = 1; // 1=forward, -1=backward

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

		// Take heed though.....Sky Mines are score penalties in score based levels....
		if (this.level.mission.backwardClock) {
		    this.level.touchSkyMine();
		}

		this.level.audio.play(this.sounds[0]);
		this.level.particles.createEmitter(skyMineParticle, this.worldPosition);
		this.level.particles.createEmitter(skyMineSmokeParticle, this.worldPosition);
		this.level.particles.createEmitter(skyMineSparksParticle, this.worldPosition);
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

		// Moving Sky Mines...
		const moveSpeed = this.moveSpeed; // units per second
		let distance = this.startPosition.distanceTo(this.endPosition);
		if (distance > 0) {
			this.moveT += (moveSpeed / distance) * this.moveDirection / PHYSICS_TICK_RATE;
		
			// Ping-pong motion: reverse at ends
			if (this.moveT > 1) {
				this.moveT = 1;
				this.moveDirection = -1;
			} else if (this.moveT< 0) {
				this.moveT = 0;
				this.moveDirection = 1;
			}
			// Interpolate position
			this.worldPosition = this.startPosition.clone().lerp(this.endPosition, this.moveT);
			this.worldMatrix.setPosition(this.worldPosition);
			this.group.position.copy(this.worldPosition);
			this.group.recomputeTransform();
			// Update collision geometry to match new transform
			this.updateCollisionGeometry(0xffffffff);
		}
	}

	render(time: TimeState) {
		let opacity = Util.clamp((time.timeSinceLoad - (this.disappearTime + 5000)) / 1000, 0, 1);
		this.setOpacity(opacity);
	}

	reset() {
		super.reset();
		if (this.startPosition) {
			this.worldPosition.copy(this.startPosition);
			this.worldMatrix.setPosition(this.worldPosition);

			this.group.position.copy(this.worldPosition);
			this.group.recomputeTransform();
		}
		if (this.mover) {
            this.moveT = 0;
            this.moveDirection = 1;
        }
	}
}

/** The fire particle. */
const skyMineParticle = {
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
		colors: [{r: 0.56, g: 0.36, b: 0.26, a: 1}, {r: 0.56, g: 0.36, b: 0.26, a: 0}],
		sizes: [0.5, 1],
		times: [0, 1]
	}
};
/** The smoke particle. */
export const skyMineSmokeParticle = {
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
		colors: [{r: 0.56, g: 0.36, b: 0.26, a: 1}, {r: 0.2, g: 0.2, b: 0.2, a: 1}, {r: 0, g: 0, b: 0, a: 0}],
		sizes: [1, 1.5, 2],
		times: [0, 0.5, 1]
	}
};
/** The sparks exploding away. */
export const skyMineSparksParticle = {
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
		colors: [{r: 0.6, g: 0.4, b: 0.3, a: 1}, {r: 0.6, g: 0.4, b: 0.3, a: 1}, {r: 1, g: 0.4, b: 0.3, a: 0}],
		sizes: [0.5, 0.25, 0.25],
		times: [0, 0.5, 1]
	}
};