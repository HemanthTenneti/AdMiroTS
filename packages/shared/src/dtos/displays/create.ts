/**
 * Create Display Request/Response DTOs
 */

import { DisplayStatus, DisplayLayout } from "@admiro/domain";
import { Timestamps } from "../common/timestamps";

export interface DisplayResolution {
  width: number;
  height: number;
}

export interface DisplayConfiguration {
  brightness: number;
  volume: number;
  refreshRate: number;
  orientation: string;
}

export interface CreateDisplayRequest {
  displayName: string;
  location: string;
  resolution: DisplayResolution;
  firmwareVersion: string;
  configuration: DisplayConfiguration;
  password: string | undefined;
}

export interface CreateDisplayResponse extends Timestamps {
  id: string;
  displayId: string;
  displayName: string;
  location: string;
  status: DisplayStatus;
  resolution: DisplayResolution;
  firmwareVersion: string;
  configuration: DisplayConfiguration;
  connectionToken: string;
  isConnected: boolean;
}
