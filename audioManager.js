class AudioManager {
    constructor() {
        this.backgroundMusic = null;
        this.soundEffects = {};
        this.isMuted = false;
        this.masterVolume = 0.5;
        this.musicVolume = 1.0;
        this.sfxVolume = 1.0;
        this.currentTrackPath = null;
        this.loadSettings();
    }
    saveSettings() {
        localStorage.setItem('audioMuted', JSON.stringify(this.isMuted));
        localStorage.setItem('masterVolume', this.masterVolume);
        localStorage.setItem('musicVolume', this.musicVolume);
        localStorage.setItem('sfxVolume', this.sfxVolume);
        if (this.currentTrackPath) {
            localStorage.setItem('audioTrack', this.currentTrackPath);
        }
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
        const track = localStorage.getItem('audioTrack');
        if (track) {
            this.currentTrackPath = track;
        }
    }
    updateMusicVolume() {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.isMuted ? 0 : this.masterVolume * this.musicVolume;
        }
    }
    playBackgroundMusic(trackPath) {
        if (this.backgroundMusic && this.backgroundMusic.src.endsWith(trackPath)) {
            this.backgroundMusic.play().catch(e => console.error("Error resuming background music:", e));
            return;
        }
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
        this.currentTrackPath = trackPath;
        this.backgroundMusic = new Audio(trackPath);
        this.backgroundMusic.loop = true;
        this.updateMusicVolume();
        this.backgroundMusic.play().catch(e => console.error("Error playing background music:", e));
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
    
    playSound(soundName, extension = 'wav') {
        if (this.isMuted) return;
        const sound = new Audio(`./assets/sounds/${soundName}.${extension}`);
        sound.volume = this.masterVolume * this.sfxVolume;
        sound.play().catch(e => console.error(`Error playing sound ${soundName}:`, e));
    }
    playRandomSelectSound() {
        const soundIndex = Math.floor(Math.random() * 6) + 1; // 1 to 6
        const soundName = `select${soundIndex}`;
        this.playSound(soundName, 'wav');
    }
}

// Export a singleton instance
const audioManager = new AudioManager();
export default audioManager;