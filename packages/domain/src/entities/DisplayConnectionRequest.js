import { ConnectionRequestStatus } from "../enums";
/**
 * Display connection request entity class
 * Encapsulates display approval workflow business logic
 */
export class DisplayConnectionRequest {
    id;
    requestId;
    displayId;
    displayName;
    displayLocation;
    firmwareVersion;
    status;
    requestedAt;
    respondedAt;
    respondedById;
    rejectionReason;
    notes;
    createdAt;
    updatedAt;
    constructor(data) {
        this.id = data.id;
        this.requestId = data.requestId;
        this.displayId = data.displayId;
        this.displayName = data.displayName;
        this.displayLocation = data.displayLocation;
        this.firmwareVersion = data.firmwareVersion;
        this.status = data.status;
        this.requestedAt = data.requestedAt;
        this.respondedAt = data.respondedAt ?? undefined;
        this.respondedById = data.respondedById ?? undefined;
        this.rejectionReason = data.rejectionReason ?? undefined;
        this.notes = data.notes ?? undefined;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
    /**
     * Check if request is pending approval
     */
    isPending() {
        return this.status === ConnectionRequestStatus.PENDING;
    }
    /**
     * Check if request has been approved
     */
    isApproved() {
        return this.status === ConnectionRequestStatus.APPROVED;
    }
    /**
     * Check if request has been rejected
     */
    isRejected() {
        return this.status === ConnectionRequestStatus.REJECTED;
    }
    /**
     * Check if request has been responded to
     */
    isResponded() {
        return !!this.respondedAt;
    }
    /**
     * Approve connection request
     */
    approve(adminId) {
        if (!this.isPending()) {
            throw new Error("Can only approve pending requests");
        }
        this.status = ConnectionRequestStatus.APPROVED;
        this.respondedAt = new Date();
        this.respondedById = adminId;
        this.updatedAt = new Date();
    }
    /**
     * Reject connection request
     */
    reject(adminId, reason) {
        if (!this.isPending()) {
            throw new Error("Can only reject pending requests");
        }
        this.status = ConnectionRequestStatus.REJECTED;
        this.respondedAt = new Date();
        this.respondedById = adminId;
        this.rejectionReason = reason ?? undefined;
        this.updatedAt = new Date();
    }
    /**
     * Add notes to request
     */
    addNotes(notes) {
        this.notes = notes;
        this.updatedAt = new Date();
    }
    /**
     * Get time since request was created
     * Returns duration in milliseconds
     */
    getAgeInMilliseconds() {
        const now = new Date();
        return now.getTime() - this.requestedAt.getTime();
    }
    /**
     * Get time since request was created in hours
     */
    getAgeInHours() {
        return this.getAgeInMilliseconds() / (1000 * 60 * 60);
    }
    /**
     * Get time since request was created in days
     */
    getAgeInDays() {
        return this.getAgeInHours() / 24;
    }
    /**
     * Get response time (time between request and response)
     * Returns null if not yet responded
     */
    getResponseTimeInMilliseconds() {
        if (!this.respondedAt) {
            return null;
        }
        return this.respondedAt.getTime() - this.requestedAt.getTime();
    }
    /**
     * Create a new connection request
     * Factory method for creating pending requests
     */
    static create(params) {
        const now = new Date();
        return new DisplayConnectionRequest({
            id: crypto.randomUUID(),
            requestId: `REQ-${crypto.randomUUID()}`,
            displayId: params.displayId,
            displayName: params.displayName,
            displayLocation: params.displayLocation,
            firmwareVersion: params.firmwareVersion,
            status: ConnectionRequestStatus.PENDING,
            requestedAt: now,
            respondedAt: undefined,
            respondedById: undefined,
            rejectionReason: undefined,
            notes: params.notes ?? undefined,
            createdAt: now,
            updatedAt: now,
        });
    }
}
