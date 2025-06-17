class AudioManager {
    constructor() {
        this.backgroundMusic = null;
        this.soundEffects = {};
        this.isMuted = false;
        this.masterVolume = 0.5;
        this.musicVolume = 1.0;
        this.sfxVolume = 1.0;
        this.achievementVolume = 1.0;
        this.currentTrackPath = './assets/music/Mixin_Melody.mp3';
        this.achievementSoundsMuted = false;
        this.loadSettings();
        if (!this.backgroundMusic) {
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
        if (track) {
            this.currentTrackPath = track;
            this.playBackgroundMusic(this.currentTrackPath);
        }
        const achievementSoundsMuted = localStorage.getItem('achievementSoundsMuted');
        if (achievementSoundsMuted !== null) {
            this.achievementSoundsMuted = JSON.parse(achievementSoundsMuted);
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
    
    playSound(soundName, extension = 'wav') {
        if (this.isMuted) return;
        if (soundName === 'Achievement' && this.achievementSoundsMuted) {
            return;
        }
        let volume = this.masterVolume * this.sfxVolume;
        if (soundName === 'Achievement') {
            volume = this.masterVolume * this.achievementVolume;
        }
        const sound = new Audio(`./assets/sounds/${soundName}.${extension}`);
        sound.volume = volume;
        sound.play().catch(e => console.error(`Error playing sound ${soundName}:`, e));
    }
    playRandomSelectSound() {
        const soundIndex = Math.floor(Math.random() * 6) + 1; // 1 to 6
        const soundName = `select${soundIndex}`;
        this.playSound(soundName, 'wav');
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