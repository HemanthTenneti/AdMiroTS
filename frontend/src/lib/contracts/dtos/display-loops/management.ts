/**
 * Display Loop Management Request/Response DTOs
 */

import { Timestamps } from "../common/timestamps";

export interface AssignDisplayRequest {
  displayId: string;
}

export interface UnassignDisplayRequest {
  displayId: string;
}

export interface ReorderAdsRequest {
  advertisements: Array<{
    advertisementId: string;
    order: number;
    duration: number;
  }>;
}

export interface ReorderAdsResponse extends Timestamps {
  loopId: string;
  advertisementCount: number;
  totalDuration: number;
  success: boolean;
}
