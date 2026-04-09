import { IAnalytics } from "../interfaces";
import { EngagementMetrics } from "../value-objects/EngagementMetrics";
/**
 * Analytics entity class
 * Encapsulates engagement and performance metrics business logic
 */
export declare class Analytics implements IAnalytics {
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
    constructor(data: IAnalytics);
    /**
     * Increment impression counter
     */
    incrementImpressions(count?: number): void;
    /**
     * Increment completed views
     * Called when ad plays to completion
     */
    incrementCompletedViews(count?: number): void;
    /**
     * Increment partial views
     * Called when ad doesn't play to completion
     */
    incrementPartialViews(count?: number): void;
    /**
     * Add view duration
     */
    addViewDuration(seconds: number): void;
    /**
     * Calculate completion rate
     * Percentage of views that were completed
     */
    getCompletionRate(): number;
    /**
     * Calculate average view duration
     */
    getAverageViewDuration(): number;
    /**
     * Get total views (completed + partial)
     */
    getTotalViews(): number;
    /**
     * Get click-through rate from engagement metrics
     * Percentage of impressions that resulted in clicks
     */
    getClickThroughRate(): number;
    /**
     * Get engagement rate
     * Percentage of impressions that had any interaction
     */
    getEngagementRate(): number;
    /**
     * Update engagement metrics
     */
    updateEngagementMetrics(metrics: {
        clicks?: number;
        interactions?: number;
        dwellTime?: number;
    }): void;
    /**
     * Check if analytics has metadata
     */
    hasMetadata(): boolean;
    /**
     * Get device type from metadata
     */
    getDeviceType(): string | null;
    /**
     * Get location from metadata
     */
    getLocation(): string | null;
    /**
     * Create analytics entry
     * Factory method for creating new analytics records
     */
    static create(params: {
        displayId: string;
        adId: string;
        loopId: string;
        impressions?: number;
        engagementMetrics?: EngagementMetrics;
        viewDuration?: number;
        completedViews?: number;
        partialViews?: number;
        metadata?: {
            deviceType?: string;
            location?: string;
            weatherCondition?: string;
            crowdDensity?: string;
        };
    }): Analytics;
    /**
     * Aggregate multiple analytics entries
     * Combines metrics from multiple entries into a single summary
     */
    static aggregate(entries: Analytics[]): Analytics | null;
}
//# sourceMappingURL=Analytics.d.ts.map