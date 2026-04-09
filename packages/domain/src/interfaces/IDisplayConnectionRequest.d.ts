import { ConnectionRequestStatus } from "../enums";
/**
 * Display connection request interface
 * Represents a pending approval request for a new display device
 */
export interface IDisplayConnectionRequest {
    id: string;
    requestId: string;
    displayId: string;
    displayName: string;
    displayLocation: string;
    firmwareVersion: string;
    status: ConnectionRequestStatus;
    requestedAt: Date;
    respondedAt?: Date | undefined;
    respondedById?: string | undefined;
    rejectionReason?: string | undefined;
    notes?: string | undefined;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=IDisplayConnectionRequest.d.ts.map