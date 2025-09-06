import { Trigger } from "./trigger";
import { state } from "../state";
import { MisParser, MissionElementTrigger } from "../parsing/mis_parser";
import { Level } from "../level";

export class WhirliTrigger extends Trigger {
	element: MissionElementTrigger;

	order: number;
	prev: number;
	lap: boolean;
	level: Level;

	// Global lap stats tracking (static vars like prefs)
	static totalLapTime = 0;
	static lapsCompleted = 0;

	// Laps state
	static lastWT = 0;
	static lapTime = 0;
	static lapped = false;

	constructor(element: MissionElementTrigger, level: Level) {
		super(element, level);
		this.element = element;
		this.level = level;

		this.order = element.order ? MisParser.parseNumber(element.order) : 0;
		this.prev = element.prev ? MisParser.parseNumber(element.prev) : 0;
		this.lap = MisParser.parseBoolean(element.lap);
	}

	reset(): void {
		WhirliTrigger.lastWT = 0;
		WhirliTrigger.lapTime = 0;
		WhirliTrigger.lapped = false;
	}

	onMarbleEnter() {
		// Marble lap properties....already present in marble class
		if (WhirliTrigger.lastWT === this.prev) {
			WhirliTrigger.lastWT = this.order;

			if (this.lap) {
				const elapsedTime = this.level.getCurrentTime();
				const lap = elapsedTime - WhirliTrigger.lapTime;
				WhirliTrigger.lapTime = elapsedTime;

				WhirliTrigger.totalLapTime += lap;
				WhirliTrigger.lapsCompleted++;

				if (WhirliTrigger.lapped) {
					if (WhirliTrigger.lapsCompleted % 10 === 0) {
						const avg = WhirliTrigger.totalLapTime / WhirliTrigger.lapsCompleted;
						state.menu.hud.displayHelp(
							`Average Lap Time: ${formatTime(avg)}\n` +
							`Total Laps: ${WhirliTrigger.lapsCompleted}, Total Time Wasted: ${formatTime(WhirliTrigger.totalLapTime)}\n` +
							`Get a life!`,
							true
						);
					}
				} else {
					WhirliTrigger.lapped = true;
				}
			}
		}
	}
}

// Helper function to format time (minutes:seconds.milliseconds)
function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = (seconds % 60).toFixed(2);
	return `${mins}:${secs.padStart(5, "0")}`;
}
