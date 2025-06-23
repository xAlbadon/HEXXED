import { UIManager } from './uiManager.js';

class UpdateManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.updateStateKnown = false;
        this.updateInProgress = false;
        console.log('[UpdateManager] Initializing...');

        if (window.electronAPI) {
            console.log('[UpdateManager] Electron environment detected. Setting up for update checks.');
            this.setupElectronListeners();
            // Signal to the main process that the renderer is ready for update info
            console.log("[UpdateManager] Sending 'renderer-ready-for-updates' to main process.");
            window.electronAPI.send('renderer-ready-for-updates');
            console.log('[UpdateManager] Calling uiManager.showCheckingForUpdate().');
            this.uiManager.showCheckingForUpdate();
        } else {
            console.log('[UpdateManager] Not in Electron environment. Skipping update checks.');
            this.updateStateKnown = true; // No updates to check, so state is "known"
        }
    }

    setupElectronListeners() {
        console.log('[UpdateManager] Setting up event listeners and 10s timeout.');
        
        // Define handlers with 'this' bound correctly
        this.handleUpdateAvailable = this.onUpdateAvailable.bind(this);
        this.handleUpdateNotAvailable = this.onUpdateNotAvailable.bind(this);
        this.handleUpdateDownloaded = this.onUpdateDownloaded.bind(this);
        this.handleUpdateError = this.onUpdateError.bind(this);
        this.handleUpdateProgress = this.onUpdateProgress.bind(this);

        window.electronAPI.on('update-available', this.handleUpdateAvailable);
        window.electronAPI.on('update-not-available', this.handleUpdateNotAvailable);
        window.electronAPI.on('update-downloaded', this.handleUpdateDownloaded);
        window.electronAPI.on('update-error', this.handleUpdateError);
        window.electronAPI.on('download-progress', this.handleUpdateProgress);
        
        document.getElementById('restartButton').addEventListener('click', () => {
            console.log('[UpdateManager] Restart button clicked. Sending quit-and-install.');
            window.electronAPI.send('quit-and-install');
        });

        // Set a timeout to hide the update screen if no response is received
        this.updateCheckTimeout = setTimeout(() => {
            if (!this.updateStateKnown) {
                console.warn('[UpdateManager] Timeout: No update status received from main process within 10s. Hiding check screen.');
                this.updateStateKnown = true;
                this.uiManager.finishUpdateCheck();
            }
        }, 10000);
    }

    onUpdateAvailable(info) {
        console.log('[UpdateManager] Received onUpdateAvailable event:', info);
        this.updateStateKnown = true;
        this.updateInProgress = true;
        this.uiManager.showUpdateAvailable(info.version);
        clearTimeout(this.updateCheckTimeout);
    }

    onUpdateNotAvailable() {
        console.log('[UpdateManager] Received onUpdateNotAvailable event.');
        this.updateStateKnown = true;
        this.updateInProgress = false;
        this.uiManager.finishUpdateCheck();
        clearTimeout(this.updateCheckTimeout);
    }

    onUpdateDownloaded(info) {
        console.log('[UpdateManager] Received onUpdateDownloaded event:', info);
        this.updateStateKnown = true;
        this.updateInProgress = false; // Download is finished
        this.uiManager.showUpdateReady(info.version);
        clearTimeout(this.updateCheckTimeout);
    }

    onUpdateError(err) {
        console.error('[UpdateManager] Received onUpdateError event:', err);
        this.updateStateKnown = true;
        this.updateInProgress = false;
        this.uiManager.showUpdateError(err.message);
        clearTimeout(this.updateCheckTimeout);
    }

    onUpdateProgress(progressObj) {
        // This can be spammy, so only log if needed for debugging.
        // console.log('[UpdateManager] Received onUpdateProgress event:', progressObj);
        this.uiManager.updateDownloadProgress(progressObj.percent);
    }
    
    isBlockingUI() {
        // The UI should be blocked if we are actively checking for an update and haven't heard back,
        // or if an update download/install process is explicitly happening.
        const isBlocking = !this.updateStateKnown || this.updateInProgress;
        console.log(`[UpdateManager] isBlockingUI check. Is blocking: ${isBlocking} (updateStateKnown: ${this.updateStateKnown}, updateInProgress: ${this.updateInProgress})`);
        return isBlocking;
    }

    cleanup() {
        if (window.electronAPI) {
            console.log('[UpdateManager] Cleaning up event listeners.');
            window.electronAPI.removeListener('update-available', this.handleUpdateAvailable);
            window.electronAPI.removeListener('update-not-available', this.handleUpdateNotAvailable);
            window.electronAPI.removeListener('update-downloaded', this.handleUpdateDownloaded);
            window.electronAPI.removeListener('update-error', this.handleUpdateError);
            window.electronAPI.removeListener('download-progress', this.handleUpdateProgress);
            clearTimeout(this.updateCheckTimeout);
        }
    }
}

export { UpdateManager };