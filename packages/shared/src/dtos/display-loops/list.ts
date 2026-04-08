/**
 * Display Loop List Request/Response DTOs
 */

import { RotationType, DisplayLayout } from "@admiro/domain";
import { PaginationQuery, PaginatedResponse } from "../common/pagination";
import { Timestamps } from "../common/timestamps";
import { LoopAdvertisement } from "./create";

export interface LoopFilterQuery extends PaginationQuery {
  displayId: string | undefined;
  isActive: boolean | undefined;
}

export interface LoopListItem extends Timestamps {
  id: string;
  loopId: string;
  loopName: string;
  displayId: string;
  advertisementCount: number;
  rotationType: RotationType;
  displayLayout: DisplayLayout;
  totalDuration: number;
  isActive: boolean;
}

export type LoopListResponse = PaginatedResponse<LoopListItem>;
