import { Leaderboard } from './leaderboard.js';
import audioManager from './audioManager.js';
export class UIManager {
  constructor(gameInstance, loginCallback, signupCallback, updateManager) {
    this.game = gameInstance;
    this.updateManager = updateManager; // Ensure updateManager is assigned on instantiation
    this.loginCallback = loginCallback;
    this.signupCallback = signupCallback;

    this.titleScreen = document.getElementById('titleScreen');
    this.usernameInput = document.getElementById('usernameInput');
    this.passwordInput = document.getElementById('passwordInput');
    this.loginButton = document.getElementById('loginButton');
    this.signupButton = document.getElementById('signupButton');
    this.authMessage = document.getElementById('authMessage');

    this.gameArea = document.getElementById('gameArea'); // Was #ui
    this.gameColorCount = document.getElementById('colorCount');
    this.gameSelectedColors = document.getElementById('selectedColors');

    this.fullscreenEncyclopedia = document.getElementById('fullscreenEncyclopedia');
    this.encyclopediaToggleButton = document.getElementById('encyclopediaToggleButton');
    this.closeEncyclopediaButton = document.getElementById('closeEncyclopediaButton');
    this.leaderboardToggleButton = document.getElementById('leaderboardToggleButton'); // New button
    this.battleModeButton = document.getElementById('battleModeButton'); 
    this.battleModeScreen = document.getElementById('battleModeScreen'); 

    this.battleModeActionButton = document.getElementById('battleModeActionButton'); 
    this.battleModeTimerDisplay = document.getElementById('battleModeTimerDisplay');
    this.targetBattleColorDisplay = document.getElementById('targetBattleColorDisplay'); 
    this.targetBattleColorInfo = document.getElementById('targetBattleColorInfo'); 
    this.playerOneBattleOrbsContainer = document.getElementById('playerOneSourceOrbs'); 
    this.playerOneSelectedOrbsContainer = document.getElementById('playerOneSelectedOrbs'); 
    this.playerOneMixButton = null; 
    this.playerOneColorDisplay = document.getElementById('playerOneColorDisplay'); 
    this.playerOneColorResultInfo = document.getElementById('playerOneColorResultInfo'); 
    this.playerOneBattleScoreDisplay = document.getElementById('playerOneBattleScoreDisplay'); 

    this.playerTwoBattleOrbsContainer = document.getElementById('playerTwoSourceOrbs');
    this.playerTwoSelectedOrbsContainer = document.getElementById('playerTwoSelectedOrbs');
    this.playerTwoMixButton = null; 
    this.playerTwoColorDisplay = document.getElementById('playerTwoColorDisplay');
    this.playerTwoColorResultInfo = document.getElementById('playerTwoColorResultInfo');
    this.playerTwoBattleScoreDisplay = document.getElementById('playerTwoBattleScoreDisplay');
    this._playerMixButtonListenersAttached = false;
    this.playerOneReadyButton = document.getElementById('playerOneReadyButton');
    this.playerTwoReadyButton = document.getElementById('playerTwoReadyButton');
    this.playerOneReadyStatus = document.getElementById('playerOneReadyStatus'); 
    this.playerTwoReadyStatus = document.getElementById('playerTwoReadyStatus'); 

    this.battleResultsScreen = document.getElementById('battleResultsScreen');
    this.battleWinnerMessage = document.getElementById('battleWinnerMessage');
    this.targetColorResultSwatch = document.getElementById('targetColorResultSwatch');
    this.targetColorResultInfo = document.getElementById('targetColorResultInfo');
    this.playerOneResultLabel = document.getElementById('playerOneResultLabel'); 
    this.playerOneResultSwatch = document.getElementById('playerOneResultSwatch');
    this.playerOneResultInfo = document.getElementById('playerOneResultInfo');
    this.playerTwoResultLabel = document.getElementById('playerTwoResultLabel'); 
    this.playerTwoResultSwatch = document.getElementById('playerTwoResultSwatch');
    this.playerTwoResultInfo = document.getElementById('playerTwoResultInfo');
    this.closeBattleResultsButton = document.getElementById('closeBattleResultsButton');

    this.lobbyScreen = document.getElementById('lobbyScreen');
    this.lobbyStatusMessage = document.getElementById('lobbyStatusMessage');
    this.cancelLobbyButton = document.getElementById('cancelLobbyButton');

    this.encyclopediaTabsContainer = document.getElementById('encyclopediaTabs');
    this.encyclopediaTabButtons = this.encyclopediaTabsContainer ? 
                                  this.encyclopediaTabsContainer.querySelectorAll('.encyclopediaTabButton') : [];
    this.encyclopediaTabPanels = document.getElementById('encyclopediaTabContent') ?
                                 document.getElementById('encyclopediaTabContent').querySelectorAll('.encyclopediaTabPanel') : [];

    this.gameColorGrid = document.getElementById('colorGrid'); 
    this.gameColorInfo = document.getElementById('colorInfo'); 
    this.sortColorsDropdown = document.getElementById('sortColorsDropdown');
    this.encyclopediaColorFilterInput = document.getElementById('encyclopediaColorFilterInput'); 

    this.encyclopediaHueMinSlider = document.getElementById('encyclopediaHueMinSlider');
    this.encyclopediaHueMaxSlider = document.getElementById('encyclopediaHueMaxSlider');
    this.encyclopediaSaturationMinSlider = document.getElementById('encyclopediaSaturationMinSlider');
    this.encyclopediaSaturationMaxSlider = document.getElementById('encyclopediaSaturationMaxSlider');
    this.encyclopediaLightnessMinSlider = document.getElementById('encyclopediaLightnessMinSlider');
    this.encyclopediaLightnessMaxSlider = document.getElementById('encyclopediaLightnessMaxSlider');
    this.encyclopediaRedMinSlider = document.getElementById('encyclopediaRedMinSlider');
    this.encyclopediaRedMaxSlider = document.getElementById('encyclopediaRedMaxSlider');
    this.encyclopediaGreenMinSlider = document.getElementById('encyclopediaGreenMinSlider');
    this.encyclopediaGreenMaxSlider = document.getElementById('encyclopediaGreenMaxSlider');
    this.encyclopediaBlueMinSlider = document.getElementById('encyclopediaBlueMinSlider');
    this.encyclopediaBlueMaxSlider = document.getElementById('encyclopediaBlueMaxSlider');

    this.encyclopediaHueMinValue = document.getElementById('encyclopediaHueMinValue');
    this.encyclopediaHueMaxValue = document.getElementById('encyclopediaHueMaxValue');
    this.encyclopediaSaturationMinValue = document.getElementById('encyclopediaSaturationMinValue');
    this.encyclopediaSaturationMaxValue = document.getElementById('encyclopediaSaturationMaxValue');
    this.encyclopediaLightnessMinValue = document.getElementById('encyclopediaLightnessMinValue');
    this.encyclopediaLightnessMaxValue = document.getElementById('encyclopediaLightnessMaxValue');
    this.encyclopediaRedMinValue = document.getElementById('encyclopediaRedMinValue');
    this.encyclopediaRedMaxValue = document.getElementById('encyclopediaRedMaxValue');
    this.encyclopediaGreenMinValue = document.getElementById('encyclopediaGreenMinValue');
    this.encyclopediaGreenMaxValue = document.getElementById('encyclopediaGreenMaxValue');
    this.encyclopediaBlueMinValue = document.getElementById('encyclopediaBlueMinValue');
    this.encyclopediaBlueMaxValue = document.getElementById('encyclopediaBlueMaxValue');

    this.resetFiltersButton = document.getElementById('resetFiltersButton');
    this.advancedFiltersToggle = document.getElementById('advancedFiltersToggle'); 
    this.advancedFiltersContainer = document.getElementById('advanced-filters-container'); 
    this.gameChallengeDisplay = document.getElementById('challengeDisplay'); 
    this.gameLeaderboardPanelEl = document.getElementById('leaderboardPanel');
    this.achievementsListContainer = document.getElementById('achievementsList');

    this.sideNotificationContainer = null;
    this._createSideNotificationContainer();
    this.muteButton = document.getElementById('muteButton');
    this.masterVolumeSlider = document.getElementById('masterVolumeSlider');
    this.masterVolumeValue = document.getElementById('masterVolumeValue');
    this.sfxVolumeSlider = document.getElementById('sfxVolumeSlider');
    this.sfxVolumeValue = document.getElementById('sfxVolumeValue');
    this.musicVolumeSlider = document.getElementById('musicVolumeSlider');
    this.musicVolumeValue = document.getElementById('musicVolumeValue');
    this.musicTrackSelector = document.getElementById('musicTrackSelector');
    this.muteAchievementsButton = document.getElementById('muteAchievementsButton');
    this.achievementVolumeSlider = document.getElementById('achievementVolumeSlider');
    this.achievementVolumeValue = document.getElementById('achievementVolumeValue');
    this.updateContainer = document.getElementById('update-notification');
    this.updateMessage = document.getElementById('update-message');
    this.restartButton = document.getElementById('restart-button');
    this.setupAuthEventListeners();
    this.leaderboard = null; 
    this.mixButtonContainer = null;
    this.colorGridPaginationControls = document.getElementById('colorGridPagination');
    this.colorGridCurrentPage = 1;
    this.COLOR_GRID_PAGE_SIZE = 100;
    this.summonableListPage = { 2: 1, 3: 1, 4: 1 };
    this.SUMMONABLE_LIST_PAGE_SIZE = 12;
    this.setupEncyclopediaEventListeners();
    this.setupAudioEventListeners();
    window.addEventListener('resize', this.handleResize.bind(this));
    this.setupLeaderboardToggleListener();
    this.setupBattleModeButtonListener();
    this.setupBattleResultsListeners();
    this.setupLobbyEventListeners();
    this._setupReadyButtonListeners();
    this.battleTimerInterval = null;
    this.battleTimerSeconds = 0;
    this.playerOneBattleSelection = [];
    this.MAX_BATTLE_SELECTION = 4;
    this.playerOneAvailableBattleOrbs = [];
    this.playerTwoBattleSelection = [];
    this.playerTwoAvailableBattleOrbs = [];
    this.currentBattleSessionData = null;
    this.localPlayerIsOne = null;
    this.pinnedColorSwatch = null;
this.previousSelectedOrbsCount = 0;
}
setUpdateManager(updateManager) {
    this.updateManager = updateManager;
    if (this.updateManager && this.updateManager.isBlockingUI()) {
        this.hideTitleScreen();
    }
  }
#calculateLuminance(rgb) {
    if (!rgb || rgb.length < 3) return 0;
    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    return lum / 255;
  }
  setupAuthEventListeners() {
    this.loginButton.addEventListener('click', () => {
      audioManager.playSound('click1');
      const username = this.usernameInput.value.trim();
      const password = this.passwordInput.value;
      if (username && password) {
        this.loginCallback(username, password);
      } else {
        this.setAuthMessage('Please enter username and password.');
      }
    });
    this.signupButton.addEventListener('click', () => {
      audioManager.playSound('click1');
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
    this.authMessage.style.color = isError ? '#ff6b6b' : '#6bff6b';
  }
  setupEncyclopediaEventListeners() {
    if (this.encyclopediaToggleButton) {
        this.encyclopediaToggleButton.addEventListener('click', () => {
          audioManager.playSound('click1');
          this.showEncyclopedia(true);
        });
    }
    if (this.closeEncyclopediaButton) {
        this.closeEncyclopediaButton.addEventListener('click', () => {
            audioManager.playSound('click1');
            this.showEncyclopedia(false);
            this.hideColorInfo(true); 
        });
    }
    if (this.sortColorsDropdown) {
        this.sortColorsDropdown.addEventListener('change', () => {

            if (this.lastKnownDiscoveredColors) {
                this.colorGridCurrentPage = 1; 
                this.updateEncyclopedia(this.lastKnownDiscoveredColors);
            }
        });
    }
    if (this.encyclopediaColorFilterInput) {
        this.encyclopediaColorFilterInput.addEventListener('input', () => {
            if (this.lastKnownDiscoveredColors) {
                this.colorGridCurrentPage = 1; 
                this.updateEncyclopedia(this.lastKnownDiscoveredColors);
            }
        });
    }

    this._setupRangeSliderListener(this.encyclopediaHueMinSlider, this.encyclopediaHueMaxSlider, this.encyclopediaHueMinValue, this.encyclopediaHueMaxValue, '°');
    this._setupRangeSliderListener(this.encyclopediaSaturationMinSlider, this.encyclopediaSaturationMaxSlider, this.encyclopediaSaturationMinValue, this.encyclopediaSaturationMaxValue, '%');
    this._setupRangeSliderListener(this.encyclopediaLightnessMinSlider, this.encyclopediaLightnessMaxSlider, this.encyclopediaLightnessMinValue, this.encyclopediaLightnessMaxValue, '%');
    this._setupRangeSliderListener(this.encyclopediaRedMinSlider, this.encyclopediaRedMaxSlider, this.encyclopediaRedMinValue, this.encyclopediaRedMaxValue);
    this._setupRangeSliderListener(this.encyclopediaGreenMinSlider, this.encyclopediaGreenMaxSlider, this.encyclopediaGreenMinValue, this.encyclopediaGreenMaxValue);
    this._setupRangeSliderListener(this.encyclopediaBlueMinSlider, this.encyclopediaBlueMaxSlider, this.encyclopediaBlueMinValue, this.encyclopediaBlueMaxValue);
    this._setupSummonableListPaginationListeners();
    this._setupColorGridPaginationListeners();
    if (this.resetFiltersButton) {
      this.resetFiltersButton.addEventListener('click', () => this.resetAllFilters());
    }

    if (this.advancedFiltersToggle && this.advancedFiltersContainer) {
      this.advancedFiltersToggle.addEventListener('change', () => {
        this.advancedFiltersContainer.style.display = this.advancedFiltersToggle.checked ? 'block' : 'none';
      });

      this.advancedFiltersContainer.style.display = this.advancedFiltersToggle.checked ? 'block' : 'none';
    }
    this.encyclopediaTabButtons.forEach(button => {
      button.addEventListener('click', () => {
        audioManager.playSound('click1');
        const targetTabId = button.dataset.tab;
        this.setActiveEncyclopediaTab(targetTabId);
      });
    });
  }
  _setupRangeSliderListener(minSlider, maxSlider, minValueDisplay, maxValueDisplay, unit = '') {
    if (!minSlider || !maxSlider || !minValueDisplay || !maxValueDisplay) return;
    const updateDisplays = () => {
      minValueDisplay.textContent = minSlider.value + unit;
      maxValueDisplay.textContent = maxSlider.value + unit;
      if (this.lastKnownDiscoveredColors) {
        this.colorGridCurrentPage = 1; 
        this.updateEncyclopedia(this.lastKnownDiscoveredColors);
      }
    };
    minSlider.addEventListener('input', () => {
      if (parseInt(minSlider.value) > parseInt(maxSlider.value)) {
        maxSlider.value = minSlider.value;
      }
      updateDisplays();
    });
    maxSlider.addEventListener('input', () => {
      if (parseInt(maxSlider.value) < parseInt(minSlider.value)) {
        minSlider.value = maxSlider.value;
      }
      updateDisplays();
    });

    updateDisplays();
  }
  resetAllFilters() {
    if (this.encyclopediaColorFilterInput) this.encyclopediaColorFilterInput.value = '';

    if (this.advancedFiltersToggle) {
        this.advancedFiltersToggle.checked = false;
    }
    if (this.advancedFiltersContainer) {
        this.advancedFiltersContainer.style.display = 'none';
    }

    if (this.encyclopediaHueMinSlider) this.encyclopediaHueMinSlider.value = 0;
    if (this.encyclopediaHueMaxSlider) this.encyclopediaHueMaxSlider.value = 360;
    if (this.encyclopediaSaturationMinSlider) this.encyclopediaSaturationMinSlider.value = 0;
    if (this.encyclopediaSaturationMaxSlider) this.encyclopediaSaturationMaxSlider.value = 100;
    if (this.encyclopediaLightnessMinSlider) this.encyclopediaLightnessMinSlider.value = 0;
    if (this.encyclopediaLightnessMaxSlider) this.encyclopediaLightnessMaxSlider.value = 100;

    if (this.encyclopediaRedMinSlider) this.encyclopediaRedMinSlider.value = 0;
    if (this.encyclopediaRedMaxSlider) this.encyclopediaRedMaxSlider.value = 255;
    if (this.encyclopediaGreenMinSlider) this.encyclopediaGreenMinSlider.value = 0;
    if (this.encyclopediaGreenMaxSlider) this.encyclopediaGreenMaxSlider.value = 255;
    if (this.encyclopediaBlueMinSlider) this.encyclopediaBlueMinSlider.value = 0;
    if (this.encyclopediaBlueMaxSlider) this.encyclopediaBlueMaxSlider.value = 255;

    if (this.lastKnownDiscoveredColors) {
      this.colorGridCurrentPage = 1; 
      this.updateEncyclopedia(this.lastKnownDiscoveredColors);
    }
  }
  setActiveEncyclopediaTab(tabId) {
    this.encyclopediaTabButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.tab === tabId);
    });
    this.encyclopediaTabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === tabId);
    });
    if (tabId === 'colorGridTab' && this.lastKnownDiscoveredColors) {

      this.updateEncyclopedia(this.lastKnownDiscoveredColors);
    } else if (tabId === 'colorRingsTab') {
      this.populateRingsManagementTab();
    } else if (tabId === 'achievementsTab') {
      this.populateAchievementsTab();
    }
    if (tabId === 'settingsTab') {
      this._updateAudioUI();
    }
  }
  async showEncyclopedia(show) {
    if (this.fullscreenEncyclopedia) {
        this.fullscreenEncyclopedia.style.display = show ? 'block' : 'none';
        if (show) {
            if (this.game && this.game.challengeManager) {
                await this.game.challengeManager.fetchTotalPlayerCount();
                await this.game.challengeManager.fetchColorDiscoveryStats();
            }
            this.setActiveEncyclopediaTab('colorGridTab');
        }
    }

    if (this.gameArea) {
  
        if (show) {
            this.gameArea.style.pointerEvents = 'none';
            this.gameArea.style.filter = 'blur(5px)'; 
        } else {
            this.gameArea.style.pointerEvents = ''; 
            this.gameArea.style.filter = 'none';
        }
    }

    if (show && this.gameLeaderboardPanelEl && this.gameLeaderboardPanelEl.style.display === 'block') {
        this.gameLeaderboardPanelEl.style.display = 'none';
    }
  }
  hideTitleScreen() {
    if (this.titleScreen) {
        this.titleScreen.style.display = 'none';
    }
  }
  showTitleScreen() {
    if (this.titleScreen) {
      this.titleScreen.style.display = 'flex';
    }
  }
  finishUpdateCheck() {
    this.hideUpdater();
    this.showTitleScreen();
  }
  showGameArea(currentPlayerUsername) {
    this.hideTitleScreen();
    this.gameArea.style.display = 'block';
    this.gameArea.style.filter = 'none';
    this.gameArea.style.pointerEvents = '';
    this.createMixButton();
    if (this.gameLeaderboardPanelEl) {
        this.leaderboard = new Leaderboard(this.gameLeaderboardPanelEl, currentPlayerUsername);
    }
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
    this.gameArea.appendChild(this.mixButtonContainer); 
    this.updateMixButtonPosition(); 
  }
  showUpdater(message) {
    if (this.updateContainer && this.updateMessage) {
      this.updateMessage.innerHTML = message;
      this.updateContainer.style.display = 'block';
      this.updateContainer.style.zIndex = '9999'; // Ensure it's on top
      this.hideTitleScreen();
      if (this.gameArea) {
        this.gameArea.style.display = 'none'; // Hide game area to prevent interference
      }
    }
  }
  hideUpdater() {
    if (this.updateContainer) {
      this.updateContainer.style.display = 'none';
    }
  }
  showCheckingForUpdate() {
    this.showUpdater('Checking for updates...');
    if (this.restartButton) {
      this.restartButton.style.display = 'none';
    }
  }
  showUpdateAvailable(version) {
    this.showUpdater(`Update v${version} is available. Downloading...`);
  }
  updateDownloadProgress(progressInfo) {
    const percent = Math.round(progressInfo.percent);
    const downloaded = (progressInfo.transferred / 1024 / 1024).toFixed(2);
    const total = (progressInfo.total / 1024 / 1024).toFixed(2);
    const speed = (progressInfo.bytesPerSecond / 1024).toFixed(2);
    this.showUpdater(`
        Downloading update... ${percent}%<br>
        <progress value="${percent}" max="100"></progress><br>
        <small>${downloaded} MB / ${total} MB (${speed} KB/s)</small>
    `);
  }
  showUpdateDownloaded(message) {
    this.showUpdater(message);
    if (this.restartButton) {
      this.restartButton.style.display = 'block';
      this.restartButton.onclick = () => {
        window.electron.send('restart-app');
      };
    }
  }
  showUpdateMessage(message) {
    this.showUpdater(message);
    if (this.restartButton) {
      this.restartButton.style.display = 'none';
    }
  }
  onMixButtonClick(callback) {
    if (this.mixButton && !this.mixButton.dataset.listenerAttached) {
        this.mixButton.addEventListener('click', () => {
            audioManager.playSound('click1');
            callback();
        });
        this.mixButton.dataset.listenerAttached = 'true';
    }
  }
  setMixButtonEnabled(enabled) {
    if(this.mixButton) this.mixButton.disabled = !enabled;
  }
  updateColorCount(count) {
    if(this.gameColorCount) this.gameColorCount.textContent = count;
  }
  updateSelectedColors(selectedOrbs) {
    if (audioManager && selectedOrbs.length > this.previousSelectedOrbsCount) {
      audioManager.playRandomSelectSound();
    }
    this.previousSelectedOrbsCount = selectedOrbs.length;

    const canMix = selectedOrbs.length >= 2 && selectedOrbs.length <= 4;
    this.setMixButtonEnabled(canMix);

    if (this.game && this.game.linePreviewSystem && typeof this.game.linePreviewSystem.updateLines === 'function') {
        this.game.linePreviewSystem.updateLines(selectedOrbs);
    }
    
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
      nameSpan.title = orb.colorData.name;
      selectedColorItem.appendChild(swatch);
      selectedColorItem.appendChild(nameSpan);

      selectedColorItem.addEventListener('click', () => {
        if (this.game && typeof this.game.handleOrbDeselection === 'function') {
          audioManager.playRandomSelectSound();
          this.game.handleOrbDeselection(orb);
        }
      });
      
      this.gameSelectedColors.appendChild(selectedColorItem);
    });

  }
  updateEncyclopedia(discoveredColors, currentSortOrder = null, preserveScroll = false) {
    if (!this.gameColorGrid) return;
    let scrollPosition = 0;
    const encyclopediaContent = document.getElementById('encyclopediaContent');
    if (preserveScroll && encyclopediaContent) {
        scrollPosition = encyclopediaContent.scrollTop;
    }
    this.lastKnownDiscoveredColors = [...discoveredColors];
    let sortedColors = [...discoveredColors];
    const statsMap = new Map(this.game.challengeManager.colorDiscoveryStats.map(s => [s.hex_code, s.discovery_count]));
    const totalPlayers = this.game.challengeManager.totalPlayerCount;
    sortedColors.forEach(color => {
      if (!color.hsl && color.rgb && this.game && this.game.colorSystem && typeof this.game.colorSystem.rgbToHsl === 'function') {
        color.hsl = this.game.colorSystem.rgbToHsl(...color.rgb);
      } else if (!color.hsl) {
        color.hsl = { h: 0, s: 0, l: 0 };
      }
      if (color.isPrimary) {
          color.discoveryCount = totalPlayers;
          color.rarity = 100;
      } else {
          color.discoveryCount = statsMap.get(color.hex) || 0;
          color.rarity = totalPlayers > 0 ? (color.discoveryCount / totalPlayers) * 100 : 0;
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
      case 'rarity_asc': // Rarest first
        sortedColors.sort((a, b) => a.discoveryCount - b.discoveryCount);
        break;
      case 'rarity_desc': // Least rare first
        sortedColors.sort((a, b) => b.discoveryCount - a.discoveryCount);
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
    const filterText = this.encyclopediaColorFilterInput ? this.encyclopediaColorFilterInput.value.toLowerCase().trim() : '';
    if (filterText) {
      sortedColors = sortedColors.filter(color => {
        const lowerName = color.name.toLowerCase();
        const lowerHex = color.hex.toLowerCase();

        if (filterText.startsWith('#')) {
          return lowerHex.includes(filterText);
        } else {
          return lowerName.includes(filterText) || lowerHex.substring(1).includes(filterText);
        }
      });
    }

    const hueMin = this.encyclopediaHueMinSlider ? parseInt(this.encyclopediaHueMinSlider.value, 10) : 0;
    const hueMax = this.encyclopediaHueMaxSlider ? parseInt(this.encyclopediaHueMaxSlider.value, 10) : 360;
    const satMin = this.encyclopediaSaturationMinSlider ? parseInt(this.encyclopediaSaturationMinSlider.value, 10) / 100 : 0;
    const satMax = this.encyclopediaSaturationMaxSlider ? parseInt(this.encyclopediaSaturationMaxSlider.value, 10) / 100 : 1;
    const lightMin = this.encyclopediaLightnessMinSlider ? parseInt(this.encyclopediaLightnessMinSlider.value, 10) / 100 : 0;
    const lightMax = this.encyclopediaLightnessMaxSlider ? parseInt(this.encyclopediaLightnessMaxSlider.value, 10) / 100 : 1;
    const redMin = this.encyclopediaRedMinSlider ? parseInt(this.encyclopediaRedMinSlider.value, 10) : 0;
    const redMax = this.encyclopediaRedMaxSlider ? parseInt(this.encyclopediaRedMaxSlider.value, 10) : 255;
    const greenMin = this.encyclopediaGreenMinSlider ? parseInt(this.encyclopediaGreenMinSlider.value, 10) : 0;
    const greenMax = this.encyclopediaGreenMaxSlider ? parseInt(this.encyclopediaGreenMaxSlider.value, 10) : 255;
    const blueMin = this.encyclopediaBlueMinSlider ? parseInt(this.encyclopediaBlueMinSlider.value, 10) : 0;
    const blueMax = this.encyclopediaBlueMaxSlider ? parseInt(this.encyclopediaBlueMaxSlider.value, 10) : 255;
    const filteredColors = sortedColors.filter(color => {
      const nameMatch = filterText ? color.name.toLowerCase().includes(filterText) : true;
      if (!nameMatch) return false;

      const hueMatch = (color.hsl.h || 0) >= hueMin && (color.hsl.h || 0) <= hueMax;
      const saturationMatch = (color.hsl.s || 0) >= satMin && (color.hsl.s || 0) <= satMax;
      const lightnessMatch = (color.hsl.l || 0) >= lightMin && (color.hsl.l || 0) <= lightMax;
      if (!hueMatch || !saturationMatch || !lightnessMatch) return false;

      const redMatch = (color.rgb[0] || 0) >= redMin && (color.rgb[0] || 0) <= redMax;
      const greenMatch = (color.rgb[1] || 0) >= greenMin && (color.rgb[1] || 0) <= greenMax;
      const blueMatch = (color.rgb[2] || 0) >= blueMin && (color.rgb[2] || 0) <= blueMax;
      if (!redMatch || !greenMatch || !blueMatch) return false;
      return true; 
    });
    this.lastKnownFilteredColorCount = filteredColors.length;
    const totalPages = Math.ceil(this.lastKnownFilteredColorCount / this.COLOR_GRID_PAGE_SIZE);
    this.colorGridCurrentPage = Math.max(1, Math.min(this.colorGridCurrentPage, totalPages));
    const startIndex = (this.colorGridCurrentPage - 1) * this.COLOR_GRID_PAGE_SIZE;
    const endIndex = startIndex + this.COLOR_GRID_PAGE_SIZE;
    const paginatedColors = filteredColors.slice(startIndex, endIndex);
    this.gameColorGrid.innerHTML = '';
    this._updateColorGridPaginationControls(filteredColors.length);
    if (paginatedColors.length === 0) {
        this.gameColorGrid.innerHTML = `<p class="no-results-message">No colors found matching the current filters.</p>`;
        return;
    }
    paginatedColors.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = 'colorSwatch';
      swatch.style.backgroundColor = color.hex;
      swatch.title = `${color.name} (${color.hex})`;
      
      if (color.discoveredTimestamp && (sortOrder === 'discovered_asc' || sortOrder === 'discovered_desc')) {
        swatch.title += `\nDiscovered: ${new Date(color.discoveredTimestamp).toLocaleDateString()}`;
      }
      if (totalPlayers && totalPlayers > 0) {
        if (color.rarity <= 5 && color.rarity > 0) {
          swatch.classList.add('rare-color');
        }
        
        swatch.title += `\nDiscovered by ${color.discoveryCount}/${totalPlayers} players (${color.rarity.toFixed(4)}%)`;
      }
      swatch.addEventListener('mouseenter', (event) => {
        if (!this.pinnedColorSwatch) {
            this.showColorInfo(color, event);
        }
      });
      swatch.addEventListener('mouseleave', () => {
        this.hideColorInfo();
      });
      swatch.addEventListener('click', (event) => {
        event.stopPropagation();
        if (this.pinnedColorSwatch === swatch) {
          swatch.classList.remove('pinned');
          this.pinnedColorSwatch = null;
          this.hideColorInfo(true);
        } else {
          if (this.pinnedColorSwatch) {
            this.pinnedColorSwatch.classList.remove('pinned');
          }
          this.pinnedColorSwatch = swatch;
          this.pinnedColorSwatch.classList.add('pinned');
          this.showColorInfo(color, event, true);
        }
      });
      this.gameColorGrid.appendChild(swatch);
    });

    this.gameColorGrid.addEventListener('click', () => {
        if (this.pinnedColorSwatch) {
            this.pinnedColorSwatch.classList.remove('pinned');
            this.pinnedColorSwatch = null;
            this.hideColorInfo(true);
        }
    });
    if (preserveScroll && encyclopediaContent) {

        requestAnimationFrame(() => {
            encyclopediaContent.scrollTop = scrollPosition;
        });
    }
  }
  _setupColorGridPaginationListeners() {
      const prevButton = document.getElementById('colorGridPrevPage');
      const nextButton = document.getElementById('colorGridNextPage');
      if (prevButton && !prevButton.dataset.listenerAttached) {
          prevButton.addEventListener('click', () => {
              if (this.colorGridCurrentPage > 1) {
                  this.colorGridCurrentPage--;
                  this.updateEncyclopedia(this.lastKnownDiscoveredColors, null, true);
              }
          });
          prevButton.dataset.listenerAttached = 'true';
      }
      if (nextButton && !nextButton.dataset.listenerAttached) {
          nextButton.addEventListener('click', () => {
              const totalPages = Math.ceil(this.lastKnownFilteredColorCount / this.COLOR_GRID_PAGE_SIZE);
              if (this.colorGridCurrentPage < totalPages) {
                  this.colorGridCurrentPage++;
                  this.updateEncyclopedia(this.lastKnownDiscoveredColors, null, true);
              }
          });
          nextButton.dataset.listenerAttached = 'true';
      }
  }
  _updateColorGridPaginationControls(totalItems) {
      if (!this.colorGridPaginationControls) return;
      
    const totalPages = Math.ceil(totalItems / this.COLOR_GRID_PAGE_SIZE);
    const prevButton = document.getElementById('colorGridPrevPage');
    const nextButton = document.getElementById('colorGridNextPage');
    const pageInfo = document.getElementById('colorGridPageInfo');
      if (totalPages <= 1) {
          this.colorGridPaginationControls.style.display = 'none';
          return;
      }
      this.colorGridPaginationControls.style.display = 'flex';
      if (prevButton) {
        prevButton.disabled = this.colorGridCurrentPage === 1;

      }
      
      if (pageInfo) {
        pageInfo.textContent = `Page ${this.colorGridCurrentPage} / ${totalPages}`;
      }
      
      if (nextButton) {
        nextButton.disabled = this.colorGridCurrentPage === totalPages;

      }
  }
  showColorInfo(colorData, event, isPinned = false) {
    if(!this.gameColorInfo) return;

    if (this.pinnedColorSwatch && !isPinned) {
        return;
    }
    this.gameColorInfo.style.display = 'block'; 
    if (isPinned) {
      this.gameColorInfo.classList.add('pinned');
    } else {

      this.gameColorInfo.classList.remove('pinned');
    }
    let hslString = 'HSL: N/A';
    if (colorData.rgb && this.game && this.game.colorSystem && typeof this.game.colorSystem.rgbToHsl === 'function') {
        const hsl = this.game.colorSystem.rgbToHsl(...colorData.rgb);
        hslString = `HSL: ${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%`;
    } else if (colorData.hsl) {
        hslString = `HSL: ${Math.round(colorData.hsl.h)}, ${Math.round(colorData.hsl.s * 100)}%, ${Math.round(colorData.hsl.l * 100)}%`;
    }
    let discoveryStatString = '';
    if (this.game && this.game.challengeManager) {
        const statsMap = new Map(this.game.challengeManager.colorDiscoveryStats.map(s => [s.hex_code, s.discovery_count]));
        const totalPlayers = this.game.challengeManager.totalPlayerCount;
        if (totalPlayers > 0) {
            let discoveryCount, percentage;
            if (colorData.isPrimary) {
                discoveryCount = totalPlayers;
                percentage = 100;
            } else {
                discoveryCount = statsMap.get(colorData.hex) || 0;
                percentage = (discoveryCount / totalPlayers) * 100;
            }
            let percentageText;
            if (percentage === 100) {
                percentageText = '100%';
            } else if (percentage < 0.01 && percentage > 0) {
                percentageText = '<0.01%';
            } else if (percentage < 1 && percentage > 0) {
                percentageText = `${percentage.toFixed(2)}%`;
            } else {
                percentageText = `${Math.round(percentage)}%`;
            }
            discoveryStatString = `Discovered by <strong>${percentageText}</strong> of players (${discoveryCount}/${totalPlayers}).<br>`;
        }
    }
    this.gameColorInfo.innerHTML = `
      <strong>${colorData.name}</strong><br>
      HEX: ${colorData.hex}<br>
      RGB: (${colorData.rgb ? colorData.rgb.join(', ') : 'N/A'})<br>
      ${hslString}<br>
      Mixed from ${colorData.mixArity || 'N/A'} colors.<br>
      ${discoveryStatString}
      ${colorData.mixedFrom ? `<br><small>Parents: ${colorData.mixedFrom.join(', ')}</small>` : ''}
      <button class="copy-hex-button" data-hex="${colorData.hex}">Copy Hex</button>
    `;
    const copyButton = this.gameColorInfo.querySelector('.copy-hex-button');
    if (copyButton) {
      copyButton.addEventListener('click', (e) => {
        e.stopPropagation(); 
        const hexToCopy = e.target.dataset.hex;
        navigator.clipboard.writeText(hexToCopy).then(() => {
          audioManager.playSound('click1');
          e.target.textContent = 'Copied!';
          setTimeout(() => {
            e.target.textContent = 'Copy Hex';
          }, 1500);
        }).catch(err => {
          console.error('Failed to copy hex code:', err);
          e.target.textContent = 'Error!';
           setTimeout(() => {
            e.target.textContent = 'Copy Hex';
          }, 1500);
        });
      });
    }
    if (event) {
        const swatchEl = event.currentTarget;
        const swatchRect = swatchEl.getBoundingClientRect();
        const tooltipRect = this.gameColorInfo.getBoundingClientRect();
        const containerRect = this.fullscreenEncyclopedia.getBoundingClientRect();
        let top = swatchRect.top - tooltipRect.height - 10; 
        let left = swatchRect.left + (swatchRect.width / 2) - (tooltipRect.width / 2); 

        if (top < containerRect.top) {
            top = swatchRect.bottom + 10;
        }

        if (left < containerRect.left) {
            left = containerRect.left + 5;
        }

        if (left + tooltipRect.width > containerRect.right) {
            left = containerRect.right - tooltipRect.width - 5;
        }
        
        this.gameColorInfo.style.top = `${top}px`;
        this.gameColorInfo.style.left = `${left}px`;
    }
}
  hideColorInfo(force = false) {
    if (this.gameColorInfo) {

        if (force || !this.gameColorInfo.classList.contains('pinned')) {
            this.gameColorInfo.style.display = 'none';
            this.gameColorInfo.classList.remove('pinned');
            if (force && this.pinnedColorSwatch) {
                this.pinnedColorSwatch.classList.remove('pinned');
                this.pinnedColorSwatch = null;
            }
        }
    }
  }
  showColorDiscovered(colorData) {
    audioManager.playSound('NewColor');
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
  _createSideNotificationContainer() {
    if (document.getElementById('side-notification-container')) {
        this.sideNotificationContainer = document.getElementById('side-notification-container');
        return;
    }
    this.sideNotificationContainer = document.createElement('div');
    this.sideNotificationContainer.id = 'side-notification-container';
    this.sideNotificationContainer.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
        pointer-events: none;
    `;
    document.body.appendChild(this.sideNotificationContainer);
  }
  showAchievement(message) {
    audioManager.playSound('Achievement');
    const notificationElement = document.createElement('div');
    notificationElement.className = 'side-notification';
    notificationElement.textContent = message;
    this.sideNotificationContainer.insertBefore(notificationElement, this.sideNotificationContainer.firstChild);

    void notificationElement.offsetWidth;

    notificationElement.classList.add('visible');

    const allNotifications = this.sideNotificationContainer.querySelectorAll('.side-notification');
    allNotifications.forEach((el, index) => {
        if (index > 0) { 
            el.style.transform = `scale(${1 - (index * 0.05)}) translateY(${index * 5}px)`;
            el.style.opacity = 1 - (index * 0.15);
        }
    });

    setTimeout(() => {
        notificationElement.classList.remove('visible');
        notificationElement.addEventListener('transitionend', () => {
            if (notificationElement.parentNode) {
                notificationElement.parentNode.removeChild(notificationElement);
            }

            const remainingNotifications = this.sideNotificationContainer.querySelectorAll('.side-notification');
            remainingNotifications.forEach((el, index) => {
                el.style.transform = `scale(${1 - (index * 0.05)}) translateY(${index * 5}px)`;
                el.style.opacity = 1 - (index * 0.15);
            });
        });
    }, 4000);
  }
  updateChallengeDisplay(challenge) {
    if(!this.gameChallengeDisplay) return;

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
    }
  }
  setupLeaderboardToggleListener() {
    if (this.leaderboardToggleButton && this.gameLeaderboardPanelEl) {
      this.leaderboardToggleButton.addEventListener('click', () => {
        audioManager.playSound('click1');
        const isVisible = this.gameLeaderboardPanelEl.style.display === 'block';
        this.gameLeaderboardPanelEl.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) {

            if (this.fullscreenEncyclopedia && this.fullscreenEncyclopedia.style.display === 'block') {
                this.showEncyclopedia(false);
            }
            this.displayLeaderboard(); 
        }
      });
    }
  }
  updateMixButtonPosition() {
    if (!this.mixButtonContainer) return;

    let bottomOffset = 20; 

    if (window.innerWidth <= 768) {
      bottomOffset = 10; 
    }
    if (window.innerWidth <= 480) {
      bottomOffset = 8; 
    }
    
    this.mixButtonContainer.style.bottom = `${bottomOffset}px`;
  }
  handleResize() {
    this.updateMixButtonPosition();

  }
populateRingsManagementTab() {
    const ringsTabPanel = document.getElementById('colorRingsTab');
    if (!ringsTabPanel || !this.game || !this.game.orbManager || !this.game.orbRingCapacities || !this.game.colorSystem) {
      if (ringsTabPanel) ringsTabPanel.innerHTML = '<p>Ring data system is not fully initialized. Please ensure game is running.</p>';
      return;
    }
    const allGameOrbs = this.game.orbManager.orbs;
    const ringCapacities = this.game.orbRingCapacities;

    [2, 3, 4].forEach(mixArity => {
      const capacity = ringCapacities[mixArity];
      if (capacity === Infinity || !capacity) return; 
      const activeOrbsCountSpan = document.getElementById(`activeOrbsCount-${mixArity}`);
      const maxOrbsCountSpan = document.getElementById(`maxOrbsCount-${mixArity}`);
      const activeOrbsListUl = document.getElementById(`activeOrbsList-${mixArity}`);
      const manageOrbsButton = ringsTabPanel.querySelector(`.manageRingOrbsButton[data-arity="${mixArity}"]`);
      const availableOrbsSectionDiv = document.getElementById(`availableOrbsSection-${mixArity}`);
      const availableOrbsSortDropdown = document.getElementById(`availableOrbsSortDropdown-${mixArity}`);
      const availableOrbsFilterInput = document.getElementById(`availableOrbsFilterInput-${mixArity}`);
      if (!activeOrbsCountSpan || !maxOrbsCountSpan || !activeOrbsListUl || !manageOrbsButton || !availableOrbsSectionDiv || !availableOrbsSortDropdown || !availableOrbsFilterInput) {
        return;
      }

      if (availableOrbsSectionDiv.style.display === 'none' || availableOrbsSectionDiv.style.display === '') {
        const paginationControlsContainer = document.getElementById(`summonablePagination-${mixArity}`);
        if (paginationControlsContainer) {
            paginationControlsContainer.style.display = 'none';
        }
      }
      const activeOrbsInThisRing = allGameOrbs.filter(
        orb => orb.colorData.mixArity === mixArity && !orb.colorData.isPrimary
      );

      activeOrbsCountSpan.textContent = activeOrbsInThisRing.length;
      maxOrbsCountSpan.textContent = capacity;

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
            audioManager.playSound('RemoveColor');
            if (this.game && typeof this.game.handleUnsummonOrbRequest === 'function') {
              this.game.handleUnsummonOrbRequest(orb);
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

      if (!manageOrbsButton.dataset.listenerAttached) {
          manageOrbsButton.addEventListener('click', () => {
              const isHidden = availableOrbsSectionDiv.style.display === 'none' || availableOrbsSectionDiv.style.display === '';
              availableOrbsSectionDiv.style.display = isHidden ? 'block' : 'none';
              manageOrbsButton.innerHTML = isHidden ? '<span class="plusIcon">-</span> Hide Summonable' : '<span class="plusIcon">+</span> Manage Orbs';
              if (isHidden) {
                  this.populateAvailableOrbsList(mixArity);
              } else {

                  const paginationControlsContainer = document.getElementById(`summonablePagination-${mixArity}`);
                  if (paginationControlsContainer) {
                      paginationControlsContainer.style.display = 'none';
                  }
              }
          });
          manageOrbsButton.dataset.listenerAttached = 'true';
      }
      if (!availableOrbsSortDropdown.dataset.listenerAttached) {
          availableOrbsSortDropdown.addEventListener('change', () => {
              if (availableOrbsSectionDiv.style.display === 'block') {
                  this.populateAvailableOrbsList(mixArity);
              }
          });
          availableOrbsSortDropdown.dataset.listenerAttached = 'true';
      }
      if (!availableOrbsFilterInput.dataset.listenerAttached) {
          availableOrbsFilterInput.addEventListener('input', () => {
              if (availableOrbsSectionDiv.style.display === 'block') {
                  this.summonableListPage[mixArity] = 1;
                  this.populateAvailableOrbsList(mixArity);
              }
          });
          availableOrbsFilterInput.dataset.listenerAttached = 'true';
      }
    });
  }
  populateAvailableOrbsList(mixArity, preserveScroll = false) {
    const availableOrbsListUl = document.getElementById(`availableOrbsList-${mixArity}`);
    const availableOrbsSectionDiv = document.getElementById(`availableOrbsSection-${mixArity}`);
    const sortDropdown = document.getElementById(`availableOrbsSortDropdown-${mixArity}`);
    const filterInput = document.getElementById(`availableOrbsFilterInput-${mixArity}`);
    
    let scrollPosition = 0;
    if (preserveScroll && availableOrbsSectionDiv) {
        scrollPosition = availableOrbsSectionDiv.scrollTop;
    }
    if (!availableOrbsListUl || !sortDropdown || !filterInput || !this.game || !this.game.colorSystem || !this.game.orbManager) {
      if(availableOrbsListUl) availableOrbsListUl.innerHTML = '<li>Error loading summonable colors.</li>';
      return;
    }
    const sortOrder = sortDropdown.value;
    const filterText = filterInput.value.toLowerCase().trim();
    const allDiscoveredColors = this.game.colorSystem.getDiscoveredColors();
    const activeOrbHexes = new Set(this.game.orbManager.orbs.map(orb => orb.colorData.hex));
    let summonableColors = allDiscoveredColors.filter(color => {
      const matchesArity = color.mixArity === mixArity;
      const isNotPrimary = !color.isPrimary;
      const isNotActive = !activeOrbHexes.has(color.hex);
      const matchesFilter = (() => {
          if (filterText === '') return true;
          const lowerName = color.name.toLowerCase();
          const lowerHex = color.hex.toLowerCase();
          if (filterText.startsWith('#')) {
              return lowerHex.includes(filterText);
          } else {
              return lowerName.includes(filterText) || lowerHex.substring(1).includes(filterText);
          }
      })();
      return matchesArity && isNotPrimary && isNotActive && matchesFilter;
    });
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
        default: summonableColors.sort((a, b) => a.name.localeCompare(b.name));
    }
    this._updateSummonableListPaginationControls(mixArity, summonableColors.length);
    availableOrbsListUl.innerHTML = '';
    availableOrbsListUl.className = 'availableOrbsGrid'; 
    if (summonableColors.length === 0) {
        if (filterText) {
            availableOrbsListUl.innerHTML = `<li class="noOrbsMessage">No colors found matching "${filterInput.value}".</li>`;
        } else {
            availableOrbsListUl.innerHTML = '<li class="noOrbsMessage">No new colors of this type available to summon. Discover more!</li>';
        }
        return;
    }
    const currentPage = this.summonableListPage[mixArity] || 1;
    const startIndex = (currentPage - 1) * this.SUMMONABLE_LIST_PAGE_SIZE;
    const endIndex = startIndex + this.SUMMONABLE_LIST_PAGE_SIZE;
    const paginatedColors = summonableColors.slice(startIndex, endIndex);
    paginatedColors.forEach(colorData => {
      const listItem = document.createElement('li');
      listItem.className = 'ringOrbListItem availableOrbListItem';
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
      summonButton.dataset.orbHex = colorData.hex;
      summonButton.addEventListener('click', () => {
        audioManager.playSound('AddColor');
        if (this.game && typeof this.game.handleSummonOrbRequest === 'function') {
          this.game.handleSummonOrbRequest(colorData, mixArity);
        }
      });
      listItem.appendChild(swatch);
      listItem.appendChild(nameSpan);
      listItem.appendChild(summonButton);
      availableOrbsListUl.appendChild(listItem);
    });
    if (preserveScroll && availableOrbsSectionDiv) {
        availableOrbsSectionDiv.scrollTop = scrollPosition;
    }
  }
  _setupSummonableListPaginationListeners() {
    [2, 3, 4].forEach(mixArity => {
      const prevButton = document.getElementById(`summonablePrevPage-${mixArity}`);
      const nextButton = document.getElementById(`summonableNextPage-${mixArity}`);
      if (prevButton) {
        prevButton.addEventListener('click', () => {
          if ((this.summonableListPage[mixArity] || 1) > 1) {
            this.summonableListPage[mixArity]--;
            this.populateAvailableOrbsList(mixArity, true);
          }
        });
      }
      if (nextButton) {
        nextButton.addEventListener('click', () => {
          const totalPages = nextButton.dataset.totalPages ? parseInt(nextButton.dataset.totalPages, 10) : 1;
          if ((this.summonableListPage[mixArity] || 1) < totalPages) {
            this.summonableListPage[mixArity]++;
            this.populateAvailableOrbsList(mixArity, true);
          }
        });
      }
    });
  }
  _updateSummonableListPaginationControls(mixArity, totalItems) {
    const paginationControlsContainer = document.getElementById(`summonablePagination-${mixArity}`);
    if (!paginationControlsContainer) return;
    const totalPages = Math.ceil(totalItems / this.SUMMONABLE_LIST_PAGE_SIZE);
    const currentPage = this.summonableListPage[mixArity] || 1;
    if (totalPages <= 1) {
      paginationControlsContainer.style.display = 'none';
      return;
    }
    paginationControlsContainer.style.display = 'flex';
    const prevButton = document.getElementById(`summonablePrevPage-${mixArity}`);
    const nextButton = document.getElementById(`summonableNextPage-${mixArity}`);
    const pageInfo = document.getElementById(`summonablePageInfo-${mixArity}`);
    if (prevButton) {
      prevButton.disabled = currentPage === 1;
    }
    if (pageInfo) {
      pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
    }
    if (nextButton) {
      nextButton.disabled = currentPage === totalPages;
      nextButton.dataset.totalPages = totalPages;
    }
  }
  async populateAchievementsTab() {
    if (!this.achievementsListContainer || !this.game || !this.game.challengeManager) {
      if (this.achievementsListContainer) this.achievementsListContainer.innerHTML = '<p>Achievements system not ready.</p>';
      return;
    }
    this.achievementsListContainer.innerHTML = '<p class="loading-message">Loading achievements...</p>'; // Loading state
    try {

      await this.game.challengeManager.fetchTotalPlayerCount(); 
      const achievementsData = await this.game.challengeManager.fetchAllAchievementData();
      const totalPlayers = this.game.challengeManager.totalPlayerCount;
      
      this.achievementsListContainer.innerHTML = ''; 
      if (!achievementsData || achievementsData.length === 0) {
        this.achievementsListContainer.innerHTML = '<p>No achievements defined or loaded.</p>';
        return;
      }
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

        ach.tiers.forEach((tier, index) => {
          const tierDiv = document.createElement('div');
          tierDiv.className = 'achievement-tier';

          if (ach.player_current_tier_index >= index) {
            tierDiv.classList.add('completed');
          }
          const tierIcon = document.createElement('span');
          tierIcon.className = 'tier-icon';
          tierIcon.textContent = tier.icon; 
          const tierName = document.createElement('span');
          tierName.className = 'tier-name';
          tierName.textContent = tier.tierName;
          const tierProgressText = document.createElement('span');
          tierProgressText.className = 'tier-progress-text';

          let currentAmount = ach.player_progress_count || 0;
          let requirementForDisplay = tier.requirement;
          let displayAmount = currentAmount;
          if (ach.player_current_tier_index >= index) { // Tier completed
            tierProgressText.textContent = ` (${requirementForDisplay}/${requirementForDisplay} - Complete!)`;
          } else if (ach.player_current_tier_index === index - 1) { // Current tier target
            tierProgressText.textContent = ` (${Math.min(displayAmount, requirementForDisplay)}/${requirementForDisplay})`;
          } else { 
            tierProgressText.textContent = ` (0/${requirementForDisplay})`;
          }
          
          tierDiv.appendChild(tierIcon);
          tierDiv.appendChild(tierName);
          tierDiv.appendChild(tierProgressText);

          const tierStatsTooltip = document.createElement('div');
          tierStatsTooltip.className = 'tier-stats-tooltip';
          const globalCompletions = tier.global_completion_count !== undefined ? tier.global_completion_count : 0;
          
          let tooltipText = `Achieved by ${globalCompletions} players globally.`;
          if (totalPlayers !== null && totalPlayers > 0 && globalCompletions !== 'N/A') {
            const percentage = (globalCompletions / totalPlayers) * 100; 
            tooltipText = `Achieved by ${globalCompletions} (${percentage.toFixed(1)}%) of players globally.`;

            if (percentage < 1.0 && percentage > 0) { 
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

          tiersContainer.appendChild(tierDiv);
        });
        cardBody.appendChild(tiersContainer);
        cardElement.appendChild(cardBody);
        listElement.appendChild(cardElement);
      });
      this.achievementsListContainer.appendChild(listElement);
    } catch (error) {
      this.achievementsListContainer.innerHTML = '<p class="error-message">Could not load achievements. Please try again later.</p>';
    }
  }
  setupBattleModeButtonListener() {
    if (this.battleModeButton) {
      this.battleModeButton.addEventListener('click', () => {
        audioManager.playSound('click1');
        this.showLobbyScreen(true); 
      });
    }
    if (this.battleModeActionButton) {
        this.battleModeActionButton.addEventListener('click', () => this.handleBattleActionClick());
    }

  }
  _initializeAndBindPlayerMixButtons() {
    if (this._playerMixButtonListenersAttached) {
        return; 
    }
    if (!this.playerOneMixButton) {
        this.playerOneMixButton = document.getElementById('playerOneMixButton');
    }
    if (!this.playerTwoMixButton) {
        this.playerTwoMixButton = document.getElementById('playerTwoMixButton');
    }
    let listenersAttachedThisCall = false;
    if (this.playerOneMixButton) {
        this.playerOneMixButton.addEventListener('click', () => {
            this.handlePlayerOneMixAttempt();
        });
        listenersAttachedThisCall = true;
    }
    if (this.playerTwoMixButton) {
        this.playerTwoMixButton.addEventListener('click', () => {
            this.handlePlayerTwoMixAttempt();
        });
        listenersAttachedThisCall = true;
    }
    if (listenersAttachedThisCall) {
        this._playerMixButtonListenersAttached = true;
    }
  }
  showBattleModeScreen(show, sessionData = null, isLocalPlayerOne = null) {
    this.currentBattleSessionData = sessionData; 
    this.localPlayerIsOne = isLocalPlayerOne; 
    if (this.battleModeScreen) {
      this.battleModeScreen.style.display = show ? 'flex' : 'none'; 
      if (show) {
        this._initializeAndBindPlayerMixButtons();

        if (this.fullscreenEncyclopedia && this.fullscreenEncyclopedia.style.display !== 'none') {
          this.showEncyclopedia(false);
        }
        if (this.gameLeaderboardPanelEl && this.gameLeaderboardPanelEl.style.display !== 'none') {
          this.gameLeaderboardPanelEl.style.display = 'none';
        }

        if (this.gameArea) {
           this.gameArea.style.filter = 'blur(8px)';
           this.gameArea.style.pointerEvents = 'none';
        }

        const playerOneLabelEl = document.getElementById('playerOneBattleLabel');
        const playerTwoLabelEl = document.getElementById('playerTwoBattleLabel');
        
        if (this.localPlayerIsOne !== null) { 
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
        } else { 
            if (playerOneLabelEl) playerOneLabelEl.textContent = "Player 1";
            if (playerTwoLabelEl) playerTwoLabelEl.textContent = "Player 2";
        }

        
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

            if (this.playerOneMixButton) {
                this.playerOneMixButton.disabled = this.localPlayerIsOne ? true : true; // Initially true, enabled by orb selection
            }
            if (this.playerTwoMixButton) {
                this.playerTwoMixButton.disabled = !this.localPlayerIsOne ? true : true; // Initially true, enabled by orb selection
            }
            if (this.playerOneBattleOrbsContainer) {
                this.playerOneBattleOrbsContainer.style.pointerEvents = this.localPlayerIsOne ? 'auto' : 'none';
                this.playerOneBattleOrbsContainer.style.opacity = this.localPlayerIsOne ? '1' : '0.5';
            }
            if (this.playerTwoBattleOrbsContainer) {
                this.playerTwoBattleOrbsContainer.style.pointerEvents = !this.localPlayerIsOne ? 'auto' : 'none';
                this.playerTwoBattleOrbsContainer.style.opacity = !this.localPlayerIsOne ? '1' : '0.5';
            }
        }
      } else { 
        this.currentBattleSessionData = null;
        this.localPlayerIsOne = null; // Reset flag
        if (this.gameArea) {
           this.gameArea.style.filter = 'none';
           this.gameArea.style.pointerEvents = ''; 
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
    this.stopBattleTimer(); 
    this.battleTimerSeconds = durationSeconds;
    this.updateBattleTimerDisplay();
    this.battleTimerInterval = setInterval(() => {
      this.battleTimerSeconds--;
      this.updateBattleTimerDisplay();
      if (this.battleTimerSeconds <= 0) {
        this.stopBattleTimer();
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

  displaySpecificTargetColor(targetColor) {
    if (!this.targetBattleColorDisplay || !this.targetBattleColorInfo || !targetColor || !this.game || !this.game.colorSystem) {
        if (this.targetBattleColorDisplay) this.targetBattleColorDisplay.style.backgroundColor = '#333';
        if (this.targetBattleColorInfo) this.targetBattleColorInfo.textContent = 'Target color not set.';
        return null;
    }
    this.targetBattleColorDisplay.style.backgroundColor = targetColor.hex;
    this.targetBattleColorDisplay.textContent = ''; 

    this.targetBattleColorInfo.innerHTML = `
        <strong>${targetColor.name}</strong><br>
        Match this specific color!
    `;
    
    this.currentGameBattleTargetColor = targetColor;
    return targetColor; 
  }
  initializePlayerOneBattleOrbs() {
    if (!this.game || !this.game.colorSystem) {
        this.playerOneAvailableBattleOrbs = [];
        return;
    }
    if (!this.playerOneBattleOrbsContainer) {
        return;
    }
    const cs = this.game.colorSystem;
  
    const baseOrbSetups = [
        { name: 'White',       position: 'orb-pos-r1-c1', symbol: null }, 
        { name: 'Red',         position: 'orb-pos-r1-c2', symbol: null }, 
        { name: 'Yellow',      position: 'orb-pos-r1-c3', symbol: null }, 
        { name: 'Blue',        position: 'orb-pos-r1-c4', symbol: null }, 
        { name: 'Black',       position: 'orb-pos-r1-c5', symbol: null }, 
        { name: 'Saturator',   position: 'orb-pos-r2-c1', symbol: 'S'  }, 
        { name: 'Desaturator', position: 'orb-pos-r2-c5', symbol: 'D'  }  
    ];
    this.playerOneAvailableBattleOrbs = baseOrbSetups.map(orbInfo => {
        const colorData = cs.getDiscoveredColors().find(c => c.name === orbInfo.name);
        if (!colorData) {
            return {
                colorData: { name: orbInfo.name, hex: '#808080', isFallback: true }, // Fallback visual
                position: orbInfo.position,
                symbol: orbInfo.symbol
            };
        }
        return { colorData, position: orbInfo.position, symbol: orbInfo.symbol };
    }).filter(Boolean);
    this.renderPlayerOneBattleOrbs();
  }
  renderPlayerOneBattleOrbs() {
    if (!this.playerOneBattleOrbsContainer) return;
    this.playerOneBattleOrbsContainer.innerHTML = '';
    this.playerOneAvailableBattleOrbs.forEach(orbSetup => {
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
            const luminance = this.#calculateLuminance(orbSetup.colorData.rgb || [0,0,0]); 
            orbEl.style.color = luminance > 0.5 ? 'black' : 'white';
        } else if (!orbSetup.position) { 

        }
        
        orbEl.addEventListener('click', () => this.handlePlayerOneBattleOrbClick(orbSetup.colorData));
        this.playerOneBattleOrbsContainer.appendChild(orbEl);
    });
}
  handlePlayerOneBattleOrbClick(colorData) {
    if (!this.localPlayerIsOne) {
        return;
    }
    if (this.playerOneBattleSelection.length >= this.MAX_BATTLE_SELECTION) {
        return;
    }
    const selectedIndex = this.playerOneBattleSelection.findIndex(selectedOrb => selectedOrb.hex === colorData.hex);
    if (selectedIndex > -1) {
        this.playerOneBattleSelection.splice(selectedIndex, 1);
    } else {
        if (this.playerOneBattleSelection.length >= this.MAX_BATTLE_SELECTION) {
            return;
        }
        this.playerOneBattleSelection.push(colorData);
    }
    this.updatePlayerOneSelectedOrbsDisplay();
    if (this.playerOneMixButton) {
        const canMix = this.playerOneBattleSelection.length >= 2 && this.playerOneBattleSelection.length <= this.MAX_BATTLE_SELECTION;
        this.playerOneMixButton.disabled = !canMix;
    }
  }
  updatePlayerOneSelectedOrbsDisplay() {
    if (!this.playerOneSelectedOrbsContainer) return;
    const placeholders = this.playerOneSelectedOrbsContainer.querySelectorAll('.orb-placeholder');
    
    placeholders.forEach((placeholder, index) => {
        placeholder.innerHTML = ''; 
        placeholder.classList.remove('has-orb');

        if (index < this.playerOneBattleSelection.length) {
            const selectedOrbData = this.playerOneBattleSelection[index];
            placeholder.classList.add('has-orb');
            
            const orbSwatchEl = document.createElement('div');
            orbSwatchEl.classList.add('selected-battle-orb');
            orbSwatchEl.style.backgroundColor = selectedOrbData.hex;
            orbSwatchEl.title = selectedOrbData.name; 
            placeholder.appendChild(orbSwatchEl);
        }

    });
  }
  handlePlayerOneMixAttempt() {
    if (!this.localPlayerIsOne) {
        return;
    }
    if (!this.game || !this.game.colorSystem || !this.playerOneColorDisplay || !this.playerOneColorResultInfo) {
        return;
    }
    if (this.playerOneBattleSelection.length < 2) {
        this.displayPlayerOneMixedColor(null, "Select at least 2 orbs to mix!");
        return;
    }
    const mixedColor = this.game.colorSystem.mixColors(this.playerOneBattleSelection);
    this.displayPlayerOneMixedColor(mixedColor);
    if (mixedColor) {
        if (!this.playerOneAvailableBattleOrbs.some(orb => orb.colorData.hex === mixedColor.hex)) {
            this.playerOneAvailableBattleOrbs.push({
                colorData: mixedColor,
            });
            this.renderPlayerOneBattleOrbs(); 
        }
    }
    if (this.game && typeof this.game.handlePlayerOneBattleMixResult === 'function') {
      this.game.handlePlayerOneBattleMixResult(mixedColor, this.currentGameBattleTargetColor);
    }
    this.playerOneBattleSelection = [];
    this.updatePlayerOneSelectedOrbsDisplay();
    if (this.playerOneMixButton) {
        this.playerOneMixButton.disabled = true; 
    }
}
  displayPlayerOneMixedColor(colorData, customMessage = null) {
    if (!this.playerOneColorDisplay || !this.playerOneColorResultInfo) return;
    if (customMessage) {
        this.playerOneColorDisplay.style.backgroundColor = '#555'; 
        this.playerOneColorDisplay.textContent = 'X';
        this.playerOneColorResultInfo.innerHTML = `<strong>${customMessage}</strong>`;
        return;
    }
    if (colorData) {
        this.playerOneColorDisplay.style.backgroundColor = colorData.hex;
        this.playerOneColorDisplay.textContent = ''; 
        const hsl = this.game.colorSystem.rgbToHsl(...colorData.rgb);
        this.playerOneColorResultInfo.innerHTML = `
            <strong>${colorData.name}</strong><br>
            RGB: (${colorData.rgb.join(', ')})<br>
            HSL: ${hsl.h.toFixed(0)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%
        `;
    } else {
        this.playerOneColorDisplay.style.backgroundColor = '#555'; 
        this.playerOneColorDisplay.textContent = 'X'; 
        this.playerOneColorResultInfo.innerHTML = `<strong>Mix Failed!</strong><br>Try a different combination.`;
    }
  }
  clearPlayerOneMixedColorDisplay() {
    if (this.playerOneColorDisplay) {
        this.playerOneColorDisplay.style.backgroundColor = '#3a3a5a'; 
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

  initializePlayerTwoBattleOrbs() {
    if (!this.game || !this.game.colorSystem || !this.playerTwoBattleOrbsContainer) {
        this.playerTwoAvailableBattleOrbs = [];
        return;
    }
    const cs = this.game.colorSystem;

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
            const luminance = this.#calculateLuminance(orbSetup.colorData.rgb || [0,0,0]); 
            orbEl.style.color = luminance > 0.5 ? 'black' : 'white';
        }
        
        orbEl.addEventListener('click', () => this.handlePlayerTwoBattleOrbClick(orbSetup.colorData));
        this.playerTwoBattleOrbsContainer.appendChild(orbEl);
    });
}
  handlePlayerTwoBattleOrbClick(colorData) {
    if (this.localPlayerIsOne) { 
        return;
    }
    if (this.playerTwoBattleSelection.length >= this.MAX_BATTLE_SELECTION) {
        return;
    }
    const selectedIndex = this.playerTwoBattleSelection.findIndex(selectedOrb => selectedOrb.hex === colorData.hex);
    if (selectedIndex > -1) {
        this.playerTwoBattleSelection.splice(selectedIndex, 1);
    } else {
        if (this.playerTwoBattleSelection.length >= this.MAX_BATTLE_SELECTION) {
            return;
        }
        this.playerTwoBattleSelection.push(colorData);
    }
    this.updatePlayerTwoSelectedOrbsDisplay();
    if (this.playerTwoMixButton) {
        const canMix = this.playerTwoBattleSelection.length >= 2 && this.playerTwoBattleSelection.length <= this.MAX_BATTLE_SELECTION;
        this.playerTwoMixButton.disabled = !canMix;
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
    if (this.localPlayerIsOne) {
        return;
    }
    if (!this.game || !this.game.colorSystem || !this.playerTwoColorDisplay || !this.playerTwoColorResultInfo) {
        return;
    }
    if (this.playerTwoBattleSelection.length < 2) {
        this.displayPlayerTwoMixedColor(null, "Select at least 2 orbs to mix!");
        return;
    }
    const mixedColor = this.game.colorSystem.mixColors(this.playerTwoBattleSelection);
    this.displayPlayerTwoMixedColor(mixedColor);
    if (mixedColor) {
        if (!this.playerTwoAvailableBattleOrbs.some(orb => orb.colorData.hex === mixedColor.hex)) {
            this.playerTwoAvailableBattleOrbs.push({ colorData: mixedColor });
            this.renderPlayerTwoBattleOrbs();
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
      return;
    }

    if (this.battleWinnerMessage) {
      this.battleWinnerMessage.textContent = winnerMessage;
    }
    const localPlayerLost = (this.game.isLocalPlayerOne && winnerMessage.includes('Player 2 Wins')) ||
                            (!this.game.isLocalPlayerOne && winnerMessage.includes('Player 1 Wins')) ||
                            winnerMessage.includes('You Lose');
    if (localPlayerLost) {
        audioManager.playSound('Loss');
    }
    const localPlayerWon = (this.game.isLocalPlayerOne && winnerMessage.includes('Player 1 Wins')) ||
                           (!this.game.isLocalPlayerOne && winnerMessage.includes('Player 2 Wins')) ||
                           winnerMessage.includes('You Win!');
                           
    if (localPlayerWon) {
        audioManager.playSound('Achievement');
    }

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

        if (this.playerOneResultLabel) this.playerOneResultLabel.textContent = "Player 1";
        if (this.playerTwoResultLabel) this.playerTwoResultLabel.textContent = "Player 2";
    }

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

    if (this.playerOneResultSwatch && this.playerOneResultInfo) {
      const p1Result = formatPlayerResult(playerOneBestAttempt);
      this.playerOneResultSwatch.style.backgroundColor = p1Result.hex;
      this.playerOneResultInfo.innerHTML = p1Result.html;
    }

    if (this.playerTwoResultSwatch && this.playerTwoResultInfo) {
      const p2Result = formatPlayerResult(playerTwoBestAttempt);
      this.playerTwoResultSwatch.style.backgroundColor = p2Result.hex;
      this.playerTwoResultInfo.innerHTML = p2Result.html;
    }
    this.battleResultsScreen.style.display = 'flex'; 
  }
  showBattleResultsScreen(show) {
    if (show) {
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

    if (this.gameArea) {
       this.gameArea.style.filter = 'none';

    }
  }
  setupLobbyEventListeners() {
    if (this.cancelLobbyButton) {
      this.cancelLobbyButton.addEventListener('click', () => {
        this.showLobbyScreen(false);

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

        if (this.fullscreenEncyclopedia && this.fullscreenEncyclopedia.style.display !== 'none') {
          this.showEncyclopedia(false);
        }
        if (this.gameLeaderboardPanelEl && this.gameLeaderboardPanelEl.style.display !== 'none') {
          this.gameLeaderboardPanelEl.style.display = 'none';
        }
        if (this.battleModeScreen && this.battleModeScreen.style.display !== 'none') {
          this.showBattleModeScreen(false);
        }
        if (this.battleResultsScreen && this.battleResultsScreen.style.display !== 'none') {
            this.hideBattleResults();
        }

        if (this.gameArea) {
           this.gameArea.style.filter = 'blur(8px)'; 
           this.gameArea.style.pointerEvents = 'none';
        }
        this.updateLobbyStatus('Searching for a game...');

        if (this.game && typeof this.game.enterLobby === 'function') {
          this.game.enterLobby();
        }
      } else {

        if (this.gameArea) {
           this.gameArea.style.filter = 'none';
           this.gameArea.style.pointerEvents = ''; 
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

        if (message.toLowerCase().includes('found') || message.toLowerCase().includes('starting') || message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')) {
            spinner.style.display = 'none';
        } else {
            spinner.style.display = 'block';
        }
    }
  }
  updateOpponentMixDisplay(playerIdentifier, mixedColorData, difference) {
    let opponentColorDisplay, opponentColorResultInfo;
    if (this.game && this.game.isLocalPlayerOne !== null && this.currentBattleSessionData) {
        if (playerIdentifier === 'player_one' && !this.game.isLocalPlayerOne) { 
            opponentColorDisplay = this.playerOneColorDisplay;
            opponentColorResultInfo = this.playerOneColorResultInfo;
        } else if (playerIdentifier === 'player_two' && this.game.isLocalPlayerOne) { 
            opponentColorDisplay = this.playerTwoColorDisplay;
            opponentColorResultInfo = this.playerTwoColorResultInfo;
        } else {
            return;
        }
    } else {
        return;
    }
    if (!opponentColorDisplay || !opponentColorResultInfo || !this.game || !this.game.colorSystem) {
        return;
    }
    if (mixedColorData) {
        opponentColorDisplay.style.backgroundColor = mixedColorData.hex;
        opponentColorDisplay.textContent = '';
        const hsl = this.game.colorSystem.rgbToHsl(...mixedColorData.rgb);
        opponentColorResultInfo.innerHTML = `
            <strong>Opponent's Mix: ${mixedColorData.name}</strong><br>
            Difference: ${difference.toFixed(2)}<br>
            <small>RGB: (${mixedColorData.rgb.join(', ')})</small><br>
            <small>HSL: ${hsl.h.toFixed(0)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%</small>
        `;
    } else {
        opponentColorDisplay.style.backgroundColor = '#4a4a6a';
        opponentColorDisplay.textContent = 'O';
        opponentColorResultInfo.innerHTML = `<strong>Opponent is thinking...</strong>`;
    }
  }
  setupInitialBattleReadyState() {


    const localPlayerButton = this.localPlayerIsOne ? this.playerOneReadyButton : this.playerTwoReadyButton;
    const opponentPlayerButton = this.localPlayerIsOne ? this.playerTwoReadyButton : this.playerOneReadyButton;
    const localPlayerStatusEl = this.localPlayerIsOne ? this.playerOneReadyStatus : this.playerTwoReadyStatus;
    const opponentPlayerStatusEl = this.localPlayerIsOne ? this.playerTwoReadyStatus : this.playerOneReadyStatus;
    if (localPlayerButton) {
        localPlayerButton.textContent = 'Ready?';
        localPlayerButton.disabled = false;
        localPlayerButton.style.display = 'block';
    }
    if (opponentPlayerButton) {
        opponentPlayerButton.textContent = 'Opponent Not Ready'; 
        opponentPlayerButton.disabled = true; 
        opponentPlayerButton.style.display = 'block';
    }

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

    if (this.playerOneMixButton) this.playerOneMixButton.disabled = true;
    if (this.playerTwoMixButton) this.playerTwoMixButton.disabled = true;

    if (this.playerOneBattleOrbsContainer) {
        this.playerOneBattleOrbsContainer.style.pointerEvents = 'none';
        this.playerOneBattleOrbsContainer.style.opacity = '0.5';
    }
    if (this.playerTwoBattleOrbsContainer) {
        this.playerTwoBattleOrbsContainer.style.pointerEvents = 'none';
        this.playerTwoBattleOrbsContainer.style.opacity = '0.5';
    }

    if (this.battleModeTimerDisplay) {
        this.battleModeTimerDisplay.textContent = "Waiting for players...";
    }
    if (this.battleModeActionButton) {
        this.battleModeActionButton.textContent = "Cancel Match";
        this.battleModeActionButton.disabled = false; 
    }
    this.stopBattleTimer();

  }
  _setupReadyButtonListeners() {


    const setupListener = (button, callback) => {
        if (button && !button.dataset.listenerAttached) {
            button.addEventListener('click', callback);
            button.dataset.listenerAttached = 'true';
        }
    };
    setupListener(this.playerOneReadyButton, () => {
        if (this.localPlayerIsOne === true) {
            this.game.localPlayerClickedReady();
        }
    });
    setupListener(this.playerTwoReadyButton, () => {
        if (this.localPlayerIsOne === false) {
            this.game.localPlayerClickedReady();
        }
    });
  }
  updateLocalPlayerReadyButtonState(isReady) {
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

    let opponentPlayerButton, opponentPlayerStatusEl, opponentLabel;
    if (playerIdentifier === 'player_one' && this.localPlayerIsOne === false) { 
        opponentPlayerButton = this.playerOneReadyButton;
        opponentPlayerStatusEl = this.playerOneReadyStatus;
        opponentLabel = "Opponent (P1)";
    } else if (playerIdentifier === 'player_two' && this.localPlayerIsOne === true) { 
        opponentPlayerButton = this.playerTwoReadyButton;
        opponentPlayerStatusEl = this.playerTwoReadyStatus;
        opponentLabel = "Opponent (P2)";
    } else {
        return; 
    }
    if (opponentPlayerButton) {
        opponentPlayerButton.textContent = isReady ? 'Opponent Ready!' : 'Opponent Not Ready';
        opponentPlayerButton.disabled = true; 
    }
    if (opponentPlayerStatusEl) {
        opponentPlayerStatusEl.textContent = isReady ? `${opponentLabel}: Ready!` : `${opponentLabel}: Not Ready`;
        if(isReady) opponentPlayerStatusEl.classList.add('player-ready'); else opponentPlayerStatusEl.classList.remove('player-ready');
    }
  }
  enableBattleModeInteractionsAndStartTimer() {
    if (this.playerOneReadyButton) this.playerOneReadyButton.style.display = 'none';
    if (this.playerTwoReadyButton) this.playerTwoReadyButton.style.display = 'none';
    if (this.playerOneReadyStatus) this.playerOneReadyStatus.style.display = 'none';
    if (this.playerTwoReadyStatus) this.playerTwoReadyStatus.style.display = 'none';

    if (this.localPlayerIsOne) {
        if (this.playerOneMixButton) this.playerOneMixButton.disabled = true;
    } else if (this.localPlayerIsOne === false) {
        if (this.playerTwoMixButton) this.playerTwoMixButton.disabled = true; 
    }

    if (this.localPlayerIsOne) {
        if (this.playerOneBattleOrbsContainer) {
            this.playerOneBattleOrbsContainer.style.pointerEvents = 'auto';
            this.playerOneBattleOrbsContainer.style.opacity = '1';
        }
    } else if (this.localPlayerIsOne === false) { 
        if (this.playerTwoBattleOrbsContainer) {
            this.playerTwoBattleOrbsContainer.style.pointerEvents = 'auto';
            this.playerTwoBattleOrbsContainer.style.opacity = '1';
        }
    }

    this.startBattleTimer(60); 
    if (this.battleModeActionButton) {
        this.battleModeActionButton.textContent = "Forfeit Match";
        this.battleModeActionButton.disabled = false;
    }
  }
  handleBattleActionClick() {
    if (!this.game || !this.currentBattleSessionData) {
        this.showBattleModeScreen(false);
        if (this.game && typeof this.game.resetToMainMenu === 'function') {
            this.game.resetToMainMenu();
        }
        return;
    }
    const isGameStarted = this.game.isBattleGameStarted();
    if (isGameStarted) {
        if (typeof this.game.forfeitBattle === 'function') {
            this.game.forfeitBattle();
        } else {
            this.showBattleModeScreen(false);
            if (this.game && typeof this.game.resetToMainMenu === 'function') this.game.resetToMainMenu();
        }
    } else {
        if (typeof this.game.cancelBattleMatch === 'function') {
            this.game.cancelBattleMatch();
        } else {
            this.showBattleModeScreen(false);
             if (this.game && typeof this.game.resetToMainMenu === 'function') this.game.resetToMainMenu();
        }
    }
  }
  resetBattleModeUIElements() {
    if (this.battleModeActionButton) {
        this.battleModeActionButton.textContent = "Cancel Match";
        this.battleModeActionButton.disabled = true; 
    }
    this.clearPlayerOneMixedColorDisplay();
    this.clearPlayerTwoMixedColorDisplay();
    this.updatePlayerOneBattleScoreDisplay(Infinity);
    this.updatePlayerTwoBattleScoreDisplay(Infinity);
    if(this.battleModeTimerDisplay) this.battleModeTimerDisplay.textContent = "00:00";
  
    if (this.playerOneReadyButton) {
        this.playerOneReadyButton.textContent = 'Ready?';
        this.playerOneReadyButton.disabled = true;
        this.playerOneReadyButton.style.display = 'none';
    }
    if (this.playerTwoReadyButton) {
        this.playerTwoReadyButton.textContent = 'Opponent Not Ready';
        this.playerTwoReadyButton.disabled = true;
        this.playerTwoReadyButton.style.display = 'none'; // Hide
    }
    if (this.playerOneReadyStatus) this.playerOneReadyStatus.style.display = 'none';
    if (this.playerTwoReadyStatus) this.playerTwoReadyStatus.style.display = 'none';

    if (this.mixButton) {
        this.mixButton.disabled = true;
    }
    if (this.gameSelectedColors) {
        this.gameSelectedColors.innerHTML = '';
    }
    }
  setupAudioEventListeners() {
    if (this.muteButton) {
        this.muteButton.addEventListener('click', () => {
            audioManager.toggleMute();
            this._updateAudioUI();
        });
    }
    if (this.masterVolumeSlider) {
        this.masterVolumeSlider.addEventListener('input', () => {
            const volume = parseFloat(this.masterVolumeSlider.value);
            audioManager.setMasterVolume(volume);
            this._updateAudioUI();
        });
    }
    if (this.sfxVolumeSlider) {
        this.sfxVolumeSlider.addEventListener('input', () => {
            const volume = parseFloat(this.sfxVolumeSlider.value);
            audioManager.setSfxVolume(volume);
            this._updateAudioUI();
        });
    }
    if (this.musicVolumeSlider) {
        this.musicVolumeSlider.addEventListener('input', () => {
            const volume = parseFloat(this.musicVolumeSlider.value);
            audioManager.setMusicVolume(volume);
            this._updateAudioUI();
        });
    }
    if (this.musicTrackSelector) {
        this.musicTrackSelector.addEventListener('change', () => {
            const newTrack = this.musicTrackSelector.value;
            audioManager.playBackgroundMusic(newTrack);
            this._updateAudioUI();
        });
    }
    if (this.muteAchievementsButton) {
      this.muteAchievementsButton.addEventListener('click', () => {
        audioManager.toggleAchievementMute();
        this._updateAudioUI();
      });
    }
    if (this.achievementVolumeSlider) {
        this.achievementVolumeSlider.addEventListener('input', () => {
            const volume = parseFloat(this.achievementVolumeSlider.value);
            audioManager.setAchievementVolume(volume);
            this._updateAudioUI();
        });
    }

    this._updateAudioUI();
  }
  _updateAudioUI() {
    if (!this.muteButton || !this.masterVolumeSlider || !this.masterVolumeValue || !this.sfxVolumeSlider || !this.sfxVolumeValue || !this.musicVolumeSlider || !this.musicVolumeValue || !this.musicTrackSelector || !this.achievementVolumeSlider || !this.achievementVolumeValue) return;
    const isMuted = audioManager.isMuted;
    const masterVolume = audioManager.getMasterVolume();
    const sfxVolume = audioManager.getSfxVolume();
    const musicVolume = audioManager.getMusicVolume();
    const achievementVolume = audioManager.getAchievementVolume();
    const currentTrack = audioManager.getCurrentTrack();
    const areAchievementSoundsMuted = audioManager.areAchievementSoundsMuted();
    this.muteButton.textContent = isMuted ? '🔇' : '🔊';
    this.muteButton.title = isMuted ? 'Unmute' : 'Mute';
    this.masterVolumeSlider.value = isMuted ? 0 : masterVolume;
    this.masterVolumeValue.textContent = isMuted ? 'Muted' : `${Math.round(masterVolume * 100)}%`;
    this.sfxVolumeSlider.value = isMuted ? 0 : sfxVolume;
    this.sfxVolumeValue.textContent = isMuted ? 'Muted' : `${Math.round(sfxVolume * 100)}%`;
    this.musicVolumeSlider.value = isMuted ? 0 : musicVolume;
    this.musicVolumeValue.textContent = isMuted ? 'Muted' : `${Math.round(musicVolume * 100)}%`;
    this.musicVolumeValue.textContent = isMuted ? 'Muted' : `${Math.round(musicVolume * 100)}%`;
    this.achievementVolumeSlider.value = isMuted || areAchievementSoundsMuted ? 0 : achievementVolume;
    this.achievementVolumeValue.textContent = isMuted || areAchievementSoundsMuted ? 'Muted' : `${Math.round(achievementVolume * 100)}%`;
    if (this.muteAchievementsButton) {
      this.muteAchievementsButton.textContent = areAchievementSoundsMuted ? 'Unmute Achievements' : 'Mute Achievements';
      this.muteAchievementsButton.classList.toggle('toggled-on', areAchievementSoundsMuted);
    }
    const musicTracks = ['Mixin_Melody', 'Chromatic_Cascade'];

    if (this.musicTrackSelector.options.length !== musicTracks.length) {
        this.musicTrackSelector.innerHTML = '';
        musicTracks.forEach(trackName => {
            const option = document.createElement('option');
            option.value = trackName;
            option.textContent = trackName.replace(/_/g, ' ');
            this.musicTrackSelector.appendChild(option);
        });
    }
    if (currentTrack) {
        this.musicTrackSelector.value = currentTrack;
    } else {

        if (this.musicTrackSelector.options.length > 0) {
             this.musicTrackSelector.selectedIndex = 0;
        }
    }
  }
  showCheckingForUpdates() {
    this.showUpdateMessage("Checking for updates...");
  }
  showUpdateAvailable(version) {
    this.showUpdateMessage(`Update to v${version} available. Downloading...`);
  }
  updateDownloadProgress(progress) {
    if (this.updateContainer && this.updateMessage) {
      this.updateContainer.style.display = 'block';
      const percent = progress.percent || 0;
      const bytesPerSecond = progress.bytesPerSecond || 0;
      const transferredBytes = progress.transferred || 0;
      const totalBytes = progress.total || 0;
      const megabytesPerSecond = (bytesPerSecond / 1024 / 1024).toFixed(2);
      const transferredMB = (transferredBytes / 1024 / 1024).toFixed(2);
      const totalMB = (totalBytes / 1024 / 1024).toFixed(2);
      this.updateMessage.textContent = `Downloading: ${percent.toFixed(1)}% (${transferredMB} / ${totalMB} MB) at ${megabytesPerSecond} MB/s`;
    }
  }
  showUpdateMessage(message) {
    if (this.updateContainer) this.updateContainer.style.display = 'block';
    if (this.updateMessage) this.updateMessage.textContent = message;
    if (this.restartButton) this.restartButton.style.display = 'none';
    this.hideTitleScreen();
  }
  showUpdateDownloaded(message) {
    this.showUpdateMessage(message); // Use the centralized method
    if (this.restartButton) {
        this.restartButton.style.display = 'block';
        if (!this.restartButton.dataset.listenerAttached) {
            this.restartButton.addEventListener('click', () => {
                window.electron.send('user-triggered-restart-for-update');
            });
            this.restartButton.dataset.listenerAttached = 'true';
        }
    }
  }
  hideUpdateMessage() {
    if (this.updateContainer) this.updateContainer.style.display = 'none';
  }
  hideUpdater() {
    this.hideUpdateMessage();
  }
}