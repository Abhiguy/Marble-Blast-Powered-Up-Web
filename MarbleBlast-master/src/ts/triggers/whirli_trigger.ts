import { Trigger } from "./trigger";
import { state } from "../state";
import { MissionElementTrigger } from "../parsing/mis_parser";
import { Level } from "../level";

interface WhirliTriggerElement extends MissionElementTrigger {
  order?: string;
  prev?: string;
  lap?: string;
}

interface MarbleWithLapProps {
  lastWT?: number;
  lapTime?: number;
  lapped?: boolean;
}

export class WhirliTrigger extends Trigger {
  element: WhirliTriggerElement;

  order: number;
  prev: number;
  lap: boolean;
  level: Level;

  // Global lap stats tracking (static vars like prefs)
  static prefGFLapTime = 0;
  static prefGFLaps = 0;

  constructor(element: WhirliTriggerElement, level: Level) {
    super(element, level);
    this.element = element;
    this.level = level;

    this.order = Number(element.order) || 0;
    this.prev = Number(element.prev) || 0;
    this.lap = element.lap === "1" || element.lap === "true";
  }

  onMarbleEnter() {
    const marble = this.level.marble as MarbleWithLapProps;

    // Marble lap properties....already present in marble class
    if (marble.lastWT === undefined) marble.lastWT = 0;
    if (marble.lapTime === undefined) marble.lapTime = 0;
    if (marble.lapped === undefined) marble.lapped = false;

    if (marble.lastWT === this.prev) {
      marble.lastWT = this.order;

      if (this.lap) {
        const elapsedTime = this.level.getCurrentTime();
        const lap = elapsedTime - marble.lapTime;
        marble.lapTime = elapsedTime;

        WhirliTrigger.prefGFLapTime += lap;
        WhirliTrigger.prefGFLaps++;

        if (marble.lapped) {
          if (WhirliTrigger.prefGFLaps % 10 === 0) {
            const avg = WhirliTrigger.prefGFLapTime / WhirliTrigger.prefGFLaps;
            state.menu.hud.displayHelp(
              `Average Lap Time: ${formatTime(avg)}\n` +
              `Total Laps: ${WhirliTrigger.prefGFLaps}, Total Time Wasted: ${formatTime(WhirliTrigger.prefGFLapTime)}\n` +
              `Get a life!`,
              true
            );
          }
        } else {
          marble.lapped = true;
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
