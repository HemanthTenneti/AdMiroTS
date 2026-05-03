/**
 * Display Status and Ping Request/Response DTOs
 */

import { DisplayStatus } from "@admiro/domain";
import { Timestamps } from "../common/timestamps";

export interface PingRequest {
  displayId: string;
  firmwareVersion: string;
  connectionStrength: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface PingResponse {
  received: boolean;
  timestamp: Date;
}

export interface DisplayStatusResponse extends Timestamps {
  displayId: string;
  status: DisplayStatus;
  isConnected: boolean;
  lastPing: Date | undefined;
  uptime: number; // in seconds
}
