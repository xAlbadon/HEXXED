import userSettingsManager from './userSettingsManager.js';

class AudioManager {
    constructor() {
        this.backgroundMusic = null;
        this.soundEffects = {};
        this.isMuted = false;
        this.masterVolume = 0.5;
        this.musicVolume = 1.0;
        this.sfxVolume = 1.0;
        this.achievementVolume = 1.0;
        this.currentTrackPath = null; // No default track
        this.achievementSoundsMuted = false;
        this.lastSelectSoundTime = 0;
        this.selectSoundDebounce = 50; // 50ms
        this.lastAchievementSoundTime = 0;
        this.achievementSoundDebounce = 300; // Increased to 300ms to prevent overlapping achievement sounds
        this.fadeOutDuration = 10; // Seconds before end to start fade out
        this.fadeCheckInterval = null;
        this.targetVolume = 1.0; // Track the target volume for smooth transitions
        this.userSettingsManager = userSettingsManager;
        this.isChangingTrack = false; // Prevent race conditions when switching tracks
        
        // Asset URL mappings for web environment
        this.assetUrls = {
            music: {
                'Mixin_Melody': 'https://play.rosebud.ai/assets/Mixin_Melody.mp3?p7h5',
                'Chromatic_Cascade': 'https://play.rosebud.ai/assets/Chromatic_Cascade.mp3?N1nJ'
            },
            sounds: {
                'select1': 'https://play.rosebud.ai/assets/select1.wav?GAQa',
                'select2': 'https://play.rosebud.ai/assets/select2.wav?k6Qb',
                'select3': 'https://play.rosebud.ai/assets/select3.wav?LY7D',
                'select4': 'https://play.rosebud.ai/assets/select4.wav?gGhL',
                'select5': 'https://play.rosebud.ai/assets/select5.wav?rDAR',
                'click1': 'https://play.rosebud.ai/assets/click1.wav?QuL4',
                'RemoveColor': 'https://play.rosebud.ai/assets/RemoveColor.wav?eQmp',
                'NewColor': 'https://play.rosebud.ai/assets/NewColor.wav?ybBa',
                'Achievement': 'https://play.rosebud.ai/assets/Achievement.wav?OIeT',
                'AddColor': 'https://play.rosebud.ai/assets/AddColor.wav?R7tO',
                'Loss': 'https://play.rosebud.ai/assets/Loss.wav?xuYA'
            }
        };
        
        // Detect if running in Electron environment
        this.isElectron = typeof window !== 'undefined' && window.electron !== undefined;
        
        // In Electron, we need to construct proper file paths
        if (this.isElectron) {
            // Get the app path - this will work both in dev and production
            this.electronBasePath = window.location.href.replace(/[^/]*$/, '');
        }
        
        // Load settings from localStorage as fallback (for backward compatibility)
        // These will be overridden when user logs in
        this.loadSettingsFromLocalStorage();
    }
    
    /**
     * Load settings for a specific user (called after login)
     */
    async loadUserSettings(userId) {
        if (!userId) {
            console.warn('[AudioManager] No userId provided for settings load');
            return;
        }
        
        // Wait for settings to load
        await this.userSettingsManager.loadUserSettings(userId);
        
        // Apply loaded settings
        const audioSettings = this.userSettingsManager.getSettings('audio');
        this.isMuted = audioSettings.isMuted || false;
        this.masterVolume = audioSettings.masterVolume || 0.5;
        this.musicVolume = audioSettings.musicVolume || 1.0;
        this.sfxVolume = audioSettings.sfxVolume || 1.0;
        this.achievementVolume = audioSettings.achievementVolume || 1.0;
        this.achievementSoundsMuted = audioSettings.achievementSoundsMuted || false;
        this.currentTrackPath = audioSettings.currentTrack || null;
        
        // Start playing the saved track if any
        if (this.currentTrackPath && !this.backgroundMusic) {
            await this.playBackgroundMusic(this.currentTrackPath);
        } else {
            this.updateMusicVolume();
        }
        
        console.log('[AudioManager] User settings loaded:', audioSettings);
    }
    
    /**
     * Reset to default settings (for new user or logout)
     */
    resetToDefaults() {
        this.isMuted = false;
        this.masterVolume = 0.5;
        this.musicVolume = 1.0;
        this.sfxVolume = 1.0;
        this.achievementVolume = 1.0;
        this.achievementSoundsMuted = false;
        this.currentTrackPath = null;
        
        if (this.backgroundMusic) {
            this.stopFadeMonitoring();
            this.backgroundMusic.pause();
            this.backgroundMusic.src = ''; // Clear source
            this.backgroundMusic = null;
        }
        
        this.isChangingTrack = false;
        
        console.log('[AudioManager] Reset to default settings');
    }
    /**
     * Save settings to user settings manager
     */
    async saveSettings() {
        if (this.userSettingsManager.isReady()) {
            await this.userSettingsManager.updateSettings('audio', {
                isMuted: this.isMuted,
                masterVolume: this.masterVolume,
                musicVolume: this.musicVolume,
                sfxVolume: this.sfxVolume,
                achievementVolume: this.achievementVolume,
                achievementSoundsMuted: this.achievementSoundsMuted,
                currentTrack: this.currentTrackPath
            });
        } else {
            // Fallback to localStorage if user settings not ready
            this.saveSettingsToLocalStorage();
        }
    }
    
    /**
     * Fallback: Load settings from localStorage (backward compatibility)
     */
    loadSettingsFromLocalStorage() {
        const muted = localStorage.getItem('audioMuted');
        if (muted !== null) {
            this.isMuted = JSON.parse(muted);
        }
        const masterVolume = localStorage.getItem('masterVolume');
        if (masterVolume !== null) {
            this.masterVolume = parseFloat(masterVolume);
        }
        const musicVolume = localStorage.getItem('musicVolume');
        if (musicVolume !== null) {
            this.musicVolume = parseFloat(musicVolume);
        }
        const sfxVolume = localStorage.getItem('sfxVolume');
        if (sfxVolume !== null) {
            this.sfxVolume = parseFloat(sfxVolume);
        }
        const achievementVolume = localStorage.getItem('achievementVolume');
        if (achievementVolume !== null) {
            this.achievementVolume = parseFloat(achievementVolume);
        }
        const achievementSoundsMuted = localStorage.getItem('achievementSoundsMuted');
        if (achievementSoundsMuted !== null) {
            const value = JSON.parse(achievementSoundsMuted);
            this.achievementSoundsMuted = typeof value === 'boolean' ? value : false;
        }
    }
    
    /**
     * Fallback: Save settings to localStorage
     */
    saveSettingsToLocalStorage() {
        localStorage.setItem('audioMuted', JSON.stringify(this.isMuted));
        localStorage.setItem('masterVolume', this.masterVolume);
        localStorage.setItem('musicVolume', this.musicVolume);
        localStorage.setItem('sfxVolume', this.sfxVolume);
        localStorage.setItem('achievementVolume', this.achievementVolume);
        localStorage.setItem('achievementSoundsMuted', JSON.stringify(this.achievementSoundsMuted));
        if (this.currentTrackPath) {
            localStorage.setItem('audioTrack', this.currentTrackPath);
        }
    }
    updateMusicVolume(volumeMultiplier = 1.0) {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.isMuted ? 0 : this.masterVolume * this.musicVolume * volumeMultiplier;
        }
    }
    
    startFadeMonitoring() {
        // Clear any existing interval
        if (this.fadeCheckInterval) {
            clearInterval(this.fadeCheckInterval);
        }
        
        // Check every 100ms for fade timing
        this.fadeCheckInterval = setInterval(() => {
            if (!this.backgroundMusic || this.backgroundMusic.paused) {
                return;
            }
            
            const currentTime = this.backgroundMusic.currentTime;
            const duration = this.backgroundMusic.duration;
            
            if (!duration || isNaN(duration)) {
                return;
            }
            
            const timeRemaining = duration - currentTime;
            
            // Start fade out in the last 10 seconds
            if (timeRemaining <= this.fadeOutDuration && timeRemaining > 0) {
                // Calculate fade multiplier (1.0 to 0.0 over fadeOutDuration seconds)
                const fadeMultiplier = timeRemaining / this.fadeOutDuration;
                this.targetVolume = fadeMultiplier;
                this.updateMusicVolume(fadeMultiplier);
            } else if (currentTime < 0.5) {
                // Fade in at the start (first 0.5 seconds)
                const fadeInMultiplier = Math.min(1.0, currentTime / 0.5);
                this.targetVolume = fadeInMultiplier;
                this.updateMusicVolume(fadeInMultiplier);
            } else if (this.targetVolume !== 1.0) {
                // Reset to full volume in the middle section
                this.targetVolume = 1.0;
                this.updateMusicVolume(1.0);
            }
        }, 100);
    }
    
    stopFadeMonitoring() {
        if (this.fadeCheckInterval) {
            clearInterval(this.fadeCheckInterval);
            this.fadeCheckInterval = null;
        }
    }
    async playBackgroundMusic(trackPath, extension = 'mp3') {
        if (!trackPath) {
            console.warn("playBackgroundMusic called with no trackPath.");
            return;
        }
        
        // Prevent concurrent track changes
        if (this.isChangingTrack) {
            console.log('[AudioManager] Track change already in progress, ignoring request');
            return;
        }
        
        this.isChangingTrack = true;
        
        try {
            // Extract just the track name (remove any path and extension)
            const trackName = trackPath.split('/').pop().replace(/\.(mp3|wav)$/i, '');
            const fullTrackName = `${trackName}.${extension}`;
            
            // If same track is already playing, just resume it
            if (this.backgroundMusic && this.backgroundMusic.src.endsWith(fullTrackName)) {
                if (this.backgroundMusic.paused) {
                    try {
                        await this.backgroundMusic.play();
                    } catch (e) {
                        console.error("Error resuming background music:", e);
                    }
                }
                this.isChangingTrack = false;
                return;
            }
            
            // Stop and clean up previous music
            if (this.backgroundMusic) {
                this.stopFadeMonitoring();
                this.backgroundMusic.pause();
                this.backgroundMusic.src = ''; // Clear source to release resources
                this.backgroundMusic = null;
                
                // Small delay to ensure cleanup completes
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Store just the track name for consistency
            this.currentTrackPath = trackName;
            
            // Determine the audio path based on environment
            let fullPath;
            if (this.isElectron) {
                // Use proper file URL for Electron (works in both dev and packaged app)
                fullPath = `${this.electronBasePath}assets/music/${fullTrackName}`;
            } else {
                // Use asset URL for web environment
                fullPath = this.assetUrls.music[trackName] || `./assets/music/${fullTrackName}`;
            }
            
            // Create new audio element
            this.backgroundMusic = new Audio(fullPath);
            this.backgroundMusic.loop = true;
            this.targetVolume = 1.0;
            this.updateMusicVolume();
            
            // Start monitoring for fade effects
            this.startFadeMonitoring();
            
            // Play with proper error handling
            try {
                await this.backgroundMusic.play();
                console.log(`[AudioManager] Now playing: ${trackName}`);
            } catch (error) {
                console.error(`Error playing background music: ${fullPath}`, error);
                this.backgroundMusic = null;
                this.currentTrackPath = null;
                this.stopFadeMonitoring();
            }
            
            await this.saveSettings();
            
        } finally {
            this.isChangingTrack = false;
        }
    }
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateMusicVolume(this.targetVolume);
        this.saveSettings();
    }
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume)); // Clamp
        this.updateMusicVolume(this.targetVolume);
        this.saveSettings();
    }
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume)); // Clamp
        this.updateMusicVolume(this.targetVolume);
        this.saveSettings();
    }
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume)); // Clamp
        this.saveSettings();
    }
    setAchievementVolume(volume) {
        this.achievementVolume = Math.max(0, Math.min(1, volume)); // Clamp
        this.saveSettings();
    }
    getAchievementVolume() {
        return this.achievementVolume;
    }
    getMasterVolume() {
        return this.masterVolume;
    }
    getMusicVolume() {
        return this.musicVolume;
    }
    getSfxVolume() {
        return this.sfxVolume;
    }
    getCurrentTrack() {
        return this.currentTrackPath;
    }
    
    playSound(soundName, options = {}) {
        if (this.isMuted) return;
        const { extension = 'wav', category = 'sfx' } = options;
        const baseSoundName = soundName.split('/').pop().replace(`.${extension}`, '');
        let volume;
        if (category === 'achievement') {
            if (this.achievementSoundsMuted) return;
            const now = performance.now();
            if (now - this.lastAchievementSoundTime < this.achievementSoundDebounce) {
                console.log(`[AudioManager] Debouncing achievement sound: ${baseSoundName} (${Math.round(now - this.lastAchievementSoundTime)}ms since last)`);
                return; // Debounce to prevent audio overlap
            }
            this.lastAchievementSoundTime = now;
            // Reduce achievement volume by 40% to make it less harsh
            volume = this.masterVolume * this.achievementVolume * 0.6;
        } else { // Default to 'sfx'
            volume = this.masterVolume * this.sfxVolume;
        }
        
        // Determine the audio path based on environment
        let soundPath;
        if (this.isElectron) {
            // Use proper file URL for Electron (works in both dev and packaged app)
            soundPath = `${this.electronBasePath}assets/sounds/${baseSoundName}.${extension}`;
        } else {
            // Use asset URL for web environment
            soundPath = this.assetUrls.sounds[baseSoundName] || `./assets/sounds/${baseSoundName}.${extension}`;
        }
        
        const sound = new Audio(soundPath);
        sound.volume = volume;
        sound.play().catch(e => console.error(`Error playing sound ${baseSoundName}:`, e));
    }
    playRandomSelectSound() {
        const now = performance.now();
        if (now - this.lastSelectSoundTime < this.selectSoundDebounce) {
            return; // Debounce
        }
        this.lastSelectSoundTime = now;
        const soundIndex = Math.floor(Math.random() * 5) + 1; // 1 to 5 (we have select1-5)
        const soundName = `select${soundIndex}`;
        this.playSound(soundName, { extension: 'wav', category: 'sfx' });
        // Return the name of the sound played so it can be reused
        return soundName;
    }
    toggleAchievementSounds() {
        this.achievementSoundsMuted = !this.achievementSoundsMuted;
        this.saveSettings();
    }
    
    areAchievementSoundsMuted() {
        return this.achievementSoundsMuted;
    }
}
// Export a singleton instance
const audioManager = new AudioManager();
export default audioManager;