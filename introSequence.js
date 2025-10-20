// Intro Sequence with rushing colorful bubbles
class IntroSequence {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.bubbles = [];
    this.isPlaying = false;
    this.animationId = null;
    this.onComplete = null;
  }

  init(onCompleteCallback) {
    this.onComplete = onCompleteCallback;
    this.loadingProgress = 0;
    this.targetProgress = 100;
    
    // Create fullscreen canvas for intro
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'introCanvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.zIndex = '9999'; // Above everything
    this.canvas.style.background = 'linear-gradient(135deg, #2d1b69, #11001c, #4a0e67, #1f002e)';
    document.body.appendChild(this.canvas);
    
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    
    // Create bubbles
    this.createBubbles();
    
    // Start animation
    this.isPlaying = true;
    this.startTime = Date.now();
    this.animate();
    
    // Auto-complete after 3 seconds
    setTimeout(() => {
      this.complete();
    }, 3000);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createBubbles() {
    const numBubbles = 150;
    const colors = [
      { h: 330, s: 100, l: 65 }, // Pink/Magenta
      { h: 280, s: 100, l: 65 }, // Purple
      { h: 200, s: 100, l: 65 }, // Cyan
      { h: 50, s: 100, l: 65 },  // Yellow
      { h: 20, s: 100, l: 65 },  // Orange
      { h: 150, s: 100, l: 65 }, // Green
      { h: 180, s: 100, l: 65 }, // Turquoise
    ];

    for (let i = 0; i < numBubbles; i++) {
      const delay = Math.random() * 1000; // Stagger appearance
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      this.bubbles.push({
        x: Math.random() * this.canvas.width,
        y: this.canvas.height + Math.random() * 200, // Start below screen
        size: Math.random() * 40 + 20,
        speedX: (Math.random() - 0.5) * 15, // Horizontal speed
        speedY: -(Math.random() * 15 + 10), // Upward speed
        color: color,
        alpha: Math.random() * 0.6 + 0.4,
        hueShift: Math.random() * 2 - 1,
        startTime: Date.now() + delay,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.05 + 0.02,
        scale: 0,
        targetScale: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
      });
    }
  }

  animate() {
    if (!this.isPlaying) return;

    const now = Date.now();
    
    // Clear canvas with slight trail effect
    this.ctx.fillStyle = 'rgba(17, 0, 28, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw bubbles
    for (let bubble of this.bubbles) {
      if (now < bubble.startTime) continue;

      // Animate scale in
      if (bubble.scale < bubble.targetScale) {
        bubble.scale += 0.05;
      }

      // Update position
      bubble.x += bubble.speedX;
      bubble.y += bubble.speedY;
      
      // Add wobble
      bubble.wobble += bubble.wobbleSpeed;
      bubble.x += Math.sin(bubble.wobble) * 2;
      
      // Update rotation
      bubble.rotation += bubble.rotationSpeed;
      
      // Update color hue shift
      bubble.color.h += bubble.hueShift;
      if (bubble.color.h > 360) bubble.color.h -= 360;
      if (bubble.color.h < 0) bubble.color.h += 360;

      // Fade out near top
      let fadeAlpha = bubble.alpha;
      if (bubble.y < 100) {
        fadeAlpha *= (bubble.y / 100);
      }

      // Draw bubble with glow
      this.ctx.save();
      this.ctx.translate(bubble.x, bubble.y);
      this.ctx.rotate(bubble.rotation);
      this.ctx.scale(bubble.scale, bubble.scale);

      // Outer glow
      const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, bubble.size * 1.5);
      gradient.addColorStop(0, `hsla(${bubble.color.h}, ${bubble.color.s}%, ${bubble.color.l}%, ${fadeAlpha})`);
      gradient.addColorStop(0.5, `hsla(${bubble.color.h}, ${bubble.color.s}%, ${bubble.color.l}%, ${fadeAlpha * 0.6})`);
      gradient.addColorStop(1, `hsla(${bubble.color.h}, ${bubble.color.s}%, ${bubble.color.l}%, 0)`);

      this.ctx.beginPath();
      this.ctx.arc(0, 0, bubble.size * 1.5, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      // Inner bubble
      const innerGradient = this.ctx.createRadialGradient(
        -bubble.size * 0.2, -bubble.size * 0.2, 0,
        0, 0, bubble.size
      );
      innerGradient.addColorStop(0, `hsla(${bubble.color.h}, ${bubble.color.s}%, ${bubble.color.l + 15}%, ${fadeAlpha * 0.9})`);
      innerGradient.addColorStop(0.7, `hsla(${bubble.color.h}, ${bubble.color.s}%, ${bubble.color.l}%, ${fadeAlpha * 0.7})`);
      innerGradient.addColorStop(1, `hsla(${bubble.color.h}, ${bubble.color.s}%, ${bubble.color.l - 10}%, ${fadeAlpha * 0.5})`);

      this.ctx.beginPath();
      this.ctx.arc(0, 0, bubble.size, 0, Math.PI * 2);
      this.ctx.fillStyle = innerGradient;
      this.ctx.fill();

      // Highlight
      this.ctx.beginPath();
      this.ctx.arc(-bubble.size * 0.3, -bubble.size * 0.3, bubble.size * 0.3, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(0, 0%, 100%, ${fadeAlpha * 0.4})`;
      this.ctx.fill();

      this.ctx.restore();

      // Recycle bubble if it goes off screen
      if (bubble.y < -100 || bubble.x < -100 || bubble.x > this.canvas.width + 100) {
        bubble.x = Math.random() * this.canvas.width;
        bubble.y = this.canvas.height + 100;
        bubble.scale = 0;
      }
    }

    // Update loading progress based on elapsed time
    const elapsed = Date.now() - this.startTime;
    const duration = 3000; // 3 seconds total
    this.loadingProgress = Math.min(100, (elapsed / duration) * 100);

    // Draw loading bar at the bottom
    this.drawLoadingBar();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  drawLoadingBar() {
    const barWidth = Math.min(600, this.canvas.width * 0.6);
    const barHeight = 8;
    const barX = (this.canvas.width - barWidth) / 2;
    const barY = this.canvas.height - 80;
    const cornerRadius = 4;

    // Draw background bar
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.beginPath();
    this.ctx.roundRect(barX, barY, barWidth, barHeight, cornerRadius);
    this.ctx.fill();

    // Draw border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(barX, barY, barWidth, barHeight, cornerRadius);
    this.ctx.stroke();

    // Draw progress with colorful gradient
    const progressWidth = (barWidth - 4) * (this.loadingProgress / 100);
    if (progressWidth > 0) {
      const gradient = this.ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
      gradient.addColorStop(0, '#ff00ff');    // Magenta
      gradient.addColorStop(0.2, '#ff0080'); // Hot Pink
      gradient.addColorStop(0.4, '#00ffff'); // Cyan
      gradient.addColorStop(0.6, '#00ff00'); // Green
      gradient.addColorStop(0.8, '#ffff00'); // Yellow
      gradient.addColorStop(1, '#ff8800');   // Orange

      // Add glow effect
      this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      this.ctx.shadowBlur = 15;
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.roundRect(barX + 2, barY + 2, progressWidth, barHeight - 4, cornerRadius - 1);
      this.ctx.fill();

      // Reset shadow
      this.ctx.shadowBlur = 0;
    }

    // Draw loading text
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.font = 'bold 16px Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const loadingText = 'Loading #HEXXED...';
    const percentText = `${Math.floor(this.loadingProgress)}%`;
    
    this.ctx.fillText(loadingText, this.canvas.width / 2, barY - 20);
    this.ctx.font = 'bold 14px monospace';
    this.ctx.fillText(percentText, this.canvas.width / 2, barY + barHeight + 20);
  }

  complete() {
    // Start title screen animation immediately (while bubbles still visible)
    if (this.onComplete) {
      this.onComplete();
    }
    
    // Continue animating bubbles while fading
    let opacity = 1;
    const fadeStartTime = Date.now();
    const fadeDuration = 1500; // 1.5 seconds fade
    
    const fadeLoop = () => {
      const elapsed = Date.now() - fadeStartTime;
      opacity = Math.max(0, 1 - (elapsed / fadeDuration));
      
      if (opacity > 0) {
        // Continue rendering bubbles while fading
        this.ctx.fillStyle = 'rgba(17, 0, 28, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let bubble of this.bubbles) {
          if (Date.now() < bubble.startTime) continue;

          if (bubble.scale < bubble.targetScale) {
            bubble.scale += 0.05;
          }

          bubble.x += bubble.speedX;
          bubble.y += bubble.speedY;
          bubble.wobble += bubble.wobbleSpeed;
          bubble.x += Math.sin(bubble.wobble) * 2;
          bubble.rotation += bubble.rotationSpeed;
          bubble.color.h += bubble.hueShift;
          if (bubble.color.h > 360) bubble.color.h -= 360;
          if (bubble.color.h < 0) bubble.color.h += 360;

          let fadeAlpha = bubble.alpha * opacity; // Apply fade to bubble alpha
          if (bubble.y < 100) {
            fadeAlpha *= (bubble.y / 100);
          }

          this.ctx.save();
          this.ctx.translate(bubble.x, bubble.y);
          this.ctx.rotate(bubble.rotation);
          this.ctx.scale(bubble.scale, bubble.scale);

          const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, bubble.size * 1.5);
          gradient.addColorStop(0, `hsla(${bubble.color.h}, ${bubble.color.s}%, ${bubble.color.l}%, ${fadeAlpha})`);
          gradient.addColorStop(0.5, `hsla(${bubble.color.h}, ${bubble.color.s}%, ${bubble.color.l}%, ${fadeAlpha * 0.6})`);
          gradient.addColorStop(1, `hsla(${bubble.color.h}, ${bubble.color.s}%, ${bubble.color.l}%, 0)`);

          this.ctx.beginPath();
          this.ctx.arc(0, 0, bubble.size * 1.5, 0, Math.PI * 2);
          this.ctx.fillStyle = gradient;
          this.ctx.fill();

          const innerGradient = this.ctx.createRadialGradient(
            -bubble.size * 0.2, -bubble.size * 0.2, 0,
            0, 0, bubble.size
          );
          innerGradient.addColorStop(0, `hsla(${bubble.color.h}, ${bubble.color.s}%, ${bubble.color.l + 15}%, ${fadeAlpha * 0.9})`);
          innerGradient.addColorStop(0.7, `hsla(${bubble.color.h}, ${bubble.color.s}%, ${bubble.color.l}%, ${fadeAlpha * 0.7})`);
          innerGradient.addColorStop(1, `hsla(${bubble.color.h}, ${bubble.color.s}%, ${bubble.color.l - 10}%, ${fadeAlpha * 0.5})`);

          this.ctx.beginPath();
          this.ctx.arc(0, 0, bubble.size, 0, Math.PI * 2);
          this.ctx.fillStyle = innerGradient;
          this.ctx.fill();

          this.ctx.beginPath();
          this.ctx.arc(-bubble.size * 0.3, -bubble.size * 0.3, bubble.size * 0.3, 0, Math.PI * 2);
          this.ctx.fillStyle = `hsla(0, 0%, 100%, ${fadeAlpha * 0.4})`;
          this.ctx.fill();

          this.ctx.restore();
        }

        this.canvas.style.opacity = opacity;
        requestAnimationFrame(fadeLoop);
      } else {
        // Fade complete, remove canvas
        this.isPlaying = false;
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
          this.canvas.parentNode.removeChild(this.canvas);
        }
      }
    };
    
    fadeLoop();
  }
}

// Export for use in main app
window.IntroSequence = IntroSequence;
