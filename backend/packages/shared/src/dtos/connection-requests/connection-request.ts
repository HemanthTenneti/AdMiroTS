/**
 * Connection Request DTOs
 */

import { ConnectionRequestStatus } from "@admiro/domain";
import { Timestamps } from "../common/timestamps";

export interface CreateConnectionRequest {
  displayId: string;
  displayName: string;
  displayLocation: string;
  firmwareVersion: string;
}

export interface ConnectionRequestResponse extends Timestamps {
  id: string;
  requestId: string;
  displayId: string;
  displayName: string;
  displayLocation: string;
  firmwareVersion: string;
  status: ConnectionRequestStatus;
  requestedAt: Date;
  respondedAt: Date | undefined;
  respondedById: string | undefined;
  rejectionReason: string | undefined;
  notes: string | undefined;
}

export interface ApproveConnectionRequest {
  notes: string | undefined;
}

export interface ApproveConnectionResponse extends Timestamps {
  requestId: string;
  status: ConnectionRequestStatus;
  displayId: string;
  connectionToken: string;
  approvedAt: Date;
}

export interface RejectConnectionRequest {
  rejectionReason: string;
  notes: string | undefined;
}

export interface RejectConnectionResponse extends Timestamps {
  requestId: string;
  status: ConnectionRequestStatus;
  rejectionReason: string;
  rejectedAt: Date;
}
