import { AudioSource } from "../audio";
import { DEFAULT_PITCH, Level, TimeState } from "../level";
import { Vector3 } from "../math/vector3";
import { MisParser, MissionElementTrigger } from "../parsing/mis_parser";
import { state } from "../state";
import { Util } from "../util";
import { DestinationTrigger } from "./destination_trigger";
import { Trigger } from "./trigger";

/** A teleport trigger teleports the marble to a specified destination after some time of being inside it. */
export class TeleportTrigger extends Trigger {
	/** How long after entry until the teleport happens */
	delay = 2000;
	entryTime: number = null;
	exitTime: number = null;
	sounds = ["teleport.wav"];
	teleportingSound: AudioSource = null;
	marbleChambers = false;
	toroidalLimbo = false;

	constructor(element: MissionElementTrigger, level: Level) {
		super(element, level);

		if (element.delay) this.delay = MisParser.parseNumber(element.delay);
		if (level.mission.title === "Marble Chambers" || level.mission.title === "Toroidal Limbo" || level.mission.title === "Illusory Limbo") {
			this.delay = 0;
		}
	}

	onMarbleEnter() {
		let time = this.level.timeState;

		this.exitTime = null;
		this.level.marble.enableTeleportingLook(time);
		if (this.level.mission.title === "Marble Chambers" || this.level.mission.title === "Toroidal Limbo" || this.level.mission.title === "Illusory Limbo") {
			this.level.marble.disableTeleportingLook(time); //other code should not execute in marble chambers level or toroidal limbo
		}
		this.level.replay.recordMarbleEnter(this);
		if (this.entryTime !== null) return;

		this.entryTime = time.currentAttemptTime;
		state.menu.hud.displayAlert("Teleporter has been activated, please wait.", '#ffff00');
		if (this.level.mission.title === "Marble Chambers" || this.level.mission.title === "Toroidal Limbo" || this.level.mission.title === "Illusory Limbo") {
			state.menu.hud.displayAlert("", '#ffff00'); // Don't display the message
		}
		this.teleportingSound = this.level.audio.createAudioSource('teleport.wav');
		if (this.level.mission.title === "Marble Chambers" || this.level.mission.title === "Toroidal Limbo" || this.level.mission.title === "Illusory Limbo") {
			this.teleportingSound = null; // Don't play the sound in these two levels
		}
		this.teleportingSound.play();
	}

	onMarbleLeave() {
		let time = this.level.timeState;

		this.exitTime = time.currentAttemptTime;
		this.level.marble.disableTeleportingLook(time);
		this.level.replay.recordMarbleLeave(this);
	}

	tick(time: TimeState) {
		if (this.entryTime === null) return;

		if (time.currentAttemptTime - this.entryTime >= this.delay) {
			this.executeTeleport();
			return;
		}

		// There's a little delay after exiting before the teleporter gets cancelled
		if (this.exitTime !== null && time.currentAttemptTime - this.exitTime > 50) {
			this.entryTime = null;
			this.exitTime = null;
			return;
		}
	}

	executeTeleport() {
		this.entryTime = null;

		// Find the destination trigger
		let destination = this.level.triggers.find(x => x instanceof DestinationTrigger && x.element._name.toLowerCase() === this.element.destination?.toLowerCase());
		if (!destination) return; // Who knows

		let body = this.level.marble.body;

		// Determine where to place the marble
		let position: Vector3;
		if (MisParser.parseBoolean(this.element.centerdestpoint || destination.element.centerdestpoint)) {
			position = destination.vertices[0].clone().lerp(destination.vertices[7], 0.5); // Put the marble in the middle of the thing
		} else {
			position = destination.vertices[0].clone().add(new Vector3(0, 0, 3));
		}

		if (MisParser.parseBoolean(this.element.keepvelocity || destination.element.keepvelocity)) {
			let delta = body.position.clone().sub(this.vertices[0].clone());
			position = destination.vertices[0].clone().add(delta);
		}
		body.position.copy(position);
		body.prevPosition.copy(position); // Avoid funky CCD business

		if (!MisParser.parseBoolean(this.element.keepvelocity || destination.element.keepvelocity)) body.linearVelocity.setScalar(0);
		if (MisParser.parseBoolean(this.element.inversevelocity || destination.element.inversevelocity)) body.linearVelocity.negate();
		if (!MisParser.parseBoolean(this.element.keepangular || destination.element.keepangular)) body.angularVelocity.setScalar(0);

		// Determine camera orientation
		if (!MisParser.parseBoolean(this.element.keepcamera || destination.element.keepcamera)) {
			let yaw: number;
			if (this.element.camerayaw) yaw = Util.degToRad(MisParser.parseNumber(this.element.camerayaw));
			else if (destination.element.camerayaw) yaw = Util.degToRad(MisParser.parseNumber(destination.element.camerayaw));
			else yaw = 0;

			yaw = -yaw; // Need to flip it for some reason

			this.level.yaw = yaw + Math.PI/2;
			this.level.pitch = DEFAULT_PITCH;
		}


		if (this.level.mission.title === "Marble Chambers" || this.level.mission.title === "Toroidal Limbo" || this.level.mission.title === "Illusory Limbo") {
			this.level.audio.play('');
		}
		else {
			this.level.audio.play('spawn.wav');
		}
		this.teleportingSound?.stop();
		this.teleportingSound = null;
	}

	reset() {
		super.reset();

		this.entryTime = null;
		this.exitTime = null;
	}
}