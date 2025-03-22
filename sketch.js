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

// Setup function to initialize the canvas and spaceship
function setup() {
    // Check if device is mobile
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Set canvas size based on device
    if (isMobile) {
        // Use full window size for mobile
        canvasWidth = windowWidth;
        canvasHeight = windowHeight;
        
        // Calculate scale ratio based on reference size (800x600)
        scaleRatio = min(canvasWidth / 800, canvasHeight / 600);
    } else {
        // Use fixed size for desktop
        canvasWidth = 800;
        canvasHeight = 600;
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
    
    // Initialize Supabase client if the libraries are loaded
    try {
        console.log("Attempting to initialize Supabase client...");
        console.log("Supabase URL:", SUPABASE_URL);
        
        if (typeof supabase !== 'undefined') {
            console.log("Supabase library detected, creating client");
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        
            // Test if the client was created correctly
            if (supabaseClient && typeof supabaseClient.from === 'function') {
                console.log("Supabase client initialized successfully");
        
                // Test connection by checking if the table exists and if we have insert permission
                (async () => {
                    try {
                        console.log("Testing Supabase connection and permissions...");
        
                        // First check if table exists with a simple select
                        const { data: selectData, error: selectError } = await supabaseClient
                            .from('email_subscribers')
                            .select('id')
                            .limit(1);
                            
                        if (selectError) {
                            if (selectError.code === "42P01") {
                                console.error("Supabase table 'email_subscribers' not found. Please create it first.");
                            } else if (selectError.code === "42501" || selectError.message.includes("permission denied")) {
                                console.error("Permission denied accessing 'email_subscribers' table. Check RLS policies.");
                            } else {
                                console.error("Error testing Supabase connection:", selectError);
                            }
                        } else {
                            console.log("Table exists. Now testing insert permission...");
        
                            // Create a test object with a random email to avoid conflicts
                            const testEmail = `test_${Date.now()}@example.com`;
                            const testObject = {
                                email: testEmail,
                                name: "Test User",
                                professional_title: "Test",
                                score: 0,
                                submitted_at: new Date().toISOString(),
                                game_outcome: "test"
                            };
        
                            // Try inserting it (we'll delete it right after)
                            const { error: insertError } = await supabaseClient
                                .from('email_subscribers')
                                .insert([testObject]);
                                
                            if (insertError) {
                                console.error("Insert permission test failed:", insertError);
                                console.error("Please check your RLS policies - you need an INSERT policy.");
                            } else {
                                console.log("Insert permission test successful!");
                                
                                // Clean up the test data
                                await supabaseClient
                                    .from('email_subscribers')
                                    .delete()
                                    .match({ email: testEmail });
                                    
                                console.log("Supabase is fully configured and working correctly!");
                            }
                        }
                    } catch (e) {
                        console.error("Exception testing Supabase connection:", e);
                    }
                })();
            } else {
                console.error("Supabase client created but appears invalid");
            }
        } else {
            console.error("Supabase library not loaded! Email collection will not work. Check if the supabase-js script is included in index.html.");
        }
    } catch (e) {
        console.error("Error initializing Supabase client:", e);
    }
    
    // Set up touch zones for mobile controls
    setupTouchControls();
    
    // Create galaxy background elements
    createGalaxyBackground();
    
    // Initialize or reset the game
    resetGame();
    
    // Record start time for game statistics
    gameStartTime = millis();
}

// Set up touch control areas for mobile
function setupTouchControls() {
    if (!isMobile) return;
    
    // Left movement zone (left 1/3 of screen)
    touchZones.left.width = canvasWidth / 3;
    touchZones.left.height = canvasHeight;
    touchZones.left.x = touchZones.left.width / 2;
    touchZones.left.y = canvasHeight / 2;
    
    // Right movement zone (right 1/3 of screen)
    touchZones.right.width = canvasWidth / 3;
    touchZones.right.height = canvasHeight;
    touchZones.right.x = canvasWidth - touchZones.right.width / 2;
    touchZones.right.y = canvasHeight / 2;
    
    // Shoot button (bottom center)
    touchZones.shoot.radius = 50 * scaleRatio;
    touchZones.shoot.x = canvasWidth / 2;
    touchZones.shoot.y = canvasHeight - 80 * scaleRatio;
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
        // Wrap the entire draw function in a try-catch to prevent game crashes
        
        // Draw galaxy background instead of plain black
        drawGalaxyBackground();

        if (gameState === "splash") {
            // Draw splash screen with company branding
            drawSplashScreen();
            
            // After timeout, switch to about screen
            if (millis() > splashTimeout) {
                gameState = "about";
            }
        }
        else if (gameState === "about") {
            // Draw the about/intro screen
            drawAboutScreen();
        }
        else if (gameState === "playing") {
            // Display the current HR use case objective - enhanced with glow and panel
            drawObjectivePanel();

            // Move the spaceship based on controls (keyboard or touch)
            handlePlayerMovement();

            // Spawn APIs at intervals
            frameCountAPI++;
            if (frameCountAPI >= apiSpawnInterval) {
                let apiTypes = ["Hire API", "Rate change API", "Job change API", "Pay Data API", "Terminate API"];
                
                // Increase chance of spawning the correct API
                let type;
                if (random(1) < 0.4) { // 40% chance to spawn the correct API
                    type = levels[currentLevel].correctAPI;
                } else {
                    // Otherwise pick a random one that's not the correct one
                    let incorrectTypes = apiTypes.filter(t => t !== levels[currentLevel].correctAPI);
                    type = random(incorrectTypes);
                }
                
                // Check if this is the correct API for the current level
                let isCorrect = (type === levels[currentLevel].correctAPI);
                
                // All APIs have the same size - slightly larger to fit text better
                let size = 85;
                
                // Make sure all properties are properly initialized
                let api = { 
                    x: random(50, canvasWidth - 50), 
                    y: 0, 
                    w: size,  // Same width for all bubbles
                    h: size,  // Same height for all bubbles
                    type: type,
                    isCorrect: isCorrect,        // Flag to identify correct APIs
                    pulse: 0,                    // For pulsating effect
                    rotation: 0,                 // For rotation effect
                    state: "normal"              // Can be "normal", "correct" (green), or "incorrect" (red)
                };
                
                // Debug log to verify correct APIs are being created
                if (debugMode && isCorrect) {
                    console.log("Spawned correct API:", type);
                }
                
                apis.push(api);
                frameCountAPI = 0;
            }

            // Spawn asteroids at intervals - now alien ships
            frameCountAsteroid++;
            if (frameCountAsteroid >= asteroidSpawnInterval) {
                let alienShip = { 
                    x: random(50, canvasWidth - 50), 
                    y: 0, 
                    w: 85,  // Now matches bubble size (was 60)
                    h: 85,  // Now matches bubble size (was 40)
                    color: [50, 200, 80], // Green color (was random purple-ish)
                    thrusterPulse: random(TWO_PI), // For animated thrusters
                    rotation: random(-0.3, 0.3), // Slight tilt for variation
                    movePattern: floor(random(3)) // 0: straight, 1: zigzag, 2: sine wave
                };
                
                asteroids.push(alienShip);
                frameCountAsteroid = 0;
            }

            // Update API positions and check for removal of hit APIs
            for (let i = apis.length - 1; i >= 0; i--) {
                let api = apis[i];
                
                // Move downward (if not hit)
                if (api.state === "normal") {
                    api.y += 2; 
                }
                
                // Check if API is off-screen
                if (api.y > canvasHeight) {
                    apis.splice(i, 1); // Remove if off-screen
                    continue;
                }
                
                // Check if hit API should be removed
                if (api.state === "correct" || api.state === "incorrect") {
                    if (millis() - api.hitTime > api.removeDelay) {
                        // Create explosion particles for destroyed API
                        if (api.state === "correct") {
                            // Create a special explosion for correct APIs
                            for (let k = 0; k < 50; k++) { // More particles for correct APIs
                                let p = {
                                    x: api.x,
                                    y: api.y,
                                    vx: random(-3, 3),
                                    vy: random(-3, 3),
                                    size: random(5, 15),
                                    alpha: 255,
                                    color: [30, 200, 30], // Green color for correct
                                    decay: random(0.95, 0.98), // Slower decay for a more dramatic effect
                                    glow: true // Special flag for glowing particles
                                };
                                particles.push(p);
                            }
                            
                            // Create text particles that float upward with "CORRECT!"
                            let textParticle = {
                                x: api.x,
                                y: api.y,
                                vy: -1.5, // Float upward
                                alpha: 255,
                                size: 24,
                                text: "CORRECT!",
                                lifespan: 60 // Frames to live
                            };
                            textParticles.push(textParticle);
                            
                            // Create score particle
                            let scoreParticle = {
                                x: api.x,
                                y: api.y + 15, // Position below the "CORRECT!" text
                                vy: -1, // Float upward slower than the text
                                alpha: 255,
                                size: 20,
                                text: api.scoreValue,
                                color: api.scoreColor,
                                lifespan: 75 // Live a bit longer than CORRECT text
                            };
                            textParticles.push(scoreParticle);
                            
                            // Start celebration for level completion
                            gameState = "levelCompleted";
                            celebrationStartTime = millis();
                            
                            // Create fireworks for celebration
                            for (let k = 0; k < 10; k++) {
                                createFirework();
                            }
                        } else {
                            // Regular explosion for incorrect APIs
                            for (let k = 0; k < 20; k++) {
                                let p = {
                                    x: api.x,
                                    y: api.y,
                                    vx: random(-2, 2),
                                    vy: random(-2, 2),
                                    size: random(3, 8),
                                    alpha: 255,
                                    color: [255, 50, 50], // Red color for incorrect
                                    decay: 0.9
                                };
                                particles.push(p);
                            }
                            
                            // Create score particle for incorrect APIs
                            let scoreParticle = {
                                x: api.x,
                                y: api.y,
                                vy: -1.2, // Float upward
                                alpha: 255,
                                size: 18,
                                text: api.scoreValue,
                                color: api.scoreColor,
                                lifespan: 60
                            };
                            textParticles.push(scoreParticle);
                        }
                        
                        // Remove the API
                        apis.splice(i, 1);
                    }
                }
            }
            
            // Update asteroid positions
            for (let i = asteroids.length - 1; i >= 0; i--) {
                let alien = asteroids[i];
                
                // Basic downward movement
                alien.y += 1.5;
                
                // Apply different movement patterns
                switch(alien.movePattern) {
                    case 0: // Straight down (default)
                        // No additional movement
                        break;
                    case 1: // Zigzag pattern
                        alien.x += Math.sin(frameCount * 0.05 + i) * 1.5;
                        break;
                    case 2: // Sine wave pattern
                        alien.x += Math.sin(alien.y * 0.02) * 2;
                        break;
                }
                
                // Remove if off-screen
                if (alien.y > canvasHeight + 50 || alien.x < -50 || alien.x > canvasWidth + 50) {
                    asteroids.splice(i, 1);
                }
            }

            // Draw all game elements
            drawGameElements(true);

            // Handle bullet cooldown
            if (bulletCooldown > 0) bulletCooldown--;

            // Update and draw bullets - make them more visible
            for (let i = bullets.length - 1; i >= 0; i--) {
                let bullet = bullets[i];
                bullet.y -= 8; // Move upward faster
                if (bullet.y < 0) {
                    bullets.splice(i, 1); // Remove if off top of screen
                    continue;
                }
                fill(255, 255, 0); // Yellow rectangle instead of white
                rect(bullet.x, bullet.y, bullet.w, bullet.h);
            }

            // Check for bullet-API collisions
            for (let i = bullets.length - 1; i >= 0; i--) {
                for (let j = apis.length - 1; j >= 0; j--) {
                    if (collideRectRect(bullets[i].x, bullets[i].y, bullets[i].w, bullets[i].h,
                        apis[j].x, apis[j].y, apis[j].w, apis[j].h) && apis[j].state === "normal") {
                        
                        // Remove the bullet
                        bullets.splice(i, 1);
                        
                        if (apis[j].isCorrect) {
                            // Update the state to correct (green)
                            apis[j].state = "correct";
                            apis[j].hitTime = millis();
                            apis[j].removeDelay = 800; // Show green for 800ms before removing
                            
                            // Update score with bonus for correct API
                            score += 100;
                            
                            // Feedback for player
                            flashMessage = "Strategic API selection! +100";
                            flashTimer = 90; // Display message longer
                            flashColor = [50, 255, 50]; // Green text for positive feedback
                            
                            // Store score value for explosion text
                            apis[j].scoreValue = "+100";
                            apis[j].scoreColor = [50, 255, 50]; // Green
                        } else {
                            // Update the state to incorrect (red)
                            apis[j].state = "incorrect";
                            apis[j].hitTime = millis();
                            apis[j].removeDelay = 500; // Show red for 500ms before removing
                            
                            // Deduct points for incorrect API
                            score -= 50;
                            score = max(0, score); // Prevent negative score
                            
                            // Feedback for incorrect choice
                            flashMessage = "Incorrect API implementation! -50";
                            flashTimer = 60;
                            flashColor = [255, 50, 50]; // Red text for negative feedback
                            
                            // Store score value for explosion text
                            apis[j].scoreValue = "-50";
                            apis[j].scoreColor = [255, 50, 50]; // Red
                        }
                        
                        break;
                    }
                }
            }

            // Check collisions between spaceship and alien ships
            for (let alien of asteroids) {
                // For alien ships, we'll use circle-rectangle collision since they're elliptical
                if (collideEllipseRect(alien.x, alien.y, alien.w, alien.h, 
                                     spaceship.x, spaceship.y, spaceship.w, spaceship.h)) {
                    // Start explosion instead of immediately going to lost state
                    gameState = "exploding";
                    explosionStartTime = millis();
                    
                    // Create explosion particles
                    createExplosion(spaceship.x, spaceship.y, 100);
                }
            }

            // On mobile, draw touch controls
            if (isMobile) {
                drawTouchControls();
            }

            // Add professional statistics overlay
            drawProfessionalStats();
        } 
        else if (gameState === "levelCompleted") {
            // Draw the spaceship
            drawGameElements(true);
            
            // Show celebration message
            fill(255, 215, 0); // Gold color
            textSize(36 * scaleRatio);
            text("Correct API Choice!", canvasWidth / 2, canvasHeight / 2 - 70 * scaleRatio);
            
            // Show explanation of the API with improved formatting
            let explanation = levels[currentLevel].explanation;
            
            // Calculate appropriate text size based on device and explanation length
            let explanationSize = 20 * scaleRatio;
            if (isMobile) {
                explanationSize = 18 * scaleRatio;
            }
            if (explanation.length > 80) {
                explanationSize *= 0.9;
            }
            
            // Format explanation text to fit the screen
            let formattedExplanation = explanation;
            if ((isMobile && explanation.length > 40) || explanation.length > 60) {
                // Find a good breaking point
                let middleIndex = Math.floor(explanation.length / 2);
                let breakIndex = explanation.lastIndexOf(' ', middleIndex + 10);
                if (breakIndex === -1) breakIndex = middleIndex;
                
                formattedExplanation = explanation.substring(0, breakIndex) + '\n' + 
                                      explanation.substring(breakIndex + 1);
            }
            
            fill(255);
            textSize(explanationSize);
            text(formattedExplanation, canvasWidth / 2, canvasHeight / 2);
            
            // Professional context with better spacing
            let contextYPos = canvasHeight / 2 + 40 * scaleRatio;
            if (formattedExplanation.includes('\n')) {
                contextYPos += 10 * scaleRatio; // Add more space for multiline explanations
            }
            
            fill(200, 255, 200);
            textSize(18 * scaleRatio);
            text("API integrations save businesses time and resources and create efficient workflows", canvasWidth / 2, contextYPos);
            
            // Update and draw fireworks
            updateFireworks();
            
            // Add hashtags for social sharing with better positioning
            let hashtagYPos = contextYPos + 40 * scaleRatio;
            
            fill(180, 180, 255);
            textSize(16 * scaleRatio);
            text("#PayrollAPI #HRTech #APIExpert #ADP #ADPMarketPlace", canvasWidth / 2, hashtagYPos);
            
            // Add "Tap or press any key to continue" message with blinking effect
            let continueYPos = hashtagYPos + 40 * scaleRatio;
            
            // Always show message - make it more visible with blinking
            if (Math.floor((millis() % 1000) / 500)) {
                fill(255, 255, 100); // Brighter yellow for more visibility
                textSize(22 * scaleRatio);
            } else {
                fill(200, 200, 150);
                textSize(20 * scaleRatio);
            }
            
            // Make the text more prominent
            textStyle(BOLD);
            text("TAP OR PRESS ANY KEY TO CONTINUE", canvasWidth / 2, continueYPos);
            textStyle(NORMAL);
            
            // IMPORTANT: Only advance on key press or tap - removed auto-advance with timer
            // This code was previously here but is now handled in keyPressed/touchEnded functions
        }
        else if (gameState === "exploding") {
            // Draw all the game elements in the background (APIs, asteroids)
            drawGameElements(false); // Don't draw the spaceship
            
            // Update and display explosion particles
            updateExplosion();
            
            // Check if explosion duration has passed
            if (millis() - explosionStartTime > explosionDuration) {
                gameState = "lost"; // Now go to the lost state
                
                // Hide email collection form if it's showing
                // Only collect emails when player wins
                showEmailCollection = false;
                emailInputActive = false;
            }
        } 
        else if (gameState === "won") {
            // Create a professional panel background
            fill(10, 20, 40, 200);
            noStroke();
            rect(canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.9, canvasHeight * 0.9, 15 * scaleRatio);
            
            // Add border to panel
            noFill();
            stroke(brandColor[0], brandColor[1], brandColor[2], 150);
            strokeWeight(2 * scaleRatio);
            rect(canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.88, canvasHeight * 0.88, 13 * scaleRatio);
            
            // SECTION 1: TOP AREA - TITLE AND TROPHY
            // Display win message with personalization - positioned at top
            noStroke();
            fill(255, 215, 0); // Gold color
            textSize(36 * scaleRatio);
            textAlign(CENTER, CENTER);
            text("API Integration Expert!", canvasWidth / 2, canvasHeight * 0.12);
            
            // Trophy next to the title
            push();
            translate(canvasWidth / 2, canvasHeight * 0.22);
            drawCertificationBadge();
            pop();
            
            // SECTION 2: PLAYER INFO - Name, Title, Score
            // Personal branding 
            textSize(26 * scaleRatio);
            fill(255);
            text(playerName, canvasWidth / 2, canvasHeight * 0.32);
            
            // Display professional title
            textSize(20 * scaleRatio);
            fill(180, 220, 255);
            text(professionalTitle, canvasWidth / 2, canvasHeight * 0.37);
            
            // Display final score with professional context
            textSize(28 * scaleRatio);
            fill(255);
            text("Final Score: " + score, canvasWidth / 2, canvasHeight * 0.43);
            
            // First separator line
            stroke(100, 150, 200, 150);
            strokeWeight(1 * scaleRatio);
            line(canvasWidth * 0.3, canvasHeight * 0.47, canvasWidth * 0.7, canvasHeight * 0.47);
            
            // SECTION 3: EMAIL COLLECTION - Only if not submitted
            if (!emailSubmitted) {
                // Show email collection form
                drawIntegratedEmailForm();
            } else {
                // Thank you message if email was submitted
                noStroke();
                fill(70, 255, 120);
                textSize(20 * scaleRatio);
                textAlign(CENTER, CENTER);
                text("Thank you for subscribing!", canvasWidth / 2, canvasHeight * 0.55);
            }
            
            // Second separator line
            noStroke();
            stroke(100, 150, 200, 150);
            strokeWeight(1 * scaleRatio);
            line(canvasWidth * 0.3, canvasHeight * 0.64, canvasWidth * 0.7, canvasHeight * 0.64);
            
            // SECTION 4: LINKEDIN SHARING
            // LinkedIn context heading
            noStroke();
            fill(255);
            textSize(18 * scaleRatio);
            text("Showcase your Payroll & HR API knowledge:", canvasWidth / 2, canvasHeight * 0.69);
            
            // LinkedIn benefit text
            fill(200, 200, 200);
            textSize(16 * scaleRatio);
            text("Stand out to recruiters and hiring managers in the HR tech space", 
                canvasWidth / 2, canvasHeight * 0.73);
            
            // LinkedIn sharing button - moved down by increasing Y position
            fill(10, 102, 194); // LinkedIn blue
            rect(canvasWidth / 2, canvasHeight * 0.81, 300 * scaleRatio, 45 * scaleRatio, 25);
            
            fill(255);
            textSize(20 * scaleRatio);
            text("Share on LinkedIn", canvasWidth / 2, canvasHeight * 0.81);
            
            // SECTION 5: RESTART INSTRUCTION
            // Final separator line - moved down to match new LinkedIn button position
            stroke(100, 150, 200, 150);
            strokeWeight(1 * scaleRatio);
            line(canvasWidth * 0.3, canvasHeight * 0.86, canvasWidth * 0.7, canvasHeight * 0.86);
            
            // Restart instruction at bottom - moved down to match new separator position
            noStroke();
            fill(255);
            textSize(16 * scaleRatio);
            text("Press ENTER to play again", canvasWidth / 2, canvasHeight * 0.91);
            
            // Draw some celebratory fireworks for the win screen
            if (random(1) < 0.05) { // 5% chance each frame to create a new firework
                createFirework();
            }
            updateFireworks();
        } 
        else if (gameState === "lost") {
            // Display lose message
            fill(255);
            textSize(36 * scaleRatio);
            text("Game Over", canvasWidth / 2, canvasHeight / 2 - 40 * scaleRatio);
            
            // Display final score
            textSize(30 * scaleRatio);
            text("Final Score: " + score, canvasWidth / 2, canvasHeight / 2 + 10 * scaleRatio);
            
            textSize(24 * scaleRatio);
            text("Press ENTER to try again", canvasWidth / 2, canvasHeight / 2 + 60 * scaleRatio);
            
            // Removed email collection from the lost state per user request
            // Only collecting emails when player wins the game
        }

        // Draw debug information
        drawDebug();
        
        // Update and draw explosion particles
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha *= p.decay;
            
            if (p.glow) {
                // Draw glowing particles
                noStroke();
                // Outer glow
                for (let j = 5; j > 0; j--) {
                    fill(p.color[0], p.color[1], p.color[2], p.alpha * 0.2);
                    ellipse(p.x, p.y, p.size + j * 3, p.size + j * 3);
                }
                // Inner particle
                fill(p.color[0], p.color[1], p.color[2], p.alpha);
                ellipse(p.x, p.y, p.size, p.size);
            } else {
                // Regular particles
                fill(p.color[0], p.color[1], p.color[2], p.alpha);
                ellipse(p.x, p.y, p.size, p.size);
            }
            
            if (p.alpha < 5) {
                particles.splice(i, 1);
            }
        }

        // Draw text particles
        for (let i = textParticles.length - 1; i >= 0; i--) {
            let tp = textParticles[i];
            tp.y += tp.vy;
            tp.lifespan--;
            tp.alpha = map(tp.lifespan, 0, 60, 0, 255);
            
            // Draw glowing text
            textSize(tp.size);
            textAlign(CENTER, CENTER);
            
            if (tp.color) {
                // Use custom color if provided
                // Glow effect
                fill(tp.color[0], tp.color[1], tp.color[2], tp.alpha * 0.5);
                text(tp.text, tp.x + 1, tp.y + 1);
                
                // Main text
                fill(tp.color[0], tp.color[1], tp.color[2], tp.alpha);
                text(tp.text, tp.x, tp.y);
            } else {
                // Default glow effect
                fill(30, 100, 255, tp.alpha * 0.5);
                text(tp.text, tp.x + 1, tp.y + 1);
                
                // Main text
                fill(255, 255, 255, tp.alpha);
                text(tp.text, tp.x, tp.y);
            }
            
            if (tp.lifespan <= 0) {
                textParticles.splice(i, 1);
            }
        }

        // Display flash message
        if (flashTimer > 0) {
            flashTimer--;
            textSize(24 * scaleRatio);
            textAlign(CENTER);
            
            // Glow effect
            fill(flashColor[0], flashColor[1], flashColor[2], min(flashTimer * 3, 100));
            text(flashMessage, canvasWidth/2 + 2 * scaleRatio, 100 * scaleRatio + 2 * scaleRatio);
            
            // Main text
            fill(255, 255, 255, min(flashTimer * 3, 255));
            text(flashMessage, canvasWidth/2, 100 * scaleRatio);
        }

        // Draw the email collection form
        drawEmailCollectionForm();
        
        // Update cursor blink for email input if active
        if ((gameState === "won" && emailInputActive) || (showEmailCollection && emailInputActive)) {
            emailCursorTimer++;
            if (emailCursorTimer > 30) {
                emailCursorVisible = !emailCursorVisible;
                emailCursorTimer = 0;
            }
        }
    } catch (error) {
        // Recover from any rendering errors
        console.error("Error in draw function:", error);
        
        // Basic recovery - clear the screen and show an error message
        background(0);
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        textSize(20);
        text("An error occurred. Press ENTER to restart.", canvasWidth/2, canvasHeight/2);
        
        // Allow the game to recover by pressing ENTER
        if (keyIsDown(ENTER)) {
            resetGame();
        }
    }
}

// Handle player movement from keyboard or touch
function handlePlayerMovement() {
    // Keyboard controls for desktop - use keyIsDown for more reliable input detection
    if (keyIsDown(LEFT_ARROW)) {
        spaceship.x -= spaceship.speed;
    }
    if (keyIsDown(RIGHT_ARROW)) {
        spaceship.x += spaceship.speed;
    }
    
    // Touch controls for mobile
    if (isMobile) {
        if (touchZones.left.active) {
            spaceship.x -= spaceship.speed;
        }
        if (touchZones.right.active) {
            spaceship.x += spaceship.speed;
        }
        
        // Auto-shoot with a cooldown on mobile
        if (touchZones.shoot.active && bulletCooldown <= 0) {
            shootBullet();
        }
    }
    
    // Keep the spaceship within the canvas
    spaceship.x = constrain(spaceship.x, spaceship.w / 2, canvasWidth - spaceship.w / 2);
}

// Draw touch controls on mobile
function drawTouchControls() {
    // Only draw controls in debug mode or semi-transparent normally
    let controlOpacity = debugMode ? 100 : 40;
    
    // Left movement zone
    noStroke();
    if (touchZones.left.active) {
        fill(0, 200, 255, controlOpacity + 20);
    } else {
        fill(200, 200, 200, controlOpacity);
    }
    
    // Left arrow indicator
    push();
    translate(touchZones.left.x, touchZones.left.y);
    triangle(-20 * scaleRatio, 0, 20 * scaleRatio, -30 * scaleRatio, 20 * scaleRatio, 30 * scaleRatio);
    pop();
    
    // Right movement zone
    if (touchZones.right.active) {
        fill(0, 200, 255, controlOpacity + 20);
    } else {
        fill(200, 200, 200, controlOpacity);
    }
    
    // Right arrow indicator
    push();
    translate(touchZones.right.x, touchZones.right.y);
    triangle(20 * scaleRatio, 0, -20 * scaleRatio, -30 * scaleRatio, -20 * scaleRatio, 30 * scaleRatio);
    pop();
    
    // Shoot button
    if (touchZones.shoot.active) {
        fill(255, 50, 50, controlOpacity + 40);
    } else {
        fill(255, 200, 0, controlOpacity);
    }
    ellipse(touchZones.shoot.x, touchZones.shoot.y, touchZones.shoot.radius * 2);
    
    fill(255, 255, 255, controlOpacity + 60);
    textSize(18 * scaleRatio);
    text("FIRE", touchZones.shoot.x, touchZones.shoot.y);
}

// Shoot bullets function
function shootBullet() {
    // Create a single bullet from the center of the spaceship
    let bullet = { 
        x: spaceship.x, 
        y: spaceship.y - 20 * scaleRatio, 
        w: 4 * scaleRatio,  // Slightly wider for better visibility
        h: 12 * scaleRatio  // Slightly longer
    };
    
    bullets.push(bullet);
    bulletCooldown = 10; // Limit firing rate
}

// Touch event handlers
function touchStarted() {
    if (!isMobile) return;
    
    checkTouchZones();
    // Prevent default to avoid browser gestures
    return false;
}

function touchMoved() {
    if (!isMobile) return;
    
    checkTouchZones();
    // Prevent default to avoid browser gestures
    return false;
}

function touchEnded() {
    if (!isMobile) return;
    
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
    
    // Clear the touch zones
    touchZones.left.active = false;
    touchZones.right.active = false;
    
    // Don't clear shoot on touchEnd to allow continuous shooting
    // by holding the button
    
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
    // Reset touch zones
    touchZones.left.active = false;
    touchZones.right.active = false;
    touchZones.shoot.active = false;
    
    // Check each touch point
    for (let i = 0; i < touches.length; i++) {
        let touch = touches[i];
        
        // Check left zone
        if (touch.x < canvasWidth / 3) {
            touchZones.left.active = true;
        }
        
        // Check right zone
        if (touch.x > canvasWidth * 2/3) {
            touchZones.right.active = true;
        }
        
        // Check shoot button
        if (dist(touch.x, touch.y, touchZones.shoot.x, touchZones.shoot.y) < touchZones.shoot.radius) {
            touchZones.shoot.active = true;
        }
    }
}

// Add a new keyPressed function to handle shooting more reliably
function keyPressed() {
    // Debug logging
    console.log("keyPressed - keyCode:", keyCode, "key:", key, "gameState:", gameState, "emailInputActive:", emailInputActive);
    
    // Handle integrated email form in won screen
    if (gameState === "won" && !emailSubmitted) {
        if (emailInputActive) {
            // Special keys for email field
            if (keyCode === BACKSPACE) {
                emailInput = emailInput.slice(0, -1);
                return false;
            } 
            else if (keyCode === ENTER) {
                if (!emailSubmitting) {
                    submitEmailToSupabase();
                }
                return false;
            }
            else if (keyCode === TAB) {
                emailInputActive = false;
                return false;
            }
            else if (keyCode === ESCAPE) {
                emailInputActive = false;
                return false;
            }
            // Let other keys through to keyTyped
            return true;
        }
        
        // Allow ENTER to restart the game
        if (keyCode === ENTER) {
            resetGame();
            return false;
        }
    }
    
    // Handle email input for modal form
    if (showEmailCollection) {
        if (keyCode === ESCAPE) {
            console.log("Escape key pressed, hiding email form");
            showEmailCollection = false;
            emailInputActive = false;
            return false;
        }
        
        if (emailInputActive) {
            if (keyCode === BACKSPACE) {
                emailInput = emailInput.slice(0, -1);
                return false;
            } 
            else if (keyCode === ENTER) {
                if (!emailSubmitting) {
                    submitEmailToSupabase();
                }
                return false;
            }
            else if (keyCode === TAB) {
                emailInputActive = false;
                return false;
            }
            // Let other keys through to keyTyped
            return true;
        }
        
        return false; // Block other keys while email form is shown but input not active
    }
    
    // Handle name input when customizing
    if (gameState === "about" && customizeNameMode) {
        if (keyCode === BACKSPACE) {
            inputName = inputName.slice(0, -1);
            return false;
        }
        else if (keyCode === ENTER || keyCode === ESCAPE) {
            customizeNameMode = false;
            return false;
        }
        return true; // Let regular keys through to keyTyped
    }
    
    // Level completion keys
    if (gameState === "levelCompleted") {
        // Any key press advances to the next level
        currentLevel++;
        if (currentLevel >= levels.length) {
            gameState = "won";
        } else {
            gameState = "playing";
        }
        return false;
    }
    
    // Game restart
    if (keyCode === ENTER && (gameState === "lost" || gameState === "won")) {
        showEmailCollection = false;
        resetGame();
        return false;
    }
    
    // Debug mode toggle
    if (key === 'd' || key === 'D') {
        toggleDebug();
        return false;
    }
    
    // Let through gameplay keys by default
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
    currentLevel = 0;
    if (gameState === "splash") {
        // Skip the splash screen on restart
        gameState = "playing";
    } else {
        gameState = "playing";
    }
    apis = [];
    asteroids = [];
    bullets = [];
    fireworks = [];
    explosionParticles = []; // Clear explosion particles
    frameCountAPI = 0;
    frameCountAsteroid = 0;
    score = 0; // Reset score when game is reset
    
    // Reset email collection state
    showEmailCollection = false;
    emailInputActive = false;
    // Don't reset emailSubmitted so we don't ask for email again if they've already provided it
    
    // Create the spaceship with dimensions matching the new design and scaled for mobile
    spaceship = { 
        x: canvasWidth / 2, 
        y: canvasHeight - 50 * scaleRatio, 
        w: 50 * scaleRatio,      // Width now represents the full wingspan 
        h: 40 * scaleRatio,      // Height includes from nose to engine
        speed: 5 * scaleRatio    // Speed scaled for different screen sizes
    };
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
    // Draw APIs
    for (let api of apis) {
        // Update animation properties for all bubbles
        api.pulse = (api.pulse + 0.04) % TWO_PI; // Increment pulse value
        api.rotation += 0.005; // Slow rotation for all bubbles
        
        // Every API is a bubble with appearance based on state
        push();
        translate(api.x, api.y);
        rotate(api.rotation);
        
        // Different colors based on state
        let bubbleColors;
        
        if (api.state === "normal") {
            // Default blue bubble color
            bubbleColors = {
                outer: [30, 100, 220],
                inner: [40, 120, 230],
                fill: [50, 130, 240],
                text: [255, 255, 255],
                highlight: [255, 255, 255]
            };
        } 
        else if (api.state === "correct") {
            // Green for correct
            bubbleColors = {
                outer: [30, 200, 30],
                inner: [40, 230, 40],
                fill: [50, 255, 50],
                text: [255, 255, 255],
                highlight: [200, 255, 200]
            };
        } 
        else if (api.state === "incorrect") {
            // Red for incorrect
            bubbleColors = {
                outer: [200, 30, 30],
                inner: [230, 40, 40],
                fill: [255, 50, 50],
                text: [255, 255, 255],
                highlight: [255, 200, 200]
            };
        }
        
        // Draw outer glow
        noStroke();
        for (let i = 8; i > 0; i--) {
            let alpha = map(i, 0, 8, 40, 0);
            fill(bubbleColors.outer[0], bubbleColors.outer[1], bubbleColors.outer[2], alpha);
            let size = api.w + i * 3;
            ellipse(0, 0, size, size);
        }
        
        // Draw bubble with pulsating effect
        let pulseSize = sin(api.pulse) * 8;
        
        // Inner glow
        fill(bubbleColors.inner[0], bubbleColors.inner[1], bubbleColors.inner[2], 150);
        ellipse(0, 0, api.w + pulseSize, api.w + pulseSize);
        
        // Bubble fill
        fill(bubbleColors.fill[0], bubbleColors.fill[1], bubbleColors.fill[2], 200);
        ellipse(0, 0, api.w, api.w);
        
        // Highlight
        noFill();
        stroke(bubbleColors.highlight[0], bubbleColors.highlight[1], bubbleColors.highlight[2], 150);
        strokeWeight(2);
        arc(0, 0, api.w * 0.7, api.w * 0.7, PI * 0.7, PI * 1.4);
        
        // Format API text for better display
        let displayText = formatAPIText(api.type);
        
        // Text with glow effect
        noStroke();
        
        // Adjust text size based on API string length
        let textSizeValue = 12;
        if (api.type.length > 12) {
            textSizeValue = 10; // Smaller text for longer API names
        }
        
        // Text glow
        fill(bubbleColors.text[0], bubbleColors.text[1], bubbleColors.text[2], 150);
        textSize(textSizeValue + 1);
        text(displayText, 0, 0);
        
        // Actual text
        fill(255);
        textSize(textSizeValue);
        text(displayText, 0, 0);
        
        pop();
    }
    
    // Draw asteroids (now alien ships)
    for (let alien of asteroids) {
        push();
        translate(alien.x, alien.y);
        rotate(alien.rotation);
        
        // Update thruster animation
        alien.thrusterPulse = (alien.thrusterPulse + 0.1) % TWO_PI;
        let pulseSize = sin(alien.thrusterPulse) * 2;
        
        // CLASSIC ALIEN INVADER SPACESHIP DESIGN
        
        // Main saucer body
        fill(70, 70, 90);
        stroke(40, 40, 50);
        strokeWeight(2);
        ellipse(0, 0, alien.w, alien.h * 0.5); // Flattened ellipse for classic saucer shape
        
        // Cockpit dome
        fill(90, 200, 255, 150 + pulseSize * 20);
        stroke(40, 120, 180);
        strokeWeight(1.5);
        ellipse(0, -alien.h * 0.1, alien.w * 0.4, alien.h * 0.3);
        
        // Alien silhouette inside cockpit
        fill(30, 255, 30);
        noStroke();
        // Alien head
        ellipse(0, -alien.h * 0.1, alien.w * 0.2, alien.h * 0.15);
        // Alien eyes
        fill(255, 0, 0);
        ellipse(-alien.w * 0.06, -alien.h * 0.12, alien.w * 0.05, alien.h * 0.05);
        ellipse(alien.w * 0.06, -alien.h * 0.12, alien.w * 0.05, alien.h * 0.05);
        
        // Bottom section with lights
        fill(50, 50, 70);
        stroke(30, 30, 40);
        strokeWeight(1);
        arc(0, 0, alien.w, alien.h * 0.5, 0, PI, CHORD);
        
        // Bottom lights - pulsating in sequence
        noStroke();
        for (let i = 0; i < 7; i++) {
            let phase = (frameCount * 0.1 + i * 0.4) % TWO_PI;
            let brightnessPulse = sin(phase) * 120 + 135;
            
            fill(255, brightnessPulse, brightnessPulse);
            let xPos = map(i, 0, 6, -alien.w * 0.35, alien.w * 0.35);
            ellipse(xPos, alien.h * 0.1, alien.w * 0.08, alien.h * 0.08);
        }
        
        // Death ray effect - occasionally fires downward
        if (random() < 0.02) {
            noStroke();
            fill(255, 50, 50, 150);
            beginShape();
            vertex(-alien.w * 0.1, alien.h * 0.15);
            vertex(alien.w * 0.1, alien.h * 0.15);
            vertex(alien.w * 0.2, alien.h * 0.4);
            vertex(-alien.w * 0.2, alien.h * 0.4);
            endShape(CLOSE);
        }
        
        // Top antenna
        stroke(100, 100, 120);
        strokeWeight(2);
        line(0, -alien.h * 0.2, 0, -alien.h * 0.35);
        
        // Antenna beacon - blinking
        noStroke();
        if (frameCount % 30 < 15) {
            fill(255, 0, 0, 200); // Red beacon
        } else {
            fill(255, 200, 0, 200); // Yellow beacon
        }
        ellipse(0, -alien.h * 0.35, alien.w * 0.08, alien.h * 0.08);
        
        // Engine glow
        noStroke();
        fill(100, 200, 255, 100 + pulseSize * 30);
        ellipse(0, alien.h * 0.05, alien.w * 0.6, alien.h * 0.15);
        
        pop();
    }
    
    // Draw spaceship if requested
    if (includeSpaceship) {
        push(); // Save the current drawing state
        translate(spaceship.x, spaceship.y);
        
        // Draw engine glow/thrusters
        noStroke();
        fill(255, 100, 0, 150); // Orange with transparency
        // Pulsating engine effect
        let pulseSize = 2 + sin(frameCount * 0.2) * 1.5;
        ellipse(-15, 15, 8, 12 + pulseSize);
        ellipse(15, 15, 8, 12 + pulseSize);
        
        // Main body - sleek futuristic design
        stroke(100, 100, 100);
        strokeWeight(1);
        
        // Ship body - metallic blue-gray gradient
        fill(120, 140, 180); 
        beginShape();
        vertex(0, -25); // Nose of the ship
        vertex(20, 0);  // Right corner
        vertex(25, 15); // Right bottom corner
        vertex(10, 10); // Right inner corner
        vertex(0, 15);  // Bottom middle
        vertex(-10, 10); // Left inner corner
        vertex(-25, 15); // Left bottom corner
        vertex(-20, 0);  // Left corner
        endShape(CLOSE);
        
        // Cockpit
        fill(200, 230, 255, 200); // Light blue transparent
        ellipse(0, -5, 15, 20);
        
        // Wings
        fill(80, 80, 100);
        rect(-23, 5, 10, 5);
        rect(23, 5, 10, 5);
        
        // Single weapon mount in center
        fill(100);
        rect(0, -5, 10, 5);
        
        // Single weapon barrel
        fill(255, 255, 0); // Yellow 
        rect(0, -12, 4, 12);
        
        // Engine details
        fill(50);
        rect(-15, 12, 8, 6);
        rect(15, 12, 8, 6);
        
        // Highlight
        stroke(255, 255, 255, 100);
        strokeWeight(1);
        line(-10, -15, 10, -15);
        
        pop(); // Restore the original drawing state
    }
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
    // Professional background
    fill(10, 20, 40, 220);
    noStroke();
    rect(canvasWidth/2, canvasHeight/2, canvasWidth * 0.9, canvasHeight * 0.85, 15 * scaleRatio);
    
    // Border
    noFill();
    stroke(brandColor[0], brandColor[1], brandColor[2], 180);
    strokeWeight(2 * scaleRatio);
    rect(canvasWidth/2, canvasHeight/2, canvasWidth * 0.88, canvasHeight * 0.83, 13 * scaleRatio);
    
    // Title
    noStroke();
    fill(255);
    textSize(30 * scaleRatio);
    textAlign(CENTER, TOP);
    textStyle(BOLD);
    text("Payroll & HR API Challenge", canvasWidth/2, 60 * scaleRatio);
    
    // Description
    textSize(18 * scaleRatio);
    textStyle(NORMAL);
    textAlign(LEFT, TOP);
    let descriptionText = 
        "Test your knowledge of payroll and HR integration APIs in this " +
        "fast-paced challenge! As a payroll systems expert, your goal is to " +
        "identify and select the correct APIs for common HR tasks.\n\n" +
        "• Shoot the correct API bubbles to gain points\n" +
        "• Avoid the software bugs that can crash your system\n" +
        "• Complete all integration challenges to become certified\n\n" +
        "This game demonstrates your expertise in HR/Payroll system integration " +
        "and API selection - a valuable skill in modern HR technology.";
    
    let descX = canvasWidth * 0.1;
    let descY = 110 * scaleRatio;
    let lineHeight = 24 * scaleRatio;
    
    // Draw description text with line wrapping
    let words = descriptionText.split(" ");
    let line = "";
    let y = descY;
    
    for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + " ";
        if (testLine.length * 10 * scaleRatio > canvasWidth * 0.8) {
            fill(220, 220, 220);
            text(line, descX, y);
            line = words[i] + " ";
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    fill(220, 220, 220);
    text(line, descX, y);
    
    // Customize profile section
    y += lineHeight * 2;
    fill(255);
    textAlign(CENTER, TOP);
    textSize(20 * scaleRatio);
    textStyle(BOLD);
    text("Customize Your Professional Profile", canvasWidth/2, y);
    
    // Name input field
    y += lineHeight * 1.5;
    drawInputField("Your Name:", inputName, canvasWidth/2, y, 300 * scaleRatio, 40 * scaleRatio, customizeNameMode);
    
    // Professional title selector
    y += lineHeight * 2;
    textAlign(CENTER, CENTER);
    textSize(16 * scaleRatio);
    textStyle(NORMAL);
    text("Select Your Professional Title:", canvasWidth/2, y);
    
    // Title selection buttons
    y += lineHeight;
    
    // Previous button
    fill(50, 100, 170);
    rect(canvasWidth/2 - 170 * scaleRatio, y, 40 * scaleRatio, 40 * scaleRatio, 5 * scaleRatio);
    fill(255);
    text("<", canvasWidth/2 - 170 * scaleRatio, y);
    
    // Title display
    fill(20, 40, 100);
    rect(canvasWidth/2, y, 270 * scaleRatio, 40 * scaleRatio, 5 * scaleRatio);
    fill(255);
    text(profileTitles[currentProfileIndex], canvasWidth/2, y);
    
    // Next button
    fill(50, 100, 170);
    rect(canvasWidth/2 + 170 * scaleRatio, y, 40 * scaleRatio, 40 * scaleRatio, 5 * scaleRatio);
    fill(255);
    text(">", canvasWidth/2 + 170 * scaleRatio, y);
    
    // Start game button
    y += lineHeight * 3;
    let buttonW = 200 * scaleRatio;
    let buttonH = 50 * scaleRatio;
    fill(30, 150, 70);
    rect(canvasWidth/2, y, buttonW, buttonH, 10 * scaleRatio);
    fill(255);
    textSize(20 * scaleRatio);
    text("START CHALLENGE", canvasWidth/2, y);
    
    // LinkedIn context
    y += lineHeight * 2;
    fill(10, 102, 194); // LinkedIn blue
    textSize(16 * scaleRatio);
    text("Share your results on LinkedIn to showcase your API expertise", canvasWidth/2, y);
    
    // Update cursor blink
    cursorTimer++;
    if (cursorTimer > 30) {
        cursorVisible = !cursorVisible;
        cursorTimer = 0;
    }
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
