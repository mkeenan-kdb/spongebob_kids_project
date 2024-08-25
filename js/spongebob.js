// Select the canvas element and get its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load the SpongeBob image
const spongebob = new Image();
spongebob.src = 'images/spongebobp.png';

// Load the background image
const background = new Image();
background.src = 'images/bikini-bottom-background.jpg';

// Define the middle of the canvas
const middleX = Math.round(canvas.width / 2);
const middleY = Math.round(canvas.height / 2);

// Initial position and speed for SpongeBob
let spongebobX = middleX;
let spongebobY = middleY + 100;
const speed = 10;

// Set SpongeBob's size
const spongebobWidth = 150;
const spongebobHeight = 150;

// Game state variables
let lives = 5;
let score = 0;
let gameOver = false;
let flashing = false;
let flashCount = 0;
let flashInterval = null;

// Reset SpongeBob's position
function resetSpongebobPosition() {
  spongebobX = middleX;
  spongebobY = middleY + 100;
}

// Display the lives
function renderLives() {
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText('Lives: ' + lives, canvas.width - 100, 20);
}

// Display the score
function renderScore() {
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 20);
}

// Obstacle setup
const obstacle = {
  x: middleX - 100,
  y: middleY - 100,
  radius: 50,
  color: 'red'
};

// Render the obstacle
function renderObstacle() {
  ctx.beginPath();
  ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = obstacle.color;
  ctx.fill();
}

// Check for collision between SpongeBob and the circular obstacle
function checkCollision() {
  const dx = spongebobX + spongebobWidth / 2 - obstacle.x;
  const dy = spongebobY + spongebobHeight / 2 - obstacle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < obstacle.radius + spongebobWidth / 2) {
    // Collision detected
    lives--;
    score -= 5;
    if (lives > 0) {
      resetSpongebobPosition();
      flashSpongebob(() => {
        flashing = false;
      });
    } else {
      gameOver = true;
      displayGameOver(() => {
        resetSpongebobPosition();
        flashSpongebob(() => {
          flashing = false;
          lives = 5;
          score = 0;
          gameOver = false;
        });
      });
    }
  }
}

// Item setup
const item = {
  x: 200,
  y: 150,
  width: 30,
  height: 30,
  color: 'yellow'
};

// Render the item
function renderItem() {
  ctx.fillStyle = item.color;
  ctx.fillRect(item.x, item.y, item.width, item.height);
}

// Check for collision between SpongeBob and the item
function checkItemCollection() {
  if (spongebobX < item.x + item.width &&
    spongebobX + spongebobWidth > item.x &&
    spongebobY < item.y + item.height &&
    spongebobY + spongebobHeight > item.y) {
    // Item collected
    score += 5;
    // Move item to a new random position
    item.x = Math.random() * (canvas.width - item.width);
    item.y = Math.random() * (canvas.height - item.height);
  }
}

// Background rendering function
function renderBackground() {
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

// SpongeBob rendering function
function renderSpongebob() {
  if (!flashing || (flashing && flashCount % 2 === 0)) {
    ctx.drawImage(spongebob, spongebobX, spongebobY, spongebobWidth, spongebobHeight);
  }
}

// Flash SpongeBob after collision
function flashSpongebob(callback) {
  flashCount = 0;
  flashing = true;
  flashInterval = setInterval(() => {
    flashCount++;
    if (flashCount >= 6) { // Flash 3 times
      clearInterval(flashInterval);
      callback();
    }
  }, 200); // Flash every 200ms
}

// Display the "Game Over!" message with flashing effect
function displayGameOver(callback) {
  let visible = true;
  const interval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderBackground();
    renderObstacle();
    renderItem();
    renderScore();
    renderLives();

    if (visible) {
      ctx.fillStyle = 'red';
      ctx.font = '50px Arial';
      ctx.fillText('Game Over!', middleX - 150, middleY);
    }
    visible = !visible;
  }, 500);

  setTimeout(() => {
    clearInterval(interval);
    callback();
  }, 3000); // Show "Game Over!" for 3 seconds
}

// Handle keyboard inputs
let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;

// Update SpongeBob's position and score as he moves
function updatePosition() {
  if (!gameOver && !flashing) {
    if (rightPressed && spongebobX < canvas.width - spongebobWidth) {
      spongebobX += speed;
      score++;
    }
    if (leftPressed && spongebobX > 0) {
      spongebobX -= speed;
      score++;
    }
    if (upPressed && spongebobY > 0) {
      spongebobY -= speed;
      score++;
    }
    if (downPressed && spongebobY < canvas.height - spongebobHeight) {
      spongebobY += speed;
      score++;
    }
  }
}

// Game loop: Update and render the game
function gameLoop() {
  if (!gameOver || flashing) {
    updatePosition();
    renderBackground();
    renderSpongebob();
    renderObstacle();
    renderItem();
    renderScore();
    renderLives();
    checkCollision();
    checkItemCollection();
  }
  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();

// Keyboard event listeners
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
