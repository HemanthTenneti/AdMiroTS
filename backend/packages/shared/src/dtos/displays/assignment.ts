/**
 * Display Loop Assignment Request/Response DTOs
 */

import { Timestamps } from "../common/timestamps";

export interface AssignLoopsRequest {
  loopId: string;
}

export interface UnassignLoopsRequest {
  loopId: string;
}

export interface AssignLoopsResponse extends Timestamps {
  displayId: string;
  loopId: string;
  assignedAt: Date;
  success: boolean;
}

export interface UnassignLoopsResponse extends Timestamps {
  displayId: string;
  loopId: string;
  unassignedAt: Date;
  success: boolean;
}
