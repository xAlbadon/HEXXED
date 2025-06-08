const canvas = document.getElementById('titleParticlesCanvas');
const ctx = canvas.getContext('2d');
let particlesArray;
const titleScreenElement = document.getElementById('titleScreen');
const mouse = {
    x: null,
    y: null,
    radius: 120, // Increased interaction radius
    isOverUI: false
};
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
// Set canvas dimensions
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

// Particle class
class Particle {
    constructor(x, y, directionX, directionY, size, hue, alpha) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.hue = hue; // Store hue directly
        this.alpha = alpha; // Store alpha directly
        this.color = `hsla(${this.hue}, 70%, 80%, ${this.alpha})`;
        this.hueShiftSpeed = (Math.random() * 0.2) - 0.1; // Slow hue shift speed (-0.1 to 0.1)
        this.baseSpeedX = directionX; // Particle's natural drift speed
        this.baseSpeedY = directionY;
        this.currentSpeedX = directionX; // Current speed, affected by mouse and damping
        this.currentSpeedY = directionY;
        this.dampingFactor = 0.05; // Adjust for desired smoothness
    }
    // Method to draw individual particle
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
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
        // Mouse interaction, speed update, and glow effect
        let currentAlpha = this.alpha; // Base alpha for the particle
        let appliedForceX = 0;
        let appliedForceY = 0;
        if (!mouse.isOverUI && mouse.x !== null && mouse.y !== null) {
            const dxMouse = this.x - mouse.x;
            const dyMouse = this.y - mouse.y;
            const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
            const pushStrength = 1.2; 
            if (distanceMouse < mouse.radius) {
                const forceMagnitude = (mouse.radius - distanceMouse) / mouse.radius;
                appliedForceX = (dxMouse / distanceMouse) * forceMagnitude * pushStrength;
                appliedForceY = (dyMouse / distanceMouse) * forceMagnitude * pushStrength;
                currentAlpha = Math.min(this.alpha + 0.4, 0.9); // Boost alpha for glow
            }
        }
        // Apply push from mouse to current speed
        this.currentSpeedX += appliedForceX;
        this.currentSpeedY += appliedForceY;
        // Damping: gradually return to base speed
        this.currentSpeedX += (this.baseSpeedX - this.currentSpeedX) * this.dampingFactor;
        this.currentSpeedY += (this.baseSpeedY - this.currentSpeedY) * this.dampingFactor;
        
        // Update hue for color shifting
        this.hue += this.hueShiftSpeed;
        if (this.hue > 360) this.hue -= 360;
        if (this.hue < 0) this.hue += 360;
        this.color = `hsla(${this.hue}, 70%, 80%, ${currentAlpha})`; // Use currentAlpha for rendering
        // Update position using current speed
        this.x += this.currentSpeedX;
        this.y += this.currentSpeedY;
        this.draw();
    }
}

// Create particle array
function init() {
    particlesArray = [];
    const numberOfParticles = 75; // Keep it subtle
    for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2.5 + 0.5; // Particle size 0.5px to 3px
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const directionX = (Math.random() * 0.4) - 0.2; // Slow horizontal speed (-0.2 to 0.2)
        const directionY = (Math.random() * 0.4) - 0.2; // Slow vertical speed (-0.2 to 0.2)
        
        // Subtle colors: shades of white, light lavender, light cyan with varying opacity
        const alpha = Math.random() * 0.4 + 0.1; // Opacity 0.1 to 0.5
        const initialHue = Math.random() * 60 + 200; // Hues around blue/purple: 200 (light blue) to 260 (lavender)
        
        particlesArray.push(new Particle(x, y, directionX, directionY, size, initialHue, alpha));
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