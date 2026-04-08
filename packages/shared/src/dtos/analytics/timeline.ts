/**
 * Timeline Analytics Response DTOs
 */

import { Timestamps } from "../common/timestamps";

export interface TimelineDataPoint {
  timestamp: Date;
  impressions: number;
  clicks: number;
  engagements: number;
}

export interface TimelineAnalyticsResponse extends Timestamps {
  entityId: string;
  entityType: "advertisement" | "display" | "loop";
  timeRange: {
    startDate: Date;
    endDate: Date;
  };
  data: TimelineDataPoint[];
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalEngagements: number;
  };
}
