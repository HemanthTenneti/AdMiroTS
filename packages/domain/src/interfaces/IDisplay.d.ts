import { DisplayStatus } from "../enums";
import { Resolution } from "../value-objects/Resolution";
import { DisplayConfiguration } from "../value-objects/DisplayConfiguration";
/**
 * Display entity interface
 * Represents a physical or browser-based display device
 */
export interface IDisplay {
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
}
//# sourceMappingURL=IDisplay.d.ts.map