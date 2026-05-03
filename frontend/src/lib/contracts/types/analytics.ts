/**
 * Analytics and reporting DTOs
 * Handles metrics, engagement data, performance reports, and business intelligence
 */

import { MediaType, AdStatus } from "@admiro/domain";
import { DateRangeQuery, PaginatedResponse } from "./common";

/**
 * Engagement metrics breakdown
 * Detailed interaction statistics for ads and displays
 */
export interface EngagementMetricsDTO {
  clicks: number;
  shares: number;
  likes: number;
  comments: number;
  saves: number;
}

/**
 * Time series data point
 * Used for trend charts and graphs
 */
export interface TimeSeriesDataPoint {
  timestamp: Date; // ISO 8601 string in JSON
  value: number;
  label?: string | undefined; // Human-readable label
}

/**
 * Analytics query parameters
 * Common filters for analytics endpoints
 */
export interface AnalyticsQuery extends DateRangeQuery {
  displayId?: string | undefined; // Filter by specific display
  adId?: string | undefined; // Filter by specific ad
  loopId?: string | undefined; // Filter by specific loop
  advertiserId?: string | undefined; // Filter by advertiser
  groupBy?: "hour" | "day" | "week" | "month" | undefined; // Aggregation level
}

/**
 * Overview metrics response
 * High-level KPIs for dashboard
 */
export interface OverviewMetricsResponse {
  totalViews: number;
  totalClicks: number;
  totalImpressions: number;
  averageCTR: number; // Click-through rate as percentage
  activeDisplays: number;
  activeAdvertisements: number;
  activeLoops: number;
  totalRevenue?: number | undefined; // If applicable
  viewsChange: number; // Percentage change from previous period
  clicksChange: number;
  ctrChange: number;
}

/**
 * Advertisement performance response
 * Detailed metrics for a specific advertisement
 */
export interface AdvertisementPerformanceResponse {
  adId: string;
  adName: string;
  advertiserName: string;
  mediaType: MediaType;
  status: AdStatus;
  totalViews: number;
  totalClicks: number;
  ctr: number; // Click-through rate
  averageViewDuration: number; // In seconds
  completionRate: number; // Percentage of views that completed
  engagement: EngagementMetricsDTO;
  displayCount: number; // Number of displays showing this ad
  topDisplays: Array<{
    displayId: string;
    displayName: string;
    location: string;
    views: number;
    clicks: number;
  }>;
  viewsByHour: TimeSeriesDataPoint[]; // 24-hour breakdown
  viewsByDay: TimeSeriesDataPoint[]; // Daily trend
}

/**
 * Display performance response
 * Detailed metrics for a specific display
 */
export interface DisplayPerformanceResponse {
  displayId: string;
  displayName: string;
  location: string;
  totalViews: number;
  totalClicks: number;
  averageCTR: number;
  uptime: number; // Percentage
  uniqueAdsShown: number;
  currentLoopId?: string | undefined;
  topAds: Array<{
    adId: string;
    adName: string;
    views: number;
    clicks: number;
    ctr: number;
  }>;
  viewsByHour: TimeSeriesDataPoint[];
  viewsByDay: TimeSeriesDataPoint[];
  impressionsByMediaType: Record<MediaType, number>;
}

/**
 * Loop performance response
 * Detailed metrics for a specific display loop
 */
export interface LoopPerformanceResponse {
  loopId: string;
  loopName: string;
  displayId: string;
  displayName: string;
  totalRotations: number;
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  adCount: number;
  adPerformance: Array<{
    adId: string;
    adName: string;
    views: number;
    clicks: number;
    ctr: number;
    avgViewDuration: number;
    completionRate: number;
  }>;
  rotationsByDay: TimeSeriesDataPoint[];
}

/**
 * Advertiser performance response
 * Aggregate metrics for an advertiser's ads
 */
export interface AdvertiserPerformanceResponse {
  advertiserId: string;
  advertiserName: string;
  totalAds: number;
  activeAds: number;
  totalViews: number;
  totalClicks: number;
  averageCTR: number;
  totalRevenue?: number | undefined;
  topPerformingAds: Array<{
    adId: string;
    adName: string;
    views: number;
    clicks: number;
    ctr: number;
  }>;
  viewsByMediaType: Record<MediaType, number>;
  statusDistribution: Record<AdStatus, number>;
  performanceTrend: TimeSeriesDataPoint[];
}

/**
 * Geographic performance response
 * Metrics broken down by location
 */
export interface GeographicPerformanceResponse {
  locationMetrics: Array<{
    location: string;
    displayCount: number;
    totalViews: number;
    totalClicks: number;
    averageCTR: number;
    topAd?: {
      adId: string;
      adName: string;
      views: number;
    } | undefined;
  }>;
  totalLocations: number;
}

/**
 * Engagement report response
 * Detailed engagement analytics across all entities
 */
export interface EngagementReportResponse {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  totalEngagements: number;
  engagementRate: number; // Percentage
  engagementBreakdown: EngagementMetricsDTO;
  topEngagingAds: Array<{
    adId: string;
    adName: string;
    engagementScore: number;
    metrics: EngagementMetricsDTO;
  }>;
  engagementByDay: Array<{
    date: Date;
    engagements: number;
    breakdown: EngagementMetricsDTO;
  }>;
  engagementByHour: Array<{
    hour: number; // 0-23
    engagements: number;
  }>;
}

/**
 * Real-time analytics response
 * Live metrics for active displays and ads
 */
export interface RealTimeAnalyticsResponse {
  timestamp: Date;
  activeDisplays: number;
  currentlyPlayingAds: Array<{
    adId: string;
    adName: string;
    displayCount: number;
    displays: Array<{
      displayId: string;
      displayName: string;
      location: string;
      playbackPosition: number; // Seconds
    }>;
  }>;
  recentViews: Array<{
    adId: string;
    adName: string;
    displayId: string;
    displayName: string;
    timestamp: Date;
  }>;
  recentClicks: Array<{
    adId: string;
    adName: string;
    displayId: string;
    displayName: string;
    timestamp: Date;
  }>;
}

/**
 * Comparison report request
 * Compares performance between two entities or time periods
 */
export interface ComparisonReportRequest {
  type: "ad" | "display" | "loop" | "advertiser" | "period";
  entity1Id?: string | undefined; // For entity comparison
  entity2Id?: string | undefined;
  period1?: DateRangeQuery | undefined; // For time period comparison
  period2?: DateRangeQuery | undefined;
}

/**
 * Comparison report response
 * Side-by-side performance comparison
 */
export interface ComparisonReportResponse {
  entity1: {
    id: string;
    name: string;
    views: number;
    clicks: number;
    ctr: number;
    engagement: EngagementMetricsDTO;
  };
  entity2: {
    id: string;
    name: string;
    views: number;
    clicks: number;
    ctr: number;
    engagement: EngagementMetricsDTO;
  };
  differences: {
    viewsDiff: number; // Percentage
    clicksDiff: number;
    ctrDiff: number;
  };
  winner: "entity1" | "entity2" | "tie";
}

/**
 * Export analytics request
 * Generates downloadable analytics report
 */
export interface ExportAnalyticsRequest extends AnalyticsQuery {
  format: "csv" | "pdf" | "xlsx";
  includeCharts?: boolean | undefined; // For PDF format
  metrics: Array<
    | "views"
    | "clicks"
    | "ctr"
    | "engagement"
    | "duration"
    | "completion"
  >;
}

/**
 * Export analytics response
 * Returns download URL for generated report
 */
export interface ExportAnalyticsResponse {
  downloadUrl: string;
  expiresAt: Date; // URL expiration timestamp
  format: string;
  fileSize: number; // In bytes
}

/**
 * Analytics summary response
 * Condensed metrics for quick overview
 */
export interface AnalyticsSummaryResponse {
  period: {
    startDate: Date;
    endDate: Date;
  };
  metrics: {
    views: number;
    clicks: number;
    impressions: number;
    ctr: number;
    engagement: number;
  };
  trends: {
    viewsChange: number; // Percentage
    clicksChange: number;
    ctrChange: number;
  };
  topPerformers: {
    ads: Array<{ id: string; name: string; score: number }>;
    displays: Array<{ id: string; name: string; score: number }>;
    advertisers: Array<{ id: string; name: string; score: number }>;
  };
}
