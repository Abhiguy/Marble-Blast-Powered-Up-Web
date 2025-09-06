import { Shape } from "../shape";
import { MisParser, MissionElementItem } from "../parsing/mis_parser";
import { Util } from "../util";
import { DummyGem } from "./gem_dummy";
import { Vector3 } from "../math/vector3";
import { PHYSICS_TICK_RATE, TimeState } from "../level";

// List all of gem colors for randomly choosing one
const GEM_COLORS = ["blue", "red", "yellow", "purple", "green", "turquoise", "orange", "black"]; // "Platinum" is also a color, but it can't appear by chance

/** Gems need to be collected before being able to finish. */
export class Gem extends Shape {
	index: number | undefined; // The index of the gem in the level, used for DummyGem hiding
	mover = false;
	startPosition: Vector3;
	endPosition: Vector3;
	customOffset: Vector3;
	moveT = 0; // 0=start, 1=end
	moveSpeed: number; // units per second
	moveDirection = 1; // 1=forward, -1=backward
	dtsPath = "shapes/items/gem.dts";
	ambientRotate = true;
	collideable = false;
	pickedUp = false;
	lastPickUpTime: number | null = null; // Gems would respawn in backward clock levels
	shareMaterials = false;
	gemColor: string; // The color of the gem, used for scoring
	showSequences = false; // Gems actually have an animation for the little shiny thing, but the actual game ignores that. I get it, it was annoying as hell.
	sounds = ['gotgem.wav', 'gotallgems.wav', 'missinggems.wav'];

	constructor(element: MissionElementItem) {
		super();

		if (element.myindex)
			this.index = MisParser.parseNumber(element.myindex);
		else
			this.index = -1;

		// Determine the color of the gem:
		let color = element.datablock.slice("GemItem".length);
		if (color.length === 0) color = Gem.pickRandomColor(); // Random if no color specified
		this.gemColor = color.toLowerCase();
		this.matNamesOverride["base.gem"] = color.toLowerCase() + ".gem";
		this.mover = element._name === "Mover";

		// Parse custom offsets from the .mis file, default to 0 if not set
		if (element.my_x)
			this.customOffset = new Vector3(
				MisParser.parseNumber(element.my_x),
				MisParser.parseNumber(element.my_y),
				MisParser.parseNumber(element.my_z)
			);
		else
			this.customOffset = new Vector3(0, 0, 0);

		if (!this.mover)
			this.mover = this.customOffset.length() > 0;

		// Parse moveSpeed from .mis file, default to 2 if not set
		if (element.myspeed)
			this.moveSpeed = MisParser.parseNumber(element.myspeed);
		else
			this.moveSpeed = 2;
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

	tick(time: TimeState, onlyVisual = false) {
		super.tick(time, onlyVisual);
		if (this.mover) {
			const moveSpeed = this.moveSpeed; // units per second
			let distance = this.startPosition.distanceTo(this.endPosition);
			if (distance > 0) {
				this.moveT += (moveSpeed / distance) * this.moveDirection / PHYSICS_TICK_RATE;

				// Ping-pong motion: reverse at ends
				if (this.moveT > 1) {
					this.moveT = 1;
					this.moveDirection = -1;
				} else if (this.moveT < 0) {
					this.moveT = 0;
					this.moveDirection = 1;
				}
				// Interpolate position
				this.worldPosition = this.startPosition.clone().lerp(this.endPosition,
					this.moveT);
				this.worldMatrix.setPosition(this.worldPosition);
				this.group.position.copy(this.worldPosition);
				this.group.recomputeTransform();
				// Update collision geometry to match new transform
				this.updateCollisionGeometry(0xffffffff);
			}
		}
	}

	onMarbleInside(t: number) {
		if (this.pickedUp) return;
		this.pickedUp = true;
		this.setOpacity(0);
		if (this.index !== -1) {
			for (const item of this.level.shapes) {
				if (item instanceof DummyGem && item.index === this.index) {
					item.hide();
				}
			}
		}
		this.level.pickUpGem(this, t);
		this.level.replay.recordMarbleInside(this);
		this.setCollisionEnabled(false);

		// Respawn for  only backwardClock levels
		if (this.level.mission.backwardClock) {
			this.lastPickUpTime = this.level.timeState.currentAttemptTime;

			setTimeout(() => {
				this.pickedUp = false;
				this.setCollisionEnabled(true);
				// Fade-in will be handled in render()
			}, 5000); // Respawn after 5 seconds
		}
	}

	// Note that the gem's respawning logic will only for levels which have backwardclock flag in the mis...
	render(time: TimeState) {
		super.render(time);

		// If the gem is picked up and not yet respawned, hide it completely
		if (this.pickedUp) {
			this.setOpacity(0);
			return;
		}

		let opacity = 1;

		// Only apply fade-in respawn visual effect in backwardClock levels
		if (this.level.mission.backwardClock && this.lastPickUpTime && this.pickedUp === false) {
			let availableTime = this.lastPickUpTime + 5000; // Match respawn time
			opacity = Util.clamp((time.currentAttemptTime - availableTime) / 1000, 0, 1);
		}

		this.setOpacity(opacity);
	}

	reset() {
		super.reset();

		this.pickedUp = false;
		this.setOpacity(1);
		this.setCollisionEnabled(true);
		this.lastPickUpTime = null;
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

	static pickRandomColor() {
		return Util.randomFromArray(GEM_COLORS);
	}
}