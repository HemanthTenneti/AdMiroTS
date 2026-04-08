import { DisplayStatus } from "../enums";
/**
 * Display entity class
 * Encapsulates display device business logic and connection management
 */
export class Display {
    id;
    displayId;
    displayName;
    location;
    status;
    assignedAdminId;
    resolution;
    lastSeen;
    firmwareVersion;
    configuration;
    connectionToken;
    password;
    isConnected;
    currentLoopId;
    needsRefresh;
    lastRefreshCheck;
    createdAt;
    updatedAt;
    constructor(data) {
        this.id = data.id;
        this.displayId = data.displayId;
        this.displayName = data.displayName;
        this.location = data.location;
        this.status = data.status;
        this.assignedAdminId = data.assignedAdminId ?? undefined;
        this.resolution = data.resolution;
        this.lastSeen = data.lastSeen ?? undefined;
        this.firmwareVersion = data.firmwareVersion;
        this.configuration = data.configuration;
        this.connectionToken = data.connectionToken;
        this.password = data.password ?? undefined;
        this.isConnected = data.isConnected;
        this.currentLoopId = data.currentLoopId ?? undefined;
        this.needsRefresh = data.needsRefresh;
        this.lastRefreshCheck = data.lastRefreshCheck ?? undefined;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
    /**
     * Check if display is currently online
     */
    isOnline() {
        return this.status === DisplayStatus.ONLINE;
    }
    /**
     * Check if display is offline
     */
    isOffline() {
        return this.status === DisplayStatus.OFFLINE;
    }
    /**
     * Check if display is inactive (not yet activated)
     */
    isInactive() {
        return this.status === DisplayStatus.INACTIVE;
    }
    /**
     * Check if display has an assigned loop
     */
    hasAssignedLoop() {
        return !!this.currentLoopId;
    }
    /**
     * Update connection status and last seen timestamp
     * Called when display sends heartbeat
     */
    updateHeartbeat() {
        this.lastSeen = new Date();
        this.isConnected = true;
        if (this.status === DisplayStatus.OFFLINE) {
            this.status = DisplayStatus.ONLINE;
        }
        this.updatedAt = new Date();
    }
    /**
     * Mark display as offline
     * Called when heartbeat timeout is reached
     */
    markOffline() {
        this.status = DisplayStatus.OFFLINE;
        this.isConnected = false;
        this.updatedAt = new Date();
    }
    /**
     * Mark display as online
     */
    markOnline() {
        this.status = DisplayStatus.ONLINE;
        this.isConnected = true;
        this.lastSeen = new Date();
        this.updatedAt = new Date();
    }
    /**
     * Assign a loop to this display
     */
    assignLoop(loopId) {
        this.currentLoopId = loopId;
        this.needsRefresh = true;
        this.updatedAt = new Date();
    }
    /**
     * Remove loop assignment from this display
     */
    unassignLoop() {
        this.currentLoopId = undefined;
        this.needsRefresh = true;
        this.updatedAt = new Date();
    }
    /**
     * Trigger content refresh
     * Signals display to reload its current loop
     */
    triggerRefresh() {
        this.needsRefresh = true;
        this.lastRefreshCheck = new Date();
        this.updatedAt = new Date();
    }
    /**
     * Acknowledge refresh completion
     * Called when display confirms it has reloaded content
     */
    acknowledgeRefresh() {
        this.needsRefresh = false;
        this.lastRefreshCheck = new Date();
        this.updatedAt = new Date();
    }
    /**
     * Update display configuration
     */
    updateConfiguration(config) {
        this.configuration = this.configuration.update(config);
        this.updatedAt = new Date();
    }
    /**
     * Check if display has been seen recently
     * Considers display stale if not seen in the last 5 minutes
     */
    isStale(thresholdMinutes = 5) {
        if (!this.lastSeen) {
            return true;
        }
        const now = new Date();
        const diffMs = now.getTime() - this.lastSeen.getTime();
        const diffMinutes = diffMs / (1000 * 60);
        return diffMinutes > thresholdMinutes;
    }
    /**
     * Validate display ID format
     * Must be at least 3 characters
     */
    static isValidDisplayId(displayId) {
        return displayId.length >= 3;
    }
    /**
     * Generate a unique connection token
     * 36-character UUID for secure communication
     */
    static generateConnectionToken() {
        return crypto.randomUUID();
    }
}
