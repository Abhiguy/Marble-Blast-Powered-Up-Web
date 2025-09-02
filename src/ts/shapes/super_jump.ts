import { PowerUp } from "./power_up";
import { state } from "../state";
import { Vector3 } from "../math/vector3";
import { BlendingType } from "../rendering/renderer";
import { MisParser, MissionElementItem } from "../parsing/mis_parser";

/** Gives the marble an upwards boost. */
export class SuperJump extends PowerUp {
	dtsPath = "shapes/items/superjump.dts";
	pickUpName = (state.modification === 'gold')? "Super Jump PowerUp" : "Jump Boost PowerUp";
	sounds = ["pusuperjumpvoice.wav", "dosuperjump.wav", "usex2.wav"];
	superJumpHeight: number | undefined;

	constructor(element: MissionElementItem) {
			super(element);
	
			this.superJumpHeight = MisParser.parseNumber(String(element.superjumpheight)) || 20; // Default to 20 if not set
	}

	pickUp(): boolean {
		return this.level.pickUpPowerUp(this);
	}

	use() {
		let marble = this.level.marble;
		if (this.level.marble.doubler) {
			marble.body.linearVelocity.addScaledVector(this.level.currentUp, this.superJumpHeight * 2); // Doubled height for picking doubler
			this.level.audio.play(this.sounds[2]);
			this.level.marble.doubler = false; // Reset doubler
		}
		else {
			marble.body.linearVelocity.addScaledVector(this.level.currentUp, this.superJumpHeight); // Simply add to vertical velocity
		}
		this.level.audio.play(this.sounds[1]);
		this.level.particles.createEmitter(superJumpParticleOptions, null, () => marble.body.position.clone());

		this.level.deselectPowerUp();
	}
}

export const superJumpParticleOptions = {
	ejectionPeriod: 10,
	ambientVelocity: new Vector3(0, 0, 0.05),
	ejectionVelocity: 1 * 0.5,
	velocityVariance: 0.25 * 0.5,
	emitterLifetime: 1000,
	inheritedVelFactor: 0.1,
	particleOptions: {
		texture: 'particles/twirl.png',
		blending: BlendingType.Additive,
		spinSpeed: 90,
		spinRandomMin: -90,
		spinRandomMax: 90,
		lifetime: 1000,
		lifetimeVariance: 150,
		dragCoefficient: 0.25,
		acceleration: 0,
		colors: [{r: 0, g: 0.5, b: 1, a: 0}, {r: 0, g: 0.6, b: 1, a: 1}, {r: 0, g: 0.6, b: 1, a: 0}],
		sizes: [0.25, 0.25, 0.5],
		times: [0, 0.75, 1]
	}
};