import { UIManager } from './uiManager.js';

class UpdateManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.updateStateKnown = false;
        this.updateInProgress = false;
        this.listenerCleanupFns = [];
        this.showingUpdateUI = false; // Track if we're showing update UI
        console.log('[UpdateManager] Initializing...');

        if (window.electron) {
            console.log('[UpdateManager] Electron environment detected. Setting up for update checks.');
            this.setupElectronListeners();
            // Signal to the main process that the renderer is ready for update info
            console.log("[UpdateManager] Sending 'renderer-ready-for-updates' to main process.");
            window.electron.send('renderer-ready-for-updates');
            // Don't show update screen immediately - wait to see if we actually need it
        } else {
            console.log('[UpdateManager] Not in Electron environment or preload script failed. Skipping update checks.');
            this.updateStateKnown = true; // No updates to check, so state is "known"
        }
    }

    setupElectronListeners() {
        console.log('[UpdateManager] Setting up event listeners and fast timeout.');
        
        // Define handlers with 'this' bound correctly
        this.handleUpdateAvailable = this.onUpdateAvailable.bind(this);
        this.handleUpdateNotAvailable = this.onUpdateNotAvailable.bind(this);
        this.handleUpdateDownloaded = this.onUpdateDownloaded.bind(this);
        this.handleUpdateError = this.onUpdateError.bind(this);
        this.handleUpdateProgress = this.onUpdateProgress.bind(this);
        this.listenerCleanupFns.push(window.electron.onUpdateAvailable(this.handleUpdateAvailable));
        this.listenerCleanupFns.push(window.electron.onUpdateNotAvailable(this.handleUpdateNotAvailable));
        this.listenerCleanupFns.push(window.electron.onUpdateDownloaded(this.handleUpdateDownloaded));
        this.listenerCleanupFns.push(window.electron.onUpdateError(this.handleUpdateError));
        this.listenerCleanupFns.push(window.electron.onUpdateDownloadProgress(this.handleUpdateProgress));
        
        document.getElementById('restartButton').addEventListener('click', () => {
            if (window.electron && typeof window.electron.send === 'function') {
                console.log('[UpdateManager] Restart button clicked. Sending quit-and-install.');
                window.electron.send('quit-and-install');
            } else {
                console.error('[UpdateManager] window.electron.send is not available to quit and install.');
            }
        });

        // Delay showing the update UI briefly - if we get a response quickly, great!
        // This prevents flickering the "checking" screen when there's no update
        this.initialDelayTimeout = setTimeout(() => {
            if (!this.updateStateKnown) {
                console.log('[UpdateManager] 500ms passed, still checking. Showing update UI.');
                this.showingUpdateUI = true;
                this.uiManager.showCheckingForUpdate();
            }
        }, 500);

        // Set a timeout to hide the update screen if no response is received
        this.updateCheckTimeout = setTimeout(() => {
            if (!this.updateStateKnown) {
                console.warn('[UpdateManager] Timeout: No update status received from main process within 5s. Assuming no update.');
                this.updateStateKnown = true;
                if (this.showingUpdateUI) {
                    this.uiManager.finishUpdateCheck();
                }
            }
        }, 5000); // Reduced from 10s to 5s
    }
    showUpdateScreen() {
        if (!this.showingUpdateUI) {
            console.log('[UpdateManager] Showing update screen.');
            this.showingUpdateUI = true;
            this.uiManager.showCheckingForUpdate();
        }
    }
    onUpdateAvailable(info) {
        console.log('[UpdateManager] Received onUpdateAvailable event:', info);
        this.updateStateKnown = true;
        this.updateInProgress = true;
        clearTimeout(this.initialDelayTimeout);
        clearTimeout(this.updateCheckTimeout);
        // Make sure UI is showing before displaying update info
        if (!this.showingUpdateUI) {
            this.showUpdateScreen();
        }
        this.uiManager.showUpdateAvailable(info.version);
    }

    onUpdateNotAvailable() {
        console.log('[UpdateManager] Received onUpdateNotAvailable event.');
        this.updateStateKnown = true;
        this.updateInProgress = false;
        clearTimeout(this.initialDelayTimeout);
        clearTimeout(this.updateCheckTimeout);
        // Only hide UI if we actually showed it
        if (this.showingUpdateUI) {
            this.uiManager.finishUpdateCheck();
        }
    }

    onUpdateDownloaded(info) {
        console.log('[UpdateManager] Received onUpdateDownloaded event:', info);
        this.updateStateKnown = true;
        this.updateInProgress = false; // Download is finished
        clearTimeout(this.initialDelayTimeout);
        clearTimeout(this.updateCheckTimeout);
        // Make sure UI is showing
        if (!this.showingUpdateUI) {
            this.showUpdateScreen();
        }
        this.uiManager.showUpdateReady(info.version);
    }

    onUpdateError(err) {
        console.error('[UpdateManager] Received onUpdateError event:', err);
        this.updateStateKnown = true;
        this.updateInProgress = false;
        clearTimeout(this.initialDelayTimeout);
        clearTimeout(this.updateCheckTimeout);
        // Only hide UI if we actually showed it
        if (this.showingUpdateUI) {
            this.uiManager.finishUpdateCheck();
        }
    }

    onUpdateProgress(progressObj) {
        // This can be spammy, so only log if needed for debugging.
        // console.log('[UpdateManager] Received onUpdateProgress event:', progressObj);
        this.uiManager.updateDownloadProgress(progressObj.percent);
    }
    
    isBlockingUI() {
        // Only block if we're actually showing update UI or if an update is in progress
        const isBlocking = this.showingUpdateUI && (!this.updateStateKnown || this.updateInProgress);
        console.log(`[UpdateManager] isBlockingUI check. Is blocking: ${isBlocking} (showingUpdateUI: ${this.showingUpdateUI}, updateStateKnown: ${this.updateStateKnown}, updateInProgress: ${this.updateInProgress})`);
        return isBlocking;
    }

    cleanup() {
        if (window.electron) {
            console.log('[UpdateManager] Cleaning up event listeners.');
            // Call all the cleanup functions returned by the listeners
            this.listenerCleanupFns.forEach(cleanup => cleanup());
            this.listenerCleanupFns = []; // Clear the array
            clearTimeout(this.initialDelayTimeout);
            clearTimeout(this.updateCheckTimeout);
        }
    }
}

export { UpdateManager };