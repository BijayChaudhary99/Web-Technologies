import { clamp, aabb, WIDTH, HEIGHT } from "./utils.js"

/**
 * Farmer class controlling the player
 */
export class Farmer {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.w = 34
        this.h = 34
        this.speed = 120
        this.vx = 0
        this.vy = 0

        // Sprite setup for G2
        this.sprite = new Image()
        this.spriteLoaded = false
        this.cols = 4 
        this.rows = 4 
        this.cellW = 32 
        this.cellH = 32
        this.sprite.onload = () => {
            this.spriteLoaded = true
            
            this.cellW = Math.floor(this.sprite.naturalWidth / this.cols)
            this.cellH = Math.floor(this.sprite.naturalHeight / this.rows)
    
        }
        this.sprite.src = "sprites/farmer.png" // sprite sheet (4x4)

        this.frameX = 0 
        this.frameRate = 8 
        this.animTimer = 0

        this.moving = false
        this.dir = "down"
    }

    /**
     * Handle keyboard input for movement (set vx/vy)
     * @param {Input} input
     */
    handleInput(input) {
        const L = input.keys.has("ArrowLeft"), R = input.keys.has("ArrowRight");
    const U = input.keys.has("ArrowUp"), D = input.keys.has("ArrowDown");

    this.vx = (R - L) * this.speed;
    this.vy = (D - U) * this.speed;

    this.moving = (this.vx !== 0 || this.vy !== 0);

    if (this.moving) {
        if (Math.abs(this.vx) > Math.abs(this.vy)) {
            // horizontal dominates
            this.dir = this.vx > 0 ? "right" : "left";
        } else if (Math.abs(this.vy) > 0) {
            // vertical dominates (or equal, we prefer vertical)
            this.dir = this.vy > 0 ? "down" : "up";
        }
    }
}

    /**
     * Update farmer position and animation, with collision blocking obstacles in game
     * @param {number} dt
     * @param {Game} game
     */
    update(dt, game) {
        // try movement
        const oldX = this.x, oldY = this.y
        this.x = clamp(this.x + this.vx * dt, 0, WIDTH - this.w)
        this.y = clamp(this.y + this.vy * dt, 0, HEIGHT - this.h)
        // block through obstacles (game is passed)
        if (game) {
            const hitObs = game.obstacles.some(o => aabb(this, o))
            if (hitObs) { this.x = oldX; this.y = oldY }
        }

        // animation timing - use seconds dt, advance frames at frameRate
        if (this.moving) {
            this.animTimer += dt
            const frameDuration = 1 / this.frameRate
            if (this.animTimer >= frameDuration) {
                this.animTimer -= frameDuration
                this.frameX = (this.frameX + 1) % this.cols // cycle columns
            }
        } else {
            this.frameX = 0 // idle frame
            this.animTimer = 0
        }
    }

    /**
     * Draw farmer on canvas. If sprite not loaded, draw fallback rectangle and hat
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        // map direction to row in sprite sheet (your sheet lacks "left" row)
        const rowMap = { down:0, right:1, up:3 } 
        const row = rowMap[this.dir] ?? 0

        if (this.spriteLoaded && this.sprite.naturalWidth > 0) {
            const sx = this.frameX * this.cellW
            const sy = row * this.cellH
            const sw = this.cellW
            const sh = this.cellH

            if (this.dir === "left") {
                // Flip horizontally since the sprite sheet has no left row
                ctx.save()
                ctx.scale(-1, 1) // mirror horizontally
                ctx.drawImage(
                    this.sprite,
                    sx, sy, sw, sh,   // src
                    -this.x - this.w, this.y, this.w, this.h // dst (mirrored)
                )
                ctx.restore()
            } else {
                ctx.drawImage(
                    this.sprite,
                    sx, sy, sw, sh,       // src
                    this.x, this.y, this.w, this.h // dst
                )
            }
        } else {
            // fallback drawing so player is always visible even if sprite not loaded
            ctx.fillStyle = "#8b5a2b"
            ctx.fillRect(this.x, this.y, this.w, this.h)
            ctx.fillStyle = "#c28e0e"
            ctx.fillRect(this.x + 4, this.y - 6, this.w - 8, 8)        // hat brim
            ctx.fillRect(this.x + 10, this.y - 18, this.w - 20, 12)    // hat top
        }
    }
}
