const canvas = document.getElementById('titleParticlesCanvas');
const ctx = canvas.getContext('2d');
let particlesArray;
const titleScreenElement = document.getElementById('titleScreen');
const mouse = {
    x: null,
    y: null,
    radius: 120, // Increased interaction radius
    isOverUI: false,
    isHolding: false, // Track if mouse button is held down
    holdStartTime: null, // Track when hold started
    holdDuration: 0 // How long the button has been held
};

const HOLD_THRESHOLD = 600; // Milliseconds before particles start attracting

// Particle color themes
const COLOR_THEMES = {
    aurora: { name: 'Aurora', hueStart: 200, hueRange: 60, saturation: 70, lightness: 80 }, // Blue/Purple
    sunset: { name: 'Sunset', hueStart: 0, hueRange: 60, saturation: 80, lightness: 75 }, // Red/Orange
    forest: { name: 'Forest', hueStart: 90, hueRange: 60, saturation: 65, lightness: 70 }, // Green/Cyan
    twilight: { name: 'Twilight', hueStart: 260, hueRange: 60, saturation: 75, lightness: 75 }, // Purple/Pink
    golden: { name: 'Golden Hour', hueStart: 30, hueRange: 40, saturation: 85, lightness: 70 }, // Yellow/Orange
    ocean: { name: 'Ocean Depths', hueStart: 180, hueRange: 50, saturation: 70, lightness: 65 }, // Cyan/Blue
    rainbow: { name: 'Rainbow', hueStart: 0, hueRange: 360, saturation: 75, lightness: 75 }, // Full spectrum
    monochrome: { name: 'Monochrome', hueStart: 0, hueRange: 0, saturation: 0, lightness: 80 } // White/Gray
};

// Settings - can be changed via localStorage
// Use window.particleSettings directly to avoid reference issues
window.particleSettings = {
    colorTheme: 'aurora',
    autoThemeChange: true,
    themeChangeInterval: 30000, // 30 seconds
    particleCount: 75,
    colorShift: false // New setting to control subtle color shifting
};

// Load settings from localStorage
function loadParticleSettings() {
    const saved = localStorage.getItem('hexxedParticleSettings');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            Object.assign(window.particleSettings, loaded);
        } catch (e) {
            console.error('Failed to load particle settings:', e);
        }
    }
}

// Save settings to localStorage
function saveParticleSettings() {
    localStorage.setItem('hexxedParticleSettings', JSON.stringify(window.particleSettings));
}

// Global reference for theme management
window.saveParticleSettings = saveParticleSettings;
window.COLOR_THEMES = COLOR_THEMES;

loadParticleSettings();

// Auto theme change timer
let themeChangeTimer = null;
let currentThemeIndex = Object.keys(COLOR_THEMES).indexOf(window.particleSettings.colorTheme);

function startAutoThemeChange() {
    if (themeChangeTimer) clearInterval(themeChangeTimer);
    
    if (window.particleSettings.autoThemeChange) {
        themeChangeTimer = setInterval(() => {
            const themeKeys = Object.keys(COLOR_THEMES);
            currentThemeIndex = (currentThemeIndex + 1) % themeKeys.length;
            window.particleSettings.colorTheme = themeKeys[currentThemeIndex];
            reinitParticlesWithNewTheme();
            saveParticleSettings();
        }, window.particleSettings.themeChangeInterval);
    }
}

// Restart auto-change when settings change
window.restartAutoThemeChange = function() {
    stopAutoThemeChange();
    startAutoThemeChange();
};

function stopAutoThemeChange() {
    if (themeChangeTimer) {
        clearInterval(themeChangeTimer);
        themeChangeTimer = null;
    }
}

// Reinitialize particles with new theme
function reinitParticlesWithNewTheme() {
    if (particlesArray) {
        const theme = COLOR_THEMES[window.particleSettings.colorTheme];
        particlesArray.forEach(particle => {
            particle.baseHue = theme.hueStart + Math.random() * theme.hueRange;
            particle.hue = particle.baseHue;
            particle.baseSaturation = theme.saturation;
            particle.baseLightness = theme.lightness;
            particle.minHue = theme.hueStart;
            particle.maxHue = theme.hueStart + theme.hueRange;
        });
    }
}

// Expose globally for style manager
window.reinitParticlesWithNewTheme = reinitParticlesWithNewTheme;

// Function to fully reinit particles with new count
window.reinitParticles = function() {
    init();
};

startAutoThemeChange();

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    if (titleScreenElement) {
        const titleRect = titleScreenElement.getBoundingClientRect();
        mouse.isOverUI = (
            mouse.x >= titleRect.left && mouse.x <= titleRect.right &&
            mouse.y >= titleRect.top && mouse.y <= titleRect.bottom
        );
    } else {
        mouse.isOverUI = false; // Fallback if titleScreen is not found
    }
});

// Track mouse button hold
window.addEventListener('mousedown', () => {
    mouse.isHolding = true;
    mouse.holdStartTime = Date.now();
});

window.addEventListener('mouseup', () => {
    mouse.isHolding = false;
    mouse.holdStartTime = null;
    mouse.holdDuration = 0;
});

// Track touch events for mobile
window.addEventListener('touchstart', (event) => {
    if (event.touches.length > 0) {
        mouse.x = event.touches[0].clientX;
        mouse.y = event.touches[0].clientY;
        mouse.isHolding = true;
        mouse.holdStartTime = Date.now();
    }
});

window.addEventListener('touchmove', (event) => {
    if (event.touches.length > 0) {
        mouse.x = event.touches[0].clientX;
        mouse.y = event.touches[0].clientY;
    }
});

window.addEventListener('touchend', () => {
    mouse.isHolding = false;
    mouse.holdStartTime = null;
    mouse.holdDuration = 0;
});
// Set canvas dimensions
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

// Particle class
class Particle {
    constructor(x, y, directionX, directionY, size, hue, alpha, saturation, lightness, minHue, maxHue) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.baseHue = hue; // Base hue from theme
        this.hue = hue; // Current hue
        this.minHue = minHue; // Minimum hue boundary for this theme
        this.maxHue = maxHue; // Maximum hue boundary for this theme
        this.baseSaturation = saturation; // Base saturation from theme
        this.baseLightness = lightness; // Base lightness from theme
        this.alpha = alpha; // Store alpha directly
        this.color = `hsla(${this.hue}, ${this.baseSaturation}%, ${this.baseLightness}%, ${this.alpha})`;
        this.hueShiftSpeed = (Math.random() * 0.2) - 0.1; // Slow hue shift speed (-0.1 to 0.1)
        this.baseSpeedX = directionX; // Particle's natural drift speed
        this.baseSpeedY = directionY;
        this.currentSpeedX = directionX; // Current speed, affected by mouse and damping
        this.currentSpeedY = directionY;
        this.dampingFactor = 0.08; // Increased for slower, more gradual speed changes
        this.swirlAngle = Math.random() * Math.PI * 2; // Random starting angle for swirl
        this.swirlSpeed = (Math.random() * 0.05 + 0.03) * (Math.random() > 0.5 ? 1 : -1); // Swirl rotation speed
    }
    // Method to draw individual particle
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    
    // Enhanced draw method with glow effect
    drawWithGlow(size, alpha) {
        // Draw glow layers for more intense effect when holding
        if (mouse.isHolding && alpha > 0.5) {
            // Outer glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, size * 2, 0, Math.PI * 2, false);
            const outerGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, size * 2);
            outerGradient.addColorStop(0, `hsla(${this.hue}, 90%, 85%, ${alpha * 0.3})`);
            outerGradient.addColorStop(1, `hsla(${this.hue}, 90%, 85%, 0)`);
            ctx.fillStyle = outerGradient;
            ctx.fill();
            
            // Middle glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, size * 1.3, 0, Math.PI * 2, false);
            const middleGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, size * 1.3);
            middleGradient.addColorStop(0, `hsla(${this.hue}, 90%, 85%, ${alpha * 0.5})`);
            middleGradient.addColorStop(1, `hsla(${this.hue}, 90%, 85%, 0)`);
            ctx.fillStyle = middleGradient;
            ctx.fill();
        }
        
        // Main particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    // Check particle position, update color, move the particle, draw the particle
    update() {
        // Check if particle is still within canvas
        if (this.x > canvas.width || this.x < 0) {
            this.x = (this.x < 0) ? canvas.width : 0; // Reappear on opposite side
        }
        if (this.y > canvas.height || this.y < 0) {
            this.y = (this.y < 0) ? canvas.height : 0; // Reappear on opposite side
        }
        
        // Update hold duration if holding
        if (mouse.isHolding && mouse.holdStartTime) {
            mouse.holdDuration = Date.now() - mouse.holdStartTime;
        }
        
        // Mouse interaction, speed update, and glow effect
        let currentAlpha = this.alpha; // Base alpha for the particle
        let appliedForceX = 0;
        let appliedForceY = 0;
        let glowSize = this.size; // Default size
        
        if (!mouse.isOverUI && mouse.x !== null && mouse.y !== null) {
            const dxMouse = this.x - mouse.x;
            const dyMouse = this.y - mouse.y;
            const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
            
            // Check if hold duration exceeds threshold
            const shouldAttract = mouse.isHolding && mouse.holdDuration >= HOLD_THRESHOLD;
            
            if (shouldAttract) {
                // HOLD MODE: Attract particles and make them swirl (only after threshold)
                const attractRadius = mouse.radius * 2.5; // Larger radius for attraction
                
                if (distanceMouse < attractRadius) {
                    // Update swirl angle
                    this.swirlAngle += this.swirlSpeed;
                    
                    // Calculate swirl orbit radius (particles orbit at different distances)
                    const orbitRadius = Math.max(30, distanceMouse * 0.4);
                    
                    // Target position: circular orbit around mouse
                    const targetX = mouse.x + Math.cos(this.swirlAngle) * orbitRadius;
                    const targetY = mouse.y + Math.sin(this.swirlAngle) * orbitRadius;
                    
                    // Pull toward target orbit position - VERY gentle and distance-dependent
                    const dxTarget = targetX - this.x;
                    const dyTarget = targetY - this.y;
                    const distanceToTarget = Math.sqrt(dxTarget * dxTarget + dyTarget * dyTarget);
                    
                    // Much gentler base attraction that increases as particle gets closer
                    // Far away = very slow drift, close = faster (but still gentle)
                    const baseAttractStrength = 0.008; // Very low base strength
                    const distanceMultiplier = Math.min(distanceToTarget / attractRadius, 1.0);
                    const attractStrength = baseAttractStrength * (1 + distanceMultiplier * 0.5);
                    
                    appliedForceX = dxTarget * attractStrength;
                    appliedForceY = dyTarget * attractStrength;
                    
                    // Enhanced glow effect when holding
                    const glowIntensity = 1 - (distanceMouse / attractRadius);
                    currentAlpha = Math.min(this.alpha + 0.7 * glowIntensity, 1.0);
                    glowSize = this.size * (1 + 1.5 * glowIntensity); // Particles grow when closer
                    
                    // Faster color shifting in hold mode - only if colorShift is enabled
                    if (window.particleSettings.colorShift) {
                        this.hue += this.hueShiftSpeed * 5;
                        
                        // Keep within theme boundaries
                        if (this.maxHue - this.minHue > 0) {
                            if (this.hue > this.maxHue) {
                                this.hue = this.minHue + (this.hue - this.maxHue);
                            }
                            if (this.hue < this.minHue) {
                                this.hue = this.maxHue - (this.minHue - this.hue);
                            }
                        }
                        
                        if (this.hue > 360) this.hue -= 360;
                        if (this.hue < 0) this.hue += 360;
                    }
                }
            } else {
                // NORMAL MODE: Push particles away (or when hold hasn't reached threshold yet)
                const pushStrength = 1.2; 
                if (distanceMouse < mouse.radius) {
                    const forceMagnitude = (mouse.radius - distanceMouse) / mouse.radius;
                    appliedForceX = (dxMouse / distanceMouse) * forceMagnitude * pushStrength;
                    appliedForceY = (dyMouse / distanceMouse) * forceMagnitude * pushStrength;
                    currentAlpha = Math.min(this.alpha + 0.4, 0.9); // Boost alpha for glow
                }
            }
        }
        
        // Apply forces to current speed
        this.currentSpeedX += appliedForceX;
        this.currentSpeedY += appliedForceY;
        
        // Damping: gradually return to base speed
        this.currentSpeedX += (this.baseSpeedX - this.currentSpeedX) * this.dampingFactor;
        this.currentSpeedY += (this.baseSpeedY - this.currentSpeedY) * this.dampingFactor;
        
        // Update hue for color shifting - only if colorShift is enabled
        if (window.particleSettings.colorShift) {
            this.hue += this.hueShiftSpeed;
            
            // Keep hue within theme boundaries
            if (this.maxHue - this.minHue > 0) {
                // Wrap within theme range
                if (this.hue > this.maxHue) {
                    this.hue = this.minHue + (this.hue - this.maxHue);
                }
                if (this.hue < this.minHue) {
                    this.hue = this.maxHue - (this.minHue - this.hue);
                }
            }
            
            // Handle full 360 wrap
            if (this.hue > 360) this.hue -= 360;
            if (this.hue < 0) this.hue += 360;
        } else {
            // No color shift - stay at base hue
            this.hue = this.baseHue;
        }
        
        // Enhanced color saturation and lightness when glowing
        const saturation = mouse.isHolding && currentAlpha > 0.5 ? Math.min(this.baseSaturation + 20, 100) : this.baseSaturation;
        const lightness = mouse.isHolding && currentAlpha > 0.5 ? Math.min(this.baseLightness + 10, 95) : this.baseLightness;
        this.color = `hsla(${this.hue}, ${saturation}%, ${lightness}%, ${currentAlpha})`;
        
        // Update position using current speed
        this.x += this.currentSpeedX;
        this.y += this.currentSpeedY;
        
        // Draw with glow effect
        this.drawWithGlow(glowSize, currentAlpha);
    }
}

// Create particle array
function init() {
    particlesArray = [];
    const numberOfParticles = window.particleSettings.particleCount;
    const theme = COLOR_THEMES[window.particleSettings.colorTheme];
    
    for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2.5 + 0.5; // Particle size 0.5px to 3px
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const directionX = (Math.random() * 0.4) - 0.2; // Slow horizontal speed (-0.2 to 0.2)
        const directionY = (Math.random() * 0.4) - 0.2; // Slow vertical speed (-0.2 to 0.2)
        
        const alpha = Math.random() * 0.4 + 0.1; // Opacity 0.1 to 0.5
        const initialHue = theme.hueStart + Math.random() * theme.hueRange;
        const minHue = theme.hueStart;
        const maxHue = theme.hueStart + theme.hueRange;
        
        particlesArray.push(new Particle(x, y, directionX, directionY, size, initialHue, alpha, theme.saturation, theme.lightness, minHue, maxHue));
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
}

init();
animate();

// Resize event
window.addEventListener('resize', () => {
    resizeCanvas();
    init(); // Re-initialize particles on resize to fit new dimensions
});