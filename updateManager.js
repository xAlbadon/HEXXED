// updateManager.js

/**
 * Manages the display of application update status and progress.
 * Assumes an Electron environment where IPC messages are sent from the main process
 * and Electron APIs (like ipcRenderer) are exposed via a preload script on `window.electron`.
 * 
 * Expected DOM elements in index.html:
 * - #updateStatusContainer (overall container, initially hidden)
 * - #updateTitle (e.g., "Application Update")
 * - #updateMessage (e.g., "Checking for updates...")
 * - #updateProgressContainer (container for the progress bar, initially hidden)
 * - #updateProgressBar (the progress bar itself)
 * - #restartAndUpdateButton (button to restart, initially hidden)
 */
class UpdateManager {
    constructor(onUpdateCompletedCallback = null) { // Added callback parameter
        this.onUpdateCompletedCallback = onUpdateCompletedCallback; // Store the callback
        this.updateStatusContainer = document.getElementById('updateManagerUI'); // Changed ID to match index.html
        this.updateTitleElement = document.getElementById('updateTitle');
        this.updateMessageElement = document.getElementById('updateMessage');
        this.updateProgressContainer = document.getElementById('updateProgressContainer');
        this.updateProgressBarElement = document.getElementById('updateProgressBar');
        this.restartAndUpdateButton = document.getElementById('restartAndUpdateButton');

        this.isUpdateInProgress = false; // Tracks if an update download is active
        this.isRestartPending = false;   // Tracks if an update is downloaded and waiting for restart
        this.wasBlockingUI = this.isBlockingUI(); // Track previous blocking state
        // Basic check for essential elements
        if (!this.updateStatusContainer || !this.updateMessageElement) {
            console.warn('[UpdateManager] Essential update UI elements (#updateManagerUI, #updateMessage) not found. Update notifications will not be visible.');
            // To prevent errors, create placeholder elements if they are missing,
            // though they won't be visible without proper HTML and CSS.
            this.updateStatusContainer = this.updateStatusContainer || document.createElement('div');
            this.updateStatusContainer.style.display = 'none'; // Ensure it's hidden
            this.updateTitleElement = this.updateTitleElement || document.createElement('h2');
            this.updateMessageElement = this.updateMessageElement || document.createElement('p');
            this.updateProgressContainer = this.updateProgressContainer || document.createElement('div');
            this.updateProgressBarElement = this.updateProgressBarElement || document.createElement('div');
            this.restartAndUpdateButton = this.restartAndUpdateButton || document.createElement('button');
        }
        
        this._setupEventListeners();
    }

    _setupEventListeners() {
        if (this.restartAndUpdateButton) {
            this.restartAndUpdateButton.addEventListener('click', () => {
                if (window.electron && window.electron.ipcRendererSend) {
                    window.electron.ipcRendererSend('restart-app-and-update'); // More specific channel name
                } else {
                    console.warn('[UpdateManager] Electron API for sending IPC messages not found. Cannot trigger restart.');
                    this.displayMessage('Error: Could not trigger restart. Please restart the application manually.');
                }
            });
        }
    }

    initialize() {
        if (window.electron && window.electron.ipcRendererOn) {
            window.electron.ipcRendererOn('checking-for-update', () => {
                this.isUpdateInProgress = true;
                this.isRestartPending = false;
                this.showUpdateStatus(true);
                if (this.updateTitleElement) this.updateTitleElement.textContent = 'Application Update';
                this.displayMessage('Checking for updates...');
                if (this.updateProgressContainer) this.updateProgressContainer.style.display = 'none';
                if (this.restartAndUpdateButton) this.restartAndUpdateButton.style.display = 'none';
            });

            window.electron.ipcRendererOn('update-available', (event, info = {}) => {
                this.isUpdateInProgress = true;
                this.isRestartPending = false;
                this.showUpdateStatus(true);
                if (this.updateTitleElement) this.updateTitleElement.textContent = 'Downloading Update';
                this.displayMessage(`Update available (version ${info.version || 'N/A'}). Downloading...`);
                if (this.updateProgressContainer) this.updateProgressContainer.style.display = 'block';
                this.updateProgress(0); // Reset progress bar
                if (this.restartAndUpdateButton) this.restartAndUpdateButton.style.display = 'none';
            });

            window.electron.ipcRendererOn('update-progress', (event, progressObj = { percent: 0 }) => {
                this.isUpdateInProgress = true; // Still in progress
                this.isRestartPending = false;
                this.showUpdateStatus(true); // Ensure UI is visible
                // Message might be redundant if already "Downloading..."
                // this.displayMessage('Downloading update...'); 
                this.updateProgress(progressObj.percent);
                if (this.updateProgressContainer) this.updateProgressContainer.style.display = 'block';
                if (this.restartAndUpdateButton) this.restartAndUpdateButton.style.display = 'none';
            });

            window.electron.ipcRendererOn('update-downloaded', (event, info = {}) => {
                this.isUpdateInProgress = false;
                this.isRestartPending = true;
                this.showUpdateStatus(true);
                if (this.updateTitleElement) this.updateTitleElement.textContent = 'Update Ready';
                this.displayMessage(`Update (version ${info.version || 'N/A'}) downloaded. Please restart to install.`);
                if (this.updateProgressContainer) this.updateProgressContainer.style.display = 'none';
                this.showRestartButton();
            });

            window.electron.ipcRendererOn('update-error', (event, err = {}) => {
                this.isUpdateInProgress = false;
                // isRestartPending remains as is. If an error occurs after download, restart might still be an option.
                this.showUpdateStatus(true);
                if (this.updateTitleElement) this.updateTitleElement.textContent = 'Update Error';
                this.displayMessage(`Error during update: ${err.message || 'Unknown error'}.`);
                if (this.updateProgressContainer) this.updateProgressContainer.style.display = 'none';
                
                // If not pending restart, hide the restart button. If it was pending, user might still try.
                if (!this.isRestartPending && this.restartAndUpdateButton) {
                    this.restartAndUpdateButton.style.display = 'none';
                }
                // Consider adding a "Close" button or similar for non-blocking errors.
                // Consider adding a "Close" button or similar for non-blocking errors.
                this._checkAndNotifyUIUnlock(); // Check if UI should be unblocked
            });
            window.electron.ipcRendererOn('no-update-available', () => {
                this.isUpdateInProgress = false;
                this.isRestartPending = false;
                this.displayMessage('Application is up to date.');
                // Hide the update UI after a short delay to allow user to read message
                setTimeout(() => {
                    if (!this.isUpdateInProgress && !this.isRestartPending) { // Check again in case another message arrived
                        this.showUpdateStatus(false);
                        this._checkAndNotifyUIUnlock(); // Check if UI should be unblocked
                    }
                }, 2000);
            });
            console.log('[UpdateManager] IPC listeners initialized.');
            // Notify the main process that the renderer is ready for update checks.
            if (window.electron && window.electron.ipcRendererSend) {
                window.electron.ipcRendererSend('renderer-ready-for-updates');
            }

        } else {
            console.warn('[UpdateManager] Electron IPC API not found (window.electron.ipcRendererOn is undefined). Update functionality will be disabled.');
            this.showUpdateStatus(false); // Ensure it's hidden if no IPC
        }
    }

    showUpdateStatus(visible) {
        if (this.updateStatusContainer) {
            this.updateStatusContainer.style.display = visible ? 'flex' : 'none';
        }
    }

    displayMessage(messageText) {
        if (this.updateMessageElement) {
            this.updateMessageElement.textContent = messageText;
        }
    }

    updateProgress(percent) {
        if (this.updateProgressBarElement && this.updateProgressContainer) {
            const p = Math.max(0, Math.min(100, parseFloat(percent) || 0));
            this.updateProgressBarElement.style.width = `${p}%`;
            this.updateProgressBarElement.textContent = `${Math.round(p)}%`;
            this.updateProgressContainer.style.display = 'block';
        }
    }

    showRestartButton() {
        if (this.restartAndUpdateButton) {
            this.restartAndUpdateButton.style.display = 'block';
        }
    }

    /**
     * Checks if the update process is active or a restart is pending.
     * This can be used by UIManager to block access to other UI elements like login.
     * @returns {boolean} True if UI should be blocked, false otherwise.
     */
    isBlockingUI() {
        return this.isUpdateInProgress || this.isRestartPending;
    }
    _checkAndNotifyUIUnlock() {
        const currentlyBlocking = this.isBlockingUI();
        if (this.wasBlockingUI && !currentlyBlocking) {
            if (typeof this.onUpdateCompletedCallback === 'function') {
                console.log('[UpdateManager] Update process complete, UI no longer blocked. Notifying UIManager.');
                this.onUpdateCompletedCallback();
            }
        }
        this.wasBlockingUI = currentlyBlocking;
    }
}
export { UpdateManager };