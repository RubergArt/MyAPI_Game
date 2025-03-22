// Global variables
let gameState = "splash"; // splash, playing, gameover, won
let canvasWidth, canvasHeight;
let scaleRatio = 1;
let spaceship;
let bullets = [];
let apis = [];
let asteroids = [];
let score = 0;
let correctAPICount = 0;
let incorrectAPICount = 0;
let targetAPICount = 5; // Number of correct APIs needed to win
let targetAPI = "";
let bulletCooldown = 0;
let bulletCooldownTime = 15;
let apiSpawnRate = 120;
let asteroidSpawnRate = 180;
let isMobileDevice = false;
let debugMode = false;
let leftZone, rightZone, shootZone;
let leftZoneActive = false;
let rightZoneActive = false;
let shootZoneActive = false;
let canRestart = false;
let gameOverStartTime = 0;

// Setup function
function setup() {
    // Check if device is mobile
    isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log("Device detected as:", isMobileDevice ? "mobile" : "desktop");
    
    // Set canvas size
    if (isMobileDevice) {
        canvasWidth = windowWidth;
        canvasHeight = windowHeight;
        scaleRatio = min(canvasWidth / 800, canvasHeight / 600);
    } else {
        canvasWidth = 800;
        canvasHeight = 600;
        scaleRatio = 1;
    }
    
    createCanvas(canvasWidth, canvasHeight);
    textAlign(CENTER, CENTER);
    rectMode(CENTER);
    
    // Initialize the game
    resetGame();
    
    // Set up touch controls for mobile
    if (isMobileDevice) {
        setupTouchControls();
    }
    
    console.log("Setup complete. Canvas size:", canvasWidth, "x", canvasHeight);
}

// Draw function - called every frame
function draw() {
    background(0);
    
    // Handle different game states
    if (gameState === "splash") {
        drawSplashScreen();
    } 
    else if (gameState === "playing") {
        // Move player
        handlePlayerMovement();
        
        // Check touch zones on mobile
        if (isMobileDevice) {
            checkTouchZones();
        }
        
        // Draw the spaceship
        drawSpaceship();
        
        // Update and draw bullets
        updateAndDrawBullets();
        
        // Update and draw APIs
        updateAndDrawAPIs();
        
        // Update and draw asteroids
        updateAndDrawAsteroids();
        
        // Spawn new objects
        if (frameCount % apiSpawnRate === 0) {
            spawnAPI();
        }
        
        if (frameCount % asteroidSpawnRate === 0) {
            spawnAsteroid();
        }
        
        // Handle bullet cooldown
        if (bulletCooldown > 0) {
            bulletCooldown--;
        }
        
        // Draw score and info
        drawHUD();
        
        // Check for win condition
        if (correctAPICount >= targetAPICount) {
            gameState = "won";
        }
    } 
    else if (gameState === "gameover") {
        drawGameOverScreen();
        
        // Allow restart after delay
        if (millis() - gameOverStartTime > 1000) {
            canRestart = true;
        }
    } 
    else if (gameState === "won") {
        drawWinScreen();
    }
    
    // Debug info
    if (debugMode) {
        fill(255);
        textSize(12);
        textAlign(LEFT, BOTTOM);
        text("FPS: " + Math.floor(frameRate()), 10, height - 10);
        text("Game state: " + gameState, 10, height - 30);
    }
}

// Handle player movement
function handlePlayerMovement() {
    let moveSpeed = 5 * scaleRatio;
    
    if (!isMobileDevice) {
        // Keyboard controls
        if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // Left arrow or A
            spaceship.x -= moveSpeed;
        }
        if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // Right arrow or D
            spaceship.x += moveSpeed;
        }
        
        // Shoot with spacebar
        if (keyIsDown(32) && bulletCooldown <= 0) { // Spacebar
            shoot();
            bulletCooldown = bulletCooldownTime;
        }
    } else {
        // Touch controls handled in checkTouchZones()
        if (leftZoneActive) {
            spaceship.x -= moveSpeed;
        }
        if (rightZoneActive) {
            spaceship.x += moveSpeed;
        }
    }
    
    // Keep within canvas
    spaceship.x = constrain(spaceship.x, spaceship.width/2, canvasWidth - spaceship.width/2);
}

// Update and draw bullets
function updateAndDrawBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        
        // Update position
        bullet.y -= bullet.speed * scaleRatio;
        
        // Draw bullet
        fill(255, 255, 0);
        noStroke();
        rect(bullet.x, bullet.y, bullet.width, bullet.height);
        
        // Remove if off screen
        if (bullet.y < -bullet.height) {
            bullets.splice(i, 1);
            continue;
        }
        
        // Check collisions with APIs
        for (let j = apis.length - 1; j >= 0; j--) {
            let api = apis[j];
            let d = dist(bullet.x, bullet.y, api.x, api.y);
            
            if (d < (bullet.width/2 + api.width/2) * 0.7) {
                // Remove bullet
                bullets.splice(i, 1);
                
                // Check if correct API
                if (api.type === targetAPI) {
                    api.state = "correct";
                    score += 5;
                    correctAPICount++;
                } else {
                    api.state = "incorrect";
                    score -= 2;
                    score = max(0, score);
                    incorrectAPICount++;
                }
                
                break;
            }
        }
    }
}

// Update and draw APIs
function updateAndDrawAPIs() {
    for (let i = apis.length - 1; i >= 0; i--) {
        let api = apis[i];
        
        // Update position
        api.y += api.speed * scaleRatio;
        
        // Check if off screen
        if (api.y > canvasHeight + api.height) {
            apis.splice(i, 1);
            
            // Penalty for missing
            if (api.state === "normal") {
                score -= 1;
                score = max(0, score);
            }
            
            continue;
        }
        
        // Draw API
        drawAPIBubble(api.x, api.y, api.width, api.height, api.type, api.state);
    }
}

// Update and draw asteroids
function updateAndDrawAsteroids() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        let asteroid = asteroids[i];
        
        // Update position
        asteroid.y += asteroid.speed * scaleRatio;
        
        // Check if off screen
        if (asteroid.y > canvasHeight + asteroid.height) {
            asteroids.splice(i, 1);
            continue;
        }
        
        // Draw asteroid
        fill(150);
        stroke(100);
        strokeWeight(2 * scaleRatio);
        ellipse(asteroid.x, asteroid.y, asteroid.width, asteroid.height);
        
        // Check collision with spaceship
        let d = dist(spaceship.x, spaceship.y, asteroid.x, asteroid.y);
        if (d < (spaceship.width/2 + asteroid.width/2) * 0.7) {
            gameState = "gameover";
            gameOverStartTime = millis();
        }
    }
}

// Draw the heads-up display (score, etc.)
function drawHUD() {
    fill(255);
    textSize(16 * scaleRatio);
    textAlign(LEFT, TOP);
    text("Score: " + score, 20 * scaleRatio, 20 * scaleRatio);
    
    textSize(14 * scaleRatio);
    text("Correct: " + correctAPICount, 20 * scaleRatio, 50 * scaleRatio);
    text("Incorrect: " + incorrectAPICount, 20 * scaleRatio, 70 * scaleRatio);
    
    textAlign(RIGHT, TOP);
    text("Target: " + targetAPICount, canvasWidth - 20 * scaleRatio, 20 * scaleRatio);
    
    textAlign(LEFT, BOTTOM);
    fill(255, 255, 0);
    text("Target API: " + targetAPI, 20 * scaleRatio, canvasHeight - 20 * scaleRatio);
}

// Draw API bubble
function drawAPIBubble(x, y, width, height, type, state) {
    push();
    if (state === "normal") {
        fill(255, 0, 0, 200);
        stroke(255, 100, 100);
    } else if (state === "correct") {
        fill(0, 255, 0, 200);
        stroke(100, 255, 100);
    } else if (state === "incorrect") {
        fill(0, 0, 255, 200);
        stroke(100, 100, 255);
    }
    
    strokeWeight(2 * scaleRatio);
    ellipse(x, y, width, height);
    
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(14 * scaleRatio);
    text(type, x, y);
    pop();
}

// Draw spaceship
function drawSpaceship() {
    push();
    fill(0, 255, 0);
    stroke(0, 200, 0);
    strokeWeight(2 * scaleRatio);
    rect(spaceship.x, spaceship.y, spaceship.width, spaceship.height, 5);
    pop();
}

// Draw splash screen
function drawSplashScreen() {
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(40 * scaleRatio);
    text("API SPACE GAME", canvasWidth/2, canvasHeight/2 - 50 * scaleRatio);
    
    textSize(20 * scaleRatio);
    text("Press SPACE to start", canvasWidth/2, canvasHeight/2 + 30 * scaleRatio);
    
    if (isMobileDevice) {
        text("Tap screen to start", canvasWidth/2, canvasHeight/2 + 60 * scaleRatio);
    }
}

// Draw game over screen
function drawGameOverScreen() {
    textAlign(CENTER, CENTER);
    fill(255, 50, 50);
    textSize(40 * scaleRatio);
    text("GAME OVER", canvasWidth/2, canvasHeight/2 - 50 * scaleRatio);
    
    fill(255);
    textSize(24 * scaleRatio);
    text("Score: " + score, canvasWidth/2, canvasHeight/2);
    
    if (canRestart) {
        textSize(20 * scaleRatio);
        text("Press SPACE to restart", canvasWidth/2, canvasHeight/2 + 50 * scaleRatio);
        
        if (isMobileDevice) {
            text("Tap to restart", canvasWidth/2, canvasHeight/2 + 80 * scaleRatio);
        }
    }
}

// Draw win screen
function drawWinScreen() {
    textAlign(CENTER, CENTER);
    fill(50, 255, 50);
    textSize(40 * scaleRatio);
    text("YOU WON!", canvasWidth/2, canvasHeight/2 - 50 * scaleRatio);
    
    fill(255);
    textSize(24 * scaleRatio);
    text("Final Score: " + score, canvasWidth/2, canvasHeight/2);
    
    textSize(20 * scaleRatio);
    text("Press ENTER to restart", canvasWidth/2, canvasHeight/2 + 50 * scaleRatio);
    
    if (isMobileDevice) {
        text("Tap to restart", canvasWidth/2, canvasHeight/2 + 80 * scaleRatio);
    }
}

// Shoot bullet
function shoot() {
    let bullet = {
        x: spaceship.x,
        y: spaceship.y - spaceship.height/2,
        width: 8 * scaleRatio,
        height: 16 * scaleRatio,
        speed: 10
    };
    
    bullets.push(bullet);
}

// Spawn new API
function spawnAPI() {
    let apiTypes = ["PayrollAPI", "BenefitsAPI", "TaxAPI", "TimeAPI", "HRServicesAPI", 
                   "TalentAPI", "RecruitingAPI", "AnalyticsAPI", "IntegrationsAPI", "MobileAPI"];
    
    let type;
    if (random(1) < 0.3) {
        // 30% chance for target API
        type = targetAPI;
    } else {
        // Otherwise random other API
        let otherTypes = apiTypes.filter(t => t !== targetAPI);
        type = random(otherTypes);
    }
    
    let api = {
        x: random(50, canvasWidth - 50),
        y: -50,
        width: 80 * scaleRatio,
        height: 80 * scaleRatio,
        type: type,
        state: "normal",
        speed: random(1, 3)
    };
    
    apis.push(api);
}

// Spawn new asteroid
function spawnAsteroid() {
    let asteroid = {
        x: random(50, canvasWidth - 50),
        y: -50,
        width: 60 * scaleRatio,
        height: 40 * scaleRatio,
        speed: random(2, 4)
    };
    
    asteroids.push(asteroid);
}

// Setup touch controls for mobile
function setupTouchControls() {
    // Left zone (left third of screen)
    leftZone = {
        x: canvasWidth * 0.25,
        y: canvasHeight * 0.75,
        width: canvasWidth * 0.5,
        height: canvasHeight * 0.5
    };
    
    // Right zone (right third of screen)
    rightZone = {
        x: canvasWidth * 0.75,
        y: canvasHeight * 0.75,
        width: canvasWidth * 0.5,
        height: canvasHeight * 0.5
    };
    
    // Shoot zone (center bottom)
    shootZone = {
        x: canvasWidth * 0.5,
        y: canvasHeight * 0.6,
        radius: 60 * scaleRatio
    };
}

// Check touch zones
function checkTouchZones() {
    // Reset active states
    leftZoneActive = false;
    rightZoneActive = false;
    shootZoneActive = false;
    
    // Check each touch
    for (let i = 0; i < touches.length; i++) {
        let touch = touches[i];
        
        // Left zone check
        if (touch.x < canvasWidth * 0.33 && touch.y > canvasHeight * 0.5) {
            leftZoneActive = true;
        }
        
        // Right zone check
        if (touch.x > canvasWidth * 0.67 && touch.y > canvasHeight * 0.5) {
            rightZoneActive = true;
        }
        
        // Shoot zone check
        let d = dist(touch.x, touch.y, shootZone.x, shootZone.y);
        if (d < shootZone.radius) {
            shootZoneActive = true;
            
            // Shoot if cooldown allows
            if (bulletCooldown <= 0) {
                shoot();
                bulletCooldown = bulletCooldownTime;
            }
        }
    }
}

// Key pressed handler
function keyPressed() {
    if (gameState === "splash" && (keyCode === 32 || keyCode === ENTER)) { // SPACE or ENTER
        gameState = "playing";
        return false;
    }
    
    if (gameState === "gameover" && canRestart && (keyCode === 32 || keyCode === ENTER)) {
        resetGame();
        return false;
    }
    
    if (gameState === "won" && (keyCode === 32 || keyCode === ENTER)) {
        resetGame();
        return false;
    }
    
    // Debug toggle
    if (key === 'd' || key === 'D') {
        debugMode = !debugMode;
        return false;
    }
    
    return true;
}

// Touch started handler
function touchStarted() {
    if (gameState === "splash") {
        gameState = "playing";
        return false;
    }
    
    if (gameState === "gameover" && canRestart) {
        resetGame();
        return false;
    }
    
    if (gameState === "won") {
        resetGame();
        return false;
    }
    
    return true;
}

// Window resized handler
function windowResized() {
    if (isMobileDevice) {
        canvasWidth = windowWidth;
        canvasHeight = windowHeight;
        scaleRatio = min(canvasWidth / 800, canvasHeight / 600);
        resizeCanvas(canvasWidth, canvasHeight);
        
        // Update touch zones
        setupTouchControls();
    }
}

// Reset game
function resetGame() {
    gameState = "playing";
    
    // Reset score and counters
    score = 0;
    correctAPICount = 0;
    incorrectAPICount = 0;
    
    // Clear arrays
    bullets = [];
    apis = [];
    asteroids = [];
    
    // Reset spaceship
    spaceship = {
        x: canvasWidth / 2,
        y: canvasHeight - 50 * scaleRatio,
        width: 50 * scaleRatio,
        height: 40 * scaleRatio,
        speed: 5 * scaleRatio
    };
    
    // Reset cooldown
    bulletCooldown = 0;
    
    // Choose target API
    let apiTypes = ["PayrollAPI", "BenefitsAPI", "TaxAPI", "TimeAPI", "HRServicesAPI", 
                   "TalentAPI", "RecruitingAPI", "AnalyticsAPI", "IntegrationsAPI", "MobileAPI"];
    targetAPI = random(apiTypes);
    
    console.log("Game reset. Target API:", targetAPI);
} 