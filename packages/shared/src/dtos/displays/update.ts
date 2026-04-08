/**
 * Update Display Request/Response DTOs
 */

import { DisplayStatus, DisplayLayout } from "@admiro/domain";
import { Timestamps } from "../common/timestamps";
import { DisplayResolution, DisplayConfiguration } from "./create";

export interface UpdateDisplayRequest {
  displayName: string | undefined;
  location: string | undefined;
  configuration: Partial<DisplayConfiguration> | undefined;
  status: DisplayStatus | undefined;
}

export interface UpdateDisplayResponse extends Timestamps {
  id: string;
  displayId: string;
  displayName: string;
  location: string;
  status: DisplayStatus;
  resolution: DisplayResolution;
  firmwareVersion: string;
  configuration: DisplayConfiguration;
  isConnected: boolean;
}
