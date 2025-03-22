// Define the levels with HR use cases and corresponding correct APIs
const levels = [
    { objective: "Which API would you use to onboard a new worker to your payroll app?", correctAPI: "Hire API", explanation: "The Hire API handles all aspects of adding new workers to your payroll system with proper data validation." },
    { objective: "Which API would you implement for a compensation update?", correctAPI: "Rate change API", explanation: "The Rate change API ensures accurate and compliant updates to worker compensation data." },
    { objective: "Which API would you select to process an internal promotion?", correctAPI: "Job change API", explanation: "The Job change API manages role transitions with proper validation and historical tracking." },
    { objective: "Which API would you use to pay time worked for time and attendance data in payroll?", correctAPI: "Pay Data API", explanation: "The Pay Data API integrates hours worked to be paid in your payroll processing system." },
    { objective: "Which API would you implement for a worker who leaves your employment?", correctAPI: "Terminate API", explanation: "The Terminate API handles workers leaving process with proper validation and compliance checks." }
];

// Game variables
let currentLevel = 0;
let gameState = "splash"; // "splash", "about", "playing", "levelCompleted", "exploding", "won", "lost"
let spaceship;
let apis = [];
let asteroids = [];
let bullets = [];
let frameCountAPI = 0;
let apiSpawnInterval = 60; // Spawn API every 60 frames (~1 second at 60fps)
let frameCountAsteroid = 0;
let asteroidSpawnInterval = 120; // Spawn asteroid every 120 frames (~2 seconds at 60fps)
let bulletCooldown = 0;
let debugMode = false; // Set to false for normal gameplay

// Mobile variables
let isMobile = false;
let canvasWidth = 800;
let canvasHeight = 600;
let scaleRatio = 1; // For scaling elements on different screen sizes
let touchZones = {
    left: { x: 0, y: 0, width: 0, height: 0, active: false },
    right: { x: 0, y: 0, width: 0, height: 0, active: false },
    shoot: { x: 0, y: 0, radius: 0, active: false }
};

// Celebration variables
let celebrationStartTime = 0;
let celebrationDuration = 5000; // Increased from 3000 to 5000 (5 seconds)
let fireworks = [];

// Explosion variables
let explosionParticles = [];
let explosionStartTime = 0;
let explosionDuration = 2000; // 2 seconds

// Global variables
let ship;
let particles = [];
let textParticles = []; // For floating text effects
let flashMessage = "";
let flashTimer = 0;
let flashColor = [255, 255, 255];

// Email collection variables
let emailInput = "";
let showEmailCollection = false;
let emailSubmitted = false;
let emailSubmitting = false;
let emailError = "";
let emailSuccess = "";
let emailCursorVisible = true;
let emailCursorTimer = 0;
let emailInputActive = false;
let supabaseClient = null;

// Replace these with your actual Supabase project URL and anon key
// You can find these in your Supabase project settings > API
let SUPABASE_URL = "https://kefnolneobwsjavsgsdt.supabase.co";
let SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZm5vbG5lb2J3c2phdnNnc2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNDg1NDYsImV4cCI6MjA1NzcyNDU0Nn0.psI5RW-wOv-jKqkGaUKU_rjda9-YfWpEDND4TTSZZAg";

// Galaxy background variables
let stars = [];         // Small background stars
let nebulae = [];       // Colored nebula clouds
let starLayers = 3;     // Different layers of stars (parallax effect)

let score = 0;
let lives = 3;

// Add variables for LinkedIn sharing and professional features
let companyName = "Your Company"; // Users can customize this
let playerName = "HR Professional";
let shareMessage = "";
let linkedInLink = "";
let showLinkedInPrompt = false;
let professionalTitle = "Payroll & HR API Expert";
let gameStartTime = 0; // Needed for in-game timer in stats panel

// Add branding and professional game states
let brandColor = [20, 80, 140]; // Professional blue
let tagline = "Mastering Payroll & HR APIs";
let splashTimeout = 3000; // 3 seconds splash screen

// Professional profile variables
let profileTitles = [
    "Payroll & HR API Expert", 
    "HRIS Integration Specialist", 
    "Payroll Systems Architect",
    "HR Technology Consultant", 
    "Workforce Solutions Developer"
];
let currentProfileIndex = 0;
let customizeNameMode = false;
let inputName = "Your Name";
let cursorVisible = true;
let cursorTimer = 0;
let inputActive = false;

// Add this global variable at the top with the other variables
let targetAPI = ""; // Will store the currently targeted API type

// Initialize variables needed for game functionality
// These variables will be properly initialized in setup() and resetGame()
let leftZone, rightZone, shootZone;
let leftZoneActive = false;
let rightZoneActive = false;
let shootZoneActive = false;
let canRestart = false;
let gameOverStartTime = 0;
let winTime = 0;
let targetAPICount = 10; // Number of correct APIs needed to win
let bulletCooldownTime = 15; // Frames between shots
let apiSpawnRate = 120; // Frames between API spawns
let asteroidSpawnRate = 180; // Frames between asteroid spawns

// Setup function to initialize the canvas and spaceship
function setup() {
    // CRITICAL FIX: Define and synchronize mobile detection
    isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    isMobile = isMobileDevice; // Ensure both variables match
    
    console.log("Device detected as:", isMobileDevice ? "mobile" : "desktop");
    
    // Explicitly hide loading messages early
    if (typeof window !== 'undefined' && window.hideLoadingMessages) {
        window.hideLoadingMessages();
        console.log("Early hideLoadingMessages called");
    } else if (typeof window !== 'undefined' && window.document) {
        // Direct DOM manipulation if function not available
        var loadingMsg = document.getElementById('loadingMessage');
        var errorMsg = document.getElementById('errorMessage');
        var minimalLink = document.getElementById('minimalGameLink');
        
        if (loadingMsg) loadingMsg.style.display = 'none';
        if (errorMsg) errorMsg.style.display = 'none';
        if (minimalLink) minimalLink.style.display = 'none';
        
        console.log("Direct DOM manipulation to hide messages");
    }
    
    // Set canvas size based on device
    if (isMobileDevice) {
        // Use full window size for mobile
        canvasWidth = windowWidth;
        canvasHeight = windowHeight;
        
        // Calculate scale ratio based on reference size (800x600)
        scaleRatio = min(canvasWidth / 800, canvasHeight / 600);
    } else {
        // Use fixed size for desktop
        canvasWidth = 800;
        canvasHeight = 600;
        scaleRatio = 1; // Desktop always uses scale ratio of 1
    }
    
    // Create the canvas
    createCanvas(canvasWidth, canvasHeight);
    rectMode(CENTER); // Draw rectangles from their center
    textAlign(CENTER, CENTER); // Center text horizontally and vertically
    
    // Initialize email variables explicitly
    emailInput = ""; // Ensure this is initialized as a string
    emailInputActive = false;
    emailSubmitting = false;
    emailSubmitted = false;
    emailError = "";
    
    // CRITICAL FIXES FOR GAMEPLAY
    
    // Initialize/reset the game
    resetGame();
    
    // Create galaxy background elements
    createGalaxyBackground();
    
    // Set up touch zones for mobile controls
    setupTouchControls();
    
    // Record start time for game statistics
    gameStartTime = millis();
    
    console.log("Setup complete. Game initialized with canvas size:", canvasWidth, "x", canvasHeight);
    
    // Set global variable to indicate setup is complete
    if (typeof window !== 'undefined') {
        window.gameSetupComplete = true;
    }
    
    // Hide loading message now that setup is complete (again, to be sure)
    if (typeof window !== 'undefined' && window.hideLoadingMessages) {
        window.hideLoadingMessages();
        console.log("Final hideLoadingMessages called");
    }
}

// Set up touch control areas for mobile
function setupTouchControls() {
    console.log("Setting up touch controls");
    
    // Define left movement zone (left third of screen, bottom half)
    leftZone = {
        x: canvasWidth * 0.25,
        y: canvasHeight * 0.75, // Positioned lower for better thumb access
        width: canvasWidth * 0.5,
        height: canvasHeight * 0.5
    };
    
    // Define right movement zone (right third of screen, bottom half)
    rightZone = {
        x: canvasWidth * 0.75,
        y: canvasHeight * 0.75, // Positioned lower for better thumb access
        width: canvasWidth * 0.5,
        height: canvasHeight * 0.5
    };
    
    // Define shoot button zone (center of screen, bottom quarter)
    // Make it a circle with larger radius for easy tapping
    shootZone = {
        x: canvasWidth * 0.5,
        y: canvasHeight * 0.6, // Higher position for better access
        radius: 60 * scaleRatio // Larger radius for easier tapping
    };
    
    console.log("Touch zones configured:", 
                "Left:", leftZone, 
                "Right:", rightZone, 
                "Shoot:", shootZone);
}

// Window resize handler
function windowResized() {
    if (isMobile) {
        canvasWidth = windowWidth;
        canvasHeight = windowHeight;
        scaleRatio = min(canvasWidth / 800, canvasHeight / 600);
        resizeCanvas(canvasWidth, canvasHeight);
        setupTouchControls();
    }
}

// Create stars and nebulae for galaxy background
function createGalaxyBackground() {
    // Create stars (multiple layers for parallax effect)
    stars = [];
    for (let layer = 0; layer < starLayers; layer++) {
        let layerSpeed = map(layer, 0, starLayers - 1, 0.1, 0.5);
        let numStars = map(layer, 0, starLayers - 1, 100, 50);
        let maxSize = map(layer, 0, starLayers - 1, 2, 3);
        
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: random(canvasWidth),
                y: random(canvasHeight),
                size: random(0.5, maxSize),
                brightness: random(100, 255),
                twinkleSpeed: random(0.02, 0.05),
                twinkleOffset: random(TWO_PI),
                layer: layer,
                speed: layerSpeed
            });
        }
    }
    
    // Create nebula clouds
    nebulae = [];
    let nebulaColors = [
        [70, 30, 120, 5],  // Purple
        [30, 80, 130, 5],  // Blue
        [130, 30, 100, 5]   // Pink
    ];
    
    for (let i = 0; i < 6; i++) {
        let color = random(nebulaColors);
        nebulae.push({
            x: random(canvasWidth),
            y: random(canvasHeight),
            size: random(150, 350),
            color: color,
            speed: 0.05
        });
    }
}

// Main game loop
function draw() {
    try {
        // Clear the canvas
        background(0);
        
        // Handle different game states
        if (gameState === "splash") {
            drawSplashScreen();
            
            // DEBUG: Log state for troubleshooting
            if (frameCount % 60 === 0) {
                console.log("In splash state, waiting for input");
            }
        } 
        else if (gameState === "about") {
            drawAboutScreen();
        }
        else if (gameState === "playing") {
            // Draw starry background
            drawStarryBackground();
            
            // Process player movement based on key presses or touch controls
            handlePlayerMovement();
            
            // For mobile devices, check touch zones
            if (isMobileDevice) {
                checkTouchZones();
            }
            
            // CRITICAL FIX: Draw the spaceship directly
            drawSpaceship();
            
            // CRITICAL FIX: Draw and update bullets
            try {
                updateAndDrawBullets();
            } catch (bulletError) {
                console.error("Error in bullet processing:", bulletError);
                // Don't let bullet errors crash the game
            }
            
            // CRITICAL FIX: Explicitly update and draw APIs
            for (let i = apis.length - 1; i >= 0; i--) {
                let api = apis[i];
                
                // Update API position
                api.y += api.speed * scaleRatio;
                
                // Check if API is off screen
                if (api.y > canvasHeight + 50) {
                    // Remove the API
                    apis.splice(i, 1);
                    
                    // Penalize missing an API
                    if (api.state === "normal") {
                        score -= 1;
                        score = max(0, score); // Prevent negative score
                    }
                    
                    continue;
                }
                
                // Draw the API
                drawAPIBubble(api.x, api.y, api.width, api.height, api.type, api.state);
            }
            
            // CRITICAL FIX: Update and draw asteroids
            for (let i = asteroids.length - 1; i >= 0; i--) {
                let asteroid = asteroids[i];
                
                // Update asteroid position
                asteroid.y += asteroid.speed * scaleRatio;
                
                // Check if asteroid is off screen
                if (asteroid.y > canvasHeight + 50) {
                    asteroids.splice(i, 1);
                    continue;
                }
                
                // Draw the asteroid (now alien ship)
                drawAlienShip(asteroid.x, asteroid.y, asteroid.width, asteroid.height);
                
                // Check collision with spaceship
                let d = dist(spaceship.x, spaceship.y, asteroid.x, asteroid.y);
                if (d < (spaceship.width / 2 + asteroid.width / 2) * 0.7) {
                    // Collision with spaceship - player loses
                    gameState = "gameover";
                    // Store when the game over state started
                    gameOverStartTime = millis();
                    console.log("Game over triggered by collision with asteroid");
                }
            }
            
            // Spawn new APIs periodically
            if (frameCount % apiSpawnRate === 0) {
                spawnAPI();
                console.log("Spawned new API, total:", apis.length);
            }
            
            // Spawn new asteroids periodically
            if (frameCount % asteroidSpawnRate === 0) {
                spawnAsteroid();
                console.log("Spawned new asteroid, total:", asteroids.length);
            }
            
            // Process bullet cooldown
            if (bulletCooldown > 0) {
                bulletCooldown--;
            }
            
            // Draw score
            fill(255);
            textSize(16 * scaleRatio);
            textAlign(LEFT, TOP);
            text("Score: " + score, 20 * scaleRatio, 20 * scaleRatio);
            
            // Draw correct and incorrect counts
            textSize(12 * scaleRatio);
            text("Correct: " + correctAPICount, 20 * scaleRatio, 50 * scaleRatio);
            text("Incorrect: " + incorrectAPICount, 20 * scaleRatio, 70 * scaleRatio);
            
            // Draw API count to win
            textAlign(RIGHT, TOP);
            text("APIs to win: " + (targetAPICount - correctAPICount), canvasWidth - 20 * scaleRatio, 20 * scaleRatio);
            
            // Display target API info at bottom of screen
            textAlign(LEFT, BOTTOM);
            fill(255, 255, 100);
            textSize(14 * scaleRatio);
            text("Target API: " + targetAPI, 20 * scaleRatio, canvasHeight - 20 * scaleRatio);
            
            // NEW: Draw the prominent API objective display
            drawAPIObjective();
            
            // Check win condition
            if (correctAPICount >= targetAPICount) {
                gameState = "won";
                winTime = millis();
                console.log("Win condition met!");
            }
        } 
        else if (gameState === "gameover") {
            drawGameOverScreen();
            
            // Check if enough time has passed to allow restart
            if (millis() - gameOverStartTime > 2000) {
                canRestart = true;
            }
        } 
        else if (gameState === "won") {
            drawWinScreen();
        }
        
        // Debug overlay if debug mode is enabled
        if (debugMode) {
            fill(255);
            textSize(12 * scaleRatio);
            textAlign(LEFT, TOP);
            text("FPS: " + Math.floor(frameRate()), 10, canvasHeight - 60);
            text("Game State: " + gameState, 10, canvasHeight - 45);
            text("APIs: " + apis.length + ", Asteroids: " + asteroids.length + ", Bullets: " + bullets.length, 10, canvasHeight - 30);
            text("Device: " + (isMobileDevice ? "Mobile" : "Desktop") + ", Scale: " + scaleRatio.toFixed(2), 10, canvasHeight - 15);
        }
    } catch (e) {
        // Error recovery
        console.error("Error in draw loop:", e);
        text("Error: " + e.message, canvasWidth/2, canvasHeight/2);
        text("Press ENTER to restart", canvasWidth/2, canvasHeight/2 + 30);
        
        if (keyIsDown(ENTER)) {
            resetGame();
        }
    }
}

// Handle player movement from keyboard or touch
function handlePlayerMovement() {
    // Default speed
    let moveSpeed = 5 * scaleRatio;
    
    // For desktop: keyboard controls
    if (!isMobileDevice) {
        if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // Left arrow or 'A'
            spaceship.x -= moveSpeed;
        }
        if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // Right arrow or 'D'
            spaceship.x += moveSpeed;
        }
        
        // Shooting with spacebar
        if (keyIsDown(32) && bulletCooldown <= 0) { // Spacebar
            shoot();
            bulletCooldown = bulletCooldownTime;
        }
    }
    // For mobile: touch controls are handled in checkTouchZones()
    else {
        if (leftZoneActive) {
            spaceship.x -= moveSpeed;
        }
        if (rightZoneActive) {
            spaceship.x += moveSpeed;
        }
    }
    
    // Keep the spaceship within the canvas bounds
    spaceship.x = constrain(spaceship.x, spaceship.width/2, canvasWidth - spaceship.width/2);
}

// Draw touch controls on mobile
function drawTouchControls() {
    // Make controls more visible for better mobile gameplay
    let controlOpacity = debugMode ? 150 : 80; // Increased opacity for better visibility
    
    // Left movement zone
    noStroke();
    if (touchZones.left.active) {
        fill(0, 200, 255, controlOpacity + 50); // More visible when active
    } else {
        fill(200, 200, 200, controlOpacity);
    }
    
    // Left arrow indicator - Draw a full button shape for better touch response
    push();
    rectMode(CENTER);
    rect(touchZones.left.x, touchZones.left.y, touchZones.left.width * 0.4, canvasHeight * 0.3, 10 * scaleRatio);
    fill(255, 255, 255, controlOpacity + 80);
    textSize(24 * scaleRatio);
    text("←", touchZones.left.x, touchZones.left.y);
    pop();
    
    // Right movement zone
    if (touchZones.right.active) {
        fill(0, 200, 255, controlOpacity + 50);
    } else {
        fill(200, 200, 200, controlOpacity);
    }
    
    // Right arrow indicator - Draw a full button shape for better touch response
    push();
    rectMode(CENTER);
    rect(touchZones.right.x, touchZones.right.y, touchZones.right.width * 0.4, canvasHeight * 0.3, 10 * scaleRatio);
    fill(255, 255, 255, controlOpacity + 80);
    textSize(24 * scaleRatio);
    text("→", touchZones.right.x, touchZones.right.y);
    pop();
    
    // Shoot button - make larger and more visible
    if (touchZones.shoot.active) {
        fill(255, 50, 50, controlOpacity + 50);
    } else {
        fill(255, 150, 0, controlOpacity + 20);
    }
    ellipse(touchZones.shoot.x, touchZones.shoot.y, touchZones.shoot.radius * 2.2, touchZones.shoot.radius * 2.2);
    
    fill(255, 255, 255, controlOpacity + 100);
    textSize(20 * scaleRatio);
    text("FIRE", touchZones.shoot.x, touchZones.shoot.y);
}

// Shoot bullets function
function shoot() {
    // Create a new bullet without any sound references
    let bullet = {
        x: spaceship.x,
        y: spaceship.y - 20 * scaleRatio,
        width: 8 * scaleRatio,
        height: 16 * scaleRatio,
        speed: 10
    };
    
    // Add the bullet to the array
    bullets.push(bullet);
    
    // No sound code at all
}

// Touch event handlers
function touchStarted() {
    // For splash screen
    if (gameState === "splash") {
        gameState = "playing";
        return false;
    }
    
    // For game over screen
    if (gameState === "gameover" && canRestart) {
        resetGame();
        return false;
    }
    
    // For win screen
    if (gameState === "won") {
        resetGame();
        return false;
    }
    
    return true;
}

function touchMoved() {
    if (!isMobile) return true; // Allow normal events on desktop
    
    // Update touch zones for game controls in playing state
    if (gameState === "playing") {
        checkTouchZones();
    }
    
    // Prevent default to avoid browser gestures
    return false;
}

function touchEnded() {
    if (!isMobile) return true; // Allow normal events on desktop
    
    console.log("Touch ended, game state:", gameState);
    
    // Handle splash screen - touching moves to about screen
    if (gameState === "splash") {
        if (millis() > splashTimeout / 2) { // Allow skipping after half the splash time
            gameState = "about";
            return false;
        }
    }
    
    // Allow skipping celebration screen with touch
    if (gameState === "levelCompleted") {
        // Advance to next level
        currentLevel++;
        if (currentLevel >= levels.length) {
            gameState = "won"; // Win if all levels completed
        } else {
            gameState = "playing"; // Continue to next level
            // Clear objects for the next level
            apis = [];
            asteroids = [];
            bullets = [];
            fireworks = [];
        }
        return false;
    }
    
    // Clear the touch zones when touch ends
    touchZones.left.active = false;
    touchZones.right.active = false;
    
    // Keep shoot button active if another touch is still on it
    touchZones.shoot.active = false;
    for (let i = 0; i < touches.length; i++) {
        if (dist(touches[i].x, touches[i].y, touchZones.shoot.x, touchZones.shoot.y) < touchZones.shoot.radius) {
            touchZones.shoot.active = true;
            break;
        }
    }
    
    // MOBILE TOUCH HANDLING FOR WIN SCREEN - Handle email form and LinkedIn button
    if (gameState === "won" && touches.length > 0) {
        let touch = touches[0];
        
        // Check if email form is displayed and not yet submitted
        if (!emailSubmitted) {
            // Get stored email field coordinates or use fallback
            let emailFieldX, emailFieldY, emailFieldW, emailFieldH;
            
            if (window.emailField) {
                emailFieldX = window.emailField.x;
                emailFieldY = window.emailField.y;
                emailFieldW = window.emailField.w;
                emailFieldH = window.emailField.h;
            } else {
                // Fallback to direct coordinates
                emailFieldW = 220 * scaleRatio;
                emailFieldH = 36 * scaleRatio;
                emailFieldX = canvasWidth / 2 - emailFieldW / 2 - 70 * scaleRatio;
                emailFieldY = canvasHeight * 0.58;
            }
            
            // Check if touched on email input field
            if (touch.x > emailFieldX && touch.x < emailFieldX + emailFieldW && 
                touch.y > emailFieldY && touch.y < emailFieldY + emailFieldH) {
                console.log("Email input field touched");
                emailInputActive = true;
                return false;
            }
            
            // Get stored submit button coordinates or use fallback
            let submitBtnX, submitBtnY, submitBtnW, submitBtnH;
            
            if (window.emailSubmitBtn) {
                submitBtnX = window.emailSubmitBtn.x;
                submitBtnY = window.emailSubmitBtn.y;
                submitBtnW = window.emailSubmitBtn.w;
                submitBtnH = window.emailSubmitBtn.h;
            } else {
                // Fallback for submit button
                submitBtnW = 120 * scaleRatio;
                submitBtnH = 36 * scaleRatio;
                submitBtnX = emailFieldX + emailFieldW + 20 * scaleRatio;
                submitBtnY = emailFieldY;
            }
            
            // Check if touched on submit button
            if (touch.x > submitBtnX && touch.x < submitBtnX + submitBtnW && 
                touch.y > submitBtnY && touch.y < submitBtnY + submitBtnH) {
                console.log("Submit button touched");
                if (!emailSubmitting) {
                    submitEmailToSupabase();
                }
                return false;
            }
            
            // Get stored skip button coordinates or use fallback
            let skipBtnX, skipBtnY, skipBtnW, skipBtnH;
            
            if (window.emailSkipBtn) {
                skipBtnX = window.emailSkipBtn.x;
                skipBtnY = window.emailSkipBtn.y;
                skipBtnW = window.emailSkipBtn.w;
                skipBtnH = window.emailSkipBtn.h;
            } else {
                // Fallback for skip button
                skipBtnW = 120 * scaleRatio;
                skipBtnH = 30 * scaleRatio;
                skipBtnX = canvasWidth / 2 - skipBtnW/2;
                skipBtnY = emailFieldY + emailFieldH + 15 * scaleRatio;
            }
            
            // Check if touched on skip button
            if (touch.x > skipBtnX && touch.x < skipBtnX + skipBtnW && 
                touch.y > skipBtnY && touch.y < skipBtnY + skipBtnH) {
                console.log("Skip button touched");
                emailSubmitted = true; // Mark as submitted to hide the form
                return false;
            }
            
            // If touched outside, deactivate input
            emailInputActive = false;
        }
        
        // LinkedIn share button touch - using updated position
        let linkedinY = canvasHeight * 0.81;
        let linkedinW = 300 * scaleRatio;
        let linkedinH = 45 * scaleRatio;
        
        if (touch.x > canvasWidth / 2 - linkedinW / 2 && touch.x < canvasWidth / 2 + linkedinW / 2 &&
            touch.y > linkedinY - linkedinH / 2 && touch.y < linkedinY + linkedinH / 2) {
            
            console.log("LinkedIn button touched");
            // Create personalized share message
            shareMessage = playerName + " scored " + score + " points as a " + 
                           professionalTitle + " in this interactive Payroll & HR API Challenge! " +
                           "#PayrollAPI #HRTech #APIs #PayrollIntegration";
            
            // Open LinkedIn sharing dialog
            linkedInLink = "https://www.linkedin.com/sharing/share-offsite/?url=" + 
                           encodeURIComponent(window.location.href) + 
                           "&title=" + encodeURIComponent(shareMessage);
            
            window.open(linkedInLink, "_blank");
            return false;
        }
    }
    
    // Check if user tapped on restart for game over screen
    if ((gameState === "lost" || gameState === "won") && touches.length > 0 &&
        dist(touches[0].x, touches[0].y, canvasWidth/2, canvasHeight/2 + 100 * scaleRatio) < 100 * scaleRatio) {
        resetGame();
    }
    
    // Check for the modal email collection form
    if (showEmailCollection && touches.length > 0) {
        let touch = touches[0];
        
        // Email input field
        let inputY = canvasHeight / 2 - canvasHeight * 0.02;
        let inputW = 300 * scaleRatio;
        let inputH = 40 * scaleRatio;
        
        // Check if email input field was touched
        if (touch.x > canvasWidth / 2 - inputW / 2 && touch.x < canvasWidth / 2 + inputW / 2 &&
            touch.y > inputY - inputH / 2 && touch.y < inputY + inputH / 2) {
            emailInputActive = true;
            return false;
        } else {
            emailInputActive = false;
        }
        
        // Submit button position
        let submitY = canvasHeight / 2 + canvasHeight * 0.07;
        let submitW = 200 * scaleRatio;
        let submitH = 40 * scaleRatio;
        
        // Check if submit button was touched
        if (touch.x > canvasWidth / 2 - submitW / 2 && touch.x < canvasWidth / 2 + submitW / 2 &&
            touch.y > submitY - submitH / 2 && touch.y < submitY + submitH / 2) {
            if (!emailSubmitting) {
                submitEmailToSupabase();
            }
            return false;
        }
        
        // Skip button position
        let skipY = canvasHeight / 2 + canvasHeight * 0.13;
        let skipW = 140 * scaleRatio;
        let skipH = 40 * scaleRatio;
        
        // Check if skip button was touched
        if (touch.x > canvasWidth / 2 - skipW / 2 && touch.x < canvasWidth / 2 + skipW / 2 &&
            touch.y > skipY - skipH / 2 && touch.y < skipY + skipH / 2) {
            console.log("Skip button touched, hiding email form");
            showEmailCollection = false;
            return false;
        }
    }
    
    // Prevent default to avoid browser gestures
    return false;
}

// Check which touch zones are being activated
function checkTouchZones() {
    // Only process if in the playing state
    if (gameState !== "playing") return;
    
    // Reset active states
    leftZoneActive = false;
    rightZoneActive = false;
    shootZoneActive = false;
    
    // Debug output
    if (debugMode && touches.length > 0) {
        console.log("Touches:", touches.length, "Touch points:", touches);
    }
    
    // Check each touch point
    for (let i = 0; i < touches.length; i++) {
        let touch = touches[i];
        
        // Convert touch coordinates to canvas coordinates if needed
        let touchX = touch.x;
        let touchY = touch.y;
        
        // Left zone check - only bottom portion of left side
        if (touchX < canvasWidth * 0.33 && touchY > canvasHeight * 0.5) {
            leftZoneActive = true;
            
            if (debugMode) {
                console.log("Left zone activated");
            }
        }
        
        // Right zone check - only bottom portion of right side
        if (touchX > canvasWidth * 0.67 && touchY > canvasHeight * 0.5) {
            rightZoneActive = true;
            
            if (debugMode) {
                console.log("Right zone activated");
            }
        }
        
        // Shoot zone check - distance-based for the center button
        let d = dist(touchX, touchY, shootZone.x, shootZone.y);
        if (d < shootZone.radius) {
            shootZoneActive = true;
            
            if (debugMode) {
                console.log("Shoot zone activated");
            }
            
            // Force a bullet shot if cooldown allows
            if (bulletCooldown <= 0) {
                shoot();
                bulletCooldown = bulletCooldownTime;
            }
        }
    }
}

// Add a new keyPressed function to handle shooting more reliably
function keyPressed() {
    console.log("Key pressed:", keyCode, key);
    
    // Debug toggle
    if (key === 'd' || key === 'D') {
        debugMode = !debugMode;
        console.log("Debug mode:", debugMode);
        return false;
    }
    
    // Add state transitions
    if (gameState === "splash") {
        if (keyCode === 32 || keyCode === ENTER) { // Space or Enter
            console.log("Transitioning from splash to playing");
            gameState = "playing";
            return false;
        }
    } 
    else if (gameState === "gameover") {
        if ((keyCode === 32 || keyCode === ENTER) && canRestart) { // Space or Enter when restart allowed
            console.log("Restarting game from game over");
            resetGame();
            return false;
        }
    }
    else if (gameState === "playing") {
        if (keyCode === ESCAPE) {
            gameState = "paused";
            return false;
        }
    }
    else if (gameState === "paused") {
        if (keyCode === ESCAPE) {
            gameState = "playing";
            return false;
        }
    }
    else if (gameState === "won") {
        if (keyCode === ENTER) {
            console.log("Restarting game from win screen");
            resetGame();
            return false;
        }
    }
    
    return true;
}

// Handle regular key typing for name input
function keyTyped() {
    console.log("keyTyped - key:", key, "gameState:", gameState, "emailInputActive:", emailInputActive);
    
    // Handle integrated email form in won screen
    if (gameState === "won" && !emailSubmitted && emailInputActive) {
        // Only add printable characters, and limit length
        if (key.length === 1 && key.charCodeAt(0) >= 32 && key.charCodeAt(0) <= 126) {
            if (emailInput.length < 50) {
                emailInput += key;
                console.log("Added to email input:", emailInput);
            }
        }
        return false; // Prevent default browser behavior
    }
    
    // Handle email input for modal form
    if (showEmailCollection && emailInputActive) {
        // Only add printable characters, and limit length
        if (key.length === 1 && key.charCodeAt(0) >= 32 && key.charCodeAt(0) <= 126) {
            if (emailInput.length < 50) {
                emailInput += key;
                console.log("Added to modal email input:", emailInput);
            }
        }
        return false; // Prevent default browser behavior
    }
    
    // Handle name input when customizing
    if (gameState === "about" && customizeNameMode) {
        if (key.length === 1 && key.charCodeAt(0) >= 32 && key.charCodeAt(0) <= 126) {
            if (inputName.length < 20) {
                inputName += key;
            }
        }
        return false;
    }
    
    // Handle gameplay controls
    if (gameState === "playing") {
        if (key === " ") {
            shootBullet();
            return false;
        }
    }
    
    return true; // Let other key events through
}

// Function to reset the game
function resetGame() {
    // Reset game state
    gameState = "playing";
    
    // Reset scores and counters
    score = 0;
    correctAPICount = 0;
    incorrectAPICount = 0;
    
    // Clear all arrays
    bullets = [];
    apis = [];
    asteroids = [];
    
    // Create/reset spaceship
    spaceship = { 
        x: canvasWidth / 2, 
        y: canvasHeight - 50 * scaleRatio, 
        width: 50 * scaleRatio,
        height: 40 * scaleRatio,
        speed: 5 * scaleRatio
    };
    
    // Reset cooldown
    bulletCooldown = 0;
    bulletCooldownTime = 15; // Frames between shots
    
    // Reset spawn rates
    apiSpawnRate = 120; // Frames between API spawns
    asteroidSpawnRate = 180; // Frames between asteroid spawns
    
    // Choose a random target API
    let apiTypes = ["PayrollAPI", "BenefitsAPI", "TaxAPI", "TimeAPI", "HRServicesAPI", 
                   "TalentAPI", "RecruitingAPI", "AnalyticsAPI", "IntegrationsAPI", "MobileAPI"];
    targetAPI = apiTypes[Math.floor(random(apiTypes.length))];
    
    console.log("Game reset complete. Target API:", targetAPI);
}

// Helper function to detect rectangle collisions
function rectOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    // Adjusted for CENTER rectMode - x,y are centers of rectangles
    let left1 = x1 - w1 / 2;
    let right1 = x1 + w1 / 2;
    let top1 = y1 - h1 / 2;
    let bottom1 = y1 + h1 / 2;
    
    let left2 = x2 - w2 / 2;
    let right2 = x2 + w2 / 2;
    let top2 = y2 - h2 / 2;
    let bottom2 = y2 + h2 / 2;
    
    // Check for collision
    return !(right1 < left2 || left1 > right2 || bottom1 < top2 || top1 > bottom2);
}

// Helper function to format API text to fit in bubbles
function formatAPIText(apiText) {
    // Professional formatting for API bubbles
    if (apiText.includes(" API") && apiText.length > 8) {
        // Split more elegantly
        let parts = apiText.split(" API");
        return parts[0] + "\nAPI";
    }
    return apiText;
}

// Function to draw all game elements (used for background in different states)
function drawGameElements(includeSpaceship) {
    // Update and remove APIs that have been hit
    for (let i = apis.length - 1; i >= 0; i--) {
        let api = apis[i];
        
        // Update API position - move down
        api.y += 2 * scaleRatio;
        
        // Remove if off bottom of screen
        if (api.y > canvasHeight + 50) {
            apis.splice(i, 1);
            continue;
        }
        
        // If hit, check if it's time to remove
        if (api.state !== "normal" && millis() - api.hitTime > api.removeDelay) {
            // API was hit, create particles
            createExplosion(api.x, api.y, api.state === "correct" ? 50 : 30);
            apis.splice(i, 1);
            
            // If it was correct, advance to next level
            if (api.state === "correct") {
                gameState = "levelCompleted";
                celebrationStartTime = millis();
                
                // Create celebration fireworks
                for (let i = 0; i < 5; i++) {
                    createFirework();
                }
            }
            
            continue;
        }
        
        // Draw API bubble
        drawAPIBubble(api.x, api.y, api.w * 0.5, api.h * 0.5, api.type, api.state);
    }
    
    // Draw asteroids (alien ships)
    for (let alien of asteroids) {
        try {
            // Use our defined drawAlienShip function
            drawAlienShip(alien.x, alien.y, alien.w || alien.width, alien.h || alien.height);
        } catch (e) {
            console.log("Error drawing alien:", e);
            // Fallback drawing if there's an error
            fill(150);
            ellipse(alien.x, alien.y, alien.w || alien.width || 40, alien.h || alien.height || 40);
        }
    }
    
    // Draw spaceship if needed
    if (includeSpaceship) {
        drawSpaceship();
    }
    
    // Handle bullets
    updateAndDrawBullets();
}

// Create explosion particles
function createExplosion(x, y, numParticles) {
    for (let i = 0; i < numParticles; i++) {
        let angle = random(TWO_PI);
        let speed = random(2, 8);
        let size = random(2, 8);
        let lifespan = random(30, 60);
        
        // Pick a color: orange, yellow, red
        let colors = [
            [255, 165, 0],  // Orange
            [255, 255, 0],  // Yellow
            [255, 69, 0]    // Red-Orange
        ];
        let color = random(colors);
        
        // Add particle
        explosionParticles.push({
            x: x,
            y: y,
            vx: cos(angle) * speed,
            vy: sin(angle) * speed,
            size: size,
            lifespan: lifespan,
            color: color
        });
    }
}

// Update and draw explosion particles
function updateExplosion() {
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
        let p = explosionParticles[i];
        
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        
        // Apply drag/slow down
        p.vx *= 0.95;
        p.vy *= 0.95;
        
        // Decrease lifespan
        p.lifespan--;
        
        // Draw the particle
        if (p.lifespan > 0) {
            // Make particles fade out
            let alpha = map(p.lifespan, 0, 60, 0, 255);
            
            // Draw glow effect
            noStroke();
            fill(p.color[0], p.color[1], p.color[2], alpha * 0.3);
            ellipse(p.x, p.y, p.size * 2.5, p.size * 2.5);
            
            // Draw core
            fill(p.color[0], p.color[1], p.color[2], alpha);
            ellipse(p.x, p.y, p.size, p.size);
        } else {
            // Remove dead particles
            explosionParticles.splice(i, 1);
        }
    }
}

// Draw debug information
function drawDebug() {
    if (!debugMode) return;
    
    // Display FPS
    fill(255);
    textSize(12 * scaleRatio);
    text(`FPS: ${Math.round(frameRate())}`, 50 * scaleRatio, 20 * scaleRatio);
    
    // Show entity counts
    text(`APIs: ${apis.length}, Alien Ships: ${asteroids.length}, Bullets: ${bullets.length}`, canvasWidth/2, canvasHeight - 20 * scaleRatio);
    
    // Show collision boxes
    noFill();
    
    // Spaceship collision box (rectMode CENTER is active)
    stroke(0, 255, 0);
    rect(spaceship.x, spaceship.y, spaceship.w, spaceship.h);
    
    // Bullet collision boxes
    stroke(255, 255, 0);
    for (let bullet of bullets) {
        rect(bullet.x, bullet.y, bullet.w, bullet.h);
    }
    
    // Alien ship collision boxes
    stroke(255, 0, 100);
    for (let alien of asteroids) {
        ellipse(alien.x, alien.y, alien.w, alien.h); // Use ellipse for alien ships
        // Show movement pattern
        fill(255);
        textSize(8 * scaleRatio);
        text("P" + alien.movePattern, alien.x, alien.y - alien.h/2 - 10 * scaleRatio);
        noFill();
    }
    
    // API collision boxes
    for (let api of apis) {
        if (api.isCorrect) {
            stroke(0, 255, 255); // Cyan for correct APIs
            fill(255);
            text("CORRECT", api.x, api.y - api.h/2 - 10 * scaleRatio);
            noFill();
        } else {
            stroke(0, 0, 255); // Blue for incorrect APIs
        }
        rect(api.x, api.y, api.w, api.h);
    }
    
    // Show current level and correct API
    fill(255);
    textSize(12 * scaleRatio);
    text(`Level: ${currentLevel + 1}/${levels.length}, Correct API: ${levels[currentLevel].correctAPI}`, canvasWidth/2, 40 * scaleRatio);
}

// Collision detection function
function collideRectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 &&
           x1 + w1 > x2 &&
           y1 < y2 + h2 &&
           y1 + h1 > y2;
}

// Helper function for ellipse-rectangle collision
function collideEllipseRect(ellipseX, ellipseY, ellipseW, ellipseH, rectX, rectY, rectW, rectH) {
    // For a circular alien ship, we'll use ellipseW as the diameter (since w == h now)
    let circleRadius = ellipseW / 2;
    
    // Find the closest point on the rectangle to the circle
    let closestX = constrain(ellipseX, rectX - rectW/2, rectX + rectW/2);
    let closestY = constrain(ellipseY, rectY - rectH/2, rectY + rectH/2);
    
    // Calculate the distance between the circle's center and the closest point
    let distanceX = ellipseX - closestX;
    let distanceY = ellipseY - closestY;
    
    // If the distance is less than the circle's radius, there's a collision
    return (distanceX * distanceX + distanceY * distanceY) < (circleRadius * circleRadius);
}

// Draw the objective panel with enhanced professional styling
function drawObjectivePanel() {
    // Scale factors for responsive sizing
    let titleFontSize = 18 * scaleRatio;
    let panelWidth = canvasWidth * 0.85;
    let panelHeight = 80 * scaleRatio;
    
    // Move the entire panel higher 
    let panelY = 80 * scaleRatio;
    let bannerY = 50 * scaleRatio;
    
    // Dark outer panel with stronger opacity for better contrast
    noStroke();
    fill(10, 20, 60, 240);  // Darker blue with even higher opacity
    rect(canvasWidth / 2, panelY, panelWidth, panelHeight, 18 * scaleRatio);  // Slightly larger panel
    
    // Simpler gradient fill for better text contrast
    noStroke();
    fill(20, 40, 100, 230);  // Higher opacity for better contrast
    rect(canvasWidth / 2, panelY, panelWidth - 10 * scaleRatio, panelHeight - 5 * scaleRatio, 15 * scaleRatio);
    
    // Bright crisp border for definition
    noFill();
    stroke(150, 200, 255, 230);
    strokeWeight(2.5 * scaleRatio);
    rect(canvasWidth / 2, panelY, panelWidth - 8 * scaleRatio, panelHeight - 8 * scaleRatio, 14 * scaleRatio);
    
    // Outer border
    stroke(80, 140, 230, 180);
    strokeWeight(1.5 * scaleRatio);
    rect(canvasWidth / 2, panelY, panelWidth - 4 * scaleRatio, panelHeight + 4 * scaleRatio, 16 * scaleRatio);
    
    // Title background banner with solid color
    noStroke();
    fill(30, 60, 140, 250);  // Deeper blue with higher opacity
    rect(canvasWidth / 2, bannerY, 160 * scaleRatio, 30 * scaleRatio, 8 * scaleRatio);
    
    // Title banner border
    noFill();
    stroke(160, 210, 255, 250);  // Brighter, more opaque border
    strokeWeight(2 * scaleRatio);
    rect(canvasWidth / 2, bannerY, 156 * scaleRatio, 26 * scaleRatio, 7 * scaleRatio);
    
    // Title text with crisp appearance
    fill(255, 255, 255);  // Pure white for sharpness
    noStroke();
    textSize(titleFontSize);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("BUSINESS REQUIREMENT", canvasWidth / 2, bannerY);
    
    // Get the current objective text
    let objective = levels[currentLevel].objective;
    
    // Determine font size based on text length and screen size
    let fontSize = 28 * scaleRatio; // Default size
    if (objective.length > 60) {
        fontSize = 22 * scaleRatio;
    } else if (objective.length > 45) {
        fontSize = 24 * scaleRatio;
    }
    
    // For mobile, further reduce text size if necessary
    if (isMobile && canvasWidth < 600) {
        fontSize = fontSize * 0.8;
    }
    
    // Format long questions to fit in the panel by splitting into lines
    let formattedText = objective;
    if (objective.length > 45 || (isMobile && objective.length > 35)) {
        // Find a good breaking point around the middle of the text
        let middleIndex = Math.floor(objective.length / 2);
        let breakIndex = objective.indexOf(' ', middleIndex - 10);
        if (breakIndex === -1) breakIndex = middleIndex;
        
        // Split into two lines
        formattedText = objective.substring(0, breakIndex) + '\n' + objective.substring(breakIndex + 1);
    }
    
    // Set text style
    textSize(fontSize); 
    textStyle(BOLD);
    
    // Adjust y position for text in the new panel position
    let yPos = panelY + 5 * scaleRatio;
    if (formattedText.includes('\n')) {
        yPos = panelY; // Center multiline text vertically
    }
    
    // Black outline for definition and contrast
    fill(0, 0, 0);
    text(formattedText, canvasWidth / 2 + 2 * scaleRatio, yPos + 2 * scaleRatio);
    
    // Main text with bright red for maximum visibility
    // Use a vibrant red that stands out but is still readable
    fill(255, 40, 40); // Bright red
    text(formattedText, canvasWidth / 2, yPos);
    
    // Reset text style
    textStyle(NORMAL);
    
    // Decorative corner elements (simplified for cleaner look)
    noFill();
    stroke(180, 220, 255, 230);  // Brighter corners
    strokeWeight(2.5 * scaleRatio);
    
    // Adjust corner size for different screens
    let cornerSize = 20 * scaleRatio;
    
    // Top-left corner
    let x1 = canvasWidth/2 - panelWidth/2 + 10 * scaleRatio;
    let y1 = panelY - panelHeight/2 + 10 * scaleRatio;
    line(x1, y1, x1 + cornerSize, y1);
    line(x1, y1, x1, y1 + cornerSize);
    
    // Top-right corner
    let x2 = canvasWidth/2 + panelWidth/2 - 10 * scaleRatio;
    let y2 = panelY - panelHeight/2 + 10 * scaleRatio;
    line(x2, y2, x2 - cornerSize, y2);
    line(x2, y2, x2, y2 + cornerSize);
    
    // Bottom-left corner
    let x3 = canvasWidth/2 - panelWidth/2 + 10 * scaleRatio;
    let y3 = panelY + panelHeight/2 - 10 * scaleRatio;
    line(x3, y3, x3 + cornerSize, y3);
    line(x3, y3, x3, y3 - cornerSize);
    
    // Bottom-right corner
    let x4 = canvasWidth/2 + panelWidth/2 - 10 * scaleRatio;
    let y4 = panelY + panelHeight/2 - 10 * scaleRatio;
    line(x4, y4, x4 - cornerSize, y4);
    line(x4, y4, x4, y4 - cornerSize);
    
    // Debug panel size visualization if in debug mode
    if (debugMode) {
        noFill();
        stroke(255, 0, 0, 150);
        strokeWeight(1 * scaleRatio);
        rect(canvasWidth / 2, panelY, panelWidth, panelHeight);
    }
}

// Draw the galaxy background
function drawGalaxyBackground() {
    background(10, 5, 20); // Very dark blue/purple instead of pure black
    
    // Draw nebula clouds first (behind stars)
    for (let nebula of nebulae) {
        drawNebula(nebula);
        
        // Slowly move nebulae
        nebula.y += nebula.speed;
        
        // Wrap around when off screen
        if (nebula.y - nebula.size > canvasHeight) {
            nebula.y = -nebula.size / 2;
            nebula.x = random(canvasWidth);
        }
    }
    
    // Draw stars with twinkling effect
    for (let star of stars) {
        // Twinkle effect
        let twinkle = sin(frameCount * star.twinkleSpeed + star.twinkleOffset);
        let brightness = star.brightness * (0.7 + 0.3 * twinkle);
        
        // Draw star
        noStroke();
        fill(brightness);
        ellipse(star.x, star.y, star.size);
        
        // Move stars for parallax scrolling effect
        star.y += star.speed;
        
        // Wrap around when off screen
        if (star.y > canvasHeight) {
            star.y = 0;
            star.x = random(canvasWidth);
        }
    }
}

// Draw a single nebula cloud
function drawNebula(nebula) {
    for (let i = 0; i < 5; i++) {
        // Multiple layers with decreasing opacity for glow effect
        let size = nebula.size * (1 - i * 0.15);
        let c = nebula.color;
        noStroke();
        fill(c[0], c[1], c[2], c[3] * (1 - i * 0.15));
        
        // Use noise function for more organic shape
        beginShape();
        for (let a = 0; a < TWO_PI; a += 0.1) {
            let xoff = map(cos(a), -1, 1, 0, 2);
            let yoff = map(sin(a), -1, 1, 0, 2);
            let r = size * (0.7 + 0.3 * noise(xoff, yoff, frameCount * 0.001));
            let x = nebula.x + r * cos(a);
            let y = nebula.y + r * sin(a);
            vertex(x, y);
        }
        endShape(CLOSE);
    }
}

// Create a new firework
function createFirework() {
    let firework = {
        x: random(canvasWidth),
        y: random(canvasHeight/2, canvasHeight),
        targetY: random(50, canvasHeight/2),
        speed: random(5, 10),
        particles: [],
        color: [random(100, 255), random(100, 255), random(100, 255)],
        exploded: false
    };
    fireworks.push(firework);
}

// Update and draw fireworks
function updateFireworks() {
    for (let i = fireworks.length - 1; i >= 0; i--) {
        let fw = fireworks[i];
        
        if (!fw.exploded) {
            // Move firework up
            fw.y -= fw.speed;
            
            // Draw firework
            stroke(fw.color);
            strokeWeight(4);
            point(fw.x, fw.y);
            strokeWeight(1);
            
            // Check if firework should explode
            if (fw.y <= fw.targetY) {
                fw.exploded = true;
                
                // Create explosion particles
                for (let j = 0; j < 50; j++) {
                    let angle = random(TWO_PI);
                    let speed = random(1, 5);
                    fw.particles.push({
                        x: fw.x,
                        y: fw.y,
                        vx: cos(angle) * speed,
                        vy: sin(angle) * speed,
                        alpha: 255,
                        color: fw.color
                    });
                }
            }
        } else {
            // Update and draw particles
            for (let j = fw.particles.length - 1; j >= 0; j--) {
                let p = fw.particles[j];
                
                // Apply gravity
                p.vy += 0.1;
                
                // Move particle
                p.x += p.vx;
                p.y += p.vy;
                
                // Fade particle
                p.alpha -= 3;
                
                // Draw particle
                if (p.alpha > 0) {
                    noStroke();
                    fill(p.color[0], p.color[1], p.color[2], p.alpha);
                    ellipse(p.x, p.y, 3, 3);
                } else {
                    // Remove faded particles
                    fw.particles.splice(j, 1);
                }
            }
            
            // Remove firework if all particles are gone
            if (fw.particles.length === 0) {
                fireworks.splice(i, 1);
            }
        }
    }
}

// Add LinkedIn share functionality
function mousePressed() {
    console.log("Mouse pressed at:", mouseX, mouseY);
    
    // Check for clicks in integrated email form (in won state)
    if (gameState === "won" && !emailSubmitted) {
        // Get stored email field coordinates
        if (window.emailField) {
            // Check if clicked on email input field using stored coordinates
            if (mouseX > window.emailField.x && mouseX < window.emailField.x + window.emailField.w && 
                mouseY > window.emailField.y && mouseY < window.emailField.y + window.emailField.h) {
                console.log("Email input field clicked using stored coordinates");
                emailInputActive = true;
                console.log("Set emailInputActive to:", emailInputActive);
                return false;
            }
        } else {
            // Fallback to direct coordinates if window.emailField is not available
            const inputW = 220 * scaleRatio;
            const inputH = 36 * scaleRatio;
            const inputX = canvasWidth / 2 - inputW / 2 - 70 * scaleRatio;
            const inputY = canvasHeight * 0.58;
            
            // Check if clicked on email input field
            if (mouseX > inputX && mouseX < inputX + inputW && 
                mouseY > inputY && mouseY < inputY + inputH) {
                console.log("Email input field clicked using fallback");
                emailInputActive = true;
                return false;
            }
        }
        
        // Get stored submit button coordinates
        if (window.emailSubmitBtn) {
            // Check if clicked on submit button using stored coordinates
            if (mouseX > window.emailSubmitBtn.x && mouseX < window.emailSubmitBtn.x + window.emailSubmitBtn.w && 
                mouseY > window.emailSubmitBtn.y && mouseY < window.emailSubmitBtn.y + window.emailSubmitBtn.h) {
                console.log("Submit button clicked using stored coordinates");
                if (!emailSubmitting) {
                    submitEmailToSupabase();
                }
                return false;
            }
        } else {
            // Fallback for submit button
            const btnW = 120 * scaleRatio;
            const btnH = 36 * scaleRatio;
            const inputW = 220 * scaleRatio;
            const inputX = canvasWidth / 2 - inputW / 2 - 70 * scaleRatio;
            const inputY = canvasHeight * 0.58;
            const btnX = inputX + inputW + 20 * scaleRatio;
            const btnY = inputY;
            
            // Check if clicked on submit button
            if (mouseX > btnX && mouseX < btnX + btnW && 
                mouseY > btnY && mouseY < btnY + btnH) {
                console.log("Submit button clicked using fallback");
                if (!emailSubmitting) {
                    submitEmailToSupabase();
                }
                return false;
            }
        }
        
        // Get stored skip button coordinates
        if (window.emailSkipBtn) {
            // Check if clicked on skip button using stored coordinates
            if (mouseX > window.emailSkipBtn.x && mouseX < window.emailSkipBtn.x + window.emailSkipBtn.w && 
                mouseY > window.emailSkipBtn.y && mouseY < window.emailSkipBtn.y + window.emailSkipBtn.h) {
                console.log("Skip button clicked using stored coordinates");
                emailSubmitted = true; // Mark as submitted to hide the form
                return false;
            }
        } else {
            // Fallback for skip button
            const skipW = 120 * scaleRatio;
            const skipH = 30 * scaleRatio;
            const skipX = canvasWidth / 2 - skipW/2;
            const inputH = 36 * scaleRatio;
            const inputY = canvasHeight * 0.58;
            const skipY = inputY + inputH + 15 * scaleRatio;
            
            // Check if clicked on skip button
            if (mouseX > skipX && mouseX < skipX + skipW && 
                mouseY > skipY && mouseY < skipY + skipH) {
                console.log("Skip button clicked using fallback");
                emailSubmitted = true; // Mark as submitted to hide the form
                return false;
            }
        }
        
        // If clicked outside, deactivate input
        emailInputActive = false;
        
        // LinkedIn share button click - updated to match new position
        let linkedinY = canvasHeight * 0.81; // Updated Y position to match the new button position
        let linkedinW = 300 * scaleRatio;
        let linkedinH = 45 * scaleRatio;
        
        if (mouseX > canvasWidth / 2 - linkedinW / 2 && mouseX < canvasWidth / 2 + linkedinW / 2 &&
            mouseY > linkedinY - linkedinH / 2 && mouseY < linkedinY + linkedinH / 2) {
            
            // Create personalized share message
            shareMessage = playerName + " scored " + score + " points as a " + 
                           professionalTitle + " in this interactive Payroll & HR API Challenge! " +
                           "#PayrollAPI #HRTech #APIs #PayrollIntegration";
            
            // Open LinkedIn sharing dialog
            linkedInLink = "https://www.linkedin.com/sharing/share-offsite/?url=" + 
                           encodeURIComponent(window.location.href) + 
                           "&title=" + encodeURIComponent(shareMessage);
            
            window.open(linkedInLink, "_blank");
            return false;
        }
    }
    
    // Check for the modal email collection form
    if (showEmailCollection) {
        // Email input field
        let inputY = canvasHeight / 2 - canvasHeight * 0.02;
        let inputW = 300 * scaleRatio;
        let inputH = 40 * scaleRatio;
        
        // Check if email input field was clicked
        if (mouseX > canvasWidth / 2 - inputW / 2 && mouseX < canvasWidth / 2 + inputW / 2 &&
            mouseY > inputY - inputH / 2 && mouseY < inputY + inputH / 2) {
            emailInputActive = true;
            return false;
        } else {
            emailInputActive = false;
        }
        
        // Submit button position
        let submitY = canvasHeight / 2 + canvasHeight * 0.07;
        let submitW = 200 * scaleRatio;
        let submitH = 40 * scaleRatio;
        
        // Check if submit button was clicked
        if (mouseX > canvasWidth / 2 - submitW / 2 && mouseX < canvasWidth / 2 + submitW / 2 &&
            mouseY > submitY - submitH / 2 && mouseY < submitY + submitH / 2) {
            if (!emailSubmitting) {
                submitEmailToSupabase();
            }
            return false;
        }
        
        // Skip button position
        let skipY = canvasHeight / 2 + canvasHeight * 0.13;
        let skipW = 140 * scaleRatio;
        let skipH = 40 * scaleRatio;
        
        // Check if skip button was clicked
        if (mouseX > canvasWidth / 2 - skipW / 2 && mouseX < canvasWidth / 2 + skipW / 2 &&
            mouseY > skipY - skipH / 2 && mouseY < skipY + skipH / 2) {
            console.log("Skip button clicked, hiding email form");
            showEmailCollection = false;
            return false;
        }
        
        return false; // Prevent default when interacting with form
    }
    
    // Handle about screen interactions
    if (gameState === "about") {
        // Name input field click detection
        let inputY = 110 * scaleRatio + (24 * scaleRatio * 11);
        let inputX = canvasWidth/2;
        let inputW = 300 * scaleRatio;
        let inputH = 40 * scaleRatio;
        
        if (mouseX > inputX - inputW/2 && mouseX < inputX + inputW/2 &&
            mouseY > inputY - inputH/2 && mouseY < inputY + inputH/2) {
            customizeNameMode = true;
            if (inputName === "Your Name") {
                inputName = "";
            }
            return false;
        } else {
            customizeNameMode = false;
        }
        
        // Title selector buttons
        let titleY = inputY + (24 * scaleRatio * 3);
        
        // Previous button
        if (mouseX > canvasWidth/2 - 170 * scaleRatio - 20 * scaleRatio && 
            mouseX < canvasWidth/2 - 170 * scaleRatio + 20 * scaleRatio &&
            mouseY > titleY - 20 * scaleRatio && 
            mouseY < titleY + 20 * scaleRatio) {
            currentProfileIndex = (currentProfileIndex - 1 + profileTitles.length) % profileTitles.length;
            professionalTitle = profileTitles[currentProfileIndex];
            return false;
        }
        
        // Next button
        if (mouseX > canvasWidth/2 + 170 * scaleRatio - 20 * scaleRatio && 
            mouseX < canvasWidth/2 + 170 * scaleRatio + 20 * scaleRatio &&
            mouseY > titleY - 20 * scaleRatio && 
            mouseY < titleY + 20 * scaleRatio) {
            currentProfileIndex = (currentProfileIndex + 1) % profileTitles.length;
            professionalTitle = profileTitles[currentProfileIndex];
            return false;
        }
        
        // Start game button
        let startY = titleY + (24 * scaleRatio * 3);
        let startW = 200 * scaleRatio;
        let startH = 50 * scaleRatio;
        
        if (mouseX > canvasWidth/2 - startW/2 && mouseX < canvasWidth/2 + startW/2 &&
            mouseY > startY - startH/2 && mouseY < startY + startH/2) {
            gameState = "playing";
            gameStartTime = millis();
            playerName = inputName;
            if (playerName === "") {
                playerName = "HR Professional";
            }
            return false;
        }
    }
    
    return true; // Allow other events by default
}

// Create a placeholder company logo
function createCompanyLogo() {
    companyLogo = {
        size: 150 * scaleRatio,
        color: brandColor,
        text: companyName
    };
}

// Draw professional splash screen (remove any lingering company references)
function drawSplashScreen() {
    // Background gradient
    background(5, 15, 30);
    
    // Draw a professional gradient overlay
    noFill();
    for (let i = 0; i < canvasHeight; i += 2) {
        let alpha = map(i, 0, canvasHeight, 150, 50);
        stroke(brandColor[0], brandColor[1], brandColor[2], alpha);
        line(0, i, canvasWidth, i);
    }
    
    // Game title
    fill(255);
    textSize(40 * scaleRatio);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text("Payroll & HR API Challenge", canvasWidth/2, canvasHeight/2 - 40 * scaleRatio);
    
    // Tagline
    fill(200, 200, 200);
    textSize(24 * scaleRatio);
    textStyle(NORMAL);
    text(tagline, canvasWidth/2, canvasHeight/2 + 20 * scaleRatio);
    
    // Loading text with animation
    let dots = ".".repeat(Math.floor((millis() % 1000) / 250) + 1);
    fill(150, 150, 150);
    textSize(18 * scaleRatio);
    text("Loading" + dots, canvasWidth/2, canvasHeight/2 + 80 * scaleRatio);
}

// Draw professional statistics overlay
function drawProfessionalStats() {
    // Top-right corner stats panel
    fill(10, 20, 40, 200);
    noStroke();
    rect(canvasWidth - 110 * scaleRatio, 40 * scaleRatio, 
         180 * scaleRatio, 60 * scaleRatio, 8 * scaleRatio);
    
    // Border
    noFill();
    stroke(brandColor[0], brandColor[1], brandColor[2], 150);
    strokeWeight(2 * scaleRatio);
    rect(canvasWidth - 110 * scaleRatio, 40 * scaleRatio, 
         176 * scaleRatio, 56 * scaleRatio, 7 * scaleRatio);
         
    // Stats text
    noStroke();
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(14 * scaleRatio);
    text("Score: " + score, canvasWidth - 180 * scaleRatio, 30 * scaleRatio);
    text("Level: " + (currentLevel + 1) + "/" + levels.length, canvasWidth - 180 * scaleRatio, 50 * scaleRatio);
    
    // Calculate elapsed time for in-game stats only
    let elapsedSecs = Math.floor((millis() - gameStartTime) / 1000);
    let minutes = Math.floor(elapsedSecs / 60);
    let seconds = elapsedSecs % 60;
    let timeStr = minutes + "m " + seconds + "s";
    text("Time: " + timeStr, canvasWidth - 180 * scaleRatio, 70 * scaleRatio);
    
    // Reset text alignment
    textAlign(CENTER, CENTER);
}

// Draw a professional certification-like badge
function drawCertificationBadge() {
    push();
    // We no longer need the translate here as it's done in the draw() function
    
    // FIFA World Cup trophy design
    
    // Solid base (circular)
    fill(200, 170, 20); // Dark gold for base
    stroke(230, 200, 40);
    strokeWeight(1 * scaleRatio);
    ellipse(0, 32 * scaleRatio, 30 * scaleRatio, 8 * scaleRatio); // Base ellipse
    
    // Small platform above base
    fill(230, 190, 40); // Medium gold
    noStroke();
    ellipse(0, 28 * scaleRatio, 22 * scaleRatio, 6 * scaleRatio);
    
    // Main trophy body - spiral design
    // Create the tapered spiral effect
    fill(255, 215, 0); // Bright gold for trophy body
    
    // Bottom section
    beginShape();
    // Left side curve
    for (let y = 28; y >= 5; y--) {
        // Create a spiral effect by adjusting x based on y
        let spiralFactor = map(y, 28, 5, 10, 6);
        let x = -spiralFactor * scaleRatio;
        vertex(x, y * scaleRatio);
    }
    
    // Right side curve
    for (let y = 5; y <= 28; y++) {
        // Mirror the left side curve
        let spiralFactor = map(y, 5, 28, 6, 10);
        let x = spiralFactor * scaleRatio;
        vertex(x, y * scaleRatio);
    }
    endShape(CLOSE);
    
    // Add embossed spiral lines for texture
    stroke(240, 200, 50, 150);
    strokeWeight(0.8 * scaleRatio);
    noFill();
    
    // Draw spiral lines
    for (let i = 0; i < 3; i++) {
        let offset = i * 3 * scaleRatio;
        beginShape();
        for (let y = 26; y >= 5; y -= 1) {
            let spiralFactor = map(y, 26, 5, 9 - i, 5 - i);
            let x = -spiralFactor * scaleRatio;
            vertex(x, y * scaleRatio);
        }
        endShape();
    }
    
    // Earth/globe at top
    fill(220, 190, 60); // Slightly different gold for globe
    ellipse(0, 0, 16 * scaleRatio, 16 * scaleRatio);
    
    // Globe texture (simplified)
    stroke(255, 240, 150, 180);
    strokeWeight(0.5 * scaleRatio);
    ellipse(0, 0, 14 * scaleRatio, 14 * scaleRatio);
    
    // API symbol on the globe
    stroke(230, 190, 40);
    strokeWeight(1.5 * scaleRatio);
    line(-6 * scaleRatio, -3 * scaleRatio, 6 * scaleRatio, -3 * scaleRatio);
    line(-6 * scaleRatio, 3 * scaleRatio, 6 * scaleRatio, 3 * scaleRatio);
    
    // Abstract human figures (simplified)
    // Left figure
    stroke(255, 215, 0);
    strokeWeight(2.5 * scaleRatio);
    noFill();
    beginShape();
    vertex(-8 * scaleRatio, 16 * scaleRatio); // Base
    vertex(-9 * scaleRatio, 10 * scaleRatio); // Body
    vertex(-8 * scaleRatio, 6 * scaleRatio);  // Shoulder
    vertex(-5 * scaleRatio, 4 * scaleRatio);  // Arm reaching up
    endShape();
    
    // Right figure
    beginShape();
    vertex(8 * scaleRatio, 16 * scaleRatio);  // Base
    vertex(9 * scaleRatio, 10 * scaleRatio);  // Body
    vertex(8 * scaleRatio, 6 * scaleRatio);   // Shoulder
    vertex(5 * scaleRatio, 4 * scaleRatio);   // Arm reaching up
    endShape();
    
    // Add highlights to give it a metallic appearance
    stroke(255, 255, 255, 180);
    strokeWeight(1 * scaleRatio);
    // Highlight on globe
    arc(0, 0, 14 * scaleRatio, 14 * scaleRatio, PI * 0.7, PI * 1.3);
    // Highlight on trophy
    line(-4 * scaleRatio, 18 * scaleRatio, 0, 8 * scaleRatio);
    line(2 * scaleRatio, 22 * scaleRatio, 4 * scaleRatio, 12 * scaleRatio);
    
    // Add a subtle glow effect
    noStroke();
    for (let i = 8; i > 0; i--) {
        fill(255, 215, 0, 5 + i);
        ellipse(0, 15 * scaleRatio, (80 - i * 8) * scaleRatio, (100 - i * 10) * scaleRatio);
    }
    
    pop();
}

// Draw the about/intro screen
function drawAboutScreen() {
    // Draw background with stars
    drawStarryBackground();
    
    // Title
    fill(255);
    textSize(30 * scaleRatio);
    textAlign(CENTER, CENTER);
    text("About API Hunter", canvasWidth/2, 80 * scaleRatio);
    
    // Game description and instructions
    textSize(16 * scaleRatio);
    textAlign(LEFT, TOP);
    let textX = canvasWidth * 0.2;
    let textY = 130 * scaleRatio;
    let lineHeight = 24 * scaleRatio;
    
    // Instructions text
    fill(200, 200, 255);
    text("HOW TO PLAY:", textX, textY);
    
    fill(255);
    textY += lineHeight;
    text("• Use ARROW KEYS (or A/D) to move your spaceship", textX, textY);
    textY += lineHeight;
    text("• Press SPACEBAR to shoot", textX, textY);
    textY += lineHeight;
    text("• Target the " + targetAPI + " to earn points", textX, textY);
    textY += lineHeight;
    text("• Avoid shooting wrong APIs or you'll lose points", textX, textY);
    textY += lineHeight;
    text("• Collect " + targetAPICount + " correct APIs to win", textX, textY);
    textY += lineHeight;
    text("• Avoid alien ships - they'll destroy your spaceship", textX, textY);
    
    // Mobile-specific instructions
    if (isMobileDevice) {
        textY += lineHeight * 1.5;
        fill(200, 200, 255);
        text("MOBILE CONTROLS:", textX, textY);
        
        fill(255);
        textY += lineHeight;
        text("• Touch left/right sides of screen to move", textX, textY);
        textY += lineHeight;
        text("• Touch the middle button to shoot", textX, textY);
    }
    
    // Draw a sample API
    drawAPIBubble(canvasWidth * 0.75, canvasHeight * 0.4, 30 * scaleRatio, 30 * scaleRatio, targetAPI, "normal");
    
    // Draw an alien ship (asteroid)
    drawAlienShip(canvasWidth * 0.75, canvasHeight * 0.6, 80 * scaleRatio, 60 * scaleRatio);
    
    // Back button
    drawButton(canvasWidth/2, canvasHeight - 60 * scaleRatio, 200 * scaleRatio, 40 * scaleRatio, "Back to Menu", 16 * scaleRatio);
}

// Draw a button with text
function drawButton(x, y, width, height, label, textSize) {
    push();
    
    // Check if mouse is over button for hover effect
    let isHovering = mouseX >= x - width/2 && mouseX <= x + width/2 && 
                    mouseY >= y - height/2 && mouseY <= y + height/2;
    
    // Button background
    strokeWeight(2 * scaleRatio);
    if (isHovering) {
        stroke(100, 200, 255);
        fill(50, 100, 150);
    } else {
        stroke(100, 150, 200);
        fill(40, 80, 120);
    }
    rect(x - width/2, y - height/2, width, height, 10 * scaleRatio);
    
    // Button text
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(textSize);
    text(label, x, y);
    
    pop();
}

// Handle input field drawing
function drawInputField(label, value, x, y, w, h, isActive) {
    // Label
    fill(255);
    textAlign(RIGHT, CENTER);
    textSize(16 * scaleRatio);
    text(label, x - w/2 - 10 * scaleRatio, y);
    
    // Input field background
    textAlign(LEFT, CENTER);
    fill(20, 40, 80);
    if (isActive) {
        stroke(100, 200, 255);
    } else {
        stroke(80, 80, 120);
    }
    strokeWeight(2 * scaleRatio);
    rect(x, y, w, h, 5 * scaleRatio);
    
    // Input text
    noStroke();
    fill(255);
    let displayValue = value;
    if (isActive && cursorVisible) {
        displayValue += "|";
    }
    text(displayValue, x - w/2 + 10 * scaleRatio, y);
}

// Draw the email collection form
function drawEmailCollectionForm() {
    if (!showEmailCollection || emailSubmitted) return;
    
    // Semi-transparent background panel
    fill(10, 20, 40, 240);
    noStroke();
    rect(canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.8, canvasHeight * 0.4, 15 * scaleRatio);
    
    // Panel border
    noFill();
    stroke(brandColor[0], brandColor[1], brandColor[2], 180);
    strokeWeight(2 * scaleRatio);
    rect(canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.78, canvasHeight * 0.38, 13 * scaleRatio);
    
    // Title
    noStroke();
    fill(255);
    textSize(24 * scaleRatio);
    textAlign(CENTER, TOP);
    textStyle(BOLD);
    text("Stay Updated with API News", canvasWidth / 2, canvasHeight / 2 - canvasHeight * 0.15);
    
    // Description
    textSize(16 * scaleRatio);
    textStyle(NORMAL);
    fill(220, 220, 220);
    text("Subscribe to receive API integration tips, updates and resources", 
         canvasWidth / 2, canvasHeight / 2 - canvasHeight * 0.09);
    
    // Email input field
    let inputY = canvasHeight / 2 - canvasHeight * 0.02;
    let inputW = 300 * scaleRatio;
    let inputH = 40 * scaleRatio;
    
    // Input field background
    textAlign(LEFT, CENTER);
    fill(20, 40, 80);
    if (emailInputActive) {
        stroke(100, 200, 255);
    } else {
        stroke(80, 80, 120);
    }
    strokeWeight(2 * scaleRatio);
    rect(canvasWidth / 2, inputY, inputW, inputH, 5 * scaleRatio);
    
    // Input field label/placeholder
    noStroke();
    if (emailInput === "" && !emailInputActive) {
        fill(150, 150, 170);
        text("Enter your email address", canvasWidth / 2 - inputW / 2 + 15 * scaleRatio, inputY);
    } else {
        // Input text
        fill(255);
        let displayEmail = emailInput;
        if (emailInputActive && emailCursorVisible) {
            displayEmail += "|";
        }
        text(displayEmail, canvasWidth / 2 - inputW / 2 + 15 * scaleRatio, inputY);
    }
    
    // Submit button
    let buttonY = canvasHeight / 2 + canvasHeight * 0.07;
    let buttonW = 180 * scaleRatio;
    let buttonH = 45 * scaleRatio;
    
    if (emailSubmitting) {
        // Processing state
        fill(100, 150, 200);
    } else {
        // Normal state
        fill(30, 150, 70);
    }
    noStroke();
    rect(canvasWidth / 2, buttonY, buttonW, buttonH, 8 * scaleRatio);
    
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(18 * scaleRatio);
    text(emailSubmitting ? "Submitting..." : "Subscribe", canvasWidth / 2, buttonY);
    
    // Skip button - MORE PROMINENT to make it easier to interact with
    let skipY = canvasHeight / 2 + canvasHeight * 0.13;
    let skipW = 140 * scaleRatio; // Wider clickable area
    let skipH = 40 * scaleRatio; // Taller clickable area
    
    // Check if mouse is over the skip button for hover effect
    let isSkipHovered = (mouseX > canvasWidth / 2 - skipW / 2 && mouseX < canvasWidth / 2 + skipW / 2 &&
                         mouseY > skipY - skipH / 2 && mouseY < skipY + skipH / 2);
    
    // Draw skip button with visual feedback - make it more noticeable
    strokeWeight(2 * scaleRatio);
    if (isSkipHovered) {
        fill(140, 140, 160, 220); // Brighter when hovered
        stroke(255, 255, 255, 180); // Add white border on hover
    } else {
        fill(100, 100, 130, 180); // Brighter normal state
        stroke(180, 180, 200, 100); // Light border normally
    }
    rect(canvasWidth / 2, skipY, skipW, skipH, 6 * scaleRatio);
    
    // Skip button text - make it more noticeable
    noStroke();
    if (isSkipHovered) {
        fill(255); // Bright white text when hovered
    } else {
        fill(235, 235, 235); // Almost white normally
    }
    textSize(18 * scaleRatio); // Larger text
    text("Skip", canvasWidth / 2, skipY);
    
    // Error message
    if (emailError !== "") {
        fill(255, 70, 70);
        textSize(14 * scaleRatio);
        text(emailError, canvasWidth / 2, canvasHeight / 2 + canvasHeight * 0.17);
    }
    
    // Success message
    if (emailSuccess !== "") {
        fill(70, 255, 120);
        textSize(16 * scaleRatio);
        text(emailSuccess, canvasWidth / 2, canvasHeight / 2 + canvasHeight * 0.17);
    }
    
    // Privacy info
    fill(150, 150, 180);
    textSize(12 * scaleRatio);
    text("We respect your privacy and will never share your email.", 
         canvasWidth / 2, canvasHeight / 2 + canvasHeight * 0.19);
         
    // Update cursor blink
    emailCursorTimer++;
    if (emailCursorTimer > 30) {
        emailCursorVisible = !emailCursorVisible;
        emailCursorTimer = 0;
    }
}

// Submit email to Supabase
function submitEmailToSupabase() {
    if (!supabaseClient) {
        emailError = "Connection error. Supabase client not initialized.";
        emailSubmitting = false;
        console.error("Supabase client not initialized when trying to submit email");
        return;
    }
    
    if (!validateEmail(emailInput)) {
        emailError = "Please enter a valid email address.";
        emailSubmitting = false;
        return;
    }
    
    emailError = "";
    emailSubmitting = true;
    
    // Create the data object
    const userData = {
        email: emailInput,
        name: playerName,
        professional_title: professionalTitle,
        score: score,
        submitted_at: new Date().toISOString(),
        game_outcome: gameState === "won" ? "won" : "lost"
    };
    
    console.log("Attempting to submit email to Supabase:", userData.email);
    console.log("Supabase URL:", SUPABASE_URL);
    console.log("Using table 'email_subscribers'");
    
    // Async function to handle the submission
    (async () => {
        try {
            console.log("Starting Supabase insert operation...");
            
            // Try a simple insert instead of upsert
            const { data, error } = await supabaseClient
                .from('email_subscribers')
                .insert([userData]);
                
            if (error) {
                console.error("Supabase error details:", error);
                // More specific error messages based on error type
                if (error.code === "42P01") {
                    emailError = "Database table not found. Please check setup.";
                } else if (error.code === "23505") {
                    // Email already exists - treat as success
                    console.log("Email already exists, treating as success");
                    emailSuccess = "You're already subscribed!";
                    emailSubmitting = false;
                    emailSubmitted = true;
                    return;
                } else if (error.code === "42501" || error.message.includes("permission denied")) {
                    emailError = "Permission denied. Check RLS policies.";
                } else {
                    emailError = "Error: " + error.message;
                }
                throw error;
            }
            
            // Success
            console.log("Email submitted successfully:", userData.email);
            console.log("Response data:", data);
            emailSuccess = "Thank you for subscribing!";
            emailSubmitting = false;
            emailSubmitted = true;
            
            // Auto-hide the form after 3 seconds
            setTimeout(() => {
                showEmailCollection = false;
            }, 3000);
            
        } catch (error) {
            console.error("Error submitting email:", error);
            if (!emailError) {
                emailError = "Couldn't save your email. Please try again.";
            }
            emailSubmitting = false;
        }
    })();
}

// Email validation function
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Reset email collection form
function resetEmailForm() {
    emailInput = "";
    emailError = "";
    emailSuccess = "";
    emailSubmitted = false;
    emailSubmitting = false;
    emailInputActive = false;
}

// Draw the email collection section at the bottom of the won screen
function drawIntegratedEmailForm() {
    try {
        // Make sure emailInput is a valid string to prevent rendering issues
        if (typeof emailInput !== 'string') {
            emailInput = "";
        }
        
        // Email section heading
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(18 * scaleRatio);
        text("SIGN-UP FOR ADP MARKETPLACE UPDATES", canvasWidth / 2, canvasHeight * 0.51);
        
        textSize(14 * scaleRatio);
        text("Enter your email to get notified about future updates", canvasWidth / 2, canvasHeight * 0.54);
        
        // Email input field - use consistent positioning
        const inputW = 220 * scaleRatio; // Narrower to make room for button
        const inputH = 36 * scaleRatio;
        const inputX = canvasWidth / 2 - inputW / 2 - 70 * scaleRatio; // Move left to make room for button
        const inputY = canvasHeight * 0.58;
        
        // Store the input field coordinates for mousePressed
        window.emailField = {
            x: inputX,
            y: inputY,
            w: inputW,
            h: inputH
        };
        
        // Draw input box (using CORNER mode)
        rectMode(CORNER);
        fill(emailInputActive ? 40 : 20);
        stroke(emailInputActive ? color(0, 150, 255) : color(100));
        strokeWeight(2 * scaleRatio);
        rect(inputX, inputY, inputW, inputH, 5 * scaleRatio);
        noStroke();
        
        // Draw email text or placeholder
        textAlign(LEFT, CENTER);
        if (emailInput.length > 0) {
            fill(255);
            text(emailInput, inputX + 10 * scaleRatio, inputY + inputH / 2);
        } else {
            fill(150);
            text("Your email address", inputX + 10 * scaleRatio, inputY + inputH / 2);
        }
        
        // Subscribe button - positioned to the right of input field
        rectMode(CORNER);
        const btnW = 120 * scaleRatio;
        const btnH = 36 * scaleRatio;
        const btnX = inputX + inputW + 20 * scaleRatio; // Position to the right of input field
        const btnY = inputY; // Aligned with input field
        
        // Store button coordinates for mousePressed
        window.emailSubmitBtn = {
            x: btnX,
            y: btnY,
            w: btnW,
            h: btnH
        };
        
        // Detect mouse hover for submit button
        const mouseOverBtn = 
            mouseX > btnX && 
            mouseX < btnX + btnW && 
            mouseY > btnY && 
            mouseY < btnY + btnH;
        
        fill(mouseOverBtn ? color(20, 130, 220) : color(0, 100, 200));
        rect(btnX, btnY, btnW, btnH, 5 * scaleRatio);
        
        // Button text
        fill(255);
        textAlign(CENTER, CENTER);
        text(emailSubmitting ? "SENDING..." : "SUBSCRIBE", btnX + btnW/2, btnY + btnH/2);
        
        // Skip button - positioned below the input field
        const skipW = 120 * scaleRatio;
        const skipH = 30 * scaleRatio;
        const skipX = canvasWidth / 2 - skipW/2; // Centered
        const skipY = inputY + inputH + 15 * scaleRatio; // Below input
        
        // Store skip button coordinates for mousePressed
        window.emailSkipBtn = {
            x: skipX,
            y: skipY,
            w: skipW,
            h: skipH
        };
        
        // Detect mouse hover for skip button
        const mouseOverSkip = 
            mouseX > skipX && 
            mouseX < skipX + skipW && 
            mouseY > skipY && 
            mouseY < skipY + skipH;
        
        // No background, just text for skip button
        fill(mouseOverSkip ? 200 : 150);
        textAlign(CENTER, CENTER);
        text("No thanks", skipX + skipW/2, skipY + skipH/2);
        
        // If email is submitted, show thank you message
        if (emailSubmitted) {
            // Overlay the form with thank you message
            rectMode(CENTER);
            fill(10, 40, 70, 220);
            rect(canvasWidth / 2, canvasHeight * 0.58, 350 * scaleRatio, 70 * scaleRatio, 8 * scaleRatio);
            
            fill(70, 255, 120);
            textSize(18 * scaleRatio);
            textAlign(CENTER, CENTER);
            text("Thank you for subscribing!", canvasWidth / 2, canvasHeight * 0.58);
        }
        
        // Error message
        if (emailError !== "") {
            fill(255, 70, 70);
            textSize(14 * scaleRatio);
            textAlign(CENTER, TOP);
            text(emailError, canvasWidth / 2, inputY + inputH + 10 * scaleRatio);
        }
        
        // Debug visualization if debug mode is on
        if (typeof debugMode !== 'undefined' && debugMode) {
            noFill();
            stroke(255, 0, 0);
            strokeWeight(1);
            // Show the email input field hitbox
            if (window.emailField) {
                rect(window.emailField.x, window.emailField.y, window.emailField.w, window.emailField.h);
                // Add coordinates text
                fill(255, 0, 0);
                textSize(10 * scaleRatio);
                textAlign(LEFT, TOP);
                text(`Input: ${Math.round(window.emailField.x)},${Math.round(window.emailField.y)},${Math.round(window.emailField.w)},${Math.round(window.emailField.h)}`, 10, 30);
                text(`Mouse: ${Math.round(mouseX)},${Math.round(mouseY)} Active: ${emailInputActive}`, 10, 45);
            }
            
            // Show the submit button hitbox
            if (window.emailSubmitBtn) {
                noFill();
                stroke(0, 255, 0);
                rect(window.emailSubmitBtn.x, window.emailSubmitBtn.y, window.emailSubmitBtn.w, window.emailSubmitBtn.h);
            }
            
            // Show the skip button hitbox
            if (window.emailSkipBtn) {
                noFill();
                stroke(0, 0, 255);
                rect(window.emailSkipBtn.x, window.emailSkipBtn.y, window.emailSkipBtn.w, window.emailSkipBtn.h);
            }
        }
        
        // Reset to default rect mode
        rectMode(CENTER);
    } catch (error) {
        console.error("Error rendering email form:", error);
        // Simple fallback rendering if there's an error
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(16 * scaleRatio);
        text("Email form unavailable", canvasWidth / 2, canvasHeight * 0.58);
    }
}

// Toggle debug mode
function toggleDebug() {
    if (typeof debugMode === 'undefined') {
        debugMode = true;
    } else {
        debugMode = !debugMode;
    }
    console.log("Debug mode:", debugMode);
}

// Update and draw bullets
function updateAndDrawBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        
        // Update bullet position
        bullet.y -= bullet.speed * scaleRatio;
        
        // Draw the bullet
        fill(255, 255, 0); // Yellow bullets for better visibility
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
                
                // Check if this is the correct API type
                if (api.type === targetAPI) {
                    // Mark as correct hit
                    api.state = "correct";
                    score += 5;
                    correctAPICount++;
                } else {
                    // Mark as incorrect hit
                    api.state = "incorrect";
                    score -= 2;
                    incorrectAPICount++;
                    score = max(0, score); // Prevent negative score
                }
                
                break; // Exit the inner loop since bullet is gone
            }
        }
    }
}

// Function to draw API bubble
function drawAPIBubble(x, y, width, height, type, state) {
    push();
    if (state === "normal") {
        // Normal API
        fill(255, 0, 0, 200);
        stroke(255, 150, 150);
    } else if (state === "correct") {
        // Correct API hit
        fill(0, 255, 0, 200);
        stroke(150, 255, 150);
    } else if (state === "incorrect") {
        // Incorrect API hit
        fill(100, 100, 255, 200);
        stroke(150, 150, 255);
    }
    
    strokeWeight(2 * scaleRatio);
    ellipse(x, y, width, height);
    
    // Draw API text
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(14 * scaleRatio);
    text(type, x, y);
    pop();
}

// Function to spawn new API
function spawnAPI() {
    // List of possible API types
    let apiTypes = ["PayrollAPI", "BenefitsAPI", "TaxAPI", "TimeAPI", "HRServicesAPI", 
                   "TalentAPI", "RecruitingAPI", "AnalyticsAPI", "IntegrationsAPI", "MobileAPI"];
    
    // Randomly select an API type
    let type;
    if (random(1) < 0.3) {
        // 30% chance to spawn the target API
        type = targetAPI;
    } else {
        // Otherwise pick a different API
        let otherTypes = apiTypes.filter(t => t !== targetAPI);
        type = random(otherTypes);
    }
    
    // Create a new API object
    let api = {
        x: random(50, canvasWidth - 50),
        y: -50, // Start above the visible area
        width: 80 * scaleRatio,
        height: 80 * scaleRatio,
        type: type,
        state: "normal",
        speed: random(1, 3)
    };
    
    // Add to the apis array
    apis.push(api);
}

// Function to spawn a new asteroid
function spawnAsteroid() {
    let asteroid = {
        x: random(50, canvasWidth - 50),
        y: -50, // Start above the visible area
        width: 60 * scaleRatio,
        height: 40 * scaleRatio,
        speed: random(2, 4)
    };
    
    // Add to the asteroids array
    asteroids.push(asteroid);
}

// Function to draw the spaceship
function drawSpaceship() {
    push();
    
    // Enhanced spaceship design
    translate(spaceship.x, spaceship.y);
    
    // Add an outline glow for better visibility, especially on mobile
    if (isMobileDevice) {
        // Extra visibility for mobile devices
        fill(0, 255, 0, 100);
        noStroke();
        ellipse(0, 0, spaceship.width * 1.5, spaceship.height * 1.5);
    }
    
    // Main body
    fill(0, 220, 0);
    stroke(0, 150, 0);
    strokeWeight(max(2 * scaleRatio, 2)); // Ensure minimum stroke weight for visibility
    
    // Ship body - triangle shape with clearer outline
    beginShape();
    vertex(0, -spaceship.height/2);  // Nose
    vertex(-spaceship.width/2, spaceship.height/3);  // Left corner
    vertex(-spaceship.width/4, spaceship.height/4);  // Left inner
    vertex(0, spaceship.height/2);  // Bottom middle
    vertex(spaceship.width/4, spaceship.height/4);  // Right inner
    vertex(spaceship.width/2, spaceship.height/3);  // Right corner
    endShape(CLOSE);
    
    // Cockpit with stronger color on mobile
    if (isMobileDevice) {
        fill(100, 255, 100, 200); // More opaque on mobile
    } else {
        fill(150, 255, 150, 150);
    }
    noStroke();
    ellipse(0, -spaceship.height/6, spaceship.width/3, spaceship.height/3);
    
    // Engines with brighter colors on mobile
    if (isMobileDevice) {
        fill(255, 150, 50, 250); // Brighter orange on mobile
    } else {
        fill(255, 100, 0, 200);
    }
    
    // Left engine
    ellipse(-spaceship.width/4, spaceship.height/3, spaceship.width/5, spaceship.height/6);
    // Right engine
    ellipse(spaceship.width/4, spaceship.height/3, spaceship.width/5, spaceship.height/6);
    
    // Engine glow - pulsating effect (enhanced for mobile)
    let pulse = sin(frameCount * 0.2) * 3 * scaleRatio;
    
    if (isMobileDevice) {
        fill(255, 200, 0, 180); // Brighter glow on mobile
        // Larger engine glow for mobile
        ellipse(-spaceship.width/4, spaceship.height/3 + pulse, spaceship.width/3, spaceship.height/3);
        ellipse(spaceship.width/4, spaceship.height/3 + pulse, spaceship.width/3, spaceship.height/3);
    } else {
        fill(255, 150, 0, 100);
        ellipse(-spaceship.width/4, spaceship.height/3 + pulse, spaceship.width/4, spaceship.height/4);
        ellipse(spaceship.width/4, spaceship.height/3 + pulse, spaceship.width/4, spaceship.height/4);
    }
    
    // Debug outline for visibility troubleshooting
    if (debugMode) {
        stroke(255, 0, 255);
        strokeWeight(2);
        noFill();
        rect(0, 0, spaceship.width, spaceship.height);
    }
    
    pop();
}

// Draw the starry background
function drawStarryBackground() {
    background(0);
    
    // Simple stars
    fill(255);
    noStroke();
    for (let i = 0; i < 50; i++) {
        let size = random(1, 3) * scaleRatio;
        ellipse(random(canvasWidth), random(canvasHeight), size, size);
    }
}

// Draw the splash screen
function drawSplashScreen() {
    background(0);
    
    // Draw stars for background
    drawStarryBackground();
    
    // Title
    fill(255);
    textSize(40 * scaleRatio);
    textAlign(CENTER, CENTER);
    text("API SPACE GAME", canvasWidth/2, canvasHeight/2 - 60 * scaleRatio);
    
    // Instructions
    fill(200, 200, 255);
    textSize(20 * scaleRatio);
    text("Press SPACE to start", canvasWidth/2, canvasHeight/2 + 20 * scaleRatio);
    
    // Desktop controls
    if (!isMobileDevice) {
        fill(200, 255, 200);
        textSize(16 * scaleRatio);
        text("Use LEFT/RIGHT arrows to move", canvasWidth/2, canvasHeight/2 + 60 * scaleRatio);
        text("SPACE to shoot", canvasWidth/2, canvasHeight/2 + 90 * scaleRatio);
    }
    // Mobile controls
    else {
        fill(200, 255, 200);
        textSize(16 * scaleRatio);
        text("Touch left/right sides to move", canvasWidth/2, canvasHeight/2 + 60 * scaleRatio);
        text("Touch middle to shoot", canvasWidth/2, canvasHeight/2 + 90 * scaleRatio);
    }
}

// Draw game over screen
function drawGameOverScreen() {
    background(0);
    
    // Game over message
    fill(255, 50, 50);
    textSize(40 * scaleRatio);
    textAlign(CENTER, CENTER);
    text("GAME OVER", canvasWidth/2, canvasHeight/2 - 40 * scaleRatio);
    
    // Score
    fill(255);
    textSize(24 * scaleRatio);
    text("Final Score: " + score, canvasWidth/2, canvasHeight/2 + 20 * scaleRatio);
    
    // Restart instructions
    if (canRestart) {
        fill(200, 200, 255);
        textSize(20 * scaleRatio);
        text("Press SPACE to play again", canvasWidth/2, canvasHeight/2 + 80 * scaleRatio);
    }
}

// Draw win screen
function drawWinScreen() {
    background(0, 100, 0);
    
    // Win message
    fill(255, 255, 0);
    textSize(40 * scaleRatio);
    textAlign(CENTER, CENTER);
    text("YOU WON!", canvasWidth/2, canvasHeight/2 - 60 * scaleRatio);
    
    // Score
    fill(255);
    textSize(24 * scaleRatio);
    text("Final Score: " + score, canvasWidth/2, canvasHeight/2);
    
    // Stats
    textSize(18 * scaleRatio);
    text("Correct APIs: " + correctAPICount, canvasWidth/2, canvasHeight/2 + 40 * scaleRatio);
    text("Incorrect APIs: " + incorrectAPICount, canvasWidth/2, canvasHeight/2 + 70 * scaleRatio);
    
    // Restart
    fill(200, 200, 255);
    textSize(20 * scaleRatio);
    text("Press ENTER to play again", canvasWidth/2, canvasHeight/2 + 120 * scaleRatio);
}

// Add this function to draw alien ships
function drawAlienShip(x, y, width, height) {
    push();
    // Main body 
    fill(150, 50, 200);
    stroke(100, 0, 150);
    strokeWeight(2 * scaleRatio);
    ellipse(x, y, width, height);
    
    // Cockpit
    fill(200, 150, 255);
    noStroke();
    ellipse(x, y, width * 0.5, height * 0.5);
    
    // Details
    stroke(255, 200, 0);
    strokeWeight(1 * scaleRatio);
    line(x - width/2, y, x + width/2, y);
    line(x, y - height/2, x, y + height/2);
    pop();
}

// Add this function for a more prominent objective display
function drawAPIObjective() {
    push();
    // Semi-transparent background for better readability
    fill(0, 0, 0, 150);
    noStroke();
    rectMode(CENTER);
    
    // Position at top center of the screen
    let boxWidth = isMobileDevice ? canvasWidth * 0.9 : canvasWidth * 0.6;
    let objectiveHeight = 40 * scaleRatio;
    let objectiveX = canvasWidth / 2;
    let objectiveY = 30 * scaleRatio;
    
    // Draw rounded rectangle background
    rect(objectiveX, objectiveY, boxWidth, objectiveHeight, 10 * scaleRatio);
    
    // Objective text with highlighting of the target API
    textAlign(CENTER, CENTER);
    textSize(Math.max(16 * scaleRatio, 14)); // Minimum legible size
    
    let objective = "TARGET THE ";
    
    // Draw the objective text in parts to highlight the target API
    fill(255);
    text(objective, objectiveX, objectiveY);
    
    // Measure text width to position the API name
    let textW = textWidth(objective);
    let apiX = objectiveX + textW/2 + textWidth(targetAPI)/2;
    
    // Highlight the target API
    fill(255, 255, 0); // Yellow for emphasis
    text(targetAPI, apiX, objectiveY);
    
    pop();
}
