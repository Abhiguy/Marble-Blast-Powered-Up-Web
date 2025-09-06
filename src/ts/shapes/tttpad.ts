import { Shape } from "../shape";
import { MisParser, MissionElement, MissionElementStaticShape, MissionElementType } from "../parsing/mis_parser";
import { Collision } from "../physics/collision";
import { BlendingType } from "../rendering/renderer";
import { ParticleEmitter } from "../particles";
import { Vector3 } from "../math/vector3";
import { Level, TimeState } from "../level";
import { state } from "../state";
import { Util, Scheduler } from "../util";

// The tic tac toe state
export class TTTState {
	level: Level;
	pads: TTTPad[] = []; // The pads in the game
	tttState: TTTState;

	constructor(level: Level) {
		this.level = level;
	}

	reset() {
		this.pads = this.level.shapes.filter((x) => x instanceof TTTPad).map((x) => x as TTTPad); // Get all the pads
		// Sort it by index
		this.pads.sort((a, b) => a.index - b.index);
	}

	checkWinCondition(): number {
		// Check if any player has won
		// This is a very simple implementation, it only checks for horizontal, vertical and diagonal lines
		const winningCombinations = [
			[0, 1, 2], // Row 1
			[3, 4, 5], // Row 2
			[6, 7, 8], // Row 3
			[0, 3, 6], // Column 1
			[1, 4, 7], // Column 2
			[2, 5, 8], // Column 3
			[0, 4, 8], // Diagonal \
			[2, 4, 6], // Diagonal /
		];

		for (const combination of winningCombinations) {
			const [a, b, c] = combination;
			if (this.pads[a].state === this.pads[b].state && this.pads[b].state === this.pads[c].state && this.pads[a].state !== 0) {
				// We have a winner!
				return this.pads[a].state; // Return the state of the winning pad (1 for Marble, 2 for Other)
			}
		}

		// No winner found
		return 0; // No winner
	}

	advanceState(ourTurn: boolean) {
		// Check if the game is over
		const winner = this.checkWinCondition();
		if (winner !== 0) {
			// We have a winner, handle the win condition
			this.handleTTTWin(winner);
			return;
		}

		// Check if all pads are occupied
		if (this.pads.every((pad) => pad.state !== 0)) {
			this.handleTTTDraw(); // Handle draw condition
			return;
		}

		// Perform opponent's turn
		if (!ourTurn) this.performOpponentTurn();
	}

	handleTTTWin(winner: number) {

		// Handle draw	
		if (winner === 1) {
			state.menu.hud.displayHelp("You Won!");
			// Trigger beautiful fireworks on all the pad combination at which the marble made to win this puzzle!
			let time = this.level.timeState;
			for (const combo of [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]) {
				const [a, b, c] = combo;
				if (this.pads[a].state === winner && this.pads[b].state === winner && this.pads[c].state === winner) {
					this.pads[a].spawnFirework(time);
					this.pads[b].spawnFirework(time);
					this.pads[c].spawnFirework(time);
					break;
				}
			}
			this.level.touchFinish(); // Trigger finish if a player win
			this.level.audio.play('firewrks.wav'); // Play win sound
			return;
		}
		if (winner === 2) {
			state.menu.hud.displayHelp("You Lost!");
			// Trigger game over landmine explosion visual on all the pad combination at which the marble made to lose this puzzle...
			for (const combo of [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]) {
				const [a, b, c] = combo;
				if (this.pads[a].state === winner && this.pads[b].state === winner && this.pads[c].state === winner) {
					this.pads[a].level.particles.createEmitter(landMineParticle, this.pads[a].worldPosition);
					this.pads[b].level.particles.createEmitter(landMineSmokeParticle, this.pads[b].worldPosition);
					this.pads[c].level.particles.createEmitter(landMineSparksParticle, this.pads[c].worldPosition);
					break;
				}
			}
			this.level.audio.play('explode1.wav'); // Play explosion sound
			this.level.goOutOfBounds(); // Game over
			return;
		}
	}

	handleTTTDraw() {
		state.menu.hud.displayHelp("Tie Game!");
	}



	performOpponentTurn() {
		// Find all available pads
		let availablePads = this.pads.filter(p => p.state === 0);
		if (availablePads.length === 0) return;

		// --- 1. Try to win immediately ---
		for (let pad of availablePads) {
			pad.state = 2; // Pretend AI plays here
			if (this.checkWinCondition() === 2) {
				pad.state = 2;
				pad.mineShape.setOpacity(1);
				this.handleTTTWin(2);
				return;
			}
			pad.state = 0; // Reset
		}

		// --- 2. Block player's win if possible ---
		for (let pad of availablePads) {
			pad.state = 1; // Pretend player plays here
			if (this.checkWinCondition() === 1) {
				pad.state = 2;
				pad.mineShape.setOpacity(1);
				this.advanceState(true); // Continue game
				return;
			}
			pad.state = 0; // Reset
		}

		// --- 3. Take center if available ---
		let centerPad = availablePads.find(p => p.index === 4);
		if (centerPad) {
			centerPad.state = 2;
			centerPad.mineShape.setOpacity(1);
			this.advanceState(true);
			return;
		}

		// --- 4. Pick a random available pad ---
		let randomPad = availablePads[Math.floor(Math.random() * availablePads.length)];
		randomPad.state = 2;
		randomPad.mineShape.setOpacity(1);
		this.advanceState(true);
	}
}

/** The Tic Tac Toe Pad! */
export class TTTPad extends Shape {
	dtsPath = "shapes/ttt/tttpad.dts";
	level: Level;
	fireworks: Firework[] = [];
	collideable = true;
	index: number; // Index of the tttpad, used for handling functions
	state = 0; // 0 = empty, 1 = Marble, 2 = Other
	marbleShape: Shape;
	mineShape: Shape;

	constructor(element: MissionElementStaticShape) {
		super();
		this.index = MisParser.parseNumber(element.index);
	}

	async init(level?: Level, srcElement?: MissionElement): Promise<void> {
		// No hiccups when loading the level
		await super.init(level, srcElement);
		let pos = this.worldPosition.clone().add(new Vector3(0, 0, 0.5));

		this.marbleShape = new Shape("shapes/ttt/ball-superball.dts");
		this.marbleShape.isTSStatic = true;
		await this.marbleShape.init(level);

		this.mineShape = new Shape("shapes/ttt/landmine.dts");
		this.mineShape.isTSStatic = true;
		await this.mineShape.init(level);

		this.group.add(this.marbleShape.group);
		this.group.add(this.mineShape.group);

		let elScale = MisParser.parseVector3((srcElement as MissionElementStaticShape).scale);

		this.marbleShape.setTransform(new Vector3(0, 0, 0.5 / elScale.z), this.worldOrientation, new Vector3(1 / elScale.x, 1 / elScale.y, 1 / elScale.z));
		this.mineShape.setTransform(new Vector3(0, 0, 0.5 / elScale.z), this.worldOrientation, new Vector3(1 / elScale.x, 1 / elScale.y, 1 / elScale.z));

		this.marbleShape.setOpacity(0); // Hide the marble
		this.mineShape.setOpacity(0); // Hide the mine
	}

	tick(time: TimeState, onlyVisual: boolean) {
		if (onlyVisual) return;
		super.tick(time);
		// Tick the firework
		for (let firework of this.fireworks.slice()) {
			firework.tick(time.timeSinceLoad);
			if (time.timeSinceLoad - firework.spawnTime >= 10000) Util.removeFromArray(this.fireworks, firework); // We can safely remove the firework
		}
	}

	onMarbleContact(collision: Collision) {
		if (!collision) return;

		if (this.state !== 0) return; // Already occupied
		this.state = 1; // Set state to Marble

		// Add a TSStatic of marble
		this.marbleShape.setOpacity(1); // Show the marble

		this.level.tttState.advanceState(false); // Advance the state of the game
	}

	performOpponentTurn() {
		if (this.state !== 0) return; // Already occupied
		this.state = 2; // Set state to Other

		this.mineShape.setOpacity(1); // Show the mine

		this.level.tttState.advanceState(true); // Advance the state of the game
	}

	/** Starts the finish celebration firework at a given time. */
	spawnFirework(time: TimeState) {
		let firework = new Firework(this.level, this.worldPosition, time.timeSinceLoad);
		this.fireworks.push(firework);
	}

	reset(): void {
		super.reset();
		this.state = 0; // Reset state to empty
		this.marbleShape.setOpacity(0);
		this.mineShape.setOpacity(0);
	}
}

/** The fire particle. */
const landMineParticle = {
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
		colors: [{ r: 0.56, g: 0.36, b: 0.26, a: 1 }, { r: 0.56, g: 0.36, b: 0.26, a: 0 }],
		sizes: [0.5, 1],
		times: [0, 1]
	}
};
/** The smoke particle. */
export const landMineSmokeParticle = {
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
		colors: [{ r: 0.56, g: 0.36, b: 0.26, a: 1 }, { r: 0.2, g: 0.2, b: 0.2, a: 1 }, { r: 0, g: 0, b: 0, a: 0 }],
		sizes: [1, 1.5, 2],
		times: [0, 0.5, 1]
	}
};
/** The sparks exploding away. */
export const landMineSparksParticle = {
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
		colors: [{ r: 0.6, g: 0.4, b: 0.3, a: 1 }, { r: 0.6, g: 0.4, b: 0.3, a: 1 }, { r: 1, g: 0.4, b: 0.3, a: 0 }],
		sizes: [0.5, 0.25, 0.25],
		times: [0, 0.5, 1]
	}
};

interface Trail {
	type: 'red' | 'blue',
	smokeEmitter: ParticleEmitter,
	targetPos: Vector3,
	spawnTime: number,
	lifetime: number
}

/** The ambient smoke coming up from the finish pad. */
export const fireworkSmoke2 = {
	ejectionPeriod: 100,
	ambientVelocity: new Vector3(0, 0, 1),
	ejectionVelocity: 0,
	velocityVariance: 0,
	emitterLifetime: 4000,
	spawnOffset() {
		let randomPointInCircle = Util.randomPointInUnitCircle();
		return new Vector3(randomPointInCircle.x * 1.6, randomPointInCircle.y * 1.6, Math.random() * 0.4 - 0.5);
	},
	inheritedVelFactor: 0,
	particleOptions: {
		texture: 'particles/saturn.png',
		blending: BlendingType.Normal,
		spinSpeed: 0,
		spinRandomMin: -90,
		spinRandomMax: 90,
		lifetime: 2000,
		lifetimeVariance: 200,
		dragCoefficient: 0.5,
		acceleration: 0,
		colors: [{ r: 1, g: 1, b: 0, a: 0 }, { r: 1, g: 0, b: 0, a: 1 }, { r: 1, g: 0, b: 0, a: 0 }],
		sizes: [0.1, 0.2, 0.3],
		times: [0, 0.2, 1]
	}
};

/** The trail of the red rockets. */
export const redTrail2 = {
	ejectionPeriod: 30,
	ambientVelocity: new Vector3(0, 0, 0),
	ejectionVelocity: 0,
	velocityVariance: 0,
	emitterLifetime: 10000,
	inheritedVelFactor: 0,
	particleOptions: {
		texture: 'particles/spark.png',
		blending: BlendingType.Normal,
		spinSpeed: 0,
		spinRandomMin: -90,
		spinRandomMax: 90,
		lifetime: 600,
		lifetimeVariance: 100,
		dragCoefficient: 0,
		acceleration: 0,
		colors: [{ r: 1, g: 1, b: 0, a: 1 }, { r: 1, g: 0, b: 0, a: 1 }, { r: 1, g: 0, b: 0, a: 0 }],
		sizes: [0.1, 0.05, 0.01],
		times: [0, 0.5, 1]
	}
};

/** The trail of the blue rockets. */
export const blueTrail2 = {
	ejectionPeriod: 30,
	ambientVelocity: new Vector3(0, 0, 0),
	ejectionVelocity: 0,
	velocityVariance: 0,
	emitterLifetime: 10000,
	inheritedVelFactor: 0,
	particleOptions: {
		texture: 'particles/spark.png',
		blending: BlendingType.Normal,
		spinSpeed: 0,
		spinRandomMin: -90,
		spinRandomMax: 90,
		lifetime: 600,
		lifetimeVariance: 100,
		dragCoefficient: 0,
		acceleration: 0,
		colors: [{ r: 0, g: 0, b: 1, a: 1 }, { r: 0.5, g: 0.5, b: 1, a: 1 }, { r: 1, g: 1, b: 1, a: 0 }],
		sizes: [0.1, 0.05, 0.01],
		times: [0, 0.5, 1]
	}
};

/** The explosion effect of the red rockets. */
export const redSpark2 = {
	ejectionPeriod: 1,
	ambientVelocity: new Vector3(0, 0, 0),
	ejectionVelocity: 0.8,
	velocityVariance: 0.25,
	emitterLifetime: 10,
	inheritedVelFactor: 0,
	particleOptions: {
		texture: 'particles/star.png',
		blending: BlendingType.Normal,
		spinSpeed: 40,
		spinRandomMin: -90,
		spinRandomMax: 90,
		lifetime: 500,
		lifetimeVariance: 50,
		dragCoefficient: 0.5,
		acceleration: 0,
		colors: [{ r: 1, g: 1, b: 0, a: 1 }, { r: 1, g: 1, b: 0, a: 1 }, { r: 1, g: 0, b: 0, a: 0 }],
		sizes: [0.2, 0.2, 0.2],
		times: [0, 0.5, 1]
	}
};

/** The explosion effect of the blue rockets. */
export const blueSpark2 = {
	ejectionPeriod: 1,
	ambientVelocity: new Vector3(0, 0, 0),
	ejectionVelocity: 0.5,
	velocityVariance: 0.25,
	emitterLifetime: 10,
	inheritedVelFactor: 0,
	particleOptions: {
		texture: 'particles/bubble.png',
		blending: BlendingType.Normal,
		spinSpeed: 40,
		spinRandomMin: -90,
		spinRandomMax: 90,
		lifetime: 2000,
		lifetimeVariance: 200,
		dragCoefficient: 0,
		acceleration: 0,
		colors: [{ r: 0, g: 0, b: 1, a: 1 }, { r: 0.5, g: 0.5, b: 1, a: 1 }, { r: 1, g: 1, b: 1, a: 0 }],
		sizes: [0.2, 0.2, 0.2],
		times: [0, 0.5, 1]
	}
};

/** Handles the firework animation that plays on the ttt pad upon level completion. */
class Firework extends Scheduler {
	level: Level;
	pos: Vector3;
	spawnTime: number;
	trails: Trail[] = [];
	/** The fireworks are spawned in waves, this controls how many are left. */
	wavesLeft = 4;

	constructor(level: Level, pos: Vector3, spawnTime: number) {
		super();

		this.level = level;
		this.pos = pos;
		this.spawnTime = spawnTime;

		this.level.particles.createEmitter(fireworkSmoke2, this.pos); // Start the smoke
		this.doWave(this.spawnTime); // Start the first wave
	}

	tick(time: number) {
		this.tickSchedule(time);

		// Update the trails
		for (let trail of this.trails.slice()) {
			let completion = Util.clamp((time - trail.spawnTime) / trail.lifetime, 0, 1);
			completion = 1 - (1 - completion) ** 2; // ease-out

			// Make the trail travel along an arc (parabola, whatever)
			let pos = this.pos.clone().multiplyScalar(1 - completion).add(trail.targetPos.clone().multiplyScalar(completion));
			pos.sub(new Vector3(0, 0, 1).multiplyScalar(completion ** 2));
			trail.smokeEmitter.setPos(pos, time);

			if (completion === 1) {
				// The trail has reached its end, remove the emitter and spawn the explosion.
				this.level.particles.removeEmitter(trail.smokeEmitter);
				Util.removeFromArray(this.trails, trail);

				if (trail.type === 'red') {
					this.level.particles.createEmitter(redSpark2, pos);
				} else {
					this.level.particles.createEmitter(blueSpark2, pos);
				}
			}
		}
	}

	/** Spawns a bunch of trails going in random directions. */
	doWave(time: number) {
		let count = Math.floor(17 + Math.random() * 10);
		for (let i = 0; i < count; i++) this.spawnTrail(time);

		this.wavesLeft--;
		if (this.wavesLeft > 0) {
			let nextWaveTime = time + 500 + 1000 * Math.random();
			this.schedule(nextWaveTime, () => this.doWave(nextWaveTime));
		}
	}

	/** Spawns a red or blue trail going in a random direction with a random speed. */
	spawnTrail(time: number) {
		let type: 'red' | 'blue' = (Math.random() < 0.5) ? 'red' : 'blue';

		let lifetime = 250 + Math.random() * 2000;
		let distanceFac = 0.5 + lifetime / 5000; // Make sure the firework doesn't travel a great distance way too quickly
		let emitter = this.level.particles.createEmitter((type === 'red') ? redTrail2 : blueTrail2, this.pos);
		let randomPointInCircle = Util.randomPointInUnitCircle();
		let targetPos = new Vector3(randomPointInCircle.x * 3, randomPointInCircle.y * 3, 1 + Math.sqrt(Math.random()) * 3).multiplyScalar(distanceFac).add(this.pos);

		let trail: Trail = {
			type: type,
			smokeEmitter: emitter,
			targetPos: targetPos,
			spawnTime: time,
			lifetime: lifetime
		};
		this.trails.push(trail);
	}
}
