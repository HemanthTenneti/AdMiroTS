/**
 * Display Configuration Request/Response DTOs
 */

import { Timestamps } from "../common/timestamps";
import { DisplayConfiguration } from "./create";

export interface UpdateDisplayConfigRequest {
  brightness: number | undefined;
  volume: number | undefined;
  refreshRate: number | undefined;
  orientation: string | undefined;
}

export interface DisplayConfigResponse extends Timestamps {
  displayId: string;
  configuration: DisplayConfiguration;
}
