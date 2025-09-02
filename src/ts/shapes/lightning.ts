import { Shape } from "../shape";
import { TimeState } from "../level";
import { Vector3 } from "../math/vector3";

/** The Lightning! */
export class Lightning extends Shape {
    dtsPath = "shapes/hazards/lightning.dts";
    collideable = false;
    nextStrikeTime = 0;

    async onLevelStart() {
        this.setOpacity(0);
        this.nextStrikeTime = 0;
    }

    tick(time: TimeState, onlyVisual: boolean) {
        if (onlyVisual) return;
        super.tick(time);

        const now = time.timeSinceLoad;

        if (now >= this.nextStrikeTime) {
            this.strike();
            // Next strike in 2–8 seconds
            this.nextStrikeTime = now + 2000 + Math.random() * 6000;
        }
    }

    /** The Random Strike of the Lightning... */
    strike() {
        const marble = this.level.marble;
        if (!marble) return;

        // Pick random XY near marble (±10)
        const offsetX = -10 + Math.random() * 20;
        const offsetY = -10 + Math.random() * 20;
        const baseX = marble.body.position.x + offsetX;
        const baseY = marble.body.position.y + offsetY;

        // Ray origin high above, cast straight down
        const origin = new Vector3(baseX, baseY, 10000);
        const direction = new Vector3(0, 0, -1);
        const lambdaMax = 20000; // covers from z=10000 down to z=-10000

        const hits = this.level.world.castRay(origin, direction, lambdaMax);
        if (!hits || hits.length === 0) return;

        // First hit is nearest
        const hit = hits[0];

        // computing world-space hit position: origin + direction * hit.lambda
        const strikePos = new Vector3(
            origin.x + direction.x * hit.lambda,
            origin.y + direction.y * hit.lambda,
            origin.z + direction.z * hit.lambda
        );

        // Move this shape to the strike position, show it briefly, play sound
        this.setTransform(strikePos, this.worldOrientation, new Vector3(1, 1, 1));
        this.setOpacity(1);
        this.level.audio.play("lightning.wav"); // Kaboom!

        // hide after a short time (300 ms)
        setTimeout(() => {
            this.setOpacity(0);
        }, 300);
    }
}
