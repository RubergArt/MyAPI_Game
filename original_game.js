// ADP API Game - Original Version
// Based on the original game brief with proper level progression
// Last updated: March 28, 2025 - Enhanced email input with all valid characters
// March 29, 2025 - Added restart option after winning
// March 30, 2025 - Made play again option always available
// March 31, 2025 - Added epic alien explosions and certificate design
// April 1, 2025 - Added confetti celebration, floating score notifications, and improved bubble text
// April 2, 2025 - Fixed score notifications when hitting correct API bubble
// April 3, 2025 - Added personalized certificates and LinkedIn sharing

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
let gameState = "splash"; // splash, nameInput, instructions, playing, levelCompleted, gameOver, won
let currentLevel = 0;
let canvasWidth, canvasHeight;
let scaleRatio = 1;
let score = 0;
let playerName = "";
let playerNameInput = "";
let nameInputSelected = false;
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

// Add new variables for confetti and score notifications
let confetti = [];
let scoreNotifications = [];

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
    
    // Initialize nameInputSelected to false
    nameInputSelected = false;
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
            
        case "nameInput":
            drawNameInputScreen();
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
            
            // Update and draw score notifications
            updateAndDrawScoreNotifications();
            
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

function drawNameInputScreen() {
    // Title
    fill(50, 150, 255);
    textSize(40 * scaleRatio);
    textAlign(CENTER, CENTER);
    text("Enter Your Name", canvasWidth/2, canvasHeight/3);
    
    // Name input field
    // Background for input field
    fill(0, 30, 80);
    stroke(100, 180, 255);
    strokeWeight(3 * scaleRatio);
    rect(canvasWidth/2, canvasHeight/2, canvasWidth * 0.5, 50 * scaleRatio, 8 * scaleRatio);
    
    // Text inside input field
    if (playerNameInput === "" && !nameInputSelected) {
        fill(150);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(20 * scaleRatio);
        textStyle(ITALIC);
        text("Your Name", canvasWidth/2, canvasHeight/2);
    } else {
        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(20 * scaleRatio);
        textStyle(NORMAL);
        text(playerNameInput, canvasWidth/2, canvasHeight/2);
        
        // Blinking cursor for selected input
        if (nameInputSelected && frameCount % 60 < 30) {
            let txtWidth = textWidth(playerNameInput);
            stroke(255);
            strokeWeight(2 * scaleRatio);
            let xPos = canvasWidth/2 + txtWidth/2 + 5 * scaleRatio;
            line(xPos, canvasHeight/2 - 15 * scaleRatio, xPos, canvasHeight/2 + 15 * scaleRatio);
        }
    }
    
    // Continue button
    fill(50, 150, 255);
    stroke(30, 100, 200);
    strokeWeight(2 * scaleRatio);
    rect(canvasWidth/2, canvasHeight/2 + 80 * scaleRatio, 200 * scaleRatio, 50 * scaleRatio, 8 * scaleRatio);
    
    fill(255);
    noStroke();
    textSize(20 * scaleRatio);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("CONTINUE", canvasWidth/2, canvasHeight/2 + 80 * scaleRatio);
    
    // Note about personalization
    fill(200, 200, 255);
    textSize(16 * scaleRatio);
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);
    text("Your name will appear on your certificate", canvasWidth/2, canvasHeight/2 + 150 * scaleRatio);
    text("(or leave blank to stay anonymous)", canvasWidth/2, canvasHeight/2 + 180 * scaleRatio);
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
    textStyle(BOLD);
    textSize(23 * scaleRatio);
    text(levels[currentLevel].question, canvasWidth/2 + 2 * scaleRatio, 45 * scaleRatio + 2 * scaleRatio);
    
    // Draw the actual question with larger text and better positioning
    fill(255, 255, 255);
    textStyle(BOLD);
    textSize(23 * scaleRatio);
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
    
    // Draw celebratory confetti
    updateAndDrawConfetti();
    
    // Draw score notifications so they're visible after hitting the correct API
    updateAndDrawScoreNotifications();
    
    // Level completed message with personalization
    fill(255);
    textSize(30 * scaleRatio);
    
    // Personalized message if player entered their name
    if (playerName.trim() !== "") {
        text("That's correct, " + playerName + "!", canvasWidth/2, canvasHeight/3 - 20 * scaleRatio);
        text("Well done!", canvasWidth/2, canvasHeight/3 + 20 * scaleRatio);
    } else {
        text("Correct!", canvasWidth/2, canvasHeight/3);
    }
    
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
    // Certificate background
    background(245, 245, 235); // Parchment-like color
    
    // Draw certificate border
    drawCertificateBorder();
    
    // Draw decorative seal - moved higher to avoid overlap with email form
    drawCertificateSeal(canvasWidth/2, canvasHeight * 0.72, 60 * scaleRatio);
    
    // Title
    fill(50, 50, 120);
    textSize(32 * scaleRatio);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("CERTIFICATE OF ACHIEVEMENT", canvasWidth/2, canvasHeight * 0.2);
    
    // Move score to just below the title, above the player's name
    textStyle(BOLD);
    textSize(28 * scaleRatio);
    fill(20, 150, 20);
    text(score + " points", canvasWidth/2, canvasHeight * 0.26);
    
    // Decorative line
    stroke(180, 160, 60);
    strokeWeight(2 * scaleRatio);
    line(canvasWidth * 0.25, canvasHeight * 0.32, canvasWidth * 0.75, canvasHeight * 0.32);
    
    // Main text - updated with player name if provided
    noStroke();
    fill(40, 40, 80);
    textSize(18 * scaleRatio);
    textStyle(NORMAL);
    
    if (playerName.trim() !== "") {
        text("This certifies that", canvasWidth/2, canvasHeight * 0.38);
        
        // Player name in larger, more prominent text
        textStyle(BOLD);
        textSize(26 * scaleRatio);
        text(playerName, canvasWidth/2, canvasHeight * 0.44);
        
        // Rest of certificate text
        textStyle(NORMAL);
        textSize(18 * scaleRatio);
        text("is an", canvasWidth/2, canvasHeight * 0.5);
        
        // API Champion text
        textStyle(ITALIC);
        textSize(24 * scaleRatio);
        text("API Champion", canvasWidth/2, canvasHeight * 0.56);
    } else {
        text("This certifies that you are an", canvasWidth/2, canvasHeight * 0.38);
        
        // Player designation
        textStyle(ITALIC);
        textSize(24 * scaleRatio);
        text("API Champion", canvasWidth/2, canvasHeight * 0.44);
    }
    
    // Description
    textStyle(NORMAL);
    textSize(16 * scaleRatio);
    text("has successfully demonstrated exceptional understanding of", canvasWidth/2, playerName.trim() !== "" ? canvasHeight * 0.62 : canvasHeight * 0.5);
    
    // What they learned
    textStyle(BOLD);
    textSize(20 * scaleRatio);
    text("ADP Marketplace APIs", canvasWidth/2, playerName.trim() !== "" ? canvasHeight * 0.68 : canvasHeight * 0.56);
    
    // Email collection form - moved down to provide more space from the seal
    drawEmailForm();
    
    // Play again option
    drawPlayAgainButton();
    
    // LinkedIn sharing button
    drawLinkedInShareButton();
}

function drawCertificateBorder() {
    // Fancy certificate border
    push();
    noFill();
    strokeWeight(6 * scaleRatio);
    stroke(180, 160, 60); // Gold color
    rect(canvasWidth/2, canvasHeight/2, canvasWidth * 0.9, canvasHeight * 0.9, 10 * scaleRatio);
    
    // Inner border
    strokeWeight(2 * scaleRatio);
    rect(canvasWidth/2, canvasHeight/2, canvasWidth * 0.85, canvasHeight * 0.85, 8 * scaleRatio);
    
    // Decorative corners
    drawCertificateCorner(canvasWidth * 0.1, canvasHeight * 0.1);
    drawCertificateCorner(canvasWidth * 0.9, canvasHeight * 0.1);
    drawCertificateCorner(canvasWidth * 0.1, canvasHeight * 0.9);
    drawCertificateCorner(canvasWidth * 0.9, canvasHeight * 0.9);
    pop();
}

function drawCertificateCorner(x, y) {
    push();
    translate(x, y);
    
    // Draw decorative corner
    stroke(180, 160, 60);
    strokeWeight(3 * scaleRatio);
    noFill();
    
    let size = 30 * scaleRatio;
    
    // Curved corner elements
    beginShape();
    vertex(0, -size);
    bezierVertex(size/2, -size, size, -size/2, size, 0);
    endShape();
    
    beginShape();
    vertex(-size, 0);
    bezierVertex(-size, -size/2, -size/2, -size, 0, -size);
    endShape();
    
    // Small decorative elements
    strokeWeight(2 * scaleRatio);
    ellipse(0, 0, size/2, size/2);
    
    pop();
}

function drawCertificateSeal(x, y, size) {
    push();
    translate(x, y);
    
    // Outer circle
    fill(180, 160, 60, 180); // Gold with transparency
    stroke(100, 90, 30);
    strokeWeight(2 * scaleRatio);
    ellipse(0, 0, size * 2, size * 2);
    
    // Inner circle
    fill(200, 180, 70, 200);
    ellipse(0, 0, size * 1.5, size * 1.5);
    
    // Center emblem
    fill(220, 200, 80);
    noStroke();
    
    // Draw API symbol - stylized "API" letters
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(size * 0.6);
    fill(90, 50, 20);
    text("ADP", 0, -size * 0.1);
    
    textSize(size * 0.35);
    text("MARKETPLACE", 0, size * 0.3);
    
    // Radiating lines for official look
    stroke(100, 90, 30, 150);
    strokeWeight(1.5 * scaleRatio);
    for (let i = 0; i < 16; i++) {
        let angle = i * TWO_PI / 16;
        let x1 = cos(angle) * size * 0.8;
        let y1 = sin(angle) * size * 0.8;
        let x2 = cos(angle) * size;
        let y2 = sin(angle) * size;
        line(x1, y1, x2, y2);
    }
    
    // Ribbon effect underneath
    let ribbonWidth = size * 1.2;
    let ribbonHeight = size * 0.4;
    let ribbonY = size * 0.9;
    
    // Left ribbon
    fill(200, 50, 50);
    stroke(150, 30, 30);
    beginShape();
    vertex(-ribbonWidth/2, ribbonY);
    vertex(-ribbonWidth/4, ribbonY + ribbonHeight);
    vertex(0, ribbonY);
    vertex(0, ribbonY - ribbonHeight);
    endShape(CLOSE);
    
    // Right ribbon
    beginShape();
    vertex(ribbonWidth/2, ribbonY);
    vertex(ribbonWidth/4, ribbonY + ribbonHeight);
    vertex(0, ribbonY);
    vertex(0, ribbonY - ribbonHeight);
    endShape(CLOSE);
    
    pop();
}

function drawEmailForm() {
    // Label with more professional wording - moved down to avoid overlap with seal
    fill(50, 50, 120);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16 * scaleRatio);
    textStyle(NORMAL);
    
    // Condensed text to a single line and positioned clearly above the email input
    text("Enter your email to learn more about ADP's Marketplace APIs:", canvasWidth/2, canvasHeight * 0.83);
    
    // Email input box - moved down slightly to ensure separation from text
    fill(255);
    stroke(180, 160, 60);
    strokeWeight(2 * scaleRatio);
    rect(canvasWidth/2, canvasHeight * 0.91, canvasWidth * 0.5, 40 * scaleRatio, 5 * scaleRatio);
    
    // Email text or placeholder
    if (emailInput === "") {
        fill(150);
        textStyle(ITALIC);
        text("Email address", canvasWidth/2, canvasHeight * 0.91);
    } else {
        fill(0);
        textStyle(NORMAL);
        text(emailInput, canvasWidth/2, canvasHeight * 0.91);
    }
    
    // Submit button or success message
    if (emailSubmitted) {
        // Show success message
        fill(20, 150, 20);
        noStroke();
        textSize(18 * scaleRatio);
        textStyle(NORMAL);
        text("Thank you! Your certificate has been emailed.", canvasWidth/2, canvasHeight * 0.95);
        
        // Add pulsing play again message
        let pulseAmount = map(sin(frameCount * 0.1), -1, 1, 0.8, 1.2);
        fill(180, 100, 20);
        textSize(20 * scaleRatio * pulseAmount);
        text("Press SPACE or tap screen to play again", canvasWidth/2, canvasHeight * 0.99);
    } else if (emailSubmitting) {
        // Show loading indicator
        fill(50, 50, 120);
        noStroke();
        textSize(18 * scaleRatio);
        text("Submitting...", canvasWidth/2, canvasHeight * 0.95);
    } else {
        // Show submit button - styled to match certificate
        fill(220, 200, 80);
        stroke(180, 160, 60);
        strokeWeight(2 * scaleRatio);
        rect(canvasWidth/2, canvasHeight * 0.95, 160 * scaleRatio, 40 * scaleRatio, 5 * scaleRatio);
        
        fill(90, 50, 20);
        noStroke();
        textSize(18 * scaleRatio);
        textStyle(BOLD);
        text("SUBMIT", canvasWidth/2, canvasHeight * 0.95);
    }
    
    // Show error if any
    if (emailError !== "") {
        fill(200, 30, 30);
        textSize(14 * scaleRatio);
        textStyle(NORMAL);
        text(emailError, canvasWidth/2, canvasHeight * 0.98);
    }
}

function drawPlayAgainButton() {
    // If email is being submitted or has been submitted, don't show this button
    if (emailSubmitting || emailSubmitted) return;
    
    // Play Again button at bottom right corner
    fill(50, 120, 50);
    stroke(30, 100, 30);
    strokeWeight(2 * scaleRatio);
    rect(canvasWidth * 0.85, canvasHeight * 0.95, 180 * scaleRatio, 40 * scaleRatio, 5 * scaleRatio);
    
    // Button text
    fill(255);
    noStroke();
    textSize(18 * scaleRatio);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text("PLAY AGAIN", canvasWidth * 0.85, canvasHeight * 0.95);
}

function drawLinkedInShareButton() {
    // If email is being submitted, don't show this button
    if (emailSubmitting) return;
    
    // LinkedIn button at top right corner
    fill(10, 102, 194); // LinkedIn blue
    stroke(8, 82, 156); // Darker blue
    strokeWeight(2 * scaleRatio);
    rect(canvasWidth * 0.85, canvasHeight * 0.85, 180 * scaleRatio, 40 * scaleRatio, 5 * scaleRatio);
    
    // Button text
    fill(255);
    noStroke();
    textSize(16 * scaleRatio);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text("SHARE ON LINKEDIN", canvasWidth * 0.85, canvasHeight * 0.85);
}

function keyPressed() {
    // Space key functions
    if (keyCode === 32) { // SPACE
        if (gameState === "splash") {
            gameState = "nameInput";
            nameInputSelected = false; // Reset input selection
        } else if (gameState === "nameInput") {
            if (nameInputSelected) {
                // Add space to name
                playerNameInput += " ";
            } else {
                // Continue to instructions
                playerName = playerNameInput.trim();
                gameState = "instructions";
                nameInputSelected = false; // Reset input selection
            }
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
        } else if (gameState === "won" && emailSubmitted) {
            // Start a new game after winning and submitting email
            resetGame();
            gameState = "splash";
        }
    }
    
    // Name input handling
    if (gameState === "nameInput" && nameInputSelected) {
        if (keyCode === BACKSPACE) {
            // Handle backspace
            playerNameInput = playerNameInput.slice(0, -1);
            return false; // Prevent browser back
        } else if (keyCode === ENTER || keyCode === RETURN) {
            // Handle enter/return key
            playerName = playerNameInput.trim();
            gameState = "instructions";
            nameInputSelected = false; // Reset input selection
            return false;
        } else if (keyCode >= 32 && keyCode <= 126) {
            // Standard ASCII characters (letters, numbers, punctuation)
            // Limit name length to 20 characters
            if (playerNameInput.length < 20) {
                playerNameInput += key;
            }
            return false;
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
                    
                    // Create floating score notification
                    createScoreNotification(api.x, api.y, "+100", [50, 255, 100]);
                    
                    // Create confetti for level completion
                    createConfetti();
                    
                    // Level completed
                    gameState = "levelCompleted";
                    levelExplanationStartTime = millis();
                } else {
                    // Incorrect API hit
                    api.state = "incorrect";
                    score -= 50; // -50 for incorrect API
                    score = max(0, score); // Prevent negative score
                    
                    // Create floating score notification
                    createScoreNotification(api.x, api.y, "-50", [255, 80, 80]);
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
                
                // Create EPIC explosion at alien ship location
                createAlienExplosion(asteroid.x, asteroid.y);
                
                // Remove asteroid
                asteroids.splice(j, 1);
                
                // Give points for destroying asteroid
                score += 25;
                
                // Create floating score notification
                createScoreNotification(asteroid.x, asteroid.y, "+25", [255, 200, 100]);
                
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
    
    // Calculate text size based on API name length to ensure it fits
    let baseTextSize = 13 * scaleRatio; // Reduced base font size
    let textSizeFactor = map(constrain(type.length, 5, 15), 5, 15, 1.0, 0.7);
    let finalTextSize = baseTextSize * textSizeFactor;
    
    // API text with drop shadow for better visibility
    // Shadow
    fill(0, 0, 0, 150);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(finalTextSize);
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
        gameState = "nameInput";
        nameInputSelected = false; // Reset input selection
        return false;
    } else if (gameState === "nameInput") {
        // Check if tapped on name input
        let inputFieldX = canvasWidth/2;
        let inputFieldY = canvasHeight/2;
        let inputFieldW = canvasWidth * 0.5;
        let inputFieldH = 50 * scaleRatio;
        
        if (mouseX > inputFieldX - inputFieldW/2 && mouseX < inputFieldX + inputFieldW/2 && 
            mouseY > inputFieldY - inputFieldH/2 && mouseY < inputFieldY + inputFieldH/2) {
            
            // Select name input field
            nameInputSelected = true;
            
            // Show keyboard for name input on mobile
            if (isMobileDevice) {
                showVirtualKeyboardForName();
            }
            
            return false;
        }
        
        // Check if tapped on continue button
        let continueX = canvasWidth/2;
        let continueY = canvasHeight/2 + 80 * scaleRatio;
        let continueW = 200 * scaleRatio;
        let continueH = 50 * scaleRatio;
        
        if (mouseX > continueX - continueW/2 && mouseX < continueX + continueW/2 && 
            mouseY > continueY - continueH/2 && mouseY < continueY + continueH/2) {
            
            // Continue to instructions
            playerName = playerNameInput.trim();
            gameState = "instructions";
            nameInputSelected = false; // Reset input selection
            return false;
        }
        
        // Deselect name input if clicked elsewhere
        nameInputSelected = false;
        
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
    } else if (gameState === "won" && emailSubmitted) {
        // Start a new game after winning and submitting email
        resetGame();
        gameState = "splash";
        return false;
    } else if (gameState === "won") {
        // Check if tapped on email input
        let emailFieldX = canvasWidth/2;
        let emailFieldY = canvasHeight * 0.91;
        let emailFieldW = canvasWidth * 0.5;
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
        let submitY = canvasHeight * 0.95;
        let submitW = 160 * scaleRatio;
        let submitH = 40 * scaleRatio;
        
        if (mouseX > submitX - submitW/2 && mouseX < submitX + submitW/2 && 
            mouseY > submitY - submitH/2 && mouseY < submitY + submitH/2) {
            if (!emailSubmitted && !emailSubmitting) {
                submitEmail();
            }
        }
        
        // Check if tapped on play again button
        let playAgainX = canvasWidth * 0.85;
        let playAgainY = canvasHeight * 0.95;
        let playAgainW = 180 * scaleRatio;
        let playAgainH = 40 * scaleRatio;
        
        if (mouseX > playAgainX - playAgainW/2 && mouseX < playAgainX + playAgainW/2 && 
            mouseY > playAgainY - playAgainH/2 && mouseY < playAgainY + playAgainH/2) {
            if (!emailSubmitting) {
                resetGame();
                gameState = "splash";
            }
        }
        
        // Check if tapped on LinkedIn share button
        let linkedInX = canvasWidth * 0.85;
        let linkedInY = canvasHeight * 0.85;
        let linkedInW = 180 * scaleRatio;
        let linkedInH = 40 * scaleRatio;
        
        if (mouseX > linkedInX - linkedInW/2 && mouseX < linkedInX + linkedInW/2 && 
            mouseY > linkedInY - linkedInH/2 && mouseY < linkedInY + linkedInH/2) {
            shareOnLinkedIn();
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
    emailInput = "";
    emailSubmitted = false;
    emailSubmitting = false;
    emailError = "";
    
    // Keep player name across game sessions
    // playerName remains unchanged to keep personalization
    
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

// New function to create an epic alien explosion
function createAlienExplosion(x, y) {
    // Create particles for the explosion
    let particleCount = 80; // More particles than regular explosions
    let explosion = {
        x: x,
        y: y,
        particles: [],
        timeCreated: millis(),
        isAlien: true
    };
    
    // Create particles with different velocities
    for (let i = 0; i < particleCount; i++) {
        let angle = random(TWO_PI);
        let speed = random(2, 7) * scaleRatio; // Faster particles
        
        // Purple and orange colors for alien explosion
        let colorChoice = random(1);
        let r, g, b;
        
        if (colorChoice < 0.5) {
            // Purple flames
            r = random(150, 200);
            g = random(0, 50);
            b = random(200, 255);
        } else {
            // Orange fire
            r = random(200, 255);
            g = random(100, 180);
            b = random(0, 30);
        }
        
        // Add wave-like pattern with sine function
        let waveFreq = random(0.1, 0.3);
        let waveAmp = random(1, 3) * scaleRatio;
        
        explosion.particles.push({
            vx: cos(angle) * speed,
            vy: sin(angle) * speed,
            size: random(4, 12) * scaleRatio, // Larger particles
            color: [r, g, b],
            alpha: 255,
            rotation: random(TWO_PI),
            waveFreq: waveFreq,
            waveAmp: waveAmp
        });
    }
    
    // Also add a shockwave effect
    for (let i = 0; i < 20; i++) {
        let angle = i * TWO_PI / 20;
        explosion.particles.push({
            vx: cos(angle) * 3 * scaleRatio,
            vy: sin(angle) * 3 * scaleRatio,
            size: random(6, 15) * scaleRatio,
            color: [255, 255, 255], // White shockwave
            alpha: 200,
            rotation: 0,
            isShockwave: true,
            expandSpeed: random(1.5, 2.5) * scaleRatio
        });
    }
    
    explosions.push(explosion);
}

// Function to update and draw all explosions
function updateAndDrawExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        let explosion = explosions[i];
        let timePassed = millis() - explosion.timeCreated;
        
        // Remove explosion after 1.5 seconds for regular, 2.5 for alien
        let duration = explosion.isAlien ? 2500 : 1000;
        if (timePassed > duration) {
            explosions.splice(i, 1);
            continue;
        }
        
        // Update and draw each particle
        for (let j = 0; j < explosion.particles.length; j++) {
            let particle = explosion.particles[j];
            
            if (particle.isShockwave) {
                // Draw expanding shockwave
                let expandFactor = 1 + (timePassed * 0.005 * particle.expandSpeed);
                let waveAlpha = 255 - (timePassed / duration) * 255;
                
                push();
                translate(explosion.x, explosion.y);
                noFill();
                stroke(particle.color[0], particle.color[1], particle.color[2], waveAlpha);
                strokeWeight(2 * scaleRatio * (1 - timePassed/duration));
                
                // Draw shockwave circle
                ellipse(0, 0, 
                    particle.size * expandFactor * 10, 
                    particle.size * expandFactor * 10);
                pop();
            } else {
                // Calculate current position based on elapsed time
                // For alien explosions, add sine wave movement for more dynamic effect
                let xOffset = 0;
                let yOffset = 0;
                
                if (explosion.isAlien && particle.waveFreq) {
                    xOffset = sin(timePassed * particle.waveFreq) * particle.waveAmp;
                    yOffset = cos(timePassed * particle.waveFreq * 0.7) * particle.waveAmp;
                }
                
                let x = explosion.x + (particle.vx * timePassed * 0.1) + xOffset;
                let y = explosion.y + (particle.vy * timePassed * 0.1) + yOffset;
                
                // Decrease alpha over time
                let alpha = 255 - (timePassed / duration) * 255;
                
                // For alien explosions, make particles grow slightly then shrink
                let sizeMultiplier = 1;
                if (explosion.isAlien) {
                    let normalizedTime = timePassed / duration;
                    if (normalizedTime < 0.3) {
                        // Grow during first 30% of time
                        sizeMultiplier = map(normalizedTime, 0, 0.3, 0.5, 1.5);
                    } else {
                        // Shrink for the rest
                        sizeMultiplier = map(normalizedTime, 0.3, 1, 1.5, 0.1);
                    }
                }
                
                // Draw particle
                push();
                translate(x, y);
                rotate(particle.rotation + timePassed * 0.01);
                fill(particle.color[0], particle.color[1], particle.color[2], alpha);
                noStroke();
                
                // For alien particles, use different shapes
                if (explosion.isAlien && random(1) < 0.3) {
                    // Occasional triangle for more visual interest
                    let size = particle.size * sizeMultiplier;
                    triangle(0, -size, size/1.5, size/1.5, -size/1.5, size/1.5);
                } else {
                    rect(0, 0, particle.size * sizeMultiplier, particle.size * sizeMultiplier);
                }
                pop();
            }
        }
    }
}

// Function to create celebratory confetti
function createConfetti() {
    // Create a lot of confetti particles
    for (let i = 0; i < 150; i++) {
        // Randomize starting positions across the top area of the screen
        let x = random(canvasWidth * 0.2, canvasWidth * 0.8);
        let y = random(-20, canvasHeight * 0.3);
        
        // Random colors for festive look
        let colors = [
            [255, 50, 50],   // Red
            [50, 255, 100],  // Green
            [50, 150, 255],  // Blue
            [255, 255, 50],  // Yellow
            [255, 150, 50],  // Orange
            [200, 100, 255]  // Purple
        ];
        
        let color = random(colors);
        
        // Random shapes (0 = rectangle, 1 = circle, 2 = triangle)
        let shape = floor(random(3));
        
        confetti.push({
            x: x,
            y: y,
            vx: random(-2, 2) * scaleRatio,
            vy: random(1, 4) * scaleRatio,
            size: random(4, 12) * scaleRatio,
            color: color,
            rotation: random(TWO_PI),
            rotationSpeed: random(-0.1, 0.1),
            shape: shape,
            oscillationSpeed: random(0.01, 0.05),
            oscillationAmplitude: random(1, 3) * scaleRatio,
            timeCreated: millis(),
            lifespan: random(2000, 5000) // Particles live between 2-5 seconds
        });
    }
}

// Function to update and draw confetti particles
function updateAndDrawConfetti() {
    for (let i = confetti.length - 1; i >= 0; i--) {
        let particle = confetti[i];
        let timePassed = millis() - particle.timeCreated;
        
        // Remove old particles
        if (timePassed > particle.lifespan) {
            confetti.splice(i, 1);
            continue;
        }
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Add slight oscillation for fluttering effect
        let oscillation = sin(timePassed * particle.oscillationSpeed) * particle.oscillationAmplitude;
        particle.x += oscillation;
        
        // Update rotation
        particle.rotation += particle.rotationSpeed;
        
        // Gradually slow down velocity 
        particle.vy *= 0.98;
        
        // Calculate alpha based on particle lifetime
        let alpha = map(timePassed, 0, particle.lifespan, 255, 0);
        
        // Draw particle
        push();
        translate(particle.x, particle.y);
        rotate(particle.rotation);
        fill(particle.color[0], particle.color[1], particle.color[2], alpha);
        noStroke();
        
        // Draw different shapes based on the particle type
        if (particle.shape === 0) {
            // Rectangle
            rect(0, 0, particle.size, particle.size * 0.8);
        } else if (particle.shape === 1) {
            // Circle
            ellipse(0, 0, particle.size, particle.size);
        } else {
            // Triangle
            triangle(0, -particle.size/2, 
                    particle.size/2, particle.size/2, 
                    -particle.size/2, particle.size/2);
        }
        pop();
    }
}

// Function to create floating score notifications
function createScoreNotification(x, y, text, color) {
    scoreNotifications.push({
        x: x,
        y: y,
        text: text,
        color: color,
        timeCreated: millis(),
        lifespan: 1500 // Increased lifespan from 1000 to 1500ms for better visibility
    });
}

// Function to update and draw score notifications
function updateAndDrawScoreNotifications() {
    for (let i = scoreNotifications.length - 1; i >= 0; i--) {
        let notification = scoreNotifications[i];
        let timePassed = millis() - notification.timeCreated;
        
        // Remove old notifications
        if (timePassed > notification.lifespan) {
            scoreNotifications.splice(i, 1);
            continue;
        }
        
        // Move notification upward
        notification.y -= 1 * scaleRatio;
        
        // Calculate alpha based on lifetime
        let alpha = map(timePassed, 0, notification.lifespan, 255, 0);
        
        // Calculate size with a slight pulse effect
        let pulseAmount = map(sin(timePassed * 0.02), -1, 1, 0.9, 1.1);
        let size = 24 * scaleRatio * pulseAmount;
        
        // Draw text
        push();
        fill(notification.color[0], notification.color[1], notification.color[2], alpha);
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textSize(size);
        text(notification.text, notification.x, notification.y);
        pop();
    }
}

// Function to show virtual keyboard for name input on mobile
function showVirtualKeyboardForName() {
    if (!isMobileDevice) return; // Only needed on mobile
    
    // Use browser's prompt for name input
    let name = prompt("Enter your name:");
    if (name !== null) {
        playerNameInput = name.substring(0, 20); // Limit to 20 characters
    }
}

// Function to share certificate on LinkedIn
function shareOnLinkedIn() {
    // Create share text based on player name and score
    let nameText = playerName.trim() !== "" ? playerName : "I";
    let shareText = encodeURIComponent(`${nameText} just earned an API Champion certificate with a score of ${score} points in the ADP API Game! Think you can beat this score? Try the game and test your API knowledge!`);
    
    // LinkedIn sharing URL
    let shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&title=${shareText}`;
    
    // Open LinkedIn share dialog in a new window
    window.open(shareUrl, '_blank', 'width=600,height=600');
    
    console.log("Sharing on LinkedIn:", shareUrl);
} 