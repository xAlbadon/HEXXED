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
        
        this.loadSettings();
        // After loading settings, if a track is defined, play it.
        if (this.currentTrackPath && !this.backgroundMusic) {
            this.playBackgroundMusic(this.currentTrackPath);
        }
    }
    saveSettings() {
        localStorage.setItem('audioMuted', JSON.stringify(this.isMuted));
        localStorage.setItem('masterVolume', this.masterVolume);
        localStorage.setItem('musicVolume', this.musicVolume);
        localStorage.setItem('sfxVolume', this.sfxVolume);
        localStorage.setItem('achievementVolume', this.achievementVolume);
        if (this.currentTrackPath) {
            localStorage.setItem('audioTrack', this.currentTrackPath);
        }
        localStorage.setItem('achievementSoundsMuted', JSON.stringify(this.achievementSoundsMuted));
    }
    loadSettings() {
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
        const track = localStorage.getItem('audioTrack');
        if (track && track !== 'null') { // Ensure we don't load 'null' as a track
            // Extract just the track name if it's a full path (for backward compatibility)
            const trackName = track.includes('/') 
                ? track.split('/').pop().replace(/\.(mp3|wav)$/i, '') 
                : track.replace(/\.(mp3|wav)$/i, '');
            this.playBackgroundMusic(trackName);
        }
        const achievementSoundsMuted = localStorage.getItem('achievementSoundsMuted');
        if (achievementSoundsMuted !== null) {
            const value = JSON.parse(achievementSoundsMuted);
            // Ensure the value is explicitly boolean, defaults to false if parsing is ambiguous.
            this.achievementSoundsMuted = typeof value === 'boolean' ? value : false;
        }
    }
    updateMusicVolume() {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.isMuted ? 0 : this.masterVolume * this.musicVolume;
        }
    }
    playBackgroundMusic(trackPath, extension = 'mp3') {
        if (!trackPath) {
            console.warn("playBackgroundMusic called with no trackPath.");
            return;
        }
        
        // Extract just the track name (remove any path and extension)
        const trackName = trackPath.split('/').pop().replace(/\.(mp3|wav)$/i, '');
        const fullTrackName = `${trackName}.${extension}`;
        
        if (this.backgroundMusic && this.backgroundMusic.src.endsWith(fullTrackName)) {
            this.backgroundMusic.play().catch(e => console.error("Error resuming background music:", e));
            return;
        }
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
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
        
        this.backgroundMusic = new Audio(fullPath);
        this.backgroundMusic.loop = true;
        this.updateMusicVolume();
        const playPromise = this.backgroundMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error(`Error playing background music: ${fullPath}`, error);
                this.backgroundMusic = null; // Clear out the failed audio element
                this.currentTrackPath = null; // Also clear the track path to prevent retries
            });
        }
        this.saveSettings();
    }
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateMusicVolume();
        this.saveSettings();
    }
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume)); // Clamp
        this.updateMusicVolume();
        this.saveSettings();
    }
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume)); // Clamp
        this.updateMusicVolume();
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