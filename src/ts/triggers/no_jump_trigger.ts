import { Trigger } from "./trigger";
import { state } from "../state";

/** A no jump trigger prohibits a player from jumping when the player touches one. */
export class NoJumpTrigger extends Trigger {
	sounds = ['infotutorial.wav'];
	entered = false;
	suppressLeaveMessage = false;

	onMarbleEnter() {
		let marble = this.level.marble;
		// Disable jumping
		marble.jumpImpulse = -1;
		this.entered = true;
		state.menu.hud.displayHelp("You have entered a no jump zone.", true);
	}

	onMarbleLeave() {
		// Restore original jump impulse
		let marble = this.level.marble;
		marble.jumpImpulse = 7.3;
		if (this.suppressLeaveMessage) {
			this.suppressLeaveMessage = false;
			return; // Don't show message on reset
		}
		if (this.entered) {
			state.menu.hud.displayHelp("You have left a no jump zone.", true);
			this.entered = false;
		}
	}

	reset(): void {
		let marble = this.level.marble;
		marble.jumpImpulse = 7.3;
		// If we are still inside the trigger on reset, onMarbleLeave will be called
		// So we suppress its message once
		if (this.entered) {
			this.suppressLeaveMessage = true;
		}

		this.entered = false;
	}
}