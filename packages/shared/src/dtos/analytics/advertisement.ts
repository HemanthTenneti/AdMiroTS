/**
 * Advertisement Analytics Response DTOs
 */

import { PaginationQuery } from "../common/pagination";
import { Timestamps } from "../common/timestamps";

export interface AdAnalyticsFilterQuery extends PaginationQuery {
  advertiserId: string | undefined;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export interface AdAnalyticsResponse extends Timestamps {
  adId: string;
  advertiserId: string;
  impressions: number;
  clicks: number;
  ctr: number;
  completedViews: number;
  partialViews: number;
  totalViewDuration: number;
  averageViewDuration: number;
  topDisplays: Array<{
    displayId: string;
    impressions: number;
    clicks: number;
  }>;
}
