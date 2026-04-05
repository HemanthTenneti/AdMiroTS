import { ConnectionRequestStatus } from "../enums";

/**
 * Display connection request interface
 * Represents a pending approval request for a new display device
 */
export interface IDisplayConnectionRequest {
  id: string;
  requestId: string; // Auto-generated unique ID
  displayId: string; // FK to Display
  displayName: string;
  displayLocation: string;
  firmwareVersion: string;
  status: ConnectionRequestStatus;
  requestedAt: Date;
  respondedAt?: Date | undefined;
  respondedById?: string | undefined; // FK to User (admin)
  rejectionReason?: string | undefined;
  notes?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}
