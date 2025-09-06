import { Trigger } from "./trigger";
import { state } from "../state";
import { MissionElementTrigger } from "../parsing/mis_parser";

interface TrickTriggerElement extends MissionElementTrigger {
	trick?: string;
	points?: string;
	color?: string;
}

/** A trick trigger awards a named trick with point value on enter. */
export class TrickTrigger extends Trigger {
	element: TrickTriggerElement;
	color = this.element.color; // coloured text


	onMarbleEnter() {
		const trickName = this.element.trick || "Unnamed Trick";
		const trickPoints = Number(this.element.points) || 0;

		this.level.trickState.addTrick(trickName, trickPoints); // Adds to trick combo
		this.level.trickState.finishCombo(); // Immediately applies score from combo
		state.menu.hud.displayAlert(`${trickName}\n${trickPoints.toLocaleString()}`, this.color);
	}
}

export class Tricks {
	/** Sorta the tricks stuff  */
	combo = "";
	comboScore = 0;
	multiplier = 0.9;
	lastTrick = "";
	ruined = false;
	noEndTrick = false;
	endTimeout: number;
	/** Function which evaluates tricks when entering a trick's trigger */
	addTrick(name: string, score: number) {
		if (!state.level?.mission.backwardClock) return; // Only enabled in backwardClock for now

		if (this.ruined) return;

		this.multiplier += 0.1;
		this.comboScore += score;
		this.lastTrick = name;

		// Append to combo string
		if (!this.combo) {
			this.combo = name;
		} else {
			this.combo += " + " + name;
		}

		//const pointsAwarded = Math.floor(score * multiplier); // points awarded based upon multiplier and score
		//state.level.score += pointsAwarded;

		// You can show this visually if needed — like adding HUD or chat line
		this.noEndTrick = true;
		clearTimeout(this.endTimeout);
		this.endTimeout = window.setTimeout(() => {
			this.noEndTrick = false;
		}, 500);
	}

	ruinCombo() {
		if (this.ruined || !this.combo) return;
		this.resetCombo();
		this.ruined = true;
		setTimeout(() => this.ruined = false, 500);
	}

	finishCombo() {
		if (!this.combo || this.ruined || this.multiplier < 1) return;
		const total = Math.floor(this.comboScore * this.multiplier);

		state.level.score = Math.max(0, state.level.score + total); // Apply score! But Never Negative or below 0
		this.resetCombo();
	}

	resetCombo() {
		this.combo = "";
		this.comboScore = 0;
		this.multiplier = 0.9;
		this.lastTrick = "";
	}
}