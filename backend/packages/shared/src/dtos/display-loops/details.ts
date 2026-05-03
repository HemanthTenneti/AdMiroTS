/**
 * Display Loop Details Request/Response DTOs
 */

import { RotationType, DisplayLayout } from "@admiro/domain";
import { Timestamps } from "../common/timestamps";
import { LoopAdvertisement } from "./create";

export interface GetLoopResponse extends Timestamps {
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
