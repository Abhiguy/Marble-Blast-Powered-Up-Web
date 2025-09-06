import { Shape } from "../shape";
import { Vector3 } from "../math/vector3";
import { BlendingType } from "../rendering/renderer";
import { Collision } from "../physics/collision";
import { ParticleEmitter } from "../particles";

/** lava floor is a surface which bounces the marble on contact. */
export abstract class AbstractLavaFloor extends Shape {
	emitters: ParticleEmitter[] = []; // Array of emitters spawned along with the floor

	async onLevelStart() {
		super.onLevelStart();
		this.emitters = [];

		// Number of lava emitters across the floor
		const numEmitters = 19; // many emitters spawned along with the floor at random offsets
		const floorHalfWidth = 15; // half of the width of the surface to make sure nothing goes out of span
		const floorHalfDepth = 15;   // half-depth of the lava floor
		const maxHeight = 1.46; // spawning them just a lil above the floor. Heh..should have been doing this

		for (let i = 0; i < numEmitters; i++) {
			// Strictly inside the floor bounds...
			const offsetX = (Math.random() - 0.5) * 1.5 * floorHalfWidth;
			const offsetY = (Math.random() - 0.5) * 1.5 * floorHalfDepth;
			const offsetZ = Math.random() * maxHeight;
			const pos = this.worldPosition.clone().add(new Vector3(offsetX, offsetY, offsetZ));

			const emitter = this.level.particles.createEmitter(lavaemitter, pos);
			this.emitters.push(emitter);
		}
	}
	onMarbleContact(collision: Collision) {
		this.level.audio.play(this.sounds[0]);

		if (!collision) return; // We're probably in a replay if this is the case

		let marble = this.level.marble;

		// Set the velocity along the contact normal, but make sure it's capped
		marble.setLinearVelocityInDirection(collision.normal, 25, false);
		marble.slidingTimeout = 2; // Make sure we don't slide on the lavafloor after bouncing off it

		this.level.replay.recordMarbleContact(this);
		this.level.particles.createEmitter(lavafloorParticleOptions, null, () => marble.body.position.clone());
	}
}

const lavaemitter = {
	ejectionPeriod: 100,
	ambientVelocity: new Vector3(0, 0, 0.05),
	ejectionVelocity: 4.0,
	velocityVariance: 1.0,
	emitterLifetime: Infinity,
	inheritedVelFactor: 0.2,
	particleOptions: {
		texture: 'particles/spark.png',
		blending: BlendingType.Additive,
		spinSpeed: 0,
		spinRandomMin: 0,
		spinRandomMax: 0,
		lifetime: 400,
		lifetimeVariance: 150,
		dragCoefficient: 0.05,
		acceleration: 0,
		colors: [{r: 0.8, g: 0.8, b: 0, a: 0}, {r: 0.8, g: 0.8, b: 0, a: 1}, {r: 0.8, g: 0.8, b: 0, a: 0}],
		sizes: [0.25, 0.25, 1],
		times: [0, 0.25, 1]
	}
}

export const lavafloorParticleOptions = {
	ejectionPeriod: 5,
	ambientVelocity: new Vector3(0, 0, 0.2),
	ejectionVelocity: 1 * 0.5,
	velocityVariance: 0.25 * 0.5,
	emitterLifetime: 400,
	inheritedVelFactor: 0.25,
	particleOptions: {
		texture: 'particles/spark.png',
		blending: BlendingType.Additive,
		spinSpeed: 0,
		spinRandomMin: 0,
		spinRandomMax: 0,
		lifetime: 400,
		lifetimeVariance: 150,
		dragCoefficient: 0.25,
		acceleration: 0,
		colors: [{r: 0.8, g: 0.8, b: 0, a: 0}, {r: 0.8, g: 0.8, b: 0, a: 1}, {r: 0.8, g: 0.8, b: 0, a: 0}],
		sizes: [0.25, 0.25, 1],
		times: [0, 0.25, 1]
	}
};