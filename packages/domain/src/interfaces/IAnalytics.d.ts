import { EngagementMetrics } from "../value-objects/EngagementMetrics";
/**
 * Analytics entity interface
 * Tracks engagement and performance metrics for ads and displays
 */
export interface IAnalytics {
    id: string;
    displayId: string;
    adId: string;
    loopId: string;
    impressions: number;
    engagementMetrics: EngagementMetrics;
    viewDuration: number;
    completedViews: number;
    partialViews: number;
    timestamp: Date;
    date: Date;
    metadata?: {
        deviceType?: string | undefined;
        location?: string | undefined;
        weatherCondition?: string | undefined;
        crowdDensity?: string | undefined;
    } | undefined;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=IAnalytics.d.ts.map