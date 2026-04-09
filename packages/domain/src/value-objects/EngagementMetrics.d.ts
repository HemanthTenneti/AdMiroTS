/**
 * Engagement metrics value object
 * Tracks user interaction with advertisements
 * Immutable once created
 */
export declare class EngagementMetrics {
    readonly clicks: number;
    readonly interactions: number;
    readonly dwellTime: number;
    constructor(clicks?: number, interactions?: number, dwellTime?: number);
    /**
     * Calculate engagement rate (interactions per click)
     */
    get engagementRate(): number;
    /**
     * Calculate average dwell time per interaction
     */
    get averageDwellTime(): number;
    /**
     * Add metrics to create updated copy
     */
    add(metrics: Partial<{
        clicks: number;
        interactions: number;
        dwellTime: number;
    }>): EngagementMetrics;
    /**
     * Create empty metrics
     */
    static createEmpty(): EngagementMetrics;
}
//# sourceMappingURL=EngagementMetrics.d.ts.map