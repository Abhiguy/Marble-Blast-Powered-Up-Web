import { Shape } from "../shape";
import { MisParser, MissionElementItem } from "../parsing/mis_parser";
import { Util } from "../util";

// List all of gem colors for randomly choosing one
const GEM_COLORS = ["blue", "red", "yellow", "purple", "green", "turquoise", "orange", "black"]; // "Platinum" is also a color, but it can't appear by chance

/** Dummy Gems */
export class DummyGem extends Shape {
	index: number | undefined; // Index of the gem, used for hiding it
	dtsPath = "shapes/spareparts/gem.dts";
	ambientRotate = true;
	collideable = false;
	pickedUp = false;
	shareMaterials = false;
	showSequences = false;

	constructor(element: MissionElementItem) {
		super();

		// Only assign myIndex if it exists in the element

		const parsed = MisParser.parseNumber(element.myindex);
		this.index = parsed;

		// Determine the color of the gem:
		let color = element.datablock.slice("DummyGemItem".length);
		if (color.length === 0) color = DummyGem.pickRandomColor(); // Random if no color specified

		this.matNamesOverride["base.gem"] = color.toLowerCase() + ".gem";
	}

	hide() {
		this.setOpacity?.(0);
	}

	reset() {
		super.reset();

		this.pickedUp = false;
		this.setOpacity(1);
		this.setCollisionEnabled(true);
	}

	static pickRandomColor() {
		return Util.randomFromArray(GEM_COLORS);
	}
}