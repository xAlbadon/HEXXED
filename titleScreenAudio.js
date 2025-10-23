/**
 * TitleScreenAudio handles audio for the title/login screen
 * This is separate from the main audioManager since it needs to work before login
 */
export class TitleScreenAudio {
  constructor() {
    this.ambientMusic = null;
    this.isPlaying = false;
    this.volume = 0.3; // Lower volume for ambient music
    this.hoverSoundVolume = 0.2; // Subtle hover sounds
    this.lastHoverTime = 0;
    this.hoverDebounce = 100; // Prevent rapid-fire hover sounds
    
    // Asset URLs for sounds
    this.soundUrls = {
      hover1: 'https://play.rosebud.ai/assets/select1.wav?GAQa',
      hover2: 'https://play.rosebud.ai/assets/select2.wav?k6Qb',
      hover3: 'https://play.rosebud.ai/assets/select3.wav?LY7D',
      click: 'https://play.rosebud.ai/assets/click1.wav?QuL4',
      ambientMusic: 'https://play.rosebud.ai/assets/Chromatic_Cascade.mp3?N1nJ'
    };
    
    // Pre-load hover sounds for instant playback
    this.hoverSounds = [];
    this.preloadHoverSounds();
  }
  
  /**
   * Pre-load hover sounds for instant playback
   */
  preloadHoverSounds() {
    [this.soundUrls.hover1, this.soundUrls.hover2, this.soundUrls.hover3].forEach(url => {
      const audio = new Audio(url);
      audio.volume = this.hoverSoundVolume;
      audio.load();
      this.hoverSounds.push(audio);
    });
  }
  
  /**
   * Start playing ambient music
   */
  startAmbientMusic() {
    if (this.isPlaying || this.ambientMusic) {
      return;
    }
    
    try {
      this.ambientMusic = new Audio(this.soundUrls.ambientMusic);
      this.ambientMusic.loop = true;
      this.ambientMusic.volume = this.volume;
      
      // Fade in effect
      this.ambientMusic.volume = 0;
      const fadeIn = setInterval(() => {
        if (this.ambientMusic && this.ambientMusic.volume < this.volume) {
          this.ambientMusic.volume = Math.min(this.volume, this.ambientMusic.volume + 0.05);
        } else {
          clearInterval(fadeIn);
        }
      }, 100);
      
      const playPromise = this.ambientMusic.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true;
          console.log('[TitleScreenAudio] Ambient music started');
        }).catch(error => {
          console.log('[TitleScreenAudio] Autoplay prevented, will start on user interaction');
          // Remove the failed audio element
          this.ambientMusic = null;
        });
      }
    } catch (error) {
      console.error('[TitleScreenAudio] Error starting ambient music:', error);
    }
  }
  
  /**
   * Try to start music on user interaction (if autoplay was blocked)
   */
  tryStartOnInteraction() {
    if (!this.isPlaying && !this.ambientMusic) {
      this.startAmbientMusic();
    }
  }
  
  /**
   * Stop ambient music with fade out
   */
  stopAmbientMusic() {
    if (!this.ambientMusic) return;
    
    // Fade out effect
    const fadeOut = setInterval(() => {
      if (this.ambientMusic && this.ambientMusic.volume > 0.05) {
        this.ambientMusic.volume = Math.max(0, this.ambientMusic.volume - 0.05);
      } else {
        clearInterval(fadeOut);
        if (this.ambientMusic) {
          this.ambientMusic.pause();
          this.ambientMusic.src = '';
          this.ambientMusic = null;
        }
        this.isPlaying = false;
        console.log('[TitleScreenAudio] Ambient music stopped');
      }
    }, 50);
  }
  
  /**
   * Play a random hover sound
   */
  playHoverSound() {
    const now = performance.now();
    if (now - this.lastHoverTime < this.hoverDebounce) {
      return; // Debounce
    }
    this.lastHoverTime = now;
    
    try {
      // Pick a random hover sound
      const sound = this.hoverSounds[Math.floor(Math.random() * this.hoverSounds.length)];
      
      // Clone the audio to allow overlapping sounds
      const soundClone = sound.cloneNode();
      soundClone.volume = this.hoverSoundVolume;
      soundClone.play().catch(e => {
        // Silently fail if sound can't play
      });
    } catch (error) {
      // Silently fail - hover sounds are non-critical
    }
  }
  
  /**
   * Play click sound
   */
  playClickSound() {
    try {
      const clickSound = new Audio(this.soundUrls.click);
      clickSound.volume = this.hoverSoundVolume * 1.5; // Slightly louder than hover
      clickSound.play().catch(e => {
        // Silently fail if sound can't play
      });
    } catch (error) {
      // Silently fail - click sounds are non-critical
    }
  }
  
  /**
   * Attach hover sounds to elements
   */
  attachHoverSounds(elements) {
    elements.forEach(element => {
      if (element) {
        element.addEventListener('mouseenter', () => this.playHoverSound());
        element.addEventListener('focus', () => this.playHoverSound());
      }
    });
  }
  
  /**
   * Attach click sounds to elements
   */
  attachClickSounds(elements) {
    elements.forEach(element => {
      if (element) {
        element.addEventListener('click', () => this.playClickSound());
      }
    });
  }
  
  /**
   * Clean up - called when transitioning away from title screen
   */
  cleanup() {
    this.stopAmbientMusic();
    this.hoverSounds = [];
  }
}

// Export singleton instance
const titleScreenAudio = new TitleScreenAudio();
export default titleScreenAudio;
