import { IDisplay } from "../interfaces";
import { DisplayStatus } from "../enums";
import { Resolution } from "../value-objects/Resolution";
import { DisplayConfiguration } from "../value-objects/DisplayConfiguration";
/**
 * Display entity class
 * Encapsulates display device business logic and connection management
 */
export declare class Display implements IDisplay {
    id: string;
    displayId: string;
    displayName: string;
    location: string;
    status: DisplayStatus;
    assignedAdminId?: string | undefined;
    resolution: Resolution;
    lastSeen?: Date | undefined;
    firmwareVersion: string;
    configuration: DisplayConfiguration;
    connectionToken: string;
    password?: string | undefined;
    isConnected: boolean;
    currentLoopId?: string | undefined;
    needsRefresh: boolean;
    lastRefreshCheck?: Date | undefined;
    createdAt: Date;
    updatedAt: Date;
    constructor(data: IDisplay);
    /**
     * Check if display is currently online
     */
    isOnline(): boolean;
    /**
     * Check if display is offline
     */
    isOffline(): boolean;
    /**
     * Check if display is inactive (not yet activated)
     */
    isInactive(): boolean;
    /**
     * Check if display has an assigned loop
     */
    hasAssignedLoop(): boolean;
    /**
     * Update connection status and last seen timestamp
     * Called when display sends heartbeat
     */
    updateHeartbeat(): void;
    /**
     * Mark display as offline
     * Called when heartbeat timeout is reached
     */
    markOffline(): void;
    /**
     * Mark display as online
     */
    markOnline(): void;
    /**
     * Assign a loop to this display
     */
    assignLoop(loopId: string): void;
    /**
     * Remove loop assignment from this display
     */
    unassignLoop(): void;
    /**
     * Trigger content refresh
     * Signals display to reload its current loop
     */
    triggerRefresh(): void;
    /**
     * Acknowledge refresh completion
     * Called when display confirms it has reloaded content
     */
    acknowledgeRefresh(): void;
    /**
     * Update display configuration
     */
    updateConfiguration(config: {
        brightness?: number;
        volume?: number;
        refreshRate?: number;
        orientation?: import("../enums").Orientation;
    }): void;
    /**
     * Check if display has been seen recently
     * Considers display stale if not seen in the last 5 minutes
     */
    isStale(thresholdMinutes?: number): boolean;
    /**
     * Validate display ID format
     * Must be at least 3 characters
     */
    static isValidDisplayId(displayId: string): boolean;
    /**
     * Generate a unique connection token
     * 36-character UUID for secure communication
     */
    static generateConnectionToken(): string;
}
//# sourceMappingURL=Display.d.ts.map