import { Shape } from "../shape";
import { MisParser, MissionElementItem } from "../parsing/mis_parser";
import { Util } from "../util";

// List all of gem colors for randomly choosing one
const GEM_COLORS = ["blue", "red", "yellow", "purple", "green", "turquoise", "orange", "black"]; // "Platinum" is also a color, but it can't appear by chance

/** Dummy Gems */
export class DummyGem extends Shape {
	static all: DummyGem[] = [];
	myindex:  number | undefined; // Index of the gem, used for hiding it
	dtsPath = "shapes/spareparts/gem.dts";
	ambientRotate = true;
	collideable = false;
	pickedUp = false;
	shareMaterials = false;
	showSequences = false;

	constructor(element: MissionElementItem) {
		super();

		// Only assign myIndex if it exists in the element
    
        const parsed = MisParser.parseNumber(String(element.myindex));
        this.myindex = (typeof parsed === "number" && !isNaN(parsed)) ? parsed : undefined;

		// Determine the color of the gem:
		let color = element.datablock.slice("DummyGemItem".length);
		if (color.length === 0) color = DummyGem.pickRandomColor(); // Random if no color specified

		this.matNamesOverride["base.gem"] = color.toLowerCase() + ".gem";
		DummyGem.all.push(this);

	}

	hide() {
        this.setOpacity?.(0);
    }

	static hideByIndex(index: number) {
    const idx = Number(index);
    for (const gem of DummyGem.all) {
        // Debug log to see what's happening
        console.log(
            `[DummyGem.hideByIndex] gem.myIndex:`, gem.myindex,
            '| typeof:', typeof gem.myindex,
            '| idx:', idx,
            '| will hide:', gem.myindex !== undefined && Number(gem.myindex) === idx
        );
        if (
            gem.myindex !== undefined &&
            Number(gem.myindex) === idx
        ) {
            gem.hide();
        }
    }
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