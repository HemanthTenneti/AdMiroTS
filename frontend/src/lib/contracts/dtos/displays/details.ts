/**
 * Display Details Request/Response DTOs
 */

import { DisplayStatus } from "@admiro/domain";
import { Timestamps } from "../common/timestamps";
import { DisplayResolution, DisplayConfiguration } from "./create";

export interface GetDisplayResponse extends Timestamps {
  id: string;
  displayId: string;
  displayName: string;
  location: string;
  status: DisplayStatus;
  resolution: DisplayResolution;
  firmwareVersion: string;
  configuration: DisplayConfiguration;
  isConnected: boolean;
  lastSeen: Date | undefined;
  currentLoopId: string | undefined;
}
