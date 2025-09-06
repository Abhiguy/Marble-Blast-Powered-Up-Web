import { ForceShape } from "./force_shape";
import { AudioSource } from "../audio";
import { Vector3 } from "../math/vector3";
import { PHYSICS_TICK_RATE, TimeState } from "../level";
import { MissionElementStaticShape, MisParser } from "../parsing/mis_parser";

/** Sucks the marble in and then slings it upwards. */
export class Tornado extends ForceShape {
	dtsPath = "shapes/hazards/tornado.dts";
	collideable = false;
	sounds = ["tornado.wav"];
	soundSource: AudioSource | null = null;
	chasePlayer = false;
	chaseSpeed: number; // the speed at which the tornado chases the player, can be changed in the .mis! And is default
	startPosition: Vector3;

	constructor(el: MissionElementStaticShape) {
		super();

		this.addSphericalForce(8, -60);
		this.addSphericalForce(3, 60);
		this.addFieldForce(3, new Vector3(0, 0, 150)); // The upwards force is always in the same direction, which is fine considering tornados never appear with modified gravity.
		this.chasePlayer = el._name === "ChasePlayer";
		// Parse chaseSpeed from .mis file, default to 2 if not set
		this.chaseSpeed = el.chasespeed ? MisParser.parseNumber(el.chasespeed) : 2;
	}

	async onLevelStart() {
		this.soundSource = this.level.audio.createAudioSource(this.sounds[0], undefined, this.worldPosition);
		if (this.level.mission.quietTornados) {
			this.soundSource.gainFactor = 1; // Original Marble Blast Tornado Volume
			this.soundSource.maxDistance = 30; // Original Marble Blast Tornado Volume 
		}
		else {
			this.soundSource.gainFactor = 2; // MBPU have a feature...The tornado's sound is much louder than the original Marble Blast
			this.soundSource.maxDistance = 100; // MBPU's Tornado sound is heard from much farther away than the original Marble Blast
		}

		this.soundSource.setLoop(true);
		this.soundSource.play();
		await this.soundSource.promise;
		this.startPosition = this.worldPosition.clone();
	}

	tick(time: TimeState, onlyVisual = false) {
		// Mute the tornado if stopwatch is active
		if (this.level.stopWatchActive) {
			this.soundSource?.stop();
		}
		else {
			this.soundSource?.play();
		}
		// Freeze tornado completely if stopwatch is active
		if (this.level.stopWatchActive) return;

		super.tick(time, onlyVisual);

		if (this.chasePlayer && this.level.marble && this.level.marble.body) {
			// Chase the marble
			let dir = this.level.marble.body.position.clone().sub(this.worldPosition).normalize();
			let speed = this.chaseSpeed;
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
	}

	reset(): void {
		super.reset();
		if (this.startPosition) {
			this.worldPosition.copy(this.startPosition);
			this.worldMatrix.setPosition(this.worldPosition);

			this.group.position.copy(this.worldPosition);
			this.group.recomputeTransform();
		}
	}
}
