// Canvas and context setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Asset loading
const assets = {
  spongebob: loadImage('images/spongebobp.png'),
  background: loadImage('images/bikini-bottom-background.jpg'),
  jellyfish: loadImage('images/jellyfishBig.png') // Load jellyfish image
};

// Game constants
const middleX = canvas.width / 2;
const middleY = canvas.height / 2;
const speed = 10;
const spongebobSize = 150;
const numJellyfish = 50; // Number of jellyfish items
const blackholePullFactor = 0.004; // Gravitational pull factor for the black hole

// Game state variables
let state = {
  spongebob: { x: 150, y: canvas.height-150, dx: 0, dy: 0 },
  lives: 5,
  score: 0,
  gameOver: false,
  flashing: false,
  flashCount: 0,
  flashInterval: null,
  paused: false // Add paused state
};

// Obstacle and item definitions
const obstacle = {
  x: middleX - 100,
  y: middleY - 100,
  radius: 50,
  dx: 1,
  dy: 1,
  wobbleAmplitude: 6,
  wobbleFrequency: 0.6,
  wobbleOffset: Math.random() * 2 * Math.PI,
  directionChangeInterval: Math.random() * 2000 + 1000,
  lastDirectionChange: Date.now(),
  moveTowardsSpeed: 3 // Speed at which the obstacle moves towards SpongeBob
};


const jellyfish = Array.from({ length: numJellyfish }, () => ({
  x: Math.random() * (canvas.width - 50),
  y: Math.random() * (canvas.height - 75),
  dx: 0.5 + Math.random(), // Slower initial speed
  dy: 0.5 + Math.random(), // Slower initial speed
  wobbleAmplitude: 10,
  wobbleFrequency: 0.1,
  wobbleOffset: Math.random() * 2 * Math.PI,
  wobbleDirection: Math.random() < 0.5 ? 1 : -1, // Random direction
  directionChangeInterval: Math.random() * 1000 + 500, // More frequent direction change
  lastDirectionChange: Date.now()
}));


// Helper functions
function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

function resetSpongebobPosition() {
  const ox = obstacle.x;
  const oy = obstacle.y;

  state.spongebob = { x: canvas.width - ox, y: canvas.height - oy, dx: 0, dy: 0 }; // Reset velocity
}

function drawText(text, x, y, font = '20px Arial', color = 'black') {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.fillText(text, x, y);
}

function renderBackground() {
  ctx.drawImage(assets.background, 0, 0, canvas.width, canvas.height);
}

function renderObstacle() {
  const gradient = ctx.createRadialGradient(obstacle.x, obstacle.y, 0, obstacle.x, obstacle.y, obstacle.radius);
  gradient.addColorStop(0, 'black'); // Center of the gradient (black hole)
  gradient.addColorStop(1, 'transparent'); // Outer edge of the gradient
  ctx.beginPath();
  ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, 2 * Math.PI);
  ctx.fillStyle = gradient;
  ctx.fill();
}

function renderJellyfish() {
  jellyfish.forEach(jelly => {
    ctx.drawImage(assets.jellyfish, jelly.x, jelly.y, 50, 75); // Draw each jellyfish image
  });
}

function renderSpongebob() {
  if (!state.flashing || (state.flashing && state.flashCount % 2 === 0)) {
    ctx.drawImage(assets.spongebob, state.spongebob.x, state.spongebob.y, spongebobSize, spongebobSize);
  }
}

function checkCollision() {
  const { spongebob, lives } = state;
  const dx = spongebob.x + spongebobSize / 2 - obstacle.x;
  const dy = spongebob.y + spongebobSize / 2 - obstacle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < obstacle.radius + spongebobSize / 2) {
    state.lives = Math.max(0, lives - 1); // Ensure lives cannot be negative
    state.score = Math.max(0, state.score - 5); // Ensure score cannot be negative
    if (state.lives > 0) {
      resetSpongebobPosition();
      flashSpongebob(() => (state.flashing = false));
    } else {
      state.gameOver = true;
      displayGameOver(() => {
        resetSpongebobPosition();
        flashSpongebob(() => {
          Object.assign(state, { lives: 5, score: 0, gameOver: false, flashing: false });
        });
      });
    }
  }
}

function checkJellyfishCollection() {
  const { spongebob } = state;
  jellyfish.forEach((jelly, index) => {
    if (
      spongebob.x < jelly.x + 50 &&
      spongebob.x + spongebobSize > jelly.x &&
      spongebob.y < jelly.y + 75 &&
      spongebob.y + spongebobSize > jelly.y
    ) {
      state.score += 5;
      // Reset collected jellyfish to a new random position
      jellyfish[index] = {
        x: Math.random() * (canvas.width - 50),
        y: Math.random() * (canvas.height - 75),
        dx: 2 + Math.random() * 2,
        dy: 2 + Math.random() * 2,
        wobbleAmplitude: 10,
        wobbleFrequency: 0.1,
        wobbleOffset: Math.random() * 2 * Math.PI,
        directionChangeInterval: Math.random() * 2000 + 1000,
        lastDirectionChange: Date.now()
      };
    }
  });
}

function flashSpongebob(callback) {
  state.flashCount = 0;
  state.flashing = true;
  state.flashInterval = setInterval(() => {
    state.flashCount++;
    if (state.flashCount >= 6) {
      clearInterval(state.flashInterval);
      callback();
    }
  }, 100);
}

function displayGameOver(callback) {
  let visible = true;
  const interval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderBackground();
    renderObstacle();
    renderJellyfish();
    drawText(`Score: ${state.score}`, 10, 20);
    drawText(`Lives: ${state.lives}`, canvas.width - 100, 20);

    if (visible) {
      drawText('Game Over!', middleX - 150, middleY, '50px Arial', 'red');
    }
    visible = !visible;
  }, 500);

  setTimeout(() => {
    clearInterval(interval);
    callback();
  }, 3000);
}

function updatePosition() {
  const { spongebob, gameOver, flashing } = state;
  if (!gameOver && !flashing) {
    if (rightPressed) spongebob.dx = speed;
    if (leftPressed) spongebob.dx = -speed;
    if (upPressed) spongebob.dy = -speed;
    if (downPressed) spongebob.dy = speed;

    // Move SpongeBob based on touch input
    if (touchX !== null && touchY !== null) {
      const deltaX = touchX - (spongebob.x + spongebobSize / 2);
      const deltaY = touchY - (spongebob.y + spongebobSize / 2);
      spongebob.dx = deltaX * 0.1; // Adjust speed scaling as needed
      spongebob.dy = deltaY * 0.1; // Adjust speed scaling as needed
    }

    // Apply gravitational pull if SpongeBob is near the black hole
    const dx = spongebob.x + spongebobSize / 2 - obstacle.x;
    const dy = spongebob.y + spongebobSize / 2 - obstacle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const pullFactor = blackholePullFactor * (obstacle.radius * 25 - distance); // Stronger pull closer to the black hole
    spongebob.dx -= pullFactor * (dx / distance);
    spongebob.dy -= pullFactor * (dy / distance);

    // Update SpongeBob's position based on velocity
    spongebob.x += spongebob.dx;
    spongebob.y += spongebob.dy;

    // Reset velocity if no keys or touch inputs are active
    if (!rightPressed && !leftPressed && touchX === null) spongebob.dx = 0;
    if (!upPressed && !downPressed && touchY === null) spongebob.dy = 0;

    // Wrap SpongeBob around the screen
    if (spongebob.x < 0) spongebob.x = canvas.width - spongebobSize;
    if (spongebob.x > canvas.width - spongebobSize) spongebob.x = 0;
    if (spongebob.y < 0) spongebob.y = canvas.height - spongebobSize;
    if (spongebob.y > canvas.height - spongebobSize) spongebob.y = 0;
  }
}


function moveObstacle() {
  const now = Date.now();
  const { spongebob } = state;

  // Calculate wobble effect
  obstacle.wobbleOffset += obstacle.wobbleFrequency;
  const wobbleX = obstacle.wobbleAmplitude * Math.sin(obstacle.wobbleOffset);
  const wobbleY = obstacle.wobbleAmplitude * Math.cos(obstacle.wobbleOffset);

  // Move towards SpongeBob
  const dxToSpongebob = spongebob.x + spongebobSize / 2 - obstacle.x;
  const dyToSpongebob = spongebob.y + spongebobSize / 2 - obstacle.y;
  const distanceToSpongebob = Math.sqrt(dxToSpongebob * dxToSpongebob + dyToSpongebob * dyToSpongebob);
  const moveTowardX = (dxToSpongebob / distanceToSpongebob) * obstacle.moveTowardsSpeed;
  const moveTowardY = (dyToSpongebob / distanceToSpongebob) * obstacle.moveTowardsSpeed;

  obstacle.x += obstacle.dx + wobbleX + moveTowardX;
  obstacle.y += obstacle.dy + wobbleY + moveTowardY;

  // Bounce the obstacle off the edges of the canvas
  if (obstacle.x < obstacle.radius || obstacle.x > canvas.width - obstacle.radius) {
    obstacle.dx *= -1;
  }
  if (obstacle.y < obstacle.radius || obstacle.y > canvas.height - obstacle.radius) {
    obstacle.dy *= -1;
  }

  // Change direction randomly
  if (now - obstacle.lastDirectionChange > obstacle.directionChangeInterval) {
    obstacle.dx = 1 + Math.random() * 2; // New random speed
    obstacle.dy = 1 + Math.random() * 2; // New random speed
    obstacle.directionChangeInterval = Math.random() * 2000 + 1000; // Reset interval
    obstacle.lastDirectionChange = now;
  }
}



function moveJellyfish() {
  jellyfish.forEach(jelly => {
    // Calculate wobble effect with direction
    jelly.wobbleOffset += jelly.wobbleFrequency * jelly.wobbleDirection;
    const wobbleX = jelly.wobbleAmplitude * Math.sin(jelly.wobbleOffset);
    const wobbleY = jelly.wobbleAmplitude * Math.cos(jelly.wobbleOffset);

    jelly.x += jelly.dx + wobbleX;
    jelly.y += jelly.dy + wobbleY;

    // Bounce the jellyfish off the edges of the canvas
    if (jelly.x < 0 || jelly.x > canvas.width - 50) {
      jelly.dx *= -1;
    }
    if (jelly.y < 0 || jelly.y > canvas.height - 75) {
      jelly.dy *= -1;
    }

    // Change direction more frequently
    const now = Date.now();
    if (now - jelly.lastDirectionChange > jelly.directionChangeInterval) {
      jelly.dx = 0.5 + Math.random(); // New slower random speed
      jelly.dy = 0.5 + Math.random(); // New slower random speed
      jelly.wobbleDirection = Math.random() < 0.5 ? 1 : -1; // Randomly change direction
      jelly.directionChangeInterval = Math.random() * 1000 + 500; // Reset interval
      jelly.lastDirectionChange = now;
    }
  });
}

function gameLoop() {
  if (!state.gameOver) {
    if (state.paused) {
      renderBackground();
      renderSpongebob();
      renderObstacle();
      renderJellyfish();
      drawText('Paused', middleX - 80, middleY, '50px Arial', 'red');
      drawText("Made by MJK, OFSK, CJSK.", middleX - 150, 50);
      drawText(`Score: ${state.score}`, 10, 20);
      drawText(`Lives: ${state.lives}`, canvas.width - 100, 20);
    }else{
      updatePosition();
      moveObstacle();
      moveJellyfish();
      renderBackground();
      renderSpongebob();
      renderObstacle();
      renderJellyfish();
      drawText("Made by MJK, OFSK, CJSK.", middleX - 150, 50);
      drawText(`Score: ${state.score}`, 10, 20);
      drawText(`Lives: ${state.lives}`, canvas.width - 100, 20);
      checkCollision();
      checkJellyfishCollection();
    }
  }
  requestAnimationFrame(gameLoop);
}


// Event listeners for key presses
let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;
let touchX = null;
let touchY = null;

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') rightPressed = true;
  if (e.key === 'ArrowLeft') leftPressed = true;
  if (e.key === 'ArrowUp') upPressed = true;
  if (e.key === 'ArrowDown') downPressed = true;
  if (e.key === ' ') { // Spacebar to toggle pause
    state.paused = !state.paused;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowRight') rightPressed = false;
  if (e.key === 'ArrowLeft') leftPressed = false;
  if (e.key === 'ArrowUp') upPressed = false;
  if (e.key === 'ArrowDown') downPressed = false;
});

function getTouchPosition(touch) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (touch.clientX - rect.left) * (canvas.width / rect.width),
    y: (touch.clientY - rect.top) * (canvas.height / rect.height)
  };
}

canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  if (distance > 0) {
    state.spongebob.dx = (deltaX / distance) * speed;
    state.spongebob.dy = (deltaY / distance) * speed;
  }
});

canvas.addEventListener('touchend', (e) => {
  state.spongebob.dx = 0;
  state.spongebob.dy = 0;
});

// Start the game
gameLoop();
