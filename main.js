import * as THREE from 'three';
import { GameWorld } from './gameWorld.js';
import { ColorSystem } from './colorSystem.js';
import { ColorOrbManager } from './colorOrbs.js';
import { UIManager } from './uiManager.js';
// import { EncyclopediaWall } from './encyclopediaWall.js'; // Removed
import { ParticleSystem } from './particleSystem.js';
import { ChallengeManager } from './challengeManager.js';
import { LinePreviewSystem } from './linePreviewSystem.js'; // Added
import { supabase } from './supabaseClient.js';
import { UpdateManager } from './updateManager.js'; // Added for Electron updates
import audioManager from './audioManager.js';
class ChromaLabGame {
  constructor() {
    this.container = document.getElementById('gameContainer');
    this.selectedColors = [];
    this.maxSelections = 2;
    this.playerId = null; // To store the Supabase player ID
    this.username = null; // To store the logged-in username
    this.orbRingCapacities = {
      1: Infinity, // Primary colors, no limit on their "ring"
      2: 9,        // Max 9 orbs for 2-color mixes (capacity unchanged as per user request focusing on 3 & 4)
      3: 18,       // Max 18 orbs for 3-color mixes (was 20)
      4: 30        // Max 30 orbs for 4-color mixes (was 35)
    };
    this.radiiConfig = { // Radii for different mix arity rings
      2: 4.5, // Primary is 3.0 (PC), step 1.5. Was 6.0
      3: 6.0, // Step 1.5 from 2-mix. Was 7.5
      4: 7.5  // Step 1.5 from 3-mix. Was 9.0
    };
    this.baseRingYOffsets = { // Base Y positions for orbs in different rings
      1: 0.5,  // Primary orbs
      2: 0.8,  // 2-mix orbs
      3: 0.85, // 3-mix orbs (slightly higher for visual layering)
      4: 0.9   // 4-mix orbs
    };
    // Initialize UIManager first as it handles the title screen
    this.uiManager = new UIManager(
        this, // Pass the game instance to UIManager
        this.handleLogin.bind(this),
        this.handleSignup.bind(this)
    );
    this.playerOneBattleScore = 0; // Current score for the round (can be removed if not used by new logic)
    this.playerTwoBattleScore = 0; // Current score for the round (can be removed if not used by new logic)
    this.playerOneBestAttempt = null; // { colorData: {}, difference: Infinity }
    this.playerTwoBestAttempt = null; // { colorData: {}, difference: Infinity }
    this.currentBattleTargetColor = null; // Stores the target color for the current round
    // Lobby state
    this.currentSessionId = null;
    this.sessionSubscription = null; // For DB changes on game_sessions
    this.battleChannelSubscription = null; // For broadcast events during a battle
    this.isLocalPlayerOne = null; // Is the current player player_one in the session?
    this.waitingForOpponentInterval = null; // Interval timer for P1 polling
    this.playerOneReadyForBattle = false;
    this.playerTwoReadyForBattle = false;
    this.battleHasActuallyStarted = false; // NEW: Tracks if battle timer is running
    // Initialize UpdateManager (for Electron environments)
    // It will handle showing its UI if an update is in progress
    this.updateManager = new UpdateManager(this.uiManager);
    // Defer full game init until after login/signup
    // this.init();
  }
  // Called after successful login/signup
  async completeInitialization() {
    // Play background music
    // Note: In Electron, paths are relative to the project root.
    // Ensure 'assets/music/Chromatic_Cascade.mp3' exists.
    if (audioManager.currentTrackPath) {
        audioManager.playBackgroundMusic(audioManager.currentTrackPath);
    } else {
        // If no track is saved in localStorage, play the default and save it.
        audioManager.playBackgroundMusic('./assets/music/Chromatic_Cascade.mp3');
    }
    
    // Initialize core systems
    this.gameWorld = new GameWorld(this.container);
    this.colorSystem = new ColorSystem();
    // UIManager is already initialized
    // this.encyclopediaWall = new EncyclopediaWall(this.gameWorld.scene); // Removed
    this.particleSystem = new ParticleSystem(this.gameWorld.scene);
    this.challengeManager = new ChallengeManager(this.colorSystem, this.playerId); // Pass playerId
    this.linePreviewSystem = new LinePreviewSystem(this.gameWorld.scene); // Added
    
    // Initialize orb manager with new configurations
    this.orbManager = new ColorOrbManager(
      this.gameWorld.scene, 
      this.gameWorld.camera,
      this.onOrbClick.bind(this),
      this.radiiConfig,
      this.baseRingYOffsets
    );
    
    // Load progress (player ID is now set)
    await this.loadDiscoveredColors();
    await this.loadCompletedChallenges();
    
    // Create initial color orbs
    this.createInitialOrbs();
    
    // Update encyclopedia UI (now targets the new page elements)
    this.uiManager.updateEncyclopedia(this.colorSystem.getDiscoveredColors());
    // Refresh challenge displays (replaces startNewChallenge)
    await this.refreshChallengeRelatedDisplays(); // Use the new method
    // Display leaderboard
    if (this.uiManager) {
        this.uiManager.displayLeaderboard();
    }
    
    // Start game loop
    this.animate();
    
    // Setup event listeners (mix button etc.)
    this.setupGameEventListeners();
    // Check if the UpdateManager is blocking UI (e.g. update in progress)
    // If it is, the UIManager should keep the title screen visible
    // This interaction will be handled by UIManager checking updateManager.isBlockingUI()
  }
  // Placeholder for login logic
  async handleLogin(username, password) {
    this.uiManager.setAuthMessage('Logging in...', false);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, username')
        .eq('username', username)
        .eq('password', password) // Plain text password check as requested
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116: "Searched for a single row, but found no rows" which is fine for login fail
        throw error;
      }
      if (data) {
        this.playerId = data.id;
        this.username = data.username;
        this.uiManager.setAuthMessage('Login successful!', false);
        this.uiManager.showGameArea(this.username);
        await this.completeInitialization();
      } else {
        this.uiManager.setAuthMessage('Invalid username or password.', true);
      }
    } catch (error) {
      console.error('Login error:', error);
      this.uiManager.setAuthMessage(`Login failed: ${error.message}`, true);
    }
  }
  async handleSignup(username, password) {
    this.uiManager.setAuthMessage('Signing up...', false);
    try {
      // Check if username already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('players')
        .select('username')
        .eq('username', username)
        .single();
      if (fetchError && fetchError.code !== 'PGRST116') { // Ignore "no rows found" error
        throw fetchError;
      }
      if (existingUser) {
        this.uiManager.setAuthMessage('Username already taken. Please choose another.', true);
        return;
      }
      // Create new player
      const { data: newUser, error: insertError } = await supabase
        .from('players')
        .insert([{ username, password }]) // Supabase will generate 'id' UUID
        .select('id, username')
        .single();
      if (insertError) {
        throw insertError;
      }
      if (newUser) {
        this.playerId = newUser.id;
        this.username = newUser.username;
        this.uiManager.setAuthMessage('Signup successful! Logging in...', false);
        this.uiManager.showGameArea(this.username);
        await this.completeInitialization();
      } else {
        this.uiManager.setAuthMessage('Signup failed. Please try again.', true);
      }
    } catch (error) {
      console.error('Signup error:', error);
      this.uiManager.setAuthMessage(`Signup failed: ${error.message}`, true);
    }
  }
  createInitialOrbs() {
    // Filter for only primary colors for the initial setup
    const primaryColors = this.colorSystem.getDiscoveredColors().filter(c => c.isPrimary);
    
    if (primaryColors.length === 0) {
        console.warn("[ChromaLabGame] No primary colors found to create initial orbs. Check color system initialization and loading logic.");
        // As a fallback, explicitly try to get them from ColorSystem's base definitions
        // This shouldn't be necessary if loadDiscoveredColors works correctly.
        const fallbackPrimaries = [
            this.colorSystem.getColorByHex('#FF0000'),
            this.colorSystem.getColorByHex('#0000FF'),
            this.colorSystem.getColorByHex('#FFFF00')
        ].filter(Boolean); // Filter out any nulls if not found
        
        if(fallbackPrimaries.length > 0) {
            console.log("[ChromaLabGame] Using fallback primaries for initial orbs:", fallbackPrimaries.map(c => c.name));
            primaryColors.push(...fallbackPrimaries);
        } else {
            console.error("[ChromaLabGame] CRITICAL: Fallback primary colors also not found. Initial orbs cannot be created.");
            return;
        }
    }
    // Ensure initialOrbRadius is smaller than the smallest mixArity ring (which is 4.5 for arity 2)
    let initialOrbRadius = 3.0; // Default for PC (aspect >= 1.3), was 4.5
    const aspect = window.innerWidth / window.innerHeight;
    if (aspect < 1) { // Narrower screen (portrait)
        initialOrbRadius = 2.5; // Was 3.0
    } else if (aspect < 1.3) { // Slightly narrow screens
        initialOrbRadius = 2.8; // Was 3.8
    }
    const primaryYOffset = this.baseRingYOffsets[1] || 0.5; // Y offset for all primary orbs
    const chromaticPrimaryColors = primaryColors.filter(
        c => !c.isShadingColor && !c.isSaturationModifier 
    );
    const shadingPrimaryColors = primaryColors.filter(
        c => c.isShadingColor && !c.isSaturationModifier
    );
    const saturationModifierOrbs = primaryColors.filter(
        c => c.isSaturationModifier
    );
    let maxRadiusForCamera = initialOrbRadius; // Initialize with radius for chromatic primaries
    // Place chromatic primary colors (Red, Yellow, Blue) in a circle
    if (chromaticPrimaryColors.length > 0) {
        chromaticPrimaryColors.forEach((color, index) => {
          const angle = (index / chromaticPrimaryColors.length) * Math.PI * 2;
          const position = new THREE.Vector3(
            Math.cos(angle) * initialOrbRadius,
            primaryYOffset,
            Math.sin(angle) * initialOrbRadius
          );
          this.orbManager.createOrb(color, position, true);
        });
    } else {
        console.warn("[ChromaLabGame] No chromatic primary colors found for circular layout. Check color definitions.");
    }
    
    // Place shading primary colors (Black, White) at specific positions (bottom corners)
    const cornerOffset = 6.5; // Defines X and Z distance for corner placement
    const cornerDistanceFromCenter = Math.sqrt(2 * cornerOffset * cornerOffset);
    const whiteOrbData = shadingPrimaryColors.find(c => c.hex === '#FFFFFF');
    if (whiteOrbData) {
        const whitePosition = new THREE.Vector3(cornerOffset, primaryYOffset, cornerOffset); // Bottom-right
        this.orbManager.createOrb(whiteOrbData, whitePosition, true);
        maxRadiusForCamera = Math.max(maxRadiusForCamera, cornerDistanceFromCenter);
    }
    const blackOrbData = shadingPrimaryColors.find(c => c.hex === '#000000');
    if (blackOrbData) {
        const blackPosition = new THREE.Vector3(-cornerOffset, primaryYOffset, cornerOffset); // Bottom-left
        this.orbManager.createOrb(blackOrbData, blackPosition, true);
        maxRadiusForCamera = Math.max(maxRadiusForCamera, cornerDistanceFromCenter);
    }
    // Place saturation modifier orbs (top corners)
    const saturatorOrbData = saturationModifierOrbs.find(c => c.saturationEffect > 0);
    if (saturatorOrbData) {
        const saturatorPosition = new THREE.Vector3(cornerOffset, primaryYOffset, -cornerOffset); // Top-right
        this.orbManager.createOrb(saturatorOrbData, saturatorPosition, true);
        maxRadiusForCamera = Math.max(maxRadiusForCamera, cornerDistanceFromCenter);
    }
    const desaturatorOrbData = saturationModifierOrbs.find(c => c.saturationEffect < 0);
    if (desaturatorOrbData) {
        const desaturatorPosition = new THREE.Vector3(-cornerOffset, primaryYOffset, -cornerOffset); // Top-left
        this.orbManager.createOrb(desaturatorOrbData, desaturatorPosition, true);
        maxRadiusForCamera = Math.max(maxRadiusForCamera, cornerDistanceFromCenter);
    }
    // Now, create orbs for any non-primary, non-modifier colors that were loaded from the database
    const nonPrimaryDiscoveredColors = this.colorSystem.getDiscoveredColors().filter(c => !c.isPrimary);
    const nonSpecialDiscoveredColors = this.colorSystem.getDiscoveredColors().filter(c => !c.isPrimary && !c.isSaturationModifier);
    nonSpecialDiscoveredColors.forEach(colorData => {
        const { mixArity } = colorData;
        if (typeof mixArity !== 'number' || mixArity < 2) {
            console.warn(`[ChromaLabGame.createInitialOrbs] Color ${colorData.name} (${colorData.hex}) has invalid mixArity ${mixArity}. Skipping orb creation.`);
            return;
        }
        const capacity = this.orbRingCapacities[mixArity] || this.orbRingCapacities[2]; // Default to 2-mix capacity
        const currentOrbsInRing = this.orbManager.orbs.filter(
            orb => orb.colorData.mixArity === mixArity && !orb.colorData.isPrimary
        ).length;
        if (currentOrbsInRing >= capacity) {
            console.log(`[ChromaLabGame.createInitialOrbs] Ring for mixArity ${mixArity} is full at initial load. Color ${colorData.name} (${colorData.hex}) will be in encyclopedia but not an active orb.`);
            // No UI message here as it might be spammy on load. Player can manage via Rings UI.
            return; 
        }
        
        let radius = this.radiiConfig[mixArity];
        let yOffset = this.baseRingYOffsets[mixArity];
        
        maxRadiusForCamera = Math.max(maxRadiusForCamera, radius);
        // Initial temp position; recalculateRingLayout will place it correctly.
        this.orbManager.createOrb(colorData, new THREE.Vector3(0, yOffset, radius), false); 
    });
    // After all initial orbs are created, recalculate layouts for rings with mixArity >= 2
    Object.keys(this.radiiConfig).forEach(arityStr => {
        const mixArity = parseInt(arityStr);
        if (mixArity >= 2) {
            // Ensure we are only laying out non-primary, non-modifier orbs in these rings
            this.orbManager.recalculateRingLayout(mixArity); 
        }
    });
    
    if (this.gameWorld) this.gameWorld.updateCameraZoom(maxRadiusForCamera);
  }
  onOrbClick(orb) {
    if (this.selectedColors.includes(orb)) {
      this.handleOrbDeselection(orb); // Re-route to the new central handler
    } else if (this.selectedColors.length < this.maxSelections) {
      this.selectOrb(orb);
    }
  }
  selectOrb(orb) {
    this.selectedColors.push(orb);
    this.orbManager.selectOrb(orb);
    // After selecting, update the state
    this.updateSelectionState();
     // Play a random selection sound
     const soundIndex = Math.floor(Math.random() * 6) + 1;
     audioManager.playSound(`./assets/sounds/select${soundIndex}.wav`, 0.5);
  }
  deselectOrb(orb) {
    this.orbManager.deselectOrb(orb);
    const index = this.selectedColors.indexOf(orb);
    if (index > -1) {
      this.selectedColors.splice(index, 1);
    }
    // Update all UI and game state after deselecting
    this.updateSelectionState();
  }
  handleOrbDeselection(orb) {
    // This is now the single point of entry for deselection logic.
    if (!this.selectedColors.includes(orb)) {
      console.warn("[ChromaLabGame] handleOrbDeselection called for an orb that is not in the selectedColors array.");
      return;
    }
    
    console.log(`[ChromaLabGame] Deselecting orb: ${orb.colorData.name}`);
    audioManager.playSound('./assets/sounds/select2.wav', 0.5);
    this.deselectOrb(orb);
  }
  // A new helper method to centralize state updates after any selection change.
  updateSelectionState() {
    // Toggle tooltip availability
    this.orbManager.setTooltipsEnabled(this.selectedColors.length === 0);
    
    // Update the UI display of selected colors
    this.uiManager.updateSelectedColors(this.selectedColors);
    
    // Update the mix button availability
    this.checkMixingAvailable();
    
    // Update the line preview
    if (this.selectedColors.length >= 2) {
      const potentialMixedColor = this.colorSystem.mixColors(this.selectedColors.map(o => o.colorData));
      if (potentialMixedColor) {
        this.linePreviewSystem.updatePreview(this.selectedColors, potentialMixedColor);
      } else {
        this.linePreviewSystem.clearPreview();
      }
    } else {
      this.linePreviewSystem.clearPreview();
    }
  }
  checkMixingAvailable() {
    const selectionCount = this.selectedColors.length;
    const canMix = selectionCount >= 2 && selectionCount <= this.maxSelections;
    this.uiManager.setMixButtonEnabled(canMix);
  }
  async mixSelectedColors() {
    const selectionCount = this.selectedColors.length;
    if (selectionCount < 2 || selectionCount > this.maxSelections) {
        if (selectionCount < 2 && selectionCount > 0) {
            this.uiManager.showAchievement("Select at least 2 colors to mix.");
        } else if (selectionCount > this.maxSelections) {
            this.uiManager.showAchievement(`You can mix a maximum of ${this.maxSelections} colors.`);
        }
        this.clearSelection();
        return;
    }
    console.log('[ChromaLabGame.mixSelectedColors] Attempting to mix. Selected orbs:', this.selectedColors.map(orb => orb.colorData.name));
    const colorValues = this.selectedColors.map(orb => orb.colorData);
    console.log('[ChromaLabGame.mixSelectedColors] Input to colorSystem.mixColors:', 
        colorValues.map(cv => ({ name: cv.name, hex: cv.hex, isPrimary: cv.isPrimary, isShadingColor: cv.isShadingColor, isSaturationModifier: cv.isSaturationModifier }))
    );
    const newColor = this.colorSystem.mixColors(colorValues);
    console.log('[ChromaLabGame.mixSelectedColors] Output from colorSystem.mixColors (newColor):', 
        newColor ? { name: newColor.name, hex: newColor.hex, rgb: newColor.rgb } : 'null (mix failed or no result)'
    );
    if (this.uiManager && this.uiManager.isBattleModeActive) { // Battle Mode
        console.log('[ChromaLabGame.mixSelectedColors] Battle Mode Active. Target Color:', 
            this.currentBattleTargetColor ? { name: this.currentBattleTargetColor.name, hex: this.currentBattleTargetColor.hex } : 'null'
        );
        if (newColor && this.currentBattleTargetColor) {
            console.log('[ChromaLabGame.mixSelectedColors] Battle Mode: Mix and target are valid, proceeding with P1/P2 result handling.');
            let isPlayerOneMix = !this.currentSessionData || this.isLocalPlayerOne;
            if (isPlayerOneMix) {
                this.handlePlayerOneBattleMixResult(newColor, this.currentBattleTargetColor);
            } else { // Must be Player 2 in a session
                this.handlePlayerTwoBattleMixResult(newColor, this.currentBattleTargetColor);
            }
            // Trigger particle burst for a successful mix in battle mode
            const centralPoint = this.linePreviewSystem.getCentralPoint() || new THREE.Vector3(0, 1, 0);
            if (this.particleSystem) this.particleSystem.createBurst(centralPoint, newColor);
        } else {
            console.log('[ChromaLabGame.mixSelectedColors] Battle Mode: Mix considered failed (newColor is null or currentBattleTargetColor is null).');
            this.uiManager.showAchievement("Mix Failed! Try again.");
        }
    } else { // Discovery Mode
        console.log('[ChromaLabGame.mixSelectedColors] Discovery Mode Active.');
        if (newColor) {
            if (this.colorSystem.isNewColor(newColor)) {
                this.colorSystem.addDiscoveredColor(newColor);
                await this.saveDiscoveredColor(newColor);
                this.createNewColorOrb(newColor);
                this.uiManager.updateEncyclopedia(this.colorSystem.getDiscoveredColors());
                this.updateProgressionRules();
                this.uiManager.updateColorCount(this.colorSystem.getDiscoveredColors().length);
                this.uiManager.showColorDiscovered(newColor);
                // Trigger particle burst for a new color discovery
                const centralPoint = this.linePreviewSystem.getCentralPoint() || new THREE.Vector3(0, 1, 0);
                if (this.particleSystem) this.particleSystem.createBurst(centralPoint, newColor);
                const totalDiscovered = this.colorSystem.getDiscoveredColors().length;
                const achievementProgressMade = this.challengeManager.updateProgress(newColor, totalDiscovered);
                if (achievementProgressMade) {
                    this.uiManager.showAchievement("Achievement progress updated!");
                    if (this.uiManager.fullscreenEncyclopedia && 
                        this.uiManager.fullscreenEncyclopedia.style.display === 'block' &&
                        this.uiManager.encyclopediaTabsContainer.querySelector('[data-tab="achievementsTab"].active')) {
                        this.uiManager.populateAchievementsTab();
                    }
                }
                this.uiManager.updateChallengeDisplay();
            } else { // Color already discovered
                this.uiManager.showAchievement(`${newColor.name} already discovered.`);
                // Trigger particle burst for re-mixing an existing color
                const centralPoint = this.linePreviewSystem.getCentralPoint() || new THREE.Vector3(0, 1, 0);
                if (this.particleSystem) this.particleSystem.createBurst(centralPoint, newColor);
            }
        } else { // Mix failed
            this.uiManager.showAchievement("Mix Failed! Try different colors.");
        }
    }
    this.clearSelection(); // This will also clear the line preview
  }
  // startNewChallenge is largely obsolete. The UI shows all achievements.
  // The challengeManager.getLegacyChallengeDisplayInfo() is used by UIManager.updateChallengeDisplay()
  // for the small top-right challenge hint.
  async refreshChallengeRelatedDisplays() { 
    // This can be called after loading data or when major progression changes occur.
    this.uiManager.updateChallengeDisplay(); // Updates the small hint display
    // If achievements tab is open, refresh it
    if (this.uiManager.fullscreenEncyclopedia && 
        this.uiManager.fullscreenEncyclopedia.style.display === 'block' &&
        this.uiManager.encyclopediaTabsContainer.querySelector('[data-tab="achievementsTab"].active')) {
        this.uiManager.populateAchievementsTab();
    }
  }
  createNewColorOrb(colorData) {
    // Position new orbs in concentric circles based on mixArity
    const { mixArity } = colorData;
    let radius;
    let yOffset = 0.8; // Base Y for discovered orbs
    let orbsInRing = 0;
    let angleStep;
    // Position new orbs based on their mixArity using configured radii and Y-offsets
    radius = this.radiiConfig[mixArity] || this.radiiConfig[2]; // Default to 2-mix ring
    yOffset = this.baseRingYOffsets[mixArity] || this.baseRingYOffsets[2]; // Default to 2-mix Y
    // The initial position is somewhat arbitrary as recalculateRingLayout will adjust it.
    // We use a position that's roughly in the correct ring for the entry animation.
    // A simple angle like 0 or based on a non-critical count.
    const tempAngle = 0; 
    const position = new THREE.Vector3(
      Math.cos(tempAngle) * radius,
      yOffset, // Use the base Y for the ring
      Math.sin(tempAngle) * radius
    );
    // Check ring capacity
    const currentOrbsOfArity = this.orbManager.orbs.filter(
      orb => orb.colorData.mixArity === mixArity && !orb.colorData.isPrimary
    ).length;
    const capacity = this.orbRingCapacities[mixArity] || this.orbRingCapacities[2]; // Default to 2-mix capacity
    
    if (currentOrbsOfArity >= capacity) {
      console.log(`Ring for mixArity ${mixArity} is full. Color ${colorData.name} added to encyclopedia only.`);
      this.uiManager.showAchievement(`Ring Full! ${colorData.name} added to your Encyclopedia.`);
      return; // Do not create an orb
    }
    
    const newOrb = this.orbManager.createOrb(colorData, position, true); // Animate entry
    if (this.gameWorld && newOrb) {
        // Update camera zoom based on the new orb's ring radius
        this.gameWorld.updateCameraZoom(radius);
        // After the orb is created and added, recalculate the layout for its ring
        if (newOrb.colorData.mixArity >= 2) {
            this.orbManager.recalculateRingLayout(newOrb.colorData.mixArity);
        }
    }
  }
  // updateEncyclopediaWall() method removed as the 3D wall is gone.
  // The UI part is handled by: this.uiManager.updateEncyclopedia(...)
  updateProgressionRules() {
    const colorCount = this.colorSystem.getDiscoveredColors().length;    
    const oldMaxSelections = this.maxSelections;
    if (colorCount >= 25) {
      this.maxSelections = 4;
    } else if (colorCount >= 10) {
      this.maxSelections = 3;
    } else {
      this.maxSelections = 2;
    }
    // Show achievement message only when unlocking for the first time (i.e., maxSelections increased)
    if (this.maxSelections === 3 && oldMaxSelections === 2) {
      this.uiManager.showAchievement("3-Color Mixing Unlocked!");
    } else if (this.maxSelections === 4 && oldMaxSelections === 3) {
      this.uiManager.showAchievement("4-Color Mixing Unlocked!");
    }
    // If maxSelections potentially decreased due to some hypothetical scenario (like losing colors),
    // we might want to log it or inform the user, but for now, just setting it is fine.
    // Example: if (this.maxSelections < oldMaxSelections) { console.log("Max selections reduced."); }
    if (this.maxSelections !== oldMaxSelections) {
        console.log(`[ChromaLabGame.updateProgressionRules] Updated maxSelections from ${oldMaxSelections} to: ${this.maxSelections} based on ${colorCount} discovered colors.`);
    }
    
    this.checkMixingAvailable(); // Ensure mix button state is updated
  }

  clearSelection() {
    this.selectedColors.forEach(orb => this.orbManager.deselectOrb(orb));
    this.selectedColors = [];
    this.uiManager.updateSelectedColors(this.selectedColors);
    this.checkMixingAvailable();
    this.linePreviewSystem.clearPreview(); // Clear preview when selection is cleared
    this.orbManager.setTooltipsEnabled(true); // Re-enable tooltips when selection clears
  }

  // Event listeners specific to the game (after login)
  setupGameEventListeners() {
    window.addEventListener('resize', () => {
      if (this.gameWorld) this.gameWorld.handleResize();
    });
    
    // Add mix button functionality
    this.uiManager.onMixButtonClick(() => {
      this.mixSelectedColors();
    });
  }
  animate() {
    // The requestAnimationFrame for the main loop is now handled by globalAnimate()
    
    // Only update game elements if gameWorld is initialized
    if (this.gameWorld) {
        const deltaTime = this.gameWorld.clock.getDelta();
        
        if (this.orbManager) this.orbManager.update(deltaTime);
        if (this.particleSystem) this.particleSystem.update(deltaTime);
        if (this.linePreviewSystem) this.linePreviewSystem.update(deltaTime); // Added
        // TWEEN update is now in ColorOrbManager and GameWorld.updateCameraZoom
        // Make sure TWEEN.update() is called in the main loop if other systems use it directly.
        // For now, it's called in orbManager.update()
        this.gameWorld.render();
    }
  }
  // --- Supabase Interaction Methods ---
  // Note: initializePlayerAndLoadProgress is effectively replaced by handleLogin/handleSignup
  // and the subsequent calls in completeInitialization.
  // Player ID is now set during login/signup.
  async loadDiscoveredColors() {
    if (!this.playerId) return;
    const { data, error } = await supabase
      .from('player_discovered_colors')
      .select('color_hex, color_name, discovered_timestamp, mix_arity') // Add mix_arity
      .eq('player_id', this.playerId);
    if (error) {
      console.error('Error loading discovered colors:', error);
      return;
    }
    if (data && data.length > 0) {
      this.colorSystem.discoveredColors.clear(); 
      data.forEach(item => {
        let colorData = this.colorSystem.getColorByHex(item.color_hex);
        if (!colorData) {
            const rgb = this.colorSystem.hexToRgb(item.color_hex);
            const timestamp = item.discovered_timestamp ? new Date(item.discovered_timestamp).getTime() : Date.now();
            colorData = { 
                hex: item.color_hex, 
                name: item.color_name || `Custom ${item.color_hex}`,
                rgb: rgb,
                // Prioritize mix_arity from DB if available, otherwise fallback.
                // item.mix_arity could be null if the DB column was added after some data already existed.
                // A new color created by colorSystem.mixColors should have its mixArity correctly set.
                mixArity: typeof item.mix_arity === 'number' ? item.mix_arity : (this.colorSystem.getBaseColorArity(item.color_hex) || 2),
                discoveredTimestamp: timestamp,
                isPrimary: false, // Custom colors are not primary
                // isShadingColor and isSaturationModifier will be false by default for custom mixed colors
                // unless ColorSystem.mixColors specifically sets them.
            };
        }
        if (item.color_name && item.color_name !== colorData.name) {
            colorData.name = item.color_name;
        }
        this.colorSystem.addDiscoveredColor(colorData); 
      });
      const basePrimaryDefs = this.colorSystem.getInitialBaseColors();
      const primaryColorHexes = ['#FF0000', '#0000FF', '#FFFF00', '#FFFFFF', '#000000', '#A0A0A0', '#606060'];
      primaryColorHexes.forEach(hex => {
        const baseDef = basePrimaryDefs.find(bc => bc.hex === hex);
        if (baseDef) {
          const existingColor = this.colorSystem.discoveredColors.get(hex);
          if (existingColor) {
            const mergedColor = {
              ...baseDef,
              ...existingColor, // Data from DB takes precedence for user-specific fields
              name: existingColor.name || baseDef.name, // DB name or base def name
              discoveredTimestamp: existingColor.discoveredTimestamp || baseDef.discoveredTimestamp, // DB timestamp or base def
              mixArity: baseDef.mixArity, // CRITICAL: Ensure base definition's mixArity is used for primaries/base
              isPrimary: baseDef.isPrimary,
              isShadingColor: baseDef.isShadingColor,
              isSaturationModifier: baseDef.isSaturationModifier,
              // RGB will be handled below
            };
            // Explicitly ensure RGB is present and valid.
            // Priority: 1. Valid existingColor.rgb, 2. Valid baseDef.rgb, 3. Computed from hex.
            if (existingColor.rgb && Array.isArray(existingColor.rgb) && existingColor.rgb.length === 3) {
                mergedColor.rgb = existingColor.rgb;
            } else if (baseDef.rgb && Array.isArray(baseDef.rgb) && baseDef.rgb.length === 3) {
                mergedColor.rgb = baseDef.rgb;
            } else {
                console.warn(`[ChromaLabGame.loadDiscoveredColors] RGB missing for ${hex} in both existing and baseDef. Computing from hex.`);
                mergedColor.rgb = this.colorSystem.hexToRgb(hex);
            }
            // Final safety check: if RGB is still invalid (e.g., hexToRgb failed), use a default.
            if (!mergedColor.rgb || !Array.isArray(mergedColor.rgb) || mergedColor.rgb.length !== 3) {
                console.error(`[ChromaLabGame.loadDiscoveredColors] CRITICAL: Failed to establish valid RGB for ${mergedColor.hex}. Defaulting to black.`);
                mergedColor.rgb = [0, 0, 0]; // Emergency fallback RGB
            }
            
            this.colorSystem.discoveredColors.set(hex, mergedColor);
          } else {
            this.colorSystem.addDiscoveredColor(baseDef);
          }
        }
      });
    } else {
        this.colorSystem.initializeBaseColors();
    }
    const totalDiscovered = this.colorSystem.getDiscoveredColors().length;
    this.uiManager.updateColorCount(totalDiscovered);
    this.updateProgressionRules(); // Depends on totalDiscovered
    // Update collection achievements based on loaded colors & ensure ChallengeManager has playerId
    if (this.challengeManager) {
        if (!this.challengeManager.playerId && this.playerId) {
            this.challengeManager.setPlayerId(this.playerId); // Ensure CM has playerId if set late
        }
        this.challengeManager.updateProgress(null, totalDiscovered); // Pass null for newColorData as this is for collection
    }
    console.log('Discovered colors processed. Total after final check:', totalDiscovered);
    this.refreshChallengeRelatedDisplays(); // Update UI related to achievements/challenges
  }
  async saveDiscoveredColor(colorData) {
    if (!this.playerId) return;
    const { error } = await supabase
      .from('player_discovered_colors')
      .insert([{ 
        player_id: this.playerId, 
        color_hex: colorData.hex,
        color_name: colorData.name,
        discovered_timestamp: new Date(colorData.discoveredTimestamp).toISOString(),
        mix_arity: colorData.mixArity // Save the mixArity
      }]);
    if (error) {
      console.error('Error saving discovered color:', error.message);
      // Optionally notify user if critical, e.g. if RLS prevents insert and it's unexpected
      // this.uiManager.showAchievement('Save error for color: ' + colorData.name);
    } else {
        // console.log('Color saved:', colorData.name);
    }
  }
  async loadCompletedChallenges() {
    if (!this.playerId) return;
    const { data, error } = await supabase
      .from('player_completed_challenges')
      .select('challenge_id') // challenge_id is the color hex for now
      .eq('player_id', this.playerId);
    if (error) {
      console.error('Error loading completed challenges:', error);
      return;
    }
    if (data) {
      data.forEach(item => {
        this.challengeManager.completedChallenges.add(item.challenge_id);
      });
    }
    console.log('Completed challenges (legacy system) loaded:', this.challengeManager.completedChallenges ? this.challengeManager.completedChallenges.size : 'N/A');
    // Load player achievement progress from Supabase (new system)
    if (this.challengeManager && this.playerId) {
        await this.challengeManager.loadPlayerProgress(this.playerId);
    }
    // After loading, refresh UI:
    this.refreshChallengeRelatedDisplays();
  }
  async saveCompletedChallenge(challengeData) {
    if (!this.playerId || !challengeData || !challengeData.hex) return;
    const { error } = await supabase
      .from('player_completed_challenges')
      .insert([{ 
        player_id: this.playerId, 
        challenge_id: challengeData.hex, // Using hex as unique ID
        challenge_name: challengeData.name 
      }]);
    if (error) {
      console.error('Error saving completed challenge:', error.message);
    } else {
        // console.log('Challenge saved:', challengeData.name);
    }
  }
  handleUnsummonOrbRequest(orbToUnsummon) {
    console.log(`Request to unsummon orb: ${orbToUnsummon.colorData.name}`, orbToUnsummon);
    if (this.orbManager && orbToUnsummon) {
      const onOrbFullyRemoved = () => {
        this.uiManager.populateRingsManagementTab();
        this.uiManager.showAchievement(`${orbToUnsummon.colorData.name} unsummoned!`);
        // If the "Available Orbs" section for this orb's arity was open, refresh it.
        const arity = orbToUnsummon.colorData.mixArity;
        const availableOrbsSectionDiv = document.getElementById(`availableOrbsSection-${arity}`);
        const availableOrbsSortDropdown = document.getElementById(`availableOrbsSortDropdown-${arity}`);
        if (availableOrbsSectionDiv && availableOrbsSectionDiv.style.display === 'block' && availableOrbsSortDropdown) {
            this.uiManager.populateAvailableOrbsList(arity, availableOrbsSortDropdown.value);
        }
      };
      const success = this.orbManager.removeOrb(orbToUnsummon, onOrbFullyRemoved);
      
      if (!success) { // If removeOrb returns false (e.g., orb not found for initial processing)
        this.uiManager.showAchievement(`Failed to start unsummoning ${orbToUnsummon.colorData.name}.`);
      }
      // The populateRingsManagementTab and showAchievement calls are now handled by the callback.
    }
  }
  handleSummonOrbRequest(colorData, targetMixArity) {
    if (!this.orbManager || !this.colorSystem || !this.gameWorld || !this.uiManager) {
      console.error("[ChromaLabGame] Cannot handle summon request: Core systems not initialized.");
      if (this.uiManager) this.uiManager.showAchievement("Error: Could not summon orb. Game systems not ready.");
      return;
    }
    console.log(`[ChromaLabGame] Request to summon orb: ${colorData.name} to ring for arity ${targetMixArity}`);
    // Check ring capacity
    const currentOrbsOfArity = this.orbManager.orbs.filter(
      orb => orb.colorData.mixArity === targetMixArity && !orb.colorData.isPrimary
    ).length;
    const capacity = this.orbRingCapacities[targetMixArity] || this.orbRingCapacities[2]; // Default to 2-mix capacity
    if (currentOrbsOfArity >= capacity) {
      console.log(`Ring for mixArity ${targetMixArity} is full. Cannot summon ${colorData.name}.`);
      this.uiManager.showAchievement(`Ring Full! Cannot summon ${colorData.name}.`);
      return;
    }
    // Determine initial position (similar to createNewColorOrb)
    let radius = this.radiiConfig[targetMixArity] || this.radiiConfig[2];
    let yOffset = this.baseRingYOffsets[targetMixArity] || this.baseRingYOffsets[2];
    const tempAngle = Math.random() * Math.PI * 2; // Place at a random angle initially
    const position = new THREE.Vector3(
      Math.cos(tempAngle) * radius,
      yOffset,
      Math.sin(tempAngle) * radius
    );
    const newOrb = this.orbManager.createOrb(colorData, position, true); // Animate entry
    if (newOrb) {
      this.gameWorld.updateCameraZoom(radius);
      if (newOrb.colorData.mixArity >= 2) {
        this.orbManager.recalculateRingLayout(newOrb.colorData.mixArity);
      }
      this.uiManager.populateRingsManagementTab(); // Refresh the UI for rings
      this.uiManager.showAchievement(`${colorData.name} summoned to its ring!`);
      // After summoning, the "Available Orbs" list for that ring needs to be refreshed
      // because this color is now active and should no longer be in the "available to summon" list.
      // We can directly call it or let the user re-open the "Manage Orbs" section which triggers it.
      // For a better UX, let's try to refresh it if the section is visible.
      const availableOrbsSectionDiv = document.getElementById(`availableOrbsSection-${targetMixArity}`);
      const availableOrbsSortDropdown = document.getElementById(`availableOrbsSortDropdown-${targetMixArity}`);
      if (availableOrbsSectionDiv && availableOrbsSectionDiv.style.display === 'block' && availableOrbsSortDropdown) {
          this.uiManager.populateAvailableOrbsList(targetMixArity, availableOrbsSortDropdown.value);
      }
    } else {
      console.error(`[ChromaLabGame] Failed to create orb for ${colorData.name}.`);
      this.uiManager.showAchievement(`Failed to summon ${colorData.name}.`);
    }
  }
  // Calculates the Euclidean distance between two RGB colors.
  // Lower values mean more similar colors.
  calculateColorDifferenceRGB(rgb1, rgb2) {
    if (!rgb1 || !rgb2 || rgb1.length !== 3 || rgb2.length !== 3) {
      return Infinity; // Invalid input
    }
    const dr = rgb1[0] - rgb2[0];
    const dg = rgb1[1] - rgb2[1];
    const db = rgb1[2] - rgb2[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }
  handlePlayerOneBattleMixResult(mixedColorData, targetColorData) {
    if (!mixedColorData || !targetColorData) {
        console.log("[Battle] P1 Mix evaluation: Invalid data provided.");
        // UIManager handles displaying "Mix Failed"
        return;
    }
    console.log(`[Battle] P1 Mixed: ${mixedColorData.name} (${mixedColorData.hex}), Target: ${targetColorData.name} (${targetColorData.hex})`);
    const difference = this.calculateColorDifferenceRGB(mixedColorData.rgb, targetColorData.rgb);
    console.log(`[Battle] P1 Mix Difference: ${difference}`);
    // This block handles logic for Player 1's performance.
    // If this is a multiplayer game AND the local player IS Player 1, broadcast this attempt.
    if (this.currentSessionData && this.isLocalPlayerOne && this.battleChannelSubscription) {
      console.log('[Battle Sync] Broadcasting P1 attempt for player_id:', this.playerId);
      this.battleChannelSubscription.send({
        type: 'broadcast',
        event: 'battle_event', // Changed from 'battle_attempt'
        payload: {
          playerId: this.currentSessionData.player_one_id, // Identify as P1's attempt
          mixedColorData: mixedColorData,
          difference: difference,
          isReadySignal: false, // Not a ready signal
        },
      });
    }
    if (difference < (this.playerOneBestAttempt ? this.playerOneBestAttempt.difference : Infinity)) {
        this.playerOneBestAttempt = { colorData: mixedColorData, difference: difference };
        this.playerOneBattleScore = difference; // Update score to the new best difference
        console.log(`[Battle] P1 New Best Attempt: ${mixedColorData.name}, Difference: ${difference}, Score: ${this.playerOneBattleScore}`);
        // Only show "Best attempt" for local player's own P1 mixes
        if (!this.currentSessionData || this.isLocalPlayerOne) {
          this.uiManager.showAchievement("P1: Best attempt so far!");
        }
        if (this.uiManager) {
            this.uiManager.updatePlayerOneBattleScoreDisplay(this.playerOneBattleScore);
        }
    } else {
        if (!this.currentSessionData || this.isLocalPlayerOne) {
          this.uiManager.showAchievement("P1: Not closer than your best.");
        }
    }
  }
  handlePlayerTwoBattleMixResult(mixedColorData, targetColorData) {
    if (!mixedColorData || !targetColorData) {
        console.log("[Battle] P2 Mix evaluation: Invalid data provided.");
        return;
    }
    console.log(`[Battle] P2 Mixed: ${mixedColorData.name} (${mixedColorData.hex}), Target: ${targetColorData.name} (${targetColorData.hex})`);
    const difference = this.calculateColorDifferenceRGB(mixedColorData.rgb, targetColorData.rgb);
    console.log(`[Battle] P2 Mix Difference: ${difference}`);
    // This block handles logic for Player 2's performance.
    // If this is a multiplayer game AND the local player IS Player 2, broadcast this attempt.
    if (this.currentSessionData && !this.isLocalPlayerOne && this.battleChannelSubscription) {
        console.log('[Battle Sync] Broadcasting P2 attempt for player_id:', this.playerId);
        this.battleChannelSubscription.send({
            type: 'broadcast',
            event: 'battle_event', // Changed from 'battle_attempt'
            payload: {
                playerId: this.currentSessionData.player_two_id, // Identify as P2's attempt
                mixedColorData: mixedColorData,
                difference: difference,
                isReadySignal: false, // Not a ready signal
            },
        });
    }
    if (difference < (this.playerTwoBestAttempt ? this.playerTwoBestAttempt.difference : Infinity)) {
        this.playerTwoBestAttempt = { colorData: mixedColorData, difference: difference };
        this.playerTwoBattleScore = difference; // Update score to the new best difference
        console.log(`[Battle] P2 New Best Attempt: ${mixedColorData.name}, Difference: ${difference}, Score: ${this.playerTwoBattleScore}`);
        // Only show "Best attempt" for local player's own P2 mixes
        if (!this.currentSessionData || !this.isLocalPlayerOne) {
            this.uiManager.showAchievement("P2: Best attempt so far!");
        }
        if (this.uiManager && typeof this.uiManager.updatePlayerTwoBattleScoreDisplay === 'function') {
            this.uiManager.updatePlayerTwoBattleScoreDisplay(this.playerTwoBattleScore);
        }
    } else {
        if (!this.currentSessionData || !this.isLocalPlayerOne) {
            this.uiManager.showAchievement("P2: Not closer than your best.");
        }
    }
  }
  // This function is called from UIManager when the battle mode ends (e.g. timer expiry)
  handleBattleEnd(reason) {
    console.log(`[Battle End] Battle ended. Reason: ${reason}.`);
    console.log(`[Battle End] Player ID: ${this.playerId}, Is Local Player One: ${this.isLocalPlayerOne}`);
    console.log(`[Battle End] Current Session Data:`, this.currentSessionData ? { id: this.currentSessionData.id, p1: this.currentSessionData.player_one_id, p2: this.currentSessionData.player_two_id } : 'No session data');
    // Detailed logging for player one's best attempt state
    if (this.playerOneBestAttempt) {
        console.log(`[Battle End] P1 Best Attempt (locally stored): Name: ${this.playerOneBestAttempt.colorData.name}, Hex: ${this.playerOneBestAttempt.colorData.hex}, Difference: ${this.playerOneBestAttempt.difference}`);
    } else {
        console.log("[Battle End] P1 Best Attempt (locally stored): No successful mixes recorded.");
    }
    // Detailed logging for player two's best attempt state
    if (this.playerTwoBestAttempt) {
        console.log(`[Battle End] P2 Best Attempt (locally stored): Name: ${this.playerTwoBestAttempt.colorData.name}, Hex: ${this.playerTwoBestAttempt.colorData.hex}, Difference: ${this.playerTwoBestAttempt.difference}`);
    } else {
        console.log("[Battle End] P2 Best Attempt (locally stored): No successful mixes recorded.");
    }
    // Target color information
    if(this.currentBattleTargetColor) {
        console.log(`[Battle End] Target Color: Name: ${this.currentBattleTargetColor.name}, Hex: ${this.currentBattleTargetColor.hex}`);
    } else {
        console.log("[Battle End] Target Color: Not set or unavailable.");
    }
    // Determine winner
    let winnerMessage = "Battle Over! ";
    const p1Diff = this.playerOneBestAttempt ? this.playerOneBestAttempt.difference : Infinity;
    const p2Diff = this.playerTwoBestAttempt ? this.playerTwoBestAttempt.difference : Infinity;
    if (p1Diff === Infinity && p2Diff === Infinity) {
        winnerMessage += "No one made a mix!";
    } else if (p1Diff < p2Diff) {
        winnerMessage += "Player 1 Wins!";
    } else if (p2Diff < p1Diff) {
        winnerMessage += "Player 2 Wins!";
    } else { // p1Diff === p2Diff (includes both being non-Infinity and equal)
        winnerMessage += "It's a Draw!";
    }
    // Call UIManager to display the battle results screen
    this.uiManager.displayBattleResults(
      this.playerOneBestAttempt,
      this.playerTwoBestAttempt,
      this.currentBattleTargetColor,
      winnerMessage
    );
    this.uiManager.showBattleModeScreen(false); // Auto-close battle mode screen
    if (this.battleChannelSubscription) {
      this.battleChannelSubscription.unsubscribe();
      this.battleChannelSubscription = null;
      console.log('[Battle Sync] Unsubscribed from battle broadcast channel.');
    }
    
    // Determine a data-friendly winner status for battle_records.winner (text)
    let winnerTextStatus = 'draw'; // For battle_records table
    let winnerIdForSession = null; // For game_sessions table (UUID)
    if (p1Diff === Infinity && p2Diff === Infinity) {
        winnerTextStatus = 'none';
    } else if (p1Diff < p2Diff) {
        winnerTextStatus = 'player_one';
        if (this.currentSessionData) winnerIdForSession = this.currentSessionData.player_one_id;
        else if (this.playerId) winnerIdForSession = this.playerId; // Local P1 win
    } else if (p2Diff < p1Diff) {
        winnerTextStatus = 'player_two';
        if (this.currentSessionData) winnerIdForSession = this.currentSessionData.player_two_id;
        // No local P2 win case for winnerIdForSession unless P2 is also a logged-in user, which isn't current model
    }
    
    const battleRecord = {
        session_id: this.currentSessionData ? this.currentSessionData.id : null,
        player_one_id: this.currentSessionData ? this.currentSessionData.player_one_id : this.playerId, 
        player_two_id: this.currentSessionData ? this.currentSessionData.player_two_id : null, 
        player_one_best_mix_hex: this.playerOneBestAttempt ? this.playerOneBestAttempt.colorData.hex : null,
        player_one_best_mix_name: this.playerOneBestAttempt ? this.playerOneBestAttempt.colorData.name : null,
        player_one_difference: this.playerOneBestAttempt ? this.playerOneBestAttempt.difference : null,
        player_two_best_mix_hex: this.playerTwoBestAttempt ? this.playerTwoBestAttempt.colorData.hex : null,
        player_two_best_mix_name: this.playerTwoBestAttempt ? this.playerTwoBestAttempt.colorData.name : null,
        player_two_difference: this.playerTwoBestAttempt ? this.playerTwoBestAttempt.difference : null,
        target_color_hex: this.currentBattleTargetColor ? this.currentBattleTargetColor.hex : null,
        target_color_name: this.currentBattleTargetColor ? this.currentBattleTargetColor.name : null,
        winner: winnerTextStatus, // Using text status for battle_records table
        battle_timestamp: new Date().toISOString(),
        // created_at is handled by DB default
    };
    if (this.currentSessionData) {
        // Update game session in Supabase with winner_id (UUID) and status
        this.updateGameSessionOnBattleEnd(this.currentSessionData.id, winnerIdForSession, 'completed');
    }
    this.saveBattleRecord(battleRecord); 
    this.currentSessionData = null; 
    this.isLocalPlayerOne = null;
  }
  async saveBattleRecord(recordData) {
    if (!this.playerId) {
      console.warn('[ChromaLabGame] Cannot save battle record: Player ID not available.');
      return;
    }
    // Ensure player_one_id is correctly set if not already in recordData
    if (!recordData.player_one_id) {
        recordData.player_one_id = this.playerId;
    }
    console.log('[ChromaLabGame] Saving battle record:', recordData);
    try {
      const { data, error } = await supabase
        .from('battle_records') // Assuming this table exists
        .insert([recordData]);
      if (error) {
        console.error('Error saving battle record:', error.message, error.details);
        // Optionally, notify the user via UI if save fails critically
        // this.uiManager.showAchievement('Failed to save battle result.');
      } else {
        console.log('Battle record saved successfully:', data);
        // this.uiManager.showAchievement('Battle result saved!'); 
      }
    } catch (e) {
      console.error('Exception during battle record save:', e);
    }
  }
  async updateGameSessionOnBattleEnd(sessionId, winnerId, status) {
    if (!sessionId) return;
    try {
        const { data, error } = await supabase
            .from('game_sessions')
            .update({ 
                winner_id: winnerId, 
                status: status,
                // Optionally, store target_color_hex and target_color_name if not already set at session creation
                target_color_hex: this.currentBattleTargetColor ? this.currentBattleTargetColor.hex : null,
                target_color_name: this.currentBattleTargetColor ? this.currentBattleTargetColor.name : null,
            })
            .eq('id', sessionId);
        if (error) {
            console.error(`[Lobby] Error updating game session ${sessionId} on battle end:`, error);
        } else {
            console.log(`[Lobby] Game session ${sessionId} updated successfully on battle end.`, data);
        }
    } catch (e) {
        console.error(`[Lobby] Exception updating game session ${sessionId} on battle end:`, e);
    }
  }
  // --- Lobby System Methods ---
  async enterLobby() {
    if (!this.playerId) {
      this.uiManager.updateLobbyStatus("Error: You must be logged in to enter the lobby.");
      console.error("[Lobby] Player not logged in.");
      return;
    }
    this.uiManager.updateLobbyStatus("Searching for an available game...");
    await this.#findOrCreateSession();
  }
  async #findOrCreateSession() {
    if (!this.playerId) return;
    try {
      // Try to find an open session to join
      const { data: openSessions, error: findError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('status', 'waiting_for_opponent')
        .is('player_two_id', null)
        .not('player_one_id', 'eq', this.playerId) // Don't join your own waiting session
        .limit(1);
      if (findError) throw findError;
      if (openSessions && openSessions.length > 0) {
        const sessionToJoin = openSessions[0];
        this.uiManager.updateLobbyStatus(`Found game ${sessionToJoin.id.substring(0,6)}... Attempting to join...`);
        console.log(`[Lobby] Attempting to join session: ${sessionToJoin.id} as player ${this.playerId}`);
        // Conditional update: only join if P2 slot is null and status is waiting
        const { data: updatedSession, error: joinError } = await supabase
          .from('game_sessions')
          .update({ player_two_id: this.playerId, status: 'in_progress' })
          .eq('id', sessionToJoin.id)
          .eq('status', 'waiting_for_opponent') // Must still be waiting
          .is('player_two_id', null)          // P2 slot must still be null
          .select()
          .single();
        if (joinError) { // Errors like network issues, RLS constraint violations (other than "0 rows")
            console.error('[Lobby] Error during conditional join attempt:', joinError);
            this.uiManager.updateLobbyStatus(`Error joining game: ${joinError.message}. Retrying search...`);
            setTimeout(() => this.#findOrCreateSession(), 1500 + Math.random() * 1000); // Retry after delay
            return;
        }
        if (updatedSession && updatedSession.player_two_id === this.playerId) {
          // Successfully joined THIS session as Player 2
          this.currentSessionId = updatedSession.id;
          this.isLocalPlayerOne = false; // This player is P2
          this.currentSessionData = updatedSession; // Store full session data
          
          this.uiManager.updateLobbyStatus("Successfully joined! Starting game...");
          console.log(`[Lobby] Successfully joined session: ${updatedSession.id}. Player ${this.playerId} is Player 2. P1: ${updatedSession.player_one_id}, Target: ${updatedSession.target_color_hex}`);
          
          this.uiManager.showLobbyScreen(false);
          this.uiManager.showBattleModeScreen(true, this.currentSessionData, this.isLocalPlayerOne);
          this.#subscribeToSessionChanges(this.currentSessionId); // P2 also subscribes
        } else {
          // Join failed because session was taken or state changed (updatedSession is null or P2 isn't me)
          console.log(`[Lobby] Could not join session ${sessionToJoin.id}. It might have been taken or its status changed. Retrying search...`);
          this.uiManager.updateLobbyStatus("Game was taken. Searching for another...");
          setTimeout(() => this.#findOrCreateSession(), 500 + Math.random() * 500); // Retry quickly
        }
      } else {
        // No open sessions, create a new one
        await this.#createNewSession();
      }
    } catch (error) {
      console.error('[Lobby] Error in findOrCreateSession:', error);
      this.uiManager.updateLobbyStatus(`Lobby Error: ${error.message}`);
    }
  }
  async #createNewSession() {
    if (!this.playerId) return;
    this.uiManager.updateLobbyStatus("No open games. Creating a new one and waiting for an opponent...");
    console.log("[Lobby] Creating new session...");
    try {
      // 1. Generate the target color for this new session
      const targetColorForSession = this._selectRandomBattleTargetColor();
      if (!targetColorForSession || !targetColorForSession.hex || !targetColorForSession.rgb) {
          console.error("[Lobby] Critical error: Failed to generate a target color for new session. Aborting session creation.");
          this.uiManager.updateLobbyStatus("Error: Could not set up game target. Please try again.");
          return;
      }
      console.log(`[Lobby] Generated target color for new session: ${targetColorForSession.name} (${targetColorForSession.hex})`);
      const { data: newSession, error: createError } = await supabase
        .from('game_sessions')
        .insert({ 
            player_one_id: this.playerId, 
            status: 'waiting_for_opponent',
            target_color_hex: targetColorForSession.hex,
            target_color_name: targetColorForSession.name,
            target_color_r: targetColorForSession.rgb[0],
            target_color_g: targetColorForSession.rgb[1],
            target_color_b: targetColorForSession.rgb[2]
        })
        .select()
        .single();
      if (createError) throw createError;
      if (newSession) {
        this.currentSessionId = newSession.id;
        this.isLocalPlayerOne = true; // Player creating the session is Player 1
        this.currentSessionData = newSession; // Store the full session data for P1
        // Store the generated target color locally immediately for P1.
        // P2 will get it from newSession data when they join and prepareForBattle.
        this.currentBattleTargetColor = targetColorForSession; 
        this.uiManager.updateLobbyStatus(`Game created (ID: ${newSession.id.substring(0,6)}). Waiting for an opponent...`);
        console.log(`[Lobby] New session created: ${this.currentSessionId}. Player ${this.playerId} is Player 1. Target: ${targetColorForSession.hex}`);
        this.#subscribeToSessionChanges(this.currentSessionId);
        // Start polling as a fallback for P1
        if (this.waitingForOpponentInterval) {
          clearInterval(this.waitingForOpponentInterval);
        }
        this.waitingForOpponentInterval = setInterval(
          () => this.#checkIfOpponentJoined(),
          5000 // Check every 5 seconds
        );
        console.log(`[Lobby] P1 (creator) started polling interval for session ${this.currentSessionId}`);
      }
    } catch (error) {
        console.error('[Lobby] Error creating new session:', error);
        this.uiManager.updateLobbyStatus(`Error creating game: ${error.message}`);
    }
  }
  #subscribeToSessionChanges(sessionId) {
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
      this.sessionSubscription = null;
    }
    console.log(`[Lobby] Subscribing to changes for session: ${sessionId}`);
    this.sessionSubscription = supabase
      .channel(`game_session:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
        (payload) => this.#handleSessionUpdate(payload)
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Lobby] Successfully subscribed to session ${sessionId}`);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`[Lobby] Subscription error for session ${sessionId}:`, status, err);
          this.uiManager.updateLobbyStatus(`Connection issue: ${err?.message || 'Failed to listen for opponent'}. Please try again.`);
          // Optionally try to resubscribe or guide user to cancel/retry
        }
      });
  }
  #handleSessionUpdate(payload) {
    console.log('[Lobby] Session update received:', payload);
    const updatedSession = payload.new;
    if (updatedSession && updatedSession.id === this.currentSessionId) {
      if (updatedSession.status === 'in_progress' && updatedSession.player_two_id) {
        if (this.waitingForOpponentInterval) { // P1 specific
          clearInterval(this.waitingForOpponentInterval);
          this.waitingForOpponentInterval = null;
          console.log('[Lobby] Cleared P1 polling interval: P2 join detected via subscription.');
        }
        this.uiManager.updateLobbyStatus("Opponent joined! Starting game...");
        console.log(`[Lobby] Opponent ${updatedSession.player_two_id} joined session ${this.currentSessionId}.`);
        if (this.sessionSubscription) {
          this.sessionSubscription.unsubscribe();
          this.sessionSubscription = null;
        }
        // Player 1 (session creator) gets here when P2 joins.
        this.currentSessionData = updatedSession; // P1 updates its session data
        // this.isLocalPlayerOne should already be true for P1
        this.uiManager.showLobbyScreen(false);
        this.uiManager.showBattleModeScreen(true, this.currentSessionData, this.isLocalPlayerOne);
      } else if (updatedSession.status === 'cancelled') {
        if (this.waitingForOpponentInterval) { // P1 specific
          clearInterval(this.waitingForOpponentInterval);
          this.waitingForOpponentInterval = null;
          console.log('[Lobby] Cleared P1 polling interval: Session cancelled via subscription.');
        }
        this.uiManager.updateLobbyStatus("The game session was cancelled.");
        console.log(`[Lobby] Session ${this.currentSessionId} was cancelled.`);
        if (this.sessionSubscription) {
          this.sessionSubscription.unsubscribe();
          this.sessionSubscription = null;
        }
        this.currentSessionId = null;
        // UIManager might need a button to go back or try again from this state.
        // For now, cancel button handles leaving the lobby screen.
      }
    }
  }
  async leaveLobby() {
    console.log("[Lobby] Attempting to leave lobby.");
    if (this.waitingForOpponentInterval) { // P1 specific
      clearInterval(this.waitingForOpponentInterval);
      this.waitingForOpponentInterval = null;
      console.log("[Lobby] Cleared P1 polling interval: Leaving lobby.");
    }
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
      this.sessionSubscription = null;
      console.log("[Lobby] Unsubscribed from session DB changes.");
    }
    if (this.battleChannelSubscription) { // Also clean up battle channel if leaving lobby mid-setup
      this.battleChannelSubscription.unsubscribe();
      this.battleChannelSubscription = null;
      console.log("[Lobby] Unsubscribed from battle broadcast channel.");
    }
    if (this.currentSessionId) {
        // Check if this player is player_one and the game is still waiting
        // This check should ideally be more robust, perhaps fetching the session state first
        // or relying on RLS to only allow cancellation if appropriate.
        // For simplicity, we'll try to update if currentSessionId is set.
        // RLS policies should prevent unauthorized updates.
      try {
        const { data, error } = await supabase
          .from('game_sessions')
          .update({ status: 'cancelled' })
          .eq('id', this.currentSessionId)
          .eq('player_one_id', this.playerId) // Only player_one can cancel their waiting game
          .eq('status', 'waiting_for_opponent') // Only cancel if waiting
          .select();
        if (error) {
            // Errors here could be benign (e.g. RLS prevented if P2 already joined, or not P1)
            console.warn(`[Lobby] Could not cancel session ${this.currentSessionId} (may have been joined or not owned):`, error.message);
        } else if (data && data.length > 0) {
            console.log(`[Lobby] Session ${this.currentSessionId} marked as cancelled.`);
        } else {
            console.log(`[Lobby] Session ${this.currentSessionId} was not cancelled by this action (already joined, not owned, or already cancelled).`);
        }
      } catch (e) {
        console.error(`[Lobby] Exception while trying to cancel session ${this.currentSessionId}:`, e);
      }
    }
    this.currentSessionId = null;
    this.currentSessionData = null; // Ensure session data is cleared
    this.isLocalPlayerOne = null;   // Reset player role
    this.uiManager.updateLobbyStatus("Lobby closed."); 
    console.log("[Lobby] Left lobby and cleaned up states.");
  }
  async #checkIfOpponentJoined() {
    // Stop polling if:
    // 1. There's no active session ID for P1 to monitor.
    // 2. This client is not Player 1.
    // 3. The currentSessionData ALREADY indicates P2 has joined and game is in progress (handled by subscription or previous poll).
    if (!this.currentSessionId || !this.isLocalPlayerOne || 
        (this.currentSessionData && this.currentSessionData.player_two_id && this.currentSessionData.status === 'in_progress')) {
      if (this.waitingForOpponentInterval) {
        clearInterval(this.waitingForOpponentInterval);
        this.waitingForOpponentInterval = null;
      }
      return;
    }
    console.log(`[Lobby Polling] P1 checking session ${this.currentSessionId} for opponent...`);
    try {
      const { data: sessionData, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', this.currentSessionId)
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116 means session not found
        console.error('[Lobby Polling] Error fetching session state:', error);
        if (error.code === 'PGRST116' || error.message.includes("JSON object requested, multiple (or no) rows returned")) { // Session not found or other critical fetch error
          console.warn(`[Lobby Polling] Session ${this.currentSessionId} not found or invalid. Stopping poll and cleaning up.`);
          this.#handleLobbyCleanupOnPollOutcome("Session not found or invalid.");
        }
        return;
      }
      if (sessionData) {
        if (sessionData.status === 'in_progress' && sessionData.player_two_id) {
          console.log(`[Lobby Polling] Opponent ${sessionData.player_two_id} detected for session ${this.currentSessionId} via polling.`);
          
          if (this.waitingForOpponentInterval) {
            clearInterval(this.waitingForOpponentInterval);
            this.waitingForOpponentInterval = null;
          }
          if (this.sessionSubscription) { // Unsubscribe from push, as poll has taken over
            this.sessionSubscription.unsubscribe();
            this.sessionSubscription = null;
            console.log('[Lobby Polling] Unsubscribed from session DB changes (poll found P2).');
          }
          this.currentSessionData = sessionData; // Update P1's session data
          // this.isLocalPlayerOne should already be true
          
          this.uiManager.updateLobbyStatus("Opponent joined! Starting game (detected by poll)...");
          this.uiManager.showLobbyScreen(false);
          this.uiManager.showBattleModeScreen(true, this.currentSessionData, this.isLocalPlayerOne);
        } else if (sessionData.status === 'cancelled') {
          console.log(`[Lobby Polling] Session ${this.currentSessionId} detected as cancelled via polling.`);
          this.#handleLobbyCleanupOnPollOutcome("Session cancelled.");
        }
      } else { // sessionData is null (e.g. PGRST116 but error was ignored by condition, or other issue)
          console.warn(`[Lobby Polling] Session ${this.currentSessionId} data is null. Assuming cancelled or error.`);
          this.#handleLobbyCleanupOnPollOutcome("Session data missing.");
      }
    } catch (err) {
      console.error('[Lobby Polling] Exception in #checkIfOpponentJoined:', err);
    }
  }
  #handleLobbyCleanupOnPollOutcome(reason) {
    console.log(`[Lobby Polling] Cleaning up P1 state for session ${this.currentSessionId}. Reason: ${reason}`);
    if (this.waitingForOpponentInterval) {
        clearInterval(this.waitingForOpponentInterval);
        this.waitingForOpponentInterval = null;
    }
    if (this.sessionSubscription) {
        this.sessionSubscription.unsubscribe();
        this.sessionSubscription = null;
    }
    
    const wasWaitingInLobby = this.currentSessionId !== null && 
                             this.uiManager && this.uiManager.lobbyScreen && 
                             this.uiManager.lobbyScreen.style.display !== 'none';
    this.currentSessionId = null;
    this.currentSessionData = null;
    this.isLocalPlayerOne = null; 
    if (wasWaitingInLobby) {
        this.uiManager.updateLobbyStatus(`Session invalid or ended: ${reason}. Please try finding/creating a new game.`);
        // Player might need to click "Cancel Lobby" then "Find Game" again.
        // The UIManager's cancelLobbyButton handler in uiManager.js should manage UI reset from lobby.
    }
    console.log("[Lobby Polling] P1 state cleaned up due to poll outcome.");
  }
  handleOpponentBattleAttempt(payload) {
    console.log('[Battle Sync] Received opponent event:', payload);
    if (!this.currentSessionData || !payload.playerId) return;
    // Handle ready signals
    if (payload.isReadySignal) {
        console.log(`[Battle Sync] Received ready signal from player ${payload.playerId}`);
        if (payload.playerId === this.currentSessionData.player_one_id && payload.playerId !== this.playerId) {
            this.playerOneReadyForBattle = true;
            console.log('[Battle Sync] Player 1 (opponent) is ready.');
            this.uiManager.updateOpponentReadyStatus('player_one', true);
        } else if (payload.playerId === this.currentSessionData.player_two_id && payload.playerId !== this.playerId) {
            this.playerTwoReadyForBattle = true;
            console.log('[Battle Sync] Player 2 (opponent) is ready.');
            this.uiManager.updateOpponentReadyStatus('player_two', true);
        }
        this.checkAndStartBattleIfBothReady();
        return; // Don't process as a mix attempt
    }
    // Handle mix attempts (existing logic)
    const opponentData = payload; // Contains playerId, mixedColorData, difference
    if (opponentData.playerId === this.currentSessionData.player_one_id && opponentData.playerId !== this.playerId) {
      if (opponentData.difference < (this.playerOneBestAttempt ? this.playerOneBestAttempt.difference : Infinity)) {
        this.playerOneBestAttempt = { colorData: opponentData.mixedColorData, difference: opponentData.difference };
        console.log(`[Battle Sync] Updated P1 (Opponent) Best Attempt: ${opponentData.mixedColorData.name}, Diff: ${opponentData.difference}`);
      }
      this.uiManager.updateOpponentMixDisplay('player_one', opponentData.mixedColorData, opponentData.difference);
    } else if (opponentData.playerId === this.currentSessionData.player_two_id && opponentData.playerId !== this.playerId) {
      if (opponentData.difference < (this.playerTwoBestAttempt ? this.playerTwoBestAttempt.difference : Infinity)) {
        this.playerTwoBestAttempt = { colorData: opponentData.mixedColorData, difference: opponentData.difference };
        console.log(`[Battle Sync] Updated P2 (Opponent) Best Attempt: ${opponentData.mixedColorData.name}, Diff: ${opponentData.difference}`);
      }
      this.uiManager.updateOpponentMixDisplay('player_two', opponentData.mixedColorData, opponentData.difference);
    }
  }
  localPlayerClickedReady() {
    if (!this.currentSessionData || !this.battleChannelSubscription) {
        console.warn("[Battle Readiness] Cannot signal ready: No session or battle channel.");
        // Could be a local game, handle appropriately if needed (e.g. just start)
        if (!this.currentSessionData) { // Purely local game, no opponent
            this.playerOneReadyForBattle = true; // Assume local player is P1
            this.playerTwoReadyForBattle = true; // No P2 to wait for
            this.checkAndStartBattleIfBothReady();
        }
        return;
    }
    let localPlayerIdentifier;
    if (this.isLocalPlayerOne) {
        this.playerOneReadyForBattle = true;
        localPlayerIdentifier = this.currentSessionData.player_one_id;
        console.log('[Battle Readiness] Local Player 1 clicked ready.');
    } else {
        this.playerTwoReadyForBattle = true;
        localPlayerIdentifier = this.currentSessionData.player_two_id;
        console.log('[Battle Readiness] Local Player 2 clicked ready.');
    }
    // Broadcast readiness
    console.log(`[Battle Sync] Broadcasting ready signal for player ${localPlayerIdentifier}`);
    this.battleChannelSubscription.send({
        type: 'broadcast',
        event: 'battle_event', // Generic event type, payload differentiates
        payload: {
            playerId: localPlayerIdentifier,
            isReadySignal: true,
        },
    });
    this.uiManager.updateLocalPlayerReadyButtonState(true); // Inform UI to update local ready button
    this.checkAndStartBattleIfBothReady();
  }
  checkAndStartBattleIfBothReady() {
    console.log(`[Battle Readiness] Checking readiness: P1: ${this.playerOneReadyForBattle}, P2: ${this.playerTwoReadyForBattle}`);
    if (this.playerOneReadyForBattle && this.playerTwoReadyForBattle) {
        console.log('[Battle Readiness] Both players ready! Starting battle procedures.');
        // Potentially send one last "confirm_start" broadcast to sync perfectly,
        // or assume reliable delivery of ready signals is enough.
        // For now, assume ready signals are sufficient.
        if (this.battleChannelSubscription && this.currentSessionData) {
             this.battleChannelSubscription.send({
                type: 'broadcast',
                event: 'battle_event',
                payload: {
                    isBattleStartingSignal: true,
                    // Can include server timestamp if desired for perfect sync
                },
            });
        }
        this.uiManager.enableBattleModeInteractionsAndStartTimer();
        this.battleHasActuallyStarted = true; // Battle is now officially started
        console.log('[Battle Readiness] Battle has actually started.');
    } else {
        console.log('[Battle Readiness] Still waiting for one or more players.');
    }
  }
  isBattleGameStarted() {
    return this.battleHasActuallyStarted && this.uiManager.isBattleModeActive;
  }
  resetToMainMenu() {
    console.log('[ChromaLabGame] Resetting to Main Menu / Discovery Mode.');
    
    this.uiManager.isBattleModeActive = false; // Ensure UIManager knows battle is over
    this.uiManager.showBattleModeScreen(false);
    this.uiManager.showLobbyScreen(false);
    if (this.uiManager && typeof this.uiManager.showBattleResultsScreen === 'function') {
      this.uiManager.showBattleResultsScreen(false); // Explicitly hide results
    } else {
      console.warn('[ChromaLabGame] UIManager.showBattleResultsScreen() method is not available. Battle results screen might not be hidden as expected during reset.');
    }
    // Ensure the main game area is interactive.
    // UIManager's showGameArea should handle making it visible.
    // Explicitly ensure pointer events are re-enabled for the game area.
    if (this.uiManager && this.uiManager.gameArea) {
        this.uiManager.gameArea.style.pointerEvents = ''; // Revert to CSS default
        this.uiManager.gameArea.style.filter = 'none'; // Ensure blur is removed
    }
    this.uiManager.showGameArea(this.username); // Show the main game area (discovery mode)
    // Reset game state variables related to battle
    this.currentBattleTargetColor = null;
    this.playerOneReadyForBattle = false;
    this.playerTwoReadyForBattle = false;
    this.battleHasActuallyStarted = false;
    this.playerOneBestAttempt = null;
    this.playerTwoBestAttempt = null;
    this.playerOneBattleScore = Infinity;
    this.playerTwoBattleScore = Infinity;
    // Clean up Supabase subscriptions
    if (this.battleChannelSubscription) {
      this.battleChannelSubscription.unsubscribe();
      this.battleChannelSubscription = null;
      console.log('[ChromaLabGame] Unsubscribed from battle broadcast channel.');
    }
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
      this.sessionSubscription = null;
      console.log('[ChromaLabGame] Unsubscribed from session DB changes.');
    }
     if (this.waitingForOpponentInterval) {
      clearInterval(this.waitingForOpponentInterval);
      this.waitingForOpponentInterval = null;
    }
    // Clear session data
    this.currentSessionId = null;
    this.currentSessionData = null;
    this.isLocalPlayerOne = null;
    // Reset UI elements within battle mode (e.g., button texts, scores)
    // This is crucial so if player re-enters battle mode, it's fresh.
    this.uiManager.resetBattleModeUIElements();
    // Ensure orb selections are cleared if any were made during battle
    this.clearSelection(); // This handles deselecting orbs and updating mix button status
    this.updateProgressionRules(); // Recalculate max selections for discovery mode, also updates mix button
    
    // Explicitly update the color count display for discovery mode
    const totalDiscovered = this.colorSystem.getDiscoveredColors().length;
    this.uiManager.updateColorCount(totalDiscovered);
    // Explicitly re-initialize the mix button click handler in case it was lost during UI transitions.
    // This assumes this.uiManager.onMixButtonClick can be safely called multiple times
    // or handles re-binding appropriately.
    if (this.uiManager && typeof this.uiManager.onMixButtonClick === 'function') {
        this.uiManager.onMixButtonClick(() => {
            this.mixSelectedColors();
        });
        console.log('[ChromaLabGame] Mix button click handler re-initialized.');
    }
    console.log('[ChromaLabGame] State reset for Main Menu complete.');
  }
  async cancelBattleMatch() {
    console.log('[ChromaLabGame] Player initiated Cancel Match.');
    if (this.isBattleGameStarted()) {
      console.warn('[ChromaLabGame] Cancel clicked but game already started. This should be a forfeit. Ignoring cancel.');
      // Optionally, treat as forfeit: await this.forfeitBattle();
      return;
    }
    // If this player was P1 and waiting for an opponent in a session they created.
    if (this.currentSessionData && this.isLocalPlayerOne && this.currentSessionData.status === 'waiting_for_opponent') {
      console.log('[ChromaLabGame] P1 cancelling their own waiting session.');
      await this.leaveLobby(); // leaveLobby handles DB update and local cleanup
    } 
    // If P2 cancels, or P1 cancels after P2 joined but before game started
    else if (this.currentSessionData) {
      console.log(`[ChromaLabGame] Player ${this.playerId} cancelling active (but not started) session ${this.currentSessionData.id}.`);
      if (this.battleChannelSubscription) {
        this.battleChannelSubscription.send({
          type: 'broadcast',
          event: 'battle_event',
          payload: {
            type: 'battle_cancelled',
            cancellingPlayerId: this.playerId,
            sessionId: this.currentSessionData.id,
          },
        }).catch(err => console.error('[ChromaLabGame] Error broadcasting battle_cancelled event:', err));
      }
      // Update the session status to 'cancelled' in DB
      await this.updateGameSessionStatus(this.currentSessionData.id, 'cancelled', this.playerId);
    } else {
      console.log('[ChromaLabGame] Cancelling a local battle setup (no session).');
      // No session to update, just local cleanup
    }
    this.resetToMainMenu(); // Handles UI and local state reset
    console.log('[ChromaLabGame] Cancel Match processed.');
  }
  async forfeitBattle() {
    console.log('[ChromaLabGame] Player initiated Forfeit Match.');
    if (!this.isBattleGameStarted()) {
      console.warn('[ChromaLabGame] Forfeit clicked but game not started. This should be a cancel. Ignoring forfeit.');
      // Optionally, treat as cancel: await this.cancelBattleMatch();
      return;
    }
    const forfeitingPlayerId = this.playerId;
    let winningPlayerId = null;
    let winnerTextStatusForRecord = '';
    let winnerMessageForUI = '';
    let p1Result, p2Result;
    if (this.currentSessionData) { // Multiplayer game
      if (this.isLocalPlayerOne) { // Local P1 forfeits
        winningPlayerId = this.currentSessionData.player_two_id;
        winnerTextStatusForRecord = 'player_two';
        winnerMessageForUI = `${this.currentSessionData.player_two_username || 'Player 2'} Wins by Forfeit!`;
        p1Result = { colorData: this.colorSystem.getColorByHex('#333333') || {name: 'Forfeit', hex:'#333333', rgb:[51,51,51]}, difference: Infinity };
        p2Result = { colorData: this.currentBattleTargetColor || {name: 'Win', hex:'#4CAF50', rgb:[76,175,80]}, difference: 0 };
      } else { // Local P2 forfeits
        winningPlayerId = this.currentSessionData.player_one_id;
        winnerTextStatusForRecord = 'player_one';
        winnerMessageForUI = `${this.currentSessionData.player_one_username || 'Player 1'} Wins by Forfeit!`;
        p1Result = { colorData: this.currentBattleTargetColor || {name: 'Win', hex:'#4CAF50', rgb:[76,175,80]}, difference: 0 };
        p2Result = { colorData: this.colorSystem.getColorByHex('#333333') || {name: 'Forfeit', hex:'#333333', rgb:[51,51,51]}, difference: Infinity };
      }
      console.log(`[ChromaLabGame] Forfeit in session ${this.currentSessionData.id}. Forfeiter: ${forfeitingPlayerId}, Winner: ${winningPlayerId}`);
      if (this.battleChannelSubscription) {
        this.battleChannelSubscription.send({
          type: 'broadcast',
          event: 'battle_event',
          payload: {
            type: 'battle_forfeited',
            forfeitingPlayerId: forfeitingPlayerId,
            winningPlayerId: winningPlayerId,
            sessionId: this.currentSessionData.id,
          },
        }).catch(err => console.error('[ChromaLabGame] Error broadcasting battle_forfeited event:', err));
      }
      await this.updateGameSessionOnBattleEnd(this.currentSessionData.id, winningPlayerId, 'completed_by_forfeit');
    } else { // Local game (no session) - Assume P1 forfeits
      winnerTextStatusForRecord = 'player_two'; // "Player 2" (the opponent) wins
      winnerMessageForUI = 'Opponent Wins by Forfeit!';
      p1Result = { colorData: this.colorSystem.getColorByHex('#333333') || {name: 'Forfeit', hex:'#333333', rgb:[51,51,51]}, difference: Infinity };
      p2Result = { colorData: this.currentBattleTargetColor || {name: 'Win', hex:'#4CAF50', rgb:[76,175,80]}, difference: 0 };
      console.log('[ChromaLabGame] Forfeit in local game.');
    }
    this.uiManager.displayBattleResults(p1Result, p2Result, this.currentBattleTargetColor, winnerMessageForUI);
    const battleRecord = {
      session_id: this.currentSessionData ? this.currentSessionData.id : null,
      player_one_id: this.currentSessionData ? this.currentSessionData.player_one_id : this.playerId,
      player_two_id: this.currentSessionData ? this.currentSessionData.player_two_id : null,
      player_one_best_mix_hex: p1Result.difference === Infinity ? null : p1Result.colorData.hex,
      player_one_best_mix_name: p1Result.difference === Infinity ? 'Forfeit' : p1Result.colorData.name,
      player_one_difference: p1Result.difference,
      player_two_best_mix_hex: p2Result.difference === Infinity ? null : p2Result.colorData.hex,
      player_two_best_mix_name: p2Result.difference === Infinity ? 'Forfeit' : p2Result.colorData.name,
      player_two_difference: p2Result.difference,
      target_color_hex: this.currentBattleTargetColor ? this.currentBattleTargetColor.hex : null,
      target_color_name: this.currentBattleTargetColor ? this.currentBattleTargetColor.name : null,
      winner: winnerTextStatusForRecord,
      battle_timestamp: new Date().toISOString(),
      status_details: `forfeited_by_${forfeitingPlayerId}`
    };
    await this.saveBattleRecord(battleRecord);
    this.resetToMainMenu(); // Handles further UI and local state cleanup
    console.log('[ChromaLabGame] Forfeit Match processed.');
  }
  // Helper to update session status, e.g., for cancellations
  async updateGameSessionStatus(sessionId, status, actorPlayerId = null) {
    if (!sessionId) return;
    console.log(`[ChromaLabGame] Updating session ${sessionId} status to: ${status}, actor: ${actorPlayerId}`);
    try {
        const updatePayload = { status: status };
        // Optionally, you could add an 'actor_player_id' or 'last_event_by' field to your game_sessions table
        // if (actorPlayerId) updatePayload.last_actor_id = actorPlayerId; 
        const { data, error } = await supabase
            .from('game_sessions')
            .update(updatePayload)
            .eq('id', sessionId);
        if (error) {
            console.error(`[ChromaLabGame] Error updating game session ${sessionId} status:`, error);
        } else {
            console.log(`[ChromaLabGame] Game session ${sessionId} status updated to ${status}.`, data);
        }
    } catch (e) {
        console.error(`[ChromaLabGame] Exception updating game session ${sessionId} status:`, e);
    }
  }
}
ChromaLabGame.prototype._selectRandomBattleTargetColor = function() {
    const discoveredColors = this.colorSystem.getDiscoveredColors();
    let potentialTargets = discoveredColors.filter(c => c.mixArity >= 2);
    if (potentialTargets.length === 0) {
        // Fallback: any non-primary, non-shading, non-modifier from discovered
        potentialTargets = discoveredColors.filter(
            c => !c.isPrimary &&
                 !(c.hex === '#000000' || c.hex === '#FFFFFF' || (c.isShadingColor !== undefined && c.isShadingColor)) &&
                 (c.isSaturationModifier === undefined || !c.isSaturationModifier)
        );
    }
    
    if (potentialTargets.length === 0) {
        // Broader Fallback: any discovered color not red, yellow, blue
        const primaryChromaticHexes = ['#FF0000', '#FFFF00', '#0000FF'];
        potentialTargets = discoveredColors.filter(c => !primaryChromaticHexes.includes(c.hex) && c.hex !== '#000000' && c.hex !== '#FFFFFF');
    }
    if (potentialTargets.length === 0 && discoveredColors.length > 0) {
        // Last resort: pick any discovered color if all filters failed
        potentialTargets = [...discoveredColors.filter(c => c.hex !== '#000000' && c.hex !== '#FFFFFF' && c.hex !== '#A0A0A0' && c.hex !== '#606060' && !c.isPrimary)]; // Try to avoid basic primaries
        if(potentialTargets.length === 0) potentialTargets = [...discoveredColors]; // Absolute last resort
    }
    if (potentialTargets.length > 0) {
        const randomIndex = Math.floor(Math.random() * potentialTargets.length);
        return potentialTargets[randomIndex];
    } else {
        console.warn("[Battle] No suitable random target colors found from discovered. Using a default color.");
        // Attempt to get a default from ColorSystem if possible, otherwise hardcode
        let defaultTarget = this.colorSystem.getColorByHex('#808080'); // Grey
        if (!defaultTarget) defaultTarget = { name: "Target Grey", hex: "#808080", rgb: [128,128,128], mixArity: 2}; // Fallback definition
        return defaultTarget;
    }
};
// Start the game application logic (shows title screen)
const game = new ChromaLabGame();
// This is called when UIManager shows the battle screen.
// We can reset scores or states here.
// UIManager.showBattleModeScreen(true, sessionData) already handles much of the visual reset.
// This method in main.js can be used for game logic resets specific to battle start.
ChromaLabGame.prototype.prepareForBattle = function(sessionData = null) {
    this.playerOneBattleScore = Infinity; // Initialize score to Infinity (lower is better)
    this.playerTwoBattleScore = Infinity; // Initialize score to Infinity
    this.playerOneBestAttempt = null;
    this.playerTwoBestAttempt = null;
    this.playerOneReadyForBattle = false; // Reset readiness
    this.playerTwoReadyForBattle = false; // Reset readiness
    this.battleHasActuallyStarted = false; // Reset this flag too
    this.currentBattleTargetColor = null; // This will be set by displaySpecificTargetColor called by prepareForBattle
    this.currentSessionData = sessionData; // Keep track of the session
    
    // Determine if the local player is Player 1 or Player 2 for THIS battle instance
    if (sessionData && this.playerId) {
        this.isLocalPlayerOne = (this.playerId === sessionData.player_one_id);
        console.log(`[Battle] Preparing for multiplayer battle. Session ID: ${sessionData.id}. Local player is ${this.isLocalPlayerOne ? 'Player 1' : 'Player 2'}`);
    } else {
        this.isLocalPlayerOne = true; // Default to Player 1 for local/solo mode
        console.log("[Battle] Preparing for local battle (no session data or playerId). Defaulting to Player 1 view.");
    }
    // The UIManager will also be told who the local player is when showBattleModeScreen is called.
    // So, uiManager.isLocalPlayerOne should be the source of truth for UI interaction control.
    if (sessionData) { // Only set up subscriptions if it's a multiplayer session
        console.log(`[Battle Sync] Setting up for ${this.isLocalPlayerOne ? 'Player 1' : 'Player 2'}`);
        // Subscribe to broadcast events for this session
        if (this.battleChannelSubscription) {
            this.battleChannelSubscription.unsubscribe();
        }
        const channelName = `battle_sync:${sessionData.id}`;
        this.battleChannelSubscription = supabase.channel(channelName);
        this.battleChannelSubscription
            .on('broadcast', { event: 'battle_event' }, (message) => { // Listen to 'battle_event'
                if (message.payload) {
                    if (message.payload.isBattleStartingSignal && message.payload.playerId !== this.playerId) {
                        console.log("[Battle Sync] Received battle starting signal from opponent.");
                        this.uiManager.enableBattleModeInteractionsAndStartTimer();
                        this.battleHasActuallyStarted = true; // Mark battle started on receiving signal too
                    } else if (message.payload.type === 'battle_cancelled' && message.payload.cancellingPlayerId !== this.playerId) {
                        console.log(`[Battle Sync] Received battle_cancelled event from ${message.payload.cancellingPlayerId}.`);
                        this.uiManager.showAchievement("Opponent cancelled the match.");
                        this.resetToMainMenu();
                    } else if (message.payload.type === 'battle_forfeited' && message.payload.forfeitingPlayerId !== this.playerId) {
                        console.log(`[Battle Sync] Received battle_forfeited event from ${message.payload.forfeitingPlayerId}.`);
                        const winnerMessageForUI = `${message.payload.forfeitingPlayerId === (this.currentSessionData?.player_one_id) ? (this.currentSessionData?.player_two_username || 'Player 2') : (this.currentSessionData?.player_one_username || 'Player 1')} Wins by Forfeit!`;
                        // Current player wins by opponent's forfeit
                        const p1Res = this.isLocalPlayerOne ? { colorData: this.currentBattleTargetColor || {name: 'Win', hex:'#4CAF50', rgb:[76,175,80]}, difference: 0 } : { colorData: this.colorSystem.getColorByHex('#333333') || {name: 'Opponent Forfeited', hex:'#333333', rgb:[51,51,51]}, difference: Infinity };
                        const p2Res = !this.isLocalPlayerOne ? { colorData: this.currentBattleTargetColor || {name: 'Win', hex:'#4CAF50', rgb:[76,175,80]}, difference: 0 } : { colorData: this.colorSystem.getColorByHex('#333333') || {name: 'Opponent Forfeited', hex:'#333333', rgb:[51,51,51]}, difference: Infinity };
                        this.uiManager.displayBattleResults(p1Res, p2Res, this.currentBattleTargetColor, winnerMessageForUI);
                        this.resetToMainMenu();
                    } else if (message.payload.playerId !== this.playerId && !message.payload.type) { // Original mix attempt
                        this.handleOpponentBattleAttempt(message.payload);
                    }
                } else {
                    console.warn('[Battle Sync] Received broadcast with no payload or unhandled type:', message);
                }
            })
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`[Battle Sync] Successfully subscribed to broadcast channel ${channelName}`);
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.error(`[Battle Sync] Broadcast subscription error for ${channelName}:`, status, err);
                    this.uiManager.updateLobbyStatus(`Sync Error: ${err?.message || 'Failed to connect for battle updates'}.`);
                }
            });
    } else {
        console.log("[Battle] Preparing for local battle (no session data). Player acts as Player 1.");
        this.isLocalPlayerOne = true; // For local mode, player is always P1
        if (this.battleChannelSubscription) { // Clean up if moving from MP to local
            this.battleChannelSubscription.unsubscribe();
            this.battleChannelSubscription = null;
        }
    }
    console.log("[Battle] Player states reset for new battle.");
    if (this.uiManager) {
        // UIManager should have been informed about P1/P2 status via showBattleModeScreen
        // This sets the target color.
        let determinedTargetColor;
        if (sessionData && sessionData.target_color_hex) {
            console.log("[Battle] Using target color from sessionData:", sessionData.target_color_hex);
            // Attempt to find it in the local color system for full data (like HSL, mixArity etc.)
            let existingColorData = this.colorSystem.getColorByHex(sessionData.target_color_hex);
            
            if (existingColorData) {
                determinedTargetColor = existingColorData;
            } else {
                // If not in local system (e.g., a purely random hex not yet "discovered" or defined)
                // construct it from the session data.
                console.warn(`[Battle] Target color ${sessionData.target_color_hex} from session not in local ColorSystem. Reconstructing.`);
                if (sessionData.target_color_r !== undefined && sessionData.target_color_g !== undefined && sessionData.target_color_b !== undefined) {
                    const rgb = [sessionData.target_color_r, sessionData.target_color_g, sessionData.target_color_b];
                    determinedTargetColor = {
                        name: sessionData.target_color_name || "Mystery Target",
                        hex: sessionData.target_color_hex,
                        rgb: rgb,
                        hsl: this.colorSystem.rgbToHsl(...rgb), // Assuming rgbToHsl is available
                        mixArity: 2 // Default or derive if more info available
                    };
                } else {
                    console.error("[Battle] Session target_color_hex present, but RGB components missing. Cannot reconstruct. Falling back.");
                    // This case should ideally not happen if #createNewSession populates RGBs.
                }
            }
        } else if (sessionData && this.isLocalPlayerOne && !sessionData.target_color_hex) {
            // Fallback: P1, session exists, but no target_color_hex (should have been set by #createNewSession)
            // This indicates an issue, but P1 can try to set it now.
            console.warn("[Battle] Player 1 in session, but target_color_hex missing from sessionData. Generating and attempting to update session.");
            determinedTargetColor = this._selectRandomBattleTargetColor();
            if (determinedTargetColor) {
                 // Attempt to update the session in Supabase (best effort, might fail if P2 already joined under old state)
                supabase.from('game_sessions').update({
                    target_color_hex: determinedTargetColor.hex,
                    target_color_name: determinedTargetColor.name,
                    target_color_r: determinedTargetColor.rgb[0],
                    target_color_g: determinedTargetColor.rgb[1],
                    target_color_b: determinedTargetColor.rgb[2],
                }).eq('id', sessionData.id).then(({error}) => {
                    if (error) console.error("[Battle] Error updating session with P1 generated target color:", error);
                    else console.log("[Battle] Session updated by P1 with generated target color.");
                });
            }
        }
        
        if (!determinedTargetColor) { // If still no target (e.g. local mode, or error in MP path)
            console.log("[Battle] No session target color found or sessionData missing. Generating target locally.");
            determinedTargetColor = this._selectRandomBattleTargetColor();
        }
        if (determinedTargetColor) {
            this.currentBattleTargetColor = determinedTargetColor;
            this.uiManager.displaySpecificTargetColor(this.currentBattleTargetColor);
            console.log("[Battle] Final target color set:", this.currentBattleTargetColor.name, this.currentBattleTargetColor.hex);
        } else {
            console.error("[Battle] CRITICAL: Failed to determine ANY target color.");
            const fallbackColor = { name: "Fallback Orange", hex: "#FFA500", rgb: [255, 165, 0], hsl: this.colorSystem.rgbToHsl(255,165,0), mixArity: 2 };
            this.currentBattleTargetColor = fallbackColor;
            this.uiManager.displaySpecificTargetColor(fallbackColor);
        }
        this.uiManager.updatePlayerOneBattleScoreDisplay(this.playerOneBattleScore);
        if (typeof this.uiManager.updatePlayerTwoBattleScoreDisplay === 'function') {
            this.uiManager.updatePlayerTwoBattleScoreDisplay(this.playerTwoBattleScore);
        }
        // UI Manager should be called here to set up the initial "Ready" button state
        // and disable battle interactions until both players are ready.
        this.uiManager.setupInitialBattleReadyState();
    }
};
// Call animate here if it's not self-starting, or ensure it starts after login
// For now, animate() will be called in completeInitialization.
// We need a global animate loop if parts of UI (like title screen animations) need it before gameWorld init.
// Let's assume title screen is static for now. If animations are added there, animate() might need to start earlier.
function globalAnimate() {
    requestAnimationFrame(globalAnimate);
    // Add any TWEEN updates or other global animations here if needed for title screen
    // TWEEN.update() is generally called within systems that use it (like orbManager, gameWorld for camera)
    // or could be called here if there are global tweens.
    // For now, assuming individual system updates handle their tweens.
    game.animate(); // Calls the game's animate method which internally checks if gameWorld exists
}
globalAnimate(); // Start the main animation loop