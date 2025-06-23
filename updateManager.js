import { UIManager } from './uiManager.js';

class UpdateManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.updateStateKnown = false;
        this.updateInProgress = false;
        this.listenerCleanupFns = [];
        console.log('[UpdateManager] Initializing...');

        if (window.electron) {
            console.log('[UpdateManager] Electron environment detected. Setting up for update checks.');
            this.setupElectronListeners();
            // Signal to the main process that the renderer is ready for update info
            console.log("[UpdateManager] Sending 'renderer-ready-for-updates' to main process.");
            window.electron.send('renderer-ready-for-updates');
            console.log('[UpdateManager] Calling uiManager.showCheckingForUpdate().');
            this.uiManager.showCheckingForUpdate();
        } else {
            console.log('[UpdateManager] Not in Electron environment or preload script failed. Skipping update checks.');
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
        this.uiManager.finishUpdateCheck(); // This should hide the "checking" screen
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
        // Instead of showing a specific error, just hide the update UI as the check is complete.
        this.uiManager.finishUpdateCheck();
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
        if (window.electron) {
            console.log('[UpdateManager] Cleaning up event listeners.');
            // Call all the cleanup functions returned by the listeners
            this.listenerCleanupFns.forEach(cleanup => cleanup());
            this.listenerCleanupFns = []; // Clear the array
            clearTimeout(this.updateCheckTimeout);
        }
    }
}

export { UpdateManager };