// ADP API Game - Original Version
// Based on the original game brief with proper level progression
// Last updated: March 28, 2025 - Enhanced email input with all valid characters

// Define the HR use cases and correct APIs for each level
const levels = [
    { 
        question: "Which API would hire a Worker,", 
        correctAPI: "Hire API", 
        explanation: "The Hire API handles all aspects of adding new workers to your payroll system with proper data validation."
    },
    { 
        question: "Which API would increase a Workers Rate,", 
        correctAPI: "Remuneration API", 
        explanation: "The Remuneration API ensures accurate and compliant updates to worker compensation data."
    },
    { 
        question: "Which API would change promoted workers job title.", 
        correctAPI: "Job Change API", 
        explanation: "The Job Change API manages role transitions with proper validation and historical tracking."
    },
    { 
        question: "Which API would confirm the worker is leaving employment", 
        correctAPI: "Terminate API", 
        explanation: "The Terminate API handles workers leaving process with proper validation and compliance checks."
    }
];

// All possible API options
const allAPIs = [
    "Hire API",
    "Remuneration API", 
    "Job Change API", 
    "Pay Data API", 
    "Terminate API",
    "Address change API"
];

// Game states and variables
let gameState = "splash"; // splash, instructions, playing, levelCompleted, gameOver, won
let currentLevel = 0;
let canvasWidth, canvasHeight;
let scaleRatio = 1;
let score = 0;
let playerName = "";
let levelExplanationStartTime = 0;
let gameOverStartTime = 0;
let winStartTime = 0;
let canRestart = false;
let emailInput = "";
let emailSubmitted = false;
let emailSubmitting = false;
let emailError = "";
let readyToProceed = false; // New variable to track if player has read the level explanation

// Game elements
let spaceship;
let bullets = [];
let apis = [];
let asteroids = [];
let bulletCooldown = 0;
let bulletCooldownTime = 15; // Frames between shots
let explosions = [];

// Mobile detection and controls
let isMobileDevice = false;
let leftZone, rightZone, shootZone;
let leftZoneActive = false;
let rightZoneActive = false;
let shootZoneActive = false;

// Debug mode
let debugMode = false;

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
    setupTouchControls();
    
    // Hide the loading message if it exists
    if (document.getElementById('message')) {
        document.getElementById('message').style.display = 'none';
    }
}

function draw() {
    background(0, 10, 30); // Deep space blue
    
    // Draw starry background
    drawStars();
    
    // Handle game states
    switch(gameState) {
        case "splash":
            drawSplashScreen();
            break;
            
        case "instructions":
            drawInstructionsScreen();
            break;
            
        case "playing":
            // Process movement and controls
            handlePlayerMovement();
            
            // Check touch zones for mobile
            if (isMobileDevice) {
                checkTouchZones();
            }
            
            // Update and draw game elements
            updateAndDrawBullets();
            updateAndDrawAPIs();
            updateAndDrawAsteroids();
            drawSpaceship();
            
            // Update and draw explosions
            updateAndDrawExplosions();
            
            // Spawn new APIs periodically
            if (frameCount % 90 === 0) {
                spawnAPI();
            }
            
            // Spawn new asteroids periodically
            if (frameCount % 120 === 0) {
                spawnAsteroid();
            }
            
            // Process bullet cooldown
            if (bulletCooldown > 0) {
                bulletCooldown--;
            }
            
            // Draw heads-up display
            drawHUD();
            break;
            
        case "levelCompleted":
            drawLevelCompletedScreen();
            // We no longer automatically proceed to next level - player must interact
            break;
            
        case "gameOver":
            drawGameOverScreen();
            
            // Allow restart after delay
            if (millis() - gameOverStartTime > 2000) {
                canRestart = true;
            }
            break;
            
        case "won":
            drawWinScreen();
            break;
    }
    
    // Debug info
    if (debugMode) {
        fill(255);
        textAlign(LEFT, TOP);
        textSize(14);
        text("FPS: " + Math.floor(frameRate()), 10, 10);
        text("Game State: " + gameState, 10, 30);
        text("Level: " + (currentLevel + 1) + "/" + levels.length, 10, 50);
        text("Score: " + score, 10, 70);
    }
}

function drawStars() {
    // Draw background stars
    fill(255);
    noStroke();
    
    // Use noise for semi-random star twinkling
    for (let i = 0; i < 100; i++) {
        let x = map(noise(i, frameCount * 0.01), 0, 1, 0, canvasWidth);
        let y = map(noise(i + 100, frameCount * 0.01), 0, 1, 0, canvasHeight);
        let size = map(noise(i, frameCount * 0.02), 0, 1, 1, 3) * scaleRatio;
        
        // Twinkle effect
        let brightness = map(sin(frameCount * 0.1 + i), -1, 1, 150, 255);
        fill(brightness);
        
        ellipse(x, y, size, size);
    }
}

function drawSplashScreen() {
    // Title
    fill(50, 150, 255);
    textSize(40 * scaleRatio);
    text("ADP API Game", canvasWidth/2, canvasHeight/3);
    
    // Instruction
    fill(255);
    textSize(20 * scaleRatio);
    text("Press SPACE or tap screen to start", canvasWidth/2, canvasHeight/2);
    
    // Credits
    textSize(14 * scaleRatio);
    text("Created for ADP Marketplace", canvasWidth/2, canvasHeight - 60 * scaleRatio);
}

function drawInstructionsScreen() {
    // Title
    fill(255);
    textSize(30 * scaleRatio);
    text("How to Play", canvasWidth/2, canvasHeight/4);
    
    // Instructions
    textSize(18 * scaleRatio);
    let instructionsY = canvasHeight/2.5;
    let lineHeight = 30 * scaleRatio;
    
    fill(200, 200, 255);
    text("1. Shoot the correct API bubbles that match the question", canvasWidth/2, instructionsY);
    text("2. Avoid shooting incorrect APIs and alien ships", canvasWidth/2, instructionsY + lineHeight);
    text("3. Complete all 4 levels to win", canvasWidth/2, instructionsY + lineHeight * 2);
    
    // Controls
    textSize(18 * scaleRatio);
    fill(150, 255, 150);
    if (isMobileDevice) {
        text("Touch the left/right sides to move", canvasWidth/2, instructionsY + lineHeight * 4);
        text("Touch the center to shoot", canvasWidth/2, instructionsY + lineHeight * 5);
    } else {
        text("Use LEFT/RIGHT arrows to move", canvasWidth/2, instructionsY + lineHeight * 4);
        text("Press SPACE to shoot", canvasWidth/2, instructionsY + lineHeight * 5);
    }
    
    // Continue prompt
    fill(255, 220, 100);
    textSize(20 * scaleRatio);
    text("Press SPACE or tap to continue", canvasWidth/2, canvasHeight - 80 * scaleRatio);
}

function drawHUD() {
    // Current level question at top - ENHANCED for better visibility with larger size and attention-grabbing design
    fill(0, 30, 80, 240);  // Darker blue with higher opacity
    stroke(100, 180, 255);   // Light blue border
    strokeWeight(4 * scaleRatio);
    rect(canvasWidth/2, 45 * scaleRatio, canvasWidth * 0.95, 70 * scaleRatio, 12 * scaleRatio);
    
    // Add a highlight effect at the top of the question box
    noStroke();
    fill(100, 150, 255, 100);
    rect(canvasWidth/2, 20 * scaleRatio, canvasWidth * 0.9, 10 * scaleRatio, 5 * scaleRatio);
    
    // Make the use case question the absolute focus with high-visibility formatting
    textAlign(CENTER, CENTER);
    
    // Draw text shadow for better visibility
    fill(0, 0, 40);
    textSize(23 * scaleRatio);
    textStyle(BOLD);
    text(levels[currentLevel].question, canvasWidth/2 + 2 * scaleRatio, 45 * scaleRatio + 2 * scaleRatio);
    
    // Draw the actual question with larger text and better positioning
    fill(255, 255, 255);
    textSize(23 * scaleRatio);
    textStyle(BOLD);
    text(levels[currentLevel].question, canvasWidth/2, 45 * scaleRatio);
    
    // Score
    fill(0, 0, 0, 150);
    rect(80 * scaleRatio, canvasHeight - 25 * scaleRatio, 120 * scaleRatio, 30 * scaleRatio, 10 * scaleRatio);
    
    fill(255);
    textSize(16 * scaleRatio);
    textAlign(CENTER, CENTER);
    text("Score: " + score, 80 * scaleRatio, canvasHeight - 25 * scaleRatio);
    
    // Level indicator
    fill(0, 0, 0, 150);
    rect(canvasWidth - 80 * scaleRatio, canvasHeight - 25 * scaleRatio, 120 * scaleRatio, 30 * scaleRatio, 10 * scaleRatio);
    
    fill(255);
    textAlign(CENTER, CENTER);
    text("Level: " + (currentLevel + 1) + "/" + levels.length, canvasWidth - 80 * scaleRatio, canvasHeight - 25 * scaleRatio);
}

function drawLevelCompletedScreen() {
    // Background overlay
    fill(0, 0, 30, 200);
    rect(canvasWidth/2, canvasHeight/2, canvasWidth, canvasHeight);
    
    // Level completed message
    fill(255);
    textSize(30 * scaleRatio);
    text("Correct!", canvasWidth/2, canvasHeight/3);
    
    // Explanation
    fill(200, 255, 200);
    textSize(18 * scaleRatio);
    text(levels[currentLevel].explanation, canvasWidth/2, canvasHeight/2, canvasWidth * 0.7, canvasHeight * 0.4);
    
    // Show continue prompt after 2 seconds
    if (millis() - levelExplanationStartTime > 2000) {
        readyToProceed = true;
        
        // Pulsing prompt text
        let pulseAmount = map(sin(frameCount * 0.1), -1, 1, 0.8, 1.2);
        fill(255, 220, 100);
        textSize(20 * scaleRatio * pulseAmount);
        
        if (currentLevel < levels.length - 1) {
            text("Tap or press SPACE to continue to next level", canvasWidth/2, canvasHeight - 80 * scaleRatio);
        } else {
            text("Tap or press SPACE to view your certificate!", canvasWidth/2, canvasHeight - 80 * scaleRatio);
        }
    }
}

function drawGameOverScreen() {
    // Background overlay
    fill(30, 0, 0, 200);
    rect(canvasWidth/2, canvasHeight/2, canvasWidth, canvasHeight);
    
    // Game over message
    fill(255, 100, 100);
    textSize(40 * scaleRatio);
    text("Game Over", canvasWidth/2, canvasHeight/3);
    
    // Show score
    fill(255);
    textSize(24 * scaleRatio);
    text("Your score: " + score, canvasWidth/2, canvasHeight/2);
    
    // Restart prompt
    if (canRestart) {
        fill(255, 200, 100);
        textSize(20 * scaleRatio);
        text("Press SPACE or tap to try again", canvasWidth/2, canvasHeight - 100 * scaleRatio);
    }
}

function drawWinScreen() {
    // Background
    background(20, 40, 100);
    
    // Trophy
    drawTrophy(canvasWidth/2, canvasHeight * 0.3, 120 * scaleRatio);
    
    // Congratulations text
    fill(255);
    textSize(32 * scaleRatio);
    text("Congratulations!", canvasWidth/2, canvasHeight * 0.55);
    
    textSize(20 * scaleRatio);
    text("You have a top level understanding of APIs", canvasWidth/2, canvasHeight * 0.62);
    
    // Email collection form
    drawEmailForm();
}

function drawTrophy(x, y, size) {
    push();
    translate(x, y);
    
    // Trophy cup - gold color
    fill(255, 215, 0);
    stroke(218, 165, 32);
    strokeWeight(2 * scaleRatio);
    
    // Cup body
    beginShape();
    vertex(-size/3, 0);
    vertex(-size/2, -size/2);
    vertex(-size/2, -size*0.7);
    bezierVertex(-size/2, -size*0.9, size/2, -size*0.9, size/2, -size*0.7);
    vertex(size/2, -size/2);
    vertex(size/3, 0);
    endShape(CLOSE);
    
    // Base
    rect(0, size/4, size/2, size/4, 5);
    rect(0, size/2, size*0.7, size/10, 2);
    
    // Handles
    noFill();
    strokeWeight(4 * scaleRatio);
    arc(-size/2, -size/2, size/3, size/2, PI, TWO_PI-PI/4);
    arc(size/2, -size/2, size/3, size/2, PI+PI/4, TWO_PI);
    
    // Shiny effect
    noStroke();
    fill(255, 255, 200, 100);
    ellipse(-size/4, -size/2, size/6, size/6);
    
    pop();
}

function drawEmailForm() {
    // Email form background
    fill(30, 50, 120);
    stroke(100, 150, 255);
    strokeWeight(2 * scaleRatio);
    rect(canvasWidth/2, canvasHeight * 0.75, canvasWidth * 0.8, canvasHeight * 0.2, 10 * scaleRatio);
    
    // Label
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16 * scaleRatio);
    text("If you would like to know more about ADP's Marketplace APIs", canvasWidth/2, canvasHeight * 0.7);
    text("please enter your email address:", canvasWidth/2, canvasHeight * 0.73);
    
    // Email input box
    fill(255);
    stroke(150, 150, 200);
    rect(canvasWidth/2, canvasHeight * 0.78, canvasWidth * 0.6, 40 * scaleRatio, 5 * scaleRatio);
    
    // Email text or placeholder
    if (emailInput === "") {
        fill(150);
        text("Email address", canvasWidth/2, canvasHeight * 0.78);
    } else {
        fill(0);
        text(emailInput, canvasWidth/2, canvasHeight * 0.78);
    }
    
    // Submit button
    if (emailSubmitted) {
        // Show success message
        fill(100, 255, 100);
        noStroke();
        textSize(18 * scaleRatio);
        text("Thank you! Your email has been submitted.", canvasWidth/2, canvasHeight * 0.85);
    } else if (emailSubmitting) {
        // Show loading indicator
        fill(150, 150, 255);
        noStroke();
        textSize(18 * scaleRatio);
        text("Submitting...", canvasWidth/2, canvasHeight * 0.85);
    } else {
        // Show submit button
        fill(50, 120, 200);
        stroke(100, 170, 255);
        rect(canvasWidth/2, canvasHeight * 0.85, 180 * scaleRatio, 40 * scaleRatio, 5 * scaleRatio);
        
        fill(255);
        noStroke();
        textSize(18 * scaleRatio);
        text("Submit", canvasWidth/2, canvasHeight * 0.85);
    }
    
    // Show error if any
    if (emailError !== "") {
        fill(255, 80, 80);
        textSize(14 * scaleRatio);
        text(emailError, canvasWidth/2, canvasHeight * 0.9);
    }
}

function keyPressed() {
    // Space key functions
    if (keyCode === 32) { // SPACE
        if (gameState === "splash") {
            gameState = "instructions";
        } else if (gameState === "instructions") {
            gameState = "playing";
        } else if (gameState === "playing") {
            shoot();
        } else if (gameState === "levelCompleted" && readyToProceed) {
            // Progress to next level or win screen
            if (currentLevel >= levels.length - 1) {
                // All levels completed, show win screen
                gameState = "won";
                winStartTime = millis();
            } else {
                // Advance to next level
                currentLevel++;
                resetLevel();
                gameState = "playing";
            }
            readyToProceed = false; // Reset for next level
        } else if (gameState === "gameOver" && canRestart) {
            resetGame();
            gameState = "playing";
        }
    }
    
    // Email input handling in win screen
    if (gameState === "won" && !emailSubmitted) {
        console.log("Key pressed in email field:", keyCode, key); // Debug log
        
        if (keyCode === BACKSPACE) {
            // Handle backspace
            emailInput = emailInput.slice(0, -1);
            return false; // Prevent browser back
        } else if (keyCode === ENTER) {
            // Handle enter/return key
            submitEmail();
            return false;
        } else {
            // Handle all other keys by checking for valid email characters
            const validEmailChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@.-_+";
            
            // Special handling for period/dot (ASCII 46)
            if (keyCode === 190 || key === '.') {
                emailInput += '.';
                console.log("Added period to email:", emailInput); // Debug log
                return false;
            }
            
            // Check if key is a valid email character
            if (validEmailChars.includes(key)) {
                emailInput += key;
                console.log("Added character to email:", key, emailInput); // Debug log
                return false;
            }
        }
    }
    
    // Debug mode toggle
    if (keyCode === 68) { // D key
        debugMode = !debugMode;
        console.log("Debug mode:", debugMode);
    }
}

// Virtual keyboard for email input
function showVirtualKeyboard() {
    if (!isMobileDevice) return; // Only needed on mobile
    
    // Clear any previous error
    emailError = "";
    
    // Use browser's prompt for email input
    let email = prompt("Enter your email address:");
    if (email !== null) {
        emailInput = email;
        console.log("Email entered via prompt:", emailInput); // Debug log
        
        // Validate the email format
        validateEmail();
    }
}

// Validate email format
function validateEmail() {
    if (emailInput === "") {
        emailError = "Please enter an email address";
        return false;
    }
    
    // Check for both @ and . in the email
    if (!emailInput.includes('@') || !emailInput.includes('.')) {
        emailError = "Please enter a valid email address";
        return false;
    }
    
    // Additional validation: make sure the @ comes before the last .
    const atIndex = emailInput.indexOf('@');
    const lastDotIndex = emailInput.lastIndexOf('.');
    
    if (atIndex > lastDotIndex || atIndex === -1 || lastDotIndex === -1) {
        emailError = "Please enter a valid email address";
        return false;
    }
    
    // Email format appears valid
    emailError = "";
    return true;
}

function submitEmail() {
    // Validate before submission
    if (!validateEmail()) {
        return;
    }
    
    // Clear any previous errors and set submitting state
    emailError = "";
    emailSubmitting = true;
    
    // Send to Supabase (placeholder - connect to the actual Supabase setup)
    console.log("Would submit email to Supabase:", emailInput);
    
    // Simulate successful submission
    setTimeout(function() {
        emailSubmitting = false;
        emailSubmitted = true;
    }, 1000);
}

function handlePlayerMovement() {
    // Keyboard controls for desktop
    if (!isMobileDevice) {
        if (keyIsDown(LEFT_ARROW)) {
            spaceship.x -= spaceship.speed;
        }
        if (keyIsDown(RIGHT_ARROW)) {
            spaceship.x += spaceship.speed;
        }
    } else {
        // Touch controls for mobile
        if (leftZoneActive) {
            spaceship.x -= spaceship.speed;
        }
        if (rightZoneActive) {
            spaceship.x += spaceship.speed;
        }
    }
    
    // Keep spaceship within screen bounds
    spaceship.x = constrain(spaceship.x, spaceship.width/2, canvasWidth - spaceship.width/2);
}

function updateAndDrawBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        
        // Update bullet position
        bullet.y -= bullet.speed;
        
        // Draw the bullet
        fill(255, 255, 100);
        noStroke();
        rect(bullet.x, bullet.y, bullet.width, bullet.height, 2);
        
        // Remove if off-screen
        if (bullet.y < -50) {
            bullets.splice(i, 1);
            continue;
        }
        
        // Check collision with APIs
        for (let j = apis.length - 1; j >= 0; j--) {
            let api = apis[j];
            let d = dist(bullet.x, bullet.y, api.x, api.y);
            
            // If collision detected
            if (d < (bullet.width/2 + api.width/2) * 0.7) {
                // Remove bullet
                bullets.splice(i, 1);
                
                // Create explosion at API location
                createExplosion(api.x, api.y, api.type === levels[currentLevel].correctAPI);
                
                // Check if this is the correct API
                if (api.type === levels[currentLevel].correctAPI) {
                    // Correct API hit
                    api.state = "correct";
                    score += 100; // +100 for correct API
                    
                    // Level completed
                    gameState = "levelCompleted";
                    levelExplanationStartTime = millis();
                } else {
                    // Incorrect API hit
                    api.state = "incorrect";
                    score -= 50; // -50 for incorrect API
                    score = max(0, score); // Prevent negative score
                }
                
                // Remove API after marking it
                setTimeout(function() {
                    const index = apis.indexOf(api);
                    if (index > -1) {
                        apis.splice(index, 1);
                    }
                }, 500);
                
                break;
            }
        }
        
        // Check collision with asteroids
        for (let j = asteroids.length - 1; j >= 0; j--) {
            let asteroid = asteroids[j];
            let d = dist(bullet.x, bullet.y, asteroid.x, asteroid.y);
            
            // If collision detected
            if (d < (bullet.width/2 + asteroid.width/2) * 0.7) {
                // Remove bullet and asteroid
                bullets.splice(i, 1);
                asteroids.splice(j, 1);
                
                // Give points for destroying asteroid
                score += 25;
                break;
            }
        }
    }
}

function updateAndDrawAPIs() {
    for (let i = apis.length - 1; i >= 0; i--) {
        let api = apis[i];
        
        // Update API position
        api.y += api.speed;
        
        // Draw the API bubble
        drawAPIBubble(api.x, api.y, api.width, api.height, api.type, api.state);
        
        // Remove if off-screen
        if (api.y > canvasHeight + 50) {
            apis.splice(i, 1);
        }
    }
}

function updateAndDrawAsteroids() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        let asteroid = asteroids[i];
        
        // Update asteroid position
        asteroid.y += asteroid.speed;
        
        // Draw the asteroid
        drawAlienShip(asteroid.x, asteroid.y, asteroid.width, asteroid.height);
        
        // Check collision with spaceship
        let d = dist(spaceship.x, spaceship.y, asteroid.x, asteroid.y);
        if (d < (spaceship.width/2 + asteroid.width/2) * 0.7) {
            // Collision - game over
            gameState = "gameOver";
            gameOverStartTime = millis();
        }
        
        // Remove if off-screen
        if (asteroid.y > canvasHeight + 50) {
            asteroids.splice(i, 1);
        }
    }
}

function drawAPIBubble(x, y, width, height, type, state) {
    push();
    if (state === "normal") {
        // Normal API bubble - blue
        fill(20, 120, 255, 200);
        stroke(100, 180, 255);
    } else if (state === "correct") {
        // Correct API - green
        fill(0, 255, 100, 200);
        stroke(100, 255, 180);
    } else if (state === "incorrect") {
        // Incorrect API - red
        fill(255, 50, 50, 200);
        stroke(255, 150, 150);
    }
    
    // Thicker stroke and larger bubble
    strokeWeight(3 * scaleRatio);
    ellipse(x, y, width, height);
    
    // Background for text to improve readability
    if (state === "normal") {
        fill(10, 60, 120, 180);
    } else if (state === "correct") {
        fill(0, 120, 50, 180);
    } else if (state === "incorrect") {
        fill(120, 30, 30, 180);
    }
    
    ellipse(x, y, width * 0.8, height * 0.5);
    
    // API text with drop shadow for better visibility
    // Shadow
    fill(0, 0, 0, 150);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(14 * scaleRatio); // Smaller font size for better fit
    text(type, x + 1.5 * scaleRatio, y + 1.5 * scaleRatio);
    
    // Text
    fill(255);
    text(type, x, y);
    pop();
}

function drawAlienShip(x, y, width, height) {
    push();
    translate(x, y);
    
    // Add intimidating glow effect
    noStroke();
    for (let i = 5; i > 0; i--) {
        let alpha = map(i, 5, 0, 10, 50);
        fill(150, 0, 200, alpha);
        ellipse(0, 0, width * 1.5 * i/5, height * 1.5 * i/5);
    }
    
    // Main body - more menacing alien ship
    fill(60, 0, 90); // Darker purple for more evil appearance
    stroke(200, 0, 255); // Brighter purple outline
    strokeWeight(3 * scaleRatio);
    
    // Ship body - more angular and aggressive shape
    beginShape();
    vertex(-width/2, 0);
    vertex(-width/2.5, -height/3); // More pointed front
    vertex(0, -height/2);  // Sharper nose
    vertex(width/2.5, -height/3);
    vertex(width/2, 0);
    // Add jagged spikes at the back
    vertex(width/2.5, height/5);
    vertex(width/3, height/3);
    vertex(width/6, height/4);
    vertex(0, height/2);
    vertex(-width/6, height/4);
    vertex(-width/3, height/3);
    vertex(-width/2.5, height/5);
    endShape(CLOSE);
    
    // Evil red eye/cockpit
    fill(255, 0, 0, 200);
    noStroke();
    ellipse(0, -height/10, width/3, height/4);
    
    // Add pulsing effect to the eye
    let pulseSize = map(sin(frameCount * 0.1), -1, 1, 0.8, 1.2);
    fill(255, 50, 0, 150);
    ellipse(0, -height/10, width/3 * pulseSize, height/4 * pulseSize);
    
    // Weapon mounts - more threatening
    fill(30, 0, 50);
    stroke(150, 0, 200);
    strokeWeight(1.5 * scaleRatio);
    
    // Left cannon
    beginShape();
    vertex(-width/2.5, -height/6);
    vertex(-width/1.8, -height/6);
    vertex(-width/1.8, height/10);
    vertex(-width/2.2, height/10);
    endShape(CLOSE);
    
    // Right cannon
    beginShape();
    vertex(width/2.5, -height/6);
    vertex(width/1.8, -height/6);
    vertex(width/1.8, height/10);
    vertex(width/2.2, height/10);
    endShape(CLOSE);
    
    // Cannon tips - glowing effect
    noStroke();
    fill(255, 0, 0, 150 + 50 * sin(frameCount * 0.1));
    ellipse(-width/1.9, height/10, width/10, height/15);
    ellipse(width/1.9, height/10, width/10, height/15);
    
    // Ominous engine glow
    let enginePulse = map(sin(frameCount * 0.2), -1, 1, 0.7, 1.3);
    fill(255, 50, 0, 180);
    ellipse(-width/4, height/4, width/6 * enginePulse, height/6 * enginePulse);
    ellipse(width/4, height/4, width/6 * enginePulse, height/6 * enginePulse);
    
    // Inner engine glow
    fill(255, 150, 0, 200);
    ellipse(-width/4, height/4, width/10 * enginePulse, height/10 * enginePulse);
    ellipse(width/4, height/4, width/10 * enginePulse, height/10 * enginePulse);
    
    pop();
}

function drawSpaceship() {
    push();
    // Enhanced spaceship design
    translate(spaceship.x, spaceship.y);
    
    // Main body
    fill(0, 220, 0);
    stroke(0, 150, 0);
    strokeWeight(2 * scaleRatio);
    
    // Ship body
    beginShape();
    vertex(0, -spaceship.height/2);
    vertex(-spaceship.width/2, spaceship.height/3);
    vertex(-spaceship.width/4, spaceship.height/4);
    vertex(0, spaceship.height/2);
    vertex(spaceship.width/4, spaceship.height/4);
    vertex(spaceship.width/2, spaceship.height/3);
    endShape(CLOSE);
    
    // Cockpit
    fill(150, 255, 150, 150);
    noStroke();
    ellipse(0, -spaceship.height/6, spaceship.width/3, spaceship.height/3);
    
    // Engines
    fill(255, 100, 0, 200);
    ellipse(-spaceship.width/4, spaceship.height/3, spaceship.width/5, spaceship.height/6);
    ellipse(spaceship.width/4, spaceship.height/3, spaceship.width/5, spaceship.height/6);
    
    // Engine glow - pulsating
    let pulse = sin(frameCount * 0.2) * 3 * scaleRatio;
    fill(255, 150, 0, 100);
    ellipse(-spaceship.width/4, spaceship.height/3 + pulse, spaceship.width/4, spaceship.height/4);
    ellipse(spaceship.width/4, spaceship.height/3 + pulse, spaceship.width/4, spaceship.height/4);
    
    pop();
}

function shoot() {
    // Don't shoot if on cooldown
    if (bulletCooldown > 0) return;
    
    // Create a new bullet
    let bullet = {
        x: spaceship.x,
        y: spaceship.y - 20 * scaleRatio,
        width: 8 * scaleRatio,
        height: 16 * scaleRatio,
        speed: 10 * scaleRatio
    };
    
    // Add bullet to array
    bullets.push(bullet);
    
    // Set cooldown
    bulletCooldown = bulletCooldownTime;
}

function spawnAPI() {
    // Determine if it should be the correct API or a distractor
    let type;
    if (random(1) < 0.3) {
        // 30% chance to spawn the correct API
        type = levels[currentLevel].correctAPI;
    } else {
        // 70% chance to spawn a different API
        let otherAPIs = allAPIs.filter(api => api !== levels[currentLevel].correctAPI);
        type = random(otherAPIs);
    }
    
    // Create the API object
    let api = {
        x: random(50, canvasWidth - 50),
        y: -50,
        width: 100 * scaleRatio,
        height: 100 * scaleRatio,
        type: type,
        state: "normal",
        speed: random(1, 3) * scaleRatio
    };
    
    // Add to array
    apis.push(api);
}

function spawnAsteroid() {
    // Create asteroid (alien ship)
    let asteroid = {
        x: random(50, canvasWidth - 50),
        y: -50,
        width: 80 * scaleRatio,
        height: 50 * scaleRatio,
        speed: random(2, 4) * scaleRatio
    };
    
    // Add to array
    asteroids.push(asteroid);
}

function setupTouchControls() {
    // Only needed for mobile
    if (!isMobileDevice) return;
    
    // Left movement zone (left third of screen)
    leftZone = {
        x: canvasWidth * 0.25,
        y: canvasHeight * 0.75,
        width: canvasWidth * 0.5,
        height: canvasHeight * 0.5
    };
    
    // Right movement zone (right third of screen)
    rightZone = {
        x: canvasWidth * 0.75,
        y: canvasHeight * 0.75,
        width: canvasWidth * 0.5,
        height: canvasHeight * 0.5
    };
    
    // Shoot button (center of screen, bottom quarter)
    shootZone = {
        x: canvasWidth * 0.5,
        y: canvasHeight * 0.6,
        radius: 60 * scaleRatio
    };
    
    console.log("Touch zones set up for mobile");
}

function checkTouchZones() {
    // Reset active states
    leftZoneActive = false;
    rightZoneActive = false;
    shootZoneActive = false;
    
    // Check each touch point
    for (let i = 0; i < touches.length; i++) {
        let touch = touches[i];
        
        // Check left zone
        if (touch.x < canvasWidth * 0.5 && touch.y > canvasHeight * 0.5) {
            leftZoneActive = true;
        }
        
        // Check right zone
        if (touch.x > canvasWidth * 0.5 && touch.y > canvasHeight * 0.5) {
            rightZoneActive = true;
        }
        
        // Check shoot zone (center area)
        let d = dist(touch.x, touch.y, shootZone.x, shootZone.y);
        if (d < shootZone.radius) {
            shootZoneActive = true;
            
            // Shoot if not on cooldown
            if (bulletCooldown === 0 && gameState === "playing") {
                shoot();
            }
        }
    }
    
    // Debug visualization
    if (debugMode) {
        noFill();
        strokeWeight(2);
        
        // Left zone
        if (leftZoneActive) stroke(0, 255, 0);
        else stroke(255, 0, 0);
        rect(leftZone.x, leftZone.y, leftZone.width, leftZone.height);
        
        // Right zone
        if (rightZoneActive) stroke(0, 255, 0);
        else stroke(255, 0, 0);
        rect(rightZone.x, rightZone.y, rightZone.width, rightZone.height);
        
        // Shoot zone
        if (shootZoneActive) stroke(0, 255, 0);
        else stroke(255, 0, 0);
        ellipse(shootZone.x, shootZone.y, shootZone.radius * 2);
    }
}

function touchStarted() {
    if (gameState === "splash") {
        gameState = "instructions";
        return false;
    } else if (gameState === "instructions") {
        gameState = "playing";
        return false;
    } else if (gameState === "levelCompleted" && readyToProceed) {
        // Progress to next level or win screen
        if (currentLevel >= levels.length - 1) {
            // All levels completed, show win screen
            gameState = "won";
            winStartTime = millis();
        } else {
            // Advance to next level
            currentLevel++;
            resetLevel();
            gameState = "playing";
        }
        readyToProceed = false; // Reset for next level
        return false;
    } else if (gameState === "gameOver" && canRestart) {
        resetGame();
        gameState = "playing";
        return false;
    } else if (gameState === "won") {
        // Check if tapped on email input
        let emailFieldX = canvasWidth/2;
        let emailFieldY = canvasHeight * 0.78;
        let emailFieldW = canvasWidth * 0.6;
        let emailFieldH = 40 * scaleRatio;
        
        if (mouseX > emailFieldX - emailFieldW/2 && mouseX < emailFieldX + emailFieldW/2 && 
            mouseY > emailFieldY - emailFieldH/2 && mouseY < emailFieldY + emailFieldH/2) {
            // Show keyboard for email input on mobile
            if (isMobileDevice) {
                showVirtualKeyboard();
            }
        }
        
        // Check if tapped on submit button
        let submitX = canvasWidth/2;
        let submitY = canvasHeight * 0.85;
        let submitW = 180 * scaleRatio;
        let submitH = 40 * scaleRatio;
        
        if (mouseX > submitX - submitW/2 && mouseX < submitX + submitW/2 && 
            mouseY > submitY - submitH/2 && mouseY < submitY + submitH/2) {
            if (!emailSubmitted && !emailSubmitting) {
                submitEmail();
            }
        }
    }
    
    return false;
}

function windowResized() {
    // Adjust canvas for mobile devices
    if (isMobileDevice) {
        canvasWidth = windowWidth;
        canvasHeight = windowHeight;
        scaleRatio = min(canvasWidth / 800, canvasHeight / 600);
        resizeCanvas(canvasWidth, canvasHeight);
        setupTouchControls();
    }
}

function resetGame() {
    // Reset score
    score = 0;
    
    // Start at first level
    currentLevel = 0;
    
    // Reset spaceship
    spaceship = {
        x: canvasWidth / 2,
        y: canvasHeight - 50 * scaleRatio,
        width: 50 * scaleRatio,
        height: 40 * scaleRatio,
        speed: 5 * scaleRatio
    };
    
    // Clear arrays
    bullets = [];
    apis = [];
    asteroids = [];
    
    // Reset cooldown
    bulletCooldown = 0;
    
    // Reset flags
    canRestart = false;
    
    console.log("Game reset complete, starting at level 1");
}

function resetLevel() {
    // Clear game elements
    bullets = [];
    apis = [];
    asteroids = [];
    
    // Reset cooldown
    bulletCooldown = 0;
    
    console.log("Level reset, now on level " + (currentLevel + 1));
}

// Function to create an explosion effect
function createExplosion(x, y, isCorrect) {
    // Create particles for the explosion
    let particleCount = 40;
    let explosion = {
        x: x,
        y: y,
        particles: [],
        timeCreated: millis()
    };
    
    // Create particles with different velocities
    for (let i = 0; i < particleCount; i++) {
        let angle = random(TWO_PI);
        let speed = random(1, 5) * scaleRatio;
        
        // Set colors based on correct/incorrect
        let r, g, b;
        if (isCorrect) {
            // Green explosion for correct API
            r = random(50, 150);
            g = random(200, 255);
            b = random(50, 150);
        } else {
            // Red explosion for incorrect API
            r = random(200, 255);
            g = random(50, 150);
            b = random(50, 100);
        }
        
        explosion.particles.push({
            vx: cos(angle) * speed,
            vy: sin(angle) * speed,
            size: random(3, 10) * scaleRatio,
            color: [r, g, b],
            alpha: 255,
            rotation: random(TWO_PI)
        });
    }
    
    explosions.push(explosion);
}

// Function to update and draw all explosions
function updateAndDrawExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        let explosion = explosions[i];
        let timePassed = millis() - explosion.timeCreated;
        
        // Remove explosion after 1 second
        if (timePassed > 1000) {
            explosions.splice(i, 1);
            continue;
        }
        
        // Update and draw each particle
        for (let j = 0; j < explosion.particles.length; j++) {
            let particle = explosion.particles[j];
            
            // Calculate current position based on elapsed time
            let x = explosion.x + (particle.vx * timePassed * 0.1);
            let y = explosion.y + (particle.vy * timePassed * 0.1);
            
            // Decrease alpha over time
            let alpha = 255 - (timePassed / 1000) * 255;
            
            // Draw particle
            push();
            translate(x, y);
            rotate(particle.rotation + timePassed * 0.01);
            fill(particle.color[0], particle.color[1], particle.color[2], alpha);
            noStroke();
            rect(0, 0, particle.size, particle.size);
            pop();
        }
    }
} 