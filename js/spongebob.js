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
const middleX = Math.round(canvas.width/2);
const middleY = Math.round(canvas.height/2);

// Initial position and speed for SpongeBob
let spongebobX = middleX;
let spongebobY = middleY+100;
const speed = 5;

// Reset SpongeBob
function resetSpongebobPosition(){
  spongebobX = middleX;
  spongebobY = middleY+100;
}

// Lives & score setup
let lives = 5;
let score = 0;
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

// Additional obstacle setup
const obstacle = {
    x: middleX-100,  // Initial X position
    y: middleY-100,  // Initial Y position
    radius: 50,
    color: 'red'
};

// Render the obstacle
function renderObstacle() {
    ctx.beginPath();
    ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, 2 * Math.PI, false);
    ctx.fill();
}

// Check for collision between SpongeBob and the obstacle
function checkCollision() {
    if (spongebobX < obstacle.x + 2*obstacle.radius &&
        spongebobX + spongebob.width > obstacle.x &&
        spongebobY < obstacle.y + 2*obstacle.radius &&
        spongebobY + spongebob.height > obstacle.y) {
        // Collision detected
        lives--;
        score-=5;
        resetSpongebobPosition();
        if (lives === 0) {
            alert('Game Over!');
            // Reset the game or end it
            lives = 3;
            score = 0;
            resetSpongebobPosition();
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
        score += 5;  // Increase score by 100
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
