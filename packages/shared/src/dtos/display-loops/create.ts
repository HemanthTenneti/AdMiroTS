/**
 * Create Display Loop Request/Response DTOs
 */

import { RotationType, DisplayLayout } from "@admiro/domain";
import { Timestamps } from "../common/timestamps";

export interface LoopAdvertisement {
  advertisementId: string;
  order: number;
  duration: number;
  weight: number;
}

export interface CreateLoopRequest {
  loopName: string;
  displayId: string;
  advertisements: LoopAdvertisement[];
  rotationType: RotationType;
  displayLayout: DisplayLayout;
  description: string | undefined;
}

export interface CreateLoopResponse extends Timestamps {
  id: string;
  loopId: string;
  loopName: string;
  displayId: string;
  advertisements: LoopAdvertisement[];
  rotationType: RotationType;
  displayLayout: DisplayLayout;
  totalDuration: number;
  isActive: boolean;
  description: string | undefined;
}
