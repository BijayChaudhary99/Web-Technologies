//q2 adding type & points for different crops
export const CropTypes = {
    wheat: { points: 1, color: "#d9a441" },
    pumpkin: { points: 3, color: "#ff8c00" },
    goldenApple: { points: 5, color: "#ffd700" },
};

/**
 * Crop (collectible) class
 */
export class Crop {
    constructor(x, y, type = "wheat") {
        this.x = x;
        this.y = y;
        this.w = 20;
        this.h = 26;
        this.type = type;
        this.points = CropTypes[type].points; // Here, assigning points based on type
        this.color = CropTypes[type].color;   // Here, color for drawing
        this.sway = Math.random() * Math.PI * 2;
        this.dead = false;
    }

    /**
     * Update crop sway animation
     * @param {number} dt
     * @param {Game} game
     */
    update(dt, game) { this.sway += dt * 2; }

    /**
     * Draw crop
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        const { x, y, w, h } = this;
        ctx.strokeStyle = "#2f7d32";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + h);
        ctx.quadraticCurveTo(x + w / 2 + Math.sin(this.sway) * 3, y + h / 2, x + w / 2, y);
        ctx.stroke();
        ctx.fillStyle = this.color; //Here we use color based on the type
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}
