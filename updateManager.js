// This class handles checking for and managing application updates in an Electron environment.
// It communicates with the main process and updates the UI accordingly.
export class UpdateManager {
    constructor(uiManager) {
        console.log('[UpdateManager] Initializing...');
        this.uiManager = uiManager;
        this.updateInProgress = false; // Flag to track if an update is actively being handled
        this.updateStateKnown = false; // Flag to ensure we have a response from the main process
        this.updateCheckTimeout = null; // Timeout for the update check
        // This check ensures these listeners are only set up in an Electron environment
        if (window.electron) {
            console.log('[UpdateManager] Electron environment detected. Setting up for update checks.');
            this.isChecking = true; // Start by assuming we are checking
            this.setupEventListeners();
            // Signal the main process that the renderer is ready to handle update events.
            console.log("[UpdateManager] Sending 'renderer-ready-for-updates' to main process.");
            window.electron.send('renderer-ready-for-updates');
            console.log("[UpdateManager] Calling uiManager.showCheckingForUpdate().");
            this.uiManager.showCheckingForUpdate();
        } else {
            console.log("[UpdateManager] Not in Electron environment. Simulating 'no update available'.");
            // If not in Electron, we are not checking and there's no update in progress.
            this.isChecking = false;
            this.updateInProgress = false;
            this.updateStateKnown = true; // In web, the state is known immediately.
        }
    }
    setupEventListeners() {
        console.log('[UpdateManager] Setting up event listeners and 10s timeout.');
        // Set a timeout for the update check. If no response is received, hide the updater.
        this.updateCheckTimeout = setTimeout(() => {
            if (!this.updateStateKnown) { // Check if we are still waiting for a response
                console.warn('[UpdateManager] Update check timed out. Proceeding without update info.');
                this.isChecking = false;
                this.updateInProgress = false;
                this.updateStateKnown = true;
                console.log('[UpdateManager] Timeout: Calling uiManager.finishUpdateCheck().');
                this.uiManager.finishUpdateCheck();
            }
        }, 10000); // 10-second timeout
        // --- Event Listeners for Electron Main Process Communication ---
        // Fired when an update is available.
        window.electron.onUpdateAvailable((info) => {
            console.log('[UpdateManager] Received onUpdateAvailable event:', info);
            this.clearUpdateCheckTimeout();
            this.updateInProgress = true;
            this.isChecking = false; // Finished checking
            this.updateStateKnown = true; // We have a definitive state
            console.log('[UpdateManager] Calling uiManager.showUpdateAvailable().');
            this.uiManager.showUpdateAvailable(info.version);
        });
        // Fired when no update is available.
        window.electron.onUpdateNotAvailable(() => {
            console.log('[UpdateManager] Received onUpdateNotAvailable event.');
            this.clearUpdateCheckTimeout();
            this.updateInProgress = false;
            this.isChecking = false; // Finished checking
            this.updateStateKnown = true; // We have a definitive state
            // Explicitly hide the UI when no update is found.
            console.log('[UpdateManager] Calling uiManager.finishUpdateCheck().');
            this.uiManager.finishUpdateCheck();
        });
        // Fired periodically with download progress.
        window.electron.onUpdateDownloadProgress((progressInfo) => {
            console.log('[UpdateManager] Received onUpdateDownloadProgress event:', progressInfo);
            this.updateInProgress = true;
            console.log('[UpdateManager] Calling uiManager.updateDownloadProgress().');
            this.uiManager.updateDownloadProgress(progressInfo);
        });
        // Fired when an update has been downloaded and is ready to be installed.
        window.electron.onUpdateDownloaded((info) => {
            console.log('[UpdateManager] Received onUpdateDownloaded event:', info);
            this.updateInProgress = true;
            // The 'info' object contains details about the update. We'll format a user-friendly message.
            const message = `Update v${info.version} downloaded. Restart to install.`;
            console.log('[UpdateManager] Calling uiManager.showUpdateDownloaded().');
            this.uiManager.showUpdateDownloaded(message);
        });
        // Fired when an error occurs during the update process.
        window.electron.onUpdateError((error) => {
            console.error('[UpdateManager] Received onUpdateError event:', error);
            this.clearUpdateCheckTimeout();
            this.updateInProgress = false;
            this.isChecking = false; // Finished checking (with error)
            this.updateStateKnown = true; // We have a definitive state
            console.log('[UpdateManager] Calling uiManager.showUpdateMessage() with error.');
            this.uiManager.showUpdateMessage(`Error: ${error.message}`);
            // Optionally, hide the updater after a delay on error
            setTimeout(() => {
                console.log('[UpdateManager] Hiding error message after 5s.');
                this.uiManager.finishUpdateCheck();
            }, 5000);
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
        const isBlocking = !this.updateStateKnown || this.updateInProgress;
        console.log(`[UpdateManager] isBlockingUI check. Is blocking: ${isBlocking} (updateStateKnown: ${this.updateStateKnown}, updateInProgress: ${this.updateInProgress})`);
        return isBlocking;
    }
}