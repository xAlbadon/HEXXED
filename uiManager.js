import { Leaderboard } from './leaderboard.js';
import { UpdateManager } from './updateManager.js';
export class UIManager {
  constructor(gameInstance, loginCallback, signupCallback) {
    this.game = gameInstance; // Store the game instance
    this.updateManager = new UpdateManager(this.game, this._showTitleScreenPostUpdate.bind(this)); // Instantiate UpdateManager
    this.loginCallback = loginCallback;
    this.signupCallback = signupCallback;
    // Title Screen Elements
    this.titleScreen = document.getElementById('titleScreen');
    this.usernameInput = document.getElementById('usernameInput');
    this.passwordInput = document.getElementById('passwordInput');
    this.loginButton = document.getElementById('loginButton');
    this.signupButton = document.getElementById('signupButton');
    this.authMessage = document.getElementById('authMessage');
    // Game Area UI Elements (prefixed with game for clarity)
    this.gameArea = document.getElementById('gameArea'); // Was #ui
    this.gameColorCount = document.getElementById('colorCount');
    this.gameSelectedColors = document.getElementById('selectedColors');
    // Elements for the new fullscreen encyclopedia
    this.fullscreenEncyclopedia = document.getElementById('fullscreenEncyclopedia');
    this.encyclopediaToggleButton = document.getElementById('encyclopediaToggleButton');
    this.closeEncyclopediaButton = document.getElementById('closeEncyclopediaButton');
    this.leaderboardToggleButton = document.getElementById('leaderboardToggleButton'); // New button
    this.battleModeButton = document.getElementById('battleModeButton'); // Battle Mode Button
    this.battleModeScreen = document.getElementById('battleModeScreen'); // Battle Mode Screen
    // this.closeBattleModeButton = document.getElementById('closeBattleModeButton'); // Removed
    this.battleModeActionButton = document.getElementById('battleModeActionButton'); // New Cancel/Forfeit button
    this.battleModeTimerDisplay = document.getElementById('battleModeTimerDisplay'); // Timer display
    this.targetBattleColorDisplay = document.getElementById('targetBattleColorDisplay'); // Battle mode target color display
    this.targetBattleColorInfo = document.getElementById('targetBattleColorInfo'); // Battle mode target color info
    this.playerOneBattleOrbsContainer = document.getElementById('playerOneSourceOrbs'); // For P1 source orbs
    this.playerOneSelectedOrbsContainer = document.getElementById('playerOneSelectedOrbs'); // For P1 selected orbs display
    this.playerOneMixButton = null; // Will be initialized in showBattleModeScreen
    this.playerOneColorDisplay = document.getElementById('playerOneColorDisplay'); // P1's mixed color swatch
    this.playerOneColorResultInfo = document.getElementById('playerOneColorResultInfo'); // P1's mixed color details
    this.playerOneBattleScoreDisplay = document.getElementById('playerOneBattleScoreDisplay'); // P1's score display
    // Player 2 Battle Mode Elements
    this.playerTwoBattleOrbsContainer = document.getElementById('playerTwoSourceOrbs');
    this.playerTwoSelectedOrbsContainer = document.getElementById('playerTwoSelectedOrbs');
    this.playerTwoMixButton = null; // Will be initialized in showBattleModeScreen
    this.playerTwoColorDisplay = document.getElementById('playerTwoColorDisplay');
    this.playerTwoColorResultInfo = document.getElementById('playerTwoColorResultInfo');
    this.playerTwoBattleScoreDisplay = document.getElementById('playerTwoBattleScoreDisplay'); // Assign P2 score display
    console.log('[UIManager Constructor] Player One Mix Button initialized (deferring query):', this.playerOneMixButton);
    console.log('[UIManager Constructor] Player Two Mix Button initialized (deferring query):', this.playerTwoMixButton);
    this._playerMixButtonListenersAttached = false; // Flag for P1/P2 mix button listeners
    // Player Ready Buttons and Status
    this.playerOneReadyButton = document.getElementById('playerOneReadyButton');
    this.playerTwoReadyButton = document.getElementById('playerTwoReadyButton');
    this.playerOneReadyStatus = document.getElementById('playerOneReadyStatus'); // Optional status text
    this.playerTwoReadyStatus = document.getElementById('playerTwoReadyStatus'); // Optional status text
    // Battle Results Screen Elements
    this.battleResultsScreen = document.getElementById('battleResultsScreen');
    this.battleWinnerMessage = document.getElementById('battleWinnerMessage');
    this.targetColorResultSwatch = document.getElementById('targetColorResultSwatch');
    this.targetColorResultInfo = document.getElementById('targetColorResultInfo');
    this.playerOneResultLabel = document.getElementById('playerOneResultLabel'); // New label for results screen
    this.playerOneResultSwatch = document.getElementById('playerOneResultSwatch');
    this.playerOneResultInfo = document.getElementById('playerOneResultInfo');
    this.playerTwoResultLabel = document.getElementById('playerTwoResultLabel'); // New label for results screen
    this.playerTwoResultSwatch = document.getElementById('playerTwoResultSwatch');
    this.playerTwoResultInfo = document.getElementById('playerTwoResultInfo');
    this.closeBattleResultsButton = document.getElementById('closeBattleResultsButton');
    // Lobby Screen Elements
    this.lobbyScreen = document.getElementById('lobbyScreen');
    this.lobbyStatusMessage = document.getElementById('lobbyStatusMessage');
    this.cancelLobbyButton = document.getElementById('cancelLobbyButton');
    // Encyclopedia Tab Elements
    this.encyclopediaTabsContainer = document.getElementById('encyclopediaTabs');
    this.encyclopediaTabButtons = this.encyclopediaTabsContainer ? 
                                  this.encyclopediaTabsContainer.querySelectorAll('.encyclopediaTabButton') : [];
    this.encyclopediaTabPanels = document.getElementById('encyclopediaTabContent') ?
                                 document.getElementById('encyclopediaTabContent').querySelectorAll('.encyclopediaTabPanel') : [];
    // Content elements within the "Color Grid" tab
    this.gameColorGrid = document.getElementById('colorGrid'); // This is inside #colorGridTab
    this.gameColorInfo = document.getElementById('colorInfo'); // This is inside #colorGridTab
    this.sortColorsDropdown = document.getElementById('sortColorsDropdown'); // This is inside #colorGridTab
    this.gameChallengeDisplay = document.getElementById('challengeDisplay'); // May be repurposed or removed
    this.gameLeaderboardPanelEl = document.getElementById('leaderboardPanel');
    // Achievements Tab Elements (assuming IDs are present in index.html as per instructions)
    this.achievementsListContainer = document.getElementById('achievementsList');
    this.setupAuthEventListeners();
    // Mix button and other game UI elements are created after login
    // this.createMixButton(); // Moved
    // this.updateColorCount(3); // Initial count, now handled after login
    
    // Leaderboard is initialized after game area is shown
    this.leaderboard = null;
    this.mixButtonContainer = null;
    
    this.setupEncyclopediaEventListeners();
    window.addEventListener('resize', this.handleResize.bind(this));
    this.setupLeaderboardToggleListener();
    this.setupBattleModeButtonListener(); // Setup listener for battle mode entry and new action button
    this.setupBattleResultsListeners(); // Listener for results screen close button
    this.setupLobbyEventListeners(); // Listener for lobby screen buttons
    this._setupReadyButtonListeners(); // Setup for the new ready buttons
    this.battleTimerInterval = null;
    this.battleTimerSeconds = 0;
    this.playerOneBattleSelection = []; // Stores P1's current orb selection for battle
    this.MAX_BATTLE_SELECTION = 4; // Max orbs P1 can select for a mix (shared for P2)
    this.playerOneAvailableBattleOrbs = []; // Stores the definitions of P1's 7 starting orbs
    this.playerTwoBattleSelection = []; // Stores P2's current orb selection for battle
    this.playerTwoAvailableBattleOrbs = []; // Stores the definitions of P2's 7 starting orbs
    this.currentBattleSessionData = null; // Stores data for the current multiplayer session
    this.localPlayerIsOne = null; // Will be set by showBattleModeScreen
    // Initialize UpdateManager and manage title screen visibility
    if (this.updateManager) {
      try {
        this.updateManager.initialize(); // UpdateManager configures itself and shows its UI if needed.
        this._syncTitleScreenWithUpdateManager(false); // Sync based on initial state
      } catch (error) {
        console.error('[UIManager] Error during UpdateManager initialization or UI check:', error);
        // Fallback: ensure title screen is visible and update manager UI (if any) is hidden.
        if (this.titleScreen) {
            this.titleScreen.style.display = 'flex';
            console.log('[UIManager] Fallback: Ensuring title screen is visible after UpdateManager error.');
        }
        if (this.updateManager && typeof this.updateManager.hideUpdateUI === 'function') {
            this.updateManager.hideUpdateUI(); // Attempt to hide updater UI if it got stuck
        }
      }
    } else {
      // No UpdateManager instance, ensure title screen is visible by calling sync.
      this._syncTitleScreenWithUpdateManager(false);
    }
  }
  _syncTitleScreenWithUpdateManager(isUpdateManagerCompleting = false) {
    if (!this.titleScreen) {
        console.warn('[UIManager] _syncTitleScreenWithUpdateManager: titleScreen element not available.');
        return;
    }
    if (this.updateManager) {
        // Check if UpdateManager is currently blocking UI AND not in the process of completing
        if (!isUpdateManagerCompleting && this.updateManager.isBlockingUI()) {
            this.titleScreen.style.display = 'none';
            console.log('[UIManager] UpdateManager is active/blocking. Title screen hidden by sync.');
        } else {
            // UpdateManager is not blocking, OR it is completing.
            // Title screen should be visible.
            if (isUpdateManagerCompleting && typeof this.updateManager.hideUpdateUI === 'function') {
                this.updateManager.hideUpdateUI(); // Hide UpdateManager's UI as it's completing.
            }
            this.titleScreen.style.display = 'flex';
            console.log(`[UIManager] Title screen shown by sync. Update completing: ${isUpdateManagerCompleting}.`);
            // Ensure gameArea is not blurred when title screen is primary.
            if (this.gameArea) {
                this.gameArea.style.filter = 'none';
            }
        }
    } else {
        // No UpdateManager, so title screen should be visible.
        this.titleScreen.style.display = 'flex';
        console.log('[UIManager] No UpdateManager. Title screen shown by sync.');
    }
  }
  #calculateLuminance(rgb) {
    // Formula: (0.299*R + 0.587*G + 0.114*B) / 255
    // Assumes RGB values are 0-255
    if (!rgb || rgb.length < 3) return 0; // Default to dark (0) if invalid input
    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];
    // Calculate luminance (0-255 scale)
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    // Normalize to 0-1 scale
    return lum / 255;
  }
  setupAuthEventListeners() {
    this.loginButton.addEventListener('click', () => {
      const username = this.usernameInput.value.trim();
      const password = this.passwordInput.value;
      if (username && password) {
        this.loginCallback(username, password);
      } else {
        this.setAuthMessage('Please enter username and password.');
      }
    });
    this.signupButton.addEventListener('click', () => {
      const username = this.usernameInput.value.trim();
      const password = this.passwordInput.value;
      if (username && password) {
        this.signupCallback(username, password);
      } else {
        this.setAuthMessage('Please enter username and password.');
      }
    });
  }
  setAuthMessage(message, isError = true) {
    this.authMessage.textContent = message;
    this.authMessage.style.color = isError ? '#ff6b6b' : '#6bff6b'; // Red for error, Green for success
  }
  _showTitleScreenPostUpdate() {
    // This method is the callback for when UpdateManager completes its process.
    console.log('[UIManager] UpdateManager completion callback triggered. Syncing title screen.');
    this._syncTitleScreenWithUpdateManager(true); // true indicates the update process is completing.
  }
  setupEncyclopediaEventListeners() {
    if (this.encyclopediaToggleButton) {
        this.encyclopediaToggleButton.addEventListener('click', () => this.showEncyclopedia(true));
    }
    if (this.closeEncyclopediaButton) {
        this.closeEncyclopediaButton.addEventListener('click', () => this.showEncyclopedia(false));
    }
    if (this.sortColorsDropdown) {
        this.sortColorsDropdown.addEventListener('change', () => {
            // This assumes `this.currentDiscoveredColors` is maintained or passed to updateEncyclopedia
            // For now, let's assume `updateEncyclopedia` will fetch fresh or use a stored list.
            // A better approach might be to store the last fetched colors in UIManager
            // and pass them to updateEncyclopedia, or have game.js call updateEncyclopedia
            // with the current list and the new sort order.
            // For simplicity, we'll make updateEncyclopedia accept the list.
            if (this.lastKnownDiscoveredColors) { // We'll need to set this variable
                this.updateEncyclopedia(this.lastKnownDiscoveredColors);
            }
        });
    }
    this.encyclopediaTabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTabId = button.dataset.tab;
        this.setActiveEncyclopediaTab(targetTabId);
      });
    });
  }
  setActiveEncyclopediaTab(tabId) {
    this.encyclopediaTabButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.tab === tabId);
    });
    this.encyclopediaTabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === tabId);
    });
    if (tabId === 'colorGridTab' && this.lastKnownDiscoveredColors) {
      // Re-populate or ensure color grid is up-to-date
      this.updateEncyclopedia(this.lastKnownDiscoveredColors);
    } else if (tabId === 'colorRingsTab') {
      this.populateRingsManagementTab();
    } else if (tabId === 'achievementsTab') {
      console.log('[UIManager] setActiveEncyclopediaTab: Switching to Achievements Tab. Attempting to populate...');
      this.populateAchievementsTab();
    }
  }
  showEncyclopedia(show) {
    if (this.fullscreenEncyclopedia) {
        this.fullscreenEncyclopedia.style.display = show ? 'block' : 'none';
        if (show) {
            // Default to the color grid tab when opening, or the last active one
            // For now, let's ensure color grid is active and populated.
            this.setActiveEncyclopediaTab('colorGridTab'); 
            // if (this.lastKnownDiscoveredColors) {
            //    this.updateEncyclopedia(this.lastKnownDiscoveredColors);
            // } // updateEncyclopedia is called within setActiveEncyclopediaTab
        }
    }
    // Optionally, pause game or disable gameArea interactions when encyclopedia is open
    if (this.gameArea) {
        // gameArea should generally allow clicks to pass through to the canvas.
        // Its children (buttons, etc.) will have `pointer-events: auto` if they need to be interactive.
        // When the encyclopedia is shown, it overlays everything anyway.
        this.gameArea.style.pointerEvents = 'none';
        this.gameArea.style.filter = show ? 'blur(5px)' : 'none'; // Optional visual cue
    }
    // When encyclopedia opens, ensure leaderboard is hidden to prevent overlap
    if (show && this.gameLeaderboardPanelEl && this.gameLeaderboardPanelEl.style.display === 'block') {
        this.gameLeaderboardPanelEl.style.display = 'none';
    }
  }
  showGameArea() {
    this.titleScreen.style.display = 'none';
    this.gameArea.style.display = 'block';
    // this.gameArea.style.pointerEvents = 'auto'; // This was causing gameArea to block clicks to the canvas.
                                                 // The default CSS `pointer-events: none;` for gameArea is correct.
    this.gameArea.style.filter = 'none';
    // Initialize game-specific UI components now
    this.createMixButton();
    // this.updateColorCount(3); // Set initial or loaded count - This will now be handled by main.js after data load
    if (this.gameLeaderboardPanelEl) {
        this.leaderboard = new Leaderboard(this.gameLeaderboardPanelEl);
        // displayLeaderboard might be called by main.js after data load
    } else {
        console.warn("Leaderboard panel element ('leaderboardPanel') not found in the DOM.");
    }
    // this.updateEncyclopediaPosition(); // No longer needed for panel
  }
  createMixButton() {
    this.mixButton = document.createElement('button');
    this.mixButton.id = 'mixButton';
    this.mixButton.textContent = 'Mix Colors';
    this.mixButton.disabled = true;
    
    this.mixButtonContainer = document.createElement('div');
    this.mixButtonContainer.style.cssText = `
      position: absolute;
      /* bottom will be set by updateMixButtonPosition */
      left: 50%;
      transform: translateX(-50%);
      pointer-events: auto;
      z-index: 10; /* Ensure it's above selectedColors but below modals */
    `;
    this.mixButtonContainer.appendChild(this.mixButton);
    this.gameArea.appendChild(this.mixButtonContainer); // Append to gameArea
    this.updateMixButtonPosition(); // Set initial position
  }
  onMixButtonClick(callback) {
    if(this.mixButton) this.mixButton.addEventListener('click', callback);
  }
  setMixButtonEnabled(enabled) {
    if(this.mixButton) this.mixButton.disabled = !enabled;
  }
  updateColorCount(count) {
    if(this.gameColorCount) this.gameColorCount.textContent = count;
  }
  updateSelectedColors(selectedOrbs) {
    if(!this.gameSelectedColors) return;
    this.gameSelectedColors.innerHTML = '';
    
    selectedOrbs.forEach((orb) => {
      const selectedColorItem = document.createElement('div');
      selectedColorItem.className = 'selectedColor';
      const swatch = document.createElement('div');
      swatch.className = 'selectedColorSwatch';
      swatch.style.backgroundColor = orb.colorData.hex;
      const nameSpan = document.createElement('span');
      nameSpan.className = 'selectedColorName';
      nameSpan.textContent = orb.colorData.name;
      nameSpan.title = orb.colorData.name; // Show full name on hover if truncated
      selectedColorItem.appendChild(swatch);
      selectedColorItem.appendChild(nameSpan);
      this.gameSelectedColors.appendChild(selectedColorItem);
    });
  }
  updateEncyclopedia(discoveredColors, currentSortOrder = null) {
    if (!this.gameColorGrid) return;
    this.lastKnownDiscoveredColors = [...discoveredColors]; // Store for re-sorting
    let sortedColors = [...discoveredColors]; // Create a copy to sort
    // Ensure HSL values are present on color objects for HSL sorting
    sortedColors.forEach(color => {
      if (!color.hsl && color.rgb && this.game && this.game.colorSystem && typeof this.game.colorSystem.rgbToHsl === 'function') {
        color.hsl = this.game.colorSystem.rgbToHsl(...color.rgb);
      } else if (!color.hsl) {
        // Fallback or default HSL if calculation is not possible (e.g., missing rgb or game context)
        color.hsl = { h: 0, s: 0, l: 0 };
        if (this.game && this.game.colorSystem) { // Only warn if context suggests it should work
            console.warn(`[UIManager] Color ${color.name} (HEX: ${color.hex}) missing RGB data or HSL could not be computed.`);
        }
      }
    });
    const sortOrder = currentSortOrder || (this.sortColorsDropdown ? this.sortColorsDropdown.value : 'name_asc');
    switch (sortOrder) {
      case 'name_asc':
        sortedColors.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        sortedColors.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'discovered_asc':
        sortedColors.sort((a, b) => (a.discoveredTimestamp || 0) - (b.discoveredTimestamp || 0));
        break;
      case 'discovered_desc':
        sortedColors.sort((a, b) => (b.discoveredTimestamp || 0) - (a.discoveredTimestamp || 0));
        break;
      case 'hue_asc':
        sortedColors.sort((a, b) => (a.hsl.h || 0) - (b.hsl.h || 0));
        break;
      case 'hue_desc':
        sortedColors.sort((a, b) => (b.hsl.h || 0) - (a.hsl.h || 0));
        break;
      case 'saturation_asc':
        sortedColors.sort((a, b) => (a.hsl.s || 0) - (b.hsl.s || 0));
        break;
      case 'saturation_desc':
        sortedColors.sort((a, b) => (b.hsl.s || 0) - (a.hsl.s || 0));
        break;
      case 'lightness_asc':
        sortedColors.sort((a, b) => (a.hsl.l || 0) - (b.hsl.l || 0));
        break;
      case 'lightness_desc':
        sortedColors.sort((a, b) => (b.hsl.l || 0) - (a.hsl.l || 0));
        break;
      case 'mix_arity_asc':
        sortedColors.sort((a, b) => (a.mixArity || 0) - (b.mixArity || 0));
        break;
      case 'mix_arity_desc':
        sortedColors.sort((a, b) => (b.mixArity || 0) - (a.mixArity || 0));
        break;
    }
    this.gameColorGrid.innerHTML = ''; // Clear previous swatches
    sortedColors.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = 'colorSwatch';
      swatch.style.backgroundColor = color.hex;
      swatch.title = `${color.name} (${color.hex})`;
      
      if (color.discoveredTimestamp && (sortOrder === 'discovered_asc' || sortOrder === 'discovered_desc')) {
        swatch.title += `\nDiscovered: ${new Date(color.discoveredTimestamp).toLocaleDateString()}`;
      }
      swatch.addEventListener('mouseenter', () => {
        this.showColorInfo(color);
      });
      
      this.gameColorGrid.appendChild(swatch);
    });
  }
  showColorInfo(colorData) {
    if(!this.gameColorInfo) return;
    let hslString = 'HSL: N/A';
    if (colorData.rgb && this.game && this.game.colorSystem && typeof this.game.colorSystem.rgbToHsl === 'function') {
      const hsl = this.game.colorSystem.rgbToHsl(...colorData.rgb);
      hslString = `HSL: ${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%`;
    } else if (colorData.hsl) { // If HSL is pre-calculated and stored
      hslString = `HSL: ${Math.round(colorData.hsl.h)}, ${Math.round(colorData.hsl.s * 100)}%, ${Math.round(colorData.hsl.l * 100)}%`;
    }
    this.gameColorInfo.innerHTML = `
      <strong>${colorData.name}</strong><br>
      HEX: ${colorData.hex}<br>
      RGB: (${colorData.rgb.join(', ')})<br>
      ${hslString}<br>
      Mixed from ${colorData.mixArity || 'N/A'} colors.
      ${colorData.mixedFrom ? `<br><small>Parents: ${colorData.mixedFrom.join(', ')}</small>` : ''}
    `;
  }
  showColorDiscovered(colorData) {
    // Create discovery notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, ${colorData.hex}, #ffffff);
      color: white;
      padding: 20px;
      border-radius: 15px;
      font-size: 18px;
      font-weight: bold;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
      z-index: 1000;
      pointer-events: none;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    notification.textContent = `Discovered: ${colorData.name}!`;
    
    document.body.appendChild(notification);
    
    // Animate and remove
    setTimeout(() => {
      notification.style.transition = 'all 0.5s ease';
      notification.style.opacity = '0';
      notification.style.transform = 'translate(-50%, -60%) scale(0.8)';
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 2000);
  }

  showAchievement(message) {
    const achievement = document.createElement('div');
    achievement.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
      color: white;
      padding: 15px;
      border-radius: 10px;
      font-weight: bold;
      z-index: 1000;
      pointer-events: none;
      box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
    `;
    achievement.textContent = message;
    
    document.body.appendChild(achievement);
    
    setTimeout(() => {
      achievement.style.transition = 'all 0.5s ease';
      achievement.style.opacity = '0';
      achievement.style.transform = 'translateX(100%)';
      
      setTimeout(() => {
        document.body.removeChild(achievement);
      }, 500);
    }, 3000);
  }
  updateChallengeDisplay(challenge) {
    if(!this.gameChallengeDisplay) return;
    // This display is now less central. It might show a "next suggested" achievement or be removed.
    // For now, let's update it with info from ChallengeManager's getLegacyChallengeDisplayInfo.
    let challengeInfo = null;
    if (this.game && this.game.challengeManager && typeof this.game.challengeManager.getLegacyChallengeDisplayInfo === 'function') {
        challengeInfo = this.game.challengeManager.getLegacyChallengeDisplayInfo();
    }
    if (challengeInfo && challengeInfo.name) {
      this.gameChallengeDisplay.innerHTML = `💡 Suggestion: <strong>${challengeInfo.name}</strong><br><small>${challengeInfo.hint || ''}</small>`;
      this.gameChallengeDisplay.style.display = 'block';
    } else {
      this.gameChallengeDisplay.style.display = 'none';
    }
  }
  async displayLeaderboard() {
    if (this.leaderboard) {
        await this.leaderboard.loadAndDisplay();
    } else {
        console.warn("Leaderboard instance not available in UIManager or called too early.");
    }
  }
  setupLeaderboardToggleListener() {
    if (this.leaderboardToggleButton && this.gameLeaderboardPanelEl) {
      this.leaderboardToggleButton.addEventListener('click', () => {
        const isVisible = this.gameLeaderboardPanelEl.style.display === 'block';
        this.gameLeaderboardPanelEl.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) {
            // If opening leaderboard, ensure encyclopedia is closed
            if (this.fullscreenEncyclopedia && this.fullscreenEncyclopedia.style.display === 'block') {
                this.showEncyclopedia(false);
            }
            this.displayLeaderboard(); // Refresh data when shown
        }
      });
    }
  }
  updateMixButtonPosition() {
    if (!this.mixButtonContainer) return;
    // The Mix button is now at a fixed position at the bottom center,
    // independent of the new selected colors panel on the right.
    let bottomOffset = 20; // Default bottom offset in pixels
    // Adjust for mobile view if needed (using a simple check for window width)
    if (window.innerWidth <= 768) {
      bottomOffset = 10; // Slightly less offset on smaller screens
    }
    if (window.innerWidth <= 480) {
      bottomOffset = 8; 
    }
    
    this.mixButtonContainer.style.bottom = `${bottomOffset}px`;
  }
  handleResize() {
    this.updateMixButtonPosition();
    // Potentially other UI adjustments on resize can go here
  }
populateRingsManagementTab() {
    const ringsTabPanel = document.getElementById('colorRingsTab');
    if (!ringsTabPanel || !this.game || !this.game.orbManager || !this.game.orbRingCapacities || !this.game.colorSystem) {
      if (ringsTabPanel) ringsTabPanel.innerHTML = '<p>Ring data system is not fully initialized. Please ensure game is running.</p>';
      console.warn("[UIManager] Ring management tab cannot be populated: Game systems not ready.");
      return;
    }
    const allGameOrbs = this.game.orbManager.orbs;
    const ringCapacities = this.game.orbRingCapacities;
    // Iterate through the predefined ring sections in HTML (2, 3, 4)
    [2, 3, 4].forEach(mixArity => {
      const capacity = ringCapacities[mixArity];
      if (capacity === Infinity || !capacity) return; // Skip primary or unconfigured rings
      const activeOrbsCountSpan = document.getElementById(`activeOrbsCount-${mixArity}`);
      const maxOrbsCountSpan = document.getElementById(`maxOrbsCount-${mixArity}`);
      const activeOrbsListUl = document.getElementById(`activeOrbsList-${mixArity}`);
      const manageOrbsButton = ringsTabPanel.querySelector(`.manageRingOrbsButton[data-arity="${mixArity}"]`);
      const availableOrbsSectionDiv = document.getElementById(`availableOrbsSection-${mixArity}`);
      const availableOrbsSortDropdown = document.getElementById(`availableOrbsSortDropdown-${mixArity}`);
      if (!activeOrbsCountSpan || !maxOrbsCountSpan || !activeOrbsListUl || !manageOrbsButton || !availableOrbsSectionDiv || !availableOrbsSortDropdown) {
        console.warn(`[UIManager] Missing HTML elements for ring arity ${mixArity}. Skipping.`);
        return;
      }
      const activeOrbsInThisRing = allGameOrbs.filter(
        orb => orb.colorData.mixArity === mixArity && !orb.colorData.isPrimary
      );
      // Update counts
      activeOrbsCountSpan.textContent = activeOrbsInThisRing.length;
      maxOrbsCountSpan.textContent = capacity;
      // Populate active orbs list
      activeOrbsListUl.innerHTML = ''; // Clear previous
      if (activeOrbsInThisRing.length > 0) {
        activeOrbsInThisRing.forEach(orb => {
          const listItem = document.createElement('li');
          listItem.className = 'ringOrbListItem';
          const swatch = document.createElement('div');
          swatch.className = 'ringOrbSwatch';
          swatch.style.backgroundColor = orb.colorData.hex;
          const nameSpan = document.createElement('span');
          nameSpan.className = 'ringOrbName';
          nameSpan.textContent = orb.colorData.name;
          const unsummonButton = document.createElement('button');
          unsummonButton.className = 'unsummonOrbButton';
          unsummonButton.textContent = 'Unsummon';
          unsummonButton.title = `Remove ${orb.colorData.name} from this ring`;
          unsummonButton.addEventListener('click', () => {
            if (this.game && typeof this.game.handleUnsummonOrbRequest === 'function') {
              this.game.handleUnsummonOrbRequest(orb);
            } else {
              console.error('Unsummon function not available on game instance.');
            }
          });
          listItem.appendChild(swatch);
          listItem.appendChild(nameSpan);
          listItem.appendChild(unsummonButton);
          activeOrbsListUl.appendChild(listItem);
        });
      } else {
        activeOrbsListUl.innerHTML = '<li class="noOrbsMessage">No colors currently active in this ring.</li>';
      }
      // "Manage Orbs" button event listener (ensure it's only added once or is idempotent)
      // A simple way is to replace the node, or use a flag, or check for existing listener.
      // For simplicity here, we'll rely on the tab being re-rendered on show, which re-adds listeners.
      // A more robust solution would be to manage listeners more carefully if this function is called frequently without full tab re-render.
      
      // Remove previous listener if any, before adding a new one to prevent duplicates if this func is called multiple times.
      // Cloning and replacing the button is a common trick.
      const newManageOrbsButton = manageOrbsButton.cloneNode(true);
      manageOrbsButton.parentNode.replaceChild(newManageOrbsButton, manageOrbsButton);
      
      newManageOrbsButton.addEventListener('click', () => {
        const isHidden = availableOrbsSectionDiv.style.display === 'none' || availableOrbsSectionDiv.style.display === '';
        availableOrbsSectionDiv.style.display = isHidden ? 'block' : 'none';
        newManageOrbsButton.innerHTML = isHidden ? '<span class="plusIcon">-</span> Hide Summonable' : '<span class="plusIcon">+</span> Manage Orbs';
        if (isHidden) {
          this.populateAvailableOrbsList(mixArity, availableOrbsSortDropdown.value);
        }
      });
      
      // Sort dropdown listener for available orbs
      const newAvailableOrbsSortDropdown = availableOrbsSortDropdown.cloneNode(true);
      availableOrbsSortDropdown.parentNode.replaceChild(newAvailableOrbsSortDropdown, availableOrbsSortDropdown);
      
      newAvailableOrbsSortDropdown.addEventListener('change', (event) => {
        if (availableOrbsSectionDiv.style.display === 'block') {
          this.populateAvailableOrbsList(mixArity, event.target.value);
        }
      });
    });
  }
  // New placeholder method for populating the "Available Orbs to Summon" list
populateAvailableOrbsList(mixArity, sortOrder = 'name_asc') {
    const availableOrbsListUl = document.getElementById(`availableOrbsList-${mixArity}`);
    if (!availableOrbsListUl || !this.game || !this.game.colorSystem || !this.game.orbManager) {
      console.warn(`[UIManager] Cannot populate available orbs list for arity ${mixArity}: Missing elements or game systems.`);
      if(availableOrbsListUl) availableOrbsListUl.innerHTML = '<li>Error loading summonable colors.</li>';
      return;
    }
    const allDiscoveredColors = this.game.colorSystem.getDiscoveredColors();
    const activeOrbHexes = new Set(this.game.orbManager.orbs.map(orb => orb.colorData.hex));
    let summonableColors = allDiscoveredColors.filter(color => {
      return color.mixArity === mixArity && // Matches the ring's arity
             !color.isPrimary &&            // Not a primary color
             !activeOrbHexes.has(color.hex); // Not already an active orb in any ring
    });
    // Sort summonableColors (reusing logic from updateEncyclopedia for sorting)
    summonableColors.forEach(color => {
        if (!color.hsl && color.rgb && this.game.colorSystem && typeof this.game.colorSystem.rgbToHsl === 'function') {
            color.hsl = this.game.colorSystem.rgbToHsl(...color.rgb);
        } else if (!color.hsl) {
            color.hsl = { h: 0, s: 0, l: 0 };
        }
    });
    switch (sortOrder) {
        case 'name_asc': summonableColors.sort((a, b) => a.name.localeCompare(b.name)); break;
        case 'name_desc': summonableColors.sort((a, b) => b.name.localeCompare(a.name)); break;
        case 'discovered_asc': summonableColors.sort((a, b) => (a.discoveredTimestamp || 0) - (b.discoveredTimestamp || 0)); break;
        case 'discovered_desc': summonableColors.sort((a, b) => (b.discoveredTimestamp || 0) - (a.discoveredTimestamp || 0)); break;
        case 'hue_asc': summonableColors.sort((a, b) => (a.hsl.h || 0) - (b.hsl.h || 0)); break;
        case 'hue_desc': summonableColors.sort((a, b) => (b.hsl.h || 0) - (a.hsl.h || 0)); break;
        // Add other sort cases if needed, like saturation, lightness, etc.
        default: summonableColors.sort((a, b) => a.name.localeCompare(b.name));
    }
    availableOrbsListUl.innerHTML = ''; // Clear previous list
    if (summonableColors.length === 0) {
      availableOrbsListUl.innerHTML = '<li class="noOrbsMessage">No new colors of this type available to summon. Discover more!</li>';
      return;
    }
    summonableColors.forEach(colorData => {
      const listItem = document.createElement('li');
      listItem.className = 'ringOrbListItem availableOrbListItem'; // Use existing class
      const swatch = document.createElement('div');
      swatch.className = 'ringOrbSwatch';
      swatch.style.backgroundColor = colorData.hex;
      const nameSpan = document.createElement('span');
      nameSpan.className = 'ringOrbName';
      nameSpan.textContent = colorData.name;
      const summonButton = document.createElement('button');
      summonButton.className = 'summonOrbButton';
      summonButton.textContent = 'Summon';
      summonButton.title = `Summon ${colorData.name} to this ring`;
      summonButton.dataset.orbHex = colorData.hex; // Store hex for identification
      summonButton.addEventListener('click', () => {
        if (this.game && typeof this.game.handleSummonOrbRequest === 'function') {
          this.game.handleSummonOrbRequest(colorData, mixArity); // Pass color data and target arity
        } else {
          console.error('Summon function not available on game instance.');
        }
      });
      listItem.appendChild(swatch);
      listItem.appendChild(nameSpan);
      listItem.appendChild(summonButton);
      availableOrbsListUl.appendChild(listItem);
    });
  }
  // updateEncyclopediaPosition() method removed
  async populateAchievementsTab() {
    if (!this.achievementsListContainer || !this.game || !this.game.challengeManager) {
      if (this.achievementsListContainer) this.achievementsListContainer.innerHTML = '<p>Achievements system not ready.</p>';
      console.warn("[UIManager] Achievements tab cannot be populated: Game systems or container not ready.");
      return;
    }
    this.achievementsListContainer.innerHTML = '<p class="loading-message">Loading achievements...</p>'; // Loading state
    try {
      // Fetch comprehensive data including global stats AND total player count
      await this.game.challengeManager.fetchTotalPlayerCount(); // Fetch total player count first
      const achievementsData = await this.game.challengeManager.fetchAllAchievementData();
      const totalPlayers = this.game.challengeManager.totalPlayerCount;
      
      this.achievementsListContainer.innerHTML = ''; // Clear loading message or previous content
      if (!achievementsData || achievementsData.length === 0) {
        this.achievementsListContainer.innerHTML = '<p>No achievements defined or loaded.</p>';
        return;
      }
      console.log(`[UIManager] Populating achievements tab with ${achievementsData.length} achievements (with full stats).`);
      
      const listElement = document.createElement('ul');
      listElement.className = 'achievements-ul';
      achievementsData.forEach(ach => {
        const cardElement = document.createElement('div');
        cardElement.className = 'achievement-card';
        const cardHeader = document.createElement('div');
        cardHeader.className = 'achievement-card-header';
        const nameEl = document.createElement('h3');
        nameEl.textContent = ach.name;
        cardHeader.appendChild(nameEl);
        cardElement.appendChild(cardHeader);
        const cardBody = document.createElement('div');
        cardBody.className = 'achievement-card-body';
        const descriptionEl = document.createElement('p');
        descriptionEl.className = 'achievement-description';
        descriptionEl.textContent = ach.description;
        cardBody.appendChild(descriptionEl);
        const tiersContainer = document.createElement('div');
        tiersContainer.className = 'achievement-tiers';
        // The `ach.tiers` here should now be the `defined_tiers` from RPC, 
        // merged by fetchAllAchievementData to include static definitions and global_completion_count.
        ach.tiers.forEach((tier, index) => {
          const tierDiv = document.createElement('div');
          tierDiv.className = 'achievement-tier';
          
          // Use player_current_tier_index from the fetched achievement data
          if (ach.player_current_tier_index >= index) {
            tierDiv.classList.add('completed');
          }
          const tierIcon = document.createElement('span');
          tierIcon.className = 'tier-icon';
          tierIcon.textContent = tier.icon; // Static data like icon should be preserved
          const tierName = document.createElement('span');
          tierName.className = 'tier-name';
          tierName.textContent = tier.tierName;
          const tierProgressText = document.createElement('span');
          tierProgressText.className = 'tier-progress-text';
          
          // Use player_progress_count from the fetched achievement data
          let currentAmount = ach.player_progress_count || 0;
          let requirementForDisplay = tier.requirement;
          let displayAmount = currentAmount;
          if (ach.player_current_tier_index >= index) { // Tier completed
            tierProgressText.textContent = ` (${requirementForDisplay}/${requirementForDisplay} - Complete!)`;
          } else if (ach.player_current_tier_index === index - 1) { // Current tier target
            tierProgressText.textContent = ` (${Math.min(displayAmount, requirementForDisplay)}/${requirementForDisplay})`;
          } else { // Future tier or not yet started
            tierProgressText.textContent = ` (0/${requirementForDisplay})`;
          }
          
          tierDiv.appendChild(tierIcon);
          tierDiv.appendChild(tierName);
          tierDiv.appendChild(tierProgressText);
          // Display global completion stats
          const tierStatsTooltip = document.createElement('div');
          tierStatsTooltip.className = 'tier-stats-tooltip';
          const globalCompletions = tier.global_completion_count !== undefined ? tier.global_completion_count : 0;
          
          let tooltipText = `Achieved by ${globalCompletions} players globally.`;
          if (totalPlayers !== null && totalPlayers > 0 && globalCompletions !== 'N/A') {
            const percentage = (globalCompletions / totalPlayers) * 100; // Keep as number for comparison
            tooltipText = `Achieved by ${globalCompletions} (${percentage.toFixed(1)}%) of players globally.`;
            // Check for rarity and if player completed this tier
            if (percentage < 1.0 && percentage > 0) { // Ensure percentage is not 0 to avoid applying to unachieved rare tiers
              if (tierDiv.classList.contains('completed')) {
                tierDiv.classList.add('rare-achievement-tier');
              } else {
                tierDiv.classList.add('undiscovered-rare-achievement-tier');
              }
            }
          } else if (globalCompletions === 'N/A') {
            tooltipText = `Global stats unavailable.`;
          } else if (totalPlayers === 0) {
             tooltipText = `Achieved by ${globalCompletions} players globally (0% - no total players count).`;
          }
          tierStatsTooltip.textContent = tooltipText;
          tierDiv.appendChild(tierStatsTooltip);
          
          // tierDiv.title attribute removed to prevent double tooltip
          tiersContainer.appendChild(tierDiv);
        });
        cardBody.appendChild(tiersContainer);
        cardElement.appendChild(cardBody);
        listElement.appendChild(cardElement);
      });
      this.achievementsListContainer.appendChild(listElement);
    } catch (error) {
      console.error('[UIManager] Error populating achievements tab:', error);
      this.achievementsListContainer.innerHTML = '<p class="error-message">Could not load achievements. Please try again later.</p>';
    }
  }
  setupBattleModeButtonListener() {
    if (this.battleModeButton) {
      this.battleModeButton.addEventListener('click', () => {
        // console.log('Battle Mode button clicked! Transitioning to Lobby.');
        this.showLobbyScreen(true); 
      });
    }
    // The old closeBattleModeButton listener is removed.
    // The new battleModeActionButton listener is setup here:
    if (this.battleModeActionButton) {
        this.battleModeActionButton.addEventListener('click', () => this.handleBattleActionClick());
    }
    // Player One and Player Two mix button listeners are now set up in _initializeAndBindPlayerMixButtons
  }
  _initializeAndBindPlayerMixButtons() {
    if (this._playerMixButtonListenersAttached) {
        return; // Listeners already attached
    }
    if (!this.playerOneMixButton) {
        this.playerOneMixButton = document.getElementById('playerOneMixButton');
        console.log('[UIManager _initializeAndBindPlayerMixButtons] P1 Mix Button DOM Element:', this.playerOneMixButton);
    }
    if (!this.playerTwoMixButton) {
        this.playerTwoMixButton = document.getElementById('playerTwoMixButton');
        console.log('[UIManager _initializeAndBindPlayerMixButtons] P2 Mix Button DOM Element:', this.playerTwoMixButton);
    }
    let listenersAttachedThisCall = false;
    if (this.playerOneMixButton) {
        this.playerOneMixButton.addEventListener('click', () => {
            console.log('[UIManager] Player ONE Battle Mix Button CLICKED');
            this.handlePlayerOneMixAttempt();
        });
        listenersAttachedThisCall = true;
    } else {
        console.warn('[UIManager _initializeAndBindPlayerMixButtons] Player ONE Mix Button not found in DOM. Listener not attached.');
        if (this.battleModeScreen) {
            console.log('[UIManager _initializeAndBindPlayerMixButtons] Current innerHTML of this.battleModeScreen (P1 button search failed):', this.battleModeScreen.innerHTML);
        } else {
            console.warn('[UIManager _initializeAndBindPlayerMixButtons] this.battleModeScreen is ALSO null or undefined when P1 button search failed.');
        }
    }
    if (this.playerTwoMixButton) {
        this.playerTwoMixButton.addEventListener('click', () => {
            console.log('[UIManager] Player TWO Battle Mix Button CLICKED');
            this.handlePlayerTwoMixAttempt();
        });
        listenersAttachedThisCall = true;
    } else {
        console.warn('[UIManager _initializeAndBindPlayerMixButtons] Player TWO Mix Button not found in DOM. Listener not attached.');
        if (this.battleModeScreen) {
            // No need to log innerHTML again if P1 already logged it, but good to have the check
        } else {
            console.warn('[UIManager _initializeAndBindPlayerMixButtons] this.battleModeScreen is ALSO null or undefined when P2 button search failed.');
        }
    }
    if (listenersAttachedThisCall) { // Mark as attached if at least one was attempted (even if one button was null, we don't want to re-attempt infinitely)
        this._playerMixButtonListenersAttached = true;
    }
  }
  showBattleModeScreen(show, sessionData = null, isLocalPlayerOne = null) {
    this.currentBattleSessionData = sessionData; // Store session data
    this.localPlayerIsOne = isLocalPlayerOne; // Store who the local player is
    if (this.battleModeScreen) {
      this.battleModeScreen.style.display = show ? 'flex' : 'none'; // Use flex due to new CSS
      if (show) {
        this._initializeAndBindPlayerMixButtons(); // Ensure buttons are initialized and listeners attached
        
        // When showing battle mode, hide other major overlays
        if (this.fullscreenEncyclopedia && this.fullscreenEncyclopedia.style.display !== 'none') {
          this.showEncyclopedia(false);
        }
        if (this.gameLeaderboardPanelEl && this.gameLeaderboardPanelEl.style.display !== 'none') {
          this.gameLeaderboardPanelEl.style.display = 'none';
        }
        
        // Optionally blur or hide the main gameArea if battle mode takes full focus
        if (this.gameArea) {
           this.gameArea.style.filter = 'blur(8px)';
           this.gameArea.style.pointerEvents = 'none';
        }
        
        // Update player labels based on who the local player is
        const playerOneLabelEl = document.getElementById('playerOneBattleLabel');
        const playerTwoLabelEl = document.getElementById('playerTwoBattleLabel');
        
        if (this.localPlayerIsOne !== null) { // Use the passed-in flag
            if (playerOneLabelEl) {
                playerOneLabelEl.textContent = this.localPlayerIsOne ? "You (Player 1)" : "Opponent (Player 1)";
                if (this.localPlayerIsOne) playerOneLabelEl.classList.add('local-player-label');
                else playerOneLabelEl.classList.remove('local-player-label');
            }
            if (playerTwoLabelEl) {
                playerTwoLabelEl.textContent = !this.localPlayerIsOne ? "You (Player 2)" : "Opponent (Player 2)";
                if (!this.localPlayerIsOne) playerTwoLabelEl.classList.add('local-player-label');
                else playerTwoLabelEl.classList.remove('local-player-label');
            }
        } else { // Fallback (e.g. local mode not explicitly passing the flag, main.js defaults to true)
            if (playerOneLabelEl) playerOneLabelEl.textContent = "Player 1";
            if (playerTwoLabelEl) playerTwoLabelEl.textContent = "Player 2";
        }
        console.log(`[UIManager] Showing Battle Screen. Session: ${sessionData ? sessionData.id : 'Local'}. Local is P1: ${this.localPlayerIsOne}`);
        // Timer is now started by enableBattleModeInteractionsAndStartTimer after readiness check
        // this.startBattleTimer(60); 
        
        if (this.game) {
            if (typeof this.game.prepareForBattle === 'function') {
                this.game.prepareForBattle(this.currentBattleSessionData); 
            }
            
            this.playerOneAvailableBattleOrbs = []; 
            this.initializePlayerOneBattleOrbs();
            this.playerOneBattleSelection = []; 
            this.updatePlayerOneSelectedOrbsDisplay(); 
            this.clearPlayerOneMixedColorDisplay(); 
            this.updatePlayerOneBattleScoreDisplay(Infinity);
            
            this.playerTwoAvailableBattleOrbs = []; 
            this.initializePlayerTwoBattleOrbs();
            this.playerTwoBattleSelection = [];
            this.updatePlayerTwoSelectedOrbsDisplay();
            this.clearPlayerTwoMixedColorDisplay();
            this.updatePlayerTwoBattleScoreDisplay(Infinity);
            // Enable/Disable controls based on localPlayerIsOne
            if (this.playerOneMixButton) {
                this.playerOneMixButton.disabled = this.localPlayerIsOne ? true : true; // Initially true, enabled by orb selection
                 console.log(`[UIManager Battle] P1 Mix Button. Local is P1: ${this.localPlayerIsOne}. Disabled initially: ${this.playerOneMixButton.disabled}`);
            }
            if (this.playerTwoMixButton) {
                this.playerTwoMixButton.disabled = !this.localPlayerIsOne ? true : true; // Initially true, enabled by orb selection
                console.log(`[UIManager Battle] P2 Mix Button. Local is P1: ${this.localPlayerIsOne}. Disabled initially: ${this.playerTwoMixButton.disabled}`);
            }
            if (this.playerOneBattleOrbsContainer) {
                this.playerOneBattleOrbsContainer.style.pointerEvents = this.localPlayerIsOne ? 'auto' : 'none';
                this.playerOneBattleOrbsContainer.style.opacity = this.localPlayerIsOne ? '1' : '0.5';
                 console.log(`[UIManager Battle] P1 Orbs. Local is P1: ${this.localPlayerIsOne}. Interactive: ${this.playerOneBattleOrbsContainer.style.pointerEvents === 'auto'}`);
            }
            if (this.playerTwoBattleOrbsContainer) {
                this.playerTwoBattleOrbsContainer.style.pointerEvents = !this.localPlayerIsOne ? 'auto' : 'none';
                this.playerTwoBattleOrbsContainer.style.opacity = !this.localPlayerIsOne ? '1' : '0.5';
                 console.log(`[UIManager Battle] P2 Orbs. Local is P1: ${this.localPlayerIsOne}. Interactive: ${this.playerTwoBattleOrbsContainer.style.pointerEvents === 'auto'}`);
            }
        }
      } else { // Hiding battle screen
        this.currentBattleSessionData = null;
        this.localPlayerIsOne = null; // Reset flag
        if (this.gameArea) {
           this.gameArea.style.filter = 'none';
        }
         this.stopBattleTimer();
         this.playerOneBattleSelection = []; 
         if (this.playerOneBattleOrbsContainer) this.playerOneBattleOrbsContainer.innerHTML = ''; 
         this.updatePlayerOneSelectedOrbsDisplay(); 
         this.playerTwoBattleSelection = [];
         if (this.playerTwoBattleOrbsContainer) this.playerTwoBattleOrbsContainer.innerHTML = '';
         this.updatePlayerTwoSelectedOrbsDisplay();
         this.clearPlayerTwoMixedColorDisplay();
      }
    }
  }
  startBattleTimer(durationSeconds) {
    this.stopBattleTimer(); // Clear any existing timer
    this.battleTimerSeconds = durationSeconds;
    this.updateBattleTimerDisplay();
    this.battleTimerInterval = setInterval(() => {
      this.battleTimerSeconds--;
      this.updateBattleTimerDisplay();
      if (this.battleTimerSeconds <= 0) {
        this.stopBattleTimer();
        // TODO: Implement end-of-battle logic (e.g., show results)
        console.log("Battle Timer Expired!");
        // Potentially emit an event or call a game manager function
        if (this.game && typeof this.game.handleBattleEnd === 'function') {
           this.game.handleBattleEnd('timer_expired');
        }
      }
    }, 1000);
  }
  stopBattleTimer() {
    if (this.battleTimerInterval) {
      clearInterval(this.battleTimerInterval);
      this.battleTimerInterval = null;
    }
  }
  updateBattleTimerDisplay() {
    if (this.battleModeTimerDisplay) {
      const minutes = Math.floor(this.battleTimerSeconds / 60);
      const seconds = this.battleTimerSeconds % 60;
      this.battleModeTimerDisplay.textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }
// DEPRECATED for multiplayer battle mode. Target color must be shared.
// This function should NOT be called by game.prepareForBattle for multiplayer.
// Game logic (main.js/game.js) should generate/fetch ONE target color for the session
// and then call displaySpecificTargetColor on UIManager for both players.
displayRandomTargetColor(discoveredColors) {
    console.warn("[UIManager] DEPRECATED displayRandomTargetColor was called. This is problematic for shared Battle Mode. The game logic should provide a specific target color for the session.");
    if (!this.targetBattleColorDisplay || !this.targetBattleColorInfo) {
        console.warn("Target color display elements not found.");
        return null;
    }
    // Fallback behavior if called directly (e.g. for a non-networked test or single player mode if that existed)
    // This part remains largely the same but it's usage in battle mode context is now incorrect.
    if (!this.game || !this.game.colorSystem) {
        console.warn("Game/ColorSystem not available for random target color generation in UIManager.");
        this.targetBattleColorDisplay.style.backgroundColor = '#333';
        this.targetBattleColorInfo.textContent = 'Error setting target (system issue).';
        return null;
    }
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const randomRGB = [r, g, b];
    let hexString = this.game.colorSystem.rgbToHex(r, g, b);
    const hsl = this.game.colorSystem.rgbToHsl(...randomRGB);
    const targetColor = { name: "Mystery Target", hex: hexString, rgb: randomRGB, hsl: hsl };
    
    this.targetBattleColorDisplay.style.backgroundColor = targetColor.hex;
    this.targetBattleColorDisplay.textContent = ''; 
    this.targetBattleColorInfo.innerHTML = `<strong>${targetColor.name}</strong><br>Try to match this color!`;
    
    this.currentGameBattleTargetColor = targetColor; 
    console.log("[UIManager] DEPRECATED Battle Mode Random (local only) HEX Target Color Set:", targetColor.hex);
    return targetColor;
}
  displaySpecificTargetColor(targetColor) {
    if (!this.targetBattleColorDisplay || !this.targetBattleColorInfo || !targetColor || !this.game || !this.game.colorSystem) {
        console.warn("[UIManager] Cannot display specific target color: Critical elements missing or no targetColor provided.");
        if (this.targetBattleColorDisplay) this.targetBattleColorDisplay.style.backgroundColor = '#333';
        if (this.targetBattleColorInfo) this.targetBattleColorInfo.textContent = 'Target color not set.';
        return null;
    }
    this.targetBattleColorDisplay.style.backgroundColor = targetColor.hex;
    this.targetBattleColorDisplay.textContent = ''; // Clear placeholder text
    // For specific target colors (e.g., if a challenge mode uses this), we might still show details,
    // but for consistency with the random target, let's hide RGB/HSL here too.
    // The results screen will always show the full details.
    this.targetBattleColorInfo.innerHTML = `
        <strong>${targetColor.name}</strong><br>
        Match this specific color!
    `;
    
    this.currentGameBattleTargetColor = targetColor; 
    console.log("[UIManager] Battle Mode Target Color Set (Specific, RGB/HSL hidden):", targetColor.name);
    return targetColor; // Return the chosen color
}
  initializePlayerOneBattleOrbs() {
    if (!this.game || !this.game.colorSystem) {
        console.warn("[UIManager] Color system not available for Player 1 battle orbs initialization.");
        this.playerOneAvailableBattleOrbs = [];
        return;
    }
    if (!this.playerOneBattleOrbsContainer) {
        console.warn("[UIManager] Player 1 battle orbs container not found.");
        return;
    }
    const cs = this.game.colorSystem;
    // Define the 7 starting orbs for Player 1 with their grid positions and symbols
    // Define the 7 starting orbs for Player 1 with their 5-column grid positions and symbols
    const baseOrbSetups = [
        { name: 'White',       position: 'orb-pos-r1-c1', symbol: null }, // Row 1, Col 1
        { name: 'Red',         position: 'orb-pos-r1-c2', symbol: null }, // Row 1, Col 2
        { name: 'Yellow',      position: 'orb-pos-r1-c3', symbol: null }, // Row 1, Col 3
        { name: 'Blue',        position: 'orb-pos-r1-c4', symbol: null }, // Row 1, Col 4
        { name: 'Black',       position: 'orb-pos-r1-c5', symbol: null }, // Row 1, Col 5
        { name: 'Saturator',   position: 'orb-pos-r2-c1', symbol: 'S'  }, // Row 2, Col 1
        { name: 'Desaturator', position: 'orb-pos-r2-c5', symbol: 'D'  }  // Row 2, Col 5
    ];
    this.playerOneAvailableBattleOrbs = baseOrbSetups.map(orbInfo => {
        const colorData = cs.getDiscoveredColors().find(c => c.name === orbInfo.name);
        if (!colorData) {
            console.warn(`[UIManager] Player 1 battle orb color not found in ColorSystem: ${orbInfo.name}`);
            return { 
                colorData: { name: orbInfo.name, hex: '#808080', isFallback: true }, // Fallback visual
                position: orbInfo.position,
                symbol: orbInfo.symbol 
            };
        }
        return { colorData, position: orbInfo.position, symbol: orbInfo.symbol };
    }).filter(Boolean); // Filter out any null/undefined entries if a color was critically missing and returned null
    this.renderPlayerOneBattleOrbs();
  }
  renderPlayerOneBattleOrbs() {
    if (!this.playerOneBattleOrbsContainer) return;
    this.playerOneBattleOrbsContainer.innerHTML = ''; // Clear previous orbs
    this.playerOneAvailableBattleOrbs.forEach(orbSetup => {
        if (!orbSetup || !orbSetup.colorData) return;
        const orbEl = document.createElement('div');
        orbEl.classList.add('battle-source-orb');
        if (orbSetup.position) { // Starting orbs have fixed positions
            orbEl.classList.add(orbSetup.position);
        } else { // Dynamically added orbs might need a different class or rely on flexbox flow
            orbEl.classList.add('dynamic-battle-orb'); 
        }
        orbEl.style.backgroundColor = orbSetup.colorData.hex;
        orbEl.title = orbSetup.colorData.name;
        if (orbSetup.symbol) {
            orbEl.textContent = orbSetup.symbol;
            const luminance = this.#calculateLuminance(orbSetup.colorData.rgb || [0,0,0]); // Ensure rgb exists
            orbEl.style.color = luminance > 0.5 ? 'black' : 'white';
        } else if (!orbSetup.position) { // For dynamic orbs without a symbol, maybe a small dot or icon
            // Example: add a small inner circle or just rely on color
            // orbEl.innerHTML = '<span class="dynamic-orb-indicator">●</span>';
        }
        
        orbEl.addEventListener('click', () => this.handlePlayerOneBattleOrbClick(orbSetup.colorData));
        this.playerOneBattleOrbsContainer.appendChild(orbEl);
    });
}
  handlePlayerOneBattleOrbClick(colorData) {
    console.log('[UIManager] P1 Orb Click. Local is P1:', this.localPlayerIsOne, 'Color:', colorData ? colorData.name : 'undefined');
    if (!this.localPlayerIsOne) {
        console.log("[UIManager] Ignoring P1 orb click because local player is P2.");
        return; 
    }
    if (this.playerOneBattleSelection.length >= this.MAX_BATTLE_SELECTION) {
        console.log("Player 1: Maximum orb selection reached.");
        return;
    }
    const selectedIndex = this.playerOneBattleSelection.findIndex(selectedOrb => selectedOrb.hex === colorData.hex);
    if (selectedIndex > -1) {
        // Orb is already selected, so remove it (deselect)
        this.playerOneBattleSelection.splice(selectedIndex, 1);
        console.log(`Player 1: Orb ${colorData.name} deselected.`);
    } else {
        // Orb is not selected, add it if max not reached
        if (this.playerOneBattleSelection.length >= this.MAX_BATTLE_SELECTION) {
            console.log("Player 1: Maximum orb selection reached. Cannot add new orb.");
            return;
        }
        this.playerOneBattleSelection.push(colorData);
        console.log(`Player 1: Orb ${colorData.name} selected.`);
    }
    this.updatePlayerOneSelectedOrbsDisplay();
    if (this.playerOneMixButton) {
        const canMix = this.playerOneBattleSelection.length >= 2 && this.playerOneBattleSelection.length <= this.MAX_BATTLE_SELECTION;
        this.playerOneMixButton.disabled = !canMix;
        console.log(`[UIManager P1 Orb Click/Deselect] P1 Mix Button updated. Can mix: ${canMix}. Disabled: ${this.playerOneMixButton.disabled}`);
    } else {
        console.warn('[UIManager P1 Orb Click/Deselect] P1 Mix Button NOT FOUND when trying to set disabled state.');
    }
    // Future: Notify game logic to enable/disable P1's mix button
    // if (this.game && typeof this.game.updateBattlePlayerState === 'function') {
    //   this.game.updateBattlePlayerState('player1', { selection: this.playerOneBattleSelection });
    // }
  }
  updatePlayerOneSelectedOrbsDisplay() {
    if (!this.playerOneSelectedOrbsContainer) return;
    const placeholders = this.playerOneSelectedOrbsContainer.querySelectorAll('.orb-placeholder');
    
    placeholders.forEach((placeholder, index) => {
        placeholder.innerHTML = ''; // Clear any previous orb swatch
        placeholder.classList.remove('has-orb');
        // backgroundColor is handled by .orb-placeholder CSS, no need to reset here unless it was changed directly
        if (index < this.playerOneBattleSelection.length) {
            const selectedOrbData = this.playerOneBattleSelection[index];
            placeholder.classList.add('has-orb');
            
            const orbSwatchEl = document.createElement('div');
            orbSwatchEl.classList.add('selected-battle-orb');
            orbSwatchEl.style.backgroundColor = selectedOrbData.hex;
            orbSwatchEl.title = selectedOrbData.name; // Tooltip for the selected swatch
            placeholder.appendChild(orbSwatchEl);
        }
        // Else: placeholder remains empty, styled by its default CSS
    });
  }
  handlePlayerOneMixAttempt() {
    console.log('[UIManager] P1 Mix Attempt. Local is P1:', this.localPlayerIsOne);
    if (!this.localPlayerIsOne) {
        console.log("[UIManager] Ignoring P1 mix attempt because local player is P2.");
        return;
    }
    if (!this.game || !this.game.colorSystem || !this.playerOneColorDisplay || !this.playerOneColorResultInfo) {
        console.warn("[UIManager] Cannot attempt P1 mix: critical components missing.");
        return;
    }
    if (this.playerOneBattleSelection.length < 2) {
        this.displayPlayerOneMixedColor(null, "Select at least 2 orbs to mix!");
        return;
    }
    console.log('[UIManager] P1 Mix Attempt. Input Orbs:', 
        this.playerOneBattleSelection.map(orb => ({ 
            name: orb.name, 
            hex: orb.hex, 
            isPrimary: orb.isPrimary, 
            isShadingColor: orb.isShadingColor, 
            isSaturationModifier: orb.isSaturationModifier 
        }))
    );
    // For more exhaustive debugging, you could uncomment the following line:
    // console.log('[UIManager] P1 Full Selection Data for Mix:', JSON.stringify(this.playerOneBattleSelection));
    const mixedColor = this.game.colorSystem.mixColors(this.playerOneBattleSelection);
    console.log('[UIManager] P1 Mix Attempt. Result from colorSystem:', 
        mixedColor ? { name: mixedColor.name, hex: mixedColor.hex, rgb: mixedColor.rgb } : 'null (mix failed or no result)'
    );
    // For more exhaustive debugging of the result, you could uncomment the following line:
    // console.log('[UIManager] P1 Full Mix Result Data:', JSON.stringify(mixedColor));
    this.displayPlayerOneMixedColor(mixedColor);
    if (mixedColor) { // Only add if the mix was successful
        // Check if this color (by hex) is already in available orbs to avoid duplicates
        if (!this.playerOneAvailableBattleOrbs.some(orb => orb.colorData.hex === mixedColor.hex)) {
            this.playerOneAvailableBattleOrbs.push({ 
                colorData: mixedColor, 
                // No fixed 'position' for dynamically added orbs, symbol is also not applicable here
                // Orbs added this way will be rendered differently or just appended
            });
            this.renderPlayerOneBattleOrbs(); // Re-render to show the new orb
            console.log(`[UIManager] Added ${mixedColor.name} to Player 1's available battle orbs.`);
        }
    }
    if (this.game && typeof this.game.handlePlayerOneBattleMixResult === 'function') {
      this.game.handlePlayerOneBattleMixResult(mixedColor, this.currentGameBattleTargetColor);
    }
    this.playerOneBattleSelection = [];
    this.updatePlayerOneSelectedOrbsDisplay();
    if (this.playerOneMixButton) {
        this.playerOneMixButton.disabled = true; // Disable after attempt
    }
}
  displayPlayerOneMixedColor(colorData, customMessage = null) {
    if (!this.playerOneColorDisplay || !this.playerOneColorResultInfo) return;
    if (customMessage) {
        this.playerOneColorDisplay.style.backgroundColor = '#555'; // Default/failed color
        this.playerOneColorDisplay.textContent = 'X';
        this.playerOneColorResultInfo.innerHTML = `<strong>${customMessage}</strong>`;
        return;
    }
    if (colorData) {
        this.playerOneColorDisplay.style.backgroundColor = colorData.hex;
        this.playerOneColorDisplay.textContent = ''; // Clear any placeholder
        const hsl = this.game.colorSystem.rgbToHsl(...colorData.rgb);
        this.playerOneColorResultInfo.innerHTML = `
            <strong>${colorData.name}</strong><br>
            RGB: (${colorData.rgb.join(', ')})<br>
            HSL: ${hsl.h.toFixed(0)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%
        `;
    } else {
        this.playerOneColorDisplay.style.backgroundColor = '#555'; // Default/failed color
        this.playerOneColorDisplay.textContent = 'X'; 
        this.playerOneColorResultInfo.innerHTML = `<strong>Mix Failed!</strong><br>Try a different combination.`;
    }
  }
  clearPlayerOneMixedColorDisplay() {
    if (this.playerOneColorDisplay) {
        this.playerOneColorDisplay.style.backgroundColor = '#3a3a5a'; // Initial placeholder bg
        this.playerOneColorDisplay.textContent = '?';
    }
    if (this.playerOneColorResultInfo) {
        this.playerOneColorResultInfo.innerHTML = 'Your mixed color will appear here.';
    }
  }
  updatePlayerOneBattleScoreDisplay(score) {
    if (this.playerOneBattleScoreDisplay) {
      if (score === Infinity || typeof score !== 'number') {
        this.playerOneBattleScoreDisplay.textContent = "---";
      } else {
        this.playerOneBattleScoreDisplay.textContent = score.toFixed(2);
      }
    }
  }
  // --- Player 2 Battle Mode Methods (mirrors Player 1 for now) ---
  initializePlayerTwoBattleOrbs() {
    if (!this.game || !this.game.colorSystem || !this.playerTwoBattleOrbsContainer) {
        console.warn("[UIManager] Critical components missing for Player 2 battle orbs initialization.");
        this.playerTwoAvailableBattleOrbs = [];
        return;
    }
    const cs = this.game.colorSystem;
    // Using the same base orb setup as Player 1 for now
    // If P2 needs distinct orb positions (e.g. orb-pos-p2-1-1), this needs to be adjusted.
    // For now, assuming playerTwoSourceOrbs HTML uses the same class names for grid positions.
    // Define the 7 starting orbs for Player 2 with their 5-column grid positions and symbols
    // (Same as Player 1 for consistency)
    const baseOrbSetups = [
        { name: 'White',       position: 'orb-pos-r1-c1', symbol: null },
        { name: 'Red',         position: 'orb-pos-r1-c2', symbol: null },
        { name: 'Yellow',      position: 'orb-pos-r1-c3', symbol: null },
        { name: 'Blue',        position: 'orb-pos-r1-c4', symbol: null },
        { name: 'Black',       position: 'orb-pos-r1-c5', symbol: null },
        { name: 'Saturator',   position: 'orb-pos-r2-c1', symbol: 'S'  },
        { name: 'Desaturator', position: 'orb-pos-r2-c5', symbol: 'D'  }
    ];
    this.playerTwoAvailableBattleOrbs = baseOrbSetups.map(orbInfo => {
        const colorData = cs.getDiscoveredColors().find(c => c.name === orbInfo.name);
        if (!colorData) {
            console.warn(`[UIManager] Player 2 battle orb color not found: ${orbInfo.name}`);
            return { colorData: { name: orbInfo.name, hex: '#808080', isFallback: true }, position: orbInfo.position, symbol: orbInfo.symbol };
        }
        return { colorData, position: orbInfo.position, symbol: orbInfo.symbol };
    }).filter(Boolean);
    this.renderPlayerTwoBattleOrbs();
  }
  renderPlayerTwoBattleOrbs() {
    if (!this.playerTwoBattleOrbsContainer) return;
    this.playerTwoBattleOrbsContainer.innerHTML = '';
    this.playerTwoAvailableBattleOrbs.forEach(orbSetup => {
        if (!orbSetup || !orbSetup.colorData) return;
        const orbEl = document.createElement('div');
        orbEl.classList.add('battle-source-orb');
        if (orbSetup.position) {
            orbEl.classList.add(orbSetup.position);
        } else {
            orbEl.classList.add('dynamic-battle-orb');
        }
        orbEl.style.backgroundColor = orbSetup.colorData.hex;
        orbEl.title = orbSetup.colorData.name;
        if (orbSetup.symbol) {
            orbEl.textContent = orbSetup.symbol;
            const luminance = this.#calculateLuminance(orbSetup.colorData.rgb || [0,0,0]); // Ensure rgb exists
            orbEl.style.color = luminance > 0.5 ? 'black' : 'white';
        }
        
        orbEl.addEventListener('click', () => this.handlePlayerTwoBattleOrbClick(orbSetup.colorData));
        this.playerTwoBattleOrbsContainer.appendChild(orbEl);
    });
}
  handlePlayerTwoBattleOrbClick(colorData) {
    console.log('[UIManager] P2 Orb Click. Local is P1:', this.localPlayerIsOne, 'Color:', colorData ? colorData.name : 'undefined');
    if (this.localPlayerIsOne) { // Note: condition is true if localPlayerIsOne (i.e., local player is P1, so P2 is opponent)
        console.log("[UIManager] Ignoring P2 orb click because local player is P1.");
        return;
    }
    if (this.playerTwoBattleSelection.length >= this.MAX_BATTLE_SELECTION) {
        console.log("Player 2: Maximum orb selection reached.");
        return;
    }
    const selectedIndex = this.playerTwoBattleSelection.findIndex(selectedOrb => selectedOrb.hex === colorData.hex);
    if (selectedIndex > -1) {
        // Orb is already selected, so remove it (deselect)
        this.playerTwoBattleSelection.splice(selectedIndex, 1);
        console.log(`Player 2: Orb ${colorData.name} deselected.`);
    } else {
        // Orb is not selected, add it if max not reached
        if (this.playerTwoBattleSelection.length >= this.MAX_BATTLE_SELECTION) {
            console.log("Player 2: Maximum orb selection reached. Cannot add new orb.");
            return;
        }
        this.playerTwoBattleSelection.push(colorData);
        console.log(`Player 2: Orb ${colorData.name} selected.`);
    }
    this.updatePlayerTwoSelectedOrbsDisplay();
    if (this.playerTwoMixButton) {
        const canMix = this.playerTwoBattleSelection.length >= 2 && this.playerTwoBattleSelection.length <= this.MAX_BATTLE_SELECTION;
        this.playerTwoMixButton.disabled = !canMix;
        console.log(`[UIManager P2 Orb Click/Deselect] P2 Mix Button updated. Can mix: ${canMix}. Disabled: ${this.playerTwoMixButton.disabled}`);
    } else {
        console.warn('[UIManager P2 Orb Click/Deselect] P2 Mix Button NOT FOUND when trying to set disabled state.');
    }
  }
  updatePlayerTwoSelectedOrbsDisplay() {
    if (!this.playerTwoSelectedOrbsContainer) return;
    const placeholders = this.playerTwoSelectedOrbsContainer.querySelectorAll('.orb-placeholder');
    placeholders.forEach((placeholder, index) => {
        placeholder.innerHTML = '';
        placeholder.classList.remove('has-orb');
        if (index < this.playerTwoBattleSelection.length) {
            const selectedOrbData = this.playerTwoBattleSelection[index];
            placeholder.classList.add('has-orb');
            const orbSwatchEl = document.createElement('div');
            orbSwatchEl.classList.add('selected-battle-orb');
            orbSwatchEl.style.backgroundColor = selectedOrbData.hex;
            orbSwatchEl.title = selectedOrbData.name;
            placeholder.appendChild(orbSwatchEl);
        }
    });
  }
  handlePlayerTwoMixAttempt() {
    console.log('[UIManager] P2 Mix Attempt. Local is P1:', this.localPlayerIsOne);
    if (this.localPlayerIsOne) { // Note: condition is true if localPlayerIsOne (i.e., local player is P1, so P2 is opponent)
        console.log("[UIManager] Ignoring P2 mix attempt because local player is P1.");
        return;
    }
    if (!this.game || !this.game.colorSystem || !this.playerTwoColorDisplay || !this.playerTwoColorResultInfo) {
        console.warn("[UIManager] Cannot attempt P2 mix: critical components missing.");
        return;
    }
    if (this.playerTwoBattleSelection.length < 2) {
        this.displayPlayerTwoMixedColor(null, "Select at least 2 orbs to mix!");
        return;
    }
    console.log('[UIManager] P2 Mix Attempt. Input Orbs:', 
        this.playerTwoBattleSelection.map(orb => ({ 
            name: orb.name, 
            hex: orb.hex, 
            isPrimary: orb.isPrimary, 
            isShadingColor: orb.isShadingColor, 
            isSaturationModifier: orb.isSaturationModifier 
        }))
    );
    // For more exhaustive debugging, you could uncomment the following line:
    // console.log('[UIManager] P2 Full Selection Data for Mix:', JSON.stringify(this.playerTwoBattleSelection));
    const mixedColor = this.game.colorSystem.mixColors(this.playerTwoBattleSelection);
    console.log('[UIManager] P2 Mix Attempt. Result from colorSystem:', 
        mixedColor ? { name: mixedColor.name, hex: mixedColor.hex, rgb: mixedColor.rgb } : 'null (mix failed or no result)'
    );
    // For more exhaustive debugging of the result, you could uncomment the following line:
    // console.log('[UIManager] P2 Full Mix Result Data:', JSON.stringify(mixedColor));
    this.displayPlayerTwoMixedColor(mixedColor);
    if (mixedColor) { // Only add if the mix was successful
        if (!this.playerTwoAvailableBattleOrbs.some(orb => orb.colorData.hex === mixedColor.hex)) {
            this.playerTwoAvailableBattleOrbs.push({ colorData: mixedColor });
            this.renderPlayerTwoBattleOrbs(); // Re-render to show the new orb
            console.log(`[UIManager] Added ${mixedColor.name} to Player 2's available battle orbs.`);
        }
    }
    if (this.game && typeof this.game.handlePlayerTwoBattleMixResult === 'function') {
      this.game.handlePlayerTwoBattleMixResult(mixedColor, this.currentGameBattleTargetColor);
    }
    this.playerTwoBattleSelection = [];
    this.updatePlayerTwoSelectedOrbsDisplay();
    if (this.playerTwoMixButton) {
        this.playerTwoMixButton.disabled = true;
    }
}
  displayPlayerTwoMixedColor(colorData, customMessage = null) {
    if (!this.playerTwoColorDisplay || !this.playerTwoColorResultInfo) return;
    if (customMessage) {
        this.playerTwoColorDisplay.style.backgroundColor = '#555';
        this.playerTwoColorDisplay.textContent = 'X';
        this.playerTwoColorResultInfo.innerHTML = `<strong>${customMessage}</strong>`;
        return;
    }
    if (colorData) {
        this.playerTwoColorDisplay.style.backgroundColor = colorData.hex;
        this.playerTwoColorDisplay.textContent = '';
        const hsl = this.game.colorSystem.rgbToHsl(...colorData.rgb);
        this.playerTwoColorResultInfo.innerHTML = `
            <strong>${colorData.name}</strong><br>
            RGB: (${colorData.rgb.join(', ')})<br>
            HSL: ${hsl.h.toFixed(0)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%
        `;
    } else {
        this.playerTwoColorDisplay.style.backgroundColor = '#555';
        this.playerTwoColorDisplay.textContent = 'X';
        this.playerTwoColorResultInfo.innerHTML = `<strong>Mix Failed!</strong><br>Try a different combination.`;
    }
  }
  clearPlayerTwoMixedColorDisplay() {
    if (this.playerTwoColorDisplay) {
        this.playerTwoColorDisplay.style.backgroundColor = '#3a3a5a';
        this.playerTwoColorDisplay.textContent = '?';
    }
    if (this.playerTwoColorResultInfo) {
        this.playerTwoColorResultInfo.innerHTML = 'Your mixed color will appear here.';
    }
  }
  updatePlayerTwoBattleScoreDisplay(score) {
    if (this.playerTwoBattleScoreDisplay) {
      if (score === Infinity || typeof score !== 'number') {
        this.playerTwoBattleScoreDisplay.textContent = "---";
      } else {
        this.playerTwoBattleScoreDisplay.textContent = score.toFixed(2);
      }
    }
  }
  setupBattleResultsListeners() {
    if (this.closeBattleResultsButton) {
      this.closeBattleResultsButton.addEventListener('click', () => this.hideBattleResults());
    }
  }
  displayBattleResults(playerOneBestAttempt, playerTwoBestAttempt, targetColorData, winnerMessage) {
    if (!this.battleResultsScreen || !this.game || !this.game.colorSystem) {
      console.warn("[UIManager] Battle results screen elements or game/color system not found. Cannot display results.");
      return;
    }
    // Set winner message
    if (this.battleWinnerMessage) {
      this.battleWinnerMessage.textContent = winnerMessage;
    }
    // Update Player Labels on Results Screen
    if (this.game && this.game.isLocalPlayerOne !== null) {
        if (this.playerOneResultLabel) {
            this.playerOneResultLabel.textContent = this.game.isLocalPlayerOne ? "You (Player 1)" : "Opponent (Player 1)";
            if (this.game.isLocalPlayerOne) this.playerOneResultLabel.classList.add('local-player-label');
            else this.playerOneResultLabel.classList.remove('local-player-label');
        }
        if (this.playerTwoResultLabel) {
            this.playerTwoResultLabel.textContent = !this.game.isLocalPlayerOne ? "You (Player 2)" : "Opponent (Player 2)";
            if (!this.game.isLocalPlayerOne) this.playerTwoResultLabel.classList.add('local-player-label');
            else this.playerTwoResultLabel.classList.remove('local-player-label');
        }
    } else {
        // Fallback if game state isn't ready
        if (this.playerOneResultLabel) this.playerOneResultLabel.textContent = "Player 1";
        if (this.playerTwoResultLabel) this.playerTwoResultLabel.textContent = "Player 2";
    }
    // Display Target Color
    if (this.targetColorResultSwatch && this.targetColorResultInfo && targetColorData) {
      this.targetColorResultSwatch.style.backgroundColor = targetColorData.hex;
      const hsl = this.game.colorSystem.rgbToHsl(...targetColorData.rgb);
      this.targetColorResultInfo.innerHTML = `
        <strong>${targetColorData.name}</strong><br>
        HEX: ${targetColorData.hex}<br>
        RGB: (${targetColorData.rgb.join(', ')})<br>
        HSL: ${hsl.h.toFixed(0)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%
      `;
    }
    // Helper to format player result info
    const formatPlayerResult = (playerAttempt) => {
      if (playerAttempt && playerAttempt.colorData) {
        const { colorData, difference } = playerAttempt;
        const hsl = this.game.colorSystem.rgbToHsl(...colorData.rgb);
        return {
          hex: colorData.hex,
          html: `
            <strong>${colorData.name}</strong><br>
            HEX: ${colorData.hex}<br>
            RGB: (${colorData.rgb.join(', ')})<br>
            HSL: ${hsl.h.toFixed(0)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%<br>
            Difference: ${difference.toFixed(2)}
          `
        };
      }
      return { hex: '#444444', html: 'No successful mix.' };
    };
    // Display Player 1 Best Mix
    if (this.playerOneResultSwatch && this.playerOneResultInfo) {
      const p1Result = formatPlayerResult(playerOneBestAttempt);
      this.playerOneResultSwatch.style.backgroundColor = p1Result.hex;
      this.playerOneResultInfo.innerHTML = p1Result.html;
    }
    // Display Player 2 Best Mix
    if (this.playerTwoResultSwatch && this.playerTwoResultInfo) {
      const p2Result = formatPlayerResult(playerTwoBestAttempt);
      this.playerTwoResultSwatch.style.backgroundColor = p2Result.hex;
      this.playerTwoResultInfo.innerHTML = p2Result.html;
    }
    this.battleResultsScreen.style.display = 'flex'; // Use flex as per example styling
  }
  showBattleResultsScreen(show) {
    if (show) {
      // This method is primarily used to *hide* the results screen during resets.
      // If called with `show = true` unexpectedly, we'll log a warning and show it with placeholder data.
      // A proper call to display results should use `displayBattleResults` with actual game data.
      console.warn("[UIManager] showBattleResultsScreen(true) called. This is unusual outside of a direct reset. Displaying with placeholder results.");
      const placeholderColor = { name: "N/A", hex: "#777", rgb: [119, 119, 119] };
      this.displayBattleResults(
        { colorData: placeholderColor, difference: 0 },
        { colorData: placeholderColor, difference: 0 },
        placeholderColor,
        "Results (Placeholder)"
      );
    } else {
      this.hideBattleResults();
    }
  }
  hideBattleResults() {
    if (this.battleResultsScreen) {
      this.battleResultsScreen.style.display = 'none';
    }
    // Restore main game area interactivity if it was globally disabled by results screen
    // (This depends on how main.js handles gameArea state when showing results)
    if (this.gameArea) {
        // This assumes that battle mode screen was hidden, so main game area might be visible
        // If gameArea was blurred by showBattleModeScreen(true) and not restored by showBattleModeScreen(false)
        // then showing results means gameArea is still blurred. Closing results should unblur.
        // However, showBattleModeScreen(false) *does* restore gameArea filter.
        // So, this might not be strictly necessary here unless results screen itself adds a blur.
        // For safety, let's ensure filter is none and pointer events are as expected.
       this.gameArea.style.filter = 'none';
       // this.gameArea.style.pointerEvents = 'auto'; // This was problematic; default is 'none'
    }
  }
  setupLobbyEventListeners() {
    if (this.cancelLobbyButton) {
      this.cancelLobbyButton.addEventListener('click', () => {
        this.showLobbyScreen(false);
        // Potentially call game logic to cancel matchmaking or leave session
        if (this.game && typeof this.game.leaveLobby === 'function') {
          this.game.leaveLobby();
        }
      });
    }
  }
  showLobbyScreen(show) {
    if (this.lobbyScreen) {
      this.lobbyScreen.style.display = show ? 'flex' : 'none';
      if (show) {
        // When showing lobby, hide other major overlays
        if (this.fullscreenEncyclopedia && this.fullscreenEncyclopedia.style.display !== 'none') {
          this.showEncyclopedia(false);
        }
        if (this.gameLeaderboardPanelEl && this.gameLeaderboardPanelEl.style.display !== 'none') {
          this.gameLeaderboardPanelEl.style.display = 'none';
        }
        if (this.battleModeScreen && this.battleModeScreen.style.display !== 'none') {
          this.showBattleModeScreen(false); // Ensure battle screen is hidden
        }
        if (this.battleResultsScreen && this.battleResultsScreen.style.display !== 'none') {
            this.hideBattleResults();
        }
        // Blur game area
        if (this.gameArea) {
           this.gameArea.style.filter = 'blur(8px)'; 
           this.gameArea.style.pointerEvents = 'none';
        }
        this.updateLobbyStatus('Searching for a game...');
        // Call game logic to start searching for/creating a game session
        if (this.game && typeof this.game.enterLobby === 'function') {
          this.game.enterLobby();
        }
      } else {
        // Restore game area
        if (this.gameArea) {
           this.gameArea.style.filter = 'none';
           // gameArea pointerEvents should revert to its default which allows canvas interaction
        }
      }
    }
  }
  updateLobbyStatus(message) {
    if (this.lobbyStatusMessage) {
      this.lobbyStatusMessage.textContent = message;
    }
    const spinner = this.lobbyScreen ? this.lobbyScreen.querySelector('.spinner') : null;
    if (spinner) {
        // Hide spinner if message indicates a final state like "Opponent found" or "Error"
        if (message.toLowerCase().includes('found') || message.toLowerCase().includes('starting') || message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')) {
            spinner.style.display = 'none';
        } else {
            spinner.style.display = 'block';
        }
    }
  }
  updateOpponentMixDisplay(playerIdentifier, mixedColorData, difference) {
    // Determine which player's UI elements to update based on playerIdentifier
    // and whether the local player is Player 1 or Player 2.
    let opponentColorDisplay, opponentColorResultInfo;
    // This assumes currentBattleSessionData and game.isLocalPlayerOne are correctly set.
    // If the local player is P1, then "player_two" updates P2's UI.
    // If the local player is P2, then "player_one" updates P1's UI.
    if (this.game && this.game.isLocalPlayerOne !== null && this.currentBattleSessionData) {
        if (playerIdentifier === 'player_one' && !this.game.isLocalPlayerOne) { // Opponent is P1
            opponentColorDisplay = this.playerOneColorDisplay;
            opponentColorResultInfo = this.playerOneColorResultInfo;
        } else if (playerIdentifier === 'player_two' && this.game.isLocalPlayerOne) { // Opponent is P2
            opponentColorDisplay = this.playerTwoColorDisplay;
            opponentColorResultInfo = this.playerTwoColorResultInfo;
        } else {
            // This attempt is from the local player or identifier doesn't match opponent role, ignore for this UI update.
            // console.log(`[UI Opponent Sync] Ignoring update for ${playerIdentifier} as it's local or role mismatch.`);
            return;
        }
    } else {
        console.warn("[UI Opponent Sync] Cannot determine opponent UI elements. Game state not ready.");
        return;
    }
    if (!opponentColorDisplay || !opponentColorResultInfo || !this.game || !this.game.colorSystem) {
        console.warn(`[UI Opponent Sync] Opponent UI elements for ${playerIdentifier} or color system not found.`);
        return;
    }
    if (mixedColorData) {
        opponentColorDisplay.style.backgroundColor = mixedColorData.hex;
        opponentColorDisplay.textContent = ''; // Clear any placeholder
        const hsl = this.game.colorSystem.rgbToHsl(...mixedColorData.rgb);
        opponentColorResultInfo.innerHTML = `
            <strong>Opponent's Mix: ${mixedColorData.name}</strong><br>
            Difference: ${difference.toFixed(2)}<br>
            <small>RGB: (${mixedColorData.rgb.join(', ')})</small><br>
            <small>HSL: ${hsl.h.toFixed(0)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%</small>
        `;
        // Optional: Add visual cue if it's their new best (e.g., border flash)
        // This would require knowing their previous best difference from the game logic.
        // For now, the `showAchievement` in main.js covers the "best attempt" notification.
    } else {
        opponentColorDisplay.style.backgroundColor = '#4a4a6a'; // Neutral "no mix" color
        opponentColorDisplay.textContent = 'O'; // "Opponent"
        opponentColorResultInfo.innerHTML = `<strong>Opponent is thinking...</strong>`;
    }
     console.log(`[UI Opponent Sync] Updated opponent (${playerIdentifier}) display: ${mixedColorData.name}, Diff: ${difference.toFixed(2)}`);
  }
  setupInitialBattleReadyState() {
    console.log('[UIManager] Setting up initial battle ready state. Local is P1:', this.localPlayerIsOne);
    // Determine which "Ready" button is for the local player and which is for the opponent.
    const localPlayerButton = this.localPlayerIsOne ? this.playerOneReadyButton : this.playerTwoReadyButton;
    const opponentPlayerButton = this.localPlayerIsOne ? this.playerTwoReadyButton : this.playerOneReadyButton;
    const localPlayerStatusEl = this.localPlayerIsOne ? this.playerOneReadyStatus : this.playerTwoReadyStatus;
    const opponentPlayerStatusEl = this.localPlayerIsOne ? this.playerTwoReadyStatus : this.playerOneReadyStatus;
    if (localPlayerButton) {
        localPlayerButton.textContent = 'Ready?';
        localPlayerButton.disabled = false; // Local player's button is clickable
        localPlayerButton.style.display = 'block';
    }
    if (opponentPlayerButton) {
        opponentPlayerButton.textContent = 'Opponent Not Ready'; // Display for opponent
        opponentPlayerButton.disabled = true; // Opponent's button is just a status indicator here
        opponentPlayerButton.style.display = 'block';
    }
    // More detailed status text elements (optional, if you have them in HTML)
    if (localPlayerStatusEl) {
        localPlayerStatusEl.textContent = 'You: Not Ready';
        localPlayerStatusEl.style.display = 'block';
        localPlayerStatusEl.classList.remove('player-ready');
    }
    if (opponentPlayerStatusEl) {
        opponentPlayerStatusEl.textContent = 'Opponent: Not Ready';
        opponentPlayerStatusEl.style.display = 'block';
        opponentPlayerStatusEl.classList.remove('player-ready');
    }
    // Disable mix buttons
    if (this.playerOneMixButton) this.playerOneMixButton.disabled = true;
    if (this.playerTwoMixButton) this.playerTwoMixButton.disabled = true;
    // Disable orb selection areas
    if (this.playerOneBattleOrbsContainer) {
        this.playerOneBattleOrbsContainer.style.pointerEvents = 'none';
        this.playerOneBattleOrbsContainer.style.opacity = '0.5';
    }
    if (this.playerTwoBattleOrbsContainer) {
        this.playerTwoBattleOrbsContainer.style.pointerEvents = 'none';
        this.playerTwoBattleOrbsContainer.style.opacity = '0.5';
    }
    // Update timer display
    if (this.battleModeTimerDisplay) {
        this.battleModeTimerDisplay.textContent = "Waiting for players...";
    }
    if (this.battleModeActionButton) {
        this.battleModeActionButton.textContent = "Cancel Match";
        this.battleModeActionButton.disabled = false; // Initially enabled to cancel
    }
    this.stopBattleTimer(); // Ensure any previous timer is stopped
    console.log('[UIManager] Initial battle ready state setup complete.');
  }
  _setupReadyButtonListeners() {
    console.log('[UIManager] Setting up ready button listeners. LocalPlayerIsOne:', this.localPlayerIsOne);
    // This needs to be called AFTER localPlayerIsOne is determined,
    // or the listeners need to dynamically check localPlayerIsOne.
    // For simplicity, we assume this is called once and localPlayerIsOne is stable for the battle screen session.
    const p1Button = this.playerOneReadyButton;
    const p2Button = this.playerTwoReadyButton;
    if (p1Button) {
        // Clone and replace to remove old listeners if any
        const newP1Button = p1Button.cloneNode(true);
        p1Button.parentNode.replaceChild(newP1Button, p1Button);
        this.playerOneReadyButton = newP1Button; // Update reference
        newP1Button.addEventListener('click', () => {
            if (this.localPlayerIsOne === true) {
                console.log('[UIManager] Player ONE (Local) Ready Button Clicked');
                this.game.localPlayerClickedReady();
            } else {
                console.log('[UIManager] Player ONE (Opponent) Ready Button Clicked - IGNORED');
            }
        });
    }
    if (p2Button) {
        const newP2Button = p2Button.cloneNode(true);
        p2Button.parentNode.replaceChild(newP2Button, p2Button);
        this.playerTwoReadyButton = newP2Button; // Update reference
        newP2Button.addEventListener('click', () => {
            if (this.localPlayerIsOne === false) {
                console.log('[UIManager] Player TWO (Local) Ready Button Clicked');
                this.game.localPlayerClickedReady();
            } else {
                console.log('[UIManager] Player TWO (Opponent) Ready Button Clicked - IGNORED');
            }
        });
    }
  }
  updateLocalPlayerReadyButtonState(isReady) {
    console.log(`[UIManager] Updating local player ready button. Local is P1: ${this.localPlayerIsOne}, Ready: ${isReady}`);
    const localPlayerButton = this.localPlayerIsOne ? this.playerOneReadyButton : this.playerTwoReadyButton;
    const localPlayerStatusEl = this.localPlayerIsOne ? this.playerOneReadyStatus : this.playerTwoReadyStatus;
    const playerLabel = this.localPlayerIsOne ? "You (P1)" : "You (P2)";
    if (localPlayerButton) {
        localPlayerButton.textContent = isReady ? 'Waiting for Opponent...' : 'Ready?';
        localPlayerButton.disabled = isReady;
    }
    if (localPlayerStatusEl) {
        localPlayerStatusEl.textContent = isReady ? `${playerLabel}: Ready!` : `${playerLabel}: Not Ready`;
        if(isReady) localPlayerStatusEl.classList.add('player-ready'); else localPlayerStatusEl.classList.remove('player-ready');
    }
  }
  updateOpponentReadyStatus(playerIdentifier, isReady) {
    // playerIdentifier is 'player_one' or 'player_two'
    console.log(`[UIManager] Updating opponent ready status for ${playerIdentifier}. Is Ready: ${isReady}. Local is P1: ${this.localPlayerIsOne}`);
    let opponentPlayerButton, opponentPlayerStatusEl, opponentLabel;
    if (playerIdentifier === 'player_one' && this.localPlayerIsOne === false) { // Opponent is P1
        opponentPlayerButton = this.playerOneReadyButton;
        opponentPlayerStatusEl = this.playerOneReadyStatus;
        opponentLabel = "Opponent (P1)";
    } else if (playerIdentifier === 'player_two' && this.localPlayerIsOne === true) { // Opponent is P2
        opponentPlayerButton = this.playerTwoReadyButton;
        opponentPlayerStatusEl = this.playerTwoReadyStatus;
        opponentLabel = "Opponent (P2)";
    } else {
        return; // Not for the opponent, or local player state unclear.
    }
    if (opponentPlayerButton) {
        opponentPlayerButton.textContent = isReady ? 'Opponent Ready!' : 'Opponent Not Ready';
        opponentPlayerButton.disabled = true; // Always disabled as it's a status indicator
    }
    if (opponentPlayerStatusEl) {
        opponentPlayerStatusEl.textContent = isReady ? `${opponentLabel}: Ready!` : `${opponentLabel}: Not Ready`;
        if(isReady) opponentPlayerStatusEl.classList.add('player-ready'); else opponentPlayerStatusEl.classList.remove('player-ready');
    }
  }
  enableBattleModeInteractionsAndStartTimer() {
    console.log('[UIManager] Enabling battle interactions & starting timer. Local is P1:', this.localPlayerIsOne);
    // Hide "Ready" buttons and any explicit status elements if they are separate
    if (this.playerOneReadyButton) this.playerOneReadyButton.style.display = 'none';
    if (this.playerTwoReadyButton) this.playerTwoReadyButton.style.display = 'none';
    if (this.playerOneReadyStatus) this.playerOneReadyStatus.style.display = 'none';
    if (this.playerTwoReadyStatus) this.playerTwoReadyStatus.style.display = 'none';
    // Enable mix button for the local player (actual enabled state depends on orb selection count)
    // The buttons should already be disabled=true from initial setup, this just confirms.
    if (this.localPlayerIsOne) {
        if (this.playerOneMixButton) this.playerOneMixButton.disabled = true; // Will be enabled by orb selection
    } else if (this.localPlayerIsOne === false) {
        if (this.playerTwoMixButton) this.playerTwoMixButton.disabled = true; // Will be enabled by orb selection
    }
    // Enable orb selection for the local player
    if (this.localPlayerIsOne) {
        if (this.playerOneBattleOrbsContainer) {
            this.playerOneBattleOrbsContainer.style.pointerEvents = 'auto';
            this.playerOneBattleOrbsContainer.style.opacity = '1';
        }
    } else if (this.localPlayerIsOne === false) { // Check for explicit false
        if (this.playerTwoBattleOrbsContainer) {
            this.playerTwoBattleOrbsContainer.style.pointerEvents = 'auto';
            this.playerTwoBattleOrbsContainer.style.opacity = '1';
        }
    }
    // Start the battle timer
    this.startBattleTimer(60); // Or use a value from game settings/session
    if (this.battleModeActionButton) {
        this.battleModeActionButton.textContent = "Forfeit Match";
        this.battleModeActionButton.disabled = false; // Allow forfeiting
    }
    console.log('[UIManager] Battle timer initiated.');
  }
  handleBattleActionClick() {
    if (!this.game || !this.currentBattleSessionData) {
        console.warn("[UIManager] Cannot handle battle action: game instance or session data missing.");
        this.showBattleModeScreen(false); // Fallback: just hide the screen
        if (this.game && typeof this.game.resetToMainMenu === 'function') {
            this.game.resetToMainMenu(); // Attempt to go to main menu
        }
        return;
    }
    const isGameStarted = this.game.isBattleGameStarted(); // Assumes game.js has this method
    if (isGameStarted) {
        // Game has started, action is "Forfeit"
        console.log(`[UIManager] Player clicked Forfeit Match. Session ID: ${this.currentBattleSessionData.id}`);
        if (typeof this.game.forfeitBattle === 'function') {
            this.game.forfeitBattle();
        } else {
            console.error("[UIManager] game.forfeitBattle() function not found!");
            // Fallback: show loss results locally and hide screen
            // This part would need more context on how to construct results for a local forfeit.
            // For now, we'll assume game.forfeitBattle handles UI updates via main.js
            this.showBattleModeScreen(false); 
            if (this.game && typeof this.game.resetToMainMenu === 'function') this.game.resetToMainMenu();
        }
    } else {
        // Game not started, action is "Cancel Match"
        console.log(`[UIManager] Player clicked Cancel Match. Session ID: ${this.currentBattleSessionData.id}`);
        if (typeof this.game.cancelBattleMatch === 'function') {
            this.game.cancelBattleMatch();
        } else {
            console.error("[UIManager] game.cancelBattleMatch() function not found!");
            this.showBattleModeScreen(false); // Hide battle screen
             if (this.game && typeof this.game.resetToMainMenu === 'function') this.game.resetToMainMenu(); // Go to main menu
        }
    }
  }
  // Call this method from main.js or game.js when a battle is truly over (results shown and acknowledged)
  // or when cancelling/forfeiting leads to exiting battle mode.
  resetBattleModeUIElements() {
    if (this.battleModeActionButton) {
        this.battleModeActionButton.textContent = "Cancel Match";
        this.battleModeActionButton.disabled = true; // Should be enabled only when battle screen is active
    }
    this.clearPlayerOneMixedColorDisplay();
    this.clearPlayerTwoMixedColorDisplay();
    this.updatePlayerOneBattleScoreDisplay(Infinity);
    this.updatePlayerTwoBattleScoreDisplay(Infinity);
    if(this.battleModeTimerDisplay) this.battleModeTimerDisplay.textContent = "00:00";
    // Reset ready buttons and status (if they are still visible or need resetting)
    // This might be redundant if setupInitialBattleReadyState covers it when re-entering.
    if (this.playerOneReadyButton) {
        this.playerOneReadyButton.textContent = 'Ready?';
        this.playerOneReadyButton.disabled = true;
        this.playerOneReadyButton.style.display = 'none'; // Hide until explicitly shown
    }
    if (this.playerTwoReadyButton) {
        this.playerTwoReadyButton.textContent = 'Opponent Not Ready';
        this.playerTwoReadyButton.disabled = true;
        this.playerTwoReadyButton.style.display = 'none'; // Hide
    }
    if (this.playerOneReadyStatus) this.playerOneReadyStatus.style.display = 'none';
    if (this.playerTwoReadyStatus) this.playerTwoReadyStatus.style.display = 'none';
    console.log("[UIManager] Battle Mode UI elements reset.");
  }
}