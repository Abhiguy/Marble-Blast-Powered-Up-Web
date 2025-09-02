import { state } from "../state";
/** Sorta the tricks stuff  */
let combo = "";
let comboScore = 0;
let multiplier = 0.9;
let lastTrick = "";
let ruined = false;
let noEndTrick = false;
let endTimeout: number;
/** Function which evaluates tricks when entering a trick's trigger */
export function addTrick(name: string, score: number) {
	if (!state.level?.mission.backwardClock) return; // Only enabled in backwardClock for now

	if (ruined) return;

	multiplier += 0.1;
	comboScore += score;
	lastTrick = name;

	// Append to combo string
	if (!combo) {
		combo = name;
	} else {
		combo += " + " + name;
	}

	//const pointsAwarded = Math.floor(score * multiplier); // points awarded based upon multiplier and score
	//state.level.score += pointsAwarded;

	// You can show this visually if needed — like adding HUD or chat line
	noEndTrick = true;
	clearTimeout(endTimeout);
	endTimeout = window.setTimeout(() => {
		noEndTrick = false;
	}, 500);
}

export function ruinCombo() {
	if (ruined || !combo) return;
	resetCombo();
	ruined = true;
	setTimeout(() => ruined = false, 500);
}

export function finishCombo() {
	if (!combo || ruined || multiplier < 1) return;
	const total = Math.floor(comboScore * multiplier);

	state.level.score = Math.max(0, state.level.score + total); // Apply score! But Never Negative or below 0
	resetCombo();
}

function resetCombo() {
	combo = "";
	comboScore = 0;
	multiplier = 0.9;
	lastTrick = "";
}
