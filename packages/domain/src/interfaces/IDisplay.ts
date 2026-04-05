import { DisplayStatus } from "../enums";
import { Resolution } from "../value-objects/Resolution";
import { DisplayConfiguration } from "../value-objects/DisplayConfiguration";

/**
 * Display entity interface
 * Represents a physical or browser-based display device
 */
export interface IDisplay {
  id: string;
  displayId: string; // Unique identifier (3+ chars)
  displayName: string;
  location: string;
  status: DisplayStatus;
  assignedAdminId?: string | undefined; // FK to User
  resolution: Resolution;
  lastSeen?: Date | undefined;
  firmwareVersion: string;
  configuration: DisplayConfiguration;
  connectionToken: string; // UUID for secure communication
  password?: string | undefined; // Hashed, optional
  isConnected: boolean;
  currentLoopId?: string | undefined; // FK to DisplayLoop
  needsRefresh: boolean;
  lastRefreshCheck?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}
