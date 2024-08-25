// Canvas and context setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Asset loading
const assets = {
  spongebob: loadImage('images/spongebobp.png'),
  background: loadImage('images/bikini-bottom-background.jpg')
};

// Game constants
const middleX = canvas.width / 2;
const middleY = canvas.height / 2;
const speed = 10;
const spongebobSize = 150;

// Game state variables
let state = {
  spongebob: { x: middleX, y: middleY + 100 },
  lives: 5,
  score: 0,
  gameOver: false,
  flashing: false,
  flashCount: 0,
  flashInterval: null
};

// Obstacle and item definitions
const obstacle = {
  x: middleX - 100,
  y: middleY - 100,
  radius: 50,
  dx: 1, // Horizontal speed of the obstacle
  dy: 1  // Vertical speed of the obstacle
};

const item = {
  x: 200,
  y: 150,
  width: 30,
  height: 30,
  color: 'yellow',
  dx: 1, // Horizontal speed of the item
  dy: 1  // Vertical speed of the item
};

// Helper functions
function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

function resetSpongebobPosition() {
  state.spongebob = { x: middleX, y: middleY + 100 };
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

function renderItem() {
  ctx.fillStyle = item.color;
  ctx.fillRect(item.x, item.y, item.width, item.height);
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

function checkItemCollection() {
  const { spongebob } = state;
  if (
    spongebob.x < item.x + item.width &&
    spongebob.x + spongebobSize > item.x &&
    spongebob.y < item.y + item.height &&
    spongebob.y + spongebobSize > item.y
  ) {
    state.score += 5;
    item.x = Math.random() * (canvas.width - item.width);
    item.y = Math.random() * (canvas.height - item.height);
  }
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
  }, 200);
}

function displayGameOver(callback) {
  let visible = true;
  const interval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderBackground();
    renderObstacle();
    renderItem();
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
    if (rightPressed) spongebob.x += speed;
    if (leftPressed) spongebob.x -= speed;
    if (upPressed) spongebob.y -= speed;
    if (downPressed) spongebob.y += speed;

    // Wrap SpongeBob around the screen
    if (spongebob.x < 0) spongebob.x = canvas.width - spongebobSize;
    if (spongebob.x > canvas.width - spongebobSize) spongebob.x = 0;
    if (spongebob.y < 0) spongebob.y = canvas.height - spongebobSize;
    if (spongebob.y > canvas.height - spongebobSize) spongebob.y = 0;
  }
}

function moveObstacle() {
  obstacle.x += obstacle.dx;
  obstacle.y += obstacle.dy;

  // Bounce the obstacle off the edges of the canvas
  if (obstacle.x < obstacle.radius || obstacle.x > canvas.width - obstacle.radius) {
    obstacle.dx *= -1;
  }
  if (obstacle.y < obstacle.radius || obstacle.y > canvas.height - obstacle.radius) {
    obstacle.dy *= -1;
  }
}

function moveItem() {
  item.x += item.dx;
  item.y += item.dy;

  // Bounce the item off the edges of the canvas
  if (item.x < 0 || item.x > canvas.width - item.width) {
    item.dx *= -1;
  }
  if (item.y < 0 || item.y > canvas.height - item.height) {
    item.dy *= -1;
  }
}

function gameLoop() {
  if (!state.gameOver || state.flashing) {
    updatePosition();
    moveObstacle();
    moveItem();
    renderBackground();
    renderSpongebob();
    renderObstacle();
    renderItem();
    drawText("Made by MJK, OFSJ, CJSK.",middleX-150, 50);
    drawText(`Score: ${state.score}`, 10, 20);
    drawText(`Lives: ${state.lives}`, canvas.width - 100, 20);
    checkCollision();
    checkItemCollection();
  }
  requestAnimationFrame(gameLoop);
}

// Event listeners for key presses
let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') rightPressed = true;
  if (e.key === 'ArrowLeft') leftPressed = true;
  if (e.key === 'ArrowUp') upPressed = true;
  if (e.key === 'ArrowDown') downPressed = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowRight') rightPressed = false;
  if (e.key === 'ArrowLeft') leftPressed = false;
  if (e.key === 'ArrowUp') upPressed = false;
  if (e.key === 'ArrowDown') downPressed = false;
});

// Start the game
gameLoop();
