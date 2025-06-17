// updateManager.js

/**
 * Manages application updates by listening to events from the Electron main process
 * and delegating UI changes to the UIManager.
 */
class UpdateManager {
    constructor(uiManager) {
        if (!uiManager) {
            throw new Error("UpdateManager requires a UIManager instance.");
        }
        this.uiManager = uiManager;
        this.init();
    }
    init() {
        this._setupEventListeners();
        this._notifyRendererReady();
    }
    _setupEventListeners() {
        if (window.electronAPI && typeof window.electronAPI.onUpdateStatus === 'function') {
            window.electronAPI.onUpdateStatus((status, data) => {
                console.log(`[UpdateManager] Received status: ${status}`, data);
                this.handleUpdateStatus(status, data);
            });
            console.log('[UpdateManager] Event listener for "update-status" is set up.');
        } else {
            console.warn('[UpdateManager] Electron API (onUpdateStatus) not found. Update functionality will be disabled.');
        }
    }
    handleUpdateStatus(status, data) {
        switch (status) {
            case 'checking-for-update':
                this.uiManager.showUpdateMessage('Checking for updates...');
                break;
            case 'update-not-available':
                // We can briefly show a message and then hide it, or just hide it immediately.
                this.uiManager.showUpdateMessage('You are on the latest version.');
                setTimeout(() => this.uiManager.hideUpdateMessage(), 3000); // Hide after 3s
                break;
            case 'update-available':
                this.uiManager.showUpdateMessage('Update available. Downloading...');
                break;
            case 'download-progress':
                const percent = data && data.percent ? Math.round(data.percent) : 0;
                this.uiManager.showUpdateMessage(`Downloading update: ${percent}%`);
                break;
            case 'update-downloaded':
                this.uiManager.showUpdateDownloaded('Update downloaded. Restart to install.');
                break;
            case 'error':
                const errorMessage = data && data.message ? data.message : 'An unknown error occurred.';
                this.uiManager.showUpdateMessage(`Update error: ${errorMessage}`);
                // Optionally hide after a delay
                setTimeout(() => this.uiManager.hideUpdateMessage(), 5000);
                break;
            default:
                console.warn(`[UpdateManager] Received unknown status: ${status}`);
        }
    }
    _notifyRendererReady() {
        if (window.electronAPI && typeof window.electronAPI.send === 'function') {
            window.electronAPI.send('renderer-ready-for-updates');
            console.log('[UpdateManager] "renderer-ready-for-updates" signal sent.');
        } else {
            console.warn('[UpdateManager] Electron API not found. Cannot signal that renderer is ready.');
        }
    }
}
export { UpdateManager };