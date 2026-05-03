import { EngagementMetrics } from "../value-objects/EngagementMetrics";

/**
 * Analytics entity interface
 * Tracks engagement and performance metrics for ads and displays
 */
export interface IAnalytics {
  id: string;
  displayId: string; // FK to Display
  adId: string; // FK to Advertisement
  loopId: string; // FK to DisplayLoop
  impressions: number;
  engagementMetrics: EngagementMetrics;
  viewDuration: number; // In seconds
  completedViews: number;
  partialViews: number;
  timestamp: Date;
  date: Date; // For grouping/aggregation
  metadata?:
    | {
        deviceType?: string | undefined;
        location?: string | undefined;
        weatherCondition?: string | undefined;
        crowdDensity?: string | undefined;
      }
    | undefined;
  createdAt: Date;
  updatedAt: Date;
}
