/**
 * Engagement Metrics Response DTOs
 */

import { Timestamps } from "../common/timestamps";

export interface EngagementMetricsResponse extends Timestamps {
  entityId: string;
  entityType: "advertisement" | "display" | "loop";
  clicks: number;
  interactions: number;
  dwellTime: number;
  dwellTimePercentage: number; // percentage of max dwell time
  interactionRate: number; // interactions per impression
}
