// This class handles checking for and managing application updates in an Electron environment.
// It communicates with the main process and updates the UI accordingly.
export class UpdateManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.updateInProgress = false; // Flag to track if an update is actively being handled
        this.updateStateKnown = false; // Flag to ensure we have a response from the main process
        this.updateCheckTimeout = null; // Timeout for the update check
        // This check ensures these listeners are only set up in an Electron environment
        if (window.electron) {
            this.isChecking = true; // Start by assuming we are checking
            this.setupEventListeners();
            // Signal the main process that the renderer is ready to handle update events.
            window.electron.send('renderer-ready-for-updates');
        } else {
            console.log("[UpdateManager] Not in Electron environment. Simulating 'no update available'.");
            // If not in Electron, we are not checking and there's no update in progress.
            this.isChecking = false;
            this.updateInProgress = false;
            this.updateStateKnown = true; // In web, the state is known immediately.
        }
    }
    setupEventListeners() {
        // --- Event Listeners for Electron Main Process Communication ---
        // Fired when an update is available.
        window.electron.onUpdateAvailable((info) => {
            console.log('[UpdateManager] Update available:', info);
            this.clearUpdateCheckTimeout();
            this.updateInProgress = true;
            this.isChecking = false; // Finished checking
            this.updateStateKnown = true; // We have a definitive state
            this.uiManager.showUpdateAvailable(info.version);
        });
        // Fired when no update is available.
        window.electron.onUpdateNotAvailable(() => {
            console.log('[UpdateManager] No update available.');
            this.clearUpdateCheckTimeout();
            this.updateInProgress = false;
            this.isChecking = false; // Finished checking
            this.updateStateKnown = true; // We have a definitive state
            // Explicitly hide the UI when no update is found.
            this.uiManager.hideUpdater();
        });
        // Fired periodically with download progress.
        window.electron.onUpdateDownloadProgress((progressInfo) => {
            console.log('[UpdateManager] Update download progress:', progressInfo);
            this.updateInProgress = true;
            this.uiManager.updateDownloadProgress(progressInfo);
        });
        // Fired when an update has been downloaded and is ready to be installed.
        window.electron.onUpdateDownloaded((info) => {
            console.log('[UpdateManager] Update downloaded and ready:', info);
            this.updateInProgress = true;
            this.uiManager.showUpdateDownloaded(`Update v${info.version} downloaded. Restart to install.`);
        });
        // Fired when an error occurs during the update process.
        window.electron.onUpdateError((error) => {
            console.error('[UpdateManager] Update error:', error);
            this.clearUpdateCheckTimeout();
            this.updateInProgress = false;
            this.isChecking = false; // Finished checking (with error)
            this.updateStateKnown = true; // We have a definitive state
            this.uiManager.showUpdateMessage(`Error: ${error.message}`);
            // Optionally, hide the updater after a delay on error
            setTimeout(() => this.uiManager.hideUpdater(), 5000);
        });
    }
    /**
     * Clears the update check timeout if it's currently set.
     */
    clearUpdateCheckTimeout() {
        if (this.updateCheckTimeout) {
            clearTimeout(this.updateCheckTimeout);
            this.updateCheckTimeout = null;
        }
    }
    /**
     * A flag to indicate if the UI should be blocked by the update process.
     * This is true if we are checking for, downloading, or have an update ready to install.
     * @returns {boolean}
     */
    isBlockingUI() {
        // If the update state isn't known yet, or an update is in progress, we are "blocking".
        if (!this.updateStateKnown) {
            return true;
        }
        return this.updateInProgress;
    }
}