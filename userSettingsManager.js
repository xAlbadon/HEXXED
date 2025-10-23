import { supabase } from './supabaseClient.js';

/**
 * UserSettingsManager handles per-user storage of game settings and styles
 * Settings are stored in Supabase and loaded when a user logs in
 */
export class UserSettingsManager {
  constructor() {
    this.currentUserId = null;
    this.settings = null;
    this.isLoaded = false;
    
    // Default settings structure
    this.defaultSettings = {
      // Audio settings
      audio: {
        isMuted: false,
        masterVolume: 0.5,
        musicVolume: 1.0,
        sfxVolume: 1.0,
        achievementVolume: 1.0,
        achievementSoundsMuted: false,
        currentTrack: null
      },
      
      // Visual styles
      styles: {
        backgroundType: 'gradient',
        backgroundColor1: '#2d1b69',
        backgroundColor2: '#1f002e',
        orbSize: 1.0,
        orbColor: '#ffffff',
        orbGlow: true,
        platformColor: '#1a0033',
        platformOpacity: 0.8
      }
    };
  }
  
  /**
   * Initialize settings for a user
   * Loads from Supabase or creates default settings for new users
   */
  async loadUserSettings(userId) {
    if (!userId) {
      console.warn('[UserSettingsManager] No userId provided, using defaults');
      this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
      this.isLoaded = true;
      return this.settings;
    }
    
    this.currentUserId = userId;
    
    try {
      // Try to fetch existing settings - use maybeSingle() to avoid errors for new users
      const { data, error } = await supabase
        .from('player_settings')
        .select('settings')
        .eq('player_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('[UserSettingsManager] Error loading settings:', error);
        throw error;
      }
      
      if (data && data.settings) {
        // Merge with defaults to ensure all keys exist (in case new settings were added)
        this.settings = this.mergeWithDefaults(data.settings);
        console.log('[UserSettingsManager] Loaded user settings from database');
      } else {
        // No settings found, create default settings for this user (expected for new accounts)
        console.log('[UserSettingsManager] New user detected, initializing with default settings');
        this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
        await this.saveUserSettings();
      }
      
      this.isLoaded = true;
      return this.settings;
      
    } catch (error) {
      console.error('[UserSettingsManager] Failed to load user settings:', error);
      // Fall back to defaults on error
      this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
      this.isLoaded = true;
      return this.settings;
    }
  }
  
  /**
   * Save current settings to Supabase
   */
  async saveUserSettings() {
    if (!this.currentUserId) {
      console.warn('[UserSettingsManager] Cannot save: no user ID');
      return false;
    }
    
    if (!this.settings) {
      console.warn('[UserSettingsManager] Cannot save: no settings loaded');
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('player_settings')
        .upsert({
          player_id: this.currentUserId,
          settings: this.settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'player_id'
        });
      
      if (error) {
        console.error('[UserSettingsManager] Error saving settings:', error);
        return false;
      }
      
      console.log('[UserSettingsManager] Settings saved successfully');
      return true;
      
    } catch (error) {
      console.error('[UserSettingsManager] Failed to save user settings:', error);
      return false;
    }
  }
  
  /**
   * Update a specific setting value and save
   */
  async updateSetting(category, key, value) {
    if (!this.settings || !this.settings[category]) {
      console.warn(`[UserSettingsManager] Invalid category: ${category}`);
      return false;
    }
    
    this.settings[category][key] = value;
    return await this.saveUserSettings();
  }
  
  /**
   * Update multiple settings at once
   */
  async updateSettings(category, updates) {
    if (!this.settings || !this.settings[category]) {
      console.warn(`[UserSettingsManager] Invalid category: ${category}`);
      return false;
    }
    
    Object.assign(this.settings[category], updates);
    return await this.saveUserSettings();
  }
  
  /**
   * Get a specific setting value
   */
  getSetting(category, key) {
    if (!this.settings || !this.settings[category]) {
      return this.defaultSettings[category]?.[key];
    }
    return this.settings[category][key];
  }
  
  /**
   * Get all settings for a category
   */
  getSettings(category) {
    if (!this.settings || !this.settings[category]) {
      return { ...this.defaultSettings[category] };
    }
    return { ...this.settings[category] };
  }
  
  /**
   * Reset settings to defaults
   */
  async resetToDefaults() {
    this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
    return await this.saveUserSettings();
  }
  
  /**
   * Reset a specific category to defaults
   */
  async resetCategory(category) {
    if (!this.settings || !this.defaultSettings[category]) {
      console.warn(`[UserSettingsManager] Invalid category: ${category}`);
      return false;
    }
    
    this.settings[category] = JSON.parse(JSON.stringify(this.defaultSettings[category]));
    return await this.saveUserSettings();
  }
  
  /**
   * Clear current user and reset to defaults (for logout)
   */
  clearUser() {
    this.currentUserId = null;
    this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
    this.isLoaded = false;
  }
  
  /**
   * Merge loaded settings with defaults to ensure all keys exist
   */
  mergeWithDefaults(loadedSettings) {
    const merged = JSON.parse(JSON.stringify(this.defaultSettings));
    
    // Deep merge each category
    for (const category in loadedSettings) {
      if (merged[category]) {
        Object.assign(merged[category], loadedSettings[category]);
      }
    }
    
    return merged;
  }
  
  /**
   * Check if settings are loaded
   */
  isReady() {
    return this.isLoaded;
  }
}

// Export singleton instance
const userSettingsManager = new UserSettingsManager();
export default userSettingsManager;
