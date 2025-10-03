// =========================
// Farmer Harvest — no libs
// =========================

/**
 * Scarecrow (obstacle) class
 */
export class Scarecrow {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 26;
        this.h = 46;
    }

    /**
     * Draw scarecrow
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        const { x, y, w, h } = this;
        ctx.fillStyle = "#9b7653";
        ctx.fillRect(x + w / 2 - 3, y, 6, h); // pole
        ctx.fillStyle = "#c28e0e";
        ctx.beginPath(); ctx.arc(x + w / 2, y + 10, 10, 0, Math.PI * 2); ctx.fill(); // head
        ctx.strokeStyle = "#6b4f2a"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x, y + 18); ctx.lineTo(x + w, y + 18); ctx.stroke(); // arms
    }
}
