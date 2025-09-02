import { AbstractLavaFloor } from "./abstract_lavafloor";

/** Lava Floor. */
export class LavaFloor extends AbstractLavaFloor {
	dtsPath = "shapes/hazards/lava.dts";
	sounds = ["lavahiss.wav"];
}