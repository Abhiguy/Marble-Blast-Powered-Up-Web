import { state } from "../state";
import { PowerUp } from "./power_up";
import { StorageManager } from "../storage";
import { Vector3 } from "../math/vector3";
import { BlendingType } from "../rendering/renderer";
import { ParticleEmitter } from "../particles";

/** Skill points are hidden collectibles that the player can search for. */
export class SkillPointItem extends PowerUp {
	dtsPath = "shapes/colmesh.dts"; // Skillpoints don't appear visually like other items...they are invisible all the time
	cooldownDuration = Infinity; // Won't respawn until the level is restarted
	autoUse = true;
	sounds = ["skillpoint.wav", "skillpoint.wav"]; // The sound pops up if the player found the point
	pickUpName = '';
	emitter: ParticleEmitter | null = null;
	used = false;

	pickUp(): boolean {
		this.used = true;
		let alreadyFound = StorageManager.data.collectedEggs.includes(this.level.mission.path);
				if (!alreadyFound) {
					StorageManager.data.collectedEggs.push(this.level.mission.path);
					StorageManager.store();
					state.menu.levelSelect.displayMission(); // To refresh the icon
				}

				// Stop the skillpoint emitter once marble has picked it up
	            if (this.emitter) {
					this.level.particles.removeEmitter(this.emitter);
		            this.emitter = null;
	            }
		
				this.level.audio.play(this.sounds[Number(alreadyFound)]); // Holy shit this cast is nasty
				this.customPickUpAlert = alreadyFound? "You already found this Skill Point." : "You found a Skill Point!";
		
				return true;
	}

	use() {}

	reset() {
	    super.reset();
		this.used = false;

	    // Remove old emitter if it exists..in order to avoid any clinsky side effects or stacking upon..since it's an emitter
	    if (this.emitter) {
		    this.level.particles.removeEmitter(this.emitter);
		    this.emitter = null;
	    }

	    // Do not recreate emitter if already collected in this session
	    if (this.used) return;

	    // Readd the emitter to the level properly
	    this.emitter = this.level.particles.createEmitter(skillPointParticle, this.worldPosition);
	}
}

/** The skillpoint particle. */
const skillPointParticle = {
	ejectionPeriod: 5,
	ambientVelocity: new Vector3(0, 0, 0),
	ejectionVelocity: 2.5,
	velocityVariance: 1.4,
	emitterLifetime: Infinity,

	spawnOffset() {
		// Emit from a small 3D spherical volume centered on the SkillPoint
		let theta = Math.random() * 2 * Math.PI;
		let phi = Math.acos(2 * Math.random() - 1);
		let radius = Math.random() * 0.15; // Smaller radius = tighter origin

		let x = radius * Math.sin(phi) * Math.cos(theta);
		let y = radius * Math.sin(phi) * Math.sin(theta);
		let z = radius * Math.cos(phi);
		return new Vector3(x, y, z);
	},

	inheritedVelFactor: 0.0,
	particleOptions: {
		texture: 'particles/star.png',
		blending: BlendingType.Additive,
		spinSpeed: 0,
		spinRandomMin: 0,
		spinRandomMax: 0,
		lifetime: 700,
		lifetimeVariance: 200,
		dragCoefficient: 0.05,
		acceleration: 0,

		colors: [
			{ r: 1, g: 1, b: 0, a: 0 },
			{ r: 1, g: 1, b: 0, a: 1 },
			{ r: 1, g: 1, b: 0, a: 0 }
		],

		sizes: [0.08, 0.08, 0.08],
		times: [0, 0.14, 0.7]
	}
};