import { IDisplayConnectionRequest } from "../interfaces";
import { ConnectionRequestStatus } from "../enums";
/**
 * Display connection request entity class
 * Encapsulates display approval workflow business logic
 */
export declare class DisplayConnectionRequest implements IDisplayConnectionRequest {
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
    constructor(data: IDisplayConnectionRequest);
    /**
     * Check if request is pending approval
     */
    isPending(): boolean;
    /**
     * Check if request has been approved
     */
    isApproved(): boolean;
    /**
     * Check if request has been rejected
     */
    isRejected(): boolean;
    /**
     * Check if request has been responded to
     */
    isResponded(): boolean;
    /**
     * Approve connection request
     */
    approve(adminId: string): void;
    /**
     * Reject connection request
     */
    reject(adminId: string, reason?: string): void;
    /**
     * Add notes to request
     */
    addNotes(notes: string): void;
    /**
     * Get time since request was created
     * Returns duration in milliseconds
     */
    getAgeInMilliseconds(): number;
    /**
     * Get time since request was created in hours
     */
    getAgeInHours(): number;
    /**
     * Get time since request was created in days
     */
    getAgeInDays(): number;
    /**
     * Get response time (time between request and response)
     * Returns null if not yet responded
     */
    getResponseTimeInMilliseconds(): number | null;
    /**
     * Create a new connection request
     * Factory method for creating pending requests
     */
    static create(params: {
        displayId: string;
        displayName: string;
        displayLocation: string;
        firmwareVersion: string;
        notes?: string;
    }): DisplayConnectionRequest;
}
//# sourceMappingURL=DisplayConnectionRequest.d.ts.map