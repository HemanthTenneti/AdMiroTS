/**
 * Analytics Overview Response DTOs
 */

import { Timestamps } from "../common/timestamps";

export interface OverviewStatsResponse extends Timestamps {
  totalImpressions: number;
  totalClicks: number;
  totalEngagements: number;
  ctr: number; // Click-through rate
  averageEngagementTime: number;
  topAds: Array<{
    adId: string;
    impressions: number;
    clicks: number;
  }>;
  topDisplays: Array<{
    displayId: string;
    impressions: number;
    engagements: number;
  }>;
}
