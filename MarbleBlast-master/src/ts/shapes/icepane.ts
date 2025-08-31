import { TimeState } from "../level";
import { Collision } from "../physics/collision";
import { Shape } from "../shape";

const RESET_TIME = Infinity; // They won't appear until the level is restarted

/** IcePanes are screens which hinder the marble's way */
export class IcePane extends Shape {
  dtsPath = "shapes/hazards/ice_pane.dts";
  hitted = false;
  animationTimeout?: ReturnType<typeof setTimeout>;
  hasNonVisualSequences = true;
  shareNodeTransforms = false;
  lastContactTime = -Infinity;

  
//Calculates the total duration of the breaking animation in milliseconds,
// based on the first animation sequence duration in the DTS model.
get animationDuration() {
    return this.dts.sequences[0].duration * 1000;
}

tick(time: TimeState, onlyVisual: boolean) {
    if (!this.hitted) {
      // Reset animation override to 0 when not hit
      this.sequenceKeyframeOverride.set(this.dts.sequences[0], 0);
      super.tick(time, onlyVisual);
      return;
    }
    // Calculate how long since last hit
    const elapsed = time.timeSinceLoad - this.lastContactTime;
    let completion = Math.min(elapsed / this.animationDuration, 1);

	// Calculate completion percentage of the animation (0 to 1)
    if (elapsed > RESET_TIME) {
      completion = Math.max(1 - (elapsed - RESET_TIME) / this.animationDuration, 0);
    }
     // Set animation frame based on completion percentage
    this.sequenceKeyframeOverride.set(
      this.dts.sequences[0],
      completion * (this.dts.sequences[0].numKeyframes - 1)
    );

    super.tick(time, onlyVisual);

    if (completion === 0) {
      // Fully reset when animation done reversing
      this.setCollisionEnabled(true);
      this.setOpacity(1);
      this.hitted = false;
      this.lastContactTime = -Infinity;
    }
}

onMarbleContact(collision: Collision): void {
    if (!collision) return;
    let marble = this.level.marble;
	// They are way too fragile..They are really delicate...
    if (marble.body.linearVelocity.length() > 3) {
      this.hitted = true;
      this.lastContactTime = this.level.timeState.timeSinceLoad; // Since when the player had hit them

      this.level.audio.play('shatter.wav'); // Breaked the glass lol

	  // Refresh the animation of the dts before setting a new one...avoiding hiccups
      clearTimeout(this.animationTimeout);
	  // After split second disable collision and hide the ice pane visually
      this.animationTimeout = setTimeout(() => {
        this.setCollisionEnabled(false);
        this.setOpacity(0); // shattered off and the fragments go to the void
      }, 500);
    }
}

reset(): void {
    this.hitted = false;
    this.lastContactTime = -Infinity;
    clearTimeout(this.animationTimeout); // Clear any pending timeouts for animation or state changes
    this.setCollisionEnabled(true); // Hit them again...😈
    this.setOpacity(1);
    // Reset animation override to zero to avoid stuck frames
    this.sequenceKeyframeOverride.set(this.dts.sequences[0], 0);
    super.reset();
  }
}
