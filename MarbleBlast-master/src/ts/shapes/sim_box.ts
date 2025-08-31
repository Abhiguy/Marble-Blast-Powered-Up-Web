import { TimeState } from "../level";
import { Quaternion } from "../math/quaternion";
import { Vector3 } from "../math/vector3";
import { Collision } from "../physics/collision";
import { RigidBody } from "../physics/rigid_body";
import { Shape } from "../shape";

/** Simulacrum Boxes..Probably the Simulacrum Stuff. */
export class SimBox extends Shape {
	dtsPath = "shapes/simulacrum/cube.dts";
	collideable = true;
	rigidBody: RigidBody;
	size: Vector3;
	touched = false;
	touchedTime = 0;
	initialPosition: Vector3;
	initialOrientation: Quaternion;
	pushDirection: Vector3 = new Vector3(0, 0, 0);

	async onLevelStart() {
		super.onLevelStart();

		// Create a simple physics body so the box can be pushed
		this.rigidBody = new RigidBody();
		this.initialPosition = this.worldPosition.clone();
		this.initialOrientation = this.worldOrientation.clone();
		this.rigidBody.position = this.initialPosition.clone(); // Boxes Will move from their initial transform...
        this.rigidBody.orientation = this.initialOrientation.clone();
		this.size = new Vector3(1, 1, 1);
		this.rigidBody.linearVelocity = new Vector3(0, 0, 0);
	}

	tick(time: TimeState, onlyVisual: boolean) {
		super.tick(time, onlyVisual);
		if (!this.touched) return;

		// Move slightly in stored direction for a short time
		if (time.currentAttemptTime - this.touchedTime <= 100) {
			let movement = this.pushDirection.clone().multiplyScalar(0.05);
			this.rigidBody.position.add(movement);
			this.setTransform(this.rigidBody.position, this.rigidBody.orientation, this.size);
		}
	}

	onMarbleContact(collision: Collision): void {
		if (!collision) return;
		this.touched = true;
		this.touchedTime = this.level.timeState.currentAttemptTime;

		// Push direction is opposite of collision normal (away from marble)
		this.pushDirection = collision.normal.clone().multiplyScalar(-1).normalize();
	}

	// Reset on level reset
	reset() {
		this.touched = false;
		this.touchedTime = 0;
		this.pushDirection.set(0, 0, 0);

		if (this.rigidBody) {
			this.rigidBody.position = this.initialPosition.clone();
			this.rigidBody.orientation = this.initialOrientation.clone();
			this.setTransform(this.rigidBody.position, this.rigidBody.orientation, this.size);
		}
	}
}
