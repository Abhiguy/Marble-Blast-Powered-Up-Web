import { ForceShape } from "./force_shape";
import { AudioSource } from "../audio";
import { Vector3 } from "../math/vector3";
import { PHYSICS_TICK_RATE, TimeState } from "../level";
import { MissionElementStaticShape } from "../parsing/mis_parser";
import { state } from "../state";
import { Util } from "../util";

/** The Jumpscarer */
export class SpecialTornado extends ForceShape {
	dtsPath = "shapes/hazards/tornado.dts";
	collideable = false;
	sounds = ["tornado.wav", "death.wav", "sting1.wav", "sting2.wav", "sting3.wav", "sting4.wav", "sting5.wav", "sting6.wav", "p.wav"];
	soundSource: AudioSource;
	chasePlayer = false;
	deathSound = false;
	startPosition: Vector3;
	scaryfaceTimer: 0;
	stingActive = false; // For the sting sound
	stingSounds: AudioBuffer[] = []; // Sting sounds function

	constructor(el: MissionElementStaticShape) {
		super();

		this.addSphericalForce(8, -60);
		this.addSphericalForce(3, 60);
		this.addFieldForce(3, new Vector3(0, 0, 0)); // The upwards force is always in the same direction, which is fine considering tornados never appear with modified gravity.
		this.chasePlayer = el._name === "ChasePlayer";
	}

	async onLevelStart() {
		this.soundSource = this.level.audio.createAudioSource(this.sounds[0], undefined, this.worldPosition);
		this.soundSource.setLoop(true);
		this.soundSource.gainFactor = 2;
		this.soundSource.maxDistance = 100;
		this.soundSource.play();
		this.deathSound = false;
		await this.soundSource.promise;
		this.startPosition = this.worldPosition.clone();
	}


	tick(time: TimeState, onlyVisual = false) {
		super.tick(time, onlyVisual);

		if (this.chasePlayer && this.level.marble && this.level.marble.body) {
			let dir = this.level.marble.body.position.clone().sub(this.worldPosition).normalize();
			let speed = 1.0;
			let dist = this.level.marble.body.position.distanceTo(this.worldPosition);
			if (dist < 20.0) {
				speed = 5.0; // Much more speed
			} else if (dist < 10.0) {
				speed = 2.0; // Slow down as it gets closer
			}
			else {
				speed = 1; // Slow down as it is  further away
			}
			// Game Over
			if (!this.deathSound && dist < 1.0) {
				this.level.audio.play('death.wav');
				this.deathSound = true;
				state.menu.hud.scaryface = true;
				state.menu.hud.scaryFaceTimer = 60; // Pop the face for 60 frames or 1 sec
				this.level.dead = true;
				// Set off to void...
				if (!this.level.levelFinished) {
					const offset = new Vector3(1000, 0, 0);
					// Set off to the ether....
					setTimeout(() => {
						if (!this.level.levelFinished) {
							this.level.goOutOfBounds();
						}
					}, 2500);
					this.level.marble.body.position.add(offset);
				}
				// Bring back the jumpscarer to its original position
				this.worldPosition.copy(this.startPosition);
				this.worldMatrix.setPosition(this.worldPosition);

			}
			let add = dir.multiplyScalar(speed / PHYSICS_TICK_RATE);

			this.worldPosition.add(add);
			this.worldMatrix.setPosition(this.worldPosition);

			this.group.position.copy(this.worldPosition);
			this.group.recomputeTransform();

			this.colliders.forEach((c) => {
				c.body.position.copy(this.worldPosition);
				c.body.syncShapes();
			});
		}

		// If marble finishes the level, dont play the sting sound
		if (this.level.levelFinished) {
			this.stingActive = false;
			return;
		}

		// Sting logic 
		const toTornado = this.worldPosition.clone().sub(this.level.marble.body.position).normalize();
		const yawToTornado = Math.atan2(toTornado.y, toTornado.x);
		const yawDiff = Math.abs(Util.angleDiff(yawToTornado, this.level.yaw));

		const isLookingAway = yawDiff > 1.2 || Math.abs(this.level.pitch) > 1.2;

		if (isLookingAway) {
			if (!this.stingActive) {
				this.playRandomSting();
			}
			this.stingActive = true;
		} else {
			this.stingActive = false;
		}
	}

	playRandomSting() {
		const index = Math.floor(Math.random() * 7);
		this.level.audio.play(this.sounds[2 + index]);
	}

	reset(): void {
		super.reset();

		if (this.startPosition) {
			this.worldPosition.copy(this.startPosition);
			this.worldMatrix.setPosition(this.worldPosition);
			this.deathSound = false;
			this.stingActive = false;
			state.menu.hud.scaryface = false;

			this.group.position.copy(this.worldPosition);
			this.group.recomputeTransform();
		}
	}
}