import { IDisplayConnectionRequest } from "../interfaces";
import { ConnectionRequestStatus } from "../enums";

/**
 * Display connection request entity class
 * Encapsulates display approval workflow business logic
 */
export class DisplayConnectionRequest implements IDisplayConnectionRequest {
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

  constructor(data: IDisplayConnectionRequest) {
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
  isPending(): boolean {
    return this.status === ConnectionRequestStatus.PENDING;
  }

  /**
   * Check if request has been approved
   */
  isApproved(): boolean {
    return this.status === ConnectionRequestStatus.APPROVED;
  }

  /**
   * Check if request has been rejected
   */
  isRejected(): boolean {
    return this.status === ConnectionRequestStatus.REJECTED;
  }

  /**
   * Check if request has been responded to
   */
  isResponded(): boolean {
    return !!this.respondedAt;
  }

  /**
   * Approve connection request
   */
  approve(adminId: string): void {
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
  reject(adminId: string, reason?: string): void {
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
  addNotes(notes: string): void {
    this.notes = notes;
    this.updatedAt = new Date();
  }

  /**
   * Get time since request was created
   * Returns duration in milliseconds
   */
  getAgeInMilliseconds(): number {
    const now = new Date();
    return now.getTime() - this.requestedAt.getTime();
  }

  /**
   * Get time since request was created in hours
   */
  getAgeInHours(): number {
    return this.getAgeInMilliseconds() / (1000 * 60 * 60);
  }

  /**
   * Get time since request was created in days
   */
  getAgeInDays(): number {
    return this.getAgeInHours() / 24;
  }

  /**
   * Get response time (time between request and response)
   * Returns null if not yet responded
   */
  getResponseTimeInMilliseconds(): number | null {
    if (!this.respondedAt) {
      return null;
    }

    return this.respondedAt.getTime() - this.requestedAt.getTime();
  }

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
  }): DisplayConnectionRequest {
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
