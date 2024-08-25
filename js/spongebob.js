// Select the canvas element and get its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load the SpongeBob image
const spongebob = new Image();
spongebob.src = 'images/spongebobp.png';

// Load the background image
const background = new Image();
background.src = 'images/bikini-bottom-background.jpg';

// Initial position and speed for SpongeBob
let spongebobX = 100;
let spongebobY = 100;
const speed = 5;

// Lives setup
let lives = 3;

// Display the lives
function renderLives() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Lives: ' + lives, canvas.width - 100, 20);
}

// Score setup
let score = 0;

// Display the score
function renderScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
}

// Additional obstacle setup
const obstacle = {
    x: 800,  // Initial X position
    y: 300,  // Initial Y position
    width: 50,
    height: 50,
    color: 'red'
};

// Render the obstacle
function renderObstacle() {
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

// Check for collision between SpongeBob and the obstacle
function checkCollision() {
    if (spongebobX < obstacle.x + obstacle.width &&
        spongebobX + spongebob.width > obstacle.x &&
        spongebobY < obstacle.y + obstacle.height &&
        spongebobY + spongebob.height > obstacle.y) {
        // Collision detected
        lives--;
        spongebobX = 100;
        spongebobY = 100;
        if (lives === 0) {
            alert('Game Over!');
            // Reset the game or end it
            lives = 3;
            score = 0;
            spongebobX = 100;
            spongebobY = 100;
        }
    }
}

// Additional item setup
const item = {
    x: 200,  // Initial X position
    y: 150,  // Initial Y position
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
        spongebobX + spongebob.width > item.x &&
        spongebobY < item.y + item.height &&
        spongebobY + spongebob.height > item.y) {
        // Item collected
        score += 100;  // Increase score by 100
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
    ctx.drawImage(spongebob, spongebobX, spongebobY);
}

// Handle keyboard inputs
let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;

// Increase score as SpongeBob moves
function updatePosition() {
    if (rightPressed && spongebobX < canvas.width - spongebob.width) {
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
    if (downPressed && spongebobY < canvas.height - spongebob.height) {
        spongebobY += speed;
        score++;
    }
}

// Game loop: Update and render the game
function gameLoop() {
    updatePosition();
    renderBackground();
    renderSpongebob();
    renderObstacle();
    renderItem();
    renderScore();
    renderLives();  // Display the lives on the canvas
    checkCollision();
    checkItemCollection();
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
