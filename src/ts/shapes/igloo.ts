import { MissionElement, MissionElementStaticShape } from "../parsing/mis_parser";
import { Collision } from "../physics/collision";
import { Shape } from "../shape";
import { MisParser } from "../parsing/mis_parser";
import { Level, PHYSICS_TICK_RATE, TimeState } from "../level";
import { Vector3 } from "../math/vector3";
import { Util } from "../util";
import { AudioSource } from "../audio";
import { Quaternion } from "../math/quaternion";

/** Igloo Item Shoots Snow balls to the marble... */
// Code written by Abhi :)
export class IglooItem extends Shape {
	dtsPath = "shapes/colmesh.dts";
	snowballs: { entity: Shape, addedTime: number, direction: Vector3, position: Vector3 }[] = [];
	sounds = ["gunfire.wav"];
	soundSource: AudioSource;
	_lastShotTime: number;
	iglooShape: Shape;

	async init(level?: Level, srcElement?: MissionElement) {
		// No hiccups when loading the level
		await super.init(level, srcElement);

		this.iglooShape = new Shape("shapes/hazards/igloo.dts");
		await this.iglooShape.init(level);
		this.group.add(this.iglooShape.group);

		// Take Heed though.... The SnowBall is a separate entity
		this.snowballs = [];

		let elScale = MisParser.parseVector3((srcElement as MissionElementStaticShape).scale);
		for (let i = 0; i < 5; i++) {
			let snowball = new Shape("shapes/hazards/snowball.dts");
			await snowball.init(level);
			this.snowballs.push({ entity: snowball, addedTime: -Infinity, direction: new Vector3(0, 0, 0), position: new Vector3(2.2, 0, 0.35 / elScale.z) });
			// The Snowballs would be added along with the igloo in the level
			this.group.add(snowball.group);
		}
		this.snowballs.forEach(snowball => {
			snowball.entity.setTransform(new Vector3(2.2, 0, 0.35 / elScale.z), this.worldOrientation, new Vector3(1 / elScale.x, 1 / elScale.y, 1 / elScale.z));
		});
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

		if (!onlyVisual && this.level.marble && this.level.marble.body) {
			// Follow the marble
			let dir = this.level.marble.body.position.clone().sub(this.worldPosition).normalize();
			dir.z = 0;
			dir.normalize();

			// Compute yaw angle (rotation around Z)
			let yaw = Math.atan2(dir.y, dir.x) + Math.PI / 2;

			const rotationQuat = new Quaternion();
			rotationQuat.setFromAxisAngle(new Vector3(0, 0, 1), yaw);

			this.iglooShape.group.orientation.copy(rotationQuat);
			this.iglooShape.group.recomputeTransform();

			// Update the snowballs
			this.snowballs.forEach(snowball => {
				if (snowball.addedTime < time.currentAttemptTime + 10) {
					snowball.position.add(snowball.direction.clone().multiplyScalar(7 / PHYSICS_TICK_RATE));
					snowball.entity.setTransform(snowball.position, this.group.orientation, new Vector3(1, 1, 1));
					snowball.entity.group.recomputeTransform();
				}
			});

			// Shoot a snowball every second by reusing the oldest one
			const now = time.currentAttemptTime;
			const lastShot = this._lastShotTime ?? -Infinity;

			if (now - lastShot >= 1000 && this.snowballs.length > 0) {
				let oldest = this.snowballs[0];
				for (let i = 1; i < this.snowballs.length; i++) {
					if (this.snowballs[i].addedTime < oldest.addedTime) oldest = this.snowballs[i];
				}

				// Rotate dir by 90 degrees z axis
				dir = dir.applyAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);

				oldest.addedTime = now;
				const z = oldest.position.z ?? 0;
				oldest.direction = dir;
				oldest.position = dir.clone().multiplyScalar(2.2).add(new Vector3(0, 0, z));

				oldest.entity.setTransform(oldest.position, this.group.orientation, new Vector3(1, 1, 1));
				oldest.entity.group.recomputeTransform();

				this._lastShotTime = now;
			}

			this.colliders.forEach((c) => {
				c.body.position.copy(this.worldPosition);
				c.body.syncShapes();
			});
		}
	}

}