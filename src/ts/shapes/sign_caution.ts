import { Shape } from "../shape";
import { MissionElementStaticShape } from "../parsing/mis_parser";
import { TimeState } from "../level";

/** A caution/danger/fire caution sign. */
export class SignCaution extends Shape {
	dtsPath = "shapes/signs/cautionsign.dts";
	shareMaterials = false;

	constructor(element: MissionElementStaticShape) {
		super();

		// Determine the type of the sign
		let type = element.datablock.slice("SignCaution".length).toLowerCase();
		switch (type) {
			case "caution": this.matNamesOverride["base.cautionsign"] = "caution.cautionsign"; break;
			case "danger": this.matNamesOverride["base.cautionsign"] = "danger.cautionsign"; break;
			case "fire": this.matNamesOverride["base.cautionsign"] = "fire.cautionsign"; break; // fire caution sign for kaiten castle level dungeon
		}
	}

	tick(time: TimeState, onlyVisual: boolean) {
		if (onlyVisual) return;
		super.tick(time);

		let dist = this.level.marble.body.position.distanceTo(this.worldPosition);
		if (this.level.mission.title === "Slendernado") { // Modifying the sign for Slendernado
			if (dist < 10.0) {
				this.setOpacity(1);
			}
			else {
				this.setOpacity(0);
			}
		}
	}
}
