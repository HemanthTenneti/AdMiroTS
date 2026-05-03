/**
 * Update Display Loop Request/Response DTOs
 */

import { RotationType, DisplayLayout } from "@admiro/domain";
import { Timestamps } from "../common/timestamps";
import { LoopAdvertisement } from "./create";

export interface UpdateLoopRequest {
  loopName: string | undefined;
  advertisements: LoopAdvertisement[] | undefined;
  rotationType: RotationType | undefined;
  displayLayout: DisplayLayout | undefined;
  description: string | undefined;
  isActive: boolean | undefined;
}

export interface UpdateLoopResponse extends Timestamps {
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
