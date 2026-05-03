/**
 * Display List Request/Response DTOs
 */

import { DisplayStatus } from "@admiro/domain";
import { PaginationQuery, PaginatedResponse } from "../common/pagination";
import { Timestamps } from "../common/timestamps";
import { DisplayResolution, DisplayConfiguration } from "./create";

export interface DisplayFilterQuery extends PaginationQuery {
  status: DisplayStatus | undefined;
  location: string | undefined;
}

export interface DisplayListItem extends Timestamps {
  id: string;
  displayId: string;
  displayName: string;
  location: string;
  status: DisplayStatus;
  resolution: DisplayResolution;
  firmwareVersion: string;
  isConnected: boolean;
  lastSeen: Date | undefined;
}

export type DisplayListResponse = PaginatedResponse<DisplayListItem>;
