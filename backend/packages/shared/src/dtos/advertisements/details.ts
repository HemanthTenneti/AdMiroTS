/**
 * Advertisement Details Request/Response DTOs
 */

import { MediaType, AdStatus } from "@admiro/domain";
import { Timestamps } from "../common/timestamps";

export interface GetAdResponse extends Timestamps {
  id: string;
  adId: string;
  advertiserId: string;
  adName: string;
  mediaUrl: string;
  mediaType: MediaType;
  thumbnailUrl: string | undefined;
  duration: number;
  description: string | undefined;
  status: AdStatus;
  targetAudience: string | undefined;
  views: number;
  clicks: number;
}

export interface AdStatsResponse extends Timestamps {
  adId: string;
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate
  completionRate: number;
  avgEngagementTime: number;
}
