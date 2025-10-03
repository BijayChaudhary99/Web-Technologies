import { WIDTH, HEIGHT, TILE, GAME_LEN, GOAL, clamp, aabb } from "./utils.js";
import { Farmer } from "./Farmer.js";
import { Crop, CropTypes } from "./Crop.js";
import { Scarecrow } from "./Obstacle.js";

/**
 * Input class for keyboard events
 */
export class Input {
    constructor(game) {
        this.game = game;
        this.keys = new Set();
        //q1. Event listeners., The reason why onKeyDown and onKeyUp are onInput methods is that they require .bind(this).
        // without biniding "this" would be referring to the DOM element ,window. rather than the Input instance
        //only arrow functions cannot be applied in this case, as we want to remove the listener later
        // using removeEventListener because each time a arrow would create new function.
        this._onKeyDown = this.onKeyDown.bind(this); // bind #1
        this._onKeyUp = this.onKeyUp.bind(this);   // bind #2
        window.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("keyup", this._onKeyUp);
    }

    onKeyDown(e) {
        if (e.key === "p" || e.key === "P") this.game.togglePause();
        this.keys.add(e.key);
    }

    onKeyUp(e) { this.keys.delete(e.key); }

    dispose() {
        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("keyup", this._onKeyUp);
    }
}

/**
 * Main Game class
 */
export class Game {
    /**
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        if (!canvas) {
            console.error("Canvas #game not found. Check index.html IDs.");
            return;
        }
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.state = Object.freeze({ MENU: "MENU", PLAYING: "PLAYING", PAUSED: "PAUSED", GAME_OVER: "GAME_OVER", WIN: "WIN" }).MENU;
        this.player = new Farmer(WIDTH / 2 - 17, HEIGHT - 80);
        this.crops = [];
        this.obstacles = [];
        this.lastTime = performance.now();
        this.timeLeft = GAME_LEN;
        this.spawnEvery = 0.8;
        this._accumSpawn = 0;

        this.score = 0;
        this.goal = GOAL;

        this.level = 1; // G1
        this.config = { goals:[15,30,60], spawnRates:[0.8,0.6,0.4], timeLimits:[60,40,30] }; // G3 default

        // Load JSON config example (G3)
        fetch("config.json")
            .then(r => r.json())
            .then(data => { this.config = data; this.reset(); })
            .catch(() => console.warn("Failed to load config.json, using defaults"));

        // input & resize
        this.input = new Input(this);
        //q1 b. The reason why it needs to be bind.(this) is that onResize is a Game method.
        //This inside onResize would be referencing to the window and not the Game instance without binding.
        //we might also write an arrow function directly as part of addEventListener,
        // but we could not remove it later with removeEventListener, since this reference would be lost.
        this._onResize = this.onResize.bind(this);
        window.addEventListener("resize", this._onResize);

        // UI
        const get = id => document.getElementById(id) || console.error(`#${id} not found`);
        this.ui = {
            score: get("score"),
            time: get("time"),
            goal: get("goal"),
            status: get("status"),
            start: get("btnStart"),
            reset: get("btnReset"),
        };
        // q1. Method reference in UI buttons., The usage of an arrow function here picks up the lexical this of the constructor scope,
        // which is the Game instance. That is, within the handler this.start() invokes the
        // Game.start method. if we had used plain function() this.start; then "this"
        // would point to the button element, not the Game instance
        if (this.ui.goal) this.ui.goal.textContent = String(this.goal);
        if (this.ui.start) this.ui.start.addEventListener("click", () => this.start()); // arrow keeps `this`
        if (this.ui.reset) this.ui.reset.addEventListener("click", () => this.reset());

        // RAF loop as arrow function → lexical `this`
        // q1. requestAnimationFrame loop Here Arrow method invoked in such a way that "this" is the Game instance.
        // also here in requestAnimationFrame will invoke the browser global callback, and therefore without the arrow we will lose the Game binding.
        //  If we used a normal function here then `this` would be undefined or window
        this.tick = (ts) => {
            // if lastTime is 0 or undefined, set to ts to avoid huge dt
            if (!this.lastTime) this.lastTime = ts;
            const dt = Math.min((ts - this.lastTime) / 1000, 0.05); // cap to 50ms
            this.lastTime = ts;
            this.update(dt);
            this.render();
            requestAnimationFrame(this.tick);
        };
    }

    onResize() {
        // fixed canvas size for simplicity; handle DPR here if desired
    }

    start() {
        // update state consts locally
        if (this.state === "MENU" || this.state === "GAME_OVER" || this.state === "WIN") {
            this.reset();
            this.state = "PLAYING";
            this.lastTime = performance.now();
            if (this.ui.status) this.ui.status.textContent = `Playing Level ${this.level}…`;
            requestAnimationFrame(this.tick);
        } else if (this.state === "PAUSED") {
            this.state = "PLAYING";
            if (this.ui.status) this.ui.status.textContent = `Playing Level ${this.level}…`;
        }
    }

    reset() {
        this.state = "MENU";
        this.player = new Farmer(WIDTH / 2 - 17, HEIGHT - 80);
        this.crops.length = 0;
        this.obstacles.length = 0;
        this.score = 0;
        this.timeLeft = this.config.timeLimits[this.level-1] || GAME_LEN;
        this.spawnEvery = this.config.spawnRates[this.level-1] || 0.8;
        this.goal = this.config.goals[this.level-1] || GOAL;
        this._accumSpawn = 0;
        this.lastTime = performance.now();

        // place a couple of scarecrows
        this.obstacles.push(new Scarecrow(200, 220), new Scarecrow(650, 160));
        this.syncUI();
        if (this.ui.status) this.ui.status.textContent = "Menu";
    }

    togglePause() {
        if (this.state === "PLAYING") {
            this.state = "PAUSED";
            if (this.ui.status) this.ui.status.textContent = "Paused";
        } else if (this.state === "PAUSED") {
            this.state = "PLAYING";
            if (this.ui.status) this.ui.status.textContent = `Playing Level ${this.level}…`;
        }
    }

    syncUI() {
        if (this.ui.score) this.ui.score.textContent = String(this.score);
        if (this.ui.time) this.ui.time.textContent = Math.ceil(this.timeLeft);
        if (this.ui.goal) this.ui.goal.textContent = String(this.goal);
    }

    spawnCrop() {
        const gx = Math.floor(Math.random() * ((WIDTH - 2 * TILE) / TILE)) * TILE + TILE;
        const gy = Math.floor(Math.random() * ((HEIGHT - 2 * TILE) / TILE)) * TILE + TILE;
        //q2 Here we can randomly pick crop type
        const types = Object.keys(CropTypes);
        const type = types[Math.floor(Math.random() * types.length)];
        this.crops.push(new Crop(gx, gy, type));
    }

    update(dt) {
        if (this.state !== "PLAYING") return;

        // countdown
        this.timeLeft = clamp(this.timeLeft - dt, 0, this.config.timeLimits[this.level-1] || GAME_LEN);
        if (this.timeLeft <= 0) {
            this.state = (this.score >= this.goal) ? "WIN" : "GAME_OVER";
            if (this.ui.status) this.ui.status.textContent = (this.state === "WIN") ? "You Win!" : "Game Over";
            this.syncUI();
            return;
        }

        // player
        this.player.handleInput(this.input);
        this.player.update(dt, this);

        // spawn crops
        this._accumSpawn += dt;

        // Gentle difficulty curve: slowly reduce spawnEvery over time (seconds) — scaled by dt
        this.spawnEvery = Math.max(0.25, this.spawnEvery - dt * 0.01);

        while (this._accumSpawn >= this.spawnEvery) {
            this._accumSpawn -= this.spawnEvery;
            this.spawnCrop();
        }

        // collect crops
        //q1. These array callbacks are an arrow functions. They all capture `this` lexically
        // out of the surrounding method (update) - then we can safely refer. `this.player, this.score, etc.`, within the callback in case required.
        const collected = this.crops.filter(c => aabb(this.player, c));     // arrow #1
        if (collected.length) {
            collected.forEach(c => c.dead = true);                             // arrow #2
            //q2 here points can be summed up instead of count
            const points = collected.reduce((sum, c) => sum + c.points, 0);
            this.score += points;
            if (this.ui.score) this.ui.score.textContent = String(this.score);

            // G1 Level check
            if (this.score >= this.goal) {
                this.level++;
                if (this.level > 3) { // max 3 levels
                    this.state = "WIN";
                    if (this.ui.status) this.ui.status.textContent = "You Win All Levels!";
                } else {
                    this.reset();
                    this.state = "PLAYING";
                    if (this.ui.status) this.ui.status.textContent = `Level ${this.level}…`;
                }
            }
        }
        this.crops = this.crops.filter(c => !c.dead);                        // arrow #3
        this.crops.forEach(c => c.update(dt, this));                         // arrow #4

        // timer UI
        if (this.ui.time) this.ui.time.textContent = Math.ceil(this.timeLeft);
    }

    render() {
        const ctx = this.ctx;
        if (!ctx) return;

        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        // field background (grid)
        ctx.fillStyle = "#dff0d5";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.strokeStyle = "#c7e0bd";
        ctx.lineWidth = 1;
        for (let y = TILE; y < HEIGHT; y += TILE) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke();
        }
        for (let x = TILE; x < WIDTH; x += TILE) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke();
        }

        // crops, obstacles, farmer
        this.crops.forEach(c => c.draw(ctx));                                 // arrow #5
        this.obstacles.forEach(o => o.draw(ctx));                             // arrow #6
        this.player.draw(ctx);

        // state labels
        ctx.fillStyle = "#333";
        ctx.font = "16px system-ui, sans-serif";
        if (this.state === "MENU") {
            ctx.fillText("Press Start to play", 20, 28);
        } else if (this.state === "PAUSED") {
            ctx.fillText("Paused (press P to resume)", 20, 28);
        } else if (this.state === "GAME_OVER") {
            ctx.fillText("Time up! Press Reset to return to Menu", 20, 28);
        } else if (this.state === "WIN") {
            ctx.fillText("Harvest complete! Press Reset for another round", 20, 28);
        }
    }

    dispose() {
        this.input.dispose();
        window.removeEventListener("resize", this._onResize);
    }
}
