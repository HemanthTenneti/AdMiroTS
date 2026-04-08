/**
 * Engagement metrics value object
 * Tracks user interaction with advertisements
 * Immutable once created
 */
export class EngagementMetrics {
    clicks;
    interactions;
    dwellTime;
    constructor(clicks = 0, interactions = 0, dwellTime = 0) {
        this.clicks = clicks;
        this.interactions = interactions;
        this.dwellTime = dwellTime;
        if (clicks < 0 || interactions < 0 || dwellTime < 0) {
            throw new Error("Engagement metrics cannot be negative");
        }
    }
    /**
     * Calculate engagement rate (interactions per click)
     */
    get engagementRate() {
        return this.clicks === 0 ? 0 : this.interactions / this.clicks;
    }
    /**
     * Calculate average dwell time per interaction
     */
    get averageDwellTime() {
        return this.interactions === 0 ? 0 : this.dwellTime / this.interactions;
    }
    /**
     * Add metrics to create updated copy
     */
    add(metrics) {
        return new EngagementMetrics(this.clicks + (metrics.clicks ?? 0), this.interactions + (metrics.interactions ?? 0), this.dwellTime + (metrics.dwellTime ?? 0));
    }
    /**
     * Create empty metrics
     */
    static createEmpty() {
        return new EngagementMetrics(0, 0, 0);
    }
}
