// =========================
// Farmer Harvest — no libs
// =========================

// ---- Farmer (player) ----
import { clamp, aabb } from "./Game.js";

/**
 * Farmer class controlling the player
 */
export class Farmer {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 34;
        this.h = 34;
        this.speed = 260;
        this.vx = 0;
        this.vy = 0;
        this.color = "#8b5a2b";
    }

    /**
     * Handle keyboard input for movement
     * @param {Input} input
     */
    handleInput(input) {
        const L = input.keys.has("ArrowLeft"), R = input.keys.has("ArrowRight");
        const U = input.keys.has("ArrowUp"), D = input.keys.has("ArrowDown");
        this.vx = (R - L) * this.speed;
        this.vy = (D - U) * this.speed;
    }

    /**
     * Update farmer position and handle collisions
     * @param {number} dt
     * @param {Game} game
     */
    update(dt, game) {
        // try movement
        const oldX = this.x, oldY = this.y;
        this.x = clamp(this.x + this.vx * dt, 0, 900 - this.w);
        this.y = clamp(this.y + this.vy * dt, 0, 540 - this.h);
        // block through obstacles
        const hitObs = game.obstacles.some(o => aabb(this, o));
        if (hitObs) { this.x = oldX; this.y = oldY; }
    }

    /**
     * Draw farmer on canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = "#c28e0e";
        ctx.fillRect(this.x + 4, this.y - 6, this.w - 8, 8);        // hat brim
        ctx.fillRect(this.x + 10, this.y - 18, this.w - 20, 12);    // hat top
    }
}
