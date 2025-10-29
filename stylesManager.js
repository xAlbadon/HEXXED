import userSettingsManager from './userSettingsManager.js';

export class StylesManager {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.stylesContainer = document.getElementById('stylesContainer');
    this.userSettingsManager = userSettingsManager;
    
    // Default style configuration
    this.defaultStyles = {
      backgroundType: 'gradient',
      backgroundColor1: '#2d1b69',
      backgroundColor2: '#1f002e',
      orbSize: 1.0,
      orbColor: '#ffffff',
      orbGlow: true,
      platformColor: '#1a0033',
      platformOpacity: 0.8,
      particleTheme: 'aurora',
      particleAutoChange: true,
      particleCount: 75,
      particleColorShift: false
    };
    
    // Current active styles
    this.currentStyles = { ...this.defaultStyles };
    
    // Style categories - all unlocked
    this.styleCategories = [
      {
        id: 'background',
        title: 'Background',
        icon: '',
        options: [
          {
            id: 'backgroundType',
            label: 'Background Type',
            type: 'select',
            options: ['gradient', 'solid', 'split']
          },
          {
            id: 'backgroundColor1',
            label: 'Primary Color',
            type: 'color'
          },
          {
            id: 'backgroundColor2',
            label: 'Secondary Color',
            type: 'color',
            dependsOn: 'backgroundType',
            showWhen: ['gradient', 'split']
          }
        ]
      },
      {
        id: 'orbs',
        title: 'Orbs',
        icon: '',
        options: [
          {
            id: 'orbSize',
            label: 'Orb Size',
            type: 'slider',
            min: 0.5,
            max: 2.0,
            step: 0.1,
            unit: 'x'
          },
          {
            id: 'orbGlow',
            label: 'Orb Glow Effect',
            type: 'checkbox'
          }
        ]
      },
      {
        id: 'platform',
        title: 'Platform',
        icon: '',
        options: [
          {
            id: 'platformColor',
            label: 'Platform Color',
            type: 'color'
          },
          {
            id: 'platformOpacity',
            label: 'Platform Opacity',
            type: 'slider',
            min: 0.0,
            max: 1.0,
            step: 0.1,
            unit: '%'
          }
        ]
      },
      {
        id: 'particles',
        title: 'Floating Particles',
        icon: '✨',
        options: [
          {
            id: 'particleTheme',
            label: 'Color Theme',
            type: 'select',
            options: ['aurora', 'sunset', 'forest', 'twilight', 'golden', 'ocean', 'rainbow', 'monochrome']
          },
          {
            id: 'particleAutoChange',
            label: 'Auto Theme Change (every 30s)',
            type: 'checkbox'
          },
          {
            id: 'particleColorShift',
            label: 'Subtle Color Shifting',
            type: 'checkbox'
          },
          {
            id: 'particleCount',
            label: 'Particle Count',
            type: 'slider',
            min: 25,
            max: 150,
            step: 5,
            unit: ''
          }
        ]
      }
    ];
    
    // Load styles from localStorage as fallback (backward compatibility)
    this.loadStylesFromLocalStorage();
  }
  
  /**
   * Load styles for a specific user (called after login)
   */
  async loadUserStyles(userId) {
    if (!userId) {
      console.warn('[StylesManager] No userId provided for styles load');
      return;
    }
    
    // Wait for settings to load
    await this.userSettingsManager.loadUserSettings(userId);
    
    // Apply loaded styles
    const styleSettings = this.userSettingsManager.getSettings('styles');
    this.currentStyles = { ...this.defaultStyles, ...styleSettings };
    
    console.log('[StylesManager] User styles loaded:', this.currentStyles);
    this.applyStyles();
    this.render();
  }
  
  /**
   * Reset to default styles (for new user or logout)
   */
  resetToDefaults() {
    this.currentStyles = { ...this.defaultStyles };
    this.applyStyles();
    this.render();
    console.log('[StylesManager] Reset to default styles');
  }
  
  /**
   * Load styles from localStorage (fallback/backward compatibility)
   */
  loadStylesFromLocalStorage() {
    const saved = localStorage.getItem('hexxedStyles');
    if (saved) {
      try {
        this.currentStyles = { ...this.defaultStyles, ...JSON.parse(saved) };
      } catch (e) {
        console.error('[StylesManager] Failed to load styles from localStorage:', e);
      }
    }
    this.applyStyles();
  }
  
  /**
   * Save styles to user settings manager
   */
  async saveStyles() {
    if (this.userSettingsManager.isReady()) {
      await this.userSettingsManager.updateSettings('styles', this.currentStyles);
    } else {
      // Fallback to localStorage if user settings not ready
      localStorage.setItem('hexxedStyles', JSON.stringify(this.currentStyles));
    }
  }
  
  // All styles are now unlocked by default
  checkUnlocked(requirement) {
    return true;
  }
  
  // Get the current orb size multiplier
  getOrbSizeMultiplier() {
    return this.currentStyles.orbSize || 1.0;
  }
  
  // Render the styles UI
  render() {
    if (!this.stylesContainer) return;
    
    this.stylesContainer.innerHTML = '';
    
    this.styleCategories.forEach(category => {
      const categoryEl = document.createElement('div');
      categoryEl.className = 'style-category';
      categoryEl.dataset.categoryId = category.id;
      
      // Header
      const headerEl = document.createElement('div');
      headerEl.className = 'style-category-header';
      headerEl.innerHTML = `
        <div class="style-category-title">
          <span class="style-category-icon">${category.icon}</span>
          <span>${category.title}</span>
        </div>
      `;
      
      categoryEl.appendChild(headerEl);
      
      // Body
      const bodyEl = document.createElement('div');
      bodyEl.className = 'style-category-body';
      
      // Render options
      if (category.options) {
        category.options.forEach(option => {
          // Check dependencies
          if (option.dependsOn) {
            const dependencyValue = this.currentStyles[option.dependsOn];
            if (!option.showWhen.includes(dependencyValue)) {
              return; // Skip rendering this option
            }
          }
          
          const optionEl = this.createOptionElement(option);
          if (optionEl) bodyEl.appendChild(optionEl);
        });
      }
      
      // Add reset button
      const resetBtn = document.createElement('button');
      resetBtn.className = 'style-reset-btn';
      resetBtn.textContent = '↺ Reset to Default';
      resetBtn.addEventListener('click', () => this.resetCategory(category.id));
      bodyEl.appendChild(resetBtn);
      
      categoryEl.appendChild(bodyEl);
      
      // Toggle collapse
      headerEl.addEventListener('click', () => {
        categoryEl.classList.toggle('collapsed');
      });
      
      this.stylesContainer.appendChild(categoryEl);
    });
  }
  
  // Create an option element based on type
  createOptionElement(option) {
    const optionEl = document.createElement('div');
    optionEl.className = 'style-option';
    
    const labelEl = document.createElement('div');
    labelEl.className = 'style-option-label';
    labelEl.textContent = option.label;
    optionEl.appendChild(labelEl);
    
    const controlEl = document.createElement('div');
    controlEl.className = 'style-option-control';
    
    switch (option.type) {
      case 'color':
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.className = 'style-color-picker';
        colorInput.value = this.currentStyles[option.id] || '#ffffff';
        colorInput.addEventListener('input', (e) => {
          this.updateStyle(option.id, e.target.value);
        });
        controlEl.appendChild(colorInput);
        break;
        
      case 'slider':
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'style-slider';
        slider.min = option.min;
        slider.max = option.max;
        slider.step = option.step;
        slider.value = this.currentStyles[option.id] || option.min;
        
        const valueDisplay = document.createElement('div');
        valueDisplay.className = 'style-value-display';
        const displayValue = option.unit === '%' 
          ? Math.round(slider.value * 100) + option.unit
          : slider.value + option.unit;
        valueDisplay.textContent = displayValue;
        
        slider.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          this.updateStyle(option.id, val);
          const displayVal = option.unit === '%' 
            ? Math.round(val * 100) + option.unit
            : val + option.unit;
          valueDisplay.textContent = displayVal;
        });
        
        controlEl.appendChild(slider);
        controlEl.appendChild(valueDisplay);
        break;
        
      case 'checkbox':
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = this.currentStyles[option.id] !== false;
        checkbox.addEventListener('change', (e) => {
          this.updateStyle(option.id, e.target.checked);
        });
        
        const checkboxLabel = document.createElement('label');
        checkboxLabel.style.display = 'flex';
        checkboxLabel.style.alignItems = 'center';
        checkboxLabel.style.gap = '8px';
        checkboxLabel.style.cursor = 'pointer';
        checkboxLabel.appendChild(checkbox);
        const labelText = document.createElement('span');
        labelText.textContent = 'Enable';
        checkboxLabel.appendChild(labelText);
        controlEl.appendChild(checkboxLabel);
        break;
        
      case 'select':
        const select = document.createElement('select');
        select.style.padding = '8px';
        select.style.borderRadius = '6px';
        select.style.background = 'rgba(0, 0, 0, 0.3)';
        select.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        select.style.color = '#fff';
        select.style.fontSize = '14px';
        option.options.forEach(opt => {
          const optEl = document.createElement('option');
          optEl.value = opt;
          // Special formatting for particle themes
          if (option.id === 'particleTheme' && window.COLOR_THEMES && window.COLOR_THEMES[opt]) {
            optEl.textContent = window.COLOR_THEMES[opt].name;
          } else {
            optEl.textContent = opt.charAt(0).toUpperCase() + opt.slice(1).replace(/([A-Z])/g, ' $1');
          }
          if (this.currentStyles[option.id] === opt) optEl.selected = true;
          select.appendChild(optEl);
        });
        select.addEventListener('change', (e) => {
          this.updateStyle(option.id, e.target.value);
          // Re-render to show/hide dependent options
          this.render();
        });
        controlEl.appendChild(select);
        
        // Add preview circle for particle themes
        if (option.id === 'particleTheme' && window.COLOR_THEMES) {
          const currentTheme = window.COLOR_THEMES[this.currentStyles.particleTheme];
          if (currentTheme) {
            const preview = document.createElement('div');
            preview.className = 'particle-theme-preview';
            const previewHue = currentTheme.hueStart + (currentTheme.hueRange / 2);
            preview.style.background = `hsla(${previewHue}, ${currentTheme.saturation}%, ${currentTheme.lightness}%, 0.9)`;
            preview.style.boxShadow = `0 0 15px hsla(${previewHue}, ${currentTheme.saturation}%, ${currentTheme.lightness}%, 0.6)`;
            controlEl.appendChild(preview);
            
            // Update preview when selection changes
            select.addEventListener('change', (e) => {
              const newTheme = window.COLOR_THEMES[e.target.value];
              if (newTheme) {
                const newHue = newTheme.hueStart + (newTheme.hueRange / 2);
                preview.style.background = `hsla(${newHue}, ${newTheme.saturation}%, ${newTheme.lightness}%, 0.9)`;
                preview.style.boxShadow = `0 0 15px hsla(${newHue}, ${newTheme.saturation}%, ${newTheme.lightness}%, 0.6)`;
              }
            });
          }
        }
        break;
    }
    
    optionEl.appendChild(controlEl);
    return optionEl;
  }
  
  // Update a style value
  updateStyle(key, value) {
    this.currentStyles[key] = value;
    this.saveStyles();
    this.applyStyles();
  }
  
  // Apply a preset
  applyPreset(preset) {
    if (preset.background1) this.currentStyles.backgroundColor1 = preset.background1;
    if (preset.background2) this.currentStyles.backgroundColor2 = preset.background2;
    if (preset.platform) this.currentStyles.platformColor = preset.platform;
    this.saveStyles();
    this.applyStyles();
    this.render();
  }
  
  // Reset a category to defaults
  resetCategory(categoryId) {
    const category = this.styleCategories.find(c => c.id === categoryId);
    if (!category) return;
    
    if (category.options) {
      category.options.forEach(option => {
        if (this.defaultStyles[option.id] !== undefined) {
          this.currentStyles[option.id] = this.defaultStyles[option.id];
        }
      });
    }
    
    this.saveStyles();
    this.applyStyles();
    this.render();
  }
  
  // Apply styles to a single orb (called when new orbs are created)
  applyStylesToOrb(orb) {
    if (!orb || !orb.mesh) return;
    
    // Store the BASE scale (1.0) if not already stored - this is the unstyled size
    if (orb.baseScale === undefined) {
      orb.baseScale = 1.0;
    }
    
    // Store the original scale for compatibility (this is the STYLED scale)
    const styledScale = orb.baseScale * this.currentStyles.orbSize;
    orb.originalScale = styledScale;
    
    // Apply size multiplier
    orb.mesh.scale.setScalar(styledScale);
    
    // Apply glow effect
    if (orb.glowMesh) {
      orb.glowMesh.visible = this.currentStyles.orbGlow;
    }
  }
  
  // Apply current styles to the game
  applyStyles() {
    console.log('[StylesManager] Applying styles:', this.currentStyles);
    const body = document.body;
    
    // Apply background - use setProperty with priority to override CSS
    if (this.currentStyles.backgroundType === 'gradient') {
      const gradient = `linear-gradient(135deg, ${this.currentStyles.backgroundColor1}, ${this.currentStyles.backgroundColor2})`;
      body.style.setProperty('background', gradient, 'important');
      body.style.setProperty('background-size', '400% 400%', 'important');
      body.style.setProperty('animation', 'animatedBackground 25s ease infinite', 'important');
      console.log('[StylesManager] Applied gradient background:', gradient);
    } else if (this.currentStyles.backgroundType === 'solid') {
      body.style.setProperty('background', this.currentStyles.backgroundColor1, 'important');
      body.style.setProperty('background-size', 'auto', 'important');
      body.style.setProperty('animation', 'none', 'important');
      console.log('[StylesManager] Applied solid background:', this.currentStyles.backgroundColor1);
    } else if (this.currentStyles.backgroundType === 'split') {
      const gradient = `linear-gradient(180deg, ${this.currentStyles.backgroundColor1} 50%, ${this.currentStyles.backgroundColor2} 50%)`;
      body.style.setProperty('background', gradient, 'important');
      body.style.setProperty('background-size', 'auto', 'important');
      body.style.setProperty('animation', 'none', 'important');
      console.log('[StylesManager] Applied split background:', gradient);
    }
    
    // Apply orb styles
    if (this.game && this.game.orbManager && this.game.orbManager.orbs) {
      console.log(`[StylesManager] Applying orb styles to ${this.game.orbManager.orbs.length} orbs`);
      this.game.orbManager.orbs.forEach(orb => {
        this.applyStylesToOrb(orb);
      });
      console.log('[StylesManager] Applied orb size:', this.currentStyles.orbSize, 'and glow:', this.currentStyles.orbGlow);
    } else {
      console.warn('[StylesManager] Could not apply orb styles - orbs not found');
    }
    
    // Apply platform/floor styles
    if (this.game && this.game.gameWorld && this.game.gameWorld.floor) {
      const floor = this.game.gameWorld.floor;
      if (floor.material) {
        floor.material.color.setStyle(this.currentStyles.platformColor);
        floor.material.opacity = this.currentStyles.platformOpacity;
        floor.material.transparent = this.currentStyles.platformOpacity < 1.0;
        floor.material.needsUpdate = true;
        console.log('[StylesManager] Applied platform color:', this.currentStyles.platformColor, 'opacity:', this.currentStyles.platformOpacity);
      }
    } else {
      console.warn('[StylesManager] Could not apply platform styles - floor not found');
    }
    
    // Apply particle styles
    if (window.particleSettings) {
      const oldCount = window.particleSettings.particleCount;
      const newCount = this.currentStyles.particleCount || 75;
      
      window.particleSettings.colorTheme = this.currentStyles.particleTheme || 'aurora';
      window.particleSettings.autoThemeChange = this.currentStyles.particleAutoChange !== false;
      window.particleSettings.colorShift = this.currentStyles.particleColorShift === true;
      window.particleSettings.particleCount = newCount;
      
      // Save particle settings
      if (window.saveParticleSettings) {
        window.saveParticleSettings();
      }
      
      // Restart auto-change timer with new settings
      if (window.restartAutoThemeChange) {
        window.restartAutoThemeChange();
      }
      
      // If particle count changed, fully reinit
      if (oldCount !== newCount && window.reinitParticles) {
        window.reinitParticles();
      } else if (window.reinitParticlesWithNewTheme) {
        // Otherwise just update colors
        window.reinitParticlesWithNewTheme();
      }
      
      console.log('[StylesManager] Applied particle theme:', this.currentStyles.particleTheme, 'count:', newCount, 'auto-change:', window.particleSettings.autoThemeChange, 'color-shift:', window.particleSettings.colorShift);
    }
  }
}
