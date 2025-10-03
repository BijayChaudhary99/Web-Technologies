Farmer Harvest Game

A simple game which is based game where you control a farmer who moves around the field, avoiding obstacles and harvesting crops. Built using vanilla JavaScript (ES6) with no external libraries.

Features

Farmer Movement — Move up, down, left, and right using the arrow keys.

Sprite Animations — Farmer uses a 4×4 sprite sheet (sprites/farmer.png) for walking animations in four directions.

Obstacle Collisions — Farmer cannot pass through obstacles.

Smooth Animation — Uses delta time (dt) for consistent movement speed across devices.

Fallback Rendering — If sprites don’t load, a simple rectangle + hat is drawn as the farmer.

How to Run

Clone or download this project.

Make sure the file structure looks like this:

farmer-harvest/
- index.html
- style.css
- utils.js
- farmer.js
- game.js
- input.js
- sprites/
  |-farmer.png

Open index.html in a modern browser (Chrome, Firefox, Edge, Safari).

Use the Arrow Keys to move the farmer.

No server is needed — it runs locally in the browser.

Where Arrow Functions, this, and bind Are Used.

Arrow Functions

In farmer.js, the sprite.onload callback uses an arrow function:

this.sprite.onload = () => {
this.spriteLoaded = true;
this.cellW = Math.floor(this.sprite.naturalWidth / this.cols);
this.cellH = Math.floor(this.sprite.naturalHeight / this.rows);
};

This ensures the function inherits the surrounding this (the Farmer instance).

The Farmer class uses this extensively to reference instance properties:

this.x, this.y → farmer’s position.

this.vx, this.vy → velocity.

this.sprite → current sprite image.

this.update() and this.draw() rely on this for behavior tied to a specific farmer.

If we pass methods as callbacks (for example in requestAnimationFrame or input listeners), we use .bind(this) so the method keeps its class context. Example:

window.addEventListener("keydown", this.handleInput.bind(this));

Without bind, this inside the method could point to window instead of the Farmer object.

Controls

⬆️ Up Arrow → Move up

⬇️ Down Arrow → Move down

⬅️ Left Arrow → Move left

➡️ Right Arrow → Move right

Future Improvements

Adding crops that can be collected for points and add more obstacle where difficulty level increases.

