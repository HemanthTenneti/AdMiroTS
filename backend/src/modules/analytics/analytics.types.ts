/**
 * Analytics module type definitions
 * Defines response shapes and DTOs for analytics endpoints
 */
import { Analytics } from "@admiro/domain";

export type AnalyticsResponse = Analytics;

/**
 * Paginated response wrapper for analytics list endpoints
 */
export interface AnalyticsListResponse {
  data: AnalyticsResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Input for creating/recording an analytics event
 */
export interface RecordAnalyticsInput {
  displayId: string;
  adId: string;
  loopId: string;
  impressions?: number;
  viewDuration?: number;
  completedViews?: number;
  partialViews?: number;
  metrics?: {
    clicks?: number;
    interactions?: number;
    dwellTime?: number;
  };
  metadata?: {
    deviceType?: string;
    location?: string;
    weatherCondition?: string;
    crowdDensity?: string;
  };
}

/**
 * Aggregated analytics response
 */
export interface AggregatedAnalyticsResponse {
  totalImpressions: number;
  totalViews: number;
  completedViews: number;
  partialViews: number;
  totalClicks: number;
  averageCTR: number;
  averageViewDuration: number;
  totalViewDuration: number;
}
