/**
 * Display Analytics Response DTOs
 */

import { DisplayStatus } from "@admiro/domain";
import { Timestamps } from "../common/timestamps";

export interface DisplayAnalyticsResponse extends Timestamps {
  displayId: string;
  displayName: string;
  location: string;
  status: DisplayStatus;
  totalImpressions: number;
  totalEngagements: number;
  averageEngagementTime: number;
  topAds: Array<{
    adId: string;
    impressions: number;
    engagements: number;
  }>;
  uptime: number; // percentage
  lastOnline: Date | undefined;
}
